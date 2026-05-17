import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Music, Trophy } from 'lucide-react';

export const ExpoGoiabalPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      
      {/* Main Content with Background Image */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Background Image Layer (Mobile) */}
        <div 
          className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-zinc-900/95" />
        </div>

        {/* Background Image Layer (Desktop) */}
        <div 
          className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-zinc-900/95" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-12 pt-32 pb-16">
          {/* Main Logo in Page with Hover Effect */}
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150 relative group cursor-pointer">
            <img 
              src="/logo.png" 
              alt="ExpoGoiabal" 
              className="w-full max-w-2xl drop-shadow-[0_10px_25px_rgba(255,215,0,0.3)] transition-all duration-500 group-hover:opacity-0 group-hover:scale-95"
            />
            <img 
              src="/logo-hover.png" 
              alt="ExpoGoiabal Glow" 
              className="w-full max-w-2xl drop-shadow-[0_10px_35px_rgba(255,100,0,0.6)] transition-all duration-500 absolute inset-0 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100"
            />
          </div>

          {/* Event Info Cards (Desktop) */}
          <div className="hidden md:grid grid-cols-3 gap-6 w-full animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 mt-24">
            <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10a12 12 0 0 1 18 0" />
                  <path d="M12 10v9" />
                  <path d="M9 19h6" />
                  <path d="M4 10l-2 -3" />
                  <path d="M20 10l2 -3" />
                  <path d="M8 6l2 4" />
                  <path d="M16 6l-2 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">04 a 07 de Junho</h3>
              <p className="text-zinc-400">4 dias de muita festa, rodeio e diversão para toda a família.</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-2">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Provas</h3>
              <p className="text-zinc-400">03 Tambores Feminino, Rodeio, Concurso de Marcha</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-2">
                <Music size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Grandes Shows</h3>
              <p className="text-zinc-400">Atrações nacionais e regional todos os dias. Confira a programação!</p>
            </div>
          </div>

          {/* Action Buttons (Mobile) */}
          <div className="md:hidden flex flex-col w-full px-8 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300 mt-16">
            <button 
              onClick={() => navigate('/ExpoGoiabal/Programacao')}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-lg py-4 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all duration-300 uppercase tracking-wider"
            >
              Programação
            </button>
            <button 
              onClick={() => navigate('/ExpoGoiabal/Inscricao')}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold text-lg py-4 rounded-full shadow-[0_0_30px_rgba(255,215,0,0.4)] hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] hover:scale-105 transition-all duration-300 uppercase tracking-wider"
            >
              Inscrições
            </button>
          </div>

          {/* Logo Secundaria (Mobile Only - Bottom Center) */}
          <div className="md:hidden mt-auto pt-32 pb-6 flex justify-center w-full">
            <img 
              src="/logo2.png" 
              alt="Logo Secundária" 
              className="h-24 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            />
          </div>

        </div>

        {/* Seção de Inscrições */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-24 mb-32 flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
              Inscrições
            </h2>
            <div className="w-24 h-1 bg-yellow-500 rounded-full drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full px-8 mt-8">
            {/* Card 1: Embaixadora */}
            <div 
              onClick={() => navigate('/ExpoGoiabal/Embaixadora/inscricao')}
              className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full group-hover:bg-yellow-500/40 transition-all duration-500"></div>
                <img 
                  src="/Embaixadora.png" 
                  alt="Inscrição Embaixadora e Madrinha" 
                  className="relative w-full max-w-[320px] h-auto rounded-3xl drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] group-hover:drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] transition-all duration-500 border border-yellow-500/20 group-hover:border-yellow-500/60"
                />
              </div>
            </div>

            {/* Card 2: 3 Tambores */}
            <div 
              onClick={() => navigate('/ExpoGoiabal/3tambores')}
              className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-500"></div>
                <img 
                  src="/Tambores.png" 
                  alt="Inscrição 3 Tambores" 
                  className="relative w-full max-w-[320px] h-auto rounded-3xl drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:drop-shadow-[0_0_40px_rgba(34,211,238,0.8)] transition-all duration-500 border border-cyan-500/20 group-hover:border-cyan-500/60"
                />
              </div>
            </div>

            {/* Card 3: Peão Mirim */}
            <div 
              onClick={() => navigate('/ExpoGoiabal/Mirim/inscricao')}
              className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full group-hover:bg-orange-500/40 transition-all duration-500"></div>
                <img 
                  src="/Mirim.png" 
                  alt="Inscrição Peão Mirim" 
                  className="relative w-full max-w-[320px] h-auto rounded-3xl drop-shadow-[0_0_20px_rgba(255,100,0,0.4)] group-hover:drop-shadow-[0_0_40px_rgba(255,100,0,0.8)] transition-all duration-500 border border-orange-500/20 group-hover:border-orange-500/60"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
