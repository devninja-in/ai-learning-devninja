'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Wrench,
  Settings,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Calculator,
  FileText,
  Code,
  Database,
  Globe,
  Camera,
  Mail,
  Calendar,
  BarChart,
  Lightbulb,
  Zap,
  Users,
  ArrowRight
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  category: string
  cost: number
  accuracy: number
  speed: number
  reliability: number
  dependencies: string[]
  capabilities: string[]
  icon: any
  cooldown: number
  lastUsed?: number
}

interface ToolUsage {
  id: string
  toolId: string
  task: string
  timestamp: number
  input: string
  output: string
  success: boolean
  duration: number
  cost: number
  reasoning: string
  alternatives: string[]
}

interface TaskRequirement {
  capability: string
  priority: 'high' | 'medium' | 'low'
  constraints: string[]
}

interface Task {
  id: string
  title: string
  description: string
  requirements: TaskRequirement[]
  complexity: number
  deadline: number
  budget: number
  domain: string
}

const availableTools: Tool[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search for information on the internet',
    category: 'Information',
    cost: 0.1,
    accuracy: 0.8,
    speed: 0.9,
    reliability: 0.85,
    dependencies: [],
    capabilities: ['search', 'information_retrieval', 'real_time_data'],
    icon: Search,
    cooldown: 1
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Perform mathematical calculations',
    category: 'Computation',
    cost: 0.01,
    accuracy: 0.99,
    speed: 0.95,
    reliability: 0.99,
    dependencies: [],
    capabilities: ['arithmetic', 'algebra', 'calculus', 'statistics'],
    icon: Calculator,
    cooldown: 0
  },
  {
    id: 'code_interpreter',
    name: 'Code Interpreter',
    description: 'Execute and analyze code',
    category: 'Development',
    cost: 0.5,
    accuracy: 0.9,
    speed: 0.7,
    reliability: 0.8,
    dependencies: [],
    capabilities: ['code_execution', 'debugging', 'analysis', 'testing'],
    icon: Code,
    cooldown: 2
  },
  {
    id: 'database_query',
    name: 'Database Query',
    description: 'Query databases for structured data',
    category: 'Data',
    cost: 0.2,
    accuracy: 0.95,
    speed: 0.8,
    reliability: 0.9,
    dependencies: [],
    capabilities: ['data_retrieval', 'sql', 'aggregation', 'joins'],
    icon: Database,
    cooldown: 1
  },
  {
    id: 'text_analyzer',
    name: 'Text Analyzer',
    description: 'Analyze and process text content',
    category: 'NLP',
    cost: 0.3,
    accuracy: 0.85,
    speed: 0.85,
    reliability: 0.88,
    dependencies: [],
    capabilities: ['sentiment_analysis', 'summarization', 'extraction', 'classification'],
    icon: FileText,
    cooldown: 1
  },
  {
    id: 'image_processor',
    name: 'Image Processor',
    description: 'Process and analyze images',
    category: 'Vision',
    cost: 0.8,
    accuracy: 0.82,
    speed: 0.6,
    reliability: 0.75,
    dependencies: [],
    capabilities: ['object_detection', 'ocr', 'image_enhancement', 'classification'],
    icon: Camera,
    cooldown: 3
  },
  {
    id: 'email_client',
    name: 'Email Client',
    description: 'Send and manage emails',
    category: 'Communication',
    cost: 0.05,
    accuracy: 0.95,
    speed: 0.9,
    reliability: 0.92,
    dependencies: [],
    capabilities: ['send_email', 'schedule', 'templates', 'attachments'],
    icon: Mail,
    cooldown: 0
  },
  {
    id: 'calendar_manager',
    name: 'Calendar Manager',
    description: 'Manage schedules and appointments',
    category: 'Productivity',
    cost: 0.1,
    accuracy: 0.9,
    speed: 0.85,
    reliability: 0.9,
    dependencies: [],
    capabilities: ['scheduling', 'conflict_detection', 'reminders', 'availability'],
    icon: Calendar,
    cooldown: 0
  },
  {
    id: 'chart_generator',
    name: 'Chart Generator',
    description: 'Create charts and visualizations',
    category: 'Visualization',
    cost: 0.4,
    accuracy: 0.88,
    speed: 0.75,
    reliability: 0.85,
    dependencies: ['calculator'],
    capabilities: ['charts', 'graphs', 'dashboards', 'export'],
    icon: BarChart,
    cooldown: 1
  },
  {
    id: 'api_client',
    name: 'API Client',
    description: 'Make requests to external APIs',
    category: 'Integration',
    cost: 0.15,
    accuracy: 0.8,
    speed: 0.8,
    reliability: 0.7,
    dependencies: [],
    capabilities: ['http_requests', 'json_parsing', 'authentication', 'rate_limiting'],
    icon: Globe,
    cooldown: 2
  }
]

