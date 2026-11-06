/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import {
  Gavel,
  Shield,
  Users,
  Radio,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  Cpu,
  Trophy,
  PlusCircle,
  LogIn,
  CheckCircle2,
  Clock,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentTab, teams, players, createRoom, joinRoom } = useAuction();
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const marqueePlayers = players.filter((p) => p.marquee).slice(0, 6);
  const samplePlayer = marqueePlayers[0] || players[0];

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const ok = joinRoom(joinCodeInput.trim());
    if (ok) {
      setCurrentTab('auction');
      setIsJoinModalOpen(false);
    }
  };

  const handleQuickCreate = () => {
    createRoom('IPL 2027 Official War Room', 15);
    setCurrentTab('auction');
  };

  return (
    <div className="min-h-screen bg-[#090D1B] text-[#F5F4FF] selection:bg-[#A78BFA] selection:text-[#090D1B] transition-colors">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-[#202944]">
        {/* Stadium Floodlight Visual Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-[#A78BFA]/15 via-[#00D6D0]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-40 -left-20 w-[450px] h-[450px] bg-[#A78BFA]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-40 -right-20 w-[450px] h-[450px] bg-[#00D6D0]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E8BD68]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Stadium Light Grid Accent Lines */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 244, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official season kicker */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#11182B]/90 border border-[#202944] text-xs font-semibold text-[#A5A9C3] mb-6 shadow-lg shadow-black/40 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-pulse shadow-[0_0_8px_#00D6D0]" />
            <span className="text-[#E8BD68] font-bold tracking-wider">OFFICIAL 2027 PROTOCOL</span>
            <span className="text-slate-600">·</span>
            <span className="text-[#F5F4FF]">BCCI MEGA AUCTION ARENA</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-tight text-balance max-w-5xl mx-auto">
            IPL AUCTION <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#00D6D0] to-[#E8BD68]">ARENA 2027</span>
          </h1>

          {/* User requested exact tagline */}
          <p className="mt-4 text-xl sm:text-2xl font-bold font-heading tracking-wide text-[#E8BD68] uppercase">
            BUILD YOUR TEAM. OWN THE AUCTION.
          </p>

          <p className="mt-4 text-base sm:text-lg text-[#A5A9C3] max-w-2xl mx-auto leading-relaxed">
            Take command of any of the 10 IPL franchises. Outmaneuver opponents with real-time bidding,
            strategic squad retentions, and broadcast-grade live war room technology.
          </p>

          {/* Action Buttons Triad */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <button
              onClick={() => setCurrentTab('auction')}
              className="px-6 py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-sm shadow-xl shadow-[#A78BFA]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer ring-1 ring-[#A78BFA]/50"
            >
              <Radio className="w-4 h-4 text-[#090D1B] animate-pulse" />
              <span>Enter Live Auction Arena</span>
            </button>

            <button
              onClick={handleQuickCreate}
              className="px-6 py-3.5 rounded-xl bg-[#171D35] hover:bg-[#202944] text-[#F5F4FF] font-bold text-sm border border-[#202944] hover:border-[#A78BFA]/50 shadow-lg transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              <PlusCircle className="w-4 h-4 text-[#E8BD68] group-hover:rotate-90 transition-transform" />
              <span>Create War Room</span>
            </button>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-[#11182B] hover:bg-[#171D35] text-[#F5F4FF] font-bold text-sm border border-[#202944] hover:border-[#00D6D0]/50 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#00D6D0]" />
              <span>Join via Room Code</span>
            </button>

            <button
              onClick={() => setCurrentTab('teams')}
              className="px-5 py-3.5 rounded-xl text-[#A5A9C3] hover:text-[#F5F4FF] font-semibold text-sm transition-colors cursor-pointer"
            >
              <span>Explore Franchises →</span>
            </button>
          </div>

          {/* Key Facts Strip */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#11182B]/85 border border-[#202944] backdrop-blur-md shadow-2xl">
            <div className="text-center p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-[#E8BD68] tabular-nums">
                ₹120.00 Cr
              </span>
              <span className="text-xs text-[#A5A9C3] font-medium mt-1 block">Purse Per Franchise</span>
            </div>

            <div className="text-center p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F4FF] tabular-nums">
                10 Teams
              </span>
              <span className="text-xs text-[#A5A9C3] font-medium mt-1 block">Official Franchises</span>
            </div>

            <div className="text-center p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-[#00D6D0] tabular-nums">
                {players.length}+ Players
              </span>
              <span className="text-xs text-[#A5A9C3] font-medium mt-1 block">Curated 2027 Draft</span>
            </div>

            <div className="text-center p-3">
              <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-[#A78BFA] tabular-nums">
                15 Sec
              </span>
              <span className="text-xs text-[#A5A9C3] font-medium mt-1 block">Bidding Countdown Call</span>
            </div>
          </div>
        </div>
      </section>

      {/* ALL 10 IPL FRANCHISES SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#202944]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E8BD68] block mb-2">
            2027 Tournament Franchises
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading">
            Choose Your Franchise & Dominate the Table
          </h2>
          <p className="mt-3 text-sm text-[#A5A9C3]">
            Select any team to manage squad retention, track remaining purse, and outbid opponents in real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => setCurrentTab('teams')}
              className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] hover:border-[#A78BFA]/50 hover:bg-[#202944] transition-all cursor-pointer group flex flex-col items-center text-center shadow-lg hover:shadow-[#A78BFA]/10 hover:-translate-y-1"
            >
              <TeamEmblem code={team.code} size="lg" className="mb-3 group-hover:scale-110 transition-transform drop-shadow" />
              <h3 className="font-bold text-[#F5F4FF] text-sm group-hover:text-[#A78BFA] transition-colors truncate w-full">
                {team.name}
              </h3>
              <span className="text-xs font-mono text-[#00D6D0] mt-1.5 tabular-nums font-semibold">
                Purse: ₹{(team.totalPurse - team.spentPurse).toFixed(2)} Cr
              </span>
              <span className="text-[11px] text-[#A5A9C3] mt-0.5">
                {team.trophies.length > 0 ? `${team.trophies.length}x Trophies` : 'Contender'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE AUCTION PREVIEW (BROADCAST TEASER) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#202944]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00D6D0] block mb-2">
            Broadcast-Grade Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading">
            Live Auction Arena Preview
          </h2>
          <p className="mt-3 text-sm text-[#A5A9C3]">
            Engineered with the intensity of an esports broadcast and the accuracy of a Wall Street trading terminal.
          </p>
        </div>

        {/* Live Arena Mockup Card */}
        <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-b from-[#171D35] to-[#11182B] border border-[#202944] shadow-2xl relative overflow-hidden">
          {/* Top broadcast status bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#202944]">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-[#00D6D0]/10 border border-[#00D6D0]/30 text-[#00D6D0] text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-pulse" />
                LIVE BROADCAST FEED
              </div>
              <span className="text-xs font-mono text-[#A5A9C3]">SET: M1 · MARQUEE BATTERS</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#A5A9C3]">LOT #01</span>
              <span className="text-[#E8BD68] font-bold">15s HAMMER TIMER</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 items-center">
            {/* Player Visual Showcase */}
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-[#11182B] border border-[#202944]">
              {samplePlayer && (
                <>
                  <PlayerAvatar player={samplePlayer} size="xl" showRoleBadge />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-[#E8BD68] font-bold uppercase tracking-wider">
                      {samplePlayer.role} · {samplePlayer.country}
                    </span>
                    <h3 className="text-xl font-extrabold font-heading text-[#F5F4FF] truncate">
                      {samplePlayer.name}
                    </h3>
                    <div className="mt-2 text-xs font-mono text-[#A5A9C3]">
                      Base Price:{' '}
                      <span className="text-[#F5F4FF] font-bold">
                        {formatCrores(samplePlayer.basePrice)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bidding Status Center */}
            <div className="text-center p-5 rounded-2xl bg-[#090D1B] border border-[#202944]">
              <span className="text-xs text-[#A5A9C3] uppercase font-semibold">Current Leading Bid</span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#00D6D0] my-1">
                ₹18.50 Cr
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#E8BD68]">
                <span>Held by: Royal Challengers Bengaluru</span>
              </div>
            </div>

            {/* Simulated Bidding Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCurrentTab('auction')}
                  className="py-2.5 rounded-xl bg-[#202944] text-xs font-mono font-bold text-[#F5F4FF] hover:border-[#A78BFA] border border-[#202944] transition-all cursor-pointer"
                >
                  +₹20 Lakhs
                </button>
                <button
                  onClick={() => setCurrentTab('auction')}
                  className="py-2.5 rounded-xl bg-[#202944] text-xs font-mono font-bold text-[#F5F4FF] hover:border-[#A78BFA] border border-[#202944] transition-all cursor-pointer"
                >
                  +₹50 Lakhs
                </button>
                <button
                  onClick={() => setCurrentTab('auction')}
                  className="py-2.5 rounded-xl bg-[#202944] text-xs font-mono font-bold text-[#00D6D0] hover:border-[#00D6D0] border border-[#202944] transition-all cursor-pointer"
                >
                  +₹1.00 Cr
                </button>
              </div>
              <button
                onClick={() => setCurrentTab('auction')}
                className="w-full py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-sm shadow-lg shadow-[#A78BFA]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Gavel className="w-4 h-4" />
                <span>Place Live Bid · ₹19.00 Cr</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* AUCTION FEATURES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#202944]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA] block mb-2">
            Technology & Mechanics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading">
            Engineered for Competitive Auctioneers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944] hover:border-[#A78BFA]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center mb-5 border border-[#A78BFA]/20">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F4FF] mb-2 font-heading">Real-Time Firebase Cloud</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              Every bid, timer reset, and gavel strike synchronizes with sub-millisecond precision across all connected devices using Firestore.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944] hover:border-[#00D6D0]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#00D6D0]/10 text-[#00D6D0] flex items-center justify-center mb-5 border border-[#00D6D0]/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F4FF] mb-2 font-heading">Dynamic Bidding Increments</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              Automated official BCCI price tier brackets: ₹5L increments below ₹1 Cr, scaling up to ₹1.00 Cr increments in high-stakes wars.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944] hover:border-[#E8BD68]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#E8BD68]/10 text-[#E8BD68] flex items-center justify-center mb-5 border border-[#E8BD68]/20">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F5F4FF] mb-2 font-heading">Squad & Purse Governance</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              Strict enforcement of 25-player roster caps, 8 overseas limit, and minimum purse reserves ensure tournament realism.
            </p>
          </div>
        </div>
      </section>

      {/* HOW THE AUCTION WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#202944]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E8BD68] block mb-2">
            Tournament Blueprint
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading">
            How IPL Mega Auction 2027 Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944]">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 text-[#A78BFA] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#A78BFA]/20">
              01
            </div>
            <h3 className="text-base font-bold text-[#F5F4FF] mb-2 font-heading">Squad Retention</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              Lock in up to 6 franchise pillars using official tier deductions (₹18 Cr, ₹14 Cr, ₹11 Cr, ₹4 Cr uncapped).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944]">
            <div className="w-10 h-10 rounded-xl bg-[#00D6D0]/10 text-[#00D6D0] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#00D6D0]/20">
              02
            </div>
            <h3 className="text-base font-bold text-[#F5F4FF] mb-2 font-heading">Marquee Sets</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              Superstar players enter first in sets M1 and M2, followed by specialized sets: Batters, All-Rounders, Keepers, and Bowlers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944]">
            <div className="w-10 h-10 rounded-xl bg-[#20C997]/10 text-[#20C997] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#20C997]/20">
              03
            </div>
            <h3 className="text-base font-bold text-[#F5F4FF] mb-2 font-heading">Live Bidding Arena</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              15-second countdown timer. Each bid raises the stakes with official tiered increments (+₹10L, +₹20L, +₹50L, +₹1 Cr).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#171D35] border border-[#202944]">
            <div className="w-10 h-10 rounded-xl bg-[#E8BD68]/10 text-[#E8BD68] flex items-center justify-center font-bold font-mono text-base mb-4 border border-[#E8BD68]/20">
              04
            </div>
            <h3 className="text-base font-bold text-[#F5F4FF] mb-2 font-heading">The Gavel Falls</h3>
            <p className="text-xs text-[#A5A9C3] leading-relaxed">
              When the timer hits 0, the auctioneer hammers SOLD or marks UNSOLD. Purse and squad limits update instantly.
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE PLAYER SHOWCASE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#202944]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8BD68] block mb-2">
              Top Talent In High Demand
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading">
              Marquee Stars Headline 2027
            </h2>
          </div>

          <button
            onClick={() => setCurrentTab('players')}
            className="text-xs font-bold text-[#A78BFA] hover:text-[#b8a1fb] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Browse Full Player Database ({players.length} players)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {marqueePlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => setCurrentTab('players')}
              className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] hover:border-[#A78BFA]/50 transition-all cursor-pointer flex items-center gap-4 group shadow-md hover:bg-[#202944]"
            >
              <PlayerAvatar player={player} size="lg" showRoleBadge />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#A5A9C3] mb-0.5">
                  <span className="text-[#E8BD68] font-semibold">{player.role}</span>
                  <span>·</span>
                  <span>{player.country}</span>
                </div>
                <h3 className="font-extrabold text-[#F5F4FF] text-base group-hover:text-[#A78BFA] transition-colors truncate">
                  {player.name}
                </h3>
                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A5A9C3]">Base Price:</span>
                  <span className="font-bold text-[#F5F4FF] tabular-nums">
                    {formatCrores(player.basePrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK JOIN ROOM MODAL */}
      {isJoinModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-room-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#090D1B] border border-[#202944] rounded-2xl p-6 shadow-2xl">
            <h2 id="join-room-title" className="text-xl font-extrabold text-[#F5F4FF] font-heading mb-1">
              Join Auction War Room
            </h2>
            <p className="text-xs text-[#A5A9C3] mb-5">
              Enter the 6-character room code shared by your auction host.
            </p>

            <form onSubmit={handleQuickJoin} className="space-y-4">
              <div>
                <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Room Code</label>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. IPL-27"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl bg-[#171D35] border border-[#202944] focus:border-[#A78BFA] text-[#F5F4FF] font-mono text-center tracking-widest text-xl uppercase outline-none focus:ring-1 focus:ring-[#A78BFA]"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="w-1/2 py-3 rounded-xl bg-[#171D35] hover:bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinCodeInput.trim()}
                  className="w-1/2 py-3 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] disabled:opacity-50 text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#A5A9C3] border-t border-[#202944]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-base">🏏</span>
          <span className="font-heading font-extrabold text-[#F5F4FF] tracking-wider text-sm">
            IPL AUCTION ARENA 2027
          </span>
        </div>
        <p className="max-w-md mx-auto mb-5 text-[#A5A9C3]">
          OBSIDIAN ROYAL EDITION · A high-performance cricket auction simulator adhering strictly to official BCCI IPL Mega Auction protocols.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#A5A9C3]">
          <button onClick={() => setCurrentTab('auction')} className="hover:text-[#A78BFA] cursor-pointer">Live Arena</button>
          <span>·</span>
          <button onClick={() => setCurrentTab('teams')} className="hover:text-[#A78BFA] cursor-pointer">Franchises</button>
          <span>·</span>
          <button onClick={() => setCurrentTab('players')} className="hover:text-[#A78BFA] cursor-pointer">Players</button>
          <span>·</span>
          <button onClick={() => setCurrentTab('settings')} className="hover:text-[#A78BFA] cursor-pointer">Tournament Rules</button>
        </div>
      </footer>
    </div>
  );
};
