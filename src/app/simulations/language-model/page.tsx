'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import SimulationLayout from '@/components/SimulationLayout'
import { LanguageModelPrediction } from '@/types/simulation'
import {
  BookOpen, BarChart3, Zap, ArrowRight, Brain, Target,
  Search, Shuffle, Calculator, TrendingUp, GitBranch,
  Settings, Info, Play, Pause
} from 'lucide-react'

interface GenerationResult {
  text: string
  tokens: string[]
  perplexity: number
  averageProbability: number
  method: 'greedy' | 'sampling' | 'beam'
}

interface BeamSearchNode {
  tokens: string[]
  score: number
  probability: number
}

const VOCAB = [
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'have', 'has', 'had', 'will', 'would', 'could', 'should', 'can', 'may', 'might',
  'very', 'quite', 'really', 'extremely', 'highly', 'completely', 'totally',
  'beautiful', 'amazing', 'wonderful', 'excellent', 'perfect', 'great', 'good',
  'sunny', 'cloudy', 'rainy', 'stormy', 'clear', 'warm', 'cold', 'hot', 'cool',
  'powerful', 'useful', 'complex', 'simple', 'important', 'interesting', 'significant',
  'Paris', 'London', 'Tokyo', 'New', 'York', 'City', 'France', 'England', 'Japan',
  'data', 'algorithms', 'networks', 'layers', 'models', 'training', 'learning',
  'machine', 'artificial', 'intelligence', 'neural', 'deep', 'computer', 'system',
  'revolutionary', 'transformative', 'helpful', 'innovative', 'advanced', 'modern',
  'future', 'technology', 'science', 'research', 'development', 'progress', 'breakthrough',
  'today', 'tomorrow', 'yesterday', 'now', 'then', 'soon', 'later', 'always', 'never',
  'for', 'to', 'from', 'with', 'by', 'at', 'in', 'on', 'about', 'through', 'during'
]

const SAMPLE_PROMPTS = [
  {
    text: "The weather today is",
    category: "Weather Description",
    description: "Simple factual completion about weather conditions"
  },
  {
    text: "Machine learning is a branch of artificial intelligence that",
    category: "Technical Definition",
    description: "Technical explanation requiring domain knowledge"
  },
  {
    text: "The capital of France is",
    category: "Factual Knowledge",
    description: "Simple factual recall with high confidence"
  },
  {
    text: "To build a neural network, you need to understand",
    category: "Educational Content",
    description: "Educational explanation with multiple valid continuations"
  },
  {
    text: "The future of AI will be shaped by advances in",
    category: "Prediction/Opinion",
    description: "Speculative content with creative possibilities"
  },
  {
    text: "In the year 2030, technology will",
    category: "Future Prediction",
    description: "Open-ended speculation about future developments"
  }
]

