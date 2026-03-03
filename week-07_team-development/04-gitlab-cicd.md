# GitLab CI/CD統合

> 対応する公式ドキュメント: [Claude Code GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd)

## 学習目標

- Claude Code GitLab CI/CD統合の概要と仕組みを理解する
- `.gitlab-ci.yml`へのClaudeジョブの追加方法を習得する
- マージリクエスト（MR）でのClaude活用パターンを実践できる
- AWS Bedrock・Google Vertex AIを使った企業向け設定ができる
- セキュリティのベストプラクティスを理解する

## 概要

Claude Code GitLab CI/CDは、GitLabワークフローにAI自動化機能を追加します（現在ベータ版）。Issueやマージリクエストで`@claude`とメンションするだけで、ClaudeがMRを作成し、変更を実装し、フォローアップコメントに基づいて反復改善を行います。

主な特徴：
- **即時MR作成**: 必要な変更を記述するとClaudeが完全なMRを作成
- **自動実装**: コメント一つでIssueからコードへ
- **プロジェクト準拠**: `CLAUDE.md`のガイドラインと既存コードパターンを尊重
- **シンプルなセットアップ**: `.gitlab-ci.yml`に1つのジョブを追加するだけ
- **企業対応**: Claude API・AWS Bedrock・Google Vertex AIを選択可能
- **デフォルトで安全**: GitLabランナー上で実行、ブランチ保護とレビューが適用される

