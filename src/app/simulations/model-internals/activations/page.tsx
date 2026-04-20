'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { TrendingUp, Zap, Settings, Activity, Calculator, Play } from 'lucide-react'

interface ActivationFunction {
  name: string
  formula: string
  description: string
  color: string
  compute: (x: number) => number
  derivative: (x: number) => number
  parameters?: number
  usedIn: string[]
}

interface ActivationData {
  x: number
  [key: string]: number
}

export default function ActivationsSimulation() {
  const [selectedActivations, setSelectedActivations] = useState<string[]>(['swiglu', 'gelu', 'relu'])
  const [inputRange, setInputRange] = useState([-5, 5])
  const [showDerivatives, setShowDerivatives] = useState(false)
  const [beta, setBeta] = useState(1.0) // For SwiGLU
  const [gateValue, setGateValue] = useState(0.5) // For gating visualization
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationFrame, setAnimationFrame] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const distributionRef = useRef<SVGSVGElement>(null)

  const activationFunctions: { [key: string]: ActivationFunction } = useMemo(() => ({
    relu: {
      name: 'ReLU',
      formula: 'f(x) = max(0, x)',
      description: 'Classic activation with simple thresholding',
      color: '#ef4444',
      compute: (x: number) => Math.max(0, x),
      derivative: (x: number) => x > 0 ? 1 : 0,
      parameters: 0,
      usedIn: ['ResNet', 'Early Transformers']
    },
    gelu: {
      name: 'GELU',
      formula: 'f(x) = 0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))',
      description: 'Gaussian Error Linear Unit with smooth transitions',
      color: '#3b82f6',
      compute: (x: number) => {
        const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))
        return 0.5 * x * (1 + Math.tanh(inner))
      },
      derivative: (x: number) => {
        const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))
        const tanh_val = Math.tanh(inner)
        const sech_val = 1 - tanh_val * tanh_val
        const inner_derivative = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * Math.pow(x, 2))
        return 0.5 * (1 + tanh_val) + 0.5 * x * sech_val * inner_derivative
      },
      parameters: 0,
      usedIn: ['BERT', 'GPT-2', 'T5']
    },
    swish: {
      name: 'Swish',
      formula: 'f(x) = x * sigmoid(βx)',
      description: 'Self-gated activation function',
      color: '#10b981',
      compute: (x: number) => x / (1 + Math.exp(-beta * x)),
      derivative: (x: number) => {
        const sigmoid = 1 / (1 + Math.exp(-beta * x))
        return sigmoid + x * sigmoid * (1 - sigmoid) * beta
      },
      parameters: 1,
      usedIn: ['EfficientNet', 'Some Transformers']
    },
    swiglu: {
      name: 'SwiGLU',
      formula: 'f(x, g) = Swish(x) * g',
      description: 'Gated Linear Unit with Swish activation',
      color: '#f59e0b',
      compute: (x: number) => {
        const swish = x / (1 + Math.exp(-x))
        return swish * gateValue
      },
      derivative: (x: number) => {
        const sigmoid = 1 / (1 + Math.exp(-x))
        const swish_derivative = sigmoid + x * sigmoid * (1 - sigmoid)
        return swish_derivative * gateValue
      },
      parameters: 0,
      usedIn: ['PaLM', 'LaMDA', 'Flamingo']
    },
    geglu: {
      name: 'GeGLU',
      formula: 'f(x, g) = GELU(x) * g',
      description: 'Gated Linear Unit with GELU activation',
      color: '#8b5cf6',
      compute: (x: number) => {
        const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))
        const gelu = 0.5 * x * (1 + Math.tanh(inner))
        return gelu * gateValue
      },
      derivative: (x: number) => {
        const inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))
        const tanh_val = Math.tanh(inner)
        const sech_val = 1 - tanh_val * tanh_val
        const inner_derivative = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * Math.pow(x, 2))
        const gelu_derivative = 0.5 * (1 + tanh_val) + 0.5 * x * sech_val * inner_derivative
        return gelu_derivative * gateValue
      },
      parameters: 0,
      usedIn: ['T5', 'Some Language Models']
    },
    mish: {
      name: 'Mish',
      formula: 'f(x) = x * tanh(ln(1 + eˣ))',
      description: 'Self-regularizing activation function',
      color: '#ec4899',
      compute: (x: number) => x * Math.tanh(Math.log(1 + Math.exp(x))),
      derivative: (x: number) => {
        const exp_x = Math.exp(x)
        const softplus = Math.log(1 + exp_x)
        const tanh_val = Math.tanh(softplus)
        const sech_val = 1 - tanh_val * tanh_val
        return tanh_val + x * sech_val * (exp_x / (1 + exp_x))
      },
      parameters: 0,
      usedIn: ['YOLOv4', 'Some CNNs']
    }
  }), [beta, gateValue])

  const plotData = useMemo((): ActivationData[] => {
    const points: ActivationData[] = []
    const step = (inputRange[1] - inputRange[0]) / 200

    for (let x = inputRange[0]; x <= inputRange[1]; x += step) {
      const point: ActivationData = { x }

      selectedActivations.forEach(name => {
        if (activationFunctions[name]) {
          if (showDerivatives) {
            point[name] = activationFunctions[name].derivative(x)
          } else {
            point[name] = activationFunctions[name].compute(x)
          }
        }
      })

      points.push(point)
    }

    return points
  }, [selectedActivations, inputRange, showDerivatives, activationFunctions])

  const distributionData = useMemo(() => {
    // Generate random inputs and show output distributions
    const samples = 1000
    const inputs = Array.from({ length: samples }, () => {
      // Normal distribution input
      const u1 = Math.random()
      const u2 = Math.random()
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    })

    return selectedActivations.map(name => {
      if (!activationFunctions[name]) return null

      const outputs = inputs.map(x => activationFunctions[name].compute(x))
      const bins = d3.bin()
        .domain(d3.extent(outputs) as [number, number])
        .thresholds(30)(outputs)

      return {
        name,
        color: activationFunctions[name].color,
        bins: bins.map(bin => ({
          x0: bin.x0 || 0,
          x1: bin.x1 || 0,
          length: bin.length,
          density: bin.length / samples
        }))
      }
    }).filter(Boolean)
  }, [selectedActivations, activationFunctions])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1)
        setGateValue(0.5 + 0.4 * Math.sin(Date.now() * 0.003))
      }, 50)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAnimating])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 700
    const height = 400
    const margin = { top: 40, right: 40, bottom: 60, left: 80 }

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain(inputRange)
      .range([margin.left, width - margin.right])

    const yExtent = d3.extent(plotData, d => {
      return Math.max(...selectedActivations.map(name => Math.abs(d[name] || 0)))
    }) as [number, number]

    const yScale = d3.scaleLinear()
      .domain([-yExtent[1] * 1.1, yExtent[1] * 1.1])
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
      .text('Input (x)')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text(showDerivatives ? "f'(x)" : 'f(x)')

    // Add zero lines
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2')

    svg.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '2,2')

    // Create line generator
    const line = d3.line<ActivationData>()
      .x(d => xScale(d.x))
      .y(d => yScale(d[selectedActivations[0]] || 0))
      .curve(d3.curveMonotoneX)

    // Plot activation functions
    selectedActivations.forEach(name => {
      if (!activationFunctions[name]) return

      const lineGenerator = d3.line<ActivationData>()
        .x(d => xScale(d.x))
        .y(d => yScale(d[name] || 0))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(plotData)
        .attr('fill', 'none')
        .attr('stroke', activationFunctions[name].color)
        .attr('stroke-width', 2.5)
        .attr('opacity', 0.8)
        .attr('d', lineGenerator)

      // Add hover points
      svg.selectAll(`.point-${name}`)
        .data(plotData.filter((_, i) => i % 10 === 0))
        .enter()
        .append('circle')
        .attr('class', `point-${name}`)
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d[name] || 0))
        .attr('r', 3)
        .attr('fill', activationFunctions[name].color)
        .attr('opacity', 0)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 1)

          // Show tooltip
          const tooltip = svg.append('g')
            .attr('id', 'tooltip')
            .attr('transform', `translate(${xScale(d.x) + 10},${yScale(d[name] || 0) - 10})`)

          tooltip.append('rect')
            .attr('width', 120)
            .attr('height', 50)
            .attr('fill', 'white')
            .attr('stroke', '#333')
            .attr('rx', 4)

          tooltip.append('text')
            .attr('x', 6)
            .attr('y', 15)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(activationFunctions[name].name)

          tooltip.append('text')
            .attr('x', 6)
            .attr('y', 30)
            .style('font-size', '11px')
            .text(`x: ${d.x.toFixed(2)}`)

          tooltip.append('text')
            .attr('x', 6)
            .attr('y', 42)
            .style('font-size', '11px')
            .text(`y: ${(d[name] || 0).toFixed(3)}`)
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 0)
          svg.select('#tooltip').remove()
        })
    })

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 180}, ${margin.top})`)

    selectedActivations.forEach((name, i) => {
      if (!activationFunctions[name]) return

      legend.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', i * 25 + 10)
        .attr('y2', i * 25 + 10)
        .attr('stroke', activationFunctions[name].color)
        .attr('stroke-width', 3)

      legend.append('text')
        .attr('x', 25)
        .attr('y', i * 25 + 15)
        .style('font-size', '12px')
        .text(activationFunctions[name].name)
    })

  }, [plotData, selectedActivations, inputRange, showDerivatives, activationFunctions])

  useEffect(() => {
    if (!distributionRef.current || !distributionData.length) return

    const svg = d3.select(distributionRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    // Find overall extent
    const allBins = distributionData.flatMap(d => d?.bins || [])
    const xExtent = d3.extent(allBins, d => d.x0) as [number, number]
    const yMax = d3.max(allBins, d => d.density) || 0

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Plot distributions
    distributionData.forEach((data, funcIndex) => {
      if (!data) return

      svg.selectAll(`.bar-${funcIndex}`)
        .data(data.bins)
        .enter()
        .append('rect')
        .attr('class', `bar-${funcIndex}`)
        .attr('x', d => xScale(d.x0))
        .attr('y', d => yScale(d.density))
        .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr('height', d => height - margin.bottom - yScale(d.density))
        .attr('fill', data.color)
        .attr('opacity', 0.6)
    })

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 100}, ${margin.top})`)

    distributionData.forEach((data, i) => {
      if (!data) return

      legend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', data.color)
        .attr('opacity', 0.6)

      legend.append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 12)
        .style('font-size', '12px')
        .text(data.name)
    })

  }, [distributionData])

  const learningObjectives = [
    "Compare modern activation functions used in LLMs",
    "Understand the benefits of gated linear units (GLU variants)",
    "Explore SwiGLU's advantages in large language models",
    "Analyze computational efficiency and gradient properties"
  ]

  return (
    <SimulationLayout
      title="Activation Functions"
      description="Interactive comparison of modern activation functions including SwiGLU and GELU"
      difficulty="Advanced"
      category="Model Internals"
      onPlay={() => setIsAnimating(!isAnimating)}
      onReset={() => {
        setSelectedActivations(['swiglu', 'gelu', 'relu'])
        setInputRange([-5, 5])
        setShowDerivatives(false)
        setBeta(1.0)
        setGateValue(0.5)
        setAnimationFrame(0)
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
              Function Selection
            </h3>

            <div className="space-y-3">
              {Object.entries(activationFunctions).map(([key, func]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedActivations.includes(key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActivations([...selectedActivations, key])
                      } else {
                        setSelectedActivations(selectedActivations.filter(f => f !== key))
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: func.color }}
                    />
                    <span className="text-sm font-medium">{func.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={20} />
              Visualization Options
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={inputRange[0]}
                    onChange={(e) => setInputRange([Number(e.target.value), inputRange[1]])}
                    className="p-2 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={inputRange[1]}
                    onChange={(e) => setInputRange([inputRange[0], Number(e.target.value)])}
                    className="p-2 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showDerivatives"
                  checked={showDerivatives}
                  onChange={(e) => setShowDerivatives(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showDerivatives" className="text-sm text-gray-700">
                  Show derivatives
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gate Value: {gateValue.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={gateValue}
                  onChange={(e) => setGateValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Affects SwiGLU and GeGLU
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Swish β: {beta.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={beta}
                  onChange={(e) => setBeta(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="mr-2 text-purple-600" size={20} />
              Function Details
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selectedActivations.map(name => {
                const func = activationFunctions[name]
                if (!func) return null

                return (
                  <div key={name} className="border-l-4 pl-3" style={{ borderColor: func.color }}>
                    <div className="font-medium text-sm">{func.name}</div>
                    <div className="text-xs text-gray-600 font-mono mt-1">
                      {func.formula}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {func.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Used in: {func.usedIn.join(', ')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showDerivatives ? 'Activation Function Derivatives' : 'Activation Functions'}
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={svgRef}
                width="700"
                height="400"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                {showDerivatives
                  ? "Function derivatives show gradient flow properties. Smooth derivatives help with training stability."
                  : "Compare activation function shapes and behaviors. Gated functions like SwiGLU provide selective information flow."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2 text-orange-600" size={20} />
                Output Distributions
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={distributionRef}
                  width="400"
                  height="300"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Output distributions for standard normal inputs. Different activations
                  shape the data distribution differently.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 text-yellow-600" size={20} />
                Properties Comparison
              </h3>

              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Function</th>
                        <th className="text-left py-2">Parameters</th>
                        <th className="text-left py-2">Smooth</th>
                        <th className="text-left py-2">Gated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedActivations.map(name => {
                        const func = activationFunctions[name]
                        if (!func) return null

                        return (
                          <tr key={name} className="border-b border-gray-100">
                            <td className="py-2 font-medium" style={{ color: func.color }}>
                              {func.name}
                            </td>
                            <td className="py-2">{func.parameters || 0}</td>
                            <td className="py-2">{['gelu', 'swish', 'mish', 'swiglu', 'geglu'].includes(name) ? '✓' : '✗'}</td>
                            <td className="py-2">{['swiglu', 'geglu'].includes(name) ? '✓' : '✗'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-gray-600 space-y-2">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium">SwiGLU Advantages:</div>
                    <div>• Gated architecture for selective activation</div>
                    <div>• Improved training dynamics</div>
                    <div>• Better performance in large models</div>
                    <div>• Used in PaLM, LaMDA, and other LLMs</div>
                  </div>

                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium">GLU Formula:</div>
                    <div className="font-mono text-xs">GLU(x, g) = activation(x) ⊙ g</div>
                    <div>Where x and g are computed from input via linear projections</div>
                  </div>
                </div>

                {isAnimating && (
                  <div className="text-center p-3 bg-yellow-50 rounded">
                    <div className="text-sm font-medium text-yellow-800">
                      Gate Animation Active
                    </div>
                    <div className="text-xs text-yellow-600">
                      Watch how gated functions respond to changing gate values
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