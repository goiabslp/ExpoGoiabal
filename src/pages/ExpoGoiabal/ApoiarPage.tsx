import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Sparkles, Copy, Check, ShieldCheck, ArrowLeft, Loader2, Coins, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import axios from 'axios';

export const ApoiarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Captura o sessionId do telão do show para vinculação correta
  const sessionId = searchParams.get('sessionId') || searchParams.get('formId') || 'avulso';
  
  // Chave Pix Estática e imagem do QR Code
  const pixKey = "31982311929"; // Chave celular limpa para o Pix Estático
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [step, setStep] = useState<'form' | 'payment'>('form'); // form = digitar nome, payment = pagar e confirmar
  
  // Estados de execução
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedValue, setConfirmedValue] = useState<number | null>(null);

  // Escuta confirmação automática via Realtime no Supabase caso o pagamento seja conciliado por outro meio
  useEffect(() => {
    if (step !== 'payment' || paymentConfirmed) return;

    // Escuta atualizações na tabela pagamentos_pix para ver se o nome do doador é associado a esta sessão
    const channel = supabase
      .channel(`sessao_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pagamentos_pix',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'approved' && updated.nome_doador === nome.trim()) {
            setConfirmedValue(updated.valor);
            setPaymentConfirmed(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [step, paymentConfirmed, sessionId, nome]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!nome.trim()) {
      setErrorMsg('Por favor, insira o seu nome.');
      return;
    }

    if (nome.trim().split(/\s+/).length < 2) {
      setErrorMsg('Por favor, insira seu nome completo (Nome e Sobrenome).');
      return;
    }

    setStep('payment');
  };

  // Envia requisição de conciliação manual/assistida ao backend
  const handleConfirmPayment = async () => {
    setErrorMsg(null);
    setLoadingConfirm(true);

    try {
      const response = await axios.post('/api/payments/confirm', {
        nome: nome.trim(),
        sessionId,
      });

      if (response.data && response.data.status === 'approved') {
        setConfirmedValue(response.data.valor);
        setPaymentConfirmed(true);
      }
    } catch (err: any) {
      console.error('Erro ao confirmar pagamento:', err);
      setErrorMsg(
        err.response?.data?.message || 
        'Ainda não identificamos o seu Pix no sistema. Certifique-se de que concluiu o pagamento no aplicativo do seu banco e tente novamente.'
      );
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Renderiza tela de Sucesso do Pagamento
  if (paymentConfirmed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15)_0,transparent_60%)] pointer-events-none z-0" />
        
        <div className="max-w-md w-full bg-zinc-900/80 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.15)] relative z-10 animate-fade-in">
          {/* Ícone de Sucesso Animado */}
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-4 border-emerald-500 mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>

          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-300 uppercase tracking-wide mb-3">
            Obrigado, {nome}!
          </h1>
          
          <p className="text-zinc-200 text-base font-medium leading-relaxed mb-6">
            Sua doação{confirmedValue ? ` de R$ ${Number(confirmedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''} foi identificada com sucesso!
          </p>

          <div className="bg-emerald-950/30 border border-emerald-500/20 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 justify-center">
            <span className="text-2xl animate-pulse">🎉</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Seu nome está brilhando no telão agora!
            </span>
          </div>

          <button
            onClick={() => {
              setStep('form');
              setPaymentConfirmed(false);
              setNome('');
              setConfirmedValue(null);
              setErrorMsg(null);
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-2xl transition duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            Apoiar Novamente
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
        
        {/* Passo 1: Formulário com Campo de Nome Apenas */}
        {step === 'form' ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <Coins size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 uppercase tracking-wide">
                Apoie o Cantor
              </h1>
              <p className="text-zinc-400 text-xs mt-1">
                Insira o seu nome para gerar o QR Code de doação com valor livre direto no seu banco!
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-semibold px-4 py-3 rounded-2xl mb-4 leading-relaxed">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleNextStep} className="flex flex-col gap-5">
              {/* Campo Nome Único */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Alberto Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-yellow-400/80 transition duration-200 text-white placeholder-zinc-650"
                  maxLength={50}
                  required
                />
              </div>

              {/* Botão Avançar */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-4 px-6 rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <Heart size={18} className="fill-current" />
                Continuar para Doar
              </button>
            </form>
          </>
        ) : (
          /* Passo 2: Mostrar QR Code Estático, Instruções e Botão Confirmar */
          <div className="flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-black text-yellow-400 uppercase tracking-widest mb-1 text-center">
              Faça sua Doação
            </h2>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-6 text-center">
              Doador: {nome} (Valor Livre no Banco)
            </p>

            {errorMsg && (
              <div className="bg-red-955/40 border border-red-500/30 text-red-200 text-xs font-semibold px-4 py-3 rounded-2xl mb-4 leading-relaxed text-center w-full">
                {errorMsg}
              </div>
            )}

            {/* Imagem do QR Code Estático Oficial */}
            <div className="relative w-56 h-56 bg-white border-4 border-yellow-500 rounded-2xl p-2.5 mb-6 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.25)]">
              <img
                src="/QR.png"
                alt="QR Code PIX doador"
                className="w-full h-full object-contain filter contrast-125 select-none"
              />
            </div>

            {/* Instruções de Pagamento */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 px-4 py-3.5 rounded-2xl mb-6 text-center w-full">
              <p className="text-[11px] text-zinc-300 font-medium leading-relaxed">
                Escaneie o QR Code acima pelo app do seu banco ou copie a chave abaixo e defina <strong>qualquer valor</strong> que deseja doar diretamente no aplicativo do seu banco!
              </p>
            </div>

            {/* Chave Pix Copia e Cola */}
            <div className="w-full flex flex-col gap-2 mb-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                Chave PIX (Celular)
              </span>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl w-full">
                <span className="text-sm font-mono text-zinc-300 font-black tracking-wider flex-1 text-center">
                  31 9 8231-1929
                </span>
                <button
                  onClick={handleCopyPix}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white p-2.5 rounded-xl border border-zinc-800 transition duration-200 shrink-0 cursor-pointer"
                  title="Copiar chave"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              {copied && (
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider text-center mt-0.5 animate-pulse">
                  Chave PIX copiada!
                </span>
              )}
            </div>

            {/* Botão de Confirmação Assistida no Telão */}
            <button
              onClick={handleConfirmPayment}
              disabled={loadingConfirm}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-4 px-6 rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-5"
            >
              {loadingConfirm ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Identificando Pagamento...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-yellow-300 fill-current animate-pulse" />
                  Confirmar Nome no Telão
                </>
              )}
            </button>

            {/* Botão para voltar */}
            <button
              onClick={() => {
                setStep('form');
                setErrorMsg(null);
              }}
              disabled={loadingConfirm}
              className="text-[10px] font-bold text-zinc-550 hover:text-zinc-400 transition-colors uppercase tracking-widest cursor-pointer disabled:opacity-30"
            >
              Voltar ao Formulário
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-6 pt-4 border-t border-zinc-900/60">
          <ShieldCheck size={12} className="text-emerald-500" />
          Segurança Integrada via Mercado Pago
        </div>
      </div>
    </div>
  );
};
