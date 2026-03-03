# Lesson 4: カスタムMCPサーバー開発

> 対応する公式ドキュメント: [MCP SDK](https://modelcontextprotocol.io/quickstart/server) | [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)

## 学習目標

- カスタムMCPサーバーを開発する手順を説明できる
- TypeScriptとPythonのMCP SDKの基本的な使い方を理解できる
- ツールとリソースを定義してMCPサーバーを実装できる
- ローカルでMCPサーバーをテストできる
- プラグインにMCPサーバーをバンドルしてデプロイできる

## 概要

既存のMCPサーバーでは対応できない社内ツールや独自APIと連携したい場合は、カスタムMCPサーバーを開発します。AnthropicはTypeScriptとPythonのSDKを提供しており、比較的少ないコードで独自のMCPサーバーを作れます。

このレッスンでは、シンプルなカスタムMCPサーバーの実装から、プラグインへのバンドル・デプロイまでの全体的な流れを学びます。

## 本文

### MCPサーバーの構成要素

カスタムMCPサーバーは以下の要素で構成されます：

| 要素 | 説明 | 例 |
|-----|------|-----|
| **ツール（Tools）** | Claudeが実行できるアクション | `create_ticket`, `get_user_info` |
| **リソース（Resources）** | Claudeが参照できるデータ | スキーマ定義、設定ファイル |
| **プロンプト（Prompts）** | 再利用可能なテンプレート | よく使うクエリのテンプレート |

### TypeScript SDKを使う

#### セットアップ

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

#### シンプルなツールサーバーの実装

`src/index.ts`:

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
    // ここではサンプルデータを返す
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

#### ビルドと登録

```bash
# TypeScriptをビルド
npx tsc

# MCPサーバーとして登録
claude mcp add --transport stdio weather-server -- node dist/index.js
```

### Python SDKを使う

#### セットアップ

```bash
pip install mcp
```

または`pyproject.toml`に追加：

```toml
[project]
dependencies = ["mcp>=1.0.0"]
```

#### シンプルなツールサーバーの実装

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
        # ここではサンプルデータを返す
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

#### 登録

```bash
# Pythonサーバーとして登録
claude mcp add --transport stdio user-info-server -- python server.py
```

### リソースの実装（TypeScript）

Claudeが`@`メンションで参照できるリソースを定義します：

```typescript
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// サーバーの capabilities にリソースを追加
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

使用例：

```
「@my-server:schema://usersの構造を確認して、ユーザー検索クエリを作成してください」
```

### プロンプトの実装（TypeScript）

`/`コマンドとして使えるプロンプトテンプレートを定義します：

```typescript
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// capabilities にプロンプトを追加
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

使用例：

```
/mcp__my-server__analyze_errors 48
```

### ローカルでのテスト

#### 方法1: Claude Codeで直接テスト

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

#### 方法2: MCPインスペクターを使う

```bash
# MCPインスペクターをインストール
npm install -g @modelcontextprotocol/inspector

# サーバーを検査
npx @modelcontextprotocol/inspector node dist/index.js
```

ブラウザで`http://localhost:5173`を開いてGUIで操作できます。

#### 方法3: ユニットテスト

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

### プラグインへのバンドル

カスタムMCPサーバーをプラグインに含めて配布できます。

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

プラグイン構造：

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

**重要:** `${CLAUDE_PLUGIN_ROOT}`変数でプラグインのルートディレクトリを参照します。インストール場所に関係なく正しいパスが解決されます。

### リモートHTTPサーバーとしてデプロイする

HTTPサーバーとして実装することで、クラウドにデプロイできます：

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

// MCPサーバーのセットアップ（tools, resourcesなどは同様）
const server = new Server(
  { name: "my-http-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

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

デプロイ後に登録：

```bash
claude mcp add --transport http my-server https://your-server.example.com/mcp
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

## まとめ

- MCP SDKはTypeScriptとPythonで提供されており、どちらも同じ概念を実装する
- ツール・リソース・プロンプトの3つの要素でMCPサーバーを構成する
- `ListTools`・`CallTool`ハンドラーを実装するのが基本パターン
- `StdioServerTransport`でstdio、`StreamableHTTPServerTransport`でHTTPとして起動できる
- `@modelcontextprotocol/inspector`でGUIによる動作確認ができる
- `${CLAUDE_PLUGIN_ROOT}`変数を使ってプラグインにバンドルできる

## 公式リファレンス

- [MCP Server Quickstart（TypeScript）](https://modelcontextprotocol.io/quickstart/server)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
