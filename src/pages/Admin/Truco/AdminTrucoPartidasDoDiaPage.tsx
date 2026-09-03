import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Tv, 
  Calendar,
  Sliders,
  X
} from 'lucide-react';
import { 
  obterEstadoCronometro, 
  subscribeCronometro, 
  buscarEstadoCronometroSupabase,
  dispararInicioPartidaCom5s, 
  pausarCronometro, 
  retomarCronometro, 
  acionarQuedaSaideira, 
  encerrarPartidasDoDia, 
  reiniciarCronometro, 
  ajustarTempoCronometro, 
  definirTempoEspecifico,
  formatarTempoHHMMSS, 
  type TrucoCronometroEstado 
} from '../../../services/trucoCronometroService';
import { 
  calcularDataRodada 
} from '../../../services/trucoService';

export const AdminTrucoPartidasDoDiaPage: React.FC = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<TrucoCronometroEstado>(obterEstadoCronometro());
  const [rodadaSelecionada, setRodadaSelecionada] = useState<number>(estado.rodada || 1);
  const [feedbackMsg, setFeedbackMsg] = useState<{ texto: string; tipo: 'sucesso' | 'info' | 'alerta' } | null>(null);

  // Estados do Modal de Tempo Específico
  const [modalTempoAberto, setModalTempoAberto] = useState(false);
  const [inputHoras, setInputHoras] = useState(2);
  const [inputMinutos, setInputMinutos] = useState(0);
  const [inputSegundos, setInputSegundos] = useState(0);

  useEffect(() => {
    // 1. Busca estado global mais recente do Supabase
    buscarEstadoCronometroSupabase().then(est => {
      if (est) {
        setEstado(est);
        if (est.rodada) setRodadaSelecionada(est.rodada);
      }
    });

    const atualizar = () => {
      const est = obterEstadoCronometro();
      setEstado(est);
      if (est.rodada) setRodadaSelecionada(est.rodada);
    };

    atualizar();
    const interval = setInterval(atualizar, 250);
    const unsubscribe = subscribeCronometro((novoEst) => {
      setEstado(novoEst);
      if (novoEst.rodada) setRodadaSelecionada(novoEst.rodada);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const rodadaInfo = useMemo(() => {
    return calcularDataRodada(rodadaSelecionada);
  }, [rodadaSelecionada]);

  const tempoFormatado = formatarTempoHHMMSS(estado.tempoRestanteSegundos);

  const exibirFeedback = (texto: string, tipo: 'sucesso' | 'info' | 'alerta' = 'sucesso') => {
    setFeedbackMsg({ texto, tipo });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleIniciarCom5s = () => {
    dispararInicioPartidaCom5s(rodadaSelecionada);
    exibirFeedback('🚀 Contagem de 5 segundos disparada! Em seguida iniciará o tempo oficial.', 'sucesso');
  };

  const handlePausar = () => {
    pausarCronometro();
    exibirFeedback('⏸️ Cronômetro pausado.', 'info');
  };

  const handleRetomar = () => {
    retomarCronometro();
    exibirFeedback('▶️ Cronômetro retomado com sucesso.', 'sucesso');
  };

  const handleQuedaSaideira = () => {
    acionarQuedaSaideira();
    exibirFeedback('⚠️ MODO QUEDA SAÍDEIRA ATIVADO! Telão piscando com aviso às mesas.', 'alerta');
  };

  const handleEncerrar = () => {
    encerrarPartidasDoDia();
    exibirFeedback('🛑 Partidas do dia encerradas oficialmente!', 'info');
  };

  const handleReiniciar = () => {
    if (window.confirm('Deseja realmente resetar o cronômetro para 02:00:00 (parado)?')) {
      reiniciarCronometro(rodadaSelecionada);
      exibirFeedback('🔄 Cronômetro reiniciado para 02:00:00.', 'info');
    }
  };

  const handleAjustarTempo = (segundosDelta: number) => {
    ajustarTempoCronometro(segundosDelta);
    const minutos = Math.abs(segundosDelta / 60);
    const sinal = segundosDelta > 0 ? `+${minutos}` : `-${minutos}`;
    exibirFeedback(`⏱️ Tempo ajustado em ${sinal} minuto(s).`, 'info');
  };

  const handleAplicarTempoEspecifico = (iniciarDireto: boolean = false) => {
    const h = Math.max(0, Number(inputHoras) || 0);
    const m = Math.max(0, Math.min(59, Number(inputMinutos) || 0));
    const s = Math.max(0, Math.min(59, Number(inputSegundos) || 0));
    const totalSegundos = h * 3600 + m * 60 + s;

    definirTempoEspecifico(totalSegundos, iniciarDireto);
    setModalTempoAberto(false);

    const txtTempo = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    exibirFeedback(`⏱️ Tempo definido para ${txtTempo} com sucesso! ${iniciarDireto ? '🚀 Iniciado ao vivo.' : ''}`, 'sucesso');
  };

  const aplicarAtalhoTempo = (h: number, m: number, s: number) => {
    setInputHoras(h);
    setInputMinutos(m);
    setInputSegundos(s);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col selection:bg-emerald-500 selection:text-black">
      
      {/* Header Admin */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco'); }} 
            className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
            title="Voltar ao Hub Admin do Truco"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-400">
              <Clock size={22} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold uppercase tracking-widest text-white leading-tight">
                Controle das Partidas do Dia
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-400 uppercase tracking-widest font-semibold">
                Cronômetro Oficial (02:00 Horas) & Queda Saideira
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open('/ExpoGoiabal/Truco/PartidasDoDia', '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 text-xs font-black uppercase tracking-wider transition-colors border border-amber-500/40 cursor-pointer"
          >
            <Tv size={14} className="text-amber-400" />
            <span>Abrir Telão Público</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto w-full flex flex-col gap-6 animate-in slide-in-from-bottom-6 fade-in duration-500">

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`p-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 ${
            feedbackMsg.tipo === 'sucesso' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
              : feedbackMsg.tipo === 'alerta'
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
          }`}>
            <span>{feedbackMsg.texto}</span>
          </div>
        )}

        {/* PAINEL CENTRAL DE COMANDO DO CRONÔMETRO */}
        <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col items-center justify-center gap-6 shadow-2xl transition-all ${
          estado.status === 'queda_saideira'
            ? 'bg-gradient-to-b from-red-950/80 via-zinc-900 to-zinc-950 border-red-500 shadow-red-500/20'
            : estado.status === 'em_andamento'
            ? 'bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-emerald-500/50 shadow-emerald-500/10'
            : 'bg-zinc-900/90 border-white/10'
        }`}>

          {/* Configuração da Rodada Atual */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                  Rodada Selecionada
                </span>
                <h3 className="text-sm sm:text-base font-black uppercase text-white">
                  Rodada {rodadaSelecionada} • {rodadaInfo.textoCompleto}
                </h3>
              </div>
            </div>

            {/* Seletor de Rodadas (1 a 10) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Alterar Rodada:</span>
              <select
                value={rodadaSelecionada}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setRodadaSelecionada(r);
                  reiniciarCronometro(r);
                }}
                className="bg-zinc-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
                  const info = calcularDataRodada(n);
                  return (
                    <option key={n} value={n}>
                      Rodada {n} ({info.dataFormatada})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            {estado.status === 'pre_inicio_5s' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500 border border-amber-400 text-black text-xs font-black uppercase tracking-widest animate-bounce shadow-xl">
                <span>🔥 Contagem Prévia: {estado.preInicioRestante}s para iniciar</span>
              </div>
            )}

            {estado.status === 'em_andamento' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black uppercase tracking-widest animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Tempo Regulamentar Correndo (02:00:00)</span>
              </div>
            )}

            {estado.status === 'pausado' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-black uppercase tracking-widest">
                <Pause size={14} />
                <span>Cronômetro Pausado</span>
              </div>
            )}

            {estado.status === 'queda_saideira' && (
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 border-2 border-white text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-500/50 animate-pulse">
                <AlertTriangle size={16} />
                <span>⚠️ QUEDA SAÍDEIRA ATIVA NO TELÃO</span>
              </div>
            )}

            {estado.status === 'encerrado' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-800 border border-white/20 text-zinc-300 text-xs font-black uppercase tracking-widest">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Partidas Encerradas</span>
              </div>
            )}

            {estado.status === 'parado' && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-800 border border-white/10 text-zinc-400 text-xs font-black uppercase tracking-widest">
                <Clock size={14} />
                <span>Cronômetro Pronto (02:00:00)</span>
              </div>
            )}
          </div>

          {/* Relógio Digital no Painel do Admin */}
          <div className="font-mono text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight flex items-center gap-2 bg-black/60 px-6 sm:px-10 py-4 sm:py-6 rounded-3xl border border-white/10 shadow-inner">
            <span className={estado.status === 'em_andamento' ? 'text-white' : 'text-zinc-400'}>
              {tempoFormatado.horas}
            </span>
            <span className="text-amber-400 animate-pulse">:</span>
            <span className={estado.status === 'em_andamento' ? 'text-amber-400' : 'text-zinc-400'}>
              {tempoFormatado.minutos}
            </span>
            <span className="text-amber-400 animate-pulse">:</span>
            <span className={estado.status === 'em_andamento' ? 'text-emerald-400' : 'text-zinc-400'}>
              {tempoFormatado.segundos}
            </span>
          </div>

          {/* BOTÕES DE CONTROLE PRINCIPAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full mt-2">
            
            {/* Botão 1: Iniciar com 5s / Retomar */}
            {estado.status === 'parado' || estado.status === 'encerrado' ? (
              <button
                onClick={handleIniciarCom5s}
                className="py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={18} />
                <span>Iniciar Partidas (5s ➔ 2h)</span>
              </button>
            ) : estado.status === 'pausado' ? (
              <button
                onClick={handleRetomar}
                className="py-4 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={18} />
                <span>Retomar Cronômetro</span>
              </button>
            ) : (
              <button
                onClick={handlePausar}
                className="py-4 px-5 rounded-2xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause size={18} />
                <span>Pausar Partidas</span>
              </button>
            )}

            {/* Botão 2: Acionar Queda Saideira */}
            <button
              onClick={handleQuedaSaideira}
              className="py-4 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-400/30"
            >
              <AlertTriangle size={18} />
              <span>Acionar Queda Saideira</span>
            </button>

            {/* Botão 3: Finalizar / Encerrar Partidas */}
            <button
              onClick={handleEncerrar}
              className="py-4 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-black text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>Finalizar Partidas</span>
            </button>

            {/* Botão 4: Resetar / Nova Rodada */}
            <button
              onClick={handleReiniciar}
              className="py-4 px-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Resetar (02:00:00)</span>
            </button>

          </div>

          {/* AJUSTES RÁPIDOS DE TEMPO & INSERÇÃO ESPECÍFICA */}
          <div className="w-full pt-4 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">
                ⏱️ Ajuste Manual:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleAjustarTempo(-300)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase border border-white/5 cursor-pointer"
                  title="Diminuir 5 minutos"
                >
                  -5 min
                </button>
                <button
                  onClick={() => handleAjustarTempo(-60)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase border border-white/5 cursor-pointer"
                  title="Diminuir 1 minuto"
                >
                  -1 min
                </button>
                <button
                  onClick={() => handleAjustarTempo(60)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase border border-white/5 cursor-pointer"
                  title="Adicionar 1 minuto"
                >
                  +1 min
                </button>
                <button
                  onClick={() => handleAjustarTempo(300)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase border border-white/5 cursor-pointer"
                  title="Adicionar 5 minutos"
                >
                  +5 min
                </button>
                <button
                  onClick={() => handleAjustarTempo(600)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase border border-white/5 cursor-pointer"
                  title="Adicionar 10 minutos"
                >
                  +10 min
                </button>
              </div>
            </div>

            {/* Botão de Inserir Tempo Específico */}
            <button
              onClick={() => {
                const s = estado.tempoRestanteSegundos;
                const h = Math.floor(s / 3600);
                const m = Math.floor((s % 3600) / 60);
                const seg = s % 60;
                setInputHoras(h);
                setInputMinutos(m);
                setInputSegundos(seg);
                setModalTempoAberto(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-500/40 shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sliders size={14} className="text-amber-400" />
              <span>Inserir Tempo Específico</span>
            </button>
          </div>

        </div>

        {/* MODAL DE INSERIR TEMPO ESPECÍFICO */}
        {modalTempoAberto && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 relative">
              
              {/* Header do Modal */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-wide">
                      Inserir Tempo Específico
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Configure qualquer tempo para o cronômetro oficial
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setModalTempoAberto(false)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Display de Pré-visualização do Tempo */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                  Tempo a ser aplicado
                </span>
                <div className="font-mono text-4xl sm:text-5xl font-black text-amber-400 tracking-wider">
                  {String(inputHoras).padStart(2, '0')} : {String(inputMinutos).padStart(2, '0')} : {String(inputSegundos).padStart(2, '0')}
                </div>
              </div>

              {/* Inputs de Horas, Minutos e Segundos */}
              <div className="grid grid-cols-3 gap-3">
                {/* Horas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center">
                    Horas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={inputHoras}
                    onChange={(e) => setInputHoras(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 text-center text-xl font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Minutos */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center">
                    Minutos (0-59)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputMinutos}
                    onChange={(e) => setInputMinutos(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 text-center text-xl font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Segundos */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-center">
                    Segundos (0-59)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputSegundos}
                    onChange={(e) => setInputSegundos(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl py-2.5 text-center text-xl font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Atalhos Rápidos */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  ⚡ Atalhos Rápidos com 1 Clique:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(2, 0, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    02:00:00 (2h)
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(1, 30, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    01:30:00
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(1, 0, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    01:00:00
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(0, 45, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    00:45:00
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(0, 30, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    00:30:00
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(0, 15, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    00:15:00
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(0, 5, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    00:05:00
                  </button>
                  <button
                    type="button"
                    onClick={() => aplicarAtalhoTempo(0, 1, 0)}
                    className="py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-[11px] border border-white/5 cursor-pointer"
                  >
                    00:01:00
                  </button>
                </div>
              </div>

              {/* Botões de Ação do Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleAplicarTempoEspecifico(false)}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CheckCircle2 size={16} className="text-amber-400" />
                  <span>Aplicar Tempo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAplicarTempoEspecifico(true)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play size={16} />
                  <span>Aplicar & Iniciar Agora</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* GUIA DAS REGRAS DO CRONÔMETRO */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span>📋 Funcionamento Oficial do Cronômetro</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>1. Contagem de 5 Segundos</span>
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Ao clicar em "Iniciar Partidas", o sistema executa 5 segundos de contagem regressiva para todos os atletas se prepararem antes de iniciar os 120 minutos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>2. 02:00 Horas Regulamentares</span>
              </span>
              <p className="text-zinc-400 leading-relaxed">
                As mesas jogam simultaneamente durante o período oficial. Todos os telões e celulares acompanham a contagem em tempo real.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>3. Queda Saideira & Encerramento</span>
              </span>
              <p className="text-zinc-400 leading-relaxed">
                Ao zerar o tempo, entra automaticamente o alerta piscante <strong>QUEDA SAÍDEIRA</strong>. Concluída a última queda, o admin clica em finalizar e a mensagem <strong>PARTIDAS ENCERRADAS</strong> é transmitida.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
