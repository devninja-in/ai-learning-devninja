'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Brain,
  Layers,
  Cpu,
  Zap,
  Settings,
  BarChart3,
  ArrowRight,
  Microscope,
  Target,
  Database,
  GitCompare,
  Puzzle,
  Book,
  Calculator,
  Shuffle,
  Activity,
  TrendingUp,
  RotateCcw,
  Lightbulb,
  Gauge,
  CheckSquare
} from 'lucide-react'

interface ModelArchitecture {
  id: string
  name: string
  developer: string
  parameters: string[]
  contextLength: number
  positionEncoding: string
  normalization: string
  activation: string
  architecture: string
  highlights: string[]
  color: string
  borderColor: string
  year: number
}

const MODEL_ARCHITECTURES: ModelArchitecture[] = [
  {
    id: 'llama',
    name: 'Llama 2/3',
    developer: 'Meta',
    parameters: ['7B', '13B', '70B', '405B'],
    contextLength: 4096,
    positionEncoding: 'RoPE',
    normalization: 'RMSNorm',
    activation: 'SwiGLU',
    architecture: 'Decoder-only Transformer',
    highlights: [
      'Group Query Attention (GQA)',
      'RMSNorm for efficiency',
      'SwiGLU activation function',
      'RoPE for position encoding'
    ],
    color: 'bg-blue-50',
    borderColor: 'border-blue-200',
    year: 2023
  },
  {
    id: 'mistral',
    name: 'Mistral 7B',
    developer: 'Mistral AI',
    parameters: ['7B', '22B', '8x7B (MoE)', '8x22B (MoE)'],
    contextLength: 32768,
    positionEncoding: 'RoPE',
    normalization: 'RMSNorm',
    activation: 'SwiGLU',
    architecture: 'Decoder-only Transformer',
    highlights: [
      'Sliding Window Attention',
      'Mixture of Experts (MoE)',
      'Extended context length',
      'Efficient sparse activation'
    ],
    color: 'bg-purple-50',
    borderColor: 'border-purple-200',
    year: 2023
  },
  {
    id: 'gemma',
    name: 'Gemma',
    developer: 'Google',
    parameters: ['2B', '7B', '9B', '27B'],
    contextLength: 8192,
    positionEncoding: 'RoPE',
    normalization: 'RMSNorm',
    activation: 'GELU',
    architecture: 'Decoder-only Transformer',
    highlights: [
      'Multi-Query Attention',
      'Optimized for efficiency',
      'Research-friendly license',
      'Strong performance per parameter'
    ],
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    year: 2024
  },
  {
    id: 'phi',
    name: 'Phi-3',
    developer: 'Microsoft',
    parameters: ['3.8B', '7B', '14B'],
    contextLength: 131072,
    positionEncoding: 'RoPE',
    normalization: 'RMSNorm',
    activation: 'SwiGLU',
    architecture: 'Decoder-only Transformer',
    highlights: [
      'Ultra-long context (128K)',
      'Small but powerful',
      'Optimized training data',
      'Mobile-friendly variants'
    ],
    color: 'bg-orange-50',
    borderColor: 'border-orange-200',
    year: 2024
  }
]

const TECHNICAL_COMPONENTS = [
  {
    id: 'rope',
    name: 'RoPE (Rotary Position Embedding)',
    description: 'Encodes positional information through rotation in complex space',
    category: 'Position Encoding',
    advantages: ['Better extrapolation', 'Relative position awareness', 'Context length extension'],
    icon: Target,
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 'rmsnorm',
    name: 'RMSNorm (Root Mean Square)',
    description: 'Simplified normalization technique for improved efficiency',
    category: 'Normalization',
    advantages: ['Computational efficiency', 'Training stability', 'Reduced parameters'],
    icon: Activity,
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 'swiglu',
    name: 'SwiGLU Activation',
    description: 'Gated linear unit with Swish activation for better performance',
    category: 'Activation Function',
    advantages: ['Better gradient flow', 'Improved performance', 'Non-linear expressivity'],
    icon: Zap,
    color: 'text-purple-600 bg-purple-50'
  },
  {
    id: 'moe',
    name: 'Mixture of Experts (MoE)',
    description: 'Sparse activation using specialized expert networks',
    category: 'Architecture Pattern',
    advantages: ['Parameter efficiency', 'Scalable performance', 'Specialized knowledge'],
    icon: Puzzle,
    color: 'text-orange-600 bg-orange-50'
  }
]

