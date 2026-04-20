'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SimulationEngine } from '@/utils/simulation-helpers'
import { TokenizationData } from '@/types/simulation'

interface TokenizationSimulationProps {
  defaultText?: string
  encodings?: ('word' | 'subword' | 'character')[]
  showStatistics?: boolean
  showTokenDetails?: boolean
  className?: string
}

export default function TokenizationSimulation({
  defaultText = "Congratulations! You've won $1,000,000 in our lottery!",
  encodings = ['word', 'subword', 'character'],
  showStatistics = true,
  showTokenDetails = false,
  className = ''
}: TokenizationSimulationProps) {
  const [encoding, setEncoding] = useState<'word' | 'subword' | 'character'>(encodings[0])
  const [isAnimating, setIsAnimating] = useState(false)

  const tokenizationData = useMemo((): TokenizationData => {
    return SimulationEngine.tokenizeText(defaultText, encoding)
  }, [defaultText, encoding])

  const handleMethodChange = (method: 'word' | 'subword' | 'character') => {
    setEncoding(method)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }

  const getTokenColor = (tokenId: number, index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
      'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className={`tokenization-simulation bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700 p-6 my-6 ${className}`}>
      {/* Method Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {encodings.map((method) => (
            <button
              key={method}
              onClick={() => handleMethodChange(method)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                encoding === method
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {method.charAt(0).toUpperCase() + method.slice(1)} Level
            </button>
          ))}
        </div>
      </div>

      {/* Original Text */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Original Text:</h4>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-900 dark:text-gray-100">
          {defaultText}
        </div>
      </div>

      {/* Tokenized Output */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Tokens ({tokenizationData.tokens.length}):
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {encoding} tokenization
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tokenizationData.tokens.map((token, index) => (
              <motion.span
                key={`${encoding}-${token.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: isAnimating ? index * 0.05 : 0,
                  duration: 0.3
                }}
                className={`px-3 py-1.5 rounded-md border text-sm font-mono ${getTokenColor(token.tokenId, index)}`}
              >
                {token.text === ' ' ? '␣' : token.text}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {showStatistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {tokenizationData.tokens.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Tokens</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {defaultText.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Characters</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {new Set(tokenizationData.tokens.map(t => t.tokenId)).size}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Unique</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {(tokenizationData.tokens.length / defaultText.split(/\s+/).length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Ratio</div>
          </div>
        </div>
      )}

      {/* Token Details */}
      {showTokenDetails && tokenizationData.tokens.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Token Details:</h4>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">#</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Token</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenizationData.tokens.slice(0, 6).map((token, index) => (
                    <tr key={token.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{index}</td>
                      <td className="px-3 py-2 font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        &ldquo;{token.text === ' ' ? '␣' : token.text}&rdquo;
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400">
                        {token.tokenId % 10000}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{token.text.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tokenizationData.tokens.length > 6 && (
                <div className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                  ... and {tokenizationData.tokens.length - 6} more tokens
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}