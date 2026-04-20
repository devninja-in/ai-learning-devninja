import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProgress } from '@/components/providers/ProgressProvider';
import { cn } from '@/lib/utils';

interface LessonLayoutProps {
  children: ReactNode;
  phase: number;
  lesson: number;
  title: string;
  description?: string;
  estimatedTime?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  previousLesson?: { phase: number; lesson: number; title: string };
  nextLesson?: { phase: number; lesson: number; title: string };
  objectives?: string[];
  prerequisites?: string[];
}

export default function LessonLayout({
  children,
  phase,
  lesson,
  title,
  description,
  estimatedTime,
  difficulty = 'beginner',
  previousLesson,
  nextLesson,
  objectives,
  prerequisites,
}: LessonLayoutProps) {
  const { progress, completeLesson } = useProgress();
  const lessonId = `phase-${phase}-lesson-${lesson}`;
  const isCompleted = progress.completedLessons.includes(lessonId);

  const handleCompleteLesson = () => {
    completeLesson(lessonId);
  };

  const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="h-1 bg-surface">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(lesson / 10) * 100}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Lesson Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-foreground/60 mb-4">
            <Link
              href="/curriculum"
              className="hover:text-primary transition-colors"
            >
              Curriculum
            </Link>
            <span>/</span>
            <Link
              href={`/curriculum/phase-${phase}`}
              className="hover:text-primary transition-colors"
            >
              Phase {phase}
            </Link>
            <span>/</span>
            <span>Lesson {lesson}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-h1 font-bold text-foreground">{title}</h1>
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-success flex-shrink-0" />
                )}
              </div>
              {description && (
                <p className="text-body-lg text-foreground/80 reading-width">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <Clock className="h-4 w-4" />
                <span>{estimatedTime || 15} min read</span>
              </div>
              <span
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full capitalize',
                  difficultyColors[difficulty]
                )}
              >
                {difficulty}
              </span>
            </div>
          </div>

          {/* Lesson Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {objectives && objectives.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Learning Objectives
                  </h3>
                </div>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {prerequisites && prerequisites.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-secondary" />
                  <h3 className="font-semibold text-foreground">Prerequisites</h3>
                </div>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <span>{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Lesson Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="prose prose-lg max-w-none content-spacing"
        >
          {children}
        </motion.article>

        {/* Lesson Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-12 pt-8 border-t border-border"
        >
          {/* Complete Lesson Button */}
          {!isCompleted && (
            <div className="mb-8">
              <Button
                onClick={handleCompleteLesson}
                size="lg"
                className="bg-success hover:bg-success/90 text-white"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Mark as Complete
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {previousLesson ? (
              <Link
                href={`/curriculum/phase-${previousLesson.phase}/lesson-${previousLesson.lesson}`}
                className="group"
              >
                <Card className="p-4 hover:shadow-design-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <ArrowLeft className="h-4 w-4 text-foreground/60 group-hover:text-primary transition-colors" />
                    <div>
                      <div className="text-xs text-foreground/60 mb-1">
                        Previous Lesson
                      </div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {previousLesson.title}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ) : (
              <div /> // Empty div to maintain layout
            )}

            {nextLesson && (
              <Link
                href={`/curriculum/phase-${nextLesson.phase}/lesson-${nextLesson.lesson}`}
                className="group"
              >
                <Card className="p-4 hover:shadow-design-md transition-shadow">
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      <div className="text-xs text-foreground/60 mb-1">
                        Next Lesson
                      </div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {nextLesson.title}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-foreground/60 group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}