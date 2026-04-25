'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// -------------------------------------------------------------------
// Filter definitions
// -------------------------------------------------------------------

interface FilterDef {
  name: string;
  kernel: number[][];
  description: string;
}

const FILTERS: FilterDef[] = [
  {
    name: 'Edge (Horizontal)',
    kernel: [
      [-1, -1, -1],
      [ 0,  0,  0],
      [ 1,  1,  1],
    ],
    description: 'Detects horizontal edges — differences between top and bottom rows.',
  },
  {
    name: 'Edge (Vertical)',
    kernel: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    description: 'Detects vertical edges — differences between left and right columns.',
  },
  {
    name: 'Sharpen',
    kernel: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0],
    ],
    description: 'Amplifies differences from neighbors, making edges crisper.',
  },
  {
    name: 'Blur',
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    description: 'Averages the neighborhood, smoothing out sharp transitions.',
  },
];

// -------------------------------------------------------------------
// Pre-defined patterns
// -------------------------------------------------------------------

type Pattern = { name: string; grid: number[][] };

function emptyGrid(): number[][] {
  return Array.from({ length: 8 }, () => Array(8).fill(0));
}

function makePatterns(): Pattern[] {
  const cross = emptyGrid();
  for (let i = 0; i < 8; i++) { cross[3][i] = 1; cross[4][i] = 1; cross[i][3] = 1; cross[i][4] = 1; }

  const diag = emptyGrid();
  for (let i = 0; i < 8; i++) { diag[i][i] = 1; if (i < 7) diag[i][i + 1] = 1; }

  const box = emptyGrid();
  for (let i = 1; i < 7; i++) { box[1][i] = 1; box[6][i] = 1; box[i][1] = 1; box[i][6] = 1; }

  const checker = emptyGrid();
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { if ((r + c) % 2 === 0) checker[r][c] = 1; }

  return [
    { name: 'Cross', grid: cross },
    { name: 'Diagonal', grid: diag },
    { name: 'Box', grid: box },
    { name: 'Checkerboard', grid: checker },
  ];
}

const PATTERNS = makePatterns();

// -------------------------------------------------------------------
// Convolution logic
// -------------------------------------------------------------------

function applyConvolution(image: number[][], kernel: number[][]): number[][] {
  const rows = image.length;
  const cols = image[0].length;
  const kSize = kernel.length;
  const outRows = rows - kSize + 1;
  const outCols = cols - kSize + 1;
  const output: number[][] = [];

  for (let r = 0; r < outRows; r++) {
    const row: number[] = [];
    for (let c = 0; c < outCols; c++) {
      let sum = 0;
      for (let kr = 0; kr < kSize; kr++) {
        for (let kc = 0; kc < kSize; kc++) {
          sum += image[r + kr][c + kc] * kernel[kr][kc];
        }
      }
      row.push(sum);
    }
    output.push(row);
  }

  return output;
}

// -------------------------------------------------------------------
// Color helpers
// -------------------------------------------------------------------

