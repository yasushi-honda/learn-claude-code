# クラウドプロバイダー連携

> 対応する公式ドキュメント: [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock) / [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai) / [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)

## 学習目標

- Amazon Bedrock・Google Vertex AI・Microsoft FoundryそれぞれのClaude Code連携設定ができる
- 各プロバイダーの認証方式（IAM・GCP認証・Entra ID）を理解する
- モデルバージョンのピン留めが重要な理由と設定方法を把握する
- プロバイダー別のトラブルシューティング方法を知る
- 組織要件に応じた最適なプロバイダーを選択できる

## 概要

Claude CodeはAnthropicへの直接接続のほか、Amazon Bedrock・Google Vertex AI・Microsoft Foundryを通じてデプロイできます。これらのクラウドプロバイダー経由では、既存のクラウドインフラ・認証システム・コスト管理ツールをそのまま活用できます。それぞれのプロバイダーには独自のセットアップ手順と認証方式があります。

## 本文

### プロバイダー比較

| 機能 | Amazon Bedrock | Google Vertex AI | Microsoft Foundry |
|------|---------------|-----------------|-------------------|
| **クラウド基盤** | AWS | GCP | Azure |
| **認証方式** | IAM、APIキー、SSO | GCP認証（WIF対応） | Entra ID、APIキー |
| **コスト追跡** | AWS Cost Explorer | GCP課金 | Azure Cost Management |
| **IAM統合** | IAMポリシー | `roles/aiplatform.user` | `Azure AI User`ロール |
| **監査ログ** | CloudTrail | Cloud Audit Logs | Azure Monitor |
| **推論プロファイル** | クロスリージョン推論 | グローバル・リージョナル | - |
| **コンテンツフィルター** | AWS Guardrails | - | - |

---

### Amazon Bedrock

#### 前提条件

- Bedrockアクセスが有効なAWSアカウント
- 対象Claudeモデル（例：Claude Sonnet 4.6）へのアクセス権
- AWS CLI（オプション）
- 適切なIAMパーミッション

#### セットアップ手順

**ステップ1: ユースケース詳細の提出**

Anthropicモデルの初回利用前に一度だけ必要な手続きです：

