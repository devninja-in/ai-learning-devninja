'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type Technique = 'zero-shot' | 'few-shot' | 'chain-of-thought' | 'system-prompt';

interface TechniqueConfig {
  id: Technique;
  label: string;
  shortLabel: string;
  accuracy: number;
  color: string;
  borderColor: string;
  bgColor: string;
  prompt: string;
  output: string;
  tips: { dos: string[]; donts: string[] };
}

// -------------------------------------------------------------------
// The review to classify (shared across all techniques)
// -------------------------------------------------------------------

const REVIEW_TEXT =
  'I bought this laptop two weeks ago. The screen is gorgeous and the keyboard feels great, but the battery barely lasts 3 hours and customer support was unhelpful when I asked about it. For the price, I expected better.';

// -------------------------------------------------------------------
// Technique configurations
// -------------------------------------------------------------------

const TECHNIQUES: TechniqueConfig[] = [
  {
    id: 'zero-shot',
    label: 'Zero-Shot',
    shortLabel: 'Zero',
    accuracy: 60,
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500',
    prompt: `Classify this review as positive or negative:

"${REVIEW_TEXT}"`,
    output: `Negative

The review mentions some positive aspects but overall sentiment is negative.`,
    tips: {
      dos: [
        'Use for simple, well-defined tasks',
        'Be specific about the expected output format',
        'State the task clearly in one sentence',
      ],
      donts: [
        'Expect nuanced reasoning on complex tasks',
        'Use vague instructions like "analyze this"',
        'Assume the model knows your context',
      ],
    },
  },
  {
    id: 'few-shot',
    label: 'Few-Shot',
    shortLabel: 'Few',
    accuracy: 82,
    color: '#3b82f6',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500',
    prompt: `Classify each review as positive, negative, or mixed.

Review: "Absolutely love this phone! Best camera I've ever used."
Sentiment: Positive

Review: "Terrible experience. Broke after one week and no refund."
Sentiment: Negative

Review: "Good sound quality but uncomfortable after an hour of use."
Sentiment: Mixed

Review: "${REVIEW_TEXT}"
Sentiment:`,
    output: `Mixed

The review contains both praise (gorgeous screen, great keyboard) and criticism (poor battery life, unhelpful customer support). The closing remark about price expectations suggests overall dissatisfaction, but the positive hardware mentions make this mixed rather than purely negative.`,
    tips: {
      dos: [
        'Include 2-5 diverse, representative examples',
        'Keep example format consistent with the task',
        'Cover edge cases in your examples',
      ],
      donts: [
        'Use examples that are all too similar',
        'Include incorrect examples (the model will copy errors)',
        'Overwhelm with 10+ examples (diminishing returns)',
      ],
    },
  },
  {
    id: 'chain-of-thought',
    label: 'Chain-of-Thought',
    shortLabel: 'CoT',
    accuracy: 91,
    color: '#22c55e',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500',
    prompt: `Classify this review as positive, negative, or mixed. Think through it step by step before giving your final answer.

Review: "${REVIEW_TEXT}"

Let's analyze this step by step:`,
    output: `Let's analyze this step by step:

1. Positive points mentioned:
   - "Screen is gorgeous" (strong positive about display)
   - "Keyboard feels great" (positive about input)

2. Negative points mentioned:
   - "Battery barely lasts 3 hours" (strong negative about battery)
   - "Customer support was unhelpful" (negative about service)
   - "For the price, I expected better" (negative value assessment)

3. Weighing the sentiment:
   - 2 positive aspects (hardware praise)
   - 3 negative aspects (battery, support, value)
   - The closing statement frames the overall experience negatively
   - The word "barely" shows frustration, not just mild disappointment

4. Final assessment:
   The review praises specific hardware features but expresses clear dissatisfaction with battery life, support, and overall value. The negatives outweigh the positives in both count and intensity.

Sentiment: Mixed-Negative (leaning negative due to the price-value disappointment and the closing critical tone, but the hardware praise prevents a purely negative classification)`,
    tips: {
      dos: [
        'Use for complex tasks requiring reasoning',
        'Add "Let\'s think step by step" or similar cue',
        'Works especially well for math, logic, and analysis',
      ],
      donts: [
        'Use for simple factual lookups (overkill)',
        'Expect it to fix fundamentally wrong premises',
        'Skip it for tasks that need speed over accuracy',
      ],
    },
  },
  {
    id: 'system-prompt',
    label: 'System Prompt',
    shortLabel: 'System',
    accuracy: 88,
    color: '#a855f7',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500',
    prompt: `[SYSTEM]
You are a sentiment analysis expert working for an e-commerce platform. Classify reviews into exactly one of: POSITIVE, NEGATIVE, or MIXED. Always respond with valid JSON in this format:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "MIXED",
  "confidence": 0.0-1.0,
  "key_phrases": ["phrase1", "phrase2"],
  "summary": "one sentence explanation"
}

[USER]
Classify this review:
"${REVIEW_TEXT}"`,
    output: `{
  "sentiment": "MIXED",
  "confidence": 0.78,
  "key_phrases": [
    "screen is gorgeous",
    "keyboard feels great",
    "battery barely lasts 3 hours",
    "customer support was unhelpful",
    "expected better"
  ],
  "summary": "The review praises hardware quality (screen, keyboard) but expresses significant dissatisfaction with battery life, customer support, and overall value for price."
}`,
    tips: {
      dos: [
        'Define a clear persona and role',
        'Specify the exact output format (JSON, markdown, etc.)',
        'Set constraints upfront (length, tone, what to include/exclude)',
      ],
      donts: [
        'Put conflicting instructions in system vs user message',
        'Write a system prompt longer than the actual task',
        'Assume system prompt is a security boundary (it is not)',
      ],
    },
  },
];

