import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LessonMeta, getNextLesson, getRelatedLessons } from '@/data/curriculum';

interface NextLessonProps {
  currentLesson: LessonMeta;
}

export function NextLesson({ currentLesson }: NextLessonProps) {
  const nextLesson = getNextLesson(currentLesson.slug);
  const relatedLessons = getRelatedLessons(currentLesson.slug).slice(0, 3);

  return (
    <div className="mt-12 space-y-8">
      {/* Next Lesson CTA */}
      {nextLesson && (
        <Link
          href={`/learn/${nextLesson.slug}`}
          className="block group"
        >
          <div className="bg-gray-900 text-white rounded-lg p-6 hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Next Lesson</p>
                <h3 className="text-xl font-semibold mb-2">{nextLesson.title}</h3>
                {nextLesson.subtitle && (
                  <p className="text-gray-300">{nextLesson.subtitle}</p>
                )}
              </div>
              <ArrowRight className="w-6 h-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      )}

      {/* Related Lessons */}
      {relatedLessons.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Related Topics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedLessons.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/learn/${lesson.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
              >
                <h4 className="font-medium text-gray-900 mb-1">
                  {lesson.title}
                </h4>
                {lesson.subtitle && (
                  <p className="text-sm text-gray-600">{lesson.subtitle}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
