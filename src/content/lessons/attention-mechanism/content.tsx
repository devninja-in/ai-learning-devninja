'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import AttentionSim from '@/components/simulations/AttentionSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function AttentionMechanismContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Think about how you read this sentence. Your eyes don&apos;t give equal
            importance to every word &mdash; they automatically focus on the words
            that matter most for understanding. When you read &quot;The bank by the
            river was steep,&quot; your brain instantly connects &quot;bank&quot; to
            &quot;river&quot; rather than to money. That&apos;s attention. And teaching
            machines to do the same thing is what transformed AI.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Before attention, neural networks for language had a brutal limitation.
            RNNs processed words one at a time, carrying a hidden state forward like
            a game of telephone. By the time you reached the end of a long sentence,
            the information from the beginning had degraded into mush. Imagine trying
            to translate a 50-word German sentence into English, but you could only
            look at the sentence through a tiny, foggy window that showed you one word
            at a time and a fading summary of everything before it.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Attention blew that window wide open. Instead of being forced to process
            sequentially, the model can now look at <em>every</em> word in the
            sentence at once and decide, for each word, which other words matter most.
            It&apos;s the single most important idea in modern AI &mdash; the mechanism
            that made transformers possible, that enabled GPT, BERT, Claude, and every
            large language model you&apos;ve ever used.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Learning where to look">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            RNNs process sequentially &mdash; by the time you reach word 50, you&apos;ve
            half-forgotten word 1. Attention flips this around completely. Instead of
            forcing information to flow through a chain of hidden states, attention lets
            the model look at <strong>all words at once</strong> and decide which ones
            matter for each prediction.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Here&apos;s the core idea: for every word in a sentence, the model asks
            &quot;which other words should I pay attention to in order to understand
            <em>this</em> word?&quot; When processing the word &quot;it&quot; in
            &quot;The cat sat on the mat because it was tired,&quot; the model learns
            to attend strongly to &quot;cat&quot; &mdash; because &quot;it&quot;
            refers to the cat. No sequential processing required. No information
            bottleneck. Just a direct lookup across the entire sequence.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The attention pipeline"
              nodes={[
                { id: 'query', label: 'Query', sublabel: '"What am I looking for?"', type: 'input' },
                { id: 'compare', label: 'Compare with all Keys', sublabel: 'Dot products', type: 'process' },
                { id: 'weights', label: 'Attention Weights', sublabel: 'Softmax scores', type: 'attention' },
                { id: 'sum', label: 'Weighted sum of Values', sublabel: 'Combine info', type: 'process' },
                { id: 'output', label: 'Output', sublabel: 'Context-aware representation', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            This mechanism is called <strong>self-attention</strong> because every word
            in the sentence attends to every other word in the <em>same</em> sentence.
            It&apos;s what allows a model to build context-aware representations where
            the meaning of each word is informed by the entire sentence around it.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="The mechanics of attention">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Attention looks magical on the surface, but the mechanics are surprisingly
            elegant. It all comes down to three projections, a dot product, and a weighted
            sum. Let&apos;s break it down step by step.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Query, Key, Value',
                content: (
                  <div className="space-y-4">
                    <p>
                      Every word in the sentence gets transformed into three different vectors
                      using learned weight matrices. These three representations each play a
                      distinct role:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Query (Q)</span>
                        <div className="text-white text-xs mt-2">
                          &quot;What am I looking for?&quot; The question this word asks
                          about its context.
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Key (K)</span>
                        <div className="text-white text-xs mt-2">
                          &quot;What do I contain?&quot; The label this word advertises
                          to other words.
                        </div>
                      </div>
                      <div className="border-2 border-emerald-500/50 bg-emerald-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-emerald-400 text-sm font-medium">Value (V)</span>
                        <div className="text-white text-xs mt-2">
                          &quot;What information do I carry?&quot; The actual content
                          to pass along if selected.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Think of it like a library. The Query is your search term, the Keys are
                      book titles on the shelf, and the Values are the actual book contents.
                      You compare your search term against every title to figure out which
                      books are relevant, then read those books.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Attention Scores',
                content: (
                  <div className="space-y-4">
                    <p>
                      To figure out how relevant each word is, we compute the <strong
                      className="text-white">dot product</strong> of the Query vector
                      with every Key vector. A high dot product means the query and key
                      are pointing in similar directions &mdash; they&apos;re relevant to
                      each other.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Q</span>
                        <div className="text-white text-xs mt-1 font-mono">&quot;it&quot;</div>
                      </div>
                      <div className="text-gray-500 text-xl">&middot;</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">K</span>
                        <div className="text-white text-xs mt-1 font-mono">each word</div>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Scores</span>
                        <div className="text-white text-xs mt-1 font-mono">softmax &rarr; weights</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The raw dot-product scores are then passed through <strong
                      className="text-gray-300">softmax</strong> to convert them into
                      probabilities that sum to 1. This is the attention distribution:
                      it tells the model what fraction of its &quot;focus&quot; to put on
                      each word. Words with higher scores get more attention.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Weighted Sum',
                content: (
                  <div className="space-y-4">
                    <p>
                      Now we have a set of attention weights &mdash; one for each word in
                      the sentence. The final step is simple: multiply each word&apos;s
                      <strong className="text-white"> Value vector</strong> by its attention
                      weight, and sum them all up.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Weights</span>
                        <div className="text-white text-xs mt-1 font-mono">[0.35, 0.05, ...]</div>
                      </div>
                      <div className="text-gray-500 text-xl">&times;</div>
                      <div className="border-2 border-emerald-500 bg-emerald-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-emerald-400 text-sm font-medium">Values</span>
                        <div className="text-white text-xs mt-1 font-mono">[V_cat, V_sat, ...]</div>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Output</span>
                        <div className="text-white text-xs mt-1 font-mono">&Sigma; w_i &middot; V_i</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The result is a new representation for the query word that now
                      &quot;attends to&quot; the most relevant context. If &quot;it&quot;
                      attends strongly to &quot;cat,&quot; then the output vector for
                      &quot;it&quot; will heavily incorporate information from &quot;cat.&quot;
                      The word hasn&apos;t changed, but its representation now knows what
                      it refers to.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Multi-Head Attention',
                content: (
                  <div className="space-y-4">
                    <p>
                      A single attention operation captures one type of relationship.
                      But language is rich with many simultaneous patterns: syntax,
                      coreference, semantic similarity, positional proximity.{' '}
                      <strong className="text-white">Multi-head attention</strong> runs
                      multiple attention operations in parallel, each with its own
                      learned Q, K, V projections.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Head 1</span>
                        <div className="text-white text-xs mt-2">
                          Learns <em>coreference</em>:
                          &quot;it&quot; &rarr; &quot;cat&quot;
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Head 2</span>
                        <div className="text-white text-xs mt-2">
                          Learns <em>syntax</em>:
                          subject &rarr; verb agreement
                        </div>
                      </div>
                      <div className="border-2 border-emerald-500/50 bg-emerald-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-emerald-400 text-sm font-medium">Head 3</span>
                        <div className="text-white text-xs mt-2">
                          Learns <em>semantics</em>:
                          &quot;bank&quot; &rarr; &quot;river&quot;
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Each head operates on a smaller slice of the embedding dimensions
                      (if d=512 and we have 8 heads, each head works with 64 dimensions).
                      After all heads compute their attention independently, their outputs
                      are concatenated and projected back to the full dimension. This is
                      computationally efficient and captures richer patterns than any
                      single attention operation could.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Scaled dot-product attention, cross-attention, and complexity">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Scaled dot-product attention</strong> divides the dot-product
                scores by &radic;d_k (the square root of the key dimension) before
                applying softmax. Why? Without scaling, when the embedding dimension is
                large, dot products can grow very large in magnitude, pushing softmax
                into regions where gradients are extremely small. Dividing by &radic;d_k
                keeps the values in a range where softmax produces useful gradients. The
                formula is: Attention(Q, K, V) = softmax(QK&sup1; / &radic;d_k)V.
              </p>
              <p className="text-gray-700">
                <strong>Self-attention vs. cross-attention:</strong> In self-attention,
                Q, K, and V all come from the same sequence &mdash; the model attends to
                itself. In cross-attention, the Queries come from one sequence (e.g., the
                decoder) while Keys and Values come from another (e.g., the encoder). This
                is how translation models connect the source language to the target language,
                and how vision-language models connect image features to text.
              </p>
              <p className="text-gray-700">
                <strong>Computational complexity:</strong> Self-attention has O(n&sup2;)
                complexity where n is the sequence length, because every token must
                compare with every other token. For a 1000-token sequence, that&apos;s
                1 million comparisons. This is why long-context models are expensive and
                why researchers are developing efficient attention variants (sparse
                attention, linear attention, Flash Attention) that reduce this cost while
                preserving most of the quality.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Watch attention in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s an interactive visualization of attention weights. Click any word
            to see how it &quot;attends&quot; to the rest of the sentence. The lines
            connecting words show attention strength &mdash; thicker lines mean higher
            weights. Toggle to Multi-Head mode to see how different attention heads capture
            different patterns simultaneously.
          </p>

          <AttentionSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Attention lets a model look at every word in a sequence simultaneously and decide which words are most relevant to each other. This eliminates the RNN bottleneck where information had to pass through a chain of hidden states.',
            'Every word is projected into three vectors: Query (what it\'s looking for), Key (what it advertises), and Value (what information it carries). Attention scores are computed by the dot product of Queries with Keys, then used to create a weighted sum of Values.',
            'Multi-head attention runs multiple attention operations in parallel, each learning different types of relationships (syntax, coreference, semantics, position). This gives the model a rich, multi-faceted understanding of context.',
            'Attention is O(n squared) in sequence length, which makes it expensive for very long sequences. This tradeoff — attending to everything at once gives quality but costs compute — drives much of modern LLM architecture research.',
            'The attention mechanism, introduced in 2014 for machine translation and generalized in 2017\'s "Attention Is All You Need," is the foundational building block of every modern transformer-based language model.',
          ]}
          misconceptions={[
            '"Attention means the model understands meaning." — Attention learns statistical correlations between positions. When "it" attends to "cat," the model hasn\'t understood coreference in a human sense — it has learned that tokens in the position and context of "it" tend to correlate with tokens like "cat" in training data. The effect looks like understanding, but the mechanism is pattern matching.',
            '"More attention heads always means better performance." — There\'s diminishing returns. Research has shown that many attention heads in trained models are redundant and can be pruned without significant quality loss. The optimal number of heads depends on the task, model size, and embedding dimension.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What does the attention mechanism allow that RNNs cannot do efficiently?"
          options={[
            { text: 'Process inputs of variable length', isCorrect: false },
            { text: 'Attend to any word in the sequence regardless of distance', isCorrect: true },
            { text: 'Use backpropagation to learn weights', isCorrect: false },
            { text: 'Generate text one token at a time', isCorrect: false },
          ]}
          explanation="RNNs can already handle variable-length inputs and use backpropagation — those aren't the limitations attention solves. The core problem with RNNs is that information from distant words must pass through a chain of hidden states, degrading as it goes (the vanishing gradient problem). Attention bypasses this entirely: every word can directly attend to every other word regardless of how far apart they are in the sequence. A word at position 100 can attend to a word at position 1 just as easily as to its neighbor. This direct access, combined with the ability to process all positions in parallel (unlike sequential RNN processing), is what made attention the foundation of modern transformers."
        />
      </LessonSection>
    </div>
  );
}
