# GitLab CI/CD統合

> **対応公式ドキュメント**: https://code.claude.com/docs/en/gitlab-ci-cd
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude Code GitLab CI/CD統合の仕組み（イベント駆動・プロバイダー抽象化・サンドボックス実行）を説明できる
2. `.gitlab-ci.yml`にClaudeジョブを追加し、`@claude`メンションによる自動化を設定できる
3. マージリクエスト（MR）でのClaude活用パターン（Issue→MR変換、実装支援、バグ修正）を実践できる
4. AWS BedrockやGoogle Vertex AIを使った企業向けOIDC認証設定ができる

---

## 1. Claude Code GitLab CI/CDとは

Claude Code GitLab CI/CDは、GitLabワークフローにAI自動化機能を追加する統合です（現在ベータ版）。Issueやマージリクエストで`@claude`とメンションするだけで、ClaudeがMRを作成し、変更を実装し、フォローアップコメントに基づいて反復改善を行います。

**主な特徴：**
- **即時MR作成**: 必要な変更を記述するとClaudeが完全なMRを作成
- **自動実装**: コメント一つでIssueからコードへ
- **プロジェクト準拠**: `CLAUDE.md`のガイドラインと既存コードパターンを尊重
- **企業対応**: Claude API・AWS Bedrock・Google Vertex AIを選択可能
- **デフォルトで安全**: GitLabランナー上で実行、ブランチ保護とレビューが適用される

