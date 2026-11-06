/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { PlayerAvatar } from './PlayerAvatar';
import { TeamEmblem } from './TeamEmblem';
import { X, Trophy, TrendingUp, DollarSign, Award, ArrowUpRight } from 'lucide-react';
import { formatCrores } from '../data/iplData';

export const PlayerDetailModal: React.FC = () => {
  const {
    inspectedPlayer,
    setInspectedPlayer,
    teams,
    setCurrentTab,
    goToPlayerIndex,
    players,
  } = useAuction();

  if (!inspectedPlayer) return null;

  const currentSoldTeam = inspectedPlayer.soldTo
    ? teams.find((t) => t.id === inspectedPlayer.soldTo)
    : null;

  const handleStartBiddingForThisPlayer = () => {
    // Find index in available players
    const availablePlayers = players.filter((p) => p.status === 'available' || p.status === 'live');
    const idx = availablePlayers.findIndex((p) => p.id === inspectedPlayer.id);
    if (idx !== -1) {
      goToPlayerIndex(idx);
    }
    setCurrentTab('auction');
    setInspectedPlayer(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#090D1B] border border-[#202944] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#F5F4FF]">
        {/* Header / Hero Section */}
        <div className="relative p-6 bg-gradient-to-r from-[#171D35] via-[#202944] to-[#171D35] border-b border-[#202944]">
          <button
            onClick={() => setInspectedPlayer(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#090D1B]/70 hover:bg-[#090D1B] text-[#A5A9C3] hover:text-[#F5F4FF] border border-[#202944] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <PlayerAvatar player={inspectedPlayer} size="xl" showRoleBadge className="ring-2 ring-[#202944]" />

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5 text-xs">
                <span className="text-[#E8BD68] font-bold">{inspectedPlayer.role}</span>
                <span className="text-[#A5A9C3]">·</span>
                <span className="text-[#F5F4FF]">{inspectedPlayer.country}</span>
                <span className="text-[#A5A9C3]">·</span>
                <span className="text-[#A5A9C3]">Set {inspectedPlayer.set}</span>
                {inspectedPlayer.isOverseas && (
                  <>
                    <span className="text-[#A5A9C3]">·</span>
                    <span className="text-[#00D6D0] font-semibold">Overseas Player</span>
                  </>
                )}
              </div>

              <h2 id="player-modal-title" className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] tracking-tight font-heading">
                {inspectedPlayer.name}
              </h2>

              <div className="mt-2 text-xs text-[#A5A9C3] flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span>🏏 {inspectedPlayer.battingStyle}</span>
                {inspectedPlayer.bowlingStyle && (
                  <span>🎯 {inspectedPlayer.bowlingStyle}</span>
                )}
                {inspectedPlayer.previousTeam && (
                  <span>Prev Franchise: <strong className="text-[#E8BD68]">{inspectedPlayer.previousTeam}</strong></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status & Valuation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944]">
              <span className="text-[11px] text-[#A5A9C3] block mb-0.5">Base Price</span>
              <span className="text-lg font-bold font-mono text-[#00D6D0] tabular-nums">
                {formatCrores(inspectedPlayer.basePrice)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944]">
              <span className="text-[11px] text-[#A5A9C3] block mb-0.5">Auction Status</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    inspectedPlayer.status === 'sold'
                      ? 'bg-[#20C997]'
                      : inspectedPlayer.status === 'retained'
                      ? 'bg-[#00D6D0]'
                      : inspectedPlayer.status === 'unsold'
                      ? 'bg-[#FF5C75]'
                      : 'bg-[#A78BFA]'
                  }`}
                />
                <span className="text-sm font-bold uppercase tracking-wider text-[#F5F4FF]">
                  {inspectedPlayer.status}
                </span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#171D35] border border-[#202944]">
              <span className="text-[11px] text-[#A5A9C3] block mb-0.5">Assigned Franchise</span>
              {currentSoldTeam ? (
                <div className="flex items-center gap-2 mt-1">
                  <TeamEmblem code={currentSoldTeam.code} size="sm" />
                  <span className="text-xs font-bold text-[#F5F4FF] truncate">
                    {currentSoldTeam.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium text-[#A5A9C3] mt-1 block">Available in Pool</span>
              )}
            </div>
          </div>

          {/* Career T20 & IPL Stats Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5A9C3] mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#E8BD68]" />
              <span>Career IPL Performance Metrics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                <span className="text-xs text-[#A5A9C3] block">Matches</span>
                <span className="text-xl font-bold font-mono text-[#F5F4FF] tabular-nums">
                  {inspectedPlayer.iplStats.matches}
                </span>
              </div>

              {inspectedPlayer.iplStats.runs !== undefined && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Total Runs</span>
                  <span className="text-xl font-bold font-mono text-[#F5F4FF] tabular-nums">
                    {inspectedPlayer.iplStats.runs.toLocaleString()}
                  </span>
                </div>
              )}

              {inspectedPlayer.iplStats.strikeRate !== undefined && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Strike Rate</span>
                  <span className="text-xl font-bold font-mono text-[#00D6D0] tabular-nums">
                    {inspectedPlayer.iplStats.strikeRate}
                  </span>
                </div>
              )}

              {inspectedPlayer.iplStats.average !== undefined && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Batting Avg</span>
                  <span className="text-xl font-bold font-mono text-[#F5F4FF] tabular-nums">
                    {inspectedPlayer.iplStats.average}
                  </span>
                </div>
              )}

              {inspectedPlayer.iplStats.wickets !== undefined && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Wickets</span>
                  <span className="text-xl font-bold font-mono text-[#F5F4FF] tabular-nums">
                    {inspectedPlayer.iplStats.wickets}
                  </span>
                </div>
              )}

              {inspectedPlayer.iplStats.economy !== undefined && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Economy</span>
                  <span className="text-xl font-bold font-mono text-[#A78BFA] tabular-nums">
                    {inspectedPlayer.iplStats.economy}
                  </span>
                </div>
              )}

              {inspectedPlayer.iplStats.highScore && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Highest Score</span>
                  <span className="text-xl font-bold font-mono text-[#E8BD68] tabular-nums">
                    {inspectedPlayer.iplStats.highScore}
                  </span>
                </div>
              )}

              {inspectedPlayer.iplStats.bestBowling && (
                <div className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] text-center">
                  <span className="text-xs text-[#A5A9C3] block">Best Bowling</span>
                  <span className="text-xl font-bold font-mono text-[#20C997] tabular-nums">
                    {inspectedPlayer.iplStats.bestBowling}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form & Scouting Report */}
          {inspectedPlayer.iplStats.performance2026 && (
            <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E8BD68] block mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Recent Form & Scouting Report</span>
              </span>
              <p className="text-sm text-[#A5A9C3] leading-relaxed">
                {inspectedPlayer.iplStats.performance2026}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#11182B] border-t border-[#202944] flex items-center justify-between gap-3">
          <button
            onClick={() => setInspectedPlayer(null)}
            className="px-4 py-2.5 text-xs font-semibold text-[#A5A9C3] hover:text-[#F5F4FF] bg-[#202944] hover:bg-[#202944]/80 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          {(inspectedPlayer.status === 'available' || inspectedPlayer.status === 'live') && (
            <button
              onClick={handleStartBiddingForThisPlayer}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#090D1B] bg-[#A78BFA] hover:bg-[#b8a1fb] rounded-xl shadow-lg shadow-[#A78BFA]/20 transition-all cursor-pointer"
            >
              <span>Bring to Auction Table</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
