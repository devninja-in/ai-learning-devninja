import { useState } from 'react';
import { Copy, Check, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  executable?: boolean;
  copy?: boolean;
  className?: string;
}

export default function CodeBlock({
  children,
  language = 'python',
  title,
  filename,
  showLineNumbers = true,
  highlightLines = [],
  executable = false,
  copy = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    // Simulate code execution - replace with actual execution logic
    setTimeout(() => {
      setOutput('Code executed successfully!\\nResult: ' + Math.random().toFixed(4));
      setShowOutput(true);
      setIsExecuting(false);
    }, 1500);
  };

  const lines = children.trim().split('\\n');

  return (
    <div className={cn('not-prose', className)}>
      <Card className="overflow-hidden border-border bg-surface">
        {/* Header */}
        {(title || filename || copy || executable) && (
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
            <div className="flex items-center gap-2">
              {filename && (
                <span className="text-sm font-mono text-foreground/80">
                  {filename}
                </span>
              )}
              {title && !filename && (
                <span className="text-sm font-medium text-foreground">
                  {title}
                </span>
              )}
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-mono">
                {language}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {executable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="h-8 px-2 touch-target"
                >
                  {isExecuting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Play className="h-3 w-3" />
                    </motion.div>
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  <span className="sr-only">Execute code</span>
                </Button>
              )}

              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOutput(!showOutput)}
                  className="h-8 px-2 touch-target"
                >
                  <Eye className="h-3 w-3" />
                  <span className="sr-only">Toggle output</span>
                </Button>
              )}

              {copy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2 touch-target"
                  disabled={copied}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="h-3 w-3 text-success" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy className="h-3 w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="sr-only">
                    {copied ? 'Copied!' : 'Copy code'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Code Content */}
        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed">
            <code className="language-{language}">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    highlightLines.includes(index + 1) &&
                      'bg-primary/10 border-l-2 border-l-primary -ml-4 pl-4'
                  )}
                >
                  {showLineNumbers && (
                    <span className="select-none text-slate-500 text-right mr-4 w-8 flex-shrink-0">
                      {index + 1}
                    </span>
                  )}
                  <span className="flex-1 whitespace-pre-wrap break-all">
                    {line}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>

        {/* Output Panel */}
        <AnimatePresence>
          {showOutput && output && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-t border-border overflow-hidden"
            >
              <div className="p-4 bg-slate-800 text-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs font-medium text-slate-300">
                    Output
                  </span>
                </div>
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}