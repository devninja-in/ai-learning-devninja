'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import NetworkDiagram from '@/components/diagrams/NetworkDiagram';
import NeuralNetSim from '@/components/simulations/NeuralNetSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function NeuralNetworksContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Your brain has about 86 billion neurons. Each one is pretty simple on its
            own &mdash; it receives signals from other neurons, and if the combined signal
            is strong enough, it fires and sends its own signal forward. That&apos;s it.
            But 86 billion of these simple things, wired together? That&apos;s enough to
            write poetry, recognize faces, and argue about pizza toppings.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Artificial neural networks borrow this idea &mdash; but dramatically
            simplified. We&apos;re not building a brain. We&apos;re building something
            much dumber, but still surprisingly powerful: layers of tiny math functions,
            each one taking numbers in and passing numbers out, connected together in ways
            that let the whole system learn patterns no single piece could ever find on
            its own.
          </p>

          <p className="text-gray-700 leading-relaxed">
            In this lesson, you&apos;ll see how a single artificial neuron works, how you
            stack them into layers to build a network, and how the network actually
            learns &mdash; the famous process called <strong>backpropagation</strong>. By
            the end, you&apos;ll have a working intuition for the architecture behind
            everything from image recognition to ChatGPT.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="What is a neural network?">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s start small &mdash; with a single artificial neuron (sometimes
            called a <strong>perceptron</strong>). It does four things:
          </p>

          <ol className="text-gray-700 leading-relaxed list-decimal list-inside space-y-1">
            <li>Takes in one or more <strong>inputs</strong> (just numbers).</li>
            <li>Multiplies each input by a <strong>weight</strong> &mdash; a number that
              controls how much that input matters.</li>
            <li>Adds everything up, plus a <strong>bias</strong> (a constant offset).</li>
            <li>Passes the result through an <strong>activation function</strong> that
              decides whether and how strongly the neuron &quot;fires.&quot;</li>
          </ol>

          <p className="text-gray-700 leading-relaxed">
            That&apos;s genuinely it. Multiply, add, squish through a function. Here&apos;s
            the flow:
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="A single neuron"
              nodes={[
                { id: 'inputs', label: 'Inputs', type: 'input' },
                { id: 'weights', label: 'Weights x', sublabel: '(multiply)', type: 'process' },
                { id: 'sum', label: 'Sum + Bias', type: 'process' },
                { id: 'activation', label: 'Activation', type: 'attention' },
                { id: 'output', label: 'Output', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            One neuron by itself isn&apos;t very useful. It can only learn simple,
            straight-line patterns. The magic happens when you <em>stack neurons into
            layers</em>. An <strong>input layer</strong> receives the raw data. One or more
            <strong> hidden layers</strong> transform it step by step. And an
            <strong> output layer</strong> produces the final answer.
          </p>

          <div className="not-prose">
            <NetworkDiagram
              layers={[2, 4, 3, 1]}
              title="A sample neural network architecture"
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            Each circle above is a neuron. Each line is a weighted connection. Data flows
            left to right: inputs come in, get transformed layer by layer, and a prediction
            comes out the other side. More layers means the network can learn more complex
            patterns &mdash; that&apos;s the &quot;deep&quot; in
            &quot;deep learning.&quot; A network with two hidden layers might learn to
            distinguish cats from dogs. One with dozens of layers can generate
            photorealistic images or hold a conversation.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="How a network learns">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Building a network is one thing. Teaching it to do something useful is another.
            The learning process is surprisingly mechanical &mdash; it&apos;s the same
            five-step loop, repeated thousands or millions of times. Click through to see
            how it works.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Forward Pass',
                content: (
                  <div className="space-y-4">
                    <p>
                      Data flows left to right through the network. Each neuron takes its inputs,
                      multiplies by weights, adds the bias, and applies the activation function.
                      The result passes to the next layer until you get a final output.
                    </p>

                    <div className="flex items-center justify-center gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-blue-400 text-sm font-medium">Input</span>
                        <div className="text-white text-sm mt-1 font-mono">[0.8, 0.3]</div>
                      </div>
                      <div className="text-gray-500">&rarr;</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Hidden</span>
                        <div className="text-white text-sm mt-1 font-mono">[0.6, 0.0, 0.4]</div>
                      </div>
                      <div className="text-gray-500">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Output</span>
                        <div className="text-white text-sm mt-1 font-mono">0.73</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      At first, with random weights, the output is meaningless. That&apos;s fine &mdash;
                      the network hasn&apos;t learned anything yet.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Loss Calculation',
                content: (
                  <div className="space-y-4">
                    <p>
                      Compare the network&apos;s output to the <strong className="text-white">correct
                      answer</strong>. The difference is the <strong className="text-white">loss</strong> &mdash;
                      a single number that tells you how wrong the network is.
                    </p>

                    <div className="flex items-center justify-center gap-4 my-6">
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Predicted</span>
                        <div className="text-white text-lg mt-1 font-mono font-bold">0.73</div>
                      </div>
                      <div className="text-gray-500 text-2xl font-bold">vs</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Actual</span>
                        <div className="text-white text-lg mt-1 font-mono font-bold">1.00</div>
                      </div>
                      <div className="text-gray-500 text-2xl">=</div>
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-red-400 text-sm font-medium">Loss</span>
                        <div className="text-white text-lg mt-1 font-mono font-bold">0.27</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Lower loss = better predictions. The entire goal of training is to
                      minimize this number.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Backward Pass (Backpropagation)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Now comes the clever part. Starting from the output, work <strong className="text-white">backwards</strong> through
                      the network, calculating how much each weight contributed to the error.
                      This uses the chain rule from calculus &mdash; but you don&apos;t need
                      to know calculus to get the idea.
                    </p>

                    <div className="flex items-center justify-center gap-3 my-6">
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-red-400 text-sm font-medium">Error</span>
                        <div className="text-white text-xs mt-1">How wrong?</div>
                      </div>
                      <div className="text-gray-500">&larr;</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Gradients</span>
                        <div className="text-white text-xs mt-1">Who&apos;s to blame?</div>
                      </div>
                      <div className="text-gray-500">&larr;</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Gradients</span>
                        <div className="text-white text-xs mt-1">Trace blame back</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Think of it like figuring out who&apos;s responsible for a team
                      failure. Each weight gets a &quot;blame score&quot; (gradient) that
                      tells you how much it should change.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Weight Update (Gradient Descent)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Nudge every weight in the direction that <strong className="text-white">reduces the
                      error</strong>. Weights that contributed a lot to the mistake get bigger
                      adjustments. Weights that were already doing well barely change.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
                      <div className="border-2 border-gray-600 bg-gray-700/50 rounded-lg px-4 py-3 text-center">
                        <span className="text-gray-400 text-sm font-medium">Old weight</span>
                        <div className="text-white text-sm mt-1 font-mono">0.50</div>
                      </div>
                      <div className="text-gray-500">&minus;</div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">lr x gradient</span>
                        <div className="text-white text-sm mt-1 font-mono">0.01 x (-0.3)</div>
                      </div>
                      <div className="text-gray-500">=</div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">New weight</span>
                        <div className="text-white text-sm mt-1 font-mono">0.503</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The <strong className="text-white">learning rate</strong> (lr) controls
                      how big each step is. Too big and you overshoot. Too small and training
                      takes forever. Finding the right balance is part of the art.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 5: Repeat',
                content: (
                  <div className="space-y-4">
                    <p>
                      Do this whole thing again with the next training example. And the next.
                      And the next. <strong className="text-white">Thousands or millions of
                      times</strong>, each time nudging the weights a little closer to values
                      that produce correct outputs.
                    </p>

                    <div className="grid grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-red-400 text-sm font-medium">Epoch 1</span>
                        <div className="text-white text-sm mt-1 font-mono">Loss: 2.4</div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Epoch 100</span>
                        <div className="text-white text-sm mt-1 font-mono">Loss: 0.3</div>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Epoch 1000</span>
                        <div className="text-white text-sm mt-1 font-mono">Loss: 0.01</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      One full pass through all training data is called an <strong className="text-white">epoch</strong>.
                      Most models train for hundreds or thousands of epochs. The loss should
                      steadily decrease &mdash; that&apos;s how you know it&apos;s learning.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-gray-700 leading-relaxed">
            That five-step loop &mdash; forward pass, loss, backpropagation, weight update,
            repeat &mdash; is the core of how virtually every neural network learns. The
            same basic process powers image classifiers that detect cancer, recommendation
            engines that pick your next binge watch, and the language model generating text
            right now when you talk to ChatGPT. The architectures get fancier, the datasets
            get bigger, the hardware gets faster &mdash; but the loop stays the same.
          </p>

          <GoDeeper title="Activation functions and why they matter">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                Activation functions are what give neural networks their power. Without them,
                stacking layers would be pointless &mdash; multiple linear transformations
                collapse into a single one. The activation function introduces
                <em> non-linearity</em>, letting the network learn curved, complex boundaries
                instead of just straight lines.
              </p>
              <p className="text-gray-700">
                <strong>ReLU</strong> (Rectified Linear Unit) is the most popular: if the
                input is positive, pass it through unchanged; if negative, output zero. It&apos;s
                simple, fast, and works surprisingly well.
                <strong> Sigmoid</strong> squashes values between 0 and 1 &mdash; great for
                outputting probabilities. <strong>Softmax</strong> is like sigmoid for multiple
                classes: it converts a vector of numbers into probabilities that sum to 1.
              </p>
              <p className="text-gray-700">
                The <strong>learning rate</strong> is another critical choice. Set it too high
                and the network bounces around wildly, never settling on good weights. Too low
                and training takes ages (or gets stuck in a bad spot). Modern optimizers
                like Adam adapt the learning rate automatically, which is why you don&apos;t
                hear people agonizing about it as much anymore.
              </p>
              <p className="text-gray-700">
                Why do &quot;deeper&quot; networks work better? Each layer can learn
                increasingly abstract features. In image recognition, early layers learn edges
                and textures, middle layers learn shapes like eyes and wheels, and later layers
                learn high-level concepts like &quot;face&quot; or &quot;car.&quot; More depth
                means more levels of abstraction &mdash; up to a point. Too deep and training
                becomes unstable, which led to innovations like residual connections (skip
                connections) that let gradients flow more easily through very deep networks.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s a tiny neural network you can play with. Drag the input sliders and
            watch the values flow through the network in real time. Notice how changing one
            input affects everything downstream &mdash; each hidden neuron combines both
            inputs using different weights, and the final output depends on all of them
            together. The numbers inside each node show its current activation value.
            Connection colors show weight polarity (blue = positive, red = negative) and
            thickness shows weight magnitude.
          </p>

          <NeuralNetSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'A neural network is layers of simple math functions (neurons) connected together. Each neuron multiplies inputs by weights, adds a bias, and applies an activation function.',
            'Networks learn through a loop: forward pass (make a prediction), calculate loss (how wrong?), backpropagation (trace the error backwards), update weights (nudge toward better), and repeat.',
            'Backpropagation is the key insight — it efficiently computes how much each weight contributed to the error, so you know exactly which weights to adjust and by how much.',
            '"Deep" means more layers. More layers let the network learn increasingly abstract features, which is why deep networks can tackle complex tasks like image generation and language understanding.',
            'The same training loop powers everything from a spam filter to GPT. The differences are in architecture, data, and scale — not the fundamental learning algorithm.',
          ]}
          misconceptions={[
            '"Neural networks are trying to replicate the brain." — They\'re inspired by biological neurons, but the resemblance is superficial. Real neurons are vastly more complex. Artificial neural networks are better understood as function approximators — mathematical tools for finding patterns in data.',
            '"More layers always means a better model." — Deeper networks can learn more complex patterns, but they also need more data, more compute, and careful architecture design. Too deep without the right techniques (like residual connections) and the network can\'t train at all. Sometimes a shallow network is all you need.',
            '"Neural networks understand what they\'re doing." — They find statistical patterns. A network that classifies cat photos has no concept of what a cat is — it has learned pixel patterns that correlate with the label "cat." Powerful, but not understanding.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What does backpropagation do during neural network training?"
          options={[
            { text: 'It feeds data forward through the network to make a prediction', isCorrect: false },
            { text: 'It randomly adjusts weights until the network improves', isCorrect: false },
            { text: 'It calculates how much each weight contributed to the error, working backwards from the output', isCorrect: true },
            { text: 'It adds more layers to the network to improve accuracy', isCorrect: false },
          ]}
          explanation="Backpropagation works backwards from the output, using the chain rule of calculus to calculate the gradient (rate of change) of the loss with respect to each weight in the network. This tells you exactly how much each weight contributed to the prediction error and in which direction to adjust it. It's the 'backward pass' step that makes the 'weight update' step possible — without knowing the gradients, you wouldn't know which direction to nudge the weights."
        />
      </LessonSection>
    </div>
  );
}
