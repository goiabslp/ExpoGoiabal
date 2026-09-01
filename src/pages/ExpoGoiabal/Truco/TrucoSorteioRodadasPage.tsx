import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  calcularDataRodada,
  popularTimesFicticios,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  Sparkles, 
  Users, 
  Swords, 
  BarChart3, 
  RotateCcw, 
  Play, 
  Pause, 
  SkipForward, 
  Calendar, 
  Trophy,
  Flame,
  CheckCircle2,
  Dices
} from 'lucide-react';

type SorteioAnimStage = 
  | 'espera'
  | 'boas_vindas' 
  | 'preparacao' 
  | 'contagem' 
  | 'confrontos_definidos_intro' 
  | 'duelos_apresentacao' 
  | 'resumo_final';

export const TrucoSorteioRodadasPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle da Apresentação Cinematográfica
  const [stage, setStage] = useState<SorteioAnimStage>('espera');
  const [countdown, setCountdown] = useState(5);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Filtrar ESTRITAMENTE os confrontos do Primeiro Dia (Rodada 1)
  const confrontosPrimeiroDia = partidas.filter(p => p.tipo_fase === 'primeira_fase' && p.rodada === 1);
  const dataPrimeiroDia = calcularDataRodada(1);

  // Carregar dados e sincronizar via realtime
  const carregarDados = async () => {
    try {
      let [eqs, parts, st] = await Promise.all([
        buscarEquipes(),
        buscarPartidas(),
        buscarStatusTorneio()
      ]);

      if (eqs.length < 8) {
        eqs = await popularTimesFicticios();
      }

      setEquipes(eqs);
      setPartidas(parts);

      // Se o sorteio estiver confirmado
      if (st?.sorteio_primeira_fase_confirmado && parts.length > 0) {
        const agora = Date.now();
        const inicioTs = st.sorteio_iniciado_em ? new Date(st.sorteio_iniciado_em).getTime() : 0;
        const diferencaSegundos = (agora - inicioTs) / 1000;

        if (st.sorteio_animacao_ativa || diferencaSegundos < 90) {
          setStage(prev => (prev === 'espera' ? 'boas_vindas' : prev));
        } else {
          setStage(prev => (prev === 'espera' ? 'resumo_final' : prev));
        }
      } else {
        setStage('espera');
      }
    } catch (err) {
      console.error('Erro ao carregar sorteio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => {
      carregarDados();
    });
    return () => unsubscribe();
  }, []);

  // Máquina de Estados da Apresentação
  useEffect(() => {
    if (stage === 'boas_vindas') {
      const timer = setTimeout(() => {
        setStage('preparacao');
      }, 3500);
      return () => clearTimeout(timer);
    }

    if (stage === 'preparacao') {
      const timer = setTimeout(() => {
        setCountdown(5);
        setStage('contagem');
      }, 3500);
      return () => clearTimeout(timer);
    }

    if (stage === 'contagem') {
      if (countdown > 1) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1100);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStage('confrontos_definidos_intro');
        }, 1100);
        return () => clearTimeout(timer);
      }
    }

    if (stage === 'confrontos_definidos_intro') {
      const timer = setTimeout(() => {
        setCurrentMatchIndex(0);
        setStage('duelos_apresentacao');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage, countdown]);

  // Apresentação dos confrontos do Primeiro Dia um a um
  useEffect(() => {
    if (stage !== 'duelos_apresentacao') return;
    if (confrontosPrimeiroDia.length === 0) {
      setStage('resumo_final');
      return;
    }

    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        setCurrentMatchIndex(prev => {
          if (prev + 1 >= confrontosPrimeiroDia.length) {
            clearInterval(interval);
            setStage('resumo_final');
            return prev;
          }
          return prev + 1;
        });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [stage, confrontosPrimeiroDia.length]);

  const getEquipeById = (id: string | null): TrucoEquipe | undefined => {
    if (!id) return undefined;
    return equipes.find(e => e.id === id);
  };

  const handleReiniciarApresentacao = () => {
    setCountdown(5);
    setCurrentMatchIndex(0);
    setIsPaused(false);
    setStage('boas_vindas');
  };

  const handlePularApresentacao = () => {
    setStage('resumo_final');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-amber-500 selection:text-black overflow-x-hidden relative">
      <Header />

      {/* Partículas e Efeitos de Fundo Dinâmicos */}
      <div 
        className="fixed inset-0 z-0 opacity-80 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: 'url(/truco.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/55 via-black/40 to-zinc-950/90 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),transparent)] pointer-events-none" />
      
      {/* Luzes Volumétricas Neon */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-0 rounded-full" />

      <TrucoBackButton to="/ExpoGoiabal/Truco" label="Voltar para o Torneio" />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-3 sm:px-6">
        
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 animate-pulse">
              Carregando transmissão oficial...
            </span>
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

            {/* ========================================================================= */}
            {/* 1. ESTADO DE ESPERA (AGUARDANDO ACIONAMENTO DO ADMINISTRADOR) */}
            {/* ========================================================================= */}
            {stage === 'espera' && (
              <div className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-1000">
                
                {/* Ícone Pulsante */}
                <div className="relative mb-8 group">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-emerald-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)] animate-pulse">
                    <span className="text-6xl sm:text-7xl animate-bounce">🎲</span>
                  </div>
                  <div className="absolute -inset-4 bg-amber-500/20 blur-2xl -z-10 rounded-full animate-ping duration-[3000ms]"></div>
                </div>

                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-widest mb-4 shadow-lg backdrop-blur-md">
                  <Sparkles size={16} className="text-amber-400 animate-spin" />
                  <span>São José do Goiabal - MG • Transmissão ao Vivo</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white mb-4 drop-shadow-[0_6px_30px_rgba(0,0,0,0.9)]">
                  2º Torneio de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">
                    TRUCO OFICIAL
                  </span>
                </h1>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping"></div>
                    <p className="text-lg sm:text-2xl font-black uppercase tracking-wider text-amber-400">
                      🎲 Aguardando o início do sorteio...
                    </p>
                  </div>
                  <p className="text-zinc-400 text-xs sm:text-sm font-medium max-w-lg mt-2">
                    A tela será atualizada automaticamente em tempo real assim que o sorteio for acionado no painel de controle.
                  </p>

                  <div className="mt-8 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-black/60 border border-white/10 text-xs font-bold text-zinc-300 backdrop-blur-md shadow-lg">
                    <Users size={16} className="text-emerald-400" />
                    <span>{equipes.length} Equipes Cadastradas & Prontas para o Sorteio</span>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. BOAS-VINDAS (CINEMATOGRÁFICO) */}
            {/* ========================================================================= */}
            {stage === 'boas_vindas' && (
              <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in zoom-in-75 fade-in duration-1000 relative">
                
                {/* Feixe de Luz Volumétrico */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent -z-10 blur-xl"></div>
                
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-amber-300 bg-amber-500/10 border border-amber-500/40 px-8 py-3 rounded-full mb-8 shadow-[0_0_35px_rgba(245,158,11,0.4)] animate-pulse backdrop-blur-xl">
                  <Flame size={16} className="text-amber-400" />
                  <span>TRANSMISSÃO OFICIAL DO SORTEIO</span>
                  <Flame size={16} className="text-amber-400" />
                </span>

                <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-widest text-zinc-300 mb-3 drop-shadow-lg">
                  SEJAM BEM-VINDOS AO
                </h2>

                <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 mb-6 drop-shadow-[0_0_60px_rgba(245,158,11,0.6)] scale-100 hover:scale-105 transition-transform duration-700">
                  2º TORNEIO DE TRUCO
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-amber-400"></div>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                    DE SÃO JOSÉ DO GOIABAL - MG
                  </h3>
                  <div className="h-[2px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. MENSAGEM DE PREPARAÇÃO */}
            {/* ========================================================================= */}
            {stage === 'preparacao' && (
              <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in zoom-in-90 fade-in duration-700 relative">
                
                <div className="relative mb-8">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 text-black border-4 border-amber-300 flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.7)] animate-spin duration-[8000ms]">
                    <Dices size={64} className="text-black" />
                  </div>
                  <div className="absolute -inset-4 bg-amber-400/30 blur-2xl -z-10 rounded-full animate-ping"></div>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white mb-4 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                  🎲 O SORTEIO FOI ATIVADO!
                </h1>

                <p className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 max-w-3xl leading-relaxed drop-shadow-md">
                  Após a contagem regressiva, vamos definir os confrontos do 1º DIA!
                </p>

                <div className="mt-8 flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-bold text-zinc-400">
                  <Calendar size={15} className="text-amber-400" />
                  <span>Data de Abertura: {dataPrimeiroDia.textoCompleto}</span>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. CONTAGEM REGRESSIVA (05 -> 01) COM IMPACTO EXTREMO */}
            {/* ========================================================================= */}
            {stage === 'contagem' && (
              <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative">
                
                <span className="text-sm sm:text-lg font-black uppercase tracking-[0.4em] text-zinc-400 mb-6 animate-pulse">
                  DEFININDO OS CONFRONTOS EM
                </span>

                {/* Número Gigante com Anéis de Choque e Explosão */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Anel de Onda Expansiva */}
                  <div 
                    key={`ring-${countdown}`}
                    className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full border-4 border-amber-400/60 animate-ping duration-1000 -z-10"
                  />

                  <div 
                    key={`glow-${countdown}`}
                    className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-amber-500/20 blur-3xl -z-10 animate-pulse"
                  />

                  {/* Número Central */}
                  <div 
                    key={countdown} 
                    className="text-[9rem] sm:text-[16rem] md:text-[20rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-400 to-amber-700 drop-shadow-[0_0_90px_rgba(245,158,11,0.9)] animate-in zoom-in-50 fade-in duration-500 select-none tracking-tighter"
                  >
                    {String(countdown).padStart(2, '0')}
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400/80 mt-6 animate-bounce">
                  ⚡ PREPARE-SE PARA OS DUELOS ⚡
                </span>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. CONFRONTOS DEFINIDOS (CHAMADA DE ALTO IMPACTO) */}
            {/* ========================================================================= */}
            {stage === 'confrontos_definidos_intro' && (
              <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in zoom-in-75 fade-in duration-500 relative">
                
                {/* Explosão de Luz */}
                <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-teal-700 text-black border-4 border-emerald-300 flex items-center justify-center mb-8 shadow-[0_0_100px_rgba(16,185,129,0.8)] animate-pulse">
                  <Swords size={72} className="text-black animate-bounce" />
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-amber-400 drop-shadow-[0_0_60px_rgba(16,185,129,0.8)]">
                  ⚔️ CONFRONTOS DEFINIDOS!
                </h1>

                <p className="text-lg sm:text-2xl font-black uppercase tracking-widest text-amber-400 mt-4">
                  Apresentação Oficial dos Jogos do 1º Dia
                </p>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. APRESENTAÇÃO DOS CONFRONTOS — SOMENTE DO PRIMEIRO DIA (DUELO A DUELO) */}
            {/* ========================================================================= */}
            {stage === 'duelos_apresentacao' && (
              <div className="w-full min-h-[75vh] flex flex-col items-center justify-between px-2 sm:px-4 py-4 animate-in fade-in duration-500">
                
                {(() => {
                  const pAtual = confrontosPrimeiroDia[currentMatchIndex];
                  if (!pAtual) return null;
                  const timeA = getEquipeById(pAtual.time_a_id);
                  const timeB = getEquipeById(pAtual.time_b_id);

                  // Variação de estilo para cada duelo
                  const dueloNumero = currentMatchIndex + 1;
                  const totalDuelos = confrontosPrimeiroDia.length;

                  return (
                    <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-700">
                      
                      {/* Topo: Selo Oficial do 1º Dia & Jogo */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900/95 border-2 border-amber-500/50 px-8 py-3 rounded-full shadow-[0_0_40px_rgba(245,158,11,0.2)] backdrop-blur-xl">
                        <span className="text-xs sm:text-base font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                          <Flame size={18} className="text-amber-400" />
                          <span>1º DIA • JOGO #{String(dueloNumero).padStart(2, '0')}</span>
                        </span>
                        <span className="text-zinc-600 hidden sm:inline">|</span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-300 flex items-center gap-1.5">
                          <Calendar size={14} className="text-emerald-400" />
                          <span>{dataPrimeiroDia.textoCompleto}</span>
                        </span>
                      </div>

                      {/* DUELO ÉPICO EM DESTAQUE CINEMATOGRÁFICO */}
                      <div 
                        key={pAtual.id}
                        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 items-center gap-6 sm:gap-8 my-2 p-6 sm:p-12 rounded-[3rem] bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-zinc-900/95 border-2 border-amber-500/40 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-2xl"
                      >
                        
                        {/* Brilhos de Fundo no Card */}
                        <div className="absolute -left-20 -top-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* TIME A — Desliza com Impacto da Esquerda */}
                        <div className="lg:col-span-2 flex flex-col items-center text-center gap-4 animate-in slide-in-from-left-16 zoom-in-95 duration-700">
                          <div className="relative group">
                            <div className="w-36 h-36 sm:w-52 sm:h-52 rounded-3xl overflow-hidden bg-zinc-900 border-3 border-emerald-400/70 shadow-[0_0_40px_rgba(16,185,129,0.35)] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                              {timeA?.foto_url ? (
                                <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={64} className="text-zinc-600" />
                              )}
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg">
                              Mandante
                            </div>
                          </div>

                          <div className="mt-2">
                            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">
                              {timeA?.nome || 'Equipe A'}
                            </h3>
                            <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-widest block mt-1">
                              📍 {timeA?.cidade || 'São José do Goiabal - MG'}
                            </span>
                          </div>
                        </div>

                        {/* VERSUS CENTRAL CINEMATOGRÁFICO */}
                        <div className="lg:col-span-1 flex flex-col items-center justify-center my-4 animate-in zoom-in-50 duration-500">
                          <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-black flex items-center justify-center font-black shadow-[0_0_60px_rgba(245,158,11,0.8)] border-4 border-yellow-200 animate-pulse">
                              <span className="text-2xl sm:text-3xl font-black tracking-tighter">VS</span>
                            </div>
                            <div className="absolute -inset-2 bg-amber-500/30 blur-xl -z-10 rounded-full animate-ping duration-[2500ms]" />
                          </div>
                          
                          <div className="mt-3 px-4 py-1 rounded-full bg-black/60 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest text-amber-300">
                            Duelo Direto
                          </div>
                        </div>

                        {/* TIME B — Desliza com Impacto da Direita */}
                        <div className="lg:col-span-2 flex flex-col items-center text-center gap-4 animate-in slide-in-from-right-16 zoom-in-95 duration-700">
                          <div className="relative group">
                            <div className="w-36 h-36 sm:w-52 sm:h-52 rounded-3xl overflow-hidden bg-zinc-900 border-3 border-amber-400/70 shadow-[0_0_40px_rgba(245,158,11,0.35)] flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                              {timeB?.foto_url ? (
                                <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={64} className="text-zinc-600" />
                              )}
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg">
                              Visitante
                            </div>
                          </div>

                          <div className="mt-2">
                            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md">
                              {timeB?.nome || 'Equipe B'}
                            </h3>
                            <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-widest block mt-1">
                              📍 {timeB?.cidade || 'São José do Goiabal - MG'}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Barra de Progresso e Controles */}
                      <div className="w-full max-w-lg flex flex-col items-center gap-3">
                        <div className="w-full flex items-center justify-between text-xs font-bold text-zinc-400">
                          <span>Confronto do 1º Dia: {dueloNumero} de {totalDuelos}</span>
                          <span className="text-amber-400">{Math.round((dueloNumero / totalDuelos) * 100)}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-white/10 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
                            style={{ width: `${(dueloNumero / totalDuelos) * 100}%` }}
                          />
                        </div>

                        {/* Botões de Controle na Telão */}
                        <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
                          <button
                            onClick={() => setIsPaused(prev => !prev)}
                            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-white/10 shadow-md transition-all"
                          >
                            {isPaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} className="text-amber-400" />}
                            <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
                          </button>

                          <button
                            onClick={() => {
                              if (currentMatchIndex + 1 < totalDuelos) {
                                setCurrentMatchIndex(prev => prev + 1);
                              } else {
                                setStage('resumo_final');
                              }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border border-emerald-500/30 shadow-md transition-all"
                          >
                            <SkipForward size={14} />
                            <span>Próximo Duelo</span>
                          </button>

                          <button
                            onClick={handlePularApresentacao}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                          >
                            <span>Ver Resumo do 1º Dia</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. RESUMO FINAL (EXCLUSIVAMENTE OS CONFRONTOS DO PRIMEIRO DIA) */}
            {/* ========================================================================= */}
            {stage === 'resumo_final' && (
              <div className="w-full flex flex-col items-center gap-8 animate-in zoom-in-95 fade-in duration-700">
                
                {/* Header do Resumo Oficial do Primeiro Dia */}
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-amber-500/40 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl">
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
                      <Trophy size={14} className="text-amber-400" />
                      <span>Sorteio Oficial Concluído com Sucesso</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                      🏆 CONFRONTOS DO PRIMEIRO DIA
                    </h1>
                    <p className="text-zinc-400 text-xs sm:text-base font-semibold mt-1">
                      📅 {dataPrimeiroDia.textoCompleto} • {confrontosPrimeiroDia.length} Jogos Oficiais de Abertura
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <button
                      onClick={handleReiniciarApresentacao}
                      className="px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
                    >
                      <RotateCcw size={15} className="text-amber-400" />
                      <span>Rever Sorteio</span>
                    </button>

                    <button
                      onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Partidas'); }}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Swords size={16} />
                      <span>Ir para as Partidas</span>
                    </button>

                    <button
                      onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <BarChart3 size={16} />
                      <span>Ver Tabela Geral</span>
                    </button>
                  </div>
                </div>

                {/* Grade dos Confrontos do Primeiro Dia */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {confrontosPrimeiroDia.map((jogo, idx) => {
                    const timeA = getEquipeById(jogo.time_a_id);
                    const timeB = getEquipeById(jogo.time_b_id);

                    return (
                      <div 
                        key={jogo.id}
                        className="bg-zinc-900/90 border-2 border-white/10 hover:border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 flex flex-col justify-between gap-4 group"
                      >
                        {/* Topo do Card de Confronto */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
                            JOGO #{String(idx + 1).padStart(2, '0')} DO 1º DIA
                          </span>
                          <span className="text-xs font-bold text-zinc-400">
                            {dataPrimeiroDia.diaSemana}
                          </span>
                        </div>

                        {/* Duelo de Times */}
                        <div className="grid grid-cols-5 items-center gap-3 py-2">
                          
                          {/* Time A */}
                          <div className="col-span-2 flex flex-col items-center text-center gap-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-emerald-500/40 shadow-md">
                              {timeA?.foto_url ? (
                                <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500"><Users size={24} /></div>
                              )}
                            </div>
                            <h4 className="font-black text-sm uppercase text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                              {timeA?.nome || 'Time A'}
                            </h4>
                            <span className="text-[10px] text-zinc-400 line-clamp-1">
                              {timeA?.cidade}
                            </span>
                          </div>

                          {/* VS Badge */}
                          <div className="col-span-1 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-black flex items-center justify-center font-black text-xs shadow-md">
                              VS
                            </div>
                          </div>

                          {/* Time B */}
                          <div className="col-span-2 flex flex-col items-center text-center gap-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-amber-500/40 shadow-md">
                              {timeB?.foto_url ? (
                                <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500"><Users size={24} /></div>
                              )}
                            </div>
                            <h4 className="font-black text-sm uppercase text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                              {timeB?.nome || 'Time B'}
                            </h4>
                            <span className="text-[10px] text-zinc-400 line-clamp-1">
                              {timeB?.cidade}
                            </span>
                          </div>

                        </div>

                        {/* Rodapé do Card */}
                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                          <span className="flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            <span>1ª Fase • Confronto Oficial</span>
                          </span>
                          <span className="text-[11px] font-bold text-amber-400/90">
                            {dataPrimeiroDia.dataFormatada}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};
