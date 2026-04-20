'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SimulationEngine } from '@/utils/simulation-helpers'
import { TokenizationData } from '@/types/simulation'
import { Type, Hash, Zap, Play, RotateCcw } from 'lucide-react'

interface TokenizerDemoProps {
  defaultText?: string
  encodings?: ('word' | 'subword' | 'character')[]
  showStatistics?: boolean
  showTokenDetails?: boolean
  className?: string
  compact?: boolean
}

export default function TokenizerDemo({
  defaultText = "The quick brown fox jumps over the lazy dog.",
  encodings = ['word', 'subword', 'character'],
  showStatistics = false,
  showTokenDetails = false,
  className = '',
  compact = false
}: TokenizerDemoProps) {
  const [inputText, setInputText] = useState(defaultText)
  const [encoding, setEncoding] = useState<'word' | 'subword' | 'character'>(encodings[0])
  const [isAnimating, setIsAnimating] = useState(false)

  const tokenizationData = useMemo((): TokenizationData => {
    return SimulationEngine.tokenizeText(inputText, encoding)
  }, [inputText, encoding])

  const handleAnimate = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const handleReset = () => {
    setInputText(defaultText)
    setEncoding(encodings[0])
  }

  const getTokenColor = (tokenId: number, index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700',
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900 dark:text-teal-200 dark:border-teal-700',
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700'
    ]
    return colors[index % colors.length]
  }

  const ENCODING_DESCRIPTIONS = {
    word: "Split text by whitespace into complete words",
    subword: "Break words into smaller meaningful units",
    character: "Split into individual characters"
  }

  return (
    <div className={`tokenizer-demo bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="text-blue-600 dark:text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Tokenization Explorer
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAnimate}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isAnimating}
            >
              <Play size={14} />
              <span className="text-sm">Animate</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={14} />
              <span className="text-sm">Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input Controls */}
        <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
          {/* Text Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows={compact ? 2 : 3}
              placeholder="Enter text to tokenize..."
            />
          </div>

          {/* Encoding Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tokenization Method
            </label>
            <div className="space-y-2">
              {encodings.map((method) => (
                <label key={method} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="encoding"
                    value={method}
                    checked={encoding === method}
                    onChange={() => setEncoding(method)}
                    className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {method} Level
                    </div>
                    {!compact && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {ENCODING_DESCRIPTIONS[method]}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Tokenized Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tokenized Output ({tokenizationData.tokens.length} tokens)
            </h4>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Method: <span className="font-medium capitalize">{encoding}</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
            <div className="flex flex-wrap gap-1.5">
              {tokenizationData.tokens.map((token, index) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isAnimating ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    delay: isAnimating ? index * 0.05 : 0,
                    duration: isAnimating ? 0.3 : 0.2
                  }}
                  className={`px-2 py-1 rounded border text-xs font-mono ${getTokenColor(token.tokenId, index)}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-medium">
                      {token.text === ' ' ? '␣' : token.text}
                    </span>
                    {showTokenDetails && (
                      <span className="text-[10px] opacity-75 mt-0.5">
                        {token.tokenId % 10000}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {showStatistics && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Zap className="mr-2 text-green-600 dark:text-green-400" size={16} />
              Statistics
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {tokenizationData.tokens.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Tokens</div>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {inputText.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Characters</div>
              </div>

              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {new Set(tokenizationData.tokens.map(t => t.tokenId)).size}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Unique Tokens</div>
              </div>

              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {Math.round((tokenizationData.tokens.length / inputText.split(/\s+/).filter(w => w).length) * 100) / 100}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Tokens/Word</div>
              </div>
            </div>
          </div>
        )}

        {/* Token Details Table */}
        {showTokenDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Token Details</h4>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Index</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Token</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Token ID</th>
                    <th className="text-left py-2 px-2 text-xs font-medium text-gray-700 dark:text-gray-300">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenizationData.tokens.slice(0, 8).map((token, index) => (
                    <tr key={token.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-2 text-xs font-mono text-gray-600 dark:text-gray-400">{index}</td>
                      <td className="py-2 px-2 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100">
                        &ldquo;{token.text === ' ' ? '␣' : token.text}&rdquo;
                      </td>
                      <td className="py-2 px-2 text-xs font-mono text-gray-600 dark:text-gray-400">{token.tokenId % 10000}</td>
                      <td className="py-2 px-2 text-xs text-gray-600 dark:text-gray-400">{token.start}–{token.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tokenizationData.tokens.length > 8 && (
                <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400">
                  ... and {tokenizationData.tokens.length - 8} more tokens
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}