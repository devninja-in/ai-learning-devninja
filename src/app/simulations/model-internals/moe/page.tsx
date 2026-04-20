'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { Network, Users, Settings, BarChart, Activity, Zap } from 'lucide-react'

interface Expert {
  id: number
  specialization: string
  color: string
  weight: number
  activations: number[]
  selected: boolean
}

interface Token {
  id: number
  text: string
  embedding: number[]
  expertWeights: number[]
  selectedExperts: number[]
  position: { x: number; y: number }
}

interface MoEMetrics {
  totalExperts: number
  activeExperts: number
  expertUtilization: number[]
  loadBalancingLoss: number
  routerEntropy: number
  sparsity: number
}

export default function MoESimulation() {
  const [numExperts, setNumExperts] = useState(8)
  const [topK, setTopK] = useState(2)
  const [sequenceLength, setSequenceLength] = useState(6)
  const [loadBalancingWeight, setLoadBalancingWeight] = useState(0.1)
  const [noiseStddev, setNoiseStddev] = useState(1.0)
  const [selectedVisualization, setSelectedVisualization] = useState<'routing' | 'utilization' | 'architecture'>('routing')
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const architectureRef = useRef<SVGSVGElement>(null)

  const sampleTexts = [
    "The quick brown fox jumps over",
    "Machine learning algorithms process data efficiently",
    "Climate change affects global weather patterns",
    "Quantum computers use superposition and entanglement",
    "Financial markets fluctuate based on economic",
    "Programming languages provide abstraction layers for"
  ]

  const expertSpecializations = [
    { name: "Language & Grammar", color: "#ef4444" },
    { name: "Mathematics", color: "#f97316" },
    { name: "Science & Technology", color: "#eab308" },
    { name: "History & Culture", color: "#22c55e" },
    { name: "Business & Finance", color: "#06b6d4" },
    { name: "Arts & Literature", color: "#3b82f6" },
    { name: "Programming", color: "#8b5cf6" },
    { name: "General Knowledge", color: "#ec4899" }
  ]

  const experts: Expert[] = useMemo(() => {
    return Array.from({ length: numExperts }, (_, i) => ({
      id: i,
      specialization: expertSpecializations[i % expertSpecializations.length].name,
      color: expertSpecializations[i % expertSpecializations.length].color,
      weight: Math.random() * 0.3 + 0.1, // Random baseline weight
      activations: Array.from({ length: 512 }, () => Math.random() - 0.5),
      selected: false
    }))
  }, [numExperts])

  const tokens: Token[] = useMemo(() => {
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    const words = text.split(' ').slice(0, sequenceLength)

    return words.map((word, i) => {
      // Generate token embedding
      const embedding = Array.from({ length: 512 }, () => Math.random() - 0.5)

      // Router network simulation - compute logits for each expert
      const routerLogits = experts.map((expert, expertIdx) => {
        // Simulate routing based on word content
        let logit = Math.random() * 2 - 1 + noiseStddev * (Math.random() - 0.5)

        // Add some semantic routing bias
        if (word.match(/[0-9]/)) logit += expertIdx === 1 ? 2 : 0 // Math expert
        if (word.match(/(code|program|function)/i)) logit += expertIdx === 6 ? 2 : 0 // Programming expert
        if (word.match(/(the|and|of|to|a)/i)) logit += expertIdx === 0 ? 1.5 : 0 // Language expert
        if (word.match(/(market|finance|money)/i)) logit += expertIdx === 4 ? 2 : 0 // Finance expert

        return logit
      })

      // Apply softmax to get probabilities
      const maxLogit = Math.max(...routerLogits)
      const expLogits = routerLogits.map(l => Math.exp(l - maxLogit))
      const sumExp = expLogits.reduce((sum, exp) => sum + exp, 0)
      const expertWeights = expLogits.map(exp => exp / sumExp)

      // Select top-k experts
      const weightedExperts = expertWeights.map((weight, idx) => ({ idx, weight }))
      weightedExperts.sort((a, b) => b.weight - a.weight)
      const selectedExperts = weightedExperts.slice(0, topK).map(e => e.idx)

      // Normalize weights of selected experts
      const selectedWeightSum = selectedExperts.reduce((sum, idx) => sum + expertWeights[idx], 0)
      const normalizedWeights = expertWeights.map((weight, idx) =>
        selectedExperts.includes(idx) ? weight / selectedWeightSum : 0
      )

      return {
        id: i,
        text: word,
        embedding,
        expertWeights: normalizedWeights,
        selectedExperts,
        position: { x: 0, y: 0 } // Will be set in visualization
      }
    })
  }, [sequenceLength, experts, topK, noiseStddev])

  const metrics: MoEMetrics = useMemo(() => {
    const expertCounts = new Array(numExperts).fill(0)
    tokens.forEach(token => {
      token.selectedExperts.forEach(expertIdx => {
        expertCounts[expertIdx] += 1
      })
    })

    const totalSelections = tokens.length * topK
    const expertUtilization = expertCounts.map(count => count / totalSelections)

    // Load balancing loss (encourages equal expert usage)
    const meanUtilization = expertUtilization.reduce((sum, util) => sum + util, 0) / numExperts
    const loadBalancingLoss = expertUtilization.reduce((sum, util) => sum + Math.pow(util - meanUtilization, 2), 0)

    // Router entropy (higher means more diverse routing)
    const routerEntropy = tokens.reduce((entropy, token) => {
      const tokenEntropy = -token.expertWeights.reduce((sum, weight) => {
        return sum + (weight > 0 ? weight * Math.log2(weight) : 0)
      }, 0)
      return entropy + tokenEntropy
    }, 0) / tokens.length

    // Sparsity (fraction of zero weights)
    const totalWeights = tokens.length * numExperts
    const zeroWeights = tokens.reduce((count, token) => {
      return count + token.expertWeights.filter(w => w === 0).length
    }, 0)
    const sparsity = zeroWeights / totalWeights

    return {
      totalExperts: numExperts,
      activeExperts: topK,
      expertUtilization,
      loadBalancingLoss,
      routerEntropy,
      sparsity
    }
  }, [tokens, numExperts, topK])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationStep(prev => (prev + 1) % tokens.length)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAnimating, tokens.length])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 500
    const margin = { top: 40, right: 40, bottom: 60, left: 100 }

    if (selectedVisualization === 'routing') {
      // Token-to-Expert routing visualization
      const tokenHeight = (height - margin.top - margin.bottom) / tokens.length
      const expertWidth = (width - margin.left - margin.right) / numExperts

      // Draw tokens
      tokens.forEach((token, tokenIdx) => {
        const tokenY = margin.top + tokenIdx * tokenHeight

        // Token label
        svg.append('text')
          .attr('x', margin.left - 10)
          .attr('y', tokenY + tokenHeight / 2)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('font-weight', tokenIdx === animationStep && isAnimating ? 'bold' : 'normal')
          .style('fill', tokenIdx === animationStep && isAnimating ? '#ef4444' : '#374151')
          .text(token.text)

        // Expert connections
        experts.forEach((expert, expertIdx) => {
          const expertX = margin.left + expertIdx * expertWidth + expertWidth / 2
          const weight = token.expertWeights[expertIdx]
          const isSelected = token.selectedExperts.includes(expertIdx)

          if (weight > 0) {
            svg.append('line')
              .attr('x1', margin.left - 5)
              .attr('y1', tokenY + tokenHeight / 2)
              .attr('x2', expertX)
              .attr('y2', height - margin.bottom + 20)
              .attr('stroke', expert.color)
              .attr('stroke-width', Math.max(1, weight * 8))
              .attr('opacity', isSelected ? 0.8 : 0.3)
              .attr('stroke-dasharray', isSelected ? '0' : '3,3')

            // Weight label
            if (isSelected) {
              svg.append('text')
                .attr('x', expertX)
                .attr('y', tokenY + tokenHeight / 2 - 5)
                .attr('text-anchor', 'middle')
                .style('font-size', '10px')
                .style('fill', expert.color)
                .text(weight.toFixed(2))
            }
          }
        })
      })

      // Draw expert labels
      experts.forEach((expert, expertIdx) => {
        const expertX = margin.left + expertIdx * expertWidth + expertWidth / 2

        svg.append('rect')
          .attr('x', expertX - expertWidth / 3)
          .attr('y', height - margin.bottom + 10)
          .attr('width', expertWidth * 2 / 3)
          .attr('height', 30)
          .attr('fill', expert.color)
          .attr('opacity', 0.7)
          .attr('rx', 4)

        svg.append('text')
          .attr('x', expertX)
          .attr('y', height - margin.bottom + 30)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '10px')
          .style('fill', 'white')
          .style('font-weight', 'bold')
          .text(`E${expertIdx}`)
      })

    } else if (selectedVisualization === 'utilization') {
      // Expert utilization bar chart
      const xScale = d3.scaleBand()
        .domain(experts.map(e => e.id.toString()))
        .range([margin.left, width - margin.right])
        .padding(0.1)

      const yScale = d3.scaleLinear()
        .domain([0, Math.max(...metrics.expertUtilization) * 1.1])
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
        .text('Expert ID')

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
        .text('Utilization Rate')

      // Add average line
      const avgUtilization = metrics.expertUtilization.reduce((sum, util) => sum + util, 0) / numExperts
      svg.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', yScale(avgUtilization))
        .attr('y2', yScale(avgUtilization))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')

      svg.append('text')
        .attr('x', width - margin.right - 5)
        .attr('y', yScale(avgUtilization) - 5)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .style('fill', '#ef4444')
        .text('Average')

      // Draw bars
      experts.forEach((expert, expertIdx) => {
        const utilization = metrics.expertUtilization[expertIdx]

        svg.append('rect')
          .attr('x', xScale(expert.id.toString()) || 0)
          .attr('y', yScale(utilization))
          .attr('width', xScale.bandwidth())
          .attr('height', height - margin.bottom - yScale(utilization))
          .attr('fill', expert.color)
          .attr('opacity', 0.8)

        // Value label
        svg.append('text')
          .attr('x', (xScale(expert.id.toString()) || 0) + xScale.bandwidth() / 2)
          .attr('y', yScale(utilization) - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .text((utilization * 100).toFixed(1) + '%')
      })
    }

  }, [tokens, experts, metrics, selectedVisualization, animationStep, isAnimating, numExperts])

  useEffect(() => {
    if (!architectureRef.current) return

    const svg = d3.select(architectureRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400
    const margin = 40

    // Draw MoE architecture diagram
    const layers = [
      { name: 'Input Tokens', y: 50, color: '#6b7280' },
      { name: 'Router Network', y: 130, color: '#3b82f6' },
      { name: 'Expert Selection', y: 210, color: '#f59e0b' },
      { name: 'Expert Computation', y: 290, color: '#10b981' },
      { name: 'Output Combination', y: 350, color: '#8b5cf6' }
    ]

    layers.forEach((layer, layerIdx) => {
      // Layer background
      svg.append('rect')
        .attr('x', margin)
        .attr('y', layer.y - 15)
        .attr('width', width - 2 * margin)
        .attr('height', 30)
        .attr('fill', layer.color)
        .attr('opacity', 0.1)
        .attr('rx', 5)

      // Layer label
      svg.append('text')
        .attr('x', margin + 10)
        .attr('y', layer.y)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', layer.color)
        .text(layer.name)

      // Add specific components for each layer
      if (layerIdx === 1) { // Router Network
        // Router components
        for (let i = 0; i < 3; i++) {
          svg.append('circle')
            .attr('cx', margin + 200 + i * 30)
            .attr('cy', layer.y)
            .attr('r', 8)
            .attr('fill', layer.color)
            .attr('opacity', 0.7)
        }
      } else if (layerIdx === 2) { // Expert Selection
        // Top-k selection visualization
        svg.append('text')
          .attr('x', margin + 200)
          .attr('y', layer.y)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('fill', layer.color)
          .text(`Top-${topK} Selection`)
      } else if (layerIdx === 3) { // Expert Computation
        // Expert boxes
        const expertSpacing = (width - 2 * margin - 60) / numExperts
        for (let i = 0; i < Math.min(numExperts, 8); i++) {
          svg.append('rect')
            .attr('x', margin + 60 + i * expertSpacing)
            .attr('y', layer.y - 8)
            .attr('width', expertSpacing - 5)
            .attr('height', 16)
            .attr('fill', experts[i]?.color || '#6b7280')
            .attr('opacity', 0.7)
            .attr('rx', 2)

          svg.append('text')
            .attr('x', margin + 60 + i * expertSpacing + (expertSpacing - 5) / 2)
            .attr('y', layer.y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '9px')
            .style('fill', 'white')
            .text(`E${i}`)
        }
        if (numExperts > 8) {
          svg.append('text')
            .attr('x', margin + 60 + 8 * expertSpacing + 10)
            .attr('y', layer.y)
            .attr('dominant-baseline', 'middle')
            .style('font-size', '12px')
            .text('...')
        }
      }

      // Arrows between layers
      if (layerIdx < layers.length - 1) {
        const nextY = layers[layerIdx + 1].y
        svg.append('line')
          .attr('x1', width / 2)
          .attr('y1', layer.y + 20)
          .attr('x2', width / 2)
          .attr('y2', nextY - 20)
          .attr('stroke', '#6b7280')
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)')
      }
    })

    // Add arrow marker
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 7)
      .attr('refX', 9)
      .attr('refY', 3.5)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3.5, 0 7')
      .attr('fill', '#6b7280')

  }, [numExperts, topK, experts])

  const learningObjectives = [
    "Understand Mixture of Experts (MoE) architecture principles",
    "Explore expert routing and load balancing mechanisms",
    "Visualize sparsity benefits in large model training",
    "Analyze trade-offs between model capacity and computation"
  ]

  return (
    <SimulationLayout
      title="Mixture of Experts (MoE)"
      description="Interactive visualization of expert routing and load balancing in MoE architectures"
      difficulty="Advanced"
      category="Model Internals"
      onPlay={() => setIsAnimating(!isAnimating)}
      onReset={() => {
        setNumExperts(8)
        setTopK(2)
        setSequenceLength(6)
        setLoadBalancingWeight(0.1)
        setNoiseStddev(1.0)
        setSelectedVisualization('routing')
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
              MoE Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Experts: {numExperts}
                </label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={numExperts}
                  onChange={(e) => setNumExperts(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span>
                  <span>16</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top-K Experts: {topK}
                </label>
                <input
                  type="range"
                  min="1"
                  max={Math.min(4, numExperts)}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>{Math.min(4, numExperts)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Length: {sequenceLength}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={sequenceLength}
                  onChange={(e) => setSequenceLength(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Router Noise: {noiseStddev.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={noiseStddev}
                  onChange={(e) => setNoiseStddev(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1</span>
                  <span>3.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="mr-2 text-purple-600" size={20} />
              Visualization Mode
            </h3>

            <div className="space-y-3">
              <div>
                <select
                  value={selectedVisualization}
                  onChange={(e) => setSelectedVisualization(e.target.value as 'routing' | 'utilization' | 'architecture')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="routing">Token Routing</option>
                  <option value="utilization">Expert Utilization</option>
                  <option value="architecture">MoE Architecture</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  {selectedVisualization === 'routing' && "Shows how tokens are routed to different experts"}
                  {selectedVisualization === 'utilization' && "Displays expert usage distribution and load balancing"}
                  {selectedVisualization === 'architecture' && "Illustrates the overall MoE architecture"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="mr-2 text-green-600" size={20} />
              Metrics
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Experts:</span>
                <span className="font-medium">{metrics.totalExperts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active per Token:</span>
                <span className="font-medium">{metrics.activeExperts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sparsity:</span>
                <span className="font-medium">{(metrics.sparsity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Router Entropy:</span>
                <span className="font-medium">{metrics.routerEntropy.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Load Balance Loss:</span>
                <span className="font-medium">{metrics.loadBalancingLoss.toFixed(4)}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Higher entropy and lower load balance loss indicate better expert utilization
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedVisualization === 'routing' && 'Token-to-Expert Routing'}
              {selectedVisualization === 'utilization' && 'Expert Utilization Distribution'}
              {selectedVisualization === 'architecture' && 'MoE Architecture Overview'}
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              {selectedVisualization === 'architecture' ? (
                <svg
                  ref={architectureRef}
                  width="600"
                  height="400"
                  className="w-full h-auto"
                />
              ) : (
                <svg
                  ref={svgRef}
                  width="800"
                  height="500"
                  className="w-full h-auto"
                />
              )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                {selectedVisualization === 'routing' && "Lines show routing weights. Thick solid lines indicate selected experts, dashed lines show non-selected weights."}
                {selectedVisualization === 'utilization' && "Red dashed line shows ideal uniform utilization. Imbalanced usage leads to training inefficiency."}
                {selectedVisualization === 'architecture' && "Complete MoE processing pipeline from input tokens through expert selection to output combination."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Network className="mr-2 text-blue-600" size={20} />
                Expert Specializations
              </h3>

              <div className="space-y-3">
                {experts.slice(0, 8).map((expert, i) => (
                  <div key={expert.id} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: expert.color }}
                    />
                    <span className="text-sm font-medium">Expert {expert.id}</span>
                    <span className="text-xs text-gray-600">{expert.specialization}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: expert.color,
                          width: `${(metrics.expertUtilization[i] || 0) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-12">
                      {((metrics.expertUtilization[i] || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
                {experts.length > 8 && (
                  <div className="text-center text-sm text-gray-500">
                    ... and {experts.length - 8} more experts
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 text-yellow-600" size={20} />
                MoE Benefits
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {((1 - metrics.sparsity) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Active Parameters</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(numExperts / topK).toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">Capacity Multiplier</div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-2">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium">Computational Efficiency:</div>
                    <div>• Only top-{topK} experts process each token</div>
                    <div>• {((topK / numExperts) * 100).toFixed(1)}% of experts active per token</div>
                    <div>• Maintains O(1) inference cost per token</div>
                  </div>

                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium">Scaling Benefits:</div>
                    <div>• Increases model capacity without proportional compute</div>
                    <div>• Enables specialization across domains</div>
                    <div>• Used in Switch Transformer, PaLM-62B, GLaM</div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="font-medium">Load Balancing:</div>
                    <div>• Router entropy: {metrics.routerEntropy.toFixed(2)} bits</div>
                    <div>• Load balance loss: {metrics.loadBalancingLoss.toFixed(4)}</div>
                    <div>• Prevents expert collapse and ensures utilization</div>
                  </div>
                </div>

                {isAnimating && (
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-sm font-medium text-purple-800">
                      Animation: Token {animationStep + 1}/{tokens.length}
                    </div>
                    <div className="text-xs text-purple-600">
                      &quot;{tokens[animationStep]?.text}&quot;
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}