'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Play, Pause, Brain, Search, Database, Settings, Zap,
  ArrowRight, CheckCircle, AlertCircle, Clock, Target,
  GitBranch, Code2, FileText, Calculator, Globe, Cpu,
  MessageSquare, Layers, Filter, ChevronRight, Sparkles,
  BookOpen, Workflow, TreePine, Network, Cog, Users,
  TrendingUp, Shield, Lightbulb, Map
} from 'lucide-react'

// Agent flow stages
interface FlowStage {
  id: string
  name: string
  description: string
  icon: any
  color: string
  duration: number
  status: 'pending' | 'active' | 'completed' | 'error'
}

// Available tools
const AVAILABLE_TOOLS = [
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the internet for current information',
    icon: Globe,
    category: 'Information',
    capability: ['research', 'facts', 'current-events'],
    complexity: 'low',
    accuracy: 0.8
  },
  {
    id: 'code-interpreter',
    name: 'Code Interpreter',
    description: 'Execute Python code for calculations and analysis',
    icon: Code2,
    category: 'Computation',
    capability: ['analysis', 'calculation', 'data-processing'],
    complexity: 'high',
    accuracy: 0.95
  },
  {
    id: 'document-search',
    name: 'Document Search',
    description: 'Search through uploaded documents and knowledge base',
    icon: FileText,
    category: 'Knowledge',
    capability: ['research', 'facts', 'domain-specific'],
    complexity: 'medium',
    accuracy: 0.9
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Perform mathematical calculations',
    icon: Calculator,
    category: 'Computation',
    capability: ['calculation', 'math'],
    complexity: 'low',
    accuracy: 0.99
  },
  {
    id: 'rag-retriever',
    name: 'RAG Retriever',
    description: 'Retrieve relevant context from vector database',
    icon: Database,
    category: 'Knowledge',
    capability: ['research', 'context', 'semantic-search'],
    complexity: 'medium',
    accuracy: 0.85
  }
]

// Sample queries with different characteristics
const SAMPLE_QUERIES = [
  {
    text: "What's the current stock price of NVIDIA and analyze its trend?",
    type: 'research-analysis',
    complexity: 'high',
    expectedTools: ['web-search', 'code-interpreter'],
    ragRequired: false
  },
  {
    text: "Calculate the compound interest on $10,000 at 5% for 10 years",
    type: 'calculation',
    complexity: 'low',
    expectedTools: ['calculator'],
    ragRequired: false
  },
  {
    text: "Explain how transformer attention works based on our documentation",
    type: 'domain-knowledge',
    complexity: 'medium',
    expectedTools: ['document-search', 'rag-retriever'],
    ragRequired: true
  },
  {
    text: "Research quantum computing advances in 2024 and summarize key breakthroughs",
    type: 'research',
    complexity: 'medium',
    expectedTools: ['web-search'],
    ragRequired: false
  }
]

// RAG pipeline stages
const RAG_STAGES = [
  { name: 'Query Analysis', description: 'Analyze user intent and extract key concepts', duration: 100 },
  { name: 'Embedding Generation', description: 'Convert query to vector representation', duration: 200 },
  { name: 'Similarity Search', description: 'Find relevant documents in vector database', duration: 300 },
  { name: 'Context Ranking', description: 'Rank and select best context chunks', duration: 150 },
  { name: 'Context Integration', description: 'Integrate context with original query', duration: 100 }
]

