import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, ChevronDown, Check, X } from 'lucide-react';
import { CIDADES_MINAS_GERAIS, CIDADE_PADRAO_MG } from '../../data/cidadesMG';

interface SelectCidadeMGProps {
  value: string;
  onChange: (cidade: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
  placeholder?: string;
}

export const SelectCidadeMG: React.FC<SelectCidadeMGProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  label,
  id = 'cidade-select',
  placeholder = 'Selecione uma cidade de MG...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputBuscaRef = useRef<HTMLInputElement>(null);

  // Valor atual garantindo o padrão se vazio
  const valorAtual = value || CIDADE_PADRAO_MG;

  // Filtragem com suporte a acentos e case-insensitive
  const cidadesFiltradas = useMemo(() => {
    if (!busca.trim()) return CIDADES_MINAS_GERAIS;

    const termo = busca
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return CIDADES_MINAS_GERAIS.filter(cidade => {
      const cidadeNorm = cidade
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return cidadeNorm.includes(termo);
    });
  }, [busca]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setBusca('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Foco no campo de busca ao abrir
  useEffect(() => {
    if (isOpen && inputBuscaRef.current) {
      inputBuscaRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (cidade: string) => {
    onChange(cidade);
    setIsOpen(false);
    setBusca('');
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <MapPin size={14} className="text-emerald-400 shrink-0" />
          <span>{label}</span>
          {required && <span className="text-emerald-400">*</span>}
        </label>
      )}

      {/* Input oculto para validação HTML */}
      <input
        type="text"
        id={id}
        name={id}
        required={required}
        value={valorAtual}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Botão Gatilho do Select */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full bg-zinc-950/80 border ${
          isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-700/80 hover:border-zinc-500'
        } rounded-xl px-4 py-3 text-left flex items-center justify-between gap-3 text-sm transition-all cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <MapPin size={16} className="text-emerald-400 shrink-0" />
          <span className="text-white font-medium truncate">
            {valorAtual || placeholder}
          </span>
          {valorAtual === CIDADE_PADRAO_MG && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 shrink-0">
              Padrão
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
        />
      </button>

      {/* Dropdown com Busca e Lista das Cidades de MG */}
      {isOpen && (
        <div 
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ maxHeight: '320px' }}
        >
          {/* Campo de Pesquisa Rápida */}
          <div className="p-3 bg-zinc-950/90 border-b border-white/10 sticky top-0 z-10 flex items-center gap-2">
            <Search size={15} className="text-emerald-400 shrink-0" />
            <input
              ref={inputBuscaRef}
              type="text"
              placeholder="Digite o nome da cidade em MG..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full bg-transparent text-white placeholder-zinc-500 text-xs font-medium focus:outline-none"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="text-zinc-500 hover:text-white p-1 transition-colors"
                title="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lista de Opções */}
          <div className="overflow-y-auto max-h-[250px] divide-y divide-white/5 py-1">
            {cidadesFiltradas.length === 0 ? (
              <div className="py-6 px-4 text-center text-zinc-400 text-xs font-medium flex flex-col items-center gap-1.5">
                <MapPin size={20} className="text-zinc-600" />
                <span>Nenhuma cidade encontrada com "{busca}"</span>
                <span className="text-[10px] text-zinc-500">Todas as 853 cidades de Minas Gerais estão cadastradas</span>
              </div>
            ) : (
              cidadesFiltradas.map((cidade, index) => {
                const isSelected = cidade === valorAtual;
                const isFirstPadrao = index === 0 && cidade === CIDADE_PADRAO_MG && !busca;

                return (
                  <button
                    key={cidade}
                    type="button"
                    onClick={() => handleSelect(cidade)}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : isFirstPadrao
                        ? 'bg-emerald-950/30 text-emerald-200 font-semibold hover:bg-zinc-800'
                        : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{cidade}</span>
                      {cidade === CIDADE_PADRAO_MG && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30 shrink-0">
                          Sede
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="px-3.5 py-2 bg-zinc-950/90 border-t border-white/5 text-[10px] text-zinc-400 flex items-center justify-between">
            <span>Total: 853 cidades de MG</span>
            <span className="text-emerald-400 font-semibold">Minas Gerais</span>
          </div>
        </div>
      )}
    </div>
  );
};
