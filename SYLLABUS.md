# Claude Code 8週間シラバス

> 本シラバスは、Claude Code公式ドキュメント（全59ページ）を体系的に学習するための8週間カリキュラムです。

## カリキュラム設計方針

- **公式ドキュメント準拠**: すべての内容は公式ドキュメントをベースに構成
- **段階的学習**: 基礎から応用へ、週を追うごとに難易度が上がる構成
- **実践重視**: 各週に具体的なワークフロー例を含む
- **リファレンス形式**: 授業・研修で参照しやすい構造

---

## Week 1: 入門・セットアップ

**テーマ**: Claude Codeとは何か、最初の一歩

**学習目標**:
- Claude Codeの概要と位置付けを理解する
- 各OS（macOS/Linux/Windows）でのインストールを完了する
- 初回セッションを実行し、基本的な対話ができる
- エージェントループの動作原理を理解する
- 認証・アカウント設定を完了する

**対応する公式ドキュメント**:
- [Overview](https://code.claude.com/docs/en/overview)
- [Quickstart](https://code.claude.com/docs/en/quickstart)
- [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [Advanced setup](https://code.claude.com/docs/en/setup)
- [Authentication](https://code.claude.com/docs/en/authentication)

**ディレクトリ**: [`week-01_introduction/`](week-01_introduction/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-what-is-claude-code.md](week-01_introduction/01-what-is-claude-code.md) | Claude Codeとは何か |
| 2 | [02-installation.md](week-01_introduction/02-installation.md) | インストール方法（全OS対応） |
| 3 | [03-first-session.md](week-01_introduction/03-first-session.md) | 初回セッション（Quickstart） |
| 4 | [04-how-it-works.md](week-01_introduction/04-how-it-works.md) | エージェントループの仕組み |
| 5 | [05-authentication.md](week-01_introduction/05-authentication.md) | 認証・アカウント設定 |

---

## Week 2: 基本操作・CLI

**テーマ**: 日常的に使う操作をマスターする

**学習目標**:
- 対話モードのショートカットと入力モードを使いこなす
- CLIコマンドとフラグを体系的に理解する
- 12の基本ワークフローを実践できる
- ファイル操作ツール（Read/Edit/Write/Glob/Grep）を理解する
- Git統合（commit/PR/branch）を活用できる

**対応する公式ドキュメント**:
- [Interactive mode](https://code.claude.com/docs/en/interactive-mode)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Common workflows](https://code.claude.com/docs/en/common-workflows)

**ディレクトリ**: [`week-02_core-usage/`](week-02_core-usage/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-interactive-mode.md](week-02_core-usage/01-interactive-mode.md) | 対話モードの使い方 |
| 2 | [02-cli-reference.md](week-02_core-usage/02-cli-reference.md) | CLIコマンド体系 |
| 3 | [03-common-workflows.md](week-02_core-usage/03-common-workflows.md) | 基本ワークフロー |
| 4 | [04-file-operations.md](week-02_core-usage/04-file-operations.md) | ファイル操作 |
| 5 | [05-git-integration.md](week-02_core-usage/05-git-integration.md) | Git統合 |

---

## Week 3: 開発環境統合

**テーマ**: あらゆる環境でClaude Codeを活用する

**学習目標**:
- ターミナル環境を最適化できる
- VS Code拡張機能を設定・活用できる
- JetBrains IDEプラグインを利用できる
- デスクトップアプリの機能を理解する
- Web版・モバイル対応を把握する
- リモートコントロール機能を活用できる

**対応する公式ドキュメント**:
- [Terminal config](https://code.claude.com/docs/en/terminal-config)
- [VS Code](https://code.claude.com/docs/en/vs-code)
- [JetBrains](https://code.claude.com/docs/en/jetbrains)
- [Desktop](https://code.claude.com/docs/en/desktop)
- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [Remote Control](https://code.claude.com/docs/en/remote-control)

**ディレクトリ**: [`week-03_environments/`](week-03_environments/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-terminal-setup.md](week-03_environments/01-terminal-setup.md) | ターミナル最適化 |
| 2 | [02-vscode-extension.md](week-03_environments/02-vscode-extension.md) | VS Code拡張機能 |
| 3 | [03-jetbrains-plugin.md](week-03_environments/03-jetbrains-plugin.md) | JetBrains IDE統合 |
| 4 | [04-desktop-app.md](week-03_environments/04-desktop-app.md) | デスクトップアプリ |
| 5 | [05-web-and-mobile.md](week-03_environments/05-web-and-mobile.md) | Web版・モバイル対応 |
| 6 | [06-remote-control.md](week-03_environments/06-remote-control.md) | リモートコントロール |

---

## Week 4: プロジェクト設定・メモリ

**テーマ**: Claude Codeを自分のプロジェクトに最適化する

**学習目標**:
- 設定ファイルの3階層（グローバル/プロジェクト/ローカル）を理解する
- CLAUDE.mdの設計パターンを習得する
- 自動メモリ機能の仕組みと活用法を理解する
- パーミッションシステムを適切に設定できる
- モデル設定（opusplan等）を使い分けられる
- キーバインドと出力スタイルをカスタマイズできる

**対応する公式ドキュメント**:
- [Settings](https://code.claude.com/docs/en/settings)
- [Memory](https://code.claude.com/docs/en/memory)
- [Permissions](https://code.claude.com/docs/en/permissions)
- [Model config](https://code.claude.com/docs/en/model-config)
- [Keybindings](https://code.claude.com/docs/en/keybindings)
- [Output styles](https://code.claude.com/docs/en/output-styles)
- [Fast mode](https://code.claude.com/docs/en/fast-mode)
- [Status line](https://code.claude.com/docs/en/statusline)

**ディレクトリ**: [`week-04_configuration/`](week-04_configuration/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-settings-overview.md](week-04_configuration/01-settings-overview.md) | 設定ファイル体系 |
| 2 | [02-claude-md.md](week-04_configuration/02-claude-md.md) | CLAUDE.md設計パターン |
| 3 | [03-auto-memory.md](week-04_configuration/03-auto-memory.md) | 自動メモリ機能 |
| 4 | [04-permissions.md](week-04_configuration/04-permissions.md) | パーミッションシステム |
| 5 | [05-model-config.md](week-04_configuration/05-model-config.md) | モデル設定 |
| 6 | [06-keybindings.md](week-04_configuration/06-keybindings.md) | キーバインドカスタマイズ |
| 7 | [07-output-styles.md](week-04_configuration/07-output-styles.md) | 出力スタイル設定 |

---

## Week 5: カスタマイズ・拡張

**テーマ**: Claude Codeの機能を拡張する

**学習目標**:
- Skillsシステムの概要と作成方法を理解する
- Hooksによるワークフロー自動化を実装できる
- Hooks設定の詳細リファレンスを参照できる
- プラグインシステムの概要を理解する
- カスタムプラグインを開発できる
- プラグインマーケットプレイスを活用できる

**対応する公式ドキュメント**:
- [Skills](https://code.claude.com/docs/en/skills)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Discover plugins](https://code.claude.com/docs/en/discover-plugins)
- [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)

**ディレクトリ**: [`week-05_customization/`](week-05_customization/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-skills-system.md](week-05_customization/01-skills-system.md) | Skillsシステム |
| 2 | [02-hooks-guide.md](week-05_customization/02-hooks-guide.md) | Hooksによる自動化 |
| 3 | [03-hooks-reference.md](week-05_customization/03-hooks-reference.md) | Hooks詳細リファレンス |
| 4 | [04-plugins-overview.md](week-05_customization/04-plugins-overview.md) | プラグインシステム概要 |
| 5 | [05-plugin-development.md](week-05_customization/05-plugin-development.md) | プラグイン開発方法 |
| 6 | [06-plugin-marketplace.md](week-05_customization/06-plugin-marketplace.md) | マーケットプレイス活用 |

---

## Week 6: MCP・外部ツール連携

**テーマ**: 外部サービスとClaude Codeを接続する

**学習目標**:
- MCPプロトコルの概念と仕組みを理解する
- MCPサーバーの設定方法を習得する
- 主要なMCPサーバーの用途を把握する
- カスタムMCPサーバーの開発方法を理解する
- Chrome連携によるブラウザ自動化を実践できる
- Slack連携を設定・活用できる

**対応する公式ドキュメント**:
- [MCP](https://code.claude.com/docs/en/mcp)
- [Chrome](https://code.claude.com/docs/en/chrome)
- [Slack](https://code.claude.com/docs/en/slack)

**ディレクトリ**: [`week-06_mcp-integration/`](week-06_mcp-integration/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-mcp-overview.md](week-06_mcp-integration/01-mcp-overview.md) | MCPプロトコル概要 |
| 2 | [02-mcp-setup.md](week-06_mcp-integration/02-mcp-setup.md) | MCPサーバー設定方法 |
| 3 | [03-popular-servers.md](week-06_mcp-integration/03-popular-servers.md) | 主要MCPサーバー一覧 |
| 4 | [04-custom-mcp-server.md](week-06_mcp-integration/04-custom-mcp-server.md) | カスタムMCPサーバー開発 |
| 5 | [05-chrome-integration.md](week-06_mcp-integration/05-chrome-integration.md) | Chrome連携 |
| 6 | [06-slack-integration.md](week-06_mcp-integration/06-slack-integration.md) | Slack連携 |

---

## Week 7: チーム開発・CI/CD

**テーマ**: チームでの運用とCI/CDパイプライン統合

**学習目標**:
- サブエージェントの種類と使い分けを理解する
- Agent Teamsによる並列処理を設計・実行できる
- GitHub Actionsとの統合を設定できる
- GitLab CI/CDとの統合を設定できる
- Headless/プログラマティック実行を活用できる
- コスト管理と最適化を実践できる

**対応する公式ドキュメント**:
- [Sub-agents](https://code.claude.com/docs/en/sub-agents)
- [Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd)
- [Headless](https://code.claude.com/docs/en/headless)
- [Costs](https://code.claude.com/docs/en/costs)
- [Analytics](https://code.claude.com/docs/en/analytics)
- [Monitoring](https://code.claude.com/docs/en/monitoring-usage)

**ディレクトリ**: [`week-07_team-development/`](week-07_team-development/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-sub-agents.md](week-07_team-development/01-sub-agents.md) | サブエージェントの活用 |
| 2 | [02-agent-teams.md](week-07_team-development/02-agent-teams.md) | Agent Teamsによる並列処理 |
| 3 | [03-github-actions.md](week-07_team-development/03-github-actions.md) | GitHub Actions統合 |
| 4 | [04-gitlab-cicd.md](week-07_team-development/04-gitlab-cicd.md) | GitLab CI/CD統合 |
| 5 | [05-headless-mode.md](week-07_team-development/05-headless-mode.md) | Headless/プログラマティック実行 |
| 6 | [06-cost-management.md](week-07_team-development/06-cost-management.md) | コスト管理・最適化 |

---

## Week 8: 上級・エンタープライズ

**テーマ**: セキュリティ・大規模導入・ベストプラクティス

**学習目標**:
- セキュリティ設計の原則を理解する
- サンドボックス環境の構築・運用ができる
- エンタープライズ導入の計画を立てられる
- クラウドプロバイダー（Bedrock/Vertex/Foundry）との連携を設定できる
- 組織管理設定を理解する
- ベストプラクティスを総合的に実践できる
- データプライバシーとZDRを理解する

**対応する公式ドキュメント**:
- [Security](https://code.claude.com/docs/en/security)
- [Sandboxing](https://code.claude.com/docs/en/sandboxing)
- [Enterprise deployment](https://code.claude.com/docs/en/third-party-integrations)
- [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)
- [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai)
- [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)
- [Server-managed settings](https://code.claude.com/docs/en/server-managed-settings)
- [Data usage](https://code.claude.com/docs/en/data-usage)
- [Zero data retention](https://code.claude.com/docs/en/zero-data-retention)
- [Network config](https://code.claude.com/docs/en/network-config)
- [LLM gateway](https://code.claude.com/docs/en/llm-gateway)
- [Dev containers](https://code.claude.com/docs/en/devcontainer)
- [Legal and compliance](https://code.claude.com/docs/en/legal-and-compliance)
- [Best practices](https://code.claude.com/docs/en/best-practices)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)

**ディレクトリ**: [`week-08_advanced-enterprise/`](week-08_advanced-enterprise/)

| # | ファイル | 内容 |
|---|---------|------|
| 1 | [01-security.md](week-08_advanced-enterprise/01-security.md) | セキュリティ設計 |
| 2 | [02-sandboxing.md](week-08_advanced-enterprise/02-sandboxing.md) | サンドボックス環境 |
| 3 | [03-enterprise-deployment.md](week-08_advanced-enterprise/03-enterprise-deployment.md) | エンタープライズ導入 |
| 4 | [04-cloud-providers.md](week-08_advanced-enterprise/04-cloud-providers.md) | クラウドプロバイダー連携 |
| 5 | [05-managed-settings.md](week-08_advanced-enterprise/05-managed-settings.md) | 組織管理設定 |
| 6 | [06-best-practices.md](week-08_advanced-enterprise/06-best-practices.md) | ベストプラクティス総まとめ |
| 7 | [07-data-privacy.md](week-08_advanced-enterprise/07-data-privacy.md) | データプライバシー・ZDR |

---

## 付録

| ドキュメント | 内容 | 対応する公式ドキュメント |
|-------------|------|------------------------|
| [用語集](appendix/glossary.md) | Claude Code関連の用語定義 | 全般 |
| [チートシート](appendix/cheatsheet.md) | コマンドチートシート | [CLI reference](https://code.claude.com/docs/en/cli-reference) |
| [トラブルシューティング](appendix/troubleshooting.md) | よくある問題と解決方法 | [Troubleshooting](https://code.claude.com/docs/en/troubleshooting) |
| [公式ドキュメントマップ](appendix/official-docs-map.md) | 全59ページの対応表 | 全般 |
| [更新ガイド](appendix/update-guide.md) | コンテンツ更新方法 | [Changelog](https://code.claude.com/docs/en/changelog) |

---

## 学習の進め方

### 自習の場合
1. 各週のREADME.mdで学習目標を確認
2. 各レッスンファイルを順番に読む
3. 実際にClaude Codeを操作しながら進める
4. references.mdで公式ドキュメントを参照

### 研修・授業の場合
1. 講師がSYLLABUS.mdで全体像を説明
2. 各週のREADME.mdを使って週の概要を共有
3. レッスンファイルをベースにハンズオン実施
4. 質疑応答とディスカッション

### 推奨ペース
- **集中学習**: 1日1-2レッスン（約4週間で完了）
- **週次学習**: 週に1セクション（8週間で完了）
- **月次学習**: 月2セクション（4ヶ月で完了）
