'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimulationLayout from '@/components/SimulationLayout'
import {
  Play, ThumbsUp, ThumbsDown, TrendingUp, Award, Users,
  Brain, Target, Zap, BarChart, RefreshCw, ChevronRight,
  BookOpen, AlertCircle, CheckCircle, Star, Clock
} from 'lucide-react'

// RLHF Pipeline Phases with detailed explanations
const RLHF_PHASES = [
  {
    id: 'sft',
    name: 'Supervised Fine-Tuning (SFT)',
    shortName: 'SFT',
    description: 'Fine-tune base model on high-quality instruction-response pairs',
    color: 'bg-green-100 text-green-800 border-green-200',
    gradient: 'from-green-500 to-green-600',
    icon: BookOpen,
    purpose: 'Teach the model to follow instructions and respond helpfully',
    explanation: 'The pre-trained model is fine-tuned on curated datasets of instructions paired with high-quality human-written responses. This teaches basic instruction-following behavior.',
    keyPoints: [
      'Uses supervised learning with labeled examples',
      'Trains on instruction-response pairs',
      'Establishes basic helpful behavior',
      'Foundation for further RLHF training'
    ]
  },
  {
    id: 'reward',
    name: 'Reward Model Training',
    shortName: 'Reward Model',
    description: 'Train a model to predict human preferences from rankings',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    gradient: 'from-purple-500 to-purple-600',
    icon: Target,
    purpose: 'Create a proxy for human judgment to evaluate response quality',
    explanation: 'A separate model learns to predict human preferences by training on ranking data where humans compare multiple responses to the same prompt.',
    keyPoints: [
      'Learns from human preference comparisons',
      'Predicts reward scores for any response',
      'Acts as a scalable proxy for human judgment',
      'Enables automated evaluation during RL'
    ]
  },
  {
    id: 'ppo',
    name: 'PPO Optimization',
    shortName: 'PPO',
    description: 'Optimize policy using reward model through reinforcement learning',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    icon: Zap,
    purpose: 'Optimize the model to maximize reward while maintaining stability',
    explanation: 'The model is optimized using Proximal Policy Optimization, where it generates responses and receives rewards from the reward model, gradually improving its outputs.',
    keyPoints: [
      'Uses reinforcement learning with PPO algorithm',
      'Maximizes reward from the reward model',
      'Includes KL divergence penalty for stability',
      'Iteratively improves response quality'
    ]
  }
]

// Sample prompts with different complexity levels
const SAMPLE_PROMPTS = [
  {
    text: "How do I bake a chocolate cake?",
    category: "Instruction",
    difficulty: "Easy"
  },
  {
    text: "Explain the ethical implications of AI in healthcare",
    category: "Analysis",
    difficulty: "Hard"
  },
  {
    text: "Write a professional email declining a job offer",
    category: "Writing",
    difficulty: "Medium"
  },
  {
    text: "Help me debug this Python code that's giving a TypeError",
    category: "Technical",
    difficulty: "Medium"
  },
  {
    text: "What are the pros and cons of nuclear energy?",
    category: "Analysis",
    difficulty: "Hard"
  }
]

