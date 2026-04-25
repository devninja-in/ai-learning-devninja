'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// -------------------------------------------------------------------
// Pre-defined image descriptions (simulating an image database)
// -------------------------------------------------------------------

interface ImageDescription {
  id: string;
  description: string;
  tags: string[];
  captions: string[];
}

const IMAGE_DATABASE: ImageDescription[] = [
  {
    id: 'img1',
    description: 'A tabby cat sleeping on an open laptop keyboard',
    tags: ['cat', 'laptop', 'sleeping', 'pet', 'technology', 'indoor', 'cozy'],
    captions: [
      'A tabby cat napping on a laptop, paws resting on the keyboard.',
      'A cat sleeps comfortably on someone\'s open laptop.',
      'Domestic cat curled up on a computer keyboard indoors.',
    ],
  },
  {
    id: 'img2',
    description: 'A golden retriever catching a frisbee in a sunny park',
    tags: ['dog', 'frisbee', 'park', 'outdoor', 'sunny', 'action', 'pet', 'playing'],
    captions: [
      'A golden retriever leaps to catch a red frisbee in a green park.',
      'Happy dog playing fetch in the sunlight at a park.',
      'A retriever mid-jump catching a disc on a grassy field.',
    ],
  },
  {
    id: 'img3',
    description: 'A busy city street at night with neon signs and rain reflections',
    tags: ['city', 'night', 'neon', 'rain', 'urban', 'street', 'lights', 'reflection'],
    captions: [
      'A rainy city street at night, neon signs reflecting off wet pavement.',
      'Urban nightscape with colorful neon lights and rain-slicked roads.',
      'Busy downtown street after dark, glowing signs and puddle reflections.',
    ],
  },
  {
    id: 'img4',
    description: 'A steaming cup of coffee on a wooden table with an open book',
    tags: ['coffee', 'book', 'reading', 'cozy', 'warm', 'indoor', 'morning', 'table'],
    captions: [
      'A hot cup of coffee sits beside an open book on a wooden table.',
      'Cozy morning scene: steaming coffee and a book ready to read.',
      'A mug of fresh coffee next to a paperback on a rustic table.',
    ],
  },
  {
    id: 'img5',
    description: 'Snow-capped mountain range reflected in a still alpine lake',
    tags: ['mountain', 'lake', 'snow', 'nature', 'landscape', 'reflection', 'alpine', 'scenic'],
    captions: [
      'Snow-covered mountains mirror perfectly in a calm alpine lake.',
      'A pristine mountain landscape reflected in still water below.',
      'Majestic peaks with snowcaps casting reflections on a glassy lake.',
    ],
  },
  {
    id: 'img6',
    description: 'A child building a sandcastle on a tropical beach at sunset',
    tags: ['beach', 'child', 'sandcastle', 'sunset', 'tropical', 'ocean', 'playing', 'warm'],
    captions: [
      'A young child builds a sandcastle as the sun sets over the ocean.',
      'Kid playing in the sand on a tropical beach during golden hour.',
      'A child shapes a sandcastle on a warm beach at sunset.',
    ],
  },
  {
    id: 'img7',
    description: 'A crowded farmer\'s market with colorful fruits and vegetables',
    tags: ['market', 'food', 'fruit', 'vegetables', 'colorful', 'outdoor', 'fresh', 'crowd'],
    captions: [
      'A bustling farmer\'s market overflowing with fresh, colorful produce.',
      'Stalls of bright fruits and vegetables at a crowded outdoor market.',
      'Shoppers browse piles of fresh produce at a local farmers market.',
    ],
  },
  {
    id: 'img8',
    description: 'An astronaut floating in space with Earth visible in the background',
    tags: ['space', 'astronaut', 'earth', 'floating', 'orbit', 'science', 'dark', 'cosmos'],
    captions: [
      'An astronaut in a spacesuit floats above Earth in low orbit.',
      'A spacewalker drifts with the blue curve of Earth behind them.',
      'Astronaut on EVA with the planet Earth filling the background.',
    ],
  },
  {
    id: 'img9',
    description: 'A vintage red bicycle leaning against a stone wall with ivy',
    tags: ['bicycle', 'vintage', 'red', 'wall', 'ivy', 'rustic', 'outdoor', 'charming'],
    captions: [
      'An old red bicycle leans against a stone wall covered in green ivy.',
      'A vintage bike rests beside a rustic ivy-draped wall.',
      'Classic red bicycle propped against a weathered stone wall with vines.',
    ],
  },
  {
    id: 'img10',
    description: 'A robot arm assembling electronics on a factory production line',
    tags: ['robot', 'factory', 'manufacturing', 'technology', 'electronics', 'automation', 'industrial'],
    captions: [
      'A robotic arm precisely assembles circuit boards on a production line.',
      'An industrial robot places components on an electronics assembly line.',
      'Automated manufacturing: a robot arm works on a factory floor.',
    ],
  },
];

