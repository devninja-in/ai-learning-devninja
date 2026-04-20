'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Target,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Play,
  ArrowRight,
  ArrowDown,
  Lightbulb,
  BarChart,
  Users,
  Calendar
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed'
  dependencies: string[]
  estimatedDuration: number
  actualDuration?: number
  resources: string[]
  subtasks: Task[]
  depth: number
  startTime?: number
  endTime?: number
  assignee?: string
  confidence: number
}

interface Goal {
  id: string
  title: string
  description: string
  complexity: number
  domain: string
  timeframe: string
  success_criteria: string[]
  constraints: string[]
}

const goals: Goal[] = [
  {
    id: 'app_launch',
    title: 'Launch Mobile App',
    description: 'Develop and launch a new mobile application from concept to market',
    complexity: 5,
    domain: 'Software Development',
    timeframe: '6 months',
    success_criteria: [
      'App available on both iOS and Android stores',
      'At least 10,000 downloads in first month',
      'Average rating above 4.0 stars',
      'Core features fully functional'
    ],
    constraints: [
      'Budget limit: $100,000',
      'Team size: 5 developers',
      'Must comply with privacy regulations',
      'Launch before competitor'
    ]
  },
  {
    id: 'marketing_campaign',
    title: 'Product Marketing Campaign',
    description: 'Plan and execute a comprehensive marketing campaign for new product launch',
    complexity: 4,
    domain: 'Marketing',
    timeframe: '3 months',
    success_criteria: [
      'Reach 1M target audience members',
      'Generate 5,000 qualified leads',
      'Achieve 15% conversion rate',
      'Brand awareness increase by 40%'
    ],
    constraints: [
      'Marketing budget: $50,000',
      'Cannot use competitor platforms',
      'Must align with brand guidelines',
      'Holiday season timing'
    ]
  },
  {
    id: 'office_relocation',
    title: 'Office Relocation',
    description: 'Plan and execute the relocation of company headquarters to a new building',
    complexity: 4,
    domain: 'Operations',
    timeframe: '4 months',
    success_criteria: [
      'Zero data loss during transition',
      'Less than 2 days of downtime',
      'All employees relocated successfully',
      'Cost within 10% of budget'
    ],
    constraints: [
      'Lease ends in 4 months',
      'Must maintain business operations',
      'Limited moving budget',
      'New location not yet confirmed'
    ]
  },
  {
    id: 'research_study',
    title: 'AI Research Study',
    description: 'Conduct comprehensive research study on AI applications in healthcare',
    complexity: 5,
    domain: 'Research',
    timeframe: '8 months',
    success_criteria: [
      'Publish in peer-reviewed journal',
      'Survey 1000+ healthcare professionals',
      'Develop working prototype',
      'Present at major conference'
    ],
    constraints: [
      'IRB approval required',
      'Limited access to patient data',
      'Research funding timeline',
      'Publication deadlines'
    ]
  }
]

const planningStrategies = [
  {
    id: 'hierarchical',
    name: 'Hierarchical Decomposition',
    description: 'Break down goals into hierarchical sub-goals',
    approach: 'Top-down decomposition with multiple levels'
  },
  {
    id: 'timeline',
    name: 'Timeline-Based Planning',
    description: 'Organize tasks chronologically with dependencies',
    approach: 'Sequential planning with critical path analysis'
  },
  {
    id: 'resource',
    name: 'Resource-Constrained Planning',
    description: 'Plan based on available resources and constraints',
    approach: 'Resource allocation and constraint satisfaction'
  }
]

