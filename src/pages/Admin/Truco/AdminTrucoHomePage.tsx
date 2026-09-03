import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Users, 
  Swords, 
  Dices, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  BadgeCheck, 
  ArrowRight
} from 'lucide-react';
import { 
  buscarTodasEquipesAdmin, 
  buscarPartidas, 
  buscarStatusTorneio,
  subscribeToTrucoChanges,
  type TrucoEquipe, 
  type TrucoTorneioStatus, 
  type TrucoPartida 
} from '../../../services/trucoService';

export const AdminTrucoHomePage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const [eqs, parts, st] = await Promise.all([
        buscarTodasEquipesAdmin(),
        buscarPartidas(),
        buscarStatusTorneio()
      ]);
      setEquipes(eqs);
      setPartidas(parts);
      setStatusTorneio(st);
    } catch (err) {
      console.error('Erro ao buscar dados do Truco no Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  const totalCadastrados = equipes.length;
  const pendentes = equipes.filter(e => e.status === 'pendente');
  const aprovados = equipes.filter(e => (e.status || 'aprovado') === 'aprovado');
  const isApto = aprovados.length >= 3;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Admin Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin'); }} 
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Voltar ao Painel Admin Principal"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold uppercase tracking-widest text-white leading-tight">
                Painel Admin
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                2º Torneio de Truco
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open('/ExpoGoiabal/Truco', '_blank')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            <ExternalLink size={14} className="text-emerald-400" />
            <span>Página Pública</span>
          </button>

          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Inicio'); }}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in slide-in-from-bottom-6 fade-in duration-500">
        
        {/* Hero Banner do Módulo */}
        <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest self-start">
              <Sparkles size={14} className="text-amber-400" />
              <span>Gestão Centralizada do Torneio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-wide">
              🃏 Administração — 2º Torneio de Truco
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              Gerencie equipes e jogadores, aprove cadastros, lance placares em tempo real e realize o sorteio matemático oficial para transmissão no telão.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco'); }}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <ExternalLink size={15} className="text-emerald-400" />
              <span>Ver Telão Público</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">Total de Times</span>
              <Users size={16} className="text-zinc-500" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white mt-2">
              {loading ? '...' : totalCadastrados}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1">Inscrições cadastradas</span>
          </div>

          <div className="bg-zinc-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">Pendentes</span>
              <Clock size={16} className="text-amber-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {loading ? '...' : pendentes.length}
            </span>
            <span className="text-[10px] text-amber-500/80 font-semibold mt-1">Aguardando análise</span>
          </div>

          <div className="bg-zinc-900/80 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">Aprovados</span>
              <BadgeCheck size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              {loading ? '...' : aprovados.length}
            </span>
            <span className="text-[10px] text-emerald-500/80 font-semibold mt-1">
              {!isApto 
                ? 'Mínimo de 3 equipes ⚠️' 
                : aprovados.length % 2 === 0 
                ? 'Par e Apto p/ Sorteio ✅' 
                : 'Ímpar e Apto p/ Sorteio ✅'}
            </span>
          </div>

          <div className="bg-zinc-900/80 border border-teal-500/30 rounded-2xl p-4 sm:p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-teal-400">Status Sorteio</span>
              <Dices size={16} className="text-teal-400" />
            </div>
            <span className="text-base sm:text-lg font-black text-white mt-3">
              {statusTorneio?.sorteio_primeira_fase_confirmado ? (
                <span className="text-emerald-400 flex items-center gap-1">🟢 Realizado</span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">🟡 Aguardando</span>
              )}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium mt-1">
              {partidas.length} partidas no calendário
            </span>
          </div>
        </div>

        {/* Grade com os 3 Módulos Principais com Botão e Página Dedicada */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                Módulos de Administração
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                Selecione qual etapa do torneio deseja gerenciar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Gerenciamento de Equipes */}
            <div 
              onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Equipes'); }}
              className="group cursor-pointer bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Users size={28} />
                  </div>
                  {pendentes.length > 0 && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                      {pendentes.length} Pendente(s)
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                  Módulo 1
                </span>
                <h4 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  Gerenciar Equipes
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Modere cadastros (aprovar/reprovar), <strong>edite todos os dados dos times e jogadores</strong> e controle a elegibilidade ao bônus.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-emerald-400 font-black text-xs uppercase tracking-wider group-hover:text-emerald-300">
                <span>Acessar Gerenciador</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: Lançamento de Placares & Partidas */}
            <div 
              onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Partidas'); }}
              className="group cursor-pointer bg-gradient-to-b from-zinc-900 to-zinc-950 border border-teal-500/30 hover:border-teal-400 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-[0_0_30px_rgba(20,184,166,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Swords size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-black uppercase tracking-wider">
                    {partidas.length} Jogos
                  </span>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block mb-1">
                  Módulo 2
                </span>
                <h4 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-teal-300 transition-colors">
                  Lançar Placares
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Acompanhe os confrontos rodada a rodada, insira e edite os pontos das equipes, defina vencedores e atualize a classificação ao vivo.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-teal-400 font-black text-xs uppercase tracking-wider group-hover:text-teal-300">
                <span>Acessar Placares</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 3: Controle do Sorteio */}
            <div 
              onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Sorteio'); }}
              className="group cursor-pointer bg-gradient-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 hover:border-amber-400 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Dices size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    {statusTorneio?.sorteio_primeira_fase_confirmado ? 'Sorteado' : 'Aguardando'}
                  </span>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                  Módulo 3
                </span>
                <h4 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-amber-300 transition-colors">
                  Controle do Sorteio
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Acione o sorteio matemático oficial dos confrontos para transmissão em tempo real nos telões públicos ou resete as rodadas.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-amber-400 font-black text-xs uppercase tracking-wider group-hover:text-amber-300">
                <span>Acessar Sorteio</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            {/* Card 4: Partida do Dia & Cronômetro Oficial */}
            <div 
              onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/ControlePartidas'); }}
              className="group cursor-pointer bg-gradient-to-b from-zinc-900 to-zinc-950 border border-yellow-500/40 hover:border-yellow-400 rounded-3xl p-6 sm:p-7 shadow-xl hover:shadow-[0_0_30px_rgba(234,179,8,0.25)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/40 shadow-inner group-hover:scale-110 transition-transform">
                    <Clock size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-wider">
                    02:00 Horas
                  </span>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 block mb-1">
                  Módulo 4
                </span>
                <h4 className="text-xl font-black uppercase tracking-wide text-white mb-2 group-hover:text-yellow-300 transition-colors">
                  Partidas do Dia
                </h4>
                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Inicie a contagem oficial das <strong>02:00 horas</strong> (com contagem de 5s), acione o alerta de <strong>Queda Saídeira</strong> e encerre as partidas.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-yellow-400 font-black text-xs uppercase tracking-wider group-hover:text-yellow-300">
                <span>Controlar Cronômetro</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
