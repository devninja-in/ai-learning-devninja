'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Step {
  title: string;
  content: ReactNode;
}

interface StepAnimationProps {
  steps: Step[];
  className?: string;
}

export default function StepAnimation({ steps, className = '' }: StepAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className={`bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      <div className="min-h-[400px] relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {steps[currentStep].title}
            </h3>
            <div className="text-gray-300">
              {steps[currentStep].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-700">
        <button
          onClick={goToPrevious}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white transition-opacity ${
            currentStep === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-400'
                    : index < currentStep
                    ? 'bg-gray-500'
                    : 'bg-gray-700'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goToNext}
          disabled={currentStep === steps.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white transition-opacity ${
            currentStep === steps.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-gray-600'
          }`}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
