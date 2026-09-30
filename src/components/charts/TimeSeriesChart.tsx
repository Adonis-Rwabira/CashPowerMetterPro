import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
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
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface TimeSeriesChartProps {
  data: ChartData<"line">;
  status?: "primary" | "warning" | "error";
}

interface ChartTheme {
  accent: string;
  onSurface: string;
  inverseSurface: string;
  inverseOnSurface: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  status = "primary" 
}) => {
  const [chartColors, setChartColors] = useState<ChartTheme | null>(null);

  useEffect(() => {
    const updateColors = () => {
      const styleSource = getComputedStyle(document.body);
      const getVar = (name: string, fallback: string) => styleSource.getPropertyValue(name).trim() || fallback;

      setChartColors({
        accent: getVar(`--color-${status}`, getVar('--color-primary', '#3b82f6')),
        onSurface: getVar('--color-on-surface', '#111827'),
        inverseSurface: getVar('--color-inverse-surface', '#111827'),
        inverseOnSurface: getVar('--color-inverse-on-surface', '#f8fafc'),
      });
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    return () => observer.disconnect();
  }, [status]);

  const processedData = useMemo(() => {
    if (!chartColors) return data;
    return {
      ...data,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        borderColor: chartColors.accent,
        backgroundColor: `color-mix(in srgb, ${chartColors.accent} 12%, transparent)`,
      })),
    };
  }, [data, chartColors]);

  const options: ChartOptions<"line"> | undefined = useMemo(() => {
    if (!chartColors) return undefined;

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "time",
          time: { unit: "day", tooltipFormat: "PPP p", displayFormats: { day: "MMM d" } },
          grid: { color: `color-mix(in srgb, ${chartColors.onSurface} 8%, transparent)` },
          ticks: { color: `color-mix(in srgb, ${chartColors.onSurface} 50%, transparent)`, maxRotation: 0, autoSkipPadding: 20 },
          border: { display: false },
        },
        y: {
          beginAtZero: false,
          grid: { color: `color-mix(in srgb, ${chartColors.onSurface} 8%, transparent)` },
          ticks: { color: `color-mix(in srgb, ${chartColors.onSurface} 50%, transparent)` },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: chartColors.inverseSurface,
          titleColor: chartColors.inverseOnSurface,
          bodyColor: `color-mix(in srgb, ${chartColors.inverseOnSurface} 85%, transparent)`,
          borderColor: `color-mix(in srgb, ${chartColors.accent} 40%, transparent)`,
          borderWidth: 1.5,
          titleFont: { weight: "bold" },
          padding: 12,
          caretPadding: 8,
          displayColors: false,
        },
      },
      elements: {
        point: { 
          radius: 0, 
          hitRadius: 10,
          hoverRadius: 5,
          hoverBackgroundColor: chartColors.accent,
          hoverBorderColor: chartColors.accent
        },
        line: { tension: 0.35, borderWidth: 2.5 },
      },
    };
  }, [chartColors]);

  if (!options) {
    return <div style={{ height: '100%', width: '100%' }} />;
  }

  return <Line options={options} data={processedData} />;
};

export default TimeSeriesChart;
