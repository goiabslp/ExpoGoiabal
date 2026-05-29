import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Music, Trophy, ChevronDown, ChevronUp, Gem, Ticket } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const ExpoGoiabalPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [mirimCount, setMirimCount] = useState<number>(0);

  useEffect(() => {
    const fetchMirimCount = async () => {
      try {
        const { count, error } = await supabase
          .from('inscricoes_expogoiabal')
          .select('*', { count: 'exact', head: true })
          .eq('modalidade', 'Peão Mirim');
        if (!error && count !== null) {
          setMirimCount(count);
        }
      } catch (err) {
        console.error('Erro ao buscar inscrições do Mirim:', err);
      }
    };
    fetchMirimCount();
  }, []);

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const targetDate = new Date('2026-06-04T00:00:00-03:00');
    
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
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

  const toggleDay = (day: string) => {
    setExpandedDay(prev => prev === day ? null : day);
  };

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

          {/* Dynamic & Interactive Countdown Section */}
          {timeLeft ? (
            <div className="animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center gap-3">
              <span className="text-zinc-400 text-xs md:text-sm font-bold uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.1)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
                Contagem Regressiva Oficial
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
              <p className="text-zinc-200 text-lg md:text-xl font-black uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)] mt-1 animate-pulse">
                Faltam {String(timeLeft.days).padStart(2, '0')} dias!
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-1000 flex flex-col items-center gap-3">
              <span className="text-white text-xs md:text-sm font-black uppercase tracking-widest bg-gradient-to-r from-yellow-500 to-orange-500 border border-yellow-500/20 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2 animate-bounce">
                🤠 A Festa Começou!
              </span>
              <p className="text-zinc-200 text-lg md:text-xl font-black uppercase tracking-widest text-center max-w-md drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)] mt-1">
                A ExpoGoiabal 2026 já começou!
              </p>
            </div>
          )}

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
          <div className={`grid grid-cols-1 ${mirimCount < 25 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8 md:gap-10 w-full max-w-4xl px-8 mt-8 justify-items-center`}>
            {/* Card 1: 3 Tambores */}
            <div 
              onClick={() => navigate('/ExpoGoiabal/3tambores/inscricao')}
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

            {/* Card 2: Peão Mirim */}
            {mirimCount < 25 && (
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
            )}
          </div>
        </div>

        {/* Chamada para o Camarote VIP */}
        <div className="relative z-10 w-full max-w-4xl mx-auto mt-16 mb-20 px-4">
          <div 
            onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Camarote'); }}
            className="cursor-pointer group relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-yellow-500/30 rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:border-yellow-500/50 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            {/* Subtle glow background layer */}
            <div className="absolute inset-0 bg-yellow-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
            
            {/* Left Content */}
            <div className="flex flex-col gap-4 text-center md:text-left relative z-10 max-w-xl">
              <span className="self-center md:self-start bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
                <Gem size={12} />
                Área VIP Exclusiva
              </span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-white">
                Camarote <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">ExpoGoiabal 2026</span>
              </h2>
              <p className="text-zinc-400 font-medium text-sm md:text-base leading-relaxed">
                As vendas do <strong className="text-yellow-500 font-bold">1º Lote</strong> estão liberadas! Garanta já o seu lugar no espaço mais cobiçado da festa, com vista privilegiada da arena e shows, bares e banheiros exclusivos.
              </p>
            </div>

            {/* Right Action Button/Visual */}
            <div className="shrink-0 relative z-10 flex flex-col items-center gap-3">
              <div
                className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 group-hover:from-yellow-400 group-hover:to-amber-500 text-black font-black text-sm md:text-base py-4 px-8 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-all duration-300 uppercase tracking-widest font-sans"
              >
                <Ticket size={18} className="shrink-0 animate-bounce" />
                Garantir Ingresso VIP
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                1º Lote Limitado 🎟️
              </span>
            </div>
          </div>
        </div>

        {/* Seção de Programação */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mt-16 mb-24 flex flex-col items-center gap-16 px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-cyan-200 to-cyan-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              Programação
            </h2>
            <div className="w-24 h-1 bg-cyan-500 rounded-full drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
          </div>

          <div className="w-full flex flex-col gap-16">
            
            {/* Quinta */}
            <div className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Quinta-Feira</h3>
                  <p className="text-zinc-400 mt-1 font-light tracking-wide text-lg">04 de Junho</p>
                </div>
                <button 
                  onClick={() => toggleDay('quinta')}
                  className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors font-bold uppercase tracking-widest text-sm bg-yellow-500/10 px-4 py-2 rounded-xl"
                >
                  {expandedDay === 'quinta' ? 'Menos Detalhes' : 'Mais Detalhes'}
                  {expandedDay === 'quinta' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(expandedDay === 'quinta' ? [
                  { title: "Recepção aos Cavaleiros", time: "13:00", desc: "Apresentação dos Cavaleiros e Churrasco." },
                  { title: "Abertura do Rodeio", time: "20:00", desc: "Apresentação dos Peões e Mirim em Carneiro." },
                  { title: "Show de Rodeio", time: "20:40", desc: "Montarias em bois e cavalos." },
                  { title: "Edmilson do Forró", time: "22:30", desc: "Show de Música no palco principal." },
                  { title: "Celio Nonato", time: "01:00", desc: "Show de Música no palco principal." }
                ] : [
                  { title: "Abertura do Rodeio", time: "20:00", desc: "Apresentação dos Peões e Mirim em Carneiro." },
                  { title: "Edmilson do Forró", time: "22:30", desc: "Show de Música no palco principal." }
                ]).map((item, idx) => (
                  <div key={idx} className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-lg">{item.title}</span>
                      <span className="text-yellow-500 font-mono bg-yellow-500/10 px-3 py-1 rounded-lg">{item.time}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sexta */}
            <div className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Sexta-Feira</h3>
                  <p className="text-zinc-400 mt-1 font-light tracking-wide text-lg">05 de Junho</p>
                </div>
                <button 
                  onClick={() => toggleDay('sexta')}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-widest text-sm bg-cyan-500/10 px-4 py-2 rounded-xl"
                >
                  {expandedDay === 'sexta' ? 'Menos Detalhes' : 'Mais Detalhes'}
                  {expandedDay === 'sexta' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(expandedDay === 'sexta' ? [
                  { title: "Abertura do Rodeio", time: "19:30", desc: "Apresentação e Entrada dos Peões." },
                  { title: "Abertura Oficial", time: "20:00", desc: "Apresentação das Autoridades e Organizadores." },
                  { title: "Prova 3 Tambores (Feminino)", time: "20:20", desc: "Montaria Feminina em Cavalos." },
                  { title: "Show de Rodeio", time: "21:00", desc: "Montarias em bois e cavalos." },
                  { title: "Andrey Ferraz", time: "22:30", desc: "Show de Música no palco principal." },
                  { title: "Naiara Azevedo", time: "00:30", desc: "Show de Música no palco principal." },
                  { title: "DJ Brinks", time: "02:30", desc: "Festa comandada pelo DJ." }
                ] : [
                  { title: "Prova 3 Tambores (Feminino)", time: "20:20", desc: "Montaria Feminina em Cavalos." },
                  { title: "Naiara Azevedo", time: "00:30", desc: "Show de Música no palco principal." }
                ]).map((item, idx) => (
                  <div key={idx} className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-lg">{item.title}</span>
                      <span className="text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-lg">{item.time}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sabado */}
            <div className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Sábado</h3>
                  <p className="text-zinc-400 mt-1 font-light tracking-wide text-lg">06 de Junho</p>
                </div>
                <button 
                  onClick={() => toggleDay('sabado')}
                  className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors font-bold uppercase tracking-widest text-sm bg-yellow-500/10 px-4 py-2 rounded-xl"
                >
                  {expandedDay === 'sabado' ? 'Menos Detalhes' : 'Mais Detalhes'}
                  {expandedDay === 'sabado' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(expandedDay === 'sabado' ? [
                  { title: "Abertura do Rodeio", time: "20:00", desc: "Apresentação e Entrada dos Peões e Mirim em Carneiro." },
                  { title: "Prova 3 Tambores (Final)", time: "20:30", desc: "Final da Competição." },
                  { title: "Show de Rodeio", time: "21:00", desc: "Montarias em bois e cavalos." },
                  { title: "Marconi e Diego", time: "22:30", desc: "Show de Música no palco principal." },
                  { title: "Althair e Alexandre", time: "00:30", desc: "Show de Música no palco principal." },
                  { title: "Banda Nova Face", time: "02:30", desc: "Show de Música no palco principal." }
                ] : [
                  { title: "Prova 3 Tambores (Final)", time: "20:30", desc: "Final da Competição." },
                  { title: "Althair e Alexandre", time: "00:30", desc: "Show de Música no palco principal." }
                ]).map((item, idx) => (
                  <div key={idx} className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-lg">{item.title}</span>
                      <span className="text-yellow-500 font-mono bg-yellow-500/10 px-3 py-1 rounded-lg">{item.time}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Domingo */}
            <div className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Domingo</h3>
                  <p className="text-zinc-400 mt-1 font-light tracking-wide text-lg">07 de Junho</p>
                </div>
                <button 
                  onClick={() => toggleDay('domingo')}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-bold uppercase tracking-widest text-sm bg-cyan-500/10 px-4 py-2 rounded-xl"
                >
                  {expandedDay === 'domingo' ? 'Menos Detalhes' : 'Mais Detalhes'}
                  {expandedDay === 'domingo' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(expandedDay === 'domingo' ? [
                  { title: "Concurso de Marcha", time: "10:00", desc: "37ª Cavalgada de São José do Goiabal - MG." },
                  { title: "Banda Savassy", time: "13:00", desc: "Show de Música ao vivo." },
                  { title: "Nilson Garcia", time: "16:00", desc: "Show de Música ao vivo." }
                ] : [
                  { title: "Concurso de Marcha", time: "10:00", desc: "37ª Cavalgada de São José do Goiabal - MG." },
                  { title: "Banda Savassy", time: "13:00", desc: "Show de Música ao vivo." }
                ]).map((item, idx) => (
                  <div key={idx} className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white text-lg">{item.title}</span>
                      <span className="text-cyan-400 font-mono bg-cyan-500/10 px-3 py-1 rounded-lg">{item.time}</span>
                    </div>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                ))}
                {expandedDay === 'domingo' && (
                  <div className="md:col-span-2 bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30 animate-in fade-in slide-in-from-top-4 flex items-center justify-center">
                    <p className="text-zinc-400 text-center font-medium">Fim das atividades com música ao vivo durante toda a tarde e encerramento da ExpoGoiabal 2026!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button 
                onClick={() => navigate('/ExpoGoiabal/Programacao')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-10 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all duration-300 uppercase tracking-widest"
              >
                Ver Programação Completa
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
