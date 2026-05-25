import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Music, Trophy, ChevronDown, ChevronUp, X, Vote } from 'lucide-react';

export const ExpoGoiabalPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const VOTING_START = new Date('2026-05-25T18:00:00-03:00');
  const isBeforeStart = now < VOTING_START;

  const toggleDay = (day: string) => {
    setExpandedDay(prev => prev === day ? null : day);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-300">
          <div className="bg-black/90 border border-yellow-500/40 rounded-[2rem] p-8 max-w-md w-full relative shadow-[0_20px_70px_-10px_rgba(234,179,8,0.5)] animate-in zoom-in-95 duration-500 overflow-hidden group">
            
            {/* Background Image of Rodeo inside Card */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105" 
              style={{ backgroundImage: 'url(/background.png)' }} 
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent z-0" />

            {/* Glowing Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-[80px] animate-pulse z-0" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] animate-pulse z-0" style={{ animationDelay: '1s' }} />

            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 z-20 rounded-full p-2"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center gap-6 relative z-10 pt-2">
              <div className="relative group/icon cursor-pointer">
                <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl animate-pulse opacity-50 group-hover/icon:opacity-80 transition-opacity" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 flex items-center justify-center text-black shadow-[0_0_40px_rgba(234,179,8,0.6)] transform transition-transform duration-500 group-hover/icon:scale-110 group-hover/icon:rotate-12">
                  <Vote size={48} strokeWidth={2} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]">
                  Votação
                  <br />
                  <span className="text-2xl text-white drop-shadow-md">Oficial</span>
                </h3>
                {isBeforeStart ? (
                  <p className="text-zinc-200 text-lg leading-relaxed font-medium">
                    Está <strong className="text-yellow-400 text-xl inline-block px-1 animate-pulse drop-shadow-md">quase na hora</strong> de eleger sua Embaixadora e Madrinha favorita da ExpoGoiabal 2026.
                  </p>
                ) : (
                  <p className="text-zinc-200 text-lg leading-relaxed font-medium">
                    <strong className="text-yellow-400 text-2xl block mb-2 animate-pulse drop-shadow-md">A VOTAÇÃO COMEÇOU!</strong> 
                    Chame seus amigos e venha escolher as representantes da nossa festa.
                  </p>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setShowPopup(false);
                  navigate('/ExpoGoiabal/Embaixadora');
                }}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 text-black font-black text-xl py-4 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:shadow-[0_0_50px_rgba(234,179,8,0.8)] hover:-translate-y-1 hover:scale-[1.02] active:scale-95 transition-all duration-300 uppercase tracking-widest"
              >
                {isBeforeStart ? 'Ver Candidatas' : 'Quero Votar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => navigate('/ExpoGoiabal/Embaixadora')}
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