1. [Amazon Bedrock コンソール](https://console.aws.amazon.com/bedrock/)にアクセス
2. **Chat/Text playground**を選択
3. Anthropicモデルを選択するとユースケースフォームが表示される
4. フォームに記入して送信

**ステップ2: AWS認証情報の設定**

5つの認証方式から選択できます：

```bash
# Option A: AWS CLI設定
aws configure

# Option B: 環境変数（アクセスキー）
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token

# Option C: 環境変数（SSOプロファイル）
aws sso login --profile=<your-profile-name>
export AWS_PROFILE=your-profile-name

# Option D: AWS Management Consoleの認証情報
aws login

# Option E: Bedrock APIキー（最もシンプル）
export AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key
```

**高度な認証情報の自動更新設定:**

AWS SSOや企業IDプロバイダーを使用する場合、認証情報の自動更新を`settings.json`で設定できます：

```json
{
  "awsAuthRefresh": "aws sso login --profile myprofile",
  "env": {
    "AWS_PROFILE": "myprofile"
  }
}
```

- `awsAuthRefresh`: `.aws`ディレクトリを変更するコマンド（SSO更新など）
- `awsCredentialExport`: 直接認証情報を返すコマンド（出力はユーザーに非表示）

**ステップ3: Claude Codeの設定**

```bash
# Bedrock統合を有効化
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1  # または希望のリージョン

# オプション: Haiku用のリージョンを別途設定
export ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION=us-west-2

# オプション: プロンプトキャッシュを無効化（一部リージョン非対応）
export DISABLE_PROMPT_CACHING=1
```

> **注意**: `AWS_REGION`は必須の環境変数です。Claude Codeは`.aws`設定ファイルからこの設定を読み取りません。

**ステップ4: モデルバージョンのピン留め**

```bash
# クロスリージョン推論プロファイルIDを使用（us.プレフィックス）
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'

# カスタムモデル指定
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-6'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'

# Application Inference Profile ARNを使用する場合
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'
```

ピン留めしない場合のデフォルト：

| モデルタイプ | デフォルト値 |
|------------|-------------|
| プライマリモデル | `global.anthropic.claude-sonnet-4-6` |
| 高速モデル | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |

#### IAM設定

Claude Code用に必要な最小IAMポリシー：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowModelAndInferenceProfileAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListInferenceProfiles"
      ],
      "Resource": [
        "arn:aws:bedrock:*:*:inference-profile/*",
        "arn:aws:bedrock:*:*:application-inference-profile/*",
        "arn:aws:bedrock:*:*:foundation-model/*"
      ]
    },
    {
      "Sid": "AllowMarketplaceSubscription",
      "Effect": "Allow",
      "Action": [
        "aws-marketplace:ViewSubscriptions",
        "aws-marketplace:Subscribe"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:CalledViaLast": "bedrock.amazonaws.com"
        }
      }
    }
  ]
}
```

> **推奨**: コスト追跡とアクセス制御を簡素化するため、Claude Code専用のAWSアカウントを作成する。

#### AWS Guardrails（コンテンツフィルタリング）

[Amazon Bedrock Guardrails](https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html)でコンテンツフィルタリングを実装できます：

1. Amazon Bedrockコンソールでガードレールを作成してバージョンを公開
2. `settings.json`にガードレールヘッダーを追加：

```json
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "X-Amzn-Bedrock-GuardrailIdentifier: your-guardrail-id\nX-Amzn-Bedrock-GuardrailVersion: 1"
  }
}
```

> **注意**: クロスリージョン推論プロファイルを使用する場合は、ガードレールでもCross-Region inferenceを有効化する。

#### トラブルシューティング

| エラー | 対処法 |
|-------|-------|
| リージョンエラー | `aws bedrock list-inference-profiles --region your-region`でモデル可用性を確認 |
| "on-demand throughput isn't supported" | [推論プロファイル](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)IDとしてモデルを指定 |
| 認証情報エラー | `awsAuthRefresh`設定で自動更新を構成 |

---

### Google Vertex AI

#### 前提条件

- 請求が有効なGoogle Cloud Platform (GCP)アカウント
- Vertex AI APIが有効なGCPプロジェクト
- 対象Claudeモデルへのアクセス権
- Google Cloud SDK（`gcloud`）インストール・設定済み
- 希望リージョンでのクォータ割り当て

#### セットアップ手順

**ステップ1: Vertex AI APIの有効化**

```bash
# プロジェクトIDを設定
gcloud config set project YOUR-PROJECT-ID

# Vertex AI APIを有効化
gcloud services enable aiplatform.googleapis.com
```

**ステップ2: モデルアクセスのリクエスト**

1. [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)にアクセス
2. "Claude"モデルを検索
3. 希望モデル（例：Claude Sonnet 4.6）へのアクセスをリクエスト
4. 承認を待つ（24〜48時間かかる場合あり）

**ステップ3: GCP認証情報の設定**

Claude CodeはGoogle Cloudの標準認証を使用します：

```bash
# Application Default Credentialsで認証（ローカル開発）
gcloud auth application-default login
```

> **注意**: Claude Codeは`ANTHROPIC_VERTEX_PROJECT_ID`環境変数のプロジェクトIDを自動的に使用します。オーバーライドするには`GCLOUD_PROJECT`・`GOOGLE_CLOUD_PROJECT`・`GOOGLE_APPLICATION_CREDENTIALS`のいずれかを設定します。

**ステップ4: Claude Codeの設定**

```bash
# Vertex AI統合を有効化
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# オプション: プロンプトキャッシュを無効化
export DISABLE_PROMPT_CACHING=1

