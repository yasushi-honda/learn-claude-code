# エンタープライズ導入

> **対応公式ドキュメント**: https://code.claude.com/docs/en/third-party-integrations / https://code.claude.com/docs/en/platforms
> **想定所要時間**: 約60分
> **難易度**: ★★★★☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. エンタープライズ向けデプロイオプション（Teams/Enterprise/Bedrock/Vertex/Foundry）を比較し、組織に最適な選択ができる
2. コーポレートプロキシとLLMゲートウェイの違いと設定方法を理解している
3. カスタムCAやmTLSなどの企業向けネットワーク設定を把握している
4. CLAUDE.mdの3レベル配置とdevcontainerを活用した安全な運用環境を構築できる

---

## 1. デプロイオプションの比較

組織はAnthropicを直接通じて、またはクラウドプロバイダー経由でClaude Codeをデプロイできます。ほとんどの組織には **Claude for Teams** または **Claude for Enterprise** が推奨されます。

### デプロイオプション一覧

| 機能 | Claude for Teams/Enterprise | Anthropic Console | Amazon Bedrock | Google Vertex AI | Microsoft Foundry |
|------|---------------------------|------------------|---------------|----------------|------------------|
| **最適な用途** | ほとんどの組織（推奨） | 個人開発者 | AWSネイティブ展開 | GCPネイティブ展開 | Azureネイティブ展開 |
| **料金** | $150/席（Premium）+ PAYG | PAYG | AWS経由PAYG | GCP経由PAYG | Azure経由PAYG |
| **Prompt caching** | 有効 | 有効 | 有効 | 有効 | 有効 |
| **認証** | Claude.ai SSO/メール | APIキー | AWS認証情報 | GCP認証情報 | Entra ID/APIキー |
| **Web上のClaudeを含む** | 含む | 含まない | 含まない | 含まない | 含まない |
| **エンタープライズ機能** | チーム管理、SSO、使用量監視 | なし | IAMポリシー、CloudTrail | IAMロール、Cloud Audit Logs | RBACポリシー、Azure Monitor |

> **公式ドキュメントより**: すべてのデプロイオプションでPrompt cachingが有効です。

### Claude for Teams

セルフサービスで即座に開始可能。コラボレーション機能・管理ツール・集中課金を含みます。小規模チームに最適です。

### Claude for Enterprise

Teams の機能に加え、SSOとドメインキャプチャー・ロールベースパーミッション・コンプライアンスAPIアクセス・管理ポリシー設定を追加します。セキュリティとコンプライアンス要件を持つ大規模組織に最適です。

### 選択指針

| 要件 | 推奨オプション |
|------|-------------|
| インフラ設定不要で素早く開始したい | Claude for Teams/Enterprise |
| AWS IAMポリシーで管理したい | Amazon Bedrock |
| GCP IAMロールで管理したい | Google Vertex AI |
| Azure RBACで管理したい | Microsoft Foundry |
| Web上のClaudeも必要 | Claude for Teams/Enterprise |

---

## 2. プロキシとゲートウェイの設定

エンタープライズ環境では、コーポレートプロキシやLLMゲートウェイを通じてClaude Codeのトラフィックを管理する必要があります。

### コーポレートプロキシ vs LLMゲートウェイ

| 種別 | 用途 | 設定方法 |
|------|------|---------|
| **コーポレートプロキシ** | セキュリティ監視・コンプライアンス・ネットワークポリシーのために全送信トラフィックをプロキシ経由にする | `HTTPS_PROXY` または `HTTP_PROXY` 環境変数 |
| **LLMゲートウェイ** | 集中的な使用量追跡・カスタムレート制限・集中認証管理のためにClaude Codeとプロバイダーの間に配置 | `ANTHROPIC_BASE_URL` 等の環境変数 |

### Amazon Bedrockでの設定

```bash
# コーポレートプロキシ設定
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export HTTPS_PROXY='https://proxy.example.com:8080'

# LLMゲートウェイ設定
export CLAUDE_CODE_USE_BEDROCK=1
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # ゲートウェイがAWS認証を処理する場合
```

### Google Vertex AIでの設定

```bash
# コーポレートプロキシ設定
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id
export HTTPS_PROXY='https://proxy.example.com:8080'

# LLMゲートウェイ設定
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
```

### Microsoft Foundryでの設定

```bash
# コーポレートプロキシ設定
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource
export ANTHROPIC_FOUNDRY_API_KEY=your-api-key
export HTTPS_PROXY='https://proxy.example.com:8080'

# LLMゲートウェイ設定
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_BASE_URL='https://your-llm-gateway.com/foundry'
export CLAUDE_CODE_SKIP_FOUNDRY_AUTH=1
```

