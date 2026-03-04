import Link from "next/link";

interface WeekCardProps {
  id: string;
  number: number;
  title: string;
  lessonCount: number;
  delay: number;
}

const WEEK_DESCRIPTIONS: Record<string, string> = {
  "01": "Claude Codeとは何か、インストール、初回セッション、動作原理",
  "02": "対話モード、CLIコマンド体系、基本ワークフロー、ファイル操作、Git統合",
  "03": "ターミナル最適化、VS Code、JetBrains、デスクトップアプリ、Web版",
  "04": "設定ファイル体系、CLAUDE.md、自動メモリ、パーミッション、モデル設定",
  "05": "Skills、Hooks、プラグインシステム",
  "06": "MCPプロトコル、MCPサーバー設定、Chrome連携、Slack連携",
  "07": "サブエージェント、Agent Teams、GitHub Actions、GitLab CI/CD、コスト管理",
  "08": "セキュリティ、サンドボックス、クラウドプロバイダー、組織管理設定",
};

const WEEK_ICONS: Record<string, string> = {
  "01": "◈",
  "02": "⌘",
  "03": "◉",
  "04": "⚙",
  "05": "✦",
  "06": "⬡",
  "07": "⊞",
  "08": "◆",
};

export default function WeekCard({ id, number, title, lessonCount, delay }: WeekCardProps) {
  return (
    <Link
      href={`/week/${id}/`}
      className={`animate-fade-in-up delay-${delay} group relative block p-6 rounded-xl border border-border bg-obsidian-light/60 backdrop-blur-sm hover:border-copper/30 hover:bg-surface/40 transition-all duration-300`}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-copper/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-copper/70 group-hover:text-copper transition-colors">
              {WEEK_ICONS[id] ?? "◇"}
            </span>
            <div>
              <div className="text-[10px] text-muted tracking-widest uppercase font-mono">
                Week {String(number).padStart(2, "0")}
              </div>
              <h3 className="text-ivory font-medium text-base mt-0.5 group-hover:text-copper-glow transition-colors">
                {title}
              </h3>
            </div>
          </div>
          <span className="text-[11px] text-muted font-mono bg-surface px-2 py-0.5 rounded">
            {lessonCount} lessons
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-lavender leading-relaxed">
          {WEEK_DESCRIPTIONS[id] ?? ""}
        </p>

        {/* Arrow */}
        <div className="mt-4 flex items-center gap-1 text-[12px] text-muted group-hover:text-copper transition-colors">
          <span>学習を始める</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
