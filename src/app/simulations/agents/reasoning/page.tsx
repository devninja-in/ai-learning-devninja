'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  GitBranch,
  ArrowRight,
  Brain,
  Target,
  Settings,
  Play,
  TreePine,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  BarChart,
  Clock
} from 'lucide-react'

interface ReasoningStep {
  id: string
  content: string
  confidence: number
  parentId?: string
  children: string[]
  depth: number
  isSelected: boolean
  isExplored: boolean
  timestamp: number
  reasoning: string
  outcome?: 'success' | 'failure' | 'partial'
}

interface Problem {
  id: string
  title: string
  description: string
  question: string
  complexity: number
  domain: string
  expectedSteps: { cot: number; tot: number }
  correctAnswer: string
}

const problems: Problem[] = [
  {
    id: 'logic_puzzle',
    title: 'Logic Puzzle',
    description: 'A classic logic reasoning challenge',
    question: 'Five people live in five houses of different colors. Each person drinks a different beverage, smokes a different brand of cigar, and keeps a different pet. Who owns the fish?',
    complexity: 4,
    domain: 'Logic',
    expectedSteps: { cot: 8, tot: 15 },
    correctAnswer: 'The German owns the fish'
  },
  {
    id: 'math_optimization',
    title: 'Math Optimization',
    description: 'Finding the optimal solution to a mathematical problem',
    question: 'A farmer has 100 feet of fencing. What dimensions should a rectangular pen have to maximize the enclosed area?',
    complexity: 3,
    domain: 'Mathematics',
    expectedSteps: { cot: 6, tot: 12 },
    correctAnswer: '25 × 25 square (area = 625 sq ft)'
  },
  {
    id: 'strategy_game',
    title: 'Strategy Game',
    description: 'Multi-step strategic decision making',
    question: 'In chess, you are white. Your opponent just moved their queen to attack your king and rook simultaneously. What is your best response?',
    complexity: 5,
    domain: 'Strategy',
    expectedSteps: { cot: 5, tot: 20 },
    correctAnswer: 'Castle kingside to safety while protecting the rook'
  },
  {
    id: 'creative_problem',
    title: 'Creative Problem',
    description: 'Open-ended creative solution finding',
    question: 'Design a system to reduce food waste in restaurants by 50% within 6 months.',
    complexity: 4,
    domain: 'Design',
    expectedSteps: { cot: 7, tot: 18 },
    correctAnswer: 'AI-powered demand prediction + dynamic pricing + donation network'
  }
]

const reasoningMethods = [
  {
    id: 'cot',
    name: 'Chain of Thought',
    description: 'Sequential step-by-step reasoning',
    characteristics: [
      'Linear progression',
      'Single reasoning path',
      'Fast execution',
      'Good for well-defined problems'
    ],
    color: '#3b82f6'
  },
  {
    id: 'tot',
    name: 'Tree of Thought',
    description: 'Parallel exploration of multiple reasoning paths',
    characteristics: [
      'Branching exploration',
      'Multiple paths considered',
      'Backtracking capability',
      'Better for complex problems'
    ],
    color: '#10b981'
  }
]

