'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { SimulationEngine } from '@/utils/simulation-helpers'
import { AttentionMatrix } from '@/types/simulation'
import {
  Brain,
  Layers,
  ArrowRight,
  Zap,
  Hash,
  Eye,
  Network,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  Target,
  Activity,
  ArrowDown,
  Plus,
  Book,
  Calculator,
  Settings,
  Grid,
  Shuffle,
  Cpu,
  Compass
} from 'lucide-react'

const TRANSFORMER_COMPONENTS = [
  {
    id: 'embedding',
    name: 'Token Embedding',
    description: 'Convert tokens to dense vector representations (512d)',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Hash,
    detail: 'Each token is mapped to a learned 512-dimensional dense vector that captures semantic meaning'
  },
  {
    id: 'positional',
    name: 'Positional Encoding',
    description: 'Add sinusoidal position information to embeddings',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Target,
    detail: 'Sine and cosine functions of different frequencies encode token position information'
  },
  {
    id: 'multihead',
    name: 'Multi-Head Attention',
    description: 'Attend to different parts of the sequence (8 heads)',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Eye,
    detail: 'Multiple attention heads learn different types of relationships between tokens'
  },
  {
    id: 'feedforward',
    name: 'Feed Forward Network',
    description: 'Process attended information through dense layers',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Network,
    detail: 'Two-layer MLP with ReLU activation: 512 → 2048 → 512 dimensions'
  },
  {
    id: 'layernorm',
    name: 'Layer Normalization',
    description: 'Normalize activations for stable training',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: Activity,
    detail: 'Normalizes inputs across the feature dimension with learnable scale and shift'
  },
  {
    id: 'residual',
    name: 'Residual Connection',
    description: 'Add skip connections to prevent vanishing gradients',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: GitBranch,
    detail: 'Skip connections allow gradients to flow directly to earlier layers'
  }
]

const SAMPLE_INPUTS = [
  "Hello world",
  "The cat sat on the mat",
  "AI models process text efficiently",
  "Transformers use attention mechanisms",
  "Machine learning revolutionizes technology"
]

interface PositionalEncodingData {
  position: number
  dimension: number
  value: number
}

