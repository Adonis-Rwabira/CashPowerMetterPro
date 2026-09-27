import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { TopupEntity } from '../db/database';
import { addTopup, deleteTopup, getMeterById } from '../db/repositories';
import { Arithmetics } from '../core/arithmetics';
import { ArrowLeft } from 'lucide-react';
import Keypad from '../components/ui/Keypad';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { showUndoToast } from '../utils/toast';

const RechargePage: React.FC = () => {
  const { meterId } = useParams<{ meterId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [amountString, setAmountString] = useState('0');

  const meter = useLiveQuery(() => getMeterById(meterId!), [meterId]);
  const isGlobal = meter?.type === 'GLOBAL';

  const handleKeyPress = (key: string) => {
    setAmountString(prev => {
      if (key === 'backspace') {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (prev === '0') return key;
      // Limiter à 3 décimales
      const decimalPart = prev.split('.')[1];
      if (decimalPart && decimalPart.length >= 3) return prev;
      
      return prev + key;
    });
  };

  const handleSubmit = async () => {
    const amount = parseFloat(amountString) || 0;
    if (!meter || amount <= 0) return;

    const newTopup: Omit<TopupEntity, 'id'> = {
      meter_id: meter.id,
      amount_units: Arithmetics.toScaled(amount),
      recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    try {
      const newId = await addTopup(newTopup);
      const toastMessage = isGlobal 
        ? t('rechargePage.globalToastSuccess', { amount: amount.toFixed(3), unit: meter.unit_type })
        : t('rechargePage.subMeterToastSuccess', { amount: amount.toFixed(3), unit: meter.unit_type });

      showUndoToast(toastMessage, async () => {
        await deleteTopup(newId);
        toast(t('rechargePage.undoToast'));
      });

      navigate(-1);

    } catch (error) {
      console.error("Failed to process recharge:", error);
      toast.error(t('rechargePage.errorGeneric'));
    }
  };

  const pageTitle = isGlobal ? t('rechargePage.titleGlobal') : t('rechargePage.titleSubMeter');
  const buttonText = isGlobal ? t('rechargePage.buttonGlobal') : t('rechargePage.buttonSubMeter');
  const amount = parseFloat(amountString) || 0;

  if (!meter) {
    return <div>{t('rechargePage.loading')}</div>;
  }

  return (
    <div className="flex flex-col h-full p-4 bg-background text-on-surface">
      <div className="flex items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-surface-container">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-center flex-1">{pageTitle}</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div className="text-center">
           <p className="text-on-surface-variant">{isGlobal ? t('rechargePage.currentReserve') : t('rechargePage.currentBalance')}</p>
           <p className="text-3xl font-bold font-mono">
             {Arithmetics.formatLCD(meter.current_cached_balance || 0)} {meter.unit_type}
           </p>
            <p className="text-5xl font-mono text-primary py-4">{amountString}</p>
         </div>

        <Keypad onKeyPress={handleKeyPress} />

        <button 
          onClick={handleSubmit}
          disabled={amount <= 0}
          className="w-full mt-4 p-4 rounded-xl text-lg font-bold bg-primary text-on-primary disabled:bg-surface-container disabled:text-on-surface-variant transition-colors duration-200"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default RechargePage;
