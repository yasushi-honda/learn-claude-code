"use client";

import { useEffect, useState } from "react";

const PROMPT_TEXT = "claude \"このプロジェクトの構造を教えて\"";

export default function HeroSection() {
  const [typed, setTyped] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < PROMPT_TEXT.length) {
        setTyped(PROMPT_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-copper/5 blur-[120px]" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-steel/5 blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
          <span className="text-[11px] text-lavender tracking-wider uppercase">
            8-Week Curriculum
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up delay-1 font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-ivory leading-[1.1] mb-6 tracking-tight">
          Claude Code
          <br />
          <span className="text-copper">体系学習</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-2 text-lavender text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          公式ドキュメント全70ページを
          <br className="sm:hidden" />
          8週間のカリキュラムとして再構成。
          <br />
          入門からエンタープライズ運用まで、
          <br className="sm:hidden" />
          体系的に学ぶ。
        </p>

        {/* Terminal prompt */}
        <div className="animate-fade-in-up delay-3 max-w-lg mx-auto">
          <div className="bg-code-bg border border-border rounded-lg overflow-hidden shadow-2xl shadow-obsidian/50">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface/50 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-copper-dim/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-muted/40" />
              </div>
              <span className="text-[10px] text-muted ml-2 font-mono">~/your-project</span>
            </div>
            {/* Terminal content */}
            <div className="px-5 py-4 font-mono text-sm">
              <span className="text-steel">$</span>{" "}
              <span className="text-ivory-dim">{typed}</span>
              {showCursor && (
                <span className="animate-blink text-copper ml-0.5">▋</span>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up delay-4 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/week/01/"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-copper text-obsidian font-medium text-sm hover:bg-copper-glow transition-colors"
          >
            Week 1 から始める
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
          <a
            href="https://github.com/yasushi-honda/learn-claude-code"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-lavender text-sm hover:border-border-hover hover:text-ivory transition-colors"
          >
            GitHub
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
