'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Brain,
  Database,
  Clock,
  Search,
  Archive,
  Zap,
  Settings,
  Eye,
  Trash2,
  RefreshCw,
  BarChart,
  Lightbulb,
  Target
} from 'lucide-react'

interface MemoryItem {
  id: string
  content: string
  type: 'working' | 'episodic' | 'semantic' | 'procedural'
  timestamp: number
  lastAccessed: number
  importance: number
  strength: number
  associations: string[]
  context: string
  tags: string[]
  decayRate: number
  consolidated: boolean
}

interface MemorySystem {
  working: MemoryItem[]
  episodic: MemoryItem[]
  semantic: MemoryItem[]
  procedural: MemoryItem[]
  capacity: {
    working: number
    episodic: number
    semantic: number
    procedural: number
  }
}

interface RetrievalQuery {
  query: string
  results: MemoryItem[]
  strategy: 'recency' | 'importance' | 'associative' | 'similarity'
  confidence: number
  timestamp: number
}

const memoryTemplates = {
  working: [
    { content: 'Current user query about cats', context: 'conversation', importance: 0.8 },
    { content: 'Recently mentioned "feed the cat"', context: 'task', importance: 0.6 },
    { content: 'Active goal: help with pet care', context: 'goal', importance: 0.9 },
    { content: 'Temporary calculation: 2.5 cups food/day', context: 'computation', importance: 0.4 }
  ],
  episodic: [
    { content: 'User adopted a cat last Tuesday', context: 'personal_event', importance: 0.7 },
    { content: 'Previous conversation about pet nutrition', context: 'dialogue_memory', importance: 0.5 },
    { content: 'User mentioned cat being playful yesterday', context: 'observation', importance: 0.6 },
    { content: 'Successfully helped with cat training advice', context: 'interaction_outcome', importance: 0.8 }
  ],
  semantic: [
    { content: 'Cats are carnivorous mammals', context: 'factual_knowledge', importance: 0.9 },
    { content: 'Feeding schedule affects cat behavior', context: 'domain_knowledge', importance: 0.7 },
    { content: 'Common cat breeds and characteristics', context: 'categorical_knowledge', importance: 0.6 },
    { content: 'Veterinary care best practices', context: 'expert_knowledge', importance: 0.8 }
  ],
  procedural: [
    { content: 'How to analyze pet care questions', context: 'reasoning_skill', importance: 0.8 },
    { content: 'Steps for dietary recommendation', context: 'process_knowledge', importance: 0.7 },
    { content: 'Pattern: identify animal → assess needs → provide advice', context: 'skill_template', importance: 0.9 },
    { content: 'Protocol for handling pet health concerns', context: 'procedure', importance: 0.8 }
  ]
}

const scenarios = [
  {
    id: 'pet_care',
    title: 'Pet Care Assistant',
    description: 'AI assistant helping with pet care questions',
    queries: [
      'How often should I feed my cat?',
      'My cat seems lethargic today',
      'What toys are best for kittens?',
      'How do I train my cat to use a litter box?'
    ]
  },
  {
    id: 'cooking',
    title: 'Cooking Assistant',
    description: 'AI helping with recipe and cooking questions',
    queries: [
      'How do I make pasta carbonara?',
      'Can I substitute eggs in this recipe?',
      'What temperature for roasting chicken?',
      'How long does homemade bread last?'
    ]
  },
  {
    id: 'learning',
    title: 'Learning Tutor',
    description: 'AI tutor helping with educational content',
    queries: [
      'Explain photosynthesis simply',
      'What are the causes of World War I?',
      'How does calculus relate to physics?',
      'Can you help with my math homework?'
    ]
  }
]

