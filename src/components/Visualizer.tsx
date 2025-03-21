
import { useRef, useEffect, useState } from 'react';
import { getFrequencyData } from '../utils/audioUtils';

interface VisualizerProps {
  isActive: boolean;
}

const Visualizer = ({ isActive }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  // Add a timer to automatically deactivate visualization after a short period
  const [isActuallyActive, setIsActuallyActive] = useState(false);
  
  // Use effect to manage the active state with auto-deactivation
  useEffect(() => {
    if (isActive) {
      setIsActuallyActive(true);
      // Auto-deactivate after 300ms unless isActive remains true
      const timer = setTimeout(() => {
        if (!isActive) {
          setIsActuallyActive(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const renderFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get current dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get frequency data
    const frequencyData = getFrequencyData();
    if (frequencyData.length === 0) {
      // If no data yet, draw default visualization
      drawDefaultVisualization(ctx, width, height);
    } else {
      // Draw the visualization based on frequency data
      drawVisualization(ctx, frequencyData, width, height);
    }

    // Continue animation loop
    requestRef.current = requestAnimationFrame(renderFrame);
  };

  const drawDefaultVisualization = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const barCount = 32;
    const barWidth = width / barCount;
    const barGap = 2;
    
    ctx.fillStyle = 'rgba(15, 160, 206, 0.6)';
    
    for (let i = 0; i < barCount; i++) {
      // Generate a gentle wave pattern
      const time = Date.now() * 0.001;
      const amplitude = isActuallyActive ? 50 : 20;
      const frequency = 0.15;
      const phase = i / barCount * Math.PI * 2;
      const sinValue = Math.sin(time + phase * frequency);
      const barHeight = (sinValue * 0.5 + 0.5) * amplitude;
      
      ctx.fillRect(
        i * barWidth + barGap / 2,
        height - barHeight,
        barWidth - barGap,
        barHeight
      );
    }
  };

  const drawVisualization = (
    ctx: CanvasRenderingContext2D,
    frequencyData: Uint8Array,
    width: number,
    height: number
  ) => {
    const barCount = Math.min(frequencyData.length, 64);
    const barWidth = width / barCount;
    const barGap = 2;
    
    // Create a gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
    gradient.addColorStop(1, 'rgba(15, 160, 206, 0.6)');
    ctx.fillStyle = gradient;
    
    for (let i = 0; i < barCount; i++) {
      const value = frequencyData[i];
      const percent = value / 255;
      const barHeight = percent * height;
      
      ctx.fillRect(
        i * barWidth + barGap / 2,
        height - barHeight,
        barWidth - barGap,
        barHeight
      );
    }
  };

  useEffect(() => {
    // Start animation
    requestRef.current = requestAnimationFrame(renderFrame);
    
    // Resize canvas to match display size
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const { width, height } = canvas.getBoundingClientRect();
      
      if (canvas.width !== width || canvas.height !== height) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActuallyActive]); // Now depends on isActuallyActive instead of isActive

  return (
    <div className="w-full h-32 md:h-40 bg-beatbox-muted/50 rounded-2xl overflow-hidden shadow-inner">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Visualizer;
