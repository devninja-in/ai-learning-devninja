import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface SimulationContainerProps {
  title: string;
  description?: string;
  children?: ReactNode;
  controls?: ReactNode;
  className?: string;
  height?: number;
  autoPlay?: boolean;
  resizable?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSettingsToggle?: () => void;
  isPlaying?: boolean;
  canvasId?: string;
}

export default function SimulationContainer({
  title,
  description,
  children,
  controls,
  className,
  height = 400,
  autoPlay = false,
  resizable = false,
  onPlay,
  onPause,
  onReset,
  onSettingsToggle,
  isPlaying = false,
  canvasId,
}: SimulationContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [containerHeight, setContainerHeight] = useState(height);

  useEffect(() => {
    if (autoPlay && onPlay) {
      onPlay();
    }
  }, [autoPlay, onPlay]);

  const handlePlay = () => {
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    if (onPause) onPause();
  };

  const handleReset = () => {
    if (onReset) onReset();
  };

  const handleSettingsToggle = () => {
    const newShowSettings = !showSettings;
    setShowSettings(newShowSettings);
    if (onSettingsToggle) onSettingsToggle();
  };

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={cn('not-prose my-6', className)}>
      <Card className="overflow-hidden border-border">
        {/* Header */}
        <div className="px-4 py-3 bg-surface border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              {description && (
                <p className="text-sm text-foreground/70 mt-1">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Play/Pause Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
                className="h-8 px-2 touch-target"
                disabled={!onPlay && !onPause}
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                <span className="sr-only">
                  {isPlaying ? 'Pause simulation' : 'Play simulation'}
                </span>
              </Button>

              {/* Reset */}
              {onReset && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 touch-target"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="sr-only">Reset simulation</span>
                </Button>
              )}

              {/* Settings */}
              {onSettingsToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSettingsToggle}
                  className={cn(
                    'h-8 px-2 touch-target',
                    showSettings && 'bg-primary/10 text-primary'
                  )}
                >
                  <Settings className="h-3 w-3" />
                  <span className="sr-only">Toggle settings</span>
                </Button>
              )}

              {/* Fullscreen */}
              {resizable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreenToggle}
                  className="h-8 px-2 touch-target"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Maximize2 className="h-3 w-3" />
                  )}
                  <span className="sr-only">
                    {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && controls && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-b border-border overflow-hidden"
            >
              <div className="p-4 bg-surface/50">{controls}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulation Content */}
        <div
          ref={containerRef}
          className="relative bg-background"
          style={{
            height: isFullscreen ? '100vh' : containerHeight,
            minHeight: isFullscreen ? '100vh' : 200,
          }}
        >
          {/* Canvas for D3/Three.js simulations */}
          {canvasId && (
            <canvas
              ref={canvasRef}
              id={canvasId}
              className="absolute inset-0 w-full h-full"
            />
          )}

          {/* React content overlay */}
          {children && (
            <div className="relative z-10 w-full h-full p-4">{children}</div>
          )}

          {/* Loading State */}
          {!children && !canvasId && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-foreground/40 text-center"
              >
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading simulation...</p>
              </motion.div>
            </div>
          )}
        </div>

        {/* Resize Handle */}
        {resizable && !isFullscreen && (
          <div
            className="h-2 bg-surface hover:bg-border cursor-row-resize flex items-center justify-center group transition-colors"
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startHeight = containerHeight;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaY = e.clientY - startY;
                const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
                setContainerHeight(newHeight);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-8 h-1 bg-border rounded-full group-hover:bg-foreground/30 transition-colors" />
          </div>
        )}
      </Card>
    </div>
  );
}