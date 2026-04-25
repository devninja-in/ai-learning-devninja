'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Pre-training data snippets (diverse internet text)
// -------------------------------------------------------------------

const PRETRAINING_SNIPPETS = [
  { text: 'The mitochondria is the powerhouse of the cell, responsible for...', source: 'Wikipedia' },
  { text: 'function fetchData(url) { return fetch(url).then(r => r.json())...', source: 'GitHub' },
  { text: 'BREAKING: Markets rally as Fed signals potential rate cuts in...', source: 'News' },
  { text: 'Mix flour, sugar, and eggs. Preheat oven to 350F. Bake for...', source: 'Recipe Blog' },
  { text: 'The Treaty of Westphalia (1648) established the principle of...', source: 'Textbook' },
  { text: 'import torch.nn as nn\\nclass Transformer(nn.Module):\\n  def...', source: 'GitHub' },
  { text: 'Scientists at CERN have discovered a new particle that may...', source: 'ArXiv' },
  { text: 'Once upon a time in a land far away, there lived a young...', source: 'Fiction' },
  { text: 'SELECT users.name, orders.total FROM users INNER JOIN orders...', source: 'StackOverflow' },
  { text: 'The GDP of the United States in 2023 was approximately $25.4...', source: 'Economics' },
  { text: 'To install dependencies, run: npm install express cors dotenv...', source: 'Docs' },
  { text: 'In quantum mechanics, the wave function describes the quantum...', source: 'Physics' },
  { text: 'Photosynthesis converts carbon dioxide and water into glucose...', source: 'Biology' },
  { text: 'The Supreme Court ruled 6-3 in favor of the defendant, citing...', source: 'Legal' },
  { text: 'async function main() { const client = new OpenAI(); const...', source: 'GitHub' },
];

// -------------------------------------------------------------------
// Fine-tuning data (instruction/response pairs)
// -------------------------------------------------------------------

const FINETUNING_SNIPPETS = [
  { instruction: 'Explain quantum computing in simple terms.', response: 'Think of a regular computer as flipping coins...' },
  { instruction: 'Write a Python function to sort a list.', response: 'def sort_list(items): return sorted(items)...' },
  { instruction: 'Summarize this article about climate change.', response: 'The article argues that reducing emissions by...' },
  { instruction: 'What are the pros and cons of remote work?', response: 'Pros: flexibility, no commute, wider talent pool...' },
  { instruction: 'Help me debug this JavaScript error.', response: 'The error occurs because you are calling .map()...' },
  { instruction: 'Translate this to French: "Good morning"', response: '"Bonjour" is the standard French greeting for...' },
  { instruction: 'Write a haiku about programming.', response: 'Bugs hide in the code / Debugger reveals the truth...' },
  { instruction: 'Explain the difference between SQL and NoSQL.', response: 'SQL databases use structured tables with schemas...' },
];

// -------------------------------------------------------------------
// Loss curve data points
// -------------------------------------------------------------------

const PRETRAIN_LOSS = [
  4.8, 4.6, 4.3, 4.1, 3.9, 3.7, 3.5, 3.4, 3.3, 3.2,
  3.1, 3.05, 3.0, 2.95, 2.9, 2.85, 2.82, 2.78, 2.75, 2.72,
  2.70, 2.68, 2.66, 2.64, 2.62, 2.61, 2.60, 2.59, 2.58, 2.57,
];

const FINETUNE_LOSS = [
  2.6, 2.3, 2.0, 1.7, 1.5, 1.3, 1.2, 1.1, 1.0, 0.95,
  0.90, 0.86, 0.83, 0.80, 0.78, 0.76, 0.74, 0.73, 0.72, 0.71,
  0.70, 0.695, 0.69, 0.685, 0.68, 0.678, 0.675, 0.673, 0.671, 0.67,
];

// -------------------------------------------------------------------
// Before/After fine-tuning example prompts
// -------------------------------------------------------------------

