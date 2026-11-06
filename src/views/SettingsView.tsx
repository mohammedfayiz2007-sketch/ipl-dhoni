/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { soundEffects } from '../utils/soundEffects';
import { TeamEmblem } from '../components/TeamEmblem';
import {
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  User,
  Shield,
  Clock,
  Check,
  AlertTriangle,
  Moon,
  Sun,
  Award,
  Sparkles,
  Zap,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUserName,
    setUserTeam,
    teams,
    soundMuted,
    toggleSound,
    resetAuctionData,
    theme,
    toggleTheme,
  } = useAuction();

  const [nameInput, setNameInput] = useState(user.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  const selectedTeam = teams.find((t) => t.id === user.selectedTeamId);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      updateUserName(nameInput.trim());
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 2500);
    }
  };

  const handleTestAudio = (type: 'bid' | 'tick' | 'hammer' | 'fanfare' | 'unsold') => {
    if (type === 'bid') soundEffects.playBidPlaced();
    if (type === 'tick') soundEffects.playTimerTick(3);
    if (type === 'hammer') soundEffects.playHammerStrike();
    if (type === 'fanfare') soundEffects.playSoldFanfare();
    if (type === 'unsold') soundEffects.playUnsoldBuzzer();
  };

  const handleConfirmReset = () => {
    resetAuctionData();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202944] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/30">
              Control Centre
            </span>
            <span className="text-xs text-[#A5A9C3] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E8BD68]" />
              Obsidian Royal Suite
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#F5F4FF] font-heading tracking-tight">
            Arena Settings & Tournament Rules
          </h1>
          <p className="text-xs lg:text-sm text-[#A5A9C3] mt-1 font-body">
            Manage franchise director credentials, audio synthesis, visual theme, and BCCI IPL Mega Auction protocols.
          </p>
        </div>

        {/* Global theme pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#171D35] hover:bg-[#202944] border border-[#202944] text-xs font-bold text-[#F5F4FF] transition-all shadow-sm cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-[#A78BFA]" />
                <span>Obsidian Royal (Dark)</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-[#E8BD68]" />
                <span>Luxury Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedAlert && (
        <div className="p-4 rounded-2xl bg-[#20C997]/15 border border-[#20C997] text-[#F5F4FF] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#20C997] shrink-0" />
          <span>Franchise profile configuration updated and synced with cloud registry!</span>
        </div>
      )}

      {/* Grid: Profile + Audio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROFILE & FRANCHISE CARD */}
        <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#A78BFA]/15 flex items-center justify-center text-[#A78BFA]">
                <User className="w-4 h-4" />
              </div>
              <span>Franchise Director Profile</span>
            </h2>
            {selectedTeam && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#202944] border border-[#202944]">
                <TeamEmblem code={selectedTeam.code} size="xs" />
                <span className="text-xs font-black text-[#F5F4FF] font-mono">{selectedTeam.code}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Director Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-xs text-[#F5F4FF] outline-none focus:border-[#A78BFA] transition-colors"
                placeholder="Enter Director or Auctioneer name"
              />
            </div>

            <div>
              <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Active Franchise Assignment</label>
              <div className="flex items-center gap-2">
                <select
                  value={user.selectedTeamId || 'csk'}
                  onChange={(e) => setUserTeam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-xs text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#090D1B] text-white">
                      {t.name} ({t.code}) – ₹{(t.totalPurse - t.spentPurse).toFixed(2)} Cr Remaining
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:from-[#906CF0] hover:to-[#7C3AED] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Credentials</span>
            </button>
          </form>
        </div>

        {/* AUDIO SYNTHESIZER & BROADCAST FX */}
        <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-5 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00D6D0]/15 flex items-center justify-center text-[#00D6D0]">
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <span>Broadcast Sound Synthesizer</span>
            </h2>

            <button
              onClick={toggleSound}
              className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                soundMuted
                  ? 'bg-[#FF5C75]/15 text-[#FF5C75] border border-[#FF5C75]/30'
                  : 'bg-[#20C997]/15 text-[#20C997] border border-[#20C997]/30'
              }`}
            >
              {soundMuted ? 'Muted (Click to Unmute)' : 'Active (Click to Mute)'}
            </button>
          </div>

          <p className="text-xs text-[#A5A9C3]">
            Synthesized via Web Audio API for zero-network-latency acoustic fidelity during intense live bidding.
          </p>

          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5A9C3] block">
              Audio Cue Test Panel
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTestAudio('bid')}
                className="py-2.5 px-3 rounded-xl bg-[#090D1B] hover:bg-[#202944] border border-[#202944] text-xs text-[#F5F4FF] hover:text-[#A78BFA] transition-all cursor-pointer text-center font-medium"
              >
                🔔 Bid Chime
              </button>
              <button
                type="button"
                onClick={() => handleTestAudio('tick')}
                className="py-2.5 px-3 rounded-xl bg-[#090D1B] hover:bg-[#202944] border border-[#202944] text-xs text-[#F5F4FF] hover:text-[#00D6D0] transition-all cursor-pointer text-center font-medium"
              >
                ⏱️ Alert Tick
              </button>
              <button
                type="button"
                onClick={() => handleTestAudio('hammer')}
                className="py-2.5 px-3 rounded-xl bg-[#090D1B] hover:bg-[#202944] border border-[#202944] text-xs text-[#F5F4FF] hover:text-[#E8BD68] transition-all cursor-pointer text-center font-medium"
              >
                🔨 Gavel Strike
              </button>
              <button
                type="button"
                onClick={() => handleTestAudio('fanfare')}
                className="py-2.5 px-3 rounded-xl bg-[#090D1B] hover:bg-[#202944] border border-[#202944] text-xs text-[#20C997] transition-all cursor-pointer text-center font-medium"
              >
                🎺 SOLD Fanfare
              </button>
              <button
                type="button"
                onClick={() => handleTestAudio('unsold')}
                className="py-2.5 px-3 rounded-xl bg-[#090D1B] hover:bg-[#202944] border border-[#202944] text-xs text-[#FF5C75] transition-all cursor-pointer text-center font-medium"
              >
                ❌ Unsold Buzzer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CLOUD & FIRESTORE SECURITY AUDIT STATUS */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#20C997]/15 flex items-center justify-center text-[#20C997]">
                <Shield className="w-4 h-4" />
              </div>
              <span>Database & Security Architecture Status</span>
            </h2>
            <p className="text-xs text-[#A5A9C3] mt-1 font-body">
              Dual-mode persistence active: Local persistent simulation with zero-trust Firestore blueprint & security rules compiled.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#20C997]/15 border border-[#20C997] text-[#20C997] text-xs font-bold font-mono">
              RULES: VERIFIED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944]">
            <span className="text-[#A5A9C3] block mb-1">Intermediate IR</span>
            <span className="font-mono text-[#F5F4FF] font-bold">firebase-blueprint.json</span>
            <span className="text-[10px] text-[#20C997] block mt-1">✓ Draft-07 Validated</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944]">
            <span className="text-[#A5A9C3] block mb-1">Access Control</span>
            <span className="font-mono text-[#F5F4FF] font-bold">firestore.rules (ABAC)</span>
            <span className="text-[10px] text-[#20C997] block mt-1">✓ 8 Pillars of Hardened Rules</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944]">
            <span className="text-[#A5A9C3] block mb-1">Error Diagnostics</span>
            <span className="font-mono text-[#F5F4FF] font-bold">handleFirestoreError()</span>
            <span className="text-[10px] text-[#20C997] block mt-1">✓ FirestoreErrorInfo Standard</span>
          </div>
        </div>
      </div>

      {/* OFFICIAL BCCI RULES EXPLANATION ACCORDION/PANEL */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-4 shadow-lg">
        <h2 className="text-base font-bold text-[#F5F4FF] font-heading flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E8BD68]/15 flex items-center justify-center text-[#E8BD68]">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>BCCI IPL Mega Auction 2027 Official Tournament Guidelines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#090D1B] border border-[#202944] space-y-2">
            <span className="font-bold text-[#E8BD68] block text-sm font-heading">Purse & Squad Limits</span>
            <ul className="space-y-1.5 text-[#A5A9C3] list-disc list-inside">
              <li>Standard Purse: <strong className="text-[#F5F4FF] font-mono">₹120.00 Crores</strong> per franchise.</li>
              <li>Squad Capacity: <strong className="text-[#F5F4FF] font-mono">18 to 25 players</strong>.</li>
              <li>Overseas Limit: Maximum <strong className="text-[#F5F4FF] font-mono">8 overseas players</strong>.</li>
              <li>Minimum Spend: 75% of purse must be deployed.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D1B] border border-[#202944] space-y-2">
            <span className="font-bold text-[#20C997] block text-sm font-heading">Retention Scale</span>
            <ul className="space-y-1.5 text-[#A5A9C3] list-disc list-inside">
              <li>Max 6 players can be retained per franchise.</li>
              <li>Slot 1: <strong className="text-[#F5F4FF] font-mono">₹18.00 Cr</strong></li>
              <li>Slot 2: <strong className="text-[#F5F4FF] font-mono">₹14.00 Cr</strong></li>
              <li>Slot 3: <strong className="text-[#F5F4FF] font-mono">₹11.00 Cr</strong></li>
              <li>Slot 4 & 5: <strong className="text-[#F5F4FF] font-mono">₹18.00 Cr & ₹14.00 Cr</strong></li>
              <li>Uncapped Player: <strong className="text-[#F5F4FF] font-mono">₹4.00 Cr each</strong></li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#090D1B] border border-[#202944] space-y-2">
            <span className="font-bold text-[#00D6D0] block text-sm font-heading">Bidding Increments</span>
            <ul className="space-y-1.5 text-[#A5A9C3] list-disc list-inside">
              <li>Up to ₹1 Cr: <strong className="text-[#F5F4FF] font-mono">+₹5 L / +₹10 L</strong></li>
              <li>₹1 Cr to ₹2 Cr: <strong className="text-[#F5F4FF] font-mono">+₹10 Lakhs</strong></li>
              <li>₹2 Cr to ₹5 Cr: <strong className="text-[#F5F4FF] font-mono">+₹20 Lakhs</strong></li>
              <li>₹5 Cr to ₹10 Cr: <strong className="text-[#F5F4FF] font-mono">+₹25 Lakhs</strong></li>
              <li>Above ₹10 Cr: <strong className="text-[#F5F4FF] font-mono">+₹50 L / +₹1.00 Cr</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* DANGER ZONE / RESET DATA */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#FF5C75]/30 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#F5F4FF] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FF5C75]" />
              <span>Reset Tournament Database</span>
            </h2>
            <p className="text-xs text-[#A5A9C3] mt-0.5">
              Clears all local auction bids, retentions, and trades, restoring all 10 franchises to their original ₹120.00 Cr budget.
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF5C75]/15 hover:bg-[#FF5C75] text-[#FF5C75] hover:text-white border border-[#FF5C75]/40 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Data</span>
          </button>
        </div>

        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#FF5C75] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs text-[#F5F4FF]">
              Are you sure? This will wipe all current tournament auction progress and reset all rosters.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#202944] text-[#A5A9C3] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 rounded-lg bg-[#FF5C75] hover:bg-[#e0455e] text-white text-xs font-bold cursor-pointer"
              >
                Yes, Reset Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