export default function LanguageModelSimulation() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0].text)
  const [temperature, setTemperature] = useState(0.7)
  const [topK, setTopK] = useState(40)
  const [topP, setTopP] = useState(0.9)
  const [maxTokens, setMaxTokens] = useState(15)
  const [beamWidth, setBeamWidth] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMethod, setGenerationMethod] = useState<'greedy' | 'sampling' | 'beam'>('sampling')
  const [activeTab, setActiveTab] = useState('generator')

  // Generation states
  const [greedyResult, setGreedyResult] = useState<GenerationResult | null>(null)
  const [samplingResult, setSamplingResult] = useState<GenerationResult | null>(null)
  const [beamResult, setBeamResult] = useState<GenerationResult | null>(null)
  const [currentPredictions, setCurrentPredictions] = useState<LanguageModelPrediction[]>([])
  const [generationStep, setGenerationStep] = useState(0)

  // Educational content
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedExample, setSelectedExample] = useState(0)

  // Generate predictions for next token based on context
  const generatePredictions = useCallback((context: string): LanguageModelPrediction[] => {
    const words = context.toLowerCase().split(/\s+/)
    const lastWord = words[words.length - 1] || ''

    let predictions = VOCAB.map(token => {
      let logit = Math.random() * 2 - 1 // Random baseline logit

      // Context-aware scoring
      if (context.toLowerCase().includes('weather')) {
        if (['sunny', 'cloudy', 'rainy', 'beautiful', 'warm', 'cold'].includes(token)) {
          logit += 2.0 + Math.random() * 1.5
        }
      }

      if (context.toLowerCase().includes('machine learning') || context.toLowerCase().includes('ai')) {
        if (['powerful', 'complex', 'useful', 'data', 'algorithms', 'intelligent'].includes(token)) {
          logit += 2.5 + Math.random() * 1.2
        }
      }

      if (context.toLowerCase().includes('capital') && context.toLowerCase().includes('france')) {
        if (token === 'Paris') {
          logit = 4.5 + Math.random() * 0.5
        }
      }

      if (context.toLowerCase().includes('future') && context.toLowerCase().includes('ai')) {
        if (['revolutionary', 'transformative', 'amazing', 'helpful', 'advanced'].includes(token)) {
          logit += 2.8 + Math.random() * 1.0
        }
      }

      // Grammar and coherence boost
      if (lastWord === 'the' && ['weather', 'future', 'capital', 'system'].includes(token)) {
        logit += 1.5
      }

      if (lastWord === 'is' && ['a', 'an', 'very', 'extremely', 'completely'].includes(token)) {
        logit += 1.2
      }

      // Apply temperature scaling
      const scaledLogit = logit / temperature
      const probability = Math.exp(scaledLogit) / (1 + Math.exp(scaledLogit))

      return {
        token,
        probability: Math.max(0.001, Math.min(0.999, probability)),
        logit: scaledLogit,
        rank: 0
      }
    })

    // Normalize probabilities
    const totalProb = predictions.reduce((sum, pred) => sum + pred.probability, 0)
    predictions = predictions.map(pred => ({
      ...pred,
      probability: pred.probability / totalProb
    }))

    // Sort and rank
    predictions = predictions
      .sort((a, b) => b.probability - a.probability)
      .map((pred, index) => ({ ...pred, rank: index + 1 }))

    // Apply top-k filtering
    if (topK > 0) {
      predictions = predictions.slice(0, topK)
    }

    // Apply top-p (nucleus) filtering
    if (topP < 1.0) {
      let cumulativeProb = 0
      const nuclueusPredictions = []
      for (const pred of predictions) {
        cumulativeProb += pred.probability
        nuclueusPredictions.push(pred)
        if (cumulativeProb >= topP) break
      }
      predictions = nuclueusPredictions
    }

    return predictions.slice(0, 10)
  }, [temperature, topK, topP])

  // Greedy decoding
  const greedyGeneration = useCallback((context: string, maxLen: number): GenerationResult => {
    const tokens: string[] = []
    let currentContext = context
    let totalLogProb = 0

    for (let i = 0; i < maxLen; i++) {
      const predictions = generatePredictions(currentContext)
      if (predictions.length === 0) break

      const bestToken = predictions[0]
      tokens.push(bestToken.token)
      totalLogProb += Math.log(bestToken.probability)
      currentContext += ' ' + bestToken.token
    }

    const perplexity = Math.exp(-totalLogProb / Math.max(1, tokens.length))
    const avgProb = Math.exp(totalLogProb / Math.max(1, tokens.length))

    return {
      text: tokens.join(' '),
      tokens,
      perplexity,
      averageProbability: avgProb,
      method: 'greedy'
    }
  }, [generatePredictions])

  // Sampling generation
  const samplingGeneration = useCallback((context: string, maxLen: number): GenerationResult => {
    const tokens: string[] = []
    let currentContext = context
    let totalLogProb = 0

    for (let i = 0; i < maxLen; i++) {
      const predictions = generatePredictions(currentContext)
      if (predictions.length === 0) break

      // Sample based on probabilities
      const rand = Math.random()
      let cumulative = 0
      let selectedToken = predictions[0]

      for (const pred of predictions) {
        cumulative += pred.probability
        if (rand <= cumulative) {
          selectedToken = pred
          break
        }
      }

      tokens.push(selectedToken.token)
      totalLogProb += Math.log(selectedToken.probability)
      currentContext += ' ' + selectedToken.token
    }

    const perplexity = Math.exp(-totalLogProb / Math.max(1, tokens.length))
    const avgProb = Math.exp(totalLogProb / Math.max(1, tokens.length))

    return {
      text: tokens.join(' '),
      tokens,
      perplexity,
      averageProbability: avgProb,
      method: 'sampling'
    }
  }, [generatePredictions])

  // Beam search generation
  const beamSearchGeneration = useCallback((context: string, maxLen: number): GenerationResult => {
    let beams: BeamSearchNode[] = [{
      tokens: [],
      score: 0,
      probability: 1
    }]

    for (let step = 0; step < maxLen; step++) {
      const newBeams: BeamSearchNode[] = []

      for (const beam of beams) {
        const currentContext = context + (beam.tokens.length > 0 ? ' ' + beam.tokens.join(' ') : '')
        const predictions = generatePredictions(currentContext)

        for (const pred of predictions.slice(0, beamWidth * 2)) {
          newBeams.push({
            tokens: [...beam.tokens, pred.token],
            score: beam.score + Math.log(pred.probability),
            probability: beam.probability * pred.probability
          })
        }
      }

      // Keep top beamWidth beams
      beams = newBeams
        .sort((a, b) => b.score - a.score)
        .slice(0, beamWidth)

      if (beams.length === 0) break
    }

    const bestBeam = beams[0]
    const perplexity = Math.exp(-bestBeam.score / Math.max(1, bestBeam.tokens.length))

    return {
      text: bestBeam.tokens.join(' '),
      tokens: bestBeam.tokens,
      perplexity,
      averageProbability: bestBeam.probability,
      method: 'beam'
    }
  }, [generatePredictions, beamWidth])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setGenerationStep(0)

    // Simulate step-by-step generation for educational purposes
    const steps = ['Tokenizing input...', 'Analyzing context...', 'Computing probabilities...', 'Generating text...']

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(i)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Generate with all methods
    const greedy = greedyGeneration(prompt, maxTokens)
    const sampling = samplingGeneration(prompt, maxTokens)
    const beam = beamSearchGeneration(prompt, maxTokens)

    setGreedyResult(greedy)
    setSamplingResult(sampling)
    setBeamResult(beam)

    // Set current predictions for the prompt
    setCurrentPredictions(generatePredictions(prompt))

    setIsGenerating(false)
  }, [prompt, maxTokens, greedyGeneration, samplingGeneration, beamSearchGeneration, generatePredictions])

  const handleReset = useCallback(() => {
    setIsGenerating(false)
    setGreedyResult(null)
    setSamplingResult(null)
    setBeamResult(null)
    setCurrentPredictions([])
    setGenerationStep(0)
  }, [])

  const learningObjectives = [
    "Understand autoregressive language modeling and next-token prediction",
    "Compare greedy decoding vs sampling vs beam search generation strategies",
    "Explore how temperature affects randomness and creativity in generation",
    "Learn about top-k and top-p filtering for controlling output diversity",
    "Understand perplexity as a measure of model confidence and coherence",
    "Experience prompt engineering and how context affects generation"
  ]

  return (
    <SimulationLayout
      title="Language Model Playground"
      description="Interactive exploration of text generation, sampling strategies, and language modeling concepts"
      difficulty="Intermediate"
      category="Language Models"
      onPlay={handleGenerate}
      onReset={handleReset}
      isPlaying={isGenerating}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
          {[
            { id: 'generator', label: 'Text Generator', icon: Brain },
            { id: 'comparison', label: 'Method Comparison', icon: GitBranch },
            { id: 'concepts', label: 'Key Concepts', icon: BookOpen },
            { id: 'examples', label: 'Prompt Engineering', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} className="mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prompt Selection */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="mr-2 text-blue-600" size={20} />
                  Prompt Input
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Example Prompts
                    </label>
                    <div className="space-y-2">
                      {SAMPLE_PROMPTS.map((samplePrompt, index) => (
                        <div key={index}>
                          <button
                            onClick={() => setPrompt(samplePrompt.text)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              prompt === samplePrompt.text
                                ? 'bg-blue-50 border-blue-200 text-blue-900'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <div className="text-sm font-medium">&ldquo;{samplePrompt.text}&rdquo;</div>
                            <div className="text-xs text-gray-500 mt-1">{samplePrompt.category}</div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="Enter your own prompt..."
                    />
                  </div>
                </div>
              </div>

              {/* Generation Settings */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="mr-2 text-purple-600" size={20} />
                  Generation Parameters
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature: {temperature.toFixed(1)}
                      <span className="text-xs text-gray-500 ml-2">
                        (Controls randomness)
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Deterministic</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top-K: {topK}
                      <span className="text-xs text-gray-500 ml-2">
                        (Limit to top K tokens)
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={topK}
                      onChange={(e) => setTopK(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Top-P: {topP.toFixed(2)}
                      <span className="text-xs text-gray-500 ml-2">
                        (Nucleus sampling threshold)
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={topP}
                      onChange={(e) => setTopP(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens: {maxTokens}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beam Width: {beamWidth}
                      <span className="text-xs text-gray-500 ml-2">
                        (For beam search)
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={beamWidth}
                      onChange={(e) => setBeamWidth(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Generation Status */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="mr-2 text-green-600" size={20} />
                  Generation Status
                </h3>

                {isGenerating ? (
                  <div className="text-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"
                    />
                    <div className="text-sm text-gray-600">
                      Step {generationStep + 1}/4: Generating...
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {greedyResult ? 'Ready' : 'Waiting'}
                      </div>
                      <div className="text-xs text-gray-600">Generation Status</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Generation Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Generated Text */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated Text
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg min-h-32">
                  <div className="font-mono text-lg leading-relaxed">
                    <span className="text-gray-700">{prompt}</span>
                    {samplingResult && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-blue-600 ml-1"
                      >
                        {' ' + samplingResult.text}
                      </motion.span>
                    )}
                  </div>
                </div>

                {samplingResult && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-semibold text-blue-800">Perplexity</div>
                      <div className="text-blue-600">{samplingResult.perplexity.toFixed(2)}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-semibold text-green-800">Avg. Probability</div>
                      <div className="text-green-600">{(samplingResult.averageProbability * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Token Predictions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Next Token Predictions
                </h3>

                {currentPredictions.length > 0 ? (
                  <div className="space-y-2">
                    {currentPredictions.map((prediction, index) => (
                      <motion.div
                        key={prediction.token}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-green-500 text-white' :
                            index === 1 ? 'bg-blue-500 text-white' :
                            index === 2 ? 'bg-purple-500 text-white' :
                            'bg-gray-400 text-white'
                          }`}>
                            {prediction.rank}
                          </div>
                          <span className="font-mono font-medium">{prediction.token}</span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${prediction.probability * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium min-w-12 text-right">
                            {(prediction.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                    <div>Click &quot;Play&quot; to see token predictions</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Method Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GitBranch className="mr-2 text-blue-600" size={20} />
                Generation Method Comparison
              </h3>

              {greedyResult && samplingResult && beamResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Greedy Decoding */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Greedy Decoding</h4>
                      <Search className="text-green-600" size={20} />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="font-mono text-sm">
                        <span className="text-gray-600">{prompt}</span>
                        <span className="text-green-600 ml-1">{greedyResult.text}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="font-semibold">Perplexity</div>
                        <div>{greedyResult.perplexity.toFixed(2)}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="font-semibold">Avg. Prob</div>
                        <div>{(greedyResult.averageProbability * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                      Always selects the most likely next token. Deterministic but may be repetitive.
                    </div>
                  </div>

                  {/* Sampling */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Nucleus Sampling</h4>
                      <Shuffle className="text-blue-600" size={20} />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="font-mono text-sm">
                        <span className="text-gray-600">{prompt}</span>
                        <span className="text-blue-600 ml-1">{samplingResult.text}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="font-semibold">Perplexity</div>
                        <div>{samplingResult.perplexity.toFixed(2)}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="font-semibold">Avg. Prob</div>
                        <div>{(samplingResult.averageProbability * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                      Samples from probability distribution. More creative but potentially less coherent.
                    </div>
                  </div>

                  {/* Beam Search */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Beam Search</h4>
                      <Target className="text-purple-600" size={20} />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <div className="font-mono text-sm">
                        <span className="text-gray-600">{prompt}</span>
                        <span className="text-purple-600 ml-1">{beamResult.text}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-purple-50 p-2 rounded">
                        <div className="font-semibold">Perplexity</div>
                        <div>{beamResult.perplexity.toFixed(2)}</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <div className="font-semibold">Avg. Prob</div>
                        <div>{(beamResult.averageProbability * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                      Explores multiple paths simultaneously. Balances quality and diversity.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium mb-2">Generate text to compare methods</div>
                  <div className="text-sm">Click &quot;Play&quot; to see how different generation methods produce different outputs</div>
                </div>
              )}
            </div>

            {/* Performance Analysis */}
            {greedyResult && samplingResult && beamResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-green-600" size={20} />
                  Performance Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {Math.min(greedyResult.perplexity, samplingResult.perplexity, beamResult.perplexity).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Lowest Perplexity</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({greedyResult.perplexity <= samplingResult.perplexity && greedyResult.perplexity <= beamResult.perplexity ? 'Greedy' :
                        samplingResult.perplexity <= beamResult.perplexity ? 'Sampling' : 'Beam Search'})
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {Math.max(greedyResult.averageProbability, samplingResult.averageProbability, beamResult.averageProbability).toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600">Highest Confidence</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({greedyResult.averageProbability >= samplingResult.averageProbability && greedyResult.averageProbability >= beamResult.averageProbability ? 'Greedy' :
                        samplingResult.averageProbability >= beamResult.averageProbability ? 'Sampling' : 'Beam Search'})
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {Math.max(greedyResult.tokens.length, samplingResult.tokens.length, beamResult.tokens.length)}
                    </div>
                    <div className="text-sm text-gray-600">Most Tokens</div>
                    <div className="text-xs text-gray-500 mt-1">
                      ({greedyResult.tokens.length >= samplingResult.tokens.length && greedyResult.tokens.length >= beamResult.tokens.length ? 'Greedy' :
                        samplingResult.tokens.length >= beamResult.tokens.length ? 'Sampling' : 'Beam Search'})
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Concepts Tab */}
        {activeTab === 'concepts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Autoregressive Generation */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowRight className="mr-2 text-blue-600" size={20} />
                  Autoregressive Generation
                </h3>

                <div className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Language models generate text one token at a time, using all previously generated tokens as context for predicting the next token.
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="font-mono text-sm mb-2">P(w₁, w₂, ..., wₙ) = ∏ᵢ P(wᵢ | w₁, ..., wᵢ₋₁)</div>
                    <div className="text-xs text-blue-800">
                      Joint probability factored as conditional probabilities
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <strong>Key insight:</strong> Each token depends on all previous tokens, creating a sequential dependency chain.
                  </div>
                </div>
              </div>

              {/* Temperature and Sampling */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="mr-2 text-purple-600" size={20} />
                  Temperature & Sampling
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-sm mb-2">Temperature Scaling</div>
                    <div className="text-sm text-gray-700 mb-2">
                      Controls randomness by scaling logits before softmax:
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg font-mono text-sm">
                      P(w) = exp(logit/T) / Σ exp(logit/T)
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="font-semibold">T → 0</div>
                      <div>Deterministic</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="font-semibold">T = 1</div>
                      <div>Original</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="font-semibold">T &gt;&gt; 1</div>
                      <div>Random</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Perplexity */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="mr-2 text-green-600" size={20} />
                  Perplexity
                </h3>

                <div className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Perplexity measures how well a model predicts text. Lower perplexity means higher confidence.
                  </p>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="font-mono text-sm mb-2">PP(X) = 2^(-1/N Σᵢ log₂ P(wᵢ))</div>
                    <div className="text-xs text-green-800">
                      Geometric mean of inverse probabilities
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <strong>Interpretation:</strong> A perplexity of 50 means the model is as confused as if choosing randomly from 50 equally likely options.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Generation Strategies */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Search className="mr-2 text-orange-600" size={20} />
                  Generation Strategies
                </h3>

                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-semibold text-sm text-green-700">Greedy Decoding</div>
                    <div className="text-sm text-gray-600">Always picks the highest probability token</div>
                    <div className="text-xs text-gray-500 mt-1">Pro: Deterministic, fast | Con: Repetitive, no diversity</div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-semibold text-sm text-blue-700">Nucleus Sampling (Top-p)</div>
                    <div className="text-sm text-gray-600">Samples from tokens covering probability mass p</div>
                    <div className="text-xs text-gray-500 mt-1">Pro: Adaptive diversity | Con: Quality varies</div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="font-semibold text-sm text-purple-700">Beam Search</div>
                    <div className="text-sm text-gray-600">Maintains multiple candidate sequences</div>
                    <div className="text-xs text-gray-500 mt-1">Pro: Global optimization | Con: Computationally expensive</div>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="font-semibold text-sm text-orange-700">Top-k Sampling</div>
                    <div className="text-sm text-gray-600">Limits vocabulary to k most likely tokens</div>
                    <div className="text-xs text-gray-500 mt-1">Pro: Controls vocabulary size | Con: Fixed cutoff may be suboptimal</div>
                  </div>
                </div>
              </div>

              {/* Prompt Engineering */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="mr-2 text-red-600" size={20} />
                  Prompt Engineering
                </h3>

                <div className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    The prompt provides context that significantly influences generation. Well-crafted prompts can guide models to produce desired outputs.
                  </p>

                  <div className="space-y-3">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-xs font-semibold text-red-700 mb-1">FACTUAL PROMPTS</div>
                      <div className="text-sm">&quot;The capital of France is&quot; → High confidence, specific answer</div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs font-semibold text-blue-700 mb-1">OPEN-ENDED PROMPTS</div>
                      <div className="text-sm">&quot;The future of AI will be&quot; → Multiple valid continuations</div>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs font-semibold text-purple-700 mb-1">TECHNICAL PROMPTS</div>
                      <div className="text-sm">&quot;Machine learning is&quot; → Domain-specific vocabulary</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Engineering Examples Tab */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2 text-blue-600" size={20} />
                Prompt Engineering Examples
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Example Categories</h4>
                  <div className="space-y-3">
                    {SAMPLE_PROMPTS.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedExample(index)}
                        className={`w-full text-left p-4 border rounded-lg transition-colors ${
                          selectedExample === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{example.category}</div>
                        <div className="text-xs text-gray-600 mt-1">{example.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Selected Example Analysis</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-lg font-mono mb-4 text-gray-800">
                      &ldquo;{SAMPLE_PROMPTS[selectedExample].text}&rdquo;
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Category: </span>
                        {SAMPLE_PROMPTS[selectedExample].category}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700">Analysis: </span>
                        {SAMPLE_PROMPTS[selectedExample].description}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700">Expected Behavior: </span>
                        {selectedExample === 0 && "Weather-related terms will have high probability. Temperature affects creativity in description."}
                        {selectedExample === 1 && "Technical vocabulary dominates. Lower temperature recommended for accuracy."}
                        {selectedExample === 2 && "Very high confidence for 'Paris'. Demonstrates factual knowledge retrieval."}
                        {selectedExample === 3 && "Multiple valid educational paths. Benefits from higher temperature for diversity."}
                        {selectedExample === 4 && "Speculative content with many possibilities. Higher temperature encourages creativity."}
                        {selectedExample === 5 && "Future predictions allow for creative exploration of possibilities."}
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700">Recommended Settings: </span>
                        {selectedExample === 0 && "Temperature: 0.6-0.8, Top-p: 0.8-0.9"}
                        {selectedExample === 1 && "Temperature: 0.4-0.6, Top-p: 0.7-0.8"}
                        {selectedExample === 2 && "Temperature: 0.2-0.4, Top-p: 0.6-0.7"}
                        {selectedExample === 3 && "Temperature: 0.7-0.9, Top-p: 0.8-0.95"}
                        {selectedExample === 4 && "Temperature: 0.8-1.2, Top-p: 0.9-0.95"}
                        {selectedExample === 5 && "Temperature: 0.9-1.3, Top-p: 0.9-0.95"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setPrompt(SAMPLE_PROMPTS[selectedExample].text)
                        setActiveTab('generator')
                      }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Play size={18} className="mr-2" />
                      Try This Example
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Engineering Tips */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="mr-2 text-green-600" size={20} />
                Prompt Engineering Best Practices
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-semibold text-sm text-green-700">Be Specific</div>
                    <div className="text-sm text-gray-600">Clear, specific prompts lead to more focused outputs</div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-semibold text-sm text-blue-700">Provide Context</div>
                    <div className="text-sm text-gray-600">Include relevant background information</div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="font-semibold text-sm text-purple-700">Set the Tone</div>
                    <div className="text-sm text-gray-600">Your prompt&apos;s style influences the output style</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="font-semibold text-sm text-orange-700">Consider Length</div>
                    <div className="text-sm text-gray-600">Longer prompts provide more context but may confuse</div>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="font-semibold text-sm text-red-700">Test Variations</div>
                    <div className="text-sm text-gray-600">Small changes can significantly affect output</div>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <div className="font-semibold text-sm text-indigo-700">Match Parameters</div>
                    <div className="text-sm text-gray-600">Adjust temperature and sampling for your use case</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimulationLayout>
  )
}