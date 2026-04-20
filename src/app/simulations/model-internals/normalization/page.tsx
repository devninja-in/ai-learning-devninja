'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { BarChart, Activity, Settings, Zap, TrendingUp, Calculator } from 'lucide-react'

interface NormalizationData {
  input: number[]
  layernorm: {
    output: number[]
    mean: number
    variance: number
    gamma: number[]
    beta: number[]
    computeSteps: string[]
  }
  rmsnorm: {
    output: number[]
    rms: number
    gamma: number[]
    computeSteps: string[]
  }
}

interface ComputationStep {
  step: string
  layernorm: number
  rmsnorm: number
}

export default function NormalizationSimulation() {
  const [hiddenSize, setHiddenSize] = useState(8)
  const [inputVariance, setInputVariance] = useState(1.0)
  const [selectedNorm, setSelectedNorm] = useState<'layernorm' | 'rmsnorm' | 'both'>('both')
  const [epsilon, setEpsilon] = useState(1e-6)
  const [showComputations, setShowComputations] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const comparisonRef = useRef<SVGSVGElement>(null)

  const normalizationData = useMemo((): NormalizationData => {
    // Generate random input vector with specified variance
    const input = Array.from({ length: hiddenSize }, () =>
      (Math.random() - 0.5) * 2 * Math.sqrt(inputVariance)
    )

    // LayerNorm computation
    const mean = input.reduce((sum, x) => sum + x, 0) / hiddenSize
    const variance = input.reduce((sum, x) => sum + (x - mean) ** 2, 0) / hiddenSize
    const gamma_ln = Array.from({ length: hiddenSize }, () => 1.0) // Learnable scale
    const beta_ln = Array.from({ length: hiddenSize }, () => 0.1)  // Learnable shift

    const layernormOutput = input.map((x, i) =>
      gamma_ln[i] * ((x - mean) / Math.sqrt(variance + epsilon)) + beta_ln[i]
    )

    // RMSNorm computation
    const rms = Math.sqrt(input.reduce((sum, x) => sum + x ** 2, 0) / hiddenSize)
    const gamma_rms = Array.from({ length: hiddenSize }, () => 1.0) // Learnable scale

    const rmsnormOutput = input.map((x, i) =>
      gamma_rms[i] * (x / (rms + epsilon))
    )

    return {
      input,
      layernorm: {
        output: layernormOutput,
        mean,
        variance,
        gamma: gamma_ln,
        beta: beta_ln,
        computeSteps: [
          'μ = Σx_i / n',
          'σ² = Σ(x_i - μ)² / n',
          'x̂_i = (x_i - μ) / √(σ² + ε)',
          'y_i = γ_i * x̂_i + β_i'
        ]
      },
      rmsnorm: {
        output: rmsnormOutput,
        rms,
        gamma: gamma_rms,
        computeSteps: [
          'RMS = √(Σx_i² / n)',
          'x̂_i = x_i / (RMS + ε)',
          'y_i = γ_i * x̂_i'
        ]
      }
    }
  }, [hiddenSize, inputVariance, epsilon])

  const computationComparison = useMemo((): ComputationStep[] => {
    return [
      { step: 'Additions', layernorm: hiddenSize * 2 + hiddenSize, rmsnorm: 0 },
      { step: 'Multiplications', layernorm: hiddenSize * 3, rmsnorm: hiddenSize * 2 },
      { step: 'Divisions', layernorm: hiddenSize, rmsnorm: hiddenSize },
      { step: 'Square Roots', layernorm: 1, rmsnorm: 1 },
      { step: 'Parameters', layernorm: hiddenSize * 2, rmsnorm: hiddenSize },
      { step: 'Total Operations', layernorm: hiddenSize * 6 + 1, rmsnorm: hiddenSize * 3 + 1 }
    ]
  }, [hiddenSize])

  useEffect(() => {
    let animationFrame: number

    if (isAnimating) {
      const animate = () => {
        setAnimationStep(prev => (prev + 1) % 4)
        setTimeout(() => {
          animationFrame = requestAnimationFrame(animate)
        }, 1000)
      }
      animate()
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isAnimating])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 400
    const margin = { top: 40, right: 40, bottom: 80, left: 80 }

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(Array.from({ length: hiddenSize }, (_, i) => i.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const inputExtent = d3.extent([
      ...normalizationData.input,
      ...normalizationData.layernorm.output,
      ...normalizationData.rmsnorm.output
    ]) as [number, number]

    const yScale = d3.scaleLinear()
      .domain(inputExtent)
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Hidden Dimension')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Activation Value')

    // Add zero line
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2')

    const barWidth = xScale.bandwidth() / 3

    // Input bars
    svg.selectAll('.input-bar')
      .data(normalizationData.input)
      .enter()
      .append('rect')
      .attr('class', 'input-bar')
      .attr('x', (d, i) => (xScale(i.toString()) || 0) + 0)
      .attr('y', d => d >= 0 ? yScale(d) : yScale(0))
      .attr('width', barWidth)
      .attr('height', d => Math.abs(yScale(0) - yScale(d)))
      .attr('fill', '#9ca3af')
      .attr('opacity', 0.7)

    // LayerNorm bars
    if (selectedNorm === 'layernorm' || selectedNorm === 'both') {
      svg.selectAll('.layernorm-bar')
        .data(normalizationData.layernorm.output)
        .enter()
        .append('rect')
        .attr('class', 'layernorm-bar')
        .attr('x', (d, i) => (xScale(i.toString()) || 0) + barWidth)
        .attr('y', d => d >= 0 ? yScale(d) : yScale(0))
        .attr('width', barWidth)
        .attr('height', d => Math.abs(yScale(0) - yScale(d)))
        .attr('fill', '#3b82f6')
        .attr('opacity', 0.8)
    }

    // RMSNorm bars
    if (selectedNorm === 'rmsnorm' || selectedNorm === 'both') {
      svg.selectAll('.rmsnorm-bar')
        .data(normalizationData.rmsnorm.output)
        .enter()
        .append('rect')
        .attr('class', 'rmsnorm-bar')
        .attr('x', (d, i) => (xScale(i.toString()) || 0) + barWidth * 2)
        .attr('y', d => d >= 0 ? yScale(d) : yScale(0))
        .attr('width', barWidth)
        .attr('height', d => Math.abs(yScale(0) - yScale(d)))
        .attr('fill', '#f59e0b')
        .attr('opacity', 0.8)
    }

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 200}, ${margin.top})`)

    const legendData = [
      { color: '#9ca3af', label: 'Input' },
      ...(selectedNorm === 'layernorm' || selectedNorm === 'both'
        ? [{ color: '#3b82f6', label: 'LayerNorm' }] : []),
      ...(selectedNorm === 'rmsnorm' || selectedNorm === 'both'
        ? [{ color: '#f59e0b', label: 'RMSNorm' }] : [])
    ]

    legendData.forEach((item, i) => {
      legend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color)
        .attr('opacity', 0.8)

      legend.append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 12)
        .style('font-size', '12px')
        .text(item.label)
    })

  }, [normalizationData, selectedNorm, hiddenSize])

  useEffect(() => {
    if (!comparisonRef.current) return

    const svg = d3.select(comparisonRef.current)
    svg.selectAll('*').remove()

    const width = 500
    const height = 350
    const margin = { top: 40, right: 40, bottom: 80, left: 120 }

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(computationComparison.map(d => d.step))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(computationComparison, d => Math.max(d.layernorm, d.rmsnorm)) || 0])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Count')

    const barWidth = xScale.bandwidth() / 2

    // LayerNorm bars
    svg.selectAll('.layernorm-comp-bar')
      .data(computationComparison)
      .enter()
      .append('rect')
      .attr('class', 'layernorm-comp-bar')
      .attr('x', d => (xScale(d.step) || 0))
      .attr('y', d => yScale(d.layernorm))
      .attr('width', barWidth)
      .attr('height', d => height - margin.bottom - yScale(d.layernorm))
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.8)

    // RMSNorm bars
    svg.selectAll('.rmsnorm-comp-bar')
      .data(computationComparison)
      .enter()
      .append('rect')
      .attr('class', 'rmsnorm-comp-bar')
      .attr('x', d => (xScale(d.step) || 0) + barWidth)
      .attr('y', d => yScale(d.rmsnorm))
      .attr('width', barWidth)
      .attr('height', d => height - margin.bottom - yScale(d.rmsnorm))
      .attr('fill', '#f59e0b')
      .attr('opacity', 0.8)

    // Add value labels on bars
    svg.selectAll('.layernorm-label')
      .data(computationComparison)
      .enter()
      .append('text')
      .attr('class', 'layernorm-label')
      .attr('x', d => (xScale(d.step) || 0) + barWidth / 2)
      .attr('y', d => yScale(d.layernorm) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text(d => d.layernorm)

    svg.selectAll('.rmsnorm-label')
      .data(computationComparison)
      .enter()
      .append('text')
      .attr('class', 'rmsnorm-label')
      .attr('x', d => (xScale(d.step) || 0) + barWidth * 1.5)
      .attr('y', d => yScale(d.rmsnorm) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text(d => d.rmsnorm)

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, ${margin.top})`)

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.8)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '12px')
      .text('LayerNorm')

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#f59e0b')
      .attr('opacity', 0.8)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 32)
      .style('font-size', '12px')
      .text('RMSNorm')

  }, [computationComparison])

  const learningObjectives = [
    "Compare LayerNorm and RMSNorm computational efficiency",
    "Understand the mathematical differences between normalization techniques",
    "Visualize how normalization affects activation distributions",
    "Explore the trade-offs between centering and scaling operations"
  ]

  return (
    <SimulationLayout
      title="Normalization Techniques"
      description="Compare LayerNorm vs RMSNorm computational efficiency and mathematical properties"
      difficulty="Advanced"
      category="Model Internals"
      onPlay={() => setIsAnimating(!isAnimating)}
      onReset={() => {
        setHiddenSize(8)
        setInputVariance(1.0)
        setSelectedNorm('both')
        setEpsilon(1e-6)
        setAnimationStep(0)
        setIsAnimating(false)
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="mr-2 text-blue-600" size={20} />
              Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hidden Size: {hiddenSize}
                </label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={hiddenSize}
                  onChange={(e) => setHiddenSize(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span>
                  <span>16</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Variance: {inputVariance.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={inputVariance}
                  onChange={(e) => setInputVariance(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1</span>
                  <span>3.0</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Epsilon: {epsilon.toExponential(0)}
                </label>
                <input
                  type="range"
                  min="-8"
                  max="-4"
                  value={Math.log10(epsilon)}
                  onChange={(e) => setEpsilon(Math.pow(10, Number(e.target.value)))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1e-8</span>
                  <span>1e-4</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="mr-2 text-purple-600" size={20} />
              Display Options
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Normalization Type
                </label>
                <select
                  value={selectedNorm}
                  onChange={(e) => setSelectedNorm(e.target.value as 'layernorm' | 'rmsnorm' | 'both')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="both">Compare Both</option>
                  <option value="layernorm">LayerNorm Only</option>
                  <option value="rmsnorm">RMSNorm Only</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showComputations"
                  checked={showComputations}
                  onChange={(e) => setShowComputations(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showComputations" className="text-sm text-gray-700">
                  Show computation steps
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="mr-2 text-green-600" size={20} />
              Statistics
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Input</div>
                <div className="text-gray-600">
                  Mean: {normalizationData.layernorm.mean.toFixed(3)}<br/>
                  Variance: {normalizationData.layernorm.variance.toFixed(3)}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-700">LayerNorm Output</div>
                <div className="text-gray-600">
                  Mean: {(normalizationData.layernorm.output.reduce((sum, x) => sum + x, 0) / hiddenSize).toFixed(3)}<br/>
                  Variance: {(normalizationData.layernorm.output.reduce((sum, x) => sum + x**2, 0) / hiddenSize - Math.pow(normalizationData.layernorm.output.reduce((sum, x) => sum + x, 0) / hiddenSize, 2)).toFixed(3)}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-700">RMSNorm Output</div>
                <div className="text-gray-600">
                  RMS: {normalizationData.rmsnorm.rms.toFixed(3)}<br/>
                  Mean: {(normalizationData.rmsnorm.output.reduce((sum, x) => sum + x, 0) / hiddenSize).toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activation Distribution Comparison
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={svgRef}
                width="800"
                height="400"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                Compare input activations with normalized outputs. LayerNorm centers and scales,
                while RMSNorm only scales by the root mean square.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2 text-blue-600" size={20} />
                Computational Complexity
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={comparisonRef}
                  width="500"
                  height="350"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  RMSNorm reduces computational overhead by eliminating mean calculation
                  and centering operations while maintaining normalization benefits.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 text-yellow-600" size={20} />
                Performance Metrics
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {((computationComparison.find(d => d.step === 'Total Operations')?.rmsnorm || 0) /
                        (computationComparison.find(d => d.step === 'Total Operations')?.layernorm || 1) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">RMSNorm Efficiency</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {hiddenSize}
                    </div>
                    <div className="text-sm text-gray-600">Fewer Parameters</div>
                  </div>
                </div>

                {showComputations && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Mathematical Steps</h4>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium text-blue-600 mb-1">LayerNorm:</div>
                        {normalizationData.layernorm.computeSteps.map((step, i) => (
                          <div key={i} className={`text-xs font-mono p-2 bg-blue-50 rounded mb-1 ${
                            isAnimating && i === animationStep ? 'bg-blue-200' : ''
                          }`}>
                            {step}
                          </div>
                        ))}
                      </div>

                      <div className="text-sm">
                        <div className="font-medium text-yellow-600 mb-1">RMSNorm:</div>
                        {normalizationData.rmsnorm.computeSteps.map((step, i) => (
                          <div key={i} className={`text-xs font-mono p-2 bg-yellow-50 rounded mb-1 ${
                            isAnimating && i === animationStep ? 'bg-yellow-200' : ''
                          }`}>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>Key Differences:</strong></div>
                  <div>• LayerNorm: Mean centering + variance scaling</div>
                  <div>• RMSNorm: RMS scaling only</div>
                  <div>• RMSNorm: ~50% fewer operations</div>
                  <div>• RMSNorm: Better numerical stability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}