export default function ReasoningStrategiesSimulation() {
  const [selectedProblem, setSelectedProblem] = useState(problems[0])
  const [selectedMethod, setSelectedMethod] = useState<'cot' | 'tot' | 'comparison'>('comparison')
  const [cotSteps, setCotSteps] = useState<ReasoningStep[]>([])
  const [totSteps, setTotSteps] = useState<ReasoningStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1500)
  const [showMetrics, setShowMetrics] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const comparisonRef = useRef<SVGSVGElement>(null)

  const generateCoTSequence = (problem: Problem): ReasoningStep[] => {
    const templates = {
      logic_puzzle: [
        'Let me list the constraints: 5 houses, 5 colors, 5 beverages, 5 cigars, 5 pets',
        'From clue 1: The Brit lives in the red house',
        'From clue 2: The Swede keeps dogs as pets',
        'From clue 3: The Dane drinks tea',
        'Combining clues 4 & 5: Green house is to the left of white house, coffee drinker lives in green house',
        'From clue 6: The person who smokes Pall Mall rears birds',
        'Working through the remaining constraints systematically...',
        'The German must own the fish by process of elimination'
      ],
      math_optimization: [
        'Let width = w and length = l, with perimeter constraint: 2w + 2l = 100',
        'So l = 50 - w, and area = w × l = w(50 - w) = 50w - w²',
        'To maximize area, take derivative: dA/dw = 50 - 2w',
        'Set derivative to zero: 50 - 2w = 0, so w = 25',
        'Therefore l = 50 - 25 = 25',
        'Maximum area = 25 × 25 = 625 square feet'
      ],
      strategy_game: [
        'Analyze the threat: Queen attacks both king and rook',
        'Consider options: Move king, move rook, or block the attack',
        'Evaluate castling: King moves to safety, rook is protected',
        'Check if castling is legal: King and rook haven&apos;t moved, no pieces between',
        'Castle kingside - best solution!'
      ],
      creative_problem: [
        'Identify waste sources: overproduction, spoilage, customer leftovers',
        'Analyze data: track when and what gets wasted',
        'Implement demand prediction using historical data and AI',
        'Create dynamic pricing to sell excess inventory',
        'Partner with food banks for donation pickup',
        'Train staff on portion control and inventory management',
        'Measure results and iterate on the system'
      ]
    }

    const stepContents = templates[problem.domain.toLowerCase() as keyof typeof templates] || templates.logic_puzzle

    return stepContents.map((content, index) => ({
      id: `cot-${index}`,
      content,
      confidence: 0.7 + Math.random() * 0.3,
      children: [],
      depth: 0,
      isSelected: true,
      isExplored: true,
      timestamp: index * 1000,
      reasoning: `Sequential step ${index + 1} in chain of reasoning`,
      outcome: Math.random() > 0.9 ? 'partial' : 'success'
    }))
  }

  const generateToTSequence = (problem: Problem): ReasoningStep[] => {
    const steps: ReasoningStep[] = []
    let idCounter = 0

    const addStep = (content: string, parentId?: string, depth: number = 0): string => {
      const id = `tot-${idCounter++}`
      steps.push({
        id,
        content,
        confidence: 0.6 + Math.random() * 0.4,
        parentId,
        children: [],
        depth,
        isSelected: false,
        isExplored: false,
        timestamp: steps.length * 800,
        reasoning: `Exploration at depth ${depth}`,
        outcome: Math.random() > 0.8 ? 'failure' : Math.random() > 0.6 ? 'partial' : 'success'
      })

      // Update parent's children
      if (parentId) {
        const parent = steps.find(s => s.id === parentId)
        if (parent) parent.children.push(id)
      }

      return id
    }

    if (problem.domain === 'Logic') {
      const root = addStep('Start with constraint analysis', undefined, 0)

      const approach1 = addStep('Approach 1: House-by-house analysis', root, 1)
      addStep('House 1: Could be British + Red', approach1, 2)
      addStep('House 1: Could be Norwegian + Yellow', approach1, 2)

      const approach2 = addStep('Approach 2: Pet-centric analysis', root, 1)
      addStep('Who has dogs? Must be Swede', approach2, 2)
      addStep('Who has birds? Pall Mall smoker', approach2, 2)
      addStep('Who has fish? Process of elimination', approach2, 2)

      const approach3 = addStep('Approach 3: Beverage constraints first', root, 1)
      addStep('Tea drinker is Danish', approach3, 2)
      addStep('Coffee in green house', approach3, 2)
      addStep('Green left of white house', approach3, 2)

    } else if (problem.domain === 'Mathematics') {
      const root = addStep('Optimization problem: maximize area', undefined, 0)

      const calc1 = addStep('Method 1: Calculus approach', root, 1)
      addStep('Set up equation: A = w(50-w)', calc1, 2)
      addStep('Take derivative: dA/dw = 50-2w', calc1, 2)

      const calc2 = addStep('Method 2: Completing the square', root, 1)
      addStep('A = 50w - w² = -(w²-50w)', calc2, 2)
      addStep('A = -(w-25)² + 625', calc2, 2)

      const calc3 = addStep('Method 3: Graphical analysis', root, 1)
      addStep('Plot parabola A = 50w - w²', calc3, 2)
      addStep('Find vertex at w = 25', calc3, 2)

    } else {
      // Generic tree structure
      const root = addStep(`Analyze: ${problem.question.slice(0, 30)}...`, undefined, 0)

      for (let i = 1; i <= 3; i++) {
        const branch = addStep(`Approach ${i}: Different strategy`, root, 1)
        for (let j = 1; j <= 3; j++) {
          addStep(`Option ${i}.${j}: Specific implementation`, branch, 2)
        }
      }
    }

    // Simulate exploration order
    const explorationOrder = [0, 1, 3, 4, 2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].filter(i => i < steps.length)
    explorationOrder.forEach((index, order) => {
      if (steps[index]) {
        steps[index].timestamp = order * 1000
        steps[index].isExplored = true
        if (order < explorationOrder.length - 2) {
          steps[index].isSelected = false
        } else {
          steps[index].isSelected = true // Best path
        }
      }
    })

    return steps
  }

  useEffect(() => {
    const newCotSteps = generateCoTSequence(selectedProblem)
    const newTotSteps = generateToTSequence(selectedProblem)
    setCotSteps(newCotSteps)
    setTotSteps(newTotSteps)
    setCurrentStep(0)
  }, [selectedProblem])

  const currentSteps = selectedMethod === 'cot' ? cotSteps :
                     selectedMethod === 'tot' ? totSteps :
                     [...cotSteps, ...totSteps]

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 900
    const height = 600
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    if (selectedMethod === 'cot') {
      // Linear chain visualization
      const stepHeight = (height - margin.top - margin.bottom) / Math.max(cotSteps.length, 1)
      const centerX = width / 2

      cotSteps.forEach((step, index) => {
        const y = margin.top + index * stepHeight + stepHeight / 2
        const isActive = index === currentStep && isRunning
        const isCompleted = index < currentStep

        // Step circle
        svg.append('circle')
          .attr('cx', centerX)
          .attr('cy', y)
          .attr('r', isActive ? 20 : 15)
          .attr('fill', isCompleted ? '#3b82f6' : isActive ? '#1d4ed8' : '#e5e7eb')
          .attr('stroke', isActive ? '#ffffff' : '#3b82f6')
          .attr('stroke-width', isActive ? 3 : 1)
          .style('filter', isActive ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none')

        // Step number
        svg.append('text')
          .attr('x', centerX)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('fill', isCompleted || isActive ? 'white' : '#6b7280')
          .text(index + 1)

        // Step content
        svg.append('text')
          .attr('x', centerX + 40)
          .attr('y', y)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('fill', isCompleted ? '#1f2937' : isActive ? '#1d4ed8' : '#6b7280')
          .text(step.content.slice(0, 60) + (step.content.length > 60 ? '...' : ''))

        // Connection line
        if (index < cotSteps.length - 1) {
          svg.append('line')
            .attr('x1', centerX)
            .attr('y1', y + (isActive ? 20 : 15))
            .attr('x2', centerX)
            .attr('y2', y + stepHeight - (isActive ? 20 : 15))
            .attr('stroke', isCompleted ? '#3b82f6' : '#e5e7eb')
            .attr('stroke-width', 2)

          // Arrow
          svg.append('polygon')
            .attr('points', `${centerX-5},${y + stepHeight - 10} ${centerX+5},${y + stepHeight - 10} ${centerX},${y + stepHeight - 5}`)
            .attr('fill', isCompleted ? '#3b82f6' : '#e5e7eb')
        }

        // Confidence indicator
        if (isCompleted || isActive) {
          svg.append('rect')
            .attr('x', centerX - 50)
            .attr('y', y - 5)
            .attr('width', 30)
            .attr('height', 10)
            .attr('fill', '#e5e7eb')
            .attr('rx', 5)

          svg.append('rect')
            .attr('x', centerX - 50)
            .attr('y', y - 5)
            .attr('width', 30 * step.confidence)
            .attr('height', 10)
            .attr('fill', '#10b981')
            .attr('rx', 5)
        }
      })

    } else if (selectedMethod === 'tot') {
      // Tree visualization
      const nodeRadius = 12
      const levelWidth = 200

      // Calculate positions using tree layout
      const hierarchy = d3.stratify<ReasoningStep>()
        .id(d => d.id)
        .parentId(d => d.parentId)(totSteps)

      const treeLayout = d3.tree<ReasoningStep>()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right])

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
          .attr('stroke', link.target.data.isSelected ? '#10b981' : '#d1d5db')
          .attr('stroke-width', link.target.data.isSelected ? 3 : 1)
          .attr('opacity', link.target.data.isExplored ? 1 : 0.3)
      })

      // Draw nodes
      root.descendants().forEach(node => {
        const x = margin.left + node.y!
        const y = margin.top + node.x!
        const isExplored = node.data.isExplored
        const isSelected = node.data.isSelected

        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', nodeRadius)
          .attr('fill', isSelected ? '#10b981' : isExplored ? '#3b82f6' : '#e5e7eb')
          .attr('stroke', isSelected ? '#065f46' : '#1e40af')
          .attr('stroke-width', isSelected ? 3 : 1)
          .attr('opacity', isExplored ? 1 : 0.3)

        // Node labels
        svg.append('text')
          .attr('x', x + nodeRadius + 5)
          .attr('y', y)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '10px')
          .style('fill', isSelected ? '#065f46' : isExplored ? '#1e40af' : '#6b7280')
          .text(node.data.content.slice(0, 30) + '...')
      })
    }

  }, [selectedMethod, cotSteps, totSteps, currentStep, isRunning])

  useEffect(() => {
    if (!comparisonRef.current) return

    const svg = d3.select(comparisonRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 300
    const margin = { top: 40, right: 40, bottom: 60, left: 80 }

    const metrics = [
      {
        name: 'Steps Explored',
        cot: cotSteps.length,
        tot: totSteps.filter(s => s.isExplored).length
      },
      {
        name: 'Avg Confidence',
        cot: cotSteps.reduce((sum, s) => sum + s.confidence, 0) / Math.max(cotSteps.length, 1) * 100,
        tot: totSteps.filter(s => s.isExplored).reduce((sum, s) => sum + s.confidence, 0) / Math.max(totSteps.filter(s => s.isExplored).length, 1) * 100
      },
      {
        name: 'Time to Solution',
        cot: cotSteps.length * 1.5,
        tot: totSteps.filter(s => s.isExplored).length * 0.8
      },
      {
        name: 'Exploration Depth',
        cot: 1,
        tot: Math.max(...totSteps.map(s => s.depth), 0) + 1
      }
    ]

    const xScale = d3.scaleBand()
      .domain(metrics.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(metrics, d => Math.max(d.cot, d.tot)) || 100])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    const barWidth = xScale.bandwidth() / 2

    // CoT bars
    svg.selectAll('.cot-bar')
      .data(metrics)
      .enter()
      .append('rect')
      .attr('class', 'cot-bar')
      .attr('x', d => (xScale(d.name) || 0))
      .attr('y', d => yScale(d.cot))
      .attr('width', barWidth)
      .attr('height', d => height - margin.bottom - yScale(d.cot))
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.8)

    // ToT bars
    svg.selectAll('.tot-bar')
      .data(metrics)
      .enter()
      .append('rect')
      .attr('class', 'tot-bar')
      .attr('x', d => (xScale(d.name) || 0) + barWidth)
      .attr('y', d => yScale(d.tot))
      .attr('width', barWidth)
      .attr('height', d => height - margin.bottom - yScale(d.tot))
      .attr('fill', '#10b981')
      .attr('opacity', 0.8)

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, ${margin.top})`)

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#3b82f6')

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '12px')
      .text('Chain of Thought')

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#10b981')

    legend.append('text')
      .attr('x', 20)
      .attr('y', 32)
      .style('font-size', '12px')
      .text('Tree of Thought')

  }, [cotSteps, totSteps])

  const learningObjectives = [
    "Compare Chain of Thought vs Tree of Thought reasoning strategies",
    "Understand when to use linear vs branching approaches",
    "Explore the trade-offs between exploration depth and efficiency",
    "Learn how different problems benefit from different reasoning methods"
  ]

  return (
    <SimulationLayout
      title="Reasoning Strategies"
      description="Compare Chain of Thought vs Tree of Thought reasoning approaches"
      difficulty="Intermediate"
      category="Agent Reasoning"
      onPlay={() => setIsRunning(!isRunning)}
      onReset={() => {
        setIsRunning(false)
        setCurrentStep(0)
        const newCotSteps = generateCoTSequence(selectedProblem)
        const newTotSteps = generateToTSequence(selectedProblem)
        setCotSteps(newCotSteps)
        setTotSteps(newTotSteps)
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
              Problem & Method
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Type
                </label>
                <select
                  value={selectedProblem.id}
                  onChange={(e) => {
                    const problem = problems.find(p => p.id === e.target.value)
                    if (problem) setSelectedProblem(problem)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {problems.map(problem => (
                    <option key={problem.id} value={problem.id}>
                      {problem.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reasoning Method
                </label>
                <div className="space-y-2">
                  {['cot', 'tot', 'comparison'].map(method => (
                    <label key={method} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="method"
                        value={method}
                        checked={selectedMethod === method}
                        onChange={() => setSelectedMethod(method as any)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">
                        {method === 'cot' ? 'Chain of Thought' :
                         method === 'tot' ? 'Tree of Thought' : 'Side-by-Side'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animation Speed: {animationSpeed}ms
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showMetrics"
                  checked={showMetrics}
                  onChange={(e) => setShowMetrics(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="showMetrics" className="text-sm text-gray-700">
                  Show performance metrics
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Current Problem
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900 text-sm mb-1">
                  {selectedProblem.title}
                </div>
                <div className="text-xs text-blue-700">
                  {selectedProblem.description}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Question</div>
                <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                  {selectedProblem.question}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Domain</div>
                  <div className="text-sm text-gray-600">{selectedProblem.domain}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Complexity</div>
                  <div className="flex items-center space-x-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < selectedProblem.complexity ? 'bg-orange-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Expected Answer</div>
                <div className="text-xs text-green-700 p-2 bg-green-50 rounded">
                  {selectedProblem.correctAnswer}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Method Comparison
            </h3>

            <div className="space-y-4">
              {reasoningMethods.map(method => (
                <div key={method.id} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    {method.id === 'cot' ? (
                      <ArrowRight className="text-blue-600" size={16} />
                    ) : (
                      <GitBranch className="text-green-600" size={16} />
                    )}
                    <div className="font-medium text-sm" style={{ color: method.color }}>
                      {method.name}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {method.description}
                  </div>
                  <div className="space-y-1">
                    {method.characteristics.map((char, index) => (
                      <div key={index} className="text-xs text-gray-500 flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedMethod === 'cot' ? 'Chain of Thought Process' :
               selectedMethod === 'tot' ? 'Tree of Thought Exploration' :
               'Reasoning Method Comparison'}
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
                {selectedMethod === 'cot' && "Chain of Thought follows a linear, sequential reasoning path from problem to solution."}
                {selectedMethod === 'tot' && "Tree of Thought explores multiple reasoning branches, allowing for backtracking and parallel exploration."}
                {selectedMethod === 'comparison' && "Compare both methods side-by-side to understand their different approaches to problem-solving."}
              </p>
            </div>
          </div>

          {showMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart className="mr-2 text-purple-600" size={20} />
                  Performance Metrics
                </h3>

                <div className="border rounded-lg bg-gray-50 overflow-hidden">
                  <svg
                    ref={comparisonRef}
                    width="800"
                    height="300"
                    className="w-full h-auto"
                  />
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>Quantitative comparison of Chain of Thought vs Tree of Thought approaches across key performance dimensions.</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="mr-2 text-yellow-600" size={20} />
                  Method Analysis
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {cotSteps.length}
                      </div>
                      <div className="text-sm text-gray-600">CoT Steps</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {totSteps.filter(s => s.isExplored).length}
                      </div>
                      <div className="text-sm text-gray-600">ToT Explored</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-blue-900 mb-1">Chain of Thought</div>
                      <div className="text-sm text-blue-700">
                        • Faster execution ({cotSteps.length} steps)
                        <br />
                        • Single reasoning path
                        <br />
                        • Good for linear problems
                        <br />
                        • Lower computational cost
                      </div>
                    </div>

                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-900 mb-1">Tree of Thought</div>
                      <div className="text-sm text-green-700">
                        • More thorough exploration
                        <br />
                        • Multiple paths considered
                        <br />
                        • Better for complex problems
                        <br />
                        • Higher quality solutions
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 p-3 bg-yellow-50 rounded">
                      <div className="font-medium mb-1">When to Use Each:</div>
                      <div><strong>CoT:</strong> Well-defined problems, speed priority, resource constraints</div>
                      <div><strong>ToT:</strong> Complex problems, quality priority, creative tasks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step-by-Step Analysis
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="font-medium text-blue-600 mb-3 flex items-center">
                  <ArrowRight className="mr-2" size={16} />
                  Chain of Thought
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cotSteps.map((step, index) => (
                    <div key={step.id} className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium">Step {index + 1}</div>
                      <div className="text-gray-700">{step.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Confidence: {(step.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-medium text-green-600 mb-3 flex items-center">
                  <GitBranch className="mr-2" size={16} />
                  Tree of Thought
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {totSteps.filter(s => s.isExplored).map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-2 rounded text-sm ${
                        step.isSelected ? 'bg-green-100 border-l-4 border-green-500' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          Depth {step.depth}: {step.isSelected ? '✓ Selected' : 'Explored'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(step.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-gray-700">{step.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}