> **ヒント**: `/status` でプロキシとゲートウェイの設定が正しく適用されているか確認できます。

---

## 3. 企業向けネットワーク設定

### カスタムCA（証明書認証局）

企業のSSL検査環境では、カスタム証明書認証局の設定が必要になる場合があります：

```bash
# カスタムCAバンドルを指定
export NODE_EXTRA_CA_CERTS=/path/to/your-corporate-ca-bundle.pem
```

### mTLS（相互TLS）

一部のエンタープライズ環境では双方向TLS認証が必要です。LLMゲートウェイを通じて設定することが一般的です。

---

## 4. 組織運用のベストプラクティス

### CLAUDE.mdの3レベル配置

CLAUDE.mdファイルを複数のレベルに配置することで、組織全体から個人まで一貫した設定管理が可能です：

```
/Library/Application Support/ClaudeCode/CLAUDE.md  <-- macOS全社共通（管理者設定）
/your-repo/CLAUDE.md                                <-- リポジトリレベル（バージョン管理）
~/.claude/CLAUDE.md                                 <-- ユーザーレベル（個人設定）
```

**リポジトリレベルのCLAUDE.md例:**

```markdown
# プロジェクト概要
このリポジトリはeコマースプラットフォームのバックエンドAPIです。

# ビルドコマンド
- `npm run build`: プロジェクトをビルド
- `npm test`: テストを実行
- `npm run lint`: リントチェック

# コードスタイル
- TypeScriptを使用（strictモード有効）
- 関数型プログラミングスタイルを優先
- エラーハンドリングは例外より Result型を使用

# 貢献ガイドライン
- PRはmainへの直接pushを禁止（featureブランチ必須）
- コードレビューは最低2名の承認が必要
```

### 開発コンテナ（devcontainer）の活用

devcontainersはClaude Codeの追加分離環境を提供します：

- センシティブなコードへの一貫したセキュリティ境界
- チームメンバー全員が同一の環境を使用
- プロジェクト間でのClaude Codeパーミッションの分離

