'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import PEFTSim from '@/components/simulations/PEFTSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function PEFTLoRAContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            What if I told you that you could customize a 70-billion-parameter
            model &mdash; making it an expert in your specific domain &mdash;
            using a single consumer GPU? And that you&apos;d only need to train
            0.1% of the parameters? A few years ago this sounded impossible.
            Then LoRA came along and changed the economics of AI completely.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Full fine-tuning means updating every single parameter in the model.
            For a 70B model, that means 70 billion numbers, each needing
            gradients stored in memory, each being nudged by the optimizer. The
            hardware requirements are staggering: multiple high-end GPUs, weeks
            of compute, and a bill that can easily reach six figures. Most teams
            simply cannot afford it.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Parameter-efficient fine-tuning (PEFT) methods solve this by asking a
            simple but powerful question: <em>do we really need to change all
            70 billion parameters?</em> The answer turns out to be no &mdash;
            not even close. Techniques like LoRA, QLoRA, and adapters let you
            customize massive models by training less than 1% of the parameters,
            achieving quality that is often indistinguishable from full
            fine-tuning. This is the lesson where fine-tuning goes from
            &ldquo;only Big Tech can do this&rdquo; to &ldquo;I can do this on
            my gaming PC.&rdquo;
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept — The fine-tuning cost problem */}
      <LessonSection id="concept" title="The fine-tuning cost problem">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            To understand why PEFT methods matter, you need to feel the pain of
            full fine-tuning. When you fine-tune a model, the optimizer needs to
            store not just the model weights, but also the gradients and the
            optimizer states (momentum, variance) for every parameter. For a
            70B model in FP16, the weights alone take ~140 GB. Add gradients and
            Adam optimizer states, and you need roughly 280&ndash;320 GB of GPU
            memory. That is four A100 80GB GPUs just to hold everything in
            memory &mdash; before you even start training.
          </p>

          <p className="text-gray-700 leading-relaxed">
            But here is the key insight that makes PEFT possible: researchers
            discovered that the weight updates during fine-tuning are{' '}
            <strong>low-rank</strong>. In plain English, this means the changes
            you make to a model when you fine-tune it live in a much smaller
            space than the full weight matrix. You don&apos;t need to update all
            70 billion parameters because most of the &ldquo;directions&rdquo; in
            weight space are irrelevant to your specific task. The model already
            knows most of what it needs &mdash; you just need to steer it
            slightly.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Full fine-tuning vs PEFT"
              nodes={[
                { id: 'model', label: 'Full Model (70B)', sublabel: 'All parameters', type: 'input' },
                { id: 'full', label: 'Full Fine-tune', sublabel: '70B params updated', type: 'attention' },
                { id: 'expensive', label: 'Expensive!', sublabel: '4x A100, weeks, $50K+', type: 'output' },
              ]}
            />
          </div>

          <div className="not-prose mt-4">
            <FlowDiagram
              title="The PEFT alternative"
              nodes={[
                { id: 'model', label: 'Full Model (70B)', sublabel: 'Frozen weights', type: 'input' },
                { id: 'lora', label: 'LoRA / QLoRA', sublabel: '0.1% trained', type: 'process' },
                { id: 'adapter', label: 'Small Adapter', sublabel: '~50-200 MB', type: 'process' },
                { id: 'cheap', label: 'Affordable!', sublabel: '1x GPU, hours, ~$100', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The economic difference is not incremental &mdash; it is orders of
            magnitude. PEFT does not just make fine-tuning cheaper. It makes it
            <em> accessible</em>. A graduate student with a single GPU can now
            do what previously required a well-funded lab. A startup can
            customize a model for their domain without needing to raise a
            fundraising round to pay the GPU bill. This democratization is one
            of the most important developments in applied AI.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Three ways to fine-tune efficiently">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            PEFT is a family of techniques, not a single method. They all share
            the same goal &mdash; customize a model without touching most of the
            parameters &mdash; but they approach it differently. LoRA is by far
            the most popular, QLoRA pushes the memory savings even further, and
            adapter methods offer an alternative architecture.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'The Core Insight: Low-Rank Updates',
                content: (
                  <div className="space-y-4">
                    <p>
                      When you fine-tune a large model on a specific task, the
                      weight changes are{' '}
                      <strong className="text-white">low-rank</strong>. Think of it
                      this way: a 70B model has learned an enormous amount of
                      general knowledge. Fine-tuning for, say, medical question
                      answering does not require rewriting all that knowledge. It
                      requires a relatively small adjustment &mdash; a nudge in a
                      specific direction in the vast space of possible weight
                      configurations.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs">
                      <div className="text-gray-500 mb-2">
                        {'//'} The math behind the insight:
                      </div>
                      <div className="text-blue-400">
                        W_finetuned = W_pretrained + delta_W
                      </div>
                      <div className="text-gray-500 mt-1 mb-1">
                        {'//'} delta_W has low intrinsic rank!
                      </div>
                      <div className="text-green-400">
                        delta_W ≈ A &times; B &nbsp;&nbsp;{'//'} where A is d&times;r, B is
                        r&times;d, and r &lt;&lt; d
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This was formally shown in the 2021 paper
                      &ldquo;Intrinsic Dimensionality Explains the Effectiveness
                      of Language Model Fine-Tuning&rdquo; by Aghajanyan et al.
                      They found that 90% of the learning happens in a space
                      that is orders of magnitude smaller than the full parameter
                      space. LoRA exploits this directly.
                    </p>
                  </div>
                ),
              },
              {
                title: 'LoRA — Low-Rank Adaptation',
                content: (
                  <div className="space-y-4">
                    <p>
                      LoRA (Low-Rank Adaptation of Large Language Models) is
                      elegant in its simplicity. Instead of updating the full
                      weight matrix W, you{' '}
                      <strong className="text-white">freeze W</strong> and add two
                      small trainable matrices beside it: A (d &times; r) and B
                      (r &times; d), where r is much smaller than d.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-gray-600 bg-gray-800/50 rounded-lg px-3 py-3 text-center">
                        <span className="text-gray-400 text-sm font-medium">W (frozen)</span>
                        <div className="text-white text-xs mt-2">
                          d &times; d = billions of params
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">Not updated</div>
                      </div>
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">A &times; B (trained)</span>
                        <div className="text-white text-xs mt-2">
                          2 &times; d &times; r = millions of params
                        </div>
                        <div className="text-[10px] text-blue-400 mt-1">Updated via backprop</div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Output</span>
                        <div className="text-white text-xs mt-2">
                          W + A&times;B
                        </div>
                        <div className="text-[10px] text-green-400 mt-1">Same shape as original</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The rank r controls the tradeoff: higher rank means more
                      trainable parameters and potentially better quality, but
                      also more memory and slower training. In practice, rank
                      8&ndash;16 works well for most tasks. The LoRA paper by
                      Hu et al. (2021) showed that rank as low as 4 can match
                      full fine-tuning quality on many benchmarks.
                    </p>
                  </div>
                ),
              },
              {
                title: 'QLoRA — Quantize Then Adapt',
                content: (
                  <div className="space-y-4">
                    <p>
                      QLoRA (Quantized LoRA) takes the idea further. First, you{' '}
                      <strong className="text-white">quantize the base model to
                      4-bit</strong> (reducing it from ~140 GB to ~35 GB for a
                      70B model). Then you add LoRA adapters on top of the
                      quantized model. The adapters themselves stay in higher
                      precision (BF16), but since they are tiny, this costs
                      almost nothing.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">QLoRA memory breakdown (70B model):</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-purple-400">Base model (4-bit quantized):</span>
                          <span className="text-purple-300">~35 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-400">LoRA adapters (BF16):</span>
                          <span className="text-blue-300">~0.2 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Gradients + optimizer states:</span>
                          <span className="text-green-300">~4 GB</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 flex justify-between">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-white font-semibold">~40 GB</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This means a 70B-parameter model can be fine-tuned on a
                      single 48 GB GPU (like an A6000 or an A100 40GB with
                      careful memory management). The QLoRA paper by Dettmers
                      et al. (2023) introduced two key innovations: NF4
                      (NormalFloat 4-bit) quantization and double quantization.
                      These minimize the quality loss from quantization, making
                      QLoRA quality remarkably close to full-precision LoRA.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Adapters & Other PEFT Methods',
                content: (
                  <div className="space-y-4">
                    <p>
                      LoRA is the most popular PEFT method, but it is not the
                      only one. The PEFT family includes several other
                      approaches, each with different tradeoffs. Understanding
                      the landscape helps you pick the right tool.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-4 py-4">
                        <div className="text-amber-400 text-sm font-semibold mb-2">
                          Adapter Layers
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Small bottleneck layers inserted between existing
                            transformer layers. Data flows through the adapter
                            (down-project, nonlinearity, up-project) and the
                            result is added back via a residual connection.
                          </p>
                          <p className="text-amber-300 font-medium">
                            ~3-5% of parameters. Slightly more overhead than LoRA.
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-cyan-500/50 bg-cyan-500/5 rounded-lg px-4 py-4">
                        <div className="text-cyan-400 text-sm font-semibold mb-2">
                          Prefix Tuning
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Adds learnable &ldquo;virtual tokens&rdquo; to the
                            beginning of the input at every layer. The model
                            learns to condition on these prefixes to steer its
                            behavior. No weight matrices are modified at all.
                          </p>
                          <p className="text-cyan-300 font-medium">
                            Very few parameters. Best for generation tasks.
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-pink-500/50 bg-pink-500/5 rounded-lg px-4 py-4">
                        <div className="text-pink-400 text-sm font-semibold mb-2">
                          Prompt Tuning
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Similar to prefix tuning but simpler: learnable
                            soft prompt tokens are prepended only at the input
                            layer. Extremely parameter-efficient but can be
                            less expressive.
                          </p>
                          <p className="text-pink-300 font-medium">
                            Fewest parameters (~0.01%). Easiest to implement.
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-orange-500/50 bg-orange-500/5 rounded-lg px-4 py-4">
                        <div className="text-orange-400 text-sm font-semibold mb-2">
                          BitFit
                        </div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Only train the bias terms in the model. Everything
                            else is frozen. Surprisingly effective for some tasks
                            despite changing less than 0.1% of parameters.
                          </p>
                          <p className="text-orange-300 font-medium">
                            Minimal changes. Good baseline to try first.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      In practice, LoRA has won the popularity contest. It is
                      well-supported across all major frameworks (Hugging Face
                      PEFT, Axolotl, LLaMA-Factory), it works well across tasks,
                      and the adapter weights can be merged back into the base
                      model for zero-overhead inference. Most practitioners start
                      with LoRA and only explore alternatives if they have a
                      specific reason.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Choosing LoRA rank, target layers, and merging adapters">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>How to choose LoRA rank</strong>: Start with rank 8.
                This works well for most tasks. If your task is simple (e.g.,
                style transfer or formatting), rank 4 may suffice. If your task
                is complex (e.g., learning a new language or a specialized
                domain with a lot of novel vocabulary), try rank 16 or 32.
                Going beyond 64 rarely helps and starts to lose the efficiency
                advantage. Monitor validation loss &mdash; if it plateaus early,
                your rank is high enough.
              </p>
              <p className="text-gray-700">
                <strong>Which layers to apply LoRA to</strong>: By default,
                most implementations apply LoRA to the query (Q) and value (V)
                projection matrices in self-attention. This is the minimum
                effective configuration. For better results, also apply it to
                the key (K) projection, the output projection, and the MLP
                layers (gate, up, down projections). Applying LoRA to all linear
                layers gives the best quality but increases trainable parameters
                to ~0.5&ndash;1% instead of ~0.1%. The tradeoff is usually
                worth it.
              </p>
              <p className="text-gray-700">
                <strong>Merging LoRA weights back</strong>: After training, you
                can merge the adapter weights into the base model:
                W_merged = W + A &times; B. This produces a regular model with
                no inference overhead. The merged model behaves identically to
                the adapted model but does not need the PEFT library to run.
                This is the standard approach for deployment. The alternative is
                keeping adapters separate and hot-swapping them at inference
                time &mdash; useful when one base model serves multiple tasks
                (e.g., different customers, different languages).
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Compare PEFT methods interactively">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Use this interactive visualizer to compare full fine-tuning, LoRA,
            and QLoRA side by side. Toggle between the three methods to see how
            many parameters each one trains. Adjust the LoRA rank slider to
            explore the tradeoff between efficiency and expressiveness. Pay
            attention to the dramatic difference in GPU memory requirements.
          </p>

          <PEFTSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Full fine-tuning updates all parameters and requires enormous GPU resources. For a 70B model, expect 300+ GB of memory and costs exceeding $50,000. Most teams cannot afford this.',
            'LoRA freezes the base model and adds small trainable low-rank matrices (A and B) beside each weight matrix. This reduces trainable parameters to ~0.1% while maintaining quality comparable to full fine-tuning.',
            'QLoRA goes further by quantizing the base model to 4-bit before adding LoRA adapters, reducing memory requirements by another 3-4x. A 70B model becomes trainable on a single 48GB consumer GPU.',
            'The key insight enabling all PEFT methods is that weight updates during fine-tuning are low-rank — the changes needed to specialize a model live in a much smaller space than the full parameter count suggests.',
            'LoRA adapters can be merged back into the base model for zero-overhead inference, or kept separate and hot-swapped to serve multiple tasks from a single base model. This makes PEFT practical for production deployment.',
          ]}
          misconceptions={[
            '"LoRA makes models dumber." -- It does not. Multiple studies have shown that LoRA quality is often comparable to full fine-tuning, especially at rank 16 or higher. The weight updates during fine-tuning are naturally low-rank, so LoRA is not throwing away important information — it is exploiting the structure that was already there.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why does LoRA work so well despite training less than 1% of parameters?"
          options={[
            { text: 'It uses a more powerful optimizer that needs fewer updates', isCorrect: false },
            { text: 'The weight updates during fine-tuning have low intrinsic rank, so a small number of parameters can capture the same effect', isCorrect: true },
            { text: 'It only fine-tunes the most important layers and skips the rest', isCorrect: false },
            { text: 'It compresses the training data to fit in less memory', isCorrect: false },
          ]}
          explanation="LoRA works because the weight changes during fine-tuning are inherently low-rank. When you fine-tune a large model for a specific task, the actual 'direction' of change in weight space can be captured by a much smaller set of parameters than the full weight matrix. LoRA exploits this by decomposing the weight update into two small matrices (A and B) whose product approximates the full update. This is not a compression trick or a shortcut — it is a fundamental property of how neural networks adapt to new tasks. The 2021 paper by Aghajanyan et al. showed that 90% of the learning happens in a subspace that is orders of magnitude smaller than the full parameter space."
        />
      </LessonSection>
    </div>
  );
}
