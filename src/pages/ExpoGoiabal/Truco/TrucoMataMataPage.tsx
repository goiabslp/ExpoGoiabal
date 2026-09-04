import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  type TrucoTorneioStatus,
  type TrucoTipoFase,
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  realizarSorteioMataMata,
  confirmarSorteioMataMata,
  registrarResultadoPartida,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  Trophy, 
  Crown, 
  Dices, 
  CheckCircle2, 
  Edit3, 
  Users, 
  Play, 
  RotateCcw, 
  Save, 
  X,
  ShieldAlert
} from 'lucide-react';

export const TrucoMataMataPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);

  // Modal de Sorteio do Mata-Mata
  const [isSorteioModalOpen, setIsSorteioModalOpen] = useState(false);
  const [sorteioPreview, setSorteioPreview] = useState<{
    grupoA: TrucoEquipe[];
    grupoB: TrucoEquipe[];
    partidasMataMata: TrucoPartida[];
  } | null>(null);
  const [confirmingSorteio, setConfirmingSorteio] = useState(false);

  // Modal de Edição de Placar do Mata-Mata
  const [editingPartida, setEditingPartida] = useState<TrucoPartida | null>(null);
  const [editPontosA, setEditPontosA] = useState(0);
  const [editPontosB, setEditPontosB] = useState(0);
  const [editStatus, setEditStatus] = useState<'agendada' | 'em_andamento' | 'finalizada'>('agendada');
  const [savingMatch, setSavingMatch] = useState(false);

  const carregarDados = async () => {
    try {
      const [eqs, parts, st] = await Promise.all([
        buscarEquipes(),
        buscarPartidas(),
        buscarStatusTorneio()
      ]);
      setEquipes(eqs);
      setPartidas(parts);
      setStatusTorneio(st);
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

  const top8Ids = statusTorneio?.top8_equipes_ids || [];
  const top8Equipes = top8Ids.map(id => getEquipeById(id)).filter(Boolean) as TrucoEquipe[];
  const podeSortearMataMata = top8Equipes.length >= 8 && !statusTorneio?.sorteio_mata_mata_confirmado;

  // Realizar Sorteio do Mata-Mata
  const handleAbrirSorteioMataMata = async () => {
    if (top8Equipes.length < 8) return;
    const res = await realizarSorteioMataMata(top8Equipes);
    setSorteioPreview(res);
    setIsSorteioModalOpen(true);
  };

  const handleRefazerSorteioMataMata = async () => {
    if (top8Equipes.length < 8) return;
    const res = await realizarSorteioMataMata(top8Equipes);
    setSorteioPreview(res);
  };

  const handleConfirmarSorteioMataMata = async () => {
    if (!sorteioPreview) return;
    setConfirmingSorteio(true);
    try {
      await confirmarSorteioMataMata(
        sorteioPreview.grupoA,
        sorteioPreview.grupoB,
        sorteioPreview.partidasMataMata
      );
      await carregarDados();
      setIsSorteioModalOpen(false);
      setSorteioPreview(null);
    } catch (err) {
      console.error('Erro ao confirmar sorteio do mata-mata:', err);
    } finally {
      setConfirmingSorteio(false);
    }
  };

  const handleAbrirEdicao = (partida: TrucoPartida) => {
    if (!partida.time_a_id || !partida.time_b_id) return;
    setEditingPartida(partida);
    setEditPontosA(partida.pontos_time_a || 0);
    setEditPontosB(partida.pontos_time_b || 0);
    setEditStatus(partida.status === 'agendada' ? 'finalizada' : partida.status);
  };

  const handleSalvarPlacar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartida) return;

    const pontosA = Number(editPontosA) || 0;
    const pontosB = Number(editPontosB) || 0;
    const statusFinal = editStatus === 'agendada' && (pontosA > 0 || pontosB > 0) ? 'finalizada' : editStatus;

    setSavingMatch(true);

    // Atualização otimista imediata na interface do mata-mata
    setPartidas(prevPartidas =>
      prevPartidas.map(p =>
        p.id === editingPartida.id
          ? {
              ...p,
              pontos_time_a: pontosA,
              pontos_time_b: pontosB,
              status: statusFinal,
              vencedor_id: pontosA > pontosB ? p.time_a_id : pontosB > pontosA ? p.time_b_id : null
            }
          : p
      )
    );

    try {
      await registrarResultadoPartida(
        editingPartida.id,
        pontosA,
        pontosB,
        statusFinal
      );
      await carregarDados();
      setEditingPartida(null);
    } catch (err) {
      console.error('Erro ao salvar resultado no mata-mata:', err);
    } finally {
      setSavingMatch(false);
    }
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
    : grandeFinal?.status === 'finalizada' && grandeFinal.vencedor_id
    ? getEquipeById(grandeFinal.vencedor_id)
    : null;

  // Componente de Card de Duelo do Bracket
  const MatchCard = ({
    titulo,
    subtitulo,
    partida,
    placeholderA = 'Aguardando Time',
    placeholderB = 'Aguardando Time',
    isFinal = false
  }: {
    titulo: string;
    subtitulo?: string;
    partida?: TrucoPartida;
    placeholderA?: string;
    placeholderB?: string;
    isFinal?: boolean;
  }) => {
    const timeA = getEquipeById(partida?.time_a_id || null);
    const timeB = getEquipeById(partida?.time_b_id || null);

    const isProntaParaJogar = !!timeA && !!timeB;
    const isFinalizada = partida?.status === 'finalizada';
    const isEmAndamento = partida?.status === 'em_andamento';

    const vitoriaA = isFinalizada && (partida?.pontos_time_a || 0) > (partida?.pontos_time_b || 0);
    const vitoriaB = isFinalizada && (partida?.pontos_time_b || 0) > (partida?.pontos_time_a || 0);

    return (
      <div className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 shadow-xl transition-all duration-300 border ${
        isFinal 
          ? 'bg-gradient-to-b from-amber-500/15 via-zinc-900/90 to-zinc-950 border-amber-500/50 shadow-amber-500/10'
          : isFinalizada 
          ? 'bg-zinc-900/90 border-zinc-800' 
          : isEmAndamento 
          ? 'bg-zinc-900/95 border-emerald-500/50 ring-1 ring-emerald-500/20' 
          : 'bg-zinc-900/80 border-white/10'
      }`}>
        {/* Header do Card */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/5 text-[11px]">
          <div>
            <span className="font-black uppercase tracking-wider text-amber-400 block">{titulo}</span>
            {subtitulo && <span className="text-[10px] text-zinc-500">{subtitulo}</span>}
          </div>

          <div className="flex items-center gap-1.5">
            {isFinalizada ? (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={11} />
                Concluída
              </span>
            ) : isEmAndamento ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                <Play size={10} />
                Em Jogo
              </span>
            ) : isProntaParaJogar ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                Pronta
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                Aguardando
              </span>
            )}

            {isProntaParaJogar && partida && (
              <button
                onClick={() => handleAbrirEdicao(partida)}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 transition-colors cursor-pointer"
                title="Editar Placar"
              >
                <Edit3 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Time A Row */}
        <div className={`p-2.5 rounded-2xl flex items-center justify-between gap-2 mb-2 transition-all ${
          vitoriaA ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' : 'bg-black/30 border border-white/5'
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
              <span className={`text-xs font-black uppercase truncate block ${timeA ? 'text-white' : 'text-zinc-500 italic'}`}>
                {timeA ? timeA.nome : placeholderA}
              </span>
              {timeA && <span className="text-[9px] text-zinc-400 truncate block">{timeA.cidade}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {vitoriaA && <Trophy size={14} className="text-emerald-400" />}
            <span className={`text-base font-black px-2 py-0.5 rounded-lg bg-black/50 ${
              vitoriaA ? 'text-emerald-400 font-black' : 'text-zinc-300'
            }`}>
              {partida?.pontos_time_a || 0}
            </span>
          </div>
        </div>

        {/* Time B Row */}
        <div className={`p-2.5 rounded-2xl flex items-center justify-between gap-2 transition-all ${
          vitoriaB ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' : 'bg-black/30 border border-white/5'
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
              <span className={`text-xs font-black uppercase truncate block ${timeB ? 'text-white' : 'text-zinc-500 italic'}`}>
                {timeB ? timeB.nome : placeholderB}
              </span>
              {timeB && <span className="text-[9px] text-zinc-400 truncate block">{timeB.cidade}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {vitoriaB && <Trophy size={14} className="text-emerald-400" />}
            <span className={`text-base font-black px-2 py-0.5 rounded-lg bg-black/50 ${
              vitoriaB ? 'text-emerald-400 font-black' : 'text-zinc-300'
            }`}>
              {partida?.pontos_time_b || 0}
            </span>
          </div>
        </div>
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
                <span>Fase Final • Eliminatórias</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                🏆 Chaveamento do Mata-Mata
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                Grupos A e B, Semifinais, Finais de Grupo e a Grande Final pelo título de Campeão!
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {!statusTorneio?.sorteio_mata_mata_confirmado ? (
                <button
                  onClick={handleAbrirSorteioMataMata}
                  disabled={!podeSortearMataMata}
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Dices size={18} />
                  <span>Realizar Sorteio do Mata-Mata</span>
                </button>
              ) : null}
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

          {/* ALERTA SE O MATA-MATA AINDA NÃO FOI SORTEADO */}
          {!statusTorneio?.sorteio_mata_mata_confirmado && (
            <div className="w-full mb-8">
              {top8Equipes.length < 8 ? (
                <div className="p-5 rounded-3xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={24} className="text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-black uppercase text-white">Aguardando Conclusão da 1ª Fase</h4>
                      <p className="text-xs text-zinc-400 font-medium">
                        O chaveamento do Mata-Mata será liberado assim que a Primeira Fase for 100% concluída e os 08 melhores forem apurados.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 text-black font-black text-xs uppercase tracking-wider hover:bg-teal-400 transition-colors shrink-0"
                  >
                    Ver Tabela da 1ª Fase
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Dices size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-emerald-400">1ª Fase Encerrada! 08 Classificados Prontos.</h4>
                      <p className="text-xs text-zinc-300 font-medium">
                        Realize o sorteio independente do Mata-Mata para distribuir os 8 classificados no Grupo A e Grupo B.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAbrirSorteioMataMata}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all shrink-0 cursor-pointer"
                  >
                    <span>Sortear Mata-Mata</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ESQUELETO VISUAL COMPLETO DO MATA-MATA (BRACKET) */}
          <div className="w-full flex flex-col gap-12">
            
            {/* GRUPO A & GRUPO B - LADO A LADO OU EM BLOCOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* BLOCO GRUPO A */}
              <div className="bg-zinc-900/60 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">🅰️ Chaveamento — Grupo A</h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold uppercase">4 Times</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Semifinais do Grupo A</span>
                  
                  <MatchCard
                    titulo="Semifinal A1"
                    partida={semiA1}
                    placeholderA="Classificado A1"
                    placeholderB="Classificado A2"
                  />

                  <MatchCard
                    titulo="Semifinal A2"
                    partida={semiA2}
                    placeholderA="Classificado A3"
                    placeholderB="Classificado A4"
                  />
                </div>

                {/* Seta / Conexão Visual */}
                <div className="flex justify-center text-emerald-400">
                  <div className="w-0.5 h-6 bg-emerald-500/40"></div>
                </div>

                {/* Final do Grupo A */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    🏆 Final do Grupo A (Decisão do Finalista A)
                  </span>
                  <MatchCard
                    titulo="Final do Grupo A"
                    partida={finalA}
                    placeholderA="Vencedor Semifinal A1"
                    placeholderB="Vencedor Semifinal A2"
                  />
                </div>
              </div>

              {/* BLOCO GRUPO B */}
              <div className="bg-zinc-900/60 border border-teal-500/30 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">🅱️ Chaveamento — Grupo B</h3>
                  </div>
                  <span className="text-xs text-teal-400 font-bold uppercase">4 Times</span>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Semifinais do Grupo B</span>
                  
                  <MatchCard
                    titulo="Semifinal B1"
                    partida={semiB1}
                    placeholderA="Classificado B1"
                    placeholderB="Classificado B2"
                  />

                  <MatchCard
                    titulo="Semifinal B2"
                    partida={semiB2}
                    placeholderA="Classificado B3"
                    placeholderB="Classificado B4"
                  />
                </div>

                {/* Seta / Conexão Visual */}
                <div className="flex justify-center text-teal-400">
                  <div className="w-0.5 h-6 bg-teal-500/40"></div>
                </div>

                {/* Final do Grupo B */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                    🏆 Final do Grupo B (Decisão do Finalista B)
                  </span>
                  <MatchCard
                    titulo="Final do Grupo B"
                    partida={finalB}
                    placeholderA="Vencedor Semifinal B1"
                    placeholderB="Vencedor Semifinal B2"
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
                  titulo="Grande Finalíssima"
                  subtitulo="Finalista A × Finalista B"
                  partida={grandeFinal}
                  placeholderA="👑 Campeão do Grupo A"
                  placeholderB="👑 Campeão do Grupo B"
                  isFinal={true}
                />
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* MODAL DE SORTEIO DO MATA-MATA (CONFIRMAR OU REFAZER) */}
      {isSorteioModalOpen && sorteioPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto py-8">
          <div className="bg-zinc-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.35)] relative animate-in zoom-in-95 duration-300 my-auto">
            <button
              onClick={() => setIsSorteioModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black flex items-center justify-center shadow-lg font-black">
                <Dices size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Sorteio Independente</span>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-white">Sorteio do Mata-Mata (Top 8)</h3>
              </div>
            </div>

            {/* Divisão dos Grupos Sorteados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Grupo A */}
              <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-4">
                <h4 className="text-xs font-black uppercase text-emerald-400 mb-3 flex items-center gap-2">
                  <span>🅰️ Grupo A (4 Equipes)</span>
                </h4>
                <div className="flex flex-col gap-2">
                  {sorteioPreview.grupoA.map((eq) => (
                    <div key={eq.id} className="bg-zinc-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-between">
                      <span className="truncate">{eq.nome}</span>
                      <span className="text-[10px] text-zinc-400">{eq.cidade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grupo B */}
              <div className="bg-black/40 border border-teal-500/30 rounded-2xl p-4">
                <h4 className="text-xs font-black uppercase text-teal-400 mb-3 flex items-center gap-2">
                  <span>🅱️ Grupo B (4 Equipes)</span>
                </h4>
                <div className="flex flex-col gap-2">
                  {sorteioPreview.grupoB.map((eq) => (
                    <div key={eq.id} className="bg-zinc-800/80 px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-between">
                      <span className="truncate">{eq.nome}</span>
                      <span className="text-[10px] text-zinc-400">{eq.cidade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleRefazerSorteioMataMata}
                disabled={confirmingSorteio}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>🔄 Refazer Sorteio</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmarSorteioMataMata}
                disabled={confirmingSorteio}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {confirmingSorteio ? 'Salvando Chaveamento...' : '✅ Confirmar Chaveamento Oficial'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE PLACAR NO MATA-MATA */}
      {editingPartida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setEditingPartida(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <Edit3 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{editingPartida.fase_nome}</span>
                <h3 className="text-xl font-black uppercase text-white">Registrar Resultado</h3>
              </div>
            </div>

            <form onSubmit={handleSalvarPlacar} className="flex flex-col gap-5">
              
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-zinc-300">Status da Partida</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none"
                >
                  <option value="agendada">⚪ Aguardando Início</option>
                  <option value="em_andamento">🟡 Em Andamento</option>
                  <option value="finalizada">🟢 Concluída (Avança Vencedor)</option>
                </select>
              </div>

              {/* Placar */}
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-xs font-bold uppercase text-zinc-300 line-clamp-1">
                    {getEquipeById(editingPartida.time_a_id)?.nome || 'Time A'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={editPontosA}
                    onChange={e => setEditPontosA(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-center bg-zinc-900 border border-amber-500/50 rounded-xl py-2.5 text-2xl font-black text-amber-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Pontos</span>
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-xs font-bold uppercase text-zinc-300 line-clamp-1">
                    {getEquipeById(editingPartida.time_b_id)?.nome || 'Time B'}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={editPontosB}
                    onChange={e => setEditPontosB(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 text-center bg-zinc-900 border border-amber-500/50 rounded-xl py-2.5 text-2xl font-black text-amber-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Pontos</span>
                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPartida(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMatch}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>{savingMatch ? 'Salvando...' : 'Salvar Resultado'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
