import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            DevNinja AI Learning — Open source AI education
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://devninja.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              DevNinja.in
            </a>
            <a
              href="https://tools.devninja.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Tools
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
