# AI Learning Platform

A modern, interactive educational website for teaching AI concepts from NLP foundations to advanced language models, featuring comprehensive educational content and interactive simulations.

## Project Goals

- **Complete AI Education**: Full learning path from NLP basics to production AI systems
- **Interactive Experience**: Simulations, visualizations, and hands-on exercises
- **Mobile-First**: Responsive design for learning on any device
- **Performance**: Optimized for content-heavy educational material
- **Accessibility**: Inclusive design for all learners
- **Guided Learning**: Clear progression with concept explanations and practical applications
- **Production Ready**: Bridge the gap from understanding to building real AI systems

## Educational Features

### 📚 Comprehensive Content Library
- **Concept Explanations**: Clear, visual explanations for complex AI topics
- **Interactive Simulations**: Hands-on exploration of AI concepts with real-time visualization
- **Progressive Learning Path**: Structured progression from beginner to advanced topics
- **Real-World Applications**: Connect concepts to practical AI tools and systems

### 🎯 Learning Resources

#### 🌟 **NEW: Structured Learning Pathways**
- **[📚 Foundation Pathway](content/learning-pathways/pathway-foundations.md)**: Comprehensive 6-8 week journey from AI basics to modern architectures with integrated simulation practice
- **[🚀 Production Pathway](content/learning-pathways/pathway-production.md)**: Advanced 15-20 week track for building and deploying real AI systems
- **[🌉 Concept Bridges](content/learning-pathways/concept-bridges.md)**: Understanding how AI concepts flow and connect together
- **[💻 Implementation Tutorials](content/learning-pathways/implementation-tutorials.md)**: Step-by-step coding guides from concept to production
- **[🗺️ Pathway Guide](content/learning-pathways/README.md)**: Choose your optimal learning journey based on goals and experience

#### 📖 Core Resources
- **[Getting Started Tutorial](content/tutorials/getting-started.md)**: Your first 30 minutes with the platform
- **[Complete Learning Guide](content/learning-guide.md)**: 11-phase progression reference
- **[AI Glossary](content/glossary.md)**: Comprehensive reference for AI terminology
- **[Concept Library](content/concepts/)**: Deep-dive explanations for key topics

### 🔬 Interactive Simulations

#### Foundation Simulations (Phases 1-5)
- **Tokenization Playground**: Understand how text is processed by AI systems
- **Word Embeddings Visualizer**: Explore how AI represents word meaning mathematically
- **Attention Mechanism Explorer**: See how modern AI focuses on relevant information
- **Transformer Architecture Walkthrough**: Step through complete transformer processing
- **Language Model Playground**: Experience text generation and prediction
- **RLHF Training Simulator**: Learn how AI systems are aligned with human preferences

#### Advanced Simulations (Phases 6-11)
- **Model Internals Explorer**: Navigate the internals of modern architectures like Llama and Mistral
- **Quantization Laboratory**: Experience quality vs size trade-offs in model compression
- **Inference Engine Comparator**: Benchmark different serving solutions and optimization techniques
- **Agent Reasoning Simulator**: Build and test ReAct agents with multi-step planning
- **RAG System Builder**: Create knowledge-augmented AI systems with tool integration
- **Agent Frameworks Mastery**: Interactive comparison of LangChain, LlamaIndex, CrewAI, AutoGen, LangGraph, and Pydantic AI with hands-on code examples and decision trees

## Development Setup

The platform is built with Next.js and includes both educational content and interactive simulations.

### Tech Stack (Implemented)
- **Framework**: Next.js 14+ with App Router
- **Frontend**: React 18+ with TypeScript
- **Styling**: TailwindCSS for responsive design
- **Visualizations**: D3.js for interactive data visualization
- **Animations**: Framer Motion for smooth interactions
- **Content**: MDX for rich educational content
- **Deployment**: Vercel for ailearning.devninja.in

## Project Structure

```
/
├── src/                 # Source code
├── components/          # Reusable UI components
├── content/            # Educational content and lessons
├── simulations/        # Interactive simulations
├── styles/             # Global styles and themes
└── public/             # Static assets
```

## Development Status

- [x] Frontend development environment setup
- [x] Architecture and tech stack decisions (see [ADR-001](docs/adr/001-website-architecture-and-technical-stack.md))
- [x] Component library creation (SimulationLayout, interactive components)
- [x] Content structure design (comprehensive educational framework)
- [x] Interactive simulation framework (D3.js + React integration)
- [x] Educational content creation (concepts, tutorials, glossary)
- [x] Agent Frameworks simulation implementation (Phase 11)
- [ ] Deployment pipeline setup
- [ ] Remaining simulation implementations (Phases 7, 9)
- [ ] Advanced phase content development

## Complete Learning Journey: Understanding to Production

### Foundation Phases (1-5): Understanding AI

#### Phase 1: NLP Foundations (Beginner)
- [Word Embeddings](content/concepts/word-embeddings.md) - Mathematical representation of word meaning
- [NLP Foundations](content/concepts/nlp-foundations.md) - Core concepts of text processing
- Tokenization principles and practical applications
- Sequence understanding and the importance of word order

