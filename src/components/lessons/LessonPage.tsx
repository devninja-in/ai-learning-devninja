import { ReactNode } from 'react';
import { LessonMeta } from '@/data/curriculum';
import { LessonHeader } from './LessonHeader';
import { NextLesson } from './NextLesson';

interface LessonPageProps {
  lesson: LessonMeta;
  children: ReactNode;
}

export function LessonPage({ lesson, children }: LessonPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <LessonHeader lesson={lesson} />

      <div className="prose prose-custom">
        {children}
      </div>

      <NextLesson currentLesson={lesson} />
    </div>
  );
}
