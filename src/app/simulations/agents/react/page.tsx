'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Brain,
  Play,
  Search,
  BookOpen,
  Calculator,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Settings,
  BarChart,
  Lightbulb,
  ArrowRight,
  Eye
} from 'lucide-react'

interface ReActStep {
  type: 'thought' | 'action' | 'observation'
  content: string
  timestamp: number
  confidence: number
  reasoning?: string
  actionType?: string
  observationSource?: string
  success?: boolean
}

interface Task {
  id: string
  title: string
  description: string
  goal: string
  complexity: number
  domain: string
  tools: string[]
  expectedSteps: number
}

const tasks: Task[] = [
  {
    id: 'research',
    title: 'Research Question',
    description: 'Find information about renewable energy adoption rates',
    goal: 'Determine the global adoption rate of renewable energy in 2023',
    complexity: 3,
    domain: 'Research',
    tools: ['web_search', 'calculator', 'data_analyzer'],
    expectedSteps: 8
  },
  {
    id: 'math_problem',
    title: 'Math Problem Solving',
    description: 'Solve a complex mathematical equation with multiple steps',
    goal: 'Find the value of x in: 2x² + 5x - 3 = 0',
    complexity: 2,
    domain: 'Mathematics',
    tools: ['calculator', 'equation_solver', 'graph_plotter'],
    expectedSteps: 6
  },
  {
    id: 'planning',
    title: 'Event Planning',
    description: 'Plan a company retreat for 50 people',
    goal: 'Create a complete plan for a 2-day company retreat',
    complexity: 4,
    domain: 'Planning',
    tools: ['web_search', 'calendar', 'budget_calculator', 'venue_finder'],
    expectedSteps: 12
  },
  {
    id: 'debugging',
    title: 'Code Debugging',
    description: 'Debug a Python program with multiple errors',
    goal: 'Fix all bugs in the given Python code',
    complexity: 3,
    domain: 'Programming',
    tools: ['code_analyzer', 'documentation', 'debugger', 'test_runner'],
    expectedSteps: 10
  }
]

const reActPatterns = [
  {
    id: 'standard',
    name: 'Standard ReAct',
    description: 'Classic Thought → Action → Observation pattern',
    ratio: { thought: 0.4, action: 0.3, observation: 0.3 }
  },
  {
    id: 'reasoning_heavy',
    name: 'Reasoning Heavy',
    description: 'More thoughts before each action',
    ratio: { thought: 0.6, action: 0.2, observation: 0.2 }
  },
  {
    id: 'action_oriented',
    name: 'Action Oriented',
    description: 'Quick actions with minimal reasoning',
    ratio: { thought: 0.2, action: 0.5, observation: 0.3 }
  },
  {
    id: 'exploratory',
    name: 'Exploratory',
    description: 'Many observations to understand the problem',
    ratio: { thought: 0.3, action: 0.2, observation: 0.5 }
  }
]

const tools = {
  web_search: { name: 'Web Search', icon: Search, description: 'Search for information online' },
  calculator: { name: 'Calculator', icon: Calculator, description: 'Perform mathematical calculations' },
  data_analyzer: { name: 'Data Analyzer', icon: BarChart, description: 'Analyze and interpret data' },
  equation_solver: { name: 'Equation Solver', icon: Calculator, description: 'Solve mathematical equations' },
  graph_plotter: { name: 'Graph Plotter', icon: BarChart, description: 'Create mathematical graphs' },
  calendar: { name: 'Calendar', icon: BookOpen, description: 'Manage dates and schedules' },
  budget_calculator: { name: 'Budget Calculator', icon: Calculator, description: 'Calculate costs and budgets' },
  venue_finder: { name: 'Venue Finder', icon: Search, description: 'Find suitable venues' },
  code_analyzer: { name: 'Code Analyzer', icon: Brain, description: 'Analyze code structure and issues' },
  documentation: { name: 'Documentation', icon: BookOpen, description: 'Access technical documentation' },
  debugger: { name: 'Debugger', icon: Play, description: 'Debug and trace code execution' },
  test_runner: { name: 'Test Runner', icon: CheckCircle, description: 'Run automated tests' }
}

