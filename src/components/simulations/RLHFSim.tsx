'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Prompt scenarios with 3 responses each
// -------------------------------------------------------------------

interface Response {
  id: string;
  text: string;
  quality: 'best' | 'ok' | 'worst';
  qualityNote: string;
}

interface Scenario {
  prompt: string;
  responses: Response[];
  beforeRLHF: string;
  afterRLHF: string;
}

const SCENARIOS: Scenario[] = [
  {
    prompt: 'How do I get better at public speaking?',
    responses: [
      {
        id: 'A',
        text: 'Start small: practice in front of a mirror, then a friend, then a small group. Record yourself to catch filler words. Join a local Toastmasters club. The key is repetition — every great speaker was terrible at first.',
        quality: 'best',
        qualityNote: 'Actionable, encouraging, structured advice',
      },
      {
        id: 'B',
        text: 'Public speaking is a skill that involves communicating ideas to an audience. It dates back to ancient Greece where rhetoric was studied. Aristotle identified three modes of persuasion: ethos, pathos, and logos. The word "rhetoric" comes from the Greek...',
        quality: 'worst',
        qualityNote: 'Rambling, ignores the actual question',
      },
      {
        id: 'C',
        text: 'Practice more and try not to be nervous. Being confident helps a lot. You could also take a class or something.',
        quality: 'ok',
        qualityNote: 'Correct but vague and unhelpful',
      },
    ],
    beforeRLHF: 'Public speaking has been practiced since ancient times. Demosthenes reportedly practiced with pebbles in his mouth. The fear of public speaking, glossophobia, affects approximately 75% of people...',
    afterRLHF: 'Here are 3 practical steps to improve:\n1. Start with low-stakes practice (mirror, then friends)\n2. Record yourself and review — you will catch habits you do not notice in the moment\n3. Join a speaking group like Toastmasters for structured feedback\n\nThe biggest secret: everyone is nervous. The difference is preparation.',
  },
  {
    prompt: 'Explain why the sky is blue.',
    responses: [
      {
        id: 'A',
        text: 'Because of the atmosphere and stuff. Light comes from the sun and the sky makes it blue. It is just how nature works.',
        quality: 'worst',
        qualityNote: 'Vague, no real explanation, dismissive',
      },
      {
        id: 'B',
        text: 'Sunlight contains all colors. When it hits the atmosphere, nitrogen and oxygen molecules scatter shorter wavelengths (blue/violet) much more than longer ones (red/orange) — this is called Rayleigh scattering. We see blue rather than violet because our eyes are more sensitive to blue and because some violet gets absorbed higher up.',
        quality: 'best',
        qualityNote: 'Clear, accurate, addresses the obvious follow-up',
      },
      {
        id: 'C',
        text: 'It is due to Rayleigh scattering of electromagnetic radiation in the 450-490nm wavelength range by diatomic molecular nitrogen and oxygen in the troposphere and stratosphere.',
        quality: 'ok',
        qualityNote: 'Technically correct but too jargon-heavy',
      },
    ],
    beforeRLHF: 'The sky appears blue due to Rayleigh scattering. Lord Rayleigh published his theory in 1871. The scattering cross-section is proportional to the inverse fourth power of wavelength. John Tyndall also studied this phenomenon...',
    afterRLHF: 'Sunlight is actually a mix of all colors. When it enters our atmosphere, it bumps into tiny gas molecules. These molecules scatter blue light much more than red light (a physics effect called Rayleigh scattering). So when you look up, you are seeing scattered blue light coming from every direction.\n\nFun fact: sunsets are red because the light travels through more atmosphere, so the blue is scattered away and only the red/orange gets through.',
  },
  {
    prompt: 'Write me a Python function to check if a number is prime.',
    responses: [
      {
        id: 'A',
        text: 'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself. The first few primes are 2, 3, 5, 7, 11, 13. The study of prime numbers is part of number theory. Euclid proved there are infinitely many primes around 300 BCE...',
        quality: 'worst',
        qualityNote: 'Did not write any code at all',
      },
      {
        id: 'B',
        text: 'def is_prime(n):\n    return n > 1 and all(n % i for i in range(2, n))',
        quality: 'ok',
        qualityNote: 'Works but inefficient, no explanation',
      },
      {
        id: 'C',
        text: 'def is_prime(n):\n    if n < 2:\n        return False\n    if n < 4:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return False\n        i += 6\n    return True\n\nThis checks divisibility only up to the square root of n, which makes it O(sqrt(n)) instead of O(n). It also handles edge cases (0, 1, negative numbers).',
        quality: 'best',
        qualityNote: 'Efficient, handles edge cases, explains the approach',
      },
    ],
    beforeRLHF: 'Prime numbers are integers greater than 1 whose only positive divisors are 1 and themselves. The fundamental theorem of arithmetic states that every integer greater than 1 is either prime or can be uniquely factored into primes. Eratosthenes developed a sieve...',
    afterRLHF: 'Here is an efficient prime-checking function:\n\ndef is_prime(n):\n    if n < 2: return False\n    if n < 4: return True\n    if n % 2 == 0 or n % 3 == 0: return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i+2) == 0: return False\n        i += 6\n    return True\n\nWhy this works: we only need to check up to sqrt(n), making it much faster for large numbers.',
  },
  {
    prompt: 'Is it safe to eat raw cookie dough?',
    responses: [
      {
        id: 'A',
        text: 'Cookie dough is made from flour, sugar, butter, eggs, and vanilla extract. The first chocolate chip cookie was invented by Ruth Graves Wakefield in 1938. Cookies are a popular dessert worldwide...',
        quality: 'worst',
        qualityNote: 'Completely ignores the safety question',
      },
      {
        id: 'B',
        text: 'Generally no — there are two main risks. Raw eggs can carry Salmonella, and raw flour can harbor E. coli (flour is not heat-treated). If you want safe "edible" dough, use heat-treated flour (bake it at 350F for 5 min first) and skip the eggs or use pasteurized ones. Many store-bought "edible cookie dough" products do exactly this.',
        quality: 'best',
        qualityNote: 'Direct answer, explains why, offers a safe alternative',
      },
      {
        id: 'C',
        text: 'You probably should not. It has raw eggs which can make you sick.',
        quality: 'ok',
        qualityNote: 'Correct direction but misses the flour risk and solutions',
      },
    ],
    beforeRLHF: 'Cookie dough contains several ingredients including flour, sugar, butter, eggs, and leavening agents. The history of cookies dates back to 7th century Persia. The word "cookie" comes from the Dutch word "koekje" meaning little cake...',
    afterRLHF: 'The short answer: traditional raw cookie dough is not safe to eat due to two risks:\n\n1. Raw eggs — risk of Salmonella\n2. Raw flour — risk of E. coli (flour is a raw agricultural product)\n\nSafe alternative: Heat-treat your flour (350F for 5 min), use pasteurized eggs, and you get edible dough with the same taste.',
  },
];

