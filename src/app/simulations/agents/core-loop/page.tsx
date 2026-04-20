'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Eye,
  Brain,
  Play,
  RotateCcw,
  Settings,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface AgentState {
  observations: string[]
  thoughts: string[]
  actions: string[]
  reflections: string[]
  currentStep: 'observe' | 'think' | 'act' | 'reflect' | 'idle'
  stepCount: number
  environment: {
    goal: string
    obstacles: string[]
    resources: string[]
    feedback: string
  }
}

interface StepExecution {
  step: string
  content: string
  timestamp: number
  success: boolean
  confidence: number
}

const scenarios = [
  {
    id: 'navigation',
    name: 'Robot Navigation',
    description: 'A robot navigating through a maze to reach a target',
    goal: 'Navigate to the blue target while avoiding obstacles',
    initialObservations: ['Current position: (0, 0)', 'Target visible at (5, 3)', 'Wall detected ahead'],
    obstacles: ['Walls blocking direct path', 'Moving obstacles', 'Sensor noise'],
    resources: ['GPS sensor', 'Distance sensor', 'Movement actuators']
  },
  {
    id: 'assistant',
    name: 'AI Assistant',
    description: 'An AI assistant helping a user with task planning',
    goal: 'Help user plan their day effectively',
    initialObservations: ['User has 5 meetings today', 'Calendar shows free slots', 'Previous tasks incomplete'],
    obstacles: ['Conflicting priorities', 'Limited time', 'Dependencies between tasks'],
    resources: ['Calendar access', 'Task database', 'Priority rules']
  },
  {
    id: 'game',
    name: 'Game Playing Agent',
    description: 'An agent learning to play a strategy game',
    goal: 'Maximize game score while learning opponent patterns',
    initialObservations: ['Game state: turn 1', 'Opponent moved first', 'Multiple strategies available'],
    obstacles: ['Unknown opponent strategy', 'Complex game tree', 'Time pressure'],
    resources: ['Game rules', 'Move evaluator', 'Pattern recognizer']
  }
]

const agentPersonalities = [
  {
    id: 'cautious',
    name: 'Cautious',
    description: 'Careful, thorough analysis before acting',
    thinkingStyle: 'Takes extra time to consider all options',
    actionStyle: 'Prefers safe, incremental actions',
    reflectionStyle: 'Deep analysis of what went wrong'
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Quick decisions, bold actions',
    thinkingStyle: 'Fast heuristic-based decisions',
    actionStyle: 'Takes risks for bigger rewards',
    reflectionStyle: 'Focuses on what worked well'
  },
  {
    id: 'analytical',
    name: 'Analytical',
    description: 'Data-driven, systematic approach',
    thinkingStyle: 'Quantifies options and probabilities',
    actionStyle: 'Chooses statistically optimal actions',
    reflectionStyle: 'Updates models based on outcomes'
  }
]

