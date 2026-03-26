# MCPサーバー設定方法

> **対応公式ドキュメント**: https://code.claude.com/docs/en/mcp
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. `claude mcp add`コマンドでHTTP・stdio・SSEの3方式でMCPサーバーを追加できる
2. スコープ（local / project / user）を適切に選択してサーバーを管理できる
3. `.mcp.json`を使ってチームでMCPサーバー設定を共有できる
4. OAuth認証付きリモートMCPサーバーに接続できる

---

## 1. MCPサーバーの追加方法

MCPサーバーの追加は`claude mcp add`コマンドで行います。3つのトランスポート方式に対応しており、接続先のサーバーに応じて使い分けます。

### 方法1: Remote HTTP（推奨）

クラウドベースのサービスへの接続に最適な方式です。

```bash
# 基本構文
claude mcp add --transport http <name> <url>

# 例: Notionに接続
claude mcp add --transport http notion https://mcp.notion.com/mcp

# 認証ヘッダー付きの例
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

HTTPトランスポートは最も推奨される方式です。リモートサーバーへの接続にはまずHTTPを検討してください。

### 方法2: Remote SSE（非推奨）

> **公式ドキュメントより**: SSEトランスポートは非推奨です。利用可能な場合はHTTPを使用してください。

```bash
# 基本構文
claude mcp add --transport sse <name> <url>

# 例: レガシーSSEサーバーに接続
claude mcp add --transport sse legacy-server https://mcp.example.com/sse
```

SSEは既存のレガシーサーバーでHTTPが未対応の場合にのみ使用します。

### 方法3: Local stdio

ローカルプロセスとして実行するサーバーです。データベース接続やファイル操作など、ローカル環境で動作するサーバーに使います。

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

> **公式ドキュメントより**: オプション（`--transport`, `--env`等）はサーバー名の前に置きます。`--`（ダブルダッシュ）でコマンド引数を分離し、オプションとコマンドが混在しないようにします。

**Windows（WSL以外）でnpxを使う場合**:

```bash
# Windowsはcmdラッパーが必要
claude mcp add --transport stdio my-server -- cmd /c npx -y @some/package
```

### 構文の重要ポイント

```bash
claude mcp add [オプション] <サーバー名> -- <コマンド> [コマンド引数]
               ↑                ↑         ↑    ↑
               --transport等    名前     区切り  実行コマンド
```

オプションがサーバー名の**前**に来ることを覚えておいてください。これを逆にするとエラーになります。

---

## 2. MCPサーバーの管理

### 基本管理コマンド

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

`/mcp`コマンドはClaude Codeのセッション内で使用します。接続状態・利用可能なツール数・認証状況をリアルタイムで確認できます。

### JSON設定による一括登録（add-json）

JSON文字列で直接設定を指定する方法です。

```bash
# HTTPサーバー
claude mcp add-json weather-api \
  '{"type":"http","url":"https://api.weather.com/mcp","headers":{"Authorization":"Bearer token"}}'

# stdioサーバー
claude mcp add-json local-server \
  '{"type":"stdio","command":"/path/to/server","args":["--api-key","abc123"],"env":{"CACHE_DIR":"/tmp"}}'
```

スクリプトやCI/CDでMCPサーバーを自動設定する場合に便利です。

### Claude Desktopからインポート

既にClaude Desktopで設定済みのMCPサーバーがある場合、それをインポートできます。

```bash
# Claude Desktopのサーバーをインポート
claude mcp add-from-claude-desktop
```

インタラクティブなダイアログでインポートするサーバーを選択できます。

> **対応OS**: macOSおよびWSL（Windows Subsystem for Linux）のみ

---

## 3. スコープの使い分け

MCPサーバーは**スコープ**に基づいて管理されます。適切なスコープを選ぶことで、個人専用・チーム共有・全プロジェクト共有を使い分けられます。

### 3つのスコープ

| スコープ | フラグ | 保存場所 | 用途 |
|---------|--------|---------|------|
| `local`（デフォルト） | なし | `~/.claude.json`（プロジェクトパス配下） | 個人・現在のプロジェクトのみ |
| `project` | `--scope project` | `.mcp.json`（プロジェクトルート） | チーム共有（VCSに含める） |
| `user` | `--scope user` | `~/.claude.json` | 全プロジェクトで個人利用 |

```bash
# デフォルト（local）スコープで追加
claude mcp add --transport http stripe https://mcp.stripe.com

# projectスコープで追加（チーム共有）
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp

