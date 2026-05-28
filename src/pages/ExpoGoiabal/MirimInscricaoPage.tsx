import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { User, Phone, Upload, ArrowRight, ArrowLeft, CheckCircle, Video, RefreshCcw, ShieldCheck, X, Activity, Users, Info, ChevronDown } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const MirimInscricaoPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    peso: '',
    responsavel: '',
    whatsapp: '',
    video: null as File | null,
    termoAceito: false
  });
  const [isTermosOpen, setIsTermosOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [showVideoInfoModal, setShowVideoInfoModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showMissingVideoModal, setShowMissingVideoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const [confirmedPeoes, setConfirmedPeoes] = useState<any[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // 1. Fetch total count of registrations for Peão Mirim
        const { count, error: countError } = await supabase
          .from('inscricoes_expogoiabal')
          .select('*', { count: 'exact', head: true })
          .eq('modalidade', 'Peão Mirim');
        
        if (countError) throw countError;
        setTotalRegistrations(count || 0);

        // 2. Fetch confirmed peões
        const { data: confirmedData, error: confirmedError } = await supabase
          .from('inscricoes_expogoiabal')
          .select('nome, idade, responsavel')
          .eq('modalidade', 'Peão Mirim')
          .eq('status', 'Confirmado')
          .order('nome', { ascending: true });

        if (confirmedError) throw confirmedError;
        setConfirmedPeoes(confirmedData || []);

      } catch (err) {
        console.error('Erro ao carregar dados do Peão Mirim:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  const nextStep = () => {
    if (step === 2) {
      const pesoNum = parseFloat(formData.peso);
      if (!isNaN(pesoNum) && pesoNum > 30) {
        setShowWeightModal(true);
        return;
      }
    }

    const next = Math.min(step + 1, 5);
    if (next === 4 && step !== 4) {
      setShowVideoInfoModal(true);
    }
    setStep(next);
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'whatsapp') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      let formatted = cleaned;
      if (cleaned.length > 0) formatted = '(' + cleaned;
      if (cleaned.length > 2) formatted = '(' + cleaned.slice(0, 2) + ') ' + cleaned.slice(2);
      if (cleaned.length > 3) formatted = '(' + cleaned.slice(0, 2) + ') ' + cleaned.slice(2, 3) + ' ' + cleaned.slice(3);
      if (cleaned.length > 7) formatted = '(' + cleaned.slice(0, 2) + ') ' + cleaned.slice(2, 3) + ' ' + cleaned.slice(3, 7) + '-' + cleaned.slice(7);
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, video: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.video) {
      setShowMissingVideoModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      let video_url = null;

      // 1. Upload do vídeo se existir
      if (formData.video) {
        const fileExt = formData.video.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `mirim/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos_inscricao')
          .upload(filePath, formData.video);

        if (uploadError) {
          console.error("Supabase Upload Error:", uploadError);
          throw new Error(`Erro do Supabase: ${uploadError.message || JSON.stringify(uploadError)}`);
        }

        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from('videos_inscricao')
          .getPublicUrl(filePath);

        video_url = publicUrlData.publicUrl;
      }

      // 2. Inserir dados no banco
      const { error: insertError } = await supabase
        .from('inscricoes_expogoiabal')
        .insert({
          modalidade: 'Peão Mirim',
          nome: formData.nome,
          idade: formData.idade,
          peso: formData.peso,
          responsavel: formData.responsavel,
          whatsapp: formData.whatsapp,
          video_url: video_url,
          termo_aceito: formData.termoAceito
        });

      if (insertError) {
        throw new Error('Erro ao salvar inscrição. Verifique os dados e tente novamente.');
      }

      // Sucesso!
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Erro na submissão:', error);
      setErrorModal({ isOpen: true, message: error.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nome: '',
      idade: '',
      peso: '',
      responsavel: '',
      whatsapp: '',
      video: null,
      termoAceito: false
    });
    setStep(1);
  };

  const faqs = [
    {
      pergunta: "Qual a idade e peso máximo?",
      resposta: (
        <div className="space-y-2">
          <p>Não há limite de idade.</p>
          <p>O peso máximo permitido é de <strong className="text-orange-500">30kg</strong>.</p>
        </div>
      )
    },
    {
      pergunta: "Será fornecido equipamento de segurança?",
      resposta: (
        <div className="space-y-2">
          <p>Sim. Serão fornecidos equipamentos de segurança, como:</p>
          <ul className="list-disc ml-5 space-y-1 text-zinc-400">
            <li>Capacete;</li>
            <li>Colete;</li>
            <li>Entre outros itens de proteção.</li>
          </ul>
        </div>
      )
    },
    {
      pergunta: "Quais serão os dias de apresentação?",
      resposta: (
        <div className="space-y-2">
          <p>As apresentações acontecerão nos seguintes dias:</p>
          <ul className="list-disc ml-5 space-y-1 text-zinc-400">
            <li>Quinta-feira — 04/06/2026;</li>
            <li>Sexta-feira — 05/06/2026;</li>
            <li>Sábado — 06/06/2026.</li>
          </ul>
        </div>
      )
    },
    {
      pergunta: "Quais animais serão utilizados na montaria?",
      resposta: (
        <div className="space-y-2">
          <p>Serão utilizadas:</p>
          <ul className="list-disc ml-5 space-y-1 text-zinc-400">
            <li>Ovelhas;</li>
            <li>E/ou carneiros.</li>
          </ul>
        </div>
      )
    },
    {
      pergunta: "Haverá instrutor para acompanhamento?",
      resposta: <p>Sim. Haverá instrutor responsável para auxiliar os competidores e seus responsáveis.</p>
    },
    {
      pergunta: "O responsável poderá acompanhar o peão na arena?",
      resposta: <p>Sim. Será permitida a entrada do responsável na arena para acompanhamento da criança.</p>
    },
    {
      pergunta: "Haverá premiação?",
      resposta: <p>Sim. Todos os participantes receberão uma <strong className="text-orange-500">surpresa especial</strong>.</p>
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-28 px-4 relative pb-12">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        <div className="z-10 w-full max-w-6xl mt-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          
          {/* Lado Esquerdo: Logo e Título */}
          <div className="flex flex-col items-center gap-6">
            <img 
              src="/logo.png" 
              alt="ExpoGoiabal Logo" 
              className="w-full max-w-[280px] md:max-w-md drop-shadow-[0_0_15px_rgba(255,100,0,0.3)] hover:scale-105 transition-transform duration-500"
            />
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Peão Mirim
              </h1>
              <div className="mt-4 flex flex-col items-center gap-1">
                <p className={`${!loadingData && totalRegistrations >= 28 ? 'text-zinc-500 drop-shadow-[0_0_10px_rgba(100,100,100,0.4)]' : 'text-orange-500 drop-shadow-[0_0_10px_rgba(255,100,0,0.4)]'} tracking-widest uppercase text-sm font-bold`}>
                  {!loadingData && totalRegistrations >= 28 ? 'Inscrições Encerradas' : 'Inscrições Abertas'}
                </p>
                <button
                  onClick={() => setShowFaqModal(true)}
                  className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 text-white rounded-xl px-6 py-3 font-black uppercase tracking-widest transition-all duration-300 w-full md:w-auto shadow-[0_0_20px_rgba(255,100,0,0.4)] hover:shadow-[0_0_30px_rgba(255,100,0,0.6)] animate-pulse"
                >
                  <Info size={20} />
                  Como Funciona
                </button>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário ou Mensagem de Inscrições Encerradas */}
          <div className="w-full max-w-xl flex flex-col gap-6">
            {loadingData ? (
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-4 text-zinc-500">
                <svg className="animate-spin h-8 w-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-zinc-400 font-semibold">Carregando informações...</p>
              </div>
            ) : totalRegistrations >= 28 ? (
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-8 animate-in fade-in duration-500">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <X size={32} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500 uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
                    Inscrições Encerradas!
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Os pequenos grandes peões que irão competir montados em ovelhas e carneiros na ExpoGoiabal 2026 já estão definidos!
                  </p>
                </div>

                <div className="border-t border-zinc-800/80 pt-6">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-center text-orange-400 mb-6 flex items-center justify-center gap-2">
                    🤠 Peões Confirmados
                  </h3>
                  
                  {confirmedPeoes.length === 0 ? (
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500">
                      <p className="italic">A lista de peões confirmados está sendo processada pela comissão organizadora. Volte em breve!</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {confirmedPeoes.map((peao, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-zinc-900/50 border border-orange-500/10 hover:border-orange-500/30 p-4 rounded-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                              🤠
                            </div>
                            <div>
                              <span className="font-bold text-white text-base block">{peao.nome}</span>
                              <span className="text-zinc-500 text-xs uppercase tracking-wider block">Responsável: {peao.responsavel}</span>
                            </div>
                          </div>
                          <span className="text-orange-400 font-mono text-sm bg-orange-500/5 px-2.5 py-1 rounded-lg border border-orange-500/10 shrink-0">
                            {peao.idade} anos
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              
              {/* Progress Bar */}
              {step < 5 && (
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-orange-500 shadow-[0_0_10px_rgba(255,100,0,0.5)]' : 'bg-zinc-800'}`} />
                  ))}
                </div>
              )}

              <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                
                {/* Step 1: Nome do Peão Mirim */}
                {step === 1 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                    <div className="flex items-center gap-3 text-orange-500 mb-2">
                      <User size={28} />
                      <h2 className="text-2xl font-bold text-white">Nome do Peão Mirim <span className="text-red-500">*</span></h2>
                    </div>
                    <input 
                      type="text" 
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Digite o nome da criança"
                      required
                      className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg"
                    />
                  </div>
                )}

                {/* Step 2: Idade e Peso */}
                {step === 2 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                    <div className="flex items-center gap-3 text-orange-500 mb-2">
                      <Activity size={28} />
                      <h2 className="text-2xl font-bold text-white">Detalhes Físicos</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-zinc-400 text-sm mb-1 block">Idade <span className="text-red-500">*</span></label>
                        <input 
                          type="number" 
                          name="idade"
                          value={formData.idade}
                          onChange={handleInputChange}
                          placeholder="Ex: 8"
                          required
                          className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 text-sm mb-1 block">Peso (kg) <span className="text-red-500">*</span></label>
                        <input 
                          type="number" 
                          name="peso"
                          value={formData.peso}
                          onChange={handleInputChange}
                          placeholder="Ex: 20"
                          required
                          className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Responsável e WhatsApp */}
                {step === 3 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                    <div className="flex items-center gap-3 text-orange-500 mb-2">
                      <Users size={28} />
                      <h2 className="text-2xl font-bold text-white">Contato</h2>
                    </div>
                    <div>
                      <label className="text-zinc-400 text-sm mb-1 block">Nome do Responsável <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="responsavel"
                        value={formData.responsavel}
                        onChange={handleInputChange}
                        placeholder="Nome do pai, mãe ou responsável"
                        required
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg"
                      />
                    </div>
                    <div className="mt-2">
                      <label className="text-zinc-400 text-sm mb-1 block">WhatsApp do Responsável <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-3 text-orange-500 absolute ml-4 mt-4">
                        <Phone size={20} className="text-zinc-500" />
                      </div>
                      <input 
                        type="tel" 
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="(00) 0 0000-0000"
                        maxLength={16}
                        minLength={16}
                        required
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl pl-12 pr-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Upload */}
                {step === 4 && (
                  <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                    <div className="flex items-center gap-3 text-orange-500 mb-2">
                      <Video size={28} />
                      <h2 className="text-2xl font-bold text-white flex-1">Vídeo de Apresentação</h2>
                      <button 
                        type="button"
                        onClick={() => setShowVideoInfoModal(true)}
                        className="ml-auto text-zinc-400 hover:text-orange-500 transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full border border-zinc-700/50 hover:border-orange-500/30"
                        title="Privacidade do Vídeo"
                      >
                        <ShieldCheck size={20} />
                      </button>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-2 shadow-inner">
                      <p className="text-zinc-300 text-sm md:text-base text-center">Grave um breve vídeo com o peão mirim dizendo a seguinte frase:</p>
                      <p className="text-orange-500 font-bold text-lg md:text-xl text-center mt-2 italic drop-shadow-[0_0_8px_rgba(255,100,0,0.3)]">
                        "Eu quero ser o Peão da ExpoGoiabal"
                      </p>
                    </div>
                    
                    <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer hover:bg-zinc-800/50 hover:border-orange-500 transition-all group">
                      <div className="flex items-center gap-3">
                        <Upload className="w-5 h-5 text-zinc-500 group-hover:text-orange-500 transition-colors" />
                        <p className="text-sm text-zinc-400"><span className="font-semibold text-white">Clique para enviar</span> ou arraste (Máx. 50MB)</p>
                      </div>
                      <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                    </label>

                    {formData.video && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-center justify-between">
                         <span className="text-orange-200 truncate pr-4">{formData.video.name}</span>
                         <CheckCircle size={20} className="text-orange-500 flex-shrink-0" />
                      </div>
                    )}
                  </div>
                )}

                {/* Checkbox Termos Global */}
                {step >= 1 && step < 4 && (
                  <div className="flex items-start gap-3 mt-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 animate-in fade-in">
                    <input 
                      type="checkbox" 
                      id="termo"
                      name="termoAceito"
                      checked={formData.termoAceito}
                      onChange={(e) => setFormData(prev => ({...prev, termoAceito: e.target.checked}))}
                      className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 cursor-pointer"
                      required
                    />
                    <label htmlFor="termo" className="text-sm text-zinc-300">
                      Li e concordo com o{' '}
                      <button 
                        type="button" 
                        onClick={() => setIsTermosOpen(true)}
                        className="text-orange-500 hover:text-orange-400 font-bold underline outline-none"
                      >
                        Termo de Responsabilidade e Uso de Imagem
                      </button>.
                    </label>
                  </div>
                )}

                {/* Navigation Buttons */}
                {step < 5 && (
                  <div className="flex justify-between items-center mt-10 gap-4">
                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={handleReset}
                        className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl font-bold text-zinc-400 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 transition-all"
                        title="Resetar Formulário"
                      >
                        <RefreshCcw size={20} />
                        <span className="hidden md:block ml-2">Resetar</span>
                      </button>

                      {step > 1 && (
                        <button 
                          type="button" 
                          onClick={prevStep}
                          className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-white bg-zinc-700 hover:bg-zinc-600 transition-all"
                        >
                          <ArrowLeft size={20} />
                          <span className="hidden md:block">Voltar</span>
                        </button>
                      )}
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || (!formData.termoAceito && step === 3)}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white uppercase tracking-wide transition-all ${
                        isSubmitting || (!formData.termoAceito && step === 3)
                          ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 shadow-[0_0_15px_rgba(255,100,0,0.3)]'
                      }`}
                    >
                      {isSubmitting ? (
                        <span key="submitting" className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </span>
                      ) : step === 4 ? (
                        <span key="finalizar">Finalizar</span>
                      ) : (
                        <span key="proximo">Próximo</span>
                      )}
                      {!isSubmitting && step < 4 && <ArrowRight size={20} />}
                    </button>
                  </div>
                )}
              </form>

            </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Termos */}
      {isTermosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-xl font-bold text-white">Termo de Responsabilidade</h2>
              <button 
                onClick={() => setIsTermosOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-zinc-300 space-y-4 text-sm leading-relaxed">
              <p className="font-bold text-center text-white mb-4">
                TERMO DE RESPONSABILIDADE E AUTORIZAÇÃO DE USO DE IMAGEM<br/>
                PEÃO MIRIM — EXPOGOIABAL 2026
              </p>
              <p>O(A) responsável legal abaixo identificado(a) declara, para os devidos fins, a inscrição voluntária do menor para participação na modalidade Peão Mirim da EXPOGOIABAL 2026, promovida pela Prefeitura Municipal de São José do Goiabal.</p>
              
              <h3 className="font-bold text-orange-500 mt-4">1. DA PARTICIPAÇÃO</h3>
              <p>O responsável declara estar ciente de que a participação do menor possui caráter exclusivamente recreativo e cultural, sem qualquer tipo de premiação financeira, vínculo empregatício ou remuneração.</p>

              <h3 className="font-bold text-orange-500 mt-4">2. DA SEGURANÇA E RESPONSABILIDADE</h3>
              <p>O responsável assume inteira responsabilidade pela integridade física do menor durante o evento, declarando que o mesmo possui plenas condições de saúde para participar das atividades. O responsável deverá acompanhar o menor durante toda a realização das atividades da modalidade Peão Mirim.</p>

              <h3 className="font-bold text-orange-500 mt-4">3. DO USO DE IMAGEM</h3>
              <p>O responsável autoriza, de forma gratuita, definitiva e por prazo indeterminado, o uso da imagem, voz e nome do menor em fotografias, vídeos, gravações, transmissões ao vivo, materiais publicitários, redes sociais, sites oficiais e demais meios de comunicação destinados à divulgação e promoção da EXPOGOIABAL 2026.</p>

              <h3 className="font-bold text-orange-500 mt-4">4. DA ISENÇÃO DE RESPONSABILIDADE</h3>
              <p>A Prefeitura Municipal de São José do Goiabal e a organização da EXPOGOIABAL 2026 não se responsabilizam por objetos pessoais, acidentes decorrentes de imprudência ou situações alheias à organização do evento, sendo de total responsabilidade do acompanhante zelar pelo menor.</p>

              <h3 className="font-bold text-orange-500 mt-4">5. DA AUTORIZAÇÃO FINAL</h3>
              <p>O responsável declara ter lido integralmente este termo, concordando livremente com todas as condições aqui estabelecidas.</p>
            </div>
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              <button 
                type="button"
                onClick={() => {
                  setFormData(prev => ({...prev, termoAceito: true}));
                  setIsTermosOpen(false);
                }}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Limite de Peso */}
      {showWeightModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(255,100,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
            
            <button 
              onClick={() => setShowWeightModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,100,0,0.4)]">
                <ShieldCheck size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Aviso de Segurança
                </h3>
                <div className="h-1 w-16 bg-orange-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-zinc-300 leading-relaxed text-lg">
                Poxa, o peso do peãozinho ultrapassou o limite de <strong className="text-orange-500">30kg</strong>.
              </p>
              
              <p className="text-zinc-400 text-sm">
                Por medidas de segurança tanto para o <strong className="text-white">participante</strong> quanto para o bem-estar dos <strong className="text-white">animais</strong>, não podemos permitir a inscrição com este peso. Agradecemos a compreensão!
              </p>

              <button 
                onClick={() => setShowWeightModal(false)}
                className="mt-4 w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,100,0,0.3)]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vídeo Ausente */}
      {showMissingVideoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(255,100,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
            
            <button 
              onClick={() => setShowMissingVideoModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,100,0,0.4)] animate-bounce">
                <Video size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Faltou o Vídeo!
                </h3>
                <div className="h-1 w-16 bg-orange-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-zinc-300 leading-relaxed text-lg">
                Opa! Parece que você esqueceu de anexar o <strong className="text-orange-500">vídeo de apresentação</strong> do peãozinho.
              </p>
              
              <p className="text-zinc-400 text-sm">
                O vídeo é essencial para confirmarmos a inscrição e vermos toda a animação dele para a <strong className="text-white">ExpoGoiabal 2026</strong>! Grave um vídeo rapidinho e anexe para continuar.
              </p>

              <button 
                onClick={() => setShowMissingVideoModal(false)}
                className="mt-4 w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,100,0,0.3)]"
              >
                Anexar Vídeo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-green-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(34,197,94,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-500/20 to-transparent"></div>
            
            <div className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] animate-bounce">
                <CheckCircle size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Inscrição Realizada com Sucesso!
                </h3>
                <div className="h-1 w-16 bg-green-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-zinc-300 leading-relaxed text-lg">
                Tudo certo! Sua inscrição foi recebida.
              </p>
              
              <p className="text-zinc-400 text-sm">
                Fique atento ao WhatsApp informado para acompanhar os próximos passos da nossa <strong className="text-white">ExpoGoiabal 2026</strong>.
              </p>

              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                className="mt-4 w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:scale-[1.02] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-red-500/50 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_30px_rgba(239,68,68,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white">Ops! Algo deu errado</h3>
              <p className="text-zinc-400">{errorModal.message}</p>
              <button 
                onClick={() => setErrorModal({ isOpen: false, message: '' })}
                className="mt-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Info do Vídeo */}
      {showVideoInfoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(255,100,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            {/* Decoração temática */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
            
            <button 
              onClick={() => setShowVideoInfoModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,100,0,0.4)] animate-bounce">
                <Video size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Prepara a Emoção!
                </h3>
                <div className="h-1 w-16 bg-orange-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-zinc-300 leading-relaxed text-lg">
                Capriche na gravação! Esse vídeo <strong className="text-orange-500 inline-block animate-pulse text-xl">vai bombar</strong> entre os peões da arena! 🤠
              </p>
              
              <p className="text-zinc-400 text-sm">
                Mostre toda a energia do nosso futuro campeão! A galera da <strong className="text-white">ExpoGoiabal</strong> quer ver essa animação!
              </p>

              <button 
                onClick={() => setShowVideoInfoModal(false)}
                className="mt-4 w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-[1.02] text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,100,0,0.3)]"
              >
                Entendi, continuar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Como Funciona (FAQ) */}
      {showFaqModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(255,100,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-950/50 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-widest">Como Funciona</h2>
                  <p className="text-xs text-orange-500 uppercase tracking-widest font-semibold">Peão Mirim</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFaqModal(false)}
                className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Corpo do Modal - Lista de Perguntas (Accordion) */}
            <div className="p-6 overflow-y-auto space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'border-orange-500/50 bg-zinc-800/50 shadow-[0_0_15px_rgba(255,100,0,0.1)]' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <span className={`font-semibold text-lg pr-4 ${openFaqIndex === index ? 'text-orange-400' : 'text-zinc-200'}`}>
                      {faq.pergunta}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-zinc-500 shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-orange-500' : ''}`} 
                    />
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-5 pt-0 text-zinc-300 leading-relaxed border-t border-zinc-800/50 mt-1">
                      {faq.resposta}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/50">
              <button 
                onClick={() => setShowFaqModal(false)}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest rounded-xl transition-all"
              >
                Entendi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
