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

export const PotePremiadoPage: React.FC = () => {
  const [targetValue, setTargetValue] = useState<number>(15450); // Valor alvo em Reais
  const [displayValue, setDisplayValue] = useState<number>(15450); // Valor animado exibido
  const [inputVal, setInputVal] = useState<string>(''); // Input para novo lançamento
  const [isAnimating, setIsAnimating] = useState<boolean>(false); // Controla animações do pote
  const [coins, setCoins] = useState<CoinParticle[]>([]); // Moedas voadoras
  const [showAumentoAlert, setShowAumentoAlert] = useState<boolean>(false); // Banner "O POTE AUMENTOU!"
  const [alertAmount, setAlertAmount] = useState<number>(0); // Quantidade do aumento
  
  const animationRef = useRef<number | null>(null);

  // Dynamic fill height calculation
  // Base filling is around 25%, going up to 92% of the jar height
  const fillPercentage = Math.min(25 + (displayValue / 400), 92);

  // Map the fillPercentage (25 to 92) smoothly to SVG Y coordinates inside the jar (285 near bottom, 90 near top)
  const currentY = 285 - ((fillPercentage - 25) / (92 - 25)) * 195;

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

  // Função para lançar um novo valor ao pote
  const handleLaunchValue = (e: React.FormEvent) => {
    e.preventDefault();
    const addedAmount = parseFloat(inputVal);
    if (isNaN(addedAmount) || addedAmount <= 0) return;

    // Trigger de moedas voadoras - 35 moedas com atrasos prolongados de até 3 segundos
    const newParticles: CoinParticle[] = Array.from({ length: 35 }).map((_, i) => ({
      id: Date.now() + i,
      x: 10 + Math.random() * 80, // Variação horizontal
      y: 70 + Math.random() * 20, // Ponto de partida
      delay: Math.random() * 2.8, // Espalha as moedas ao longo de quase 3 segundos
      scale: 0.5 + Math.random() * 0.6,
    }));

    setCoins(newParticles);
    setAlertAmount(addedAmount);
    setShowAumentoAlert(true);
    setTargetValue(prev => prev + addedAmount);
    setInputVal('');

    // Remove alerta após 5 segundos
    setTimeout(() => {
      setShowAumentoAlert(false);
    }, 5000);

    // Limpa moedas após voarem
    setTimeout(() => {
      setCoins([]);
    }, 5500);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-955 font-sans text-white overflow-hidden relative">
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

      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.06)_0,transparent_60%)] pointer-events-none z-0" />

      <main className="flex-1 pt-28 pb-16 px-4 relative flex flex-col items-center justify-start z-10 w-full max-w-5xl mx-auto gap-8">
        
        {/* Banner "O POTE AUMENTOU!" */}
        {showAumentoAlert && (
          <div className="fixed top-24 z-50 animate-alert w-full max-w-sm px-4">
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 border border-yellow-400 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-between gap-3 text-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-yellow-500 animate-bounce">
                  <Trophy size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-wider">O Pote Aumentou! 🚀</h4>
                  <p className="text-[11px] font-bold opacity-80">Foi adicionado + {formatCurrency(alertAmount)}</p>
                </div>
              </div>
              <span className="font-black text-lg bg-black/10 px-3 py-1 rounded-xl">💸</span>
            </div>
          </div>
        )}

        {/* Header Title Section */}
        <div className="flex flex-col items-center text-center gap-3 max-w-2xl">
          <span className="text-yellow-500 text-xs font-black uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center gap-2 animate-pulse">
            <Sparkles size={14} className="animate-spin duration-3000 text-yellow-500" />
            Grande Atração ExpoGoiabal
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 uppercase tracking-widest drop-shadow-[0_0_25px_rgba(245,158,11,0.35)]">
            Pote Premiado 💰
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed max-w-lg">
            Acompanhe o valor acumulado em tempo real! Toda vez que uma nova premiação for lançada, o pote cresce na tela com chuva de moedas.
          </p>
        </div>

        {/* Dynamic Money Pot Container */}
        <div className="relative flex flex-col items-center justify-center mt-4">
          
          {/* Ambient Radial Golden Glow */}
          <div className={`absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-yellow-500/10 blur-[60px] md:blur-[80px] transition-all duration-1000 pointer-events-none -z-10 ${
            isAnimating ? 'scale-125 bg-yellow-500/25' : 'scale-100'
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
          <div className={`relative transition-all duration-500 ${
            isAnimating ? 'animate-shake-infinite' : 'animate-jar-glow'
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

        {/* Counter Block Section */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-black">Valor Acumulado</span>
          <div className="flex items-center gap-2">
            <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-md tracking-tight font-mono select-none">
              {formatCurrency(displayValue)}
            </span>
          </div>
          <span className="text-[10px] md:text-xs text-yellow-500/80 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={12} className="animate-pulse" />
            Pote Atualizado em Tempo Real
          </span>
        </div>

        {/* Admin launch panel simulation (Destaque & Interativo) */}
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

          <form onSubmit={handleLaunchValue} className="flex gap-2">
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
              className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs px-6 py-3.5 rounded-2xl transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={16} />
              Lançar
            </button>
          </form>
        </div>

        {/* Additional Help Info Card */}
        <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/10 px-6 py-4 rounded-2xl max-w-xl text-center">
          <HelpCircle size={18} className="text-yellow-500 shrink-0" />
          <p className="text-zinc-500 font-medium text-[11px] leading-relaxed">
            O Pote Premiado é atualizado conforme novos patrocinadores, repasses ou arrecadações são computados. O valor final acumulado será destinado às premiações das categorias de Rodeio Profissional, Prova dos Três Tambores e Rodeio Mirim!
          </p>
        </div>

      </main>
    </div>
  );
};
