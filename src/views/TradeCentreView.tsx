/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { TeamEmblem } from '../components/TeamEmblem';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { formatCrores } from '../data/iplData';
import { ArrowLeftRight, Check, X, Plus, AlertCircle, Clock } from 'lucide-react';

export const TradeCentreView: React.FC = () => {
  const { teams, players, user, tradeOffers, proposeTrade, respondToTrade } = useAuction();

  const userTeam = teams.find((t) => t.id === user.selectedTeamId) || teams[0];
  const [partnerTeamId, setPartnerTeamId] = useState<string>(
    teams.find((t) => t.id !== userTeam.id)?.id || 'mi'
  );

  const [selectedOfferPlayerId, setSelectedOfferPlayerId] = useState<string>('');
  const [selectedRequestPlayerId, setSelectedRequestPlayerId] = useState<string>('');
  const [cashAdjustment, setCashAdjustment] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const partnerTeam = teams.find((t) => t.id === partnerTeamId) || teams[1];

  // Players owned by user franchise
  const myPlayers = players.filter(
    (p) => p.soldTo === userTeam.id || userTeam.retainedPlayers.includes(p.id)
  );

  // Players owned by partner franchise
  const partnerPlayers = players.filter(
    (p) => p.soldTo === partnerTeam.id || partnerTeam.retainedPlayers.includes(p.id)
  );

  const handleProposeTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferPlayerId || !selectedRequestPlayerId) {
      setFeedback('Please select both a player to offer and a player to request.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    proposeTrade(
      userTeam.id,
      partnerTeam.id,
      [selectedOfferPlayerId],
      [selectedRequestPlayerId],
      cashAdjustment
    );

    setFeedback('Trade proposal dispatched to franchise director!');
    setSelectedOfferPlayerId('');
    setSelectedRequestPlayerId('');
    setCashAdjustment(0);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] font-heading">
          Official IPL Trade Centre
        </h1>
        <p className="text-sm text-[#A5A9C3] mt-1">
          BCCI sanctioned trade window. Propose player swaps and cash balancing between franchises.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-[#20C997]/20 border border-[#20C997] text-[#F5F4FF] text-xs font-semibold flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-[#20C997]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Trade Proposal Desk */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
        <h2 className="text-base font-bold text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-[#E8BD68]" />
          <span>Formulate Inter-Franchise Trade</span>
        </h2>

        <form onSubmit={handleProposeTrade} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: What User's Franchise Offers */}
            <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944]">
              <div className="flex items-center gap-2 mb-3">
                <TeamEmblem code={userTeam.code} size="sm" />
                <span className="text-xs font-bold text-[#F5F4FF]">Your Offer: {userTeam.name}</span>
              </div>

              {myPlayers.length === 0 ? (
                <p className="text-xs text-[#A5A9C3] italic py-4">
                  No squad players available to trade. Acquire players first in the Live Arena!
                </p>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-[#A5A9C3] block font-medium">Select Player to Trade Away:</label>
                  <select
                    value={selectedOfferPlayerId}
                    onChange={(e) => setSelectedOfferPlayerId(e.target.value)}
                    className="w-full bg-[#11182B] border border-[#202944] rounded-xl px-3 py-2 text-xs text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
                  >
                    <option value="">-- Choose squad member --</option>
                    {myPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role} · {formatCrores(p.soldPrice || p.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right: What User's Franchise Requests */}
            <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TeamEmblem code={partnerTeam.code} size="sm" />
                  <span className="text-xs font-bold text-[#F5F4FF]">Trade Partner:</span>
                </div>

                <select
                  value={partnerTeamId}
                  onChange={(e) => setPartnerTeamId(e.target.value)}
                  className="bg-[#11182B] border border-[#202944] rounded-lg px-2 py-1 text-xs text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
                >
                  {teams
                    .filter((t) => t.id !== userTeam.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              {partnerPlayers.length === 0 ? (
                <p className="text-xs text-[#A5A9C3] italic py-4">
                  {partnerTeam.name} currently has no squad players to trade.
                </p>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-[#A5A9C3] block font-medium">Select Desired Player:</label>
                  <select
                    value={selectedRequestPlayerId}
                    onChange={(e) => setSelectedRequestPlayerId(e.target.value)}
                    className="w-full bg-[#11182B] border border-[#202944] rounded-xl px-3 py-2 text-xs text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
                  >
                    <option value="">-- Choose player from {partnerTeam.code} --</option>
                    {partnerPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role} · {formatCrores(p.soldPrice || p.basePrice)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Cash Balancing */}
          <div className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#F5F4FF] block">Cash Balancing Adjustment</span>
              <span className="text-[11px] text-[#A5A9C3]">
                Positive = You pay cash; Negative = You receive cash.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#A5A9C3]">₹</span>
              <input
                type="number"
                step="0.5"
                value={cashAdjustment}
                onChange={(e) => setCashAdjustment(parseFloat(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-xl bg-[#11182B] border border-[#202944] text-[#F5F4FF] font-mono text-xs tabular-nums text-center outline-none focus:border-[#A78BFA]"
              />
              <span className="text-xs font-mono text-[#A5A9C3]">Crores</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedOfferPlayerId || !selectedRequestPlayerId}
            className="w-full py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b8a1fb] disabled:opacity-40 text-[#090D1B] font-extrabold text-xs shadow-lg shadow-[#A78BFA]/20 transition-all cursor-pointer"
          >
            Submit Official Trade Proposal
          </button>
        </form>
      </div>

      {/* ACTIVE & PAST TRADE PROPOSALS */}
      <div className="p-6 rounded-3xl bg-[#171D35] border border-[#202944] shadow-xl">
        <h2 className="text-base font-bold text-[#F5F4FF] font-heading mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00D6D0]" />
          <span>Trade Log & Proposals ({tradeOffers.length})</span>
        </h2>

        {tradeOffers.length === 0 ? (
          <p className="text-xs text-[#A5A9C3] text-center py-8">
            No inter-franchise trades proposed yet. Formulate a swap above!
          </p>
        ) : (
          <div className="space-y-3">
            {tradeOffers.map((trade) => {
              const fromTeam = teams.find((t) => t.id === trade.fromTeamId);
              const toTeam = teams.find((t) => t.id === trade.toTeamId);
              const offeredP = players.find((p) => trade.offeredPlayerIds.includes(p.id));
              const reqP = players.find((p) => trade.requestedPlayerIds.includes(p.id));

              return (
                <div
                  key={trade.id}
                  className="p-4 rounded-2xl bg-[#090D1B] border border-[#202944] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <TeamEmblem code={fromTeam?.code || 'IPL'} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-[#F5F4FF]">
                        {fromTeam?.code} offers <span className="text-[#E8BD68]">{offeredP?.name}</span> for{' '}
                        <span className="text-[#00D6D0]">{reqP?.name}</span> ({toTeam?.code})
                      </div>
                      <span className="text-[10px] text-[#A5A9C3] font-mono">
                        Cash Adjustment: ₹{trade.cashAdjustment} Cr · Status: {trade.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {trade.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => respondToTrade(trade.id, true)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#20C997] hover:bg-[#1db889] text-[#090D1B] font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => respondToTrade(trade.id, false)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#FF5C75] hover:bg-[#e04860] text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          trade.status === 'accepted'
                            ? 'bg-[#20C997]/20 text-[#20C997]'
                            : 'bg-[#FF5C75]/20 text-[#FF5C75]'
                        }`}
                      >
                        {trade.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
