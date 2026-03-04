# モデル設定

> **対応公式ドキュメント**: https://code.claude.com/docs/en/model-config
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. モデルエイリアス（default、sonnet、opus、haiku、opusplan、sonnet[1m]）を理解し、適切に使い分けられる
2. モデル設定の優先順位（セッション中 > 起動時 > 環境変数 > settings）を正確に説明できる
3. opusplan の仕組みとコストパフォーマンスの利点を理解し、実務で活用できる
4. Effort Level と Extended Context（1M tokens）の設定方法を把握できる

---

## 1. 利用可能なモデルとエイリアス

Claude Code では複数のモデルを切り替えて使用できます。タスクの複雑さに応じて適切なモデルを選ぶことで、コストと性能のバランスを最適化できます。

### モデルエイリアス

| エイリアス | 動作 | 主な用途 |
|----------|------|---------|
| `default` | アカウントタイプに基づく推奨モデル | 通常の使用 |
| `sonnet` | 最新の Sonnet（現在: Sonnet 4.6） | 日常的なコーディング |
| `opus` | 最新の Opus（現在: Opus 4.6） | 複雑な推論 |
| `haiku` | 高速・軽量なモデル | シンプルなタスク |
| `sonnet[1m]` | 100万トークンコンテキストの Sonnet | 大規模コードベースの長いセッション |
| `opusplan` | Plan mode は Opus、実行は Sonnet | 計画と実装を最適化 |

エイリアスは常に最新バージョンを指します。特定バージョンに固定するには `claude-opus-4-6` などの完全なモデル名を使用します。

### デフォルトモデルの割り当て

アカウントタイプによってデフォルトモデルが異なります。

| アカウントタイプ | default エイリアスのモデル |
|--------------|----------------------|
| Max / Team Premium | Opus 4.6 |
| Pro / Team Standard | Sonnet 4.6 |

### availableModels による制限

管理者は `availableModels` で選択可能なモデルを制限できます。`default` は常に利用可能です。

```json
// Managed 設定
{
  "availableModels": ["sonnet", "haiku"]
}
```

この設定があると、ユーザーは `/model`、`--model`、環境変数でリスト外のモデルに変更できなくなります。

---

## 2. モデルの設定方法と優先順位

モデル設定は4つの方法で指定でき、以下の優先順位で適用されます。

### 1. セッション中に切り替え（最高優先度）

```
/model sonnet
/model opus
/model haiku
/model opusplan
```

`/model` コマンドを実行すると、インタラクティブなピッカーが表示されます。左右矢印キーで Opus 4.6 の Effort Level を調整できます。

### 2. 起動時のフラグ

```bash
claude --model opus
claude --model sonnet
claude --model opusplan
```

### 3. 環境変数

```bash
export ANTHROPIC_MODEL=sonnet
```

### 4. 設定ファイル（最低優先度）

```json
// ~/.claude/settings.json または .claude/settings.json
{
  "model": "sonnet"
}
```

### 優先順位のまとめ

```
セッション中の /model （最高）
    ↓
起動時の --model フラグ
    ↓
環境変数 ANTHROPIC_MODEL
    ↓
settings.json の model キー（最低）
```

---

## 3. opusplan の詳細

`opusplan` は Claude Code の中で最もコストパフォーマンスの高いモデル設定です。

### 仕組み

- **Plan mode 中**: `opus` を使用（複雑な推論とアーキテクチャ決定）
- **実行モード中**: 自動的に `sonnet` に切り替え（コード生成と実装）

Shift+Tab で Plan mode を有効にすると Opus が使われ、実装フェーズでは自動的に Sonnet になります。

### なぜ opusplan が効率的か

| モデル | Input / Output (per MTok) | Cache Write / Read | 主な強み |
|-------|--------------------------|-------------------|---------|
| **Opus 4.6** | $15 / $75 | $18.75 / $1.875 | 深い推論、設計判断 |
| **Sonnet 4.6** | $3 / $15 | $3.75 / $0.375 | コーディング全般（Opus 級性能） |
| **Haiku 4.5** | $1 / $5 | $1.25 / $0.10 | 機械的タスク |

