import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="group flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5 active:scale-95 outline-none focus:ring-2 focus:ring-yellow-500/50"
      aria-label="Voltar"
    >
      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
      <span className="font-medium text-sm">Voltar</span>
    </button>
  );
};
