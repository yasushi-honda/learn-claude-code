# Lesson 3: 主要MCPサーバー一覧

> 対応する公式ドキュメント: [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## 学習目標

- よく使われるMCPサーバーのカテゴリと用途を把握できる
- 各サーバーの設定コマンドを実行してClaude Codeに接続できる
- 目的に合ったMCPサーバーを選択できる
- Anthropic MCPレジストリを活用できる

## 概要

Claude Codeには数百のMCPサーバーが接続可能です。このレッスンでは、よく使われる主要なMCPサーバーをカテゴリ別に紹介します。各サーバーの設定コマンドは公式レジストリ（`https://api.anthropic.com/mcp-registry/docs`）を参照しています。

> **注意:** サードパーティのMCPサーバーは自己責任で使用してください。AnthropicはすべてのサーバーのセキュリティやCorrectness（正確性）を検証しているわけではありません。

## 本文

### ソース管理系

#### GitHub

GitHubのイシュー・PR・コードを操作します：

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**主な用途:**
- PRの作成・レビュー
- イシューの確認・作成
- リポジトリの検索
- コードの閲覧

**接続例:**
```
/mcp  # OAuth認証を実行

# 認証後の使用例
「PR #456をレビューして改善点を提案してください」
「このバグのissueを作成してください」
「私に割り当てられたオープンなPRを一覧表示してください」
```

#### GitLab

GitLabのMRやイシューを操作します：

```bash
# GitLabサーバーはプラグインからインストール
/plugin install gitlab@claude-plugins-official
```

### データベース系

#### PostgreSQL（dbhub）

PostgreSQLデータベースに自然言語でクエリを投げられます：

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

**主な用途:**
- スキーマの確認
- データの検索・集計
- クエリの実行と結果の分析

**使用例:**
```
「今月の売上合計はいくらですか?」
「ordersテーブルのスキーマを確認してください」
「90日間購入していないユーザーを教えてください」
```

#### SQLite

ローカルのSQLiteデータベースに接続します：

```bash
claude mcp add --transport stdio sqlite -- \
  npx -y @modelcontextprotocol/server-sqlite /path/to/database.db
```

### プロジェクト管理系

#### Linear

Linearのイシュー管理システムと連携します：

```bash
# プラグインからインストール
/plugin install linear@claude-plugins-official
```

#### Jira/Confluence（Atlassian）

JiraイシューとConfluenceドキュメントを操作します：

```bash
/plugin install atlassian@claude-plugins-official
```

**使用例:**
```
「JIRAのENG-4521の要件を読んで実装してください」
「このバグのJIRAイシューを作成してください」
```

#### Asana

Asanaのタスク管理と連携します：

```bash
claude mcp add --transport http asana https://mcp.asana.com/sse
```

#### Notion

Notionのドキュメントとデータベースを操作します：

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

### ドキュメント系

#### Google Drive

Googleドライブのファイルを参照・操作します：

```bash
# セットアップは別途必要（Google Cloud認証情報が必要）
claude mcp add --transport stdio gdrive -- \
  npx -y @modelcontextprotocol/server-gdrive
```

#### Figma

Figmaのデザインを読み込んでコードに実装します：

```bash
/plugin install figma@claude-plugins-official
```

**使用例:**
```
「FigmaのデザインフレームXXXを読んでReactコンポーネントを作成してください」
```

### コミュニケーション系

#### Slack

SlackのメッセージとチャンネルをClaude Codeから操作します：

```bash
/plugin install slack@claude-plugins-official
```

**使用例:**
```
「#engineeringチャンネルの最新メッセージを確認してください」
「タスク完了をSlackで通知してください」
```

#### Gmail

Gmailのメールを読み書きします（APIキーが必要）：

```bash
# Gmailの設定は別途必要
```

### ブラウザ系

#### Playwright

ヘッドレスブラウザで自動化テストやスクレイピングを行います：

```bash
claude mcp add --transport stdio playwright -- \
  npx -y @playwright/mcp@latest
```

**主な用途:**
- Webアプリのテスト自動化
- フォームの自動入力
- スクリーンショットの取得
- データのスクレイピング

**使用例:**
```
「localhost:3000のログインフローをテストしてください」
「チェックアウトページのスクリーンショットを撮ってください」
```

### 監視・エラー追跡系

#### Sentry

Sentryのエラーレポートとスタックトレースを分析します：

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

**使用例:**
```
「Sentryで直近24時間に発生した主要エラーを教えてください」
「エラーID abc123のスタックトレースを確認してください」
「どのデプロイでこれらの新しいエラーが発生しましたか?」
```

### インフラ系

#### Vercel

Vercelのデプロイとプロジェクトを管理します：

```bash
/plugin install vercel@claude-plugins-official
```

#### Firebase

Firebase/Firestoreのデータを操作します：

```bash
/plugin install firebase@claude-plugins-official
```

#### Supabase

Supabaseのデータベースとストレージを操作します：

```bash
/plugin install supabase@claude-plugins-official
```

### 汎用系

#### ファイルシステム

ローカルファイルへのアクセスを提供します：

```bash
claude mcp add --transport stdio filesystem -- \
  npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/directory
```

**セキュリティに注意:** アクセスを許可するディレクトリを明示的に指定します。

#### Fetch（Webコンテンツ取得）

Webページのコンテンツを取得します：

```bash
claude mcp add --transport stdio fetch -- \
  npx -y @modelcontextprotocol/server-fetch
```

### Anthropic MCPレジストリの活用

公式のMCPレジストリAPIで利用可能なサーバーを検索できます：

```bash
# レジストリAPIを直接参照（AIエージェント向け）
https://api.anthropic.com/mcp-registry/docs
```

Claude Code内でも`/mcp`コマンドの後、ブラウザのマーケットプレイスページから検索できます。

### MCPサーバーの選び方

#### 公式プラグインから選ぶ

最も簡単なのは公式マーケットプレイスからインストールする方法です：

```bash
/plugin  # Discoverタブでサービス名を検索
```

#### GitHub MCP Serversリポジトリを参照する

コミュニティが提供する数百のMCPサーバーが公開されています：

```
https://github.com/modelcontextprotocol/servers
```

#### 自分で開発する

既存のMCPサーバーがない場合は自分で開発できます（次のレッスンで学びます）。

### セキュリティの考慮事項

MCPサーバーを使う際の重要な注意点：

1. **信頼できるサーバーのみ使用**: 不明なサーバーからプロンプトインジェクション攻撃を受ける可能性がある
2. **最小権限**: 読み取り専用の接続情報を使う（例: PostgreSQLの読み取り専用ユーザー）
3. **機密情報の管理**: APIキーなどは環境変数で管理する
4. **アクセス制御**: ファイルシステムMCPは許可するディレクトリを明示的に指定する
5. **.mcp.jsonのレビュー**: プロジェクトの`.mcp.json`には使用前に承認が必要

```bash
# 承認のリセット（初期状態に戻す）
claude mcp reset-project-choices
```

## まとめ

- GitHub・PostgreSQL・Playwright・Sentryなどの主要サービスはMCPサーバーで接続可能
- 公式プラグイン（`/plugin install`）が最も簡単なインストール方法
- GitHubのModelContextProtocol/serversリポジトリに数百のサードパーティサーバーがある
- セキュリティに注意（信頼できるサーバーのみ、最小権限、環境変数でAPIキー管理）
- `.mcp.json`はチームで共有できるが、使用前に承認が必要

## 公式リファレンス

- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [MCPサーバー一覧（GitHub）](https://github.com/modelcontextprotocol/servers)
- [Anthropic MCPレジストリAPI](https://api.anthropic.com/mcp-registry/docs)
- [MCP公式サイト](https://modelcontextprotocol.io/)
