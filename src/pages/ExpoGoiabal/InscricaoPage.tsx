import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';

export const InscricaoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center pt-24 px-4 relative pb-12">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        <div className="z-10 w-full max-w-5xl mt-8 flex flex-col gap-10 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-widest text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Inscrições
          </h1>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 w-full px-4">

            {/* Card 2: 3 Tambores */}
            <div 
              onClick={() => navigate('/ExpoGoiabal/3tambores/inscricao')}
              className="cursor-pointer group flex items-center justify-center transition-all duration-500 hover:scale-105"
            >
              <img 
                src="/Tambores.png" 
                alt="Inscrição 3 Tambores" 
                className="w-3/4 md:w-full max-w-[320px] h-auto rounded-3xl drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-500"
              />
            </div>

            {/* Card 3: Peão Mirim */}
            <div 
              onClick={() => navigate('/ExpoGoiabal/Mirim/inscricao')}
              className="cursor-pointer group flex items-center justify-center transition-all duration-500 hover:scale-105"
            >
              <img 
                src="/Mirim.png" 
                alt="Inscrição Peão Mirim" 
                className="w-3/4 md:w-full max-w-[320px] h-auto rounded-3xl drop-shadow-[0_0_15px_rgba(255,100,0,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(255,100,0,0.6)] transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