type Ranking = 'best' | 'ok' | 'worst' | null;
type Rankings = Record<string, Ranking>;

// -------------------------------------------------------------------
// Reward score display
// -------------------------------------------------------------------

function RewardBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 text-right font-mono">{label}</span>
      <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full flex items-center justify-end pr-2"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(score * 100, 8)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-[10px] text-white font-bold">{score.toFixed(2)}</span>
        </motion.div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

export default function RLHFSim() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [rankings, setRankings] = useState<Rankings>({});
  const [phase, setPhase] = useState<'rank' | 'reward' | 'update'>('rank');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const scenario = SCENARIOS[scenarioIndex];

  const handleRank = useCallback((responseId: string, rank: Ranking) => {
    setRankings((prev) => {
      const next = { ...prev };
      // If another response already has this rank, unset it
      for (const key of Object.keys(next)) {
        if (next[key] === rank) {
          next[key] = null;
        }
      }
      next[responseId] = rank;
      return next;
    });
  }, []);

  const allRanked = scenario.responses.every((r) => rankings[r.id] && rankings[r.id] !== null);

  const handleSubmitRanking = useCallback(() => {
    if (allRanked) {
      setPhase('reward');
    }
  }, [allRanked]);

  const handleShowUpdate = useCallback(() => {
    setPhase('update');
  }, []);

  const handleNextScenario = useCallback(() => {
    const nextIndex = (scenarioIndex + 1) % SCENARIOS.length;
    setScenarioIndex(nextIndex);
    setRankings({});
    setPhase('rank');
    setShowBeforeAfter(false);
  }, [scenarioIndex]);

  const handleReset = useCallback(() => {
    setRankings({});
    setPhase('rank');
    setShowBeforeAfter(false);
  }, []);

  // Map user rankings to reward scores
  const getRewardScore = (responseId: string): number => {
    const rank = rankings[responseId];
    if (rank === 'best') return 0.92;
    if (rank === 'ok') return 0.45;
    if (rank === 'worst') return 0.11;
    return 0;
  };

  const getRewardColor = (responseId: string): string => {
    const rank = rankings[responseId];
    if (rank === 'best') return '#22c55e';
    if (rank === 'ok') return '#f59e0b';
    if (rank === 'worst') return '#ef4444';
    return '#6b7280';
  };

  const getRankLabel = (rank: Ranking): string => {
    if (rank === 'best') return 'Best';
    if (rank === 'ok') return 'OK';
    if (rank === 'worst') return 'Worst';
    return '';
  };

  const getRankColor = (rank: Ranking): string => {
    if (rank === 'best') return 'border-green-500 bg-green-500/10 text-green-400';
    if (rank === 'ok') return 'border-amber-500 bg-amber-500/10 text-amber-400';
    if (rank === 'worst') return 'border-red-500 bg-red-500/10 text-red-400';
    return 'border-gray-700 bg-gray-800/50 text-gray-400';
  };

  const bestResponseId = Object.entries(rankings).find(([, r]) => r === 'best')?.[0];
  const bestResponse = scenario.responses.find((r) => r.id === bestResponseId);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        RLHF Preference Ranking Simulator
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        You are the human annotator. Read the prompt, rank the three model
        responses, and see how your preferences train a reward model.
      </p>

      {/* Scenario navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {SCENARIOS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setScenarioIndex(i);
                setRankings({});
                setPhase('rank');
                setShowBeforeAfter(false);
              }}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === scenarioIndex
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          Scenario {scenarioIndex + 1} of {SCENARIOS.length}
        </span>
      </div>

      {/* The prompt */}
      <div className="bg-gray-800 rounded-lg px-4 py-3 mb-5 border-l-4 border-blue-500">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
          User Prompt
        </div>
        <div className="text-sm text-white font-medium">{scenario.prompt}</div>
      </div>

      {/* Phase 1: Ranking */}
      <AnimatePresence mode="wait">
        {phase === 'rank' && (
          <motion.div
            key="rank"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Rank these responses: Best, OK, or Worst
            </div>

            <div className="space-y-3 mb-5">
              {scenario.responses.map((response) => (
                <div
                  key={response.id}
                  className={`border-2 rounded-xl p-4 transition-all ${getRankColor(
                    rankings[response.id] ?? null
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          Response {response.id}
                        </span>
                        {rankings[response.id] && (
                          <span className="text-xs font-semibold">
                            {getRankLabel(rankings[response.id] ?? null)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-mono">
                        {response.text}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {(['best', 'ok', 'worst'] as const).map((rank) => (
                        <button
                          key={rank}
                          onClick={() => handleRank(response.id, rank)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            rankings[response.id] === rank
                              ? rank === 'best'
                                ? 'bg-green-600 border-green-500 text-white'
                                : rank === 'ok'
                                ? 'bg-amber-600 border-amber-500 text-white'
                                : 'bg-red-600 border-red-500 text-white'
                              : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400'
                          }`}
                        >
                          {rank === 'best' ? 'Best' : rank === 'ok' ? 'OK' : 'Worst'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitRanking}
              disabled={!allRanked}
              className={`w-full text-sm px-4 py-3 rounded-lg font-semibold transition-all ${
                allRanked
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {allRanked ? 'Submit Rankings' : 'Rank all 3 responses to continue'}
            </button>
          </motion.div>
        )}

        {/* Phase 2: Reward model */}
        {phase === 'reward' && (
          <motion.div
            key="reward"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-5">
              <h4 className="text-sm font-semibold text-green-300 mb-1">
                You just trained a reward model!
              </h4>
              <p className="text-xs text-green-400/80">
                Your rankings become training data. The reward model learns to
                predict a score that matches human preferences like yours. Given
                thousands of such rankings, it learns what &ldquo;good&rdquo;
                looks like.
              </p>
            </div>

            <div className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Reward Model Scores (learned from your ranking)
            </div>

            <div className="space-y-3 mb-5">
              {scenario.responses.map((response) => (
                <div key={response.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-300">
                      Response {response.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        rankings[response.id] === 'best'
                          ? 'bg-green-500/20 text-green-400'
                          : rankings[response.id] === 'ok'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      Your rank: {getRankLabel(rankings[response.id] ?? null)}
                    </span>
                  </div>
                  <RewardBar
                    label={`R(${response.id})`}
                    score={getRewardScore(response.id)}
                    color={getRewardColor(response.id)}
                  />
                  <p className="text-[10px] text-gray-500 mt-2 italic">
                    {response.qualityNote}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-3 mb-5">
              <div className="text-[10px] text-gray-500 mb-2">How the reward model works:</div>
              <div className="font-mono text-xs text-gray-300">
                <span className="text-purple-400">reward_model</span>(prompt, response) →{' '}
                <span className="text-green-400">score</span>
              </div>
              <div className="text-[10px] text-gray-500 mt-2">
                It takes a prompt + response and predicts how a human would rate it.
                Trained on thousands of comparisons like the one you just made.
              </div>
            </div>

            <button
              onClick={handleShowUpdate}
              className="w-full text-sm px-4 py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all"
            >
              See How the Model Gets Updated
            </button>
          </motion.div>
        )}

        {/* Phase 3: Policy update */}
        {phase === 'update' && (
          <motion.div
            key="update"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-5">
              <h4 className="text-sm font-semibold text-purple-300 mb-1">
                Policy Optimization (PPO / DPO)
              </h4>
              <p className="text-xs text-purple-400/80">
                The language model is now updated to generate responses that score
                high on the reward model. The &ldquo;best&rdquo; response style
                gets reinforced. The &ldquo;worst&rdquo; response style gets
                discouraged.
              </p>
            </div>

            {/* Reinforcement visualization */}
            <div className="space-y-3 mb-5">
              {scenario.responses
                .sort((a, b) => {
                  const order = { best: 0, ok: 1, worst: 2 };
                  return order[rankings[a.id] ?? 'ok'] - order[rankings[b.id] ?? 'ok'];
                })
                .map((response) => {
                  const rank = rankings[response.id];
                  return (
                    <div
                      key={response.id}
                      className={`rounded-lg p-3 border ${
                        rank === 'best'
                          ? 'border-green-500/50 bg-green-500/5'
                          : rank === 'worst'
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-gray-700 bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-300">
                          Response {response.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 ${
                            rank === 'best'
                              ? 'text-green-400'
                              : rank === 'worst'
                              ? 'text-red-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {rank === 'best' && (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                              </svg>
                              Reinforce this style
                            </>
                          )}
                          {rank === 'ok' && 'Mild signal'}
                          {rank === 'worst' && (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                              </svg>
                              Discourage this style
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-2 font-mono">
                        {response.text}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Before / After RLHF */}
            <div className="border border-gray-700 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-300">
                  Before vs After RLHF
                </h4>
                <button
                  onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    showBeforeAfter
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {showBeforeAfter ? 'Hide' : 'Show'} Comparison
                </button>
              </div>

              <AnimatePresence>
                {showBeforeAfter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-800 rounded-lg px-3 py-2 mb-3">
                      <div className="text-[10px] text-gray-500 mb-1">Prompt</div>
                      <div className="text-xs text-white font-medium">
                        {scenario.prompt}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs font-medium text-red-400">
                            Before RLHF (SFT only)
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                          {scenario.beforeRLHF}
                        </div>
                        <div className="mt-2 text-[10px] text-red-400/70 italic">
                          Technically fine-tuned but still unhelpful, rambling
                        </div>
                      </div>

                      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs font-medium text-green-400">
                            After RLHF
                          </span>
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                          {scenario.afterRLHF}
                        </div>
                        <div className="mt-2 text-[10px] text-green-400/70 italic">
                          Direct, structured, genuinely helpful
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pipeline summary */}
            <div className="bg-gray-800 rounded-lg p-4 mb-5">
              <div className="text-xs font-medium text-gray-400 mb-3">
                The full RLHF pipeline you just simulated:
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
                {[
                  { label: 'Your Rankings', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                  { label: 'Reward Model', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                  { label: 'PPO / DPO', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                  { label: 'Better Model', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <div
                      className={`text-[10px] font-semibold px-3 py-2 rounded-lg border ${step.color}`}
                    >
                      {step.label}
                    </div>
                    {i < 3 && (
                      <svg
                        className="w-4 h-4 text-gray-600 shrink-0 hidden sm:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNextScenario}
                className="flex-1 text-sm px-4 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
              >
                Try Next Scenario
              </button>
              <button
                onClick={handleReset}
                className="text-sm px-4 py-3 rounded-lg font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI connection */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-5">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong> This is
          exactly how Claude, ChatGPT, and other assistants are trained. Real
          human annotators rank thousands of responses. Their preferences train
          a reward model, which then guides the language model toward responses
          that are helpful, honest, and harmless &mdash; not just fluent.
        </p>
      </div>
    </div>
  );
}
