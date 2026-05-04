'use client'

import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export interface BarChartProps {
    data: ChartData<'bar'>;
    options?: ChartOptions<'bar'>;
    height?: string | number;
    width?: string | number;
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderRadius?: number;
    hoverBackgroundColor?: string | string[];
    hoverBorderColor?: string | string[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    title?: string;
    legend?: boolean;
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    animation?: boolean;
    barPercentage?: number;
    categoryPercentage?: number;
    indexAxis?: 'x' | 'y';
    stacked?: boolean;
    xAxisTicksDisplay?: boolean;
    yAxisTicksDisplay?: boolean;
    xAxisTicksColor?: string;
    yAxisTicksColor?: string;
    xAxisTicksFontSize?: number;
    yAxisTicksFontSize?: number;
    xAxisGridDisplay?: boolean;
    yAxisGridDisplay?: boolean;
    xAxisGridColor?: string;
    yAxisGridColor?: string;
}
  

// Register all Chart.js components
Chart.register(...registerables, ChartDataLabels);

const BarChart: React.FC<BarChartProps> = ({
  // The data to be displayed in the chart (labels and datasets)
  data,
  
  // Additional Chart.js options for advanced customization
  options = {},
  
  // Height of the chart container - can be any CSS value (px, %, vh, etc.)
  height = '100%',
  
  // Width of the chart container - can be any CSS value (px, %, vw, etc.)
  width = '100%',
  
  // Background color of the bars (can be a single color or array of colors)
  backgroundColor = 'rgba(75, 192, 192, 0.2)',
  
  // Border color of the bars (can be a single color or array of colors)
  borderColor = 'rgba(75, 192, 192, 1)',
  
  // Width of the border around each bar in pixels
  borderWidth = 1,
  
  // Radius of the bar corners in pixels (0 = sharp corners)
  borderRadius = 4,
  
  // Background color when hovering over a bar
  hoverBackgroundColor = 'rgba(75, 192, 192, 0.4)',
  
  // Border color when hovering over a bar
  hoverBorderColor = 'rgba(75, 192, 192, 1)',
  
  // Label for the x-axis
  xAxisLabel = '',
  
  // Label for the y-axis
  yAxisLabel = '',
  
  // Title displayed at the top of the chart
  title = '',
  
  // Whether to display the legend (true = show, false = hide)
  legend = true,
  
  // Whether the chart should resize when its container resizes
  responsive = true,
  
  // If false, the chart will take the full size of its container
  // If true, it will maintain its aspect ratio
  maintainAspectRatio = false,
  
  // Whether to animate the chart when it's first rendered or updated
  // When true, bars will animate from zero to their actual value
  // When false, bars will appear instantly without animation
  animation = true,
  
  // Controls the width of each bar relative to the category width
  // Value between 0 and 1 (1 = bars fill their category width completely)
  // Example: 0.9 means each bar takes up 90% of the available category width
  barPercentage = 0.9,
  
  // Controls the width of each category relative to the x-axis scale
  // Value between 0 and 1 (1 = categories fill the entire x-axis)
  // Example: 0.8 means each category takes up 80% of the available x-axis width
  // The difference between categories creates the spacing between groups of bars
  categoryPercentage = 0.8,
  
  // Determines whether bars are vertical ('x') or horizontal ('y')
  // 'x' = vertical bars (default)
  // 'y' = horizontal bars
  indexAxis = 'x',
  
  // Whether multiple datasets should be stacked on top of each other
  // When true, multiple datasets will be stacked (values add up)
  // When false, datasets will be displayed side by side
  stacked = false,

  // Whether to display ticks on the x-axis (true = show, false = hide)
  xAxisTicksDisplay = true,
  
  // Whether to display ticks on the y-axis (true = show, false = hide)
  yAxisTicksDisplay = true,
  
  // Color of the x-axis ticks (labels and tick marks)
  xAxisTicksColor = '#666',
  
  // Color of the y-axis ticks (labels and tick marks)
  yAxisTicksColor = '#666',
  
  // Font size of the x-axis ticks in pixels
  xAxisTicksFontSize = 12,
  
  // Font size of the y-axis ticks in pixels
  yAxisTicksFontSize = 12,
  
  // Whether to display grid lines for the x-axis (true = show, false = hide)
  xAxisGridDisplay = true,
  
  // Whether to display grid lines for the y-axis (true = show, false = hide)
  yAxisGridDisplay = true,
  
  // Color of the x-axis grid lines
  xAxisGridColor = 'rgba(0, 0, 0, 0.1)',
  
  // Color of the y-axis grid lines
  yAxisGridColor = 'rgba(0, 0, 0, 0.1)',
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor !== undefined ? dataset.backgroundColor : backgroundColor,
          borderColor: dataset.borderColor !== undefined ? dataset.borderColor : borderColor,
          borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : borderWidth,
          borderRadius: dataset.borderRadius !== undefined ? dataset.borderRadius : borderRadius,
          hoverBackgroundColor: dataset.hoverBackgroundColor !== undefined ? dataset.hoverBackgroundColor : hoverBackgroundColor,
          hoverBorderColor: dataset.hoverBorderColor !== undefined ? dataset.hoverBorderColor : hoverBorderColor,
          barPercentage: dataset.barPercentage !== undefined ? dataset.barPercentage : barPercentage,
          categoryPercentage: dataset.categoryPercentage !== undefined ? dataset.categoryPercentage : categoryPercentage,
        })),
      },
      options: {
        ...options,
        responsive,
        maintainAspectRatio,
        plugins: {
          ...options.plugins,
          title: {
            display: !!title,
            text: title,
            ...options.plugins?.title,
          },
          legend: {
            display: legend,
            ...options.plugins?.legend,
          },
        },
        scales: {
          x: {
            title: {
              display: !!xAxisLabel,
              text: xAxisLabel,
            },
            stacked,
            // Apply x-axis ticks and grid customization
            ticks: {
              display: xAxisTicksDisplay,
              color: xAxisTicksColor,
              font: {
                size: xAxisTicksFontSize,
                ...options.scales?.x?.ticks?.font,
              },
              ...options.scales?.x?.ticks,
            },
            grid: {
              display: xAxisGridDisplay,
              color: xAxisGridColor,
              ...options.scales?.x?.grid,
            },
            ...options.scales?.x,
          },
          y: {
            title: {
              display: !!yAxisLabel,
              text: yAxisLabel,
            },
            stacked,
            // Apply y-axis ticks and grid customization
            ticks: {
              display: yAxisTicksDisplay,
              color: yAxisTicksColor,
              font: {
                size: yAxisTicksFontSize,
                ...options.scales?.y?.ticks?.font,
              },
              ...options.scales?.y?.ticks,
            },
            grid: {
              display: yAxisGridDisplay,
              color: yAxisGridColor,
              ...options.scales?.y?.grid,
            },
            ...options.scales?.y,
          },
        },
        indexAxis,
        animation: animation ? undefined : false,
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [
    data,
    options,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    hoverBackgroundColor,
    hoverBorderColor,
    xAxisLabel,
    yAxisLabel,
    title,
    legend,
    responsive,
    maintainAspectRatio,
    animation,
    barPercentage,
    categoryPercentage,
    indexAxis,
    stacked,
    // Add new dependencies
    xAxisTicksDisplay,
    yAxisTicksDisplay,
    xAxisTicksColor,
    yAxisTicksColor,
    xAxisTicksFontSize,
    yAxisTicksFontSize,
    xAxisGridDisplay,
    yAxisGridDisplay,
    xAxisGridColor,
    yAxisGridColor,
  ]);

  return (
    <div style={{ height, width, position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChart;