export default function CoreAgentLoopSimulation() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0])
  const [selectedPersonality, setSelectedPersonality] = useState(agentPersonalities[0])
  const [agentState, setAgentState] = useState<AgentState>({
    observations: [],
    thoughts: [],
    actions: [],
    reflections: [],
    currentStep: 'idle',
    stepCount: 0,
    environment: {
      goal: scenarios[0].goal,
      obstacles: scenarios[0].obstacles,
      resources: scenarios[0].resources,
      feedback: ''
    }
  })
  const [isRunning, setIsRunning] = useState(false)
  const [stepHistory, setStepHistory] = useState<StepExecution[]>([])
  const [animationSpeed, setAnimationSpeed] = useState(2000)
  const [showDetails, setShowDetails] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<SVGSVGElement>(null)

  const currentStepIndex = useMemo(() => {
    const steps = ['observe', 'think', 'act', 'reflect']
    return steps.indexOf(agentState.currentStep)
  }, [agentState.currentStep])

  // Generate dynamic content based on scenario and personality
  const generateContent = (step: string, stepCount: number) => {
    const scenario = selectedScenario
    const personality = selectedPersonality

    const templates = {
      observe: {
        navigation: [
          'Sensor readings: Clear path to the right',
          'Detected: Wall 2 meters ahead',
          'Target bearing: 45 degrees northeast',
          'Battery level: 85%'
        ],
        assistant: [
          'User calendar updated with new meeting',
          'Email received: Urgent project deadline',
          'Task completion rate: 60% today',
          'Available time slot: 2-3 PM'
        ],
        game: [
          'Opponent moved queen to center',
          'Material advantage: Equal',
          'Time remaining: 15 minutes',
          'Pattern recognized: Aggressive opening'
        ]
      },
      think: {
        cautious: [
          'Analyzing all possible outcomes...',
          'Considering safety implications',
          'Weighing risks vs benefits',
          'Need more information before deciding'
        ],
        aggressive: [
          'Quick heuristic suggests best move',
          'High reward opportunity detected',
          'Time to take decisive action',
          'Bold move could pay off'
        ],
        analytical: [
          'Calculating probability distributions',
          'Running optimization algorithm',
          'Updating decision tree model',
          'Statistical confidence: 87%'
        ]
      },
      act: {
        navigation: [
          'Moving forward 1 meter',
          'Rotating 30 degrees clockwise',
          'Activating obstacle avoidance',
          'Requesting updated sensor data'
        ],
        assistant: [
          'Scheduling meeting in optimal slot',
          'Prioritizing tasks by urgency',
          'Sending reminder to user',
          'Blocking conflicting time slots'
        ],
        game: [
          'Moving knight to attack position',
          'Developing piece toward center',
          'Castling for king safety',
          'Capturing opponent piece'
        ]
      },
      reflect: {
        navigation: [
          'Action successful: Path clear',
          'Need better obstacle detection',
          'Target distance reduced by 1.2m',
          'Efficiency could be improved'
        ],
        assistant: [
          'User satisfaction increased',
          'Task completion on schedule',
          'Could have suggested alternatives',
          'Pattern learned: User prefers morning meetings'
        ],
        game: [
          'Position evaluation: +0.3 pawns',
          'Opponent responded as expected',
          'Should have considered defensive move',
          'Time management was good'
        ]
      }
    }

    if (step === 'observe') {
      return templates.observe[scenario.id as keyof typeof templates.observe]?.[stepCount % 4] || 'Observing environment...'
    } else if (step === 'think') {
      return templates.think[personality.id as keyof typeof templates.think]?.[stepCount % 4] || 'Thinking about next action...'
    } else if (step === 'act') {
      return templates.act[scenario.id as keyof typeof templates.act]?.[stepCount % 4] || 'Executing action...'
    } else if (step === 'reflect') {
      return templates.reflect[scenario.id as keyof typeof templates.reflect]?.[stepCount % 4] || 'Reflecting on results...'
    }

    return 'Processing...'
  }

  const executeStep = async (step: string) => {
    const content = generateContent(step, agentState.stepCount)
    const confidence = 0.6 + Math.random() * 0.4
    const success = Math.random() > 0.2 // 80% success rate

    const execution: StepExecution = {
      step,
      content,
      timestamp: Date.now(),
      success,
      confidence
    }

    setStepHistory(prev => [...prev.slice(-20), execution])

    setAgentState(prev => {
      const newState = { ...prev }

      if (step === 'observe') {
        newState.observations = [...prev.observations.slice(-5), content]
      } else if (step === 'think') {
        newState.thoughts = [...prev.thoughts.slice(-5), content]
      } else if (step === 'act') {
        newState.actions = [...prev.actions.slice(-5), content]
      } else if (step === 'reflect') {
        newState.reflections = [...prev.reflections.slice(-5), content]
      }

      return newState
    })

    // Simulate environment feedback
    const feedbackMessages = {
      navigation: ['Path clear ahead', 'Obstacle detected', 'Getting closer to target', 'Sensor calibrated'],
      assistant: ['Meeting scheduled', 'Calendar updated', 'User notification sent', 'Task prioritized'],
      game: ['Good move!', 'Opponent thinking...', 'Position improved', 'Time pressure increasing']
    }

    const feedback = feedbackMessages[selectedScenario.id as keyof typeof feedbackMessages]?.[Math.floor(Math.random() * 4)] || 'Environment updated'

    setAgentState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        feedback
      }
    }))
  }

  const runAgentLoop = async () => {
    const steps = ['observe', 'think', 'act', 'reflect']

    for (const step of steps) {
      if (!isRunning) break

      setAgentState(prev => ({ ...prev, currentStep: step as any }))
      await new Promise(resolve => setTimeout(resolve, animationSpeed))

      await executeStep(step)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (isRunning) {
      setAgentState(prev => ({
        ...prev,
        currentStep: 'idle',
        stepCount: prev.stepCount + 1
      }))
    }
  }

  useEffect(() => {
    if (isRunning) {
      runAgentLoop()
    }
  }, [isRunning, agentState.stepCount])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400
    const centerX = width / 2
    const centerY = height / 2
    const radius = 120

    // Draw central circle (agent)
    svg.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 40)
      .attr('fill', isRunning ? '#3b82f6' : '#6b7280')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))')

    svg.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text('Agent')

    // Draw step circles
    const steps = [
      { name: 'Observe', icon: Eye, angle: -Math.PI / 2, color: '#10b981' },
      { name: 'Think', icon: Brain, angle: 0, color: '#8b5cf6' },
      { name: 'Act', icon: Play, angle: Math.PI / 2, color: '#f59e0b' },
      { name: 'Reflect', icon: RotateCcw, angle: Math.PI, color: '#ef4444' }
    ]

    steps.forEach((step, index) => {
      const x = centerX + radius * Math.cos(step.angle)
      const y = centerY + radius * Math.sin(step.angle)
      const isActive = currentStepIndex === index && isRunning
      const isCompleted = currentStepIndex > index || (currentStepIndex === index && agentState.currentStep === 'idle')

      // Step circle
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 30)
        .attr('fill', isActive ? step.color : (isCompleted ? step.color : '#e5e7eb'))
        .attr('stroke', isActive ? '#ffffff' : step.color)
        .attr('stroke-width', isActive ? 3 : 2)
        .attr('opacity', isActive ? 1 : (isCompleted ? 0.8 : 0.5))
        .style('filter', isActive ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'none')

      // Step label
      svg.append('text')
        .attr('x', x)
        .attr('y', y + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', isActive ? 'bold' : 'normal')
        .style('fill', isActive ? step.color : '#6b7280')
        .text(step.name)

      // Connection lines
      const nextIndex = (index + 1) % steps.length
      const nextStep = steps[nextIndex]
      const nextX = centerX + radius * Math.cos(nextStep.angle)
      const nextY = centerY + radius * Math.sin(nextStep.angle)

      svg.append('path')
        .attr('d', `M ${x} ${y} Q ${centerX * 1.2} ${centerY * 1.2} ${nextX} ${nextY}`)
        .attr('fill', 'none')
        .attr('stroke', '#d1d5db')
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)

      // Arrow marker
      if (isActive && isRunning) {
        const arrowX = centerX + (radius - 10) * Math.cos(nextStep.angle)
        const arrowY = centerY + (radius - 10) * Math.sin(nextStep.angle)

        svg.append('polygon')
          .attr('points', '0,0 8,3 0,6 1,3')
          .attr('transform', `translate(${arrowX},${arrowY}) rotate(${nextStep.angle * 180 / Math.PI + 90})`)
          .attr('fill', step.color)
      }
    })

  }, [agentState.currentStep, isRunning, currentStepIndex])

  useEffect(() => {
    if (!timelineRef.current || stepHistory.length === 0) return

    const svg = d3.select(timelineRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 200
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    const xScale = d3.scaleLinear()
      .domain([0, stepHistory.length - 1])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleBand()
      .domain(['observe', 'think', 'act', 'reflect'])
      .range([margin.top, height - margin.bottom])
      .padding(0.1)

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `Step ${Number(d) + 1}`))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Add timeline dots
    stepHistory.forEach((execution, index) => {
      const x = xScale(index)
      const y = (yScale(execution.step) || 0) + yScale.bandwidth() / 2
      const color = execution.success ? '#10b981' : '#ef4444'

      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .attr('fill', color)
        .attr('opacity', 0.8)

      // Add hover tooltip
      svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 8)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          const tooltip = svg.append('g')
            .attr('id', 'timeline-tooltip')
            .attr('transform', `translate(${x + 10},${y - 10})`)

          tooltip.append('rect')
            .attr('width', 200)
            .attr('height', 60)
            .attr('fill', 'white')
            .attr('stroke', '#333')
            .attr('rx', 4)

          tooltip.append('text')
            .attr('x', 10)
            .attr('y', 15)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(execution.step.toUpperCase())

          tooltip.append('text')
            .attr('x', 10)
            .attr('y', 30)
            .style('font-size', '11px')
            .text(execution.content.slice(0, 30) + '...')

          tooltip.append('text')
            .attr('x', 10)
            .attr('y', 45)
            .style('font-size', '10px')
            .text(`Confidence: ${(execution.confidence * 100).toFixed(0)}%`)
        })
        .on('mouseout', function() {
          svg.select('#timeline-tooltip').remove()
        })
    })

  }, [stepHistory])

  const learningObjectives = [
    "Understand the fundamental Observe → Think → Act → Reflect cycle",
    "Explore how different agent personalities affect decision making",
    "See how agents adapt their behavior based on environment feedback",
    "Learn about the iterative nature of agent learning and improvement"
  ]

  return (
    <SimulationLayout
      title="Core Agent Loop"
      description="Explore the fundamental decision cycle that drives AI agent behavior"
      difficulty="Beginner"
      category="Agent Fundamentals"
      onPlay={() => setIsRunning(!isRunning)}
      onReset={() => {
        setIsRunning(false)
        setAgentState({
          observations: selectedScenario.initialObservations,
          thoughts: [],
          actions: [],
          reflections: [],
          currentStep: 'idle',
          stepCount: 0,
          environment: {
            goal: selectedScenario.goal,
            obstacles: selectedScenario.obstacles,
            resources: selectedScenario.resources,
            feedback: ''
          }
        })
        setStepHistory([])
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
              Scenario Setup
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario
                </label>
                <select
                  value={selectedScenario.id}
                  onChange={(e) => {
                    const scenario = scenarios.find(s => s.id === e.target.value)
                    if (scenario) setSelectedScenario(scenario)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {scenarios.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedScenario.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Personality
                </label>
                <select
                  value={selectedPersonality.id}
                  onChange={(e) => {
                    const personality = agentPersonalities.find(p => p.id === e.target.value)
                    if (personality) setSelectedPersonality(personality)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {agentPersonalities.map(personality => (
                    <option key={personality.id} value={personality.id}>
                      {personality.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedPersonality.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animation Speed: {animationSpeed}ms
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
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
                  id="showDetails"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showDetails" className="text-sm text-gray-700">
                  Show detailed logs
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Current Goal
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900 text-sm">
                  {agentState.environment.goal}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                <div className="text-sm text-gray-600">
                  Step {agentState.stepCount + 1} • {agentState.currentStep === 'idle' ? 'Ready' : agentState.currentStep.charAt(0).toUpperCase() + agentState.currentStep.slice(1)}
                </div>
              </div>

              {agentState.environment.feedback && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Environment</div>
                  <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                    {agentState.environment.feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="mr-2 text-purple-600" size={20} />
              Agent Traits
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-700">Thinking Style</div>
                <div className="text-gray-600">{selectedPersonality.thinkingStyle}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Action Style</div>
                <div className="text-gray-600">{selectedPersonality.actionStyle}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">Reflection Style</div>
                <div className="text-gray-600">{selectedPersonality.reflectionStyle}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Agent Decision Loop
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={svgRef}
                width="600"
                height="400"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                The agent continuously cycles through four phases: observing the environment,
                thinking about the situation, taking action, and reflecting on results.
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Step Details
                </h3>

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    {agentState.currentStep !== 'idle' && (
                      <motion.div
                        key={agentState.currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {agentState.currentStep === 'observe' && <Eye className="text-green-600" size={18} />}
                          {agentState.currentStep === 'think' && <Brain className="text-purple-600" size={18} />}
                          {agentState.currentStep === 'act' && <Play className="text-orange-600" size={18} />}
                          {agentState.currentStep === 'reflect' && <RotateCcw className="text-red-600" size={18} />}
                          <div className="font-medium text-gray-900 capitalize">
                            {agentState.currentStep}ing...
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          {agentState.currentStep === 'observe' && "Gathering information from the environment"}
                          {agentState.currentStep === 'think' && "Processing observations and planning next action"}
                          {agentState.currentStep === 'act' && "Executing the chosen action"}
                          {agentState.currentStep === 'reflect' && "Evaluating results and learning from experience"}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {['observations', 'thoughts', 'actions', 'reflections'].map(category => (
                      <div key={category} className="border rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-2 capitalize flex items-center">
                          {category === 'observations' && <Eye className="mr-2 text-green-600" size={16} />}
                          {category === 'thoughts' && <Brain className="mr-2 text-purple-600" size={16} />}
                          {category === 'actions' && <Play className="mr-2 text-orange-600" size={16} />}
                          {category === 'reflections' && <RotateCcw className="mr-2 text-red-600" size={16} />}
                          {category}
                        </div>
                        <div className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                          {(agentState[category as keyof typeof agentState] as string[]).length > 0 ? (
                            <div className="space-y-1">
                              {(agentState[category as keyof typeof agentState] as string[]).slice(-3).map((item, index) => (
                                <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                                  {item}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">No {category} yet</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="mr-2 text-blue-600" size={20} />
                  Execution Timeline
                </h3>

                <div className="border rounded-lg bg-gray-50 overflow-hidden">
                  <svg
                    ref={timelineRef}
                    width="800"
                    height="200"
                    className="w-full h-auto"
                  />
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Successful</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Failed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {agentState.stepCount}
                </div>
                <div className="text-sm text-gray-600">Total Cycles</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stepHistory.filter(s => s.success).length}
                </div>
                <div className="text-sm text-gray-600">Successful Steps</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {stepHistory.length > 0 ? Math.round(stepHistory.reduce((sum, s) => sum + s.confidence, 0) / stepHistory.length * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Confidence</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stepHistory.length > 0 ? Math.round(stepHistory.filter(s => s.success).length / stepHistory.length * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Agent Loop Insights:</strong> The {selectedPersonality.name.toLowerCase()} agent shows
                  {selectedPersonality.id === 'cautious' ? ' careful, methodical decision-making' :
                   selectedPersonality.id === 'aggressive' ? ' bold, fast-paced actions' :
                   ' data-driven, systematic behavior'}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {stepHistory.slice(-5).map((step, index) => (
                  <div
                    key={index}
                    className={`px-2 py-1 rounded text-xs ${
                      step.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {step.step}: {(step.confidence * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}