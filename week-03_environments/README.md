# Week 3: 開発環境統合

> **対応公式ドキュメント**: https://code.claude.com/docs/en/terminal-config, https://code.claude.com/docs/en/vs-code, https://code.claude.com/docs/en/jetbrains
> **想定所要時間**: 約6時間（各レッスン約60分）
> **難易度**: ★★☆☆☆ 〜 ★★★☆☆

## この週の学習目標

この週を終えると、以下のことができるようになります：

1. ターミナルを Claude Code に最適化し、改行入力・通知・Vim モードを設定できる
2. VS Code / Cursor に拡張機能をインストールし、@メンション・チェックポイント・diff レビューを活用できる
3. JetBrains IDE（IntelliJ IDEA、PyCharm、WebStorm 等）にプラグインを導入し、IDE ネイティブの統合機能を使える
4. デスクトップアプリで並列セッション、アプリプレビュー、PR 監視を活用できる
5. Web 版（claude.ai/code）でブラウザからコーディングタスクを実行し、`/teleport` でローカルに引き継げる
6. Remote Control でローカルセッションをスマートフォンやタブレットから遠隔操作できる

---

## 概要

Claude Code はターミナル上の CLI ツールですが、さまざまな開発環境と統合することで生産性をさらに高めることができます。Week 3 では、日常的に使う開発環境それぞれに Claude Code を最適に組み込む方法を学びます。

どの環境から使っても、CLAUDE.md やメモリ設定など、コア機能は共有されます。自分のワークフローに合った環境を選んで使いこなしましょう。

### 環境の使い分けガイド

| 環境 | 適しているシーン |
|-----|---------------|
| **ターミナル（CLI）** | スクリプト、自動化、パイプライン、全機能アクセス |
| **VS Code 拡張機能** | IDE 内での開発、ビジュアル diff、@メンション |
| **JetBrains プラグイン** | Java / Python / Go 開発、IDE ネイティブ diff |
| **デスクトップアプリ** | 並列セッション、アプリプレビュー、PR 監視 |
| **Web 版** | ローカル環境不要の作業、並列タスク、モバイル |
| **Remote Control** | ローカル作業の遠隔操作、外出先からの継続 |

## レッスン一覧

| レッスン | ファイル | 内容 | 難易度 |
|---------|---------|------|--------|
| 01 | [ターミナル最適化](./01-terminal-setup.md) | テーマ、改行入力、通知設定、Vim モード | ★★☆☆☆ |
| 02 | [VS Code 拡張機能](./02-vscode-extension.md) | インストール、@メンション、diff、チェックポイント | ★★☆☆☆ |
| 03 | [JetBrains プラグイン](./03-jetbrains-plugin.md) | 対応 IDE、diff ビューア、コンテキスト共有 | ★★☆☆☆ |
| 04 | [デスクトップアプリ](./04-desktop-app.md) | 並列セッション、アプリプレビュー、PR 監視 | ★★★☆☆ |
| 05 | [Web 版・モバイル](./05-web-and-mobile.md) | claude.ai/code、--remote、/teleport | ★★☆☆☆ |
| 06 | [リモートコントロール](./06-remote-control.md) | ローカル実行をブラウザ/モバイルから制御 | ★★★☆☆ |
| 参照 | [公式リファレンス](./references.md) | 公式ドキュメントリンク集 | - |

## 前提知識

- Week 1・Week 2 の内容（基本的な Claude Code の操作、CLI コマンド）
- 普段使っている IDE やエディタの基本操作
- Git の基本操作（Web 版と Remote Control のレッスンで使用）

## この週の進め方

1. **ターミナル最適化（01）** を最初に学ぶ（全環境で共通の基礎知識）
2. 自分がよく使う IDE のレッスン（02 または 03）を読み、実際にインストールして試す
3. **デスクトップアプリ（04）** で並列セッションやアプリプレビューを体験する
4. **Web 版（05）** と **Remote Control（06）** を試し、用途に合わせた使い分けを理解する
5. 各レッスンのハンズオン演習を必ず実施する

## まとめ

- Claude Code はターミナル CLI だけでなく、VS Code・JetBrains・デスクトップアプリ・Web・モバイルなど多様な環境で使える
- どの環境でも CLAUDE.md・設定・会話履歴は共有される
- Web 版はクラウドで実行、Remote Control はローカルで実行という根本的な違いを理解することが重要
- 自分のワークフローに合った環境を選び、複数の環境を組み合わせることで生産性が最大化される

---

> **公式リファレンス**
> - [ターミナル設定](https://code.claude.com/docs/en/terminal-config)
> - [VS Code](https://code.claude.com/docs/en/vs-code)
> - [JetBrains](https://code.claude.com/docs/en/jetbrains)
> - [Desktop](https://code.claude.com/docs/en/desktop)
> - [Web](https://code.claude.com/docs/en/claude-code-on-the-web)
> - [Remote Control](https://code.claude.com/docs/en/remote-control)
