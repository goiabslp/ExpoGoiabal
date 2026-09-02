import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  calcularDataRodada,
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
  Dices,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Tv,
  Grid,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

type SorteioAnimStage = 
  | 'espera'
  | 'boas_vindas' 
  | 'preparacao' 
  | 'contagem' 
  | 'confrontos_definidos_intro' 
  | 'duelos_apresentacao' 
  | 'resumo_final';

type ExibicaoResumoMode = 'slides_tv' | 'grade_compacta';

export const TrucoSorteioRodadasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle da Apresentação Cinematográfica
  const [stage, setStage] = useState<SorteioAnimStage>('espera');
  const [countdown, setCountdown] = useState(5);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Controle de Tela Cheia (Fullscreen)
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modo de exibição no Resumo Final (Slides de TV automáticos ou grade compacta)
  const [exibicaoResumo, setExibicaoResumo] = useState<ExibicaoResumoMode>('slides_tv');
  const [currentSlidePage, setCurrentSlidePage] = useState(0);
  const [slideTimerProgress, setSlideTimerProgress] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Relógio em tempo real da transmissão
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Atualizar relógio em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitorar alterações de fullscreen do navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Erro ao ativar tela cheia:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Erro ao sair de tela cheia:', err);
      });
    }
  };

  // Filtrar ESTRITAMENTE os confrontos do Primeiro Dia (Rodada 1)
  const confrontosPrimeiroDia = partidas.filter(p => p.tipo_fase === 'primeira_fase' && p.rodada === 1);
  const dataPrimeiroDia = calcularDataRodada(1);

  // Identificar rota atual para ajustar estágio ou modo
  const currentPath = location.pathname.toLowerCase();
  const isResumoRoute = currentPath.endsWith('/resumo');
  const isTvRoute = currentPath.endsWith('/tv');
  const isAoVivoRoute = currentPath.endsWith('/aovivo') || currentPath.endsWith('/ao-vivo');

  // Carregar dados e sincronizar via realtime
  const carregarDados = async () => {
    try {
      const [eqs, parts, st] = await Promise.all([
        buscarEquipes(),
        buscarPartidas(),
        buscarStatusTorneio()
      ]);

      setEquipes(eqs);
      setPartidas(parts);

      // Respeitar rota explícita de resumo ou TV se chamada diretamente
      if (isResumoRoute || isTvRoute) {
        setStage('resumo_final');
        if (isTvRoute) setExibicaoResumo('slides_tv');
        return;
      }

      // Se o sorteio estiver confirmado no banco
      if (st?.sorteio_primeira_fase_confirmado && parts.length > 0) {
        const agora = Date.now();
        const inicioTs = st.sorteio_iniciado_em ? new Date(st.sorteio_iniciado_em).getTime() : 0;
        const diferencaSegundos = (agora - inicioTs) / 1000;

        if (st.sorteio_animacao_ativa || diferencaSegundos < 90 || isAoVivoRoute) {
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
  }, [location.pathname]);

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

  // Configuração da Paginação dos Slides de TV (4 confrontos por slide/tela)
  const itensPorSlide = 4;
  const totalPaginasSlides = Math.ceil(confrontosPrimeiroDia.length / itensPorSlide) || 1;
  const confrontosPaginaAtual = confrontosPrimeiroDia.slice(
    currentSlidePage * itensPorSlide,
    (currentSlidePage + 1) * itensPorSlide
  );

  // Rotação automática dos Slides de TV no resumo_final
  useEffect(() => {
    if (stage !== 'resumo_final' || exibicaoResumo !== 'slides_tv' || totalPaginasSlides <= 1 || isSlidePaused) {
      setSlideTimerProgress(0);
      return;
    }

    const durationMs = 8000;
    const stepMs = 100;
    const progressPerStep = (stepMs / durationMs) * 100;

    const interval = setInterval(() => {
      setSlideTimerProgress(prev => {
        if (prev + progressPerStep >= 100) {
          setCurrentSlidePage(p => (p + 1) % totalPaginasSlides);
          return 0;
        }
        return prev + progressPerStep;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [stage, exibicaoResumo, totalPaginasSlides, isSlidePaused, currentSlidePage]);

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

  const handleMudarAbaRota = (rota: string) => {
    navigate(rota);
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen w-screen overflow-hidden flex flex-col justify-between bg-zinc-950 text-white selection:bg-amber-500 selection:text-black relative select-none">
      
      {/* Partículas e Efeitos de Fundo Dinâmicos */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: 'url(/truco.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/85 via-zinc-950/80 to-zinc-950/95 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(245,158,11,0.18),transparent)] pointer-events-none" />
      
      {/* Luzes Volumétricas Neon */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-0 rounded-full" />

      {/* ========================================================================= */}
      {/* CABEÇALHO COMPACTO ESPECIAL PARA TELÃO / TV (100% VIEWPORT COMPLIANT) */}
      {/* ========================================================================= */}
      <header className="relative z-30 h-14 sm:h-16 lg:h-18 px-3 sm:px-6 lg:px-8 border-b border-white/10 bg-black/60 backdrop-blur-xl shrink-0 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Esquerda: Logo do Evento e Botão de Voltar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/ExpoGoiabal/Truco')}
            title="Voltar ao Torneio"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105"
          >
            <ArrowLeft size={16} className="text-emerald-400" />
            <span className="hidden md:inline">Torneio</span>
          </button>

          <div 
            onClick={() => navigate('/ExpoGoiabal/Inicio')} 
            className="cursor-pointer flex items-center gap-2"
          >
            <img 
              src="/logo-header.png" 
              alt="ExpoGoiabal" 
              className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
            />
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 leading-none">
                2º Torneio de Truco
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 leading-none mt-0.5">
                São José do Goiabal - MG
              </span>
            </div>
          </div>
        </div>

        {/* Centro: Seletor de Rota / Abas URL & Selo AO VIVO */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          
          {/* Badge Ao Vivo */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] sm:text-xs font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>AO VIVO</span>
          </div>

          {/* Abas com Rota URL */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                handleMudarAbaRota('/ExpoGoiabal/Truco/Sorteio/AoVivo');
                if (stage === 'resumo_final') {
                  handleReiniciarApresentacao();
                }
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                stage !== 'resumo_final'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dices size={13} />
              <span className="hidden sm:inline">Transmissão</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleMudarAbaRota('/ExpoGoiabal/Truco/Sorteio/Resumo');
                setStage('resumo_final');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                stage === 'resumo_final'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy size={13} />
              <span>1º Dia</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleMudarAbaRota('/ExpoGoiabal/Truco/Sorteio/TV');
                setStage('resumo_final');
                setExibicaoResumo('slides_tv');
              }}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPath.includes('/tv')
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tv size={13} />
              <span className="hidden md:inline">Modo TV</span>
            </button>
          </div>
        </div>

        {/* Direita: Relógio, Partidas, Tabela e Tela Cheia */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Relógio Digital da Transmissão */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-xs font-mono font-bold text-amber-300">
            <Clock size={13} className="text-amber-400" />
            <span>{currentTimeStr || '00:00:00'}</span>
          </div>

          <button
            type="button"
            onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Partidas'); }}
            title="Ir para Partidas"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
          >
            <Swords size={15} className="text-emerald-400" />
            <span className="hidden xl:inline">Partidas</span>
          </button>

          <button
            type="button"
            onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
            title="Ver Tabela Geral"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
          >
            <BarChart3 size={15} className="text-amber-400" />
            <span className="hidden xl:inline">Tabela</span>
          </button>

          {/* Botão de Tela Cheia (Fullscreen) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Telão / Tela Cheia'}
            className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer shadow-md hover:scale-105"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

      </header>

      {/* ========================================================================= */}
      {/* CONTEÚDO PRINCIPAL (100% VIEWPORT / SEM ROLAGEM) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 min-h-0 w-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in">
            <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(245,158,11,0.5)]"></div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400 animate-pulse">
              Carregando transmissão oficial do sorteio...
            </span>
          </div>
        ) : (
          <div className="w-full h-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-0">

            {/* ========================================================================= */}
            {/* 1. ESTADO DE ESPERA (AGUARDANDO ACIONAMENTO DO ADMINISTRADOR) */}
            {/* ========================================================================= */}
            {stage === 'espera' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 py-2 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Ícone Pulsante */}
                <div className="relative mb-4 sm:mb-6 group shrink-0">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-emerald-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.3)] animate-pulse">
                    <span className="text-4xl sm:text-6xl md:text-7xl animate-bounce">🎲</span>
                  </div>
                  <div className="absolute -inset-3 bg-amber-500/20 blur-2xl -z-10 rounded-full animate-ping duration-[3000ms]"></div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-widest mb-3 shadow-lg backdrop-blur-md shrink-0">
                  <Sparkles size={14} className="text-amber-400 animate-spin" />
                  <span>São José do Goiabal - MG • Transmissão ao Vivo</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-3 drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] leading-tight">
                  2º Torneio de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">
                    TRUCO OFICIAL
                  </span>
                </h1>

                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl">
                    <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></div>
                    <p className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-wider text-amber-400">
                      🎲 Aguardando o início do sorteio...
                    </p>
                  </div>
                  
                  <p className="text-zinc-400 text-[11px] sm:text-xs md:text-sm font-medium max-w-lg mt-1">
                    A tela será atualizada automaticamente em tempo real assim que o sorteio for acionado no painel de controle.
                  </p>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-zinc-300 backdrop-blur-md shadow-lg">
                    <Users size={15} className="text-emerald-400" />
                    <span>{equipes.length} Equipes Cadastradas & Prontas para o Sorteio</span>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. BOAS-VINDAS (CINEMATOGRÁFICO) */}
            {/* ========================================================================= */}
            {stage === 'boas_vindas' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 py-2 animate-in zoom-in-75 fade-in duration-1000 relative">
                
                {/* Feixe de Luz Volumétrico */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-transparent to-transparent -z-10 blur-xl"></div>
                
                <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-[0.3em] text-amber-300 bg-amber-500/10 border border-amber-500/40 px-6 py-2.5 rounded-full mb-6 shadow-[0_0_35px_rgba(245,158,11,0.4)] animate-pulse backdrop-blur-xl">
                  <Flame size={15} className="text-amber-400" />
                  <span>TRANSMISSÃO OFICIAL DO SORTEIO</span>
                  <Flame size={15} className="text-amber-400" />
                </span>

                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-widest text-zinc-300 mb-2 drop-shadow-lg">
                  SEJAM BEM-VINDOS AO
                </h2>

                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 mb-4 drop-shadow-[0_0_60px_rgba(245,158,11,0.6)] leading-tight">
                  2º TORNEIO DE TRUCO
                </h1>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-[2px] w-8 sm:w-20 bg-gradient-to-r from-transparent to-amber-400"></div>
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                    DE SÃO JOSÉ DO GOIABAL - MG
                  </h3>
                  <div className="h-[2px] w-8 sm:w-20 bg-gradient-to-l from-transparent to-amber-400"></div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. MENSAGEM DE PREPARAÇÃO */}
            {/* ========================================================================= */}
            {stage === 'preparacao' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 py-2 animate-in zoom-in-90 fade-in duration-700 relative">
                
                <div className="relative mb-6 shrink-0">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 text-black border-4 border-amber-300 flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.7)] animate-spin duration-[8000ms]">
                    <Dices size={54} className="text-black" />
                  </div>
                  <div className="absolute -inset-3 bg-amber-400/30 blur-2xl -z-10 rounded-full animate-ping"></div>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-3 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                  🎲 O SORTEIO FOI ATIVADO!
                </h1>

                <p className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 max-w-2xl leading-relaxed drop-shadow-md">
                  Após a contagem regressiva, vamos definir os confrontos do 1º DIA!
                </p>

                <div className="mt-6 flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-bold text-zinc-300">
                  <Calendar size={14} className="text-amber-400" />
                  <span>Data de Abertura: {dataPrimeiroDia.textoCompleto}</span>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. CONTAGEM REGRESSIVA (05 -> 01) COM IMPACTO TOTAL */}
            {/* ========================================================================= */}
            {stage === 'contagem' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 relative">
                
                <span className="text-xs sm:text-base md:text-lg font-black uppercase tracking-[0.4em] text-zinc-400 mb-2 animate-pulse">
                  DEFININDO OS CONFRONTOS EM
                </span>

                {/* Número Gigante Ajustado ao Viewport */}
                <div className="relative flex items-center justify-center my-2">
                  
                  {/* Anel de Onda Expansiva */}
                  <div 
                    key={`ring-${countdown}`}
                    className="absolute w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full border-4 border-amber-400/60 animate-ping duration-1000 -z-10"
                  />

                  <div 
                    key={`glow-${countdown}`}
                    className="absolute w-36 h-36 sm:w-60 sm:h-60 rounded-full bg-amber-500/20 blur-3xl -z-10 animate-pulse"
                  />

                  {/* Número Central Fluido */}
                  <div 
                    key={countdown} 
                    className="text-[20vh] sm:text-[25vh] md:text-[30vh] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-400 to-amber-700 drop-shadow-[0_0_90px_rgba(245,158,11,0.9)] animate-in zoom-in-50 fade-in duration-500 select-none tracking-tighter"
                  >
                    {String(countdown).padStart(2, '0')}
                  </div>
                </div>

                <span className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-amber-400/90 mt-2 animate-bounce">
                  ⚡ PREPARE-SE PARA OS DUELOS ⚡
                </span>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 5. CONFRONTOS DEFINIDOS (CHAMADA DE ALTO IMPACTO) */}
            {/* ========================================================================= */}
            {stage === 'confrontos_definidos_intro' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 animate-in zoom-in-75 fade-in duration-500 relative">
                
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-700 text-black border-4 border-emerald-300 flex items-center justify-center mb-6 shadow-[0_0_100px_rgba(16,185,129,0.8)] animate-pulse shrink-0">
                  <Swords size={56} className="text-black animate-bounce" />
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-amber-400 drop-shadow-[0_0_60px_rgba(16,185,129,0.8)] leading-tight">
                  ⚔️ CONFRONTOS DEFINIDOS!
                </h1>

                <p className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-widest text-amber-400 mt-3">
                  Apresentação Oficial dos Jogos do 1º Dia
                </p>

              </div>
            )}

            {/* ========================================================================= */}
            {/* 6. APRESENTAÇÃO DOS CONFRONTOS — 100% VIEWPORT NA TV */}
            {/* ========================================================================= */}
            {stage === 'duelos_apresentacao' && (
              <div className="w-full h-full flex flex-col items-center justify-between px-2 sm:px-4 py-1 animate-in fade-in duration-500 min-h-0">
                
                {(() => {
                  const pAtual = confrontosPrimeiroDia[currentMatchIndex];
                  if (!pAtual) return null;
                  const timeA = getEquipeById(pAtual.time_a_id);
                  const timeB = getEquipeById(pAtual.time_b_id);

                  const dueloNumero = currentMatchIndex + 1;
                  const totalDuelos = confrontosPrimeiroDia.length;

                  return (
                    <div className="w-full h-full flex flex-col items-center justify-between min-h-0 gap-2">
                      
                      {/* Topo do Duelo: Selo Oficial */}
                      <div className="flex items-center gap-2 sm:gap-3 bg-zinc-900/95 border border-amber-500/50 px-5 sm:px-8 py-2 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-xl shrink-0">
                        <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                          <Flame size={16} className="text-amber-400" />
                          <span>1º DIA • JOGO #{String(dueloNumero).padStart(2, '0')}</span>
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-[11px] sm:text-xs md:text-sm font-bold text-zinc-300 flex items-center gap-1">
                          <Calendar size={13} className="text-emerald-400" />
                          <span>{dataPrimeiroDia.textoCompleto}</span>
                        </span>
                      </div>

                      {/* DUELO CENTRAL (RESPONSIVO E ENCAIXADO NO VIEWPORT) */}
                      <div 
                        key={pAtual.id}
                        className="w-full max-w-5xl flex-1 min-h-0 max-h-[56vh] grid grid-cols-11 items-center gap-2 sm:gap-4 p-4 sm:p-6 lg:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-zinc-900/95 border-2 border-amber-500/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-2xl"
                      >
                        
                        {/* Brilhos de Fundo */}
                        <div className="absolute -left-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* TIME A (MANDANTE) */}
                        <div className="col-span-5 flex flex-col items-center text-center gap-2 sm:gap-3 animate-in slide-in-from-left-12 zoom-in-95 duration-700 min-h-0 overflow-hidden">
                          <div className="relative group shrink-0">
                            <div className="h-[18vh] sm:h-[22vh] md:h-[26vh] lg:h-[28vh] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border-2 sm:border-3 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex items-center justify-center">
                              {timeA?.foto_url ? (
                                <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={48} className="text-zinc-600" />
                              )}
                            </div>
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-md">
                              Mandante
                            </div>
                          </div>

                          <div className="w-full px-2 overflow-hidden">
                            <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md truncate">
                              {timeA?.nome || 'Equipe A'}
                            </h3>
                            <span className="text-[10px] sm:text-xs md:text-sm font-bold text-emerald-400 uppercase tracking-widest block truncate">
                              📍 {timeA?.cidade || 'São José do Goiabal - MG'}
                            </span>
                          </div>
                        </div>

                        {/* VERSUS CENTRAL */}
                        <div className="col-span-1 flex flex-col items-center justify-center animate-in zoom-in-50 duration-500 shrink-0">
                          <div className="relative">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-black flex items-center justify-center font-black shadow-[0_0_50px_rgba(245,158,11,0.8)] border-2 sm:border-3 border-yellow-200 animate-pulse">
                              <span className="text-sm sm:text-xl md:text-2xl font-black tracking-tighter">VS</span>
                            </div>
                            <div className="absolute -inset-2 bg-amber-500/30 blur-lg -z-10 rounded-full animate-ping duration-[2500ms]" />
                          </div>
                        </div>

                        {/* TIME B (VISITANTE) */}
                        <div className="col-span-5 flex flex-col items-center text-center gap-2 sm:gap-3 animate-in slide-in-from-right-12 zoom-in-95 duration-700 min-h-0 overflow-hidden">
                          <div className="relative group shrink-0">
                            <div className="h-[18vh] sm:h-[22vh] md:h-[26vh] lg:h-[28vh] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 border-2 sm:border-3 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.35)] flex items-center justify-center">
                              {timeB?.foto_url ? (
                                <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={48} className="text-zinc-600" />
                              )}
                            </div>
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-black font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-md">
                              Visitante
                            </div>
                          </div>

                          <div className="w-full px-2 overflow-hidden">
                            <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wider text-white drop-shadow-md truncate">
                              {timeB?.nome || 'Equipe B'}
                            </h3>
                            <span className="text-[10px] sm:text-xs md:text-sm font-bold text-amber-400 uppercase tracking-widest block truncate">
                              📍 {timeB?.cidade || 'São José do Goiabal - MG'}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Rodapé: Progresso e Controles na TV */}
                      <div className="w-full max-w-lg flex flex-col items-center gap-2 shrink-0">
                        <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-bold text-zinc-400">
                          <span>Confronto: {dueloNumero} de {totalDuelos}</span>
                          <span className="text-amber-400">{Math.round((dueloNumero / totalDuelos) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/10 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-500"
                            style={{ width: `${(dueloNumero / totalDuelos) * 100}%` }}
                          />
                        </div>

                        {/* Controles de Apresentação */}
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap justify-center">
                          <button
                            onClick={() => setIsPaused(prev => !prev)}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10 shadow-md transition-all"
                          >
                            {isPaused ? <Play size={13} className="text-emerald-400" /> : <Pause size={13} className="text-amber-400" />}
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
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-emerald-500/30 shadow-md transition-all"
                          >
                            <SkipForward size={13} />
                            <span>Próximo</span>
                          </button>

                          <button
                            onClick={handlePularApresentacao}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 transition-all"
                          >
                            <span>Ver Todos do 1º Dia</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}

            {/* ========================================================================= */}
            {/* 7. RESUMO FINAL (RESPONSIVO E 100% NO VIEWPORT PARA TELAS DE TV) */}
            {/* ========================================================================= */}
            {stage === 'resumo_final' && (
              <div className="w-full h-full flex flex-col justify-between items-center gap-2 sm:gap-3 animate-in zoom-in-95 fade-in duration-500 min-h-0">
                
                {/* Header do Resumo: Título, Modo de Exibição e Ações */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 bg-gradient-to-r from-zinc-900/90 via-zinc-950/90 to-zinc-900/90 border border-amber-500/40 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-xl backdrop-blur-xl shrink-0">
                  <div className="text-center sm:text-left flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Trophy size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <h1 className="text-base sm:text-xl lg:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                        🏆 Confrontos do 1º Dia
                      </h1>
                      <p className="text-zinc-400 text-[10px] sm:text-xs font-semibold">
                        📅 {dataPrimeiroDia.textoCompleto} • {confrontosPrimeiroDia.length} Jogos Oficiais
                      </p>
                    </div>
                  </div>

                  {/* Alternar Modo de Exibição (Slides TV ou Grade Fit) */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setExibicaoResumo('slides_tv')}
                        title="Modo Rotação Automática Telão TV"
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          exibicaoResumo === 'slides_tv'
                            ? 'bg-amber-500 text-black font-black shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Layers size={13} />
                        <span>Slides TV</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExibicaoResumo('grade_compacta')}
                        title="Modo Grade Geral Compacta"
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          exibicaoResumo === 'grade_compacta'
                            ? 'bg-emerald-500 text-black font-black shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Grid size={13} />
                        <span>Grade Completa</span>
                      </button>
                    </div>

                    <button
                      onClick={handleReiniciarApresentacao}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                    >
                      <RotateCcw size={13} className="text-amber-400" />
                      <span className="hidden md:inline">Rever</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* MODO A: SLIDES TV (ROTAÇÃO AUTOMÁTICA EM TELÃO SEM ROLAGEM) */}
                {/* ========================================================================= */}
                {exibicaoResumo === 'slides_tv' && (
                  <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-2">
                    
                    {/* Grade 2x2 de Jogos da Página Atual */}
                    <div className="w-full flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
                      {confrontosPaginaAtual.map((jogo, localIdx) => {
                        const globalIdx = currentSlidePage * itensPorSlide + localIdx;
                        const timeA = getEquipeById(jogo.time_a_id);
                        const timeB = getEquipeById(jogo.time_b_id);

                        return (
                          <div 
                            key={jogo.id}
                            className="bg-zinc-900/90 border border-white/10 hover:border-amber-500/50 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col justify-between gap-2 backdrop-blur-xl relative overflow-hidden group min-h-0 animate-in fade-in zoom-in-98 duration-300"
                          >
                            {/* Topo do Card */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-white/5 shrink-0">
                              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-amber-500/30">
                                JOGO #{String(globalIdx + 1).padStart(2, '0')} DO 1º DIA
                              </span>
                              <span className="text-[10px] sm:text-xs font-bold text-zinc-400">
                                {dataPrimeiroDia.diaSemana}
                              </span>
                            </div>

                            {/* Duelo de Times */}
                            <div className="grid grid-cols-11 items-center gap-2 flex-1 min-h-0 py-1">
                              
                              {/* Time A */}
                              <div className="col-span-5 flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl overflow-hidden bg-zinc-800 border-2 border-emerald-500/50 shadow-md shrink-0">
                                  {timeA?.foto_url ? (
                                    <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500"><Users size={20} /></div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-black text-xs sm:text-sm lg:text-base uppercase text-white truncate group-hover:text-emerald-400 transition-colors">
                                    {timeA?.nome || 'Time A'}
                                  </h4>
                                  <span className="text-[9px] sm:text-[11px] text-zinc-400 truncate block">
                                    {timeA?.cidade || 'São José do Goiabal'}
                                  </span>
                                </div>
                              </div>

                              {/* VS Badge */}
                              <div className="col-span-1 flex items-center justify-center shrink-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 text-black flex items-center justify-center font-black text-[10px] sm:text-xs shadow-md">
                                  VS
                                </div>
                              </div>

                              {/* Time B */}
                              <div className="col-span-5 flex items-center justify-end gap-2.5 sm:gap-3 min-w-0 text-right">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-black text-xs sm:text-sm lg:text-base uppercase text-white truncate group-hover:text-amber-400 transition-colors">
                                    {timeB?.nome || 'Time B'}
                                  </h4>
                                  <span className="text-[9px] sm:text-[11px] text-zinc-400 truncate block">
                                    {timeB?.cidade || 'São José do Goiabal'}
                                  </span>
                                </div>
                                <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl overflow-hidden bg-zinc-800 border-2 border-amber-500/50 shadow-md shrink-0">
                                  {timeB?.foto_url ? (
                                    <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500"><Users size={20} /></div>
                                  )}
                                </div>
                              </div>

                            </div>

                            {/* Rodapé do Card */}
                            <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400 shrink-0">
                              <span className="flex items-center gap-1 font-semibold text-[10px] text-emerald-400">
                                <CheckCircle2 size={12} />
                                <span>1ª Fase Oficial</span>
                              </span>
                              <span className="font-bold text-amber-400/90 text-[10px]">
                                {dataPrimeiroDia.dataFormatada}
                              </span>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* Barra de Controle e Paginação dos Slides TV */}
                    <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 shrink-0 text-xs">
                      
                      {/* Indicador de Página e Progresso */}
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-bold text-[11px]">
                          Página {currentSlidePage + 1} de {totalPaginasSlides}
                        </span>
                        
                        {/* Dots de Navegação */}
                        <div className="flex items-center gap-1.5 ml-2">
                          {Array.from({ length: totalPaginasSlides }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setCurrentSlidePage(idx);
                                setSlideTimerProgress(0);
                              }}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                idx === currentSlidePage 
                                  ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                                  : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Barra de Timer do Slide Automático */}
                      {totalPaginasSlides > 1 && (
                        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xs mx-4">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Rotação</span>
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-100"
                              style={{ width: `${slideTimerProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Botões de Navegação dos Slides */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setIsSlidePaused(p => !p)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title={isSlidePaused ? 'Continuar Rotação' : 'Pausar Rotação'}
                        >
                          {isSlidePaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} className="text-amber-400" />}
                        </button>

                        <button
                          onClick={() => {
                            setCurrentSlidePage(p => (p - 1 + totalPaginasSlides) % totalPaginasSlides);
                            setSlideTimerProgress(0);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title="Slide Anterior"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setCurrentSlidePage(p => (p + 1) % totalPaginasSlides);
                            setSlideTimerProgress(0);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title="Próximo Slide"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                    </div>

                  </div>
                )}

                {/* ========================================================================= */}
                {/* MODO B: GRADE COMPLETA (FIT TO SCREEN 100% VIEWPORT) */}
                {/* ========================================================================= */}
                {exibicaoResumo === 'grade_compacta' && (
                  <div className="w-full flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5 overflow-hidden">
                    {confrontosPrimeiroDia.map((jogo, idx) => {
                      const timeA = getEquipeById(jogo.time_a_id);
                      const timeB = getEquipeById(jogo.time_b_id);

                      return (
                        <div 
                          key={jogo.id}
                          className="bg-zinc-900/90 border border-white/10 hover:border-amber-500/40 rounded-xl p-2 sm:p-2.5 shadow-lg flex flex-col justify-between gap-1.5 backdrop-blur-md min-h-0"
                        >
                          <div className="flex items-center justify-between text-[10px] pb-1 border-b border-white/5">
                            <span className="font-black text-amber-400 uppercase">JOGO #{String(idx + 1).padStart(2, '0')}</span>
                            <span className="text-zinc-500">{dataPrimeiroDia.diaSemana}</span>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 py-0.5">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 border border-emerald-500/40 shrink-0">
                                {timeA?.foto_url ? (
                                  <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600"><Users size={12} /></div>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-white truncate">{timeA?.nome || 'Time A'}</span>
                            </div>

                            <span className="text-[10px] font-black text-amber-400 px-1 shrink-0">VS</span>

                            <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 text-right">
                              <span className="text-[11px] font-bold text-white truncate">{timeB?.nome || 'Time B'}</span>
                              <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 border border-amber-500/40 shrink-0">
                                {timeB?.foto_url ? (
                                  <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600"><Users size={12} /></div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1 border-t border-white/5">
                            <span className="text-emerald-400 font-semibold">1ª Fase Oficial</span>
                            <span className="text-amber-400 font-bold">{dataPrimeiroDia.dataFormatada}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};

