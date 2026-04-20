import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ContentMetadata {
  title: string;
  description?: string;
  phase: number;
  lesson?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  objectives?: string[];
  prerequisites?: string[];
  tags?: string[];
  published?: boolean;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
}

export interface ContentItem {
  slug: string;
  metadata: ContentMetadata;
  content: string;
  excerpt?: string;
}

export interface LessonNavigation {
  previous?: { slug: string; title: string; phase: number; lesson: number };
  next?: { slug: string; title: string; phase: number; lesson: number };
}

const contentDirectory = path.join(process.cwd(), 'content');

// Get all content files recursively
function getAllContentFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllContentFiles(filePath, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Parse MDX file and extract metadata
export function parseContentFile(filePath: string): ContentItem {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Generate slug from file path
  const relativePath = path.relative(contentDirectory, filePath);
  const slug = relativePath
    .replace(/\.(md|mdx)$/, '')
    .replace(/\\/g, '/')
    .replace(/\/index$/, '');

  // Extract excerpt from content (first paragraph)
  const paragraphs = content.split('\n\n');
  const excerpt = paragraphs.find((p) => p.trim() && !p.startsWith('#'))?.slice(0, 200);

  return {
    slug,
    metadata: data as ContentMetadata,
    content,
    excerpt,
  };
}

// Get all content items
export function getAllContent(): ContentItem[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const files = getAllContentFiles(contentDirectory);

  return files
    .map(parseContentFile)
    .filter((item) => item.metadata.published !== false)
    .sort((a, b) => {
      // Sort by phase, then by lesson
      if (a.metadata.phase !== b.metadata.phase) {
        return a.metadata.phase - b.metadata.phase;
      }

      const lessonA = a.metadata.lesson || 0;
      const lessonB = b.metadata.lesson || 0;
      return lessonA - lessonB;
    });
}

// Get content by slug
export function getContentBySlug(slug: string): ContentItem | null {
  const allContent = getAllContent();
  return allContent.find((item) => item.slug === slug) || null;
}

// Get content by phase
export function getContentByPhase(phase: number): ContentItem[] {
  const allContent = getAllContent();
  return allContent.filter((item) => item.metadata.phase === phase);
}

// Get navigation for a specific lesson
export function getLessonNavigation(currentSlug: string): LessonNavigation {
  const allContent = getAllContent();
  const currentIndex = allContent.findIndex((item) => item.slug === currentSlug);

  if (currentIndex === -1) return {};

  const navigation: LessonNavigation = {};

  if (currentIndex > 0) {
    const prev = allContent[currentIndex - 1];
    navigation.previous = {
      slug: prev.slug,
      title: prev.metadata.title,
      phase: prev.metadata.phase,
      lesson: prev.metadata.lesson || 0,
    };
  }

  if (currentIndex < allContent.length - 1) {
    const next = allContent[currentIndex + 1];
    navigation.next = {
      slug: next.slug,
      title: next.metadata.title,
      phase: next.metadata.phase,
      lesson: next.metadata.lesson || 0,
    };
  }

  return navigation;
}

// Get all phases with their content counts
export function getPhases(): Array<{
  phase: number;
  title: string;
  description: string;
  contentCount: number;
  completedCount?: number;
}> {
  const allContent = getAllContent();
  const phases = new Map();

  // Group content by phase
  allContent.forEach((item) => {
    const phase = item.metadata.phase;
    if (!phases.has(phase)) {
      phases.set(phase, {
        phase,
        title: `Phase ${phase}`,
        description: '',
        content: [],
      });
    }
    phases.get(phase).content.push(item);
  });

  // Convert to array and add counts
  return Array.from(phases.values())
    .sort((a, b) => a.phase - b.phase)
    .map((phaseData) => ({
      ...phaseData,
      contentCount: phaseData.content.length,
      content: undefined, // Remove content array from output
    }));
}

// Search content
export function searchContent(query: string): ContentItem[] {
  const allContent = getAllContent();
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

  return allContent.filter((item) => {
    const searchableText = [
      item.metadata.title,
      item.metadata.description,
      item.content,
      ...(item.metadata.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });
}

// Generate static paths for content pages
export function getContentPaths(): Array<{ params: { slug: string[] } }> {
  const allContent = getAllContent();

  return allContent.map((item) => ({
    params: {
      slug: item.slug.split('/'),
    },
  }));
}

// Validate content metadata
export function validateContentMetadata(metadata: any): ContentMetadata {
  const errors: string[] = [];

  if (!metadata.title) errors.push('Title is required');
  if (!metadata.phase || typeof metadata.phase !== 'number') errors.push('Phase number is required');

  if (errors.length > 0) {
    throw new Error(`Content validation errors: ${errors.join(', ')}`);
  }

  return {
    title: metadata.title,
    description: metadata.description,
    phase: metadata.phase,
    lesson: metadata.lesson,
    difficulty: metadata.difficulty || 'beginner',
    estimatedTime: metadata.estimatedTime,
    objectives: metadata.objectives || [],
    prerequisites: metadata.prerequisites || [],
    tags: metadata.tags || [],
    published: metadata.published !== false,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt,
    author: metadata.author,
  };
}