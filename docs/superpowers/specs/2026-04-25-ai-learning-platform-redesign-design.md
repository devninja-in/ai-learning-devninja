# AI Learning Platform Redesign — Design Spec

## Overview

Full redesign of the DevNinja AI Learning Platform from a simulation-gallery site into a comprehensive, end-to-end AI/ML learning portal. The site teaches AI/ML from absolute beginner to production-level, with 30 interactive lessons across 5 difficulty levels.

The redesign touches everything: site structure, content, visual design, simulations, and diagrams.

## Design Principles

- **Lesson-First Architecture** — every topic is a single, self-contained lesson page with embedded simulations and diagrams. No separate simulation pages.
- **Progressive complexity** — starts for complete beginners (no code, no math assumed), progressively gets more technical.
- **Clean and minimal design** — Stripe-docs aesthetic. Whitespace, elegant typography, dark/light backgrounds for diagrams. Let content breathe.
- **Human-written tone** — content reads like a person explaining things to a friend. No robotic AI-generated phrasing. Conversational, varied sentence lengths, occasional colloquialisms.
- **Learn by doing** — every lesson has an interactive simulation embedded inline, not on a separate page.

## Site Structure

### Routes

```
/                           → Homepage
/learn                      → Learning path (topic grid)
/learn/[slug]               → Individual lesson page
/glossary                   → Searchable AI glossary
```

### Navigation

Minimal nav bar: `Logo | Learning Path | Glossary | DevNinja.in`

No separate `/simulations` section. Simulations live inside lessons.

### Homepage

- Minimal hero: "Learn AI & Machine Learning from scratch."
- Subtitle: "30 interactive lessons with animated diagrams and hands-on simulations. No prerequisites."
- Stats bar: 30 Lessons, 5 Levels, 30+ Simulations, 100% Free
- Horizontal 5-level learning path preview (numbered circles connected by lines)
- 3 featured lesson cards (one from beginner, one from intermediate, one from advanced)
- Clean footer linking to DevNinja.in ecosystem
- No flashy gradients. Light gray/white backgrounds. Content is the attraction.

### Learning Path Page (`/learn`)

- Title: "Learning Path" with subtitle
- Topics displayed in a scannable grid, grouped by level
- Each level has a colored header (green, amber, blue, purple, red)
- Each topic card shows: lesson number, title, estimated time, prerequisites
- Numbered for recommended order but learners can jump freely
- No sign-up or progress tracking for v1

## Lesson Page Structure

Every lesson follows the same 7-section structure:

### 1. Header
- Topic title + difficulty badge + estimated reading time
- Breadcrumb: `Learning Path > [Level Name] > [Topic]`
- Prerequisites chip (links to prior lessons, or "None")

### 2. The Hook (Real-World Analogy)
- Opens with a relatable, non-technical analogy
- 2-3 paragraphs max
- Sets the mental model before any technical content
- Example for tokenization: "Imagine sorting LEGO bricks before building..."

### 3. The Concept (Simple Explanation)
- Plain-language explanation building on the analogy
- Key terms highlighted inline (linking to glossary)
- Animated diagrams appear here — scroll-triggered, building up step by step
- No jargon without explanation

### 4. How It Works (Technical Deep-Dive)
- More detailed explanation for learners who want depth
- Animated flow diagrams showing processes step by step
- Code snippets where relevant (Python examples)
- Collapsible "Go Deeper" sections for advanced details

### 5. Interactive Simulation (Embedded)
- Full simulation component embedded right in the lesson
- Introduced with a prompt: "Now try it yourself"
- Restructured from existing simulation code to fit inline
- No navigation away — it's in the flow

### 6. Key Takeaways
- 3-5 bullet points summarizing what the learner now understands
- Common misconceptions addressed

### 7. Next Steps
- "Continue to: [next lesson]" button
- Related topics links
- Optional: 2-3 quick quiz questions to test understanding

## Curriculum — 30 Lessons Across 5 Levels

### Level 1: Foundations (No prerequisites)

For someone who has never touched AI/ML. Real-world analogies, zero math assumed.

1. **What is AI & Machine Learning?** — The big picture, types of AI, how machines "learn" from data, supervised vs unsupervised vs reinforcement learning. Real-world examples everywhere.
2. **Math Intuition for AI** — Vectors, matrices, dot products, gradients — explained visually. No proofs, just intuition. Interactive simulations for each concept.
3. **How Computers Understand Text** — NLP basics, why computers can't read like humans, text preprocessing, bag-of-words, TF-IDF.
4. **Tokenization** — Breaking text into pieces — word, subword, BPE, WordPiece, SentencePiece. Why modern LLMs use subword tokenization. (Rewrite of existing)
5. **Word Embeddings & Vector Spaces** — Turning words into numbers — Word2Vec, GloVe, semantic similarity. "King - Man + Woman = Queen." (Rewrite of existing)
6. **Classical Machine Learning** — Regression, classification, decision trees, random forests, SVM, k-means clustering. Visual simulations showing how each algorithm "thinks."

