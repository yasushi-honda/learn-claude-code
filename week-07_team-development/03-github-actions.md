# GitHub Actions統合

> **対応公式ドキュメント**: https://code.claude.com/docs/en/github-actions
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude Code GitHub Actionsの概要と`@claude`メンションによる自動化を理解できる
2. `/install-github-app`コマンドによるクイックセットアップ、または手動セットアップを実行できる
3. `anthropics/claude-code-action@v1`のパラメーターと`claude_args`によるCLI引数のカスタマイズができる
4. AWS BedrockやGoogle Vertex AIを使った企業向けデプロイを設定できる

---

## 1. Claude Code GitHub Actionsとは

Claude Code GitHub Actionsは、GitHubワークフローにAI自動化機能を追加する統合です。PRやIssueのコメントで`@claude`とメンションするだけで、Claudeがコードを分析し、プルリクエストを作成し、機能を実装し、バグを修正します。

**主な特徴：**
- **即時PR作成**: 必要な変更を記述するとClaudeが完全なPRを作成
- **自動コード実装**: コメント一つでIssueからコードへ
- **プロジェクト標準への準拠**: `CLAUDE.md`のガイドラインと既存コードパターンを尊重
- **デフォルトで安全**: コードはGitHubのランナー上に留まる

**使用例：**
```
@claude Issueの説明に基づいてこの機能を実装してください
@claude このエンドポイントのユーザー認証はどう実装すべきか教えてください
@claude ユーザーダッシュボードコンポーネントのTypeErrorを修正してください
```

---

## 2. セットアップ

### クイックセットアップ（推奨）

最も簡単な方法はClaude Codeのターミナル内で`/install-github-app`コマンドを実行することです。

```
/install-github-app
```

このコマンドがGitHub Appとシークレットのセットアップを対話的に案内します。

> **公式ドキュメントより**: リポジトリ管理者権限が必要です。このクイックスタートは直接のClaude APIユーザーのみ対応。AWS BedrockやGoogle Vertex AIを使用する場合は手動セットアップが必要です。

### 手動セットアップ

`/install-github-app`が失敗する場合や手動設定を好む場合の手順です。

**ステップ1: Claude GitHub Appをインストール**

https://github.com/apps/claude にアクセスし、対象リポジトリにインストールします。

必要な権限：
- Contents（読み書き）
- Issues（読み書き）
- Pull requests（読み書き）

**ステップ2: `ANTHROPIC_API_KEY`をリポジトリシークレットに追加**

Settings → Secrets and variables → Actions → New repository secret で`ANTHROPIC_API_KEY`を追加します。

**ステップ3: ワークフローファイルを配置**

`.github/workflows/claude.yml`を作成します。

---

## 3. ワークフロー設定

### 基本ワークフロー

```yaml
# .github/workflows/claude.yml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

このワークフローは`@claude`メンションに自動的に応答します。

### アクションパラメーター（v1）

| パラメーター | 説明 | 必須 |
|------------|------|------|
| `prompt` | Claudeへの指示（テキストまたはスキル`/review`など） | 任意* |
| `claude_args` | Claude CodeへのCLI引数 | 任意 |
| `anthropic_api_key` | Claude APIキー | 必須** |
| `github_token` | GitHubトークン | 任意 |
| `trigger_phrase` | カスタムトリガーフレーズ（デフォルト: `@claude`） | 任意 |
| `use_bedrock` | AWS Bedrockを使用 | 任意 |
| `use_vertex` | Google Vertex AIを使用 | 任意 |

\*`prompt`はオプション。Issue/PRコメントへの応答では省略可
\*\*直接Claude APIの場合は必須。Bedrock/Vertexの場合は不要

### `claude_args`によるCLI引数の渡し方

```yaml
claude_args: "--max-turns 5 --model claude-sonnet-4-6 --mcp-config /path/to/config.json"
```

よく使われる引数：

| 引数 | 説明 | デフォルト |
|------|------|----------|
| `--max-turns` | 最大会話ターン数 | 10 |
| `--model` | 使用モデル | (自動) |
| `--mcp-config` | MCPの設定ファイルパス | - |
| `--allowed-tools` | 許可するツール | - |
| `--debug` | デバッグ出力を有効化 | - |

---

## 4. 主要なユースケース

### スキルを使ったコードレビュー

PR作成時に自動的にレビューを実行するワークフローです。

```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/review"
          claude_args: "--max-turns 5"
