'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { Brain, CheckCircle, XCircle, RotateCcw, AlertTriangle, TrendingUp } from 'lucide-react'

interface ReflectionStep {
  id: string
  action: string
  outcome: 'success' | 'error' | 'suboptimal'
  confidence: number
  reflectionTrigger?: 'performance' | 'error' | 'uncertainty' | 'timeout'
  correction?: string
  timestamp: number
}

interface PerformanceMetric {
  accuracy: number
  efficiency: number
  confidence: number
  errorRate: number
}

const REFLECTION_SCENARIOS = {
  'problem-solving': {
    name: 'Mathematical Problem Solving',
    description: 'Agent solves complex math problems with self-correction',
    steps: [
      { action: 'Read problem: Find roots of x² + 5x + 6 = 0', outcome: 'success', confidence: 0.9 },
      { action: 'Apply quadratic formula', outcome: 'error', confidence: 0.7, reflectionTrigger: 'error' },
      { action: 'Reflect: Made calculation error in discriminant', outcome: 'success', confidence: 0.8 },
      { action: 'Recalculate: b² - 4ac = 25 - 24 = 1', outcome: 'success', confidence: 0.95 },
      { action: 'Find roots: x = (-5 ± 1)/2', outcome: 'success', confidence: 0.9 },
      { action: 'Verify: x = -2, x = -3', outcome: 'success', confidence: 0.95 }
    ]
  },
  'code-debugging': {
    name: 'Code Debugging',
    description: 'Agent debugs a function with iterative refinement',
    steps: [
      { action: 'Analyze function: binary search implementation', outcome: 'success', confidence: 0.8 },
      { action: 'Test with input [1,2,3,4,5], target=3', outcome: 'error', confidence: 0.6, reflectionTrigger: 'error' },
      { action: 'Reflect: Off-by-one error in boundary condition', outcome: 'success', confidence: 0.9 },
      { action: 'Fix: Change while(left <= right) logic', outcome: 'suboptimal', confidence: 0.7, reflectionTrigger: 'performance' },
      { action: 'Reflect: Still incorrect mid calculation', outcome: 'success', confidence: 0.85 },
      { action: 'Final fix: mid = left + (right - left) // 2', outcome: 'success', confidence: 0.95 }
    ]
  },
  'planning': {
    name: 'Task Planning',
    description: 'Agent plans a complex project with adaptive corrections',
    steps: [
      { action: 'Initial plan: Website redesign in 4 weeks', outcome: 'suboptimal', confidence: 0.6, reflectionTrigger: 'uncertainty' },
      { action: 'Reflect: Timeline too aggressive', outcome: 'success', confidence: 0.8 },
      { action: 'Revise: Extend to 6 weeks, add buffer time', outcome: 'success', confidence: 0.85 },
      { action: 'Allocate resources: 2 developers, 1 designer', outcome: 'suboptimal', confidence: 0.7, reflectionTrigger: 'performance' },
      { action: 'Reflect: Need UX specialist for user research', outcome: 'success', confidence: 0.9 },
      { action: 'Final plan: 6 weeks, 3 specialists, phased delivery', outcome: 'success', confidence: 0.95 }
    ]
  }
}

const CORRECTION_STRATEGIES = [
  'Error Detection & Rollback',
  'Performance Monitoring',
  'Confidence Thresholding',
  'Peer Review Simulation',
  'Iterative Refinement'
]

