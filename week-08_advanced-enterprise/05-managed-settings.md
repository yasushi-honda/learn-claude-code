# 組織管理設定

> **対応公式ドキュメント**: https://code.claude.com/docs/en/server-managed-settings
> **想定所要時間**: 約60分
> **難易度**: ★★★★☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. サーバー管理設定とエンドポイント管理設定の違いとユースケースを説明できる
2. Claude.aiの管理コンソールから組織全体の設定をJSON形式で定義・配信できる
3. managed-only設定（`disableBypassPermissionsMode`等）を適切に使用できる
4. 設定の配信タイミング・キャッシュ動作・優先順位・セキュリティ上の制限を把握している

---

## 1. 集中設定の2つのアプローチ

Claude Codeでは、組織全体のポリシーを一元管理するために2つのアプローチが用意されています。

### 比較

| アプローチ | 最適な用途 | セキュリティモデル |
|----------|-----------|----------------|
| **サーバー管理設定** | MDMなし、または管理されていないデバイス（BYOD等） | 認証時にAnthropicのサーバーから配信 |
| **エンドポイント管理設定** | MDMまたはエンドポイント管理ソリューション導入済み | MDM設定プロファイル・レジストリポリシーでデバイスに展開 |

> **公式ドキュメントより**: デバイスがMDMに登録されている場合は、OSレベルでユーザーによる変更を防止できるエンドポイント管理設定の方がより強いセキュリティ保証を提供します。

### 要件

- **プラン**: Claude for TeamsまたはClaude for Enterprise
- **バージョン**: Teams: 2.1.38以降 / Enterprise: 2.1.30以降
- **ネットワーク**: `api.anthropic.com` へのアクセス

---

## 2. サーバー管理設定の構成

### 設定手順

**ステップ1: 管理コンソールを開く**

