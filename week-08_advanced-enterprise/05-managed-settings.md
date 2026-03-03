# 組織管理設定

> 対応する公式ドキュメント: [Configure server-managed settings](https://code.claude.com/docs/en/server-managed-settings)

## 学習目標

- サーバー管理設定とエンドポイント管理設定の違いを理解する
- Claude.aiの管理コンソールから組織全体の設定を一元配信できる
- パーミッションのdenylisとmanaged-only設定を適切に設定できる
- 設定の配信タイミング・キャッシュ動作・優先順位を把握する
- セキュリティ上の制限事項と承認ダイアログの仕組みを理解する

## 概要

サーバー管理設定（Server-managed settings）は、管理者がClaude.aiのWebインターフェースからClaude Codeを一元設定できる仕組みです。ユーザーが組織の認証情報でログインすると、設定が自動的に配信されます。デバイス管理インフラ（MDM）を持たない組織や、管理されていないデバイスのユーザーを対象にした機能です。

> **注意**: サーバー管理設定はパブリックベータ版です。Claude for TeamsとClaude for Enterpriseの顧客が利用できます。

## 本文

### 2種類の集中設定アプローチ

Claude Codeでは集中設定に2つのアプローチがあります：

| アプローチ | 最適な用途 | セキュリティモデル |
|----------|-----------|----------------|
| **サーバー管理設定** | MDMなし、または管理されていないデバイス | 認証時にAnthropicのサーバーから配信 |
| **エンドポイント管理設定** | MDMまたはエンドポイント管理ソリューション導入済み | MDM設定プロファイル・レジストリポリシー・管理設定ファイルでデバイスに展開 |

> **推奨**: デバイスがMDMに登録されている場合は、OSレベルでユーザーによる変更を防止できるエンドポイント管理設定の方がより強いセキュリティ保証を提供します。

### 要件

- Claude for TeamsまたはClaude for Enterpriseプラン
- Claude Codeバージョン:
  - Claude for Teams: バージョン2.1.38以降
  - Claude for Enterprise: バージョン2.1.30以降
- `api.anthropic.com`へのネットワークアクセス

### サーバー管理設定の構成方法

**ステップ1: 管理コンソールを開く**

[Claude.ai](https://claude.ai)で **Admin Settings > Claude Code > Managed settings** に移動します。

**ステップ2: 設定をJSONで定義**

`settings.json`で利用可能な全設定が対応しています。`disableBypassPermissionsMode`などのmanaged-only設定も使用できます。

**設定例：パーミッションdenyリストとバイパス禁止の強制**

```json
{
  "permissions": {
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "disableBypassPermissionsMode": "disable"
}
```

**ステップ3: 保存してデプロイ**

変更を保存します。Claude Codeクライアントは次回の起動時または1時間ごとのポーリングサイクルで更新された設定を受信します。

### 設定の確認方法

設定が適用されているかの確認方法：

1. ユーザーにClaude Codeを再起動してもらう
2. セキュリティ承認ダイアログが表示されれば、管理設定が受信されている
3. ユーザーが`/permissions`を実行して有効なパーミッションルールを確認

### アクセス制御

以下のロールがサーバー管理設定を管理できます：

- **Primary Owner**
- **Owner**

設定変更は組織内の全ユーザーに適用されるため、信頼できる担当者に限定してアクセスを制限してください。

### 現在の制限事項（ベータ期間中）

- 設定は組織内の全ユーザーに一様に適用されます（グループ別設定は未対応）
- MCPサーバー設定はサーバー管理設定での配信に対応していません

---

### 設定の配信動作

#### 設定の優先順位

サーバー管理設定とエンドポイント管理設定はどちらも、Claude Codeの設定階層で**最高位**を占めます。ユーザーまたはプロジェクト設定でこれらをオーバーライドすることはできません。

両方が存在する場合、サーバー管理設定が優先され、エンドポイント管理設定は使用されません。

Claude Codeの設定優先順位（高い順）：

```
管理設定（サーバーまたはエンドポイント）
  ↓
ユーザー設定（~/.claude/settings.json）
  ↓
プロジェクト設定（.claude/settings.json）
  ↓
ローカル設定（.claude/settings.local.json）
```

#### フェッチとキャッシュの動作

Claude CodeはAnthropicのサーバーから起動時に設定を取得し、アクティブなセッション中は1時間ごとにポーリングして更新を確認します。

**キャッシュなしの初回起動時：**

- Claude Codeが非同期で設定を取得
- 取得に失敗した場合、管理設定なしで継続
- 設定が読み込まれる前に制限が適用されない短い時間窓が存在

**キャッシュ済みの設定での起動時：**

- キャッシュ済み設定が起動直後に即座に適用
- バックグラウンドで最新設定を取得
- ネットワーク障害が発生してもキャッシュ済み設定は継続して有効

設定の更新はOpenTelemetry設定などの高度な設定を除き、再起動なしに自動的に適用されます（高度な設定は完全な再起動が必要）。

---

### セキュリティ承認ダイアログ

一部の設定はセキュリティリスクを伴うため、適用前にユーザーの明示的な承認が必要です：

| 設定種別 | 承認が必要な理由 |
|---------|----------------|
| **シェルコマンド設定** | シェルコマンドを実行する設定 |
| **カスタム環境変数** | 既知の安全な許可リストに含まれない変数 |
| **フック設定** | すべてのフック定義 |

これらの設定が存在する場合、ユーザーは設定内容を説明するセキュリティダイアログを見ます。ユーザーが承認しなければ続行できません。ユーザーが設定を拒否した場合、Claude Codeは終了します。

> **注意**: `-p`フラグによる非インタラクティブモードでは、セキュリティダイアログをスキップして設定をユーザー承認なしに適用します。

---

### プラットフォームの可用性

サーバー管理設定は`api.anthropic.com`への直接接続が必要です。以下の環境では**利用できません**：

- Amazon Bedrock
- Google Vertex AI
- Microsoft Foundry
- `ANTHROPIC_BASE_URL`やLLMゲートウェイによるカスタムAPIエンドポイント

---

### 監査ログ

設定変更の監査ログイベントは、コンプライアンスAPIまたは監査ログエクスポートを通じて利用できます。アクセスにはAnthropicのアカウントチームへの連絡が必要です。

監査イベントには以下が含まれます：

- 実行されたアクションの種類
- アクションを実行したアカウントとデバイス
- 変更前と変更後の値への参照

---

### セキュリティ上の考慮事項

サーバー管理設定は集中ポリシーの適用を提供しますが、**クライアントサイドの制御**として機能します。管理されていないデバイスでは、管理者権限やsudoアクセスを持つユーザーがClaude Codeのバイナリ・ファイルシステム・ネットワーク設定を変更できる可能性があります。

| シナリオ | 動作 |
|---------|------|
| ユーザーがキャッシュ設定ファイルを編集 | 改ざんされたファイルが起動時に適用されるが、次回のサーバー取得で正しい設定に復元 |
| ユーザーがキャッシュ設定ファイルを削除 | 初回起動時の動作（非同期取得、短時間の未適用窓あり） |
| APIが利用不可 | キャッシュ設定が利用可能な場合は適用、そうでなければ次の取得成功まで管理設定は未適用 |
| ユーザーが別の組織で認証 | 管理対象組織外のアカウントには設定が配信されない |
| ユーザーが非デフォルトの`ANTHROPIC_BASE_URL`を設定 | サードパーティAPIプロバイダー使用時はサーバー管理設定がバイパスされる |

#### セキュリティ強化の推奨事項

- **ランタイム設定変更の検出**: [`ConfigChange`フック](https://code.claude.com/docs/en/hooks#configchange)を使用して変更をログに記録するか、許可されていない変更を事前にブロック
- **より強い保証が必要な場合**: MDMソリューションに登録されたデバイスにはエンドポイント管理設定を使用

---

### エンドポイント管理設定との連携

組織によっては両アプローチを組み合わせる場合があります：

```
管理されたデバイス（MDM導入済み）
  → エンドポイント管理設定（OS設定プロファイル・レジストリ）

管理されていないデバイス（BYOD等）
  → サーバー管理設定（Claude.ai管理コンソール）
```

#### エンドポイント管理設定の場所

| OS | 設定パス |
|----|---------|
| macOS（管理された設定） | `/Library/Application Support/ClaudeCode/managed_settings.json` |
| macOS（MDMプロファイル） | macOS Managed Preferences経由 |
| Windows | レジストリポリシー経由 |
| Linux | 管理設定ファイル経由 |

#### CLAUDE.mdの3レベル配置（参考）

管理設定の補完として、CLAUDE.mdを3つのレベルで配置できます：

```
/Library/Application Support/ClaudeCode/CLAUDE.md  ← macOS全社共通（管理者設定）
/your-repo/CLAUDE.md                                ← リポジトリレベル（バージョン管理）
~/.claude/CLAUDE.md                                 ← ユーザーレベル（個人設定）
```

---

### 実践的な設定例

#### セキュリティポリシーの一元適用

```json
{
  "permissions": {
    "deny": [
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(nc *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(~/.ssh/*)",
      "Read(~/.aws/credentials)"
    ]
  },
  "disableBypassPermissionsMode": "disable"
}
```

#### サンドボックス設定の組織展開

```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "denyWrite": ["~/.ssh", "~/.aws", "~/.gnupg"],
      "denyRead": ["~/.aws/credentials", "~/.ssh/id_rsa"]
    }
  }
}
```

#### 組み合わせポリシー

```json
{
  "permissions": {
    "allow": ["Bash(git *)", "Bash(npm run lint)", "Bash(npm test)"],
    "deny": [
      "Bash(curl *)",
      "Bash(wget *)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  },
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "denyWrite": ["~/.ssh", "~/.aws"],
      "denyRead": ["~/.aws/credentials"]
    }
  },
  "disableBypassPermissionsMode": "disable"
}
```

## まとめ

- サーバー管理設定はClaude for Teams/Enterprise向けのパブリックベータ機能で、MDMなしで組織全体の設定を一元管理できる
- 設定はClaude.aiの管理コンソール（Admin Settings > Claude Code > Managed settings）からJSONで定義
- 設定はClaude Codeの最高優先度に位置し、ユーザーやプロジェクト設定でオーバーライドできない
- 起動時に取得・1時間ごとにポーリングされ、キャッシュによりネットワーク障害に対応
- シェルコマンド設定・カスタム環境変数・フック設定にはユーザーの明示的な承認が必要
- Amazon Bedrock・Vertex AI・Foundryなどのサードパーティプロバイダー使用時は利用不可
- より強い保証が必要な場合は、MDM経由のエンドポイント管理設定を併用する

## 公式リファレンス

- [Configure server-managed settings](https://code.claude.com/docs/en/server-managed-settings) - サーバー管理設定の公式ドキュメント
- [Settings](https://code.claude.com/docs/en/settings) - 完全な設定リファレンス
- [Permissions](https://code.claude.com/docs/en/permissions) - パーミッション設定（managed-only設定を含む）
- [Security](https://code.claude.com/docs/en/security) - セキュリティのベストプラクティス
- [Hooks](https://code.claude.com/docs/en/hooks#configchange) - ConfigChangeフックによる変更検出
