'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type Mode = 'rnn' | 'lstm';

interface GateState {
  forget: number;
  input: number;
  output: number;
}

// -------------------------------------------------------------------
// Preset sentences
// -------------------------------------------------------------------

const PRESETS = [
  'The cat sat on the mat',
  'She opened the door and walked into the room',
  'After years of training the model finally learned to speak',
  'The quick brown fox jumps over the lazy dog',
  'I think therefore I am',
];

// -------------------------------------------------------------------
// Simulation logic
// -------------------------------------------------------------------

// Simple RNN: hidden state decays exponentially (vanishing gradient)
function computeRNNStrength(step: number, totalSteps: number): number {
  const decayRate = 0.15;
  return Math.max(0.05, Math.exp(-decayRate * step));
}

// LSTM: hidden state stays strong due to gates
function computeLSTMStrength(step: number, totalSteps: number): number {
  // Small fluctuations but overall stays high
  const base = 0.92;
  const noise = Math.sin(step * 1.7) * 0.05;
  return Math.max(0.6, Math.min(1, base + noise));
}

// Generate pseudo-random but deterministic gate values per word
function computeGateValues(wordIndex: number, word: string): GateState {
  // Simple hash from word characters for deterministic but varied values
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash * 31 + word.charCodeAt(i)) % 1000;
  }
  return {
    forget: 0.3 + ((hash % 7) / 10),         // 0.3 - 0.9
    input: 0.2 + (((hash * 3) % 7) / 10),    // 0.2 - 0.8
    output: 0.4 + (((hash * 7) % 6) / 10),   // 0.4 - 0.9
  };
}

// -------------------------------------------------------------------
// Gate indicator bar
// -------------------------------------------------------------------

function GateBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium w-8 text-right" style={{ color }}>
        {label}
      </span>
      <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-[10px] text-gray-500 w-7">
        {(value).toFixed(1)}
      </span>
    </div>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

