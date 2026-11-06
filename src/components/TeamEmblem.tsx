/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TeamEmblemProps {
  code: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const TeamEmblem: React.FC<TeamEmblemProps> = ({ code, className = '', size = 'md' }) => {
  const sizeMap = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  const getTeamConfig = (teamCode: string) => {
    switch (teamCode.toUpperCase()) {
      case 'CSK':
        return {
          bg: 'from-[#FDB913] to-[#E69B00]',
          border: 'border-[#FDB913]',
          textColor: 'text-[#004B8C]',
          symbol: '🦁',
          name: 'CSK',
        };
      case 'MI':
        return {
          bg: 'from-[#004BA0] to-[#002244]',
          border: 'border-[#D1AB3E]',
          textColor: 'text-[#D1AB3E]',
          symbol: '🌀',
          name: 'MI',
        };
      case 'RCB':
        return {
          bg: 'from-[#EC1C24] to-[#7B0D12]',
          border: 'border-[#BCA158]',
          textColor: 'text-[#F5F7FC]',
          symbol: '👑',
          name: 'RCB',
        };
      case 'KKR':
        return {
          bg: 'from-[#3A225D] to-[#1F1233]',
          border: 'border-[#F7D54E]',
          textColor: 'text-[#F7D54E]',
          symbol: '⚔️',
          name: 'KKR',
        };
      case 'SRH':
        return {
          bg: 'from-[#F26522] to-[#B33E00]',
          border: 'border-[#F26522]',
          textColor: 'text-[#FFFFFF]',
          symbol: '🦅',
          name: 'SRH',
        };
      case 'RR':
        return {
          bg: 'from-[#EA1A85] to-[#8C0B4D]',
          border: 'border-[#004B8C]',
          textColor: 'text-[#FFFFFF]',
          symbol: '🛡️',
          name: 'RR',
        };
      case 'DC':
        return {
          bg: 'from-[#004C97] to-[#002A54]',
          border: 'border-[#EF1B23]',
          textColor: 'text-[#FFFFFF]',
          symbol: '🐯',
          name: 'DC',
        };
      case 'GT':
        return {
          bg: 'from-[#0B4973] to-[#041D2E]',
          border: 'border-[#CC9B47]',
          textColor: 'text-[#CC9B47]',
          symbol: '⚡',
          name: 'GT',
        };
      case 'LSG':
        return {
          bg: 'from-[#0057B8] to-[#002B5C]',
          border: 'border-[#A2E2F8]',
          textColor: 'text-[#A2E2F8]',
          symbol: '🪶',
          name: 'LSG',
        };
      case 'PBKS':
        return {
          bg: 'from-[#ED1B24] to-[#8F0C12]',
          border: 'border-[#DAC088]',
          textColor: 'text-[#DAC088]',
          symbol: '🦁',
          name: 'PBKS',
        };
      default:
        return {
          bg: 'from-slate-700 to-slate-900',
          border: 'border-slate-500',
          textColor: 'text-white',
          symbol: '🏏',
          name: teamCode || 'IPL',
        };
    }
  };

  const conf = getTeamConfig(code);

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold rounded-xl shadow-md bg-gradient-to-br ${conf.bg} border ${conf.border} ${conf.textColor} ${sizeMap[size]} ${className} select-none transition-transform hover:scale-105`}
      title={conf.name}
    >
      <div className="flex flex-col items-center justify-center leading-tight">
        <span className="text-[11px] opacity-80 leading-none">{conf.symbol}</span>
        <span className="tracking-wider font-extrabold uppercase">{conf.name}</span>
      </div>
    </div>
  );
};
