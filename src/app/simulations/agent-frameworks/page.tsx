'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { SimulationEngine } from '@/utils/simulation-helpers'
import {
  Bot,
  Zap,
  Code,
  Settings,
  Play,
  GitBranch,
  Database,
  MessageSquare,
  Target,
  Layers,
  Workflow,
  CheckCircle,
  Circle,
  ArrowRight,
  Copy,
  Download,
  Lightbulb,
  Gauge
} from 'lucide-react'

const AGENT_FRAMEWORKS = {
  langchain: {
    name: 'LangChain',
    description: 'The most popular framework for building applications with LLMs',
    color: '#10B981',
    strengths: ['Extensive ecosystem', 'Rich documentation', 'Active community', 'Tool integrations'],
    weaknesses: ['Can be complex', 'Performance overhead', 'Steep learning curve'],
    useCases: ['RAG systems', 'Chatbots', 'Document processing', 'Multi-agent workflows'],
    complexity: 'High',
    performance: 'Medium',
    ecosystem: 'Excellent',
    learningCurve: 'Steep'
  },
  llamaindex: {
    name: 'LlamaIndex',
    description: 'Data framework for LLM applications, focused on knowledge augmentation',
    color: '#3B82F6',
    strengths: ['Data-focused design', 'Easy RAG setup', 'Vector store abstractions', 'Query optimization'],
    weaknesses: ['Narrower scope', 'Fewer tools', 'Less flexibility'],
    useCases: ['Knowledge bases', 'Document Q&A', 'Search systems', 'Data analysis'],
    complexity: 'Medium',
    performance: 'High',
    ecosystem: 'Good',
    learningCurve: 'Moderate'
  },
  crewai: {
    name: 'CrewAI',
    description: 'Multi-agent framework for collaborative AI workflows',
    color: '#8B5CF6',
    strengths: ['Multi-agent focus', 'Role-based design', 'Task coordination', 'Simple API'],
    weaknesses: ['Limited ecosystem', 'Newer framework', 'Less documentation'],
    useCases: ['Team automation', 'Content creation', 'Research tasks', 'Creative workflows'],
    complexity: 'Low',
    performance: 'High',
    ecosystem: 'Growing',
    learningCurve: 'Easy'
  },
  autogen: {
    name: 'AutoGen',
    description: 'Microsoft framework for multi-agent conversation systems',
    color: '#F59E0B',
    strengths: ['Conversation patterns', 'Code generation', 'Microsoft backing', 'Research focus'],
    weaknesses: ['Academic origins', 'Complex setup', 'Limited production use'],
    useCases: ['Code generation', 'Research automation', 'Conversational AI', 'Collaborative tasks'],
    complexity: 'High',
    performance: 'Medium',
    ecosystem: 'Growing',
    learningCurve: 'Steep'
  },
  langgraph: {
    name: 'LangGraph',
    description: 'State-based agent framework for complex workflows',
    color: '#EF4444',
    strengths: ['Graph-based flows', 'State management', 'Debugging tools', 'LangChain integration'],
    weaknesses: ['Complex concepts', 'Limited docs', 'New framework'],
    useCases: ['Complex workflows', 'State machines', 'Multi-step reasoning', 'Conditional logic'],
    complexity: 'Very High',
    performance: 'High',
    ecosystem: 'Limited',
    learningCurve: 'Very Steep'
  },
  pydantic: {
    name: 'Pydantic AI',
    description: 'Type-safe agent framework built on Pydantic validation',
    color: '#06B6D4',
    strengths: ['Type safety', 'Validation', 'Fast performance', 'Python-native'],
    weaknesses: ['New framework', 'Limited features', 'Small community'],
    useCases: ['Type-safe agents', 'Data validation', 'API integrations', 'Production systems'],
    complexity: 'Medium',
    performance: 'Very High',
    ecosystem: 'Minimal',
    learningCurve: 'Moderate'
  }
}

