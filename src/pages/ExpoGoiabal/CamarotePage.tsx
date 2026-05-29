import React from 'react';
import { Header } from '../../components/Header';
import { Ticket, QrCode, Sparkles, Calendar, ShieldCheck, Gem, Coins, ArrowRight } from 'lucide-react';

export const CamarotePage: React.FC = () => {
  const ticketUrl = "https://www.ingressonacional.com.br/evento/34244/camarote-expo-goiabal";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticketUrl)}`;

  const tickets = [
    {
      title: "Passaporte Unissex",
      subtitle: "Acesso Geral Camarote",
      price: "100,00",
      fee: "10,00",
      lote: "Lote 1",
      badge: "Válido para todos os dias",
      features: [
        "Acesso à área VIP em todas as noites do evento (04 a 07/06)",
        "Vista privilegiada da arena de rodeio e do palco principal",
        "Banheiros e bares exclusivos com atendimento diferenciado",
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
        "Acesso exclusivo na noite de Sexta-Feira (05 de Junho)",
        "Vista privilegiada do rodeio oficial e shows nacionais",
        "Acesso aos bares e banheiros exclusivos do Camarote VIP",
        "Entrada diferenciada sem filas",
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
        "Acesso exclusivo na noite de Sábado (06 de Junho)",
        "Vista VIP para a grande final do rodeio e shows da noite",
        "Acesso aos bares e banheiros exclusivos do Camarote VIP",
        "Entrada diferenciada sem filas",
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
              Camarote VIP
            </h1>
            
            <p className="text-zinc-300 text-base md:text-lg font-medium leading-relaxed">
              Viva a melhor experiência da ExpoGoiabal 2026 com conforto, vista privilegiada, bares exclusivos e a vibração única do melhor lugar da festa!
            </p>
          </div>

          {/* Ticket Grid Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full px-4 items-stretch">
            {tickets.map((ticket, index) => (
              <div 
                key={index}
                className={`relative flex flex-col justify-between bg-zinc-900/60 backdrop-blur-md border ${
                  ticket.isPopular 
                    ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-102 lg:scale-105' 
                    : 'border-white/10 hover:border-yellow-500/30 shadow-2xl'
                } rounded-3xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2`}
              >
                {/* Popular Ribbon/Badge */}
                {ticket.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Gem size={12} />
                    Melhor Escolha
                  </span>
                )}

                {/* Ticket Top details */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-wider text-white">
                        {ticket.title}
                      </h3>
                      <p className="text-zinc-400 font-semibold text-sm tracking-wide mt-1">
                        {ticket.subtitle}
                      </p>
                    </div>
                    <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                      {ticket.lote}
                    </span>
                  </div>

                  {/* Show/Validation Badge */}
                  <span className="text-xs bg-zinc-950/70 border border-zinc-800 text-zinc-300 font-medium px-3 py-2 rounded-xl flex items-center gap-2">
                    <Calendar size={14} className="text-yellow-500 shrink-0" />
                    {ticket.badge}
                  </span>

                  <hr className="border-zinc-800 my-2" />

                  {/* Features */}
                  <ul className="flex flex-col gap-3">
                    {ticket.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-zinc-300">
                        <ShieldCheck size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing Block */}
                <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">Preço Individual</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-zinc-400">R$</span>
                      <span className="text-4xl font-black text-white tracking-tight">
                        {ticket.price}
                      </span>
                    </div>
                    <span className="text-xs text-yellow-500/80 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                      <Coins size={12} />
                      (+ R$ {ticket.fee} taxa de serviço)
                    </span>
                  </div>
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
              *Ingressos de 1º lote são limitados. Sujeito a alteração de preços sem aviso prévio. Proibida a entrada de menores de 18 anos desacompanhados.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};
