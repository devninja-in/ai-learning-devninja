# AI Learning Platform Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the DevNinja AI Learning Platform from a simulation gallery into a 30-lesson, 5-level AI/ML learning portal with inline simulations and animated diagrams.

**Architecture:** Lesson-first architecture where each topic is a self-contained page with embedded simulations. Lesson content as TSX components (React components with prose, diagrams, and simulations inline — no MDX config needed, works cleanly with static export). Shared lesson layout components enforce consistent 7-section structure across all lessons. Static export to Cloudflare.

**Tech Stack:** Next.js 14+ (App Router, static export), React 18, TypeScript, TailwindCSS, Framer Motion, D3.js, MDX

**Spec:** `docs/superpowers/specs/2026-04-25-ai-learning-platform-redesign-design.md`

**Scope of this plan:** Infrastructure, site pages (homepage, learning path, glossary), diagram/animation system, and 3 template lessons (Lesson 1, 4, 7). Remaining 27 lessons follow the same pattern established here.

---

## File Structure

### New files to create

```
src/
  data/
    curriculum.ts                    # All 30 lessons metadata, levels, slugs, ordering
  app/
    page.tsx                         # Homepage (rewrite existing)
    layout.tsx                       # Root layout (update existing)
    learn/
      page.tsx                       # Learning path grid
      [slug]/
        page.tsx                     # Dynamic lesson page renderer
    glossary/
      page.tsx                       # Searchable glossary
  components/
    layout/
      SiteHeader.tsx                 # New minimal nav bar
      SiteFooter.tsx                 # New clean footer
    lessons/
      LessonPage.tsx                 # Main lesson layout (7-section structure)
      LessonHeader.tsx               # Title, breadcrumb, difficulty, time
      LessonSection.tsx              # Reusable section wrapper with anchor
      NextLesson.tsx                 # "Continue to next lesson" CTA
      KeyTakeaways.tsx               # Takeaways bullet list
      GoDeeper.tsx                   # Collapsible advanced content
      GlossaryTerm.tsx               # Inline term with tooltip + glossary link
      QuizQuestion.tsx               # Optional quick quiz component
    diagrams/
      StepAnimation.tsx              # Step-by-step animation wrapper (core)
      FlowDiagram.tsx                # Animated flow/process diagram
      NetworkDiagram.tsx             # Neural network visualizer
      MatrixView.tsx                 # Vector/matrix visualizer
    simulations/
      TokenizationSim.tsx            # Refactored from existing simulation
      WhatIsAISim.tsx                # New: ML types interactive demo
      NeuralNetSim.tsx               # New: forward/backward pass visualizer
  lib/
    glossary.ts                      # Parse glossary markdown, search
    lessons.ts                       # Lesson data helpers, navigation
  content/
    lessons/
      what-is-ai/
        content.tsx                  # Lesson 1 full content as React component
      tokenization/
        content.tsx                  # Lesson 4 full content
      neural-networks/
        content.tsx                  # Lesson 7 full content
```

### Files to delete

```
src/app/simulations/                 # Entire directory (all simulation pages)
src/pages.old/                       # Legacy pages router
src/components/SimulationLayout.tsx   # Replaced by LessonPage
content/learning-pathways/           # Replaced by /learn page
content/assessment/                  # Not needed for v1
CLOUDFLARE_DEPLOYMENT.md             # Cleanup
DESIGN_SYSTEM_ANALYSIS.md            # Cleanup
```

### Files to modify

```
src/app/globals.css                  # Simplify, remove dark mode, add lesson styles
next.config.js                       # Keep static export, remove SVG loader if unused
tailwind.config.js                   # Simplify color palette
```

---

### Task 1: Clean up old files and create directory structure

**Files:**
- Delete: `src/pages.old/`, `content/learning-pathways/`, `content/assessment/`, `CLOUDFLARE_DEPLOYMENT.md`, `DESIGN_SYSTEM_ANALYSIS.md`
- Create: directory structure for new components

- [ ] **Step 1: Delete legacy and unused files**

```bash
rm -rf src/pages.old/
rm -rf content/learning-pathways/
rm -rf content/assessment/
rm -f CLOUDFLARE_DEPLOYMENT.md
rm -f DESIGN_SYSTEM_ANALYSIS.md
```

- [ ] **Step 2: Create new directory structure**

```bash
mkdir -p src/data
mkdir -p src/components/layout
mkdir -p src/components/lessons
mkdir -p src/components/diagrams
mkdir -p src/components/simulations
mkdir -p src/lib
mkdir -p src/content/lessons/what-is-ai
mkdir -p src/content/lessons/tokenization
mkdir -p src/content/lessons/neural-networks
```

- [ ] **Step 3: Verify structure exists**

```bash
find src/components/lessons src/components/diagrams src/components/simulations src/data src/lib content/lessons -type d
```

Expected: all directories listed above exist.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: clean up legacy files and create new directory structure"
```

---

### Task 2: Create curriculum data

**Files:**
- Create: `src/data/curriculum.ts`

This is the single source of truth for all lesson metadata — titles, slugs, levels, prerequisites, estimated times.

- [ ] **Step 1: Create curriculum data file**

Create `src/data/curriculum.ts`:

```typescript
export type Level = 'foundations' | 'deep-learning' | 'llms-modern-ai' | 'production' | 'agents-frontier'

export interface LessonMeta {
  number: number
  slug: string
  title: string
  subtitle: string
  level: Level
  estimatedMinutes: number
  prerequisites: string[]
  status: 'ready' | 'coming-soon'
}

export interface LevelInfo {
  id: Level
  name: string
  description: string
  color: string
  borderColor: string
  bgColor: string
  textColor: string
  dotColor: string
}

