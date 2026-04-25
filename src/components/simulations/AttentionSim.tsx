'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type HeadMode = 'single' | 'multi';

interface SentenceData {
  text: string;
  /** weights[queryIndex][keyIndex] — attention from query word to every key word */
  weights: number[][];
  /** For multi-head: head2 has a different attention pattern */
  weightsHead2: number[][];
}

// -------------------------------------------------------------------
// Pre-computed attention weights for sample sentences
// -------------------------------------------------------------------

const SENTENCES: SentenceData[] = [
  {
    text: 'The cat sat on the mat because it was tired',
    // Head 1: syntactic / coreference pattern — "it" attends to "cat"
    weights: [
      //  The   cat   sat   on    the   mat   because it   was   tired
      [0.35, 0.15, 0.10, 0.08, 0.12, 0.08, 0.04, 0.03, 0.03, 0.02], // The
      [0.10, 0.30, 0.15, 0.05, 0.05, 0.15, 0.05, 0.05, 0.05, 0.05], // cat
      [0.08, 0.25, 0.20, 0.12, 0.05, 0.15, 0.05, 0.03, 0.04, 0.03], // sat
      [0.06, 0.08, 0.20, 0.25, 0.12, 0.18, 0.04, 0.03, 0.02, 0.02], // on
      [0.15, 0.05, 0.05, 0.15, 0.25, 0.20, 0.05, 0.03, 0.04, 0.03], // the
      [0.05, 0.10, 0.12, 0.18, 0.15, 0.25, 0.05, 0.03, 0.04, 0.03], // mat
      [0.04, 0.10, 0.08, 0.04, 0.04, 0.08, 0.30, 0.15, 0.10, 0.07], // because
      [0.05, 0.35, 0.05, 0.03, 0.05, 0.05, 0.12, 0.15, 0.08, 0.07], // it (→ cat!)
      [0.03, 0.08, 0.05, 0.03, 0.03, 0.05, 0.10, 0.18, 0.30, 0.15], // was
      [0.03, 0.15, 0.05, 0.03, 0.03, 0.05, 0.08, 0.12, 0.16, 0.30], // tired
    ],
    // Head 2: positional / local context pattern
    weightsHead2: [
      [0.40, 0.30, 0.10, 0.05, 0.05, 0.03, 0.03, 0.02, 0.01, 0.01],
      [0.25, 0.30, 0.25, 0.08, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01],
      [0.10, 0.25, 0.30, 0.20, 0.05, 0.04, 0.03, 0.01, 0.01, 0.01],
      [0.05, 0.08, 0.25, 0.30, 0.20, 0.05, 0.03, 0.02, 0.01, 0.01],
      [0.04, 0.05, 0.08, 0.20, 0.30, 0.22, 0.05, 0.03, 0.02, 0.01],
      [0.03, 0.04, 0.05, 0.10, 0.22, 0.30, 0.15, 0.05, 0.04, 0.02],
      [0.02, 0.03, 0.04, 0.05, 0.08, 0.15, 0.30, 0.20, 0.08, 0.05],
      [0.01, 0.02, 0.03, 0.04, 0.05, 0.08, 0.20, 0.30, 0.18, 0.09],
      [0.01, 0.01, 0.02, 0.03, 0.04, 0.05, 0.08, 0.20, 0.35, 0.21],
      [0.01, 0.01, 0.01, 0.02, 0.03, 0.04, 0.06, 0.10, 0.22, 0.50],
    ],
  },
  {
    text: 'The bank by the river was steep',
    weights: [
      // The   bank  by    the   river was   steep
      [0.30, 0.25, 0.10, 0.15, 0.10, 0.05, 0.05], // The
      [0.10, 0.25, 0.12, 0.05, 0.28, 0.10, 0.10], // bank (→ river!)
      [0.08, 0.15, 0.25, 0.12, 0.20, 0.10, 0.10], // by
      [0.15, 0.08, 0.10, 0.25, 0.25, 0.10, 0.07], // the
      [0.05, 0.28, 0.15, 0.12, 0.25, 0.08, 0.07], // river (→ bank!)
      [0.05, 0.15, 0.08, 0.05, 0.10, 0.30, 0.27], // was
      [0.04, 0.22, 0.08, 0.04, 0.15, 0.17, 0.30], // steep (→ bank)
    ],
    weightsHead2: [
      [0.40, 0.30, 0.12, 0.08, 0.05, 0.03, 0.02],
      [0.25, 0.35, 0.22, 0.08, 0.05, 0.03, 0.02],
      [0.08, 0.22, 0.35, 0.18, 0.10, 0.04, 0.03],
      [0.05, 0.08, 0.20, 0.35, 0.20, 0.07, 0.05],
      [0.03, 0.05, 0.10, 0.22, 0.35, 0.15, 0.10],
      [0.02, 0.04, 0.05, 0.08, 0.18, 0.40, 0.23],
      [0.02, 0.03, 0.04, 0.05, 0.10, 0.26, 0.50],
    ],
  },
  {
    text: 'She gave him the book that he wanted',
    weights: [
      // She   gave  him   the   book  that  he    wanted
      [0.35, 0.20, 0.10, 0.05, 0.08, 0.05, 0.10, 0.07], // She
      [0.20, 0.25, 0.18, 0.05, 0.15, 0.05, 0.05, 0.07], // gave
      [0.12, 0.18, 0.25, 0.05, 0.10, 0.05, 0.18, 0.07], // him
      [0.05, 0.08, 0.05, 0.25, 0.35, 0.10, 0.05, 0.07], // the
      [0.08, 0.18, 0.10, 0.15, 0.20, 0.10, 0.05, 0.14], // book
      [0.05, 0.08, 0.05, 0.10, 0.25, 0.25, 0.08, 0.14], // that
      [0.15, 0.05, 0.30, 0.03, 0.05, 0.07, 0.25, 0.10], // he (→ him / She)
      [0.08, 0.12, 0.08, 0.08, 0.22, 0.12, 0.10, 0.20], // wanted (→ book)
    ],
    weightsHead2: [
      [0.40, 0.28, 0.12, 0.06, 0.05, 0.04, 0.03, 0.02],
      [0.22, 0.30, 0.25, 0.08, 0.06, 0.04, 0.03, 0.02],
      [0.10, 0.25, 0.30, 0.15, 0.08, 0.05, 0.04, 0.03],
      [0.05, 0.08, 0.15, 0.30, 0.25, 0.08, 0.05, 0.04],
      [0.04, 0.06, 0.08, 0.22, 0.30, 0.15, 0.08, 0.07],
      [0.03, 0.05, 0.06, 0.10, 0.18, 0.32, 0.15, 0.11],
      [0.02, 0.04, 0.05, 0.06, 0.10, 0.18, 0.35, 0.20],
      [0.02, 0.03, 0.04, 0.05, 0.08, 0.12, 0.22, 0.44],
    ],
  },
  {
    text: 'The animal did not cross the street because it was too wide',
    weights: [
      // The  animal did   not  cross the  street because it   was   too  wide
      [0.30, 0.18, 0.08, 0.05, 0.08, 0.12, 0.06, 0.04, 0.03, 0.03, 0.02, 0.01], // The
      [0.12, 0.25, 0.08, 0.05, 0.10, 0.05, 0.12, 0.05, 0.06, 0.04, 0.04, 0.04], // animal
      [0.05, 0.10, 0.25, 0.18, 0.20, 0.05, 0.05, 0.04, 0.03, 0.02, 0.02, 0.01], // did
      [0.04, 0.05, 0.18, 0.25, 0.22, 0.05, 0.05, 0.05, 0.04, 0.03, 0.02, 0.02], // not
      [0.05, 0.15, 0.10, 0.10, 0.20, 0.08, 0.18, 0.04, 0.03, 0.03, 0.02, 0.02], // cross
      [0.12, 0.05, 0.04, 0.03, 0.08, 0.25, 0.25, 0.05, 0.04, 0.04, 0.03, 0.02], // the
      [0.05, 0.08, 0.04, 0.04, 0.18, 0.15, 0.22, 0.06, 0.04, 0.05, 0.05, 0.04], // street
      [0.03, 0.08, 0.05, 0.08, 0.10, 0.04, 0.10, 0.25, 0.10, 0.08, 0.05, 0.04], // because
      [0.03, 0.08, 0.03, 0.04, 0.05, 0.05, 0.30, 0.10, 0.15, 0.07, 0.05, 0.05], // it (→ street!)
      [0.02, 0.05, 0.03, 0.03, 0.04, 0.04, 0.08, 0.10, 0.15, 0.28, 0.10, 0.08], // was
      [0.02, 0.04, 0.02, 0.03, 0.03, 0.03, 0.08, 0.05, 0.08, 0.15, 0.30, 0.17], // too
      [0.02, 0.05, 0.02, 0.02, 0.04, 0.04, 0.18, 0.06, 0.08, 0.10, 0.14, 0.25], // wide (→ street)
    ],
    weightsHead2: [
      [0.38, 0.30, 0.10, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01, 0.00, 0.00],
      [0.22, 0.30, 0.22, 0.08, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01, 0.00],
      [0.08, 0.20, 0.30, 0.20, 0.08, 0.05, 0.04, 0.02, 0.01, 0.01, 0.01, 0.00],
      [0.05, 0.08, 0.20, 0.30, 0.18, 0.06, 0.05, 0.03, 0.02, 0.01, 0.01, 0.01],
      [0.04, 0.06, 0.10, 0.18, 0.28, 0.15, 0.08, 0.04, 0.03, 0.02, 0.01, 0.01],
      [0.03, 0.04, 0.05, 0.08, 0.15, 0.30, 0.20, 0.06, 0.04, 0.03, 0.01, 0.01],
      [0.02, 0.03, 0.04, 0.05, 0.08, 0.18, 0.32, 0.14, 0.06, 0.04, 0.02, 0.02],
      [0.01, 0.02, 0.03, 0.04, 0.05, 0.08, 0.15, 0.32, 0.15, 0.08, 0.04, 0.03],
      [0.01, 0.01, 0.02, 0.03, 0.04, 0.05, 0.08, 0.18, 0.33, 0.14, 0.06, 0.05],
      [0.01, 0.01, 0.01, 0.02, 0.03, 0.04, 0.05, 0.08, 0.16, 0.35, 0.14, 0.10],
      [0.00, 0.01, 0.01, 0.01, 0.02, 0.03, 0.04, 0.05, 0.08, 0.16, 0.35, 0.24],
      [0.00, 0.01, 0.01, 0.01, 0.02, 0.02, 0.03, 0.04, 0.06, 0.10, 0.22, 0.48],
    ],
  },
];

