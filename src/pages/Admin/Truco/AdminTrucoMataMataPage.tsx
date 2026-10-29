import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Crown, 
  Swords, 
  Save, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Users, 
  Sparkles,
  ExternalLink,
  Flame
} from 'lucide-react';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  type TrucoTipoFase,
  type TrucoMataMataMD3State,
  buscarEquipes, 
  buscarPartidas, 
  buscarMataMataMD3,
  salvarMataMataMD3,
  criarConfrontoMD3Vazio,
  calcularResultadoMD3,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';

type TabFase = 'todas' | 'quartas' | 'semifinais' | 'final';

export const AdminTrucoMataMataPage: React.FC = () => {
  const navigate = useNavigate();
  const { fase } = useParams<{ fase?: string }>();

  // Aba ativa baseada na rota URL
  const activeTab: TabFase = useMemo(() => {
    const f = (fase || '').toLowerCase();
    if (f === 'quartas') return 'quartas';
    if (f === 'semifinais' || f === 'semifinal' || f === 'semis') return 'semifinais';
    if (f === 'final' || f === 'grandefinal') return 'final';
    return 'todas';
  }, [fase]);

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [md3State, setMd3State] = useState<TrucoMataMataMD3State>({});
  const [loading, setLoading] = useState(true);
  const [savingTipo, setSavingTipo] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const carregarDados = async () => {
    try {
      const [eqs, parts, md3] = await Promise.all([
        buscarEquipes(),
        buscarPartidas(),
        buscarMataMataMD3()
      ]);
      setEquipes(eqs);
      setPartidas(parts);
      setMd3State(md3);
    } catch (err) {
      console.error('Erro ao carregar dados do Mata-Mata no Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  const getEquipeById = (id: string | null): TrucoEquipe | undefined => {
    if (!id) return undefined;
    return equipes.find(e => e.id === id);
  };

  const getPartidaByTipo = (tipo: TrucoTipoFase): TrucoPartida | undefined => {
    return partidas.find(p => p.tipo_fase === tipo);
  };

  // Atualiza um jogo específico de um confronto no estado local
  const handleUpdateJogo = (
    tipo: TrucoTipoFase,
    numeroJogo: 'jogo1' | 'jogo2' | 'jogo3',
    campo: 'pontosA' | 'pontosB' | 'status',
    valor: any
  ) => {
    setMd3State(prev => {
      const partida = getPartidaByTipo(tipo);
      const confAtual = prev[tipo] || criarConfrontoMD3Vazio(tipo);
      const jogoAtual = confAtual[numeroJogo];

      const novoJogo = {
        ...jogoAtual,
        [campo]: valor
      };

      // Se alterou pontos, ajusta automaticamente status para finalizada se houver pontuação
      if (campo === 'pontosA' || campo === 'pontosB') {
        const pA = campo === 'pontosA' ? Number(valor) || 0 : Number(novoJogo.pontosA) || 0;
        const pB = campo === 'pontosB' ? Number(valor) || 0 : Number(novoJogo.pontosB) || 0;
        if (pA > 0 || pB > 0) {
          novoJogo.status = 'finalizada';
        }
      }

      const confAtualizado = {
        ...confAtual,
        [numeroJogo]: novoJogo
      };

      // Recalcula imediatamente maiorias de 3
      const confRecalculado = calcularResultadoMD3(
        confAtualizado,
        partida?.time_a_id || null,
        partida?.time_b_id || null
      );

      return {
        ...prev,
        [tipo]: confRecalculado
      };
    });
  };

  // Salva o confronto individual no banco
  const handleSalvarConfronto = async (tipo: TrucoTipoFase) => {
    setSavingTipo(tipo);
    try {
      const stateSalvo = await salvarMataMataMD3(md3State, partidas);
      setMd3State(stateSalvo);
      setFeedbackSuccess(tipo);
      setTimeout(() => setFeedbackSuccess(null), 3000);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao salvar confronto MD3:', err);
      alert('Houve um erro ao salvar o confronto. Verifique sua conexão.');
    } finally {
      setSavingTipo(null);
    }
  };

  // Reseta um confronto se o admin desejar
  const handleResetarConfronto = async (tipo: TrucoTipoFase) => {
    if (!window.confirm('Deseja realmente limpar todos os 3 jogos deste confronto?')) return;
    setSavingTipo(tipo);
    try {
      const novoEstado = {
        ...md3State,
        [tipo]: criarConfrontoMD3Vazio(tipo)
      };
      setMd3State(novoEstado);
      const stateSalvo = await salvarMataMataMD3(novoEstado, partidas);
      setMd3State(stateSalvo);
      await carregarDados();
    } catch (err) {
      console.error('Erro ao resetar confronto:', err);
    } finally {
      setSavingTipo(null);
    }
  };

  // Definição dos Confrontos
  const listaConfrontos: {
    tipo: TrucoTipoFase;
    titulo: string;
    subtitulo: string;
    faseGrupo: 'quartas' | 'semifinais' | 'final';
    placeholderA: string;
    placeholderB: string;
    isFinal?: boolean;
  }[] = [
    // QUARTAS DE FINAL
    {
      tipo: 'semi_a1',
      titulo: 'Quartas 1: 1º × 8º',
      subtitulo: 'Chave A — Melhor de 3',
      faseGrupo: 'quartas',
      placeholderA: '1º Colocado da Tabela',
      placeholderB: '8º Colocado da Tabela'
    },
    {
      tipo: 'semi_a2',
      titulo: 'Quartas 2: 4º × 5º',
      subtitulo: 'Chave A — Melhor de 3',
      faseGrupo: 'quartas',
      placeholderA: '4º Colocado da Tabela',
      placeholderB: '5º Colocado da Tabela'
    },
    {
      tipo: 'semi_b1',
      titulo: 'Quartas 3: 2º × 7º',
      subtitulo: 'Chave B — Melhor de 3',
      faseGrupo: 'quartas',
      placeholderA: '2º Colocado da Tabela',
      placeholderB: '7º Colocado da Tabela'
    },
    {
      tipo: 'semi_b2',
      titulo: 'Quartas 4: 3º × 6º',
      subtitulo: 'Chave B — Melhor de 3',
      faseGrupo: 'quartas',
      placeholderA: '3º Colocado da Tabela',
      placeholderB: '6º Colocado da Tabela'
    },
    // SEMIFINAIS
    {
      tipo: 'final_a',
      titulo: 'Semifinal 1: Decisão Chave A',
      subtitulo: 'Venc. Quartas 1 × Venc. Quartas 2 — Melhor de 3',
      faseGrupo: 'semifinais',
      placeholderA: 'Vencedor Quartas 1 (1º×8º)',
      placeholderB: 'Vencedor Quartas 2 (4º×5º)'
    },
    {
      tipo: 'final_b',
      titulo: 'Semifinal 2: Decisão Chave B',
      subtitulo: 'Venc. Quartas 3 × Venc. Quartas 4 — Melhor de 3',
      faseGrupo: 'semifinais',
      placeholderA: 'Vencedor Quartas 3 (2º×7º)',
      placeholderB: 'Vencedor Quartas 4 (3º×6º)'
    },
    // GRANDE FINAL
    {
      tipo: 'grande_final',
      titulo: 'Grande Finalíssima',
      subtitulo: 'Finalista Chave A × Finalista Chave B — Decisão do Título',
      faseGrupo: 'final',
      placeholderA: 'Campeão da Chave A',
      placeholderB: 'Campeão da Chave B',
      isFinal: true
    }
  ];

  // Filtra de acordo com a aba selecionada na rota URL
  const confrontosFiltrados = useMemo(() => {
    if (activeTab === 'quartas') return listaConfrontos.filter(c => c.faseGrupo === 'quartas');
    if (activeTab === 'semifinais') return listaConfrontos.filter(c => c.faseGrupo === 'semifinais');
    if (activeTab === 'final') return listaConfrontos.filter(c => c.faseGrupo === 'final');
    return listaConfrontos;
  }, [activeTab, listaConfrontos]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Admin Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco'); }} 
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Voltar ao Painel Admin do Truco"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-400">
              <Trophy size={22} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold uppercase tracking-widest text-white leading-tight">
                Painel Admin • Mata-Mata
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-400 uppercase tracking-widest font-semibold">
                Quartas, Semifinal e Final • Melhor de 03
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open('/ExpoGoiabal/Truco/MataMata', '_blank')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            <ExternalLink size={14} className="text-amber-400" />
            <span>Ver Telão Público</span>
          </button>

          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Partidas'); }}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider text-teal-400 hover:text-teal-300 transition-colors"
          >
            1ª Fase
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in slide-in-from-bottom-6 fade-in duration-500">
        
        {/* Banner Informativo sobre a Regra de Melhor de 3 */}
        <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-widest self-start">
              <Sparkles size={13} />
              <span>Regra Oficial: Melhor de 03 Jogos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
              ⚔️ Lançamento de Pontos do Mata-Mata
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
              Os confrontos de <strong>Quartas de Final</strong>, <strong>Semifinais</strong> e <strong>Grande Final</strong> são disputados em <strong>Melhor de 03</strong>.
              O time que conquistar a <strong>maioria dos 3 jogos (2 vitórias)</strong> é classificado <strong>automaticamente pelo sistema</strong> e avança no chaveamento. Se um time vencer os jogos 1 e 2 (2×0), a classificação é imediata e o 3º jogo é dispensado.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 text-right">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Regra de Maioria</span>
              <span className="text-lg font-black text-amber-400">2 Vitórias = Classificado</span>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS COM ROTAS URL DEDICADAS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
          <Link
            to="/Admin/Truco/MataMata"
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'todas'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
            }`}
          >
            <Trophy size={14} />
            <span>Todos os Confrontos ({listaConfrontos.length})</span>
          </Link>

          <Link
            to="/Admin/Truco/MataMata/Quartas"
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'quartas'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
            }`}
          >
            <Swords size={14} />
            <span>Quartas de Final (4)</span>
          </Link>

          <Link
            to="/Admin/Truco/MataMata/Semifinais"
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'semifinais'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
            }`}
          >
            <Trophy size={14} />
            <span>Semifinais (2)</span>
          </Link>

          <Link
            to="/Admin/Truco/MataMata/Final"
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'final'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'
            }`}
          >
            <Crown size={14} />
            <span>Grande Final (1)</span>
          </Link>
        </div>

        {/* LISTAGEM DOS CONFRONTOS */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Carregando confrontos do Mata-Mata...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {confrontosFiltrados.map((item) => {
            const partida = getPartidaByTipo(item.tipo);
            const conf = md3State[item.tipo] || criarConfrontoMD3Vazio(item.tipo);

            const timeA = getEquipeById(partida?.time_a_id || null);
            const timeB = getEquipeById(partida?.time_b_id || null);

            const isClassificadoA = conf.classificadoId && conf.classificadoId === timeA?.id;
            const isClassificadoB = conf.classificadoId && conf.classificadoId === timeB?.id;
            const isEmpate1x1 = conf.vitoriasA === 1 && conf.vitoriasB === 1;
            const isConcluido2x0 = (conf.vitoriasA === 2 && conf.vitoriasB === 0) || (conf.vitoriasB === 2 && conf.vitoriasA === 0);

            const isSavingThis = savingTipo === item.tipo;
            const isSuccess = feedbackSuccess === item.tipo;

            return (
              <div 
                key={item.tipo}
                className={`rounded-3xl border p-5 sm:p-7 shadow-2xl transition-all ${
                  item.isFinal
                    ? 'bg-gradient-to-b from-amber-500/10 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-amber-500/10'
                    : conf.status === 'finalizada'
                    ? 'bg-zinc-900/90 border-emerald-500/40 shadow-emerald-500/5'
                    : conf.status === 'em_andamento'
                    ? 'bg-zinc-900/95 border-amber-500/40'
                    : 'bg-zinc-900/80 border-white/10'
                }`}
              >
                {/* Cabeçalho do Confronto */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                      <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                        {item.titulo}
                      </h3>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium block mt-0.5">
                      {item.subtitulo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {conf.status === 'finalizada' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        Série Concluída ({conf.vitoriasA} × {conf.vitoriasB})
                      </span>
                    ) : conf.status === 'em_andamento' ? (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <Play size={12} />
                        Série em Andamento ({conf.vitoriasA} × {conf.vitoriasB})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        Aguardando Jogos
                      </span>
                    )}

                    <button
                      onClick={() => handleResetarConfronto(item.tipo)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Limpar todos os pontos deste confronto"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

                {/* PLACAR GERAL DA SÉRIE (TIMES & VITÓRIAS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Time A */}
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isClassificadoA 
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white' 
                      : 'bg-black/40 border-white/5'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 flex items-center justify-center">
                        {timeA?.foto_url ? (
                          <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={20} className="text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm sm:text-base font-black uppercase truncate ${timeA ? 'text-white' : 'text-zinc-500 italic'}`}>
                            {timeA ? timeA.nome : item.placeholderA}
                          </span>
                          {isClassificadoA && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                              Classificado 🏆
                            </span>
                          )}
                        </div>
                        {timeA && <span className="text-xs text-zinc-400 truncate block">{timeA.cidade}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Vitórias</span>
                      <span className={`text-2xl font-black ${isClassificadoA ? 'text-emerald-400' : 'text-white'}`}>
                        {conf.vitoriasA}
                      </span>
                    </div>
                  </div>

                  {/* Time B */}
                  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isClassificadoB 
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white' 
                      : 'bg-black/40 border-white/5'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 flex items-center justify-center">
                        {timeB?.foto_url ? (
                          <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={20} className="text-zinc-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm sm:text-base font-black uppercase truncate ${timeB ? 'text-white' : 'text-zinc-500 italic'}`}>
                            {timeB ? timeB.nome : item.placeholderB}
                          </span>
                          {isClassificadoB && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                              Classificado 🏆
                            </span>
                          )}
                        </div>
                        {timeB && <span className="text-xs text-zinc-400 truncate block">{timeB.cidade}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Vitórias</span>
                      <span className={`text-2xl font-black ${isClassificadoB ? 'text-emerald-400' : 'text-white'}`}>
                        {conf.vitoriasB}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ALERTA DE MAIORIA AUTOMÁTICA OU EMPATE */}
                {conf.classificadoId && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3 text-emerald-300">
                    <div className="flex items-center gap-2 text-xs font-black uppercase">
                      <Trophy size={16} className="text-emerald-400 shrink-0" />
                      <span>
                        ✅ Maioria de jogos atingida ({conf.vitoriasA} × {conf.vitoriasB})! {getEquipeById(conf.classificadoId)?.nome} classificado automaticamente!
                      </span>
                    </div>
                  </div>
                )}

                {isEmpate1x1 && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3 text-amber-300">
                    <div className="flex items-center gap-2 text-xs font-black uppercase">
                      <Flame size={16} className="text-amber-400 shrink-0" />
                      <span>🔥 Série empatada em 1 × 1! O Jogo 3 é decisivo (Nega)!</span>
                    </div>
                  </div>
                )}

                {/* LANÇAMENTO DOS 3 JOGOS INDIVIDUAIS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* JOGO 1 */}
                  <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-black uppercase text-amber-400">1º Jogo</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        conf.jogo1.status === 'finalizada' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {conf.jogo1.status === 'finalizada' ? 'Concluído' : 'Aberto'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[90px] mb-1">
                          {timeA?.nome || 'Time A'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={conf.jogo1.pontosA}
                          onChange={e => handleUpdateJogo(item.tipo, 'jogo1', 'pontosA', e.target.value)}
                          className="w-16 h-12 text-center text-xl font-black bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none"
                        />
                      </div>

                      <span className="text-xs font-bold text-zinc-600 mt-4">×</span>

                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[90px] mb-1">
                          {timeB?.nome || 'Time B'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={conf.jogo1.pontosB}
                          onChange={e => handleUpdateJogo(item.tipo, 'jogo1', 'pontosB', e.target.value)}
                          className="w-16 h-12 text-center text-xl font-black bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-center text-[10px] font-bold text-zinc-400 pt-1">
                      {conf.jogo1.vencedorId ? (
                        <span className="text-emerald-400">Venc: {getEquipeById(conf.jogo1.vencedorId)?.nome}</span>
                      ) : (
                        <span>Aguardando pontos</span>
                      )}
                    </div>
                  </div>

                  {/* JOGO 2 */}
                  <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-black uppercase text-amber-400">2º Jogo</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        conf.jogo2.status === 'finalizada' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {conf.jogo2.status === 'finalizada' ? 'Concluído' : 'Aberto'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[90px] mb-1">
                          {timeA?.nome || 'Time A'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={conf.jogo2.pontosA}
                          onChange={e => handleUpdateJogo(item.tipo, 'jogo2', 'pontosA', e.target.value)}
                          className="w-16 h-12 text-center text-xl font-black bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none"
                        />
                      </div>

                      <span className="text-xs font-bold text-zinc-600 mt-4">×</span>

                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[90px] mb-1">
                          {timeB?.nome || 'Time B'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={conf.jogo2.pontosB}
                          onChange={e => handleUpdateJogo(item.tipo, 'jogo2', 'pontosB', e.target.value)}
                          className="w-16 h-12 text-center text-xl font-black bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-center text-[10px] font-bold text-zinc-400 pt-1">
                      {conf.jogo2.vencedorId ? (
                        <span className="text-emerald-400">Venc: {getEquipeById(conf.jogo2.vencedorId)?.nome}</span>
                      ) : (
                        <span>Aguardando pontos</span>
                      )}
                    </div>
                  </div>

                  {/* JOGO 3 (DECISIVO OU DISPENSADO SE 2x0) */}
                  <div className={`rounded-2xl p-4 flex flex-col justify-between gap-3 border transition-all ${
                    isConcluido2x0 
                      ? 'bg-zinc-900/40 border-white/5 opacity-60' 
                      : isEmpate1x1 
                      ? 'bg-amber-500/10 border-amber-500/40' 
                      : 'bg-zinc-950/80 border-white/10'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase text-amber-400">3º Jogo</span>
                        {isEmpate1x1 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">Nega</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isConcluido2x0 
                          ? 'bg-zinc-800 text-zinc-500'
                          : conf.jogo3.status === 'finalizada' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {isConcluido2x0 ? 'Dispensado (2x0)' : conf.jogo3.status === 'finalizada' ? 'Concluído' : 'Aberto'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[90px] mb-1">
                          {timeA?.nome || 'Time A'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={conf.jogo3.pontosA}
                          onChange={e => handleUpdateJogo(item.tipo, 'jogo3', 'pontosA', e.target.value)}
                          className="w-16 h-12 text-center text-xl font-black bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none"
                        />
                      </div>

                      <span className="text-xs font-bold text-zinc-600 mt-4">×</span>

                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[90px] mb-1">
                          {timeB?.nome || 'Time B'}
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={conf.jogo3.pontosB}
                          onChange={e => handleUpdateJogo(item.tipo, 'jogo3', 'pontosB', e.target.value)}
                          className="w-16 h-12 text-center text-xl font-black bg-zinc-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-center text-[10px] font-bold text-zinc-400 pt-1">
                      {isConcluido2x0 ? (
                        <span className="text-zinc-500 italic">Dispensado: maioria já atingida</span>
                      ) : conf.jogo3.vencedorId ? (
                        <span className="text-emerald-400">Venc: {getEquipeById(conf.jogo3.vencedorId)?.nome}</span>
                      ) : (
                        <span>Aguardando pontos</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTÃO DE SALVAR CONFRONTO */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
                  <div className="text-xs text-zinc-400">
                    {conf.classificadoId ? (
                      <span className="text-emerald-400 font-bold">
                        🏆 Classificado: {getEquipeById(conf.classificadoId)?.nome} (Avanço automático)
                      </span>
                    ) : (
                      <span>Preencha os pontos dos jogos para apuração automática.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {isSuccess && (
                      <span className="text-xs text-emerald-400 font-black uppercase flex items-center gap-1 animate-in fade-in">
                        <CheckCircle2 size={14} /> Salvo com sucesso!
                      </span>
                    )}

                    <button
                      onClick={() => handleSalvarConfronto(item.tipo)}
                      disabled={isSavingThis}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={15} />
                      <span>{isSavingThis ? 'Salvando...' : 'Salvar Confronto'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      </main>
    </div>
  );
};
