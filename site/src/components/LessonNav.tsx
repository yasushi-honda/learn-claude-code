import Link from "next/link";

interface LessonNavProps {
  prev?: { href: string; title: string } | null;
  next?: { href: string; title: string } | null;
}

export default function LessonNav({ prev, next }: LessonNavProps) {
  return (
    <nav className="flex items-stretch gap-4 mt-12 pt-8 border-t border-border">
      {prev ? (
        <Link
          href={prev.href}
          className="flex-1 group p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all"
        >
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">← 前へ</div>
          <div className="text-sm text-lavender group-hover:text-copper transition-colors truncate">
            {prev.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="flex-1 group p-4 rounded-lg border border-border hover:border-copper/30 hover:bg-surface/30 transition-all text-right"
        >
          <div className="text-[10px] text-muted uppercase tracking-wider mb-1">次へ →</div>
          <div className="text-sm text-lavender group-hover:text-copper transition-colors truncate">
            {next.title}
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
