// Single source of truth for all lesson metadata

export type Level =
  | 'foundations'
  | 'deep-learning'
  | 'llms-modern-ai'
  | 'production'
  | 'agents-frontier';

export interface LessonMeta {
  number: number;
  slug: string;
  title: string;
  subtitle: string;
  level: Level;
  estimatedMinutes: number;
  prerequisites: string[];
  status: 'ready' | 'coming-soon';
}

export interface LevelInfo {
  id: Level;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

export const levels: LevelInfo[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    description: 'Core concepts and fundamentals',
    color: '#22c55e',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    dotColor: 'bg-green-500',
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning Core',
    description: 'Neural networks and modern architectures',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'llms-modern-ai',
    name: 'LLMs & Modern AI',
    description: 'Large language models and transformers',
    color: '#3b82f6',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    dotColor: 'bg-blue-500',
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Deployment and optimization',
    color: '#a855f7',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-500',
    dotColor: 'bg-purple-500',
  },
  {
    id: 'agents-frontier',
    name: 'Agents & Frontier',
    description: 'Advanced topics and emerging research',
    color: '#ef4444',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    dotColor: 'bg-red-500',
  },
];

export const lessons: LessonMeta[] = [
  // Level 1: Foundations
  {
    number: 1,
    slug: 'what-is-ai',
    title: 'What is AI & Machine Learning?',
    subtitle: 'The big picture — types of AI, how machines learn',
    level: 'foundations',
    estimatedMinutes: 20,
    prerequisites: [],
    status: 'ready',
  },
  {
    number: 2,
    slug: 'math-intuition',
    title: 'Math Intuition for AI',
    subtitle: 'Vectors, matrices, gradients — visual intuition, no proofs',
    level: 'foundations',
    estimatedMinutes: 30,
    prerequisites: [],
    status: 'coming-soon',
  },
  {
    number: 3,
    slug: 'text-understanding',
    title: 'How Computers Understand Text',
    subtitle: 'NLP basics, preprocessing, bag-of-words, TF-IDF',
    level: 'foundations',
    estimatedMinutes: 25,
    prerequisites: [],
    status: 'coming-soon',
  },
  {
    number: 4,
    slug: 'tokenization',
    title: 'Tokenization',
    subtitle: 'Breaking text into pieces — BPE, WordPiece, SentencePiece',
    level: 'foundations',
    estimatedMinutes: 25,
    prerequisites: ['text-understanding'],
    status: 'ready',
  },
  {
    number: 5,
    slug: 'word-embeddings',
    title: 'Word Embeddings & Vector Spaces',
    subtitle: 'Turning words into numbers — Word2Vec, GloVe, similarity',
    level: 'foundations',
    estimatedMinutes: 30,
    prerequisites: ['math-intuition'],
    status: 'coming-soon',
  },
  {
    number: 6,
    slug: 'classical-ml',
    title: 'Classical Machine Learning',
    subtitle: 'Regression, trees, SVM, clustering — how algorithms think',
    level: 'foundations',
    estimatedMinutes: 35,
    prerequisites: ['math-intuition'],
    status: 'coming-soon',
  },

  // Level 2: Deep Learning Core
  {
    number: 7,
    slug: 'neural-networks',
    title: 'Neural Networks & Backpropagation',
    subtitle: 'Perceptrons, layers, how a network learns step by step',
    level: 'deep-learning',
    estimatedMinutes: 35,
    prerequisites: ['math-intuition'],
    status: 'ready',
  },
  {
    number: 8,
    slug: 'training-deep-networks',
    title: 'Training Deep Networks',
    subtitle: 'Loss functions, optimizers, regularization, overfitting',
    level: 'deep-learning',
    estimatedMinutes: 30,
    prerequisites: ['neural-networks'],
    status: 'coming-soon',
  },
  {
    number: 9,
    slug: 'cnns',
    title: 'CNNs — How AI Sees Images',
    subtitle: 'Convolution, filters, pooling, feature maps, transfer learning',
    level: 'deep-learning',
    estimatedMinutes: 30,
    prerequisites: ['neural-networks'],
    status: 'coming-soon',
  },
  {
    number: 10,
    slug: 'rnns-lstms',
    title: 'RNNs & LSTMs — Sequence Memory',
    subtitle: 'Vanishing gradients, LSTM gates, the precursor to transformers',
    level: 'deep-learning',
    estimatedMinutes: 25,
    prerequisites: ['neural-networks'],
    status: 'coming-soon',
  },
  {
    number: 11,
    slug: 'attention-mechanism',
    title: 'Attention Mechanism',
    subtitle: 'Self-attention, multi-head attention, how models learn to focus',
    level: 'deep-learning',
    estimatedMinutes: 30,
    prerequisites: ['rnns-lstms'],
    status: 'coming-soon',
  },
  {
    number: 12,
    slug: 'transformer-architecture',
    title: 'Transformer Architecture',
    subtitle: 'Encoder, decoder, positional encoding — full animated walkthrough',
    level: 'deep-learning',
    estimatedMinutes: 40,
    prerequisites: ['attention-mechanism'],
    status: 'coming-soon',
  },

  // Level 3: LLMs & Modern AI
  {
    number: 13,
    slug: 'large-language-models',
    title: 'Large Language Models',
    subtitle: 'GPT, BERT, Llama, Claude — scaling laws and emergent abilities',
    level: 'llms-modern-ai',
    estimatedMinutes: 30,
    prerequisites: ['transformer-architecture'],
    status: 'coming-soon',
  },
  {
    number: 14,
    slug: 'pretraining-finetuning',
    title: 'Pre-training & Fine-tuning',
    subtitle: 'How LLMs learn from the internet, SFT, transfer learning',
    level: 'llms-modern-ai',
    estimatedMinutes: 25,
    prerequisites: ['large-language-models'],
    status: 'coming-soon',
  },
  {
    number: 15,
    slug: 'rlhf-alignment',
    title: 'RLHF & Alignment',
    subtitle: 'Teaching AI human preferences — reward models, DPO, Constitutional AI',
    level: 'llms-modern-ai',
    estimatedMinutes: 30,
    prerequisites: ['pretraining-finetuning'],
    status: 'coming-soon',
  },
  {
    number: 16,
    slug: 'prompt-engineering',
    title: 'Prompt Engineering',
    subtitle: 'Zero-shot, few-shot, chain-of-thought, structured outputs',
    level: 'llms-modern-ai',
    estimatedMinutes: 25,
    prerequisites: ['large-language-models'],
    status: 'coming-soon',
  },
  {
    number: 17,
    slug: 'peft-lora',
    title: 'PEFT — LoRA, QLoRA & Adapters',
    subtitle: 'Training 0.1% of parameters — efficient fine-tuning',
    level: 'llms-modern-ai',
    estimatedMinutes: 30,
    prerequisites: ['pretraining-finetuning'],
    status: 'coming-soon',
  },
  {
    number: 18,
    slug: 'multimodal-ai',
    title: 'Multimodal AI',
    subtitle: 'Vision-language models, diffusion models, cross-modal understanding',
    level: 'llms-modern-ai',
    estimatedMinutes: 30,
    prerequisites: ['large-language-models'],
    status: 'coming-soon',
  },

  // Level 4: Production
  {
    number: 19,
    slug: 'model-internals',
    title: 'Model Internals',
    subtitle: 'RoPE, MoE, GQA — inside Llama, Mistral, Gemma',
    level: 'production',
    estimatedMinutes: 35,
    prerequisites: ['transformer-architecture'],
    status: 'coming-soon',
  },
  {
    number: 20,
    slug: 'quantization',
    title: 'Quantization & Compression',
    subtitle: 'INT8/INT4, GPTQ, AWQ, GGUF — quality vs size trade-offs',
    level: 'production',
    estimatedMinutes: 30,
    prerequisites: ['model-internals'],
    status: 'coming-soon',
  },
  {
    number: 21,
    slug: 'inference-serving',
    title: 'Inference & Serving',
    subtitle: 'vLLM, KV-cache, paged attention, Flash Attention, batching',
    level: 'production',
    estimatedMinutes: 35,
    prerequisites: ['quantization'],
    status: 'coming-soon',
  },
  {
    number: 22,
    slug: 'evaluation-benchmarks',
    title: 'Evaluation & Benchmarks',
    subtitle: 'MMLU, HumanEval, BLEU, ROUGE — measuring if AI works',
    level: 'production',
    estimatedMinutes: 25,
    prerequisites: ['large-language-models'],
    status: 'coming-soon',
  },
  {
    number: 23,
    slug: 'mlops-deployment',
    title: 'MLOps & Deployment',
    subtitle: 'Pipelines, monitoring, drift detection — notebook to production',
    level: 'production',
    estimatedMinutes: 30,
    prerequisites: ['inference-serving'],
    status: 'coming-soon',
  },

  // Level 5: Agents & Frontier
  {
    number: 24,
    slug: 'rag-vector-search',
    title: 'RAG & Vector Search',
    subtitle: 'Retrieval-augmented generation, vector databases, chunking',
    level: 'agents-frontier',
    estimatedMinutes: 30,
    prerequisites: ['large-language-models'],
    status: 'coming-soon',
  },
  {
    number: 25,
    slug: 'agents-reasoning',
    title: 'Agents & Reasoning',
    subtitle: 'ReAct, chain-of-thought, planning, tool use, function calling',
    level: 'agents-frontier',
    estimatedMinutes: 35,
    prerequisites: ['prompt-engineering'],
    status: 'coming-soon',
  },
  {
    number: 26,
    slug: 'agent-frameworks',
    title: 'Agent Frameworks',
    subtitle: 'LangChain, LlamaIndex, CrewAI, Claude Agent SDK',
    level: 'agents-frontier',
    estimatedMinutes: 35,
    prerequisites: ['agents-reasoning'],
    status: 'coming-soon',
  },
  {
    number: 27,
    slug: 'reasoning-models',
    title: 'Reasoning Models & Extended Thinking',
    subtitle: 'o1/o3-style reasoning, test-time compute, self-verification',
    level: 'agents-frontier',
    estimatedMinutes: 25,
    prerequisites: ['agents-reasoning'],
    status: 'coming-soon',
  },
  {
    number: 28,
    slug: 'ai-safety-ethics',
    title: 'AI Safety & Ethics',
    subtitle: 'Hallucinations, bias, prompt injection, responsible AI',
    level: 'agents-frontier',
    estimatedMinutes: 25,
    prerequisites: ['rlhf-alignment'],
    status: 'coming-soon',
  },
  {
    number: 29,
    slug: 'new-architectures',
    title: 'State Space Models & New Architectures',
    subtitle: 'Mamba, S4, RWKV — what comes after transformers?',
    level: 'agents-frontier',
    estimatedMinutes: 25,
    prerequisites: ['transformer-architecture'],
    status: 'coming-soon',
  },
  {
    number: 30,
    slug: 'production-ai-systems',
    title: 'Building Production AI Systems',
    subtitle: 'End-to-end capstone — data to deployment with guardrails',
    level: 'agents-frontier',
    estimatedMinutes: 45,
    prerequisites: ['mlops-deployment', 'agent-frameworks'],
    status: 'coming-soon',
  },
];

