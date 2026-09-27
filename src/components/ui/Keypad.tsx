import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const KeypadButton: React.FC<{ 
  onClick: () => void, 
  children: React.ReactNode, 
  className?: string,
  ariaLabel?: string
}> = ({ onClick, children, className = '', ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`numpad-key h-14 bg-surface-container active:bg-surface-bright rounded-xl flex items-center justify-center text-3xl text-on-surface font-light transition-all shadow-sm ${className}`}
  >
    {children}
  </button>
);

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <section className="grid grid-cols-3 gap-2 w-full">
      {numericKeys.map((key) => (
        <KeypadButton key={key} onClick={() => onKeyPress(key)} ariaLabel={`Touche ${key}`}>
          {key}
        </KeypadButton>
      ))}

      <KeypadButton 
        onClick={() => onKeyPress('.')} 
        ariaLabel="Touche point décimal"
        className="text-on-surface-variant"
      >
        .
      </KeypadButton>

      <KeypadButton key="0" onClick={() => onKeyPress('0')} ariaLabel="Touche 0">
        0
      </KeypadButton>

      <KeypadButton 
        onClick={() => onKeyPress('backspace')} 
        ariaLabel="Effacer le dernier caractère"
        className="bg-surface-container-high text-tertiary"
      >
        <Delete size={24} />
      </KeypadButton>
    </section>
  );
};

export default Keypad;