# userスコープで追加（全プロジェクトで個人利用）
claude mcp add --transport http hubspot --scope user https://mcp.hubspot.com/anthropic
```

### スコープの優先順位

同じ名前のサーバーが複数のスコープに存在する場合、以下の順で優先されます:

```
Local > Project > User
```

Localスコープが最優先なので、プロジェクト共有設定を個人設定で上書きすることができます。

### 「local」と「project」の混同に注意

> **公式ドキュメントより**: MCPサーバーの「local scope」は`~/.claude.json`（ホームディレクトリ）に保存されます。一般的な「local settings」（`.claude/settings.local.json`）とは異なります。

| 名前 | 保存場所 | バージョン管理 |
|------|---------|-------------|
| MCPの**local** scope | `~/.claude.json` | 対象外 |
| MCPの**project** scope | `.mcp.json` | 対象 |
| Claude Codeの**local** settings | `.claude/settings.local.json` | 対象外 |

---

## 4. プロジェクト共有設定（.mcp.json）

### .mcp.jsonの構造

`--scope project`でサーバーを追加すると、プロジェクトルートに`.mcp.json`が作成されます。

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

この`.mcp.json`をバージョン管理に含めることで、チーム全員が同じMCPサーバー設定を共有できます。

> **セキュリティ**: `.mcp.json`のサーバーを使用する前に、Claude Codeは承認を求めます。信頼されていないリポジトリの`.mcp.json`には注意してください。

### 環境変数の展開

`.mcp.json`では環境変数を使ってシークレットを外部化できます。`command`, `args`, `env`, `url`, `headers`のフィールドで利用可能です。

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

**構文**:
- `${VAR}`: 環境変数の値に展開
- `${VAR:-default}`: 変数が未設定の場合はデフォルト値を使用

これにより、APIキーなどの機密情報をリポジトリにコミットせずに済みます。

---

## 5. OAuth認証とリモートサーバー接続

### 標準OAuth（自動設定）

多くのリモートMCPサーバーはOAuth 2.0認証に対応しています。ブラウザベースのログインフローで簡単に接続できます。

```bash
# 1. サーバーを追加
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp

# 2. Claude Code内で/mcpコマンドを実行
/mcp

# 3. 認証が必要なサーバーの横に表示されるリンクをクリック
# 4. ブラウザでログイン → 自動的に認証完了
```

### 事前設定済みOAuth認証情報

動的なクライアント登録をサポートしていないサーバーの場合は、手動で認証情報を設定します。

```bash
# --client-idフラグで設定
claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp

# 環境変数でシークレットを指定（CI環境向け）
MCP_CLIENT_SECRET=your-secret claude mcp add --transport http \
  --client-id your-client-id --client-secret --callback-port 8080 \
  my-server https://mcp.example.com/mcp
```

### Claude.aiのMCPサーバーをClaude Codeで使う

Claude.aiアカウントで設定したMCPサーバーは、自動的にClaude Codeでも利用可能です。

```bash
# Claude.aiのMCPサーバーを無効化する場合
ENABLE_CLAUDEAI_MCP_SERVERS=false claude
```

---

## 6. 高度な設定

### 出力トークン制限

MCPサーバーの応答が大きすぎる場合のために、出力トークン制限があります。

```bash
# デフォルト: 最大25,000トークン（10,000トークンで警告）
# 制限を変更する場合
MAX_MCP_OUTPUT_TOKENS=50000 claude
```

### MCP Tool Search

MCPツールの定義がコンテキストウィンドウの10%を超えると、Tool Searchが自動的に有効になります。多数のサーバーを接続している場合にコンテキスト消費を最適化します。

```bash
# Tool Searchを制御する環境変数
ENABLE_TOOL_SEARCH=auto        # デフォルト（10%で自動有効化）
ENABLE_TOOL_SEARCH=auto:5      # 5%で有効化
ENABLE_TOOL_SEARCH=true        # 常に有効
ENABLE_TOOL_SEARCH=false       # 無効化
```

### MCP Resources

リソースは`@`メンションで直接参照できます。

```
# サーバーのリソースを参照する構文
@server:protocol://resource/path

# 例
Can you analyze @github:issue://123 and suggest a fix?
Compare @postgres:schema://users with @docs:file://database/user-model
```

### MCP Prompts

MCPサーバーが提供するプロンプトは`/`コマンドとして利用できます。

```
/mcp__servername__promptname
```

### Claude CodeをMCPサーバーとして使う

Claude Code自体を他のアプリケーションのMCPサーバーとして機能させることもできます。

```bash
# Claude Codeをstdio MCPサーバーとして起動
claude mcp serve
```

Claude Desktopの`claude_desktop_config.json`への設定例:

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

### Managed MCP設定

組織管理者は`managed-mcp.json`で管理対象のMCPサーバーを制御できます。`allowedMcpServers`と`deniedMcpServers`で許可・拒否するサーバーを指定します。

### Plugin提供MCPサーバー

プラグインが提供するMCPサーバーは`.mcp.json`または`plugin.json`内で定義されます。プラグインをインストールすると自動的に利用可能になります。

---

## ハンズオン演習

### 演習 1: Fetch MCPサーバーを追加する

**目的**: stdioトランスポートでMCPサーバーを追加し、動作を確認する
**前提条件**: Claude CodeとNode.jsがインストール済みであること

**手順**:

1. Fetch MCPサーバーを追加する

```bash
claude mcp add --transport stdio fetch -- npx -y @modelcontextprotocol/server-fetch
```

2. サーバーが追加されたことを確認する

```bash
claude mcp list
```

3. Claude Code内で動作を確認する

```bash
claude
```

```
/mcp
# fetchサーバーが接続されていることを確認

