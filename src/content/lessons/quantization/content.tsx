'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import QuantizationSim from '@/components/simulations/QuantizationSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function QuantizationContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            A 70-billion-parameter model in FP32 takes 280GB of memory. Multiple GPUs just to
            load it. But you can shrink it to 35GB (INT4) and lose almost nothing. Like
            compressing RAW to JPEG — technically losing info, but your eyes can&apos;t tell.
          </p>

          <p className="text-gray-700 leading-relaxed">
            That&apos;s what quantization does for neural networks. It takes those absurdly
            large models and squeezes them down to a fraction of their size by reducing the
            precision of every single weight. Instead of storing each number with 32 bits of
            precision, you use 8 bits. Or 4 bits. Sometimes even less.
          </p>

          <p className="text-gray-700 leading-relaxed">
            And here&apos;s the kicker: for most models, you barely notice the quality drop.
            A 4-bit quantized Llama can run on a laptop and still give you coherent answers.
            The same model in full precision would need a server rack. This isn&apos;t some
            niche optimization trick — it&apos;s how local AI actually works in practice.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Making models smaller without breaking them">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Neural networks are packed with millions or billions of floating-point numbers
            called weights. Each weight is a knob that slightly adjusts how information flows
            through the model. In their original training format (usually FP32 or BF16),
            every single weight gets stored with extreme precision — 32 bits or 16 bits per
            number.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Quantization shrinks models dramatically"
              nodes={[
                { id: 'input', label: 'FP32 Model (280GB)', type: 'input' },
                { id: 'quant', label: 'Quantization', type: 'process' },
                { id: 'output', label: 'INT4 Model (35GB)', type: 'output' },
                { id: 'result', label: 'Nearly Same Quality', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            But here&apos;s the thing: most of those weights cluster around zero. They&apos;re
            not random numbers scattered across the entire range of possible values. They
            follow patterns. They&apos;re redundant. And they definitely don&apos;t need 32
            bits of precision to do their job.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Quantization exploits that redundancy. Instead of storing each weight with full
            32-bit floating-point precision, you map it to a much smaller set of possible
            values — say, 256 values for INT8, or just 16 values for INT4. You&apos;re
            <em> intentionally</em> throwing away precision. But because the weights are
            clustered and somewhat redundant, the model still behaves almost identically.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The payoff is huge. A 70B-parameter model drops from 280GB to 35GB. That&apos;s
            the difference between needing multiple enterprise GPUs and running locally on a
            MacBook. It&apos;s why tools like llama.cpp and Ollama exist — they let you run
            quantized models efficiently on consumer hardware.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="From 32 bits to 4 bits">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Quantization is conceptually simple: map a continuous range of floating-point
            numbers to a discrete set of integers. But the devil is in the details — how
            you do that mapping, when you do it, and what tricks you use to minimize quality
            loss. Let&apos;s walk through the key approaches.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'What is quantization?',
                content: (
                  <div className="space-y-4">
                    <p>
                      At its core, quantization is just rounding. You take a floating-point
                      weight like <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">0.3847</code>{' '}
                      and map it to the nearest value in a much smaller set of allowed values.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                      <div className="text-sm font-mono text-gray-800">
                        <div><strong>FP32:</strong> 0.3847291 (exact)</div>
                        <div className="mt-2"><strong>INT8:</strong> 0.3858 (rounded to nearest 1/127)</div>
                        <div className="mt-2"><strong>INT4:</strong> 0.4286 (rounded to nearest 1/7)</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-gray-900">Fewer bits = less memory.</strong>{' '}
                      An FP32 weight takes 4 bytes. INT8 takes 1 byte. INT4 takes half a byte.
                      Multiply that across billions of parameters and you&apos;ve shrunk the
                      entire model by 4x or 8x.
                    </p>

                    <p className="text-sm text-gray-700">
                      The trade-off is obvious: you lose precision. The question is whether
                      that precision actually mattered for the model&apos;s behavior. Spoiler:
                      usually it doesn&apos;t.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Post-Training Quantization (GPTQ, AWQ)',
                content: (
                  <div className="space-y-4">
                    <p>
                      The most common approach is <strong className="text-gray-900">Post-Training
                      Quantization</strong> — you take a model that&apos;s already been trained
                      in FP32 or BF16, and you quantize it <em>after the fact</em>.
                    </p>

                    <p className="text-sm">
                      Two popular methods dominate this space:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3">
                        <div className="text-blue-700 font-medium mb-1">GPTQ</div>
                        <div className="text-sm text-gray-700">
                          Layer-by-layer quantization. Minimizes reconstruction error by solving
                          a least-squares problem for each layer. Slower to quantize, but very
                          high quality.
                        </div>
                      </div>

                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <div className="text-purple-700 font-medium mb-1">AWQ</div>
                        <div className="text-sm text-gray-700">
                          Activation-aware quantization. Protects the most important weights
                          (those with high activation magnitudes) from aggressive quantization.
                          Faster to quantize than GPTQ.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      Both methods work layer by layer. They feed calibration data through the
                      model, observe how the weights interact with real activations, and use
                      that information to quantize intelligently. The result: INT4 models that
                      retain 95%+ of the original model&apos;s quality.
                    </p>
                  </div>
                ),
              },
              {
                title: 'GGUF format — the standard for running locally',
                content: (
                  <div className="space-y-4">
                    <p>
                      If you&apos;ve used llama.cpp or Ollama, you&apos;ve used <strong className="text-gray-900">GGUF</strong>.
                      It&apos;s a file format designed specifically for efficient inference of
                      quantized models on CPUs and consumer GPUs.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                      <div className="text-sm font-mono text-gray-800 space-y-1">
                        <div><strong>Q4_0:</strong> Pure 4-bit weights, smallest size</div>
                        <div><strong>Q4_K_M:</strong> Mixed 4-bit and 6-bit, medium quality</div>
                        <div><strong>Q5_K_M:</strong> Mixed 5-bit and 6-bit, higher quality</div>
                        <div><strong>Q8_0:</strong> 8-bit weights, near-original quality</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-gray-900">K-quants</strong> are the current state
                      of the art in GGUF. They don&apos;t use uniform quantization across the
                      entire model. Instead, they group weights into blocks and quantize each
                      block separately. Some blocks get more precision, some get less. The model
                      decides based on importance.
                    </p>

                    <p className="text-sm text-gray-700">
                      In practice, <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Q4_K_M</code>{' '}
                      is the sweet spot for most use cases. You get 4-bit size with quality
                      that&apos;s shockingly close to the original FP16 model.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Beyond quantization — pruning and distillation',
                content: (
                  <div className="space-y-4">
                    <p>
                      Quantization isn&apos;t the only way to shrink models. Two other
                      techniques are worth knowing about:
                    </p>

                    <div className="space-y-3 my-4">
                      <div className="border-l-4 border-green-500 bg-green-500/10 pl-4 py-2">
                        <div className="text-green-800 font-medium">Pruning</div>
                        <div className="text-sm text-gray-700 mt-1">
                          Remove weights that are close to zero. If a weight doesn&apos;t
                          contribute much, set it to exactly zero and skip it during
                          computation. Can remove 30-50% of weights with minimal quality loss.
                        </div>
                      </div>

                      <div className="border-l-4 border-amber-500 bg-amber-500/10 pl-4 py-2">
                        <div className="text-amber-800 font-medium">Knowledge Distillation</div>
                        <div className="text-sm text-gray-700 mt-1">
                          Train a smaller &quot;student&quot; model to mimic a larger
                          &quot;teacher&quot; model. The student learns to match the
                          teacher&apos;s outputs, often achieving similar quality with far
                          fewer parameters. This is how models like DistilBERT work.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      These techniques can be combined. You might distill a 70B model down to
                      13B, then quantize the 13B model to INT4. Each compression step
                      compounds. You can end up with a model that&apos;s 50x smaller and still
                      performs surprisingly well for targeted tasks.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Quantization-aware training and mixed-precision">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                Post-training quantization works great, but there&apos;s an even better approach:
                train the model with quantization in mind from the start. This is called
                <strong> quantization-aware training (QAT)</strong>.
              </p>
              <p className="text-gray-700">
                During QAT, the model trains with fake quantization — the forward pass uses
                quantized weights, but the backward pass still uses full-precision gradients.
                The model learns to compensate for the precision loss during training, which
                means it handles quantization much better at inference time.
              </p>
              <p className="text-gray-700">
                Another technique is <strong>mixed-precision training</strong>, popularized by
                libraries like bitsandbytes. Instead of quantizing everything uniformly, you
                keep critical layers (like the first and last layers) in higher precision and
                quantize the middle layers more aggressively. The model gets most of the size
                savings without sacrificing accuracy on edge cases.
              </p>
              <p className="text-gray-700">
                These methods require more effort upfront, but they push quantization quality
                even further. Some researchers have achieved near-zero quality loss with INT4
                using QAT and careful mixed-precision strategies.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Time to see the trade-offs in action. The simulation below lets you toggle between
            different precisions and watch how a floating-point value gets quantized. Move the
            slider to try different numbers. Notice how INT4 snaps values to coarse steps, while
            FP16 barely changes anything. Check the model stats panel to see the size, speed,
            and quality implications of each choice.
          </p>

          <QuantizationSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Quantization reduces the precision of model weights from 32-bit or 16-bit floats down to 8-bit or 4-bit integers. This shrinks model size dramatically — often 4x to 8x smaller.',
            'Post-training quantization (GPTQ, AWQ) works by quantizing a pre-trained model layer by layer, using calibration data to minimize reconstruction error. It\'s the most common approach for open-source LLMs.',
            'GGUF is the standard file format for running quantized models locally with llama.cpp. Q4_K_M (4-bit k-quant) is the sweet spot: small size, near-original quality.',
            'Quantization to INT4 typically retains 92-95% of the original model quality. For most tasks, the difference is imperceptible — but the memory savings are massive.',
            'Beyond quantization, pruning (removing near-zero weights) and knowledge distillation (training a smaller student model) offer additional compression paths. These can be combined for extreme size reductions.',
          ]}
          misconceptions={[
            '"Quantization always hurts quality." — Not really. With modern methods like GPTQ and AWQ, INT4 models often perform nearly identically to FP16 on standard benchmarks. The precision loss matters less than you\'d expect.',
            '"You need special hardware to use quantized models." — Nope. GGUF models run on CPUs just fine. They\'re actually designed for consumer hardware. A MacBook can run a 70B INT4 model with no GPU at all.',
            '"Quantization is just rounding weights randomly." — That would be terrible. Modern quantization methods are calibrated — they use real data to figure out how to round intelligently. Some weights get more precision, others get less, based on importance.',
            '"Lower bits always mean faster inference." — Not always. INT4 is smaller, but if your hardware doesn\'t have optimized INT4 kernels, it might run slower than INT8 or even FP16. The speedup depends on the inference engine and hardware support.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why is GGUF the most common format for running LLMs locally on consumer hardware?"
          options={[
            { text: 'It uses lossless compression so there\'s no quality degradation', isCorrect: false },
            { text: 'It stores quantized weights efficiently and is optimized for CPU/GPU inference with llama.cpp', isCorrect: true },
            { text: 'It requires less than 1GB of memory for any model size', isCorrect: false },
            { text: 'It only works with models smaller than 7 billion parameters', isCorrect: false },
          ]}
          explanation="GGUF became the de facto standard for local LLM inference because it combines efficient quantized weight storage (INT4, INT8, mixed k-quants) with llama.cpp, an inference engine specifically optimized for consumer CPUs and GPUs. The format supports various quantization schemes (Q4_0, Q4_K_M, Q5_K_M, Q8_0) that balance size and quality, and llama.cpp makes it fast enough to run 70B models on laptops. It's not lossless — quantization always loses some precision — but the quality drop is minimal, and the memory savings make running large models locally actually feasible."
        />
      </LessonSection>
    </div>
  );
}
