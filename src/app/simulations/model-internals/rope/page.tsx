'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { Rotate3D, Settings, Play, RotateCw, Layers, Info } from 'lucide-react'

interface RoPEVisualization {
  position: number
  dimension: number
  frequency: number
  rotation: number
  cos: number
  sin: number
}

export default function RoPESimulation() {
  const [sequenceLength, setSequenceLength] = useState(8)
  const [dimensions, setDimensions] = useState(64)
  const [baseFreq, setBaseFreq] = useState(10000)
  const [selectedPosition, setSelectedPosition] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [time, setTime] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const circleRef = useRef<SVGSVGElement>(null)

  const ropeData = useMemo((): RoPEVisualization[] => {
    const data: RoPEVisualization[] = []

    for (let pos = 0; pos < sequenceLength; pos++) {
      for (let dim = 0; dim < dimensions; dim += 2) {
        const frequency = 1 / Math.pow(baseFreq, dim / dimensions)
        const rotation = pos * frequency + (time * animationSpeed * 0.1)

        data.push({
          position: pos,
          dimension: dim,
          frequency,
          rotation,
          cos: Math.cos(rotation),
          sin: Math.sin(rotation)
        })
      }
    }

    return data
  }, [sequenceLength, dimensions, baseFreq, time, animationSpeed])

  const selectedPositionData = useMemo(() => {
    return ropeData.filter(d => d.position === selectedPosition)
  }, [ropeData, selectedPosition])

  useEffect(() => {
    let animationFrame: number

    if (isAnimating) {
      const animate = () => {
        setTime(prev => prev + 1)
        animationFrame = requestAnimationFrame(animate)
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
    if (!svgRef.current || ropeData.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 400
    const margin = { top: 40, right: 40, bottom: 60, left: 60 }

    // Create heatmap visualization
    const positionScale = d3.scaleBand()
      .domain(Array.from({length: sequenceLength}, (_, i) => i.toString()))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const dimensionScale = d3.scaleBand()
      .domain(Array.from({length: dimensions / 2}, (_, i) => (i * 2).toString()))
      .range([margin.top, height - margin.bottom])
      .padding(0.1)

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([-1, 1])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(positionScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Sequence Position')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(dimensionScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Dimension Pair')

    // Add heatmap cells
    const cells = svg.selectAll('.cell')
      .data(ropeData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => positionScale(d.position.toString()) || 0)
      .attr('y', d => dimensionScale(d.dimension.toString()) || 0)
      .attr('width', positionScale.bandwidth())
      .attr('height', dimensionScale.bandwidth())
      .attr('fill', d => colorScale(d.cos))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')

    // Add hover interactions
    cells
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('stroke', '#333')

        // Show tooltip
        const tooltip = svg.append('g')
          .attr('id', 'tooltip')
          .attr('transform', `translate(${event.offsetX + 10},${event.offsetY - 10})`)

        tooltip.append('rect')
          .attr('width', 160)
          .attr('height', 80)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('rx', 4)

        tooltip.append('text')
          .attr('x', 8)
          .attr('y', 15)
          .style('font-size', '12px')
          .text(`Pos: ${d.position}, Dim: ${d.dimension}`)

        tooltip.append('text')
          .attr('x', 8)
          .attr('y', 30)
          .style('font-size', '12px')
          .text(`Freq: ${d.frequency.toFixed(4)}`)

        tooltip.append('text')
          .attr('x', 8)
          .attr('y', 45)
          .style('font-size', '12px')
          .text(`cos(θ): ${d.cos.toFixed(3)}`)

        tooltip.append('text')
          .attr('x', 8)
          .attr('y', 60)
          .style('font-size', '12px')
          .text(`sin(θ): ${d.sin.toFixed(3)}`)
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 0.5)
          .attr('stroke', '#fff')
        svg.select('#tooltip').remove()
      })
      .on('click', function(event, d) {
        setSelectedPosition(d.position)
      })

    // Highlight selected position
    svg.selectAll('.position-highlight').remove()
    if (selectedPosition < sequenceLength) {
      svg.append('rect')
        .attr('class', 'position-highlight')
        .attr('x', positionScale(selectedPosition.toString()) || 0)
        .attr('y', margin.top - 5)
        .attr('width', positionScale.bandwidth())
        .attr('height', height - margin.top - margin.bottom + 10)
        .attr('fill', 'none')
        .attr('stroke', '#ff6b35')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')

    }

  }, [ropeData, selectedPosition, sequenceLength, dimensions])

  useEffect(() => {
    if (!circleRef.current || selectedPositionData.length === 0) return

    const svg = d3.select(circleRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 400
    const margin = 40
    const radius = (Math.min(width, height) - 2 * margin) / 2

    const centerX = width / 2
    const centerY = height / 2

    // Add background circle
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)

    // Add angle lines and labels
    const angleCount = 8
    for (let i = 0; i < angleCount; i++) {
      const angle = (i * 2 * Math.PI) / angleCount
      const x1 = centerX + (radius - 20) * Math.cos(angle)
      const y1 = centerY + (radius - 20) * Math.sin(angle)
      const x2 = centerX + radius * Math.cos(angle)
      const y2 = centerY + radius * Math.sin(angle)

      svg.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 1)

      svg.append('text')
        .attr('x', centerX + (radius + 15) * Math.cos(angle))
        .attr('y', centerY + (radius + 15) * Math.sin(angle))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6b7280')
        .text(`${(angle * 180 / Math.PI).toFixed(0)}°`)
    }

    // Add center point
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 3)
      .attr('fill', '#374151')

    // Plot dimension pairs as vectors
    const vectorScale = d3.scaleLinear()
      .domain([0, Math.max(...selectedPositionData.map(d => Math.sqrt(d.cos * d.cos + d.sin * d.sin)))])
      .range([0, radius])

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, selectedPositionData.length - 1])

    selectedPositionData.forEach((d, i) => {
      const vectorLength = vectorScale(Math.sqrt(d.cos * d.cos + d.sin * d.sin))
      const endX = centerX + d.cos * vectorLength
      const endY = centerY + d.sin * vectorLength

      // Vector line
      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', endX)
        .attr('y2', endY)
        .attr('stroke', colorScale(i))
        .attr('stroke-width', 2)
        .attr('opacity', 0.8)

      // Vector arrowhead
      const arrowLength = 8
      const arrowAngle = Math.PI / 6
      const vectorAngle = Math.atan2(d.sin, d.cos)

      svg.append('polygon')
        .attr('points', [
          [endX, endY],
          [endX - arrowLength * Math.cos(vectorAngle - arrowAngle), endY - arrowLength * Math.sin(vectorAngle - arrowAngle)],
          [endX - arrowLength * Math.cos(vectorAngle + arrowAngle), endY - arrowLength * Math.sin(vectorAngle + arrowAngle)]
        ].map(p => p.join(',')).join(' '))
        .attr('fill', colorScale(i))
        .attr('opacity', 0.8)

      // Vector endpoint
      svg.append('circle')
        .attr('cx', endX)
        .attr('cy', endY)
        .attr('r', 4)
        .attr('fill', colorScale(i))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
    })

    // Add legend for dimension pairs
    const legendG = svg.append('g')
      .attr('transform', `translate(${width - 120}, 20)`)

    legendG.append('rect')
      .attr('width', 100)
      .attr('height', selectedPositionData.length * 20 + 10)
      .attr('fill', 'white')
      .attr('stroke', '#d1d5db')
      .attr('rx', 4)

    selectedPositionData.forEach((d, i) => {
      legendG.append('circle')
        .attr('cx', 10)
        .attr('cy', 15 + i * 20)
        .attr('r', 4)
        .attr('fill', colorScale(i))

      legendG.append('text')
        .attr('x', 20)
        .attr('y', 15 + i * 20)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '11px')
        .text(`Dim ${d.dimension}`)
    })

  }, [selectedPositionData])

  const learningObjectives = [
    "Understand how RoPE encodes positional information without absolute positions",
    "Visualize how rotation frequencies vary across embedding dimensions",
    "Explore the relationship between position and rotation angles",
    "See how RoPE enables relative position understanding in transformers"
  ]

  return (
    <SimulationLayout
      title="RoPE: Rotary Position Embeddings"
      description="Interactive visualization of rotary position embeddings and their frequency patterns"
      difficulty="Advanced"
      category="Model Internals"
      onPlay={() => setIsAnimating(!isAnimating)}
      onReset={() => {
        setSequenceLength(8)
        setDimensions(64)
        setBaseFreq(10000)
        setSelectedPosition(0)
        setAnimationSpeed(1)
        setTime(0)
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
              RoPE Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sequence Length: {sequenceLength}
                </label>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={sequenceLength}
                  onChange={(e) => setSequenceLength(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>4</span>
                  <span>16</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embedding Dimensions: {dimensions}
                </label>
                <input
                  type="range"
                  min="16"
                  max="128"
                  step="16"
                  value={dimensions}
                  onChange={(e) => setDimensions(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>16</span>
                  <span>128</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Frequency: {baseFreq}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={baseFreq}
                  onChange={(e) => setBaseFreq(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1K</span>
                  <span>50K</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animation Speed: {animationSpeed}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1x</span>
                  <span>3x</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Rotate3D className="mr-2 text-purple-600" size={20} />
              Position Inspector
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Position: {selectedPosition}
                </label>
                <input
                  type="range"
                  min="0"
                  max={sequenceLength - 1}
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Rotation Details:</p>
                <p>• Dimension pairs: {dimensions / 2}</p>
                <p>• Frequency range: {(1 / baseFreq).toFixed(6)} - {(1).toFixed(3)}</p>
                <p>• Click heatmap cells to inspect</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="mr-2 text-green-600" size={20} />
              How RoPE Works
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <p><strong>Formula:</strong> θ_d = base^(-2d/D)</p>
              <p><strong>Rotation:</strong> Apply 2D rotations to embedding pairs</p>
              <p><strong>Relative:</strong> Enables relative position understanding</p>
              <p><strong>Extrapolation:</strong> Works beyond training sequence length</p>
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              RoPE Frequency Heatmap
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
                Each cell shows cos(θ) for position-dimension pairs. Lower frequencies (higher dimensions)
                rotate slower, encoding longer-range positional relationships.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vector Rotation Visualization
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={circleRef}
                  width="400"
                  height="400"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Rotation vectors for position {selectedPosition}. Each vector represents
                  a dimension pair&apos;s rotation state.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Frequency Analysis
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(dimensions / 2).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">Rotation Pairs</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(1 / baseFreq * Math.pow(baseFreq, (dimensions - 2) / dimensions)).toFixed(4)}
                    </div>
                    <div className="text-sm text-gray-600">Max Frequency</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Position {selectedPosition} Details</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedPositionData.slice(0, 8).map((d, i) => (
                      <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span className="font-mono">Dim {d.dimension}:</span>
                        <div className="text-right">
                          <div>θ = {d.rotation.toFixed(3)}</div>
                          <div className="text-xs text-gray-600">
                            cos: {d.cos.toFixed(3)}, sin: {d.sin.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedPositionData.length > 8 && (
                      <div className="text-center text-sm text-gray-500">
                        ... and {selectedPositionData.length - 8} more pairs
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}