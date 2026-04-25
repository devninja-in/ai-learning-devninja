'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Stage = 'data' | 'train' | 'evaluate' | 'registry' | 'deploy' | 'monitor';

type StageStatus = 'idle' | 'active' | 'complete' | 'alert';

interface StageConfig {
  id: Stage;
  label: string;
  icon: string;
  description: string;
  tools: string[];
  metrics?: string[];
}

const STAGES: StageConfig[] = [
  {
    id: 'data',
    label: 'Data',
    icon: '📊',
    description: 'Ingest and validate training data',
    tools: ['DVC', 'Great Expectations', 'Pandas'],
    metrics: ['Rows: 10,000', 'Features: 24', 'Quality: 98%'],
  },
  {
    id: 'train',
    label: 'Train',
    icon: '🧠',
    description: 'Train model with experiment tracking',
    tools: ['MLflow', 'PyTorch', 'Optuna'],
    metrics: ['Epochs: 100', 'Loss: 0.032', 'Acc: 94.2%'],
  },
  {
    id: 'evaluate',
    label: 'Evaluate',
    icon: '📈',
    description: 'Validate performance on test set',
    tools: ['Scikit-learn', 'TensorBoard'],
    metrics: ['Precision: 93%', 'Recall: 95%', 'F1: 94%'],
  },
  {
    id: 'registry',
    label: 'Registry',
    icon: '🗂️',
    description: 'Version and store model artifacts',
    tools: ['MLflow Registry', 'Git LFS', 'S3'],
    metrics: ['Version: v3.2', 'Size: 45 MB', 'Tagged: Production'],
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: '🚀',
    description: 'Serve model via REST API',
    tools: ['FastAPI', 'Docker', 'Kubernetes'],
    metrics: ['Replicas: 3', 'Latency: 12ms', 'Uptime: 99.9%'],
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: '🔍',
    description: 'Track performance and drift',
    tools: ['Prometheus', 'Grafana', 'Evidently'],
    metrics: ['Requests: 1.2M/day', 'Accuracy: 93.8%', 'Drift: Low'],
  },
];

