'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import TokenizationSim from '@/components/simulations/TokenizationSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function TokenizationContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Imagine you&apos;ve got a massive pile of LEGO bricks dumped on the floor. Before
            you can build anything, you need to sort them &mdash; figure out which pieces you
            have, group similar ones together, maybe break apart some that are stuck. That&apos;s
            basically what tokenization does with text.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Here&apos;s the thing most people miss: computers can&apos;t read. Not in any
            meaningful sense. They work with numbers. So before a language model can do
            <em> anything</em> with your prompt &mdash; answer a question, write code,
            summarize an article &mdash; it first has to chop that text into smaller pieces
            and convert each piece into a number. Those pieces are called <strong>tokens</strong>.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Tokenization is one of those foundational steps that sounds boring until you realize
            it affects <em>everything</em>. How many tokens your text uses determines how much
            context the model can see. Whether it handles rare words or typos gracefully? That
            depends on the tokenizer. Even the cost of an API call is measured in tokens. So
            yeah &mdash; worth understanding.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="Breaking text into pieces">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            At its core, tokenization is just splitting text into chunks that the model can work
            with. Sometimes a token is a full word. Sometimes it&apos;s part of a word. Sometimes
            it&apos;s a single character or even a punctuation mark. The method you choose
            has real consequences.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="Tokenization in action"
              nodes={[
                { id: 'input', label: '"Hello, how are you?"', type: 'input' },
                { id: 'tokenizer', label: 'Tokenizer', type: 'process' },
                { id: 'output', label: '["Hello", ",", "how", "are", "you", "?"]', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            Why does this matter so much? Three big reasons. First, <strong>vocabulary
            size</strong> &mdash; the tokenizer decides how many unique tokens the model needs
            to know. A word-level tokenizer for English might need 500,000+ entries. That&apos;s
            a huge lookup table, and it gets worse with every new language.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Second, <strong>context window usage</strong>. Models have a fixed number of tokens
            they can process at once (GPT-4 can handle 128k tokens, for instance). If your
            tokenizer is inefficient and turns every word into five tokens, you&apos;re burning
            through that window fast.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Third, <strong>rare word handling</strong>. What happens when the model encounters
            &quot;supercalifragilisticexpialidocious&quot; or a misspelling like
            &quot;definately&quot;? A word-level tokenizer just shrugs &mdash; it&apos;s never
            seen those before. A smarter tokenizer breaks them into familiar pieces and handles
            them gracefully.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="Four ways to tokenize">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            There&apos;s more than one way to slice text into tokens, and each approach makes
            different trade-offs. Let&apos;s walk through the four main strategies.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Word Tokenization',
                content: (
                  <div className="space-y-4">
                    <p>
                      The simplest approach: split on spaces and punctuation. Each word
                      becomes its own token.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-2">
                        <span className="text-blue-400 text-sm font-medium">Input</span>
                        <div className="text-white text-sm mt-1 font-mono">&quot;I love preprocessing&quot;</div>
                      </div>
                      <div className="text-gray-500 self-center">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-2">
                        <span className="text-purple-400 text-sm font-medium">Tokens</span>
                        <div className="text-white text-sm mt-1 font-mono">[&quot;I&quot;, &quot;love&quot;, &quot;preprocessing&quot;]</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Pros:</strong> dead simple, intuitive,
                      easy to implement.
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Cons:</strong> vocabulary explodes fast.
                      Every verb conjugation (&quot;run&quot;, &quot;running&quot;, &quot;runs&quot;,
                      &quot;ran&quot;) is a separate entry. Add multiple languages and you&apos;re
                      looking at millions of tokens. New words or typos? Completely unknown.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Character Tokenization',
                content: (
                  <div className="space-y-4">
                    <p>
                      Go to the other extreme: every single character is its own token. Letters,
                      spaces, punctuation &mdash; all separate.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-2">
                        <span className="text-blue-400 text-sm font-medium">Input</span>
                        <div className="text-white text-sm mt-1 font-mono">&quot;cat&quot;</div>
                      </div>
                      <div className="text-gray-500 self-center">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-2">
                        <span className="text-purple-400 text-sm font-medium">Tokens</span>
                        <div className="text-white text-sm mt-1 font-mono">[&quot;c&quot;, &quot;a&quot;, &quot;t&quot;]</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Pros:</strong> tiny vocabulary (just ~256
                      characters covers most languages). Can handle <em>any</em> word, even
                      typos and made-up words.
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong className="text-white">Cons:</strong> sequences get absurdly long.
                      The word &quot;artificial&quot; becomes 10 tokens instead of 1. The model
                      has to work much harder to learn that &quot;c-a-t&quot; means a furry animal.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Subword Tokenization (BPE)',
                content: (
                  <div className="space-y-4">
                    <p>
                      This is the sweet spot, and it&apos;s what modern LLMs actually use. The
                      idea: start with characters, then <strong className="text-white">iteratively
                      merge the most common pairs</strong> until you hit a target vocabulary size.
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-2">
                        <span className="text-blue-400 text-sm font-medium">Input</span>
                        <div className="text-white text-sm mt-1 font-mono">&quot;unhappiness&quot;</div>
                      </div>
                      <div className="text-gray-500 self-center">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-2">
                        <span className="text-purple-400 text-sm font-medium">Tokens</span>
                        <div className="text-white text-sm mt-1 font-mono">[&quot;un&quot;, &quot;happi&quot;, &quot;ness&quot;]</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Pros:</strong> manageable vocabulary
                      (~50k tokens), handles rare words by breaking them into known pieces,
                      compresses common words into single tokens for efficiency.
                    </p>
                    <p className="text-sm text-gray-400">
                      Common words like &quot;the&quot; or &quot;and&quot; get their own token.
                      Rare words get split into smaller recognizable chunks. Best of both worlds.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Real-World Example: GPT\'s Tokenizer',
                content: (
                  <div className="space-y-4">
                    <p>
                      GPT models use BPE with a vocabulary of about 50,000 tokens. In
                      practice, that means common English text gets compressed to roughly
                      <strong className="text-white"> 1 token per 4 characters</strong> on
                      average. That&apos;s pretty efficient.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-green-400 text-sm font-medium mb-1">Word-level</div>
                        <div className="text-white text-lg font-bold">~500k+</div>
                        <div className="text-gray-400 text-xs">vocabulary entries</div>
                      </div>
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-blue-400 text-sm font-medium mb-1">BPE (GPT)</div>
                        <div className="text-white text-lg font-bold">~50k</div>
                        <div className="text-gray-400 text-xs">vocabulary entries</div>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-purple-400 text-sm font-medium mb-1">Character</div>
                        <div className="text-white text-lg font-bold">~256</div>
                        <div className="text-gray-400 text-xs">vocabulary entries</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      The 50k sweet spot gives you enough coverage to handle English, code,
                      and many other languages without the vocabulary bloat of word-level
                      tokenization or the sequence-length explosion of character-level.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <p className="text-gray-700 leading-relaxed">
            So why did BPE win? It boils down to a practical trade-off. Word-level tokenization
            gives you short sequences but an unmanageable vocabulary. Character-level gives you
            a tiny vocabulary but painfully long sequences. BPE sits right in the middle &mdash;
            a vocabulary of around 50,000 tokens that can represent virtually any text
            efficiently. Common words stay as single tokens (fast to process), and rare or
            unknown words get broken into familiar subword pieces (graceful degradation instead
            of a brick wall).
          </p>

          <GoDeeper title="How BPE training actually works">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                BPE training starts with every character as its own token. Then it counts
                every pair of adjacent tokens across the entire training corpus. The most
                frequent pair gets merged into a single new token. Repeat thousands of times.
              </p>
              <p className="text-gray-700">
                For example, if &quot;t&quot; and &quot;h&quot; appear next to each other more
                than any other pair, they merge into &quot;th&quot;. Then maybe &quot;th&quot;
                and &quot;e&quot; merge into &quot;the&quot;. After enough merges, you end up
                with common words as single tokens and rare words that can still be represented
                as combinations of smaller tokens.
              </p>
              <p className="text-gray-700">
                The algorithm stops when the vocabulary reaches a target size (like 50,000).
                The final merge rules are saved and used at inference time to tokenize new
                text using the same learned vocabulary. It&apos;s elegant in its simplicity
                &mdash; no linguistic knowledge required, just pair counting and merging.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Time to get hands-on. Type anything into the box below and watch how different
            tokenization methods break it apart. Try long compound words like
            &quot;internationalization&quot; to see how subword methods handle them. Paste some
            code and see how differently it tokenizes compared to prose. Throw in some emojis.
            The more you experiment, the more intuition you&apos;ll build about how tokenizers
            actually see your text.
          </p>

          <TokenizationSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Tokenization is the very first step in any NLP pipeline. It converts raw text into numbered tokens that the model can actually process.',
            'Word-level tokenization is simple but creates massive vocabularies and can\'t handle unknown words. Character-level is the opposite extreme — tiny vocabulary, but very long sequences.',
            'Subword tokenization (BPE) is the industry standard because it balances vocabulary size (~50k) with sequence length, and it handles rare words by breaking them into known pieces.',
            'Token count directly affects cost and context window usage. More efficient tokenization means you can fit more content into each API call.',
            'Tokenization happens BEFORE the model sees anything. It\'s a fixed preprocessing step — the model never sees raw text, only token IDs.',
          ]}
          misconceptions={[
            '"Tokens are always words." — They\'re not. A token might be a word, part of a word, a single character, or even a punctuation mark. In BPE, "playing" might be two tokens: "play" and "ing".',
            '"Tokenization is a minor implementation detail." — It fundamentally shapes what the model can learn. Languages that tokenize poorly (many characters per token) get worse model performance.',
            '"Tokenization happens inside the model." — It happens before the model. The tokenizer is a separate, deterministic preprocessing step with its own fixed vocabulary.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why is subword tokenization (BPE) preferred over word-level tokenization for modern LLMs?"
          options={[
            { text: 'It produces shorter sequences than any other method', isCorrect: false },
            { text: 'It keeps vocabulary manageable while gracefully handling rare and unknown words', isCorrect: true },
            { text: 'It requires no training data to build the vocabulary', isCorrect: false },
            { text: 'It makes the model run faster because tokens are smaller', isCorrect: false },
          ]}
          explanation="BPE strikes the best balance: a vocabulary of roughly 50,000 tokens is small enough to be practical, yet large enough that common words get their own single token. When the model encounters a rare or unknown word, BPE breaks it into familiar subword pieces rather than giving up entirely (like word-level) or creating an absurdly long sequence (like character-level). This combination of manageable vocabulary size and graceful rare-word handling is why virtually every modern LLM uses some form of subword tokenization."
        />
      </LessonSection>
    </div>
  );
}
