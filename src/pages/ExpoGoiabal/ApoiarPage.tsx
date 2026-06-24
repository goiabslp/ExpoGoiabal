import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Sparkles, Copy, Check, ShieldCheck, ArrowLeft, Loader2, Coins } from 'lucide-react';
import { supabase } from '../../services/supabase';
import axios from 'axios';

interface PixData {
  id: string;
  mercado_pago_id: string;
  qr_code: string;
  qr_code_base64: string;
  valor: number;
  data_expiracao: string;
  status: string;
}

export const ApoiarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const sessionId = searchParams.get('sessionId') || searchParams.get('formId') || 'avulso';
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [valorCustomizado, setValorCustomizado] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(10); // R$ 10 padrão
  const [isCustomValue, setIsCustomValue] = useState(false);
  
  // Estados de execução
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  const timerRef = useRef<any>(null);

  // Valores rápidos de doação
  const quickValues = [5, 10, 20, 50];

  // Regressão do timer do Pix
  useEffect(() => {
    if (pixData && timeLeft > 0 && !paymentConfirmed) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [pixData, timeLeft, paymentConfirmed]);

  // Escuta confirmação do pagamento em tempo real via Supabase
  useEffect(() => {
    if (!pixData) return;

    // Escuta mudanças específicas para esta linha no banco de dados
    const channel = supabase
      .channel(`pagamento_${pixData.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pagamentos_pix',
          filter: `id=eq.${pixData.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'approved') {
            setPaymentConfirmed(true);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }
      )
      .subscribe();

    // Faz uma consulta de polling a cada 4 segundos por segurança
    const pollingInterval = setInterval(async () => {
      try {
        const { data, error: dbErr } = await supabase
          .from('pagamentos_pix')
          .select('status')
          .eq('id', pixData.id)
          .single();
        
        if (!dbErr && data && data.status === 'approved') {
          setPaymentConfirmed(true);
          clearInterval(pollingInterval);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } catch (e) {
        console.error('Erro no polling do pagamento:', e);
      }
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollingInterval);
    };
  }, [pixData]);

  // Formatação do tempo restante (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Envio do formulário e geração do Pix
  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!nome.trim()) {
      setError('Por favor, insira o seu nome.');
      return;
    }

    const finalValue = isCustomValue ? parseFloat(valorCustomizado) : valorSelecionado;
    
    if (!finalValue || isNaN(finalValue) || finalValue <= 0) {
      setError('Por favor, insira um valor válido maior que zero.');
      return;
    }

    if (finalValue < 1.00) {
      setError('O valor mínimo de doação é R$ 1,00.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/payments/create', {
        nome: nome.trim(),
        valor: finalValue,
        sessionId,
      });

      if (response.data) {
        setPixData(response.data);
        setTimeLeft(900); // Reseta o timer para 15 minutos
      }
    } catch (err: any) {
      console.error('Erro ao gerar Pix:', err);
      setError(err.response?.data?.message || 'Erro ao gerar o PIX. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Renderiza tela de Sucesso do Pagamento
  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0,transparent_60%)] pointer-events-none z-0" />
        
        <div className="max-w-md w-full bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.15)] relative z-10 animate-fade-in">
          {/* Ícone de Sucesso Animado */}
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
            <Sparkles size={48} className="text-emerald-400" />
          </div>

          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-300 uppercase tracking-wide mb-3">
            Obrigado, {nome}!
          </h1>
          
          <p className="text-zinc-200 text-lg font-medium leading-relaxed mb-6">
            Sua contribuição de <strong className="text-yellow-400 font-bold">R$ {Number(isCustomValue ? valorCustomizado : valorSelecionado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> foi aprovada!
          </p>

          <div className="bg-emerald-950/30 border border-emerald-500/20 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 justify-center">
            <span className="text-2xl animate-pulse">🎉</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Seu nome está no telão do show agora!
            </span>
          </div>

          <button
            onClick={() => {
              setPixData(null);
              setPaymentConfirmed(false);
              setNome('');
              setValorCustomizado('');
              setValorSelecionado(10);
              setIsCustomValue(false);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-2xl transition duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            Fazer Nova Doação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white font-sans relative overflow-x-hidden">
      {/* Background do Brasil/Copa */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Cabeçalho de Volta */}
      <div className="w-full max-w-md flex items-center justify-between mb-6 z-10 px-2">
        <a
          href="/ExpoGoiabal/show"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition duration-250 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Voltar ao Show
        </a>
        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full text-[10px] font-black text-yellow-400 uppercase tracking-wider">
          <Sparkles size={10} />
          Apoio Nilson Garcia
        </div>
      </div>

      <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative z-10">
        
        {/* Caso o Pix ainda não tenha sido gerado, mostra o formulário */}
        {!pixData ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <Coins size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 uppercase tracking-wide">
                Apoie o Cantor
              </h1>
              <p className="text-zinc-400 text-xs mt-1">
                Coloque o seu nome e escolha o valor para ver a sua doação ao vivo no telão da ExpoGoiabal!
              </p>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-semibold px-4 py-3 rounded-2xl mb-4 leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleGeneratePix} className="flex flex-col gap-5">
              {/* Campo Nome */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Alberto"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-yellow-400/80 transition duration-200 text-white placeholder-zinc-650"
                  maxLength={50}
                  required
                />
              </div>

              {/* Seletor de Valor */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Valor da Contribuição
                </label>
                
                {/* Opções Rápidas */}
                <div className="grid grid-cols-4 gap-2.5">
                  {quickValues.map((val) => (
                    <button
                      key={val}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setValorSelecionado(val);
                        setIsCustomValue(false);
                      }}
                      className={`py-3.5 rounded-2xl font-black text-sm transition-all duration-200 cursor-pointer ${
                        !isCustomValue && valorSelecionado === val
                          ? 'bg-yellow-400 text-zinc-950 shadow-[0_0_15px_rgba(234,179,8,0.25)] border-2 border-yellow-400'
                          : 'bg-zinc-950/60 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                {/* Botão Outro Valor */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsCustomValue(true)}
                  className={`mt-2 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isCustomValue
                      ? 'bg-yellow-400 text-zinc-950 border border-yellow-400'
                      : 'bg-zinc-950/40 text-zinc-400 border border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  Doar Outro Valor
                </button>

                {/* Input de Valor Customizado */}
                {isCustomValue && (
                  <div className="flex flex-col gap-1.5 mt-2 animate-fade-in">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="0,00"
                        value={valorCustomizado}
                        onChange={(e) => setValorCustomizado(e.target.value)}
                        disabled={loading}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:border-yellow-400 transition duration-200 text-white"
                        required={isCustomValue}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-4 px-6 rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando Cobrança...
                  </>
                ) : (
                  <>
                    <Heart size={18} className="fill-current" />
                    Gerar PIX de Doação
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Se o Pix já foi gerado, mostra a tela com o QR Code e instruções de pagamento */
          <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-black text-yellow-400 uppercase tracking-widest mb-1 text-center">
              PIX Gerado com Sucesso!
            </h2>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-6 text-center">
              Apoio de {nome} - R$ {Number(isCustomValue ? valorCustomizado : valorSelecionado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>

            {/* Imagem do QR Code Dinâmico */}
            <div className="relative w-56 h-56 bg-white border-4 border-yellow-500 rounded-2xl p-2.5 mb-6 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              {pixData.qr_code_base64 ? (
                <img
                  src={`data:image/png;base64,${pixData.qr_code_base64}`}
                  alt="QR Code PIX doador"
                  className="w-full h-full object-contain filter contrast-125 select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
                  <Loader2 className="animate-spin text-yellow-500" size={24} />
                  <span className="text-[10px]">Carregando imagem...</span>
                </div>
              )}
            </div>

            {/* Cronômetro */}
            <div className="bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-full flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold text-zinc-300 font-mono">
                Expira em: {formatTime(timeLeft)}
              </span>
            </div>

            {/* Copia e Cola */}
            <div className="w-full flex flex-col gap-2 mb-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                Pix Copia e Cola
              </span>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl w-full">
                <span className="text-xs font-mono text-zinc-300 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                  {pixData.qr_code}
                </span>
                <button
                  onClick={handleCopyPix}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white p-2.5 rounded-xl border border-zinc-800 transition duration-200 shrink-0 cursor-pointer"
                  title="Copiar código"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              {copied && (
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider text-center mt-0.5 animate-pulse">
                  Código Pix copiado com sucesso!
                </span>
              )}
            </div>

            {/* Loading de confirmação */}
            <div className="w-full bg-zinc-950/60 border border-zinc-800/80 px-4 py-3.5 rounded-2xl flex items-center gap-3 justify-center mb-6">
              <Loader2 className="animate-spin text-emerald-400" size={16} />
              <span className="text-[10px] font-bold text-zinc-350 uppercase tracking-widest animate-pulse">
                Aguardando confirmação do banco...
              </span>
            </div>

            {/* Botão de cancelamento */}
            <button
              onClick={() => {
                setPixData(null);
                setPaymentConfirmed(false);
              }}
              className="text-[10px] font-bold text-zinc-550 hover:text-zinc-400 transition-colors uppercase tracking-widest cursor-pointer"
            >
              Cancelar e Voltar
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-6 pt-4 border-t border-zinc-900/60">
          <ShieldCheck size={12} className="text-emerald-500" />
          Segurança Garantida via Mercado Pago
        </div>
      </div>
    </div>
  );
};
