import { ReactNode } from 'react';

interface LessonSectionProps {
  id: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function LessonSection({ id, title, children, className = '' }: LessonSectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
