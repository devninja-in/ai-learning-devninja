'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// -------------------------------------------------------------------
// Architecture Comparison Simulation
// Shows Transformer (O(n²)) vs State Space Model (O(n)) processing
// -------------------------------------------------------------------

export default function NewArchitecturesSim() {
  const [seqLength, setSeqLength] = useState(128);
  const [showHybrid, setShowHybrid] = useState(false);

  // Compute complexity metrics
  const metrics = useMemo(() => {
    const n = seqLength;

    // Transformer: O(n²) for attention
    const transformerFlops = n * n * 64; // simplified: n² × d_model
    const transformerMemory = n * n * 2; // attention matrix storage
    const transformerSpeed = 1000 / (n * n / 1000); // tokens/sec (inverse relationship)

    // SSM: O(n) recurrent processing
    const ssmFlops = n * 64 * 8; // linear in sequence length
    const ssmMemory = n * 64; // no attention matrix
    const ssmSpeed = 1000 / (n / 10); // much better scaling

    // Hybrid: combines both (use attention for short-range, SSM for long-range)
    const hybridFlops = (transformerFlops * 0.3) + (ssmFlops * 0.7);
    const hybridMemory = (transformerMemory * 0.3) + (ssmMemory * 0.7);
    const hybridSpeed = Math.max(transformerSpeed, ssmSpeed * 0.9);

    return {
      transformer: {
        flops: transformerFlops,
        memory: transformerMemory,
        speed: transformerSpeed,
      },
      ssm: {
        flops: ssmFlops,
        memory: ssmMemory,
        speed: ssmSpeed,
      },
      hybrid: {
        flops: hybridFlops,
        memory: hybridMemory,
        speed: hybridSpeed,
      },
    };
  }, [seqLength]);

  // Determine winner at current sequence length
  const crossoverPoint = 256; // simplified, actual varies by hardware
  const transformerWins = seqLength < crossoverPoint;

  // Format large numbers
  const formatNumber = (n: number) => {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toFixed(0);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Transformer vs State Space Model
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        Watch how computation and memory scale as sequence length increases. Short sequences favor transformers; long sequences favor SSMs.
      </p>

      {/* Sequence length slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            Sequence Length
          </label>
          <span className="text-sm font-mono text-white">
            {seqLength} tokens
          </span>
        </div>
        <input
          type="range"
          min="16"
          max="1024"
          step="16"
          value={seqLength}
          onChange={(e) => setSeqLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>16</span>
          <span className="text-amber-400">crossover ~256</span>
          <span>1024</span>
        </div>
      </div>

      {/* Architecture visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Transformer side */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-blue-400">
              Transformer (Self-Attention)
            </h4>
            {transformerWins && !showHybrid && (
              <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded">
                Winner
              </span>
            )}
          </div>

          {/* Attention matrix visualization */}
          <div className="bg-gray-950 rounded-lg p-4 mb-3 flex items-center justify-center" style={{ minHeight: '180px' }}>
            <div className="relative">
              <div className="text-xs text-gray-500 mb-2 text-center">
                Attention Matrix: n × n
              </div>
              <motion.div
                className="bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded border border-blue-400/50"
                style={{
                  width: Math.min(120, 30 + seqLength / 8),
                  height: Math.min(120, 30 + seqLength / 8),
                }}
                animate={{
                  width: Math.min(120, 30 + seqLength / 8),
                  height: Math.min(120, 30 + seqLength / 8),
                }}
                transition={{ duration: 0.3 }}
              />
              <div className="text-xs text-blue-300 mt-2 text-center font-mono">
                {seqLength} × {seqLength}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <div className="font-semibold text-gray-300 mb-1">Complexity:</div>
            <div className="font-mono">O(n²) — quadratic scaling</div>
          </div>
        </div>

        {/* SSM side */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-green-500/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-green-400">
              State Space Model (Mamba)
            </h4>
            {!transformerWins && !showHybrid && (
              <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded">
                Winner
              </span>
            )}
          </div>

          {/* Recurrent processing visualization */}
          <div className="bg-gray-950 rounded-lg p-4 mb-3 flex items-center justify-center" style={{ minHeight: '180px' }}>
            <div className="relative w-full">
              <div className="text-xs text-gray-500 mb-2 text-center">
                Sequential State Updates
              </div>
              <div className="flex items-center gap-1 justify-center">
                {Array.from({ length: Math.min(12, Math.ceil(seqLength / 32)) }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="w-6 h-6 bg-green-500/40 rounded border border-green-400/50 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                    {i < Math.min(11, Math.ceil(seqLength / 32) - 1) && (
                      <div className="w-4 h-px bg-green-400/50" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="text-xs text-green-300 mt-3 text-center font-mono">
                {seqLength} steps, constant memory
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            <div className="font-semibold text-gray-300 mb-1">Complexity:</div>
            <div className="font-mono">O(n) — linear scaling</div>
          </div>
        </div>
      </div>

      {/* Stats comparison */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Performance Metrics (Relative)
        </h4>

        <div className="space-y-4">
          {/* Computation (FLOPs) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Computation (FLOPs)</span>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-blue-400">
                  Transformer: {formatNumber(metrics.transformer.flops)}
                </span>
                <span className="text-green-400">
                  SSM: {formatNumber(metrics.ssm.flops)}
                </span>
                {showHybrid && (
                  <span className="text-purple-400">
                    Hybrid: {formatNumber(metrics.hybrid.flops)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-lg overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-blue-500/60"
                style={{ width: '100%' }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-green-500/60"
                style={{
                  width: `${(metrics.ssm.flops / metrics.transformer.flops) * 100}%`,
                }}
                animate={{
                  width: `${(metrics.ssm.flops / metrics.transformer.flops) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
              {showHybrid && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-purple-500/60"
                  style={{
                    width: `${(metrics.hybrid.flops / metrics.transformer.flops) * 100}%`,
                  }}
                  animate={{
                    width: `${(metrics.hybrid.flops / metrics.transformer.flops) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </div>

          {/* Memory usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Memory Usage</span>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-blue-400">
                  Transformer: {formatNumber(metrics.transformer.memory)}
                </span>
                <span className="text-green-400">
                  SSM: {formatNumber(metrics.ssm.memory)}
                </span>
                {showHybrid && (
                  <span className="text-purple-400">
                    Hybrid: {formatNumber(metrics.hybrid.memory)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-lg overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-blue-500/60"
                style={{ width: '100%' }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-green-500/60"
                style={{
                  width: `${(metrics.ssm.memory / metrics.transformer.memory) * 100}%`,
                }}
                animate={{
                  width: `${(metrics.ssm.memory / metrics.transformer.memory) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
              {showHybrid && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-purple-500/60"
                  style={{
                    width: `${(metrics.hybrid.memory / metrics.transformer.memory) * 100}%`,
                  }}
                  animate={{
                    width: `${(metrics.hybrid.memory / metrics.transformer.memory) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </div>

          {/* Processing speed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Processing Speed (tokens/sec)</span>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-blue-400">
                  Transformer: {metrics.transformer.speed.toFixed(0)}
                </span>
                <span className="text-green-400">
                  SSM: {metrics.ssm.speed.toFixed(0)}
                </span>
                {showHybrid && (
                  <span className="text-purple-400">
                    Hybrid: {metrics.hybrid.speed.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-lg overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-green-500/60"
                style={{ width: '100%' }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-blue-500/60"
                style={{
                  width: `${(metrics.transformer.speed / metrics.ssm.speed) * 100}%`,
                }}
                animate={{
                  width: `${(metrics.transformer.speed / metrics.ssm.speed) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
              {showHybrid && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-purple-500/60"
                  style={{
                    width: `${(metrics.hybrid.speed / metrics.ssm.speed) * 100}%`,
                  }}
                  animate={{
                    width: `${(metrics.hybrid.speed / metrics.ssm.speed) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hybrid toggle */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
        <div>
          <h4 className="text-sm font-semibold text-purple-400 mb-1">
            Hybrid Architecture
          </h4>
          <p className="text-xs text-gray-400">
            Combine attention (short-range) + SSM (long-range)
          </p>
        </div>
        <button
          onClick={() => setShowHybrid(!showHybrid)}
          className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            showHybrid
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          {showHybrid ? 'Hide Hybrid' : 'Show Hybrid'}
        </button>
      </div>

      {/* Insight box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">The crossover effect:</strong> At short sequences (under ~256 tokens), transformers are faster because the O(n²) cost is still manageable and hardware is optimized for them. But as sequences grow (1K, 10K, 100K+ tokens), the quadratic cost explodes. SSMs maintain constant memory and linear complexity, making them the only viable option for truly long contexts. Modern models like Jamba and StripedHyena use both.
        </p>
      </div>
    </div>
  );
}
