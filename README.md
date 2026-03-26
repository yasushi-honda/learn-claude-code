# Claude Code 体系学習リソース

> **8週間で習得する Claude Code 完全カリキュラム**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## このリポジトリについて

Claude Codeは、Anthropicが提供するエージェント型コーディングツールです。ターミナル、IDE、デスクトップアプリ、ブラウザからアクセスでき、コードベースの読解、ファイル編集、コマンド実行、開発ツールとの統合を行います。

本リポジトリは、Claude Codeを**体系的に学ぶための日本語カリキュラム**です。公式ドキュメント（全70ページ）を8週間のシラバスとして再構成し、授業やチーム研修で使えるリファレンス中心の学習資料を提供します。

> **公式ドキュメント対応**: 全70ページ（100%カバレッジ）
> **最終検証日**: 2026-03-26 | **検証元**: https://code.claude.com/docs/llms.txt

## 対象者

| レベル | 対象 | 推奨開始週 |
|--------|------|-----------|
| **初心者** | プログラミング経験はあるがAIコーディングツール未経験 | Week 1から |
| **中級者** | Claude Code利用経験あり、より深く使いこなしたい | Week 3から |
| **上級者** | チーム導入・エンタープライズ運用を検討中 | Week 6から |

## カリキュラム概要

| 週 | テーマ | 内容 |
|----|--------|------|
| [Week 1](week-01_introduction/) | **入門・セットアップ** | Claude Codeとは何か、インストール、初回セッション、動作原理 |
| [Week 2](week-02_core-usage/) | **基本操作・CLI** | 対話モード、CLIコマンド体系、基本ワークフロー、ファイル操作、Git統合 |
| [Week 3](week-03_environments/) | **開発環境統合** | ターミナル最適化、VS Code、JetBrains、デスクトップアプリ、Web版 |
| [Week 4](week-04_configuration/) | **プロジェクト設定・メモリ** | 設定ファイル体系、CLAUDE.md、自動メモリ、パーミッション、モデル設定 |
| [Week 5](week-05_customization/) | **カスタマイズ・拡張** | Skills、Hooks、プラグインシステム |
| [Week 6](week-06_mcp-integration/) | **MCP・外部ツール連携** | MCPプロトコル、MCPサーバー設定、Chrome連携、Slack連携 |
| [Week 7](week-07_team-development/) | **チーム開発・CI/CD** | サブエージェント、Agent Teams、GitHub Actions、GitLab CI/CD、コスト管理 |
| [Week 8](week-08_advanced-enterprise/) | **上級・エンタープライズ** | セキュリティ、サンドボックス、クラウドプロバイダー、組織管理設定 |

## 付録

| ドキュメント | 内容 |
|-------------|------|
| [用語集](appendix/glossary.md) | Claude Code関連の用語定義 |
| [チートシート](appendix/cheatsheet.md) | よく使うコマンド一覧 |
| [トラブルシューティング](appendix/troubleshooting.md) | よくある問題と解決方法 |
| [公式ドキュメントマップ](appendix/official-docs-map.md) | 公式ドキュメント全70ページの対応表 |
| [更新ガイド](appendix/update-guide.md) | 本リポジトリの更新方法 |

## クイックスタート

```bash
# Claude Codeのインストール（macOS/Linux/WSL）
curl -fsSL https://claude.ai/install.sh | bash

# プロジェクトディレクトリで起動
cd your-project
claude
```

詳細は [Week 1: インストール](week-01_introduction/02-installation.md) を参照してください。

## 前提知識

本カリキュラムを開始するために必要な前提知識は [PREREQUISITES.md](PREREQUISITES.md) にまとめています。

## カリキュラム詳細

8週間の詳細なカリキュラムは [SYLLABUS.md](SYLLABUS.md) を参照してください。

## 公式リソース

- [Claude Code 公式ドキュメント](https://code.claude.com/docs/en/overview)
- [Claude Code 製品ページ](https://code.claude.com/)
- [Anthropic Discord](https://www.anthropic.com/discord)
- [Claude サブスクリプション](https://claude.com/pricing)
- [Anthropic Console](https://console.anthropic.com/)

## ライセンス

本リポジトリのコンテンツは教育目的で作成されています。Claude Codeの公式ドキュメントの著作権はAnthropicに帰属します。
