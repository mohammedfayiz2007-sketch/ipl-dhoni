/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Player, IPLTeam } from '../types/auction';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores, RETENTION_TIERS } from '../data/iplData';
import {
  UserCheck,
  UserX,
  Shield,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Lock,
  Check,
} from 'lucide-react';

export const RetentionReleaseView: React.FC = () => {
  const {
    teams,
    players,
    user,
    setUserTeam,
    retainPlayer,
    retainMultiplePlayers,
    releasePlayer,
    confirmTeamRetention,
    activeRoom,
    setInspectedPlayer,
    setCurrentTab,
  } = useAuction();

  // Active viewing/managing franchise tab (defaults to user's selected team or CSK)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(
    user.selectedTeamId || 'csk'
  );
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const currentTeam = teams.find((t) => t.id === selectedFranchiseId) || teams[0];
  const remainingPurse = Number((currentTeam.totalPurse - currentTeam.spentPurse).toFixed(2));
  const remainingSlots = Math.max(0, 6 - currentTeam.retainedPlayers.length);

  // Players currently retained by this franchise
  const squadPlayers = useMemo(() => {
    return players.filter(
      (p) =>
        currentTeam.retainedPlayers.includes(p.id) ||
        (p.soldTo === currentTeam.id && p.status === 'retained')
    );
  }, [players, currentTeam]);

  // STABLE, STRICT TEAM-WISE CANDIDATES:
  // When CSK is selected -> ONLY CSK players.
  // When MI is selected -> ONLY MI players.
  const candidatePlayers = useMemo(() => {
    return players.filter(
      (p) =>
        p.status === 'available' &&
        (p.teamId === currentTeam.id || p.previousTeam === currentTeam.code)
    );
  }, [players, currentTeam]);

  // Next retention tier calculation
  const nextSlotIndex = currentTeam.retainedPlayers.length;
  const nextTier = RETENTION_TIERS[nextSlotIndex] || { cost: 18.0, label: 'Standard Slot' };

  // Check if retention decision is confirmed in active room
  const isConfirmed = Boolean(activeRoom?.retentions?.[currentTeam.id]?.isConfirmed);

  const handleToggleSelect = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSelectMax = () => {
    const toPick = candidatePlayers.slice(0, remainingSlots).map((p) => p.id);
    setSelectedPlayerIds(toPick);
  };

  const handleClearSelect = () => {
    setSelectedPlayerIds([]);
  };

  const handleRetainSingle = (player: Player) => {
    const res = retainPlayer(currentTeam.id, player.id);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== player.id));
    setTimeout(() => setNotification(null), 3500);
  };

  const handleBatchRetain = () => {
    if (selectedPlayerIds.length === 0) return;
    const res = retainMultiplePlayers(currentTeam.id, selectedPlayerIds);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds([]);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRelease = (player: Player) => {
    const res = releasePlayer(currentTeam.id, player.id);
    setNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLockConfirmation = () => {
    if (activeRoom) {
      confirmTeamRetention(currentTeam.id);
    }
    setNotification({
      type: 'success',
      message: `Retention decisions confirmed and verified for ${currentTeam.name}!`,
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-xl animate-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-[#20C997]/20 border-[#20C997] text-[#F5F4FF]'
              : 'bg-[#FF5C75]/20 border-[#FF5C75] text-[#F5F4FF]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#20C997] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#FF5C75] shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header and Franchise Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] font-heading">
            Squad Retention & Release Desk
          </h1>
          <p className="text-sm text-[#A5A9C3] mt-1">
            Official BCCI retention limits: Max 6 retentions per franchise with structured purse deductions.
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-[#202944] border border-[#202944] text-[11px] text-[#00D6D0]">
            ℹ️ Initial 2026 baseline roster for IPL 2027 simulation game.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('auction')}
            className="px-5 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter Live Auction Arena</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 10 TEAMS SELECTOR STRIP */}
      <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-lg">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A9C3] block mb-2.5">
          Select Franchise to View & Retain Players (10 IPL Teams)
        </span>
        <div className="flex flex-wrap gap-2">
          {teams.map((t) => {
            const isCurrent = t.id === currentTeam.id;
            const count = t.retainedPlayers.length;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedFranchiseId(t.id);
                  setUserTeam(t.id);
                  setSelectedPlayerIds([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#A78BFA] text-[#090D1B] shadow-md font-extrabold scale-105'
                    : 'bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] hover:bg-[#202944]/80 border border-[#202944]'
                }`}
              >
                <TeamEmblem code={t.code} size="xs" />
                <span>{t.code}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isCurrent ? 'bg-black/25 text-[#090D1B]' : 'bg-black/40 text-[#A5A9C3]'
                  }`}
                >
                  {count}/6
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
        <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Retained Players</span>
          <span className="text-2xl font-extrabold font-mono text-[#E8BD68] tabular-nums">
            {currentTeam.retainedPlayers.length} / 6 Max
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5">
            {remainingSlots} retention slots available
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Remaining Purse</span>
          <span className="text-2xl font-extrabold font-mono text-[#00D6D0] tabular-nums">
            ₹{remainingPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5">
            Initial: ₹{currentTeam.totalPurse.toFixed(2)} Cr
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Retention Deductions</span>
          <span className="text-2xl font-extrabold font-mono text-[#FF5C75] tabular-nums">
            ₹{currentTeam.spentPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5">
            Purse deducted before auction
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Next Retention Tier</span>
          <span className="text-xl font-extrabold font-mono text-[#A78BFA] tabular-nums">
            ₹{nextTier.cost.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5 truncate">
            {nextTier.label}
          </span>
        </div>
      </div>

      {/* RETENTION RULES BREAKDOWN STRIP */}
      <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] text-xs text-[#A5A9C3] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#E8BD68] shrink-0" />
          <span>
            <strong className="text-[#F5F4FF]">BCCI Retention Tier Scale:</strong> Slot 1 (₹18 Cr) · Slot 2 (₹14 Cr) · Slot 3 (₹11 Cr) · Slot 4 (₹18 Cr) · Slot 5 (₹14 Cr) · Uncapped (₹4 Cr).
          </span>
        </div>
      </div>

      {/* 2-COLUMN VIEW: CURRENT SQUAD vs RETENTION CANDIDATES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT SQUAD (Can Release) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00D6D0]" />
              <span>
                Retained {currentTeam.name} Squad ({squadPlayers.length} / 6)
              </span>
            </h2>
            <span className="text-xs text-[#A5A9C3]">{remainingSlots} slots left</span>
          </div>

          {squadPlayers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#171D35] border border-[#202944]">
              <p className="text-xs text-[#A5A9C3]">
                No players currently retained for {currentTeam.name}. Retain key candidates from the right panel!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {squadPlayers.map((player, idx) => {
                const tier = RETENTION_TIERS[idx] || { cost: player.soldPrice || 18.0 };
                return (
                  <div
                    key={player.id}
                    className="p-3.5 rounded-2xl bg-[#171D35] border border-[#202944] flex items-center justify-between gap-3 hover:border-[#A78BFA]/50 transition-colors shadow-sm"
                  >
                    <div
                      onClick={() => setInspectedPlayer(player)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <PlayerAvatar player={player} size="sm" showRoleBadge />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202944] text-[#E8BD68] font-bold">
                            Slot {idx + 1}
                          </span>
                          <span className="block text-sm font-bold text-[#F5F4FF] truncate hover:text-[#A78BFA] transition-colors">
                            {player.name}
                          </span>
                        </div>
                        <span className="text-xs text-[#A5A9C3]">
                          {player.role} · {player.country} {player.isOverseas ? '✈️' : '🇮🇳'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A5A9C3] block">Deduction</span>
                        <span className="text-xs font-mono font-bold text-[#E8BD68] tabular-nums">
                          ₹{tier.cost.toFixed(2)} Cr
                        </span>
                      </div>

                      <button
                        onClick={() => handleRelease(player)}
                        className="px-3 py-1.5 rounded-xl bg-[#202944] hover:bg-[#FF5C75] text-[#A5A9C3] hover:text-[#F5F4FF] font-bold text-xs border border-[#202944] hover:border-[#FF5C75] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Release</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CANDIDATES TO RETAIN (STRICTLY THIS TEAM ONLY) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#E8BD68]" />
                <span>Available {currentTeam.code} Candidates ({candidatePlayers.length})</span>
              </h2>
              <span className="text-xs text-[#A5A9C3]">
                Next Slot: ₹{nextTier.cost} Cr · Strictly {currentTeam.name} roster
              </span>
            </div>

            <div className="flex items-center gap-2">
              {candidatePlayers.length > 0 && remainingSlots > 0 && (
                <>
                  <button
                    onClick={handleSelectMax}
                    className="text-[11px] text-[#A78BFA] hover:text-[#b8a1fb] cursor-pointer font-semibold"
                  >
                    Select Max ({remainingSlots})
                  </button>
                  {selectedPlayerIds.length > 0 && (
                    <button
                      onClick={handleClearSelect}
                      className="text-[11px] text-[#A5A9C3] hover:text-[#F5F4FF] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* BATCH RETAIN BAR */}
          {selectedPlayerIds.length > 0 && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#202944] to-[#171D35] border border-[#A78BFA] flex items-center justify-between gap-3 animate-in fade-in shadow-lg">
              <span className="text-xs text-[#F5F4FF] font-semibold">
                Selected: <strong className="text-[#E8BD68] font-mono">{selectedPlayerIds.length}</strong> player(s)
              </span>
              <button
                onClick={handleBatchRetain}
                className="px-4 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Retain Selected ({selectedPlayerIds.length})</span>
              </button>
            </div>
          )}

          {remainingSlots === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#171D35] border border-[#202944]">
              <p className="text-xs text-[#00D6D0] font-semibold">
                Maximum 6 retentions reached for {currentTeam.name}. Remaining players will enter the live auction pool!
              </p>
            </div>
          ) : candidatePlayers.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#171D35] border border-[#202944]">
              <p className="text-xs text-[#A5A9C3]">
                All available {currentTeam.name} players have been retained.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {candidatePlayers.map((player) => {
                const isChecked = selectedPlayerIds.includes(player.id);

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#202944] border-[#A78BFA]'
                        : 'bg-[#171D35] border-[#202944] hover:border-[#A78BFA]/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(player.id)}
                      className="w-4 h-4 rounded text-[#A78BFA] focus:ring-0 focus:ring-offset-0 bg-[#090D1B] border-[#202944] cursor-pointer"
                    />

                    {/* Player Info */}
                    <div
                      onClick={() => setInspectedPlayer(player)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <PlayerAvatar player={player} size="sm" showRoleBadge />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="block text-sm font-bold text-[#F5F4FF] truncate hover:text-[#A78BFA] transition-colors">
                            {player.name}
                          </span>
                          {player.marquee && (
                            <span className="text-[10px] text-[#E8BD68] font-black">★</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#A5A9C3]">
                          <span>{player.role}</span>
                          <span>·</span>
                          <span>{player.country}</span>
                          <span>·</span>
                          <span className="text-[#00D6D0] font-mono text-[11px]">
                            Simulated Base: ₹{player.basePrice} Cr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Retain Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleRetainSingle(player)}
                        disabled={remainingPurse < nextTier.cost}
                        className="px-3.5 py-1.5 rounded-xl bg-[#202944] hover:bg-[#A78BFA] text-[#F5F4FF] hover:text-[#090D1B] disabled:opacity-40 font-extrabold text-xs border border-[#202944] hover:border-[#A78BFA] shadow transition-all cursor-pointer flex items-center gap-1"
                        title={`Retain ${player.name} for ₹${nextTier.cost} Cr`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Retain (₹{nextTier.cost} Cr)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Card */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-sm font-bold text-[#F5F4FF] block">
            Lock & Verify {currentTeam.name} Retention Decisions
          </span>
          <span className="text-xs text-[#A5A9C3]">
            {squadPlayers.length} player(s) retained · Remaining auction purse: ₹{remainingPurse.toFixed(2)} Cr
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLockConfirmation}
            className="px-5 py-3 rounded-2xl bg-[#20C997] hover:bg-[#1db889] text-[#090D1B] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>CONFIRM RETENTION FOR {currentTeam.code}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
