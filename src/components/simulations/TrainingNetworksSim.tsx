'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Loss landscape: a 2D function with a global minimum and a local min
// -------------------------------------------------------------------

// The landscape is f(x, y) = a bowl centered near (6, 6) with a shallow
// local minimum near (2.5, 3). This gives the SGD path something
// interesting to do (get stuck in local min at high lr, etc.)

function lossAt(x: number, y: number): number {
  // Global minimum at (6.0, 6.0)
  const global = 0.04 * ((x - 6.0) ** 2 + (y - 6.0) ** 2);
  // Local minimum (a Gaussian dip) near (2.5, 3.0)
  const local = -1.2 * Math.exp(-0.3 * ((x - 2.5) ** 2 + (y - 3.0) ** 2));
  // Gentle tilt so the ball tends toward the global min
  return global + local + 3.0;
}

// Numerical gradient via central differences
function gradient(x: number, y: number): [number, number] {
  const h = 0.01;
  const dfdx = (lossAt(x + h, y) - lossAt(x - h, y)) / (2 * h);
  const dfdy = (lossAt(x, y + h) - lossAt(x, y - h)) / (2 * h);
  return [dfdx, dfdy];
}

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type Optimizer = 'sgd' | 'adam';

interface TrailPoint {
  x: number;
  y: number;
  loss: number;
}

// -------------------------------------------------------------------
// Contour map rendering
// -------------------------------------------------------------------

const GRID_SIZE = 9; // landscape spans 0..GRID_SIZE
const SVG_SIZE = 400;
const CONTOUR_RES = 60; // resolution of the heatmap grid

function buildHeatmap(): string[][] {
  const cells: string[][] = [];
  for (let row = 0; row < CONTOUR_RES; row++) {
    const rowCells: string[] = [];
    for (let col = 0; col < CONTOUR_RES; col++) {
      const x = (col / CONTOUR_RES) * GRID_SIZE;
      const y = (row / CONTOUR_RES) * GRID_SIZE;
      const loss = lossAt(x, y);
      // Map loss to color: low = dark blue, mid = teal, high = warm
      const t = Math.min(1, Math.max(0, (loss - 1.0) / 5.0));
      rowCells.push(lossToColor(t));
    }
    cells.push(rowCells);
  }
  return cells;
}

function lossToColor(t: number): string {
  // 0 = deep blue (low loss), 1 = warm amber (high loss)
  if (t < 0.25) {
    const s = t / 0.25;
    const r = Math.round(10 + s * 10);
    const g = Math.round(20 + s * 60);
    const b = Math.round(80 + s * 80);
    return `rgb(${r},${g},${b})`;
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    const r = Math.round(20 + s * 30);
    const g = Math.round(80 + s * 60);
    const b = Math.round(160 - s * 40);
    return `rgb(${r},${g},${b})`;
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    const r = Math.round(50 + s * 100);
    const g = Math.round(140 - s * 20);
    const b = Math.round(120 - s * 60);
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.75) / 0.25;
    const r = Math.round(150 + s * 80);
    const g = Math.round(120 - s * 40);
    const b = Math.round(60 - s * 30);
    return `rgb(${r},${g},${b})`;
  }
}

// Pre-compute heatmap (runs once at module level)
const HEATMAP = buildHeatmap();
const CELL_SIZE = SVG_SIZE / CONTOUR_RES;

function toSvg(val: number): number {
  return (val / GRID_SIZE) * SVG_SIZE;
}

// -------------------------------------------------------------------
// Build contour lines at specific loss values
// -------------------------------------------------------------------

