import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Arithmetics } from '../core/arithmetics';
import { getFinancialHistory, FinancialHistoryEntry } from '../core/reconciliation';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DistributionChart from '../components/diagnostics/DistributionChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import type { ChartData } from 'chart.js';

const getFinancialStatus = (balance: number, t: (key: string) => string) => {
    if (balance > 50000) {
        return {
            text: t('financialStatus.significantDebt'),
            icon: <TrendingDown size={12} />,
            color: 'text-error',
            bgColor: 'bg-error-container',
            textColorOnBg: 'text-on-error-container'
        };
    }
    if (balance > 1000) {
        return {
            text: t('financialStatus.slightDebt'),
            icon: <AlertTriangle size={12} />,
            color: 'text-secondary',
            bgColor: 'bg-secondary-container',
            textColorOnBg: 'text-on-secondary-container'
        };
    }
    if (balance < -10000) {
        return {
            text: t('financialStatus.inAdvance'),
            icon: <TrendingUp size={12} />,
            color: 'text-tertiary',
            bgColor: 'bg-tertiary-container',
            textColorOnBg: 'text-on-tertiary-container'
        };
    }
    return {
        text: t('financialStatus.balanced'),
        icon: <CheckCircle size={12} />,
        color: 'text-primary',
        bgColor: 'bg-primary-container',
        textColorOnBg: 'text-on-primary-container'
    };
}

const DiagnosticPage: React.FC = () => {
  const { t } = useTranslation();
  const readings = useLiveQuery(() => db.readings.toArray());
  const topups = useLiveQuery(() => db.topups.toArray());
  const history = useLiveQuery(() => getFinancialHistory(90), []);

  const { totalConsumedUnits, totalPaidUnits, financialBalance, status } = useMemo(() => {
    if (!readings || !topups) {
        const emptyBalance = { totalConsumedUnits: 0, totalPaidUnits: 0, financialBalance: 0 };
        return { ...emptyBalance, status: getFinancialStatus(0, t) };
    }
    const balance = Arithmetics.calculateFinancialBalance(readings, topups);
    return { ...balance, status: getFinancialStatus(balance.financialBalance, t) };
  }, [readings, topups, t]);

  const chartData: ChartData<'line'> = useMemo(() => {
    if (!history) return { labels: [], datasets: [] };
    
    return {
      labels: history.map((h: FinancialHistoryEntry) => new Date(h.date)),
      datasets: [
        {
          label: t('diagnostics.chart.consumed'),
          data: history.map((h: FinancialHistoryEntry) => Arithmetics.fromScaled(h.cumulativeConsumed)),
          borderColor: 'var(--color-secondary)',
          backgroundColor: 'rgba(255, 179, 0, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
            label: t('diagnostics.chart.paid'),
            data: history.map((h: FinancialHistoryEntry) => Arithmetics.fromScaled(h.cumulativePaid)),
            borderColor: 'var(--color-primary)',
            backgroundColor: 'rgba(0, 230, 118, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
        },
      ]
    };
  }, [history, t]);

  if (!readings || !topups || !history) {
    return <div className="p-4 text-center">{t('diagnostics.loading')}</div>;
  }
  
  const paidPercentage = (totalConsumedUnits + totalPaidUnits > 0)
    ? (totalPaidUnits / (totalConsumedUnits + totalPaidUnits)) * 100
    : 50;

  return (
    <div className="flex flex-col w-full gap-4">
        <section className={`w-full bg-surface-container-low rounded-xl p-4 border border-outline/50`}>
            <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-on-surface-variant font-mono">{t('diagnostics.financialBalance')}</span>
                <div className={`flex items-center gap-1.5 font-mono font-medium px-2 py-0.5 rounded-full text-xs ${status.bgColor} ${status.textColorOnBg}`}>
                    {status.icon}
                    {status.text}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-2 space-y-2 text-sm font-mono">
                    <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant">{t('diagnostics.totalConsumed')}</span>
                        <span className="font-semibold text-on-surface">{Arithmetics.formatLCD(totalConsumedUnits)} {t('units.kw')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant">{t('diagnostics.totalPaid')}</span>
                        <span className="font-semibold text-on-surface">{Arithmetics.formatLCD(totalPaidUnits)} {t('units.kw')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-outline/50">
                        <span className={`${status.color} font-medium`}>{financialBalance >= 0 ? t('diagnostics.tenantDebt') : t('diagnostics.tenantAdvance')}</span>
                        <span className={`font-semibold ${status.color}`}>{Arithmetics.formatLCD(Math.abs(financialBalance))} {t('units.kw')}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <DistributionChart 
                        subMetersPercentage={paidPercentage}
                        lossesPercentage={100 - paidPercentage}
                        subMetersLabel={t('diagnostics.paid')}
                        lossesLabel={t('diagnostics.consumed')}
                    />
                </div>
            </div>
        </section>

        <section className="w-full bg-surface-container-low rounded-xl p-2 sm:p-4 border border-outline/50">
            <h2 className="text-md font-semibold text-on-surface mb-2 px-2">{t('diagnostics.financialHistory')}</h2>
            <TimeSeriesChart data={chartData} />
        </section>
    </div>
  );
};

export default DiagnosticPage;
