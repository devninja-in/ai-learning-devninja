'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import NewArchitecturesSim from '@/components/simulations/NewArchitecturesSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function NewArchitecturesContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Transformers have a dirty secret: they&apos;re O(n²). Double the
            input length, quadruple the computation. That&apos;s fine for a
            2,000-token chat message, but what about processing an entire book?
            Or a genome? Or continuous sensor data? Researchers have been working
            on alternatives, and some of them are genuinely impressive.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The quadratic scaling of self-attention is not just an academic
            curiosity. It is the reason why GPT-4&apos;s 128K context window costs
            dramatically more than its 8K window. It is why you cannot throw a
            million-token context at Claude and expect it to finish before your
            coffee gets cold. The attention mechanism computes scores between
            every pair of tokens, and for n tokens that means n² comparisons.
            The math is unforgiving.
          </p>

          <p className="text-gray-700 leading-relaxed">
            But transformers were not handed down from the heavens. They are
            just one way to process sequences, and the AI research community has
            been exploring alternatives that break the quadratic barrier. State
            space models like S4 and Mamba process sequences in linear time.
            RWKV combines RNN efficiency with transformer-like parallelism. And
            hybrid architectures cherry-pick the best of both worlds. Some of
            these models are already in production. This is the lesson where we
            ask: what comes after transformers?
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="The quadratic problem">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Self-attention is powerful because every token can attend to every
            other token. But this all-to-all connectivity comes at a cost: for
            n tokens, you compute n² attention scores. This is fine when n is
            small. It becomes painful when n gets large.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Let&apos;s make this concrete. A 2,048-token input requires roughly
            4 million attention computations (2048²). Double the sequence to
            4,096 tokens and you are at 16 million computations &mdash; a 4x
            increase for a 2x longer input. Go to 32,768 tokens (the kind of
            context you&apos;d need for a technical book) and you are looking at
            over 1 billion attention operations. The numbers get out of hand
            fast. Memory usage scales the same way: the attention matrix alone
            takes up n² space.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The cost of self-attention"
              nodes={[
                { id: 'input', label: 'Sequence (n tokens)', sublabel: 'Input data', type: 'input' },
                { id: 'attention', label: 'Self-Attention', sublabel: 'O(n²) complexity', type: 'attention' },
                { id: 'cost', label: 'Compute + Memory', sublabel: 'Both scale quadratically', type: 'output' },
              ]}
            />
          </div>

          <div className="not-prose mt-4">
            <FlowDiagram
              title="What we actually want"
              nodes={[
                { id: 'long', label: 'Long Sequences', sublabel: 'Books, genomes, video', type: 'input' },
                { id: 'linear', label: 'Linear Complexity', sublabel: 'O(n) processing', type: 'process' },
                { id: 'efficient', label: 'Efficient!', sublabel: 'Scales to millions of tokens', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            This is not just a performance annoyance. It fundamentally limits
            what transformers can do. Processing a full-length novel (100K+
            tokens) with standard attention is impractical. Processing an entire
            codebase or a multi-hour video transcription is nearly impossible.
            The quadratic wall is real, and it has pushed researchers to explore
            radically different architectures that can handle long sequences
            without breaking the bank.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Beyond attention">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The past few years have seen an explosion of alternative
            architectures. They all aim to solve the same problem: how do you
            process long sequences efficiently without losing the modeling power
            that makes transformers so effective? The answers vary, but they
            fall into a few camps.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'State Space Models (S4)',
                content: (
                  <div className="space-y-4">
                    <p>
                      State space models (SSMs) come from control theory, not
                      machine learning. The core idea: maintain a hidden state
                      that gets updated for each new token in the sequence. This
                      is conceptually similar to an RNN, but SSMs use continuous
                      dynamics inspired by differential equations. The original
                      S4 paper (Gu et al., 2021) showed that you can parameterize
                      these models in a way that makes them{' '}
                      <strong className="text-white">both trainable in parallel
                      (like transformers) and efficient at inference (like RNNs)</strong>.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs">
                      <div className="text-gray-500 mb-2">
                        {'//'} Simplified S4 update rule:
                      </div>
                      <div className="text-blue-400">
                        h[t] = A &times; h[t-1] + B &times; x[t]
                      </div>
                      <div className="text-green-400">
                        y[t] = C &times; h[t]
                      </div>
                      <div className="text-gray-500 mt-1">
                        {'//'} h = hidden state, x = input, y = output
                      </div>
                      <div className="text-gray-500">
                        {'//'} Matrices A, B, C are learned during training
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The breakthrough in S4 was a clever initialization scheme
                      (HiPPO matrices) that lets the model remember information
                      over extremely long sequences &mdash; far longer than
                      vanilla RNNs. The complexity is O(n) in sequence length,
                      not O(n²). The tradeoff: S4 cannot do arbitrary
                      token-to-token attention. It processes the sequence
                      sequentially (or via convolution during training), updating
                      its hidden state as it goes. For tasks that need long-range
                      dependencies but not fine-grained attention, S4 is extremely
                      efficient.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Mamba — Selective State Spaces',
                content: (
                  <div className="space-y-4">
                    <p>
                      Mamba (Gu & Dao, 2023) is the next evolution of S4. The
                      key innovation: make the state space parameters{' '}
                      <strong className="text-white">input-dependent</strong>.
                      In S4, the matrices A, B, C are the same for every token.
                      In Mamba, they change based on the current input. This is
                      called &ldquo;selective&rdquo; state space modeling.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-4 py-4">
                        <div className="text-purple-400 text-sm font-semibold mb-2">
                          S4: Fixed Parameters
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            A, B, C are learned once and stay constant. Every
                            token is processed the same way. Simple and efficient,
                            but less expressive than attention.
                          </p>
                          <p className="text-purple-300 font-medium">
                            Linear complexity, but limited adaptability.
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-4 py-4">
                        <div className="text-green-400 text-sm font-semibold mb-2">
                          Mamba: Selective (Input-Dependent)
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            A, B, C are computed from the input at each step. The
                            model can &ldquo;choose&rdquo; what to remember and
                            what to forget, like attention, but in linear time.
                          </p>
                          <p className="text-green-300 font-medium">
                            Still O(n), but much more expressive.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This selectivity is what makes Mamba competitive with
                      transformers on language modeling benchmarks. The model
                      can focus on relevant parts of the sequence (like attention)
                      without paying the quadratic cost. Empirical results show
                      Mamba matching or beating transformers at the same parameter
                      count, especially on tasks that involve very long contexts.
                      The inference speed is also dramatically faster because
                      there is no attention matrix to compute.
                    </p>
                  </div>
                ),
              },
              {
                title: 'RWKV — Receptance Weighted Key Value',
                content: (
                  <div className="space-y-4">
                    <p>
                      RWKV takes a different approach. The name is a nod to
                      transformers (Key-Value attention), but the mechanism is
                      closer to an RNN. The insight: you can train a recurrent
                      model in parallel like a transformer by reformulating the
                      recurrence as a linear attention variant. During inference,
                      you run it recurrently (O(n) time), but during training you
                      can parallelize across the sequence.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">
                        RWKV combines the best of RNNs and transformers:
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-blue-500/30 border border-blue-400/50 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-blue-300">Training:</strong>{' '}
                            <span className="text-gray-400">
                              Parallelizable like a transformer. Fast to train on GPUs.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500/30 border border-green-400/50 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-green-300">Inference:</strong>{' '}
                            <span className="text-gray-400">
                              Runs like an RNN. Constant memory, linear time.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-purple-500/30 border border-purple-400/50 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-purple-300">Scaling:</strong>{' '}
                            <span className="text-gray-400">
                              Can handle arbitrarily long sequences without blowing up memory.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      RWKV is particularly interesting because it is
                      community-driven and fully open source. The RWKV Foundation
                      has trained models up to 14B parameters, and they perform
                      competitively with GPT-3 class models on several benchmarks.
                      The architecture is simpler than Mamba (no fancy HiPPO
                      initialization), which makes it easier to implement and
                      experiment with. For inference-heavy workloads (like
                      chatbots), RWKV can be significantly cheaper than
                      transformer-based alternatives.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Hybrid Architectures — The Pragmatic Approach',
                content: (
                  <div className="space-y-4">
                    <p>
                      Most production models today do not bet everything on a
                      single architecture. Hybrid models combine transformers and
                      SSMs, using each where it shines:{' '}
                      <strong className="text-white">attention for short-range
                      dependencies, SSMs for long-range</strong>. This gives you
                      the expressiveness of transformers without the quadratic
                      blowup on long sequences.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-4 py-4">
                        <div className="text-amber-400 text-sm font-semibold mb-2">
                          Jamba (AI21 Labs)
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Interleaves transformer layers and Mamba layers. The
                            transformer layers handle token-level reasoning; the
                            Mamba layers compress long-range context. Released in
                            2024 with a 256K context window.
                          </p>
                          <p className="text-amber-300 font-medium">
                            Production-ready hybrid, commercially available.
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-cyan-500/50 bg-cyan-500/5 rounded-lg px-4 py-4">
                        <div className="text-cyan-400 text-sm font-semibold mb-2">
                          StripedHyena (Together AI)
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Uses attention for local context and a hyena operator
                            (a variant of SSMs) for global context. Open source,
                            trained up to 7B parameters. Matches GPT-3.5 quality
                            on some benchmarks.
                          </p>
                          <p className="text-cyan-300 font-medium">
                            Open weights, great for research and experimentation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The hybrid approach is pragmatic because it does not require
                      you to abandon transformers entirely. You get the benefits
                      of both worlds: transformers for the fine-grained reasoning
                      they are good at, and SSMs for the long-range compression
                      they excel at. As context windows keep growing (100K, 1M,
                      10M tokens), expect more models to adopt this architecture.
                      Pure transformers will struggle to scale, and pure SSMs may
                      lack the expressiveness needed for complex reasoning. The
                      future is likely hybrid.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Linear attention, xLSTM, and the 'will transformers be replaced?' debate">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Linear attention variants</strong>: Not all researchers
                are abandoning attention. Some are trying to make it linear.
                Performers (Choromanski et al., 2020) approximate attention using
                random feature maps, reducing complexity from O(n²) to O(n).
                Linear Transformers (Katharopoulos et al., 2020) reformulate
                attention as a recurrence. The results are mixed: these methods
                are faster, but they often underperform standard attention on
                quality. The approximation errors add up, especially on tasks
                that require precise token-to-token interactions.
              </p>
              <p className="text-gray-700">
                <strong>xLSTM (extended LSTM)</strong>: In 2024, Sepp Hochreiter
                (the inventor of LSTMs) released a paper modernizing LSTMs with
                exponential gating and new memory structures. The claim: with
                the right architecture tweaks, LSTMs can be competitive with
                transformers on language modeling while maintaining O(n)
                complexity. The results are preliminary but intriguing. LSTMs
                were written off as dead a few years ago, but the pendulum may
                be swinging back.
              </p>
              <p className="text-gray-700">
                <strong>Will transformers be replaced?</strong> Probably not
                entirely, at least not soon. Transformers have an enormous
                ecosystem: billions of dollars in training infrastructure,
                hardware optimized for attention (GPUs, TPUs), and tooling built
                around the transformer API. Even if SSMs or RNN variants are
                technically superior on some metrics, the inertia is real. The
                more likely outcome: hybrid architectures that use transformers
                where they work well and SSMs where transformers struggle. The
                &ldquo;death of transformers&rdquo; narrative is overblown, but
                the era of transformers as the only game in town is ending.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Compare architectures interactively">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Use the slider to adjust the sequence length and watch how
            computation, memory, and speed change for transformers vs SSMs.
            Notice the crossover point where SSMs start to win. Toggle the
            hybrid mode to see how modern models combine both approaches.
          </p>

          <NewArchitecturesSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Self-attention in transformers scales as O(n²) in sequence length. This limits context windows and makes long-sequence processing prohibitively expensive. Doubling the input length quadruples the compute and memory cost.',
            'State Space Models (S4, Mamba) process sequences in O(n) time by maintaining a recurrent hidden state instead of computing all-to-all attention. Mamba adds input-dependent (selective) state updates, making it competitive with transformers on quality.',
            'RWKV combines RNN-like inference (linear time, constant memory) with transformer-like training (parallelizable). It can be trained efficiently on GPUs and then deployed for extremely long sequences at low cost.',
            'Hybrid architectures like Jamba and StripedHyena use attention for short-range dependencies and SSMs for long-range context. This avoids the quadratic blowup while retaining the expressiveness that makes transformers powerful.',
            'The future is not transformers vs SSMs — it is transformers and SSMs. As context windows grow to millions of tokens, expect more models to adopt hybrid architectures that cherry-pick the best of both approaches.',
          ]}
          misconceptions={[
            '"Transformers are going away." — They are not. Transformers have an enormous installed base, excellent hardware support, and a mature ecosystem. What is changing: transformers are being augmented with SSMs and other linear-complexity components for long-range tasks. The all-transformer architecture may fade, but attention layers will stick around for the foreseeable future.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What makes Mamba different from the original S4 state space model?"
          options={[
            { text: 'Mamba uses larger hidden states to store more information', isCorrect: false },
            { text: 'Mamba makes the state space parameters input-dependent (selective), allowing the model to focus on relevant parts of the sequence', isCorrect: true },
            { text: 'Mamba replaces the state space formulation with standard RNN cells', isCorrect: false },
            { text: 'Mamba adds attention layers between state space layers', isCorrect: false },
          ]}
          explanation="Mamba introduces selective state space modeling, where the matrices A, B, C that govern the hidden state updates are computed from the input at each step, rather than being fixed. This makes the model input-dependent — it can choose what to remember and what to forget based on the current token, similar to how attention lets a model focus on relevant context. This selectivity is what gives Mamba its modeling power while maintaining O(n) complexity. S4 used fixed parameters, which was efficient but less expressive."
        />
      </LessonSection>
    </div>
  );
}
