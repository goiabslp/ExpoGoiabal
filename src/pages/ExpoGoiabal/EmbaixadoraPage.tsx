import React from 'react';
import { Header } from '../../components/Header';

export const EmbaixadoraPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-4 relative pb-12">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        <div className="z-10 w-full max-w-6xl mt-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 animate-in zoom-in duration-700">
          
          {/* Lado Esquerdo: Logo */}
          <div className="flex flex-col items-center gap-6">
            <img 
              src="/logo.png" 
              alt="ExpoGoiabal Logo" 
              className="w-full max-w-[280px] md:max-w-md drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-500"
            />
            <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Embaixadora
            </h1>
          </div>

          {/* Lado Direito: Mensagem de Encerramento */}
          <div className="w-full max-w-md flex flex-col items-center justify-center">
            <div className="relative group animate-in slide-in-from-right duration-1000">
              {/* Animated glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
              
              <div className="relative bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-4">
                  Inscrições Encerradas
                </h2>
                
                <p className="text-zinc-300 font-medium mb-8 text-sm md:text-base">
                  Agradecemos a todas que se inscreveram para <span className="text-yellow-500 font-bold">Embaixadora e Madrinha!</span>
                </p>
                
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-8"></div>
                
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/40 px-6 py-5 rounded-2xl w-full transform transition-transform hover:scale-105 duration-300 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                  <p className="text-yellow-500 text-xs md:text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Prepare-se
                  </p>
                  <p className="text-white text-lg md:text-xl font-black tracking-wide uppercase">
                    Dia 25/06 inicia as votações
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Force Vite reload
