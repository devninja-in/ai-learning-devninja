'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Architecture data
// -------------------------------------------------------------------

interface ComponentBlock {
  id: string;
  name: string;
  category: 'position' | 'attention' | 'activation' | 'norm' | 'ffn' | 'other';
  shared: boolean; // true = common across models, false = unique innovation
  detail: string;
  whyUsed: string;
}

interface ModelArch {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  paramCount: string;
  contextLength: string;
  keyInnovation: string;
  components: ComponentBlock[];
}

const MODELS: ModelArch[] = [
  {
    id: 'llama3',
    name: 'Llama 3',
    color: '#3b82f6',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-400',
    paramCount: '8B / 70B / 405B',
    contextLength: '128K tokens',
    keyInnovation: 'GQA + SwiGLU + RoPE with larger vocab (128K tokens)',
    components: [
      {
        id: 'llama-input',
        name: 'Token Embedding',
        category: 'other',
        shared: true,
        detail: 'Maps input token IDs into dense vectors. Llama 3 uses a massive 128K vocabulary (up from 32K in Llama 2), giving it better multilingual and code tokenization coverage.',
        whyUsed: 'A larger vocabulary means fewer tokens per input, improving efficiency and reducing the chance of splitting common words awkwardly.',
      },
      {
        id: 'llama-rope',
        name: 'RoPE',
        category: 'position',
        shared: false,
        detail: 'Rotary Position Embedding encodes position by rotating query and key vectors using sinusoidal functions. Unlike learned position embeddings, RoPE naturally generalizes to sequence lengths not seen during training.',
        whyUsed: 'RoPE gives Llama 3 the ability to handle 128K context windows. It encodes relative position through rotation, so the model can extrapolate to longer sequences without retraining.',
      },
      {
        id: 'llama-rmsnorm-pre',
        name: 'RMSNorm (pre-norm)',
        category: 'norm',
        shared: false,
        detail: 'Root Mean Square Layer Normalization applied before each sub-layer. Unlike LayerNorm, it skips the mean subtraction step and only normalizes by the root mean square of activations.',
        whyUsed: 'Pre-norm with RMSNorm stabilizes training for very deep networks (Llama 3 405B has 126 layers). The simpler computation is also faster than full LayerNorm.',
      },
      {
        id: 'llama-gqa',
        name: 'Grouped Query Attention (GQA)',
        category: 'attention',
        shared: false,
        detail: 'GQA groups multiple query heads to share a single key-value head. For example, 8 query heads might share 1 KV head. This drastically reduces the size of the KV-cache during autoregressive inference.',
        whyUsed: 'At 70B+ parameters, the KV-cache becomes a massive memory bottleneck. GQA cuts KV-cache memory by 4-8x with negligible quality loss, enabling longer contexts and larger batch sizes.',
      },
      {
        id: 'llama-rmsnorm-post',
        name: 'RMSNorm (pre-FFN)',
        category: 'norm',
        shared: false,
        detail: 'A second RMSNorm applied before the feed-forward network. This is part of the pre-norm architecture where normalization happens before each sub-layer rather than after.',
        whyUsed: 'Pre-norm architecture is more stable during training than post-norm, especially at large scale. It helps prevent gradient explosion in very deep transformer stacks.',
      },
      {
        id: 'llama-swiglu',
        name: 'SwiGLU FFN',
        category: 'activation',
        shared: false,
        detail: 'SwiGLU replaces the standard ReLU or GELU activation in the feed-forward network. It uses a gated linear unit with the SiLU (Swish) activation: SwiGLU(x) = SiLU(xW1) * (xV). This adds a third weight matrix but improves performance.',
        whyUsed: 'SwiGLU consistently outperforms ReLU and GELU in transformer FFNs. The gating mechanism allows the network to learn which information to pass through, improving gradient flow and model quality.',
      },
      {
        id: 'llama-output',
        name: 'RMSNorm + Linear Head',
        category: 'other',
        shared: true,
        detail: 'Final RMSNorm followed by a linear projection to vocabulary size. The output logits are used with softmax to produce next-token probabilities.',
        whyUsed: 'Standard transformer output head. The final norm ensures stable magnitudes before the projection layer.',
      },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral / Mixtral',
    color: '#f59e0b',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-400',
    paramCount: '7B (Mistral) / 8x7B (Mixtral)',
    contextLength: '32K tokens',
    keyInnovation: 'Sliding Window Attention + Mixture of Experts (MoE)',
    components: [
      {
        id: 'mistral-input',
        name: 'Token Embedding',
        category: 'other',
        shared: true,
        detail: 'Standard token embedding layer mapping 32K vocabulary token IDs to dense vectors. Shared with the output projection (tied embeddings) in some variants.',
        whyUsed: 'Standard transformer input. The 32K vocabulary balances tokenization efficiency with embedding table size.',
      },
      {
        id: 'mistral-rope',
        name: 'RoPE',
        category: 'position',
        shared: false,
        detail: 'Same Rotary Position Embedding as Llama. Encodes position via rotation matrices applied to query and key vectors, providing relative position information.',
        whyUsed: 'Enables the model to handle long sequences and generalize to unseen lengths. RoPE has become the de facto standard for modern decoder-only transformers.',
      },
      {
        id: 'mistral-rmsnorm-pre',
        name: 'RMSNorm (pre-norm)',
        category: 'norm',
        shared: false,
        detail: 'Pre-norm RMSNorm applied before the attention layer. Same simplification as Llama -- normalizes by root mean square only, skipping mean subtraction.',
        whyUsed: 'Faster than LayerNorm with equivalent training stability. Pre-norm placement is critical for training deep transformer stacks.',
      },
      {
        id: 'mistral-swa',
        name: 'Sliding Window Attention',
        category: 'attention',
        shared: false,
        detail: 'Each token attends only to the previous W tokens (e.g., W=4096) instead of the full context. Information from beyond the window propagates through stacked layers -- layer 2 effectively sees 2W tokens, layer N sees N*W tokens.',
        whyUsed: 'Sliding window attention reduces the O(n^2) cost of full attention to O(n*W). Combined with GQA, it allows Mistral 7B to match or beat Llama 2 13B while being faster and cheaper to run.',
      },
      {
        id: 'mistral-rmsnorm-post',
        name: 'RMSNorm (pre-FFN)',
        category: 'norm',
        shared: false,
        detail: 'Second pre-norm RMSNorm applied before the feed-forward / MoE layer. Same as Llama architecture.',
        whyUsed: 'Stabilizes the input to the feed-forward network, preventing magnitude drift between attention and FFN sub-layers.',
      },
      {
        id: 'mistral-moe',
        name: 'MoE FFN (8 Experts)',
        category: 'ffn',
        shared: false,
        detail: 'Mixture of Experts: a router network selects the top-2 experts (out of 8 total FFN blocks) for each token. Each expert is a standard SwiGLU FFN. Only 2 experts activate per token, so compute stays near 7B despite having 8x7B = 46.7B total parameters.',
        whyUsed: 'MoE gives Mixtral the quality of a much larger dense model (comparable to Llama 2 70B) at the inference cost of a ~13B model. It is the most compute-efficient way to scale model capacity.',
      },
      {
        id: 'mistral-output',
        name: 'RMSNorm + Linear Head',
        category: 'other',
        shared: true,
        detail: 'Final normalization and projection to vocabulary logits. Standard transformer output.',
        whyUsed: 'Standard output head for next-token prediction.',
      },
    ],
  },
  {
    id: 'gemma',
    name: 'Gemma 2',
    color: '#22c55e',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-500',
    textColor: 'text-green-400',
    paramCount: '2B / 9B / 27B',
    contextLength: '8K tokens',
    keyInnovation: 'Alternating local/global attention + RMSNorm + logit soft-capping',
    components: [
      {
        id: 'gemma-input',
        name: 'Token Embedding (* sqrt(d))',
        category: 'other',
        shared: false,
        detail: 'Token embeddings are multiplied by the square root of the model dimension after lookup. This is an unusual choice -- most models do not scale embeddings this way.',
        whyUsed: 'Scaling by sqrt(d_model) normalizes the embedding magnitudes to match the expected scale of the subsequent layers, reducing the need for aggressive learning rate warmup.',
      },
      {
        id: 'gemma-rope',
        name: 'RoPE',
        category: 'position',
        shared: false,
        detail: 'Rotary Position Embedding, same fundamental approach as Llama and Mistral. Applied to query and key vectors to encode relative position information.',
        whyUsed: 'RoPE is the standard choice for modern decoder-only transformers. Gemma follows the same convention for position encoding.',
      },
      {
        id: 'gemma-rmsnorm-pre',
        name: 'RMSNorm (pre-norm)',
        category: 'norm',
        shared: false,
        detail: 'Pre-norm RMSNorm before attention, consistent with the modern transformer recipe. Gemma additionally applies RMSNorm to both pre- and post-attention (a "sandwich" norm in some configurations).',
        whyUsed: 'The combination of pre-norm and post-norm (sandwich normalization) provides extra training stability, which is especially useful for smaller models that are more sensitive to training dynamics.',
      },
      {
        id: 'gemma-attn',
        name: 'Alternating Local/Global Attention',
        category: 'attention',
        shared: false,
        detail: 'Gemma 2 alternates between local sliding window attention (window size 4096) and full global attention across layers. Even-numbered layers use local attention; odd-numbered layers use global attention.',
        whyUsed: 'This hybrid approach captures both fine-grained local patterns and long-range dependencies while keeping the average attention cost lower than full attention everywhere.',
      },
      {
        id: 'gemma-rmsnorm-post',
        name: 'RMSNorm (post-attention + pre-FFN)',
        category: 'norm',
        shared: false,
        detail: 'Gemma applies RMSNorm after the attention output AND before the FFN. This "sandwich" normalization wraps each sub-layer with normalization on both sides.',
        whyUsed: 'Double normalization (sandwich norm) helps stabilize training for models where precise control over activation magnitudes is critical, especially at smaller scales.',
      },
      {
        id: 'gemma-geglu',
        name: 'GEGLU FFN',
        category: 'activation',
        shared: false,
        detail: 'GEGLU uses the GELU activation inside a gated linear unit: GEGLU(x) = GELU(xW1) * (xV). It is similar to SwiGLU but uses GELU instead of SiLU for the gating function.',
        whyUsed: 'GEGLU is a close variant of SwiGLU with slightly different gating characteristics. Google has found it works well in their training setup. The practical difference from SwiGLU is minimal.',
      },
      {
        id: 'gemma-output',
        name: 'RMSNorm + Soft-Capped Logits',
        category: 'other',
        shared: false,
        detail: 'Final RMSNorm followed by linear projection. Gemma 2 applies logit soft-capping: logits are passed through tanh and scaled to prevent any single logit from dominating. This bounds the output range.',
        whyUsed: 'Soft-capping prevents overconfident predictions and improves calibration. It acts as a built-in temperature control, making the model less prone to degenerate repetitive outputs.',
      },
    ],
  },
];

// -------------------------------------------------------------------
// Category colors
// -------------------------------------------------------------------

const CATEGORY_COLORS: Record<ComponentBlock['category'], { bg: string; text: string; label: string }> = {
  position: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Position' },
  attention: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Attention' },
  activation: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Activation' },
  norm: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Normalization' },
  ffn: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Feed-Forward' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Other' },
};

