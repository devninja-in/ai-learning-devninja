'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Precision = 'fp32' | 'fp16' | 'int8' | 'int4';

interface PrecisionInfo {
  key: Precision;
  label: string;
  bits: number;
  modelSize: number; // GB for a 70B parameter model
  speed: number; // relative (1-4x)
  quality: number; // relative score (0-100)
  color: string;
}

const precisions: PrecisionInfo[] = [
  {
    key: 'fp32',
    label: 'FP32 (32-bit)',
    bits: 32,
    modelSize: 280,
    speed: 1,
    quality: 100,
    color: '#3b82f6', // blue
  },
  {
    key: 'fp16',
    label: 'FP16 (16-bit)',
    bits: 16,
    modelSize: 140,
    speed: 2,
    quality: 99,
    color: '#8b5cf6', // purple
  },
  {
    key: 'int8',
    label: 'INT8 (8-bit)',
    bits: 8,
    modelSize: 70,
    speed: 3,
    quality: 95,
    color: '#f59e0b', // amber
  },
  {
    key: 'int4',
    label: 'INT4 (4-bit)',
    bits: 4,
    modelSize: 35,
    speed: 4,
    quality: 92,
    color: '#10b981', // green
  },
];

// Quantize a float value to a given precision
function quantizeValue(value: number, precision: Precision): number {
  if (precision === 'fp32') return value;
  if (precision === 'fp16') {
    // FP16 has ~3 decimal digits of precision
    return Math.round(value * 1000) / 1000;
  }
  if (precision === 'int8') {
    // Map to [-128, 127] then back
    const scaled = Math.round(value * 127);
    return scaled / 127;
  }
  if (precision === 'int4') {
    // Map to [-8, 7] then back
    const scaled = Math.round(value * 7);
    return scaled / 7;
  }
  return value;
}

