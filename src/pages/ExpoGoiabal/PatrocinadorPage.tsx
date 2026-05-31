import React from 'react';
import { Header } from '../../components/Header';
import { Crown, Sparkles, Handshake, MapPin } from 'lucide-react';

export const PatrocinadorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-955 font-sans text-white">
      <Header />
      
      <main className="flex-1 pt-28 pb-20 px-4 relative flex justify-center overflow-hidden">
        {/* Background Layers */}
        <div 
          className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} 
        />
        <div 
          className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} 
        />
        
        {/* Content Container */}
        <div className="z-10 w-full max-w-5xl animate-in slide-in-from-bottom-8 fade-in duration-1000 flex flex-col items-center gap-12">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <span className="text-yellow-500 text-xs md:text-sm font-black uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center gap-2 animate-pulse">
              <Sparkles size={14} className="animate-spin duration-3000" />
              ExpoGoiabal 2026
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Patrocinadores
            </h1>
            
            <p className="text-zinc-400 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
              As grandes marcas que impulsionam a cultura, o esporte e tornam a maior festa de São José do Goiabal uma realidade inesquecível.
            </p>
          </div>

          {/* Sponsors Section Grid */}
          <div className="w-full flex flex-col items-center gap-10">
            
            {/* Master Sponsor Category Label */}
            <div className="flex items-center gap-3">
              <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-yellow-500" />
              <div className="flex items-center gap-2 text-yellow-500 font-black uppercase tracking-widest text-xs md:text-sm">
                <Crown size={16} className="text-yellow-500 animate-pulse" />
                Patrocinador Oficial
              </div>
              <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-yellow-500" />
            </div>

            {/* Glowing Main Sponsor Card */}
            <div className="w-full max-w-2xl bg-zinc-900/40 backdrop-blur-md border border-yellow-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(245,158,11,0.15)] hover:shadow-[0_0_70px_rgba(245,158,11,0.25)] hover:border-yellow-500/50 transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden flex flex-col items-center text-center gap-8">
              
              {/* Internal abstract gold glow */}
              <div className="absolute -inset-96 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0,transparent_50%)] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              
              {/* Sponsor Logo Container */}
              <div className="w-64 h-64 md:w-72 md:h-72 bg-black/40 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:scale-105">
                <img 
                  src="/haras_mare_mansa.png" 
                  alt="Haras Maré Mansa" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all duration-500"
                />
              </div>

              {/* Sponsor Text Details */}
              <div className="flex flex-col items-center gap-3">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white group-hover:text-yellow-400 transition-colors">
                  Haras Maré Mansa
                </h3>
                
                <div className="flex items-center gap-2 text-zinc-400 font-semibold text-xs md:text-sm uppercase tracking-widest mt-1">
                  <MapPin size={14} className="text-yellow-500 shrink-0" />
                  São José do Goiabal - Minas Gerais
                </div>
              </div>

              {/* Decorative Tag */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-inner animate-pulse">
                Apoio Master
              </div>
            </div>

          </div>

          {/* CTA Block: Seja um Patrocinador */}
          <div className="w-full max-w-3xl bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 mt-12 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />
            
            <div className="flex flex-col gap-3 text-center md:text-left max-w-md">
              <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-400 font-black uppercase tracking-widest text-xs md:text-sm">
                <Handshake size={18} />
                Sua Marca Aqui
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white leading-tight">
                Seja um Patrocinador Oficial!
              </h2>
              <p className="text-zinc-400 font-medium text-xs md:text-sm">
                Associe sua marca ao maior evento da região e alcance milhares de pessoas. Entre em contato conosco para conhecer nossas cotas de patrocínio.
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <a 
                href="https://wa.me/5531971462317?text=Ol%C3%A1.%20Quero%20ser%20um%20patrocinador%20da%20EXPOGOIABAL%202026"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs md:text-sm py-3.5 px-6 rounded-full transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] cursor-pointer"
              >
                <svg 
                  className="w-5 h-5 shrink-0 fill-current text-white" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.454L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.489 0 9.953-4.426 9.956-9.873.001-2.638-1.024-5.117-2.884-6.979C16.478 1.89 13.99.862 11.35.862 5.862.862 1.397 5.288 1.394 10.735c0 1.486.4 2.937 1.157 4.207l-.994 3.63 3.734-.973c1.235.674 2.507 1.056 3.766 1.056zm11.238-7.618c-.305-.152-1.802-.888-2.08-.99-.279-.101-.482-.152-.684.152-.202.304-.781.99-.958 1.192-.176.202-.353.228-.658.076-.305-.152-1.288-.475-2.454-1.516-.906-.809-1.518-1.809-1.696-2.113-.177-.305-.019-.47.133-.622.137-.137.305-.355.457-.533.153-.178.204-.305.305-.508.102-.203.05-.381-.025-.533-.076-.152-.684-1.649-.937-2.258-.247-.594-.497-.513-.684-.523-.177-.009-.38-.012-.583-.012-.203 0-.533.076-.813.381-.28.305-1.066 1.04-1.066 2.538 0 1.498 1.091 2.943 1.243 3.146.153.203 2.147 3.279 5.202 4.6.726.313 1.293.5 1.734.64.73.232 1.394.2 1.917.122.583-.087 1.802-.736 2.057-1.448.254-.71.254-1.32.178-1.448-.076-.127-.279-.203-.584-.355z"/>
                </svg>
                Falar Conosco
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
