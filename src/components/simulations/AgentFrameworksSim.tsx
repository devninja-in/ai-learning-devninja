'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Framework {
  id: string;
  name: string;
  useCase: string;
  complexity: number;
  ecosystem: 'Large' | 'Medium' | 'Small';
  strength: string;
  codeExample: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
}

const FRAMEWORKS: Framework[] = [
  {
    id: 'langchain',
    name: 'LangChain',
    useCase: 'General-purpose agents, chains, RAG',
    complexity: 4,
    ecosystem: 'Large',
    strength: 'Massive ecosystem, pre-built components',
    codeExample: `from langchain.agents import initialize_agent
from langchain.tools import Tool

tools = [search_tool, calculator_tool]
agent = initialize_agent(
  tools, llm, agent="zero-shot-react"
)
agent.run("What's the weather in Paris?")`,
    pros: [
      'Huge ecosystem with hundreds of integrations',
      'Pre-built chains for common use cases (RAG, summarization, Q&A)',
      'Active community and extensive documentation',
      'Support for multiple LLM providers',
    ],
    cons: [
      'High complexity — many abstractions to learn',
      'Can be overkill for simple tasks',
      'Frequent breaking changes between versions',
      'Performance overhead from abstraction layers',
    ],
    bestFor: [
      'Building complex multi-step agent workflows',
      'Prototyping with many different tools and data sources',
      'Teams that want batteries-included solutions',
      'Projects that need to swap LLM providers easily',
    ],
  },
  {
    id: 'llamaindex',
    name: 'LlamaIndex',
    useCase: 'Data ingestion, indexing, RAG',
    complexity: 3,
    ecosystem: 'Large',
    strength: 'Best-in-class RAG and data connectors',
    codeExample: `from llama_index import VectorStoreIndex
from llama_index.readers import SimpleDirectoryReader

docs = SimpleDirectoryReader('./data').load_data()
index = VectorStoreIndex.from_documents(docs)
query_engine = index.as_query_engine()
response = query_engine.query("What does the doc say?")`,
    pros: [
      'Data-first design — built around indexing and retrieval',
      'Excellent RAG support with advanced chunking strategies',
      '100+ data connectors (PDFs, databases, APIs, etc.)',
      'Query optimization and response synthesis built-in',
    ],
    cons: [
      'Less focused on multi-agent workflows (more on RAG)',
      'Steeper learning curve for non-RAG use cases',
      'Documentation can be sparse for advanced features',
      'Can be resource-intensive with large datasets',
    ],
    bestFor: [
      'Document Q&A and knowledge base applications',
      'Building production RAG systems',
      'Projects with complex data ingestion requirements',
      'When you need advanced retrieval strategies',
    ],
  },
  {
    id: 'crewai',
    name: 'CrewAI',
    useCase: 'Multi-agent collaboration, role-based teams',
    complexity: 3,
    ecosystem: 'Medium',
    strength: 'Role-based agents that collaborate',
    codeExample: `from crewai import Agent, Task, Crew

researcher = Agent(role="Researcher", goal="Find data")
writer = Agent(role="Writer", goal="Write report")

task1 = Task(description="Research topic X", agent=researcher)
task2 = Task(description="Write summary", agent=writer)

crew = Crew(agents=[researcher, writer], tasks=[task1, task2])
result = crew.kickoff()`,
    pros: [
      'Clean API for defining multi-agent systems',
      'Role-based design makes agent collaboration intuitive',
      'Sequential and hierarchical task execution',
      'Good for simulating team workflows',
    ],
    cons: [
      'Smaller ecosystem than LangChain/LlamaIndex',
      'Limited to specific multi-agent patterns',
      'Less control over low-level agent behavior',
      'Still maturing — some features are experimental',
    ],
    bestFor: [
      'Tasks that naturally decompose into specialized roles',
      'Content generation with research, writing, editing steps',
      'Simulating human team workflows with AI',
      'Projects where agent coordination is the focus',
    ],
  },
  {
    id: 'autogen',
    name: 'AutoGen',
    useCase: 'Conversational multi-agent systems',
    complexity: 4,
    ecosystem: 'Medium',
    strength: 'Agent-to-agent conversation and code execution',
    codeExample: `from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent("assistant", llm_config=config)
user_proxy = UserProxyAgent(
  "user_proxy", code_execution_config={"work_dir": "code"}
)

user_proxy.initiate_chat(
  assistant, message="Write and run a script to plot data"
)`,
    pros: [
      'Powerful conversational multi-agent framework',
      'Built-in code execution and human-in-the-loop support',
      'Agents can negotiate and reach consensus',
      'Strong support for autonomous code generation workflows',
    ],
    cons: [
      'Complex setup for simple use cases',
      'Code execution can be risky without proper sandboxing',
      'Debugging multi-agent conversations is hard',
      'Documentation focuses on research use cases',
    ],
    bestFor: [
      'Code generation and debugging workflows',
      'Research and experimentation with multi-agent dynamics',
      'Projects where agents need to negotiate or debate',
      'Human-in-the-loop applications',
    ],
  },
  {
    id: 'claude-sdk',
    name: 'Claude Agent SDK',
    useCase: 'Production Claude-native agents',
    complexity: 2,
    ecosystem: 'Small',
    strength: 'Lightweight, close to the API, production-ready',
    codeExample: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const messages = [{ role: 'user', content: 'Task...' }];

const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  tools: [searchTool, calculatorTool],
  messages
});
// Handle tool calls, loop until done`,
    pros: [
      'Minimal abstraction — you control the agent loop',
      'Native support for Claude features (thinking, extended context)',
      'Production-grade with proper error handling',
      'No framework overhead or version churn',
    ],
    cons: [
      'You write the agent loop yourself (no pre-built chains)',
      'Fewer batteries included compared to LangChain',
      'Claude-specific — not provider-agnostic',
      'Smaller community and ecosystem',
    ],
    bestFor: [
      'Production applications where you want full control',
      'When you are committed to Claude as your LLM',
      'Simple agents that do not need complex orchestration',
      'Teams that prefer minimal dependencies',
    ],
  },
];