const sampleTasks: Task[] = [
  {
    id: 'market_analysis',
    title: 'Market Analysis Report',
    description: 'Create a comprehensive market analysis report with data visualization',
    requirements: [
      { capability: 'search', priority: 'high', constraints: ['recent_data'] },
      { capability: 'data_retrieval', priority: 'high', constraints: ['financial_data'] },
      { capability: 'charts', priority: 'medium', constraints: ['professional_quality'] },
      { capability: 'analysis', priority: 'high', constraints: ['statistical_accuracy'] }
    ],
    complexity: 4,
    deadline: 120,
    budget: 5.0,
    domain: 'Business'
  },
  {
    id: 'email_campaign',
    title: 'Email Campaign Setup',
    description: 'Set up automated email campaign with scheduling and personalization',
    requirements: [
      { capability: 'send_email', priority: 'high', constraints: ['bulk_sending'] },
      { capability: 'scheduling', priority: 'high', constraints: ['multiple_timezones'] },
      { capability: 'templates', priority: 'medium', constraints: ['personalization'] }
    ],
    complexity: 2,
    deadline: 60,
    budget: 2.0,
    domain: 'Marketing'
  },
  {
    id: 'code_review',
    title: 'Code Quality Assessment',
    description: 'Review codebase for bugs, performance issues, and best practices',
    requirements: [
      { capability: 'code_execution', priority: 'high', constraints: ['security_scanning'] },
      { capability: 'debugging', priority: 'high', constraints: ['automated_testing'] },
      { capability: 'analysis', priority: 'medium', constraints: ['performance_metrics'] }
    ],
    complexity: 3,
    deadline: 90,
    budget: 3.0,
    domain: 'Development'
  },
  {
    id: 'content_analysis',
    title: 'Social Media Content Analysis',
    description: 'Analyze social media posts for sentiment and trends',
    requirements: [
      { capability: 'sentiment_analysis', priority: 'high', constraints: ['multiple_platforms'] },
      { capability: 'classification', priority: 'medium', constraints: ['trend_detection'] },
      { capability: 'charts', priority: 'low', constraints: ['interactive_dashboards'] }
    ],
    complexity: 3,
    deadline: 100,
    budget: 4.0,
    domain: 'Analytics'
  }
]

const selectionStrategies = [
  {
    id: 'greedy',
    name: 'Greedy Selection',
    description: 'Choose the best tool for each requirement independently'
  },
  {
    id: 'cost_optimized',
    name: 'Cost Optimized',
    description: 'Minimize total cost while meeting requirements'
  },
  {
    id: 'reliability_first',
    name: 'Reliability First',
    description: 'Prioritize most reliable tools'
  },
  {
    id: 'balanced',
    name: 'Balanced Approach',
    description: 'Balance cost, speed, and accuracy'
  }
]

