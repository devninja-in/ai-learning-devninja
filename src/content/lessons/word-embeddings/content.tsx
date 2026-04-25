'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import EmbeddingsSim from '@/components/simulations/EmbeddingsSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function WordEmbeddingsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            What if I told you that a computer can figure out that &quot;king&quot;
            is to &quot;queen&quot; as &quot;man&quot; is to &quot;woman&quot; &mdash;
            without anyone teaching it what royalty or gender means? Just by reading
            a lot of text. That&apos;s the magic of word embeddings, and it&apos;s
            one of the most beautiful ideas in AI.
          </p>

          <p className="text-gray-700 leading-relaxed">
            In the last few lessons, we saw how Bag of Words and TF-IDF turn text
            into numbers. They work, but they have a fatal flaw: they treat every
            word as a completely independent thing. To those methods, &quot;happy&quot;
            and &quot;joyful&quot; are no more related than &quot;happy&quot; and
            &quot;refrigerator.&quot; That&apos;s a problem if you want AI to
            actually understand meaning.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Word embeddings fix this. Instead of giving each word a single number
            or a sparse count, they give each word a rich, dense vector &mdash; a
            list of numbers that encodes what the word <em>means</em>. Words with
            similar meanings end up with similar vectors. And the math that falls
            out of this is genuinely stunning.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Words as points in space">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s the core idea: what if every word in the English language
            were a point in space? Not a boring 2D space &mdash; imagine a space
            with 300 dimensions. You can&apos;t visualize it, but the math
            works perfectly. In this space, words that appear in similar contexts
            would naturally end up near each other.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Think about the word &quot;cat.&quot; Where does it show up in text?
            Near words like &quot;pet,&quot; &quot;fur,&quot; &quot;purr,&quot;
            and &quot;kitten.&quot; Now think about &quot;dog.&quot; It shows up
            near &quot;pet,&quot; &quot;bark,&quot; &quot;leash,&quot; and
            &quot;puppy.&quot; Because &quot;cat&quot; and &quot;dog&quot; share
            so much context &mdash; both are pets, both are furry animals &mdash;
            they end up close together in the embedding space.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The linguist J.R. Firth put it best back in 1957: <em>&quot;You
            shall know a word by the company it keeps.&quot;</em> That one
            sentence is basically the entire theory behind word embeddings.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="From word to vector"
              nodes={[
                { id: 'word', label: 'Word', sublabel: '"cat"', type: 'input' },
                { id: 'model', label: 'Embedding Model', sublabel: 'learned from text', type: 'process' },
                { id: 'vector', label: 'Dense Vector', sublabel: '[0.2, -0.5, 0.8, ...]', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            Each number in the vector captures some aspect of the word&apos;s
            meaning. One dimension might roughly correspond to &quot;is this an
            animal?&quot; Another might be &quot;is this something you eat?&quot;
            In practice, the dimensions don&apos;t map to clean human concepts
            &mdash; they&apos;re messy statistical patterns. But the overall
            effect is that similar words get similar vectors, and that&apos;s
            incredibly powerful.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="How machines learn meaning">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Word embeddings aren&apos;t hand-crafted. Nobody sat down and
            decided that &quot;cat&quot; should be [0.2, &minus;0.5, 0.8, ...].
            Instead, a neural network learns these vectors by reading vast
            amounts of text. Here&apos;s the process, step by step.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'The Distributional Hypothesis',
                content: (
                  <div className="space-y-4">
                    <p>
                      The whole approach rests on a single insight: <strong className="text-white">words
                      that appear in similar contexts have similar meanings.</strong> It&apos;s
                      a fancy way of saying that if two words are often surrounded by the same
                      other words, they probably mean something related.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-2 text-center">
                        <div className="text-blue-400 text-sm font-medium mb-1">Fill in the blank</div>
                        <div className="text-white text-sm font-mono">&quot;The ___ sat on the mat&quot;</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      What words fit? Cat, dog, hamster, rabbit. They all work because they appear
                      in similar contexts. That shared context is what gives them similar embeddings.
                      You don&apos;t need to tell the model that these are all animals &mdash; it
                      figures it out from the patterns.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Word2Vec — Learning from Context',
                content: (
                  <div className="space-y-4">
                    <p>
                      <strong className="text-white">Word2Vec</strong> (2013, Google) was the breakthrough.
                      It&apos;s a simple neural network trained on one task: given a word, predict the
                      words around it (or vice versa). The embeddings are a <em>side effect</em> of this
                      training.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-blue-400 text-sm font-medium mb-1">Skip-gram</div>
                        <div className="text-white text-sm">Given center word, predict context words</div>
                        <div className="text-gray-500 text-xs mt-1">&quot;cat&quot; &rarr; &quot;the,&quot; &quot;sat,&quot; &quot;on&quot;</div>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-purple-400 text-sm font-medium mb-1">CBOW</div>
                        <div className="text-white text-sm">Given context words, predict center word</div>
                        <div className="text-gray-500 text-xs mt-1">&quot;the,&quot; &quot;sat,&quot; &quot;on&quot; &rarr; &quot;cat&quot;</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The network never learns to do the prediction task perfectly &mdash; that&apos;s
                      not the point. The point is that <em>the weights of the hidden layer become
                      the word vectors.</em> After training on billions of words, similar words end
                      up with similar weights. The prediction task is just a clever excuse to learn
                      good representations.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Vector Arithmetic — The Magic',
                content: (
                  <div className="space-y-4">
                    <p>
                      Here&apos;s where it gets wild. Once you have word vectors, you can do
                      <strong className="text-white"> math on meaning.</strong> The most famous example:
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 my-6 text-sm">
                      <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded font-mono">king</span>
                      <span className="text-red-400 font-bold">&minus;</span>
                      <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded font-mono">man</span>
                      <span className="text-green-400 font-bold">+</span>
                      <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded font-mono">woman</span>
                      <span className="text-gray-400">&asymp;</span>
                      <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded font-mono font-bold">queen</span>
                    </div>

                    <p className="text-sm text-gray-400">
                      Why does this work? Because &quot;king&quot; and &quot;man&quot; differ by the
                      concept of royalty. &quot;Woman&quot; and &quot;man&quot; differ by gender. So
                      &quot;king &minus; man&quot; isolates the royalty direction, and adding it to
                      &quot;woman&quot; lands you right near &quot;queen.&quot; Gender and royalty are
                      encoded as <em>directions</em> in the vector space. The model learned these
                      concepts entirely on its own, just from reading text.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Beyond Word2Vec: GloVe, FastText, and contextual embeddings">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>GloVe</strong> (Stanford, 2014) takes a different approach: instead of
                predicting context words one at a time, it builds a giant word co-occurrence
                matrix from the entire corpus, then factors it into dense vectors. The result
                is similar to Word2Vec, but GloVe explicitly captures global statistics, which
                can give better results on analogy tasks.
              </p>
              <p className="text-gray-700">
                <strong>FastText</strong> (Facebook, 2016) improves on Word2Vec by breaking
                words into subword pieces. The vector for &quot;unhappiness&quot; is built from
                the vectors for &quot;un,&quot; &quot;happy,&quot; and &quot;ness.&quot; This
                means FastText can generate vectors for words it has never seen before &mdash;
                a huge advantage for languages with rich morphology or lots of rare words.
              </p>
              <p className="text-gray-700">
                <strong>Contextual embeddings</strong> (ELMo 2018, BERT 2018, GPT) go even
                further. In Word2Vec, the word &quot;bank&quot; gets one vector, whether you
                mean a river bank or a savings bank. Models like BERT give <em>different</em>
                vectors depending on the surrounding sentence. This is the technology that
                powers modern language models. We&apos;ll explore it in depth in the
                Transformer lesson.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Below is a simplified 2D embedding space with about 20 words plotted by
            meaning. Click any word to see its three nearest neighbors and their
            similarity scores. Try the search box to see where a new word would
            land. And don&apos;t miss the &quot;King &minus; Man + Woman = ?&quot;
            demo &mdash; toggle it on to see vector arithmetic in action, with
            arrows showing each step.
          </p>

          <EmbeddingsSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Word embeddings represent each word as a dense vector of numbers (typically 100-300 dimensions). Words with similar meanings get similar vectors, because they appear in similar contexts.',
            'Word2Vec learns embeddings by training a neural network to predict context words. The vectors are a side effect of this training process, not the primary goal.',
            'Vector arithmetic works on word embeddings: "king - man + woman = queen" works because concepts like gender and royalty are encoded as directions in the vector space.',
            'Similarity between word embeddings is measured by cosine similarity or Euclidean distance. Words close together in the space are semantically related.',
            'Modern models like BERT produce contextual embeddings, giving different vectors for the same word depending on context (solving the "bank" ambiguity problem).',
          ]}
          misconceptions={[
            '"Embeddings understand meaning the way humans do." -- They don\'t. They capture statistical patterns of word co-occurrence. A word embedding doesn\'t know what a cat looks like or sounds like -- it just knows that "cat" appears in similar contexts to "dog" and "pet."',
            '"Similar spelling means similar embeddings." -- Nope. "Cat" and "catapult" have very different embeddings despite sharing letters. What matters is context, not spelling. "Sofa" and "couch" have very similar embeddings despite looking completely different.',
            '"King - Man + Woman = Queen works perfectly every time." -- It\'s a beautiful demo, but in practice vector arithmetic is noisy. The result is usually close to "queen" but not exactly "queen." It works best on well-represented relationships in the training data.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question='What makes two word embeddings similar (close together in the vector space)?'
          options={[
            { text: 'The words have similar spelling or share letters', isCorrect: false },
            { text: 'The words appear in similar contexts in training text', isCorrect: true },
            { text: 'The words have the same number of syllables', isCorrect: false },
            { text: 'A human expert manually marked them as synonyms', isCorrect: false },
          ]}
          explanation='Word embeddings are learned from context, not from spelling or manual labels. Two words get similar vectors because they tend to appear in similar surrounding contexts -- for example, "cat" and "dog" both appear near words like "pet," "feed," and "furry." This is the distributional hypothesis: meaning comes from context. Spelling is irrelevant -- "cat" and "catapult" have completely different embeddings despite sharing the same first three letters.'
        />
      </LessonSection>
    </div>
  );
}
