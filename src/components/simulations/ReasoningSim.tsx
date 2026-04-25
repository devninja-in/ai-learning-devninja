'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingStep {
  stepNumber: number;
  thought: string;
  selfCheck?: { passed: boolean; note: string };
}

interface Problem {
  name: string;
  question: string;
  standardAnswer: {
    thought: string;
    answer: string;
    isCorrect: false;
  };
  extendedThinking: {
    steps: ThinkingStep[];
    finalAnswer: string;
  };
}

const PROBLEMS: Problem[] = [
  {
    name: 'Math Problem',
    question:
      'A train leaves at 2pm traveling 60mph. Another train leaves the same station at 3pm going the same direction at 90mph. When does the second train catch up?',
    standardAnswer: {
      thought: 'Quick calculation: the second train is 30mph faster.',
      answer: '2 hours after the second train departs (5pm)',
      isCorrect: false,
    },
    extendedThinking: {
      steps: [
        {
          stepNumber: 1,
          thought:
            'Let me set up the problem carefully. When the second train starts at 3pm, the first train has already traveled for 1 hour.',
        },
        {
          stepNumber: 2,
          thought:
            'First train: 60mph × 1hr = 60 miles head start when second train begins.',
        },
        {
          stepNumber: 3,
          thought:
            'Second train is 30mph faster (90-60=30). To catch up 60 miles at 30mph relative speed takes 60/30 = 2 hours.',
        },
        {
          stepNumber: 4,
          thought:
            'Wait, let me verify this. After 2 hours from 3pm (at 5pm):\n- First train: traveled 3 hours total × 60mph = 180 miles\n- Second train: traveled 2 hours × 90mph = 180 miles',
          selfCheck: { passed: true, note: 'Both trains at 180 miles - correct!' },
        },
      ],
      finalAnswer: '5pm (2 hours after the second train departs)',
    },
  },
  {
    name: 'Logic Puzzle',
    question:
      'Three switches outside a room control three light bulbs inside. You can only enter the room once. How do you figure out which switch controls which bulb?',
    standardAnswer: {
      thought: 'I can toggle switches and check which lights are on.',
      answer: 'Turn on switch 1, leave it. Turn on switch 2, then turn it off. Switch 3 stays off. Enter and check.',
      isCorrect: false,
    },
    extendedThinking: {
      steps: [
        {
          stepNumber: 1,
          thought:
            'I can only enter once, so I need multiple signals from each switch. On/off state gives me 2 signals, but I need 3.',
        },
        {
          stepNumber: 2,
          thought:
            'Light bulbs produce heat when on! This gives me a third signal: hot, warm, or cold.',
          selfCheck: { passed: true, note: 'Heat is the key insight' },
        },
        {
          stepNumber: 3,
          thought:
            'Strategy: Turn on switch 1 and wait 5 minutes. Then turn it off and immediately turn on switch 2. Leave switch 3 off. Now enter the room.',
        },
        {
          stepNumber: 4,
          thought:
            'When I enter:\n- The bulb that is ON = switch 2\n- The bulb that is OFF but HOT = switch 1\n- The bulb that is OFF and COLD = switch 3',
          selfCheck: {
            passed: true,
            note: 'Three distinct signals: on, hot-off, cold-off',
          },
        },
      ],
      finalAnswer:
        'Turn on switch 1, wait 5 min, turn it off. Turn on switch 2, enter room. Check: ON=switch 2, hot-OFF=switch 1, cold-OFF=switch 3.',
    },
  },
  {
    name: 'Coding Problem',
    question: 'Write a function to check if a string is a palindrome.',
    standardAnswer: {
      thought: 'Just reverse the string and compare.',
      answer: 'return s == s[::-1]',
      isCorrect: false,
    },
    extendedThinking: {
      steps: [
        {
          stepNumber: 1,
          thought:
            'First approach: reverse and compare. But wait - what about case sensitivity? "Aba" should probably be a palindrome.',
        },
        {
          stepNumber: 2,
          thought:
            'What about spaces and punctuation? "A man, a plan, a canal: Panama" is a famous palindrome but has spaces and punctuation.',
        },
        {
          stepNumber: 3,
          thought:
            'Better approach:\n1. Convert to lowercase\n2. Remove non-alphanumeric characters\n3. Then check if it reads the same forwards and backwards',
        },
        {
          stepNumber: 4,
          thought:
            'Let me verify with test cases:\n- "racecar" → true ✓\n- "A man, a plan, a canal: Panama" → true ✓\n- "hello" → false ✓',
          selfCheck: { passed: true, note: 'Handles edge cases correctly' },
        },
      ],
      finalAnswer:
        'def is_palindrome(s):\n  clean = "".join(c.lower() for c in s if c.isalnum())\n  return clean == clean[::-1]',
    },
  },
];

