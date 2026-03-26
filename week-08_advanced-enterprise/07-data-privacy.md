# データプライバシー・ZDR

> **対応公式ドキュメント**: https://code.claude.com/docs/en/data-usage / https://code.claude.com/docs/en/zero-data-retention
> **想定所要時間**: 約60分
> **難易度**: ★★★★☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. コンシューマーユーザーと商業ユーザーのデータ使用ポリシーの違いを説明できる
2. データ保持期間と設定変更方法を把握している
3. Zero Data Retention（ZDR）の仕組み・対象範囲・制限事項を理解している
4. テレメトリーとエラー報告のオプトアウト方法を実践できる
5. クラウドプロバイダー経由のデータポリシーの違いを把握している

---

## 1. データトレーニングポリシー

Claude Codeのデータプライバシーポリシーはアカウントタイプによって根本的に異なります。

### コンシューマーユーザー（Free・Pro・Maxプラン）

| 設定 | 動作 |
|------|------|
| データ使用許可オン（デフォルト） | AnthropicがClaude Codeから送信されたデータを将来のClaudeモデルの訓練に使用 |
| データ使用許可オフ | データは訓練に使用されない |

設定はいつでも [claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls) で変更できます。

### 商業ユーザー（Teams・Enterprise・API・サードパーティプラットフォーム・Claude Gov）

