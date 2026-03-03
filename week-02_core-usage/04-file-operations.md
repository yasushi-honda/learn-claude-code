# ファイル操作

> 関連する公式ドキュメント: [How Claude Code Works](https://code.claude.com/docs/en/how-claude-code-works) / [Settings](https://code.claude.com/docs/en/settings)

## 学習目標

- Claude Code が内部で使用するファイル操作ツールを理解する
- Read・Edit・Write・Glob・Grep・Bash の違いと使い分けを説明できる
- 各ツールが適切に使われるようなプロンプトを書ける
- ツールの制限と安全な使い方を理解する

## 概要

Claude Code は内部的に複数のツールを使ってファイルを操作します。ユーザーはこれらのツールを直接呼び出すのではなく、自然言語で指示を出しますが、各ツールの特性を理解することで、より効果的なプロンプトを書けるようになります。

## 本文

### ツールの全体像

Claude Code が内部で使用する主要なファイル操作ツールは以下の通りです：

| ツール | 主な用途 | 特徴 |
|---|---|---|
| **Read** | ファイルの読み取り | 画像・PDF・Jupyter Notebook も対応 |
| **Edit** | 既存ファイルの編集 | 文字列の完全一致で置換 |
| **Write** | ファイルの新規作成・完全書き換え | 既存ファイルは完全に上書き |
| **Glob** | パターンによるファイル検索 | glob パターン（`**/*.js` 等） |
| **Grep** | コンテンツの正規表現検索 | ripgrep ベース |
| **Bash** | シェルコマンドの実行 | あらゆるコマンドライン操作 |

### Read: ファイルを読み取る

**概要**: ローカルファイルシステムのファイルを読み取ります。

**対応ファイル形式:**
- テキストファイル（あらゆるプログラミング言語）
- 画像（PNG、JPG 等）
- PDF（ページ範囲指定可能、最大 20 ページ/リクエスト）
- Jupyter Notebook（`.ipynb`）- コード・テキスト・出力を組み合わせて返す

**使用される場面の例:**

```
> read the src/auth.ts file and explain the authentication flow
> look at the database schema in schema.sql
> what's in the config.json file?
```

**ヒント:**
- 大きなファイルは行番号と行数の指定でオフセット読み取り可能
- 2000 文字を超える行は切り詰められる
- PDF は 10 ページ超の場合はページ範囲を指定する必要がある

### Edit: ファイルを編集する

**概要**: 既存ファイル内の特定の文字列を新しい文字列に置換します。

**特徴:**
- 正確な文字列マッチングによる置換
- ファイル全体を上書きするのではなく、変更箇所のみ更新
- 置換する文字列がファイル内で一意でなければならない
- 置換前に変更案をプレビューして承認できる

**使用される場面の例:**

```
> fix the bug in the validateEmail function in src/utils/validation.ts
> update the API endpoint URL from /v1/users to /v2/users in all config files
> rename the function getUserById to findUserById
```

**注意事項:**
- 対象の文字列がファイル内で複数箇所にある場合、より多くのコンテキストを含む文字列が必要
- セキュリティ上の問題を避けるために、Claude Code は変更前に確認を求める

### Write: ファイルを作成・書き換える

**概要**: 新しいファイルを作成するか、既存ファイルを完全に書き換えます。

**特徴:**
- 存在しないファイルの新規作成
- 既存ファイルの完全な書き換え（元の内容は失われる）
- 大きな変更や構造の完全な変更に適している

**使用される場面の例:**

```
> create a new React component for the user profile page
> create a README.md with installation instructions
> rewrite the auth module to use JWT instead of sessions
```

**注意事項:**
- 既存ファイルへの書き込みは元のコンテキストを破棄するため、小さな変更には Edit を使う
- `Write` は本質的に破壊的操作なので、Claude Code は事前に確認を求める

### Glob: パターンでファイルを検索する

**概要**: glob パターンを使ってファイルを検索します。

**パターン例:**

| パターン | マッチするファイル |
|---|---|
| `**/*.ts` | すべての TypeScript ファイル |
| `src/**/*.js` | src ディレクトリ以下のすべての JS ファイル |
| `*.{ts,tsx}` | TS または TSX ファイル |
| `**/__tests__/**` | tests ディレクトリ内のすべてのファイル |
| `**/node_modules/**` | node_modules 内のすべてのファイル |

**使用される場面の例:**

```
> find all TypeScript files in the src directory
> list all test files
> show me all configuration files
```

**特徴:**
- ファイルを変更時間順にソートして返す
- ファイル名パターンによる検索に最適

### Grep: コンテンツを検索する

**概要**: ripgrep ベースの高速なコンテンツ検索ツールです。

**特徴:**
- 完全な正規表現構文をサポート（`log.*Error`、`function\\s+\\w+` 等）
- glob パターン（`*.js`、`**/*.tsx`）またはファイルタイプ（`js`、`py`、`rust`）でファイルをフィルタリング
- 出力モード: マッチ行の表示・ファイルパスのみ・マッチ数

**正規表現の例:**

```
> find all places where we use console.log in the codebase
> search for TODO comments in TypeScript files
> find all API endpoint definitions
```

**複数行マッチング:**

ソースコード内の `interface{}` を検索するなど、特殊文字が必要な場合はエスケープが必要です。

**出力モード:**
- `files_with_matches`: マッチしたファイルパスのみ（デフォルト）
- `content`: マッチした行と前後のコンテキストを表示
- `count`: ファイルごとのマッチ数

### Bash: シェルコマンドを実行する

**概要**: ターミナルで実行できるあらゆるコマンドを実行します。

**用途:**
- ビルドコマンド（`npm run build`、`make`）
- テスト実行（`npm test`、`pytest`）
- Git 操作（`git status`、`git commit`）
- パッケージ管理（`npm install`、`pip install`）
- カスタムスクリプトの実行

**使用される場面の例:**

```
> run the test suite
> install the required dependencies
> start the development server in the background
> check git status
```

**バックグラウンド実行:**

長時間かかるコマンドはバックグラウンドで実行できます。プロンプトでバックグラウンド実行を依頼するか、`Ctrl+B` で移動できます：

```
> run npm install in the background
> start the development server in the background so we can continue working
```

**セキュリティ上の注意:**
- Bash はターミナルで実行できることすべてを実行できる
- 危険なコマンド（`rm -rf`・ファイルシステムの破壊的操作等）は Claude Code が実行前に確認を求める
- `.claude/settings.json` で信頼できるコマンドを事前承認することで確認を省略できる

### 各ツールの使い分け指針

| 状況 | 推奨ツール |
|---|---|
| ファイルの内容を理解したい | Read |
| 特定の関数・クラスを修正したい | Edit |
| 新しいファイルを作る / ファイル全体を書き直す | Write |
| 特定の名前や拡張子のファイルを探す | Glob |
| コード内の特定のパターン・文字列を探す | Grep |
| コマンド実行・ビルド・テストをしたい | Bash |

### 安全機構の理解

**チェックポイント**: すべてのファイル編集の前に、Claude Code は現在のファイルのスナップショットを保存します。`Esc` を 2 回押すか Claude に「undo してください」と伝えることで前の状態に戻せます。

**確認フロー**: デフォルトモードでは、ファイル変更やコマンド実行の前に Claude Code が確認を求めます。Auto-accept モードではファイル編集の確認が不要になりますが、コマンド実行は引き続き確認を求めます。

**`.claude/settings.json` での事前承認:**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(git status)",
      "Bash(git diff)"
    ]
  }
}
```

これにより、信頼できるコマンドは毎回確認なしで実行できます。

### ツールへのアクセス確認

セッション内でどのツールが利用可能か確認する：

```
/permissions
```

ツール使用の詳細ログを有効にする：

```
Ctrl+O    # 詳細出力のトグル
```

## まとめ

- **Read**: ファイル読み取り（テキスト・画像・PDF・Jupyter 対応）
- **Edit**: 文字列置換による精密な編集（小さな変更に最適）
- **Write**: ファイルの新規作成・完全書き換え（大きな変更に使用）
- **Glob**: パターンでファイルを検索（`**/*.ts` 等）
- **Grep**: 正規表現でコンテンツを検索（ripgrep ベース）
- **Bash**: シェルコマンドの実行（テスト・ビルド・Git 操作）
- すべての変更は**チェックポイント**で元に戻せる

## 公式リファレンス

- [How Claude Code Works](https://code.claude.com/docs/en/how-claude-code-works) - ツールとエージェントループ
- [Settings](https://code.claude.com/docs/en/settings) - 権限設定の詳細
- [Permissions](https://code.claude.com/docs/en/permissions) - パーミッションルールの構文