// -------------------------------------------------------------------
// Component Block
// -------------------------------------------------------------------

function ArchBlock({
  block,
  modelColor,
  isSelected,
  onClick,
}: {
  block: ComponentBlock;
  modelColor: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cat = CATEGORY_COLORS[block.category];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left rounded-lg px-3 py-2.5 transition-all border-2 ${
        isSelected
          ? 'ring-2 ring-offset-1 ring-offset-gray-900'
          : 'hover:brightness-110'
      } ${block.shared ? 'border-gray-600 bg-gray-800/60' : ''}`}
      style={{
        ...(block.shared
          ? isSelected
            ? { borderColor: modelColor }
            : {}
          : {
              borderColor: isSelected ? modelColor : `${modelColor}66`,
              backgroundColor: `${modelColor}15`,
            }),
        ...(isSelected ? { ['--tw-ring-color' as string]: modelColor } : {}),
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-white truncate">
          {block.name}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded ${cat.bg} ${cat.text} font-medium whitespace-nowrap`}>
          {cat.label}
        </span>
      </div>
      {block.shared && (
        <span className="text-[9px] text-gray-500 mt-0.5 block">shared</span>
      )}
    </motion.button>
  );
}

// -------------------------------------------------------------------
// Stats Panel
// -------------------------------------------------------------------

