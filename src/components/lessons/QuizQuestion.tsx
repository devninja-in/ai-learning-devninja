'use client';

import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestionProps {
  question: string;
  options: QuizOption[];
  explanation: string;
}

export function QuizQuestion({ question, options, explanation }: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {question}
      </h3>

      <div className="space-y-3 mb-4">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const showFeedback = selectedAnswer !== null;
          const isCorrect = option.isCorrect;

          let buttonClasses = 'w-full text-left p-4 border-2 rounded-lg transition-colors ';

          if (!showFeedback) {
            buttonClasses += 'border-gray-200 hover:border-blue-500 hover:bg-blue-50';
          } else if (isSelected && isCorrect) {
            buttonClasses += 'border-green-500 bg-green-50';
          } else if (isSelected && !isCorrect) {
            buttonClasses += 'border-red-500 bg-red-50';
          } else if (isCorrect) {
            buttonClasses += 'border-green-500 bg-green-50';
          } else {
            buttonClasses += 'border-gray-200 bg-gray-50';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={selectedAnswer !== null}
              className={buttonClasses}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{option.text}</span>
                {showFeedback && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">{explanation}</p>
        </div>
      )}
    </div>
  );
}
