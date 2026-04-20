# ADR-001: Website Architecture and Technical Stack

## Status
Proposed

## Date
2026-04-20

## Context

We need to build a comprehensive AI learning website at ailearning.devninja.in that will serve as an educational platform covering 11 phases and 80+ topics in AI. The website must:

- Deliver static content efficiently for educational material
- Support interactive diagrams, simulations, and real-world examples
- Provide mobile-responsive design optimized for learning
- Ensure high performance for optimal learning experience
- Be SEO-friendly for educational content discovery
- Handle complex AI concepts with clear visualizations
- Support hands-on simulations and interactive elements
- Be scalable, maintainable, and cost-effective

## Decision

We will adopt a **modern static site architecture** with **component-based interactivity** using the following technical stack:

### Static Site Generator: **Next.js with Static Generation**
- Next.js 14+ with App Router for modern React patterns
- Static Site Generation (SSG) for core content pages
- Incremental Static Regeneration (ISR) for content updates
- Built-in optimization for images, fonts, and assets

### Frontend Framework: **React + TypeScript**
- React 18+ for component-based UI development
- TypeScript for type safety and better developer experience
- Tailwind CSS for utility-first styling and responsive design

### Interactive Components: **Specialized Libraries**
- **D3.js + Observable Plot** for data visualizations and interactive diagrams
- **React Three Fiber** for 3D visualizations and simulations
- **Framer Motion** for animations and micro-interactions
- **Monaco Editor** for code examples and interactive coding
- **Mermaid.js** for technical diagrams and flowcharts

### Content Management: **MDX + Git-based CMS**
- **MDX** for markdown with embedded React components
- **Gray-matter** for frontmatter parsing
- **Git-based workflow** for content versioning and collaboration
- **Structured content schemas** for curriculum organization

### Performance & SEO: **Built-in Optimizations**
- Next.js Image Optimization for responsive images
- Automatic code splitting and lazy loading
- Service Worker for offline capability
- Schema.org structured data for educational content
- OpenGraph and Twitter Card meta tags

### Deployment & Hosting: **Vercel + CDN**
- **Vercel** for hosting with automatic deployments
- **Vercel Edge Network** for global CDN
- **GitHub Actions** for CI/CD pipeline
- **Branch previews** for content review workflow

## Design

### Component Architecture

#### 1. Core Layout Components
```typescript
// Layout components for consistent structure
- Header (navigation, search, progress tracking)
- Footer (links, social, newsletter)
- Sidebar (phase navigation, topic outline)
- MainContent (responsive content area)
```

#### 2. Educational Components
```typescript
// Specialized learning components
- ConceptCard (topic introduction with visual)
- InteractiveDiagram (D3.js-powered visualizations)
- CodePlayground (Monaco Editor with execution)
- SimulationFrame (React Three Fiber 3D simulations)
- ProgressTracker (user progress visualization)
- QuizComponent (interactive assessments)
```

#### 3. Content Organization
```typescript
// Content structure for 11 phases
interface Phase {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  prerequisites: string[];
  estimatedHours: number;
}

interface Topic {
  id: string;
  title: string;
  type: 'concept' | 'tutorial' | 'simulation' | 'assessment';
  content: MDXContent;
  interactives: Interactive[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

### Data Flow Architecture

```
Content Creation → MDX Files → Build Process → Static Pages
                                     ↓
User Request → CDN → Cached Static Content + Client Hydration
                                     ↓
Interactive Elements → Client-side React Components → Real-time Updates
```

### Performance Strategy

1. **Static Generation**: All curriculum content pre-rendered at build time
2. **Progressive Enhancement**: Core content loads immediately, interactives enhance progressively
3. **Code Splitting**: Interactive components loaded on-demand
4. **Asset Optimization**: Images, fonts, and media automatically optimized
5. **Caching Strategy**: Aggressive caching with smart invalidation

### Interactive Learning Framework

#### Simulation Architecture
```typescript
// 3D simulations for complex AI concepts
- NeuralNetworkVisualizer (React Three Fiber)
- AttentionMechanism3D (transformer attention visualization)
- ModelTrainingSimulator (loss function visualization)
- DataFlowDiagrams (pipeline visualizations)
```

#### Assessment System
```typescript
// Progressive assessment integration
- KnowledgeCheck (embedded quizzes)
- CodeChallenge (interactive coding exercises)
- ConceptMapping (drag-and-drop concept builders)
- ProgressAnalytics (learning path optimization)
```

### Content Strategy Integration

#### Phase Structure
1. **Structured Learning Paths**: Clear progression through 11 phases
2. **Modular Topics**: 80+ independent but interconnected topics
3. **Difficulty Progression**: Beginner → Intermediate → Advanced pathways
4. **Multi-modal Learning**: Text, visuals, code, simulations, assessments

#### SEO & Discovery
1. **Educational Schema**: Structured data for search engines
2. **Topic Clustering**: Related content linking and recommendations
3. **Progressive Disclosure**: Layered information architecture
4. **Mobile-first Design**: Touch-friendly interactions and responsive layouts

## Consequences

### Positive
- **High Performance**: Static generation provides excellent loading speeds
- **Developer Experience**: Modern tooling with TypeScript and Next.js
- **Scalability**: Can handle growing content and user base efficiently
- **Educational Focus**: Architecture designed specifically for learning experiences
- **Maintenance**: Clear separation of concerns and modern best practices
- **Cost Effective**: Minimal server requirements due to static nature

### Negative
- **Build Complexity**: Interactive components require careful integration
- **Content Workflow**: Writers need to learn MDX for advanced components
- **Bundle Size**: Rich interactives may increase JavaScript payload

### Risks
- **Performance with Interactives**: Risk of heavy JavaScript bundles
  - *Mitigation*: Lazy loading, code splitting, performance budgets
- **Content Management Complexity**: Non-technical contributors may struggle with MDX
  - *Mitigation*: Visual content editing tools and clear documentation
- **Browser Compatibility**: Advanced features may not work on older browsers
  - *Mitigation*: Progressive enhancement and polyfills where needed

## Implementation Priorities

### Phase 1: Foundation (Weeks 1-2)
1. Next.js project setup with TypeScript
2. Basic layout components and styling system
3. MDX integration and content structure
4. Deployment pipeline to Vercel

### Phase 2: Core Features (Weeks 3-4)
1. Interactive diagram components (D3.js integration)
2. Code playground implementation
3. Basic simulation framework
4. SEO optimization and meta tags

### Phase 3: Advanced Interactives (Weeks 5-6)
1. 3D visualization components
2. Assessment system integration
3. Progress tracking functionality
4. Performance optimization and monitoring

### Phase 4: Content Integration (Weeks 7-8)
1. Phase 1-2 content migration and testing
2. Interactive component testing and refinement
3. Mobile optimization and responsive testing
4. Analytics integration and performance monitoring