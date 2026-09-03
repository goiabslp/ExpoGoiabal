import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Upload, 
  Trash2, 
  Dices, 
  Clock, 
  BadgeCheck, 
  CheckCircle,
  X, 
  Check, 
  AlertTriangle, 
  Calendar, 
  Trophy,
  Edit3,
  Search,
  UserPlus,
  IdCard,
  Save
} from 'lucide-react';
import { 
  buscarTodasEquipesAdmin, 
  aprovarEquipe, 
  reprovarEquipe, 
  excluirEquipe, 
  excluirTodasEquipes, 
  popularTimesFicticios, 
  atualizarEquipeCompleta,
  obterImagemAleatoriaBaralho,
  subscribeToTrucoChanges,
  type TrucoEquipe, 
  type TrucoStatusEquipe
} from '../../../services/trucoService';
import { SelectCidadeMG } from '../../../components/Truco/SelectCidadeMG';
import { CIDADE_PADRAO_MG } from '../../../data/cidadesMG';

interface JogadorEditForm {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  is_titular: boolean;
}

export const AdminTrucoEquipesPage: React.FC = () => {
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState<TrucoEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'aprovado' | 'reprovado' | 'com_bonus' | 'sem_bonus'>('todos');

  // Controle de Ações / Loading
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  // Modal de Feedback
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ isOpen: false, type: 'success', message: '' });

  // Modal de Confirmação de Status (Aprovar / Reprovar)
  const [modalConfirmacaoStatus, setModalConfirmacaoStatus] = useState<{
    isOpen: boolean;
    equipe: TrucoEquipe | null;
    novoStatus: 'aprovado' | 'reprovado';
  }>({ isOpen: false, equipe: null, novoStatus: 'aprovado' });

  // Modal de Edição Completa da Equipe
  const [modalEdicaoOpen, setModalEdicaoOpen] = useState(false);
  const [editandoEquipeId, setEditandoEquipeId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCidade, setEditCidade] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [editFotoFile, setEditFotoFile] = useState<File | null>(null);
  const [editFotoPreview, setEditFotoPreview] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<TrucoStatusEquipe>('pendente');
  const [editCadastroRegularizado, setEditCadastroRegularizado] = useState(true);
  const [editJogadores, setEditJogadores] = useState<JogadorEditForm[]>([]);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  const carregarEquipes = async () => {
    try {
      const data = await buscarTodasEquipesAdmin();
      setEquipes(data);
    } catch (err) {
      console.error('Erro ao buscar equipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEquipes();
    const unsubscribe = subscribeToTrucoChanges(() => carregarEquipes());
    return () => unsubscribe();
  }, []);

  // Formatação de CPF
  const formatCPF = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    let res = numbers;
    if (numbers.length > 3) res = numbers.slice(0, 3) + '.' + numbers.slice(3);
    if (numbers.length > 6) res = res.slice(0, 7) + '.' + numbers.slice(6);
    if (numbers.length > 9) res = res.slice(0, 11) + '-' + numbers.slice(9);
    return res;
  };

  // Abrir Modal de Edição Completa
  const handleAbrirEdicao = (eq: TrucoEquipe) => {
    setEditandoEquipeId(eq.id);
    setEditNome(eq.nome);
    setEditCidade(eq.cidade || CIDADE_PADRAO_MG);
    setEditFotoUrl(eq.foto_url || '');
    setEditFotoFile(null);
    setEditFotoPreview(eq.foto_url || null);
    setEditStatus(eq.status || 'pendente');
    setEditCadastroRegularizado(eq.cadastro_regularizado !== false);
    setEditErrorMsg(null);

    const jogs = (eq.jogadores || []).map((j, idx) => ({
      id: j.id || `temp_${idx}`,
      nome_completo: j.nome_completo || '',
      cpf: j.cpf || '',
      data_nascimento: j.data_nascimento || '',
      is_titular: j.is_titular !== undefined ? j.is_titular : idx < 4
    }));

    // Se tiver menos de 4 jogadores, preenche até 4 titulares
    while (jogs.length < 4) {
      jogs.push({
        id: `temp_${Date.now()}_${jogs.length}`,
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        is_titular: true
      });
    }

    setEditJogadores(jogs);
    setModalEdicaoOpen(true);
  };

  const handleEditJogadorChange = (index: number, field: keyof JogadorEditForm, value: any) => {
    setEditJogadores(prev => {
      const copy = [...prev];
      if (field === 'cpf') {
        copy[index] = { ...copy[index], cpf: formatCPF(value) };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleAdicionarJogadorReserva = () => {
    setEditJogadores(prev => [
      ...prev,
      {
        id: `temp_${Date.now()}`,
        nome_completo: '',
        cpf: '',
        data_nascimento: '',
        is_titular: false
      }
    ]);
  };

  const handleRemoverJogador = (index: number) => {
    if (editJogadores.length <= 4) {
      setEditErrorMsg('A equipe precisa ter no mínimo 4 jogadores titulares.');
      return;
    }
    setEditJogadores(prev => prev.filter((_, i) => i !== index));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSortearFotoBaralho = () => {
    const novaFoto = obterImagemAleatoriaBaralho(editNome || 'EQUIPE DE TRUCO', String(Date.now()));
    setEditFotoFile(null);
    setEditFotoUrl(novaFoto);
    setEditFotoPreview(novaFoto);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoEquipeId) return;
    setEditErrorMsg(null);

    if (!editNome.trim()) {
      setEditErrorMsg('Informe o nome da equipe.');
      return;
    }
    if (!editCidade.trim()) {
      setEditErrorMsg('Informe a cidade da equipe.');
      return;
    }

    // Validar jogadores
    for (let i = 0; i < editJogadores.length; i++) {
      const j = editJogadores[i];
      if (!j.nome_completo.trim()) {
        setEditErrorMsg(`Preencha o nome do Jogador ${i + 1}.`);
        return;
      }
      if (j.cpf.trim() && j.cpf.replace(/\D/g, '').length !== 11) {
        setEditErrorMsg(`O CPF do Jogador ${i + 1} (${j.nome_completo}) está incompleto. Digite os 11 dígitos ou deixe em branco.`);
        return;
      }
    }

    setSalvandoEdicao(true);
    try {
      await atualizarEquipeCompleta(
        editandoEquipeId,
        {
          nome: editNome,
          cidade: editCidade,
          foto_url: editFotoUrl,
          status: editStatus,
          cadastro_regularizado: editCadastroRegularizado
        },
        editJogadores.map((j, idx) => ({
          id: j.id,
          nome_completo: j.nome_completo,
          cpf: j.cpf,
          data_nascimento: j.data_nascimento,
          is_titular: j.is_titular !== undefined ? j.is_titular : idx < 4
        })),
        editFotoFile
      );

      await carregarEquipes();
      setModalEdicaoOpen(false);
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        message: `Equipe "${editNome}" e todos os seus jogadores foram atualizados com sucesso!`
      });
    } catch (err: any) {
      console.error('Erro ao salvar edição de equipe:', err);
      setEditErrorMsg(err.message || 'Erro ao salvar alterações da equipe.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  // Aprovação / Reprovação
  const handleAbrirModalStatus = (equipe: TrucoEquipe, novoStatus: 'aprovado' | 'reprovado') => {
    setModalConfirmacaoStatus({
      isOpen: true,
      equipe,
      novoStatus
    });
  };

  const handleConfirmarStatusEquipe = async () => {
    if (!modalConfirmacaoStatus.equipe) return;
    const { equipe, novoStatus } = modalConfirmacaoStatus;

    setProcessandoId(equipe.id);
    try {
      if (novoStatus === 'aprovado') {
        await aprovarEquipe(equipe.id);
      } else {
        await reprovarEquipe(equipe.id);
      }
      await carregarEquipes();
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        message: `Equipe "${equipe.nome}" ${novoStatus === 'aprovado' ? 'APROVADA com sucesso e participante oficial do torneio!' : 'REPROVADA e desabilitada para o torneio.'}`
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        message: 'Erro ao alterar status: ' + (err?.message || '')
      });
    } finally {
      setProcessandoId(null);
      setModalConfirmacaoStatus({ isOpen: false, equipe: null, novoStatus: 'aprovado' });
    }
  };

  // Exclusão de Equipe
  const handleExcluirEquipe = async (equipeId: string, equipeNome: string) => {
    if (!window.confirm(`Deseja realmente excluir a equipe "${equipeNome}" do torneio?`)) {
      return;
    }
    setExcluindoId(equipeId);
    try {
      await excluirEquipe(equipeId);
      setEquipes(prev => prev.filter(e => e.id !== equipeId));
      await carregarEquipes();
      setFeedbackModal({ isOpen: true, type: 'success', message: `Equipe "${equipeNome}" excluída com sucesso!` });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao excluir: ' + (err?.message || '') });
    } finally {
      setExcluindoId(null);
    }
  };

  const handleExcluirTodas = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Deseja realmente excluir TODAS as equipes cadastradas no torneio de truco?')) {
      return;
    }
    setLoading(true);
    try {
      await excluirTodasEquipes();
      setEquipes([]);
      await carregarEquipes();
      setFeedbackModal({ isOpen: true, type: 'success', message: 'Todas as equipes foram excluídas com sucesso.' });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao excluir todas: ' + (err?.message || '') });
    } finally {
      setLoading(false);
    }
  };

  const handlePopularTimesTeste = async () => {
    setLoading(true);
    try {
      await popularTimesFicticios();
      await carregarEquipes();
      setFeedbackModal({ isOpen: true, type: 'success', message: '08 equipes de teste cadastradas com sucesso!' });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao popular equipes: ' + (err?.message || '') });
    } finally {
      setLoading(false);
    }
  };

  // Métricas
  const totalCadastrados = equipes.length;
  const pendentes = equipes.filter(e => e.status === 'pendente');
  const aprovados = equipes.filter(e => (e.status || 'aprovado') === 'aprovado');
  const reprovados = equipes.filter(e => e.status === 'reprovado');
  const regularizados = equipes.filter(e => e.cadastro_regularizado !== false);
  const semCpf = equipes.filter(e => e.cadastro_regularizado === false);

  // Filtragem da Lista
  const listaFiltrada = equipes.filter(e => {
    const matchBusca = 
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.cidade.toLowerCase().includes(busca.toLowerCase()) ||
      (e.jogadores || []).some(j => j.nome_completo.toLowerCase().includes(busca.toLowerCase()) || (j.cpf && j.cpf.includes(busca)));

    if (!matchBusca) return false;

    if (filtroStatus === 'pendente') return e.status === 'pendente';
    if (filtroStatus === 'aprovado') return (e.status || 'aprovado') === 'aprovado';
    if (filtroStatus === 'reprovado') return e.status === 'reprovado';
    if (filtroStatus === 'com_bonus') return e.cadastro_regularizado !== false;
    if (filtroStatus === 'sem_bonus') return e.cadastro_regularizado === false;
    return true;
  });

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
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30 text-emerald-400 shrink-0">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold uppercase tracking-widest text-white leading-tight">
                Gerenciador de Equipes
              </h1>
              <p className="text-[10px] sm:text-xs text-emerald-400 uppercase tracking-widest font-semibold">
                2º Torneio de Truco
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Partidas'); }}
            className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            Ir para Placares
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
        
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide flex items-center gap-2.5">
              <span>🃏 Equipes & Inscrições</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
              Modere inscrições, aprove times para o sorteio e <strong className="text-emerald-400">edite todos os dados dos times e seus jogadores</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              type="button"
              onClick={handlePopularTimesTeste}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Dices size={14} />
              <span>⚡ Inserir 08 Times de Teste</span>
            </button>

            {equipes.length > 0 && (
              <button
                type="button"
                onClick={handleExcluirTodas}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Trash2 size={14} />
                <span>Excluir Todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Resumo de Métricas (Grid 100% Responsivo) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cadastrados</span>
            <span className="text-2xl font-black text-white mt-1">{totalCadastrados}</span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-md">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Pendentes</span>
            </div>
            <span className="text-2xl font-black text-amber-400 mt-1">{pendentes.length}</span>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-md">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <BadgeCheck size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Aprovados</span>
            </div>
            <span className="text-2xl font-black text-emerald-400 mt-1">{aprovados.length}</span>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-md">
            <div className="flex items-center gap-1.5 text-red-400">
              <X size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Reprovados</span>
            </div>
            <span className="text-2xl font-black text-red-400 mt-1">{reprovados.length}</span>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-md">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Trophy size={13} className="text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-wider">Com Bônus</span>
            </div>
            <span className="text-2xl font-black text-emerald-300 mt-1">{regularizados.length}</span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-md">
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Sem CPF</span>
            </div>
            <span className="text-2xl font-black text-amber-400 mt-1">{semCpf.length}</span>
          </div>
        </div>

        {/* Barra de Filtros & Busca */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-900/90 border border-white/10 rounded-2xl p-3 sm:p-4">
          
          {/* Abas de Filtro com Scroll Horizontal Touch */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                filtroStatus === 'todos'
                  ? 'bg-zinc-700 text-white shadow-md'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({totalCadastrados})
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('pendente')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filtroStatus === 'pendente'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'bg-zinc-800/60 text-amber-400 hover:bg-zinc-800'
              }`}
            >
              <span>🟡 Pendentes</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{pendentes.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('aprovado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filtroStatus === 'aprovado'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'bg-zinc-800/60 text-emerald-400 hover:bg-zinc-800'
              }`}
            >
              <span>🟢 Aprovados</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{aprovados.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('reprovado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filtroStatus === 'reprovado'
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                  : 'bg-zinc-800/60 text-red-400 hover:bg-zinc-800'
              }`}
            >
              <span>🔴 Reprovados</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{reprovados.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('com_bonus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filtroStatus === 'com_bonus'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-zinc-800/60 text-emerald-300 hover:bg-zinc-800'
              }`}
            >
              <span>🏆 Com Bônus ({regularizados.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('sem_bonus')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                filtroStatus === 'sem_bonus'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-zinc-800/60 text-amber-300 hover:bg-zinc-800'
              }`}
            >
              <span>⚠️ Sem CPF ({semCpf.length})</span>
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar time ou jogador..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-700/80 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-white placeholder-zinc-500 text-xs focus:outline-none transition-colors"
            />
          </div>

        </div>

        {/* Lista de Equipes (Card Grid com Edição Completa) */}
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-zinc-900/40 border border-white/5 rounded-3xl">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Carregando equipes do torneio...
            </span>
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-zinc-900/40 border border-white/5 rounded-3xl">
            <Users size={40} className="text-zinc-600" />
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              Nenhuma equipe encontrada com o filtro selecionado
            </span>
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="text-xs text-emerald-400 underline font-semibold mt-1"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {listaFiltrada.map((time) => {
              const statusAtual = (time.status || 'aprovado') as TrucoStatusEquipe;
              const isRegularizado = time.cadastro_regularizado !== false;
              const titulares = (time.jogadores || []).filter(j => j.is_titular !== false);
              const reservas = (time.jogadores || []).filter(j => j.is_titular === false);
              const isProcessando = processandoId === time.id;

              const dataCadastroFormatada = time.created_at
                ? new Date(time.created_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Data não informada';

              return (
                <div
                  key={time.id}
                  className={`border rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-2xl transition-all duration-300 ${
                    statusAtual === 'pendente'
                      ? 'bg-zinc-900/90 border-amber-500/40 shadow-amber-500/5'
                      : statusAtual === 'aprovado'
                      ? 'bg-zinc-900/90 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/5'
                      : 'bg-zinc-900/70 border-red-500/30 opacity-85'
                  }`}
                >
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 shadow-md">
                        {time.foto_url ? (
                          <img src={time.foto_url} alt={time.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <Users size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-base sm:text-lg uppercase text-white tracking-wide break-words">
                          {time.nome}
                        </h4>
                        <span className="text-xs text-zinc-300 font-semibold block">
                          📍 {time.cidade}
                        </span>
                        
                        {/* Badges de Regularização */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {isRegularizado ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                              <Trophy size={11} className="text-amber-400" />
                              <span>Regularizado • Elegível ao Bônus</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                              <AlertTriangle size={11} className="text-amber-400" />
                              <span>Sem CPF • Inelegível ao Bônus</span>
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                          <Calendar size={11} />
                          <span>Cadastrado em {dataCadastroFormatada}</span>
                        </span>
                      </div>
                    </div>

                    {/* Badge de Status de Aprovação */}
                    <div className="shrink-0">
                      {statusAtual === 'pendente' && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse shadow-sm">
                          <Clock size={11} />
                          <span>🟡 PENDENTE</span>
                        </span>
                      )}
                      {statusAtual === 'aprovado' && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <CheckCircle size={11} />
                          <span>🟢 APROVADO</span>
                        </span>
                      )}
                      {statusAtual === 'reprovado' && (
                        <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <X size={11} />
                          <span>🔴 REPROVADO</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Jogadores Cadastrados (Titulares & Reservas) */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 text-xs flex flex-col gap-2.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1.5">
                        Titulares ({titulares.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {titulares.map((t, tIdx) => (
                          <div key={t.id || tIdx} className="text-zinc-300">
                            <span className="font-bold text-white block">{tIdx + 1}. {t.nome_completo}</span>
                            <span className="text-[9px] block">
                              {t.cpf ? (
                                <span className="text-zinc-400">CPF: {t.cpf}</span>
                              ) : (
                                <span className="text-amber-400 font-bold">⚠️ CPF: Não informado</span>
                              )}
                              <span className="text-zinc-500"> • Nasc: {t.data_nascimento || 'Não informada'}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {reservas.length > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1.5">
                          Reservas ({reservas.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300">
                          {reservas.map((r, rIdx) => (
                            <div key={r.id || rIdx}>
                              <span className="font-bold text-white block">• {r.nome_completo}</span>
                              <span className="text-[9px] block">
                                {r.cpf ? (
                                  <span className="text-zinc-400">CPF: {r.cpf}</span>
                                ) : (
                                  <span className="text-amber-400 font-bold">⚠️ CPF: Não informado</span>
                                )}
                                <span className="text-zinc-500"> • Nasc: {r.data_nascimento || 'Não informada'}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações Administrativas por Equipe */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                    
                    {/* Botão de Edição Completa */}
                    <button
                      type="button"
                      onClick={() => handleAbrirEdicao(time)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-sm hover:scale-105"
                      title="Editar todas as informações deste time e de seus jogadores"
                    >
                      <Edit3 size={14} />
                      <span>Editar Time</span>
                    </button>

                    {/* Botões de Moderação de Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusAtual === 'pendente' && (
                        <>
                          <button
                            type="button"
                            disabled={isProcessando}
                            onClick={() => handleAbrirModalStatus(time, 'aprovado')}
                            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
                          >
                            <Check size={14} />
                            <span>Aprovar</span>
                          </button>

                          <button
                            type="button"
                            disabled={isProcessando}
                            onClick={() => handleAbrirModalStatus(time, 'reprovado')}
                            className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                          >
                            <X size={14} />
                            <span>Reprovar</span>
                          </button>
                        </>
                      )}

                      {statusAtual === 'aprovado' && (
                        <button
                          type="button"
                          disabled={isProcessando}
                          onClick={() => handleAbrirModalStatus(time, 'reprovado')}
                          className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                          title="Revogar aprovação e reprovar time"
                        >
                          <X size={13} />
                          <span>Reprovar</span>
                        </button>
                      )}

                      {statusAtual === 'reprovado' && (
                        <button
                          type="button"
                          disabled={isProcessando}
                          onClick={() => handleAbrirModalStatus(time, 'aprovado')}
                          className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                          title="Aprovar time reprovado"
                        >
                          <Check size={13} />
                          <span>Re-Aprovar</span>
                        </button>
                      )}

                      {/* Botão Excluir Equipe */}
                      <button
                        type="button"
                        onClick={() => handleExcluirEquipe(time.id, time.nome)}
                        disabled={excluindoId === time.id}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-red-900/80 text-zinc-400 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                        title={`Excluir definitivamente ${time.nome}`}
                      >
                        <Trash2 size={13} />
                        <span>{excluindoId === time.id ? '...' : 'Excluir'}</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* MODAL DE EDIÇÃO COMPLETA DA EQUIPE E SEUS JOGADORES          */}
      {/* ============================================================ */}
      {modalEdicaoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl w-full max-w-3xl my-8 p-5 sm:p-8 shadow-2xl relative text-left animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide">
                    Editar Informações da Equipe
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Altere os dados do time, status, regularização e jogadores
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalEdicaoOpen(false)}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form de Edição (com Scroll Vertical) */}
            <form onSubmit={handleSalvarEdicao} className="flex-1 overflow-y-auto pr-1 sm:pr-2 flex flex-col gap-6">
              
              {/* Alerta de Erro */}
              {editErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-semibold">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              {/* SEÇÃO 1: DADOS DO TIME */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 pb-2 border-b border-white/5">
                  <Users size={14} />
                  <span>1. Dados do Time</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Nome do Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none"
                    />
                  </div>

                  <SelectCidadeMG
                    id="edit-cidade"
                    label="Cidade do Time"
                    value={editCidade}
                    onChange={setEditCidade}
                    required
                  />
                </div>

                {/* Status & Regularização */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Status de Aprovação
                    </label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value as TrucoStatusEquipe)}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none"
                    >
                      <option value="pendente">🟡 Pendente de Moderação</option>
                      <option value="aprovado">🟢 Aprovado (Participante Oficial)</option>
                      <option value="reprovado">🔴 Reprovado</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Elegibilidade ao Bônus
                    </label>
                    <select
                      value={editCadastroRegularizado ? 'true' : 'false'}
                      onChange={e => setEditCadastroRegularizado(e.target.value === 'true')}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none"
                    >
                      <option value="true">🏆 Regularizado • Elegível ao Bônus</option>
                      <option value="false">⚠️ Sem CPF • Inelegível ao Bônus</option>
                    </select>
                  </div>
                </div>

                {/* Foto / Escudo */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                    Foto ou Escudo da Equipe
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-700">
                    {editFotoPreview ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shrink-0 shadow-md">
                        <img src={editFotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xl">
                        🃏
                      </div>
                    )}
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 hover:border-emerald-500/30">
                        <Upload size={14} className="text-emerald-400" />
                        <span>Enviar Arquivo</span>
                        <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                      </label>

                      <button
                        type="button"
                        onClick={handleSortearFotoBaralho}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                        title="Sortear imagem temática de baralho/jogadores"
                      >
                        <span>🃏 Sortear Baralho</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: JOGADORES DA EQUIPE */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <IdCard size={14} />
                    <span>2. Jogadores da Equipe (4 Titulares + Reservas)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAdicionarJogadorReserva}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <UserPlus size={13} />
                    <span>+ Reserva</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {editJogadores.map((j, idx) => {
                    const isTitular = idx < 4;
                    return (
                      <div 
                        key={j.id || idx}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                          isTitular 
                            ? 'bg-zinc-950/70 border-white/10' 
                            : 'bg-amber-500/[0.03] border-amber-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            isTitular ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isTitular ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                            Jogador #{idx + 1} {isTitular ? `(Titular ${idx + 1})` : `(Reserva ${idx - 3})`}
                          </span>

                          {editJogadores.length > 4 && idx >= 4 && (
                            <button
                              type="button"
                              onClick={() => handleRemoverJogador(idx)}
                              className="text-zinc-500 hover:text-red-400 text-xs flex items-center gap-1 p-1 transition-colors"
                              title="Remover Reserva"
                            >
                              <Trash2 size={14} />
                              <span>Remover</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                              Nome Completo *
                            </label>
                            <input
                              type="text"
                              required
                              value={j.nome_completo}
                              onChange={e => handleEditJogadorChange(idx, 'nome_completo', e.target.value)}
                              placeholder="Nome do jogador"
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                              CPF (Opcional)
                            </label>
                            <input
                              type="text"
                              maxLength={14}
                              value={j.cpf}
                              onChange={e => handleEditJogadorChange(idx, 'cpf', e.target.value)}
                              placeholder="000.000.000-00"
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                              Data de Nascimento
                            </label>
                            <input
                              type="date"
                              value={j.data_nascimento}
                              onChange={e => handleEditJogadorChange(idx, 'data_nascimento', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-medium [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={salvandoEdicao}
                  onClick={() => setModalEdicaoOpen(false)}
                  className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvandoEdicao}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {salvandoEdicao ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE STATUS (APROVAR / REPROVAR) */}
      {modalConfirmacaoStatus.isOpen && modalConfirmacaoStatus.equipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/20 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
              modalConfirmacaoStatus.novoStatus === 'aprovado'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}>
              {modalConfirmacaoStatus.novoStatus === 'aprovado' ? (
                <CheckCircle size={32} />
              ) : (
                <AlertTriangle size={32} />
              )}
            </div>

            <h3 className="text-xl font-black text-white uppercase text-center tracking-wider mb-2">
              {modalConfirmacaoStatus.novoStatus === 'aprovado' ? 'Aprovar Equipe?' : 'Reprovar Equipe?'}
            </h3>

            <p className="text-zinc-300 text-xs sm:text-sm text-center leading-relaxed mb-6">
              {modalConfirmacaoStatus.novoStatus === 'aprovado' ? (
                <>
                  Deseja confirmar a aprovação da equipe <strong className="text-emerald-400 font-bold">{modalConfirmacaoStatus.equipe.nome}</strong>?
                  <br /><br />
                  Ao aprovar, o time se tornará <strong className="text-white">oficialmente participante</strong>, ficará visível publicamente e estará disponível para o sorteio.
                </>
              ) : (
                <>
                  Deseja reprovar a equipe <strong className="text-red-400 font-bold">{modalConfirmacaoStatus.equipe.nome}</strong>?
                  <br /><br />
                  O time será desabilitado do torneio e ficará oculto das páginas públicas.
                </>
              )}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalConfirmacaoStatus({ isOpen: false, equipe: null, novoStatus: 'aprovado' })}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarStatusEquipe}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  modalConfirmacaoStatus.novoStatus === 'aprovado'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                }`}
              >
                {modalConfirmacaoStatus.novoStatus === 'aprovado' ? 'Sim, Aprovar' : 'Sim, Reprovar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FEEDBACK (SUCESSO / ERRO) */}
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
