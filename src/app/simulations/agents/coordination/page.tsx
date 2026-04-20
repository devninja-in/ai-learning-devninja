'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { Users, MessageSquare, GitBranch, Zap, Clock, Target } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  position: { x: number; y: number }
  status: 'idle' | 'working' | 'communicating' | 'coordinating'
  currentTask?: string
  capabilities: string[]
  workload: number
  performance: number
}

interface Message {
  id: string
  from: string
  to: string
  type: 'request' | 'response' | 'notification' | 'coordination'
  content: string
  timestamp: number
  urgency: 'low' | 'medium' | 'high'
}

interface Task {
  id: string
  name: string
  description: string
  requiredCapabilities: string[]
  estimatedTime: number
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'assigned' | 'in-progress' | 'completed'
  assignedAgent?: string
  dependencies: string[]
  progress: number
}

const COORDINATION_SCENARIOS: Record<string, {
  name: string
  description: string
  agents: Array<{
    id: string
    name: string
    role: string
    capabilities: string[]
    workload: number
    performance: number
  }>
  tasks: Array<{
    id: string
    name: string
    description: string
    requiredCapabilities: string[]
    estimatedTime: number
    priority: 'low' | 'medium' | 'high'
    dependencies: string[]
  }>
}> = {
  'software-team': {
    name: 'Software Development Team',
    description: 'Coordinated development of a feature across multiple specialists',
    agents: [
      { id: 'architect', name: 'System Architect', role: 'Architecture', capabilities: ['design', 'planning', 'review'], workload: 0.6, performance: 0.9 },
      { id: 'frontend', name: 'Frontend Dev', role: 'Frontend', capabilities: ['ui', 'react', 'testing'], workload: 0.8, performance: 0.85 },
      { id: 'backend', name: 'Backend Dev', role: 'Backend', capabilities: ['api', 'database', 'security'], workload: 0.7, performance: 0.88 },
      { id: 'qa', name: 'QA Engineer', role: 'Quality', capabilities: ['testing', 'automation', 'review'], workload: 0.5, performance: 0.92 },
      { id: 'devops', name: 'DevOps', role: 'Operations', capabilities: ['deployment', 'monitoring', 'infrastructure'], workload: 0.4, performance: 0.87 }
    ],
    tasks: [
      { id: 'task1', name: 'Design API', description: 'Create comprehensive API design and documentation', requiredCapabilities: ['design', 'api'], estimatedTime: 4, priority: 'high', dependencies: [] },
      { id: 'task2', name: 'Implement Backend', description: 'Build the backend infrastructure and API endpoints', requiredCapabilities: ['api', 'database'], estimatedTime: 8, priority: 'high', dependencies: ['task1'] },
      { id: 'task3', name: 'Create UI Components', description: 'Develop frontend user interface components', requiredCapabilities: ['ui', 'react'], estimatedTime: 6, priority: 'medium', dependencies: ['task1'] },
      { id: 'task4', name: 'Write Tests', description: 'Create comprehensive test suite for all components', requiredCapabilities: ['testing'], estimatedTime: 4, priority: 'medium', dependencies: ['task2', 'task3'] },
      { id: 'task5', name: 'Deploy System', description: 'Deploy and configure the system in production', requiredCapabilities: ['deployment'], estimatedTime: 2, priority: 'low', dependencies: ['task4'] }
    ]
  },
  'research-team': {
    name: 'Research Coordination',
    description: 'Multi-agent research project with data collection and analysis',
    agents: [
      { id: 'coordinator', name: 'Research Lead', role: 'Coordination', capabilities: ['planning', 'review', 'synthesis'], workload: 0.5, performance: 0.95 },
      { id: 'collector1', name: 'Data Collector A', role: 'Collection', capabilities: ['collection', 'cleaning'], workload: 0.9, performance: 0.8 },
      { id: 'collector2', name: 'Data Collector B', role: 'Collection', capabilities: ['collection', 'validation'], workload: 0.85, performance: 0.82 },
      { id: 'analyst', name: 'Data Analyst', role: 'Analysis', capabilities: ['analysis', 'modeling'], workload: 0.7, performance: 0.9 },
      { id: 'writer', name: 'Report Writer', role: 'Documentation', capabilities: ['writing', 'visualization'], workload: 0.6, performance: 0.88 }
    ],
    tasks: [
      { id: 'plan', name: 'Research Planning', description: 'Define research methodology and data collection strategy', requiredCapabilities: ['planning'], estimatedTime: 2, priority: 'high', dependencies: [] },
      { id: 'collect1', name: 'Collect Dataset A', description: 'Gather primary data sources and validate quality', requiredCapabilities: ['collection'], estimatedTime: 6, priority: 'high', dependencies: ['plan'] },
      { id: 'collect2', name: 'Collect Dataset B', description: 'Collect secondary data and ensure completeness', requiredCapabilities: ['collection'], estimatedTime: 5, priority: 'high', dependencies: ['plan'] },
      { id: 'analyze', name: 'Statistical Analysis', description: 'Perform comprehensive statistical analysis on collected data', requiredCapabilities: ['analysis'], estimatedTime: 4, priority: 'medium', dependencies: ['collect1', 'collect2'] },
      { id: 'report', name: 'Write Report', description: 'Create detailed research report with findings and recommendations', requiredCapabilities: ['writing'], estimatedTime: 3, priority: 'low', dependencies: ['analyze'] }
    ]
  },
  'emergency-response': {
    name: 'Emergency Response Team',
    description: 'Coordinated response to a critical system incident',
    agents: [
      { id: 'commander', name: 'Incident Commander', role: 'Command', capabilities: ['coordination', 'decision'], workload: 0.8, performance: 0.93 },
      { id: 'sre1', name: 'SRE Primary', role: 'Engineering', capabilities: ['diagnosis', 'repair', 'monitoring'], workload: 1.0, performance: 0.85 },
      { id: 'sre2', name: 'SRE Secondary', role: 'Engineering', capabilities: ['diagnosis', 'scaling', 'backup'], workload: 0.9, performance: 0.87 },
      { id: 'security', name: 'Security Expert', role: 'Security', capabilities: ['security', 'forensics'], workload: 0.6, performance: 0.9 },
      { id: 'comms', name: 'Communications', role: 'Communications', capabilities: ['notification', 'updates'], workload: 0.7, performance: 0.88 }
    ],
    tasks: [
      { id: 'assess', name: 'Initial Assessment', description: 'Rapidly diagnose the scope and impact of the incident', requiredCapabilities: ['diagnosis'], estimatedTime: 1, priority: 'high', dependencies: [] },
      { id: 'contain', name: 'Contain Issue', description: 'Implement immediate containment measures to prevent further damage', requiredCapabilities: ['repair'], estimatedTime: 2, priority: 'high', dependencies: ['assess'] },
      { id: 'notify', name: 'Notify Stakeholders', description: 'Alert all relevant stakeholders about the incident status', requiredCapabilities: ['notification'], estimatedTime: 1, priority: 'high', dependencies: ['assess'] },
      { id: 'investigate', name: 'Root Cause Analysis', description: 'Conduct thorough investigation to determine the root cause', requiredCapabilities: ['forensics'], estimatedTime: 3, priority: 'medium', dependencies: ['contain'] },
      { id: 'scale', name: 'Scale Resources', description: 'Scale system resources to handle increased load', requiredCapabilities: ['scaling'], estimatedTime: 2, priority: 'medium', dependencies: ['contain'] }
    ]
  }
}

