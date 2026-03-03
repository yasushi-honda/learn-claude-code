# Week 7: チーム開発・CI/CD

> 公式ドキュメント: [Claude Code Docs](https://code.claude.com/docs/en/)

## 週のテーマ

複数のClaude Codeインスタンスを活用したチーム開発と、CI/CDパイプラインへの統合を学びます。サブエージェント、Agent Teams、GitHub Actions/GitLab CI/CDとの連携、Headless実行、コスト管理など、実務レベルのワークフローを習得します。

## 学習目標

1. サブエージェントの仕組みと組み込み・カスタムサブエージェントの定義方法を理解する
2. Agent Teamsを使った複数インスタンスの並列協調作業を実践できる
3. GitHub ActionsにClaude Codeを統合し、PRレビューや自動化ワークフローを構築できる
4. GitLab CI/CDパイプラインにClaude Codeを組み込める
5. Headless（プログラマティック）実行でCI/CDや自動化スクリプトに組み込める
6. トークンコストを把握し、効率的なコスト管理ができる

## レッスン一覧

| ファイル | タイトル | 概要 |
|---------|---------|------|
| [01-sub-agents.md](01-sub-agents.md) | サブエージェントの活用 | 組み込み・カスタムサブエージェントの設定と利用 |
| [02-agent-teams.md](02-agent-teams.md) | Agent Teamsによる並列処理 | 複数Claude Codeインスタンスの協調作業 |
| [03-github-actions.md](03-github-actions.md) | GitHub Actions統合 | PRレビュー自動化・Issue対応・CI/CD統合 |
| [04-gitlab-cicd.md](04-gitlab-cicd.md) | GitLab CI/CD統合 | マージリクエスト対応・パイプライン設定 |
| [05-headless-mode.md](05-headless-mode.md) | Headless/プログラマティック実行 | CLIとSDKによるプログラム制御 |
| [06-cost-management.md](06-cost-management.md) | コスト管理・最適化 | トークン追跡・削減テクニック・Analytics |
| [references.md](references.md) | 公式ドキュメントリンク集 | Week 7関連の全参考資料 |

## この週で身につくスキル

- サブエージェントを活用したコンテキスト分離と専門化
- 複数エージェントの並列実行と協調タスク管理
- CI/CDパイプラインへの自動コードレビュー組み込み
- スクリプトからClaude Codeをプログラム的に操作
- チーム全体のAPIコスト管理と最適化

## 前提知識

- Week 1〜6の内容（基本操作・設定・カスタマイズ・MCP）
- Git/GitHubの基本操作
- YAML/JSON形式の読み書き
- （推奨）CI/CDパイプラインの基礎知識
