import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Pause, 
  Trophy, 
  Calendar 
} from 'lucide-react';
import { 
  obterEstadoCronometro, 
  subscribeCronometro, 
  buscarEstadoCronometroSupabase,
  formatarTempoHHMMSS, 
  TEMPO_OFICIAL_SEGUNDOS,
  type TrucoCronometroEstado 
} from '../../../services/trucoCronometroService';
import { 
  calcularDataRodada 
} from '../../../services/trucoService';

export const TrucoPartidasDoDiaPage: React.FC = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<TrucoCronometroEstado>(obterEstadoCronometro());

  // Timer loop para atualização suave a cada segundo e sincronização em tempo real
  useEffect(() => {
    // 1. Busca estado global mais recente do Supabase
    buscarEstadoCronometroSupabase().then(est => {
      if (est) setEstado(est);
    });

    const atualizar = () => {
      setEstado(obterEstadoCronometro());
    };

    atualizar();
    const interval = setInterval(atualizar, 250);
    const unsubscribe = subscribeCronometro((novoEst) => {
      setEstado(novoEst);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const rodadaInfo = useMemo(() => {
    return calcularDataRodada(estado.rodada);
  }, [estado.rodada]);

  const tempoFormatado = formatarTempoHHMMSS(estado.tempoRestanteSegundos);
  const percentualConcluido = Math.min(
    100,
    Math.max(0, ((TEMPO_OFICIAL_SEGUNDOS - estado.tempoRestanteSegundos) / TEMPO_OFICIAL_SEGUNDOS) * 100)
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* Background Decorativo com Luzes e Neon */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/10 via-amber-500/5 to-transparent blur-3xl opacity-60"></div>
        {estado.status === 'queda_saideira' && (
          <div className="absolute inset-0 bg-red-600/15 animate-pulse transition-opacity duration-1000"></div>
        )}
      </div>

      {/* OVERLAY DE CONTAGEM REGRESSIVA DE 5 SEGUNDOS (PRÉ-INÍCIO) */}
      {estado.status === 'pre_inicio_5s' && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="relative flex flex-col items-center gap-6 max-w-lg">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center animate-bounce shadow-2xl shadow-amber-500/30">
              <Flame size={44} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-400">
                Atenção às Mesas • Rodada {estado.rodada}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-wider">
                PREPAREM AS CARTAS!
              </h2>
              <p className="text-zinc-400 text-sm font-medium">
                O cronômetro oficial de 02:00 horas será iniciado em instantes...
              </p>
            </div>

            {/* Número Gigante da Contagem com animação a cada segundo */}
            <div className="my-6 h-36 flex items-center justify-center">
              <span 
                key={estado.preInicioRestante}
                className="text-8xl sm:text-9xl font-black text-amber-400 font-mono tracking-tighter drop-shadow-[0_0_60px_rgba(245,158,11,1)] animate-in zoom-in-75 duration-300 inline-block"
              >
                {estado.preInicioRestante > 0 ? estado.preInicioRestante : '🚀 VAI!'}
              </span>
            </div>

            {/* Barra de Progresso dos 5 segundos */}
            <div className="w-full max-w-xs h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, Math.min(100, (estado.preInicioRestante / 5) * 100))}%` }}
              ></div>
            </div>

            <div className="px-6 py-2 rounded-full bg-zinc-900 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-300">
              Tempo Regulamentar: 02:00:00
            </div>
          </div>
        </div>
      )}

      {/* HEADER SUPERIOR */}
      <header className="relative z-10 bg-zinc-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco'); }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
            title="Voltar ao Hub do Truco"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Flame size={12} />
                <span>ExpoGoiabal 2026 • Ao Vivo</span>
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-white leading-none">
              Cronômetro Oficial das Partidas
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
          >
            <Trophy size={14} className="text-amber-400" />
            <span>Ver Tabela</span>
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center gap-6">

        {/* HERO TELÃO: PAINEL DO CRONÔMETRO */}
        <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-12 text-center flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
          estado.status === 'queda_saideira'
            ? 'bg-gradient-to-b from-red-950/90 via-black to-zinc-950 border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.35)]'
            : estado.status === 'encerrado'
            ? 'bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-zinc-700 shadow-zinc-900/50'
            : estado.status === 'em_andamento'
            ? 'bg-gradient-to-b from-zinc-900/95 via-black to-zinc-950 border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.15)]'
            : 'bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950 border-amber-500/30'
        }`}>

          {/* Badge Superior da Rodada */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-4 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 shadow-md">
              <Calendar size={14} className="text-amber-400" />
              <span>Rodada {estado.rodada} • {rodadaInfo.textoCompleto}</span>
            </span>
          </div>

          {/* Status Bar Dinâmico */}
          <div className="mb-6">
            {estado.status === 'em_andamento' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Partidas em Andamento • 02:00:00</span>
              </div>
            )}

            {estado.status === 'pausado' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-black uppercase tracking-widest shadow-lg">
                <Pause size={14} />
                <span>Cronômetro Pausado</span>
              </div>
            )}

            {estado.status === 'parado' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-400 text-xs font-black uppercase tracking-widest">
                <Clock size={14} />
                <span>Aguardando Início Oficial pelo Administrador</span>
              </div>
            )}

            {estado.status === 'queda_saideira' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 border-2 border-white text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-500/60 animate-bounce">
                <AlertTriangle size={16} />
                <span>Tempo Esgotado • Última Queda em Disputa</span>
              </div>
            )}

            {estado.status === 'encerrado' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-800 border border-white/20 text-zinc-300 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Rodada Concluída</span>
              </div>
            )}
          </div>

          {/* MENSAGEM GIGANTE QUEDA SAÍDEIRA (SE ATIVO) */}
          {estado.status === 'queda_saideira' && (
            <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 border-4 border-white text-white shadow-[0_0_80px_rgba(239,68,68,0.8)] animate-pulse w-full max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-2">
                <AlertTriangle size={36} className="text-yellow-300 animate-spin" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-yellow-300">
                  Atenção Mesas de Truco
                </span>
                <AlertTriangle size={36} className="text-yellow-300 animate-spin" />
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-lg">
                ⚠️ QUEDA SAÍDEIRA!
              </h2>
              <p className="text-xs sm:text-sm font-bold text-red-100 uppercase tracking-widest mt-2">
                O tempo regulamentar de 02:00 horas chegou ao fim! Finalizem a última queda.
              </p>
            </div>
          )}

          {/* MENSAGEM GIGANTE PARTIDAS ENCERRADAS (SE ENCERRADO) */}
          {estado.status === 'encerrado' && (
            <div className="my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-2 border-white/20 text-white shadow-2xl w-full max-w-2xl">
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Apuração Concluída</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wide text-white leading-tight">
                🛑 PARTIDAS ENCERRADAS
              </h2>
              <p className="text-xs sm:text-sm font-medium text-zinc-400 mt-2">
                Os confrontos da Rodada {estado.rodada} foram finalizados e os resultados estão na tabela.
              </p>
            </div>
          )}

          {/* RELÓGIO DIGITAL GIGANTE (HORAS : MINUTOS : SEGUNDOS) */}
          {estado.status !== 'queda_saideira' && estado.status !== 'encerrado' && (
            <div className="my-4 sm:my-8 flex items-center justify-center gap-2 sm:gap-4 font-mono select-none">
              {/* Horas */}
              <div className="flex flex-col items-center">
                <div className="w-20 sm:w-32 lg:w-40 h-24 sm:h-36 lg:h-44 bg-zinc-950 border-2 border-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="text-4xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight">
                    {tempoFormatado.horas}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 mt-2">
                  Horas
                </span>
              </div>

              {/* Separador */}
              <span className="text-3xl sm:text-6xl font-black text-amber-400 animate-pulse pb-6">:</span>

              {/* Minutos */}
              <div className="flex flex-col items-center">
                <div className="w-20 sm:w-32 lg:w-40 h-24 sm:h-36 lg:h-44 bg-zinc-950 border-2 border-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="text-4xl sm:text-7xl lg:text-8xl font-black text-amber-400 tracking-tight">
                    {tempoFormatado.minutos}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 mt-2">
                  Minutos
                </span>
              </div>

              {/* Separador */}
              <span className="text-3xl sm:text-6xl font-black text-amber-400 animate-pulse pb-6">:</span>

              {/* Segundos */}
              <div className="flex flex-col items-center">
                <div className="w-20 sm:w-32 lg:w-40 h-24 sm:h-36 lg:h-44 bg-zinc-950 border-2 border-white/10 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="text-4xl sm:text-7xl lg:text-8xl font-black text-emerald-400 tracking-tight">
                    {tempoFormatado.segundos}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 mt-2">
                  Segundos
                </span>
              </div>
            </div>
          )}

          {/* Barra de Progresso do Tempo Oficial */}
          {estado.status === 'em_andamento' && (
            <div className="w-full max-w-xl flex flex-col gap-2 mt-4">
              <div className="w-full h-3 rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500"
                  style={{ width: `${percentualConcluido}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>00:00:00 (Início)</span>
                <span>{Math.round(percentualConcluido)}% Concluído</span>
                <span>02:00:00 (Saideira)</span>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};
