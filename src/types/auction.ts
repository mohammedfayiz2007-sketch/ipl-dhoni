/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export type PlayerStatus = 'available' | 'retained' | 'sold' | 'unsold' | 'live';

export type AuctionFormat = 'Mega Auction' | 'Mini Auction';

export type ViewTab =
  | 'landing'
  | 'dashboard'
  | 'auction'
  | 'teams'
  | 'players'
  | 'retention'
  | 'trade'
  | 'rooms'
  | 'history'
  | 'settings';

export interface PlayerStats {
  matches: number;
  runs?: number;
  wickets?: number;
  strikeRate?: number;
  economy?: number;
  average?: number;
  highScore?: string;
  bestBowling?: string;
  performance2026?: string;
}

export interface Player {
  id: string;
  name: string;
  country: string;
  isOverseas: boolean;
  role: PlayerRole;
  battingStyle: string;
  bowlingStyle?: string;
  basePrice: number; // in Crores, e.g. 2.0 (Simulated Base Price)
  previousTeam?: string;
  teamId: string; // Team ID, e.g. 'csk'
  teamName: string; // Team Name, e.g. 'Chennai Super Kings'
  imageUrl?: string;
  iplStats: PlayerStats;
  marquee: boolean;
  set: string; // e.g. 'M1', 'BA1', 'AL1', 'BO1', 'WK1'
  status: PlayerStatus;
  soldTo?: string; // Team ID
  soldPrice?: number; // in Crores
}

export interface IPLTeam {
  id: string;
  name: string;
  code: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  totalPurse: number; // Total budget, e.g. 120.0 (in Crores)
  spentPurse: number;
  retainedPlayers: string[]; // Player IDs
  maxSquad: number; // 25
  minSquad: number; // 18
  maxOverseas: number; // 8
  trophies: number[];
  homeGround: string;
  ownerName: string;
}

export interface BidRecord {
  amount: number; // in Crores
  teamId: string;
  teamCode: string;
  teamColor: string;
  timestamp: number;
  isBot?: boolean;
}

export interface RoomParticipant {
  id: string;
  name: string;
  email?: string;
  isHost: boolean;
  teamId?: string; // Team assigned to participant
  joinedAt: number;
  isConnected: boolean;
}

// Exact room states required by Section 12
export type RoomStatus =
  | 'WAITING_FOR_PARTICIPANTS'
  | 'TEAM_SELECTION'
  | 'READY_TO_START'
  | 'RETENTION_PHASE'
  | 'RETENTION_SUBMITTED'
  | 'RETENTION_FINALIZED'
  | 'AUCTION_READY'
  | 'LIVE_AUCTION'
  | 'AUCTION_PAUSED'
  | 'AUCTION_COMPLETED';

export interface TeamRetentionDecision {
  teamId: string;
  retainedPlayerIds: string[];
  releasedPlayerIds: string[];
  totalRetentionCost: number;
  remainingPurse: number;
  isConfirmed: boolean;
  confirmedAt?: number;
}

export interface AuctionRoom {
  id: string;
  code: string; // e.g. IPL27X92
  name: string;
  hostId: string;
  format: AuctionFormat;
  season: string; // "IPL 2027 Simulation"
  startingPurse: number; // 120.0 Cr
  maxTeams: number; // 10
  bidTimerSeconds: number; // 15s
  status: RoomStatus;
  currentPlayerIndex: number;
  currentBid: BidRecord | null;
  bidHistory: BidRecord[];
  teamAssignments: Record<string, { userId: string; userName: string; isBot?: boolean }>;
  retentions: Record<string, TeamRetentionDecision>;
  settings: {
    autoBotBidding: boolean;
    soundEnabled: boolean;
    minSquadSize: number;
    maxSquadSize: number;
    maxRetentionsPerTeam: number;
  };
  participants: RoomParticipant[];
  eligibleAuctionPlayerIds: string[];
  createdAt: number;
  roomPlayers?: Player[];
  roomTeams?: IPLTeam[];
}

export interface TradeOffer {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  offeredPlayerIds: string[];
  requestedPlayerIds: string[];
  cashAdjustment: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

export interface AuctionActivity {
  id: string;
  type: 'bid' | 'sold' | 'unsold' | 'retention' | 'release' | 'trade' | 'room_created' | 'alert';
  message: string;
  timestamp: number;
  teamId?: string;
  amount?: number;
}

// High-level navigation workflow steps
export type WorkflowStep =
  | 'LOGIN'
  | 'ROOM_SELECT'
  | 'ROOM_LOBBY'
  | 'TEAM_SELECTION'
  | 'READY_CHECK'
  | 'RETENTION_DASHBOARD'
  | 'RETENTION_CONFIRMATION'
  | 'AUCTION_READY'
  | 'LIVE_AUCTION'
  | 'AUCTION_RESULTS';
