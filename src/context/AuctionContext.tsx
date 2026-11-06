/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  IPLTeam,
  Player,
  AuctionRoom,
  BidRecord,
  AuctionActivity,
  TradeOffer,
  WorkflowStep,
  RoomStatus,
  ViewTab,
} from '../types/auction';
import {
  INITIAL_TEAMS,
  INITIAL_PLAYERS,
  calculateNextBid,
  RETENTION_TIERS,
} from '../data/iplData';
import { soundEffects } from '../utils/soundEffects';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, syncUserProfileInFirestore, syncRoomToFirestore } from '../lib/firebase';

/**
 * Helper to validate whether all 10 IPL franchises have submitted & confirmed their retentions.
 * Requirement: State CANNOT transition to 'LIVE_AUCTION' unless all 10 participants
 * have submitted their retention decisions.
 */
export const areAllTenRetentionsConfirmed = (room: AuctionRoom | null): boolean => {
  if (!room || !room.retentions) return false;
  return INITIAL_TEAMS.every((t) => Boolean(room.retentions[t.id]?.isConfirmed));
};

export const getPendingRetentionFranchises = (room: AuctionRoom | null): IPLTeam[] => {
  if (!room) return INITIAL_TEAMS;
  const retentions = room.retentions || {};
  return INITIAL_TEAMS.filter((t) => !retentions[t.id]?.isConfirmed);
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  selectedTeamId: string | null;
  role: 'Owner' | 'Auctioneer' | 'Spectator';
  isAuthenticated?: boolean;
}

interface AuctionContextType {
  // Theme & Navigation
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  soundMuted: boolean;
  toggleSound: () => void;
  workflowStep: WorkflowStep;
  setWorkflowStep: (step: WorkflowStep) => void;
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  isGmailModalOpen: boolean;
  setIsGmailModalOpen: (open: boolean) => void;

  // User & Auth
  user: UserProfile;
  setUserTeam: (teamId: string) => void;
  updateUserName: (name: string) => void;
  signInGoogle: () => Promise<void>;
  signOutAccount: () => Promise<void>;
  loginUserSession: (authedUser: UserProfile) => void;

  // Data
  teams: IPLTeam[];
  players: Player[];
  auctionPool: Player[];
  activities: AuctionActivity[];
  tradeOffers: TradeOffer[];

  // Inspected Player Modal
  inspectedPlayer: Player | null;
  setInspectedPlayer: (player: Player | null) => void;

  // Live Auction & Room State
  activeRoom: AuctionRoom | null;
  currentPlayer: Player | null;
  timerSecondsLeft: number;
  isTimerRunning: boolean;
  lastBidderTeam: IPLTeam | null;
  isHammerStriking: boolean;
  soldPlayerCelebration: { player: Player; team: IPLTeam; price: number } | null;
  clearCelebration: () => void;

  // Room Actions
  createRoom: (name: string, timerSeconds: number, format?: 'Mega Auction' | 'Mini Auction') => string;
  joinRoom: (code: string) => boolean;
  leaveRoom: () => void;
  claimFranchiseInRoom: (teamId: string) => void;
  autoFillRemainingWithBots: () => void;
  startRetentionPhase: () => void;
  confirmTeamRetention: (teamId: string) => void;
  autoConfirmBotRetentions: () => void;
  finalizeAllRetentions: () => { success: boolean; error?: string } | void;
  startLiveMegaAuction: () => { success: boolean; error?: string } | void;
  pauseAuction: () => void;
  resumeAuction: () => void;
  finishAuction: () => void;
  areAllTenRetentionsConfirmed: () => boolean;
  getPendingRetentionFranchises: () => IPLTeam[];
  confirmedRetentionsCount: number;

  // Bidding Actions
  placeBid: (teamId: string, customAmount?: number, incrementDelta?: number) => { success: boolean; reason?: string };
  sellCurrentPlayer: () => void;
  markCurrentPlayerUnsold: () => void;
  skipToNextPlayer: () => void;
  goToPlayerIndex: (index: number) => void;
  toggleAutoBotBidding: () => void;

  // Retention & Release
  retainPlayer: (teamId: string, playerId: string) => { success: boolean; message: string };
  retainMultiplePlayers: (teamId: string, playerIds: string[]) => { success: boolean; message: string };
  releasePlayer: (teamId: string, playerId: string) => { success: boolean; message: string };

  // Trade Centre
  proposeTrade: (
    fromTeamId: string,
    toTeamId: string,
    offeredPlayerIds: string[],
    requestedPlayerIds: string[],
    cashAdjustment: number
  ) => { success: boolean; message: string };
  respondToTrade: (tradeId: string, accept: boolean) => { success: boolean; message: string };

  // Reset
  resetAuctionData: () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'ipl_auction_arena_2027_';

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<ViewTab>('auction');
  const [isGmailModalOpen, setIsGmailModalOpen] = useState<boolean>(false);

