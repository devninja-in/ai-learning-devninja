'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// SVG layout constants
const SVG_SIZE = 400;
const CENTER = SVG_SIZE / 2;
const SCALE = 35; // pixels per unit
const GRID_RANGE = 5;

function clampForDisplay(val: number): string {
  return val.toFixed(2);
}

export default function MathIntuitionSim() {
  const [ax, setAx] = useState(3);
  const [ay, setAy] = useState(2);
  const [bx, setBx] = useState(-1);
  const [by, setBy] = useState(4);

  const dotProduct = useMemo(() => ax * bx + ay * by, [ax, ay, bx, by]);

  const magnitudeA = useMemo(() => Math.sqrt(ax * ax + ay * ay), [ax, ay]);
  const magnitudeB = useMemo(() => Math.sqrt(bx * bx + by * by), [bx, by]);

  const angleDeg = useMemo(() => {
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, dotProduct / (magnitudeA * magnitudeB)));
    return (Math.acos(cosTheta) * 180) / Math.PI;
  }, [dotProduct, magnitudeA, magnitudeB]);

  const similarity = useMemo(() => {
    if (magnitudeA === 0 || magnitudeB === 0) return 'neutral' as const;
    if (Math.abs(dotProduct) < 0.5) return 'perpendicular' as const;
    if (dotProduct > 0) return 'similar' as const;
    return 'opposite' as const;
  }, [dotProduct, magnitudeA, magnitudeB]);

  const similarityConfig = {
    similar: { label: 'Similar', color: '#22c55e', bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-400' },
    opposite: { label: 'Opposite', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400' },
    perpendicular: { label: 'Perpendicular', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-400' },
    neutral: { label: 'Zero vector', color: '#6b7280', bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-400' },
  };

  const sim = similarityConfig[similarity];

  // Convert vector coordinates to SVG coordinates (flip y-axis)
  const toSvgX = (x: number) => CENTER + x * SCALE;
  const toSvgY = (y: number) => CENTER - y * SCALE;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Vector Dot Product Explorer</h3>
      <p className="text-sm text-gray-400 mb-6">
        Adjust the vectors below and watch how the dot product changes.
        This is how AI measures whether two things are similar.
      </p>

      {/* Vector controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Vector A controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-blue-400">Vector A</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">x</label>
              <span className="text-xs font-mono text-blue-400">{ax}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={ax}
              onChange={(e) => setAx(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">y</label>
              <span className="text-xs font-mono text-blue-400">{ay}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={ay}
              onChange={(e) => setAy(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Vector B controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-400">Vector B</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">x</label>
              <span className="text-xs font-mono text-green-400">{bx}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={bx}
              onChange={(e) => setBx(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">y</label>
              <span className="text-xs font-mono text-green-400">{by}</span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={by}
              onChange={(e) => setBy(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>
      </div>

      {/* SVG Grid and Vectors */}
      <div className="flex justify-center mb-6">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full h-auto bg-gray-950 rounded-lg"
          style={{ maxWidth: '400px', maxHeight: '400px' }}
        >
          {/* Grid lines */}
          {Array.from({ length: GRID_RANGE * 2 + 1 }, (_, i) => i - GRID_RANGE).map((val) => (
            <g key={`grid-${val}`}>
              {/* Vertical line */}
              <line
                x1={toSvgX(val)}
                y1={0}
                x2={toSvgX(val)}
                y2={SVG_SIZE}
                stroke={val === 0 ? '#4b5563' : '#1f2937'}
                strokeWidth={val === 0 ? 1.5 : 0.5}
              />
              {/* Horizontal line */}
              <line
                x1={0}
                y1={toSvgY(val)}
                x2={SVG_SIZE}
                y2={toSvgY(val)}
                stroke={val === 0 ? '#4b5563' : '#1f2937'}
                strokeWidth={val === 0 ? 1.5 : 0.5}
              />
              {/* X-axis labels */}
              {val !== 0 && (
                <text
                  x={toSvgX(val)}
                  y={CENTER + 14}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              )}
              {/* Y-axis labels */}
              {val !== 0 && (
                <text
                  x={CENTER - 12}
                  y={toSvgY(val) + 3}
                  textAnchor="end"
                  fill="#6b7280"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              )}
            </g>
          ))}

          {/* Angle arc (when both vectors are non-zero) */}
          {magnitudeA > 0 && magnitudeB > 0 && (
            <motion.path
              d={(() => {
                const arcRadius = 30;
                const angleA = Math.atan2(ay, ax);
                const angleB = Math.atan2(by, bx);

                // Determine the smaller angle between the two vectors
                let startAngle = angleA;
                let endAngle = angleB;
                let diff = endAngle - startAngle;
                // Normalize to [-PI, PI]
                while (diff > Math.PI) diff -= 2 * Math.PI;
                while (diff < -Math.PI) diff += 2 * Math.PI;

                if (diff < 0) {
                  startAngle = angleB;
                  endAngle = angleA;
                  diff = -diff;
                }

                const largeArc = diff > Math.PI ? 1 : 0;

                const x1 = CENTER + arcRadius * Math.cos(startAngle);
                const y1 = CENTER - arcRadius * Math.sin(startAngle);
                const x2 = CENTER + arcRadius * Math.cos(endAngle);
                const y2 = CENTER - arcRadius * Math.sin(endAngle);

                return `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${x2} ${y2}`;
              })()}
              fill="none"
              stroke={sim.color}
              strokeWidth={1.5}
              strokeOpacity={0.6}
              strokeDasharray="4 3"
            />
          )}

          {/* Vector A (blue arrow) */}
          <defs>
            <marker
              id="arrowA"
              markerWidth="10"
              markerHeight="8"
              refX="9"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill="#3b82f6" />
            </marker>
            <marker
              id="arrowB"
              markerWidth="10"
              markerHeight="8"
              refX="9"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill="#22c55e" />
            </marker>
          </defs>

          <motion.line
            x1={CENTER}
            y1={CENTER}
            x2={toSvgX(ax)}
            y2={toSvgY(ay)}
            stroke="#3b82f6"
            strokeWidth={2.5}
            markerEnd="url(#arrowA)"
            animate={{ x2: toSvgX(ax), y2: toSvgY(ay) }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />

          {/* Vector A label */}
          {magnitudeA > 0 && (
            <motion.text
              x={toSvgX(ax) + (ax >= 0 ? 8 : -8)}
              y={toSvgY(ay) + (ay >= 0 ? -6 : 14)}
              textAnchor={ax >= 0 ? 'start' : 'end'}
              fill="#93c5fd"
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              animate={{
                x: toSvgX(ax) + (ax >= 0 ? 8 : -8),
                y: toSvgY(ay) + (ay >= 0 ? -6 : 14),
              }}
              transition={{ duration: 0.15 }}
            >
              A
            </motion.text>
          )}

          {/* Vector B (green arrow) */}
          <motion.line
            x1={CENTER}
            y1={CENTER}
            x2={toSvgX(bx)}
            y2={toSvgY(by)}
            stroke="#22c55e"
            strokeWidth={2.5}
            markerEnd="url(#arrowB)"
            animate={{ x2: toSvgX(bx), y2: toSvgY(by) }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />

          {/* Vector B label */}
          {magnitudeB > 0 && (
            <motion.text
              x={toSvgX(bx) + (bx >= 0 ? 8 : -8)}
              y={toSvgY(by) + (by >= 0 ? -6 : 14)}
              textAnchor={bx >= 0 ? 'start' : 'end'}
              fill="#86efac"
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              animate={{
                x: toSvgX(bx) + (bx >= 0 ? 8 : -8),
                y: toSvgY(by) + (by >= 0 ? -6 : 14),
              }}
              transition={{ duration: 0.15 }}
            >
              B
            </motion.text>
          )}

          {/* Origin dot */}
          <circle cx={CENTER} cy={CENTER} r={3} fill="#9ca3af" />
        </svg>
      </div>

      {/* Results panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Dot product */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Dot Product</div>
          <div className="text-sm text-gray-500 mb-2 font-mono">
            ({clampForDisplay(ax)} x {clampForDisplay(bx)}) + ({clampForDisplay(ay)} x {clampForDisplay(by)})
          </div>
          <motion.div
            className="text-2xl font-bold font-mono"
            style={{ color: sim.color }}
            key={dotProduct}
            initial={{ scale: 1.15, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {clampForDisplay(dotProduct)}
          </motion.div>
        </div>

        {/* Angle */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Angle Between</div>
          <motion.div
            className="text-2xl font-bold font-mono text-gray-200 mt-4"
            key={angleDeg.toFixed(0)}
            initial={{ scale: 1.15, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {angleDeg.toFixed(1)}&deg;
          </motion.div>
        </div>

        {/* Similarity indicator */}
        <div className={`rounded-lg p-4 text-center border-2 ${sim.border} ${sim.bg}`}>
          <div className="text-xs text-gray-400 mb-1">Similarity</div>
          <motion.div
            className={`text-2xl font-bold mt-4 ${sim.text}`}
            key={similarity}
            initial={{ scale: 1.15, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {sim.label}
          </motion.div>
        </div>
      </div>

      {/* AI connection callout */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong> This is exactly how AI
          measures if two words mean similar things. Words like &quot;king&quot; and
          &quot;queen&quot; get represented as vectors that point in similar directions &mdash;
          their dot product is large and positive. Words like &quot;hot&quot; and
          &quot;cold&quot; point in opposite directions &mdash; negative dot product.
        </p>
      </div>
    </div>
  );
}
