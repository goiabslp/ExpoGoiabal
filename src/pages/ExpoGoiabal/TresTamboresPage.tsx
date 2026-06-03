import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Ticket } from 'lucide-react';

export const TresTamboresPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-4 relative">
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
              3 Tambores
            </h1>
            
            <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-3 rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.15)] mt-2 animate-pulse">
              <Ticket className="text-yellow-500 animate-bounce" size={20} />
              <span className="text-zinc-300 font-semibold uppercase tracking-widest text-xs">
                Código IMA (GTA):
              </span>
              <span className="font-black text-yellow-500 tracking-widest text-sm md:text-base">
                96779
              </span>
            </div>
          </div>

          {/* Lado Direito: Card de Inscrição */}
          <div 
            onClick={() => navigate('/ExpoGoiabal/3tambores/inscricao')}
            className="cursor-pointer group flex items-center justify-center transition-all duration-500 hover:scale-105 w-full max-w-[220px] md:max-w-[280px]"
          >
            <img 
              src="/Tambores.png" 
              alt="Inscrição 3 Tambores" 
              className="w-full h-auto rounded-3xl drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] transition-all duration-500"
            />
          </div>

        </div>
      </main>
    </div>
  );
};
