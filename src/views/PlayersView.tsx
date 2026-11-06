/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Player, PlayerRole, PlayerStatus } from '../types/auction';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { TeamEmblem } from '../components/TeamEmblem';
import { formatCrores } from '../data/iplData';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

export const PlayersView: React.FC = () => {
  const { players, teams, setInspectedPlayer, setCurrentTab, goToPlayerIndex } = useAuction();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'price_desc' | 'price_asc' | 'name' | 'matches'>('price_desc');

  // Filtered and sorted players
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCountry = p.country.toLowerCase().includes(q);
          const matchRole = p.role.toLowerCase().includes(q);
          if (!matchName && !matchCountry && !matchRole) return false;
        }

        // Role
        if (selectedRole !== 'All' && p.role !== selectedRole) return false;

        // Country
        if (selectedCountry === 'India' && p.isOverseas) return false;
        if (selectedCountry === 'Overseas' && !p.isOverseas) return false;

        // Status
        if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;

        // Team
        if (selectedTeam !== 'All') {
          if (p.soldTo !== selectedTeam && p.previousTeam !== selectedTeam) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_desc') return (b.soldPrice || b.basePrice) - (a.soldPrice || a.basePrice);
        if (sortBy === 'price_asc') return (a.soldPrice || a.basePrice) - (b.soldPrice || b.basePrice);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'matches') return b.iplStats.matches - a.iplStats.matches;
        return 0;
      });
  }, [players, searchQuery, selectedRole, selectedCountry, selectedStatus, selectedTeam, sortBy]);

  return (
    <div className="space-y-6 text-[#F5F4FF]">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#F5F4FF] font-heading">
            Official Player Database
          </h1>
          <p className="text-sm text-[#A5A9C3] mt-1">
            Browse through all {players.length} registered cricketers for the 2027 Mega Auction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#A5A9C3] px-3.5 py-1.5 rounded-xl bg-[#171D35] border border-[#202944]">
            Showing {filteredPlayers.length} / {players.length} Players
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] space-y-3.5 shadow-xl">
        {/* Search Input Row */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A9C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players by name, country, or role (e.g. Virat, Bumrah, All-Rounder)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090D1B] border border-[#202944] focus:border-[#A78BFA] text-sm text-[#F5F4FF] placeholder-[#A5A9C3]/50 outline-none transition-colors"
          />
        </div>

        {/* Filter Chips & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#A5A9C3] font-medium">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-[#090D1B] border border-[#202944] rounded-lg px-2.5 py-1.5 text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
            >
              <option value="All">All Roles</option>
              <option value="Batter">Batter</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
              <option value="Wicketkeeper">Wicketkeeper</option>
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#A5A9C3] font-medium">Origin:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-[#090D1B] border border-[#202944] rounded-lg px-2.5 py-1.5 text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
            >
              <option value="All">All Origins</option>
              <option value="India">Indian (Capped/Uncapped)</option>
              <option value="Overseas">Overseas (Max 8/Squad)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#A5A9C3] font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#090D1B] border border-[#202944] rounded-lg px-2.5 py-1.5 text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available in Pool</option>
              <option value="sold">Sold</option>
              <option value="retained">Retained</option>
              <option value="unsold">Unsold</option>
            </select>
          </div>

          {/* Team Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#A5A9C3] font-medium">Team:</span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-[#090D1B] border border-[#202944] rounded-lg px-2.5 py-1.5 text-[#F5F4FF] outline-none cursor-pointer font-bold focus:border-[#A78BFA]"
            >
              <option value="All">All 10 Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#A5A9C3]" />
            <span className="text-[#A5A9C3] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#090D1B] border border-[#202944] rounded-lg px-2.5 py-1.5 text-[#F5F4FF] outline-none cursor-pointer focus:border-[#A78BFA]"
            >
              <option value="price_desc">Valuation (High to Low)</option>
              <option value="price_asc">Valuation (Low to High)</option>
              <option value="matches">Matches Played</option>
              <option value="name">Player Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#171D35] border border-[#202944]">
          <p className="text-base text-[#A5A9C3] font-medium">No players match the selected filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRole('All');
              setSelectedCountry('All');
              setSelectedStatus('All');
              setSelectedTeam('All');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-[#202944] hover:bg-[#202944]/80 text-[#A78BFA] font-semibold text-xs border border-[#202944] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const soldTeam = player.soldTo ? teams.find((t) => t.id === player.soldTo) : null;

            return (
              <div
                key={player.id}
                onClick={() => setInspectedPlayer(player)}
                className="p-4 rounded-2xl bg-[#171D35] border border-[#202944] hover:border-[#A78BFA]/50 hover:bg-[#202944] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <PlayerAvatar player={player} size="md" showRoleBadge />

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#A5A9C3] block">
                        {player.status === 'sold' || player.status === 'retained'
                          ? 'Sold Amount'
                          : 'Simulated Base'}
                      </span>
                      <span className="text-base font-extrabold font-mono text-[#E8BD68] tabular-nums">
                        {player.soldPrice ? formatCrores(player.soldPrice) : formatCrores(player.basePrice)}
                      </span>
                    </div>
                  </div>

                  {/* Player Name & Role */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#A5A9C3] mb-0.5">
                      <span className="text-[#E8BD68] font-semibold">{player.role}</span>
                      <span>·</span>
                      <span>{player.country}</span>
                    </div>

                    <h3 className="font-extrabold text-[#F5F4FF] text-base group-hover:text-[#A78BFA] transition-colors truncate">
                      {player.name}
                    </h3>

                    <p className="text-xs text-[#A5A9C3] mt-1 line-clamp-1">
                      {player.iplStats.runs !== undefined
                        ? `${player.iplStats.runs} runs (${player.iplStats.strikeRate} SR)`
                        : `${player.iplStats.wickets} wkts (${player.iplStats.economy} Econ)`}
                    </p>
                  </div>
                </div>

                {/* Bottom status badge */}
                <div className="mt-4 pt-3 border-t border-[#202944] flex items-center justify-between text-xs">
                  {soldTeam ? (
                    <div className="flex items-center gap-1.5">
                      <TeamEmblem code={soldTeam.code} size="sm" />
                      <span className="text-[#F5F4FF] font-semibold truncate max-w-[100px]">
                        {soldTeam.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#A5A9C3]">Pool Set {player.set}</span>
                  )}

                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      player.status === 'sold'
                        ? 'bg-[#20C997]/20 text-[#20C997]'
                        : player.status === 'retained'
                        ? 'bg-[#00D6D0]/20 text-[#00D6D0]'
                        : player.status === 'unsold'
                        ? 'bg-[#FF5C75]/20 text-[#FF5C75]'
                        : 'bg-[#A78BFA]/20 text-[#A78BFA]'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
