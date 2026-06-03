import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Trophy, Calendar, MapPin, Award, AlertTriangle, Stethoscope, Mic, User, Ticket } from 'lucide-react';

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

export const MarchaPage: React.FC = () => {
  const [showMotoModal, setShowMotoModal] = useState(false);
  const [poteValue, setPoteValue] = useState<number>(() => {
    const saved = localStorage.getItem('pote_premiado_value');
    return saved ? parseFloat(saved) : 0;
  });

  // Listen to storage changes to update values in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('pote_premiado_value');
      if (saved) {
        setPoteValue(parseFloat(saved));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Interval check for updates within same session/tab
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const dist = calculateDistribution(poteValue);

  // Formata o valor monetário
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const categorias = [
    "PIQUIRA (M/F) ALTURA MÁXIMA 1,30",
    "MARCHA PICADA M E F",
    "REGIONAL",
    "POTRO",
    "POTRA",
    "CAVALO COMUM",
    "ÉGUA COMUM",
    "CAVALO PAMPA / ÉGUA PAMPA",
    "CASTRADO",
    "ÉGUA REGISTRADA (MM)",
    "CAVALO REGISTRADO (MM)",
    "MUARES M & F",
    "MIRIM (ATÉ 15 ANOS)",
    "AMAZONAS"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 font-sans text-white">
      <Header />
      <main className="flex-1 pt-28 pb-20 px-4 relative flex justify-center">
        {/* Backgrounds */}
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        {/* Content Wrapper */}
        <div className="z-10 w-full max-w-6xl animate-in slide-in-from-bottom-8 fade-in duration-1000 flex flex-col items-center gap-12">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-6">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
              37º Concurso de Marcha
            </h1>
            
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-zinc-300 font-semibold uppercase tracking-widest text-sm md:text-base">
              <div className="flex items-center gap-2 bg-zinc-900/80 px-6 py-3 rounded-full border border-zinc-800 shadow-lg">
                <MapPin className="text-yellow-500" size={20} />
                São José do Goiabal - MG
              </div>
              <div className="flex items-center gap-2 bg-zinc-900/80 px-6 py-3 rounded-full border border-zinc-800 shadow-lg">
                <Calendar className="text-yellow-500" size={20} />
                07 de Junho • 10:30 AM
              </div>
            </div>

            <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-3 rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.15)] mt-2">
              <Ticket className="text-yellow-500" size={20} />
              <span className="text-zinc-300 font-semibold uppercase tracking-widest text-sm">
                Código IMA (GTA):
              </span>
              <span className="font-black text-yellow-500 tracking-widest text-sm md:text-base">
                96779
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-4">
            
            {/* Categorias */}
            <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
              <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                  <Award size={28} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-widest text-white">Categorias</h2>
              </div>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                {categorias.map((cat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold text-zinc-300 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 hover:border-yellow-500/30 hover:bg-zinc-900 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                    {cat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prêmios e Informações */}
            <div className="flex flex-col gap-8">
              
              {/* Prêmios */}
              <div className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                    <Trophy size={28} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-widest text-white">Prêmios</h2>
                </div>

                <div className="space-y-8">
                  {/* Geral */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                      <span className="font-bold text-zinc-300 text-lg">1º LUGAR</span>
                      <span className="font-black text-yellow-500 text-xl">R$ 500,00</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                      <span className="font-bold text-zinc-300 text-lg">2º LUGAR</span>
                      <span className="font-black text-yellow-500 text-xl">R$ 400,00</span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                      <span className="font-bold text-zinc-300 text-lg">3º LUGAR</span>
                      <span className="font-black text-yellow-500 text-xl">R$ 300,00</span>
                    </div>
                    
                    {dist.maxUnlockedIndex >= 0 && (
                      <div className="mt-2 pt-3 border-t border-zinc-800/60 flex flex-col gap-2">
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">Premiações do Pote Premiado (Desbloqueadas)</span>
                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                          {dist.placementsPrizes.map((prize, idx) => {
                            if (prize === 0) return null;
                            const placeNum = idx + 4;
                            return (
                              <div key={placeNum} className="flex justify-between items-center bg-zinc-950/80 px-4 py-2.5 rounded-xl border border-yellow-500/10 shadow-sm animate-in fade-in duration-300">
                                <span className="font-bold text-zinc-300 text-xs">{placeNum}º LUGAR GERAL</span>
                                <span className="font-black text-yellow-500 text-sm">{formatCurrency(prize)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Especiais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-5 rounded-2xl border border-yellow-500/30 text-center flex flex-col justify-center gap-2 cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                      onMouseEnter={() => setShowMotoModal(true)}
                      onMouseLeave={() => setShowMotoModal(false)}
                    >
                      <span className="text-xs font-black uppercase tracking-widest text-yellow-500">Campeão dos Campeões</span>
                      <span className="text-2xl font-black text-white">01 MOTO ZERO KM</span>
                    </div>
                    <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-2xl border border-zinc-700 text-center flex flex-col justify-center gap-2 relative overflow-hidden">
                      {dist.reservadoCampeaoShare > 0 && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-yellow-500" />
                      )}
                      <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Reservado Campeão</span>
                      <span className="text-2xl font-black text-white">{formatCurrency(dist.reservadoCampeaoTotal)}</span>
                      {dist.reservadoCampeaoShare > 0 && (
                        <span className="text-[10px] text-yellow-500 font-bold tracking-wider">+ {formatCurrency(dist.reservadoCampeaoShare)} do Pote</span>
                      )}
                    </div>
                  </div>

                  {/* Regional */}
                  <div className="bg-zinc-950/80 rounded-2xl p-6 border border-zinc-800">
                    <h3 className="text-center font-black uppercase tracking-widest text-yellow-500 mb-4 border-b border-zinc-800 pb-2">Regional</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-zinc-400">1º LUGAR</span>
                        <span className="font-bold text-white">01 POTRO</span>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-800/40">
                        <span className="font-bold text-zinc-400">2º LUGAR</span>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-white">{formatCurrency(dist.regional2Total)}</span>
                          {dist.regional2Share > 0 && (
                            <span className="text-[9px] text-yellow-500 font-bold tracking-wide">+ {formatCurrency(dist.regional2Share)} do Pote</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-800/40">
                        <span className="font-bold text-zinc-400">3º LUGAR</span>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-white">{formatCurrency(dist.regional3Total)}</span>
                          {dist.regional3Share > 0 && (
                            <span className="text-[9px] text-yellow-500 font-bold tracking-wide">+ {formatCurrency(dist.regional3Share)} do Pote</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipe Técnica */}
          <div className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row gap-6 justify-between items-center mt-4">
            <div className="flex items-center gap-4 text-sm font-bold text-zinc-300 uppercase tracking-wider">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 shrink-0">
                <Stethoscope size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-blue-400">Médico Veterinário</span>
                Manoel Cotta Aleixo <br/><span className="text-zinc-500 text-xs">CRMV - MG 11561</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm font-bold text-zinc-300 uppercase tracking-wider">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 shrink-0">
                <Mic size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-400">Locutor</span>
                Sidney Ribeiro
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm font-bold text-zinc-300 uppercase tracking-wider">
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 shrink-0">
                <User size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-purple-400">Juiz</span>
                Wilian da Corte
              </div>
            </div>
          </div>

          {/* Aviso Importante */}
          <div className="w-full bg-red-950/90 backdrop-blur-xl border border-red-500/50 rounded-2xl p-6 flex items-start sm:items-center gap-4 mt-2 mb-10 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative z-20">
            <AlertTriangle className="text-red-500 shrink-0" size={32} />
            <p className="text-white font-bold uppercase tracking-widest text-sm md:text-base leading-relaxed">
              Será exigido exame de AIE, atestado sanitário da propriedade e GTA impressos e originais.
            </p>
          </div>

        </div>

        {/* Modal da Moto (Hover) */}
        {showMotoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {/* Backdrop overlay para escurecer o fundo, mas sem pointer-events para não bloquear o mouse leave */}
            <div className="absolute inset-0 bg-black/70 transition-opacity duration-300"></div>
            
            <div className="relative animate-in zoom-in-95 duration-300 drop-shadow-[0_0_50px_rgba(255,215,0,0.5)]">
              <img 
                src="/moto.png" 
                alt="Moto Zero KM" 
                className="max-w-[70vw] md:max-w-sm lg:max-w-md h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