「https://example.com のページ内容を取得して要約してください」
```

**期待される結果**: Claudeがfetchツールを使ってWebページの内容を取得し、要約を返す。

### 演習 2: スコープを切り替える

**目的**: local / project / user スコープの違いを体験する
**前提条件**: gitリポジトリ内で作業していること

**手順**:

1. projectスコープでサーバーを追加する

```bash
claude mcp add --transport stdio --scope project test-project-server \
  -- npx -y @modelcontextprotocol/server-fetch
```

2. `.mcp.json`が作成されたことを確認する

```bash
cat .mcp.json
```

3. userスコープでも追加してみる

```bash
claude mcp add --transport stdio --scope user test-user-server \
  -- npx -y @modelcontextprotocol/server-fetch
```

4. 一覧で違いを確認する

```bash
claude mcp list
```

5. テスト用サーバーをクリーンアップする

```bash
claude mcp remove test-project-server
claude mcp remove test-user-server
```

**期待される結果**: projectスコープでは`.mcp.json`ファイルが作成され、userスコープでは`~/.claude.json`に保存されることを確認できる。

### 演習 3: /mcpコマンドでサーバー状態を確認する

**目的**: `/mcp`コマンドで接続状態・ツール・コスト情報を確認する
**前提条件**: 少なくとも1つのMCPサーバーが追加済みであること

**手順**:

1. Claude Codeを起動する

```bash
claude
```

2. `/mcp`コマンドを実行する

```
/mcp
```

3. 以下の情報を確認する:
   - 接続中のサーバー名と状態（connected / disconnected / error）
   - 各サーバーが提供するツール数
   - OAuth認証が必要なサーバーの認証状態

**期待される結果**: MCPサーバーの接続状態が一覧で表示され、各サーバーのツール数が確認できる。

---

## よくある質問

**Q: `claude mcp add`でエラーが出ます。何を確認すべきですか?**
A: まず構文を確認してください。オプション（`--transport`等）はサーバー名の**前**に、コマンドは`--`の**後**に置きます。stdioサーバーの場合は実行コマンド（`npx`, `node`等）がインストール済みか確認してください。

**Q: projectスコープとlocalスコープの使い分けは?**
A: チーム全員が使うべきサーバー（プロジェクトのDB接続など）は`--scope project`で`.mcp.json`に保存しVCSに含めます。個人のAPIキーが必要なサーバーは`local`（デフォルト）で設定します。

**Q: `.mcp.json`にAPIキーを書いても大丈夫ですか?**
A: APIキーは直接書かず、`${API_KEY}`のように環境変数を使ってください。`.mcp.json`はバージョン管理に含める前提のファイルなので、機密情報を直接記載するのは避けるべきです。

**Q: MCPサーバーの出力が途中で切れます。どうすればいいですか?**
A: デフォルトの出力制限は25,000トークンです。`MAX_MCP_OUTPUT_TOKENS=50000 claude`のように環境変数で上限を引き上げてください。

**Q: Claude.aiで設定したMCPサーバーがClaude Codeで表示されません**
A: 同じClaudeアカウントでログインしていることを確認してください。また、`ENABLE_CLAUDEAI_MCP_SERVERS`が`false`に設定されていないか確認してください。

---

## まとめ

この章で学んだ重要ポイント：

- MCPサーバーの追加は`claude mcp add --transport http/stdio/sse <name> <url>`で行う
- HTTP（リモート推奨）とstdio（ローカル）が主なトランスポート方式。SSEは非推奨
- オプションはサーバー名の前、コマンドは`--`の後に配置する
- スコープは local（デフォルト） > project（.mcp.json） > user（~/.claude.json）の優先順位
- `.mcp.json`をVCSに含めてチームで設定を共有できる。環境変数展開で機密情報を外部化する
- OAuth認証は`/mcp`からブラウザログインフローで接続できる

## 次のステップ

次の章「主要MCPサーバー一覧」では、GitHub・PostgreSQL・Playwright・Sentryなど、よく使われるMCPサーバーをカテゴリ別に紹介し、それぞれの設定方法と活用例を学びます。

---

> **公式リファレンス**
> - [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
> - [MCP公式サイト](https://modelcontextprotocol.io/introduction)
