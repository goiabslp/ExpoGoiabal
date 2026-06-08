import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header';
import { BackButton } from '../../components/BackButton';
import { Camera, Calendar, Lock, ExternalLink, Clock } from 'lucide-react';

interface DayConfig {
  key: string;
  name: string;
  eventDate: string;
  releaseDate: Date;
  releaseDateStr: string;
  defaultLink: string;
}

const DAYS_CONFIG: DayConfig[] = [
  {
    key: 'quinta',
    name: 'Quinta-feira',
    eventDate: '04/06/2026',
    releaseDate: new Date('2026-06-08T00:00:00-03:00'),
    releaseDateStr: '08/06/2026',
    defaultLink: 'https://www.ingressonacional.com.br'
  },
  {
    key: 'sexta',
    name: 'Sexta-feira',
    eventDate: '05/06/2026',
    releaseDate: new Date('2026-06-09T00:00:00-03:00'),
    releaseDateStr: '09/06/2026',
    defaultLink: 'https://www.ingressonacional.com.br'
  },
  {
    key: 'sabado',
    name: 'Sábado',
    eventDate: '06/06/2026',
    releaseDate: new Date('2026-06-10T00:00:00-03:00'),
    releaseDateStr: '10/06/2026',
    defaultLink: 'https://www.ingressonacional.com.br'
  },
  {
    key: 'domingo',
    name: 'Domingo',
    eventDate: '07/06/2026',
    releaseDate: new Date('2026-06-11T00:00:00-03:00'),
    releaseDateStr: '11/06/2026',
    defaultLink: 'https://www.ingressonacional.com.br'
  }
];

export const FotosPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [galleryLinks, setGalleryLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    // Carrega os links do localStorage salvos pelo Admin
    const links: Record<string, string> = {};
    DAYS_CONFIG.forEach((day) => {
      const savedLink = localStorage.getItem(`fotos_galeria_${day.key}`);
      links[day.key] = savedLink || day.defaultLink;
    });
    setGalleryLinks(links);

    // Timer para manter a hora atualizada e checar a liberação de forma reativa
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 font-sans text-white">
      <Header />
      
      <main className="flex-1 pt-28 pb-20 px-4 relative flex justify-center">
        {/* Background Layers */}
        <div 
          className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} 
        />
        <div 
          className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} 
        />

        <div className="z-10 w-full max-w-6xl animate-in slide-in-from-bottom-8 fade-in duration-1000 flex flex-col items-center gap-10">
          
          {/* Header Action / Back */}
          <div className="w-full flex justify-start pl-2">
            <BackButton />
          </div>

          {/* Title Section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <span className="text-yellow-500 text-xs md:text-sm font-black uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center gap-2 animate-pulse">
              <Camera size={14} className="animate-pulse" />
              GALERIAS OFICIAIS
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Fotos Oficiais
            </h1>
            <h2 className="text-sm md:text-base text-zinc-500 font-bold uppercase tracking-[0.25em] mt-[-0.5rem]">
              EXPOGOIABAL 2026
            </h2>
            
            <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed mt-2">
              Explore e reviva cada emoção do evento. As fotos de cada dia serão publicadas e liberadas automaticamente de acordo com o cronograma.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 items-stretch mt-4">
            {DAYS_CONFIG.map((day) => {
              const isReleased = currentDate >= day.releaseDate;
              const link = galleryLinks[day.key] || day.defaultLink;

              return (
                <div 
                  key={day.key}
                  className={`relative flex flex-col justify-between bg-zinc-900/60 backdrop-blur-md border ${
                    isReleased 
                      ? 'border-yellow-500/30 hover:border-yellow-500/60 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                      : 'border-white/5 opacity-75'
                  } rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Calendar Badge */}
                    <div className="flex justify-between items-center">
                      <span className="bg-zinc-950/70 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg flex items-center gap-1.5">
                        <Calendar size={10} className="text-yellow-500" />
                        {day.eventDate}
                      </span>
                      {isReleased ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Liberado" />
                      ) : (
                        <Lock size={12} className="text-zinc-600" />
                      )}
                    </div>

                    {/* Day Name */}
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wider">{day.name}</h3>
                      <p className="text-xs text-zinc-500 font-semibold tracking-widest uppercase mt-0.5">Fotos do Dia</p>
                    </div>

                    <hr className="border-zinc-800" />
                  </div>

                  {/* Footer / Action */}
                  <div className="mt-8 flex flex-col gap-4">
                    {isReleased ? (
                      <a 
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs py-3.5 px-4 rounded-full transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.03] cursor-pointer"
                      >
                        Ver Fotos
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1.5">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            Fotos ainda não disponíveis
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest text-center flex items-center justify-center gap-1">
                          <Clock size={10} />
                          Liberação em: {day.releaseDateStr}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
};
