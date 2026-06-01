import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../components/Header';
import { Sparkles, Trophy, Plus, HelpCircle, TrendingUp } from 'lucide-react';

interface CoinParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  scale: number;
}

export interface DistributionResult {
  totalPot: number;
  reservadoCampeaoShare: number;
  completionAllocated: number;
  surplus: number;
  regional2Share: number;
  regional3Share: number;
  placements4to15Share: number;
  reservadoCampeaoTotal: number;
  regional2Total: number;
  regional3Total: number;
  placementsPrizes: number[];
  maxUnlockedIndex: number;
}

export const calculateDistribution = (totalPot: number): DistributionResult => {
  // 1. Reservado Campeão first share (10%) - capped at R$ 2.000,00
  let reservadoCampeaoShare = 0.10 * totalPot;
  if (reservadoCampeaoShare > 2000.00) {
    reservadoCampeaoShare = 2000.00;
  }

  const remainingAfterRC = totalPot - reservadoCampeaoShare;

  // 2. Ladder Completion to 15th place (base budget up to R$ 2.400,00, total 12 places: 4th to 15th)
  // Placements unlock step-by-step for each R$ 200 accumulated in this budget.
  const completionNeeded = 2400.00;
  const completionAllocated = Math.min(remainingAfterRC, completionNeeded);
  const remainingAfterCompletion = remainingAfterRC - completionAllocated;

  // Initialize placements 4 to 15 array (size 12)
  const placementsPrizes = Array(12).fill(0);

  // Calculate how many placements are unlocked
  let numUnlocked = 0;
  if (completionAllocated > 0) {
    numUnlocked = Math.min(12, Math.floor(completionAllocated / 200));
    if (numUnlocked === 0) numUnlocked = 1; // Unlocks at least the 4th place if there is any allocation
  }
  let maxUnlockedIndex = numUnlocked - 1;

  let surplus = 0;
  let regional2Share = 0;
  let regional3Share = 0;
  let placements4to15Share = 0;

  if (remainingAfterCompletion > 0) {
    surplus = remainingAfterCompletion;

    if (reservadoCampeaoShare >= 2000.00) {
      // Quando o Reservado Campeão já atingiu o limite de R$ 2.000,00:
      // 10% para o Reservado Campeão (somado à cota anterior)
      // 20% para o Regional 2º Lugar
      // 10% para o Regional 3º Lugar
      // 60% divididos proporcionalmente entre 4º e 15º Lugar Geral
      reservadoCampeaoShare += 0.10 * surplus;
      regional2Share = 0.20 * surplus;
      regional3Share = 0.10 * surplus;
      placements4to15Share = 0.60 * surplus;
    } else {
      // Se o Reservado Campeão AINDA NÃO atingiu o limite de R$ 2.000,00:
      // 15% para o Reservado Campeão (somado à cota anterior e respeitando o limite geral de R$ 2.000)
      // 20% para o Regional 2º Lugar
      // 10% para o Regional 3º Lugar
      // 55% divididos proporcionalmente entre 4º e 15º Lugar Geral
      const amountToReachLimit = 2000.00 - reservadoCampeaoShare;
      const surplusUsedToReachLimit = amountToReachLimit / 0.15;

      if (surplus <= surplusUsedToReachLimit) {
        reservadoCampeaoShare += 0.15 * surplus;
        regional2Share = 0.20 * surplus;
        regional3Share = 0.10 * surplus;
        placements4to15Share = 0.55 * surplus;
      } else {
        // Reservado Campeão atinge o limite de R$ 2.000,00 e o restante do excedente
        // transiciona para as porcentagens de quando ele atingiu o limite.
        reservadoCampeaoShare = 2000.00;
        const remainingSurplus = surplus - surplusUsedToReachLimit;

        reservadoCampeaoShare += 0.10 * remainingSurplus;
        regional2Share = 0.20 * surplus;
        regional3Share = 0.10 * surplus;
        placements4to15Share = (0.55 * surplusUsedToReachLimit) + (0.60 * remainingSurplus);
      }
    }
  }

  // Descending fair proportional weights for index 0 to 11 (4º to 15º Lugar Geral)
  // Higher places get a larger portion of the total allocated pool.
  const totalForPlacements = completionAllocated + placements4to15Share;
  const weights = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4];

  if (numUnlocked > 0 && totalForPlacements > 0) {
    // Sum of active weights for currently unlocked placements
    let activeWeightsSum = 0;
    for (let i = 0; i < numUnlocked; i++) {
      activeWeightsSum += weights[i];
    }

    // Distribute the total pool proportionally using the active weights
    for (let i = 0; i < numUnlocked; i++) {
      placementsPrizes[i] = (weights[i] / activeWeightsSum) * totalForPlacements;
    }
  }

  // Calculate final totals
  const reservadoCampeaoTotal = 500.00 + reservadoCampeaoShare;
  const regional2Total = 250.00 + regional2Share;
  const regional3Total = 250.00 + regional3Share;

  return {
    totalPot,
    reservadoCampeaoShare,
    completionAllocated,
    surplus,
    regional2Share,
    regional3Share,
    placements4to15Share,

    reservadoCampeaoTotal,
    regional2Total,
    regional3Total,
    placementsPrizes,
    maxUnlockedIndex
  };
};

