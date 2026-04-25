'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface WordProbability {
  word: string;
  probability: number;
}

interface ContextEntry {
  prompt: string;
  candidates: WordProbability[];
}

// -------------------------------------------------------------------
// Pre-computed probability distributions for different prompts
// -------------------------------------------------------------------

const PRESET_PROMPTS = [
  'The cat sat on the',
  'Once upon a time there',
  'The weather today is',
  'In the beginning of the',
  'She picked up the phone',
];

/**
 * For every context string, we store the top-8 candidate next-words with
 * "raw" logits (unnormalized). Temperature / top-k are applied at render time.
 */
const CONTEXT_TABLE: Record<string, WordProbability[]> = {
  'The cat sat on the': [
    { word: 'mat', probability: 3.2 },
    { word: 'floor', probability: 2.6 },
    { word: 'couch', probability: 2.3 },
    { word: 'bed', probability: 2.0 },
    { word: 'roof', probability: 1.4 },
    { word: 'table', probability: 1.1 },
    { word: 'chair', probability: 0.8 },
    { word: 'windowsill', probability: 0.5 },
  ],
  'Once upon a time there': [
    { word: 'was', probability: 4.5 },
    { word: 'lived', probability: 3.0 },
    { word: 'existed', probability: 1.8 },
    { word: 'came', probability: 1.5 },
    { word: 'stood', probability: 1.0 },
    { word: 'appeared', probability: 0.9 },
    { word: 'sat', probability: 0.6 },
    { word: 'dwelt', probability: 0.4 },
  ],
  'The weather today is': [
    { word: 'sunny', probability: 3.0 },
    { word: 'beautiful', probability: 2.7 },
    { word: 'cold', probability: 2.4 },
    { word: 'warm', probability: 2.1 },
    { word: 'rainy', probability: 1.6 },
    { word: 'perfect', probability: 1.3 },
    { word: 'terrible', probability: 0.9 },
    { word: 'unpredictable', probability: 0.5 },
  ],
  'In the beginning of the': [
    { word: 'story', probability: 3.1 },
    { word: 'year', probability: 2.8 },
    { word: 'book', probability: 2.3 },
    { word: 'chapter', probability: 2.0 },
    { word: 'movie', probability: 1.5 },
    { word: 'journey', probability: 1.2 },
    { word: 'game', probability: 0.8 },
    { word: 'century', probability: 0.6 },
  ],
  'She picked up the phone': [
    { word: 'and', probability: 3.8 },
    { word: 'to', probability: 2.5 },
    { word: 'quickly', probability: 1.8 },
    { word: 'nervously', probability: 1.4 },
    { word: 'again', probability: 1.2 },
    { word: 'immediately', probability: 1.0 },
    { word: 'reluctantly', probability: 0.7 },
    { word: 'slowly', probability: 0.5 },
  ],
};

/**
 * Continuation entries — after the user generates a word we look up the new
 * context in this table. We store enough for a ~5-word continuation chain.
 */
