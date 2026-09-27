import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  ChartData
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface TimeSeriesChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, options }) => {
  const [themeColors, setThemeColors] = useState({
    grid: 'rgba(255, 255, 255, 0.1)',
    ticks: '#94a3b8',
    legend: '#cbd5e1'
  });

  useEffect(() => {
    // Cette fonction s'exécute côté client et peut accéder aux styles calculés du DOM.
    const rootStyle = getComputedStyle(document.documentElement);
    const gridColor = rootStyle.getPropertyValue('--color-outline-variant').trim();
    const tickColor = rootStyle.getPropertyValue('--color-on-surface-variant').trim();
    const legendColor = rootStyle.getPropertyValue('--color-on-surface').trim();
    
    setThemeColors({
      grid: gridColor || 'rgba(255, 255, 255, 0.1)',
      ticks: tickColor || '#94a3b8',
      legend: legendColor || '#cbd5e1'
    });
  }, []); // Le tableau vide assure que cela ne s'exécute qu'une fois après le montage.

  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'PPP p',
          displayFormats: {
            day: 'MMM d',
            month: 'MMM yyyy'
          }
        },
        grid: {
            color: themeColors.grid
        },
        ticks: {
            color: themeColors.ticks
        }
      },
      y: {
        beginAtZero: true,
        grid: {
            color: themeColors.grid
        },
        ticks: {
            color: themeColors.ticks
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: themeColors.legend
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
  };

  return <div style={{ height: '300px' }}><Line options={options || defaultOptions} data={data} /></div>;
};

export default TimeSeriesChart;