> **注意**: この統合はGitLabによってメンテナンスされています。サポートは[GitLab issue](https://gitlab.com/gitlab-org/gitlab/-/issues/573776)を参照してください。

## 本文

### 仕組み

Claude Code GitLab CI/CDは以下のフローで動作します：

1. **イベント駆動オーケストレーション**: GitLabがトリガー（例: Issue・MR・レビュースレッドの`@claude`コメント）を監視。スレッドとリポジトリのコンテキストを収集してプロンプトを構築し、Claude Codeを実行

2. **プロバイダー抽象化**: 環境に合ったプロバイダーを使用：
   - Claude API（SaaS）
   - AWS Bedrock（IAMベースのアクセス、クロスリージョン対応）
   - Google Vertex AI（GCPネイティブ、Workload Identity Federation）

3. **サンドボックス実行**: 各インタラクションは厳格なネットワークとファイルシステムのルールを持つコンテナ内で実行。すべての変更はMR経由で行われるため、レビュアーはdiffを確認でき、承認ルールが適用される

### クイックセットアップ

#### 1. マスクされたCI/CD変数の追加

- **Settings** → **CI/CD** → **Variables**
- `ANTHROPIC_API_KEY`を追加（masked、必要に応じてprotected設定）

#### 2. `.gitlab-ci.yml`にClaudeジョブを追加

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
  # トリガー条件を調整:
  # - 手動実行
  # - マージリクエストイベント
  # - @claude を含むコメント時のWeb/APIトリガー
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
  variables:
    GIT_STRATEGY: fetch
  before_script:
    - apk update
    - apk add --no-cache git curl bash
    - curl -fsSL https://claude.ai/install.sh | bash
  script:
    # オプション: GitLab MCPサーバーを起動
    - /bin/gitlab-mcp-server || true
    # AI_FLOW_* 変数を使用してコンテキストペイロード付きのWeb/APIトリガーを処理
    - echo "$AI_FLOW_INPUT for $AI_FLOW_CONTEXT on $AI_FLOW_EVENT"
    - >
      claude
      -p "${AI_FLOW_INPUT:-'このMRをレビューして要求された変更を実装してください'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
```

### 主要なユースケース

#### IssueからMRへの変換

Issueコメントで：

```
@claude Issueの説明に基づいてこの機能を実装してください
```

Claudeがコードベースとissueを分析し、変更をブランチに書き込み、レビュー用のMRをオープンします。

#### 実装支援

MRディスカッションで：

```
@claude このAPIコールの結果をキャッシュする具体的なアプローチを提案してください
```

Claudeが変更を提案し、適切なキャッシングを追加し、MRを更新します。

#### バグ修正

IssueまたはMRコメントで：

```
@claude ユーザーダッシュボードコンポーネントのTypeErrorを修正してください
```

Claudeがバグを特定し、修正を実装し、ブランチを更新またはMRをオープンします。

### AWS Bedrock・Google Vertex AIとの連携

#### AWS Bedrockの設定

**前提条件:**
- Amazon BedrockでClaudeモデルにアクセスできるAWSアカウント
- AWS IAMでGitLabをOIDCアイデンティティプロバイダーとして設定
- Bedrock権限と信頼ポリシーを持つIAMロール

**必要なCI/CD変数:**
- `AWS_ROLE_TO_ASSUME`: IAMロールのARN
- `AWS_REGION`: Bedrockリージョン

```yaml
claude-bedrock:
  stage: ai
  image: node:24-alpine3.21
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apk add --no-cache bash curl jq git python3 py3-pip
    - pip install --no-cache-dir awscli
    - curl -fsSL https://claude.ai/install.sh | bash
    # GitLab OIDCトークンをAWS認証情報に交換
    - export AWS_WEB_IDENTITY_TOKEN_FILE="${CI_JOB_JWT_FILE:-/tmp/oidc_token}"
    - if [ -n "${CI_JOB_JWT_V2}" ]; then printf "%s" "$CI_JOB_JWT_V2" > "$AWS_WEB_IDENTITY_TOKEN_FILE"; fi
    - >
      aws sts assume-role-with-web-identity
      --role-arn "$AWS_ROLE_TO_ASSUME"
      --role-session-name "gitlab-claude-$(date +%s)"
      --web-identity-token "file://$AWS_WEB_IDENTITY_TOKEN_FILE"
      --duration-seconds 3600 > /tmp/aws_creds.json
    - export AWS_ACCESS_KEY_ID="$(jq -r .Credentials.AccessKeyId /tmp/aws_creds.json)"
    - export AWS_SECRET_ACCESS_KEY="$(jq -r .Credentials.SecretAccessKey /tmp/aws_creds.json)"
    - export AWS_SESSION_TOKEN="$(jq -r .Credentials.SessionToken /tmp/aws_creds.json)"
  script:
    - /bin/gitlab-mcp-server || true
    - >
      claude
      -p "${AI_FLOW_INPUT:-'要求された変更を実装してMRをオープンしてください'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  variables:
    AWS_REGION: "us-west-2"
```

#### Google Vertex AIの設定

**前提条件:**
- Vertex AI APIが有効なGCPプロジェクト
- GitLab OIDC用Workload Identity Federation設定
- Vertex AI権限を持つサービスアカウント

**必要なCI/CD変数:**
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: フルプロバイダーリソース名
- `GCP_SERVICE_ACCOUNT`: サービスアカウントメール
- `CLOUD_ML_REGION`: Vertexリージョン（例: `us-east5`）

```yaml
claude-vertex:
  stage: ai
  image: gcr.io/google.com/cloudsdktool/google-cloud-cli:slim
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apt-get update && apt-get install -y git && apt-get clean
    - curl -fsSL https://claude.ai/install.sh | bash
    # Workload Identity Federation経由でGCP認証（キーファイル不要）
    - >
      gcloud auth login --cred-file=<(cat <<EOF
      {
        "type": "external_account",
        "audience": "${GCP_WORKLOAD_IDENTITY_PROVIDER}",
        "subject_token_type": "urn:ietf:params:oauth:token-type:jwt",
        "service_account_impersonation_url": "https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT}:generateAccessToken",
        "token_url": "https://sts.googleapis.com/v1/token"
      }
      EOF
      )
  script:
    - /bin/gitlab-mcp-server || true
    - >
      CLOUD_ML_REGION="${CLOUD_ML_REGION:-us-east5}"
      claude
      -p "${AI_FLOW_INPUT:-'レビューして要求通りにコードを更新してください'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
  variables:
    CLOUD_ML_REGION: "us-east5"
```

### ベストプラクティス

#### CLAUDE.mdの設定

リポジトリルートに`CLAUDE.md`ファイルを作成して、コーディング標準・レビュー基準・プロジェクト固有のルールを定義します。Claudeは実行時にこのファイルを読み込み、規約に従います。

```markdown
# コードスタイル
- TypeScriptを使用し、`any`型は避ける
- 関数は小さく、単一責任の原則を守る

# テスト
- 新機能には必ずユニットテストを追加する
- テストカバレッジは80%以上を維持する
```

#### セキュリティのベストプラクティス

**絶対に守るべきルール:**
- APIキーやクラウド認証情報をリポジトリにコミットしない
- GitLab CI/CD変数を使用（マスク設定）

**その他のベストプラクティス:**
- 可能な限りOIDCを使用（長期的なキーを避ける）
- ジョブのパーミッションとネットワークエグレスを制限
- ClaudeのMRは通常のコントリビューターと同様にレビューする

#### パフォーマンスの最適化

- `CLAUDE.md`は簡潔に保つ
- 繰り返しを減らすために明確なIssue/MR説明を提供
- 暴走するジョブを避けるため適切なジョブタイムアウトを設定
- 可能な場合はランナーでnpmとパッケージキャッシュを活用

### コスト管理

**GitLab Runnerの時間:**
- Claude CodeはGitLabランナー上で動作し、コンピュートミニットを消費

**APIコスト:**
- 各Claudeインタラクションはプロンプトと応答のサイズに応じてトークンを消費

**コスト最適化:**
- 不要なターンを減らすため具体的な`@claude`コマンドを使用
- 適切な`max_turns`とジョブタイムアウトを設定
- 並列実行を制限してコストを制御

### セキュリティとガバナンス

- 各ジョブは制限されたネットワークアクセスを持つ分離されたコンテナで実行
- Claudeの変更はMR経由で行われるため、レビュアーが全てのdiffを確認可能
- ブランチ保護と承認ルールがAI生成コードにも適用される
- Claude Codeはワークスペーススコープのパーミッションで書き込みを制限
- 独自のプロバイダー認証情報を使うため、コストは管理下に置かれる

### トラブルシューティング

**@claudeコマンドに応答しない場合:**
- パイプラインがトリガーされているか確認（手動・MRイベント・コメントイベントリスナー/Webhook）
- CI/CD変数（`ANTHROPIC_API_KEY`またはクラウドプロバイダー設定）が存在してアンマスクされているか確認
- コメントが`@claude`（`/claude`ではなく）を含み、メンショントリガーが設定されているか確認

**ジョブがコメントを書いたりMRをオープンできない場合:**
- `CI_JOB_TOKEN`がプロジェクトに十分なパーミッションを持つか、または`api`スコープ付きProject Access Tokenを使用
- `mcp__gitlab`ツールが`--allowedTools`で有効になっているか確認
- ジョブがMRのコンテキストで実行されているか確認

**認証エラーの場合:**
- Claude API: `ANTHROPIC_API_KEY`が有効か確認
- Bedrock/Vertex: OIDC/WIF設定、ロールの権限移譲、シークレット名を確認

## まとめ

- Claude Code GitLab CI/CDは`.gitlab-ci.yml`に1つのジョブを追加するだけで利用できる（ベータ版）
- `ANTHROPIC_API_KEY`をマスクされたCI/CD変数として設定し、直接コードに書かない
- `@claude`メンションでIssueのMR化・コードレビュー・バグ修正を自動化できる
- AWS Bedrock・Google Vertex AIを使った企業環境での利用もOIDCを使って安全に実現できる
- CLAUDE.mdでコーディング標準を定義し、Claudeの動作をプロジェクトに合わせる
- GitLab MRを通じたレビューフローが維持されるため、AI生成コードも品質管理される

## 公式リファレンス

- [Claude Code GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) - 公式ドキュメント（ベータ）
- [GitLab Issue #573776](https://gitlab.com/gitlab-org/gitlab/-/issues/573776) - サポートとフィードバック
- [Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview) - 基盤となるSDK
