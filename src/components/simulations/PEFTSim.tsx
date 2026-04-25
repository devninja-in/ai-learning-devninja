'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types and constants
// -------------------------------------------------------------------

type Method = 'full' | 'lora' | 'qlora';

interface MethodInfo {
  id: Method;
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
  trainablePercent: number;
  gpuMemory: string;
  trainingTime: string;
  cost: string;
  gpuRequired: string;
}

const METHODS: MethodInfo[] = [
  {
    id: 'full',
    label: 'Full Fine-tuning',
    color: '#ef4444',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500',
    description: 'Update every parameter in the model. Maximum quality but extremely expensive.',
    trainablePercent: 100,
    gpuMemory: '~320 GB',
    trainingTime: '~72 hours',
    cost: '$50,000+',
    gpuRequired: '4x A100 80GB',
  },
  {
    id: 'lora',
    label: 'LoRA',
    color: '#3b82f6',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500',
    description: 'Freeze the base model. Add small trainable low-rank matrices beside each weight matrix.',
    trainablePercent: 0.1,
    gpuMemory: '~18 GB',
    trainingTime: '~8 hours',
    cost: '$200-500',
    gpuRequired: '1x A100 / 2x RTX 4090',
  },
  {
    id: 'qlora',
    label: 'QLoRA',
    color: '#22c55e',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500',
    description: 'Quantize the base model to 4-bit, then add LoRA adapters on top. Maximum efficiency.',
    trainablePercent: 0.05,
    gpuMemory: '~10 GB',
    trainingTime: '~12 hours',
    cost: '$50-100',
    gpuRequired: '1x RTX 4090 / 3090',
  },
];

const LORA_RANKS = [4, 8, 16, 32, 64];

const GRID_SIZE = 12; // 12x12 grid of parameters

// -------------------------------------------------------------------
// Parameter grid visualization
// -------------------------------------------------------------------

