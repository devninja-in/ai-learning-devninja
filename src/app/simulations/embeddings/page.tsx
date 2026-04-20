'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import SimulationLayout from '@/components/SimulationLayout'
import { SimulationEngine } from '@/utils/simulation-helpers'
import { EmbeddingVector } from '@/types/simulation'
import { Target, RefreshCw, Layers, Search, Book, ArrowLeftRight, Zap, Calculator, Eye, GitBranch } from 'lucide-react'

const SAMPLE_WORD_SETS = {
  animals: ['cat', 'dog', 'bird', 'fish', 'elephant', 'mouse'],
  colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  emotions: ['happy', 'sad', 'angry', 'excited', 'calm', 'nervous'],
  technology: ['computer', 'phone', 'internet', 'software', 'data', 'algorithm'],
  mixed: ['king', 'queen', 'man', 'woman', 'good', 'bad', 'big', 'small']
}

export default function EmbeddingsSimulation() {
  const [selectedSet, setSelectedSet] = useState<keyof typeof SAMPLE_WORD_SETS>('animals')
  const [customWords, setCustomWords] = useState('')
  const [searchWord, setSearchWord] = useState('')
  const [dimensions, setDimensions] = useState(50)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<'playground' | 'learn'>('playground')
  const svgRef = useRef<SVGSVGElement>(null)

  const words = useMemo(() => {
    const setWords = SAMPLE_WORD_SETS[selectedSet]
    const additionalWords = customWords.split(',').map(w => w.trim()).filter(w => w)
    return [...setWords, ...additionalWords]
  }, [selectedSet, customWords])

  const embeddings = useMemo((): EmbeddingVector[] => {
    return words.map(word => SimulationEngine.generateRandomEmbedding(word, dimensions))
  }, [words, dimensions])

  const searchResults = useMemo(() => {
    if (!searchWord.trim()) return []

    const searchEmbedding = SimulationEngine.generateRandomEmbedding(searchWord, dimensions)
    const similarities = embeddings.map(emb => ({
      ...emb,
      similarity: SimulationEngine.calculateSimilarity(searchEmbedding.vector, emb.vector)
    }))

    return similarities
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 5)
  }, [searchWord, embeddings, dimensions])

  useEffect(() => {
    if (!svgRef.current || embeddings.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 400
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }

    // Set up scales
    const xExtent = d3.extent(embeddings, d => d.position?.x || 0) as [number, number]
    const yExtent = d3.extent(embeddings, d => d.position?.y || 0) as [number, number]

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height - margin.bottom, margin.top])

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Dimension 1')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Dimension 2')

    // Add points
    const circles = svg.selectAll('circle')
      .data(embeddings)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.position?.x || 0))
      .attr('cy', d => yScale(d.position?.y || 0))
      .attr('r', 0)
      .attr('fill', (d, i) => colorScale(selectedSet))
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .style('opacity', 0.8)

    // Add labels
    const labels = svg.selectAll('text.label')
      .data(embeddings)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.position?.x || 0))
      .attr('y', d => yScale(d.position?.y || 0) - 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('opacity', 0)
      .text(d => d.word)

    // Animate in
    circles.transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('r', 6)

    labels.transition()
      .duration(800)
      .delay((d, i) => i * 50 + 200)
      .style('opacity', 1)

    // Add hover interactions
    circles
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('stroke-width', 2)

        // Highlight similar words (simple distance-based)
        const mousePos = d.position
        if (mousePos) {
          circles.style('opacity', (otherD) => {
            if (otherD === d) return 1
            const otherPos = otherD.position
            if (!otherPos) return 0.3

            const distance = Math.sqrt(
              Math.pow(mousePos.x - otherPos.x, 2) +
              Math.pow(mousePos.y - otherPos.y, 2)
            )
            return distance < 30 ? 0.8 : 0.3
          })
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('stroke-width', 1)

        circles.style('opacity', 0.8)
      })

  }, [embeddings, selectedSet])

  const handleAnimate = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  const learningObjectives = [
    "Understand how words are represented as numerical vectors",
    "Explore the concept of semantic similarity in vector space",
    "See how word relationships are captured in embeddings",
    "Experience dimensionality reduction for visualization"
  ]

  return (
    <SimulationLayout
      title="Word Embeddings Visualization"
      description="Visualize word vectors and semantic relationships in vector space"
      difficulty="Beginner"
      category="NLP Foundations"
      onPlay={handleAnimate}
      onReset={() => {
        setSelectedSet('animals')
        setCustomWords('')
        setSearchWord('')
        setDimensions(50)
        setActiveTab('playground')
      }}
      showControls={true}
      learningObjectives={learningObjectives}
    >
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-white rounded-lg shadow-lg p-1">
          {[
            { key: 'playground', label: 'Interactive Visualization', icon: Target },
            { key: 'learn', label: 'Key Concepts', icon: Book }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} className="mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'playground' && (
          <motion.div
            key="playground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Layers className="mr-2 text-blue-600" size={20} />
              Word Collections
            </h3>

            <div className="space-y-3">
              {Object.entries(SAMPLE_WORD_SETS).map(([key, wordList]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="wordSet"
                    value={key}
                    checked={selectedSet === key}
                    onChange={() => setSelectedSet(key as keyof typeof SAMPLE_WORD_SETS)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {key}
                    </div>
                    <div className="text-xs text-gray-600">
                      {wordList.join(', ')}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Words (comma-separated)
              </label>
              <input
                type="text"
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="apple, banana, fruit"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="mr-2 text-green-600" size={20} />
              Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vector Dimensions: {dimensions}
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={dimensions}
                  onChange={(e) => setDimensions(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>300</span>
                </div>
              </div>

              <button
                onClick={() => setDimensions(Math.floor(Math.random() * 200) + 50)}
                className="w-full flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className="mr-2" />
                Randomize Dimensions
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="mr-2 text-purple-600" size={20} />
              Similarity Search
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Word
                </label>
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a word to find similar ones"
                />
              </div>

              {searchResults.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Most Similar Words
                  </div>
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <div key={result.word} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-mono">{result.word}</span>
                        <span className="text-xs text-gray-600">
                          {((result.similarity || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              2D Projection of Word Vectors
            </h3>

            <div className="border rounded-lg bg-gray-50 overflow-hidden">
              <svg
                ref={svgRef}
                width="600"
                height="400"
                className="w-full h-auto"
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                Each point represents a word in high-dimensional space, projected to 2D for visualization.
                Hover over points to see relationships. Words closer together are more similar.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vector Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {words.length}
                </div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {dimensions}
                </div>
                <div className="text-sm text-gray-600">Vector Dimensions</div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Word</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">2D Position</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Vector Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {embeddings.slice(0, 6).map((embedding) => (
                    <tr key={embedding.word} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-sm font-mono font-medium">
                        {embedding.word}
                      </td>
                      <td className="py-2 px-3 text-sm font-mono">
                        ({(embedding.position?.x || 0).toFixed(1)}, {(embedding.position?.y || 0).toFixed(1)})
                      </td>
                      <td className="py-2 px-3 text-xs font-mono text-gray-600">
                        [{embedding.vector.slice(0, 3).map(v => v.toFixed(2)).join(', ')}, ...]
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {embeddings.length > 6 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  ... and {embeddings.length - 6} more words
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
          </motion.div>
        )}

        {activeTab === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-8">
              {/* Learning Center Header */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Book className="mr-2 text-purple-600" size={24} />
                  Word Embeddings Learning Center
                </h3>
                <p className="text-gray-600">
                  Understanding how machines represent words as mathematical vectors to capture semantic meaning and relationships.
                  This foundational concept enables modern NLP systems to process and understand human language.
                </p>
              </div>

              {/* Core Concepts */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Layers className="mr-2 text-indigo-600" size={20} />
                  Core Mathematical Concepts
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Vector Representation",
                      description: "Words are represented as high-dimensional numerical vectors (e.g., 300-1536 dimensions). Each dimension captures different semantic features, allowing mathematical operations on meaning.",
                      mathematical: "word → [0.2, -0.1, 0.8, ..., 0.3] ∈ ℝᵈ",
                      impact: "Enables mathematical operations on word meanings"
                    },
                    {
                      title: "Semantic Similarity",
                      description: "Words with similar meanings have vectors that are close in vector space. This proximity is measured using distance metrics like cosine similarity.",
                      mathematical: "similarity = (A · B) / (||A|| × ||B||)",
                      impact: "Powers search, recommendation, and understanding systems"
                    },
                    {
                      title: "Distributional Hypothesis",
                      description: "Words that appear in similar contexts have similar meanings. This principle underlies how embeddings are learned from text data.",
                      mathematical: "P(word|context) ≈ semantic_meaning",
                      impact: "Foundation for learning word meanings from text"
                    },
                    {
                      title: "Vector Space Operations",
                      description: "Semantic relationships can be expressed through vector arithmetic. Famous example: king - man + woman ≈ queen",
                      mathematical: "king⃗ - man⃗ + woman⃗ ≈ queen⃗",
                      impact: "Captures analogical reasoning and relationships"
                    },
                    {
                      title: "Dimensionality & Quality",
                      description: "Higher dimensions capture more nuanced meanings but require more computation. Typical ranges: 50-1536 dimensions for different applications.",
                      mathematical: "d ∈ [50, 1536], complexity ∝ d²",
                      impact: "Trade-off between semantic richness and computational cost"
                    },
                    {
                      title: "Context Windows",
                      description: "The surrounding words used to learn embeddings. Larger windows capture topical similarity, smaller windows capture functional similarity.",
                      mathematical: "window_size ∈ [1, 20], context = words[i-w:i+w]",
                      impact: "Determines the type of semantic relationships captured"
                    }
                  ].map((concept, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Calculator className="mr-2 text-blue-500" size={16} />
                        {concept.title}
                      </h5>
                      <p className="text-sm text-gray-600 mb-3">{concept.description}</p>
                      <div className="bg-blue-50 p-2 rounded text-xs font-mono text-blue-800 mb-2">
                        {concept.mathematical}
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Impact:</strong> {concept.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance Metrics */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="mr-2 text-green-600" size={20} />
                  Distance Metrics & Similarity Measures
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Cosine Similarity",
                      formula: "cos(θ) = (A·B) / (||A||·||B||)",
                      description: "Measures the angle between vectors, ignoring magnitude. Most common for word embeddings.",
                      range: "[-1, 1]",
                      advantages: ["Magnitude independent", "Intuitive interpretation", "Computationally efficient"],
                      useCases: ["Semantic similarity", "Document similarity", "Recommendation systems"]
                    },
                    {
                      name: "Euclidean Distance",
                      formula: "d = √(Σ(Aᵢ - Bᵢ)²)",
                      description: "Straight-line distance between points in vector space. Sensitive to vector magnitude.",
                      range: "[0, ∞)",
                      advantages: ["Geometric intuition", "Preserves magnitude differences", "Simple calculation"],
                      useCases: ["Clustering", "Nearest neighbor search", "Outlier detection"]
                    },
                    {
                      name: "Dot Product",
                      formula: "A·B = Σ(Aᵢ·Bᵢ)",
                      description: "Direct multiplication of corresponding dimensions. Sensitive to both angle and magnitude.",
                      range: "(-∞, ∞)",
                      advantages: ["Simple computation", "Captures magnitude", "Linear transformation friendly"],
                      useCases: ["Attention mechanisms", "Neural network layers", "Similarity scoring"]
                    }
                  ].map((metric, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">{metric.name}</h5>
                      <div className="bg-white p-2 rounded text-xs font-mono text-gray-800 mb-2">
                        {metric.formula}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
                      <div className="text-xs text-gray-600 mb-3">
                        <strong>Range:</strong> {metric.range}
                      </div>

                      <div className="mb-3">
                        <div className="text-xs font-semibold text-green-700 mb-1">Advantages:</div>
                        <ul className="space-y-1">
                          {metric.advantages.map((adv, i) => (
                            <li key={i} className="text-xs text-green-600 flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {adv}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-blue-700 mb-1">Common Uses:</div>
                        <ul className="space-y-1">
                          {metric.useCases.map((use, i) => (
                            <li key={i} className="text-xs text-blue-600 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {use}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-World Applications */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="mr-2 text-yellow-600" size={20} />
                  Real-World Applications
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Search & Retrieval",
                      description: "Find semantically similar documents or passages based on meaning rather than exact keywords.",
                      examples: ["Semantic search engines", "Document retrieval", "FAQ matching"],
                      technology: "Vector databases, embedding models"
                    },
                    {
                      title: "Recommendation Systems",
                      description: "Suggest items based on semantic similarity between user preferences and item descriptions.",
                      examples: ["Product recommendations", "Content discovery", "Job matching"],
                      technology: "Collaborative filtering, content-based filtering"
                    },
                    {
                      title: "Translation & NLP",
                      description: "Map words across languages in shared vector space for cross-lingual understanding.",
                      examples: ["Machine translation", "Cross-lingual search", "Multilingual models"],
                      technology: "Transformer models, cross-lingual embeddings"
                    },
                    {
                      title: "Chatbots & QA",
                      description: "Understand user intent and match to appropriate responses based on semantic similarity.",
                      examples: ["Customer service bots", "Virtual assistants", "Knowledge base QA"],
                      technology: "Intent classification, response matching"
                    },
                    {
                      title: "Content Analysis",
                      description: "Analyze themes, sentiment, and topics in large text collections using vector operations.",
                      examples: ["Sentiment analysis", "Topic modeling", "Content classification"],
                      technology: "Clustering algorithms, classification models"
                    },
                    {
                      title: "Knowledge Graphs",
                      description: "Represent entities and relationships in vector space for reasoning and inference.",
                      examples: ["Entity linking", "Relation extraction", "Knowledge completion"],
                      technology: "Graph neural networks, entity embeddings"
                    }
                  ].map((app, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h5 className="font-semibold text-gray-900 mb-2">{app.title}</h5>
                      <p className="text-sm text-gray-600 mb-3">{app.description}</p>

                      <div className="mb-3">
                        <div className="text-xs font-semibold text-purple-700 mb-1">Examples:</div>
                        <ul className="space-y-1">
                          {app.examples.map((example, i) => (
                            <li key={i} className="text-xs text-purple-600 flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-gray-500">
                        <strong>Technology:</strong> {app.technology}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection to Transformers */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GitBranch className="mr-2 text-red-600" size={20} />
                  Connection to Modern AI Architecture
                </h4>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">From Static to Contextual</h5>
                      <p className="text-sm text-blue-800 mb-3">
                        Traditional word embeddings (Word2Vec, GloVe) assign fixed vectors to words.
                        Modern transformer models create dynamic, context-dependent representations.
                      </p>
                      <div className="text-xs text-blue-700">
                        <strong>Evolution:</strong> Fixed embeddings → Contextual embeddings → Attention mechanisms
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">Transformer Integration</h5>
                      <p className="text-sm text-green-800 mb-3">
                        Transformers use embeddings as input, then apply attention to create context-aware representations
                        that change based on surrounding words.
                      </p>
                      <div className="text-xs text-green-700">
                        <strong>Process:</strong> Token embeddings → Positional encoding → Attention layers → Contextualized vectors
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-semibold text-purple-900 mb-2">Foundation for Advanced AI</h5>
                    <p className="text-sm text-purple-800 mb-3">
                      Word embeddings are the foundation that enables:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-700">
                      <div>
                        <strong>Language Models:</strong>
                        <ul className="mt-1 space-y-1 text-xs">
                          <li>• GPT, BERT, T5 architectures</li>
                          <li>• In-context learning capabilities</li>
                          <li>• Transfer learning across tasks</li>
                        </ul>
                      </div>
                      <div>
                        <strong>AI Applications:</strong>
                        <ul className="mt-1 space-y-1 text-xs">
                          <li>• RAG (Retrieval-Augmented Generation)</li>
                          <li>• Agent reasoning and tool use</li>
                          <li>• Multimodal understanding</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="mr-2 text-orange-600" size={20} />
                  Best Practices & Guidelines
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Choosing Embedding Dimensions</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <strong>50-100D:</strong> Simple tasks, limited vocabulary, fast computation
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <strong>200-300D:</strong> General-purpose NLP, good semantic capture
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <strong>500-1536D:</strong> Complex domains, rich semantic understanding
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Higher dimensions need more data and computation
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Quality Assessment</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Test semantic similarity with word pairs
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Evaluate on analogy tasks (king:queen :: man:?)
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Check clustering of related concepts
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        Validate on downstream task performance
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h5 className="font-semibold text-yellow-900 mb-2">Key Considerations</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                    <div>
                      <strong>Data Quality:</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Clean, representative training corpus</li>
                        <li>• Sufficient context for each word</li>
                        <li>• Balanced vocabulary coverage</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Technical Trade-offs:</strong>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Memory usage vs. semantic richness</li>
                        <li>• Training time vs. quality</li>
                        <li>• Domain specificity vs. generalization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SimulationLayout>
  )
}