/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { IPLTeam } from '../types/auction';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores, calculateNextBid } from '../data/iplData';
import {
  Gavel,
  Radio,
  Clock,
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Cpu,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  Copy,
  ChevronRight,
  AlertCircle,
  Users,
  X,
  MapPin,
  Trophy,
} from 'lucide-react';

export const LiveAuctionView: React.FC = () => {
  const {
    activeRoom,
    currentPlayer,
    timerSecondsLeft,
    isTimerRunning,
    lastBidderTeam,
    isHammerStriking,
    teams,
    players,
    auctionPool,
    user,
    soundMuted,
    toggleSound,
    placeBid,
    sellCurrentPlayer,
    markCurrentPlayerUnsold,
    skipToNextPlayer,
    pauseAuction,
    resumeAuction,
    finishAuction,
    toggleAutoBotBidding,
    setInspectedPlayer,
    setCurrentTab,
  } = useAuction();

  const [copiedCode, setCopiedCode] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [selectedTeamModal, setSelectedTeamModal] = useState<IPLTeam | null>(null);
  const [showAllTeamsModal, setShowAllTeamsModal] = useState(false);

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const remainingPurse = userTeam
    ? Number((userTeam.totalPurse - userTeam.spentPurse).toFixed(2))
    : 120.0;

  const currentBidAmount = activeRoom?.currentBid?.amount || 0;
  const standardNextBid =
    currentBidAmount === 0
      ? currentPlayer?.basePrice || 2.0
      : calculateNextBid(currentBidAmount);

  // Can user bid?
  const isUserHighestBidder = lastBidderTeam?.id === userTeam?.id;
  const canUserAffordBid = remainingPurse >= standardNextBid;

  // Upcoming players queue based on the stable auction pool
  const currentIndex = activeRoom?.currentPlayerIndex || 0;
  const upcomingQueue = auctionPool.slice(currentIndex + 1, currentIndex + 5);

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBidClick = (customAmt?: number, delta?: number) => {
    if (!userTeam) return;
    const res = placeBid(userTeam.id, customAmt, delta);
    if (!res.success && res.reason) {
      setBidError(res.reason);
      setTimeout(() => setBidError(null), 3000);
    }
  };

  const totalSeconds = activeRoom?.bidTimerSeconds || 15;
  const timerPercentage = Math.max(0, (timerSecondsLeft / totalSeconds) * 100);
  const isTimerCritical = timerSecondsLeft <= 3;

  if (!currentPlayer) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#171D35] border border-[#202944] text-[#F5F4FF] shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#E8BD68]/15 text-[#E8BD68] border border-[#E8BD68]/30 flex items-center justify-center text-3xl mx-auto mb-4">
          🏆
        </div>
        <h2 className="text-2xl font-extrabold text-[#F5F4FF] font-heading">
          All Players in the Pool Have Been Auctioned!
        </h2>
        <p className="text-sm text-[#A5A9C3] mt-2 max-w-md mx-auto">
          The 2027 Mega Auction draft cycle has concluded. Check out the tournament standings and final rosters.
        </p>
        <button
          onClick={finishAuction}
          className="mt-6 px-6 py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/25 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          <Gavel className="w-4 h-4" />
          <span>Conclude & View Final Tournament Results</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* Bid Error Toast */}
      {bidError && (
        <div className="p-3.5 rounded-2xl bg-[#FF5C75]/20 border border-[#FF5C75] text-[#F5F4FF] text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2 shadow-xl">
          <AlertCircle className="w-4 h-4 text-[#FF5C75] shrink-0" />
          <span>{bidError}</span>
        </div>
      )}

      {/* Broadcast Header Bar */}
      <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          {/* User requested: Neon cyan live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D6D0]/15 border border-[#00D6D0]/40 text-[#00D6D0] text-xs font-black tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-ping" />
            <span>AUCTION ARENA LIVE</span>
          </div>

          <span className="text-[#A5A9C3] text-xs hidden sm:inline">
            War Room:{' '}
            <strong className="text-[#E8BD68] font-mono">{activeRoom?.code || 'IPL-27'}</strong>
          </span>

          <button
            onClick={handleCopyCode}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#A5A9C3] hover:text-[#F5F4FF] bg-[#202944] px-2.5 py-1 rounded-lg border border-[#202944] cursor-pointer transition-colors"
          >
            <Copy className="w-3 h-3 text-[#E8BD68]" />
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Auctioneer Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllTeamsModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#202944] hover:bg-[#202944]/80 border border-[#202944] text-[#F5F4FF] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="View All 10 Franchises Live Standings & Solvency"
          >
            <Users className="w-3.5 h-3.5 text-[#E8BD68]" />
            <span>Team Board ({teams.length})</span>
          </button>

          <button
            onClick={toggleAutoBotBidding}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeRoom?.settings.autoBotBidding
                ? 'bg-[#00D6D0]/15 border-[#00D6D0] text-[#00D6D0]'
                : 'bg-[#202944] border-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF]'
            }`}
            title="Toggle whether AI bot franchises will compete against you"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Bidding: {activeRoom?.settings.autoBotBidding ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-[#202944] border border-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] cursor-pointer transition-colors"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-[#FF5C75]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#00D6D0]" />
            )}
          </button>

          <button
            onClick={isTimerRunning ? pauseAuction : resumeAuction}
            className="px-3 py-1.5 rounded-xl bg-[#202944] hover:bg-[#202944]/80 border border-[#202944] text-[#F5F4FF] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#FFB84D]" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#00D6D0]" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={skipToNextPlayer}
            className="p-2 rounded-xl bg-[#202944] hover:bg-[#202944]/80 border border-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] cursor-pointer transition-colors"
            title="Next Player"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={finishAuction}
            className="px-3 py-1.5 rounded-xl bg-[#E8BD68]/15 hover:bg-[#E8BD68] text-[#E8BD68] hover:text-[#090D1B] border border-[#E8BD68]/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            title="End Auction & View Final Squad Rosters"
          >
            <span>Finish Auction</span>
          </button>
        </div>
      </div>

      {/* 10-FRANCHISE LIVE STATUS TICKER */}
      <div className="p-3 rounded-2xl bg-[#171D35] border border-[#202944] overflow-x-auto scrollbar-thin shadow-lg">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#202944] text-[#A5A9C3] text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#E8BD68]" />
            <span>10 Franchises:</span>
          </div>

          {teams.map((team) => {
            const remaining = Number((team.totalPurse - team.spentPurse).toFixed(2));
            const squadCount = players.filter(
              (p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)
            ).length;
            const isLeading = lastBidderTeam?.id === team.id;
            const isUser = user.selectedTeamId === team.id;

            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamModal(team)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isLeading
                    ? 'bg-[#E8BD68]/20 border-[#E8BD68] text-[#E8BD68] ring-1 ring-[#E8BD68]/40 shadow-sm animate-pulse'
                    : isUser
                    ? 'bg-[#202944] border-[#A78BFA]/50 text-[#F5F4FF]'
                    : 'bg-[#090D1B] border-[#202944] text-[#A5A9C3] hover:border-[#A78BFA]/40 hover:text-[#F5F4FF]'
                }`}
                title={`Click to view ${team.name} full squad & purse breakdown`}
              >
                <TeamEmblem code={team.code} size="xs" />
                <span className="font-heading">{team.code}</span>
                {isUser && <span className="text-[9px] text-[#A78BFA] font-black">(You)</span>}
                <span className="font-mono text-[11px] text-[#00D6D0] tabular-nums">
                  ₹{remaining.toFixed(1)} Cr
                </span>
                <span className="text-[10px] text-[#A5A9C3] font-mono">
                  ({squadCount})
                </span>
                {isLeading && (
                  <span className="w-2 h-2 rounded-full bg-[#E8BD68] shadow-[0_0_6px_#E8BD68]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-COLUMN BROADCAST STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT PANEL: PLAYER PROFILE CARD */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#171D35] border border-[#202944] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#A78BFA]/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs text-[#A5A9C3] mb-4 pb-3 border-b border-[#202944]">
              <span className="font-bold text-[#E8BD68] uppercase tracking-wider">
                Set {currentPlayer.set} · {currentPlayer.role}
              </span>
              <span className="text-[#F5F4FF] font-medium">
                {currentPlayer.isOverseas ? '✈️ Overseas' : '🇮🇳 Indian'}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <PlayerAvatar
                player={currentPlayer}
                size="2xl"
                showRoleBadge
                className="mb-4 shadow-2xl ring-2 ring-[#202944]"
              />

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4FF] font-heading tracking-tight">
                {currentPlayer.name}
              </h2>
              <p className="text-xs text-[#A5A9C3] mt-1">
                {currentPlayer.country} · {currentPlayer.battingStyle}
                {currentPlayer.bowlingStyle && ` · ${currentPlayer.bowlingStyle}`}
              </p>

              {currentPlayer.previousTeam && (
                <span className="mt-2 text-[11px] text-[#A5A9C3] font-medium">
                  Previous Franchise:{' '}
                  <strong className="text-[#E8BD68]">{currentPlayer.previousTeam}</strong>
                </span>
              )}
            </div>

            <div className="mt-6 p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] flex items-center justify-between text-xs shadow-inner">
              <span className="text-[#A5A9C3] font-medium">Opening Base Price:</span>
              <span className="text-base font-extrabold font-mono text-[#00D6D0] tabular-nums">
                {formatCrores(currentPlayer.basePrice)}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5A9C3] block mb-2">
                Career T20 Figures
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944]">
                  <span className="text-[10px] text-[#A5A9C3] block">Matches</span>
                  <span className="font-bold font-mono text-[#F5F4FF] tabular-nums">
                    {currentPlayer.iplStats.matches}
                  </span>
                </div>

                {currentPlayer.iplStats.runs !== undefined ? (
                  <>
                    <div className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[10px] text-[#A5A9C3] block">Runs</span>
                      <span className="font-bold font-mono text-[#F5F4FF] tabular-nums">
                        {currentPlayer.iplStats.runs}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[10px] text-[#A5A9C3] block">Strike Rate</span>
                      <span className="font-bold font-mono text-[#00D6D0] tabular-nums">
                        {currentPlayer.iplStats.strikeRate}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[10px] text-[#A5A9C3] block">Wickets</span>
                      <span className="font-bold font-mono text-[#F5F4FF] tabular-nums">
                        {currentPlayer.iplStats.wickets}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[10px] text-[#A5A9C3] block">Economy</span>
                      <span className="font-bold font-mono text-[#A78BFA] tabular-nums">
                        {currentPlayer.iplStats.economy}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setInspectedPlayer(currentPlayer)}
            className="mt-6 w-full py-2.5 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#F5F4FF] font-semibold text-xs border border-[#202944] hover:border-[#A78BFA]/50 transition-colors cursor-pointer"
          >
            Full Scouting Dossier →
          </button>
        </div>

        {/* CENTER PANEL: LIVE BIDDING PODIUM */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-b from-[#171D35] via-[#11182B] to-[#171D35] border border-[#202944] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#A5A9C3]">
                Current Highest Bid
              </span>

              {/* Countdown Timer with smooth visual animation */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono font-black text-sm tabular-nums transition-colors shadow-lg ${
                  isTimerCritical
                    ? 'bg-[#FF5C75]/20 border-[#FF5C75] text-[#FF5C75] animate-pulse'
                    : 'bg-[#090D1B] border-[#202944] text-[#E8BD68]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timerSecondsLeft.toString().padStart(2, '0')}s</span>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="w-full bg-[#090D1B] rounded-full h-2 mb-6 overflow-hidden border border-[#202944]">
              <div
                className={`h-full transition-all duration-1000 ${
                  isTimerCritical ? 'bg-[#FF5C75]' : 'bg-gradient-to-r from-[#A78BFA] to-[#00D6D0]'
                }`}
                style={{ width: `${timerPercentage}%` }}
              />
            </div>

            <div className="text-center py-4">
              <div
                className={`text-5xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight tabular-nums transition-transform ${
                  isHammerStriking ? 'animate-hammer text-[#E8BD68]' : 'text-[#F5F4FF] animate-bid-pulse'
                }`}
              >
                {currentBidAmount > 0 ? formatCrores(currentBidAmount) : 'WAITING FOR BID'}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                {lastBidderTeam ? (
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#090D1B] border border-[#E8BD68]/40 shadow-xl">
                    <TeamEmblem code={lastBidderTeam.code} size="md" />
                    <div className="text-left">
                      <span className="text-[10px] text-[#A5A9C3] uppercase font-bold block">
                        Leading Franchise
                      </span>
                      <span className="text-sm font-extrabold text-[#F5F4FF]">
                        {lastBidderTeam.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-[#A5A9C3] italic">
                    Opening bid starts at {formatCrores(currentPlayer.basePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User requested: Electric violet bidding controls */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => handleBidClick(standardNextBid)}
              disabled={!userTeam || isUserHighestBidder || !canUserAffordBid || !isTimerRunning}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isUserHighestBidder
                  ? 'bg-[#20C997] text-[#090D1B] cursor-not-allowed shadow-[#20C997]/20'
                  : canUserAffordBid && isTimerRunning
                  ? 'bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] shadow-[#A78BFA]/30 hover:scale-[1.01] active:scale-[0.98]'
                  : 'bg-[#202944] text-[#A5A9C3]/40 cursor-not-allowed opacity-60'
              }`}
            >
              <Gavel className="w-5 h-5" />
              <span>
                {isUserHighestBidder
                  ? `YOU HOLD THE HIGHEST BID (${formatCrores(currentBidAmount)})`
                  : !canUserAffordBid
                  ? 'INSUFFICIENT PURSE'
                  : `BID ${formatCrores(standardNextBid)} FOR ${userTeam?.code || 'YOUR FRANCHISE'}`}
              </span>
            </button>

            {/* Atomic Fast-Increment Buttons (+₹20L, +₹50L, +₹1 Cr) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleBidClick(undefined, 0.2)}
                disabled={!userTeam || isUserHighestBidder || !isTimerRunning}
                className="py-2.5 rounded-xl bg-[#090D1B] hover:bg-[#202944] text-[#F5F4FF] font-mono font-bold text-xs border border-[#202944] hover:border-[#A78BFA] transition-colors cursor-pointer disabled:opacity-50"
              >
                +₹20 L
              </button>

              <button
                onClick={() => handleBidClick(undefined, 0.5)}
                disabled={!userTeam || isUserHighestBidder || !isTimerRunning}
                className="py-2.5 rounded-xl bg-[#090D1B] hover:bg-[#202944] text-[#F5F4FF] font-mono font-bold text-xs border border-[#202944] hover:border-[#A78BFA] transition-colors cursor-pointer disabled:opacity-50"
              >
                +₹50 L
              </button>

              <button
                onClick={() => handleBidClick(undefined, 1.0)}
                disabled={!userTeam || isUserHighestBidder || !isTimerRunning}
                className="py-2.5 rounded-xl bg-[#090D1B] hover:bg-[#202944] text-[#00D6D0] font-mono font-bold text-xs border border-[#202944] hover:border-[#00D6D0] transition-colors cursor-pointer disabled:opacity-50"
              >
                +₹1.00 Cr
              </button>
            </div>

            {/* Auctioneer Hammer Actions (Champagne gold hammer SOLD) */}
            <div className="pt-2 grid grid-cols-2 gap-2 border-t border-[#202944]">
              <button
                onClick={sellCurrentPlayer}
                disabled={currentBidAmount === 0}
                className="py-3 rounded-xl bg-[#E8BD68]/20 hover:bg-[#E8BD68] text-[#E8BD68] hover:text-[#090D1B] border border-[#E8BD68]/40 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Hammer SOLD!</span>
              </button>

              <button
                onClick={markCurrentPlayerUnsold}
                className="py-3 rounded-xl bg-[#FF5C75]/20 hover:bg-[#FF5C75] text-[#FF5C75] hover:text-white border border-[#FF5C75]/40 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Call UNSOLD</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 10 IPL TEAMS LIVE STATUS */}
        <div className="lg:col-span-3 p-4 rounded-3xl bg-[#171D35] border border-[#202944] flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#202944]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5F4FF] font-heading block">
                  Franchise Purse Tracker
                </span>
                <span className="text-[10px] text-[#A5A9C3]">Click team to scout squad</span>
              </div>
              <button
                onClick={() => setShowAllTeamsModal(true)}
                className="text-[10px] font-bold text-[#A78BFA] hover:text-[#b8a1fb] cursor-pointer bg-[#090D1B] px-2 py-1 rounded-lg border border-[#202944] transition-colors"
              >
                10 Teams →
              </button>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {teams.map((team) => {
                const remaining = Number((team.totalPurse - team.spentPurse).toFixed(2));
                const squadCount = players.filter(
                  (p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)
                ).length;
                const isLeading = lastBidderTeam?.id === team.id;
                const isUser = user.selectedTeamId === team.id;

                return (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamModal(team)}
                    className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer text-left hover:scale-[1.01] ${
                      isLeading
                        ? 'bg-[#E8BD68]/20 border border-[#E8BD68] ring-1 ring-[#E8BD68]/30 shadow-md'
                        : isUser
                        ? 'bg-[#202944] border border-[#A78BFA]/40'
                        : 'bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/30'
                    }`}
                    title={`Click to scout ${team.name} full squad`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TeamEmblem code={team.code} size="sm" />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-[#F5F4FF] truncate">
                          {team.code}
                          {isUser && <span className="text-[9px] text-[#A78BFA] ml-1 font-bold">(You)</span>}
                        </span>
                        <span className="text-[10px] text-[#A5A9C3]">
                          Squad: {squadCount}/{team.maxSquad}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-mono font-bold tabular-nums block ${
                          isLeading ? 'text-[#E8BD68]' : 'text-[#00D6D0]'
                        }`}
                      >
                        ₹{remaining.toFixed(2)} Cr
                      </span>
                      {isLeading && (
                        <span className="text-[9px] font-black text-[#E8BD68] uppercase animate-pulse">
                          LEADING BID
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#202944] text-center">
            <span className="text-[10px] text-[#A5A9C3]">
              Purse rule: Min 18 / Max 25 players per team
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: LIVE BID HISTORY & UPCOMING QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F4FF] font-heading flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#00D6D0]" />
              <span>Current Player Bid Trail ({activeRoom?.bidHistory.length || 0})</span>
            </h3>
            <span className="text-[11px] text-[#A5A9C3]">Latest bids on top</span>
          </div>

          {!activeRoom?.bidHistory || activeRoom.bidHistory.length === 0 ? (
            <p className="text-xs text-[#A5A9C3] italic py-6 text-center">
              No bids placed yet for {currentPlayer.name}. Place the opening bid!
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeRoom.bidHistory.map((bid, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <TeamEmblem code={bid.teamCode} size="sm" />
                    <div>
                      <span className="font-bold text-[#F5F4FF]">{bid.teamCode}</span>
                      <span className="text-[10px] text-[#A5A9C3] ml-1.5">
                        {bid.isBot ? '🤖 AI Bid' : '👤 Director Bid'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-[#00D6D0] tabular-nums text-sm block">
                      {formatCrores(bid.amount)}
                    </span>
                    <span className="text-[10px] text-[#A5A9C3]">
                      {new Date(bid.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F4FF] font-heading flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>On Deck: Upcoming Players</span>
            </h3>
            <button
              onClick={() => setCurrentTab('players')}
              className="text-xs text-[#A78BFA] hover:text-[#b8a1fb] cursor-pointer"
            >
              View Pool ({players.length})
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {upcomingQueue.map((p) => (
              <div
                key={p.id}
                onClick={() => setInspectedPlayer(p)}
                className="p-2.5 rounded-2xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-colors cursor-pointer text-center group"
              >
                <PlayerAvatar player={p} size="sm" showRoleBadge className="mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-[#F5F4FF] truncate group-hover:text-[#A78BFA] transition-colors">
                  {p.name}
                </span>
                <span className="block text-[10px] font-mono text-[#00D6D0] tabular-nums mt-0.5 font-semibold">
                  Base: {formatCrores(p.basePrice)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FRANCHISE SQUAD SCOUT MODAL */}
      {selectedTeamModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedTeamModal(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#171D35] border border-[#202944] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#202944]">
              <div className="flex items-center gap-3">
                <TeamEmblem code={selectedTeamModal.code} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-[#F5F4FF] font-heading">
                      {selectedTeamModal.name}
                    </h3>
                    {user.selectedTeamId === selectedTeamModal.id && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#A78BFA] text-[#090D1B] uppercase">
                        Your Franchise
                      </span>
                    )}
                    {lastBidderTeam?.id === selectedTeamModal.id && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#00D6D0]/20 border border-[#00D6D0] text-[#00D6D0] uppercase animate-pulse">
                        Leading Live Bid
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#A5A9C3] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A5A9C3]" />
                    <span>{selectedTeamModal.homeGround}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTeamModal(null)}
                className="p-2 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#A5A9C3] hover:text-[#F5F4FF] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial & Squad Stats */}
            {(() => {
              const remaining = Number((selectedTeamModal.totalPurse - selectedTeamModal.spentPurse).toFixed(2));
              const squad = players.filter(
                (p) => p.soldTo === selectedTeamModal.id || selectedTeamModal.retainedPlayers.includes(p.id)
              );
              const overseas = squad.filter((p) => p.isOverseas);
              const pursePercent = Math.min(100, (selectedTeamModal.spentPurse / selectedTeamModal.totalPurse) * 100);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[11px] text-[#A5A9C3] block">Remaining Purse</span>
                      <span className="text-lg font-black font-mono text-[#00D6D0] tabular-nums">
                        ₹{remaining.toFixed(2)} Cr
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[11px] text-[#A5A9C3] block">Total Spent</span>
                      <span className="text-lg font-black font-mono text-[#E8BD68] tabular-nums">
                        ₹{selectedTeamModal.spentPurse.toFixed(2)} Cr
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944]">
                      <span className="text-[11px] text-[#A5A9C3] block">Squad Capacity</span>
                      <span className="text-lg font-black font-mono text-[#F5F4FF] tabular-nums">
                        {squad.length} / {selectedTeamModal.maxSquad}
                      </span>
                      <span className="text-[10px] text-[#A5A9C3] block">
                        Overseas: {overseas.length} / {selectedTeamModal.maxOverseas}
                      </span>
                    </div>
                  </div>

                  {/* Budget Spent Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#A5A9C3]">
                      <span>Purse Utilization</span>
                      <span className="font-mono">{pursePercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#090D1B] rounded-full h-2 overflow-hidden border border-[#202944]">
                      <div
                        className="h-full bg-gradient-to-r from-[#00D6D0] via-[#A78BFA] to-[#FF5C75] transition-all"
                        style={{ width: `${pursePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Squad Roster */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F5F4FF]">
                        Acquired & Retained Squad ({squad.length})
                      </span>
                      <span className="text-[10px] text-[#A5A9C3]">
                        Min 18 / Max 25 players
                      </span>
                    </div>

                    {squad.length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-[#090D1B] border border-[#202944] text-[#A5A9C3] text-xs italic">
                        No players acquired yet. This franchise has not won any bids or retained players.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {squad.map((p) => {
                          const isRetained = selectedTeamModal.retainedPlayers.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setInspectedPlayer(p);
                                setSelectedTeamModal(null);
                              }}
                              className="p-2.5 rounded-xl bg-[#090D1B] border border-[#202944] hover:border-[#A78BFA]/50 transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <PlayerAvatar player={p} size="sm" showRoleBadge />
                                <div className="min-w-0">
                                  <span className="block text-xs font-bold text-[#F5F4FF] truncate group-hover:text-[#A78BFA] transition-colors">
                                    {p.name}
                                  </span>
                                  <span className="text-[10px] text-[#A5A9C3]">
                                    {p.role} · {p.isOverseas ? '✈️ Overseas' : '🇮🇳 Indian'}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-bold text-[#E8BD68] block">
                                  {p.soldPrice ? formatCrores(p.soldPrice) : formatCrores(p.basePrice)}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                                    isRetained
                                      ? 'bg-[#FFB84D]/20 text-[#FFB84D]'
                                      : 'bg-[#00D6D0]/20 text-[#00D6D0]'
                                  }`}
                                >
                                  {isRetained ? 'Retained' : 'Auction'}
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
            })()}
          </div>
        </div>
      )}

      {/* 10 FRANCHISES FULL BOARD MODAL */}
      {showAllTeamsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAllTeamsModal(false)}
        >
          <div
            className="w-full max-w-5xl bg-[#171D35] border border-[#202944] rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#202944]">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E8BD68] mb-1">
                  <Users className="w-4 h-4" />
                  <span>IPL 2027 MEGA AUCTION OFFICIAL WAR BOARD</span>
                </div>
                <h2 className="text-2xl font-black text-[#F5F4FF] font-heading">
                  All 10 Franchises Live Roster & Purse Tracker
                </h2>
                <p className="text-xs text-[#A5A9C3] mt-1">
                  Real-time solvency, squad limits (18-25 players), and current bidding status across all franchises.
                </p>
              </div>

              <button
                onClick={() => setShowAllTeamsModal(false)}
                className="p-2 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#A5A9C3] hover:text-[#F5F4FF] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of 10 Franchises */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => {
                const remaining = Number((team.totalPurse - team.spentPurse).toFixed(2));
                const squad = players.filter(
                  (p) => p.soldTo === team.id || team.retainedPlayers.includes(p.id)
                );
                const overseas = squad.filter((p) => p.isOverseas);
                const isLeading = lastBidderTeam?.id === team.id;
                const isUser = user.selectedTeamId === team.id;

                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      setShowAllTeamsModal(false);
                      setSelectedTeamModal(team);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-[#A78BFA]/50 hover:scale-[1.01] ${
                      isLeading
                        ? 'bg-[#E8BD68]/10 border-[#E8BD68] ring-1 ring-[#E8BD68]/30 shadow-lg'
                        : isUser
                        ? 'bg-[#202944] border-[#A78BFA]/50'
                        : 'bg-[#090D1B] border-[#202944]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <TeamEmblem code={team.code} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-[#F5F4FF] text-sm">{team.name}</h3>
                            {isUser && (
                              <span className="text-[9px] bg-[#A78BFA] text-[#090D1B] font-black px-1.5 py-0.2 rounded">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#A5A9C3] block font-mono">
                            {team.code} · {team.city}
                          </span>
                        </div>
                      </div>

                      {isLeading && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#E8BD68] text-[#090D1B] uppercase animate-pulse">
                          LEADING
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                      <div className="p-2 rounded-xl bg-[#171D35] border border-[#202944]">
                        <span className="text-[10px] text-[#A5A9C3] block">Remaining</span>
                        <span className="font-extrabold font-mono text-[#00D6D0] tabular-nums">
                          ₹{remaining.toFixed(2)} Cr
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#171D35] border border-[#202944]">
                        <span className="text-[10px] text-[#A5A9C3] block">Squad</span>
                        <span className="font-extrabold font-mono text-[#F5F4FF] tabular-nums">
                          {squad.length} / 25
                        </span>
                        <span className="text-[9px] text-[#A5A9C3] block">
                          ✈️ {overseas.length}/8
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#A5A9C3] pt-2 border-t border-[#202944]">
                      <span>Spent: ₹{team.spentPurse.toFixed(2)} Cr</span>
                      <span className="text-[#A78BFA] font-semibold hover:underline">
                        Scout Squad →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