// -------------------------------------------------------------------
// Pre-computed similarity scores for specific text queries
// -------------------------------------------------------------------

interface QueryScores {
  query: string;
  scores: Record<string, number>;
}

const PRECOMPUTED_QUERIES: QueryScores[] = [
  {
    query: 'a cat sleeping on a laptop',
    scores: {
      img1: 0.94, img2: 0.18, img3: 0.08, img4: 0.31, img5: 0.05,
      img6: 0.12, img7: 0.07, img8: 0.03, img9: 0.10, img10: 0.22,
    },
  },
  {
    query: 'a dog playing outside',
    scores: {
      img1: 0.21, img2: 0.91, img3: 0.06, img4: 0.09, img5: 0.14,
      img6: 0.35, img7: 0.11, img8: 0.04, img9: 0.08, img10: 0.05,
    },
  },
  {
    query: 'city lights at night',
    scores: {
      img1: 0.05, img2: 0.04, img3: 0.93, img4: 0.07, img5: 0.06,
      img6: 0.19, img7: 0.13, img8: 0.28, img9: 0.09, img10: 0.15,
    },
  },
  {
    query: 'a warm morning with coffee and reading',
    scores: {
      img1: 0.26, img2: 0.08, img3: 0.06, img4: 0.92, img5: 0.11,
      img6: 0.15, img7: 0.14, img8: 0.03, img9: 0.18, img10: 0.04,
    },
  },
  {
    query: 'beautiful mountain scenery',
    scores: {
      img1: 0.04, img2: 0.12, img3: 0.08, img4: 0.06, img5: 0.95,
      img6: 0.29, img7: 0.07, img8: 0.16, img9: 0.11, img10: 0.03,
    },
  },
  {
    query: 'children playing on the beach',
    scores: {
      img1: 0.07, img2: 0.30, img3: 0.05, img4: 0.09, img5: 0.22,
      img6: 0.93, img7: 0.11, img8: 0.04, img9: 0.06, img10: 0.03,
    },
  },
  {
    query: 'fresh food and produce',
    scores: {
      img1: 0.05, img2: 0.06, img3: 0.04, img4: 0.28, img5: 0.07,
      img6: 0.09, img7: 0.94, img8: 0.03, img9: 0.08, img10: 0.06,
    },
  },
  {
    query: 'outer space and astronauts',
    scores: {
      img1: 0.03, img2: 0.04, img3: 0.16, img4: 0.02, img5: 0.11,
      img6: 0.05, img7: 0.04, img8: 0.96, img9: 0.03, img10: 0.19,
    },
  },
  {
    query: 'robots and automation',
    scores: {
      img1: 0.08, img2: 0.04, img3: 0.11, img4: 0.03, img5: 0.02,
      img6: 0.04, img7: 0.05, img8: 0.31, img9: 0.06, img10: 0.95,
    },
  },
  {
    query: 'a peaceful cozy scene',
    scores: {
      img1: 0.52, img2: 0.14, img3: 0.07, img4: 0.68, img5: 0.38,
      img6: 0.29, img7: 0.16, img8: 0.05, img9: 0.45, img10: 0.04,
    },
  },
];

// -------------------------------------------------------------------
// Fuzzy keyword match for free-text queries
// -------------------------------------------------------------------

function computeFuzzyScores(query: string): Record<string, number> {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);

  const scores: Record<string, number> = {};
  for (const img of IMAGE_DATABASE) {
    let score = 0;
    const desc = img.description.toLowerCase();
    const allTags = img.tags.join(' ');

    for (const word of words) {
      if (desc.includes(word)) score += 0.25;
      if (allTags.includes(word)) score += 0.15;
    }

    // Bonus for exact substring match
    if (desc.includes(q)) score += 0.35;

    // Normalize to [0, 1]
    scores[img.id] = Math.min(score + 0.02 + Math.random() * 0.04, 1.0);
  }

  return scores;
}

function getScoresForQuery(query: string): Record<string, number> {
  const q = query.toLowerCase().trim();
  if (!q) return {};

  // Check precomputed first
  const precomputed = PRECOMPUTED_QUERIES.find(pq =>
    pq.query.toLowerCase() === q
  );
  if (precomputed) return precomputed.scores;

  // Partial match on precomputed
  const partial = PRECOMPUTED_QUERIES.find(pq =>
    pq.query.toLowerCase().includes(q) || q.includes(pq.query.toLowerCase())
  );
  if (partial) return partial.scores;

  // Fallback to fuzzy
  return computeFuzzyScores(q);
}

