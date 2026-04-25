'use client';

import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { LessonMeta, getLevelInfo } from '@/data/curriculum';

interface LessonHeaderProps {
  lesson: LessonMeta;
}

export function LessonHeader({ lesson }: LessonHeaderProps) {
  const levelInfo = getLevelInfo(lesson.level);

  const difficultyMap: Record<string, string> = {
    'foundations': 'Beginner',
    'deep-learning': 'Intermediate',
  };

  const difficulty = difficultyMap[lesson.level] || 'Advanced';

  return (
    <div className="border-b border-gray-200 pb-8 mb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Link href="/learn" className="hover:text-gray-900 transition-colors">
          Learning Path
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/learn/${lesson.level}`} className="hover:text-gray-900 transition-colors">
          {levelInfo?.name || lesson.level}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{lesson.title}</span>
      </nav>

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        {lesson.title}
      </h1>

      {/* Subtitle */}
      {lesson.subtitle && (
        <p className="text-xl text-gray-600 mb-6">
          {lesson.subtitle}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-6 text-sm">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
          {difficulty}
        </span>
        <span className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-4 h-4" />
          {lesson.estimatedMinutes} min
        </span>
      </div>

      {/* Prerequisites */}
      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Prerequisites
          </p>
          <ul className="space-y-1">
            {lesson.prerequisites.map((prereqSlug, index) => (
              <li key={index} className="text-sm text-gray-600">
                {prereqSlug}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
