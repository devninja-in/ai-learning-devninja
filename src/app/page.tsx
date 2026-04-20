'use client'

import { useState } from 'react'
import { Brain, Code, Zap, Play, BookOpen, Target, Gauge, Settings, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const simulations = [
  {
    id: 'tokenization',
    title: 'Tokenization Playground',
    description: 'Explore how text is broken down into tokens for NLP processing',
    icon: Code,
    href: '/simulations/tokenization',
    difficulty: 'Beginner',
    category: 'NLP Foundations'
  },
  {
    id: 'embeddings',
    title: 'Word Embeddings',
    description: 'Visualize word vectors and semantic relationships in vector space',
    icon: Target,
    href: '/simulations/embeddings',
    difficulty: 'Beginner',
    category: 'NLP Foundations'
  },
  {
    id: 'attention',
    title: 'Attention Mechanism',
    description: 'Interactive demonstration of attention weights and patterns',
    icon: Zap,
    href: '/simulations/attention',
    difficulty: 'Intermediate',
    category: 'Transformers'
  },
  {
    id: 'transformer',
    title: 'Transformer Architecture',
    description: 'Step-through visualization of transformer layers and operations',
    icon: Brain,
    href: '/simulations/transformer',
    difficulty: 'Advanced',
    category: 'Transformers'
  },
  {
    id: 'language-model',
    title: 'Language Model Playground',
    description: 'Experiment with text generation and prediction probabilities',
    icon: BookOpen,
    href: '/simulations/language-model',
    difficulty: 'Intermediate',
    category: 'Language Models'
  },
  {
    id: 'rlhf',
    title: 'RLHF Training',
    description: 'Visualize reinforcement learning from human feedback process',
    icon: Play,
    href: '/simulations/rlhf',
    difficulty: 'Advanced',
    category: 'RLHF'
  },
  {
    id: 'quantization',
    title: 'Quantization Laboratory',
    description: 'Explore quality vs size trade-offs and optimization techniques',
    icon: Gauge,
    href: '/simulations/quantization',
    difficulty: 'Advanced',
    category: 'Model Optimization'
  },
  {
    id: 'agent-frameworks',
    title: 'Agent Frameworks Mastery',
    description: 'Master LangChain, LlamaIndex, CrewAI, and other frameworks',
    icon: Brain,
    href: '/simulations/agent-frameworks',
    difficulty: 'Advanced',
    category: 'Agent Frameworks'
  },
  {
    id: 'agent-flow',
    title: 'Agent Flow & Tool Selection',
    description: 'Interactive demonstration of how AI agents process queries and select tools',
    icon: Settings,
    href: '/simulations/agent-flow',
    difficulty: 'Advanced',
    category: 'Agent Systems'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-sky-600" />
                <span className="text-xl font-bold text-gray-900">DevNinja</span>
                <span className="text-sm bg-sky-100 text-sky-700 px-2 py-1 rounded-full">AI Learning</span>
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-900 hover:text-sky-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="#simulations" className="text-gray-600 hover:text-sky-600 px-3 py-2 text-sm font-medium">
                Simulations
              </Link>
              <Link href="https://devninja.in" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-sky-600 px-3 py-2 text-sm font-medium">
                DevNinja.in
              </Link>
              <Link href="https://tools.devninja.in" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-sky-600 px-3 py-2 text-sm font-medium">
                Developer Tools
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-sky-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">{mobileMenuOpen ? 'Close' : 'Open'} main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden" id="mobile-menu">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                <Link
                  href="/"
                  className="text-gray-900 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="#simulations"
                  className="text-gray-600 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Simulations
                </Link>
                <Link
                  href="https://devninja.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DevNinja.in
                </Link>
                <Link
                  href="https://tools.devninja.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-sky-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Developer Tools
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 text-white"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-6xl font-bold mb-6"
            >
              AI Learning{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                Simulations
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl sm:text-2xl mb-8 text-sky-100"
            >
              Interactive visualizations to understand AI concepts through hands-on exploration
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="#simulations"
                className="inline-flex items-center px-6 py-3 bg-white text-sky-600 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
              >
                <Play className="mr-2" size={20} />
                Start Learning
              </Link>
              <Link
                href="https://devninja.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-sky-600 transition-colors"
              >
                Visit DevNinja.in
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Simulations Grid */}
      <section id="simulations" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Interactive Simulations
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Dive deep into AI concepts with our collection of interactive simulations.
              Each simulation is designed to build understanding through visualization and experimentation.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {simulations.map((simulation) => {
              const IconComponent = simulation.icon
              return (
                <motion.div
                  key={simulation.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group"
                >
                  <Link href={simulation.href} className="block">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-sky-300 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg">
                          <IconComponent className="text-white" size={24} />
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {simulation.category}
                          </span>
                          <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                            simulation.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            simulation.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {simulation.difficulty}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                        {simulation.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {simulation.description}
                      </p>
                      <div className="mt-4 flex items-center text-sky-600 text-sm font-medium">
                        Start Simulation
                        <Play className="ml-1 group-hover:translate-x-1 transition-transform" size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Interactive Learning?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our simulations turn complex AI concepts into visual, hands-on experiences
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Visual Learning',
                description: 'See algorithms in action with real-time visualizations',
                icon: '👁️'
              },
              {
                title: 'Hands-on Exploration',
                description: 'Experiment with parameters and observe the effects',
                icon: '🔬'
              },
              {
                title: 'Progressive Difficulty',
                description: 'Start with basics and advance to complex concepts',
                icon: '📈'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Brain className="h-6 w-6 text-sky-400" />
              <span className="text-lg font-bold">DevNinja AI Learning</span>
            </div>
            <p className="text-gray-400 mb-4">
              Part of the DevNinja.in ecosystem - Interactive AI education platform
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="https://devninja.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                DevNinja.in
              </Link>
              <Link href="https://tools.devninja.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Developer Tools
              </Link>
              <Link href="https://devninja.in/articles" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Articles
              </Link>
              <Link href="https://devninja.in/#trending" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Trending
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}