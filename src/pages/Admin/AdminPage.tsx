import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { Shield, Users, Video, ArrowLeft, CheckCircle, Baby, Upload, FileText, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'embaixadora' | 'tambores' | 'mirim'>('menu');
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [inscricoesTambores, setInscricoesTambores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroModalidade, setFiltroModalidade] = useState<string>('Todos');
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; type: 'success'|'error'; message: string }>({ isOpen: false, type: 'success', message: '' });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; idToDelete: string | null; table: 'expogoiabal' | '3tambores' }>({ isOpen: false, idToDelete: null, table: 'expogoiabal' });

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

  useEffect(() => {
    fetchInscricoes();
    fetchInscricoesTambores();
  }, []);

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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 mt-6">
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
            </div>
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
                        <th className="p-4 font-semibold pl-6 w-10"></th>
                        <th className="p-4 font-semibold">Competidor(a)</th>
                        <th className="p-4 font-semibold">Idade</th>
                        <th className="p-4 font-semibold">Cidade</th>
                        <th className="p-4 font-semibold text-right pr-6">Registro</th>
                        <th className="p-4 font-semibold text-center pr-6">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {inscricoesTambores.map((inscricao) => (
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
                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-black text-cyan-500 shrink-0">
                                  {inscricao.nome.charAt(0).toUpperCase()}
                                </div>
                                {inscricao.nome}
                              </div>
                            </td>
                            <td className="p-4 text-zinc-400 text-sm font-medium">
                              {inscricao.idade ? `${inscricao.idade} anos` : '-'}
                            </td>
                            <td className="p-4 text-zinc-400 text-sm font-medium">
                              {inscricao.cidade || '-'}
                            </td>
                            <td className="p-4 text-right text-zinc-500 text-xs pr-6">
                              {new Date(inscricao.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="p-4 text-center pr-6">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmModal({ isOpen: true, idToDelete: inscricao.id, table: '3tambores' }); }}
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
                              <td colSpan={6} className="p-4 pl-16">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                  <div>
                                    <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-black block mb-1">Nome do Cavalo</span>
                                    <span className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                                      {inscricao.nome_cavalo || '-'}
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

    </div>
  );
};
