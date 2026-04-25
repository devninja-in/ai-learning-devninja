'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import RLHFSim from '@/components/simulations/RLHFSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function RLHFAlignmentContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            A model that can predict the next token perfectly is not the same as
            a model that&apos;s helpful. A perfectly fluent model might also be
            perfectly toxic, perfectly misleading, or perfectly useless at
            following instructions. RLHF is how we bridge that gap &mdash; by
            teaching models what humans actually want, not just what&apos;s
            statistically likely.
          </p>

          <p className="text-gray-700 leading-relaxed">
            After pre-training and supervised fine-tuning, a language model can
            follow instructions and format responses nicely. But &ldquo;can
            follow instructions&rdquo; is not the same as &ldquo;consistently
            gives great answers.&rdquo; The model might give a technically
            correct but unhelpful response, or a confident but wrong one, or a
            thorough one when you wanted something brief. RLHF (Reinforcement
            Learning from Human Feedback) is the third phase of training that
            teaches the model to distinguish between a response that&apos;s
            merely acceptable and one that&apos;s genuinely good.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This is also where the concept of <strong>alignment</strong> comes
            in. An aligned model is one whose behavior matches human intentions
            and values. Getting this right is one of the hardest open problems
            in AI &mdash; and arguably the most important one.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept — The alignment problem */}
      <LessonSection id="concept" title="The alignment problem">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Pre-trained models are capable but unaligned. They&apos;ve absorbed
            the entire internet &mdash; the brilliant and the terrible &mdash;
            and they&apos;ll happily reproduce any of it. Ask a base model a
            question and it might answer helpfully, or it might generate toxic
            content, give wrong answers with total confidence, or just ignore
            what you actually asked. The model doesn&apos;t have a concept of
            &ldquo;this response is helpful&rdquo; versus &ldquo;this response
            is harmful.&rdquo; It only knows &ldquo;this text is likely given
            the previous text.&rdquo;
          </p>

          <p className="text-gray-700 leading-relaxed">
            Supervised fine-tuning (the previous lesson) helps a lot &mdash; it
            teaches the model the format of being an assistant. But SFT has a
            fundamental limitation: it teaches the model to <em>imitate</em>{' '}
            good responses, not to <em>understand</em> what makes a response
            good. The model learns &ldquo;responses in this style appeared in
            training data,&rdquo; not &ldquo;this response is better than that
            one because it&apos;s more helpful.&rdquo; RLHF adds that missing
            piece &mdash; a signal for relative quality.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="From raw model to aligned assistant"
              nodes={[
                { id: 'base', label: 'Base Model', sublabel: 'Capable but unaligned', type: 'input' },
                { id: 'human', label: 'Human Feedback', sublabel: 'Preference rankings', type: 'attention' },
                { id: 'reward', label: 'Reward Model', sublabel: 'Predicts human preference', type: 'process' },
                { id: 'ppo', label: 'Policy Optimization', sublabel: 'PPO or DPO', type: 'process' },
                { id: 'aligned', label: 'Aligned Model', sublabel: 'Helpful, honest, harmless', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The core insight is that it&apos;s much easier for humans to
            <em> compare </em> two responses than to <em>write</em> a perfect
            one from scratch. You might not be able to write the ideal answer
            to a complex medical question, but you can absolutely tell which of
            two answers is more helpful, more accurate, and more responsible.
            RLHF exploits this asymmetry: collect comparisons, learn a scoring
            function, then optimize the model toward higher scores.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Teaching AI what 'good' means">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The RLHF pipeline has distinct stages, each solving a different
            piece of the alignment puzzle. Some recent approaches like DPO
            simplify this pipeline, but understanding the full version helps
            you see why the shortcuts work.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Step 1: Collect Human Preferences',
                content: (
                  <div className="space-y-4">
                    <p>
                      The process starts with humans. You show the model a prompt,
                      generate <strong className="text-white">multiple responses</strong>,
                      and ask human annotators to rank them from best to worst.
                      This is expensive but crucial &mdash; it encodes human
                      judgment into data.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-xs">
                      <div className="text-gray-500 mb-2">{'//'} Example preference data point:</div>
                      <div className="text-blue-400">Prompt: &quot;How do I learn to cook?&quot;</div>
                      <div className="text-green-400 mt-1">Response A (Best): &quot;Start with 3 simple recipes...&quot;</div>
                      <div className="text-amber-400 mt-1">Response B (OK): &quot;Cooking is a useful skill...&quot;</div>
                      <div className="text-red-400 mt-1">Response C (Worst): &quot;The history of cuisine...&quot;</div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Thousands of annotators produce hundreds of thousands of
                      these comparisons. The quality of this data directly
                      determines how well the final model behaves. Anthropic,
                      OpenAI, and others invest heavily in annotator training,
                      guidelines, and quality control. This is the most
                      labor-intensive part of the entire pipeline.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 2: Train a Reward Model',
                content: (
                  <div className="space-y-4">
                    <p>
                      Next, you train a separate neural network &mdash; the{' '}
                      <strong className="text-white">reward model</strong> &mdash;
                      to predict human preferences. Given a prompt and a response,
                      it outputs a scalar score: &ldquo;how much would a human
                      like this?&rdquo;
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-green-500/50 bg-green-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-green-400 text-sm font-medium">Input</span>
                        <div className="text-white text-xs mt-2">
                          A prompt + response pair
                        </div>
                      </div>
                      <div className="border-2 border-purple-500/50 bg-purple-500/5 rounded-lg px-3 py-3 text-center">
                        <span className="text-purple-400 text-sm font-medium">Output</span>
                        <div className="text-white text-xs mt-2">
                          A single score (e.g. 0.0 to 1.0)
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The reward model is typically initialized from the same
                      pre-trained language model, with a new &ldquo;scoring
                      head&rdquo; added on top. It&apos;s trained using the
                      Bradley-Terry model: given two responses, the one humans
                      preferred should get a higher score. After training on
                      enough comparisons, it generalizes &mdash; it can score
                      responses it has never seen, for prompts it has never
                      seen, and usually agree with what a human would say.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 3: Optimize with RL (PPO)',
                content: (
                  <div className="space-y-4">
                    <p>
                      Now comes the reinforcement learning part. The language
                      model generates a response to a prompt. The reward model
                      scores it. If the score is high,{' '}
                      <strong className="text-white">reinforce that behavior</strong>.
                      If low, discourage it. Repeat millions of times.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6">
                      <div className="text-xs text-gray-400 mb-3">The RL training loop:</div>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="text-blue-400">1. Sample a prompt from the dataset</div>
                        <div className="text-green-400">2. Generate a response with the current model</div>
                        <div className="text-purple-400">3. Score it with the reward model</div>
                        <div className="text-amber-400">4. Update model weights using PPO</div>
                        <div className="text-gray-500">5. Repeat (with KL constraint to prevent drift)</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The algorithm used is PPO (Proximal Policy Optimization),
                      borrowed from game-playing RL. A critical addition is the{' '}
                      <em>KL divergence constraint</em> &mdash; a penalty that
                      prevents the model from changing too much from its SFT
                      starting point. Without this, the model would learn to
                      &ldquo;hack&rdquo; the reward model by generating weird
                      outputs that score high but are not actually good. The KL
                      penalty keeps it grounded.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Step 4: Alternatives to RLHF',
                content: (
                  <div className="space-y-4">
                    <p>
                      Traditional RLHF works but it&apos;s complex. You need to
                      train a separate reward model, run PPO (which is finicky
                      and computationally expensive), and carefully tune the KL
                      penalty. Recent research has found simpler paths to the
                      same destination.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500/50 bg-blue-500/5 rounded-lg px-4 py-4">
                        <div className="text-blue-400 text-sm font-semibold mb-2">DPO (Direct Preference Optimization)</div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            Skips the reward model entirely. Trains directly on
                            preference pairs using a clever loss function that
                            implicitly learns the reward.
                          </p>
                          <p className="text-blue-300 font-medium">
                            Simpler, cheaper, increasingly popular.
                          </p>
                        </div>
                      </div>
                      <div className="border-2 border-amber-500/50 bg-amber-500/5 rounded-lg px-4 py-4">
                        <div className="text-amber-400 text-sm font-semibold mb-2">Constitutional AI (CAI)</div>
                        <div className="text-xs text-gray-400 space-y-1.5">
                          <p>
                            The model critiques and revises its own outputs using
                            a set of principles (a &ldquo;constitution&rdquo;).
                            Reduces dependence on human annotators.
                          </p>
                          <p className="text-amber-300 font-medium">
                            Pioneered by Anthropic for Claude.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      DPO has become very popular because it collapses the
                      two-step process (train reward model, then run PPO) into a
                      single training step. You feed it pairs of (prompt,
                      preferred response, rejected response) and it directly
                      adjusts the model weights. Constitutional AI takes a
                      different approach entirely: instead of relying on humans
                      to compare every response, the model evaluates its own
                      outputs against a set of written principles like
                      &ldquo;be helpful,&rdquo; &ldquo;be honest,&rdquo; and
                      &ldquo;be harmless.&rdquo;
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Reward hacking, KL divergence, and Constitutional AI">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Reward hacking</strong> is the biggest practical risk in
                RLHF. The model is optimized to maximize the reward model&apos;s
                score, but the reward model is an imperfect proxy for human
                preferences. Push too hard and the model finds inputs that score
                high on the reward model but look bizarre to humans &mdash;
                excessively verbose responses, sycophantic agreement with
                anything the user says, or responses stuffed with keywords the
                reward model happens to like. This is Goodhart&apos;s Law in
                action: &ldquo;When a measure becomes a target, it ceases to
                be a good measure.&rdquo;
              </p>
              <p className="text-gray-700">
                <strong>KL divergence constraint</strong> is the primary defense
                against reward hacking. KL divergence measures how much the
                current model has drifted from the original SFT model. During
                PPO, the reward signal is penalized by a KL term: the further
                the model drifts from its SFT starting point, the larger the
                penalty. This creates a tug-of-war between maximizing reward
                and staying close to the known-good SFT behavior. Tuning the
                KL coefficient (beta) is one of the most important
                hyperparameters in RLHF.
              </p>
              <p className="text-gray-700">
                <strong>Anthropic&apos;s Constitutional AI</strong> approach
                reduces reliance on human annotators by having the model
                critique its own outputs. The process: (1) Generate a response.
                (2) Ask the model to critique it against a principle (e.g.,
                &ldquo;Is this response harmful?&rdquo;). (3) Ask the model to
                revise based on its critique. (4) Use the original and revised
                responses as preference pairs. This creates synthetic
                preference data at scale. The &ldquo;constitution&rdquo; is
                the set of principles &mdash; rules like &ldquo;Choose the
                response that is most helpful&rdquo; and &ldquo;Choose the
                response that is least likely to be used for harm.&rdquo;
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Train a reward model yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            In this simulation, you play the role of a human annotator. Read
            the prompt, compare the three model responses, and rank them from
            best to worst. Your rankings become training data for a reward
            model. Then watch how the model would be updated to reinforce the
            style you preferred and discourage the style you disliked. Try all
            four scenarios to build intuition for what RLHF actually does.
          </p>

          <RLHFSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'RLHF is the third phase of training (after pre-training and SFT) that teaches models to distinguish between acceptable responses and genuinely good ones. It uses human preference comparisons rather than demonstrations.',
            'The reward model is the key innovation: a neural network that learns to predict human preferences, turning subjective quality judgments into a scalar score the RL algorithm can optimize.',
            'PPO (Proximal Policy Optimization) updates the language model to generate responses that score high on the reward model, with a KL divergence constraint to prevent the model from drifting too far from its SFT foundation.',
            'DPO (Direct Preference Optimization) simplifies the pipeline by skipping the reward model entirely, training directly on preference pairs. It is becoming the standard approach for many teams.',
            'Constitutional AI reduces dependence on human annotators by having the model critique and revise its own outputs against a set of principles, creating synthetic preference data at scale.',
          ]}
          misconceptions={[
            '"RLHF makes models smarter." -- It does not. RLHF does not add new knowledge or capabilities. It redirects existing capabilities toward helpfulness, honesty, and harmlessness. The model already knew the good answer — RLHF teaches it to consistently choose that answer over the rambling, misleading, or harmful alternatives.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What does the reward model in RLHF do?"
          options={[
            { text: 'It generates better responses than the main language model', isCorrect: false },
            { text: 'It predicts how a human would rate a given prompt-response pair', isCorrect: true },
            { text: 'It directly edits the weights of the language model', isCorrect: false },
            { text: 'It filters out harmful content from the training data', isCorrect: false },
          ]}
          explanation="The reward model is a scoring function, not a generator. It takes a prompt and a response as input and outputs a single number representing how much a human would prefer that response. It is trained on thousands of human preference comparisons (A is better than B) and learns to generalize those preferences to new prompt-response pairs it has never seen. The language model is then updated using PPO (or DPO skips this step) to generate responses that score higher on the reward model."
        />
      </LessonSection>
    </div>
  );
}
