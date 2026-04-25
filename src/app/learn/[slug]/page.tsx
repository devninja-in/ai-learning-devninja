import { notFound } from 'next/navigation'
import { getLessonBySlug } from '@/data/curriculum'
import { getAvailableSlugs, loadLessonContent } from '@/lib/lessons'
import LessonPage from '@/components/lessons/LessonPage'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAvailableSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const lesson = getLessonBySlug(slug)
  if (!lesson) return {}
  return {
    title: `${lesson.title} — DevNinja AI Learning`,
    description: lesson.subtitle,
  }
}

export default async function LessonPageRoute({ params }: PageProps) {
  const { slug } = await params
  const lesson = getLessonBySlug(slug)
  if (!lesson) notFound()

  const ContentComponent = await loadLessonContent(slug)
  if (!ContentComponent) notFound()

  return (
    <LessonPage lesson={lesson}>
      <ContentComponent />
    </LessonPage>
  )
}
