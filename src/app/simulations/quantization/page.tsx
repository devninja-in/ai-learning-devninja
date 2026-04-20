'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { ChevronRight, Activity, Target, Zap, Database, Monitor, ArrowLeftRight, Info, TrendingDown, Gauge, BarChart3, BookOpen, Cpu, HardDrive, Settings, Users, Globe } from 'lucide-react'

interface WeightData {
  original: number[]
  fp16: number[]
  int8: number[]
  int4: number[]
}

interface QuantizationMethod {
  id: string
  name: string
  description: string
  pros: string[]
  cons: string[]
  useCase: string
}

interface ModelMetrics {
  size: number // in GB
  accuracy: number // percentage
  speed: number // tokens/sec
  memory: number // GB
}

const QUANTIZATION_METHODS: QuantizationMethod[] = [
  {
    id: 'gptq',
    name: 'GPTQ',
    description: 'Post-training quantization using optimal brain quantization',
    pros: ['Minimal accuracy loss', 'Fast inference', 'Hardware optimized'],
    cons: ['Slow quantization process', 'Requires calibration data'],
    useCase: 'Production deployment with quality priority'
  },
  {
    id: 'awq',
    name: 'AWQ',
    description: 'Activation-aware Weight Quantization',
    pros: ['Preserves important weights', 'Better accuracy than naive quantization'],
    cons: ['Complex implementation', 'Method-specific optimizations needed'],
    useCase: 'Research and experimentation'
  },
  {
    id: 'gguf',
    name: 'GGUF',
    description: 'GPT-Generated Unified Format for efficient storage',
    pros: ['Cross-platform compatibility', 'Efficient storage', 'Easy deployment'],
    cons: ['Limited precision options', 'Format-specific tooling required'],
    useCase: 'Local deployment and edge devices'
  },
  {
    id: 'bitsandbytes',
    name: 'BitsAndBytes',
    description: '8-bit and 4-bit quantization with dynamic scaling',
    pros: ['Memory efficient', 'Easy integration', 'Dynamic precision'],
    cons: ['CUDA dependency', 'Potential accuracy degradation'],
    useCase: 'Memory-constrained training and inference'
  }
]

const MODEL_CONFIGS = {
  'llama-7b': {
    name: 'Llama 7B',
    fp32: { size: 28, accuracy: 85, speed: 45, memory: 28 },
    fp16: { size: 14, accuracy: 84.8, speed: 68, memory: 14 },
    int8: { size: 7, accuracy: 84.2, speed: 95, memory: 8.5 },
    int4: { size: 3.5, accuracy: 82.5, speed: 142, memory: 5.2 }
  },
  'mistral-7b': {
    name: 'Mistral 7B',
    fp32: { size: 28, accuracy: 87, speed: 52, memory: 28 },
    fp16: { size: 14, accuracy: 86.9, speed: 78, memory: 14 },
    int8: { size: 7, accuracy: 86.1, speed: 108, memory: 8.5 },
    int4: { size: 3.5, accuracy: 84.2, speed: 165, memory: 5.2 }
  }
}

