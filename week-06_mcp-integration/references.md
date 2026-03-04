# Week 6 公式リファレンス

## MCP（Model Context Protocol）

### 公式ドキュメント

| ドキュメント | URL |
|------------|-----|
| MCPでツールに接続（Claude Code公式） | https://code.claude.com/docs/en/mcp |
| MCP公式サイト | https://modelcontextprotocol.io/introduction |
| MCP SDKドキュメント（QuickStart） | https://modelcontextprotocol.io/quickstart/server |
| MCP TypeScript SDK（GitHub） | https://github.com/modelcontextprotocol/typescript-sdk |
| MCP Python SDK（GitHub） | https://github.com/modelcontextprotocol/python-sdk |
| MCPサーバー一覧（GitHub） | https://github.com/modelcontextprotocol/servers |
| MCP Inspector（GitHub） | https://github.com/modelcontextprotocol/inspector |

### MCP レジストリ・マーケットプレイス

| リソース | URL |
|---------|-----|
| Anthropic MCPレジストリAPI | https://api.anthropic.com/mcp-registry/docs |

---

## Chrome連携

| ドキュメント | URL |
|------------|-----|
| Chrome連携（ベータ）公式ドキュメント | https://code.claude.com/docs/en/chrome |
| Claude in Chrome 拡張機能（Chrome Web Store） | https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn |
| Getting started with Claude in Chrome（ヘルプセンター） | https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome |
| VS Codeでのブラウザ自動化 | https://code.claude.com/docs/en/vs-code#automate-browser-tasks-with-chrome |

---

## Slack連携

| ドキュメント | URL |
|------------|-----|
| Claude Code in Slack公式ドキュメント | https://code.claude.com/docs/en/slack |
| Claude Code on the web | https://code.claude.com/docs/en/claude-code-on-the-web |
| Claude for Slack（一般情報） | https://claude.com/claude-and-slack |
| Slack App Marketplace（Claudeアプリ） | https://slack.com/marketplace/A08SF47R6P4 |

---

## 各レッスン対応ドキュメント一覧

| レッスン | タイトル | 公式ドキュメント |
|---------|---------|----------------|
| Lesson 1 | MCPプロトコル概要 | https://code.claude.com/docs/en/mcp |
| Lesson 2 | MCPサーバー設定方法 | https://code.claude.com/docs/en/mcp |
| Lesson 3 | 主要MCPサーバー一覧 | https://code.claude.com/docs/en/mcp |
| Lesson 4 | カスタムMCPサーバー開発 | https://modelcontextprotocol.io/quickstart/server |
| Lesson 5 | Chrome連携 | https://code.claude.com/docs/en/chrome |
| Lesson 6 | Slack連携 | https://code.claude.com/docs/en/slack |

---

## 関連ツール・リソース

### MCPサーバーカテゴリ別公式リソース

| カテゴリ | サービス | 参考 |
|---------|---------|------|
| ソース管理 | GitHub | https://code.claude.com/docs/en/mcp |
| データベース | dbhub（PostgreSQL） | https://github.com/bytebase/dbhub |
| ブラウザ自動化 | Playwright MCP | https://github.com/microsoft/playwright-mcp |
| 監視・エラー追跡 | Sentry | https://mcp.sentry.dev/mcp |

### MCP関連ツール

| ツール | 用途 | インストール |
|--------|------|-----------|
| MCP Inspector | GUIでMCPサーバーをテスト | `npx @modelcontextprotocol/inspector` |
| MCP TypeScript SDK | TypeScriptでMCPサーバー開発 | `npm install @modelcontextprotocol/sdk` |
| MCP Python SDK | PythonでMCPサーバー開発 | `pip install mcp` |

---

## Week 6 関連のClaude Codeコマンド

```bash
# MCPサーバーの追加
claude mcp add --transport http <name> <url>          # HTTPサーバー（推奨）
claude mcp add --transport stdio <name> -- <cmd>      # stdioサーバー
claude mcp add --transport sse <name> <url>           # SSEサーバー（非推奨）

# MCPサーバーの管理
claude mcp list                                       # 一覧表示
claude mcp get <name>                                 # 詳細確認
claude mcp remove <name>                              # 削除
claude mcp add-json <name> '<json>'                   # JSON設定で追加
claude mcp add-from-claude-desktop                    # Claude Desktopからインポート
claude mcp reset-project-choices                      # .mcp.json承認をリセット

# スコープの指定
claude mcp add --scope project ...                    # プロジェクト共有（.mcp.json）
claude mcp add --scope user ...                       # 全プロジェクトで個人利用

# Chrome連携
claude --chrome                                       # Chrome連携で起動
# Claude Code内で: /chrome

# MCPサーバー状態確認
# Claude Code内で: /mcp

# Claude CodeをMCPサーバーとして起動
claude mcp serve

# 環境変数
MAX_MCP_OUTPUT_TOKENS=50000 claude                    # 出力トークン上限変更
ENABLE_TOOL_SEARCH=auto claude                        # Tool Search制御
ENABLE_CLAUDEAI_MCP_SERVERS=false claude              # Claude.aiサーバー無効化
```

---

## セキュリティ関連リソース

- [MCPセキュリティガイドライン](https://modelcontextprotocol.io/introduction)
- [Claude Code セキュリティドキュメント](https://code.claude.com/docs/en/security)

---

## Week 5（カスタマイズ・拡張）との関係

MCP・外部ツール連携はWeek 5のプラグインシステムと密接に関連しています：

- プラグインにMCPサーバーをバンドルして配布できる（`.mcp.json`を`.claude-plugin/`に含める）
- Hooksを使ってMCPツールの実行前後に処理を追加できる（`PreToolUse` / `PostToolUse`）
- Skillsから特定のMCPツールを呼び出すワークフローを定義できる

Week 5リファレンス: `../week-05_customization/references.md`
