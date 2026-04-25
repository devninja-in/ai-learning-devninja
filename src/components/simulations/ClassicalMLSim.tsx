'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types & constants
// -------------------------------------------------------------------

type Algorithm = 'linear' | 'decision-tree' | 'knn' | 'kmeans';

interface DataPoint {
  x: number;
  y: number;
  cls: 0 | 1; // class label (0 = blue, 1 = red)
}

// 30 hand-placed points in two classes — designed so that each algorithm
// produces visually distinct decision boundaries.
const DATA: DataPoint[] = [
  // Class 0 (blue) — generally lower-left
  { x: 1.2, y: 1.5, cls: 0 },
  { x: 1.8, y: 2.1, cls: 0 },
  { x: 2.5, y: 1.0, cls: 0 },
  { x: 2.0, y: 3.0, cls: 0 },
  { x: 3.0, y: 1.8, cls: 0 },
  { x: 1.5, y: 3.5, cls: 0 },
  { x: 2.8, y: 2.5, cls: 0 },
  { x: 0.8, y: 2.8, cls: 0 },
  { x: 3.5, y: 2.0, cls: 0 },
  { x: 1.0, y: 4.0, cls: 0 },
  { x: 2.3, y: 3.8, cls: 0 },
  { x: 3.2, y: 3.2, cls: 0 },
  { x: 1.5, y: 1.0, cls: 0 },
  { x: 0.5, y: 1.8, cls: 0 },
  { x: 3.8, y: 3.0, cls: 0 },

  // Class 1 (red) — generally upper-right
  { x: 5.5, y: 5.0, cls: 1 },
  { x: 6.0, y: 6.5, cls: 1 },
  { x: 7.0, y: 5.5, cls: 1 },
  { x: 5.8, y: 7.0, cls: 1 },
  { x: 6.5, y: 4.8, cls: 1 },
  { x: 7.5, y: 6.0, cls: 1 },
  { x: 5.0, y: 6.2, cls: 1 },
  { x: 6.8, y: 7.5, cls: 1 },
  { x: 8.0, y: 5.8, cls: 1 },
  { x: 7.2, y: 7.0, cls: 1 },
  { x: 5.2, y: 4.5, cls: 1 },
  { x: 4.8, y: 5.5, cls: 1 },
  { x: 8.2, y: 7.2, cls: 1 },
  { x: 6.2, y: 8.0, cls: 1 },
  { x: 7.8, y: 8.5, cls: 1 },
];

const ALGO_LABELS: Record<Algorithm, string> = {
  linear: 'Linear Classification',
  'decision-tree': 'Decision Tree',
  knn: 'K-Nearest Neighbors',
  kmeans: 'K-Means Clustering',
};

const ALGO_DESCRIPTIONS: Record<Algorithm, string> = {
  linear: 'Draws the best straight line to separate the two classes. Simple, fast, and easy to interpret.',
  'decision-tree': 'Splits the space with horizontal and vertical lines, like asking yes/no questions.',
  knn: 'Click anywhere on the plot to classify a new point based on its K nearest neighbors.',
  kmeans: 'Groups all points into K clusters by finding the best center for each group. No labels needed.',
};

// SVG dimensions
const SVG_W = 560;
const SVG_H = 480;
const PAD = 40;
const PLOT_W = SVG_W - PAD * 2;
const PLOT_H = SVG_H - PAD * 2;
const X_MIN = 0;
const X_MAX = 9;
const Y_MIN = 0;
const Y_MAX = 9;