function buildContourPaths(): { d: string; loss: number }[] {
  const contourLevels = [1.8, 2.0, 2.3, 2.6, 3.0, 3.5, 4.0, 4.8, 5.5];
  const paths: { d: string; loss: number }[] = [];
  const res = 80;

  for (const level of contourLevels) {
    // Simple marching-squares-ish approach: collect segments
    const segments: [number, number, number, number][] = [];
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        const x0 = (col / res) * GRID_SIZE;
        const y0 = (row / res) * GRID_SIZE;
        const x1 = ((col + 1) / res) * GRID_SIZE;
        const y1 = ((row + 1) / res) * GRID_SIZE;

        const v00 = lossAt(x0, y0) - level;
        const v10 = lossAt(x1, y0) - level;
        const v01 = lossAt(x0, y1) - level;
        const v11 = lossAt(x1, y1) - level;

        // Check each edge for a sign change
        const edgePoints: [number, number][] = [];

        if (v00 * v10 < 0) {
          const t = v00 / (v00 - v10);
          edgePoints.push([x0 + t * (x1 - x0), y0]);
        }
        if (v10 * v11 < 0) {
          const t = v10 / (v10 - v11);
          edgePoints.push([x1, y0 + t * (y1 - y0)]);
        }
        if (v01 * v11 < 0) {
          const t = v01 / (v01 - v11);
          edgePoints.push([x0 + t * (x1 - x0), y1]);
        }
        if (v00 * v01 < 0) {
          const t = v00 / (v00 - v01);
          edgePoints.push([x0, y0 + t * (y1 - y0)]);
        }

        if (edgePoints.length >= 2) {
          segments.push([
            toSvg(edgePoints[0][0]),
            toSvg(edgePoints[0][1]),
            toSvg(edgePoints[1][0]),
            toSvg(edgePoints[1][1]),
          ]);
        }
      }
    }

    if (segments.length > 0) {
      const d = segments
        .map(([x1, y1, x2, y2]) => `M${x1},${y1}L${x2},${y2}`)
        .join('');
      paths.push({ d, loss: level });
    }
  }

  return paths;
}

const CONTOUR_PATHS = buildContourPaths();

// -------------------------------------------------------------------
// Initial position
// -------------------------------------------------------------------