const FEATURES = [
  { name: 'Tool Calling', frameworks: { langchain: true, llamaindex: true, crewai: true, autogen: true, 'claude-sdk': true } },
  { name: 'RAG Support', frameworks: { langchain: true, llamaindex: true, crewai: false, autogen: false, 'claude-sdk': false } },
  { name: 'Multi-Agent', frameworks: { langchain: true, llamaindex: false, crewai: true, autogen: true, 'claude-sdk': false } },
  { name: 'Streaming', frameworks: { langchain: true, llamaindex: true, crewai: false, autogen: false, 'claude-sdk': true } },
  { name: 'Memory/State', frameworks: { langchain: true, llamaindex: true, crewai: true, autogen: true, 'claude-sdk': false } },
  { name: 'Code Execution', frameworks: { langchain: false, llamaindex: false, crewai: false, autogen: true, 'claude-sdk': false } },
];

interface DecisionQuestion {
  question: string;
  options: { label: string; value: string }[];
}

const DECISION_QUESTIONS: DecisionQuestion[] = [
  {
    question: "What's your main task?",
    options: [
      { label: 'Document Q&A / RAG', value: 'rag' },
      { label: 'General agent workflow', value: 'general' },
      { label: 'Multi-agent collaboration', value: 'multi-agent' },
      { label: 'Code generation', value: 'code' },
    ],
  },
  {
    question: 'How complex is your use case?',
    options: [
      { label: 'Simple (1-3 tools, single agent)', value: 'simple' },
      { label: 'Moderate (multiple tools, some complexity)', value: 'moderate' },
      { label: 'Complex (many agents/tools, orchestration)', value: 'complex' },
    ],
  },
  {
    question: 'Production or prototype?',
    options: [
      { label: 'Prototype / experiment', value: 'prototype' },
      { label: 'Production-ready application', value: 'production' },
    ],
  },
];

function getRecommendation(answers: Record<number, string>): string {
  const task = answers[0];
  const complexity = answers[1];
  const stage = answers[2];

  if (task === 'rag') return 'llamaindex';
  if (task === 'code') return 'autogen';
  if (task === 'multi-agent') return complexity === 'complex' ? 'autogen' : 'crewai';

  // General agent workflow
  if (stage === 'production' && complexity === 'simple') return 'claude-sdk';
  if (stage === 'prototype') return 'langchain';
  if (complexity === 'complex') return 'langchain';

  return 'langchain';
}

