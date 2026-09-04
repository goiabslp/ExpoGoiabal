import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  type TrucoTorneioStatus,
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  calcularDataRodada,
  calcularRodadaAtual,
  registrarResultadoPartida,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Play, 
  Edit3, 
  Users, 
  Trophy, 
  BarChart3, 
  Save, 
  X, 
  Search, 
  Dices,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Printer
} from 'lucide-react';

interface TrucoPartidasPageProps {
  isAdmin?: boolean;
}

export const TrucoPartidasPage: React.FC<TrucoPartidasPageProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { rodadaId } = useParams<{ rodadaId?: string }>();
  const [searchParams] = useSearchParams();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const partidasPrimeiraFase = useMemo(() => partidas.filter(p => p.tipo_fase === 'primeira_fase'), [partidas]);
  
  // Extrai as rodadas que realmente existem nas partidas geradas
  const rodadasExistentes = useMemo(() => {
    const set = new Set(partidasPrimeiraFase.map(p => p.rodada));
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr.length > 0 ? arr : [1];
  }, [partidasPrimeiraFase]);

  const maxRodadas = useMemo(() => Math.max(...rodadasExistentes), [rodadasExistentes]);
  const listaRodadas = useMemo(() => rodadasExistentes, [rodadasExistentes]);

  // Calcula dinamicamente a rodada atual com base na data do torneio e jogos
  const rodadaAtualNumero = useMemo(() => {
    const rCalculada = calcularRodadaAtual(maxRodadas, new Date(), partidasPrimeiraFase);
    // Garante que a rodada calculada exista nas rodadas geradas
    if (rodadasExistentes.includes(rCalculada)) return rCalculada;
    return rodadasExistentes[0] || 1;
  }, [maxRodadas, partidasPrimeiraFase, rodadasExistentes]);

  // Filtros - Inicializa selecionando a Rodada informada na rota ou Rodada Atual
  const [rodadaFiltro, setRodadaFiltro] = useState<number | 'todas'>(() => {
    if (rodadaId) {
      if (rodadaId.toLowerCase() === 'todas') return 'todas';
      const num = Number(rodadaId);
      if (!isNaN(num) && num >= 1) return num;
    }
    const queryRod = searchParams.get('rodada');
    if (queryRod) {
      if (queryRod.toLowerCase() === 'todas') return 'todas';
      const num = Number(queryRod);
      if (!isNaN(num) && num >= 1) return num;
    }
    return rodadaAtualNumero;
  });

  // Sincroniza se o parâmetro de rota ou busca mudar
  useEffect(() => {
    if (rodadaId) {
      if (rodadaId.toLowerCase() === 'todas') {
        setRodadaFiltro('todas');
      } else {
        const num = Number(rodadaId);
        if (!isNaN(num) && num >= 1) {
          setRodadaFiltro(num);
        }
      }
    } else {
      const queryRod = searchParams.get('rodada');
      if (queryRod) {
        if (queryRod.toLowerCase() === 'todas') {
          setRodadaFiltro('todas');
        } else {
          const num = Number(queryRod);
          if (!isNaN(num) && num >= 1) {
            setRodadaFiltro(num);
          }
        }
      }
    }
  }, [rodadaId, searchParams]);

  // Garante que a rodada selecionada seja válida após carregar os dados
  useEffect(() => {
    if (!loading && partidasPrimeiraFase.length > 0) {
      if (!rodadaId && !searchParams.get('rodada')) {
        setRodadaFiltro(rodadaAtualNumero);
      } else if (typeof rodadaFiltro === 'number' && !rodadasExistentes.includes(rodadaFiltro)) {
        setRodadaFiltro(rodadaAtualNumero);
      }
    }
  }, [loading, partidasPrimeiraFase.length, rodadaAtualNumero, rodadaId, searchParams, rodadasExistentes]);

  const [buscaTime, setBuscaTime] = useState('');

  // Modal de Inserção/Edição de Placar (Apenas Admin)
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
      console.error('Erro ao carregar partidas:', err);
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

  const handleAbrirEdicao = (partida: TrucoPartida) => {
    if (!isAdmin) return;
    setEditingPartida(partida);
    setEditPontosA(partida.pontos_time_a || 0);
    setEditPontosB(partida.pontos_time_b || 0);
    // Se o status da partida for 'agendada', ao abrir para lançar o placar já sugere 'finalizada'
    setEditStatus(partida.status === 'agendada' ? 'finalizada' : partida.status);
  };

  const handleSalvarPlacar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartida || !isAdmin) return;

    const pontosA = Number(editPontosA) || 0;
    const pontosB = Number(editPontosB) || 0;
    // Se digitou pontos e o status ainda estiver como 'agendada', assume como 'finalizada'
    const statusFinal = editStatus === 'agendada' && (pontosA > 0 || pontosB > 0) ? 'finalizada' : editStatus;

    setSavingMatch(true);

    // Atualização otimista imediata no estado da tela
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
      console.error('Erro ao salvar resultado da partida:', err);
    } finally {
      setSavingMatch(false);
    }
  };

  const totalJogos = partidasPrimeiraFase.length;
  const concluidos = partidasPrimeiraFase.filter(p => p.status === 'finalizada' || (p.pontos_time_a || 0) > 0 || (p.pontos_time_b || 0) > 0).length;
  const emAndamento = partidasPrimeiraFase.filter(p => p.status === 'em_andamento').length;

  const handleMudarRodada = (novaRodada: number | 'todas') => {
    setRodadaFiltro(novaRodada);
    const basePath = isAdmin ? '/Admin/Truco/Partidas' : '/ExpoGoiabal/Truco/Partidas';
    if (novaRodada === 'todas') {
      navigate(basePath, { replace: true });
    } else {
      navigate(`${basePath}/Rodada/${novaRodada}`, { replace: true });
    }
  };

  const handleRodadaAnterior = () => {
    if (rodadaFiltro === 'todas') {
      handleMudarRodada(rodadaAtualNumero);
    } else if (typeof rodadaFiltro === 'number' && rodadaFiltro > 1) {
      handleMudarRodada(rodadaFiltro - 1);
    }
  };

  const handleRodadaProxima = () => {
    if (rodadaFiltro === 'todas') {
      handleMudarRodada(rodadaAtualNumero);
    } else if (typeof rodadaFiltro === 'number' && rodadaFiltro < maxRodadas) {
      handleMudarRodada(rodadaFiltro + 1);
    }
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
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
          
          <TrucoBackButton 
            to={isAdmin ? "/Admin/Truco" : "/ExpoGoiabal/Truco"} 
            label={isAdmin ? "Voltar para o Hub do Truco" : "Voltar para o Torneio"} 
          />

          {/* Header Section */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-2">
                <Calendar size={13} />
                <span>{isAdmin ? '🔐 Painel Administrativo de Resultados' : 'Calendário Oficial • Terças e Quintas-feiras'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                {isAdmin ? '📝 Lançamento de Placares' : '⚔️ Calendário'}
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                {isAdmin 
                  ? 'Insira os placares das partidas para atualizar em tempo real a classificação e saldo de pontos.'
                  : 'Confrontos oficiais gerados pelo sorteio com datas e placares atualizados em tempo real.'}
              </p>
            </div>

            {/* Ações Rápidas */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  const rAlvo = rodadaFiltro === 'todas' ? 'todas' : rodadaFiltro;
                  navigate(`/ExpoGoiabal/Truco/Partidas/Imprimir/Rodada/${rAlvo}`);
                }}
                className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-amber-500/40 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors w-full sm:w-auto"
                title="Imprimir relatório da rodada ou salvar em PDF"
              >
                <Printer size={15} className="text-amber-400" />
                <span>Imprimir Rodada / PDF</span>
              </button>

              <button
                onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
                className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <BarChart3 size={16} />
                <span>Ver Tabela em Tempo Real</span>
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Carregando partidas...</span>
            </div>
          ) : !statusTorneio?.sorteio_primeira_fase_confirmado && partidasPrimeiraFase.length === 0 ? (
            <div className="w-full bg-zinc-900/80 border border-dashed border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Dices size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-white mb-2">
                Sorteio da 1ª Fase ainda não foi realizado
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mb-6">
                Para visualizar e gerenciar as partidas, é necessário primeiro realizar o sorteio oficial das equipes no Painel Administrativo.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco'); }}
                  className="px-6 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer border border-white/10"
                >
                  <Dices size={16} />
                  <span>Voltar ao Início do Truco</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Sorteio'); }}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Dices size={16} />
                    <span>Realizar Sorteio Agora</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-6">

              {/* CARD DE RESUMO, BUSCA E NAVEGAÇÃO DE RODADAS */}
              <div className="bg-zinc-900/90 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 backdrop-blur-md">
                
                {/* Linha Superior: Status e Busca */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Status Geral */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total de Jogos</span>
                      <span className="text-xl font-black text-white">{totalJogos}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Concluídos</span>
                      <span className="text-xl font-black text-emerald-400">{concluidos}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Em Andamento</span>
                      <span className="text-xl font-black text-amber-400">{emAndamento}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Aguardando</span>
                      <span className="text-xl font-black text-zinc-300">{Math.max(0, totalJogos - concluidos - emAndamento)}</span>
                    </div>
                  </div>

                  {/* Input de Busca por Time */}
                  <div className="w-full sm:w-64 relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Buscar time..."
                      value={buscaTime}
                      onChange={e => setBuscaTime(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-zinc-500 focus:border-amber-500 outline-none transition-all"
                    />
                    {buscaTime && (
                      <button
                        onClick={() => setBuscaTime('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                </div>

                {/* Linha Intermediária: Pills / Abas Rápidas de Seleção de Rodadas */}
                <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <span>Navegação Rápida por Rodada:</span>
                    </span>

                    {/* Badge Rodada Atual */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
                      <Flame size={13} className="animate-pulse text-amber-400" />
                      <span>Rodada Atual: <strong>Rodada {String(rodadaAtualNumero).padStart(2, '0')}</strong> ({calcularDataRodada(rodadaAtualNumero).dataFormatada} - {calcularDataRodada(rodadaAtualNumero).diaSemana})</span>
                    </div>
                  </div>

                  {/* Abas Horizontais com Scroll Suave */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {/* Botão Todas as Rodadas */}
                    <button
                      type="button"
                      onClick={() => handleMudarRodada('todas')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                        rodadaFiltro === 'todas'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/20 scale-105'
                          : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10'
                      }`}
                    >
                      <Calendar size={14} />
                      <span>Todas as Rodadas ({totalJogos})</span>
                    </button>

                    {/* Botões Individuais das Rodadas */}
                    {listaRodadas.map(rod => {
                      const isAtual = rod === rodadaAtualNumero;
                      const isSelected = rodadaFiltro === rod;
                      const dtInfo = calcularDataRodada(rod);
                      const jRod = partidasPrimeiraFase.filter(p => p.rodada === rod);
                      const cRod = jRod.filter(p => p.status === 'finalizada' || (p.pontos_time_a || 0) > 0 || (p.pontos_time_b || 0) > 0).length;

                      return (
                        <button
                          key={rod}
                          type="button"
                          onClick={() => handleMudarRodada(rod)}
                          title={`Rodada ${rod} - ${dtInfo.textoCompleto}`}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 scale-105'
                              : isAtual
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10'
                          }`}
                        >
                          {isAtual && <Flame size={13} className={isSelected ? 'text-black' : 'text-amber-400 animate-pulse'} />}
                          <span>Rodada {String(rod).padStart(2, '0')}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-black/30 text-black' : 'bg-black/40 text-zinc-400'
                          }`}>
                            {cRod}/{jRod.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Linha Inferior: Select Dinâmico de Rodadas com Navegação Anterior/Próxima */}
                <div className="pt-3 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  <div className="text-xs text-zinc-400 font-medium">
                    {rodadaFiltro === 'todas' ? (
                      <span>Exibindo <strong>todas as {listaRodadas.length} rodadas</strong> do torneio ({totalJogos} confrontos totais)</span>
                    ) : (
                      <span>Exibindo <strong>Rodada {String(rodadaFiltro).padStart(2, '0')}</strong> • {calcularDataRodada(rodadaFiltro).textoCompleto}</span>
                    )}
                  </div>

                  {/* Controles de Seleção e Botões Anterior/Próximo */}
                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    
                    {/* Botão Rodada Anterior */}
                    <button
                      type="button"
                      onClick={handleRodadaAnterior}
                      disabled={typeof rodadaFiltro === 'number' && rodadaFiltro <= listaRodadas[0]}
                      className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800/80 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                      title="Rodada Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* SELECT DINÂMICO DE RODADAS */}
                    <div className="relative flex-1 sm:w-80 md:w-96">
                      <select
                        value={rodadaFiltro}
                        onChange={e => {
                          const val = e.target.value;
                          handleMudarRodada(val === 'todas' ? 'todas' : Number(val));
                        }}
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-black/70 border border-amber-500/40 hover:border-amber-400 focus:border-amber-400 text-white font-black text-xs uppercase tracking-wider outline-none transition-all cursor-pointer appearance-none shadow-inner"
                      >
                        <option value="todas" className="bg-zinc-900 text-white py-2 font-bold">
                          📅 TODAS AS RODADAS ({totalJogos} JOGOS TOTAIS)
                        </option>
                        {listaRodadas.map(rod => {
                          const isAtual = rod === rodadaAtualNumero;
                          const dataInfo = calcularDataRodada(rod);
                          const jogosDesta = partidasPrimeiraFase.filter(p => p.rodada === rod);
                          const concluidosDesta = jogosDesta.filter(p => p.status === 'finalizada' || (p.pontos_time_a || 0) > 0 || (p.pontos_time_b || 0) > 0).length;

                          return (
                            <option key={rod} value={rod} className="bg-zinc-900 text-white py-2 font-semibold">
                              {isAtual ? '🔥 ' : '🏟️ '}RODADA {String(rod).padStart(2, '0')}{isAtual ? ' (RODADA ATUAL)' : ''} — {dataInfo.dataFormatada} ({dataInfo.diaSemana}) [{concluidosDesta}/{jogosDesta.length} CONCLUÍDOS]
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
                    </div>

                    {/* Botão Próxima Rodada */}
                    <button
                      type="button"
                      onClick={handleRodadaProxima}
                      disabled={typeof rodadaFiltro === 'number' && rodadaFiltro >= listaRodadas[listaRodadas.length - 1]}
                      className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800/80 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
                      title="Próxima Rodada"
                    >
                      <ChevronRight size={16} />
                    </button>

                  </div>
                </div>
              </div>

              {/* LISTA DE CONFRONTOS ORGANIZADA POR RODADAS */}
              <div className="flex flex-col gap-8">
                {(rodadaFiltro === 'todas' ? listaRodadas : [rodadaFiltro]).map(numRod => {
                  const dataInfo = calcularDataRodada(numRod);
                  let jogos = partidasPrimeiraFase.filter(p => p.rodada === numRod);

                  if (buscaTime.trim()) {
                    const query = buscaTime.toLowerCase();
                    jogos = jogos.filter(j => {
                      const tA = getEquipeById(j.time_a_id);
                      const tB = getEquipeById(j.time_b_id);
                      return tA?.nome.toLowerCase().includes(query) || tB?.nome.toLowerCase().includes(query);
                    });
                  }

                  return (
                    <div key={numRod} className="flex flex-col gap-4">
                      
                      {/* Banner da Rodada com Data (Terça/Quinta) */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 border border-emerald-500/30 px-5 py-3.5 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                            <Calendar size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black uppercase tracking-wider text-amber-400">
                                🏟️ RODADA {String(numRod).padStart(2, '0')}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-bold text-emerald-400">
                                Jogos Simultâneos
                              </span>
                              {numRod === rodadaAtualNumero && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-black uppercase text-amber-400">
                                  🔥 Rodada Atual
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-300 font-semibold">
                              📅 {dataInfo.textoCompleto}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              navigate(`/ExpoGoiabal/Truco/Partidas/Imprimir/Rodada/${numRod}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title={`Imprimir Súmula e Confrontos da Rodada ${numRod}`}
                          >
                            <Printer size={12} className="text-amber-400" />
                            <span>Imprimir / PDF</span>
                          </button>

                          <span className="text-xs text-zinc-400 font-bold">
                            {jogos.filter(j => j.status === 'finalizada').length}/{jogos.length} Concluídos
                          </span>
                        </div>
                      </div>

                      {/* Aviso de Folga Programada (quando número de equipes for ímpar) */}
                      {(() => {
                        if (equipes.length % 2 === 0) return null;
                        const timeFolga = equipes.find(eq => {
                          const jogandoDesta = partidasPrimeiraFase
                            .filter(p => p.rodada === numRod)
                            .some(j => j.time_a_id === eq.id || j.time_b_id === eq.id);
                          return !jogandoDesta;
                        });
                        if (!timeFolga) return null;
                        return (
                          <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-300">
                            <div className="flex items-center gap-2">
                              <span>💡</span>
                              <span>
                                Folga programada nesta rodada: <strong className="text-white">{timeFolga.nome}</strong> ({timeFolga.cidade}).
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded shrink-0">
                              Todos contra Todos
                            </span>
                          </div>
                        );
                      })()}

                      {/* Se não houver jogos para os filtros atuais nesta rodada */}
                      {jogos.length === 0 ? (
                        <div className="bg-zinc-900/60 border border-dashed border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
                          <span className="text-2xl mb-2">🔍</span>
                          <h4 className="text-sm font-bold text-white uppercase">Nenhum confronto encontrado</h4>
                          <p className="text-xs text-zinc-400 mt-1 mb-4">
                            {buscaTime ? `Nenhuma partida para "${buscaTime}" na Rodada ${numRod}.` : `Nenhuma partida agendada para a Rodada ${numRod}.`}
                          </p>
                          <div className="flex gap-2">
                            {buscaTime && (
                              <button onClick={() => setBuscaTime('')} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold uppercase text-white hover:bg-zinc-700 cursor-pointer">
                                Limpar Busca
                              </button>
                            )}
                            {rodadaFiltro !== 'todas' && (
                              <button onClick={() => handleMudarRodada('todas')} className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold uppercase hover:bg-amber-400 cursor-pointer">
                                Ver Todas as Rodadas
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Cards dos Jogos da Rodada */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {jogos.map((partida) => {
                            const timeA = getEquipeById(partida.time_a_id);
                            const timeB = getEquipeById(partida.time_b_id);

                            const isFinalizada = partida.status === 'finalizada';
                            const isEmAndamento = partida.status === 'em_andamento';

                          const pontosA = Number(partida.pontos_time_a) || 0;
                          const pontosB = Number(partida.pontos_time_b) || 0;

                          const saldoA = pontosA - pontosB;
                          const saldoB = pontosB - pontosA;

                          const vitoriaA = isFinalizada && pontosA > pontosB;
                          const vitoriaB = isFinalizada && pontosB > pontosA;
                          const isEmpate = isFinalizada && pontosA === pontosB;

                          return (
                            <div
                              key={partida.id}
                              className={`relative overflow-hidden bg-zinc-900/90 border rounded-3xl p-5 shadow-xl transition-all duration-300 ${
                                isFinalizada 
                                  ? isEmpate
                                    ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.08)]'
                                    : 'border-zinc-800' 
                                  : isEmAndamento 
                                  ? 'border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30' 
                                  : 'border-white/10 hover:border-amber-500/40'
                              }`}
                            >
                              {/* Top info card */}
                              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-[11px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-amber-400 uppercase tracking-wider">
                                    Jogo #{String(partida.numero_jogo).padStart(2, '0')}
                                  </span>
                                  <span className="text-zinc-500">•</span>
                                  <span className="text-zinc-300 font-semibold text-[11px] flex items-center gap-1">
                                    <Calendar size={12} className="text-emerald-400" />
                                    <span>{dataInfo.textoCompleto}</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isFinalizada ? (
                                    isEmpate ? (
                                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        🤝 Empate (1 pt)
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <CheckCircle2 size={11} className="text-emerald-400" />
                                        🟢 Concluída
                                      </span>
                                    )
                                  ) : isEmAndamento ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                      <Play size={10} />
                                      🟡 Em Andamento
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                      <Clock size={11} />
                                      ⚪ Aguardando
                                    </span>
                                  )}

                                  {isAdmin && (
                                    <button
                                      onClick={() => handleAbrirEdicao(partida)}
                                      className="p-1 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-400 transition-colors cursor-pointer"
                                      title="Inserir / Alterar Placar"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Visual Duel */}
                              <div className="grid grid-cols-5 items-center gap-2">
                                
                                {/* Time A */}
                                <div className={`col-span-2 flex flex-col items-center text-center p-2.5 rounded-2xl ${
                                  vitoriaA ? 'bg-emerald-500/10 border border-emerald-500/30' : isEmpate ? 'bg-yellow-500/5 border border-yellow-500/20' : ''
                                }`}>
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center mb-1.5 shadow-md relative">
                                    {timeA?.foto_url ? (
                                      <img src={timeA.foto_url} alt={timeA.nome} className="w-full h-full object-cover" />
                                    ) : (
                                      <Users size={20} className="text-zinc-500" />
                                    )}
                                    {vitoriaA && (
                                      <div className="absolute top-0 right-0 bg-emerald-500 text-black p-0.5 rounded-bl-md">
                                        <Trophy size={8} />
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-black uppercase text-white line-clamp-1">{timeA?.nome || 'Time A'}</h4>
                                  <span className="text-[10px] text-zinc-400 line-clamp-1">{timeA?.cidade}</span>
                                  
                                  {/* Saldo Time A */}
                                  {isFinalizada && (
                                    <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded ${
                                      saldoA > 0 ? 'text-emerald-400 bg-emerald-500/10' : saldoA < 0 ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10'
                                    }`}>
                                      Saldo: {saldoA > 0 ? `+${saldoA}` : saldoA}
                                    </span>
                                  )}
                                </div>

                                {/* Placar Central */}
                                <div className="col-span-1 flex flex-col items-center justify-center">
                                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/60 border shadow-inner ${
                                    isEmpate ? 'border-yellow-500/40' : 'border-white/10'
                                  }`}>
                                    <span className={`text-xl font-black ${vitoriaA ? 'text-emerald-400' : isEmpate ? 'text-yellow-400' : 'text-white'}`}>
                                      {pontosA}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-600">x</span>
                                    <span className={`text-xl font-black ${vitoriaB ? 'text-emerald-400' : isEmpate ? 'text-yellow-400' : 'text-white'}`}>
                                      {pontosB}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">
                                    {isEmpate ? '🤝 Empate' : 'Placar'}
                                  </span>
                                </div>

                                {/* Time B */}
                                <div className={`col-span-2 flex flex-col items-center text-center p-2.5 rounded-2xl ${
                                  vitoriaB ? 'bg-emerald-500/10 border border-emerald-500/30' : isEmpate ? 'bg-yellow-500/5 border border-yellow-500/20' : ''
                                }`}>
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center mb-1.5 shadow-md relative">
                                    {timeB?.foto_url ? (
                                      <img src={timeB.foto_url} alt={timeB.nome} className="w-full h-full object-cover" />
                                    ) : (
                                      <Users size={20} className="text-zinc-500" />
                                    )}
                                    {vitoriaB && (
                                      <div className="absolute top-0 right-0 bg-emerald-500 text-black p-0.5 rounded-bl-md">
                                        <Trophy size={8} />
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-black uppercase text-white line-clamp-1">{timeB?.nome || 'Time B'}</h4>
                                  <span className="text-[10px] text-zinc-400 line-clamp-1">{timeB?.cidade}</span>

                                  {/* Saldo Time B */}
                                  {isFinalizada && (
                                    <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded ${
                                      saldoB > 0 ? 'text-emerald-400 bg-emerald-500/10' : saldoB < 0 ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10'
                                    }`}>
                                      Saldo: {saldoB > 0 ? `+${saldoB}` : saldoB}
                                    </span>
                                  )}
                                </div>

                              </div>

                              {/* Ação de Inserir / Editar Placar (Exclusivo Admin) */}
                              {isAdmin && (
                                <div className="mt-3 pt-2.5 border-t border-white/5">
                                  <button
                                    onClick={() => handleAbrirEdicao(partida)}
                                    className="w-full py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Edit3 size={12} className="text-amber-400" />
                                    <span>{isFinalizada ? 'Alterar Resultado' : 'Inserir Placar'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        </div>
      </main>

      {/* MODAL: INSERIR / EDITAR PLACAR DA PARTIDA (APENAS ADMIN) */}
      {isAdmin && editingPartida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setEditingPartida(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <Edit3 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  {editingPartida.fase_nome} • Jogo #{editingPartida.numero_jogo}
                </span>
                <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                  📅 {calcularDataRodada(editingPartida.rodada).textoCompleto}
                </span>
                <h3 className="text-xl font-black uppercase text-white">Inserir Placar do Jogo</h3>
              </div>
            </div>

            <form onSubmit={handleSalvarPlacar} className="flex flex-col gap-5">
              
              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-zinc-300">Status do Jogo</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="agendada">⚪ Aguardando Início</option>
                  <option value="em_andamento">🟡 Em Andamento</option>
                  <option value="finalizada">🟢 Concluída (Atualiza Tabela & Saldo)</option>
                </select>
              </div>

              {/* Placar e Saldo Preview */}
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
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Pontos Marcados</span>
                  {editStatus === 'finalizada' && (
                    <span className="text-[10px] font-bold text-zinc-400">
                      Saldo: {editPontosA - editPontosB > 0 ? `+${editPontosA - editPontosB}` : editPontosA - editPontosB}
                    </span>
                  )}
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
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Pontos Marcados</span>
                  {editStatus === 'finalizada' && (
                    <span className="text-[10px] font-bold text-zinc-400">
                      Saldo: {editPontosB - editPontosA > 0 ? `+${editPontosB - editPontosA}` : editPontosB - editPontosA}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPartida(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingMatch}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  <span>{savingMatch ? 'Salvando...' : 'Salvar & Atualizar'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
