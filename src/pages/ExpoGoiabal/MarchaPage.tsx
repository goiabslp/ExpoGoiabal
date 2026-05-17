import React from 'react';
import { Header } from '../../components/Header';

export const MarchaPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-4 relative">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        <div className="z-10 flex flex-col items-center gap-8 text-center animate-in zoom-in duration-700">
          <img 
            src="/logo.png" 
            alt="ExpoGoiabal Logo" 
            className="w-full max-w-md drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-500"
          />
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
              Em Breve
            </h2>
            <h1 className="text-xl text-zinc-400 uppercase tracking-wider font-semibold">Concurso de Marcha</h1>
          </div>
        </div>
      </main>
    </div>
  );
};