// Response templates for different quality levels
const RESPONSE_TEMPLATES = {
  sft_good: [
    "I'd be happy to help you bake a chocolate cake! Here's a step-by-step recipe:\n\nIngredients:\n- 2 cups flour\n- 2 cups sugar\n- 3/4 cup cocoa powder\n- 2 eggs\n- 1 cup milk\n- 1/2 cup oil\n\nInstructions:\n1. Preheat oven to 350°F\n2. Mix dry ingredients in a large bowl\n3. Add wet ingredients and mix until smooth\n4. Pour into greased pan and bake for 30-35 minutes\n\nEnjoy your homemade cake!",

    "Nuclear energy has both significant advantages and important drawbacks to consider:\n\n**Pros:**\n- Very low carbon emissions during operation\n- High energy density - small amounts of fuel produce large amounts of energy\n- Reliable baseload power that isn't weather-dependent\n- Well-established technology with good safety record\n\n**Cons:**\n- Radioactive waste storage challenges\n- High upfront construction costs\n- Public safety concerns, though statistically very safe\n- Long decommissioning process\n\nThe decision often involves weighing climate benefits against waste management and economic considerations."
  ],

  sft_bad: [
    "Just buy one from the store instead.",
    "Nuclear energy is dangerous and should be banned.",
    "I can't help with that."
  ],

  post_reward: [
    "I'd be delighted to help you create a delicious chocolate cake! Here's a comprehensive guide:\n\n**Ingredients:**\n- 2 cups all-purpose flour\n- 2 cups granulated sugar\n- 3/4 cup unsweetened cocoa powder\n- 2 large eggs\n- 1 cup whole milk\n- 1/2 cup vegetable oil\n- 2 tsp baking soda\n- 1 tsp vanilla extract\n- 1 cup hot coffee (enhances chocolate flavor)\n\n**Instructions:**\n1. Preheat your oven to 350°F (175°C) and grease a 9x13 inch pan\n2. In a large bowl, whisk together all dry ingredients\n3. In another bowl, beat eggs, then add milk, oil, and vanilla\n4. Combine wet and dry ingredients, mixing until just combined\n5. Gradually stir in hot coffee (batter will be thin)\n6. Pour into prepared pan and bake 30-35 minutes until a toothpick comes out clean\n7. Cool completely before frosting\n\n**Pro tip:** The coffee enhances the chocolate flavor without making it taste like coffee!\n\nWould you like a recipe for chocolate frosting to go with it?",

    "Nuclear energy presents a complex set of trade-offs that merit careful consideration:\n\n**Advantages:**\n- **Climate impact:** Produces minimal greenhouse gas emissions during operation, making it valuable for decarbonization\n- **Energy density:** A single nuclear plant can power hundreds of thousands of homes reliably\n- **Baseload power:** Provides consistent electricity regardless of weather, complementing renewables\n- **Safety record:** Modern nuclear plants have excellent safety records when properly regulated\n- **Land use:** Requires much less land per unit of energy than solar or wind\n\n**Challenges:**\n- **Waste management:** Radioactive waste requires secure long-term storage solutions\n- **Economics:** High upfront capital costs, though operating costs are low\n- **Construction time:** New plants can take 10+ years to build\n- **Public perception:** Safety concerns persist despite statistical evidence of safety\n- **Water usage:** Requires significant cooling water, potentially affecting local ecosystems\n\n**Context matters:** The value of nuclear energy often depends on a country's energy mix, climate goals, and existing infrastructure. Many climate scientists view it as an important tool for rapid decarbonization, while others advocate focusing on renewables and storage.\n\nWould you like me to explore any of these aspects in more detail?"
  ],

  post_ppo: [
    "I'm excited to help you bake an amazing chocolate cake! Here's my tried-and-tested recipe that creates a moist, rich cake:\n\n🍫 **Premium Chocolate Cake Recipe**\n\n**Ingredients:**\n- 2 cups all-purpose flour\n- 2 cups sugar\n- 3/4 cup high-quality cocoa powder\n- 2 large eggs (room temperature)\n- 1 cup buttermilk (for extra moisture)\n- 1/2 cup vegetable oil\n- 2 tsp baking soda\n- 1 tsp vanilla extract\n- 1 cup hot coffee (secret ingredient!)\n- 1/2 tsp salt\n\n**Step-by-step instructions:**\n1. **Prep:** Preheat oven to 350°F. Grease and flour two 9-inch round pans\n2. **Dry mix:** Whisk flour, sugar, cocoa, baking soda, and salt in a large bowl\n3. **Wet mix:** In another bowl, beat eggs, then add buttermilk, oil, and vanilla\n4. **Combine:** Mix wet ingredients into dry until just combined (don't overmix!)\n5. **Coffee magic:** Slowly stir in hot coffee - this intensifies the chocolate without coffee taste\n6. **Bake:** Divide batter between pans, bake 28-32 minutes until toothpick comes out with just a few moist crumbs\n7. **Cool:** Let cool 10 minutes in pans, then turn out onto wire racks\n\n**Pro tips for success:**\n- Use room temperature ingredients for better mixing\n- Don't skip the coffee - it makes the chocolate flavor incredible\n- Cool completely before frosting to prevent melting\n\n**Simple chocolate frosting:** Beat 1 cup butter, 3-4 cups powdered sugar, 1/2 cup cocoa, and milk until fluffy.\n\nThis recipe never fails to impress! Would you like suggestions for variations (like adding chocolate chips) or tips for decorating?",

    "Nuclear energy represents one of the most nuanced topics in our energy future. Let me break this down comprehensively:\n\n⚛️ **The Nuclear Advantage:**\n\n**Climate Impact:**\n- Produces 90% fewer lifecycle emissions than coal\n- One plant can replace multiple fossil fuel facilities\n- Critical for rapid decarbonization according to IPCC reports\n\n**Reliability & Scale:**\n- 24/7 baseload power regardless of weather\n- Capacity factors of 90%+ (vs. 35% for wind, 25% for solar)\n- Single plants can power major metropolitan areas\n\n**Safety & Efficiency:**\n- Modern reactors have passive safety systems\n- Statistically safer than fossil fuels (deaths per TWh)\n- Incredibly energy-dense: 1 uranium pellet = 1 ton of coal\n\n🚨 **The Nuclear Challenge:**\n\n**Economic Hurdles:**\n- $10-20 billion upfront costs for new plants\n- Construction delays and cost overruns common\n- Cheap natural gas and renewables create competition\n\n**Waste & Risk:**\n- Long-term radioactive waste storage remains unsolved\n- Low-probability but high-consequence accident risk\n- Nuclear weapons proliferation concerns\n\n**Practical Limitations:**\n- 10-15 year construction timelines\n- Requires massive cooling water supplies\n- Public opposition can halt projects\n\n🔍 **Real-World Context:**\n\n**Success stories:** France (70% nuclear), Ontario's clean grid\n**Struggles:** Vogtle project delays, German phase-out debate\n**Innovation:** Small modular reactors, next-gen designs\n\n**The bottom line:** Nuclear's role depends on your priorities. If rapid decarbonization is paramount, many experts see it as essential despite challenges. If cost and public acceptance matter most, renewables plus storage might be preferred.\n\nFor deep decarbonization by 2050, most pathways include both nuclear and renewables working together.\n\nWhat aspect would you like to explore further - the technology, economics, policy, or safety considerations?"
  ]
}