function toSvgX(x: number) {
  return PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W;
}
function toSvgY(y: number) {
  return PAD + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * PLOT_H;
}
function fromSvgX(sx: number) {
  return X_MIN + ((sx - PAD) / PLOT_W) * (X_MAX - X_MIN);
}
function fromSvgY(sy: number) {
  return Y_MAX - ((sy - PAD) / PLOT_H) * (Y_MAX - Y_MIN);
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// -------------------------------------------------------------------
// Algorithm computations
// -------------------------------------------------------------------

// Linear: best separating line via centroid bisector
function computeLinearBoundary() {
  const c0 = DATA.filter((d) => d.cls === 0);
  const c1 = DATA.filter((d) => d.cls === 1);
  const cx0 = c0.reduce((s, d) => s + d.x, 0) / c0.length;
  const cy0 = c0.reduce((s, d) => s + d.y, 0) / c0.length;
  const cx1 = c1.reduce((s, d) => s + d.x, 0) / c1.length;
  const cy1 = c1.reduce((s, d) => s + d.y, 0) / c1.length;
  // Midpoint
  const mx = (cx0 + cx1) / 2;
  const my = (cy0 + cy1) / 2;
  // Direction perpendicular to the line connecting centroids
  const dx = cx1 - cx0;
  const dy = cy1 - cy0;
  // Perpendicular: (-dy, dx)
  const len = Math.sqrt(dy * dy + dx * dx);
  const px = -dy / len;
  const py = dx / len;
  // Extend line across the plot
  const t = 12;
  return {
    x1: mx - px * t,
    y1: my - py * t,
    x2: mx + px * t,
    y2: my + py * t,
  };
}

// Decision tree: 2 splits
const DT_SPLIT_X = 4.2;
const DT_SPLIT_Y = 4.0;

// K-Means: run Lloyd's algorithm
function runKMeans(k: number): { centroids: { x: number; y: number }[]; assignments: number[] } {
  // Deterministic initial centroids spread across the data range
  const initialCentroids: { x: number; y: number }[] = [];
  if (k === 2) {
    initialCentroids.push({ x: 2.0, y: 2.5 }, { x: 6.5, y: 6.0 });
  } else if (k === 3) {
    initialCentroids.push({ x: 1.5, y: 2.0 }, { x: 5.0, y: 5.0 }, { x: 7.5, y: 7.0 });
  } else {
    initialCentroids.push(
      { x: 1.5, y: 1.5 },
      { x: 3.0, y: 4.0 },
      { x: 6.0, y: 5.0 },
      { x: 7.5, y: 7.5 }
    );
  }

  let centroids = initialCentroids.map((c) => ({ ...c }));
  let assignments = new Array(DATA.length).fill(0);

  for (let iter = 0; iter < 20; iter++) {
    // Assign each point to the nearest centroid
    const newAssignments = DATA.map((d) => {
      let minDist = Infinity;
      let minIdx = 0;
      centroids.forEach((c, i) => {
        const d2 = dist(d, c);
        if (d2 < minDist) {
          minDist = d2;
          minIdx = i;
        }
      });
      return minIdx;
    });

    // Recompute centroids
    const newCentroids = centroids.map((_, i) => {
      const members = DATA.filter((_, j) => newAssignments[j] === i);
      if (members.length === 0) return centroids[i];
      return {
        x: members.reduce((s, m) => s + m.x, 0) / members.length,
        y: members.reduce((s, m) => s + m.y, 0) / members.length,
      };
    });

    centroids = newCentroids;
    assignments = newAssignments;
  }

  return { centroids, assignments };
}

const CLUSTER_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];
const CLUSTER_COLORS_LIGHT = ['#93c5fd', '#fca5a5', '#86efac', '#fcd34d'];

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function ClassicalMLSim() {
  const [algo, setAlgo] = useState<Algorithm>('linear');
  const [kValue, setKValue] = useState(3);
  const [kMeansClusters, setKMeansClusters] = useState(2);
  const [knnProbe, setKnnProbe] = useState<{ x: number; y: number } | null>(null);

  // Linear boundary (static)
  const linearBoundary = useMemo(computeLinearBoundary, []);

  // K-Means result
  const kmeansResult = useMemo(() => runKMeans(kMeansClusters), [kMeansClusters]);

  // KNN: find K nearest neighbors to the probe point
  const knnResult = useMemo(() => {
    if (!knnProbe) return null;
    const withDist = DATA.map((d, i) => ({
      index: i,
      dist: dist(d, knnProbe),
      cls: d.cls,
    }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, kValue);

    const votes0 = withDist.filter((d) => d.cls === 0).length;
    const votes1 = withDist.filter((d) => d.cls === 1).length;
    const prediction = votes0 >= votes1 ? 0 : 1;

    return { neighbors: withDist, prediction, votes0, votes1 };
  }, [knnProbe, kValue]);

  // Handle SVG click for KNN
  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (algo !== 'knn') return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = SVG_W / rect.width;
      const scaleY = SVG_H / rect.height;
      const sx = (e.clientX - rect.left) * scaleX;
      const sy = (e.clientY - rect.top) * scaleY;
      const x = fromSvgX(sx);
      const y = fromSvgY(sy);
      if (x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX) {
        setKnnProbe({ x, y });
      }
    },
    [algo]
  );

  // Determine point color based on algorithm
  const getPointColor = useCallback(
    (pt: DataPoint, index: number) => {
      if (algo === 'kmeans') {
        return CLUSTER_COLORS[kmeansResult.assignments[index]];
      }
      return pt.cls === 0 ? '#3b82f6' : '#ef4444';
    },
    [algo, kmeansResult]
  );

  // Compute max cluster radius for K-Means circles
  const kmeansRadii = useMemo(() => {
    if (algo !== 'kmeans') return [];
    return kmeansResult.centroids.map((c, i) => {
      const members = DATA.filter((_, j) => kmeansResult.assignments[j] === i);
      if (members.length === 0) return 0;
      return Math.max(...members.map((m) => dist(m, c))) + 0.3;
    });
  }, [algo, kmeansResult]);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Algorithm Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {ALGO_DESCRIPTIONS[algo]}
      </p>

      {/* Algorithm toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(ALGO_LABELS) as Algorithm[]).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAlgo(a);
              setKnnProbe(null);
            }}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              algo === a
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {ALGO_LABELS[a]}
          </button>
        ))}
      </div>

      {/* Parameter slider */}
      <AnimatePresence mode="wait">
        {algo === 'knn' && (
          <motion.div
            key="knn-slider"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-4 bg-gray-800 rounded-lg px-4 py-3">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                K = {kValue}
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={kValue}
                onChange={(e) => setKValue(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-xs text-gray-500">1 - 7</span>
            </div>
          </motion.div>
        )}
        {algo === 'kmeans' && (
          <motion.div
            key="kmeans-slider"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-4 bg-gray-800 rounded-lg px-4 py-3">
              <label className="text-sm text-gray-300 whitespace-nowrap">
                Clusters = {kMeansClusters}
              </label>
              <input
                type="range"
                min={2}
                max={4}
                value={kMeansClusters}
                onChange={(e) => setKMeansClusters(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-xs text-gray-500">2 - 4</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG scatter plot */}
      <div className="flex justify-center mb-4">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className={`w-full h-auto bg-gray-950 rounded-lg ${
            algo === 'knn' ? 'cursor-crosshair' : ''
          }`}
          style={{ maxWidth: '560px' }}
          onClick={handleSvgClick}
        >
          {/* Faint grid */}
          {Array.from({ length: 10 }, (_, i) => i).map((v) => (
            <g key={`grid-${v}`}>
              <line
                x1={toSvgX(v)}
                y1={PAD}
                x2={toSvgX(v)}
                y2={SVG_H - PAD}
                stroke="#1f2937"
                strokeWidth={0.5}
              />
              <line
                x1={PAD}
                y1={toSvgY(v)}
                x2={SVG_W - PAD}
                y2={toSvgY(v)}
                stroke="#1f2937"
                strokeWidth={0.5}
              />
            </g>
          ))}

          {/* Decision boundary / algorithm overlay */}
          <AnimatePresence mode="wait">
            {/* LINEAR: separating line */}
            {algo === 'linear' && (
              <motion.g key="linear-overlay">
                {/* Shaded regions */}
                <motion.polygon
                  points={(() => {
                    // Blue region (class 0 side)
                    const line = linearBoundary;
                    // Build a polygon for the lower-left half
                    const pts = [
                      `${PAD},${SVG_H - PAD}`,
                      `${PAD},${PAD}`,
                      `${toSvgX(line.x1)},${toSvgY(line.y1)}`,
                      `${toSvgX(line.x2)},${toSvgY(line.y2)}`,
                      `${SVG_W - PAD},${SVG_H - PAD}`,
                    ].join(' ');
                    return pts;
                  })()}
                  fill="#3b82f6"
                  fillOpacity={0.06}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.polygon
                  points={(() => {
                    const line = linearBoundary;
                    const pts = [
                      `${SVG_W - PAD},${PAD}`,
                      `${PAD},${PAD}`,
                      `${toSvgX(line.x1)},${toSvgY(line.y1)}`,
                      `${toSvgX(line.x2)},${toSvgY(line.y2)}`,
                      `${SVG_W - PAD},${SVG_H - PAD}`,
                    ].join(' ');
                    return pts;
                  })()}
                  fill="#ef4444"
                  fillOpacity={0.06}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.line
                  x1={toSvgX(linearBoundary.x1)}
                  y1={toSvgY(linearBoundary.y1)}
                  x2={toSvgX(linearBoundary.x2)}
                  y2={toSvgY(linearBoundary.y2)}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.text
                  x={toSvgX(linearBoundary.x2) - 10}
                  y={toSvgY(linearBoundary.y2) - 8}
                  fill="#f59e0b"
                  fontSize="11"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  decision boundary
                </motion.text>
              </motion.g>
            )}

            {/* DECISION TREE: rectangular splits */}
            {algo === 'decision-tree' && (
              <motion.g key="dt-overlay">
                {/* Shaded regions */}
                {/* Bottom-left: blue region (x < DT_SPLIT_X and y < DT_SPLIT_Y) */}
                <motion.rect
                  x={PAD}
                  y={toSvgY(DT_SPLIT_Y)}
                  width={toSvgX(DT_SPLIT_X) - PAD}
                  height={SVG_H - PAD - toSvgY(DT_SPLIT_Y)}
                  fill="#3b82f6"
                  fillOpacity={0.08}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                {/* Top-left: blue region (x < DT_SPLIT_X and y >= DT_SPLIT_Y) */}
                <motion.rect
                  x={PAD}
                  y={PAD}
                  width={toSvgX(DT_SPLIT_X) - PAD}
                  height={toSvgY(DT_SPLIT_Y) - PAD}
                  fill="#3b82f6"
                  fillOpacity={0.05}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                {/* Bottom-right: mixed region */}
                <motion.rect
                  x={toSvgX(DT_SPLIT_X)}
                  y={toSvgY(DT_SPLIT_Y)}
                  width={SVG_W - PAD - toSvgX(DT_SPLIT_X)}
                  height={SVG_H - PAD - toSvgY(DT_SPLIT_Y)}
                  fill="#a855f7"
                  fillOpacity={0.06}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                {/* Top-right: red region (x >= DT_SPLIT_X and y >= DT_SPLIT_Y) */}
                <motion.rect
                  x={toSvgX(DT_SPLIT_X)}
                  y={PAD}
                  width={SVG_W - PAD - toSvgX(DT_SPLIT_X)}
                  height={toSvgY(DT_SPLIT_Y) - PAD}
                  fill="#ef4444"
                  fillOpacity={0.08}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Vertical split line */}
                <motion.line
                  x1={toSvgX(DT_SPLIT_X)}
                  y1={PAD}
                  x2={toSvgX(DT_SPLIT_X)}
                  y2={SVG_H - PAD}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Horizontal split line */}
                <motion.line
                  x1={PAD}
                  y1={toSvgY(DT_SPLIT_Y)}
                  x2={SVG_W - PAD}
                  y2={toSvgY(DT_SPLIT_Y)}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                {/* Labels */}
                <motion.text
                  x={toSvgX(DT_SPLIT_X) + 6}
                  y={PAD + 16}
                  fill="#22c55e"
                  fontSize="10"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  x &gt; {DT_SPLIT_X}?
                </motion.text>
                <motion.text
                  x={SVG_W - PAD - 60}
                  y={toSvgY(DT_SPLIT_Y) - 6}
                  fill="#22c55e"
                  fontSize="10"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  y &gt; {DT_SPLIT_Y}?
                </motion.text>
              </motion.g>
            )}

            {/* KNN: probe point + neighbor lines */}
            {algo === 'knn' && knnProbe && knnResult && (
              <motion.g key="knn-overlay">
                {/* Lines to neighbors */}
                {knnResult.neighbors.map((n) => (
                  <motion.line
                    key={`knn-line-${n.index}`}
                    x1={toSvgX(knnProbe.x)}
                    y1={toSvgY(knnProbe.y)}
                    x2={toSvgX(DATA[n.index].x)}
                    y2={toSvgY(DATA[n.index].y)}
                    stroke={n.cls === 0 ? '#93c5fd' : '#fca5a5'}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                  />
                ))}
                {/* Highlight rings on neighbors */}
                {knnResult.neighbors.map((n) => (
                  <motion.circle
                    key={`knn-ring-${n.index}`}
                    cx={toSvgX(DATA[n.index].x)}
                    cy={toSvgY(DATA[n.index].y)}
                    r={10}
                    fill="none"
                    stroke={n.cls === 0 ? '#3b82f6' : '#ef4444'}
                    strokeWidth={2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  />
                ))}
                {/* Probe point */}
                <motion.circle
                  cx={toSvgX(knnProbe.x)}
                  cy={toSvgY(knnProbe.y)}
                  r={8}
                  fill={knnResult.prediction === 0 ? '#3b82f6' : '#ef4444'}
                  fillOpacity={0.4}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                />
                <motion.text
                  x={toSvgX(knnProbe.x)}
                  y={toSvgY(knnProbe.y) - 14}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {knnResult.prediction === 0 ? 'Blue' : 'Red'}
                </motion.text>
              </motion.g>
            )}

            {/* K-MEANS: centroids + cluster circles */}
            {algo === 'kmeans' && (
              <motion.g key="kmeans-overlay">
                {kmeansResult.centroids.map((c, i) => (
                  <motion.g key={`kmeans-c-${i}`}>
                    {/* Cluster boundary circle */}
                    <motion.circle
                      cx={toSvgX(c.x)}
                      cy={toSvgY(c.y)}
                      r={
                        kmeansRadii[i]
                          ? (kmeansRadii[i] / (X_MAX - X_MIN)) * PLOT_W
                          : 0
                      }
                      fill={CLUSTER_COLORS[i]}
                      fillOpacity={0.06}
                      stroke={CLUSTER_COLORS[i]}
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      strokeOpacity={0.5}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    />
                    {/* Centroid marker */}
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <line
                        x1={toSvgX(c.x) - 6}
                        y1={toSvgY(c.y) - 6}
                        x2={toSvgX(c.x) + 6}
                        y2={toSvgY(c.y) + 6}
                        stroke={CLUSTER_COLORS_LIGHT[i]}
                        strokeWidth={2.5}
                      />
                      <line
                        x1={toSvgX(c.x) + 6}
                        y1={toSvgY(c.y) - 6}
                        x2={toSvgX(c.x) - 6}
                        y2={toSvgY(c.y) + 6}
                        stroke={CLUSTER_COLORS_LIGHT[i]}
                        strokeWidth={2.5}
                      />
                    </motion.g>
                    {/* Centroid label */}
                    <motion.text
                      x={toSvgX(c.x)}
                      y={toSvgY(c.y) - 12}
                      textAnchor="middle"
                      fill={CLUSTER_COLORS_LIGHT[i]}
                      fontSize="10"
                      fontFamily="system-ui, sans-serif"
                      fontWeight="bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      C{i + 1}
                    </motion.text>
                  </motion.g>
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Data points */}
          {DATA.map((pt, i) => {
            const color = getPointColor(pt, i);
            const isKnnNeighbor =
              algo === 'knn' &&
              knnResult?.neighbors.some((n) => n.index === i);
            return (
              <motion.circle
                key={`pt-${i}`}
                cx={toSvgX(pt.x)}
                cy={toSvgY(pt.y)}
                r={isKnnNeighbor ? 6 : 5}
                fill={color}
                fillOpacity={isKnnNeighbor ? 1 : 0.8}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.015, duration: 0.3 }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs text-gray-400">
        {algo === 'kmeans' ? (
          kmeansResult.centroids.map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CLUSTER_COLORS[i] }}
              />
              <span>Cluster {i + 1}</span>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Class A</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Class B</span>
            </div>
          </>
        )}
      </div>

      {/* KNN result panel */}
      <AnimatePresence>
        {algo === 'knn' && knnProbe && knnResult && (
          <motion.div
            className="bg-gray-800 rounded-lg p-4 mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              K = {kValue} Nearest Neighbors
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-300">
                  Blue votes: {knnResult.votes0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-300">
                  Red votes: {knnResult.votes1}
                </span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-white font-medium">
                Prediction:{' '}
                <span
                  className={
                    knnResult.prediction === 0
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }
                >
                  {knnResult.prediction === 0 ? 'Class A (Blue)' : 'Class B (Red)'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight callout */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">Key insight:</strong>{' '}
          {algo === 'linear' &&
            'A linear classifier draws one straight line. It works great when data is cleanly separable, but fails on complex patterns. Still used everywhere because it is fast and interpretable.'}
          {algo === 'decision-tree' &&
            'Decision trees split the space into rectangles by asking yes/no questions. Easy to understand and explain, but can overfit if you allow too many splits.'}
          {algo === 'knn' &&
            'KNN makes no assumptions about the data shape. It simply memorizes all examples and classifies new points by majority vote. Try different K values to see how it changes.'}
          {algo === 'kmeans' &&
            'K-Means is unsupervised: it ignores labels and discovers natural groupings. Adjust the cluster count to see how the algorithm partitions the same data differently.'}
        </p>
      </div>
    </div>
  );
}
