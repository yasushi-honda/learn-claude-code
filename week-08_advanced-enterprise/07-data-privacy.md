# データプライバシー・ZDR

> 対応する公式ドキュメント: [Data usage](https://code.claude.com/docs/en/data-usage) / [Zero data retention](https://code.claude.com/docs/en/zero-data-retention)

## 学習目標

- コンシューマーユーザーと商業ユーザーのデータ使用ポリシーの違いを理解する
- データ保持期間と設定変更方法を把握する
- Zero Data Retention（ZDR）の仕組みと対象範囲を理解する
- テレメトリーとエラー報告のオプトアウト方法を知る
- クラウドプロバイダー経由のデータポリシーの違いを把握する

## 概要

Claude Codeのデータプライバシーポリシーはアカウントタイプによって異なります。コンシューマーユーザー（Free/Pro/Maxプラン）と商業ユーザー（Teams/Enterprise/API）では、モデル訓練へのデータ使用方針が根本的に異なります。Zero Data Retention（ZDR）はClaude for Enterpriseで利用可能な機能で、プロンプトと応答をAnthropicが保持しない最高水準のプライバシーを提供します。

## 本文

### データトレーニングポリシー

#### コンシューマーユーザー（Free・Pro・Maxプラン）

ユーザーが設定した選択に基づいてデータが使用されます：

- **データ使用許可オン**: AnthropicはFree・Pro・Maxアカウントのデータを使用して将来のClaudeモデルを訓練します（Claude Codeから使用した場合も含む）
- **データ使用許可オフ**: データは訓練に使用されません
- 設定はいつでも[claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls)で変更できます

#### 商業ユーザー（Teams・Enterprise・API・サードパーティプラットフォーム・Claude Gov）

Anthropicは既存のポリシーを維持します：

- **デフォルト**: Claude Codeを通じて送信されたコードやプロンプトを生成モデルの訓練に使用しない
- **例外**: [Developer Partner Program](https://support.claude.com/en/articles/11174108-about-the-development-partner-program)等で明示的にオプトインした場合のみ使用

> **重要**: Developer Partner ProgramはAnthropicのファーストパーティAPIにのみ対応しており、BedrockやVertexユーザーは対象外です。

---

### データ保持期間

#### コンシューマーユーザー

| 設定 | 保持期間 |
|-----|---------|
| モデル改善用データ使用を許可 | 5年間（モデル開発と安全性向上のため） |
| モデル改善用データ使用を不許可 | 30日間 |

#### 商業ユーザー（Teams・Enterprise・API）

| 設定 | 保持期間 |
|-----|---------|
| 標準 | 30日間 |
| Zero Data Retention（ZDR） | 処理後即時削除（Claude for Enterpriseのみ） |
| ローカルキャッシュ | Claude Codeクライアントが最大30日間ローカルに保存（設定可能） |

#### フィードバックの保持

- `/bug`コマンドで送信したフィードバックのトランスクリプト: **5年間保持**
- フィードバックはClaudeの製品・サービス改善に使用される可能性あり

---

### セッション品質アンケート

"How is Claude doing this session?"のプロンプトに回答した場合：

- 記録されるのは**数値評価（1・2・3またはDismiss）のみ**
- 会話トランスクリプト・入力・出力・その他のセッションデータは収集・保存されない
- データトレーニング設定に影響しない
- AIモデルの訓練に使用できない

```bash
# アンケートを無効化
export CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1
```

アンケートはサードパーティプロバイダー（Bedrock・Vertex・Foundry）使用時、またはテレメトリー無効時に自動的に無効化されます。

---

### テレメトリーサービス

Claude Codeはオペレーション品質の改善のために以下のサービスに接続します：

#### Statsig（メトリクス）

- 収集内容: レイテンシ・信頼性・使用パターン等の運用メトリクス
- **コードやファイルパスは含まれない**
- 暗号化: 転送時TLS・保存時256ビットAES
- オプトアウト: `DISABLE_TELEMETRY=1`

#### Sentry（エラーログ）

- 収集内容: 運用エラーのログ
- 暗号化: 転送時TLS・保存時256ビットAES
- オプトアウト: `DISABLE_ERROR_REPORTING=1`

#### バグ報告（`/bug`コマンド）

- 収集内容: コードを含む会話履歴全体
- 暗号化: 転送時・保存時ともに暗号化
- GitHubパブリックリポジトリにIssueが作成される（オプション）
- オプトアウト: `DISABLE_BUG_COMMAND=1`

---

### APIプロバイダー別のデフォルト動作

Bedrock・Vertex・Foundry使用時はデフォルトで全ての非必須トラフィックが無効化されます：

| サービス | Claude API | Vertex API | Bedrock API | Foundry API |
|---------|-----------|-----------|------------|-------------|
| **Statsig（メトリクス）** | デフォルト有効。`DISABLE_TELEMETRY=1`で無効化 | デフォルト無効 | デフォルト無効 | デフォルト無効 |
| **Sentry（エラー）** | デフォルト有効。`DISABLE_ERROR_REPORTING=1`で無効化 | デフォルト無効 | デフォルト無効 | デフォルト無効 |
| **Claude API（`/bug`レポート）** | デフォルト有効。`DISABLE_BUG_COMMAND=1`で無効化 | デフォルト無効 | デフォルト無効 | デフォルト無効 |
| **セッション品質アンケート** | デフォルト有効。`CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1`で無効化 | デフォルト無効 | デフォルト無効 | デフォルト無効 |

**すべての非必須トラフィックを一括無効化:**

```bash
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

---

### Zero Data Retention（ZDR）

ZDRはClaude for Enterpriseで利用可能な最高水準のプライバシー機能です。

#### ZDRとは

ZDRが有効な場合、Claude Codeセッション中のプロンプトとモデル応答は：

- **リアルタイムで処理され、応答返却後にAnthropicは保存しない**
- 法律遵守や誤用対策に必要な場合を除き保持されない

#### ZDRが利用可能なプラン

- **Claude for Enterprise**: ZDRに対応（アカウントチームへの連絡が必要）
- ※ BedrockやVertex AI・Microsoft Foundry経由のデプロイはそれぞれのプラットフォームのデータ保持ポリシーが適用

#### ZDRと同時に利用可能な管理機能

Claude for EnterpriseでZDRを有効にすると、以下の管理機能も利用できます：

- ユーザーごとのコスト制御
- Analyticsダッシュボード
- サーバー管理設定
- 監査ログ

#### ZDRの適用範囲

**対象:**

- Claude for Enterprise上のClaude Codeの推論呼び出し
- ターミナルから送信するプロンプトとClaude の応答

**対象外（標準データ保持ポリシーに従う）:**

| 機能 | 詳細 |
|-----|------|
| Claude.aiでのチャット | Claude for EnterpriseのWebインターフェースでの会話はZDR対象外 |
| Cowork | Coworkセッションはカバーされない |
| Claude Code Analytics | プロンプト・応答は保存しないが、アカウントメールや使用統計などの生産性メタデータを収集 |
| ユーザー・シート管理 | アカウントメールやシート割り当てなどの管理データは標準ポリシーで保持 |
| サードパーティ統合 | MCPサーバーや外部統合で処理されるデータはZDR対象外 |

> **注意**: ZDR有効化時のClaude Code Analytics: 貢献指標（Contribution metrics）は利用不可。Analyticsダッシュボードでは使用量メトリクスのみ表示されます。

#### ZDR有効化時に無効化される機能

| 機能 | 無効化の理由 |
|-----|------------|
| Claude Code on the Web | サーバーサイドでの会話履歴の保存が必要 |
| DesktopアプリのRemoteセッション | プロンプトと応答を含む永続的なセッションデータが必要 |
| フィードバック送信（`/feedback`） | フィードバック送信時に会話データをAnthropicに送信するため |

これらの機能はバックエンドレベルでブロックされます。

#### ポリシー違反時のデータ保持

ZDR有効化時でも、法律が要求する場合や使用ポリシー違反に対処するためにAnthropicはデータを保持することがあります。ポリシー違反としてフラグが立てられたセッションに関連する入出力は、標準ZDRポリシーと一致して最大2年間保持される場合があります。

#### ZDRのリクエスト方法

1. AnthropicのアカウントチームにZDRを依頼
2. アカウントチームが内部リクエストを提出
3. Anthropicが資格を確認した後にZDRを有効化
4. 全ての有効化アクションは監査ログに記録

> **重要**: ZDRは**組織単位で有効化**されます。同じアカウント下に作成された新しい組織には自動的には適用されません。新しい組織ごとに個別にZDRを有効化する必要があります。

**APIキー経由でZDRを使用中のユーザー:** Claude for Enterpriseへ移行すると、ZDRを維持しながら管理機能も利用できます。移行はアカウントチームに連絡して調整してください。

---

### ローカルClaude Codeのデータフロー

Claude Codeはローカルで実行され、LLMとのやり取りのためにネットワーク経由でデータを送信します：

- **送信されるデータ**: 全てのユーザープロンプトとモデル出力
- **転送時暗号化**: TLS
- **保存時暗号化**: なし（Anthropicのサーバー側で保存される場合）
- **外部サービス**: NPM（インストール・更新）・Anthropic API・Statsig・Sentry

ほとんどの一般的なVPNとLLMプロキシに対応しています。

### クラウド実行のデータフロー

[Claude Code on the Web](https://code.claude.com/docs/en/claude-code-on-the-web)使用時（クラウド実行）：

- **コードとデータ**: リポジトリが分離VMにクローンされる
- **認証情報**: GitHubの認証はセキュアなプロキシ経由（GitHub認証情報はサンドボックスに入らない）
- **ネットワークトラフィック**: 全アウトバウンドトラフィックが監査ログと不正使用防止のためセキュリティプロキシを経由
- **セッションデータ**: プロンプト・コード変更・出力はローカルClaude Codeと同じデータポリシーに従う

個々のClaudeCode on the Webセッションはいつでも削除できます。セッション削除でそのセッションのイベントデータが完全に削除されます。

---

### GDPR・コンプライアンス対応

- **SOC 2 Type 2報告書・ISO 27001証明書**: [Anthropic Trust Center](https://trust.anthropic.com)で確認可能
- **プライバシー設定の変更**: コンシューマーユーザーはいつでも[claude.ai/settings/data-privacy-controls](https://claude.ai/settings/data-privacy-controls)で変更可能
- **商業利用規約**: [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms)（Teams・Enterprise・APIユーザー向け）
- **コンシューマー利用規約**: [Consumer Terms](https://www.anthropic.com/legal/consumer-terms)（Free・Pro・Maxユーザー向け）
- **プライバシーポリシー**: [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)

## まとめ

- コンシューマーユーザーはデフォルトでデータが訓練に使用されるが、[プライバシー設定](https://claude.ai/settings/data-privacy-controls)でいつでも変更可能
- 商業ユーザー（Teams/Enterprise/API）はデフォルトでモデル訓練にデータが使用されない
- 商業ユーザーの標準データ保持期間は30日間
- ZDRはClaude for Enterpriseのみ対応。組織単位で有効化が必要で、アカウントチームへの連絡が必要
- ZDR有効時はClaude Code on the Web・Remoteセッション・フィードバック送信が無効化される
- Bedrock・Vertex AI・Foundry経由ではデフォルトで全ての非必須テレメトリーが無効化される
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`で全ての非必須通信を一括無効化できる

## 公式リファレンス

- [Data usage](https://code.claude.com/docs/en/data-usage) - データ使用ポリシーの公式ドキュメント
- [Zero data retention](https://code.claude.com/docs/en/zero-data-retention) - ZDRの公式ドキュメント
- [Privacy Center](https://privacy.anthropic.com/) - Anthropicのプライバシーセンター
- [Anthropic Trust Center](https://trust.anthropic.com) - SOC2・ISO27001等のセキュリティ認証
- [Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms) - 商業利用規約
- [Consumer Terms](https://www.anthropic.com/legal/consumer-terms) - コンシューマー利用規約
- [Developer Partner Program](https://support.claude.com/en/articles/11174108-about-the-development-partner-program) - データ提供プログラムの詳細
