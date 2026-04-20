'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Wrench, Code, Search, Database, Link, Network, Settings,
  Play, Pause, CheckCircle, AlertCircle, ArrowRight, ChevronDown,
  Layers, Zap, Target, BarChart3, Clock, Users, Globe,
  FileText, Terminal, Cpu, TrendingUp, Activity
} from 'lucide-react'

// Tools and MCP Topics
const TOOLS_MCP_TOPICS = [
  {
    id: 'function-calling',
    name: 'Function Calling & Tool Use',
    shortName: 'Function Calling',
    description: 'API integration and structured model interactions',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    icon: Wrench,
    explanation: 'Function calling enables models to interact with external APIs and tools in structured ways. Models can request specific function executions with proper parameters, enabling complex workflows and integrations.',
    keyPoints: [
      'Structured function definitions with JSON schemas',
      'Parameter validation and type checking',
      'Error handling and fallback strategies',
      'Parallel and sequential function execution'
    ]
  },
  {
    id: 'structured-outputs',
    name: 'Structured Outputs & JSON',
    shortName: 'Structured Outputs',
    description: 'Schema-driven model responses and validation',
    color: 'bg-green-100 text-green-800 border-green-200',
    gradient: 'from-green-500 to-green-600',
    icon: Code,
    explanation: 'Structured outputs ensure models produce responses in specific formats using JSON schemas. This enables reliable parsing, validation, and integration with downstream systems.',
    keyPoints: [
      'JSON Schema definition and validation',
      'Type safety and format consistency',
      'Nested object and array handling',
      'Error recovery and schema evolution'
    ]
  },
  {
    id: 'tool-schemas',
    name: 'Tool Schema Design',
    shortName: 'Tool Schemas',
    description: 'Best practices for defining tool interfaces',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    icon: Settings,
    explanation: 'Well-designed tool schemas are crucial for effective function calling. Clear descriptions, proper types, and good examples help models use tools correctly and efficiently.',
    keyPoints: [
      'Clear parameter descriptions and examples',
      'Proper type definitions and constraints',
      'Optional vs required parameter design',
      'Schema versioning and compatibility'
    ]
  },
  {
    id: 'parallel-calling',
    name: 'Parallel Tool Calling',
    shortName: 'Parallel Calling',
    description: 'Concurrent tool execution and orchestration',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    icon: Zap,
    explanation: 'Parallel tool calling allows models to execute multiple functions simultaneously, significantly reducing latency and improving user experience in complex workflows.',
    keyPoints: [
      'Concurrent execution strategies',
      'Dependency management between tools',
      'Error handling in parallel contexts',
      'Performance optimization techniques'
    ]
  },
  {
    id: 'rag-pipeline',
    name: 'RAG Implementation',
    shortName: 'RAG',
    description: 'Retrieval Augmented Generation pipelines',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: Search,
    explanation: 'RAG combines retrieval systems with language models to provide accurate, up-to-date responses grounded in external knowledge sources. It\'s essential for building knowledge-aware AI applications.',
    keyPoints: [
      'Document chunking and preprocessing',
      'Embedding generation and storage',
      'Similarity search and ranking',
      'Context integration and response generation'
    ]
  },
  {
    id: 'vector-databases',
    name: 'Vector Databases',
    shortName: 'Vector DBs',
    description: 'High-performance embedding storage and search',
    color: 'bg-red-100 text-red-800 border-red-200',
    gradient: 'from-red-500 to-red-600',
    icon: Database,
    explanation: 'Vector databases provide efficient storage and similarity search for high-dimensional embeddings, enabling fast retrieval in RAG systems and semantic search applications.',
    keyPoints: [
      'Vector indexing algorithms (HNSW, IVF)',
      'Similarity metrics and distance functions',
      'Performance vs accuracy trade-offs',
      'Scaling and distributed architectures'
    ]
  },
  {
    id: 'embeddings',
    name: 'Embedding Models & Semantic Search',
    shortName: 'Embeddings',
    description: 'Vector representations and similarity computation',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600',
    icon: Target,
    explanation: 'Embedding models convert text, images, and other data into dense vector representations that capture semantic meaning, enabling powerful similarity search and clustering capabilities.',
    keyPoints: [
      'Different embedding model architectures',
      'Dimensionality and quality trade-offs',
      'Fine-tuning for domain-specific tasks',
      'Multimodal embedding approaches'
    ]
  },
  {
    id: 'mcp-architecture',
    name: 'MCP Architecture',
    shortName: 'MCP Architecture',
    description: 'Model Context Protocol hosts, clients, and servers',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    gradient: 'from-teal-500 to-teal-600',
    icon: Network,
    explanation: 'MCP provides a standardized protocol for AI applications to securely connect to data sources and tools. It defines clear roles for hosts, clients, and servers in the ecosystem.',
    keyPoints: [
      'Host, client, and server responsibilities',
      'Protocol specification and communication',
      'Security and authentication models',
      'Extensibility and plugin architecture'
    ]
  },
  {
    id: 'mcp-primitives',
    name: 'MCP Primitives',
    shortName: 'MCP Primitives',
    description: 'Tools, resources, and prompts in MCP',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    gradient: 'from-pink-500 to-pink-600',
    icon: Layers,
    explanation: 'MCP defines three core primitives: Tools (functions), Resources (data), and Prompts (templates). Understanding these primitives is key to building effective MCP integrations.',
    keyPoints: [
      'Tool definitions and capabilities',
      'Resource management and access',
      'Prompt templates and variables',
      'Security and permission models'
    ]
  },
  {
    id: 'mcp-server',
    name: 'Building MCP Servers',
    shortName: 'MCP Server',
    description: 'Hands-on MCP server development',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    gradient: 'from-cyan-500 to-cyan-600',
    icon: Terminal,
    explanation: 'Building custom MCP servers allows you to expose your own data sources and tools to AI applications. This hands-on approach teaches practical MCP development skills.',
    keyPoints: [
      'Server setup and configuration',
      'Tool and resource implementation',
      'Protocol compliance and testing',
      'Deployment and maintenance'
    ]
  }
]

