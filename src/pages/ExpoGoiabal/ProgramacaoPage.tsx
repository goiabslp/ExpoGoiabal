import React from 'react';
import { Header } from '../../components/Header';
import { ChevronDown } from 'lucide-react';

export const ProgramacaoPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 overflow-x-hidden">
      <Header />
      <main className="flex-1 flex flex-col relative w-full">
        {/* Background Global Fixado */}
        <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none" style={{ backgroundImage: 'url(/background3.png)' }} />
        
        {/* Seção Hero (Topo) */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 relative z-10 w-full">
          <div className="w-full max-w-[1400px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-16 mt-8 px-4 xl:px-12">
            
            {/* Lado Esquerdo */}
            <div className="flex flex-col gap-12 text-center xl:text-left items-center xl:items-start flex-1 order-2 xl:order-1">
              <button 
                onClick={() => document.getElementById('quinta-feira')?.scrollIntoView({ behavior: 'smooth' })}
                className="group focus:outline-none transition-transform hover:scale-105 cursor-pointer"
              >
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest group-hover:text-yellow-500 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">QUINTA-FEIRA</h3>
                <p className="text-lg md:text-xl text-zinc-400 group-hover:text-white transition-colors duration-300 mt-2 font-light tracking-wide">04 de Junho</p>
              </button>
              <button 
                onClick={() => document.getElementById('sexta-feira')?.scrollIntoView({ behavior: 'smooth' })}
                className="group focus:outline-none transition-transform hover:scale-105 cursor-pointer"
              >
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">SEXTA-FEIRA</h3>
                <p className="text-lg md:text-xl text-zinc-400 group-hover:text-white transition-colors duration-300 mt-2 font-light tracking-wide">05 de Junho</p>
              </button>
            </div>

            {/* Centro */}
            <div className="flex flex-col items-center gap-8 text-center animate-in zoom-in duration-700 flex-none xl:w-[500px] order-1 xl:order-2">
              <img 
                src="/logo.png" 
                alt="ExpoGoiabal Logo" 
                className="w-full max-w-md drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-500"
              />
              <div 
                onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
                className="flex flex-col items-center gap-2 mt-4 animate-bounce opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <h1 className="text-lg md:text-xl text-yellow-500 uppercase tracking-widest font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                  Role para baixo
                </h1>
                <ChevronDown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
              </div>
            </div>

            {/* Lado Direito */}
            <div className="flex flex-col gap-12 text-center xl:text-right items-center xl:items-end flex-1 order-3 xl:order-3">
              <button 
                onClick={() => document.getElementById('sabado')?.scrollIntoView({ behavior: 'smooth' })}
                className="group focus:outline-none transition-transform hover:scale-105 cursor-pointer"
              >
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest group-hover:text-yellow-500 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">SÁBADO</h3>
                <p className="text-lg md:text-xl text-zinc-400 group-hover:text-white transition-colors duration-300 mt-2 font-light tracking-wide">06 de Junho</p>
              </button>
              <button 
                onClick={() => document.getElementById('domingo')?.scrollIntoView({ behavior: 'smooth' })}
                className="group focus:outline-none transition-transform hover:scale-105 cursor-pointer"
              >
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">DOMINGO</h3>
                <p className="text-lg md:text-xl text-zinc-400 group-hover:text-white transition-colors duration-300 mt-2 font-light tracking-wide">07 de Junho</p>
              </button>
            </div>
          </div>
        </section>

        {/* Seção Quinta-feira */}
        <section id="quinta-feira" className="min-h-screen w-full flex flex-col items-center py-24 px-4 relative z-10 bg-gradient-to-b from-transparent to-black">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                QUINTA-FEIRA
              </h2>
              <p className="text-2xl text-zinc-400 mt-2 tracking-widest font-light">04 de Junho</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Card 1 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Recepção aos Cavaleiros</h3>
                    <div className="text-yellow-500 font-mono text-xl bg-yellow-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      18:00
                    </div>
                  </div>
                  <p className="text-zinc-400">Apresentação dos Cavaleiros e Churrasco</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Abertura do Rodeio</h3>
                    <div className="text-yellow-500 font-mono text-xl bg-yellow-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      20:00
                    </div>
                  </div>
                  <p className="text-zinc-400">Apresentação e Entrada dos Peões e Apresentação Mirim em Carneiro.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Show de Rodeio</h3>
                    <div className="text-yellow-500 font-mono text-xl bg-yellow-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      20:40
                    </div>
                  </div>
                  <p className="text-zinc-400">Montarias em bois e cavalos.</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Show de Música</h3>
                  <p className="text-zinc-400 mt-2 mb-4">Muita música no palco principal</p>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Edmilson do Forró</span>
                      <span className="text-yellow-500 font-mono">22:30</span>
                    </li>
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Celio Nonato</span>
                      <span className="text-yellow-500 font-mono">01:00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Sexta-feira */}
        <section id="sexta-feira" className="min-h-screen w-full flex flex-col items-center py-24 px-4 relative z-10 bg-gradient-to-b from-black to-transparent">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                SEXTA-FEIRA
              </h2>
              <p className="text-2xl text-zinc-400 mt-2 tracking-widest font-light">05 de Junho</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Card 1 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Abertura do Rodeio</h3>
                    <div className="text-cyan-400 font-mono text-xl bg-cyan-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      19:30
                    </div>
                  </div>
                  <p className="text-zinc-400">Apresentação e Entrada dos Peões e Apresentação Mirim em Carneiro.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Abertura Oficial da ExpoGoiabal 2026</h3>
                    <div className="text-cyan-400 font-mono text-xl bg-cyan-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      20:00
                    </div>
                  </div>
                  <p className="text-zinc-400">Apresentação das Autoridades e Organizadores</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Prova 3 Tambores Feminino</h3>
                    <div className="text-cyan-400 font-mono text-xl bg-cyan-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      20:20
                    </div>
                  </div>
                  <p className="text-zinc-400">Montaria Feminina em Cavalos</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Show de Rodeio</h3>
                    <div className="text-cyan-400 font-mono text-xl bg-cyan-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      21:00
                    </div>
                  </div>
                  <p className="text-zinc-400">Montarias em bois e cavalos.</p>
                </div>
              </div>

              {/* Card 5 - Show de Música */}
              <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Show de Música</h3>
                  <p className="text-zinc-400 mt-2 mb-4">Muita musica no palco principal</p>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Andrey Ferraz</span>
                      <span className="text-cyan-400 font-mono">22:30</span>
                    </li>
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Naiara Azevedo</span>
                      <span className="text-cyan-400 font-mono">00:30</span>
                    </li>
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">DJ Brinks</span>
                      <span className="text-cyan-400 font-mono">02:30</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Sábado */}
        <section id="sabado" className="min-h-screen w-full flex flex-col items-center py-24 px-4 relative z-10 bg-gradient-to-b from-transparent to-black">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                SÁBADO
              </h2>
              <p className="text-2xl text-zinc-400 mt-2 tracking-widest font-light">06 de Junho</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Card 1 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Abertura do Rodeio</h3>
                    <div className="text-yellow-500 font-mono text-xl bg-yellow-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      20:00
                    </div>
                  </div>
                  <p className="text-zinc-400">Apresentação e Entrada dos Peões e Apresentação Mirim em Carneiro.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Prova 3 Tambores Feminino</h3>
                    <div className="text-yellow-500 font-mono text-xl bg-yellow-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      20:30
                    </div>
                  </div>
                  <p className="text-zinc-400">Final da Competição</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Show de Rodeio</h3>
                    <div className="text-yellow-500 font-mono text-xl bg-yellow-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      21:00
                    </div>
                  </div>
                  <p className="text-zinc-400">Montarias em bois e cavalos.</p>
                </div>
              </div>

              {/* Card 4 - Show de Música */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">Show de Música</h3>
                  <p className="text-zinc-400 mt-2 mb-4">Muita musica no palco principal</p>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Marconi e Diego</span>
                      <span className="text-yellow-500 font-mono">22:30</span>
                    </li>
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Althair e Alexandre</span>
                      <span className="text-yellow-500 font-mono">00:30</span>
                    </li>
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Banda Nova Face</span>
                      <span className="text-yellow-500 font-mono">02:30</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Domingo */}
        <section id="domingo" className="min-h-screen w-full flex flex-col items-center py-24 px-4 relative z-10 bg-gradient-to-b from-black to-transparent">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                DOMINGO
              </h2>
              <p className="text-2xl text-zinc-400 mt-2 tracking-widest font-light">07 de Junho</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Card 1 */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start md:items-center justify-between gap-4 mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Concurso de Marcha</h3>
                    <div className="text-cyan-400 font-mono text-xl bg-cyan-500/10 px-4 py-2 rounded-lg whitespace-nowrap">
                      10:00
                    </div>
                  </div>
                  <p className="text-zinc-400">37ª Cavalgada de São José do Goiabal - MG</p>
                </div>
              </div>

              {/* Card 2 - Show de Música */}
              <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-colors group flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Show de Música</h3>
                  <p className="text-zinc-400 mt-2 mb-4">Música ao vivo durante o evento</p>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Banda Savassy</span>
                      <span className="text-cyan-400 font-mono">13:00</span>
                    </li>
                    <li className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-zinc-300 font-medium">Nilson Garcia</span>
                      <span className="text-cyan-400 font-mono">16:00</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
