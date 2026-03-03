# Lesson 2: MCPサーバー設定方法

> 対応する公式ドキュメント: [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## 学習目標

- `claude mcp`コマンドでMCPサーバーを追加・管理できる
- HTTP・SSE・stdioの3つのトランスポート方式を使い分けられる
- MCPサーバーのスコープ（local/project/user）を適切に選択できる
- `.mcp.json`を使ってチームでMCPサーバーを共有できる
- OAuth認証が必要なリモートMCPサーバーに接続できる
- `/mcp`コマンドでサーバーの状態を確認できる

## 概要

MCPサーバーの設定は`claude mcp`コマンドで行います。リモートサーバー（HTTP）、ローカルプロセス（stdio）、そして認証付きリモートサーバーの3つの方式があります。設定したMCPサーバーはスコープ（local/project/user）に基づいて、個人専用・チーム共有・全プロジェクト共有のいずれかで管理されます。

## 本文

### MCPサーバーの追加方法

#### 方法1: リモートHTTPサーバー（推奨）

クラウドベースのサービスへの接続に最適です：

```bash
# 基本構文
claude mcp add --transport http <name> <url>

# 例: Notionに接続
claude mcp add --transport http notion https://mcp.notion.com/mcp

# 認証ヘッダー付きの例
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

#### 方法2: リモートSSEサーバー（非推奨）

> **注意:** SSEトランスポートは非推奨です。利用可能な場合はHTTPを使用してください。

```bash
# 基本構文
claude mcp add --transport sse <name> <url>

# 例: AsanaのSSEサーバーに接続（レガシー）
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

#### 方法3: ローカルstdioサーバー

ローカルプロセスとして実行するサーバーです：

```bash
# 基本構文
claude mcp add [options] <name> -- <command> [args...]

# 例: Airtableサーバーを追加
claude mcp add --transport stdio --env AIRTABLE_API_KEY=YOUR_KEY airtable \
  -- npx -y airtable-mcp-server

# 例: PostgreSQLサーバーを追加
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

> **重要:** `--`（ダブルダッシュ）の前にオプションを、後にコマンドを書きます。オプションとコマンドの引数が混在しないようにするためです。

**Windows（WSL以外）でnpxを使う場合:**

```bash
# Windowsはcmdラッパーが必要
claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package
```

### MCPサーバーの管理

```bash
# 全サーバーの一覧表示
claude mcp list

# 特定サーバーの詳細確認
claude mcp get github

# サーバーの削除
claude mcp remove github

# Claude Code内でサーバー状態を確認
/mcp
```

`/mcp`コマンドはClaude Code内で使用し、接続状態・利用可能なツール・認証状況を確認できます。

### スコープの使い分け

MCPサーバーはスコープに基づいて管理されます：

| スコープ | フラグ | 保存場所 | 用途 |
|---------|--------|---------|------|
| `local`（デフォルト） | なし | `~/.claude.json`（プロジェクトパス下） | 個人・現在のプロジェクトのみ |
| `project` | `--scope project` | `.mcp.json`（プロジェクトルート） | チーム共有（バージョン管理に含める） |
| `user` | `--scope user` | `~/.claude.json` | 全プロジェクトで個人利用 |

```bash
# デフォルト（local）スコープで追加
claude mcp add --transport http stripe https://mcp.stripe.com

# projectスコープで追加（チーム共有）
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp

# userスコープで追加（全プロジェクトで個人利用）
claude mcp add --transport http hubspot --scope user https://mcp.hubspot.com/anthropic
```

#### スコープの優先度

同じ名前のサーバーが複数のスコープに存在する場合：
`local` > `project` > `user` の順で優先されます。

#### 「local」と「project」の混乱に注意

公式ドキュメントの注意事項：

> MCPサーバーの「local scope」は`~/.claude.json`（ホームディレクトリ）に保存されます。一般的な「local settings」（`.claude/settings.local.json`）とは異なります。

### プロジェクト共有のためのMCP設定（.mcp.json）

`--scope project`でサーバーを追加すると、プロジェクトルートに`.mcp.json`が作成されます：

```json
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

この`.mcp.json`はバージョン管理に含めることで、チーム全員が同じMCPサーバーを使えます。

> **セキュリティ:** `.mcp.json`のサーバーを使用する前に、Claude Codeは承認を求めます。信頼されていないリポジトリの`.mcp.json`には注意してください。

#### 環境変数の展開

`.mcp.json`では環境変数を使えます：

```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```

**構文:**
- `${VAR}`: 環境変数の値に展開
- `${VAR:-default}`: 変数が未設定の場合はデフォルト値を使用

### 設定方法の詳細オプション

#### 環境変数の設定

```bash
# 複数の環境変数を設定
claude mcp add --transport stdio \
  --env API_KEY=secret123 \
  --env LOG_LEVEL=debug \
  myserver -- node server.js
```

#### タイムアウトの設定

```bash
# 10秒のタイムアウトを設定
MCP_TIMEOUT=10000 claude
```

#### 出力トークン制限の変更

```bash
# デフォルトは25,000トークン（10,000トークンで警告）
MAX_MCP_OUTPUT_TOKENS=50000 claude
```

### JSONで一括設定する（add-json）

JSONで直接設定する方法：

```bash
# HTTPサーバー
claude mcp add-json weather-api \
  '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

# stdioサーバー
claude mcp add-json local-weather \
  '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'
```

### Claude Desktopからインポートする

既存のClaude Desktop設定を引き継ぐ：

```bash
# Claude Desktopのサーバーをインポート
claude mcp add-from-claude-desktop
```

インタラクティブなダイアログでどのサーバーをインポートするか選択できます。

> **対応OS:** macOSおよびWSL（Windows Subsystem for Linux）のみ

### OAuth認証付きサーバーへの接続

#### 標準OAuth（自動設定）

```bash
# 1. サーバーを追加
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 2. Claude Code内で/mcpコマンドを実行
/mcp

# 3. ブラウザでログイン
```

#### 事前設定済みOAuth認証情報（手動設定が必要な場合）

一部のサーバーは動的なクライアント登録をサポートしていません。その場合は：

```bash
# 方法1: --client-idフラグ
claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp

# 方法2: 環境変数でシークレットを指定（CI環境向け）
MCP_CLIENT_SECRET=your-secret claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### Claude.aiのMCPサーバーをClaude Codeで使う

Claude.aiアカウントで設定したMCPサーバーは自動的にClaude Codeで利用可能です：

```bash
# Claude.aiのMCPサーバーを無効化する場合
ENABLE_CLAUDEAI_MCP_SERVERS=false claude
```

### /mcpコマンドとコスト管理

Claude Code内で`/mcp`を実行すると：
- 接続中のMCPサーバー一覧と状態
- 利用可能なツール数
- コスト（ツール定義はコンテキストを消費する）

**コスト最適化のヒント:**

使用していないMCPサーバーは削除することで、コンテキスト消費を減らせます：

```bash
# 使用していないサーバーを削除
claude mcp remove unused-server-name
```

### MCP Tool Search（多数のサーバーがある場合）

MCPツールの定義がコンテキストウィンドウの10%を超えると、Tool Searchが自動的に有効になります：

```bash
# Tool Searchを制御する環境変数
ENABLE_TOOL_SEARCH=auto        # デフォルト（10%で自動有効化）
ENABLE_TOOL_SEARCH=auto:5      # 5%で有効化
ENABLE_TOOL_SEARCH=true        # 常に有効
ENABLE_TOOL_SEARCH=false       # 無効化
```

### MCPサーバーのリソースを使う

リソースは`@`メンションで参照できます：

```
# GitHubイシューを参照
Can you analyze @github:issue://123 and suggest a fix?

# ドキュメントを参照
Please review the API docs at @docs:file://api/authentication

# 複数のリソースを参照
Compare @postgres:schema://users with @docs:file://database/user-model
```

### Claude Code自体をMCPサーバーとして使う

Claude Codeを他のアプリケーションのMCPサーバーとして機能させることもできます：

```bash
# Claude Codeをstdio MCPサーバーとして起動
claude mcp serve
```

Claude Desktopの`claude_desktop_config.json`への設定例：

```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

## まとめ

- MCPサーバーの追加は`claude mcp add --transport http/stdio/sse <name> <url>`で行う
- HTTP（リモート）とstdio（ローカル）の2つが主なトランスポート方式（SSEは非推奨）
- スコープ（local/project/user）でサーバーの適用範囲を制御する
- `.mcp.json`をバージョン管理に含めてチームで共有できる
- `/mcp`コマンドで接続状態と利用可能なツールを確認できる
- `MAX_MCP_OUTPUT_TOKENS`で出力トークン制限を調整できる
- 大量のMCPサーバーがある場合、Tool Searchが自動的に有効化される

## 公式リファレンス

- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [MCP公式サイト](https://modelcontextprotocol.io/introduction)
