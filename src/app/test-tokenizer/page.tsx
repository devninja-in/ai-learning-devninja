'use client'

import TokenizationSimulation from '@/components/educational/TokenizationSimulation'
import TokenizerDemo from '@/components/educational/TokenizerDemo'

export default function TestTokenizerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Tokenizer Component Test</h1>

      <div className="space-y-12">
        {/* Basic TokenizationSimulation */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic TokenizationSimulation</h2>
          <TokenizationSimulation />
        </section>

        {/* TokenizationSimulation with custom props */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Custom TokenizationSimulation</h2>
          <TokenizationSimulation
            defaultText="Machine learning models need structured input representations."
            encodings={['word', 'subword']}
            showStatistics={true}
            showTokenDetails={true}
          />
        </section>

        {/* Full TokenizerDemo */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Full TokenizerDemo</h2>
          <TokenizerDemo
            defaultText="Artificial intelligence is transforming our world."
            showStatistics={true}
            showTokenDetails={true}
          />
        </section>

        {/* Compact TokenizerDemo */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Compact TokenizerDemo</h2>
          <TokenizerDemo
            defaultText="NLP preprocessing requires careful tokenization."
            compact={true}
            showStatistics={true}
          />
        </section>
      </div>
    </div>
  )
}