const CONTINUATION_TABLE: Record<string, WordProbability[]> = {
  'The cat sat on the mat': [
    { word: 'and', probability: 3.5 },
    { word: 'while', probability: 2.2 },
    { word: 'in', probability: 1.8 },
    { word: 'because', probability: 1.5 },
    { word: 'quietly', probability: 1.1 },
    { word: 'purring', probability: 0.9 },
    { word: 'happily', probability: 0.7 },
    { word: 'waiting', probability: 0.4 },
  ],
  'The cat sat on the floor': [
    { word: 'and', probability: 3.3 },
    { word: 'beside', probability: 2.1 },
    { word: 'watching', probability: 1.7 },
    { word: 'near', probability: 1.4 },
    { word: 'quietly', probability: 1.2 },
    { word: 'licking', probability: 0.9 },
    { word: 'staring', probability: 0.7 },
    { word: 'purring', probability: 0.5 },
  ],
  'Once upon a time there was': [
    { word: 'a', probability: 4.2 },
    { word: 'an', probability: 2.5 },
    { word: 'nothing', probability: 1.0 },
    { word: 'only', probability: 0.9 },
    { word: 'once', probability: 0.7 },
    { word: 'something', probability: 0.6 },
    { word: 'peace', probability: 0.4 },
    { word: 'silence', probability: 0.3 },
  ],
  'Once upon a time there lived': [
    { word: 'a', probability: 4.0 },
    { word: 'an', probability: 2.3 },
    { word: 'the', probability: 1.2 },
    { word: 'two', probability: 1.0 },
    { word: 'three', probability: 0.6 },
    { word: 'many', probability: 0.5 },
    { word: 'one', probability: 0.4 },
    { word: 'no', probability: 0.3 },
  ],
  'The weather today is sunny': [
    { word: 'and', probability: 3.6 },
    { word: 'with', probability: 2.4 },
    { word: 'but', probability: 1.8 },
    { word: 'so', probability: 1.3 },
    { word: 'making', probability: 1.0 },
    { word: 'outside', probability: 0.7 },
    { word: 'which', probability: 0.5 },
    { word: 'perfect', probability: 0.4 },
  ],
  'The weather today is beautiful': [
    { word: 'and', probability: 3.4 },
    { word: 'with', probability: 2.2 },
    { word: 'so', probability: 1.7 },
    { word: 'outside', probability: 1.3 },
    { word: 'perfect', probability: 1.1 },
    { word: 'making', probability: 0.8 },
    { word: 'compared', probability: 0.5 },
    { word: 'unlike', probability: 0.3 },
  ],
  'In the beginning of the story': [
    { word: 'the', probability: 3.2 },
    { word: 'a', probability: 2.5 },
    { word: 'we', probability: 1.8 },
    { word: 'there', probability: 1.5 },
    { word: 'our', probability: 1.0 },
    { word: 'everything', probability: 0.8 },
    { word: 'nothing', probability: 0.6 },
    { word: 'it', probability: 0.4 },
  ],
  'She picked up the phone and': [
    { word: 'called', probability: 3.4 },
    { word: 'dialed', probability: 2.6 },
    { word: 'answered', probability: 2.0 },
    { word: 'texted', probability: 1.5 },
    { word: 'hung', probability: 1.1 },
    { word: 'listened', probability: 0.8 },
    { word: 'pressed', probability: 0.6 },
    { word: 'looked', probability: 0.4 },
  ],
  'She picked up the phone to': [
    { word: 'call', probability: 3.6 },
    { word: 'check', probability: 2.4 },
    { word: 'dial', probability: 1.8 },
    { word: 'text', probability: 1.4 },
    { word: 'see', probability: 1.1 },
    { word: 'answer', probability: 0.8 },
    { word: 'read', probability: 0.5 },
    { word: 'send', probability: 0.4 },
  ],
};

// -------------------------------------------------------------------
// Utility: apply softmax with temperature
// -------------------------------------------------------------------

function applySoftmaxWithTemperature(
  candidates: WordProbability[],
  temperature: number,
  topK: number
): WordProbability[] {
  const sliced = candidates.slice(0, topK);

  // Scale logits by temperature
  const scaled = sliced.map((c) => c.probability / temperature);

  // Numerical stability: subtract max
  const maxVal = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - maxVal));
  const sumExps = exps.reduce((a, b) => a + b, 0);

  return sliced.map((c, i) => ({
    word: c.word,
    probability: exps[i] / sumExps,
  }));
}

// -------------------------------------------------------------------
// Utility: weighted random pick
// -------------------------------------------------------------------

function weightedPick(candidates: WordProbability[]): string {
  const r = Math.random();
  let cumulative = 0;
  for (const c of candidates) {
    cumulative += c.probability;
    if (r <= cumulative) return c.word;
  }
  return candidates[candidates.length - 1].word;
}

// -------------------------------------------------------------------
// Fallback generator — deterministic fake distribution for unknown
// contexts, so the chain never stalls.
// -------------------------------------------------------------------

