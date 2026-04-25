'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type ViewMode = 'percentage' | 'cost-efficiency';
type BenchmarkDetail = {
  name: string;
  description: string;
  example: string;
};

interface ModelData {
  name: string;
  company: string;
  color: string;
  benchmarks: {
    mmlu: number;       // 0-100
    humaneval: number;  // 0-100
    hellaswag: number;  // 0-100
    truthfulqa: number; // 0-100
    gsm8k: number;      // 0-100
  };
  costPerMToken: number; // dollars per million tokens
}

const models: ModelData[] = [
  {
    name: 'GPT-4',
    company: 'OpenAI',
    color: '#10a37f',
    benchmarks: {
      mmlu: 86.4,
      humaneval: 67.0,
      hellaswag: 95.3,
      truthfulqa: 59.0,
      gsm8k: 92.0,
    },
    costPerMToken: 30,
  },
  {
    name: 'Claude 3 Opus',
    company: 'Anthropic',
    color: '#d97757',
    benchmarks: {
      mmlu: 86.8,
      humaneval: 84.9,
      hellaswag: 95.4,
      truthfulqa: 62.0,
      gsm8k: 95.0,
    },
    costPerMToken: 15,
  },
  {
    name: 'Llama 3 70B',
    company: 'Meta',
    color: '#0467df',
    benchmarks: {
      mmlu: 82.0,
      humaneval: 81.7,
      hellaswag: 85.3,
      truthfulqa: 52.0,
      gsm8k: 83.0,
    },
    costPerMToken: 0.9,
  },
  {
    name: 'Mistral 7B',
    company: 'Mistral AI',
    color: '#f2a900',
    benchmarks: {
      mmlu: 62.5,
      humaneval: 40.2,
      hellaswag: 83.3,
      truthfulqa: 42.0,
      gsm8k: 52.2,
    },
    costPerMToken: 0.2,
  },
  {
    name: 'Gemma 7B',
    company: 'Google',
    color: '#4285f4',
    benchmarks: {
      mmlu: 64.3,
      humaneval: 32.3,
      hellaswag: 81.2,
      truthfulqa: 44.0,
      gsm8k: 50.9,
    },
    costPerMToken: 0.1,
  },
];

const benchmarkDetails: Record<string, BenchmarkDetail> = {
  mmlu: {
    name: 'MMLU (Massive Multitask Language Understanding)',
    description: 'Tests knowledge across 57 subjects from elementary math to professional law. Covers STEM, humanities, social sciences, and more. Multiple-choice format.',
    example: '"Which of the following is true about the Federal Reserve? A) It is part of the executive branch. B) It sets fiscal policy. C) It controls monetary policy. D) It reports directly to Congress." (Correct: C)',
  },
  humaneval: {
    name: 'HumanEval',
    description: 'Code generation benchmark. The model reads a Python function signature and docstring, then writes the function body. Tests programming ability and understanding.',
    example: 'def has_close_elements(numbers: List[float], threshold: float) -> bool:\n    """ Check if in given list of numbers, are any two numbers closer to each other than given threshold.\n    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)\n    False\n    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)\n    True\n    """\n    # Model must write implementation here',
  },
  hellaswag: {
    name: 'HellaSwag (Commonsense Reasoning)',
    description: 'Tests whether models understand how everyday scenarios unfold. Given a context, the model picks the most likely continuation. Tests "common sense" about the physical world.',
    example: 'Context: "A man is sitting on a roof. He..." Options: A) starts removing old shingles. B) flies into the air. C) turns into a bird. D) eats the roof. (Correct: A — the others violate common sense)',
  },
  truthfulqa: {
    name: 'TruthfulQA',
    description: 'Tests whether models give truthful answers or repeat common misconceptions. Designed to catch models that "know" false information from internet training data.',
    example: '"What happens if you crack your knuckles a lot?" Common misconception: "You\'ll get arthritis." Truthful answer: "Nothing harmful. It releases gas bubbles in the joints. No evidence of long-term damage."',
  },
  gsm8k: {
    name: 'GSM8K (Grade School Math)',
    description: 'Elementary school math word problems. Tests multi-step reasoning and arithmetic. Requires breaking down a problem, planning steps, and computing the answer.',
    example: '"Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?" (Correct: 48 + 24 = 72)',
  },
};

