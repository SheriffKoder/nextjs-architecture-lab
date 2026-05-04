'use client'
// npm install chartjs-plugin-datalabels
import React from 'react'
import PieChart, { LabelCustomization } from './PieChart'
import { ChartData } from 'chart.js'
import PieChartLegend, { PieChartLegendItem } from './PieChartLegend'

const PieChartContainer = ({
  donut = false,
  cutout = '60%',
  legend = true,
  labelPosition = 'none',
  labelTemplate,
  labelCustomization,
  title,
  data: providedData,
}: {
  donut?: boolean;
  cutout?: string | number;
  legend?: boolean;
  labelPosition?: 'inside' | 'outside' | 'none';
  labelTemplate?: (label: string, value: number, percentage: number) => string;
  labelCustomization?: LabelCustomization;
  title?: string;
  data?: ChartData<'pie'>;
}) => {
  // Colors from bar chart (first 2)
  const barChartColors = {
    paid: {
      background: 'rgba(150, 166, 207, 0.8)', // Dark blue
      border: 'rgba(37, 99, 235, 0.1)', // Border with 0.1 opacity
    },
    unpaid: {
      background: 'rgba(159, 165, 177, 0.8)', // Gray
      border: 'rgba(107, 114, 128, 0.1)', // Border with 0.1 opacity
    },
  }

  // Generate additional distinct yet close colors (similar hue family)
  // Based on the blue-gray palette, create variations
  const additionalColors = [
    { background: 'rgba(37, 69, 71, 0.8)', border: 'rgba(80, 120, 200, 0.1)' }, // Lighter blue-gray
    { background: 'rgba(99, 102, 79, 0.8)', border: 'rgba(130, 150, 180, 0.1)' }, // Light blue-gray
    { background: 'rgba(93, 72, 107, 0.8)', border: 'rgba(100, 130, 170, 0.1)' }, // Medium blue-gray
    { background: 'rgba(110, 125, 150, 0.8)', border: 'rgba(70, 100, 150, 0.1)' }, // Darker blue-gray
  ]

  // Use provided data or fallback to sample data
  const defaultChartData: ChartData<'pie'> = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          barChartColors.paid.background,      // First color from bar chart
          barChartColors.unpaid.background,    // Second color from bar chart
          additionalColors[0].background,      // Additional distinct color
          additionalColors[1].background,       // Additional distinct color
          additionalColors[2].background,       // Additional distinct color
          additionalColors[3].background,       // Additional distinct color
        ],
        borderColor: [
          barChartColors.paid.border,          // Border with 0.1 opacity
          barChartColors.unpaid.border,        // Border with 0.1 opacity
          additionalColors[0].border,          // Border with 0.1 opacity
          additionalColors[1].border,          // Border with 0.1 opacity
          additionalColors[2].border,          // Border with 0.1 opacity
          additionalColors[3].border,          // Border with 0.1 opacity
        ],
        borderWidth: 1,
      },
    ],
  };

  // If provided data doesn't have colors, add them
  const chartData: ChartData<'pie'> = providedData || defaultChartData;
  
  // Ensure colors are applied if data was provided without them
  if (providedData && providedData.datasets?.[0]) {
    const dataset = providedData.datasets[0];
    const dataLength = Array.isArray(dataset.data) ? dataset.data.length : 0;
    
    // If no backgroundColor provided, add colors
    if (!dataset.backgroundColor || (Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length === 0)) {
      const allColors = [
        barChartColors.paid.background,
        barChartColors.unpaid.background,
        ...additionalColors.map(c => c.background)
      ];
      dataset.backgroundColor = allColors.slice(0, dataLength);
    }
    
    // If no borderColor provided, add borders
    if (!dataset.borderColor || (Array.isArray(dataset.borderColor) && dataset.borderColor.length === 0)) {
      const allBorders = [
        barChartColors.paid.border,
        barChartColors.unpaid.border,
        ...additionalColors.map(c => c.border)
      ];
      dataset.borderColor = allBorders.slice(0, dataLength);
    }
    
    // Ensure borderWidth is set
    if (!dataset.borderWidth) {
      dataset.borderWidth = 1;
    }
  }

  // Prepare legend items from chart data
  const legendItems: PieChartLegendItem[] = (chartData.labels || []).map((label, index) => {
    const backgroundColor = chartData.datasets[0]?.backgroundColor;
    let color = 'rgba(0, 0, 0, 0.5)'; // default fallback color
    
    if (Array.isArray(backgroundColor)) {
      const bgColor = backgroundColor[index];
      if (typeof bgColor === 'string') {
        color = bgColor;
      }
    }
    
    return {
      label: label as string,
      color,
    };
  });

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
        {/* Legend Labels */}
        <div className='p-2 w-full mb-auto'>
          <PieChartLegend items={legendItems} className="" />
        </div>
        
        <div className='h-[50%] w-[90%] mb-auto'>
          <PieChart
            data={chartData}
            legend={false}
            scale={1}
            cutout={110}
            // donut={true}
            labelPosition='outside'
            // separatorSpacing={5}
            // separatorStyle="rectangular"
            // separatorInnerExtent={1.01}
            // glow="full"
            // glowOpacity={1}
            // glowColors={['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)']} // Optional: custom glow colors
            labelTemplate={labelTemplate}
            labelCustomization={{
              color: '#ffffff00',
              font: {
                // size: 20,
                size: 12,
                weight: '500',
              },
              // offsetX: 0,
              offsetX: 20,
            }}
            options={{
              plugins: {
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: 1,
                  padding: 12,
                  titleFont: {
                    size: 12,
                    weight: 500,
                  },
                  bodyFont: {
                    size: 9,
                    weight: 400,
                  },
                  displayColors: false, // Hide color indicator
                  // callbacks: {
                  //   title: () => '', // Remove title (which shows the label name)
                  //   label: (context) => {
                  //     const label = context.label || ''
                  //     const item = items.find((item: any) => item.label === label)
                  //     if (item) {
                  //       return [item.tooltipLabel, item.tooltipDescription]
                  //     }
                  //     return [label]
                  //   },
                  //   footer: () => '', // Remove footer
                  // },
                },
              },
            }}
          />
        </div>

        <h3 className='text-xs md:text-sm text-foreground font-medium mb-2'>{title}</h3>
    </div>
  )
}

export default PieChartContainer
