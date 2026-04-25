import { CheckCircle } from 'lucide-react';

interface KeyTakeawaysProps {
  points: string[];
  misconceptions?: string[];
}

export function KeyTakeaways({ points, misconceptions }: KeyTakeawaysProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      {/* Key Points */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Key Takeaways
        </h3>
        <ul className="space-y-3">
          {points.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Common Misconceptions */}
      {misconceptions && misconceptions.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Common Misconceptions
          </h3>
          <ul className="space-y-3">
            {misconceptions.map((misconception, index) => (
              <li
                key={index}
                className="pl-4 border-l-2 border-amber-400 text-gray-700"
              >
                {misconception}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
