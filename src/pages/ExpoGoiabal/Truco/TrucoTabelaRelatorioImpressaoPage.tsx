import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  type TrucoClassificacaoRow, 
  type TrucoEquipe, 
  type TrucoPartida,
  buscarEquipes, 
  buscarPartidas, 
  calcularClassificacao,
  subscribeToTrucoChanges 
} from '../../../services/trucoService';
import { 
  Printer, 
  ArrowLeft, 
  Trophy, 
  ShieldAlert
} from 'lucide-react';

export const TrucoTabelaRelatorioImpressaoPage: React.FC = () => {
  const navigate = useNavigate();

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
      console.error('Erro ao carregar dados da tabela para impressão:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  const classificacao: TrucoClassificacaoRow[] = useMemo(() => {
    return calcularClassificacao(equipes, partidas);
  }, [equipes, partidas]);

  const partidasPrimeiraFase = partidas.filter(p => p.tipo_fase === 'primeira_fase');
  const totalJogos = partidasPrimeiraFase.length;
  const concluidos = partidasPrimeiraFase.filter(
    p => p.status === 'finalizada' || (Number(p.pontos_time_a) > 0 || Number(p.pontos_time_b) > 0) || p.vencedor_id !== null
  ).length;

  const dataAtualTexto = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaAtualTexto = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black print:bg-white print:text-black">
      
      {/* BARRA DE CONTROLE SUPERIOR (OCULTA NA IMPRESSÃO) */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-4 py-3.5 print:hidden shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ExpoGoiabal/Truco/Tabela')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-black uppercase tracking-wider cursor-pointer border border-white/10"
              title="Voltar para a Tabela"
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-white flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" />
                <span>Relatório da Tabela • 1 Página A4</span>
              </h1>
              <p className="text-zinc-400 text-xs">
                Classificação oficial pronta para impressão física ou PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Printer size={16} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO DOCUMENTO A4 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 print:p-0 print:max-w-none">
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 print:hidden">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Carregando dados da tabela oficial...
            </span>
          </div>
        ) : classificacao.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 print:text-black">
            <ShieldAlert size={32} className="mx-auto mb-3 text-amber-400" />
            <h2 className="text-lg font-black uppercase text-white print:text-black">Nenhuma equipe classificada</h2>
            <p className="text-xs mt-1">Aguardando início das rodadas e cadastro das equipes.</p>
          </div>
        ) : (
          <article className="bg-zinc-900/90 print:bg-white border border-white/10 print:border-none rounded-2xl p-4 sm:p-6 print:p-2 shadow-2xl print:shadow-none text-zinc-100 print:text-black">
            
            {/* CABEÇALHO OFICIAL DO DOCUMENTO */}
            <div className="border-b-2 border-amber-500 print:border-black pb-2.5 mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-black shadow-md print:border print:border-black shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 print:text-zinc-700 block">
                    EXPOGOIABAL 2026 • 2º TORNEIO DE TRUCO
                  </span>
                  <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black leading-tight">
                    Tabela Oficial de Classificação Geral
                  </h2>
                </div>
              </div>

              {/* METADADOS RÁPIDOS */}
              <div className="text-right text-[9px] sm:text-[10px] text-zinc-400 print:text-zinc-700">
                <div><strong>Emissão:</strong> {dataAtualTexto} às {horaAtualTexto}</div>
                <div><strong>Progresso 1ª Fase:</strong> {concluidos}/{totalJogos} Jogos Realizados</div>
              </div>
            </div>

            {/* TABELA DE CLASSIFICAÇÃO COMPACTA PARA CABER EM 1 PÁGINA */}
            <div className="w-full overflow-hidden border border-white/10 print:border-black rounded-xl print:rounded-none">
              <table className="w-full text-left border-collapse text-[10px] sm:text-[11px] print:text-[9.5px]">
                <thead>
                  <tr className="bg-zinc-950 print:bg-zinc-200 border-b border-white/10 print:border-black text-[9px] sm:text-[10px] print:text-[8.5px] font-black uppercase tracking-wider text-zinc-400 print:text-black">
                    <th className="py-1 px-2 text-center w-7">POS</th>
                    <th className="py-1 px-2 font-black text-amber-400 print:text-black bg-white/5 print:bg-transparent text-center w-8">PTS</th>
                    <th className="py-1 px-2">EQUIPE</th>
                    <th className="py-1 px-1 text-center w-6" title="Jogos">J</th>
                    <th className="py-1 px-1 text-center text-emerald-400 print:text-black w-6" title="Vitórias">V</th>
                    <th className="py-1 px-1 text-center text-yellow-400 print:text-black w-6" title="Empates">E</th>
                    <th className="py-1 px-1 text-center text-red-400 print:text-black w-6" title="Derrotas">D</th>
                    <th className="py-1 px-1 text-center text-teal-400 print:text-black w-7" title="Pontos Marcados">PM</th>
                    <th className="py-1 px-1 text-center text-rose-400 print:text-black w-7" title="Pontos Sofridos">PS</th>
                    <th className="py-1 px-1 text-center text-amber-400 print:text-black w-7" title="Saldo de Pontos">SG</th>
                    <th className="py-1 px-2 text-right w-24">CIDADE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-zinc-300">
                  {classificacao.map((item) => {
                    const isTop1 = item.posicao === 1;
                    const isTop2 = item.posicao === 2;
                    const isTop3 = item.posicao === 3;
                    const isTop8 = item.posicao <= 8;

                    return (
                      <tr 
                        key={item.equipe.id}
                        className={`transition-colors ${
                          isTop1 
                            ? 'bg-amber-500/10 print:bg-zinc-100 font-bold' 
                            : isTop2 
                            ? 'bg-slate-400/10 print:bg-zinc-50' 
                            : isTop3 
                            ? 'bg-amber-700/10 print:bg-zinc-50' 
                            : isTop8 
                            ? 'bg-emerald-500/[0.04] print:bg-white' 
                            : 'hover:bg-white/[0.02] print:bg-white text-zinc-400 print:text-zinc-800'
                        }`}
                      >
                        
                        {/* POSIÇÃO */}
                        <td className="py-1.5 px-2 text-center font-black">
                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-black ${
                            isTop1
                              ? 'bg-amber-400 text-black font-black print:border print:border-black'
                              : isTop2
                              ? 'bg-slate-300 text-black print:border print:border-black'
                              : isTop3
                              ? 'bg-amber-600 text-white print:border print:border-black'
                              : isTop8
                              ? 'bg-emerald-500/20 text-emerald-400 print:text-black font-bold'
                              : 'text-zinc-500 print:text-zinc-600'
                          }`}>
                            {item.posicao}º
                          </span>
                        </td>

                        {/* PONTOS */}
                        <td className="py-1.5 px-2 text-center font-black text-amber-400 print:text-black bg-white/5 print:bg-transparent">
                          {item.pontos}
                        </td>

                        {/* NOME DA EQUIPE */}
                        <td className="py-1.5 px-2">
                          <span className="font-black text-white print:text-black uppercase leading-tight truncate block">
                            {item.equipe.nome}
                          </span>
                        </td>

                        {/* JOGOS */}
                        <td className="py-1 px-1 text-center font-bold text-zinc-300 print:text-black">
                          {item.jogos}
                        </td>

                        {/* VITÓRIAS */}
                        <td className="py-1 px-1 text-center font-bold text-emerald-400 print:text-black">
                          {item.vitorias}
                        </td>

                        {/* EMPATES */}
                        <td className="py-1 px-1 text-center font-medium text-yellow-400 print:text-black">
                          {item.empates}
                        </td>

                        {/* DERROTAS */}
                        <td className="py-1 px-1 text-center font-medium text-red-400 print:text-black">
                          {item.derrotas}
                        </td>

                        {/* PONTOS MARCADOS (PM) */}
                        <td className="py-1 px-1 text-center font-mono text-zinc-300 print:text-black">
                          {item.pontosMarcados}
                        </td>

                        {/* PONTOS SOFRIDOS (PS) */}
                        <td className="py-1 px-1 text-center font-mono text-zinc-400 print:text-black">
                          {item.pontosSofridos}
                        </td>

                        {/* SALDO DE PONTOS (SG) */}
                        <td className={`py-1 px-1 text-center font-mono font-bold ${
                          item.saldoPontos > 0 
                            ? 'text-emerald-400 print:text-black' 
                            : item.saldoPontos < 0 
                            ? 'text-red-400 print:text-black' 
                            : 'text-zinc-400 print:text-black'
                        }`}>
                          {item.saldoPontos > 0 ? `+${item.saldoPontos}` : item.saldoPontos}
                        </td>

                        {/* CIDADE */}
                        <td className="py-1 px-2 text-right text-[8.5px] sm:text-[9.5px] print:text-[8.5px] text-zinc-400 print:text-zinc-600 truncate">
                          {item.equipe.cidade || '—'}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* LEGENDA E CRITÉRIOS DE DESEMPATE CONCISOS */}
            <div className="mt-2.5 pt-2 border-t border-white/10 print:border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[8px] sm:text-[9px] print:text-[8px] text-zinc-400 print:text-zinc-700">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span><strong>Critérios de Desempate:</strong> 1º Pontos • 2º Vitórias • 3º Saldo de Tentos • 4º Tentos Pró • 5º Confronto Direto</span>
              </div>
              <div className="flex items-center gap-2">
                <span><strong>Legenda:</strong> POS (Posição) • PTS (Pontos) • J (Jogos) • V (Vitórias) • E (Empates) • D (Derrotas) • PM (Pró) • PS (Contra) • SG (Saldo)</span>
              </div>
            </div>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="mt-2 pt-1.5 border-t border-white/5 print:border-zinc-300 flex items-center justify-between text-[8px] text-zinc-500 print:text-zinc-600">
              <span>ExpoGoiabal 2026 • Sistema Oficial de Gestão de Torneios</span>
              <span>Documento gerado automaticamente em {dataAtualTexto} às {horaAtualTexto}</span>
            </div>

          </article>
        )}

      </main>

    </div>
  );
};
