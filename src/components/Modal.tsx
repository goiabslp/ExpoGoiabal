import React, { useEffect } from 'react';
import { useModalStore } from '../store/modalStore';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const GlobalModal: React.FC = () => {
  const { isOpen, type, title, message, onConfirm, onCancel, closeModal } = useModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (onCancel) onCancel();
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal, onCancel]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (onCancel) onCancel();
      closeModal();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-12 h-12 text-emerald-400 mb-4 mx-auto" />;
      case 'error': return <AlertCircle className="w-12 h-12 text-rose-500 mb-4 mx-auto" />;
      case 'confirm': return <AlertCircle className="w-12 h-12 text-amber-400 mb-4 mx-auto" />;
      case 'info':
      default: return <Info className="w-12 h-12 text-blue-400 mb-4 mx-auto" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center relative">
          <button 
            onClick={() => { if(onCancel) onCancel(); closeModal(); }}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          {getIcon()}
          
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-zinc-300 mb-8">{message}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {type === 'confirm' && (
              <button 
                onClick={() => { if(onCancel) onCancel(); closeModal(); }}
                className="px-6 py-2.5 rounded-lg font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors focus:ring-2 focus:ring-zinc-500 outline-none w-full sm:w-auto"
              >
                Cancelar
              </button>
            )}
            
            <button 
              onClick={() => { if(onConfirm) onConfirm(); closeModal(); }}
              className={`px-6 py-2.5 rounded-lg font-medium text-white transition-colors focus:ring-2 outline-none w-full sm:w-auto ${
                type === 'error' ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' :
                type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' :
                type === 'confirm' ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 text-amber-950' :
                'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {type === 'confirm' ? 'Confirmar' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