export default function QuantizationSimulation() {
  const [activeTab, setActiveTab] = useState<'playground' | 'compare' | 'keyconcepts'>('playground')
  const [selectedPrecision, setSelectedPrecision] = useState<'fp32' | 'fp16' | 'int8' | 'int4'>('fp32')
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODEL_CONFIGS>('llama-7b')
  const [selectedMethod, setSelectedMethod] = useState('gptq')
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedConcept, setSelectedConcept] = useState('fundamentals')

  const weightDistributionRef = useRef<SVGSVGElement>(null)
  const performanceTriangleRef = useRef<SVGSVGElement>(null)
  const crossPhaseRef = useRef<SVGSVGElement>(null)

  // Generate realistic weight distributions
  const weightData = useMemo((): WeightData => {
    const generateWeights = (precision: string, count = 1000) => {
      const weights = []
      for (let i = 0; i < count; i++) {
        let weight = d3.randomNormal(0, 0.1)()

        // Apply precision-specific quantization
        switch (precision) {
          case 'fp32':
            weight = Math.round(weight * 1e7) / 1e7
            break
          case 'fp16':
            weight = Math.round(weight * 1e4) / 1e4
            break
          case 'int8':
            weight = Math.round(weight * 127) / 127
            break
          case 'int4':
            weight = Math.round(weight * 7) / 7
            break
        }

        weights.push(Math.max(-1, Math.min(1, weight)))
      }
      return weights
    }

    return {
      original: generateWeights('fp32'),
      fp16: generateWeights('fp16'),
      int8: generateWeights('int8'),
      int4: generateWeights('int4')
    }
  }, [])

  // Weight distribution visualization
  useEffect(() => {
    if (!weightDistributionRef.current) return

    const svg = d3.select(weightDistributionRef.current)
    svg.selectAll('*').remove()

    const width = 500
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }

    const weights = weightData[selectedPrecision === 'fp32' ? 'original' : selectedPrecision]

    // Create histogram
    const bins = d3.histogram()
      .domain([-1, 1])
      .thresholds(50)(weights)

    const xScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length) || 0])
      .range([height - margin.bottom, margin.top])

    const colorScale = d3.scaleOrdinal<string, string>()
      .domain(['fp32', 'fp16', 'int8', 'int4'])
      .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444'])

    // Add bars
    svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.x0 || 0))
      .attr('y', height - margin.bottom)
      .attr('width', d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1))
      .attr('height', 0)
      .attr('fill', colorScale(selectedPrecision))
      .attr('opacity', 0.7)
      .transition()
      .duration(800)
      .delay((d, i) => i * 10)
      .attr('y', d => yScale(d.length))
      .attr('height', d => height - margin.bottom - yScale(d.length))

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
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Weight Values')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Frequency')

  }, [weightData, selectedPrecision])

  // Performance triangle visualization
  useEffect(() => {
    if (!performanceTriangleRef.current) return

    const svg = d3.select(performanceTriangleRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 350
    const centerX = width / 2
    const centerY = height / 2
    const radius = 120

    const modelData = MODEL_CONFIGS[selectedModel]
    const currentMetrics = modelData[selectedPrecision]

    // Triangle points (Quality, Speed, Size)
    const points = [
      { label: 'Quality', x: centerX, y: centerY - radius, value: currentMetrics.accuracy, max: 100 },
      { label: 'Speed', x: centerX + radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6), value: currentMetrics.speed, max: 200 },
      { label: 'Size', x: centerX - radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6), value: modelData.fp32.size - currentMetrics.size, max: modelData.fp32.size }
    ]

    // Draw triangle
    const line = d3.line<typeof points[0]>()
      .x(d => d.x)
      .y(d => d.y)

    svg.append('path')
      .datum([...points, points[0]])
      .attr('d', line)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    // Draw performance area
    const performancePoints = points.map(p => ({
      x: centerX + (p.x - centerX) * (p.value / p.max),
      y: centerY + (p.y - centerY) * (p.value / p.max)
    }))

    svg.append('path')
      .datum([...performancePoints, performancePoints[0]])
      .attr('d', line as any)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.2)

    // Add points and labels
    points.forEach((point, i) => {
      svg.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 6)
        .attr('fill', '#6b7280')

      svg.append('text')
        .attr('x', point.x)
        .attr('y', point.y - 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(point.label)

      svg.append('text')
        .attr('x', point.x)
        .attr('y', point.y + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(`${point.value.toFixed(1)}${i === 0 ? '%' : i === 1 ? ' t/s' : ' GB'}`)
    })

  }, [selectedModel, selectedPrecision])

  // Cross-phase impact visualization
  useEffect(() => {
    if (!crossPhaseRef.current) return

    const svg = d3.select(crossPhaseRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 200
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }

    const phases = [
      { name: 'Training', impact: selectedPrecision === 'fp32' ? 100 : selectedPrecision === 'fp16' ? 95 : selectedPrecision === 'int8' ? 70 : 40 },
      { name: 'Storage', impact: selectedPrecision === 'fp32' ? 20 : selectedPrecision === 'fp16' ? 50 : selectedPrecision === 'int8' ? 75 : 95 },
      { name: 'Inference', impact: selectedPrecision === 'fp32' ? 30 : selectedPrecision === 'fp16' ? 60 : selectedPrecision === 'int8' ? 80 : 95 },
      { name: 'Edge Deploy', impact: selectedPrecision === 'fp32' ? 10 : selectedPrecision === 'fp16' ? 40 : selectedPrecision === 'int8' ? 85 : 100 }
    ]

    const xScale = d3.scaleBand()
      .domain(phases.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.2)

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top])

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, 100])

    // Add bars
    svg.selectAll('rect')
      .data(phases)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.name) || 0)
      .attr('y', height - margin.bottom)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colorScale(d.impact))
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.impact))
      .attr('height', d => height - margin.bottom - yScale(d.impact))

    // Add labels
    phases.forEach(phase => {
      svg.append('text')
        .attr('x', (xScale(phase.name) || 0) + xScale.bandwidth() / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(phase.name)

      svg.append('text')
        .attr('x', (xScale(phase.name) || 0) + xScale.bandwidth() / 2)
        .attr('y', yScale(phase.impact) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'white')
        .text(`${phase.impact}%`)
    })

  }, [selectedPrecision])

  const handleAnimate = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const learningObjectives = [
    "Understand the trade-offs between model quality, size, and inference speed",
    "Explore different quantization methods and their practical applications",
    "Visualize how precision affects weight distributions and model performance",
    "See the cross-phase impact of quantization decisions on the AI pipeline"
  ]

  return (
    <SimulationLayout
      title="Model Quantization Laboratory"
      description="Explore quality vs size trade-offs and optimization techniques for production AI"
      difficulty="Advanced"
      category="Model Optimization"
      onPlay={handleAnimate}
      onReset={() => {
        setActiveTab('playground')
        setSelectedPrecision('fp32')
        setSelectedModel('llama-7b')
        setSelectedMethod('gptq')
        setSelectedConcept('fundamentals')
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'playground', name: 'Precision Playground', icon: Activity },
              { id: 'compare', name: 'Method Comparison', icon: ArrowLeftRight },
              { id: 'keyconcepts', name: 'Key Concepts', icon: BookOpen }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Precision Playground Tab */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="mr-2 text-blue-600" size={20} />
                Model Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Architecture
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as keyof typeof MODEL_CONFIGS)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
                      <option key={key} value={key}>{config.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precision Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['fp32', 'fp16', 'int8', 'int4'] as const).map((precision) => (
                      <button
                        key={precision}
                        onClick={() => setSelectedPrecision(precision)}
                        className={`p-2 text-sm font-medium rounded-lg transition-colors ${
                          selectedPrecision === precision
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {precision.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Gauge className="mr-2 text-green-600" size={20} />
                Performance Metrics
              </h3>

              <div className="space-y-4">
                {Object.entries(MODEL_CONFIGS[selectedModel][selectedPrecision]).map(([metric, value]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {metric === 'speed' ? 'Inference Speed' : metric}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {typeof value === 'number' ?
                        `${value}${metric === 'size' || metric === 'memory' ? ' GB' : metric === 'accuracy' ? '%' : metric === 'speed' ? ' t/s' : ''}`
                        : value
                      }
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-gray-600">
                  <div className="mb-1">
                    <strong>Memory Savings:</strong> {((MODEL_CONFIGS[selectedModel].fp32.size - MODEL_CONFIGS[selectedModel][selectedPrecision].size) / MODEL_CONFIGS[selectedModel].fp32.size * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Speed Improvement:</strong> {((MODEL_CONFIGS[selectedModel][selectedPrecision].speed / MODEL_CONFIGS[selectedModel].fp32.speed - 1) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Weight Distribution Analysis
              </h3>
              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={weightDistributionRef}
                  width="500"
                  height="300"
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Histogram showing how {selectedPrecision.toUpperCase()} quantization affects weight value distribution.
                  Lower precision results in fewer unique values and stepped distributions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Triangle
                </h3>
                <div className="border rounded-lg bg-gray-50 overflow-hidden">
                  <svg
                    ref={performanceTriangleRef}
                    width="400"
                    height="350"
                    className="w-full h-auto"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Larger area indicates better overall performance across all metrics.</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cross-Phase Impact
                </h3>
                <div className="border rounded-lg bg-gray-50 overflow-hidden">
                  <svg
                    ref={crossPhaseRef}
                    width="600"
                    height="200"
                    className="w-full h-auto"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Shows how quantization affects different phases of the AI pipeline.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Method Comparison Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUANTIZATION_METHODS.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-lg shadow-lg p-6 border-2 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-blue-500 shadow-xl'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{method.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{method.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-green-700 mb-1">PROS</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {method.pros.slice(0, 2).map((pro, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-1">✓</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-red-700 mb-1">CONS</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {method.cons.slice(0, 1).map((con, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-1">✗</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    <strong>Best for:</strong> {method.useCase}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Method: {QUANTIZATION_METHODS.find(m => m.id === selectedMethod)?.name}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Detailed Analysis</h4>
                <div className="space-y-3">
                  {QUANTIZATION_METHODS.find(m => m.id === selectedMethod)?.pros.map((pro, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span>{pro}</span>
                    </div>
                  ))}
                  {QUANTIZATION_METHODS.find(m => m.id === selectedMethod)?.cons.map((con, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <span className="text-red-500 mr-2 mt-0.5">✗</span>
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Implementation Guide</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono">
                  {selectedMethod === 'gptq' && (
                    <pre>{`# GPTQ Quantization
from auto_gptq import AutoGPTQForCausalLM

model = AutoGPTQForCausalLM.from_pretrained(
    "llama-7b",
    quantize_config=BaseQuantizeConfig(
        bits=4,
        group_size=128,
    )
)`}</pre>
                  )}
                  {selectedMethod === 'awq' && (
                    <pre>{`# AWQ Quantization
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained(
    "llama-7b"
)
model.quantize(tokenizer, quant_config={
    "zero_point": True, "q_group_size": 128
})`}</pre>
                  )}
                  {selectedMethod === 'gguf' && (
                    <pre>{`# GGUF Conversion
python convert.py --outtype f16 llama-7b/
./quantize llama-7b.gguf llama-7b-q4_0.gguf q4_0

# Load with llama.cpp
./main -m llama-7b-q4_0.gguf -p "Hello"`}</pre>
                  )}
                  {selectedMethod === 'bitsandbytes' && (
                    <pre>{`# BitsAndBytes Integration
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    "llama-7b", quantization_config=bnb_config
)`}</pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Concepts Tab */}
      {activeTab === 'keyconcepts' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Concept Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quantization Concepts</h3>
              <nav className="space-y-2">
                {[
                  { id: 'fundamentals', name: 'Quantization Fundamentals', icon: Database },
                  { id: 'algorithms', name: 'Advanced Algorithms', icon: Cpu },
                  { id: 'formats', name: 'Model Formats & Storage', icon: HardDrive },
                  { id: 'optimization', name: 'Performance Optimization', icon: Zap },
                  { id: 'production', name: 'Production Deployment', icon: Settings },
                  { id: 'ecosystem', name: 'Tools & Ecosystem', icon: Users }
                ].map(({ id, name, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedConcept(id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                      selectedConcept === id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg">
              {(() => {
                const conceptsData = {
                  fundamentals: {
                    title: 'Quantization Fundamentals',
                    description: 'Core principles of model quantization and precision reduction',
                    sections: [
                      {
                        title: 'What is Quantization?',
                        content: `Quantization reduces the precision of neural network weights and activations, converting from high-precision formats (like 32-bit floats) to lower-precision representations (8-bit integers, 4-bit integers).

Key Benefits:
• **Model Size Reduction**: Up to 87.5% smaller with 4-bit quantization
• **Inference Speed**: 2-4x faster execution on optimized hardware
• **Memory Efficiency**: Lower RAM requirements for deployment
• **Edge Deployment**: Enables AI on resource-constrained devices`
                      },
                      {
                        title: 'Precision vs Accuracy Trade-offs',
                        content: `The fundamental challenge of quantization is maintaining model accuracy while reducing numerical precision.

**Precision Types**:
• **FP32**: Full precision (4 bytes per weight)
• **FP16**: Half precision (2 bytes per weight)
• **INT8**: 8-bit integers (1 byte per weight)
• **INT4**: 4-bit integers (0.5 bytes per weight)

**Quality Impact**:
• FP32 → FP16: <1% accuracy loss
• FP32 → INT8: 1-3% accuracy loss
• FP32 → INT4: 3-8% accuracy loss`
                      },
                      {
                        title: 'Post-Training vs Quantization-Aware Training',
                        content: `**Post-Training Quantization (PTQ)**:
• Applied to already-trained models
• Faster implementation, no retraining required
• May have higher accuracy degradation
• Good for quick deployment and experimentation

**Quantization-Aware Training (QAT)**:
• Simulates quantization during training
• Better preserves model accuracy
• Requires access to training data and pipeline
• Longer development cycle but superior results`
                      }
                    ]
                  },
                  algorithms: {
                    title: 'Advanced Quantization Algorithms',
                    description: 'State-of-the-art methods for optimal model compression',
                    sections: [
                      {
                        title: 'GPTQ: Optimal Brain Quantization',
                        content: `GPTQ uses the Hessian matrix to find optimal quantization parameters, minimizing reconstruction error.

**Algorithm Overview**:
1. Compute second-order Hessian information
2. Apply optimal brain damage principles
3. Quantize weights layer-by-layer
4. Update remaining weights to compensate

**Implementation**:
\`\`\`python
from auto_gptq import AutoGPTQForCausalLM

model = AutoGPTQForCausalLM.from_pretrained(
    "llama-7b",
    quantize_config=BaseQuantizeConfig(
        bits=4,
        group_size=128,
        damp_percent=0.1
    )
)
\`\`\`

**Best For**: Production deployments requiring minimal quality loss`
                      },
                      {
                        title: 'AWQ: Activation-Aware Weight Quantization',
                        content: `AWQ preserves critical weights by analyzing activation patterns and protecting salient weights from aggressive quantization.

**Key Innovation**:
• Identifies "salient" weights using activation statistics
• Applies mixed precision: important weights get higher precision
• Uses outlier detection to preserve critical parameters

**Advantages**:
• Better quality preservation than uniform quantization
• Particularly effective for attention mechanisms
• Good balance of compression and accuracy

**Implementation**:
\`\`\`python
from awq import AutoAWQForCausalLM

model = AutoAWQForCausalLM.from_pretrained("llama-7b")
model.quantize(tokenizer, quant_config={
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4
})
\`\`\`

**Best For**: Research and high-quality quantization needs`
                      },
                      {
                        title: 'Dynamic vs Static Quantization',
                        content: `**Static Quantization**:
• Pre-computed quantization parameters
• Requires calibration dataset
• Faster inference (no runtime computation)
• Better for production deployment

**Dynamic Quantization**:
• Computes quantization parameters at runtime
• No calibration data required
• Slight inference overhead
• More flexible but slower

**Calibration Process**:
1. Run representative data through model
2. Collect activation statistics (min/max, distributions)
3. Compute optimal scale and zero-point parameters
4. Apply static quantization with computed parameters`
                      }
                    ]
                  },
                  formats: {
                    title: 'Model Formats & Storage',
                    description: 'Optimized storage formats for quantized models',
                    sections: [
                      {
                        title: 'GGUF: GPT-Generated Unified Format',
                        content: `GGUF is a binary format optimized for efficient storage and loading of quantized language models.

**Format Features**:
• Cross-platform compatibility (CPU, GPU, Mobile)
• Efficient memory mapping for fast loading
• Built-in metadata and configuration
• Supports various quantization schemes

**Conversion Process**:
\`\`\`bash
# Convert to FP16
python convert.py --outtype f16 llama-7b/

# Quantize to 4-bit
./quantize llama-7b.gguf llama-7b-q4_0.gguf q4_0

# Run inference
./main -m llama-7b-q4_0.gguf -p "Hello, world!"
\`\`\`

**Best For**: Local deployment, edge devices, cross-platform compatibility`
                      },
                      {
                        title: 'GGML vs GGUF Comparison',
                        content: `**GGML (Legacy)**:
• Original format for llama.cpp
• Limited metadata support
• Single-file format
• Being phased out

**GGUF (Current Standard)**:
• Improved metadata handling
• Better extensibility
• Backward compatibility with GGML
• Active development and support

**Migration Path**:
• Existing GGML models can be converted to GGUF
• New projects should use GGUF exclusively
• Tools automatically detect format version`
                      },
                      {
                        title: 'Storage Optimization Strategies',
                        content: `**Memory Mapping**:
• Load model directly from disk without full RAM copy
• Enables running larger models than available RAM
• OS handles caching and virtual memory

**Compression Techniques**:
• GZIP compression for further size reduction
• Delta compression for model updates
• Sparse storage for pruned models

**Distribution Strategies**:
• Model sharding for extremely large models
• Progressive loading for faster startup
• CDN optimization for global distribution

**Format Selection Guide**:
• GGUF: Local deployment, llama.cpp ecosystem
• Safetensors: HuggingFace ecosystem, safety
• TensorRT: NVIDIA GPU optimization
• ONNX: Cross-framework compatibility`
                      }
                    ]
                  },
                  optimization: {
                    title: 'Performance Optimization',
                    description: 'Hardware-specific optimizations and acceleration techniques',
                    sections: [
                      {
                        title: 'Hardware-Specific Optimizations',
                        content: `**CPU Optimizations**:
• SIMD instructions (AVX2, AVX-512) for parallel processing
• Cache-friendly memory layouts
• Loop unrolling and vectorization

**GPU Optimizations**:
• Tensor Core utilization for INT8/INT4 operations
• Memory coalescing for efficient bandwidth usage
• Kernel fusion to reduce memory transfers

**Edge Device Optimizations**:
• ARM NEON instructions for mobile CPUs
• Neural Processing Unit (NPU) acceleration
• Power-efficient quantization schemes

**Optimization Checklist**:
1. Profile quantized model performance
2. Choose optimal batch sizes for hardware
3. Implement hardware-specific kernels
4. Optimize memory layout for target device`
                      },
                      {
                        title: 'BitsAndBytes: Dynamic Precision',
                        content: `BitsAndBytes provides dynamic 8-bit and 4-bit quantization with CUDA acceleration.

**Key Features**:
• Dynamic quantization with outlier detection
• Seamless integration with PyTorch
• Mixed precision training and inference
• Memory-efficient optimizers (AdamW 8-bit)

**Implementation**:
\`\`\`python
from transformers import BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True
)

model = AutoModelForCausalLM.from_pretrained(
    "llama-7b",
    quantization_config=bnb_config,
    device_map="auto"
)
\`\`\`

**Best For**: Memory-constrained training, quick experimentation`
                      },
                      {
                        title: 'Benchmarking and Profiling',
                        content: `**Performance Metrics**:
• Throughput (tokens/second)
• Latency (time to first token)
• Memory usage (peak and sustained)
• Energy consumption (especially for edge)

**Profiling Tools**:
• NVIDIA Nsight for GPU profiling
• Intel VTune for CPU optimization
• PyTorch Profiler for framework-level analysis
• Custom benchmarks for end-to-end performance

**Optimization Workflow**:
1. Establish baseline performance (FP32/FP16)
2. Apply quantization and measure impact
3. Profile bottlenecks and optimize
4. Validate quality preservation
5. Deploy with monitoring

**Common Bottlenecks**:
• Memory bandwidth limitations
• Quantization/dequantization overhead
• Suboptimal batch sizes
• Inefficient data loading`
                      }
                    ]
                  },
                  production: {
                    title: 'Production Deployment',
                    description: 'Best practices for deploying quantized models at scale',
                    sections: [
                      {
                        title: 'Deployment Strategies',
                        content: `**Cloud Deployment**:
• Auto-scaling based on request volume
• Load balancing across quantized model instances
• A/B testing between quantization levels
• Monitoring quality and performance metrics

**Edge Deployment**:
• Model validation on target hardware
• Over-the-air update mechanisms
• Graceful degradation for resource constraints
• Local caching and prefetching

**Hybrid Deployment**:
• Edge devices for low-latency inference
• Cloud fallback for complex queries
• Progressive model downloading
• Quality-based routing decisions`
                      },
                      {
                        title: 'Quality Assurance',
                        content: `**Validation Pipeline**:
1. Accuracy benchmarking on representative datasets
2. Regression testing for critical use cases
3. Performance validation under load
4. Error analysis and quality monitoring

**Quality Gates**:
• Minimum accuracy thresholds
• Performance regression limits
• Memory usage constraints
• Latency requirements

**Monitoring in Production**:
• Real-time quality metrics
• Performance dashboards
• Error rate tracking
• User experience monitoring

**Rollback Strategies**:
• Blue-green deployment for safe rollbacks
• Canary releases with gradual traffic increase
• Automated quality checks with rollback triggers
• Version management and model registry`
                      },
                      {
                        title: 'Integration Patterns',
                        content: `**API Integration**:
\`\`\`python
# FastAPI with quantized model
from fastapi import FastAPI
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI()

# Load quantized model
model = AutoModelForCausalLM.from_pretrained(
    "llama-7b-4bit",
    device_map="auto"
)

@app.post("/generate")
async def generate(prompt: str):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=100)
    return {"response": tokenizer.decode(outputs[0])}
\`\`\`

**Microservices Pattern**:
• Dedicated quantization service
• Model registry and version management
• Health checks and circuit breakers
• Distributed caching for model artifacts

**Container Deployment**:
• Docker images with optimized runtimes
• Kubernetes operators for model serving
• Resource limits and requests
• GPU sharing and isolation`
                      }
                    ]
                  },
                  ecosystem: {
                    title: 'Tools & Ecosystem',
                    description: 'Comprehensive overview of quantization tools and frameworks',
                    sections: [
                      {
                        title: 'Framework Comparison',
                        content: `**HuggingFace Optimum**:
• Unified interface for multiple quantization backends
• Integration with Transformers library
• Support for ONNX, TensorRT, OpenVINO
• Easy deployment and benchmarking

**Intel Neural Compressor**:
• Advanced post-training quantization
• Extensive hardware support
• Automatic accuracy-aware tuning
• Production-ready optimizations

**NVIDIA TensorRT**:
• GPU-optimized quantization
• Layer fusion and kernel optimization
• FP16 and INT8 support
• Seamless integration with PyTorch`
                      },
                      {
                        title: 'Model Hub Integration',
                        content: `**HuggingFace Hub**:
• Pre-quantized model variants
• Community-contributed optimizations
• Version tracking and metadata
• Easy download and deployment

**Model Registry Pattern**:
\`\`\`python
# Load pre-quantized model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-7B-Chat-GPTQ",
    device_map="auto"
)

# Local model registry
from mlflow import MlflowClient

client = MlflowClient()
model_version = client.download_artifacts(
    run_id="quantized_llama_v1.2",
    path="model"
)
\`\`\`

**Best Practices**:
• Version all quantized variants
• Include quantization metadata
• Provide performance benchmarks
• Document hardware requirements`
                      },
                      {
                        title: 'Community Resources',
                        content: `**Open Source Tools**:
• **AutoGPTQ**: GPTQ quantization implementation
• **llama.cpp**: Efficient CPU inference
• **BitsAndBytes**: Dynamic quantization library
• **GGML**: Low-level machine learning primitives

**Research Papers**:
• "GPTQ: Accurate Post-Training Quantization for GPT"
• "AWQ: Activation-aware Weight Quantization"
• "LLM.int8(): 8-bit Matrix Multiplication for Transformers"
• "QLoRA: Efficient Finetuning of Quantized LLMs"

**Community Contributions**:
• TheBloke's quantized model collection
• Community benchmarks and comparisons
• Hardware-specific optimization guides
• Best practice documentation

**Learning Resources**:
• Quantization workshops and tutorials
• Benchmark datasets and evaluation scripts
• Hardware-specific optimization guides
• Performance optimization case studies`
                      }
                    ]
                  }
                };

                const currentConcept = conceptsData[selectedConcept as keyof typeof conceptsData];

                return (
                  <div className="p-8">
                    <div className="border-b pb-6 mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentConcept.title}</h2>
                      <p className="text-gray-600">{currentConcept.description}</p>
                    </div>

                    <div className="space-y-8">
                      {currentConcept.sections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="prose max-w-none"
                        >
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
                          <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {section.content}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </SimulationLayout>
  )
}