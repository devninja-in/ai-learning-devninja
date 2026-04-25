'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type ComponentSlot =
  | 'data'
  | 'model'
  | 'retrieval'
  | 'safety'
  | 'api'
  | 'monitoring';

interface ComponentOption {
  id: string;
  name: string;
  description: string;
  cost: number; // monthly cost in USD
  latency: number; // ms
  complexity: number; // 1-5
  reliability: number; // 1-5
}

interface SelectedComponents {
  data: string | null;
  model: string | null;
  retrieval: string | null;
  safety: string | null;
  api: string | null;
  monitoring: string | null;
}

interface SystemMetrics {
  costPerMonth: number;
  latency: number;
  reliability: number;
  complexity: number;
}

// -------------------------------------------------------------------
// Component options
// -------------------------------------------------------------------

const COMPONENT_OPTIONS: Record<ComponentSlot, ComponentOption[]> = {
  data: [
    {
      id: 'postgres',
      name: 'PostgreSQL',
      description: 'Relational DB for structured data',
      cost: 50,
      latency: 10,
      complexity: 2,
      reliability: 5,
    },
    {
      id: 'pinecone',
      name: 'Vector DB (Pinecone)',
      description: 'Managed vector search for embeddings',
      cost: 120,
      latency: 15,
      complexity: 3,
      reliability: 5,
    },
    {
      id: 'redis',
      name: 'Redis Cache',
      description: 'In-memory cache for fast lookups',
      cost: 80,
      latency: 2,
      complexity: 2,
      reliability: 5,
    },
  ],
  model: [
    {
      id: 'gpt4',
      name: 'GPT-4 API',
      description: 'Highest quality, pay per token',
      cost: 800,
      latency: 1200,
      complexity: 1,
      reliability: 5,
    },
    {
      id: 'llama70b',
      name: 'Self-hosted Llama 3 70B',
      description: 'Full control, fixed GPU cost',
      cost: 600,
      latency: 400,
      complexity: 4,
      reliability: 4,
    },
    {
      id: 'claude',
      name: 'Claude API',
      description: 'Strong safety, excellent quality',
      cost: 700,
      latency: 1000,
      complexity: 1,
      reliability: 5,
    },
  ],
  retrieval: [
    {
      id: 'no-rag',
      name: 'No RAG',
      description: 'Direct model only',
      cost: 0,
      latency: 0,
      complexity: 1,
      reliability: 3,
    },
    {
      id: 'basic-rag',
      name: 'Basic RAG',
      description: 'Simple embedding + retrieval',
      cost: 100,
      latency: 200,
      complexity: 3,
      reliability: 4,
    },
    {
      id: 'advanced-rag',
      name: 'Advanced RAG (re-ranking)',
      description: 'Hybrid search + re-ranker',
      cost: 200,
      latency: 350,
      complexity: 4,
      reliability: 5,
    },
  ],
  safety: [
    {
      id: 'none',
      name: 'None',
      description: 'No safety filters',
      cost: 0,
      latency: 0,
      complexity: 1,
      reliability: 2,
    },
    {
      id: 'basic',
      name: 'Basic filters',
      description: 'Keyword blocking, simple checks',
      cost: 50,
      latency: 20,
      complexity: 2,
      reliability: 3,
    },
    {
      id: 'full',
      name: 'Full guardrails',
      description: 'Input/output validation, PII detection',
      cost: 150,
      latency: 80,
      complexity: 3,
      reliability: 5,
    },
  ],
  api: [
    {
      id: 'rest',
      name: 'REST',
      description: 'Simple request/response',
      cost: 30,
      latency: 50,
      complexity: 1,
      reliability: 5,
    },
    {
      id: 'streaming',
      name: 'Streaming',
      description: 'Token-by-token response',
      cost: 50,
      latency: 100,
      complexity: 2,
      reliability: 5,
    },
    {
      id: 'websocket',
      name: 'WebSocket',
      description: 'Full-duplex, real-time',
      cost: 80,
      latency: 150,
      complexity: 3,
      reliability: 4,
    },
  ],
  monitoring: [
    {
      id: 'none',
      name: 'None',
      description: 'No monitoring',
      cost: 0,
      latency: 0,
      complexity: 1,
      reliability: 2,
    },
    {
      id: 'logging',
      name: 'Logging only',
      description: 'Basic request logs',
      cost: 40,
      latency: 5,
      complexity: 2,
      reliability: 3,
    },
    {
      id: 'full',
      name: 'Full observability',
      description: 'Metrics, tracing, alerts',
      cost: 120,
      latency: 10,
      complexity: 3,
      reliability: 5,
    },
  ],
};

