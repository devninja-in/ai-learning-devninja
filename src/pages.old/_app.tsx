import '@/styles/globals.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import type { AppProps } from 'next/app';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';
import Head from 'next/head';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ProgressProvider } from '@/components/providers/ProgressProvider';
import MDXCustomProvider from '@/components/providers/MDXProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>DevNinja AI Learning</title>
        <meta name="description" content="Interactive AI Learning Platform - Master AI from NLP foundations to advanced language models" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph */}
        <meta property="og:title" content="DevNinja AI Learning" />
        <meta property="og:description" content="Interactive AI Learning Platform" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ailearning.devninja.in" />
        <meta property="og:image" content="https://ailearning.devninja.in/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DevNinja AI Learning" />
        <meta name="twitter:description" content="Interactive AI Learning Platform" />
        <meta name="twitter:image" content="https://ailearning.devninja.in/twitter-image.png" />

        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>

      <div
        className={`${inter.variable} ${jetbrainsMono.variable} ${poppins.variable} font-sans`}
      >
        <ThemeProvider>
          <ProgressProvider>
            <MDXCustomProvider>
              <Component {...pageProps} />
            </MDXCustomProvider>
          </ProgressProvider>
        </ThemeProvider>
      </div>
    </>
  );
}