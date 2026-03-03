# 出力スタイル設定

> 対応する公式ドキュメント: [Output styles](https://code.claude.com/docs/en/output-styles)

## 学習目標

- 出力スタイルの概念と種類を理解する
- `/output-style` コマンドで出力スタイルを変更する方法を習得する
- カスタム出力スタイルの作成方法を理解する
- `--output-format` フラグの使い方を理解する
- ソフトウェアエンジニアリング以外での活用方法を把握する

## 概要

出力スタイルは、Claude Code を様々なエージェントとして活用するための機能です。デフォルトはソフトウェアエンジニアリングタスクに最適化されていますが、スタイルを変更することで教育モードやカスタムエージェントとして機能させることができます。出力スタイルは Claude Code のシステムプロンプトを直接変更します。

## ビルトインの出力スタイル

### Default（デフォルト）

既存のシステムプロンプトで、ソフトウェアエンジニアリングタスクを効率的にこなすよう設計されています。

### Explanatory（解説型）

```
/output-style explanatory
```

コーディングタスクの合間に教育的な「インサイト」を提供します。実装の選択やコードベースのパターンを理解するのに役立ちます。

**特徴**:
- 変更を加えながらその理由を説明する
- コードベースのパターンを解説する
- コーディング規約を教育的に提示する

### Learning（学習型）

```
/output-style learning
```

一緒にコードを書いて学ぶモードです。Claude がコードを書くだけでなく、あなたにも重要な部分を実装させる協調的なアプローチです。

**特徴**:
- コードに `TODO(human)` マーカーを挿入してあなたに実装を促す
- 解説しながらインサイトを共有する
- 学習効果を最大化する段階的な実装

## 出力スタイルの変更

### コマンドメニューから変更

```
/output-style
```

メニューが表示され、利用可能なスタイルを選択できます。`/config` メニューからもアクセスできます。

### 直接指定して変更

```
/output-style explanatory
/output-style learning
/output-style default
```

変更はローカルプロジェクトレベルで保存され、`.claude/settings.local.json` に記録されます。

### 設定ファイルで指定

```json
{
  "outputStyle": "Explanatory"
}
```

## カスタム出力スタイルの作成

カスタム出力スタイルはフロントマター付きの Markdown ファイルで定義します。

### ファイルの保存場所

- **ユーザーレベル**: `~/.claude/output-styles/`（全プロジェクトで使用可能）
- **プロジェクトレベル**: `.claude/output-styles/`（プロジェクト内のみ）

### ファイルフォーマット

```markdown
---
name: My Custom Style
description:
  このスタイルが何をするかの簡単な説明（ユーザーに表示される）
keep-coding-instructions: false
---

# カスタムスタイルの指示

あなたはソフトウェアエンジニアリングタスクをサポートするインタラクティブな CLI ツールです。
[カスタム指示をここに記述...]

## 具体的な動作

[このスタイルでの振る舞いを定義...]
```

### フロントマター

| フィールド | 用途 | デフォルト |
|----------|------|----------|
| `name` | スタイルの名前（ファイル名と異なる場合） | ファイル名を継承 |
| `description` | `/output-style` UIに表示される説明 | なし |
| `keep-coding-instructions` | コーディング関連のシステムプロンプトを保持するか | `false` |

## 出力スタイルの仕組み

出力スタイルは Claude Code のシステムプロンプトを変更します：

- **全スタイル共通**: 効率的な出力のための指示（簡潔に応答するなど）を除外
- **カスタムスタイル**: `keep-coding-instructions` が false の場合、コーディング関連の指示（テストで検証するなど）を除外
- **全スタイル共通**: カスタム指示をシステムプロンプトの末尾に追加
- **全スタイル共通**: 会話中、スタイルの指示に従うようリマインダーを送信

## 出力スタイル vs 関連機能

### CLAUDE.md との違い

| | CLAUDE.md | 出力スタイル |
|--|----------|-----------|
| 変更対象 | なし（ユーザーメッセージとして追加） | システムプロンプトを直接変更 |
| 位置 | デフォルトシステムプロンプトの後 | システムプロンプト自体を変更 |
| 用途 | プロジェクト固有の指示 | 全体的な動作モード |

### スキルとの違い

| | 出力スタイル | スキル |
|--|------------|------|
| 適用時期 | 選択後は常時 | 呼び出し時または関連ある場合のみ |
| 用途 | 一貫したフォーマット・トーン | 再利用可能なワークフロー |

### --append-system-prompt との違い

`--append-system-prompt` はデフォルトシステムプロンプトをそのまま保持してコンテンツを追加しますが、カスタム出力スタイルは（`keep-coding-instructions` が false の場合）コーディング固有の指示を除外してシステムプロンプトを置き換えます。

## --output-format フラグ（CLI）

コマンドラインから出力フォーマットを指定できます：

```bash
# テキスト形式（デフォルト）
claude --output-format text "コードをレビューして"

# JSON 形式
claude --output-format json "コードをレビューして"

# ストリーミング JSON
claude --output-format stream-json "コードをレビューして"
```

| フォーマット | 用途 |
|-----------|------|
| `text` | 通常の対話（デフォルト） |
| `json` | プログラムからの出力処理 |
| `stream-json` | リアルタイムのストリーミング処理 |

これは `--print`（`-p`）フラグと組み合わせて使います：

```bash
claude -p "src/auth.ts の関数をリストして" --output-format json
```

## ソフトウェアエンジニアリング以外への活用

カスタム出力スタイルを使うことで、Claude Code を様々な用途に活用できます：

### テクニカルライター

```markdown
---
name: Technical Writer
description: ドキュメントと技術文書の作成を支援
keep-coding-instructions: false
---

あなたは技術文書の専門ライターです。
明確で簡潔な説明を提供し、コードよりも文章での説明を優先します。
```

### コードレビューアー

```markdown
---
name: Code Reviewer
description: 詳細なコードレビューを提供
keep-coding-instructions: true
---

あなたは厳格なコードレビューアーです。
セキュリティ・パフォーマンス・保守性の観点から問題を指摘します。
変更の提案より、問題の説明を優先してください。
```

## まとめ

- `default`、`explanatory`、`learning` の3つのビルトインスタイルがある
- `/output-style <style>` でスタイルを変更する（`.claude/settings.local.json` に保存）
- カスタムスタイルは `~/.claude/output-styles/` または `.claude/output-styles/` に Markdown ファイルで作成
- `keep-coding-instructions: true` でコーディング指示を保持できる
- `--output-format` フラグでテキスト・JSON・ストリーミング JSON を選択できる
- スクリプトや自動化には `--print` と `--output-format json` の組み合わせが有効

## 公式リファレンス

- [出力スタイル](https://code.claude.com/docs/en/output-styles)
- [スキル](https://code.claude.com/docs/en/skills)
- [CLI リファレンス](https://code.claude.com/docs/en/cli-reference)
- [ステータスライン](https://code.claude.com/docs/en/statusline)
