import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
    getHistoryEvents, 
    getMeterById, 
    HistoryEvent, 
    deleteReading, 
    deleteTopup, 
    getAllMeters, 
    addReading, 
    addTopup
} from '../db/repositories';
import { ReadingEntity, TopupEntity } from '../db/database';
import { Arithmetics } from '../core/arithmetics';
import { getDailyAverageConsumption, getEstimatedDaysRemaining } from '../core/prediction';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, ChevronLeft, SlidersHorizontal, Trash2, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showUndoToast } from '../utils/toast';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { ChartData } from 'chart.js';

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { meterId } = useParams<{ meterId?: string }>();
  
  const [filterMeterId, setFilterMeterId] = useState<string>(meterId || 'all');
  const [prediction, setPrediction] = useState<{ average: number; days: number | typeof Infinity | null }>({ average: 0, days: null });

  const meter = useLiveQuery(() => meterId ? getMeterById(meterId) : Promise.resolve(undefined), [meterId]);
  const allMeters = useLiveQuery(() => getAllMeters(), []);
  const historyEvents = useLiveQuery(() => getHistoryEvents(filterMeterId === 'all' ? undefined : filterMeterId), [filterMeterId]) || [];
  
  const chartData: ChartData<'line'> = useMemo(() => {
    // On crée une série temporelle de soldes
    let runningBalance = meter?.current_cached_balance ?? 0;
    const balanceHistory: { x: Date, y: number }[] = [{ x: new Date(), y: Arithmetics.fromScaled(runningBalance) }];

    historyEvents.forEach(event => {
        if (event.eventType === 'reading') {
            runningBalance += event.delta_consumption;
        }
        if (event.eventType === 'topup') {
            runningBalance -= event.amount_units;
        }
        balanceHistory.unshift({ x: new Date(event.recorded_at), y: Arithmetics.fromScaled(runningBalance) });
    });
    
    return {
      labels: balanceHistory.map(d => d.x),
      datasets: [
        {
          label: t('history.chart.balance'),
          data: balanceHistory.map(d => d.y),
          borderColor: 'var(--color-primary)',
          backgroundColor: 'rgba(0, 230, 118, 0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y',
        },
      ]
    };
  }, [historyEvents, t, meter]);

  useEffect(() => {
    const updatePredictions = async () => {
      const id = filterMeterId !== 'all' ? filterMeterId : null;
      if (id) {
        const avg = await getDailyAverageConsumption(id);
        const m = await getMeterById(id);
        const days = m ? await getEstimatedDaysRemaining(id, m.current_cached_balance) : null;
        setPrediction({ average: avg, days: days });
      }
    };
    updatePredictions();
  }, [filterMeterId]);


  const handleDelete = async (item: HistoryEvent) => {
    if (item.eventType === 'reading') {
      const readingToRestore: Omit<ReadingEntity, 'id' | 'delta_consumption'> = { 
        meter_id: item.meter_id, 
        index_value: item.index_value, 
        recorded_at: item.recorded_at, 
        created_at: item.created_at,
        notes: item.notes,
        is_rollover: item.is_rollover,
      };

      await deleteReading(item.id);

      showUndoToast(t('history.readingDeleted'), async () => {
        await addReading(readingToRestore);
      });

    } else if (item.eventType === 'topup') {
        const topupToRestore: TopupEntity = {
            id: item.id,
            meter_id: item.meter_id,
            amount_units: item.amount_units,
            recorded_at: item.recorded_at,
            created_at: item.created_at,
        };

      await deleteTopup(item.id);

      showUndoToast(t('history.topupDeleted'), async () => {
        await addTopup(topupToRestore);
      });
    }
  };

  const renderHeader = () => {
    if (meter) {
        return (
          <div className="flex items-center justify-between">
              <Link to="/dashboard" className="p-2 rounded-full hover:bg-surface-container-high">
              <ChevronLeft size={20} />
              </Link>
              <h1 className="text-lg font-semibold truncate text-center flex-1">{t('history.title', {meterName: meter.label})}</h1>
              <Link to={`/settings/meter/${meter.id}`} className="p-2 rounded-full hover:bg-surface-container-high">
                  <SlidersHorizontal size={20} />
              </Link>
        </div>
        )
      }
      return (
          <div className='flex flex-col gap-2'>
              <h1 className="text-lg font-semibold">{t('history.allEvents')}</h1>
              <select value={filterMeterId} onChange={(e) => setFilterMeterId(e.target.value)} className="w-full mt-1 bg-surface-container-lowest p-2 rounded-md text-on-surface font-mono text-sm">
                  <option value="all">{t('history.filter.all')}</option>
                  {allMeters?.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
              </select>
          </div>
      )
  }

  const renderEventItem = (item: HistoryEvent, index: number) => {
    const isLastEvent = index === 0;
    const deleteButton = isLastEvent ? (
        <button onClick={() => handleDelete(item)} className="p-2 rounded-full text-on-surface-variant hover:bg-error-container hover:text-on-error-container">
            <Trash2 size={16} />
        </button>
    ) : <div className="w-10 h-10"></div>;

    if (item.eventType === 'reading') {
      return (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-3">
              <div className='w-8 h-8 rounded-lg bg-error-container flex items-center justify-center'>
                  <ArrowDown size={18} className="text-on-error-container"/>
              </div>
              <div>
                <p className="text-sm font-medium text-on-surface">{t('history.readingLabel')}</p>
                <p className="text-xs text-on-surface-variant">{format(new Date(item.recorded_at), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-right">
                    <p className="text-sm font-mono font-medium text-error">-{Arithmetics.formatLCD(item.delta_consumption)} {allMeters?.find(m=>m.id === item.meter_id)?.unit_type}</p>
                    <p className="text-xs font-mono text-on-surface-variant">{Arithmetics.formatLCD(item.index_value)}</p>
                </div>
                {deleteButton}
            </div>
          </div>
      )
    }

    if (item.eventType === 'topup') {
        return (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className='w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center'>
                    <ArrowUp size={18} className="text-on-primary-container"/>
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{t('history.topupLabel')}</p>
                  <p className="text-xs text-on-surface-variant">{format(new Date(item.recorded_at), 'dd MMM yyyy, HH:mm')}</p>
                </div>
              </div>
               <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-sm font-mono font-medium text-primary">+{Arithmetics.formatLCD(item.amount_units)} {allMeters?.find(m=>m.id === item.meter_id)?.unit_type}</p>
                    </div>
                    {deleteButton}
                </div>
            </div>
        )
    }
    return null;
  }

  const renderPredictionInfo = () => {
      const id = filterMeterId !== 'all' ? filterMeterId : null;
      if (!id) return null;

      const days = prediction.days;
      let daysText = '--';
      if(days === Infinity) {
          daysText = t('units.infinite');
      } else if (days !== null && days > 0) {
        daysText = `${Math.floor(days)} ${t('units.days')}`;
      }

      return (
          <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
                  <TrendingUp className="text-on-surface-variant" />
                  <div>
                      <p className="text-sm text-on-surface-variant">{t('history.prediction.dailyAvg')}</p>
                      <p className="text-lg font-bold font-mono text-on-surface">{Arithmetics.formatLCD(prediction.average)}</p>
                  </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4">
                  <Clock className="text-on-surface-variant" />
                  <div>
                      <p className="text-sm text-on-surface-variant">{t('history.prediction.estimatedRemaining')}</p>
                      <p className="text-lg font-bold font-mono text-on-surface">{daysText}</p>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-4">
      {renderHeader()}

      <div className="bg-surface-container p-2 sm:p-4 rounded-xl">
        <TimeSeriesChart data={chartData} />
        {renderPredictionInfo()}
      </div>
      
      <div className="space-y-3">
        {historyEvents.length === 0 ? (
            <div className="text-center p-8 bg-surface-container-low rounded-xl border border-outline/50">
                <p className="text-on-surface-variant">{t('history.noEvents')}</p>
            </div>
        ) : (
            historyEvents.map(renderEventItem)
        )}
      </div>
    </div>
  )
}

export default HistoryPage;
