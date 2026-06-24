import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../components/Header';
import { Trophy, Sparkles, Copy, Check, Music, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface FloatingFlag {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

interface ConfettiItem {
  id: number;
  left: number;
  delay: number;
  color: string;
  size: number;
  shape: 'circle' | 'square';
}

const flagEmojis = ['🇧🇷', '🇦🇷', '🇫🇷', '🇩🇪', '🇪🇸', '🇺🇸', '🇲🇽', '🇨🇦', '🇯🇵', '🇭🇷', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇵🇹', '🇺🇾', '🇳🇱', '🇨🇭', '🇸🇪'];
const confettiColors = ['#facc15', '#4ade80', '#60a5fa', '#f87171', '#a78bfa', '#f472b6'];

export const ShowPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{ name: string; value: string; visible: boolean } | null>(null);
  
  // Controle de confetes de comemoração
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettis, setConfettis] = useState<ConfettiItem[]>([]);
  const [recentRealDonations, setRecentRealDonations] = useState<any[]>([]);

  const pixKey = "31 9 8231-1929";
  const timeoutRef = useRef<any>(null);
  const confettiTimeoutRef = useRef<any>(null);



  // Gera bandeiras flutuantes para o background de forma randômica
  const [floatingFlags] = useState<FloatingFlag[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: flagEmojis[Math.floor(Math.random() * flagEmojis.length)],
      left: Math.random() * 90 + 5, // 5% a 95%
      delay: Math.random() * 6,
      duration: 12 + Math.random() * 15, // 12 a 27 segundos
      size: 24 + Math.random() * 20 // 24px a 44px
    }));
  });

  // Busca doações reais aprovadas recentemente ao iniciar a página
  useEffect(() => {
    const fetchRecentDonations = async () => {
      try {
        const { data, error } = await supabase
          .from('pagamentos_pix')
          .select('nome_doador, valor')
          .eq('status', 'approved')
          .order('updated_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          setRecentRealDonations(data);
        }
      } catch (err) {
        console.error('Erro ao buscar doações recentes:', err);
      }
    };
    fetchRecentDonations();
  }, []);

  // Escuta novos pagamentos em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('public_pagamentos_approved')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pagamentos_pix',
        },
        (payload) => {
          const newItem = payload.new as any;
          if (newItem.status === 'approved') {
            triggerCelebration(newItem.nome_doador, newItem.valor);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pagamentos_pix',
        },
        (payload) => {
          const updatedItem = payload.new as any;
          const oldItem = payload.old as any;
          if (updatedItem.status === 'approved' && oldItem?.status !== 'approved') {
            triggerCelebration(updatedItem.nome_doador, updatedItem.valor);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recentRealDonations]);

  // Função que dispara a comemoração visual de confetes e notificação na tela
  const triggerCelebration = (name: string, value: number | string) => {
    const numericVal = typeof value === 'string' ? parseFloat(value) : value;
    const formattedVal = numericVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    // 1. Mostrar a notificação de doação real
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotification({
      name,
      value: formattedVal,
      visible: true
    });

    timeoutRef.current = setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null);
    }, 8000);

    // 2. Disparar a animação de confetes
    setShowConfetti(true);
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    confettiTimeoutRef.current = setTimeout(() => {
      setShowConfetti(false);
    }, 7000); // Confetes duram 7 segundos no ar

    // 3. Adicionar a doação à lista de doações recentes na memória
    setRecentRealDonations(prev => [{ nome_doador: name, valor: numericVal }, ...prev.slice(0, 9)]);
  };

  // Efeito para criar os confetes virtuais quando showConfetti é ativado
  useEffect(() => {
    if (showConfetti) {
      const items = Array.from({ length: 90 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: 8 + Math.random() * 14,
        shape: Math.random() > 0.5 ? 'circle' as const : 'square' as const
      }));
      setConfettis(items);
    } else {
      setConfettis([]);
    }
  }, [showConfetti]);



  const handleCopyPix = () => {
    // Remove espaços e traços para copiar a chave celular limpa, aceita de forma universal pelos bancos
    const cleanKey = pixKey.replace(/[\s-]/g, '');
    navigator.clipboard.writeText(cleanKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-955 font-sans text-white overflow-hidden relative">
      <Header />

      {/* Confetes Digitais de Sucesso */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
          {confettis.map((c) => (
            <div
              key={c.id}
              className="absolute animate-confetti"
              style={{
                left: `${c.left}%`,
                top: `-20px`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                borderRadius: c.shape === 'circle' ? '50%' : '2px',
                animationDelay: `${c.delay}s`,
                animationDuration: `${3.5 + Math.random() * 3.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Estilos CSS Inline para Animações Customizadas */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(105vh) rotate(0deg) scale(0.7);
            opacity: 0;
          }
          10% {
            opacity: 0.35;
          }
          90% {
            opacity: 0.35;
          }
          100% {
            transform: translateY(-15vh) rotate(360deg) scale(1.3);
            opacity: 0;
          }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(-8deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.1); }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateY(50vh) rotate(360deg) translateX(40px);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) translateX(-40px);
            opacity: 0;
          }
        }
        .animate-wave-flag {
          animation: wave 2.2s ease-in-out infinite;
        }
        .animate-confetti {
          animation: confettiFall 4.5s linear forwards;
        }
      `}</style>

      {/* Elementos Decorativos de Fundo Temáticos (Brasil/Copa) */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-yellow-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Imagem de Fundo Temática da Bandeira do Brasil e Estádio */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
        style={{ backgroundImage: 'url(/background_brasil.png)' }}
      />

      {/* Bandeiras flutuantes dinâmicas da Copa no background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {floatingFlags.map((flag) => (
          <div
            key={flag.id}
            style={{
              left: `${flag.left}%`,
              animationDelay: `${flag.delay}s`,
              animationDuration: `${flag.duration}s`,
              fontSize: `${flag.size}px`,
              animationName: 'floatUp',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
              position: 'absolute',
              bottom: '-50px',
              opacity: 0,
            }}
          >
            {flag.emoji}
          </div>
        ))}
      </div>

      <main className="flex-1 flex items-center justify-center mt-20 relative z-10 overflow-hidden w-full h-full">

        {/* Container Principal cobrindo 100% do viewport */}
        <div className="w-full h-full bg-zinc-950/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 px-6 py-8 md:px-20 relative overflow-hidden">

          {/* Efeito luminoso interno */}
          <div className="absolute -inset-96 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.06)_0,transparent_50%)] pointer-events-none" />

          {/* Lado Esquerdo: Informações do Cantor e Identidade Brasil/Copa */}
          <div className="flex flex-col gap-4 md:gap-6 flex-1 text-center md:text-left">

            {/* Tag/Badge de Destaque */}
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-yellow-400 text-[10px] md:text-xs font-black uppercase tracking-widest bg-yellow-400/10 border border-yellow-400/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.15)] flex items-center gap-1.5">
                <Trophy size={12} className="text-yellow-400" />
                Copa do Mundo 2026
              </span>
            </div>

            {/* Nome do Cantor em Altíssimo Destaque */}
            <div className="flex flex-col gap-1">
              <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
                Atração Confirmada
              </h2>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 uppercase tracking-wide drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                Nilson Garcia
              </h1>
              <p className="text-xs md:text-sm font-bold text-zinc-300 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Music size={14} className="text-emerald-400" />
                O Show da Copa na ExpoGoiabal
              </p>
            </div>

            {/* Texto Curto e Grande para Apoiar o Cantor */}
            <h3 className="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-300 to-emerald-300 uppercase tracking-wider leading-tight drop-shadow-[0_0_15px_rgba(34,197,94,0.2)] max-w-md">
              Apoie o cantor com qualquer valor
            </h3>

            <p className="text-zinc-400 text-xs md:text-sm max-w-xs hidden md:block">
              Escanear o QR Code ao lado pelo aplicativo do seu banco, defina o valor livremente e veja sua doação aparecer no telão em tempo real!
            </p>

          </div>

          {/* Lado Direito: QR Code Estático e Chave PIX */}
          <div className="flex flex-col items-center justify-center gap-3 md:gap-5 w-full md:w-auto shrink-0 z-10">

            {/* Título Grande Amarelo acima do QR Code */}
            <div className="text-center h-12 flex flex-col justify-center">
              <h2 className="text-xl md:text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.25)]">
                Vaquinha do Cantor
                  </h2>
              <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                Escaneie o QR Code abaixo para apoiar
              </p>
            </div>

            {/* Box do QR Code Estático e SUPER GIGANTE */}
            <div className="relative w-72 h-72 md:w-[360px] md:h-[360px] group">
              {/* Moldura Externa de Neon e Efeito Pulsante */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-blue-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

              {/* Container Interno */}
              <div className="relative w-full h-full bg-white border-[8px] border-yellow-500/60 rounded-3xl p-4 shadow-[0_0_40px_rgba(234,179,8,0.35)] flex items-center justify-center overflow-hidden">
                {/* Selo da Bandeira do Brasil Animada */}
                <div className="absolute -top-2 -right-2 bg-zinc-955 border-2 border-yellow-500 rounded-full w-10 h-10 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)] z-20 animate-wave-flag">
                  <span className="text-xl select-none">🇧🇷</span>
                </div>

                <img
                  src="/QR.png"
                  alt="QR Code Vaquinha Nilson Garcia"
                  className="w-full h-full object-contain filter contrast-125 select-none pointer-events-none"
                />
                {/* Neon Glow overlay */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/10 via-yellow-400/10 to-blue-500/10 rounded-2xl pointer-events-none" />
              </div>
            </div>

            {/* Info Chave PIX */}
            <div className="w-full max-w-[300px] md:max-w-[360px] flex flex-col items-center gap-3">
              {/* Chave PIX Muito Grande */}
              <div className="flex flex-col items-center gap-1.5 w-full bg-zinc-950/60 border border-zinc-800/80 px-4 py-3 rounded-2xl shadow-inner">
                <span className="text-xs md:text-sm text-zinc-300 uppercase tracking-[0.2em] font-black">PIX Copia e Cola</span>
                <div className="flex items-center gap-3 w-full justify-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-yellow-400 font-mono tracking-wider select-all overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] md:max-w-[260px]">
                    {pixKey}
                  </span>
                  <button
                    onClick={handleCopyPix}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white p-2 rounded-xl border border-zinc-800 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    title="Copiar Chave PIX"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {copied && (
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider animate-bounce">
                  Chave PIX copiada!
                </span>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                <ShieldCheck size={12} className="text-emerald-500 animate-pulse" />
                Confirmação Automática via Mercado Pago
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer Compacto */}
      <footer className="shrink-0 p-4 flex items-center justify-between bg-zinc-950/80 border-t border-zinc-900 text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest z-10">
        <span className="flex items-center gap-1">
          <Sparkles size={10} className="text-emerald-500" />
          Prefeitura de São José do Goiabal
        </span>
        <a href="/ExpoGoiabal/Inicio" className="hover:text-yellow-400 transition-colors">
          Voltar ao Início
        </a>
      </footer>

      {/* Balão de Diálogo de Doações do PIX */}
      {notification && (
        <div className="fixed top-28 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
          <div
            className={`pointer-events-auto max-w-4xl w-full sm:w-auto bg-zinc-950/98 border-4 border-yellow-400 rounded-[40px] p-8 md:p-12 shadow-[0_0_60px_rgba(234,179,8,0.75)] flex items-center gap-8 md:gap-10 transition-all duration-500 transform ${notification.visible
                ? 'translate-y-0 opacity-100 scale-110 md:scale-120 animate-bounce'
                : '-translate-y-12 opacity-0 scale-95 pointer-events-none'
              }`}
          >
            {/* Ícone de Moedas / PIX Maior */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center text-emerald-450 shrink-0 shadow-[0_0_35px_rgba(16,185,129,0.6)]">
              <span className="font-black text-lg md:text-2xl tracking-widest">PIX</span>
            </div>
            <div className="flex flex-col text-left gap-2 md:gap-3">
              <span className="text-sm md:text-lg font-black text-emerald-450 uppercase tracking-[0.25em] flex items-center gap-2.5">
                <Sparkles size={20} className="text-yellow-400 animate-pulse" />
                Doação Recebida!
              </span>
              <p className="text-lg md:text-3xl lg:text-4xl font-bold text-white leading-snug">
                <strong className="text-yellow-400 font-black">{notification.name}</strong> enviou R$ {notification.value}!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
