# カスタムMCPサーバー開発

> **対応公式ドキュメント**: https://modelcontextprotocol.io/quickstart/server | https://code.claude.com/docs/en/mcp
> **想定所要時間**: 約60分
> **難易度**: ★★★★☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. TypeScriptまたはPythonのMCP SDKでカスタムMCPサーバーを実装できる
2. ツール・リソース・プロンプトの3要素を定義してサーバーを構成できる
3. ローカルでMCPサーバーをテスト・デバッグできる
4. プラグインにMCPサーバーをバンドルして配布できる

---

## 1. カスタムMCPサーバーが必要な場面

既存のMCPサーバー（GitHub, Sentry等）でカバーできない場合にカスタム開発が必要になります。

| シーン | 具体例 |
|--------|--------|
| 社内ツール連携 | 社内チケットシステム、独自CMS |
| 独自API連携 | 社内のREST API、マイクロサービス |
| データ加工パイプライン | 独自フォーマットのログ分析 |
| 複合操作 | 複数のAPIをまとめたワークフロー |

### MCPサーバーの構成要素

カスタムMCPサーバーは3つの要素で構成されます。

| 要素 | 説明 | 例 |
|-----|------|-----|
| **ツール（Tools）** | Claudeが実行できるアクション | `create_ticket`, `get_user_info` |
| **リソース（Resources）** | Claudeが参照できるデータ | スキーマ定義、設定ファイル |
| **プロンプト（Prompts）** | 再利用可能なテンプレート | よく使うクエリのテンプレート |

最小構成はツールのみでも動作します。リソースとプロンプトは必要に応じて追加します。

---

## 2. TypeScript SDKでの実装

### セットアップ

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node tsx
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

### ツールサーバーの実装

以下は天気情報を取得するシンプルなMCPサーバーの例です。`src/index.ts`:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// サーバーインスタンスを作成
const server = new Server(
  {
    name: "my-custom-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ツール一覧を返すハンドラー
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_weather",
        description: "指定した都市の現在の気象データを取得します",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "気象データを取得する都市名",
            },
            unit: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "温度の単位",
              default: "celsius",
            },
          },
          required: ["city"],
        },
      },
    ],
  };
});

// ツールを実行するハンドラー
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_weather") {
    const { city, unit = "celsius" } = request.params.arguments as {
      city: string;
      unit?: string;
    };

    // 実際の実装ではAPIを呼び出す
    const temperature = unit === "celsius" ? 22 : 71.6;
    const weather = {
      city,
      temperature,
      unit,
      condition: "晴れ",
      humidity: 65,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weather, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// サーバーを起動
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch(console.error);
```

**実装のポイント**:

1. `ListToolsRequestSchema`ハンドラーでツールの名前・説明・入力スキーマを定義する
2. `CallToolRequestSchema`ハンドラーでツール名に応じた処理を実行する
3. 戻り値は`content`配列で、`type: "text"`のオブジェクトを返す
4. `console.error`はデバッグログに使用する（stdioはClaude Codeとの通信に使うため、`console.log`は使わない）

### ビルドと登録

```bash
# TypeScriptをビルド
npx tsc

# MCPサーバーとして登録
claude mcp add --transport stdio weather-server -- node dist/index.js
```

---

## 3. Python SDKでの実装

### セットアップ

```bash
pip install mcp
```

または`pyproject.toml`に追加:

```toml
[project]
dependencies = ["mcp>=1.0.0"]
```

### ツールサーバーの実装

`server.py`:

```python
import asyncio
import json
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

# サーバーインスタンスを作成
app = Server("my-custom-server")

@app.list_tools()
async def list_tools() -> list[types.Tool]:
    """利用可能なツールの一覧を返す"""
    return [
        types.Tool(
            name="get_user_info",
            description="社内システムからユーザー情報を取得します",
            inputSchema={
                "type": "object",
                "properties": {
                    "user_id": {
                        "type": "string",
                        "description": "ユーザーID"
                    }
                },
                "required": ["user_id"]
            }
        )
    ]

@app.call_tool()
async def call_tool(
    name: str,
    arguments: dict
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    """ツールを実行する"""
    if name == "get_user_info":
        user_id = arguments.get("user_id")

        # 実際の実装では社内APIを呼び出す
        user = {
            "id": user_id,
            "name": "田中 太郎",
            "email": f"{user_id}@example.com",
            "department": "エンジニアリング",
            "role": "シニアエンジニア"
        }

        return [types.TextContent(
            type="text",
            text=json.dumps(user, ensure_ascii=False, indent=2)
        )]

    raise ValueError(f"Unknown tool: {name}")

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### 登録

```bash
claude mcp add --transport stdio user-info-server -- python server.py
```

### TypeScript vs Python: どちらを選ぶか

| 観点 | TypeScript | Python |
|-----|-----------|--------|
| エコシステム | Node.jsパッケージが豊富 | データサイエンス系ライブラリが豊富 |
| 型安全性 | コンパイル時の型チェック | 実行時の動的型付け |
| ビルド | `tsc`でビルドが必要 | ビルド不要（直接実行） |
| npxとの相性 | npxでの配布が容易 | pipでの配布が一般的 |

結論: 既存のプロジェクトの言語に合わせるのが最も効率的です。

---

## 4. リソースとプロンプトの実装

### リソースの実装（TypeScript）

Claudeが`@`メンションで参照できるリソースを定義します。

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// サーバーのcapabilitiesにリソースを追加
const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

// リソース一覧を返す
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "schema://users",
        name: "Usersテーブルスキーマ",
        description: "usersテーブルの定義",
        mimeType: "application/json",
      },
      {
        uri: "schema://orders",
        name: "Ordersテーブルスキーマ",
        description: "ordersテーブルの定義",
        mimeType: "application/json",
      },
    ],
  };
});

