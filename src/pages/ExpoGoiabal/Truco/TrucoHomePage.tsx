import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  UserPlus, 
  Dices, 
  BarChart3, 
  Users, 
  Swords, 
  Sparkles, 
  ArrowRight, 
  Flame,
  Crown
} from 'lucide-react';
import { 
  type TrucoTorneioStatus,
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';

export const TrucoHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [totalEquipes, setTotalEquipes] = useState<number>(0);
  const [totalPartidas, setTotalPartidas] = useState<number>(0);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const [eqs, parts, st] = await Promise.all([
        buscarEquipes(), 
        buscarPartidas(),
        buscarStatusTorneio()
      ]);
      setTotalEquipes(eqs.length);
      setTotalPartidas(parts.length);
      setStatusTorneio(st);
    } catch (e) {
      console.error('Erro ao carregar dados do truco na home:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-emerald-500 selection:text-black">
      <Header />

      {/* Decorative Background Elements */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80 pointer-events-none"
        style={{ backgroundImage: 'url(/truco.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/55 via-black/40 to-zinc-950/90 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),transparent)] pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col items-center pt-28 pb-16 px-3 sm:px-4">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          
          <TrucoBackButton to="/ExpoGoiabal/Inicio" label="Voltar para a Página Inicial" />

          {/* Hero Banner Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>Edição Oficial ExpoGoiabal 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              2º Torneio de <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                Truco Oficial
              </span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
              Reúna sua equipe de <strong>04 jogadores titulares</strong> (mais reservas), dispute o sorteio de rodadas simultâneas todos-contra-todos, garanta sua vaga entre os <strong>08 melhores</strong> e lute pela taça de campeão no mata-mata final!
            </p>

            {/* Quick Stats Counter */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8 w-full max-w-md">
              <div className="bg-zinc-900/80 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center shadow-lg hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Users size={16} />
                  Equipes
                </div>
                <span className="text-3xl font-black text-white">
                  {loading ? '...' : totalEquipes}
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mt-1">
                  {totalEquipes % 2 === 0 ? 'Quantidade Par ✅' : 'Quantidade Ímpar ⚠️'}
                </span>
              </div>

              <div className="bg-zinc-900/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 flex flex-col items-center shadow-lg hover:border-amber-500/40 transition-colors">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Swords size={16} />
                  Partidas
                </div>
                <span className="text-3xl font-black text-white">
                  {loading ? '...' : totalPartidas}
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mt-1">
                  {statusTorneio?.fase_atual === 'inscricao' ? 'Aguardando Sorteio' : 'No Calendário'}
                </span>
              </div>
            </div>
          </div>

          {/* 5 Main Action Cards Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            
            {/* Card 1: Cadastrar */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Cadastrar'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus size={22} />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Etapa 1
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                  📝 Cadastrar
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-3 font-medium">
                  Inscreva os times (4 titulares + reservas).
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-emerald-400 font-black text-xs uppercase tracking-wider group-hover:text-emerald-300">
                <span>Inscrever</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Sorteio da 1ª Fase */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Sorteio'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-amber-500/30 hover:border-amber-400 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-md mb-3 group-hover:scale-110 transition-transform font-black">
                  <Dices size={22} />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Etapa 2
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                  🎲 Sorteio
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-3 font-medium">
                  Sorteio matemático das rodadas simultâneas.
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-amber-400 font-black text-xs uppercase tracking-wider group-hover:text-amber-300">
                <span>Sortear</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Partidas & Placares */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Partidas'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-emerald-500/40 hover:border-emerald-400 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform font-black">
                  <Swords size={22} />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Etapa 3
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                  ⚔️ Partidas
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-3 font-medium">
                  Terças e Quintas: insira placares e saldos ao vivo.
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-emerald-400 font-black text-xs uppercase tracking-wider group-hover:text-emerald-300">
                <span>Ver Partidas</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Tabela & Top 8 */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-teal-500/30 hover:border-teal-400 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 size={22} />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Etapa 4
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                  📊 Tabela & Top 8
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-3 font-medium">
                  Classificação em tempo real e apuração dos 08 melhores.
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-teal-400 font-black text-xs uppercase tracking-wider group-hover:text-teal-300">
                <span>Classificação</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Mata-Mata & Campeão */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/MataMata'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-amber-400/40 hover:border-amber-400 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 flex items-center justify-center text-black shadow-md mb-3 group-hover:scale-110 transition-transform font-black">
                  <Crown size={22} />
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                  Etapa 5
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                  🏆 Mata-Mata
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mb-3 font-medium">
                  Grupos A e B, Grande Final e o Campeão.
                </p>
              </div>

              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-amber-400 font-black text-xs uppercase tracking-wider group-hover:text-amber-300">
                <span>Chaveamento</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

          {/* Tournament Rules Banner */}
          <div className="w-full mt-10 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shrink-0">
                <Flame size={24} />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">Regulamento Oficial do 2º Torneio</h4>
                <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                  Times de <strong>04 titulares + reservas</strong> • Quantidade de times estritamente <strong>PAR</strong> • Rodadas simultâneas todos-contra-todos • <strong>Top 8</strong> avançam ao Mata-Mata (Grupos A e B).
                </p>
              </div>
            </div>
            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Sorteio'); }}
              className="shrink-0 px-6 py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              Acessar Sorteio
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
