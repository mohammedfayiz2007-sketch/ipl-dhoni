/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuction } from '../../context/AuctionContext';
import { TeamEmblem } from '../../components/TeamEmblem';
import { CheckCircle2, XCircle, Shield, Play, Users, Lock, Radio, Cpu, Sparkles } from 'lucide-react';

export const HostWaitingDashboard: React.FC<{ onLaunchRetention: () => void }> = ({
  onLaunchRetention,
}) => {
  const { activeRoom, teams, user, autoFillRemainingWithBots } = useAuction();

  if (!activeRoom) return null;

  const isHost = activeRoom.hostId === user.id;
  const assignedTeamCount = Object.keys(activeRoom.teamAssignments).length;

  // Readiness Checklist Items
  const checklist = [
    {
      label: 'All 10 Franchises Assigned',
      passed: assignedTeamCount === 10,
      details: `${assignedTeamCount} / 10 teams claimed`,
    },
    {
      label: 'No Duplicate Team Assignments',
      passed: new Set(Object.keys(activeRoom.teamAssignments)).size === assignedTeamCount,
      details: 'Strict 1-to-1 manager allocation',
    },
    {
      label: 'Purse Cap Initialized',
      passed: activeRoom.startingPurse === 120.0,
      details: '₹120.00 Cr budget per franchise',
    },
    {
      label: 'Tournament Format Set',
      passed: activeRoom.format === 'Mega Auction',
      details: 'IPL 2027 Mega Auction Engine',
    },
    {
      label: 'Host Administration Verified',
      passed: isHost,
      details: isHost ? 'You are the authorized host' : `Room host: Admin`,
    },
  ];

  const allReady = checklist.every((c) => c.passed);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 text-[#F5F4FF]">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171D35] via-[#11182B] to-[#171D35] border border-[#202944] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D6D0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E8BD68] mb-1">
              <span>STEP 5 OF 10</span>
              <span>·</span>
              <span>AUCTION LAUNCH CONTROLS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4FF] font-heading">
              Room Readiness & Launch Protocol
            </h1>
            <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1 max-w-xl">
              Verify tournament preconditions before advancing to the mandatory Squad Retention Phase.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] text-center min-w-[150px] shadow-lg">
            <span className="text-[10px] text-[#A5A9C3] block uppercase font-bold tracking-wider">
              Readiness Status
            </span>
            <span
              className={`text-sm font-black uppercase tracking-wider block ${
                allReady ? 'text-[#00D6D0]' : 'text-[#E8BD68]'
              }`}
            >
              {allReady ? '10/10 READY TO START' : 'WAITING FOR 10 TEAMS'}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Checklist */}
        <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#A5A9C3] font-heading">
            Pre-Auction Verification Matrix
          </h2>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#090D1B] border border-[#202944] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {item.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00D6D0] shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#A5A9C3]/50 shrink-0" />
                  )}
                  <div>
                    <span className="block text-xs font-bold text-[#F5F4FF]">{item.label}</span>
                    <span className="text-[11px] text-[#A5A9C3]">{item.details}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    item.passed ? 'bg-[#00D6D0]/15 text-[#00D6D0]' : 'bg-[#202944] text-[#A5A9C3]'
                  }`}
                >
                  {item.passed ? 'PASSED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Auto-Fill for Testing */}
          {isHost && assignedTeamCount < 10 && (
            <button
              onClick={autoFillRemainingWithBots}
              className="w-full py-2.5 rounded-xl bg-[#202944] hover:bg-[#A78BFA] text-[#00D6D0] hover:text-[#090D1B] font-bold text-xs border border-[#00D6D0]/30 hover:border-[#A78BFA] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Fill Remaining {10 - assignedTeamCount} Franchises with BCCI AI Bots</span>
            </button>
          )}
        </div>

        {/* Right: Team Allocation Overview */}
        <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#A5A9C3] font-heading mb-3">
              Franchise Manager Allocations ({assignedTeamCount}/10)
            </h2>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {teams.map((team) => {
                const assignment = activeRoom.teamAssignments[team.id];
                return (
                  <div
                    key={team.id}
                    className="p-2 rounded-xl bg-[#090D1B] border border-[#202944] flex items-center gap-2 text-xs"
                  >
                    <TeamEmblem code={team.code} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold text-[#F5F4FF] truncate">{team.code}</span>
                      <span className="text-[10px] text-[#A5A9C3] block truncate">
                        {assignment ? (assignment.isBot ? '🤖 ' + assignment.userName : assignment.userName) : 'Awaiting Manager'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Start Auction Button */}
          <div className="pt-4 border-t border-[#202944]">
            {isHost ? (
              <button
                onClick={onLaunchRetention}
                disabled={!allReady}
                className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  allReady
                    ? 'bg-gradient-to-r from-[#A78BFA] via-[#00D6D0] to-[#E8BD68] text-[#090D1B] hover:brightness-110 active:scale-[0.98]'
                    : 'bg-[#202944] text-[#A5A9C3]/50 cursor-not-allowed opacity-60'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START RETENTION PHASE (ALL 10 MANAGERS)</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-[#090D1B] text-center text-xs text-[#A5A9C3]">
                Waiting for room host to initiate the retention phase...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