Sonnet 4.6 は SWE-bench で Opus 4.6 との差が約1.2pt（79.6% vs 80.8%）ですが、コストは約1/5です。**最高の推論で計画を立て、効率的なコストで実装する**のが opusplan のベストプラクティスです。

### opusplan の使い方

```bash
# 起動時に指定
claude --model opusplan
```

または設定ファイルで：

```json
{
  "model": "opusplan"
}
```

---

## 4. Effort Level（推論の深さ）

Opus 4.6 では適応的推論の努力レベルを調整できます。

| レベル | 特徴 | 推奨シーン |
|-------|------|----------|
| **low** | 高速・低コスト | シンプルなタスク（ファイル名変更、フォーマット修正） |
| **medium** | バランス型 | 通常のコーディング作業 |
| **high** | 深い推論（デフォルト） | 複雑なバグ修正、アーキテクチャ設計 |

### 設定方法

**`/model` コマンド内で**: Opus を選択後、左右矢印キーで調整

**環境変数**:
```bash
export CLAUDE_CODE_EFFORT_LEVEL=low  # low, medium, high
```

**設定ファイル**:
```json
{
  "effortLevel": "medium"
}
```

---

## 5. Extended Context（100万トークン）

Opus 4.6 と Sonnet 4.6 は100万トークンのコンテキストウィンドウをサポートしています（ベータ版）。

### 使い方

```
/model sonnet[1m]
/model claude-sonnet-4-6[1m]
```

### 料金の仕組み

- **200K トークンまで**: 標準料金
- **200K トークン超**: 長コンテキスト料金（サブスクライバーはエクストラ使用量として課金）

### 無効化

```bash
export CLAUDE_CODE_DISABLE_1M_CONTEXT=1
```

---

## 6. 環境変数によるモデル固定

### エイリアスのマッピング変更

各エイリアスが指すモデルを環境変数で変更できます。

```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL='claude-opus-4-6'
export ANTHROPIC_DEFAULT_SONNET_MODEL='claude-sonnet-4-6'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='claude-haiku-4-5'
```

### サブエージェントのモデル指定

```bash
export CLAUDE_CODE_SUBAGENT_MODEL=sonnet
```

### Prompt Caching の制御

```bash
# 全モデルのキャッシュ無効化
export DISABLE_PROMPT_CACHING=1

# モデル別の無効化
export DISABLE_PROMPT_CACHING_HAIKU=1
export DISABLE_PROMPT_CACHING_SONNET=1
export DISABLE_PROMPT_CACHING_OPUS=1
```

### サードパーティプロバイダーでのモデル固定

Amazon Bedrock や Google Vertex AI 経由で使用する場合、エイリアスが新バージョンに更新されたときに問題が起きないよう、モデルをピン留めすることを推奨します。

