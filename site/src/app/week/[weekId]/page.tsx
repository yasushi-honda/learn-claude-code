import { getWeeks, getWeekReadme, getWeekReferences, markdownToHtml, transformMdLinks } from "@/lib/content";
import Link from "next/link";
import Image from "next/image";
import fs from "fs";
import path from "path";

export function generateStaticParams() {
  return getWeeks().map((w) => ({ weekId: w.id }));
}

interface Props {
  params: Promise<{ weekId: string }>;
}

export default async function WeekPage({ params }: Props) {
  const { weekId } = await params;
  const weeks = getWeeks();
  const week = weeks.find((w) => w.id === weekId);
  if (!week) return <div className="text-muted">Week not found.</div>;

  const readme = getWeekReadme(weekId);
  const readmeHtml = readme
    ? await markdownToHtml(transformMdLinks(readme, { weekId, type: "week" }))
    : null;

  const refs = getWeekReferences(weekId);
  const refsHtml = refs
    ? await markdownToHtml(transformMdLinks(refs, { weekId, type: "week" }))
    : null;

  return (
    <article>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-muted mb-8 font-mono">
        <Link href="/" className="hover:text-copper transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-lavender">Week {weekId}</span>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="text-[11px] text-copper font-mono tracking-widest uppercase mb-2">
          Week {String(week.number).padStart(2, "0")}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ivory mb-4 tracking-tight">
          {week.title}
        </h1>
      </header>

      {/* Hero image */}
      {fs.existsSync(path.join(process.cwd(), "public", "images", `week-${weekId}-hero.png`)) && (
        <div className="mb-12 rounded-lg overflow-hidden border border-border">
          <Image
            src={`/images/week-${weekId}-hero.png`}
            alt={`Week ${weekId}: ${week.title}`}
            width={1376}
            height={week.number <= 3 ? 589 : 768}
            className="w-full h-auto"
            priority
          />
        </div>
      )}

      {/* README content */}
      {readmeHtml && (
        <div
          className="markdown-body mb-12"
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
        />
      )}

      {/* Lesson list */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl text-ivory mb-6 pb-3 border-b border-border">
          レッスン一覧
        </h2>
        <div className="space-y-2">
          {week.lessons.map((lesson, i) => (
            <Link
              key={lesson.slug}
              href={`/week/${weekId}/${lesson.slug}/`}
              className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all"
            >
              <span className="flex-none w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center text-[12px] font-mono text-muted group-hover:text-copper group-hover:border-copper/30 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-lavender group-hover:text-ivory transition-colors">
                {lesson.title}
              </span>
              <span className="ml-auto text-muted group-hover:text-copper transition-colors text-sm">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* References */}
      {refsHtml && (
        <section className="mt-8 pt-8 border-t border-border">
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: refsHtml }}
          />
        </section>
      )}

      {/* Week navigation */}
      <nav className="flex items-stretch gap-4 mt-12 pt-8 border-t border-border">
        {week.number > 1 ? (
          <Link
            href={`/week/${String(week.number - 1).padStart(2, "0")}/`}
            className="flex-1 group p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all"
          >
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              ← 前の週
            </div>
            <div className="text-sm text-lavender group-hover:text-copper transition-colors">
              Week {String(week.number - 1).padStart(2, "0")}:{" "}
              {weeks.find((w) => w.number === week.number - 1)?.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {week.number < 8 ? (
          <Link
            href={`/week/${String(week.number + 1).padStart(2, "0")}/`}
            className="flex-1 group p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all text-right"
          >
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              次の週 →
            </div>
            <div className="text-sm text-lavender group-hover:text-copper transition-colors">
              Week {String(week.number + 1).padStart(2, "0")}:{" "}
              {weeks.find((w) => w.number === week.number + 1)?.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </article>
  );
}