> **公式ドキュメントより**: この統合はGitLabによってメンテナンスされています。サポートは [GitLab Issue #573776](https://gitlab.com/gitlab-org/gitlab/-/issues/573776) を参照してください。

### GitHub Actions版との違い

同じClaude Codeを基盤としていますが、プラットフォームに合わせた違いがあります：

| 観点 | GitHub Actions | GitLab CI/CD |
|------|---------------|-------------|
| 設定ファイル | `.github/workflows/*.yml` | `.gitlab-ci.yml` |
| アクション | `anthropics/claude-code-action@v1` | Claude CLIを直接実行 |
| トリガー | Issue/PRコメント | Issue/MRコメント・Webトリガー |
| MCPサーバー | 組み込み | `gitlab-mcp-server`を起動 |
| メンテナー | Anthropic | GitLab |
| 成熟度 | v1（GA） | ベータ |

---

## 2. 仕組み

Claude Code GitLab CI/CDは3つのレイヤーで動作します。

### イベント駆動オーケストレーション

GitLabがトリガー（Issue・MR・レビュースレッドの`@claude`コメント等）を監視します。スレッドとリポジトリのコンテキストを収集してプロンプトを構築し、Claude Codeを実行します。

`AI_FLOW_*`環境変数でコンテキストが渡されます：
- `AI_FLOW_INPUT`: ユーザーのメッセージ内容
- `AI_FLOW_CONTEXT`: リポジトリ/MRのコンテキスト
- `AI_FLOW_EVENT`: トリガーイベントの種類

### プロバイダー抽象化

環境に合ったプロバイダーを選択できます：
- **Claude API（SaaS）**: 最もシンプル、`ANTHROPIC_API_KEY`のみで設定可能
- **AWS Bedrock**: IAMベースのアクセス、クロスリージョン対応
- **Google Vertex AI**: GCPネイティブ、Workload Identity Federation

### サンドボックス実行

各インタラクションは厳格なネットワークとファイルシステムのルールを持つコンテナ内で実行されます。すべての変更はMR経由で行われるため、レビュアーはdiffを確認でき、承認ルールが適用されます。

---

## 3. セットアップ

### ステップ1: マスクされたCI/CD変数の追加

GitLabプロジェクトの **Settings** → **CI/CD** → **Variables** で`ANTHROPIC_API_KEY`を追加します。

設定のポイント：
- **Masked**: APIキーがジョブログに表示されないようにする
- **Protected**（任意）: 保護されたブランチ/タグでのみ使用する場合

### ステップ2: `.gitlab-ci.yml`にClaudeジョブを追加

```yaml
stages:
  - ai

claude:
  stage: ai
  image: node:24-alpine3.21
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
    # AI_FLOW_* 変数でコンテキストを取得
    - echo "$AI_FLOW_INPUT for $AI_FLOW_CONTEXT on $AI_FLOW_EVENT"
    - >
      claude
      -p "${AI_FLOW_INPUT:-'このMRをレビューして要求された変更を実装してください'}"
      --permission-mode acceptEdits
      --allowedTools "Bash Read Edit Write mcp__gitlab"
      --debug
```

**ポイント：**
- `image: node:24-alpine3.21`でNode.js環境をベースに使用
- `before_script`でClaude CLIをインストール
- `--permission-mode acceptEdits`でファイル編集を自動承認
- `--allowedTools`で使用するツールを明示的に指定
- `mcp__gitlab`ツールでGitLab操作（MR作成・コメント等）を実行

---

## 4. 主要なユースケース

### IssueからMRへの変換

Issueコメントで：
```
@claude Issueの説明に基づいてこの機能を実装してください
```

Claudeがコードベースとissueを分析し、変更をブランチに書き込み、レビュー用のMRをオープンします。

### 実装支援

MRディスカッションで：
```
@claude このAPIコールの結果をキャッシュする具体的なアプローチを提案してください
```

Claudeが変更を提案し、適切なキャッシングを追加し、MRを更新します。

### バグ修正

IssueまたはMRコメントで：
```
@claude ユーザーダッシュボードコンポーネントのTypeErrorを修正してください
```

Claudeがバグを特定し、修正を実装し、ブランチを更新またはMRをオープンします。

---

## 5. 企業向け設定: Bedrock / Vertex AI

### AWS Bedrockの設定

**前提条件：**
- Amazon BedrockでClaudeモデルにアクセスできるAWSアカウント
- AWS IAMでGitLabをOIDCアイデンティティプロバイダーとして設定
- Bedrock権限と信頼ポリシーを持つIAMロール

**必要なCI/CD変数：**
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

### Google Vertex AIの設定

**前提条件：**
- Vertex AI APIが有効なGCPプロジェクト
- GitLab OIDC用Workload Identity Federation設定
- Vertex AI権限を持つサービスアカウント

```yaml
claude-vertex:
  stage: ai
  image: gcr.io/google.com/cloudsdktool/google-cloud-cli:slim
  rules:
    - if: '$CI_PIPELINE_SOURCE == "web"'
  before_script:
    - apt-get update && apt-get install -y git && apt-get clean
    - curl -fsSL https://claude.ai/install.sh | bash
    # Workload Identity Federation経由でGCP認証
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

---

## 6. ベストプラクティス

### CLAUDE.mdの設定

リポジトリルートに`CLAUDE.md`を作成して、コーディング標準・レビュー基準・プロジェクト固有のルールを定義します。Claudeは実行時にこのファイルを読み込み、規約に従います。

```markdown
# コードスタイル
- TypeScriptを使用し、`any`型は避ける
- 関数は小さく、単一責任の原則を守る

# テスト
- 新機能には必ずユニットテストを追加する
- テストカバレッジは80%以上を維持する
```

### セキュリティ

| ルール | 説明 |
|--------|------|
| APIキーをコミットしない | GitLab CI/CD変数（マスク設定）を使用 |
| OIDCを使う | 長期的なキーの代わりにOIDC認証を利用 |
| パーミッションを最小限に | ジョブのネットワークエグレスを制限 |
| レビューを怠らない | ClaudeのMRも通常のコントリビューターと同様にレビュー |

### パフォーマンス最適化

- `CLAUDE.md`は簡潔に保つ
- 明確なIssue/MR説明で繰り返しを減らす
- 適切なジョブタイムアウトを設定
- ランナーでnpmとパッケージキャッシュを活用

---

## 7. トラブルシューティング

### `@claude`コマンドに応答しない場合

1. パイプラインがトリガーされているか確認（手動・MRイベント・Webhook）
2. CI/CD変数（`ANTHROPIC_API_KEY`またはクラウドプロバイダー設定）が存在するか確認
3. コメントが`@claude`（`/claude`ではなく）を含んでいるか確認
4. メンショントリガーの設定が正しいか確認

### ジョブがコメントやMRを作成できない場合

1. `CI_JOB_TOKEN`が十分なパーミッションを持つか、または`api`スコープ付きProject Access Tokenを使用
2. `mcp__gitlab`ツールが`--allowedTools`で有効になっているか確認
3. ジョブがMRのコンテキストで実行されているか確認

### 認証エラーの場合

- **Claude API**: `ANTHROPIC_API_KEY`が有効か確認
- **Bedrock**: OIDC設定、ロールの権限移譲、シークレット名を確認
- **Vertex**: WIF設定、サービスアカウントの権限を確認

---

## ハンズオン演習

### 演習 1: 基本的なGitLab CI/CDジョブの設定

**目的**: GitLabプロジェクトにClaude Codeジョブを追加し、動作を確認する
**前提条件**: GitLabプロジェクトの管理者権限、Anthropic APIキー

**手順**:
1. GitLabプロジェクトの **Settings** → **CI/CD** → **Variables** で`ANTHROPIC_API_KEY`を追加する（Masked: ON）
2. `.gitlab-ci.yml`に本章のセットアップ例のClaudeジョブを追加してコミットする
3. Webパイプラインを手動で実行して、Claude CLIのインストールとジョブ実行を確認する
4. テスト用のMRを作成し、コメントで`@claude このMRの変更を要約してください`と投稿する

**期待される結果**: パイプラインが正常に実行され、Claudeがコメントで応答する

### 演習 2: CLAUDE.mdを使ったプロジェクト固有のレビュー

**目的**: CLAUDE.mdの規約に基づくレビューを確認する

**手順**:
1. リポジトリルートに`CLAUDE.md`を作成し、プロジェクトのコーディング規約を記述する
2. テスト用のMRで意図的に規約違反のコードを含める
3. `@claude このMRをレビューしてください`で自動レビューを実行する
4. Claudeが`CLAUDE.md`の規約に基づいてフィードバックすることを確認する

**期待される結果**: CLAUDE.mdに定義した規約違反が指摘される

---

## よくある質問

**Q: GitLab CI/CD統合はGitHub Actions版と同じように安定していますか？**
A: GitLab CI/CD統合は現在ベータ版であり、GitHub Actions版（v1 GA）と比べると成熟度が異なります。本番ワークフローに組み込む前に十分なテストを行ってください。GitLabがメンテナンスしているため、フィードバックはGitLab Issue #573776へ報告してください。

**Q: GitLab SaaS（gitlab.com）とself-managed（オンプレミス）の両方で使えますか？**
A: はい。Claude API、Bedrock、Vertex AIのいずれかに接続できる環境であれば、どちらでも使用できます。self-managedの場合はネットワーク設定に注意してください。

**Q: `gitlab-mcp-server`は必須ですか？**
A: 必須ではありませんが、GitLabのAPIを通じたMR操作（作成・更新・コメント）を行うために推奨されます。起動に失敗しても`|| true`でジョブ自体は継続します。

**Q: GitHub ActionsとGitLab CI/CDを同じリポジトリで併用できますか？**
A: ミラーリポジトリの場合は可能ですが、同じリポジトリでの併用は通常不要です。プラットフォームに合わせていずれか一方を選択してください。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code GitLab CI/CDは`.gitlab-ci.yml`に1つのジョブを追加するだけで利用できる（ベータ版）
- イベント駆動オーケストレーション・プロバイダー抽象化・サンドボックス実行の3レイヤーで動作する
- `@claude`メンションでIssueのMR化・コードレビュー・バグ修正を自動化できる
- AWS Bedrock・Google Vertex AIを使った企業環境でもOIDCで安全に利用可能
- CLAUDE.mdでコーディング標準を定義し、MRレビューフローの品質管理が維持される

## 次のステップ

次の章「Headless/プログラマティック実行」では、`claude -p`コマンドによる非対話的実行とCI/CDパイプラインへの組み込みを学びます。

---

> **公式リファレンス**
> - [Claude Code GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) - 公式ドキュメント（ベータ）
> - [GitLab Issue #573776](https://gitlab.com/gitlab-org/gitlab/-/issues/573776) - サポートとフィードバック
