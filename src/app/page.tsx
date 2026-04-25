import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { levels, getLevelLessons, getLessonBySlug } from '@/data/curriculum';

export default function HomePage() {
  const featuredSlugs = ['what-is-ai', 'neural-networks', 'agents-reasoning'];
  const featuredLessons = featuredSlugs
    .map(slug => getLessonBySlug(slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider rounded-full">
            Free & Open Source
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Learn AI & Machine Learning
            <br />
            from scratch.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            30 interactive lessons with animated diagrams and hands-on simulations. No prerequisites. Go from "what is AI?" to building production systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/learn/what-is-ai"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Learning
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Browse Topics
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">30</div>
              <div className="text-sm text-gray-500 mt-1">Lessons</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-500 mt-1">Levels</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">30+</div>
              <div className="text-sm text-gray-500 mt-1">Simulations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-500 mt-1">Free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Preview */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your learning journey</h2>
            <p className="text-lg text-gray-500">Progress through 5 carefully designed levels</p>
          </div>

          <div className="relative">
            {/* Desktop: horizontal path with connecting lines */}
            <div className="hidden md:flex items-center justify-between">
              {levels.map((level, index) => {
                const levelLessons = getLevelLessons(level.id);
                return (
                  <div key={level.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full border-4 ${level.borderColor} bg-white flex items-center justify-center mb-3`}
                      >
                        <span className={`text-xl font-bold ${level.textColor}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 text-center max-w-[120px]">
                        {level.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {levelLessons.length} lessons
                      </div>
                    </div>
                    {index < levels.length - 1 && (
                      <div className="w-12 lg:w-24 h-0.5 bg-gray-200 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: vertical stack without lines */}
            <div className="md:hidden space-y-6">
              {levels.map((level, index) => {
                const levelLessons = getLevelLessons(level.id);
                return (
                  <div key={level.id} className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-full border-4 ${level.borderColor} bg-white flex items-center justify-center flex-shrink-0`}
                    >
                      <span className={`text-lg font-bold ${level.textColor}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {level.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {levelLessons.length} lessons
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Lessons */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Start here</h2>
            <p className="text-lg text-gray-500">Popular lessons to begin your journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredLessons.map(lesson => {
              if (!lesson) return null;
              const levelInfo = levels.find(l => l.id === lesson.level);
              const isReady = lesson.status === 'ready';

              return (
                <Link
                  key={lesson.slug}
                  href={isReady ? `/learn/${lesson.slug}` : '#'}
                  className={`block bg-white rounded-xl border border-gray-200 p-6 transition-shadow ${
                    isReady ? 'hover:shadow-lg cursor-pointer' : 'cursor-not-allowed opacity-75'
                  }`}
                >
                  {levelInfo && (
                    <div className={`inline-block px-2 py-1 ${levelInfo.bgColor} ${levelInfo.textColor} text-xs font-semibold rounded mb-3`}>
                      {levelInfo.name}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {lesson.subtitle}
                  </p>
                  <div className={`text-sm font-medium ${isReady ? 'text-blue-600' : 'text-gray-400'}`}>
                    {isReady ? 'Start →' : 'Coming soon'}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
