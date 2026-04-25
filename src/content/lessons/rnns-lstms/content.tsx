'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import RNNSim from '@/components/simulations/RNNSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function RNNsLSTMsContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Read this sentence: &quot;The cat sat on the ___.&quot; You instantly
            know the blank should be something like &quot;mat&quot; or
            &quot;floor.&quot; Your brain remembers what came before. Regular
            neural networks can&apos;t do this &mdash; they see each input in
            isolation, with no memory of what came before. RNNs were built to
            fix that.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Think about how you read. You don&apos;t throw away everything
            you&apos;ve read so far and start fresh at every word. You carry
            context forward. When you see the word &quot;bank,&quot; whether it
            means a financial institution or a riverbank depends entirely on the
            words that came before it. Meaning lives in sequences, not in
            isolated tokens.
          </p>

          <p className="text-gray-700 leading-relaxed">
            A standard feedforward neural network takes a fixed-size input and
            produces a fixed-size output. It has no notion of &quot;before&quot;
            or &quot;after.&quot; You could shuffle the words in a sentence and
            the network wouldn&apos;t know the difference. Recurrent Neural
            Networks (RNNs) solve this by adding a loop: the output from one
            step becomes part of the input for the next step. They process
            sequences one element at a time, carrying a hidden state that acts
            as a running summary of everything they&apos;ve seen so far.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Networks with memory">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The key insight of an RNN is simple: <strong>order matters</strong>.
            The sentence &quot;dog bites man&quot; means something entirely
            different from &quot;man bites dog.&quot; Same words, different
            sequence, different meaning. An RNN processes inputs sequentially
            and maintains a <strong>hidden state</strong> &mdash; a vector of
            numbers that gets updated at every time step. This hidden state is
            the network&apos;s memory.
          </p>

          <p className="text-gray-700 leading-relaxed">
            At each step, the RNN takes two inputs: the current word (or token)
            and the hidden state from the previous step. It combines them,
            applies a transformation, and produces a new hidden state plus an
            output. The hidden state carries information from all previous words
            forward through the sequence, like a baton being passed in a relay
            race.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="How an RNN processes a sequence"
              nodes={[
                { id: 'w1', label: 'Word 1', type: 'input' },
                { id: 'rnn1', label: 'RNN Cell', sublabel: '+ Hidden State', type: 'process' },
                { id: 'w2', label: 'Word 2', type: 'input' },
                { id: 'rnn2', label: 'RNN Cell', sublabel: '+ Hidden State', type: 'process' },
                { id: 'dots', label: '...', type: 'attention' },
                { id: 'out', label: 'Output', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            It&apos;s the same RNN cell at every step &mdash; it reuses the same
            weights. This <strong>weight sharing</strong> is what makes RNNs
            work regardless of sequence length. A network trained on 10-word
            sentences can process 100-word sentences because the same cell
            unrolls for as many steps as needed. The hidden state is the thread
            that stitches each step together into a coherent understanding of
            the whole sequence.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="From simple memory to smart memory">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The basic RNN idea is elegant, but it has a fatal flaw. Understanding
            that flaw &mdash; and the solutions designed to overcome it &mdash;
            is the story of how we got from simple recurrence all the way to the
            transformers that power modern AI.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: The Simple RNN',
                content: (
                  <div className="space-y-4">
                    <p>
                      A simple RNN passes a hidden state from one time step to the next.
                      At each step, the new hidden state is computed from the current input
                      and the previous hidden state using a <strong className="text-white">
                      tanh activation function</strong>.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Current Word</span>
                        <div className="text-white text-xs mt-1 font-mono">x_t</div>
                      </div>
                      <div className="text-gray-500 text-xl">+</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Previous State</span>
                        <div className="text-white text-xs mt-1 font-mono">h_(t-1)</div>
                      </div>
                      <div className="text-gray-500 text-xl">&rarr;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">New State</span>
                        <div className="text-white text-xs mt-1 font-mono">h_t = tanh(W&middot;[h_(t-1), x_t])</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This works beautifully for short sequences. Predicting the next
                      character in &quot;clo_d&quot; (cloud) is easy &mdash; the context is
                      right there. But what about remembering something from 50 words ago?
                      That&apos;s where things break down.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: The Vanishing Gradient Problem',
                content: (
                  <div className="space-y-4">
                    <p>
                      During backpropagation, gradients must travel backward through every
                      time step. At each step, the gradient gets multiplied by the weight
                      matrix and the derivative of the activation function. When these
                      multiplied values are less than 1 (which they usually are),
                      the gradient <strong className="text-white">shrinks
                      exponentially</strong>.
                    </p>

                    <div className="grid grid-cols-5 gap-2 my-6">
                      {[1.0, 0.7, 0.49, 0.34, 0.24].map((val, i) => (
                        <div key={i} className="text-center">
                          <div
                            className="mx-auto rounded-lg border-2 border-blue-500 flex items-center justify-center"
                            style={{
                              width: 48,
                              height: 48,
                              backgroundColor: `rgba(59, 130, 246, ${val * 0.3})`,
                              opacity: 0.3 + val * 0.7,
                            }}
                          >
                            <span className="text-xs text-white font-mono">{val.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 block">Step {i + 1}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-gray-400">
                      After 10-20 steps, the gradient effectively reaches zero. The network
                      can&apos;t learn from errors that depend on early inputs &mdash; it
                      has &quot;forgotten&quot; them. This is like trying to whisper a
                      message through a chain of 20 people: by the end, the original
                      message is gone. Conversely, if gradients grow instead of shrink
                      (the <em>exploding</em> gradient problem), training becomes
                      unstable.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: LSTM — Learning What to Remember',
                content: (
                  <div className="space-y-4">
                    <p>
                      Long Short-Term Memory (LSTM) networks, introduced in 1997 by
                      Hochreiter and Schmidhuber, solve the vanishing gradient problem
                      with a clever mechanism: a <strong className="text-white">cell
                      state</strong> that acts as a highway for information, and three
                      <strong className="text-white"> gates</strong> that control the
                      flow of information in and out.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Forget Gate</span>
                        <div className="text-white text-xs mt-2">
                          Decides what to <em>throw away</em> from the cell state.
                          &quot;Is this old info still relevant?&quot;
                        </div>
                      </div>
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Input Gate</span>
                        <div className="text-white text-xs mt-2">
                          Decides what <em>new information</em> to store.
                          &quot;Is this word important enough to remember?&quot;
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Output Gate</span>
                        <div className="text-white text-xs mt-2">
                          Decides what to <em>output</em> from the cell state.
                          &quot;What&apos;s relevant for the next step?&quot;
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The cell state runs along the top of the network like a conveyor
                      belt. Information can flow along it unchanged &mdash; that&apos;s how
                      LSTMs maintain long-range memory. The gates are learned neural
                      networks themselves (sigmoid activations that output values between 0
                      and 1), so the LSTM learns <em>what</em> to remember and forget
                      during training, not just <em>how</em> to process inputs.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: GRU — The Streamlined Alternative',
                content: (
                  <div className="space-y-4">
                    <p>
                      The Gated Recurrent Unit (GRU), introduced by Cho et al. in 2014,
                      simplifies the LSTM by merging the forget and input gates into a
                      single <strong className="text-white">update gate</strong> and
                      combining the cell state and hidden state. The result: just
                      <strong className="text-white"> 2 gates</strong> instead of 3.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-5 py-4 text-center">
                        <span className="text-blue-400 text-sm font-medium">LSTM</span>
                        <div className="text-white text-xs mt-2 font-mono">
                          3 gates &middot; cell state + hidden state
                        </div>
                        <div className="text-gray-500 text-xs mt-1">More parameters</div>
                      </div>
                      <div className="text-gray-500 text-xl">vs</div>
                      <div className="border-2 border-emerald-500 bg-emerald-500/10 rounded-lg px-5 py-4 text-center">
                        <span className="text-emerald-400 text-sm font-medium">GRU</span>
                        <div className="text-white text-xs mt-2 font-mono">
                          2 gates &middot; hidden state only
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Faster to train</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      GRUs use a <strong className="text-gray-300">reset gate</strong> (how
                      much past info to forget) and an <strong className="text-gray-300">
                      update gate</strong> (how much new info to add). In practice, GRUs
                      and LSTMs perform comparably on most tasks. GRUs are often preferred
                      when training speed matters and the dataset isn&apos;t enormous,
                      while LSTMs can have an edge on very long sequences where fine-grained
                      memory control is critical.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Bidirectional RNNs, seq2seq, and the rise of transformers">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Bidirectional RNNs</strong> process the sequence in both
                directions &mdash; left-to-right and right-to-left &mdash; and
                concatenate the hidden states. This gives the network context from
                both the past and the future at every position. This is crucial for
                tasks like named entity recognition, where you need to know what
                comes after a word to understand it (&quot;Apple&quot; the company
                vs. &quot;apple&quot; the fruit).
              </p>
              <p className="text-gray-700">
                <strong>Sequence-to-sequence (seq2seq) models</strong> use an
                encoder RNN to compress an input sequence into a fixed-length
                vector, then a decoder RNN to generate an output sequence from
                that vector. This architecture powered early machine translation
                systems (Google Translate used it from 2016). The bottleneck was
                cramming an entire sentence into a single vector &mdash; which led
                to the invention of the attention mechanism.
              </p>
              <p className="text-gray-700">
                <strong>Why transformers replaced RNNs:</strong> RNNs process
                sequences step by step, which means they can&apos;t be easily
                parallelized on GPUs. A 1000-word document requires 1000
                sequential steps. Transformers process all positions simultaneously
                using self-attention, making them orders of magnitude faster to
                train. The attention mechanism also eliminates the distance problem
                entirely &mdash; every word can attend directly to every other word
                regardless of position. The 2017 &quot;Attention Is All You
                Need&quot; paper showed that you don&apos;t need recurrence at all.
                But the concepts from RNNs &mdash; sequential processing, hidden
                states, gating &mdash; are foundational to understanding why
                transformers were designed the way they were.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Watch sequence processing in action">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s an interactive visualization of how RNNs and LSTMs process
            a sentence word by word. Watch the hidden state ball pass from word to
            word, carrying information forward. In Simple RNN mode, notice how the
            signal fades over long sequences. Switch to LSTM mode to see how the
            cell state highway and gates keep information alive. Try typing your
            own sentences to experiment with different lengths.
          </p>

          <RNNSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'RNNs process sequences one step at a time, maintaining a hidden state that carries context forward. The same cell with the same weights is reused at every step — this weight sharing lets RNNs handle variable-length inputs.',
            'The vanishing gradient problem is the fundamental limitation of simple RNNs: gradients shrink exponentially during backpropagation through time, making it impossible for the network to learn dependencies between words that are far apart in the sequence.',
            'LSTMs solve the vanishing gradient problem with a cell state highway and three learned gates (forget, input, output) that control information flow. The cell state can carry information across many time steps without degradation.',
            'GRUs are a simplified alternative to LSTMs with only two gates (reset and update). They often perform comparably while being faster to train, making them a practical choice for many sequence tasks.',
            'RNNs and LSTMs were the dominant architecture for NLP from 2013-2017 and directly inspired the attention mechanism and transformer architecture that powers today\'s large language models.',
          ]}
          misconceptions={[
            '"RNNs are obsolete." — While transformers dominate NLP, RNNs and LSTMs are still widely used for real-time streaming data, edge devices with limited memory, time-series forecasting, and any task where processing must happen one step at a time. They\'re also making a comeback in hybrid architectures like RWKV and Mamba.',
            '"LSTMs can remember everything forever." — LSTMs are much better than simple RNNs at long-range dependencies, but they still struggle with very long sequences (hundreds of tokens). The cell state does degrade over time, just much more slowly. This limitation is precisely what motivated the development of attention mechanisms.',
            '"More gates always means better performance." — GRUs with 2 gates often match LSTMs with 3 gates. The right architecture depends on the task, data size, and computational budget. Simpler models can outperform complex ones when data is limited.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What core problem do LSTMs solve that simple RNNs cannot handle well?"
          options={[
            { text: 'Processing variable-length input sequences', isCorrect: false },
            { text: 'Remembering long-range dependencies by preventing vanishing gradients', isCorrect: true },
            { text: 'Running faster on GPUs through parallel processing', isCorrect: false },
            { text: 'Handling multiple languages simultaneously', isCorrect: false },
          ]}
          explanation="Simple RNNs can already handle variable-length sequences — that's their core design. The problem is that during backpropagation, gradients shrink exponentially as they travel through many time steps (the vanishing gradient problem). This means simple RNNs can't learn to connect information from early in a sequence to decisions later. LSTMs solve this with a cell state highway and three gates (forget, input, output) that let gradients flow backward through the cell state without shrinking, enabling the network to learn long-range dependencies. Note that LSTMs don't help with parallel processing — that's the key innovation of transformers."
        />
      </LessonSection>
    </div>
  );
}
