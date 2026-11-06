/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Player, IPLTeam } from '../../types/auction';
import { TeamEmblem } from '../../components/TeamEmblem';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { formatCrores, RETENTION_TIERS } from '../../data/iplData';
import {
  UserCheck,
  UserX,
  Shield,
  DollarSign,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const RetentionDashboardView: React.FC<{ onProceedToConfirm: () => void }> = ({
  onProceedToConfirm,
}) => {
  const {
    activeRoom,
    teams,
    players,
    user,
    retainPlayer,
    retainMultiplePlayers,
    releasePlayer,
    confirmTeamRetention,
    setInspectedPlayer,
  } = useAuction();

  if (!activeRoom) return null;

  // User's assigned franchise in this room
  const myAssignedTeamId =
    Object.entries(activeRoom.teamAssignments).find(([_, conf]) => conf.userId === user.id)?.[0] ||
    user.selectedTeamId ||
    'csk';

  // Active viewing/managing franchise tab (defaults to user's assigned team)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(myAssignedTeamId);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const currentTeam: IPLTeam =
    teams.find((t) => t.id === selectedFranchiseId) || teams[0];

  const remainingPurse = Number((currentTeam.totalPurse - currentTeam.spentPurse).toFixed(2));
  const remainingSlots = Math.max(0, 6 - currentTeam.retainedPlayers.length);

  // Players currently retained by this franchise
  const retainedList = useMemo(() => {
    return players.filter(
      (p) => currentTeam.retainedPlayers.includes(p.id) || (p.soldTo === currentTeam.id && p.status === 'retained')
    );
  }, [players, currentTeam]);

  // STABLE, STRICT TEAM-WISE CANDIDATES:
  // When CSK is selected -> ONLY CSK players.
  // When MI is selected -> ONLY MI players.
  const candidatePool = useMemo(() => {
    return players.filter(
      (p) =>
        p.status === 'available' &&
        (p.teamId === currentTeam.id || p.previousTeam === currentTeam.code)
    );
  }, [players, currentTeam]);

  // Next retention tier calculation
  const nextSlotIndex = currentTeam.retainedPlayers.length;
  const nextTier = RETENTION_TIERS[nextSlotIndex] || { cost: 18.0, label: 'Standard Slot' };

  // Check if this franchise has locked its retention decision
  const isTeamConfirmed = Boolean(activeRoom.retentions[currentTeam.id]?.isConfirmed);

  const handleToggleSelect = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSelectAllCandidates = () => {
    const availableToPick = candidatePool.slice(0, remainingSlots).map((p) => p.id);
    setSelectedPlayerIds(availableToPick);
  };

  const handleClearSelection = () => {
    setSelectedPlayerIds([]);
  };

  const handleSingleRetain = (player: Player) => {
    const res = retainPlayer(currentTeam.id, player.id);
    setStatusNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== player.id));
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleBatchRetain = () => {
    if (selectedPlayerIds.length === 0) return;
    const res = retainMultiplePlayers(currentTeam.id, selectedPlayerIds);
    setStatusNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setSelectedPlayerIds([]);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleRelease = (player: Player) => {
    const res = releasePlayer(currentTeam.id, player.id);
    setStatusNotification({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleLockConfirmation = () => {
    confirmTeamRetention(currentTeam.id);
    setStatusNotification({
      type: 'success',
      message: `Retention decisions successfully locked for ${currentTeam.name}!`,
    });
    setTimeout(() => setStatusNotification(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 text-[#F5F4FF]">
      {/* Toast Alert */}
      {statusNotification && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 border shadow-2xl animate-in slide-in-from-top-2 ${
            statusNotification.type === 'success'
              ? 'bg-[#20C997]/20 border-[#20C997] text-[#F5F4FF]'
              : 'bg-[#FF5C75]/20 border-[#FF5C75] text-[#F5F4FF]'
          }`}
        >
          {statusNotification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#20C997] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#FF5C75] shrink-0" />
          )}
          <span className="text-xs font-semibold">{statusNotification.message}</span>
        </div>
      )}

      {/* Header & Squad Identity Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#11182B] to-[#171D35] border border-[#202944] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8BD68] mb-1.5">
            <span>STEP 6 OF 10</span>
            <span>·</span>
            <span>SQUAD RETENTION DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4FF] font-heading flex items-center gap-2.5">
            <span>Retention Desk:</span>
            <span className="text-[#E8BD68]">{currentTeam.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1 max-w-xl">
            Retain up to 6 players from {currentTeam.name}'s baseline roster. Official BCCI scale deductions apply.
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-[#202944] border border-[#202944] text-[11px] text-[#00D6D0]">
            ℹ️ Baseline 2026/2027 roster for Mega Auction simulation.
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <TeamEmblem code={currentTeam.code} size="xl" className="drop-shadow-lg" />
        </div>
      </div>

      {/* 10 TEAMS SELECTOR TABS */}
      <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-lg">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A9C3] block mb-2.5">
          Select Franchise to Manage Retention (10 Official Teams)
        </span>
        <div className="flex flex-wrap gap-2">
          {teams.map((t) => {
            const isCurrent = t.id === currentTeam.id;
            const isConfirmed = Boolean(activeRoom.retentions[t.id]?.isConfirmed);
            const count = t.retainedPlayers.length;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedFranchiseId(t.id);
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
                {isConfirmed && <Check className="w-3 h-3 text-[#20C997]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Retained Players</span>
          <span className="text-2xl font-extrabold font-mono text-[#E8BD68] tabular-nums">
            {currentTeam.retainedPlayers.length} / 6 Max
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5 font-medium">
            {remainingSlots} retention slots remaining
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Starting Purse</span>
          <span className="text-2xl font-extrabold font-mono text-[#F5F4FF] tabular-nums">
            ₹{currentTeam.totalPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5">Standard Mega Auction Cap</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Retention Deductions</span>
          <span className="text-2xl font-extrabold font-mono text-[#FF5C75] tabular-nums">
            ₹{currentTeam.spentPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5">Official BCCI scale deductions</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] shadow-md">
          <span className="text-xs text-[#A5A9C3] block mb-0.5">Available Auction Purse</span>
          <span className="text-2xl font-extrabold font-mono text-[#00D6D0] tabular-nums">
            ₹{remainingPurse.toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-[#A5A9C3] block mt-0.5">For live auction bidding</span>
        </div>
      </div>

      {/* BCCI Official Tier Deductions Strip */}
      <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] text-xs text-[#A5A9C3] space-y-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#E8BD68] shrink-0" />
          <span className="font-semibold text-[#F5F4FF]">BCCI Retention Slots & Purse Deductions:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-mono">
          {RETENTION_TIERS.map((tier, idx) => {
            const isFilled = currentTeam.retainedPlayers.length > idx;
            const isNext = currentTeam.retainedPlayers.length === idx;
            return (
              <div
                key={tier.slot}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isFilled
                    ? 'bg-[#20C997]/15 border-[#20C997] text-[#20C997]'
                    : isNext
                    ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA] ring-1 ring-[#A78BFA]'
                    : 'bg-[#090D1B] border-[#202944] text-[#A5A9C3]'
                }`}
              >
                <span className="block font-bold">Slot {tier.slot}</span>
                <span>₹{tier.cost.toFixed(1)} Cr</span>
                {isFilled && <span className="block text-[9px] uppercase font-bold text-[#20C997]">Filled</span>}
                {isNext && <span className="block text-[9px] uppercase font-bold text-[#A78BFA]">Next</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Squad Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMN 1: RETAINED SQUAD */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F4FF] font-heading flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00D6D0]" />
              <span>
                Retained {currentTeam.code} Squad ({retainedList.length} / 6)
              </span>
            </h2>
            <span className="text-xs text-[#A5A9C3]">
              {remainingSlots} slots remaining
            </span>
          </div>

          {retainedList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#171D35] border border-[#202944]">
              <p className="text-xs text-[#A5A9C3]">
                No players currently retained for {currentTeam.name}. Select from the {candidatePool.length} available {currentTeam.code} players on the right!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {retainedList.map((player, idx) => {
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
                          <span className="block text-sm font-bold text-[#F5F4FF] truncate hover:text-[#A78BFA]">
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
                        <span className="text-xs font-mono font-bold text-[#E8BD68]">
                          ₹{tier.cost.toFixed(2)} Cr
                        </span>
                      </div>

                      <button
                        onClick={() => handleRelease(player)}
                        className="px-3 py-1.5 rounded-xl bg-[#202944] hover:bg-[#FF5C75] text-[#A5A9C3] hover:text-[#F5F4FF] font-bold text-xs border border-[#202944] transition-colors cursor-pointer flex items-center gap-1"
                        title="Release player back to available candidates"
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

        {/* COLUMN 2: CANDIDATES TO RETAIN (STRICTLY THIS TEAM ONLY) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F5F4FF] font-heading flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#E8BD68]" />
                <span>Available {currentTeam.code} Candidates ({candidatePool.length})</span>
              </h2>
              <span className="text-[11px] text-[#A5A9C3]">
                Only {currentTeam.name} players are shown here.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {candidatePool.length > 0 && remainingSlots > 0 && (
                <>
                  <button
                    onClick={handleSelectAllCandidates}
                    className="text-[11px] text-[#A78BFA] hover:text-[#b8a1fb] cursor-pointer font-semibold transition-colors"
                  >
                    Select Max ({remainingSlots})
                  </button>
                  {selectedPlayerIds.length > 0 && (
                    <button
                      onClick={handleClearSelection}
                      className="text-[11px] text-[#A5A9C3] hover:text-[#F5F4FF] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* BATCH RETAIN ACTION BAR (When checkboxes selected) */}
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
                Maximum 6 player retention limit reached for {currentTeam.name}!
              </p>
              <p className="text-[11px] text-[#A5A9C3] mt-1">
                To retain a different player, release one from the retained squad list on the left.
              </p>
            </div>
          ) : candidatePool.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#171D35] border border-[#202944]">
              <p className="text-xs text-[#A5A9C3]">
                All available {currentTeam.name} players have been retained.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {candidatePool.map((player) => {
                const isChecked = selectedPlayerIds.includes(player.id);

                return (
                  <div
                    key={player.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-[#202944] border-[#A78BFA]'
                        : 'bg-[#171D35] border-[#202944] hover:border-[#A78BFA]/40'
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
                          <span className="block text-sm font-bold text-[#F5F4FF] truncate hover:text-[#A78BFA]">
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

                    {/* Single Retain Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSingleRetain(player)}
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

      {/* Confirmation & Advance CTA */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#F5F4FF] block">
              Lock & Verify {currentTeam.name} Decisions
            </span>
            {isTeamConfirmed ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#20C997]/20 border border-[#20C997] text-[#20C997] text-[10px] font-bold font-mono">
                LOCKED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFB84D]/20 border border-[#FFB84D]/40 text-[#FFB84D] text-[10px] font-bold font-mono">
                DECISION PENDING
              </span>
            )}
          </div>
          <span className="text-xs text-[#A5A9C3] mt-0.5 block">
            {retainedList.length} player(s) retained · Remaining auction purse: ₹{remainingPurse.toFixed(2)} Cr
          </span>
        </div>

        <div className="flex items-center gap-3">
          {!isTeamConfirmed ? (
            <button
              onClick={handleLockConfirmation}
              className="px-5 py-3 rounded-2xl bg-[#E8BD68] hover:bg-[#f2cb7c] text-[#090D1B] font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>LOCK RETENTION FOR {currentTeam.code}</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl bg-[#090D1B] border border-[#20C997]/40 text-[#20C997] text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentTeam.code} Retention Locked</span>
            </div>
          )}

          <button
            onClick={onProceedToConfirm}
            className="px-6 py-3.5 rounded-2xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>CENTRAL RETENTION CONFIRMATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