export const levels: LevelInfo[] = [
  {
    id: 'foundations',
    name: 'Foundations',
    description: 'For complete beginners. Real-world analogies, zero math assumed.',
    color: '#22c55e',
    borderColor: 'border-green-300',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning Core',
    description: 'Neural networks and the building blocks of modern AI.',
    color: '#f59e0b',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'llms-modern-ai',
    name: 'LLMs & Modern AI',
    description: 'How today\'s AI systems are built, trained, and used.',
    color: '#3b82f6',
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
  },
  {
    id: 'production',
    name: 'Production & Infrastructure',
    description: 'Making AI systems fast, small, and reliable.',
    color: '#a855f7',
    borderColor: 'border-purple-300',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    dotColor: 'bg-purple-500',
  },
  {
    id: 'agents-frontier',
    name: 'Agents & Cutting Edge',
    description: 'Autonomous agents, reasoning, and the frontier of AI.',
    color: '#ef4444',
    borderColor: 'border-red-300',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
]

export const lessons: LessonMeta[] = [
  // Level 1: Foundations
  { number: 1,  slug: 'what-is-ai',           title: 'What is AI & Machine Learning?',       subtitle: 'The big picture — types of AI, how machines learn',                   level: 'foundations',     estimatedMinutes: 20, prerequisites: [],                    status: 'ready' },
  { number: 2,  slug: 'math-intuition',        title: 'Math Intuition for AI',                subtitle: 'Vectors, matrices, gradients — visual intuition, no proofs',           level: 'foundations',     estimatedMinutes: 30, prerequisites: [],                    status: 'coming-soon' },
  { number: 3,  slug: 'text-understanding',    title: 'How Computers Understand Text',         subtitle: 'NLP basics, preprocessing, bag-of-words, TF-IDF',                     level: 'foundations',     estimatedMinutes: 25, prerequisites: [],                    status: 'coming-soon' },
  { number: 4,  slug: 'tokenization',          title: 'Tokenization',                          subtitle: 'Breaking text into pieces — BPE, WordPiece, SentencePiece',           level: 'foundations',     estimatedMinutes: 25, prerequisites: ['text-understanding'], status: 'ready' },
  { number: 5,  slug: 'word-embeddings',       title: 'Word Embeddings & Vector Spaces',       subtitle: 'Turning words into numbers — Word2Vec, GloVe, similarity',            level: 'foundations',     estimatedMinutes: 30, prerequisites: ['math-intuition'],     status: 'coming-soon' },
  { number: 6,  slug: 'classical-ml',          title: 'Classical Machine Learning',             subtitle: 'Regression, trees, SVM, clustering — how algorithms think',           level: 'foundations',     estimatedMinutes: 35, prerequisites: ['math-intuition'],     status: 'coming-soon' },

  // Level 2: Deep Learning Core
  { number: 7,  slug: 'neural-networks',       title: 'Neural Networks & Backpropagation',     subtitle: 'Perceptrons, layers, how a network learns step by step',               level: 'deep-learning',   estimatedMinutes: 35, prerequisites: ['math-intuition'],     status: 'ready' },
  { number: 8,  slug: 'training-deep-networks', title: 'Training Deep Networks',                subtitle: 'Loss functions, optimizers, regularization, overfitting',              level: 'deep-learning',   estimatedMinutes: 30, prerequisites: ['neural-networks'],    status: 'coming-soon' },
  { number: 9,  slug: 'cnns',                  title: 'CNNs — How AI Sees Images',             subtitle: 'Convolution, filters, pooling, feature maps, transfer learning',       level: 'deep-learning',   estimatedMinutes: 30, prerequisites: ['neural-networks'],    status: 'coming-soon' },
  { number: 10, slug: 'rnns-lstms',            title: 'RNNs & LSTMs — Sequence Memory',        subtitle: 'Vanishing gradients, LSTM gates, the precursor to transformers',       level: 'deep-learning',   estimatedMinutes: 25, prerequisites: ['neural-networks'],    status: 'coming-soon' },
  { number: 11, slug: 'attention-mechanism',    title: 'Attention Mechanism',                   subtitle: 'Self-attention, multi-head attention, how models learn to focus',      level: 'deep-learning',   estimatedMinutes: 30, prerequisites: ['rnns-lstms'],         status: 'coming-soon' },
  { number: 12, slug: 'transformer-architecture', title: 'Transformer Architecture',            subtitle: 'Encoder, decoder, positional encoding — full animated walkthrough',    level: 'deep-learning',   estimatedMinutes: 40, prerequisites: ['attention-mechanism'], status: 'coming-soon' },

  // Level 3: LLMs & Modern AI
  { number: 13, slug: 'large-language-models',  title: 'Large Language Models',                 subtitle: 'GPT, BERT, Llama, Claude — scaling laws and emergent abilities',       level: 'llms-modern-ai',  estimatedMinutes: 30, prerequisites: ['transformer-architecture'], status: 'coming-soon' },
  { number: 14, slug: 'pretraining-finetuning', title: 'Pre-training & Fine-tuning',            subtitle: 'How LLMs learn from the internet, SFT, transfer learning',             level: 'llms-modern-ai',  estimatedMinutes: 25, prerequisites: ['large-language-models'],    status: 'coming-soon' },
  { number: 15, slug: 'rlhf-alignment',         title: 'RLHF & Alignment',                     subtitle: 'Teaching AI human preferences — reward models, DPO, Constitutional AI', level: 'llms-modern-ai',  estimatedMinutes: 30, prerequisites: ['pretraining-finetuning'],   status: 'coming-soon' },
  { number: 16, slug: 'prompt-engineering',      title: 'Prompt Engineering',                   subtitle: 'Zero-shot, few-shot, chain-of-thought, structured outputs',            level: 'llms-modern-ai',  estimatedMinutes: 25, prerequisites: ['large-language-models'],    status: 'coming-soon' },
  { number: 17, slug: 'peft-lora',              title: 'PEFT — LoRA, QLoRA & Adapters',         subtitle: 'Training 0.1% of parameters — efficient fine-tuning',                  level: 'llms-modern-ai',  estimatedMinutes: 30, prerequisites: ['pretraining-finetuning'],   status: 'coming-soon' },
  { number: 18, slug: 'multimodal-ai',          title: 'Multimodal AI',                         subtitle: 'Vision-language models, diffusion models, cross-modal understanding',  level: 'llms-modern-ai',  estimatedMinutes: 30, prerequisites: ['large-language-models'],    status: 'coming-soon' },

  // Level 4: Production & Infrastructure
  { number: 19, slug: 'model-internals',        title: 'Model Internals',                       subtitle: 'RoPE, MoE, GQA — inside Llama, Mistral, Gemma',                       level: 'production',      estimatedMinutes: 35, prerequisites: ['transformer-architecture'], status: 'coming-soon' },
  { number: 20, slug: 'quantization',           title: 'Quantization & Compression',            subtitle: 'INT8/INT4, GPTQ, AWQ, GGUF — quality vs size trade-offs',              level: 'production',      estimatedMinutes: 30, prerequisites: ['model-internals'],          status: 'coming-soon' },
  { number: 21, slug: 'inference-serving',       title: 'Inference & Serving',                  subtitle: 'vLLM, KV-cache, paged attention, Flash Attention, batching',           level: 'production',      estimatedMinutes: 35, prerequisites: ['quantization'],             status: 'coming-soon' },
  { number: 22, slug: 'evaluation-benchmarks',   title: 'Evaluation & Benchmarks',              subtitle: 'MMLU, HumanEval, BLEU, ROUGE — measuring if AI works',                level: 'production',      estimatedMinutes: 25, prerequisites: ['large-language-models'],    status: 'coming-soon' },
  { number: 23, slug: 'mlops-deployment',        title: 'MLOps & Deployment',                   subtitle: 'Pipelines, monitoring, drift detection — notebook to production',      level: 'production',      estimatedMinutes: 30, prerequisites: ['inference-serving'],        status: 'coming-soon' },

  // Level 5: Agents & Cutting Edge
  { number: 24, slug: 'rag-vector-search',       title: 'RAG & Vector Search',                  subtitle: 'Retrieval-augmented generation, vector databases, chunking',           level: 'agents-frontier', estimatedMinutes: 30, prerequisites: ['large-language-models'],    status: 'coming-soon' },
  { number: 25, slug: 'agents-reasoning',        title: 'Agents & Reasoning',                   subtitle: 'ReAct, chain-of-thought, planning, tool use, function calling',        level: 'agents-frontier', estimatedMinutes: 35, prerequisites: ['prompt-engineering'],       status: 'coming-soon' },
  { number: 26, slug: 'agent-frameworks',        title: 'Agent Frameworks',                     subtitle: 'LangChain, LlamaIndex, CrewAI, Claude Agent SDK',                     level: 'agents-frontier', estimatedMinutes: 35, prerequisites: ['agents-reasoning'],         status: 'coming-soon' },
  { number: 27, slug: 'reasoning-models',        title: 'Reasoning Models & Extended Thinking',  subtitle: 'o1/o3-style reasoning, test-time compute, self-verification',         level: 'agents-frontier', estimatedMinutes: 25, prerequisites: ['agents-reasoning'],         status: 'coming-soon' },
  { number: 28, slug: 'ai-safety-ethics',        title: 'AI Safety & Ethics',                   subtitle: 'Hallucinations, bias, prompt injection, responsible AI',              level: 'agents-frontier', estimatedMinutes: 25, prerequisites: ['rlhf-alignment'],           status: 'coming-soon' },
  { number: 29, slug: 'new-architectures',       title: 'State Space Models & New Architectures', subtitle: 'Mamba, S4, RWKV — what comes after transformers?',                  level: 'agents-frontier', estimatedMinutes: 25, prerequisites: ['transformer-architecture'], status: 'coming-soon' },
  { number: 30, slug: 'production-ai-systems',   title: 'Building Production AI Systems',        subtitle: 'End-to-end capstone — data to deployment with guardrails',            level: 'agents-frontier', estimatedMinutes: 45, prerequisites: ['mlops-deployment', 'agent-frameworks'], status: 'coming-soon' },
]

export function getLessonBySlug(slug: string): LessonMeta | undefined {
  return lessons.find(l => l.slug === slug)
}

export function getLevelLessons(level: Level): LessonMeta[] {
  return lessons.filter(l => l.level === level)
}

export function getLevelInfo(level: Level): LevelInfo | undefined {
  return levels.find(l => l.id === level)
}

export function getNextLesson(currentSlug: string): LessonMeta | undefined {
  const current = lessons.find(l => l.slug === currentSlug)
  if (!current) return undefined
  return lessons.find(l => l.number === current.number + 1)
}

export function getPreviousLesson(currentSlug: string): LessonMeta | undefined {
  const current = lessons.find(l => l.slug === currentSlug)
  if (!current) return undefined
  return lessons.find(l => l.number === current.number - 1)
}

export function getRelatedLessons(slug: string): LessonMeta[] {
  const lesson = getLessonBySlug(slug)
  if (!lesson) return []
  return lessons.filter(l => l.level === lesson.level && l.slug !== slug).slice(0, 3)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit src/data/curriculum.ts 2>&1 | head -20
```

Expected: no errors (or only unrelated existing errors).

- [ ] **Step 3: Commit**

```bash
git add src/data/curriculum.ts
git commit -m "feat: add curriculum data with 30 lessons across 5 levels"
```

---

### Task 3: Create shared lesson layout components

**Files:**
- Create: `src/components/lessons/LessonHeader.tsx`
- Create: `src/components/lessons/LessonSection.tsx`
- Create: `src/components/lessons/KeyTakeaways.tsx`
- Create: `src/components/lessons/GoDeeper.tsx`
- Create: `src/components/lessons/GlossaryTerm.tsx`
- Create: `src/components/lessons/NextLesson.tsx`
- Create: `src/components/lessons/QuizQuestion.tsx`
- Create: `src/components/lessons/LessonPage.tsx`

- [ ] **Step 1: Create LessonHeader**

Create `src/components/lessons/LessonHeader.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { LessonMeta, getLevelInfo } from '@/data/curriculum'

interface LessonHeaderProps {
  lesson: LessonMeta
}

export default function LessonHeader({ lesson }: LessonHeaderProps) {
  const level = getLevelInfo(lesson.level)
  const difficultyLabel = lesson.level === 'foundations' ? 'Beginner'
    : lesson.level === 'deep-learning' ? 'Intermediate'
    : 'Advanced'

  return (
    <header className="border-b border-gray-100 pb-8 mb-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/learn" className="hover:text-gray-900 transition-colors">
          Learning Path
        </Link>
        <ChevronRight size={14} />
        <span className={level?.textColor}>{level?.name}</span>
        <ChevronRight size={14} />
        <span className="text-gray-900">{lesson.title}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-lg text-gray-500 mt-2">{lesson.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${level?.bgColor} ${level?.textColor}`}>
            {difficultyLabel}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <Clock size={14} />
            {lesson.estimatedMinutes} min
          </span>
        </div>
      </div>

      {lesson.prerequisites.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-gray-500">Prerequisites:</span>
          {lesson.prerequisites.map(slug => (
            <Link
              key={slug}
              href={`/learn/${slug}`}
              className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
            >
              {slug.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Create LessonSection**

Create `src/components/lessons/LessonSection.tsx`:

```tsx
import { ReactNode } from 'react'

interface LessonSectionProps {
  id: string
  title?: string
  children: ReactNode
  className?: string
}

export default function LessonSection({ id, title, children, className = '' }: LessonSectionProps) {
  return (
    <section id={id} className={`mb-16 scroll-mt-24 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      {children}
    </section>
  )
}
```

- [ ] **Step 3: Create KeyTakeaways**

Create `src/components/lessons/KeyTakeaways.tsx`:

```tsx
import { CheckCircle } from 'lucide-react'

interface KeyTakeawaysProps {
  points: string[]
  misconceptions?: string[]
}

export default function KeyTakeaways({ points, misconceptions }: KeyTakeawaysProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Takeaways</h2>
      <ul className="space-y-3">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
            <span className="text-gray-700">{point}</span>
          </li>
        ))}
      </ul>
      {misconceptions && misconceptions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Common misconceptions</h3>
          <ul className="space-y-2">
            {misconceptions.map((m, i) => (
              <li key={i} className="text-gray-600 text-sm pl-4 border-l-2 border-amber-300">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create GoDeeper**

Create `src/components/lessons/GoDeeper.tsx`:

```tsx
'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GoDeeperProps {
  title?: string
  children: ReactNode
}

export default function GoDeeper({ title = 'Go deeper', children }: GoDeeperProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-gray-700 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 5: Create GlossaryTerm**

Create `src/components/lessons/GlossaryTerm.tsx`:

```tsx
'use client'

import { useState } from 'react'

interface GlossaryTermProps {
  term: string
  definition: string
  children: React.ReactNode
}

export default function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <span className="relative inline">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="border-b border-dashed border-blue-400 cursor-help text-blue-700"
      >
        {children}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50">
          <span className="font-semibold block mb-1">{term}</span>
          <span className="text-gray-300">{definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  )
}
```

- [ ] **Step 6: Create NextLesson**

Create `src/components/lessons/NextLesson.tsx`:

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LessonMeta, getNextLesson, getRelatedLessons, getLevelInfo } from '@/data/curriculum'

interface NextLessonProps {
  currentSlug: string
}

export default function NextLesson({ currentSlug }: NextLessonProps) {
  const next = getNextLesson(currentSlug)
  const related = getRelatedLessons(currentSlug)

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      {next && (
        <Link
          href={`/learn/${next.slug}`}
          className="group flex items-center justify-between p-6 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <div>
            <span className="text-sm text-gray-400">Up next</span>
            <h3 className="text-xl font-bold mt-1">{next.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{next.subtitle}</p>
          </div>
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
        </Link>
      )}

      {related.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Related topics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map(lesson => {
              const level = getLevelInfo(lesson.level)
              return (
                <Link
                  key={lesson.slug}
                  href={`/learn/${lesson.slug}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <span className={`text-xs font-medium ${level?.textColor}`}>{level?.name}</span>
                  <p className="font-medium text-gray-900 mt-1 text-sm">{lesson.title}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Create QuizQuestion**

Create `src/components/lessons/QuizQuestion.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface QuizQuestionProps {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export default function QuizQuestion({ question, options, correctIndex, explanation }: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected === correctIndex

  return (
    <div className="border border-gray-200 rounded-xl p-6 my-6">
      <p className="font-medium text-gray-900 mb-4">{question}</p>
      <div className="space-y-2">
        {options.map((option, i) => {
          const isSelected = selected === i
          const isCorrect = i === correctIndex
          let style = 'border-gray-200 hover:border-gray-300'
          if (answered && isCorrect) style = 'border-green-500 bg-green-50'
          if (answered && isSelected && !isCorrect) style = 'border-red-500 bg-red-50'

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${style}`}
            >
              <span className="flex items-center gap-2">
                {answered && isCorrect && <CheckCircle size={16} className="text-green-500" />}
                {answered && isSelected && !isCorrect && <XCircle size={16} className="text-red-500" />}
                {option}
              </span>
            </button>
          )
        })}
      </div>
      {answered && (
        <p className={`mt-4 text-sm ${correct ? 'text-green-700' : 'text-gray-600'}`}>
          {explanation}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Create LessonPage wrapper**

Create `src/components/lessons/LessonPage.tsx`:

```tsx
import { ReactNode } from 'react'
import { LessonMeta } from '@/data/curriculum'
import LessonHeader from './LessonHeader'
import NextLesson from './NextLesson'

interface LessonPageProps {
  lesson: LessonMeta
  children: ReactNode
}

export default function LessonPage({ lesson, children }: LessonPageProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <LessonHeader lesson={lesson} />
      <div className="prose-custom">
        {children}
      </div>
      <NextLesson currentSlug={lesson.slug} />
    </article>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add src/components/lessons/
git commit -m "feat: add shared lesson layout components"
```

---

### Task 4: Create diagram and animation system

**Files:**
- Create: `src/components/diagrams/StepAnimation.tsx`
- Create: `src/components/diagrams/FlowDiagram.tsx`
- Create: `src/components/diagrams/NetworkDiagram.tsx`

- [ ] **Step 1: Create StepAnimation wrapper**

Create `src/components/diagrams/StepAnimation.tsx`:

```tsx
'use client'

import { useState, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  title: string
  content: ReactNode
}

interface StepAnimationProps {
  steps: Step[]
  className?: string
}

export default function StepAnimation({ steps, className = '' }: StepAnimationProps) {
  const [current, setCurrent] = useState(0)

  const goNext = () => setCurrent(c => Math.min(c + 1, steps.length - 1))
  const goPrev = () => setCurrent(c => Math.max(c - 1, 0))

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden my-8 ${className}`}>
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {steps[current].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-gray-800/50 border-t border-gray-700">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            Step {current + 1} of {steps.length}
          </span>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === current ? 'bg-blue-400' : i < current ? 'bg-gray-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goNext}
          disabled={current === steps.length - 1}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create FlowDiagram**

Create `src/components/diagrams/FlowDiagram.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

interface FlowNode {
  id: string
  label: string
  sublabel?: string
  type: 'input' | 'process' | 'output' | 'attention'
}

interface FlowDiagramProps {
  nodes: FlowNode[]
  title?: string
  animate?: boolean
}

const nodeColors = {
  input: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  process: { bg: '#14532d', border: '#22c55e', text: '#86efac' },
  output: { bg: '#3b0764', border: '#a855f7', text: '#d8b4fe' },
  attention: { bg: '#451a03', border: '#f59e0b', text: '#fcd34d' },
}

export default function FlowDiagram({ nodes, title, animate = true }: FlowDiagramProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 sm:p-8 my-8">
      {title && <h3 className="text-white font-semibold mb-6 text-center">{title}</h3>}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center gap-3">
            <motion.div
              initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              viewport={{ once: true }}
              className="px-5 py-3 rounded-lg border text-center min-w-[120px]"
              style={{
                backgroundColor: nodeColors[node.type].bg,
                borderColor: nodeColors[node.type].border,
              }}
            >
              <div className="font-mono text-sm" style={{ color: nodeColors[node.type].text }}>
                {node.label}
              </div>
              {node.sublabel && (
                <div className="text-xs text-gray-400 mt-1">{node.sublabel}</div>
              )}
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.div
                initial={animate ? { opacity: 0 } : undefined}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.1 }}
                viewport={{ once: true }}
                className="text-gray-600 text-lg hidden sm:block"
              >
                →
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create NetworkDiagram**

Create `src/components/diagrams/NetworkDiagram.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

interface NetworkDiagramProps {
  layers: number[]
  activeLayer?: number
  title?: string
}

export default function NetworkDiagram({ layers, activeLayer, title }: NetworkDiagramProps) {
  const width = 600
  const height = 300
  const padding = 60
  const maxNodes = Math.max(...layers)

  const getNodePosition = (layerIndex: number, nodeIndex: number) => {
    const x = padding + (layerIndex / (layers.length - 1)) * (width - 2 * padding)
    const layerSize = layers[layerIndex]
    const spacing = (height - 2 * padding) / (layerSize + 1)
    const y = padding + (nodeIndex + 1) * spacing
    return { x, y }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-6 sm:p-8 my-8">
      {title && <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg mx-auto">
        {/* Connections */}
        {layers.map((layerSize, li) => {
          if (li === layers.length - 1) return null
          const nextSize = layers[li + 1]
          return Array.from({ length: layerSize }).flatMap((_, ni) =>
            Array.from({ length: nextSize }).map((_, nj) => {
              const from = getNodePosition(li, ni)
              const to = getNodePosition(li + 1, nj)
              const isActive = activeLayer !== undefined && (li === activeLayer || li + 1 === activeLayer)
              return (
                <motion.line
                  key={`${li}-${ni}-${nj}`}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isActive ? '#3b82f6' : '#374151'}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: isActive ? 0.8 : 0.3 }}
                  transition={{ delay: li * 0.2 }}
                  viewport={{ once: true }}
                />
              )
            })
          )
        })}
        {/* Nodes */}
        {layers.map((layerSize, li) =>
          Array.from({ length: layerSize }).map((_, ni) => {
            const pos = getNodePosition(li, ni)
            const isActive = activeLayer !== undefined && li === activeLayer
            return (
              <motion.circle
                key={`node-${li}-${ni}`}
                cx={pos.x} cy={pos.y} r={isActive ? 10 : 8}
                fill={isActive ? '#3b82f6' : '#1e293b'}
                stroke={isActive ? '#60a5fa' : '#475569'}
                strokeWidth={2}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: li * 0.15 + ni * 0.05 }}
                viewport={{ once: true }}
              />
            )
          })
        )}
        {/* Layer labels */}
        {layers.map((_, li) => {
          const x = padding + (li / (layers.length - 1)) * (width - 2 * padding)
          const labels = li === 0 ? 'Input' : li === layers.length - 1 ? 'Output' : `Hidden ${li}`
          return (
            <text key={`label-${li}`} x={x} y={height - 15} textAnchor="middle" fill="#9ca3af" fontSize={12}>
              {labels}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/diagrams/
git commit -m "feat: add diagram and animation system components"
```

---

### Task 5: Create site layout components

**Files:**
- Create: `src/components/layout/SiteHeader.tsx`
- Create: `src/components/layout/SiteFooter.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create SiteHeader**

Create `src/components/layout/SiteHeader.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/learn', label: 'Learning Path' },
  { href: '/glossary', label: 'Glossary' },
  { href: 'https://devninja.in', label: 'DevNinja.in', external: true },
]

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">DN</span>
          </div>
          <span className="font-semibold text-gray-900">AI Learning</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className={`text-sm transition-colors ${
                pathname?.startsWith(link.href) ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-1.5 text-gray-500 hover:text-gray-900"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Create SiteFooter**

Create `src/components/layout/SiteFooter.tsx`:

```tsx
import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <span>DevNinja AI Learning — Open source AI education</span>
          <div className="flex gap-6">
            <Link href="https://devninja.in" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              DevNinja.in
            </Link>
            <Link href="https://tools.devninja.in" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 transition-colors">
              Tools
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Update root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevNinja AI Learning — Learn AI/ML from Scratch',
  description: '30 interactive lessons with animated diagrams and simulations. Learn AI and machine learning from absolute beginner to production systems.',
  keywords: ['ai', 'machine learning', 'deep learning', 'llm', 'transformers', 'tutorial', 'interactive'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-gray-900 antialiased`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Simplify globals.css**

Replace `src/app/globals.css` with a clean, minimal stylesheet:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  .prose-custom {
    @apply text-gray-700 leading-relaxed;
  }
  .prose-custom p {
    @apply mb-5 text-base leading-7;
  }
  .prose-custom h2 {
    @apply text-2xl font-bold text-gray-900 mt-12 mb-6;
  }
  .prose-custom h3 {
    @apply text-xl font-semibold text-gray-900 mt-8 mb-4;
  }
  .prose-custom ul {
    @apply list-disc pl-6 mb-5 space-y-2;
  }
  .prose-custom ol {
    @apply list-decimal pl-6 mb-5 space-y-2;
  }
  .prose-custom code {
    @apply bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800;
  }
  .prose-custom pre {
    @apply bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-6;
  }
  .prose-custom pre code {
    @apply bg-transparent p-0 text-inherit;
  }
  .prose-custom blockquote {
    @apply border-l-4 border-blue-400 pl-4 py-1 my-6 text-gray-600 italic;
  }
  .prose-custom strong {
    @apply text-gray-900 font-semibold;
  }
  .prose-custom a {
    @apply text-blue-600 underline underline-offset-2 hover:text-blue-800;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx src/app/globals.css
git commit -m "feat: add site layout with minimal header, footer, and clean typography"
```

---

### Task 6: Build the homepage

**Files:**
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Rewrite homepage**

Replace `src/app/page.tsx` with:

```tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { levels, lessons, getLevelLessons } from '@/data/curriculum'

const featured = [
  { slug: 'what-is-ai', level: 'foundations' as const },
  { slug: 'neural-networks', level: 'deep-learning' as const },
  { slug: 'agents-reasoning', level: 'agents-frontier' as const },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
          Free & Open Source
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Learn AI & Machine Learning
          <br />
          from scratch.
        </h1>
        <p className="text-lg text-gray-500 mt-6 max-w-xl mx-auto leading-relaxed">
          30 interactive lessons with animated diagrams and hands-on simulations.
          No prerequisites. Go from &ldquo;what is AI?&rdquo; to building production systems.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link
            href="/learn/what-is-ai"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Learning
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
          >
            Browse Topics
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex justify-center gap-12 sm:gap-16">
          {[
            { value: '30', label: 'Lessons' },
            { value: '5', label: 'Levels' },
            { value: '30+', label: 'Simulations' },
            { value: '100%', label: 'Free' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning path preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Your learning journey</h2>
          <p className="text-gray-500 mt-2">Five levels from complete beginner to production AI</p>
        </div>

        <div className="flex items-center justify-center gap-0 overflow-x-auto pb-4">
          {levels.map((level, i) => (
            <div key={level.id} className="flex items-center">
              <div className="text-center flex-shrink-0 px-3">
                <div
                  className="w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm mx-auto mb-2"
                  style={{ borderColor: level.color, color: level.color, backgroundColor: `${level.color}15` }}
                >
                  {i + 1}
                </div>
                <div className="text-xs font-semibold text-gray-900 whitespace-nowrap">{level.name}</div>
                <div className="text-[10px] text-gray-400">{getLevelLessons(level.id).length} lessons</div>
              </div>
              {i < levels.length - 1 && (
                <div className="w-10 h-0.5 bg-gray-200 flex-shrink-0 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured lessons */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {featured.map(({ slug, level }) => {
            const lesson = lessons.find(l => l.slug === slug)
            const levelInfo = levels.find(l => l.id === level)
            if (!lesson || !levelInfo) return null

            return (
              <Link
                key={slug}
                href={`/learn/${slug}`}
                className="group border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: levelInfo.color }}>
                  {levelInfo.name}
                </span>
                <h3 className="font-semibold text-gray-900 mt-2">{lesson.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{lesson.subtitle}</p>
                <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-3 group-hover:gap-2 transition-all">
                  {lesson.status === 'ready' ? 'Start' : 'Coming soon'}
                  {lesson.status === 'ready' && <ArrowRight size={14} />}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Build and verify homepage renders**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. If there are errors, fix the imports.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: redesign homepage with clean minimal layout"
```

---

### Task 7: Build the learning path page

**Files:**
- Create: `src/app/learn/page.tsx`

- [ ] **Step 1: Create learning path page**

Create `src/app/learn/page.tsx`:

```tsx
import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { levels, getLevelLessons, getLevelInfo } from '@/data/curriculum'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learning Path — DevNinja AI Learning',
  description: 'All 30 AI/ML lessons organized across 5 levels from foundations to cutting-edge agents.',
}

export default function LearnPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Learning Path</h1>
        <p className="text-gray-500 mt-3 max-w-lg mx-auto">
          Click any topic to start. Follow the numbers for the recommended order, or jump to whatever catches your eye.
        </p>
      </div>

      <div className="space-y-12">
        {levels.map(level => {
          const levelLessons = getLevelLessons(level.id)

          return (
            <section key={level.id}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${level.dotColor}`} />
                <h2 className={`text-sm font-bold uppercase tracking-wider ${level.textColor}`}>
                  {level.name}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-4 pl-4">{level.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                {levelLessons.map(lesson => (
                  <Link
                    key={lesson.slug}
                    href={lesson.status === 'ready' ? `/learn/${lesson.slug}` : '#'}
                    className={`group border rounded-lg p-4 transition-all ${
                      lesson.status === 'ready'
                        ? `${level.borderColor} hover:shadow-sm hover:border-gray-300`
                        : 'border-gray-100 opacity-60 cursor-default'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {lesson.number}. {lesson.title}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{lesson.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {lesson.estimatedMinutes} min
                      </span>
                      {lesson.status === 'ready' ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Start <ArrowRight size={12} />
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Coming soon</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/learn/page.tsx
git commit -m "feat: add learning path page with topic grid"
```

---

### Task 8: Build the dynamic lesson page and glossary

**Files:**
- Create: `src/app/learn/[slug]/page.tsx`
- Create: `src/app/glossary/page.tsx`
- Create: `src/lib/lessons.ts`

- [ ] **Step 1: Create lesson registry**

Create `src/lib/lessons.ts`:

```typescript
import { ComponentType } from 'react'
import { LessonMeta } from '@/data/curriculum'

export interface LessonContent {
  default: ComponentType
}

const lessonModules: Record<string, () => Promise<LessonContent>> = {
  'what-is-ai': () => import('@/content/lessons/what-is-ai/content'),
  'tokenization': () => import('@/content/lessons/tokenization/content'),
  'neural-networks': () => import('@/content/lessons/neural-networks/content'),
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
```

- [ ] **Step 2: Create dynamic lesson page**

Create `src/app/learn/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getLessonBySlug, lessons } from '@/data/curriculum'
import { getAvailableSlugs, loadLessonContent } from '@/lib/lessons'
import LessonPage from '@/components/lessons/LessonPage'
import type { Metadata } from 'next'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAvailableSlugs().map(slug => ({ slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const lesson = getLessonBySlug(params.slug)
  if (!lesson) return {}
  return {
    title: `${lesson.title} — DevNinja AI Learning`,
    description: lesson.subtitle,
  }
}

export default async function LessonPageRoute({ params }: PageProps) {
  const lesson = getLessonBySlug(params.slug)
  if (!lesson) notFound()

  const ContentComponent = await loadLessonContent(params.slug)
  if (!ContentComponent) notFound()

  return (
    <LessonPage lesson={lesson}>
      <ContentComponent />
    </LessonPage>
  )
}
```

- [ ] **Step 3: Create glossary page**

Create `src/app/glossary/page.tsx`:

```tsx
'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

const glossaryTerms = [
  { term: 'Attention', definition: 'A mechanism that lets a model focus on specific parts of its input when producing output. Instead of treating all input tokens equally, attention assigns different weights to different parts based on relevance.' },
  { term: 'Backpropagation', definition: 'The algorithm used to train neural networks. It calculates how much each weight contributed to the error, then adjusts weights to reduce that error. Works backwards from the output layer to the input.' },
  { term: 'Batch Size', definition: 'The number of training examples processed together before updating model weights. Larger batches are more stable but use more memory. Smaller batches add noise that can help generalization.' },
  { term: 'BERT', definition: 'Bidirectional Encoder Representations from Transformers. A model that reads text in both directions simultaneously, giving it better understanding of context than left-to-right models.' },
  { term: 'BPE', definition: 'Byte Pair Encoding. A tokenization algorithm that iteratively merges the most frequent pairs of characters or subwords to build a vocabulary. Used by GPT models.' },
  { term: 'Chain-of-Thought', definition: 'A prompting technique where you ask the model to show its reasoning step by step. This often dramatically improves accuracy on complex problems.' },
  { term: 'CNN', definition: 'Convolutional Neural Network. A type of neural network designed for processing grid-like data such as images. Uses filters that slide across the input to detect patterns.' },
  { term: 'Decoder', definition: 'The part of a transformer that generates output tokens one at a time. It can only look at previous tokens (causal attention), which is why GPT models generate text left to right.' },
  { term: 'Embedding', definition: 'A dense vector representation of something (a word, image, etc.) in a continuous space where similar things are close together. The foundation of how neural networks understand meaning.' },
  { term: 'Encoder', definition: 'The part of a transformer that processes the full input at once, creating contextual representations. BERT is an encoder-only model.' },
  { term: 'Epoch', definition: 'One complete pass through the entire training dataset. Training typically runs for multiple epochs so the model sees each example several times.' },
  { term: 'Fine-tuning', definition: 'Taking a pre-trained model and training it further on a specific task or dataset. Much cheaper than training from scratch because the model already understands language.' },
  { term: 'GPT', definition: 'Generative Pre-trained Transformer. A family of decoder-only transformer models trained to predict the next token. The architecture behind ChatGPT.' },
  { term: 'Gradient Descent', definition: 'The optimization algorithm that trains neural networks. It calculates which direction to adjust weights to reduce error, then takes a small step in that direction. Repeated thousands of times.' },
  { term: 'Hallucination', definition: 'When an AI model generates confident-sounding text that is factually incorrect. A fundamental challenge with current LLMs since they predict plausible text, not necessarily true text.' },
  { term: 'KV-Cache', definition: 'Key-Value Cache. A memory optimization for transformer inference that stores previously computed attention keys and values so they don\'t need to be recalculated for each new token.' },
  { term: 'LLM', definition: 'Large Language Model. A neural network with billions of parameters trained on massive text datasets. Can generate, summarize, translate, and reason about text.' },
  { term: 'LoRA', definition: 'Low-Rank Adaptation. A parameter-efficient fine-tuning method that adds small trainable matrices to a frozen model, allowing fine-tuning with a fraction of the memory and compute.' },
  { term: 'Loss Function', definition: 'A mathematical function that measures how wrong a model\'s predictions are. Training tries to minimize this number. Cross-entropy loss is common for classification tasks.' },
  { term: 'MoE', definition: 'Mixture of Experts. An architecture where different "expert" sub-networks handle different inputs, and a router decides which experts to activate. Allows very large models to be efficient.' },
  { term: 'Perceptron', definition: 'The simplest neural network — a single node that takes weighted inputs, sums them, and passes the result through an activation function. The building block of deeper networks.' },
  { term: 'Pre-training', definition: 'The initial training phase where a model learns general language understanding from massive amounts of text. The model learns grammar, facts, and reasoning before being fine-tuned.' },
  { term: 'Quantization', definition: 'Reducing the precision of model weights (e.g., from 32-bit to 4-bit numbers) to make models smaller and faster. Trades a small amount of quality for big efficiency gains.' },
  { term: 'RAG', definition: 'Retrieval-Augmented Generation. A technique that gives an LLM access to external documents by retrieving relevant information before generating a response. Reduces hallucinations.' },
  { term: 'RLHF', definition: 'Reinforcement Learning from Human Feedback. A training method where humans rank model outputs, and those rankings train a reward model that then guides the AI to produce better responses.' },
  { term: 'RoPE', definition: 'Rotary Position Embedding. A method for encoding token positions in transformers using rotation matrices. Used in Llama and many modern models. Handles long sequences well.' },
  { term: 'Self-Attention', definition: 'A mechanism where each token in a sequence computes how much to "attend to" every other token. This is how transformers understand context and relationships between words.' },
  { term: 'Tokenization', definition: 'The process of breaking text into smaller units (tokens) that a model can process. Can split by words, subwords, or characters. GPT uses BPE tokenization.' },
  { term: 'Transformer', definition: 'The neural network architecture behind modern AI. Uses self-attention to process all input tokens in parallel, unlike earlier sequential models. Introduced in the 2017 "Attention is All You Need" paper.' },
  { term: 'Vector Database', definition: 'A database optimized for storing and searching embedding vectors. Used in RAG systems to quickly find documents similar to a query. Examples: Pinecone, Weaviate, Chroma.' },
]

export default function GlossaryPage() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return glossaryTerms
    const q = search.toLowerCase()
    return glossaryTerms.filter(t =>
      t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI/ML Glossary</h1>
      <p className="text-gray-500 mt-2 mb-8">Quick definitions for key terms you&apos;ll encounter in the lessons.</p>

      <div className="relative mb-8">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-6">
        {filtered.map(({ term, definition }) => (
          <div key={term} id={term.toLowerCase().replace(/\s+/g, '-')}>
            <h3 className="font-semibold text-gray-900">{term}</h3>
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{definition}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-400 text-center py-8">No terms match &ldquo;{search}&rdquo;</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/learn/ src/app/glossary/ src/lib/lessons.ts
git commit -m "feat: add dynamic lesson pages and searchable glossary"
```

---

### Task 9: Build Lesson 1 — What is AI & Machine Learning?

**Files:**
- Create: `content/lessons/what-is-ai/content.tsx`
- Create: `src/components/simulations/WhatIsAISim.tsx`

This is the template lesson. All future lessons follow this exact pattern.

- [ ] **Step 1: Create the WhatIsAI simulation component**

Create `src/components/simulations/WhatIsAISim.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const examples = [
  {
    input: 'Email: "Congratulations! You won $1,000,000!"',
    supervised: { label: 'Spam', confidence: 94 },
    unsupervised: { cluster: 'Group A: Promotional', similar: 3 },
  },
  {
    input: 'Email: "Meeting moved to 3pm tomorrow"',
    supervised: { label: 'Not Spam', confidence: 98 },
    unsupervised: { cluster: 'Group C: Work', similar: 12 },
  },
  {
    input: 'Email: "Your package has shipped! Track it here"',
    supervised: { label: 'Not Spam', confidence: 76 },
    unsupervised: { cluster: 'Group B: Notifications', similar: 8 },
  },
  {
    input: 'Email: "URGENT: Verify your account now!!!"',
    supervised: { label: 'Spam', confidence: 91 },
    unsupervised: { cluster: 'Group A: Promotional', similar: 5 },
  },
]

export default function WhatIsAISim() {
  const [selectedExample, setSelectedExample] = useState(0)
  const [mode, setMode] = useState<'supervised' | 'unsupervised'>('supervised')
  const example = examples[selectedExample]

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Try it: Supervised vs Unsupervised Learning</h3>
      <p className="text-sm text-gray-500 mb-6">
        Pick an email and see how each approach handles it differently.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('supervised')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'supervised' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Supervised
        </button>
        <button
          onClick={() => setMode('unsupervised')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'unsupervised' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Unsupervised
        </button>
      </div>

      <div className="space-y-2 mb-6">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelectedExample(i)}
            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
              i === selectedExample
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {ex.input}
          </button>
        ))}
      </div>

      <motion.div
        key={`${selectedExample}-${mode}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-lg p-5"
      >
        {mode === 'supervised' ? (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Supervised: The model was trained on labeled examples
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${
                example.supervised.label === 'Spam' ? 'text-red-600' : 'text-green-600'
              }`}>
                {example.supervised.label}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    example.supervised.label === 'Spam' ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${example.supervised.confidence}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm text-gray-500">{example.supervised.confidence}%</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Unsupervised: The model found patterns on its own
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-purple-600">{example.unsupervised.cluster}</span>
              <span className="text-sm text-gray-500">{example.unsupervised.similar} similar emails found</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: Create Lesson 1 content**

Create `src/content/lessons/what-is-ai/content.tsx`:

```tsx
'use client'

import LessonSection from '@/components/lessons/LessonSection'
import KeyTakeaways from '@/components/lessons/KeyTakeaways'
import GoDeeper from '@/components/lessons/GoDeeper'
import FlowDiagram from '@/components/diagrams/FlowDiagram'
import StepAnimation from '@/components/diagrams/StepAnimation'
import WhatIsAISim from '@/components/simulations/WhatIsAISim'
import QuizQuestion from '@/components/lessons/QuizQuestion'

export default function WhatIsAIContent() {
  return (
    <>
      {/* Hook */}
      <LessonSection id="hook">
        <p>
          You use AI every single day and probably don&apos;t think about it. When your phone
          autocorrects &ldquo;teh&rdquo; to &ldquo;the,&rdquo; that&apos;s AI. When Netflix suggests a show
          you end up binge-watching, that&apos;s AI. When Gmail catches a scam email before
          you even see it — yep, AI again.
        </p>
        <p>
          But what&apos;s actually happening under the hood? How does a machine &ldquo;learn&rdquo;
          anything? And why has this stuff suddenly gotten so good in the last few years?
        </p>
        <p>
          Let&apos;s break it down. No math. No code. Just the core ideas that everything
          else in this course builds on.
        </p>
      </LessonSection>

      {/* Concept */}
      <LessonSection id="concept" title="What's the difference between AI and ML?">
        <p>
          <strong>Artificial Intelligence</strong> is the broad idea of making machines do things
          that would normally require human intelligence — recognizing faces, understanding
          speech, making decisions. It&apos;s been around as a concept since the 1950s.
        </p>
        <p>
          <strong>Machine Learning</strong> is a specific way to achieve AI. Instead of writing
          explicit rules (&ldquo;if the email contains &apos;free money,&apos; mark as spam&rdquo;),
          you show the machine thousands of examples and let it figure out the patterns itself.
          It&apos;s the difference between giving someone a fish and teaching them to fish.
        </p>

        <FlowDiagram
          title="Traditional Programming vs Machine Learning"
          nodes={[
            { id: '1', label: 'Data + Rules', type: 'input' },
            { id: '2', label: 'Program', type: 'process' },
            { id: '3', label: 'Output', type: 'output' },
          ]}
        />
        <p className="text-center text-sm text-gray-500 -mt-4 mb-8">Traditional: you write the rules</p>

        <FlowDiagram
          title=""
          nodes={[
            { id: '1', label: 'Data + Output', type: 'input' },
            { id: '2', label: 'Learning', type: 'process' },
            { id: '3', label: 'Rules', type: 'output' },
          ]}
        />
        <p className="text-center text-sm text-gray-500 -mt-4 mb-8">Machine Learning: the machine discovers the rules</p>

        <p>
          That flip — from &ldquo;human writes rules&rdquo; to &ldquo;machine discovers rules&rdquo; — is
          the core insight of ML. And it turns out machines are really, really good at finding
          patterns in data. Often better than humans.
        </p>
      </LessonSection>

      {/* How It Works */}
      <LessonSection id="how-it-works" title="Three flavors of machine learning">
        <StepAnimation
          steps={[
            {
              title: 'Supervised Learning',
              content: (
                <div className="text-center">
                  <h4 className="text-white text-lg font-semibold mb-3">Supervised Learning</h4>
                  <p className="text-gray-300 text-sm max-w-md mx-auto mb-4">
                    You give the model labeled examples — &ldquo;this email is spam, this one isn&apos;t&rdquo; — and
                    it learns to predict labels for new, unseen data.
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="bg-green-900/30 border border-green-700 rounded-lg px-4 py-2">
                      <span className="text-green-400 font-mono text-sm">Input: email text</span>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg px-4 py-2">
                      <span className="text-blue-400 font-mono text-sm">Label: spam / not spam</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">Used in: spam filters, image recognition, medical diagnosis</p>
                </div>
              ),
            },
            {
              title: 'Unsupervised Learning',
              content: (
                <div className="text-center">
                  <h4 className="text-white text-lg font-semibold mb-3">Unsupervised Learning</h4>
                  <p className="text-gray-300 text-sm max-w-md mx-auto mb-4">
                    No labels. You give the model raw data and it finds hidden patterns, groups, or
                    structure on its own. &ldquo;Here are 10,000 customers — find the natural groups.&rdquo;
                  </p>
                  <div className="flex justify-center gap-6 mt-4">
                    {['A', 'B', 'C'].map(g => (
                      <div key={g} className="bg-purple-900/30 border border-purple-700 rounded-lg px-4 py-2">
                        <span className="text-purple-400 font-mono text-sm">Cluster {g}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-4">Used in: customer segmentation, anomaly detection, data exploration</p>
                </div>
              ),
            },
            {
              title: 'Reinforcement Learning',
              content: (
                <div className="text-center">
                  <h4 className="text-white text-lg font-semibold mb-3">Reinforcement Learning</h4>
                  <p className="text-gray-300 text-sm max-w-md mx-auto mb-4">
                    The model learns by trial and error, receiving rewards for good actions and penalties
                    for bad ones. Like training a dog — it figures out what gets treats.
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="bg-amber-900/30 border border-amber-700 rounded-lg px-4 py-2">
                      <span className="text-amber-400 font-mono text-sm">Action → Reward</span>
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="bg-amber-900/30 border border-amber-700 rounded-lg px-4 py-2">
                      <span className="text-amber-400 font-mono text-sm">Better actions</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-4">Used in: game AI, robotics, RLHF for ChatGPT</p>
                </div>
              ),
            },
          ]}
        />

        <p>
          Most of the AI you interact with daily uses <strong>supervised learning</strong>. Your
          spam filter was trained on millions of emails that humans labeled as spam or not-spam.
          Image recognition? Trained on millions of photos that humans labeled (&ldquo;this is a cat,
          this is a dog&rdquo;).
        </p>

        <GoDeeper title="What about deep learning?">
          <p>
            Deep learning is a subset of machine learning that uses neural networks with many
            layers (hence &ldquo;deep&rdquo;). It&apos;s what powers most of the impressive AI you see
            today — from ChatGPT to image generators to self-driving cars. We&apos;ll dive deep into
            neural networks in Lesson 7, but for now just know: deep learning is ML with bigger,
            more complex models.
          </p>
        </GoDeeper>
      </LessonSection>

      {/* Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <p className="mb-6">
          Here&apos;s a simple demo showing the difference between supervised and unsupervised
          learning. Pick an email and toggle between the two approaches to see how they
          handle the same input differently.
        </p>
        <WhatIsAISim />
      </LessonSection>

      {/* Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'AI is the goal (smart machines), ML is the method (learning from data)',
            'Supervised learning uses labeled examples — most common in practice',
            'Unsupervised learning finds hidden patterns without labels',
            'Reinforcement learning optimizes through trial and error',
            'Deep learning (neural networks) is the subset of ML behind modern AI breakthroughs',
          ]}
          misconceptions={[
            '"AI" and "ML" are not the same thing — ML is one way to achieve AI',
            'Machines don\'t "understand" like humans — they find statistical patterns in data',
            'More data is often more important than a fancier algorithm',
          ]}
        />
      </LessonSection>

      {/* Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Your email app learns to sort incoming messages into Primary, Social, and Promotions tabs by analyzing patterns in your email data. No one told it which emails go where. What type of learning is this?"
          options={[
            'Supervised learning — it was trained on labeled emails',
            'Unsupervised learning — it found natural groupings on its own',
            'Reinforcement learning — it gets rewards for correct sorting',
          ]}
          correctIndex={1}
          explanation="This is unsupervised learning (clustering). The model groups emails into natural clusters based on patterns it discovers, without being given explicit labels for each category."
        />
      </LessonSection>
    </>
  )
}
```

- [ ] **Step 3: Build and verify lesson renders**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds, `/learn/what-is-ai` is generated.

- [ ] **Step 4: Commit**

```bash
git add src/content/lessons/what-is-ai/ src/components/simulations/WhatIsAISim.tsx
git commit -m "feat: add Lesson 1 — What is AI & Machine Learning"
```

---

### Task 10: Build Lesson 4 — Tokenization (rewrite from existing)

**Files:**
- Create: `content/lessons/tokenization/content.tsx`
- Create: `src/components/simulations/TokenizationSim.tsx`

- [ ] **Step 1: Create TokenizationSim**

Refactor the existing tokenization simulation into a leaner inline component. Create `src/components/simulations/TokenizationSim.tsx`:

```tsx
'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SimulationEngine } from '@/utils/simulation-helpers'

const METHODS = ['word', 'subword', 'character', 'bpe'] as const
type Method = typeof METHODS[number]

const METHOD_LABELS: Record<Method, string> = {
  word: 'Word',
  subword: 'Subword (BPE-like)',
  character: 'Character',
  bpe: 'Byte Pair Encoding',
}

const TOKEN_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-red-100 text-red-800',
]

export default function TokenizationSim() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.")
  const [method, setMethod] = useState<Method>('word')

  const result = useMemo(() => SimulationEngine.tokenizeText(text, method), [text, method])

  const comparison = useMemo(() =>
    METHODS.map(m => ({
      method: m,
      count: SimulationEngine.tokenizeText(text, m).tokens.length,
    })),
    [text]
  )

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Input text</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Type or paste any text..."
        />

        <div className="flex flex-wrap gap-2 mt-4">
          {METHODS.map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                method === m ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {METHOD_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Tokens */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Result: {result.tokens.length} tokens</h4>
          <span className="text-sm text-gray-500">
            {(text.length / Math.max(result.tokens.length, 1)).toFixed(1)} chars/token
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.tokens.map((token, i) => (
            <motion.span
              key={`${token.id}-${method}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`px-2.5 py-1 rounded font-mono text-sm ${TOKEN_COLORS[i % TOKEN_COLORS.length]}`}
            >
              {token.text === ' ' ? '␣' : token.text}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Token count comparison</h4>
        <div className="space-y-2">
          {comparison.map(({ method: m, count }) => {
            const maxCount = Math.max(...comparison.map(c => c.count))
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">{METHOD_LABELS[m]}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full ${m === method ? 'bg-blue-500' : 'bg-gray-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxCount) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className={`text-sm font-mono w-8 text-right ${m === method ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Lesson 4 content**

Create `src/content/lessons/tokenization/content.tsx`. Follow the same pattern as Lesson 1 — hook, concept (with FlowDiagram/StepAnimation), how-it-works (with GoDeeper), inline simulation (TokenizationSim), KeyTakeaways, QuizQuestion. The hook should use the LEGO bricks analogy. The StepAnimation should walk through how BPE works in 4 steps. The content should explain why tokenization matters for LLMs (context windows, vocabulary size).

Full content component following the Lesson 1 pattern — same structure, different topic. Import and use `TokenizationSim`, `StepAnimation`, `FlowDiagram`, `KeyTakeaways`, `GoDeeper`, `QuizQuestion`, and `LessonSection`.

- [ ] **Step 3: Commit**

```bash
git add src/content/lessons/tokenization/ src/components/simulations/TokenizationSim.tsx
git commit -m "feat: add Lesson 4 — Tokenization with inline simulation"
```

---

### Task 11: Build Lesson 7 — Neural Networks & Backpropagation

**Files:**
- Create: `content/lessons/neural-networks/content.tsx`
- Create: `src/components/simulations/NeuralNetSim.tsx`

- [ ] **Step 1: Create NeuralNetSim**

Create `src/components/simulations/NeuralNetSim.tsx`. Build an interactive neural network simulation where the user:
- Adjusts 2-3 input sliders (values 0-1)
- Sees a 3-layer network (2 inputs → 3 hidden → 1 output) animate the forward pass
- Each node shows its activation value, connections show weight values
- The output updates in real time as inputs change
- A "Train" button runs a simple animation showing weights adjusting

Use the `NetworkDiagram` component as a base, but make it interactive with sliders. Use Framer Motion for animations. Keep it educational — show the actual numbers flowing through the network.

- [ ] **Step 2: Create Lesson 7 content**

Create `src/content/lessons/neural-networks/content.tsx`. Follow the Lesson 1 pattern:
- Hook: Use the "brain cells" analogy — neurons connected by synapses, just like brain cells passing signals
- Concept: What is a neuron? Weighted sum + activation function. Build from single perceptron to multi-layer network. Use `StepAnimation` to walk through forward propagation in 5 steps.
- How It Works: Backpropagation explained simply. Use `NetworkDiagram` to show the network. `GoDeeper` for the calculus behind gradients.
- Simulation: Embed `NeuralNetSim` with intro text.
- KeyTakeaways and QuizQuestion.

- [ ] **Step 3: Commit**

```bash
git add src/content/lessons/neural-networks/ src/components/simulations/NeuralNetSim.tsx
git commit -m "feat: add Lesson 7 — Neural Networks with interactive simulation"
```

---

### Task 12: Delete old simulation pages and clean up

**Files:**
- Delete: `src/app/simulations/` (entire directory)
- Delete: `src/components/SimulationLayout.tsx`
- Modify: Keep `src/utils/simulation-helpers.ts` (still used by TokenizationSim)
- Modify: Keep `src/types/simulation.ts` (still used)

- [ ] **Step 1: Delete old simulation pages**

```bash
rm -rf src/app/simulations/
rm -f src/components/SimulationLayout.tsx
```

- [ ] **Step 2: Verify build still works**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. If any imports break, fix them.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old simulation pages, replaced by inline lesson simulations"
```

---

### Task 13: Add .superpowers to .gitignore and final verification

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers to gitignore**

Append to `.gitignore`:

```
# Superpowers brainstorming sessions
.superpowers/
```

- [ ] **Step 2: Run full build and verify all pages**

```bash
npm run build 2>&1 | tail -30
```

Expected output should list these routes:
- `/` (homepage)
- `/learn` (learning path)
- `/learn/what-is-ai` (lesson 1)
- `/learn/tokenization` (lesson 4)
- `/learn/neural-networks` (lesson 7)
- `/glossary`

- [ ] **Step 3: Start dev server and manually verify**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Homepage loads with clean design, stats bar, learning path preview
- `/learn` shows topic grid with all 30 lessons, 3 marked as ready
- `/learn/what-is-ai` shows full lesson with all 7 sections, inline simulation works
- `/learn/tokenization` shows lesson with tokenization simulation
- `/learn/neural-networks` shows lesson with neural network simulation
- `/glossary` shows searchable glossary
- Navigation between lessons works (Next Lesson buttons)

- [ ] **Step 4: Commit .gitignore change**

```bash
git add .gitignore
git commit -m "chore: add .superpowers to gitignore"
```

---

## Remaining Work (Future Plans)

This plan covers the infrastructure and 3 template lessons. The remaining 27 lessons follow the exact same pattern established in Tasks 9-11:

1. Create a simulation component in `src/components/simulations/`
2. Create lesson content in `src/content/lessons/[slug]/content.tsx`
3. Register the lesson in `src/lib/lessons.ts` (add import)
4. Update lesson status from `'coming-soon'` to `'ready'` in `src/data/curriculum.ts`

Each lesson takes 1-2 tasks and follows the 7-section structure. Lessons can be built independently and in any order.
