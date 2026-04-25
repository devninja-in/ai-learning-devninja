'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import TransformerSim from '@/components/simulations/TransformerSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function TransformerArchitectureContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            In 2017, a team at Google published a paper called &quot;Attention Is All You
            Need.&quot; Bit of an understatement, honestly. That paper introduced the
            Transformer &mdash; the architecture behind GPT, BERT, Claude, Llama, and
            basically every AI system making headlines today. If neural networks are the
            engine, the Transformer is the specific engine design that changed everything.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Before Transformers, the best language models were RNNs and LSTMs. They worked,
            but they had a fundamental bottleneck: they processed words one at a time, left
            to right, carrying information forward in a hidden state. This meant two things.
            First, they were slow &mdash; you couldn&apos;t parallelize sequential
            processing across a GPU. Second, long-range dependencies still got lost despite
            LSTM gates doing their best to preserve them.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The Transformer threw away recurrence entirely. No hidden states passed
            word-by-word. Instead, it used self-attention (which we covered in the last
            lesson) to let every word look at every other word simultaneously. The result
            was a model that could be trained on massive amounts of data, scale to billions
            of parameters, and process sequences in parallel. The era of large language
            models had begun.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="The architecture that changed everything">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            So what makes the Transformer so special? Three things, really. First,
            <strong> parallel processing</strong> &mdash; unlike RNNs that process one token
            at a time, the Transformer processes the entire sequence at once. This maps
            beautifully to GPU hardware, where doing thousands of operations simultaneously
            is cheap. Second, <strong>long-range connections</strong> &mdash; every token
            can attend directly to every other token, no matter how far apart they are.
            The word at position 1 is just as accessible as the word at position 500.
            Third, <strong>scalability</strong> &mdash; you can make the model bigger
            (more layers, wider embeddings, more heads) and it keeps getting better,
            following remarkably predictable scaling laws.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The full Transformer architecture stacks a simple block over and over.
            Each block takes in a sequence of vectors, refines them through attention
            and feed-forward layers, and passes the result to the next block. Here&apos;s
            the high-level flow:
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The Transformer pipeline"
              nodes={[
                { id: 'tokens', label: 'Input Tokens', sublabel: 'From tokenizer', type: 'input' },
                { id: 'embed', label: 'Embeddings + Position', sublabel: 'Vectors with order', type: 'process' },
                { id: 'blocks', label: 'Transformer Blocks x N', sublabel: 'Attention + FFN', type: 'attention' },
                { id: 'output', label: 'Output', sublabel: 'Next-token probabilities', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            That&apos;s it at the top level. The magic is in what happens inside each
            Transformer block &mdash; and how stacking them creates increasingly
            sophisticated representations. Let&apos;s open one up.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Inside the Transformer">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            A Transformer block is a carefully designed sequence of sublayers, each
            performing a specific job. Data flows bottom to top, getting refined at each
            stage. Let&apos;s walk through each component.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Input Embeddings + Positional Encoding',
                content: (
                  <div className="space-y-4">
                    <p>
                      First, each input token is mapped to a dense vector using an embedding
                      table &mdash; the same kind of embedding we covered in the Word
                      Embeddings lesson. But there&apos;s a problem: self-attention treats
                      all positions equally. It has no built-in sense of order. &quot;Dog
                      bites man&quot; and &quot;Man bites dog&quot; would produce identical
                      attention patterns.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Token Embedding</span>
                        <div className="text-white text-xs mt-2">
                          Maps each token ID to a d_model-dimensional vector.
                          &quot;cat&quot; &rarr; [0.23, -0.15, 0.82, ...]
                        </div>
                      </div>
                      <div className="border-2 border-indigo-500/50 bg-indigo-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-indigo-400 text-sm font-medium">Positional Encoding</span>
                        <div className="text-white text-xs mt-2">
                          A unique vector for each position, added to the embedding.
                          Position 0 &rarr; [0.00, 1.00, 0.00, ...]
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The positional encoding tells the model <em>where</em> each token
                      sits in the sequence. The original Transformer used sinusoidal
                      functions (sines and cosines at different frequencies), which lets
                      the model generalize to longer sequences than it saw during training.
                      Modern models like GPT often use learned position embeddings instead.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Multi-Head Self-Attention',
                content: (
                  <div className="space-y-4">
                    <p>
                      Each token attends to every other token in the sequence. We covered
                      this in the Attention lesson &mdash; the Query/Key/Value mechanism
                      with multiple heads running in parallel. Each head learns to focus
                      on different types of relationships.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Head 1</span>
                        <div className="text-white text-xs mt-2">
                          &quot;Who does this pronoun refer to?&quot;
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Head 2</span>
                        <div className="text-white text-xs mt-2">
                          &quot;What&apos;s the subject of this verb?&quot;
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Head 3</span>
                        <div className="text-white text-xs mt-2">
                          &quot;Which nearby words modify this noun?&quot;
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      In the original Transformer, d_model=512 was split across 8 heads,
                      so each head worked with 64 dimensions. GPT-3 uses 96 heads with
                      d_model=12288 (128 dims per head). The head outputs are concatenated
                      and projected back to the full d_model dimension.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Add & Normalize',
                content: (
                  <div className="space-y-4">
                    <p>
                      After attention, two critical operations happen. First, a
                      <strong className="text-white"> residual connection</strong>: the
                      input to the attention layer is added directly to its output. This
                      creates a shortcut path, like a highway on-ramp that bypasses traffic.
                      Gradients can flow directly through the skip connection during
                      backpropagation, preventing them from vanishing in deep networks.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-gray-500 bg-gray-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-gray-400 text-sm font-medium">Input x</span>
                      </div>
                      <div className="text-gray-500 text-xl">+</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Attention(x)</span>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">LayerNorm</span>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-emerald-500 bg-emerald-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-emerald-400 text-sm font-medium">Output</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Second, <strong className="text-gray-300">layer normalization</strong>{' '}
                      standardizes the values at each position to have zero mean and unit
                      variance. This keeps activations in a healthy range and makes training
                      much more stable. Without these two operations, training a 96-layer
                      transformer would be essentially impossible.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Feed-Forward Network',
                content: (
                  <div className="space-y-4">
                    <p>
                      After attention has gathered context from across the sequence, each
                      position gets processed independently through a small feed-forward
                      network. It&apos;s two linear transformations with a ReLU (or GELU)
                      activation in between:
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Linear 1</span>
                        <div className="text-white text-xs mt-1 font-mono">d_model &rarr; 4 * d_model</div>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-pink-500 bg-pink-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-pink-400 text-sm font-medium">ReLU / GELU</span>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Linear 2</span>
                        <div className="text-white text-xs mt-1 font-mono">4 * d_model &rarr; d_model</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Research suggests this is where the model stores factual knowledge.
                      The FFN expands to a higher dimension (typically 4x), applies a
                      nonlinearity, then projects back down. Think of it as the model
                      &quot;thinking&quot; about the context it just gathered from attention.
                      Another residual connection + layer norm follows this layer too.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 5: Stack N Times',
                content: (
                  <div className="space-y-4">
                    <p>
                      The complete block &mdash; attention, add&amp;norm, FFN, add&amp;norm
                      &mdash; is repeated N times. The original Transformer used N=6.
                      GPT-2 used 48 layers. GPT-4 is rumored to use 120+ layers. Each
                      layer refines the representation further:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Early layers</span>
                        <div className="text-white text-xs mt-2">
                          Surface patterns: word identity, position, basic syntax
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Middle layers</span>
                        <div className="text-white text-xs mt-2">
                          Semantic meaning: coreference, entity types, relationships
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Late layers</span>
                        <div className="text-white text-xs mt-2">
                          Task-specific: next-token prediction, classification, generation
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This progressive refinement is key. A single attention layer can
                      capture direct relationships. But stacking many layers lets the model
                      build <em>compositions</em> of relationships &mdash; attending to
                      things that attended to other things. This compositional depth is what
                      gives Transformers their remarkable capabilities.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <div className="prose prose-gray max-w-none space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Encoder vs. Decoder
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The original Transformer paper actually described <em>two</em> stacks: an
              encoder and a decoder. They share the same basic building blocks, but differ
              in important ways:
            </p>
            <p className="text-gray-700 leading-relaxed">
              The <strong>encoder</strong> sees the entire input at once. Every token can
              attend to every other token, including tokens that come later in the sequence.
              This is called <em>bidirectional</em> attention. BERT is the most famous
              encoder-only model &mdash; it&apos;s great for understanding tasks like
              classification and question answering because it can see the full context.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The <strong>decoder</strong> can only look at past tokens. It uses a causal
              mask to prevent each token from attending to future tokens &mdash; after all,
              during generation, those future tokens don&apos;t exist yet. GPT, Claude, and
              Llama are all decoder-only models. In encoder-decoder models (like the
              original Transformer, T5, and BART), the decoder also has cross-attention
              layers that let it look at the encoder&apos;s output. This is how translation
              models connect source and target languages.
            </p>
          </div>

          <GoDeeper title="Positional encoding, residual connections, and the scaling hypothesis">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Sinusoidal positional encoding</strong> uses sine and cosine functions
                at different frequencies to create a unique vector for each position. The
                formula is PE(pos, 2i) = sin(pos / 10000^(2i/d_model)) and PE(pos, 2i+1) =
                cos(pos / 10000^(2i/d_model)). The key insight is that relative positions can
                be represented as linear functions of these encodings, so the model can learn to
                attend to &quot;the word 3 positions back&quot; without seeing that exact pattern
                in training. Modern models often use Rotary Position Embeddings (RoPE), which
                encode position directly into the attention computation rather than adding to
                the embeddings.
              </p>
              <p className="text-gray-700">
                <strong>Why residual connections matter:</strong> Without skip connections,
                training a 96-layer network would fail completely. The gradients during
                backpropagation would either vanish (becoming too small to update early layers)
                or explode (becoming so large they destabilize training). Residual connections
                provide a &quot;gradient highway&quot; that lets the learning signal pass
                directly from the loss function to early layers. They also make the
                optimization landscape smoother &mdash; the loss surface of a deep residual
                network looks like gentle hills rather than jagged cliffs.
              </p>
              <p className="text-gray-700">
                <strong>The scaling hypothesis:</strong> One of the most surprising discoveries
                about Transformers is that their performance scales predictably with three
                factors: model size (parameters), dataset size (tokens), and compute (FLOPs).
                These &quot;scaling laws,&quot; described by Kaplan et al. (2020), show that
                loss decreases as a power law with each factor. This predictability is why
                organizations invest billions in training ever-larger models &mdash; the
                returns are remarkably consistent. The Transformer architecture seems uniquely
                suited to this scaling behavior, though researchers are still debating exactly why.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Explore the Transformer block">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s an interactive Transformer block visualizer. Click any layer to
            see what it does and the tensor dimensions flowing through it. Toggle between
            Encoder and Decoder to see how the architectures differ. Hit &quot;Process&quot;
            to watch animated data flow through the entire block.
          </p>

          <TransformerSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'The Transformer processes entire sequences in parallel using self-attention, eliminating the sequential bottleneck of RNNs. This parallelism maps perfectly to GPU hardware and is the key reason Transformers can scale to billions of parameters.',
            'Each Transformer block follows a consistent pattern: Multi-Head Attention -> Add & Norm -> Feed-Forward Network -> Add & Norm. This pattern repeats 6 to 96+ times, with each layer refining the representation further.',
            'Positional encoding is essential because self-attention has no built-in sense of word order. Without it, "dog bites man" and "man bites dog" would produce identical outputs. Sinusoidal encodings and learned position embeddings are the two main approaches.',
            'Residual connections and layer normalization are what make deep Transformers trainable. Skip connections provide gradient highways through dozens of layers, while layer norm keeps activations stable.',
            'Encoder-only models (BERT) see all tokens bidirectionally and excel at understanding. Decoder-only models (GPT, Claude) use causal masking and excel at generation. Encoder-decoder models (T5) use cross-attention to connect understanding to generation.',
          ]}
          misconceptions={[
            '"Transformers don\'t process words sequentially — they see everything at once." This is true during training and encoding, but during generation (inference), decoder models do produce tokens one at a time. The key insight is that within each forward pass, all positions are processed in parallel. The sequential part is that each new token requires a new forward pass.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why does the Transformer architecture need positional encoding?"
          options={[
            { text: 'To reduce the computational cost of attention', isCorrect: false },
            { text: 'To provide information about word order, since self-attention treats all positions equally', isCorrect: true },
            { text: 'To convert words into numerical representations', isCorrect: false },
            { text: 'To prevent overfitting during training', isCorrect: false },
          ]}
          explanation="Self-attention computes relationships between all pairs of tokens, but it has no inherent notion of position or order. Without positional encoding, the sentence 'The cat sat on the mat' and 'mat the on sat cat The' would produce identical attention patterns and representations. Positional encoding adds a unique signal for each position in the sequence, allowing the model to distinguish word order. This is fundamentally different from RNNs, which get position information for free from their sequential processing. The original Transformer used sinusoidal functions, while modern models often use learned position embeddings or Rotary Position Embeddings (RoPE)."
        />
      </LessonSection>
    </div>
  );
}