export default function RNNSim() {
  const [mode, setMode] = useState<Mode>('rnn');
  const [inputText, setInputText] = useState(PRESETS[0]);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = not started
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const words = useMemo(
    () => inputText.trim().split(/\s+/).filter(w => w.length > 0),
    [inputText]
  );

  const totalSteps = words.length;

  // Compute hidden state strengths for each step
  const strengths = useMemo(() => {
    return words.map((_, i) =>
      mode === 'rnn'
        ? computeRNNStrength(i, totalSteps)
        : computeLSTMStrength(i, totalSteps)
    );
  }, [words, mode, totalSteps]);

  // Gate values for LSTM mode
  const gateValues = useMemo(() => {
    return words.map((word, i) => computeGateValues(i, word));
  }, [words]);

  // Cell state strengths for LSTM
  const cellStrengths = useMemo(() => {
    if (mode !== 'lstm') return [];
    const result: number[] = [];
    let cellState = 1.0;
    for (let i = 0; i < words.length; i++) {
      const gates = gateValues[i];
      // Cell state = forget_gate * prev_cell + input_gate * new_info
      cellState = gates.forget * cellState + gates.input * 0.5;
      cellState = Math.min(1, Math.max(0.3, cellState));
      result.push(cellState);
    }
    return result;
  }, [words, gateValues, mode]);

  // Step forward
  const stepForward = useCallback(() => {
    setCurrentStep(prev => {
      if (prev < totalSteps - 1) return prev + 1;
      return prev;
    });
  }, [totalSteps]);

  // Reset
  const reset = useCallback(() => {
    setCurrentStep(-1);
    setIsAutoPlaying(false);
    if (autoRef.current) clearTimeout(autoRef.current);
  }, []);

  // Auto play
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoRef.current) clearTimeout(autoRef.current);
      return;
    }

    if (currentStep >= totalSteps - 1) {
      setIsAutoPlaying(false);
      return;
    }

    autoRef.current = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 800);

    return () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    };
  }, [isAutoPlaying, currentStep, totalSteps]);

  const toggleAuto = useCallback(() => {
    setIsAutoPlaying(prev => {
      if (!prev && currentStep === -1) {
        setCurrentStep(0);
      }
      if (!prev && currentStep >= totalSteps - 1) {
        // Restart if at end
        setCurrentStep(0);
      }
      return !prev;
    });
  }, [currentStep, totalSteps]);

  // Reset when text or mode changes
  useEffect(() => {
    reset();
  }, [inputText, mode, reset]);

  // Current strength for the bar display
  const currentStrength = currentStep >= 0 ? strengths[currentStep] : 1.0;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Sequence Processing Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Watch how an RNN processes a sentence word by word, carrying a hidden state
        forward. Toggle between Simple RNN (vanishing gradient) and LSTM (stable memory)
        to see the difference.
      </p>

      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Mode toggle */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Architecture
          </label>
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setMode('rnn')}
              className={`text-sm px-4 py-2 font-medium transition-colors ${
                mode === 'rnn'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Simple RNN
            </button>
            <button
              onClick={() => setMode('lstm')}
              className={`text-sm px-4 py-2 font-medium transition-colors ${
                mode === 'lstm'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              LSTM
            </button>
          </div>
        </div>

        {/* Preset selector */}
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Sentence
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => setInputText(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  inputText === preset
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {preset.slice(0, 20)}{preset.length > 20 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom input */}
      <div className="mb-6">
        <label className="text-xs font-medium text-gray-400 block mb-2">
          Or type your own sentence
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Type a sentence..."
        />
      </div>

      {/* LSTM cell state highway (shown above words when in LSTM mode) */}
      {mode === 'lstm' && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-0.5 bg-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Cell State Highway</span>
          </div>
          <div className="relative h-4 mb-1">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-700 rounded-full" />
            {currentStep >= 0 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-emerald-400"
                style={{ left: 0 }}
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  opacity: cellStrengths[currentStep] ?? 1,
                }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
        </div>
      )}

      {/* Word chain */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-min">
          {words.map((word, i) => {
            const isProcessed = i <= currentStep;
            const isCurrent = i === currentStep;
            const strength = isProcessed ? strengths[i] : 0;
            const gates = gateValues[i];

            return (
              <div key={`${word}-${i}`} className="flex items-start">
                {/* Word box + gate indicators */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className="relative rounded-lg border-2 px-3 py-2 min-w-[72px] text-center"
                    style={{
                      borderColor: isCurrent
                        ? mode === 'rnn' ? '#3b82f6' : '#10b981'
                        : isProcessed
                        ? mode === 'rnn'
                          ? `rgba(59, 130, 246, ${0.3 + strength * 0.7})`
                          : `rgba(16, 185, 129, ${0.3 + strength * 0.7})`
                        : '#374151',
                      backgroundColor: isCurrent
                        ? mode === 'rnn' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)'
                        : isProcessed
                        ? mode === 'rnn'
                          ? `rgba(59, 130, 246, ${strength * 0.1})`
                          : `rgba(16, 185, 129, ${strength * 0.1})`
                        : 'rgba(17, 24, 39, 0.8)',
                    }}
                    animate={
                      isCurrent
                        ? { scale: [1, 1.05, 1] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: isProcessed ? '#e5e7eb' : '#6b7280',
                      }}
                    >
                      {word}
                    </span>

                    {/* Hidden state strength indicator under the word */}
                    {isProcessed && (
                      <div className="mt-1.5">
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: mode === 'rnn' ? '#3b82f6' : '#10b981',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${strength * 100}%` }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                        <span className="text-[9px] text-gray-500 mt-0.5 block">
                          {(strength * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* LSTM gate indicators */}
                  {mode === 'lstm' && isProcessed && (
                    <motion.div
                      className="mt-2 space-y-0.5"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GateBar label="F" value={gates.forget} color="#f59e0b" />
                      <GateBar label="I" value={gates.input} color="#3b82f6" />
                      <GateBar label="O" value={gates.output} color="#a855f7" />
                    </motion.div>
                  )}
                </div>

                {/* Arrow connector with animated hidden state ball */}
                {i < words.length - 1 && (
                  <div className="flex flex-col items-center justify-start pt-3 px-0.5 min-w-[32px]">
                    <div className="relative w-full h-6 flex items-center justify-center">
                      {/* Arrow line */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-700" />

                      {/* Animated hidden state ball */}
                      <AnimatePresence>
                        {isCurrent && (
                          <motion.div
                            className="absolute z-10 rounded-full"
                            style={{
                              width: 12,
                              height: 12,
                              backgroundColor: mode === 'rnn' ? '#3b82f6' : '#10b981',
                              boxShadow: mode === 'rnn'
                                ? `0 0 ${8 + strength * 12}px rgba(59, 130, 246, ${strength})`
                                : `0 0 ${8 + strength * 12}px rgba(16, 185, 129, ${strength})`,
                              opacity: 0.3 + strength * 0.7,
                            }}
                            initial={{ left: 0, scale: 0.5 }}
                            animate={{ left: '100%', scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: 'easeInOut' }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Arrow head */}
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2"
                        style={{
                          width: 0,
                          height: 0,
                          borderTop: '4px solid transparent',
                          borderBottom: '4px solid transparent',
                          borderLeft: `6px solid ${isProcessed ? (mode === 'rnn' ? `rgba(59, 130, 246, ${0.3 + strength * 0.7})` : `rgba(16, 185, 129, ${0.3 + strength * 0.7})`) : '#374151'}`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden state strength bar */}
      <div className="mt-4 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Hidden State Strength
          </span>
          <span className="text-sm font-mono text-gray-400">
            {currentStep >= 0 ? `${(currentStrength * 100).toFixed(0)}%` : '--'}
          </span>
        </div>
        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: mode === 'rnn' ? '#3b82f6' : '#10b981',
            }}
            animate={{
              width: currentStep >= 0 ? `${currentStrength * 100}%` : '100%',
              opacity: currentStep >= 0 ? 1 : 0.3,
            }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Weak (forgotten)</span>
          <span className="text-xs text-gray-500">Strong (remembered)</span>
        </div>

        {/* Explanation text */}
        <div className="mt-3">
          {mode === 'rnn' && currentStep >= 0 && (
            <p className="text-xs text-gray-400">
              {currentStrength > 0.7
                ? 'The hidden state is still strong. The RNN remembers recent context well.'
                : currentStrength > 0.3
                ? 'The hidden state is weakening. Information from early words is fading as gradients vanish through the chain.'
                : 'The hidden state has nearly collapsed. The RNN has effectively "forgotten" what came at the start of the sentence. This is the vanishing gradient problem.'}
            </p>
          )}
          {mode === 'lstm' && currentStep >= 0 && (
            <p className="text-xs text-gray-400">
              The LSTM maintains a strong hidden state thanks to its gating mechanism.
              The cell state highway carries information forward, and the forget/input/output
              gates control exactly what to remember and what to discard at each step.
            </p>
          )}
          {currentStep < 0 && (
            <p className="text-xs text-gray-400">
              Click &quot;Next Word&quot; to start processing the sentence step by step,
              or &quot;Auto Play&quot; to watch it animate.
            </p>
          )}
        </div>
      </div>

      {/* LSTM gate legend */}
      {mode === 'lstm' && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span><strong className="text-amber-400">F</strong>orget gate &mdash; what to discard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span><strong className="text-blue-400">I</strong>nput gate &mdash; what new info to store</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
            <span><strong className="text-purple-400">O</strong>utput gate &mdash; what to pass forward</span>
          </div>
        </div>
      )}

      {/* Playback controls */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        <button
          onClick={stepForward}
          disabled={isAutoPlaying || currentStep >= totalSteps - 1}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            isAutoPlaying || currentStep >= totalSteps - 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
          }`}
        >
          Next Word
        </button>
        <button
          onClick={toggleAuto}
          disabled={totalSteps === 0}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            isAutoPlaying
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
        >
          {isAutoPlaying ? 'Stop' : 'Auto Play'}
        </button>
        <button
          onClick={reset}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
        >
          Reset
        </button>

        {currentStep >= 0 && (
          <span className="text-xs text-gray-500 ml-auto">
            Word {currentStep + 1} of {totalSteps}
          </span>
        )}
      </div>

      {/* Hint */}
      <div className="mt-5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          <strong className="text-blue-200">Try this:</strong>{' '}
          Process a long sentence in Simple RNN mode and watch the hidden state bar shrink.
          Then switch to LSTM and run the same sentence &mdash; notice how the strength
          stays high. That&apos;s the LSTM advantage.
        </p>
      </div>
    </div>
  );
}
