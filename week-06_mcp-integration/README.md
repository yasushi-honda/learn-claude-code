# Week 6: MCP・外部ツール連携

> **対応公式ドキュメント**: [MCP](https://code.claude.com/docs/en/mcp) | [Chrome](https://code.claude.com/docs/en/chrome) | [Slack](https://code.claude.com/docs/en/slack)
> **想定所要時間**: 約6時間（各レッスン約60分）
> **難易度**: ★★☆☆☆ 〜 ★★★★☆

## 週の概要

Week 6では、MCP（Model Context Protocol）を使ってClaude Codeを外部ツールやサービスと連携させる方法を学びます。データベース・GitHub・Slack・ブラウザなど、さまざまな外部ツールをClaudeに接続することで、「JIRAのイシューを実装してGitHubにPRを作成する」「Sentryのエラーを調査してコードを修正する」といった複雑なワークフローを自然言語で自動化できるようになります。

## 学習目標

この週を終えると、以下のことができるようになります：

1. **MCP（Model Context Protocol）** の基本概念と仕組みを説明できる
2. `claude mcp` コマンドでMCPサーバーを追加・管理できる
3. 主要なMCPサーバー（GitHub・PostgreSQL・Playwright等）を設定して使える
4. カスタムMCPサーバーを開発する基礎知識を身につける
5. **Chrome連携** を使ってブラウザ自動化・デバッグができる
6. **Slack連携** を使ってSlackからコーディングタスクをClaudeに委譲できる

## 前提知識

- Week 1〜5の内容を理解していること
- CLIの基本操作ができること
- JSONの基本的な文法を知っていること
- （Lesson 4: カスタムMCPサーバー開発の場合）TypeScriptまたはPythonの基礎知識

## レッスン一覧

| レッスン | ファイル | 内容 | 難易度 | 所要時間 |
|---------|---------|------|--------|---------|
| Lesson 1 | [01-mcp-overview.md](./01-mcp-overview.md) | MCPプロトコル概要 | ★★☆☆☆ | 約60分 |
| Lesson 2 | [02-mcp-setup.md](./02-mcp-setup.md) | MCPサーバー設定方法 | ★★★☆☆ | 約60分 |
| Lesson 3 | [03-popular-servers.md](./03-popular-servers.md) | 主要MCPサーバー一覧 | ★★☆☆☆ | 約60分 |
| Lesson 4 | [04-custom-mcp-server.md](./04-custom-mcp-server.md) | カスタムMCPサーバー開発 | ★★★★☆ | 約60分 |
| Lesson 5 | [05-chrome-integration.md](./05-chrome-integration.md) | Chrome連携 | ★★☆☆☆ | 約60分 |
| Lesson 6 | [06-slack-integration.md](./06-slack-integration.md) | Slack連携 | ★★☆☆☆ | 約60分 |
| 参考資料 | [references.md](./references.md) | 公式ドキュメントリンク集 | - | - |

## MCPと他の拡張機能の比較

| 拡張機能 | 目的 | 通信方式 |
|---------|------|---------|
| **MCP** | 外部ツール・APIとのデータ交換 | stdioまたはHTTP/SSE |
| **Skills** | カスタムコマンドと指示の再利用 | プロンプト注入 |
| **Hooks** | ライフサイクルイベントの自動処理 | シェルコマンド |
| **Plugins** | 上記のパッケージ化・配布 | 各コンポーネントに準じる |

## MCPでできること

MCPサーバーを接続すると、以下のようなことが可能になります：

```
「JIRAイシューENG-4521の機能を実装してGitHubにPRを作成してください」
→ JIRA, GitHub MCPが連携して自動実行

「Sentryで直近24時間の主要エラーを確認して修正してください」
→ Sentry MCPがエラー情報を取得してコードを修正

「PostgreSQLデータベースから今月の売上トップ10を取得してください」
→ PostgreSQL MCPがDBに直接クエリを実行

「Slackで報告されたバグを調査してPRを作成して」
→ Slack連携でコンテキスト取得 → Claude Codeで修正 → PR作成
```

## 学習の進め方

1. **Lesson 1-2**（概要 + 設定方法）を最初に学び、MCPの全体像を把握する
2. **Lesson 3**（主要サーバー）で日常的に使うサービスから接続を始める
3. **Lesson 4**（カスタム開発）は必要に応じて取り組む（TypeScript/Python知識が前提）
4. **Lesson 5-6**（Chrome + Slack）は独立した連携機能なので、興味のあるものから学べる

## 公式リファレンス

- [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp)
- [Use Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome)
- [Claude Code in Slack](https://code.claude.com/docs/en/slack)
- [MCP公式サイト](https://modelcontextprotocol.io/introduction)
