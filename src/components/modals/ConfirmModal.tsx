import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmWord: string;
  confirmButtonText: string;
  icon?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmWord,
  confirmButtonText,
  icon = <Trash2 size={32} className="text-on-error-container" />
}) => {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.toUpperCase() === confirmWord.toUpperCase();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-fast">
      <div className="bg-surface-container-low rounded-2xl p-6 w-full max-w-sm m-4 relative shadow-2xl animate-slide-in-up-fast">
        <button onClick={onClose} className="absolute top-3 right-3 text-on-surface-variant hover:text-on-surface transition-colors">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mb-4">
            {icon}
          </div>
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <p className="text-sm text-on-surface-variant mt-2">
            {message}
          </p>
        </div>

        <div className="mt-6 space-y-3">
            <p className='text-center text-xs text-on-surface-variant'>
              {t('confirmModal.instruction', { confirmWord: confirmWord.toUpperCase() })}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-surface-container-high border border-outline/50 rounded-lg p-3 text-on-surface uppercase text-center tracking-widest font-mono focus:ring-2 focus:ring-primary"
              placeholder={confirmWord.toUpperCase()}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              onClick={handleConfirm}
              disabled={!isConfirmed}
              className="w-full h-12 bg-error text-on-error rounded-xl font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:bg-on-surface-variant/20 disabled:text-on-surface-variant disabled:cursor-not-allowed shadow-md text-sm"
            >
              {confirmButtonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