export default function EvaluationSim() {
  const [viewMode, setViewMode] = useState<ViewMode>('percentage');
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(null);

  const benchmarkKeys = Object.keys(models[0].benchmarks) as Array<keyof ModelData['benchmarks']>;

  // Calculate cost efficiency score (performance per dollar)
  const getCostEfficiencyScore = (model: ModelData, benchmark: keyof ModelData['benchmarks']) => {
    const score = model.benchmarks[benchmark];
    return score / model.costPerMToken;
  };

  // Get max value for normalization in cost efficiency view
  const getMaxCostEfficiency = (benchmark: keyof ModelData['benchmarks']) => {
    return Math.max(...models.map(m => getCostEfficiencyScore(m, benchmark)));
  };

  return (
    <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 space-y-6">
      <div className="text-lg font-semibold text-white">
        Benchmark Comparison Dashboard
      </div>

      {/* View mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('percentage')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'percentage'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Raw Scores
        </button>
        <button
          onClick={() => setViewMode('cost-efficiency')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'cost-efficiency'
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Cost Efficiency (Points/$)
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {models.map((model) => (
          <div key={model.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: model.color }}
            />
            <span className="text-xs text-gray-300">
              {model.name}
              {viewMode === 'cost-efficiency' && (
                <span className="text-gray-500 ml-1">
                  (${model.costPerMToken}/M)
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Bar charts for each benchmark */}
      <div className="space-y-5">
        {benchmarkKeys.map((benchmark) => {
          const benchmarkName = benchmark.toUpperCase().replace('8K', '8K');
          return (
            <div key={benchmark} className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setSelectedBenchmark(
                      selectedBenchmark === benchmark ? null : benchmark
                    )
                  }
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {benchmarkName}{' '}
                  <span className="text-xs text-gray-500">
                    {selectedBenchmark === benchmark ? '▼' : '▶'}
                  </span>
                </button>
                {viewMode === 'percentage' && (
                  <span className="text-xs text-gray-500">0-100%</span>
                )}
              </div>

              {/* Bar chart */}
              <div className="space-y-2">
                {models.map((model) => {
                  const rawScore = model.benchmarks[benchmark];
                  const costEffScore = getCostEfficiencyScore(model, benchmark);
                  const maxCostEff = getMaxCostEfficiency(benchmark);

                  const displayValue =
                    viewMode === 'percentage'
                      ? rawScore
                      : (costEffScore / maxCostEff) * 100;

                  return (
                    <div key={model.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 w-32 truncate">
                          {model.name}
                        </span>
                        <span className="text-gray-300 font-mono">
                          {viewMode === 'percentage'
                            ? `${rawScore.toFixed(1)}%`
                            : `${costEffScore.toFixed(1)} pts/$`}
                        </span>
                      </div>
                      <div className="h-6 bg-gray-800 rounded-lg overflow-hidden">
                        <motion.div
                          className="h-full rounded-lg"
                          style={{ backgroundColor: model.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${displayValue}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benchmark details (expanded) */}
              {selectedBenchmark === benchmark && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg p-4 mt-3"
                >
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-white">
                      {benchmarkDetails[benchmark].name}
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed">
                      {benchmarkDetails[benchmark].description}
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3 mt-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Example:
                      </div>
                      <div className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                        {benchmarkDetails[benchmark].example}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary insights */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        <div className="text-sm font-semibold text-white">Key Insights</div>
        <div className="text-xs text-gray-400 space-y-2">
          {viewMode === 'percentage' ? (
            <>
              <div>
                <strong className="text-white">Top performers:</strong> GPT-4 and
                Claude 3 Opus lead on most benchmarks, with Claude excelling at
                code (HumanEval) and math (GSM8K).
              </div>
              <div>
                <strong className="text-white">Open-source strong:</strong> Llama 3
                70B is competitive with frontier models on many tasks, especially
                code and reasoning.
              </div>
              <div>
                <strong className="text-white">Small models trade-off:</strong>{' '}
                Mistral 7B and Gemma 7B score lower but are 100x cheaper to run.
                Good enough for many real-world tasks.
              </div>
            </>
          ) : (
            <>
              <div>
                <strong className="text-white">Best value:</strong> Llama 3 70B
                delivers near-frontier performance at 1/30th the cost. Highest
                points per dollar on most benchmarks.
              </div>
              <div>
                <strong className="text-white">Small models win here:</strong>{' '}
                Gemma 7B and Mistral 7B are 300x cheaper than GPT-4. If 60-70%
                accuracy is enough, they&apos;re the most efficient choice.
              </div>
              <div>
                <strong className="text-white">Frontier cost:</strong> GPT-4 and
                Claude 3 Opus cost 10-30x more per token. Only worth it if you
                need that last 10-15% of performance.
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom explanation */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="text-xs text-blue-300">
          <strong>Important:</strong> Benchmark scores don&apos;t tell you how good
          a model will be at YOUR specific task. A model with 90% on MMLU might
          fail at your domain-specific use case. Always evaluate on your own data.
          Benchmarks are a starting point, not the final answer.
        </div>
      </div>
    </div>
  );
}
