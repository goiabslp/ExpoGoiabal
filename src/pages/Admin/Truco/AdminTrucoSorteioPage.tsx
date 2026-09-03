import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Dices, 
  RotateCcw, 
  ExternalLink, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Tv
} from 'lucide-react';
import { 
  buscarTodasEquipesAdmin, 
  buscarStatusTorneio, 
  acionarSorteioPublicoAdmin, 
  resetarTorneio, 
  subscribeToTrucoChanges,
  isTimeDeFora,
  type TrucoEquipe, 
  type TrucoTorneioStatus 
} from '../../../services/trucoService';

export const AdminTrucoSorteioPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [statusTorneio, setStatusTorneio] = useState<TrucoTorneioStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acionandoSorteio, setAcionandoSorteio] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });

  const carregarDados = async () => {
    try {
      const [eqs, st] = await Promise.all([
        buscarTodasEquipesAdmin(),
        buscarStatusTorneio()
      ]);
      setEquipes(eqs);
      setStatusTorneio(st);
    } catch (err) {
      console.error('Erro ao carregar dados de sorteio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    const unsubscribe = subscribeToTrucoChanges(() => carregarDados());
    return () => unsubscribe();
  }, []);

  const equipesAprovadas = equipes.filter(e => (e.status || 'aprovado') === 'aprovado');
  const equipesPendentes = equipes.filter(e => e.status === 'pendente');
  const isApto = equipesAprovadas.length >= 3;

  const [timeFolgaSelecionadoId, setTimeFolgaSelecionadoId] = useState<string>('');

  useEffect(() => {
    if (equipesAprovadas.length % 2 !== 0) {
      const timeGeneral = equipesAprovadas.find(e => e.nome.trim().toUpperCase().includes('GENERAL'));
      if (timeGeneral) {
        setTimeFolgaSelecionadoId(timeGeneral.id);
      } else {
        const timesLocais = equipesAprovadas.filter(e => !isTimeDeFora(e.cidade));
        if (timesLocais.length > 0) {
          setTimeFolgaSelecionadoId(timesLocais[timesLocais.length - 1].id);
        }
      }
    }
  }, [equipes]);

  const handleAcionarSorteio = async () => {
    if (!isApto) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        message: `Para realizar o sorteio, é necessário ter no mínimo 3 equipes APROVADAS. (Atualmente aprovadas: ${equipesAprovadas.length})`
      });
      return;
    }

    setAcionandoSorteio(true);
    try {
      const res = await acionarSorteioPublicoAdmin(equipesAprovadas, timeFolgaSelecionadoId);
      if (res.sucesso) {
        await carregarDados();
        setFeedbackModal({
          isOpen: true,
          type: 'success',
          message: '🎲 Sorteio oficial acionado com sucesso! O calendário de partidas simultâneas foi gerado e a transmissão pública já está sincronizada.'
        });
      } else {
        setFeedbackModal({ isOpen: true, type: 'error', message: res.mensagem });
      }
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao acionar sorteio: ' + (err?.message || '') });
    } finally {
      setAcionandoSorteio(false);
    }
  };

  const handleResetarSorteio = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Tem certeza que deseja resetar o sorteio do truco? Todas as partidas agendadas da primeira fase serão limpas e o torneio voltará ao estado de espera.')) {
      return;
    }

    try {
      await resetarTorneio();
      await carregarDados();
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        message: 'Sorteio resetado com sucesso! O torneio voltou para a fase de aguardando sorteio.'
      });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao resetar: ' + (err?.message || '') });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      {/* Admin Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco'); }} 
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Voltar ao Hub do Truco"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30 text-amber-400 shrink-0">
              <Dices size={22} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold uppercase tracking-widest text-white leading-tight">
                Controle do Sorteio
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-400 uppercase tracking-widest font-semibold">
                2º Torneio de Truco
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.open('/ExpoGoiabal/Truco/Sorteio', '_blank')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            <Tv size={14} className="text-emerald-400" />
            <span>Telão Público</span>
          </button>
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin'); }}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors"
          >
            Painel Geral
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in slide-in-from-bottom-6 fade-in duration-500">
        
        {/* Banner Central de Controle do Sorteio */}
        <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest self-start">
              <Dices size={14} className="animate-spin" />
              <span>Transmissão Oficial de Rodadas</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-wide">
              🎲 Sorteio Matemático — 1ª Fase
            </h2>

            {/* Status do Sorteio */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-300 mt-1">
              <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-2 rounded-xl border border-white/10">
                <Users size={15} className="text-emerald-400" />
                <span>
                  <strong className="text-white">Times Aprovados:</strong> {equipesAprovadas.length} ({
                    equipesAprovadas.length < 3 
                      ? 'Mínimo de 3 equipes necessárias ⚠️' 
                      : equipesAprovadas.length % 2 === 0 
                      ? 'Par e Apto ✅' 
                      : 'Ímpar e Apto ✅ (1 time folga por rodada)'
                  })
                </span>
              </div>

              {equipesPendentes.length > 0 && (
                <div 
                  onClick={() => navigate('/Admin/Truco/Equipes')}
                  className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-amber-400 cursor-pointer hover:bg-amber-500/20 transition-colors animate-pulse"
                >
                  <Clock size={14} />
                  <span><strong>{equipesPendentes.length} time(s) pendente(s) de aprovação</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-2 rounded-xl border border-white/10">
                <strong className="text-white">Status atual:</strong>
                {statusTorneio?.sorteio_primeira_fase_confirmado ? (
                  <span className="text-emerald-400 font-black">🟢 Sorteio Realizado</span>
                ) : (
                  <span className="text-amber-400 font-black">🟡 Aguardando Sorteio</span>
                )}
              </div>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              {statusTorneio?.sorteio_primeira_fase_confirmado
                ? 'O sorteio oficial já foi realizado. As partidas da primeira fase estão ativas no calendário do torneio no formato Todos contra Todos.'
                : 'Aguardando acionamento. Ao clicar no botão abaixo, o sistema calculará os confrontos no Método do Círculo (Round-Robin), garantindo que todos os times de fora joguem hoje e transmitirá ao vivo para as telas públicas.'}
            </p>

            {equipesAprovadas.length % 2 !== 0 && equipesAprovadas.length >= 3 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2.5 text-xs text-amber-300 font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <div>
                    <strong className="text-amber-400 font-bold uppercase tracking-wider block">
                      Folga Programada da 1ª Rodada (Hoje):
                    </strong>
                    <span className="text-zinc-300">
                      Todos os times de fora de Goiabal jogam hoje. A equipe selecionada abaixo folga hoje e jogará todas as suas partidas normalmente nas rodadas seguintes:
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                  <select
                    value={timeFolgaSelecionadoId}
                    onChange={(e) => setTimeFolgaSelecionadoId(e.target.value)}
                    className="px-3.5 py-2.5 bg-zinc-900 border border-amber-500/40 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner"
                  >
                    {equipesAprovadas
                      .filter(e => !isTimeDeFora(e.cidade))
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nome} ({t.cidade}) {t.nome.toUpperCase().includes('GENERAL') ? '⭐ (Definido para Folga Hoje)' : ''}
                        </option>
                      ))}
                  </select>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    ✓ Todos contra Todos garantido
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação do Sorteio */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => window.open('/ExpoGoiabal/Truco/Sorteio', '_blank')}
              className="px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
            >
              <ExternalLink size={15} className="text-emerald-400" />
              <span>Abrir Telão</span>
            </button>

            {statusTorneio?.sorteio_primeira_fase_confirmado && (
              <button
                type="button"
                onClick={handleResetarSorteio}
                className="px-4 py-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Limpar partidas e resetar sorteio"
              >
                <RotateCcw size={14} />
                <span>Resetar Sorteio</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAcionarSorteio}
              disabled={acionandoSorteio || !isApto}
              className={`px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                !isApto
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  : statusTorneio?.sorteio_primeira_fase_confirmado
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-amber-500/40 hover:scale-105'
              }`}
            >
              <Dices size={18} />
              <span>
                {acionandoSorteio
                  ? 'Acionando...'
                  : statusTorneio?.sorteio_primeira_fase_confirmado
                  ? 'RE-ACIONAR SORTEIO'
                  : 'ACIONAR SORTEIO OFICIAL'}
              </span>
            </button>
          </div>
        </div>

        {/* Lista de Equipes Aptas / Aprovadas para o Sorteio */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                Equipes Aprovadas Participantes ({equipesAprovadas.length})
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                Somente times com status <strong className="text-emerald-400">APROVADO</strong> entram na rotação matemática do sorteio
              </p>
            </div>

            <button
              onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Equipes'); }}
              className="text-xs text-emerald-400 hover:underline font-bold uppercase tracking-wider"
            >
              Gerenciar Inscrições →
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3 bg-zinc-900/40 border border-white/5 rounded-3xl">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Carregando dados do sorteio...
              </span>
            </div>
          ) : equipesAprovadas.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3 bg-zinc-900/40 border border-white/5 rounded-3xl">
              <Users size={36} className="text-zinc-600" />
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                Nenhuma equipe aprovada no momento
              </span>
              <button
                onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Equipes'); }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider mt-2 hover:scale-105 transition-all"
              >
                Acessar e Aprovar Equipes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {equipesAprovadas.map((time, idx) => (
                <div
                  key={time.id}
                  className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-md hover:border-emerald-500/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden shrink-0">
                    {time.foto_url ? (
                      <img src={time.foto_url} alt={time.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-emerald-400 block tracking-wider">
                      Time #{idx + 1}
                    </span>
                    <h5 className="font-black text-sm uppercase text-white truncate">
                      {time.nome}
                    </h5>
                    <span className="text-[11px] text-zinc-400 truncate block">
                      📍 {time.cidade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Modal de Feedback */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/20 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-center animate-in zoom-in-95 duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
              feedbackModal.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}>
              {feedbackModal.type === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
              {feedbackModal.type === 'success' ? 'Sucesso!' : 'Atenção'}
            </h3>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6">
              {feedbackModal.message}
            </p>

            <button
              type="button"
              onClick={() => setFeedbackModal({ isOpen: false, type: 'success', message: '' })}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
