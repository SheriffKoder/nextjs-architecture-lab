'use client'

import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export interface LabelCustomization {
    color?: string;
    backgroundColor?: string;
    padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    font?: {
        size?: number;
        weight?: string | number;
        family?: string;
    };
    offsetX?: number;
    offsetY?: number;
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
}

export interface PieChartProps {
    data: ChartData<'pie'>;
    options?: ChartOptions<'pie'>;
    height?: string | number;
    width?: string | number;
    donut?: boolean;
    cutout?: string | number;
    legend?: boolean;
    labelPosition?: 'inside' | 'outside' | 'none';
    labelTemplate?: (label: string, value: number, percentage: number) => string;
    labelCustomization?: LabelCustomization;
    glow?: 'full' | 'hover';
    glowColors?: string[]; // Array of glow colors for each segment (should match data length)
    glowOpacity?: number; // Opacity of the glow effect (0-1, default 0.8)
    scale?: number; // Scale factor for the pie chart (0-1, default 1). Keeps canvas size same but scales the pie itself.
    separatorSpacing?: number; // Spacing between segments in pixels (default 0). Creates transparent gaps.
    separatorStyle?: 'arc' | 'rectangular'; // Style of separator: 'arc' follows the curve, 'rectangular' is a straight line (default 'arc')
    separatorInnerExtent?: number; // How far toward the center the separator extends (0-1, default 1). 1 = full extent to innerRadius, 0 = doesn't extend toward center
}

// Register all Chart.js components
Chart.register(...registerables, ChartDataLabels);

