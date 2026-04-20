# ADR-002: Dependency Updates for Complete Architecture Implementation

## Status
Proposed

## Date
2026-04-20

## Context

Following validation of the existing package.json against ADR-001, the project is 95% aligned with the specified architecture. However, three critical dependencies are missing for full implementation of the educational component framework:

1. **Monaco Editor** - Required for CodePlayground component (interactive code examples)
2. **MDX Processing** - Required for content management system with embedded React components
3. **React Three Fiber** - Required wrapper for Three.js integration in 3D simulations

## Decision

Add the following dependencies to complete the architecture implementation:

### Required Dependencies

```json
"dependencies": {
  // Existing dependencies remain unchanged...
  
  // Code Editor Integration
  "@monaco-editor/react": "^4.6.0",
  "monaco-editor": "^0.44.0",
  
  // MDX Content System
  "@next/mdx": "^14.0.0",
  "@mdx-js/loader": "^3.0.0",
  "@mdx-js/react": "^3.0.0",
  "gray-matter": "^4.0.3",
  "remark": "^15.0.1",
  "remark-gfm": "^4.0.0",
  "rehype-highlight": "^7.0.0",
  "rehype-katex": "^7.0.0",
  "remark-math": "^6.0.0",
  
  // 3D Simulation Framework
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.88.0",
  "@react-three/postprocessing": "^2.15.0"
}
```

### Development Dependencies

```json
"devDependencies": {
  // Existing devDependencies remain unchanged...
  
  // Type definitions for new dependencies
  "@types/mdx": "^2.0.0"
}
```

## Design Impact

### Component Architecture Updates

#### 1. CodePlayground Component
```typescript
// Enhanced interactive code component
interface CodePlaygroundProps {
  language: 'javascript' | 'python' | 'typescript';
  initialCode: string;
  showOutput: boolean;
  editable: boolean;
}
```

#### 2. MDX Content Integration
```typescript
// Content structure with embedded components
interface MDXContent {
  frontmatter: {
    title: string;
    phase: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
  };
  content: ReactNode;
}
```

#### 3. Enhanced 3D Simulations
```typescript
// 3D visualization components using React Three Fiber
interface SimulationProps {
  type: 'neural-network' | 'attention' | 'transformer';
  interactive: boolean;
  data: SimulationData;
}
```

### File Structure Updates

```
src/
├── components/
│   ├── CodePlayground.tsx (new)
│   ├── MDXContent.tsx (new)
│   └── Simulation3D.tsx (new)
├── lib/
│   ├── mdx-processor.ts (new)
│   └── simulation-engine.ts (enhanced)
└── types/
    ├── content.ts (new)
    └── simulation.ts (enhanced)
```

## Implementation Priority

### Phase 1: Core Educational Components
1. Monaco Editor integration for CodePlayground
2. Basic MDX processing setup
3. React Three Fiber initialization

### Phase 2: Content System
1. MDX content pipeline configuration
2. Mathematical notation support (KaTeX)
3. Syntax highlighting for code blocks

### Phase 3: Advanced Simulations
1. 3D neural network visualizations
2. Interactive transformer attention displays
3. Post-processing effects for enhanced visuals

## Consequences

### Positive
- **Complete Architecture**: Fulfills all educational component requirements from ADR-001
- **Rich Interactions**: Code editing, 3D visualizations, and mathematical content
- **Content Flexibility**: MDX enables complex educational content with embedded components
- **Professional Quality**: Monaco Editor provides VS Code-level editing experience

### Negative
- **Bundle Size**: Additional ~2-3MB to JavaScript bundle
- **Complexity**: More sophisticated build pipeline required
- **Learning Curve**: Team needs familiarity with MDX and Three.js patterns

### Risks
- **Performance Impact**: Large bundle may affect initial load times
  - *Mitigation*: Code splitting and lazy loading for heavy components
- **Browser Compatibility**: Advanced 3D features may not work on older devices
  - *Mitigation*: Progressive enhancement with 2D fallbacks
- **Build Complexity**: MDX processing may complicate deployment
  - *Mitigation*: Comprehensive testing of build pipeline

## Migration Plan

1. **Add dependencies** via npm install
2. **Configure MDX processing** in next.config.js
3. **Create base components** for CodePlayground and Simulation3D
4. **Test integration** with existing tokenization simulation
5. **Update TypeScript types** to support new component interfaces

This completes the technical architecture specified in ADR-001 and enables full implementation of the interactive educational platform.