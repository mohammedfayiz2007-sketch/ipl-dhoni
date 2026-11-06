/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { IPLTeam, Player } from '../../types/auction';
import { TeamEmblem } from '../../components/TeamEmblem';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { formatCrores } from '../../data/iplData';
import {
  Trophy,
  TrendingUp,
  Users,
  Shield,
  RotateCcw,
  Award,
  Mail,
  Crown,
  Medal,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Zap,
  Flame,
  Target,
  ChevronRight,
} from 'lucide-react';

interface TeamAuctionScore {
  team: IPLTeam;
  squad: Player[];
  squadSize: number;
  overseasCount: number;
  marqueeCount: number;
  totalSpent: number;
  remainingPurse: number;
  roleCounts: {
    batters: number;
    bowlers: number;
    allRounders: number;
    wicketkeepers: number;
  };
  scores: {
    depthScore: number;
    balanceScore: number;
    starScore: number;
    efficiencyScore: number;
    totalScore: number;
  };
  totalRuns: number;
  totalWickets: number;
}

export const AuctionResultsView: React.FC = () => {
  const { teams, players, user, setInspectedPlayer, resetAuctionData, setIsGmailModalOpen } = useAuction();
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('csk');

  // Compute Squad Scores & Rank All 10 Franchises
  const rankedTeams: TeamAuctionScore[] = useMemo(() => {
    const list: TeamAuctionScore[] = teams.map((team) => {
      const squad = players.filter(
        (p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)
      );

      const overseasCount = squad.filter((p) => p.isOverseas).length;
      const marqueeCount = squad.filter((p) => p.marquee).length;

      const batters = squad.filter((p) => p.role === 'Batter');
      const bowlers = squad.filter((p) => p.role === 'Bowler');
      const allRounders = squad.filter((p) => p.role === 'All-Rounder');
      const wicketkeepers = squad.filter((p) => p.role === 'Wicketkeeper');

      // 1. Depth Score (0-25): Target 18-25 players
      let depthScore = 0;
      if (squad.length >= 22) depthScore = 25;
      else if (squad.length >= 18) depthScore = 22;
      else if (squad.length >= 15) depthScore = 18;
      else if (squad.length >= 10) depthScore = 12;
      else if (squad.length > 0) depthScore = Math.round((squad.length / 18) * 15);

      if (overseasCount > 8) depthScore = Math.max(0, depthScore - 5);

      // 2. Balance Score (0-25): Needs batters >= 4, bowlers >= 5, all-rounders >= 2, keepers >= 1
      let balanceScore = 0;
      balanceScore += Math.min(7, Math.round((batters.length / 4) * 7));
      balanceScore += Math.min(7, Math.round((bowlers.length / 5) * 7));
      balanceScore += Math.min(6, Math.round((allRounders.length / 2) * 6));
      balanceScore += Math.min(5, Math.round((wicketkeepers.length / 1.5) * 5));
      balanceScore = Math.min(25, balanceScore);

      // 3. Star Power Score (0-30): Marquee superstars & high T20 figures
      let starScore = 0;
      starScore += Math.min(15, marqueeCount * 5);

      const totalRuns = batters.reduce((acc, p) => acc + (p.iplStats?.runs || 0), 0);
      const totalWickets = bowlers.reduce((acc, p) => acc + (p.iplStats?.wickets || 0), 0);
      const totalMatches = squad.reduce((acc, p) => acc + (p.iplStats?.matches || 0), 0);

      if (totalMatches >= 300) starScore += 5;
      else if (totalMatches >= 150) starScore += 3;

      if (totalRuns >= 2000) starScore += 5;
      else if (totalRuns >= 1000) starScore += 3;

      if (totalWickets >= 100) starScore += 5;
      else if (totalWickets >= 50) starScore += 3;

      starScore = Math.min(30, starScore);

      // 4. Financial Efficiency Score (0-20): 75% minimum spend (₹90 Cr)
      let efficiencyScore = 0;
      const spent = team.spentPurse;
      const remaining = team.totalPurse - spent;

      if (spent >= 90.0 && spent <= 119.5 && squad.length >= 18) {
        efficiencyScore = 20;
      } else if (spent >= 75.0 && squad.length >= 15) {
        efficiencyScore = 16;
      } else if (spent >= 50.0) {
        efficiencyScore = 12;
      } else if (spent > 0) {
        efficiencyScore = 8;
      } else {
        efficiencyScore = 5;
      }

      const totalScore = Math.min(100, Math.max(0, depthScore + balanceScore + starScore + efficiencyScore));

      return {
        team,
        squad,
        squadSize: squad.length,
        overseasCount,
        marqueeCount,
        totalSpent: spent,
        remainingPurse: remaining,
        roleCounts: {
          batters: batters.length,
          bowlers: bowlers.length,
          allRounders: allRounders.length,
          wicketkeepers: wicketkeepers.length,
        },
        scores: {
          depthScore,
          balanceScore,
          starScore,
          efficiencyScore,
          totalScore,
        },
        totalRuns,
        totalWickets,
      };
    });

    list.sort((a, b) => {
      if (b.scores.totalScore !== a.scores.totalScore) {
        return b.scores.totalScore - a.scores.totalScore;
      }
      if (b.marqueeCount !== a.marqueeCount) {
        return b.marqueeCount - a.marqueeCount;
      }
      if (b.squadSize !== a.squadSize) {
        return b.squadSize - a.squadSize;
      }
      return b.remainingPurse - a.remainingPurse;
    });

    return list;
  }, [teams, players]);

  // Champions & Podium
  const winner = rankedTeams[0];
  const runnerUp = rankedTeams[1];
  const thirdPlace = rankedTeams[2];

  // User's performance
  const userRankIndex = rankedTeams.findIndex((rt) => rt.team.id === user.selectedTeamId);
  const userRanking = userRankIndex >= 0 ? rankedTeams[userRankIndex] : null;
  const isUserWinner = userRankIndex === 0;

  // Selected franchise for roster inspection
  const selectedTeamData = rankedTeams.find((rt) => rt.team.id === selectedFranchiseId) || rankedTeams[0];

  // Top marquee buy (Golden Gavel Award)
  const topBuys = players
    .filter((p) => (p.status === 'sold' || p.status === 'retained') && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 5);
  const goldenGavelPlayer = topBuys[0] || null;
  const goldenGavelTeam = goldenGavelPlayer ? teams.find((t) => t.id === goldenGavelPlayer.soldTo) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 text-[#F5F4FF]">
      {/* 1. GRAND CHAMPION / WINNER SHOWCASE BANNER */}
      {winner && (
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#202944] to-[#171D35] border-2 border-[#E8BD68] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#E8BD68]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative">
                <TeamEmblem code={winner.team.code} size="xl" className="shadow-2xl" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#E8BD68] text-[#090D1B] flex items-center justify-center shadow-lg font-black text-sm">
                  <Crown className="w-5 h-5 text-[#090D1B]" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8BD68]/20 border border-[#E8BD68] text-[#E8BD68] text-xs font-black tracking-widest uppercase mb-2">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>2027 AUCTION WINNER & CHAMPIONS</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F5F4FF] font-heading tracking-tight">
                  {winner.team.name}
                </h1>

                <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1 max-w-xl">
                  Crowned #1 Champion Franchise with an exceptional squad rating of{' '}
                  <strong className="text-[#E8BD68] font-mono">{winner.scores.totalScore}/100</strong>, featuring{' '}
                  <strong className="text-[#F5F4FF]">{winner.squadSize} players</strong> and{' '}
                  <strong className="text-[#00D6D0]">{winner.marqueeCount} marquee stars</strong>.
                </p>

                {/* User Congratulations / Status */}
                {isUserWinner ? (
                  <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#20C997]/20 border border-[#20C997] text-[#20C997] text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONGRATULATIONS! You led this franchise to victory as Director!</span>
                  </div>
                ) : userRanking ? (
                  <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090D1B] border border-[#202944] text-[#A5A9C3] text-xs">
                    <span>Your franchise ({userRanking.team.code}) finished</span>
                    <strong className="text-[#E8BD68] font-mono font-bold">
                      #{userRankIndex + 1} of 10
                    </strong>
                    <span>with a {userRanking.scores.totalScore}/100 squad rating.</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Score Trophy Badge */}
            <div className="p-5 rounded-3xl bg-[#090D1B]/95 border border-[#E8BD68]/40 text-center min-w-[180px] shadow-2xl">
              <span className="text-[10px] text-[#A5A9C3] uppercase font-black tracking-wider block mb-1">
                Winning Score
              </span>
              <div className="text-5xl font-black font-mono text-[#E8BD68] tabular-nums tracking-tight">
                {winner.scores.totalScore}
              </div>
              <span className="text-[11px] text-[#A5A9C3] font-bold block mt-0.5">
                out of 100
              </span>

              <div className="mt-3 pt-2.5 border-t border-[#202944] text-[10px] text-[#A5A9C3] space-y-0.5">
                <div className="flex justify-between">
                  <span>Depth:</span>
                  <strong className="text-[#F5F4FF] font-mono">{winner.scores.depthScore}/25</strong>
                </div>
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <strong className="text-[#F5F4FF] font-mono">{winner.scores.balanceScore}/25</strong>
                </div>
                <div className="flex justify-between">
                  <span>Star Power:</span>
                  <strong className="text-[#F5F4FF] font-mono">{winner.scores.starScore}/30</strong>
                </div>
                <div className="flex justify-between">
                  <span>Purse Mgmt:</span>
                  <strong className="text-[#F5F4FF] font-mono">{winner.scores.efficiencyScore}/20</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-5 border-t border-[#202944] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#A5A9C3]">
              Official BCCI certified auction ledger compiled for all 10 franchises.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsGmailModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#FF5C75] hover:bg-[#e04860] text-white font-extrabold text-xs shadow-lg shadow-[#FF5C75]/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email Certified Ledger via Gmail</span>
              </button>

              <button
                onClick={resetAuctionData}
                className="px-5 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start New Mega Auction Cycle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP 3 PODIUM STANDINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Runner-Up (#2) */}
        {runnerUp && (
          <div
            onClick={() => setSelectedFranchiseId(runnerUp.team.id)}
            className="p-5 rounded-3xl bg-[#171D35] border border-[#202944] hover:border-[#A5A9C3] transition-all cursor-pointer relative flex flex-col justify-between shadow-xl order-2 md:order-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#A5A9C3]/20 text-[#A5A9C3] font-mono font-black text-xs flex items-center gap-1.5">
                  <Medal className="w-3.5 h-3.5 text-[#A5A9C3]" />
                  <span>#2 RUNNER-UP</span>
                </span>
                <span className="font-mono font-black text-xl text-[#A5A9C3]">
                  {runnerUp.scores.totalScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <TeamEmblem code={runnerUp.team.code} size="lg" />
                <div>
                  <h3 className="font-extrabold text-[#F5F4FF] text-base font-heading">
                    {runnerUp.team.name}
                  </h3>
                  <span className="text-xs text-[#A5A9C3] font-mono">
                    Squad: {runnerUp.squadSize}/25 · Spent: ₹{runnerUp.totalSpent.toFixed(2)} Cr
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#202944] flex items-center justify-between text-xs text-[#A5A9C3]">
              <span>Overseas: {runnerUp.overseasCount}/8</span>
              <span className="text-[#A78BFA] font-semibold hover:underline">Inspect Squad →</span>
            </div>
          </div>
        )}

        {/* 1st Place Champion (#1) */}
        {winner && (
          <div
            onClick={() => setSelectedFranchiseId(winner.team.id)}
            className="p-6 rounded-3xl bg-gradient-to-b from-[#202944] to-[#171D35] border-2 border-[#E8BD68] ring-2 ring-[#E8BD68]/30 shadow-2xl relative flex flex-col justify-between order-1 md:order-2 md:-translate-y-2 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-[#E8BD68] text-[#090D1B] font-black text-xs flex items-center gap-1.5 shadow-md">
                  <Crown className="w-4 h-4 text-[#090D1B]" />
                  <span>#1 AUCTION CHAMPION</span>
                </span>
                <span className="font-mono font-black text-2xl text-[#E8BD68]">
                  {winner.scores.totalScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-4">
                <TeamEmblem code={winner.team.code} size="xl" />
                <div>
                  <h3 className="font-black text-[#F5F4FF] text-lg font-heading">
                    {winner.team.name}
                  </h3>
                  <span className="text-xs text-[#A5A9C3] font-mono">
                    Squad: {winner.squadSize}/25 · {winner.marqueeCount} Marquee Superstars
                  </span>
                  <span className="block text-[11px] text-[#00D6D0] font-mono mt-0.5">
                    Remaining: ₹{winner.remainingPurse.toFixed(2)} Cr
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8BD68]/30 flex items-center justify-between text-xs">
              <span className="text-[#A5A9C3]">Spent: ₹{winner.totalSpent.toFixed(2)} Cr</span>
              <span className="text-[#E8BD68] font-black hover:underline">View Champion Squad →</span>
            </div>
          </div>
        )}

        {/* 2nd Runner-Up (#3) */}
        {thirdPlace && (
          <div
            onClick={() => setSelectedFranchiseId(thirdPlace.team.id)}
            className="p-5 rounded-3xl bg-[#171D35] border border-[#202944] hover:border-[#CD7F32] transition-all cursor-pointer relative flex flex-col justify-between shadow-xl order-3"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-amber-700/20 text-amber-400 font-mono font-black text-xs flex items-center gap-1.5">
                  <Medal className="w-3.5 h-3.5 text-amber-400" />
                  <span>#3 2ND RUNNER-UP</span>
                </span>
                <span className="font-mono font-black text-xl text-amber-300">
                  {thirdPlace.scores.totalScore} pts
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <TeamEmblem code={thirdPlace.team.code} size="lg" />
                <div>
                  <h3 className="font-extrabold text-[#F5F4FF] text-base font-heading">
                    {thirdPlace.team.name}
                  </h3>
                  <span className="text-xs text-[#A5A9C3] font-mono">
                    Squad: {thirdPlace.squadSize}/25 · Spent: ₹{thirdPlace.totalSpent.toFixed(2)} Cr
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#202944] flex items-center justify-between text-xs text-[#A5A9C3]">
              <span>Overseas: {thirdPlace.overseasCount}/8</span>
              <span className="text-[#A78BFA] font-semibold hover:underline">Inspect Squad →</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. SPECIAL AUCTION AWARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Golden Gavel Award (Record Buy) */}
        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] space-y-2 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E8BD68]">
            <Award className="w-4 h-4" />
            <span>GOLDEN GAVEL (RECORD BUY)</span>
          </div>
          {goldenGavelPlayer ? (
            <div
              onClick={() => setInspectedPlayer(goldenGavelPlayer)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <PlayerAvatar player={goldenGavelPlayer} size="sm" showRoleBadge />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-[#F5F4FF] truncate group-hover:text-[#A78BFA]">
                  {goldenGavelPlayer.name}
                </span>
                <span className="text-sm font-extrabold font-mono text-[#E8BD68] block">
                  {formatCrores(goldenGavelPlayer.soldPrice || 0)}
                </span>
                <span className="text-[10px] text-[#A5A9C3] flex items-center gap-1">
                  <span>Sold to</span>
                  {goldenGavelTeam && <TeamEmblem code={goldenGavelTeam.code} size="xs" />}
                  <strong className="text-[#F5F4FF]">{goldenGavelTeam?.code || 'N/A'}</strong>
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-[#A5A9C3] italic">No auction buys recorded yet</span>
          )}
        </div>

        {/* Batting Powerhouse */}
        {(() => {
          const bestBatting = [...rankedTeams].sort((a, b) => b.totalRuns - a.totalRuns)[0];
          return (
            <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] space-y-2 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFB84D]">
                <Flame className="w-4 h-4" />
                <span>BATTING POWERHOUSE</span>
              </div>
              {bestBatting && (
                <div
                  onClick={() => setSelectedFranchiseId(bestBatting.team.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <TeamEmblem code={bestBatting.team.code} size="md" />
                  <div>
                    <span className="block text-xs font-bold text-[#F5F4FF] group-hover:text-[#A78BFA]">
                      {bestBatting.team.name}
                    </span>
                    <span className="text-xs font-mono text-[#FFB84D] font-bold block">
                      {bestBatting.roleCounts.batters} Batters · {bestBatting.totalRuns} Career Runs
                    </span>
                    <span className="text-[10px] text-[#A5A9C3]">Highest aggregate runs in pool</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Bowling Fortress */}
        {(() => {
          const bestBowling = [...rankedTeams].sort((a, b) => b.totalWickets - a.totalWickets)[0];
          return (
            <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] space-y-2 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00D6D0]">
                <Target className="w-4 h-4" />
                <span>BOWLING FORTRESS</span>
              </div>
              {bestBowling && (
                <div
                  onClick={() => setSelectedFranchiseId(bestBowling.team.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <TeamEmblem code={bestBowling.team.code} size="md" />
                  <div>
                    <span className="block text-xs font-bold text-[#F5F4FF] group-hover:text-[#A78BFA]">
                      {bestBowling.team.name}
                    </span>
                    <span className="text-xs font-mono text-[#00D6D0] font-bold block">
                      {bestBowling.roleCounts.bowlers} Bowlers · {bestBowling.totalWickets} Wickets
                    </span>
                    <span className="text-[10px] text-[#A5A9C3]">Most lethal bowling unit</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Financial Mastermind (Moneyball) */}
        {(() => {
          const bestPurse = [...rankedTeams]
            .filter((rt) => rt.squadSize >= 18)
            .sort((a, b) => b.remainingPurse - a.remainingPurse)[0] || rankedTeams[0];
          return (
            <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] space-y-2 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-[#20C997]">
                <Zap className="w-4 h-4" />
                <span>MONEYBALL EFFICIENCY</span>
              </div>
              {bestPurse && (
                <div
                  onClick={() => setSelectedFranchiseId(bestPurse.team.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <TeamEmblem code={bestPurse.team.code} size="md" />
                  <div>
                    <span className="block text-xs font-bold text-[#F5F4FF] group-hover:text-[#A78BFA]">
                      {bestPurse.team.name}
                    </span>
                    <span className="text-xs font-mono text-[#20C997] font-bold block">
                      ₹{bestPurse.remainingPurse.toFixed(2)} Cr Reserve
                    </span>
                    <span className="text-[10px] text-[#A5A9C3]">
                      Full {bestPurse.squadSize} players squad with savings
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 4. COMPLETE 10-FRANCHISE STANDINGS TABLE */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#F5F4FF] font-heading flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#E8BD68]" />
              <span>Official 2027 Mega Auction Leaderboard & Standings</span>
            </h2>
            <p className="text-xs text-[#A5A9C3] mt-0.5">
              Comprehensive ranking based on squad completeness (25 pts), balance (25 pts), star quality (30 pts), and financial management (20 pts).
            </p>
          </div>
          <span className="text-xs font-mono text-[#A5A9C3]">10 Franchises</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#202944] text-[#A5A9C3] font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">Rank & Franchise</th>
                <th className="pb-3 text-center">Score</th>
                <th className="pb-3 text-center">Squad</th>
                <th className="pb-3 text-center">Overseas</th>
                <th className="pb-3 text-center">Bat / Bowl / AR / WK</th>
                <th className="pb-3 text-right">Spent</th>
                <th className="pb-3 text-right">Purse Left</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202944]">
              {rankedTeams.map((entry, idx) => {
                const isSelected = selectedFranchiseId === entry.team.id;
                const isUser = user.selectedTeamId === entry.team.id;

                return (
                  <tr
                    key={entry.team.id}
                    className={`transition-colors hover:bg-[#202944]/50 ${
                      isSelected ? 'bg-[#202944]' : ''
                    } ${idx === 0 ? 'bg-[#E8BD68]/5' : ''}`}
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full font-mono font-black text-xs flex items-center justify-center ${
                            idx === 0
                              ? 'bg-[#E8BD68] text-[#090D1B]'
                              : idx === 1
                              ? 'bg-[#A5A9C3] text-[#090D1B]'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-[#090D1B] text-[#A5A9C3] border border-[#202944]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <TeamEmblem code={entry.team.code} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[#F5F4FF]">{entry.team.name}</span>
                            {isUser && (
                              <span className="text-[9px] bg-[#A78BFA] text-[#090D1B] font-black px-1.5 py-0.2 rounded">
                                YOU
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="text-[9px] bg-[#E8BD68]/20 border border-[#E8BD68] text-[#E8BD68] font-black px-1.5 py-0.2 rounded uppercase">
                                WINNER
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#A5A9C3] font-mono">
                            {entry.team.code} · {entry.team.city}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <span className="font-black font-mono text-sm text-[#E8BD68] tabular-nums">
                        {entry.scores.totalScore}
                      </span>
                      <span className="text-[10px] text-[#A5A9C3] block">/ 100</span>
                    </td>

                    <td className="py-3 text-center font-mono font-bold text-[#F5F4FF]">
                      {entry.squadSize} / 25
                    </td>

                    <td className="py-3 text-center font-mono text-[#00D6D0] font-bold">
                      {entry.overseasCount} / 8
                    </td>

                    <td className="py-3 text-center font-mono text-[11px] text-[#A5A9C3]">
                      {entry.roleCounts.batters}B · {entry.roleCounts.bowlers}W · {entry.roleCounts.allRounders}AR · {entry.roleCounts.wicketkeepers}WK
                    </td>

                    <td className="py-3 text-right font-mono text-[#F5F4FF]">
                      ₹{entry.totalSpent.toFixed(2)} Cr
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-[#00D6D0] tabular-nums">
                      ₹{entry.remainingPurse.toFixed(2)} Cr
                    </td>

                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => setSelectedFranchiseId(entry.team.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#A78BFA] text-[#090D1B]'
                            : 'bg-[#090D1B] hover:bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] border border-[#202944]'
                        }`}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TOP 5 EXPENSIVE SIGNINGS */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#E8BD68]" />
          <span>Top 5 Record Acquisitions of the 2027 Mega Auction</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {topBuys.map((player, idx) => {
            const team = teams.find((t) => t.id === player.soldTo);
            return (
              <div
                key={player.id}
                onClick={() => setInspectedPlayer(player)}
                className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-colors cursor-pointer text-center relative group"
              >
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#E8BD68] text-[#090D1B] font-extrabold text-[10px] flex items-center justify-center font-mono">
                  #{idx + 1}
                </div>
                <PlayerAvatar player={player} size="md" className="mx-auto mb-2" />
                <h3 className="text-xs font-bold text-[#F5F4FF] truncate group-hover:text-[#A78BFA]">
                  {player.name}
                </h3>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {team && <TeamEmblem code={team.code} size="xs" />}
                  <span className="text-xs font-mono font-bold text-[#E8BD68] tabular-nums">
                    {formatCrores(player.soldPrice || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. COMPLETE SQUAD ROSTER INSPECTOR */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#F5F4FF] font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E8BD68]" />
              <span>Franchise Squad Roster Inspector</span>
            </h2>
            <p className="text-xs text-[#A5A9C3] mt-0.5">
              Review full player details, roles, base prices, and final prices for any franchise.
            </p>
          </div>

          {/* Franchise Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedFranchiseId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFranchiseId === t.id
                    ? 'bg-[#A78BFA] text-[#090D1B] shadow-md font-extrabold'
                    : 'bg-[#090D1B] text-[#A5A9C3] hover:text-[#F5F4FF] border border-[#202944]'
                }`}
              >
                {t.code}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Franchise Summary Strip */}
        <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TeamEmblem code={selectedTeamData.team.code} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F5F4FF] font-heading">
                  {selectedTeamData.team.name}
                </h3>
                {selectedTeamData.team.id === winner?.team.id && (
                  <span className="text-[9px] bg-[#E8BD68] text-[#090D1B] font-black px-1.5 py-0.2 rounded uppercase">
                    🏆 2027 WINNER
                  </span>
                )}
              </div>
              <span className="text-xs text-[#A5A9C3]">
                Squad: <strong className="text-[#F5F4FF]">{selectedTeamData.squadSize} / 25</strong> · Overseas:{' '}
                <strong className="text-[#00D6D0]">{selectedTeamData.overseasCount} / 8</strong> · Score:{' '}
                <strong className="text-[#E8BD68] font-mono">{selectedTeamData.scores.totalScore} pts</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#A5A9C3] block uppercase">Spent</span>
              <span className="font-bold text-[#F5F4FF] tabular-nums">
                ₹{selectedTeamData.totalSpent.toFixed(2)} Cr
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#A5A9C3] block uppercase">Remaining Purse</span>
              <span className="font-bold text-[#00D6D0] tabular-nums">
                ₹{selectedTeamData.remainingPurse.toFixed(2)} Cr
              </span>
            </div>
          </div>
        </div>

        {/* Player Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedTeamData.squad.map((player) => (
            <div
              key={player.id}
              onClick={() => setInspectedPlayer(player)}
              className="p-3 rounded-2xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <PlayerAvatar player={player} size="sm" showRoleBadge />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#F5F4FF] truncate group-hover:text-[#A78BFA]">
                    {player.name}
                  </span>
                  <span className="text-[11px] text-[#A5A9C3]">
                    {player.role} · {player.country}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-[#E8BD68] tabular-nums block">
                  {formatCrores(player.soldPrice || player.basePrice)}
                </span>
                <span className="text-[9px] font-mono text-[#A5A9C3] uppercase">
                  {selectedTeamData.team.retainedPlayers.includes(player.id) ? 'Retained' : 'Auction Buy'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