詳細は [devcontainerドキュメント](https://code.claude.com/docs/en/devcontainer) を参照してください。

### モデルバージョンのピン留め

クラウドプロバイダー経由でデプロイする場合、特定のモデルバージョンをピン留めすることを強く推奨します：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

ピン留めしない場合、Anthropicが新しいモデルをリリースした際に、まだアカウントで有効化されていないモデルが参照されてユーザーに影響する可能性があります。

### ガイド付きの導入ステップ

新しいユーザーへの推奨順序：

1. まずコードベースのQ&Aから始める
2. 小さなバグ修正や機能追加に試用する
3. 計画を立てさせる（Plan Mode等）
4. 提案が外れている場合はフィードバックを与える
5. 慣れるにつれて、より自律的な実行を許可する

### セキュリティポリシーの設定

セキュリティチームはClaude Codeが実行できること・できないことについての管理パーミッションを設定でき、ローカル設定でオーバーライドすることはできません。詳細は [組織管理設定](05-managed-settings.md) を参照してください。

### MCPを活用した統合

MCPはClaude Codeにチケット管理システムやエラーログなどの追加情報を提供する優れた方法です。組織の中央チームがMCPサーバーを設定し、`.mcp.json` をコードベースにチェックインすることで、すべてのユーザーが恩恵を受けられます。

---

## 5. 導入後のステップ

組織への展開後、以下のステップを実施します：

1. **チームへの展開**: インストール手順を共有し、チームメンバーが [Claude Codeをインストール](https://code.claude.com/docs/en/setup) して認証できるようにする
2. **共有設定のセットアップ**: リポジトリにCLAUDE.mdファイルを作成して、Claude Codeがコードベースとコーディング標準を理解できるようにする
3. **パーミッションの設定**: 環境でClaudeが実行できること・できないことを定義する [セキュリティ設定](https://code.claude.com/docs/en/security) をレビューする
4. **MCPサーバーの配備**: チーム共通のMCPサーバーを `.mcp.json` で配布する
5. **監視の設定**: OpenTelemetryメトリクスやAnalyticsダッシュボードで使用状況を追跡する

---

## ハンズオン演習

### 演習 1: デプロイオプションの評価

**目的**: 架空の組織要件に基づいて最適なデプロイオプションを選択する

**前提条件**: なし（座学演習）

**手順**:

1. 以下の架空シナリオを読む：
   - 従業員数500名のソフトウェア企業
   - 既存のAWSインフラ（IAM、CloudTrail導入済み）
   - SOC 2コンプライアンス要件あり
   - 開発チームは50名、3つのチームに分かれている
2. 各デプロイオプションのメリット・デメリットを比較表にまとめる
3. 推奨するデプロイオプションとその根拠を記述する
4. 導入時のセキュリティ要件チェックリストを作成する

**期待される結果**: 組織要件に基づいた論理的なデプロイオプション選択と、根拠の明確な記述

### 演習 2: プロキシ設定の実践

**目的**: コーポレートプロキシ環境を想定した設定を行う

**前提条件**: Claude Codeがインストール済みであること

**手順**:

1. 以下の環境変数を設定する（テスト用、実際のプロキシは不要）：
   ```bash
   export HTTPS_PROXY='https://proxy.example.com:8080'
   export NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.pem
   ```
2. Claude Codeを起動し、`/status` で設定を確認する
3. 設定が正しく認識されているか確認する
4. 環境変数を元に戻す

**期待される結果**: `/status` でプロキシ設定が表示されることを確認

### 演習 3: CLAUDE.mdの設計

**目的**: 組織向けのCLAUDE.mdを3レベルで設計する

**前提条件**: テスト用のプロジェクトディレクトリがあること

**手順**:

1. ユーザーレベルの `~/.claude/CLAUDE.md` を作成する：
   ```markdown
   # 個人設定
   - 日本語でコミュニケーション
   - コミットメッセージは英語
   ```
2. プロジェクトレベルの `CLAUDE.md` を作成する：
   ```markdown
   # プロジェクト設定
   - TypeScript strictモード
   - テストランナー: vitest
   - `npm test` でテスト実行
   ```
3. Claude Codeを起動して、両方の設定が読み込まれていることを確認する

**期待される結果**: ユーザーレベルとプロジェクトレベルの両方の設定がClaude Codeに反映される

---

## よくある質問

**Q: Claude for TeamsとClaude for Enterpriseの主な違いは何ですか？**
A: Enterpriseは Teams の機能に加え、SSO/SAML認証・ドメインキャプチャー・ロールベースパーミッション・コンプライアンスAPIアクセス・管理ポリシー設定（サーバー管理設定を含む）を提供します。セキュリティとコンプライアンス要件が厳しい組織にはEnterpriseが適しています。

**Q: クラウドプロバイダー経由とAnthropic直接の両方を使い分けることは可能ですか？**
A: はい。環境変数で切り替えることができます。例えば、本番環境ではBedrockを使用し、開発環境ではAnthropic直接接続を使用するといった構成が可能です。

**Q: LLMゲートウェイを導入するメリットは何ですか？**
A: 集中的な使用量追跡、カスタムレート制限、集中認証管理、監査ログの統合、コスト制御が可能になります。特に大規模チームでのコスト管理とコンプライアンス要件の充足に有効です。

**Q: devcontainerとサンドボックスはどちらを使うべきですか？**
A: サンドボックスは軽量でOS組み込みの分離を提供します。devcontainerはDockerベースの完全な環境分離を提供し、チーム全員が同一環境を使用できます。両方を併用することも可能で、より強い分離が必要な場合に推奨されます。

---

## まとめ

この章で学んだ重要ポイント：

- ほとんどの組織にはClaude for TeamsまたはClaude for Enterpriseが最適（インフラ設定不要、Prompt caching有効）
- 特定のクラウドインフラ要件がある場合はAmazon Bedrock・Google Vertex AI・Microsoft Foundryを選択
- コーポレートプロキシは `HTTPS_PROXY` で設定し、LLMゲートウェイは各プロバイダーの `BASE_URL` 環境変数で設定する
- CLAUDE.mdを組織・リポジトリ・ユーザーの3レベルで配置することで一貫した運用が可能
- クラウドプロバイダー経由の場合はモデルバージョンをピン留めして安定性を確保する

## 次のステップ

次の章「[クラウドプロバイダー連携](04-cloud-providers.md)」では、Amazon Bedrock・Google Vertex AI・Microsoft Foundryそれぞれの詳細なセットアップ手順、認証設定、トラブルシューティングを学びます。

---

> **公式リファレンス**
> - [Enterprise deployment overview](https://code.claude.com/docs/en/third-party-integrations) - エンタープライズ導入の公式ドキュメント
> - [Authentication](https://code.claude.com/docs/en/authentication) - 認証方式の詳細
> - [Network configuration](https://code.claude.com/docs/en/network-config) - ネットワーク設定詳細
> - [LLM gateway configuration](https://code.claude.com/docs/en/llm-gateway) - LLMゲートウェイ設定
> - [devcontainer](https://code.claude.com/docs/en/devcontainer) - 開発コンテナの設定
> - [Memory and CLAUDE.md](https://code.claude.com/docs/en/memory) - CLAUDE.mdの活用
> - [Model configuration](https://code.claude.com/docs/en/model-config) - モデルバージョンのピン留め