function fallbackCandidates(context: string): WordProbability[] {
  const fallbackWords = ['the', 'and', 'a', 'to', 'was', 'in', 'of', 'that'];
  // Use context length as a seed-like offset for slight variation
  const seed = context.length % 8;
  return fallbackWords.map((w, i) => ({
    word: w,
    probability: 3.5 - ((i + seed) % 8) * 0.4,
  }));
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

const MAX_GENERATED_WORDS = 8;

export default function LLMSim() {
  const [prompt, setPrompt] = useState(PRESET_PROMPTS[0]);
  const [generatedWords, setGeneratedWords] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState(8);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [lastPicked, setLastPicked] = useState<string | null>(null);

  // Build the current full context string
  const currentContext = useMemo(() => {
    const parts = [prompt, ...generatedWords];
    return parts.join(' ');
  }, [prompt, generatedWords]);

  // Look up raw candidates for the current context
  const rawCandidates = useMemo((): WordProbability[] => {
    // Try exact match in main or continuation table
    const found =
      CONTEXT_TABLE[currentContext] ?? CONTINUATION_TABLE[currentContext];
    if (found) return found;

    // Try matching last 6 words (sliding window)
    const words = currentContext.split(' ');
    for (let window = 6; window >= 3; window--) {
      const key = words.slice(-window).join(' ');
      const match =
        CONTEXT_TABLE[key] ?? CONTINUATION_TABLE[key];
      if (match) return match;
    }

    return fallbackCandidates(currentContext);
  }, [currentContext]);

  // Apply temperature and top-k
  const processedCandidates = useMemo(
    () => applySoftmaxWithTemperature(rawCandidates, temperature, topK),
    [rawCandidates, temperature, topK]
  );

  const canGenerate = generatedWords.length < MAX_GENERATED_WORDS;

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    const picked = weightedPick(processedCandidates);
    setLastPicked(picked);
    setGeneratedWords((prev) => [...prev, picked]);
  }, [canGenerate, processedCandidates]);

  const handleReset = useCallback(() => {
    setGeneratedWords([]);
    setLastPicked(null);
    setHighlightedWord(null);
  }, []);

  const handlePreset = useCallback(
    (p: string) => {
      setPrompt(p);
      setGeneratedWords([]);
      setLastPicked(null);
      setHighlightedWord(null);
    },
    []
  );

  // Max bar width reference (the highest probability in current set)
  const maxProb = Math.max(...processedCandidates.map((c) => c.probability));

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Next-Token Prediction Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Type a prompt or pick a preset, then adjust temperature and top-k to see
        how they change the probability distribution. Click &quot;Generate&quot;
        to sample the next word and watch text generation in action.
      </p>

      {/* Preset buttons */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-400 block mb-2">
          Preset Prompts
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handlePreset(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                prompt === p && generatedWords.length === 0
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt input */}
      <div className="mb-5">
        <label className="text-xs font-medium text-gray-400 block mb-2">
          Prompt
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setGeneratedWords([]);
            setLastPicked(null);
          }}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Type a prompt..."
        />
      </div>

      {/* Generated text display */}
      <div className="mb-5 bg-gray-800 rounded-lg p-4 border border-gray-700 min-h-[56px]">
        <label className="text-xs font-medium text-gray-400 block mb-2">
          Generated Text
        </label>
        <p className="text-white text-sm leading-relaxed">
          <span className="text-gray-300">{prompt}</span>
          {generatedWords.map((word, i) => (
            <span key={i}>
              {' '}
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`inline-block font-medium ${
                  i === generatedWords.length - 1
                    ? 'text-blue-400'
                    : 'text-emerald-400'
                }`}
              >
                {word}
              </motion.span>
            </span>
          ))}
          {canGenerate && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block ml-0.5 w-2 h-4 bg-blue-400 align-text-bottom"
            />
          )}
        </p>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Temperature slider */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Temperature:{' '}
            <span className="text-white font-mono">{temperature.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>0.1 (focused)</span>
            <span>2.0 (creative)</span>
          </div>
        </div>

        {/* Top-K slider */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Top-K:{' '}
            <span className="text-white font-mono">{topK}</span>
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>1 (greedy)</span>
            <span>8 (diverse)</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`flex-1 text-sm px-4 py-2.5 rounded-lg font-medium transition-all ${
              canGenerate
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canGenerate ? 'Generate' : 'Max Reached'}
          </button>
          <button
            onClick={handleReset}
            className="text-sm px-4 py-2.5 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Probability distribution bar chart */}
      <div>
        <label className="text-xs font-medium text-gray-400 block mb-3">
          Next-Word Probability Distribution
        </label>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {processedCandidates.map((candidate) => {
              const barWidth = (candidate.probability / maxProb) * 100;
              const isHighlighted = highlightedWord === candidate.word;
              const wasPicked = lastPicked === candidate.word;

              return (
                <motion.div
                  key={candidate.word}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 cursor-default"
                  onMouseEnter={() => setHighlightedWord(candidate.word)}
                  onMouseLeave={() => setHighlightedWord(null)}
                >
                  {/* Word label */}
                  <span
                    className={`text-sm font-mono w-28 text-right truncate transition-colors ${
                      isHighlighted
                        ? 'text-white'
                        : wasPicked
                        ? 'text-blue-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {candidate.word}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 h-7 bg-gray-800 rounded overflow-hidden relative">
                    <motion.div
                      className={`h-full rounded transition-colors ${
                        isHighlighted
                          ? 'bg-blue-400'
                          : wasPicked
                          ? 'bg-blue-500'
                          : 'bg-blue-600/70'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                    {/* Probability label inside bar */}
                    <span
                      className={`absolute inset-0 flex items-center px-2 text-xs font-mono transition-colors ${
                        barWidth > 20 ? 'text-white' : 'text-gray-400'
                      }`}
                      style={{
                        paddingLeft: barWidth > 20 ? undefined : `${barWidth + 2}%`,
                      }}
                    >
                      {(candidate.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Explanation cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-xs text-blue-300">
            <strong className="text-blue-200">Temperature</strong> controls
            randomness. Low temperature (&lt;1.0) makes the model confident,
            concentrating probability on the top choice. High temperature
            (&gt;1.0) flattens the distribution, making unlikely words more
            probable.
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-amber-300">
            <strong className="text-amber-200">Top-K</strong> limits how many
            words the model considers. With K=1, it always picks the most likely
            word (greedy decoding). With K=8, it samples from the 8 most likely
            words, enabling more diverse outputs.
          </p>
        </div>
      </div>
    </div>
  );
}
