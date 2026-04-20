import { TokenizationData, EmbeddingVector, AttentionMatrix } from '@/types/simulation'

export class SimulationEngine {
  // Tokenization utilities
  static tokenizeText(text: string, encoding: 'word' | 'subword' | 'character' | 'bpe'): TokenizationData {
    let tokens: TokenizationData['tokens'] = []

    switch (encoding) {
      case 'word':
        tokens = this.wordTokenize(text)
        break
      case 'subword':
        tokens = this.subwordTokenize(text)
        break
      case 'character':
        tokens = this.characterTokenize(text)
        break
      case 'bpe':
        tokens = this.bpeTokenize(text)
        break
    }

    return { text, tokens, encoding }
  }

  private static wordTokenize(text: string): TokenizationData['tokens'] {
    const words = text.split(/\s+/)
    let currentPos = 0

    return words.map((word, index) => {
      const start = text.indexOf(word, currentPos)
      const end = start + word.length
      currentPos = end

      return {
        id: index,
        text: word,
        start,
        end,
        tokenId: this.hashString(word)
      }
    })
  }

  private static subwordTokenize(text: string): TokenizationData['tokens'] {
    // Simple BPE-like tokenization simulation
    const words = text.split(/\s+/)
    let tokens: TokenizationData['tokens'] = []
    let tokenId = 0
    let currentPos = 0

    for (const word of words) {
      if (word.length <= 4) {
        // Short words stay as single tokens
        const start = text.indexOf(word, currentPos)
        tokens.push({
          id: tokenId++,
          text: word,
          start,
          end: start + word.length,
          tokenId: this.hashString(word)
        })
      } else {
        // Split longer words into subwords
        const subwords = this.splitIntoSubwords(word)
        for (const subword of subwords) {
          const start = text.indexOf(subword, currentPos)
          tokens.push({
            id: tokenId++,
            text: subword,
            start,
            end: start + subword.length,
            tokenId: this.hashString(subword)
          })
          currentPos = start + subword.length
        }
      }
      currentPos = text.indexOf(' ', currentPos) + 1
    }

    return tokens
  }

  private static characterTokenize(text: string): TokenizationData['tokens'] {
    return Array.from(text).map((char, index) => ({
      id: index,
      text: char,
      start: index,
      end: index + 1,
      tokenId: char.charCodeAt(0)
    }))
  }

  private static bpeTokenize(text: string): TokenizationData['tokens'] {
    // Simplified BPE implementation - starts with character level and merges frequent pairs
    const chars = Array.from(text)
    let tokens: string[] = chars.slice()

    // Common character pairs to merge (simplified BPE vocabulary)
    const mergePairs = [
      ['t', 'h'], ['e', 'r'], ['i', 'n'], ['a', 'n'], ['e', 'd'], ['o', 'n'], ['a', 't'],
      ['i', 't'], ['e', 's'], ['o', 'r'], ['a', 'r'], ['h', 'e'], ['i', 's'], ['o', 'u'],
      ['th', 'e'], ['in', 'g'], ['er', 's'], ['an', 'd'], ['re', 's'], ['ed', ' '], ['on', 's']
    ]

    // Apply BPE merges
    for (const [first, second] of mergePairs) {
      for (let i = 0; i < tokens.length - 1; i++) {
        if (tokens[i] === first && tokens[i + 1] === second) {
          tokens.splice(i, 2, first + second)
          i-- // Check this position again in case of further merges
        }
      }
    }

    // Convert to token format
    let currentPos = 0
    return tokens.map((token, index) => {
      const start = currentPos
      const end = start + token.length
      currentPos = end

      return {
        id: index,
        text: token,
        start,
        end,
        tokenId: this.hashString(token)
      }
    })
  }

  private static splitIntoSubwords(word: string): string[] {
    if (word.length <= 3) return [word]

    // Simple prefix/suffix splitting
    const prefixes = ['un', 'pre', 're', 'in', 'dis']
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion']

    let remaining = word
    const subwords: string[] = []

    // Check for prefix
    for (const prefix of prefixes) {
      if (remaining.startsWith(prefix)) {
        subwords.push(prefix)
        remaining = remaining.slice(prefix.length)
        break
      }
    }

    // Check for suffix
    for (const suffix of suffixes) {
      if (remaining.endsWith(suffix) && remaining.length > suffix.length + 2) {
        const root = remaining.slice(0, -suffix.length)
        subwords.push(root)
        subwords.push(suffix)
        remaining = ''
        break
      }
    }

    if (remaining) {
      subwords.push(remaining)
    }

    return subwords.length > 1 ? subwords : [word]
  }

  // Embedding utilities
  static generateRandomEmbedding(word: string, dimensions: number = 300): EmbeddingVector {
    const seed = this.hashString(word)
    const random = this.seededRandom(seed)

    const vector = Array.from({ length: dimensions }, () => (random() - 0.5) * 2)

    return {
      word,
      vector,
      position: this.projectTo2D(vector)
    }
  }

  static calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0

    const dot = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0)
    const norm1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0))
    const norm2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0))

    return dot / (norm1 * norm2)
  }

  private static projectTo2D(vector: number[]): { x: number; y: number } {
    // Simple PCA-like projection to 2D
    const x = vector.slice(0, vector.length / 2).reduce((sum, val) => sum + val, 0) / (vector.length / 2)
    const y = vector.slice(vector.length / 2).reduce((sum, val) => sum + val, 0) / (vector.length / 2)

    return { x: x * 100, y: y * 100 }
  }

  // Attention utilities
  static generateAttentionWeights(tokens: string[], numHeads: number = 8): AttentionMatrix {
    const heads = Array.from({ length: numHeads }, (_, headIndex) => {
      return tokens.flatMap((queryToken, queryIndex) =>
        tokens.map((keyToken, keyIndex) => ({
          queryToken: queryIndex,
          keyToken: keyIndex,
          weight: this.calculateAttentionWeight(queryToken, keyToken, headIndex),
          headIndex
        }))
      )
    })

    return {
      tokens,
      heads,
      layer: 0
    }
  }

  private static calculateAttentionWeight(queryToken: string, keyToken: string, headIndex: number): number {
    const queryHash = this.hashString(queryToken + headIndex)
    const keyHash = this.hashString(keyToken + headIndex)
    const combined = (queryHash + keyHash) % 1000 / 1000

    // Apply softmax-like normalization
    return Math.exp(combined * 5) / (1 + Math.exp(combined * 5))
  }

  // Utility functions
  private static hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  private static seededRandom(seed: number) {
    let state = seed
    return () => {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
  }

  // Animation helpers
  static interpolate(start: number, end: number, t: number): number {
    return start + (end - start) * t
  }

  static easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  static easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }
}