// リソースの内容を返す
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === "schema://users") {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            tableName: "users",
            columns: [
              { name: "id", type: "UUID", primaryKey: true },
              { name: "email", type: "VARCHAR(255)", unique: true },
              { name: "created_at", type: "TIMESTAMP" },
            ],
          }),
        },
      ],
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});
```

**使用例**:

```
「@my-server:schema://usersの構造を確認して、ユーザー検索クエリを作成してください」
```

### プロンプトの実装（TypeScript）

`/`コマンドとして使えるプロンプトテンプレートを定義します。

```typescript
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// capabilitiesにプロンプトを追加
const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {}, prompts: {} } }
);

// プロンプト一覧を返す
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "analyze_errors",
        description: "直近のエラーを分析して修正提案を行う",
        arguments: [
          {
            name: "hours",
            description: "遡る時間数",
            required: false,
          },
        ],
      },
    ],
  };
});

// プロンプトの内容を返す
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "analyze_errors") {
    const hours = request.params.arguments?.hours ?? "24";
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `直近${hours}時間のエラーログを分析して、最も頻繁に発生しているエラーとその修正案を提案してください。`,
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${request.params.name}`);
});
```

**使用例**:

```
/mcp__my-server__analyze_errors 48
```

---

## 5. テストとデバッグ

### 方法1: Claude Codeで直接テスト

最も簡単な方法です。サーバーを登録してClaude Code内で動作を確認します。

```bash
# サーバーを登録
claude mcp add --transport stdio test-server -- node dist/index.js

# Claude Codeでテスト
claude
```

```
「利用可能なツールを一覧表示してください」
「get_weather ツールで東京の気象データを取得してください」
```

### 方法2: MCPインスペクター

GUIでMCPサーバーのツール・リソース・プロンプトを検査できます。

```bash
# MCPインスペクターを実行
npx @modelcontextprotocol/inspector node dist/index.js
```

ブラウザで`http://localhost:5173`を開くと、以下の操作がGUIで行えます:
- ツール一覧の確認
- ツールの手動実行とレスポンスの確認
- リソースの参照
- プロンプトの取得

### 方法3: ユニットテスト

```typescript
import { describe, it, expect } from "vitest";
import { createServer } from "./server.js";

describe("Weather Server", () => {
  it("get_weather ツールが正しいデータを返す", async () => {
    const server = createServer();

    const result = await server.callTool("get_weather", { city: "Tokyo" });

    expect(result.content[0].type).toBe("text");
    const data = JSON.parse(result.content[0].text);
    expect(data.city).toBe("Tokyo");
    expect(data.temperature).toBeDefined();
  });
});
```

### エラーハンドリングのベストプラクティス

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const result = await performAction(request.params.arguments);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  } catch (error) {
    // エラーを返す（throw するとMCPプロトコルエラーになる）
    return {
      content: [
        {
          type: "text",
          text: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});
```

`isError: true`を設定するとClaudeにエラーが発生したことを明示できます。`throw`するとMCPプロトコルレベルのエラーになり、Claudeが適切にリカバリできなくなる場合があります。

---

## 6. デプロイと配布

### リモートHTTPサーバーとしてデプロイ

HTTPサーバーとして実装することで、クラウドにデプロイできます。

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

const server = new Server(
  { name: "my-http-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ツールの定義（ListTools, CallToolハンドラー）は同様

// HTTPエンドポイントにMCPを設定
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000, () => {
  console.log("MCP Server running on http://localhost:3000");
});
```

デプロイ後に登録:

```bash
claude mcp add --transport http my-server https://your-server.example.com/mcp
```

### プラグインへのバンドル

カスタムMCPサーバーをプラグインに含めて配布できます。

プラグイン構造:

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json              # MCPサーバー設定
├── src/
│   └── index.ts           # MCPサーバーのソース
├── dist/
│   └── index.js           # ビルド済みファイル
└── package.json
```

プラグインの`.mcp.json`:

```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/dist/index.js",
      "args": [],
      "env": {
        "API_URL": "${MY_API_URL:-https://api.example.com}",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

> **公式ドキュメントより**: `${CLAUDE_PLUGIN_ROOT}`変数でプラグインのルートディレクトリを参照します。インストール場所に関係なく正しいパスが解決されます。

---

## ハンズオン演習

### 演習 1: 最小構成のMCPサーバーを作る

**目的**: TypeScriptでシンプルなMCPサーバーを作成し、Claude Codeに登録する
**前提条件**: Node.js（v18以上）がインストール済みであること

**手順**:

1. プロジェクトを作成する

```bash
mkdir hello-mcp && cd hello-mcp
npm init -y
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node
```

2. `tsconfig.json`を作成する（本文のセットアップセクションを参照）

3. `src/index.ts`を作成して、`hello`ツール（名前を受け取って挨拶を返す）を実装する

4. ビルドして登録する

```bash
npx tsc
claude mcp add --transport stdio hello-mcp -- node dist/index.js
```

5. Claude Codeで動作確認する

```
「helloツールを使って田中さんに挨拶してください」
```

**期待される結果**: Claudeがhelloツールを呼び出し、「こんにちは、田中さん！」のような挨拶を返す。

### 演習 2: MCPインスペクターでデバッグする

**目的**: MCPインスペクターを使ってサーバーの動作を検査する
**前提条件**: 演習1で作成したサーバーがあること

**手順**:

1. MCPインスペクターを起動する

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

2. ブラウザで`http://localhost:5173`を開く

3. 「Tools」タブでツール一覧を確認する

4. ツールを手動実行してレスポンスを確認する

**期待される結果**: GUIでツールの定義と実行結果を確認できる。

### 演習 3: エラーハンドリングを追加する

**目的**: 不正な入力に対して適切なエラーを返すようにする
**前提条件**: 演習1で作成したサーバーがあること

**手順**:

1. `src/index.ts`のCallToolハンドラーにtry-catchを追加する

2. 空の名前が渡された場合に`isError: true`でエラーメッセージを返すようにする

3. ビルドしてClaude Codeで動作確認する

```
「helloツールを名前なしで呼び出してください」
```

**期待される結果**: Claudeがエラーを受け取り、「名前を指定してください」のようなメッセージをユーザーに伝える。

---

## よくある質問

**Q: stdioサーバーで`console.log`を使うとエラーになります。なぜですか?**
A: stdioトランスポートは標準出力をClaude Codeとの通信に使用します。デバッグログは`console.error`（標準エラー出力）を使ってください。`console.log`を使うとプロトコルデータが壊れます。

**Q: TypeScriptとPythonのどちらでMCPサーバーを開発すべきですか?**
A: 既存プロジェクトの言語に合わせるのが最も効率的です。どちらのSDKも同じ機能をサポートしています。npmパッケージとして配布する場合はTypeScript、社内のPythonスクリプトと連携する場合はPythonが適しています。

**Q: MCPサーバーのテストはどう書くべきですか?**
A: ツールの実行ロジック（ビジネスロジック）をMCPハンドラーから分離し、ビジネスロジック部分をユニットテストします。MCPプロトコルレベルのテストにはMCPインスペクターが便利です。

**Q: 本番環境にMCPサーバーをデプロイする場合の注意点は?**
A: 認証（OAuth 2.0 / APIキー）、レート制限、エラーハンドリング、ログ収集を実装してください。`StreamableHTTPServerTransport`を使ってHTTPサーバーとしてデプロイし、クラウド環境で運用できます。

---

## まとめ

この章で学んだ重要ポイント：

- MCP SDKはTypeScriptとPythonで提供されており、同じ概念を実装する
- ツール・リソース・プロンプトの3要素でMCPサーバーを構成する
- `ListTools`・`CallTool`ハンドラーを実装するのが基本パターン
- エラーは`isError: true`で返し、`throw`ではなく適切なエラーメッセージを返す
- MCPインスペクター（`npx @modelcontextprotocol/inspector`）でGUIデバッグができる
- `${CLAUDE_PLUGIN_ROOT}`変数を使ってプラグインにバンドルして配布できる

## 次のステップ

次の章「Chrome連携」では、Claude Codeが実際のブラウザを操作するChrome連携機能について学びます。MCPサーバーではなく、Chrome拡張機能を通じてブラウザ操作を自動化する別のアプローチです。

---

> **公式リファレンス**
> - [MCP Server Quickstart（TypeScript）](https://modelcontextprotocol.io/quickstart/server)
> - [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
> - [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
> - [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
> - [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