function heatmapColor(value: number, min: number, max: number): string {
  if (max === min) return 'rgb(20, 20, 60)';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Blue (low) → cyan → yellow → red (high)
  if (t < 0.25) {
    const s = t / 0.25;
    return `rgb(${Math.round(10 + s * 10)}, ${Math.round(20 + s * 80)}, ${Math.round(120 + s * 60)})`;
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    return `rgb(${Math.round(20 + s * 60)}, ${Math.round(100 + s * 80)}, ${Math.round(180 - s * 80)})`;
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    return `rgb(${Math.round(80 + s * 140)}, ${Math.round(180 - s * 40)}, ${Math.round(100 - s * 70)})`;
  } else {
    const s = (t - 0.75) / 0.25;
    return `rgb(${Math.round(220 + s * 35)}, ${Math.round(140 - s * 90)}, ${Math.round(30 - s * 20)})`;
  }
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

const INPUT_SIZE = 8;
const OUTPUT_SIZE = 6; // 8 - 3 + 1

export default function CNNSim() {
  const [image, setImage] = useState<number[][]>(() => PATTERNS[0].grid.map(r => [...r]));
  const [filterIndex, setFilterIndex] = useState(0);
  const [highlightPos, setHighlightPos] = useState<{ row: number; col: number } | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filter = FILTERS[filterIndex];

  const featureMap = useMemo(
    () => applyConvolution(image, filter.kernel),
    [image, filter.kernel]
  );

  // Compute output range for heatmap coloring
  const { outMin, outMax } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const row of featureMap) {
      for (const v of row) {
        mn = Math.min(mn, v);
        mx = Math.max(mx, v);
      }
    }
    return { outMin: mn, outMax: mx };
  }, [featureMap]);

  // Toggle pixel
  const togglePixel = useCallback((r: number, c: number) => {
    setImage(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  }, []);

  // Load pattern
  const loadPattern = useCallback((pattern: Pattern) => {
    setImage(pattern.grid.map(r => [...r]));
  }, []);

  // Step through positions
  const totalSteps = OUTPUT_SIZE * OUTPUT_SIZE;

  const nextStep = useCallback(() => {
    setHighlightPos(prev => {
      if (prev === null) return { row: 0, col: 0 };
      const nextCol = prev.col + 1;
      if (nextCol < OUTPUT_SIZE) return { row: prev.row, col: nextCol };
      const nextRow = prev.row + 1;
      if (nextRow < OUTPUT_SIZE) return { row: nextRow, col: 0 };
      return null; // done
    });
  }, []);

  const resetStep = useCallback(() => {
    setHighlightPos(null);
    setIsAutoPlaying(false);
    if (autoRef.current) clearTimeout(autoRef.current);
  }, []);

  // Auto play
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoRef.current) clearTimeout(autoRef.current);
      return;
    }

    const tick = () => {
      setHighlightPos(prev => {
        if (prev === null) {
          return { row: 0, col: 0 };
        }
        const nextCol = prev.col + 1;
        if (nextCol < OUTPUT_SIZE) return { row: prev.row, col: nextCol };
        const nextRow = prev.row + 1;
        if (nextRow < OUTPUT_SIZE) return { row: nextRow, col: 0 };
        // Wrap around
        return { row: 0, col: 0 };
      });
    };

    autoRef.current = setTimeout(tick, 350);

    return () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    };
  }, [isAutoPlaying, highlightPos]);

  const toggleAuto = useCallback(() => {
    setIsAutoPlaying(prev => {
      if (!prev && highlightPos === null) {
        setHighlightPos({ row: 0, col: 0 });
      }
      return !prev;
    });
  }, [highlightPos]);

  // Compute step number for display
  const stepNumber = highlightPos
    ? highlightPos.row * OUTPUT_SIZE + highlightPos.col + 1
    : 0;

  // Compute the dot product for the current highlighted position
  const currentDotProduct = useMemo(() => {
    if (!highlightPos) return null;
    return featureMap[highlightPos.row][highlightPos.col];
  }, [highlightPos, featureMap]);

  const CELL_PX = 40;
  const OUTPUT_CELL_PX = 44;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Convolution Filter Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Click cells in the input grid to draw a pattern. Choose a filter and watch
        how convolution transforms the image into a feature map.
      </p>

      {/* Top row: pattern presets + filter selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Pattern presets */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">Load Pattern</label>
          <div className="flex gap-2 flex-wrap">
            {PATTERNS.map((p) => (
              <button
                key={p.name}
                onClick={() => loadPattern(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={() => setImage(emptyGrid())}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter selector */}
        <div className="sm:ml-auto">
          <label className="text-xs font-medium text-gray-400 block mb-2">Filter</label>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f, i) => (
              <button
                key={f.name}
                onClick={() => setFilterIndex(i)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  i === filterIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout: Input + Kernel + Output */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Input image grid */}
        <div>
          <div className="text-sm font-medium text-gray-300 mb-2">
            Input Image <span className="text-gray-500">(8 x 8)</span>
          </div>
          <div
            className="grid gap-px bg-gray-700 rounded-lg overflow-hidden border border-gray-700"
            style={{
              gridTemplateColumns: `repeat(${INPUT_SIZE}, ${CELL_PX}px)`,
            }}
          >
            {image.map((row, r) =>
              row.map((pixel, c) => {
                // Determine if this cell is under the current convolution window
                const isHighlighted =
                  highlightPos !== null &&
                  r >= highlightPos.row &&
                  r < highlightPos.row + 3 &&
                  c >= highlightPos.col &&
                  c < highlightPos.col + 3;

                return (
                  <motion.button
                    key={`${r}-${c}`}
                    onClick={() => togglePixel(r, c)}
                    className="transition-colors"
                    style={{
                      width: CELL_PX,
                      height: CELL_PX,
                      backgroundColor: pixel === 1
                        ? isHighlighted ? '#93c5fd' : '#e2e8f0'
                        : isHighlighted ? '#1e3a5f' : '#111827',
                      outline: isHighlighted ? '2px solid #3b82f6' : 'none',
                      outlineOffset: '-1px',
                      zIndex: isHighlighted ? 10 : 1,
                      position: 'relative',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                );
              })
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Click cells to toggle black/white</p>
        </div>

        {/* Filter kernel + convolution controls */}
        <div className="flex flex-col items-center gap-4">
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2 text-center">
              Filter Kernel <span className="text-gray-500">(3 x 3)</span>
            </div>
            <div
              className="grid gap-px bg-gray-700 rounded-lg overflow-hidden border border-gray-700"
              style={{ gridTemplateColumns: `repeat(3, 48px)` }}
            >
              {filter.kernel.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`k-${r}-${c}`}
                    className="flex items-center justify-center text-sm font-mono"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor:
                        val > 0
                          ? `rgba(59, 130, 246, ${Math.min(0.6, Math.abs(val) * 0.12)})`
                          : val < 0
                          ? `rgba(239, 68, 68, ${Math.min(0.6, Math.abs(val) * 0.12)})`
                          : 'rgba(31, 41, 55, 0.8)',
                      color:
                        val > 0 ? '#93c5fd' : val < 0 ? '#fca5a5' : '#6b7280',
                    }}
                  >
                    {val > 0 ? `+${val}` : val}
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center max-w-[160px]">
              {filter.description}
            </p>
          </div>

          {/* Convolution step indicator */}
          <div className="text-center">
            <div className="text-2xl text-gray-500 mb-2">&rarr;</div>
            {highlightPos !== null && currentDotProduct !== null && (
              <motion.div
                key={`${highlightPos.row}-${highlightPos.col}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg px-3 py-2"
              >
                <div className="text-xs text-gray-400">Position ({highlightPos.row}, {highlightPos.col})</div>
                <div className="text-sm font-mono text-white font-bold">
                  = {currentDotProduct.toFixed(1)}
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={nextStep}
              disabled={isAutoPlaying}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                isAutoPlaying
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
            >
              Next Step
            </button>
            <button
              onClick={toggleAuto}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${
                isAutoPlaying
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              {isAutoPlaying ? 'Stop' : 'Auto Play'}
            </button>
            <button
              onClick={resetStep}
              className="text-xs font-medium px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>

          {highlightPos !== null && (
            <div className="text-xs text-gray-500">
              Step {stepNumber} of {totalSteps}
            </div>
          )}
        </div>

        {/* Output feature map */}
        <div>
          <div className="text-sm font-medium text-gray-300 mb-2">
            Feature Map <span className="text-gray-500">(6 x 6)</span>
          </div>
          <div
            className="grid gap-px bg-gray-700 rounded-lg overflow-hidden border border-gray-700"
            style={{
              gridTemplateColumns: `repeat(${OUTPUT_SIZE}, ${OUTPUT_CELL_PX}px)`,
            }}
          >
            {featureMap.map((row, r) =>
              row.map((val, c) => {
                const isActive =
                  highlightPos !== null &&
                  highlightPos.row === r &&
                  highlightPos.col === c;

                return (
                  <motion.div
                    key={`o-${r}-${c}`}
                    className="flex items-center justify-center text-xs font-mono"
                    style={{
                      width: OUTPUT_CELL_PX,
                      height: OUTPUT_CELL_PX,
                      backgroundColor: heatmapColor(val, outMin, outMax),
                      color: 'rgba(255,255,255,0.85)',
                      outline: isActive ? '2px solid #fbbf24' : 'none',
                      outlineOffset: '-1px',
                      zIndex: isActive ? 10 : 1,
                      position: 'relative',
                    }}
                    animate={
                      isActive
                        ? { scale: [1, 1.1, 1], transition: { duration: 0.25 } }
                        : {}
                    }
                  >
                    {val.toFixed(1)}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Heatmap legend */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">{outMin.toFixed(1)}</span>
            <div
              className="flex-1 h-2 rounded-full"
              style={{
                background: `linear-gradient(to right, ${heatmapColor(outMin, outMin, outMax)}, ${heatmapColor((outMin + outMax) * 0.33, outMin, outMax)}, ${heatmapColor((outMin + outMax) * 0.66, outMin, outMax)}, ${heatmapColor(outMax, outMin, outMax)})`,
              }}
            />
            <span className="text-xs text-gray-500">{outMax.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-0.5">
            <span>Low activation</span>
            <span>High activation</span>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          <strong className="text-blue-200">Try this:</strong>{' '}
          Load the &quot;Box&quot; pattern and switch between horizontal and vertical edge filters.
          Notice how each filter only fires where it finds its matching edge direction.
        </p>
      </div>
    </div>
  );
}