#### Phase 2: Transformer Architecture (Intermediate) 
- [Attention Mechanisms](content/concepts/attention-mechanism.md) - The revolutionary focus mechanism
- Self-attention and multi-head attention patterns
- Positional encoding and sequence awareness
- Transformer layer architecture walkthrough

#### Phase 3: Language Models & Pre-training (Intermediate)
- Pre-training vs fine-tuning workflows
- Different model architectures (BERT, GPT, T5)
- Transfer learning applications in NLP
- Model evaluation and performance metrics

#### Phase 4: Large Language Models & RLHF (Advanced)
- Scaling laws and emergent abilities
- Instruction tuning and human preference alignment
- Reinforcement Learning from Human Feedback (RLHF)
- Prompt engineering techniques and best practices

#### Phase 5: Advanced Attention (Advanced)
- Multi-scale attention mechanisms and hierarchical processing
- Sparse attention patterns for long sequences
- Cross-attention variants and specialized architectures
- Attention optimization techniques and efficiency improvements

### Advanced Phases (6-11): Building Production AI

#### Phase 6: Model Internals (Advanced)
- [Model Internals](content/concepts/model-internals.md) - Inside modern architectures like Llama and Mistral
- Rotary Position Embedding (RoPE) and advanced position encodings
- Mixture of Experts (MoE) and sparse model architectures
- Layer normalization variants and architectural innovations

#### Phase 7: Quantization (Advanced)
- Post-training quantization techniques (GPTQ, AWQ)
- Quantization-aware training approaches
- Model compression formats (GGUF, GGML)
- Hardware-specific optimizations (bitsandbytes, INT8/INT4)

#### Phase 8: Inference & Serving (Advanced)
- High-performance inference engines (vLLM, TensorRT-LLM)
- Batching strategies and throughput optimization
- Memory management and KV-cache optimization
- Distributed serving and load balancing

#### Phase 9: Agents & Reasoning (Advanced)
- ReAct (Reasoning and Acting) frameworks
- Chain-of-Thought and advanced prompting techniques
- Multi-step planning and execution strategies
- Agent coordination and collaboration patterns

#### Phase 10: Tools & MCP (Advanced)
- Retrieval-Augmented Generation (RAG) systems
- Function calling and tool integration
- Model Context Protocol (MCP) for standardized tool access
- Building custom tools and integrations

#### Phase 11: Agent Frameworks (Advanced)
- [Agent Frameworks](content/concepts/agent-frameworks.md) - LangChain, LlamaIndex, CrewAI ecosystem
- Multi-agent coordination and collaboration
- Production patterns and best practices
- Custom framework development and enterprise deployment

## Learning Resources

- **[📖 Getting Started Guide](content/tutorials/getting-started.md)**: Your first 30 minutes with the platform
- **[🗺️ Complete Learning Roadmap](content/learning-guide.md)**: 11-phase progression guide from basics to production
- **[📚 AI Glossary](content/glossary.md)**: 350+ AI terms explained clearly with advanced terminology
- **[🗂️ Concept Map](content/concept-map.md)**: Visual connections between all AI concepts
- **[💡 Concept Library](content/concepts/)**: Deep-dive explanations with real-world applications
- **[♿ Accessibility Guide](content/accessibility-guide.md)**: Inclusive learning for all abilities

## Quick Start for Learners

### 🏗️ New to AI? (Foundation Track)
1. **Start Here**: Choose the [Foundation Learning Pathway](content/learning-pathways/pathway-foundations.md) 
2. **First Steps**: Complete the [Getting Started Tutorial](content/tutorials/getting-started.md)
3. **Phase 1**: Master embeddings with [Word Embeddings Simulation](src/app/simulations/embeddings) + Key Concepts
4. **Phase 2**: Understand attention with [Transformer Simulation](src/app/simulations/transformer) + theory
5. **Phase 3**: Explore modern architectures with [Model Internals Simulation](src/app/simulations/model-internals)

### 🚀 Want to Build AI? (Production Track)  
1. **Prerequisites**: Complete Foundation Pathway Phases 1-3
2. **Production Path**: Follow the [Production Learning Pathway](content/learning-pathways/pathway-production.md)
3. **Hands-On**: Use [Implementation Tutorials](content/learning-pathways/implementation-tutorials.md) alongside theory
4. **Deploy**: Build real systems from quantization to agent frameworks

### 🛠️ Learn by Building? (Implementation Focus)
1. **Start Coding**: Jump into [Implementation Tutorials](content/learning-pathways/implementation-tutorials.md)
2. **Build Understanding**: Use [Concept Bridges](content/learning-pathways/concept-bridges.md) to connect theory
3. **Simulate**: Validate understanding with interactive simulations
4. **Scale Up**: Progress to production-ready implementations

### 🧭 Choose Your Journey
Visit the **[Pathway Selection Guide](content/learning-pathways/README.md)** to find your optimal learning approach based on experience, goals, and learning style.

## Contributing

This is part of the DevNinja.in educational platform. Wait for architecture decisions before contributing.