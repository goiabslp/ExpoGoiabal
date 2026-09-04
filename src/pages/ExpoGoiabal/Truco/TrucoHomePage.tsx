import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
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
                  {totalEquipes < 3 
                    ? 'Mínimo 3 Equipes ⚠️' 
                    : totalEquipes % 2 === 0 
                    ? 'Quantidade Par ✅' 
                    : 'Quantidade Ímpar ✅'}
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

          {/* Action Cards Grid - 4 Módulos Ativos */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

            {/* Card 1: Cronômetro */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/PartidasDoDia'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950/95 border border-yellow-500/40 hover:border-yellow-400 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-[0_0_30px_rgba(234,179,8,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ring-1 ring-yellow-500/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-md group-hover:scale-105 transition-transform shrink-0 font-black">
                    <Flame size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></span>
                    <span>Ao Vivo • 2h</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-yellow-300 transition-colors">
                  Cronômetro
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1 font-medium">
                  Cronômetro oficial de 02:00h e alerta de Queda Saídeira no telão.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-yellow-400 font-black text-xs uppercase tracking-wider group-hover:text-yellow-300">
                <span>Ver Cronômetro</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Calendário */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Partidas'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950/95 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0 font-black">
                    <Swords size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    Etapa 1
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors">
                  Calendário
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1 font-medium">
                  Terças e Quintas: confira os confrontos e resultados das rodadas.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-emerald-400 font-black text-xs uppercase tracking-wider group-hover:text-emerald-300">
                <span>Ver Calendário</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Tabela */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950/95 border border-teal-500/30 hover:border-teal-400 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-[0_0_30px_rgba(20,184,166,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                    Etapa 2
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-teal-300 transition-colors">
                  Tabela
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1 font-medium">
                  Classificação em tempo real e elegibilidade para a premiação.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-teal-400 font-black text-xs uppercase tracking-wider group-hover:text-teal-300">
                <span>Ver Tabela</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Mata-Mata */}
            <div
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/MataMata'); }}
              className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950/95 border border-amber-400/40 hover:border-amber-400 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-600 flex items-center justify-center text-black shadow-md group-hover:scale-105 transition-transform shrink-0 font-black">
                    <Crown size={20} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                    Etapa 3
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                  Mata-Mata
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1 font-medium">
                  Grupos A e B, Grande Final e apuração do Campeão Supremo.
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-amber-400 font-black text-xs uppercase tracking-wider group-hover:text-amber-300">
                <span>Ver Mata-Mata</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Regulamento'); }}
              className="shrink-0 px-6 py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              Acessar Regulamento
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
