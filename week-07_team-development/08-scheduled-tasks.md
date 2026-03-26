# スケジュールタスク

> **対応公式ドキュメント**: https://code.claude.com/docs/en/scheduled-tasks / https://code.claude.com/docs/en/web-scheduled-tasks
> **想定所要時間**: 約45分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. 3 種類のスケジューリング（Cloud / Desktop / `/loop`）の違いを理解し、使い分けられる
2. `/loop` でセッション内の定期実行を設定できる
3. 自然言語でワンショットリマインダーを設定できる
4. Web UI からクラウドスケジュールタスクを作成・管理できる
5. cron 式の基本構文を理解できる

---

## 1. スケジューリング方式の比較

| 項目 | Cloud | Desktop | `/loop` |
|------|-------|---------|---------|
| 実行場所 | Anthropic クラウド | ローカルマシン | ローカルマシン |
| マシン電源必要 | 不要 | 必要 | 必要 |
| セッション必要 | 不要 | 不要 | 必要 |
| 再起動後の永続性 | あり | あり | なし（セッションスコープ） |
| ローカルファイルアクセス | なし（GitHub クローン） | あり | あり |
| MCP サーバー | コネクタ設定 | 設定ファイル + コネクタ | セッション継承 |
| パーミッション | なし（自律実行） | タスクごとに設定可 | セッション継承 |
| 最小間隔 | 1 時間 | 1 分 | 1 分 |

**使い分けの指針**：
- **Cloud**: マシン電源に依存しない信頼性の高い定期実行（PR レビュー、依存関係監査）
- **Desktop**: ローカルファイルやツールへのアクセスが必要な定期実行
- **`/loop`**: セッション中のクイックポーリング（デプロイ監視、ビルド確認）

---

## 2. `/loop` によるセッション内スケジューリング

### 基本的な使い方

```
/loop 5m check if the deployment finished and tell me what happened
```

Claude がインターバルを解析し、cron ジョブを設定します。

### インターバル構文

| 形式 | 例 | 解釈 |
|------|-----|------|
| 先頭に指定 | `/loop 30m check the build` | 30 分ごと |
| `every` 句 | `/loop check the build every 2 hours` | 2 時間ごと |
| 省略 | `/loop check the build` | デフォルト 10 分ごと |

サポートされる単位：`s`（秒）、`m`（分）、`h`（時）、`d`（日）。秒は最小 1 分に切り上げられます。

### 別のコマンドをループ

```
/loop 20m /review-pr 1234
```

ジョブ発火のたびに `/review-pr 1234` が実行されます。

---

## 3. ワンショットリマインダー

自然言語で1回限りのリマインダーを設定できます：

```
remind me at 3pm to push the release branch
```

```
in 45 minutes, check whether the integration tests passed
```

Claude が cron 式に変換し、発火後に自動削除します。

---

## 4. タスクの管理

自然言語で管理できます：

```
what scheduled tasks do I have?
```

```
cancel the deploy check job
```

### 内部ツール

| ツール | 用途 |
|--------|------|
| `CronCreate` | 新しいタスクをスケジュール（cron 式、プロンプト、繰り返し/ワンショット） |
| `CronList` | 全タスクを表示（ID、スケジュール、プロンプト） |
| `CronDelete` | ID 指定でタスクをキャンセル |

セッションあたり最大 50 タスクまで保持可能です。

---

## 5. 実行の仕組み

### タイミング

- スケジュールされたプロンプトは **Claude がアイドル時** に発火する（応答中は待機）
- 全時刻はローカルタイムゾーンで解釈される
- ジッター：繰り返しタスクは周期の最大 10%（上限 15 分）遅延。ワンショットは `:00` / `:30` で最大 90 秒前倒し

### 有効期限

- 繰り返しタスクは作成から **3 日後** に自動期限切れ
- より長期の定期実行には Cloud / Desktop スケジュールタスクを使用

### 制限事項

- セッション終了で全タスク消滅
- 見逃した発火のキャッチアップなし
- 再起動で全タスククリア

---

## 6. クラウドスケジュールタスク

### 作成方法（3 つのエントリポイント）

