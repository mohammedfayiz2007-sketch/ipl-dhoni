/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import { Trophy, TrendingUp, DollarSign, Award, Users, Filter, Crown, Medal } from 'lucide-react';

export const AuctionHistoryView: React.FC = () => {
  const { players, teams, setInspectedPlayer } = useAuction();
  const [filterTeam, setFilterTeam] = useState<string>('All');

  // Sold & Retained players
  const acquiredPlayers = players.filter((p) => p.status === 'sold' || p.status === 'retained');

  // Top 5 most expensive buys
  const topBuys = [...acquiredPlayers]
    .filter((p) => p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 5);

  // Filtered roster
  const displayedPlayers = acquiredPlayers.filter((p) => {
    if (filterTeam === 'All') return true;
    return p.soldTo === filterTeam;
  });

  // Calculate team scores to determine projected / current winner
  const rankedTeams = useMemo(() => {
    const list = teams.map((team) => {
      const squad = players.filter(
        (p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)
      );
      const overseasCount = squad.filter((p) => p.isOverseas).length;
      const marqueeCount = squad.filter((p) => p.marquee).length;

      let depthScore = 0;
      if (squad.length >= 22) depthScore = 25;
      else if (squad.length >= 18) depthScore = 22;
      else if (squad.length >= 15) depthScore = 18;
      else if (squad.length >= 10) depthScore = 12;
      else if (squad.length > 0) depthScore = Math.round((squad.length / 18) * 15);

      const batters = squad.filter((p) => p.role === 'Batter').length;
      const bowlers = squad.filter((p) => p.role === 'Bowler').length;
      const allRounders = squad.filter((p) => p.role === 'All-Rounder').length;
      const wicketkeepers = squad.filter((p) => p.role === 'Wicketkeeper').length;

      let balanceScore = 0;
      balanceScore += Math.min(7, Math.round((batters / 4) * 7));
      balanceScore += Math.min(7, Math.round((bowlers / 5) * 7));
      balanceScore += Math.min(6, Math.round((allRounders / 2) * 6));
      balanceScore += Math.min(5, Math.round((wicketkeepers / 1.5) * 5));

      let starScore = Math.min(15, marqueeCount * 5);
      const totalMatches = squad.reduce((acc, p) => acc + (p.iplStats?.matches || 0), 0);
      if (totalMatches >= 300) starScore += 10;
      else if (totalMatches >= 150) starScore += 5;

      let efficiencyScore = 0;
      if (team.spentPurse >= 90.0 && squad.length >= 18) efficiencyScore = 20;
      else if (team.spentPurse >= 75.0) efficiencyScore = 15;
      else if (team.spentPurse > 0) efficiencyScore = 10;

      const totalScore = Math.min(100, depthScore + balanceScore + starScore + efficiencyScore);

      return {
        team,
        squadSize: squad.length,
        overseasCount,
        marqueeCount,
        totalScore,
        spent: team.spentPurse,
        remaining: team.totalPurse - team.spentPurse,
      };
    });

    list.sort((a, b) => b.totalScore - a.totalScore);
    return list;
  }, [teams, players]);

  const leadingTeam = rankedTeams[0];

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] font-heading">
          Auction History & Leaderboards
        </h1>
        <p className="text-sm text-[#A5A9C3] mt-1">
          Historical records, championship standings, and franchise squad financial breakdowns.
        </p>
      </div>

      {/* CURRENT AUCTION LEADER / WINNER BANNER */}
      {leadingTeam && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#202944] to-[#171D35] border-2 border-[#E8BD68]/70 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <TeamEmblem code={leadingTeam.team.code} size="lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E8BD68] text-[#090D1B] flex items-center justify-center font-black text-xs shadow">
                <Crown className="w-3.5 h-3.5 text-[#090D1B]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#E8BD68] uppercase tracking-wider mb-0.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Current Auction Leader & Projected Winner</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F4FF] font-heading">
                {leadingTeam.team.name}
              </h2>
              <span className="text-xs text-[#A5A9C3]">
                Squad: <strong className="text-[#F5F4FF]">{leadingTeam.squadSize}/25</strong> · Marquee Stars: <strong className="text-[#E8BD68]">{leadingTeam.marqueeCount}</strong> · Spent: <strong className="text-[#F5F4FF]">₹{leadingTeam.spent.toFixed(2)} Cr</strong>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#E8BD68]/40 text-center min-w-[130px] shadow-lg">
            <span className="text-[10px] text-[#A5A9C3] uppercase font-black tracking-wider block">
              Squad Rating
            </span>
            <span className="text-3xl font-black font-mono text-[#E8BD68] tabular-nums">
              {leadingTeam.totalScore}
            </span>
            <span className="text-[10px] text-[#A5A9C3] block">/ 100</span>
          </div>
        </div>
      )}

      {/* TOP 5 RECORD SIGNINGS MARQUEE STRIP */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
        <h2 className="text-base font-bold text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#E8BD68]" />
          <span>Top 5 Record Buys of the 2027 Mega Auction</span>
        </h2>

        {topBuys.length === 0 ? (
          <p className="text-xs text-[#A5A9C3] py-6 text-center italic">
            No completed purchases yet. Bid on marquee players in the Live Arena!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {topBuys.map((player, idx) => {
              const team = teams.find((t) => t.id === player.soldTo);
              return (
                <div
                  key={player.id}
                  onClick={() => setInspectedPlayer(player)}
                  className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-all cursor-pointer text-center relative group shadow-sm hover:-translate-y-0.5"
                >
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#E8BD68] text-[#090D1B] font-extrabold text-[10px] flex items-center justify-center font-mono">
                    #{idx + 1}
                  </div>

                  <PlayerAvatar player={player} size="md" className="mx-auto mb-2" />
                  <h3 className="font-extrabold text-[#F5F4FF] text-xs truncate group-hover:text-[#A78BFA] transition-colors">
                    {player.name}
                  </h3>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    {team && <TeamEmblem code={team.code} size="sm" />}
                    <span className="text-xs font-mono font-bold text-[#E8BD68] tabular-nums">
                      {formatCrores(player.soldPrice || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FRANCHISE SPEND & PURSE TABLE */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] overflow-x-auto shadow-xl">
        <h2 className="text-base font-bold text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00D6D0]" />
          <span>Franchise Expenditure Summary</span>
        </h2>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-[#202944] text-[#A5A9C3] font-semibold uppercase tracking-wider">
              <th className="pb-3">Franchise</th>
              <th className="pb-3 text-center">Squad Size</th>
              <th className="pb-3 text-center">Overseas</th>
              <th className="pb-3 text-right">Total Spent</th>
              <th className="pb-3 text-right">Remaining Purse</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#202944] font-mono">
            {teams.map((t) => {
              const remaining = Number((t.totalPurse - t.spentPurse).toFixed(2));
              const squad = players.filter((p) => p.soldTo === t.id || t.retainedPlayers.includes(p.id));
              const overseas = squad.filter((p) => p.isOverseas).length;

              return (
                <tr key={t.id} className="hover:bg-[#202944]/40 transition-colors">
                  <td className="py-3 font-sans font-bold text-[#F5F4FF] flex items-center gap-2">
                    <TeamEmblem code={t.code} size="sm" />
                    <span>{t.name}</span>
                  </td>
                  <td className="py-3 text-center tabular-nums text-[#F5F4FF]">
                    {squad.length} / {t.maxSquad}
                  </td>
                  <td className="py-3 text-center tabular-nums text-[#00D6D0]">
                    {overseas} / {t.maxOverseas}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[#A5A9C3]">
                    ₹{t.spentPurse.toFixed(2)} Cr
                  </td>
                  <td className="py-3 text-right font-bold tabular-nums text-[#00D6D0]">
                    ₹{remaining.toFixed(2)} Cr
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* COMPLETED DRAFT ROSTERS */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
            <Users className="w-4 h-4 text-[#A78BFA]" />
            <span>Acquired Squad Rosters ({displayedPlayers.length} Players)</span>
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A5A9C3]">Filter Team:</span>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="bg-[#090D1B] border border-[#202944] rounded-lg px-2.5 py-1.5 text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
            >
              <option value="All">All 10 Franchises</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {displayedPlayers.length === 0 ? (
          <p className="text-xs text-[#A5A9C3] py-6 text-center italic">
            No players currently assigned under this filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayedPlayers.map((player) => {
              const team = teams.find((t) => t.id === player.soldTo);
              return (
                <div
                  key={player.id}
                  onClick={() => setInspectedPlayer(player)}
                  className="p-3 rounded-2xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-colors cursor-pointer flex items-center gap-3"
                >
                  <PlayerAvatar player={player} size="sm" showRoleBadge />
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-[#F5F4FF] truncate">
                      {player.name}
                    </span>
                    <span className="text-[11px] text-[#A5A9C3] block truncate">
                      {team?.code} · {formatCrores(player.soldPrice || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
