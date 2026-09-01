import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { 
  Shield, 
  Users, 
  Video, 
  ArrowLeft, 
  CheckCircle, 
  Baby, 
  Upload, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Dices, 
  ExternalLink, 
  RotateCcw,
  Swords,
  Check,
  X,
  Clock,
  AlertTriangle,
  Calendar,
  BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  buscarTodasEquipesAdmin,
  buscarStatusTorneio, 
  acionarSorteioPublicoAdmin, 
  resetarTorneio, 
  excluirEquipe,
  excluirTodasEquipes,
  popularTimesFicticios,
  aprovarEquipe,
  reprovarEquipe,
  type TrucoEquipe, 
  type TrucoTorneioStatus,
  type TrucoStatusEquipe
} from '../../services/trucoService';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'embaixadora' | 'tambores' | 'mirim' | 'fotos'>('menu');
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [inscricoesTambores, setInscricoesTambores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroModalidade, setFiltroModalidade] = useState<string>('Todos');
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; type: 'success'|'error'; message: string }>({ isOpen: false, type: 'success', message: '' });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  
  // Link configuration states for photos
  const [linkQuinta, setLinkQuinta] = useState('');
  const [linkSexta, setLinkSexta] = useState('');
  const [linkSabado, setLinkSabado] = useState('');
  const [linkDomingo, setLinkDomingo] = useState('');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; idToDelete: string | null; table: 'expogoiabal' | '3tambores' }>({ isOpen: false, idToDelete: null, table: 'expogoiabal' });
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  // Truco States
  const [equipesTruco, setEquipesTruco] = useState<TrucoEquipe[]>([]);
  const [statusTruco, setStatusTruco] = useState<TrucoTorneioStatus | null>(null);
  const [acionandoSorteio, setAcionandoSorteio] = useState(false);
  const [mostrarGerenciadorTimes, setMostrarGerenciadorTimes] = useState(false);
  const [excluindoTimeId, setExcluindoTimeId] = useState<string | null>(null);
  const [filtroStatusTruco, setFiltroStatusTruco] = useState<'todos' | 'pendente' | 'aprovado' | 'reprovado'>('todos');
  const [modalConfirmacaoStatus, setModalConfirmacaoStatus] = useState<{
    isOpen: boolean;
    equipe: TrucoEquipe | null;
    novoStatus: 'aprovado' | 'reprovado';
  }>({ isOpen: false, equipe: null, novoStatus: 'aprovado' });
  const [processandoStatusId, setProcessandoStatusId] = useState<string | null>(null);

  const getRegistrationId = (id: string) => {
    const idStr = String(id);
    if (idStr.includes('-')) {
      return `EG3T-${idStr.split('-')[0].toUpperCase()}`;
    }
    return `EG3T-${idStr.padStart(5, '0')}`;
  };

  const downloadVoucherAsImage = (inscricao: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Fill
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Gold Border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      const logoWidth = 140;
      const logoHeight = 140 * (logoImg.height / logoImg.width);
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = 40;
      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

      const contentYStart = logoY + logoHeight + 25;

      ctx.textAlign = 'center';
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('COMPROVANTE DE INSCRIÇÃO', canvas.width / 2, contentYStart);
      
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('PROVA DE 3 TAMBORES • EXPO GOIABAL 2026', canvas.width / 2, contentYStart + 22);

      ctx.beginPath();
      ctx.moveTo(40, contentYStart + 35);
      ctx.lineTo(canvas.width - 40, contentYStart + 35);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      const cardY = contentYStart + 55;
      const cardWidth = canvas.width - 80;
      const cardHeight = 440;
      const cardX = 40;
      
      ctx.fillStyle = '#09090b';
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardWidth - r, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(cardX + r, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      const bannerH = 65;
      const bannerY = cardY + 20;
      ctx.fillRect(cardX + 20, bannerY, cardWidth - 40, bannerH);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 20, bannerY, cardWidth - 40, bannerH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('CÓDIGO DE INSCRIÇÃO (ID)', canvas.width / 2, bannerY + 20);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText(getRegistrationId(inscricao.id), canvas.width / 2, bannerY + 48);

      ctx.textAlign = 'left';
      const items = [
        { label: 'COMPETIDORA', value: inscricao.nome.toUpperCase() },
        { label: 'IDADE', value: `${inscricao.idade} anos` },
        { label: 'CIDADE', value: inscricao.cidade.toUpperCase() },
        { label: 'NOME DO CAVALO', value: inscricao.nome_cavalo.toUpperCase() },
        { label: 'WHATSAPP', value: inscricao.whatsapp },
        { label: 'STATUS DO PAGAMENTO', value: 'AGUARDANDO VALIDAÇÃO', color: '#f59e0b' },
        { label: 'RECEBEDOR', value: 'BeP Eventos Cronometrados' },
        { label: 'CHAVE PIX CNPJ', value: '62.378.994/0001-31' }
      ];

      let rowY = cardY + 115;
      items.forEach((item, index) => {
        const col = index % 2;
        const colX = cardX + 30 + col * 260;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, colX, rowY);
        
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.color || '#ffffff';
        ctx.fillText(item.value, colX, rowY + 18);

        if (col === 1 || index === items.length - 1) {
          rowY += 65;
        }
      });

      const cardFooterY = cardY + cardHeight - 25;
      ctx.textAlign = 'center';
      ctx.font = 'medium 11px sans-serif';
      ctx.fillStyle = '#71717a';
      const nowStr = new Date(inscricao.created_at).toLocaleString('pt-BR');
      ctx.fillText(`Confirmação: ${nowStr}`, canvas.width / 2, cardFooterY);

      const footerY = cardY + cardHeight + 40;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('A Organização entrará em contato para liberar sua inscrição.', canvas.width / 2, footerY);
      
      ctx.font = '900 12px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('PREFEITURA DE SÃO JOSÉ DO GOIABAL', canvas.width / 2, footerY + 20);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Comprovante_Inscricao_3Tambores_${inscricao.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    logoImg.onerror = () => {
      ctx.textAlign = 'center';
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('EXPO GOIABAL 2026', canvas.width / 2, 80);
      
      const contentYStart = 120;
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('COMPROVANTE DE INSCRIÇÃO', canvas.width / 2, contentYStart);
      
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('PROVA DE 3 TAMBORES • EXPO GOIABAL 2026', canvas.width / 2, contentYStart + 22);

      ctx.beginPath();
      ctx.moveTo(40, contentYStart + 35);
      ctx.lineTo(canvas.width - 40, contentYStart + 35);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      const cardY = contentYStart + 55;
      const cardWidth = canvas.width - 80;
      const cardHeight = 440;
      const cardX = 40;
      
      ctx.fillStyle = '#09090b';
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardWidth - r, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(cardX + r, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      const bannerH = 65;
      const bannerY = cardY + 20;
      ctx.fillRect(cardX + 20, bannerY, cardWidth - 40, bannerH);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 20, bannerY, cardWidth - 40, bannerH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('CÓDIGO DE INSCRIÇÃO (ID)', canvas.width / 2, bannerY + 20);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText(getRegistrationId(inscricao.id), canvas.width / 2, bannerY + 48);

      ctx.textAlign = 'left';
      const items = [
        { label: 'COMPETIDORA', value: inscricao.nome.toUpperCase() },
        { label: 'IDADE', value: `${inscricao.idade} anos` },
        { label: 'CIDADE', value: inscricao.cidade.toUpperCase() },
        { label: 'NOME DO CAVALO', value: inscricao.nome_cavalo.toUpperCase() },
        { label: 'WHATSAPP', value: inscricao.whatsapp },
        { label: 'STATUS DO PAGAMENTO', value: 'AGUARDANDO VALIDAÇÃO', color: '#f59e0b' },
        { label: 'RECEBEDOR', value: 'BeP Eventos Cronometrados' },
        { label: 'CHAVE PIX CNPJ', value: '62.378.994/0001-31' }
      ];

      let rowY = cardY + 115;
      items.forEach((item, index) => {
        const col = index % 2;
        const colX = cardX + 30 + col * 260;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, colX, rowY);
        
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.color || '#ffffff';
        ctx.fillText(item.value, colX, rowY + 18);

        if (col === 1 || index === items.length - 1) {
          rowY += 65;
        }
      });

      const cardFooterY = cardY + cardHeight - 25;
      ctx.textAlign = 'center';
      ctx.font = 'medium 11px sans-serif';
      ctx.fillStyle = '#71717a';
      const nowStr = new Date(inscricao.created_at).toLocaleString('pt-BR');
      ctx.fillText(`Confirmação: ${nowStr}`, canvas.width / 2, cardFooterY);

      const footerY = cardY + cardHeight + 40;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('A Organização entrará em contato para liberar sua inscrição.', canvas.width / 2, footerY);
      
      ctx.font = '900 12px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('PREFEITURA DE SÃO JOSÉ DO GOIABAL', canvas.width / 2, footerY + 20);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Comprovante_Inscricao_3Tambores_${inscricao.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    logoImg.src = window.location.origin + '/logo.png';
  };

  const handleDelete = async () => {
    if (!deleteConfirmModal.idToDelete) return;
    try {
      setLoading(true);
      const tableName = deleteConfirmModal.table === '3tambores' ? 'inscricoes_3tambores' : 'inscricoes_expogoiabal';

      // Remover imediatamente da tela (Optimistic Update)
      if (deleteConfirmModal.table === '3tambores') {
        setInscricoesTambores(prev => prev.filter(i => i.id !== deleteConfirmModal.idToDelete));
      } else {
        setInscricoes(prev => prev.filter(i => i.id !== deleteConfirmModal.idToDelete));
      }

      const { data, error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', deleteConfirmModal.idToDelete)
        .select();
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Se a exclusão falhar silenciosamente (ex: bloqueio de RLS), recarregamos
        if (deleteConfirmModal.table === '3tambores') {
          fetchInscricoesTambores();
        } else {
          fetchInscricoes();
        }
        throw new Error('A exclusão foi bloqueada pelo banco de dados (RLS).');
      }
      
      setFeedbackModal({ isOpen: true, type: 'success', message: 'Registro apagado com sucesso!' });
    } catch (error) {
      console.error('Erro ao apagar registro:', error);
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao apagar registro.' });
    } finally {
      setDeleteConfirmModal({ isOpen: false, idToDelete: null, table: 'expogoiabal' });
      setLoading(false);
    }
  };

  const fetchFotosConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .in('chave', [
          'fotos_galeria_quinta',
          'fotos_galeria_sexta',
          'fotos_galeria_sabado',
          'fotos_galeria_domingo',
        ]);
      if (error) throw error;
      if (data) {
        data.forEach((item) => {
          if (item.chave === 'fotos_galeria_quinta') setLinkQuinta(item.valor || '');
          if (item.chave === 'fotos_galeria_sexta') setLinkSexta(item.valor || '');
          if (item.chave === 'fotos_galeria_sabado') setLinkSabado(item.valor || '');
          if (item.chave === 'fotos_galeria_domingo') setLinkDomingo(item.valor || '');
        });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações de fotos:', error);
      // Fallback to localStorage
      setLinkQuinta(localStorage.getItem('fotos_galeria_quinta') || '');
      setLinkSexta(localStorage.getItem('fotos_galeria_sexta') || '');
      setLinkSabado(localStorage.getItem('fotos_galeria_sabado') || '');
      setLinkDomingo(localStorage.getItem('fotos_galeria_domingo') || '');
    }
  };

  const fetchTrucoDados = async () => {
    try {
      const [eqs, st] = await Promise.all([
        buscarTodasEquipesAdmin(),
        buscarStatusTorneio()
      ]);
      setEquipesTruco(eqs);
      setStatusTruco(st);
    } catch (err) {
      console.error('Erro ao buscar dados do truco:', err);
    }
  };

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

    setProcessandoStatusId(equipe.id);
    try {
      if (novoStatus === 'aprovado') {
        await aprovarEquipe(equipe.id);
      } else {
        await reprovarEquipe(equipe.id);
      }
      await fetchTrucoDados();
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        message: `Equipe "${equipe.nome}" ${novoStatus === 'aprovado' ? 'APROVADA com sucesso e adicionada ao torneio!' : 'REPROVADA e desabilitada para o torneio.'}`
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        message: 'Erro ao alterar status da equipe: ' + (err?.message || '')
      });
    } finally {
      setProcessandoStatusId(null);
      setModalConfirmacaoStatus({ isOpen: false, equipe: null, novoStatus: 'aprovado' });
    }
  };

  useEffect(() => {
    fetchInscricoes();
    fetchInscricoesTambores();
    fetchFotosConfig();
    fetchTrucoDados();
  }, []);

  const handleAcionarSorteio = async () => {
    const equipesAprovadas = equipesTruco.filter(e => (e.status || 'aprovado') === 'aprovado');
    if (equipesAprovadas.length < 4) {
      setFeedbackModal({ 
        isOpen: true, 
        type: 'error', 
        message: `É necessário ter no mínimo 4 equipes APROVADAS para realizar o sorteio. (Atualmente aprovadas: ${equipesAprovadas.length})` 
      });
      return;
    }
    if (equipesAprovadas.length % 2 !== 0) {
      setFeedbackModal({ 
        isOpen: true, 
        type: 'error', 
        message: `A quantidade de equipes APROVADAS precisa ser PAR para gerar rodadas simultâneas. (Atualmente aprovadas: ${equipesAprovadas.length})` 
      });
      return;
    }

    setAcionandoSorteio(true);
    try {
      const res = await acionarSorteioPublicoAdmin(equipesAprovadas);
      if (res.sucesso) {
        await fetchTrucoDados();
        setFeedbackModal({ 
          isOpen: true, 
          type: 'success', 
          message: '🎲 Sorteio acionado com sucesso! A tela pública (/ExpoGoiabal/Truco/Sorteio) já iniciou a transmissão ao vivo.' 
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
    if (!window.confirm('Tem certeza que deseja resetar o sorteio do truco? Isso limpará todas as partidas e voltará ao estado de espera.')) {
      return;
    }
    try {
      await resetarTorneio();
      await fetchTrucoDados();
      setFeedbackModal({ isOpen: true, type: 'success', message: 'Sorteio resetado com sucesso. Status voltou para: Aguardando Sorteio.' });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao resetar: ' + (err?.message || '') });
    }
  };

  const handleExcluirEquipe = async (equipeId: string, equipeNome: string) => {
    if (!window.confirm(`Deseja realmente excluir a equipe "${equipeNome}" do torneio?`)) {
      return;
    }
    setExcluindoTimeId(equipeId);
    try {
      await excluirEquipe(equipeId);
      setEquipesTruco(prev => prev.filter(e => e.id !== equipeId));
      await fetchTrucoDados();
      setFeedbackModal({ isOpen: true, type: 'success', message: `Equipe "${equipeNome}" excluída com sucesso!` });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao excluir equipe: ' + (err?.message || '') });
    } finally {
      setExcluindoTimeId(null);
    }
  };

  const handleExcluirTodasEquipes = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Deseja realmente excluir TODAS as equipes cadastradas no torneio de truco?')) {
      return;
    }
    setLoading(true);
    try {
      await excluirTodasEquipes();
      setEquipesTruco([]);
      await fetchTrucoDados();
      setFeedbackModal({ isOpen: true, type: 'success', message: 'Todas as equipes e confrontos foram excluídos com sucesso.' });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao excluir equipes: ' + (err?.message || '') });
    } finally {
      setLoading(false);
    }
  };

  const handlePopularNovamente = async () => {
    setLoading(true);
    try {
      await popularTimesFicticios();
      await fetchTrucoDados();
      setFeedbackModal({ isOpen: true, type: 'success', message: '08 equipes de teste cadastradas com sucesso!' });
    } catch (err: any) {
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao cadastrar equipes: ' + (err?.message || '') });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFotos = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save locally as a fallback
      localStorage.setItem('fotos_galeria_quinta', linkQuinta);
      localStorage.setItem('fotos_galeria_sexta', linkSexta);
      localStorage.setItem('fotos_galeria_sabado', linkSabado);
      localStorage.setItem('fotos_galeria_domingo', linkDomingo);

      // Save to Supabase (using upsert)
      const { error } = await supabase
        .from('configuracoes')
        .upsert([
          { chave: 'fotos_galeria_quinta', valor: linkQuinta, updated_at: new Date().toISOString() },
          { chave: 'fotos_galeria_sexta', valor: linkSexta, updated_at: new Date().toISOString() },
          { chave: 'fotos_galeria_sabado', valor: linkSabado, updated_at: new Date().toISOString() },
          { chave: 'fotos_galeria_domingo', valor: linkDomingo, updated_at: new Date().toISOString() }
        ], { onConflict: 'chave' });

      if (error) throw error;

      setFeedbackModal({ isOpen: true, type: 'success', message: 'Links das fotos salvos com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar configurações de fotos:', error);
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao salvar os links no banco de dados. Salvou apenas localmente.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInscricoes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inscricoes_expogoiabal')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar inscrições:', error);
    } else {
      setInscricoes(data || []);
    }
    setLoading(false);
  };

  const fetchInscricoesTambores = async () => {
    const { data, error } = await supabase
      .from('inscricoes_3tambores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar inscrições 3 Tambores:', error);
    } else {
      setInscricoesTambores(data || []);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('inscricoes_expogoiabal')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar status:', error);
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao atualizar status.' });
    } else {
      fetchInscricoes();
    }
  };

  const handleUpdateStatusTambores = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('inscricoes_3tambores')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar status:', error);
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao atualizar status.' });
    } else {
      fetchInscricoesTambores();
    }
  };

  const handleUploadDocumento = async (id: string, file: File | undefined) => {
    if (!file) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}_${Date.now()}.${fileExt}`;
    const filePath = `documentos/${fileName}`;

    try {
      setLoading(true);
      const { error: uploadError } = await supabase.storage
        .from('documentos_inscricao')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('documentos_inscricao')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('inscricoes_expogoiabal')
        .update({ documento_url: publicUrlData.publicUrl })
        .eq('id', id);

      if (updateError) throw updateError;
      
      setFeedbackModal({ isOpen: true, type: 'success', message: 'Documento enviado com sucesso!' });
      fetchInscricoes();
    } catch (error) {
      console.error('Erro no upload de documento:', error);
      setFeedbackModal({ isOpen: true, type: 'error', message: 'Erro ao fazer upload do documento.' });
    } finally {
      setLoading(false);
    }
  };

  // Listas filtradas globalmente
  const embaixadoras = inscricoes.filter(i => i.modalidade === 'Embaixadora');
  const madrinhas = inscricoes.filter(i => i.modalidade === 'Madrinha');
  const mirins = inscricoes.filter(i => i.modalidade === 'Peão Mirim');

  const totalCorte = embaixadoras.length + madrinhas.length;

  // Lógica de filtro para visualização da Corte (Embaixadora/Madrinha)
  const inscricoesCorte = inscricoes.filter(i => 
    (i.modalidade === 'Embaixadora' || i.modalidade === 'Madrinha') &&
    (filtroModalidade === 'Todos' || i.modalidade === filtroModalidade)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
      {/* Admin Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => view === 'menu' ? navigate('/ExpoGoiabal/Inicio') : setView('menu')} 
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
              <Shield className="text-yellow-500" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-white">Painel Admin</h1>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Prefeitura Integrada</p>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-semibold transition-colors text-red-400 hover:text-red-300" onClick={() => navigate('/ExpoGoiabal/Inicio')}>
          Sair
        </button>
      </header>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in slide-in-from-bottom-8 fade-in duration-700">
        
        {view === 'menu' && (
          <div className="z-10 w-full max-w-6xl mt-8 flex flex-col gap-12 animate-in fade-in duration-1000 mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Selecione a Categoria
              </h2>
              <p className="mt-4 text-zinc-400 uppercase tracking-widest text-sm font-semibold">Escolha qual módulo deseja administrar</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4 mt-6">
              {/* Card 1: Embaixadora */}
              <div 
                onClick={() => { setFiltroModalidade('Todos'); setView('embaixadora'); }}
                className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
              >
                <img 
                  src="/Embaixadora.png" 
                  alt="Inscrição Embaixadora" 
                  className="w-3/5 max-w-[260px] h-auto rounded-3xl drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-500"
                />
                <span className="mt-5 text-lg font-bold uppercase tracking-widest text-zinc-400 group-hover:text-yellow-500 transition-colors">
                  Corte Real
                </span>
              </div>

              {/* Card 2: 3 Tambores */}
              <div 
                onClick={() => setView('tambores')}
                className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
              >
                <img 
                  src="/Tambores.png" 
                  alt="Inscrição 3 Tambores" 
                  className="w-3/5 max-w-[260px] h-auto rounded-3xl drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-500"
                />
                <span className="mt-5 text-lg font-bold uppercase tracking-widest text-zinc-400 group-hover:text-cyan-400 transition-colors">
                  3 Tambores
                </span>
              </div>

              {/* Card 3: Peão Mirim */}
              <div 
                onClick={() => setView('mirim')}
                className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
              >
                <img 
                  src="/Mirim.png" 
                  alt="Inscrição Peão Mirim" 
                  className="w-3/5 max-w-[260px] h-auto rounded-3xl drop-shadow-[0_0_15px_rgba(255,100,0,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(255,100,0,0.6)] transition-all duration-500"
                />
                <span className="mt-5 text-lg font-bold uppercase tracking-widest text-zinc-400 group-hover:text-orange-500 transition-colors">
                  Peão Mirim
                </span>
              </div>

              {/* Card 4: Fotos Oficiais */}
              <div 
                onClick={() => setView('fotos')}
                className="cursor-pointer group flex flex-col items-center justify-center transition-all duration-500 hover:scale-105"
              >
                <img 
                  src="/banner-fotos.png" 
                  alt="Fotos Oficiais" 
                  className="w-3/5 max-w-[260px] aspect-square object-cover rounded-3xl drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(234,179,8,0.6)] transition-all duration-500"
                />
                <span className="mt-5 text-lg font-bold uppercase tracking-widest text-zinc-400 group-hover:text-yellow-500 transition-colors">
                  Fotos Oficiais
                </span>
              </div>
            </div>

            {/* CARD EXCLUSIVO: 🎲 SORTEIO — 2º TORNEIO DE TRUCO */}
            {(() => {
              const equipesAprovadas = equipesTruco.filter(e => (e.status || 'aprovado') === 'aprovado');
              const equipesPendentes = equipesTruco.filter(e => e.status === 'pendente');
              const isParEApto = equipesAprovadas.length >= 4 && equipesAprovadas.length % 2 === 0;

              return (
                <div className="w-full bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col lg:flex-row items-center justify-between gap-6 mt-4">
                  <div className="flex flex-col gap-2.5 max-w-2xl text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 self-center lg:self-start px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
                      <Dices size={14} className="animate-spin" />
                      <span>Módulo Oficial • 2º Torneio de Truco</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                      🎲 SORTEIO — 2º TORNEIO DE TRUCO
                    </h3>
                    
                    {/* Informações Requeridas */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-zinc-300 mt-1">
                      <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-2 rounded-xl border border-white/10">
                        <Users size={15} className="text-emerald-400" />
                        <span>
                          <strong className="text-white">Times Aprovados:</strong> {equipesAprovadas.length} ({isParEApto ? 'Par e Apto ✅' : 'Necessário número Par ≥ 4 ⚠️'})
                        </span>
                      </div>
                      
                      {equipesPendentes.length > 0 && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl text-amber-400 animate-pulse">
                          <Clock size={14} />
                          <span><strong>{equipesPendentes.length} time(s) pendente(s) de aprovação</strong></span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-2 rounded-xl border border-white/10">
                        <strong className="text-white">Status do sorteio:</strong>
                        {statusTruco?.sorteio_primeira_fase_confirmado ? (
                          <span className="text-emerald-400 font-black">🟢 Sorteio Realizado</span>
                        ) : (
                          <span className="text-amber-400 font-black">🟡 Aguardando sorteio</span>
                        )}
                      </div>
                    </div>

                    <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                      <strong className="text-zinc-300">Situação atual: </strong>
                      {statusTruco?.sorteio_primeira_fase_confirmado
                        ? 'O sorteio oficial já foi transmitido. As partidas da 1ª fase estão geradas e disponíveis no calendário.'
                        : 'Aguardando comando. Ao clicar em "ACIONAR SORTEIO", a tela pública transmitirá imediatamente a apresentação oficial dos times aprovados.'}
                    </p>
                  </div>

                  {/* Botões de Ação do Administrador */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() => setMostrarGerenciadorTimes(prev => !prev)}
                      className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md relative ${
                        mostrarGerenciadorTimes
                          ? 'bg-zinc-800 text-white border-white/20'
                          : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10'
                      }`}
                    >
                      <Users size={15} className="text-teal-400" />
                      <span>{mostrarGerenciadorTimes ? 'Ocultar Equipes' : `Gerenciar Equipes (${equipesTruco.length})`}</span>
                      {equipesPendentes.length > 0 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute -top-1 -right-1 animate-ping"></span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { window.scrollTo(0, 0); navigate('/Admin/Truco/Partidas'); }}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black border border-emerald-400/30 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:scale-105"
                    >
                      <Swords size={15} className="text-black" />
                      <span>Lançar / Gerenciar Placares</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open('/ExpoGoiabal/Truco/Sorteio', '_blank')}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                    >
                      <ExternalLink size={15} className="text-emerald-400" />
                      <span>Tela Pública</span>
                    </button>

                    {statusTruco?.sorteio_primeira_fase_confirmado && (
                      <button
                        type="button"
                        onClick={handleResetarSorteio}
                        className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        title="Resetar sorteio para fazer novamente"
                      >
                        <RotateCcw size={14} />
                        <span>Resetar Sorteio</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleAcionarSorteio}
                      disabled={acionandoSorteio || !isParEApto}
                      className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                        !isParEApto
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                          : statusTruco?.sorteio_primeira_fase_confirmado
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
                          : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-amber-500/40 hover:scale-105'
                      }`}
                    >
                      <Dices size={18} />
                      <span>
                        {acionandoSorteio
                          ? 'Acionando...'
                          : statusTruco?.sorteio_primeira_fase_confirmado
                          ? 'RE-ACIONAR SORTEIO'
                          : 'ACIONAR SORTEIO'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* SEÇÃO EXPANSÍVEL: GERENCIADOR E APROVAÇÃO DE EQUIPES */}
            {mostrarGerenciadorTimes && (() => {
              const totalCadastrados = equipesTruco.length;
              const pendentes = equipesTruco.filter(e => e.status === 'pendente');
              const aprovados = equipesTruco.filter(e => (e.status || 'aprovado') === 'aprovado');
              const reprovados = equipesTruco.filter(e => e.status === 'reprovado');
              const disponiveisTorneio = aprovados.length;

              const listaFiltrada = equipesTruco.filter(e => {
                if (filtroStatusTruco === 'pendente') return e.status === 'pendente';
                if (filtroStatusTruco === 'aprovado') return (e.status || 'aprovado') === 'aprovado';
                if (filtroStatusTruco === 'reprovado') return e.status === 'reprovado';
                return true;
              });

              return (
                <div className="w-full bg-zinc-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  
                  {/* Header do Gerenciador */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                        <h4 className="text-xl font-black uppercase tracking-wider text-white">
                          Gerenciamento & Moderação de Times
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium mt-1">
                        Aprove ou reprove os cadastros. Somente times <strong className="text-emerald-400">APROVADOS</strong> aparecem publicamente e participam do torneio.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={handlePopularNovamente}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Dices size={14} />
                        <span>⚡ Inserir 08 Times de Teste</span>
                      </button>

                      {equipesTruco.length > 0 && (
                        <button
                          type="button"
                          onClick={handleExcluirTodasEquipes}
                          className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Excluir Todas</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RESUMO DE STATUS NO TOPO */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Times Cadastrados</span>
                      <span className="text-2xl font-black text-white mt-1">{totalCadastrados}</span>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <Clock size={13} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Pendentes</span>
                      </div>
                      <span className="text-2xl font-black text-amber-400 mt-1">{pendentes.length}</span>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <BadgeCheck size={13} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Aprovados</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-400 mt-1">{aprovados.length}</span>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col">
                      <div className="flex items-center gap-1.5 text-red-400">
                        <X size={13} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Reprovados</span>
                      </div>
                      <span className="text-2xl font-black text-red-400 mt-1">{reprovados.length}</span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col shadow-inner">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Disponíveis p/ Torneio</span>
                      <span className="text-2xl font-black text-emerald-400 mt-1">{disponiveisTorneio}</span>
                    </div>
                  </div>

                  {/* ABAS DE FILTRO */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/5 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setFiltroStatusTruco('todos')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        filtroStatusTruco === 'todos'
                          ? 'bg-zinc-700 text-white shadow-md'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Todos ({totalCadastrados})
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroStatusTruco('pendente')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        filtroStatusTruco === 'pendente'
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                          : 'bg-zinc-800/60 text-amber-400 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🟡 Pendentes</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{pendentes.length}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroStatusTruco('aprovado')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        filtroStatusTruco === 'aprovado'
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                          : 'bg-zinc-800/60 text-emerald-400 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🟢 Aprovados</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{aprovados.length}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFiltroStatusTruco('reprovado')}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        filtroStatusTruco === 'reprovado'
                          ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                          : 'bg-zinc-800/60 text-red-400 hover:bg-zinc-800'
                      }`}
                    >
                      <span>🔴 Reprovados</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{reprovados.length}</span>
                    </button>
                  </div>

                  {/* Lista de Equipes */}
                  {listaFiltrada.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                      <Users size={36} className="text-zinc-600" />
                      <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                        Nenhuma equipe encontrada com o filtro selecionado
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listaFiltrada.map((time) => {
                        const statusAtual = (time.status || 'aprovado') as TrucoStatusEquipe;
                        const titulares = (time.jogadores || []).filter(j => j.is_titular !== false);
                        const reservas = (time.jogadores || []).filter(j => j.is_titular === false);
                        const isProcessando = processandoStatusId === time.id;

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
                            className={`border rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all duration-300 ${
                              statusAtual === 'pendente'
                                ? 'bg-amber-500/5 border-amber-500/40 hover:border-amber-500 shadow-amber-500/5'
                                : statusAtual === 'aprovado'
                                ? 'bg-black/40 border-emerald-500/30 hover:border-emerald-500/50'
                                : 'bg-red-950/20 border-red-500/30 hover:border-red-500/50 opacity-80'
                            }`}
                          >
                            {/* Topo do Card */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10 shrink-0 shadow-md">
                                  {time.foto_url ? (
                                    <img src={time.foto_url} alt={time.nome} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                      <Users size={22} />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h5 className="font-black text-base uppercase text-white tracking-wide">
                                    {time.nome}
                                  </h5>
                                  <span className="text-xs text-zinc-300 font-semibold block">
                                    📍 {time.cidade}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                    <Calendar size={11} />
                                    <span>Cadastrado em {dataCadastroFormatada}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Badge de Status */}
                              <div>
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

                            {/* Jogadores Cadastrados */}
                            <div className="bg-black/30 border border-white/5 rounded-xl p-3 text-xs flex flex-col gap-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                                  Titulares ({titulares.length}):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                  {titulares.map((t, tIdx) => (
                                    <div key={t.id || tIdx} className="text-zinc-300">
                                      <span className="font-bold text-white">{tIdx + 1}. {t.nome_completo}</span>
                                      <span className="text-[9px] text-zinc-400 block">CPF: {t.cpf} • Nasc: {t.data_nascimento}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {reservas.length > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                                    Reserva ({reservas.length}):
                                  </span>
                                  <div className="text-[11px] text-zinc-300">
                                    {reservas.map((r, rIdx) => (
                                      <div key={r.id || rIdx}>
                                        <span className="font-bold text-white">• {r.nome_completo}</span>
                                        <span className="text-[9px] text-zinc-400 block">CPF: {r.cpf} • Nasc: {r.data_nascimento}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Ações Administrativas */}
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                {statusAtual === 'pendente' && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isProcessando}
                                      onClick={() => handleAbrirModalStatus(time, 'aprovado')}
                                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-105"
                                    >
                                      <Check size={14} />
                                      <span>Aprovar Time</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isProcessando}
                                      onClick={() => handleAbrirModalStatus(time, 'reprovado')}
                                      className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
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
                                    className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                                    title="Revogar aprovação e reprovar time"
                                  >
                                    <X size={12} />
                                    <span>Reprovar</span>
                                  </button>
                                )}

                                {statusAtual === 'reprovado' && (
                                  <button
                                    type="button"
                                    disabled={isProcessando}
                                    onClick={() => handleAbrirModalStatus(time, 'aprovado')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                                    title="Aprovar time reprovado"
                                  >
                                    <Check size={12} />
                                    <span>Re-Aprovar</span>
                                  </button>
                                )}
                              </div>

                              {/* Botão Excluir Equipe */}
                              <button
                                type="button"
                                onClick={() => handleExcluirEquipe(time.id, time.nome)}
                                disabled={excluindoTimeId === time.id}
                                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-900/80 text-zinc-400 hover:text-white border border-white/10 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                                title={`Excluir definitivamente ${time.nome}`}
                              >
                                <Trash2 size={12} />
                                <span>{excluindoTimeId === time.id ? 'Excluindo...' : 'Excluir'}</span>
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })()}

            {/* MODAL DE CONFIRMAÇÃO DE APROVAÇÃO / REPROVAÇÃO */}
            {modalConfirmacaoStatus.isOpen && modalConfirmacaoStatus.equipe && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
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
                        Ao reprovar, o time será <strong className="text-white">impedido de participar</strong> do torneio e ficará oculto da visualização pública.
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalConfirmacaoStatus({ isOpen: false, equipe: null, novoStatus: 'aprovado' })}
                      className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmarStatusEquipe}
                      className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                        modalConfirmacaoStatus.novoStatus === 'aprovado'
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/30'
                      }`}
                    >
                      {modalConfirmacaoStatus.novoStatus === 'aprovado' ? 'Sim, Aprovar' : 'Sim, Reprovar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {view === 'tambores' && (
          <>
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
              <button 
                onClick={() => setView('menu')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Métricas: 3 Tambores</h2>
            </div>
        
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-shadow">
                <div className="absolute -right-6 -top-6 text-cyan-500/10 group-hover:scale-110 transition-transform duration-500">
                  <Shield size={120} />
                </div>
                <p className="text-cyan-500 font-semibold uppercase text-xs tracking-widest z-10">Total Inscrições</p>
                <h2 className="text-4xl font-black text-white z-10">{inscricoesTambores.length}</h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1 mt-2">
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                <h3 className="text-lg font-bold uppercase tracking-widest">Registros 3 Tambores</h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500">
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Carregando inscrições...</p>
                  </div>
                ) : inscricoesTambores.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500 animate-in fade-in">
                    <Shield size={48} className="opacity-20" />
                    <p>Nenhuma inscrição encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-zinc-950/50 border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
                        <th className="p-4 font-semibold pl-6">Nome Completo</th>
                        <th className="p-4 font-semibold">Idade</th>
                        <th className="p-4 font-semibold">Cidade</th>
                        <th className="p-4 font-semibold">Nome do Cavalo</th>
                        <th className="p-4 font-semibold">WhatsApp</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right pr-6">Registro</th>
                        <th className="p-4 font-semibold text-center pr-6">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {inscricoesTambores.map((inscricao) => (
                        <tr 
                          key={inscricao.id}
                          className="hover:bg-zinc-800/30 transition-colors group"
                        >
                          <td className="p-4 pl-6">
                            <div className="font-bold text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-black text-cyan-500 shrink-0">
                                {inscricao.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span>{inscricao.nome}</span>
                                {inscricao.responsavel && (
                                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                    Resp: {inscricao.responsavel}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-400 text-sm font-medium">
                            {inscricao.idade ? `${inscricao.idade} anos` : '-'}
                          </td>
                          <td className="p-4 text-zinc-400 text-sm font-medium">
                            {inscricao.cidade || '-'}
                          </td>
                          <td className="p-4 text-zinc-400 text-sm font-medium">
                            {inscricao.nome_cavalo || '-'}
                          </td>
                          <td className="p-4 text-zinc-400 text-sm font-medium">
                            <a 
                              href={`https://wa.me/55${inscricao.whatsapp?.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-green-400 hover:text-green-300 transition-colors font-medium text-sm flex items-center gap-2 hover:underline"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                              {inscricao.whatsapp}
                            </a>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleUpdateStatusTambores(inscricao.id, inscricao.status === 'Confirmado' ? 'Pendente' : 'Confirmado')}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border ${
                                inscricao.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}
                            >
                              {inscricao.status === 'Confirmado' ? 'Confirmado' : 'Pendente'}
                            </button>
                          </td>
                          <td className="p-4 text-right text-zinc-500 text-xs pr-6">
                            {new Date(inscricao.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 text-center pr-6">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setSelectedVoucher(inscricao)}
                                className="text-yellow-500 hover:text-yellow-400 transition-colors p-2 rounded-full hover:bg-yellow-500/10"
                                title="Visualizar Comprovante"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmModal({ isOpen: true, idToDelete: inscricao.id, table: '3tambores' }); }}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                                title="Apagar Registro"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* --- VIEW: CORTE REAL (EMBAIXADORA E MADRINHA) --- */}
        {view === 'embaixadora' && (
          <>
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
              <button 
                onClick={() => setView('menu')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Métricas: Corte Real</h2>
            </div>
        
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group shadow-lg hover:shadow-xl transition-shadow">
                <div className="absolute -right-6 -top-6 text-zinc-800/50 group-hover:scale-110 transition-transform duration-500">
                  <Users size={120} />
                </div>
                <p className="text-zinc-400 font-semibold uppercase text-xs tracking-widest z-10">Total Inscrições</p>
                <h2 className="text-4xl font-black text-white z-10">{totalCorte}</h2>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group shadow-[0_0_15px_rgba(255,215,0,0.05)] hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] transition-shadow">
                <div className="absolute -right-6 -top-6 text-yellow-500/10 group-hover:scale-110 transition-transform duration-500">
                  <Shield size={120} />
                </div>
                <p className="text-yellow-500 font-semibold uppercase text-xs tracking-widest z-10">Embaixadoras</p>
                <h2 className="text-4xl font-black text-white z-10">{embaixadoras.length}</h2>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-shadow">
                <div className="absolute -right-6 -top-6 text-cyan-500/10 group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle size={120} />
                </div>
                <p className="text-cyan-500 font-semibold uppercase text-xs tracking-widest z-10">Madrinhas</p>
                <h2 className="text-4xl font-black text-white z-10">{madrinhas.length}</h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1">
              {/* Toolbar */}
              <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50">
                <h3 className="text-lg font-bold uppercase tracking-widest">Registros</h3>
                
                <div className="flex items-center gap-2 w-full sm:w-auto bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
                  {['Todos', 'Embaixadora', 'Madrinha'].map(mod => (
                    <button
                      key={mod}
                      onClick={() => setFiltroModalidade(mod)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none ${
                        filtroModalidade === mod 
                          ? 'bg-zinc-800 text-white shadow-md' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500">
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Carregando inscrições...</p>
                  </div>
                ) : inscricoesCorte.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500 animate-in fade-in">
                    <Users size={48} className="opacity-20" />
                    <p>Nenhuma inscrição encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-zinc-950/50 border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
                        <th className="p-4 font-semibold pl-6">Candidata</th>
                        <th className="p-4 font-semibold">Modalidade</th>
                        <th className="p-4 font-semibold">Data Nasc.</th>
                        <th className="p-4 font-semibold">WhatsApp</th>
                        <th className="p-4 font-semibold">Vídeo</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Documento</th>
                        <th className="p-4 font-semibold text-right pr-6">Registro</th>
                        <th className="p-4 font-semibold text-center pr-6">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {inscricoesCorte.map((inscricao) => (
                        <tr key={inscricao.id} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="p-4 pl-6">
                            <div className="font-bold text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400">
                                {inscricao.nome.charAt(0).toUpperCase()}
                              </div>
                              {inscricao.nome}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              inscricao.modalidade === 'Embaixadora' 
                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(255,215,0,0.1)]' 
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                            }`}>
                              {inscricao.modalidade}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 text-sm">
                            {inscricao.data_nascimento ? new Date(inscricao.data_nascimento).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="p-4 text-zinc-400 text-sm">
                            <a href={`https://wa.me/55${inscricao.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-green-400 hover:underline transition-colors flex items-center gap-2">
                              {inscricao.whatsapp}
                            </a>
                          </td>
                          <td className="p-4">
                            {inscricao.video_url ? (
                              <a href={inscricao.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold bg-cyan-400/10 px-3 py-1.5 rounded-lg w-fit border border-cyan-400/20 hover:bg-cyan-400/20">
                                <Video size={14} />
                                Assistir
                              </a>
                            ) : (
                              <span className="text-zinc-600 text-sm italic">Sem vídeo</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => handleUpdateStatus(inscricao.id, inscricao.status === 'Confirmado' ? 'Pendente' : 'Confirmado')}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border ${
                                inscricao.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}
                            >
                              {inscricao.status === 'Confirmado' ? 'Confirmado' : 'Pendente'}
                            </button>
                          </td>
                          <td className="p-4">
                            <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm font-semibold bg-indigo-400/10 px-3 py-1.5 rounded-lg w-fit border border-indigo-400/20 hover:bg-indigo-400/20">
                              <Upload size={14} />
                              <span>{inscricao.documento_url ? 'Atualizar' : 'Upload'}</span>
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => handleUploadDocumento(inscricao.id, e.target.files?.[0])}
                              />
                            </label>
                            {inscricao.documento_url && (
                              <a href={inscricao.documento_url} target="_blank" rel="noreferrer" className="text-[11px] text-zinc-500 hover:text-indigo-300 underline mt-1.5 flex items-center gap-1 w-max">
                                <FileText size={12} /> Ver documento
                              </a>
                            )}
                          </td>
                          <td className="p-4 text-right text-zinc-500 text-xs pr-6">
                            {new Date(inscricao.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4 text-center pr-6">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmModal({ isOpen: true, idToDelete: inscricao.id, table: 'expogoiabal' }); }}
                              className="text-zinc-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                              title="Apagar Registro"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* --- VIEW: PEÃO MIRIM --- */}
        {view === 'mirim' && (
          <>
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
              <button 
                onClick={() => setView('menu')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Métricas: Peão Mirim</h2>
            </div>
        
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden group shadow-lg hover:shadow-[0_0_20px_rgba(255,100,0,0.1)] transition-shadow">
                <div className="absolute -right-6 -top-6 text-orange-500/10 group-hover:scale-110 transition-transform duration-500">
                  <Baby size={120} />
                </div>
                <p className="text-orange-500 font-semibold uppercase text-xs tracking-widest z-10">Total Inscrições</p>
                <h2 className="text-4xl font-black text-white z-10">{mirins.length}</h2>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-1 mt-2">
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                <h3 className="text-lg font-bold uppercase tracking-widest">Registros Peão Mirim</h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500">
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p>Carregando inscrições...</p>
                  </div>
                ) : mirins.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500 animate-in fade-in">
                    <Baby size={48} className="opacity-20" />
                    <p>Nenhuma inscrição encontrada.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-zinc-950/50 border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
                        <th className="p-4 font-semibold pl-6 w-10"></th>
                        <th className="p-4 font-semibold">Peão Mirim</th>
                        <th className="p-4 font-semibold">Idade / Peso</th>
                        <th className="p-4 font-semibold">Vídeo</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Documento</th>
                        <th className="p-4 font-semibold text-right pr-6">Registro</th>
                        <th className="p-4 font-semibold text-center pr-6">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {mirins.map((inscricao) => (
                        <React.Fragment key={inscricao.id}>
                          <tr 
                            onClick={() => setExpandedRowId(expandedRowId === inscricao.id ? null : inscricao.id)}
                            className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                          >
                            <td className="p-4 pl-6 text-zinc-500 group-hover:text-white transition-colors">
                              {expandedRowId === inscricao.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-black text-orange-500 shrink-0">
                                  {inscricao.nome.charAt(0).toUpperCase()}
                                </div>
                                {inscricao.nome}
                              </div>
                            </td>
                            <td className="p-4 text-zinc-400 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <span>{inscricao.idade ? `${inscricao.idade} anos` : '-'}</span>
                                <span className="text-zinc-600">•</span>
                                <span>{inscricao.peso ? `${inscricao.peso} kg` : '-'}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              {inscricao.video_url ? (
                                <a 
                                  href={inscricao.video_url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-sm font-semibold bg-orange-400/10 px-3 py-1.5 rounded-lg w-fit border border-orange-400/20 hover:bg-orange-400/20"
                                >
                                  <Video size={14} />
                                  Assistir
                                </a>
                              ) : (
                                <span className="text-zinc-600 text-sm italic">Sem vídeo</span>
                              )}
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(inscricao.id, inscricao.status === 'Confirmado' ? 'Pendente' : 'Confirmado');
                                }}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors border ${
                                  inscricao.status === 'Confirmado' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}
                              >
                                {inscricao.status === 'Confirmado' ? 'Confirmado' : 'Pendente'}
                              </button>
                            </td>
                            <td className="p-4">
                              <label 
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm font-semibold bg-indigo-400/10 px-3 py-1.5 rounded-lg w-fit border border-indigo-400/20 hover:bg-indigo-400/20"
                              >
                                <Upload size={14} />
                                <span>{inscricao.documento_url ? 'Atualizar' : 'Upload'}</span>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={(e) => handleUploadDocumento(inscricao.id, e.target.files?.[0])}
                                />
                              </label>
                              {inscricao.documento_url && (
                                <a 
                                  href={inscricao.documento_url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-zinc-500 hover:text-indigo-300 underline mt-1.5 flex items-center gap-1 w-max"
                                >
                                  <FileText size={12} /> Ver documento
                                </a>
                              )}
                            </td>
                            <td className="p-4 text-right text-zinc-500 text-xs pr-6">
                              {new Date(inscricao.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="p-4 text-center pr-6">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmModal({ isOpen: true, idToDelete: inscricao.id, table: 'expogoiabal' }); }}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
                                title="Apagar Registro"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {expandedRowId === inscricao.id && (
                            <tr className="bg-zinc-900/40 border-b border-zinc-800/50">
                              <td colSpan={8} className="p-4 pl-16">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <div>
                                    <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-black block mb-1">Responsável</span>
                                    <span className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                                      <Users size={14} className="text-zinc-500" />
                                      {inscricao.responsavel || '-'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-black block mb-1">WhatsApp</span>
                                    <a 
                                      href={`https://wa.me/55${inscricao.whatsapp?.replace(/\D/g, '')}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-green-400 hover:text-green-300 transition-colors font-medium text-sm flex items-center gap-2"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                      {inscricao.whatsapp}
                                    </a>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'fotos' && (
          <>
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
              <button 
                onClick={() => setView('menu')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 uppercase tracking-widest text-xs"
              >
                <ArrowLeft size={14} /> Voltar
              </button>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Fotos Oficiais: Links das Galerias</h2>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto w-full shadow-2xl mt-4">
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Preencha os links das galerias externas para cada dia do evento. Os botões na página oficial de fotos redirecionarão as pessoas para estes links automaticamente assim que a data de liberação for atingida.
              </p>

              <form onSubmit={handleSaveFotos} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Link Quinta-feira (04/06)</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={linkQuinta}
                    onChange={e => setLinkQuinta(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-600 font-bold">Data de liberação pública: 08/06/2026</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Link Sexta-feira (05/06)</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={linkSexta}
                    onChange={e => setLinkSexta(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-600 font-bold">Data de liberação pública: 09/06/2026</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Link Sábado (06/06)</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={linkSabado}
                    onChange={e => setLinkSabado(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-600 font-bold">Data de liberação pública: 10/06/2026</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Link Domingo (07/06)</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={linkDomingo}
                    onChange={e => setLinkDomingo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-yellow-500 transition-all font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-600 font-bold">Data de liberação pública: 11/06/2026</span>
                </div>

                <button 
                  type="submit"
                  className="mt-4 w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-[1.01] text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,215,0,0.25)] cursor-pointer"
                >
                  Salvar Configurações
                </button>
              </form>
            </div>
          </>
        )}

      </main>

      {/* Modal de Feedback */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`bg-zinc-900 border ${feedbackModal.type === 'error' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'} rounded-3xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-300`}>
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${feedbackModal.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                {feedbackModal.type === 'error' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ) : (
                  <CheckCircle size={32} />
                )}
              </div>
              <h3 className="text-xl font-bold text-white">{feedbackModal.type === 'error' ? 'Ops! Ocorreu um erro' : 'Sucesso'}</h3>
              <p className="text-zinc-400">{feedbackModal.message}</p>
              <button 
                onClick={() => setFeedbackModal({ isOpen: false, type: 'success', message: '' })}
                className="mt-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-red-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-500/20 to-transparent"></div>
            
            <div className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                <Trash2 size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Apagar Registro?
                </h3>
                <div className="h-1 w-16 bg-red-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-zinc-300 leading-relaxed text-lg">
                Tem certeza que deseja apagar esta inscrição permanentemente?
              </p>
              
              <p className="text-zinc-400 text-sm">
                Esta ação <strong className="text-red-400">não pode ser desfeita</strong> e todos os dados serão perdidos.
              </p>

              <div className="flex gap-4 w-full mt-4">
                <button 
                  onClick={() => setDeleteConfirmModal({ isOpen: false, idToDelete: null, table: 'expogoiabal' })}
                  className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:scale-[1.02] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Apagar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprovante de Inscrição */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(234,179,8,0.25)] overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
            
            <div className="p-6 flex justify-between items-center bg-zinc-900 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="text-yellow-500" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Comprovante</h2>
              </div>
              <button 
                onClick={() => setSelectedVoucher(null)}
                className="text-zinc-400 hover:text-white transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              {/* Comprovante Visual Container (Unified Digital Receipt Card) */}
              <div id="voucher-card" className="w-full bg-zinc-950/80 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-3.5 text-left font-sans text-xs relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                {/* Gold accent vertical line on the left side */}
                <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500"></div>

                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800/80">
                  <img src="/logo.png" alt="Logo ExpoGoiabal" className="h-9 object-contain drop-shadow-[0_0_6px_rgba(255,215,0,0.2)]" />
                  <div className="text-right">
                    <span className="block font-black uppercase text-[9px] tracking-widest text-yellow-500">
                      3 Tambores
                    </span>
                    <span className="block text-[7px] uppercase tracking-wider text-zinc-400">
                      ExpoGoiabal 2026
                    </span>
                  </div>
                </div>

                {/* Highly visible unique Registration ID section */}
                <div className="bg-black/60 px-3 py-2.5 rounded-xl border border-yellow-500/20 flex flex-col items-center gap-0.5 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold">
                    Código de Inscrição (ID)
                  </span>
                  <span className="text-2xl font-black text-yellow-500 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(255,215,0,0.25)]">
                    {getRegistrationId(selectedVoucher.id)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-0.5">
                  <div className="flex flex-col col-span-2">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Competidora</span>
                    <span className="text-white font-bold truncate text-xs">{selectedVoucher.nome}</span>
                  </div>
                  {selectedVoucher.responsavel && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Responsável</span>
                      <span className="text-white font-bold truncate text-xs">{selectedVoucher.responsavel}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Cavalo</span>
                    <span className="text-white font-bold truncate text-xs">{selectedVoucher.nome_cavalo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Idade</span>
                    <span className="text-white font-semibold truncate text-xs">{selectedVoucher.idade} anos</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Cidade</span>
                    <span className="text-white font-semibold truncate text-xs">{selectedVoucher.cidade}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">WhatsApp</span>
                    <span className="text-white font-semibold truncate text-xs">{selectedVoucher.whatsapp}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Status</span>
                    <span className="text-yellow-500 font-black text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">Aguardando Validação</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center text-[9px] text-zinc-400 font-medium">
                  <span>Confirmação: {new Date(selectedVoucher.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedVoucher.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-yellow-500/80 font-bold uppercase tracking-wider text-[7px]">Oficial</span>
                </div>
              </div>

              {/* Botão de Download */}
              <button 
                onClick={() => downloadVoucherAsImage(selectedVoucher)}
                className="w-full mt-2 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload size={16} className="rotate-180" />
                Baixar Comprovante (PNG)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
