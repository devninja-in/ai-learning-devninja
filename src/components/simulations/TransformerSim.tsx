'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

type BlockMode = 'encoder' | 'decoder';

interface LayerInfo {
  id: string;
  label: string;
  description: string;
  dimensions: string;
  color: string;
  borderColor: string;
  /** If true, this layer has a residual connection that skips around it */
  residualStart?: boolean;
  /** If true, this layer is the Add & Norm that closes a residual connection */
  residualEnd?: boolean;
  /** Only shown in decoder mode */
  decoderOnly?: boolean;
}

// -------------------------------------------------------------------
// Layer definitions
// -------------------------------------------------------------------

const ENCODER_LAYERS: LayerInfo[] = [
  {
    id: 'input',
    label: 'Input Tokens',
    description:
      'Raw token IDs from the tokenizer. Each token is an integer index into the vocabulary. For example, "The cat sat" might become [464, 3797, 3332].',
    dimensions: '[batch, seq_len]',
    color: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  {
    id: 'embedding',
    label: 'Token Embedding + Positional Encoding',
    description:
      'Each token ID is mapped to a dense vector (the embedding), then a positional encoding vector is added so the model knows word order. Without positional encoding, "dog bites man" and "man bites dog" would look identical to attention.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  {
    id: 'mha',
    label: 'Multi-Head Self-Attention',
    description:
      'Each token attends to every other token in the sequence. The input is projected into Q, K, V matrices, split across multiple heads, and attention is computed in parallel. Heads learn different relationship patterns (syntax, coreference, semantics).',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
    residualStart: true,
  },
  {
    id: 'addnorm1',
    label: 'Add & Layer Norm',
    description:
      'Residual connection: the input to the attention layer is added back to its output (skip connection). Then layer normalization standardizes each position to zero mean and unit variance. This keeps gradients healthy and training stable.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
    residualEnd: true,
  },
  {
    id: 'ffn',
    label: 'Feed-Forward Network',
    description:
      'Two linear layers with a ReLU (or GELU) activation in between. Applied independently to each position. Typically expands to 4x the model dimension then projects back: d_model -> 4*d_model -> d_model. This is where the model "thinks" and stores factual knowledge.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#a855f7',
    residualStart: true,
  },
  {
    id: 'addnorm2',
    label: 'Add & Layer Norm',
    description:
      'Another residual connection + layer norm, this time around the feed-forward block. The pattern of "sublayer -> add input -> normalize" repeats throughout the transformer, creating a highway for gradients to flow backward during training.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
    residualEnd: true,
  },
  {
    id: 'output',
    label: 'Block Output',
    description:
      'The refined representation after one transformer block. In practice, this output becomes the input to the next block. Real models stack 6 to 96 of these blocks, each further refining the representation.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(236, 72, 153, 0.15)',
    borderColor: '#ec4899',
  },
];

const DECODER_LAYERS: LayerInfo[] = [
  {
    id: 'input',
    label: 'Input Tokens',
    description:
      'Token IDs for the output sequence generated so far. During generation, the decoder processes all previously generated tokens to predict the next one.',
    dimensions: '[batch, seq_len]',
    color: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  {
    id: 'embedding',
    label: 'Token Embedding + Positional Encoding',
    description:
      'Same as the encoder: embed each token and add positional information. The decoder needs to know the order of the tokens it has generated so far.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  {
    id: 'masked-mha',
    label: 'Masked Multi-Head Self-Attention',
    description:
      'Like encoder self-attention, but with a causal mask: each token can only attend to itself and previous tokens, not future ones. This prevents the decoder from "cheating" by looking ahead during training. GPT-style models use only this type of attention.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
    residualStart: true,
    decoderOnly: true,
  },
  {
    id: 'addnorm1',
    label: 'Add & Layer Norm',
    description:
      'Residual connection + layer norm after the masked self-attention. Same stabilization mechanism as in the encoder.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
    residualEnd: true,
    decoderOnly: true,
  },
  {
    id: 'cross-attn',
    label: 'Cross-Attention',
    description:
      'Queries come from the decoder, but Keys and Values come from the encoder output. This is how the decoder "looks at" the source sequence. In a translation model, this connects the English decoder to the French encoder. Decoder-only models (GPT, Claude) skip this layer entirely.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
    residualStart: true,
    decoderOnly: true,
  },
  {
    id: 'addnorm2',
    label: 'Add & Layer Norm',
    description:
      'Residual connection + layer norm after the cross-attention layer.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
    residualEnd: true,
    decoderOnly: true,
  },
  {
    id: 'ffn',
    label: 'Feed-Forward Network',
    description:
      'Same architecture as the encoder FFN: two linear layers with activation. Independent per position. The decoder FFN also uses d_model -> 4*d_model -> d_model.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#a855f7',
    residualStart: true,
  },
  {
    id: 'addnorm3',
    label: 'Add & Layer Norm',
    description:
      'Final residual connection + layer norm in the decoder block.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(34, 197, 94, 0.15)',
    borderColor: '#22c55e',
    residualEnd: true,
  },
  {
    id: 'output',
    label: 'Block Output',
    description:
      'The decoder block output. After the final decoder block, a linear layer + softmax produces a probability distribution over the vocabulary for the next token prediction.',
    dimensions: '[batch, seq_len, d_model]',
    color: 'rgba(236, 72, 153, 0.15)',
    borderColor: '#ec4899',
  },
];

// -------------------------------------------------------------------
// Animated data dot
// -------------------------------------------------------------------

interface DataDotProps {
  startY: number;
  endY: number;
  delay: number;
  color: string;
  xOffset: number;
}

function DataDot({ startY, endY, delay, color, xOffset }: DataDotProps) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 8,
        height: 8,
        left: `calc(50% + ${xOffset}px)`,
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
      }}
      initial={{ top: startY, opacity: 0 }}
      animate={{
        top: [startY, endY],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: 'linear',
        times: [0, 0.05, 0.9, 1],
      }}
    />
  );
}