export default function MLOpsSim() {
  const [expandedStage, setExpandedStage] = useState<Stage | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState<Stage[]>([]);
  const [scenario, setScenario] = useState<'good' | 'drifting'>('good');

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress([]);

    for (const stage of STAGES) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDeployProgress((prev) => [...prev, stage.id]);
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsDeploying(false);
  };

  const getStageStatus = (stageId: Stage): StageStatus => {
    if (isDeploying) {
      if (deployProgress.includes(stageId)) return 'complete';
      if (deployProgress.length > 0 && STAGES.findIndex((s) => s.id === stageId) === deployProgress.length) {
        return 'active';
      }
      return 'idle';
    }
    if (scenario === 'drifting' && stageId === 'monitor') return 'alert';
    return 'idle';
  };

  const getStageColor = (status: StageStatus): string => {
    switch (status) {
      case 'active':
        return 'border-blue-500 bg-blue-500/20';
      case 'complete':
        return 'border-green-500 bg-green-500/20';
      case 'alert':
        return 'border-red-500 bg-red-500/20';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  // Monitoring data (changes based on scenario)
  const monitoringData = scenario === 'good'
    ? [
        { day: 'Mon', acc: 94.2 },
        { day: 'Tue', acc: 94.1 },
        { day: 'Wed', acc: 94.3 },
        { day: 'Thu', acc: 94.0 },
        { day: 'Fri', acc: 94.2 },
        { day: 'Sat', acc: 94.1 },
        { day: 'Sun', acc: 94.3 },
      ]
    : [
        { day: 'Mon', acc: 94.2 },
        { day: 'Tue', acc: 93.8 },
        { day: 'Wed', acc: 92.5 },
        { day: 'Thu', acc: 90.8 },
        { day: 'Fri', acc: 88.2 },
        { day: 'Sat', acc: 85.7 },
        { day: 'Sun', acc: 82.1 },
      ];

  const maxAcc = 100;
  const minAcc = 75;
  const threshold = 90;

  return (
    <div className="bg-gray-900 rounded-xl p-6 space-y-6">
      {/* Pipeline diagram */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          const isExpanded = expandedStage === stage.id;

          return (
            <motion.div
              key={stage.id}
              className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${getStageColor(status)} ${
                isExpanded ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Stage icon and label */}
              <div className="text-center">
                <div className="text-3xl mb-1">{stage.icon}</div>
                <div className="text-sm font-semibold text-white">{stage.label}</div>
              </div>

              {/* Status indicator */}
              {status === 'active' && (
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
              {status === 'complete' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
              )}
              {status === 'alert' && (
                <motion.div
                  className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                />
              )}

              {/* Arrow connector (not for last stage) */}
              {idx < STAGES.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-600 text-xl">
                  →
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Expanded stage details */}
      <AnimatePresence mode="wait">
        {expandedStage && (
          <motion.div
            key={expandedStage}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700"
          >
            {(() => {
              const stage = STAGES.find((s) => s.id === expandedStage)!;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stage.icon}</span>
                    <h3 className="text-lg font-semibold text-white">{stage.label}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{stage.description}</p>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {stage.tools.map((tool) => (
                        <span
                          key={tool}
                          className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/50 rounded text-blue-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {stage.metrics && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Key Metrics</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {stage.metrics.map((metric) => (
                          <div key={metric} className="text-xs text-gray-300 font-mono bg-gray-900/50 px-2 py-1 rounded">
                            {metric}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deploy button */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            isDeploying
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
          }`}
        >
          {isDeploying ? 'Deploying...' : 'Run Pipeline'}
        </button>

        {!isDeploying && (
          <div className="flex gap-2">
            <button
              onClick={() => setScenario('good')}
              className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                scenario === 'good'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Good Data
            </button>
            <button
              onClick={() => setScenario('drifting')}
              className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                scenario === 'drifting'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Data Drift
            </button>
          </div>
        )}
      </div>

      {/* Monitoring dashboard */}
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📊</span>
            Production Monitoring
          </h3>
          {scenario === 'drifting' && (
            <motion.div
              className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-300 text-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="text-lg">⚠️</span>
              Drift Alert
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Model Accuracy Over Time</span>
            <span className="text-gray-500 font-mono">Threshold: {threshold}%</span>
          </div>

          {/* Simple line chart */}
          <div className="relative h-40 bg-gray-900 rounded p-3">
            <svg viewBox="0 0 400 120" className="w-full h-full">
              {/* Threshold line */}
              <line
                x1="0"
                y1={120 - ((threshold - minAcc) / (maxAcc - minAcc)) * 120}
                x2="400"
                y2={120 - ((threshold - minAcc) / (maxAcc - minAcc)) * 120}
                stroke="#ef4444"
                strokeWidth="1"
                strokeDasharray="4 2"
                opacity="0.5"
              />

              {/* Data line */}
              <motion.polyline
                points={monitoringData
                  .map((d, i) => {
                    const x = (i / (monitoringData.length - 1)) * 400;
                    const y = 120 - ((d.acc - minAcc) / (maxAcc - minAcc)) * 120;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={scenario === 'good' ? '#22c55e' : '#ef4444'}
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />

              {/* Data points */}
              {monitoringData.map((d, i) => {
                const x = (i / (monitoringData.length - 1)) * 400;
                const y = 120 - ((d.acc - minAcc) / (maxAcc - minAcc)) * 120;
                const isBelowThreshold = d.acc < threshold;

                return (
                  <g key={d.day}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={isBelowThreshold ? '#ef4444' : scenario === 'good' ? '#22c55e' : '#f59e0b'}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    />
                    {/* Day label */}
                    <text x={x} y="135" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="sans-serif">
                      {d.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Current stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-gray-900/50 rounded p-2">
              <div className="text-xs text-gray-500">Current Accuracy</div>
              <div
                className={`text-lg font-bold font-mono ${
                  monitoringData[monitoringData.length - 1].acc < threshold ? 'text-red-400' : 'text-green-400'
                }`}
              >
                {monitoringData[monitoringData.length - 1].acc.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-900/50 rounded p-2">
              <div className="text-xs text-gray-500">Week Avg</div>
              <div className="text-lg font-bold font-mono text-blue-400">
                {(monitoringData.reduce((sum, d) => sum + d.acc, 0) / monitoringData.length).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-900/50 rounded p-2">
              <div className="text-xs text-gray-500">Drift Status</div>
              <div className={`text-lg font-bold ${scenario === 'good' ? 'text-green-400' : 'text-red-400'}`}>
                {scenario === 'good' ? 'Stable' : 'High'}
              </div>
            </div>
          </div>
        </div>

        {scenario === 'drifting' && (
          <motion.div
            className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-sm text-red-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <strong>Action Required:</strong> Model performance has degraded below threshold. Input distribution has
            shifted from training data. Recommend retraining with recent production data.
          </motion.div>
        )}
      </div>
    </div>
  );
}
