import { ComponentType } from 'react'

export interface LessonContent {
  default: ComponentType
}

const lessonModules: Record<string, () => Promise<LessonContent>> = {
  'what-is-ai': () => import('@/content/lessons/what-is-ai/content'),
  'tokenization': () => import('@/content/lessons/tokenization/content'),
  'text-understanding': () => import('@/content/lessons/text-understanding/content'),
  'math-intuition': () => import('@/content/lessons/math-intuition/content'),
  'neural-networks': () => import('@/content/lessons/neural-networks/content'),
  'word-embeddings': () => import('@/content/lessons/word-embeddings/content'),
  'classical-ml': () => import('@/content/lessons/classical-ml/content'),
  'training-deep-networks': () => import('@/content/lessons/training-deep-networks/content'),
  'cnns': () => import('@/content/lessons/cnns/content'),
  'rnns-lstms': () => import('@/content/lessons/rnns-lstms/content'),
  'attention-mechanism': () => import('@/content/lessons/attention-mechanism/content'),
  'transformer-architecture': () => import('@/content/lessons/transformer-architecture/content'),
  'large-language-models': () => import('@/content/lessons/large-language-models/content'),
}

export function getAvailableSlugs(): string[] {
  return Object.keys(lessonModules)
}

export async function loadLessonContent(slug: string): Promise<ComponentType | null> {
  const loader = lessonModules[slug]
  if (!loader) return null
  const mod = await loader()
  return mod.default
}
