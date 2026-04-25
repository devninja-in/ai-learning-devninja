import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevNinja AI Learning — Learn AI/ML from Scratch',
  description: '30+ interactive lessons covering AI fundamentals, NLP, transformers, and modern language models. From basics to building real AI applications.',
  keywords: ['ai', 'machine learning', 'nlp', 'transformers', 'education', 'interactive learning'],
  authors: [{ name: 'DevNinja.in' }],
  openGraph: {
    title: 'DevNinja AI Learning — Learn AI/ML from Scratch',
    description: '30+ interactive lessons covering AI fundamentals, NLP, transformers, and modern language models.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-gray-900 antialiased`}>
        <SiteHeader />
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