// Helper functions

export function getLessonBySlug(slug: string): LessonMeta | undefined {
  return lessons.find(lesson => lesson.slug === slug);
}

export function getLevelLessons(level: Level): LessonMeta[] {
  return lessons.filter(lesson => lesson.level === level);
}

export function getLevelInfo(level: Level): LevelInfo | undefined {
  return levels.find(l => l.id === level);
}

export function getNextLesson(currentSlug: string): LessonMeta | undefined {
  const currentIndex = lessons.findIndex(lesson => lesson.slug === currentSlug);
  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return undefined;
  }
  return lessons[currentIndex + 1];
}

export function getPreviousLesson(currentSlug: string): LessonMeta | undefined {
  const currentIndex = lessons.findIndex(lesson => lesson.slug === currentSlug);
  if (currentIndex === -1 || currentIndex === 0) {
    return undefined;
  }
  return lessons[currentIndex - 1];
}

export function getRelatedLessons(slug: string): LessonMeta[] {
  const currentLesson = getLessonBySlug(slug);
  if (!currentLesson) {
    return [];
  }

  // Get lessons from the same level, excluding the current lesson
  const sameLevelLessons = lessons.filter(
    lesson => lesson.level === currentLesson.level && lesson.slug !== slug
  );

  // Return up to 3 lessons
  return sameLevelLessons.slice(0, 3);
}
