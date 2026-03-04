import { getWeeks, getLessonContent, markdownToHtml, transformMdLinks } from "@/lib/content";
import Link from "next/link";
import LessonNav from "@/components/LessonNav";

export function generateStaticParams() {
  const weeks = getWeeks();
  const params: { weekId: string; lessonId: string }[] = [];
  for (const week of weeks) {
    for (const lesson of week.lessons) {
      params.push({ weekId: week.id, lessonId: lesson.slug });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ weekId: string; lessonId: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { weekId, lessonId } = await params;
  const weeks = getWeeks();
  const week = weeks.find((w) => w.id === weekId);
  if (!week) return <div className="text-muted">Week not found.</div>;

  const content = getLessonContent(weekId, lessonId);
  if (!content) return <div className="text-muted">Lesson not found.</div>;

  const html = await markdownToHtml(transformMdLinks(content, { weekId, type: "lesson" }));

  // Find prev/next
  const lessonIndex = week.lessons.findIndex((l) => l.slug === lessonId);
  const prevLesson = lessonIndex > 0 ? week.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < week.lessons.length - 1 ? week.lessons[lessonIndex + 1] : null;

  // Cross-week navigation
  const weekIndex = weeks.findIndex((w) => w.id === weekId);
  const prevWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
  const nextWeek = weekIndex < weeks.length - 1 ? weeks[weekIndex + 1] : null;

  const prev = prevLesson
    ? { href: `/week/${weekId}/${prevLesson.slug}/`, title: prevLesson.title }
    : prevWeek && prevWeek.lessons.length > 0
      ? {
          href: `/week/${prevWeek.id}/${prevWeek.lessons[prevWeek.lessons.length - 1].slug}/`,
          title: `W${prevWeek.id}: ${prevWeek.lessons[prevWeek.lessons.length - 1].title}`,
        }
      : null;

  const next = nextLesson
    ? { href: `/week/${weekId}/${nextLesson.slug}/`, title: nextLesson.title }
    : nextWeek && nextWeek.lessons.length > 0
      ? {
          href: `/week/${nextWeek.id}/${nextWeek.lessons[0].slug}/`,
          title: `W${nextWeek.id}: ${nextWeek.lessons[0].title}`,
        }
      : null;

  return (
    <article>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-muted mb-8 font-mono flex-wrap">
        <Link href="/" className="hover:text-copper transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/week/${weekId}/`}
          className="hover:text-copper transition-colors"
        >
          Week {weekId}
        </Link>
        <span>/</span>
        <span className="text-lavender truncate max-w-[200px]">{lessonId}</span>
      </div>

      {/* Lesson content */}
      <div
        className="markdown-body animate-fade-in-up"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Prev / Next */}
      <LessonNav prev={prev} next={next} />
    </article>
  );
}
