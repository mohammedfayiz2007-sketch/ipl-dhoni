/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types/auction';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showRoleBadge?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = 'md',
  className = '',
  showRoleBadge = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-24 h-24 rounded-2xl',
    xl: 'w-32 h-32 rounded-3xl',
    '2xl': 'w-44 h-44 rounded-3xl',
  };

  const roleIcons = {
    Batter: '🏏',
    Bowler: '🎯',
    'All-Rounder': '⚡',
    Wicketkeeper: '🧤',
  };

  // Extract initials
  const initials = player.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Distinct role color gradients
  const roleGradients = {
    Batter: 'from-amber-600/30 to-amber-950/80 border-amber-500/40 text-amber-200',
    Bowler: 'from-blue-600/30 to-blue-950/80 border-blue-500/40 text-blue-200',
    'All-Rounder': 'from-emerald-600/30 to-emerald-950/80 border-emerald-500/40 text-emerald-200',
    Wicketkeeper: 'from-purple-600/30 to-purple-950/80 border-purple-500/40 text-purple-200',
  };

  const countryFlags: Record<string, string> = {
    India: '🇮🇳',
    Australia: '🇦🇺',
    England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'South Africa': '🇿🇦',
    'West Indies': '🏝️',
    'New Zealand': '🇳🇿',
    Afghanistan: '🇦🇫',
    'Sri Lanka': '🇱🇰',
  };

  const renderContent = () => {
    if (player.imageUrl && !imageFailed) {
      return (
        <img
          src={player.imageUrl}
          alt={player.name}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover"
        />
      );
    }

    if (size === 'xs') {
      return (
        <span className="font-heading font-black text-[10px] leading-none text-white/95">
          {initials}
        </span>
      );
    }

    if (size === 'sm') {
      return (
        <div className="flex flex-col items-center justify-center leading-none text-center">
          <span className="text-[11px] leading-none mb-0.5">{roleIcons[player.role]}</span>
          <span className="font-heading font-extrabold text-[9px] leading-none text-white/90">
            {initials}
          </span>
        </div>
      );
    }

    if (size === 'md') {
      return (
        <div className="flex flex-col items-center justify-center text-center p-1">
          <span className="text-lg drop-shadow leading-none mb-1">{roleIcons[player.role]}</span>
          <span className="font-heading tracking-wider font-extrabold text-xs text-white/90 leading-none">
            {initials}
          </span>
        </div>
      );
    }

    if (size === 'lg') {
      return (
        <div className="flex flex-col items-center justify-center text-center p-2">
          <span className="text-3xl drop-shadow mb-1">{roleIcons[player.role]}</span>
          <span className="font-heading tracking-wider font-extrabold text-sm text-white/90">
            {initials}
          </span>
        </div>
      );
    }

    // xl and 2xl
    return (
      <div className="flex flex-col items-center justify-center text-center p-3">
        <span className="text-4xl drop-shadow mb-1.5">{roleIcons[player.role]}</span>
        <span className="font-heading tracking-wider font-extrabold text-base sm:text-lg text-white/90">
          {initials}
        </span>
      </div>
    );
  };

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      <div
        className={`relative overflow-hidden flex items-center justify-center font-bold bg-gradient-to-b ${
          roleGradients[player.role]
        } border shadow-inner ${sizeClasses[size]}`}
      >
        {renderContent()}

        {/* Marquee star badge */}
        {player.marquee && (
          <div
            className={`absolute bg-[#F5B942] text-[#080D1A] font-black rounded shadow flex items-center justify-center ${
              size === 'xs'
                ? 'top-0.5 right-0.5 w-2 h-2 rounded-full p-0 text-[6px]'
                : 'top-1 right-1 text-[9px] px-1 py-0.2'
            }`}
          >
            <span>★</span>
          </div>
        )}
      </div>

      {/* Country & Role mini badges */}
      {showRoleBadge && size !== 'xs' && (
        <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-[#10192B] border border-[#21304d] rounded-full px-1.5 py-0.5 shadow-md text-[10px]">
          <span>{countryFlags[player.country] || '🏏'}</span>
          <span className="font-medium text-slate-300">{player.role.slice(0, 3)}</span>
        </div>
      )}
    </div>
  );
};
