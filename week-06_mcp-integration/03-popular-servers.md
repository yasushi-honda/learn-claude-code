# 主要MCPサーバー一覧

> **対応公式ドキュメント**: https://code.claude.com/docs/en/mcp
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. よく使われるMCPサーバーのカテゴリと用途を把握できる
2. 各サーバーの設定コマンドを実行してClaude Codeに接続できる
3. 目的に合ったMCPサーバーを選択できる
4. MCPサーバーの探し方（レジストリ・プラグイン・GitHub）を知っている

---

## 1. ソース管理系

### GitHub

GitHubのイシュー・PR・コード・リポジトリを操作するMCPサーバーです。

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

**主なツール**: PRの作成・レビュー、イシューの確認・作成、リポジトリの検索、コードの閲覧

**接続手順**:

```
# 1. サーバーを追加（上記コマンド）
# 2. Claude Code内でOAuth認証
/mcp  # → GitHubの横の認証リンクをクリック → ブラウザでログイン

# 3. 認証後の使用例
「PR #456をレビューして改善点を提案してください」
「このバグのissueを作成してください」
「私に割り当てられたオープンなPRを一覧表示してください」
```

> **ヒント**: GitHub MCPはOAuth認証を使用するため、個人アクセストークンの設定は不要です。`/mcp`からブラウザログインするだけで使えます。

### GitLab

GitLabのMRやイシューを操作します。

```bash
# プラグインからインストール
/plugin install gitlab@claude-plugins-official
```

---

## 2. データベース系

### PostgreSQL（dbhub）

PostgreSQLデータベースに自然言語でクエリを投げられるMCPサーバーです。

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

**主なツール**: スキーマの確認、データの検索・集計、クエリの実行と結果の分析

**使用例**:

```
「今月の売上合計はいくらですか?」
「ordersテーブルのスキーマを確認してください」
「90日間購入していないユーザーを教えてください」
```

> **セキュリティ**: データベース接続には**読み取り専用ユーザー**を使用することを強く推奨します。Claudeが誤ってデータを変更・削除するリスクを防げます。

### SQLite

ローカルのSQLiteデータベースに接続します。開発環境やプロトタイプに最適です。

```bash
claude mcp add --transport stdio sqlite -- \
  npx -y @modelcontextprotocol/server-sqlite /path/to/database.db
```

---

## 3. プロジェクト管理系

### Linear

Linearのイシュー管理システムと連携します。

```bash
/plugin install linear@claude-plugins-official
```

### Jira/Confluence（Atlassian）

JiraイシューとConfluenceドキュメントを操作します。

```bash
/plugin install atlassian@claude-plugins-official
```

**使用例**:

```
「JIRAのENG-4521の要件を読んで実装してください」
「このバグのJIRAイシューを作成してください」
「Confluenceのアーキテクチャドキュメントを参照してください」
```

### Asana

Asanaのタスク管理と連携します。

```bash
claude mcp add --transport http asana https://mcp.asana.com/sse
```

### Notion

Notionのドキュメントとデータベースを操作します。

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

**使用例**:

```
「Notionのプロジェクト仕様書を読んで実装してください」
「Notionのスプリントボードに新しいタスクを追加してください」
```

---

## 4. ドキュメント・デザイン系

### Google Drive

Googleドライブのファイルを参照・操作します。

```bash
# セットアップは別途Google Cloud認証情報が必要
claude mcp add --transport stdio gdrive -- \
  npx -y @modelcontextprotocol/server-gdrive
```

### Figma

Figmaのデザインを読み込んでコードに実装します。

```bash
/plugin install figma@claude-plugins-official
```

**使用例**:

```
「FigmaのデザインフレームXXXを読んでReactコンポーネントを作成してください」
「Figmaのモックアップと実装を比較して差分を教えてください」
```

---

## 5. コミュニケーション系

### Slack

SlackのメッセージとチャンネルをClaude Codeから操作します。

```bash
/plugin install slack@claude-plugins-official
```

**使用例**:

```
「#engineeringチャンネルの最新メッセージを確認してください」
「タスク完了をSlackで通知してください」
```