const EXAMPLE_PROMPTS = [
  {
    prompt: 'What is photosynthesis?',
    before: 'Photosynthesis is the process by which plants convert light energy into chemical energy. The word photosynthesis comes from the Greek words "phos" meaning light and "synthesis" meaning putting together. In 1779, Jan Ingenhousz discovered that plants need sunlight to produce oxygen. The Calvin cycle was described by Melvin Calvin in 1950. Chloroplasts contain thylakoid membranes where...',
    after: 'Photosynthesis is how plants turn sunlight into food. Here is the simple version:\n\n1. Plants absorb sunlight through chlorophyll (the green pigment in leaves)\n2. They take in CO2 from the air and water from the soil\n3. Using light energy, they convert these into glucose (sugar) and oxygen\n\nThe equation: 6CO2 + 6H2O + light -> C6H12O6 + 6O2\n\nThink of it as a solar-powered food factory!',
  },
  {
    prompt: 'Write a function to reverse a string.',
    before: 'A string is a sequence of characters in computer science. Strings can be reversed using various algorithms. The time complexity of string reversal is O(n). In Python, strings are immutable objects. JavaScript provides the split() method. Java uses StringBuilder. C++ has std::reverse. The concept of reversing dates back to early computing when...',
    after: 'Here is a function to reverse a string in Python:\n\n```python\ndef reverse_string(s):\n    return s[::-1]\n```\n\nOr if you want to do it manually:\n\n```python\ndef reverse_string(s):\n    result = ""\n    for char in s:\n        result = char + result\n    return result\n```\n\nThe first approach uses Python slicing (most Pythonic). The second builds the reversed string character by character.',
  },
  {
    prompt: 'Should I use React or Vue for my project?',
    before: 'React is a JavaScript library created by Facebook in 2013. Vue.js was created by Evan You in 2014. Both are used for building user interfaces. The virtual DOM is a concept used by both frameworks. Component-based architecture allows for reusable UI elements. State management is an important consideration. Redux is commonly used with React while Vuex is used with Vue...',
    after: 'It depends on your situation. Here is a quick comparison:\n\nChoose React if:\n- You want the largest ecosystem and job market\n- Your team already knows it\n- You need React Native for mobile later\n\nChoose Vue if:\n- You are a beginner (gentler learning curve)\n- You prefer a batteries-included framework\n- You want simpler, more readable templates\n\nBoth are excellent. For most projects, the "wrong" choice will still work fine. Pick the one your team is more comfortable with.',
  },
];

// -------------------------------------------------------------------
// Mini loss chart (SVG-based)
// -------------------------------------------------------------------