```

### カスタムプロンプトによる自動化

スケジュール実行で日次レポートを生成する例です。

```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "昨日のコミットとオープンIssueの要約を生成してください"
          claude_args: "--model opus"
```

### `@claude`によるインタラクティブな操作

IssueやPRコメントで自然言語で指示します：

```
@claude このPRの変更をセキュリティの観点でレビューしてください
@claude テストが失敗しています。修正案を提出してください
@claude このIssueの内容に基づいてPRを作成してください
```

---

## 5. ベータ版からv1へのアップグレード

既存のベータ版ワークフローを使用している場合はv1にアップグレードが必要です。

**変更点一覧：**

| 旧ベータ入力 | 新v1入力 |
|------------|---------|
| `mode` | 削除（自動検出に変更） |
| `direct_prompt` | `prompt` |
| `override_prompt` | GitHub変数付き`prompt` |
| `custom_instructions` | `claude_args: --append-system-prompt` |
| `max_turns` | `claude_args: --max-turns` |
| `model` | `claude_args: --model` |
| `allowed_tools` | `claude_args: --allowedTools` |

**ベータ版（古い設定）:**
```yaml
- uses: anthropics/claude-code-action@beta
  with:
    mode: "tag"
    direct_prompt: "このPRのセキュリティ問題をレビューしてください"
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    custom_instructions: "コーディング標準に従ってください"
    max_turns: "10"
    model: "claude-sonnet-4-6"
```

**v1（新しい設定）:**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    prompt: "このPRのセキュリティ問題をレビューしてください"
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    claude_args: |
      --append-system-prompt "コーディング標準に従ってください"
      --max-turns 10
      --model claude-sonnet-4-6
```

主な変更ポイントは、`mode`パラメーターの削除（自動検出に変更）と、個別パラメーターの`claude_args`への統合です。

---

## 6. 企業向け設定: Bedrock / Vertex AI

### AWS Bedrockの設定

**前提条件：**
- Amazon BedrockアクセスのあるAWSアカウント
- GitHub ActionsのWorkload Identity Federation設定
- Bedrock権限を持つIAMロール
- カスタムGitHub App（推奨）

**必要なシークレット：**
- `AWS_ROLE_TO_ASSUME`: BedrockアクセスのIAMロールARN
- `APP_ID`: GitHub AppのID
- `APP_PRIVATE_KEY`: GitHub Appの秘密鍵

```yaml
name: Claude PR Action
permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude-pr:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude'))
    runs-on: ubuntu-latest
    env:
      AWS_REGION: us-west-2
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Generate GitHub App token
        id: app-token
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${{ secrets.APP_ID }}
          private-key: ${{ secrets.APP_PRIVATE_KEY }}

      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-west-2

      - uses: anthropics/claude-code-action@v1
        with:
          github_token: ${{ steps.app-token.outputs.token }}
          use_bedrock: "true"
          claude_args: '--model us.anthropic.claude-sonnet-4-6 --max-turns 10'
```

> **公式ドキュメントより**: BedrockのモデルIDはリージョンプレフィックス付き（例: `us.anthropic.claude-sonnet-4-6`）

### Google Vertex AIの設定

**前提条件：**
- Vertex AI APIが有効なGCPプロジェクト
- GitHub用Workload Identity Federation設定
- Vertex AI権限を持つサービスアカウント

```yaml
- uses: anthropics/claude-code-action@v1
  with:
    github_token: ${{ steps.app-token.outputs.token }}
    trigger_phrase: "@claude"
    use_vertex: "true"
    claude_args: '--model claude-sonnet-4@20250514 --max-turns 10'
  env:
    ANTHROPIC_VERTEX_PROJECT_ID: ${{ steps.auth.outputs.project_id }}
    CLOUD_ML_REGION: us-east5
```

---

## 7. セキュリティとコスト

### セキュリティのベストプラクティス

**絶対に守るべきルール：**
- APIキーをリポジトリに直接コミットしない
- GitHubシークレットを常に使用する（`${{ secrets.ANTHROPIC_API_KEY }}`）

**その他のベストプラクティス：**
- アクションのパーミッションを必要最小限に制限
- Claudeの提案をマージ前に必ずレビュー
- OIDC（OpenID Connect）を使用してAWS/GCPの静的な認証情報を避ける

### コスト最適化のヒント

| 対策 | 効果 |
|------|------|
| 具体的な`@claude`コマンドを使用 | 不要なAPI呼び出しを削減 |
| `--max-turns N`で上限を設定 | 過剰な繰り返しを防止 |
| ワークフローレベルのタイムアウト | 暴走ジョブを防止 |
| GitHubのconcurrency制御 | 並列実行を制限 |

