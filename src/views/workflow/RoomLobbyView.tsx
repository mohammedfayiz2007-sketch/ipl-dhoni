/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { TeamEmblem } from '../../components/TeamEmblem';
import {
  Copy,
  Share2,
  Check,
  Users,
  Shield,
  ArrowRight,
  QrCode,
  Radio,
  Cpu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const RoomLobbyView: React.FC<{ onNavigateToTeamSelect: () => void }> = ({
  onNavigateToTeamSelect,
}) => {
  const { activeRoom, teams, user, autoFillRemainingWithBots } = useAuction();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!activeRoom) return null;

  const isHost = activeRoom.hostId === user.id;
  const roomUrl = window.location.origin + '?room=' + activeRoom.code;

  // Count assigned teams
  const assignedTeamCount = Object.keys(activeRoom.teamAssignments).length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `🏏 Join my IPL Mega Auction 2027 War Room!\n\nRoom Name: ${activeRoom.name}\nRoom Code: ${activeRoom.code}\n\nJoin link: ${roomUrl}`
  )}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 text-[#F5F4FF]">
      {/* Lobby Hero & Sharing Strip */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#11182B] to-[#171D35] border border-[#202944] shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D6D0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00D6D0] mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D6D0] animate-pulse shadow-[0_0_8px_#00D6D0]" />
              <span>WAR ROOM LOBBY ACTIVE · MULTIPLAYER SYNCHRONIZED</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F5F4FF] font-heading tracking-tight">
              {activeRoom.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1">
              Season: <strong className="text-[#F5F4FF]">IPL 2027 Simulation</strong> · Format:{' '}
              <strong className="text-[#E8BD68]">Mega Auction (₹{activeRoom.startingPurse} Cr Starting Purse)</strong>
            </p>
          </div>

          {/* Room Code Showcase */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#090D1B] p-4 rounded-2xl border border-[#202944] shadow-lg">
            <div className="text-center sm:text-left">
              <span className="text-[10px] text-[#A5A9C3] font-bold uppercase tracking-wider block">
                Official Room Code
              </span>
              <span className="text-3xl font-black font-mono text-[#E8BD68] tracking-widest block">
                {activeRoom.code}
              </span>
            </div>

            {/* QR Code Vector Representation */}
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#090D1B]" fill="currentColor">
                <rect x="10" y="10" width="30" height="30" rx="4" />
                <rect x="18" y="18" width="14" height="14" fill="white" />
                <rect x="60" y="10" width="30" height="30" rx="4" />
                <rect x="68" y="18" width="14" height="14" fill="white" />
                <rect x="10" y="60" width="30" height="30" rx="4" />
                <rect x="18" y="68" width="14" height="14" fill="white" />
                <rect x="50" y="50" width="12" height="12" />
                <rect x="70" y="55" width="10" height="10" />
                <rect x="55" y="75" width="12" height="12" />
                <rect x="75" y="75" width="15" height="15" />
              </svg>
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="pt-4 border-t border-[#202944] flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#F5F4FF] text-xs font-bold border border-[#202944] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#E8BD68]" />
              <span>{copiedCode ? 'Room Code Copied!' : 'Copy Room Code'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#F5F4FF] text-xs font-bold border border-[#202944] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00D6D0]" />
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#20C997] hover:bg-[#1db889] text-[#090D1B] text-xs font-extrabold transition-colors flex items-center gap-2 cursor-pointer shadow-md inline-flex items-center"
            >
              <span>📱 Share via WhatsApp</span>
            </a>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#E8BD68]">
              Participants Joined: {activeRoom.participants.length} / 10
            </span>
          </div>
        </div>
      </div>

      {/* WAITING LIST: ALL 10 IPL TEAMS STATUS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171D35] border border-[#202944] space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#F5F4FF] font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E8BD68]" />
              <span>Franchise Waiting List & Reservation Status</span>
            </h2>
            <p className="text-xs text-[#A5A9C3] mt-1">
              Teams Selected: <strong className="text-[#F5F4FF] font-mono">{assignedTeamCount} / 10</strong>.
              All 10 teams must be assigned before the host can launch the auction.
            </p>
          </div>

          {/* Primary Action to Select Team */}
          <button
            onClick={onNavigateToTeamSelect}
            className="px-5 py-3 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Select Your Franchise</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Teams List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {teams.map((team) => {
            const assignment = activeRoom.teamAssignments[team.id];
            const isAssigned = Boolean(assignment);
            const isMyTeam = assignment?.userId === user.id;

            return (
              <div
                key={team.id}
                className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
                  isMyTeam
                    ? 'bg-[#202944] border-[#A78BFA] ring-1 ring-[#A78BFA]/40 shadow-lg'
                    : isAssigned
                    ? 'bg-[#090D1B] border-[#202944]'
                    : 'bg-[#11182B] border-[#202944]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <TeamEmblem code={team.code} size="md" />
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-[#F5F4FF] truncate">
                      {team.name}
                    </span>
                    <span className="text-xs text-[#A5A9C3] font-mono">
                      Purse: ₹{team.totalPurse.toFixed(2)} Cr
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isMyTeam ? (
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#A78BFA] text-[#090D1B] uppercase tracking-wide shadow-sm">
                      Selected By You
                    </span>
                  ) : isAssigned ? (
                    <div className="text-right">
                      <span className="block text-xs font-bold text-[#F5F4FF]">
                        {assignment.isBot ? '🤖 ' + assignment.userName : '👤 ' + assignment.userName}
                      </span>
                      <span className="text-[10px] text-[#A5A9C3] font-medium uppercase">
                        Reserved
                      </span>
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#202944] text-[#00D6D0] border border-[#00D6D0]/30">
                      Available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Host AI Auto-fill helper (Allows solo or small groups to test full 10-team auction) */}
        {isHost && assignedTeamCount < 10 && (
          <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#A78BFA]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#F5F4FF] block">
                Testing or playing with fewer than 10 human participants?
              </span>
              <span className="text-[11px] text-[#A5A9C3]">
                You can auto-fill vacant franchises with BCCI Intelligence Bots to satisfy the 10/10 rule.
              </span>
            </div>

            <button
              onClick={autoFillRemainingWithBots}
              className="px-4 py-2.5 rounded-xl bg-[#202944] hover:bg-[#A78BFA] text-[#00D6D0] hover:text-[#090D1B] font-bold text-xs border border-[#00D6D0]/30 hover:border-[#A78BFA] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Auto-Fill Vacant with Bots</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
