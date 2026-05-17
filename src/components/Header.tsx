import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'Prefeitura.2025' && senha === 'Gafds.2025') {
      setIsLoginModalOpen(false);
      setLogin('');
      setSenha('');
      setLoginError('');
      navigate('/Admin');
    } else {
      setLoginError('Credenciais inválidas.');
    }
  };

  const navItems = [
    { label: 'Início', path: '/ExpoGoiabal/Inicio' },
    { label: 'Programação', path: '/ExpoGoiabal/Programacao' },
    { label: 'Camarote', path: '/ExpoGoiabal/Camarote' },
    { label: 'Embaixadora', path: '/ExpoGoiabal/Embaixadora' },
    { label: 'Concurso de Marcha', path: '/ExpoGoiabal/Marcha' },
    { label: 'Inscrição', path: '/ExpoGoiabal/Inscricao' },
  ];

  return (
    <header className="bg-gradient-to-b from-black/50 to-transparent backdrop-blur-md shadow-yellow-glow fixed top-0 z-40 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
        
        {/* Logo Esquerda */}
        <div className="flex-1 flex justify-start h-full shrink-0">
          <div className="cursor-pointer h-full flex items-center py-2" onClick={() => navigate('/ExpoGoiabal/Inicio')}>
            <img 
              src="/logo-header.png" 
              alt="ExpoGoiabal Logo" 
              className="h-full w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]"
            />
          </div>
        </div>

        {/* Menu Centralizado (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 shrink-0 z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `text-[10px] xl:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive 
                    ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                    : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:text-cyan-300 hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Lado Direito (Logo 2 no Desktop, Hamburger no Mobile) */}
        <div className="flex-1 flex justify-end items-center h-full shrink-0">
          
          {/* Logo 2 (Escondida no Mobile) */}
          <div className="hidden lg:flex items-center h-full relative">
            <img 
              src="/logo2.png" 
              alt="Logo Secundária" 
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              className="h-16 w-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            />
            
            {isAdminMenuOpen && (
              <div className="absolute top-20 right-0 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => { setIsAdminMenuOpen(false); setIsLoginModalOpen(true); }}
                  className="w-full text-left px-6 py-3 text-sm text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-3 font-semibold"
                >
                  <Shield size={18} className="text-yellow-500" />
                  Admin
                </button>
              </div>
            )}
          </div>

          {/* Menu Hamburger (Aparece no Mobile) */}
          <button 
            className="lg:hidden text-white p-2 z-50 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" /> : <Menu size={28} className="hover:text-cyan-400 transition-colors" />}
          </button>
        </div>

      </div>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 shadow-2xl flex flex-col items-center py-6 gap-6 animate-in slide-in-from-top-4 duration-300 z-50">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => 
                `text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                    : "text-white hover:text-cyan-300"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button 
            onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-yellow-500 transition-colors mt-4"
          >
            <Shield size={16} />
            Admin
          </button>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-300 mx-auto">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center mb-8">
              <Shield size={48} className="text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Acesso Restrito</h2>
            </div>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Login" 
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>
              <div>
                <input 
                  type="password" 
                  placeholder="Senha" 
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm font-semibold">{loginError}</p>}
              <button 
                type="submit"
                className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-[1.02] text-black font-bold rounded-xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