// -------------------------------------------------------------------
// Color helpers
// -------------------------------------------------------------------

/** Map a 0..1 weight to an RGBA blue for head 1 */
function weightToColor1(w: number, alpha = 1): string {
  const intensity = Math.round(80 + w * 175);
  return `rgba(59, ${intensity}, 246, ${alpha})`;
}

/** Map a 0..1 weight to an RGBA amber for head 2 */
function weightToColor2(w: number, alpha = 1): string {
  const intensity = Math.round(80 + w * 175);
  return `rgba(${intensity}, 158, 11, ${alpha})`;
}

// -------------------------------------------------------------------
// SVG attention lines
// -------------------------------------------------------------------

interface AttentionLinesProps {
  words: string[];
  queryIndex: number;
  weights: number[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  wordRefs: React.RefObject<(HTMLDivElement | null)[]>;
  color: (w: number) => string;
  yOffset?: number;
}

function AttentionLines({
  words,
  queryIndex,
  weights,
  containerRef,
  wordRefs,
  color,
  yOffset = 0,
}: AttentionLinesProps) {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

  // Recompute positions on mount / resize
  useEffect(() => {
    function compute() {
      if (!containerRef.current || !wordRefs.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const pos = wordRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top - containerRect.top + yOffset,
        };
      });
      setPositions(pos);
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [containerRef, wordRefs, words, queryIndex, yOffset]);

  if (positions.length < words.length) return null;

  const qPos = positions[queryIndex];
  if (!qPos) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      {weights.map((w, i) => {
        if (i === queryIndex) return null;
        const tPos = positions[i];
        if (!tPos) return null;
        const thickness = 1 + w * 7;
        return (
          <motion.line
            key={i}
            x1={qPos.x}
            y1={qPos.y}
            x2={tPos.x}
            y2={tPos.y}
            stroke={color(w)}
            strokeWidth={thickness}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.35 + w * 0.65, pathLength: 1 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          />
        );
      })}
    </svg>
  );
}