[Claude.ai](https://claude.ai) で **Admin Settings > Claude Code > Managed settings** に移動します。

**ステップ2: 設定をJSONで定義**

`settings.json` で利用可能な全設定に加え、managed-only設定も使用できます。

**ステップ3: 保存してデプロイ**

変更を保存すると、Claude Codeクライアントは次回起動時または1時間ごとのポーリングで更新された設定を受信します。

### managed-only設定

これらの設定は管理設定（サーバーまたはエンドポイント）でのみ使用可能で、ユーザーやプロジェクト設定では設定できません：

| 設定 | 説明 |
|------|------|
| `disableBypassPermissionsMode` | `--dangerously-skip-permissions` フラグの使用を禁止 |
| `allowManagedPermissionRulesOnly` | 管理者が定義したパーミッションルールのみを許可 |
| `allowManagedHooksOnly` | 管理者が定義したフックのみを許可 |
| `allowManagedMcpServersOnly` | 管理者が定義したMCPサーバーのみを許可 |
| `blockedMarketplaces` | 特定のマーケットプレイスをブロック |
| `sandbox.network.allowManagedDomainsOnly` | 管理者が許可したドメインのみネットワークアクセスを許可 |
| `strictKnownMarketplaces` | マーケットプレイスの使用を厳格に管理 |
| `allow_remote_sessions` | リモートセッションの許可/禁止を制御 |

### 設定例

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

#### サンドボックスの組織展開

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

#### 総合ポリシー

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

---

## 3. 設定の配信と優先順位

### 設定の優先順位

管理設定はClaude Codeの設定階層で**最高位**を占めます：

```
管理設定（サーバーまたはエンドポイント） ... 最高優先度
  ↓
ユーザー設定（~/.claude/settings.json）
  ↓
プロジェクト設定（.claude/settings.json）
  ↓
ローカル設定（.claude/settings.local.json）... 最低優先度
```

サーバー管理設定とエンドポイント管理設定の両方が存在する場合、**サーバー管理設定が優先**され、エンドポイント管理設定は使用されません。

### フェッチとキャッシュの動作

#### キャッシュなしの初回起動時

1. Claude Codeが非同期で設定を取得
2. 取得に失敗した場合、管理設定なしで継続
3. **設定が読み込まれる前に制限が適用されない短い時間窓が存在**

#### キャッシュ済みの設定での起動時

1. キャッシュ済み設定が起動直後に即座に適用
2. バックグラウンドで最新設定を取得
3. ネットワーク障害が発生してもキャッシュ済み設定は継続して有効

設定の更新は再起動なしに自動的に適用されます（OpenTelemetry設定などの高度な設定は完全な再起動が必要）。

---

## 4. セキュリティ承認ダイアログ

一部の設定はセキュリティリスクを伴うため、適用前にユーザーの明示的な承認が必要です：

| 設定種別 | 承認が必要な理由 |
|---------|----------------|
| **シェルコマンド設定** | シェルコマンドを実行する設定 |
| **カスタム環境変数** | 既知の安全な許可リストに含まれない変数 |
| **フック設定** | すべてのフック定義 |

ユーザーが設定を拒否した場合、Claude Codeは終了します。

> **注意**: `-p` フラグによる非インタラクティブモードでは、セキュリティダイアログをスキップして設定をユーザー承認なしに適用します。

---

## 5. セキュリティ上の考慮事項

### クライアントサイド制御の限界

サーバー管理設定は**クライアントサイドの制御**として機能します。管理されていないデバイスでは、管理者権限やsudoアクセスを持つユーザーがClaude Codeのバイナリ・ファイルシステム・ネットワーク設定を変更できる可能性があります。

| シナリオ | 動作 |
|---------|------|
| ユーザーがキャッシュ設定ファイルを編集 | 改ざんされたファイルが起動時に適用されるが、次回のサーバー取得で正しい設定に復元 |
| ユーザーがキャッシュ設定ファイルを削除 | 初回起動時の動作（非同期取得、短時間の未適用窓あり） |
| APIが利用不可 | キャッシュ設定があれば適用、なければ管理設定は未適用 |
| ユーザーが別の組織で認証 | 管理対象組織外のアカウントには設定が配信されない |
| ユーザーが非デフォルトの `ANTHROPIC_BASE_URL` を設定 | サードパーティAPIプロバイダー使用時はサーバー管理設定がバイパスされる |

### セキュリティ強化の推奨事項

- **ランタイム設定変更の検出**: [`ConfigChange` フック](https://code.claude.com/docs/en/hooks#configchange)で変更をログに記録するか、許可されていない変更を事前にブロック
- **より強い保証が必要な場合**: MDMソリューションに登録されたデバイスにはエンドポイント管理設定を使用

### プラットフォームの可用性

サーバー管理設定は `api.anthropic.com` への直接接続が必要です。以下の環境では**利用できません**：

- Amazon Bedrock
- Google Vertex AI
- Microsoft Foundry
- カスタムAPIエンドポイント（`ANTHROPIC_BASE_URL` やLLMゲートウェイ）

### 監査ログ

設定変更の監査ログイベントは、コンプライアンスAPIまたは監査ログエクスポートを通じて利用できます。監査イベントには以下が含まれます：

- 実行されたアクションの種類
- アクションを実行したアカウントとデバイス
- 変更前と変更後の値への参照

---

## 6. エンドポイント管理設定

### MDMとの連携

デバイスがMDMに登録されている場合、エンドポイント管理設定でOSレベルの強制が可能です。

#### 配置場所

| OS | 設定パス |
|----|---------|
| **macOS**（管理された設定） | `/Library/Application Support/ClaudeCode/managed_settings.json` |
| **macOS**（MDMプロファイル） | macOS Managed Preferences経由（plist） |
| **Windows** | レジストリポリシー経由 |
| **Linux** | `/etc/claude-code/` 配下の管理設定ファイル |

### 組み合わせ戦略

組織によっては両アプローチを組み合わせることが効果的です：

```
管理されたデバイス（MDM導入済み）
  --> エンドポイント管理設定（OS設定プロファイル・レジストリ）

管理されていないデバイス（BYOD等）
  --> サーバー管理設定（Claude.ai管理コンソール）
```

---

## ハンズオン演習

### 演習 1: セキュリティポリシーの設計

**目的**: 組織のセキュリティ要件に基づいた管理設定JSONを設計する

**前提条件**: なし（座学演習）

**手順**:

1. 以下の要件を満たす管理設定JSONを設計する：
   - 機密ファイル（`.env`、`secrets/`、`~/.ssh/`）の読み取りを禁止
   - `curl`・`wget`・`nc` コマンドの実行を禁止
   - `--dangerously-skip-permissions` の使用を禁止
   - `git`・`npm test`・`npm run lint` の実行を許可
   - サンドボックスを有効化し、`~/.ssh` と `~/.aws` への書き込みを禁止
2. JSONの各設定項目がなぜ必要かを記述する
3. 設定のテスト計画を作成する

**期待される結果**: 組織のセキュリティ要件を満たす管理設定JSONと、テスト計画が完成する

### 演習 2: 設定の優先順位の確認

**目的**: 管理設定とユーザー設定の優先順位を実際に確認する

**前提条件**: Claude Codeがインストール済みであること

**手順**:

1. ユーザー設定（`~/.claude/settings.json`）に以下を追加する：
   ```json
   {
     "permissions": {
       "allow": ["Bash(npm test)"]
     }
   }
   ```
2. プロジェクト設定（`.claude/settings.json`）に以下を追加する：
   ```json
   {
     "permissions": {
       "deny": ["Read(./.env)"]
     }
   }
   ```
3. Claude Codeを起動し、`/permissions` で有効なパーミッションルールを確認する
4. 各レベルの設定がどのようにマージされているか確認する

**期待される結果**: ユーザー設定とプロジェクト設定の両方が反映され、管理設定があればそれが最高優先度であることが理解できる

### 演習 3: ConfigChangeフックの設計

**目的**: 設定変更の監査フックを設計する

**前提条件**: フック機能の基礎知識

**手順**:

1. セッション中の設定変更を検出するConfigChangeフックの設計を考える：
   ```json
   {
     "hooks": {
       "ConfigChange": [
         {
           "matcher": ".*",
           "hooks": [
             {
               "type": "command",
               "command": "echo \"Config changed: $CLAUDE_HOOK_EVENT\" >> /var/log/claude-code-audit.log"
             }
           ]
         }
       ]
     }
   }
   ```
2. フックで監査すべきイベントを列挙する
3. 設定変更をブロックするフック（`type: "intercept"`）のユースケースを検討する

**期待される結果**: 設定変更の監査と制御を実現するフック設計が完成する

---

## よくある質問

**Q: サーバー管理設定はBedrock/Vertex/Foundry経由でも使えますか？**
A: いいえ。サーバー管理設定は `api.anthropic.com` への直接接続が必要です。クラウドプロバイダー経由で使用する場合は、エンドポイント管理設定（MDM経由）を使用してください。

**Q: 設定はすべてのユーザーに一律に適用されますか？グループ別の設定はできますか？**
A: 現在のベータ期間中は、設定は組織内の全ユーザーに一様に適用されます。グループ別の設定は未対応です。

**Q: MCPサーバーの設定はサーバー管理設定で配信できますか？**
A: 現在、MCPサーバー設定はサーバー管理設定での配信に対応していません。MCPサーバーは `.mcp.json` ファイルをリポジトリに配置して管理してください。

**Q: ユーザーが管理設定を無視する方法はありますか？**
A: 管理されていないデバイスでは、ユーザーがキャッシュファイルを改ざんしたり、別のAPIエンドポイントを使用することで設定をバイパスできる可能性があります。より強いセキュリティ保証が必要な場合は、MDM経由のエンドポイント管理設定を使用してください。

**Q: 非インタラクティブモード（`-p` フラグ）でセキュリティ承認はどうなりますか？**
A: `-p` フラグ使用時は、セキュリティダイアログをスキップして設定がユーザー承認なしに適用されます。CI/CD環境ではこの動作に注意が必要です。

---

## まとめ

この章で学んだ重要ポイント：

- サーバー管理設定はClaude for Teams/Enterprise向けのパブリックベータ機能で、MDMなしで組織全体の設定を一元管理できる
- managed-only設定（`disableBypassPermissionsMode`・`allowManagedPermissionRulesOnly`等）は管理設定でのみ使用可能
- 設定は起動時に取得・1時間ごとにポーリングされ、キャッシュによりネットワーク障害に対応できる
- 管理設定はClaude Codeの設定階層で最高優先度に位置し、ユーザーやプロジェクト設定でオーバーライドできない
- エンドポイント管理設定はMDM経由で配信され、macOS（plist）・Windows（レジストリ）・Linux（設定ファイル）に対応

## 次のステップ

次の章「[ベストプラクティス総まとめ](06-best-practices.md)」では、Claude Codeの効果的な活用パターン、コンテキスト管理、プロンプト設計、CLAUDE.md設計、自動化手法を学びます。

---

> **公式リファレンス**
> - [Configure server-managed settings](https://code.claude.com/docs/en/server-managed-settings) - サーバー管理設定の公式ドキュメント
> - [Settings](https://code.claude.com/docs/en/settings) - 完全な設定リファレンス
> - [Permissions](https://code.claude.com/docs/en/permissions) - パーミッション設定（managed-only設定を含む）
> - [Security](https://code.claude.com/docs/en/security) - セキュリティのベストプラクティス
> - [Hooks](https://code.claude.com/docs/en/hooks#configchange) - ConfigChangeフックによる変更検出