export default function ReflectionSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof REFLECTION_SCENARIOS>('problem-solving')
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showMetaAnalysis, setShowMetaAnalysis] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState(CORRECTION_STRATEGIES[0])
  const [executionHistory, setExecutionHistory] = useState<ReflectionStep[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const metricsRef = useRef<SVGSVGElement>(null)

  const scenario = REFLECTION_SCENARIOS[selectedScenario]

  const performanceMetrics = useMemo((): PerformanceMetric[] => {
    const steps = executionHistory.length > 0 ? executionHistory : scenario.steps
    return steps.map((_, index) => {
      const relevantSteps = steps.slice(0, index + 1)
      const successCount = relevantSteps.filter(s => s.outcome === 'success').length
      const errorCount = relevantSteps.filter(s => s.outcome === 'error').length

      return {
        accuracy: relevantSteps.length > 0 ? successCount / relevantSteps.length : 0,
        efficiency: Math.max(0, 1 - (errorCount * 0.2)),
        confidence: relevantSteps[relevantSteps.length - 1]?.confidence || 0,
        errorRate: relevantSteps.length > 0 ? errorCount / relevantSteps.length : 0
      }
    })
  }, [scenario.steps, executionHistory])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 400
    const margin = { top: 20, right: 20, bottom: 60, left: 80 }

    // Create step flow visualization
    const steps = executionHistory.length > 0 ? executionHistory : scenario.steps.slice(0, currentStep + 1)

    if (steps.length === 0) return

    const xScale = d3.scaleLinear()
      .domain([0, steps.length - 1])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `Step ${Number(d) + 1}`))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0%')))

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Execution Steps')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Confidence Level')

    // Create confidence line
    const line = d3.line<any>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.confidence))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(steps)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('d', line)

    // Add step points
    const circles = svg.selectAll('.step-point')
      .data(steps)
      .enter()
      .append('circle')
      .attr('class', 'step-point')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.confidence))
      .attr('r', 6)
      .attr('fill', d => {
        switch (d.outcome) {
          case 'success': return '#10B981'
          case 'error': return '#EF4444'
          case 'suboptimal': return '#F59E0B'
          default: return '#6B7280'
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Add reflection markers
    const reflectionSteps = steps.filter(s => s.reflectionTrigger)

    svg.selectAll('.reflection-marker')
      .data(reflectionSteps)
      .enter()
      .append('g')
      .attr('class', 'reflection-marker')
      .attr('transform', (d, i) => {
        const stepIndex = steps.findIndex(s => s === d)
        return `translate(${xScale(stepIndex)}, ${yScale(d.confidence) - 20})`
      })
      .append('path')
      .attr('d', 'M0,0 L-8,12 L8,12 Z')
      .attr('fill', '#8B5CF6')

    // Add hover interactions
    circles
      .on('mouseover', function(event, d) {
        // Create tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${d3.pointer(event, this)[0]}, ${d3.pointer(event, this)[1] - 30})`)

        const rect = tooltip.append('rect')
          .attr('x', -100)
          .attr('y', -40)
          .attr('width', 200)
          .attr('height', 60)
          .attr('fill', 'black')
          .attr('opacity', 0.8)
          .attr('rx', 4)

        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -20)
          .attr('fill', 'white')
          .style('font-size', '12px')
          .text(d.action.substring(0, 30) + '...')

        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -5)
          .attr('fill', 'white')
          .style('font-size', '10px')
          .text(`Confidence: ${(d.confidence * 100).toFixed(1)}%`)

        if (d.reflectionTrigger) {
          tooltip.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 10)
            .attr('fill', '#8B5CF6')
            .style('font-size', '10px')
            .text(`Reflected: ${d.reflectionTrigger}`)
        }
      })
      .on('mouseout', function() {
        svg.selectAll('.tooltip').remove()
      })

  }, [scenario.steps, currentStep, executionHistory])

  useEffect(() => {
    if (!metricsRef.current || performanceMetrics.length === 0) return

    const svg = d3.select(metricsRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    const xScale = d3.scaleLinear()
      .domain([0, performanceMetrics.length - 1])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${Number(d) + 1}`))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0%')))

    // Create lines for different metrics
    const metrics = ['accuracy', 'efficiency', 'confidence'] as const
    const colors = ['#10B981', '#3B82F6', '#8B5CF6']

    metrics.forEach((metric, index) => {
      const line = d3.line<PerformanceMetric>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d[metric]))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(performanceMetrics)
        .attr('fill', 'none')
        .attr('stroke', colors[index])
        .attr('stroke-width', 2)
        .attr('d', line)

      // Add legend
      const legendY = 20 + index * 20
      svg.append('circle')
        .attr('cx', width - 100)
        .attr('cy', legendY)
        .attr('r', 4)
        .attr('fill', colors[index])

      svg.append('text')
        .attr('x', width - 90)
        .attr('y', legendY + 4)
        .style('font-size', '12px')
        .text(metric.charAt(0).toUpperCase() + metric.slice(1))
    })

  }, [performanceMetrics])

  const handlePlay = () => {
    if (!isPlaying && currentStep < scenario.steps.length - 1) {
      setIsPlaying(true)
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= scenario.steps.length - 1) {
            setIsPlaying(false)
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 2000)
    }
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setExecutionHistory([])
  }

  const simulateReflection = () => {
    const newHistory: ReflectionStep[] = scenario.steps.map((step, index) => ({
      id: `step-${index}`,
      action: step.action,
      outcome: Math.random() > 0.7 ? 'error' : (step.outcome as 'success' | 'error' | 'suboptimal'),
      confidence: Math.max(0.3, step.confidence + (Math.random() - 0.5) * 0.3),
      reflectionTrigger: (step.reflectionTrigger as 'performance' | 'error' | 'uncertainty' | 'timeout' | undefined) || (Math.random() > 0.8 ? 'performance' : undefined),
      correction: step.reflectionTrigger ? `Applied ${selectedStrategy}` : undefined,
      timestamp: Date.now() + index * 1000
    }))

    setExecutionHistory(newHistory)
  }

  const learningObjectives = [
    "Understand how agents monitor their own performance",
    "Learn different error detection and correction strategies",
    "Explore meta-cognitive processes in AI systems",
    "See how self-reflection improves agent reliability"
  ]

  return (
    <SimulationLayout
      title="Self-Reflection & Correction"
      description="Explore how agents monitor performance and implement self-correction strategies"
      difficulty="Advanced"
      category="Agents & Reasoning"
      onPlay={handlePlay}
      onReset={handleReset}
      isPlaying={isPlaying}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="mr-2 text-purple-600" size={20} />
              Reflection Scenarios
            </h3>

            <div className="space-y-3">
              {Object.entries(REFLECTION_SCENARIOS).map(([key, scenario]) => (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name="scenario"
                    value={key}
                    checked={selectedScenario === key}
                    onChange={() => setSelectedScenario(key as keyof typeof REFLECTION_SCENARIOS)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedScenario === key
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-sm text-gray-900">
                      {scenario.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {scenario.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <RotateCcw className="mr-2 text-blue-600" size={20} />
              Correction Strategy
            </h3>

            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CORRECTION_STRATEGIES.map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>

            <button
              onClick={simulateReflection}
              className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <AlertTriangle size={16} className="mr-2" />
              Simulate Reflection
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-600" size={20} />
              Current Metrics
            </h3>

            <div className="space-y-3">
              {performanceMetrics.length > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Accuracy:</span>
                    <span className="text-sm font-mono font-medium">
                      {(performanceMetrics[performanceMetrics.length - 1]?.accuracy * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency:</span>
                    <span className="text-sm font-mono font-medium">
                      {(performanceMetrics[performanceMetrics.length - 1]?.efficiency * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-mono font-medium">
                      {(performanceMetrics[performanceMetrics.length - 1]?.confidence * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate:</span>
                    <span className="text-sm font-mono font-medium">
                      {(performanceMetrics[performanceMetrics.length - 1]?.errorRate * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reflection Process Timeline
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden mb-4">
              <svg
                ref={svgRef}
                width="800"
                height="400"
                className="w-full h-auto"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-green-600 mr-1" />
                  <span>Success</span>
                </div>
                <div className="flex items-center">
                  <XCircle size={16} className="text-red-600 mr-1" />
                  <span>Error</span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle size={16} className="text-yellow-600 mr-1" />
                  <span>Suboptimal</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 mr-1" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                  <span>Reflection</span>
                </div>
              </div>
              <div className="text-gray-600">
                Step {currentStep + 1} of {scenario.steps.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Trends
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={metricsRef}
                  width="400"
                  height="300"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step Details
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {(executionHistory.length > 0 ? executionHistory : scenario.steps.slice(0, currentStep + 1)).map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-l-4 ${
                      step.outcome === 'success'
                        ? 'border-green-500 bg-green-50'
                        : step.outcome === 'error'
                        ? 'border-red-500 bg-red-50'
                        : 'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {step.action}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                      <span>Confidence: {(step.confidence * 100).toFixed(1)}%</span>
                      {step.reflectionTrigger && (
                        <span className="text-purple-600 font-medium">
                          ↻ {step.reflectionTrigger}
                        </span>
                      )}
                    </div>
                    {'correction' in step && (step as ReflectionStep).correction && (
                      <div className="text-xs text-blue-600 mt-1 italic">
                        Correction: {(step as ReflectionStep).correction}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}