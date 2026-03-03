# Claude Code とは何か

> 対応する公式ドキュメント: [Claude Code Overview](https://code.claude.com/docs/en/overview)

## 学習目標

- Claude Code の定義と位置づけを理解する
- 他の AI コーディングツールとの違いを説明できる
- Claude Code でできることの全体像を把握する
- 利用できる環境・インターフェースを列挙できる

## 概要

Claude Code は、Anthropic が提供するエージェント型の AI コーディングツールです。単純なコード補完にとどまらず、コードベース全体を読み込み、ファイルを編集し、コマンドを実行し、開発ツールと連携することができます。ターミナル、IDE、デスクトップアプリ、ブラウザなど複数の環境で動作し、開発者の日常的な作業を自然言語の指示だけで自動化できます。

## 本文

### Claude Code の定義

Claude Code は「**agentic coding tool（エージェント型コーディングツール）**」です。従来の AI コーディングアシスタントと異なり、単に現在のファイルに対してサジェストするだけでなく、プロジェクト全体を理解した上で複数のファイルにまたがる作業を自律的に実行します。

```
Claude Code はコードベースを読み込み、ファイルを編集し、
コマンドを実行し、開発ツールと統合する AI コーディングアシスタントです。
ターミナル、IDE、デスクトップアプリ、ブラウザで利用できます。
```

### できること一覧

Claude Code は以下のことを実行できます：

#### 自動化タスク
```bash
claude "write tests for the auth module, run them, and fix any failures"
```
- テストが存在しないコードへのテスト追加
- プロジェクト全体の lint エラー修正
- マージコンフリクトの解決
- 依存関係の更新
- リリースノートの作成

#### 機能開発・バグ修正
```bash
claude "there's a bug where users can submit empty forms - fix it"
```
- 自然言語での機能要求を実装
- エラーメッセージからバグを追跡・修正
- 複数ファイルにまたがる変更の実施

#### Git 操作
```bash
claude "commit my changes with a descriptive message"
```
- 変更のステージング・コミット
- ブランチの作成・管理
- プルリクエストの作成
- GitHub Actions / GitLab CI/CD との連携

#### MCP（Model Context Protocol）連携
- Google Drive のデザインドキュメント参照
- Jira のチケット更新
- Slack からのデータ取得
- カスタムツールとの連携

#### カスタマイズ機能
- **CLAUDE.md**: プロジェクトへの永続的な指示を記録
- **スキル（Skills）**: チームで共有できるカスタムコマンド（`/review-pr` など）
- **フック（Hooks）**: ファイル編集後の自動フォーマット実行など

#### Agent Teams
- 複数の Claude Code エージェントを並列で起動
- リードエージェントがサブタスクを割り当て・結果をマージ
- Agent SDK でカスタムエージェントを構築可能

#### パイプ・スクリプト処理
```bash
# ログ監視と通知
tail -f app.log | claude -p "Slack me if you see any anomalies"

# CI でのローカライズ自動化
claude -p "translate new strings into French and raise a PR for review"

# セキュリティレビュー
git diff main --name-only | claude -p "review these changed files for security issues"
```

### 利用可能な環境

Claude Code は以下のインターフェースで利用できます：

| 環境 | 説明 |
|---|---|
| **Terminal（ターミナル）** | フル機能の CLI。ファイル編集・コマンド実行・プロジェクト管理すべてが可能 |
| **VS Code** | インライン diff、@メンション、プランレビュー、会話履歴が IDE 内で利用可能 |
| **Desktop App** | 独立したアプリ。複数セッションの並列実行・diff の視覚的レビュー |
| **Web（claude.ai/code）** | ブラウザで動作。長時間タスクのオフロードやローカルにないリポジトリでの作業 |
| **JetBrains** | IntelliJ IDEA、PyCharm、WebStorm 等向けプラグイン |
| **Slack** | `@Claude` へのメンションでバグレポートを PR に変換 |
| **GitHub Actions** | PR レビューと Issue トリアージの自動化 |
| **GitLab CI/CD** | CI/CD パイプラインへの統合 |
| **Chrome** | ライブ Web アプリのデバッグ |
| **iOS アプリ** | モバイルからのセッション継続・確認 |
| **Remote Control** | ブラウザから手元の Claude Code セッションをリモート操作 |

これらのインターフェースはすべて同じ Claude Code エンジンに接続されるため、CLAUDE.md ファイル、設定、MCP サーバーはどの環境でも共通して機能します。

### Claude Code と従来のツールの違い

| 機能 | 従来の AI コードアシスタント | Claude Code |
|---|---|---|
| スコープ | 現在のファイル・選択範囲 | プロジェクト全体 |
| 操作 | サジェスト・補完 | 実際にファイルを編集・コマンドを実行 |
| 連携 | エディタプラグインのみ | Git・テスト・CI/CD・外部サービス |
| 自律性 | ユーザーが逐次承認 | エージェントが自律的に複数ステップを実行 |
| カスタマイズ | ほぼなし | CLAUDE.md・Skills・Hooks・MCP |

## まとめ

- Claude Code は **エージェント型** の AI コーディングツールであり、プロジェクト全体を理解して自律的に作業を進める
- ファイル編集・コマンド実行・Git 操作・外部サービス連携を自然言語の指示だけで実行できる
- Terminal / VS Code / Desktop / Web / JetBrains / Slack / GitHub Actions / GitLab / Chrome / iOS など幅広い環境で利用可能
- CLAUDE.md・Skills・Hooks・MCP による高度なカスタマイズが可能
- Agent Teams により複数エージェントを並列で実行し、大規模タスクを効率化できる

## 公式リファレンス

- [Claude Code Overview](https://code.claude.com/docs/en/overview) - 概要と利用環境
- [Common Workflows](https://code.claude.com/docs/en/common-workflows) - 典型的なワークフロー
- [Features Overview](https://code.claude.com/docs/en/features-overview) - 拡張機能の概要