// Sample tool definitions
const SAMPLE_TOOLS = [
  {
    name: 'weather_lookup',
    description: 'Get current weather information for a location',
    parameters: {
      location: { type: 'string', required: true, description: 'City name or coordinates' },
      units: { type: 'string', required: false, description: 'Temperature units (celsius/fahrenheit)' }
    },
    category: 'data'
  },
  {
    name: 'send_email',
    description: 'Send an email to specified recipients',
    parameters: {
      to: { type: 'array', required: true, description: 'Email addresses' },
      subject: { type: 'string', required: true, description: 'Email subject' },
      body: { type: 'string', required: true, description: 'Email content' }
    },
    category: 'communication'
  },
  {
    name: 'search_database',
    description: 'Search through database records',
    parameters: {
      query: { type: 'string', required: true, description: 'Search query' },
      table: { type: 'string', required: true, description: 'Database table' },
      limit: { type: 'number', required: false, description: 'Maximum results' }
    },
    category: 'data'
  }
]

// RAG pipeline stages
const RAG_STAGES = [
  { name: 'Document Ingestion', description: 'Load and parse documents', status: 'completed' },
  { name: 'Text Chunking', description: 'Split into manageable pieces', status: 'completed' },
  { name: 'Embedding Generation', description: 'Create vector representations', status: 'completed' },
  { name: 'Vector Storage', description: 'Store in vector database', status: 'completed' },
  { name: 'Query Processing', description: 'Process user query', status: 'running' },
  { name: 'Similarity Search', description: 'Find relevant chunks', status: 'pending' },
  { name: 'Context Assembly', description: 'Combine retrieved content', status: 'pending' },
  { name: 'Response Generation', description: 'Generate final answer', status: 'pending' }
]

// Vector database comparison
const VECTOR_DBS = [
  {
    name: 'Pinecone',
    type: 'Managed',
    performance: 95,
    ease: 90,
    cost: 70,
    features: ['Real-time updates', 'Hybrid search', 'Metadata filtering']
  },
  {
    name: 'Weaviate',
    type: 'Open Source',
    performance: 88,
    ease: 75,
    cost: 90,
    features: ['GraphQL API', 'Multi-modal', 'Auto-classification']
  },
  {
    name: 'Qdrant',
    type: 'Open Source',
    performance: 92,
    ease: 80,
    cost: 85,
    features: ['High performance', 'Payload indexing', 'Clustering']
  },
  {
    name: 'ChromaDB',
    type: 'Open Source',
    performance: 80,
    ease: 95,
    cost: 95,
    features: ['Easy setup', 'Python native', 'Local development']
  }
]

// MCP Server example
const MCP_SERVER_TEMPLATE = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { evaluate } from 'mathjs';

