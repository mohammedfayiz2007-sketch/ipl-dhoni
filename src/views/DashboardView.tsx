/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import {
  Gavel,
  Shield,
  Users,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  PlusCircle,
  ArrowLeftRight,
  UserCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    setCurrentTab,
    teams,
    players,
    activities,
    activeRoom,
    user,
    setInspectedPlayer,
  } = useAuction();

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const availableCount = players.filter((p) => p.status === 'available' || p.status === 'live').length;
  const soldCount = players.filter((p) => p.status === 'sold' || p.status === 'retained').length;
  const unsoldCount = players.filter((p) => p.status === 'unsold').length;

  // Highest sold player
  const soldPlayers = players
    .filter((p) => (p.status === 'sold' || p.status === 'retained') && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0));
  const topBuy = soldPlayers[0];

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* Top Banner / Hero Greeting */}
      <div className="relative p-6 lg:p-8 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#202944] to-[#171D35] border border-[#202944] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A5A9C3] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-pulse" />
              <span>BCCI OFFICIAL WAR ROOM · SEASON 2027</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] font-heading">
              Welcome, {user.name}
            </h1>
            <p className="mt-1 text-sm text-[#A5A9C3] max-w-xl">
              Currently commanding{' '}
              <strong className="text-[#E8BD68]">
                {userTeam ? userTeam.name : 'Unassigned Franchise'}
              </strong>{' '}
              with <span className="font-mono text-[#00D6D0] font-bold">₹{userTeam ? (userTeam.totalPurse - userTeam.spentPurse).toFixed(2) : '120.00'} Cr</span> remaining purse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('auction')}
              className="px-5 py-3 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Go to Live Arena</span>
            </button>

            <button
              onClick={() => setCurrentTab('retention')}
              className="px-4 py-3 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#F5F4FF] font-bold text-xs border border-[#202944] hover:border-[#A78BFA]/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-[#E8BD68]" />
              <span>Retention Desk</span>
            </button>

            <button
              onClick={() => setCurrentTab('trade')}
              className="px-4 py-3 rounded-xl bg-[#171D35] hover:bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] font-bold text-xs border border-[#202944] transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#00D6D0]" />
              <span>Trade Centre</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A5A9C3] mb-1">
            <span>Franchises</span>
            <Shield className="w-4 h-4 text-[#00D6D0]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F5F4FF] font-mono tabular-nums">
            {teams.length} Teams
          </div>
          <span className="text-[11px] text-[#A5A9C3] mt-0.5 block">₹1,200 Cr Total Purse</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A5A9C3] mb-1">
            <span>Player Pool Status</span>
            <Users className="w-4 h-4 text-[#20C997]" />
          </div>
          <div className="text-2xl font-extrabold text-[#20C997] font-mono tabular-nums">
            {availableCount} Left
          </div>
          <span className="text-[11px] text-[#A5A9C3] mt-0.5 block">
            {soldCount} Sold / {unsoldCount} Unsold
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A5A9C3] mb-1">
            <span>Active War Room</span>
            <Radio className="w-4 h-4 text-[#FF5C75] animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-[#E8BD68] font-mono uppercase tracking-wider">
            {activeRoom ? activeRoom.code : 'No Room'}
          </div>
          <span className="text-[11px] text-[#00D6D0] mt-0.5 block">
            {activeRoom?.status === 'LIVE_AUCTION' ? 'Bidding in Session' : 'Lobby Ready'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <div className="flex items-center justify-between text-xs text-[#A5A9C3] mb-1">
            <span>Top Acquisition</span>
            <TrendingUp className="w-4 h-4 text-[#E8BD68]" />
          </div>
          {topBuy ? (
            <div>
              <div className="text-lg font-bold text-[#E8BD68] font-heading truncate">
                {topBuy.name}
              </div>
              <span className="text-xs font-mono text-[#F5F4FF] font-bold tabular-nums">
                {formatCrores(topBuy.soldPrice || 0)}
              </span>
            </div>
          ) : (
            <div>
              <div className="text-lg font-bold text-[#A5A9C3]">Marquee M1</div>
              <span className="text-[11px] text-[#A5A9C3]/70">Opening Bids Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* 2-COLUMN SPLIT: TEAMS PURSE OVERVIEW & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 10 Teams Purse & Squad Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E8BD68]" />
              <span>Franchise Purse & Squad Roster</span>
            </h2>
            <button
              onClick={() => setCurrentTab('teams')}
              className="text-xs text-[#A78BFA] hover:text-[#b8a1fb] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All 10 Franchises</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((team) => {
              const remaining = Number((team.totalPurse - team.spentPurse).toFixed(2));
              const pctSpent = Math.min(100, Math.round((team.spentPurse / team.totalPurse) * 100));
              const squadCount = players.filter((p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)).length;
              const isUser = team.id === user.selectedTeamId;

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-2xl bg-[#171D35] border transition-all ${
                    isUser
                      ? 'border-[#A78BFA] ring-1 ring-[#A78BFA]/30 shadow-lg bg-[#202944]'
                      : 'border-[#202944] hover:border-[#A78BFA]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <TeamEmblem code={team.code} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-[#F5F4FF] flex items-center gap-1">
                          {team.name}
                          {isUser && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#A78BFA] text-[#090D1B] rounded font-extrabold">
                              YOU
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-[#A5A9C3]">
                          Squad: {squadCount} / {team.maxSquad} (Min {team.minSquad})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#00D6D0] tabular-nums block">
                        ₹{remaining.toFixed(2)} Cr
                      </span>
                      <span className="text-[10px] text-[#A5A9C3] font-mono">
                        Spent: ₹{team.spentPurse.toFixed(2)} Cr
                      </span>
                    </div>
                  </div>

                  {/* Purse progress bar */}
                  <div className="w-full bg-[#090D1B] rounded-full h-1.5 overflow-hidden border border-[#202944]">
                    <div
                      className="bg-gradient-to-r from-[#A78BFA] to-[#00D6D0] h-full rounded-full transition-all"
                      style={{ width: `${pctSpent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Activity Stream (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00D6D0]" />
              <span>War Room Feed</span>
            </h2>
            <span className="text-[11px] text-[#A5A9C3]">Real-time Log</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] space-y-3 max-h-[500px] overflow-y-auto shadow-xl">
            {activities.length === 0 ? (
              <p className="text-xs text-[#A5A9C3] text-center py-4">No recent activity</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="text-xs pb-3 border-b border-[#202944] last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[#A5A9C3] text-[10px] mb-1">
                    <span
                      className={`font-bold uppercase tracking-wider ${
                        act.type === 'sold'
                          ? 'text-[#20C997]'
                          : act.type === 'bid'
                          ? 'text-[#E8BD68]'
                          : act.type === 'retention'
                          ? 'text-[#A78BFA]'
                          : 'text-[#A5A9C3]'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                  <p className="text-[#F5F4FF] leading-snug">{act.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
