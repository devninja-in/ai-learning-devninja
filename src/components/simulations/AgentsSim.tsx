'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReActStep {
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  detail?: string;
}

interface Scenario {
  name: string;
  task: string;
  steps: ReActStep[];
}

const SCENARIOS: Scenario[] = [
  {
    name: 'Weather + Umbrella',
    task: "What's the weather in Paris and should I bring an umbrella?",
    steps: [
      {
        type: 'thought',
        content: 'I need to check the weather in Paris first',
        detail: 'Breaking down the task: get weather data, then make a recommendation based on that data',
      },
      {
        type: 'action',
        content: 'Call weather API for Paris',
        detail: 'get_weather(city="Paris")',
      },
      {
        type: 'observation',
        content: 'Temperature: 15°C, Rain probability: 80%, Conditions: Cloudy',
        detail: 'API returned current weather conditions',
      },
      {
        type: 'thought',
        content: '80% rain probability is very high — umbrella is definitely needed',
        detail: 'Reasoning based on the observation: high rain probability means umbrella is necessary',
      },
      {
        type: 'action',
        content: 'Formulate final answer',
        detail: 'Synthesize weather data and recommendation',
      },
      {
        type: 'final',
        content: 'The weather in Paris is 15°C and cloudy with an 80% chance of rain. Yes, you should definitely bring an umbrella!',
      },
    ],
  },
  {
    name: 'Flight Booking',
    task: 'Book a flight from NYC to Tokyo for next Friday',
    steps: [
      {
        type: 'thought',
        content: "I need to know what date 'next Friday' is, then search for available flights",
        detail: 'Multi-step plan: get date, search flights, present options',
      },
      {
        type: 'action',
        content: 'Get current date and calculate next Friday',
        detail: 'get_date() + calculate_next_day("Friday")',
      },
      {
        type: 'observation',
        content: 'Today is April 20, 2026. Next Friday is April 25, 2026',
        detail: 'Date calculation complete',
      },
      {
        type: 'thought',
        content: 'Now I can search for flights on April 25, 2026 from JFK/LGA/EWR to NRT/HND',
        detail: 'Planning the flight search with proper airport codes',
      },
      {
        type: 'action',
        content: 'Search flights NYC → Tokyo on April 25',
        detail: 'search_flights(from="NYC", to="Tokyo", date="2026-04-25")',
      },
      {
        type: 'observation',
        content: 'Found 3 flights: JAL 006 ($850), ANA 010 ($920), United 79 ($780)',
        detail: 'Flight search returned available options with prices',
      },
      {
        type: 'thought',
        content: 'United 79 is cheapest, but I should present all options and let the user decide',
        detail: 'Agent should provide options, not make autonomous booking decisions without confirmation',
      },
      {
        type: 'final',
        content: 'I found 3 flights from NYC to Tokyo on Friday, April 25, 2026:\n\n• JAL 006: $850\n• ANA 010: $920\n• United 79: $780 (cheapest)\n\nWhich would you like to book?',
      },
    ],
  },
  {
    name: 'Math Problem',
    task: 'If I have 23 apples and give away 7, then buy 15 more, how many do I have?',
    steps: [
      {
        type: 'thought',
        content: 'This is a multi-step arithmetic problem. Let me break it down into operations',
        detail: 'Identifying: subtraction first (give away), then addition (buy more)',
      },
      {
        type: 'action',
        content: 'Calculate: 23 - 7',
        detail: 'calculator(23 - 7)',
      },
      {
        type: 'observation',
        content: 'Result: 16',
        detail: 'First operation complete',
      },
      {
        type: 'thought',
        content: 'After giving away 7, I have 16 apples. Now I need to add 15 more',
        detail: 'Tracking intermediate state and planning next step',
      },
      {
        type: 'action',
        content: 'Calculate: 16 + 15',
        detail: 'calculator(16 + 15)',
      },
      {
        type: 'observation',
        content: 'Result: 31',
        detail: 'Final calculation complete',
      },
      {
        type: 'final',
        content: 'You have 31 apples. (Started with 23, gave away 7 leaving 16, then bought 15 more for a total of 31)',
      },
    ],
  },
];

const STEP_COLORS = {
  thought: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: '💭',
    label: 'Thought',
  },
  action: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: '⚡',
    label: 'Action',
  },
  observation: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: '👁️',
    label: 'Observation',
  },
  final: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: '✓',
    label: 'Final Answer',
  },
};

export default function AgentsSim() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const scenario = SCENARIOS[selectedScenario];
  const visibleSteps = scenario.steps.slice(0, currentStep + 1);

  const handleNext = () => {
    if (currentStep < scenario.steps.length - 1) {
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
    if (currentStep >= scenario.steps.length - 1) {
      handleReset();
    }
    setIsAutoPlaying(true);
  };

  // Auto-advance when auto-playing
  if (isAutoPlaying && currentStep < scenario.steps.length - 1) {
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
    }, 1800);
  } else if (isAutoPlaying && currentStep >= scenario.steps.length - 1) {
    setIsAutoPlaying(false);
  }

  const handleScenarioChange = (index: number) => {
    setSelectedScenario(index);
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Scenario selector */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-400 mb-3">Select a task scenario:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SCENARIOS.map((scenario, i) => (
            <button
              key={i}
              onClick={() => handleScenarioChange(i)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                selectedScenario === i
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task prompt */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="text-xs font-medium text-gray-500 mb-1.5">Task:</div>
        <div className="text-white font-medium">{scenario.task}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleNext}
          disabled={currentStep >= scenario.steps.length - 1}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Step ({currentStep + 1}/{scenario.steps.length})
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
        <div className="ml-auto text-xs text-gray-500">
          {isAutoPlaying ? 'Auto-playing...' : 'Click Step or Auto'}
        </div>
      </div>

      {/* Timeline of steps */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleSteps.map((step, i) => {
            const style = STEP_COLORS[step.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`rounded-lg border-2 ${style.border} ${style.bg} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 mt-0.5">{style.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold uppercase tracking-wide ${style.text} mb-1.5`}>
                      {style.label}
                    </div>
                    <div className="text-white font-medium text-sm mb-1 leading-relaxed whitespace-pre-wrap">
                      {step.content}
                    </div>
                    {step.detail && (
                      <div className="text-xs text-gray-400 italic mt-2 pl-3 border-l-2 border-gray-700">
                        {step.detail}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-3">ReAct Loop Components:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STEP_COLORS).map(([key, style]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="text-lg">{style.icon}</div>
              <div className={`text-xs font-medium ${style.text}`}>{style.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
