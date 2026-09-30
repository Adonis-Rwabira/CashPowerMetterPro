import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createMeter } from '../../db/repositories';
import { MeterType } from '../../db/database';
import { X, Check } from 'lucide-react';

interface AddMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  meterType: MeterType;
}

const AddMeterModal: React.FC<AddMeterModalProps> = ({ isOpen, onClose, meterType }) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [moduleNumber, setModuleNumber] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paidIndex, setPaidIndex] = useState(0);
  const [initialReserve, setInitialReserve] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setModuleNumber('');
      setCurrentIndex(0);
      setPaidIndex(0);
      setInitialReserve(0);
      setError('');
    }
  }, [isOpen, meterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (meterType === 'SUB_METER' && (currentIndex < 0 || paidIndex < 0)) {
        setError(t('addMeterModal.error.indexNegative'));
        return;
    }
    if (meterType === 'GLOBAL' && initialReserve < 0) {
        setError(t('addMeterModal.error.reserveNegative'));
        return;
    }

    try {
        const isGlobal = meterType === 'GLOBAL';
        const balance = isGlobal 
            ? Math.round(initialReserve * 1000) 
            : Math.round((paidIndex - currentIndex) * 1000);

        await createMeter({
            type: meterType,
            label: label || (isGlobal ? t('meter.globalDefaultName') : `${t('meter.subMeterDefaultName')} ${moduleNumber}`),
            module_number: isGlobal ? 'GLOBAL' : moduleNumber,
            initial_index: isGlobal ? 0 : Math.round(currentIndex * 1000),
            current_cached_index: isGlobal ? 0 : Math.round(currentIndex * 1000),
            current_cached_balance: balance,
            unit_type: 'kWh',
            status: 'ACTIVE',
            theme_color: isGlobal ? '#FFB300' : '#00E5FF',
        });
        onClose();
    } catch (err) {
        const errorMessage = (err instanceof Error) ? err.message : 'Unknown error';
        if (errorMessage.includes('already exists')) {
             setError(t('addMeterModal.error.moduleNumberExists'));
        } else {
             setError(t('addMeterModal.error.creationError'));
        }
        console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface">
                {meterType === 'GLOBAL' ? t('addMeterModal.title.global') : t('addMeterModal.title.sub')}
            </h2>
            <button onClick={onClose} className="text-on-surface-variant"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-mono uppercase text-on-surface-variant">{t('addMeterModal.label.nameOptional')}</label>
                <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="w-full mt-1 bg-surface-container-lowest p-2 rounded-md text-on-surface" />
            </div>

            {meterType === 'SUB_METER' ? (
                 <>
                    <div>
                        <label className="text-xs font-mono uppercase text-on-surface-variant">{t('addMeterModal.label.moduleNumber')}</label>
                        <input type="text" value={moduleNumber} onChange={e => setModuleNumber(e.target.value)} className="w-full mt-1 bg-surface-container-lowest p-2 rounded-md text-on-surface" required />
                    </div>
                    <div>
                        <label className="text-xs font-mono uppercase text-on-surface-variant">{t('addMeterModal.label.currentIndex')}</label>
                        <input type="number" step="0.001" value={currentIndex} onChange={e => setCurrentIndex(parseFloat(e.target.value) || 0)} className="w-full mt-1 bg-surface-container-lowest p-2 rounded-md text-on-surface" required />
                    </div>
                    <div>
                        <label className="text-xs font-mono uppercase text-on-surface-variant">{t('addMeterModal.label.paidIndex')}</label>
                        <input type="number" step="0.001" value={paidIndex} onChange={e => setPaidIndex(parseFloat(e.target.value) || 0)} className="w-full mt-1 bg-surface-container-lowest p-2 rounded-md text-on-surface" required />
                    </div>
                 </>
            ) : (
                <div>
                    <label className="text-xs font-mono uppercase text-on-surface-variant">{t('addMeterModal.label.initialReserve')}</label>
                    <input type="number" step="0.001" value={initialReserve} onChange={e => setInitialReserve(parseFloat(e.target.value) || 0)} className="w-full mt-1 bg-surface-container-lowest p-2 rounded-md text-on-surface" required />
                </div>
            )}

            {error && <p className="text-sm text-error-color">{error}</p>}

            <div className="flex justify-end pt-4">
                <button type="submit" className="h-10 px-6 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-2 text-sm">
                    <Check size={18}/>
                    {t('addMeterModal.save')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddMeterModal;