export default function TransformerSimulation() {
  const [inputText, setInputText] = useState(SAMPLE_INPUTS[0])
  const [numLayers, setNumLayers] = useState(6)
  const [numHeads, setNumHeads] = useState(8)
  const [hiddenDim, setHiddenDim] = useState(512)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentLayer, setCurrentLayer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'explorer' | 'learn'>('explorer')
  const [animationSpeed, setAnimationSpeed] = useState(1000)
  const [showDataFlow, setShowDataFlow] = useState(true)
  const [selectedHead, setSelectedHead] = useState(0)
  const [architecture, setArchitecture] = useState<'encoder-only' | 'decoder-only' | 'encoder-decoder'>('encoder-only')

  const posEncodingRef = useRef<HTMLDivElement>(null)
  const attentionHeatmapRef = useRef<HTMLDivElement>(null)
  const ffnVisualizationRef = useRef<HTMLDivElement>(null)
  const architectureDiagramRef = useRef<HTMLDivElement>(null)

  const tokens = useMemo(() => {
    return inputText.split(/\s+/).filter(token => token.length > 0)
  }, [inputText])

  const embeddings = useMemo(() => {
    return tokens.map(token => SimulationEngine.generateRandomEmbedding(token, hiddenDim))
  }, [tokens, hiddenDim])

  const attentionMatrix = useMemo(() => {
    return SimulationEngine.generateAttentionWeights(tokens, numHeads)
  }, [tokens, numHeads])

  const positionalEncodingData = useMemo(() => {
    const data: PositionalEncodingData[] = []
    for (let pos = 0; pos < tokens.length; pos++) {
      for (let i = 0; i < Math.min(hiddenDim, 64); i++) {
        const value = i % 2 === 0
          ? Math.sin(pos / Math.pow(10000, 2 * Math.floor(i / 2) / hiddenDim))
          : Math.cos(pos / Math.pow(10000, 2 * Math.floor(i / 2) / hiddenDim))
        data.push({ position: pos, dimension: i, value })
      }
    }
    return data
  }, [tokens.length, hiddenDim])

  const playAnimation = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    setCurrentLayer(0)

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= TRANSFORMER_COMPONENTS.length - 1) {
          setCurrentLayer(prevLayer => {
            if (prevLayer >= numLayers - 1) {
              setIsPlaying(false)
              clearInterval(interval)
              return 0
            }
            return prevLayer + 1
          })
          return 0
        }
        return prev + 1
      })
    }, animationSpeed)
  }

  const pauseAnimation = () => {
    setIsPlaying(false)
  }

  const resetSimulation = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setCurrentLayer(0)
    setSelectedComponent(null)
    setActiveTab('explorer')
  }

  // Positional Encoding Visualization
  useEffect(() => {
    if (!posEncodingRef.current || positionalEncodingData.length === 0) return

    const container = d3.select(posEncodingRef.current)
    container.selectAll('*').remove()

    const margin = { top: 40, right: 40, bottom: 60, left: 60 }
    const width = 500
    const height = 300
    const cellSize = Math.min(
      (width - margin.left - margin.right) / Math.min(hiddenDim, 64),
      (height - margin.top - margin.bottom) / tokens.length
    )

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([-1, 1])

    const cells = svg.selectAll('.pos-cell')
      .data(positionalEncodingData)
      .enter()
      .append('rect')
      .attr('class', 'pos-cell')
      .attr('x', d => margin.left + d.dimension * cellSize)
      .attr('y', d => margin.top + d.position * cellSize)
      .attr('width', cellSize - 1)
      .attr('height', cellSize - 1)
      .attr('fill', d => colorScale(d.value))
      .attr('opacity', 0)
      .on('mouseover', function(event, d) {
        d3.select('#pos-tooltip').remove()
        container.append('div')
          .attr('id', 'pos-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
          .html(`Pos: ${d.position}<br/>Dim: ${d.dimension}<br/>Value: ${d.value.toFixed(3)}`)
      })
      .on('mouseout', function() {
        d3.select('#pos-tooltip').remove()
      })

    cells.transition()
      .duration(500)
      .delay((d, i) => i * 2)
      .attr('opacity', 0.8)

    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Positional Encoding Matrix')

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Hidden Dimensions')

    svg.append('text')
      .attr('transform', `rotate(-90, 20, ${height / 2})`)
      .attr('x', 20)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Token Positions')

  }, [positionalEncodingData, tokens.length, hiddenDim])

  // Attention Heatmap Visualization
  useEffect(() => {
    if (!attentionHeatmapRef.current || !attentionMatrix.heads[selectedHead]) return

    const container = d3.select(attentionHeatmapRef.current)
    container.selectAll('*').remove()

    const weights = attentionMatrix.heads[selectedHead]
    const matrix: number[][] = []

    for (let i = 0; i < tokens.length; i++) {
      matrix[i] = []
      for (let j = 0; j < tokens.length; j++) {
        const weight = weights.find(w => w.queryToken === i && w.keyToken === j)?.weight || 0
        matrix[i][j] = weight
      }
    }

    const margin = { top: 60, right: 60, bottom: 60, left: 60 }
    const cellSize = 30
    const width = tokens.length * cellSize + margin.left + margin.right
    const height = tokens.length * cellSize + margin.top + margin.bottom

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(matrix.flat()) || 1])

    const rows = svg.selectAll('.row')
      .data(matrix)
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

    cells.append('rect')
      .attr('width', cellSize - 1)
      .attr('height', cellSize - 1)
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 10)
      .attr('opacity', 0.8)

    cells.append('text')
      .attr('x', cellSize / 2)
      .attr('y', cellSize / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('fill', d => d.value > 0.5 ? 'white' : 'black')
      .text(d => d.value.toFixed(2))
      .style('opacity', 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 10 + 200)
      .style('opacity', 1)

  }, [attentionMatrix, selectedHead, tokens])

  // Feed Forward Network Visualization
  useEffect(() => {
    if (!ffnVisualizationRef.current) return

    const container = d3.select(ffnVisualizationRef.current)
    container.selectAll('*').remove()

    const layers = [
      { name: 'Input', size: hiddenDim, color: '#3B82F6' },
      { name: 'Hidden', size: hiddenDim * 4, color: '#10B981' },
      { name: 'Output', size: hiddenDim, color: '#8B5CF6' }
    ]

    const width = 400
    const height = 250
    const layerSpacing = width / (layers.length + 1)

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    layers.forEach((layer, layerIndex) => {
      const nodeCount = Math.min(layer.size, 12)
      const nodeSpacing = height / (nodeCount + 1)
      const x = (layerIndex + 1) * layerSpacing

      for (let i = 0; i < nodeCount; i++) {
        const y = (i + 1) * nodeSpacing

        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 4)
          .attr('fill', layer.color)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(layerIndex * 200 + i * 50)
          .attr('opacity', 0.8)

        if (layerIndex < layers.length - 1) {
          const nextNodeCount = Math.min(layers[layerIndex + 1].size, 12)
          const nextNodeSpacing = height / (nextNodeCount + 1)
          const nextX = (layerIndex + 2) * layerSpacing

          for (let j = 0; j < Math.min(nextNodeCount, 3); j++) {
            const nextY = (j + 1) * nextNodeSpacing

            svg.append('line')
              .attr('x1', x + 4)
              .attr('y1', y)
              .attr('x2', nextX - 4)
              .attr('y2', nextY)
              .attr('stroke', '#94A3B8')
              .attr('stroke-width', 0.5)
              .attr('opacity', 0)
              .transition()
              .duration(300)
              .delay(layerIndex * 200 + i * 50 + 100)
              .attr('opacity', 0.3)
          }
        }
      }

      svg.append('text')
        .attr('x', x)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(`${layer.name} (${layer.size})`)
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .delay(layerIndex * 200)
        .attr('opacity', 1)
    })

  }, [hiddenDim])

  // Architecture Diagram Visualization
  useEffect(() => {
    if (!architectureDiagramRef.current) return

    const container = d3.select(architectureDiagramRef.current)
    container.selectAll('*').remove()

    const width = 600
    const height = 400
    const svg = container.append('svg').attr('width', width).attr('height', height)

    if (architecture === 'encoder-only') {
      // Draw encoder stack
      for (let i = 0; i < numLayers; i++) {
        const y = height - (i + 1) * (height / (numLayers + 2))

        // Layer box
        svg.append('rect')
          .attr('x', width / 2 - 100)
          .attr('y', y - 25)
          .attr('width', 200)
          .attr('height', 40)
          .attr('fill', i === currentLayer ? '#3B82F6' : '#E5E7EB')
          .attr('stroke', '#374151')
          .attr('rx', 5)

        svg.append('text')
          .attr('x', width / 2)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(`Encoder Layer ${i + 1}`)

        if (i < numLayers - 1) {
          svg.append('line')
            .attr('x1', width / 2)
            .attr('y1', y + 25)
            .attr('x2', width / 2)
            .attr('y2', y + 35)
            .attr('stroke', '#374151')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#arrowhead)')
        }
      }
    }

    // Add arrow marker definition
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', '#374151')

  }, [numLayers, currentLayer, architecture])

  const learningObjectives = [
    "Understand the complete transformer architecture components",
    "Visualize how information flows through transformer layers",
    "Explore multi-head attention patterns and mechanisms",
    "See positional encoding and its importance",
    "Learn about feed-forward networks and layer normalization",
    "Understand encoder-decoder vs encoder-only architectures"
  ]

  return (
    <SimulationLayout
      title="Comprehensive Transformer Architecture Explorer"
      description="Deep dive into transformer components with interactive visualizations"
      difficulty="Advanced"
      category="Transformers"
      onPlay={playAnimation}
      onPause={pauseAnimation}
      onReset={resetSimulation}
      isPlaying={isPlaying}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-white rounded-lg shadow-lg p-1">
          {[
            { key: 'explorer', label: 'Architecture Explorer', icon: Brain },
            { key: 'learn', label: 'Key Concepts', icon: Book }
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
        {activeTab === 'explorer' && (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="mr-2 text-blue-600" size={20} />
            Transformer Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Text
              </label>
              <select
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SAMPLE_INPUTS.map((sample, index) => (
                  <option key={index} value={sample}>{sample}</option>
                ))}
              </select>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                placeholder="Or enter custom text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Architecture Type
              </label>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="encoder-only">Encoder Only (BERT-like)</option>
                <option value="decoder-only">Decoder Only (GPT-like)</option>
                <option value="encoder-decoder">Encoder-Decoder (T5-like)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Speed: {animationSpeed}ms
              </label>
              <input
                type="range"
                min="300"
                max="3000"
                step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layers: {numLayers}
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={numLayers}
                onChange={(e) => setNumLayers(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attention Heads: {numHeads}
              </label>
              <input
                type="range"
                min="1"
                max="16"
                value={numHeads}
                onChange={(e) => setNumHeads(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hidden Dim: {hiddenDim}
              </label>
              <select
                value={hiddenDim}
                onChange={(e) => setHiddenDim(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={256}>256</option>
                <option value={512}>512</option>
                <option value={768}>768</option>
                <option value={1024}>1024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Head: {selectedHead + 1}
              </label>
              <input
                type="range"
                min="0"
                max={numHeads - 1}
                value={selectedHead}
                onChange={(e) => setSelectedHead(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Components Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Layers className="mr-2 text-purple-600" size={20} />
                Transformer Components
              </h3>

              <div className="space-y-3">
                {TRANSFORMER_COMPONENTS.map((component, index) => {
                  const Icon = component.icon
                  const isActive = (isPlaying && index === currentStep) ||
                                  (!isPlaying && index <= currentStep)
                  const isSelected = selectedComponent === component.id

                  return (
                    <motion.div
                      key={component.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isActive
                          ? component.color + ' shadow-lg'
                          : isSelected
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedComponent(
                        selectedComponent === component.id ? null : component.id
                      )}
                      animate={{
                        scale: isPlaying && index === currentStep ? 1.02 : 1,
                      }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon size={18} className="mr-3 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{component.name}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {component.description}
                            </div>
                          </div>
                        </div>
                        {isPlaying && index === currentStep && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap className="text-yellow-500" size={16} />
                          </motion.div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-gray-200"
                          >
                            <div className="text-xs text-gray-700">
                              {component.detail}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Processing Status
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Layer</span>
                  <span className="font-semibold text-blue-600">
                    {currentLayer + 1} / {numLayers}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Step</span>
                  <span className="font-semibold text-green-600">
                    {TRANSFORMER_COMPONENTS[currentStep]?.name || 'Ready'}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    animate={{
                      width: `${((currentLayer * TRANSFORMER_COMPONENTS.length + currentStep) /
                              (numLayers * TRANSFORMER_COMPONENTS.length)) * 100}%`
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  {Math.round(((currentLayer * TRANSFORMER_COMPONENTS.length + currentStep) /
                              (numLayers * TRANSFORMER_COMPONENTS.length)) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Main Visualization Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Architecture Diagram */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Architecture Overview
              </h3>
              <div
                ref={architectureDiagramRef}
                className="w-full overflow-x-auto"
                style={{ minHeight: '400px' }}
              />
            </div>

            {/* Token Flow */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Token Processing Flow (Layer {currentLayer + 1})
              </h3>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {tokens.map((token, index) => (
                    <motion.div
                      key={index}
                      className="relative"
                      animate={{
                        scale: isPlaying ? [1, 1.1, 1] : 1,
                        y: showDataFlow && isPlaying ? [0, -10, 0] : 0
                      }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.1,
                        repeat: isPlaying ? Infinity : 0,
                        repeatType: 'reverse'
                      }}
                    >
                      <div className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg border border-blue-200 font-mono text-sm">
                        {token}
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {hiddenDim}d vector
                      </div>
                    </motion.div>
                  ))}
                </div>

                {showDataFlow && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ArrowDown className="text-blue-500" size={16} />
                    <span>Data flows through {TRANSFORMER_COMPONENTS.length} operations per layer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Component-Specific Visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Positional Encoding */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Positional Encoding Matrix
                </h3>
                <div
                  ref={posEncodingRef}
                  className="w-full overflow-x-auto border rounded-lg bg-gray-50"
                  style={{ minHeight: '300px' }}
                />
                <div className="mt-2 text-xs text-gray-600">
                  Sinusoidal patterns encode position information
                </div>
              </div>

              {/* Attention Heatmap */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attention Heatmap (Head {selectedHead + 1})
                </h3>
                <div
                  ref={attentionHeatmapRef}
                  className="w-full overflow-x-auto border rounded-lg bg-gray-50"
                  style={{ minHeight: '300px' }}
                />
                <div className="mt-2 text-xs text-gray-600">
                  Darker colors = stronger attention weights
                </div>
              </div>
            </div>

            {/* Feed Forward Network */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Feed Forward Network Architecture
              </h3>
              <div
                ref={ffnVisualizationRef}
                className="w-full border rounded-lg bg-gray-50 p-4"
                style={{ minHeight: '250px' }}
              />
              <div className="mt-2 text-xs text-gray-600">
                Two-layer MLP: {hiddenDim} → {hiddenDim * 4} → {hiddenDim} with ReLU activation
              </div>
            </div>

            {/* Model Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Model Statistics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tokens.length}
                  </div>
                  <div className="text-sm text-gray-600">Input Tokens</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {numHeads}
                  </div>
                  <div className="text-sm text-gray-600">Attention Heads</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {hiddenDim}
                  </div>
                  <div className="text-sm text-gray-600">Hidden Dimensions</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {(numLayers * (hiddenDim * hiddenDim * 4 + hiddenDim * 4 + hiddenDim * hiddenDim + hiddenDim) / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-600">Parameters (est.)</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  <strong>Current Processing State:</strong> {
                    isPlaying
                      ? `Executing ${TRANSFORMER_COMPONENTS[currentStep]?.name} in Layer ${currentLayer + 1}`
                      : currentLayer === numLayers - 1 && currentStep === TRANSFORMER_COMPONENTS.length - 1
                      ? "Processing complete! Final representations ready for output head."
                      : "Ready to process input through transformer layers."
                  }
                </div>

                {selectedComponent && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-800">
                      {TRANSFORMER_COMPONENTS.find(c => c.id === selectedComponent)?.name}:
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {TRANSFORMER_COMPONENTS.find(c => c.id === selectedComponent)?.detail}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  Transformer Architecture Learning Center
                </h3>
                <p className="text-gray-600">
                  Understanding the revolutionary transformer architecture that powers modern AI systems.
                  From attention mechanisms to complete language models, explore the mathematical foundations
                  and architectural innovations that enable today&apos;s most capable AI systems.
                </p>
              </div>

              {/* Self-Attention Mechanism */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="mr-2 text-indigo-600" size={20} />
                  Self-Attention Mechanisms
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Core Concept</h5>
                      <p className="text-sm text-blue-800 mb-3">
                        Self-attention allows each token to &quot;attend&quot; to all other tokens in the sequence,
                        learning which parts are most relevant for understanding its meaning in context.
                      </p>
                      <div className="bg-white p-3 rounded text-xs font-mono text-blue-800">
                        Attention(Q,K,V) = softmax(QK^T/√d_k)V
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">Query, Key, Value Matrices</h5>
                      <div className="space-y-2 text-sm text-green-800">
                        <div><strong>Query (Q):</strong> &quot;What am I looking for?&quot;</div>
                        <div><strong>Key (K):</strong> &quot;What information do I contain?&quot;</div>
                        <div><strong>Value (V):</strong> &quot;What information do I provide?&quot;</div>
                      </div>
                      <div className="mt-2 text-xs text-green-700">
                        Each token generates Q, K, V through learned linear transformations
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Attention Computation Steps</h5>
                    <div className="space-y-3 text-sm">
                      {[
                        { step: 1, title: "Linear Projections", desc: "X → Q, K, V via learned weights W_Q, W_K, W_V" },
                        { step: 2, title: "Compute Scores", desc: "Score matrix = Q × K^T (compatibility between tokens)" },
                        { step: 3, title: "Scale & Normalize", desc: "Divide by √d_k, apply softmax for probabilities" },
                        { step: 4, title: "Weighted Values", desc: "Multiply attention weights by V to get output" }
                      ].map((item) => (
                        <div key={item.step} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                            {item.step}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-gray-600 text-xs">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Head Attention */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Grid className="mr-2 text-purple-600" size={20} />
                  Multi-Head Attention
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-semibold text-purple-900 mb-2">Parallel Processing Power</h5>
                    <p className="text-sm text-purple-800 mb-3">
                      Multiple attention heads learn different types of relationships simultaneously.
                      Each head has its own Q, K, V projections and attends to different aspects of the input.
                    </p>
                    <div className="bg-white p-2 rounded text-xs font-mono text-purple-800">
                      MultiHead(Q,K,V) = Concat(head₁, ..., head_h)W^O
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Syntactic Relationships", desc: "Subject-verb, adjective-noun dependencies", color: "bg-blue-100 text-blue-800" },
                      { name: "Semantic Associations", desc: "Related concepts and meaning connections", color: "bg-green-100 text-green-800" },
                      { name: "Positional Patterns", desc: "Distance-based and sequential relationships", color: "bg-yellow-100 text-yellow-800" },
                      { name: "Global Context", desc: "Long-range dependencies across the sequence", color: "bg-red-100 text-red-800" }
                    ].map((head, index) => (
                      <div key={index} className={`p-3 rounded-lg ${head.color}`}>
                        <div className="font-medium text-sm">Head {index + 1}: {head.name}</div>
                        <div className="text-xs mt-1">{head.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-2">Why Multiple Heads?</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Representation Subspaces:</strong>
                      <p className="text-gray-600 text-xs mt-1">Each head operates in a different learned subspace of the model dimensions</p>
                    </div>
                    <div>
                      <strong>Diverse Attention Patterns:</strong>
                      <p className="text-gray-600 text-xs mt-1">Different heads capture different linguistic phenomena and relationships</p>
                    </div>
                    <div>
                      <strong>Robustness & Redundancy:</strong>
                      <p className="text-gray-600 text-xs mt-1">Multiple heads provide backup and complementary information pathways</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Positional Encoding */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Compass className="mr-2 text-green-600" size={20} />
                  Positional Encoding
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="p-4 bg-green-50 rounded-lg mb-4">
                      <h5 className="font-semibold text-green-900 mb-2">The Position Problem</h5>
                      <p className="text-sm text-green-800 mb-3">
                        Unlike RNNs, transformers process all tokens simultaneously. Without positional information,
                        &quot;The cat sat on the mat&quot; would be identical to &quot;Mat the on sat cat the&quot;.
                      </p>
                      <div className="text-xs text-green-700">
                        <strong>Solution:</strong> Add position-specific vectors to token embeddings
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 border border-gray-200 rounded">
                        <strong className="text-sm">Sinusoidal Encoding Formula:</strong>
                        <div className="bg-gray-100 p-2 mt-2 rounded text-xs font-mono">
                          PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
                          <br />
                          PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Where pos = position, i = dimension index, d_model = embedding size
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h6 className="font-semibold text-blue-900 text-sm mb-2">Why Sinusoidal?</h6>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Unique encoding for each position</li>
                        <li>• Relative position relationships</li>
                        <li>• Extrapolates to longer sequences</li>
                        <li>• No learnable parameters needed</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h6 className="font-semibold text-orange-900 text-sm mb-2">Alternative Approaches</h6>
                      <ul className="text-xs text-orange-800 space-y-1">
                        <li>• <strong>Learned:</strong> Train position embeddings</li>
                        <li>• <strong>Relative:</strong> Distance-based encoding</li>
                        <li>• <strong>RoPE:</strong> Rotary position embedding</li>
                        <li>• <strong>ALiBi:</strong> Attention bias methods</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer Architecture */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Layers className="mr-2 text-orange-600" size={20} />
                  Layer Architecture & Information Flow
                </h4>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h5 className="font-semibold text-orange-900 mb-2">Residual Connections</h5>
                      <p className="text-sm text-orange-800 mb-3">
                        Skip connections allow gradients to flow directly to earlier layers,
                        enabling training of very deep networks without vanishing gradients.
                      </p>
                      <div className="bg-white p-2 rounded text-xs font-mono text-orange-800">
                        output = LayerNorm(x + Sublayer(x))
                      </div>
                      <div className="text-xs text-orange-700 mt-2">
                        <strong>Benefits:</strong> Stable training, gradient flow, identity mapping
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50 rounded-lg">
                      <h5 className="font-semibold text-teal-900 mb-2">Layer Normalization</h5>
                      <p className="text-sm text-teal-800 mb-3">
                        Normalizes inputs across the feature dimension, stabilizing training
                        and allowing higher learning rates for faster convergence.
                      </p>
                      <div className="bg-white p-2 rounded text-xs font-mono text-teal-800">
                        LN(x) = γ((x-μ)/σ) + β
                      </div>
                      <div className="text-xs text-teal-700 mt-2">
                        <strong>Components:</strong> μ=mean, σ=std, γ=scale, β=shift (learned)
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h5 className="font-semibold text-yellow-900 mb-3">Feed-Forward Network (FFN)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-yellow-800 mb-3">
                          Two-layer MLP that processes each position independently. Typically expands
                          to 4x the model dimension, then projects back down.
                        </p>
                        <div className="bg-white p-2 rounded text-xs font-mono text-yellow-800">
                          FFN(x) = max(0, xW₁ + b₁)W₂ + b₂
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-yellow-800">
                          <strong>Architecture:</strong> 512 → 2048 → 512 (typical)
                        </div>
                        <div className="text-xs text-yellow-800">
                          <strong>Activation:</strong> ReLU (original), GELU (modern)
                        </div>
                        <div className="text-xs text-yellow-800">
                          <strong>Purpose:</strong> Non-linear transformation, feature mixing
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete Layer Flow */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Complete Transformer Layer Flow</h5>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      {[
                        "Input", "Multi-Head Attention", "Add & Norm", "Feed Forward", "Add & Norm", "Output"
                      ].map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div className={`px-3 py-1 rounded ${
                            index % 2 === 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {step}
                          </div>
                          {index < 5 && <ArrowRight size={16} className="mx-2 text-gray-400" />}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      Each layer applies attention, adds residual connection, normalizes, applies FFN, adds residual, and normalizes again.
                    </div>
                  </div>
                </div>
              </div>

              {/* Encoder vs Decoder */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GitBranch className="mr-2 text-red-600" size={20} />
                  Encoder-Decoder vs Encoder-Only Architecture
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-3">Encoder-Only (BERT-style)</h5>
                    <p className="text-sm text-blue-800 mb-3">
                      Bidirectional attention allows each token to see the entire sequence.
                      Perfect for understanding tasks like classification and question answering.
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <strong>Attention Pattern:</strong> Bidirectional (can see future tokens)
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Use Cases:</strong> Classification, NER, Q&A, sentiment analysis
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Examples:</strong> BERT, RoBERTa, DeBERTa
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-3">Decoder-Only (GPT-style)</h5>
                    <p className="text-sm text-green-800 mb-3">
                      Causal (masked) attention prevents tokens from seeing future positions.
                      Designed for autoregressive generation tasks like text completion.
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <strong>Attention Pattern:</strong> Causal/Masked (can&apos;t see future tokens)
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Use Cases:</strong> Text generation, completion, chatbots
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Examples:</strong> GPT, LLaMA, Claude
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold text-purple-900 mb-3">Full Encoder-Decoder (T5-style)</h5>
                  <p className="text-sm text-purple-800 mb-3">
                    Combines both architectures: encoder processes input with bidirectional attention,
                    decoder generates output with cross-attention to encoder and causal self-attention.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2 rounded">
                      <strong>Encoder:</strong> Bidirectional attention on input
                    </div>
                    <div className="bg-white p-2 rounded">
                      <strong>Cross-Attention:</strong> Decoder attends to encoder
                    </div>
                    <div className="bg-white p-2 rounded">
                      <strong>Decoder:</strong> Causal attention on output
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-700">
                    <strong>Use Cases:</strong> Translation, summarization, seq2seq tasks • <strong>Examples:</strong> T5, BART, mT5
                  </div>
                </div>
              </div>

              {/* Modern Applications */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Cpu className="mr-2 text-purple-600" size={20} />
                  Modern Applications & Scaling
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Language Models",
                      description: "Large-scale autoregressive models for text generation",
                      examples: ["GPT-4", "Claude", "LLaMA", "Gemini"],
                      capabilities: ["Text completion", "Conversation", "Code generation", "Reasoning"]
                    },
                    {
                      title: "Understanding Models",
                      description: "Bidirectional models for comprehension tasks",
                      examples: ["BERT", "RoBERTa", "DeBERTa", "ELECTRA"],
                      capabilities: ["Classification", "Question answering", "Named entity recognition", "Sentiment analysis"]
                    },
                    {
                      title: "Multimodal Systems",
                      description: "Transformers extended to vision, audio, and other modalities",
                      examples: ["Vision Transformer", "CLIP", "Whisper", "DALL-E"],
                      capabilities: ["Image understanding", "Speech recognition", "Image generation", "Cross-modal search"]
                    },
                    {
                      title: "Specialized Architectures",
                      description: "Domain-specific transformer variants",
                      examples: ["AlphaFold", "ESM", "CodeBERT", "LayoutLM"],
                      capabilities: ["Protein folding", "Code understanding", "Document layout", "Scientific reasoning"]
                    },
                    {
                      title: "Efficiency Innovations",
                      description: "Optimizations for practical deployment",
                      examples: ["Linformer", "Performer", "Longformer", "Switch Transformer"],
                      capabilities: ["Linear attention", "Sparse patterns", "Long sequences", "Mixture of experts"]
                    },
                    {
                      title: "Agent Systems",
                      description: "Transformers as reasoning and action engines",
                      examples: ["ReAct", "Toolformer", "WebGPT", "Chain-of-Thought"],
                      capabilities: ["Tool usage", "Multi-step reasoning", "Planning", "External knowledge"]
                    }
                  ].map((app, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h5 className="font-semibold text-gray-900 mb-2">{app.title}</h5>
                      <p className="text-sm text-gray-600 mb-3">{app.description}</p>

                      <div className="mb-3">
                        <div className="text-xs font-semibold text-purple-700 mb-1">Examples:</div>
                        <div className="flex flex-wrap gap-1">
                          {app.examples.map((example, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-blue-700 mb-1">Capabilities:</div>
                        <ul className="space-y-1">
                          {app.capabilities.map((cap, i) => (
                            <li key={i} className="text-xs text-blue-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {cap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="mr-2 text-gray-600" size={20} />
                  Implementation Best Practices
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Training Considerations</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Use appropriate learning rate schedules (warmup + decay)
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Apply gradient clipping to prevent instability
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Use mixed precision training for efficiency
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Implement proper attention masking for padding
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Monitor attention weights for debugging
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Scaling Guidelines</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Scale layers, heads, and dimensions proportionally
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Consider memory constraints for sequence length
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Use efficient attention variants for long sequences
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Optimize for target hardware (TPU vs GPU)
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Profile and optimize the critical path operations
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-semibold text-yellow-900 mb-2">Key Architecture Decisions</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-800">
                    <div>
                      <strong>Model Size:</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Balance capability vs. cost</li>
                        <li>• Consider inference requirements</li>
                        <li>• Plan for fine-tuning needs</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Architecture Type:</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Encoder for understanding tasks</li>
                        <li>• Decoder for generation tasks</li>
                        <li>• Full enc-dec for seq2seq</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Attention Pattern:</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Full attention for quality</li>
                        <li>• Sparse patterns for efficiency</li>
                        <li>• Local attention for long sequences</li>
                      </ul>
                    </div>
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