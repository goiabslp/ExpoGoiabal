import React from 'react';
import { Header } from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const EmbaixadoraInscricaoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-4 relative pb-6">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        <div className="z-10 w-full max-w-6xl flex flex-col items-center justify-center animate-in zoom-in duration-700">
          
          <img 
            src="/logo.png" 
            alt="ExpoGoiabal Logo" 
            className="w-full max-w-[120px] drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] mb-4"
          />

          <div className="relative group max-w-xl w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
            
            <div className="relative bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-3xl flex flex-col items-center text-center shadow-2xl">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Inscrições Encerradas
              </h2>
              
              <p className="text-zinc-300 font-medium mb-4 text-sm md:text-base leading-relaxed">
                Agradecemos imensamente a todas as candidatas que se inscreveram para <span className="text-yellow-500 font-bold">Embaixadora e Madrinha!</span>
              </p>
              
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-4"></div>
              
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/40 px-4 py-3 rounded-2xl w-full transform transition-transform hover:scale-105 duration-300 shadow-[0_0_30px_rgba(255,215,0,0.2)] mb-4">
                <p className="text-yellow-500 text-xs md:text-sm font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Fique Atenta
                </p>
                <p className="text-white text-lg md:text-2xl font-black tracking-wide uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  Dia 25/06 inicia as votações
                </p>
              </div>

              <button 
                onClick={() => navigate('/ExpoGoiabal/Embaixadora')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors uppercase tracking-widest text-xs"
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
