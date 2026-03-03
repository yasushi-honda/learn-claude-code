# GitHub Actions統合

> 対応する公式ドキュメント: [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)

## 学習目標

- Claude Code GitHub Actionsの概要と可能なことを理解する
- `/install-github-app`コマンドによるクイックセットアップを実行できる
- ワークフローファイルの基本構成を理解する
- シークレット設定と認証フローを適切に行える
- AWS Bedrock・Google Vertex AIを使った企業向け設定ができる

## 概要

Claude Code GitHub Actionsは、GitHubワークフローにAI自動化機能を追加します。PRやIssueのコメントで`@claude`とメンションするだけで、Claudeがコードを分析し、プルリクエストを作成し、機能を実装し、バグを修正します。このすべてがプロジェクトの標準に従って実行されます。

主な特徴：
- **即時PR作成**: 必要な変更を記述するとClaudeが完全なPRを作成
- **自動コード実装**: コメント一つでIssueからコードへ
- **プロジェクト標準への準拠**: `CLAUDE.md`のガイドラインと既存コードパターンを尊重
- **シンプルなセットアップ**: インストーラーとAPIキーで数分で開始可能
- **デフォルトで安全**: コードはGitHubのランナー上に留まる

## 本文

### セットアップ

#### クイックセットアップ

最も簡単なセットアップ方法はClaude Codeのターミナル内で`/install-github-app`コマンドを実行することです：

```
/install-github-app
```

このコマンドがGitHub Appとシークレットのセットアップを案内します。

> **注意**: リポジトリ管理者権限が必要です。このクイックスタートは直接のClaude APIユーザーのみ対応。AWS BedrockやGoogle Vertex AIを使用する場合は手動セットアップが必要です。

#### 手動セットアップ

`/install-github-app`が失敗する場合や手動設定を好む場合：

1. **Claude GitHub Appをインストール**: https://github.com/apps/claude
   - 必要な権限: Contents（読み書き）、Issues（読み書き）、Pull requests（読み書き）

2. **`ANTHROPIC_API_KEY`をリポジトリシークレットに追加**
   - Settings → Secrets and variables → Actions → New repository secret

3. **ワークフローファイルをコピー**: `examples/claude.yml`を`.github/workflows/`に配置

### 基本ワークフローの設定

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
          # コメントの @claude メンションに応答
