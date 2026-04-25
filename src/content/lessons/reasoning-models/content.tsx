'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import ReasoningSim from '@/components/simulations/ReasoningSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function ReasoningModelsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            What if, instead of answering instantly, an AI could stop and think? Really think —
            work through a problem, check its reasoning, backtrack when it&apos;s wrong, try a
            different approach? That&apos;s exactly what reasoning models do. And the results
            are stunning: problems that standard LLMs get wrong 90% of the time, reasoning
            models solve correctly.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Traditional language models generate answers in one forward pass. They&apos;re fast,
            but they can&apos;t stop to reconsider. They commit to each token as it&apos;s
            generated. If they start down the wrong reasoning path, they just keep going.
            Reasoning models break this limitation. They use what&apos;s called{' '}
            <strong>test-time compute scaling</strong> — spending more computation during
            inference, not during training. Instead of thinking bigger models, think longer
            thinking.
          </p>

          <p className="text-gray-700 leading-relaxed">
            OpenAI&apos;s o1 and o3 models pioneered this approach. They can spend minutes on a
            single problem, exploring different solution paths, verifying their work, catching
            mistakes that would slip past standard models. Claude has extended thinking mode,
            which lets you trade response time for deeper reasoning on complex problems. This
            isn&apos;t just prompt engineering or chain-of-thought — it&apos;s a fundamental
            shift in how models solve hard problems. And it&apos;s the next frontier in AI
            capabilities.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Trading speed for accuracy">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Standard LLMs are optimized for speed. They generate each token based on the
            previous tokens, making one forward pass through the network per token. This is
            efficient, but it means the model commits to each decision immediately. There&apos;s
            no opportunity to backtrack, reconsider, or explore alternative approaches.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Reasoning models flip this trade-off. Instead of answering instantly, they spend
            time thinking. They might generate multiple candidate solutions, evaluate each one,
            and pick the best. They might check their work and catch errors before committing
            to an answer. They might explore a reasoning tree — trying different approaches in
            parallel and pruning the paths that don&apos;t pan out. The key insight: you can
            improve performance by letting the model think longer, not just making it bigger.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Standard LLM vs Reasoning Model"
              nodes={[
                {
                  id: 'standard-in',
                  label: 'Problem',
                  sublabel: 'User query',
                  type: 'input',
                },
                {
                  id: 'standard-gen',
                  label: 'Generate',
                  sublabel: 'One forward pass',
                  type: 'process',
                },
                {
                  id: 'standard-out',
                  label: 'Answer',
                  sublabel: 'Fast, sometimes wrong',
                  type: 'output',
                },
                {
                  id: 'reasoning-in',
                  label: 'Problem',
                  sublabel: 'User query',
                  type: 'input',
                },
                {
                  id: 'reasoning-think',
                  label: 'Think...',
                  sublabel: 'Explore solutions',
                  type: 'process',
                },
                {
                  id: 'reasoning-verify',
                  label: 'Check...',
                  sublabel: 'Self-verify',
                  type: 'attention',
                },
                {
                  id: 'reasoning-out',
                  label: 'Verified Answer',
                  sublabel: 'Slower, more accurate',
                  type: 'output',
                },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            This matters most for hard problems. On simple queries — &ldquo;What&apos;s the
            capital of France?&rdquo; — standard models are fine. But on complex reasoning
            tasks — math competitions, code debugging, multi-step planning — the ability to
            think deeply makes a huge difference. O1 scores in the 89th percentile on
            competitive programming (Codeforces), compared to GPT-4o&apos;s 11th percentile.
            That&apos;s not because o1 is a bigger model. It&apos;s because it can think
            longer.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="How reasoning models think">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Reasoning models combine several techniques to achieve deeper thinking. The exact
            implementation varies (OpenAI hasn&apos;t revealed all the details of o1), but the
            core principles are clear: test-time compute, chain-of-thought at scale,
            self-verification, and explicit thinking budgets.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Test-Time Compute Scaling',
                content: (
                  <div className="space-y-4">
                    <p>
                      Traditional scaling in AI is about training bigger models on more data
                      with more compute. That&apos;s{' '}
                      <strong className="text-white">pre-training compute</strong>. Test-time
                      compute scaling is different: you spend more computation during inference
                      — when the model is actually solving a problem.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-4 py-4">
                        <div className="text-blue-400 text-sm font-semibold mb-2">
                          Pre-training Compute
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Train a 100B parameter model on 10T tokens. One-time cost, paid
                            during training. Model gets smarter, but inference speed stays the
                            same.
                          </p>
                          <p className="text-blue-300 font-medium">
                            Traditional approach: bigger models
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-4 py-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">
                          Test-Time Compute
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Use a smaller model, but let it think longer on hard problems.
                            Generate multiple solutions, explore different paths, verify
                            answers. Cost per query, paid during inference.
                          </p>
                          <p className="text-green-300 font-medium">
                            New approach: longer thinking
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The key insight from the o1 paper and related research (like{' '}
                      <em>Let&apos;s Verify Step by Step</em>): for many hard problems,
                      test-time compute is more efficient than just scaling model size. A
                      smaller model that thinks for 30 seconds can outperform a bigger model
                      that answers instantly. This is a paradigm shift — you don&apos;t always
                      need a bigger model, you need a model that can think longer when it
                      matters.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Chain-of-Thought at Scale',
                content: (
                  <div className="space-y-4">
                    <p>
                      You&apos;ve seen chain-of-thought prompting in the agents lesson: prompt
                      the model to think step by step, and it gets better at reasoning. But
                      prompting &ldquo;let&apos;s think step by step&rdquo; is just scratching
                      the surface. Reasoning models take this much further.
                    </p>

                    <p className="text-sm">
                      Instead of a linear chain (step 1 → step 2 → step 3 → answer), reasoning
                      models explore a reasoning <strong className="text-white">tree</strong>.
                      They might try multiple approaches to the same problem in parallel,
                      evaluate which path looks most promising, and continue down that branch.
                      If they hit a dead end, they backtrack and try a different path.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs space-y-2">
                      <div>
                        <span className="text-purple-400">Approach 1:</span>{' '}
                        <span className="text-gray-300">Try algebraic solution...</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-gray-500">→ Check:</span>{' '}
                        <span className="text-red-400">Doesn&apos;t simplify cleanly</span>
                      </div>
                      <div>
                        <span className="text-purple-400">Approach 2:</span>{' '}
                        <span className="text-gray-300">Try geometric insight...</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-gray-500">→ Check:</span>{' '}
                        <span className="text-green-400">
                          This works! Triangles are similar
                        </span>
                      </div>
                      <div className="pl-4">
                        <span className="text-gray-500">→ Continue:</span>{' '}
                        <span className="text-gray-300">Apply similarity ratio...</span>
                      </div>
                      <div className="pl-4">
                        <span className="text-green-400">→ Verified answer: x = 12</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This exploration is trained into the model, not just prompted. O1 was
                      trained with reinforcement learning to explore reasoning paths and learn
                      which strategies work for which types of problems. The model develops
                      metacognitive skills: knowing when to try a different approach, when to
                      check its work, when it&apos;s confident vs uncertain. That&apos;s
                      dramatically more powerful than just prompting a standard model to think
                      step by step.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Self-Verification',
                content: (
                  <div className="space-y-4">
                    <p>
                      One of the biggest failure modes of standard LLMs is hallucinating with
                      confidence. They generate an answer that sounds plausible but is
                      completely wrong, and they have no way to catch the error. Reasoning
                      models build in self-verification.
                    </p>

                    <p className="text-sm">
                      After generating a candidate solution, the model checks its own work. For
                      math problems, it might plug the answer back into the original equation.
                      For code, it might trace through the logic with test cases. For reasoning
                      tasks, it might ask: &ldquo;Wait, does this conclusion actually follow
                      from the premises?&rdquo;
                    </p>

                    <div className="grid grid-cols-1 gap-3 my-6">
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg px-4 py-3">
                        <div className="text-red-400 text-sm font-semibold mb-2">
                          Without Self-Verification
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>Generate answer → output it → hope it&apos;s right</p>
                          <p className="text-red-300 mt-2">
                            No mechanism to catch errors before they reach the user
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-4 py-3">
                        <div className="text-green-400 text-sm font-semibold mb-2">
                          With Self-Verification
                        </div>
                        <div className="text-xs text-gray-400">
                          <p>
                            Generate answer → verify it → if wrong, try again → output verified
                            answer
                          </p>
                          <p className="text-green-300 mt-2">
                            Catches errors internally before they become hallucinations
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This is trained through reinforcement learning with process-based rewards.
                      Instead of just rewarding the model for getting the final answer right
                      (outcome reward), you reward it for correct intermediate steps and for
                      catching its own errors (process reward). The model learns to be its own
                      critic. &ldquo;Wait, that doesn&apos;t add up. Let me recalculate.&rdquo;
                      This metacognitive loop — think, check, revise — is what makes reasoning
                      models more reliable than standard LLMs.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Extended Thinking (Claude)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Claude&apos;s extended thinking feature makes the concept of test-time
                      compute explicit. You can give Claude a thinking budget — essentially
                      saying &ldquo;spend up to X tokens thinking before you answer.&rdquo; The
                      model uses that budget to reason through the problem internally, and you
                      get to see the thinking process.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">
                        Extended thinking in action:
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="border-l-2 border-purple-500 pl-3">
                          <div className="text-purple-400 font-semibold mb-1">
                            Thinking (private, internal)
                          </div>
                          <div className="text-gray-300">
                            Let me break this problem down. The user wants to optimize database
                            queries. First, I should consider indexing strategies... Actually,
                            wait. Before recommending indexes, I need to understand the access
                            patterns. Let me think about this more carefully...
                          </div>
                        </div>
                        <div className="border-l-2 border-green-500 pl-3">
                          <div className="text-green-400 font-semibold mb-1">
                            Response (to user)
                          </div>
                          <div className="text-gray-300">
                            To optimize your database queries, I need to first analyze your
                            access patterns. Here&apos;s a structured approach...
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The extended thinking approach is different from o1&apos;s hidden
                      reasoning. With Claude, you can optionally see the thinking tokens, which
                      gives you transparency into how the model arrived at its answer. With o1,
                      the detailed chain of thought is kept private (you see a summary, not the
                      raw tokens). Both approaches use test-time compute, but they make
                      different trade-offs between transparency and efficiency.
                    </p>

                    <p className="text-sm">
                      The key benefit of extended thinking is adaptive compute: easy questions
                      get answered fast, hard questions get more thinking time. The model
                      decides how much of the budget to use based on problem difficulty. This is
                      more efficient than always thinking deeply (wastes compute on easy
                      questions) or always answering instantly (fails on hard questions).
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="The relationship between training compute and inference compute">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                There&apos;s a fundamental trade-off in AI: you can spend compute during
                training (making a bigger, smarter model) or during inference (letting the
                model think longer on each query). For decades, the focus was entirely on
                training compute — bigger models, more data, more GPUs for months. But
                research on test-time compute shows that for many tasks, especially hard
                reasoning problems, inference compute is more efficient.
              </p>
              <p className="text-gray-700">
                Why? Because hard problems are rare. Most user queries are straightforward —
                summarize this text, translate this phrase, write a simple function. You
                don&apos;t need a 1 trillion parameter model answering instantly when a 100B
                parameter model thinking for 10 seconds would do better. Test-time compute
                lets you allocate resources where they&apos;re needed: fast answers for easy
                questions, deep thinking for hard ones.
              </p>
              <p className="text-gray-700">
                The limitation is that reasoning models can still be wrong. They&apos;re less
                wrong than standard models on hard problems — o1 gets AIME math competition
                problems right 83% of the time vs GPT-4o&apos;s 13%. But that still means 1 in
                6 answers is incorrect. Self-verification helps, but it&apos;s not perfect. The
                model can convince itself that a wrong answer is right, or miss subtle errors in
                its reasoning. Reasoning models are a huge step forward, but they&apos;re not
                foolproof.
              </p>
              <p className="text-gray-700">
                Another limitation is cost and latency. Spending 30 seconds of compute on a
                single query is expensive. For production systems with millions of users, you
                need to be strategic: use standard models for the 90% of queries that are
                simple, reserve reasoning models for the 10% that genuinely need deep
                thinking. The art is building systems that can route queries to the right
                model with the right thinking budget. That&apos;s the next frontier in AI
                infrastructure.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="See reasoning in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            This simulation demonstrates the difference between standard and extended thinking
            modes. Pick a problem, toggle between the two modes, and watch how extended
            thinking explores the problem space, checks its work, and arrives at verified
            answers that standard mode often gets wrong.
          </p>

          <ReasoningSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Reasoning models trade speed for accuracy by spending more compute during inference (test-time compute) rather than just making bigger models during training (pre-training compute).',
            'Test-time compute scaling is the key insight: on hard problems, letting a smaller model think longer often outperforms a bigger model answering instantly. This shifts the paradigm from "train bigger models" to "think longer when it matters."',
            'Chain-of-thought at scale means exploring a reasoning tree (multiple approaches in parallel), not just a linear chain. The model tries different strategies, backtracks when stuck, and learns which approaches work for which problems.',
            'Self-verification is critical. Reasoning models check their own work, catch errors before they become hallucinations, and revise their answers when verification fails. This metacognitive loop (think → check → revise) makes them more reliable.',
            'Extended thinking (Claude) and o1-style reasoning make test-time compute explicit. You can give the model a thinking budget, and it adaptively uses more time on hard problems, less on easy ones. This is more efficient than always thinking deeply or always answering instantly.',
          ]}
          misconceptions={[
            '"Reasoning models are just better at prompting." — They are not. While prompting helps ("think step by step"), reasoning models are trained with RL to explore reasoning trees, verify answers, and allocate compute dynamically. The difference is in training, not just in prompting.',
            '"Reasoning models never make mistakes." — They still make errors, just less often on hard problems. O1 gets AIME math problems right 83% of the time — impressive, but not perfect. Self-verification helps, but the model can still convince itself wrong answers are right.',
            '"Test-time compute always beats bigger models." — It depends on the task. For simple queries (factual lookup, basic summarization), a standard model is faster and cheaper. Test-time compute shines on hard reasoning problems where exploration and verification add real value. The art is knowing when to use which approach.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What does 'test-time compute scaling' mean in the context of reasoning models?"
          options={[
            {
              text: 'Training a bigger model on more data to improve performance',
              isCorrect: false,
            },
            {
              text: 'Spending more computation during inference (thinking time) rather than just during training, letting the model explore solutions and verify answers',
              isCorrect: true,
            },
            {
              text: 'Running the model on faster hardware to reduce latency',
              isCorrect: false,
            },
            {
              text: 'Testing the model on benchmark datasets during training',
              isCorrect: false,
            },
          ]}
          explanation="Test-time compute scaling means spending more computation during inference — when the model is actually solving a problem — rather than only during pre-training. Instead of making models bigger and training them longer (pre-training compute), reasoning models use inference time to explore multiple solution paths, check their work, and verify answers. A smaller model that thinks for 30 seconds can outperform a bigger model that answers instantly on hard problems. This is a paradigm shift: you don't always need a bigger model, you need a model that can think longer when it matters. The key is allocating compute where it provides the most value — fast answers for easy questions, deep thinking for hard ones."
        />
      </LessonSection>
    </div>
  );
}