> **注意**: Lesson 6ではSlackからClaude Codeを呼び出す「Claude Code in Slack」について別途解説します。ここでのSlack MCPは、Claude CodeからSlackを操作する方向の連携です。

---

## 6. ブラウザ自動化系

### Playwright

ヘッドレスブラウザで自動化テストやスクレイピングを行います。

```bash
claude mcp add --transport stdio playwright -- \
  npx -y @playwright/mcp@latest
```

**主なツール**: Webアプリのテスト自動化、フォームの自動入力、スクリーンショットの取得、データのスクレイピング

**使用例**:

```
「localhost:3000のログインフローをテストしてください」
「チェックアウトページのスクリーンショットを撮ってください」
「商品一覧ページの全アイテム名と価格を取得してください」
```

> **Chrome連携との違い**: Playwright MCPは独立したブラウザインスタンスで動作します。ログイン済みセッションが必要な場合はChrome連携（Lesson 5）を検討してください。

---

## 7. 監視・エラー追跡系

### Sentry

Sentryのエラーレポートとスタックトレースを分析します。

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

**使用例**:

```
「Sentryで直近24時間に発生した主要エラーを教えてください」
「エラーID abc123のスタックトレースを確認してください」
「どのデプロイでこれらの新しいエラーが発生しましたか?」
```

SentryのMCPサーバーはOAuth認証を使用します。初回は`/mcp`からブラウザでログインしてください。

---

## 8. インフラ・クラウド系

### Vercel

Vercelのデプロイとプロジェクトを管理します。

```bash
/plugin install vercel@claude-plugins-official
```

### Firebase

Firebase/Firestoreのデータを操作します。

```bash
/plugin install firebase@claude-plugins-official
```

### Supabase

Supabaseのデータベースとストレージを操作します。

```bash
/plugin install supabase@claude-plugins-official
```

---

## 9. 汎用系

### ファイルシステム

ローカルファイルへの追加アクセスを提供します。

```bash
claude mcp add --transport stdio filesystem -- \
  npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/directory
```

> **セキュリティ**: アクセスを許可するディレクトリを明示的に指定します。ルートディレクトリ(`/`)を指定しないでください。

### Fetch（Webコンテンツ取得）

Webページのコンテンツを取得してClaude Codeに渡します。

```bash
claude mcp add --transport stdio fetch -- \
  npx -y @modelcontextprotocol/server-fetch
```

---

## 10. MCPサーバーの探し方

### 方法1: 公式プラグインマーケットプレイス

最も簡単な方法です。Claude Code内でプラグインを検索してインストールします。

```bash
/plugin  # Discoverタブでサービス名を検索
```

プラグインにはMCPサーバーがバンドルされている場合が多く、インストールするだけで使えます。

### 方法2: Anthropic MCPレジストリ

公式のMCPレジストリAPIで利用可能なサーバーを検索できます。

```
https://api.anthropic.com/mcp-registry/docs
```

### 方法3: GitHub MCP Serversリポジトリ

コミュニティが提供する数百のMCPサーバーが公開されています。

```
https://github.com/modelcontextprotocol/servers
```

### 方法4: 自分で開発する

既存のMCPサーバーがない社内ツールや独自APIには、カスタムMCPサーバーを開発できます（次の章で解説）。

### 選び方のフローチャート

```
接続したいサービスがある
  │
  ├─ /plugin で検索 → 見つかった → インストール（最も簡単）
  │
  ├─ 公式レジストリで検索 → 見つかった → claude mcp add で登録
  │
  ├─ GitHubリポジトリで検索 → 見つかった → READMEの指示に従って設定
  │
  └─ どこにもない → カスタムMCPサーバーを開発（Lesson 4）
```

---

## 11. セキュリティの考慮事項

MCPサーバーを使う際の重要な注意点をまとめます。

| 原則 | 説明 |
|------|------|
| **信頼できるサーバーのみ使用** | 不明なサーバーからプロンプトインジェクション攻撃を受ける可能性がある |
| **最小権限** | データベースには読み取り専用ユーザーを使う |
| **機密情報の外部化** | APIキーなどは環境変数`${VAR}`で管理する |
| **アクセス範囲の制限** | ファイルシステムMCPは許可するディレクトリを明示する |
| **.mcp.jsonのレビュー** | 他者のリポジトリの`.mcp.json`は使用前に内容を確認する |