export const PotePremiadoPage: React.FC = () => {
  const [targetValue, setTargetValue] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<number>(0);

  // One-time reset effect to zero out the pot as requested
  useEffect(() => {
    const hasReset = localStorage.getItem('has_zeroed_v6');
    if (!hasReset) {
      localStorage.setItem('pote_premiado_value', '0');
      localStorage.setItem('has_zeroed_v6', 'true');
      setTargetValue(0);
      setDisplayValue(0);
    } else {
      const saved = localStorage.getItem('pote_premiado_value');
      if (saved) {
        setTargetValue(parseFloat(saved));
        setDisplayValue(parseFloat(saved));
      }
    }
  }, []);
  const [inputVal, setInputVal] = useState<string>(''); // Input para novo lançamento
  const [isAnimating, setIsAnimating] = useState<boolean>(false); // Controla animações do pote
  const [coins, setCoins] = useState<CoinParticle[]>([]); // Moedas voadoras
  const [showAumentoAlert, setShowAumentoAlert] = useState<boolean>(false); // Banner "O POTE AUMENTOU!"
  const [alertAmount, setAlertAmount] = useState<number>(0); // Quantidade do aumento
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false); // Modal explicativo das divisões
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false); // Painel administrativo oculto por padrão

  // Ouvinte de teclado para atalho secreto Ctrl+Alt+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        setShowAdminPanel((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Estados para o Avatar de Presságio "Trovão de Ouro"
  const [isAnticipating, setIsAnticipating] = useState<boolean>(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string>('');

  // Show Open Spectacular countdown & strobe effects
  const [isEarthquake, setIsEarthquake] = useState<boolean>(false);
  const [showFlash, setShowFlash] = useState<boolean>(false);

  const animationRef = useRef<number | null>(null);

  // Dynamic fill height calculation
  // Base filling is around 25%, going up to 92% of the jar height
  const fillPercentage = Math.min(25 + (displayValue / 400), 92);

  // Map the fillPercentage (25 to 92) smoothly to SVG Y coordinates inside the jar (285 near bottom, 90 near top)
  const currentY = 285 - ((fillPercentage - 25) / (92 - 25)) * 195;

  const dist = calculateDistribution(displayValue);

  // Efeito para contar de forma suave até o targetValue
  useEffect(() => {
    if (displayValue === targetValue) return;

    const duration = 4500; // 4.5 segundos de animação para dar muita emoção!
    const startTime = performance.now();
    const startValue = displayValue;
    const diff = targetValue - startValue;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing de desaceleração dramática (EaseOutQuint) - começa super rápido e desacelera de forma emocionante!
      const easeProgress = 1 - Math.pow(1 - progress, 5);
      const currentValue = startValue + diff * easeProgress;

      setDisplayValue(Math.floor(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        setIsAnimating(false);
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetValue]);

  // Lançamento real do valor pós-presságio - Passo 1: Animação do Logo da Festa e Valor do Aumento (Celebração de Entrada)
  const triggerActualLaunch = (addedAmount: number) => {
    setAlertAmount(addedAmount);
    setShowAumentoAlert(true);

    // Duração total da revelação cinematográfica: 4.5 segundos
    setTimeout(() => {
      setShowAumentoAlert(false);

      // Passo 2: O Pote dourado começa a chacoalhar, a receber as moedas e a subir de valor em tempo real
      triggerPotIncrease(addedAmount);
    }, 4500);
  };

  // Passo 2: Animação do pote recebendo o dinheiro, chuva de moedas e subida do valor (Executado após toda animação anterior)
  const triggerPotIncrease = (addedAmount: number) => {
    // Trigger de moedas voadoras - 35 moedas com atrasos de até 2.8 segundos
    const newParticles: CoinParticle[] = Array.from({ length: 35 }).map((_, i) => ({
      id: Date.now() + i,
      x: 10 + Math.random() * 80, // Variação horizontal
      y: 70 + Math.random() * 20, // Ponto de partida
      delay: Math.random() * 2.8, // Espalha as moedas
      scale: 0.5 + Math.random() * 0.6,
    }));

    setCoins(newParticles);

    // Dispara a subida suave do valor do pote
    const newTarget = targetValue + addedAmount;
    setTargetValue(newTarget);
    localStorage.setItem('pote_premiado_value', newTarget.toString());

    // Fala comemorativa do mascote flutuante
    const comemoracoes = [
      "AJEITA A FIVELA! O POTE SUBIU MAIS QUE TOURO BRAVO! 🐂🔥",
      "A ARENA TÁ TREMENDO! MAIS DINHEIRO NO BOLSO DO PEÃO! 🤠✨",
      "SEGURA ESSA BOIADA! O POTE TÁ EXPLODINDO DE PREMIAÇÃO! 💰⚡",
    ];
    setSpeechBubbleText(comemoracoes[Math.floor(Math.random() * comemoracoes.length)]);
    setShowSpeechBubble(true);

    setTimeout(() => {
      setShowSpeechBubble(false);
    }, 4500);

    // Limpa moedas após voarem completando a animação de recebimento
    setTimeout(() => {
      setCoins([]);
    }, 5500);
  };

  // Lançamento com fase de antecipação espetacular e presságio cinematográfico
  const handleLaunchValue = (e: React.FormEvent) => {
    e.preventDefault();
    const addedAmount = parseFloat(inputVal);
    if (isNaN(addedAmount) || addedAmount <= 0) return;

    setIsAnticipating(true);
    setInputVal('');

    // Trigger de vibração inicial se suportado
    if (navigator.vibrate) {
      navigator.vibrate([150, 100, 150]);
    }

    // Duração total do presságio: 1.5 segundos antes de disparar o aumento (sincronizado com a animação do touro)
    setTimeout(() => {
      setIsAnticipating(false);
      triggerActualLaunch(addedAmount);
    }, 1500);
  };

  // Fala interativa do mascote flutuante
  const triggerMascotSpeak = () => {
    const quotes = [
      "Ajeita a fivela e segura na rédea! O pote tá esquentando! 🐂🤠",
      "ExpoGoiabal 2026: Emoção de 8 segundos que treme o chão! ⚡",
      "O pote tá crescendo mais rápido que pulo de touro brabo! 💰🔥",
      "Alô Goiabal! Sentiu a pressão da arena com esse prêmio? 🎙️✨",
      "Segura peão! Quem tem garra bate o pé e ganha a premiação! 🏆",
      "Trovão de Ouro tá de olho na arena... Quem vai levar o prêmio? 👁️🐂",
    ];
    setSpeechBubbleText(quotes[Math.floor(Math.random() * quotes.length)]);
    setShowSpeechBubble(true);

    setTimeout(() => {
      setShowSpeechBubble(false);
    }, 4500);
  };

  // Função para zerar o pote a qualquer momento
  const handleZeroPot = () => {
    localStorage.setItem('pote_premiado_value', '0');
    setTargetValue(0);
    setDisplayValue(0);
    setInputVal('');
    setCoins([]);
    setShowAumentoAlert(false);
    setIsAnticipating(false);
    setShowSpeechBubble(false);
    setIsEarthquake(false);
    setShowFlash(false);
  };

  // Formata o valor monetário
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-955 font-sans text-white overflow-hidden relative transition-all duration-150 ${isEarthquake ? 'animate-earthquake' : ''}`}>
      <Header />

      {/* Estilos e animações keyframes customizadas */}
      <style>{`
        @keyframes float-coin {
          0% {
            transform: translateY(350px) scale(0) rotateX(0deg) rotateY(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1) rotateX(360deg) rotateY(720deg);
            opacity: 0;
          }
        }
        .animate-coin {
          animation: float-coin 2.2s forwards cubic-bezier(0.25, 1, 0.5, 1);
        }
        @keyframes jar-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 15px 30px rgba(0,0,0,0.5)); }
          50% { transform: scale(1.01); filter: drop-shadow(0 20px 40px rgba(234,179,8,0.25)); }
        }
        .animate-jar-glow {
          animation: jar-pulse 4.5s infinite ease-in-out;
        }
        @keyframes jar-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-2deg) scale(1.03); }
          30% { transform: rotate(2deg) scale(1.03); }
          45% { transform: rotate(-1.5deg) scale(1.02); }
          60% { transform: rotate(1.5deg) scale(1.02); }
          75% { transform: rotate(-1deg) scale(1.01); }
          90% { transform: rotate(1deg) scale(1.01); }
        }
        .animate-shake-infinite {
          animation: jar-shake 0.8s infinite ease-in-out;
        }
        @keyframes alert-popup {
          0% { transform: translateY(-50px) scale(0.9); opacity: 0; }
          15% { transform: translateY(0) scale(1.05); opacity: 1; }
          20% { transform: translateY(0) scale(1); opacity: 1; }
          85% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(0.95); opacity: 0; }
        }
        .animate-alert {
          animation: alert-popup 5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes bull-smoke-l {
          0% { transform: translate(-5px, 5px) scale(0.3) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(-28px, 28px) scale(1.8) rotate(-45deg); opacity: 0; filter: blur(3px); }
        }
        @keyframes bull-smoke-r {
          0% { transform: translate(5px, 5px) scale(0.3) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translate(28px, 28px) scale(1.8) rotate(45deg); opacity: 0; filter: blur(3px); }
        }
        .animate-smoke-l {
          animation: bull-smoke-l 1.2s infinite ease-out;
        }
        .animate-smoke-r {
          animation: bull-smoke-r 1.2s infinite ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s forwards ease-out;
        }
        @keyframes arena-strobe {
          0%, 100% { background-color: rgba(9, 9, 11, 0.96); }
          50% { background-color: rgba(146, 64, 14, 0.32); } /* Golden strobe flash */
        }
        .animate-arena-strobe {
          animation: arena-strobe 0.33s infinite ease-in-out;
        }
        @keyframes pyro-sparkle {
          0% { transform: translateY(100vh) translateX(0) scale(0) rotate(0deg); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(var(--drift)) scale(var(--scale)) rotate(360deg); opacity: 0; }
        }
        .animate-pyro {
          animation: pyro-sparkle 1.8s infinite linear;
        }
        @keyframes giant-beat {
          0% { transform: scale(0.3); opacity: 0; }
          20% { transform: scale(1.3); opacity: 1; }
          40% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .animate-countdown-beat {
          animation: giant-beat 0.95s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes screen-earthquake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-3px, -2px) rotate(-0.5deg); }
          20% { transform: translate(3px, 2px) rotate(0.5deg); }
          30% { transform: translate(-1px, 2px) rotate(-0.5deg); }
          40% { transform: translate(2px, -1px) rotate(0.5deg); }
          50% { transform: translate(-3px, 1px) rotate(0deg); }
          60% { transform: translate(3px, 2px) rotate(0.5deg); }
          70% { transform: translate(-1px, -2px) rotate(-0.5deg); }
          80% { transform: translate(-2px, 2px) rotate(0.5deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
        }
        .animate-earthquake {
          animation: screen-earthquake 0.1s infinite;
        }

        /* Novas animações de presságio de alto nível para ExpoGoiabal 2026 */
        @keyframes bull-charge-cinematic {
          0% {
            transform: scale(0.5) translateY(100px);
            opacity: 0;
          }
          20% {
            transform: scale(1.0) translateY(0);
            opacity: 1;
          }
          60% {
            transform: scale(1.05) translateY(-5px);
            opacity: 1;
          }
          85% {
            transform: scale(1.3) translateY(-40px);
            opacity: 0;
          }
          100% {
            transform: scale(1.3) translateY(-40px);
            opacity: 0;
          }
        }
        .animate-bull-charge-cinematic {
          animation: bull-charge-cinematic 1.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
        }

        @keyframes logo-burst-cinematic {
          0% {
            transform: scale(0) rotate(-15deg);
            opacity: 0;
          }
          12% {
            transform: scale(1.2) rotate(4deg);
            opacity: 1;
          }
          20% {
            transform: scale(0.95) rotate(-2deg);
            opacity: 1;
          }
          28% {
            transform: scale(1.02) rotate(1deg);
            opacity: 1;
          }
          35% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          85% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.9) translateY(-10px);
            opacity: 0;
          }
        }
        .animate-logo-burst-cinematic {
          animation: logo-burst-cinematic 4.5s forwards cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes value-rise-cinematic {
          0% {
            transform: translateY(60px) scale(0.8);
            opacity: 0;
          }
          12% {
            transform: translateY(60px) scale(0.8);
            opacity: 0;
          }
          24% {
            transform: translateY(-10px) scale(1.1);
            opacity: 1;
          }
          32% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          85% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
          }
        }
        .animate-value-rise-cinematic {
          animation: value-rise-cinematic 4.5s forwards cubic-bezier(0.25, 1, 0.5, 1);
        }

        @keyframes halo-rotate-cinematic {
          0% {
            transform: rotate(0deg) scale(0.6);
            opacity: 0;
          }
          12% {
            transform: rotate(60deg) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 0.6;
          }
        }
        .animate-halo-rotate-cinematic {
          animation: halo-rotate-cinematic 4.5s forwards linear;
        }
      `}</style>

      {/* Background Layers */}
      <div
        className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }}
      />
      <div
        className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }}
      />

      {/* 1. Grand Celebration Overlay (Logo Burst & Added Value) - Sibling OUTSIDE main for 100% razor-sharp rendering */}
      {showAumentoAlert && (
        <>
          {/* Independent Dark Dim Layer (Backdrop blur is safely applied to <main> below to prevent overlay text/image blur issues) */}
          <div className="fixed inset-0 z-40 bg-black/60 pointer-events-none transition-all duration-300" />

          {/* Independent Sharp Celebration Content Layer */}
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 transform-gpu">
            
            {/* Ambient rotating halo backdrop */}
            <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.15)_0%,transparent_70%)] animate-halo-rotate-cinematic z-0 pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center w-full max-w-lg z-10 px-4 pointer-events-none">

              {/* Animated Event Logo (bursts and bounces) */}
              <div className="animate-logo-burst-cinematic z-10 w-full flex justify-center drop-shadow-[0_0_50px_rgba(234,179,8,0.6)] transform-gpu">
                <img
                  src="/logo-header.png"
                  alt="ExpoGoiabal Logo"
                  className="w-80 max-w-full h-auto object-contain"
                />
              </div>

              {/* Elegant Added Prize Value (slides up dynamically beneath the logo) */}
              <div className="animate-value-rise-cinematic z-10 flex flex-col items-center mt-6 text-center select-none transform-gpu">
                <span className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-500 font-mono tracking-tight filter drop-shadow-[0_0_30px_rgba(234,179,8,0.7)]">
                  + {formatCurrency(alertAmount)}
                </span>
                <span className="text-xs text-yellow-500 font-black uppercase tracking-[0.25em] mt-3 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Adicionado ao Pote
                </span>
              </div>

            </div>
          </div>
        </>
      )}

      {/* 2. Dramatic Anticipation Overlay (Presságio do "Trovão de Ouro" - Touro Passageiro) - Sibling OUTSIDE main */}
      {isAnticipating && (
        <>
          {/* Independent Dark Dim Layer (Backdrop blur is safely applied to <main> below to prevent overlay text/image blur issues) */}
          <div className="fixed inset-0 z-40 bg-zinc-950/80 pointer-events-none transition-all duration-300" />

          {/* Independent Sharp Bull Content Layer */}
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 transform-gpu">
            <div className="relative flex flex-col items-center justify-center w-full max-w-lg z-10 px-4 pointer-events-none">
              
              {/* Fleet Transient Bull Mascot Animation Container */}
              <div className="animate-bull-charge-cinematic z-20 pointer-events-none flex flex-col items-center transform-gpu">
                <svg viewBox="0 0 200 200" className="w-64 h-64 drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]">
                  <defs>
                    <radialGradient id="bullEyeActive" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="#facc15" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </radialGradient>
                    <linearGradient id="bullHornActive" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ca8a04" />
                      <stop offset="50%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#713f12" />
                    </linearGradient>
                    <linearGradient id="bullHat" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a16207" />
                      <stop offset="50%" stopColor="#713f12" />
                      <stop offset="100%" stopColor="#451a03" />
                    </linearGradient>
                  </defs>

                  {/* Bull Horns */}
                  <path d="M 55,85 C 40,55 30,35 15,35 C 10,35 15,45 28,60 C 38,72 48,82 55,85 Z" fill="url(#bullHornActive)" stroke="#fde047" strokeWidth="1" />
                  <path d="M 145,85 C 160,55 170,35 185,35 C 190,35 185,45 172,60 C 162,72 152,82 145,85 Z" fill="url(#bullHornActive)" stroke="#fde047" strokeWidth="1" />

                  {/* Bull Ears */}
                  <polygon points="55,100 25,115 50,118" fill="#18181b" stroke="#ca8a04" strokeWidth="0.5" />
                  <polygon points="145,100 175,115 150,118" fill="#18181b" stroke="#ca8a04" strokeWidth="0.5" />

                  {/* Main Head Structure */}
                  <polygon points="60,85 140,85 145,120 120,165 80,165 55,120" fill="#18181b" stroke="url(#coinGoldGrad)" strokeWidth="2.5" />
                  <polygon points="70,95 130,95 135,118 115,155 85,155 65,118" fill="#09090b" stroke="#ca8a04" strokeWidth="0.6" />

                  {/* Brow Plate */}
                  <polygon points="65,95 135,95 100,120" fill="#27272a" stroke="#ca8a04" strokeWidth="0.8" />

                  {/* Glowing Neon Eyes */}
                  <polygon points="72,108 92,112 88,118 74,114" fill="url(#bullEyeActive)" />
                  <polygon points="128,108 108,112 112,118 126,114" fill="url(#bullEyeActive)" />

                  {/* Mechanical Snout */}
                  <polygon points="82,142 118,142 114,162 86,162" fill="#27272a" stroke="#ca8a04" strokeWidth="0.8" />
                  {/* Nostrils */}
                  <circle cx="91" cy="151" r="3.5" fill="#09090b" stroke="#713f12" strokeWidth="0.5" />
                  <circle cx="109" cy="151" r="3.5" fill="#09090b" stroke="#713f12" strokeWidth="0.5" />

                  {/* Glowing Snout Smoke Particles */}
                  <ellipse cx="91" cy="153" rx="4" ry="4" fill="#eab308" opacity="0.8" className="animate-smoke-l pointer-events-none" />
                  <ellipse cx="109" cy="153" rx="4" ry="4" fill="#eab308" opacity="0.8" className="animate-smoke-r pointer-events-none" />

                  {/* Shiny Gold Nose Ring */}
                  <path d="M 90,154 A 14,14 0 0 0 110,154" fill="none" stroke="url(#coinGoldGrad)" strokeWidth="3" strokeLinecap="round" />

                  {/* Cowboy Hat sitting on head */}
                  <path d="M 40,75 C 65,70 135,70 160,75 C 175,78 185,83 190,87 C 190,87 170,82 100,82 C 30,82 10,87 10,87 C 15,83 25,78 40,75 Z" fill="url(#bullHat)" stroke="#ca8a04" strokeWidth="0.8" />
                  <path d="M 60,72 C 60,40 75,32 100,32 C 125,32 140,40 140,72" fill="url(#bullHat)" stroke="#eab308" strokeWidth="0.6" />
                  {/* Golden Hatband */}
                  <path d="M 60,69 C 75,66 125,66 140,69" fill="none" stroke="url(#coinGoldGrad)" strokeWidth="2.5" />
                </svg>
              </div>

            </div>
          </div>
        </>
      )}

      <main className={`flex-1 pt-20 pb-8 px-4 relative flex flex-col items-center justify-start z-10 w-full max-w-5xl mx-auto gap-4 transition-all duration-300 ${
        showAumentoAlert || isAnticipating ? 'filter blur-md scale-[0.99] opacity-40 pointer-events-none' : ''
      }`}>

        {/* Header Title Section */}
        <div className="flex flex-col items-center text-center gap-2 max-w-2xl">
          <span className="text-yellow-500 text-xs font-black uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center gap-2 animate-pulse">
            <Sparkles size={14} className="animate-spin duration-3000 text-yellow-500" />
            Grande Atração ExpoGoiabal
          </span>
          <h1
            onDoubleClick={() => setShowAdminPanel((prev) => !prev)}
            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 uppercase tracking-widest drop-shadow-[0_0_25px_rgba(245,158,11,0.35)] cursor-pointer select-none"
            title="Dê duplo clique para alternar painel admin"
          >
            Pote Premiado 💰
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
            Acompanhe o valor acumulado em tempo real! Toda vez que uma nova premiação for lançada, o pote cresce na tela com chuva de moedas.
          </p>
        </div>
        {/* Dynamic Money Pot Container */}
        <div className="relative flex flex-col items-center justify-center -mt-4">

          {/* Ambient Radial Golden Glow */}
          <div className={`absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-yellow-500/10 blur-[60px] md:blur-[80px] transition-all duration-1000 pointer-events-none -z-10 ${isAnimating ? 'scale-125 bg-yellow-500/25' : 'scale-100'
            }`} />

          {/* Golden Coins Particle Layer (Floating outside/above the jar) */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {coins.map((coin) => (
              <div
                key={coin.id}
                style={{
                  left: `${coin.x}%`,
                  bottom: `${coin.y}%`,
                  animationDelay: `${coin.delay}s`,
                  transform: `scale(${coin.scale})`,
                }}
                className="absolute w-5 h-5 bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 rounded-full border border-yellow-200 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-coin flex items-center justify-center font-black text-[8px] text-yellow-100 select-none"
              >
                $
              </div>
            ))}
          </div>

          {/* Glass Jar SVG Container */}
          <div className={`relative transition-all duration-500 ${isAnimating ? 'animate-shake-infinite' : 'animate-jar-glow'
            }`}>
            <svg
              viewBox="0 0 300 350"
              className="w-64 h-72 md:w-72 md:h-80 select-none"
            >
              <defs>
                <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.4" />
                </filter>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <linearGradient id="brushedGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="25%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="75%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>

                <radialGradient id="coinGoldGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="85%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#854d0e" />
                </radialGradient>

                <linearGradient id="barGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="35%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>

                <linearGradient id="goldLiquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0.6" />
                  <stop offset="35%" stopColor="#eab308" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#78350f" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient id="thickGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                </linearGradient>

                <linearGradient id="glassBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="70%" stopColor="#eab308" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.3" />
                </linearGradient>

                <radialGradient id="jarInteriorBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2e1b0c" /> {/* Deep dark gold amber shadow */}
                  <stop offset="100%" stopColor="#09090b" />
                </radialGradient>

                <clipPath id="jarClip">
                  <path d="M 105,70 L 195,70 C 205,70 215,80 215,95 L 215,290 C 215,305 205,315 195,315 L 105,315 C 95,315 85,305 85,290 L 85,95 C 85,80 95,70 105,70 Z" />
                </clipPath>

                {/* Highly Polished Gold Coin Component Template */}
                <g id="svgCoin">
                  <circle cx="0" cy="0" r="14" fill="url(#coinGoldGrad)" stroke="#fef08a" strokeWidth="0.8" filter="url(#dropShadow)" />
                  <circle cx="0" cy="0" r="10.5" fill="none" stroke="#ca8a04" strokeWidth="0.6" strokeDasharray="1.5,1" />
                  <text x="0" y="3.5" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#713f12" textAnchor="middle">
                    $
                  </text>
                  <path d="M -7,-7 A 10,10 0 0 1 7,-7" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
                </g>

                {/* Highly Polished Gold Bar Template */}
                <g id="svgGoldBar">
                  <polygon points="-18,-8 18,-8 14,8 -14,8" fill="url(#barGoldGrad)" stroke="#fef08a" strokeWidth="0.6" filter="url(#dropShadow)" />
                  <line x1="-16" y1="-6" x2="16" y2="-6" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
                  <line x1="-17" y1="-6" x2="-13" y2="6" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
                </g>
              </defs>

              {/* 1. Symmetrical Glass Jar Body (Interior Clipping Mask) */}
              <g clipPath="url(#jarClip)">
                {/* Deep glowing interior bg */}
                <rect x="0" y="0" width="300" height="350" fill="url(#jarInteriorBg)" />

                {/* Bulk gold liquid/glowing treasure mass */}
                <rect
                  x="70"
                  y={currentY}
                  width="160"
                  height="260"
                  fill="url(#goldLiquidGradient)"
                  className="transition-all duration-1000"
                />

                {/* Stacks of Gold Bars and Coins (Floating beautifully right on the dynamic line!) */}
                <g className="transition-all duration-1000">
                  {/* Base Gold Bars */}
                  <use href="#svgGoldBar" x="120" y={currentY + 12} transform="rotate(-8 120 207.6)" />
                  <use href="#svgGoldBar" x="180" y={currentY + 16} transform="rotate(10 180 207.6)" />
                  {/* Top Gold Bar */}
                  <use href="#svgGoldBar" x="150" y={currentY} transform="rotate(-2 150 207.6)" />

                  {/* Gold Coins overlapping on top of bars */}
                  <use href="#svgCoin" x="98" y={currentY - 4} transform={`rotate(-25 98 ${currentY - 4})`} />
                  <use href="#svgCoin" x="123" y={currentY - 14} transform={`rotate(15 123 ${currentY - 14})`} />
                  <use href="#svgCoin" x="148" y={currentY - 16} transform={`rotate(-5 148 ${currentY - 16})`} />
                  <use href="#svgCoin" x="173" y={currentY - 10} transform={`rotate(30 173 ${currentY - 10})`} />
                  <use href="#svgCoin" x="198" y={currentY - 5} transform={`rotate(-15 198 ${currentY - 5})`} />

                  {/* Overlapping Surface Coin Top Layer */}
                  <use href="#svgCoin" x="110" y={currentY + 2} transform={`rotate(5 110 ${currentY + 2})`} />
                  <use href="#svgCoin" x="136" y={currentY + 4} transform={`rotate(-20 136 ${currentY + 4})`} />
                  <use href="#svgCoin" x="160" y={currentY - 2} transform={`rotate(10 160 ${currentY - 2})`} />
                  <use href="#svgCoin" x="186" y={currentY + 6} transform={`rotate(-10 186 ${currentY + 6})`} />
                </g>

                {/* Submerged background treasure pile */}
                <g className="transition-all duration-1000" style={{ transform: `translateY(${(currentY - 90) * 0.04}px)` }} opacity="0.6">
                  <use href="#svgCoin" x="110" y={currentY + 36} transform="rotate(15)" />
                  <use href="#svgCoin" x="160" y={currentY + 32} transform="rotate(-30)" />
                  <use href="#svgGoldBar" x="145" y={currentY + 50} transform="rotate(45)" />
                  <use href="#svgCoin" x="120" y={currentY + 68} transform="rotate(-10)" />
                  <use href="#svgCoin" x="170" y={currentY + 64} transform="rotate(25)" />
                </g>

                {/* Thick glass base refractive bottom */}
                <path d="M 85,290 L 215,290 C 215,305 205,315 195,315 L 105,315 C 95,315 85,305 85,290 Z" fill="url(#thickGlassGrad)" />

                {/* Thin dividing line on base */}
                <line x1="88" y1="290" x2="212" y2="290" stroke="#ffffff" strokeWidth="0.8" opacity="0.15" />
              </g>

              {/* 2. Sleek Brushed Gold Canister Lid */}
              <rect x="95" y="52" width="110" height="18" rx="4" fill="url(#brushedGoldGrad)" stroke="#fde047" strokeWidth="0.8" filter="url(#dropShadow)" />
              <line x1="97" y1="56" x2="203" y2="56" stroke="#ffffff" strokeWidth="0.6" opacity="0.3" />
              <rect x="135" y="44" width="30" height="8" rx="2" fill="url(#brushedGoldGrad)" stroke="#fde047" strokeWidth="0.5" />

              {/* 3. Luxury Perfume-Style Golden Front Label (Mounted elegantly on the glass) */}
              <g transform="translate(100, 155)">
                {/* Label body */}
                <rect x="0" y="0" width="100" height="46" rx="2" fill="#09090b" stroke="url(#coinGoldGrad)" strokeWidth="1.2" filter="url(#dropShadow)" opacity="0.92" />
                <rect x="3.2" y="3.2" width="93.6" height="39.6" rx="1" fill="none" stroke="#eab308" strokeWidth="0.5" opacity="0.4" />

                {/* Text on label */}
                <text x="50" y="14" fontFamily="Georgia, serif" fontSize="6.4" fill="#eab308" textAnchor="middle" letterSpacing="1.8" opacity="0.9">EXPO GOIABAL</text>
                <text x="50" y="27" fontFamily="sans-serif" fontSize="10.5" fontWeight="900" fill="#ffffff" textAnchor="middle" letterSpacing="0.8">POTE</text>
                <text x="50" y="37" fontFamily="sans-serif" fontSize="7.2" fontWeight="700" fill="#eab308" textAnchor="middle" letterSpacing="1.6">PREMIADO</text>
              </g>

              {/* 4. Symmetrical Glass Jar Outline (Draws outline and gives a thick glass edge) */}
              <path
                d="M 105,70 L 195,70 C 205,70 215,80 215,95 L 215,290 C 215,305 205,315 195,315 L 105,315 C 95,315 85,305 85,290 L 85,95 C 85,80 95,70 105,70 Z"
                fill="none"
                stroke="url(#glassBorderGrad)"
                strokeWidth="4.5"
              />

              {/* Symmetrical Inner Highlight Ring for Glass Thickness */}
              <path
                d="M 108,73 L 192,73 C 200,73 209,82 209,95 L 209,287 C 209,299 200,309 192,309 L 108,309 C 100,309 91,299 91,287 L 91,95 C 91,82 100,73 108,73 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.15"
              />

              {/* Bright Curved Highlights on Left Edge (Adds realistic glass gloss shine) */}
              <line x1="93" y1="95" x2="93" y2="285" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.25" filter="url(#glow)" />
              <line x1="93" y1="95" x2="93" y2="285" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.55" />

              {/* Right edge soft glint reflection */}
              <line x1="207" y1="95" x2="207" y2="285" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.12" />

              {/* Sleek top shoulder glare */}
              <path
                d="M 95,85 A 15,15 0 0 1 110,74"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity="0.3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Counter Block Section - Placed directly below the jar */}
        <div className="flex flex-col items-center gap-1.5 z-10 mt-1">
          <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-black">Valor Acumulado</span>
          <div className="flex items-center gap-2">
            <span className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-md tracking-tight font-mono select-none">
              {formatCurrency(displayValue)}
            </span>
          </div>
          <span className="text-[10px] md:text-xs text-yellow-500/80 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={12} className="animate-pulse" />
            Pote Atualizado em Tempo Real
          </span>
        </div>

        {/* Real-time Prize Distribution Table */}
        <div className="w-full max-w-2xl bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 mt-4 z-10">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                Distribuição Automática da Premiação
              </h3>
              <p className="text-[10px] text-zinc-500">
                Os valores são recalculados automaticamente e refletidos em tempo real na tela do Concurso de Marcha.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-2">Colocação / Categoria</th>
                  <th className="py-3 px-2 text-right">Fixo Inicial</th>
                  <th className="py-3 px-2 text-right text-yellow-500">Fração do Pote</th>
                  <th className="py-3 px-2 text-right text-cyan-400">Total Atualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                <tr>
                  <td className="py-3.5 px-2 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Reservado Campeão
                  </td>
                  <td className="py-3.5 px-2 text-right text-zinc-500">R$ 500</td>
                  <td className="py-3.5 px-2 text-right text-yellow-500/90">+ {formatCurrency(dist.reservadoCampeaoShare)}</td>
                  <td className="py-3.5 px-2 text-right text-cyan-400 font-extrabold text-sm">{formatCurrency(dist.reservadoCampeaoTotal)}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Regional 2º Lugar
                  </td>
                  <td className="py-3.5 px-2 text-right text-zinc-500">R$ 250</td>
                  <td className="py-3.5 px-2 text-right text-yellow-500/90">+ {formatCurrency(dist.regional2Share)}</td>
                  <td className="py-3.5 px-2 text-right text-cyan-400 font-extrabold text-sm">{formatCurrency(dist.regional2Total)}</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-2 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Regional 3º Lugar
                  </td>
                  <td className="py-3.5 px-2 text-right text-zinc-500">R$ 250</td>
                  <td className="py-3.5 px-2 text-right text-yellow-500/90">+ {formatCurrency(dist.regional3Share)}</td>
                  <td className="py-3.5 px-2 text-right text-cyan-400 font-extrabold text-sm">{formatCurrency(dist.regional3Total)}</td>
                </tr>
                {dist.placementsPrizes.map((prize, idx) => {
                  if (prize === 0) return null;
                  const placeNum = idx + 4;
                  return (
                    <tr key={placeNum}>
                      <td className="py-3.5 px-2 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Regional {placeNum}º Lugar
                      </td>
                      <td className="py-3.5 px-2 text-right text-zinc-500">R$ 0</td>
                      <td className="py-3.5 px-2 text-right text-yellow-500/90">+ {formatCurrency(prize)}</td>
                      <td className="py-3.5 px-2 text-right text-cyan-400 font-extrabold text-sm">{formatCurrency(prize)}</td>
                    </tr>
                  );
                })}
                {dist.maxUnlockedIndex === -1 && (
                  <tr>
                    <td className="py-3 px-2 font-medium text-zinc-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-800" />
                      4º ao 15º Lugar Regional
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-600">R$ 0</td>
                    <td className="py-3 px-2 text-right text-zinc-600">Aguardando Saldo</td>
                    <td className="py-3 px-2 text-right text-zinc-600 font-bold">Bloqueados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Audit Calculations Steps - Visible only to Admins */}
          {showAdminPanel && (
            <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 mt-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Breakdown dos Cálculos de Distribuição (Auditoria)
              </h4>
              <div className="flex flex-col gap-2 text-[10px] text-zinc-400 font-medium">
                <div className="flex justify-between items-start gap-4 border-b border-zinc-800/50 pb-2">
                  <span>1. Retirada de 10% para o Reservado Campeão (limite transição R$ 2.000):</span>
                  <span className="font-bold text-white">{formatCurrency(dist.reservadoCampeaoShare)} / R$ 2.000+</span>
                </div>
                <div className="flex justify-between items-start gap-4 border-b border-zinc-800/50 pb-2">
                  <span>2. Alocação Fracionada 4º ao 15º (Liberando cota de R$ 200 cada):</span>
                  <span className="font-bold text-white">Alocado: {formatCurrency(dist.completionAllocated)} / R$ 2.400</span>
                </div>
                <div className="flex justify-between items-start gap-4 border-b border-zinc-800/50 pb-2">
                  <span>3. Quantidade de Colocações Desbloqueadas (4º ao 15º):</span>
                  <span className="font-bold text-green-500">{dist.maxUnlockedIndex >= 0 ? `${dist.maxUnlockedIndex + 1} de 12` : '0 de 12'}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span>4. Excedente Restante Redistribuído Proporcionalmente:</span>
                  <span className="font-bold text-yellow-500">{formatCurrency(dist.surplus)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin launch panel simulation (Destaque & Interativo) - Visible only to Admins */}
        {showAdminPanel && (
          <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 mt-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-500 to-amber-500" />

            <div className="flex flex-col gap-1 text-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center justify-center gap-2">
                🚀 Lançar Novo Valor no Pote
              </h3>
              <p className="text-[10px] text-zinc-500">
                Simule a adição de novos valores de premiação para ver a grandiosa chuva de moedas e a contagem progressiva em ação.
              </p>
            </div>

            <form onSubmit={handleLaunchValue} className="flex flex-col gap-2.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-sm select-none">R$</span>
                  <input
                    type="number"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="1500"
                    required
                    min="1"
                    className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-yellow-500 focus:outline-none text-white text-sm font-bold pl-12 pr-4 py-3.5 rounded-2xl transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs px-6 py-3.5 rounded-2xl transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02] cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={16} />
                  Lançar
                </button>
              </div>

              <button
                type="button"
                onClick={handleZeroPot}
                className="w-full bg-zinc-950 hover:bg-zinc-900 border border-red-500/20 hover:border-red-500/40 text-red-500 hover:text-red-400 font-black text-[10px] py-2.5 rounded-xl transition-all uppercase tracking-widest cursor-pointer text-center"
              >
                Zerar Pote Premiado
              </button>
            </form>
          </div>
        )}

        {/* Additional Help Info Card - Visible only to Admins */}
        {showAdminPanel && (
          <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/10 px-6 py-4 rounded-2xl max-w-xl text-center">
            <HelpCircle size={18} className="text-yellow-500 shrink-0" />
            <p className="text-zinc-500 font-medium text-[11px] leading-relaxed">
              O Pote Premiado é updated conforme novos patrocinadores, repasses ou arrecadações são computados. O valor final acumulado será destinado às premiações das categorias do Concurso de Marcha da ExpoGoiabal!
            </p>
          </div>
        )}

        {/* Modal "Como Funciona" */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 overflow-y-auto max-h-[85vh]">
              {/* Close Button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-all cursor-pointer font-bold text-lg w-10 h-10 flex items-center justify-center"
              >
                ✕
              </button>

              {/* Title */}
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20 shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wider text-white text-left">
                    Regras de Divisão do Pote Premiado
                  </h3>
                  <p className="text-[10px] text-zinc-500 text-left">
                    Entenda como cada centavo do pote acumulado é distribuído entre as categorias e colocações.
                  </p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex flex-col gap-5 text-sm text-left">

                {/* 1. Reservado Campeão */}
                <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-yellow-500 font-black text-xs uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    Reservado Campeão (Montante Potencializado)
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    A categoria de Reservado Campeão recebe uma alocação prioritária de <strong className="text-white">10% de todo o valor lançado no pote</strong> desde o início (com um limite inicial de transição de R$ 2.000,00).
                  </p>
                  <ul className="text-zinc-500 text-[11px] list-disc list-inside flex flex-col gap-1 leading-relaxed pl-1 font-semibold">
                    <li><strong className="text-zinc-300">Sob o limite (Fase 1):</strong> Enquanto a cota não atinge R$ 2.000,00, ela também ganha <strong className="text-zinc-300">15%</strong> de todo o saldo excedente do pote.</li>
                    <li><strong className="text-zinc-300">Acima do limite (Fase 2):</strong> Após atingir R$ 2.000,00, a cota não congela! Ela continua recebendo <strong className="text-zinc-300">10%</strong> do excedente acumulativo subsequente de forma ilimitada.</li>
                  </ul>
                </div>

                {/* 2. Regional 2º e 3º Lugar */}
                <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-yellow-500 font-black text-xs uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Regional (2º e 3º Lugar)
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    As colocações Regionais compartilham o saldo excedente (surplus) gerado após a retirada do Reservado Campeão e a alocação do fundo de conclusão geral.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                    <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Regional 2º Lugar</span>
                      <span className="text-xs font-black text-cyan-400">Premiação Fixa + 20% do Excedente</span>
                    </div>
                    <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Regional 3º Lugar</span>
                      <span className="text-xs font-black text-cyan-400">Premiação Fixa + 10% do Excedente</span>
                    </div>
                  </div>
                </div>

                {/* 3. Regional (4º ao 15º Lugar) */}
                <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-yellow-500 font-black text-xs uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Regional (4º ao 15º Lugar)
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                    A categoria regional (4º ao 15º) conta com duas mecânicas sofisticadas de liberação e meritocracia:
                  </p>
                  <ul className="text-zinc-500 text-[11px] list-disc list-inside flex flex-col gap-1 leading-relaxed pl-1 font-semibold">
                    <li><strong className="text-zinc-300">Desbloqueio Progressivo:</strong> Para cada R$ 200,00 acumulados no fundo de conclusão, uma nova colocação é destravada (do 4º ao 15º). Vagas travadas não recebem prêmio.</li>
                    <li><strong className="text-zinc-300">Divisão Justa (Pesos Decrescentes):</strong> Todo o saldo dessa subcategoria regional é rateado de acordo com a colocação, beneficiando o mérito. O 4º lugar recebe mais do que o 5º, que recebe mais do que o 6º, até o 15º lugar.</li>
                  </ul>
                  <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/50 mt-1 flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Tabela de Pesos Relativos:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-[10px] text-zinc-500 text-center font-bold">
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">4º: <span className="text-white">15</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">5º: <span className="text-white">14</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">6º: <span className="text-white">13</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">7º: <span className="text-white">12</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">8º: <span className="text-white">11</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">9º: <span className="text-white">10</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">10º: <span className="text-white">9</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">11º: <span className="text-white">8</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">12º: <span className="text-white">7</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">13º: <span className="text-white">6</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">14º: <span className="text-white">5</span></div>
                      <div className="bg-zinc-900 p-1.5 rounded border border-zinc-800">15º: <span className="text-white">4</span></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Close Action Button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs py-3.5 rounded-2xl transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.01] cursor-pointer text-center"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        )}

        {/* Explosive Gold Flash Overlay (Pyrotechnics climax) */}
        {showFlash && (
          <div className="fixed inset-0 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 z-[99] pointer-events-none opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-5xl md:text-7xl font-black text-black uppercase tracking-widest select-none animate-ping">🐂 ESTOURO DO POTE! 💥</span>
          </div>
        )}



        {/* 2. Interactive Floating Mascot "Trovão de Ouro" (Bottom Right corner) */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 group">
          {/* Speech bubble */}
          {showSpeechBubble && (
            <div className="bg-zinc-950/95 border border-yellow-500/40 rounded-2xl p-3 shadow-[0_0_20px_rgba(234,179,8,0.15)] text-[10px] sm:text-xs font-extrabold text-yellow-400 text-left max-w-[240px] relative animate-bounce select-none">
              <div className="absolute bottom-4 -right-1.5 w-3 h-3 bg-zinc-950 border-r border-b border-yellow-500/40 rotate-[-45deg]" />
              {speechBubbleText}
            </div>
          )}

          {/* Circular Button */}
          <button
            onClick={triggerMascotSpeak}
            className="w-16 h-16 rounded-full bg-zinc-950 border-2 border-yellow-500/40 hover:border-yellow-500 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer"
            style={{ animation: 'jar-pulse 4s infinite ease-in-out' }}
            title="Falar com o Trovão de Ouro"
          >
            <svg viewBox="0 0 200 200" className="w-12 h-12">
              {/* Miniature simplified mascot drawing */}
              {/* Bull Horns */}
              <path d="M 65,95 C 55,75 48,60 38,60 C 35,60 38,67 47,77 C 54,85 60,92 65,95 Z" fill="url(#bullHorn)" />
              <path d="M 135,95 C 145,75 152,60 162,60 C 165,60 162,67 153,77 C 146,85 140,92 135,95 Z" fill="url(#bullHorn)" />

              {/* Head */}
              <polygon points="65,95 135,95 138,125 118,160 82,160 62,125" fill="#18181b" stroke="#eab308" strokeWidth="2.5" />

              {/* Eyes */}
              <polygon points="76,112 90,115 87,120 77,117" fill="#facc15" />
              <polygon points="124,112 110,115 113,120 123,117" fill="#facc15" />

              {/* Nose Ring */}
              <path d="M 90,148 A 10,10 0 0 0 110,148" fill="none" stroke="#eab308" strokeWidth="2.5" />

              {/* Cowboy Hat */}
              <path d="M 50,88 C 70,85 130,85 150,88 C 160,90 168,93 172,96 C 172,96 156,92 100,92 C 44,92 28,96 28,96 C 32,93 40,90 50,88 Z" fill="url(#bullHat)" />
              <path d="M 68,85 C 68,60 80,54 100,54 C 120,54 132,60 132,85" fill="url(#bullHat)" stroke="#eab308" strokeWidth="0.5" />
            </svg>
          </button>
        </div>

      </main>
    </div>
  );
};