const SAMPLE_TASKS = {
  rag: {
    title: 'RAG System',
    description: 'Build a document Q&A system',
    code: {
      langchain: `from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI

# Setup vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(embedding_function=embeddings)

# Create RAG chain
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=vectorstore.as_retriever()
)

# Query the system
response = qa_chain.run("What is the main topic?")`,
      llamaindex: `from llama_index import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms import OpenAI

# Load documents
documents = SimpleDirectoryReader('data').load_data()

# Create index
index = VectorStoreIndex.from_documents(documents)

# Setup query engine
query_engine = index.as_query_engine(
    llm=OpenAI(model="gpt-3.5-turbo")
)

# Query the system
response = query_engine.query("What is the main topic?")`,
      crewai: `from crewai import Agent, Task, Crew
from crewai.tools import FileReadTool, SearchTool

# Create research agent
researcher = Agent(
    role='Research Analyst',
    goal='Find and analyze information',
    tools=[FileReadTool(), SearchTool()]
)

# Define task
task = Task(
    description='Research the main topic in documents',
    agent=researcher
)

# Run crew
crew = Crew(agents=[researcher], tasks=[task])
result = crew.kickoff()`
    }
  },
  multiagent: {
    title: 'Multi-Agent Team',
    description: 'Coordinate multiple AI agents',
    code: {
      crewai: `from crewai import Agent, Task, Crew

# Create specialized agents
writer = Agent(
    role='Content Writer',
    goal='Create engaging content',
    backstory='Expert at crafting compelling narratives'
)

reviewer = Agent(
    role='Content Reviewer',
    goal='Ensure quality and accuracy',
    backstory='Detail-oriented quality assurance expert'
)

# Define collaborative tasks
write_task = Task(
    description='Write an article about AI frameworks',
    agent=writer
)

review_task = Task(
    description='Review and improve the article',
    agent=reviewer,
    context=[write_task]
)

# Run the crew
crew = Crew(
    agents=[writer, reviewer],
    tasks=[write_task, review_task],
    verbose=True
)

result = crew.kickoff()`,
      autogen: `from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# Create agents
writer = AssistantAgent(
    name="Writer",
    system_message="You are a content writer.",
    llm_config={"model": "gpt-4"}
)

reviewer = AssistantAgent(
    name="Reviewer",
    system_message="You review and improve content.",
    llm_config={"model": "gpt-4"}
)

user_proxy = UserProxyAgent(
    name="UserProxy",
    human_input_mode="NEVER"
)

# Setup group chat
groupchat = GroupChat(
    agents=[writer, reviewer, user_proxy],
    messages=[]
)

manager = GroupChatManager(groupchat=groupchat)

# Start conversation
user_proxy.initiate_chat(
    manager,
    message="Write an article about AI frameworks"
)`,
      langgraph: `from langgraph import StateGraph
from typing import TypedDict

class State(TypedDict):
    content: str
    reviewed: bool
    feedback: str

def write_content(state: State):
    # Writing logic here
    return {"content": "AI frameworks article...", "reviewed": False}

def review_content(state: State):
    # Review logic here
    return {"reviewed": True, "feedback": "Good article!"}

# Build workflow graph
workflow = StateGraph(State)
workflow.add_node("write", write_content)
workflow.add_node("review", review_content)
workflow.add_edge("write", "review")
workflow.set_entry_point("write")

app = workflow.compile()
result = app.invoke({"content": "", "reviewed": False})`
    }
  },
  chatbot: {
    title: 'Conversational Agent',
    description: 'Build an intelligent chatbot',
    code: {
      langchain: `from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.llms import OpenAI

# Setup conversation chain
memory = ConversationBufferMemory()
conversation = ConversationChain(
    llm=OpenAI(),
    memory=memory,
    verbose=True
)

# Chat loop
while True:
    user_input = input("You: ")
    if user_input.lower() == 'quit':
        break

    response = conversation.predict(input=user_input)
    print(f"Bot: {response}")`,
      pydantic: `from pydantic_ai import Agent
from pydantic import BaseModel

class UserContext(BaseModel):
    name: str
    preferences: list[str]

# Create type-safe agent
agent = Agent(
    model='openai:gpt-4',
    result_type=str,
    system_prompt='You are a helpful assistant'
)

@agent.tool
def get_weather(location: str) -> str:
    return f"The weather in {location} is sunny"

# Run conversation
async def chat():
    ctx = UserContext(name="Alice", preferences=["tech", "AI"])
    result = await agent.run(
        "What's the weather like?",
        deps=ctx
    )
    return result.data`
    }
  }
}

