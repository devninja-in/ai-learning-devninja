'use client'

import { ArrowLeft, BookOpen, Settings, Play, Pause, RotateCcw, Info } from 'lucide-react'
import Link from 'next/link'
import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SimulationLayoutProps {
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  children: ReactNode
  onReset?: () => void
  onPlay?: () => void
  onPause?: () => void
  isPlaying?: boolean
  showControls?: boolean
  learningObjectives?: string[]
}

export default function SimulationLayout({
  title,
  description,
  difficulty,
  category,
  children,
  onReset,
  onPlay,
  onPause,
  isPlaying = false,
  showControls = true,
  learningObjectives = []
}: SimulationLayoutProps) {
  const [showInfo, setShowInfo] = useState(false)

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-devninja-secondary-100 text-devninja-secondary-800 border-devninja-secondary-200 dark:bg-devninja-secondary-900/30 dark:text-devninja-secondary-100 dark:border-devninja-secondary-800'
      case 'Intermediate': return 'bg-devninja-accent-100 text-devninja-accent-800 border-devninja-accent-200 dark:bg-devninja-accent-900/30 dark:text-devninja-accent-100 dark:border-devninja-accent-800'
      case 'Advanced': return 'bg-devninja-danger-100 text-devninja-danger-800 border-devninja-danger-200 dark:bg-devninja-danger-900/30 dark:text-devninja-danger-100 dark:border-devninja-danger-800'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-devninja-primary-50 via-white to-devninja-secondary-50 dark:from-background dark:via-surface dark:to-surface-elevated">
      {/* Header */}
      <header className="nav-devninja">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-foreground-secondary hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm text-foreground-secondary font-code">{category}</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </div>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 text-foreground-secondary hover:text-foreground hover:bg-surface rounded-lg transition-colors"
              >
                <Info size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-devninja-primary-50 dark:bg-surface-elevated border-b border-border overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center">
                    <BookOpen size={18} className="mr-2 text-devninja-primary-600" />
                    About This Simulation
                  </h3>
                  <p className="text-foreground-secondary text-sm leading-relaxed">{description}</p>
                </div>
                {learningObjectives.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Learning Objectives</h3>
                    <ul className="text-sm text-foreground-secondary space-y-1">
                      {learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-devninja-primary-600 mr-2">•</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Header */}
      <div className="bg-white dark:bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="heading-devninja large text-foreground mb-2">{title}</h1>
              <p className="text-foreground-secondary">{description}</p>
            </div>

            {showControls && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onReset}
                  className="flex items-center px-4 py-2 text-foreground bg-surface hover:bg-surface-elevated border border-border rounded-lg transition-colors font-medium"
                >
                  <RotateCcw size={18} className="mr-2" />
                  Reset
                </button>

                <button
                  onClick={isPlaying ? onPause : onPlay}
                  className="btn-devninja-primary flex items-center"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={18} className="mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={18} className="mr-2" />
                      Play
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-surface border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-foreground-secondary">
            <p className="font-code">© 2026 DevNinja AI Learning Platform</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <Link href="/about" className="hover:text-devninja-primary-600 transition-colors font-medium">About</Link>
              <Link href="/help" className="hover:text-devninja-primary-600 transition-colors font-medium">Help</Link>
              <Link href="/feedback" className="hover:text-devninja-primary-600 transition-colors font-medium">Feedback</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}