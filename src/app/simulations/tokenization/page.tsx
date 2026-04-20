'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { SimulationEngine } from '@/utils/simulation-helpers'
import { TokenizationData } from '@/types/simulation'
import { Type, Hash, Zap, BarChart3, Layers, Book, Settings, Eye, ArrowLeftRight, GitBranch } from 'lucide-react'

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Artificial intelligence is transforming our understanding of technology.",
  "Preprocessing text data requires careful tokenization strategies.",
  "Machine learning models need structured input representations.",
  "Tokenization preprocessing understanding subword",
  "Hello, world! How are you today? 🌍",
  "She'll be running extremely quickly through the preprocessing pipeline.",
  "GPT-4 can understand context-dependent disambiguation tasks."
]

const TOKENIZATION_METHODS = {
  word: {
    name: "Word-based",
    description: "Split text by whitespace and punctuation into complete words. Simple but creates large vocabularies and struggles with out-of-vocabulary (OOV) terms.",
    advantages: ["Simple and intuitive", "Preserves semantic word boundaries", "Good for languages with clear word separation"],
    disadvantages: ["Large vocabulary size", "Out-of-vocabulary problems", "Poor handling of morphologically rich languages"],
    useCases: ["Early NLP systems", "Simple text classification", "Languages with clear word boundaries"]
  },
  subword: {
    name: "Subword (BPE-like)",
    description: "Break words into smaller meaningful units using techniques like Byte Pair Encoding. Balances vocabulary size with representation power by learning common subwords.",
    advantages: ["Handles rare/unknown words", "Smaller vocabulary", "Captures morphological patterns", "Language agnostic"],
    disadvantages: ["More complex preprocessing", "May split words unnaturally", "Requires training on corpus"],
    useCases: ["Modern language models (GPT, BERT)", "Neural machine translation", "Multilingual models"]
  },
  character: {
    name: "Character-based",
    description: "Split into individual characters or bytes. Handles any text but loses semantic word boundaries and requires longer sequences.",
    advantages: ["No vocabulary limitations", "Handles any language/script", "Simple implementation", "No OOV issues"],
    disadvantages: ["Very long sequences", "Loses word-level semantics", "Requires more computation", "Poor for word-level tasks"],
    useCases: ["Character-level language models", "Text generation", "Handling noisy text", "Multilingual scenarios"]
  },
  bpe: {
    name: "Byte Pair Encoding",
    description: "Advanced subword method that iteratively merges most frequent character pairs. Creates a learned vocabulary optimized for the training corpus.",
    advantages: ["Optimal subword segmentation", "Efficient vocabulary usage", "Handles rare words gracefully", "Corpus-specific optimization"],
    disadvantages: ["Requires training phase", "Corpus-dependent results", "Complex implementation", "May not generalize to other domains"],
    useCases: ["GPT family models", "State-of-the-art NLP", "Domain-specific applications", "Large-scale language modeling"]
  }
}

