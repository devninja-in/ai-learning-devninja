'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import InferenceSim from '@/components/simulations/InferenceSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function InferenceServingContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Training a model costs millions. Serving it costs... well, also a lot. Every time
            someone asks ChatGPT a question, a GPU cluster somewhere is doing billions of matrix
            multiplications. The challenge isn&apos;t just making models smart — it&apos;s making
            them fast and cheap enough to actually use.
          </p>

          <p className="text-gray-700 leading-relaxed">
            That&apos;s what inference optimization is all about. A naive implementation might
            generate 5 tokens per second and use 80GB of GPU memory for a 70B model. An optimized
            one? 80 tokens per second with the same hardware. That&apos;s a 16x improvement —
            the difference between a system that barely works and one that scales to millions of
            users.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The tricks aren&apos;t magic. They&apos;re engineering: KV-cache, Flash Attention,
            paged attention, continuous batching. Each one targets a specific bottleneck.
            Together, they transform LLMs from research demos into production-grade systems.
            Let&apos;s break down how they work.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="The inference bottleneck">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            LLMs generate text one token at a time, sequentially. You can&apos;t parallelize
            generation — each token depends on all the tokens before it. For a 100-token
            response, that&apos;s 100 separate forward passes through the entire model. Every
            single pass involves billions of operations.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Inference pipeline — one token at a time"
              nodes={[
                { id: 'input', label: 'User Request', type: 'input' },
                { id: 'queue', label: 'Queue', type: 'process' },
                { id: 'forward', label: 'GPU Forward Pass', type: 'process' },
                { id: 'repeat', label: 'Repeat × N tokens', type: 'process' },
                { id: 'response', label: 'Response', type: 'output' },
                { id: 'user', label: 'User', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The problem compounds when you have multiple users. If you process requests
            sequentially, user 2 waits for user 1 to finish their entire 100-token response
            before their first token even starts. The GPU sits mostly idle between requests.
            You&apos;re paying for expensive hardware that spends half its time doing nothing.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Worse, each forward pass recomputes attention over all previous tokens. Token 50
            has to attend to tokens 1-49. Token 51 has to attend to tokens 1-50. That&apos;s
            quadratic complexity — O(n²) — and it&apos;s the single biggest performance killer
            in transformer inference.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Inference optimization is about eliminating redundant work (KV-cache), making the
            necessary work faster (Flash Attention), managing memory efficiently (paged attention),
            and maximizing hardware utilization (continuous batching). Each technique attacks a
            different part of the bottleneck. Let&apos;s see how.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Making inference fast">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Modern inference engines like vLLM and TensorRT-LLM didn&apos;t just make things
            faster by accident. They systematically addressed each bottleneck in the inference
            pipeline with specific algorithmic and systems-level tricks. Here are the four big
            ones that matter most.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'KV-Cache — trade memory for speed',
                content: (
                  <div className="space-y-4">
                    <p>
                      When generating token 50, the model computes attention over tokens 1-49.
                      When generating token 51, it does the same computation again, plus token 50.
                      This is pure waste — the attention keys and values for tokens 1-49
                      haven&apos;t changed.
                    </p>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
                      <div className="text-sm space-y-2">
                        <div><strong>Without KV-cache:</strong> Recompute attention for all previous tokens every step.</div>
                        <div className="font-mono text-xs text-gray-600">
                          Token 1: compute K₁, V₁<br />
                          Token 2: compute K₁, V₁, K₂, V₂<br />
                          Token 3: compute K₁, V₁, K₂, V₂, K₃, V₃<br />
                          ...<br />
                          <span className="text-red-600">Complexity: O(n²)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
                      <div className="text-sm space-y-2">
                        <div><strong>With KV-cache:</strong> Store previous keys/values, only compute the new token.</div>
                        <div className="font-mono text-xs text-gray-600">
                          Token 1: compute K₁, V₁ → cache<br />
                          Token 2: compute K₂, V₂ → append to cache<br />
                          Token 3: compute K₃, V₃ → append to cache<br />
                          ...<br />
                          <span className="text-green-600">Complexity: O(n)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">The trade-off:</strong> KV-cache grows
                      linearly with sequence length. For a 70B model with a 2048-token context,
                      the cache can take 20-40GB of GPU memory. But the speedup is massive —
                      often 10-50x faster than recomputing everything.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Flash Attention — memory-efficient attention',
                content: (
                  <div className="space-y-4">
                    <p>
                      Standard attention materializes the full N×N attention matrix in GPU memory.
                      For a 2048-token sequence, that&apos;s 2048 × 2048 = 4 million elements per
                      attention head. With 32 heads, you&apos;re looking at 128 million floats
                      just for the attention scores.
                    </p>

                    <p className="text-sm">
                      Flash Attention rewrites the computation to never materialize that matrix.
                      Instead, it processes attention in small tiles that fit in the GPU&apos;s
                      fast SRAM (on-chip memory). It computes attention incrementally, one block
                      at a time, and only stores the final outputs.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                      <div className="text-sm">
                        <strong>Why this matters:</strong> GPU memory bandwidth is the bottleneck
                        for attention. Reading/writing to HBM (main GPU memory) is slow. SRAM is
                        50-100x faster. Flash Attention keeps the hot data in SRAM and minimizes
                        HBM traffic.
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Result:</strong> Flash Attention is 2-4x
                      faster than standard attention and uses far less memory. It&apos;s now the
                      default in most inference engines. Flash Attention 2 (and the upcoming v3)
                      push this even further with hardware-specific optimizations.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Paged Attention (vLLM) — virtual memory for KV-cache',
                content: (
                  <div className="space-y-4">
                    <p>
                      The KV-cache problem: you don&apos;t know how long a response will be when
                      you start generating. If you pre-allocate memory for the max possible length
                      (say, 2048 tokens), you waste memory on short responses. If you allocate
                      dynamically as you grow, you get fragmentation and expensive memory copies.
                    </p>

                    <p className="text-sm">
                      <strong className="text-gray-900">Paged Attention</strong> (the key innovation
                      in vLLM) manages the KV-cache like an operating system manages virtual memory.
                      Instead of one contiguous block per request, the cache is split into fixed-size
                      pages (typically 16 or 32 tokens). Pages are allocated on-demand and can be
                      scattered across GPU memory.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3">
                        <div className="text-red-700 font-medium mb-1">Contiguous allocation</div>
                        <div className="text-sm text-gray-700">
                          Allocate max length upfront. 50% average memory waste due to over-allocation.
                          Fragmentation on variable-length sequences.
                        </div>
                      </div>

                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3">
                        <div className="text-green-700 font-medium mb-1">Paged attention</div>
                        <div className="text-sm text-gray-700">
                          Allocate pages on-demand. Near-zero waste. Can share pages across requests
                          (e.g., for common system prompts). 60-80% memory reduction.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      This means you can fit 2-3x more requests in the same GPU memory. Higher
                      throughput, lower cost per token. vLLM&apos;s PagedAttention is the reason
                      it became the de facto standard for serving open-source LLMs.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Continuous Batching — no idle GPUs',
                content: (
                  <div className="space-y-4">
                    <p>
                      Traditional batching groups requests at the start and processes them together.
                      When the first request finishes (say, 20 tokens), the GPU keeps processing
                      the others. When the last request finishes (100 tokens), the batch is done.
                      But the GPU was idle for request 1 after token 20.
                    </p>

                    <p className="text-sm">
                      <strong className="text-gray-900">Continuous batching</strong> (also called
                      iteration-level batching or in-flight batching) doesn&apos;t wait for entire
                      batches to complete. The moment a request finishes, its slot is immediately
                      filled with a new request from the queue. The batch composition changes
                      every iteration.
                    </p>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-4">
                      <div className="text-sm space-y-2">
                        <div><strong>Key difference:</strong></div>
                        <div className="font-mono text-xs text-gray-700">
                          <strong>Static batching:</strong> [Req1, Req2, Req3, Req4] → all finish → next batch<br />
                          <strong>Continuous batching:</strong> [Req1, Req2, Req3, Req4] → Req1 done → add Req5 → Req3 done → add Req6 → ...
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong className="text-gray-900">Impact:</strong> GPU utilization goes from
                      60-70% to 95%+. Throughput increases by 2-10x depending on request distribution.
                      This is why inference engines like vLLM and TensorRT-LLM feel so much faster —
                      they never waste a single GPU cycle waiting.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Speculative decoding, tensor parallelism, and engine comparison">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                Beyond the four core techniques, there are a few more advanced optimizations
                worth knowing about:
              </p>
              <p className="text-gray-700">
                <strong>Speculative decoding</strong> uses a small, fast draft model to predict
                multiple tokens ahead. The main model then verifies them in parallel. If correct,
                you get 2-3 tokens per forward pass instead of 1. If wrong, you fall back to
                normal autoregressive generation. This works because the draft model is cheap
                and wrong predictions cost little to reject.
              </p>
              <p className="text-gray-700">
                <strong>Tensor parallelism</strong> splits a single model across multiple GPUs.
                Each GPU handles a slice of the weight matrices. This is necessary for models
                too large to fit on one GPU (like 70B or 175B models). The trade-off is
                communication overhead between GPUs, but modern interconnects like NVLink make
                this fast enough for production use.
              </p>
              <p className="text-gray-700">
                <strong>Engine comparison:</strong> vLLM is the most popular for serving
                open-source LLMs — best PagedAttention, continuous batching, and ecosystem
                support. TensorRT-LLM is faster on NVIDIA hardware with custom kernels but
                harder to set up. llama.cpp is CPU/edge-optimized, great for local inference
                but not built for high-throughput serving. SGLang is newer, focuses on
                structured generation (JSON, grammar constraints) with built-in optimization.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Time to see the optimizations in action. The simulation below has two parts:
            First, toggle between no KV-cache and with KV-cache to see the speed difference
            and memory trade-off. Second, compare sequential processing vs continuous batching
            to see how batching maximizes throughput. Watch the stats — the numbers tell the
            real story.
          </p>

          <InferenceSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'LLMs generate one token at a time sequentially, requiring a forward pass for each token. For a 100-token response, that\'s 100 forward passes through the entire model — the core inference bottleneck.',
            'KV-cache eliminates redundant computation by storing previous attention keys and values. This trades memory (cache grows linearly with sequence length) for speed (10-50x faster generation).',
            'Flash Attention rewrites attention to never materialize the full N×N matrix. It processes attention in tiles that fit in fast SRAM, reducing memory bandwidth bottlenecks by 2-4x.',
            'Paged Attention (vLLM) manages KV-cache like virtual memory — allocating pages on-demand instead of contiguous blocks. This reduces memory waste by 60-80%, fitting 2-3x more requests per GPU.',
            'Continuous batching processes multiple requests together and immediately fills slots when requests finish. This keeps GPU utilization at 95%+ vs 60-70% for static batching, often doubling throughput.',
          ]}
          misconceptions={[
            '"Inference is just running the model forward, there\'s not much to optimize." — Wrong. Naive inference wastes 90% of compute on redundant work and idle time. Optimized engines are 10-20x faster with the same hardware.',
            '"KV-cache always makes things faster." — Almost, but not always. For very short sequences (under 10 tokens), the memory overhead of managing the cache can outweigh the savings. Most production systems still use it because average sequences are long enough to benefit.',
            '"Flash Attention is only for training." — Nope. It\'s just as critical for inference. The memory bandwidth savings matter even more at inference time when you\'re bottlenecked by single-token generation latency.',
            '"You need multiple GPUs to serve LLMs fast." — Not necessarily. A single GPU with vLLM + Flash Attention + paged attention can serve a 13B model at 50-100 tokens/sec to dozens of concurrent users. Multi-GPU helps for larger models or higher scale, but one GPU is plenty for many use cases.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What does KV-cache trade for faster inference?"
          options={[
            { text: 'Model quality for speed — quantizing the attention computation', isCorrect: false },
            { text: 'GPU memory for computational speed — storing past keys/values to avoid recomputation', isCorrect: true },
            { text: 'Accuracy for throughput — skipping some attention heads', isCorrect: false },
            { text: 'Latency for batch size — processing more requests at once', isCorrect: false },
          ]}
          explanation="KV-cache stores the key and value tensors for all previously generated tokens in GPU memory. This cache grows linearly with sequence length (more memory usage), but it eliminates the need to recompute attention over past tokens at every step. Without KV-cache, generating token N requires recomputing attention over tokens 1 to N-1, which is O(n²) complexity. With KV-cache, you only compute attention for the new token against the cached keys/values, which is O(n). The trade-off is memory (cache takes 20-40GB for a 70B model at 2K context) for massive speed gains (often 10-50x faster). This is not quantization (which reduces precision), and it doesn't skip computation — it just eliminates redundant work."
        />
      </LessonSection>
    </div>
  );
}
