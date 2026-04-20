export interface SimulationProps {
  className?: string
  onComplete?: () => void
  config?: Record<string, any>
}

export interface SimulationStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  duration?: number
  autoPlay?: boolean
}

export interface SimulationConfig {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  steps: SimulationStep[]
  defaultParams: Record<string, any>
}

export interface TokenizationData {
  text: string
  tokens: Array<{
    id: number
    text: string
    start: number
    end: number
    tokenId: number
  }>
  encoding: 'word' | 'subword' | 'character' | 'bpe'
}

export interface EmbeddingVector {
  word: string
  vector: number[]
  similarity?: number
  position?: { x: number; y: number; z?: number }
}

export interface AttentionHead {
  queryToken: number
  keyToken: number
  weight: number
  headIndex: number
}

export interface AttentionMatrix {
  tokens: string[]
  heads: AttentionHead[][]
  layer: number
}

export interface TransformerLayer {
  id: number
  type: 'encoder' | 'decoder'
  attentionWeights: AttentionMatrix
  feedForwardWeights: number[][]
  layerNormWeights: number[]
}

export interface LanguageModelPrediction {
  token: string
  probability: number
  logit: number
  rank: number
}

export interface RLHFStep {
  id: string
  type: 'pretrain' | 'sft' | 'reward' | 'ppo'
  description: string
  input: string
  output: string
  reward?: number
  advantage?: number
}

export interface VisualizationConfig {
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  animations: {
    duration: number
    easing: string
  }
}

export interface AgentFramework {
  name: string
  description: string
  color: string
  strengths: string[]
  weaknesses: string[]
  useCases: string[]
  complexity: 'Low' | 'Medium' | 'High' | 'Very High'
  performance: 'Medium' | 'High' | 'Very High'
  ecosystem: 'Minimal' | 'Limited' | 'Growing' | 'Good' | 'Excellent'
  learningCurve: 'Easy' | 'Moderate' | 'Steep' | 'Very Steep'
}

export interface FrameworkComparison {
  name: string
  complexity: number
  performance: number
  ecosystem: number
  learningCurve: number
  color: string
}

export interface DecisionTreeNode {
  id?: string
  question: string
  options: Array<{
    label: string
    value: string
    next?: string
    recommendation?: string
  }>
}

export interface CodeExample {
  framework: string
  code: string
  language: string
  task: string
}