# グローバルエンドポイント非対応モデルのリージョンを個別指定
export VERTEX_REGION_CLAUDE_3_5_HAIKU=us-east5
export VERTEX_REGION_CLAUDE_3_5_SONNET=us-east5
export VERTEX_REGION_CLAUDE_3_7_SONNET=us-east5
export VERTEX_REGION_CLAUDE_4_0_OPUS=europe-west1
export VERTEX_REGION_CLAUDE_4_0_SONNET=us-east5
export VERTEX_REGION_CLAUDE_4_1_OPUS=europe-west1
```

#### リージョン設定

Claude Codeはグローバルエンドポイントとリージョナルエンドポイントの両方に対応しています：

> **注意**: Vertex AIはすべてのリージョンやグローバルエンドポイントでClaude Codeのデフォルトモデルをサポートしているわけではありません。サポートされているリージョンへの切り替え、リージョナルエンドポイントの使用、またはサポートされているモデルの指定が必要な場合があります。

**ステップ5: モデルバージョンのピン留め**

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'

# カスタムモデル指定
export ANTHROPIC_MODEL='claude-opus-4-6'
export ANTHROPIC_SMALL_FAST_MODEL='claude-haiku-4-5@20251001'
```

ピン留めしない場合のデフォルト：

| モデルタイプ | デフォルト値 |
|------------|-------------|
| プライマリモデル | `claude-sonnet-4-6` |
| 高速モデル | `claude-haiku-4-5@20251001` |

#### IAM設定

`roles/aiplatform.user`ロールには必要なパーミッションが含まれています：

- `aiplatform.endpoints.predict` - モデル呼び出しとトークンカウントに必要

より制限的なパーミッションが必要な場合は、上記パーミッションのみを持つカスタムロールを作成します。

> **推奨**: コスト追跡とアクセス制御を簡素化するため、Claude Code専用のGCPプロジェクトを作成する。

#### 1Mトークンコンテキストウィンドウ

Claude Sonnet 4とSonnet 4.6はVertex AIで1Mトークンコンテキストウィンドウをサポートしています（ベータ版）。

#### トラブルシューティング

| エラー | 対処法 |
|-------|-------|
| クォータ問題 | Cloud Consoleで現在のクォータを確認、または増加リクエストを送信 |
| 404 "model not found" | Model Gardenでモデルが有効化されているか確認。グローバルエンドポイント非対応の場合は`VERTEX_REGION_<MODEL_NAME>`でリージョンを指定 |
| 429エラー | リージョナルエンドポイントでプライマリモデルとHaikuモデルが選択リージョンでサポートされているか確認。`CLOUD_ML_REGION=global`への切り替えも検討 |

---

### Microsoft Foundry

#### 前提条件

- Microsoft Foundryへのアクセス権を持つAzureサブスクリプション
- Foundryリソースとデプロイメントを作成するRBACパーミッション
- Azure CLI（オプション、ローカル認証で必要な場合のみ）

#### セットアップ手順

**ステップ1: Microsoft Foundryリソースのプロビジョニング**

