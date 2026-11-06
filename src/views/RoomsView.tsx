/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import {
  Users,
  PlusCircle,
  LogIn,
  Copy,
  Check,
  Share2,
  Radio,
  Settings,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const RoomsView: React.FC = () => {
  const { activeRoom, createRoom, joinRoom, teams, user, setUserTeam, setCurrentTab } = useAuction();

  // Create form state
  const [roomName, setRoomName] = useState('BCCI Grand Ballroom Mega Auction 2027');
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [format, setFormat] = useState<'Mega Auction' | 'Mini Auction'>('Mega Auction');

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const code = createRoom(roomName, timerSeconds, format);
    setStatusMsg(`War room created successfully! Code: ${code}`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const ok = joinRoom(joinCode.trim());
    if (ok) {
      setStatusMsg(`Connected to auction arena!`);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShareLink = () => {
    if (!activeRoom) return;
    const url = window.location.origin + '?room=' + activeRoom.code;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] font-heading">
          Multiplayer Auction Rooms
        </h1>
        <p className="text-sm text-[#A5A9C3] mt-1">
          Host an auction with friends or let BCCI intelligence bots fill rival franchises.
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-[#20C997]/20 border border-[#20C997] text-[#F5F4FF] text-xs font-semibold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-[#20C997]" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* ACTIVE ROOM DISPLAY (If currently in a room) */}
      {activeRoom && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#202944] to-[#171D35] border border-[#202944] shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00D6D0] mb-1">
                <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-pulse" />
                <span>ONLINE · ROOM ACTIVE</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#F5F4FF] font-heading">{activeRoom.name}</h2>
              <span className="text-xs text-[#A5A9C3]">
                Format: <strong className="text-[#F5F4FF]">{activeRoom.format}</strong> · Timer:{' '}
                <strong className="text-[#E8BD68] font-mono">{activeRoom.bidTimerSeconds}s per bid</strong>
              </span>
            </div>

            {/* Room Code Badge */}
            <div className="flex items-center gap-2">
              <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] text-center shadow-lg">
                <span className="text-[10px] text-[#A5A9C3] uppercase tracking-widest block font-bold">
                  Room Code
                </span>
                <span className="text-2xl font-black font-mono text-[#E8BD68] tracking-wider">
                  {activeRoom.code}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#F5F4FF] text-xs font-bold border border-[#202944] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#E8BD68]" />
                  <span>{copySuccess ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className="px-3.5 py-2 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#F5F4FF] text-xs font-bold border border-[#202944] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#00D6D0]" />
                  <span>Share Link</span>
                </button>
              </div>
            </div>
          </div>

          {/* Franchise Assignments List */}
          <div className="relative z-10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5A9C3] mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#E8BD68]" />
              <span>Franchise Table Assignments</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {teams.map((t) => {
                const conf = activeRoom.teamAssignments[t.id];
                const isUser = user.selectedTeamId === t.id;

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl bg-[#090D1B] border transition-colors ${
                      isUser ? 'border-[#A78BFA] ring-1 ring-[#A78BFA]/30' : 'border-[#202944]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <TeamEmblem code={t.code} size="sm" />
                      <span className="text-xs font-bold text-[#F5F4FF] truncate">{t.name}</span>
                    </div>

                    <div className="text-[11px] text-[#A5A9C3] flex items-center justify-between">
                      <span>{isUser ? '👤 You' : conf?.isBot ? '🤖 AI Bot' : conf?.userName || 'Vacant'}</span>
                      <button
                        onClick={() => setUserTeam(t.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          isUser
                            ? 'bg-[#A78BFA] text-[#090D1B]'
                            : 'bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF]'
                        }`}
                      >
                        {isUser ? 'Active' : 'Claim'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#202944] relative z-10">
            <span className="text-xs text-[#A5A9C3]">
              Ready to start? Enter the live arena table anytime.
            </span>
            <button
              onClick={() => setCurrentTab('auction')}
              className="px-6 py-3 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Enter Auction Arena</span>
            </button>
          </div>
        </div>
      )}

      {/* CREATE & JOIN TABS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CREATE ROOM CARD */}
        <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
          <h2 className="text-base font-bold text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#A78BFA]" />
            <span>Create New Auction Room</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-xs text-[#F5F4FF] outline-none focus:border-[#A78BFA]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'Mega Auction' | 'Mini Auction')}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-xs text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
                >
                  <option value="Mega Auction">Mega Auction 2027</option>
                  <option value="Mini Auction">Mini Auction 2027</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Bid Timer</label>
                <select
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-xs text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
                >
                  <option value={10}>10 Seconds (Fast)</option>
                  <option value={15}>15 Seconds (Standard)</option>
                  <option value={30}>30 Seconds (Deliberate)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all cursor-pointer"
            >
              Generate New War Room
            </button>
          </form>
        </div>

        {/* JOIN ROOM CARD */}
        <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
          <h2 className="text-base font-bold text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-[#00D6D0]" />
            <span>Join Existing Room</span>
          </h2>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">Enter Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. IPL-27"
                maxLength={10}
                className="w-full px-4 py-3 rounded-xl bg-[#090D1B] border border-[#202944] text-lg font-mono text-center tracking-widest text-[#F5F4FF] uppercase outline-none focus:border-[#00D6D0]"
                required
              />
            </div>

            <p className="text-xs text-[#A5A9C3]">
              Ask your auction room host for their unique room code to join and take command of a vacant franchise.
            </p>

            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="w-full py-3.5 rounded-xl bg-[#00D6D0] hover:bg-[#18ece6] disabled:opacity-40 text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#00D6D0]/20 transition-all cursor-pointer"
            >
              Connect to War Room
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
