/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { PlayerAvatar } from './PlayerAvatar';
import { TeamEmblem } from './TeamEmblem';
import { formatCrores } from '../data/iplData';
import { Sparkles, ArrowRight } from 'lucide-react';

export const SoldCelebrationModal: React.FC = () => {
  const { soldPlayerCelebration, clearCelebration } = useAuction();

  if (!soldPlayerCelebration) return null;

  const { player, team, price } = soldPlayerCelebration;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sold-celebration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in zoom-in-95 duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#090D1B] border-2 border-[#E8BD68] rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-[#E8BD68]/20 overflow-hidden text-[#F5F4FF]">
        {/* Glow ambient background rings */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E8BD68]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#00D6D0]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Gavel Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8BD68] to-[#cba04a] text-[#090D1B] flex items-center justify-center text-3xl shadow-xl mb-4 animate-hammer">
          🔨
        </div>

        {/* Big SOLD Headline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D6D0]/15 border border-[#00D6D0]/40 text-[#00D6D0] text-xs font-black uppercase tracking-widest mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HAMMER FALLS · SOLD</span>
        </div>

        <h2 id="sold-celebration-title" className="text-3xl sm:text-4xl font-extrabold text-[#F5F4FF] tracking-tight font-heading">
          {player.name}
        </h2>
        <p className="text-xs text-[#A5A9C3] mt-1">
          {player.role} · {player.country} · {player.battingStyle}
        </p>

        {/* Player and Winning Franchise showcase */}
        <div className="my-6 p-4 rounded-2xl bg-[#171D35] border border-[#202944] flex items-center justify-around gap-4 shadow-inner">
          <div className="flex flex-col items-center">
            <PlayerAvatar player={player} size="lg" />
            <span className="text-[11px] text-[#A5A9C3] mt-1.5 font-medium">Acquired Player</span>
          </div>

          <div className="text-xl text-[#E8BD68] font-black">➔</div>

          <div className="flex flex-col items-center">
            <TeamEmblem code={team.code} size="lg" />
            <span className="text-xs font-bold text-[#F5F4FF] mt-1.5 truncate max-w-[120px]">
              {team.name}
            </span>
            <span className="text-[10px] text-[#A5A9C3]">Winning Franchise</span>
          </div>
        </div>

        {/* Winning Price in large tabular-nums font */}
        <div className="mb-6">
          <span className="text-xs uppercase tracking-wider text-[#A5A9C3] block mb-1">
            Winning Auction Price
          </span>
          <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#E8BD68] tabular-nums tracking-tight">
            {formatCrores(price)}
          </div>
        </div>

        <button
          onClick={clearCelebration}
          className="w-full py-3.5 px-6 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-sm tracking-wide shadow-lg shadow-[#A78BFA]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Auction</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
