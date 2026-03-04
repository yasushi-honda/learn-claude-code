# Headless/プログラマティック実行

> **対応公式ドキュメント**: https://code.claude.com/docs/en/headless
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. `claude -p`による非対話的実行の基本とCLIオプションを使いこなせる
2. `--output-format json`と`--json-schema`で構造化出力を取得・活用できる
3. `--allowedTools`でCI/CD環境に適したツール自動承認を設定できる
4. シェルスクリプト・CI/CDパイプラインにClaude Codeを組み込める

---

## 1. プログラマティック実行の基本

### `-p`フラグとは

Claude Codeを非対話的（headless）に実行するには`-p`（または`--print`）フラグを使います。

```bash
claude -p "auth.pyのバグを見つけて修正してください" --allowedTools "Read,Edit,Bash"
```

このフラグを付けると、対話的なセッションを開かずにプロンプトを処理し、結果を標準出力に返します。CI/CDパイプライン、シェルスクリプト、自動化ワークフローに組み込む際に使います。

> **公式ドキュメントより**: CLIは以前「headless mode（ヘッドレスモード）」と呼ばれていました。`-p`フラグとすべてのCLIオプションは同じように動作します。

### 主要なCLIオプション一覧

| オプション | 説明 |
|-----------|------|
| `-p, --print` | 非対話的モード（必須） |
| `--output-format` | `text`/`json`/`stream-json` |
| `--json-schema` | 構造化出力のJSONスキーマ |
| `--allowedTools` | 自動承認するツールのリスト |
| `--max-turns` | 最大会話ターン数 |
| `--max-budget-usd` | 最大APIコスト（ドル単位） |
| `--continue` | 最近の会話を継続 |
| `--resume` | セッションIDで会話を再開 |
| `--append-system-prompt` | システムプロンプトに追加 |
| `--system-prompt` | システムプロンプトを完全に置き換え |
| `--verbose` | デバッグ出力を有効化 |
| `--include-partial-messages` | ストリーミング中の部分メッセージを含める |

> **注意**: `claude -p`モードでは、`/commit`などのユーザー起動スキルや`/clear`などの組み込みコマンドは利用できません。タスクを自然言語で説明してください。

---

## 2. 構造化出力

### 出力フォーマットの選択

`--output-format`で応答の形式を制御します。

| 値 | 説明 | 主な用途 |
|----|------|---------|
| `text`（デフォルト） | プレーンテキスト出力 | 人間が読む場合 |
| `json` | セッションIDとメタデータを含む構造化JSON | スクリプトでのパース |
| `stream-json` | リアルタイムストリーミング用の改行区切りJSON | リアルタイム処理 |

### JSON出力

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

`jq`でフィールドを抽出する一般的なパターン：

```bash
# テキスト結果のみ取得
claude -p "プロジェクトを要約してください" --output-format json | jq -r '.result'

# セッションIDを変数に保存
session_id=$(claude -p "レビューを開始してください" --output-format json | jq -r '.session_id')
```

### JSON Schemaによる型付き出力

`--json-schema`を`--output-format json`と組み合わせて、特定のスキーマに準拠した出力を取得できます。

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

`structured_output`フィールドのみ取得：

```bash
claude -p "auth.pyの関数名を抽出してください" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output'
```

### ストリーミング出力

`--output-format stream-json`で生成されたトークンをリアルタイムで受信できます。

```bash
claude -p "再帰を説明してください" --output-format stream-json --verbose --include-partial-messages
```

テキストデルタのみをフィルタリングして表示：

```bash
claude -p "詩を書いてください" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

---

## 3. ツールの自動承認

### `--allowedTools`の使い方

CI/CD環境では人間の承認プロンプトに応答できないため、`--allowedTools`で特定のツールを自動承認します。

```bash
# テストを実行して失敗を修正（Bash・Read・Editを自動承認）
claude -p "テストスイートを実行して失敗を修正してください" \
  --allowedTools "Bash,Read,Edit"
```

### Bashコマンドのパターンマッチング

特定のBashコマンドパターンのみ許可する場合、**スペース + `*`**でプレフィックスマッチングを行います。

```bash
# git操作のみ許可
claude -p "ステージされた変更を確認して適切なコミットを作成してください" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