const START_X = 1.5;
const START_Y = 7.5;

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function TrainingNetworksSim() {
  const [optimizer, setOptimizer] = useState<Optimizer>('sgd');
  const [learningRate, setLearningRate] = useState(0.1);
  const [trail, setTrail] = useState<TrailPoint[]>([
    { x: START_X, y: START_Y, loss: lossAt(START_X, START_Y) },
  ]);
  const [isTraining, setIsTraining] = useState(false);
  const [step, setStep] = useState(0);

  // Adam state stored in ref so it persists across renders during animation
  const adamState = useRef({ mx: 0, my: 0, vx: 0, vy: 0, t: 0 });

  const currentPos = trail[trail.length - 1];
  const currentLoss = currentPos.loss;

  const reset = useCallback(() => {
    setTrail([{ x: START_X, y: START_Y, loss: lossAt(START_X, START_Y) }]);
    setStep(0);
    setIsTraining(false);
    adamState.current = { mx: 0, my: 0, vx: 0, vy: 0, t: 0 };
  }, []);

  const trainStep = useCallback(
    (
      pos: TrailPoint,
      lr: number,
      opt: Optimizer,
      adamSt: { mx: number; my: number; vx: number; vy: number; t: number }
    ): TrailPoint => {
      const [gx, gy] = gradient(pos.x, pos.y);

      let newX: number;
      let newY: number;

      if (opt === 'sgd') {
        newX = pos.x - lr * gx;
        newY = pos.y - lr * gy;
      } else {
        // Adam optimizer
        const beta1 = 0.9;
        const beta2 = 0.999;
        const eps = 1e-8;

        adamSt.t += 1;
        adamSt.mx = beta1 * adamSt.mx + (1 - beta1) * gx;
        adamSt.my = beta1 * adamSt.my + (1 - beta1) * gy;
        adamSt.vx = beta2 * adamSt.vx + (1 - beta2) * gx * gx;
        adamSt.vy = beta2 * adamSt.vy + (1 - beta2) * gy * gy;

        const mxHat = adamSt.mx / (1 - beta1 ** adamSt.t);
        const myHat = adamSt.my / (1 - beta1 ** adamSt.t);
        const vxHat = adamSt.vx / (1 - beta2 ** adamSt.t);
        const vyHat = adamSt.vy / (1 - beta2 ** adamSt.t);

        newX = pos.x - lr * mxHat / (Math.sqrt(vxHat) + eps);
        newY = pos.y - lr * myHat / (Math.sqrt(vyHat) + eps);
      }

      // Clamp to landscape bounds
      newX = Math.max(0.1, Math.min(GRID_SIZE - 0.1, newX));
      newY = Math.max(0.1, Math.min(GRID_SIZE - 0.1, newY));

      return { x: newX, y: newY, loss: lossAt(newX, newY) };
    },
    []
  );

  const runTraining = useCallback(() => {
    if (isTraining) return;
    setIsTraining(true);

    // Reset Adam state for a fresh run from current position
    if (optimizer === 'adam') {
      adamState.current = { mx: 0, my: 0, vx: 0, vy: 0, t: 0 };
    }

    let currentTrail = [...trail];
    let currentStep = step;
    let stepsLeft = 20;

    const tick = () => {
      if (stepsLeft <= 0) {
        setIsTraining(false);
        return;
      }

      const lastPos = currentTrail[currentTrail.length - 1];
      const newPos = trainStep(lastPos, learningRate, optimizer, adamState.current);
      currentTrail = [...currentTrail, newPos];
      currentStep += 1;
      stepsLeft -= 1;

      setTrail([...currentTrail]);
      setStep(currentStep);

      requestAnimationFrame(() => {
        setTimeout(tick, 80);
      });
    };

    tick();
  }, [isTraining, trail, step, learningRate, optimizer, trainStep]);

  // Build the trail SVG path
  const trailPath =
    trail.length > 1
      ? trail
          .map((p, i) =>
            i === 0 ? `M${toSvg(p.x)},${toSvg(p.y)}` : `L${toSvg(p.x)},${toSvg(p.y)}`
          )
          .join('')
      : '';

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Loss Landscape Explorer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Watch gradient descent navigate a loss landscape. Adjust the learning rate
        and optimizer to see how training behavior changes.
      </p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Loss landscape visualization */}
        <div className="flex-1 min-w-0">
          <svg
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="w-full h-auto bg-gray-950 rounded-lg"
            style={{ maxWidth: '440px' }}
          >
            {/* Heatmap cells */}
            {HEATMAP.map((row, ri) =>
              row.map((color, ci) => (
                <rect
                  key={`h-${ri}-${ci}`}
                  x={ci * CELL_SIZE}
                  y={ri * CELL_SIZE}
                  width={CELL_SIZE + 0.5}
                  height={CELL_SIZE + 0.5}
                  fill={color}
                />
              ))
            )}

            {/* Contour lines */}
            {CONTOUR_PATHS.map((cp, i) => (
              <path
                key={`contour-${i}`}
                d={cp.d}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.8}
              />
            ))}

            {/* Global minimum marker */}
            <circle
              cx={toSvg(6.0)}
              cy={toSvg(6.0)}
              r={5}
              fill="none"
              stroke="#22c55e"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.7}
            />
            <text
              x={toSvg(6.0)}
              y={toSvg(6.0) - 10}
              textAnchor="middle"
              fill="#22c55e"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
              opacity={0.8}
            >
              global min
            </text>

            {/* Local minimum marker */}
            <circle
              cx={toSvg(2.5)}
              cy={toSvg(3.0)}
              r={4}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.2}
              strokeDasharray="3 2"
              opacity={0.6}
            />
            <text
              x={toSvg(2.5)}
              y={toSvg(3.0) - 8}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize="8"
              fontFamily="system-ui, sans-serif"
              opacity={0.7}
            >
              local min
            </text>

            {/* Trail path */}
            {trailPath && (
              <motion.path
                d={trailPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.8}
                strokeDasharray="4 3"
                strokeOpacity={0.7}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Trail dots */}
            {trail.map((p, i) => (
              <circle
                key={`trail-${i}`}
                cx={toSvg(p.x)}
                cy={toSvg(p.y)}
                r={i === trail.length - 1 ? 0 : 2}
                fill="rgba(255,255,255,0.5)"
              />
            ))}

            {/* Current position (the "ball") */}
            <AnimatePresence mode="wait">
              <motion.g
                key={`ball-${currentPos.x.toFixed(3)}-${currentPos.y.toFixed(3)}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                {/* Glow */}
                <circle
                  cx={toSvg(currentPos.x)}
                  cy={toSvg(currentPos.y)}
                  r={12}
                  fill="rgba(255,255,255,0.08)"
                />
                {/* Ball */}
                <circle
                  cx={toSvg(currentPos.x)}
                  cy={toSvg(currentPos.y)}
                  r={7}
                  fill="#ffffff"
                  stroke="#f8fafc"
                  strokeWidth={2}
                />
                {/* Inner dot */}
                <circle
                  cx={toSvg(currentPos.x)}
                  cy={toSvg(currentPos.y)}
                  r={2.5}
                  fill={optimizer === 'adam' ? '#a855f7' : '#3b82f6'}
                />
              </motion.g>
            </AnimatePresence>

            {/* Axis labels */}
            <text
              x={SVG_SIZE / 2}
              y={SVG_SIZE - 4}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
            >
              Weight 1
            </text>
            <text
              x={10}
              y={SVG_SIZE / 2}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
              transform={`rotate(-90, 10, ${SVG_SIZE / 2})`}
            >
              Weight 2
            </text>
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: 'rgb(10,20,80)' }} />
              <span>Low loss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: 'rgb(230,80,30)' }} />
              <span>High loss</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>Current position</span>
            </div>
          </div>
        </div>

        {/* Controls + info side panel */}
        <div className="lg:w-64 space-y-4">
          {/* Stats panel */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Training Status</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Step</span>
              <span className="text-white font-mono">{step}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Loss</span>
              <motion.span
                className="font-mono font-bold"
                style={{
                  color: currentLoss < 2.0 ? '#22c55e' : currentLoss < 3.5 ? '#eab308' : '#ef4444',
                }}
                key={currentLoss.toFixed(3)}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15 }}
              >
                {currentLoss.toFixed(4)}
              </motion.span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Learning rate</span>
              <span className="text-white font-mono">{learningRate.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Optimizer</span>
              <span className="text-white font-mono uppercase">{optimizer}</span>
            </div>

            {/* Mini loss bar */}
            <div className="pt-1">
              <div className="text-xs text-gray-500 mb-1">Loss progress</div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      currentLoss < 2.0 ? '#22c55e' : currentLoss < 3.5 ? '#eab308' : '#ef4444',
                  }}
                  animate={{
                    width: `${Math.max(3, Math.min(100, ((6.5 - currentLoss) / 5.0) * 100))}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Learning rate slider */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Learning Rate</label>
              <span className="text-sm font-mono text-blue-400">{learningRate.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min={0.001}
              max={1.0}
              step={0.001}
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={isTraining}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.001 (slow)</span>
              <span>1.0 (fast)</span>
            </div>
          </div>

          {/* Optimizer toggle */}
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-300 block mb-2">Optimizer</label>
            <div className="flex gap-2">
              <button
                onClick={() => !isTraining && setOptimizer('sgd')}
                disabled={isTraining}
                className={`flex-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  optimizer === 'sgd'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                SGD
              </button>
              <button
                onClick={() => !isTraining && setOptimizer('adam')}
                disabled={isTraining}
                className={`flex-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  optimizer === 'adam'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${isTraining ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Adam
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={runTraining}
              disabled={isTraining}
              className={`flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
                isTraining
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              {isTraining ? 'Training...' : 'Train (20 steps)'}
            </button>
            <button
              onClick={reset}
              disabled={isTraining}
              className={`text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
                isTraining
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Hint */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              <strong className="text-blue-200">Try this:</strong>{' '}
              Set learning rate to 0.8 with SGD and watch the ball overshoot.
              Then switch to Adam and see how momentum smooths the path.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
