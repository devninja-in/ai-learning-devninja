'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import EvaluationSim from '@/components/simulations/EvaluationSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function EvaluationBenchmarksContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            How do you know if one AI model is &quot;better&quot; than another? You
            can&apos;t just ask it a few questions and call it a day. Models are good at
            different things — one might ace math but flunk creative writing, another
            might crush code generation but struggle with common sense reasoning.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Benchmarks give us a shared yardstick. They&apos;re standardized tests that
            let us compare models objectively. When OpenAI says GPT-4 scores 86.4% on
            MMLU, or Anthropic says Claude 3 Opus gets 84.9% on HumanEval, those numbers
            mean something — you can reproduce them, compare them to other models, and
            track progress over time.
          </p>

          <p className="text-gray-700 leading-relaxed">
            But here&apos;s the catch: benchmarks are far from perfect. They&apos;re
            proxies for real-world performance, not guarantees. A model with a 90% score
            might still fail catastrophically on your specific task. Understanding what
            benchmarks measure (and what they don&apos;t) is crucial for picking the right
            model and knowing when to trust the numbers.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Measuring intelligence is hard">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            There is no single &quot;IQ test&quot; for AI models. Intelligence is
            multidimensional — knowledge, reasoning, creativity, code, math, common sense,
            language understanding. A model can be brilliant at one and mediocre at another.
            That&apos;s why we need multiple benchmarks testing different capabilities.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="From model to nuanced understanding"
              nodes={[
                { id: 'model', label: 'AI Model', type: 'input' },
                { id: 'bench1', label: 'Knowledge Test (MMLU)', type: 'process' },
                { id: 'bench2', label: 'Code Test (HumanEval)', type: 'process' },
                { id: 'bench3', label: 'Reasoning Test (HellaSwag)', type: 'process' },
                { id: 'bench4', label: 'Math Test (GSM8K)', type: 'process' },
                { id: 'profile', label: 'Score Profile', type: 'process' },
                { id: 'understanding', label: 'Nuanced Understanding', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The result is a profile, not a number. GPT-4 might score 86% on knowledge,
            67% on code, 95% on common sense. Claude 3 Opus might reverse that: 87%
            knowledge, 85% code, 95% common sense. Neither is &quot;better&quot; — they
            have different strengths. The right model depends on what you&apos;re trying
            to do.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Beyond scores, we care about cost, speed, and reliability. A model that scores
            5% higher but costs 10x more isn&apos;t always the right choice. Benchmarks
            give us performance data, but picking a model requires weighing performance
            against cost, latency, and your specific use case. Raw scores are just the
            starting point.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="The benchmarks that matter">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            There are dozens of AI benchmarks, but most fall into a few categories. Some
            test knowledge breadth, others test reasoning or code generation or language
            quality. Here are the four most important categories and the benchmarks that
            define them.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Knowledge & Reasoning (MMLU)',
                content: (
                  <div className="space-y-4">
                    <p>
                      <strong className="text-gray-900">MMLU (Massive Multitask Language
                      Understanding)</strong> is the gold standard for measuring breadth of
                      knowledge. It covers 57 subjects across STEM, humanities, social
                      sciences, and professional domains — everything from elementary math
                      to US foreign policy to college biology.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                      <div className="text-sm space-y-2">
                        <div><strong>Format:</strong> Multiple-choice questions with 4 options.</div>
                        <div><strong>Scoring:</strong> Accuracy (0-100%). Random guessing gets 25%.</div>
                        <div><strong>Example subjects:</strong> Abstract algebra, anatomy, astronomy,
                        business ethics, clinical knowledge, college chemistry, computer security,
                        econometrics, elementary mathematics, high school US history, international
                        law, machine learning, medical genetics, nutrition, philosophy, professional
                        accounting, public relations, sociology, US foreign policy, virology, world
                        religions.</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Why it matters:</strong> MMLU tests
                      whether a model has broad, factual knowledge. A high MMLU score means the
                      model absorbed a lot of information during training and can recall it
                      accurately. But it doesn&apos;t test creativity, reasoning depth, or the
                      ability to apply knowledge to novel problems. It&apos;s a knowledge
                      breadth test, not an intelligence test.
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">What to watch for:</strong> Scores above
                      85% are frontier-level (GPT-4, Claude 3 Opus). Scores around 60-70% are
                      typical for smaller open-source models (7B-13B parameters). Human expert
                      performance on MMLU is estimated around 89%, so we&apos;re approaching
                      human-level knowledge breadth on this benchmark.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Code Generation (HumanEval)',
                content: (
                  <div className="space-y-4">
                    <p>
                      <strong className="text-gray-900">HumanEval</strong> tests whether a
                      model can write correct code. Given a Python function signature and a
                      docstring with examples, the model writes the function body. The code is
                      then tested against a hidden test suite.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                      <div className="text-sm space-y-2">
                        <div><strong>Format:</strong> 164 hand-written programming problems.</div>
                        <div><strong>Scoring:</strong> Pass@1 (percentage that pass all tests on
                        the first try). Pass@10 and Pass@100 measure success with multiple attempts.</div>
                        <div className="font-mono text-xs text-gray-600 bg-white rounded p-2 mt-2">
                          {`def has_close_elements(numbers: List[float], threshold: float) -> bool:
    """Check if in given list of numbers, are any two numbers
    closer to each other than given threshold.
    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)
    False
    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)
    True
    """
    # Model must write implementation here`}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Why it matters:</strong> HumanEval
                      tests programming ability — understanding requirements, breaking down
                      problems, and writing syntactically correct, logically sound code.
                      It&apos;s a proxy for &quot;can this model help with real coding
                      tasks?&quot; but it&apos;s limited to self-contained functions, not
                      large codebases or debugging.
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">What to watch for:</strong> Scores above
                      80% are excellent (Claude 3 Opus: 84.9%, Llama 3 70B: 81.7%). GPT-3.5 was
                      around 48%, so we&apos;ve seen massive progress. The original GPT-3
                      (2020) scored 0% — code generation is a capability that emerged with scale
                      and better training.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Common Sense Reasoning (HellaSwag)',
                content: (
                  <div className="space-y-4">
                    <p>
                      <strong className="text-gray-900">HellaSwag</strong> tests whether models
                      understand how everyday scenarios play out. Given a context sentence, the
                      model picks the most likely continuation from four options. The catch:
                      the wrong answers are designed to be plausible but violate common sense.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                      <div className="text-sm space-y-2">
                        <div><strong>Format:</strong> 10,000+ multiple-choice questions generated
                        from video captions and WikiHow articles.</div>
                        <div><strong>Scoring:</strong> Accuracy (0-100%). Humans score ~95%.</div>
                        <div className="bg-white rounded p-2 mt-2 text-xs">
                          <strong>Example:</strong><br />
                          <em>Context:</em> &quot;A man is sitting on a roof. He...&quot;<br />
                          A) starts removing old shingles. ✓<br />
                          B) flies into the air.<br />
                          C) turns into a bird.<br />
                          D) eats the roof.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Why it matters:</strong> HellaSwag
                      tests commonsense reasoning about the physical world. Models can&apos;t
                      just memorize facts — they need to understand causality, physics, and
                      typical human behavior. This is surprisingly hard for models, because
                      common sense isn&apos;t explicitly written down in training data.
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">What to watch for:</strong> Frontier
                      models score 85-95%, approaching human performance. Smaller models often
                      struggle here (60-80%), revealing that common sense reasoning requires
                      more than just pattern matching — it needs real understanding of how the
                      world works.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Text Quality (BLEU, ROUGE, BERTScore)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Unlike the previous benchmarks (which measure correctness), these metrics
                      measure <em>quality</em> of generated text. They&apos;re used for tasks
                      like translation, summarization, and paraphrasing — anywhere you need to
                      compare generated text to a reference &quot;gold standard.&quot;
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3">
                        <div className="text-blue-700 font-medium mb-1">BLEU</div>
                        <div className="text-sm text-gray-700">
                          Measures n-gram overlap between generated and reference text. Originally
                          designed for machine translation. Higher is better (0-100).
                        </div>
                      </div>

                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3">
                        <div className="text-green-700 font-medium mb-1">ROUGE</div>
                        <div className="text-sm text-gray-700">
                          Measures recall of n-grams — what percentage of reference text appears
                          in the generated text. Used for summarization. Higher is better (0-100).
                        </div>
                      </div>

                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <div className="text-purple-700 font-medium mb-1">BERTScore</div>
                        <div className="text-sm text-gray-700">
                          Uses BERT embeddings to measure semantic similarity (not just word
                          overlap). Better at capturing paraphrases. Range: 0-1, higher is better.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Why it matters:</strong> These aren&apos;t
                      benchmarks like MMLU or HumanEval — they&apos;re evaluation metrics. You
                      use them to measure quality on YOUR data. BLEU and ROUGE are fast but crude
                      (they reward word overlap, not meaning). BERTScore is smarter but slower.
                      None of them capture creativity, style, or factual correctness.
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">What to watch for:</strong> BLEU/ROUGE
                      scores are task-specific — there&apos;s no universal &quot;good&quot; score.
                      A BLEU of 30 might be great for creative paraphrasing, terrible for
                      translation. Always compare to baselines and, when possible, use human
                      evaluation alongside automated metrics.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Contamination, Chatbot Arena, and custom evals">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>The contamination problem:</strong> Benchmarks are public datasets.
                If a model&apos;s training data includes MMLU questions (even indirectly),
                it&apos;s not truly being tested — it&apos;s recalling memorized answers.
                This is called data contamination, and it&apos;s a huge issue for LLMs
                trained on massive web scrapes. OpenAI, Anthropic, and others now test for
                contamination and report adjusted scores, but it&apos;s an arms race. As
                models get better, we need fresh benchmarks that haven&apos;t leaked into
                training data.
              </p>
              <p className="text-gray-700">
                <strong>Chatbot Arena and ELO ratings:</strong> An alternative approach is
                human preference evaluation. Chatbot Arena (by LMSYS) has humans chat with
                two anonymous models side-by-side, then pick which response they prefer.
                Models get an ELO rating (like chess). This avoids contamination and tests
                real-world usefulness, but it&apos;s expensive, slower, and subjective.
                Still, it often reveals things benchmarks miss — Claude 3 Opus and GPT-4
                have similar MMLU scores but different Arena rankings because users prefer
                one&apos;s style or reliability.
              </p>
              <p className="text-gray-700">
                <strong>Custom evals for your use case:</strong> Public benchmarks are
                generic. If you&apos;re building a medical chatbot, MMLU&apos;s medical
                questions are a start, but you need domain-specific evaluation on YOUR
                data. Same for legal, finance, customer support, creative writing — any
                specialized domain. The best eval is a held-out test set from your actual
                use case, scored by domain experts or automated metrics tuned to your task.
                Benchmarks tell you where to start looking, but custom evals tell you what
                will actually work.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Time to compare models across benchmarks. The dashboard below shows real
            approximate scores for GPT-4, Claude 3 Opus, Llama 3 70B, Mistral 7B, and
            Gemma 7B across five key benchmarks. Toggle between raw scores and cost
            efficiency to see how smaller models punch above their weight when you
            factor in price. Click any benchmark name to see what it tests and an
            example question.
          </p>

          <EvaluationSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'No single benchmark captures model quality. You need a profile across multiple tests — knowledge (MMLU), code (HumanEval), reasoning (HellaSwag), math (GSM8K), text quality (BLEU/ROUGE) — to understand a model\'s strengths and weaknesses.',
            'MMLU tests breadth of knowledge across 57 subjects. High scores (85%+) mean the model absorbed lots of factual information, but it doesn\'t test reasoning depth, creativity, or application to novel problems.',
            'HumanEval measures code generation ability by having models write Python functions from docstrings. Scores above 80% indicate strong programming skills, but it\'s limited to self-contained functions, not real-world debugging or large codebases.',
            'HellaSwag tests commonsense reasoning about everyday scenarios. Frontier models approach human performance (95%), but smaller models struggle (60-80%), revealing that common sense requires deep understanding, not just pattern matching.',
            'Benchmark scores don\'t predict performance on YOUR task. A model with 90% on MMLU might fail at your domain-specific use case. Always evaluate on your own data — public benchmarks are a starting point, custom evals are the answer.',
          ]}
          misconceptions={[
            '"Higher benchmark scores always mean a better model." — Not quite. GPT-4 might score 2% higher than Claude 3 Opus on MMLU, but Claude crushes it on code. The "best" model depends on your use case, not a single number.',
            '"Benchmarks measure real intelligence." — No. They measure performance on specific tasks. A model can ace MMLU by memorizing facts without truly understanding them. Benchmarks are proxies, not truth.',
            '"Models can\'t cheat on benchmarks." — Wrong. Data contamination is a huge problem. If a model saw MMLU questions during training (even indirectly via web scrapes), it\'s not being tested — it\'s recalling. This inflates scores and makes comparisons unreliable.',
            '"If a model scores 90%, it will work 90% of the time on my task." — Nope. Benchmark scores are accuracy on test questions, not reliability on your specific use case. A medical chatbot needs evaluation on medical data, not generic MMLU questions.',
            '"Small models are always worse because their benchmark scores are lower." — Context matters. A 7B model scoring 60% on MMLU might cost 300x less than GPT-4. If your task doesn\'t need frontier performance, the smaller model is often the better choice.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why is data contamination a problem for AI benchmarks?"
          options={[
            { text: 'It slows down model training because contaminated data takes longer to process', isCorrect: false },
            { text: 'It makes models unreliable in production because contaminated data contains errors', isCorrect: false },
            { text: 'It inflates benchmark scores because models may have seen test questions during training, so they\'re recalling memorized answers instead of truly solving problems', isCorrect: true },
            { text: 'It causes models to hallucinate more often because contaminated data confuses the training process', isCorrect: false },
          ]}
          explanation="Data contamination happens when a model's training data includes benchmark test questions (or similar content from web scrapes). When this happens, the model isn't being tested on its ability to solve new problems — it's just recalling memorized answers from training. This inflates benchmark scores and makes it impossible to fairly compare models. For example, if MMLU questions leaked into training data, a model might score 90% not because it understands the subjects, but because it saw those exact questions before. This is why OpenAI, Anthropic, and others now test for contamination and report adjusted scores. It's also why new, uncontaminated benchmarks are constantly needed — old benchmarks eventually leak into training data as models scale. Contamination doesn't slow training, cause errors in production, or trigger hallucinations — it specifically undermines the validity of evaluation by turning tests into memory checks."
        />
      </LessonSection>
    </div>
  );
}