export default function MemorySystemsSimulation() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0])
  const [memorySystem, setMemorySystem] = useState<MemorySystem>({
    working: [],
    episodic: [],
    semantic: [],
    procedural: [],
    capacity: { working: 5, episodic: 20, semantic: 50, procedural: 15 }
  })
  const [currentQuery, setCurrentQuery] = useState('')
  const [retrievalHistory, setRetrievalHistory] = useState<RetrievalQuery[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeStep, setTimeStep] = useState(0)
  const [consolidationRate, setConsolidationRate] = useState(0.1)
  const [decayEnabled, setDecayEnabled] = useState(true)
  const [showInternalState, setShowInternalState] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const networkRef = useRef<SVGSVGElement>(null)

  // Initialize memory system
  useEffect(() => {
    const initializeMemory = () => {
      const newMemorySystem: MemorySystem = {
        working: [],
        episodic: [],
        semantic: [],
        procedural: [],
        capacity: { working: 5, episodic: 20, semantic: 50, procedural: 15 }
      }

      Object.entries(memoryTemplates).forEach(([type, templates]) => {
        templates.forEach((template, index) => {
          const item = {
            id: `${type}-${index}`,
            content: template.content,
            type: type as any,
            timestamp: timeStep - Math.random() * 100,
            lastAccessed: timeStep - Math.random() * 50,
            importance: template.importance,
            strength: 0.5 + Math.random() * 0.5,
            associations: [],
            context: template.context,
            tags: template.content.split(' ').slice(0, 3),
            decayRate: 0.01 + Math.random() * 0.02,
            consolidated: Math.random() > 0.5
          } as MemoryItem

          (newMemorySystem[type as keyof Omit<MemorySystem, 'capacity'>] as MemoryItem[]).push(item)
        })
      })

      // Add associations
      Object.values(newMemorySystem).flat().forEach(item => {
        const relatedItems = Object.values(newMemorySystem).flat()
          .filter(other => other.id !== item.id)
          .filter(() => Math.random() > 0.7)
          .slice(0, 2)

        item.associations = relatedItems.map(related => related.id)
      })

      setMemorySystem(newMemorySystem)
    }

    initializeMemory()
  }, [selectedScenario])

  // Memory decay and consolidation
  useEffect(() => {
    if (!decayEnabled) return

    const interval = setInterval(() => {
      setTimeStep(prev => prev + 1)

      setMemorySystem(prevSystem => {
        const newSystem = { ...prevSystem }

        Object.entries(newSystem).forEach(([type, memories]) => {
          if (type === 'capacity') return

          const updatedMemories = (memories as MemoryItem[]).map(memory => {
            let newStrength = memory.strength

            // Decay unused memories
            const timeSinceAccess = timeStep - memory.lastAccessed
            if (timeSinceAccess > 10) {
              newStrength -= memory.decayRate
            }

            // Consolidation strengthens important memories
            if (memory.importance > 0.7 && Math.random() < consolidationRate) {
              newStrength += 0.05
              return { ...memory, strength: Math.min(newStrength, 1.0), consolidated: true }
            }

            return { ...memory, strength: Math.max(newStrength, 0.1) }
          })

          // Remove very weak memories (except from semantic/procedural)
          const filteredMemories = type === 'semantic' || type === 'procedural'
            ? updatedMemories
            : updatedMemories.filter(m => m.strength > 0.2)

          // Respect capacity limits
          const sortedByStrength = filteredMemories.sort((a, b) => b.strength - a.strength)
          const capacity = newSystem.capacity[type as keyof typeof newSystem.capacity] as number

          newSystem[type as keyof typeof newSystem] = sortedByStrength.slice(0, capacity) as any
        })

        return newSystem
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [decayEnabled, timeStep, consolidationRate])

  const processQuery = async (query: string) => {
    setIsProcessing(true)
    setCurrentQuery(query)

    // Add to working memory
    const workingMemory: MemoryItem = {
      id: `working-${Date.now()}`,
      content: `Query: ${query}`,
      type: 'working',
      timestamp: timeStep,
      lastAccessed: timeStep,
      importance: 0.8,
      strength: 1.0,
      associations: [],
      context: 'current_query',
      tags: query.split(' ').slice(0, 3),
      decayRate: 0.05,
      consolidated: false
    }

    setMemorySystem(prev => ({
      ...prev,
      working: [workingMemory, ...prev.working].slice(0, prev.capacity.working)
    }))

    // Simulate retrieval
    await new Promise(resolve => setTimeout(resolve, 1500))

    const allMemories = Object.values(memorySystem).flat().filter(Array.isArray)
      .flat() as MemoryItem[]

    // Similarity-based retrieval
    const queryWords = query.toLowerCase().split(' ')
    const retrievedMemories = allMemories
      .map(memory => {
        const memoryWords = memory.content.toLowerCase().split(' ')
        const overlap = queryWords.filter(word => memoryWords.some(mWord => mWord.includes(word)))
        const similarity = overlap.length / queryWords.length
        const recencyBoost = Math.exp(-(timeStep - memory.lastAccessed) / 20)
        const score = similarity * 0.6 + memory.importance * 0.3 + recencyBoost * 0.1

        return { memory, score }
      })
      .filter(result => result.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(result => {
        // Update last accessed
        result.memory.lastAccessed = timeStep
        return result.memory
      })

    const retrieval: RetrievalQuery = {
      query,
      results: retrievedMemories,
      strategy: 'similarity',
      confidence: retrievedMemories.length > 0 ? 0.7 + Math.random() * 0.3 : 0.3,
      timestamp: timeStep
    }

    setRetrievalHistory(prev => [retrieval, ...prev.slice(0, 9)])

    // Create episodic memory of this interaction
    const episodicMemory: MemoryItem = {
      id: `episodic-${Date.now()}`,
      content: `User asked: "${query}" - Retrieved ${retrievedMemories.length} relevant memories`,
      type: 'episodic',
      timestamp: timeStep,
      lastAccessed: timeStep,
      importance: 0.6 + retrievedMemories.length * 0.1,
      strength: 0.8,
      associations: retrievedMemories.map(m => m.id),
      context: 'query_interaction',
      tags: ['query', 'retrieval', ...queryWords.slice(0, 2)],
      decayRate: 0.02,
      consolidated: false
    }

    setTimeout(() => {
      setMemorySystem(prev => ({
        ...prev,
        episodic: [episodicMemory, ...prev.episodic].slice(0, prev.capacity.episodic)
      }))
      setIsProcessing(false)
    }, 500)
  }

  const getAllMemories = () => {
    return [
      ...memorySystem.working,
      ...memorySystem.episodic,
      ...memorySystem.semantic,
      ...memorySystem.procedural
    ]
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 500
    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    // Memory type visualization
    const memoryTypes = [
      { type: 'working', label: 'Working Memory', color: '#f59e0b', x: 100, y: 100 },
      { type: 'episodic', label: 'Episodic Memory', color: '#3b82f6', x: 300, y: 100 },
      { type: 'semantic', label: 'Semantic Memory', color: '#10b981', x: 500, y: 100 },
      { type: 'procedural', label: 'Procedural Memory', color: '#8b5cf6', x: 700, y: 100 }
    ]

    memoryTypes.forEach(memType => {
      const memories = memorySystem[memType.type as keyof typeof memorySystem] as MemoryItem[]
      const capacity = memorySystem.capacity[memType.type as keyof typeof memorySystem.capacity]

      // Memory container
      svg.append('rect')
        .attr('x', memType.x - 80)
        .attr('y', memType.y - 60)
        .attr('width', 160)
        .attr('height', 300)
        .attr('fill', memType.color)
        .attr('opacity', 0.1)
        .attr('stroke', memType.color)
        .attr('stroke-width', 2)
        .attr('rx', 10)

      // Type label
      svg.append('text')
        .attr('x', memType.x)
        .attr('y', memType.y - 70)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', memType.color)
        .text(memType.label)

      // Capacity indicator
      svg.append('text')
        .attr('x', memType.x)
        .attr('y', memType.y - 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6b7280')
        .text(`${memories.length}/${capacity}`)

      // Memory items
      memories.slice(0, 8).forEach((memory, index) => {
        const itemY = memType.y - 20 + index * 25
        const opacity = Math.max(memory.strength, 0.3)

        // Memory item
        svg.append('rect')
          .attr('x', memType.x - 70)
          .attr('y', itemY)
          .attr('width', 140)
          .attr('height', 20)
          .attr('fill', memType.color)
          .attr('opacity', opacity)
          .attr('rx', 3)

        // Memory content
        svg.append('text')
          .attr('x', memType.x)
          .attr('y', itemY + 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '9px')
          .style('fill', 'white')
          .style('font-weight', 'bold')
          .text(memory.content.slice(0, 20) + '...')

        // Strength indicator
        if (memory.consolidated) {
          svg.append('circle')
            .attr('cx', memType.x + 60)
            .attr('cy', itemY + 10)
            .attr('r', 4)
            .attr('fill', '#fbbf24')
        }
      })

      if (memories.length > 8) {
        svg.append('text')
          .attr('x', memType.x)
          .attr('y', memType.y + 180)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', '#6b7280')
          .text(`+${memories.length - 8} more`)
      }
    })

    // Draw associations
    if (showInternalState) {
      const allMemories = getAllMemories()
      allMemories.forEach(memory => {
        memory.associations.forEach(assocId => {
          const associatedMemory = allMemories.find(m => m.id === assocId)
          if (!associatedMemory) return

          const sourceType = memoryTypes.find(t => t.type === memory.type)
          const targetType = memoryTypes.find(t => t.type === associatedMemory.type)

          if (sourceType && targetType) {
            svg.append('line')
              .attr('x1', sourceType.x)
              .attr('y1', sourceType.y + 50)
              .attr('x2', targetType.x)
              .attr('y2', targetType.y + 50)
              .attr('stroke', '#d1d5db')
              .attr('stroke-width', 1)
              .attr('opacity', 0.3)
              .attr('stroke-dasharray', '2,2')
          }
        })
      })
    }

  }, [memorySystem, showInternalState])

  const learningObjectives = [
    "Understand different types of memory systems in AI agents",
    "Explore memory consolidation and decay mechanisms",
    "Learn about associative memory retrieval strategies",
    "See how working memory manages current context"
  ]

  return (
    <SimulationLayout
      title="Memory Systems"
      description="Explore how AI agents manage different types of memory for context and learning"
      difficulty="Advanced"
      category="Agent Memory"
      onPlay={() => {
        const queries = selectedScenario.queries
        const randomQuery = queries[Math.floor(Math.random() * queries.length)]
        processQuery(randomQuery)
      }}
      onReset={() => {
        setMemorySystem({
          working: [],
          episodic: [],
          semantic: [],
          procedural: [],
          capacity: { working: 5, episodic: 20, semantic: 50, procedural: 15 }
        })
        setRetrievalHistory([])
        setTimeStep(0)
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
              Memory Configuration
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
                      {scenario.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedScenario.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Query
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    placeholder="Enter your query..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => currentQuery && processQuery(currentQuery)}
                    disabled={isProcessing || !currentQuery.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consolidation Rate: {consolidationRate.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="0.3"
                  step="0.01"
                  value={consolidationRate}
                  onChange={(e) => setConsolidationRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="decayEnabled"
                    checked={decayEnabled}
                    onChange={(e) => setDecayEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="decayEnabled" className="text-sm text-gray-700">
                    Enable memory decay
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showInternalState"
                    checked={showInternalState}
                    onChange={(e) => setShowInternalState(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showInternalState" className="text-sm text-gray-700">
                    Show associations
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Quick Queries
            </h3>

            <div className="space-y-2">
              {selectedScenario.queries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => processQuery(query)}
                  disabled={isProcessing}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="mr-2 text-purple-600" size={20} />
              System Status
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Time Step:</span>
                <span>{timeStep}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Memories:</span>
                <span>{getAllMemories().length}</span>
              </div>

              <div className="flex justify-between">
                <span>Consolidated:</span>
                <span>{getAllMemories().filter(m => m.consolidated).length}</span>
              </div>

              <div className="flex justify-between">
                <span>Recent Queries:</span>
                <span>{retrievalHistory.length}</span>
              </div>

              {isProcessing && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Processing query...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visualization Panels */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Memory System Architecture
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
                Memory items fade based on strength and importance. Golden dots indicate consolidated memories.
                Dashed lines show associative connections between memories.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Search className="mr-2 text-blue-600" size={20} />
                Recent Retrievals
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {retrievalHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Eye className="mx-auto mb-2" size={32} />
                    <p>No queries processed yet</p>
                    <p className="text-sm">Try one of the sample queries</p>
                  </div>
                ) : (
                  retrievalHistory.map((retrieval, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm">
                          &quot;{retrieval.query}&quot;
                        </div>
                        <div className="text-xs text-gray-500">
                          {(retrieval.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-2">
                        Strategy: {retrieval.strategy} • {retrieval.results.length} results
                      </div>

                      <div className="space-y-1">
                        {retrieval.results.slice(0, 3).map((result, resultIndex) => (
                          <div key={resultIndex} className="text-xs p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="capitalize font-medium">{result.type}:</span>
                              <span className="text-gray-500">
                                {(result.strength * 100).toFixed(0)}% strength
                              </span>
                            </div>
                            <div className="text-gray-600">
                              {result.content.slice(0, 40)}...
                            </div>
                          </div>
                        ))}
                        {retrieval.results.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{retrieval.results.length - 3} more results
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart className="mr-2 text-green-600" size={20} />
                Memory Statistics
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(memorySystem.capacity).map(([type, capacity]) => {
                    const memories = memorySystem[type as keyof typeof memorySystem] as MemoryItem[]
                    const count = Array.isArray(memories) ? memories.length : 0
                    const utilization = (count / capacity) * 100

                    return (
                      <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                          {count}/{capacity}
                        </div>
                        <div className="text-sm text-gray-600 capitalize mb-1">
                          {type} Memory
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${utilization}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {utilization.toFixed(0)}% utilized
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="font-medium text-blue-900 mb-1">Memory Types</div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div><strong>Working:</strong> Current active information</div>
                      <div><strong>Episodic:</strong> Personal experiences and events</div>
                      <div><strong>Semantic:</strong> Facts and general knowledge</div>
                      <div><strong>Procedural:</strong> Skills and procedures</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Consolidation:</strong> Important memories become stronger</div>
                    <div><strong>Decay:</strong> Unused memories weaken over time</div>
                    <div><strong>Associations:</strong> Related memories link together</div>
                    <div><strong>Retrieval:</strong> Queries activate relevant memories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="mr-2 text-yellow-600" size={20} />
              Memory Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-medium text-gray-900 mb-2">Retrieval Patterns</div>
                <div className="space-y-2">
                  {['recency', 'importance', 'associative', 'similarity'].map(strategy => {
                    const count = retrievalHistory.filter(r => r.strategy === strategy).length
                    const percentage = retrievalHistory.length > 0 ? (count / retrievalHistory.length) * 100 : 0

                    return (
                      <div key={strategy} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{strategy}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{count}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-900 mb-2">System Health</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Memory Strength</span>
                    <span>
                      {getAllMemories().length > 0
                        ? (getAllMemories().reduce((sum, m) => sum + m.strength, 0) / getAllMemories().length * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Consolidation Rate</span>
                    <span>{(consolidationRate * 100).toFixed(1)}%/step</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Association Density</span>
                    <span>
                      {getAllMemories().length > 0
                        ? (getAllMemories().reduce((sum, m) => sum + m.associations.length, 0) / getAllMemories().length).toFixed(1)
                        : 0} links/memory
                    </span>
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