const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Validate mathematical expression to prevent injection attacks
function validateMathExpression(expression) {
  // Allow only numbers, basic operators, parentheses, and mathematical functions
  const allowedPattern = /^[0-9+\-*/().\s,a-zA-Z]+$/;

  if (!allowedPattern.test(expression)) {
    throw new Error('Invalid characters in mathematical expression');
  }

  // Prevent function calls that could be dangerous
  const dangerousFunctions = ['import', 'eval', 'Function', 'require', 'process', 'global'];
  for (const func of dangerousFunctions) {
    if (expression.includes(func)) {
      throw new Error('Dangerous function detected in expression');
    }
  }

  // Limit expression length to prevent DoS
  if (expression.length > 200) {
    throw new Error('Expression too long');
  }

  return true;
}

// Define a tool
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'calculate',
        description: 'Perform basic calculations (secure mathematical evaluation)',
        inputSchema: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'Mathematical expression to evaluate (numbers, +, -, *, /, parentheses only)'
            }
          },
          required: ['expression']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'calculate') {
    try {
      // Validate input before evaluation
      validateMathExpression(args.expression);

      // Use mathjs for secure evaluation with restricted scope
      const result = evaluate(args.expression, {});

      // Ensure result is a number to prevent object injection
      if (typeof result !== 'number' && typeof result !== 'bigint') {
        throw new Error('Invalid result type');
      }

      return {
        content: [
          {
            type: 'text',
            text: \`Result: \${result}\`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: \`Error: \${error.message}\`
          }
        ],
        isError: true
      };
    }
  }
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);`

export default function ToolsMCPSimulation() {
  // Core state
  const [currentTopic, setCurrentTopic] = useState<string>('function-calling')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTool, setSelectedTool] = useState(SAMPLE_TOOLS[0])

  // Topic-specific state
  const [functionCallResult, setFunctionCallResult] = useState<string>('')
  const [parallelCalls, setParallelCalls] = useState<Array<{name: string, status: 'pending' | 'running' | 'completed', result?: string}>>([])
  const [ragStage, setRAGStage] = useState(0)
  const [vectorDBComparison, setVectorDBComparison] = useState(false)
  const [embeddingQuery, setEmbeddingQuery] = useState('machine learning algorithms')
  const [similarityResults, setSimilarityResults] = useState<Array<{text: string, score: number}>>([])
  const [mcpServerCode, setMCPServerCode] = useState(MCP_SERVER_TEMPLATE)

  // Animation state
  const [animateTools, setAnimateTools] = useState(false)

  // Get current topic data
  const currentTopicData = TOOLS_MCP_TOPICS.find(t => t.id === currentTopic) || TOOLS_MCP_TOPICS[0]

  // Simulate function calling
  const simulateFunctionCall = async (tool: typeof SAMPLE_TOOLS[0]) => {
    setFunctionCallResult('Calling function...')
    setIsRunning(true)
    setAnimateTools(true)

    // Simulate API call delay
    setTimeout(() => {
      const mockResults = {
        weather_lookup: '{"temperature": 22, "condition": "sunny", "humidity": 45}',
        send_email: '{"status": "sent", "messageId": "msg_123456"}',
        search_database: '{"results": 3, "data": [{"id": 1, "name": "Result 1"}]}'
      }

      setFunctionCallResult(mockResults[tool.name as keyof typeof mockResults] || '{"status": "success"}')
      setIsRunning(false)
      setAnimateTools(false)
    }, 2000)
  }

  // Simulate parallel calling
  const simulateParallelCalls = () => {
    const calls = [
      { name: 'weather_lookup', status: 'pending' as const },
      { name: 'send_email', status: 'pending' as const },
      { name: 'search_database', status: 'pending' as const }
    ]

    setParallelCalls(calls)
    setIsRunning(true)

    calls.forEach((call, index) => {
      setTimeout(() => {
        setParallelCalls(prev => prev.map((c, i) =>
          i === index ? { ...c, status: 'running' } : c
        ))

        setTimeout(() => {
          setParallelCalls(prev => prev.map((c, i) =>
            i === index ? { ...c, status: 'completed', result: 'Success' } : c
          ))

          if (index === calls.length - 1) {
            setIsRunning(false)
          }
        }, 1000 + Math.random() * 1000)
      }, index * 500)
    })
  }

  // Simulate RAG pipeline
  const simulateRAG = () => {
    setRAGStage(0)
    setIsRunning(true)

    const interval = setInterval(() => {
      setRAGStage(prev => {
        if (prev >= RAG_STAGES.length - 1) {
          setIsRunning(false)
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  // Simulate embedding search
  const simulateEmbeddingSearch = () => {
    setIsRunning(true)

    setTimeout(() => {
      const mockResults = [
        { text: 'Neural networks are a fundamental component of machine learning', score: 0.95 },
        { text: 'Deep learning algorithms use multiple layers for pattern recognition', score: 0.87 },
        { text: 'Supervised learning requires labeled training data', score: 0.82 },
        { text: 'Reinforcement learning uses rewards and penalties', score: 0.76 },
        { text: 'Unsupervised learning finds patterns in unlabeled data', score: 0.71 }
      ]

      setSimilarityResults(mockResults)
      setIsRunning(false)
    }, 1500)
  }

  // Handle topic change
  const handleTopicChange = (topicId: string) => {
    setCurrentTopic(topicId)
    setIsRunning(false)
    setFunctionCallResult('')
    setParallelCalls([])
    setRAGStage(0)
    setSimilarityResults([])
  }

  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentTopic('function-calling')
    setFunctionCallResult('')
    setParallelCalls([])
    setRAGStage(0)
    setSimilarityResults([])
    setVectorDBComparison(false)
  }

  const learningObjectives = [
    "Master function calling and structured output patterns",
    "Design effective tool schemas and interfaces",
    "Implement RAG pipelines with vector databases",
    "Understand MCP architecture and primitives",
    "Build custom MCP servers and integrations",
    "Optimize tool performance and error handling"
  ]

  return (
    <SimulationLayout
      title="Tools, Skills & MCP Integration"
      description="Comprehensive exploration of AI tools, RAG, and Model Context Protocol"
      difficulty="Advanced"
      category="Tools & MCP"
      onPlay={() => setIsRunning(true)}
      onReset={resetSimulation}
      isPlaying={isRunning}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="space-y-8">
        {/* Topic Selection Grid */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Wrench className="mr-3 text-blue-600" size={28} />
            Tools & MCP Topics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TOOLS_MCP_TOPICS.map((topic, index) => {
              const Icon = topic.icon
              const isActive = topic.id === currentTopic

              return (
                <motion.div
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleTopicChange(topic.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isActive
                        ? `${topic.color} border-current shadow-lg`
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Icon size={20} className={isActive ? 'text-current' : 'text-gray-400'} />
                      {isActive && <CheckCircle size={16} className="text-current" />}
                    </div>

                    <h3 className="font-bold text-sm mb-1">{topic.shortName}</h3>
                    <p className="text-xs opacity-75 leading-tight">{topic.description}</p>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Current Topic Deep Dive */}
        <motion.div
          key={currentTopic}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${currentTopicData.gradient} text-white rounded-xl p-8`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold flex items-center">
              <currentTopicData.icon className="mr-3" size={28} />
              {currentTopicData.name}
            </h3>
          </div>

          <p className="text-lg mb-6 text-gray-100">{currentTopicData.explanation}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-lg mb-3">Key Concepts</h4>
              <ul className="space-y-2 text-gray-100">
                {currentTopicData.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h4 className="font-bold text-lg mb-3">Use Cases</h4>
              <div className="space-y-2 text-gray-100 text-sm">
                {currentTopic === 'function-calling' && (
                  <>
                    <div>• API integrations and external data access</div>
                    <div>• Workflow automation and task orchestration</div>
                    <div>• Real-time information retrieval</div>
                  </>
                )}
                {currentTopic === 'rag-pipeline' && (
                  <>
                    <div>• Knowledge base question answering</div>
                    <div>• Document-grounded chat applications</div>
                    <div>• Research and information synthesis</div>
                  </>
                )}
                {currentTopic === 'mcp-architecture' && (
                  <>
                    <div>• Secure tool and data source connections</div>
                    <div>• Standardized AI application protocols</div>
                    <div>• Enterprise AI platform integration</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Interactive Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Topic-Specific Simulation */}
            {currentTopic === 'function-calling' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Function Calling Playground
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Available Tools</h4>
                    <div className="space-y-2">
                      {SAMPLE_TOOLS.map((tool, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTool(tool)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedTool.name === tool.name
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium text-sm">{tool.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => simulateFunctionCall(selectedTool)}
                      disabled={isRunning}
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isRunning ? 'Calling Function...' : 'Call Function'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold mb-3">Function Schema</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm">
                        <div className="font-medium mb-2">{selectedTool.name}</div>
                        <div className="text-gray-600 mb-3 text-xs">{selectedTool.description}</div>

                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700">Parameters:</div>
                          {Object.entries(selectedTool.parameters).map(([key, param]) => (
                            <div key={key} className="ml-2 text-xs">
                              <span className="font-medium">{key}</span>
                              <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                                param.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {param.type} {param.required && '(required)'}
                              </span>
                              <div className="text-gray-500 text-xs mt-1">{param.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {functionCallResult && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-1">Response</div>
                        <div className="text-sm text-green-700 font-mono">{functionCallResult}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'parallel-calling' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Parallel Function Calling
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={simulateParallelCalls}
                    disabled={isRunning}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {isRunning ? 'Executing Parallel Calls...' : 'Start Parallel Execution'}
                  </button>

                  {parallelCalls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {parallelCalls.map((call, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className={`p-4 rounded-lg border ${
                            call.status === 'completed' ? 'bg-green-50 border-green-200' :
                            call.status === 'running' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{call.name}</span>
                            {call.status === 'running' && (
                              <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                            )}
                            {call.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            call.status === 'completed' ? 'bg-green-100 text-green-700' :
                            call.status === 'running' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                          </div>
                          {call.result && (
                            <div className="mt-2 text-xs text-gray-600">{call.result}</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Parallel Execution Benefits</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Reduced total latency through concurrent execution</li>
                      <li>• Better resource utilization and user experience</li>
                      <li>• Independent error handling for each function</li>
                      <li>• Scalable orchestration for complex workflows</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'rag-pipeline' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  RAG Pipeline Visualization
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={simulateRAG}
                    disabled={isRunning}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isRunning ? 'Processing RAG Pipeline...' : 'Start RAG Process'}
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RAG_STAGES.map((stage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0.5 }}
                        animate={{
                          opacity: index <= ragStage ? 1 : 0.5,
                          scale: index === ragStage && isRunning ? [1, 1.02, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 rounded-lg border ${
                          index < ragStage ? 'bg-green-50 border-green-200' :
                          index === ragStage && isRunning ? 'bg-yellow-50 border-yellow-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{stage.name}</div>
                            <div className="text-xs text-gray-600">{stage.description}</div>
                          </div>
                          {index < ragStage && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {index === ragStage && isRunning && (
                            <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {ragStage >= RAG_STAGES.length - 1 && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">RAG Response Generated</h4>
                      <p className="text-sm text-green-700">
                        &quot;Based on the retrieved documents, machine learning algorithms can be categorized into supervised, unsupervised, and reinforcement learning approaches. Each type serves different purposes and requires different data preparation strategies...&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentTopic === 'vector-databases' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vector Database Comparison
                </h3>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {VECTOR_DBS.map((db, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-sm">{db.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            db.type === 'Managed' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {db.type}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Performance</span>
                            <span className="font-medium">{db.performance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${db.performance}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Ease of Use</span>
                            <span className="font-medium">{db.ease}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${db.ease}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span>Cost Efficiency</span>
                            <span className="font-medium">{db.cost}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${db.cost}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-gray-600 mb-1">Key Features:</div>
                          <div className="space-y-1">
                            {db.features.slice(0, 2).map((feature, i) => (
                              <div key={i} className="text-xs text-gray-700">• {feature}</div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2">Selection Criteria</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-red-700">
                      <div>
                        <span className="font-medium">Performance:</span> Query speed, indexing efficiency, scalability
                      </div>
                      <div>
                        <span className="font-medium">Ease of Use:</span> Setup complexity, API design, documentation
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> Hosting fees, operational overhead, scaling costs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'embeddings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Embedding Similarity Search
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={embeddingQuery}
                      onChange={(e) => setEmbeddingQuery(e.target.value)}
                      placeholder="Enter search query..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <button
                      onClick={simulateEmbeddingSearch}
                      disabled={isRunning}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      {isRunning ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {similarityResults.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900">Similarity Results</h4>
                      {similarityResults.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 border rounded-lg bg-yellow-50 border-yellow-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-gray-800">{result.text}</div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              result.score > 0.9 ? 'bg-green-100 text-green-700' :
                              result.score > 0.8 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {(result.score * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-yellow-500 h-1 rounded-full transition-all duration-500"
                              style={{ width: `${result.score * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2">Embedding Models</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-700">
                      <div>
                        <span className="font-medium">text-embedding-ada-002:</span> OpenAI&apos;s general-purpose embedding
                      </div>
                      <div>
                        <span className="font-medium">all-MiniLM-L6-v2:</span> Lightweight, fast sentence transformer
                      </div>
                      <div>
                        <span className="font-medium">e5-large-v2:</span> High-quality multilingual embeddings
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTopic === 'mcp-server' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  MCP Server Development Playground
                </h3>

                <div className="space-y-4">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 font-mono text-sm">my-mcp-server.js</span>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">TypeScript</span>
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">MCP SDK</span>
                      </div>
                    </div>
                    <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                      <code>{mcpServerCode.slice(0, 500)}...</code>
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-bold mb-2">Server Capabilities</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Tools: Calculator function
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Resources: None defined
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Transport: STDIO
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-bold mb-2">Test Tool Call</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Math expression (e.g., 2 + 3 * 4)"
                          className="w-full px-3 py-2 border rounded text-sm"
                        />
                        <button className="w-full px-3 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700">
                          Test Calculator
                        </button>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          Result: 14
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <h4 className="font-bold text-cyan-800 mb-2">MCP Development Steps</h4>
                    <ol className="text-sm text-cyan-700 space-y-1">
                      <li>1. Install MCP SDK and set up project structure</li>
                      <li>2. Define server capabilities (tools, resources, prompts)</li>
                      <li>3. Implement request handlers for each capability</li>
                      <li>4. Add error handling and input validation</li>
                      <li>5. Test with MCP client and deploy</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="xl:col-span-1 space-y-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="mr-2 text-green-600" size={20} />
                Performance Metrics
              </h3>

              <div className="space-y-4">
                {[
                  { label: 'Tool Latency', value: '125ms', color: 'blue', icon: Clock },
                  { label: 'Success Rate', value: '99.2%', color: 'green', icon: CheckCircle },
                  { label: 'Throughput', value: '450 req/s', color: 'purple', icon: TrendingUp },
                  { label: 'Error Rate', value: '0.8%', color: 'red', icon: AlertCircle }
                ].map((metric, index) => {
                  const Icon = metric.icon
                  return (
                    <motion.div
                      key={metric.label}
                      animate={animateTools ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex justify-between items-center p-3 bg-${metric.color}-50 rounded-lg`}
                    >
                      <div className="flex items-center">
                        <Icon size={16} className={`mr-2 text-${metric.color}-600`} />
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      <span className={`font-bold text-${metric.color}-700`}>{metric.value}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2 text-orange-600" size={20} />
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-blue-800 transition-colors">
                  <div className="font-medium text-sm">Test Function Call</div>
                  <div className="text-xs opacity-75">Simulate API integration</div>
                </button>

                <button className="w-full px-4 py-2 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 text-green-800 transition-colors">
                  <div className="font-medium text-sm">Run RAG Query</div>
                  <div className="text-xs opacity-75">Test retrieval pipeline</div>
                </button>

                <button className="w-full px-4 py-2 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 text-purple-800 transition-colors">
                  <div className="font-medium text-sm">Build MCP Server</div>
                  <div className="text-xs opacity-75">Create custom server</div>
                </button>

                <button className="w-full px-4 py-2 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 text-orange-800 transition-colors">
                  <div className="font-medium text-sm">Vector Search</div>
                  <div className="text-xs opacity-75">Similarity matching</div>
                </button>
              </div>
            </div>

            {/* Tool Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="mr-2 text-indigo-600" size={20} />
                Popular Tool Categories
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Data & APIs', count: 45, color: 'blue' },
                  { name: 'Communication', count: 23, color: 'green' },
                  { name: 'File Systems', count: 31, color: 'purple' },
                  { name: 'Development', count: 18, color: 'orange' },
                  { name: 'AI & ML', count: 27, color: 'red' }
                ].map((category, index) => (
                  <div key={index} className={`p-3 bg-${category.color}-50 rounded-lg border border-${category.color}-200`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium text-${category.color}-800`}>
                        {category.name}
                      </span>
                      <span className={`text-xs font-bold text-${category.color}-700`}>
                        {category.count} tools
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Educational Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Network className="mr-3 text-blue-600" size={24} />
            Tools & MCP Integration Mastery
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Function Calling</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Structured API integration patterns</li>
                <li>• Schema design and validation</li>
                <li>• Parallel execution optimization</li>
                <li>• Error handling and recovery</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">RAG & Vector Search</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• End-to-end RAG pipeline design</li>
                <li>• Vector database selection criteria</li>
                <li>• Embedding model comparison</li>
                <li>• Performance vs accuracy trade-offs</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">MCP Development</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Protocol architecture and primitives</li>
                <li>• Custom server development</li>
                <li>• Security and authentication</li>
                <li>• Production deployment strategies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}