import { create } from 'zustand';

type ModalType = 'info' | 'confirm' | 'error' | 'success';

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showModal: (options: {
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  showModal: (options) => set({ ...options, isOpen: true }),
  closeModal: () => set({ isOpen: false, onConfirm: undefined, onCancel: undefined }),
}));
