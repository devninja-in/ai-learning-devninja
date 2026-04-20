import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface QuizOption {
  id: string;
  text: string;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation?: string;
  hint?: string;
}

interface InteractiveQuizProps {
  title: string;
  questions: QuizQuestion[];
  showResults?: boolean;
  allowRetry?: boolean;
  className?: string;
}

export default function InteractiveQuiz({
  title,
  questions,
  showResults = true,
  allowRetry = true,
  className,
}: InteractiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isSubmitted = submittedAnswers[currentQuestion.id];
  const isCorrect = submittedAnswers[currentQuestion.id] === currentQuestion.correctAnswer;

  const correctCount = Object.entries(submittedAnswers).filter(
    ([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      return question && answer === question.correctAnswer;
    }
  ).length;

  const handleSelectAnswer = (optionId: string) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer) {
      setSubmittedAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: selectedAnswer,
      }));
      setShowExplanation(prev => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
      if (showResults) {
        setShowFinalResults(true);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setShowExplanation({});
    setQuizCompleted(false);
    setShowFinalResults(false);
  };

  const getScorePercentage = () => {
    return Math.round((correctCount / questions.length) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return { text: 'Excellent!', color: 'text-success' };
    if (percentage >= 70) return { text: 'Good job!', color: 'text-primary' };
    if (percentage >= 50) return { text: 'Not bad!', color: 'text-accent' };
    return { text: 'Keep practicing!', color: 'text-warning' };
  };

  if (showFinalResults) {
    const { text: scoreText, color: scoreColor } = getScoreMessage();

    return (
      <div className={cn('not-prose', className)}>
        <Card className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-4">
              <Trophy className={cn('h-16 w-16 mx-auto mb-4', scoreColor)} />
              <h3 className="text-h3 font-bold mb-2">Quiz Complete!</h3>
              <p className={cn('text-h2 font-bold mb-2', scoreColor)}>{scoreText}</p>
            </div>

            <div className="bg-surface rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-center">
                  <div className="text-h2 font-bold text-success">{correctCount}</div>
                  <div className="text-foreground/60">Correct</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <div className="text-h2 font-bold text-error">
                    {questions.length - correctCount}
                  </div>
                  <div className="text-foreground/60">Incorrect</div>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <div className="text-h2 font-bold text-primary">
                    {getScorePercentage()}%
                  </div>
                  <div className="text-foreground/60">Score</div>
                </div>
              </div>
            </div>

            {allowRetry && (
              <Button onClick={handleRetry} size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('not-prose', className)}>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-h3 font-bold text-foreground">{title}</h3>
            <div className="text-sm text-foreground/60">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-border rounded-full h-1.5">
            <motion.div
              className="bg-primary h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentQuestionIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-foreground mb-4 leading-relaxed">
              {currentQuestion.question}
            </h4>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectOption = option.id === currentQuestion.correctAnswer;
                const showOptionResult = isSubmitted;

                let optionStyle = 'border-border hover:border-primary/50';
                let iconColor = 'text-foreground/40';

                if (showOptionResult) {
                  if (isCorrectOption) {
                    optionStyle = 'border-success bg-success/10';
                    iconColor = 'text-success';
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'border-error bg-error/10';
                    iconColor = 'text-error';
                  } else {
                    optionStyle = 'border-border bg-surface/50';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-primary bg-primary/10';
                  iconColor = 'text-primary';
                }

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleSelectAnswer(option.id)}
                    disabled={Boolean(isSubmitted)}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border-2 transition-all touch-target',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      optionStyle,
                      !isSubmitted && 'hover:shadow-design-sm',
                      isSubmitted && 'cursor-default'
                    )}
                    whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('flex-shrink-0', iconColor)}>
                        {showOptionResult ? (
                          isCorrectOption ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : isSelected ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                          )
                        ) : (
                          <div
                            className={cn(
                              'h-5 w-5 rounded-full border-2 border-current transition-colors',
                              isSelected && 'bg-current'
                            )}
                          />
                        )}
                      </div>
                      <span className="text-foreground font-medium">{option.text}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation[currentQuestion.id] && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 bg-surface rounded-lg border border-border"
                >
                  <h5 className="font-semibold text-foreground mb-2">Explanation:</h5>
                  <p className="text-foreground/80">{currentQuestion.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <div>
                {currentQuestion.hint && !isSubmitted && !selectedAnswer && (
                  <p className="text-sm text-foreground/60">
                    💡 Hint: {currentQuestion.hint}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                {!isSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} size="lg">
                    {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </Card>
    </div>
  );
}