export default function TokenizationSimulation() {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0])
  const [encoding, setEncoding] = useState<'word' | 'subword' | 'character' | 'bpe'>('word')
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<'playground' | 'compare' | 'learn'>('playground')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [visualMode, setVisualMode] = useState<'tokens' | 'boundaries' | 'stats'>('tokens')
  const [isProcessing, setIsProcessing] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const tokenizationData = useMemo((): TokenizationData => {
    setIsProcessing(true)
    const result = SimulationEngine.tokenizeText(inputText, encoding)
    setTimeout(() => setIsProcessing(false), 100) // Brief processing indication
    return result
  }, [inputText, encoding])

  const comparisonData = useMemo(() => {
    const methods = ['word', 'subword', 'character', 'bpe'] as const
    return methods.map(method => ({
      method,
      data: SimulationEngine.tokenizeText(inputText, method),
      methodInfo: TOKENIZATION_METHODS[method]
    }))
  }, [inputText])

  const handleAnimate = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  // D3 Visualization for Token Boundaries
  useEffect(() => {
    if (!svgRef.current || tokenizationData.tokens.length === 0 || visualMode !== 'boundaries') return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 300
    const margin = { top: 40, right: 40, bottom: 60, left: 40 }

    const textLength = inputText.length
    const xScale = d3.scaleLinear()
      .domain([0, textLength])
      .range([margin.left, width - margin.right])

    // Background text
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', margin.top + 30)
      .attr('font-family', 'monospace')
      .attr('font-size', '14px')
      .attr('fill', '#666')
      .text(inputText)

    // Token boundaries
    const tokenGroups = svg.selectAll('g.token')
      .data(tokenizationData.tokens)
      .enter()
      .append('g')
      .attr('class', 'token')

    // Token boundary lines
    tokenGroups.append('line')
      .attr('x1', d => xScale(d.start))
      .attr('x2', d => xScale(d.start))
      .attr('y1', margin.top + 10)
      .attr('y2', margin.top + 50)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(600)
      .style('opacity', 0.8)

    // Token end lines
    tokenGroups.append('line')
      .attr('x1', d => xScale(d.end))
      .attr('x2', d => xScale(d.end))
      .attr('y1', margin.top + 10)
      .attr('y2', margin.top + 50)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .transition()
      .delay((_, i) => i * 100 + 200)
      .duration(600)
      .style('opacity', 0.6)

    // Token highlight rectangles
    tokenGroups.append('rect')
      .attr('x', d => xScale(d.start))
      .attr('y', margin.top + 15)
      .attr('width', d => xScale(d.end) - xScale(d.start))
      .attr('height', 20)
      .attr('fill', (_, i) => d3.schemeCategory10[i % 10])
      .style('opacity', 0)
      .transition()
      .delay((_, i) => i * 100 + 400)
      .duration(600)
      .style('opacity', 0.2)

    // Token labels
    tokenGroups.append('text')
      .attr('x', d => (xScale(d.start) + xScale(d.end)) / 2)
      .attr('y', margin.top + 80)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .style('opacity', 0)
      .text((d, i) => `T${i}`)
      .transition()
      .delay((_, i) => i * 100 + 600)
      .duration(600)
      .style('opacity', 1)

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height - 40})`)

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 5)
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text('Token Start')

    legend.append('line')
      .attr('x1', 120)
      .attr('x2', 135)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1)

    legend.append('text')
      .attr('x', 140)
      .attr('y', 5)
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text('Token End')

  }, [tokenizationData, inputText, visualMode, isAnimating])

  const getTokenColor = (tokenId: number, index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-red-100 text-red-800 border-red-200'
    ]
    return colors[index % colors.length]
  }

  const getMethodBadgeColor = (method: string) => {
    const colors = {
      word: 'bg-blue-100 text-blue-800',
      subword: 'bg-green-100 text-green-800',
      character: 'bg-purple-100 text-purple-800',
      bpe: 'bg-orange-100 text-orange-800'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const learningObjectives = [
    "Understand different tokenization strategies and their trade-offs",
    "Visualize how text is segmented into tokens",
    "ArrowLeftRight tokenization methods across different text types",
    "Explore advanced concepts like BPE and subword tokenization",
    "Learn about vocabulary size implications for model training"
  ]

  return (
    <SimulationLayout
      title="Advanced Tokenization Playground"
      description="Comprehensive exploration of text tokenization methods with interactive visualizations"
      difficulty="Beginner"
      category="NLP Foundations"
      onPlay={handleAnimate}
      onReset={() => {
        setInputText(SAMPLE_TEXTS[0])
        setEncoding('word')
        setActiveTab('playground')
        setVisualMode('tokens')
        setShowAdvanced(false)
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-white rounded-lg shadow-lg p-1">
          {[
            { key: 'playground', label: 'Interactive Playground', icon: Type },
            { key: 'compare', label: 'Method Comparison', icon: ArrowLeftRight },
            { key: 'learn', label: 'Learning Center', icon: Book }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} className="mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Controls Panel */}
              <div className="xl:col-span-1 space-y-6">
                {/* Input Text */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Type className="mr-2 text-blue-600" size={20} />
                    Input Text
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sample Texts
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {SAMPLE_TEXTS.map((text, index) => (
                          <button
                            key={index}
                            onClick={() => setInputText(text)}
                            className={`text-left p-3 rounded-lg border transition-colors ${
                              inputText === text
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="text-sm font-medium truncate">{text}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Text
                      </label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Enter your own text to tokenize..."
                      />
                    </div>
                  </div>
                </div>

                {/* Tokenization Method */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Hash className="mr-2 text-purple-600" size={20} />
                    Tokenization Method
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(TOKENIZATION_METHODS).map(([method, info]) => (
                      <label key={method} className="flex items-start space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="encoding"
                          value={method}
                          checked={encoding === method}
                          onChange={() => setEncoding(method as any)}
                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-gray-900">
                              {info.name}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getMethodBadgeColor(method)}`}>
                              {method.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 group-hover:text-gray-700">
                            {info.description.slice(0, 120)}...
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Visualization Controls */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="mr-2 text-green-600" size={20} />
                    Visualization Mode
                  </h3>

                  <div className="space-y-3">
                    {[
                      { key: 'tokens', label: 'Token Display', desc: 'Colored token blocks' },
                      { key: 'boundaries', label: 'Boundary Analysis', desc: 'Visual token boundaries' },
                      { key: 'stats', label: 'Statistics View', desc: 'Detailed metrics' }
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="visualMode"
                          value={key}
                          checked={visualMode === key}
                          onChange={() => setVisualMode(key as any)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{label}</div>
                          <div className="text-xs text-gray-600">{desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Visualization Area */}
              <div className="xl:col-span-3 space-y-6">
                {/* Original Text with Character Positions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Text Analysis</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-2 font-mono">
                        Character positions: {Array.from({ length: Math.min(inputText.length, 50) }, (_, i) => i % 10).join('')}
                      </div>
                      <div className="font-mono text-sm text-gray-800 leading-relaxed">
                        {inputText}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Length: {inputText.length} characters • Words: {inputText.split(/\s+/).filter(w => w).length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visualization Panel */}
                {visualMode === 'tokens' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Tokenized Output ({tokenizationData.tokens.length} tokens)
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodBadgeColor(encoding)}`}>
                          {TOKENIZATION_METHODS[encoding as keyof typeof TOKENIZATION_METHODS]?.name}
                        </span>
                        <button
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                          <Settings size={16} className="mr-1" />
                          {showAdvanced ? 'Hide' : 'Show'} Details
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {tokenizationData.tokens.map((token, index) => (
                          <motion.div
                            key={token.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: 1,
                              scale: isAnimating ? [1, 1.2, 1] : 1
                            }}
                            transition={{
                              delay: isAnimating ? index * 0.05 : 0,
                              duration: isAnimating ? 0.6 : 0.3
                            }}
                            className={`px-3 py-2 rounded-lg border font-mono text-sm transition-all hover:shadow-md cursor-pointer ${getTokenColor(token.tokenId, index)}`}
                            title={`Position: ${token.start}-${token.end} | Token ID: ${token.tokenId} | Length: ${token.text.length}`}
                          >
                            <div className="flex flex-col items-center">
                              <span className="font-medium">
                                {token.text === ' ' ? '␣' : token.text}
                              </span>
                              {showAdvanced && (
                                <div className="text-xs opacity-75 mt-1 text-center">
                                  <div>#{index}</div>
                                  <div>ID:{token.tokenId % 1000}</div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 p-4 bg-gray-50 rounded-lg"
                        >
                          <h4 className="font-medium text-gray-900 mb-3">Advanced Token Analysis</h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-1">
                              <div className="text-gray-600">Average Token Length</div>
                              <div className="font-mono font-bold">
                                {(tokenizationData.tokens.reduce((sum, t) => sum + t.text.length, 0) / tokenizationData.tokens.length).toFixed(2)}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-600">Longest Token</div>
                              <div className="font-mono font-bold">
                                {Math.max(...tokenizationData.tokens.map(t => t.text.length))} chars
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-600">Compression Ratio</div>
                              <div className="font-mono font-bold">
                                {(inputText.length / tokenizationData.tokens.length).toFixed(2)}:1
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-gray-600">Vocab Efficiency</div>
                              <div className="font-mono font-bold">
                                {((new Set(tokenizationData.tokens.map(t => t.tokenId)).size / tokenizationData.tokens.length) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {visualMode === 'boundaries' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Boundary Visualization</h3>
                    <div className="border rounded-lg bg-gray-50 overflow-hidden">
                      <svg
                        ref={svgRef}
                        width="800"
                        height="300"
                        className="w-full h-auto"
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        Blue lines mark token starts, red lines mark token ends.
                        Each token is highlighted with a unique color for easy identification.
                      </p>
                    </div>
                  </div>
                )}

                {visualMode === 'stats' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="mr-2 text-green-600" size={20} />
                      Detailed Statistics & Analysis
                    </h3>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {tokenizationData.tokens.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Tokens</div>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {inputText.length}
                        </div>
                        <div className="text-sm text-gray-600">Characters</div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(tokenizationData.tokens.map(t => t.tokenId)).size}
                        </div>
                        <div className="text-sm text-gray-600">Unique Tokens</div>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round((tokenizationData.tokens.length / inputText.split(/\s+/).filter(w => w).length) * 100) / 100}
                        </div>
                        <div className="text-sm text-gray-600">Tokens/Word</div>
                      </div>

                      <div className="text-center p-4 bg-teal-50 rounded-lg">
                        <div className="text-2xl font-bold text-teal-600">
                          {Math.round((inputText.length / tokenizationData.tokens.length) * 100) / 100}
                        </div>
                        <div className="text-sm text-gray-600">Chars/Token</div>
                      </div>
                    </div>

                    {/* Token Details Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Index</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Token</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Token ID</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Position</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Length</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 border-b">Type</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {tokenizationData.tokens.slice(0, 15).map((token, index) => (
                            <tr key={token.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-mono text-center">{index}</td>
                              <td className="py-3 px-4 text-sm font-mono bg-gray-50 rounded mx-1">
                                <span className="px-2 py-1 bg-white rounded border">
                                  {token.text === ' ' ? '␣' : token.text}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm font-mono text-center">{token.tokenId % 10000}</td>
                              <td className="py-3 px-4 text-sm font-mono text-center">{token.start}–{token.end}</td>
                              <td className="py-3 px-4 text-sm text-center">{token.text.length}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  /\w/.test(token.text) ? 'bg-blue-100 text-blue-800' :
                                  /\s/.test(token.text) ? 'bg-gray-100 text-gray-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {/\w/.test(token.text) ? 'Alphanumeric' :
                                   /\s/.test(token.text) ? 'Whitespace' : 'Punctuation'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {tokenizationData.tokens.length > 15 && (
                        <div className="text-center py-3 text-sm text-gray-500 border-t">
                          ... and {tokenizationData.tokens.length - 15} more tokens
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
              {/* Comparison Header */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowLeftRight className="mr-2 text-blue-600" size={24} />
                  Tokenization Method Comparison
                </h3>
                <p className="text-gray-600 mb-4">
                  ArrowLeftRight how different tokenization methods handle the same input text.
                  This helps understand the trade-offs between vocabulary size, representation quality, and computational efficiency.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comparison Text
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter text to compare across different tokenization methods..."
                  />
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {comparisonData.map(({ method, data, methodInfo }) => (
                  <div key={method} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{methodInfo.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodBadgeColor(method)}`}>
                        {method.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Method Description */}
                      <p className="text-sm text-gray-600">{methodInfo.description}</p>

                      {/* Tokens Preview */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Tokens ({data.tokens.length}):
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                          {data.tokens.slice(0, 20).map((token, index) => (
                            <span
                              key={token.id}
                              className={`px-2 py-1 rounded text-xs font-mono ${getTokenColor(token.tokenId, index)}`}
                            >
                              {token.text === ' ' ? '␣' : token.text}
                            </span>
                          ))}
                          {data.tokens.length > 20 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{data.tokens.length - 20} more...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Method Statistics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">{data.tokens.length}</div>
                          <div className="text-xs text-gray-600">Tokens</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">
                            {new Set(data.tokens.map(t => t.tokenId)).size}
                          </div>
                          <div className="text-xs text-gray-600">Unique</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">
                            {Math.round((data.tokens.length / inputText.split(/\s+/).filter(w => w).length) * 100) / 100}
                          </div>
                          <div className="text-xs text-gray-600">Tok/Word</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-900">
                            {Math.round((inputText.length / data.tokens.length) * 100) / 100}
                          </div>
                          <div className="text-xs text-gray-600">Char/Tok</div>
                        </div>
                      </div>

                      {/* Advantages & Disadvantages */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-green-700 mb-1">Advantages:</div>
                          <ul className="text-xs text-green-600 space-y-1">
                            {methodInfo.advantages.slice(0, 2).map((adv, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {adv}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-red-700 mb-1">Disadvantages:</div>
                          <ul className="text-xs text-red-600 space-y-1">
                            {methodInfo.disadvantages.slice(0, 2).map((dis, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-red-500 mr-1">•</span>
                                {dis}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison Summary */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparison Summary</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Method</th>
                        <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Total Tokens</th>
                        <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Unique Tokens</th>
                        <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Avg Token Length</th>
                        <th className="text-center py-2 px-3 text-sm font-medium text-gray-700">Compression</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map(({ method, data, methodInfo }) => (
                        <tr key={method} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodBadgeColor(method)}`}>
                              {methodInfo.name}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-sm text-center font-mono">{data.tokens.length}</td>
                          <td className="py-2 px-3 text-sm text-center font-mono">
                            {new Set(data.tokens.map(t => t.tokenId)).size}
                          </td>
                          <td className="py-2 px-3 text-sm text-center font-mono">
                            {(data.tokens.reduce((sum, t) => sum + t.text.length, 0) / data.tokens.length).toFixed(1)}
                          </td>
                          <td className="py-2 px-3 text-sm text-center font-mono">
                            {(inputText.length / data.tokens.length).toFixed(1)}:1
                          </td>
                          <td className="py-2 px-3 text-xs text-gray-600">
                            {methodInfo.useCases[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
              {/* Learning Center Header */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Book className="mr-2 text-purple-600" size={24} />
                  Tokenization Learning Center
                </h3>
                <p className="text-gray-600">
                  Comprehensive guide to understanding tokenization methods, their applications,
                  and how they impact natural language processing models.
                </p>
              </div>

              {/* Method Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(TOKENIZATION_METHODS).map(([method, info]) => (
                  <div key={method} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{info.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodBadgeColor(method)}`}>
                        {method.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <p className="text-gray-600">{info.description}</p>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">Advantages</h5>
                          <ul className="space-y-1">
                            {info.advantages.map((advantage, i) => (
                              <li key={i} className="text-sm text-green-700 flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                {advantage}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg">
                          <h5 className="font-medium text-red-800 mb-2">Disadvantages</h5>
                          <ul className="space-y-1">
                            {info.disadvantages.map((disadvantage, i) => (
                              <li key={i} className="text-sm text-red-700 flex items-start">
                                <span className="text-red-500 mr-2">×</span>
                                {disadvantage}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Common Use Cases</h5>
                          <ul className="space-y-1">
                            {info.useCases.map((useCase, i) => (
                              <li key={i} className="text-sm text-blue-700 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {useCase}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Concepts */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Layers className="mr-2 text-indigo-600" size={20} />
                  Key Concepts in Tokenization
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Vocabulary Size",
                      description: "The total number of unique tokens a model can understand. Larger vocabularies can represent more concepts but require more memory and computation.",
                      impact: "Memory usage, model size, training efficiency"
                    },
                    {
                      title: "Out-of-Vocabulary (OOV)",
                      description: "Tokens that weren't seen during training. Different tokenization methods handle OOV tokens differently, affecting model robustness.",
                      impact: "Model generalization, handling of new domains"
                    },
                    {
                      title: "Subword Units",
                      description: "Pieces of words that capture meaningful patterns (prefixes, suffixes, roots). Enable models to understand unseen words through composition.",
                      impact: "Handling rare words, morphological understanding"
                    },
                    {
                      title: "Compression Ratio",
                      description: "How efficiently tokenization reduces the original text length. Higher compression can reduce computational costs but may lose information.",
                      impact: "Sequence length, computational efficiency, context window usage"
                    },
                    {
                      title: "Byte Pair Encoding (BPE)",
                      description: "Algorithm that iteratively merges the most frequent character pairs to create an optimal vocabulary for a specific corpus.",
                      impact: "Vocabulary optimization, domain adaptation"
                    },
                    {
                      title: "Context Window",
                      description: "The maximum number of tokens a model can process at once. Efficient tokenization helps fit more meaningful content in limited context.",
                      impact: "Model capability, long-text processing"
                    }
                  ].map((concept, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">{concept.title}</h5>
                      <p className="text-sm text-gray-600 mb-3">{concept.description}</p>
                      <div className="text-xs text-gray-500">
                        <strong>Impact:</strong> {concept.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Best Practices & Guidelines</h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Choosing a Tokenization Method</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Use <strong>word-based</strong> for simple applications with well-defined vocabularies
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Choose <strong>subword/BPE</strong> for most modern NLP tasks and large language models
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Consider <strong>character-based</strong> for noisy text, code, or very multilingual scenarios
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Balance vocabulary size with computational constraints
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Implementation Considerations</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Train tokenizers on representative data from your target domain
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Handle special tokens (padding, unknown, start/end) appropriately
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Consider the trade-off between token granularity and sequence length
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Test tokenization quality on downstream tasks, not just compression metrics
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SimulationLayout>
  )
}