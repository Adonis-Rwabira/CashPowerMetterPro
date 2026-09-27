import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { MeterFont } from '../contexts/SettingsContext';
import { twMerge } from 'tailwind-merge';

interface LcdDisplayProps {
  value: number;
  unit: string;
  statusColorClass: string;
  label?: string;
  isGlobal?: boolean;
}

const getFontClass = (font: MeterFont) => {
  switch (font) {
    case 'DIGITAL_7SEG': return 'font-digital-7seg';
    case 'TECH_MONO': return 'font-tech-mono';
    case 'CLEAN_SANS': return 'font-clean-sans';
    default: return 'font-mono';
  }
};

const LcdDisplay: React.FC<LcdDisplayProps> = ({ value, unit, statusColorClass, label, isGlobal = false }) => {
  const { settings } = useSettings();

  const displayContainerClasses = twMerge(
    'transition-all duration-300 rounded-lg p-2 flex flex-col',
    settings.dialStyle === 'SKEUO_3D_REALISTIC' 
      ? 'bg-surface-container-lowest shadow-screen-inset items-center' 
      : 'items-start'
  );

  const valueClasses = twMerge(
    'font-bold tabular-nums text-2xl tracking-wider',
    statusColorClass,
    getFontClass(settings.meterFont)
  );

  const unitClasses = twMerge(
    'text-xs -mt-1 font-mono uppercase',
    statusColorClass,
    'opacity-70'
  );
  
  const labelClasses = twMerge(
    'text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1',
    settings.dialStyle === 'SKEUO_3D_REALISTIC' ? 'text-center' : 'text-left'
  )

  const valueText = value.toFixed(3);
  const signedValue = isGlobal ? valueText : (value >= 0 ? `+${valueText}` : valueText);

  return (
    <div className={displayContainerClasses}>
      {label && <span className={labelClasses}>{label}</span>}
      <div className={twMerge(
          'flex items-baseline gap-2',
          settings.dialStyle === 'SKEUO_3D_REALISTIC' ? 'justify-center' : 'justify-start'
      )}>
        <span className={valueClasses}>
          {signedValue}
        </span>
        <span className={unitClasses}>
          {unit}
        </span>
      </div>
    </div>
  );
};

export default LcdDisplay;
