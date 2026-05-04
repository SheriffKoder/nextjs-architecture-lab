'use client'

import React, { useEffect, useState } from 'react'
import BarChart from './BarChart'
import PieChartLegend, { PieChartLegendItem } from '../piechart/PieChartLegend'
import { ChartData } from 'chart.js'

interface BarChartContainerProps {
    title: string;
    valueColors?: string[]; // RGB colors for value labels (one per dataset)
    data?: ChartData<'bar'>; // Optional chart data
}

const BarChartContainer = ({
    title,
    valueColors,
    data: providedData,
}: BarChartContainerProps) => {

// Sample data for paid/unpaid horizontal stacked bar chart (fallback)
const defaultBarChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Paid',
        data: [1200, 1900, 2300, 2800, 2500, 3200, 3100, 2900, 2700, 3000, 2800, 3200],
        backgroundColor: 'rgba(150, 166, 207, 0.8)', // Dark blue
        borderColor: 'rgba(37, 99, 235, 1)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
        hoverBorderColor: 'rgba(37, 99, 235, 1)',
      },
      {
        label: 'Unpaid',
        data: [300, 500, 400, 600, 450, 700, 650, 550, 500, 600, 550, 700],
        backgroundColor: 'rgba(159, 165, 177, 0.8)', // Gray
        borderColor: 'rgba(107, 114, 128, 1)',
        hoverBackgroundColor: 'rgba(107, 114, 128, 1)',
        hoverBorderColor: 'rgba(107, 114, 128, 1)',
      },
    ],
  };

// Use provided data or fallback to default
const paidUnpaidData = providedData || defaultBarChartData;

const [primaryColor, setPrimaryColor] = useState<string>("#000000");
const [secondaryColor, setSecondaryColor] = useState<string>("#000000");
const [tertiaryColor, setTertiaryColor] = useState<string>("#000000");
const [foregroundColor, setForegroundColor] = useState<string>("#000000");
// const [boxesPerLine, setBoxesPerLine] = useState(70);

    // Function to update colors from CSS variables
    const updateColors = () => {
        
          const colorPrimary = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-primary').trim();
          const colorSecondary = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-secondary').trim();
          const colorTertiary = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-tertiary').trim();
          // Get foreground color (HSL format: "0 0% 3.9%")
          const foregroundHsl = getComputedStyle(document.documentElement)
            .getPropertyValue('--secondary-foreground').trim();
          // Convert HSL to hsl() format
          if (foregroundHsl) {
            setForegroundColor(`hsl(${foregroundHsl})`);
          }
        // const colorPrimary = "#ffffff36";
        // const colorSecondary = "#ffffff";
        // const colorTertiary = "#8b5cf6";
        if (colorPrimary) setPrimaryColor(colorPrimary);
        if (colorSecondary) setSecondaryColor(colorSecondary);
        if (colorTertiary) setTertiaryColor(colorTertiary);
    };

    // Initial color setup
    useEffect(() => {
    updateColors();
    }, []);

    // Listen for theme changes
    useEffect(() => {
    // Create a MutationObserver to watch for changes to the document's class or style
    const observer = new MutationObserver(updateColors);
    
    // Start observing the document with the configured parameters
    observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
    });
    
    // Clean up the observer on component unmount
    return () => observer.disconnect();
    }, []);

  // Prepare legend items from bar chart datasets (stacked elements)
  const legendItems: PieChartLegendItem[] = (paidUnpaidData.datasets || []).map((dataset) => {
    let color = 'rgba(0, 0, 0, 0.5)'; // default fallback color
    
    if (typeof dataset.backgroundColor === 'string') {
      color = dataset.backgroundColor;
    } else if (Array.isArray(dataset.backgroundColor) && dataset.backgroundColor.length > 0) {
      const bgColor = dataset.backgroundColor[0];
      if (typeof bgColor === 'string') {
        color = bgColor;
      }
    }
    
    return {
      label: dataset.label || '',
      color,
    };
  });

  return (
    <div className='relative text-foreground flex flex-col items-center justify-center h-full w-full'>
        {/* Legend Labels */}
        <div className='p-2 w-full'>
          <PieChartLegend items={legendItems} layout="flex-row" className="" />
        </div>

        <div className='w-full h-full relative p-2'>
              <BarChart
              // backgroundColor = "rgba(255, 255, 255, 0.1)"
              // borderColor = "rgba(255, 255, 255, 0.1)"
              borderWidth = {0}
              borderRadius = {0}
              // hoverBackgroundColor = {primaryColor}
              // hoverBorderColor = {primaryColor}
              // xAxisLabel = ''
              // yAxisLabel = ''
              // title = ''
              legend = {false}
              responsive = {true}
              maintainAspectRatio = {false}
              animation = {true}
              barPercentage = {0.4}
              categoryPercentage = {0.8}
              indexAxis = 'x'
              stacked = {true}
              xAxisTicksDisplay = {true}
              yAxisTicksDisplay = {true}
              // xAxisTicksColor = {primaryColor}
              // yAxisTicksColor = {primaryColor}
              xAxisGridDisplay = {false}
              yAxisGridDisplay = {false}
              // xAxisGridColor = {primaryColor}
              // yAxisGridColor = {primaryColor}

              data={paidUnpaidData}
          //   title="Quarterly Financial Performance"
          //   xAxisLabel="Quarter"
          //   yAxisLabel="Amount (USD)"
          //   borderRadius={8}
          //   stacked={true}
              options={{
              plugins: {
                  tooltip: {
                  callbacks: {
                      footer: (tooltipItems) => {
                      return 'Click for details';
                      },
                  },
                  },
                   // Add datalabels plugin to show values on bars with colors
                   datalabels: {
                       display: true,
                       color: function(context: any) {
                           // Get the dataset index
                           const datasetIndex = context.datasetIndex;
                           // Use provided valueColors if available
                           if (valueColors && valueColors[datasetIndex]) {
                               return valueColors[datasetIndex];
                           }
                           // Fallback to foreground color from state
                           return foregroundColor || '#000000';
                       },
                      anchor: 'end',
                      align: 'start',
                      font: {
                          size: 11,
                          weight: 500,
                      },
                      formatter: (value: number) => {
                          // Format the value (e.g., add commas for thousands)
                          return value.toLocaleString();
                      },
                  },
              },
              }}
              />

        </div>

        <h3 className='text-xs md:text-sm text-foreground font-medium mb-2'>{title}</h3>
    </div>

  


  )
}

export default BarChartContainer

