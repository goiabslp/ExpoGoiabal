import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  type TrucoTorneioStatus,
  type TrucoTipoFase,
  type TrucoMataMataMD3State,
  type TrucoConfrontoMD3,
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  buscarMataMataMD3,
  calcularClassificacao,
  sincronizarMataMataAutomatico,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  Trophy, 
  Crown, 
  CheckCircle2, 
  Users, 
  Play, 
  ShieldAlert,
  Swords,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const TrucoMataMataPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);
  const [md3State, setMd3State] = useState<TrucoMataMataMD3State>({});
  const [expandedConfrontos, setExpandedConfrontos] = useState<Record<string, boolean>>({});

  const carregarDados = async () => {
    try {
      const [eqs, parts, st, md3] = await Promise.all([
        buscarEquipes(),
        buscarPartidas(),
        buscarStatusTorneio(),
        buscarMataMataMD3()
      ]);
      setEquipes(eqs);
      setPartidas(parts);
      setStatusTorneio(st);
      setMd3State(md3);

      // Sincroniza e monta automaticamente o mata-mata se a 1ª fase estiver toda preenchida
      await sincronizarMataMataAutomatico(eqs, parts);
    } catch (err) {
      console.error('Erro ao carregar mata-mata:', err);
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

  const findPartidaByTipo = (tipo: TrucoTipoFase): TrucoPartida | undefined => {
    return partidas.find(p => p.tipo_fase === tipo);
  };

  // Ranking ordenado da 1ª Fase para apuração automática do Top 8
  const ranking1aFase = useMemo(() => {
    return calcularClassificacao(equipes, partidas);
  }, [equipes, partidas]);

  const top8Equipes = useMemo(() => {
    if (ranking1aFase.length >= 8) {
      return ranking1aFase.slice(0, 8).map(r => r.equipe);
    }
    const top8Ids = statusTorneio?.top8_equipes_ids || [];
    return top8Ids.map(id => getEquipeById(id)).filter(Boolean) as TrucoEquipe[];
  }, [ranking1aFase, statusTorneio, equipes]);

  const toggleExpand = (tipo: string) => {
    setExpandedConfrontos(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  // Partidas do Mata-Mata
  const semiA1 = findPartidaByTipo('semi_a1');
  const semiA2 = findPartidaByTipo('semi_a2');
  const finalA = findPartidaByTipo('final_a');

  const semiB1 = findPartidaByTipo('semi_b1');
  const semiB2 = findPartidaByTipo('semi_b2');
  const finalB = findPartidaByTipo('final_b');

  const grandeFinal = findPartidaByTipo('grande_final');

  const campeaoEquipe = statusTorneio?.campeao_equipe_id 
    ? getEquipeById(statusTorneio.campeao_equipe_id)
    : md3State['grande_final']?.classificadoId
    ? getEquipeById(md3State['grande_final'].classificadoId)
    : grandeFinal?.status === 'finalizada' && grandeFinal.vencedor_id
    ? getEquipeById(grandeFinal.vencedor_id)
    : null;

  // Componente de Card de Duelo do Bracket (Série Melhor de 03)
  const MatchCard = ({
    tipo,
    titulo,
    subtitulo,
    partida,
    timeAFallback,
    timeBFallback,
    placeholderA = 'Aguardando Time',
    placeholderB = 'Aguardando Time',
    isFinal = false
  }: {
    tipo: TrucoTipoFase;
    titulo: string;
    subtitulo?: string;
    partida?: TrucoPartida;
    timeAFallback?: TrucoEquipe;
    timeBFallback?: TrucoEquipe;
    placeholderA?: string;
    placeholderB?: string;
    isFinal?: boolean;
  }) => {
    const timeA = getEquipeById(partida?.time_a_id || null) || timeAFallback;
    const timeB = getEquipeById(partida?.time_b_id || null) || timeBFallback;

    const conf: TrucoConfrontoMD3 = md3State[tipo] || {
      tipo_fase: tipo,
      jogo1: { pontosA: 0, pontosB: 0, status: 'agendada', vencedorId: null },
      jogo2: { pontosA: 0, pontosB: 0, status: 'agendada', vencedorId: null },
      jogo3: { pontosA: 0, pontosB: 0, status: 'agendada', vencedorId: null },
      vitoriasA: partida?.pontos_time_a || 0,
      vitoriasB: partida?.pontos_time_b || 0,
      classificadoId: partida?.vencedor_id || null,
      status: partida?.status || 'agendada'
    };

    const isProntaParaJogar = !!timeA && !!timeB;
    const isFinalizada = conf.status === 'finalizada' || (conf.classificadoId !== null);
    const isEmAndamento = conf.status === 'em_andamento';

    const isClassificadoA = conf.classificadoId && conf.classificadoId === timeA?.id;
    const isClassificadoB = conf.classificadoId && conf.classificadoId === timeB?.id;
    const isEmpate1x1 = conf.vitoriasA === 1 && conf.vitoriasB === 1;
    const isExpanded = expandedConfrontos[tipo] ?? true;

    // Helper para exibir bolinhas indicativas das vitórias na série de 3
    const renderBolinhasVitoria = (vitorias: number) => {
      return (
        <div className="flex items-center gap-1">
          <span className={`w-2.5 h-2.5 rounded-full ${vitorias >= 1 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-zinc-800 border border-white/10'}`} />
          <span className={`w-2.5 h-2.5 rounded-full ${vitorias >= 2 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-zinc-800 border border-white/10'}`} />
        </div>
      );
    };

    return (
      <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-xl transition-all duration-300 border ${
        isFinal 
          ? 'bg-gradient-to-b from-amber-500/15 via-zinc-900/90 to-zinc-950 border-amber-500/50 shadow-amber-500/10'
          : isFinalizada 
          ? 'bg-zinc-900/90 border-emerald-500/30' 
          : isEmAndamento 
          ? 'bg-zinc-900/95 border-amber-500/40 ring-1 ring-amber-500/20' 
          : 'bg-zinc-900/80 border-white/10'
      }`}>
        {/* Header do Card */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/5 text-[11px]">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black uppercase tracking-wider text-amber-400 block">{titulo}</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                Melhor de 03
              </span>
            </div>
            {subtitulo && <span className="text-[10px] text-zinc-500 block mt-0.5">{subtitulo}</span>}
          </div>

          <div className="flex items-center gap-1.5">
            {isFinalizada ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={11} />
                Concluída ({conf.vitoriasA} × {conf.vitoriasB})
              </span>
            ) : isEmAndamento ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <Play size={10} />
                Em Andamento ({conf.vitoriasA} × {conf.vitoriasB})
              </span>
            ) : isProntaParaJogar ? (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                Pronta
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                Aguardando
              </span>
            )}

            <button
              onClick={() => toggleExpand(tipo)}
              className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Expandir detalhes dos jogos"
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Time A Row */}
        <div className={`p-2.5 rounded-2xl flex items-center justify-between gap-2 mb-2 transition-all ${
          isClassificadoA 
            ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-300' 
            : 'bg-black/30 border border-white/5'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 flex items-center justify-center">
              {timeA?.foto_url ? (
                <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
              ) : (
                <Users size={14} className="text-zinc-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black uppercase truncate block ${timeA ? 'text-white' : 'text-zinc-500 italic'}`}>
                  {timeA ? timeA.nome : placeholderA}
                </span>
                {isClassificadoA && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-black text-[8px] font-black uppercase">
                    Classificado
                  </span>
                )}
              </div>
              {timeA && <span className="text-[9px] text-zinc-400 truncate block">{timeA.cidade}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {renderBolinhasVitoria(conf.vitoriasA)}
            {isClassificadoA && <Trophy size={14} className="text-emerald-400" />}
            <span className={`text-sm font-black px-2 py-0.5 rounded-lg bg-black/60 min-w-[28px] text-center ${
              isClassificadoA ? 'text-emerald-400 font-black ring-1 ring-emerald-500/30' : 'text-zinc-300'
            }`}>
              {conf.vitoriasA}
            </span>
          </div>
        </div>

        {/* Time B Row */}
        <div className={`p-2.5 rounded-2xl flex items-center justify-between gap-2 transition-all ${
          isClassificadoB 
            ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-300' 
            : 'bg-black/30 border border-white/5'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 flex items-center justify-center">
              {timeB?.foto_url ? (
                <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
              ) : (
                <Users size={14} className="text-zinc-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black uppercase truncate block ${timeB ? 'text-white' : 'text-zinc-500 italic'}`}>
                  {timeB ? timeB.nome : placeholderB}
                </span>
                {isClassificadoB && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-black text-[8px] font-black uppercase">
                    Classificado
                  </span>
                )}
              </div>
              {timeB && <span className="text-[9px] text-zinc-400 truncate block">{timeB.cidade}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {renderBolinhasVitoria(conf.vitoriasB)}
            {isClassificadoB && <Trophy size={14} className="text-emerald-400" />}
            <span className={`text-sm font-black px-2 py-0.5 rounded-lg bg-black/60 min-w-[28px] text-center ${
              isClassificadoB ? 'text-emerald-400 font-black ring-1 ring-emerald-500/30' : 'text-zinc-300'
            }`}>
              {conf.vitoriasB}
            </span>
          </div>
        </div>

        {/* ALERTA DE EMPATE 1x1 */}
        {isEmpate1x1 && (
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-amber-300 text-[10px] font-black uppercase">
            <span className="flex items-center gap-1">
              <Flame size={12} className="text-amber-400" /> Empate 1 × 1: Decisão no 3º Jogo (Nega)!
            </span>
          </div>
        )}

        {/* DETALHAMENTO DOS 3 JOGOS DA SÉRIE MELHOR DE 3 */}
        {isExpanded && isProntaParaJogar && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block">
              Jogos da Série (Maioria de 3 Classifica)
            </span>

            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              {/* Jogo 1 */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[8px] font-bold text-zinc-400 uppercase">1º Jogo</span>
                <span className="font-black text-white text-xs mt-0.5">
                  {conf.jogo1.pontosA} × {conf.jogo1.pontosB}
                </span>
                <span className="text-[8px] font-bold mt-0.5 text-zinc-400 truncate max-w-full">
                  {conf.jogo1.vencedorId ? `Venc: ${getEquipeById(conf.jogo1.vencedorId)?.nome}` : 'Aberto'}
                </span>
              </div>

              {/* Jogo 2 */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[8px] font-bold text-zinc-400 uppercase">2º Jogo</span>
                <span className="font-black text-white text-xs mt-0.5">
                  {conf.jogo2.pontosA} × {conf.jogo2.pontosB}
                </span>
                <span className="text-[8px] font-bold mt-0.5 text-zinc-400 truncate max-w-full">
                  {conf.jogo2.vencedorId ? `Venc: ${getEquipeById(conf.jogo2.vencedorId)?.nome}` : 'Aberto'}
                </span>
              </div>

              {/* Jogo 3 */}
              <div className={`border rounded-xl p-2 flex flex-col items-center text-center ${
                (conf.vitoriasA === 2 || conf.vitoriasB === 2) && conf.jogo3.pontosA === 0 && conf.jogo3.pontosB === 0
                  ? 'bg-zinc-900/30 border-white/5 text-zinc-500'
                  : isEmpate1x1
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-black/40 border-white/5'
              }`}>
                <span className="text-[8px] font-bold uppercase">3º Jogo</span>
                <span className="font-black text-xs mt-0.5">
                  {(conf.vitoriasA === 2 || conf.vitoriasB === 2) && conf.jogo3.pontosA === 0 && conf.jogo3.pontosB === 0
                    ? 'Dispensado'
                    : `${conf.jogo3.pontosA} × ${conf.jogo3.pontosB}`}
                </span>
                <span className="text-[8px] font-bold mt-0.5 truncate max-w-full">
                  {(conf.vitoriasA === 2 || conf.vitoriasB === 2) && conf.jogo3.pontosA === 0 && conf.jogo3.pontosB === 0
                    ? 'Maioria 2x0'
                    : conf.jogo3.vencedorId
                    ? `Venc: ${getEquipeById(conf.jogo3.vencedorId)?.nome}`
                    : 'Aberto'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-emerald-500 selection:text-black">
      <Header />

      {/* Decorative Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80 pointer-events-none"
        style={{ backgroundImage: 'url(/truco.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/55 via-black/40 to-zinc-950/90 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),transparent)] pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col items-center pt-28 pb-20 px-3 sm:px-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

          <TrucoBackButton to="/ExpoGoiabal/Truco" label="Voltar para o Torneio" />

          {/* Header Section */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-widest mb-2">
                <Trophy size={13} />
                <span>Fase Final • Cruzamento Olímpico • Séries Melhor de 03</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                🏆 Mata-Mata
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                Confrontos em <strong>Melhor de 03</strong> definidos pela classificação geral: <strong>1º × 8º</strong>, <strong>2º × 7º</strong>, <strong>3º × 6º</strong> e <strong>4º × 5º</strong>. A maioria dos 3 jogos classifica automaticamente.
              </p>
            </div>
          </div>

          {/* PAINEL CAMPEÃO SUPREMO (SE HOUVER CAMPEÃO) */}
          {campeaoEquipe && (
            <div className="w-full mb-12 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border-3 border-amber-400 rounded-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(245,158,11,0.4)] text-center relative overflow-hidden animate-in zoom-in-95 duration-700">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/30 border border-amber-400 text-black font-black text-xs uppercase tracking-widest mb-4 shadow-lg">
                <Crown size={16} />
                <span>GRANDE CAMPEÃO DO 2º TORNEIO DE TRUCO</span>
              </div>

              <div className="w-28 h-28 rounded-3xl overflow-hidden bg-zinc-900 border-4 border-amber-400 mx-auto mb-4 shadow-2xl">
                {campeaoEquipe.foto_url ? (
                  <img src={campeaoEquipe.foto_url} alt={campeaoEquipe.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-400"><Trophy size={48} /></div>
                )}
              </div>

              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-2 drop-shadow-lg">
                👑 {campeaoEquipe.nome}
              </h2>
              <span className="text-amber-300 text-sm sm:text-base font-bold uppercase tracking-wider block mb-6">
                Representando {campeaoEquipe.cidade}
              </span>

              <div className="inline-flex items-center gap-2 text-xs text-zinc-900 bg-amber-400 font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-md">
                <span>🏆 Campeão Oficial ExpoGoiabal 2026</span>
              </div>
            </div>
          )}

          {/* BANNER DE STATUS E AUTOMATIZAÇÃO EM TEMPO REAL */}
          <div className="w-full mb-8">
            {statusTorneio?.sorteio_mata_mata_confirmado ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <h4 className="text-sm font-black uppercase text-emerald-400">Mata-Mata Oficial • Séries Melhor de 03</h4>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium">
                      Confrontos consolidados pela classificação geral. A pontuação é atualizada pelo Painel Administrativo em tempo real.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 shrink-0">
                  ⚡ Tempo Real Ativo
                </span>
              </div>
            ) : top8Equipes.length >= 8 ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Swords size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      <h4 className="text-sm font-black uppercase text-amber-400">Projeção Dinâmica do Mata-Mata em Tempo Real</h4>
                    </div>
                    <p className="text-xs text-zinc-300 font-medium">
                      Os confrontos abaixo refletem a classificação atual da tabela.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors shrink-0 cursor-pointer shadow-md"
                >
                  Ver Tabela Geral
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={22} className="text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black uppercase text-white">Aguardando Equipes da 1ª Fase</h4>
                    <p className="text-xs text-zinc-400 font-medium">
                      O chaveamento do Mata-Mata será montado automaticamente assim que os placares forem lançados.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Partidas'); }}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-black font-black text-xs uppercase tracking-wider hover:bg-teal-400 transition-colors shrink-0 cursor-pointer"
                >
                  Ver Partidas
                </button>
              </div>
            )}
          </div>

          {/* ESQUELETO VISUAL COMPLETO DO MATA-MATA (BRACKET) */}
          <div className="w-full flex flex-col gap-12">
            
            {/* CHAVE A & CHAVE B - LADO A LADO OU EM BLOCOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* BLOCO CHAVE A (1º x 8º e 4º x 5º) */}
              <div className="bg-zinc-900/60 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">🅰️ Chave A — Quartas & Semifinal</h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">1º×8º & 4º×5º</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quartas de Final (Chave A) • Melhor de 03</span>
                  
                  <MatchCard
                    tipo="semi_a1"
                    titulo="Quartas 1: 1º × 8º"
                    subtitulo="Confronto Direto por Classificação"
                    partida={semiA1}
                    timeAFallback={top8Equipes[0]}
                    timeBFallback={top8Equipes[7]}
                    placeholderA="1º Colocado da Tabela"
                    placeholderB="8º Colocado da Tabela"
                  />

                  <MatchCard
                    tipo="semi_a2"
                    titulo="Quartas 2: 4º × 5º"
                    subtitulo="Confronto Direto por Classificação"
                    partida={semiA2}
                    timeAFallback={top8Equipes[3]}
                    timeBFallback={top8Equipes[4]}
                    placeholderA="4º Colocado da Tabela"
                    placeholderB="5º Colocado da Tabela"
                  />
                </div>

                {/* Seta / Conexão Visual */}
                <div className="flex justify-center text-emerald-400">
                  <div className="w-0.5 h-6 bg-emerald-500/40"></div>
                </div>

                {/* Semifinal 1 */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    🏆 Semifinal 1 (Decisão do Finalista Chave A) • Melhor de 03
                  </span>
                  <MatchCard
                    tipo="final_a"
                    titulo="Semifinal 1"
                    subtitulo="Venc. Quartas 1 × Venc. Quartas 2"
                    partida={finalA}
                    placeholderA="Vencedor (1º × 8º)"
                    placeholderB="Vencedor (4º × 5º)"
                  />
                </div>
              </div>

              {/* BLOCO CHAVE B (2º x 7º e 3º x 6º) */}
              <div className="bg-zinc-900/60 border border-teal-500/30 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">🅱️ Chave B — Quartas & Semifinal</h3>
                  </div>
                  <span className="text-xs text-teal-400 font-bold uppercase">2º×7º & 3º×6º</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quartas de Final (Chave B) • Melhor de 03</span>
                  
                  <MatchCard
                    tipo="semi_b1"
                    titulo="Quartas 3: 2º × 7º"
                    subtitulo="Confronto Direto por Classificação"
                    partida={semiB1}
                    timeAFallback={top8Equipes[1]}
                    timeBFallback={top8Equipes[6]}
                    placeholderA="2º Colocado da Tabela"
                    placeholderB="7º Colocado da Tabela"
                  />

                  <MatchCard
                    tipo="semi_b2"
                    titulo="Quartas 4: 3º × 6º"
                    subtitulo="Confronto Direto por Classificação"
                    partida={semiB2}
                    timeAFallback={top8Equipes[2]}
                    timeBFallback={top8Equipes[5]}
                    placeholderA="3º Colocado da Tabela"
                    placeholderB="6º Colocado da Tabela"
                  />
                </div>

                {/* Seta / Conexão Visual */}
                <div className="flex justify-center text-teal-400">
                  <div className="w-0.5 h-6 bg-teal-500/40"></div>
                </div>

                {/* Semifinal 2 */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                    🏆 Semifinal 2 (Decisão do Finalista Chave B) • Melhor de 03
                  </span>
                  <MatchCard
                    tipo="final_b"
                    titulo="Semifinal 2"
                    subtitulo="Venc. Quartas 3 × Venc. Quartas 4"
                    partida={finalB}
                    placeholderA="Vencedor (2º × 7º)"
                    placeholderB="Vencedor (3º × 6º)"
                  />
                </div>
              </div>

            </div>

            {/* SEÇÃO DA GRANDE FINAL */}
            <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-amber-500/20 via-zinc-900/90 to-zinc-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black flex items-center justify-center font-black mb-3 shadow-lg shadow-amber-500/30">
                <Crown size={28} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-1">
                Decisão do Título
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white mb-6">
                🏆 GRANDE FINAL DO 2º TORNEIO DE TRUCO
              </h3>

              <div className="w-full">
                <MatchCard
                  tipo="grande_final"
                  titulo="Grande Finalíssima"
                  subtitulo="Finalista Chave A × Finalista Chave B"
                  partida={grandeFinal}
                  placeholderA="👑 Campeão Chave A"
                  placeholderB="👑 Campeão Chave B"
                  isFinal={true}
                />
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