---

## ハンズオン演習

### 演習 1: 基本的な`@claude`応答ワークフローの設定

**目的**: Claude Code GitHub Actionsの基本セットアップを完了し、`@claude`が動作することを確認する
**前提条件**: GitHub管理者権限のあるリポジトリ、Anthropic APIキー

**手順**:
1. Claude Codeのターミナルで`/install-github-app`を実行する
   ```
   /install-github-app
   ```
2. 表示される手順に従ってGitHub Appをインストールし、APIキーをシークレットに設定する
3. 自動生成されたワークフローファイル（`.github/workflows/claude.yml`）を確認する
4. テスト用のIssueを作成し、コメントで`@claude このIssueの内容を要約してください`と投稿する
5. GitHub ActionsタブでClaudeのジョブが実行されることを確認する

**期待される結果**: ClaudeがIssueコメントに応答し、内容の要約が返される

### 演習 2: PR自動レビューの設定

**目的**: PRが作成されたら自動的にコードレビューが実行されるワークフローを構築する

**手順**:
1. `.github/workflows/review.yml`を作成する
   ```yaml
   name: Auto Review
   on:
     pull_request:
       types: [opened, synchronize]
   jobs:
     review:
       runs-on: ubuntu-latest
       steps:
         - uses: anthropics/claude-code-action@v1
           with:
             anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
             prompt: "/review"
             claude_args: "--max-turns 5"
   ```
2. テスト用のブランチで簡単なコード変更を行い、PRを作成する
3. PRにClaudeの自動レビューコメントが追加されることを確認する

**期待される結果**: PR作成時にClaudeが自動的にコードレビューを実行し、セキュリティ・パフォーマンス・ベストプラクティスの観点からフィードバックが投稿される

### 演習 3: カスタムワークフローの作成

**目的**: プロジェクト固有のニーズに合わせたカスタムワークフローを設計する

**手順**:
1. プロジェクトのCLAUDE.mdにコーディング規約を記述する
2. `--append-system-prompt`で追加の指示を含むワークフローを作成する
3. `--max-turns`と`--model`を適切に設定する
4. PRを作成してカスタム指示に基づくレビューが行われることを確認する

**期待される結果**: CLAUDE.mdの規約とカスタム指示の両方に基づいたレビューが実行される

---

## よくある質問

**Q: `/install-github-app`が失敗した場合はどうすればよいですか？**
A: 手動セットアップに切り替えてください。GitHub Appのインストール、APIキーのシークレット設定、ワークフローファイルの作成を手動で行います。管理者権限が足りない場合は、リポジトリオーナーに依頼してください。

**Q: Claudeのレビュー結果を信頼してそのままマージしてよいですか？**
A: いいえ。Claudeのレビューはあくまで補助であり、最終判断は人間が行うべきです。特にセキュリティに関わる変更は必ず人間のレビュアーが確認してください。

**Q: `@claude`のトリガーフレーズを変更できますか？**
A: はい。`trigger_phrase`パラメーターで変更できます。例えば`trigger_phrase: "@ai-review"`と設定すると`@ai-review`でトリガーされます。

**Q: GitHub Actionsの実行時間が長い場合はどうすればよいですか？**
A: `--max-turns`を小さく設定する、タスクをより具体的に記述する、ワークフローにタイムアウトを設定する（`timeout-minutes`）などの対策があります。

**Q: プライベートリポジトリでも使用できますか？**
A: はい。GitHub Appをプライベートリポジトリにインストールし、適切なシークレットを設定すれば使用できます。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code GitHub Actionsは`@claude`メンションでPRレビュー・機能実装・バグ修正を自動化する
- `/install-github-app`による数分のクイックセットアップが可能
- `anthropics/claude-code-action@v1`を使用し、`prompt`と`claude_args`で動作をカスタマイズ
- ベータ版からv1へのマイグレーションでは`mode`削除・`direct_prompt`→`prompt`が主な変更点
- AWS BedrockやGoogle Vertex AIを使った企業向けデプロイも対応

## 次のステップ

次の章「GitLab CI/CD統合」では、GitLabパイプラインにClaude Codeを組み込む方法を学びます。

---

> **公式リファレンス**
> - [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions) - 公式ドキュメント
> - [claude-code-action GitHub repository](https://github.com/anthropics/claude-code-action) - ソースとサンプル
> - [セキュリティドキュメント](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md) - 詳細なセキュリティガイド
