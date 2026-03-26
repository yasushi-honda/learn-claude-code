# クラウドプロバイダー連携

> **対応公式ドキュメント**: https://code.claude.com/docs/en/bedrock-vertex-proxies
> **想定所要時間**: 約60分
> **難易度**: ★★★★★
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Amazon Bedrock・Google Vertex AI・Microsoft Foundryそれぞれの認証設定とセットアップ手順を実行できる
2. 各プロバイダーのIAM/RBAC設定とモデルバージョンのピン留めができる
3. LLMゲートウェイ経由での接続設定（`BASE_URL`・`SKIP_AUTH`）を構成できる
4. プロバイダー固有のトラブルシューティングを行える

---

## 1. プロバイダー比較と選択

### 機能比較

| 機能 | Amazon Bedrock | Google Vertex AI | Microsoft Foundry |
|------|---------------|-----------------|-------------------|
| **クラウド基盤** | AWS | GCP | Azure |
| **認証方式** | IAM、APIキー、SSO | GCP認証（WIF対応） | Entra ID、APIキー |
| **コスト追跡** | AWS Cost Explorer | GCP課金 | Azure Cost Management |
| **IAM統合** | IAMポリシー | `roles/aiplatform.user` | `Azure AI User` ロール |
| **監査ログ** | CloudTrail | Cloud Audit Logs | Azure Monitor |
| **推論プロファイル** | クロスリージョン推論 | グローバル・リージョナル | - |
| **コンテンツフィルター** | AWS Guardrails | - | - |

### 選択指針

| 既存環境 | 推奨プロバイダー |
|---------|----------------|
| AWSを中心に構築 | Amazon Bedrock |
| GCPを中心に構築 | Google Vertex AI |
| Azureを中心に構築 | Microsoft Foundry |
| クラウドに依存しない | Claude for Teams/Enterprise |

---

## 2. Amazon Bedrock

### 前提条件

- Bedrockアクセスが有効なAWSアカウント
- 対象Claudeモデルへのアクセス権
- 適切なIAMパーミッション

### セットアップ手順

**ステップ1: ユースケース詳細の提出**