export default function ReasoningSim() {
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [mode, setMode] = useState<'standard' | 'extended'>('standard');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [thinkingBudget, setThinkingBudget] = useState(50);

  const problem = PROBLEMS[selectedProblem];
  const extendedSteps = problem.extendedThinking.steps;
  const visibleSteps = mode === 'extended' ? extendedSteps.slice(0, currentStep + 1) : [];

  const handleNext = () => {
    if (currentStep < extendedSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsAutoPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };

  const handleAuto = () => {
    if (currentStep >= extendedSteps.length - 1) {
      handleReset();
    }
    setIsAutoPlaying(true);
  };

  const handleModeChange = (newMode: 'standard' | 'extended') => {
    setMode(newMode);
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };

  const handleProblemChange = (index: number) => {
    setSelectedProblem(index);
    setCurrentStep(0);
    setIsAutoPlaying(false);
    setMode('standard');
  };

  // Auto-advance when auto-playing
  if (mode === 'extended' && isAutoPlaying && currentStep < extendedSteps.length - 1) {
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
    }, 1600);
  } else if (isAutoPlaying && currentStep >= extendedSteps.length - 1) {
    setIsAutoPlaying(false);
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Problem selector */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-400 mb-3">Select a problem:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROBLEMS.map((prob, i) => (
            <button
              key={i}
              onClick={() => handleProblemChange(i)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                selectedProblem === i
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              {prob.name}
            </button>
          ))}
        </div>
      </div>

      {/* Problem statement */}
      <div className="bg-gray-800 rounded-lg p-5 mb-6">
        <div className="text-xs font-medium text-gray-500 mb-2">Problem:</div>
        <div className="text-white font-medium leading-relaxed">{problem.question}</div>
      </div>

      {/* Mode toggle */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-400 mb-3">Reasoning mode:</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('standard')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              mode === 'standard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Standard (Instant)
          </button>
          <button
            onClick={() => handleModeChange('extended')}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              mode === 'extended'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Extended Thinking
          </button>
        </div>
      </div>

      {/* Compute budget slider (only visible in extended mode) */}
      {mode === 'extended' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-400">Thinking Budget:</div>
            <div className="text-sm text-green-400 font-mono">{thinkingBudget}%</div>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={thinkingBudget}
            onChange={(e) => setThinkingBudget(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="text-xs text-gray-500 mt-1 text-center">
            More budget = more thinking steps = better answers on hard problems
          </div>
        </div>
      )}

      {/* Standard mode output */}
      {mode === 'standard' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-1.5">
                  Quick Answer
                </div>
                <div className="text-white text-sm mb-2">{problem.standardAnswer.thought}</div>
                <div className="bg-gray-800 rounded p-3 mt-3">
                  <div className="text-xs text-gray-400 mb-1">Answer:</div>
                  <div className="text-white text-sm font-mono whitespace-pre-wrap">
                    {problem.standardAnswer.answer}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-red-400">
                  <span>⚠️</span>
                  <span>Often incomplete or incorrect - no self-checking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extended thinking mode */}
      {mode === 'extended' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleNext}
              disabled={currentStep >= extendedSteps.length - 1}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next Step ({currentStep + 1}/{extendedSteps.length})
            </button>
            <button
              onClick={handleAuto}
              disabled={isAutoPlaying}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isAutoPlaying ? 'Playing...' : 'Auto'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Thinking steps */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {visibleSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-purple-500/10 border-2 border-purple-500/30 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <div className="text-purple-400 text-sm font-bold">{step.stepNumber}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wide text-purple-400 mb-1.5">
                        Thinking Step {step.stepNumber}
                      </div>
                      <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {step.thought}
                      </div>
                      {step.selfCheck && (
                        <div
                          className={`mt-3 p-3 rounded-lg ${
                            step.selfCheck.passed
                              ? 'bg-green-500/10 border border-green-500/30'
                              : 'bg-red-500/10 border border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {step.selfCheck.passed ? '✓' : '✗'}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-gray-400 mb-0.5">
                                Self-Check:
                              </div>
                              <div
                                className={`text-sm ${
                                  step.selfCheck.passed ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {step.selfCheck.note}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Final answer (only show when all steps visible) */}
            {currentStep >= extendedSteps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">✓</div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-green-400 mb-1.5">
                      Verified Answer
                    </div>
                    <div className="bg-gray-800 rounded p-3">
                      <div className="text-white text-sm font-mono whitespace-pre-wrap leading-relaxed">
                        {problem.extendedThinking.finalAnswer}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-green-400">
                      <span>✓</span>
                      <span>Self-verified through {extendedSteps.length} reasoning steps</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">How it works:</strong> Standard mode gives a quick answer
          in one forward pass - fast but prone to errors. Extended Thinking mode spends more
          compute at inference time to explore the problem, check its work, and self-correct. More
          thinking budget = more steps = higher accuracy on complex problems.
        </div>
      </div>
    </div>
  );
}
