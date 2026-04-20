import { MDXComponents } from 'mdx/types';
import { CodeBlock, SimulationContainer, InteractiveQuiz } from '@/components/educational';
import TokenizationSimulation from '@/components/educational/TokenizationSimulation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Custom components for MDX content
const mdxComponents: MDXComponents = {
  // Override default HTML elements
  h1: ({ className, ...props }) => (
    <h1
      className={cn('text-h1 font-bold text-foreground mb-6 mt-8 first:mt-0', className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn('text-h2 font-semibold text-foreground mb-4 mt-8', className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn('text-h3 font-semibold text-foreground mb-3 mt-6', className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn('text-h4 font-semibold text-foreground mb-2 mt-4', className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn('text-base text-foreground/90 leading-relaxed mb-4', className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn('list-disc list-inside space-y-2 mb-4 text-foreground/90', className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn('list-decimal list-inside space-y-2 mb-4 text-foreground/90', className)}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      className={cn('text-base leading-relaxed', className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'border-l-4 border-primary/30 pl-4 py-2 mb-4 bg-surface rounded-r-md italic text-foreground/80',
        className
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        'relative rounded bg-surface px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground border',
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, children, ...props }) => {
    // Check if this is a code block with language
    if (typeof children === 'object' && children && 'props' in children) {
      const codeProps = children.props;
      if (codeProps.className?.includes('language-')) {
        const language = codeProps.className.replace('language-', '');
        const code = typeof codeProps.children === 'string' ? codeProps.children : '';

        return (
          <CodeBlock language={language} className="mb-6">
            {code}
          </CodeBlock>
        );
      }
    }

    // Fallback for regular pre blocks
    return (
      <pre
        className={cn(
          'mb-4 mt-6 overflow-x-auto rounded-lg border bg-slate-900 text-slate-50 p-4 font-mono text-sm',
          className
        )}
        {...props}
      >
        {children}
      </pre>
    );
  },
  a: ({ className, ...props }) => (
    <a
      className={cn('text-primary hover:text-primary/80 underline transition-colors', className)}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn('rounded-lg border shadow-design-sm max-w-full h-auto', className)}
      alt={alt}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr
      className={cn('my-8 border-border', className)}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="mb-6 w-full overflow-y-auto">
      <table
        className={cn('w-full border-collapse text-sm', className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead
      className={cn('bg-surface border-b-2 border-border', className)}
      {...props}
    />
  ),
  tbody: ({ className, ...props }) => (
    <tbody
      className={cn('', className)}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn('border-b border-border hover:bg-surface/50 transition-colors', className)}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn('px-4 py-3 text-left font-semibold text-foreground', className)}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn('px-4 py-3 text-foreground/90', className)}
      {...props}
    />
  ),

  // Custom educational components
  CodeBlock: ({ children, language, title, ...props }: any) => (
    <CodeBlock language={language} title={title} {...props}>
      {children}
    </CodeBlock>
  ),

  SimulationContainer: ({ children, title, description, ...props }: any) => (
    <SimulationContainer title={title} description={description} {...props}>
      {children}
    </SimulationContainer>
  ),

  InteractiveQuiz: ({ title, questions, ...props }: any) => (
    <InteractiveQuiz title={title} questions={questions} {...props} />
  ),

  TokenizationSimulation: ({ defaultText, encodings, showStatistics, showTokenDetails, ...props }: any) => (
    <TokenizationSimulation
      defaultText={defaultText}
      encodings={encodings}
      showStatistics={showStatistics}
      showTokenDetails={showTokenDetails}
      {...props}
    />
  ),

  ConceptCard: ({ title, children, className, ...props }: any) => (
    <Card className={cn('mb-6 not-prose', className)} {...props}>
      <CardHeader>
        <h3 className="text-h3 font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          {children}
        </div>
      </CardContent>
    </Card>
  ),

  KeyConcept: ({ children, className }: any) => (
    <div className={cn(
      'not-prose bg-primary/10 border-l-4 border-primary rounded-r-lg p-4 mb-6',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-white">!</span>
        </div>
        <div className="text-foreground/90 font-medium">
          {children}
        </div>
      </div>
    </div>
  ),

  TechnicalNote: ({ children, className }: any) => (
    <div className={cn(
      'not-prose bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-6',
      className
    )}>
      <div className="text-sm text-foreground/80">
        <strong className="text-secondary font-semibold">Technical Note:</strong>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  ),

  LearningObjective: ({ children, className }: any) => (
    <div className={cn(
      'not-prose bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-accent rounded flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-white">🎯</span>
        </div>
        <div className="text-foreground/90">
          <strong className="font-semibold">Learning Objective:</strong>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  ),

  // Interactive diagram placeholder
  InteractiveDiagram: ({ type, data, className, ...props }: any) => (
    <SimulationContainer
      title={`Interactive ${type} Diagram`}
      description="Visualization placeholder - integration pending"
      className={className}
      height={400}
      {...props}
    >
      <div className="flex items-center justify-center h-full text-foreground/60">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">📊 {type} Diagram</div>
          <p className="text-sm">Interactive visualization will be available soon</p>
        </div>
      </div>
    </SimulationContainer>
  ),
};

export default mdxComponents;