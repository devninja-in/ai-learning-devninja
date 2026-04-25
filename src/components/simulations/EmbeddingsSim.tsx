'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Pre-computed 2D positions for ~20 words, grouped into 4 clusters.
// These are *not* real embeddings -- just hand-placed so the clusters
// look natural on a 2D scatter plot.
// -------------------------------------------------------------------

interface WordPoint {
  word: string;
  x: number;
  y: number;
  cluster: 'animal' | 'color' | 'action' | 'food';
}

const WORDS: WordPoint[] = [
  // Animals (upper-left region)
  { word: 'cat',     x: -3.2, y: 3.4,  cluster: 'animal' },
  { word: 'dog',     x: -2.5, y: 3.8,  cluster: 'animal' },
  { word: 'fish',    x: -3.8, y: 2.6,  cluster: 'animal' },
  { word: 'bird',    x: -2.0, y: 3.1,  cluster: 'animal' },
  { word: 'horse',   x: -3.5, y: 4.1,  cluster: 'animal' },

  // Colors (lower-left region)
  { word: 'red',     x: -3.0, y: -2.8, cluster: 'color' },
  { word: 'blue',    x: -3.6, y: -3.5, cluster: 'color' },
  { word: 'green',   x: -2.4, y: -3.2, cluster: 'color' },
  { word: 'yellow',  x: -2.8, y: -2.1, cluster: 'color' },
  { word: 'purple',  x: -3.9, y: -2.5, cluster: 'color' },

  // Actions (upper-right region)
  { word: 'run',     x: 3.0,  y: 3.2,  cluster: 'action' },
  { word: 'walk',    x: 2.4,  y: 2.7,  cluster: 'action' },
  { word: 'jump',    x: 3.5,  y: 3.8,  cluster: 'action' },
  { word: 'swim',    x: 2.8,  y: 2.2,  cluster: 'action' },
  { word: 'climb',   x: 3.8,  y: 2.9,  cluster: 'action' },

  // Food (lower-right region)
  { word: 'pizza',   x: 2.6,  y: -3.0, cluster: 'food' },
  { word: 'burger',  x: 3.2,  y: -2.5, cluster: 'food' },
  { word: 'rice',    x: 2.0,  y: -3.5, cluster: 'food' },
  { word: 'pasta',   x: 3.6,  y: -3.3, cluster: 'food' },
  { word: 'sushi',   x: 2.8,  y: -3.9, cluster: 'food' },
];

// Special words for the King - Man + Woman demo
const ANALOGY_WORDS: WordPoint[] = [
  { word: 'king',    x: 0.8,  y: 1.6,  cluster: 'action' },
  { word: 'queen',   x: -0.8, y: 1.6,  cluster: 'action' },
  { word: 'man',     x: 0.8,  y: -0.2, cluster: 'action' },
  { word: 'woman',   x: -0.8, y: -0.2, cluster: 'action' },
];

const ALL_WORDS = [...WORDS, ...ANALOGY_WORDS];

// Some extra words the user can "search for" with interpolated positions
const SEARCHABLE_EXTRAS: Record<string, { x: number; y: number; cluster: WordPoint['cluster'] }> = {
  kitten:   { x: -2.9, y: 3.1,  cluster: 'animal' },
  puppy:    { x: -2.3, y: 3.5,  cluster: 'animal' },
  orange:   { x: -2.6, y: -2.6, cluster: 'color' },
  sprint:   { x: 3.3,  y: 3.5,  cluster: 'action' },
  steak:    { x: 3.0,  y: -2.8, cluster: 'food' },
  taco:     { x: 2.4,  y: -2.9, cluster: 'food' },
  rabbit:   { x: -3.0, y: 3.6,  cluster: 'animal' },
  jog:      { x: 2.6,  y: 3.0,  cluster: 'action' },
  pink:     { x: -3.3, y: -2.9, cluster: 'color' },
  prince:   { x: 0.5,  y: 1.2,  cluster: 'action' },
  princess: { x: -0.5, y: 1.2,  cluster: 'action' },
};

const CLUSTER_CONFIG = {
  animal: { fill: '#3b82f6', label: 'Animals', light: '#93c5fd' },
  color:  { fill: '#a855f7', label: 'Colors',  light: '#d8b4fe' },
  action: { fill: '#22c55e', label: 'Actions', light: '#86efac' },
  food:   { fill: '#f59e0b', label: 'Food',    light: '#fcd34d' },
} as const;

// SVG constants
const SVG_W = 560;
const SVG_H = 480;
const PAD = 40;
const PLOT_W = SVG_W - PAD * 2;
const PLOT_H = SVG_H - PAD * 2;
const RANGE = 5; // -5 to 5