function LossChart({ data, color, label, animatedStep }: {
  data: number[];
  color: string;
  label: string;
  animatedStep: number;
}) {
  const maxLoss = 5;
  const minLoss = 0;
  const w = 240;
  const h = 100;
  const padX = 30;
  const padY = 10;
  const plotW = w - padX - 5;
  const plotH = h - padY * 2;

  const visibleData = data.slice(0, animatedStep + 1);

  const toX = (i: number) => padX + (i / (data.length - 1)) * plotW;
  const toY = (val: number) => padY + ((maxLoss - val) / (maxLoss - minLoss)) * plotH;

  const pathD = visibleData
    .map((val, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(val).toFixed(1)}`)
    .join(' ');

  return (
    <div>
      <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" style={{ maxWidth: '240px' }}>
        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <text
            key={v}
            x={padX - 4}
            y={toY(v) + 3}
            textAnchor="end"
            fill="#6b7280"
            fontSize="8"
            fontFamily="system-ui, sans-serif"
          >
            {v}
          </text>
        ))}
        {/* Grid lines */}
        {[1, 2, 3, 4].map((v) => (
          <line
            key={v}
            x1={padX}
            y1={toY(v)}
            x2={w - 5}
            y2={toY(v)}
            stroke="#1f2937"
            strokeWidth={0.5}
          />
        ))}
        {/* Loss curve */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
        {/* Current point */}
        {visibleData.length > 0 && (
          <motion.circle
            cx={toX(visibleData.length - 1)}
            cy={toY(visibleData[visibleData.length - 1])}
            r={3}
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
        {/* Loss value label */}
        {visibleData.length > 0 && (
          <text
            x={toX(visibleData.length - 1) + 6}
            y={toY(visibleData[visibleData.length - 1]) + 3}
            fill={color}
            fontSize="9"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            {visibleData[visibleData.length - 1].toFixed(2)}
          </text>
        )}
        {/* X-axis label */}
        <text
          x={w / 2}
          y={h - 1}
          textAnchor="middle"
          fill="#4b5563"
          fontSize="8"
          fontFamily="system-ui, sans-serif"
        >
          Training Steps
        </text>
      </svg>
    </div>
  );
}

// -------------------------------------------------------------------
// Data stream animation
// -------------------------------------------------------------------

function DataStream({ snippets, speed, type }: {
  snippets: typeof PRETRAINING_SNIPPETS | typeof FINETUNING_SNIPPETS;
  speed: number;
  type: 'pretrain' | 'finetune';
}) {
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % snippets.length);
    }, speed);
    return () => clearInterval(interval);
  }, [snippets.length, speed]);

  const currentSnippet = snippets[visibleIndex];

  return (
    <div className="h-[80px] overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={visibleIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          {type === 'pretrain' ? (
            <div className="bg-gray-800/50 rounded px-3 py-2 h-full">
              <div className="text-[10px] font-medium text-gray-500 mb-1">
                {(currentSnippet as typeof PRETRAINING_SNIPPETS[0]).source}
              </div>
              <div className="text-xs text-gray-300 leading-relaxed line-clamp-3 font-mono">
                {(currentSnippet as typeof PRETRAINING_SNIPPETS[0]).text}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded px-3 py-2 h-full">
              <div className="text-[10px] text-blue-400 mb-0.5 truncate">
                <span className="text-gray-500">User:</span>{' '}
                {(currentSnippet as typeof FINETUNING_SNIPPETS[0]).instruction}
              </div>
              <div className="text-[10px] text-emerald-400 truncate">
                <span className="text-gray-500">Assistant:</span>{' '}
                {(currentSnippet as typeof FINETUNING_SNIPPETS[0]).response}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

export default function FinetuningSim() {
  const [isRunning, setIsRunning] = useState(false);
  const [pretrainStep, setPretrainStep] = useState(0);
  const [finetuneStep, setFinetuneStep] = useState(0);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [selectedExample, setSelectedExample] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStartStop = useCallback(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    } else {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setPretrainStep((prev) => {
          if (prev < PRETRAIN_LOSS.length - 1) return prev + 1;
          return prev;
        });
        setFinetuneStep((prev) => {
          if (prev < FINETUNE_LOSS.length - 1) return prev + 1;
          return prev;
        });
      }, 400);
    }
  }, [isRunning]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setPretrainStep(0);
    setFinetuneStep(0);
  }, []);

  // Stop interval when both reach the end
  useEffect(() => {
    if (pretrainStep >= PRETRAIN_LOSS.length - 1 && finetuneStep >= FINETUNE_LOSS.length - 1) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  }, [pretrainStep, finetuneStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const pretrainDone = pretrainStep >= PRETRAIN_LOSS.length - 1;
  const finetuneDone = finetuneStep >= FINETUNE_LOSS.length - 1;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Pre-training vs Fine-tuning Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Watch both training phases side by side. Pre-training processes diverse
        internet text over many steps. Fine-tuning starts from the pre-trained
        model and adapts it with task-specific instruction data.
      </p>

      {/* Controls */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={handleStartStop}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
            isRunning
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : pretrainDone && finetuneDone
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
          }`}
          disabled={pretrainDone && finetuneDone && !isRunning}
        >
          {isRunning ? 'Pause' : pretrainDone && finetuneDone ? 'Complete' : 'Start Training'}
        </button>
        <button
          onClick={handleReset}
          className="text-sm px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Pre-training panel */}
        <div className="border-2 border-blue-500/30 bg-blue-500/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h4 className="text-sm font-semibold text-blue-300">Phase 1: Pre-training</h4>
          </div>

          <div className="space-y-3">
            {/* Data stream */}
            <div>
              <div className="text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">
                Data Stream (diverse text)
              </div>
              <DataStream snippets={PRETRAINING_SNIPPETS} speed={2000} type="pretrain" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Data Size</div>
                <div className="text-sm font-bold text-blue-400">~1-5 TB</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Training Time</div>
                <div className="text-sm font-bold text-blue-400">Weeks-Months</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Cost</div>
                <div className="text-sm font-bold text-blue-400">$2M-$100M+</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Objective</div>
                <div className="text-sm font-bold text-blue-400">Next Token</div>
              </div>
            </div>

            {/* Loss chart */}
            <LossChart
              data={PRETRAIN_LOSS}
              color="#3b82f6"
              label="Pre-training Loss"
              animatedStep={pretrainStep}
            />

            {/* Status */}
            <div className="text-center">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                pretrainDone
                  ? 'bg-blue-500/20 text-blue-300'
                  : isRunning
                  ? 'bg-blue-500/10 text-blue-400 animate-pulse'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {pretrainDone ? 'Base model ready' : isRunning ? `Step ${pretrainStep + 1}/${PRETRAIN_LOSS.length}` : 'Waiting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Fine-tuning panel */}
        <div className="border-2 border-emerald-500/30 bg-emerald-500/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-semibold text-emerald-300">Phase 2: Fine-tuning (SFT)</h4>
          </div>

          <div className="space-y-3">
            {/* Data stream */}
            <div>
              <div className="text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">
                Data Stream (instruction pairs)
              </div>
              <DataStream snippets={FINETUNING_SNIPPETS} speed={2500} type="finetune" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Data Size</div>
                <div className="text-sm font-bold text-emerald-400">~10-100 MB</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Training Time</div>
                <div className="text-sm font-bold text-emerald-400">Hours-Days</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Cost</div>
                <div className="text-sm font-bold text-emerald-400">$100-$10K</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] text-gray-500">Objective</div>
                <div className="text-sm font-bold text-emerald-400">Follow Instructions</div>
              </div>
            </div>

            {/* Loss chart */}
            <LossChart
              data={FINETUNE_LOSS}
              color="#22c55e"
              label="Fine-tuning Loss"
              animatedStep={finetuneStep}
            />

            {/* Status */}
            <div className="text-center">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                finetuneDone
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : isRunning
                  ? 'bg-emerald-500/10 text-emerald-400 animate-pulse'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {finetuneDone ? 'Useful model ready' : isRunning ? `Step ${finetuneStep + 1}/${FINETUNE_LOSS.length}` : 'Waiting...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data size comparison bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-5">
        <div className="text-xs font-medium text-gray-400 mb-3">
          Data Size Comparison (log scale)
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-400 w-24 text-right">Pre-training</span>
            <div className="flex-1 h-6 bg-gray-900 rounded overflow-hidden">
              <motion.div
                className="h-full bg-blue-600/70 rounded flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <span className="text-[10px] text-white font-mono">~1-5 TB</span>
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 w-24 text-right">Fine-tuning</span>
            <div className="flex-1 h-6 bg-gray-900 rounded overflow-hidden">
              <motion.div
                className="h-full bg-emerald-600/70 rounded flex items-center justify-end pr-2"
                initial={{ width: 0 }}
                animate={{ width: '6%' }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <span className="text-[10px] text-white font-mono whitespace-nowrap ml-2">~MB</span>
              </motion.div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">
          Fine-tuning uses roughly 10,000 to 100,000x less data than pre-training
        </p>
      </div>

      {/* Before/After toggle */}
      <div className="border border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h4 className="text-sm font-semibold text-gray-300">
            Output Quality: Before vs After Fine-tuning
          </h4>
          <button
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${
              showBeforeAfter
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {showBeforeAfter ? 'Hide' : 'Show'} Examples
          </button>
        </div>

        <AnimatePresence>
          {showBeforeAfter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {/* Example selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {EXAMPLE_PROMPTS.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedExample(i)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedExample === i
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {ex.prompt}
                  </button>
                ))}
              </div>

              {/* Prompt */}
              <div className="bg-gray-800 rounded-lg px-3 py-2 mb-3">
                <div className="text-[10px] text-gray-500 mb-1">Prompt</div>
                <div className="text-sm text-white font-medium">
                  {EXAMPLE_PROMPTS[selectedExample].prompt}
                </div>
              </div>

              {/* Before/After comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-400">Before Fine-tuning (Base Model)</span>
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                    {EXAMPLE_PROMPTS[selectedExample].before}
                  </div>
                  <div className="mt-2 text-[10px] text-red-400/70 italic">
                    Rambles, dumps facts, no structure, not actually helpful
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-400">After Fine-tuning (SFT Model)</span>
                  </div>
                  <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                    {EXAMPLE_PROMPTS[selectedExample].after}
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-400/70 italic">
                    Structured, helpful, directly answers the question
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI connection */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong> Every model
          you interact with &mdash; ChatGPT, Claude, Llama &mdash; went through
          both phases. The pre-trained base model has vast knowledge but
          can&apos;t hold a conversation. Fine-tuning is what transforms it from
          a text prediction engine into an assistant that follows instructions,
          stays on topic, and formats responses helpfully.
        </p>
      </div>
    </div>
  );
}
