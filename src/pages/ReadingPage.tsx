import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getMeterById, addReading, deleteReading } from '../db/repositories';
import { Arithmetics } from '../core/arithmetics';
import { showUndoToast } from '../utils/toast';
import Keypad from '../components/ui/Keypad';
import { TrendingUp, Wallet, CheckCircle, Gauge, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SingleMeterReadingForm: React.FC<{ meterId: string }> = ({ meterId }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const meter = useLiveQuery(() => getMeterById(meterId), [meterId]);
    const [currentInput, setCurrentInput] = useState('0');
    const [error, setError] = useState('');
    
    const isGlobal = useMemo(() => meter?.type === 'GLOBAL', [meter]);
    const lastReadingIndex = meter ? meter.current_cached_index : 0;
    const previousBalance = meter ? meter.current_cached_balance : 0;

    const { delta, newBalance } = useMemo(() => {
        const val = parseFloat(currentInput) || 0;
        if (isGlobal) {
            const calculatedDelta = Arithmetics.fromScaled(previousBalance) - val;
            return { delta: calculatedDelta, newBalance: val };
        } else {
            const basePrevious = Arithmetics.fromScaled(lastReadingIndex);
            const calculatedDelta = Math.max(0, val - basePrevious);
            const calculatedNewBalance = Arithmetics.fromScaled(previousBalance) - calculatedDelta;
            return { delta: calculatedDelta, newBalance: calculatedNewBalance };
        }
    }, [currentInput, lastReadingIndex, previousBalance, isGlobal]);

    useEffect(() => {
        if(meter && currentInput === '0') {
            const initialValue = isGlobal ? Arithmetics.formatLCD(meter.current_cached_balance) : Arithmetics.formatLCD(meter.current_cached_index);
            setCurrentInput(initialValue);
        }
    }, [meter, isGlobal]);

    const handleKeyPress = (key: string) => {
        setError('');
        if (key === 'backspace') {
            setCurrentInput(prev => {
                const newStr = prev.slice(0, -1);
                return newStr === '' ? '0' : newStr;
            });
            return;
        }
        if (key === '.' && currentInput.includes('.')) return;
        if (currentInput.replace('.', '').length >= 9) return;
        const decimalPart = currentInput.split('.')[1];
        if (decimalPart && decimalPart.length >= 3) return;
        if (currentInput === '0' && key !== '.') {
            setCurrentInput(key);
        } else {
            setCurrentInput(prev => prev + key);
        }
    };

    const handleValidate = async () => {
        setError('');
        const newValue = parseFloat(currentInput);
        if (isNaN(newValue)) return;
        const newValueScaled = Arithmetics.toScaled(newValue);

        if (!isGlobal && newValueScaled < lastReadingIndex) {
            setError(t('readingPage.error.invalidValue'));
            return;
        }
        try {
            const newReadingId = await addReading({
                meter_id: meterId,
                index_value: newValueScaled,
                recorded_at: new Date().toISOString(),
                is_rollover: false,
            });
            const undoMessage = isGlobal 
                ? `${t('history.reconciliationLabel')} (-${delta.toFixed(3)} ${meter?.unit_type})` 
                : `${t('history.readingLabel')} ${Arithmetics.formatLCD(newValueScaled)} ${meter?.unit_type}`;
            showUndoToast(undoMessage, () => deleteReading(newReadingId));
            navigate('/dashboard');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : t('readingPage.error.generic');
            setError(errorMessage);
        }
    };
    
    if (!meter) {
        return <div className="p-4 text-center text-on-surface-variant">{t('readingPage.loading')}</div>;
    }

    return (
        <div className="flex flex-col h-full justify-between select-none">
          <section className="flex-shrink-0 px-1">
              <div className="flex items-start justify-between min-w-0 p-2.5 rounded-lg bg-surface-container">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${isGlobal ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-primary'} flex items-center justify-center shrink-0`}><Gauge size={18} /></div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-mono uppercase tracking-wider text-on-surface-variant truncate">{meter.module_number}</span>
                        <span className="text-sm font-semibold tracking-tight truncate leading-tight text-on-surface">{meter.label}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-mono uppercase text-on-surface-variant">{isGlobal ? t('readingPage.currentReserve') : t('readingPage.currentIndex')}</span>
                    <span className="font-mono text-on-surface text-sm font-semibold tabular-nums tracking-tight">
                        {isGlobal ? Arithmetics.formatLCD(previousBalance) : Arithmetics.formatLCD(lastReadingIndex)}
                    </span>
                </div>
              </div>
          </section>

          {isGlobal && (
            <div className="p-3 mx-1 mt-3 text-xs text-on-tertiary-container bg-tertiary-container rounded-lg flex items-start gap-2">
                <AlertTriangle size={24} className="shrink-0"/>
                <span>{t('readingPage.globalMeterNotice')}</span>
            </div>
          )}

          <section className="flex-grow flex flex-col justify-center gap-2 px-1 my-2">
                <div className="relative text-center py-6 bg-surface-container rounded-lg flex items-center justify-center">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-3xl text-primary opacity-30">+</span>
                    <span className="font-mono text-6xl text-primary font-bold tabular-nums tracking-tighter">{currentInput}</span>
                    <span className="absolute right-4 bottom-2 font-mono text-sm text-on-surface-variant uppercase">{isGlobal ? t('readingPage.actualReserveUnit') : meter.unit_type}</span>
                </div>
          </section>

          <section className="flex-shrink-0 flex flex-col space-y-4">
            {error && (
                <div className="p-2 mx-1 text-xs text-center text-on-error-container bg-error-container rounded-lg flex items-center justify-center gap-2">
                    <X size={14}/> {error}
                </div>
            )}
            <div className="bg-surface-container-high/0 mx-1 p-3 flex items-center justify-between flex-wrap gap-y-1">
                <div className="flex items-center gap-2 min-w-0">
                    <TrendingUp size={14} className="text-secondary" />
                    <span className="text-xs font-mono uppercase text-on-surface-variant">{isGlobal ? t('readingPage.unaccountedConsumption') : t('readingPage.consumption')}:</span>
                    <span className="text-sm font-mono text-secondary font-bold tabular-nums">+{delta.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                    <Wallet size={14} className={newBalance < 0 ? "text-error" : "text-primary"}/>
                    <span className="text-xs font-mono uppercase text-on-surface-variant">{isGlobal ? t('readingPage.newReserve') : t('readingPage.newBalance')}:</span>
                    <span className={`text-sm font-mono font-bold tabular-nums ${newBalance < 0 ? 'text-error' : 'text-primary'}`}>{newBalance.toFixed(3)}</span>
                </div>
            </div>
            <div className="px-1">
                <Keypad onKeyPress={handleKeyPress} />
            </div>
            <div className="px-1 pb-1">
                <button onClick={handleValidate} className="w-full h-14 bg-primary text-on-primary rounded-xl font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.99] shadow-lg text-sm">
                    <CheckCircle size={22} />
                    <span>{isGlobal ? t('readingPage.reconcileButton') : t('readingPage.submitButton')}</span>
                </button>
            </div>
          </section>
        </div>
    );
};

const ReadingPage: React.FC = () => {
  const { meterId } = useParams<{ meterId?: string }>();
  return meterId ? <SingleMeterReadingForm meterId={meterId} /> : null;
};

export default ReadingPage;