1. [Microsoft Foundryポータル](https://ai.azure.com/)にアクセス
2. 新しいリソースを作成し、リソース名をメモ
3. 以下のClaudeモデルのデプロイメントを作成：
   - Claude Opus
   - Claude Sonnet
   - Claude Haiku

**ステップ2: Azure認証情報の設定**

2種類の認証方式から選択できます：

**Option A: APIキー認証**

```bash
# Foundryポータルで「Endpoints and keys」セクションからAPIキーを取得
export ANTHROPIC_FOUNDRY_API_KEY=your-azure-api-key
```

**Option B: Microsoft Entra ID認証**

`ANTHROPIC_FOUNDRY_API_KEY`が未設定の場合、Claude CodeはAzure SDKの[デフォルト認証チェーン](https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/credential-chains#defaultazurecredential-overview)を自動的に使用します。

ローカル環境では一般的にAzure CLIを使用：

```bash
az login
```

> **注意**: Microsoft Foundryを使用する場合、認証はAzureの認証情報で処理されるため`/login`と`/logout`コマンドは無効になります。

**ステップ3: Claude Codeの設定**

```bash
# Microsoft Foundry統合を有効化
export CLAUDE_CODE_USE_FOUNDRY=1

# Azureリソース名を設定（{resource}を実際のリソース名に置換）
export ANTHROPIC_FOUNDRY_RESOURCE={resource}

# または完全なベースURLを指定
# export ANTHROPIC_FOUNDRY_BASE_URL=https://{resource}.services.ai.azure.com/anthropic
```

**ステップ4: モデルバージョンのピン留め**

モデル変数はステップ1で作成したデプロイメント名に合わせて設定します：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5'
```

> **重要**: Azureデプロイメントを作成する際は「auto-update to latest」ではなく、特定のモデルバージョンを選択してください。

#### Azure RBAC設定

`Azure AI User`と`Cognitive Services User`のデフォルトロールには必要なパーミッションがすべて含まれています。

より制限的なカスタムロールの場合：

```json
{
  "permissions": [
    {
      "dataActions": [
        "Microsoft.CognitiveServices/accounts/providers/*"
      ]
    }
  ]
}
```

#### トラブルシューティング

| エラー | 対処法 |
|-------|-------|
| "Failed to get token from azureADTokenProvider: ChainedTokenCredential authentication failed" | 環境でEntra IDを設定するか、`ANTHROPIC_FOUNDRY_API_KEY`を設定する |

---

### プロバイダー選定ガイド

#### 既存クラウドインフラの活用

| 既存環境 | 推奨プロバイダー |
|---------|----------------|
| AWSを中心に構築 | Amazon Bedrock |
| GCPを中心に構築 | Google Vertex AI |
| Azureを中心に構築 | Microsoft Foundry |
| クラウドに依存しない | Claude for Teams/Enterprise |

#### セキュリティ・コンプライアンス要件

| 要件 | 対応 |
|-----|------|
| AWS IAMポリシー統合 | Amazon Bedrock |
| GCP IAMロール統合 | Google Vertex AI |
| Azure RBAC統合 | Microsoft Foundry |
| コンテンツフィルタリング（AWS Guardrails） | Amazon Bedrock |
| 既存SSOとの統合 | 各プロバイダーのネイティブ認証 |

#### モデルバージョン管理の重要性

すべてのクラウドプロバイダーで**モデルバージョンのピン留めを強く推奨します**：

- ピン留めなし：Anthropicが新モデルをリリースした際、アカウントで未有効化のモデルが参照されユーザーに影響
- ピン留めあり：新モデルリリースに影響を受けず安定した運用が可能

```bash
# 共通のピン留め設定（プロバイダーに応じてモデルIDを調整）
export ANTHROPIC_DEFAULT_OPUS_MODEL='<provider-specific-opus-id>'
export ANTHROPIC_DEFAULT_SONNET_MODEL='<provider-specific-sonnet-id>'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='<provider-specific-haiku-id>'
```

## まとめ

- Amazon BedrockはIAMポリシー・CloudTrail・AWS Guardrailsと統合し、AWSネイティブな環境に最適
- Google Vertex AIは`roles/aiplatform.user`ロールで設定し、グローバルとリージョナルエンドポイントを使い分ける
- Microsoft FoundryはAPIキーまたはEntra ID認証に対応し、Azure RBACで権限管理できる
- 全プロバイダーで`ANTHROPIC_DEFAULT_*_MODEL`によるモデルバージョンのピン留めが必須
- 設定時は`/login`・`/logout`が無効になり、各クラウドの認証情報が優先される
- コスト追跡を簡素化するため、Claude Code専用のクラウドアカウント・プロジェクト・サブスクリプションの作成を推奨

## 公式リファレンス

- [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock) - Bedrock連携の公式ドキュメント
- [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai) - Vertex AI連携の公式ドキュメント
- [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry) - Microsoft Foundry連携の公式ドキュメント
- [Model configuration](https://code.claude.com/docs/en/model-config) - モデルバージョンのピン留め詳細
- [Bedrock IAM documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html) - Bedrock IAM設定
- [Vertex AI IAM documentation](https://cloud.google.com/vertex-ai/docs/general/access-control) - Vertex AI IAM設定
- [Microsoft Foundry RBAC documentation](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry) - Foundry RBAC設定
