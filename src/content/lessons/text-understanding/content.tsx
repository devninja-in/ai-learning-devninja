'use client';

import { LessonSection } from '@/components/lessons/LessonSection';
import { KeyTakeaways } from '@/components/lessons/KeyTakeaways';
import { GoDeeper } from '@/components/lessons/GoDeeper';
import FlowDiagram from '@/components/diagrams/FlowDiagram';
import StepAnimation from '@/components/diagrams/StepAnimation';
import TextUnderstandingSim from '@/components/simulations/TextUnderstandingSim';
import { QuizQuestion } from '@/components/lessons/QuizQuestion';

export default function TextUnderstandingContent() {
  return (
    <div className="space-y-12">
      {/* Section 1: Hook */}
      <LessonSection id="hook">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            Try explaining the color blue to a computer. Not as a wavelength &mdash;
            as the <em>concept</em>. The feeling of a clear sky. You can&apos;t,
            right? That&apos;s the fundamental problem of NLP. Computers don&apos;t
            understand language. They understand numbers. So our job is to figure
            out clever ways to turn words into numbers without losing too much
            meaning along the way.
          </p>

          <p className="text-gray-700 leading-relaxed">
            This lesson is about the oldest, simplest approaches to that problem.
            They&apos;re not perfect &mdash; modern AI has moved way beyond them
            &mdash; but they&apos;re the foundation everything else builds on. And
            honestly, they&apos;re still used in production all over the place,
            because sometimes simple works.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We&apos;ll look at how to preprocess text so computers can work with
            it, then explore two classic ways of turning words into numbers: Bag of
            Words and TF-IDF. By the end, you&apos;ll understand why &quot;counting
            words&quot; is both surprisingly useful and deeply flawed.
          </p>
        </div>
      </LessonSection>

      {/* Section 2: Concept */}
      <LessonSection id="concept" title="The language gap">
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Language is absurdly hard for computers. Think about everything your
            brain does when you read a sentence. You resolve ambiguity
            (&quot;bank&quot; &mdash; river bank or savings bank?). You infer
            context. You pick up on sarcasm, tone, and implied meaning. You know
            that &quot;hot dog&quot; isn&apos;t a warm puppy.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Computers get none of that for free. To them, text is just a sequence
            of bytes. The word &quot;cat&quot; is no more related to &quot;kitten&quot;
            than it is to &quot;catapult&quot;. So before any analysis can happen,
            we need to transform raw text into something mathematical &mdash; a
            numerical representation the computer can actually work with.
          </p>

          <div className="not-prose">
            <FlowDiagram
              title="From text to math"
              nodes={[
                { id: 'raw', label: 'Raw Text', type: 'input' },
                { id: 'preprocess', label: 'Preprocessing', sublabel: 'clean, normalize, split', type: 'process' },
                { id: 'numerical', label: 'Numerical Representation', sublabel: 'vectors of numbers', type: 'process' },
                { id: 'model', label: 'Model', sublabel: 'classification, search, etc.', type: 'output' },
              ]}
            />
          </div>

          <p className="text-gray-700 leading-relaxed">
            The challenge is that every step in this pipeline throws away some
            information. Preprocessing removes punctuation and casing. Numerical
            representation loses word order. The art is in keeping enough meaning
            to be useful while making the data simple enough for math to work on.
          </p>
        </div>
      </LessonSection>

      {/* Section 3: How It Works */}
      <LessonSection id="how-it-works" title="From words to numbers">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Let&apos;s walk through the classic pipeline. These steps were developed
            decades ago, and even though modern deep learning approaches skip some
            of them, understanding this pipeline gives you the vocabulary to talk
            about NLP at any level.
          </p>

          <StepAnimation
            steps={[
              {
                title: 'Text Preprocessing',
                content: (
                  <div className="space-y-4">
                    <p>
                      Before you can count anything, you need to clean the text.
                      This usually means three things: lowercasing everything,
                      stripping punctuation, and splitting the text into individual
                      words (called <strong className="text-white">tokenizing</strong>).
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-2">
                        <span className="text-blue-400 text-sm font-medium">Input</span>
                        <div className="text-white text-sm mt-1 font-mono">&quot;The Cat sat, on the MAT!&quot;</div>
                      </div>
                      <div className="text-gray-500 self-center">&rarr;</div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-2">
                        <span className="text-purple-400 text-sm font-medium">Cleaned</span>
                        <div className="text-white text-sm mt-1 font-mono">[&quot;the&quot;, &quot;cat&quot;, &quot;sat&quot;, &quot;on&quot;, &quot;the&quot;, &quot;mat&quot;]</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      Why lowercase? Because to a computer, &quot;Cat&quot; and &quot;cat&quot;
                      are completely different strings. Lowercasing ensures they get
                      counted as the same word. Removing punctuation stops &quot;mat&quot;
                      and &quot;mat!&quot; from being treated as different words.
                    </p>
                  </div>
                ),
              },
              {
                title: 'Bag of Words',
                content: (
                  <div className="space-y-4">
                    <p>
                      The simplest way to represent text as numbers: just count how
                      many times each word appears. Each document becomes a <strong className="text-white">vector
                      of word counts</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-blue-500 bg-blue-500/10 rounded-lg px-4 py-3">
                        <span className="text-blue-400 text-sm font-medium">Document</span>
                        <div className="text-white text-sm mt-1">&quot;the cat sat on the mat&quot;</div>
                      </div>
                      <div className="border-2 border-purple-500 bg-purple-500/10 rounded-lg px-4 py-3">
                        <span className="text-purple-400 text-sm font-medium">Bag of Words</span>
                        <div className="text-white text-sm mt-1 font-mono">
                          the: 2, cat: 1, sat: 1, on: 1, mat: 1
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      It&apos;s called a &quot;bag&quot; of words because you dump all
                      the words in, shake them up, and just count. Word order is
                      completely thrown away. &quot;Dog bites man&quot; and &quot;man
                      bites dog&quot; produce the exact same vector.
                    </p>
                  </div>
                ),
              },
              {
                title: 'TF-IDF — Finding What Actually Matters',
                content: (
                  <div className="space-y-4">
                    <p>
                      Bag of Words has a glaring problem: it treats every word equally.
                      The word &quot;the&quot; might appear 50 times, but it tells you
                      <em> nothing</em> about the document&apos;s topic. <strong className="text-white">TF-IDF</strong> fixes
                      this by weighing words based on importance.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-green-500 bg-green-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-green-400 text-sm font-medium mb-1">TF (Term Frequency)</div>
                        <div className="text-white text-sm">How often the word appears <em>in this document</em></div>
                      </div>
                      <div className="border-2 border-amber-500 bg-amber-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-amber-400 text-sm font-medium mb-1">IDF (Inverse Document Frequency)</div>
                        <div className="text-white text-sm">How rare the word is <em>across all documents</em></div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">
                      A word that appears frequently in one document but rarely in
                      others gets a high TF-IDF score &mdash; it&apos;s probably
                      important. A word like &quot;the&quot; that appears everywhere
                      gets crushed to near zero. The result is a much better signal
                      about what the document is actually about.
                    </p>
                  </div>
                ),
              },
              {
                title: 'The Limitation — Order Is Lost',
                content: (
                  <div className="space-y-4">
                    <p>
                      Both Bag of Words and TF-IDF have a fundamental flaw: they
                      throw away word order entirely. This means they can&apos;t
                      distinguish between sentences that use the same words
                      differently.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-red-400 text-sm font-medium mb-1">Sentence A</div>
                        <div className="text-white text-sm">&quot;dog bites man&quot;</div>
                      </div>
                      <div className="border-2 border-red-500 bg-red-500/10 rounded-lg px-4 py-3 text-center">
                        <div className="text-red-400 text-sm font-medium mb-1">Sentence B</div>
                        <div className="text-white text-sm">&quot;man bites dog&quot;</div>
                      </div>
                    </div>

                    <p className="text-sm">
                      <strong className="text-white">Same bag of words. Completely different
                      meaning.</strong> This limitation is why NLP eventually moved
                      to neural approaches like word embeddings and transformers,
                      which can capture word order and context. But bag-of-words
                      methods are still useful for many real tasks like search,
                      spam filtering, and document classification.
                    </p>
                  </div>
                ),
              },
            ]}
          />

          <GoDeeper title="A brief history of NLP approaches">
            <div className="prose prose-gray prose-sm max-w-none">
              <p className="text-gray-700">
                NLP has gone through roughly three eras. The first was <strong>rule-based</strong> (1950s-1990s):
                linguists hand-wrote grammar rules and dictionaries. This worked for narrow domains
                but broke down for anything messy or ambiguous. You&apos;d need thousands of rules
                just to handle basic English, and they&apos;d still miss edge cases.
              </p>
              <p className="text-gray-700">
                The second era was <strong>statistical</strong> (1990s-2010s): instead of rules,
                researchers used probability. Bag of Words, TF-IDF, and techniques like Naive Bayes
                and Hidden Markov Models turned text into numbers and let algorithms find patterns.
                This was a huge leap &mdash; suddenly you could build a spam filter without
                manually defining what spam looks like.
              </p>
              <p className="text-gray-700">
                The third and current era is <strong>neural</strong> (2013-present): Word2Vec showed
                that neural networks could learn word meanings from context. Then RNNs learned to
                handle sequences, and transformers (2017) cracked the code on long-range dependencies.
                GPT, BERT, and their descendants are all products of this era. They don&apos;t need
                hand-crafted features at all &mdash; they learn representations directly from raw
                text.
              </p>
            </div>
          </GoDeeper>
        </div>
      </LessonSection>

      {/* Section 4: Simulation */}
      <LessonSection id="simulation" title="Now try it yourself">
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Type a sentence into the box below and watch how Bag of Words and TF-IDF
            represent it differently. Notice how the &quot;Bag of Words&quot; tab
            treats every word the same &mdash; common words like &quot;the&quot;
            dominate the chart. Then switch to &quot;TF-IDF&quot; and see how
            those common words get pushed down while the interesting words rise
            to the top. Try toggling &quot;Remove stop words&quot; to see the
            difference that simple filter makes.
          </p>

          <TextUnderstandingSim />
        </div>
      </LessonSection>

      {/* Section 5: Takeaways */}
      <LessonSection id="takeaways">
        <KeyTakeaways
          points={[
            'Computers don\'t understand text — they need it converted to numbers first. Text preprocessing (lowercasing, removing punctuation, splitting into words) is always the first step.',
            'Bag of Words is the simplest approach: count word occurrences and represent each document as a vector of counts. Simple, interpretable, and surprisingly useful for many tasks.',
            'TF-IDF improves on Bag of Words by weighing words based on importance — words that are frequent in one document but rare overall score highest.',
            'Both methods throw away word order entirely. "Dog bites man" and "man bites dog" produce identical representations. This is their fundamental limitation.',
            'Despite their limitations, these methods are still widely used in search engines, spam filters, and document classifiers because they\'re fast, interpretable, and often good enough.',
          ]}
          misconceptions={[
            '"Computers can read text." — They can\'t. They do math on number representations of text. Every NLP system starts by converting words to numbers, and every conversion loses some information.',
            '"Bag of Words is obsolete." — It\'s limited, but it\'s still used in production systems everywhere. For tasks like keyword search or simple document classification, it often outperforms more complex approaches in speed and interpretability.',
            '"TF-IDF understands meaning." — It doesn\'t. It\'s a statistical trick that surfaces distinctive words. It can\'t tell you that "happy" and "joyful" mean the same thing — that requires word embeddings or neural approaches.',
          ]}
        />
      </LessonSection>

      {/* Section 6: Quiz */}
      <LessonSection id="quiz" title="Quick check">
        <QuizQuestion
          question="Why is TF-IDF generally better than raw word counts (Bag of Words) for understanding what a document is about?"
          options={[
            { text: 'It counts words faster than Bag of Words', isCorrect: false },
            { text: 'It preserves the order of words in the document', isCorrect: false },
            { text: 'It weighs down common words and highlights distinctive ones', isCorrect: true },
            { text: 'It understands the meaning of words using a dictionary', isCorrect: false },
          ]}
          explanation="TF-IDF multiplies how often a word appears in a specific document (TF) by how rare it is across all documents (IDF). This means common words like 'the' or 'is' that appear everywhere get very low scores, while words that are frequent in one document but rare overall — the words that actually tell you what the document is about — get high scores. It doesn't understand meaning or word order; it's purely a statistical weighting that surfaces distinctive vocabulary."
        />
      </LessonSection>
    </div>
  );
}