> **公式ドキュメントより**: `Bash(git diff *)` のスペースの後の`*`が重要です。スペースなしの `Bash(git diff*)` は `git diff-index` なども一致してしまいます。

---

## 4. システムプロンプトのカスタマイズ

### `--append-system-prompt`

デフォルトの動作を保持しながら追加の指示を注入します。

```bash
# PRのdiffをパイプして、セキュリティ観点でレビュー
gh pr diff "$1" | claude -p \
  --append-system-prompt "あなたはセキュリティエンジニアです。脆弱性をレビューしてください。" \
  --output-format json
```

### `--system-prompt`

システムプロンプトを完全に置き換えます。Claude Codeのデフォルトの動作が変わるため、特定の用途にのみ使用してください。

---

## 5. 会話の継続と再開

### `--continue`で最近の会話を継続

```bash
# 最初のリクエスト
claude -p "このコードベースのパフォーマンス問題をレビューしてください"

# 最近の会話を継続
claude -p "データベースクエリに絞ってください" --continue
claude -p "発見した全問題のサマリーを作成してください" --continue
```

### `--resume`で特定のセッションを再開

```bash
# セッションIDを保存
session_id=$(claude -p "レビューを開始してください" --output-format json | jq -r '.session_id')

# そのセッションを再開
claude -p "レビューを続けてください" --resume "$session_id"
```

これにより、長期的なタスクを複数のスクリプト呼び出しに分割できます。

---

## 6. CI/CDでの実践例

### コミット作成の自動化

```bash
claude -p "ステージされた変更を確認して適切なコミットを作成してください" \
  --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
```

### PRレビューの自動化

```bash
#!/bin/bash
# PR番号を引数として受け取る
PR_NUMBER=$1

gh pr diff "$PR_NUMBER" | claude -p \
  --append-system-prompt "このPRをセキュリティ・パフォーマンス・コード品質の観点でレビューしてください。" \
  --output-format json | jq -r '.result'
```

### ファイル群のバッチ処理

```bash
# マイグレーション対象ファイルのリストを取得
files=$(claude -p "ReactからVueへの移行が必要なすべてのファイルをリストアップ" \
  --output-format json | jq -r '.result')

# 各ファイルを並列処理
for file in $files; do
  claude -p "ReactコードをVueに移行してください: $file" \
    --allowedTools "Edit,Bash(git commit *)" &
done
wait
```

### ログ解析

パイプで入力を渡し、JSON Schemaで構造化出力を取得する例です。

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

### コスト管理のためのフラグ

```bash
# 最大APIコストを設定（ドル単位）
claude -p "大規模な調査を実行してください" --max-budget-usd 0.50

# ターン数を制限してコスト制御
claude -p "テストを修正してください" --max-turns 5
```

---

## 7. Python SDK と TypeScript SDK

CLIの`-p`フラグに加えて、Agent SDKのPythonやTypeScriptパッケージでより高度なプログラム制御が可能です。

SDKで追加される機能：
- 構造化出力（typed outputs）
- ツール承認コールバック
- ネイティブメッセージオブジェクト
- リアルタイムストリーミングコールバック

```python
# Python SDK（詳細は公式ドキュメント参照）
# https://platform.claude.com/docs/en/agent-sdk/python
```

```typescript
// TypeScript SDK（詳細は公式ドキュメント参照）
// https://platform.claude.com/docs/en/agent-sdk/typescript
```

---

## ハンズオン演習

### 演習 1: 基本的なheadless実行

**目的**: `claude -p`の基本操作と出力フォーマットを体験する
**前提条件**: Claude Codeがインストール済みで、プロジェクトディレクトリ内にいること

**手順**:
1. プレーンテキスト出力で質問する
   ```bash
   claude -p "このプロジェクトの主な技術スタックは何ですか？"
   ```
2. JSON出力に切り替える
   ```bash
   claude -p "このプロジェクトの主な技術スタックは何ですか？" --output-format json
   ```
3. `jq`で結果を抽出する
   ```bash
   claude -p "このプロジェクトの主な技術スタックは何ですか？" --output-format json | jq -r '.result'
   ```
4. セッションIDを確認する
   ```bash
   claude -p "このプロジェクトの主な技術スタックは何ですか？" --output-format json | jq -r '.session_id'
   ```