- **デフォルト**: Claude Codeを通じて送信されたコードやプロンプトを生成モデルの訓練に**使用しない**
- **例外**: [Developer Partner Program](https://support.claude.com/en/articles/11174108-about-the-development-partner-program)等で明示的にオプトインした場合のみ使用

> **重要**: Developer Partner ProgramはAnthropicのファーストパーティAPIにのみ対応しており、BedrockやVertexユーザーは対象外です。

### プライバシーセーフガード

Claude Codeは以下のプライバシーセーフガードを備えています：

- **限定的保持期間**: アカウントタイプに応じた保持期間（後述）
- **制限的アクセス**: ユーザーセッションデータへのアクセス制限
- **学習オプトアウト**: コンシューマーユーザーはデータトレーニングをいつでも無効化可能

---

## 2. データ保持期間

### コンシューマーユーザー

| 設定 | 保持期間 |
|-----|---------|
| モデル改善用データ使用を許可 | 5年間（モデル開発と安全性向上のため） |
| モデル改善用データ使用を不許可 | 30日間 |

### 商業ユーザー（Teams・Enterprise・API）

| 設定 | 保持期間 |
|-----|---------|
| 標準 | 30日間 |
| Zero Data Retention（ZDR） | 処理後即時削除（Claude for Enterpriseのみ） |
| ローカルキャッシュ | Claude Codeクライアントが最大30日間ローカルに保存（設定可能） |

### フィードバックの保持

- `/bug` コマンドで送信したフィードバックのトランスクリプト: **5年間保持**
- フィードバックはClaudeの製品・サービス改善に使用される可能性あり

---

## 3. テレメトリーサービスと制御

### テレメトリーの種類

Claude Codeは運用品質の改善のために以下のサービスに接続します：

| サービス | 収集内容 | 暗号化 | オプトアウト |
|---------|---------|--------|------------|
| **Statsig（メトリクス）** | レイテンシ・信頼性・使用パターン等（コードやファイルパスは含まない） | 転送時TLS・保存時256ビットAES | `DISABLE_TELEMETRY=1` |
| **Sentry（エラーログ）** | 運用エラーのログ | 転送時TLS・保存時256ビットAES | `DISABLE_ERROR_REPORTING=1` |
| **バグ報告（`/bug`）** | コードを含む会話履歴全体 | 転送時・保存時ともに暗号化 | `DISABLE_BUG_COMMAND=1` |

### セッション品質アンケート

"How is Claude doing this session?" のプロンプトに回答した場合：

- 記録されるのは**数値評価（1・2・3またはDismiss）のみ**
- 会話トランスクリプト・入力・出力は収集されない
- AIモデルの訓練に使用できない

```bash
# アンケートを無効化
export CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1
```

### APIプロバイダー別のデフォルト動作

Bedrock・Vertex・Foundry使用時はデフォルトで全ての非必須トラフィックが無効化されます：

| サービス | Claude API | Vertex/Bedrock/Foundry |
|---------|-----------|----------------------|
| Statsig（メトリクス） | デフォルト有効 | デフォルト無効 |
| Sentry（エラー） | デフォルト有効 | デフォルト無効 |
| `/bug` レポート | デフォルト有効 | デフォルト無効 |
| セッション品質アンケート | デフォルト有効 | デフォルト無効 |

### すべての非必須トラフィックを一括無効化

```bash
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

---

## 4. Zero Data Retention（ZDR）

ZDRはClaude for Enterpriseで利用可能な最高水準のプライバシー機能です。

### ZDRとは

ZDRが有効な場合、Claude Codeセッション中のプロンプトとモデル応答は：

- **リアルタイムで処理され、応答返却後にAnthropicは保存しない**
- 法律遵守や誤用対策に必要な場合を除き保持されない

### ZDRの適用範囲

**対象:**

- Claude for Enterprise上のClaude Codeの推論呼び出し
- ターミナルから送信するプロンプトとClaudeの応答

**対象外（標準データ保持ポリシーに従う）:**

| 機能 | 詳細 |
|-----|------|
| Claude.aiでのチャット | WebインターフェースでのZDR対象外 |
| Cowork | Coworkセッションはカバーされない |
| Claude Code Analytics | 使用統計などの生産性メタデータは収集される |
| ユーザー・シート管理 | アカウントメールやシート割り当て等の管理データは標準ポリシーで保持 |
| サードパーティ統合 | MCPサーバーや外部統合で処理されるデータはZDR対象外 |

### ZDR有効時に無効化される機能

| 機能 | 無効化の理由 |
|-----|------------|
| **Claude Code on the Web** | サーバーサイドでの会話履歴の保存が必要 |
| **DesktopアプリのRemoteセッション** | 永続的なセッションデータが必要 |
| **フィードバック送信（`/feedback`）** | 会話データをAnthropicに送信するため |

> **注意**: ZDR有効化時のClaude Code Analytics: 貢献指標（Contribution metrics）は利用不可。使用量メトリクスのみ表示されます。

### ZDR有効時の管理機能

ZDR有効化後も以下の管理機能は利用可能です：

- ユーザーごとのコスト制御
- Analyticsダッシュボード
- サーバー管理設定
- 監査ログ

### ポリシー違反時のデータ保持

ZDR有効時でも、使用ポリシー違反としてフラグが立てられたセッションの入出力は、最大2年間保持される場合があります。

### ZDRのリクエスト方法

1. AnthropicのアカウントチームにZDRを依頼
2. アカウントチームが内部リクエストを提出
3. Anthropicが資格を確認した後にZDRを有効化
4. 全ての有効化アクションは監査ログに記録

> **重要**: ZDRは**組織単位で有効化**されます。新しい組織には自動適用されず、個別にZDRを有効化する必要があります。

---

## 5. データフローの理解

### ローカル実行のデータフロー

```
ユーザーのターミナル
  ↓ プロンプト（TLS暗号化）
Anthropic API（または Bedrock/Vertex/Foundry）
  ↓ 応答（TLS暗号化）
ユーザーのターミナル
```

- **送信されるデータ**: すべてのユーザープロンプトとモデル出力
- **外部サービス**: NPM（インストール・更新）、Anthropic API、Statsig、Sentry

### クラウド実行のデータフロー

[Claude Code on the Web](https://code.claude.com/docs/en/claude-code-on-the-web) 使用時：

- **コードとデータ**: リポジトリが分離VMにクローンされる
- **認証情報**: GitHubの認証はセキュアなプロキシ経由（GitHub認証情報はサンドボックスに入らない）
- **ネットワークトラフィック**: 全アウトバウンドトラフィックがセキュリティプロキシを経由
- **セッションデータ**: ローカルClaude Codeと同じデータポリシーに従う

---

## 6. GDPR・コンプライアンス対応

| リソース | URL |
|---------|-----|
| SOC 2 Type 2報告書・ISO 27001証明書 | [Anthropic Trust Center](https://trust.anthropic.com) |
| プライバシー設定の変更 | [claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls) |
| 商業利用規約 | [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms) |
| コンシューマー利用規約 | [Consumer Terms](https://www.anthropic.com/legal/consumer-terms) |
| プライバシーポリシー | [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy) |

---

## ハンズオン演習

### 演習 1: テレメトリー設定の確認と制御

**目的**: 現在のテレメトリー設定を確認し、必要に応じてオプトアウトする

**前提条件**: Claude Codeがインストール済みであること

**手順**:

1. 現在のテレメトリー関連環境変数を確認する：
   ```bash
   env | grep -E "DISABLE_TELEMETRY|DISABLE_ERROR_REPORTING|DISABLE_BUG_COMMAND|CLAUDE_CODE_DISABLE"
   ```
2. テレメトリーを無効化する環境変数を設定する：
   ```bash
   export DISABLE_TELEMETRY=1
   export DISABLE_ERROR_REPORTING=1
   ```
3. Claude Codeを起動して、設定が反映されていることを確認する
4. すべての非必須トラフィックを一括無効化する方法を試す：
   ```bash
   export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
   ```

**期待される結果**: テレメトリー設定の確認と制御ができるようになる

### 演習 2: プライバシー設定の確認

**目的**: 自分のアカウントのデータプライバシー設定を確認する

**前提条件**: Claude.aiアカウントがあること

**手順**:

1. [claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls) にアクセスする
2. 現在のデータ使用設定を確認する
3. 設定の変更がデータ保持期間に与える影響を理解する：
   - 許可オン: 5年間保持
   - 許可オフ: 30日間保持
4. 自分のユースケースに適した設定を選択する

**期待される結果**: データ使用設定の意味を理解し、適切な選択ができる

### 演習 3: 組織のプライバシーポリシー設計

**目的**: 組織のClaude Codeプライバシーポリシーを設計する

**前提条件**: なし（座学演習）

**手順**:

1. 以下の架空組織を想定する：
   - 金融サービス企業
   - コンプライアンス要件: SOC 2、GDPR
   - 開発者50名
   - 機密性の高いコードベース
2. 以下の項目について方針を策定する：
   - デプロイオプションの選択（Teams/Enterprise/Bedrock等）
   - ZDRの必要性の判断
   - テレメトリーの設定方針
   - 管理設定で強制すべきポリシー
3. 策定した方針をドキュメント化する

**期待される結果**: 組織要件に基づいたプライバシーポリシーが設計できる

---

## よくある質問

**Q: 商業ユーザー（Teams/Enterprise）でもデータは30日間保持されますか？**
A: はい。標準の商業プランではデータは30日間保持されます。ただし、これはモデル訓練目的ではなく、安全性と悪用防止のためです。ZDR（Claude for Enterpriseのみ）を有効にすると、処理後即時削除されます。

**Q: Bedrock/Vertex/Foundry経由の場合、データ保持ポリシーはどうなりますか？**
A: 各プラットフォームのデータ保持ポリシーが適用されます。Anthropicの標準ポリシーではなく、AWS・GCP・Azureのそれぞれのポリシーを確認してください。

**Q: ZDRを有効にするとClaude Code on the Webが使えなくなるのはなぜですか？**
A: Claude Code on the Webはサーバーサイドで会話履歴を保存する必要がありますが、ZDRはプロンプトと応答の保持を禁止するため、技術的に両立できません。

**Q: `/bug` コマンドで送信したデータの保持期間が5年なのはなぜですか？**
A: フィードバックはClaude Codeの製品・サービス改善に使用されるため、長期的な保持が必要です。機密情報を含む可能性がある場合は `/bug` コマンドの使用を避けるか、`DISABLE_BUG_COMMAND=1` で無効化してください。

**Q: `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` を設定すると何が無効になりますか？**
A: Statsig（メトリクス）、Sentry（エラーログ）、`/bug` レポート、セッション品質アンケートなど、Claude Codeの推論に必要ない全ての通信が無効化されます。Claude CodeのAI機能自体には影響しません。

---

## まとめ

この章で学んだ重要ポイント：

- コンシューマーユーザーはデフォルトでデータが訓練に使用されるが、プライバシー設定でいつでも変更可能
- 商業ユーザー（Teams/Enterprise/API）はデフォルトでモデル訓練にデータが使用されない
- ZDRはClaude for Enterpriseのみ対応。組織単位で有効化が必要でアカウントチームへの連絡が必要
- ZDR有効時はClaude Code on the Web・Remoteセッション・フィードバック送信が無効化される
- Bedrock・Vertex AI・Foundry経由ではデフォルトで全ての非必須テレメトリーが無効化される
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` で全ての非必須通信を一括無効化できる

## 次のステップ

Week 8の全レッスンが完了しました。このWeekで学んだセキュリティ・サンドボックス・エンタープライズ導入・クラウドプロバイダー連携・組織管理・ベストプラクティス・データプライバシーの知識を統合し、組織での安全かつ効率的なClaude Code運用を実践してください。

---

> **公式リファレンス**
> - [Data usage](https://code.claude.com/docs/en/data-usage) - データ使用ポリシーの公式ドキュメント
> - [Zero data retention](https://code.claude.com/docs/en/zero-data-retention) - ZDRの公式ドキュメント
> - [Privacy Center](https://privacy.anthropic.com/) - Anthropicのプライバシーセンター
> - [Anthropic Trust Center](https://trust.anthropic.com) - SOC2・ISO27001等のセキュリティ認証
> - [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms) - 商業利用規約
> - [Consumer Terms](https://www.anthropic.com/legal/consumer-terms) - コンシューマー利用規約
