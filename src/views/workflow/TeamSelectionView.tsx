/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { IPLTeam } from '../../types/auction';
import { TeamEmblem } from '../../components/TeamEmblem';
import { Shield, Check, MapPin, Trophy, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface TeamSelectionViewProps {
  onComplete: () => void;
  onNext?: () => void;
}

export const TeamSelectionView: React.FC<TeamSelectionViewProps> = ({ onComplete, onNext }) => {
  const { activeRoom, teams, user, claimFranchiseInRoom, setWorkflowStep } = useAuction();
  const [teamToConfirm, setTeamToConfirm] = useState<IPLTeam | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeRoom) return null;

  const isHost = Boolean(activeRoom.hostId === user.id);
  const myAssignedTeam = Object.entries(activeRoom.teamAssignments).find(
    ([_, assignment]) => assignment.userId === user.id
  );
  const hasSelectedTeam = Boolean(myAssignedTeam);

  // Total selected teams
  const selectedCount = Object.keys(activeRoom.teamAssignments).length;

  const handleSelectTeam = (team: IPLTeam) => {
    // Check if team is already claimed by someone else
    const currentOwner = activeRoom.teamAssignments[team.id];
    if (currentOwner && currentOwner.userId !== user.id) {
      setErrorMsg(`${team.name} is already reserved by ${currentOwner.userName}.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setTeamToConfirm(team);
  };

  const confirmSelection = () => {
    if (!teamToConfirm) return;
    claimFranchiseInRoom(teamToConfirm.id);
    setTeamToConfirm(null);
    if (!isHost) {
      onComplete();
    }
  };

  const handleHostNext = () => {
    if (!hasSelectedTeam) {
      setErrorMsg('Please select your franchise before proceeding to Step 5 (10 Teams Ready).');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }
    if (onNext) {
      onNext();
    } else {
      setWorkflowStep('READY_CHECK');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 text-[#F5F4FF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E8BD68] mb-1">
            <span>STEP 4 OF 10</span>
            <span>·</span>
            <span>FRANCHISE ALLOCATION</span>
            {isHost && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#E8BD68] text-[#090D1B]">
                Host
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F4FF] font-heading">
            Select Your IPL Franchise
          </h1>
          <p className="text-xs sm:text-sm text-[#A5A9C3] mt-1">
            Each participant commands exactly one franchise. Official 2027 starting purse: ₹120.00 Cr.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onComplete}
            className="px-3.5 py-2.5 rounded-2xl bg-[#171D35] hover:bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] font-semibold text-xs border border-[#202944] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lobby</span>
          </button>

          <div className="p-3 rounded-2xl bg-[#171D35] border border-[#202944] text-center min-w-[130px] shadow-lg">
            <span className="text-[10px] text-[#A5A9C3] block uppercase font-bold tracking-wider">
              Claimed
            </span>
            <span className="text-lg font-extrabold font-mono text-[#00D6D0] tabular-nums">
              {selectedCount} / 10
            </span>
          </div>

          {/* NEXT BUTTON ONLY FOR HOST */}
          {isHost && (
            <button
              onClick={handleHostNext}
              className="px-5 py-2.5 rounded-2xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FF5C75]/15 border border-[#FF5C75] text-[#F5F4FF] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-[#FF5C75] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of 10 Franchises with official brand accents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => {
          const assignment = activeRoom.teamAssignments[team.id];
          const isSelectedByMe = assignment?.userId === user.id;
          const isReservedByOther = assignment && assignment.userId !== user.id;

          return (
            <div
              key={team.id}
              className={`p-5 rounded-3xl border transition-all relative overflow-hidden group ${
                isSelectedByMe
                  ? 'bg-[#202944] border-[#A78BFA] ring-2 ring-[#A78BFA]/40 shadow-2xl'
                  : isReservedByOther
                  ? 'bg-[#090D1B]/60 border-[#202944] opacity-60'
                  : 'bg-[#171D35] border-[#202944] hover:border-[#A78BFA]/50 hover:-translate-y-1 hover:shadow-xl'
              }`}
            >
              {/* Franchise Color Top Accent Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                style={{
                  background: `linear-gradient(90deg, ${team.primaryColor || '#A78BFA'}, ${team.secondaryColor || '#00D6D0'})`,
                }}
              />

              <div className="flex items-start justify-between gap-4 mb-4 pt-1">
                <div className="flex items-center gap-3.5">
                  <TeamEmblem code={team.code} size="lg" className="drop-shadow" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#F5F4FF] font-heading">{team.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#090D1B] text-[#E8BD68] border border-[#202944]">
                        {team.code}
                      </span>
                    </div>
                    <span className="text-xs text-[#A5A9C3] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A5A9C3]" />
                      <span>{team.homeGround}</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#00D6D0] block">
                    ₹{team.totalPurse.toFixed(2)} Cr
                  </span>
                  <span className="text-[10px] text-[#A5A9C3] font-mono">Mega Auction Purse</span>
                </div>
              </div>

              {/* Trophies & Capacity */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#090D1B] border border-[#202944] text-center text-xs mb-4">
                <div>
                  <span className="text-[10px] text-[#A5A9C3] block">Championships</span>
                  <span className="font-bold text-[#E8BD68]">
                    {team.trophies.length > 0 ? `${team.trophies.length}x Trophies 🏆` : 'Finalist'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A5A9C3] block">Squad Capacity</span>
                  <span className="font-bold text-[#F5F4FF]">18 - 25 Players</span>
                </div>
              </div>

              {/* Action Button & Selection Status */}
              <div className="flex items-center justify-between pt-2 border-t border-[#202944]">
                <span className="text-[11px] text-[#A5A9C3]">
                  {isSelectedByMe
                    ? 'Commanding Director'
                    : isReservedByOther
                    ? `Claimed by ${assignment.userName}`
                    : 'Open for Franchise Allocation'}
                </span>

                {isSelectedByMe ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A78BFA] text-[#090D1B] font-extrabold text-xs shadow-md">
                    <Check className="w-4 h-4" />
                    <span>Selected By You</span>
                  </div>
                ) : isReservedByOther ? (
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-xl bg-[#090D1B] text-[#A5A9C3]/50 border border-[#202944] font-semibold text-xs cursor-not-allowed"
                  >
                    Reserved
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectTeam(team)}
                    className="px-4 py-2 rounded-xl bg-[#202944] hover:bg-[#A78BFA] text-[#F5F4FF] hover:text-[#090D1B] font-bold text-xs border border-[#202944] hover:border-[#A78BFA] transition-all cursor-pointer shadow"
                  >
                    Select {team.code}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Bottom Next Bar */}
      {isHost && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#202944] via-[#171D35] to-[#202944] border border-[#202944] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E8BD68]/15 border border-[#E8BD68]/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#E8BD68]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#E8BD68] text-[#090D1B]">
                  Host Workflow Control
                </span>
                <span className="text-xs font-bold text-[#F5F4FF] font-heading">
                  Step 4: Franchise Allocation
                </span>
              </div>
              <p className="text-xs text-[#A5A9C3] mt-0.5">
                {hasSelectedTeam
                  ? 'Your franchise has been selected. Proceed to Step 5 to review the 10-team readiness checklist.'
                  : 'Select your franchise from the list above, then click Next to advance.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleHostNext}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Next: 10 Ready</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {teamToConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#090D1B] border border-[#A78BFA] rounded-3xl p-6 text-center shadow-2xl">
            <TeamEmblem code={teamToConfirm.code} size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-extrabold text-[#F5F4FF] font-heading">
              Confirm Franchise Reservation
            </h2>
            <p className="text-xs text-[#A5A9C3] mt-2 leading-relaxed">
              Are you sure you want to take command of{' '}
              <strong className="text-[#E8BD68]">{teamToConfirm.name}</strong>? Other participants
              will not be able to choose this team.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTeamToConfirm(null)}
                className="w-1/2 py-2.5 rounded-xl bg-[#171D35] hover:bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSelection}
                className="w-1/2 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all cursor-pointer"
              >
                Confirm Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
