'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import WhatIsAISim from '@/components/simulations/WhatIsAISim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function WhatIsAIContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            You used AI before breakfast today. Your phone&apos;s autocorrect fixed three typos
            while you texted a friend. Netflix served up a show it somehow <em>knew</em> you&apos;d
            love. And your email quietly moved a &quot;Congratulations, you won!!!&quot; message
            into spam before you ever saw it. All of that? Machine learning at work.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We tend to think of AI as something futuristic &mdash; robots, self-driving cars,
            sentient computers in movies. But the truth is, you&apos;re already surrounded by it.
            It&apos;s in your search results, your photo gallery&apos;s face recognition,
            your bank&apos;s fraud detection. It&apos;s just... quiet about it.
          </p>

          <p className="text-gray-700 leading-relaxed">
            But what&apos;s actually happening under the hood? How does a machine &quot;learn&quot;
            anything? Let&apos;s break it down. No math, no code, just the core ideas you need
            to understand everything else in this course.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="What's the difference between AI and ML?">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            People use &quot;AI&quot; and &quot;machine learning&quot; like they&apos;re the same
            thing. They&apos;re not &mdash; but they&apos;re related. Think of it this way:
            <strong> AI is the dream, ML is the method</strong>.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Artificial Intelligence has been an idea since the 1950s. It&apos;s the broad goal
            of building machines that can do things we&apos;d consider &quot;intelligent&quot; &mdash;
            recognizing faces, understanding language, making decisions. For decades, people
            tried to achieve this by writing rules by hand. &quot;If the email contains
            &apos;free money,&apos; mark it as spam.&quot; That works... until spammers get creative.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Machine Learning flips the script. Instead of a human writing rules, you give the
            machine examples and let it <em>figure out the rules on its own</em>. Here&apos;s
            what that flip looks like:
          </p>

          <div className="space-y-6 not-prose">
            <FlowDiagram
              title="Traditional Programming"
              nodes={[
                { id: 'data', label: 'Data', type: 'input' },
                { id: 'rules', label: 'Rules', sublabel: '(human-written)', type: 'input' },
                { id: 'program', label: 'Program', type: 'process' },
                { id: 'output', label: 'Output', type: 'output' },
              ]}
            />

            <FlowDiagram
              nodes={[
                { id: 'data', label: 'Data', type: 'input' },
                { id: 'output', label: 'Expected Output', type: 'input' },
                { id: 'learning', label: 'Learning', type: 'process' },
                { id: 'rules', label: 'Rules', sublabel: '(discovered)', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            See the difference? In traditional programming, you tell the computer exactly what
            to do. In machine learning, you show it thousands of examples and say &quot;figure
            it out.&quot; The machine discovers patterns you might never have thought to look
            for. That&apos;s the magic &mdash; and it&apos;s why ML has gotten so powerful
            as data has gotten so abundant.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Three flavors of machine learning">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Not all machine learning works the same way. There are three big approaches, and
            each one tackles a different kind of problem. Click through to see how they compare.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Supervised Learning',
                content: (
                  <div className="space-y-4">
                    <p>
                      This is the most common type. You give the model <strong className="text-white">labeled examples</strong> &mdash;
                      inputs paired with the correct answers &mdash; and it learns to predict
                      answers for new inputs.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center my-6">
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-2">
                        <span className="text-green-400 text-sm font-medium">Input</span>
                        <div className="text-white text-sm mt-1">&quot;Free money!!!&quot;</div>
                      </div>
                      <div className="text-gray-500 self-center">&rarr;</div>
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-2">
                        <span className="text-blue-400 text-sm font-medium">Label</span>
                        <div className="text-white text-sm mt-1">Spam</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Use cases:</strong> spam detection, image
                      classification, medical diagnosis, price prediction, language translation.
                    </p>
                    <p className="text-sm text-gray-400">
                      Think of it like a student learning from a textbook with answer keys.
                      Eventually, they can answer new questions on their own.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Unsupervised Learning',
                content: (
                  <div className="space-y-4">
                    <p>
                      Here, there are <strong className="text-white">no labels at all</strong>.
                      The model looks at the data and tries to find hidden structure &mdash;
                      clusters, groups, patterns &mdash; without being told what to look for.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center my-6">
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <span className="text-purple-400 text-sm font-medium">Cluster A</span>
                        <div className="text-white text-xs mt-1">Promotional emails</div>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <span className="text-purple-400 text-sm font-medium">Cluster B</span>
                        <div className="text-white text-xs mt-1">Shipping updates</div>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <span className="text-purple-400 text-sm font-medium">Cluster C</span>
                        <div className="text-white text-xs mt-1">Work messages</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Use cases:</strong> customer segmentation,
                      anomaly detection, topic discovery, recommendation engines.
                    </p>
                    <p className="text-sm text-gray-400">
                      It&apos;s like sorting a pile of unlabeled photos into albums &mdash; the
                      machine finds natural groupings you might not have noticed.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Reinforcement Learning',
                content: (
                  <div className="space-y-4">
                    <p>
                      The model learns by <strong className="text-white">trial and error</strong>.
                      It takes actions, gets rewards or penalties, and gradually figures out the
                      best strategy. No examples, no labels &mdash; just outcomes.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center my-6">
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-2">
                        <span className="text-amber-400 text-sm font-medium">Action</span>
                        <div className="text-white text-sm mt-1">Move left</div>
                      </div>
                      <div className="text-gray-500 self-center">&rarr;</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-2">
                        <span className="text-amber-400 text-sm font-medium">Reward</span>
                        <div className="text-white text-sm mt-1">+10 points</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Use cases:</strong> game-playing AI (AlphaGo,
                      chess), robotics, autonomous driving, RLHF for language models.
                    </p>
                    <p className="text-sm text-gray-400">
                      Think of training a dog. You don&apos;t explain the rules &mdash; you just
                      reward good behavior until it figures things out.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-gray-700 leading-relaxed">
            In practice, supervised learning is by far the most common. Most of the AI you
            interact with daily &mdash; spam filters, voice assistants, translation apps &mdash; is
            supervised learning under the hood. But the other two are growing fast, especially
            reinforcement learning, which plays a huge role in making modern language models
            actually helpful (we&apos;ll get to that in the RLHF lesson).
          </p>

          <GoDeeper title="What about deep learning?">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                You&apos;ve probably heard &quot;deep learning&quot; thrown around a lot. It&apos;s not
                a fourth type of machine learning &mdash; it&apos;s a <em>subset</em> of the types above.
                Deep learning uses neural networks with many layers (that&apos;s the &quot;deep&quot; part)
                to learn incredibly complex patterns.
              </p>
              <p className="text-gray-700">
                A traditional ML model might struggle to tell apart a cat and a dog from raw pixels.
                A deep learning model can do it easily &mdash; because its layered architecture lets it
                build up from simple features (edges, shapes) to complex ones (ears, whiskers, snouts).
                We&apos;ll build one from scratch in the Neural Networks lesson.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Theory is nice, but seeing it in action is better. Below is a simple email classifier.
            Toggle between supervised and unsupervised mode, then click on different emails to
            see how each approach handles the same data. Notice the difference: supervised gives
            you a definitive label, while unsupervised finds groups.
          </p>

          <WhatIsAISim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'AI is the broad goal of building intelligent machines. Machine learning is the most successful approach to achieving it — learning patterns from data instead of following hand-written rules.',
            'Supervised learning uses labeled examples to learn predictions. It\'s the most common type and powers spam filters, image recognition, and translation.',
            'Unsupervised learning finds hidden patterns in data without labels — great for clustering, segmentation, and anomaly detection.',
            'Reinforcement learning learns through trial and error with rewards, powering game AI and helping fine-tune language models.',
            'Deep learning is a subset of ML that uses multi-layered neural networks. It\'s behind most modern AI breakthroughs, from image generation to conversational AI.',
          ]}
          misconceptions={[
            '"AI and ML are the same thing." — ML is one method for achieving AI. There are other approaches (like rule-based systems), but ML has become dominant because it scales with data.',
            '"AI understands things the way humans do." — Current AI finds statistical patterns. It doesn\'t "understand" in a human sense — it\'s very good at prediction, not comprehension.',
            '"You need a PhD in math to learn this." — The core ideas are intuitive. You\'ll pick up the math gradually, and most of it is just multiplication and addition at scale.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Gmail automatically sorts your emails into Primary, Social, and Promotions tabs — without anyone manually labeling each email category. Which type of machine learning is this most similar to?"
          options={[
            { text: 'Supervised learning', isCorrect: false },
            { text: 'Unsupervised learning', isCorrect: true },
            { text: 'Reinforcement learning', isCorrect: false },
            { text: 'Deep learning', isCorrect: false },
          ]}
          explanation="Gmail's tab sorting is closest to unsupervised learning — it groups emails into clusters based on patterns in the content, sender, and behavior, without requiring someone to label every single email. The system discovers natural groupings on its own. (In practice, Gmail uses a hybrid approach, but the core concept of automatic grouping is unsupervised clustering.)"
        />
      </LessonSection>
    </div>
  );
}
