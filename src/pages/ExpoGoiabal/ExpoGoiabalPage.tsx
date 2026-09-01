import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Trophy } from 'lucide-react';

export const ExpoGoiabalPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const targetDate = new Date('2026-06-04T00:00:00-03:00');
    
    const calculateTimeLeft = () => {
      const now = new Date();
      setCurrentDate(now);
      const difference = +targetDate - +now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBrazilDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const getVal = (type: string) => parts.find(p => p.type === type)?.value || '0';
    return {
      year: parseInt(getVal('year'), 10),
      month: parseInt(getVal('month'), 10),
      day: parseInt(getVal('day'), 10),
      hour: parseInt(getVal('hour'), 10),
      minute: parseInt(getVal('minute'), 10),
      second: parseInt(getVal('second'), 10),
    };
  };

  const brDate = getBrazilDate(currentDate);
  
  let statusBadge = 'Contagem Regressiva Oficial';
  
  if (brDate.year === 2026 && brDate.month === 6) {
    if (brDate.day === 4) {
      statusBadge = '🤠 A Festa Começou!';
    } else if (brDate.day === 5) {
      statusBadge = '🤠 2º Dia de Festa!';
    } else if (brDate.day === 6) {
      statusBadge = '🤠 3º Dia de Festa!';
    } else if (brDate.day === 7) {
      statusBadge = '🤠 4º Dia de Festa!';
    } else if (brDate.day > 7) {
      statusBadge = '🤠 Até a Próxima!';
    }
  } else if (brDate.year > 2026 || (brDate.year === 2026 && brDate.month > 6)) {
    statusBadge = '🤠 Até a Próxima!';
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />

      {/* Main Content with Background Image */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Background Image Layer (Mobile) */}
        <div 
          className="md:hidden fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/background2.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-zinc-900/95" />
        </div>

        {/* Background Image Layer (Desktop) */}
        <div 
          className="hidden md:block fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/background.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-900/80 to-zinc-900/95" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 md:gap-12 pt-[84px] md:pt-32 pb-16">
          {/* Data da Festa (Mobile Only - Glued below Header) */}
          <div className="md:hidden animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-75">
            <span className="text-yellow-500 text-xs font-black uppercase tracking-[0.2em] bg-black/40 backdrop-blur-md border border-yellow-500/30 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center justify-center animate-pulse">
              04, 05, 06 E 07 DE JUNHO
            </span>
          </div>

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


          {/* Dynamic & Interactive Countdown Section */}
          {timeLeft ? (
            <div className="animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center gap-3">
              <span className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.1)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
                {statusBadge}
              </span>
              <div className="flex gap-4 items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 px-6 md:px-8 shadow-2xl hover:border-yellow-500/30 transition-all duration-500 group">
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 drop-shadow-md tracking-wider">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Dias</span>
                </div>
                <span className="text-2xl font-black text-yellow-500/60 pb-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Horas</span>
                </div>
                <span className="text-2xl font-black text-zinc-700 pb-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-white drop-shadow-md">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Minutos</span>
                </div>
                <span className="text-2xl font-black text-zinc-700 pb-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-orange-500 drop-shadow-md animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Segundos</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000 flex flex-col items-center gap-5 cursor-pointer" onClick={() => {
              const el = document.getElementById('truco-destaque');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco'); }
            }}>
              <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 border border-emerald-500/30 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 animate-bounce">
                2º Torneio de Truco
              </span>
              <div className="flex flex-col items-center gap-2">
                <p className="text-zinc-200 text-lg md:text-xl font-black uppercase tracking-widest text-center max-w-md drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)] animate-pulse">
                  Arraste para baixo e acesse ao torneio
                </p>
                <div className="flex justify-center mt-2 animate-bounce">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          )}





          {/* Seção Destaque 2º Torneio de Truco */}
          <div id="truco-destaque" className="w-full max-w-4xl mt-8 px-4 scroll-mt-24">
            <div 
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco'); }}
              className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-zinc-950 via-emerald-950/40 to-zinc-950 border border-emerald-500/30 hover:border-emerald-400 rounded-[2rem] p-6 md:p-10 shadow-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all duration-500 flex flex-col items-center justify-center text-center"
            >
              {/* Glow background effect */}
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>

              {/* Text content */}
              <div className="flex flex-col items-center gap-4 text-center relative z-10 max-w-xl">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                  <Trophy size={14} className="text-amber-400" />
                  Torneio Oficial
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
                  2º Torneio de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400">TRUCO EXPOGOIABAL</span>
                </h2>
                <p className="text-zinc-300 font-medium text-sm md:text-base leading-relaxed max-w-lg">
                  Inscreva sua equipe, acompanhe as rodadas simultâneas, confira a tabela de classificação e dispute o título no mata-mata em tempo real!
                </p>
                <div className="pt-2">
                  <div
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 group-hover:from-emerald-400 group-hover:to-teal-500 text-black font-black text-sm py-4 px-8 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-all duration-300 uppercase tracking-widest"
                  >
                    Acessar Torneio de Truco
                  </div>
                </div>
              </div>
            </div>
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
      </main>
    </div>
  );
};
