'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Brain,
  RefreshCw,
  GitBranch,
  Target,
  Users,
  Cog,
  Eye,
  TreePine,
  MessageSquare,
  BarChart,
  ArrowRight,
  Lightbulb,
  Activity,
  BookOpen,
  Play,
  Workflow,
  Network,
  Layers,
  Zap,
  Shield,
  Clock
} from 'lucide-react'

const agentSimulations = [
  {
    id: 'core-loop',
    title: 'Core Agent Loop',
    description: 'Understand the fundamental Observe → Think → Act → Reflect cycle',
    icon: RefreshCw,
    href: '/simulations/agents/core-loop',
    difficulty: 'Beginner',
    category: 'Fundamentals',
    concepts: ['Agent Architecture', 'Decision Cycles', 'State Management'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'react-framework',
    title: 'ReAct Framework',
    description: 'Explore Reasoning + Acting interleaved for enhanced problem solving',
    icon: Brain,
    href: '/simulations/agents/react',
    difficulty: 'Intermediate',
    category: 'Reasoning',
    concepts: ['ReAct Pattern', 'Thought-Action Loops', 'Interleaved Processing'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'reasoning-strategies',
    title: 'Reasoning Strategies',
    description: 'Compare Chain of Thought vs Tree of Thought reasoning approaches',
    icon: GitBranch,
    href: '/simulations/agents/reasoning',
    difficulty: 'Intermediate',
    category: 'Reasoning',
    concepts: ['CoT vs ToT', 'Parallel Reasoning', 'Path Exploration'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'planning',
    title: 'Planning & Goal Decomposition',
    description: 'Visualize hierarchical planning and dynamic goal breakdown',
    icon: Target,
    href: '/simulations/agents/planning',
    difficulty: 'Intermediate',
    category: 'Planning',
    concepts: ['Goal Decomposition', 'Task Dependencies', 'Plan Adaptation'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'memory-systems',
    title: 'Memory Systems',
    description: 'Explore different memory types and retrieval mechanisms',
    icon: Eye,
    href: '/simulations/agents/memory',
    difficulty: 'Advanced',
    category: 'Memory',
    concepts: ['Working Memory', 'Long-term Memory', 'Episodic Recall'],
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'tool-use',
    title: 'Tool Use & Decision Making',
    description: 'Interactive tool selection and coordination strategies',
    icon: Cog,
    href: '/simulations/agents/tools',
    difficulty: 'Advanced',
    category: 'Tool Use',
    concepts: ['Tool Selection', 'Multi-tool Coordination', 'Error Handling'],
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'self-reflection',
    title: 'Self-Reflection & Correction',
    description: 'Meta-cognitive processes and error recovery mechanisms',
    icon: TreePine,
    href: '/simulations/agents/reflection',
    difficulty: 'Advanced',
    category: 'Meta-cognition',
    concepts: ['Self-awareness', 'Error Detection', 'Correction Strategies'],
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'multi-agent',
    title: 'Multi-Agent Coordination',
    description: 'Agent communication patterns and collaborative problem solving',
    icon: Users,
    href: '/simulations/agents/coordination',
    difficulty: 'Advanced',
    category: 'Collaboration',
    concepts: ['Agent Communication', 'Coordination', 'Consensus Building'],
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'evaluation',
    title: 'Agent Evaluation & Benchmarking',
    description: 'Performance metrics and reasoning quality assessment',
    icon: BarChart,
    href: '/simulations/agents/evaluation',
    difficulty: 'Advanced',
    category: 'Evaluation',
    concepts: ['Performance Metrics', 'Quality Assessment', 'Benchmarking'],
    color: 'from-yellow-500 to-yellow-600'
  }
]

const categories = ['All', 'Fundamentals', 'Reasoning', 'Planning', 'Memory', 'Tool Use', 'Meta-cognition', 'Collaboration', 'Evaluation']
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

// Key concepts for comprehensive agent reasoning education
const AGENT_KEY_CONCEPTS = [
  {
    id: 'react-framework',
    title: 'ReAct Framework',
    icon: Brain,
    color: 'purple',
    sections: [
      {
        title: 'Reasoning + Acting Integration',
        description: 'ReAct interleaves reasoning traces and task-specific actions, allowing for dynamic reasoning and error correction',
        examples: ['Thought: "I need to search for information about X" → Action: search("X") → Observation: "Found Y facts"'],
        keyPrinciples: [
          'Interleaved reasoning and action steps',
          'Self-correction through observation',
          'Dynamic plan adjustment based on feedback',
          'Explicit reasoning traces for transparency'
        ]
      },
      {
        title: 'Thought-Action-Observation Loops',
        description: 'The core cycle of ReAct involves generating thoughts, taking actions, and processing observations',
        examples: ['Multi-step research tasks', 'Problem-solving with external tools', 'Interactive planning scenarios'],
        keyPrinciples: [
          'Structured decision-making process',
          'Observable intermediate steps',
          'Failure recovery mechanisms',
          'Contextual adaptation capabilities'
        ]
      },
      {
        title: 'Applications & Benefits',
        description: 'ReAct excels in tasks requiring external tool use, multi-step reasoning, and adaptive planning',
        examples: ['Web search and synthesis', 'Code generation and debugging', 'Research and analysis tasks'],
        keyPrinciples: [
          'Enhanced problem decomposition',
          'Improved factual accuracy',
          'Better error detection and correction',
          'Increased reasoning transparency'
        ]
      }
    ]
  },
  {
    id: 'reasoning-strategies',
    title: 'Reasoning Strategies',
    icon: GitBranch,
    color: 'green',
    sections: [
      {
        title: 'Chain-of-Thought (CoT)',
        description: 'Sequential reasoning that breaks down complex problems into step-by-step logical progressions',
        examples: ['Math word problems: "First calculate X, then use X to find Y"', 'Logical deduction chains'],
        keyPrinciples: [
          'Sequential step-by-step reasoning',
          'Explicit intermediate computations',
          'Linear problem decomposition',
          'Clear logical flow'
        ]
      },
      {
        title: 'Tree-of-Thought (ToT)',
        description: 'Explores multiple reasoning paths simultaneously, maintaining and evaluating different solution branches',
        examples: ['Creative problem solving with multiple approaches', 'Game playing with look-ahead strategies'],
        keyPrinciples: [
          'Parallel exploration of solution paths',
          'Branch evaluation and pruning',
          'Backtracking capabilities',
          'Multi-perspective reasoning'
        ]
      },
      {
        title: 'Strategy Selection',
        description: 'Choosing the appropriate reasoning strategy based on problem characteristics and computational constraints',
        examples: ['Simple tasks → CoT', 'Complex creative tasks → ToT', 'Time-constrained scenarios → Hybrid approaches'],
        keyPrinciples: [
          'Problem complexity assessment',
          'Resource constraint consideration',
          'Performance trade-off analysis',
          'Adaptive strategy switching'
        ]
      }
    ]
  },
  {
    id: 'planning-strategies',
    title: 'Multi-Step Planning',
    icon: Target,
    color: 'orange',
    sections: [
      {
        title: 'Hierarchical Planning',
        description: 'Breaking complex goals into hierarchical sub-goals with clear dependency relationships',
        examples: ['Project planning: Goal → Phases → Tasks → Subtasks', 'Recipe execution with preparation steps'],
        keyPrinciples: [
          'Goal decomposition into manageable chunks',
          'Clear dependency mapping',
          'Resource allocation planning',
          'Progress monitoring capabilities'
        ]
      },
      {
        title: 'Dynamic Replanning',
        description: 'Adapting plans in real-time based on changing conditions and new information',
        examples: ['Route planning with traffic updates', 'Resource reallocation based on availability'],
        keyPrinciples: [
          'Continuous environment monitoring',
          'Plan adaptation triggers',
          'Resource reallocation strategies',
          'Rollback and recovery mechanisms'
        ]
      },
      {
        title: 'Plan Execution & Monitoring',
        description: 'Systematic execution of planned actions with progress tracking and quality assurance',
        examples: ['Task scheduling with dependencies', 'Quality checkpoints and validation'],
        keyPrinciples: [
          'Systematic execution order',
          'Progress tracking mechanisms',
          'Quality validation checkpoints',
          'Exception handling procedures'
        ]
      }
    ]
  },
  {
    id: 'agent-coordination',
    title: 'Agent Coordination Patterns',
    icon: Users,
    color: 'pink',
    sections: [
      {
        title: 'Communication Protocols',
        description: 'Structured methods for agents to exchange information, requests, and coordination signals',
        examples: ['Message passing systems', 'Shared memory coordination', 'Event-driven communication'],
        keyPrinciples: [
          'Clear communication interfaces',
          'Message format standardization',
          'Asynchronous communication support',
          'Error handling and retries'
        ]
      },
      {
        title: 'Task Distribution',
        description: 'Strategies for distributing work among multiple agents based on capabilities and availability',
        examples: ['Load balancing across agents', 'Skill-based task assignment', 'Dynamic work redistribution'],
        keyPrinciples: [
          'Capability-based assignment',
          'Load balancing algorithms',
          'Task dependency management',
          'Dynamic reallocation support'
        ]
      },
      {
        title: 'Consensus & Collaboration',
        description: 'Methods for agents to reach agreement and collaborate effectively on shared objectives',
        examples: ['Voting mechanisms for decisions', 'Collaborative problem solving', 'Conflict resolution protocols'],
        keyPrinciples: [
          'Democratic decision making',
          'Conflict resolution mechanisms',
          'Collaborative optimization',
          'Shared state management'
        ]
      }
    ]
  },
  {
    id: 'memory-systems',
    title: 'Agent Memory Systems',
    icon: Eye,
    color: 'indigo',
    sections: [
      {
        title: 'Working Memory',
        description: 'Short-term memory for active reasoning, maintaining context and intermediate results during task execution',
        examples: ['Current conversation context', 'Intermediate calculation results', 'Active goal states'],
        keyPrinciples: [
          'Limited capacity management',
          'Context window optimization',
          'Priority-based retention',
          'Garbage collection strategies'
        ]
      },
      {
        title: 'Long-Term Memory',
        description: 'Persistent storage of knowledge, experiences, and learned patterns for future reference',
        examples: ['Factual knowledge bases', 'Learned procedures', 'Experience replay systems'],
        keyPrinciples: [
          'Efficient storage and retrieval',
          'Knowledge organization schemas',
          'Memory consolidation processes',
          'Forgetting and pruning strategies'
        ]
      },
      {
        title: 'Episodic Memory',
        description: 'Memory of specific events, experiences, and their temporal context for learning and adaptation',
        examples: ['Task execution histories', 'Success and failure patterns', 'Temporal event sequences'],
        keyPrinciples: [
          'Event sequence tracking',
          'Temporal context preservation',
          'Pattern recognition from history',
          'Experience-based learning'
        ]
      }
    ]
  },
  {
    id: 'meta-cognition',
    title: 'Meta-Cognitive Processes',
    icon: TreePine,
    color: 'teal',
    sections: [
      {
        title: 'Self-Monitoring',
        description: 'Continuous assessment of reasoning processes, performance, and decision quality',
        examples: ['Confidence estimation', 'Error detection mechanisms', 'Performance tracking'],
        keyPrinciples: [
          'Real-time performance monitoring',
          'Confidence calibration',
          'Error detection algorithms',
          'Quality assessment metrics'
        ]
      },
      {
        title: 'Strategy Selection',
        description: 'Choosing appropriate cognitive strategies based on task characteristics and current context',
        examples: ['Reasoning method selection', 'Resource allocation decisions', 'Planning horizon adjustment'],
        keyPrinciples: [
          'Task-strategy matching',
          'Resource-aware selection',
          'Performance-based adaptation',
          'Context-sensitive switching'
        ]
      },
      {
        title: 'Learning & Adaptation',
        description: 'Updating knowledge and strategies based on experience and feedback',
        examples: ['Strategy refinement', 'Knowledge base updates', 'Behavior adaptation'],
        keyPrinciples: [
          'Experience-based improvement',
          'Feedback integration',
          'Strategy refinement',
          'Continuous adaptation'
        ]
      }
    ]
  },
  {
    id: 'evaluation-metrics',
    title: 'Agent Evaluation & Metrics',
    icon: BarChart,
    color: 'yellow',
    sections: [
      {
        title: 'Performance Metrics',
        description: 'Quantitative measures of agent effectiveness, efficiency, and quality',
        examples: ['Task completion rates', 'Response time metrics', 'Accuracy measurements'],
        keyPrinciples: [
          'Multi-dimensional evaluation',
          'Objective measurement criteria',
          'Benchmarking standards',
          'Performance trending'
        ]
      },
      {
        title: 'Reasoning Quality',
        description: 'Assessment of reasoning coherence, logical consistency, and explanatory power',
        examples: ['Logical consistency checks', 'Explanation quality scoring', 'Reasoning path analysis'],
        keyPrinciples: [
          'Logical coherence assessment',
          'Explanation transparency',
          'Reasoning path quality',
          'Consistency verification'
        ]
      },
      {
        title: 'Robustness & Safety',
        description: 'Evaluation of agent behavior under edge cases, adversarial conditions, and safety constraints',
        examples: ['Edge case handling', 'Adversarial robustness', 'Safety constraint adherence'],
        keyPrinciples: [
          'Edge case resilience',
          'Adversarial robustness',
          'Safety constraint compliance',
          'Graceful degradation'
        ]
      }
    ]
  }
]

export default function AgentsOverview() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'simulations' | 'concepts'>('simulations')

  const filteredSimulations = useMemo(() => {
    return agentSimulations.filter(sim => {
      const matchesCategory = selectedCategory === 'All' || sim.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'All' || sim.difficulty === selectedDifficulty
      const matchesSearch = searchTerm === '' ||
        sim.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sim.concepts.some(concept => concept.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesCategory && matchesDifficulty && matchesSearch
    })
  }, [selectedCategory, selectedDifficulty, searchTerm])

  const learningPath = [
    { phase: 'Foundation', simulations: ['core-loop'] },
    { phase: 'Reasoning', simulations: ['react-framework', 'reasoning-strategies'] },
    { phase: 'Planning', simulations: ['planning'] },
    { phase: 'Advanced Capabilities', simulations: ['memory-systems', 'tool-use', 'self-reflection'] },
    { phase: 'Collaboration', simulations: ['multi-agent'] },
    { phase: 'Assessment', simulations: ['evaluation'] }
  ]

  const learningObjectives = [
    "Understand fundamental agent architectures and decision cycles",
    "Explore advanced reasoning patterns like ReAct and Tree of Thought",
    "Master planning strategies and goal decomposition techniques",
    "Learn about memory systems and context management in agents",
    "Discover tool use patterns and multi-agent coordination",
    "Evaluate agent performance and reasoning quality"
  ]

  return (
    <SimulationLayout
      title="AI Agents & Reasoning"
      description="Interactive simulations exploring modern AI agent architectures and reasoning strategies"
      difficulty="Intermediate"
      category="Agent Systems"
      onReset={() => {
        setSelectedCategory('All')
        setSelectedDifficulty('All')
        setSearchTerm('')
      }}
      showControls={false}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('simulations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'simulations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Play className="mr-2" size={18} />
                Simulation Directory
              </div>
            </button>
            <button
              onClick={() => setActiveTab('concepts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'concepts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BookOpen className="mr-2" size={18} />
                Key Concepts
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'simulations' ? (
        <div className="space-y-8">
        {/* Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Explore AI Agent Intelligence
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Dive deep into the fascinating world of AI agents - from basic decision cycles
                to advanced reasoning strategies, multi-agent collaboration, and meta-cognitive processes.
              </p>
              <div className="flex flex-wrap gap-2">
                {['ReAct Framework', 'Chain of Thought', 'Planning', 'Multi-Agent'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                    <Brain className="text-blue-600" size={20} />
                    <span className="text-sm font-medium">Reasoning</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                    <Target className="text-green-600" size={20} />
                    <span className="text-sm font-medium">Planning</span>
                  </div>
                </div>
                <div className="space-y-3 mt-8">
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                    <Users className="text-purple-600" size={20} />
                    <span className="text-sm font-medium">Collaboration</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                    <Activity className="text-orange-600" size={20} />
                    <span className="text-sm font-medium">Evaluation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search simulations, concepts, or techniques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Quick filters:</span>
            {['ReAct', 'CoT', 'Planning', 'Memory', 'Multi-Agent'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSearchTerm(filter)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="mr-2 text-yellow-600" size={24} />
            Recommended Learning Path
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {learningPath.map((phase, index) => (
              <div key={phase.phase} className="relative">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">{phase.phase}</h4>
                  <div className="space-y-1">
                    {phase.simulations.map(simId => {
                      const sim = agentSimulations.find(s => s.id === simId)
                      return sim ? (
                        <div
                          key={simId}
                          className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1"
                        >
                          {sim.title}
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
                {index < learningPath.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-4 -right-2 text-gray-400" size={16} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Simulations Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSimulations.map((simulation, index) => {
            const IconComponent = simulation.icon
            return (
              <motion.div
                key={simulation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group"
              >
                <Link href={simulation.href} className="block h-full">
                  <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Header with gradient */}
                    <div className={`h-32 bg-gradient-to-br ${simulation.color} p-6 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10 flex items-center justify-between text-white">
                        <IconComponent size={32} className="opacity-90" />
                        <div className="text-right">
                          <div className="text-xs font-semibold uppercase tracking-wide opacity-90">
                            {simulation.category}
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                            simulation.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            simulation.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {simulation.difficulty}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {simulation.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {simulation.description}
                      </p>

                      {/* Concepts */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {simulation.concepts.map((concept) => (
                            <span
                              key={concept}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        Explore Simulation
                        <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* No Results */}
        {filteredSimulations.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find relevant simulations.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All')
                setSelectedDifficulty('All')
                setSearchTerm('')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {agentSimulations.length}
              </div>
              <div className="text-sm text-gray-600">Interactive Simulations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {categories.length - 1}
              </div>
              <div className="text-sm text-gray-600">Learning Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                6
              </div>
              <div className="text-sm text-gray-600">Learning Phases</div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Key Concepts Tab */
        <motion.div
          key="concepts"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Key Concepts Header */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="mr-3 text-blue-600" size={28} />
              Agent Reasoning: Key Concepts & Frameworks
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Comprehensive guide to AI agent reasoning, from fundamental cognitive architectures to advanced
              multi-agent coordination patterns. Master the theoretical foundations that power intelligent
              autonomous systems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['ReAct Framework', 'Reasoning Strategies', 'Multi-Step Planning', 'Agent Coordination'].map((tag, index) => (
                <div key={tag} className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    index === 0 ? 'bg-purple-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-orange-500' : 'bg-pink-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {AGENT_KEY_CONCEPTS.map((concept) => {
              const Icon = concept.icon
              return (
                <motion.div
                  key={concept.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className={`bg-gradient-to-r from-${concept.color}-500 to-${concept.color}-600 p-6 text-white`}>
                    <div className="flex items-center mb-2">
                      <Icon size={24} className="mr-3" />
                      <h3 className="text-xl font-bold">{concept.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {concept.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border-l-4 border-gray-200 pl-4">
                        <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {section.description}
                        </p>

                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Examples:</div>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {section.examples.map((example, exampleIndex) => (
                                <li key={exampleIndex} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span className="font-mono leading-relaxed">{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Key Principles:</div>
                            <div className="flex flex-wrap gap-1">
                              {section.keyPrinciples.map((principle, principleIndex) => (
                                <span
                                  key={principleIndex}
                                  className={`inline-block px-2 py-1 rounded-full text-xs bg-${concept.color}-100 text-${concept.color}-700`}
                                >
                                  {principle}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Implementation Framework */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Workflow className="mr-2 text-blue-600" size={24} />
              Agent Development Framework
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-800 mb-4">Core Architecture Components</h4>
                <div className="space-y-3">
                  {[
                    { icon: Brain, text: 'Reasoning Engine', color: 'purple' },
                    { icon: Eye, text: 'Memory Systems', color: 'indigo' },
                    { icon: Cog, text: 'Action Executors', color: 'blue' },
                    { icon: Network, text: 'Communication Layer', color: 'green' }
                  ].map((component, index) => (
                    <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <component.icon className={`mr-3 text-${component.color}-600`} size={20} />
                      <span className="text-sm font-medium text-gray-700">{component.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-4">Development Best Practices</h4>
                <div className="space-y-2">
                  {[
                    'Start with simple reactive agents before adding reasoning',
                    'Implement transparent reasoning traces for debugging',
                    'Design for graceful degradation under resource constraints',
                    'Build comprehensive evaluation and monitoring systems',
                    'Plan for multi-agent coordination from the beginning'
                  ].map((practice, index) => (
                    <div key={index} className="flex items-start">
                      <ArrowRight className="mr-2 text-blue-500 mt-1 flex-shrink-0" size={14} />
                      <span className="text-sm text-gray-700">{practice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
              <h5 className="font-bold text-gray-800 mb-3">Agent Reasoning Development Pipeline</h5>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">1. Architecture Design</span>
                <ArrowRight size={14} className="text-gray-400" />
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">2. Reasoning Framework</span>
                <ArrowRight size={14} className="text-gray-400" />
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">3. Memory Integration</span>
                <ArrowRight size={14} className="text-gray-400" />
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">4. Multi-Agent Coordination</span>
                <ArrowRight size={14} className="text-gray-400" />
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">5. Evaluation & Testing</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </SimulationLayout>
  )
}