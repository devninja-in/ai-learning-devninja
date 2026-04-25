'use client';

import { motion } from 'framer-motion';

interface NetworkDiagramProps {
  layers: number[];
  activeLayer?: number;
  title?: string;
}

export default function NetworkDiagram({ layers, activeLayer, title }: NetworkDiagramProps) {
  const svgWidth = 600;
  const svgHeight = 300;
  const padding = 60;
  const nodeRadius = 8;

  const availableWidth = svgWidth - padding * 2;
  const availableHeight = svgHeight - padding * 2;

  const layerPositions = layers.map((_, index) => ({
    x: padding + (availableWidth / (layers.length - 1)) * index,
  }));

  const nodePositions = layers.map((nodeCount, layerIndex) => {
    const layerX = layerPositions[layerIndex].x;
    const nodes = [];
    const verticalSpacing = availableHeight / (nodeCount + 1);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: layerX,
        y: padding + verticalSpacing * (i + 1),
        layerIndex,
        nodeIndex: i,
      });
    }

    return nodes;
  });

  const connections = [];
  for (let i = 0; i < layers.length - 1; i++) {
    for (const sourceNode of nodePositions[i]) {
      for (const targetNode of nodePositions[i + 1]) {
        connections.push({
          x1: sourceNode.x,
          y1: sourceNode.y,
          x2: targetNode.x,
          y2: targetNode.y,
          layerIndex: i,
        });
      }
    }
  }

  const getLayerLabel = (index: number) => {
    if (index === 0) return 'Input';
    if (index === layers.length - 1) return 'Output';
    return `Hidden ${index}`;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {title && (
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      )}

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: '300px' }}
      >
        {connections.map((conn, index) => {
          const isActive =
            activeLayer !== undefined &&
            (conn.layerIndex === activeLayer || conn.layerIndex === activeLayer - 1);

          return (
            <motion.line
              key={`conn-${index}`}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={isActive ? '#3b82f6' : '#4b5563'}
              strokeWidth={isActive ? 2 : 1}
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive ? 0.8 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}

        {nodePositions.flat().map((node, index) => {
          const isActive = activeLayer !== undefined && node.layerIndex === activeLayer;

          return (
            <motion.circle
              key={`node-${index}`}
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={isActive ? '#3b82f6' : '#1f2937'}
              stroke={isActive ? '#60a5fa' : '#6b7280'}
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.3,
                delay: node.layerIndex * 0.1,
              }}
            />
          );
        })}

        {layerPositions.map((pos, index) => (
          <text
            key={`label-${index}`}
            x={pos.x}
            y={svgHeight - 20}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="12"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {getLayerLabel(index)}
          </text>
        ))}
      </svg>
    </div>
  );
}
