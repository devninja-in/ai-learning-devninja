'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface GlossaryTerm {
  term: string
  definition: string
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'Attention',
    definition: 'A mechanism that lets models focus on specific parts of the input when making predictions. Think of it like highlighting the most important words in a sentence to understand its meaning.',
  },
  {
    term: 'Backpropagation',
    definition: 'The algorithm neural networks use to learn from mistakes. It works backwards through the network, adjusting each layer based on how much it contributed to the error.',
  },
  {
    term: 'BERT',
    definition: 'Bidirectional Encoder Representations from Transformers. A model that reads text in both directions at once, making it great at understanding context and meaning.',
  },
  {
    term: 'BPE',
    definition: 'Byte Pair Encoding, a popular tokenization method that breaks text into subword units. It finds the most common character pairs and merges them into single tokens.',
  },
  {
    term: 'Chain-of-Thought',
    definition: 'A prompting technique where you ask the model to show its reasoning step-by-step. This often leads to better answers on complex problems.',
  },
  {
    term: 'CNN',
    definition: 'Convolutional Neural Network, a type of model designed for processing images. It uses layers that scan across the image to detect patterns like edges and shapes.',
  },
  {
    term: 'Decoder',
    definition: 'The part of a transformer that generates output, one token at a time. It takes the encoded representation and turns it into text, images, or other outputs.',
  },
  {
    term: 'Embedding',
    definition: 'A way to represent words or tokens as vectors of numbers. Similar words end up with similar vectors, capturing meaning in mathematical form.',
  },
  {
    term: 'Encoder',
    definition: 'The part of a transformer that reads and processes the input. It converts text into a rich representation that captures meaning and relationships.',
  },
  {
    term: 'Epoch',
    definition: 'One complete pass through the entire training dataset. Training a model usually takes many epochs, with the model getting slightly better each time.',
  },
  {
    term: 'Fine-tuning',
    definition: 'Taking a pre-trained model and training it a bit more on specific data for your task. Like teaching a chef who knows cooking basics to specialize in Italian cuisine.',
  },
  {
    term: 'GPT',
    definition: 'Generative Pre-trained Transformer, a family of models trained to predict the next word. GPT models are decoder-only and excel at generating coherent text.',
  },
  {
    term: 'Gradient Descent',
    definition: 'The optimization algorithm that adjusts model weights to reduce errors. It follows the gradient downhill toward better performance, taking small steps to avoid overshooting.',
  },
  {
    term: 'Hallucination',
    definition: 'When a language model confidently generates information that sounds plausible but is actually incorrect or made up. A key challenge in making AI reliable.',
  },
  {
    term: 'KV-Cache',
    definition: 'Key-Value Cache, a technique that stores previous attention calculations to speed up text generation. Instead of recalculating everything, it reuses what it already computed.',
  },
  {
    term: 'LLM',
    definition: 'Large Language Model, a neural network trained on massive amounts of text. These models can understand and generate human-like text across many tasks.',
  },
  {
    term: 'LoRA',
    definition: 'Low-Rank Adaptation, an efficient fine-tuning method that adds small trainable matrices to a frozen model. It achieves good results while updating far fewer parameters.',
  },
  {
    term: 'Loss Function',
    definition: 'A mathematical measure of how wrong the model\'s predictions are. Training aims to minimize this loss, gradually improving the model\'s accuracy.',
  },
  {
    term: 'MoE',
    definition: 'Mixture of Experts, an architecture that uses multiple specialized sub-models. A gating mechanism decides which experts to activate for each input, improving efficiency.',
  },
  {
    term: 'Perceptron',
    definition: 'The simplest type of artificial neuron, the building block of neural networks. It takes inputs, weights them, adds them up, and outputs a result.',
  },
  {
    term: 'Pre-training',
    definition: 'The initial phase where a model learns from massive datasets, picking up general patterns and knowledge. This foundation makes fine-tuning for specific tasks much easier.',
  },
  {
    term: 'Quantization',
    definition: 'Reducing the precision of model weights from 32-bit to 8-bit or lower. This makes models smaller and faster with minimal accuracy loss.',
  },
  {
    term: 'RAG',
    definition: 'Retrieval-Augmented Generation, a technique that gives models access to external knowledge. It retrieves relevant documents and includes them in the prompt for more accurate answers.',
  },
  {
    term: 'RLHF',
    definition: 'Reinforcement Learning from Human Feedback, a training method that uses human preferences to guide the model. It helps align AI behavior with what humans actually want.',
  },
  {
    term: 'RoPE',
    definition: 'Rotary Position Embedding, a way to encode position information that works well for long sequences. It rotates embeddings in a way that naturally captures relative positions.',
  },
  {
    term: 'Self-Attention',
    definition: 'The core mechanism in transformers that lets each token look at all other tokens in the sequence. It learns which parts of the input are most relevant to each other.',
  },
  {
    term: 'Tokenization',
    definition: 'Breaking text into smaller units called tokens. This is the first step in processing language, turning strings into pieces the model can work with.',
  },
  {
    term: 'Transformer',
    definition: 'The architecture behind modern language models, based on attention mechanisms. It can process entire sequences in parallel, making it both powerful and efficient.',
  },
  {
    term: 'Vector Database',
    definition: 'A specialized database for storing and searching embeddings. It can quickly find the most similar vectors, making it perfect for semantic search and RAG systems.',
  },
]

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTerms = glossaryTerms.filter(
    item =>
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">AI/ML Glossary</h1>
        <p className="text-gray-600 mb-8">
          Key terms and concepts explained in plain language
        </p>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filteredTerms.length > 0 ? (
          <div className="space-y-6">
            {filteredTerms.map(item => (
              <div key={item.term} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{item.term}</h3>
                <p className="text-sm text-gray-600">{item.definition}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No terms match your search. Try a different keyword.
          </div>
        )}
      </div>
    </div>
  )
}
