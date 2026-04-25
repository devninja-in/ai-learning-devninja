'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import MLOpsSim from '@/components/simulations/MLOpsSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function MLOpsDeploymentContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Here&apos;s a dirty secret about AI: most models that work brilliantly in a
            Jupyter notebook fail in production. Not because the model is bad, but because
            nobody thought about how to deploy it, monitor it, update it, or roll it back
            when things go wrong. MLOps is the discipline that bridges that gap &mdash;
            it&apos;s DevOps for machine learning.
          </p>

          <p className="text-gray-700 leading-relaxed">
            In traditional software, you write code, test it, deploy it, and monitor it.
            In ML, you do all that <em>plus</em> manage datasets, track experiments,
            version models, detect when your production data starts looking different from
            your training data, and retrain when performance degrades. It&apos;s messier,
            more dynamic, and absolutely critical if you want your model to survive first
            contact with the real world.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This lesson walks you through the complete MLOps lifecycle &mdash; from
            experiment tracking and model registry to deployment pipelines and drift
            detection. By the end, you&apos;ll understand how production ML teams keep
            models running reliably at scale.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="From notebook to production">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The core challenge of MLOps is this: machine learning is inherently
            experimental. You try different features, different algorithms, different
            hyperparameters. Maybe 20 experiments later you get something that works. Now
            you need to remember which one it was, what data it trained on, how to
            reproduce it, and how to deploy it without breaking everything.
          </p>

          <p className="text-gray-700 leading-relaxed">
            The MLOps lifecycle is a continuous loop. It&apos;s not a straight line from
            training to deployment &mdash; models degrade over time, data changes, and
            you&apos;ll be retraining and redeploying regularly. Here&apos;s the flow:
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="The MLOps lifecycle"
              nodes={[
                { id: 'data', label: 'Data Pipeline', sublabel: 'ingest, validate', type: 'input' },
                { id: 'track', label: 'Experiment Tracking', sublabel: 'log runs', type: 'process' },
                { id: 'train', label: 'Model Training', sublabel: 'fit model', type: 'process' },
                { id: 'eval', label: 'Evaluation', sublabel: 'test metrics', type: 'attention' },
                { id: 'registry', label: 'Model Registry', sublabel: 'version control', type: 'process' },
                { id: 'deploy', label: 'Deployment', sublabel: 'serve API', type: 'process' },
                { id: 'monitor', label: 'Monitoring', sublabel: 'track drift', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            When monitoring detects a problem &mdash; accuracy dropping, input distribution
            shifting &mdash; you loop back to the top: gather new data, retrain, evaluate,
            deploy a new version. This is why MLOps is more complex than traditional
            DevOps. The artifact you&apos;re deploying (the model) is produced by a
            stochastic training process, not a deterministic build step. You can&apos;t
            just rerun the same code and get the same result.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="The MLOps toolkit">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            MLOps isn&apos;t a single tool &mdash; it&apos;s a collection of practices and
            infrastructure that work together. Here are the four core pieces every
            production ML system needs.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Experiment Tracking',
                content: (
                  <div className="space-y-4">
                    <p>
                      When you&apos;re training models, you need to log <strong className="text-white">everything</strong>:
                      hyperparameters, metrics, training time, dataset version, git commit hash, random seed.
                      Tools like <strong className="text-white">MLflow</strong> and <strong className="text-white">Weights & Biases</strong> make
                      this automatic.
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-sm text-gray-300 space-y-1">
                      <div className="text-blue-400"># Log everything about this training run</div>
                      <div>mlflow.log_param(&quot;learning_rate&quot;, 0.001)</div>
                      <div>mlflow.log_param(&quot;batch_size&quot;, 32)</div>
                      <div>mlflow.log_metric(&quot;accuracy&quot;, 0.94)</div>
                      <div>mlflow.log_artifact(&quot;model.pkl&quot;)</div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Why this matters: Two months from now, when someone asks &quot;which model was that good one
                      from Tuesday?&quot; you can pull up the exact run, see what made it work, and reproduce it.
                      Without experiment tracking, you&apos;re flying blind.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Model Registry',
                content: (
                  <div className="space-y-4">
                    <p>
                      A <strong className="text-white">model registry</strong> is like Git for models. It stores every
                      trained model, tracks versions, and lets you tag models for different stages:
                      <span className="text-blue-400"> staging</span>, <span className="text-green-400">production</span>,
                      <span className="text-red-400"> archived</span>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                      <div className="border-2 border-gray-600 bg-gray-800/50 rounded-lg px-4 py-3">
                        <div className="text-gray-400 text-xs mb-1">v1.0</div>
                        <div className="text-white font-semibold">Baseline Model</div>
                        <div className="text-xs text-gray-500 mt-1">Acc: 89%</div>
                        <div className="text-xs text-red-400 mt-2">Archived</div>
                      </div>
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3">
                        <div className="text-gray-400 text-xs mb-1">v2.3</div>
                        <div className="text-white font-semibold">Enhanced Model</div>
                        <div className="text-xs text-gray-500 mt-1">Acc: 93%</div>
                        <div className="text-xs text-blue-400 mt-2">Staging</div>
                      </div>
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3">
                        <div className="text-gray-400 text-xs mb-1">v2.2</div>
                        <div className="text-white font-semibold">Stable Model</div>
                        <div className="text-xs text-gray-500 mt-1">Acc: 92%</div>
                        <div className="text-xs text-green-400 mt-2">Production</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      When a new model is ready, you promote it from staging to production. If it causes problems,
                      you roll back to the previous version instantly. The registry keeps a complete audit trail.
                    </p>
                  </div>
                ),
              },
              {
                title: 'CI/CD for ML',
                content: (
                  <div className="space-y-4">
                    <p>
                      Just like regular software, ML systems need automated testing and deployment. But ML has
                      unique tests: <strong className="text-white">data validation</strong> (schema checks, range checks),
                      <strong className="text-white"> model performance checks</strong> (accuracy thresholds), and
                      <strong className="text-white"> integration tests</strong> (does the API still work?).
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-300 text-sm">Data validation: schema matches, no nulls</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-300 text-sm">Model test: accuracy &gt; 90% on holdout set</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-300 text-sm">Integration test: API latency &lt; 100ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-gray-300 text-sm">Deploy to staging, run smoke tests</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Your CI pipeline (GitHub Actions, GitLab CI, etc.) runs these tests on every commit. If they
                      pass, the new model gets promoted. If not, deployment is blocked and you get an alert.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Monitoring & Drift Detection',
                content: (
                  <div className="space-y-4">
                    <p>
                      This is where ML gets tricky. A model can pass all your tests and still fail in production
                      because the real-world data changed. <strong className="text-white">Data drift</strong> is when
                      the input distribution shifts. <strong className="text-white">Concept drift</strong> is when
                      the relationship between input and output changes.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
                      <div className="bg-gray-800 border border-blue-500 rounded-lg p-3">
                        <div className="text-blue-400 font-semibold text-sm mb-1">Data Drift</div>
                        <div className="text-xs text-gray-400">
                          Training data: users aged 25-45. Production: suddenly 70% are 18-24. Same labels, different
                          inputs. Model was never trained on this distribution.
                        </div>
                      </div>
                      <div className="bg-gray-800 border border-purple-500 rounded-lg p-3">
                        <div className="text-purple-400 font-semibold text-sm mb-1">Concept Drift</div>
                        <div className="text-xs text-gray-400">
                          Training: &quot;click&quot; meant interest. Now: users click everything by accident (mobile
                          UI change). Same inputs, labels mean something different. Model is wrong.
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Monitoring tools like <strong className="text-white">Evidently</strong> and <strong className="text-white">Prometheus</strong> track
                      model predictions, compare input distributions to training data, and alert you when drift exceeds
                      a threshold. When that happens, it&apos;s time to retrain.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="Beyond the basics: feature stores, A/B testing, and LLMOps">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                A <strong>feature store</strong> (like Feast or Tecton) is a centralized
                repository for ML features. Instead of every model recomputing the same
                transformations, you compute features once, store them, and reuse them across
                models. This ensures consistency between training and serving (no training-serving
                skew) and speeds up experimentation.
              </p>
              <p className="text-gray-700">
                <strong>A/B testing for models</strong> is how you validate a new model in
                production without risking everything. Route 5% of traffic to the new model,
                95% to the old one. Compare metrics. If the new model performs better, gradually
                increase its traffic. This is safer than a hard cutover.
              </p>
              <p className="text-gray-700">
                <strong>Shadow deployments</strong> run the new model in parallel with the old
                one, but don&apos;t show predictions to users. You log both sets of predictions
                and compare offline. Great for catching problems before they affect users.
              </p>
              <p className="text-gray-700">
                <strong>LLMOps vs MLOps</strong>: Large language models introduce new challenges.
                Prompt engineering replaces feature engineering. Evaluation is subjective (how do
                you score &quot;good writing&quot;?). Models are too big to retrain from scratch,
                so you fine-tune or use retrieval-augmented generation (RAG). Observability shifts
                from numeric metrics to analyzing generated text for quality, safety, and hallucinations.
                The core MLOps principles (versioning, monitoring, CI/CD) still apply, but the tools
                and techniques are evolving fast.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            This interactive pipeline simulator shows the full MLOps flow. Click <strong>Run Pipeline</strong> to
            watch data flow through each stage. Click any stage to see the tools and metrics involved. Toggle
            between <strong>Good Data</strong> and <strong>Data Drift</strong> scenarios to see how monitoring
            catches performance degradation.
          </p>

          <MLOpsSim />

          <p className="text-sm text-gray-600">
            Notice how the drift scenario triggers an alert when model accuracy drops below the 90% threshold.
            That&apos;s your signal to investigate, gather new data, and retrain. In a real production system,
            this would automatically notify the team and might even trigger a retraining job.
          </p>
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'MLOps is DevOps for machine learning — it covers experiment tracking, model versioning, automated testing, deployment pipelines, and monitoring. Models are living artifacts that degrade over time, so you need infrastructure to retrain and redeploy continuously.',
            'Experiment tracking (MLflow, W&B) logs every training run so you can reproduce results and compare models. Without it, you lose track of what worked and why.',
            'Model registries version models like Git versions code. Tag models for staging/production, promote new versions, and roll back instantly if something breaks.',
            'Data drift (input distribution changes) and concept drift (input-output relationship changes) are the silent killers of production models. Monitoring tools detect these shifts so you know when to retrain.',
            'ML has unique tests: data validation (schema, ranges), model performance checks (accuracy thresholds), and integration tests (API latency). CI/CD for ML automates these and blocks bad deployments.',
          ]}
          misconceptions={[
            '"You train a model once and deploy it forever." — Models degrade. Data changes, user behavior shifts, and performance drops. Production ML is a continuous loop of monitoring, retraining, and redeploying. If you treat your model like static code, it will fail.',
            '"If it works in the notebook, it will work in production." — The notebook has clean data, infinite time, and no latency constraints. Production has messy data, strict SLAs, and users who will find edge cases you never imagined. Deployment is where most ML projects die.',
            '"Monitoring is just tracking accuracy." — Accuracy can stay high even when the model is broken. You need to monitor input distributions, prediction distributions, latency, error rates, and business metrics. A model that predicts "no fraud" 100% of the time has perfect accuracy if fraud is rare — but it is useless.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="What is data drift, and why does it matter for production ML models?"
          options={[
            { text: 'Data drift is when the model makes more errors over time due to bugs in the code', isCorrect: false },
            { text: 'Data drift is when the input data distribution in production differs from the training data distribution, causing the model to perform poorly on new data it was not trained for', isCorrect: true },
            { text: 'Data drift is when training data is accidentally deleted from the database', isCorrect: false },
            { text: 'Data drift is when the model predictions slowly change due to floating-point rounding errors', isCorrect: false },
          ]}
          explanation="Data drift happens when the real-world data your model sees in production starts looking different from the data it was trained on. For example, if you trained a fraud detection model on 2023 data and in 2024 fraudsters change tactics, the input patterns shift. The model was never trained on these new patterns, so performance degrades. Monitoring tools detect drift by comparing production input distributions to training distributions. When drift crosses a threshold, it is time to retrain the model on recent data. This is why production ML is never 'done' — the world keeps changing, and your model needs to keep up."
        />
      </LessonSection>
    </div>
  );
}
