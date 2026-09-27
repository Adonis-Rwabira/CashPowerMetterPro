import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { MeterEntity } from '../db/database';
import { getReadingsForMeter } from '../db/repositories';
import { Arithmetics } from '../core/arithmetics';
import { useSettings } from '../contexts/SettingsContext';
import { Settings, Droplet, Zap, TrendingUp, Check, X, Plus, CreditCard } from 'lucide-react';
import LcdDisplay from './LcdDisplay';
import { useTranslation } from 'react-i18next';

interface MeterCardProps {
  meter: MeterEntity;
}

const MeterCard: React.FC<MeterCardProps> = ({ meter }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const readings = useLiveQuery(() => getReadingsForMeter(meter.id), [meter.id]);
  const monthlyConsumption = Arithmetics.calculateTotalConsumptionFromReadings(readings || []);
  const activePower = Arithmetics.calculateActivePower(readings || []);

  const balance = Arithmetics.fromScaled(meter.current_cached_balance);
  const balanceStatus = Arithmetics.getStatusFromBalance(meter.current_cached_balance);
  
  const statusInfo = {
    green: { icon: <Check size={12} />, text: t('meterCard.balanceOK'), color: 'text-primary' },
    amber: { icon: <TrendingUp size={12} />, text: t('meterCard.lowThreshold'), color: 'text-secondary' },
    red: { icon: <X size={12} />, text: t('meterCard.inDeficit'), color: 'text-error' },
  }[balanceStatus];

  const cardClasses = [
    "p-3.5", "rounded-xl", "border", "shadow-sm", "transition-all", "duration-300", "cursor-pointer",
    settings.dialStyle === 'SKEUO_3D_REALISTIC' 
      ? 'skeuo-realistic' 
      : 'bg-surface-container border-outline/50 dark:bg-surface-container-low dark:border-white/[0.06]'
  ].join(' ');

  const handleCardClick = () => {
    navigate(`/history/${meter.id}`);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (meter.type === 'SUB_METER') {
    return (
      <div className={cardClasses} onClick={handleCardClick}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 shadow-sm ${statusInfo.color}`}>
              {meter.unit_type === 'kWh' ? <Zap size={22} /> : <Droplet size={22} />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant truncate">{meter.module_number}</span>
              <span className="text-sm font-semibold tracking-tight truncate leading-tight text-on-surface">{meter.label}</span>
              <div className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </div>
            </div>
          </div>
          <Link to={`/settings/meter/${meter.id}`} onClick={stopPropagation} className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors relative z-10">
            <Settings size={18} />
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-3">
            <LcdDisplay 
                value={balance} 
                unit={meter.unit_type} 
                statusColorClass={statusInfo.color} 
                label={t('meterCard.balance')}
                isGlobal={false}
            />
            <div className='text-center text-xs text-on-surface-variant font-mono -mt-2'>
                {t('meterCard.totalReading')}: {Arithmetics.formatLCD(meter.current_cached_index)} {meter.unit_type}
            </div>

            <div className="flex items-center gap-1.5" onClick={stopPropagation}>
                <Link to={`/reading/${meter.id}`} className="flex-1 h-9 px-4 bg-surface-container active:bg-surface-bright rounded-lg font-semibold flex items-center justify-center gap-2 text-sm text-on-surface transition-colors">
                {t('meterCard.record')}
                </Link>
                <Link to={`/recharge/${meter.id}`} className="flex-1 h-9 px-4 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-2 text-sm transition-colors">
                {t('meterCard.recharge')}
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // Rendu pour GLOBAL
  return (
    <section className="w-full bg-surface-container-low rounded-2xl p-5 border border-outline/50 dark:border-white/[0.06] shadow-sm relative cursor-pointer" onClick={handleCardClick}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant">{t('meterCard.general')} {meter.label ? ` • ${meter.label}` : ''}</span>
          <h1 className="text-base font-medium text-on-surface tracking-tight mt-0.5">{t('meterCard.globalMeter')}</h1>
        </div>
        <Link to={`/settings/meter/${meter.id}`} onClick={stopPropagation} className="text-on-surface-variant/60 hover:text-on-surface-variant transition-colors relative z-10">
            <Settings size={18} />
        </Link>
      </div>

      <LcdDisplay 
        value={Arithmetics.fromScaled(meter.current_cached_balance)} 
        unit={meter.unit_type}
        statusColorClass={statusInfo.color}
        label={t('meterCard.globalReserve')}
        isGlobal={true}
      />

      <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-outline/50 dark:border-white/[0.06]">
        <div>
          <span className="text-[11px] text-on-surface-variant block font-mono">{t('meterCard.monthConsumption')}</span>
          <p className="text-sm font-medium font-mono text-on-surface mt-0.5">{Arithmetics.formatLCD(monthlyConsumption)} <span className="text-xs text-on-surface-variant">{meter.unit_type}</span></p>
        </div>
        <div>
          <span className="text-[11px] text-on-surface-variant block font-mono">{t('meterCard.activePower')}</span>
          <p className="text-sm font-medium font-mono text-on-surface mt-0.5">{activePower.toFixed(2)} <span className="text-xs text-on-surface-variant">{t('units.kw')}</span></p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 mt-5" onClick={stopPropagation}>
         <Link to={`/reading/${meter.id}`} className="h-10 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant active:scale-[0.98] transition-all font-medium text-xs flex items-center justify-center gap-2 border border-outline/50 dark:border-white/[0.08]">
          <Plus size={16} />
          {t('meterCard.record')}
        </Link>
        <Link to={`/recharge/${meter.id}`} className="h-10 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary/90 active:scale-[0.98] transition-all font-medium text-xs flex items-center justify-center gap-2">
          <CreditCard size={16} />
          {t('meterCard.recharge')}
        </Link>
      </div>
    </section>
  );
};

export default MeterCard;
