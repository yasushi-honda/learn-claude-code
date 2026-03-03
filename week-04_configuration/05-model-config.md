# モデル設定

> 対応する公式ドキュメント: [Model configuration](https://code.claude.com/docs/en/model-config)

## 学習目標

- 利用可能なモデルとそのエイリアスを理解する
- opusplan の仕組みとコスト効率の良い使い方を習得する
- `/model` コマンドと `--model` フラグの使い方を覚える
- Fast mode の特徴と使い方を理解する
- モデルのコストと性能のトレードオフを把握する

## 概要

Claude Code では複数のモデルを切り替えて使用できます。タスクの複雑さに応じて適切なモデルを選ぶことで、コストと性能のバランスを最適化できます。特に `opusplan` エイリアスは、計画に高性能な Opus を使い実装に効率的な Sonnet を使うというハイブリッドアプローチで、最大のコストパフォーマンスを実現します。

## 利用可能なモデルエイリアス

| エイリアス | 動作 | 主な用途 |
|----------|------|---------|
| `default` | アカウントタイプに基づく推奨モデル | 通常の使用 |
| `sonnet` | 最新の Sonnet モデル（現在: Sonnet 4.6） | 日常的なコーディング |
| `opus` | 最新の Opus モデル（現在: Opus 4.6） | 複雑な推論 |
| `haiku` | 高速・軽量なモデル | シンプルなタスク |
| `sonnet[1m]` | 100万トークンコンテキスト窓の Sonnet | 大規模コードベースの長いセッション |
| `opusplan` | プランモード中は Opus、実行中は Sonnet | 計画と実装を最適化 |

エイリアスは常に最新バージョンを指します。特定バージョンに固定するには `claude-opus-4-6` などの完全なモデル名を使用します。

## モデルの設定方法（優先順位順）

### 1. セッション中に切り替え（最高優先度）

```
/model sonnet
/model opus
/model haiku
/model opusplan
```

`/model` コマンドを実行すると、インタラクティブなピッカーが表示されます。左右矢印キーで Opus 4.6 の努力レベルを調整できます。

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

## opusplan の詳細

`opusplan` は特別なモデルエイリアスです：

- **プランモード中**: `opus` を使用（複雑な推論とアーキテクチャ決定）
- **実行モード中**: 自動的に `sonnet` に切り替える（コード生成と実装）

### なぜ opusplan が効率的か

| モデル | 入力/出力コスト（per MTok） | 主な強み |
|-------|-------------------------|---------|
| **Opus 4.6** | $15 / $75 | 深い推論、設計判断 |
| **Sonnet 4.6** | $3 / $15 | コーディング全般（Opus 級の性能） |

Sonnet 4.6 は SWE-bench で Opus 4.6 との差が約1.2pt（79.6% vs 80.8%）ですが、コストは約1/5です。計画に Opus を使い、実装に Sonnet を使う `opusplan` は、**最高の推論で計画を立て、効率的なコストで実装する**というベストプラクティスです。

### opusplan の使い方

```bash
# opusplan で起動
claude --model opusplan
```

または設定ファイルで：

```json
{
  "model": "opusplan"
}
```

プランモード（Shift+Tab で切り替え）が有効な場合は Opus が使われ、実装フェーズでは自動的に Sonnet になります。

## Fast Mode

Fast mode は**同じ Opus 4.6 モデル**を使いながら、より速いレスポンスを実現します（異なるモデルへの切り替えではありません）。

### 有効化

```
/fast
```

コマンドでトグルできます。または `/config` コマンドからも設定できます。

## 努力レベル（Opus 4.6）

Opus 4.6 では適応的推論の努力レベルを調整できます：

| レベル | 特徴 |
|-------|------|
| **low** | シンプルなタスクに最適（高速・低コスト） |
| **medium** | バランス型 |
| **high** | 複雑な問題への深い推論（デフォルト） |

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

## 100万トークンコンテキスト（拡張コンテキスト）

Opus 4.6 と Sonnet 4.6 は100万トークンのコンテキスト窓をサポートしています（ベータ版）。

### 使い方

```
/model sonnet[1m]
/model claude-sonnet-4-6[1m]
```

### 料金の仕組み

- 200K トークンまで: 標準料金
- 200K トークン超: 長コンテキスト料金（サブスクライバーはエクストラ使用量として課金）

無効化するには：

```bash
export CLAUDE_CODE_DISABLE_1M_CONTEXT=1
```

## 現在のモデルの確認

現在使用中のモデルを確認する方法：

1. **ステータスライン**: 設定済みの場合、ターミナル下部に表示
2. **`/status` コマンド**: モデル情報とアカウント情報を表示

## モデル制限（組織管理者向け）

管理者は `availableModels` で選択可能なモデルを制限できます：

```json
// Managed 設定
{
  "availableModels": ["sonnet", "haiku"]
}
```

この設定があると、ユーザーは `/model`・`--model`・環境変数でリスト外のモデルに変更できなくなります。

完全なモデル管理の例：

```json
{
  "model": "sonnet",
  "availableModels": ["sonnet", "haiku"]
}
```

## サードパーティプロバイダー（Bedrock・Vertex AI）でのモデル固定

Amazon Bedrock や Google Vertex AI 経由で使用する場合、エイリアスが新バージョンに更新されたときに問題が起きないよう、モデルを固定することを強く推奨します：

```bash
# Bedrock の例
export ANTHROPIC_DEFAULT_OPUS_MODEL='us.anthropic.claude-opus-4-6-v1'
export ANTHROPIC_DEFAULT_SONNET_MODEL='us.anthropic.claude-sonnet-4-6-20251101-v1:0'
export ANTHROPIC_DEFAULT_HAIKU_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
```

## まとめ

- `sonnet`、`opus`、`haiku`、`opusplan` などのエイリアスで簡単にモデルを選べる
- `opusplan` は計画=Opus、実装=Sonnet で最高のコストパフォーマンス
- `/model` コマンドでセッション中にいつでも切り替え可能
- Fast mode は同じ Opus 4.6 で高速レスポンスを実現（`/fast` でトグル）
- Opus 4.6 の努力レベルで推論の深さとコストを調整できる
- `sonnet[1m]` で大規模コードベース向けの100万トークンコンテキストが使える

## 公式リファレンス

- [モデル設定](https://code.claude.com/docs/en/model-config)
- [コスト](https://code.claude.com/docs/en/costs)
- [設定ファイル](https://code.claude.com/docs/en/settings)