```bash
# .mcp.jsonの承認をリセットする（初期状態に戻す）
claude mcp reset-project-choices
```

---

## ハンズオン演習

### 演習 1: GitHub MCPサーバーを設定する

**目的**: リモートHTTPサーバーの設定とOAuth認証を体験する
**前提条件**: GitHubアカウントがあること

**手順**:

1. GitHub MCPサーバーを追加する

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

2. Claude Codeを起動してOAuth認証を行う

```bash
claude
```

```
/mcp
# GitHubの横の認証リンクをクリック → ブラウザでGitHubにログイン
```

3. 認証後、GitHubのツールを使ってみる

```
「私のGitHubリポジトリを一覧表示してください」
「最近のPRを確認してください」
```

**期待される結果**: GitHubのリポジトリ情報やPR一覧が表示される。

### 演習 2: Fetch MCPで外部情報を取得する

**目的**: stdioトランスポートのMCPサーバーを設定して使う
**前提条件**: Node.jsがインストール済みであること

**手順**:

1. Fetch MCPサーバーを追加する

```bash
claude mcp add --transport stdio fetch -- npx -y @modelcontextprotocol/server-fetch
```

2. Claude Code内で使用する

```
「https://httpbin.org/get の内容を取得して、レスポンスの構造を説明してください」
```

**期待される結果**: WebページのコンテンツをClaudeが取得して解説する。

### 演習 3: MCPサーバーの棚卸し

**目的**: 不要なMCPサーバーを特定してコンテキスト消費を最適化する

**手順**:

1. 現在のMCPサーバー一覧を確認する

```bash
claude mcp list
```

2. Claude Code内で各サーバーの状態を確認する

```
/mcp
```

3. 使用していないサーバーがあれば削除する

```bash
claude mcp remove <使用していないサーバー名>
```

**期待される結果**: 不要なサーバーが削除され、コンテキストの節約につながる。

---

## よくある質問

**Q: MCPサーバーとプラグインの違いは?**
A: プラグインはMCPサーバー・Skills・Hooks等をパッケージ化して配布するものです。プラグインにMCPサーバーがバンドルされている場合が多く、`/plugin install`でMCPサーバーも含めて一括インストールできます。

**Q: npxで起動するstdioサーバーは毎回ダウンロードされますか?**
A: `npx -y`はパッケージがキャッシュされていればキャッシュを使います。初回のみダウンロードが発生し、以降はキャッシュから起動されます。

**Q: 複数のデータベースに接続したい場合はどうすればいいですか?**
A: 異なる名前で複数のMCPサーバーを追加します。例: `claude mcp add --transport stdio prod-db -- ...` と `claude mcp add --transport stdio staging-db -- ...` のように名前を変えて登録します。

**Q: MCPサーバーの接続が不安定です。どうすればいいですか?**
A: `/mcp`でサーバーの状態を確認してください。`disconnected`の場合は、サーバープロセスが起動しているか（stdioの場合）、URLが正しいか（HTTPの場合）を確認します。`claude mcp remove`と`claude mcp add`で再登録も有効です。

---

## まとめ

この章で学んだ重要ポイント：

- GitHub・PostgreSQL・Playwright・Sentry等の主要サービスはMCPサーバーで接続可能
- 公式プラグイン（`/plugin install`）が最も簡単なインストール方法
- データベース接続には読み取り専用ユーザーを使い、APIキーは環境変数で管理する
- MCPサーバーの探し方: プラグイン > レジストリ > GitHub > カスタム開発 の順で検討する
- 不要なサーバーはコンテキスト消費を増やすので定期的に棚卸しする

## 次のステップ

次の章「カスタムMCPサーバー開発」では、既存のMCPサーバーがない社内ツールや独自APIに対して、自分でMCPサーバーを開発する方法を学びます。

---

> **公式リファレンス**
> - [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
> - [MCPサーバー一覧（GitHub）](https://github.com/modelcontextprotocol/servers)
> - [Anthropic MCPレジストリAPI](https://api.anthropic.com/mcp-registry/docs)
> - [MCP公式サイト](https://modelcontextprotocol.io/)
