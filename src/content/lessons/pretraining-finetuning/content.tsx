'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import FinetuningSim from '@/components/simulations/FinetuningSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function PretrainingFinetuningContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Imagine you hire someone who&apos;s read every book in the library.
            They know facts about everything, but they&apos;ve never actually had
            a job. They&apos;re brilliant but useless &mdash; they&apos;ll ramble
            about random topics when you ask them a simple question. That&apos;s a
            pre-trained model. Fine-tuning is job training: teaching that brilliant
            generalist to actually be helpful.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This two-phase process is how every modern AI assistant is built.
            Phase one (pre-training) takes months and costs millions &mdash; you
            feed the model trillions of words from the internet and let it absorb
            the patterns of human language. Phase two (fine-tuning) takes hours or
            days and costs a fraction of that &mdash; you show the model examples
            of good conversations and it learns to be an assistant instead of a
            text autocomplete engine.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Understanding these two phases is essential because it explains so
            much about how LLMs behave. Why they know obscure facts but sometimes
            give weirdly unhelpful answers. Why you can take a single base model
            and turn it into a medical assistant, a coding tutor, or a creative
            writing partner. Why companies fine-tune existing models instead of
            building from scratch. The answer to all of these is the pre-training
            / fine-tuning split.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Two phases of training">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Think of it as two completely different jobs. Pre-training is
            unsupervised &mdash; the model reads billions of web pages, books,
            code repositories, and Wikipedia articles, trying to predict the next
            word. Nobody tells it what&apos;s important or how to respond to
            questions. It&apos;s just pattern-matching at an enormous scale. The
            result is a <strong>base model</strong> that understands language
            deeply but has no idea how to be useful.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Fine-tuning flips the script. Now you take that base model and show
            it thousands of carefully curated examples: &quot;When a human asks
            this, respond like this.&quot; These are instruction/response pairs
            written by human annotators. The model learns to follow instructions,
            structure its answers, refuse dangerous requests, and actually help
            people. This is <strong>supervised fine-tuning (SFT)</strong> &mdash;
            supervised because each training example has a clear right answer.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The two-phase training pipeline"
              nodes={[
                { id: 'raw', label: 'Raw Text', sublabel: 'Terabytes of internet', type: 'input' },
                { id: 'pretrain', label: 'Pre-training', sublabel: 'Next-token prediction', type: 'process' },
                { id: 'base', label: 'Base Model', sublabel: 'Knows a lot, not helpful', type: 'attention' },
                { id: 'task', label: 'Task Data', sublabel: 'Instruction pairs (MB)', type: 'input' },
                { id: 'finetune', label: 'Fine-tuning', sublabel: 'Supervised learning', type: 'process' },
                { id: 'useful', label: 'Useful Model', sublabel: 'Helpful assistant', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The key insight is that most of the &quot;intelligence&quot; comes
            from pre-training. The base model already knows grammar, facts,
            reasoning patterns, coding conventions, and world knowledge.
            Fine-tuning doesn&apos;t add much new knowledge &mdash; instead, it
            teaches the model <em>how to use</em> what it already knows.
            It&apos;s the difference between someone who&apos;s read every
            medical textbook and a doctor who&apos;s actually practiced medicine.
            Same knowledge, radically different usefulness.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="From raw knowledge to useful assistant">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s walk through each phase in detail, including the economics
            that explain why the entire AI industry is structured the way it is.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Pre-training — Reading the Internet',
                content: (
                  <div className="space-y-4">
                    <p>
                      Pre-training is the expensive, foundational phase. The model
                      is trained on a <strong className="text-white">massive,
                      diverse corpus</strong> &mdash; web pages, books, academic
                      papers, code, Wikipedia, forums, news articles. The only
                      objective: predict the next token given all previous tokens.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">What it learns</span>
                        <div className="text-white text-xs mt-2">
                          Grammar, facts, reasoning, code patterns, common sense,
                          world knowledge, mathematical relationships
                        </div>
                      </div>
                      <div className="border-2 border-indigo-500/50 bg-indigo-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-indigo-400 text-sm font-medium">The hardware</span>
                        <div className="text-white text-xs mt-2">
                          Thousands of GPUs (H100s, TPUs) running for weeks or
                          months. Llama 3 405B used 16,384 H100 GPUs.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The result is a <em>base model</em> (sometimes called a
                      foundation model). It&apos;s incredibly capable in a raw
                      sense &mdash; it can complete text fluently in dozens of
                      languages, write code, and even solve math problems. But
                      ask it &quot;What&apos;s the capital of France?&quot; and
                      it might respond with &quot;What&apos;s the capital of
                      Germany? What&apos;s the capital of Italy?&quot; because
                      it learned to predict what comes next in quiz-style text,
                      not how to answer questions.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Supervised Fine-Tuning (SFT)',
                content: (
                  <div className="space-y-4">
                    <p>
                      SFT is where the base model learns to be an assistant.
                      Human annotators create thousands of{' '}
                      <strong className="text-white">instruction/response
                      pairs</strong> &mdash; examples of exactly how the model
                      should behave when asked a question, given a task, or
                      shown code to debug.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs">
                      <div className="text-gray-500 mb-1">{'//'} Example SFT training pair:</div>
                      <div className="text-blue-400">User: &quot;Explain recursion to a 5-year-old.&quot;</div>
                      <div className="text-emerald-400 mt-1">
                        Assistant: &quot;Imagine you have a set of Russian nesting
                        dolls. You open the big one and find a smaller one inside.
                        You open that one and find an even smaller one. You keep
                        going until you find the tiniest doll that doesn&apos;t
                        open. That&apos;s recursion &mdash; a thing that contains
                        a smaller version of itself, until you hit the smallest
                        version.&quot;
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The key differences from pre-training: the dataset is{' '}
                      <em>much</em> smaller (thousands to hundreds of thousands of
                      examples vs trillions of tokens), but each example is
                      carefully crafted by humans. Quality over quantity. The
                      training takes hours or days, not weeks. And the model
                      already has all the knowledge it needs &mdash; SFT just
                      teaches it the right &quot;format&quot; for using that
                      knowledge.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Transfer Learning — The Big Insight',
                content: (
                  <div className="space-y-4">
                    <p>
                      Transfer learning is the reason this whole approach works.
                      The core idea: <strong className="text-white">knowledge
                      learned on one task transfers to other tasks.</strong> A
                      model pre-trained on general internet text has learned
                      representations so rich that they&apos;re useful for almost
                      any downstream task.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
                      {[
                        { label: 'Medical Q&A', icon: 'Diagnose symptoms, explain treatments' },
                        { label: 'Legal Analysis', icon: 'Summarize contracts, cite precedents' },
                        { label: 'Code Assistant', icon: 'Debug, explain, generate code' },
                        { label: 'Customer Support', icon: 'Answer FAQs, resolve issues' },
                      ].map((item) => (
                        <div key={item.label} className="border border-purple-500/30 bg-purple-500/5 rounded-lg px-2 py-3 text-center">
                          <div className="text-purple-300 text-xs font-medium">{item.label}</div>
                          <div className="text-gray-500 text-[10px] mt-1">{item.icon}</div>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-gray-400">
                      Same base model, different fine-tuning data, completely
                      different specialists. This is why transfer learning is
                      one of the most important ideas in modern AI. Instead of
                      training a medical AI from scratch (which would need a
                      massive medical dataset and enormous compute), you take a
                      general-purpose pre-trained model and fine-tune it on a
                      relatively small set of medical conversations. The model
                      already understands language, biology, and reasoning &mdash;
                      you&apos;re just pointing it in the right direction.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: The Economics',
                content: (
                  <div className="space-y-4">
                    <p>
                      The economics of pre-training vs fine-tuning explain the
                      entire structure of the AI industry. Pre-training is so
                      expensive that <strong className="text-white">only a handful
                      of organizations can afford to do it.</strong> Fine-tuning
                      is so cheap that anyone with a GPU and some data can do it.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-4 py-4">
                        <div className="text-blue-400 text-sm font-semibold mb-2">Pre-training</div>
                        <div className="space-y-1.5 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Compute cost</span>
                            <span className="text-blue-300 font-mono">$2M - $100M+</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time</span>
                            <span className="text-blue-300 font-mono">Weeks to months</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team</span>
                            <span className="text-blue-300 font-mono">50-200+ engineers</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Who does it</span>
                            <span className="text-blue-300 font-mono">~10 orgs worldwide</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-2 border-emerald-500/50 bg-emerald-500/5 rounded-lg px-4 py-4">
                        <div className="text-emerald-400 text-sm font-semibold mb-2">Fine-tuning</div>
                        <div className="space-y-1.5 text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>Compute cost</span>
                            <span className="text-emerald-300 font-mono">$100 - $10,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time</span>
                            <span className="text-emerald-300 font-mono">Hours to days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Team</span>
                            <span className="text-emerald-300 font-mono">1-5 engineers</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Who does it</span>
                            <span className="text-emerald-300 font-mono">Thousands of companies</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This asymmetry is why the AI world is structured the way it
                      is. A few large labs (OpenAI, Anthropic, Google, Meta)
                      invest massively in pre-training and release base models.
                      Then thousands of companies fine-tune these models for their
                      specific use case. It&apos;s like the semiconductor industry:
                      a few companies build chip fabs (billions of dollars), and
                      millions of companies design chips on top of them.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Data quality, contamination, and catastrophic forgetting">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Training data quality matters more than quantity.</strong>{' '}
                This was one of the big lessons of the Chinchilla paper and
                subsequent research. A model trained on 1 trillion tokens of
                carefully curated, high-quality text outperforms one trained on 10
                trillion tokens of noisy web scrapes. This is why companies like
                Anthropic and OpenAI invest heavily in data curation pipelines
                &mdash; filtering out duplicates, low-quality content, toxic
                text, and copyrighted material. The quality of your pre-training
                data determines the ceiling of your model&apos;s capabilities.
              </p>
              <p className="text-gray-700">
                <strong>Data contamination</strong> is a growing concern. If
                benchmark test questions appear in the pre-training data, the
                model might score well on benchmarks not because it can reason,
                but because it memorized the answers. Researchers now put
                significant effort into decontamination &mdash; ensuring
                evaluation data wasn&apos;t in the training set. This is harder
                than it sounds when your training data is the entire internet.
              </p>
              <p className="text-gray-700">
                <strong>Catastrophic forgetting</strong> is the risk that
                fine-tuning destroys knowledge the model learned during
                pre-training. If you fine-tune too aggressively on a narrow
                task, the model might become great at that task but forget
                everything else. The fix is careful hyperparameter tuning (low
                learning rates, limited epochs) and techniques like LoRA that
                modify only a small subset of the model&apos;s weights, leaving
                most of the pre-trained knowledge intact. We&apos;ll cover these
                techniques in the PEFT lesson.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="See pre-training vs fine-tuning in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            This simulation lets you watch both training phases side by side.
            Notice how pre-training processes diverse text (news, code, Wikipedia)
            while fine-tuning uses structured instruction/response pairs. The loss
            curves show how pre-training starts from a high loss and drops slowly,
            while fine-tuning starts from the pre-trained model&apos;s loss and
            drops much faster. Toggle the &quot;Before vs After&quot; examples to
            see how dramatically fine-tuning changes the model&apos;s output quality.
          </p>

          <FinetuningSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Pre-training is the expensive phase: the model reads trillions of tokens from the internet using next-token prediction. It learns grammar, facts, reasoning, and code patterns. This takes weeks on thousands of GPUs and costs millions of dollars.',
            'Fine-tuning (SFT) is the practical phase: the model trains on curated instruction/response pairs to learn how to follow instructions and be helpful. This takes hours or days, uses thousands of examples (not trillions), and costs hundreds to thousands of dollars.',
            'Transfer learning is the key insight: knowledge learned during pre-training transfers to downstream tasks. You can take a single pre-trained base model and fine-tune it into a medical assistant, a coding tutor, a legal analyzer, or any other specialist.',
            'The economics explain the industry structure: pre-training is so expensive that only a handful of labs do it (OpenAI, Anthropic, Google, Meta). Fine-tuning is cheap enough that thousands of companies customize these models for their specific needs.',
            'Fine-tuning does not add new knowledge to the model. It changes how the model uses what it already knows. A base model has the information but does not know how to present it helpfully. Fine-tuning teaches the format and style, not the facts.',
          ]}
          misconceptions={[
            '"Fine-tuning adds new knowledge to the model." -- Not really. Fine-tuning changes how the model uses existing knowledge, not what it knows. If the base model never saw information about your company during pre-training, fine-tuning on your company\'s FAQ won\'t reliably teach it new facts. For injecting new knowledge, retrieval-augmented generation (RAG) is usually more effective.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why is fine-tuning much cheaper than pre-training?"
          options={[
            { text: 'Fine-tuning uses a completely different, simpler model architecture', isCorrect: false },
            { text: 'Fine-tuning starts from a good initialization (the pre-trained weights), uses much less data, and requires far fewer compute hours', isCorrect: true },
            { text: 'Fine-tuning does not use GPUs, only CPUs', isCorrect: false },
            { text: 'Fine-tuning trains all the same parameters but uses a faster optimizer', isCorrect: false },
          ]}
          explanation="Fine-tuning is cheaper for three compounding reasons. First, it starts from pre-trained weights that already encode rich language understanding, so it does not need to learn language from scratch. Second, the training dataset is vastly smaller — thousands of instruction/response pairs instead of trillions of tokens. Third, these two factors together mean it converges in hours or days instead of weeks or months, requiring far less GPU time. The model architecture is identical; what changes is the starting point, the data, and therefore the compute needed."
        />
      </LessonSection>
    </div>
  );
}