```bash
# Bedrock の例
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6-20251101-v1:0'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

---

## 7. 現在のモデルの確認

使用中のモデルを確認する方法は2つあります。

1. **ステータスライン**: 設定済みの場合、ターミナル下部に表示される
2. **`/status` コマンド**: モデル情報とアカウント情報を表示

---

## ハンズオン演習

### 演習 1: モデルの切り替えと優先順位を体験する

**目的**: 4つの設定方法の優先順位を体験的に理解する

**前提条件**: Claude Code がインストール済み

**手順**:

1. settings.json にモデルを設定:
   ```json
   // ~/.claude/settings.json
   {
     "model": "haiku"
   }
   ```

2. Claude Code を起動し、`/status` でモデルが `haiku` であることを確認

3. 環境変数でオーバーライドして起動:
   ```bash
   ANTHROPIC_MODEL=sonnet claude
   ```
   `/status` で `sonnet` になっていることを確認

4. CLI 引数で起動:
   ```bash
   claude --model opus
   ```
   `/status` で `opus` になっていることを確認

5. セッション中に `/model haiku` で切り替え、最も高い優先度であることを確認

**期待される結果**: セッション中 > CLI 引数 > 環境変数 > settings.json の優先順位が確認できる。

### 演習 2: opusplan のプランモード/実行モードを体験する

**目的**: opusplan の自動モデル切り替えを体験する

**手順**:

1. opusplan で起動:
   ```bash
   claude --model opusplan
   ```

2. Shift+Tab で Plan mode に切り替え

3. 「このプロジェクトのアーキテクチャを分析して改善案を出してください」と依頼
   → Opus で計画が行われる

4. Shift+Tab で実行モードに戻す

5. 「改善案に基づいてリファクタリングしてください」と依頼
   → Sonnet で実装が行われる

**期待される結果**: Plan mode では高精度な分析が行われ、実行モードではコスト効率の良い実装が行われる。

### 演習 3: Effort Level を調整する

**目的**: Effort Level による応答速度とコストの違いを体験する

**手順**:

1. Claude Code を起動
2. `/model` でモデルピッカーを開く
3. Opus を選択し、左右矢印キーで Effort Level を `low` に設定
4. 「現在の日時を表示して」などシンプルなタスクを依頼（高速に応答するはず）
5. Effort Level を `high` に変更
6. 「このファイルのパフォーマンスを最適化する方法を分析して」など複雑なタスクを依頼

**期待される結果**: `low` ではシンプルなタスクに高速で応答し、`high` では複雑なタスクに深い推論で応答する。

---

## よくある質問

**Q: opusplan と opus の違いは何ですか？**
A: `opus` は常に Opus モデルを使用します。`opusplan` は Plan mode では Opus、実行モードでは Sonnet を自動で切り替えます。日常的な使用では `opusplan` がコストパフォーマンスに優れます。

**Q: Fast mode は別のモデルに切り替わるのですか？**
A: いいえ。Fast mode は同じ Opus 4.6 モデルを使いながら、より速いレスポンスを実現します。`/fast` でトグルできます。

**Q: 100万トークンコンテキストはいつ使うべきですか？**
A: 大規模なコードベースで長いセッションを行う場合に有効です。ただし200K トークンを超えると長コンテキスト料金が適用されるため、コストを意識して使いましょう。

**Q: availableModels でモデルを制限した場合、default は使えますか？**
A: はい。`default` は常に利用可能です。`availableModels` はそれ以外のモデルの選択を制限します。

**Q: Bedrock/Vertex AI で使う場合、エイリアスはそのまま使えますか？**
A: エイリアスは使えますが、新バージョンに更新された際に問題が発生する可能性があります。`ANTHROPIC_DEFAULT_*_MODEL` 環境変数で完全なモデル名にピン留めすることを推奨します。

---

## まとめ

この章で学んだ重要ポイント：

- **6つのエイリアス**（default、sonnet、opus、haiku、sonnet[1m]、opusplan）で簡単にモデルを選べる
- 優先順位は**セッション中 > CLI 引数 > 環境変数 > settings.json**
- **opusplan** は計画=Opus、実装=Sonnet で最高のコストパフォーマンスを実現
- **Effort Level**（low/medium/high）で推論の深さとコストを調整できる
- **Extended Context**（1M tokens）で大規模コードベース向けの長いセッションが可能
- `availableModels` で組織内のモデル選択を**制限**できる

## 次のステップ

次の章「キーバインドカスタマイズ」では、Claude Code のキーボードショートカットをカスタマイズして作業効率を高める方法を学びます。

---

> **公式リファレンス**
> - [Model configuration](https://code.claude.com/docs/en/model-config)
> - [Costs](https://code.claude.com/docs/en/costs)
> - [Settings](https://code.claude.com/docs/en/settings)