### Level 2: Deep Learning Core

Understanding neural networks and the building blocks of modern AI.

7. **Neural Networks & Backpropagation** — Perceptrons, layers, activation functions, forward pass, backpropagation, gradient descent. Animated step-by-step of how a network learns.
8. **Training Deep Networks** — Loss functions, optimizers (SGD, Adam), learning rate scheduling, regularization (dropout, batch norm), overfitting/underfitting. Interactive loss landscape explorer.
9. **CNNs — How AI Sees Images** — Convolution, filters, pooling, feature maps. See what each layer "sees." Classic architectures (ResNet, VGG). Transfer learning for vision.
10. **RNNs & LSTMs — Sequence Memory** — Why order matters, vanishing gradients, LSTM gates, GRU. The precursor to transformers. Animated sequence processing.
11. **Attention Mechanism** — Self-attention, multi-head attention, why attention replaced RNNs. "How models learn to focus." (Rewrite of existing)
12. **Transformer Architecture** — Encoder, decoder, positional encoding, residual connections, layer norm. Full animated walkthrough. (Rewrite of existing)

### Level 3: LLMs & Modern AI

How today's AI systems are built, trained, and used.

13. **Large Language Models** — GPT, BERT, T5, Llama, Claude — what makes them "large," scaling laws, emergent abilities. (Expansion of existing)
14. **Pre-training & Fine-tuning** — How LLMs learn from the internet, supervised fine-tuning (SFT), transfer learning. (Expansion of existing)
15. **RLHF & Alignment** — Teaching AI human preferences, reward models, DPO, Constitutional AI. (Rewrite of existing)
16. **Prompt Engineering** — Zero-shot, few-shot, chain-of-thought, system prompts, structured outputs. Interactive prompt playground.
17. **PEFT — LoRA, QLoRA & Adapters** — Parameter-efficient fine-tuning, training 0.1% of parameters, low-rank adaptation, when to use what. Visual comparisons.
18. **Multimodal AI** — Vision-language models (CLIP, LLaVA, GPT-4V), diffusion models (Stable Diffusion), text-to-image, cross-modal understanding.

### Level 4: Production & Infrastructure

Making AI systems fast, small, and reliable in the real world.

19. **Model Internals** — RoPE, MoE, GQA, activation functions, normalization variants. Inside Llama, Mistral, Gemma architectures. (Rewrite of existing)
20. **Quantization & Compression** — INT8/INT4, GPTQ, AWQ, GGUF, pruning, knowledge distillation. Quality vs size trade-offs. (Rewrite of existing)
21. **Inference & Serving** — vLLM, TensorRT-LLM, KV-cache, paged attention, Flash Attention, batching strategies. (Rewrite of existing)
22. **Evaluation & Benchmarks** — MMLU, HellaSwag, HumanEval, BLEU, ROUGE, BERTScore. How to measure if your AI actually works. Interactive benchmark comparison.
23. **MLOps & Deployment** — ML pipelines, experiment tracking, model registry, monitoring, drift detection, CI/CD for models. From notebook to production.

### Level 5: Agents & Cutting Edge

The frontier of AI — autonomous agents, reasoning, and safety.

24. **RAG & Vector Search** — Retrieval-augmented generation, vector databases, chunking strategies, hybrid search, re-ranking. (Expansion of existing)
25. **Agents & Reasoning** — ReAct, chain-of-thought, tree-of-thought, planning, tool use, function calling. (Rewrite of existing)
26. **Agent Frameworks** — LangChain, LlamaIndex, CrewAI, AutoGen, Claude Agent SDK. Multi-agent systems, production patterns. (Rewrite of existing)
27. **Reasoning Models & Extended Thinking** — o1/o3-style reasoning, test-time compute scaling, self-verification, Claude extended thinking.
28. **AI Safety & Ethics** — Hallucinations, bias, jailbreaking, prompt injection, red-teaming, interpretability, responsible AI.
29. **State Space Models & New Architectures** — Mamba, S4, RWKV, linear attention, hybrid architectures. What comes after transformers?
30. **Building Production AI Systems** — End-to-end capstone case study. Building a complete AI application from data to deployment with guardrails, monitoring, and cost optimization.

## Diagrams & Animations System

