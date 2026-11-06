/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { TeamEmblem } from '../../components/TeamEmblem';
import { formatCrores } from '../../data/iplData';
import {
  Gavel,
  Radio,
  Search,
  Filter,
  DollarSign,
  Users,
  Shield,
  Play,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Sparkles,
} from 'lucide-react';

export const AuctionReadyView: React.FC<{ onStartLiveAuction: () => void }> = ({
  onStartLiveAuction,
}) => {
  const {
    activeRoom,
    teams,
    players,
    user,
    setInspectedPlayer,
    areAllTenRetentionsConfirmed,
    confirmedRetentionsCount,
    getPendingRetentionFranchises,
    autoConfirmBotRetentions,
    setWorkflowStep,
  } = useAuction();

  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeRoom) return null;

  const isHost = activeRoom.hostId === user.id;
  const allConfirmed = areAllTenRetentionsConfirmed();
  const pendingTeams = getPendingRetentionFranchises();

  // Filter out any players who were retained
  const allRetainedIds = new Set(
    teams.flatMap((t) => t.retainedPlayers)
  );

  const eligiblePool = useMemo(() => {
    return players.filter((p) => {
      // Must not be retained
      if (allRetainedIds.has(p.id) || p.status === 'retained') return false;

      // Role filter
      if (selectedRole !== 'All' && p.role !== selectedRole) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [players, allRetainedIds, selectedRole, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 text-[#F5F4FF]">
      {/* Retention Verification Status Banner if pending */}
      {!allConfirmed && (
        <div className="p-4 rounded-2xl bg-[#FFB84D]/15 border border-[#FFB84D]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FFB84D] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#FFB84D] block">
                Retention Submission Incomplete ({confirmedRetentionsCount}/10 Confirmed)
              </span>
              <span className="text-[11px] text-[#A5A9C3]">
                Live auction state transition blocked. Pending franchises: {pendingTeams.map((t) => t.code).join(', ')}.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isHost && (
              <button
                onClick={autoConfirmBotRetentions}
                className="px-3.5 py-2 rounded-xl bg-[#FFB84D] text-[#090D1B] font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#ffc970] cursor-pointer shadow-md"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Auto-Confirm Bot Retentions</span>
              </button>
            )}
            <button
              onClick={() => setWorkflowStep('RETENTION_CONFIRMATION')}
              className="px-3.5 py-2 rounded-xl bg-[#171D35] text-[#F5F4FF] border border-[#202944] hover:bg-[#202944] font-semibold text-xs cursor-pointer transition-colors"
            >
              Review Desk
            </button>
          </div>
        </div>
      )}

      {/* Ready Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#11182B] to-[#171D35] border border-[#202944] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D6D0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6D0] mb-2 uppercase tracking-widest">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>
              {allConfirmed
                ? '10/10 RETENTIONS CONFIRMED · AUCTION ARENA ARMED'
                : `AWAITING ${10 - confirmedRetentionsCount} RETENTION DECISION(S)`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading">
            Live Mega Auction Stage Ready
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1 max-w-xl">
            Retained players have been deducted and secured. {eligiblePool.length} eligible cricketers are lined up on the auction block across all categories.
          </p>
        </div>

        {/* Big Start Button */}
        <div className="relative z-10">
          {isHost ? (
            <button
              onClick={onStartLiveAuction}
              disabled={!allConfirmed}
              className={`px-8 py-4 rounded-2xl font-black text-sm tracking-wide shadow-2xl flex items-center gap-3 transition-all ${
                allConfirmed
                  ? 'bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] shadow-[#A78BFA]/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-[#202944] text-[#A5A9C3]/40 cursor-not-allowed opacity-60'
              }`}
            >
              <Gavel className="w-5 h-5 fill-current" />
              <span>
                {allConfirmed ? 'START LIVE MEGA AUCTION' : 'LOCK ALL 10 RETENTIONS TO START'}
              </span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944] text-center shadow-lg">
              <span className="text-xs text-[#00D6D0] font-bold block mb-1">
                Waiting for Auction Host
              </span>
              <span className="text-[11px] text-[#A5A9C3]">
                The auctioneer will call the first player to the stage shortly.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Starting Auction Purses of 10 Franchises */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-3.5 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A5A9C3] font-heading flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#E8BD68]" />
          <span>Active Franchise Bidding Purses for Live Auction</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {teams.map((t) => {
            const available = Number((t.totalPurse - t.spentPurse).toFixed(2));
            return (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-[#090D1B] border border-[#202944] flex items-center gap-2.5 shadow-sm"
              >
                <TeamEmblem code={t.code} size="sm" />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-[#F5F4FF] truncate">{t.code}</span>
                  <span className="text-xs font-mono font-bold text-[#00D6D0] tabular-nums">
                    ₹{available.toFixed(2)} Cr
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FINAL AUCTION PLAYER POOL DISPLAY */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#F5F4FF] font-heading">
              Official Auction Player Pool ({eligiblePool.length} Cricketers)
            </h2>
            <p className="text-xs text-[#A5A9C3]">
              Excludes all retained players. Includes marquee stars, specialized batters, bowlers, keepers, and all-rounders.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A5A9C3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players..."
                className="pl-8 pr-3 py-2 rounded-xl bg-[#090D1B] border border-[#202944] text-[#F5F4FF] outline-none focus:border-[#A78BFA] transition-colors"
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[#090D1B] border border-[#202944] rounded-xl px-3 py-2 text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
            >
              <option value="All">All Categories</option>
              <option value="Batter">Batters</option>
              <option value="Bowler">Bowlers</option>
              <option value="All-Rounder">All-Rounders</option>
              <option value="Wicketkeeper">Wicketkeepers</option>
            </select>
          </div>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {eligiblePool.map((player) => (
            <div
              key={player.id}
              onClick={() => setInspectedPlayer(player)}
              className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-all cursor-pointer flex items-center gap-3 group shadow-sm hover:bg-[#202944]"
            >
              <PlayerAvatar player={player} size="sm" showRoleBadge />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#A5A9C3]">
                  <span className="text-[#E8BD68] font-semibold">{player.role}</span>
                  <span>·</span>
                  <span>{player.country}</span>
                </div>
                <h3 className="text-xs font-bold text-[#F5F4FF] truncate group-hover:text-[#A78BFA]">
                  {player.name}
                </h3>
                <span className="text-[11px] font-mono text-[#F5F4FF] font-semibold block mt-0.5">
                  Base: {formatCrores(player.basePrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
