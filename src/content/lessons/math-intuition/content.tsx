'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import MathIntuitionSim from '@/components/simulations/MathIntuitionSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function MathIntuitionContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Here&apos;s a secret that math teachers never tell you: you don&apos;t need to be
            good at math to understand AI. Seriously. You don&apos;t need to ace calculus or
            remember what a determinant is. You just need to get the intuition &mdash; the
            &quot;why&quot; behind a few key ideas.
          </p>

          <p className="text-gray-700 leading-relaxed">
            There are really only three math concepts that power almost everything in modern AI.
            Three. And none of them are as scary as they sound. Vectors are just arrows.
            Dot products are just a way to check if two arrows point the same way. Gradients
            tell you which direction is &quot;downhill.&quot; That&apos;s the whole toolkit.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Forget formulas. We&apos;re going visual. By the end of this lesson, you&apos;ll
            have a gut-level understanding of the math that makes AI work &mdash; and you&apos;ll
            wonder why anyone ever made it seem complicated.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Numbers as directions">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s start with <strong>vectors</strong>. Forget the textbook definition. A
            vector is just an arrow &mdash; it has a direction, and it has a length. That&apos;s it.
            You can draw one on a napkin. Point it up, down, left, right, at an angle &mdash;
            wherever you want.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Now here&apos;s the wild part: AI uses vectors to represent <em>everything</em>.
            Words, images, songs, user preferences &mdash; they all get turned into lists of
            numbers, and those lists of numbers are vectors. A word isn&apos;t just a word
            to an AI. It&apos;s a direction in space.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Think about the words &quot;king&quot; and &quot;queen.&quot; They&apos;re different
            words, but they share a lot of meaning &mdash; royalty, power, leadership.
            When AI converts them to vectors, those vectors end up pointing in <em>similar
            directions</em>. Meanwhile, &quot;king&quot; and &quot;banana&quot;? Their vectors
            point in totally different directions. The direction <em>is</em> the meaning.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="How AI sees a word"
              nodes={[
                { id: 'word', label: 'Word', sublabel: '("king")', type: 'input' },
                { id: 'vector', label: 'Vector', sublabel: '([0.8, 0.3, ...])', type: 'process' },
                { id: 'direction', label: 'Direction', sublabel: 'in space', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            This is one of the biggest ideas in AI: <strong>meaning is geometry</strong>. Similar
            things end up near each other. Different things end up far apart. And the AI doesn&apos;t
            need to &quot;understand&quot; language the way you do &mdash; it just needs to learn
            which directions go with which meanings. We&apos;ll explore this much deeper in the
            Word Embeddings lesson, but for now, just remember: vectors are arrows, and in AI,
            those arrows carry meaning.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="The three ideas you actually need">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            All the math behind AI boils down to three concepts. They build on each other, and
            once you see how they connect, the whole picture clicks. Step through them below.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Idea 1: Vectors',
                content: (
                  <div className="space-y-4">
                    <p>
                      A vector is an <strong className="text-white">arrow with direction and
                      length</strong>. In practice, it&apos;s just a list of numbers. The
                      number [3, 2] means &quot;go 3 units right and 2 units up.&quot;
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-5 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">A number</span>
                        <div className="text-white text-lg mt-1 font-mono">42</div>
                        <div className="text-gray-400 text-xs mt-1">1 dimension</div>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-5 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">A vector</span>
                        <div className="text-white text-lg mt-1 font-mono">[3, 2]</div>
                        <div className="text-gray-400 text-xs mt-1">2 dimensions</div>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-5 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">An AI vector</span>
                        <div className="text-white text-lg mt-1 font-mono">[0.8, 0.3, ...]</div>
                        <div className="text-gray-400 text-xs mt-1">768+ dimensions</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      AI models use vectors with hundreds or thousands of dimensions. We can&apos;t
                      visualize 768 dimensions, but the math works the same as 2D. Similar
                      things have vectors that point in similar directions.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Idea 2: Dot Product',
                content: (
                  <div className="space-y-4">
                    <p>
                      The dot product tells you <strong className="text-white">how similar two
                      vectors are</strong>. Multiply matching components and add them up.
                      That&apos;s the whole formula.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">A</span>
                        <div className="text-white text-sm mt-1 font-mono">[3, 2]</div>
                      </div>
                      <div className="text-gray-400 text-xl font-bold">&middot;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">B</span>
                        <div className="text-white text-sm mt-1 font-mono">[4, 1]</div>
                      </div>
                      <div className="text-gray-400 text-xl">=</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Result</span>
                        <div className="text-white text-sm mt-1 font-mono">3x4 + 2x1 = 14</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><strong className="text-green-400">Positive</strong> dot product = vectors point in the same general direction = similar</p>
                      <p><strong className="text-amber-400">Zero</strong> dot product = vectors are perpendicular = unrelated</p>
                      <p><strong className="text-red-400">Negative</strong> dot product = vectors point in opposite directions = opposite</p>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Idea 3: Gradients',
                content: (
                  <div className="space-y-4">
                    <p>
                      A gradient answers the question: <strong className="text-white">&quot;which
                      direction should I move to improve?&quot;</strong> Picture yourself standing
                      on a hilly landscape, blindfolded. The gradient tells you which way is
                      downhill.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-red-400 text-sm font-medium">High error</span>
                        <div className="text-white text-xs mt-1">Loss: 2.4</div>
                      </div>
                      <div className="text-amber-400 text-lg">&darr; gradient</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Getting better</span>
                        <div className="text-white text-xs mt-1">Loss: 0.8</div>
                      </div>
                      <div className="text-green-400 text-lg">&darr; gradient</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Low error</span>
                        <div className="text-white text-xs mt-1">Loss: 0.01</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This is called <strong className="text-white">gradient descent</strong>, and it&apos;s
                      how every neural network learns. Calculate the gradient, take a step
                      downhill, repeat. The &quot;hill&quot; is the error landscape, and
                      &quot;downhill&quot; means less error. That&apos;s the whole trick.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-gray-700 leading-relaxed">
            And that&apos;s the trio. <strong>Vectors</strong> represent data &mdash; words,
            images, anything. <strong>Dot products</strong> measure similarity &mdash; how
            close two things are in meaning. <strong>Gradients</strong> guide learning &mdash;
            they tell the model which direction to adjust its numbers to get better at its job.
            Every AI system you&apos;ve ever used relies on these three ideas working together.
          </p>

          <GoDeeper title="What about matrices?">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                You&apos;ve probably heard the word &quot;matrix&quot; thrown around in AI
                discussions. A matrix is just a grid of numbers &mdash; think of a spreadsheet.
                If a vector is a single list like [3, 2], a matrix is a table with rows and
                columns.
              </p>
              <p className="text-gray-700">
                What do matrices <em>do</em>? They transform vectors. A matrix can rotate a
                vector, stretch it, squish it, or project it into a different space. When a
                neural network processes your input, it&apos;s essentially multiplying your
                input vector by a bunch of matrices, one after another. Each matrix transforms
                the data in a different way, and the network learns what those transformations
                should be.
              </p>
              <p className="text-gray-700">
                Matrix multiplication is also the reason GPUs are so important for AI. GPUs were
                originally designed for graphics &mdash; which is all about multiplying matrices
                very quickly. It turns out that&apos;s exactly what AI training needs too.
                The same hardware that renders video games also trains language models.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Time to get hands-on. Below you have two vectors on a grid. Use the sliders to
            change their direction and watch what happens to the dot product. Try making them
            point the same way (positive dot product), opposite ways (negative), and at right
            angles to each other (near zero). Notice how the similarity label changes &mdash;
            this is exactly the math AI uses to decide if two words or concepts are related.
          </p>

          <MathIntuitionSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Vectors are just arrows (lists of numbers) that represent direction and magnitude. AI uses them to represent everything — words, images, user preferences — as points in a high-dimensional space.',
            'The dot product measures how similar two vectors are. Positive means same direction (similar), zero means perpendicular (unrelated), negative means opposite. This is how AI computes similarity between words and concepts.',
            'Gradients tell you which direction is "downhill" — which way to adjust numbers to reduce error. Gradient descent is the core algorithm behind how every neural network learns.',
            'You don\'t need to memorize formulas. The intuition — directions, similarity, and downhill — is what matters for understanding how AI systems work.',
            'These three concepts (vectors, dot products, gradients) are the mathematical foundation for everything from search engines to ChatGPT. They\'re simpler than they sound.',
          ]}
          misconceptions={[
            '"You need calculus to understand AI concepts." — The core intuition is geometric: arrows, similarity, and rolling downhill. Calculus makes the proofs rigorous, but the ideas are accessible without it.',
            '"Vectors aren\'t just math — they\'re how AI sees the world." — This is actually true, not a misconception! Every piece of data an AI model processes gets converted into vectors. Understanding vectors is understanding how AI perceives information.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Two word vectors have a large positive dot product. What does this tell you about those words?"
          options={[
            { text: 'They are spelled similarly', isCorrect: false },
            { text: 'They point in similar directions, meaning they have related meanings', isCorrect: true },
            { text: 'They are exact synonyms', isCorrect: false },
            { text: 'One word is the opposite of the other', isCorrect: false },
          ]}
          explanation="A large positive dot product means the two vectors point in a similar direction in the high-dimensional space where AI represents words. This indicates the words have related meanings — not necessarily that they're synonyms, but that they tend to appear in similar contexts and share semantic properties. For example, 'doctor' and 'nurse' would have a high positive dot product because they're semantically related, even though they're different words."
        />
      </LessonSection>
    </div>
  );
}
