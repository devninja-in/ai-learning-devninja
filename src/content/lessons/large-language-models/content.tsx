'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import LLMSim from '@/components/simulations/LLMSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function LargeLanguageModelsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            GPT-3 has 175 billion parameters. Claude? Even more. Llama 3 comes
            in sizes from 8 billion to 405 billion. These numbers are staggering,
            but what do they actually mean? And why did making models bigger
            suddenly make them so much smarter? The story of LLMs is really a
            story about scale &mdash; and the surprises that came with it.
          </p>

          <p className="text-gray-700 leading-relaxed">
            For decades, language models existed. They could autocomplete a
            search query or suggest the next word on your phone keyboard.
            Useful, but not exactly mind-blowing. Then researchers started
            scaling up Transformers &mdash; throwing more data, more parameters,
            and more compute at them &mdash; and something unexpected happened.
            These models didn&apos;t just get incrementally better at predicting
            the next word. They started writing essays, solving math problems,
            and writing code. Capabilities that nobody explicitly programmed
            seemed to emerge out of raw scale.
          </p>

          <p className="text-gray-700 leading-relaxed">
            That&apos;s the phenomenon we&apos;re going to unpack in this
            lesson. What makes a language model &quot;large,&quot; how the major
            model families differ, what scaling laws tell us about throwing
            money at the problem, and why a model trained to do nothing more
            than predict the next token can end up doing things that look
            remarkably like reasoning.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="What makes a language model 'large'?">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            At its core, a large language model is just a Transformer trained on
            a <em>lot</em> of text to predict the next word. That&apos;s it.
            The same architecture we covered in the last lesson &mdash;
            multi-head attention, feed-forward layers, residual connections,
            layer norm &mdash; scaled up dramatically. More layers, wider
            embeddings, more attention heads, and training data measured in
            trillions of tokens scraped from books, websites, code repositories,
            and more.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The &quot;large&quot; in LLM refers to the parameter count. A
            parameter is a single number the model learned during training
            &mdash; a weight in a matrix, a bias term. GPT-2 had 1.5 billion
            of them. GPT-3 jumped to 175 billion. Modern frontier models have
            hundreds of billions or more. Each parameter is a tiny knob the
            model has tuned to get better at its one job: predicting what
            comes next in a sequence.
          </p>

          <p className="text-gray-700 leading-relaxed">
            But here&apos;s the key insight: better next-word prediction turns
            out to require understanding grammar, facts, logic, sentiment,
            coding patterns, and much more. To predict the next word in a
            physics textbook, you need to &quot;understand&quot; physics. To
            complete a Python function, you need to &quot;understand&quot;
            programming. The training objective is simple, but mastering it
            requires immense general knowledge.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The LLM pipeline"
              nodes={[
                { id: 'prompt', label: 'Prompt', sublabel: 'Your text input', type: 'input' },
                { id: 'llm', label: 'LLM', sublabel: 'Billions of parameters', type: 'attention' },
                { id: 'probs', label: 'Next Token Probs', sublabel: 'Probability distribution', type: 'process' },
                { id: 'text', label: 'Generated Text', sublabel: 'Word by word', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The flow is deceptively simple. You feed in a prompt, the model
            produces a probability distribution over its vocabulary for the next
            token, you sample from that distribution, append the chosen token,
            and repeat. Every response you&apos;ve ever gotten from ChatGPT,
            Claude, or Llama was generated this way &mdash; one token at a time,
            each one chosen based on everything that came before it.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="The LLM family tree">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Not all LLMs are built the same way. The Transformer architecture
            gave rise to several distinct families, each with different
            strengths. Understanding these families is essential for knowing
            which model to use &mdash; and why.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Encoder Models (BERT)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Encoder models read text <strong className="text-white">bidirectionally</strong>
                      &mdash; every token can attend to every other token, including
                      ones that come after it. BERT (Bidirectional Encoder
                      Representations from Transformers) is the most famous example.
                      It was trained with a &quot;masked language model&quot;
                      objective: randomly hide 15% of words and predict them from
                      context.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Best at</span>
                        <div className="text-white text-xs mt-2">
                          Classification, sentiment analysis, named entity
                          recognition, search ranking, question answering
                        </div>
                      </div>
                      <div className="border-2 border-indigo-500/50 bg-indigo-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-indigo-400 text-sm font-medium">Not great at</span>
                        <div className="text-white text-xs mt-2">
                          Text generation &mdash; bidirectional attention means
                          it cannot generate text left-to-right naturally
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      BERT-base has 110M parameters, BERT-large has 340M. Tiny
                      by today&apos;s standards, but it revolutionized NLP in
                      2018. Variants like RoBERTa, ALBERT, and DeBERTa refined
                      the recipe. Encoder models dominate search engines,
                      content moderation, and enterprise NLP pipelines to this day.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Decoder Models (GPT, Llama, Claude)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Decoder models generate text <strong className="text-white">left-to-right</strong>,
                      one token at a time. They use <strong className="text-white">causal masking</strong>
                      &mdash; each token can only see itself and the tokens before it,
                      never the future. This is the architecture behind GPT, Claude,
                      Llama, Mistral, and most chatbots you&apos;ve used.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">GPT series</span>
                        <div className="text-white text-xs mt-2">
                          OpenAI. GPT-2 (1.5B) &rarr; GPT-3 (175B) &rarr;
                          GPT-4 (rumored 1.8T MoE)
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Llama series</span>
                        <div className="text-white text-xs mt-2">
                          Meta. Open-weight. Llama 2 (7B&ndash;70B) &rarr;
                          Llama 3 (8B&ndash;405B)
                        </div>
                      </div>
                      <div className="border-2 border-emerald-500/50 bg-emerald-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-emerald-400 text-sm font-medium">Claude</span>
                        <div className="text-white text-xs mt-2">
                          Anthropic. Trained with Constitutional AI and RLHF for
                          safety and helpfulness
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The training objective is simple: given all tokens so far,
                      predict the next one. This is called <em>autoregressive
                      language modeling</em>. Despite its simplicity, training on
                      trillions of tokens produces models capable of chat, code
                      generation, creative writing, analysis, and much more.
                      The key advantage of decoder models is their natural fit
                      for generation tasks.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Encoder-Decoder Models (T5, BART)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Encoder-decoder models combine both approaches. The
                      <strong className="text-white"> encoder</strong> reads the
                      full input bidirectionally, building a deep representation.
                      The <strong className="text-white">decoder</strong> then
                      generates an output sequence, attending to the encoder&apos;s
                      representation via cross-attention.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-emerald-500/50 bg-emerald-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-emerald-400 text-sm font-medium">T5</span>
                        <div className="text-white text-xs mt-2">
                          Google&apos;s &quot;Text-to-Text Transfer Transformer.&quot;
                          Every NLP task framed as text &rarr; text. Summarize,
                          translate, answer, classify &mdash; all with one model.
                        </div>
                      </div>
                      <div className="border-2 border-rose-500/50 bg-rose-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-rose-400 text-sm font-medium">BART</span>
                        <div className="text-white text-xs mt-2">
                          Meta&apos;s denoising autoencoder. Trained by corrupting
                          text (masking, deleting, shuffling) and learning to
                          reconstruct it. Excels at summarization.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Encoder-decoder models dominated machine translation (the
                      original Transformer was this type). Today they&apos;re less
                      common for general chat, since decoder-only models proved
                      easier to scale and surprisingly effective. But they remain
                      important for structured tasks like summarization and
                      translation where the input and output are distinct.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Scaling Laws and Emergent Abilities',
                content: (
                  <div className="space-y-4">
                    <p>
                      In 2020, researchers at OpenAI published a landmark paper
                      showing that LLM performance follows remarkably
                      <strong className="text-white"> predictable scaling laws</strong>.
                      Loss (how wrong the model is) decreases as a smooth power
                      law of three factors: model size, dataset size, and compute.
                      Double any of them, and you get a predictable improvement.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Parameters</span>
                        <div className="text-white text-xs mt-2">
                          More weights = more capacity to store knowledge and
                          patterns. 175B vs 7B matters enormously.
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Training Data</span>
                        <div className="text-white text-xs mt-2">
                          Chinchilla showed: you need ~20 tokens per parameter
                          for optimal training. Llama 3 used 15T tokens.
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Compute (FLOPs)</span>
                        <div className="text-white text-xs mt-2">
                          Training GPT-4 reportedly cost $100M+ in compute.
                          Scaling requires massive GPU clusters.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The most intriguing finding is <em>emergent abilities</em>:
                      capabilities that appear abruptly once a model crosses a
                      certain size threshold. Small models cannot do chain-of-thought
                      reasoning, but at ~100B parameters it clicks. Arithmetic,
                      code generation, and multi-step logic all seem to &quot;turn
                      on&quot; at specific scales. The <strong className="text-gray-300">
                      Chinchilla paper</strong> (2022) showed that many models
                      were over-parameterized and under-trained &mdash; for a fixed
                      compute budget, you should scale data and parameters together.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Parameter counts, tokenomics, and open vs closed models">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Parameter count vs intelligence:</strong> Parameter
                count is a rough proxy for model capability, but it&apos;s not
                the whole story. Architecture matters (Mixture-of-Experts models
                like Mixtral have many parameters but only activate a fraction
                per token). Training data quality matters enormously &mdash; a
                7B model trained on carefully curated data can outperform a 70B
                model trained on noisy web scrapes. And post-training techniques
                like RLHF and Constitutional AI can dramatically change a
                model&apos;s behavior without changing its parameter count.
              </p>
              <p className="text-gray-700">
                <strong>Tokenomics (context windows and cost):</strong> LLMs
                process text in tokens (roughly 4 characters each). The context
                window is the maximum number of tokens the model can consider at
                once. GPT-3 had a 4K context window. GPT-4 supports 128K.
                Claude supports up to 200K tokens. Longer context windows enable
                processing entire books or codebases, but cost scales with the
                square of context length (attention is O(n&sup2;) without
                optimizations like Flash Attention). API pricing is typically per
                token, with input tokens cheaper than output tokens.
              </p>
              <p className="text-gray-700">
                <strong>Open vs closed models:</strong> GPT-4 and Claude are
                closed-source &mdash; you access them via API but cannot see the
                weights. Llama, Mistral, and Gemma are open-weight: you can
                download and run them yourself, fine-tune them, and deploy them
                on your own hardware. Open models have driven enormous innovation
                through community fine-tuning, quantization research, and novel
                applications. The gap between open and closed models has narrowed
                dramatically, with Llama 3 405B approaching GPT-4 level
                performance on many benchmarks.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="See next-token prediction in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            This is a simplified version of what every LLM does. Pick a prompt,
            and the model shows you the probability distribution over the next
            word. Adjust the <strong>temperature</strong> to control randomness and
            <strong> top-k</strong> to limit which candidates are considered.
            Click &quot;Generate&quot; to sample a word and build text one token
            at a time &mdash; just like GPT, Claude, and Llama do it.
          </p>

          <LLMSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'An LLM is a Transformer trained on massive text data to predict the next token. The "large" refers to parameter count — from billions to hundreds of billions of learned weights. More parameters means more capacity to store knowledge, but also requires proportionally more data and compute.',
            'Decoder-only models (GPT, Claude, Llama) generate text left-to-right using causal masking and dominate modern AI. Encoder models (BERT) excel at understanding tasks. Encoder-decoder models (T5, BART) connect understanding to generation and are still used for translation and summarization.',
            'Scaling laws show that LLM performance improves predictably as you increase model size, data, and compute. The Chinchilla paper proved that for optimal results, you should scale data and parameters together — many early models were too large for their training data.',
            'Emergent abilities — capabilities like chain-of-thought reasoning, arithmetic, and code generation — appear unexpectedly once models cross certain size thresholds. Nobody designed these abilities; they arise from the pressure to predict the next token better and better.',
            'Temperature and top-k control how the model samples from its probability distribution. Low temperature produces focused, predictable text. High temperature produces diverse, creative (but potentially incoherent) text. This is the same mechanism used in every chatbot you have ever used.',
          ]}
          misconceptions={[
            '"LLMs don\'t truly understand — they predict statistically likely continuations." This is technically accurate but can be misleading. Yes, the training objective is next-token prediction. But to achieve state-of-the-art prediction, a model must build internal representations that capture grammar, facts, logic, and reasoning patterns. Whether this constitutes "understanding" is an open philosophical question, but dismissing it as "just statistics" undersells what these models have learned to do.',
            '"Bigger is always better." The Chinchilla paper showed this is wrong. A 70B model trained on the right amount of data outperforms a 280B model trained on too little data. Architecture innovations (Mixture of Experts, better attention mechanisms), data quality, and post-training alignment all matter as much as raw parameter count.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why do decoder-only models (like GPT and Claude) generate text from left to right, one token at a time?"
          options={[
            { text: 'Because they use bidirectional attention and need to see the whole sequence first', isCorrect: false },
            { text: 'Because they use causal masking — each token can only attend to previous tokens, so future tokens are invisible during generation', isCorrect: true },
            { text: 'Because generating multiple tokens at once would require too much memory', isCorrect: false },
            { text: 'Because the tokenizer processes text sequentially from left to right', isCorrect: false },
          ]}
          explanation="Decoder-only models use causal masking (also called autoregressive masking) in their self-attention layers. This means when computing attention for token at position N, the model can only look at positions 0 through N — never positions N+1 and beyond. During training, this prevents the model from 'cheating' by peeking at the answer. During generation, it reflects reality: when generating the 10th word, the 11th word doesn't exist yet. This is fundamentally different from encoder models like BERT, which use bidirectional attention and can see the entire input at once. The causal mask is what makes decoder models natural text generators — each new token is predicted based solely on the context that came before it."
        />
      </LessonSection>
    </div>
  );
}
