'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import AgentFrameworksSim from '@/components/simulations/AgentFrameworksSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function AgentFrameworksContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            You could build an AI agent from scratch — write the loop, handle
            tool calls, manage memory, deal with errors. Or you could use a
            framework that handles all that boilerplate and let you focus on
            what your agent actually does. The question is not whether to use a
            framework. It is which one. And right now, there are too many to
            choose from.
          </p>

          <p className="text-gray-700 leading-relaxed">
            LangChain gives you everything: chains, agents, tools, memory, RAG.
            LlamaIndex is built around data — indexing, retrieval, and
            knowledge-heavy applications. CrewAI and AutoGen let you define
            teams of specialized agents that collaborate. Claude Agent SDK and
            Vercel AI SDK are lightweight and API-native, keeping you close to
            the metal. Each framework solves a different problem, and picking
            the wrong one can mean fighting against the abstraction instead of
            building your application.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This lesson is not about learning every framework in depth. It is
            about understanding what each framework is good at, when to use it,
            and when to avoid it. You will see a framework comparison tool, code
            examples, and a decision helper that recommends the right tool for
            your use case. By the end, you will know how to pick the framework
            that gets out of your way and lets you ship.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Why frameworks exist">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Every agent needs the same basic components: a loop that alternates
            between reasoning and action, tool management to define and execute
            functions, memory to track conversation history and state, error
            handling to recover from failures, and output parsing to extract
            structured data from LLM responses. Writing all of this from scratch
            for every agent is wasteful. Frameworks exist to abstract away the
            boilerplate so you can focus on your specific use case.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The problem is that different frameworks make different tradeoffs.
            Some frameworks (like LangChain) give you maximum flexibility at the
            cost of complexity. Others (like Claude Agent SDK) keep things
            minimal but require you to write more code yourself. Some are built
            around specific patterns (LlamaIndex for RAG, CrewAI for
            multi-agent). There is no universal best choice — the right
            framework depends on what you are building, how much control you
            need, and whether you are prototyping or shipping to production.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="From Raw API to Framework"
              nodes={[
                { id: 'raw', label: 'Raw LLM API', sublabel: 'Manual loop, tool handling, memory', type: 'input' },
                { id: 'framework', label: 'Framework', sublabel: 'Loop + Tools + Memory + Parsing', type: 'process' },
                { id: 'agent', label: 'Working Agent', sublabel: 'Focus on your use case, not boilerplate', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The framework landscape is crowded and evolving fast. New frameworks
            appear every few months, and established ones go through breaking
            changes. This lesson focuses on five major categories: LangChain
            (general-purpose Swiss Army knife), LlamaIndex (data-first RAG),
            CrewAI/AutoGen (multi-agent collaboration), and
            Claude/Vercel/lightweight SDKs (minimal abstraction). These cover
            the majority of use cases, and understanding them will help you
            evaluate new frameworks as they emerge.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="The framework landscape">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Each framework was designed to solve a specific problem, and
            understanding that problem is the key to picking the right tool.
            Here is a tour of the major frameworks, what they are optimized for,
            and when you should (or should not) use them.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'LangChain — The Swiss Army Knife',
                content: (
                  <div className="space-y-4">
                    <p>
                      LangChain is the most popular agent framework. It gives you
                      everything: pre-built chains (sequences of LLM calls),
                      agents (ReAct loops with tool access), hundreds of tool
                      integrations, memory modules, RAG pipelines, and support
                      for every major LLM provider. The ecosystem is massive —
                      if you need to connect to a database, search engine, API,
                      or file format, LangChain probably has a pre-built
                      connector.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs space-y-2">
                      <div className="text-gray-400 mb-2">Example: Simple ReAct agent with tools</div>
                      <div className="text-gray-300">
                        <div><span className="text-blue-400">from</span> langchain.agents <span className="text-blue-400">import</span> initialize_agent</div>
                        <div><span className="text-blue-400">from</span> langchain.tools <span className="text-blue-400">import</span> Tool</div>
                        <div className="mt-2">tools = [search_tool, calculator_tool]</div>
                        <div>agent = initialize_agent(</div>
                        <div className="pl-4">tools, llm, agent=<span className="text-green-400">&quot;zero-shot-react&quot;</span></div>
                        <div>)</div>
                        <div className="mt-2">agent.run(<span className="text-green-400">&quot;What&apos;s the weather in Paris?&quot;</span>)</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg p-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">Best for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• General-purpose agent development</li>
                          <li>• Prototyping with many tools and data sources</li>
                          <li>• Teams that want batteries-included solutions</li>
                          <li>• Projects that need to swap LLM providers</li>
                        </ul>
                      </div>
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg p-4">
                        <div className="text-red-400 text-sm font-semibold mb-2">Watch out for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• High complexity — many abstractions to learn</li>
                          <li>• Overkill for simple tasks</li>
                          <li>• Frequent breaking changes between versions</li>
                          <li>• Performance overhead from abstraction layers</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      LangChain is the default choice for most teams because of
                      its huge ecosystem and community. But that ecosystem comes
                      at a cost: the API is complex, the documentation is
                      sprawling, and major versions introduce breaking changes.
                      If you are building a simple agent with 2-3 tools, you are
                      probably better off with a lighter framework.
                    </p>
                  </div>
                ),
              },
              {
                title: 'LlamaIndex — Data-First RAG',
                content: (
                  <div className="space-y-4">
                    <p>
                      LlamaIndex is built around a single core idea: making it
                      easy to connect LLMs to your data. It provides advanced
                      indexing strategies (vector indexes, tree indexes,
                      keyword indexes), 100+ data connectors (PDFs, databases,
                      APIs, Slack, Notion, Google Drive, etc.), sophisticated
                      chunking and retrieval algorithms, and query optimization.
                      If your use case is document Q&amp;A, knowledge base
                      search, or any form of retrieval-augmented generation,
                      LlamaIndex is the best tool for the job.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs space-y-2">
                      <div className="text-gray-400 mb-2">Example: Build a document Q&amp;A system</div>
                      <div className="text-gray-300">
                        <div><span className="text-blue-400">from</span> llama_index <span className="text-blue-400">import</span> VectorStoreIndex</div>
                        <div><span className="text-blue-400">from</span> llama_index.readers <span className="text-blue-400">import</span> SimpleDirectoryReader</div>
                        <div className="mt-2">docs = SimpleDirectoryReader(<span className="text-green-400">&apos;./data&apos;</span>).load_data()</div>
                        <div>index = VectorStoreIndex.from_documents(docs)</div>
                        <div>query_engine = index.as_query_engine()</div>
                        <div className="mt-2">response = query_engine.query(<span className="text-green-400">&quot;What does the doc say?&quot;</span>)</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg p-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">Best for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• Document Q&amp;A and knowledge base applications</li>
                          <li>• Building production RAG systems</li>
                          <li>• Complex data ingestion requirements</li>
                          <li>• When you need advanced retrieval strategies</li>
                        </ul>
                      </div>
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg p-4">
                        <div className="text-red-400 text-sm font-semibold mb-2">Watch out for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• Less focused on multi-agent workflows</li>
                          <li>• Steeper learning curve for non-RAG use cases</li>
                          <li>• Documentation can be sparse for advanced features</li>
                          <li>• Resource-intensive with large datasets</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      LlamaIndex is the gold standard for RAG applications. It
                      handles the hard parts (chunking strategies, embedding
                      optimization, hybrid search) so you can focus on your
                      data. If your agent needs to answer questions from
                      documents, LlamaIndex is the right choice. For other use
                      cases, it is probably overkill.
                    </p>
                  </div>
                ),
              },
              {
                title: 'CrewAI / AutoGen — Multi-Agent Systems',
                content: (
                  <div className="space-y-4">
                    <p>
                      CrewAI and AutoGen are frameworks for building multi-agent
                      systems. Instead of one agent doing everything, you define
                      a team of specialized agents that collaborate. For
                      example: a &quot;researcher&quot; agent that gathers
                      information, a &quot;writer&quot; agent that drafts
                      content, and a &quot;reviewer&quot; agent that checks for
                      errors. CrewAI uses a role-based design with sequential or
                      hierarchical task execution. AutoGen focuses on
                      conversational multi-agent systems with built-in code
                      execution and human-in-the-loop support.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs space-y-2">
                      <div className="text-gray-400 mb-2">Example: CrewAI multi-agent workflow</div>
                      <div className="text-gray-300">
                        <div><span className="text-blue-400">from</span> crewai <span className="text-blue-400">import</span> Agent, Task, Crew</div>
                        <div className="mt-2">researcher = Agent(role=<span className="text-green-400">&quot;Researcher&quot;</span>, goal=<span className="text-green-400">&quot;Find data&quot;</span>)</div>
                        <div>writer = Agent(role=<span className="text-green-400">&quot;Writer&quot;</span>, goal=<span className="text-green-400">&quot;Write report&quot;</span>)</div>
                        <div className="mt-2">task1 = Task(description=<span className="text-green-400">&quot;Research topic X&quot;</span>, agent=researcher)</div>
                        <div>task2 = Task(description=<span className="text-green-400">&quot;Write summary&quot;</span>, agent=writer)</div>
                        <div className="mt-2">crew = Crew(agents=[researcher, writer], tasks=[task1, task2])</div>
                        <div>result = crew.kickoff()</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg p-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">Best for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• Tasks that decompose into specialized roles</li>
                          <li>• Content generation with research, writing, editing</li>
                          <li>• Simulating human team workflows with AI</li>
                          <li>• Projects where agent coordination is the focus</li>
                        </ul>
                      </div>
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg p-4">
                        <div className="text-red-400 text-sm font-semibold mb-2">Watch out for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• Smaller ecosystem than LangChain/LlamaIndex</li>
                          <li>• Limited to specific multi-agent patterns</li>
                          <li>• Debugging multi-agent conversations is hard</li>
                          <li>• Some features are experimental</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Multi-agent frameworks are great when your task naturally
                      decomposes into specialized roles. But coordination is
                      hard: agents can conflict, duplicate work, or get stuck
                      waiting for each other. For simple tasks, a single agent
                      with good planning is usually simpler and more reliable.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Claude Agent SDK / Vercel AI SDK — Lightweight & Production-Ready',
                content: (
                  <div className="space-y-4">
                    <p>
                      Not every agent needs a heavyweight framework. Sometimes
                      you want minimal abstraction, full control, and no
                      framework churn. That is where lightweight SDKs like the
                      Claude Agent SDK (via the Anthropic SDK) and Vercel AI SDK
                      come in. They provide the basics — tool calling, streaming,
                      structured outputs — without imposing a rigid framework.
                      You write the agent loop yourself, which means more code
                      but also more control.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs space-y-2">
                      <div className="text-gray-400 mb-2">Example: Claude-native agent with tool calling</div>
                      <div className="text-gray-300">
                        <div><span className="text-blue-400">import</span> Anthropic <span className="text-blue-400">from</span> <span className="text-green-400">&apos;@anthropic-ai/sdk&apos;</span>;</div>
                        <div className="mt-2"><span className="text-blue-400">const</span> client = <span className="text-blue-400">new</span> Anthropic();</div>
                        <div><span className="text-blue-400">const</span> messages = [&#123; role: <span className="text-green-400">&apos;user&apos;</span>, content: <span className="text-green-400">&apos;Task...&apos;</span> &#125;];</div>
                        <div className="mt-2"><span className="text-blue-400">const</span> response = <span className="text-blue-400">await</span> client.messages.create(&#123;</div>
                        <div className="pl-4">model: <span className="text-green-400">&apos;claude-3-5-sonnet-20241022&apos;</span>,</div>
                        <div className="pl-4">tools: [searchTool, calculatorTool],</div>
                        <div className="pl-4">messages</div>
                        <div>&#125;);</div>
                        <div className="mt-2 text-gray-400">{/* Handle tool calls, loop until done */}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg p-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">Best for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• Production apps where you want full control</li>
                          <li>• When you are committed to Claude (or one LLM)</li>
                          <li>• Simple agents without complex orchestration</li>
                          <li>• Teams that prefer minimal dependencies</li>
                        </ul>
                      </div>
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg p-4">
                        <div className="text-red-400 text-sm font-semibold mb-2">Watch out for:</div>
                        <ul className="text-xs text-gray-300 space-y-1.5">
                          <li>• You write the agent loop yourself (no pre-built chains)</li>
                          <li>• Fewer batteries included vs LangChain</li>
                          <li>• LLM-specific — not provider-agnostic</li>
                          <li>• Smaller community and ecosystem</li>
                        </ul>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Lightweight SDKs are the best choice for production
                      applications where you want predictability and control.
                      You trade convenience for stability: no framework
                      breaking changes, no unexpected behavior from
                      over-abstraction, and full visibility into what your agent
                      is doing. If your agent is simple (1-3 tools, single
                      loop), writing the loop yourself is often faster and more
                      maintainable than learning a framework.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="When NOT to use a framework, the framework churn problem, and building your own">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>When NOT to use a framework</strong>: If your agent is
                simple (1-3 tools, no multi-agent, no complex state), you are
                often better off writing the loop yourself using the raw LLM
                API. Frameworks add overhead — learning the API, debugging
                abstraction layers, dealing with version churn. For a 50-line
                script that calls a weather API and sends an email, LangChain is
                overkill. Just use the Anthropic SDK or OpenAI SDK directly and
                write the loop in 20 lines.
              </p>
              <p className="text-gray-700">
                <strong>The framework churn problem</strong>: Agent frameworks
                are evolving fast, which means breaking changes, deprecated
                APIs, and shifting best practices. LangChain has gone through
                multiple major version changes that broke existing code.
                CrewAI and AutoGen are still maturing. If you are building a
                production application that needs to run for years, think
                carefully about framework dependencies. Lightweight SDKs (like
                Claude Agent SDK) and direct API usage are more stable because
                they have fewer abstraction layers to change.
              </p>
              <p className="text-gray-700">
                <strong>Building your own minimal agent loop</strong>: Many
                teams eventually build a thin wrapper around the LLM API that
                handles the specific patterns they need. This is not as hard as
                it sounds. You need: (1) a loop that calls the LLM, checks for
                tool calls, executes tools, and feeds results back, (2) a tool
                registry (a dictionary mapping tool names to functions), (3)
                optional memory (conversation history + some persistence), and
                (4) error handling. That is 100-200 lines of code, and it gives
                you full control without framework dependencies. If you find
                yourself fighting against LangChain or spending more time
                debugging the framework than your application logic, it might be
                time to build your own.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Framework comparison tool">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            This interactive tool lets you compare the five major agent
            frameworks side by side. Click a framework card to see code
            examples, pros/cons, and best-for scenarios. Use the Decision Helper
            to answer three questions and get a recommendation. The comparison
            table at the bottom shows which features each framework supports.
          </p>

          <AgentFrameworksSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Frameworks exist to handle boilerplate (loops, tools, memory, parsing) so you can focus on your use case. But different frameworks make different tradeoffs: LangChain gives you maximum flexibility, LlamaIndex is optimized for RAG, CrewAI/AutoGen focus on multi-agent, and Claude Agent SDK keeps things minimal.',
            'LangChain is the Swiss Army knife — huge ecosystem, pre-built chains, support for every LLM provider. Best for general-purpose agent development and prototyping. Cons: high complexity, frequent breaking changes, overkill for simple tasks.',
            'LlamaIndex is data-first. Built around indexing, retrieval, and RAG with 100+ data connectors and advanced chunking strategies. Best for document Q&A and knowledge-heavy applications. Cons: less focused on multi-agent, steeper learning curve for non-RAG use cases.',
            'CrewAI and AutoGen are multi-agent frameworks. Define teams of specialized agents (researcher, writer, reviewer) that collaborate. Best for tasks that decompose into roles and need agent coordination. Cons: coordination is hard, smaller ecosystem, debugging is difficult.',
            'Claude Agent SDK (and lightweight SDKs like Vercel AI SDK) give you minimal abstraction and full control. You write the agent loop yourself. Best for production apps with simple agents where you want stability and no framework churn. Cons: fewer batteries included, more code to write.',
          ]}
          misconceptions={[
            '"The best framework is the one everyone uses." -- Not necessarily. LangChain is the most popular, but that does not mean it is the best for your use case. If you are building document Q&A, LlamaIndex is better. If you want minimal dependencies, Claude Agent SDK is better. Popularity is a signal, not a verdict. Pick the framework that solves your specific problem, not the one with the most GitHub stars.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="When is LlamaIndex a better choice than LangChain?"
          options={[
            {
              text: 'When you need to swap between multiple LLM providers (OpenAI, Anthropic, etc.)',
              isCorrect: false,
            },
            {
              text: 'When your primary use case is document Q&A, knowledge base search, or data-heavy RAG applications with complex ingestion and retrieval requirements',
              isCorrect: true,
            },
            {
              text: 'When you need to build multi-agent systems with role-based collaboration',
              isCorrect: false,
            },
            {
              text: 'When you want the smallest possible framework with minimal dependencies',
              isCorrect: false,
            },
          ]}
          explanation="LlamaIndex is a better choice than LangChain when your primary use case is document Q&A, knowledge base search, or any data-heavy RAG application. LlamaIndex is specifically designed for retrieval-augmented generation: it provides 100+ data connectors (PDFs, databases, APIs, Slack, Notion, Google Drive), advanced indexing strategies (vector, tree, keyword indexes), sophisticated chunking algorithms, and query optimization. While LangChain also supports RAG, LlamaIndex is purpose-built for it and handles the hard parts (chunking strategies, embedding optimization, hybrid search) better than general-purpose frameworks. For other use cases — like swapping LLM providers (LangChain is better), multi-agent systems (CrewAI/AutoGen are better), or minimal dependencies (Claude Agent SDK is better) — LlamaIndex is not the right choice. Pick LlamaIndex when data ingestion and retrieval are the core of your application."
        />
      </LessonSection>
    </div>
  );
}