初回利用前に一度だけ必要な手続きです。[Amazon Bedrock コンソール](https://console.aws.amazon.com/bedrock/) で Chat/Text playground を選択し、Anthropicモデルを選択するとユースケースフォームが表示されます。

**ステップ2: AWS認証情報の設定**

5つの認証方式から選択できます：

```bash
# Option A: AWS CLI設定
aws configure

# Option B: 環境変数（アクセスキー）
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_SESSION_TOKEN=your-session-token

# Option C: SSOプロファイル
aws sso login --profile=<your-profile-name>
export AWS_PROFILE=your-profile-name

# Option D: AWS Management Consoleの認証情報
aws login

# Option E: Bedrock APIキー（最もシンプル）
export AWS_BEARER_TOKEN_BEDROCK=your-bedrock-api-key
```

**認証情報の自動更新設定:**

```json
// settings.json
{
  "awsAuthRefresh": "aws sso login --profile myprofile",
  "env": {
    "AWS_PROFILE": "myprofile"
  }
}
```

**ステップ3: Claude Codeの設定**

```bash
# 必須設定
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# オプション: Haiku用のリージョンを別途設定
export ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION=us-west-2

# オプション: プロンプトキャッシュを無効化（一部リージョン非対応）
export DISABLE_PROMPT_CACHING=1
```

> **重要**: `AWS_REGION` は必須の環境変数です。Claude Codeは `.aws` 設定ファイルからこの設定を読み取りません。

**ステップ4: モデルバージョンのピン留め**

```bash
# クロスリージョン推論プロファイルIDを使用
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'

# Application Inference Profile ARNを使用する場合
export ANTHROPIC_MODEL='arn:aws:bedrock:us-east-2:your-account-id:application-inference-profile/your-model-id'
```

ピン留めしない場合のデフォルト：

| モデルタイプ | デフォルト値 |
|------------|-------------|
| プライマリモデル | `global.anthropic.claude-sonnet-4-6` |
| 高速モデル | `us.anthropic.claude-haiku-4-5-20251001-v1:0` |

### LLMゲートウェイ設定

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # ゲートウェイがAWS認証を処理する場合
```

### IAM設定

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

### AWS Guardrails（コンテンツフィルタリング）

```json
// settings.json にガードレールヘッダーを追加
{
  "env": {
    "ANTHROPIC_CUSTOM_HEADERS": "X-Amzn-Bedrock-GuardrailIdentifier: your-guardrail-id\nX-Amzn-Bedrock-GuardrailVersion: 1"
  }
}
```

### トラブルシューティング

| エラー | 対処法 |
|-------|-------|
| リージョンエラー | `aws bedrock list-inference-profiles --region your-region` でモデル可用性を確認 |
| "on-demand throughput isn't supported" | 推論プロファイルIDとしてモデルを指定 |
| 認証情報エラー | `awsAuthRefresh` 設定で自動更新を構成 |

---

## 3. Google Vertex AI

### 前提条件

- 請求が有効なGCPアカウント
- Vertex AI APIが有効なGCPプロジェクト
- Google Cloud SDK（`gcloud`）インストール・設定済み

### セットアップ手順

**ステップ1: Vertex AI APIの有効化**

```bash
gcloud config set project YOUR-PROJECT-ID
gcloud services enable aiplatform.googleapis.com
```

**ステップ2: モデルアクセスのリクエスト**

[Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden) で希望のClaudeモデルへのアクセスをリクエストします（承認に24-48時間かかる場合あり）。

**ステップ3: GCP認証情報の設定**

```bash
# Application Default Credentialsで認証（ローカル開発）
gcloud auth application-default login
```

**ステップ4: Claude Codeの設定**

```bash
# 必須設定
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID

# グローバルエンドポイント非対応モデルのリージョンを個別指定
export VERTEX_REGION_CLAUDE_4_0_OPUS=europe-west1
export VERTEX_REGION_CLAUDE_4_0_SONNET=us-east5
export VERTEX_REGION_CLAUDE_4_1_OPUS=europe-west1
```

**ステップ5: モデルバージョンのピン留め**

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5@20251001'
```

ピン留めしない場合のデフォルト：

| モデルタイプ | デフォルト値 |
|------------|-------------|
| プライマリモデル | `claude-sonnet-4-6` |
| 高速モデル | `claude-haiku-4-5@20251001` |

### LLMゲートウェイ設定

```bash
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
```

### IAM設定

`roles/aiplatform.user` ロールに必要なパーミッションが含まれています：

- `aiplatform.endpoints.predict` - モデル呼び出しとトークンカウントに必要

### トラブルシューティング

| エラー | 対処法 |
|-------|-------|
| クォータ問題 | Cloud Consoleで現在のクォータを確認、増加リクエストを送信 |
| 404 "model not found" | Model Gardenでモデルが有効化されているか確認。`VERTEX_REGION_<MODEL_NAME>` でリージョンを指定 |
| 429エラー | リージョナルエンドポイントの確認、`CLOUD_ML_REGION=global` への切り替えを検討 |

---

## 4. Microsoft Foundry

### 前提条件

- Microsoft Foundryへのアクセス権を持つAzureサブスクリプション
- Foundryリソースとデプロイメントを作成するRBACパーミッション

### セットアップ手順

**ステップ1: Foundryリソースのプロビジョニング**

[Microsoft Foundryポータル](https://ai.azure.com/) で新しいリソースを作成し、Claude Opus・Sonnet・Haikuのデプロイメントを作成します。

**ステップ2: Azure認証情報の設定**

```bash
# Option A: APIキー認証
export ANTHROPIC_FOUNDRY_API_KEY=your-azure-api-key

# Option B: Microsoft Entra ID認証（APIキーが未設定の場合に自動使用）
az login
```

> **注意**: Microsoft Foundry使用時、`/login` と `/logout` コマンドは無効になります。

**ステップ3: Claude Codeの設定**

```bash
# 必須設定
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE={resource}

# または完全なベースURLを指定
# export ANTHROPIC_FOUNDRY_BASE_URL=https://{resource}.services.ai.azure.com/anthropic
```

**ステップ4: モデルバージョンのピン留め**

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5'
```

> **重要**: Azureデプロイメント作成時は「auto-update to latest」ではなく、特定のモデルバージョンを選択してください。

### LLMゲートウェイ設定

```bash
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_BASE_URL='https://your-llm-gateway.com/foundry'
export CLAUDE_CODE_SKIP_FOUNDRY_AUTH=1
```

### Azure RBAC設定

`Azure AI User` と `Cognitive Services User` のデフォルトロールに必要なパーミッションが含まれています。

カスタムロールの場合：

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

### トラブルシューティング

| エラー | 対処法 |
|-------|-------|
| "ChainedTokenCredential authentication failed" | Entra IDの設定を確認するか、`ANTHROPIC_FOUNDRY_API_KEY` を設定する |

---

## 5. 設定確認と共通事項

### `/status` での設定確認

すべてのプロバイダーで `/status` コマンドを使用して、現在の接続設定を確認できます：

```
/status
```

プロバイダー名、リージョン、モデルバージョン、プロキシ設定などが表示されます。

### モデルバージョン管理の重要性

すべてのクラウドプロバイダーでモデルバージョンのピン留めを強く推奨します：

- **ピン留めなし**: Anthropicが新モデルをリリースした際、アカウントで未有効化のモデルが参照されユーザーに影響
- **ピン留めあり**: 新モデルリリースに影響を受けず安定した運用が可能

```bash
# 共通のピン留め設定（プロバイダーに応じてモデルIDを調整）
export ANTHROPIC_DEFAULT_OPUS_MODEL='<provider-specific-opus-id>'
export ANTHROPIC_DEFAULT_SONNET_MODEL='<provider-specific-sonnet-id>'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='<provider-specific-haiku-id>'
```

---

## ハンズオン演習

### 演習 1: 環境変数の設定シミュレーション

**目的**: 各プロバイダーの環境変数設定を理解する

**前提条件**: シェル環境が利用可能であること

**手順**:

1. Amazon Bedrock用の環境変数をシェルスクリプトとして作成する：
   ```bash
   # bedrock-setup.sh
   export CLAUDE_CODE_USE_BEDROCK=1
   export AWS_REGION=us-east-1
   export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
   export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
   ```
2. 同様にGoogle Vertex AI用のスクリプトを作成する
3. 同様にMicrosoft Foundry用のスクリプトを作成する
4. 各スクリプトの違いを比較する

**期待される結果**: 3つのプロバイダーの設定パターンの違いを理解できる

### 演習 2: IAMポリシーの設計

**目的**: Bedrock用の最小権限IAMポリシーを理解する

**前提条件**: AWSの基礎知識があること

**手順**:

1. 本章で紹介されたIAMポリシーを確認する
2. 自組織の要件に応じてカスタマイズする点を特定する：
   - 特定リージョンのみ許可する場合のResource ARN修正
   - 特定モデルのみ許可する場合のCondition追加
3. ポリシーをJSONで記述する

**期待される結果**: 最小権限の原則に基づいたカスタムIAMポリシーが設計できる

### 演習 3: トラブルシューティング演習

**目的**: よくあるエラーの診断手順を練習する

**前提条件**: なし（座学演習）

**手順**:

1. 以下のエラーシナリオの原因と対処法を記述する：
   - Bedrock: "on-demand throughput isn't supported" エラー
   - Vertex AI: 404 "model not found" エラー
   - Foundry: "ChainedTokenCredential authentication failed" エラー
2. 各エラーの診断コマンドを列挙する
3. `/status` で確認すべき項目をリストアップする

**期待される結果**: エラーメッセージから原因を特定し、適切な対処ができるようになる

---

## よくある質問

**Q: Bedrockでクロスリージョン推論プロファイルを使うべきですか？**
A: はい。クロスリージョン推論プロファイル（`us.anthropic.claude-*` のプレフィックス）を使用すると、複数のAWSリージョンにわたって推論リクエストが分散され、可用性とスループットが向上します。特にプロダクション環境では推奨されます。

**Q: Vertex AIでグローバルエンドポイントとリージョナルエンドポイントのどちらを使うべきですか？**
A: グローバルエンドポイント（`CLOUD_ML_REGION=global`）はシンプルですが、すべてのモデルがサポートされているわけではありません。特定のモデルがグローバルで利用できない場合は、`VERTEX_REGION_<MODEL_NAME>` でリージョナルエンドポイントを個別に指定してください。

**Q: 複数のプロバイダーを切り替えて使用できますか？**
A: はい。環境変数を切り替えることで可能です。ただし、`CLAUDE_CODE_USE_BEDROCK`・`CLAUDE_CODE_USE_VERTEX`・`CLAUDE_CODE_USE_FOUNDRY` は排他的であり、同時に有効にしないでください。

**Q: コスト追跡を簡素化する方法はありますか？**
A: Claude Code専用のAWSアカウント・GCPプロジェクト・Azureサブスクリプションを作成することを推奨します。これにより、Claude Code関連のコストを他のワークロードから分離して追跡できます。

**Q: Prompt cachingはすべてのプロバイダーで利用可能ですか？**
A: はい。すべてのデプロイオプション（Claude for Teams/Enterprise、Bedrock、Vertex AI、Foundry）でPrompt cachingが有効です。一部リージョンで非対応の場合は `DISABLE_PROMPT_CACHING=1` で無効化できます。

---

## まとめ

この章で学んだ重要ポイント：

- Amazon BedrockはIAMポリシー・CloudTrail・AWS Guardrailsと統合し、AWSネイティブ環境に最適
- Google Vertex AIは `roles/aiplatform.user` ロールで設定し、グローバルとリージョナルエンドポイントを使い分ける
- Microsoft FoundryはAPIキーまたはEntra ID認証に対応し、Azure RBACで権限管理できる
- 全プロバイダーで `ANTHROPIC_DEFAULT_*_MODEL` によるモデルバージョンのピン留めが重要
- 各プロバイダーでLLMゲートウェイ経由の接続が可能（`BASE_URL` + `SKIP_AUTH` 環境変数）

## 次のステップ

次の章「[組織管理設定](05-managed-settings.md)」では、サーバー管理設定とエンドポイント管理設定を使って、組織全体のセキュリティポリシーを一元管理する方法を学びます。

---

> **公式リファレンス**
> - [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock) - Bedrock連携の公式ドキュメント
> - [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai) - Vertex AI連携の公式ドキュメント
> - [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry) - Microsoft Foundry連携の公式ドキュメント
> - [Bedrock & Vertex proxies](https://code.claude.com/docs/en/bedrock-vertex-proxies) - プロキシとゲートウェイの設定
> - [Model configuration](https://code.claude.com/docs/en/model-config) - モデルバージョンのピン留め詳細
