import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { User, Calendar, Phone, Upload, ArrowRight, ArrowLeft, CheckCircle, Video, RefreshCcw, Star, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const EmbaixadoraInscricaoPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    modalidade: '',
    nome: '',
    dataNascimento: '',
    whatsapp: '',
    video: null as File | null,
    termoAceito: false
  });
  const [isTermosOpen, setIsTermosOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [showVideoInfoModal, setShowVideoInfoModal] = useState(false);

  // Calcula a data máxima (18 anos atrás a partir de hoje)
  const maxDate18YearsAgo = new Date();
  maxDate18YearsAgo.setFullYear(maxDate18YearsAgo.getFullYear() - 18);
  const maxDateString = maxDate18YearsAgo.toISOString().split('T')[0];

  const nextStep = () => {
    // Validação passo 1
    if (step === 1 && !formData.modalidade) return;
    const next = Math.min(step + 1, 6);
    if (next === 5 && step !== 5) {
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
    setIsSubmitting(true);

    try {
      let video_url = null;

      // 1. Upload do vídeo se existir
      if (formData.video) {
        const fileExt = formData.video.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${formData.modalidade.toLowerCase()}/${fileName}`;

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
          modalidade: formData.modalidade,
          nome: formData.nome,
          data_nascimento: formData.dataNascimento,
          whatsapp: formData.whatsapp,
          video_url: video_url,
          termo_aceito: formData.termoAceito
        });

      if (insertError) {
        throw new Error('Erro ao salvar inscrição. Verifique os dados e tente novamente.');
      }

      // Sucesso!
      nextStep();
    } catch (error: any) {
      console.error('Erro na submissão:', error);
      setErrorModal({ isOpen: true, message: error.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      modalidade: '',
      nome: '',
      dataNascimento: '',
      whatsapp: '',
      video: null,
      termoAceito: false
    });
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-28 px-4 relative pb-12">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        <div className="z-10 w-full max-w-6xl mt-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          
          {/* Lado Esquerdo: Logo */}
          <div className="flex flex-col items-center gap-6">
            <img 
              src="/logo.png" 
              alt="ExpoGoiabal Logo" 
              className="w-full max-w-[280px] md:max-w-md drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-500"
            />
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Embaixadora
              </h1>
              <div className="mt-4 flex flex-col gap-1">
                <p className="text-yellow-500 tracking-widest uppercase text-sm font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                  Inscrições Abertas até 20/05/2026
                </p>
                <p className="text-zinc-400 uppercase text-xs font-semibold">
                  Resultado dia 23/05/2026
                </p>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="w-full max-w-xl flex flex-col gap-6">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            
            {/* Progress Bar */}
            {step < 6 && (
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'bg-zinc-800'}`} />
                ))}
              </div>
            )}

            <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              
              {/* Step 1: Modalidade */}
              {step === 1 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Star size={28} />
                    <h2 className="text-2xl font-bold text-white">Modalidade</h2>
                  </div>
                  <p className="text-zinc-400">Para qual modalidade você deseja se inscrever?</p>
                  
                  <div className="flex flex-row justify-center gap-8 mt-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, modalidade: 'Embaixadora'}))}
                      className="flex flex-col items-center justify-center group outline-none"
                    >
                      <img 
                        src="/chapeu.png" 
                        alt="Embaixadora" 
                        className={`w-24 h-24 md:w-32 md:h-32 object-contain rounded-2xl p-2 transition-all duration-300 ${
                          formData.modalidade === 'Embaixadora' 
                            ? 'scale-110 shadow-[0_0_30px_rgba(255,215,0,0.6)] border-2 border-yellow-500' 
                            : 'opacity-70 grayscale-[50%] group-hover:opacity-100 group-hover:scale-105 group-hover:grayscale-0'
                        }`} 
                      />
                      <span className={`mt-4 text-xl font-bold transition-all ${
                        formData.modalidade === 'Embaixadora' ? 'text-yellow-500' : 'text-zinc-400 group-hover:text-white'
                      }`}>Embaixadora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, modalidade: 'Madrinha'}))}
                      className="flex flex-col items-center justify-center group outline-none"
                    >
                      <img 
                        src="/bota.png" 
                        alt="Madrinha" 
                        className={`w-24 h-24 md:w-32 md:h-32 object-contain rounded-2xl p-2 transition-all duration-300 ${
                          formData.modalidade === 'Madrinha' 
                            ? 'scale-110 shadow-[0_0_30px_rgba(6,182,212,0.6)] border-2 border-cyan-500' 
                            : 'opacity-70 grayscale-[50%] group-hover:opacity-100 group-hover:scale-105 group-hover:grayscale-0'
                        }`} 
                      />
                      <span className={`mt-4 text-xl font-bold transition-all ${
                        formData.modalidade === 'Madrinha' ? 'text-cyan-500' : 'text-zinc-400 group-hover:text-white'
                      }`}>Madrinha</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Nome Completo */}
              {step === 2 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <User size={28} />
                    <h2 className="text-2xl font-bold text-white">Nome Completo</h2>
                  </div>
                  <input 
                    type="text" 
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                  />
                </div>
              )}

              {/* Step 3: Data de Nascimento */}
              {step === 3 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Calendar size={28} />
                    <h2 className="text-2xl font-bold text-white">Data de Nascimento</h2>
                  </div>
                  <input 
                    type="date" 
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    max={maxDateString}
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg [color-scheme:dark]"
                  />
                </div>
              )}

              {/* Step 4: WhatsApp */}
              {step === 4 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Phone size={28} />
                    <h2 className="text-2xl font-bold text-white">WhatsApp</h2>
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
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                  />
                </div>
              )}

              {/* Step 5: Upload */}
              {step === 5 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Video size={28} />
                    <h2 className="text-2xl font-bold text-white flex-1">Vídeo de Apresentação</h2>
                    <button 
                      type="button"
                      onClick={() => setShowVideoInfoModal(true)}
                      className="ml-auto text-zinc-400 hover:text-yellow-500 transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full border border-zinc-700/50 hover:border-yellow-500/30"
                      title="Privacidade do Vídeo"
                    >
                      <ShieldCheck size={20} />
                    </button>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-2 shadow-inner">
                    <p className="text-zinc-300 text-sm md:text-base text-center">Grave um breve vídeo dizendo a seguinte frase:</p>
                    <p className="text-yellow-500 font-bold text-lg md:text-xl text-center mt-2 italic drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">
                      "Eu quero ser a {formData.modalidade || 'Embaixadora'} da ExpoGoiabal 2026"
                    </p>
                  </div>
                  
                  <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-zinc-700 border-dashed rounded-xl cursor-pointer hover:bg-zinc-800/50 hover:border-yellow-500 transition-all group">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-zinc-500 group-hover:text-yellow-500 transition-colors" />
                      <p className="text-sm text-zinc-400"><span className="font-semibold text-white">Clique para enviar</span> ou arraste (Máx. 50MB)</p>
                    </div>
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} required />
                  </label>

                  {formData.video && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center justify-between">
                       <span className="text-yellow-200 truncate pr-4">{formData.video.name}</span>
                       <CheckCircle size={20} className="text-yellow-500 flex-shrink-0" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Success */}
              {step === 6 && (
                <div className="flex flex-col items-center text-center gap-6 animate-in zoom-in fade-in py-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Inscrição Enviada!</h2>
                  <p className="text-zinc-400">Sua inscrição foi recebida com sucesso. Fique atenta ao seu WhatsApp para os próximos passos!</p>
                  
                  <button 
                    type="button" 
                    onClick={handleReset}
                    className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
                  >
                    <RefreshCcw size={20} />
                    Nova Inscrição
                  </button>
                </div>
              )}

              {/* Checkbox Termos Global (Sempre Visível após Modalidade e antes do Vídeo) */}
              {step > 1 && step < 5 && (
                <div className="flex items-start gap-3 mt-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 animate-in fade-in">
                  <input 
                    type="checkbox" 
                    id="termo"
                    name="termoAceito"
                    checked={formData.termoAceito}
                    onChange={(e) => setFormData(prev => ({...prev, termoAceito: e.target.checked}))}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                    required
                  />
                  <label htmlFor="termo" className="text-sm text-zinc-300">
                    Li e concordo com o{' '}
                    <button 
                      type="button" 
                      onClick={() => setIsTermosOpen(true)}
                      className="text-yellow-500 hover:text-yellow-400 font-bold underline outline-none"
                    >
                      Termo de Responsabilidade e Uso de Imagem
                    </button>.
                  </label>
                </div>
              )}

              {/* Navigation Buttons */}
              {step < 6 && (
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
                    disabled={(step === 1 && !formData.modalidade) || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black uppercase tracking-wide transition-all ${
                      (step === 1 && !formData.modalidade) || isSubmitting
                        ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : step === 5 ? 'Finalizar' : 'Próximo'}
                    {!isSubmitting && step < 5 && <ArrowRight size={20} />}
                  </button>
                </div>
              )}
            </form>

          </div>
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
                EMBAIXADORA E MADRINHA — EXPOGOIABAL 2026
              </p>
              <p>A participante abaixo identificada declara, para os devidos fins, sua inscrição voluntária para participação na seleção e representação oficial da EXPOGOIABAL 2026, promovida pela Prefeitura Municipal de São José do Goiabal.</p>
              <p>O título de Embaixadora e Madrinha da EXPOGOIABAL 2026 terá vigência a partir do dia 23 de maio de 2026, permanecendo válido durante toda a realização do evento, que ocorrerá entre os dias 04 e 07 de junho de 2026.</p>
              
              <h3 className="font-bold text-yellow-500 mt-4">1. DA PARTICIPAÇÃO</h3>
              <p>A participante declara estar ciente de que sua participação como candidata, Embaixadora ou Madrinha da EXPOGOIABAL 2026 possui caráter exclusivamente voluntário, sem qualquer vínculo empregatício, obrigação trabalhista, previdenciária ou remuneração financeira por parte da organização do evento ou da Prefeitura Municipal de São José do Goiabal.</p>

              <h3 className="font-bold text-yellow-500 mt-4">2. DA MAIORIDADE</h3>
              <p>A participante declara ser maior de 18 (dezoito) anos na data da assinatura deste termo, assumindo integral responsabilidade pelas informações prestadas.</p>

              <h3 className="font-bold text-yellow-500 mt-4">3. DO USO DE IMAGEM</h3>
              <p>A participante autoriza, de forma gratuita, definitiva e por prazo indeterminado, o uso de sua imagem, voz, nome e depoimentos em fotografias, vídeos, gravações, transmissões ao vivo, materiais publicitários, redes sociais, sites oficiais, banners, outdoors, mídia impressa e demais meios de comunicação destinados à divulgação e promoção da EXPOGOIABAL 2026.</p>

              <h3 className="font-bold text-yellow-500 mt-4">4. DAS PRODUÇÕES AUDIOVISUAIS</h3>
              <p>A participante declara estar ciente e concorda com a realização de sessões fotográficas, filmagens, entrevistas, gravações promocionais e demais produções audiovisuais promovidas pela organização do evento, podendo tais conteúdos serem utilizados livremente para divulgação institucional e promocional da EXPOGOIABAL 2026.</p>

              <h3 className="font-bold text-yellow-500 mt-4">5. DA RESPONSABILIDADE</h3>
              <p>A participante assume inteira responsabilidade por sua conduta durante ensaios, eventos, gravações, desfiles e atividades relacionadas à EXPOGOIABAL 2026, comprometendo-se a respeitar as normas da organização.</p>

              <h3 className="font-bold text-yellow-500 mt-4">6. DA ISENÇÃO DE RESPONSABILIDADE</h3>
              <p>A Prefeitura Municipal de São José do Goiabal e a organização da EXPOGOIABAL 2026 não se responsabilizam por objetos pessoais, acidentes decorrentes de imprudência da participante, atos de terceiros ou situações alheias à organização do evento.</p>

              <h3 className="font-bold text-yellow-500 mt-4">7. DA AUTORIZAÇÃO FINAL</h3>
              <p>A participante declara ter lido integralmente este termo, concordando livremente com todas as condições aqui estabelecidas.</p>
            </div>
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              <button 
                type="button"
                onClick={() => {
                  setFormData(prev => ({...prev, termoAceito: true}));
                  setIsTermosOpen(false);
                }}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Li e Aceito os Termos
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
          <div className="bg-zinc-900 border border-yellow-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(255,215,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 relative">
            
            {/* Decoração temática */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/20 to-transparent"></div>
            
            <button 
              onClick={() => setShowVideoInfoModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-pulse">
                <ShieldCheck size={40} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                  Atenção, {formData.modalidade || 'Candidata'}!
                </h3>
                <div className="h-1 w-16 bg-yellow-500 mx-auto rounded-full"></div>
              </div>
              
              <p className="text-zinc-300 leading-relaxed text-lg">
                Fique tranquila! Seu vídeo <strong className="text-yellow-500">não será divulgado</strong> ou postado em lugar nenhum.
              </p>
              
              <p className="text-zinc-400 text-sm">
                Ele será utilizado exclusivamente pela nossa equipe interna apenas para <strong className="text-white">confirmar a sua identidade</strong> e garantir a segurança do processo seletivo.
              </p>

              <button 
                onClick={() => setShowVideoInfoModal(false)}
                className="mt-4 w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-[1.02] text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                Entendi, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
