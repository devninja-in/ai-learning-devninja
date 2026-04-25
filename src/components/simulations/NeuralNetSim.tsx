'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Pre-defined weights (hardcoded, not random)
const WEIGHTS_INPUT_HIDDEN = [
  [0.5, -0.3, 0.8],   // input 1 → hidden 1, 2, 3
  [0.2, 0.7, -0.4],   // input 2 → hidden 1, 2, 3
];
const WEIGHTS_HIDDEN_OUTPUT = [0.6, -0.5, 0.9];
const BIASES_HIDDEN = [-0.1, 0.2, -0.3];
const BIAS_OUTPUT = 0.1;

function relu(x: number): number {
  return Math.max(0, x);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function forwardPass(input1: number, input2: number) {
  // Hidden layer: ReLU(W * x + b)
  const hiddenRaw = [
    WEIGHTS_INPUT_HIDDEN[0][0] * input1 + WEIGHTS_INPUT_HIDDEN[1][0] * input2 + BIASES_HIDDEN[0],
    WEIGHTS_INPUT_HIDDEN[0][1] * input1 + WEIGHTS_INPUT_HIDDEN[1][1] * input2 + BIASES_HIDDEN[1],
    WEIGHTS_INPUT_HIDDEN[0][2] * input1 + WEIGHTS_INPUT_HIDDEN[1][2] * input2 + BIASES_HIDDEN[2],
  ];
  const hiddenActivations = hiddenRaw.map(relu);

  // Output layer: sigmoid(W * h + b)
  const outputRaw =
    WEIGHTS_HIDDEN_OUTPUT[0] * hiddenActivations[0] +
    WEIGHTS_HIDDEN_OUTPUT[1] * hiddenActivations[1] +
    WEIGHTS_HIDDEN_OUTPUT[2] * hiddenActivations[2] +
    BIAS_OUTPUT;
  const output = sigmoid(outputRaw);

  return { hiddenActivations, output };
}

// SVG layout constants
const SVG_WIDTH = 500;
const SVG_HEIGHT = 300;
const LAYER_X = [80, 250, 420]; // x positions for input, hidden, output layers
const INPUT_Y = [110, 190];     // y positions for 2 input nodes
const HIDDEN_Y = [75, 150, 225]; // y positions for 3 hidden nodes
const OUTPUT_Y = [150];          // y position for 1 output node
const NODE_RADIUS = 18;

function getConnectionColor(weight: number): string {
  return weight >= 0 ? '#3b82f6' : '#ef4444'; // blue for positive, red for negative
}

function getConnectionWidth(weight: number): number {
  return Math.max(1, Math.abs(weight) * 4);
}

export default function NeuralNetSim() {
  const [input1, setInput1] = useState(0.5);
  const [input2, setInput2] = useState(0.5);

  const { hiddenActivations, output } = useMemo(
    () => forwardPass(input1, input2),
    [input1, input2]
  );

  // Build connection data: input → hidden
  const inputHiddenConnections = [];
  for (let i = 0; i < 2; i++) {
    for (let h = 0; h < 3; h++) {
      inputHiddenConnections.push({
        x1: LAYER_X[0] + NODE_RADIUS,
        y1: INPUT_Y[i],
        x2: LAYER_X[1] - NODE_RADIUS,
        y2: HIDDEN_Y[h],
        weight: WEIGHTS_INPUT_HIDDEN[i][h],
      });
    }
  }

  // Build connection data: hidden → output
  const hiddenOutputConnections = [];
  for (let h = 0; h < 3; h++) {
    hiddenOutputConnections.push({
      x1: LAYER_X[1] + NODE_RADIUS,
      y1: HIDDEN_Y[h],
      x2: LAYER_X[2] - NODE_RADIUS,
      y2: OUTPUT_Y[0],
      weight: WEIGHTS_HIDDEN_OUTPUT[h],
    });
  }

  const outputBarWidth = 200;
  const outputColor = output > 0.5 ? '#22c55e' : output > 0.3 ? '#eab308' : '#ef4444';

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Input 1</label>
            <span className="text-sm font-mono text-blue-400">{input1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={input1}
            onChange={(e) => setInput1(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Input 2</label>
            <span className="text-sm font-mono text-blue-400">{input2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={input2}
            onChange={(e) => setInput2(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Network SVG */}
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto"
        style={{ maxHeight: '300px' }}
      >
        {/* Input → Hidden connections */}
        {inputHiddenConnections.map((conn, i) => (
          <motion.line
            key={`ih-${i}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke={getConnectionColor(conn.weight)}
            strokeWidth={getConnectionWidth(conn.weight)}
            strokeOpacity={0.6}
          />
        ))}

        {/* Hidden → Output connections */}
        {hiddenOutputConnections.map((conn, i) => (
          <motion.line
            key={`ho-${i}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke={getConnectionColor(conn.weight)}
            strokeWidth={getConnectionWidth(conn.weight)}
            strokeOpacity={0.6}
          />
        ))}

        {/* Layer labels */}
        <text x={LAYER_X[0]} y={35} textAnchor="middle" fill="#9ca3af" fontSize="12" fontFamily="system-ui, sans-serif">
          Input
        </text>
        <text x={LAYER_X[1]} y={35} textAnchor="middle" fill="#9ca3af" fontSize="12" fontFamily="system-ui, sans-serif">
          Hidden (ReLU)
        </text>
        <text x={LAYER_X[2]} y={35} textAnchor="middle" fill="#9ca3af" fontSize="12" fontFamily="system-ui, sans-serif">
          Output (Sigmoid)
        </text>

        {/* Input nodes */}
        {INPUT_Y.map((y, i) => (
          <g key={`input-${i}`}>
            <motion.circle
              cx={LAYER_X[0]}
              cy={y}
              r={NODE_RADIUS}
              fill="#1e3a5f"
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <motion.text
              x={LAYER_X[0]}
              y={y + 4}
              textAnchor="middle"
              fill="#93c5fd"
              fontSize="11"
              fontFamily="monospace"
              key={`input-val-${i}-${i === 0 ? input1 : input2}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {(i === 0 ? input1 : input2).toFixed(2)}
            </motion.text>
          </g>
        ))}

        {/* Hidden nodes */}
        {HIDDEN_Y.map((y, h) => {
          const activation = hiddenActivations[h];
          const brightness = Math.min(1, activation * 2); // scale for visibility
          return (
            <g key={`hidden-${h}`}>
              <motion.circle
                cx={LAYER_X[1]}
                cy={y}
                r={NODE_RADIUS}
                fill={`rgba(34, 197, 94, ${0.15 + brightness * 0.6})`}
                stroke="#22c55e"
                strokeWidth={2}
                animate={{
                  fill: `rgba(34, 197, 94, ${0.15 + brightness * 0.6})`,
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.text
                x={LAYER_X[1]}
                y={y + 4}
                textAnchor="middle"
                fill="#86efac"
                fontSize="10"
                fontFamily="monospace"
                key={`hidden-val-${h}-${activation.toFixed(2)}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
              >
                {activation.toFixed(2)}
              </motion.text>
            </g>
          );
        })}

        {/* Output node */}
        <g>
          <motion.circle
            cx={LAYER_X[2]}
            cy={OUTPUT_Y[0]}
            r={NODE_RADIUS + 2}
            fill={`rgba(168, 85, 247, ${0.2 + output * 0.6})`}
            stroke="#a855f7"
            strokeWidth={2.5}
            animate={{
              fill: `rgba(168, 85, 247, ${0.2 + output * 0.6})`,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.text
            x={LAYER_X[2]}
            y={OUTPUT_Y[0] + 4}
            textAnchor="middle"
            fill="#d8b4fe"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
            key={`output-val-${output.toFixed(2)}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {output.toFixed(2)}
          </motion.text>
        </g>

        {/* Weight labels on connections (small, at midpoints) */}
        {inputHiddenConnections.map((conn, i) => {
          const mx = (conn.x1 + conn.x2) / 2 + (i % 3 === 1 ? 0 : i % 3 === 0 ? -14 : 14);
          const my = (conn.y1 + conn.y2) / 2;
          return (
            <text
              key={`ih-label-${i}`}
              x={mx}
              y={my}
              textAnchor="middle"
              fill={getConnectionColor(conn.weight)}
              fontSize="8"
              fontFamily="monospace"
              opacity={0.7}
            >
              {conn.weight > 0 ? '+' : ''}{conn.weight.toFixed(1)}
            </text>
          );
        })}
        {hiddenOutputConnections.map((conn, i) => {
          const mx = (conn.x1 + conn.x2) / 2 + (i === 1 ? 0 : i === 0 ? -14 : 14);
          const my = (conn.y1 + conn.y2) / 2;
          return (
            <text
              key={`ho-label-${i}`}
              x={mx}
              y={my}
              textAnchor="middle"
              fill={getConnectionColor(conn.weight)}
              fontSize="8"
              fontFamily="monospace"
              opacity={0.7}
            >
              {conn.weight > 0 ? '+' : ''}{conn.weight.toFixed(1)}
            </text>
          );
        })}
      </svg>

      {/* Output display */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-gray-400 text-sm font-medium">Output:</span>
          <motion.span
            className="text-2xl font-bold font-mono"
            style={{ color: outputColor }}
            key={output.toFixed(2)}
            initial={{ scale: 1.2, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {output.toFixed(4)}
          </motion.span>
        </div>
        <div className="mx-auto rounded-full overflow-hidden bg-gray-800" style={{ width: outputBarWidth, height: 10 }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: outputColor }}
            animate={{ width: `${output * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1 mx-auto" style={{ width: outputBarWidth }}>
          <span>0</span>
          <span>1</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-500 rounded" />
          <span>Positive weight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-red-500 rounded" />
          <span>Negative weight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-gray-500 bg-gray-800" />
          <span>Thicker = stronger</span>
        </div>
      </div>
    </div>
  );
}
