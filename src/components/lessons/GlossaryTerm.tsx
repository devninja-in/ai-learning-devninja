'use client';

import { ReactNode, useState } from 'react';

interface GlossaryTermProps {
  term: string;
  definition: string;
  children?: ReactNode;
}

export function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="border-b-2 border-dashed border-blue-400 hover:border-blue-600 cursor-help transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children || term}
      </span>

      {isVisible && (
        <span className="absolute z-10 left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          <strong className="block mb-1">{term}</strong>
          {definition}
          <span className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}