export default function ReActSimulation() {
  const [selectedTask, setSelectedTask] = useState(tasks[0])
  const [selectedPattern, setSelectedPattern] = useState(reActPatterns[0])
  const [steps, setSteps] = useState<ReActStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(2000)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'pure_reasoning' | 'pure_acting'>('pure_reasoning')
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const flowRef = useRef<SVGSVGElement>(null)

  const generateReActSequence = (task: Task, pattern: typeof reActPatterns[0]) => {
    const sequence: ReActStep[] = []
    const totalSteps = task.expectedSteps

    let thoughtCount = Math.round(totalSteps * pattern.ratio.thought)
    let actionCount = Math.round(totalSteps * pattern.ratio.action)
    let observationCount = Math.round(totalSteps * pattern.ratio.observation)

    // Ensure we have at least one of each type
    thoughtCount = Math.max(1, thoughtCount)
    actionCount = Math.max(1, actionCount)
    observationCount = Math.max(1, observationCount)

    const templates = {
      thought: {
        research: [
          'I need to search for recent renewable energy statistics',
          'Let me break this down: I should look for global data from 2023',
          'The previous search gave me some info, but I need more specific data',
          'I should verify these numbers with another source',
          'Let me analyze what I&apos;ve found so far'
        ],
        math_problem: [
          'This is a quadratic equation, I can use the quadratic formula',
          'Let me identify the coefficients: a=2, b=5, c=-3',
          'I&apos;ll calculate the discriminant first',
          'Now I can find the two solutions',
          'Let me verify my answer by substitution'
        ],
        planning: [
          'I need to consider budget, location, and activities',
          'Let me research suitable venues first',
          'I should plan activities that engage all 50 people',
          'Budget planning is crucial - let me calculate costs',
          'I need to coordinate with catering and accommodation'
        ],
        debugging: [
          'Let me analyze the error message first',
          'This looks like a syntax error in line 15',
          'I should check the variable scope here',
          'The function call seems to have wrong parameters',
          'Let me run tests to confirm the fix works'
        ]
      },
      action: {
        research: [
          'Search: "renewable energy adoption rate 2023 global"',
          'Use data analyzer to process the statistics',
          'Search: "IEA renewable energy report 2023"',
          'Calculate percentage from the raw numbers',
          'Search for verification from multiple sources'
        ],
        math_problem: [
          'Calculate discriminant: b² - 4ac',
          'Apply quadratic formula for positive root',
          'Apply quadratic formula for negative root',
          'Verify solution by substituting back',
          'Plot the function to visualize roots'
        ],
        planning: [
          'Search for venues that accommodate 50 people',
          'Calculate budget for venue, food, and activities',
          'Create preliminary schedule for 2 days',
          'Research team building activities',
          'Contact top 3 venues for availability and pricing'
        ],
        debugging: [
          'Run code analyzer on the problematic file',
          'Check syntax for line 15 specifically',
          'Review function definition and calls',
          'Run debugger to trace execution',
          'Execute test suite to verify fixes'
        ]
      },
      observation: {
        research: [
          'Found: Global renewable capacity reached 3,372 GW in 2022',
          'Data shows 10.5% annual growth rate in renewables',
          'IEA reports renewables account for 30% of global electricity',
          'Multiple sources confirm similar adoption rates',
          'Analysis complete: renewable adoption is accelerating'
        ],
        math_problem: [
          'Discriminant = 25 + 24 = 49 (positive, two real roots)',
          'First root: x₁ = (-5 + 7) / 4 = 0.5',
          'Second root: x₂ = (-5 - 7) / 4 = -3',
          'Verification: 2(0.5)² + 5(0.5) - 3 = 0 ✓',
          'Graph shows parabola intersecting x-axis at -3 and 0.5'
        ],
        planning: [
          'Found 12 suitable venues within budget range',
          'Estimated total cost: $15,000-$20,000 for 50 people',
          'Best activities: outdoor challenges, workshops, dinner',
          'Top venue: Mountain Resort - available, $300/person',
          'All vendors contacted and confirmed availability'
        ],
        debugging: [
          'Code analyzer found 3 syntax errors and 2 logic issues',
          'Line 15: missing colon after if statement',
          'Function call missing required parameter "timeout"',
          'Variable "result" used before declaration',
          'All tests pass after applying fixes'
        ]
      }
    }

    // Generate sequence following the pattern
    for (let i = 0; i < totalSteps; i++) {
      let stepType: 'thought' | 'action' | 'observation'

      if (pattern.id === 'standard') {
        stepType = i % 3 === 0 ? 'thought' : i % 3 === 1 ? 'action' : 'observation'
      } else if (pattern.id === 'reasoning_heavy') {
        stepType = i < thoughtCount ? 'thought' :
                  i < thoughtCount + actionCount ? 'action' : 'observation'
      } else if (pattern.id === 'action_oriented') {
        stepType = i % 2 === 0 ? 'action' : i % 4 === 1 ? 'thought' : 'observation'
      } else {
        stepType = i % 3 === 0 ? 'observation' : i % 3 === 1 ? 'thought' : 'action'
      }

      const templateArray = templates[stepType][task.domain.toLowerCase() as keyof typeof templates.thought]
      const content = templateArray[Math.min(i, templateArray.length - 1)]

      sequence.push({
        type: stepType,
        content,
        timestamp: i * 1000,
        confidence: 0.7 + Math.random() * 0.3,
        success: Math.random() > 0.1,
        actionType: stepType === 'action' ? task.tools[Math.floor(Math.random() * task.tools.length)] : undefined,
        observationSource: stepType === 'observation' ? 'environment' : undefined
      })
    }

    return sequence
  }

  const executeNextStep = async () => {
    if (currentStep >= steps.length) {
      setIsRunning(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, animationSpeed))
    setCurrentStep(prev => prev + 1)
  }

  useEffect(() => {
    if (isRunning && currentStep < steps.length) {
      executeNextStep()
    } else if (currentStep >= steps.length && isRunning) {
      setIsRunning(false)
    }
  }, [isRunning, currentStep, steps.length, animationSpeed])

  useEffect(() => {
    const newSteps = generateReActSequence(selectedTask, selectedPattern)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [selectedTask, selectedPattern])

  // Keyboard shortcuts for better accessibility
  useEffect(() => {
    if (!keyboardShortcuts) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      switch (e.key) {
        case ' ': // Spacebar - Play/Pause
          e.preventDefault()
          if (!isRunning) {
            setCurrentStep(0)
            setIsRunning(true)
          } else {
            setIsRunning(false)
          }
          break
        case 'r': // R - Reset
          e.preventDefault()
          setIsRunning(false)
          setCurrentStep(0)
          const newSteps = generateReActSequence(selectedTask, selectedPattern)
          setSteps(newSteps)
          break
        case 'ArrowRight': // Right arrow - Next step (when paused)
          e.preventDefault()
          if (!isRunning && currentStep < steps.length) {
            setCurrentStep(prev => prev + 1)
          }
          break
        case 'ArrowLeft': // Left arrow - Previous step (when paused)
          e.preventDefault()
          if (!isRunning && currentStep > 0) {
            setCurrentStep(prev => prev - 1)
          }
          break
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault()
          const taskIndex = parseInt(e.key) - 1
          if (taskIndex < tasks.length) {
            setSelectedTask(tasks[taskIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isRunning, currentStep, steps.length, keyboardShortcuts])

  useEffect(() => {
    if (!svgRef.current || steps.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 500
    const margin = { top: 40, right: 40, bottom: 60, left: 80 }

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, steps.length - 1])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleBand()
      .domain(['thought', 'action', 'observation'])
      .range([margin.top, height - margin.bottom])
      .padding(0.2)

    const colorScale = d3.scaleOrdinal()
      .domain(['thought', 'action', 'observation'])
      .range(['#8b5cf6', '#f59e0b', '#10b981'])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${Number(d) + 1}`))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'black')
      .text('Step Number')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Add step nodes
    steps.forEach((step, index) => {
      const x = xScale(index)
      const y = (yScale(step.type) || 0) + yScale.bandwidth() / 2
      const isActive = index === currentStep - 1 && isRunning
      const isCompleted = index < currentStep
      const radius = isActive ? 12 : 8

      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', radius)
        .attr('fill', colorScale(step.type) as string)
        .attr('opacity', isCompleted ? 1 : isActive ? 0.8 : 0.3)
        .attr('stroke', isActive ? '#ffffff' : 'none')
        .attr('stroke-width', isActive ? 3 : 0)
        .style('filter', isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none')

      // Add connections
      if (index > 0) {
        const prevX = xScale(index - 1)
        const prevStep = steps[index - 1]
        const prevY = (yScale(prevStep.type) || 0) + yScale.bandwidth() / 2

        svg.append('line')
          .attr('x1', prevX)
          .attr('y1', prevY)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#d1d5db')
          .attr('stroke-width', 2)
          .attr('opacity', isCompleted ? 0.8 : 0.3)
      }

      // Add step labels for active/recent steps
      if (isActive || (index === currentStep - 2)) {
        svg.append('text')
          .attr('x', x)
          .attr('y', y - radius - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('font-weight', 'bold')
          .style('fill', colorScale(step.type) as string)
          .text(step.type.toUpperCase())
      }
    })

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 200}, ${margin.top})`)

    ;['thought', 'action', 'observation'].forEach((type, index) => {
      legend.append('circle')
        .attr('cx', 10)
        .attr('cy', index * 25 + 10)
        .attr('r', 6)
        .attr('fill', colorScale(type) as string)

      legend.append('text')
        .attr('x', 25)
        .attr('y', index * 25 + 15)
        .style('font-size', '12px')
        .style('text-transform', 'capitalize')
        .text(type)
    })

  }, [steps, currentStep, isRunning])

  useEffect(() => {
    if (!flowRef.current || steps.length === 0) return

    const svg = d3.select(flowRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400
    const margin = 40

    // Calculate step type counts
    const counts = {
      thought: steps.filter(s => s.type === 'thought').length,
      action: steps.filter(s => s.type === 'action').length,
      observation: steps.filter(s => s.type === 'observation').length
    }

    const total = steps.length
    const angles = {
      thought: (counts.thought / total) * 2 * Math.PI,
      action: (counts.action / total) * 2 * Math.PI,
      observation: (counts.observation / total) * 2 * Math.PI
    }

    const colors = {
      thought: '#8b5cf6',
      action: '#f59e0b',
      observation: '#10b981'
    }

    const centerX = width / 2
    const centerY = height / 2
    const radius = 120

    // Draw pie chart
    let startAngle = -Math.PI / 2
    Object.entries(counts).forEach(([type, count]) => {
      const endAngle = startAngle + angles[type as keyof typeof angles]

      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(endAngle)

      svg.append('path')
        .attr('d', arc as any)
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .attr('fill', colors[type as keyof typeof colors])
        .attr('opacity', 0.8)

      // Add labels
      const labelAngle = (startAngle + endAngle) / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30)

      svg.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', colors[type as keyof typeof colors])
        .text(`${type} (${count})`)

      startAngle = endAngle
    })

    // Add center label
    svg.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('ReAct Pattern')

  }, [steps])

  const learningObjectives = [
    "Understand how ReAct combines reasoning and acting for enhanced problem-solving",
    "Compare different ReAct patterns and their effectiveness",
    "Explore the interleaved nature of thoughts, actions, and observations",
    "Learn how reasoning guides action selection in complex tasks"
  ]

  return (
    <SimulationLayout
      title="ReAct Framework"
      description="Explore Reasoning + Acting interleaved for enhanced AI problem-solving"
      difficulty="Intermediate"
      category="Agent Reasoning"
      onPlay={() => {
        if (!isRunning) {
          setCurrentStep(0)
          setIsRunning(true)
        } else {
          setIsRunning(false)
        }
      }}
      onReset={() => {
        setIsRunning(false)
        setCurrentStep(0)
        const newSteps = generateReActSequence(selectedTask, selectedPattern)
        setSteps(newSteps)
      }}
      showControls={true}
      learningObjectives={learningObjectives}
      isPlaying={isRunning}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="mr-2 text-blue-600" size={20} />
              Task Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task
                </label>
                <select
                  value={selectedTask.id}
                  onChange={(e) => {
                    const task = tasks.find(t => t.id === e.target.value)
                    if (task) setSelectedTask(task)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedTask.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ReAct Pattern
                </label>
                <select
                  value={selectedPattern.id}
                  onChange={(e) => {
                    const pattern = reActPatterns.find(p => p.id === e.target.value)
                    if (pattern) setSelectedPattern(pattern)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {reActPatterns.map(pattern => (
                    <option key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedPattern.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {animationSpeed}ms
                </label>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="500"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showComparison"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showComparison" className="text-sm text-gray-700">
                  Show comparison
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keyboardShortcuts"
                  checked={keyboardShortcuts}
                  onChange={(e) => setKeyboardShortcuts(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="keyboardShortcuts" className="text-sm text-gray-700">
                  Enable keyboard shortcuts
                </label>
              </div>
            </div>

            {keyboardShortcuts && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">Keyboard Shortcuts</div>
                <div className="text-xs text-blue-800 space-y-1">
                  <div><kbd className="px-1 py-0.5 bg-white rounded text-xs">Space</kbd> Play/Pause</div>
                  <div><kbd className="px-1 py-0.5 bg-white rounded text-xs">R</kbd> Reset</div>
                  <div><kbd className="px-1 py-0.5 bg-white rounded text-xs">←→</kbd> Step navigation</div>
                  <div><kbd className="px-1 py-0.5 bg-white rounded text-xs">1-4</kbd> Switch tasks</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="mr-2 text-yellow-600" size={20} />
              Current Task
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 text-sm">
                  {selectedTask.goal}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium text-gray-700">Domain</div>
                  <div className="text-sm text-gray-600">{selectedTask.domain}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Complexity</div>
                  <div className="flex items-center space-x-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < selectedTask.complexity ? 'bg-orange-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedTask.complexity}/5
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Available Tools</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tools.map(toolId => {
                      const tool = tools[toolId as keyof typeof tools]
                      const IconComponent = tool.icon
                      return (
                        <div
                          key={toolId}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs"
                        >
                          <IconComponent size={12} />
                          <span>{tool.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progress
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{steps.length > 0 ? Math.round((currentStep / steps.length) * 100) : 0}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${steps.length > 0 ? (currentStep / steps.length) * 100 : 0}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="p-2 bg-purple-50 rounded">
                  <div className="font-medium text-purple-600">
                    {steps.filter(s => s.type === 'thought').length}
                  </div>
                  <div className="text-gray-600">Thoughts</div>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <div className="font-medium text-orange-600">
                    {steps.filter(s => s.type === 'action').length}
                  </div>
                  <div className="text-gray-600">Actions</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-medium text-green-600">
                    {steps.filter(s => s.type === 'observation').length}
                  </div>
                  <div className="text-gray-600">Observations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ReAct Execution Timeline
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={svgRef}
                width="800"
                height="500"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                The timeline shows the interleaved pattern of thoughts (reasoning),
                actions (tool use), and observations (environment feedback) in the ReAct framework.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Step Details
              </h3>

              <AnimatePresence mode="wait">
                {currentStep > 0 && currentStep <= steps.length && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                      <div className="flex items-center space-x-2 mb-2">
                        {steps[currentStep - 1].type === 'thought' && <Brain className="text-purple-600" size={18} />}
                        {steps[currentStep - 1].type === 'action' && <Play className="text-orange-600" size={18} />}
                        {steps[currentStep - 1].type === 'observation' && <Eye className="text-green-600" size={18} />}
                        <div className="font-medium text-gray-900 capitalize">
                          {steps[currentStep - 1].type}
                        </div>
                        <div className="text-xs text-gray-500">
                          Step {currentStep}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {steps[currentStep - 1].content}
                      </div>

                      {isRunning && currentStep === steps.length && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center text-green-700 text-sm">
                            <CheckCircle size={16} className="mr-2" />
                            Execution complete! All {steps.length} steps processed.
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Confidence: {(steps[currentStep - 1].confidence * 100).toFixed(0)}%
                        </div>
                        {steps[currentStep - 1].actionType && (
                          <div className="flex items-center space-x-1 text-xs text-orange-600">
                            <span>Tool:</span>
                            <span className="font-medium">
                              {tools[steps[currentStep - 1].actionType as keyof typeof tools]?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent steps context */}
                    {currentStep > 1 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Recent Steps</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {steps.slice(Math.max(0, currentStep - 4), currentStep - 1).map((step, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  step.type === 'thought' ? 'bg-purple-400' :
                                  step.type === 'action' ? 'bg-orange-400' : 'bg-green-400'
                                }`} />
                                <span className="capitalize font-medium">{step.type}:</span>
                              </div>
                              <div className="mt-1 text-gray-600">
                                {step.content.slice(0, 60)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {currentStep === 0 && !isRunning && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="mx-auto mb-2" size={32} />
                  <p>Click Play to start the ReAct execution</p>
                </div>
              )}

              {currentStep >= steps.length && (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto mb-2 text-green-600" size={32} />
                  <p className="text-green-600 font-medium">Task Completed!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Successfully executed {steps.length} steps using the ReAct framework
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pattern Analysis
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={flowRef}
                  width="600"
                  height="400"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-1">Pattern: {selectedPattern.name}</div>
                  <div className="text-gray-600">{selectedPattern.description}</div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2 bg-purple-50 rounded text-center">
                    <div className="font-bold text-purple-600">
                      {Math.round(selectedPattern.ratio.thought * 100)}%
                    </div>
                    <div className="text-gray-600">Thinking</div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded text-center">
                    <div className="font-bold text-orange-600">
                      {Math.round(selectedPattern.ratio.action * 100)}%
                    </div>
                    <div className="text-gray-600">Acting</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="font-bold text-green-600">
                      {Math.round(selectedPattern.ratio.observation * 100)}%
                    </div>
                    <div className="text-gray-600">Observing</div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded">
                  <div className="font-medium mb-1">ReAct Benefits:</div>
                  <div>• Combines reasoning with real-world interaction</div>
                  <div>• Allows course correction based on observations</div>
                  <div>• More robust than pure reasoning or pure acting</div>
                  <div>• Enables complex multi-step problem solving</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}