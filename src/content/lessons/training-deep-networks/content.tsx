'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import TrainingNetworksSim from '@/components/simulations/TrainingNetworksSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function TrainingDeepNetworksContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Building a neural network is easy. Training one? That&apos;s where things
            get interesting. It&apos;s like tuning a guitar with a million strings &mdash;
            except you can&apos;t hear most of them, and turning one affects all the
            others. The good news: we&apos;ve figured out some really clever tricks to
            make this work.
          </p>

          <p className="text-gray-700 leading-relaxed">
            In the last lesson, you saw the basic training loop: forward pass, loss,
            backpropagation, weight update, repeat. But that&apos;s just the skeleton.
            The real craft of deep learning lives in the details: <em>which</em> loss
            function to use, <em>how</em> to update the weights, <em>how fast</em> to
            move, and how to stop the network from memorizing your training data instead
            of actually learning.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This lesson is about those details &mdash; the practical toolkit that makes
            the difference between a model that works and one that
            doesn&apos;t.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept — The training loop */}
      <LessonSection id="concept" title="The training loop">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Every neural network learns the same way. You show it data, it makes a
            prediction, you measure how wrong it was, and you nudge the weights to do
            better next time. Here&apos;s the loop:
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The training loop"
              nodes={[
                { id: 'forward', label: 'Forward Pass', sublabel: '(predict)', type: 'input' },
                { id: 'loss', label: 'Calculate Loss', sublabel: '(how wrong?)', type: 'attention' },
                { id: 'backward', label: 'Backward Pass', sublabel: '(find blame)', type: 'process' },
                { id: 'update', label: 'Update Weights', sublabel: '(get better)', type: 'process' },
                { id: 'repeat', label: 'Repeat', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The <strong>loss function</strong> is the heart of this loop. It&apos;s a
            single number that tells you how wrong your network is. Everything else &mdash;
            the optimizer, the learning rate, the regularization &mdash; is in service of
            making that number smaller. If you pick the wrong loss function, it
            doesn&apos;t matter how good your optimizer is. You&apos;ll be solving the
            wrong problem.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Think of the loss as a landscape &mdash; a terrain of mountains and valleys.
            Training is the process of finding the lowest valley. The loss function
            defines the shape of the terrain. The optimizer decides how you walk through
            it. The learning rate controls how big your steps are. And regularization
            makes sure you don&apos;t just memorize the map instead of learning to
            navigate.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Making training actually work">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The training loop is simple in theory. Making it work in practice
            requires four pieces, each with its own set of choices and tradeoffs.
            Click through each one.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Loss Functions — Measuring wrongness',
                content: (
                  <div className="space-y-4">
                    <p>
                      The loss function translates &quot;how wrong is the network?&quot; into a
                      number. Different tasks need different measures of wrongness.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3">
                        <span className="text-blue-400 text-sm font-medium">Classification</span>
                        <div className="text-white text-sm mt-1 font-semibold">Cross-Entropy Loss</div>
                        <p className="text-gray-400 text-xs mt-1">
                          &quot;Is this a cat or a dog?&quot; Penalizes confident wrong
                          answers heavily. If the network says 99% cat when it&apos;s a dog,
                          the loss is enormous.
                        </p>
                      </div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3">
                        <span className="text-green-400 text-sm font-medium">Regression</span>
                        <div className="text-white text-sm mt-1 font-semibold">Mean Squared Error</div>
                        <p className="text-gray-400 text-xs mt-1">
                          &quot;What&apos;s the house price?&quot; The average of squared
                          differences between predicted and actual values. Big errors get
                          punished quadratically.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The goal is always the same: <strong className="text-white">make this number
                      smaller</strong>. A loss of 0 means perfect predictions (which you&apos;ll
                      never actually achieve on real data, and shouldn&apos;t want to &mdash;
                      more on that later).
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Optimizers — How to walk downhill',
                content: (
                  <div className="space-y-4">
                    <p>
                      Once you know the gradient (which direction is downhill), you need a
                      strategy for actually stepping in that direction. That&apos;s what an
                      optimizer does.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3">
                        <span className="text-blue-400 text-sm font-medium">SGD</span>
                        <div className="text-white text-sm mt-1 font-semibold">
                          Stochastic Gradient Descent
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          The simplest approach: look at the gradient, step in that direction.
                          Every step uses the same-sized shoe. Can get stuck in local minima,
                          oscillates in ravines.
                        </p>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <span className="text-purple-400 text-sm font-medium">Adam</span>
                        <div className="text-white text-sm mt-1 font-semibold">
                          Adaptive Moment Estimation
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          Keeps a running average of past gradients (momentum) and adapts the
                          step size for each weight individually. Smoother, faster convergence.
                          The default choice for most practitioners.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Why Adam usually wins:</strong> It
                      combines momentum (keep rolling in the direction you were going) with
                      adaptive learning rates (take smaller steps for weights that change a
                      lot). Think of SGD as walking blindfolded on a hillside. Adam is more
                      like a ball that has learned the terrain.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Learning Rate — How big are your steps?',
                content: (
                  <div className="space-y-4">
                    <p>
                      The learning rate is the single most important hyperparameter.
                      It controls how much the weights change on each update.
                    </p>

                    <div className="grid grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-red-500/50 bg-red-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-red-400 text-sm font-medium">Too High</span>
                        <div className="text-white text-xs mt-1 font-mono">lr = 1.0</div>
                        <p className="text-gray-400 text-xs mt-2">
                          Overshoots. The ball bounces around wildly and never settles.
                          Loss may even increase.
                        </p>
                      </div>
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Just Right</span>
                        <div className="text-white text-xs mt-1 font-mono">lr = 0.001</div>
                        <p className="text-gray-400 text-xs mt-2">
                          Steady progress. The ball rolls smoothly toward the minimum.
                          Loss decreases consistently.
                        </p>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-amber-400 text-sm font-medium">Too Low</span>
                        <div className="text-white text-xs mt-1 font-mono">lr = 0.00001</div>
                        <p className="text-gray-400 text-xs mt-2">
                          Barely moves. Training takes forever. May get stuck in a local
                          minimum.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Learning rate scheduling</strong> is the
                      pro move: start with a high learning rate (cover ground fast), then
                      gradually decrease it (fine-tune near the minimum). Common schedules
                      include step decay, cosine annealing, and warmup-then-decay.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Regularization — Preventing memorization',
                content: (
                  <div className="space-y-4">
                    <p>
                      A network that <em>only</em> performs well on training data is useless.
                      Regularization techniques force the network to learn general patterns
                      instead of memorizing specific examples.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3">
                        <span className="text-amber-400 text-sm font-medium">Dropout</span>
                        <div className="text-white text-xs mt-2">
                          During training, randomly turn off a fraction of neurons (typically
                          20-50%). This forces the network to not rely on any single neuron &mdash;
                          like a team where any member might call in sick.
                        </div>
                      </div>
                      <div className="border-2 border-teal-500 bg-teal-500/10 rounded-lg px-4 py-3">
                        <span className="text-teal-400 text-sm font-medium">Batch Normalization</span>
                        <div className="text-white text-xs mt-2">
                          Normalize the outputs of each layer to have zero mean and unit
                          variance. This stabilizes training, allows higher learning rates,
                          and acts as mild regularization.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Overfitting</strong> is when your model
                      memorizes the training data (low training loss, high test loss).
                      <strong className="text-white"> Underfitting</strong> is when it can&apos;t
                      even learn the training data (high everything). Regularization fights
                      overfitting. If your model underfits, you need more capacity (bigger
                      network) or better data, not more regularization.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-gray-700 leading-relaxed">
            These four pieces &mdash; loss function, optimizer, learning rate, and
            regularization &mdash; are the toolkit of every deep learning practitioner.
            Getting them right is more art than science, which is why the community has
            converged on sensible defaults: Adam optimizer, learning rate around 0.001
            with scheduling, dropout of 0.1-0.3, and batch normalization after each
            layer. Start there, and adjust based on what you see.
          </p>

          <GoDeeper title="Overfitting, underfitting, and the bias-variance tradeoff">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                The <strong>bias-variance tradeoff</strong> is one of the most important
                concepts in machine learning. A high-bias model is too simple &mdash; it
                underfits, missing patterns in the data. A high-variance model is too
                complex &mdash; it overfits, capturing noise instead of signal. The sweet
                spot is somewhere in between.
              </p>
              <p className="text-gray-700">
                <strong>Early stopping</strong> is a simple but powerful technique: track
                the model&apos;s performance on a held-out validation set during training.
                The moment validation performance stops improving (even as training
                performance continues to improve), stop training. The gap between training
                and validation performance is your overfitting signal.
              </p>
              <p className="text-gray-700">
                <strong>Data augmentation</strong> fights overfitting by artificially
                expanding your training set. For images, this means random crops, flips,
                rotations, and color shifts. For text, it could mean synonym replacement
                or back-translation. More varied training data makes it harder for the
                model to memorize &mdash; it has to learn the underlying pattern instead.
              </p>
              <p className="text-gray-700">
                <strong>Weight decay</strong> (L2 regularization) is another common
                technique: add a small penalty to the loss function based on the size of
                the weights. This discourages the network from relying on any single
                weight too much, pushing it toward simpler, more generalizable solutions.
                Adam with weight decay (AdamW) is the current gold standard optimizer for
                most deep learning tasks.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Here&apos;s a 2D loss landscape. The dark blue regions have low loss (good)
            and the warm regions have high loss (bad). The white ball represents your
            model&apos;s weights during training. Try different learning rates and
            optimizers to see how training behavior changes. Can you find the global
            minimum? Watch what happens when the learning rate is too high &mdash; the
            ball overshoots and bounces around instead of converging.
          </p>

          <TrainingNetworksSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'The loss function measures how wrong your model is. Cross-entropy for classification, MSE for regression. Everything else in training is about making this number smaller.',
            'Optimizers decide how to update weights. SGD follows the gradient directly; Adam adds momentum and adaptive step sizes, which is why it\'s the default choice for most tasks.',
            'The learning rate is the most important hyperparameter. Too high and training explodes; too low and it stalls. Learning rate scheduling (start high, reduce over time) gives you the best of both worlds.',
            'Regularization prevents overfitting. Dropout randomly disables neurons during training. Batch normalization stabilizes layer outputs. Both help the network learn general patterns instead of memorizing training data.',
            'The gap between training loss and validation loss tells you everything. If training loss is low but validation loss is high, you\'re overfitting. If both are high, you\'re underfitting. Monitor both.',
          ]}
          misconceptions={[
            '"A lower learning rate is always safer." -- Not quite. Too low and training gets stuck in local minima or takes impractically long. The best strategy is to start relatively high and reduce over time (learning rate scheduling). Sometimes a too-low learning rate produces a worse model than a moderately high one.',
            '"More training always means a better model." -- After a point, continued training makes the model memorize training data (overfitting) rather than learning generalizable patterns. This is why we use validation sets and early stopping. The best model is often not the one trained the longest.',
            '"Adam is always better than SGD." -- Adam converges faster and is less sensitive to hyperparameters, but SGD with momentum can sometimes find flatter minima that generalize better. In practice, Adam is the safe default, but SGD remains competitive for certain tasks like training vision models with very large datasets.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What happens when the learning rate is too high during training?"
          options={[
            { text: 'Training becomes slower but more accurate', isCorrect: false },
            { text: 'The model overshoots the minimum and the loss may increase or oscillate wildly', isCorrect: true },
            { text: 'The model automatically switches to a better optimizer', isCorrect: false },
            { text: 'Regularization kicks in to compensate', isCorrect: false },
          ]}
          explanation="When the learning rate is too high, the weight updates are too large. Instead of smoothly descending toward the minimum loss, the model overshoots — jumping past the optimal values and potentially bouncing back and forth. In extreme cases, the loss actually increases instead of decreasing, and training becomes unstable. This is why learning rate scheduling starts with a moderate rate and gradually reduces it: you get fast initial progress without the instability of a permanently high rate."
        />
      </LessonSection>
    </div>
  );
}