export default function PlanningSimulation() {
  const [selectedGoal, setSelectedGoal] = useState(goals[0])
  const [selectedStrategy, setSelectedStrategy] = useState(planningStrategies[0])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isPlanning, setIsPlanning] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1000)
  const [showDetails, setShowDetails] = useState(true)
  const [adaptivePlanning, setAdaptivePlanning] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<SVGSVGElement>(null)

  const generateTaskHierarchy = (goal: Goal, strategy: typeof planningStrategies[0]): Task[] => {
    const taskTemplates = {
      app_launch: {
        hierarchical: [
          {
            title: 'Project Planning',
            subtasks: [
              { title: 'Define requirements', duration: 5 },
              { title: 'Create project timeline', duration: 3 },
              { title: 'Assemble development team', duration: 7 }
            ]
          },
          {
            title: 'Design Phase',
            subtasks: [
              { title: 'UI/UX design', duration: 15 },
              { title: 'Technical architecture', duration: 10 },
              { title: 'Database design', duration: 8 }
            ]
          },
          {
            title: 'Development',
            subtasks: [
              { title: 'Backend development', duration: 30 },
              { title: 'Frontend development', duration: 25 },
              { title: 'API integration', duration: 15 }
            ]
          },
          {
            title: 'Testing & Launch',
            subtasks: [
              { title: 'Quality assurance testing', duration: 12 },
              { title: 'App store submission', duration: 8 },
              { title: 'Marketing launch', duration: 10 }
            ]
          }
        ],
        timeline: [
          { title: 'Week 1-2: Planning & Requirements', duration: 14 },
          { title: 'Week 3-6: Design Phase', duration: 28 },
          { title: 'Week 7-18: Development Sprint', duration: 84 },
          { title: 'Week 19-22: Testing & QA', duration: 28 },
          { title: 'Week 23-24: Launch Preparation', duration: 14 }
        ],
        resource: [
          { title: 'Frontend Developer Tasks', duration: 45 },
          { title: 'Backend Developer Tasks', duration: 50 },
          { title: 'Designer Tasks', duration: 25 },
          { title: 'QA Engineer Tasks', duration: 20 }
        ]
      },
      marketing_campaign: {
        hierarchical: [
          {
            title: 'Campaign Strategy',
            subtasks: [
              { title: 'Market research', duration: 7 },
              { title: 'Target audience analysis', duration: 5 },
              { title: 'Competitive analysis', duration: 6 }
            ]
          },
          {
            title: 'Content Creation',
            subtasks: [
              { title: 'Brand messaging', duration: 8 },
              { title: 'Visual assets', duration: 12 },
              { title: 'Video production', duration: 15 }
            ]
          },
          {
            title: 'Campaign Execution',
            subtasks: [
              { title: 'Social media campaigns', duration: 20 },
              { title: 'Email marketing', duration: 10 },
              { title: 'Paid advertising', duration: 25 }
            ]
          }
        ]
      }
    }

    const generateTask = (template: any, parentId?: string, depth: number = 0): Task => {
      const id = `task-${Math.random().toString(36).substr(2, 9)}`
      const subtasks: Task[] = []

      if (template.subtasks && depth < 3) {
        template.subtasks.forEach((subtaskTemplate: any) => {
          subtasks.push(generateTask(subtaskTemplate, id, depth + 1))
        })
      }

      return {
        id,
        title: template.title,
        description: `${template.title} - part of ${goal.title}`,
        priority: depth === 0 ? 'high' : depth === 1 ? 'medium' : 'low',
        status: 'pending',
        dependencies: parentId ? [parentId] : [],
        estimatedDuration: template.duration || Math.random() * 10 + 2,
        resources: [`Resource-${Math.floor(Math.random() * 3) + 1}`],
        subtasks,
        depth,
        confidence: 0.7 + Math.random() * 0.3,
        assignee: ['Alice', 'Bob', 'Charlie', 'Diana'][Math.floor(Math.random() * 4)]
      }
    }

    const domainKey = goal.domain.toLowerCase().replace(/\s+/g, '_')
    const strategyKey = strategy.id
    const templates = (taskTemplates as any)[goal.id]?.[strategyKey] ||
                     (taskTemplates as any)[goal.id]?.hierarchical ||
                     taskTemplates.app_launch.hierarchical

    return templates.map((template: any) => generateTask(template))
  }

  const flattenTasks = (tasks: Task[]): Task[] => {
    const result: Task[] = []

    const flatten = (taskList: Task[]) => {
      taskList.forEach(task => {
        result.push(task)
        if (task.subtasks.length > 0) {
          flatten(task.subtasks)
        }
      })
    }

    flatten(tasks)
    return result
  }

  const executeTask = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const success = Math.random() > 0.2 // 80% success rate
        return {
          ...task,
          status: success ? 'completed' : 'failed',
          actualDuration: task.estimatedDuration * (0.8 + Math.random() * 0.4),
          endTime: currentTime + task.estimatedDuration
        }
      }
      return task
    }))
  }

  const findNextTasks = (allTasks: Task[]): Task[] => {
    return allTasks.filter(task => {
      if (task.status !== 'pending') return false

      // Check if all dependencies are completed
      const dependenciesCompleted = task.dependencies.every(depId => {
        const depTask = allTasks.find(t => t.id === depId)
        return depTask?.status === 'completed'
      })

      return dependenciesCompleted
    })
  }

  useEffect(() => {
    if (!isExecuting) return

    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1)

      const flatTasks = flattenTasks(tasks)
      const nextTasks = findNextTasks(flatTasks)

      if (nextTasks.length > 0 && Math.random() > 0.7) {
        const taskToExecute = nextTasks[Math.floor(Math.random() * nextTasks.length)]
        executeTask(taskToExecute.id)
      }

      // Check if all tasks are completed
      const allCompleted = flatTasks.every(task =>
        task.status === 'completed' || task.status === 'failed'
      )

      if (allCompleted) {
        setIsExecuting(false)
      }
    }, animationSpeed)

    return () => clearInterval(interval)
  }, [isExecuting, tasks, currentTime, animationSpeed])

  useEffect(() => {
    const newTasks = generateTaskHierarchy(selectedGoal, selectedStrategy)
    setTasks(newTasks)
    setCurrentTime(0)
  }, [selectedGoal, selectedStrategy])

  useEffect(() => {
    if (!svgRef.current || tasks.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 900
    const height = 600
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    if (selectedStrategy.id === 'hierarchical') {
      // Hierarchical tree layout
      const allTasks = flattenTasks(tasks)

      const hierarchy = d3.stratify<Task>()
        .id(d => d.id)
        .parentId(d => d.dependencies[0] || null)(allTasks.filter(t => t.depth <= 2))

      const treeLayout = d3.tree<Task>()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])

      const root = treeLayout(hierarchy)

      // Draw connections
      root.links().forEach(link => {
        const sourceX = margin.left + link.source.y!
        const sourceY = margin.top + link.source.x!
        const targetX = margin.left + link.target.y!
        const targetY = margin.top + link.target.x!

        svg.append('line')
          .attr('x1', sourceX)
          .attr('y1', sourceY)
          .attr('x2', targetX)
          .attr('y2', targetY)
          .attr('stroke', '#d1d5db')
          .attr('stroke-width', 2)
          .attr('opacity', 0.6)
      })

      // Draw task nodes
      root.descendants().forEach(node => {
        const x = margin.left + node.y!
        const y = margin.top + node.x!
        const task = node.data

        const getStatusColor = (status: string) => {
          switch (status) {
            case 'completed': return '#10b981'
            case 'in_progress': return '#f59e0b'
            case 'failed': return '#ef4444'
            case 'blocked': return '#8b5cf6'
            default: return '#6b7280'
          }
        }

        svg.append('rect')
          .attr('x', x - 60)
          .attr('y', y - 15)
          .attr('width', 120)
          .attr('height', 30)
          .attr('fill', getStatusColor(task.status))
          .attr('opacity', 0.8)
          .attr('rx', 5)

        svg.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '10px')
          .style('fill', 'white')
          .style('font-weight', 'bold')
          .text(task.title.slice(0, 15) + (task.title.length > 15 ? '...' : ''))

        // Priority indicator
        const priorityColor = task.priority === 'high' ? '#ef4444' :
                             task.priority === 'medium' ? '#f59e0b' : '#10b981'

        svg.append('circle')
          .attr('cx', x + 50)
          .attr('cy', y - 20)
          .attr('r', 4)
          .attr('fill', priorityColor)
      })

    } else if (selectedStrategy.id === 'timeline') {
      // Timeline visualization
      const allTasks = flattenTasks(tasks)
      const taskHeight = 40
      const timeScale = d3.scaleLinear()
        .domain([0, Math.max(...allTasks.map(t => t.estimatedDuration)) * 1.2])
        .range([margin.left, width - margin.right])

      allTasks.forEach((task, index) => {
        const y = margin.top + index * taskHeight
        const startX = timeScale(task.startTime || 0)
        const endX = timeScale((task.startTime || 0) + task.estimatedDuration)

        // Task bar
        svg.append('rect')
          .attr('x', startX)
          .attr('y', y)
          .attr('width', Math.max(endX - startX, 5))
          .attr('height', taskHeight - 5)
          .attr('fill', task.status === 'completed' ? '#10b981' :
                       task.status === 'in_progress' ? '#f59e0b' : '#6b7280')
          .attr('opacity', 0.8)
          .attr('rx', 3)

        // Task label
        svg.append('text')
          .attr('x', startX + 5)
          .attr('y', y + taskHeight / 2)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '11px')
          .style('fill', 'white')
          .style('font-weight', 'bold')
          .text(task.title.slice(0, 20))
      })

      // Timeline axis
      svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(timeScale))
    }

  }, [tasks, selectedStrategy, currentTime])

  useEffect(() => {
    if (!timelineRef.current) return

    const svg = d3.select(timelineRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 200
    const margin = { top: 20, right: 20, bottom: 40, left: 60 }

    const allTasks = flattenTasks(tasks)
    const statusCounts = {
      pending: allTasks.filter(t => t.status === 'pending').length,
      in_progress: allTasks.filter(t => t.status === 'in_progress').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      failed: allTasks.filter(t => t.status === 'failed').length
    }

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: status === 'completed' ? '#10b981' :
             status === 'in_progress' ? '#f59e0b' :
             status === 'failed' ? '#ef4444' : '#6b7280'
    }))

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.status))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.count), 1)])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Add bars
    data.forEach(d => {
      svg.append('rect')
        .attr('x', xScale(d.status) || 0)
        .attr('y', yScale(d.count))
        .attr('width', xScale.bandwidth())
        .attr('height', height - margin.bottom - yScale(d.count))
        .attr('fill', d.color)
        .attr('opacity', 0.8)

      // Add value labels
      svg.append('text')
        .attr('x', (xScale(d.status) || 0) + xScale.bandwidth() / 2)
        .attr('y', yScale(d.count) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(d.count)
    })

  }, [tasks])

  const learningObjectives = [
    "Understand hierarchical goal decomposition strategies",
    "Learn timeline-based planning and dependency management",
    "Explore resource-constrained planning approaches",
    "See how adaptive planning responds to changing conditions"
  ]

  return (
    <SimulationLayout
      title="Planning & Goal Decomposition"
      description="Visualize how AI agents break down complex goals into manageable, executable plans"
      difficulty="Intermediate"
      category="Agent Planning"
      onPlay={() => {
        if (!isExecuting) {
          setIsExecuting(true)
        } else {
          setIsExecuting(false)
        }
      }}
      onReset={() => {
        setIsExecuting(false)
        setIsPlanning(false)
        setCurrentTime(0)
        const newTasks = generateTaskHierarchy(selectedGoal, selectedStrategy)
        setTasks(newTasks)
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
              Goal & Strategy
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal
                </label>
                <select
                  value={selectedGoal.id}
                  onChange={(e) => {
                    const goal = goals.find(g => g.id === e.target.value)
                    if (goal) setSelectedGoal(goal)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planning Strategy
                </label>
                <select
                  value={selectedStrategy.id}
                  onChange={(e) => {
                    const strategy = planningStrategies.find(s => s.id === e.target.value)
                    if (strategy) setSelectedStrategy(strategy)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {planningStrategies.map(strategy => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedStrategy.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Execution Speed: {animationSpeed}ms
                </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="200"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fast</span>
                  <span>Slow</span>
                </div>
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
                    Show task details
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="adaptivePlanning"
                    checked={adaptivePlanning}
                    onChange={(e) => setAdaptivePlanning(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="adaptivePlanning" className="text-sm text-gray-700">
                    Enable adaptive planning
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Goal Details
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900 text-sm mb-1">
                  {selectedGoal.title}
                </div>
                <div className="text-xs text-green-700">
                  {selectedGoal.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Domain</div>
                  <div className="text-sm text-gray-600">{selectedGoal.domain}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Timeframe</div>
                  <div className="text-sm text-gray-600">{selectedGoal.timeframe}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Success Criteria</div>
                <div className="space-y-1">
                  {selectedGoal.success_criteria.slice(0, 3).map((criterion, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start">
                      <CheckCircle className="mr-1 text-green-500 flex-shrink-0" size={12} />
                      {criterion}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Constraints</div>
                <div className="space-y-1">
                  {selectedGoal.constraints.slice(0, 2).map((constraint, index) => (
                    <div key={index} className="text-xs text-gray-600 flex items-start">
                      <AlertCircle className="mr-1 text-orange-500 flex-shrink-0" size={12} />
                      {constraint}
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

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Elapsed Time</span>
                <span>{currentTime} units</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Total Tasks</span>
                <span>{flattenTasks(tasks).length}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{flattenTasks(tasks).filter(t => t.status === 'completed').length}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <span>{flattenTasks(tasks).filter(t => t.status === 'in_progress').length}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${flattenTasks(tasks).length > 0
                      ? (flattenTasks(tasks).filter(t => t.status === 'completed').length / flattenTasks(tasks).length) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedStrategy.name} Visualization
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
                {selectedStrategy.approach}. Tasks are color-coded by status:
                <span className="inline-flex items-center mx-1">
                  <span className="w-3 h-3 bg-gray-500 rounded mr-1"></span>Pending
                </span>
                <span className="inline-flex items-center mx-1">
                  <span className="w-3 h-3 bg-yellow-500 rounded mr-1"></span>In Progress
                </span>
                <span className="inline-flex items-center mx-1">
                  <span className="w-3 h-3 bg-green-500 rounded mr-1"></span>Completed
                </span>
                <span className="inline-flex items-center mx-1">
                  <span className="w-3 h-3 bg-red-500 rounded mr-1"></span>Failed
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart className="mr-2 text-blue-600" size={20} />
                Progress Overview
              </h3>

              <div className="border rounded-lg bg-gray-50 overflow-hidden">
                <svg
                  ref={timelineRef}
                  width="800"
                  height="200"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round((flattenTasks(tasks).filter(t => t.status === 'completed').length / Math.max(flattenTasks(tasks).length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {flattenTasks(tasks).filter(t => t.status !== 'failed').length}
                  </div>
                  <div className="text-sm text-gray-600">On Track</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="mr-2 text-yellow-600" size={20} />
                Planning Insights
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="font-medium text-yellow-900 mb-1">Strategy Benefits</div>
                  <div className="text-sm text-yellow-700">
                    {selectedStrategy.id === 'hierarchical' &&
                      "• Clear task structure\n• Easy delegation\n• Modular progress tracking"}
                    {selectedStrategy.id === 'timeline' &&
                      "• Dependency management\n• Critical path optimization\n• Resource scheduling"}
                    {selectedStrategy.id === 'resource' &&
                      "• Efficient resource allocation\n• Constraint satisfaction\n• Cost optimization"}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Planning Complexity</span>
                    <div className="flex items-center space-x-1">
                      {Array.from({length: 5}).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < selectedGoal.complexity ? 'bg-orange-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Estimated Duration</span>
                    <span>
                      {flattenTasks(tasks).reduce((sum, task) => sum + task.estimatedDuration, 0).toFixed(1)} days
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Critical Path Length</span>
                    <span>{tasks.length} phases</span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded">
                  <div className="font-medium mb-1">Adaptive Planning:</div>
                  {adaptivePlanning ? (
                    <div>✓ Plans adjust based on execution feedback and changing conditions</div>
                  ) : (
                    <div>⚠ Fixed plan execution without adaptation</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Task Details
              </h3>

              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {flattenTasks(tasks).slice(0, 10).map((task) => (
                    <div key={task.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            task.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                        <div>
                          <div className="font-medium">Duration</div>
                          <div>{task.estimatedDuration.toFixed(1)} days</div>
                        </div>
                        <div>
                          <div className="font-medium">Assignee</div>
                          <div>{task.assignee || 'Unassigned'}</div>
                        </div>
                        <div>
                          <div className="font-medium">Confidence</div>
                          <div>{(task.confidence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {flattenTasks(tasks).length > 10 && (
                    <div className="text-center text-sm text-gray-500">
                      ... and {flattenTasks(tasks).length - 10} more tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimulationLayout>
  )
}