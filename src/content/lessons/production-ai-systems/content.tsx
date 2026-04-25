'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import ProductionAISim from '@/components/simulations/ProductionAISim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function ProductionAISystemsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            You&apos;ve made it. Thirty lessons, from &ldquo;what is AI?&rdquo;
            to state space models. Now let&apos;s put it all together. Building a
            production AI system isn&apos;t just picking a model and calling an
            API &mdash; it&apos;s designing a system that&apos;s reliable,
            cost-effective, safe, and maintainable. This lesson walks through a
            real-world case study: building an AI-powered customer support agent
            from scratch to production.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We&apos;ve covered the pieces: transformers, fine-tuning, RAG, safety,
            deployment, monitoring. But pieces alone don&apos;t make a product.
            Production systems have constraints that research code doesn&apos;t:
            uptime requirements, cost budgets, user trust, regulatory compliance,
            iterative improvement. You can&apos;t ship a research demo and call it
            done. You need to think about what happens when the model fails, when
            traffic spikes 10x, when users try to jailbreak it, when you need to
            roll back a bad prompt change.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This capstone lesson ties together everything from the entire course.
            We&apos;ll build a complete AI application &mdash; from data layer to
            deployment &mdash; with guardrails, monitoring, and cost optimization.
            This is what AI engineering looks like in the real world.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept — The production AI stack */}
      <LessonSection id="concept" title="The production AI stack">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            A production system needs way more than just a model. Research code
            might be 100 lines calling an API. Production code is thousands of
            lines managing everything around the model: data, retrieval, safety,
            serving, monitoring, cost control. Each layer solves a specific
            problem that will break your system if you ignore it.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Production AI pipeline (end-to-end)"
              nodes={[
                {
                  id: 'user',
                  label: 'User Request',
                  sublabel: 'Question or command',
                  type: 'input',
                },
                {
                  id: 'api-gateway',
                  label: 'API Gateway',
                  sublabel: 'Auth, rate limiting',
                  type: 'process',
                },
                {
                  id: 'safety-input',
                  label: 'Input Safety',
                  sublabel: 'Prompt injection detection',
                  type: 'attention',
                },
                {
                  id: 'rag',
                  label: 'Retrieval (RAG)',
                  sublabel: 'Vector search + context',
                  type: 'process',
                },
                {
                  id: 'llm',
                  label: 'LLM',
                  sublabel: 'GPT-4 / Claude / Llama',
                  type: 'attention',
                },
                {
                  id: 'safety-output',
                  label: 'Output Guardrails',
                  sublabel: 'PII filter, harmful content',
                  type: 'attention',
                },
                {
                  id: 'response',
                  label: 'Response',
                  sublabel: 'Streamed to user',
                  type: 'output',
                },
                {
                  id: 'monitoring',
                  label: 'Monitoring',
                  sublabel: 'Logs, metrics, alerts',
                  type: 'process',
                },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            Each stage has a purpose. The API gateway handles authentication and
            prevents abuse (rate limiting). Input safety blocks prompt injection
            and adversarial attacks. RAG retrieves relevant context from your
            knowledge base. The LLM generates the answer. Output guardrails catch
            hallucinated PII or harmful content before it reaches the user. And
            monitoring tracks everything so you can debug failures, optimize
            costs, and measure quality over time.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This is the minimum viable production stack. Real systems often add
            more: caching layers to reduce costs, model routing to send easy
            queries to cheap models and hard queries to expensive ones, A/B
            testing frameworks to evaluate prompt changes, fallback systems when
            the primary model is down. But every production AI system has these
            core components.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Building it end to end">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s walk through building a customer support AI agent. We need
            to answer user questions about a product, drawing from documentation,
            previous tickets, and FAQs. We want it to be fast, accurate, safe, and
            cost-effective. Here&apos;s how to build each layer.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Data Layer — Knowledge Base, Vectors, Cache',
                content: (
                  <div className="space-y-4">
                    <p>
                      First, we need data infrastructure. Your AI agent needs to
                      access your knowledge base. This means:{' '}
                      <strong className="text-white">
                        chunking documents, embedding them, and indexing them in a
                        vector database
                      </strong>
                      . Then you need a cache for conversation history (Redis) so
                      the agent can maintain context across turns.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs">
                      <div className="text-gray-500 mb-2">
                        {'//'} Step 1: Chunk and embed your docs
                      </div>
                      <div className="text-blue-400">
                        docs = load_documents(&quot;/knowledge_base&quot;)
                      </div>
                      <div className="text-blue-400">
                        chunks = chunk_text(docs, chunk_size=512, overlap=50)
                      </div>
                      <div className="text-green-400">
                        embeddings = embed_model.encode(chunks)
                      </div>
                      <div className="text-gray-500 mt-2 mb-1">
                        {'//'} Step 2: Index in vector DB (Pinecone, Weaviate, etc)
                      </div>
                      <div className="text-purple-400">
                        index.upsert(vectors=embeddings, metadata=chunks)
                      </div>
                      <div className="text-gray-500 mt-2 mb-1">
                        {'//'} Step 3: Cache conversation history
                      </div>
                      <div className="text-amber-400">
                        redis.set(f&quot;chat:{'{'}{'{'}user_id{'}'}{'}'}&quot;,
                        conversation_history)
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This is where RAG lives. When a user asks a question, you
                      embed the query, search the vector DB for similar chunks, and
                      pass those chunks as context to the LLM. Without this layer,
                      the model only knows what it saw during training &mdash; it
                      can&apos;t answer questions about your specific product or
                      recent updates. Chunk size matters: too small and you lose
                      context, too large and you waste tokens. 256-512 tokens per
                      chunk is the sweet spot for most use cases.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Model Selection — API vs Self-Hosted, Quality vs Cost',
                content: (
                  <div className="space-y-4">
                    <p>
                      Now you need to pick a model. The choice comes down to three
                      constraints:{' '}
                      <strong className="text-white">
                        quality, latency, and cost
                      </strong>
                      . GPT-4 gives the best quality but costs $30-50 per million
                      tokens and has ~1-2 second latency. Self-hosted Llama 3 70B
                      gives good quality, sub-second latency, and fixed GPU costs,
                      but you need to manage the infrastructure. Claude excels at
                      safety and handles tricky queries well, with pricing between
                      GPT-4 and cheaper options.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3">
                        <span className="text-blue-400 text-sm font-medium">
                          GPT-4 API
                        </span>
                        <div className="text-white text-xs mt-2">
                          Best quality, highest cost
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          $0.03/1K input tokens
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3">
                        <span className="text-purple-400 text-sm font-medium">
                          Llama 3 70B (self-hosted)
                        </span>
                        <div className="text-white text-xs mt-2">
                          Good quality, fixed GPU cost
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          ~$600/mo for A100
                        </div>
                      </div>
                      <div className="border-2 border-cyan-500/50 bg-cyan-500/5 rounded-lg px-3 py-3">
                        <span className="text-cyan-400 text-sm font-medium">
                          Claude API
                        </span>
                        <div className="text-white text-xs mt-2">
                          Strong safety, excellent reasoning
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          $0.015/1K input tokens
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Consider your requirements. If you have strict latency needs
                      (under 500ms), self-hosted is the way. If you have privacy
                      constraints (HIPAA, financial data), you might need to
                      self-host or use a model with private deployment options. If
                      cost is tight and you have high volume, consider model
                      routing: send simple queries to Llama 3 8B, hard queries to
                      GPT-4. The hybrid approach can save 50-70% on costs while
                      maintaining quality.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Safety & Guardrails — Input Validation, Output Filtering',
                content: (
                  <div className="space-y-4">
                    <p>
                      Safety is not optional. Users will try to jailbreak your
                      system, extract training data, or get it to say something
                      harmful. You need{' '}
                      <strong className="text-white">
                        input validation (prompt injection detection)
                      </strong>{' '}
                      and{' '}
                      <strong className="text-white">
                        output filtering (PII, harmful content)
                      </strong>
                      . This is where lesson 28 (AI Safety) pays off.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">
                        Safety checks at each stage:
                      </div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-purple-400">
                            Input: Prompt injection?
                          </span>
                          <span className="text-purple-300">
                            Regex + LLM classifier
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-400">
                            Input: Harmful intent?
                          </span>
                          <span className="text-blue-300">
                            Content moderation API
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-400">Output: PII leak?</span>
                          <span className="text-amber-300">
                            Regex for SSN, CC, emails
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-400">
                            Output: Harmful content?
                          </span>
                          <span className="text-red-300">Post-filter check</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 flex justify-between">
                          <span className="text-green-400">
                            Fallback: Model fails?
                          </span>
                          <span className="text-green-300">
                            Return canned response
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Implement fallback responses. When the model refuses to
                      answer, when safety checks fail, or when the retrieval
                      returns no results, you need a graceful degradation strategy.
                      &ldquo;I&apos;m not sure how to help with that. Let me
                      connect you to a human agent.&rdquo; Better to admit
                      uncertainty than to hallucinate or bypass safety. Track
                      refusal rates in your monitoring &mdash; if 20% of queries
                      are being blocked, you might have an overly aggressive safety
                      filter.
                    </p>
                  </div>
                ),
              },
              {
                title: 'API & Serving — Streaming, Rate Limiting, Error Handling',
                content: (
                  <div className="space-y-4">
                    <p>
                      Your API layer handles user requests. For LLM applications,{' '}
                      <strong className="text-white">streaming is essential</strong>{' '}
                      &mdash; it reduces perceived latency from 2 seconds to
                      200ms. Users see the first tokens immediately instead of
                      waiting for the full response. Add rate limiting to prevent
                      abuse (100 requests/hour per user, 10,000/day for the
                      whole service). Implement retries with exponential backoff
                      for API failures.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-4 py-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">
                          Streaming Responses
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Send tokens as they are generated. Users see progress
                            immediately, making 2-second responses feel instant.
                            Critical for chat interfaces.
                          </p>
                          <p className="text-green-300 font-medium">
                            Perceived latency: 200ms vs 2000ms
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-4 py-4">
                        <div className="text-amber-400 text-sm font-semibold mb-2">
                          Rate Limiting
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Prevent abuse and manage costs. Use token bucket or
                            sliding window. Set per-user limits (100/hr) and
                            global limits (10K/day).
                          </p>
                          <p className="text-amber-300 font-medium">
                            Protects against runaway costs
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Error handling is where most production systems fail.
                      API timeouts, model errors, vector DB downtime &mdash; all
                      of these will happen. Your code needs to handle them
                      gracefully. Return HTTP 503 with a Retry-After header, not
                      500. Log the error with full context (user ID, request ID,
                      timestamp, stack trace). Set up alerting for error rate
                      spikes. Use circuit breakers to fail fast when a dependency
                      is down instead of queuing up requests that will timeout.
                    </p>
                  </div>
                ),
              },
              {
                title:
                  'Monitoring & Iteration — Logs, Metrics, Alerts, A/B Testing',
                content: (
                  <div className="space-y-4">
                    <p>
                      The system is live. Now you need to{' '}
                      <strong className="text-white">
                        log everything, track quality over time, and iterate
                      </strong>
                      . Log every request: user query, retrieved context, model
                      response, latency, token count, user feedback (thumbs
                      up/down). This is your ground truth dataset for debugging,
                      evaluation, and fine-tuning.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs">
                      <div className="text-gray-500 mb-2">
                        {'//'} What to track in production:
                      </div>
                      <div className="text-blue-400">
                        metrics.track(&quot;llm.latency_ms&quot;, latency)
                      </div>
                      <div className="text-green-400">
                        metrics.track(&quot;llm.tokens_used&quot;, total_tokens)
                      </div>
                      <div className="text-amber-400">
                        metrics.track(&quot;llm.cost_usd&quot;, cost)
                      </div>
                      <div className="text-purple-400">
                        metrics.track(&quot;user.feedback&quot;, thumbs_up)
                      </div>
                      <div className="text-red-400">
                        metrics.track(&quot;error.rate&quot;, errors / total)
                      </div>
                      <div className="text-gray-500 mt-2 mb-1">
                        {'//'} Set up alerts:
                      </div>
                      <div className="text-cyan-400">
                        alert(&quot;latency &gt; 3000ms for 5 minutes&quot;)
                      </div>
                      <div className="text-cyan-400">
                        alert(&quot;error rate &gt; 5% for 10 minutes&quot;)
                      </div>
                      <div className="text-cyan-400">
                        alert(&quot;cost &gt; $1000/day&quot;)
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Iteration is key. A/B test prompt changes: does adding
                      &ldquo;Be concise&rdquo; improve user satisfaction? Does
                      changing the retrieval strategy reduce hallucinations? Use
                      shadow testing for risky changes: run the new version
                      alongside the old, compare outputs, but only serve the old
                      version to users. Once you are confident, canary deploy: 5%
                      of traffic to the new version, then 25%, then 100%. Track
                      metrics at each stage. If quality drops, roll back
                      immediately. Production AI is a continuous feedback loop,
                      not a one-time deployment.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Cost optimization, multi-model routing, and evaluation in production">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Cost optimization strategies</strong>: The easiest wins
                are caching (store responses for common queries, saves 30-50% on
                repeat questions), prompt compression (remove unnecessary words,
                every token costs money), and batching (process multiple queries
                in parallel if your model supports it). More advanced: implement
                semantic caching where similar queries return the same cached
                response, use smaller models for classification tasks before
                routing to the large model, and set token limits (max 500 output
                tokens) to prevent runaway generation.
              </p>
              <p className="text-gray-700">
                <strong>Multi-model architectures</strong>: Route easy queries
                to small, fast, cheap models (Llama 3 8B, GPT-3.5) and hard
                queries to large, expensive models (GPT-4, Claude Opus). The
                trick is the routing logic. Train a small classifier on historical
                data: label queries as &ldquo;easy&rdquo; (simple FAQ, factual
                lookup) or &ldquo;hard&rdquo; (complex reasoning, multi-step).
                Or use heuristics: query length, presence of ambiguity keywords,
                number of retrieved documents. A good router can cut costs by
                60% with minimal quality loss.
              </p>
              <p className="text-gray-700">
                <strong>Evaluation in production</strong>: Offline benchmarks
                don&apos;t capture real user behavior. You need online evaluation:
                track implicit signals (user engagement, task completion, time to
                resolution) and explicit signals (thumbs up/down, star ratings).
                Build a human-in-the-loop review queue where a small percentage
                of responses (5-10%) are manually graded. This gives you a
                ground truth dataset to measure model quality over time. When you
                ship a new model or prompt, compare its performance on this
                dataset before and after. If the win rate drops below your
                threshold (e.g., 80% positive), roll back.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Build your production system">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Use this interactive builder to design a production AI pipeline.
            Select components for each layer: data, model, retrieval, safety, API,
            and monitoring. The system will show you the total cost, latency,
            reliability, and complexity. Click &ldquo;Best Practice&rdquo; to see
            a recommended production configuration.
          </p>

          <ProductionAISim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Production AI is a full stack: data layer (RAG, vector DB, cache), model (API or self-hosted), safety (input validation, output filtering), API (streaming, rate limiting), and monitoring (logs, metrics, alerts). Each layer solves a specific problem.',
            'Model selection is a tradeoff between quality, latency, and cost. GPT-4 for best quality, self-hosted Llama for low latency, multi-model routing for cost savings. The right choice depends on your constraints.',
            'Safety is not optional. Implement input validation (prompt injection detection), output filtering (PII, harmful content), and fallback responses when the model fails. Track refusal rates to tune your filters.',
            'Streaming responses make AI feel 10x faster. Users see tokens immediately instead of waiting for the full response. Add rate limiting to prevent abuse and error handling with retries for API failures.',
            'Log everything in production: query, context, response, latency, tokens, cost, user feedback. This is your ground truth for debugging, evaluation, and iteration. A/B test prompt changes, canary deploy new models, and roll back if quality drops.',
          ]}
          misconceptions={[
            '"Production AI is just calling an API." -- It&apos;s not. The model is 10% of the system. The other 90% is data infrastructure, safety, serving, monitoring, and iteration. Research code that works in a notebook will break in production without these layers.',
            '"Once deployed, the system is done." -- Production AI is never done. It&apos;s a continuous process of monitoring, evaluating, and improving. User behavior changes, the model drifts, new edge cases emerge. You need feedback loops to keep quality high over time.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why is caching important in production AI systems, even though it adds complexity?"
          options={[
            {
              text: 'It makes the model generate better responses by storing previous outputs',
              isCorrect: false,
            },
            {
              text: 'It reduces both cost and latency for repeated or similar queries by avoiding redundant model calls',
              isCorrect: true,
            },
            {
              text: 'It helps the model remember conversation history across sessions',
              isCorrect: false,
            },
            {
              text: 'It prevents users from asking the same question twice',
              isCorrect: false,
            },
          ]}
          explanation="Caching is critical for production AI because it saves both money and time. Every LLM call costs money (tokens) and takes time (latency). If 30-50% of your queries are repeats or near-duplicates, caching those responses means you skip the model entirely for those requests. The cached response is returned in milliseconds instead of seconds, and you pay zero API costs. Semantic caching takes this further by matching similar queries to the same cached response. While caching adds infrastructure complexity (Redis or similar), the cost and latency savings make it worthwhile for any production system with meaningful traffic. Note that caching is different from conversation memory (which stores context for multi-turn chats) — caching is about avoiding redundant computation for the same inputs."
        />
      </LessonSection>
    </div>
  );
}
