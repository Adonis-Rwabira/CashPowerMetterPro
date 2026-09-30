import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
    getHistoryEvents, 
    HistoryEvent, 
    deleteReading, 
    deleteTopup, 
    getAllMeters, 
    addReading, 
    addTopup,
    getGlobalMeter
} from '../db/repositories';
import { ReadingEntity, TopupEntity, MeterEntity } from '../db/database';
import { Arithmetics } from '../core/arithmetics';
import { getDailyAverageConsumption, getEstimatedDaysRemaining } from '../core/prediction';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, ChevronLeft, SlidersHorizontal, Trash2, TrendingUp, Clock, ChevronDown, Sigma, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showUndoToast } from '../utils/toast';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { ChartData } from 'chart.js';

// Updated state to hold both total and unaccounted average for the global view
interface PredictionState {
    average: number; 
    totalAverage?: number; // Optional: for global view
    days: number | typeof Infinity | null;
}

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { meterId: meterIdFromUrl } = useParams<{ meterId?: string }>();
  
  const allMeters = useLiveQuery<MeterEntity[]>(() => getAllMeters(), []);
  const globalMeter = useLiveQuery<MeterEntity | undefined>(() => getGlobalMeter(), []);

  const [filterMeterId, setFilterMeterId] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [prediction, setPrediction] = useState<PredictionState>({ average: 0, days: null });
  const [meterExists, setMeterExists] = useState<boolean>(true);

  useEffect(() => {
    if (meterIdFromUrl) {
      if (allMeters) { // Ensure meters are loaded
        const found = allMeters.some(m => m.id === meterIdFromUrl);
        if (found) {
          setFilterMeterId(meterIdFromUrl);
          setMeterExists(true);
        } else {
          setMeterExists(false);
        }
      }
    } else {
      setFilterMeterId('all');
      setMeterExists(true);
    }
  }, [meterIdFromUrl, allMeters]);

  const activeMeterForChart = useMemo(() => {
    if (filterMeterId === 'all') return globalMeter;
    return allMeters?.find(m => m.id === filterMeterId);
  }, [filterMeterId, allMeters, globalMeter]);

  const historyEvents = useLiveQuery<HistoryEvent[]>(() => getHistoryEvents(filterMeterId === 'all' ? undefined : filterMeterId), [filterMeterId]) || [];
  
  const { chartData, chartStatus } = useMemo(() => {
    const balanceHistory: { x: Date; y: number }[] = [];
    let runningBalance = activeMeterForChart?.current_cached_balance ?? 0;
    balanceHistory.push({ x: new Date(), y: Arithmetics.fromScaled(runningBalance) });
    
    [...historyEvents].reverse().forEach(event => {
        if (event.eventType === 'reading') {
            runningBalance += event.delta_consumption;
        } else {
            runningBalance -= event.amount_units;
        }
        balanceHistory.push({ x: new Date(event.recorded_at), y: Arithmetics.fromScaled(runningBalance) });
    });
    
    let status: 'primary' | 'warning' | 'error' = 'primary';
    if (prediction.days !== null) {
      if (prediction.days <= 0) status = 'error';
      else if (prediction.days <= 3) status = 'warning';
    }

    const data: ChartData<'line'> = {
      labels: balanceHistory.map(d => d.x),
      datasets: [{
          label: t('history.chart.balance'),
          data: balanceHistory.map(d => d.y),
          fill: true,
      }]
    };
    
    return { chartData: data, chartStatus: status };
  }, [historyEvents, activeMeterForChart, prediction.days, t]);

  useEffect(() => {
    const updatePredictions = async () => {
      if (!activeMeterForChart) {
        setPrediction({ average: 0, days: null });
        return;
      }

      const days = await getEstimatedDaysRemaining(activeMeterForChart.id, activeMeterForChart.current_cached_balance);

      if (activeMeterForChart.type === 'GLOBAL' && allMeters) {
        const globalAvg = await getDailyAverageConsumption(activeMeterForChart.id);
        const subMeters = allMeters.filter(m => m.type === 'SUB_METER');
        const subMeterAvgs = await Promise.all(subMeters.map(sm => getDailyAverageConsumption(sm.id)));
        const subMetersTotalAvg = subMeterAvgs.reduce((sum, avg) => sum + avg, 0);
        const unaccountedAvg = globalAvg - subMetersTotalAvg;
        
        setPrediction({ average: unaccountedAvg, totalAverage: globalAvg, days });
      } else {
        const avg = await getDailyAverageConsumption(activeMeterForChart.id);
        setPrediction({ average: avg, days });
      }
    };
    updatePredictions();
  }, [activeMeterForChart, allMeters]);

  const handleDelete = async (item: HistoryEvent) => {
    if (item.eventType === 'reading') {
        const readingToRestore = { ...item } as ReadingEntity;
        await deleteReading(item.id);
        showUndoToast(t('history.readingDeleted'), () => addReading(readingToRestore));
    } else {
        const topupToRestore = { ...item } as TopupEntity;
        await deleteTopup(item.id);
        showUndoToast(t('history.topupDeleted'), () => addTopup(topupToRestore));
    }
  };
  
  if (allMeters && !meterExists) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AlertCircle size={48} className="text-error mb-4" />
        <h2 className="text-xl font-semibold text-on-surface mb-2">{t('history.meterNotFound.title')}</h2>
        <p className="text-on-surface-variant">{t('history.meterNotFound.message')}</p>
        <Link to="/history" className="mt-6 bg-primary text-on-primary px-4 py-2 rounded-lg font-medium">
          {t('history.meterNotFound.button')}
        </Link>
      </div>
    );
  }

  const renderHeader = () => {
    const selectedMeterLabel = activeMeterForChart?.label || t('history.filter.all');
    const pageMeter = allMeters?.find(m => m.id === meterIdFromUrl);

    if (pageMeter) {
        return (
          <div className="flex items-center justify-between">
              <Link to="/dashboard" className="p-2 rounded-full hover:bg-surface-container-high"><ChevronLeft size={20} /></Link>
              <h1 className="text-lg font-semibold truncate text-center flex-1">{t('history.title', {meterName: pageMeter.label})}</h1>
              <Link to={`/settings/meter/${pageMeter.id}`} className="p-2 rounded-full hover:bg-surface-container-high"><SlidersHorizontal size={20} /></Link>
        </div>
        )
    }
    return (
        <div className='flex flex-col gap-2'>
            <h1 className="text-lg font-semibold">{t('history.allEvents')}</h1>
             <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full mt-1 bg-surface-container-low p-3 rounded-lg text-on-surface font-medium text-sm flex justify-between items-center text-left shadow-sm">
                    <span>{selectedMeterLabel}</span>
                    <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-surface-container-high rounded-lg shadow-lg max-h-60 overflow-auto animate-fade-in-up">
                        <button onClick={() => { setFilterMeterId('all'); setIsDropdownOpen(false); }} className="w-full text-left p-3 text-sm hover:bg-surface-container-highest">{t('history.filter.all')}</button>
                        {allMeters?.filter(m => m.type === 'SUB_METER').map(m => (
                            <button key={m.id} onClick={() => { setFilterMeterId(m.id); setIsDropdownOpen(false); }} className="w-full text-left p-3 text-sm hover:bg-surface-container-highest">{m.label}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
  }

  const renderEventItem = (item: HistoryEvent, index: number) => {
    const meterOfEvent = allMeters?.find(m => m.id === item.meter_id);
    const isLastEvent = index === 0;
    const deleteButton = isLastEvent ? (
        <button onClick={() => handleDelete(item)} className="p-2 rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container"><Trash2 size={16} /></button>
    ) : <div className="w-10 h-10"></div>;

    if (item.eventType === 'reading') {
      return (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-3">
              <div className='w-8 h-8 rounded-lg bg-error-container flex items-center justify-center'><ArrowDown size={18} className="text-on-error-container"/></div>
              <div>
                <p className="text-sm font-medium text-on-surface">{t('history.readingLabel')} {filterMeterId === 'all' && <span className='text-xs text-on-surface-variant'>({meterOfEvent?.label})</span>}</p>
                <p className="text-xs text-on-surface-variant">{format(new Date(item.recorded_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="text-sm font-mono font-medium text-error">-{Arithmetics.formatLCD(item.delta_consumption)} {meterOfEvent?.unit_type}</p>
                    <p className="text-xs font-mono text-on-surface-variant">{Arithmetics.formatLCD(item.index_value)}</p>
                </div>
                {deleteButton}
            </div>
          </div>
      )
    }

    return (
        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className='w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center'><ArrowUp size={18} className="text-on-primary-container"/></div>
            <div>
              <p className="text-sm font-medium text-on-surface">{t('history.topupLabel')} {filterMeterId === 'all' && <span className='text-xs text-on-surface-variant'>({meterOfEvent?.label})</span>}</p>
              <p className="text-xs text-on-surface-variant">{format(new Date(item.recorded_at), 'dd MMM yyyy, HH:mm')}</p>
            </div>
          </div>
           <div className="flex items-center gap-2">
                <div className="text-right"><p className="text-sm font-mono font-medium text-primary">+{Arithmetics.formatLCD(item.amount_units)} {meterOfEvent?.unit_type}</p></div>
                {deleteButton}
            </div>
        </div>
    )
  }

  const renderPredictionInfo = () => {
      const days = prediction.days;
      let daysText = '--';
      if(days === Infinity) {
          daysText = t('units.infinite');
      } else if (days !== null) {
        daysText = days > 0 ? `${Math.floor(days)} ${t('units.days')}` : t('meterCard.inDeficit');
      }

      const daysColorClass = days !== null && days <= 3 && days > 0 ? 'text-warning' : days !== null && days <= 0 ? 'text-error' : 'text-on-surface';
      const isGlobalView = activeMeterForChart?.type === 'GLOBAL';

      return (
         <div className="border-t border-outline/20 mt-4 pt-4 flex flex-col gap-4">
              {isGlobalView && prediction.totalAverage !== undefined && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><Sigma className="text-on-surface-variant w-5 h-5 flex-shrink-0" /><p className="text-xs text-on-surface-variant">{t('history.prediction.totalDailyAvg')}</p></div>
                    <p className="text-base font-bold font-mono text-on-surface">{Arithmetics.formatLCD(prediction.totalAverage)}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><TrendingUp className="text-on-surface-variant w-5 h-5 flex-shrink-0" /><p className="text-xs text-on-surface-variant">{isGlobalView ? t('history.prediction.unaccountedConsumption') : t('history.prediction.dailyAvg')}</p></div>
                  <p className="text-base font-bold font-mono text-on-surface">{Arithmetics.formatLCD(prediction.average)}</p>
              </div>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Clock className="text-on-surface-variant w-5 h-5 flex-shrink-0" /><p className="text-xs text-on-surface-variant">{t('history.prediction.estimatedRemaining')}</p></div>
                  <p className={`text-base font-bold font-mono ${daysColorClass}`}>{daysText}</p>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {renderHeader()}

      <div className="bg-surface-container p-3 sm:p-4 rounded-2xl shadow-sm">
        <div style={{height: '220px'}}>
            <TimeSeriesChart data={chartData} status={chartStatus} />
        </div>
        {renderPredictionInfo()}
      </div>
      
      <div className="space-y-2">
        {historyEvents.length === 0 ? (
            <div className="text-center p-8 bg-surface-container-low rounded-xl border border-outline/30"><p className="text-on-surface-variant">{t('history.noEvents')}</p></div>
        ) : (
            historyEvents.map(renderEventItem)
        )}
      </div>
    </div>
  )
}

export default HistoryPage;