// -------------------------------------------------------------------
// Simulated output generation based on edits
// -------------------------------------------------------------------

function getSimulatedOutput(technique: Technique, promptText: string): string {
  const config = TECHNIQUES.find((t) => t.id === technique)!;

  // If user has significantly modified the prompt, show a generic response
  const originalPrompt = config.prompt;
  const similarity = computeSimilarity(promptText, originalPrompt);

  if (similarity > 0.8) {
    return config.output;
  }

  // If the prompt was edited substantially, show a different response
  if (promptText.toLowerCase().includes('step by step') || promptText.toLowerCase().includes('think through')) {
    return `Let me analyze this step by step...

Based on the text provided, I'll break down the key elements:
1. First, I'll identify the main points
2. Then evaluate the overall tone
3. Finally, provide my assessment

After careful analysis, this appears to contain both positive and negative elements, making it a nuanced case that requires careful consideration of context and intent.`;
  }

  if (promptText.toLowerCase().includes('json') || promptText.toLowerCase().includes('{')) {
    return `{
  "result": "analyzed",
  "sentiment": "mixed",
  "confidence": 0.72,
  "notes": "Modified prompt detected - simulated structured output"
}`;
  }

  if (promptText.toLowerCase().includes('example') || promptText.toLowerCase().includes('for instance')) {
    return `Based on the examples provided, I can identify the pattern you're looking for.

Applying that pattern to the given input:
The sentiment appears to be mixed, with both positive and negative signals present.

Classification: Mixed`;
  }

  return `Based on the provided prompt, here is my analysis:

The content appears to contain mixed signals. There are both positive and negative aspects mentioned.

Overall assessment: Mixed sentiment.

(Note: This is a simulated response. The output changes based on your prompt technique!)`;
}

