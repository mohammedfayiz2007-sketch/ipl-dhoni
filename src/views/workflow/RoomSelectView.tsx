/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { PlusCircle, LogIn, Shield, DollarSign, Clock, Users, ArrowRight, HelpCircle } from 'lucide-react';

export const RoomSelectView: React.FC = () => {
  const { createRoom, joinRoom, user } = useAuction();

  // Create Room state
  const [roomName, setRoomName] = useState('IPL Mega Auction 2027');
  const [purse, setPurse] = useState<number>(120.0);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [maxRetentions, setMaxRetentions] = useState<number>(6);

  // Join Room state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom(roomName, timerSeconds, 'Mega Auction');
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (!joinCode.trim()) return;
    const ok = joinRoom(joinCode.trim());
    if (!ok) {
      setJoinError('Invalid room code or auction session ended.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-[#F5F4FF]">
      {/* Welcome Executive Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#11182B] to-[#171D35] border border-[#202944] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A78BFA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E8BD68] mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D6D0] animate-pulse" />
              <span>BCCI OFFICIAL PORTAL</span>
              <span>·</span>
              <span>SEASON 2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4FF] font-heading">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1 max-w-xl">
              Host your own 10-franchise Mega Auction War Room or enter an active room code shared by another director.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] text-center min-w-[150px] shadow-lg">
            <span className="text-[10px] text-[#A5A9C3] block uppercase font-bold tracking-wider">
              Signed in as
            </span>
            <span className="text-xs font-bold text-[#F5F4FF] block truncate max-w-[160px]">{user.email}</span>
            <span className="text-[10px] text-[#00D6D0] font-semibold flex items-center justify-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D6D0]" />
              Active Session
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Create Room vs Join Room */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OPTION A: CREATE AUCTION ROOM */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171D35] border border-[#202944] hover:border-[#A78BFA]/50 transition-all flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] flex items-center justify-center font-bold border border-[#A78BFA]/30">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-[#F5F4FF] font-heading">
                Create War Room
              </h2>
            </div>
            <p className="text-xs text-[#A5A9C3] mb-6">
              You will become the room host/admin with full sequential tournament controls.
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">
                  Auction Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#090D1B] border border-[#202944] text-xs text-[#F5F4FF] focus:border-[#A78BFA] outline-none focus:ring-1 focus:ring-[#A78BFA]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">
                    Auction Type
                  </label>
                  <input
                    type="text"
                    value="Mega Auction"
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-xs text-[#A5A9C3] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">
                    Tournament Season
                  </label>
                  <input
                    type="text"
                    value="IPL 2027 Simulation"
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-xs text-[#A5A9C3] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">
                    Starting Purse Per Team
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={purse}
                      onChange={(e) => setPurse(parseFloat(e.target.value) || 120)}
                      step="5"
                      min="100"
                      max="150"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-xs font-mono text-[#F5F4FF] focus:border-[#A78BFA] outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#E8BD68] font-mono font-bold">
                      Cr
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#A5A9C3] block mb-1.5 font-medium">
                    Max Teams
                  </label>
                  <input
                    type="text"
                    value="10 Franchises"
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-xs text-[#A5A9C3] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Auction Rules Overview */}
              <div className="p-3.5 rounded-xl bg-[#090D1B] border border-[#202944] text-[11px] text-[#A5A9C3] space-y-1">
                <div className="flex items-center gap-1.5 text-[#E8BD68] font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Configured Rules:</span>
                </div>
                <p>• Max 6 retained players with standard BCCI tier deductions.</p>
                <p>• 15-second bidding countdown per call with automated gavel.</p>
                <p>• Exactly 10 participating team managers required before start.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Create Room & Generate Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* OPTION B: JOIN AUCTION ROOM */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171D35] border border-[#202944] hover:border-[#00D6D0]/50 transition-all flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00D6D0]/15 text-[#00D6D0] flex items-center justify-center font-bold border border-[#00D6D0]/30">
                <LogIn className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-[#F5F4FF] font-heading">
                Join Auction Room
              </h2>
            </div>
            <p className="text-xs text-[#A5A9C3] mb-6">
              Enter the unique room code provided by your tournament host.
            </p>

            {joinError && (
              <div className="p-3 mb-4 rounded-xl bg-[#FF5C75]/15 border border-[#FF5C75] text-[#F5F4FF] text-xs font-semibold">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinRoom} className="space-y-5">
              <div>
                <label className="text-xs text-[#A5A9C3] block mb-2 font-medium">
                  Enter Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. IPL27X92"
                  maxLength={12}
                  className="w-full px-4 py-4 rounded-2xl bg-[#090D1B] border-2 border-[#202944] focus:border-[#00D6D0] text-xl font-mono text-center tracking-widest text-[#F5F4FF] uppercase outline-none transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944] text-xs text-[#A5A9C3] space-y-2">
                <span className="font-bold text-[#F5F4FF] block">Next Steps After Joining:</span>
                <ol className="list-decimal list-inside space-y-1 text-[#A5A9C3] text-[11px]">
                  <li>Enter the room lobby with other participants.</li>
                  <li>Pick your IPL franchise from the 10 available teams.</li>
                  <li>Wait for all 10 managers before the host launches retention!</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="w-full py-3.5 rounded-xl bg-[#00D6D0] hover:bg-[#12ebe5] disabled:opacity-40 text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#00D6D0]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Enter Room Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-[#202944] text-center text-xs text-[#A5A9C3]">
            <span>Room codes are case-insensitive and generated per session.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