  // Authenticated User State
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: 'Franchise Director',
      email: 'director@ipl2027.com',
      selectedTeamId: null, // Initially null as required by Section 5!
      role: 'Owner',
      isAuthenticated: false, // Initial login required!
    };
  });

  // Teams & Players state
  const [activeRoom, setActiveRoom] = useState<AuctionRoom | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'room');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [teams, setTeams] = useState<IPLTeam[]>(() => {
    if (activeRoom && activeRoom.roomTeams && activeRoom.roomTeams.length === 10) {
      return activeRoom.roomTeams;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'teams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 10) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_TEAMS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    if (activeRoom && activeRoom.roomPlayers && activeRoom.roomPlayers.length === INITIAL_PLAYERS.length) {
      return activeRoom.roomPlayers;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'players');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === INITIAL_PLAYERS.length && parsed[0]?.teamId) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PLAYERS;
  });

  const [activities, setActivities] = useState<AuctionActivity[]>([
    {
      id: 'act-1',
      type: 'room_created',
      message: 'IPL 2027 Mega Auction official war room portal initialized.',
      timestamp: Date.now() - 3600000,
    },
  ]);

  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);

  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(15);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isHammerStriking, setIsHammerStriking] = useState<boolean>(false);
  const [soldPlayerCelebration, setSoldPlayerCelebration] = useState<{
    player: Player;
    team: IPLTeam;
    price: number;
  } | null>(null);

  // Manual workflow step override if needed
  const [manualWorkflowStep, setManualWorkflowStep] = useState<WorkflowStep | null>(null);

  const isExecutingHammerRef = useRef<boolean>(false);
  const botBiddingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derive exact workflow step based on Section 1 Sequence:
  // LOGIN → CREATE/JOIN → LOBBY → SELECT TEAM → WAIT 10 TEAMS → RETENTION → CONFIRMATION → AUCTION READY → LIVE AUCTION → RESULTS
  const workflowStep: WorkflowStep = (() => {
    if (manualWorkflowStep) return manualWorkflowStep;
    if (!user.isAuthenticated) return 'LOGIN';
    if (!activeRoom) return 'ROOM_SELECT';

    switch (activeRoom.status) {
      case 'WAITING_FOR_PARTICIPANTS':
      case 'TEAM_SELECTION':
        // If user hasn't picked a team yet, show Team Selection
        const hasMyTeam = Boolean(user.selectedTeamId && activeRoom.teamAssignments[user.selectedTeamId]?.userId === user.id);
        if (!hasMyTeam) return 'TEAM_SELECTION';
        // If all 10 are claimed, go to Ready Check
        if (Object.keys(activeRoom.teamAssignments).length >= 10) return 'READY_CHECK';
        return 'ROOM_LOBBY';

      case 'READY_TO_START':
        return 'READY_CHECK';

      case 'RETENTION_PHASE':
        return 'RETENTION_DASHBOARD';

      case 'RETENTION_SUBMITTED':
        return 'RETENTION_CONFIRMATION';

      case 'RETENTION_FINALIZED':
      case 'AUCTION_READY':
        return 'AUCTION_READY';

      case 'LIVE_AUCTION':
      case 'AUCTION_PAUSED':
        return 'LIVE_AUCTION';

      case 'AUCTION_COMPLETED':
        return 'AUCTION_RESULTS';

      default:
        return 'ROOM_LOBBY';
    }
  })();

  const setWorkflowStep = (step: WorkflowStep) => {
    if (step === 'LIVE_AUCTION') {
      if (!areAllTenRetentionsConfirmed(activeRoom)) {
        const pending = getPendingRetentionFranchises(activeRoom);
        addActivity(
          'alert',
          `Cannot transition to LIVE_AUCTION: ${pending.length} franchises have unconfirmed retention decisions. All 10 must confirm first.`
        );
        return;
      }
    }
    setManualWorkflowStep(step);
  };

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', theme);
    } catch {}
  }, [theme]);

  // Sync Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authed: UserProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Franchise Director',
          email: firebaseUser.email || 'director@ipl2027.com',
          selectedTeamId: user.selectedTeamId || 'csk',
          role: 'Owner',
          isAuthenticated: true,
        };
        setUser(authed);
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + 'user', JSON.stringify(authed));
        } catch {}

        // Ensure user profile document exists or is updated in Firestore
        await syncUserProfileInFirestore({
          uid: firebaseUser.uid,
          displayName: authed.name,
          email: authed.email,
          selectedTeamId: authed.selectedTeamId,
          role: authed.role,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'teams', JSON.stringify(teams));
    } catch {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'players', JSON.stringify(players));
    } catch {}
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      if (activeRoom) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'room', JSON.stringify(activeRoom));
        syncRoomToFirestore(activeRoom).catch(() => {});
      } else {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'room');
      }
    } catch {}
  }, [activeRoom]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundEffects.setMuted(next);
  };

  const setUserTeam = (teamId: string) => {
    setUser((prev) => ({ ...prev, selectedTeamId: teamId }));
  };

  const updateUserName = (name: string) => {
    setUser((prev) => ({ ...prev, name }));
  };

  const loginUserSession = (authedUser: UserProfile) => {
    setUser(authedUser);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'user', JSON.stringify(authedUser));
    } catch {}
    setCurrentTab('dashboard');
  };

  const signInGoogle = async (): Promise<void> => {
    const res = await loginWithGoogle();
    if (res.success && res.user) {
      const authed: UserProfile = {
        ...user,
        id: res.user.uid,
        name: res.user.displayName || user.name || 'Franchise Director',
        email: res.user.email || user.email || 'director@ipl2027.com',
        isAuthenticated: true,
      };
      loginUserSession(authed);
    }
  };

  const signOutAccount = async () => {
    await logoutUser();
    setUser((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
    setActiveRoom(null);
    setManualWorkflowStep(null);
  };

  // Stable ordered pool of eligible cricketers for the auction sequence
  const auctionPool = useMemo(() => {
    if (activeRoom?.eligibleAuctionPlayerIds && activeRoom.eligibleAuctionPlayerIds.length > 0) {
      const playerMap = new Map(players.map((p) => [p.id, p]));
      return activeRoom.eligibleAuctionPlayerIds
        .map((id) => playerMap.get(id))
        .filter((p): p is Player => Boolean(p));
    }
    const allRetained = new Set(teams.flatMap((t) => t.retainedPlayers));
    return players.filter((p) => !allRetained.has(p.id));
  }, [activeRoom?.eligibleAuctionPlayerIds, players, teams]);

  const currentPlayer =
    activeRoom && auctionPool.length > 0 && activeRoom.currentPlayerIndex < auctionPool.length
      ? auctionPool[activeRoom.currentPlayerIndex]
      : null;

  const lastBidderTeam = activeRoom?.currentBid
    ? teams.find((t) => t.id === activeRoom.currentBid?.teamId) || null
    : null;

  const addActivity = useCallback(
    (type: AuctionActivity['type'], message: string, teamId?: string, amount?: number) => {
      const newAct: AuctionActivity = {
        id: 'act_' + Date.now() + Math.random().toString(36).substring(2, 6),
        type,
        message,
        timestamp: Date.now(),
        teamId,
        amount,
      };
      setActivities((prev) => [newAct, ...prev.slice(0, 49)]);
    },
    []
  );

  const clearCelebration = () => {
    setSoldPlayerCelebration(null);
  };

  // Create Room with completely independent player and retention data
  const createRoom = (
    name: string,
    timerSeconds: number = 15,
    format: 'Mega Auction' | 'Mini Auction' = 'Mega Auction'
  ): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'IPL27';
    for (let i = 0; i < 3; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const freshTeams: IPLTeam[] = INITIAL_TEAMS.map((t) => ({
      ...t,
      spentPurse: 0.0,
      retainedPlayers: [],
    }));

    const freshPlayers: Player[] = INITIAL_PLAYERS.map((p) => ({
      ...p,
      status: 'available',
      soldTo: undefined,
      soldPrice: undefined,
    }));

    const newRoom: AuctionRoom = {
      id: 'room_' + Date.now(),
      code,
      name: name || 'IPL Mega Auction 2027',
      hostId: user.id,
      format,
      season: 'IPL 2027 Simulation',
      startingPurse: 120.0,
      maxTeams: 10,
      bidTimerSeconds: timerSeconds,
      status: 'WAITING_FOR_PARTICIPANTS',
      currentPlayerIndex: 0,
      currentBid: null,
      bidHistory: [],
      teamAssignments: {}, // Empty initially as required by Section 5!
      retentions: {},
      settings: {
        autoBotBidding: true,
        soundEnabled: true,
        minSquadSize: 18,
        maxSquadSize: 25,
        maxRetentionsPerTeam: 6,
      },
      participants: [
        {
          id: user.id,
          name: user.name,
          email: user.email,
          isHost: true,
          joinedAt: Date.now(),
          isConnected: true,
        },
      ],
      eligibleAuctionPlayerIds: [],
      createdAt: Date.now(),
      roomPlayers: freshPlayers,
      roomTeams: freshTeams,
    };

    setTeams(freshTeams);
    setPlayers(freshPlayers);
    setActiveRoom(newRoom);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'room', JSON.stringify(newRoom));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'room_' + newRoom.id, JSON.stringify(newRoom));
    } catch {}
    setManualWorkflowStep(null);
    addActivity('room_created', `War Room "${newRoom.name}" created with code ${newRoom.code}. Host: ${user.name}`);
    return code;
  };

  // Join Room
  const joinRoom = (code: string): boolean => {
    if (!code) return false;
    const cleanCode = code.trim().toUpperCase();

    // If matches active room
    if (activeRoom && activeRoom.code.toUpperCase() === cleanCode) {
      setManualWorkflowStep(null);
      return true;
    }

    // Look up saved rooms in localStorage to restore exact room state
    let existingRoom: AuctionRoom | null = null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key === STORAGE_KEY_PREFIX + 'room' || key.startsWith(STORAGE_KEY_PREFIX + 'room_'))) {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item && item.code && item.code.toUpperCase() === cleanCode) {
            existingRoom = item;
            break;
          }
        }
      }
    } catch {}

    if (existingRoom) {
      setActiveRoom(existingRoom);
      if (existingRoom.roomTeams && existingRoom.roomTeams.length === 10) {
        setTeams(existingRoom.roomTeams);
      }
      if (existingRoom.roomPlayers && existingRoom.roomPlayers.length === INITIAL_PLAYERS.length) {
        setPlayers(existingRoom.roomPlayers);
      }
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'room', JSON.stringify(existingRoom));
      } catch {}
      setManualWorkflowStep(null);
      addActivity('room_created', `Reconnected to War Room "${existingRoom.name}" (${existingRoom.code}).`);
      return true;
    }

    // Otherwise create new room with clean data
    const createdCode = createRoom(`Auction Arena ${cleanCode}`, 15);
    setManualWorkflowStep(null);
    return Boolean(createdCode);
  };

  // Auto-connect if URL parameter ?room=CODE is provided
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && !activeRoom) {
        joinRoom(roomParam);
      }
    } catch {
      // Ignore
    }
  }, []);

  const leaveRoom = () => {
    setIsTimerRunning(false);
    setActiveRoom(null);
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setManualWorkflowStep('ROOM_SELECT');
  };

  // Claim Team in Room (Section 5)
  const claimFranchiseInRoom = (teamId: string) => {
    if (!activeRoom) return;

    setUser((prev) => ({ ...prev, selectedTeamId: teamId }));

    setActiveRoom((prev) => {
      if (!prev) return null;
      // Remove any prior assignment for this user
      const cleaned = Object.entries(prev.teamAssignments)
        .filter(([_, conf]) => conf.userId !== user.id)
        .reduce((acc, [tid, conf]) => ({ ...acc, [tid]: conf }), {});

      const updatedAssignments = {
        ...cleaned,
        [teamId]: { userId: user.id, userName: user.name, isBot: false },
      };

      const count = Object.keys(updatedAssignments).length;
      const nextStatus: RoomStatus = count === 10 ? 'READY_TO_START' : 'TEAM_SELECTION';

      return {
        ...prev,
        status: nextStatus,
        teamAssignments: updatedAssignments,
      };
    });

    addActivity('room_created', `${user.name} selected ${teamId.toUpperCase()} as their franchise.`);
  };

  // Auto fill vacant teams with AI bots (Section 5 & 6)
  const autoFillRemainingWithBots = () => {
    if (!activeRoom) return;

    setActiveRoom((prev) => {
      if (!prev) return null;
      const currentAssigned = { ...prev.teamAssignments };

      INITIAL_TEAMS.forEach((t) => {
        if (!currentAssigned[t.id]) {
          currentAssigned[t.id] = {
            userId: `bot_${t.id}`,
            userName: `${t.code} AI Strategist`,
            isBot: true,
          };
        }
      });

      return {
        ...prev,
        status: 'READY_TO_START',
        teamAssignments: currentAssigned,
      };
    });

    addActivity('room_created', 'BCCI Intelligence Bots assigned to all remaining vacant franchise desks.');
  };

  // Start Retention Phase (Section 6)
  const startRetentionPhase = () => {
    if (!activeRoom) return;

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'RETENTION_PHASE',
      };
    });

    setManualWorkflowStep(null);
    addActivity('retention', 'Host has initiated the Mega Auction Retention Phase. All 10 managers active.');
  };

  // Confirm Team Retention (Section 8)
  const confirmTeamRetention = (teamId: string) => {
    if (!activeRoom) return;

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    setActiveRoom((prev) => {
      if (!prev) return null;
      const updatedRetentions = {
        ...prev.retentions,
        [teamId]: {
          teamId,
          retainedPlayerIds: team.retainedPlayers,
          releasedPlayerIds: [],
          totalRetentionCost: team.spentPurse,
          remainingPurse: Number((team.totalPurse - team.spentPurse).toFixed(2)),
          isConfirmed: true,
          confirmedAt: Date.now(),
        },
      };

      const confirmedCount = Object.values(updatedRetentions).filter((r) => r.isConfirmed).length;
      const nextStatus: RoomStatus = confirmedCount === 10 ? 'RETENTION_SUBMITTED' : prev.status;

      return {
        ...prev,
        status: nextStatus,
        retentions: updatedRetentions,
      };
    });

    addActivity('retention', `${team.name} locked and confirmed retention decisions.`);
  };

  // Auto-confirm bot retentions (Section 8)
  const autoConfirmBotRetentions = () => {
    if (!activeRoom) return;

    setActiveRoom((prev) => {
      if (!prev) return null;
      const updatedRetentions = { ...prev.retentions };

      INITIAL_TEAMS.forEach((t) => {
        const teamData = teams.find((item) => item.id === t.id) || t;
        if (!updatedRetentions[t.id]?.isConfirmed) {
          updatedRetentions[t.id] = {
            teamId: t.id,
            retainedPlayerIds: teamData.retainedPlayers,
            releasedPlayerIds: [],
            totalRetentionCost: teamData.spentPurse,
            remainingPurse: Number((teamData.totalPurse - teamData.spentPurse).toFixed(2)),
            isConfirmed: true,
            confirmedAt: Date.now(),
          };
        }
      });

      return {
        ...prev,
        status: 'RETENTION_SUBMITTED',
        retentions: updatedRetentions,
      };
    });

    addActivity('retention', 'All franchise retention submissions have been locked and confirmed.');
  };

  // Finalize All Retentions & Generate Final Auction Pool (Sections 9 & 10)
  const finalizeAllRetentions = (): { success: boolean; error?: string } => {
    if (!activeRoom) return { success: false, error: 'No active room available' };

    const pending = getPendingRetentionFranchises(activeRoom);
    if (pending.length > 0) {
      const names = pending.map((t) => t.code).join(', ');
      const msg = `Cannot finalize retentions: ${pending.length} of 10 franchises pending confirmation (${names}). All 10 must lock decisions.`;
      addActivity('alert', msg);
      return { success: false, error: msg };
    }

    // Compile all retained players
    const allRetained = new Set(teams.flatMap((t) => t.retainedPlayers));
    const eligibleIds = players.filter((p) => !allRetained.has(p.id)).map((p) => p.id);

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'AUCTION_READY',
        eligibleAuctionPlayerIds: eligibleIds,
      };
    });

    setManualWorkflowStep(null);
    addActivity('retention', `Retention finalized! ${eligibleIds.length} eligible players compiled for Live Auction.`);
    return { success: true };
  };

  // Start Live Mega Auction (Section 9)
  // Client-side validation: ensure that the auction state cannot transition to 'LIVE_AUCTION'
  // unless all 10 participants have submitted their retention decisions.
  const startLiveMegaAuction = (): { success: boolean; error?: string } => {
    if (!activeRoom) {
      return { success: false, error: 'No active auction room.' };
    }

    const pending = getPendingRetentionFranchises(activeRoom);
    if (pending.length > 0) {
      const names = pending.map((t) => t.code).join(', ');
      const msg = `Cannot transition to LIVE_AUCTION: ${pending.length} of 10 franchise retention decisions are still pending (${names}). All 10 participants must confirm retentions before live bidding can start.`;
      addActivity('alert', msg);
      return { success: false, error: msg };
    }

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'LIVE_AUCTION',
        currentPlayerIndex: 0,
        currentBid: null,
        bidHistory: [],
      };
    });

    setTimerSecondsLeft(activeRoom.bidTimerSeconds);
    setIsTimerRunning(true);
    setManualWorkflowStep(null);
    addActivity('bid', 'BCCI Auctioneer has opened the floor! Marquee player bidding is LIVE.');
    return { success: true };
  };

  const pauseAuction = () => {
    setIsTimerRunning(false);
    setActiveRoom((prev) => (prev ? { ...prev, status: 'AUCTION_PAUSED' } : null));
  };

  const resumeAuction = () => {
    if (!areAllTenRetentionsConfirmed(activeRoom)) {
      addActivity('alert', 'Cannot resume Live Auction: All 10 franchise retentions must be confirmed.');
      return;
    }
    setIsTimerRunning(true);
    setActiveRoom((prev) => (prev ? { ...prev, status: 'LIVE_AUCTION' } : null));
  };

  const finishAuction = () => {
    setIsTimerRunning(false);
    setActiveRoom((prev) => (prev ? { ...prev, status: 'AUCTION_COMPLETED' } : null));
    setManualWorkflowStep(null);
    addActivity('sold', 'The IPL Mega Auction 2027 has officially concluded.');
  };

  // Skip to next player with boundary check
  const skipToNextPlayer = useCallback(() => {
    if (!activeRoom) return;
    isExecutingHammerRef.current = false;

    // Check if more players available in the auction sequence
    if (activeRoom.currentPlayerIndex + 1 >= auctionPool.length) {
      finishAuction();
      return;
    }

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentPlayerIndex: prev.currentPlayerIndex + 1,
        currentBid: null,
        bidHistory: [],
      };
    });

    setTimerSecondsLeft(activeRoom.bidTimerSeconds);
    setIsTimerRunning(true);
  }, [activeRoom, auctionPool.length]);

  // Sell Player with concurrency lock
  const sellCurrentPlayer = useCallback(() => {
    if (!activeRoom || !currentPlayer || !activeRoom.currentBid) return;

    if (isExecutingHammerRef.current) return;
    isExecutingHammerRef.current = true;

    if (currentPlayer.status === 'sold' || currentPlayer.status === 'retained') {
      isExecutingHammerRef.current = false;
      return;
    }

    const winningBid = activeRoom.currentBid;
    const winningTeam = teams.find((t) => t.id === winningBid.teamId);
    if (!winningTeam) {
      isExecutingHammerRef.current = false;
      return;
    }

    setIsHammerStriking(true);
    soundEffects.playHammerStrike();

    setTimeout(() => {
      soundEffects.playSoldFanfare();
      setIsHammerStriking(false);
      setSoldPlayerCelebration({
        player: currentPlayer,
        team: winningTeam,
        price: winningBid.amount,
      });

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === currentPlayer.id
            ? { ...p, status: 'sold', soldTo: winningTeam.id, soldPrice: winningBid.amount }
            : p
        )
      );

      setTeams((prev) =>
        prev.map((t) =>
          t.id === winningTeam.id
            ? {
                ...t,
                spentPurse: Number((t.spentPurse + winningBid.amount).toFixed(2)),
              }
            : t
        )
      );

      addActivity(
        'sold',
        `SOLD! ${currentPlayer.name} acquired by ${winningTeam.name} for ₹${winningBid.amount.toFixed(2)} Cr!`,
        winningTeam.id,
        winningBid.amount
      );

      setTimeout(() => {
        skipToNextPlayer();
      }, 2500);
    }, 600);
  }, [activeRoom, currentPlayer, teams, addActivity, skipToNextPlayer]);

  const markCurrentPlayerUnsold = useCallback(() => {
    if (!activeRoom || !currentPlayer) return;

    if (isExecutingHammerRef.current) return;
    isExecutingHammerRef.current = true;

    soundEffects.playUnsoldBuzzer();

    setPlayers((prev) =>
      prev.map((p) => (p.id === currentPlayer.id ? { ...p, status: 'unsold' } : p))
    );

    addActivity('unsold', `${currentPlayer.name} passed UNSOLD at base price of ₹${currentPlayer.basePrice} Cr.`);

    setTimeout(() => {
      skipToNextPlayer();
    }, 1200);
  }, [activeRoom, currentPlayer, addActivity, skipToNextPlayer]);

  // Place Bid with Concurrency & Race-Condition Defense
  const placeBid = useCallback(
    (teamId: string, customAmount?: number, incrementDelta?: number): { success: boolean; reason?: string } => {
      if (!activeRoom || !currentPlayer) {
        return { success: false, reason: 'No active auction session or player.' };
      }

      if (isExecutingHammerRef.current) {
        return { success: false, reason: 'Hammer is falling. Bid closed.' };
      }

      const biddingTeam = teams.find((t) => t.id === teamId);
      if (!biddingTeam) {
        return { success: false, reason: 'Franchise not found.' };
      }

      const remainingPurse = Number((biddingTeam.totalPurse - biddingTeam.spentPurse).toFixed(2));
      const currentBidAmt = activeRoom.currentBid?.amount || 0;

      let targetBidAmt: number;
      if (incrementDelta && incrementDelta > 0) {
        const base = currentBidAmt > 0 ? currentBidAmt : currentPlayer.basePrice;
        targetBidAmt = Number((base + incrementDelta).toFixed(2));
      } else if (customAmount !== undefined) {
        targetBidAmt = Number(customAmount.toFixed(2));
      } else {
        targetBidAmt = currentBidAmt === 0 ? currentPlayer.basePrice : calculateNextBid(currentBidAmt);
      }

      if (targetBidAmt <= currentBidAmt) {
        return {
          success: false,
          reason: `Outbid! Current bid is already ₹${currentBidAmt.toFixed(2)} Cr.`,
        };
      }

      if (remainingPurse < targetBidAmt) {
        return {
          success: false,
          reason: `Insufficient purse. Remaining: ₹${remainingPurse.toFixed(2)} Cr.`,
        };
      }

      const currentSquadCount = players.filter(
        (p) => p.soldTo === teamId || biddingTeam.retainedPlayers.includes(p.id)
      ).length;

      if (currentSquadCount >= biddingTeam.maxSquad) {
        return {
          success: false,
          reason: `Squad limit reached (${biddingTeam.maxSquad} players max).`,
        };
      }

      if (currentPlayer.isOverseas) {
        const currentOverseas = players.filter(
          (p) => p.isOverseas && (p.soldTo === teamId || biddingTeam.retainedPlayers.includes(p.id))
        ).length;

        if (currentOverseas >= biddingTeam.maxOverseas) {
          return {
            success: false,
            reason: `Overseas quota full (${biddingTeam.maxOverseas} max).`,
          };
        }
      }

      const newBid: BidRecord = {
        amount: targetBidAmt,
        teamId: biddingTeam.id,
        teamCode: biddingTeam.code,
        teamColor: biddingTeam.primaryColor,
        timestamp: Date.now(),
        isBot: activeRoom.teamAssignments[teamId]?.isBot || false,
      };

      setActiveRoom((prev) => {
        if (!prev) return null;
        if (prev.currentBid && prev.currentBid.amount >= targetBidAmt) {
          return prev;
        }
        return {
          ...prev,
          currentBid: newBid,
          bidHistory: [newBid, ...prev.bidHistory],
        };
      });

      soundEffects.playBidPlaced();
      setTimerSecondsLeft(activeRoom.bidTimerSeconds);
      setIsTimerRunning(true);

      addActivity(
        'bid',
        `${biddingTeam.code} bid ₹${targetBidAmt.toFixed(2)} Cr for ${currentPlayer.name}`,
        biddingTeam.id,
        targetBidAmt
      );

      return { success: true };
    },
    [activeRoom, currentPlayer, teams, players, addActivity]
  );

  // Bot bidding AI trigger
  useEffect(() => {
    if (
      !activeRoom ||
      !isTimerRunning ||
      !activeRoom.settings.autoBotBidding ||
      !currentPlayer ||
      activeRoom.status !== 'LIVE_AUCTION'
    ) {
      return;
    }

    if (botBiddingTimeoutRef.current) {
      clearTimeout(botBiddingTimeoutRef.current);
    }

    const botTeams = Object.entries(activeRoom.teamAssignments)
      .filter(([teamId, conf]) => conf.isBot && teamId !== activeRoom.currentBid?.teamId)
      .map(([teamId]) => teams.find((t) => t.id === teamId))
      .filter((t): t is IPLTeam => Boolean(t));

    if (botTeams.length === 0) return;

    const randomBot = botTeams[Math.floor(Math.random() * botTeams.length)];
    const currentBidVal = activeRoom.currentBid?.amount || 0;
    const nextBidVal = currentBidVal === 0 ? currentPlayer.basePrice : calculateNextBid(currentBidVal);

    const maxValThreshold = currentPlayer.marquee ? 22.0 : currentPlayer.role === 'All-Rounder' ? 14.0 : 10.0;
    const botRemainingPurse = randomBot.totalPurse - randomBot.spentPurse;

    if (nextBidVal <= maxValThreshold && botRemainingPurse >= nextBidVal + 5.0) {
      const shouldBidChance = timerSecondsLeft > 2 && Math.random() > 0.45;

      if (shouldBidChance) {
        const delay = Math.floor(Math.random() * 2000) + 2000;
        botBiddingTimeoutRef.current = setTimeout(() => {
          placeBid(randomBot.id);
        }, delay);
      }
    }

    return () => {
      if (botBiddingTimeoutRef.current) {
        clearTimeout(botBiddingTimeoutRef.current);
      }
    };
  }, [
    activeRoom?.currentBid,
    activeRoom?.settings.autoBotBidding,
    activeRoom?.status,
    isTimerRunning,
    currentPlayer,
    timerSecondsLeft,
    placeBid,
    teams,
  ]);

  // Synchronized countdown interval
  useEffect(() => {
    if (!isTimerRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        if (prev <= 4) soundEffects.playTimerTick(prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Trigger Hammer when timer hits 0
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft === 0 && !isExecutingHammerRef.current) {
      if (activeRoom?.currentBid) {
        sellCurrentPlayer();
      } else {
        markCurrentPlayerUnsold();
      }
    }
  }, [timerSecondsLeft, isTimerRunning, activeRoom?.currentBid, sellCurrentPlayer, markCurrentPlayerUnsold]);

  const goToPlayerIndex = (index: number) => {
    if (!activeRoom) return;
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentPlayerIndex: Math.max(0, index),
        currentBid: null,
        bidHistory: [],
      };
    });
    setTimerSecondsLeft(activeRoom.bidTimerSeconds);
    setIsTimerRunning(true);
  };

  const toggleAutoBotBidding = useCallback(() => {
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          autoBotBidding: !prev.settings.autoBotBidding,
        },
      };
    });
  }, []);

  // Retention management
  const retainPlayer = (teamId: string, playerId: string): { success: boolean; message: string } => {
    const team = teams.find((t) => t.id === teamId);
    const player = players.find((p) => p.id === playerId);

    if (!team || !player) return { success: false, message: 'Invalid team or player.' };

    // Strict validation: player must belong to this team
    if (player.teamId && player.teamId !== teamId && player.previousTeam !== team.code) {
      return { success: false, message: `${player.name} does not belong to ${team.name}.` };
    }

    if (team.retainedPlayers.length >= 6) return { success: false, message: 'Max 6 retentions allowed.' };
    if (team.retainedPlayers.includes(playerId)) return { success: false, message: `${player.name} is already retained.` };

    const tier = RETENTION_TIERS[team.retainedPlayers.length] || { cost: 18.0 };
    const cost = tier.cost;
    const remaining = team.totalPurse - team.spentPurse;

    if (remaining < cost) return { success: false, message: `Insufficient purse. Need ₹${cost} Cr.` };

    const updatedTeams = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            spentPurse: Number((t.spentPurse + cost).toFixed(2)),
            retainedPlayers: [...t.retainedPlayers, playerId],
          }
        : t
    );

    const updatedPlayers = players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            status: 'retained' as const,
            soldTo: teamId,
            soldPrice: cost,
          }
        : p
    );

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);

    // Keep activeRoom in sync
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        roomTeams: updatedTeams,
        roomPlayers: updatedPlayers,
      };
    });

    addActivity('retention', `${team.name} marked ${player.name} for retention (₹${cost} Cr).`, teamId, cost);
    return { success: true, message: `Retained ${player.name} for ₹${cost} Cr.` };
  };

  const retainMultiplePlayers = (teamId: string, playerIds: string[]): { success: boolean; message: string } => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, message: 'Franchise not found.' };

    const availableSlots = 6 - team.retainedPlayers.length;
    if (playerIds.length === 0) return { success: false, message: 'No players selected.' };
    if (playerIds.length > availableSlots) {
      return {
        success: false,
        message: `Cannot retain ${playerIds.length} players. Only ${availableSlots} slot(s) remaining for ${team.name}.`,
      };
    }

    let retainedCount = 0;
    const errors: string[] = [];
    let currentSpent = team.spentPurse;
    let currentRetained = [...team.retainedPlayers];
    const newlyRetainedMap = new Map<string, number>();

    for (const pid of playerIds) {
      const p = players.find((pl) => pl.id === pid);
      if (!p) continue;
      if (p.teamId && p.teamId !== teamId && p.previousTeam !== team.code) {
        errors.push(`${p.name} does not belong to ${team.name}`);
        continue;
      }
      if (currentRetained.includes(pid)) continue;
      if (currentRetained.length >= 6) {
        errors.push('Maximum 6 retentions limit reached');
        break;
      }

      const tier = RETENTION_TIERS[currentRetained.length] || { cost: 18.0 };
      const cost = tier.cost;
      const rem = team.totalPurse - currentSpent;
      if (rem < cost) {
        errors.push(`Insufficient purse for ${p.name} (Need ₹${cost} Cr)`);
        break;
      }

      currentSpent = Number((currentSpent + cost).toFixed(2));
      currentRetained.push(pid);
      newlyRetainedMap.set(pid, cost);
      retainedCount++;
    }

    if (retainedCount > 0) {
      const updatedTeams = teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              spentPurse: currentSpent,
              retainedPlayers: currentRetained,
            }
          : t
      );

      const updatedPlayers = players.map((p) => {
        if (newlyRetainedMap.has(p.id)) {
          const cost = newlyRetainedMap.get(p.id)!;
          return {
            ...p,
            status: 'retained' as const,
            soldTo: teamId,
            soldPrice: cost,
          };
        }
        return p;
      });

      setTeams(updatedTeams);
      setPlayers(updatedPlayers);
      setActiveRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          roomTeams: updatedTeams,
          roomPlayers: updatedPlayers,
        };
      });

      addActivity(
        'retention',
        `${team.name} retained ${retainedCount} player(s) in batch submission.`,
        teamId
      );
      return {
        success: true,
        message: `Successfully retained ${retainedCount} player(s) for ${team.name}.`,
      };
    }

    return { success: false, message: errors[0] || 'Retention failed.' };
  };

  const releasePlayer = (teamId: string, playerId: string): { success: boolean; message: string } => {
    const team = teams.find((t) => t.id === teamId);
    const player = players.find((p) => p.id === playerId);

    if (!team || !player) return { success: false, message: 'Invalid team or player.' };
    const priceToRestore = player.soldPrice || 0;

    const updatedTeams = teams.map((t) =>
      t.id === teamId
        ? {
            ...t,
            spentPurse: Math.max(0, Number((t.spentPurse - priceToRestore).toFixed(2))),
            retainedPlayers: t.retainedPlayers.filter((id) => id !== playerId),
          }
        : t
    );

    const updatedPlayers = players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            status: 'available' as const,
            soldTo: undefined,
            soldPrice: undefined,
          }
        : p
    );

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        roomTeams: updatedTeams,
        roomPlayers: updatedPlayers,
      };
    });

    addActivity('release', `${team.name} released ${player.name} back to the auction pool.`, teamId);
    return { success: true, message: `Released ${player.name}.` };
  };

  const proposeTrade = (
    fromTeamId: string,
    toTeamId: string,
    offeredPlayerIds: string[],
    requestedPlayerIds: string[],
    cashAdjustment: number
  ) => {
    const fromTeam = teams.find((t) => t.id === fromTeamId);
    const toTeam = teams.find((t) => t.id === toTeamId);
    if (!fromTeam || !toTeam) return { success: false, message: 'Franchise not found.' };

    const fromRemaining = fromTeam.totalPurse - fromTeam.spentPurse;
    if (cashAdjustment > 0 && fromRemaining < cashAdjustment) {
      return { success: false, message: `Insufficient purse for cash adjustment.` };
    }

    const newTrade: TradeOffer = {
      id: 'trade_' + Date.now(),
      fromTeamId,
      toTeamId,
      offeredPlayerIds,
      requestedPlayerIds,
      cashAdjustment,
      status: 'pending',
      timestamp: Date.now(),
    };

    setTradeOffers((prev) => [newTrade, ...prev]);
    addActivity('trade', `Trade proposed between ${fromTeam.code} and ${toTeam.code}.`);
    return { success: true, message: 'Trade proposed.' };
  };

  const respondToTrade = (tradeId: string, accept: boolean) => {
    const trade = tradeOffers.find((t) => t.id === tradeId);
    if (!trade) return { success: false, message: 'Trade not found.' };

    if (accept) {
      const fromTeam = teams.find((t) => t.id === trade.fromTeamId);
      const toTeam = teams.find((t) => t.id === trade.toTeamId);
      if (!fromTeam || !toTeam) return { success: false, message: 'Franchise not found.' };

      setPlayers((prev) =>
        prev.map((p) => {
          if (trade.offeredPlayerIds.includes(p.id)) return { ...p, soldTo: trade.toTeamId };
          if (trade.requestedPlayerIds.includes(p.id)) return { ...p, soldTo: trade.fromTeamId };
          return p;
        })
      );

      // Financial balance and squad roster equilibrium
      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === trade.fromTeamId) {
            return {
              ...t,
              spentPurse: Number((t.spentPurse + (trade.cashAdjustment || 0)).toFixed(2)),
              retainedPlayers: t.retainedPlayers.filter((id) => !trade.offeredPlayerIds.includes(id)),
            };
          }
          if (t.id === trade.toTeamId) {
            return {
              ...t,
              spentPurse: Number((t.spentPurse - (trade.cashAdjustment || 0)).toFixed(2)),
              retainedPlayers: t.retainedPlayers.filter((id) => !trade.requestedPlayerIds.includes(id)),
            };
          }
          return t;
        })
      );

      addActivity('trade', `Trade accepted between ${fromTeam.code} and ${toTeam.code}!`);
    }

    setTradeOffers((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, status: accept ? 'accepted' : 'rejected' } : t))
    );

    return { success: true, message: accept ? 'Trade accepted!' : 'Trade rejected.' };
  };

  const resetAuctionData = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'teams');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'players');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'room');
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setActiveRoom(null);
    setManualWorkflowStep('ROOM_SELECT');
    setActivities([
      {
        id: 'act-reset',
        type: 'room_created',
        message: 'Tournament reset to initial draft state.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <AuctionContext.Provider
      value={{
        theme,
        toggleTheme,
        soundMuted,
        toggleSound,
        workflowStep,
        setWorkflowStep,
        currentTab,
        setCurrentTab,
        isGmailModalOpen,
        setIsGmailModalOpen,
        user,
        setUserTeam,
        updateUserName,
        signInGoogle,
        signOutAccount,
        loginUserSession,
        teams,
        players,
        auctionPool,
        activities,
        tradeOffers,
        inspectedPlayer,
        setInspectedPlayer,
        activeRoom,
        currentPlayer,
        timerSecondsLeft,
        isTimerRunning,
        lastBidderTeam,
        isHammerStriking,
        soldPlayerCelebration,
        clearCelebration,
        createRoom,
        joinRoom,
        leaveRoom,
        claimFranchiseInRoom,
        autoFillRemainingWithBots,
        startRetentionPhase,
        confirmTeamRetention,
        autoConfirmBotRetentions,
        finalizeAllRetentions,
        startLiveMegaAuction,
        pauseAuction,
        resumeAuction,
        finishAuction,
        areAllTenRetentionsConfirmed: () => areAllTenRetentionsConfirmed(activeRoom),
        getPendingRetentionFranchises: () => getPendingRetentionFranchises(activeRoom),
        confirmedRetentionsCount: activeRoom?.retentions
          ? Object.values(activeRoom.retentions).filter((r) => r.isConfirmed).length
          : 0,
        placeBid,
        sellCurrentPlayer,
        markCurrentPlayerUnsold,
        skipToNextPlayer,
        goToPlayerIndex,
        toggleAutoBotBidding,
        retainPlayer,
        retainMultiplePlayers,
        releasePlayer,
        proposeTrade,
        respondToTrade,
        resetAuctionData,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) throw new Error('useAuction must be used within an AuctionProvider');
  return context;
};
