'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import ClassicalMLSim from '@/components/simulations/ClassicalMLSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function ClassicalMLContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Before deep learning took over the headlines, &quot;regular&quot;
            machine learning was already doing amazing things. Credit card fraud
            detection, email spam filters, product recommendations &mdash; all
            built with algorithms that are, honestly, pretty intuitive once you
            see them. These aren&apos;t relics of the past either. For lots of
            real-world problems, a well-tuned decision tree still beats a
            billion-parameter neural network.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The trick is knowing which tool to reach for. Neural networks are
            like power tools &mdash; incredibly capable, but sometimes you just
            need a screwdriver. Classical ML gives you a whole toolbox of
            screwdrivers, each designed for a different kind of problem. And
            the best part? You can usually understand <em>why</em> these
            algorithms made a particular decision, which matters a lot when
            you&apos;re explaining to your boss why the model rejected
            someone&apos;s loan application.
          </p>

          <p className="text-gray-700 leading-relaxed">
            In this lesson, we&apos;ll walk through four algorithms that every
            ML practitioner should know. You&apos;ll see how each one
            &quot;thinks&quot; &mdash; literally, with visual decision
            boundaries &mdash; and start building intuition for when to use
            which.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Teaching machines to decide">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Machine learning problems generally fall into two big buckets.
            <strong> Classification</strong> is about sorting things into
            groups: is this email spam or not? Is this tumor benign or
            malignant? Will this customer churn? <strong>Regression</strong>{' '}
            is about predicting a number: what will this house sell for? How
            many units will we sell next quarter? What&apos;s the temperature
            going to be tomorrow?
          </p>

          <p className="text-gray-700 leading-relaxed">
            There&apos;s also a third category called{' '}
            <strong>clustering</strong>, which is a bit different because you
            don&apos;t have labels to learn from. Instead of &quot;here are
            examples with the right answers, learn the pattern,&quot; it&apos;s
            &quot;here&apos;s a bunch of data, find the natural groups.&quot;
            Customer segmentation is a classic example: you don&apos;t know
            ahead of time how many customer types you have, you want the
            algorithm to discover them.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The ML pipeline"
              nodes={[
                { id: 'data', label: 'Training Data', sublabel: 'examples + labels', type: 'input' },
                { id: 'algo', label: 'Algorithm', sublabel: 'learns the pattern', type: 'process' },
                { id: 'model', label: 'Trained Model', sublabel: 'makes predictions', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The pipeline is the same regardless of which algorithm you pick:
            feed in data, let the algorithm learn a pattern, then use the
            trained model to make predictions on new data it hasn&apos;t seen
            before. The algorithms differ in <em>how</em> they find patterns
            &mdash; some draw lines, some build trees, some memorize examples.
            Each approach has trade-offs, and picking the right one is half the
            skill of being an ML practitioner.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Four algorithms you should know">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s look at four fundamental algorithms. They&apos;re not
            just historically important &mdash; they&apos;re still used in
            production systems everywhere. Each one approaches the problem of
            &quot;learning from data&quot; in a completely different way.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Linear Regression / Classification',
                content: (
                  <div className="space-y-4">
                    <p>
                      The simplest idea: <strong className="text-white">draw
                      the best line.</strong> For regression, you&apos;re fitting
                      a line through data points to predict continuous values
                      (like house prices). For classification, you&apos;re drawing
                      a line that separates two classes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-blue-400 text-sm font-medium mb-1">Regression</div>
                        <div className="text-white text-sm">Predict a number</div>
                        <div className="text-gray-500 text-xs mt-1">house size &rarr; price</div>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-purple-400 text-sm font-medium mb-1">Classification</div>
                        <div className="text-white text-sm">Sort into groups</div>
                        <div className="text-gray-500 text-xs mt-1">email &rarr; spam or not</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Linear models are fast to train, easy to interpret, and
                      surprisingly effective. They&apos;re the first thing data
                      scientists try because they set a strong baseline. The catch?
                      They assume the relationship is linear &mdash; if the real
                      pattern is a curve, a straight line won&apos;t capture it.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Decision Trees',
                content: (
                  <div className="space-y-4">
                    <p>
                      Decision trees work by asking <strong className="text-white">
                      a series of yes/no questions.</strong> Is the temperature above
                      75 degrees? Is it raining? Based on the answers, you follow a
                      different branch of the tree until you reach a prediction.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 my-6 font-mono text-sm">
                      <div className="text-green-400">Is income &gt; $50k?</div>
                      <div className="pl-4 text-gray-400">
                        <div className="text-blue-400">Yes &rarr; Is age &gt; 30?</div>
                        <div className="pl-6 text-gray-400">
                          <div>Yes &rarr; <span className="text-green-300">Approve loan</span></div>
                          <div>No &rarr; <span className="text-yellow-300">Review manually</span></div>
                        </div>
                        <div className="text-red-400">No &rarr; Is credit score &gt; 700?</div>
                        <div className="pl-6 text-gray-400">
                          <div>Yes &rarr; <span className="text-green-300">Approve loan</span></div>
                          <div>No &rarr; <span className="text-red-300">Deny loan</span></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      This is basically a flowchart, and that&apos;s exactly why
                      decision trees are so popular: you can print one out and show
                      it to a non-technical stakeholder, and they&apos;ll understand
                      it. The algorithm figures out the best questions to ask and the
                      best thresholds to use, all from the training data.
                    </p>
                  </div>
                ),
              },
              {
                title: 'K-Nearest Neighbors (KNN)',
                content: (
                  <div className="space-y-4">
                    <p>
                      KNN is the laziest algorithm in ML, and I mean that as a
                      compliment. It <strong className="text-white">doesn&apos;t
                      learn anything</strong> during training. It just memorizes
                      all the examples. When you ask it to classify a new point,
                      it looks at the K most similar examples and takes a vote.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 my-6">
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-amber-400 text-sm font-medium mb-1">Analogy</div>
                        <div className="text-white text-sm">&quot;The 5 most similar houses<br/>sold for about $350k&quot;</div>
                        <div className="text-gray-500 text-xs mt-2">So yours is probably worth ~$350k too</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The beauty of KNN is its simplicity. No training step, no
                      assumptions about data shape. The downside? It gets slow with
                      big datasets because it has to compare the new point against
                      every stored example. And the choice of K matters a lot: K=1
                      is noisy (overfitting), K=100 is too smooth (underfitting).
                    </p>
                  </div>
                ),
              },
              {
                title: 'K-Means Clustering',
                content: (
                  <div className="space-y-4">
                    <p>
                      K-Means is different from the others because it&apos;s{' '}
                      <strong className="text-white">unsupervised</strong>
                      &mdash; it doesn&apos;t need labels. You tell it how many
                      groups (K) you want, and it finds the best way to partition
                      the data into K clusters.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-6">
                      <div className="border border-gray-600 rounded-lg px-3 py-2 text-center">
                        <div className="text-blue-400 text-xs font-medium mb-1">Step 1</div>
                        <div className="text-white text-sm">Pick K random centers</div>
                      </div>
                      <div className="border border-gray-600 rounded-lg px-3 py-2 text-center">
                        <div className="text-purple-400 text-xs font-medium mb-1">Step 2</div>
                        <div className="text-white text-sm">Assign each point to nearest center</div>
                      </div>
                      <div className="border border-gray-600 rounded-lg px-3 py-2 text-center">
                        <div className="text-green-400 text-xs font-medium mb-1">Step 3</div>
                        <div className="text-white text-sm">Move centers to cluster average</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Repeat steps 2 and 3 until the centers stop moving. That&apos;s
                      it. Customer segmentation, image compression, anomaly detection
                      &mdash; K-Means shows up everywhere. The trick is picking the
                      right K. Too few clusters and you miss structure; too many and
                      you&apos;re splitting natural groups apart.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Random Forests, SVMs, and ensemble methods">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                <strong>Random Forests</strong> are what you get when you take
                decision trees and add democracy. Train hundreds of slightly
                different decision trees (each on a random subset of the data
                and features), then let them vote. The majority wins. This
                &quot;ensemble&quot; approach dramatically reduces overfitting
                and is one of the most reliable algorithms in all of ML. Kaggle
                competitions were dominated by random forests before deep
                learning came along, and they&apos;re still a top choice for
                tabular data.
              </p>
              <p className="text-gray-700">
                <strong>Support Vector Machines (SVMs)</strong> take a different
                approach: instead of just finding <em>any</em> line that
                separates the classes, they find the line with the{' '}
                <em>widest margin</em> &mdash; the maximum distance between the
                line and the nearest points from each class. This makes them
                more robust. SVMs can also use the &quot;kernel trick&quot; to
                handle non-linear boundaries by implicitly mapping data to
                higher dimensions.
              </p>
              <p className="text-gray-700">
                <strong>Ensemble methods</strong> like Gradient Boosting
                (XGBoost, LightGBM) build trees sequentially, where each new
                tree focuses on correcting the mistakes of the previous ones.
                They&apos;re currently the state of the art for structured/tabular
                data and are used extensively in finance, healthcare, and
                recommendation systems.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Below is an interactive visualizer with 30 data points from two
            classes. Toggle between the four algorithms to see how each one
            draws its decision boundary differently. For KNN, click anywhere on
            the plot to place a new point and watch the algorithm classify it
            by majority vote. For K-Means, try adjusting the number of clusters
            to see how the same data gets partitioned in different ways.
          </p>

          <ClassicalMLSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Classification sorts things into groups (spam/not-spam), regression predicts numbers (house price), and clustering finds natural groupings without labels.',
            'Linear models draw a straight line to separate classes or predict values. They are fast, interpretable, and a great baseline, but they cannot capture non-linear patterns.',
            'Decision trees ask a series of yes/no questions to make predictions. They are easy to interpret and explain, but a single tree tends to overfit. Random forests fix this by averaging many trees together.',
            'K-Nearest Neighbors stores all training data and classifies new points by majority vote among the K closest examples. No training step, but prediction gets slow on large datasets.',
            'K-Means clustering is unsupervised: it discovers groups in data without labels by iteratively assigning points to the nearest centroid and updating centroids.',
          ]}
          misconceptions={[
            '"Classical ML is outdated now that we have deep learning." -- Not at all. For tabular/structured data (spreadsheets, databases), gradient-boosted trees (XGBoost, LightGBM) still outperform neural networks most of the time. Deep learning shines on images, text, and audio, but classical ML dominates structured data.',
            '"More complex models always give better results." -- A complex model on a small dataset will memorize noise instead of learning patterns. A simple linear model with 100 training examples will usually beat a deep neural network. The best model depends on your data size, data type, and interpretability needs.',
            '"You always need labeled data to do machine learning." -- Clustering algorithms like K-Means are unsupervised: they find patterns without any labels at all. There is a whole spectrum from supervised (labeled data) to unsupervised (no labels) to semi-supervised (some labels).',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="You have 500 rows of customer data in a spreadsheet (age, income, purchase history) and you need an interpretable model for a loan approval system. Which approach would be the best starting point?"
          options={[
            { text: 'A large neural network with multiple hidden layers', isCorrect: false },
            { text: 'A decision tree or random forest', isCorrect: true },
            { text: 'K-Means clustering', isCorrect: false },
            { text: 'A pre-trained GPT model', isCorrect: false },
          ]}
          explanation="Decision trees and random forests excel on tabular data (spreadsheets) and are highly interpretable -- you can print out the tree and show exactly why each decision was made. With only 500 rows, a large neural network would likely overfit. K-Means is unsupervised and can't make approve/deny predictions. A GPT model is designed for text, not structured data. In regulated domains like lending, interpretability isn't optional -- it's a legal requirement."
        />
      </LessonSection>
    </div>
  );
}