1. **Web**: [claude.ai/code/scheduled](https://claude.ai/code/scheduled) → **New scheduled task**
2. **Desktop アプリ**: Schedule ページ → **New task** → **New remote task**
3. **CLI**: `/schedule` コマンド（対話的に設定）

### 作成手順（Web）

1. タスク名とプロンプトを入力（自律実行のため、プロンプトは自己完結的に記述）
2. GitHub リポジトリを選択（各実行でデフォルトブランチからクローン）
3. クラウド環境を選択（ネットワークアクセス、環境変数、セットアップスクリプト）
4. 頻度を選択（Hourly / Daily / Weekdays / Weekly）
5. MCP コネクタを確認
6. **Create** をクリック

### ブランチ権限

デフォルトでは `claude/` プレフィックスのブランチのみ Push 可能。**Allow unrestricted branch pushes** で制限を解除できます。

### 頻度オプション

| 頻度 | 説明 |
|------|------|
| Hourly | 毎時実行 |
| Daily | 1 日 1 回（デフォルト午前 9 時） |
| Weekdays | 平日のみ 1 日 1 回 |
| Weekly | 週 1 回 |

カスタムインターバルは、最も近いプリセットを選択後、CLI で `/schedule update` を実行して調整します。

### タスクの管理

- **Run now**: スケジュールを待たず即時実行
- **Pause / Resume**: スケジュールの一時停止・再開
- **Edit**: 名前、プロンプト、スケジュール、リポジトリ、環境、コネクタを変更
- **Delete**: タスクを削除（過去のセッションは残る）

CLI からは `/schedule list`、`/schedule update`、`/schedule run` で管理。

---

## 7. cron 式リファレンス

5 フィールド形式：`分 時 日 月 曜日`

| 例 | 意味 |
|-----|------|
| `*/5 * * * *` | 5 分ごと |
| `0 * * * *` | 毎時 0 分 |
| `7 * * * *` | 毎時 7 分 |
| `0 9 * * *` | 毎日 9:00 |
| `0 9 * * 1-5` | 平日 9:00 |
| `30 14 15 3 *` | 3 月 15 日 14:30 |

曜日：`0` または `7` = 日曜、`1` = 月曜、...、`6` = 土曜。`L`、`W`、`?` や `MON` などの名前エイリアスは非サポート。

---

## ハンズオン演習

### 演習 1: `/loop` でデプロイ監視

```
/loop 5m check git log --oneline -5 and tell me if there are new commits
```

設定後、`what scheduled tasks do I have?` で確認し、完了後 `cancel the commit check` でキャンセルしてください。

### 演習 2: ワンショットリマインダー

```
in 2 minutes, remind me to review the open PRs
```

2 分後にリマインダーが発火するのを確認してください。

### 演習 3: Cloud スケジュールタスク（Web）

1. [claude.ai/code/scheduled](https://claude.ai/code/scheduled) にアクセス
2. 「毎日 9:00 にオープン PR を確認する」タスクを作成
3. **Run now** で即時実行し、結果を確認

---

## よくある質問

**Q: `/loop` のタスクはセッション終了後も残りますか？**
A: いいえ。セッションスコープなので、セッション終了で消滅します。永続化には Cloud または Desktop スケジュールタスクを使用してください。

**Q: Cloud タスクからローカルファイルにアクセスできますか？**
A: いいえ。Cloud タスクは GitHub リポジトリをクローンして実行します。ローカルファイルへのアクセスには Desktop スケジュールタスクを使用してください。

**Q: スケジューリングを無効化できますか？**
A: はい。環境変数 `CLAUDE_CODE_DISABLE_CRON=1` でスケジューラーを完全に無効化できます。

---

## まとめ

- 3 種類のスケジューリング：Cloud（信頼性）、Desktop（ローカルアクセス）、`/loop`（セッション内ポーリング）
- `/loop` は最も簡単な定期実行手段で、自然言語でリマインダーも設定可能
- Cloud スケジュールタスクは Web / Desktop / CLI から作成でき、マシン電源に依存しない
- cron 式は 5 フィールド形式で、ローカルタイムゾーンで解釈される
- セッションスコープのタスクは 3 日で自動期限切れ

## 次のステップ

Week 7 のチーム開発はこれで完了です。次は [Week 8: 上級・エンタープライズ](../week-08_advanced-enterprise/README.md) に進み、セキュリティ・サンドボックス・大規模導入を学びます。

---

> **公式リファレンス**
> - [Run prompts on a schedule](https://code.claude.com/docs/en/scheduled-tasks)
> - [Schedule tasks on the web](https://code.claude.com/docs/en/web-scheduled-tasks)
> - [Desktop scheduled tasks](https://code.claude.com/docs/en/desktop)
> - [GitHub Actions](https://code.claude.com/docs/en/github-actions)
