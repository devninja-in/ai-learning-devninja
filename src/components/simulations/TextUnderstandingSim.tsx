'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'bow' | 'tfidf';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'am', 'it', 'its',
  'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too',
  'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'i', 'me',
  'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
  'they', 'them', 'their',
]);

interface WordScore {
  word: string;
  score: number;
  isStopWord: boolean;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function computeBagOfWords(words: string[]): WordScore[] {
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .map(([word, count]) => ({
      word,
      score: count,
      isStopWord: STOP_WORDS.has(word),
    }))
    .sort((a, b) => b.score - a.score);
}

function computeTfIdf(words: string[]): WordScore[] {
  const totalWords = words.length;
  if (totalWords === 0) return [];

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  const uniqueWords = Object.keys(freq);
  const numUniqueWords = uniqueWords.length;

  // TF-IDF approximation for a single document:
  // TF = frequency / total words
  // IDF proxy: stop words get a very low weight, non-stop words get boosted
  // by inverse of how "common" they seem (using frequency as a rough proxy)
  return uniqueWords
    .map((word) => {
      const tf = freq[word] / totalWords;
      const isStop = STOP_WORDS.has(word);

      // Stop words get a heavy penalty. For non-stop words, rarer words
      // (those appearing fewer times relative to unique word count) get a boost.
      const idfProxy = isStop
        ? 0.1
        : Math.log(1 + numUniqueWords / freq[word]) + 0.5;

      return {
        word,
        score: parseFloat((tf * idfProxy).toFixed(4)),
        isStopWord: isStop,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export default function TextUnderstandingSim() {
  const [inputText, setInputText] = useState(
    'The cat sat on the mat. The dog chased the cat around the park.'
  );
  const [activeTab, setActiveTab] = useState<Tab>('bow');
  const [removeStopWords, setRemoveStopWords] = useState(false);

  const words = useMemo(() => tokenize(inputText), [inputText]);

  const bowScores = useMemo(() => computeBagOfWords(words), [words]);
  const tfidfScores = useMemo(() => computeTfIdf(words), [words]);

  const displayScores = useMemo(() => {
    const source = activeTab === 'bow' ? bowScores : tfidfScores;
    if (removeStopWords) {
      return source.filter((s) => !s.isStopWord);
    }
    return source;
  }, [activeTab, bowScores, tfidfScores, removeStopWords]);

  const maxScore = useMemo(
    () => Math.max(...displayScores.map((s) => s.score), 0.001),
    [displayScores]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    []
  );

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Text Understanding Explorer
      </h3>

      {/* Text input */}
      <textarea
        value={inputText}
        onChange={handleTextChange}
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          resize-none mb-4"
        placeholder="Type or paste a sentence here..."
      />

      {/* Tab buttons + stop words toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('bow')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bow'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bag of Words
          </button>
          <button
            onClick={() => setActiveTab('tfidf')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tfidf'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            TF-IDF
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              checked={removeStopWords}
              onChange={(e) => setRemoveStopWords(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-gray-600">Remove stop words</span>
        </label>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4">
        {activeTab === 'bow'
          ? 'Bag of Words counts how many times each word appears. Every word is treated equally — "the" counts just as much as "cat".'
          : 'TF-IDF weights words by importance. Words that appear often in this text but are generally rare score higher. Common words like "the" get pushed to the bottom.'}
      </p>

      {/* Bar chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-600">
            {activeTab === 'bow' ? 'Word Frequency' : 'TF-IDF Score'}
          </span>
          <span className="text-xs text-gray-400">
            {displayScores.length} unique word{displayScores.length !== 1 ? 's' : ''}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${removeStopWords}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-1.5"
          >
            {displayScores.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Type some text above to see the analysis.
              </div>
            ) : (
              displayScores.map((item, index) => {
                const widthPct = (item.score / maxScore) * 100;
                return (
                  <motion.div
                    key={item.word}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                    }}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`text-sm w-24 text-right truncate font-mono ${
                        item.isStopWord
                          ? 'text-gray-400 italic'
                          : 'text-gray-800 font-medium'
                      }`}
                      title={item.word}
                    >
                      {item.word}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.03 }}
                        className={`h-full rounded-full ${
                          item.isStopWord
                            ? 'bg-gray-300'
                            : activeTab === 'bow'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium w-12 text-right ${
                        item.isStopWord ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {activeTab === 'bow'
                        ? item.score
                        : item.score.toFixed(3)}
                    </span>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend */}
      {!removeStopWords && displayScores.length > 0 && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                activeTab === 'bow' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs text-gray-600">Content words</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-600">
              Stop words (the, a, is, etc.)
            </span>
          </div>
        </div>
      )}

      {/* Insight callout */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          {activeTab === 'bow' ? (
            <>
              <strong>Notice:</strong> In Bag of Words, common words like
              &quot;the&quot; dominate the chart. They tell you nothing about what
              the text is actually <em>about</em>. Switch to TF-IDF to see the
              difference.
            </>
          ) : (
            <>
              <strong>Key insight:</strong> TF-IDF pushes common words down and
              lifts the words that actually matter. The words at the top are the
              ones that make this text distinctive.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
