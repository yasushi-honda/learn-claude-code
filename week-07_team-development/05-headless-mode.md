# Headless/プログラマティック実行

> 対応する公式ドキュメント: [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)

## 学習目標

- Agent SDKの概要とCLI（`claude -p`）との関係を理解する
- `--output-format json/stream-json`による構造化出力の取得方法を習得する
- `--json-schema`による型付き構造化出力の生成を実践できる
- `--max-turns`・`--allowedTools`などのCLIフラグを適切に使える
- CI/CDパイプラインやスクリプトにClaude Codeを組み込める

## 概要

Agent SDKは、Claude Codeを動かすツール・エージェントループ・コンテキスト管理を提供するSDKです。CLIからスクリプトやCI/CDに組み込む方法と、PythonやTypeScriptからプログラム的に制御する方法の両方をサポートします。

CLIからプログラム的に実行するには`-p`フラグを使います：

```bash
claude -p "auth.pyのバグを見つけて修正してください" --allowedTools "Read,Edit,Bash"
```

> **注意**: CLIは以前「headless mode（ヘッドレスモード）」と呼ばれていました。`-p`フラグとすべてのCLIオプションは同じように動作します。

## 本文

### 基本的な使い方

`-p`（または`--print`）フラグを`claude`コマンドに追加するだけで非対話的に実行できます：

```bash
# コードベースについて質問する
claude -p "authモジュールは何をしていますか？"
```

`-p`と組み合わせて使える主なCLIオプション：
- `--continue`: 最近の会話を継続
- `--allowedTools`: ツールを自動承認
- `--output-format`: 構造化出力を指定

### 構造化出力の取得

`--output-format`で応答の形式を制御できます：

| 値 | 説明 |
|----|------|
| `text`（デフォルト） | プレーンテキスト出力 |
| `json` | セッションIDとメタデータを含む構造化JSON |
| `stream-json` | リアルタイムストリーミング用の改行区切りJSON |

#### JSON出力

```bash
claude -p "このプロジェクトを要約してください" --output-format json
```

出力例：
```json
{
  "result": "このプロジェクトはユーザー認証を担当するモジュール群で...",
  "session_id": "sess_abc123",
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 567
  }
}
```

`jq`でフィールドを抽出：
```bash
# テキスト結果のみ取得
claude -p "プロジェクトを要約してください" --output-format json | jq -r '.result'

# セッションIDを変数に保存
session_id=$(claude -p "レビューを開始してください" --output-format json | jq -r '.session_id')
```

### JSON Schemaによる型付き出力

`--json-schema`を`--output-format json`と組み合わせて、特定のスキーマに準拠した出力を取得できます：

```bash
claude -p "auth.pyから主要な関数名を抽出してください" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}'
```

出力の`structured_output`フィールドに型付きデータが含まれます：
```json
{
  "result": "...",
  "structured_output": {
    "functions": ["login", "logout", "refreshToken", "validateSession"]
  }
}
```

```bash
# 構造化出力のみ取得
claude -p "auth.pyの関数名を抽出してください" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```

### ストリーミング出力

`--output-format stream-json`で生成されたトークンをリアルタイムで受信：

```bash
claude -p "再帰を説明してください" --output-format stream-json --verbose --include-partial-messages
```

テキストデルタのみをフィルタリングして表示：
```bash
claude -p "詩を書いてください" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

### ツールの自動承認

`--allowedTools`で特定のツールを許可リストに追加し、承認プロンプトなしで実行：

```bash
# テストを実行して失敗を修正（Bash・Read・Editを自動承認）
claude -p "テストスイートを実行して失敗を修正してください" \
  --allowedTools "Bash,Read,Edit"
```

特定のBashコマンドパターンのみ許可する場合：

```bash
# git操作のみ許可（スペース + * でプレフィックスマッチング）
claude -p "ステージされた変更を確認して適切なコミットを作成してください" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

> **注意**: `Bash(git diff *)` のスペースの後の`*`が重要です。スペースなしの `Bash(git diff*)` は `git diff-index` なども一致してしまいます。

### システムプロンプトのカスタマイズ

`--append-system-prompt`でデフォルトの動作を保持しながら指示を追加：

```bash
# PRのdiffをパイプして、セキュリティ観点でレビュー
gh pr diff "$1" | claude -p \
  --append-system-prompt "あなたはセキュリティエンジニアです。脆弱性をレビューしてください。" \
  --output-format json
```

### 会話の継続

`--continue`で最近の会話を継続：

