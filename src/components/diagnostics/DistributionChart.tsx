import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DistributionChartProps {
  subMetersPercentage: number;
  lossesPercentage: number;
  subMetersLabel: string;
  lossesLabel: string;
}

const DistributionChart: React.FC<DistributionChartProps> = ({ 
    subMetersPercentage, 
    lossesPercentage, 
    subMetersLabel, 
    lossesLabel 
}) => {
    const [themeColors, setThemeColors] = useState({
        primary: '#00E5FF',
        error: '#FF1744',
        surface: '#1E232E',
        onSurface: '#FFFFFF'
      });
    
      useEffect(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        setThemeColors({
          primary: rootStyle.getPropertyValue('--color-primary').trim(),
          error: rootStyle.getPropertyValue('--color-error').trim(),
          surface: rootStyle.getPropertyValue('--color-surface-container').trim(),
          onSurface: rootStyle.getPropertyValue('--color-on-surface').trim(),
        });
      }, []);

  const data = {
    labels: [subMetersLabel, lossesLabel],
    datasets: [
      {
        data: [subMetersPercentage, lossesPercentage],
        backgroundColor: [
            themeColors.primary,
            themeColors.error,
        ],
        borderColor: themeColors.surface,
        borderWidth: 4,
        hoverBorderColor: themeColors.onSurface,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', 
    plugins: {
      legend: {
        display: false, // On peut l'enlever car les labels sont clairs
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed.toFixed(1) + '%';
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="relative w-48 h-48">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold" style={{ color: themeColors.error }}>
          {lossesPercentage.toFixed(1)}%
        </span>
        <span className="text-sm" style={{ color: themeColors.onSurface }}>
          {lossesLabel}
        </span>
      </div>
    </div>
  );
};

export default DistributionChart;