// Key concepts for the educational tab
const KEY_CONCEPTS = [
  {
    id: 'agent-workflow',
    title: 'Agent Workflow Patterns',
    icon: Workflow,
    color: 'blue',
    sections: [
      {
        title: 'Sequential Processing',
        description: 'Linear workflow where each stage completes before the next begins',
        examples: ['Input → Analysis → Planning → Execution → Output'],
        useCases: ['Simple queries', 'Single-tool operations', 'Deterministic workflows']
      },
      {
        title: 'Parallel Processing',
        description: 'Multiple tools or processes running simultaneously',
        examples: ['Multi-source research', 'Concurrent API calls', 'Batch operations'],
        useCases: ['Complex analysis', 'Time-critical tasks', 'Resource optimization']
      },
      {
        title: 'Iterative Refinement',
        description: 'Feedback loops that improve results through multiple iterations',
        examples: ['Query refinement', 'Result validation', 'Progressive enhancement'],
        useCases: ['Ambiguous queries', 'Quality improvement', 'Learning workflows']
      }
    ]
  },
  {
    id: 'tool-selection',
    title: 'Tool Selection Algorithms',
    icon: Target,
    color: 'green',
    sections: [
      {
        title: 'Capability Matching',
        description: 'Match query requirements with tool capabilities',
        examples: ['Text → Search tools', 'Math → Calculator tools', 'Code → Interpreter tools'],
        useCases: ['Primary tool selection', 'Capability assessment', 'Feature mapping']
      },
      {
        title: 'Scoring Systems',
        description: 'Quantitative evaluation of tool suitability',
        examples: ['Accuracy weights', 'Performance metrics', 'Resource costs'],
        useCases: ['Multi-tool scenarios', 'Optimization decisions', 'Trade-off analysis']
      },
      {
        title: 'Context-Aware Selection',
        description: 'Tool choice influenced by current context and history',
        examples: ['Previous tool results', 'User preferences', 'Environmental constraints'],
        useCases: ['Adaptive workflows', 'Personalization', 'Efficiency optimization']
      }
    ]
  },
  {
    id: 'rag-integration',
    title: 'RAG Integration Principles',
    icon: Database,
    color: 'purple',
    sections: [
      {
        title: 'Retrieval Strategies',
        description: 'Methods for finding relevant information in knowledge bases',
        examples: ['Semantic search', 'Keyword matching', 'Hybrid approaches'],
        useCases: ['Document search', 'Knowledge retrieval', 'Context enhancement']
      },
      {
        title: 'Context Enhancement',
        description: 'Enriching queries with retrieved information',
        examples: ['Context injection', 'Query augmentation', 'Background knowledge'],
        useCases: ['Domain expertise', 'Factual accuracy', 'Comprehensive responses']
      },
      {
        title: 'Generation Integration',
        description: 'Seamlessly incorporating retrieved context into responses',
        examples: ['Context-aware generation', 'Source attribution', 'Fact verification'],
        useCases: ['Accurate responses', 'Transparency', 'Quality assurance']
      }
    ]
  },
  {
    id: 'decision-trees',
    title: 'Decision Trees for Tool Choice',
    icon: TreePine,
    color: 'orange',
    sections: [
      {
        title: 'Query Classification',
        description: 'Categorizing queries to determine appropriate tool paths',
        examples: ['Information vs Action', 'Simple vs Complex', 'Internal vs External'],
        useCases: ['Initial routing', 'Workflow selection', 'Resource allocation']
      },
      {
        title: 'Conditional Logic',
        description: 'If-then rules for tool selection and sequencing',
        examples: ['If research → Web Search', 'If calculation → Calculator', 'If analysis → Code'],
        useCases: ['Automated decisions', 'Consistent routing', 'Rule-based systems']
      },
      {
        title: 'Fallback Strategies',
        description: 'Alternative approaches when primary tools fail',
        examples: ['Tool alternatives', 'Error handling', 'Graceful degradation'],
        useCases: ['Reliability', 'Error recovery', 'System resilience']
      }
    ]
  },
  {
    id: 'reasoning-frameworks',
    title: 'Agent Reasoning Frameworks',
    icon: Brain,
    color: 'red',
    sections: [
      {
        title: 'ReAct (Reason + Act)',
        description: 'Interleaving reasoning and action steps for complex problem-solving',
        examples: ['Thought → Action → Observation → Thought', 'Multi-step planning'],
        useCases: ['Complex queries', 'Research tasks', 'Problem decomposition']
      },
      {
        title: 'Chain-of-Thought',
        description: 'Breaking down problems into logical reasoning steps',
        examples: ['Step-by-step analysis', 'Intermediate reasoning', 'Logical deduction'],
        useCases: ['Mathematical problems', 'Logical reasoning', 'Explanation generation']
      },
      {
        title: 'Plan-and-Execute',
        description: 'Creating comprehensive plans before execution',
        examples: ['Goal decomposition', 'Resource planning', 'Timeline creation'],
        useCases: ['Project planning', 'Resource optimization', 'Complex workflows']
      }
    ]
  },
  {
    id: 'multi-step-planning',
    title: 'Multi-Step Planning',
    icon: Map,
    color: 'indigo',
    sections: [
      {
        title: 'Goal Decomposition',
        description: 'Breaking complex goals into manageable sub-tasks',
        examples: ['Research → Analysis → Synthesis', 'Data → Process → Visualize'],
        useCases: ['Complex projects', 'Long-term tasks', 'Resource planning']
      },
      {
        title: 'Dependency Management',
        description: 'Managing relationships and prerequisites between tasks',
        examples: ['Sequential dependencies', 'Parallel tracks', 'Conditional execution'],
        useCases: ['Project coordination', 'Workflow optimization', 'Resource scheduling']
      },
      {
        title: 'Dynamic Replanning',
        description: 'Adapting plans based on intermediate results and changing conditions',
        examples: ['Result-driven adjustments', 'Error recovery', 'Opportunity optimization'],
        useCases: ['Adaptive systems', 'Error handling', 'Performance optimization']
      }
    ]
  },
  {
    id: 'production-deployment',
    title: 'Production Deployment Patterns',
    icon: Shield,
    color: 'emerald',
    sections: [
      {
        title: 'Scalability Patterns',
        description: 'Designing agents for high-volume production environments',
        examples: ['Load balancing', 'Horizontal scaling', 'Resource pooling'],
        useCases: ['High traffic', 'Enterprise deployment', 'Performance optimization']
      },
      {
        title: 'Monitoring & Observability',
        description: 'Tracking agent performance and behavior in production',
        examples: ['Performance metrics', 'Error tracking', 'Usage analytics'],
        useCases: ['System health', 'Performance optimization', 'Issue detection']
      },
      {
        title: 'Safety & Reliability',
        description: 'Ensuring safe and reliable operation in production',
        examples: ['Input validation', 'Output filtering', 'Graceful degradation'],
        useCases: ['Risk mitigation', 'Quality assurance', 'Compliance requirements']
      }
    ]
  },
  {
    id: 'decision-frameworks',
    title: 'Practical Decision-Making Frameworks',
    icon: Lightbulb,
    color: 'yellow',
    sections: [
      {
        title: 'Cost-Benefit Analysis',
        description: 'Evaluating trade-offs between different tool and workflow choices',
        examples: ['Performance vs Cost', 'Accuracy vs Speed', 'Resource vs Quality'],
        useCases: ['Tool selection', 'Optimization decisions', 'Resource allocation']
      },
      {
        title: 'Risk Assessment',
        description: 'Evaluating potential risks and failure modes in agent workflows',
        examples: ['Tool failure handling', 'Data quality issues', 'Security considerations'],
        useCases: ['Production systems', 'Critical applications', 'Compliance requirements']
      },
      {
        title: 'Performance Optimization',
        description: 'Strategies for maximizing agent effectiveness and efficiency',
        examples: ['Caching strategies', 'Parallel execution', 'Resource optimization'],
        useCases: ['High-volume systems', 'Real-time applications', 'Cost optimization']
      }
    ]
  }
]

