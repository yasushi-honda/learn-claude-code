# Week 5: カスタマイズ・拡張

> 対応する公式ドキュメント: [Skills](https://code.claude.com/docs/en/skills) | [Hooks](https://code.claude.com/docs/en/hooks-guide) | [Plugins](https://code.claude.com/docs/en/plugins)

## 週の概要

Week 5では、Claude Codeをあなたのワークフローに合わせてカスタマイズし、拡張する方法を学びます。Skills（スキル）、Hooks（フック）、Plugins（プラグイン）という3つの主要な拡張機能を活用することで、Claude Codeを単なるAIアシスタントから、チーム全体の開発ワークフローに統合された強力なツールへと変えることができます。

## 学習目標

この週を終えると、以下のことができるようになります：

1. **Skills（スキル）** を作成し、カスタムコマンド（`/コマンド名`）としてClaudeの機能を拡張できる
2. **Hooks（フック）** を設定し、ファイル編集後の自動整形やコミット前のLintなど、ワークフローを自動化できる
3. **Plugins（プラグイン）** の仕組みを理解し、インストール・管理ができる
4. プラグインを開発して、チームや外部コミュニティと共有できる
5. マーケットプレイスからプラグインを検索・インストールできる
6. Skills・Hooks・Pluginsを組み合わせた効率的なカスタム開発環境を構築できる

## レッスン一覧

| レッスン | ファイル | 内容 |
|---------|---------|------|
| Lesson 1 | [01-skills-system.md](./01-skills-system.md) | Skillsシステム概要・作成方法 |
| Lesson 2 | [02-hooks-guide.md](./02-hooks-guide.md) | Hooksによる自動化 |
| Lesson 3 | [03-hooks-reference.md](./03-hooks-reference.md) | Hooks詳細リファレンス |
| Lesson 4 | [04-plugins-overview.md](./04-plugins-overview.md) | プラグインシステム概要 |
| Lesson 5 | [05-plugin-development.md](./05-plugin-development.md) | プラグイン開発方法 |
| Lesson 6 | [06-plugin-marketplace.md](./06-plugin-marketplace.md) | マーケットプレイス活用 |
| 参考資料 | [references.md](./references.md) | 公式ドキュメントリンク集 |

## 前提知識

- Week 1〜4の内容を理解していること
- CLIの基本操作ができること
- JSONの基本的な文法を知っていること
- （プラグイン開発の場合）Markdownの基本的な記述ができること

## 拡張機能の比較

| 機能 | 目的 | 設定場所 | 共有方法 |
|------|------|---------|---------|
| **Skills** | カスタムコマンドで指示を再利用 | `.claude/skills/` | プラグイン経由 |
| **Hooks** | イベント発生時にシェルコマンドを自動実行 | `settings.json` | プロジェクト設定に含める |
| **Plugins** | Skills・Hooks・MCPをパッケージ化して配布 | マーケットプレイス | マーケットプレイス経由 |

## 学習のヒント

1. まずSkillsから始めて、Claudeのカスタムコマンドの仕組みを理解する
2. Hooksはシンプルな自動化から試してみる（例：ファイル保存後にPrettierを実行）
3. プラグインは既存のもの（公式マーケットプレイス）を使ってから開発に進む

## 公式リファレンス

- [Skills](https://code.claude.com/docs/en/skills)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Discover Plugins](https://code.claude.com/docs/en/discover-plugins)
