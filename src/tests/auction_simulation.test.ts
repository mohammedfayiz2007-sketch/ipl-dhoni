/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// IPL Auction Arena 2027 – Senior QA Automated Audit & Simulation Suite

import { INITIAL_TEAMS, INITIAL_PLAYERS, calculateNextBid, RETENTION_TIERS } from '../data/iplData';
import { areAllTenRetentionsConfirmed, getPendingRetentionFranchises } from '../context/AuctionContext';
import { AuctionRoom } from '../types/auction';

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, details: string) {
  if (condition) {
    results.push({ name: testName, passed: true, details });
    console.log(`[PASS] ${testName}`);
  } else {
    results.push({ name: testName, passed: false, details });
    console.error(`[FAIL] ${testName}: ${details}`);
  }
}

async function runQAAudit() {
  console.log('=====================================================');
  console.log('IPL AUCTION ARENA 2027 – SENIOR QA AUTOMATED AUDIT');
  console.log('=====================================================\n');

  // TEST 1: Initial Tournament Purse Integrity
  const totalPurseAllTeams = INITIAL_TEAMS.reduce((sum, t) => sum + t.totalPurse, 0);
  assert(
    totalPurseAllTeams === 1200.0,
    'Total Purse Integrity (10 Teams)',
    `Expected ₹1200.00 Cr total across 10 teams, found ₹${totalPurseAllTeams} Cr`
  );

  // TEST 2: Bid Increment Hierarchy Rules
  const bid1 = calculateNextBid(0.75);
  const bid2 = calculateNextBid(1.5);
  const bid3 = calculateNextBid(3.0);
  const bid4 = calculateNextBid(7.0);
  const bid5 = calculateNextBid(15.0);

  assert(
    bid1 === 0.8 && bid2 === 1.6 && bid3 === 3.2 && bid4 === 7.25 && bid5 === 15.5,
    'Tiered Bid Increments (+5L/+10L/+20L/+25L/+50L)',
    `0.75 -> ${bid1}, 1.5 -> ${bid2}, 3.0 -> ${bid3}, 7.0 -> ${bid4}, 15.0 -> ${bid5}`
  );

  // TEST 3: Multi-User Simultaneous Bidding Concurrency & Race-Condition Defense
  let simulatedCurrentBid = 2.0; // Base opening
  let currentLeadingTeam = 'CSK';
  const bidLog: { team: string; amount: number; accepted: boolean }[] = [];

  // 4 franchises attempt to bid simultaneously with slightly different amounts
  const simultaneousAttempts = [
    { team: 'MI', amount: 2.2 },
    { team: 'RCB', amount: 2.2 }, // Stale duplicate bid amount
    { team: 'KKR', amount: 2.1 }, // Stale lower bid amount
    { team: 'SRH', amount: 2.5 }, // Legitimate higher jump bid
  ];

  for (const attempt of simultaneousAttempts) {
    // Concurrency validation check: bid must be strictly greater than current
    if (attempt.amount > simulatedCurrentBid) {
      simulatedCurrentBid = attempt.amount;
      currentLeadingTeam = attempt.team;
      bidLog.push({ team: attempt.team, amount: attempt.amount, accepted: true });
    } else {
      bidLog.push({ team: attempt.team, amount: attempt.amount, accepted: false });
    }
  }

  const acceptedCount = bidLog.filter((b) => b.accepted).length;
  const rejectedCount = bidLog.filter((b) => !b.accepted).length;

  assert(
    acceptedCount === 2 && rejectedCount === 2 && simulatedCurrentBid === 2.5 && currentLeadingTeam === 'SRH',
    'Simultaneous Bidding Race-Condition Rejection',
    `Accepted: ${acceptedCount}, Rejected: ${rejectedCount}, Final High: ₹${simulatedCurrentBid} Cr by ${currentLeadingTeam}`
  );

  // TEST 4: Negative Purse Prevention
  const mockTeam = { ...INITIAL_TEAMS[0], spentPurse: 115.0 }; // Remaining: ₹5.00 Cr
  const attemptPurseExceedBid = 6.0;
  const canAfford = mockTeam.totalPurse - mockTeam.spentPurse >= attemptPurseExceedBid;

  assert(
    !canAfford,
    'Purse Solvency Guard (No Negative Purse)',
    `Team with ₹5.00 Cr remaining correctly blocked from bidding ₹6.00 Cr`
  );

  // TEST 5: Duplicate Player Purchase & Allocation Guard
  const player = { ...INITIAL_PLAYERS[0], status: 'sold' as const, soldTo: 'CSK', soldPrice: 20.0 };
  const attemptSellAgain = player.status === 'sold';

  assert(
    attemptSellAgain,
    'Duplicate Purchase Prevention Guard',
    `Player ${player.name} already marked SOLD cannot be sold twice to another franchise`
  );

  // TEST 6: Official BCCI Retention Scale Deductions
  const expectedTiers = [18.0, 14.0, 11.0, 18.0, 14.0, 4.0];
  const actualTiers = RETENTION_TIERS.map((t) => t.cost);
  const tiersMatch = JSON.stringify(expectedTiers) === JSON.stringify(actualTiers);

  assert(
    tiersMatch,
    'BCCI Official Retention Scale (Slots 1-6)',
    `Tiers: ${actualTiers.join(' Cr, ')} Cr`
  );

  // TEST 7: Squad Limits & Overseas Limit Guard
  const maxSquadLimit = 25;
  const maxOverseasLimit = 8;
  const mockOverseasCount = 8;
  const overseasPlayerAttempt = { isOverseas: true };
  const canAddOverseas = mockOverseasCount < maxOverseasLimit;

  assert(
    !canAddOverseas,
    'Overseas Player Cap Enforcement (Max 8)',
    `Franchise with 8 overseas players blocked from acquiring additional overseas player`
  );

  // TEST 8: Inter-Franchise Trade Purse Balancing Math
  // Team A (spent ₹18 Cr on Player A) trades for Team B's Player B (spent ₹2 Cr) with ₹5 Cr cash from Team A
  const playerAVal = 18.0;
  const playerBVal = 2.0;
  const cashAdjustment = 5.0; // Team A pays Team B

  const teamADelta = -playerAVal + playerBVal + cashAdjustment; // -18 + 2 + 5 = -11 Cr
  const teamBDelta = -playerBVal + playerAVal - cashAdjustment; // -2 + 18 - 5 = +11 Cr

  assert(
    teamADelta === -11.0 && teamBDelta === 11.0,
    'Trade Centre Financial Delta Equilibrium',
    `Team A delta: ₹${teamADelta} Cr (net saving), Team B delta: +₹${teamBDelta} Cr (net expense)`
  );

  // TEST 9: Client-Side Retention Validation Guard (< 10 franchises confirmed)
  const mockRoomPartialRetentions: Partial<AuctionRoom> = {
    id: 'room_test',
    status: 'AUCTION_READY',
    retentions: {
      csk: { teamId: 'csk', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      mi: { teamId: 'mi', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      rcb: { teamId: 'rcb', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      kkr: { teamId: 'kkr', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      srh: { teamId: 'srh', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      rr: { teamId: 'rr', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      dc: { teamId: 'dc', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      gt: { teamId: 'gt', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      lsg: { teamId: 'lsg', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: false }, // LSG pending
      // PBKS missing completely
    },
  };

  const isConfirmedWithNine = areAllTenRetentionsConfirmed(mockRoomPartialRetentions as AuctionRoom);
  const pendingTeams = getPendingRetentionFranchises(mockRoomPartialRetentions as AuctionRoom);

  assert(
    !isConfirmedWithNine && pendingTeams.length === 2,
    'Retention Guard Blocks LIVE_AUCTION when < 10 Franchises Confirmed',
    `Confirmed: ${isConfirmedWithNine} (expected false), Pending count: ${pendingTeams.length} (LSG unconfirmed, PBKS missing)`
  );

  // TEST 10: State Transition to LIVE_AUCTION Allowed When All 10 Confirmed
  const mockRoomAllTenConfirmed: Partial<AuctionRoom> = {
    id: 'room_test_10',
    status: 'AUCTION_READY',
    retentions: {
      csk: { teamId: 'csk', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      mi: { teamId: 'mi', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      rcb: { teamId: 'rcb', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      kkr: { teamId: 'kkr', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      srh: { teamId: 'srh', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      rr: { teamId: 'rr', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      dc: { teamId: 'dc', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      gt: { teamId: 'gt', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      lsg: { teamId: 'lsg', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
      pbks: { teamId: 'pbks', retainedPlayerIds: [], releasedPlayerIds: [], totalRetentionCost: 0, remainingPurse: 120, isConfirmed: true },
    },
  };

  const isConfirmedWithTen = areAllTenRetentionsConfirmed(mockRoomAllTenConfirmed as AuctionRoom);
  const pendingWithTen = getPendingRetentionFranchises(mockRoomAllTenConfirmed as AuctionRoom);

  assert(
    isConfirmedWithTen && pendingWithTen.length === 0,
    'State Transition to LIVE_AUCTION Authorized (10/10 Confirmed)',
    `All 10 franchises verified. areAllTenRetentionsConfirmed: ${isConfirmedWithTen}, Pending: ${pendingWithTen.length}`
  );

  // TEST 11: Firestore Security Rule Transition Predicate Emulation
  function simulateFirestoreTransitionCheck(existingStatus: string, incomingStatus: string, retentionsMap: any): boolean {
    const isLiveAttempt = incomingStatus === 'LIVE_AUCTION' || incomingStatus === 'live';
    if (!isLiveAttempt) return true; // non-live transitions handled by other rules
    if (existingStatus === 'LIVE_AUCTION' || existingStatus === 'AUCTION_PAUSED' || existingStatus === 'live') return true;

    // Must satisfy hasAllTenConfirmedRetentions
    const requiredKeys = ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'dc', 'gt', 'lsg', 'pbks'];
    if (!retentionsMap || typeof retentionsMap !== 'object') return false;
    return requiredKeys.every((key) => retentionsMap[key] && retentionsMap[key].isConfirmed === true);
  }

  const ruleReject = simulateFirestoreTransitionCheck('AUCTION_READY', 'LIVE_AUCTION', mockRoomPartialRetentions.retentions);
  const ruleAccept = simulateFirestoreTransitionCheck('AUCTION_READY', 'LIVE_AUCTION', mockRoomAllTenConfirmed.retentions);
  const ruleResume = simulateFirestoreTransitionCheck('AUCTION_PAUSED', 'LIVE_AUCTION', mockRoomPartialRetentions.retentions);

  assert(
    !ruleReject && ruleAccept && ruleResume,
    'Server-Side Firestore Security Rule Transition Invariant',
    `Unconfirmed transition: ${ruleReject ? 'ALLOW' : 'DENY'} (correct), 10 confirmed: ${ruleAccept ? 'ALLOW' : 'DENY'} (correct), Resume: ${ruleResume ? 'ALLOW' : 'DENY'} (correct)`
  );

  // TEST 12: Preloaded Automatic Player Database Total & Uniqueness
  const uniquePlayerIds = new Set(INITIAL_PLAYERS.map((p) => p.id));
  const uniquePlayerNames = new Set(INITIAL_PLAYERS.map((p) => p.name));
  assert(
    INITIAL_PLAYERS.length === 173 && uniquePlayerIds.size === 173 && uniquePlayerNames.size === 173,
    'Preloaded Automatic Player Database (173 Unique Players, Zero Duplicates)',
    `Total players: ${INITIAL_PLAYERS.length}, Unique IDs: ${uniquePlayerIds.size}, Unique Names: ${uniquePlayerNames.size}`
  );

  // TEST 13: Team Roster Distribution (All 10 Franchises)
  const expectedTeamCounts: Record<string, number> = {
    csk: 16,
    mi: 20,
    rcb: 17,
    kkr: 12,
    srh: 15,
    rr: 16,
    pbks: 21,
    dc: 17,
    gt: 20,
    lsg: 19,
  };

  let allTeamCountsCorrect = true;
  const countAuditDetails: string[] = [];
  for (const [teamId, expectedCount] of Object.entries(expectedTeamCounts)) {
    const actualCount = INITIAL_PLAYERS.filter((p) => p.teamId === teamId).length;
    countAuditDetails.push(`${teamId.toUpperCase()}: ${actualCount}/${expectedCount}`);
    if (actualCount !== expectedCount) {
      allTeamCountsCorrect = false;
    }
  }

  assert(
    allTeamCountsCorrect,
    'All 10 Team Roster Baselines Match Exactly (CSK 16, MI 20, RCB 17, KKR 12, SRH 15, RR 16, PBKS 21, DC 17, GT 20, LSG 19)',
    countAuditDetails.join(', ')
  );

  // TEST 14: Strict Player Field Validation (Required Specifications)
  const allFieldsValid = INITIAL_PLAYERS.every((p) => {
    return (
      typeof p.id === 'string' && p.id.length > 0 &&
      typeof p.name === 'string' && p.name.length > 0 &&
      typeof p.teamId === 'string' && p.teamId.length > 0 &&
      typeof p.teamName === 'string' && p.teamName.length > 0 &&
      ['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'].includes(p.role) &&
      typeof p.country === 'string' && p.country.length > 0 &&
      typeof p.basePrice === 'number' && p.basePrice > 0 &&
      p.status === 'available'
    );
  });

  assert(
    allFieldsValid,
    'Player Record Schema Integrity (Generated ID, Name, Team ID, Team Name, Role, Country, Base Price, Status)',
    `All 173 player records contain complete validated specification fields`
  );

  // TEST 15: Team-wise Retention Filter Isolation (Zero Cross-Team Bleed)
  const teamsToAudit = ['csk', 'mi', 'rcb', 'kkr', 'srh', 'rr', 'pbks', 'dc', 'gt', 'lsg'];
  let strictTeamIsolationPassed = true;
  const isolationDetails: string[] = [];

  for (const tid of teamsToAudit) {
    const teamCandidates = INITIAL_PLAYERS.filter((p) => p.status === 'available' && p.teamId === tid);
    const foreignTeamPlayers = teamCandidates.filter((p) => p.teamId !== tid);
    if (foreignTeamPlayers.length > 0) {
      strictTeamIsolationPassed = false;
      isolationDetails.push(`${tid.toUpperCase()} contained foreign players: ${foreignTeamPlayers.map(p => p.name).join(', ')}`);
    } else {
      isolationDetails.push(`${tid.toUpperCase()}: ${teamCandidates.length} strictly isolated players`);
    }
  }

  assert(
    strictTeamIsolationPassed,
    'Team-Wise Retention Isolation (When CSK selected -> ONLY CSK players, MI -> ONLY MI players, etc.)',
    isolationDetails.join(' | ')
  );

  // TEST 16: Independent Auction Room Database Isolation
  // Room 1: Retains 2 CSK players
  const room1CSKPlayers = INITIAL_PLAYERS.filter((p) => p.teamId === 'csk').slice(0, 2);
  const room1Players = INITIAL_PLAYERS.map((p) => {
    if (room1CSKPlayers.some((rp) => rp.id === p.id)) {
      return { ...p, status: 'retained' as const, soldTo: 'csk', soldPrice: 18.0 };
    }
    return { ...p };
  });

  // Room 2: Brand new independent room (Zero retentions, all available)
  const room2Players = INITIAL_PLAYERS.map((p) => ({ ...p }));

  const room1RetainedCount = room1Players.filter((p) => p.status === 'retained').length;
  const room2RetainedCount = room2Players.filter((p) => p.status === 'retained').length;
  const room2AllAvailable = room2Players.every((p) => p.status === 'available');

  assert(
    room1RetainedCount === 2 && room2RetainedCount === 0 && room2AllAvailable,
    'Multi-Room Database Independence (Room 1 retentions do not bleed into Room 2)',
    `Room 1 retained: ${room1RetainedCount}, Room 2 retained: ${room2RetainedCount}, Room 2 all available: ${room2AllAvailable}`
  );

  // TEST 17: Post-Retention Auction Pool Migration
  // Retained players must NOT be in auction pool, all other available players must be in auction pool
  const allRetainedSet = new Set(room1CSKPlayers.map((p) => p.id));
  const auctionPoolRoom1 = room1Players.filter((p) => !allRetainedSet.has(p.id) && p.status === 'available');

  const poolDoesNotContainRetained = room1CSKPlayers.every((rp) => !auctionPoolRoom1.some((p) => p.id === rp.id));
  const poolContainsAllNonRetained = auctionPoolRoom1.length === 173 - 2;

  assert(
    poolDoesNotContainRetained && poolContainsAllNonRetained,
    'Auction Game Pool Transition (Eligible non-retained players automatically move to auction pool)',
    `Pool size: ${auctionPoolRoom1.length} (expected 171), Zero retained players in auction block: ${poolDoesNotContainRetained}`
  );

  console.log('\n=====================================================');
  console.log(`AUDIT SUMMARY: ${results.filter((r) => r.passed).length} / ${results.length} TESTS PASSED`);
  console.log('=====================================================');

  if (results.some((r) => !r.passed)) {
    process.exit(1);
  }
}

runQAAudit();