export default function QuantizationSim() {
  const [selectedPrecision, setSelectedPrecision] = useState<Precision>('fp32');
  const [floatValue, setFloatValue] = useState(0.3847);

  const selectedInfo = precisions.find((p) => p.key === selectedPrecision)!;
  const quantizedValue = quantizeValue(floatValue, selectedPrecision);
  const error = Math.abs(floatValue - quantizedValue);

  // Sample weights grid (3x4) that lose resolution
  const sampleWeights = [
    0.8234, -0.4521, 0.1567, -0.9012,
    0.3421, -0.6789, 0.5234, 0.0987,
    -0.2145, 0.7654, -0.3987, 0.6123,
  ];

  const maxSize = Math.max(...precisions.map((p) => p.modelSize));
  const maxSpeed = Math.max(...precisions.map((p) => p.speed));

  return (
    <div className="border border-gray-700 rounded-xl p-6 bg-gray-900">
      <h3 className="text-lg font-semibold text-white mb-6">
        Precision vs Quality Trade-off
      </h3>

      {/* Precision selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {precisions.map((prec) => (
          <button
            key={prec.key}
            onClick={() => setSelectedPrecision(prec.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPrecision === prec.key
                ? 'text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            style={
              selectedPrecision === prec.key
                ? { backgroundColor: prec.color }
                : {}
            }
          >
            {prec.label}
          </button>
        ))}
      </div>

      {/* Number line visualization */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">
            Value quantization
          </span>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.001"
            value={floatValue}
            onChange={(e) => setFloatValue(parseFloat(e.target.value))}
            className="w-48"
          />
        </div>

        <div className="relative h-20 mb-4">
          {/* Number line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600" />
          <div className="absolute top-1/2 left-0 w-0.5 h-3 bg-gray-500 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-gray-500 -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-0 w-0.5 h-3 bg-gray-500 -translate-y-1/2" />

          <div className="absolute -bottom-6 left-0 text-xs text-gray-500">-1.0</div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">0.0</div>
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">1.0</div>

          {/* Original value marker */}
          <motion.div
            className="absolute top-0"
            style={{ left: `${((floatValue + 1) / 2) * 100}%` }}
            initial={false}
            animate={{ left: `${((floatValue + 1) / 2) * 100}%` }}
          >
            <div className="relative -translate-x-1/2">
              <div className="w-1 h-8 bg-blue-400 rounded-full" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-blue-400 font-mono">
                Original: {floatValue.toFixed(4)}
              </div>
            </div>
          </motion.div>

          {/* Quantized value marker */}
          {error > 0.001 && (
            <motion.div
              className="absolute top-0"
              style={{ left: `${((quantizedValue + 1) / 2) * 100}%` }}
              initial={false}
              animate={{ left: `${((quantizedValue + 1) / 2) * 100}%` }}
            >
              <div className="relative -translate-x-1/2">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: selectedInfo.color }} />
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono"
                  style={{ color: selectedInfo.color }}
                >
                  Quantized: {quantizedValue.toFixed(4)}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <strong className="text-white">Error:</strong>{' '}
            {error > 0.0001 ? error.toFixed(4) : '< 0.0001'}
            {error > 0.1 && ' (significant precision loss)'}
          </div>
        </div>
      </div>

      {/* Model stats panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Model Size</div>
          <div className="text-2xl font-bold text-white">{selectedInfo.modelSize}GB</div>
          <div className="text-xs text-gray-500 mt-1">70B params</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Inference Speed</div>
          <div className="text-2xl font-bold text-white">{selectedInfo.speed}x</div>
          <div className="text-xs text-gray-500 mt-1">vs FP32</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Quality Score</div>
          <div className="text-2xl font-bold text-white">{selectedInfo.quality}</div>
          <div className="text-xs text-gray-500 mt-1">out of 100</div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Bits per Weight</div>
          <div className="text-2xl font-bold text-white">{selectedInfo.bits}</div>
          <div className="text-xs text-gray-500 mt-1">precision</div>
        </div>
      </div>

      {/* Comparison bar chart */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h4 className="text-sm font-medium text-white mb-4">Comparison across precisions</h4>

        <div className="space-y-4">
          {/* Size comparison */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Model Size (lower is better)</div>
            <div className="space-y-1.5">
              {precisions.map((prec) => (
                <div key={prec.key} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-24">{prec.label}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(prec.modelSize / maxSize) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: prec.color }}
                    >
                      <span className="text-xs font-medium text-white">{prec.modelSize}GB</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speed comparison */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Inference Speed (higher is better)</div>
            <div className="space-y-1.5">
              {precisions.map((prec) => (
                <div key={prec.key} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-24">{prec.label}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(prec.speed / maxSpeed) * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: prec.color }}
                    >
                      <span className="text-xs font-medium text-white">{prec.speed}x</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality comparison */}
          <div>
            <div className="text-xs text-gray-400 mb-2">Quality Score (higher is better)</div>
            <div className="space-y-1.5">
              {precisions.map((prec) => (
                <div key={prec.key} className="flex items-center gap-3">
                  <div className="text-xs text-gray-400 w-24">{prec.label}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${prec.quality}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full flex items-center justify-end pr-2"
                      style={{ backgroundColor: prec.color }}
                    >
                      <span className="text-xs font-medium text-white">{prec.quality}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sample weights grid */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-sm font-medium text-white mb-4">
          Sample weight values at {selectedInfo.label}
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {sampleWeights.map((weight, idx) => {
            const quantized = quantizeValue(weight, selectedPrecision);
            return (
              <div
                key={idx}
                className="bg-gray-700 rounded px-3 py-2 text-center"
              >
                <div className="text-xs font-mono text-white">
                  {quantized.toFixed(4)}
                </div>
                {Math.abs(weight - quantized) > 0.001 && (
                  <div className="text-xs text-gray-500 mt-1">
                    &Delta; {Math.abs(weight - quantized).toFixed(3)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-gray-400">
          Notice how lower precision loses decimal resolution, especially in INT4 where values snap to fixed steps.
        </div>
      </div>
    </div>
  );
}
