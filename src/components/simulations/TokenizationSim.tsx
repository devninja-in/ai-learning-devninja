'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SimulationEngine } from '@/utils/simulation-helpers';

type TokenMethod = 'word' | 'subword' | 'character' | 'bpe';

const methods: { key: TokenMethod; label: string }[] = [
  { key: 'word', label: 'Word' },
  { key: 'subword', label: 'Subword (BPE-like)' },
  { key: 'character', label: 'Character' },
  { key: 'bpe', label: 'Byte Pair Encoding' },
];

const tokenColors = [
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-green-100', text: 'text-green-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bg: 'bg-red-100', text: 'text-red-800' },
];

export default function TokenizationSim() {
  const [inputText, setInputText] = useState(
    'The quick brown fox jumps over the lazy dog.'
  );
  const [activeMethod, setActiveMethod] = useState<TokenMethod>('word');

  const allResults = useMemo(() => {
    const text = inputText || ' ';
    return {
      word: SimulationEngine.tokenizeText(text, 'word'),
      subword: SimulationEngine.tokenizeText(text, 'subword'),
      character: SimulationEngine.tokenizeText(text, 'character'),
      bpe: SimulationEngine.tokenizeText(text, 'bpe'),
    };
  }, [inputText]);

  const activeTokens = allResults[activeMethod].tokens;

  const maxCount = Math.max(
    allResults.word.tokens.length,
    allResults.subword.tokens.length,
    allResults.character.tokens.length,
    allResults.bpe.tokens.length
  );

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tokenization Explorer
      </h3>

      {/* Text input */}
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          resize-none mb-4"
        placeholder="Type or paste text here..."
      />

      {/* Method buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {methods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveMethod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeMethod === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Token chips */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Tokens</span>
          <span className="text-sm text-gray-500">
            {activeTokens.length} token{activeTokens.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="min-h-[60px] border border-gray-200 rounded-lg p-3 bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeMethod}-${inputText}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-wrap gap-1.5"
            >
              {activeTokens.map((token, index) => {
                const color = tokenColors[index % tokenColors.length];
                return (
                  <motion.span
                    key={`${token.id}-${token.text}`}
                    initial={{ opacity: 0, scale: 0.8, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.02,
                    }}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-mono font-medium ${color.bg} ${color.text}`}
                  >
                    {token.text === ' ' ? '␣' : token.text}
                  </motion.span>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Token count bar chart */}
      <div>
        <span className="text-sm font-medium text-gray-600 mb-3 block">
          Token count comparison
        </span>
        <div className="space-y-2">
          {methods.map(({ key, label }) => {
            const count = allResults[key].tokens.length;
            const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const isActive = key === activeMethod;

            return (
              <button
                key={key}
                onClick={() => setActiveMethod(key)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-32 truncate">
                    {label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full transition-colors ${
                        isActive ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-gray-400'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium w-8 text-right ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
