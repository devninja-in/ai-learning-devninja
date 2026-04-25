import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { levels, getLevelLessons } from '@/data/curriculum';

export const metadata: Metadata = {
  title: 'Learning Path - DevNinja AI Learning',
  description: '30 interactive AI lessons from foundations to production. Start anywhere or follow the recommended path.',
};

export default function LearningPathPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Learning Path
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Click any topic to start. Follow the numbers for the recommended order, or jump to whatever catches your eye.
        </p>
      </div>

      {/* Level Sections */}
      <div className="space-y-12">
        {levels.map((level) => {
          const levelLessons = getLevelLessons(level.id);

          return (
            <section key={level.id}>
              {/* Level Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-2 h-2 rounded-full ${level.dotColor}`} />
                <h2 className={`text-sm font-semibold uppercase tracking-wider ${level.textColor}`}>
                  {level.name}
                </h2>
              </div>
              <p className="text-sm text-gray-500 mb-6 ml-5">
                {level.description}
              </p>

              {/* Lesson Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {levelLessons.map((lesson) => {
                  const isReady = lesson.status === 'ready';

                  return (
                    <Link
                      key={lesson.slug}
                      href={isReady ? `/learn/${lesson.slug}` : '#'}
                      className={`group block bg-white rounded-lg border ${level.borderColor} border-l-[3px] p-4 transition-all ${
                        isReady
                          ? 'hover:shadow-md cursor-pointer'
                          : 'cursor-default opacity-60'
                      }`}
                    >
                      {/* Lesson Number & Title */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-400">
                            {lesson.number.toString().padStart(2, '0')}
                          </span>
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {lesson.subtitle}
                        </p>
                      </div>

                      {/* Bottom Row: Time & CTA */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          <span>{lesson.estimatedMinutes} min</span>
                        </div>
                        {isReady ? (
                          <div className="flex items-center gap-1 text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Start</span>
                            <ArrowRight size={12} />
                          </div>
                        ) : (
                          <span className="text-gray-400">Coming soon</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