const PieChart: React.FC<PieChartProps> = ({
  data,
  options = {},
  height = '100%',
  width = '100%',
  donut = false,
  cutout = '60%',
  legend = true,
  labelPosition = 'none',
  labelTemplate,
  labelCustomization,
  glow,
  glowColors = [],
  glowOpacity = 0.8,
  scale = 1,
  separatorSpacing = 0,
  separatorStyle = 'arc',
  separatorInnerExtent = 1,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Calculate total for percentage calculation
    const total = data.datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 0;

    // Helper to convert color to shadow color format with custom opacity
    const getShadowColor = (color: string, opacity: number = glowOpacity): string => {
      // Extract rgba values
      const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (rgbaMatch) {
        const r = rgbaMatch[1];
        const g = rgbaMatch[2];
        const b = rgbaMatch[3];
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      // Fallback for hex colors - convert to rgba
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color;
    };

    // Create separator plugin to add transparent spacing between segments
    // This uses composite operation to "cut out" gaps between segments
    // Draws in afterDatasetsDraw (after segments are drawn) but before labels/tooltips
    // This ensures separator has lower z-index than labels and tooltips
    const separatorPlugin = separatorSpacing > 0 ? {
      id: 'pieSeparator',
      afterDatasetsDraw: (chart: Chart) => {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        
        if (!meta || !meta.data) return;
        
        const { width, height } = chart;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Calculate the radius (use the first arc to get radius)
        const firstArc = meta.data[0] as any;
        if (!firstArc) return;
        
        const outerRadius = firstArc.outerRadius || 0;
        const innerRadius = firstArc.innerRadius || 0;
        
        if (outerRadius === 0) return;
        
        // Calculate separator angle in radians based on pixel spacing
        // Convert pixel spacing to angle: spacing / radius gives angle in radians
        const separatorAngleRad = separatorSpacing / outerRadius;
        
        // Draw separators between segments using destination-out to create gaps
        // This is drawn after datasets but before labels/tooltips, ensuring lower z-index
        meta.data.forEach((arc: any, index: number) => {
          // Draw separator at the end angle of each segment
          const endAngle = arc.endAngle;
          
          ctx.save();
          
          // Use destination-out composite operation to "cut out" the gap
          // This only affects what's already drawn (the segments), not labels/tooltips drawn later
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Any opaque color works with destination-out
          
          ctx.beginPath();
          
          // Calculate the actual inner radius for the separator based on separatorInnerExtent
          // separatorInnerExtent: 1 = full extent to innerRadius, 0 = doesn't extend toward center
          // For donut charts: interpolate between outerRadius and innerRadius
          // For regular pie charts: interpolate between outerRadius and 0 (center)
          const separatorInnerRadius = innerRadius > 0
            ? innerRadius + (outerRadius - innerRadius) * (1 - separatorInnerExtent)
            : outerRadius * (1 - separatorInnerExtent);
          
          if (separatorStyle === 'rectangular') {
            // Draw rectangular separator (straight line from calculated inner to outer radius)
            const startX = centerX + Math.cos(endAngle) * separatorInnerRadius;
            const startY = centerY + Math.sin(endAngle) * separatorInnerRadius;
            const endX = centerX + Math.cos(endAngle) * outerRadius;
            const endY = centerY + Math.sin(endAngle) * outerRadius;
            
            // Calculate perpendicular direction for rectangle width
            const perpAngle = endAngle + Math.PI / 2;
            const halfWidth = separatorSpacing / 2;
            const perpX = Math.cos(perpAngle) * halfWidth;
            const perpY = Math.sin(perpAngle) * halfWidth;
            
            // Draw rectangle: four corners
            ctx.moveTo(startX - perpX, startY - perpY);
            ctx.lineTo(startX + perpX, startY + perpY);
            ctx.lineTo(endX + perpX, endY + perpY);
            ctx.lineTo(endX - perpX, endY - perpY);
            ctx.closePath();
          } else {
            // Draw arc separator (follows the curve)
            ctx.arc(centerX, centerY, outerRadius, endAngle, endAngle + separatorAngleRad);
            if (separatorInnerRadius > 0) {
              // For donut charts or when separatorInnerExtent < 1, draw inner arc in opposite direction
              ctx.arc(centerX, centerY, separatorInnerRadius, endAngle + separatorAngleRad, endAngle, true);
            } else {
              // For regular pie charts when separatorInnerExtent = 0, draw line to center
              ctx.lineTo(centerX, centerY);
            }
            ctx.closePath();
          }
          
          ctx.fill();
          ctx.restore();
        });
      },
    } : null;

    // Create glow plugin for pie chart
    // Using beforeDraw so glow renders behind everything (lowest z-index)
    // The glow must respect the scale transformation applied by the scale plugin
    const glowPlugin = glow ? {
      id: 'pieGlow',
      beforeDraw: (chart: Chart) => {
        if (!glow) return;
        
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        
        if (!meta || !meta.data) return;
        
        // Apply the same scale transformation as the scale plugin
        // This ensures glow is drawn at the same scale as the pie segments
        const { width, height } = chart;
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.save();
        
        // Apply scale transformation if scale !== 1
        // This matches the transformation applied by the scale plugin
        if (scale !== 1) {
          ctx.translate(centerX, centerY);
          ctx.scale(scale, scale);
          ctx.translate(-centerX, -centerY);
        }
        
        // Draw glow for each segment
        meta.data.forEach((arc: any, index: number) => {
          // For "hover" mode, only glow the hovered segment
          if (glow === 'hover' && hoveredIndexRef.current !== index) {
            return;
          }
          
          // Get glow color for this segment (fallback to segment's background color)
          const segmentBgColor = Array.isArray(data.datasets[0]?.backgroundColor)
            ? (data.datasets[0]?.backgroundColor[index] as string)
            : (data.datasets[0]?.backgroundColor as string);
          
          const glowColor = glowColors[index] || segmentBgColor || '#ffffff';
          const shadowColor = getShadowColor(glowColor, glowOpacity);
          
          // Get arc properties
          const startAngle = arc.startAngle;
          const endAngle = arc.endAngle;
          const innerRadius = arc.innerRadius;
          const outerRadius = arc.outerRadius;
          const x = arc.x;
          const y = arc.y;
          
          ctx.save();
          
          // Apply glow effect
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          // Draw the arc with glow (drawing on top of existing arc)
          ctx.beginPath();
          ctx.arc(x, y, outerRadius, startAngle, endAngle);
          if (innerRadius > 0) {
            // For donut charts, draw inner arc in opposite direction
            ctx.arc(x, y, innerRadius, endAngle, startAngle, true);
          } else {
            // For regular pie charts, draw line to center
            ctx.lineTo(x, y);
          }
          ctx.closePath();
          
          // Fill with the segment's background color (or glow color) to create glow effect
          ctx.fillStyle = segmentBgColor || glowColor;
          ctx.fill();
          
          ctx.restore();
        });
        
        ctx.restore(); // Restore scale transformation
      },
      // Track hover state for "hover" mode
      afterEvent: (chart: Chart, args: any) => {
        if (glow !== 'hover') return;
        
        const event = args.event;
        const activeElements = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        
        const newHoveredIndex = activeElements.length > 0 ? activeElements[0].index : null;
        
        // Only update if hover state changed
        if (hoveredIndexRef.current !== newHoveredIndex) {
          hoveredIndexRef.current = newHoveredIndex;
          // Use render() to redraw without full update cycle, preserving labels
          // This is more efficient than update() and doesn't clear labels
          chart.render();
        }
      },
    } : null;

    // Create scale plugin to scale the pie chart and glow while keeping canvas size
    // This scales the pie segments and glow, but not labels or tooltips
    const scalePlugin = scale !== 1 ? {
      id: 'pieScale',
      beforeDatasetsDraw: (chart: Chart) => {
        const ctx = chart.ctx;
        const { width, height } = chart;
        
        // Save the context
        ctx.save();
        
        // Calculate center
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Translate to center, scale, then translate back
        // This scales the pie chart drawing and glow, but keeps labels/tooltips at original scale
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
      },
      afterDatasetsDraw: (chart: Chart) => {
        // Restore the context after drawing datasets and glow (before labels/tooltips)
        chart.ctx.restore();
      },
      // Adjust interaction detection for scaled charts
      // Transform mouse coordinates to match scaled chart coordinates
      beforeEvent: (chart: Chart, args: any) => {
        if (scale === 1) return;
        
        const event = args.event;
        if (event && event.native && event.native.type === 'mousemove') {
          const { width, height } = chart;
          const centerX = width / 2;
          const centerY = height / 2;
          
          // Get canvas bounding rect
          const canvas = chart.canvas;
          const rect = canvas.getBoundingClientRect();
          
          // Get mouse position relative to canvas
          const mouseX = event.native.clientX - rect.left;
          const mouseY = event.native.clientY - rect.top;
          
          // Transform mouse coordinates from unscaled canvas space to scaled chart space
          // Reverse the scale transformation: (x - center) / scale + center
          const scaledX = (mouseX - centerX) / scale + centerX;
          const scaledY = (mouseY - centerY) / scale + centerY;
          
          // Update Chart.js event coordinates
          // Chart.js uses these coordinates for hit detection
          if (event.x !== undefined) event.x = scaledX;
          if (event.y !== undefined) event.y = scaledY;
          
          // Also update the native event's offset coordinates if available
          if (event.native.offsetX !== undefined) {
            Object.defineProperty(event.native, 'offsetX', {
              value: scaledX,
              writable: true,
            });
          }
          if (event.native.offsetY !== undefined) {
            Object.defineProperty(event.native, 'offsetY', {
              value: scaledY,
              writable: true,
            });
          }
        }
      },
    } : null;

    // Create new chart instance
    // Plugin order: separator (lowest z-index) -> scale -> glow -> labels/tooltips (highest)
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: data,
      plugins: [separatorPlugin, scalePlugin, glowPlugin].filter(Boolean) as any[],
      options: {
        ...options,
        responsive: true,
        maintainAspectRatio: false,
        ...(donut && { cutout }),
        plugins: {
          ...options.plugins,
          legend: {
            display: legend,
            ...options.plugins?.legend,
          },
          tooltip: {
            ...options.plugins?.tooltip,
            // Adjust interaction detection for scaled charts
            ...(scale !== 1 && {
              intersect: false,
              position: 'nearest',
            }),
            callbacks: {
              ...options.plugins?.tooltip?.callbacks,
              // Only add default label callback if no custom one was provided in options
              ...(options.plugins?.tooltip?.callbacks?.label 
                ? {} 
                : {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                      
                      if (labelTemplate) {
                        return labelTemplate(label, value, parseFloat(percentage));
                      }
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  }),
            },
          },
          datalabels: labelPosition !== 'none' ? {
            display: true,
            color: labelCustomization?.color || (labelPosition === 'inside' ? '#fff' : '#333'),
            backgroundColor: labelCustomization?.backgroundColor,
            padding: (() => {
              // If custom padding is provided, use it
              if (labelCustomization?.padding !== undefined) {
                return labelCustomization.padding;
              }
              // If maxWidth/maxHeight are provided, calculate padding from them
              if (labelCustomization?.maxWidth || labelCustomization?.maxHeight) {
                return {
                  top: labelCustomization.maxHeight ? Math.min(labelCustomization.maxHeight / 4, 12) : 8,
                  bottom: labelCustomization.maxHeight ? Math.min(labelCustomization.maxHeight / 4, 12) : 8,
                  left: labelCustomization.maxWidth ? Math.min(labelCustomization.maxWidth / 8, 12) : 8,
                  right: labelCustomization.maxWidth ? Math.min(labelCustomization.maxWidth / 8, 12) : 8,
                };
              }
              return undefined;
            })(),
            borderRadius: labelCustomization?.borderRadius,
            borderColor: labelCustomization?.borderColor,
            borderWidth: labelCustomization?.borderWidth,
            font: labelCustomization?.font ? {
              size: labelCustomization.font.size,
              weight: (() => {
                const weight = labelCustomization.font.weight;
                if (weight === undefined) return undefined;
                // If it's already a valid string literal, return it
                if (typeof weight === 'string' && ['bold', 'normal', 'bolder', 'lighter'].includes(weight)) {
                  return weight as 'bold' | 'normal' | 'bolder' | 'lighter';
                }
                // If it's a number, return it
                if (typeof weight === 'number') {
                  return weight;
                }
                // For other strings, try to convert or default to 'normal'
                return 'normal';
              })(),
              family: labelCustomization.font.family,
            } : undefined,
            anchor: labelPosition === 'inside' ? 'center' : 'end',
            align: labelPosition === 'inside' ? 'center' : 'end',
            offset: (context: any) => {
              // Base offset based on position
              let baseOffset = labelPosition === 'outside' ? 5 : 0;
              
              // If custom offsets are provided, use offsetX as radial distance
              if (labelCustomization?.offsetX !== undefined) {
                baseOffset = labelCustomization.offsetX;
              }
              
              // For pie charts, offset is radial distance from the arc
              // offsetY would require angle calculation which is complex
              // So we primarily use offsetX as the radial offset
              return baseOffset;
            },
            // Use rotation to simulate offsetY by rotating the label
            rotation: labelCustomization?.offsetY !== undefined 
              ? (context: any) => {
                  // Convert offsetY to a small rotation angle
                  // This is a workaround since pie charts don't support direct y-offset
                  return labelCustomization.offsetY! * 0.1;
                }
              : undefined,
            textAlign: 'center',
            formatter: (value: number, context: any) => {
              const label = context.chart.data.labels[context.dataIndex] || '';
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              
              let formattedText = '';
              if (labelTemplate) {
                formattedText = labelTemplate(label, value, parseFloat(percentage));
              } else {
                formattedText = labelPosition === 'inside' 
                  ? `${percentage}%` 
                  : `${label}: ${percentage}%`;
              }
              
              // Apply maxWidth constraint by truncating text if needed
              // This is approximate - actual pixel width depends on font
              if (labelCustomization?.maxWidth) {
                const fontSize = labelCustomization?.font?.size || 12;
                const maxChars = Math.floor(labelCustomization.maxWidth / (fontSize * 0.6));
                if (formattedText.length > maxChars) {
                  formattedText = formattedText.substring(0, maxChars - 3) + '...';
                }
              }
              
              return formattedText;
            },
            // Use clamp to try to respect max dimensions (limited support)
            clamp: labelCustomization?.maxWidth !== undefined || labelCustomization?.maxHeight !== undefined,
            ...options.plugins?.datalabels,
          } : {
            display: false,
          },
        },
      },
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options, donut, cutout, legend, labelPosition, labelTemplate, labelCustomization, glow, glowColors, glowOpacity, scale, separatorSpacing, separatorStyle, separatorInnerExtent]);

  return (
    <div style={{ height, width, position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default PieChart;
