# Week 7: チーム開発・CI/CD

> **公式ドキュメント**: [Claude Code Docs](https://code.claude.com/docs/en/)
> **想定所要時間**: 約6時間（各レッスン約60分）
> **難易度**: ★★★☆☆〜★★★★☆

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

| # | ファイル | タイトル | 難易度 | 概要 |
|---|---------|---------|--------|------|
| 1 | [01-sub-agents.md](01-sub-agents.md) | サブエージェントの活用 | ★★★☆☆ | 6種類の組み込み・カスタムサブエージェントの設定と利用 |
| 2 | [02-agent-teams.md](02-agent-teams.md) | Agent Teamsによる並列処理 | ★★★★☆ | 複数Claude Codeインスタンスの協調作業（実験的機能） |
| 3 | [03-github-actions.md](03-github-actions.md) | GitHub Actions統合 | ★★★☆☆ | `@claude`メンションによるPRレビュー自動化・Issue対応 |
| 4 | [04-gitlab-cicd.md](04-gitlab-cicd.md) | GitLab CI/CD統合 | ★★★☆☆ | マージリクエスト対応・パイプライン設定（ベータ版） |
| 5 | [05-headless-mode.md](05-headless-mode.md) | Headless/プログラマティック実行 | ★★★☆☆ | `claude -p`によるCLI制御・構造化出力・CI/CD組み込み |
| 6 | [06-cost-management.md](06-cost-management.md) | コスト管理・最適化 | ★★☆☆☆ | トークン追跡・削減テクニック・チーム支出管理 |
| - | [references.md](references.md) | 公式ドキュメントリンク集 | - | Week 7関連の全参考資料 |

## 推奨学習順序

レッスンは番号順に進めることを推奨します。

1. **01-sub-agents.md** → 基盤となるサブエージェントの概念を理解
2. **02-agent-teams.md** → サブエージェントの発展形としてAgent Teamsを学ぶ
3. **03-github-actions.md** → CI/CDとの統合の第一歩
4. **04-gitlab-cicd.md** → GitLabユーザー向け（GitHub Actionsと対比）
5. **05-headless-mode.md** → プログラマティック実行でCI/CDをさらに深める
6. **06-cost-management.md** → 全体を通じたコスト最適化

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
- （推奨）シェルスクリプトの基本