export default function AgentFlowSimulation() {
  // Core state
  const [isRunning, setIsRunning] = useState(false)
  const [currentQuery, setCurrentQuery] = useState(SAMPLE_QUERIES[0].text)
  const [selectedQueryIndex, setSelectedQueryIndex] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [ragResults, setRagResults] = useState<any[]>([])
  const [toolScores, setToolScores] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<'simulation' | 'concepts'>('simulation')

  // Animation state
  const [ragStage, setRagStage] = useState(0)
  const [showToolSelection, setShowToolSelection] = useState(false)
  const [showRagPipeline, setShowRagPipeline] = useState(false)
  const [executionLog, setExecutionLog] = useState<string[]>([])

  // Flow stages
  const flowStages: FlowStage[] = [
    {
      id: 'input',
      name: 'Query Input',
      description: 'User submits query to the agent system',
      icon: MessageSquare,
      color: 'blue',
      duration: 500,
      status: 'pending'
    },
    {
      id: 'analysis',
      name: 'Intent Analysis',
      description: 'LLM analyzes query intent and complexity',
      icon: Brain,
      color: 'purple',
      duration: 800,
      status: 'pending'
    },
    {
      id: 'rag',
      name: 'RAG Retrieval',
      description: 'Retrieve relevant context if needed',
      icon: Database,
      color: 'green',
      duration: 1200,
      status: 'pending'
    },
    {
      id: 'tool-selection',
      name: 'Tool Selection',
      description: 'Select appropriate tools for execution',
      icon: Settings,
      color: 'orange',
      duration: 600,
      status: 'pending'
    },
    {
      id: 'execution',
      name: 'Tool Execution',
      description: 'Execute selected tools and gather results',
      icon: Zap,
      color: 'red',
      duration: 1000,
      status: 'pending'
    },
    {
      id: 'synthesis',
      name: 'Response Synthesis',
      description: 'Synthesize tool outputs into final response',
      icon: Sparkles,
      color: 'indigo',
      duration: 700,
      status: 'pending'
    }
  ]

  const [stages, setStages] = useState(flowStages)

  // Query analysis based on selected sample
  const currentQueryData = SAMPLE_QUERIES[selectedQueryIndex]

  // Calculate tool compatibility scores
  useEffect(() => {
    const scores: Record<string, number> = {}
    const queryType = currentQueryData.type
    const needsRag = currentQueryData.ragRequired

    AVAILABLE_TOOLS.forEach(tool => {
      let score = 0

      // Base compatibility with query type
      const capabilities = tool.capability
      if (queryType.includes('research') && capabilities.includes('research')) score += 40
      if (queryType.includes('calculation') && capabilities.includes('calculation')) score += 50
      if (queryType.includes('analysis') && capabilities.includes('analysis')) score += 45
      if (queryType.includes('knowledge') && capabilities.includes('domain-specific')) score += 35

      // RAG requirement bonus
      if (needsRag && tool.category === 'Knowledge') score += 30

      // Accuracy bonus
      score += tool.accuracy * 20

      // Complexity alignment
      const complexityMap = { low: 10, medium: 20, high: 30 }
      if ((currentQueryData.complexity === 'high' && tool.complexity === 'high') ||
          (currentQueryData.complexity === 'low' && tool.complexity === 'low')) {
        score += 15
      }

      scores[tool.id] = Math.min(100, Math.max(0, score + Math.random() * 10))
    })

    setToolScores(scores)
  }, [selectedQueryIndex])

  // Simulate agent flow execution
  const executeFlow = async () => {
    setIsRunning(true)
    setCurrentStage(0)
    setSelectedTools([])
    setRagResults([])
    setExecutionLog([])
    setShowToolSelection(false)
    setShowRagPipeline(false)

    for (let i = 0; i < stages.length; i++) {
      // Update stage status
      setStages(prev => prev.map((stage, index) => ({
        ...stage,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })))

      setCurrentStage(i)
      setExecutionLog(prev => [...prev, `Starting ${stages[i].name}...`])

      // Stage-specific logic
      if (stages[i].id === 'rag' && currentQueryData.ragRequired) {
        setShowRagPipeline(true)
        await simulateRAGPipeline()
      }

      if (stages[i].id === 'tool-selection') {
        setShowToolSelection(true)
        await simulateToolSelection()
      }

      if (stages[i].id === 'execution') {
        await simulateToolExecution()
      }

      await new Promise(resolve => setTimeout(resolve, stages[i].duration))
      setExecutionLog(prev => [...prev, `✓ ${stages[i].name} completed`])
    }

    setStages(prev => prev.map(stage => ({ ...stage, status: 'completed' })))
    setIsRunning(false)
  }

  // Simulate RAG pipeline
  const simulateRAGPipeline = async () => {
    for (let i = 0; i < RAG_STAGES.length; i++) {
      setRagStage(i)
      await new Promise(resolve => setTimeout(resolve, RAG_STAGES[i].duration))
    }

    // Simulate RAG results
    const mockResults = [
      { text: "Attention mechanism allows models to focus on relevant parts...", score: 0.95, source: "transformer_guide.md" },
      { text: "Multi-head attention computes attention in parallel...", score: 0.88, source: "attention_detailed.md" },
      { text: "Scaled dot-product attention uses query, key, value matrices...", score: 0.82, source: "architecture_overview.md" }
    ]
    setRagResults(mockResults)
    setExecutionLog(prev => [...prev, `Retrieved ${mockResults.length} relevant context chunks`])
  }

  // Simulate tool selection
  const simulateToolSelection = async () => {
    await new Promise(resolve => setTimeout(resolve, 300))

    // Select tools based on scores
    const sortedTools = Object.entries(toolScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, currentQueryData.expectedTools.length)
      .map(([id]) => id)

    setSelectedTools(sortedTools)
    setExecutionLog(prev => [...prev, `Selected tools: ${sortedTools.map(id =>
      AVAILABLE_TOOLS.find(t => t.id === id)?.name
    ).join(', ')}`])
  }

  // Simulate tool execution
  const simulateToolExecution = async () => {
    for (const toolId of selectedTools) {
      const tool = AVAILABLE_TOOLS.find(t => t.id === toolId)
      if (tool) {
        setExecutionLog(prev => [...prev, `Executing ${tool.name}...`])
        await new Promise(resolve => setTimeout(resolve, 400))
        setExecutionLog(prev => [...prev, `✓ ${tool.name} completed successfully`])
      }
    }
  }

  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentStage(0)
    setStages(flowStages)
    setSelectedTools([])
    setRagResults([])
    setExecutionLog([])
    setShowToolSelection(false)
    setShowRagPipeline(false)
    setRagStage(0)
  }

  const learningObjectives = [
    "Understand the complete agent decision-making pipeline",
    "Learn how RAG systems enhance query processing",
    "Explore tool selection algorithms and scoring mechanisms",
    "See real-time agent reasoning and execution flow",
    "Master the integration of LLMs with external tools",
    "Understand context integration and response synthesis"
  ]

  return (
    <SimulationLayout
      title="Agent Flow & Tool Selection"
      description="Interactive demonstration of how AI agents process queries and select appropriate tools"
      difficulty="Advanced"
      category="Agent Systems"
      onPlay={executeFlow}
      onReset={resetSimulation}
      isPlaying={isRunning}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'simulation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Play className="mr-2" size={18} />
                Interactive Simulation
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
      <AnimatePresence mode="wait">
        {activeTab === 'simulation' ? (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
        {/* Query Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="mr-3 text-blue-600" size={28} />
            Query Input & Analysis
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Sample Query
                </label>
                <div className="space-y-2">
                  {SAMPLE_QUERIES.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQueryIndex(index)}
                      disabled={isRunning}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedQueryIndex === index
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="font-medium text-sm mb-1">
                        {query.type.replace('-', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm opacity-75">{query.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Query
                </label>
                <textarea
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  disabled={isRunning}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  rows={3}
                  placeholder="Enter your custom query..."
                />
              </div>
            </div>

            {/* Query Analysis */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Query Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Query Type:</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {currentQueryData.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Complexity:</span>
                  <span className={`text-sm font-medium ${
                    currentQueryData.complexity === 'high' ? 'text-red-600' :
                    currentQueryData.complexity === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {currentQueryData.complexity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">RAG Required:</span>
                  <span className={`text-sm font-medium ${
                    currentQueryData.ragRequired ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {currentQueryData.ragRequired ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expected Tools:</span>
                  <span className="text-sm text-gray-600">
                    {currentQueryData.expectedTools.length} tools
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Flow Pipeline */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <GitBranch className="mr-3 text-purple-600" size={28} />
            Agent Flow Pipeline
          </h2>

          <div className="space-y-6">
            {/* Flow Stages */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: stage.status === 'active' ? 1.1 : 1,
                      backgroundColor:
                        stage.status === 'completed' ? '#10B981' :
                        stage.status === 'active' ? '#F59E0B' :
                        stage.status === 'error' ? '#EF4444' : '#9CA3AF'
                    }}
                    className="flex items-center justify-center w-12 h-12 rounded-full text-white relative"
                  >
                    <stage.icon size={24} />
                    {stage.status === 'active' && (
                      <div className="absolute inset-0 rounded-full border-2 border-orange-300 animate-ping" />
                    )}
                  </motion.div>

                  <div className="ml-3 min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">{stage.name}</div>
                    <div className="text-xs text-gray-500">{stage.description}</div>
                  </div>

                  {index < stages.length - 1 && (
                    <ChevronRight className="mx-4 text-gray-400" size={20} />
                  )}
                </div>
              ))}
            </div>

            {/* Execution Log */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <Clock className="mr-2 text-green-400" size={18} />
                Execution Log
              </h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {executionLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-mono text-gray-300"
                  >
                    <span className="text-green-400">[{new Date().toLocaleTimeString()}]</span> {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Tool Selection Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="mr-2 text-orange-600" size={20} />
                Tool Selection & Scoring
              </h3>

              <div className="space-y-4">
                {AVAILABLE_TOOLS.map((tool) => {
                  const score = toolScores[tool.id] || 0
                  const isSelected = selectedTools.includes(tool.id)
                  const Icon = tool.icon

                  return (
                    <motion.div
                      key={tool.id}
                      animate={{
                        scale: isSelected ? 1.02 : 1,
                        boxShadow: isSelected ? '0 4px 20px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      className={`p-4 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <Icon
                            size={20}
                            className={isSelected ? 'text-blue-600' : 'text-gray-500'}
                          />
                          <div className="ml-3">
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.description}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="text-blue-600" size={20} />}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Compatibility Score</span>
                          <span className="font-medium">{Math.round(score)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-2 rounded-full ${
                              score > 70 ? 'bg-green-500' :
                              score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Category: {tool.category}</span>
                          <span>Accuracy: {(tool.accuracy * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RAG Pipeline & Results */}
          <div className="space-y-6">
            <AnimatePresence>
              {showRagPipeline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Database className="mr-2 text-green-600" size={20} />
                    RAG Pipeline Execution
                  </h3>

                  <div className="space-y-3">
                    {RAG_STAGES.map((stage, index) => (
                      <div
                        key={index}
                        className={`flex items-center p-3 rounded-lg ${
                          index < ragStage ? 'bg-green-50 border border-green-200' :
                          index === ragStage ? 'bg-blue-50 border border-blue-200' :
                          'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {index < ragStage ? (
                          <CheckCircle className="text-green-600" size={18} />
                        ) : index === ragStage ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Clock className="text-gray-400" size={18} />
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium">{stage.name}</div>
                          <div className="text-xs text-gray-500">{stage.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ragResults.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Retrieved Context</h4>
                      <div className="space-y-2">
                        {ragResults.map((result, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-medium text-gray-600">{result.source}</span>
                              <span className="text-xs text-green-600 font-medium">
                                {(result.score * 100).toFixed(0)}% match
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{result.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tool Execution Results */}
            {showToolSelection && selectedTools.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="mr-2 text-red-600" size={20} />
                  Tool Execution Results
                </h3>

                <div className="space-y-4">
                  {selectedTools.map((toolId) => {
                    const tool = AVAILABLE_TOOLS.find(t => t.id === toolId)
                    if (!tool) return null

                    const Icon = tool.icon
                    const isExecuting = currentStage === 4 && isRunning

                    return (
                      <div key={toolId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Icon className="text-blue-600" size={18} />
                            <span className="ml-2 font-medium">{tool.name}</span>
                          </div>
                          {isExecuting ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="text-green-600" size={18} />
                          )}
                        </div>

                        <div className="bg-gray-900 rounded p-3">
                          <div className="text-green-400 text-xs font-mono">
                            {tool.id === 'web-search' && "Searching web... Found 342 results for 'NVIDIA stock price'"}
                            {tool.id === 'code-interpreter' && "Executing analysis... Calculated trend: +15.3% (30 days)"}
                            {tool.id === 'calculator' && "Result: $16,288.95 (compound interest calculation)"}
                            {tool.id === 'document-search' && "Found 5 relevant documents about transformer attention"}
                            {tool.id === 'rag-retriever' && "Retrieved 3 context chunks with 90%+ relevance"}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="concepts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Key Concepts Content */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="mr-3 text-blue-600" size={28} />
                  Agent Systems: Key Concepts & Frameworks
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Comprehensive guide to understanding agent workflow patterns, tool selection algorithms,
                  RAG integration principles, and production deployment strategies for AI agent systems.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {KEY_CONCEPTS.map((concept) => {
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
                                      <span className="font-mono">{example}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <div className="text-xs font-medium text-gray-700 mb-1">Use Cases:</div>
                                <div className="flex flex-wrap gap-1">
                                  {section.useCases.map((useCase, useCaseIndex) => (
                                    <span
                                      key={useCaseIndex}
                                      className={`inline-block px-2 py-1 rounded-full text-xs bg-${concept.color}-100 text-${concept.color}-700`}
                                    >
                                      {useCase}
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

              {/* Practical Implementation Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Cog className="mr-2 text-blue-600" size={24} />
                  Implementation Best Practices
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Design Principles</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 text-green-500 mt-0.5" size={16} />
                        <span>Start with simple sequential workflows before adding complexity</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 text-green-500 mt-0.5" size={16} />
                        <span>Design for observability and debugging from the beginning</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 text-green-500 mt-0.5" size={16} />
                        <span>Implement graceful fallbacks for tool failures</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mr-2 text-green-500 mt-0.5" size={16} />
                        <span>Use scoring systems for transparent tool selection</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Production Considerations</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <AlertCircle className="mr-2 text-orange-500 mt-0.5" size={16} />
                        <span>Monitor tool performance and success rates continuously</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="mr-2 text-orange-500 mt-0.5" size={16} />
                        <span>Implement rate limiting and resource management</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="mr-2 text-orange-500 mt-0.5" size={16} />
                        <span>Plan for scaling both horizontally and vertically</span>
                      </li>
                      <li className="flex items-start">
                        <AlertCircle className="mr-2 text-orange-500 mt-0.5" size={16} />
                        <span>Test edge cases and error conditions thoroughly</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <h5 className="font-bold text-gray-800 mb-2">Quick Reference: Agent Development Workflow</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>1. <strong>Define Goals:</strong> Clear objectives and success criteria</div>
                    <div>2. <strong>Tool Selection:</strong> Choose appropriate tools and APIs</div>
                    <div>3. <strong>Workflow Design:</strong> Plan the execution flow and decision points</div>
                    <div>4. <strong>RAG Integration:</strong> Implement knowledge retrieval if needed</div>
                    <div>5. <strong>Testing:</strong> Test with various query types and edge cases</div>
                    <div>6. <strong>Production:</strong> Deploy with monitoring and observability</div>
                    <div>7. <strong>Iteration:</strong> Continuous improvement based on usage patterns</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SimulationLayout>
  )
}