**期待される結果**: テキスト出力とJSON出力の違いを理解し、`jq`でフィールドを抽出できる

### 演習 2: JSON Schemaによる構造化データ抽出

**目的**: `--json-schema`を使って型付きの構造化データを取得する

**手順**:
1. プロジェクト内のファイルから関数名を抽出するスキーマを定義する
   ```bash
   claude -p "src/ディレクトリの主要なファイルとそれぞれの責務を分析してください" \
     --output-format json \
     --json-schema '{
       "type": "object",
       "properties": {
         "files": {
           "type": "array",
           "items": {
             "type": "object",
             "properties": {
               "name": {"type": "string"},
               "responsibility": {"type": "string"},
               "lineCount": {"type": "number"}
             }
           }
         }
       },
       "required": ["files"]
     }'
   ```
2. `structured_output`フィールドのみを取得する
   ```bash
   # 上のコマンドの末尾に追加
   | jq '.structured_output'
   ```
3. 取得したデータを後続のスクリプトで処理する例を考える

**期待される結果**: 指定したスキーマに準拠した構造化データが`structured_output`フィールドに含まれる

### 演習 3: コミット作成スクリプトの構築

**目的**: `--allowedTools`を使ったgitコマンド制限付きの自動コミットスクリプトを作成する

**手順**:
1. 何かファイルを変更し、`git add`でステージングする
2. 以下のコマンドでClaude Codeにコミットメッセージを生成・コミットさせる
   ```bash
   claude -p "ステージされた変更を確認して適切なコミットを作成してください" \
     --allowedTools "Bash(git diff *),Bash(git log *),Bash(git status *),Bash(git commit *)"
   ```
3. `git log`でコミットが正しく作成されたことを確認する
4. このコマンドをシェルスクリプト化する

**期待される結果**: ステージされた変更に基づいた適切なコミットメッセージが自動生成され、コミットが作成される

---

## よくある質問

**Q: `--allowedTools`を指定しないとどうなりますか？**
A: `-p`モードでツール使用が必要な場合、承認プロンプトが表示されますが、非対話環境では応答できないためタイムアウトします。CI/CD環境では必ず`--allowedTools`を指定してください。

**Q: パイプ入力（stdin）をClaude Codeに渡すことはできますか？**
A: はい。`cat file.log | claude -p "このログを分析してください"`のようにパイプで入力を渡せます。ログ解析やdiffのレビューに便利です。

**Q: `--continue`と`--resume`の違いは何ですか？**
A: `--continue`は最近の（直前の）会話を自動的に継続します。`--resume`は特定のセッションIDを指定して任意のセッションを再開します。複数のセッションを管理する場合は`--resume`を使ってください。

**Q: `--max-budget-usd`を超えた場合はどうなりますか？**
A: 予算に達した時点でClaude Codeが処理を停止し、その時点までの結果が返されます。CI/CDでのコスト暴走を防ぐために設定することを推奨します。

**Q: ストリーミング出力はどのような場面で使いますか？**
A: WebUIやダッシュボードでリアルタイムにClaude Codeの出力を表示したい場合に使います。通常のスクリプトでは`json`フォーマットで十分です。

---

## まとめ

この章で学んだ重要ポイント：

- `claude -p "プロンプト"`でClaude Codeを非対話的に実行できる
- `--output-format json`で構造化出力、`--json-schema`で型付きデータを取得
- `--output-format stream-json`でリアルタイムストリーミングが可能
- `--allowedTools`でCI/CD環境向けのツール自動承認を設定。`Bash(git diff *)`のスペース+`*`パターンに注意
- `--continue`と`--resume`で会話を跨いだ長期的な作業が可能
- `--max-budget-usd`と`--max-turns`でコスト制御ができる

## 次のステップ

次の章「コスト管理・最適化」では、Claude Codeのトークンコスト構造と、チームでの効率的なコスト管理手法を学びます。

---

> **公式リファレンス**
> - [Run Claude Code programmatically](https://code.claude.com/docs/en/headless) - 公式ドキュメント
> - [CLI reference](https://code.claude.com/docs/en/cli-reference) - 全CLIフラグとオプション
> - [Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview) - Agent SDK全体のドキュメント
