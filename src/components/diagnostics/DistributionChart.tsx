import React, { useEffect, useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DistributionChartProps {
  subMetersPercentage: number;
  lossesPercentage: number;
  subMetersLabel: string;
  lossesLabel: string;
}

interface ChartTheme {
  primary: string;
  secondary: string;
  surface: string;
  onSurface: string;
}

const DistributionChart: React.FC<DistributionChartProps> = ({ 
    subMetersPercentage, 
    lossesPercentage, 
    subMetersLabel,
    lossesLabel 
}) => {
    const [chartColors, setChartColors] = useState<ChartTheme | null>(null);

    useEffect(() => {
        const updateColors = () => {
            const styleSource = getComputedStyle(document.body);
            const getVar = (name: string, fallback: string) => styleSource.getPropertyValue(name).trim() || fallback;

            setChartColors({
                primary: getVar('--color-primary', '#047857'),
                secondary: getVar('--color-warning', '#B45309'),
                surface: getVar('--color-surface-container', '#FFFFFF'),
                onSurface: getVar('--color-on-surface', '#18212F'),
            });
        };

        updateColors();

        const observer = new MutationObserver(updateColors);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "style"],
        });

        return () => observer.disconnect();
    }, []);

    const data: ChartData<'doughnut'> | null = useMemo(() => {
        if (!chartColors) return null;

        return {
            labels: [subMetersLabel, lossesLabel],
            datasets: [
                {
                    data: [subMetersPercentage, lossesPercentage],
                    backgroundColor: [
                        `color-mix(in srgb, ${chartColors.primary} 85%, transparent)`,
                        `color-mix(in srgb, ${chartColors.secondary} 85%, transparent)`,
                    ],
                    borderColor: [chartColors.primary, chartColors.secondary],
                    borderWidth: 2,
                    borderAlign: 'inner',
                },
            ],
        };
    }, [subMetersPercentage, lossesPercentage, subMetersLabel, lossesLabel, chartColors]);

    const options: ChartOptions<'doughnut'> | undefined = useMemo(() => {
        if (!chartColors) return undefined;

        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: `color-mix(in srgb, ${chartColors.onSurface} 95%, transparent)`,
                    titleColor: `color-mix(in srgb, ${chartColors.surface} 95%, transparent)`,
                    bodyColor: `color-mix(in srgb, ${chartColors.surface} 80%, transparent)`,
                    borderColor: `color-mix(in srgb, ${chartColors.surface} 15%, transparent)`,
                    borderWidth: 1,
                },
            },
        };
    }, [chartColors]);
    
    if (!data || !options) {
        return (
            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Vous pouvez mettre un spinner ici si vous le souhaitez */}
            </div>
        );
    }

    return (
      <div className="relative w-48 h-48">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-secondary">
            {lossesPercentage.toFixed(1)}%
          </span>
          <span className="text-sm text-on-surface-variant">
            {lossesLabel}
          </span>
        </div>
      </div>
    );
};

export default DistributionChart;
