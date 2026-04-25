'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  type: 'input' | 'process' | 'output' | 'attention';
}

interface FlowDiagramProps {
  nodes: FlowNode[];
  title?: string;
  animate?: boolean;
}

const nodeStyles = {
  input: {
    bg: '#1e3a5f',
    border: '#3b82f6',
    text: '#93c5fd',
  },
  process: {
    bg: '#14532d',
    border: '#22c55e',
    text: '#86efac',
  },
  output: {
    bg: '#3b0764',
    border: '#a855f7',
    text: '#d8b4fe',
  },
  attention: {
    bg: '#451a03',
    border: '#f59e0b',
    text: '#fcd34d',
  },
};

export default function FlowDiagram({ nodes, title, animate = true }: FlowDiagramProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-6">{title}</h3>
      )}

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
        {nodes.map((node, index) => (
          <div key={node.id} className="flex items-center gap-4">
            <motion.div
              initial={animate ? { opacity: 0, scale: 0.8 } : false}
              whileInView={animate ? { opacity: 1, scale: 1 } : undefined}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              className="relative rounded-lg px-6 py-4 min-w-[160px]"
              style={{
                backgroundColor: nodeStyles[node.type].bg,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: nodeStyles[node.type].border,
              }}
            >
              <div
                className="font-medium text-center"
                style={{ color: nodeStyles[node.type].text }}
              >
                {node.label}
              </div>
              {node.sublabel && (
                <div
                  className="text-sm text-center mt-1 opacity-70"
                  style={{ color: nodeStyles[node.type].text }}
                >
                  {node.sublabel}
                </div>
              )}
            </motion.div>

            {index < nodes.length - 1 && (
              <motion.div
                initial={animate ? { opacity: 0 } : false}
                whileInView={animate ? { opacity: 1 } : undefined}
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.15 + 0.25,
                }}
                className="hidden md:block"
              >
                <ArrowRight className="w-6 h-6 text-gray-500" />
              </motion.div>
            )}

            {index < nodes.length - 1 && (
              <motion.div
                initial={animate ? { opacity: 0 } : false}
                whileInView={animate ? { opacity: 1 } : undefined}
                viewport={{ once: true }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.15 + 0.25,
                }}
                className="md:hidden rotate-90"
              >
                <ArrowRight className="w-6 h-6 text-gray-500" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