const COORDINATION_STRATEGIES = [
  'Centralized Command',
  'Distributed Consensus',
  'Market-Based Assignment',
  'Hierarchical Delegation',
  'Peer-to-Peer Negotiation'
]

export default function CoordinationSimulation() {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof COORDINATION_SCENARIOS>('software-team')
  const [strategy, setStrategy] = useState(COORDINATION_STRATEGIES[0])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [showCommunication, setShowCommunication] = useState(true)
  const networkRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<SVGSVGElement>(null)

  const scenario = COORDINATION_SCENARIOS[selectedScenario]

  // Initialize agents and tasks
  useEffect(() => {
    const initialAgents = scenario.agents.map((agent, index) => ({
      ...agent,
      position: {
        x: 150 + (index % 3) * 200,
        y: 150 + Math.floor(index / 3) * 150
      },
      status: 'idle' as const
    }))

    const initialTasks = scenario.tasks.map(task => ({
      ...task,
      status: 'pending' as const,
      progress: 0
    }))

    setAgents(initialAgents)
    setTasks(initialTasks)
    setMessages([])
    setCurrentTime(0)
  }, [selectedScenario])

  // Network visualization
  useEffect(() => {
    if (!networkRef.current || agents.length === 0) return

    const svg = d3.select(networkRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400

    // Draw communication links
    if (showCommunication && messages.length > 0) {
      const recentMessages = messages.filter(m => currentTime - m.timestamp < 5000)

      recentMessages.forEach(message => {
        const fromAgent = agents.find(a => a.id === message.from)
        const toAgent = agents.find(a => a.id === message.to)

        if (fromAgent && toAgent) {
          svg.append('line')
            .attr('x1', fromAgent.position.x)
            .attr('y1', fromAgent.position.y)
            .attr('x2', toAgent.position.x)
            .attr('y2', toAgent.position.y)
            .attr('stroke', message.urgency === 'high' ? '#EF4444' : message.urgency === 'medium' ? '#F59E0B' : '#10B981')
            .attr('stroke-width', message.urgency === 'high' ? 3 : 2)
            .attr('opacity', 0.6)
            .attr('stroke-dasharray', message.type === 'request' ? '5,5' : 'none')
        }
      })
    }

    // Draw agents
    const agentGroups = svg.selectAll('.agent')
      .data(agents)
      .enter()
      .append('g')
      .attr('class', 'agent')
      .attr('transform', d => `translate(${d.position.x},${d.position.y})`)

    agentGroups.append('circle')
      .attr('r', 25)
      .attr('fill', d => {
        switch (d.status) {
          case 'working': return '#3B82F6'
          case 'communicating': return '#8B5CF6'
          case 'coordinating': return '#F59E0B'
          default: return '#10B981'
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)

    agentGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -30)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d.name)

    agentGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .style('font-size', '10px')
      .attr('fill', '#fff')
      .text(d => d.role.slice(0, 8))

    // Workload indicator
    agentGroups.append('rect')
      .attr('x', -20)
      .attr('y', 30)
      .attr('width', 40)
      .attr('height', 4)
      .attr('fill', '#E5E7EB')

    agentGroups.append('rect')
      .attr('x', -20)
      .attr('y', 30)
      .attr('width', d => 40 * d.workload)
      .attr('height', 4)
      .attr('fill', d => d.workload > 0.8 ? '#EF4444' : d.workload > 0.6 ? '#F59E0B' : '#10B981')

  }, [agents, messages, currentTime, showCommunication])

  // Timeline visualization
  useEffect(() => {
    if (!timelineRef.current || tasks.length === 0) return

    const svg = d3.select(timelineRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 100 }

    const maxTime = Math.max(...tasks.map(t => t.estimatedTime)) + 2
    const xScale = d3.scaleLinear()
      .domain([0, maxTime])
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleBand()
      .domain(tasks.map(t => t.id))
      .range([margin.top, height - margin.bottom])
      .padding(0.1)

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}h`))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(id => {
        const task = tasks.find(t => t.id === id)
        return task ? task.name : id
      }))

    // Draw task bars
    const taskBars = svg.selectAll('.task-bar')
      .data(tasks)
      .enter()
      .append('g')
      .attr('class', 'task-bar')

    // Background bars
    taskBars.append('rect')
      .attr('x', margin.left)
      .attr('y', d => yScale(d.id)!)
      .attr('width', d => xScale(d.estimatedTime) - margin.left)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#E5E7EB')
      .attr('stroke', '#D1D5DB')

    // Progress bars
    taskBars.append('rect')
      .attr('x', margin.left)
      .attr('y', d => yScale(d.id)!)
      .attr('width', d => (xScale(d.estimatedTime) - margin.left) * d.progress)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        switch (d.status) {
          case 'completed': return '#10B981'
          case 'in-progress': return '#3B82F6'
          case 'assigned': return '#F59E0B'
          default: return '#9CA3AF'
        }
      })

    // Priority indicators
    taskBars.append('circle')
      .attr('cx', width - 30)
      .attr('cy', d => yScale(d.id)! + yScale.bandwidth() / 2)
      .attr('r', 6)
      .attr('fill', d => {
        switch (d.priority) {
          case 'high': return '#EF4444'
          case 'medium': return '#F59E0B'
          default: return '#10B981'
        }
      })

  }, [tasks])

  const simulateStep = () => {
    if (!isRunning) return

    setCurrentTime(prev => prev + 1000)

    // Update task progress
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.status === 'in-progress' && task.assignedAgent) {
        const agent = agents.find(a => a.id === task.assignedAgent)
        if (agent) {
          const progressIncrement = (agent.performance * 0.1) / task.estimatedTime
          const newProgress = Math.min(1, task.progress + progressIncrement)

          return {
            ...task,
            progress: newProgress,
            status: newProgress >= 1 ? 'completed' : 'in-progress'
          }
        }
      }
      return task
    }))

    // Assign new tasks
    setTasks(prevTasks => {
      const pendingTasks = prevTasks.filter(t => t.status === 'pending')
      const availableAgents = agents.filter(a => a.workload < 1.0 && !a.currentTask)

      return prevTasks.map(task => {
        if (task.status === 'pending' && availableAgents.length > 0) {
          // Check if dependencies are met
          const dependenciesMet = task.dependencies.every(depId => {
            const depTask = prevTasks.find(t => t.id === depId)
            return depTask?.status === 'completed'
          })

          if (dependenciesMet) {
            // Find best agent for this task
            const suitableAgents = availableAgents.filter(agent =>
              task.requiredCapabilities.some(cap => agent.capabilities.includes(cap))
            )

            if (suitableAgents.length > 0) {
              const bestAgent = suitableAgents.reduce((best, current) =>
                current.performance > best.performance ? current : best
              )

              // Add coordination message
              const coordinationMessage: Message = {
                id: `msg-${Date.now()}`,
                from: 'system',
                to: bestAgent.id,
                type: 'coordination',
                content: `Assigned task: ${task.name}`,
                timestamp: currentTime,
                urgency: task.priority === 'high' ? 'high' : 'medium'
              }

              setMessages(prev => [...prev.slice(-10), coordinationMessage])

              return {
                ...task,
                status: 'assigned',
                assignedAgent: bestAgent.id
              }
            }
          }
        }

        if (task.status === 'assigned' && task.assignedAgent) {
          return {
            ...task,
            status: 'in-progress'
          }
        }

        return task
      })
    })

    // Update agent status
    setAgents(prevAgents => prevAgents.map(agent => {
      const assignedTask = tasks.find(t => t.assignedAgent === agent.id && t.status === 'in-progress')

      if (assignedTask) {
        return {
          ...agent,
          status: 'working',
          currentTask: assignedTask.name,
          workload: Math.min(1.0, agent.workload + 0.3)
        }
      } else if (Math.random() > 0.8) {
        return {
          ...agent,
          status: 'communicating',
          workload: Math.max(0, agent.workload - 0.05)
        }
      } else {
        return {
          ...agent,
          status: 'idle',
          currentTask: undefined,
          workload: Math.max(0, agent.workload - 0.1)
        }
      }
    }))

    // Generate random communication
    if (Math.random() > 0.7 && agents.length > 1) {
      const fromAgent = agents[Math.floor(Math.random() * agents.length)]
      let toAgent = agents[Math.floor(Math.random() * agents.length)]
      while (toAgent.id === fromAgent.id) {
        toAgent = agents[Math.floor(Math.random() * agents.length)]
      }

      const messageTypes = ['request', 'response', 'notification'] as const
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        from: fromAgent.id,
        to: toAgent.id,
        type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
        content: 'Coordinating task execution',
        timestamp: currentTime,
        urgency: Math.random() > 0.7 ? 'high' : 'medium'
      }

      setMessages(prev => [...prev.slice(-15), newMessage])
    }
  }

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(simulateStep, 1000)
      return () => clearInterval(interval)
    }
  }, [isRunning, agents, tasks, currentTime])

  const handlePlay = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setCurrentTime(0)

    const initialAgents = scenario.agents.map((agent, index) => ({
      ...agent,
      position: {
        x: 150 + (index % 3) * 200,
        y: 150 + Math.floor(index / 3) * 150
      },
      status: 'idle' as const
    }))

    const initialTasks = scenario.tasks.map(task => ({
      ...task,
      status: 'pending' as const,
      progress: 0
    }))

    setAgents(initialAgents)
    setTasks(initialTasks)
    setMessages([])
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const totalEfficiency = agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length
  const communicationVolume = messages.filter(m => currentTime - m.timestamp < 5000).length

  const learningObjectives = [
    "Understand different multi-agent coordination strategies",
    "Explore task assignment and workload distribution",
    "Learn about inter-agent communication patterns",
    "See how coordination affects overall team efficiency"
  ]

  return (
    <SimulationLayout
      title="Multi-Agent Coordination"
      description="Explore how multiple agents coordinate to accomplish complex tasks together"
      difficulty="Advanced"
      category="Agents & Reasoning"
      onPlay={handlePlay}
      onReset={handleReset}
      isPlaying={isRunning}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2 text-blue-600" size={20} />
              Coordination Scenario
            </h3>

            <div className="space-y-3">
              {Object.entries(COORDINATION_SCENARIOS).map(([key, scenario]) => (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name="scenario"
                    value={key}
                    checked={selectedScenario === key}
                    onChange={() => setSelectedScenario(key as keyof typeof COORDINATION_SCENARIOS)}
                    className="sr-only"
                  />
                  <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedScenario === key
                      ? 'border-blue-500 bg-blue-50'
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
              <GitBranch className="mr-2 text-green-600" size={20} />
              Strategy
            </h3>

            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {COORDINATION_STRATEGIES.map(strategy => (
                <option key={strategy} value={strategy}>{strategy}</option>
              ))}
            </select>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCommunication}
                  onChange={(e) => setShowCommunication(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show Communication</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-purple-600" size={20} />
              Performance Metrics
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasks Completed:</span>
                <span className="text-sm font-mono font-medium">
                  {completedTasks}/{tasks.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Team Efficiency:</span>
                <span className="text-sm font-mono font-medium">
                  {(totalEfficiency * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Communication:</span>
                <span className="text-sm font-mono font-medium">
                  {communicationVolume} msgs/5s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Runtime:</span>
                <span className="text-sm font-mono font-medium">
                  {Math.floor(currentTime / 1000)}s
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="mr-2 text-blue-600" size={20} />
              Agent Network & Communication
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden mb-4">
              <svg
                ref={networkRef}
                width="600"
                height="400"
                className="w-full h-auto"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span>Idle</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span>Working</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                <span>Communicating</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                <span>Coordinating</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-2 bg-red-500 mr-2"></div>
                <span>High Workload</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 text-green-600" size={20} />
              Task Timeline & Progress
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={timelineRef}
                width="800"
                height="300"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 mr-2"></div>
                <span>Pending</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                <span>Assigned</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 mr-2"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Agent Status
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {agents.map((agent) => (
                  <div key={agent.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {agent.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {agent.role} • {agent.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">
                          Load: {(agent.workload * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">
                          Perf: {(agent.performance * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    {agent.currentTask && (
                      <div className="text-xs text-blue-600 mt-1 italic">
                        Working on: {agent.currentTask}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Messages
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {messages.slice(-8).map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`p-2 rounded text-xs ${
                        message.urgency === 'high'
                          ? 'bg-red-100 border-red-200'
                          : message.urgency === 'medium'
                          ? 'bg-yellow-100 border-yellow-200'
                          : 'bg-green-100 border-green-200'
                      } border`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {agents.find(a => a.id === message.from)?.name || message.from} →{' '}
                          {agents.find(a => a.id === message.to)?.name || message.to}
                        </span>
                        <span className="text-gray-500">
                          {message.type}
                        </span>
                      </div>
                      <div className="text-gray-700 mt-1">
                        {message.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}