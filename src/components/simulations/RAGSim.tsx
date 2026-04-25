'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Pre-indexed documents with pre-computed embeddings (simulated)
// -------------------------------------------------------------------

interface Document {
  id: number;
  title: string;
  content: string;
  embedding: number[]; // Simulated 2D embedding for visualization
}

const DOCUMENTS: Document[] = [
  {
    id: 1,
    title: 'Refund Policy',
    content: 'Our company offers a 30-day money-back guarantee on all purchases. No questions asked.',
    embedding: [0.8, 0.3],
  },
  {
    id: 2,
    title: 'Shipping Information',
    content: 'We ship worldwide within 3-5 business days. Express shipping is available for an additional fee.',
    embedding: [0.2, 0.9],
  },
  {
    id: 3,
    title: 'Return Process',
    content: 'To return an item, contact support@company.com with your order number. We will send a prepaid label.',
    embedding: [0.7, 0.4],
  },
  {
    id: 4,
    title: 'Payment Methods',
    content: 'We accept credit cards, PayPal, and Apple Pay. All transactions are encrypted and secure.',
    embedding: [-0.5, 0.6],
  },
  {
    id: 5,
    title: 'Warranty Coverage',
    content: 'All products come with a 1-year warranty against manufacturing defects. Extended warranties available.',
    embedding: [0.5, 0.1],
  },
];

// Pre-computed query scenarios
const SCENARIOS = [
  {
    label: 'Can I get my money back?',
    query: 'Can I get my money back?',
    embedding: [0.75, 0.35],
    withoutRAG: 'Yes, most companies offer refunds within 60-90 days of purchase. Contact your credit card company if needed.',
    withRAG: 'Yes! Our company offers a 30-day money-back guarantee on all purchases, no questions asked.',
  },
  {
    label: 'How long does shipping take?',
    query: 'How long does shipping take?',
    embedding: [0.25, 0.85],
    withoutRAG: 'Shipping typically takes 7-10 business days for domestic orders and 2-3 weeks for international.',
    withRAG: 'We ship worldwide within 3-5 business days. Express shipping is also available for an additional fee.',
  },
  {
    label: 'What payment options do you have?',
    query: 'What payment options do you have?',
    embedding: [-0.45, 0.55],
    withoutRAG: 'Most online stores accept major credit cards, debit cards, and sometimes cryptocurrency.',
    withRAG: 'We accept credit cards, PayPal, and Apple Pay. All transactions are encrypted and secure.',
  },
  {
    label: 'How do I return a product?',
    query: 'How do I return a product?',
    embedding: [0.65, 0.45],
    withoutRAG: 'Returns usually require the original packaging and receipt. Check with the retailer for specific instructions.',
    withRAG: 'Contact support@company.com with your order number. We will send you a prepaid shipping label to return your item.',
  },
];

// Compute cosine similarity
function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Pipeline stages
type Stage = 'idle' | 'embedding' | 'searching' | 'retrieving' | 'generating' | 'complete';

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------

