import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UserPlus, Dices, BarChart3, Trophy } from 'lucide-react';

export const TrucoHeaderNav: React.FC = () => {
  const tabs = [
    { to: '/ExpoGoiabal/Truco', label: 'Início', icon: Home, exact: true },
    { to: '/ExpoGoiabal/Truco/Cadastrar', label: 'Cadastrar', icon: UserPlus },
    { to: '/ExpoGoiabal/Truco/Sorteio', label: 'Sorteio & Rodadas', icon: Dices },
    { to: '/ExpoGoiabal/Truco/Tabela', label: 'Tabela & Top 8', icon: BarChart3 },
    { to: '/ExpoGoiabal/Truco/MataMata', label: 'Mata-Mata & Campeão', icon: Trophy },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 mb-8">

      {/* Navigation Pill Bar */}
      <div className="bg-zinc-950/80 backdrop-blur-xl border border-emerald-500/30 p-1.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.exact}
              className={({ isActive }) =>
                `shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