function StatsPanel({ model }: { model: ModelArch }) {
  return (
    <div
      className="rounded-lg p-4 border"
      style={{
        borderColor: `${model.color}40`,
        backgroundColor: `${model.color}08`,
      }}
    >
      <h4 className="text-sm font-semibold mb-3" style={{ color: model.color }}>
        {model.name} Stats
      </h4>
      <div className="space-y-2">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Parameters</div>
          <div className="text-sm text-white font-mono">{model.paramCount}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Context Length</div>
          <div className="text-sm text-white font-mono">{model.contextLength}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Key Innovation</div>
          <div className="text-xs text-gray-300 leading-relaxed">{model.keyInnovation}</div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Detail Panel
// -------------------------------------------------------------------

function DetailPanel({
  block,
  modelName,
  modelColor,
}: {
  block: ComponentBlock;
  modelName: string;
  modelColor: string;
}) {
  const cat = CATEGORY_COLORS[block.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl p-5 border"
      style={{
        borderColor: `${modelColor}40`,
        backgroundColor: `${modelColor}08`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-bold px-2 py-1 rounded"
          style={{ backgroundColor: `${modelColor}30`, color: modelColor }}
        >
          {modelName}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
          {cat.label}
        </span>
      </div>

      <h4 className="text-base font-semibold text-white mb-2">{block.name}</h4>

      <div className="space-y-3">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">What it does</div>
          <p className="text-sm text-gray-300 leading-relaxed">{block.detail}</p>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Why {modelName} uses it
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{block.whyUsed}</p>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------

export default function ModelInternalsSim() {
  const [selectedBlock, setSelectedBlock] = useState<{
    modelId: string;
    blockId: string;
  } | null>(null);

  const handleBlockClick = useCallback((modelId: string, blockId: string) => {
    setSelectedBlock((prev) =>
      prev?.modelId === modelId && prev?.blockId === blockId
        ? null
        : { modelId, blockId }
    );
  }, []);

  const selectedModel = selectedBlock
    ? MODELS.find((m) => m.id === selectedBlock.modelId)
    : null;
  const selectedComponent = selectedModel
    ? selectedModel.components.find((c) => c.id === selectedBlock!.blockId)
    : null;

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Architecture Comparison Tool
      </h3>
      <p className="text-sm text-gray-400 mb-2">
        Compare how Llama 3, Mistral/Mixtral, and Gemma 2 build on the vanilla
        transformer. Click any component to see what it does and why.
      </p>
      <p className="text-[11px] text-gray-500 mb-5">
        <span className="inline-block w-2 h-2 rounded-sm bg-gray-600 mr-1 align-middle" />
        Gray border = shared across models &nbsp;
        <span className="inline-block w-2 h-2 rounded-sm bg-blue-500/40 mr-1 align-middle" />
        Colored = unique innovation
      </p>

      {/* Architecture columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {MODELS.map((model) => (
          <div key={model.id}>
            {/* Model header */}
            <div
              className="text-center rounded-t-lg px-4 py-3 border-b-2"
              style={{
                backgroundColor: `${model.color}15`,
                borderColor: model.color,
              }}
            >
              <h4 className="text-sm font-bold" style={{ color: model.color }}>
                {model.name}
              </h4>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {model.paramCount}
              </div>
            </div>

            {/* Component stack */}
            <div className="space-y-1.5 mt-2">
              {model.components.map((block) => (
                <ArchBlock
                  key={block.id}
                  block={block}
                  modelColor={model.color}
                  isSelected={
                    selectedBlock?.modelId === model.id &&
                    selectedBlock?.blockId === block.id
                  }
                  onClick={() => handleBlockClick(model.id, block.id)}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="mt-3">
              <StatsPanel model={model} />
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedComponent && selectedModel && (
          <DetailPanel
            key={`${selectedModel.id}-${selectedComponent.id}`}
            block={selectedComponent}
            modelName={selectedModel.name}
            modelColor={selectedModel.color}
          />
        )}
      </AnimatePresence>

      {!selectedBlock && (
        <div className="text-center py-6 text-gray-600">
          <p className="text-sm">
            Click any component block above to see a detailed explanation of what
            it does and why this architecture uses it.
          </p>
        </div>
      )}

      {/* Comparison insight */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">Key pattern:</strong>{' '}
          All three models use the same skeleton &mdash; token embedding, position
          encoding, repeated (norm + attention + norm + FFN) blocks, and a final
          projection head. The innovations are in <em>what goes inside</em> each
          slot: RoPE for position, GQA or sliding window for attention, SwiGLU or
          GEGLU for the FFN, and RMSNorm everywhere instead of LayerNorm. These
          targeted upgrades compound into models that are dramatically better than
          the original 2017 transformer.
        </p>
      </div>
    </div>
  );
}