export default function AgentFrameworksSim() {
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);
  const [decisionAnswers, setDecisionAnswers] = useState<Record<number, string>>({});
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleDecisionAnswer = (questionIndex: number, value: string) => {
    const newAnswers = { ...decisionAnswers, [questionIndex]: value };
    setDecisionAnswers(newAnswers);

    if (Object.keys(newAnswers).length === DECISION_QUESTIONS.length) {
      setShowRecommendation(true);
    }
  };

  const resetDecisionHelper = () => {
    setDecisionAnswers({});
    setShowRecommendation(false);
  };

  const recommendedFrameworkId = showRecommendation
    ? getRecommendation(decisionAnswers)
    : null;

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-8">
      {/* Framework Cards */}
      <div>
        <div className="text-sm font-medium text-gray-400 mb-4">Compare frameworks:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FRAMEWORKS.map((framework) => {
            const isExpanded = expandedFramework === framework.id;
            const isRecommended = recommendedFrameworkId === framework.id;

            return (
              <motion.div
                key={framework.id}
                layout
                className={`bg-gray-800 rounded-lg border-2 transition-all ${
                  isRecommended
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : isExpanded
                    ? 'border-blue-500'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedFramework(isExpanded ? null : framework.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{framework.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{framework.useCase}</p>
                    </div>
                    {isRecommended && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Recommended
                      </div>
                    )}
                  </div>

                  {/* Complexity */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1.5">Complexity</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-4 h-4 rounded-full ${
                            level <= framework.complexity
                              ? 'bg-blue-500'
                              : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ecosystem & Strength */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">Ecosystem: </span>
                      <span className="text-gray-300">{framework.ecosystem}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Key strength: </span>
                      <span className="text-blue-300">{framework.strength}</span>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className="text-center mt-3 text-xs text-gray-500">
                    {isExpanded ? '▲ Click to collapse' : '▼ Click to expand'}
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-700 p-4 space-y-4">
                        {/* Code Example */}
                        <div>
                          <div className="text-xs font-medium text-gray-400 mb-2">Example code:</div>
                          <div className="bg-gray-950 rounded p-3 overflow-x-auto">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre">
                              {framework.codeExample}
                            </pre>
                          </div>
                        </div>

                        {/* Pros */}
                        <div>
                          <div className="text-xs font-medium text-green-400 mb-2">Pros:</div>
                          <ul className="space-y-1.5">
                            {framework.pros.map((pro, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">+</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div>
                          <div className="text-xs font-medium text-red-400 mb-2">Cons:</div>
                          <ul className="space-y-1.5">
                            {framework.cons.map((con, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">-</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Best for */}
                        <div>
                          <div className="text-xs font-medium text-blue-400 mb-2">Best for:</div>
                          <ul className="space-y-1.5">
                            {framework.bestFor.map((item, i) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">→</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decision Helper */}
      <div className="border-t border-gray-800 pt-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Decision Helper</h3>
            {Object.keys(decisionAnswers).length > 0 && (
              <button
                onClick={resetDecisionHelper}
                className="text-xs text-gray-400 hover:text-gray-300"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-6">
            {DECISION_QUESTIONS.map((question, index) => (
              <div key={index}>
                <div className="text-sm font-medium text-gray-300 mb-3">
                  {index + 1}. {question.question}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option) => {
                    const isSelected = decisionAnswers[index] === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleDecisionAnswer(index, option.value)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Recommendation */}
            <AnimatePresence>
              {showRecommendation && recommendedFrameworkId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4"
                >
                  <div className="text-green-400 font-semibold mb-2">Recommendation:</div>
                  <div className="text-white text-lg font-bold">
                    {FRAMEWORKS.find((f) => f.id === recommendedFrameworkId)?.name}
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    {FRAMEWORKS.find((f) => f.id === recommendedFrameworkId)?.strength}
                  </div>
                  <div className="text-xs text-gray-400 mt-3">
                    Click the card above to see details, code examples, and pros/cons.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border-t border-gray-800 pt-8">
        <div className="text-sm font-medium text-gray-400 mb-4">Feature comparison:</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">Feature</th>
                {FRAMEWORKS.map((framework) => (
                  <th key={framework.id} className="text-center text-gray-400 font-medium pb-3 px-2">
                    <div className="text-xs">{framework.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-3 pr-4 text-gray-300">{feature.name}</td>
                  {FRAMEWORKS.map((framework) => (
                    <td key={framework.id} className="py-3 px-2 text-center">
                      {feature.frameworks[framework.id as keyof typeof feature.frameworks] ? (
                        <span className="text-green-400 text-lg">✓</span>
                      ) : (
                        <span className="text-gray-600 text-lg">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
