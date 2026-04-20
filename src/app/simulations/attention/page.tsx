'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { SimulationEngine } from '@/utils/simulation-helpers'
import { AttentionMatrix } from '@/types/simulation'
import { Zap, Eye, Layers, RotateCcw, Calculator, Brain, BookOpen, Play, ChevronRight } from 'lucide-react'

const SAMPLE_SENTENCES = [
  "The cat sat on the mat",
  "Machine learning models process data",
  "Attention mechanisms focus on relevant information",
  "The quick brown fox jumps over the lazy dog",
  "Neural networks learn complex patterns from examples"
]

// Educational content for different concepts
const ATTENTION_CONCEPTS = {
  'self-attention': {
    title: 'Self-Attention',
    description: 'A mechanism where each position in the sequence attends to all positions in the same sequence.',
    example: 'In "The cat sat", each word can attend to all words including itself.',
    mathFormula: 'Attention(Q,K,V) = softmax(QK^T/√d_k)V'
  },
  'cross-attention': {
    title: 'Cross-Attention',
    description: 'A mechanism where queries from one sequence attend to keys and values from another sequence.',
    example: 'In translation, target language words attend to source language words.',
    mathFormula: 'CrossAttention(Q_target, K_source, V_source)'
  },
  'multi-head': {
    title: 'Multi-Head Attention',
    description: 'Multiple attention mechanisms running in parallel, each focusing on different aspects.',
    example: 'Head 1 focuses on syntax, Head 2 on semantics, Head 3 on long-range dependencies.',
    mathFormula: 'MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O'
  },
  'qkv-matrices': {
    title: 'Query, Key, Value Matrices',
    description: 'Linear transformations that create specialized representations for attention computation.',
    example: 'Q determines what to look for, K what to match against, V what information to extract.',
    mathFormula: 'Q = XW^Q, K = XW^K, V = XW^V'
  }
}

