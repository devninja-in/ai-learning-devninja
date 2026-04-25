'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import ModelInternalsSim from '@/components/simulations/ModelInternalsSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function ModelInternalsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            You&apos;ve learned what a transformer is. But the transformers
            powering Llama, Mistral, and Gemma aren&apos;t the same transformer
            from the 2017 paper. They&apos;ve been upgraded, optimized, and
            frankly, redesigned in clever ways. Understanding these internals is
            like knowing what&apos;s under the hood of a car &mdash; you
            don&apos;t need it to drive, but you need it to build, fix, or
            optimize.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The original &ldquo;Attention Is All You Need&rdquo; transformer
            used learned position embeddings, standard multi-head attention,
            ReLU activations, and LayerNorm. Modern LLMs have replaced
            <em> every single one</em> of those components. RoPE instead of
            learned positions. GQA instead of full multi-head attention. SwiGLU
            instead of ReLU. RMSNorm instead of LayerNorm. Each swap seems
            small on its own, but together they compound into models that are
            faster, more memory-efficient, and better at handling long
            contexts.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This lesson takes you inside the three most important open-weight
            model families &mdash; Llama 3, Mistral/Mixtral, and Gemma &mdash;
            and shows you exactly what changed and why. By the end, you&apos;ll
            be able to read a model card or architecture diagram and understand
            what every component does.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept -- Beyond the vanilla transformer */}
      <LessonSection id="concept" title="Beyond the vanilla transformer">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Modern LLMs keep the transformer skeleton but swap out nearly every
            component. Think of it like a car platform &mdash; the chassis and
            layout stay the same, but the engine, transmission, suspension, and
            brakes are all upgraded. The 2017 transformer was the original
            design. What ships in production today is a heavily modified version
            that&apos;s been battle-tested at scales the original authors never
            imagined.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="From vanilla to modern transformer"
              nodes={[
                { id: 'vanilla', label: 'Vanilla Transformer', sublabel: 'Learned pos, MHA, ReLU, LayerNorm', type: 'input' },
                { id: 'upgrades', label: 'Modern Upgrades', sublabel: 'RoPE + GQA + SwiGLU + RMSNorm', type: 'attention' },
                { id: 'modern', label: 'Modern LLM', sublabel: 'Llama, Mistral, Gemma', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The reason these changes matter is practical. RoPE lets models
            handle 128K-token contexts without retraining. GQA slashes memory
            usage during inference so you can serve models on fewer GPUs.
            SwiGLU squeezes more performance out of the same parameter count.
            RMSNorm is just faster to compute, and faster means cheaper to
            train and serve. None of these innovations are Nobel Prize material
            on their own &mdash; they&apos;re engineering improvements. But
            stacked together, they&apos;re the difference between a model that
            costs $10M to train and one that costs $2M for the same quality.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works -- The upgrades that matter */}
      <LessonSection id="how-it-works" title="The upgrades that matter">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s walk through the four most important changes that define
            modern transformer architectures. Each one addresses a specific
            weakness of the original design.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'RoPE (Rotary Position Embedding)',
                content: (
                  <div className="space-y-4">
                    <p>
                      The original transformer used either fixed sinusoidal
                      embeddings or learned position vectors to tell the model
                      where each token sits in the sequence. Both approaches
                      have a hard limit: they break down at sequence lengths
                      the model has never seen during training.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">How RoPE works:</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="text-blue-400">1. Take the query and key vectors from attention</div>
                        <div className="text-green-400">2. Rotate them by an angle proportional to their position</div>
                        <div className="text-purple-400">3. The dot product between Q and K now encodes relative distance</div>
                        <div className="text-amber-400">4. Positions 5 and 8 have the same relative encoding as 105 and 108</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The key insight is that RoPE encodes{' '}
                      <strong className="text-gray-300">relative position</strong>{' '}
                      rather than absolute position. Two tokens that are 3
                      positions apart always look the same to the attention
                      mechanism, no matter where they appear in the sequence.
                      This is why Llama 3 can handle 128K-token contexts &mdash;
                      RoPE generalizes to sequence lengths far beyond what the
                      model saw during training.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Grouped Query Attention (GQA)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Standard multi-head attention (MHA) gives every query
                      head its own key and value head. That&apos;s fine during
                      training, but during inference it creates a massive
                      problem: the{' '}
                      <strong className="text-white">KV-cache</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg px-3 py-3">
                        <span className="text-red-400 text-sm font-medium">MHA</span>
                        <div className="text-white text-xs mt-2">
                          32 query heads, 32 KV heads. Full KV-cache per head.
                          Maximum quality, maximum memory.
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3">
                        <span className="text-amber-400 text-sm font-medium">GQA</span>
                        <div className="text-white text-xs mt-2">
                          32 query heads, 8 KV heads. Groups of 4 queries share
                          1 KV head. 4x smaller KV-cache.
                        </div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-3 py-3">
                        <span className="text-green-400 text-sm font-medium">MQA</span>
                        <div className="text-white text-xs mt-2">
                          32 query heads, 1 KV head. All queries share 1 KV
                          pair. 32x smaller cache but quality drops.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      GQA is the sweet spot. Llama 3 70B uses 8 KV heads
                      shared across 64 query heads, cutting KV-cache memory by
                      8x with negligible quality loss. This is not a training
                      optimization &mdash; it is an{' '}
                      <strong className="text-gray-300">inference optimization</strong>.
                      The model trains in roughly the same way, but serving it
                      costs dramatically less memory.
                    </p>
                  </div>
                ),
              },
              {
                title: 'SwiGLU Activation',
                content: (
                  <div className="space-y-4">
                    <p>
                      The original transformer used ReLU in its feed-forward
                      network: if a value is negative, zero it out; if
                      positive, keep it. Simple but crude. SwiGLU is a more
                      sophisticated replacement that adds a{' '}
                      <strong className="text-white">gating mechanism</strong>.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">Activation function evolution:</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="text-red-400">ReLU(x)     = max(0, x)         -- harsh cutoff at 0</div>
                        <div className="text-blue-400">GELU(x)     = x * P(X &lt;= x)      -- smooth probabilistic gate</div>
                        <div className="text-green-400">SwiGLU(x,y) = Swish(xW) * (yV)  -- learned gating with 3rd matrix</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      SwiGLU adds a third weight matrix to the FFN, which does
                      increase parameter count slightly. But the gating
                      mechanism lets the network learn <em>which</em>{' '}
                      information to pass through, rather than just clipping
                      negatives. In practice, SwiGLU consistently improves
                      model quality across scales. Every major open model
                      family now uses it or a close variant (like GEGLU in
                      Gemma).
                    </p>
                  </div>
                ),
              },
              {
                title: 'RMSNorm',
                content: (
                  <div className="space-y-4">
                    <p>
                      LayerNorm normalizes activations by subtracting the mean
                      and dividing by the standard deviation. RMSNorm simplifies
                      this: it{' '}
                      <strong className="text-white">
                        skips the mean subtraction
                      </strong>{' '}
                      and just divides by the root mean square of the values.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">Normalization comparison:</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="text-blue-400">LayerNorm: y = (x - mean) / std * gamma + beta  -- 2 stats, 2 params</div>
                        <div className="text-green-400">RMSNorm:   y = x / RMS(x) * gamma               -- 1 stat, 1 param</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Why does dropping the mean work? Research suggests that
                      the re-centering in LayerNorm is not actually doing much
                      useful work in transformers. The re-scaling (dividing by
                      magnitude) is what matters for training stability.
                      RMSNorm keeps the useful part and drops the rest, making
                      normalization faster &mdash; and when you have 126 layers
                      (like Llama 3 405B), every microsecond of normalization
                      adds up.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Mixture of Experts (MoE) -- scaling capacity without scaling compute">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Mixture of Experts</strong> is the most radical
                departure from the standard transformer recipe. Instead of one
                FFN block per layer, MoE uses multiple &ldquo;expert&rdquo; FFN
                blocks (typically 8) and a small router network that decides
                which experts handle each token.
              </p>
              <p className="text-gray-700">
                Mixtral 8x7B has 46.7 billion total parameters (8 experts times
                7B each, roughly), but only activates about 13B parameters per
                token &mdash; because the router selects just the top 2 experts
                for each token. This means Mixtral has the <em>capacity</em> of
                a 46B model but the <em>compute cost</em> of a ~13B model. The
                result? Mixtral matches or beats Llama 2 70B on most benchmarks
                while being dramatically cheaper to run.
              </p>
              <p className="text-gray-700">
                GPT-4 is widely rumored to use MoE as well (possibly 8 experts
                of ~200B each). The challenge with MoE is{' '}
                <strong>load balancing</strong>: you need to make sure all
                experts get roughly equal usage, or some experts become
                undertrained while others get overloaded. Modern implementations
                use auxiliary loss terms to encourage balanced routing.
              </p>
              <p className="text-gray-700">
                MoE is particularly exciting because it breaks the traditional
                scaling tradeoff. Historically, more parameters always meant
                more compute. MoE lets you add parameters (capacity) without
                proportionally increasing compute (cost). This is likely the
                architecture pattern that will define the next generation of
                frontier models.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Compare model architectures">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Use this interactive tool to compare how Llama 3, Mistral/Mixtral,
            and Gemma 2 are built. Each model is shown as a vertical stack of
            component blocks. Gray-bordered blocks are shared across models;
            colored blocks are unique innovations. Click any block to see a
            detailed explanation of what it does and why this particular model
            uses it.
          </p>

          <ModelInternalsSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Modern LLMs keep the transformer skeleton (embed, attend, feed-forward, project) but swap out nearly every internal component. The 2017 transformer is a starting point, not the final design.',
            'RoPE (Rotary Position Embedding) encodes relative position through rotation matrices, letting models generalize to sequence lengths far beyond their training data. This is how Llama 3 handles 128K-token contexts.',
            'GQA (Grouped Query Attention) shares key-value heads across multiple query heads, cutting KV-cache memory by 4-8x during inference. This is an inference optimization, not a training one -- it makes serving large models dramatically cheaper.',
            'SwiGLU replaces ReLU/GELU in the FFN with a gated activation that lets the network learn which information to pass through. It adds a third weight matrix but consistently improves quality across model scales.',
            'RMSNorm simplifies LayerNorm by dropping the mean subtraction, keeping only the magnitude normalization. It is faster to compute and works just as well, making it the default choice for modern LLMs.',
          ]}
          misconceptions={[
            '"These models are completely different architectures." Not really -- Llama, Mistral, and Gemma all follow the same high-level pattern: decoder-only transformer with repeated blocks of normalization, attention, normalization, and feed-forward. The differences are in which specific variant of each component they choose. Switching from RoPE to learned positions, or from GQA to MHA, would be a config change, not a rewrite.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What does Grouped Query Attention (GQA) primarily save?"
          options={[
            { text: 'Training compute (fewer FLOPs during backpropagation)', isCorrect: false },
            { text: 'KV-cache memory during inference', isCorrect: true },
            { text: 'Model parameter count (fewer total weights)', isCorrect: false },
            { text: 'Embedding table size (smaller vocabulary)', isCorrect: false },
          ]}
          explanation="GQA shares key and value heads across multiple query heads. During training, the compute savings are modest. The big win is during inference: in autoregressive generation, the model must store key-value pairs for every previous token in the sequence (the KV-cache). With GQA, Llama 3 70B uses 8 KV heads instead of 64, cutting KV-cache memory by 8x. This allows longer contexts, larger batch sizes, and serving on fewer GPUs -- which is why GQA is fundamentally an inference optimization."
        />
      </LessonSection>
    </div>
  );
}
