"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLesson {
  slug: string;
  title: string;
}

interface SidebarWeek {
  id: string;
  title: string;
  lessons: SidebarLesson[];
}

interface SidebarAppendix {
  slug: string;
  title: string;
}

interface SidebarProps {
  weeks: SidebarWeek[];
  appendices: SidebarAppendix[];
}

export default function Sidebar({ weeks, appendices }: SidebarProps) {
  const pathname = usePathname();
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(() => {
    const match = pathname.match(/\/week\/(\d+)/);
    return match ? new Set([match[1]]) : new Set<string>();
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleWeek = (id: string) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (href: string) => {
    const clean = pathname.replace(/\/$/, "");
    const hrefClean = href.replace(/\/$/, "");
    return clean === hrefClean;
  };

  const nav = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 border-b border-border group"
        onClick={() => setMobileOpen(false)}
      >
        <div className="w-8 h-8 rounded-md bg-copper/20 border border-copper/30 flex items-center justify-center text-copper font-mono text-xs font-bold group-hover:bg-copper/30 transition-colors">
          CC
        </div>
        <div>
          <div className="text-sm font-medium text-ivory leading-tight">Claude Code</div>
          <div className="text-[10px] text-muted tracking-widest uppercase">Learning Path</div>
        </div>
      </Link>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {weeks.map((week) => {
          const isOpen = openWeeks.has(week.id);
          const weekActive = pathname.includes(`/week/${week.id}`);

          return (
            <div key={week.id} className="mb-0.5">
              <button
                onClick={() => toggleWeek(week.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-[13px] transition-colors ${
                  weekActive
                    ? "text-copper bg-copper/8"
                    : "text-lavender hover:text-ivory hover:bg-surface"
                }`}
              >
                <span
                  className={`text-[10px] transition-transform ${isOpen ? "rotate-90" : ""}`}
                >
                  ▶
                </span>
                <span className="font-mono text-[10px] text-muted mr-0.5">
                  W{week.id}
                </span>
                <span className="truncate">{week.title}</span>
              </button>

              {isOpen && (
                <div className="ml-4 pl-3 border-l border-border/60 mt-0.5 mb-1">
                  <Link
                    href={`/week/${week.id}/`}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-2 py-1 rounded text-[12px] transition-colors ${
                      isActive(`/week/${week.id}`)
                        ? "text-copper bg-copper/10"
                        : "text-muted hover:text-lavender"
                    }`}
                  >
                    概要
                  </Link>
                  {week.lessons.map((lesson) => (
                    <Link
                      key={lesson.slug}
                      href={`/week/${week.id}/${lesson.slug}/`}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-2 py-1 rounded text-[12px] transition-colors truncate ${
                        isActive(`/week/${week.id}/${lesson.slug}`)
                          ? "text-copper bg-copper/10"
                          : "text-muted hover:text-lavender"
                      }`}
                    >
                      {lesson.title.replace(/^(Week\s*\d+[:：]\s*)/i, "")}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Appendix */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="px-3 py-1 text-[10px] text-muted uppercase tracking-widest">
            付録
          </div>
          {appendices.map((a) => (
            <Link
              key={a.slug}
              href={`/appendix/${a.slug}/`}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                isActive(`/appendix/${a.slug}`)
                  ? "text-copper bg-copper/10"
                  : "text-lavender hover:text-ivory hover:bg-surface"
              }`}
            >
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border"
        aria-label="Toggle menu"
      >
        <span className="text-copper text-lg">{mobileOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-obsidian-light border-r border-border z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {nav}
      </aside>
    </>
  );
}