const DECISION_TREE = [
  {
    question: "What's your primary use case?",
    options: [
      { label: "Document Q&A / RAG", value: "rag", next: "rag_complexity" },
      { label: "Multi-agent collaboration", value: "multiagent", next: "team_size" },
      { label: "Conversational AI", value: "chat", next: "chat_features" },
      { label: "Complex workflows", value: "workflow", next: "workflow_complexity" }
    ]
  },
  {
    id: "rag_complexity",
    question: "How complex is your RAG system?",
    options: [
      { label: "Simple Q&A", value: "simple", recommendation: "llamaindex" },
      { label: "Multiple data sources", value: "complex", recommendation: "langchain" },
      { label: "High performance needed", value: "performance", recommendation: "pydantic" }
    ]
  },
  {
    id: "team_size",
    question: "How many agents do you need?",
    options: [
      { label: "2-3 agents", value: "small", recommendation: "crewai" },
      { label: "Many agents", value: "large", recommendation: "autogen" },
      { label: "Complex state management", value: "stateful", recommendation: "langgraph" }
    ]
  },
  {
    id: "chat_features",
    question: "What chat features do you need?",
    options: [
      { label: "Basic conversation", value: "basic", recommendation: "pydantic" },
      { label: "Memory & context", value: "memory", recommendation: "langchain" },
      { label: "Tool integration", value: "tools", recommendation: "langchain" }
    ]
  },
  {
    id: "workflow_complexity",
    question: "How complex are your workflows?",
    options: [
      { label: "Linear processes", value: "linear", recommendation: "crewai" },
      { label: "Conditional logic", value: "conditional", recommendation: "langgraph" },
      { label: "State machines", value: "state", recommendation: "langgraph" }
    ]
  }
]

