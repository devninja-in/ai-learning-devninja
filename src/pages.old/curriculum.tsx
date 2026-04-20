import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, CheckCircle, ArrowRight, Target } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAllContent, getPhases, ContentItem } from '@/lib/content';
import { useProgress } from '@/components/providers/ProgressProvider';
import { cn } from '@/lib/utils';

interface CurriculumPageProps {
  phases: Array<{
    phase: number;
    title: string;
    description: string;
    contentCount: number;
    content: ContentItem[];
  }>;
  totalLessons: number;
}

const phaseDescriptions: Record<number, string> = {
  1: 'Master the fundamentals of Natural Language Processing',
  2: 'Deep dive into Transformer architecture and attention mechanisms',
  3: 'Explore language models and their applications',
  4: 'Learn about Large Language Models and RLHF techniques',
  5: 'Advanced attention mechanisms and architectural insights',
  6: 'Understanding model internals and interpretability',
  7: 'Quantization techniques and model optimization',
  8: 'Inference optimization and model serving',
  9: 'AI agents and autonomous systems',
  10: 'Popular frameworks and libraries',
  11: 'Advanced topics and cutting-edge research',
};

export default function CurriculumPage({ phases, totalLessons }: CurriculumPageProps) {
  const { progress } = useProgress();

  const completedLessons = progress.completedLessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Layout>
      <Head>
        <title>AI Learning Curriculum - DevNinja</title>
        <meta
          name="description"
          content="Comprehensive AI curriculum covering NLP fundamentals to advanced language models. 11 phases, interactive lessons, and hands-on projects."
        />
      </Head>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-h1 font-bold text-foreground mb-4">
            AI Learning Curriculum
          </h1>
          <p className="text-body-lg text-foreground/80 max-w-3xl mx-auto mb-8">
            Master AI from foundations to frontiers. Our comprehensive curriculum takes you through
            11 progressive phases, from NLP basics to cutting-edge research.
          </p>

          {/* Progress Overview */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Your Progress</h3>
                  <p className="text-sm text-foreground/60">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-h3 font-bold text-primary">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-foreground/60">Complete</div>
                </div>
              </div>

              <div className="w-full bg-border rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-h4 font-bold text-foreground">{phases.length}</div>
              <div className="text-sm text-foreground/60">Learning Phases</div>
            </div>
            <div className="text-center">
              <Target className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-h4 font-bold text-foreground">{totalLessons}</div>
              <div className="text-sm text-foreground/60">Interactive Lessons</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-h4 font-bold text-foreground">All Levels</div>
              <div className="text-sm text-foreground/60">Beginner to Advanced</div>
            </div>
          </div>
        </motion.div>

        {/* Phases */}
        <div className="space-y-8">
          {phases.map((phase, index) => {
            const phaseCompletedCount = phase.content.filter(item =>
              progress.completedLessons.includes(`phase-${item.metadata.phase}-lesson-${item.metadata.lesson || 1}`)
            ).length;

            const phaseProgress = phase.contentCount > 0 ? (phaseCompletedCount / phase.contentCount) * 100 : 0;
            const isPhaseComplete = phaseCompletedCount === phase.contentCount && phase.contentCount > 0;
            const isCurrentPhase = progress.currentPhase === phase.phase;

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn(
                  'overflow-hidden transition-all hover:shadow-design-md',
                  isCurrentPhase && 'ring-2 ring-primary ring-offset-2',
                  isPhaseComplete && 'bg-success/5 border-success/20'
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-primary font-bold">Phase {phase.phase}</span>
                          {isCurrentPhase && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                              Current
                            </span>
                          )}
                          {isPhaseComplete && (
                            <CheckCircle className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <h2 className="text-h3 font-semibold text-foreground mb-2">
                          {phaseDescriptions[phase.phase] || `Phase ${phase.phase}`}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-foreground/60">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{phase.contentCount} lessons</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{phaseCompletedCount} completed</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-h4 font-bold text-primary">
                          {Math.round(phaseProgress)}%
                        </div>
                        <div className="w-20 bg-border rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${phaseProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Lessons List */}
                    {phase.content.length > 0 ? (
                      <div className="space-y-3">
                        {phase.content.map((item) => {
                          const lessonId = `phase-${item.metadata.phase}-lesson-${item.metadata.lesson || 1}`;
                          const isCompleted = progress.completedLessons.includes(lessonId);

                          return (
                            <Link
                              key={item.slug}
                              href={`/learn/${item.slug}`}
                              className="group"
                            >
                              <div className={cn(
                                'flex items-center justify-between p-3 rounded-lg border transition-all',
                                'hover:bg-surface hover:shadow-design-sm',
                                isCompleted ? 'bg-success/5 border-success/20' : 'border-border'
                              )}>
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    'w-2 h-2 rounded-full',
                                    isCompleted ? 'bg-success' : 'bg-border'
                                  )} />
                                  <div>
                                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                      {item.metadata.title}
                                    </h4>
                                    {item.metadata.description && (
                                      <p className="text-sm text-foreground/60 mt-1">
                                        {item.metadata.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-foreground/60">
                                  {item.metadata.estimatedTime && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{item.metadata.estimatedTime}m</span>
                                    </div>
                                  )}
                                  {isCompleted && (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  )}
                                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-foreground/60">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Content coming soon</p>
                      </div>
                    )}

                    {/* Phase Action */}
                    {phase.content.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-foreground/60">
                            {isPhaseComplete ? 'Phase Complete! 🎉' :
                             isCurrentPhase ? 'Continue Learning' :
                             'Start Phase'}
                          </div>
                          <Link
                            href={`/learn/${phase.content[0].slug}`}
                            className="inline-flex"
                          >
                            <Button size="sm">
                              {isCurrentPhase ? 'Continue' : 'Start Phase'}
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-h3 font-bold text-foreground mb-4">
              Ready to Begin Your AI Journey?
            </h3>
            <p className="text-foreground/80 mb-6">
              Start with Phase 1 and work your way through our comprehensive curriculum.
              Each lesson builds on the previous one, ensuring you develop a solid foundation.
            </p>
            <Link href="/learn/phase-1-nlp-foundations/introduction-to-nlp">
              <Button size="lg">
                Start Learning Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<CurriculumPageProps> = async () => {
  const allContent = getAllContent();
  const phases = getPhases();

  // Group content by phase
  const phasesWithContent = phases.map((phase) => ({
    ...phase,
    content: allContent.filter((item) => item.metadata.phase === phase.phase),
  }));

  return {
    props: {
      phases: phasesWithContent,
      totalLessons: allContent.length,
    },
  };
};