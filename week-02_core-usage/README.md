# Week 2: 基本操作・CLI

> **対応公式ドキュメント**: [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) / [CLI Reference](https://code.claude.com/docs/en/cli-reference) / [Common Workflows](https://code.claude.com/docs/en/common-workflows)
> **想定所要時間**: 約5時間（各レッスン約60分）
> **前提条件**: Week 1 完了（Claude Code インストール済み・認証設定済み）
> **難易度**: ★★☆☆☆

## この週の概要

Week 2 では Claude Code の日常的な操作を習得します。対話モードのキーボードショートカットから始めて、CLI コマンド体系、実践的なワークフロー、内部ツールの仕組み、Git との連携まで、開発者として Claude Code を使いこなすための基礎をカバーします。

## 学習目標

この週を終えると、以下のことができるようになります：

1. 対話モードのキーボードショートカット・入力モード・@メンション・/コマンドを使いこなせる
2. CLI コマンドとフラグの体系を理解し、スクリプトや CI/CD への組み込みができる
3. コードベース探索・バグ修正・リファクタリング・テスト作成などの基本ワークフローを実行できる
4. Claude Code の内部ツール（Read / Edit / Write / Glob / Grep / Bash）の違いと使い分けを説明できる
5. Git との連携機能（コミット・ブランチ・PR 作成・コンフリクト解消）を活用できる

## レッスン一覧

| # | ファイル | タイトル | 内容 | 所要時間 |
|---|---|---|---|---|
| 01 | [01-interactive-mode.md](./01-interactive-mode.md) | 対話モードの使い方 | キーボードショートカット・マルチライン入力・@メンション・/コマンド・Vim モード | 約60分 |
| 02 | [02-cli-reference.md](./02-cli-reference.md) | CLI コマンド体系 | コマンド一覧・フラグ一覧・システムプロンプト・出力フォーマット・--agents | 約60分 |
| 03 | [03-common-workflows.md](./03-common-workflows.md) | 基本ワークフロー | 探索・デバッグ・リファクタリング・テスト・Plan mode・画像・セッション管理 | 約60分 |
| 04 | [04-file-operations.md](./04-file-operations.md) | ファイル操作とツール体系 | Read / Edit / Write / Glob / Grep / Bash / Web / Code intelligence | 約60分 |
| 05 | [05-git-integration.md](./05-git-integration.md) | Git 統合 | コミット・ブランチ・PR 作成・コンフリクト解消・worktree・GitHub Actions | 約60分 |
| 06 | [06-code-review.md](./06-code-review.md) | コードレビュー | マルチエージェント PR 解析・REVIEW.md・重要度レベル・料金 | 約45分 |
| -- | [references.md](./references.md) | 公式リファレンス | Week 2 対応の公式ドキュメントリンク集 | -- |

## 学習の進め方

1. **01（対話モード）**: ショートカットとコマンドは実際に手を動かして覚える。すべてを一度に暗記する必要はなく、よく使うものから徐々に身に付ける
2. **02（CLI）**: フラグの全量を把握し、辞書的に参照できるようにしておく。特に `-p`（print モード）と `--output-format` は CI/CD で必須
3. **03（ワークフロー）**: 実際のプロジェクトで各ワークフローを試す。Plan mode を活用した安全なデバッグ・リファクタリングが重要
4. **04（ファイル操作）**: verbose モード（`Ctrl+O`）でツールの動作を観察し、プロンプトの改善に活かす
5. **05（Git 統合）**: `claude commit` と `/commit-push-pr` を実際に使って、Git ワークフローの効率化を体験する

各レッスンにはハンズオン演習が含まれています。読むだけでなく、必ず手を動かして試してください。

---

前のステップ: [Week 1 - 入門・セットアップ](../week-01_introduction/README.md)

次のステップ: [Week 3 - 開発環境統合](../week-03_environments/README.md)