export default function ToolUseSimulation() {
  const [selectedTask, setSelectedTask] = useState(sampleTasks[0])
  const [selectedStrategy, setSelectedStrategy] = useState(selectionStrategies[0])
  const [toolUsageHistory, setToolUsageHistory] = useState<ToolUsage[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionPlan, setExecutionPlan] = useState<string[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [showDetails, setShowDetails] = useState(true)
  const [adaptiveSelection, setAdaptiveSelection] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const networkRef = useRef<SVGSVGElement>(null)

  const selectTools = (task: Task, strategy: typeof selectionStrategies[0]): string[] => {
    const selectedTools: string[] = []

    task.requirements.forEach(req => {
      const candidateTools = availableTools.filter(tool =>
        tool.capabilities.includes(req.capability)
      )

      if (candidateTools.length === 0) return

      let bestTool: Tool

      switch (strategy.id) {
        case 'greedy':
          bestTool = candidateTools.reduce((best, tool) =>
            (tool.accuracy * tool.speed * tool.reliability) >
            (best.accuracy * best.speed * best.reliability) ? tool : best
          )
          break

        case 'cost_optimized':
          bestTool = candidateTools.reduce((best, tool) =>
            tool.cost < best.cost ? tool : best
          )
          break

        case 'reliability_first':
          bestTool = candidateTools.reduce((best, tool) =>
            tool.reliability > best.reliability ? tool : best
          )
          break

        case 'balanced':
        default:
          bestTool = candidateTools.reduce((best, tool) => {
            const toolScore = (tool.accuracy * 0.3) + (tool.speed * 0.2) +
                            (tool.reliability * 0.3) + ((1 - tool.cost) * 0.2)
            const bestScore = (best.accuracy * 0.3) + (best.speed * 0.2) +
                            (best.reliability * 0.3) + ((1 - best.cost) * 0.2)
            return toolScore > bestScore ? tool : best
          })
          break
      }

      if (!selectedTools.includes(bestTool.id)) {
        selectedTools.push(bestTool.id)
      }
    })

    return selectedTools
  }

  const executeTask = async () => {
    setIsExecuting(true)
    const plan = selectTools(selectedTask, selectedStrategy)
    setExecutionPlan(plan)

    let cost = 0
    const usageHistory: ToolUsage[] = []

    for (let i = 0; i < plan.length; i++) {
      const toolId = plan[i]
      const tool = availableTools.find(t => t.id === toolId)!

      // Check cooldown
      const lastUsage = toolUsageHistory.find(u => u.toolId === toolId)
      const timeSinceLastUse = lastUsage ? currentTime - lastUsage.timestamp : Infinity

      if (timeSinceLastUse < tool.cooldown) {
        // Handle cooldown - either wait or use alternative
        if (adaptiveSelection) {
          // Find alternative tool
          const alternatives = availableTools.filter(t =>
            t.capabilities.some(cap => tool.capabilities.includes(cap)) &&
            t.id !== toolId &&
            !plan.includes(t.id)
          )

          if (alternatives.length > 0) {
            const alternative = alternatives[0]
            plan[i] = alternative.id
          }
        } else {
          // Wait for cooldown
          await new Promise(resolve => setTimeout(resolve, (tool.cooldown - timeSinceLastUse) * 1000))
        }
      }

      // Simulate tool execution
      await new Promise(resolve => setTimeout(resolve, (1 - tool.speed) * 2000))

      const success = Math.random() < tool.reliability
      const duration = (1 - tool.speed) * 10 + Math.random() * 5
      const toolCost = tool.cost * (0.8 + Math.random() * 0.4)

      const usage: ToolUsage = {
        id: `usage-${currentTime}-${i}`,
        toolId: tool.id,
        task: `${selectedTask.title} - Step ${i + 1}`,
        timestamp: currentTime + i,
        input: `Task requirement: ${selectedTask.requirements[i]?.capability || 'general'}`,
        output: success ? 'Task completed successfully' : 'Task failed - retrying with alternative approach',
        success,
        duration,
        cost: toolCost,
        reasoning: `Selected ${tool.name} for ${selectedStrategy.description.toLowerCase()}`,
        alternatives: availableTools
          .filter(t => t.capabilities.some(cap => tool.capabilities.includes(cap)) && t.id !== tool.id)
          .slice(0, 2)
          .map(t => t.id)
      }

      usageHistory.push(usage)
      cost += toolCost

      if (!success && adaptiveSelection) {
        // Try alternative tool
        const alternatives = usage.alternatives
        if (alternatives.length > 0) {
          const altTool = availableTools.find(t => t.id === alternatives[0])!
          const altUsage: ToolUsage = {
            ...usage,
            id: `usage-${currentTime}-${i}-alt`,
            toolId: altTool.id,
            output: 'Retry with alternative tool - success',
            success: true,
            cost: altTool.cost,
            reasoning: `Fallback to ${altTool.name} after ${tool.name} failure`
          }
          usageHistory.push(altUsage)
          cost += altTool.cost
        }
      }
    }

    setToolUsageHistory(prev => [...usageHistory, ...prev.slice(0, 20)])
    setTotalCost(prev => prev + cost)
    setCurrentTime(prev => prev + plan.length)
    setIsExecuting(false)
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 900
    const height = 600
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    // Tool selection matrix
    const tools = availableTools.slice(0, 8)
    const requirements = selectedTask.requirements

    const toolWidth = (width - margin.left - margin.right) / tools.length
    const reqHeight = (height - margin.top - margin.bottom) / requirements.length

    // Draw tool headers
    tools.forEach((tool, toolIndex) => {
      const x = margin.left + toolIndex * toolWidth

      svg.append('rect')
        .attr('x', x)
        .attr('y', margin.top - 30)
        .attr('width', toolWidth - 2)
        .attr('height', 25)
        .attr('fill', '#f3f4f6')
        .attr('stroke', '#d1d5db')

      svg.append('text')
        .attr('x', x + toolWidth / 2)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(tool.name.slice(0, 10))
    })

    // Draw requirement rows
    requirements.forEach((req, reqIndex) => {
      const y = margin.top + reqIndex * reqHeight

      // Requirement label
      svg.append('text')
        .attr('x', margin.left - 10)
        .attr('y', y + reqHeight / 2)
        .attr('text-anchor', 'end')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(req.capability)

      // Compatibility matrix
      tools.forEach((tool, toolIndex) => {
        const x = margin.left + toolIndex * toolWidth
        const isCompatible = tool.capabilities.includes(req.capability)
        const isSelected = executionPlan.includes(tool.id)

        const color = !isCompatible ? '#fef2f2' :
                     isSelected ? '#dcfce7' : '#f0f9ff'

        const borderColor = !isCompatible ? '#fca5a5' :
                           isSelected ? '#22c55e' : '#93c5fd'

        svg.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', toolWidth - 2)
          .attr('height', reqHeight - 2)
          .attr('fill', color)
          .attr('stroke', borderColor)
          .attr('stroke-width', isSelected ? 2 : 1)

        if (isCompatible) {
          // Show tool metrics
          const metrics = [
            { label: 'A', value: tool.accuracy, y: y + 15 },
            { label: 'S', value: tool.speed, y: y + 30 },
            { label: 'R', value: tool.reliability, y: y + 45 },
            { label: 'C', value: 1 - tool.cost, y: y + 60 }
          ]

          metrics.forEach(metric => {
            const barWidth = (toolWidth - 10) * metric.value
            svg.append('rect')
              .attr('x', x + 2)
              .attr('y', metric.y - 8)
              .attr('width', barWidth)
              .attr('height', 8)
              .attr('fill', isSelected ? '#16a34a' : '#3b82f6')
              .attr('opacity', 0.7)

            svg.append('text')
              .attr('x', x + 2)
              .attr('y', metric.y - 10)
              .style('font-size', '8px')
              .style('font-weight', 'bold')
              .text(metric.label)
          })
        }

        if (isSelected) {
          svg.append('text')
            .attr('x', x + toolWidth / 2)
            .attr('y', y + reqHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#16a34a')
            .text('✓')
        }
      })
    })

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height - 30})`)

    const legendItems = [
      { color: '#fef2f2', border: '#fca5a5', label: 'Incompatible' },
      { color: '#f0f9ff', border: '#93c5fd', label: 'Compatible' },
      { color: '#dcfce7', border: '#22c55e', label: 'Selected' }
    ]

    legendItems.forEach((item, index) => {
      const x = index * 120

      svg.append('rect')
        .attr('x', x)
        .attr('y', height - 25)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color)
        .attr('stroke', item.border)

      svg.append('text')
        .attr('x', x + 20)
        .attr('y', height - 13)
        .style('font-size', '11px')
        .text(item.label)
    })

  }, [selectedTask, executionPlan, selectedStrategy])

  useEffect(() => {
    if (!networkRef.current || toolUsageHistory.length === 0) return

    const svg = d3.select(networkRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400
    const margin = 40

    // Create network of tool usage
    const recentUsage = toolUsageHistory.slice(0, 10)
    const usedTools = Array.from(new Set(recentUsage.map(u => u.toolId)))

    const nodes = usedTools.map(toolId => {
      const tool = availableTools.find(t => t.id === toolId)!
      const usage = recentUsage.filter(u => u.toolId === toolId)
      const successRate = usage.filter(u => u.success).length / usage.length
      const avgCost = usage.reduce((sum, u) => sum + u.cost, 0) / usage.length

      return {
        id: toolId,
        name: tool.name,
        category: tool.category,
        usage: usage.length,
        successRate,
        avgCost,
        x: margin + Math.random() * (width - 2 * margin),
        y: margin + Math.random() * (height - 2 * margin)
      }
    })

    // Draw connections based on sequential usage
    const links: any[] = []
    for (let i = 0; i < recentUsage.length - 1; i++) {
      const current = recentUsage[i]
      const next = recentUsage[i + 1]

      if (current.toolId !== next.toolId) {
        links.push({
          source: current.toolId,
          target: next.toolId,
          weight: 1
        })
      }
    }

    // Draw links
    links.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source)
      const targetNode = nodes.find(n => n.id === link.target)

      if (sourceNode && targetNode) {
        svg.append('line')
          .attr('x1', sourceNode.x)
          .attr('y1', sourceNode.y)
          .attr('x2', targetNode.x)
          .attr('y2', targetNode.y)
          .attr('stroke', '#d1d5db')
          .attr('stroke-width', 2)
          .attr('opacity', 0.6)
      }
    })

    // Draw nodes
    nodes.forEach(node => {
      const radius = 15 + node.usage * 3

      svg.append('circle')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', radius)
        .attr('fill', node.successRate > 0.8 ? '#10b981' :
                     node.successRate > 0.5 ? '#f59e0b' : '#ef4444')
        .attr('opacity', 0.7)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)

      svg.append('text')
        .attr('x', node.x)
        .attr('y', node.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(node.name.slice(0, 6))

      // Usage count
      svg.append('text')
        .attr('x', node.x)
        .attr('y', node.y - radius - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', '#6b7280')
        .text(node.usage)
    })

  }, [toolUsageHistory])

  const learningObjectives = [
    "Understand tool selection strategies for complex tasks",
    "Explore trade-offs between cost, speed, and reliability",
    "Learn about tool coordination and dependency management",
    "See how adaptive selection handles failures and constraints"
  ]

  return (
    <SimulationLayout
      title="Tool Use & Decision Making"
      description="Interactive tool selection and coordination strategies for AI agents"
      difficulty="Advanced"
      category="Agent Tools"
      onPlay={() => executeTask()}
      onReset={() => {
        setToolUsageHistory([])
        setExecutionPlan([])
        setTotalCost(0)
        setCurrentTime(0)
        setIsExecuting(false)
      }}
      showControls={true}
      learningObjectives={learningObjectives}
      isPlaying={isExecuting}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="mr-2 text-blue-600" size={20} />
              Task & Strategy
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task
                </label>
                <select
                  value={selectedTask.id}
                  onChange={(e) => {
                    const task = sampleTasks.find(t => t.id === e.target.value)
                    if (task) setSelectedTask(task)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sampleTasks.map(task => (
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
                  Selection Strategy
                </label>
                <select
                  value={selectedStrategy.id}
                  onChange={(e) => {
                    const strategy = selectionStrategies.find(s => s.id === e.target.value)
                    if (strategy) setSelectedStrategy(strategy)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {selectionStrategies.map(strategy => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedStrategy.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showDetails"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showDetails" className="text-sm text-gray-700">
                    Show execution details
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="adaptiveSelection"
                    checked={adaptiveSelection}
                    onChange={(e) => setAdaptiveSelection(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="adaptiveSelection" className="text-sm text-gray-700">
                    Enable adaptive selection
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Task Requirements
            </h3>

            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-700">Complexity</div>
                <div className="flex items-center space-x-1">
                  {Array.from({length: 5}).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < selectedTask.complexity ? 'bg-orange-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-gray-600 ml-2">{selectedTask.complexity}/5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Budget</div>
                  <div className="text-gray-600">${selectedTask.budget.toFixed(2)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Deadline</div>
                  <div className="text-gray-600">{selectedTask.deadline}s</div>
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-700 mb-2">Capabilities Needed</div>
                <div className="space-y-2">
                  {selectedTask.requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono">{req.capability}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        req.priority === 'high' ? 'bg-red-100 text-red-800' :
                        req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {req.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 text-purple-600" size={20} />
              Execution Status
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tool Uses:</span>
                <span>{toolUsageHistory.length}</span>
              </div>

              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span>
                  {toolUsageHistory.length > 0
                    ? Math.round((toolUsageHistory.filter(u => u.success).length / toolUsageHistory.length) * 100)
                    : 0}%
                </span>
              </div>

              <div className="flex justify-between">
                <span>Current Plan:</span>
                <span>{executionPlan.length} tools</span>
              </div>

              {isExecuting && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Wrench className="animate-pulse" size={16} />
                  <span>Executing tools...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tool Selection Matrix
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={svgRef}
                width="900"
                height="600"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                Matrix shows tool compatibility with task requirements. Bars indicate: A(ccuracy), S(peed), R(eliability), C(ost efficiency).
                Green checkmarks indicate selected tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Wrench className="mr-2 text-blue-600" size={20} />
                Tool Usage Network
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={networkRef}
                  width="600"
                  height="400"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>Network shows tool usage patterns. Node size indicates frequency, color shows success rate (green=high, red=low).</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart className="mr-2 text-green-600" size={20} />
                Performance Analysis
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {executionPlan.length}
                    </div>
                    <div className="text-sm text-gray-600">Tools Selected</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {toolUsageHistory.filter(u => u.success).length}
                    </div>
                    <div className="text-sm text-gray-600">Successful Uses</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="font-medium text-yellow-900 mb-1">Strategy: {selectedStrategy.name}</div>
                    <div className="text-sm text-yellow-700">
                      {selectedStrategy.description}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-2">
                    <div><strong>Selection Criteria:</strong></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>• Cost optimization</div>
                      <div>• Reliability priority</div>
                      <div>• Speed requirements</div>
                      <div>• Accuracy needs</div>
                    </div>

                    <div><strong>Adaptive Features:</strong></div>
                    <div>
                      {adaptiveSelection ? (
                        <span className="text-green-600">✓ Cooldown handling, failure recovery, alternative selection</span>
                      ) : (
                        <span className="text-red-600">⚠ Fixed selection without adaptation</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="mr-2 text-yellow-600" size={20} />
                Recent Tool Usage
              </h3>

              <div className="max-h-64 overflow-y-auto">
                {toolUsageHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Wrench className="mx-auto mb-2" size={32} />
                    <p>No tools used yet</p>
                    <p className="text-sm">Execute a task to see tool usage</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {toolUsageHistory.slice(0, 6).map((usage) => (
                      <div key={usage.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium text-sm">
                            {availableTools.find(t => t.id === usage.toolId)?.name}
                          </div>
                          <div className="flex items-center space-x-2">
                            {usage.success ? (
                              <CheckCircle className="text-green-600" size={16} />
                            ) : (
                              <AlertCircle className="text-red-600" size={16} />
                            )}
                            <span className="text-xs text-gray-500">
                              ${usage.cost.toFixed(3)}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 mb-2">
                          <div><strong>Task:</strong> {usage.task}</div>
                          <div><strong>Input:</strong> {usage.input}</div>
                          <div><strong>Output:</strong> {usage.output}</div>
                        </div>

                        <div className="text-xs text-gray-500">
                          <div><strong>Reasoning:</strong> {usage.reasoning}</div>
                          {usage.alternatives.length > 0 && (
                            <div><strong>Alternatives:</strong> {usage.alternatives.join(', ')}</div>
                          )}
                          <div><strong>Duration:</strong> {usage.duration.toFixed(1)}s</div>
                        </div>
                      </div>
                    ))}

                    {toolUsageHistory.length > 6 && (
                      <div className="text-center text-sm text-gray-500">
                        ... and {toolUsageHistory.length - 6} more uses
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SimulationLayout>
  )
}