### Animated Diagrams (scroll-triggered)
- Built with Framer Motion + SVG/React components
- Triggered as the user scrolls through the concept section
- Each animation has 3-5 steps that build on each other
- Small step indicator shows progress (Step 1/5, 2/5...)
- User can click forward/backward through steps manually
- Example: Transformer lesson — query/key/value matrices appear, attention weights compute, output forms

### Interactive Diagrams (user-driven)
- Built with D3.js + React for complex visualizations
- User manipulates inputs and sees results change in real time
- Example: Neural network — adjust input values with sliders, watch forward propagation animate through each node
- Lives in the "How It Works" and "Simulation" sections

### Shared Design Language
- Consistent color coding: blue = inputs, green = operations, purple = outputs, amber = attention/weights
- Clean, minimal style matching Stripe-like aesthetic
- Dark backgrounds for diagrams (subtle contrast against white page)
- Monospace labels for technical values, sans-serif for descriptions

## Technical Architecture

### Lesson Content Storage

Each lesson lives in `/content/lessons/[slug]/` as a directory:
```
content/lessons/tokenization/
  lesson.mdx          # Written content (hook, concept, deep-dive, takeaways)
                       # Imports simulation component directly in MDX
```

MDX lets us mix markdown prose with React components inline — animated diagrams and simulations appear between paragraphs naturally.

### Component Architecture

```
src/components/
  lessons/             # Shared lesson components
    LessonPage.tsx     # Main lesson layout wrapper
    LessonHeader.tsx   # Title, breadcrumb, difficulty, time
    SectionNav.tsx     # In-page section navigation
    NextLesson.tsx     # "Continue to next lesson" CTA
    KeyTakeaways.tsx   # Takeaways section
    GoDeeper.tsx       # Collapsible advanced content
  diagrams/            # Reusable animated diagram components
    FlowDiagram.tsx    # Generic animated flow
    NetworkDiagram.tsx # Neural network visualizer
    StepAnimation.tsx  # Step-by-step animation wrapper
    MatrixView.tsx     # Matrix/vector visualizer
  simulations/         # One per topic
    TokenizationSim.tsx
    EmbeddingsSim.tsx
    AttentionSim.tsx
    NeuralNetSim.tsx
    TransformerSim.tsx
    ...etc
  ui/                  # UI primitives (keep and extend existing)
    Button.tsx
    Card.tsx
    Badge.tsx
    ...
  layout/              # Site layout (keep and update existing)
    Header.tsx
    Footer.tsx
```

### Tech Stack

No changes to core dependencies. The existing stack covers everything:
- **Framework**: Next.js 14+ with App Router
- **Frontend**: React 18+ with TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion (scroll-triggered and step-by-step)
- **Visualizations**: D3.js (interactive data-driven diagrams)
- **Content**: MDX for lessons with embedded React components
- **Deployment**: Cloudflare

No new dependencies needed for core functionality.

### What Gets Deleted

- `src/app/simulations/` — entire directory (simulation code moves into components)
- `src/pages.old/` — legacy pages router code
- `content/learning-pathways/` — replaced by new learning path page
- `content/assessment/` — not needed for v1
- Cleanup docs: CLOUDFLARE_DEPLOYMENT.md, DESIGN_SYSTEM_ANALYSIS.md, etc.

### What Stays

- `content/glossary.md` — kept, expanded, rendered at `/glossary`
- All existing dependencies in `package.json`
- Tailwind config, PostCSS config, Next.js config (minor updates)
- Deployment pipeline to Cloudflare

## Content Guidelines

- All content must read as human-written. Natural language, conversational tone.
- Vary sentence length. Short sentences mixed with longer ones.
- Use "you" and "we" naturally. Write like explaining to a friend.
- Every concept gets a real-world analogy first, technical details second.
- Key terms link to the glossary on first use.
- Code examples use Python with real libraries (tiktoken, transformers, torch).
- No filler. Every paragraph earns its place.

## Scope

- **30 lessons** total (16 brand new, 14 rewritten from existing)
- **30+ simulations** (one per lesson minimum, some lessons have multiple)
- **Homepage** redesign
- **Learning path** page (new)
- **Glossary** page (updated)
- **Full visual redesign** — clean, minimal, Stripe-docs aesthetic
- **No sign-up or progress tracking** for v1
- **No dark mode** for v1 (can add later)
- **Mobile-first responsive** — all pages, simulations, and diagrams work on mobile and tablet
- **Lesson URL slugs** use kebab-case matching the topic name (e.g., `/learn/neural-networks`, `/learn/attention-mechanism`, `/learn/rlhf-alignment`)