// -------------------------------------------------------------------
// Residual connection arrow
// -------------------------------------------------------------------

interface ResidualArrowProps {
  startY: number;
  endY: number;
  side: 'left' | 'right';
  containerWidth: number;
  highlighted: boolean;
}

function ResidualArrow({ startY, endY, side, containerWidth, highlighted }: ResidualArrowProps) {
  const offset = side === 'left' ? -20 : containerWidth + 20;
  const curveOffset = side === 'left' ? -35 : containerWidth + 35;

  const path = `M ${offset} ${startY} C ${curveOffset} ${startY}, ${curveOffset} ${endY}, ${offset} ${endY}`;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: containerWidth + 60, height: '100%', left: -30, overflow: 'visible' }}
    >
      <motion.path
        d={path}
        fill="none"
        stroke={highlighted ? '#22c55e' : '#4b5563'}
        strokeWidth={highlighted ? 2.5 : 1.5}
        strokeDasharray="6 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: highlighted ? 0.9 : 0.4 }}
        transition={{ duration: 0.6 }}
      />
      {/* Arrowhead */}
      <motion.polygon
        points={`${offset},${endY - 5} ${offset + (side === 'left' ? 6 : -6)},${endY} ${offset},${endY + 5}`}
        fill={highlighted ? '#22c55e' : '#4b5563'}
        initial={{ opacity: 0 }}
        animate={{ opacity: highlighted ? 0.9 : 0.4 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      />
    </svg>
  );
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

export default function TransformerSim() {
  const [mode, setMode] = useState<BlockMode>('encoder');
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dots, setDots] = useState<DataDotProps[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const layers = mode === 'encoder' ? ENCODER_LAYERS : DECODER_LAYERS;

  // Reset selection when mode changes
  useEffect(() => {
    setSelectedLayer(null);
    setIsProcessing(false);
    setDots([]);
  }, [mode]);

  const handleLayerClick = useCallback((id: string) => {
    setSelectedLayer((prev) => (prev === id ? null : id));
  }, []);

  // Process animation: send colored dots traveling through the layers
  const handleProcess = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedLayer(null);

    const container = containerRef.current;
    if (!container) {
      setIsProcessing(false);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const newDots: DataDotProps[] = [];
    const colors = ['#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#ec4899'];

    // Create dots for each layer transition
    layers.forEach((layer, i) => {
      const el = layerRefs.current.get(layer.id + '-' + i);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const startY = rect.top - containerRect.top;
      const endY = rect.bottom - containerRect.top;

      // 3 dots per layer transition, slightly staggered
      for (let d = 0; d < 3; d++) {
        newDots.push({
          startY: Math.max(0, startY - 10),
          endY: endY + 10,
          delay: i * 0.3 + d * 0.08,
          color: colors[i % colors.length],
          xOffset: (d - 1) * 12,
        });
      }
    });

    setDots(newDots);

    // Clear after animation
    const totalDuration = layers.length * 0.3 + 2.8;
    const timer = setTimeout(() => {
      setIsProcessing(false);
      setDots([]);
    }, totalDuration * 1000);

    return () => clearTimeout(timer);
  }, [isProcessing, layers]);

  // Compute residual connection positions
  const [residualPairs, setResidualPairs] = useState<
    { startY: number; endY: number; side: 'left' | 'right'; key: string; layerIds: string[] }[]
  >([]);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    function computeResiduals() {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      setContainerWidth(containerRect.width);

      const pairs: typeof residualPairs = [];
      let sideToggle: 'left' | 'right' = 'right';
      let residualStartY: number | null = null;
      let residualStartId: string | null = null;

      layers.forEach((layer, i) => {
        const el = layerRefs.current.get(layer.id + '-' + i);
        if (!el) return;
        const rect = el.getBoundingClientRect();

        if (layer.residualStart) {
          residualStartY = rect.top - containerRect.top + rect.height / 2;
          residualStartId = layer.id;
        }
        if (layer.residualEnd && residualStartY !== null && residualStartId !== null) {
          pairs.push({
            startY: residualStartY,
            endY: rect.top - containerRect.top + rect.height / 2,
            side: sideToggle,
            key: `${residualStartId}-${layer.id}-${i}`,
            layerIds: [residualStartId, layer.id],
          });
          sideToggle = sideToggle === 'right' ? 'left' : 'right';
          residualStartY = null;
          residualStartId = null;
        }
      });

      setResidualPairs(pairs);
    }

    // Small delay to let layout settle
    const timer = setTimeout(computeResiduals, 100);
    window.addEventListener('resize', computeResiduals);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', computeResiduals);
    };
  }, [layers, mode]);

  const selectedLayerInfo = selectedLayer
    ? layers.find((l) => l.id === selectedLayer)
    : null;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Transformer Block Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Click any layer to learn what it does. Toggle between Encoder and Decoder to see the
        architectural differences. Hit &quot;Process&quot; to watch data flow through the block.
      </p>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Mode toggle */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2">
            Block Type
          </label>
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => setMode('encoder')}
              className={`text-sm px-4 py-2 font-medium transition-colors ${
                mode === 'encoder'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Encoder
            </button>
            <button
              onClick={() => setMode('decoder')}
              className={`text-sm px-4 py-2 font-medium transition-colors ${
                mode === 'decoder'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Decoder
            </button>
          </div>
        </div>

        {/* Process button */}
        <div className="flex items-end">
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className={`text-sm px-5 py-2 rounded-lg font-medium transition-all ${
              isProcessing
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
        </div>
      </div>

      {/* Layer stack */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Visual stack */}
        <div className="flex-1 relative" ref={containerRef}>
          {/* Residual connection arrows */}
          {residualPairs.map((pair) => (
            <ResidualArrow
              key={pair.key}
              startY={pair.startY}
              endY={pair.endY}
              side={pair.side}
              containerWidth={containerWidth}
              highlighted={
                selectedLayer !== null &&
                pair.layerIds.some((id) =>
                  layers.find((l) => l.id === selectedLayer)?.residualStart
                    ? id === selectedLayer
                    : layers.find((l) => l.id === selectedLayer)?.residualEnd
                    ? id === selectedLayer
                    : false
                )
              }
            />
          ))}

          {/* Animated dots */}
          <AnimatePresence>
            {isProcessing &&
              dots.map((dot, i) => (
                <DataDot key={`dot-${i}`} {...dot} />
              ))}
          </AnimatePresence>

          {/* Layer boxes */}
          <div className="space-y-2 relative z-10">
            {layers.map((layer, i) => {
              const isSelected = selectedLayer === layer.id;
              return (
                <motion.div
                  key={`${mode}-${layer.id}-${i}`}
                  ref={(el) => {
                    if (el) layerRefs.current.set(layer.id + '-' + i, el);
                  }}
                  onClick={() => handleLayerClick(layer.id)}
                  className="cursor-pointer select-none"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className={`
                      relative rounded-lg px-4 py-3 border-2 transition-all duration-200
                      ${isSelected
                        ? 'ring-2 ring-white/30 shadow-lg'
                        : 'hover:brightness-125'
                      }
                    `}
                    style={{
                      backgroundColor: layer.color,
                      borderColor: isSelected ? '#ffffff' : layer.borderColor,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="font-medium text-sm"
                        style={{ color: layer.borderColor }}
                      >
                        {layer.label}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        {layer.dimensions}
                      </span>
                    </div>

                    {/* Decoder-only badge */}
                    {layer.decoderOnly && (
                      <span className="absolute -right-1 -top-1 text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                        Decoder
                      </span>
                    )}

                    {/* Residual indicators */}
                    {layer.residualStart && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500" />
                    )}
                    {layer.residualEnd && (
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-500/30" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Central flow arrow */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 -z-0" />
        </div>

        {/* Info panel */}
        <div className="lg:w-80 lg:min-w-[320px]">
          <AnimatePresence mode="wait">
            {selectedLayerInfo ? (
              <motion.div
                key={selectedLayer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800 rounded-lg p-5 border border-gray-700"
              >
                <h4
                  className="font-semibold text-sm mb-3"
                  style={{ color: selectedLayerInfo.borderColor }}
                >
                  {selectedLayerInfo.label}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  {selectedLayerInfo.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Tensor shape:</span>
                  <code className="text-xs font-mono text-emerald-400 bg-gray-900 px-2 py-1 rounded">
                    {selectedLayerInfo.dimensions}
                  </code>
                </div>

                {/* Residual connection note */}
                {(selectedLayerInfo.residualStart || selectedLayerInfo.residualEnd) && (
                  <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs text-green-300">
                      {selectedLayerInfo.residualStart
                        ? 'Residual connection starts here. The input to this layer is saved and will be added back after processing.'
                        : 'Residual connection ends here. The saved input is added back to the output, creating a shortcut path for gradients.'}
                    </p>
                  </div>
                )}

                {/* Decoder-only note */}
                {selectedLayerInfo.decoderOnly && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-300">
                      This layer is specific to the decoder architecture. Encoder-only
                      models (like BERT) do not include this layer.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-800/50 rounded-lg p-5 border border-gray-700/50 text-center"
              >
                <p className="text-sm text-gray-500">
                  Click a layer to see details about what it does and how data flows through it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <h4 className="text-xs font-medium text-gray-400 mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500">Residual connection start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-500/30" />
                <span className="text-xs text-gray-500">Residual connection end (Add & Norm)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 border-t-2 border-dashed border-gray-500" />
                <span className="text-xs text-gray-500">Skip connection path</span>
              </div>
              {mode === 'decoder' && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                    Decoder
                  </span>
                  <span className="text-xs text-gray-500">Decoder-only layers</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Architecture comparison hint */}
      <div className="mt-5 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          <strong className="text-blue-200">Try this:</strong>{' '}
          Switch between Encoder and Decoder to compare the architectures. Notice how the
          decoder adds <strong>masked self-attention</strong> (so it cannot peek at future tokens)
          and <strong>cross-attention</strong> (to look at the encoder&apos;s output).
          GPT and Claude use decoder-only architectures; BERT uses encoder-only.
        </p>
      </div>
    </div>
  );
}
