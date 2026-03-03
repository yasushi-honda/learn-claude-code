# エンタープライズ導入

> 対応する公式ドキュメント: [Enterprise deployment overview](https://code.claude.com/docs/en/third-party-integrations)

## 学習目標

- エンタープライズ向けデプロイオプション（Teams/Enterprise/Bedrock/Vertex等）を比較できる
- コーポレートプロキシとLLMゲートウェイの違いと設定方法を理解する
- ネットワーク設定（プロキシ・カスタムCA・mTLS）の要点を把握する
- 開発コンテナ（devcontainer）を活用した安全な実行環境を構築できる
- 組織展開のベストプラクティスを理解する

## 概要

組織はAnthropicを直接通じて、またはクラウドプロバイダー経由でClaude Codeをデプロイできます。ほとんどの組織には、Claude for TeamsまたはClaude for Enterpriseが最良のエクスペリエンスを提供します。チームメンバーは単一のサブスクリプションでClaude CodeとWeb上のClaudeの両方にアクセスでき、集中課金とインフラセットアップが不要です。

## 本文

### デプロイオプションの比較

| 機能 | Claude for Teams/Enterprise | Anthropic Console | Amazon Bedrock | Google Vertex AI | Microsoft Foundry |
|------|---------------------------|------------------|---------------|----------------|------------------|
| **最適な用途** | ほとんどの組織（推奨） | 個人開発者 | AWSネイティブ展開 | GCPネイティブ展開 | Azureネイティブ展開 |
| **料金** | Teams: $150/席（Premium）+ PAYG<br>Enterprise: 要相談 | PAYG | AWS経由PAYG | GCP経由PAYG | Azure経由PAYG |
| **認証** | Claude.ai SSOまたはメール | APIキー | APIキーまたはAWS認証情報 | GCP認証情報 | APIキーまたはMicrosoft Entra ID |
| **コスト追跡** | 使用量ダッシュボード | 使用量ダッシュボード | AWS Cost Explorer | GCP課金 | Azure Cost Management |
| **Web上のClaudeを含む** | 含む | 含まない | 含まない | 含まない | 含まない |
| **エンタープライズ機能** | チーム管理、SSO、使用量監視 | なし | IAMポリシー、CloudTrail | IAMロール、Cloud Audit Logs | RBACポリシー、Azure Monitor |

#### Claude for Teams

セルフサービスで、コラボレーション機能・管理ツール・課金管理を含みます。すぐに開始する必要がある小規模チームに最適です。

#### Claude for Enterprise

SSOとドメインキャプチャー・ロールベースのパーミッション・コンプライアンスAPIアクセス・組織全体のClaude Code設定を展開するための管理ポリシー設定を追加します。セキュリティとコンプライアンス要件を持つ大規模組織に最適です。

### プロキシとゲートウェイの設定

#### コーポレートプロキシ vs LLMゲートウェイ

| 種別 | 用途 | 設定 |
|------|------|------|
| **コーポレートプロキシ** | セキュリティ監視・コンプライアンス・ネットワークポリシーのために全送信トラフィックをプロキシ経由にする | `HTTPS_PROXY`または`HTTP_PROXY`環境変数 |
| **LLMゲートウェイ** | チームにわたる集中的な使用量追跡・カスタムレート制限・集中認証管理が必要な場合にClaude Codeとクラウドプロバイダーの間に配置するサービス | `ANTHROPIC_BASE_URL`・`ANTHROPIC_BEDROCK_BASE_URL`・`ANTHROPIC_VERTEX_BASE_URL`環境変数 |

#### Amazon Bedrockでのコーポレートプロキシ設定

```bash
# Bedrockを有効化
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# コーポレートプロキシを設定
export HTTPS_PROXY='https://proxy.example.com:8080'
```

#### Amazon BedrockでのLLMゲートウェイ設定

```bash
# Bedrockを有効化
export CLAUDE_CODE_USE_BEDROCK=1

# LLMゲートウェイを設定
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # ゲートウェイがAWS認証を処理する場合
```

#### Microsoft Foundryでのコーポレートプロキシ設定

```bash
# Microsoft Foundryを有効化
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource
export ANTHROPIC_FOUNDRY_API_KEY=your-api-key  # Entra ID認証の場合は省略

# コーポレートプロキシを設定
export HTTPS_PROXY='https://proxy.example.com:8080'
```

#### Google Vertex AIでのコーポレートプロキシ設定

```bash
# Vertexを有効化
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# コーポレートプロキシを設定
export HTTPS_PROXY='https://proxy.example.com:8080'
```

> **ヒント**: `/status`でプロキシとゲートウェイの設定が正しく適用されているか確認できます。

### 企業向けネットワーク設定

#### カスタムCAの設定

企業のSSL検査環境では、カスタム証明書認証局（CA）の設定が必要になる場合があります：

```bash
# カスタムCAバンドルを指定
export NODE_EXTRA_CA_CERTS=/path/to/your-corporate-ca-bundle.pem
```

#### mTLS（相互TLS）

一部のエンタープライズ環境では双方向TLS認証が必要です。LLMゲートウェイを通じて設定することが一般的です。

### 開発コンテナ（devcontainer）の活用

devcontainersはClaude Codeの追加分離環境を提供します。特に以下のユースケースで有効です：

- センシティブなコードへの一貫したセキュリティ境界
- チームメンバー全員が同一の環境を使用
- プロジェクト間でのClaude Codeパーミッションの分離

詳細は[devcontainerドキュメント](https://code.claude.com/docs/en/devcontainer)を参照してください。

### 組織向けベストプラクティス

#### ドキュメントとメモリへの投資

CLAUDE.mdファイルを複数のレベルに配置することを強く推奨します：

```
/Library/Application Support/ClaudeCode/CLAUDE.md  ← macOS全社共通（管理者設定）
/your-repo/CLAUDE.md                               ← リポジトリレベル（バージョン管理）
~/.claude/CLAUDE.md                                ← ユーザーレベル（個人設定）
```

**リポジトリレベルのCLAUDE.md例：**

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

#### シンプルな展開

カスタム開発環境がある場合、Claude Codeを「ワンクリック」でインストールできる仕組みを作ることが組織全体での採用拡大の鍵です。

#### ガイド付きの使用を最初に推奨

新しいユーザーには以下を勧めます：
1. まずコードベースのQ&Aから始める
2. 小さなバグ修正や機能追加に試用する
3. 計画を立てさせる（`/impl-plan`等）
4. 提案が外れている場合はフィードバックを与える
5. 慣れるにつれて、より自律的な実行を許可する

#### クラウドプロバイダーでのモデルバージョン固定

Bedrock・Vertex AI・Foundry経由でデプロイする場合、特定のモデルバージョンをピン留めすることを強く推奨します：

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

ピン留めしないと、Anthropicが新しいモデルをリリースしたとき（まだアカウントで有効化されていないモデル）に既存ユーザーが影響を受ける可能性があります。

#### セキュリティポリシーの設定

セキュリティチームはClaude Codeが実行できること・実行できないことについての管理パーミッションを設定でき、ローカル設定で上書きすることはできません。詳細は[サーバー管理設定](05-managed-settings.md)を参照してください。

#### MCPを活用した統合

MCPはClaude Codeにチケット管理システムやエラーログなどの追加情報を提供する優れた方法です。組織の中央チームがMCPサーバーを設定し、`.mcp.json`をコードベースにチェックインすることで、すべてのユーザーが恩恵を受けられます。

### 導入後のステップ

1. **チームへの展開**: インストール手順を共有し、チームメンバーが[Claude Codeをインストール](https://code.claude.com/docs/en/setup)して認証できるようにする
2. **共有設定のセットアップ**: リポジトリにCLAUDE.mdファイルを作成して、Claude Codeがコードベースとコーディング標準を理解できるようにする
3. **パーミッションの設定**: 環境でClaudeが実行できること・できないことを定義する[セキュリティ設定](https://code.claude.com/docs/en/security)をレビューする

## まとめ

- ほとんどの組織にはClaude for TeamsまたはClaude for Enterpriseが最適（インフラ設定不要）
- 特定のインフラ要件がある場合はAmazon Bedrock・Google Vertex AI・Microsoft Foundryを選択
- コーポレートプロキシは`HTTPS_PROXY`環境変数で設定し、LLMゲートウェイは`ANTHROPIC_BASE_URL`で設定する
- CLAUDE.mdを組織・リポジトリ・ユーザーの3レベルで配置することで効率的な運用が可能
- クラウドプロバイダー経由の場合はモデルバージョンをピン留めして安定性を確保する
- セキュリティポリシーは管理設定で強制し、ローカル設定で上書きできないようにする

## 公式リファレンス

- [Enterprise deployment overview](https://code.claude.com/docs/en/third-party-integrations) - エンタープライズ導入の公式ドキュメント
- [Authentication](https://code.claude.com/docs/en/authentication) - 認証方式の詳細
- [Network configuration](https://code.claude.com/docs/en/network-config) - ネットワーク設定詳細
- [LLM gateway configuration](https://code.claude.com/docs/en/llm-gateway) - LLMゲートウェイ設定
- [devcontainer](https://code.claude.com/docs/en/devcontainer) - 開発コンテナの設定
- [Memory and CLAUDE.md](https://code.claude.com/docs/en/memory) - CLAUDE.mdの活用
- [Model configuration](https://code.claude.com/docs/en/model-config) - モデルバージョンのピン留め