function ParameterGrid({
  method,
  loraRank,
}: {
  method: Method;
  loraRank: number;
}) {
  const cells = useMemo(() => {
    const grid: { row: number; col: number; active: boolean; adapter: boolean; quantized: boolean }[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let active = false;
        let adapter = false;
        let quantized = false;

        if (method === 'full') {
          active = true;
        } else if (method === 'lora') {
          // LoRA: thin strips on the right side, proportional to rank
          const stripWidth = Math.max(1, Math.round(loraRank / 16));
          if (col >= GRID_SIZE - stripWidth) {
            active = true;
            adapter = true;
          }
        } else if (method === 'qlora') {
          // QLoRA: base is quantized (dimmed), even thinner adapter strip
          quantized = true;
          const stripWidth = Math.max(1, Math.round(loraRank / 32));
          if (col >= GRID_SIZE - stripWidth) {
            active = true;
            adapter = true;
            quantized = false;
          }
        }

        grid.push({ row, col, active, adapter, quantized });
      }
    }
    return grid;
  }, [method, loraRank]);

  const methodInfo = METHODS.find((m) => m.id === method)!;

  return (
    <div>
      <div className="text-xs font-medium text-gray-400 mb-2 text-center">
        Model Parameters ({GRID_SIZE}&times;{GRID_SIZE} = {GRID_SIZE * GRID_SIZE} shown)
      </div>
      <div
        className="grid gap-[2px] mx-auto"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          maxWidth: '280px',
        }}
      >
        {cells.map((cell, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-[2px]"
            initial={false}
            animate={{
              backgroundColor: cell.active
                ? cell.adapter
                  ? methodInfo.color
                  : methodInfo.color
                : cell.quantized
                ? '#1e1e2e'
                : '#1f2937',
              opacity: cell.active ? 1 : cell.quantized ? 0.4 : 0.25,
              scale: cell.active ? 1 : 0.9,
            }}
            transition={{ duration: 0.3, delay: cell.active ? i * 0.002 : 0 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-3">
        {method === 'full' && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: methodInfo.color }} />
            <span className="text-[10px] text-gray-400">Trained (100%)</span>
          </div>
        )}
        {(method === 'lora' || method === 'qlora') && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[2px] bg-gray-700 opacity-40" />
              <span className="text-[10px] text-gray-400">
                Frozen{method === 'qlora' ? ' + 4-bit' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: methodInfo.color }} />
              <span className="text-[10px] text-gray-400">
                LoRA adapters ({method === 'qlora' ? '~0.05%' : '~0.1%'})
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Stats comparison panel
// -------------------------------------------------------------------

function StatsPanel({ method, loraRank }: { method: Method; loraRank: number }) {
  const methodInfo = METHODS.find((m) => m.id === method)!;

  // Adjust trainable params based on LoRA rank
  const getTrainablePercent = (): string => {
    if (method === 'full') return '100%';
    const basePercent = method === 'lora' ? 0.1 : 0.05;
    const rankMultiplier = loraRank / 8; // rank 8 is baseline
    const adjusted = basePercent * rankMultiplier;
    return `${adjusted.toFixed(2)}%`;
  };

  const getParamCount = (): string => {
    if (method === 'full') return '70B';
    const baseMillions = method === 'lora' ? 70 : 35;
    const rankMultiplier = loraRank / 8;
    const millions = baseMillions * rankMultiplier;
    return `${millions.toFixed(0)}M`;
  };

  const stats = [
    {
      label: 'Trainable Params',
      value: getTrainablePercent(),
      detail: `${getParamCount()} of 70B`,
    },
    {
      label: 'GPU Memory',
      value: methodInfo.gpuMemory,
      detail: methodInfo.gpuRequired,
    },
    {
      label: 'Training Time',
      value: methodInfo.trainingTime,
      detail: '70B model, single task',
    },
    {
      label: 'Estimated Cost',
      value: methodInfo.cost,
      detail: 'Cloud GPU pricing',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          className="bg-gray-800/50 rounded-lg px-3 py-2.5 text-center"
          layout
        >
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
            {stat.label}
          </div>
          <motion.div
            className="text-sm font-bold mt-0.5"
            style={{ color: methodInfo.color }}
            key={`${method}-${loraRank}-${stat.label}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {stat.value}
          </motion.div>
          <div className="text-[9px] text-gray-600 mt-0.5">{stat.detail}</div>
        </motion.div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------
// Memory comparison bar chart
// -------------------------------------------------------------------

function MemoryComparison() {
  const data = [
    { label: 'Full FT', memory: 320, color: '#ef4444', percent: 100 },
    { label: 'LoRA', memory: 18, color: '#3b82f6', percent: 5.6 },
    { label: 'QLoRA', memory: 10, color: '#22c55e', percent: 3.1 },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-400 mb-1">
        GPU Memory Required (70B Model)
      </div>
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs w-16 text-right font-mono" style={{ color: item.color }}>
            {item.label}
          </span>
          <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full flex items-center justify-end pr-2"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(item.percent, 6)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <span className="text-[9px] text-white font-bold whitespace-nowrap">
                {item.memory} GB
              </span>
            </motion.div>
          </div>
        </div>
      ))}
      <p className="text-[10px] text-gray-500 text-center mt-1">
        QLoRA uses 32x less memory than full fine-tuning
      </p>
    </div>
  );
}

// -------------------------------------------------------------------
// LoRA rank slider
// -------------------------------------------------------------------

function RankSlider({
  rank,
  onChange,
}: {
  rank: number;
  onChange: (rank: number) => void;
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-gray-400">LoRA Rank (r)</div>
        <span className="text-sm font-bold text-blue-400">r = {rank}</span>
      </div>
      <div className="flex gap-2 mb-3">
        {LORA_RANKS.map((r) => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all ${
              rank === r
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
        <div className="text-gray-500">Parameters:</div>
        <div className="text-gray-300 text-right">
          {rank <= 4 ? 'Fewer' : rank <= 16 ? 'Moderate' : 'More'} trainable
        </div>
        <div className="text-gray-500">Quality:</div>
        <div className="text-gray-300 text-right">
          {rank <= 4
            ? 'May underfit on complex tasks'
            : rank <= 16
            ? 'Good for most tasks'
            : 'Near full fine-tune quality'}
        </div>
        <div className="text-gray-500">Speed:</div>
        <div className="text-gray-300 text-right">
          {rank <= 4
            ? 'Fastest training'
            : rank <= 16
            ? 'Fast training'
            : 'Slower (still much faster than full FT)'}
        </div>
      </div>
      <div className="mt-2 text-[10px] text-gray-600 italic text-center">
        Most practitioners use rank 8 or 16. Rank 4 works well for simple domain adaptation.
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Weight decomposition visualization
// -------------------------------------------------------------------

function WeightDecomposition({ rank }: { rank: number }) {
  const matSize = 60;
  const innerW = Math.max(6, Math.round(rank * 1.5));

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="text-xs font-medium text-gray-400 mb-3 text-center">
        LoRA Weight Decomposition
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Original weight matrix W */}
        <div className="text-center">
          <div
            className="border-2 border-gray-600 rounded bg-gray-700/50 flex items-center justify-center"
            style={{ width: matSize, height: matSize }}
          >
            <span className="text-[9px] text-gray-400 font-mono">W</span>
          </div>
          <div className="text-[9px] text-gray-500 mt-1">Frozen</div>
          <div className="text-[8px] text-gray-600">d &times; d</div>
        </div>

        <span className="text-gray-500 text-sm font-bold">+</span>

        {/* Matrix A */}
        <div className="text-center">
          <div
            className="border-2 border-blue-500 rounded bg-blue-500/20 flex items-center justify-center"
            style={{ width: innerW, height: matSize }}
          >
            <span className="text-[9px] text-blue-300 font-mono">A</span>
          </div>
          <div className="text-[9px] text-blue-400 mt-1">Trained</div>
          <div className="text-[8px] text-blue-500">d &times; r</div>
        </div>

        <span className="text-gray-500 text-lg font-bold">&times;</span>

        {/* Matrix B */}
        <div className="text-center">
          <div
            className="border-2 border-blue-500 rounded bg-blue-500/20 flex items-center justify-center"
            style={{ width: matSize, height: innerW }}
          >
            <span className="text-[9px] text-blue-300 font-mono">B</span>
          </div>
          <div className="text-[9px] text-blue-400 mt-1">Trained</div>
          <div className="text-[8px] text-blue-500">r &times; d</div>
        </div>

        <span className="text-gray-500 text-sm font-bold">=</span>

        {/* Result */}
        <div className="text-center">
          <div
            className="border-2 border-green-500 rounded bg-green-500/10 flex items-center justify-center"
            style={{ width: matSize, height: matSize }}
          >
            <span className="text-[8px] text-green-300 font-mono">W+AB</span>
          </div>
          <div className="text-[9px] text-green-400 mt-1">Adapted</div>
          <div className="text-[8px] text-green-500">d &times; d</div>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="text-[10px] text-gray-500">
          With r={rank}: instead of training d&times;d = d&sup2; parameters,
          you train 2&times;d&times;{rank} = <strong className="text-blue-400">{rank * 2}d</strong> parameters
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

export default function PEFTSim() {
  const [selectedMethod, setSelectedMethod] = useState<Method>('lora');
  const [loraRank, setLoraRank] = useState(8);

  const currentMethod = METHODS.find((m) => m.id === selectedMethod)!;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        PEFT Parameter Efficiency Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Compare full fine-tuning, LoRA, and QLoRA side by side. Toggle between
        methods to see how many parameters are actually trained, and adjust the
        LoRA rank to explore the quality-efficiency tradeoff.
      </p>

      {/* Method toggle */}
      <div className="flex gap-2 mb-6">
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            className={`flex-1 text-sm px-3 py-2.5 rounded-lg font-semibold transition-all border-2 ${
              selectedMethod === method.id
                ? `${method.borderColor} text-white shadow-lg`
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
            style={
              selectedMethod === method.id
                ? { backgroundColor: `${method.color}20`, boxShadow: `0 4px 20px ${method.color}30` }
                : {}
            }
          >
            {method.label}
          </button>
        ))}
      </div>

      {/* Method description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMethod}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg px-4 py-3 mb-6 border-l-4"
          style={{ borderColor: currentMethod.color, backgroundColor: `${currentMethod.color}08` }}
        >
          <p className="text-sm text-gray-300">{currentMethod.description}</p>
        </motion.div>
      </AnimatePresence>

      {/* Main grid: Parameter viz + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <ParameterGrid method={selectedMethod} loraRank={loraRank} />
        </div>
        <div>
          <StatsPanel method={selectedMethod} loraRank={loraRank} />
        </div>
      </div>

      {/* LoRA rank slider (only for LoRA/QLoRA) */}
      <AnimatePresence>
        {(selectedMethod === 'lora' || selectedMethod === 'qlora') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <RankSlider rank={loraRank} onChange={setLoraRank} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weight decomposition (LoRA/QLoRA) */}
      <AnimatePresence>
        {(selectedMethod === 'lora' || selectedMethod === 'qlora') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <WeightDecomposition rank={loraRank} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory comparison */}
      <div className="bg-gray-800 rounded-lg p-4 mb-5">
        <MemoryComparison />
      </div>

      {/* Side-by-side all methods summary */}
      <div className="border border-gray-700 rounded-xl p-4 mb-5">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          When to Use Each Method
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <div className="text-xs font-semibold text-red-400 mb-2">Full Fine-tuning</div>
            <ul className="text-[10px] text-gray-400 space-y-1">
              <li>&bull; Maximum quality needed</li>
              <li>&bull; Unlimited GPU budget</li>
              <li>&bull; Major domain shift required</li>
              <li>&bull; Training from a small base model</li>
            </ul>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <div className="text-xs font-semibold text-blue-400 mb-2">LoRA</div>
            <ul className="text-[10px] text-gray-400 space-y-1">
              <li>&bull; Best quality-to-cost ratio</li>
              <li>&bull; Access to datacenter GPUs</li>
              <li>&bull; Need to swap adapters at inference</li>
              <li>&bull; Most production use cases</li>
            </ul>
          </div>
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
            <div className="text-xs font-semibold text-green-400 mb-2">QLoRA</div>
            <ul className="text-[10px] text-gray-400 space-y-1">
              <li>&bull; Consumer GPU (24-48 GB)</li>
              <li>&bull; Tight budget or experimentation</li>
              <li>&bull; Fine-tuning very large models</li>
              <li>&bull; Research and prototyping</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI connection */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong> LoRA and QLoRA
          are how most open-source model customizations happen today. When you see
          models like &ldquo;CodeLlama&rdquo; or &ldquo;Llama-Chat,&rdquo; many
          are built by applying LoRA adapters to a base model. A single base model
          can serve hundreds of different tasks by hot-swapping tiny adapter files
          &mdash; each just a few megabytes &mdash; at inference time.
        </p>
      </div>
    </div>
  );
}