function computeSimilarity(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;
  let matches = 0;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) matches++;
  }
  return matches / maxLen;
}

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function PromptEngineeringSim() {
  const [activeTechnique, setActiveTechnique] = useState<Technique>('zero-shot');
  const [prompts, setPrompts] = useState<Record<Technique, string>>(() => {
    const initial: Record<string, string> = {};
    TECHNIQUES.forEach((t) => {
      initial[t.id] = t.prompt;
    });
    return initial as Record<Technique, string>;
  });
  const [showOutput, setShowOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentTechnique = TECHNIQUES.find((t) => t.id === activeTechnique)!;
  const currentPrompt = prompts[activeTechnique];

  const handleTabChange = useCallback((technique: Technique) => {
    setActiveTechnique(technique);
    setShowOutput(false);
    setIsGenerating(false);
  }, []);

  const handlePromptChange = useCallback(
    (value: string) => {
      setPrompts((prev) => ({ ...prev, [activeTechnique]: value }));
      setShowOutput(false);
    },
    [activeTechnique]
  );

  const handleRun = useCallback(() => {
    setIsGenerating(true);
    setShowOutput(false);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowOutput(true);
    }, 800 + Math.random() * 600);
  }, []);

  const handleReset = useCallback(() => {
    setPrompts((prev) => ({
      ...prev,
      [activeTechnique]: currentTechnique.prompt,
    }));
    setShowOutput(false);
    setIsGenerating(false);
  }, [activeTechnique, currentTechnique.prompt]);

  const output = getSimulatedOutput(activeTechnique, currentPrompt);

  return (
    <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">
          Prompt Engineering Playground
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Same task, four techniques. Edit the prompts and compare the results.
        </p>
      </div>

      {/* Technique tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {TECHNIQUES.map((technique) => (
          <button
            key={technique.id}
            onClick={() => handleTabChange(technique.id)}
            className={`flex-1 min-w-0 px-3 sm:px-4 py-3 text-sm font-medium transition-all relative ${
              activeTechnique === technique.id
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="hidden sm:inline">{technique.label}</span>
            <span className="sm:hidden">{technique.shortLabel}</span>
            {activeTechnique === technique.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: technique.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Quality meter bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            Typical accuracy for this technique
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: currentTechnique.color }}
          >
            {currentTechnique.accuracy}%
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: currentTechnique.color }}
            initial={{ width: 0 }}
            animate={{ width: `${currentTechnique.accuracy}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {TECHNIQUES.map((t) => (
            <div key={t.id} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: t.color,
                  opacity: t.id === activeTechnique ? 1 : 0.3,
                }}
              />
              <span
                className="text-[10px] hidden sm:inline"
                style={{
                  color: t.id === activeTechnique ? t.color : '#6b7280',
                }}
              >
                {t.shortLabel} {t.accuracy}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* Prompt input */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentTechnique.color }}
              />
              <span className="text-sm font-medium text-gray-300">
                Prompt
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
          <textarea
            value={currentPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            className="w-full h-64 sm:h-80 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-gray-500 transition-colors"
            spellCheck={false}
          />
          <button
            onClick={handleRun}
            disabled={isGenerating}
            className="mt-3 w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{
              backgroundColor: isGenerating
                ? '#374151'
                : currentTechnique.color,
            }}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                Generating...
              </span>
            ) : (
              'Run Prompt'
            )}
          </button>
        </div>

        {/* Output area */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-sm font-medium text-gray-300">
              Model Output
            </span>
          </div>
          <div className="h-64 sm:h-80 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full mx-auto mb-3"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      Generating response...
                    </p>
                  </div>
                </motion.div>
              ) : showOutput ? (
                <motion.pre
                  key="output"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-200 font-mono whitespace-pre-wrap"
                >
                  {output}
                </motion.pre>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <p className="text-sm text-gray-600 text-center">
                    Click &ldquo;Run Prompt&rdquo; to see the model&apos;s
                    response.
                    <br />
                    <span className="text-xs mt-1 inline-block text-gray-700">
                      Try editing the prompt first!
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {showOutput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 text-xs text-gray-500 text-center"
            >
              Simulated output &mdash; real models may vary
            </motion.div>
          )}
        </div>
      </div>

      {/* Tips section */}
      <div className="px-4 sm:px-6 py-5 border-t border-gray-800 bg-gray-900/30">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Tips for{' '}
          <span style={{ color: currentTechnique.color }}>
            {currentTechnique.label}
          </span>
        </h4>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTechnique}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <div className="text-xs font-medium text-green-400 mb-2 uppercase tracking-wider">
                Do
              </div>
              <ul className="space-y-1.5">
                {currentTechnique.tips.dos.map((tip, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-green-500 mt-0.5 shrink-0">+</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wider">
                Don&apos;t
              </div>
              <ul className="space-y-1.5">
                {currentTechnique.tips.donts.map((tip, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-400 flex items-start gap-2"
                  >
                    <span className="text-red-500 mt-0.5 shrink-0">&minus;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Comparison strip at the bottom */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
          Technique comparison
        </div>
        <div className="grid grid-cols-4 gap-2">
          {TECHNIQUES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`rounded-lg p-2 sm:p-3 text-center transition-all border ${
                t.id === activeTechnique
                  ? 'border-opacity-50 bg-opacity-10'
                  : 'border-gray-800 bg-gray-900/50 hover:bg-gray-900'
              }`}
              style={
                t.id === activeTechnique
                  ? {
                      borderColor: t.color,
                      backgroundColor: `${t.color}10`,
                    }
                  : undefined
              }
            >
              <div
                className="text-xs sm:text-sm font-bold"
                style={{ color: t.color }}
              >
                {t.accuracy}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                {t.shortLabel}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
