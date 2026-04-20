'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { BarChart3, Activity, Award, TrendingUp, Target, Zap } from 'lucide-react'

interface EvaluationMetric {
  name: string
  category: 'performance' | 'reliability' | 'efficiency' | 'quality'
  value: number
  target: number
  weight: number
  trend: number[]
}

interface AgentProfile {
  id: string
  name: string
  type: string
  description: string
  metrics: EvaluationMetric[]
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

interface BenchmarkTest {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  maxScore: number
  timeLimit: number
  criteria: string[]
}

const EVALUATION_FRAMEWORKS: Record<string, {
  name: string
  description: string
  metrics: Omit<EvaluationMetric, 'value' | 'trend'>[]
}> = {
  'comprehensive': {
    name: 'Comprehensive Agent Assessment',
    description: 'Multi-dimensional evaluation across all agent capabilities',
    metrics: [
      { name: 'Task Completion Rate', category: 'performance', target: 0.95, weight: 0.2 },
      { name: 'Response Accuracy', category: 'quality', target: 0.9, weight: 0.15 },
      { name: 'Error Recovery', category: 'reliability', target: 0.85, weight: 0.15 },
      { name: 'Resource Efficiency', category: 'efficiency', target: 0.8, weight: 0.1 },
      { name: 'Learning Speed', category: 'performance', target: 0.75, weight: 0.1 },
      { name: 'Consistency', category: 'reliability', target: 0.9, weight: 0.1 },
      { name: 'Adaptability', category: 'performance', target: 0.8, weight: 0.1 },
      { name: 'Safety Compliance', category: 'quality', target: 0.98, weight: 0.1 }
    ]
  },
  'task-specific': {
    name: 'Task-Specific Performance',
    description: 'Focused evaluation for specific task domains',
    metrics: [
      { name: 'Domain Expertise', category: 'quality', target: 0.9, weight: 0.3 },
      { name: 'Speed', category: 'efficiency', target: 0.85, weight: 0.25 },
      { name: 'Accuracy', category: 'quality', target: 0.95, weight: 0.25 },
      { name: 'Robustness', category: 'reliability', target: 0.8, weight: 0.2 }
    ]
  },
  'human-ai': {
    name: 'Human-AI Collaboration',
    description: 'Evaluation of agent effectiveness in human interaction contexts',
    metrics: [
      { name: 'Communication Clarity', category: 'quality', target: 0.9, weight: 0.2 },
      { name: 'User Satisfaction', category: 'quality', target: 0.85, weight: 0.2 },
      { name: 'Trust & Reliability', category: 'reliability', target: 0.9, weight: 0.2 },
      { name: 'Helpfulness', category: 'performance', target: 0.85, weight: 0.15 },
      { name: 'Response Time', category: 'efficiency', target: 0.8, weight: 0.15 },
      { name: 'Error Handling', category: 'reliability', target: 0.85, weight: 0.1 }
    ]
  }
}

const BENCHMARK_TESTS: BenchmarkTest[] = [
  {
    id: 'reasoning',
    name: 'Logical Reasoning',
    description: 'Multi-step logical problem solving',
    category: 'Cognitive',
    difficulty: 'hard',
    maxScore: 100,
    timeLimit: 300,
    criteria: ['Logical consistency', 'Step-by-step reasoning', 'Conclusion validity']
  },
  {
    id: 'creativity',
    name: 'Creative Problem Solving',
    description: 'Generate novel solutions to open-ended problems',
    category: 'Creative',
    difficulty: 'medium',
    maxScore: 100,
    timeLimit: 600,
    criteria: ['Originality', 'Feasibility', 'Relevance']
  },
  {
    id: 'knowledge',
    name: 'Domain Knowledge',
    description: 'Factual accuracy and domain expertise',
    category: 'Knowledge',
    difficulty: 'easy',
    maxScore: 100,
    timeLimit: 180,
    criteria: ['Factual accuracy', 'Depth of knowledge', 'Currency of information']
  },
  {
    id: 'communication',
    name: 'Communication Skills',
    description: 'Clear and effective information presentation',
    category: 'Social',
    difficulty: 'medium',
    maxScore: 100,
    timeLimit: 240,
    criteria: ['Clarity', 'Tone appropriateness', 'Information structure']
  },
  {
    id: 'adaptation',
    name: 'Contextual Adaptation',
    description: 'Adjust behavior based on context and feedback',
    category: 'Adaptive',
    difficulty: 'hard',
    maxScore: 100,
    timeLimit: 480,
    criteria: ['Context awareness', 'Behavioral flexibility', 'Learning from feedback']
  }
]

export default function EvaluationSimulation() {
  const [selectedFramework, setSelectedFramework] = useState<keyof typeof EVALUATION_FRAMEWORKS>('comprehensive')
  const [selectedAgent, setSelectedAgent] = useState(0)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const radarRef = useRef<SVGSVGElement>(null)
  const trendRef = useRef<SVGSVGElement>(null)
  const benchmarkRef = useRef<SVGSVGElement>(null)

  const framework = EVALUATION_FRAMEWORKS[selectedFramework]

  // Generate agent profiles
  const agentProfiles = useMemo((): AgentProfile[] => {
    const agentTypes = [
      { type: 'Research Assistant', description: 'Specialized in information gathering and analysis' },
      { type: 'Creative Writer', description: 'Focused on content creation and storytelling' },
      { type: 'Technical Support', description: 'Expert in troubleshooting and technical assistance' },
      { type: 'General Purpose', description: 'Balanced capabilities across multiple domains' }
    ]

    return agentTypes.map((agent, index) => {
      const metrics = framework.metrics.map(metric => ({
        ...metric,
        value: Math.max(0.3, Math.min(1, Math.random() * 1.2 - 0.1)),
        trend: Array.from({ length: 10 }, () => Math.random())
      }))

      const weightedScore = metrics.reduce((sum, metric) =>
        sum + (metric.value * metric.weight), 0
      )

      // Generate strengths and weaknesses
      const topMetrics = metrics
        .sort((a, b) => b.value - a.value)
        .slice(0, 2)
        .map(m => m.name)

      const weakMetrics = metrics
        .sort((a, b) => a.value - b.value)
        .slice(0, 2)
        .map(m => m.name)

      return {
        id: `agent-${index}`,
        name: `${agent.type} Agent`,
        type: agent.type,
        description: agent.description,
        metrics,
        overallScore: weightedScore,
        strengths: topMetrics,
        weaknesses: weakMetrics,
        recommendations: [
          `Improve ${weakMetrics[0]} through targeted training`,
          `Leverage ${topMetrics[0]} expertise for complex tasks`,
          'Regular performance monitoring and adjustment'
        ]
      }
    })
  }, [selectedFramework])

  // Radar chart visualization
  useEffect(() => {
    if (!radarRef.current || agentProfiles.length === 0) return

    const svg = d3.select(radarRef.current)
    svg.selectAll('*').remove()

    const width = 400
    const height = 400
    const margin = 40
    const radius = Math.min(width, height) / 2 - margin

    const centerX = width / 2
    const centerY = height / 2

    const agent = agentProfiles[selectedAgent]
    const metrics = agent.metrics

    const angleSlice = (Math.PI * 2) / metrics.length

    // Create scales
    const rScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, radius])

    // Draw background circles
    const levels = 5
    for (let i = 1; i <= levels; i++) {
      svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', (radius / levels) * i)
        .attr('fill', 'none')
        .attr('stroke', '#E5E7EB')
        .attr('stroke-width', 1)
    }

    // Draw axes
    metrics.forEach((metric, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const lineX = centerX + Math.cos(angle) * radius
      const lineY = centerY + Math.sin(angle) * radius

      svg.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', lineX)
        .attr('y2', lineY)
        .attr('stroke', '#D1D5DB')
        .attr('stroke-width', 1)

      // Add labels
      const labelX = centerX + Math.cos(angle) * (radius + 20)
      const labelY = centerY + Math.sin(angle) * (radius + 20)

      svg.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(metric.name.split(' ')[0])
    })

    // Draw data area
    const radarLine = d3.line<EvaluationMetric>()
      .x((d, i) => {
        const angle = angleSlice * i - Math.PI / 2
        return centerX + Math.cos(angle) * rScale(d.value)
      })
      .y((d, i) => {
        const angle = angleSlice * i - Math.PI / 2
        return centerY + Math.sin(angle) * rScale(d.value)
      })
      .curve(d3.curveLinearClosed)

    svg.append('path')
      .datum(metrics)
      .attr('d', radarLine)
      .attr('fill', '#3B82F6')
      .attr('fill-opacity', 0.2)
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)

