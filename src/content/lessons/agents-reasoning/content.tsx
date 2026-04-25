'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import AgentsSim from '@/components/simulations/AgentsSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function AgentsReasoningContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            ChatGPT can answer questions. But can it book you a flight? Check
            your calendar, find available dates, search for cheap flights, and
            email you the confirmation? That requires more than language
            understanding &mdash; it requires planning, reasoning, and the
            ability to use tools. That&apos;s what AI agents do.
          </p>

          <p className="text-gray-700 leading-relaxed">
            A regular chatbot is stateless. You ask, it answers, done. An agent
            is different. It observes the world, thinks about what to do next,
            takes an action, sees the result, thinks again, and keeps going
            until the task is done. It can call APIs, query databases, search
            the web, run code, write files &mdash; anything you can express as
            a function. The key innovation is the loop: LLMs stop after
            generating one response, but agents keep going.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This shift from passive question-answering to active
            goal-driven behavior is one of the most important developments in
            AI. An LLM with a ReAct loop and a few tools can do things that
            feel almost autonomous: debugging code by running tests and fixing
            errors iteratively, researching a topic by searching, reading, and
            synthesizing sources, or booking travel by checking constraints,
            comparing options, and making decisions. Agents are not magic
            &mdash; they are LLMs in a loop with tool access. But the
            combination unlocks capabilities that pure language modeling cannot
            provide.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="From chatbot to agent">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            A chatbot is a one-shot system. You send a prompt, the model
            generates a response, and the interaction ends. An agent is a loop.
            It observes the current state, decides what to do, takes an action,
            observes the result, and repeats until it reaches a goal or decides
            it cannot proceed. This simple shift &mdash; from one-shot
            generation to iterative action &mdash; is what transforms a
            language model into something that can autonomously accomplish
            tasks.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The agent loop has a few key components. First, you need a way for
            the model to take actions beyond generating text. This is where
            tool use (also called function calling) comes in. You define a set
            of functions the model can call: get_weather, search_web,
            run_python_code, send_email, whatever is relevant to your use case.
            The model learns to output structured calls to these functions
            instead of (or in addition to) natural language.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The Agent Loop"
              nodes={[
                { id: 'task', label: 'Task', sublabel: 'User gives a goal', type: 'input' },
                { id: 'think', label: 'Think', sublabel: 'Reason about what to do', type: 'process' },
                { id: 'act', label: 'Act', sublabel: 'Call a tool or function', type: 'attention' },
                { id: 'observe', label: 'Observe', sublabel: 'Get result from tool', type: 'process' },
                { id: 'done', label: 'Done?', sublabel: 'Goal achieved or stuck?', type: 'decision' },
                { id: 'final', label: 'Final Answer', sublabel: 'Return result to user', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The second component is reasoning. The model needs to think out
            loud about what it has learned, what it still needs to know, and
            what action to take next. This is where techniques like
            chain-of-thought and ReAct (Reasoning + Acting) come in. By
            prompting the model to alternate between thought and action, you
            get a transparent, debuggable loop where each step builds on the
            last.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The third component is planning. For complex tasks that require
            multiple steps, the agent needs to break the problem down into
            sub-goals, track progress, and adjust the plan when things go
            wrong. Advanced agents use tree-of-thought (exploring multiple
            reasoning paths in parallel) or hierarchical planning (breaking
            tasks into subtasks recursively). The goal is to avoid getting
            stuck in unproductive loops or giving up too early.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="How agents think and act">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The magic of agents is in the interplay between four core
            techniques: ReAct (reasoning and acting interleaved),
            chain-of-thought (step-by-step reasoning), tool use (calling
            external functions), and planning (multi-step goal decomposition).
            These are not separate systems &mdash; they work together to turn
            an LLM into something that can autonomously pursue goals.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'ReAct — Reasoning + Acting Interleaved',
                content: (
                  <div className="space-y-4">
                    <p>
                      ReAct is the core pattern that makes agents work. Instead
                      of prompting the model to just generate an answer, you
                      prompt it to alternate between{' '}
                      <strong className="text-white">Thought</strong> (internal
                      reasoning) and <strong className="text-white">Action</strong>{' '}
                      (calling a tool or function). After each action, the
                      environment provides an{' '}
                      <strong className="text-white">Observation</strong>{' '}
                      (the result of that action). The model then thinks again,
                      decides the next action, and the loop continues until it
                      outputs a final answer.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs space-y-2">
                      <div>
                        <span className="text-purple-400">Thought:</span>{' '}
                        <span className="text-gray-300">
                          I need to check the weather in Paris
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-400">Action:</span>{' '}
                        <span className="text-gray-300">
                          get_weather(city=&quot;Paris&quot;)
                        </span>
                      </div>
                      <div>
                        <span className="text-green-400">Observation:</span>{' '}
                        <span className="text-gray-300">
                          Temperature: 15°C, Rain: 80%
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-400">Thought:</span>{' '}
                        <span className="text-gray-300">
                          80% rain probability is high, umbrella needed
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-400">Final Answer:</span>{' '}
                        <span className="text-gray-300">
                          Yes, bring an umbrella. It&apos;s 15°C with 80% chance
                          of rain in Paris.
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The ReAct paper (Yao et al., 2022) showed that this
                      interleaved format dramatically improves task success
                      rates on question-answering and interactive environments
                      compared to either pure reasoning or pure action. By
                      making the agent&apos;s thoughts explicit, you also get
                      interpretability for free: you can see exactly why the
                      agent took each action. This is critical for debugging
                      and building trust.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Chain-of-Thought — Breaking Down Complex Problems',
                content: (
                  <div className="space-y-4">
                    <p>
                      Chain-of-thought (CoT) prompting is the technique of
                      asking the model to think step by step before giving a
                      final answer. Instead of prompting &ldquo;What is 23 - 7
                      + 15?&rdquo; and hoping for the right answer, you prompt
                      &ldquo;Let&apos;s think about this step by step.&rdquo;
                      The model then breaks the problem into intermediate steps,
                      making it much more likely to get the right answer,
                      especially for multi-hop reasoning.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg px-4 py-4">
                        <div className="text-red-400 text-sm font-semibold mb-2">
                          Without CoT
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p className="text-white font-medium">
                            Q: If I have 23 apples, give away 7, then buy 15
                            more, how many do I have?
                          </p>
                          <p className="text-red-300">
                            A: 31 apples. (Might be right, might be wrong — no
                            transparency into reasoning)
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-4 py-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">
                          With CoT
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p className="text-white font-medium">
                            Q: Let&apos;s think step by step. If I have 23
                            apples...
                          </p>
                          <p className="text-green-300">
                            A: Started with 23. Gave away 7, so 23 - 7 = 16.
                            Then bought 15 more, so 16 + 15 = 31. Final answer:
                            31 apples.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The CoT paper (Wei et al., 2022) showed that prompting
                      large models to reason step-by-step dramatically improves
                      performance on arithmetic, commonsense reasoning, and
                      symbolic manipulation tasks. The accuracy gains are often
                      20-50 percentage points on benchmarks like GSM8K (grade
                      school math). CoT is the foundation for ReAct: the
                      &ldquo;Thought&rdquo; step is basically CoT applied in an
                      interactive loop.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Tool Use & Function Calling',
                content: (
                  <div className="space-y-4">
                    <p>
                      Tool use (also called function calling) is the mechanism
                      that lets an LLM go beyond text generation. You define a
                      set of functions the model can call &mdash; for example,
                      <code className="text-blue-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs mx-1">
                        search_web(query)
                      </code>
                      ,
                      <code className="text-blue-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs mx-1">
                        run_python(code)
                      </code>
                      , or
                      <code className="text-blue-400 bg-gray-800 px-1.5 py-0.5 rounded text-xs mx-1">
                        send_email(to, subject, body)
                      </code>
                      &mdash; and the model learns to output structured calls
                      to these functions instead of plain text. The runtime
                      executes the function, captures the result, and feeds it
                      back to the model as an observation.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">
                        Example tool definition (OpenAI function calling format):
                      </div>
                      <div className="font-mono text-xs text-gray-300 space-y-1">
                        <div>
                          <span className="text-cyan-400">&quot;name&quot;</span>:{' '}
                          <span className="text-green-400">&quot;get_weather&quot;</span>
                        </div>
                        <div>
                          <span className="text-cyan-400">&quot;description&quot;</span>:{' '}
                          <span className="text-green-400">
                            &quot;Get current weather for a city&quot;
                          </span>
                        </div>
                        <div>
                          <span className="text-cyan-400">&quot;parameters&quot;</span>: &#123;
                        </div>
                        <div className="pl-4">
                          <span className="text-cyan-400">&quot;type&quot;</span>:{' '}
                          <span className="text-green-400">&quot;object&quot;</span>,
                        </div>
                        <div className="pl-4">
                          <span className="text-cyan-400">&quot;properties&quot;</span>: &#123;
                        </div>
                        <div className="pl-8">
                          <span className="text-cyan-400">&quot;city&quot;</span>: &#123;{' '}
                          <span className="text-cyan-400">&quot;type&quot;</span>:{' '}
                          <span className="text-green-400">&quot;string&quot;</span> &#125;
                        </div>
                        <div className="pl-4">&#125;</div>
                        <div>&#125;</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      All major LLM APIs now support function calling:
                      OpenAI&apos;s function calling API, Anthropic&apos;s tool
                      use, Google&apos;s Gemini function declarations, and
                      open-source models like Llama and Mistral trained with
                      function-calling data. The model outputs a structured JSON
                      object specifying which function to call and what
                      arguments to pass. This is the key that turns a language
                      model into an agent: the ability to interact with the
                      world, not just talk about it.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Planning — Multi-Step Goal Decomposition',
                content: (
                  <div className="space-y-4">
                    <p>
                      Simple tasks can be solved with a single ReAct loop: think
                      → act → observe → think → final answer. But complex tasks
                      require planning: breaking the problem into sub-goals,
                      deciding the order of operations, and handling failures
                      gracefully. This is where techniques like hierarchical
                      planning and tree-of-thought come in.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-4 py-4">
                        <div className="text-blue-400 text-sm font-semibold mb-2">
                          Hierarchical Planning
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Break a complex task into subtasks, solve each
                            subtask, then combine the results. For example,
                            &ldquo;Plan a trip to Tokyo&rdquo; becomes: (1)
                            check dates, (2) book flights, (3) reserve hotel,
                            (4) plan itinerary. Each subtask can itself be
                            broken down further.
                          </p>
                          <p className="text-blue-300 font-medium">
                            Used by: AutoGPT, BabyAGI, LangChain agents
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-4 py-4">
                        <div className="text-purple-400 text-sm font-semibold mb-2">
                          Tree-of-Thought
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Instead of following a single reasoning path,
                            explore multiple paths in parallel (like a search
                            tree), evaluate each path, and pick the best one.
                            Good for problems with many possible solutions
                            (e.g., code generation, game playing, creative
                            writing).
                          </p>
                          <p className="text-purple-300 font-medium">
                            Used by: o1/o3-style reasoning models
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Planning is the hardest part of building agents. LLMs are
                      good at generating the next step, but they struggle with
                      long-horizon planning (tasks that take 10+ steps) because
                      they do not have an explicit world model. Current
                      research focuses on hybrid approaches: using the LLM for
                      high-level planning and symbolic methods (search,
                      constraint solving) for low-level execution. The goal is
                      to get the best of both worlds: the flexibility of
                      language understanding and the reliability of classical
                      planning algorithms.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Multi-agent collaboration, memory, and error recovery">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Multi-agent systems</strong>: Instead of one agent
                doing everything, you can spawn multiple specialized agents
                that collaborate. For example, a &ldquo;researcher&rdquo; agent
                that gathers information, a &ldquo;coder&rdquo; agent that
                writes code, and a &ldquo;reviewer&rdquo; agent that checks for
                bugs. Each agent has its own loop, and they communicate by
                passing messages or updating a shared workspace. Frameworks
                like CrewAI and AutoGen make this easier. The challenge is
                coordination: how do agents negotiate who does what, resolve
                conflicts, and avoid stepping on each other&apos;s work?
              </p>
              <p className="text-gray-700">
                <strong>Agent memory</strong>: A ReAct loop only has
                short-term memory (the conversation context). For long-running
                agents, you need long-term memory: a vector database of past
                experiences, a knowledge graph of facts learned, or a simple
                text file that persists across sessions. The agent can then
                retrieve relevant memories when making decisions. Memory is
                critical for personalization (remembering user preferences) and
                learning from mistakes (not repeating failed actions).
              </p>
              <p className="text-gray-700">
                <strong>Error recovery and self-correction</strong>: Agents
                make mistakes. They call the wrong function, pass invalid
                arguments, or get stuck in loops. Good agent systems include
                self-correction mechanisms: if a tool call fails, the agent
                reads the error message, reasons about what went wrong, and
                tries a different approach. Some systems use a separate
                &ldquo;verifier&rdquo; model that checks the agent&apos;s work
                and flags issues before execution. The ReAct format naturally
                supports this: the observation step can include error messages,
                and the agent can adjust its plan accordingly.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Watch a ReAct agent in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            This interactive visualizer shows a ReAct agent loop solving
            different tasks. Pick a scenario, then step through the loop one
            action at a time (or click Auto to watch it play out). Notice how
            the agent alternates between Thought (reasoning), Action (calling a
            tool), and Observation (getting results) until it reaches a Final
            Answer. This is the core pattern behind every agent system.
          </p>

          <AgentsSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'An agent is an LLM in a loop: observe → think → act → observe → repeat. This simple pattern transforms a passive chatbot into an active system that can pursue goals autonomously.',
            'ReAct (Reasoning + Acting) is the core technique. The model alternates between Thought (internal reasoning), Action (calling a tool), and Observation (seeing the result). This interleaving dramatically improves task success and provides transparency into the agent\'s decision-making.',
            'Chain-of-thought prompting ("Let\'s think step by step") is critical for multi-step reasoning. By breaking problems into intermediate steps, agents can solve tasks that would fail with one-shot prompting.',
            'Tool use (function calling) is what turns a language model into an agent. By defining functions the model can call — search, calculator, code execution, APIs — you give the agent the ability to interact with the world beyond text generation.',
            'Planning is the hardest part. Simple ReAct loops work for 2-5 step tasks, but complex goals require hierarchical planning (breaking tasks into subtasks) or tree-of-thought (exploring multiple reasoning paths). Current research focuses on hybrid approaches combining LLMs with classical planning algorithms.',
          ]}
          misconceptions={[
            '"Agents are magic and can do anything." -- They are not. Agents are LLMs in a loop with tool access. They inherit all the limitations of LLMs (hallucination, lack of true reasoning, no world model) plus new failure modes (infinite loops, tool misuse, poor planning). Agents work well for tasks with clear sub-goals and reliable tools, but they struggle with long-horizon planning, ambiguous objectives, and environments where tools frequently fail.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What makes a ReAct agent different from a regular chatbot?"
          options={[
            {
              text: 'It uses a larger language model with more parameters',
              isCorrect: false,
            },
            {
              text: 'It interleaves reasoning (Thought) and action (tool calling) in a loop, using observations from tools to decide the next step',
              isCorrect: true,
            },
            {
              text: 'It generates responses faster by caching previous results',
              isCorrect: false,
            },
            {
              text: 'It can only answer questions about specific domains',
              isCorrect: false,
            },
          ]}
          explanation="A ReAct agent differs from a regular chatbot by implementing an iterative loop where it alternates between Thought (reasoning about what to do), Action (calling external tools or functions), and Observation (receiving results from those actions). A regular chatbot generates one response and stops. A ReAct agent keeps going: it thinks, acts, observes the result, thinks again based on what it learned, acts again, and repeats until it achieves the goal or determines it cannot proceed. This loop, combined with tool use (the ability to call external functions like APIs, search engines, or code executors), is what transforms a language model from a passive question-answering system into an active agent that can pursue goals autonomously. The key insight is that reasoning and acting are interleaved, not separate: each action informs the next thought, and each thought guides the next action."
        />
      </LessonSection>
    </div>
  );
}
