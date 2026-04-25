'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CacheMode = 'no-cache' | 'with-cache';
type BatchMode = 'sequential' | 'continuous';

interface Request {
  id: number;
  tokens: number;
  progress: number;
  color: string;
  status: 'waiting' | 'processing' | 'completed';
}

export default function InferenceSim() {
  const [sequenceLength, setSequenceLength] = useState(50);
  const [cacheMode, setCacheMode] = useState<CacheMode>('with-cache');
  const [batchMode, setBatchMode] = useState<BatchMode>('sequential');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentToken, setCurrentToken] = useState(0);
  const [requests, setRequests] = useState<Request[]>([
    { id: 1, tokens: 30, progress: 0, color: '#3b82f6', status: 'waiting' },
    { id: 2, tokens: 40, progress: 0, color: '#8b5cf6', status: 'waiting' },
    { id: 3, tokens: 25, progress: 0, color: '#f59e0b', status: 'waiting' },
    { id: 4, tokens: 35, progress: 0, color: '#10b981', status: 'waiting' },
  ]);

  // KV-cache visualization
  const generateKVCacheBlocks = () => {
    const blocks = [];
    for (let i = 0; i < currentToken; i++) {
      blocks.push(
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-3 h-8 bg-blue-500 rounded-sm"
          transition={{ duration: 0.2 }}
        />
      );
    }
    return blocks;
  };

  // Stats calculation
  const noCacheTime = sequenceLength * (sequenceLength + 1) / 2; // Sum of 1+2+...+n
  const withCacheTime = sequenceLength;
  const speedup = (noCacheTime / withCacheTime).toFixed(1);
  const tokensPerSecond = cacheMode === 'with-cache' ? 80 : 20;
  const memoryUsage = cacheMode === 'with-cache' ? (currentToken * 0.5).toFixed(1) : '0.1';
  const latencyMs = cacheMode === 'with-cache' ? 12 : 50;

  // Animation for token generation
  useEffect(() => {
    if (!isGenerating) return;

    if (currentToken >= sequenceLength) {
      setIsGenerating(false);
      setCurrentToken(0);
      return;
    }

    const delay = cacheMode === 'with-cache' ? 80 : 200;
    const timer = setTimeout(() => {
      setCurrentToken((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isGenerating, currentToken, sequenceLength, cacheMode]);

  // Batching simulation
  useEffect(() => {
    if (batchMode === 'sequential') {
      // Sequential processing - one at a time
      const interval = setInterval(() => {
        setRequests((prev) => {
          const newRequests = [...prev];
          const processingIdx = newRequests.findIndex((r) => r.status === 'processing');

          if (processingIdx !== -1) {
            // Continue processing current request
            newRequests[processingIdx].progress += 2;
            if (newRequests[processingIdx].progress >= newRequests[processingIdx].tokens) {
              newRequests[processingIdx].status = 'completed';
            }
          } else {
            // Start next waiting request
            const waitingIdx = newRequests.findIndex((r) => r.status === 'waiting');
            if (waitingIdx !== -1) {
              newRequests[waitingIdx].status = 'processing';
            }
          }

          return newRequests;
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      // Continuous batching - all together
      const interval = setInterval(() => {
        setRequests((prev) => {
          const newRequests = [...prev];
          newRequests.forEach((req) => {
            if (req.status !== 'completed') {
              req.status = 'processing';
              req.progress += 2;
              if (req.progress >= req.tokens) {
                req.status = 'completed';
              }
            }
          });
          return newRequests;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [batchMode]);

  const resetBatching = () => {
    setRequests([
      { id: 1, tokens: 30, progress: 0, color: '#3b82f6', status: 'waiting' },
      { id: 2, tokens: 40, progress: 0, color: '#8b5cf6', status: 'waiting' },
      { id: 3, tokens: 25, progress: 0, color: '#f59e0b', status: 'waiting' },
      { id: 4, tokens: 35, progress: 0, color: '#10b981', status: 'waiting' },
    ]);
  };

  const allCompleted = requests.every((r) => r.status === 'completed');
  const totalTime = batchMode === 'sequential'
    ? requests.reduce((sum, r) => sum + r.tokens, 0)
    : Math.max(...requests.map((r) => r.tokens));

  return (
    <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 space-y-8">
      <div className="text-lg font-semibold text-white">
        Inference Optimization Visualizer
      </div>

      {/* Part 1: KV-Cache Demo */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-md font-semibold text-white">
          Part 1: KV-Cache — Memory vs Speed
        </h3>

        {/* Cache mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setCacheMode('no-cache')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              cacheMode === 'no-cache'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            No KV-Cache
          </button>
          <button
            onClick={() => setCacheMode('with-cache')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              cacheMode === 'with-cache'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            With KV-Cache
          </button>
        </div>

        {/* Sequence length slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Sequence Length</span>
            <span className="text-sm font-mono text-white">{sequenceLength} tokens</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={sequenceLength}
            onChange={(e) => {
              setSequenceLength(parseInt(e.target.value));
              setCurrentToken(0);
              setIsGenerating(false);
            }}
            className="w-full"
          />
        </div>

        {/* Generation button */}
        <button
          onClick={() => {
            setCurrentToken(0);
            setIsGenerating(true);
          }}
          disabled={isGenerating}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Start Generation'}
        </button>

        {/* KV-cache visualization */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2">
            {cacheMode === 'with-cache' ? 'KV-Cache (growing)' : 'No cache (recompute all)'}
          </div>
          <div className="h-16 bg-gray-800 rounded border border-gray-700 p-2 overflow-x-auto">
            <div className="flex gap-1 h-full items-center">
              {cacheMode === 'with-cache' ? (
                generateKVCacheBlocks()
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-gray-500">
                    {isGenerating ? 'Recomputing all tokens...' : 'No cache stored'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Progress: {currentToken} / {sequenceLength} tokens
          </div>
        </div>

        {/* Stats comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Time Complexity</div>
            <div className="text-lg font-bold text-white mt-1">
              {cacheMode === 'with-cache' ? 'O(n)' : 'O(n²)'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {cacheMode === 'with-cache' ? 'Linear' : 'Quadratic'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Speedup</div>
            <div className="text-lg font-bold text-green-400 mt-1">
              {cacheMode === 'with-cache' ? `${speedup}x` : '1x'}
            </div>
            <div className="text-xs text-gray-500 mt-1">vs no cache</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Memory Usage</div>
            <div className="text-lg font-bold text-white mt-1">
              {memoryUsage} MB
            </div>
            <div className="text-xs text-gray-500 mt-1">KV-cache</div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Tokens/Second</div>
            <div className="text-lg font-bold text-white mt-1">
              {tokensPerSecond}
            </div>
            <div className="text-xs text-gray-500 mt-1">throughput</div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-xs text-blue-300">
            <strong>Key insight:</strong>{' '}
            {cacheMode === 'with-cache'
              ? 'KV-cache stores past computations. Each new token only needs one forward pass, trading memory for massive speed gains.'
              : 'Without cache, every new token requires recomputing attention over ALL previous tokens. Quadratic complexity kills performance.'}
          </div>
        </div>
      </div>

      {/* Part 2: Batching Demo */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-md font-semibold text-white">
          Part 2: Continuous Batching — Maximizing GPU Utilization
        </h3>

        {/* Batch mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setBatchMode('sequential');
              resetBatching();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              batchMode === 'sequential'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Sequential (One-by-One)
          </button>
          <button
            onClick={() => {
              setBatchMode('continuous');
              resetBatching();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              batchMode === 'continuous'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Continuous Batching
          </button>
        </div>

        {/* Request timeline visualization */}
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Request {req.id}</span>
                <span className="text-gray-500">
                  {req.progress} / {req.tokens} tokens
                </span>
              </div>
              <div className="h-8 bg-gray-700 rounded-lg overflow-hidden relative">
                <motion.div
                  className="h-full flex items-center justify-end pr-2"
                  style={{
                    backgroundColor: req.color,
                    width: `${(req.progress / req.tokens) * 100}%`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(req.progress / req.tokens) * 100}%` }}
                  transition={{ duration: 0.1 }}
                >
                  {req.status === 'completed' && (
                    <span className="text-xs font-medium text-white">✓</span>
                  )}
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white/80">
                    {req.status === 'waiting' && 'Waiting...'}
                    {req.status === 'processing' && 'Processing'}
                    {req.status === 'completed' && 'Done'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reset button */}
        <button
          onClick={resetBatching}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Reset Requests
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Mode</div>
            <div className="text-sm font-bold text-white mt-1">
              {batchMode === 'sequential' ? 'Sequential' : 'Batched'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Total Time</div>
            <div className="text-sm font-bold text-white mt-1">
              {allCompleted ? `${totalTime} steps` : 'Running...'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-3">
            <div className="text-xs text-gray-400">Throughput</div>
            <div className="text-sm font-bold text-green-400 mt-1">
              {batchMode === 'continuous' ? '4x' : '1x'}
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="text-xs text-green-300">
            <strong>Key insight:</strong>{' '}
            {batchMode === 'continuous'
              ? 'Continuous batching processes all requests in parallel. When one finishes, the GPU immediately fills its slot. No idle time.'
              : 'Sequential processing wastes GPU cycles. Only one request runs at a time. The GPU sits idle between requests.'}
          </div>
        </div>
      </div>

      {/* Bottom explanation */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-xs text-gray-400 leading-relaxed">
          <strong className="text-white">Production inference engines</strong> like vLLM and TensorRT-LLM
          combine both techniques: KV-cache eliminates redundant computation, and continuous batching maximizes
          hardware utilization. Together, they achieve 10-20x throughput gains over naive implementations.
          Flash Attention optimizes the memory access patterns within attention itself, making each forward
          pass even faster.
        </div>
      </div>
    </div>
  );
}
