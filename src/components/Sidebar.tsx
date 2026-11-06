/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { ViewTab } from '../types/auction';
import {
  LayoutDashboard,
  Shield,
  Users,
  UserCheck,
  ArrowLeftRight,
  Gavel,
  History,
  Settings,
  PlusCircle,
  Radio,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { TeamEmblem } from './TeamEmblem';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentTab, setCurrentTab, user, teams, players, activeRoom } = useAuction();

  const userTeam = teams.find((t) => t.id === user.selectedTeamId);
  const remainingPurse = userTeam
    ? (userTeam.totalPurse - userTeam.spentPurse).toFixed(2)
    : '120.00';

  const menuItems: {
    tab: ViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    highlight?: boolean;
    badgeColor?: string;
  }[] = [
    {
      tab: 'dashboard',
      label: 'Command Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      tab: 'auction',
      label: 'Live Auction Arena',
      icon: <Gavel className="w-4 h-4" />,
      badge: activeRoom?.status === 'LIVE_AUCTION' ? 'LIVE' : undefined,
      highlight: true,
      badgeColor: 'bg-[#00D6D0] text-[#090D1B]',
    },
    {
      tab: 'teams',
      label: 'IPL Franchises',
      icon: <Shield className="w-4 h-4" />,
      badge: '10',
    },
    {
      tab: 'players',
      label: 'Player Pool',
      icon: <Users className="w-4 h-4" />,
      badge: `${players.length}`,
    },
    {
      tab: 'retention',
      label: 'Retention Desk',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      tab: 'trade',
      label: 'Trade Centre',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      tab: 'rooms',
      label: 'Multiplayer War Rooms',
      icon: <PlusCircle className="w-4 h-4" />,
      badge: activeRoom?.code || undefined,
    },
    {
      tab: 'history',
      label: 'Records & Leaderboard',
      icon: <History className="w-4 h-4" />,
    },
    {
      tab: 'settings',
      label: 'Settings & BCCI Rules',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setCurrentTab(tab);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-[61px] left-0 z-40 md:z-30 h-screen md:h-[calc(100vh-61px)] w-64 md:w-72 bg-white dark:bg-[#090D1B] border-r border-[#E2E8F4] dark:border-[#202944] p-4 flex flex-col justify-between shrink-0 transition-all duration-300 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header on mobile */}
          <div className="flex md:hidden items-center justify-between pb-3 mb-4 border-b border-[#E2E8F4] dark:border-[#202944]">
            <span className="font-heading font-black text-sm text-[#0C1222] dark:text-white">
              NAVIGATION
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#4A5568] dark:text-[#A5A9C3] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* User Franchise Command Card */}
          {userTeam && (
            <div className="mb-4 p-3.5 rounded-2xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] shadow-sm">
              <div className="flex items-center gap-3">
                <TeamEmblem code={userTeam.code} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                      Your Franchise
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#0C1222] dark:text-white truncate font-heading">
                    {userTeam.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-[#4A5568] dark:text-[#A5A9C3]">Purse Reserve:</span>
                    <span className="text-xs font-mono font-bold text-[#20C997] tabular-nums">
                      ₹{remainingPurse} Cr
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#718096] dark:text-[#6C7293] px-3 block mb-2">
              Auction System
            </span>

            {menuItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleSelectTab(item.tab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-[#7C3AED]/10 dark:bg-[#A78BFA]/15 text-[#7C3AED] dark:text-[#A78BFA] font-bold border-l-4 border-[#7C3AED] dark:border-[#A78BFA] shadow-sm'
                      : 'text-[#4A5568] dark:text-[#A5A9C3] hover:text-[#0C1222] dark:hover:text-[#F5F4FF] hover:bg-[#F0F4FA] dark:hover:bg-[#11182B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-[#7C3AED] dark:text-[#A78BFA]'
                          : 'text-[#718096] dark:text-[#6C7293] group-hover:text-[#0C1222] dark:group-hover:text-white'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? 'bg-[#7C3AED]/20 dark:bg-[#A78BFA]/20 text-[#7C3AED] dark:text-[#A78BFA]'
                          : 'bg-[#E2E8F4] dark:bg-[#171D35] text-[#4A5568] dark:text-[#A5A9C3]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer & BCCI Official Seal */}
        <div className="pt-4 border-t border-[#E2E8F4] dark:border-[#202944] space-y-2">
          <div className="p-3 rounded-2xl bg-[#F0F4FA] dark:bg-[#11182B] border border-[#D8DFEE] dark:border-[#202944] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-pulse" />
              <span className="text-[11px] text-[#4A5568] dark:text-[#A5A9C3]">
                Format: <strong className="text-[#0C1222] dark:text-white">Mega 2027</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#E8BD68]">
              ₹120 Cr
            </span>
          </div>

          <p className="text-[10px] text-center text-[#718096] dark:text-[#6C7293]">
            OBSIDIAN ROYAL · Season 2027
          </p>
        </div>
      </aside>
    </>
  );
};