function toSvgX(x: number) { return PAD + ((x + RANGE) / (RANGE * 2)) * PLOT_W; }
function toSvgY(y: number) { return PAD + ((RANGE - y) / (RANGE * 2)) * PLOT_H; }

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function cosineSimilarity(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dot = a.x * b.x + a.y * b.y;
  const magA = Math.sqrt(a.x ** 2 + a.y ** 2);
  const magB = Math.sqrt(b.x ** 2 + b.y ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function EmbeddingsSim() {
  const [selected, setSelected] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchedWord, setSearchedWord] = useState<{ word: string; x: number; y: number; cluster: WordPoint['cluster'] } | null>(null);
  const [showAnalogy, setShowAnalogy] = useState(false);

  // Nearest neighbors for the selected word
  const neighbors = useMemo(() => {
    if (!selected) return [];
    const sel = ALL_WORDS.find((w) => w.word === selected) ?? searchedWord;
    if (!sel) return [];
    return ALL_WORDS
      .filter((w) => w.word !== selected)
      .map((w) => ({ word: w.word, dist: euclidean(sel, w), sim: cosineSimilarity(sel, w) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
  }, [selected, searchedWord]);

  // Handle searching for a word
  const handleSearch = useCallback(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return;
    // Check if it already exists in ALL_WORDS
    const existing = ALL_WORDS.find((w) => w.word === term);
    if (existing) {
      setSelected(existing.word);
      setSearchedWord(null);
      return;
    }
    // Check extras
    const extra = SEARCHABLE_EXTRAS[term];
    if (extra) {
      setSearchedWord({ word: term, ...extra });
      setSelected(term);
      return;
    }
    // Unknown word -- place it near the center with slight randomish offset
    // (deterministic based on character codes so it's stable)
    const hash = term.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const radius = 0.5 + (hash % 20) / 20;
    setSearchedWord({
      word: term,
      x: parseFloat((Math.cos(angle) * radius).toFixed(2)),
      y: parseFloat((Math.sin(angle) * radius).toFixed(2)),
      cluster: 'action',
    });
    setSelected(term);
  }, [searchInput]);

  // Analogy result
  const analogyResult = useMemo(() => {
    if (!showAnalogy) return null;
    const king  = ANALOGY_WORDS.find((w) => w.word === 'king')!;
    const man   = ANALOGY_WORDS.find((w) => w.word === 'man')!;
    const woman = ANALOGY_WORDS.find((w) => w.word === 'woman')!;
    // king - man + woman
    const rx = king.x - man.x + woman.x;
    const ry = king.y - man.y + woman.y;
    return { x: rx, y: ry, word: 'queen' };
  }, [showAnalogy]);

  // Build the set of points to render
  const visiblePoints: (WordPoint & { isSearched?: boolean })[] = useMemo(() => {
    const pts = [...ALL_WORDS.map((w) => ({ ...w, isSearched: false }))];
    if (searchedWord && !ALL_WORDS.find((w) => w.word === searchedWord.word)) {
      pts.push({ ...searchedWord, isSearched: true });
    }
    return pts;
  }, [searchedWord]);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Word Embedding Space
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Each dot is a word, plotted by meaning. Click any word to see its nearest
        neighbors. Words close together have similar meanings.
      </p>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Type a word to plot it..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Plot
        </button>
      </div>

      {/* SVG scatter plot */}
      <div className="flex justify-center mb-4">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto bg-gray-950 rounded-lg"
          style={{ maxWidth: '560px' }}
        >
          {/* Faint grid */}
          {Array.from({ length: 11 }, (_, i) => i - 5).map((v) => (
            <g key={`grid-${v}`}>
              <line
                x1={toSvgX(v)} y1={PAD} x2={toSvgX(v)} y2={SVG_H - PAD}
                stroke={v === 0 ? '#374151' : '#1f2937'} strokeWidth={v === 0 ? 1 : 0.5}
              />
              <line
                x1={PAD} y1={toSvgY(v)} x2={SVG_W - PAD} y2={toSvgY(v)}
                stroke={v === 0 ? '#374151' : '#1f2937'} strokeWidth={v === 0 ? 1 : 0.5}
              />
            </g>
          ))}

          {/* Neighbor connecting lines */}
          {selected && neighbors.map((n) => {
            const sel = visiblePoints.find((w) => w.word === selected);
            const nb  = visiblePoints.find((w) => w.word === n.word);
            if (!sel || !nb) return null;
            return (
              <motion.line
                key={`line-${n.word}`}
                x1={toSvgX(sel.x)} y1={toSvgY(sel.y)}
                x2={toSvgX(nb.x)} y2={toSvgY(nb.y)}
                stroke="#6b7280" strokeWidth={1} strokeDasharray="4 3"
                initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
              />
            );
          })}

          {/* Analogy arrows */}
          <AnimatePresence>
            {showAnalogy && (
              <>
                {/* king -> man (subtract) */}
                <motion.line
                  x1={toSvgX(0.8)} y1={toSvgY(1.6)}
                  x2={toSvgX(0.8)} y2={toSvgY(-0.2)}
                  stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4"
                  markerEnd="url(#arrowRed)"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
                />
                {/* man -> woman (add) */}
                <motion.line
                  x1={toSvgX(0.8)} y1={toSvgY(-0.2)}
                  x2={toSvgX(-0.8)} y2={toSvgY(-0.2)}
                  stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4"
                  markerEnd="url(#arrowGreen)"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
                />
                {/* woman -> result (queen) */}
                <motion.line
                  x1={toSvgX(-0.8)} y1={toSvgY(-0.2)}
                  x2={toSvgX(analogyResult!.x)} y2={toSvgY(analogyResult!.y)}
                  stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4"
                  markerEnd="url(#arrowAmber)"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} exit={{ opacity: 0 }}
                />
                {/* Result highlight ring */}
                <motion.circle
                  cx={toSvgX(analogyResult!.x)} cy={toSvgY(analogyResult!.y)}
                  r={14}
                  fill="none" stroke="#f59e0b" strokeWidth={2.5}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Arrow markers */}
          <defs>
            <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
            <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
            </marker>
            <marker id="arrowAmber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Word dots */}
          {visiblePoints.map((pt) => {
            const cfg = CLUSTER_CONFIG[pt.cluster];
            const isSelected = pt.word === selected;
            const isNeighbor = neighbors.some((n) => n.word === pt.word);
            return (
              <g
                key={pt.word}
                className="cursor-pointer"
                onClick={() => setSelected(pt.word === selected ? null : pt.word)}
              >
                {/* Selection ring */}
                {isSelected && (
                  <motion.circle
                    cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r={11}
                    fill="none" stroke="#ffffff" strokeWidth={2}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}
                {/* Dot */}
                <motion.circle
                  cx={toSvgX(pt.x)}
                  cy={toSvgY(pt.y)}
                  r={isSelected ? 7 : isNeighbor ? 6 : 5}
                  fill={cfg.fill}
                  fillOpacity={isSelected || isNeighbor ? 1 : 0.7}
                  stroke={pt.isSearched ? '#ffffff' : 'none'}
                  strokeWidth={pt.isSearched ? 1.5 : 0}
                  whileHover={{ r: 8 }}
                />
                {/* Label */}
                <text
                  x={toSvgX(pt.x)}
                  y={toSvgY(pt.y) - 10}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : cfg.light}
                  fontSize={isSelected ? '11' : '9'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="system-ui, sans-serif"
                  opacity={isSelected || isNeighbor ? 1 : 0.8}
                >
                  {pt.word}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Cluster legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs text-gray-400">
        {Object.entries(CLUSTER_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.fill }} />
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Nearest neighbors panel */}
      <AnimatePresence>
        {selected && neighbors.length > 0 && (
          <motion.div
            className="bg-gray-800 rounded-lg p-4 mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              3 nearest neighbors of &quot;{selected}&quot;
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {neighbors.map((n, i) => (
                <div
                  key={n.word}
                  className="bg-gray-900 rounded-lg px-3 py-2 text-center cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setSelected(n.word)}
                >
                  <div className="text-white font-medium text-sm">{n.word}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    distance: {n.dist.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    cosine sim: {n.sim.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">#{i + 1}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* King - Man + Woman demo */}
      <div className="border border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-semibold text-gray-300">
            Vector Arithmetic: King &minus; Man + Woman = ?
          </h4>
          <button
            onClick={() => setShowAnalogy(!showAnalogy)}
            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
              showAnalogy
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {showAnalogy ? 'Hide' : 'Show'} Analogy
          </button>
        </div>

        <AnimatePresence>
          {showAnalogy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm my-3">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded font-mono">king</span>
                <span className="text-red-400 font-bold">&minus;</span>
                <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded font-mono">man</span>
                <span className="text-green-400 font-bold">+</span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded font-mono">woman</span>
                <span className="text-gray-400">=</span>
                <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded font-mono font-bold">queen</span>
              </div>
              <p className="text-xs text-gray-400 text-center">
                The direction from &quot;man&quot; to &quot;king&quot; (royalty) is the same as
                from &quot;woman&quot; to &quot;queen.&quot; Gender and royalty are separate
                directions in the embedding space.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI connection */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong> Real word embeddings
          work in hundreds of dimensions, not just two. But the same idea applies &mdash;
          words with similar meanings cluster together, and vector arithmetic captures
          relationships like analogy, gender, and tense. This is the foundation that
          powers modern search engines, recommendation systems, and large language models.
        </p>
      </div>
    </div>
  );
}