// -------------------------------------------------------------------
// Similarity bar component
// -------------------------------------------------------------------

function SimilarityBar({
  label,
  score,
  rank,
  maxScore,
}: {
  label: string;
  score: number;
  rank: number;
  maxScore: number;
}) {
  const isTop = rank === 0;
  const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;

  const getColor = () => {
    if (score > 0.7) return '#22c55e';
    if (score > 0.4) return '#f59e0b';
    if (score > 0.2) return '#3b82f6';
    return '#6b7280';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.3 }}
      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
        isTop
          ? 'bg-green-500/10 border border-green-500/30'
          : 'bg-gray-800/50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              isTop
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            #{rank + 1}
          </span>
          <span className="text-xs text-gray-300 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: getColor() }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(barWidth, 3)}%` }}
              transition={{ duration: 0.5, delay: rank * 0.05 }}
            />
          </div>
          <span className="text-xs text-gray-400 font-mono w-10 text-right">
            {score.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------------
// Suggested query chips
// -------------------------------------------------------------------

const SUGGESTED_QUERIES = [
  'a cat sleeping on a laptop',
  'city lights at night',
  'beautiful mountain scenery',
  'robots and automation',
  'a peaceful cozy scene',
];

const SUGGESTED_IMAGE_INDICES = [0, 2, 4, 7, 9]; // indices into IMAGE_DATABASE

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

type Mode = 'text-to-image' | 'image-to-text';

export default function MultimodalSim() {
  const [mode, setMode] = useState<Mode>('text-to-image');
  const [query, setQuery] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Text -> Image mode
  const scores = useMemo(() => {
    if (mode !== 'text-to-image' || !searchTriggered || !query.trim()) return {};
    return getScoresForQuery(query);
  }, [mode, query, searchTriggered]);

  const rankedResults = useMemo(() => {
    return IMAGE_DATABASE
      .map(img => ({
        ...img,
        score: scores[img.id] ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);

  const maxScore = useMemo(() => {
    return Math.max(...rankedResults.map(r => r.score), 0.01);
  }, [rankedResults]);

  // Image -> Text mode
  const selectedImage = useMemo(() => {
    if (!selectedImageId) return null;
    return IMAGE_DATABASE.find(img => img.id === selectedImageId) ?? null;
  }, [selectedImageId]);

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      setSearchTriggered(true);
    }
  }, [query]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSearchTriggered(false);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setSearchTriggered(true);
  }, []);

  const handleModeSwitch = useCallback((newMode: Mode) => {
    setMode(newMode);
    setQuery('');
    setSearchTriggered(false);
    setSelectedImageId(null);
  }, []);

  const handleImageSelect = useCallback((imgId: string) => {
    setSelectedImageId(imgId);
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Cross-Modal Similarity Explorer
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        See how CLIP-like models map text and images into the same vector space.
        Similar concepts end up close together, regardless of modality.
      </p>

      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-5">
        <button
          onClick={() => handleModeSwitch('text-to-image')}
          className={`flex-1 text-xs font-semibold px-4 py-2.5 transition-all ${
            mode === 'text-to-image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Text &rarr; Image Search
        </button>
        <button
          onClick={() => handleModeSwitch('image-to-text')}
          className={`flex-1 text-xs font-semibold px-4 py-2.5 transition-all ${
            mode === 'image-to-text'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Image &rarr; Text Captioning
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/* TEXT -> IMAGE MODE                                            */}
        {/* ============================================================ */}
        {mode === 'text-to-image' && (
          <motion.div
            key="text-to-image"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Search input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Try "a cat sleeping on a laptop" ...'
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  query.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                Search
              </button>
            </div>

            {/* Suggested queries */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider self-center">
                Try:
              </span>
              {SUGGESTED_QUERIES.map((sq) => (
                <button
                  key={sq}
                  onClick={() => handleSuggestionClick(sq)}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700 transition-all"
                >
                  {sq}
                </button>
              ))}
            </div>

            {/* Results */}
            {searchTriggered && query.trim() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ranked Results (by cosine similarity)
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Showing {rankedResults.length} images
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {rankedResults.map((result, index) => (
                    <SimilarityBar
                      key={result.id}
                      label={result.description}
                      score={result.score}
                      rank={index}
                      maxScore={maxScore}
                    />
                  ))}
                </div>

                {/* Insight box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong className="text-blue-200">How this works:</strong>{' '}
                    CLIP encodes both the text query and each image into vectors
                    in the <em>same</em> high-dimensional space. The similarity
                    score is the cosine distance between the text vector and each
                    image vector. A cat photo and the text &ldquo;a cat sleeping
                    on a laptop&rdquo; end up as nearby vectors &mdash; even though
                    one is pixels and the other is words.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Placeholder when no search yet */}
            {!searchTriggered && (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-3">{'\u{1F50D}'}</div>
                <p className="text-sm">
                  Type a text description and search to see how CLIP ranks images
                  by semantic similarity.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* IMAGE -> TEXT MODE                                            */}
        {/* ============================================================ */}
        {mode === 'image-to-text' && (
          <motion.div
            key="image-to-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Pick an image to caption
            </div>

            {/* Image grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-5">
              {IMAGE_DATABASE.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => handleImageSelect(img.id)}
                  className={`relative rounded-lg p-3 text-left transition-all border-2 ${
                    selectedImageId === img.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg mb-1">
                    {['\u{1F431}', '\u{1F436}', '\u{1F303}', '☕', '⛰️',
                      '\u{1F3D6}️', '\u{1F34E}', '\u{1F680}', '\u{1F6B2}', '\u{1F916}'][index]}
                  </div>
                  <div className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                    {img.description.length > 40
                      ? img.description.slice(0, 40) + '...'
                      : img.description}
                  </div>
                  {selectedImageId === img.id && (
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Captioning results */}
            <AnimatePresence mode="wait">
              {selectedImage && (
                <motion.div
                  key={selectedImage.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Selected image description */}
                  <div className="bg-gray-800 rounded-lg px-4 py-3 mb-4 border-l-4 border-purple-500">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                      Selected Image
                    </div>
                    <div className="text-sm text-white font-medium">
                      {selectedImage.description}
                    </div>
                  </div>

                  {/* Generated captions ranked */}
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Generated Captions (ranked by confidence)
                  </div>

                  <div className="space-y-2 mb-5">
                    {selectedImage.captions.map((caption, index) => {
                      const confidence = [0.94, 0.78, 0.61][index] ?? 0.5;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg ${
                            index === 0
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                index === 0
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-gray-700 text-gray-400'
                              }`}
                            >
                              #{index + 1}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              conf: {confidence.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{caption}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Tags */}
                  <div className="mb-5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                      Detected Tags (zero-shot classification)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedImage.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Insight box */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-sm text-purple-300">
                      <strong className="text-purple-200">How this works:</strong>{' '}
                      A vision-language model (like LLaVA or GPT-4V) feeds the image
                      through a vision encoder (like a ViT), which produces feature
                      vectors. These features are then passed to a language model
                      that generates natural language descriptions. The model can
                      produce multiple captions with varying levels of detail, ranked
                      by how confident it is in each one.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Placeholder */}
            {!selectedImage && (
              <div className="text-center py-8 text-gray-600">
                <div className="text-4xl mb-3">{'\u{1F5BC}️'}</div>
                <p className="text-sm">
                  Select an image above to see how a vision-language model generates
                  captions and tags.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vector space diagram */}
      <div className="mt-6 border border-gray-700 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          The key insight: one shared vector space
        </h4>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Text side */}
            <div className="text-center">
              <div className="text-2xl mb-1">{'\u{1F4DD}'}</div>
              <div className="text-xs font-semibold text-blue-400">Text</div>
              <div className="text-[10px] text-gray-500">&ldquo;a sleeping cat&rdquo;</div>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="text-center border-2 border-blue-500/30 bg-blue-500/5 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-blue-400">Text Encoder</div>
              <div className="text-[10px] text-gray-500">CLIP / BERT</div>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Shared space */}
            <div className="text-center border-2 border-green-500/30 bg-green-500/5 rounded-xl px-4 py-3">
              <div className="text-xs font-bold text-green-400">Shared Vector Space</div>
              <div className="text-[10px] text-gray-500 mt-1">
                Similar concepts<br />cluster together
              </div>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="text-center border-2 border-purple-500/30 bg-purple-500/5 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-purple-400">Vision Encoder</div>
              <div className="text-[10px] text-gray-500">ViT / ResNet</div>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Image side */}
            <div className="text-center">
              <div className="text-2xl mb-1">{'\u{1F431}'}</div>
              <div className="text-xs font-semibold text-purple-400">Image</div>
              <div className="text-[10px] text-gray-500">photo of a cat</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI connection */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-5">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-200">AI connection:</strong>{' '}
          This is how Google Lens finds products from photos, how DALL-E
          understands your text prompts, and how GPT-4V can describe images.
          The magic is the shared embedding space &mdash; once you can convert
          anything (text, images, audio) into the same kind of vector,
          cross-modal understanding becomes a similarity search.
        </p>
      </div>
    </div>
  );
}