```bash
# 最初のリクエスト
claude -p "このコードベースのパフォーマンス問題をレビューしてください"

# 最近の会話を継続
claude -p "データベースクエリに絞ってください" --continue
claude -p "発見した全問題のサマリーを作成してください" --continue
```

特定の会話を`--resume`で再開：

```bash
# セッションIDを保存
session_id=$(claude -p "レビューを開始してください" --output-format json | jq -r '.session_id')

# そのセッションを再開
claude -p "レビューを続けてください" --resume "$session_id"
```

### CI/CDでの実践例

#### コミット作成の自動化

```bash
claude -p "ステージされた変更を確認して適切なコミットを作成してください" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

#### PRレビューの自動化

```bash
#!/bin/bash
# PR番号を引数として受け取る
PR_NUMBER=$1

gh pr diff "$PR_NUMBER" | claude -p \
  --append-system-prompt "このPRをセキュリティ・パフォーマンス・コード品質の観点でレビューしてください。" \
  --output-format json | jq -r '.result'
```

#### ファイル群のバッチ処理

```bash
# マイグレーション対象ファイルのリストを取得
files=$(claude -p "ReactからVueへの移行が必要なすべてのファイルをリストアップ" --output-format json | jq -r '.result')

# 各ファイルを並列処理
for file in $files; do
  claude -p "ReactコードをVueに移行してください: $file" \
    --allowedTools "Edit,Bash(git commit *)" &
done
wait
```

#### ログ解析

```bash
cat error.log | claude -p \
  "このエラーログを分析して、最も頻繁なエラーパターンと推奨される修正をJSON形式でまとめてください" \
  --output-format json \
  --json-schema '{
    "type": "object",
    "properties": {
      "patterns": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "error": {"type": "string"},
            "count": {"type": "number"},
            "fix": {"type": "string"}
          }
        }
      }
    }
  }' | jq '.structured_output'
```

### Python SDKとTypeScript SDKの活用

より高度なプログラム制御にはAgent SDKのPythonやTypeScriptパッケージが利用できます。

**Python SDK:**
```python
# 詳細はAgent SDK公式ドキュメントを参照
# https://platform.claude.com/docs/en/agent-sdk/python
```

**TypeScript SDK:**
```typescript
// 詳細はAgent SDK公式ドキュメントを参照
// https://platform.claude.com/docs/en/agent-sdk/typescript
```

SDKでは以下の機能が追加されます：
- 構造化出力（typed outputs）
- ツール承認コールバック
- ネイティブメッセージオブジェクト
- リアルタイムストリーミングコールバック

### 主要なCLIオプション一覧

| オプション | 説明 |
|-----------|------|
| `-p, --print` | 非対話的モード（必須） |
| `--output-format` | `text`、`json`、`stream-json` |
| `--json-schema` | 構造化出力のJSONスキーマ |
| `--allowedTools` | 自動承認するツールのリスト |
| `--max-turns` | 最大会話ターン数 |
| `--continue` | 最近の会話を継続 |
| `--resume` | セッションIDで会話を再開 |
| `--append-system-prompt` | システムプロンプトに追加 |
| `--system-prompt` | システムプロンプトを完全に置き換え |
| `--verbose` | デバッグ出力を有効化 |
| `--include-partial-messages` | ストリーミング中の部分メッセージを含める |

> **注意**: `claude -p`モードでは、`/commit`などのユーザー起動スキルや`/clear`などの組み込みコマンドは利用できません。タスクを自然言語で説明してください。

### コスト管理のためのフラグ

```bash
# 最大APIコストを設定（ドル単位）
claude -p "大規模な調査を実行してください" --max-budget-usd 0.50

# ターン数を制限してコスト制御
claude -p "テストを修正してください" --max-turns 5
```

## まとめ

- `claude -p "プロンプト"`でClaude Codeを非対話的に実行できる
- `--output-format json`でセッションIDやメタデータを含む構造化出力を取得
- `--json-schema`と組み合わせると型付きの構造化データを抽出できる
- `--output-format stream-json`でリアルタイムストリーミングが可能
- `--allowedTools`で特定のツールをCI/CD環境で自動承認
- `--continue`と`--resume`で会話を跨いだ長期的な作業が可能
- スクリプト・シェルパイプライン・CI/CDの各段階に組み込める
- より高度な制御にはPython/TypeScript版Agent SDKを活用

## 公式リファレンス

- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless) - 公式ドキュメント
- [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview) - Agent SDK全体のドキュメント
- [CLI reference](https://code.claude.com/docs/en/cli-reference) - 全CLIフラグとオプション
- [GitHub Actions](https://code.claude.com/docs/en/github-actions) - GitHub Actionsとの連携
- [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) - GitLab CI/CDとの連携
