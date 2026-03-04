# Week 5: カスタマイズ・拡張

> **対応公式ドキュメント**: [Skills](https://code.claude.com/docs/en/skills) | [Hooks](https://code.claude.com/docs/en/hooks-guide) | [Plugins](https://code.claude.com/docs/en/plugins)
> **想定所要時間**: 約6時間（各レッスン約60分）
> **前提知識**: Week 1-4の内容、CLI基本操作、JSON基本文法

## 週の概要

Week 5では、Claude Codeをあなたのワークフローに合わせてカスタマイズし、拡張する方法を学びます。Skills（スキル）、Hooks（フック）、Plugins（プラグイン）という3つの主要な拡張機能を活用することで、Claude Codeを単なるAIアシスタントから、チーム全体の開発ワークフローに統合された強力なツールへと変えることができます。

## 学習目標

この週を終えると、以下のことができるようになります：

1. **Skills** を作成し、カスタムコマンド（`/コマンド名`）としてClaudeの機能を拡張できる
2. **Hooks** を設定し、ファイル編集後の自動整形やコミット前のlintなど、決定論的なワークフローを自動化できる
3. **Hooks**の全イベント・スキーマ・決定制御を理解し、高度なフックを実装できる
4. **Plugins** の仕組みを理解し、インストール・管理ができる
5. **プラグインを開発**して、チームや外部コミュニティと共有できる
6. **マーケットプレイス**からプラグインを検索・インストールし、独自マーケットプレイスを作成できる

## レッスン一覧

| レッスン | ファイル | 内容 | 難易度 |
|---------|---------|------|:------:|
| Lesson 1 | [01-skills-system.md](./01-skills-system.md) | Skillsシステム -- カスタムコマンドでClaudeを拡張する | ★★★☆☆ |
| Lesson 2 | [02-hooks-guide.md](./02-hooks-guide.md) | Hooksによる自動化 -- 決定論的ワークフローの構築 | ★★★☆☆ |
| Lesson 3 | [03-hooks-reference.md](./03-hooks-reference.md) | Hooks詳細リファレンス -- 全イベント・スキーマ・制御フロー | ★★★★☆ |
| Lesson 4 | [04-plugins-overview.md](./04-plugins-overview.md) | プラグインシステム概要 -- 機能をパッケージ化して配布する | ★★★☆☆ |
| Lesson 5 | [05-plugin-development.md](./05-plugin-development.md) | プラグイン開発方法 -- 段階的にプラグインを構築する | ★★★★☆ |
| Lesson 6 | [06-plugin-marketplace.md](./06-plugin-marketplace.md) | マーケットプレイス活用 -- プラグインの検索・配布・運用 | ★★★☆☆ |
| 参考資料 | [references.md](./references.md) | 公式ドキュメントリンク集 | -- |

## 拡張機能の比較

| 機能 | 目的 | 設定場所 | 共有方法 |
|------|------|---------|---------|
| **Skills** | カスタムコマンドで指示を再利用 | `.claude/skills/` | プラグイン経由 |
| **Hooks** | イベント発生時に処理を自動実行 | `settings.json` | プロジェクト設定に含める |
| **Plugins** | Skills・Hooks・MCPをパッケージ化して配布 | `.claude-plugin/` | マーケットプレイス経由 |

## 学習の進め方

1. **Lesson 1-2**: まずSkillsとHooksの基礎を学び、カスタムコマンドと自動化の仕組みを理解する
2. **Lesson 3**: Hooksの詳細リファレンスは、実際にフックを作る際のリファレンスとして活用する
3. **Lesson 4-6**: プラグインシステムを理解し、Skills・Hooksをパッケージ化して共有する方法を学ぶ

各レッスンにはハンズオン演習が含まれているので、実際に手を動かしながら進めることを推奨します。

## 前提条件

- Week 1-4の内容を理解していること
- CLIの基本操作ができること
- JSONの基本的な文法を知っていること
- `jq`コマンドがインストール済みであること（フックの演習で使用）
- （プラグイン開発の場合）Markdownの基本的な記述ができること

## 公式リファレンス

- [Skills](https://code.claude.com/docs/en/skills)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
