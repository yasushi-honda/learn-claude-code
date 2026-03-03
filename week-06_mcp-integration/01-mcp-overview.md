# Lesson 1: MCPプロトコル概要

> 対応する公式ドキュメント: [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## 学習目標

- MCP（Model Context Protocol）の基本概念と目的を説明できる
- MCPサーバー・ツール・リソースの役割を理解できる
- なぜMCPが重要かを説明できる
- MCPのアーキテクチャを図で理解できる
- MCP・REST API・GraphQLの違いを説明できる

## 概要

MCP（Model Context Protocol）は、AIツールと外部データソース・ツールを接続するためのオープン標準プロトコルです。AnthropicがClaude Desktopで最初に採用し、現在は業界全体で広く使われるオープン標準となっています。

従来、AIアシスタントに外部データを渡すにはプロンプトに貼り付けるか、カスタム統合を構築するしかありませんでした。MCPは「AIが外部ツールと話す共通言語」を提供することで、GitHub・データベース・Slack・Figmaなど、あらゆるツールとClaudeを標準的な方法で接続できるようにします。

## 本文

### MCPとは

Model Context Protocol（MCP）は、AIモデルが外部ツールやデータソースと安全・標準的に接続するためのオープンプロトコルです。

**公式説明:**
> "MCP servers give Claude Code access to your tools, databases, and APIs."

MCPを使うと：
- JIRAのイシューをClaudeが直接読み込める
- PostgreSQLデータベースにClaudeが直接クエリを投げられる
- GitHubのPRをClaudeが直接作成・コメントできる
- Sentryのエラーログをリアルタイムで取得できる

### MCPの基本概念

#### MCPサーバー

MCPサーバーは、特定のツールやサービスへのアクセスを提供するプロセスです。

```
Claude Code ←→ MCPサーバー ←→ 外部ツール（GitHub, DB, Slack...）
```

各MCPサーバーは：
- **ツール**: Claudeが呼び出せる関数（例: `create_issue`, `query_database`）
- **リソース**: Claudeが参照できるデータ（例: ファイル、ドキュメント）
- **プロンプト**: 再利用可能なテンプレート

#### ツール（Tools）

ツールはClaudeが実行できるアクションです。例えば：

```
github MCPサーバーのツール:
- create_issue（イシューを作成）
- create_pull_request（PRを作成）
- search_repositories（リポジトリを検索）
- list_pull_requests（PRの一覧を取得）
```

Claudeはユーザーのリクエストに基づいて適切なツールを選択して呼び出します。

#### リソース（Resources）

リソースはClaudeが@メンションで参照できるデータです：

```
@github:issue://123          # GitHubイシュー#123
@postgres:schema://users     # usersテーブルのスキーマ
@docs:file://api/auth        # APIドキュメント
```

#### プロンプト（Prompts）

MCPサーバーが提供するプロンプトは`/`コマンドとして使えます：

```
/mcp__github__list_prs       # PRの一覧
/mcp__github__pr_review 456  # PR#456をレビュー
```

### なぜMCPが重要か

#### 従来の課題

```
従来の方法（コピー＆ペースト）:
1. GitHubを開いてイシューの内容をコピー
2. Claudeのチャットに貼り付け
3. 回答を受け取ってGitHubに戻って実装
4. 変更をコミットしてPRを手動作成

→ 手動作業が多く、コンテキストを切り替える必要がある
```

#### MCPを使った場合

```
MCPを使った方法:
「JIRAのENG-4521を実装してGitHubにPRを作成して」

→ ClaudeがJIRAからイシュー情報を取得
→ コードを実装
→ GitHubにPRを自動作成
→ 全て一つのプロンプトで完結
```

#### MCPの主なメリット

1. **標準化**: 各サービスが独自の統合方法を提供する必要がない
2. **セキュリティ**: MCPサーバーが適切なアクセス制御を実装できる
3. **再利用性**: 一度作ったMCPサーバーは任意のMCP対応AIツールで使える
4. **拡張性**: 新しいツールの追加が簡単

### MCPのアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                  Claude Code                          │
│  ┌──────────────────────────────────────────────┐   │
│  │          Claude (LLM)                         │   │
│  │  - ツールを選択・呼び出す                      │   │
│  │  - 結果を解釈して次の行動を決定                │   │
│  └──────────────────────────────────────────────┘   │
│           ↕ MCP Protocol                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ GitHub   │ │PostgreSQL│ │  Sentry  │  MCPサーバー│
│  │  MCP     │ │  MCP     │ │  MCP     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
       ↕               ↕               ↕
  GitHub API    PostgreSQL DB    Sentry API
```

#### トランスポート方式

MCPは2つの通信方式をサポートします：

| 方式 | 説明 | 用途 |
|-----|------|------|
| **stdio** | 標準入出力でプロセス間通信 | ローカルプロセスとして動作するサーバー |
| **HTTP** | HTTPリクエストで通信（推奨） | リモートサーバー・クラウドサービス |
| **SSE** | Server-Sent Events（非推奨） | レガシーリモートサーバー |

### MCP vs REST API vs GraphQL

MCPと従来のAPI連携の違いを理解することが重要です：

| 比較軸 | MCP | REST API | GraphQL |
|-------|-----|---------|---------|
| **設計の目的** | AIとツールの接続 | クライアント-サーバー通信 | データ取得の効率化 |
| **接続方法** | AIが自律的に選択 | 開発者が明示的に呼び出す | 開発者が明示的に呼び出す |
| **標準化** | AIツール向けオープン標準 | HTTP上の慣例 | Facebookが開発したクエリ言語 |
| **コンテキスト共有** | セッションを通じて保持 | ステートレス | ステートレス |
| **AI向け最適化** | ○（ツール・リソース・プロンプトの概念） | ✗ | ✗ |

**重要な違い:**

REST APIやGraphQLは「開発者がコードで呼び出す」ためのものです。MCPは「AIが自律的に呼び出す」ためのものです。ClaudeはMCPサーバーのツール定義を見て、ユーザーのリクエストに最適なツールを選択・実行します。

### MCPサーバーの動的更新

Claude Codeはリアルタイムのツール更新をサポートします。MCPサーバーが`list_changed`通知を送ると、Claude Codeは切断・再接続なしで利用可能なツールを自動更新します。

### MCPの活用例

公式ドキュメントのユースケース例：

```
# イシュートラッカーからの機能実装
「JIRAのENG-4521に記載されている機能を実装してGitHubにPRを作成して」

# 監視データの分析
「SentryとStatsigを確認してENG-4521の機能の使用状況を調べて」

# データベースのクエリ
「PostgreSQLデータベースからENG-4521を使ったユーザー10人のメールアドレスを取得して」

# デザインの統合
「Slackに投稿された新しいFigmaデザインに基づいてメールテンプレートを更新して」

# 自動化
「これら10人のユーザーを新機能のフィードバックセッションに招待するGmailの下書きを作成して」
```

## まとめ

- MCPはAIツールと外部サービスを接続するオープン標準プロトコル
- MCPサーバーはツール（実行できるアクション）とリソース（参照できるデータ）を提供する
- stdioとHTTPの2つのトランスポート方式がある（HTTPを推奨）
- MCPはREST APIと異なり、AIが自律的にツールを選択・呼び出せるよう設計されている
- 一度MCPサーバーを設定すれば、あらゆるMCP対応AIツールで再利用できる

## 公式リファレンス

- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [MCP公式サイト](https://modelcontextprotocol.io/introduction)
- [MCP SDKドキュメント](https://modelcontextprotocol.io/quickstart/server)
- [MCPサーバー一覧（GitHub）](https://github.com/modelcontextprotocol/servers)
