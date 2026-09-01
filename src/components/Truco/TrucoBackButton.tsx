import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TrucoBackButtonProps {
  to?: string;
  label?: string;
}

export const TrucoBackButton: React.FC<TrucoBackButtonProps> = ({ 
  to = '/ExpoGoiabal/Truco', 
  label = 'Voltar' 
}) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-22 sm:top-24 left-3 sm:left-6 lg:left-8 z-30 pointer-events-auto">
      <button
        type="button"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate(to);
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950/90 backdrop-blur-md hover:bg-zinc-900 text-zinc-300 hover:text-white border border-emerald-500/30 hover:border-emerald-400 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 cursor-pointer group"
      >
        <ArrowLeft size={15} className="text-emerald-400 group-hover:-translate-x-1 transition-transform" />
        <span>{label}</span>
      </button>
    </div>
  );
};
