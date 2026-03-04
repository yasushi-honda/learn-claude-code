import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getWeeks, getAppendices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Claude Code 体系学習",
  description:
    "公式ドキュメント全59ページを8週間のカリキュラムとして再構成。入門からエンタープライズ運用まで体系的に学ぶ。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const weeks = getWeeks().map((w) => ({
    id: w.id,
    title: w.title,
    lessons: w.lessons.map((l) => ({ slug: l.slug, title: l.title })),
  }));
  const appendices = getAppendices().map((a) => ({
    slug: a.slug,
    title: a.title,
  }));

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+JP:wght@300;400;500;700&family=Shippori+Mincho:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-obsidian text-ivory font-body">
        <Sidebar weeks={weeks} appendices={appendices} />

        {/* Main content area — offset by sidebar on desktop */}
        <main className="lg:ml-[280px] min-h-screen">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
