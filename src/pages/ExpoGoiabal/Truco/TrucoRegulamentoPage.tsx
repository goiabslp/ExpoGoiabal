import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { 
  FileText, 
  Trophy, 
  Users, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Swords, 
  Award, 
  Building2, 
  UserCheck, 
  Printer, 
  Sparkles
} from 'lucide-react';

export const TrucoRegulamentoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-emerald-500 selection:text-black">
      <Header />

      {/* Decorative Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80 pointer-events-none"
        style={{ backgroundImage: 'url(/truco.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/60 via-black/45 to-zinc-950/95 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),transparent)] pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col items-center pt-28 pb-20 px-3 sm:px-4">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center">

          <TrucoBackButton to="/ExpoGoiabal/Truco" label="Voltar para o Torneio" />

          {/* ESTILOS DE IMPRESSÃO EMBUTIDOS */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 10mm 12mm 10mm;
              }
              header, nav, .print-hidden, [data-truco-back-button] {
                display: none !important;
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .chapter-card {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                background: #ffffff !important;
                border: 1px solid #d1d5db !important;
                color: #000000 !important;
                box-shadow: none !important;
                margin-bottom: 16px !important;
              }
              .chapter-card * {
                color: #000000 !important;
              }
            }
          `}</style>

          {/* Header do Regulamento */}
          <div className="w-full text-center max-w-3xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-3 duration-500 print:mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest mb-3 shadow-lg shadow-amber-500/10 print:hidden">
              <FileText size={14} />
              <span>Documento Oficial • ExpoGoiabal 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white print:text-black mb-3 leading-tight">
              📜 Regulamento Oficial
            </h1>
            <p className="text-base sm:text-lg font-bold text-amber-400 print:text-black uppercase tracking-wide">
              2º Torneio Regional de Truco da ExpoGoiabal 2026
            </p>
            <p className="text-zinc-400 print:text-zinc-700 text-xs sm:text-sm mt-2 max-w-2xl mx-auto">
              Normas, etapas de disputa, formação de equipes, regras de elegibilidade e premiações oficiais da competição promovida pela Prefeitura Municipal de São José do Goiabal.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 print:hidden">
              <button
                onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Regulamento/Imprimir'); }}
                className="px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-105"
                title="Imprimir Regulamento Oficial ou Salvar em PDF"
              >
                <Printer size={15} />
                <span>Imprimir Regulamento / Salvar PDF</span>
              </button>
            </div>
          </div>

          {/* Grade de Seções do Regulamento */}
          <div className="w-full flex flex-col gap-6">

            {/* SEÇÃO 1: REALIZAÇÃO E COMISSÃO ORGANIZADORA */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Capítulo I</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Realização & Comissão Organizadora
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-zinc-300">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-xs">
                    <Building2 size={16} className="text-emerald-400" />
                    <span>Realização e Promoção</span>
                  </div>
                  <p className="text-zinc-300 font-medium leading-relaxed">
                    <strong>Prefeitura Municipal de São José do Goiabal - MG</strong><br />
                    Administração 2025–2028 • Incentivo ao Esporte e Tradição Regional.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-xs">
                    <UserCheck size={16} className="text-amber-400" />
                    <span>Organizadores Convidados</span>
                  </div>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <strong className="text-amber-300 block font-bold text-sm">Ricardo Moraes</strong>
                      <span className="text-[11px] text-zinc-400 leading-tight block">Coordenação Técnica Geral e Arbitragem Convidada</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <strong className="text-amber-300 block font-bold text-sm">Ademir Fraga</strong>
                        <span className="text-[11px] text-zinc-400 leading-tight block">Organizador Convidado</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <strong className="text-amber-300 block font-bold text-sm">Matheus Ermelindo</strong>
                        <span className="text-[11px] text-zinc-400 leading-tight block">Organizador Convidado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-xs">
                    <ShieldCheck size={16} className="text-teal-400" />
                    <span>Organizadores Internos da Prefeitura</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <strong className="text-white block">Guilherme Santos</strong>
                      <span className="text-xs text-zinc-400">Secretário Administrativo</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                      <strong className="text-white block">Ildamara Fragoso</strong>
                      <span className="text-xs text-zinc-400">Chefe do Departamento de Esportes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: CRONOGRAMA & DATAS */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Capítulo II</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Cronograma, Local & Datas das Partidas
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">📅 Início Oficial</span>
                  <span className="text-base font-black text-white">03 de Setembro de 2026</span>
                  <span className="text-zinc-400 text-xs">Primeira quinta-feira de setembro de 2026.</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">⏰ Dias de Jogos</span>
                  <span className="text-base font-black text-white">Terças e Quintas-feiras</span>
                  <span className="text-zinc-400 text-xs">Rodadas simultâneas semanais com transmissão de placar.</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">📍 Local do Evento</span>
                  <span className="text-base font-black text-white">São José do Goiabal - MG</span>
                  <span className="text-zinc-400 text-xs">Espaço Oficial de Jogos da ExpoGoiabal 2026.</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: COMPOSIÇÃO DOS TIMES & INSCRIÇÕES */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 block">Capítulo III</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Composição das Equipes & Inscrição
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 text-xs sm:text-sm text-zinc-300">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/5">
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Formação Oficial do Time</strong>
                    <span>Cada equipe deve ser composta obrigatoriamente por <strong>04 (quatro) jogadores titulares</strong>, podendo registrar atletas reservas adicionais.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/5">
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Exigência de Quantidade Par de Equipes</strong>
                    <span>Para assegurar o sorteio matemático e o formato de todos-contra-todos sem folga (bye), o torneio exige uma quantidade estritamente <strong>PAR de times inscritos</strong> (mínimo de 4 times).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/30 border border-white/5">
                  <CheckCircle2 size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Origem Geográfica</strong>
                    <span>O torneio é aberto a equipes de <strong>São José do Goiabal</strong> e de todos os <strong>853 municípios de Minas Gerais (MG)</strong>.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                  <div className="text-lg">💵</div>
                  <div>
                    <strong className="text-amber-400 block mb-0.5 uppercase tracking-wide text-xs">
                      Taxa de Inscrição: R$ 160,00 por Equipe
                    </strong>
                    <span className="leading-relaxed text-xs">
                      O valor da taxa de inscrição é de <strong>R$ 160,00 (cento e sessenta reais)</strong> por time, a ser pago diretamente com o organizador <strong className="text-white">Ricardo Moraes</strong>. <strong>100% do valor arrecadado nas inscrições + os patrocínios adquiridos serão integralmente convertidos em premiação para os primeiros colocados!</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: REGRA DE CPF & ELEGIBILIDADE AO BÔNUS */}
            <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900/90 to-zinc-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/30">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Capítulo IV • Regra de Premiação</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Pote Geral (Top 4) vs Bônus da Prefeitura (Top 5 com CPF)
                  </h2>
                </div>
              </div>

              <div className="flex flex-col gap-4 text-xs sm:text-sm text-zinc-300">
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/40">
                  <h4 className="font-black text-emerald-400 uppercase text-xs mb-1.5 flex items-center gap-2">
                    <span>💰 1. Pote de Inscrições + Patrocínios (Garantido para os 4 Primeiros)</span>
                  </h4>
                  <p className="leading-relaxed text-zinc-200">
                    A premiação do pote arrecadado (100% das inscrições + patrocínios) será entregue aos <strong>04 primeiros colocados (1º, 2º, 3º e 4º lugares)</strong> da competição, <strong>independentemente do cadastro estar completo com CPF ou não</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/40">
                  <h4 className="font-black text-amber-400 uppercase text-xs mb-1.5 flex items-center gap-2">
                    <span>🎁 2. BÔNUS Especial da Prefeitura (R$ 2.500,00 - Exclusivo com CPF)</span>
                  </h4>
                  <p className="leading-relaxed text-zinc-200">
                    O bônus financeiro garantido pela Prefeitura (R$ 2.500,00) será concedido <strong>exclusivamente aos 05 melhores times com cadastro 100% regularizado (com CPF informado)</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                  <strong className="block text-amber-400 uppercase text-xs font-black mb-1">
                    🔄 Regra de Pulo e Transferência do Bônus:
                  </strong>
                  <p className="leading-relaxed">
                    Se um time terminar entre os melhores colocados sem CPF, ele <strong>recebe normalmente sua premiação do Pote de Inscrições + Patrocínios (se estiver no Top 4)</strong>, mas abre mão do <strong>Bônus da Prefeitura</strong>, o qual é transferido automaticamente para o próximo time elegível com cadastro completo.
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: PREMIAÇÃO OFICIAL */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/30">
                  <Trophy size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Capítulo V</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Premiação Oficial: Pote Acumulado (Top 4) & Bônus da Prefeitura
                  </h2>
                </div>
              </div>

              {/* Bloco A: Pote Acumulado Extra (100% Inscrições + Patrocínios para os 4 Primeiros - Geral) */}
              <div className="p-5 mb-6 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wide">
                    <Award size={16} className="text-emerald-400" />
                    <span>💰 Pote Adicional Acumulado: 100% Inscrições + Patrocínios</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase">
                    Para os 4 Primeiros • Com ou Sem CPF
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                  <strong>100% do valor arrecadado nas inscrições</strong> mais <strong>todos os patrocínios adquiridos</strong> serão retidos e convertidos integralmente em premiação em dinheiro para os <strong>04 primeiros colocados (1º, 2º, 3º e 4º lugares)</strong>, <strong>independentemente do cadastro estar completo ou não</strong>!
                </p>
              </div>

              {/* Bloco B: Premiação BÔNUS da Prefeitura (R$ 2.500,00 - Cadastro Completo) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span>🎁 Premiação BÔNUS Garantida pela Prefeitura (Total: R$ 2.500,00)</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase">
                    Exclusivo Cadastro Completo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-2">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center flex flex-col items-center justify-center gap-1 shadow-md">
                    <span className="text-2xl">🥇</span>
                    <span className="text-xs font-black uppercase text-amber-400">1º Premiado</span>
                    <span className="text-xl font-black text-white">R$ 1.000,00</span>
                    <span className="text-[10px] text-zinc-400">+ Troféu Oficial</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-300/10 border border-slate-300/40 text-center flex flex-col items-center justify-center gap-1 shadow-md">
                    <span className="text-2xl">🥈</span>
                    <span className="text-xs font-black uppercase text-slate-200">2º Premiado</span>
                    <span className="text-xl font-black text-white">R$ 600,00</span>
                    <span className="text-[10px] text-zinc-400">+ Troféu Oficial</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-700/10 border border-amber-700/40 text-center flex flex-col items-center justify-center gap-1 shadow-md">
                    <span className="text-2xl">🥉</span>
                    <span className="text-xs font-black uppercase text-amber-500">3º Premiado</span>
                    <span className="text-xl font-black text-white">R$ 400,00</span>
                    <span className="text-[10px] text-zinc-400">+ Troféu Oficial</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/40 text-center flex flex-col items-center justify-center gap-1 shadow-md">
                    <span className="text-2xl">🏅</span>
                    <span className="text-xs font-black uppercase text-teal-300">4º Premiado</span>
                    <span className="text-xl font-black text-white">R$ 300,00</span>
                    <span className="text-[10px] text-zinc-400">Bônus Especial</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center flex flex-col items-center justify-center gap-1 shadow-md">
                    <span className="text-2xl">🏅</span>
                    <span className="text-xs font-black uppercase text-emerald-300">5º Premiado</span>
                    <span className="text-xl font-black text-white">R$ 200,00</span>
                    <span className="text-[10px] text-zinc-400">Bônus Especial</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: ETAPAS E FORMATO DE DISPUTA */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black shrink-0">
                  <Swords size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block">Capítulo VI</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Formato de Disputa & Fases do Torneio
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm text-zinc-300">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs">
                    <Clock size={16} />
                    <span>1ª Fase: Todos contra Todos (Pontos Corridos)</span>
                  </div>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed text-zinc-300">
                    <li>Todas as equipes se enfrentam em rodadas simultâneas geradas pelo algoritmo do sorteio.</li>
                    <li><strong>Vitória:</strong> 3 pontos na tabela geral.</li>
                    <li><strong>Empate:</strong> 1 ponto na tabela geral (partidas finalizadas com a mesma pontuação/saldo).</li>
                    <li><strong>Derrota:</strong> 0 pontos na tabela geral.</li>
                    <li><strong>Critérios de Desempate:</strong> 1º Vitórias (V) &rarr; 2º Saldo de Pontos/Goiabadas (SG) &rarr; 3º Pontos Marcados (PM) &rarr; 4º Confronto Direto &rarr; 5º Sorteio.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-xs">
                    <Trophy size={16} />
                    <span>2ª Fase: Top 8 & Mata-Mata Eliminatório</span>
                  </div>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed text-zinc-300">
                    <li>Ao término da 1ª Fase, os <strong>08 melhores times classificados</strong> avançam para a fase eliminatória.</li>
                    <li>Os 8 times são divididos nos <strong>Grupos A e B</strong> (4 times em cada chave).</li>
                    <li><strong>Finais de Grupo:</strong> Vencedor Semifinal A1 &times; Semifinal A2; Vencedor Semifinal B1 &times; Semifinal B2.</li>
                    <li><strong>Grande Final:</strong> Campeão do Grupo A &times; Campeão do Grupo B consagram o Campeão Supremo do Torneio.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SEÇÃO 7: DISPOSIÇÕES GERAIS E ÉTICA */}
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center font-black shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Capítulo VII</span>
                  <h2 className="text-lg sm:text-xl font-black uppercase text-white">
                    Disposições Finais & Disciplina
                  </h2>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
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
            </div>

          </div>

          {/* Botões de Ação no Fim da Página */}
          <div className="w-full mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco'); }}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Acessar Painel do Truco</span>
            </button>

            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Tabela'); }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider border border-white/10 hover:border-amber-500/40 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Ver Classificação & Premiação</span>
            </button>

            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/ExpoGoiabal/Truco/Regulamento/Imprimir'); }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 font-black text-xs uppercase tracking-wider border border-amber-500/30 hover:border-amber-500/60 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              title="Imprimir ou salvar regulamento em PDF"
            >
              <Printer size={15} />
              <span>Imprimir Regulamento / Salvar PDF</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};