export default function AttentionSimulation() {
  const [inputText, setInputText] = useState(SAMPLE_SENTENCES[0])
  const [selectedHead, setSelectedHead] = useState(0)
  const [numHeads, setNumHeads] = useState(8)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hoveredToken, setHoveredToken] = useState<number | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [showEducational, setShowEducational] = useState(false)
  const [selectedConcept, setSelectedConcept] = useState<keyof typeof ATTENTION_CONCEPTS>('self-attention')
  const [showStepByStep, setShowStepByStep] = useState(false)
  const [calculationStep, setCalculationStep] = useState(0)
  const heatmapRef = useRef<HTMLDivElement>(null)
  const qkvRef = useRef<HTMLDivElement>(null)

  const tokens = useMemo(() => {
    return inputText.split(/\s+/).filter(token => token.length > 0)
  }, [inputText])

  const attentionMatrix = useMemo((): AttentionMatrix => {
    return SimulationEngine.generateAttentionWeights(tokens, numHeads)
  }, [tokens, numHeads])

  const currentHeadWeights = useMemo(() => {
    if (!attentionMatrix.heads[selectedHead]) return []

    const weights = attentionMatrix.heads[selectedHead]
    const matrix: number[][] = []

    for (let i = 0; i < tokens.length; i++) {
      matrix[i] = []
      for (let j = 0; j < tokens.length; j++) {
        const weight = weights.find(w => w.queryToken === i && w.keyToken === j)?.weight || 0
        matrix[i][j] = weight
      }
    }

    return matrix
  }, [attentionMatrix, selectedHead, tokens])

  // Generate QKV matrices for educational purposes
  const qkvMatrices = useMemo(() => {
    const embeddingDim = 64 // Simplified for visualization
    const headDim = embeddingDim / numHeads

    // Simple hash function
    const hashString = (str: string): number => {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash)
    }

    // Seeded random generator
    const seededRandom = (seed: number) => {
      let state = seed
      return () => {
        state = (state * 9301 + 49297) % 233280
        return state / 233280
      }
    }

    const generateMatrix = (rows: number, cols: number, seed: string) => {
      const hash = hashString(seed + selectedHead.toString())
      const random = seededRandom(hash)
      return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (random() - 0.5) * 0.1)
      )
    }

    const Q = generateMatrix(tokens.length, headDim, 'query')
    const K = generateMatrix(tokens.length, headDim, 'key')
    const V = generateMatrix(tokens.length, headDim, 'value')

    // Calculate attention scores (Q * K^T)
    const scores = Q.map((qRow, i) =>
      K.map((kRow, j) =>
        qRow.reduce((sum, val, k) => sum + val * kRow[k], 0) / Math.sqrt(headDim)
      )
    )

    // Apply softmax
    const softmaxScores = scores.map(row => {
      const maxScore = Math.max(...row)
      const expScores = row.map(score => Math.exp(score - maxScore))
      const sumExp = expScores.reduce((a, b) => a + b, 0)
      return expScores.map(exp => exp / sumExp)
    })

    return { Q, K, V, scores, softmaxScores }
  }, [tokens, numHeads, selectedHead])

  const calculationSteps = [
    "1. Linear transformations create Q, K, V matrices",
    "2. Calculate attention scores: Q × K^T",
    "3. Scale by √d_k for stability",
    "4. Apply softmax to get probabilities",
    "5. Multiply by V to get final output"
  ]

  useEffect(() => {
    if (!heatmapRef.current || currentHeadWeights.length === 0) return

    const container = d3.select(heatmapRef.current)
    container.selectAll('*').remove()

    const margin = { top: 60, right: 60, bottom: 60, left: 60 }
    const cellSize = 40
    const width = tokens.length * cellSize + margin.left + margin.right
    const height = tokens.length * cellSize + margin.top + margin.bottom

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // Color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(currentHeadWeights.flat()) || 1])

    // Create heatmap cells
    const rows = svg.selectAll('.row')
      .data(currentHeadWeights)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => `translate(${margin.left}, ${margin.top + i * cellSize})`)

    const cells = rows.selectAll('.cell')
      .data((d, i) => d.map((value, j) => ({ value, row: i, col: j })))
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d) => `translate(${d.col * cellSize}, 0)`)

    // Add cell rectangles
    cells.append('rect')
      .attr('width', cellSize - 1)
      .attr('height', cellSize - 1)
      .attr('fill', (d) => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .on('mouseover', function(event, d) {
        setHoveredToken(d.row)
        d3.select(this).style('stroke', '#000').style('stroke-width', 2)

        // Highlight row and column
        cells.selectAll('rect')
          .style('opacity', (cellData: any) =>
            cellData.row === d.row || cellData.col === d.col ? 0.9 : 0.3
          )
      })
      .on('mouseout', function() {
        setHoveredToken(null)
        d3.select(this).style('stroke', '#fff').style('stroke-width', 1)
        cells.selectAll('rect').style('opacity', 0.8)
      })

    // Add cell values
    cells.append('text')
      .attr('x', cellSize / 2)
      .attr('y', cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => d.value > 0.5 ? 'white' : 'black')
      .text((d) => d.value.toFixed(2))
      .style('opacity', 0)

    // Add row labels (Query tokens)
    svg.selectAll('.row-label')
      .data(tokens)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', margin.left - 10)
      .attr('y', (d, i) => margin.top + i * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d)
      .style('opacity', 0)

    // Add column labels (Key tokens)
    svg.selectAll('.col-label')
      .data(tokens)
      .enter()
      .append('text')
      .attr('class', 'col-label')
      .attr('x', (d, i) => margin.left + i * cellSize + cellSize / 2)
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('transform', (d, i) => `rotate(-45, ${margin.left + i * cellSize + cellSize / 2}, ${margin.top - 10})`)
      .text((d) => d)
      .style('opacity', 0)

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top - 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Key Tokens')
      .style('opacity', 0)

    svg.append('text')
      .attr('transform', `rotate(-90, 20, ${height / 2})`)
      .attr('x', 20)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Query Tokens')
      .style('opacity', 0)

    // Animate everything in
    cells.selectAll('rect')
      .transition()
      .duration(600)
      .delay((d: any, i) => (d.row * tokens.length + d.col) * 20)
      .style('opacity', 0.8)

    cells.selectAll('text')
      .transition()
      .duration(600)
      .delay((d: any, i) => (d.row * tokens.length + d.col) * 20 + 200)
      .style('opacity', 1)

    svg.selectAll('.row-label, .col-label')
      .transition()
      .duration(600)
      .delay(400)
      .style('opacity', 1)

    svg.selectAll('text')
      .filter(function() { return d3.select(this).attr('class') !== 'row-label' && d3.select(this).attr('class') !== 'col-label' })
      .transition()
      .duration(600)
      .delay(600)
      .style('opacity', 1)

  }, [currentHeadWeights, tokens, isAnimating])

  // QKV Matrix Visualization
  useEffect(() => {
    if (!qkvRef.current || !showStepByStep) return

    const container = d3.select(qkvRef.current)
    container.selectAll('*').remove()

    const margin = { top: 40, right: 20, bottom: 40, left: 60 }
    const matrixSize = Math.min(200, tokens.length * 30)
    const spacing = matrixSize + 60

    const svg = container
      .append('svg')
      .attr('width', spacing * 3 + margin.left + margin.right)
      .attr('height', matrixSize + margin.top + margin.bottom)

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([-0.1, 0.1])

    const matrices = [
      { data: qkvMatrices.Q, label: 'Q (Query)', x: margin.left },
      { data: qkvMatrices.K, label: 'K (Key)', x: margin.left + spacing },
      { data: qkvMatrices.V, label: 'V (Value)', x: margin.left + spacing * 2 }
    ]

    matrices.forEach(({ data, label, x }) => {
      const g = svg.append('g')
        .attr('transform', `translate(${x}, ${margin.top})`)

      // Matrix title
      g.append('text')
        .attr('x', matrixSize / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .text(label)

      // Matrix cells
      const cellSize = matrixSize / Math.max(data.length, data[0]?.length || 1)

      data.forEach((row, i) => {
        row.forEach((value, j) => {
          g.append('rect')
            .attr('x', j * cellSize)
            .attr('y', i * cellSize)
            .attr('width', cellSize - 1)
            .attr('height', cellSize - 1)
            .attr('fill', colorScale(value))
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .style('opacity', 0)
            .transition()
            .duration(600)
            .delay((i * row.length + j) * 20)
            .style('opacity', 0.8)
        })
      })

      // Row labels (tokens)
      if (label === 'Q (Query)') {
        tokens.forEach((token, i) => {
          g.append('text')
            .attr('x', -5)
            .attr('y', i * cellSize + cellSize / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .text(token)
        })
      }
    })

  }, [qkvMatrices, tokens, showStepByStep])

  const handleAnimate = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const handleStepByStep = () => {
    setShowStepByStep(!showStepByStep)
    setCalculationStep(0)
  }

  const learningObjectives = [
    "Understand how attention mechanisms work in neural networks",
    "Visualize Query-Key-Value matrix transformations",
    "Explore multi-head attention patterns and their differences",
    "Learn the step-by-step attention calculation process",
    "Compare self-attention vs cross-attention mechanisms",
    "See how different heads focus on different linguistic relationships"
  ]

  return (
    <SimulationLayout
      title="Attention Mechanism Explorer"
      description="Interactive demonstration of attention weights and patterns"
      difficulty="Intermediate"
      category="Transformers"
      onPlay={handleAnimate}
      onReset={() => {
        setInputText(SAMPLE_SENTENCES[0])
        setSelectedHead(0)
        setNumHeads(8)
        setHoveredToken(null)
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Educational Content Panel */}
      <AnimatePresence>
        {showEducational && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border"
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {Object.entries(ATTENTION_CONCEPTS).map(([key, concept]) => (
                <button
                  key={key}
                  onClick={() => setSelectedConcept(key as keyof typeof ATTENTION_CONCEPTS)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedConcept === key
                      ? 'bg-white shadow-md border-2 border-blue-300'
                      : 'bg-white/50 hover:bg-white/80 border border-gray-200'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{concept.title}</h4>
                  <p className="text-sm text-gray-600">{concept.description}</p>
                  {selectedConcept === key && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-3 bg-blue-50 rounded text-xs"
                    >
                      <div className="font-medium text-blue-800 mb-1">Example:</div>
                      <div className="text-blue-700 mb-2">{concept.example}</div>
                      <div className="font-mono text-blue-600 text-xs">{concept.mathFormula}</div>
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step-by-Step Calculation */}
      <AnimatePresence>
        {showStepByStep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-lg shadow-lg p-6 border"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Calculator className="mr-2 text-green-600" />
              Step-by-Step Attention Calculation
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Process Steps</h4>
                {calculationSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      calculationStep === index
                        ? 'bg-green-50 border-green-300'
                        : calculationStep > index
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          calculationStep === index
                            ? 'bg-green-600 text-white'
                            : calculationStep > index
                            ? 'bg-green-400 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={`${
                        calculationStep === index ? 'font-semibold text-green-800' : 'text-gray-700'
                      }`}>
                        {step}
                      </span>
                    </div>
                  </motion.div>
                ))}

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setCalculationStep(Math.max(0, calculationStep - 1))}
                    disabled={calculationStep === 0}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCalculationStep(Math.min(calculationSteps.length - 1, calculationStep + 1))}
                    disabled={calculationStep === calculationSteps.length - 1}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">QKV Matrix Visualization</h4>
                <div ref={qkvRef} className="overflow-x-auto bg-gray-50 rounded-lg p-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="mr-2 text-blue-600" size={20} />
              Input Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Sentences
                </label>
                <div className="space-y-2">
                  {SAMPLE_SENTENCES.map((sentence, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(sentence)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        inputText === sentence
                          ? 'bg-blue-50 border border-blue-200 text-blue-900'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {sentence}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Sentence
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter your own sentence..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="mr-2 text-purple-600" size={20} />
              Attention Heads
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Heads: {numHeads}
                </label>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={numHeads}
                  onChange={(e) => {
                    const newNumHeads = Number(e.target.value)
                    setNumHeads(newNumHeads)
                    setSelectedHead(Math.min(selectedHead, newNumHeads - 1))
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>16</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Head
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: numHeads }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedHead(i)}
                      className={`p-2 text-sm rounded transition-colors ${
                        selectedHead === i
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedHead(Math.floor(Math.random() * numHeads))}
                className="w-full flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw size={16} className="mr-2" />
                Random Head
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="mr-2 text-orange-600" size={20} />
              Learning Modes
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setShowEducational(!showEducational)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  showEducational
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="flex items-center">
                  <BookOpen size={16} className="mr-2" />
                  Concept Explorer
                </span>
                <ChevronRight size={16} className={`transform transition-transform ${showEducational ? 'rotate-90' : ''}`} />
              </button>

              <button
                onClick={handleStepByStep}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  showStepByStep
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="flex items-center">
                  <Calculator size={16} className="mr-2" />
                  Step-by-Step Math
                </span>
                <ChevronRight size={16} className={`transform transition-transform ${showStepByStep ? 'rotate-90' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Layers className="mr-2 text-green-600" size={20} />
              Token Information
            </h3>

            <div className="space-y-2">
              {tokens.map((token, index) => (
                <motion.div
                  key={index}
                  className={`p-2 rounded text-sm transition-colors ${
                    hoveredToken === index
                      ? 'bg-yellow-100 border border-yellow-300'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-medium">{token}</span>
                    <span className="text-xs text-gray-500">pos: {index}</span>
                  </div>
                  {hoveredToken === index && currentHeadWeights[index] && (
                    <div className="mt-2 text-xs">
                      <div className="text-gray-600">Attention to:</div>
                      <div className="grid grid-cols-1 gap-1 mt-1">
                        {currentHeadWeights[index]
                          .map((weight, targetIndex) => ({ weight, targetIndex, token: tokens[targetIndex] }))
                          .sort((a, b) => b.weight - a.weight)
                          .slice(0, 3)
                          .map(({ weight, targetIndex, token: targetToken }) => (
                            <div key={targetIndex} className="flex justify-between">
                              <span className="font-mono text-xs">{targetToken}</span>
                              <span className="text-xs">{weight.toFixed(2)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Visualization Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Attention Heatmap - Head {selectedHead + 1}
              </h3>
              <div className="text-sm text-gray-500">
                {tokens.length} × {tokens.length} matrix
              </div>
            </div>

            <div
              ref={heatmapRef}
              className="overflow-x-auto border rounded-lg bg-gray-50"
              style={{ minHeight: '400px' }}
            />

            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong>How to read:</strong> Rows represent query tokens, columns represent key tokens.
                Darker colors indicate stronger attention weights.
              </p>
              <p>
                Hover over cells to see which tokens this query token is attending to most strongly.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Attention Analysis & Insights
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {tokens.length}
                </div>
                <div className="text-sm text-gray-600">Tokens</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {numHeads}
                </div>
                <div className="text-sm text-gray-600">Attention Heads</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(currentHeadWeights.flat().reduce((a, b) => Math.max(a, b), 0)).toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">Max Weight</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(currentHeadWeights.flat().reduce((a, b) => a + b, 0) / (tokens.length * tokens.length)).toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">Avg Weight</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Head {selectedHead + 1} - Top Attention Patterns
                </h4>
                <div className="space-y-2">
                  {currentHeadWeights
                    .flatMap((row, i) =>
                      row.map((weight, j) => ({
                        query: tokens[i],
                        key: tokens[j],
                        weight,
                        queryIndex: i,
                        keyIndex: j
                      }))
                    )
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 5)
                    .map((pattern, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">
                            {pattern.query}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                            {pattern.key}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {pattern.weight.toFixed(3)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Key Insights</h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div>
                    <strong>Multi-Head Benefits:</strong> Different attention heads can specialize in different types of relationships (syntactic, semantic, positional).
                  </div>
                  <div>
                    <strong>Attention Patterns:</strong> Self-attention allows each token to look at all other tokens, enabling long-range dependencies.
                  </div>
                  <div>
                    <strong>Computational Efficiency:</strong> Attention can be computed in parallel for all positions, unlike recurrent mechanisms.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="mr-2 text-purple-600" />
              Understanding Attention Mechanisms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">✨ What is Attention?</h4>
                  <p className="text-sm text-green-700">
                    Attention mechanisms allow neural networks to focus on the most relevant parts of the input when processing each element. Instead of treating all inputs equally, attention assigns weights based on relevance.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🔍 How It Works</h4>
                  <p className="text-sm text-blue-700">
                    Each token creates three vectors: Query (what it&apos;s looking for), Key (what it offers), and Value (the information it contains). Attention weights are computed by comparing queries with keys.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">🎯 Self vs Cross Attention</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li><strong>Self-Attention:</strong> Tokens attend to other tokens in the same sequence</li>
                    <li><strong>Cross-Attention:</strong> Tokens attend to tokens from a different sequence</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🧠 Multi-Head Attention</h4>
                  <p className="text-sm text-purple-700">
                    Multiple attention heads run in parallel, each learning to focus on different types of relationships. This allows the model to capture various linguistic patterns simultaneously.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-3">📚 Try These Experiments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm">
                  <strong>1. Compare Attention Heads:</strong>
                  <p className="text-gray-600">Switch between different heads to see how they focus on different relationships in the same sentence.</p>
                </div>
                <div className="text-sm">
                  <strong>2. Sentence Length Effect:</strong>
                  <p className="text-gray-600">Try different sentence lengths and observe how attention patterns change with more context.</p>
                </div>
                <div className="text-sm">
                  <strong>3. Token Relationships:</strong>
                  <p className="text-gray-600">Hover over tokens to see which words they attend to most strongly.</p>
                </div>
                <div className="text-sm">
                  <strong>4. Mathematical Foundation:</strong>
                  <p className="text-gray-600">Use the step-by-step mode to understand the mathematical computation behind attention.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}