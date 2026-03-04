import { getWeeks, getAppendices } from "@/lib/content";
import HeroSection from "@/components/HeroSection";
import WeekCard from "@/components/WeekCard";
import Link from "next/link";

export default function HomePage() {
  const weeks = getWeeks();
  const appendices = getAppendices();

  return (
    <>
      <HeroSection />

      {/* Week Grid */}
      <section className="py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h2 className="font-serif text-2xl text-ivory">カリキュラム</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {weeks.map((week, i) => (
            <WeekCard
              key={week.id}
              id={week.id}
              number={week.number}
              title={week.title}
              lessonCount={week.lessons.length}
              delay={Math.min(i + 1, 8)}
            />
          ))}
        </div>
      </section>

      {/* Appendix */}
      <section className="py-8 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h2 className="font-serif text-xl text-ivory">付録</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {appendices.map((a) => (
            <Link
              key={a.slug}
              href={`/appendix/${a.slug}/`}
              className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-obsidian-light/40 hover:border-copper/30 hover:bg-surface/30 transition-all"
            >
              <span className="text-copper/60 group-hover:text-copper transition-colors text-lg">
                ◇
              </span>
              <span className="text-sm text-lavender group-hover:text-ivory transition-colors">
                {a.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-8 border-t border-border text-center">
        <p className="text-[12px] text-muted">
          本リポジトリのコンテンツは教育目的で作成されています。
          <br />
          Claude Codeの公式ドキュメントの著作権はAnthropicに帰属します。
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-[12px]">
          <a
            href="https://code.claude.com/docs/en/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lavender hover:text-copper transition-colors"
          >
            公式ドキュメント
          </a>
          <span className="text-border">·</span>
          <a
            href="https://github.com/yasushi-honda/learn-claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lavender hover:text-copper transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