// Training metrics simulation
interface TrainingMetrics {
  epoch: number
  rewardScore: number
  klDivergence: number
  policyLoss: number
  valueLoss: number
  helpfulnessScore: number
  harmlessScore: number
}

export default function RLHFSimulation() {
  // Core state
  const [currentPhase, setCurrentPhase] = useState<'sft' | 'reward' | 'ppo'>('sft')
  const [selectedPrompt, setSelectedPrompt] = useState(SAMPLE_PROMPTS[0])
  const [responses, setResponses] = useState<Array<{text: string, phase: string, score?: number}>>([])
  const [humanFeedback, setHumanFeedback] = useState<Array<{responseIndex: number, rating: 'good' | 'bad'}>>([])
  const [rewardScores, setRewardScores] = useState<number[]>([])
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [showExplanation, setShowExplanation] = useState(true)

  // Advanced state for comprehensive simulation
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([])
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [comparisonMode, setComparisonMode] = useState(false)
  const [beforeAfterResponses, setBeforeAfterResponses] = useState<{before: string, after: string} | null>(null)

  // Animation states
  const [animateReward, setAnimateReward] = useState(false)
  const [showPhaseTransition, setShowPhaseTransition] = useState(false)

  // Generate responses based on current phase
  const generateResponses = () => {
    if (currentPhase === 'sft') {
      const goodResponse = RESPONSE_TEMPLATES.sft_good[Math.floor(Math.random() * RESPONSE_TEMPLATES.sft_good.length)]
      const badResponse = RESPONSE_TEMPLATES.sft_bad[Math.floor(Math.random() * RESPONSE_TEMPLATES.sft_bad.length)]

      setResponses([
        { text: goodResponse, phase: 'sft' },
        { text: badResponse, phase: 'sft' }
      ])
    } else if (currentPhase === 'reward') {
      // Show multiple responses for ranking
      const responses = RESPONSE_TEMPLATES.sft_good.slice(0, 3).map(text => ({ text, phase: 'reward' }))
      setResponses(responses)
    } else if (currentPhase === 'ppo') {
      // Show before/after comparison
      const beforeText = RESPONSE_TEMPLATES.sft_good[Math.floor(Math.random() * RESPONSE_TEMPLATES.sft_good.length)]
      const afterText = RESPONSE_TEMPLATES.post_ppo[Math.floor(Math.random() * RESPONSE_TEMPLATES.post_ppo.length)]

      setBeforeAfterResponses({ before: beforeText, after: afterText })
      setComparisonMode(true)
    }

    setHumanFeedback([])
    setRewardScores([])
  }

  // Provide feedback and update reward scores
  const provideFeedback = (responseIndex: number, rating: 'good' | 'bad') => {
    setHumanFeedback(prev => [
      ...prev.filter(f => f.responseIndex !== responseIndex),
      { responseIndex, rating }
    ])

    // Simulate reward model scoring with animation
    setAnimateReward(true)
    setTimeout(() => setAnimateReward(false), 1000)

    const scores = responses.map((response, index) => {
      if (index === responseIndex) {
        return rating === 'good' ? 0.75 + Math.random() * 0.2 : 0.05 + Math.random() * 0.25
      }
      const feedback = humanFeedback.find(f => f.responseIndex === index)
      if (feedback) {
        return feedback.rating === 'good' ? 0.75 + Math.random() * 0.2 : 0.05 + Math.random() * 0.25
      }
      return 0.4 + (Math.random() - 0.5) * 0.3
    })

    setRewardScores(scores)
  }

  // Simulate training process with realistic metrics
  const simulateTraining = () => {
    setIsTraining(true)
    setTrainingProgress(0)
    setCurrentEpoch(0)

    const totalEpochs = 20
    const metricsData: TrainingMetrics[] = []

    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + (100 / totalEpochs)
        const epoch = Math.floor(newProgress / 5)

        if (epoch > currentEpoch && epoch <= totalEpochs) {
          // Simulate realistic training metrics
          const baseReward = 0.3 + (epoch / totalEpochs) * 0.5 + (Math.random() - 0.5) * 0.1
          const klDiv = Math.max(0.01, 0.15 - (epoch / totalEpochs) * 0.1 + (Math.random() - 0.5) * 0.05)

          metricsData.push({
            epoch,
            rewardScore: baseReward,
            klDivergence: klDiv,
            policyLoss: 0.5 - (epoch / totalEpochs) * 0.3 + (Math.random() - 0.5) * 0.1,
            valueLoss: 0.3 - (epoch / totalEpochs) * 0.2 + (Math.random() - 0.5) * 0.05,
            helpfulnessScore: 0.4 + (epoch / totalEpochs) * 0.4 + (Math.random() - 0.5) * 0.05,
            harmlessScore: 0.85 + (Math.random() - 0.5) * 0.1
          })

          setTrainingMetrics([...metricsData])
          setCurrentEpoch(epoch)
        }

        if (newProgress >= 100) {
          setIsTraining(false)
          clearInterval(interval)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  // Phase transition with animation
  const handlePhaseChange = (newPhase: 'sft' | 'reward' | 'ppo') => {
    if (newPhase !== currentPhase) {
      setShowPhaseTransition(true)
      setTimeout(() => {
        setCurrentPhase(newPhase)
        setResponses([])
        setHumanFeedback([])
        setRewardScores([])
        setComparisonMode(false)
        setBeforeAfterResponses(null)
        setShowPhaseTransition(false)
      }, 500)
    }
  }

  // Reset entire simulation
  const resetSimulation = () => {
    setCurrentPhase('sft')
    setSelectedPrompt(SAMPLE_PROMPTS[0])
    setResponses([])
    setHumanFeedback([])
    setRewardScores([])
    setIsTraining(false)
    setTrainingProgress(0)
    setTrainingMetrics([])
    setCurrentEpoch(0)
    setComparisonMode(false)
    setBeforeAfterResponses(null)
  }

  const learningObjectives = [
    "Understand the complete RLHF pipeline from SFT through PPO",
    "Experience how human feedback shapes AI behavior",
    "Learn about reward models and preference learning",
    "Visualize reinforcement learning optimization with PPO",
    "See how training metrics evolve during RLHF",
    "Compare model outputs before and after RLHF training"
  ]

  const currentPhaseData = RLHF_PHASES.find(p => p.id === currentPhase)!

  return (
    <SimulationLayout
      title="RLHF Training Pipeline Visualization"
      description="Comprehensive simulation of Reinforcement Learning from Human Feedback"
      difficulty="Advanced"
      category="RLHF"
      onPlay={generateResponses}
      onReset={resetSimulation}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="space-y-8">
        {/* Phase Transition Overlay */}
        <AnimatePresence>
          {showPhaseTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Transitioning to {currentPhaseData.name}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RLHF Pipeline Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Brain className="mr-3 text-blue-600" size={28} />
            RLHF Training Pipeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {RLHF_PHASES.map((phase, index) => {
              const Icon = phase.icon
              const isActive = phase.id === currentPhase
              const isCompleted = RLHF_PHASES.findIndex(p => p.id === currentPhase) > index

              return (
                <motion.div
                  key={phase.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <button
                    onClick={() => handlePhaseChange(phase.id as any)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      isActive
                        ? `${phase.color} border-current shadow-lg`
                        : isCompleted
                        ? 'bg-gray-100 text-gray-700 border-gray-300'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Icon size={24} className={isActive ? 'text-current' : 'text-gray-400'} />
                      {isCompleted && <CheckCircle size={20} className="text-green-500" />}
                      {isActive && <Star size={20} className="text-current animate-pulse" />}
                    </div>

                    <h3 className="font-bold text-lg mb-2">{phase.shortName}</h3>
                    <p className="text-sm opacity-75">{phase.description}</p>

                    <div className="mt-4 text-xs font-medium">
                      Phase {index + 1} of 3
                    </div>
                  </button>

                  {index < RLHF_PHASES.length - 1 && (
                    <ChevronRight
                      className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 z-10 bg-white rounded-full"
                      size={24}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Current Phase Explanation */}
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${currentPhaseData.gradient} text-white rounded-xl p-8`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold flex items-center">
                <currentPhaseData.icon className="mr-3" size={28} />
                {currentPhaseData.name}
              </h3>
              <button
                onClick={() => setShowExplanation(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-lg mb-6 text-gray-100">{currentPhaseData.explanation}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-3">Purpose</h4>
                <p className="text-gray-100">{currentPhaseData.purpose}</p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3">Key Points</h4>
                <ul className="space-y-1 text-gray-100">
                  {currentPhaseData.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 text-blue-600" size={20} />
                Test Prompts
              </h3>

              <div className="space-y-3">
                {SAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPrompt.text === prompt.text
                        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-medium">{prompt.category}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        prompt.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        prompt.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {prompt.difficulty}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{prompt.text}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={generateResponses}
                disabled={isTraining}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                Generate Responses
              </button>
            </div>

            {/* Training Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-purple-600" size={20} />
                Training Controls
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Training Progress</span>
                    <span>{Math.round(trainingProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: `${trainingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {currentEpoch > 0 && (
                  <div className="text-sm text-gray-600">
                    Epoch: {currentEpoch} / 20
                  </div>
                )}

                <button
                  onClick={simulateTraining}
                  disabled={isTraining || responses.length === 0}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isTraining ? 'Training...' : 'Start Training'}
                </button>
              </div>
            </div>

            {/* Training Metrics */}
            {trainingMetrics.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart className="mr-2 text-indigo-600" size={20} />
                  Live Metrics
                </h3>

                <div className="space-y-4">
                  {trainingMetrics.length > 0 && (() => {
                    const latest = trainingMetrics[trainingMetrics.length - 1]
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reward Score</span>
                          <span className="font-bold text-green-600">{latest.rewardScore.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">KL Divergence</span>
                          <span className="font-bold text-orange-600">{latest.klDivergence.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Helpfulness</span>
                          <span className="font-bold text-blue-600">{latest.helpfulnessScore.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Safety</span>
                          <span className="font-bold text-purple-600">{latest.harmlessScore.toFixed(3)}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Stats Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 text-yellow-600" size={20} />
                Session Stats
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {humanFeedback.filter(f => f.rating === 'good').length}
                  </div>
                  <div className="text-xs text-gray-600">Positive</div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {humanFeedback.filter(f => f.rating === 'bad').length}
                  </div>
                  <div className="text-xs text-gray-600">Negative</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {responses.length}
                  </div>
                  <div className="text-xs text-gray-600">Responses</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentEpoch}
                  </div>
                  <div className="text-xs text-gray-600">Epochs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Prompt Display */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Test Prompt
              </h3>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPrompt.category === 'Instruction' ? 'bg-blue-100 text-blue-700' :
                      selectedPrompt.category === 'Analysis' ? 'bg-purple-100 text-purple-700' :
                      selectedPrompt.category === 'Writing' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedPrompt.category}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPrompt.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      selectedPrompt.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedPrompt.difficulty}
                    </div>
                  </div>
                </div>

                <div className="text-lg text-gray-800 font-medium">
                  &quot;{selectedPrompt.text}&quot;
                </div>
              </div>
            </div>

            {/* Phase-specific Content */}
            {currentPhase === 'sft' && responses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Supervised Fine-Tuning Responses
                </h3>
                <p className="text-gray-600 mb-6">
                  Compare responses from the SFT model. The model has been trained on instruction-response pairs but hasn&apos;t received human preference training yet.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {responses.map((response, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-sm">Response {index + 1}</div>
                        {rewardScores[index] !== undefined && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              rewardScores[index] > 0.6
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Score: {rewardScores[index].toFixed(3)}
                          </motion.div>
                        )}
                      </div>

                      <div className="text-sm text-gray-700 mb-4 leading-relaxed max-h-32 overflow-y-auto">
                        {response.text}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => provideFeedback(index, 'good')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                              humanFeedback.find(f => f.responseIndex === index)?.rating === 'good'
                                ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                            }`}
                          >
                            <ThumbsUp size={14} className="mr-1" />
                            Good
                          </button>
                          <button
                            onClick={() => provideFeedback(index, 'bad')}
                            className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                              humanFeedback.find(f => f.responseIndex === index)?.rating === 'bad'
                                ? 'bg-red-100 text-red-800 border border-red-200 shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown size={14} className="mr-1" />
                            Bad
                          </button>
                        </div>

                        {humanFeedback.find(f => f.responseIndex === index) && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <CheckCircle size={14} className="mr-1 text-green-500" />
                            Feedback provided
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {humanFeedback.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <div className="text-sm text-blue-800 flex items-start">
                      <AlertCircle size={16} className="mr-2 mt-0.5 text-blue-600" />
                      <div>
                        <strong>Human Feedback Collected:</strong> This preference data will be used to train a reward model that can predict human preferences for new responses. The reward model learns to distinguish between helpful and unhelpful responses.
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentPhase === 'reward' && responses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reward Model Training
                </h3>
                <p className="text-gray-600 mb-6">
                  Rank these responses from best to worst. The reward model learns to predict human preferences from this ranking data.
                </p>

                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-sm">Option {index + 1}</div>
                        {rewardScores[index] !== undefined && (
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rewardScores[index] > 0.7 ? 'bg-green-100 text-green-800' :
                            rewardScores[index] > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Predicted Score: {rewardScores[index].toFixed(3)}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-700 mb-4 leading-relaxed max-h-24 overflow-y-auto">
                        {response.text}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((rank) => (
                            <button
                              key={rank}
                              onClick={() => provideFeedback(index, rank === 1 ? 'good' : 'bad')}
                              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                                humanFeedback.find(f => f.responseIndex === index) ?
                                  rank === 1 ? 'bg-gold-100 text-gold-800 border border-gold-200' :
                                  rank === 2 ? 'bg-silver-100 text-gray-700 border border-gray-300' :
                                  'bg-bronze-100 text-bronze-700 border border-bronze-200'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              Rank {rank}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {humanFeedback.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl"
                  >
                    <div className="text-sm text-purple-800 flex items-start">
                      <Target size={16} className="mr-2 mt-0.5 text-purple-600" />
                      <div>
                        <strong>Reward Model Learning:</strong> The model learns to assign higher scores to responses you rank higher. This creates a scalable way to evaluate response quality without requiring human feedback for every new response.
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentPhase === 'ppo' && (
              <div className="space-y-6">
                {/* Before/After Comparison */}
                {beforeAfterResponses && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      PPO Optimization Results
                    </h3>
                    <p className="text-gray-600 mb-6">
                      See how the model&apos;s responses improve after PPO training with the reward model.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                          <span className="font-semibold text-red-800">Before PPO (SFT Only)</span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto">
                          {beforeAfterResponses.before}
                        </div>
                        <div className="mt-3 text-xs text-red-600 font-medium">
                          Reward Score: 0.45 (Moderate)
                        </div>
                      </div>

                      <div className="border border-green-200 rounded-xl p-4 bg-green-50">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                          <span className="font-semibold text-green-800">After PPO Training</span>
                        </div>
                        <div className="text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto">
                          {beforeAfterResponses.after}
                        </div>
                        <div className="mt-3 text-xs text-green-600 font-medium">
                          Reward Score: 0.87 (High)
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="text-sm text-orange-800 flex items-start">
                        <Zap size={16} className="mr-2 mt-0.5 text-orange-600" />
                        <div>
                          <strong>PPO Improvements:</strong> The model now provides more comprehensive, helpful, and well-structured responses. Notice the improved organization, additional context, and proactive follow-up questions that make the response more valuable to users.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Training Metrics Chart */}
                {trainingMetrics.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Training Progress Visualization
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Avg Reward', value: trainingMetrics[trainingMetrics.length - 1]?.rewardScore, color: 'green' },
                        { label: 'KL Penalty', value: trainingMetrics[trainingMetrics.length - 1]?.klDivergence, color: 'orange' },
                        { label: 'Helpfulness', value: trainingMetrics[trainingMetrics.length - 1]?.helpfulnessScore, color: 'blue' },
                        { label: 'Safety Score', value: trainingMetrics[trainingMetrics.length - 1]?.harmlessScore, color: 'purple' }
                      ].map((metric, index) => (
                        <div key={index} className={`text-center p-4 bg-${metric.color}-50 rounded-lg`}>
                          <div className={`text-2xl font-bold text-${metric.color}-600`}>
                            {metric.value?.toFixed(3) || '0.000'}
                          </div>
                          <div className="text-sm text-gray-600">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Training Epochs Progress</div>
                      <div className="space-y-2">
                        {trainingMetrics.slice(-5).map((metric, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>Epoch {metric.epoch}</span>
                            <div className="flex space-x-4">
                              <span className="text-green-600">R: {metric.rewardScore.toFixed(3)}</span>
                              <span className="text-orange-600">KL: {metric.klDivergence.toFixed(3)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="text-sm text-blue-800 flex items-start">
                        <BarChart size={16} className="mr-2 mt-0.5 text-blue-600" />
                        <div>
                          <strong>Key Metrics:</strong> Reward score increases as the model learns to generate preferred responses. KL divergence is kept low to prevent the model from deviating too far from its original behavior, ensuring stability and preventing mode collapse.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Educational Content */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="mr-2 text-indigo-600" size={20} />
                Why RLHF Matters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Alignment Problem</h4>
                  <p className="text-gray-700">
                    RLHF helps align AI behavior with human values and preferences, ensuring models are helpful, harmless, and honest.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Scalable Oversight</h4>
                  <p className="text-gray-700">
                    Reward models enable scalable evaluation of AI outputs without requiring human review of every response.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-bold text-gray-900 mb-2">Iterative Improvement</h4>
                  <p className="text-gray-700">
                    The process creates a feedback loop for continuous improvement based on human preferences and values.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  )
}