export default function AgentFrameworksSimulation() {
  const [selectedFramework, setSelectedFramework] = useState<string>('langchain')
  const [selectedTask, setSelectedTask] = useState<string>('rag')
  const [comparisonMetrics, setComparisonMetrics] = useState(['complexity', 'performance'])
  const [decisionStep, setDecisionStep] = useState(0)
  const [decisionPath, setDecisionPath] = useState<Record<string, any>>({})
  const [showDecisionTree, setShowDecisionTree] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'playground' | 'decision'>('overview')
  const svgRef = useRef<SVGSVGElement>(null)

  const frameworks = Object.entries(AGENT_FRAMEWORKS)
  const currentTask = SAMPLE_TASKS[selectedTask as keyof typeof SAMPLE_TASKS]

  const comparisonData = useMemo(() => {
    return frameworks.map(([key, framework]) => ({
      name: framework.name,
      complexity: framework.complexity === 'Low' ? 1 :
                 framework.complexity === 'Medium' ? 2 :
                 framework.complexity === 'High' ? 3 : 4,
      performance: framework.performance === 'Medium' ? 2 :
                  framework.performance === 'High' ? 3 : 4,
      ecosystem: framework.ecosystem === 'Minimal' ? 1 :
                framework.ecosystem === 'Limited' ? 2 :
                framework.ecosystem === 'Growing' ? 3 :
                framework.ecosystem === 'Good' ? 4 : 5,
      learningCurve: framework.learningCurve === 'Easy' ? 1 :
                    framework.learningCurve === 'Moderate' ? 2 :
                    framework.learningCurve === 'Steep' ? 3 : 4,
      color: framework.color
    }))
  }, [])

  useEffect(() => {
    if (!svgRef.current || activeTab !== 'comparison') return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400
    const margin = { top: 50, right: 150, bottom: 60, left: 60 }

    // Filter data based on selected metrics
    const filteredData = comparisonData.map(d => ({
      name: d.name,
      color: d.color,
      values: comparisonMetrics.map(metric => ({
        metric,
        value: d[metric as keyof typeof d] as number
      }))
    }))

    // Set up scales
    const xScale = d3.scalePoint()
      .domain(comparisonMetrics)
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([height - margin.bottom, margin.top])

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('text-transform', 'capitalize')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', '#e5e7eb')
      .style('stroke-dasharray', '3,3')

    // Draw lines for each framework
    filteredData.forEach((framework, index) => {
      const line = d3.line<any>()
        .x(d => xScale(d.metric) || 0)
        .y(d => yScale(d.value))
        .curve(d3.curveCardinal)

      const path = svg.append('path')
        .datum(framework.values)
        .attr('fill', 'none')
        .attr('stroke', framework.color)
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', function() {
          return this.getTotalLength()
        })
        .attr('stroke-dashoffset', function() {
          return this.getTotalLength()
        })
        .attr('d', line)

      // Animate line drawing
      path.transition()
        .duration(1500)
        .delay(index * 200)
        .attr('stroke-dashoffset', 0)

      // Add points
      svg.selectAll(`.point-${index}`)
        .data(framework.values)
        .enter()
        .append('circle')
        .attr('class', `point-${index}`)
        .attr('cx', d => xScale(d.metric) || 0)
        .attr('cy', d => yScale(d.value))
        .attr('r', 0)
        .attr('fill', framework.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .transition()
        .duration(800)
        .delay(index * 200 + 800)
        .attr('r', 6)
    })

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 20}, ${margin.top})`)

    filteredData.forEach((framework, index) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${index * 25})`)

      legendItem.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', framework.color)
        .attr('stroke-width', 3)

      legendItem.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(framework.name)
    })

  }, [comparisonData, comparisonMetrics, activeTab])

  const handleDecisionNext = (value: string) => {
    const currentQuestion = DECISION_TREE[decisionStep]
    const selectedOption = currentQuestion.options.find(opt => opt.value === value)

    if (!selectedOption) return

    const newPath = { ...decisionPath, [currentQuestion.question]: value }
    setDecisionPath(newPath)

    if ('recommendation' in selectedOption && selectedOption.recommendation) {
      // Show final recommendation
      setDecisionPath({ ...newPath, recommendation: selectedOption.recommendation })
    } else if ('next' in selectedOption && selectedOption.next) {
      // Move to next question
      const nextStepIndex = DECISION_TREE.findIndex(q => q.id === selectedOption.next)
      if (nextStepIndex !== -1) {
        setDecisionStep(nextStepIndex)
      }
    }
  }

  const resetDecisionTree = () => {
    setDecisionStep(0)
    setDecisionPath({})
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const learningObjectives = [
    "Compare major agent frameworks and their strengths",
    "Understand framework selection criteria",
    "Experience hands-on code examples",
    "Build decision-making skills for production use"
  ]

  return (
    <SimulationLayout
      title="Agent Frameworks Mastery"
      description="Master LangChain, LlamaIndex, CrewAI, and other frameworks for production AI"
      difficulty="Advanced"
      category="Agent Frameworks"
      onPlay={() => setActiveTab('playground')}
      onReset={() => {
        setSelectedFramework('langchain')
        setSelectedTask('rag')
        setActiveTab('overview')
        resetDecisionTree()
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'overview', label: 'Framework Overview', icon: Layers },
            { id: 'comparison', label: 'Side-by-Side Comparison', icon: Gauge },
            { id: 'playground', label: 'Code Playground', icon: Code },
            { id: 'decision', label: 'Framework Selector', icon: Lightbulb }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {frameworks.map(([key, framework]) => (
                  <div
                    key={key}
                    className="bg-white rounded-lg shadow-lg p-6 border-l-4 hover:shadow-xl transition-all duration-300"
                    style={{ borderLeftColor: framework.color }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {framework.name}
                      </h3>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: framework.color }}
                      />
                    </div>

                    <p className="text-gray-600 mb-4 text-sm">
                      {framework.description}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-1">Strengths</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {framework.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle size={12} className="mr-2 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-orange-700 mb-1">Considerations</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {framework.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="flex items-center">
                              <Circle size={12} className="mr-2 text-orange-500" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-blue-700 mb-1">Best For</h4>
                        <div className="flex flex-wrap gap-1">
                          {framework.useCases.slice(0, 2).map((useCase, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
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
          )}

          {activeTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Framework Comparison</h3>

                  <div className="flex flex-wrap gap-2">
                    {['complexity', 'performance', 'ecosystem', 'learningCurve'].map(metric => (
                      <label key={metric} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comparisonMetrics.includes(metric)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setComparisonMetrics([...comparisonMetrics, metric])
                            } else {
                              setComparisonMetrics(comparisonMetrics.filter(m => m !== metric))
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {metric.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

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
                    Compare frameworks across different dimensions. Higher values indicate better performance in that area.
                    Select/deselect metrics to customize the comparison.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'playground' && (
            <motion.div
              key="playground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Task Selection */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="mr-2 text-blue-600" size={20} />
                    Select Task
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(SAMPLE_TASKS).map(([key, task]) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="task"
                          value={key}
                          checked={selectedTask === key}
                          onChange={() => setSelectedTask(key)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {task.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Examples */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentTask.title} Implementation
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentTask.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(currentTask.code).map(([frameworkKey, code]) => {
                      const framework = AGENT_FRAMEWORKS[frameworkKey as keyof typeof AGENT_FRAMEWORKS]
                      if (!framework) return null

                      return (
                        <div key={frameworkKey} className="border rounded-lg overflow-hidden">
                          <div
                            className="px-4 py-3 text-white font-medium flex items-center justify-between"
                            style={{ backgroundColor: framework.color }}
                          >
                            <span>{framework.name}</span>
                            <button
                              onClick={() => copyCode(code)}
                              className="flex items-center space-x-1 px-2 py-1 rounded bg-black/20 hover:bg-black/30 transition-colors"
                            >
                              <Copy size={14} />
                              <span className="text-sm">Copy</span>
                            </button>
                          </div>
                          <pre className="p-4 bg-gray-50 text-sm overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                        </div>
                      )
                    })}
                  </div>

                  {Object.keys(currentTask.code).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Code size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No code examples available for this task yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'decision' && (
            <motion.div
              key="decision"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Framework Decision Helper
                  </h3>
                  <p className="text-gray-600">
                    Answer a few questions to get a personalized framework recommendation
                  </p>
                </div>

                {!decisionPath.recommendation ? (
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Object.keys(decisionPath).length} / {DECISION_TREE.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(Object.keys(decisionPath).length / DECISION_TREE.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {DECISION_TREE[decisionStep].question}
                      </h4>

                      <div className="space-y-3">
                        {DECISION_TREE[decisionStep].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleDecisionNext(option.value)}
                            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {option.label}
                              </span>
                              <ArrowRight
                                size={16}
                                className="text-gray-400 group-hover:text-blue-600 transition-colors"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={resetDecisionTree}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-8">
                      <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        Recommendation Ready!
                      </h4>
                    </div>

                    {(() => {
                      const recommendedFramework = AGENT_FRAMEWORKS[decisionPath.recommendation as keyof typeof AGENT_FRAMEWORKS]
                      return (
                        <div
                          className="p-6 rounded-lg border-l-4 mb-6"
                          style={{ borderLeftColor: recommendedFramework.color }}
                        >
                          <h5 className="text-xl font-bold text-gray-900 mb-2">
                            {recommendedFramework.name}
                          </h5>
                          <p className="text-gray-600 mb-4">
                            {recommendedFramework.description}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Best for:</span>
                              <ul className="mt-1 space-y-1">
                                {recommendedFramework.useCases.slice(0, 3).map((use, idx) => (
                                  <li key={idx} className="text-gray-600">• {use}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-semibold">Key strengths:</span>
                              <ul className="mt-1 space-y-1">
                                {recommendedFramework.strengths.slice(0, 3).map((strength, idx) => (
                                  <li key={idx} className="text-gray-600">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={resetDecisionTree}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFramework(decisionPath.recommendation)
                          setActiveTab('playground')
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Code Examples
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SimulationLayout>
  )
}