/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from './TeamEmblem';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Radio,
  Menu,
  X,
  User,
  LogIn,
  LogOut,
  Check,
  Mail,
  Crown,
  Sparkles,
} from 'lucide-react';
import { ViewTab } from '../types/auction';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const {
    currentTab,
    setCurrentTab,
    theme,
    toggleTheme,
    soundMuted,
    toggleSound,
    user,
    teams,
    activeRoom,
    signInGoogle,
    signOutAccount,
    setIsGmailModalOpen,
  } = useAuction();

  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const remainingPurse = userTeam ? (userTeam.totalPurse - userTeam.spentPurse).toFixed(2) : '120.00';

  const navLinks: { tab: ViewTab; label: string; isLive?: boolean }[] = [
    { tab: 'landing', label: 'Home' },
    { tab: 'auction', label: 'Live Arena', isLive: activeRoom?.status === 'LIVE_AUCTION' },
    { tab: 'teams', label: 'Franchises' },
    { tab: 'players', label: 'Player Pool' },
    { tab: 'retention', label: 'Retention Desk' },
    { tab: 'trade', label: 'Trade Centre' },
    { tab: 'history', label: 'Records' },
  ];

  const handleSignIn = async () => {
    await signInGoogle();
    setIsAuthMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOutAccount();
    setIsAuthMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#090D1B]/95 backdrop-blur-md border-b border-[#E2E8F4] dark:border-[#202944] px-4 lg:px-8 py-3 transition-colors duration-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        {/* Brand Wordmark & Luxury Crest */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A78BFA] via-[#7C3AED] to-[#171D35] p-0.5 shadow-md shadow-[#A78BFA]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090D1B] rounded-[10px] flex items-center justify-center text-[#E8BD68]">
                <Crown className="w-5 h-5 text-[#E8BD68]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-[#00D6D0] leading-none">
                  OBSIDIAN ROYAL
                </span>
              </div>
              <span className="font-heading font-black text-lg lg:text-xl tracking-tight text-[#0C1222] dark:text-[#F5F4FF] group-hover:text-[#A78BFA] transition-colors whitespace-nowrap block mt-0.5">
                IPL ARENA <span className="text-[#E8BD68]">2027</span>
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-semibold tracking-wide">
          {navLinks.map((link) => {
            const isActive = currentTab === link.tab;
            return (
              <button
                key={link.tab}
                onClick={() => setCurrentTab(link.tab)}
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  isActive
                    ? 'border-[#7C3AED] dark:border-[#A78BFA] text-[#7C3AED] dark:text-[#A78BFA] font-bold'
                    : 'border-transparent text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white'
                }`}
              >
                {link.isLive && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#00D6D0]/15 text-[#00D6D0] text-[10px] font-black uppercase">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>LIVE</span>
                  </span>
                )}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* User Franchise Quick Pill */}
          {userTeam && (
            <button
              onClick={() => setCurrentTab('teams')}
              className="hidden sm:flex items-center gap-2 bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] hover:border-[#A78BFA]/50 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
              title="Click to view or switch franchise"
            >
              <TeamEmblem code={userTeam.code} size="xs" />
              <div className="text-left leading-none">
                <span className="block font-bold text-xs text-[#0C1222] dark:text-white">
                  {userTeam.code}
                </span>
                <span className="font-mono text-[11px] font-bold text-[#20C997] tabular-nums">
                  ₹{remainingPurse} Cr
                </span>
              </div>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundMuted ? 'Unmute auction sound effects' : 'Mute auction sound effects'}
            className="p-2 rounded-xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white hover:bg-[#E2E8F4] dark:hover:bg-[#171D35] transition-colors cursor-pointer"
            title={soundMuted ? 'Sound Muted' : 'Sound Enabled'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-[#FF5C75]" /> : <Volume2 className="w-4 h-4 text-[#20C997]" />}
          </button>

          {/* Theme Toggle (Light / Obsidian Royal Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark mode"
            className="p-2 rounded-xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white hover:bg-[#E2E8F4] dark:hover:bg-[#171D35] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Obsidian Royal Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E8BD68]" /> : <Moon className="w-4 h-4 text-[#7C3AED]" />}
          </button>

          {/* Gmail Workspace Dispatch Button */}
          {activeRoom && (
            <button
              onClick={() => setIsGmailModalOpen(true)}
              aria-label="Dispatch auction ledger via Gmail"
              className="p-2 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#EA4335] hover:bg-[#EA4335]/20 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Dispatch Official Report via Gmail (Google Workspace)"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden xl:inline text-xs font-bold">Gmail</span>
            </button>
          )}

          {/* User Authentication Menu Button */}
          <div className="relative">
            <button
              onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
              className="p-2 rounded-xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-white hover:bg-[#E2E8F4] dark:hover:bg-[#171D35] transition-colors cursor-pointer flex items-center gap-1.5"
              title={user.isAuthenticated ? `Signed in as ${user.name}` : 'Sign In'}
            >
              <User className={`w-4 h-4 ${user.isAuthenticated ? 'text-[#20C997]' : 'text-[#A5A9C3]'}`} />
            </button>

            {/* Auth Dropdown */}
            {isAuthMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#171D35] border border-[#D8DFEE] dark:border-[#202944] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="pb-2.5 mb-2.5 border-b border-[#E2E8F4] dark:border-[#202944]">
                  <span className="block text-xs font-bold text-[#0C1222] dark:text-white truncate">
                    {user.name}
                  </span>
                  <span className="block text-[11px] text-[#4A5568] dark:text-[#A5A9C3] truncate">
                    {user.email}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#20C997] font-semibold">
                    <Check className="w-3 h-3" />
                    <span>{user.isAuthenticated ? 'Session Verified' : 'Local Director Mode'}</span>
                  </div>
                </div>

                {/* Quick Gmail action */}
                {activeRoom && (
                  <div className="pb-2.5 mb-2.5 border-b border-[#E2E8F4] dark:border-[#202944]">
                    <button
                      onClick={() => {
                        setIsAuthMenuOpen(false);
                        setIsGmailModalOpen(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#F0F4FA] dark:bg-[#202944] hover:bg-[#E2E8F4] dark:hover:bg-[#2a365a] text-[#0C1222] dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#EA4335]" />
                      <span>Email Auction Ledger (Gmail)</span>
                    </button>
                  </div>
                )}

                {user.isAuthenticated ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#F0F4FA] dark:bg-[#202944] hover:bg-[#FF5C75] text-[#4A5568] dark:text-[#A5A9C3] hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-2 px-3 rounded-xl bg-[#7C3AED] dark:bg-[#A78BFA] hover:bg-[#6D28D9] dark:hover:bg-[#9065F7] text-white dark:text-[#090D1B] text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Google</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Enter Auction Arena CTA Button in Electric Violet */}
          <button
            onClick={() => setCurrentTab('auction')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white dark:text-[#090D1B] bg-[#7C3AED] dark:bg-[#A78BFA] hover:bg-[#6D28D9] dark:hover:bg-[#9065F7] rounded-xl shadow-md shadow-[#A78BFA]/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#00D6D0] dark:text-[#090D1B]" />
            <span>Auction Arena</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] text-[#4A5568] dark:text-[#A5A9C3] hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