export default function RAGSim() {
  const [useRAG, setUseRAG] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [stage, setStage] = useState<Stage>('idle');
  const [answer, setAnswer] = useState('');

  const currentScenario = SCENARIOS[selectedScenario];

  // Compute similarity scores for all documents
  const docScores = useMemo(() => {
    return DOCUMENTS.map((doc) => ({
      ...doc,
      score: cosineSimilarity(doc.embedding, currentScenario.embedding),
    })).sort((a, b) => b.score - a.score);
  }, [currentScenario]);

  // Top 3 most relevant documents
  const topDocs = docScores.slice(0, 3);

  // Run the RAG pipeline
  const runPipeline = async () => {
    setAnswer('');
    setStage('embedding');
    await new Promise((r) => setTimeout(r, 800));

    setStage('searching');
    await new Promise((r) => setTimeout(r, 800));

    setStage('retrieving');
    await new Promise((r) => setTimeout(r, 800));

    setStage('generating');
    await new Promise((r) => setTimeout(r, 1000));

    setStage('complete');
    setAnswer(useRAG ? currentScenario.withRAG : currentScenario.withoutRAG);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        RAG Pipeline Visualizer
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        See how Retrieval-Augmented Generation retrieves relevant documents before answering.
        Toggle RAG on/off to compare grounded vs hallucinated answers.
      </p>

      {/* RAG Toggle */}
      <div className="flex items-center justify-between mb-6 bg-gray-800 rounded-lg p-4">
        <div>
          <div className="text-sm font-medium text-white mb-1">RAG Mode</div>
          <div className="text-xs text-gray-400">
            {useRAG ? 'LLM uses retrieved documents as context' : 'LLM relies only on training data'}
          </div>
        </div>
        <button
          onClick={() => {
            setUseRAG(!useRAG);
            setStage('idle');
            setAnswer('');
          }}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
            useRAG ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              useRAG ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Scenario Selector */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-300 mb-3">Select a question</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCENARIOS.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedScenario(idx);
                setStage('idle');
                setAnswer('');
              }}
              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                selectedScenario === idx
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={runPipeline}
        disabled={stage !== 'idle' && stage !== 'complete'}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-all mb-6"
      >
        {stage === 'idle' || stage === 'complete' ? 'Run Pipeline' : 'Processing...'}
      </button>

      {/* Pipeline Visualization */}
      {stage !== 'idle' && (
        <div className="space-y-4 mb-6">
          {/* Stage 1: Embedding */}
          <motion.div
            className={`border-2 rounded-lg p-4 ${
              stage === 'embedding'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  stage === 'embedding' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">1. Embed Query</div>
                <div className="text-xs text-gray-400 mt-1">
                  Convert question to vector: [{currentScenario.embedding.join(', ')}]
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stage 2: Vector Search */}
          <motion.div
            className={`border-2 rounded-lg p-4 ${
              stage === 'searching'
                ? 'border-blue-500 bg-blue-500/10'
                : stage === 'embedding'
                ? 'border-gray-700 bg-gray-800/30'
                : 'border-gray-700 bg-gray-800/50'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  stage === 'searching' ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">2. Vector Search</div>
                <div className="text-xs text-gray-400 mt-1">
                  Find most similar documents in vector database
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stage 3: Retrieve Top-K */}
          <motion.div
            className={`border-2 rounded-lg p-4 ${
              stage === 'retrieving'
                ? 'border-green-500 bg-green-500/10'
                : stage === 'embedding' || stage === 'searching'
                ? 'border-gray-700 bg-gray-800/30'
                : 'border-gray-700 bg-gray-800/50'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  stage === 'retrieving' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">3. Retrieve Top-3 Documents</div>
                <div className="text-xs text-gray-400 mt-1">
                  {useRAG ? 'Passing to LLM as context' : 'Skipped (RAG disabled)'}
                </div>
              </div>
            </div>

            {/* Document scores */}
            {(stage === 'retrieving' || stage === 'generating' || stage === 'complete') && useRAG && (
              <motion.div
                className="space-y-2 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {topDocs.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="bg-gray-900 rounded-lg px-3 py-2 border border-green-500/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-green-300">
                        {doc.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        Score: {doc.score.toFixed(3)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{doc.content}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Stage 4: Generate */}
          <motion.div
            className={`border-2 rounded-lg p-4 ${
              stage === 'generating'
                ? 'border-purple-500 bg-purple-500/10'
                : stage === 'complete'
                ? 'border-gray-700 bg-gray-800/50'
                : 'border-gray-700 bg-gray-800/30'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  stage === 'generating' ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'
                }`}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">4. Generate Answer</div>
                <div className="text-xs text-gray-400 mt-1">
                  LLM produces response {useRAG ? 'grounded in retrieved docs' : 'from memory'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Answer Panel */}
      <AnimatePresence>
        {stage === 'complete' && answer && (
          <motion.div
            className="bg-gray-800 rounded-lg p-5 border-2 border-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-semibold text-white">Answer</div>
              <div
                className={`text-xs font-medium px-2 py-1 rounded ${
                  useRAG
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {useRAG ? 'Grounded' : 'Hallucinated'}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{answer}</p>

            {useRAG && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2">Sources cited:</div>
                <div className="flex flex-wrap gap-2">
                  {topDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/30"
                    >
                      {doc.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Documents Reference */}
      <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="text-sm font-medium text-gray-300 mb-3">
          Pre-indexed Knowledge Base (5 documents)
        </div>
        <div className="space-y-2">
          {DOCUMENTS.map((doc) => {
            const score = docScores.find((d) => d.id === doc.id)?.score ?? 0;
            const isTopK = topDocs.some((d) => d.id === doc.id);
            return (
              <div
                key={doc.id}
                className={`text-xs rounded px-3 py-2 ${
                  isTopK && stage !== 'idle'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-900 border border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-medium ${
                      isTopK && stage !== 'idle' ? 'text-green-300' : 'text-gray-400'
                    }`}
                  >
                    {doc.title}
                  </span>
                  {stage !== 'idle' && (
                    <span className="text-gray-500">
                      {score.toFixed(3)}
                    </span>
                  )}
                </div>
                <div className="text-gray-500">{doc.content}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Connection */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong> RAG combines retrieval and generation
          to give LLMs access to external knowledge. Without RAG, the model can only rely on what it learned
          during training, leading to hallucinations. With RAG, it retrieves real documents and cites them,
          producing grounded, verifiable answers. This is how modern AI assistants stay up-to-date and accurate.
        </p>
      </div>
    </div>
  );
}