export default function ModelInternalsSimulation() {
  const [selectedModel, setSelectedModel] = useState<string>('llama')
  const [comparisonMode, setComparisonMode] = useState<boolean>(false)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'comparison' | 'components' | 'learn'>('overview')

  const architectureDiagramRef = useRef<HTMLDivElement>(null)
  const comparisonChartRef = useRef<HTMLDivElement>(null)

  const selectedModelData = MODEL_ARCHITECTURES.find(m => m.id === selectedModel)

  // Architecture Diagram Visualization
  useEffect(() => {
    if (!architectureDiagramRef.current || !selectedModelData) return

    const container = d3.select(architectureDiagramRef.current)
    container.selectAll('*').remove()

    const width = 600
    const height = 400
    const svg = container.append('svg').attr('width', width).attr('height', height)

    // Draw architecture blocks
    const blocks = [
      { name: 'Input Embeddings', x: 50, y: 50, width: 120, height: 40 },
      { name: selectedModelData.positionEncoding, x: 200, y: 50, width: 100, height: 40 },
      { name: 'Multi-Head\nAttention', x: 50, y: 130, width: 120, height: 60 },
      { name: selectedModelData.normalization, x: 200, y: 130, width: 100, height: 60 },
      { name: 'Feed Forward\n(' + selectedModelData.activation + ')', x: 330, y: 130, width: 120, height: 60 },
      { name: 'Output Layer', x: 200, y: 250, width: 100, height: 40 }
    ]

    blocks.forEach((block, index) => {
      svg.append('rect')
        .attr('x', block.x)
        .attr('y', block.y)
        .attr('width', block.width)
        .attr('height', block.height)
        .attr('fill', selectedModelData.color.replace('bg-', '').includes('blue') ? '#EFF6FF' :
                     selectedModelData.color.replace('bg-', '').includes('purple') ? '#FAF5FF' :
                     selectedModelData.color.replace('bg-', '').includes('green') ? '#F0FDF4' : '#FFF7ED')
        .attr('stroke', selectedModelData.borderColor.replace('border-', '').includes('blue') ? '#3B82F6' :
                       selectedModelData.borderColor.replace('border-', '').includes('purple') ? '#8B5CF6' :
                       selectedModelData.borderColor.replace('border-', '').includes('green') ? '#10B981' : '#F97316')
        .attr('stroke-width', 2)
        .attr('rx', 8)
        .style('opacity', 0)
        .transition()
        .duration(600)
        .delay(index * 100)
        .style('opacity', 1)

      svg.append('text')
        .attr('x', block.x + block.width / 2)
        .attr('y', block.y + block.height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(block.name.split('\n')[0])
        .style('opacity', 0)
        .transition()
        .duration(600)
        .delay(index * 100 + 200)
        .style('opacity', 1)

      if (block.name.includes('\n')) {
        svg.append('text')
          .attr('x', block.x + block.width / 2)
          .attr('y', block.y + block.height / 2 + 15)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .text(block.name.split('\n')[1])
          .style('opacity', 0)
          .transition()
          .duration(600)
          .delay(index * 100 + 300)
          .style('opacity', 1)
      }
    })

    // Add connection arrows
    const connections = [
      { from: { x: 170, y: 70 }, to: { x: 200, y: 70 } },
      { from: { x: 110, y: 90 }, to: { x: 110, y: 130 } },
      { from: { x: 170, y: 160 }, to: { x: 200, y: 160 } },
      { from: { x: 320, y: 160 }, to: { x: 330, y: 160 } },
      { from: { x: 390, y: 190 }, to: { x: 250, y: 250 } }
    ]

    connections.forEach((conn, index) => {
      svg.append('line')
        .attr('x1', conn.from.x)
        .attr('y1', conn.from.y)
        .attr('x2', conn.to.x)
        .attr('y2', conn.to.y)
        .attr('stroke', '#6B7280')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .style('opacity', 0)
        .transition()
        .duration(400)
        .delay(1000 + index * 100)
        .style('opacity', 0.7)
    })

    // Add arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', '#6B7280')

  }, [selectedModelData])

  // Comparison Chart
  useEffect(() => {
    if (!comparisonChartRef.current || viewMode !== 'comparison') return

    const container = d3.select(comparisonChartRef.current)
    container.selectAll('*').remove()

    const width = 800
    const height = 400
    const margin = { top: 40, right: 40, bottom: 80, left: 60 }

    const svg = container.append('svg').attr('width', width).attr('height', height)

    const data = MODEL_ARCHITECTURES.map(model => ({
      name: model.name,
      contextLength: model.contextLength,
      maxParams: parseFloat(model.parameters[model.parameters.length - 1].replace(/[^0-9.]/g, '')),
      year: model.year
    }))

    // Context Length Comparison
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.2)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.contextLength) || 0])
      .range([height - margin.bottom, margin.top])

    // Draw bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name) || 0)
      .attr('y', d => yScale(d.contextLength))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.contextLength))
      .attr('fill', (d, i) => ['#3B82F6', '#8B5CF6', '#10B981', '#F97316'][i])
      .attr('opacity', 0.8)

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Add labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Model Architectures')

    svg.append('text')
      .attr('transform', `rotate(-90, 20, ${height / 2})`)
      .attr('x', 20)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .text('Context Length (tokens)')

  }, [viewMode])

  const learningObjectives = [
    "Understand modern LLM architecture variants and their innovations",
    "Compare technical components like RoPE, RMSNorm, and SwiGLU",
    "Explore Mixture of Experts and context length extension techniques",
    "Learn how architectural choices affect performance and efficiency",
    "See the evolution from original transformers to modern LLMs"
  ]

  return (
    <SimulationLayout
      title="Model Internals Explorer"
      description="Deep dive into modern LLM architectures and advanced components"
      difficulty="Advanced"
      category="Model Internals"
      learningObjectives={learningObjectives}
      showControls={false}
    >
      <div className="space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'overview', label: 'Architecture Overview', icon: Brain },
              { id: 'comparison', label: 'Model Comparison', icon: GitCompare },
              { id: 'components', label: 'Technical Components', icon: Cpu },
              { id: 'learn', label: 'Key Concepts', icon: Book }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id as any)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  viewMode === id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Model Selection */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="mr-2 text-blue-600" size={20} />
                  Select Model Architecture
                </h3>
                <div className="space-y-3">
                  {MODEL_ARCHITECTURES.map((model) => (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedModel === model.id
                          ? `${model.color} ${model.borderColor} border-2`
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-semibold text-gray-900">{model.name}</div>
                      <div className="text-sm text-gray-600">{model.developer}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {model.parameters.join(', ')} • {model.year}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Model Details */}
              {selectedModelData && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedModelData.name} Details
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700">Context Length</div>
                        <div className="text-gray-900">{selectedModelData.contextLength.toLocaleString()} tokens</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">Parameters</div>
                        <div className="text-gray-900">{selectedModelData.parameters.join(', ')}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">Position Encoding</div>
                        <div className="text-gray-900">{selectedModelData.positionEncoding}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">Normalization</div>
                        <div className="text-gray-900">{selectedModelData.normalization}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="font-medium text-gray-700 mb-2">Key Highlights</div>
                      <ul className="space-y-1">
                        {selectedModelData.highlights.map((highlight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Visualization */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedModelData?.name} Architecture Diagram
                </h3>
                <div
                  ref={architectureDiagramRef}
                  className="w-full overflow-x-auto border rounded-lg bg-gray-50"
                  style={{ minHeight: '400px' }}
                />
                <div className="mt-4 text-sm text-gray-600">
                  Interactive architecture diagram showing the key components and data flow
                  through the {selectedModelData?.name} model.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Mode */}
        {viewMode === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Model Architecture Comparison
              </h3>
              <div
                ref={comparisonChartRef}
                className="w-full overflow-x-auto"
                style={{ minHeight: '400px' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {MODEL_ARCHITECTURES.map((model) => (
                <div
                  key={model.id}
                  className={`${model.color} ${model.borderColor} border rounded-lg p-6`}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{model.name}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Developer:</span> {model.developer}
                    </div>
                    <div>
                      <span className="font-medium">Max Params:</span> {model.parameters[model.parameters.length - 1]}
                    </div>
                    <div>
                      <span className="font-medium">Context:</span> {model.contextLength.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Position:</span> {model.positionEncoding}
                    </div>
                    <div>
                      <span className="font-medium">Norm:</span> {model.normalization}
                    </div>
                    <div>
                      <span className="font-medium">Activation:</span> {model.activation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Components Mode */}
        {viewMode === 'components' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TECHNICAL_COMPONENTS.map((component) => {
                const Icon = component.icon
                const isSelected = selectedComponent === component.id

                return (
                  <motion.div
                    key={component.id}
                    className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-blue-300 shadow-xl' : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => setSelectedComponent(isSelected ? null : component.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${component.color}`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {component.category}
                      </span>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2">{component.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{component.description}</p>

                    <div>
                      <div className="font-medium text-sm text-gray-700 mb-2">Key Advantages:</div>
                      <ul className="space-y-1">
                        {component.advantages.map((advantage, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="text-sm text-gray-700">
                            Click to explore detailed visualization of {component.name}
                          </div>
                          <button className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200 transition-colors">
                            Open Interactive Demo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {selectedComponent && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {TECHNICAL_COMPONENTS.find(c => c.id === selectedComponent)?.name} Deep Dive
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> Interactive visualization for {TECHNICAL_COMPONENTS.find(c => c.id === selectedComponent)?.name}
                    will provide hands-on exploration of this component&apos;s behavior and implementation details.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Concepts Mode */}
        {viewMode === 'learn' && (
          <div className="space-y-8">
            {/* Learning Center Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Book className="mr-2 text-purple-600" size={24} />
                Model Internals Learning Center
              </h3>
              <p className="text-gray-600">
                Understanding the architectural innovations that power modern large language models.
                From RoPE to Mixture of Experts, explore the technical advances that make today&apos;s AI systems
                more efficient, capable, and scalable than ever before.
              </p>
            </div>

            {/* Architecture Comparison Framework */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GitCompare className="mr-2 text-indigo-600" size={20} />
                Architecture Comparison Principles
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Evaluation Framework</h5>
                    <p className="text-sm text-blue-800 mb-3">
                      Modern LLM architectures are compared across multiple dimensions to understand
                      their strengths and optimal use cases.
                    </p>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div><strong>Performance:</strong> Quality, speed, throughput metrics</div>
                      <div><strong>Efficiency:</strong> Parameter count, memory usage, compute requirements</div>
                      <div><strong>Scalability:</strong> Training stability, context length, model sizes</div>
                      <div><strong>Innovation:</strong> Novel components, architectural improvements</div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-2">Key Architectural Decisions</h5>
                    <div className="space-y-2 text-sm text-green-800">
                      <div><strong>Position Encoding:</strong> How to represent sequence order</div>
                      <div><strong>Attention Patterns:</strong> Full vs sparse vs local attention</div>
                      <div><strong>Normalization:</strong> Where and how to normalize activations</div>
                      <div><strong>Activation Functions:</strong> Non-linearities and gating mechanisms</div>
                      <div><strong>Parameter Sharing:</strong> Efficiency through expert routing</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Evolution Timeline</h5>
                  <div className="space-y-3 text-sm">
                    {[
                      { year: "2017", innovation: "Original Transformer", desc: "Attention is All You Need" },
                      { year: "2018", innovation: "BERT & GPT", desc: "Bidirectional encoding & autoregressive generation" },
                      { year: "2019", innovation: "T5 & RoBERTa", desc: "Text-to-text and training optimizations" },
                      { year: "2020", innovation: "GPT-3", desc: "Scaling laws and emergent capabilities" },
                      { year: "2021", innovation: "Switch Transformer", desc: "Mixture of Experts at scale" },
                      { year: "2022", innovation: "PaLM, Chinchilla", desc: "Compute-optimal training" },
                      { year: "2023", innovation: "LLaMA, RoPE", desc: "Efficient architectures and position encoding" }
                    ].map((milestone, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-12 h-6 bg-purple-100 text-purple-800 rounded text-xs font-bold flex items-center justify-center">
                          {milestone.year}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{milestone.innovation}</div>
                          <div className="text-gray-600 text-xs">{milestone.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RoPE vs Traditional Encoding */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RotateCcw className="mr-2 text-green-600" size={20} />
                RoPE vs Traditional Position Encoding
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-semibold text-yellow-900 mb-3">Traditional Sinusoidal Encoding</h5>
                  <p className="text-sm text-yellow-800 mb-3">
                    Fixed position embeddings added to token embeddings. Works well but has limitations
                    for relative position understanding and context length extension.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="bg-white p-2 rounded text-xs font-mono text-yellow-800">
                      PE(pos, 2i) = sin(pos / 10000^(2i/d))
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-yellow-800">
                      PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-yellow-800">
                    <div><strong>Pros:</strong> Simple, deterministic, no parameters</div>
                    <div><strong>Cons:</strong> Fixed patterns, poor extrapolation</div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-semibold text-green-900 mb-3">Rotary Position Embedding (RoPE)</h5>
                  <p className="text-sm text-green-800 mb-3">
                    Applies rotation matrices to query and key embeddings based on position.
                    Enables better relative position understanding and context extrapolation.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="bg-white p-2 rounded text-xs font-mono text-green-800">
                      q_m = R_θ(m) · q_m
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-green-800">
                      k_n = R_θ(n) · k_n
                    </div>
                    <div className="text-xs text-green-700 mt-1">Where R_θ is rotation matrix based on position</div>
                  </div>

                  <div className="space-y-1 text-xs text-green-800">
                    <div><strong>Pros:</strong> Relative positions, extrapolation, efficiency</div>
                    <div><strong>Cons:</strong> More complex implementation</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Why RoPE is Superior</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <strong>Relative Position Awareness:</strong>
                    <p className="text-xs mt-1">Attention naturally focuses on relative distances rather than absolute positions</p>
                  </div>
                  <div>
                    <strong>Context Length Extrapolation:</strong>
                    <p className="text-xs mt-1">Can handle sequences longer than training data with maintained performance</p>
                  </div>
                  <div>
                    <strong>Computational Efficiency:</strong>
                    <p className="text-xs mt-1">No additional parameters and can be computed efficiently during attention</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mixture of Experts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shuffle className="mr-2 text-purple-600" size={20} />
                Mixture of Experts (MoE)
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="p-4 bg-purple-50 rounded-lg mb-4">
                    <h5 className="font-semibold text-purple-900 mb-2">Sparse Activation Concept</h5>
                    <p className="text-sm text-purple-800 mb-3">
                      Instead of using all parameters for every token, MoE routes each token to a subset
                      of &quot;expert&quot; networks. This allows massive parameter counts with constant compute.
                    </p>
                    <div className="bg-white p-3 rounded text-xs font-mono text-purple-800">
                      y = Σ G(x)_i · E_i(x)
                      <br />
                      where G(x) is gating function, E_i are expert networks
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 border border-gray-200 rounded">
                      <h6 className="font-semibold text-gray-900 text-sm mb-2">Routing Mechanism</h6>
                      <div className="space-y-1 text-xs text-gray-700">
                        <div>1. <strong>Gating Network:</strong> Decides which experts to use for each token</div>
                        <div>2. <strong>Expert Selection:</strong> Top-k experts chosen based on gating scores</div>
                        <div>3. <strong>Load Balancing:</strong> Ensures even distribution across experts</div>
                        <div>4. <strong>Sparse Computation:</strong> Only selected experts compute outputs</div>
                      </div>
                    </div>

                    <div className="p-3 border border-gray-200 rounded">
                      <h6 className="font-semibold text-gray-900 text-sm mb-2">Training Considerations</h6>
                      <div className="space-y-1 text-xs text-gray-700">
                        <div>• <strong>Load Balancing Loss:</strong> Prevents expert collapse</div>
                        <div>• <strong>Capacity Factor:</strong> Controls expert utilization</div>
                        <div>• <strong>Expert Specialization:</strong> Different experts learn different patterns</div>
                        <div>• <strong>Communication Cost:</strong> Expert placement across devices</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h6 className="font-semibold text-green-900 text-sm mb-2">Benefits</h6>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• Massive parameter scaling</li>
                      <li>• Constant compute per token</li>
                      <li>• Expert specialization</li>
                      <li>• Better parameter efficiency</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <h6 className="font-semibold text-red-900 text-sm mb-2">Challenges</h6>
                    <ul className="text-xs text-red-800 space-y-1">
                      <li>• Complex training dynamics</li>
                      <li>• Load balancing difficulties</li>
                      <li>• Memory overhead</li>
                      <li>• Communication bottlenecks</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h6 className="font-semibold text-blue-900 text-sm mb-2">Real Examples</h6>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div><strong>Mistral 8x7B:</strong> 8 experts, 2 active</div>
                      <div><strong>Switch Transformer:</strong> 2048 experts</div>
                      <div><strong>PaLM-62B:</strong> 64 experts, 2 active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activation Functions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 text-orange-600" size={20} />
                Activation Functions: SwiGLU vs GELU
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h5 className="font-semibold text-orange-900 mb-3">SwiGLU</h5>
                  <p className="text-sm text-orange-800 mb-3">
                    Gated Linear Unit with Swish activation. Combines gating mechanism with
                    smooth non-linearity for better gradient flow and representation learning.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="bg-white p-2 rounded text-xs font-mono text-orange-800">
                      SwiGLU(x) = Swish(xW + b) ⊙ (xV + c)
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-orange-800">
                      Swish(x) = x · sigmoid(βx)
                    </div>
                    <div className="text-xs text-orange-700 mt-1">⊙ denotes element-wise multiplication</div>
                  </div>

                  <div className="space-y-2 text-xs text-orange-800">
                    <div><strong>Key Features:</strong></div>
                    <ul className="space-y-1 ml-3">
                      <li>• Gating mechanism for selective information flow</li>
                      <li>• Smooth activation with better gradients</li>
                      <li>• Used in LLaMA, Mistral models</li>
                      <li>• Higher parameter count but better performance</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-3">GELU</h5>
                  <p className="text-sm text-blue-800 mb-3">
                    Gaussian Error Linear Unit provides smooth, probabilistic activation.
                    Widely adopted in transformers for its theoretical foundations and performance.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="bg-white p-2 rounded text-xs font-mono text-blue-800">
                      GELU(x) = x · Φ(x)
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-blue-800">
                      ≈ x · sigmoid(1.702x)
                    </div>
                    <div className="text-xs text-blue-700 mt-1">Φ(x) is standard Gaussian CDF</div>
                  </div>

                  <div className="space-y-2 text-xs text-blue-800">
                    <div><strong>Key Features:</strong></div>
                    <ul className="space-y-1 ml-3">
                      <li>• Smooth, probabilistic activation</li>
                      <li>• Theoretical motivation from dropout</li>
                      <li>• Used in BERT, GPT, T5</li>
                      <li>• Good balance of performance and efficiency</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">Activation Function Comparison</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Function</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Smoothness</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Gating</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Parameters</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 font-medium">ReLU</td>
                        <td className="py-2 px-3">❌ Sharp</td>
                        <td className="py-2 px-3">❌ No</td>
                        <td className="py-2 px-3">✅ Standard</td>
                        <td className="py-2 px-3">⭐⭐⭐</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 font-medium">GELU</td>
                        <td className="py-2 px-3">✅ Smooth</td>
                        <td className="py-2 px-3">❌ No</td>
                        <td className="py-2 px-3">✅ Standard</td>
                        <td className="py-2 px-3">⭐⭐⭐⭐</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-3 font-medium">SwiGLU</td>
                        <td className="py-2 px-3">✅ Smooth</td>
                        <td className="py-2 px-3">✅ Yes</td>
                        <td className="py-2 px-3">⚠️ Higher</td>
                        <td className="py-2 px-3">⭐⭐⭐⭐⭐</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Normalization Techniques */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2 text-teal-600" size={20} />
                Normalization: LayerNorm vs RMSNorm
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Layer Normalization</h5>
                  <p className="text-sm text-gray-700 mb-3">
                    Standard normalization technique that subtracts mean and divides by standard deviation
                    across the feature dimension. Includes learnable scale and shift parameters.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="bg-white p-2 rounded text-xs font-mono text-gray-800">
                      μ = (1/d) Σ xᵢ
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-gray-800">
                      σ² = (1/d) Σ (xᵢ - μ)²
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-gray-800">
                      LayerNorm(x) = γ(x-μ)/σ + β
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-700">
                    <div><strong>Parameters:</strong> γ (scale), β (shift)</div>
                    <div><strong>Computation:</strong> Mean, variance, normalization</div>
                    <div><strong>Usage:</strong> BERT, GPT, T5, most transformers</div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 rounded-lg">
                  <h5 className="font-semibold text-teal-900 mb-3">RMS Normalization</h5>
                  <p className="text-sm text-teal-800 mb-3">
                    Simplified normalization that only uses root mean square for scaling,
                    eliminating mean subtraction for improved efficiency and stability.
                  </p>

                  <div className="space-y-2 mb-3">
                    <div className="bg-white p-2 rounded text-xs font-mono text-teal-800">
                      RMS = √[(1/d) Σ xᵢ²]
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-teal-800">
                      RMSNorm(x) = γ(x/RMS)
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-teal-800">
                    <div><strong>Parameters:</strong> γ (scale only)</div>
                    <div><strong>Computation:</strong> RMS only, no mean</div>
                    <div><strong>Usage:</strong> LLaMA, Mistral, modern LLMs</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">Why RMSNorm is Gaining Adoption</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
                  <div>
                    <strong>Computational Efficiency:</strong>
                    <p className="text-xs mt-1">Eliminates mean computation, reducing FLOPs and memory access</p>
                  </div>
                  <div>
                    <strong>Training Stability:</strong>
                    <p className="text-xs mt-1">Often provides better gradient flow and more stable training</p>
                  </div>
                  <div>
                    <strong>Parameter Efficiency:</strong>
                    <p className="text-xs mt-1">Half the learnable parameters compared to LayerNorm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter Efficiency & Scaling Laws */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-600" size={20} />
                Parameter Efficiency & Scaling Laws
              </h4>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-3">Scaling Laws</h5>
                    <p className="text-sm text-blue-800 mb-3">
                      Empirical relationships between model performance and key factors like
                      parameters, data, and compute budget.
                    </p>

                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="bg-white p-2 rounded">
                        <strong>Chinchilla Law:</strong> For optimal performance, scale parameters and training data proportionally
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Parameter Efficiency:</strong> Performance per parameter improves with architectural innovations
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Compute Optimal:</strong> Balance model size and training duration for fixed compute
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h5 className="font-semibold text-yellow-900 mb-3">Efficiency Techniques</h5>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <div className="bg-white p-2 rounded">
                        <strong>Mixture of Experts:</strong> Sparse activation for scaling without proportional compute
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Group Query Attention:</strong> Share key/value heads across query heads
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Sliding Window:</strong> Local attention patterns for long sequences
                      </div>
                      <div className="bg-white p-2 rounded">
                        <strong>Architecture Optimization:</strong> RMSNorm, SwiGLU, RoPE improvements
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Modern Model Efficiency Comparison</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Model Family</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Key Innovations</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Efficiency Gains</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Trade-offs</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium">LLaMA</td>
                          <td className="py-2 px-3">RMSNorm, SwiGLU, RoPE</td>
                          <td className="py-2 px-3">Better performance/parameter</td>
                          <td className="py-2 px-3">Higher compute per layer</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium">Mistral</td>
                          <td className="py-2 px-3">Sliding window, MoE</td>
                          <td className="py-2 px-3">Long context, sparse compute</td>
                          <td className="py-2 px-3">Complex routing, memory</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium">Gemma</td>
                          <td className="py-2 px-3">Multi-query attention</td>
                          <td className="py-2 px-3">Reduced KV cache</td>
                          <td className="py-2 px-3">Some quality degradation</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium">Phi</td>
                          <td className="py-2 px-3">High-quality data</td>
                          <td className="py-2 px-3">Strong small models</td>
                          <td className="py-2 px-3">Domain-specific training</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="mr-2 text-yellow-600" size={20} />
                Implementation Best Practices
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Architecture Selection Guidelines</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckSquare size={16} className="text-green-500 mr-2 mt-0.5" />
                      Use RoPE for better context length extrapolation
                    </li>
                    <li className="flex items-start">
                      <CheckSquare size={16} className="text-green-500 mr-2 mt-0.5" />
                      Consider RMSNorm for improved training efficiency
                    </li>
                    <li className="flex items-start">
                      <CheckSquare size={16} className="text-green-500 mr-2 mt-0.5" />
                      SwiGLU for better performance if compute allows
                    </li>
                    <li className="flex items-start">
                      <CheckSquare size={16} className="text-green-500 mr-2 mt-0.5" />
                      MoE for scaling parameters without proportional compute
                    </li>
                    <li className="flex items-start">
                      <CheckSquare size={16} className="text-green-500 mr-2 mt-0.5" />
                      Group/Multi-Query Attention for inference efficiency
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">Performance Optimization</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <Target size={16} className="text-blue-500 mr-2 mt-0.5" />
                      Profile attention patterns for sparse attention opportunities
                    </li>
                    <li className="flex items-start">
                      <Target size={16} className="text-blue-500 mr-2 mt-0.5" />
                      Monitor expert utilization in MoE models
                    </li>
                    <li className="flex items-start">
                      <Target size={16} className="text-blue-500 mr-2 mt-0.5" />
                      Optimize memory layout for specific hardware
                    </li>
                    <li className="flex items-start">
                      <Target size={16} className="text-blue-500 mr-2 mt-0.5" />
                      Use gradient checkpointing for large models
                    </li>
                    <li className="flex items-start">
                      <Target size={16} className="text-blue-500 mr-2 mt-0.5" />
                      Consider quantization-aware training early
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h5 className="font-semibold text-purple-900 mb-2">Future Directions</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-800">
                  <div>
                    <strong>Architecture Innovation:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• State space models (Mamba)</li>
                      <li>• Mixture of Depths</li>
                      <li>• Retrieval-augmented architectures</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Efficiency Research:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Linear attention variants</li>
                      <li>• Dynamic expert selection</li>
                      <li>• Adaptive computation time</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Scaling Frontiers:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Trillion-parameter models</li>
                      <li>• Multimodal architectures</li>
                      <li>• Specialized accelerators</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimulationLayout>
  )
}