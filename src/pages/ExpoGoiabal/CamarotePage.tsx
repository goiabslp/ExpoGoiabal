import React from 'react';
import { Header } from '../../components/Header';
import { Ticket, QrCode, Sparkles, Calendar, ShieldCheck, Gem, Coins, ArrowRight, Clock, Trophy, X } from 'lucide-react';

export const CamarotePage: React.FC = () => {
  const [showGratisModal, setShowGratisModal] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowGratisModal(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const ticketUrl = "https://www.ingressonacional.com.br/evento/34244/camarote-expo-goiabal";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticketUrl)}`;

  const tickets = [
    {
      title: "Passaporte Unissex",
      subtitle: "Acesso Geral Camarote",
      price: "100,00",
      fee: "10,00",
      lote: "Lote 1",
      badge: "Válido para SEXTA e SÁBADO",
      features: [
        "Área VIP na Sexta e Sábado (05 e 06/06)",
        "Vista da arena de rodeio e palco principal",
        "DJ exclusivo no camarote todos os dias",
        "Bares e banheiros VIP exclusivos",
        "Conforto premium e segurança reforçada",
      ],
      isPopular: true,
    },
    {
      title: "Ingresso Unissex SEXTA",
      subtitle: "Sexta-Feira • 05/06",
      price: "60,00",
      fee: "6,00",
      lote: "Lote 1",
      badge: "Naiara Azevedo + Andrey Ferraz + DJ Brinks",
      features: [
        "Acesso exclusivo na Sexta-Feira (05/06)",
        "Vista privilegiada do rodeio e shows",
        "DJ exclusivo no camarote da festa",
        "Acesso a bares e banheiros VIP exclusivos",
        "Entrada rápida e sem filas",
      ],
      isPopular: false,
    },
    {
      title: "Ingresso Unissex SÁBADO",
      subtitle: "Sábado • 06/06",
      price: "60,00",
      fee: "6,00",
      lote: "Lote 1",
      badge: "Althair & Alexandre + Marconi & Diego + Banda Nova Face",
      features: [
        "Acesso exclusivo no Sábado (06/06)",
        "Vista VIP da grande final e shows",
        "DJ exclusivo no camarote da festa",
        "Acesso a bares e banheiros VIP exclusivos",
        "Entrada rápida e sem filas",
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 font-sans text-white">
      <style>{`
        @keyframes vip-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 0 35px rgba(245, 158, 11, 0.8), 0 0 15px rgba(245, 158, 11, 0.4);
          }
        }
        .animate-vip-pulse {
          animation: vip-pulse 2s infinite ease-in-out;
        }
      `}</style>
      <Header />
      <main className="flex-1 pt-28 pb-20 px-4 relative flex justify-center">
        {/* Background Layer (Mobile) */}
        <div 
          className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} 
        />
        {/* Background Layer (Desktop) */}
        <div 
          className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity pointer-events-none" 
          style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} 
        />

        {/* Content Wrapper */}
        <div className="z-10 w-full max-w-6xl animate-in slide-in-from-bottom-8 fade-in duration-1000 flex flex-col items-center gap-12">
          
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <span className="text-yellow-500 text-xs md:text-sm font-black uppercase tracking-widest bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)] flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span>
              🔥 VENDAS LIBERADAS • 1º LOTE
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Camarote
            </h1>
            
            <div className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto space-y-3">
              <p>Vem viver a energia de um jeito ainda mais especial! ✨</p>
              <p>No camarote, você curte os shows, a emoção da festa e cada momento da ExpoGoiabal com conforto, uma vista incrível e muita animação do começo ao fim.</p>
            </div>

            {/* Informações Gerais do Evento */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-zinc-300 font-bold uppercase tracking-widest text-xs md:text-sm">
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Clock className="shrink-0 animate-pulse text-yellow-500" size={16} />
                Abertura dos Portões às 18:00 Horas
              </div>
            </div>
          </div>

          {/* Ticket Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 xl:gap-6 w-full px-4 items-stretch">
            {tickets.map((ticket, index) => (
              <div 
                key={index}
                className={`relative flex flex-col justify-between bg-zinc-900/60 backdrop-blur-md border ${
                  ticket.isPopular 
                    ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-102 lg:scale-105' 
                    : 'border-white/10 hover:border-yellow-500/30 shadow-2xl'
                } rounded-3xl p-5 md:p-6 lg:p-5 xl:p-6 transition-all duration-500 hover:-translate-y-1.5`}
              >
                {/* Popular Ribbon/Badge */}
                {ticket.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[10px] lg:text-[9px] xl:text-xs font-black uppercase tracking-widest px-3 py-1 lg:px-2.5 lg:py-0.5 xl:px-4 xl:py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                    <Gem size={10} />
                    Melhor Escolha
                  </span>
                )}

                {/* Ticket Top details */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-1.5">
                    <div>
                      <h3 className="text-lg md:text-xl lg:text-[15px] xl:text-lg font-black uppercase tracking-wider text-white leading-tight">
                        {ticket.title}
                      </h3>
                      <p className="text-zinc-400 font-semibold text-xs lg:text-[10px] xl:text-xs tracking-wide mt-1">
                        {ticket.subtitle}
                      </p>
                    </div>
                    <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] lg:text-[9px] xl:text-xs font-black uppercase tracking-widest px-2 py-1 lg:px-1.5 lg:py-0.5 xl:px-3 xl:py-1.5 rounded-lg shrink-0">
                      {ticket.lote}
                    </span>
                  </div>

                  {/* Highlight Div (Sexta e Sábado) */}
                  {index === 0 && (
                    <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/25 to-yellow-600/20 border border-yellow-500/30 rounded-xl py-2.5 px-3.5 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-in fade-in zoom-in-95 duration-500">
                      <span className="text-yellow-400 font-black text-xs md:text-sm uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                        ⭐ Sexta e Sábado
                      </span>
                    </div>
                  )}

                  {/* Show/Validation Badge */}
                  <span className="text-[10px] md:text-xs lg:text-[10px] xl:text-xs bg-zinc-950/70 border border-zinc-800 text-zinc-300 font-medium px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Calendar size={12} className="text-yellow-500 shrink-0" />
                    <span className="truncate">{ticket.badge}</span>
                  </span>

                  <hr className="border-zinc-800 my-1" />

                  {/* Features */}
                  <ul className="flex flex-col gap-2">
                    {ticket.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs md:text-sm lg:text-[11px] xl:text-xs font-medium text-zinc-300">
                        <ShieldCheck size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                        {index === 0 && idx === 0 ? (
                          <span className="text-yellow-400 font-bold">{feature}</span>
                        ) : (
                          <span>{feature}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Block */}
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-[9px] xl:text-xs text-zinc-500 uppercase tracking-widest font-black">Preço Individual</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-black text-zinc-400">R$</span>
                      <span className="text-3xl lg:text-2xl xl:text-3xl font-black text-white tracking-tight">
                        {ticket.price}
                      </span>
                    </div>
                    <span className="text-[9px] xl:text-xs text-yellow-500/80 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                      <Coins size={10} />
                      (+ R$ {ticket.fee} taxa)
                    </span>
                  </div>

                  <a 
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs lg:text-[10px] xl:text-xs py-2.5 px-4 lg:py-2 lg:px-3 xl:py-2.5 xl:px-4 rounded-full transition-all duration-300 uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.03] cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Ticket size={12} className="shrink-0" />
                    Comprar
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* QR Code and Button Section */}
          <div className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 mt-6 max-w-4xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600"></div>
            
            <div className="flex flex-col gap-6 text-center lg:text-left max-w-lg">
              <div className="flex items-center justify-center lg:justify-start gap-3 text-yellow-500 font-black uppercase tracking-widest text-sm">
                <QrCode size={20} />
                Compre com Segurança
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white leading-tight">
                Garanta Seu Ingresso Agora Mesmo!
              </h2>
              <p className="text-zinc-400 font-medium text-base">
                Aponte a câmera do seu celular para o QR Code ao lado para acessar a plataforma oficial de vendas do camarote, ou clique no botão abaixo para ir direto ao link.
              </p>
              
              {/* Direct Access CTA Button */}
              <div className="flex justify-center lg:justify-start pt-2">
                <a 
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-base py-4 px-10 rounded-full transition-all duration-300 uppercase tracking-widest animate-vip-pulse"
                >
                  <Ticket size={20} className="shrink-0 animate-bounce" />
                  Ir para Vendas Camarote
                  <ArrowRight size={18} className="shrink-0" />
                </a>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="bg-white p-4 rounded-3xl shadow-[0_0_35px_rgba(245,158,11,0.25)] border-2 border-yellow-500/80 transition-all duration-500 hover:scale-105 flex items-center justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code para Compra do Camarote" 
                  className="w-48 h-48 md:w-56 md:h-56 object-contain"
                />
              </div>
              <span className="text-[10px] md:text-xs text-zinc-500 font-bold tracking-widest mt-1 break-all max-w-[250px] text-center">
                Link: <span className="lowercase font-mono">{ticketUrl}</span>
              </span>
            </div>
          </div>

          {/* Additional Info / Security Badge */}
          <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/10 px-6 py-4 rounded-2xl max-w-xl text-center">
            <Sparkles size={20} className="text-yellow-500 shrink-0" />
            <p className="text-zinc-400 font-medium text-xs md:text-sm">
              *Abertura dos portões às 18:00 horas. Ingressos de 1º lote são limitados. Sujeito a alteração de preços sem aviso prévio. Proibida a entrada de menores de 18 anos desacompanhados.
            </p>
          </div>

        </div>
      </main>

      {/* Modal: Festa é TOTALMENTE GRÁTIS */}
      {showGratisModal && (
        <div 
          onClick={() => setShowGratisModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-none animate-in fade-in duration-300 cursor-pointer overflow-hidden"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-950 border-2 border-emerald-500/30 rounded-3xl w-full max-w-sm md:max-w-md p-4 md:p-5 shadow-[0_0_50px_rgba(16,185,129,0.25)] animate-in zoom-in-95 duration-300 my-auto max-h-[92vh] flex flex-col justify-between overflow-y-auto cursor-default scrollbar-thin scrollbar-thumb-zinc-800"
          >
            
            {/* Botão Fechar (White Close Button) */}
            <button 
              onClick={() => setShowGratisModal(false)}
              className="absolute top-3 right-3 text-white hover:text-zinc-300 transition-colors cursor-pointer focus:outline-none p-1.5 rounded-full hover:bg-white/10 z-20"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            {/* Top gradient strip */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-500 to-emerald-600"></div>

            {/* Top Icon */}
            <div className="flex flex-col items-center gap-1.5 md:gap-2 text-center mt-1">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
                <Trophy size={20} className="text-yellow-300 md:w-5 md:h-5" />
              </div>
              
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">
                Atenção Galera! 🤠
              </h2>
              <div className="h-0.5 w-10 bg-emerald-500 rounded-full"></div>
            </div>

            {/* Content Message */}
            <div className="text-center space-y-2.5 md:space-y-3.5 my-3 md:my-4">
              <p className="text-zinc-300 font-medium text-xs md:text-sm leading-relaxed">
                A gente sabe que a programação está tão sensacional que parece...
              </p>
              
              <div className="py-1 px-3 md:py-1.5 md:px-4 bg-red-500/10 border border-red-500/20 rounded-2xl inline-block transform hover:scale-105 transition-transform duration-300 shadow-inner">
                <span className="text-red-400 font-black text-xs md:text-sm uppercase tracking-widest block animate-pulse">
                  SABOOORR... COBRADO
                </span>
              </div>
              
              <p className="text-zinc-300 font-medium text-xs md:text-sm leading-relaxed">
                Mas acalme o coração, porque a entrada é...
              </p>
              
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm md:text-base uppercase tracking-widest px-4 py-1.5 md:px-5 md:py-2 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/30 inline-block transform rotate-1 hover:rotate-0 transition-transform duration-300">
                TOTALMENTE GRÁTIS! 🎉
              </div>
            </div>

            {/* Disclaimer block */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-2.5 md:p-3 text-left">
              <p className="text-zinc-400 text-[10px] md:text-xs leading-relaxed">
                ⚠️ <strong className="text-yellow-500">Nota:</strong> Apenas o <strong className="text-white">camarote</strong> terá comercialização de entrada. A arena de rodeio, a praça de alimentação e a pista de shows têm acesso 100% gratuito todos os dias!
              </p>
            </div>

            {/* Action button */}
            <div className="flex flex-col items-center mt-4">
              <button 
                onClick={() => setShowGratisModal(false)}
                className="w-full py-2.5 md:py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-xs md:text-sm rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300 uppercase tracking-widest font-sans cursor-pointer"
              >
                Bora Curtir! 🐴
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
