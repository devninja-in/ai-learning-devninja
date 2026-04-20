import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';

import {
  getAllContent,
  getContentBySlug,
  getLessonNavigation,
  ContentItem,
  LessonNavigation,
  ContentMetadata,
} from '@/lib/content';
import { LessonLayout } from '@/components/educational';
import mdxComponents from '@/components/mdx/MDXComponents';
import { NotFound } from '@/components/ui/NotFound';

interface ContentPageProps {
  content: {
    mdxSource: MDXRemoteSerializeResult;
    metadata: ContentMetadata;
    slug: string;
  } | null;
  navigation: LessonNavigation;
}

export default function ContentPage({ content, navigation }: ContentPageProps) {
  if (!content) {
    return <NotFound title="Content Not Found" />;
  }

  const { mdxSource, metadata, slug } = content;

  return (
    <>
      <Head>
        <title>{metadata.title} - DevNinja AI Learning</title>
        <meta
          name="description"
          content={metadata.description || `Learn ${metadata.title} in our AI course`}
        />
        <meta property="og:title" content={`${metadata.title} - DevNinja AI Learning`} />
        <meta
          property="og:description"
          content={metadata.description || `Learn ${metadata.title} in our AI course`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://ailearning.devninja.in/learn/${slug}`} />

        {/* Educational content specific meta */}
        <meta name="educational:difficulty" content={metadata.difficulty} />
        <meta name="educational:phase" content={metadata.phase.toString()} />
        {metadata.estimatedTime && (
          <meta name="educational:duration" content={`${metadata.estimatedTime} minutes`} />
        )}
        {metadata.tags && metadata.tags.length > 0 && (
          <meta name="keywords" content={metadata.tags.join(', ')} />
        )}
      </Head>

      <LessonLayout
        phase={metadata.phase}
        lesson={metadata.lesson || 1}
        title={metadata.title}
        description={metadata.description}
        estimatedTime={metadata.estimatedTime}
        difficulty={metadata.difficulty}
        objectives={metadata.objectives}
        prerequisites={metadata.prerequisites}
        previousLesson={navigation.previous ? {
          phase: navigation.previous.phase,
          lesson: navigation.previous.lesson,
          title: navigation.previous.title,
        } : undefined}
        nextLesson={navigation.next ? {
          phase: navigation.next.phase,
          lesson: navigation.next.lesson,
          title: navigation.next.title,
        } : undefined}
      >
        <div className="prose prose-lg max-w-none">
          <MDXRemote {...mdxSource} components={mdxComponents} />
        </div>
      </LessonLayout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allContent = getAllContent();

  const paths = allContent.map((item) => ({
    params: {
      slug: item.slug.split('/'),
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ContentPageProps> = async ({ params }) => {
  const slug = Array.isArray(params?.slug) ? params.slug.join('/') : params?.slug || '';

  const contentItem = getContentBySlug(slug);

  if (!contentItem) {
    return {
      notFound: true,
    };
  }

  try {
    // Serialize the MDX content
    const mdxSource = await serialize(contentItem.content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          [rehypeHighlight, { subset: false }],
          rehypeKatex,
        ],
      },
    });

    const navigation = getLessonNavigation(slug);

    return {
      props: {
        content: {
          mdxSource,
          metadata: contentItem.metadata,
          slug: contentItem.slug,
        },
        navigation,
      },
    };
  } catch (error) {
    console.error('Error serializing MDX:', error);
    return {
      notFound: true,
    };
  }
};