    // Add target line
    const targetLine = d3.line<EvaluationMetric>()
      .x((d, i) => {
        const angle = angleSlice * i - Math.PI / 2
        return centerX + Math.cos(angle) * rScale(d.target)
      })
      .y((d, i) => {
        const angle = angleSlice * i - Math.PI / 2
        return centerY + Math.sin(angle) * rScale(d.target)
      })
      .curve(d3.curveLinearClosed)

    svg.append('path')
      .datum(metrics)
      .attr('d', targetLine)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')

    // Add data points
    metrics.forEach((metric, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const pointX = centerX + Math.cos(angle) * rScale(metric.value)
      const pointY = centerY + Math.sin(angle) * rScale(metric.value)

      svg.append('circle')
        .attr('cx', pointX)
        .attr('cy', pointY)
        .attr('r', 4)
        .attr('fill', '#3B82F6')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
    })

  }, [agentProfiles, selectedAgent])

  // Trend chart
  useEffect(() => {
    if (!trendRef.current || agentProfiles.length === 0) return

    const svg = d3.select(trendRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    const agent = agentProfiles[selectedAgent]
    const primaryMetric = agent.metrics[0]

    if (!primaryMetric.trend) return

    const xScale = d3.scaleLinear()
      .domain([0, primaryMetric.trend.length - 1])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.0%')))

    // Add multiple metric trends
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    agent.metrics.slice(0, 5).forEach((metric, index) => {
      const line = d3.line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX)

      svg.append('path')
        .datum(metric.trend)
        .attr('fill', 'none')
        .attr('stroke', colors[index])
        .attr('stroke-width', 2)
        .attr('d', line)
    })

    // Add legend
    agent.metrics.slice(0, 5).forEach((metric, index) => {
      const legendY = 20 + index * 20
      svg.append('circle')
        .attr('cx', width - 120)
        .attr('cy', legendY)
        .attr('r', 4)
        .attr('fill', colors[index])

      svg.append('text')
        .attr('x', width - 110)
        .attr('y', legendY + 4)
        .style('font-size', '12px')
        .text(metric.name.slice(0, 15))
    })

  }, [agentProfiles, selectedAgent])

  // Benchmark chart
  useEffect(() => {
    if (!benchmarkRef.current) return

    const svg = d3.select(benchmarkRef.current)
    svg.selectAll('*').remove()

    const width = 500
    const height = 300
    const margin = { top: 20, right: 20, bottom: 60, left: 60 }

    // Generate benchmark scores
    const scores = BENCHMARK_TESTS.map(test => ({
      ...test,
      score: Math.random() * 100,
      agentScores: agentProfiles.map(() => Math.random() * 100)
    }))

    const xScale = d3.scaleBand()
      .domain(scores.map(s => s.name))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Add bars for selected agent
    svg.selectAll('.benchmark-bar')
      .data(scores)
      .enter()
      .append('rect')
      .attr('class', 'benchmark-bar')
      .attr('x', d => xScale(d.name)!)
      .attr('y', d => yScale(d.agentScores[selectedAgent]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.agentScores[selectedAgent]))
      .attr('fill', '#3B82F6')
      .attr('opacity', 0.8)

    // Add score labels
    svg.selectAll('.score-label')
      .data(scores)
      .enter()
      .append('text')
      .attr('class', 'score-label')
      .attr('x', d => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.agentScores[selectedAgent]) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.agentScores[selectedAgent].toFixed(0))

  }, [agentProfiles, selectedAgent])

  const handleRunBenchmark = (testId: string) => {
    setCurrentTest(testId)
    setIsEvaluating(true)

    // Simulate benchmark running
    setTimeout(() => {
      setIsEvaluating(false)
      setCurrentTest(null)
    }, 3000)
  }

  const learningObjectives = [
    "Understand different agent evaluation methodologies",
    "Learn about performance metrics and benchmarking",
    "Explore multi-dimensional assessment frameworks",
    "See how evaluation drives agent improvement"
  ]

  return (
    <SimulationLayout
      title="Agent Evaluation & Benchmarking"
      description="Comprehensive evaluation frameworks for measuring agent performance and capabilities"
      difficulty="Advanced"
      category="Agents & Reasoning"
      onReset={() => {
        setSelectedAgent(0)
        setSelectedFramework('comprehensive')
        setIsEvaluating(false)
        setCurrentTest(null)
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2 text-blue-600" size={20} />
              Evaluation Framework
            </h3>

            <div className="space-y-3">
              {Object.entries(EVALUATION_FRAMEWORKS).map(([key, framework]) => (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name="framework"
                    value={key}
                    checked={selectedFramework === key}
                    onChange={() => setSelectedFramework(key as keyof typeof EVALUATION_FRAMEWORKS)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFramework === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-sm text-gray-900">
                      {framework.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {framework.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Agent Selection
            </h3>

            <div className="space-y-2">
              {agentProfiles.map((agent, index) => (
                <label key={agent.id} className="block">
                  <input
                    type="radio"
                    name="agent"
                    value={index}
                    checked={selectedAgent === index}
                    onChange={() => setSelectedAgent(index)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedAgent === index
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-medium text-sm text-gray-900">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Score: {(agent.overallScore * 100).toFixed(1)}%
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="mr-2 text-purple-600" size={20} />
              Quick Benchmark
            </h3>

            <div className="space-y-2">
              {BENCHMARK_TESTS.slice(0, 3).map((test) => (
                <button
                  key={test.id}
                  onClick={() => handleRunBenchmark(test.id)}
                  disabled={isEvaluating}
                  className={`w-full text-left p-2 rounded border transition-colors ${
                    currentTest === test.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isEvaluating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {test.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {test.difficulty} • {test.timeLimit}s
                  </div>
                </button>
              ))}
            </div>

            {isEvaluating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-700">
                    Running benchmark...
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Main Visualization */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="mr-2 text-blue-600" size={20} />
                Performance Radar Chart
              </h3>
              <div className="text-sm text-gray-600">
                Overall Score: {(agentProfiles[selectedAgent]?.overallScore * 100).toFixed(1)}%
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <svg
                  ref={radarRef}
                  width="400"
                  height="400"
                  className="w-full h-auto max-w-md"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Performance Metrics</h4>
                  <div className="space-y-2">
                    {agentProfiles[selectedAgent]?.metrics.map((metric) => (
                      <div key={metric.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{metric.name}:</span>
                        <div className="flex items-center space-x-2">
                          <div className={`text-sm font-mono ${
                            metric.value >= metric.target ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(metric.value * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            (target: {(metric.target * 100).toFixed(0)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium text-green-600">Strengths:</span>
                      <ul className="ml-4 list-disc">
                        {agentProfiles[selectedAgent]?.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Areas for Improvement:</span>
                      <ul className="ml-4 list-disc">
                        {agentProfiles[selectedAgent]?.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-4 h-1 bg-blue-500 mr-2"></div>
                <span>Current Performance</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-1 border-b-2 border-green-500 border-dashed mr-2"></div>
                <span>Target Performance</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-600" size={20} />
                Performance Trends
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={trendRef}
                  width="600"
                  height="300"
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 text-purple-600" size={20} />
                Benchmark Results
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={benchmarkRef}
                  width="500"
                  height="300"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="mr-2 text-yellow-600" size={20} />
              Improvement Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agentProfiles[selectedAgent]?.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                >
                  <div className="flex items-start">
                    <Zap size={16} className="text-yellow-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Evaluation Framework Details</h4>
              <p className="text-sm text-blue-800">
                {framework.description}
              </p>
              <div className="mt-2 text-xs text-blue-600">
                Total Metrics: {framework.metrics.length} |
                Weighted Scoring: {framework.metrics.reduce((sum, m) => sum + m.weight, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}