const BEST_PRACTICE_CONFIG: SelectedComponents = {
  data: 'pinecone',
  model: 'claude',
  retrieval: 'advanced-rag',
  safety: 'full',
  api: 'streaming',
  monitoring: 'full',
};

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function ProductionAISim() {
  const [selected, setSelected] = useState<SelectedComponents>({
    data: null,
    model: null,
    retrieval: null,
    safety: null,
    api: null,
    monitoring: null,
  });

  const handleSelect = useCallback((slot: ComponentSlot, optionId: string) => {
    setSelected((prev) => ({
      ...prev,
      [slot]: prev[slot] === optionId ? null : optionId,
    }));
  }, []);

  const handleBestPractice = useCallback(() => {
    setSelected(BEST_PRACTICE_CONFIG);
  }, []);

  const handleReset = useCallback(() => {
    setSelected({
      data: null,
      model: null,
      retrieval: null,
      safety: null,
      api: null,
      monitoring: null,
    });
  }, []);

  // Calculate metrics
  const calculateMetrics = useCallback((): SystemMetrics | null => {
    const allSelected = Object.values(selected).every((v) => v !== null);
    if (!allSelected) return null;

    let totalCost = 0;
    let totalLatency = 0;
    let totalComplexity = 0;
    let totalReliability = 0;
    let count = 0;

    (Object.keys(selected) as ComponentSlot[]).forEach((slot) => {
      const optionId = selected[slot];
      if (optionId) {
        const option = COMPONENT_OPTIONS[slot].find((o) => o.id === optionId);
        if (option) {
          totalCost += option.cost;
          totalLatency += option.latency;
          totalComplexity += option.complexity;
          totalReliability += option.reliability;
          count++;
        }
      }
    });

    return {
      costPerMonth: totalCost,
      latency: totalLatency,
      reliability: Math.round(totalReliability / count),
      complexity: Math.round(totalComplexity / count),
    };
  }, [selected]);

  const metrics = calculateMetrics();
  const allSelected = Object.values(selected).every((v) => v !== null);

  const getSlotLabel = (slot: ComponentSlot): string => {
    const labels: Record<ComponentSlot, string> = {
      data: 'Data Layer',
      model: 'Model',
      retrieval: 'Retrieval',
      safety: 'Safety',
      api: 'API',
      monitoring: 'Monitoring',
    };
    return labels[slot];
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 2) return 'text-green-400';
    if (complexity <= 3) return 'text-amber-400';
    return 'text-red-400';
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 4) return 'text-green-400';
    if (reliability >= 3) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Production AI System Builder
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Build your production pipeline by selecting components
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBestPractice}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Best Practice
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Component selection */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Object.keys(COMPONENT_OPTIONS) as ComponentSlot[]).map((slot) => (
            <div key={slot} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${selected[slot] ? 'bg-green-500' : 'bg-gray-600'}`}
                />
                <h4 className="text-sm font-semibold text-white">
                  {getSlotLabel(slot)}
                </h4>
              </div>
              <div className="space-y-2">
                {COMPONENT_OPTIONS[slot].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(slot, option.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selected[slot] === option.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${
                            selected[slot] === option.id
                              ? 'text-blue-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {option.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        ${option.cost}/mo
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System diagram */}
      <AnimatePresence>
        {allSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 sm:px-6 pb-6"
          >
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
              <h4 className="text-sm font-semibold text-white mb-4">
                System Architecture
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/50 rounded-lg text-xs text-purple-400 font-medium">
                  User
                </div>
                <div className="text-gray-600">→</div>
                <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/50 rounded-lg text-xs text-blue-400 font-medium">
                  {
                    COMPONENT_OPTIONS.api.find((o) => o.id === selected.api)
                      ?.name
                  }
                </div>
                <div className="text-gray-600">→</div>
                <div className="px-3 py-2 bg-green-500/10 border border-green-500/50 rounded-lg text-xs text-green-400 font-medium">
                  {
                    COMPONENT_OPTIONS.safety.find((o) => o.id === selected.safety)
                      ?.name
                  }
                </div>
                <div className="text-gray-600">→</div>
                <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/50 rounded-lg text-xs text-amber-400 font-medium">
                  {
                    COMPONENT_OPTIONS.retrieval.find(
                      (o) => o.id === selected.retrieval
                    )?.name
                  }
                </div>
                <div className="text-gray-600">↔</div>
                <div className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-lg text-xs text-cyan-400 font-medium">
                  {
                    COMPONENT_OPTIONS.data.find((o) => o.id === selected.data)
                      ?.name
                  }
                </div>
                <div className="text-gray-600 hidden sm:block">→</div>
                <div className="w-full sm:w-auto text-center sm:text-left text-gray-600 sm:hidden">
                  ↓
                </div>
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-xs text-red-400 font-medium">
                  {
                    COMPONENT_OPTIONS.model.find((o) => o.id === selected.model)
                      ?.name
                  }
                </div>
                <div className="text-gray-600">→</div>
                <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/50 rounded-lg text-xs text-purple-400 font-medium">
                  Response
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <div className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-400 font-medium">
                  {
                    COMPONENT_OPTIONS.monitoring.find(
                      (o) => o.id === selected.monitoring
                    )?.name
                  }{' '}
                  (tracks everything)
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics */}
      <AnimatePresence>
        {metrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-800 bg-gray-900/30"
          >
            <div className="px-4 sm:px-6 py-6">
              <h4 className="text-sm font-semibold text-white mb-4">
                System Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <div className="text-xs text-gray-400 mb-1">Cost/Month</div>
                  <div className="text-2xl font-bold text-white">
                    ${metrics.costPerMonth}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.costPerMonth < 500
                      ? 'Budget-friendly'
                      : metrics.costPerMonth < 1000
                        ? 'Moderate'
                        : 'Premium'}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <div className="text-xs text-gray-400 mb-1">Latency</div>
                  <div className="text-2xl font-bold text-white">
                    {metrics.latency}ms
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.latency < 500
                      ? 'Fast'
                      : metrics.latency < 1500
                        ? 'Acceptable'
                        : 'Slow'}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <div className="text-xs text-gray-400 mb-1">Reliability</div>
                  <div
                    className={`text-2xl font-bold ${getReliabilityColor(metrics.reliability)}`}
                  >
                    {metrics.reliability}/5
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.reliability >= 4
                      ? 'Production-ready'
                      : metrics.reliability >= 3
                        ? 'Needs work'
                        : 'Risky'}
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                  <div className="text-xs text-gray-400 mb-1">Complexity</div>
                  <div
                    className={`text-2xl font-bold ${getComplexityColor(metrics.complexity)}`}
                  >
                    {metrics.complexity}/5
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {metrics.complexity <= 2
                      ? 'Simple'
                      : metrics.complexity <= 3
                        ? 'Moderate'
                        : 'Complex'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-gray-800 bg-gray-900/50">
        <p className="text-xs text-gray-500 text-center">
          Select all components to see system architecture and metrics. The Best
          Practice button shows a recommended production configuration.
        </p>
      </div>
    </div>
  );
}
