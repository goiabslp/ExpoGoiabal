import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { Check, Vote, ChevronRight, Loader2, Clock } from 'lucide-react';
import { supabase } from '../../services/supabase';

const VOTING_START = new Date('2026-05-25T18:00:00-03:00');
const VOTING_END = new Date('2026-05-26T18:00:00-03:00');
const RESULTS_START = new Date('2026-05-26T18:30:00-03:00');

type Candidate = {
  id: string | number;
  name: string;
  image: string;
  votes: number;
};

export const EmbaixadoraPage: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [embaixadoras, setEmbaixadoras] = useState<Candidate[]>([]);
  const [madrinhas, setMadrinhas] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEmbaixadora, setSelectedEmbaixadora] = useState<string | number | null>(null);
  const [selectedMadrinha, setSelectedMadrinha] = useState<string | number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
 
  // Remaining time until VOTING_END state
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const diff = VOTING_END.getTime() - Date.now();
      setCountdownSeconds(Math.max(0, Math.floor(diff / 1000)));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isCountdownUrgent = countdownSeconds < 60;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    const voted = localStorage.getItem('@ExpoGoiabal:voted');
    if (voted) {
      setHasVoted(true);
    }
    fetchCandidates();

    // Inscreve no Supabase Realtime para receber inserções de votos
    const channel = supabase
      .channel('votos_corte_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votos_corte' },
        () => {
          fetchCandidates(false);
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const isBeforeStart = now < VOTING_START;
  const isAfterEnd = now > VOTING_END;
  const isVotingOpen = now >= VOTING_START && now <= VOTING_END;
  const isResultsPending = now > VOTING_END && now < RESULTS_START;
  const isResultsRevealed = now >= RESULTS_START;

  const getRemainingTime = () => {
    const diff = VOTING_END.getTime() - now.getTime();
    if (diff <= 0) return '00h 00m 00s';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const fetchCandidates = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const { data, error } = await supabase
        .from('inscricoes_expogoiabal')
        .select('*, votos_corte(count)')
        .in('modalidade', ['Embaixadora', 'Madrinha'])
        .order('nome', { ascending: true });

      if (error) throw error;

      const embs: Candidate[] = [];
      const mads: Candidate[] = [];

      (data || []).forEach((c) => {
        const voteCount = (c.votos_corte as any)?.[0]?.count || 0;
        
        const candidateData = {
          id: c.id,
          name: c.nome,
          votes: voteCount
        };

        if (c.modalidade === 'Embaixadora') {
          embs.push({ ...candidateData, image: `/candidates/embaixadora_${(embs.length % 5) + 1}.png` });
        } else if (c.modalidade === 'Madrinha') {
          mads.push({ ...candidateData, image: `/candidates/madrinha_${(mads.length % 3) + 1}.png` });
        }
      });

      setEmbaixadoras(embs);
      setMadrinhas(mads);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedEmbaixadora && selectedMadrinha && !hasVoted && isVotingOpen) {
      try {
        // Optimistic update
        setEmbaixadoras(prev => prev.map(c => c.id === selectedEmbaixadora ? { ...c, votes: c.votes + 1 } : c));
        setMadrinhas(prev => prev.map(c => c.id === selectedMadrinha ? { ...c, votes: c.votes + 1 } : c));
        setHasVoted(true);
        localStorage.setItem('@ExpoGoiabal:voted', 'true');

        // Insert into Supabase
        await supabase.from('votos_corte').insert([
          { candidata_id: selectedEmbaixadora },
          { candidata_id: selectedMadrinha }
        ]);
      } catch (err) {
        console.error('Erro ao registrar voto:', err);
      }
    }
  };

  const totalEmbaixadorasVotes = embaixadoras.reduce((acc, curr) => acc + curr.votes, 0);
  const totalMadrinhasVotes = madrinhas.reduce((acc, curr) => acc + curr.votes, 0);



  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-zinc-400 font-medium uppercase tracking-widest">Carregando candidatas...</p>
        </div>
      </div>
    );
  }

  if (isResultsPending) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.3)] animate-bounce">
            <Check className="w-12 h-12 text-zinc-950" strokeWidth={3} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Votações Encerradas!
          </h1>
          <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl leading-relaxed">
            A votação foi um sucesso absoluto! Obrigado a todos que participaram.<br/><br/>
            Estamos apurando os resultados finais e em breve <strong className="text-emerald-500">(às 18:30)</strong> revelaremos quem são as grandes campeãs.
          </p>
        </div>
      </div>
    );
  }

  if (isResultsRevealed) {
    const winningEmbaixadora = [...embaixadoras].sort((a, b) => b.votes - a.votes)[0];
    const winningMadrinha = [...madrinhas].sort((a, b) => b.votes - a.votes)[0];

    return (
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-yellow-500/30">
        <Header />
        
        <main className="flex-1 pt-24 px-4 md:px-8 relative pb-32 max-w-7xl mx-auto w-full">
          {/* Confetti / Glow Effects */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-yellow-500/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] rounded-full bg-yellow-500/20 blur-[120px] animate-pulse" />
          </div>

          <div className="relative z-10 text-center space-y-16">
            <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                Grandes Campeãs
              </h1>
              <p className="text-zinc-400 text-xl md:text-2xl max-w-2xl mx-auto">
                Conheça as vencedoras oficiais da ExpoGoiabal 2026.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
              {/* Embaixadora Winner */}
              {winningEmbaixadora && (
                <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-in zoom-in duration-1000 delay-300">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-yellow-500">Embaixadora</h2>
                    <p className="text-zinc-500 font-medium">{winningEmbaixadora.votes} Votos</p>
                  </div>
                  <div className="relative group rounded-[2.5rem] overflow-hidden ring-8 ring-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-transform duration-700 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                    <img src={winningEmbaixadora.image} alt={winningEmbaixadora.name} className="w-full aspect-[4/5] object-cover" />
                    <div className="absolute bottom-0 left-0 w-full p-8 z-20 text-center flex items-end justify-center">
                      <p className="font-black text-3xl md:text-4xl text-white drop-shadow-xl">{winningEmbaixadora.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Madrinha Winner */}
              {winningMadrinha && (
                <div className="w-full max-w-sm flex flex-col items-center gap-6 animate-in zoom-in duration-1000 delay-500">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-red-500">Madrinha</h2>
                    <p className="text-zinc-500 font-medium">{winningMadrinha.votes} Votos</p>
                  </div>
                  <div className="relative group rounded-[2.5rem] overflow-hidden ring-8 ring-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.4)] transition-transform duration-700 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                    <img src={winningMadrinha.image} alt={winningMadrinha.name} className="w-full aspect-[4/5] object-cover" />
                    <div className="absolute bottom-0 left-0 w-full p-8 z-20 text-center flex items-end justify-center">
                      <p className="font-black text-3xl md:text-4xl text-white drop-shadow-xl">{winningMadrinha.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-12 animate-in fade-in duration-1000 delay-1000">
              <p className="text-zinc-500 text-lg">
                A organização agradece a participação de todos os votantes e candidatas!
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isRetaFinal = now >= new Date('2026-05-26T16:15:00-03:00');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans selection:bg-yellow-500/30">
      <style>{`
        @keyframes progress-shimmer {
          0% { background-position: 0 0; }
          100% { background-position: 1rem 0; }
        }
        .shimmer-bar {
          background-size: 1rem 1rem !important;
          animation: progress-shimmer 1s linear infinite !important;
        }
      `}</style>
      <Header />
      
      <main className="flex-1 pt-24 px-4 md:px-8 relative pb-32 max-w-7xl mx-auto w-full">
        {/* Background Effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-600/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[120px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Voting Area */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Header Section */}
            <div className="space-y-4 text-center lg:text-left animate-in slide-in-from-bottom-8 duration-700">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 drop-shadow-sm">
                Votação Oficial
              </h1>
              {isAfterEnd ? (
                 <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3">
                   <Vote className="w-6 h-6 shrink-0" />
                   <div className="text-left">
                     <p className="font-bold uppercase tracking-widest">Votações Encerradas</p>
                     <p className="text-sm text-red-400/80">Obrigado a todos que participaram. Os resultados já estão fechados.</p>
                   </div>
                 </div>
              ) : isBeforeStart ? (
                 <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 px-6 py-4 rounded-xl flex items-center gap-3">
                   <Vote className="w-6 h-6 shrink-0" />
                   <div className="text-left">
                     <p className="font-bold uppercase tracking-widest">A Votação Ainda Não Começou</p>
                     <p className="text-sm text-yellow-500/80">Prepare-se! As votações iniciam oficialmente dia 25/05 às 18:00.</p>
                   </div>
                 </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-zinc-400 text-lg max-w-2xl">
                    Escolha a sua candidata favorita para <span className="text-yellow-500 font-semibold">Embaixadora</span> e <span className="text-yellow-500 font-semibold">Madrinha</span> da ExpoGoiabal 2026. Você só pode votar uma vez.
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-3 rounded-xl shadow-lg">
                      <Clock className="w-5 h-5 shrink-0 animate-pulse" />
                      <span className="font-bold uppercase tracking-wider text-sm">Tempo restante para votar: {getRemainingTime()}</span>
                    </div>
                    
                    <div className="inline-flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-5 py-3 rounded-xl shadow-lg animate-in fade-in duration-500">
                      <Vote className="w-5 h-5 shrink-0 animate-bounce" />
                      <span className="font-bold uppercase tracking-wider text-sm">
                        Total de Votos: <span className="text-white bg-yellow-600/30 px-2 py-0.5 rounded-md font-black tabular-nums">{totalEmbaixadorasVotes}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Embaixadoras Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="font-bold text-lg">1</span>
                </div>
                <h2 className="text-2xl font-bold tracking-wide">Escolha sua Embaixadora</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                {embaixadoras.map((candidate) => {
                  const isSelected = selectedEmbaixadora === candidate.id;
                  return (
                    <button
                      key={`emb-${candidate.id}`}
                      disabled={hasVoted || isAfterEnd || isBeforeStart}
                      onClick={() => setSelectedEmbaixadora(prev => prev === candidate.id ? null : candidate.id)}
                      className={`relative group rounded-2xl overflow-hidden transition-all duration-500 text-left ${
                        (hasVoted || isBeforeStart || isAfterEnd) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:-translate-y-2'
                      } ${
                        isSelected ? 'ring-4 ring-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]' : 'ring-1 ring-white/10 hover:ring-white/30'
                      }`}
                    >
                      <div className="aspect-[4/5] relative">
                        <img 
                          src={candidate.image} 
                          alt={candidate.name} 
                          className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'scale-105 brightness-125' : 'group-hover:scale-110 group-hover:brightness-125'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/30 transition-colors duration-700" />
                        
                        {/* Glare Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                        {isSelected && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                            <Check className="w-5 h-5 text-black" strokeWidth={3} />
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 w-full p-4">
                          <p className="font-bold text-lg md:text-xl text-white drop-shadow-md">{candidate.name}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Madrinhas Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <span className="font-bold text-lg">2</span>
                </div>
                <h2 className="text-2xl font-bold tracking-wide">Escolha sua Madrinha</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                {madrinhas.map((candidate) => {
                  const isSelected = selectedMadrinha === candidate.id;
                  return (
                    <button
                      key={`mad-${candidate.id}`}
                      disabled={hasVoted || isAfterEnd || isBeforeStart}
                      onClick={() => setSelectedMadrinha(prev => prev === candidate.id ? null : candidate.id)}
                      className={`relative group rounded-2xl overflow-hidden transition-all duration-500 text-left ${
                        (hasVoted || isBeforeStart || isAfterEnd) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:-translate-y-2'
                      } ${
                        isSelected ? 'ring-4 ring-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'ring-1 ring-white/10 hover:ring-white/30'
                      }`}
                    >
                      <div className="aspect-[4/5] relative">
                        <img 
                          src={candidate.image} 
                          alt={candidate.name} 
                          className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'scale-105 brightness-125' : 'group-hover:scale-110 group-hover:brightness-125'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/30 transition-colors duration-700" />
                        
                        {/* Glare Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none z-10" />

                        {isSelected && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 left-0 w-full p-4">
                          <p className="font-bold text-lg md:text-xl text-white drop-shadow-md">{candidate.name}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
           {/* Sidebar - Partials */}
          <div className="lg:col-span-4 mt-8 lg:mt-0 lg:sticky lg:top-28">
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <Vote className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white">Parcial da Votação</h3>
                </div>
                {isRetaFinal && (
                  <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                    ⚡ RETA FINAL ⚡
                  </span>
                )}
              </div>

              {/* Embaixadora Partial */}
              <div className="space-y-6 mb-10">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center justify-between">
                  <span>Embaixadoras</span>
                  <span className={`font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all duration-500 border ${
                    isCountdownUrgent 
                      ? 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'text-yellow-500 bg-yellow-500/5 border-yellow-500/10'
                  }`}>
                    <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: isCountdownUrgent ? '2s' : '10s' }} />
                    {formatCountdown(countdownSeconds)}
                  </span>
                </h4>
                <div className="space-y-4">
                  {[...embaixadoras].sort((a, b) => b.votes - a.votes).map((candidate, idx) => {
                    const percent = totalEmbaixadorasVotes === 0 ? '0.00' : ((candidate.votes / totalEmbaixadorasVotes) * 100).toFixed(2);
                    const isFirst = idx === 0;
                    const isSecond = idx === 1;

                    return (
                      <div 
                        key={candidate.id} 
                        className={`p-3 rounded-2xl transition-all duration-500 flex flex-col gap-3 relative ${
                          isFirst 
                            ? 'bg-yellow-500/5 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
                            : isSecond 
                              ? 'bg-zinc-100/5 border border-zinc-100/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]' 
                              : 'bg-transparent border border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center px-1">
                          <span className={`font-bold tracking-wide transition-all ${
                            isFirst 
                              ? 'text-yellow-400 text-base' 
                              : isSecond 
                                ? 'text-zinc-200 text-sm' 
                                : 'text-zinc-400 text-xs font-semibold'
                          }`}>
                            {candidate.name}
                          </span>
                          <span className={`font-black tracking-wider ${
                            isFirst 
                              ? 'text-yellow-400 text-base drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] animate-pulse' 
                              : isSecond 
                                ? 'text-zinc-200 text-sm' 
                                : 'text-zinc-500 text-xs'
                          }`}>
                            {percent}%
                          </span>
                        </div>

                        {/* Unified Bar Container with Photo Embedded at the Start */}
                        <div className="relative flex items-center mt-1 h-12">
                          {/* Progress Bar Track */}
                          <div className={`absolute ${
                            isFirst ? 'left-6' : isSecond ? 'left-5' : 'left-4'
                          } right-0 bg-zinc-950 rounded-r-full overflow-hidden transition-all duration-300 ${
                            isFirst 
                              ? 'h-8 ring-1 ring-yellow-500/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]' 
                              : isSecond 
                                ? 'h-7 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]' 
                                : 'h-6'
                          }`}>
                            <div 
                              className={`h-full rounded-r-full transition-all duration-1000 ease-out relative ${
                                isFirst 
                                  ? 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 shimmer-bar' 
                                  : isSecond 
                                    ? 'bg-gradient-to-r from-zinc-500 to-zinc-300' 
                                    : 'bg-gradient-to-r from-zinc-800 to-zinc-600'
                              }`}
                              style={{ 
                                width: `${percent}%`,
                                backgroundImage: isFirst ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' : undefined
                              }}
                            >
                              {/* Spark glow effect at the leading edge of progress */}
                              {parseFloat(percent) > 0 && (
                                <div className={`absolute top-0 bottom-0 right-0 w-1 bg-white shadow-[0_0_12px_#fff] ${
                                  isFirst ? 'shadow-[0_0_15px_#eab308]' : isSecond ? 'shadow-[0_0_10px_#cbd5e1]' : ''
                                }`} />
                              )}
                            </div>
                          </div>

                          {/* Avatar Overlapping at the Start (Left) of the Bar */}
                          <div className="absolute left-0 z-10 shrink-0 select-none">
                            <div className="relative">
                              <img 
                                src={candidate.image} 
                                alt={candidate.name} 
                                className={`rounded-full object-cover transition-all duration-500 hover:scale-110 ${
                                  isFirst 
                                    ? 'w-12 h-12 ring-2 ring-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
                                    : isSecond 
                                      ? 'w-10 h-10 ring-2 ring-zinc-400 shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                                      : 'w-8 h-8 ring-1 ring-zinc-700'
                                }`}
                              />
                              {isFirst && (
                                <span className="absolute -top-1 -left-1 bg-yellow-500 text-black text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md border border-yellow-300 animate-pulse">
                                  1º
                                </span>
                              )}
                              {isSecond && (
                                <span className="absolute -top-1 -left-1 bg-zinc-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-zinc-300">
                                  2º
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Madrinha Partial */}
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Madrinhas</h4>
                <div className="space-y-4">
                  {[...madrinhas].sort((a, b) => b.votes - a.votes).map((candidate, idx) => {
                    const percent = totalMadrinhasVotes === 0 ? '0.00' : ((candidate.votes / totalMadrinhasVotes) * 100).toFixed(2);
                    const isFirst = idx === 0;
                    const isSecond = idx === 1;

                    return (
                      <div 
                        key={candidate.id} 
                        className={`p-3 rounded-2xl transition-all duration-500 flex flex-col gap-3 relative ${
                          isFirst 
                            ? 'bg-red-500/5 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                            : isSecond 
                              ? 'bg-zinc-100/5 border border-zinc-100/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]' 
                              : 'bg-transparent border border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center px-1">
                          <span className={`font-bold tracking-wide transition-all ${
                            isFirst 
                              ? 'text-red-400 text-base' 
                              : isSecond 
                                ? 'text-zinc-200 text-sm' 
                                : 'text-zinc-400 text-xs font-semibold'
                          }`}>
                            {candidate.name}
                          </span>
                          <span className={`font-black tracking-wider ${
                            isFirst 
                              ? 'text-red-400 text-base drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse' 
                              : isSecond 
                                ? 'text-zinc-200 text-sm' 
                                : 'text-zinc-500 text-xs'
                          }`}>
                            {percent}%
                          </span>
                        </div>

                        {/* Unified Bar Container with Photo Embedded at the Start */}
                        <div className="relative flex items-center mt-1 h-12">
                          {/* Progress Bar Track */}
                          <div className={`absolute ${
                            isFirst ? 'left-6' : isSecond ? 'left-5' : 'left-4'
                          } right-0 bg-zinc-950 rounded-r-full overflow-hidden transition-all duration-300 ${
                            isFirst 
                              ? 'h-8 ring-1 ring-red-500/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]' 
                              : isSecond 
                                ? 'h-7 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]' 
                                : 'h-6'
                          }`}>
                            <div 
                              className={`h-full rounded-r-full transition-all duration-1000 ease-out relative ${
                                isFirst 
                                  ? 'bg-gradient-to-r from-red-600 via-red-400 to-red-500 shimmer-bar' 
                                  : isSecond 
                                    ? 'bg-gradient-to-r from-zinc-500 to-zinc-300' 
                                    : 'bg-gradient-to-r from-zinc-800 to-zinc-600'
                              }`}
                              style={{ 
                                width: `${percent}%`,
                                backgroundImage: isFirst ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' : undefined
                              }}
                            >
                              {/* Spark glow effect at the leading edge of progress */}
                              {parseFloat(percent) > 0 && (
                                <div className={`absolute top-0 bottom-0 right-0 w-1 bg-white shadow-[0_0_12px_#fff] ${
                                  isFirst ? 'shadow-[0_0_15px_#ef4444]' : isSecond ? 'shadow-[0_0_10px_#cbd5e1]' : ''
                                }`} />
                              )}
                            </div>
                          </div>

                          {/* Avatar Overlapping at the Start (Left) of the Bar */}
                          <div className="absolute left-0 z-10 shrink-0 select-none">
                            <div className="relative">
                              <img 
                                src={candidate.image} 
                                alt={candidate.name} 
                                className={`rounded-full object-cover transition-all duration-500 hover:scale-110 ${
                                  isFirst 
                                    ? 'w-12 h-12 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                                    : isSecond 
                                      ? 'w-10 h-10 ring-2 ring-zinc-400 shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                                      : 'w-8 h-8 ring-1 ring-zinc-700'
                                }`}
                              />
                              {isFirst && (
                                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md border border-red-300 animate-pulse">
                                  1º
                                </span>
                              )}
                              {isSecond && (
                                <span className="absolute -top-1 -left-1 bg-zinc-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-zinc-300">
                                  2º
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Voting */}
      {!hasVoted && !isAfterEnd && (
        <div className={`fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-50 flex justify-center transition-transform duration-500 ${
          selectedEmbaixadora && selectedMadrinha ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <button 
            onClick={handleVote}
            className="flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-10 py-4 rounded-full font-black text-xl uppercase tracking-wider shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:scale-105 transition-all duration-300"
          >
            Confirmar Voto
            <ChevronRight className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>
      )}

      {hasVoted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-full flex items-center gap-2 backdrop-blur-md shadow-lg font-medium">
            <Check className="w-5 h-5" />
            Voto computado com sucesso!
          </div>
        </div>
      )}

    </div>
  );
};