// -------------------------------------------------------------------
// Bar chart
// -------------------------------------------------------------------

interface AttentionBarChartProps {
  words: string[];
  weights: number[];
  queryIndex: number;
  color: (w: number) => string;
  label?: string;
}

function AttentionBarChart({ words, weights, queryIndex, color, label }: AttentionBarChartProps) {
  const maxWeight = Math.max(...weights);
  return (
    <div>
      {label && (
        <div className="text-xs font-medium text-gray-400 mb-2">{label}</div>
      )}
      <div className="flex items-end gap-1.5 h-28">
        {words.map((word, i) => {
          const w = weights[i];
          const heightPct = maxWeight > 0 ? (w / maxWeight) * 100 : 0;
          const isQuery = i === queryIndex;
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0 h-full justify-end">
              <span className="text-[10px] text-gray-400 mb-1 font-mono">
                {w.toFixed(2)}
              </span>
              <motion.div
                className="w-full rounded-t-sm"
                style={{
                  backgroundColor: isQuery ? '#6b7280' : color(w),
                }}
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              />
              <span
                className={`text-[10px] mt-1 truncate w-full text-center ${
                  isQuery ? 'text-white font-bold' : 'text-gray-500'
                }`}
              >
                {word}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

export default function AttentionSim() {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [queryIndex, setQueryIndex] = useState<number | null>(null);
  const [headMode, setHeadMode] = useState<HeadMode>('single');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sentence = SENTENCES[sentenceIndex];
  const words = useMemo(() => sentence.text.split(' '), [sentence]);

  // Reset query when sentence changes
  const handleSentenceChange = useCallback((idx: number) => {
    setSentenceIndex(idx);
    setQueryIndex(null);
  }, []);

  const handleWordClick = useCallback((idx: number) => {
    setQueryIndex((prev) => (prev === idx ? null : idx));
  }, []);

  const head1Weights = queryIndex !== null ? sentence.weights[queryIndex] : null;
  const head2Weights = queryIndex !== null ? sentence.weightsHead2[queryIndex] : null;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Attention Weight Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Click any word to select it as the &quot;query.&quot; Lines show how much attention
        that word pays to every other word. Thicker, brighter lines = higher attention weight.
      </p>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Head mode toggle */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Attention Heads
          </label>
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setHeadMode('single')}
              className={`text-sm px-4 py-2 font-medium transition-colors ${
                headMode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Single Head
            </button>
            <button
              onClick={() => setHeadMode('multi')}
              className={`text-sm px-4 py-2 font-medium transition-colors ${
                headMode === 'multi'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Multi-Head (2)
            </button>
          </div>
        </div>

        {/* Sentence selector */}
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Sentence
          </label>
          <div className="flex gap-2 flex-wrap">
            {SENTENCES.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSentenceChange(i)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  sentenceIndex === i
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s.text.slice(0, 24)}{s.text.length > 24 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Word tokens with attention lines */}
      <div className="relative mb-6" ref={containerRef}>
        {/* SVG attention lines rendered behind the words */}
        <AnimatePresence>
          {queryIndex !== null && head1Weights && (
            <AttentionLines
              key={`head1-${sentenceIndex}-${queryIndex}`}
              words={words}
              queryIndex={queryIndex}
              weights={head1Weights}
              containerRef={containerRef}
              wordRefs={wordRefs}
              color={(w) => weightToColor1(w)}
              yOffset={-4}
            />
          )}
          {headMode === 'multi' && queryIndex !== null && head2Weights && (
            <AttentionLines
              key={`head2-${sentenceIndex}-${queryIndex}`}
              words={words}
              queryIndex={queryIndex}
              weights={head2Weights}
              containerRef={containerRef}
              wordRefs={wordRefs}
              color={(w) => weightToColor2(w)}
              yOffset={4}
            />
          )}
        </AnimatePresence>

        {/* Word tokens */}
        <div className="flex flex-wrap gap-2 justify-center relative z-10 py-4">
          {words.map((word, i) => {
            const isQuery = i === queryIndex;
            const hasAttention = queryIndex !== null && head1Weights !== null;
            const weight = hasAttention ? head1Weights[i] : 0;

            return (
              <motion.div
                key={`${sentenceIndex}-${i}`}
                ref={(el) => {
                  if (wordRefs.current) wordRefs.current[i] = el;
                }}
                onClick={() => handleWordClick(i)}
                className="cursor-pointer select-none"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`
                    px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200
                    ${isQuery
                      ? 'border-white bg-white/15 text-white shadow-lg shadow-white/10'
                      : hasAttention
                        ? 'border-blue-500/40 text-gray-200'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                    }
                  `}
                  style={
                    hasAttention && !isQuery
                      ? {
                          borderColor: weightToColor1(weight, 0.5 + weight * 0.5),
                          backgroundColor: weightToColor1(weight, weight * 0.2),
                        }
                      : undefined
                  }
                >
                  {word}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Instruction or bar charts */}
      {queryIndex === null ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          Click a word above to see its attention pattern
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-300">
              Attention from{' '}
              <strong className="text-white">&quot;{words[queryIndex]}&quot;</strong>
              {' '}to every word:
            </span>
          </div>

          {/* Head 1 bar chart */}
          <AttentionBarChart
            words={words}
            weights={head1Weights!}
            queryIndex={queryIndex}
            color={(w) => weightToColor1(w)}
            label={headMode === 'multi' ? 'Head 1 — semantic / coreference' : undefined}
          />

          {/* Head 2 bar chart (multi-head mode) */}
          {headMode === 'multi' && head2Weights && (
            <AttentionBarChart
              words={words}
              weights={head2Weights}
              queryIndex={queryIndex}
              color={(w) => weightToColor2(w)}
              label="Head 2 — positional / local context"
            />
          )}

          {/* Interpretation callout */}
          <div className="mt-3 text-xs text-gray-400 leading-relaxed">
            {headMode === 'single' ? (
              <p>
                The attention scores show which words the model considers most relevant
                when processing &quot;{words[queryIndex]}.&quot; Higher scores mean
                stronger influence on the representation of this word.
              </p>
            ) : (
              <p>
                <strong className="text-blue-400">Head 1</strong> captures semantic
                relationships (coreference, meaning).{' '}
                <strong className="text-amber-400">Head 2</strong> captures local/positional
                patterns (nearby words). Different heads learn different aspects of language
                &mdash; this is why multi-head attention is so powerful.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Head legend */}
      {headMode === 'multi' && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full bg-blue-500" />
            <span>Head 1 &mdash; semantic patterns</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-1 rounded-full bg-amber-500" />
            <span>Head 2 &mdash; positional patterns</span>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="mt-5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          <strong className="text-blue-200">Try this:</strong>{' '}
          In &quot;The cat sat on the mat because it was tired,&quot; click on
          &quot;it&quot; &mdash; notice the strong attention toward
          &quot;cat.&quot; The model has learned coreference resolution! Then
          switch to Multi-Head to see how different heads capture different
          patterns.
        </p>
      </div>
    </div>
  );
}
