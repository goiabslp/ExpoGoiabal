import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  type TrucoClassificacaoRow, 
  type TrucoPartida, 
  type TrucoTorneioStatus,
  type TrucoEquipe,
  buscarEquipes, 
  buscarPartidas, 
  buscarStatusTorneio,
  calcularClassificacao, 
  encerrarPrimeiraFase,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  BarChart3, 
  Trophy, 
  Users, 
  Info, 
  RefreshCw,
  UserPlus,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TrucoTabelaPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [partidas, setPartidas] = useState<TrucoPartida[]>([]);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);
  const [classificacao, setClassificacao] = useState<TrucoClassificacaoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [encerrandoFase, setEncerrandoFase] = useState(false);
  const [mensagemEncerramento, setMensagemEncerramento] = useState<string | null>(null);

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
      const ranking = calcularClassificacao(eqs, parts);
      setClassificacao(ranking);
    } catch (err) {
      console.error('Erro ao carregar tabela do truco:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  const partidasPrimeiraFase = partidas.filter(p => p.tipo_fase === 'primeira_fase');
  const totalJogos1aFase = partidasPrimeiraFase.length;
  const concluidos1aFase = partidasPrimeiraFase.filter(p => p.status === 'finalizada').length;
  const pendentes1aFase = totalJogos1aFase - concluidos1aFase;

  const todasConcluidas = totalJogos1aFase > 0 && pendentes1aFase === 0;
  const isFaseEncerrada = statusTorneio?.fase_atual === 'primeira_fase_encerrada' || 
                          statusTorneio?.fase_atual === 'mata_mata' || 
                          statusTorneio?.fase_atual === 'finalizado';

  const handleEncerrarPrimeiraFase = async () => {
    setMensagemEncerramento(null);
    setEncerrandoFase(true);
    try {
      await encerrarPrimeiraFase(equipes, partidas);
      await carregarDados();
      setMensagemEncerramento('Primeira Fase encerrada com sucesso! Os 08 melhores foram apurados.');
    } catch (err: any) {
      setMensagemEncerramento(err.message || 'Erro ao encerrar a primeira fase.');
    } finally {
      setEncerrandoFase(false);
    }
  };

  const top8Classificados = classificacao.slice(0, 8);

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

          <TrucoBackButton to="/ExpoGoiabal/Truco" label="Voltar para o Torneio" />

          {/* Header Section */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-black uppercase tracking-widest mb-2">
                <BarChart3 size={13} />
                <span>Classificação da 1ª Fase</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Tabela Geral & Top 8
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                {totalJogos1aFase === 0 
                  ? 'Exibição em ordem alfabética (aguardando realização do sorteio).' 
                  : `${concluidos1aFase} de ${totalJogos1aFase} partidas realizadas.`}
              </p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={carregarDados}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                title="Atualizar dados"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-teal-400' : 'text-teal-400'} />
                <span>Atualizar</span>
              </button>

              {isFaseEncerrada ? (
                <button
                  onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/MataMata'); }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trophy size={16} />
                  <span>Ir para o Mata-Mata</span>
                </button>
              ) : todasConcluidas ? (
                <button
                  onClick={handleEncerrarPrimeiraFase}
                  disabled={encerrandoFase}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock size={15} />
                  <span>{encerrandoFase ? 'Encerrando...' : '🔒 Encerrar 1ª Fase'}</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Feedback de Encerramento */}
          {mensagemEncerramento && (
            <div className="w-full mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 size={20} className="shrink-0" />
              <span>{mensagemEncerramento}</span>
            </div>
          )}

          {/* PAINEL DE PREMIAÇÃO AUTOMÁTICA EM TEMPO REAL (TOP 5 ELEGÍVEIS - R$ 2.500,00) */}
          <div className="w-full mb-8 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(245,158,11,0.12)] flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/30 shrink-0">
                  <Trophy size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1">
                    <span>Bônus Especial: R$ 2.500,00 + Pote Acumulado</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                    🏆 Top 5 Times Premiados (Bônus com Cadastro Completo)
                  </h2>
                </div>
              </div>

              <span className="text-xs text-zinc-400 font-semibold bg-zinc-900/90 px-3.5 py-1.5 rounded-xl border border-white/10">
                ⚡ Atualização Automática em Tempo Real
              </span>
            </div>

            <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed">
              O <strong>bônus de R$ 2.500,00</strong> é concedido <strong>exclusivamente aos 05 melhores times com cadastro regularizado (com CPF)</strong>. Times sem CPF são automaticamente ignorados na premiação, transferindo o bônus para o próximo time elegível.
            </p>

            {/* Aviso do Pote Acumulado de Inscrições + Patrocínios */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-base">💰</span>
                <span><strong>Premiação Extra Acumulada:</strong> 100% do valor das inscrições + patrocínios arrecadados serão retidos e distribuídos como premiação em dinheiro para os <strong>03 primeiros colocados</strong>.</span>
              </div>
            </div>

            {/* Grid dos 5 Premiados Elegíveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { pos: 1, label: '1º Premiado', valor: 'R$ 1.000,00', emoji: '🥇', border: 'border-amber-400/60', bg: 'bg-amber-500/10', text: 'text-amber-400' },
                { pos: 2, label: '2º Premiado', valor: 'R$ 600,00', emoji: '🥈', border: 'border-slate-300/60', bg: 'bg-slate-300/10', text: 'text-slate-200' },
                { pos: 3, label: '3º Premiado', valor: 'R$ 400,00', emoji: '🥉', border: 'border-amber-700/60', bg: 'bg-amber-700/10', text: 'text-amber-500' },
                { pos: 4, label: '4º Premiado', valor: 'R$ 300,00', emoji: '🏅', border: 'border-teal-500/40', bg: 'bg-teal-500/10', text: 'text-teal-300' },
                { pos: 5, label: '5º Premiado', valor: 'R$ 200,00', emoji: '🏅', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
              ].map((p) => {
                const premiado = classificacao.find(c => c.premiacaoPosicao === p.pos);

                return (
                  <div
                    key={p.pos}
                    className={`rounded-2xl border ${p.border} ${p.bg} p-4 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xl">{p.emoji}</span>
                        <span className={`text-xs font-black uppercase tracking-wider ${p.text}`}>
                          {p.label}
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-black text-white block">
                        {p.valor}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      {premiado ? (
                        <div className="flex flex-col">
                          <span className="font-black text-xs uppercase text-white truncate" title={premiado.equipe.nome}>
                            {premiado.equipe.nome}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {premiado.posicao}º Geral • {premiado.pontos} pts
                          </span>
                          <span className="text-[9px] font-black uppercase text-emerald-400 mt-1 flex items-center gap-1">
                            ✅ Elegível
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">
                          Aguardando definição
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAINEL DOS 08 CLASSIFICADOS (TOP 8 MATA-MATA) */}
          {isFaseEncerrada && top8Classificados.length > 0 && (
            <div className="w-full mb-10 bg-gradient-to-b from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">1ª Fase Encerrada Oficialmente</span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase text-white">🏆 Os 08 Melhores Classificados</h2>
                  </div>
                </div>

                <button
                  onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/MataMata'); }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Chaveamento do Mata-Mata</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Grid dos 8 Classificados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {top8Classificados.map((row, idx) => {
                  const medalha = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                  return (
                    <div 
                      key={row.equipe.id} 
                      className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <span className="text-xl font-black">{medalha}</span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0">
                        {row.equipe.foto_url ? (
                          <img src={row.equipe.foto_url} alt={row.equipe.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500"><Users size={18} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs uppercase text-white truncate">{row.equipe.nome}</h4>
                        <span className="text-[10px] text-zinc-400 truncate block">{row.equipe.cidade}</span>
                        <div className="flex items-center gap-2 text-[10px] font-bold mt-1">
                          <span className="text-amber-400">{row.pontos} pts</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-emerald-400">{row.vitorias}V</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">SG: {row.saldoPontos > 0 ? `+${row.saldoPontos}` : row.saldoPontos}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AVISO DE ENCERRAMENTO PENDENTE */}
          {!isFaseEncerrada && totalJogos1aFase > 0 && pendentes1aFase > 0 && (
            <div className="w-full mb-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400 shrink-0" />
                <span>Faltam <strong>{pendentes1aFase} partida(s)</strong> para concluir a 1ª Fase e liberar o encerramento oficial do Top 8.</span>
              </div>
              <button
                onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Sorteio'); }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase text-[10px] tracking-wider transition-colors shrink-0"
              >
                Ver Jogos
              </button>
            </div>
          )}

          {/* TABELA PRINCIPAL */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Calculando classificação e premiações...</span>
            </div>
          ) : classificacao.length === 0 ? (
            <div className="w-full bg-zinc-900/60 border border-dashed border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-white mb-2">
                Nenhuma equipe cadastrada ainda
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mb-6">
                Cadastre as equipes participantes para que a tabela seja gerada automaticamente.
              </p>
              <button
                onClick={() => navigate('/ExpoGoiabal/Truco/Cadastrar')}
                className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <UserPlus size={16} />
                <span>Cadastrar Equipes</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4">
              
              {/* Desktop Table View */}
              <div className="hidden md:block w-full overflow-hidden bg-zinc-900/80 border border-emerald-500/20 rounded-3xl shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/80 border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-4 px-4 text-center w-16 cursor-help" title="POS — Posição da equipe na classificação geral">
                        <span className="hover:text-white transition-colors border-b border-dotted border-zinc-500">POS</span>
                      </th>
                      <th className="py-4 px-4 text-center font-black text-amber-400 bg-white/5 cursor-help" title="PTS — Pontos Totais acumulados na classificação geral">
                        <span className="hover:text-amber-300 transition-colors border-b border-dotted border-amber-400">PTS</span>
                      </th>
                      <th className="py-4 px-4 cursor-help" title="EQUIPE — Nome do time cadastrado e status de premiação">
                        <span className="hover:text-white transition-colors border-b border-dotted border-zinc-500">EQUIPE</span>
                      </th>
                      <th className="py-4 px-3 text-center cursor-help" title="J — Quantidade de jogos realizados na primeira fase">
                        <span className="hover:text-white transition-colors border-b border-dotted border-zinc-500">J</span>
                      </th>
                      <th className="py-4 px-3 text-center text-emerald-400 cursor-help" title="V — Número de vitórias conquistadas (3 pontos por vitória)">
                        <span className="hover:text-emerald-300 transition-colors border-b border-dotted border-emerald-500">V</span>
                      </th>
                      <th className="py-4 px-3 text-center text-red-400 cursor-help" title="D — Número de derrotas sofridas (0 pontos)">
                        <span className="hover:text-red-300 transition-colors border-b border-dotted border-red-500">D</span>
                      </th>
                      <th className="py-4 px-3 text-center text-teal-400 cursor-help" title="PM — Pontos Marcados (Total de tentos/pontos feitos)">
                        <span className="hover:text-teal-300 transition-colors border-b border-dotted border-teal-500">PM</span>
                      </th>
                      <th className="py-4 px-3 text-center text-rose-400 cursor-help" title="PS — Pontos Sofridos (Total de tentos/pontos levados)">
                        <span className="hover:text-rose-300 transition-colors border-b border-dotted border-rose-500">PS</span>
                      </th>
                      <th className="py-4 px-3 text-center text-amber-400 cursor-help" title="SG — Saldo de Pontos (Pontos Marcados menos Pontos Sofridos)">
                        <span className="hover:text-amber-300 transition-colors border-b border-dotted border-amber-500">SG</span>
                      </th>
                      <th className="py-4 px-4 cursor-help" title="CIDADE — Município de origem da equipe">
                        <span className="hover:text-white transition-colors border-b border-dotted border-zinc-500">CIDADE</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {classificacao.map((item) => {
                      const isTop1 = item.posicao === 1;
                      const isTop2 = item.posicao === 2;
                      const isTop3 = item.posicao === 3;
                      const isTop4 = item.posicao === 4;
                      const isTop5 = item.posicao === 5;
                      const isTop8 = item.posicao <= 8;

                      // Cores e estilos de linha para cada faixa
                      const rowStyle = isTop1
                        ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/5 to-transparent border-l-4 border-l-amber-400'
                        : isTop2
                        ? 'bg-gradient-to-r from-slate-300/20 via-slate-400/5 to-transparent border-l-4 border-l-slate-300'
                        : isTop3
                        ? 'bg-gradient-to-r from-amber-700/20 via-amber-800/5 to-transparent border-l-4 border-l-amber-600'
                        : isTop4
                        ? 'bg-gradient-to-r from-teal-500/15 via-teal-500/5 to-transparent border-l-4 border-l-teal-400'
                        : isTop5
                        ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border-l-4 border-l-emerald-400'
                        : isTop8
                        ? 'bg-emerald-500/[0.03] border-l-4 border-l-emerald-600/60'
                        : 'hover:bg-white/[0.02] border-l-4 border-l-transparent';

                      return (
                        <tr 
                          key={item.equipe.id} 
                          className={`transition-all group ${rowStyle}`}
                        >
                          {/* 1. Posição */}
                          <td className="py-4 px-4 text-center font-black">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black shadow-md ${
                              isTop1 
                                ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-black shadow-amber-400/40 ring-2 ring-amber-300/80 scale-105' 
                                : isTop2 
                                ? 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400 text-black ring-2 ring-slate-200/60' 
                                : isTop3 
                                ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white ring-2 ring-amber-600/60' 
                                : isTop4 || isTop5
                                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                                : isTop8
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {item.posicao}º
                            </span>
                          </td>

                          {/* 2. Pontos Totais (PTS) */}
                          <td className="py-4 px-4 text-center font-black text-base text-amber-400 bg-white/5">
                            {item.pontos}
                          </td>

                          {/* 3. Foto, Nome da Equipe e Badges de Premiação */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border ${
                                isTop1 ? 'border-amber-400 ring-2 ring-amber-400/30' : isTop2 ? 'border-slate-300' : isTop3 ? 'border-amber-600' : 'border-white/10'
                              }`}>
                                {item.equipe.foto_url ? (
                                  <img src={item.equipe.foto_url} alt={item.equipe.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <Users size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-white uppercase group-hover:text-amber-300 transition-colors text-sm">
                                    {item.equipe.nome}
                                  </span>
                                  {isTop1 && <span className="text-xs">👑</span>}
                                </div>
                                
                                {/* Badges Detalhadas de Premiação do Torneio */}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {/* Indicação Especial do Pote Acumulado para Top 3 */}
                                  {(isTop1 || isTop2 || isTop3) && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                                      <span>💰 Pote 100% Inscrições + Patrocínios</span>
                                    </span>
                                  )}

                                  {/* Badge de Premiação Bônus */}
                                  {item.premiacaoPosicao ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                                      <span>{item.premiacaoEmoji}</span>
                                      <span>Bônus Prefeitura: {item.premiacaoFormatada}</span>
                                    </span>
                                  ) : null}

                                  {item.isElegivelPremiacao ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                                      <span>✅ Cadastro Regularizado</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-[9px] font-black uppercase tracking-wider" title={item.motivoInelegibilidade}>
                                      <AlertCircle size={10} className="text-red-400" />
                                      <span>⚠️ Sem CPF (Abre mão do Bônus)</span>
                                    </span>
                                  )}

                                  {isTop8 && !isTop1 && !isTop2 && !isTop3 && (
                                    <span className="text-[9px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                                      Top 8 • Mata-Mata
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 4. Jogos (J) */}
                          <td className="py-4 px-3 text-center text-zinc-300 font-semibold">
                            {item.jogos}
                          </td>

                          {/* 5. Vitórias (V) */}
                          <td className="py-4 px-3 text-center text-emerald-400 font-bold">
                            {item.vitorias}
                          </td>

                          {/* 6. Derrotas (D) */}
                          <td className="py-4 px-3 text-center text-red-400/80 font-semibold">
                            {item.derrotas}
                          </td>

                          {/* 7. Pontos Marcados (PM) */}
                          <td className="py-4 px-3 text-center text-zinc-300 font-semibold">
                            {item.pontosMarcados}
                          </td>

                          {/* 8. Pontos Sofridos (PS) */}
                          <td className="py-4 px-3 text-center text-zinc-400 font-semibold">
                            {item.pontosSofridos}
                          </td>

                          {/* 9. Saldo de Pontos (SG) */}
                          <td className="py-4 px-3 text-center font-bold">
                            <span className={item.saldoPontos > 0 ? 'text-emerald-400' : item.saldoPontos < 0 ? 'text-red-400' : 'text-zinc-400'}>
                              {item.saldoPontos > 0 ? `+${item.saldoPontos}` : item.saldoPontos}
                            </span>
                          </td>

                          {/* 10. Cidade */}
                          <td className="py-4 px-4 text-zinc-400 text-xs font-medium">
                            {item.equipe.cidade}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col gap-3">
                {classificacao.map((item) => {
                  const isTop1 = item.posicao === 1;
                  const isTop2 = item.posicao === 2;
                  const isTop3 = item.posicao === 3;
                  const isTop4 = item.posicao === 4;
                  const isTop5 = item.posicao === 5;
                  const isTop8 = item.posicao <= 8;

                  const cardStyle = isTop1
                    ? 'border-amber-400/70 bg-gradient-to-b from-amber-500/15 via-zinc-900 to-zinc-950 shadow-amber-500/10'
                    : isTop2
                    ? 'border-slate-300/70 bg-gradient-to-b from-slate-300/15 via-zinc-900 to-zinc-950'
                    : isTop3
                    ? 'border-amber-600/70 bg-gradient-to-b from-amber-700/15 via-zinc-900 to-zinc-950'
                    : isTop4 || isTop5
                    ? 'border-teal-500/40 bg-zinc-900/90'
                    : isTop8
                    ? 'border-emerald-500/30 bg-zinc-900/90'
                    : 'border-white/10 bg-zinc-900/90';

                  return (
                    <div 
                      key={item.equipe.id} 
                      className={`border rounded-2xl p-4 shadow-xl transition-all ${cardStyle}`}
                    >
                      {/* Faixa Superior de Pote Acumulado e Bônus */}
                      {(isTop1 || isTop2 || isTop3) && (
                        <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 flex items-center justify-between text-xs">
                          <span className="font-black text-amber-300 flex items-center gap-1.5 uppercase">
                            <span>{isTop1 ? '🥇 1º Colocado' : isTop2 ? '🥈 2º Colocado' : '🥉 3º Colocado'}</span>
                            <span className="text-[10px] text-amber-200">• Pote Extra</span>
                          </span>
                          {item.premiacaoFormatada && (
                            <span className="font-black text-white bg-black/50 px-2 py-0.5 rounded-md text-[11px]">
                              Bônus: {item.premiacaoFormatada}
                            </span>
                          )}
                        </div>
                      )}

                      {!isTop1 && !isTop2 && !isTop3 && item.premiacaoPosicao && (
                        <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/40 flex items-center justify-between text-xs">
                          <span className="font-black text-teal-300 flex items-center gap-1.5 uppercase">
                            <span>{item.premiacaoEmoji}</span>
                            <span>{item.premiacaoTitulo}</span>
                          </span>
                          <span className="font-black text-white bg-black/50 px-2 py-0.5 rounded-md text-[11px]">
                            Bônus: {item.premiacaoFormatada}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5 mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-black text-xs shadow-md ${
                            isTop1 
                              ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-black ring-2 ring-amber-300/80 scale-105' 
                              : isTop2 
                              ? 'bg-gradient-to-br from-slate-100 to-slate-400 text-black ring-2 ring-slate-200/60' 
                              : isTop3 
                              ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white ring-2 ring-amber-600/60' 
                              : isTop8 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {item.posicao}º
                          </span>

                          <div className={`w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border ${
                            isTop1 ? 'border-amber-400' : isTop2 ? 'border-slate-300' : isTop3 ? 'border-amber-600' : 'border-white/10'
                          }`}>
                            {item.equipe.foto_url ? (
                              <img src={item.equipe.foto_url} alt={item.equipe.nome} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-500"><Users size={18} /></div>
                            )}
                          </div>

                          <div>
                            <h4 className="font-black text-sm uppercase text-white line-clamp-1">{item.equipe.nome}</h4>
                            <span className="text-[11px] text-zinc-400 line-clamp-1">{item.equipe.cidade}</span>
                            
                            <div className="mt-1">
                              {item.isElegivelPremiacao ? (
                                <span className="text-[9px] font-bold text-emerald-400">✅ Regularizado</span>
                              ) : (
                                <span className="text-[9px] font-bold text-red-400">⚠️ Sem CPF (Sem Bônus)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">Pontos</span>
                          <span className="text-2xl font-black text-amber-400 leading-none">{item.pontos}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 gap-2 text-center bg-black/40 p-2.5 rounded-xl border border-white/5 text-xs">
                        <div title="J — Jogos Disputados">
                          <span className="text-[9px] font-bold text-zinc-500 block uppercase cursor-help border-b border-dotted border-zinc-700">J</span>
                          <span className="font-bold text-white">{item.jogos}</span>
                        </div>
                        <div title="V — Vitórias (3 pontos)">
                          <span className="text-[9px] font-bold text-emerald-500 block uppercase cursor-help border-b border-dotted border-emerald-700">V</span>
                          <span className="font-bold text-emerald-400">{item.vitorias}</span>
                        </div>
                        <div title="D — Derrotas (0 pontos)">
                          <span className="text-[9px] font-bold text-red-500 block uppercase cursor-help border-b border-dotted border-red-700">D</span>
                          <span className="font-bold text-red-400">{item.derrotas}</span>
                        </div>
                        <div title="PM — Pontos Marcados (Goiabadas/tentos)">
                          <span className="text-[9px] font-bold text-teal-400 block uppercase cursor-help border-b border-dotted border-teal-700">PM</span>
                          <span className="font-semibold text-zinc-300">{item.pontosMarcados}</span>
                        </div>
                        <div title="PS — Pontos Sofridos (Tentos levados)">
                          <span className="text-[9px] font-bold text-rose-400 block uppercase cursor-help border-b border-dotted border-rose-700">PS</span>
                          <span className="font-semibold text-zinc-400">{item.pontosSofridos}</span>
                        </div>
                        <div title="SG — Saldo de Pontos (PM - PS)">
                          <span className="text-[9px] font-bold text-amber-500 block uppercase cursor-help border-b border-dotted border-amber-700">SG</span>
                          <span className={`font-bold ${item.saldoPontos > 0 ? 'text-emerald-400' : item.saldoPontos < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                            {item.saldoPontos > 0 ? `+${item.saldoPontos}` : item.saldoPontos}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* Legenda das Siglas & Critérios de Pontuação (Fim da Página) */}
          <div className="w-full mt-10 bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
            
            {/* Bloco 1: Legenda das Siglas */}
            <div>
              <div className="flex items-center gap-2.5 mb-3 text-zinc-200">
                <Info size={16} className="text-teal-400" />
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Legenda das Siglas da Tabela
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-white text-sm">POS</span>
                  <span className="text-[10px] text-zinc-400">Posição</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-amber-500/30 text-center flex flex-col items-center">
                  <span className="font-black text-amber-400 text-sm">PTS</span>
                  <span className="text-[10px] text-amber-300 font-bold">Pontos Totais</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-white text-sm">J</span>
                  <span className="text-[10px] text-zinc-400">Jogos</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-emerald-400 text-sm">V</span>
                  <span className="text-[10px] text-zinc-400">Vitórias</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-red-400 text-sm">D</span>
                  <span className="text-[10px] text-zinc-400">Derrotas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-teal-400 text-sm">PM</span>
                  <span className="text-[10px] text-zinc-400">Pts Marcados</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-rose-400 text-sm">PS</span>
                  <span className="text-[10px] text-zinc-400">Pts Sofridos</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center">
                  <span className="font-black text-amber-400 text-sm">SG</span>
                  <span className="text-[10px] text-zinc-400">Saldo Pontos</span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Regras & Desempate */}
            <div className="pt-4 border-t border-white/5">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-3">
                Regras de Pontuação & Critérios de Desempate
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-zinc-400">
                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="font-bold text-white block mb-1">🎮 Pontuação Oficial</span>
                  <p>Vitória: <strong className="text-emerald-400">3 pontos</strong><br />Derrota: <strong className="text-zinc-400">0 pontos</strong></p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="font-bold text-white block mb-1">⚖️ Critérios de Desempate</span>
                  <p>1º Vitórias (V) &rarr; 2º Saldo de Pontos (SG) &rarr; 3º Pontos Marcados (PM)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                  <span className="font-bold text-white block mb-1">🏆 Avanço para o Mata-Mata</span>
                  <p>Os <strong className="text-amber-400">08 primeiros colocados</strong> avançam para o sorteio do Mata-Mata (Grupos A e B).</p>
                </div>
              </div>
            </div>

            {/* Bloco 3: Regras de Premiação Automática (Bônus R$ 2.500,00 + Pote Acumulado) */}
            <div className="pt-4 border-t border-white/5">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                <span>💰 Regras de Premiação: Bônus Prefeitura (R$ 2.500,00) & Pote Acumulado</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-zinc-400">
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block mb-1">🎁 Bônus Exclusivo (Top 5 com CPF)</span>
                  <p className="leading-relaxed">
                    1º: <strong className="text-white">R$ 1.000,00</strong> • 2º: <strong className="text-white">R$ 600,00</strong><br />
                    3º: <strong className="text-white">R$ 400,00</strong> • 4º: <strong className="text-white">R$ 300,00</strong><br />
                    5º: <strong className="text-white">R$ 200,00</strong> (somente cadastro completo).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block mb-1">🏆 Pote Acumulado (Top 3 Colocados)</span>
                  <p className="leading-relaxed">
                    <strong className="text-white">100% das inscrições + patrocínios</strong> arrecadados serão retidos e destinados como premiação em dinheiro extra para os <strong className="text-amber-400">03 primeiros colocados</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="font-bold text-amber-300 block mb-1">🔄 Regra de Elegibilidade e Pulo</span>
                  <p className="leading-relaxed">
                    O bônus é exclusivo para times com cadastro regularizado. Times sem CPF são ignorados no bônus e o valor transfere para o próximo elegível.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
