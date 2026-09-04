import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  type TrucoEquipe, 
  type TrucoPartida, 
  buscarEquipes, 
  buscarPartidas, 
  calcularDataRodada,
  calcularRodadaAtual,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  Printer, 
  ArrowLeft, 
  Calendar, 
  ShieldAlert, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  ChevronDown
} from 'lucide-react';

export const TrucoPartidasRelatorioImpressaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { rodadaId } = useParams<{ rodadaId?: string }>();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      const [eqs, parts] = await Promise.all([
        buscarEquipes(),
        buscarPartidas()
      ]);
      setEquipes(eqs);
      setPartidas(parts);
    } catch (err) {
      console.error('Erro ao carregar dados do relatório de impressão:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  const partidasPrimeiraFase = useMemo(() => partidas.filter(p => p.tipo_fase === 'primeira_fase'), [partidas]);
  
  const rodadasExistentes = useMemo(() => {
    const set = new Set(partidasPrimeiraFase.map(p => p.rodada));
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr.length > 0 ? arr : [1];
  }, [partidasPrimeiraFase]);

  const maxRodadas = useMemo(() => Math.max(...rodadasExistentes), [rodadasExistentes]);
  const listaRodadas = useMemo(() => rodadasExistentes, [rodadasExistentes]);

  const rodadaAtualNumero = useMemo(() => {
    const rCalc = calcularRodadaAtual(maxRodadas, new Date(), partidasPrimeiraFase);
    if (rodadasExistentes.includes(rCalc)) return rCalc;
    return rodadasExistentes[0] || 1;
  }, [maxRodadas, partidasPrimeiraFase, rodadasExistentes]);

  // Rodada selecionada para o relatório
  const [rodadaSelecionada, setRodadaSelecionada] = useState<number | 'todas'>(() => {
    if (rodadaId) {
      if (rodadaId.toLowerCase() === 'todas') return 'todas';
      const n = Number(rodadaId);
      if (!isNaN(n) && n >= 1) return n;
    }
    return rodadaAtualNumero;
  });

  useEffect(() => {
    if (rodadaId) {
      if (rodadaId.toLowerCase() === 'todas') {
        setRodadaSelecionada('todas');
      } else {
        const n = Number(rodadaId);
        if (!isNaN(n) && n >= 1) {
          setRodadaSelecionada(n);
        }
      }
    } else if (!loading && partidasPrimeiraFase.length > 0) {
      setRodadaSelecionada(rodadaAtualNumero);
    }
  }, [rodadaId, loading, rodadaAtualNumero, partidasPrimeiraFase.length]);

  const handleMudarRodada = (novaRodada: number | 'todas') => {
    setRodadaSelecionada(novaRodada);
    if (novaRodada === 'todas') {
      navigate('/ExpoGoiabal/Truco/Partidas/Imprimir/Rodada/todas', { replace: true });
    } else {
      navigate(`/ExpoGoiabal/Truco/Partidas/Imprimir/Rodada/${novaRodada}`, { replace: true });
    }
  };

  const getEquipeById = (id: string | null): TrucoEquipe | undefined => {
    if (!id) return undefined;
    return equipes.find(e => e.id === id);
  };

  const handleImprimir = () => {
    window.print();
  };

  const rodadasParaExibir = rodadaSelecionada === 'todas' ? listaRodadas : [rodadaSelecionada];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans print:bg-white print:text-black">
      
      {/* BARRA SUPERIOR DE CONTROLE (OCULTADA NA IMPRESSÃO) */}
      <header className="print:hidden sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/ExpoGoiabal/Truco/Partidas')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Voltar às Partidas</span>
            </button>

            <span className="text-xs font-black uppercase tracking-wider text-amber-400 hidden md:inline">
              📄 Relatório de Impressão & PDF
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Seletor Dinâmico de Rodada */}
            <div className="relative flex-1 sm:w-64">
              <select
                value={rodadaSelecionada}
                onChange={e => {
                  const val = e.target.value;
                  handleMudarRodada(val === 'todas' ? 'todas' : Number(val));
                }}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-black/70 border border-amber-500/40 text-xs font-black uppercase text-white outline-none cursor-pointer appearance-none shadow"
              >
                {listaRodadas.map(rod => {
                  const isAtual = rod === rodadaAtualNumero;
                  const dt = calcularDataRodada(rod);
                  return (
                    <option key={rod} value={rod} className="bg-zinc-900 text-white">
                      {isAtual ? '🔥 ' : '🏟️ '}RODADA {String(rod).padStart(2, '0')}{isAtual ? ' (ATUAL)' : ''} — {dt.dataFormatada}
                    </option>
                  );
                })}
                <option value="todas" className="bg-zinc-900 text-white">
                  📅 TODAS AS RODADAS (RELATÓRIO GERAL)
                </option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            </div>

            {/* Botão de Imprimir / PDF */}
            <button
              onClick={handleImprimir}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              title="Imprimir ou salvar como arquivo PDF"
            >
              <Printer size={15} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>

        </div>
      </header>

      {/* ÁREA DE CONTEÚDO DO RELATÓRIO (FORMATO A4 PARA IMPRESSÃO) */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-full">
        
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gerando relatório oficial...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-10 print:gap-8">
            
            {rodadasParaExibir.map((numRod, idx) => {
              const dataInfo = calcularDataRodada(numRod);
              const jogosDestaRodada = partidasPrimeiraFase.filter(p => p.rodada === numRod);

              // Identificar todas as equipes que NÃO jogam nesta rodada (Folga)
              const equipesDeFolga = equipes.filter(eq => {
                const estaJogando = jogosDestaRodada.some(j => j.time_a_id === eq.id || j.time_b_id === eq.id);
                return !estaJogando;
              });

              return (
                <article 
                  key={numRod} 
                  className={`bg-zinc-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl print:bg-white print:text-black print:border-2 print:border-black print:rounded-none print:shadow-none print:p-6 ${
                    idx > 0 ? 'print:break-before-page' : ''
                  }`}
                >
                  {/* CABEÇALHO OFICIAL DO DOCUMENTO */}
                  <div className="border-b-2 border-amber-500/50 print:border-black pb-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black text-xl shadow-lg print:border print:border-black">
                        ♠️
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 print:text-black block">
                          Prefeitura Municipal • Secretaria de Esportes & Lazer
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white print:text-black">
                          2º TORNEIO DE TRUCO • EXPOGOIABAL 2026
                        </h1>
                        <p className="text-xs text-zinc-400 print:text-zinc-600 font-semibold">
                          Relatório Oficial de Confrontos e Súmula da Rodada
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/50 print:bg-zinc-100 border border-white/10 print:border-black px-4 py-2 rounded-xl text-center shrink-0">
                      <span className="text-[10px] text-zinc-400 print:text-black font-bold uppercase block">
                        Rodada Oficial
                      </span>
                      <span className="text-lg font-black text-amber-400 print:text-black">
                        RODADA {String(numRod).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* INFORMAÇÕES DA DATA E LOCAL */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-black/40 print:bg-zinc-100 border border-white/10 print:border-black mb-6 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-amber-400 print:text-black" />
                      <div>
                        <strong className="block text-[10px] uppercase text-zinc-400 print:text-zinc-600">Data Oficial:</strong>
                        <span className="font-black text-white print:text-black">{dataInfo.textoCompleto}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-emerald-400 print:text-black" />
                      <div>
                        <strong className="block text-[10px] uppercase text-zinc-400 print:text-zinc-600">Horário Oficial:</strong>
                        <span className="font-black text-white print:text-black">19:00 (Início dos Jogos)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Trophy size={15} className="text-amber-400 print:text-black" />
                      <div>
                        <strong className="block text-[10px] uppercase text-zinc-400 print:text-zinc-600">Total de Partidas:</strong>
                        <span className="font-black text-white print:text-black">{jogosDestaRodada.length} Confrontos Simultâneos</span>
                      </div>
                    </div>
                  </div>

                  {/* DESTAQUE: EQUIPE QUE NÃO JOGA NESTA RODADA (FOLGA PROGRAMADA) */}
                  <div className="mb-6">
                    {equipesDeFolga.length > 0 ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/15 border-2 border-amber-400 print:bg-zinc-100 print:border-2 print:border-black">
                        <div className="flex items-center gap-2 text-amber-400 print:text-black text-xs font-black uppercase tracking-wider mb-2">
                          <ShieldAlert size={16} className="shrink-0" />
                          <span>🛡️ Time(s) que NÃO JOGAM nesta Rodada (Folga Oficial Programada):</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {equipesDeFolga.map(eq => (
                            <div 
                              key={eq.id}
                              className="px-4 py-2 rounded-xl bg-black/60 print:bg-white border border-amber-400/40 print:border-black flex items-center gap-3 shadow"
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-400 print:bg-black"></span>
                              <div>
                                <span className="text-sm font-black text-white print:text-black uppercase block">
                                  {eq.nome}
                                </span>
                                <span className="text-[10px] text-zinc-400 print:text-zinc-600 font-semibold block">
                                  Cidade: {eq.cidade} • (Folga Programada da Rodada {String(numRod).padStart(2, '0')})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-zinc-400 print:text-zinc-700 font-medium mt-2.5">
                          * Nota da Organização: Em conformidade com o regulamento para número ímpar de participantes, a equipe acima não possui jogo agendado para esta data e retornará nas rodadas seguintes.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 print:bg-zinc-100 print:border print:border-black flex items-center gap-2.5 text-xs text-emerald-300 print:text-black">
                        <CheckCircle2 size={16} className="text-emerald-400 print:text-black shrink-0" />
                        <span><strong>100% das Equipes em Ação:</strong> Todas as equipes cadastradas possuem confronto agendado para esta rodada.</span>
                      </div>
                    )}
                  </div>

                  {/* TABELA DE CONFRONTOS OFICIAIS */}
                  <div className="mb-6">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 print:text-black mb-3 flex items-center gap-2">
                      <span>⚔️ Relação de Confrontos da Rodada {String(numRod).padStart(2, '0')}</span>
                    </h3>

                    <div className="overflow-hidden rounded-2xl border border-white/10 print:border-2 print:border-black">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-black/60 print:bg-zinc-200 border-b border-white/10 print:border-black text-[10px] font-black uppercase tracking-wider text-zinc-400 print:text-black">
                            <th className="py-3 px-3 w-16 text-center">Jogo</th>
                            <th className="py-3 px-4 text-right">Time Desafiante (Time A)</th>
                            <th className="py-3 px-3 w-28 text-center">Placar Oficial</th>
                            <th className="py-3 px-4 text-left">Time Desafiado (Time B)</th>
                            <th className="py-3 px-3 w-28 text-center print:hidden">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-black">
                          {jogosDestaRodada.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-zinc-500 print:text-zinc-600 font-bold">
                                Nenhuma partida agendada para esta rodada.
                              </td>
                            </tr>
                          ) : (
                            jogosDestaRodada.map((jogo, jIdx) => {
                              const timeA = getEquipeById(jogo.time_a_id);
                              const timeB = getEquipeById(jogo.time_b_id);
                              const isFinalizada = jogo.status === 'finalizada';

                              return (
                                <tr 
                                  key={jogo.id}
                                  className="hover:bg-white/5 print:hover:bg-transparent transition-colors font-medium"
                                >
                                  {/* Número do Jogo / Mesa */}
                                  <td className="py-3.5 px-3 text-center font-black text-amber-400 print:text-black text-xs">
                                    Mesa {String(jIdx + 1).padStart(2, '0')}
                                  </td>

                                  {/* Time A */}
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2.5">
                                      <div>
                                        <span className="font-black text-white print:text-black text-xs block uppercase">
                                          {timeA?.nome || 'Time A'}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 print:text-zinc-600 block">
                                          {timeA?.cidade || ''}
                                        </span>
                                      </div>
                                      <div className="w-7 h-7 rounded-lg bg-zinc-800 print:bg-zinc-200 border border-white/10 print:border-black flex items-center justify-center text-[10px] font-black shrink-0">
                                        {timeA?.foto_url ? (
                                          <img src={timeA.foto_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                          '🅰️'
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Placar Oficial */}
                                  <td className="py-3.5 px-3 text-center">
                                    <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 print:bg-white border border-white/20 print:border-black font-black text-sm text-white print:text-black">
                                      <span>{isFinalizada ? jogo.pontos_time_a : '  '}</span>
                                      <span className="text-zinc-500 print:text-black font-normal">×</span>
                                      <span>{isFinalizada ? jogo.pontos_time_b : '  '}</span>
                                    </div>
                                  </td>

                                  {/* Time B */}
                                  <td className="py-3.5 px-4 text-left">
                                    <div className="flex items-center justify-start gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-zinc-800 print:bg-zinc-200 border border-white/10 print:border-black flex items-center justify-center text-[10px] font-black shrink-0">
                                        {timeB?.foto_url ? (
                                          <img src={timeB.foto_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                          '🅱️'
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-black text-white print:text-black text-xs block uppercase">
                                          {timeB?.nome || 'Time B'}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 print:text-zinc-600 block">
                                          {timeB?.cidade || ''}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Status da Partida (Tela) */}
                                  <td className="py-3.5 px-3 text-center print:hidden">
                                    {isFinalizada ? (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                                        Concluído
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase">
                                        Agendado
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>


                  {/* RODAPÉ DO DOCUMENTO */}
                  <div className="mt-6 pt-3 border-t border-white/5 print:border-zinc-300 flex items-center justify-between text-[9px] text-zinc-500 print:text-zinc-600">
                    <span>ExpoGoiabal 2026 • Sistema Oficial de Gestão de Torneio</span>
                    <span>Documento emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
                  </div>
                </article>
              );
            })}

          </div>
        )}

      </main>

    </div>
  );
};
