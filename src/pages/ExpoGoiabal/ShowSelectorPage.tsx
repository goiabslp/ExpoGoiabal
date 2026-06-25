import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { supabase } from '../../services/supabase';
import { Music, Sparkles, ChevronRight, Trophy, Flame } from 'lucide-react';

interface Cantor {
  slug: string;
  nome: string;
  subtitulo: string;
  chave_pix: string;
  qr_code_url: string;
  tema_cor_primaria: string;
  tema_cor_secundaria: string;
}

// Fallback estático caso a tabela esteja vazia ou em migração
const fallbackCantores: Cantor[] = [
  {
    slug: 'NilsonGarcia',
    nome: 'Nilson Garcia',
    subtitulo: 'O Show da Copa na ExpoGoiabal',
    chave_pix: '31 9 8231-1929',
    qr_code_url: '/QR.png',
    tema_cor_primaria: 'yellow',
    tema_cor_secundaria: 'emerald'
  }
];

export const ShowSelectorPage: React.FC = () => {
  const [cantores, setCantores] = useState<Cantor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCantores = async () => {
      try {
        const { data, error } = await supabase
          .from('cantores')
          .select('*')
          .order('criado_em', { ascending: true });

        if (!error && data && data.length > 0) {
          setCantores(data);
        } else {
          // Se não houver dados, usa o fallback para garantir funcionamento
          setCantores(fallbackCantores);
        }
      } catch (err) {
        console.error('Erro ao buscar cantores do Supabase:', err);
        setCantores(fallbackCantores);
      } finally {
        setLoading(false);
      }
    };

    fetchCantores();
  }, []);

  const handleSelectCantor = (slug: string) => {
    navigate(`/ExpoGoiabal/show/${slug}`);
  };

  // Retorna classes do Tailwind correspondentes ao tema de cor configurado
  const getThemeColors = (primary: string, secondary: string) => {
    const primaryGlowMap: Record<string, string> = {
      yellow: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.25)] border-yellow-500/30 group-hover:border-yellow-400',
      emerald: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] border-emerald-500/30 group-hover:border-emerald-400',
      blue: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] border-blue-500/30 group-hover:border-blue-400',
      red: 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] border-red-500/30 group-hover:border-red-400',
      violet: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] border-violet-500/30 group-hover:border-violet-400'
    };

    const gradientMap: Record<string, string> = {
      'yellow-emerald': 'from-yellow-450 via-amber-250 to-emerald-450',
      'emerald-blue': 'from-emerald-450 via-teal-250 to-blue-450',
      'blue-violet': 'from-blue-450 via-indigo-250 to-violet-450',
      'red-yellow': 'from-red-450 via-orange-250 to-yellow-450',
      'violet-red': 'from-violet-450 via-fuchsia-250 to-red-450'
    };

    const key = `${primary}-${secondary}`;
    const borderGlow = primaryGlowMap[primary] || primaryGlowMap['yellow'];
    const gradient = gradientMap[key] || gradientMap['yellow-emerald'] || 'from-yellow-400 to-emerald-500';

    return { borderGlow, gradient };
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 font-sans text-white flex flex-col relative overflow-x-hidden">
      <Header />

      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 z-10 relative mt-16 max-w-5xl mx-auto w-full">
        
        {/* Título de Boas Vindas */}
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.1)] flex items-center gap-1.5">
              <Trophy size={12} className="text-emerald-400 animate-pulse" />
              ExpoGoiabal 2026
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            Painel do Cantor
          </h1>
          
          <p className="text-zinc-400 text-sm md:text-base max-w-lg font-medium mt-2">
            Selecione uma atração musical abaixo para abrir o telão de doações e configurar a campanha em tempo real.
          </p>
        </div>

        {/* Grade de Cantores */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Carregando atrações...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {cantores.map((cantor) => {
              const theme = getThemeColors(cantor.tema_cor_primaria, cantor.tema_cor_secundaria);
              return (
                <div
                  key={cantor.slug}
                  id={`btn-select-cantor-${cantor.slug}`}
                  onClick={() => handleSelectCantor(cantor.slug)}
                  className={`group relative bg-zinc-900/40 backdrop-blur-xl border rounded-[32px] p-8 cursor-pointer overflow-hidden transition-all duration-550 flex flex-col justify-between min-h-[220px] ${theme.borderGlow}`}
                >
                  {/* Gradiente Radial Glow de Fundo no Card */}
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-zinc-850/80 to-transparent rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                  
                  {/* Conteúdo */}
                  <div className="relative z-10 flex flex-col gap-4">
                    {/* Badge do Cantor com Ícone de Música */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400 group-hover:text-yellow-400 group-hover:border-yellow-400/50 group-hover:bg-yellow-400/5 transition-all duration-300">
                        <Music size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                        <Flame size={12} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        Show Ao Vivo
                      </span>
                    </div>

                    {/* Nome do Cantor e Subtítulo */}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 group-hover:from-white group-hover:to-zinc-100 transition-colors">
                        {cantor.nome}
                      </h2>
                      <p className="text-xs text-zinc-400 font-bold tracking-wider mt-1 uppercase">
                        {cantor.subtitulo}
                      </p>
                    </div>
                  </div>

                  {/* Rodapé do Card com Ação */}
                  <div className="relative z-10 flex items-center justify-between mt-8 pt-4 border-t border-zinc-800/60 group-hover:border-zinc-800 transition-colors">
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 font-black uppercase tracking-widest transition-colors">
                      Chave Pix: {cantor.chave_pix}
                    </span>
                    
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-all duration-300">
                      Abrir Telão
                      <ChevronRight size={16} />
                    </span>
                  </div>

                  {/* Efeito Glow Luminoso Inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent group-hover:via-emerald-400 transition-all duration-500" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="shrink-0 p-6 flex items-center justify-between bg-zinc-950 border-t border-zinc-900 text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-widest z-10">
        <span className="flex items-center gap-1">
          <Sparkles size={10} className="text-emerald-500" />
          Prefeitura de São José do Goiabal
        </span>
        <a href="/ExpoGoiabal/Inicio" className="hover:text-yellow-400 transition-colors">
          Voltar ao Início
        </a>
      </footer>
    </div>
  );
};
