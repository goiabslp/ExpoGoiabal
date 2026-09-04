import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  FileText, 
  Trophy, 
  Users, 
  Calendar, 
  Swords, 
  Award, 
  Building2, 
  AlertTriangle 
} from 'lucide-react';

export const TrucoRegulamentoRelatorioImpressaoPage: React.FC = () => {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500 selection:text-black font-sans print:bg-white print:text-black">
      
      {/* ESTILOS DE IMPRESSÃO ESPECÍFICOS PARA FORMATO A4 E ALTO CONTRASTE */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
          }
          .print-hidden {
            display: none !important;
          }
          .print-card-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 12px !important;
          }
          .print-chapter-title {
            color: #000000 !important;
            border-bottom: 2px solid #000000 !important;
          }
          .print-text-bold {
            font-weight: 800 !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* BARRA SUPERIOR DE CONTROLE (OCULTA NA IMPRESSÃO) */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-white/10 px-4 py-3.5 print:hidden shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ExpoGoiabal/Truco/Regulamento')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-black uppercase tracking-wider cursor-pointer border border-white/10"
              title="Voltar para a página do Regulamento"
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-white flex items-center gap-2">
                <FileText size={18} className="text-amber-400" />
                <span>Relatório do Regulamento Oficial • Versão para Impressão</span>
              </h1>
              <p className="text-zinc-400 text-xs">
                Documento formatado em alto contraste, perfeito para PDF e impressão física
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              title="Imprimir ou salvar como PDF"
            >
              <Printer size={16} />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO DOCUMENTO (OTIMIZADA PARA LEITURA E IMPRESSÃO) */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-full">
        <article className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-0">
          
          {/* CABEÇALHO OFICIAL DO DOCUMENTO */}
          <div className="border-b-2 border-amber-500/40 print:border-black pb-5 mb-6 text-center print-card-break">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10 print:border-zinc-300">
              
              <div className="flex items-center gap-3">
                <img 
                  src="/logo_expo.png" 
                  alt="ExpoGoiabal 2026" 
                  className="h-14 sm:h-16 object-contain print:h-12"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 print:text-black block">
                    Prefeitura Municipal de São José do Goiabal - MG
                  </span>
                  <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black leading-tight">
                    Administração 2025–2028 • Incentivo ao Esporte
                  </h2>
                  <span className="text-[10px] text-zinc-400 print:text-zinc-700 font-medium">
                    Secretaria de Administração • Departamento de Esportes
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right text-[10px] font-mono text-zinc-400 print:text-black">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 print:bg-zinc-100 print:border-black print:text-black font-black uppercase tracking-wider mb-1">
                  Documento Oficial
                </span>
                <div>Emissão: {dataAtualTexto} às {horaAtualTexto}</div>
              </div>

            </div>

            <div className="mt-4">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white print:text-black">
                📜 REGULAMENTO OFICIAL DE COMPETIÇÃO
              </h1>
              <p className="text-sm sm:text-base font-bold text-amber-400 print:text-black uppercase tracking-wide mt-1">
                2º Torneio Regional de Truco da ExpoGoiabal 2026
              </p>
            </div>
          </div>

          {/* LISTA DE CAPÍTULOS E NORMAS */}
          <div className="flex flex-col gap-5 print:gap-4 text-xs sm:text-sm text-zinc-200 print:text-black">

            {/* CAPÍTULO I: REALIZAÇÃO E COMISSÃO */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <Building2 size={18} className="text-amber-400 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo I • Realização & Comissão Organizadora
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block text-xs uppercase font-black mb-1">
                    🏛️ Realização e Promoção
                  </strong>
                  <p className="text-zinc-300 print:text-zinc-900 leading-relaxed text-xs">
                    <strong>Prefeitura Municipal de São José do Goiabal - MG</strong><br />
                    Administração 2025–2028 • Incentivo ao Esporte e Tradição Regional.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block text-xs uppercase font-black mb-1">
                    🤝 Organizadores Convidados
                  </strong>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <strong className="text-amber-300 print:text-black font-black">Ricardo Moraes</strong>
                      <span className="text-zinc-400 print:text-zinc-800 block text-[11px]">Coordenação Técnica Geral e Arbitragem Convidada</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 print:border-zinc-300">
                      <div>
                        <strong className="text-amber-300 print:text-black font-black block">Ademir Fraga</strong>
                        <span className="text-zinc-400 print:text-zinc-800 text-[10px]">Organizador Convidado</span>
                      </div>
                      <div>
                        <strong className="text-amber-300 print:text-black font-black block">Matheus Ermelindo</strong>
                        <span className="text-zinc-400 print:text-zinc-800 text-[10px]">Organizador Convidado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-zinc-300 md:col-span-2">
                  <strong className="text-white print:text-black block text-xs uppercase font-black mb-1.5">
                    🛡️ Organizadores Internos da Prefeitura
                  </strong>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-black/20 print:bg-white print:border print:border-zinc-300">
                      <strong className="text-white print:text-black block">Guilherme Santos</strong>
                      <span className="text-zinc-400 print:text-zinc-700 text-[11px]">Secretário Administrativo</span>
                    </div>
                    <div className="p-2 rounded bg-black/20 print:bg-white print:border print:border-zinc-300">
                      <strong className="text-white print:text-black block">Ildamara Fragoso</strong>
                      <span className="text-zinc-400 print:text-zinc-700 text-[11px]">Chefe do Departamento de Esportes</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CAPÍTULO II: CRONOGRAMA & DATAS */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <Calendar size={18} className="text-emerald-400 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo II • Cronograma, Local & Datas das Partidas
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-zinc-300">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 print:text-black block mb-0.5">📅 Início Oficial</span>
                  <span className="text-xs sm:text-sm font-black text-white print:text-black block">03 de Setembro de 2026</span>
                  <span className="text-zinc-400 print:text-zinc-800 text-[11px]">Primeira quinta-feira de setembro de 2026.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-zinc-300">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 print:text-black block mb-0.5">⏰ Dias & Horário dos Jogos</span>
                  <span className="text-xs sm:text-sm font-black text-white print:text-black block">Terças e Quintas às 19:00</span>
                  <span className="text-zinc-400 print:text-zinc-800 text-[11px]">Rodadas com transmissão de súmula e placar.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-zinc-300">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 print:text-black block mb-0.5">📍 Local Oficial</span>
                  <span className="text-xs sm:text-sm font-black text-white print:text-black block">São José do Goiabal - MG</span>
                  <span className="text-zinc-400 print:text-zinc-800 text-[11px]">Espaço Oficial de Jogos da ExpoGoiabal 2026.</span>
                </div>
              </div>
            </section>

            {/* CAPÍTULO III: COMPOSIÇÃO DOS TIMES & INSCRIÇÕES */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <Users size={18} className="text-teal-400 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo III • Composição das Equipes & Inscrição
                </h2>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 print:bg-zinc-50 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block font-bold mb-0.5">1. Formação Oficial do Time</strong>
                  <p className="text-zinc-300 print:text-zinc-900 leading-relaxed">
                    Cada equipe deve ser composta obrigatoriamente por <strong>04 (quatro) jogadores titulares</strong>, podendo registrar atletas reservas adicionais.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 print:bg-zinc-50 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block font-bold mb-0.5">2. Exigência de Quantidade Par de Equipes</strong>
                  <p className="text-zinc-300 print:text-zinc-900 leading-relaxed">
                    Para assegurar o sorteio matemático e o formato de todos-contra-todos sem folga (bye), o torneio exige uma quantidade estritamente <strong>PAR de times inscritos</strong> (mínimo de 4 times).
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 print:bg-zinc-50 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block font-bold mb-0.5">3. Origem Geográfica dos Atletas</strong>
                  <p className="text-zinc-300 print:text-zinc-900 leading-relaxed">
                    O torneio é aberto a equipes de <strong>São José do Goiabal</strong> e de todos os <strong>853 municípios de Minas Gerais (MG)</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 print:bg-zinc-100 print:border print:border-black text-amber-200 print:text-black">
                  <strong className="text-amber-400 print:text-black block text-xs font-black uppercase mb-1">
                    💵 Taxa de Inscrição: R$ 160,00 por Equipe
                  </strong>
                  <p className="leading-relaxed text-zinc-200 print:text-zinc-900">
                    O valor da taxa de inscrição é de <strong>R$ 160,00 (cento e sessenta reais)</strong> por time, a ser pago diretamente com o organizador <strong>Ricardo Moraes</strong>. <strong>100% do valor arrecadado nas inscrições + os patrocínios adquiridos serão integralmente convertidos em premiação para os primeiros colocados!</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* CAPÍTULO IV: REGRA DE CPF & ELEGIBILIDADE */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <AlertTriangle size={18} className="text-amber-400 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo IV • Regra de Premiação: Pote Geral (Top 4) vs Bônus da Prefeitura (Top 5 com CPF)
                </h2>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 print:bg-zinc-50 print:border print:border-zinc-300 text-zinc-200 print:text-black">
                  <strong className="text-emerald-400 print:text-black block font-bold mb-0.5 uppercase">
                    💰 1. Pote de Inscrições + Patrocínios (Garantido para os 4 Primeiros)
                  </strong>
                  <p className="leading-relaxed">
                    A premiação do pote arrecadado (100% das inscrições + patrocínios) será entregue aos <strong>04 primeiros colocados (1º, 2º, 3º e 4º lugares)</strong> da competição, <strong>independentemente do cadastro estar completo com CPF ou não</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 print:bg-zinc-50 print:border print:border-zinc-300 text-zinc-200 print:text-black">
                  <strong className="text-amber-400 print:text-black block font-bold mb-0.5 uppercase">
                    🎁 2. BÔNUS Especial da Prefeitura (R$ 2.500,00 - Exclusivo com CPF)
                  </strong>
                  <p className="leading-relaxed">
                    O bônus financeiro garantido pela Prefeitura (R$ 2.500,00) será concedido <strong>exclusivamente aos 05 melhores times com cadastro 100% regularizado (com CPF informado de todos os atletas)</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 print:bg-zinc-100 print:border print:border-black text-zinc-300 print:text-black">
                  <strong className="text-white print:text-black block font-black uppercase mb-0.5">
                    🔄 Regra de Pulo e Transferência do Bônus:
                  </strong>
                  <p className="leading-relaxed">
                    Se um time terminar entre os melhores colocados sem CPF, ele <strong>recebe normalmente sua premiação do Pote de Inscrições + Patrocínios (se estiver no Top 4)</strong>, mas abre mão do <strong>Bônus da Prefeitura</strong>, o qual é transferido automaticamente para o próximo time elegível com cadastro completo.
                  </p>
                </div>
              </div>
            </section>

            {/* CAPÍTULO V: PREMIAÇÃO OFICIAL */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <Trophy size={18} className="text-amber-400 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo V • Premiação Oficial: Pote Acumulado & Bônus da Prefeitura
                </h2>
              </div>

              {/* Tabela de Premiações */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/10 print:bg-zinc-200 border-b border-white/20 print:border-black text-white print:text-black font-black uppercase">
                      <th className="py-2 px-3">Posição</th>
                      <th className="py-2 px-3 text-center">Pote Inscrições + Patrocínios</th>
                      <th className="py-2 px-3 text-center">Bônus Prefeitura (com CPF)</th>
                      <th className="py-2 px-3 text-right">Troféu Oficial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 print:divide-zinc-300 text-zinc-300 print:text-black">
                    <tr className="print:bg-zinc-50 font-bold">
                      <td className="py-2 px-3">🥇 1º Colocado</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-400 print:text-black">Porcentagem Maior do Pote</td>
                      <td className="py-2 px-3 text-center font-black text-amber-300 print:text-black">R$ 1.000,00</td>
                      <td className="py-2 px-3 text-right">Troféu de Campeão</td>
                    </tr>
                    <tr className="font-medium">
                      <td className="py-2 px-3">🥈 2º Colocado</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-400 print:text-black">Porcentagem do Pote</td>
                      <td className="py-2 px-3 text-center font-black text-amber-300 print:text-black">R$ 600,00</td>
                      <td className="py-2 px-3 text-right">Troféu de Vice-Campeão</td>
                    </tr>
                    <tr className="font-medium">
                      <td className="py-2 px-3">🥉 3º Colocado</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-400 print:text-black">Porcentagem do Pote</td>
                      <td className="py-2 px-3 text-center font-black text-amber-300 print:text-black">R$ 400,00</td>
                      <td className="py-2 px-3 text-right">Troféu de 3º Lugar</td>
                    </tr>
                    <tr className="font-medium">
                      <td className="py-2 px-3">🏅 4º Colocado</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-400 print:text-black">Porcentagem do Pote</td>
                      <td className="py-2 px-3 text-center font-black text-amber-300 print:text-black">R$ 300,00</td>
                      <td className="py-2 px-3 text-right">Bônus Especial</td>
                    </tr>
                    <tr className="font-medium">
                      <td className="py-2 px-3">🏅 5º Colocado</td>
                      <td className="py-2 px-3 text-center text-zinc-500 print:text-zinc-600">—</td>
                      <td className="py-2 px-3 text-center font-black text-amber-300 print:text-black">R$ 200,00</td>
                      <td className="py-2 px-3 text-right">Bônus Especial</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* CAPÍTULO VI: FORMATO DE DISPUTA */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <Swords size={18} className="text-rose-400 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo VI • Formato de Disputa & Critérios de Classificação
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-50 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block uppercase font-bold mb-1">
                    1ª Fase: Todos contra Todos (Pontos Corridos)
                  </strong>
                  <ul className="space-y-1 list-disc list-inside text-zinc-300 print:text-zinc-900 leading-relaxed">
                    <li>Todas as equipes se enfrentam em rodadas simultâneas.</li>
                    <li><strong>Vitória:</strong> 3 pontos na tabela geral.</li>
                    <li><strong>Empate:</strong> 1 ponto na tabela geral.</li>
                    <li><strong>Derrota:</strong> 0 pontos na tabela geral.</li>
                    <li><strong>Critérios de Desempate:</strong> 1º Pontos &rarr; 2º Vitórias &rarr; 3º Saldo de Tentos &rarr; 4º Tentos Pró &rarr; 5º Confronto Direto &rarr; 6º Sorteio.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/5 print:bg-zinc-50 print:border print:border-zinc-300">
                  <strong className="text-white print:text-black block uppercase font-bold mb-1">
                    2ª Fase: Top 8 & Mata-Mata Eliminatório
                  </strong>
                  <ul className="space-y-1 list-disc list-inside text-zinc-300 print:text-zinc-900 leading-relaxed">
                    <li>Os <strong>08 melhores colocados</strong> avançam para as eliminatórias.</li>
                    <li><strong>Cruzamento Olímpico Oficial:</strong></li>
                    <li>Chave A: 1º × 8º e 4º × 5º.</li>
                    <li>Chave B: 2º × 7º e 3º × 6º.</li>
                    <li><strong>Finais de Grupo:</strong> Vencedores avançam para a Grande Final.</li>
                    <li><strong>Grande Final:</strong> Campeão Chave A × Campeão Chave B consagram o Campeão Supremo.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* CAPÍTULO VII: DISPOSIÇÕES FINAIS E DISCIPLINA */}
            <section className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 print:bg-white print:border print:border-zinc-400 print-card-break">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-white/10 print:border-zinc-300">
                <Award size={18} className="text-zinc-300 print:text-black shrink-0" />
                <h2 className="text-sm sm:text-base font-black uppercase text-white print:text-black">
                  Capítulo VII • Disposições Finais & Disciplina
                </h2>
              </div>
              <div className="space-y-2 text-xs text-zinc-300 print:text-zinc-900 leading-relaxed">
                <p>
                  1. O torneio adota as regras consagradas e tradicionais do <strong>Truco Mineiro</strong>, disputado em partidas até 12 pontos (tentos/goiabadas).
                </p>
                <p>
                  2. Casos omissos ou situações disciplinares não previstas neste regulamento serão deliberadas de maneira soberana e irrecorrível pela <strong>Comissão Organizadora</strong> (Prefeitura Municipal de São José do Goiabal e coordenação técnica).
                </p>
                <p>
                  3. O espírito de respeito, confraternização e desportivismo deve prevalecer entre todos os atletas, mesários, torcida e organizadores durante toda a ExpoGoiabal 2026.
                </p>
              </div>
            </section>

            {/* RODAPÉ DO DOCUMENTO */}
            <div className="mt-4 pt-3 border-t border-white/10 print:border-zinc-300 flex flex-col sm:flex-row items-center justify-between text-[9px] text-zinc-400 print:text-zinc-600 gap-2 print-card-break">
              <span>Prefeitura Municipal de São José do Goiabal • ExpoGoiabal 2026</span>
              <span>Documento oficial gerado automaticamente em {dataAtualTexto} às {horaAtualTexto}</span>
            </div>

          </div>

        </article>
      </main>

    </div>
  );
};