```

このワークフローは`@claude`メンションに自動的に応答します。

### アクションパラメーター

Claude Code Action v1の主要パラメーター：

| パラメーター | 説明 | 必須 |
|------------|------|------|
| `prompt` | Claudeへの指示（テキストまたはスキル `/review` など） | 任意* |
| `claude_args` | Claude CodeへのCLI引数 | 任意 |
| `anthropic_api_key` | Claude APIキー | 必須** |
| `github_token` | GitHubトークン | 任意 |
| `trigger_phrase` | カスタムトリガーフレーズ（デフォルト: `@claude`） | 任意 |
| `use_bedrock` | Claude APIの代わりにAWS Bedrockを使用 | 任意 |
| `use_vertex` | Claude APIの代わりにGoogle Vertex AIを使用 | 任意 |

\*`prompt`はオプション - Issue/PRコメントへの応答では省略可
\*\*直接Claude APIの場合は必須。Bedrock/Vertexの場合は不要

### `claude_args`によるCLI引数の渡し方

```yaml
claude_args: "--max-turns 5 --model claude-sonnet-4-6 --mcp-config /path/to/config.json"
```

よく使われる引数：
- `--max-turns`: 最大会話ターン数（デフォルト: 10）
- `--model`: 使用モデル（例: `claude-sonnet-4-6`）
- `--mcp-config`: MCPの設定ファイルパス
- `--allowed-tools`: 許可するツールのカンマ区切りリスト
- `--debug`: デバッグ出力を有効化

### 主要なユースケース

#### スキルを使ったコードレビュー

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

#### カスタムプロンプトによる自動化

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

### `@claude`コマンドの使い方

IssueやPRコメントで以下のように使用します：

```
@claude Issueの説明に基づいてこの機能を実装してください
@claude このエンドポイントのユーザー認証はどう実装すべきか教えてください
@claude ユーザーダッシュボードコンポーネントのTypeErrorを修正してください
```

Claudeは自動的にコンテキストを分析して適切に応答します。

### ベータ版からv1へのアップグレード

ベータ版を使用している場合はv1にアップグレードする必要があります：

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

**変更点一覧:**

| 旧ベータ入力 | 新v1入力 |
|------------|---------|
| `mode` | 削除（自動検出） |
| `direct_prompt` | `prompt` |
| `override_prompt` | GitHub変数付き`prompt` |
| `custom_instructions` | `claude_args: --append-system-prompt` |
| `max_turns` | `claude_args: --max-turns` |
| `model` | `claude_args: --model` |
| `allowed_tools` | `claude_args: --allowedTools` |

### AWS Bedrock・Google Vertex AIとの連携

企業環境では独自のクラウドインフラでClaude Code GitHub Actionsを使用できます。

#### AWS Bedrockの設定

**前提条件:**
- Amazon BedrockアクセスのあるAWSアカウント
- GitHub ActionsのWorkload Identity Federation設定
- Bedrock権限を持つIAMロール
- カスタムGitHub App（推奨）

**必要なシークレット:**
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

> **ヒント**: BedrockのモデルIDはリージョンプレフィックス付き（例: `us.anthropic.claude-sonnet-4-6`）

#### Google Vertex AIの設定

**前提条件:**
- Vertex AI APIが有効なGCPプロジェクト
- GitHub用Workload Identity Federation設定
- Vertex AI権限を持つサービスアカウント

**必要なシークレット:**
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: プロバイダーリソース名
- `GCP_SERVICE_ACCOUNT`: サービスアカウントのメールアドレス
- `APP_ID`, `APP_PRIVATE_KEY`: GitHub App認証情報

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

### セキュリティに関する考慮事項

**絶対に守るべきルール:**
- APIキーをリポジトリに直接コミットしない
- GitHubシークレットを常に使用する（`${{ secrets.ANTHROPIC_API_KEY }}`）

**その他のベストプラクティス:**
- アクションのパーミッションを必要最小限に制限
- Claudeの提案をマージ前に必ずレビュー
- OIDC（OpenID Connect）を使用してAWS/GCPの静的な認証情報を避ける

### コスト最適化

GitHub Actions使用時のコスト考慮：

**GitHub Actionsコスト:**
- Claude CodeはGitHubホスト型ランナーで実行（Actions minuteを消費）
- 詳細はGitHubの請求ドキュメントを参照

**APIコスト:**
- 各Claude操作はプロンプトと応答の長さに応じてトークンを消費
- コードベースの規模とタスクの複雑さによって変動

**最適化のヒント:**
- 不要なAPI呼び出しを減らすため具体的な`@claude`コマンドを使用
- `claude_args: --max-turns N`で過剰な繰り返しを防止
- ワークフローレベルのタイムアウトを設定
- GitHubのconcurrency制御で並列実行を制限

## まとめ

- Claude Code GitHub Actionsを使うと`@claude`メンションだけでコードレビュー・機能実装・バグ修正が自動化できる
- `/install-github-app`コマンドで数分のクイックセットアップが可能
- `anthropics/claude-code-action@v1`を使用し、`prompt`と`claude_args`で動作をカスタマイズ
- APIキーは必ずGitHub Secretsに保存し、コードには直接書かない
- AWS BedrockやGoogle Vertex AIを使った企業向けデプロイも対応
- コスト管理のため`--max-turns`と適切なタイムアウト設定を行う

## 公式リファレンス

- [Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions) - 公式ドキュメント
- [claude-code-action GitHub repository](https://github.com/anthropics/claude-code-action) - ソースとサンプル
- [セキュリティドキュメント](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md) - 詳細なセキュリティガイド
