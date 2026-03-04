import { getAppendices, getAppendixContent, markdownToHtml } from "@/lib/content";
import Link from "next/link";

export function generateStaticParams() {
  return getAppendices().map((a) => ({ id: a.slug }));
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AppendixPage({ params }: Props) {
  const { id } = await params;
  const appendices = getAppendices();
  const content = getAppendixContent(id);
  if (!content) return <div className="text-muted">Page not found.</div>;

  const html = await markdownToHtml(content);

  // Find prev/next appendix
  const idx = appendices.findIndex((a) => a.slug === id);
  const prev = idx > 0 ? appendices[idx - 1] : null;
  const next = idx < appendices.length - 1 ? appendices[idx + 1] : null;

  return (
    <article>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-muted mb-8 font-mono">
        <Link href="/" className="hover:text-copper transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-lavender">付録</span>
        <span>/</span>
        <span className="text-lavender truncate max-w-[200px]">{id}</span>
      </div>

      {/* Content */}
      <div
        className="markdown-body animate-fade-in-up"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Prev / Next */}
      <nav className="flex items-stretch gap-4 mt-12 pt-8 border-t border-border">
        {prev ? (
          <Link
            href={`/appendix/${prev.slug}/`}
            className="flex-1 group p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all"
          >
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              ← 前へ
            </div>
            <div className="text-sm text-lavender group-hover:text-copper transition-colors">
              {prev.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/appendix/${next.slug}/`}
            className="flex-1 group p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all text-right"
          >
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1">
              次へ →
            </div>
            <div className="text-sm text-lavender group-hover:text-copper transition-colors">
              {next.title}
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </nav>
    </article>
  );
}
