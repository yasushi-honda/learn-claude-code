# ファイル操作とツール体系

> **対応公式ドキュメント**: https://code.claude.com/docs/en/how-claude-code-works
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude Code が内部で使用する5つのツールカテゴリを説明できる
2. Read・Edit・Write・Glob・Grep・Bash の違いと使い分けを理解し、適切なプロンプトを書ける
3. WebFetch・WebSearch ツールで Web コンテンツを取得・検索する方法を理解する
4. Code intelligence プラグインによるシンボル操作の利点を説明できる
5. チェックポイントと安全機構を活用してリスクを最小化できる

---

## 1. ツールの全体像：5つのカテゴリ

Claude Code はエージェントループの中で、ユーザーの自然言語指示を適切なツール呼び出しに変換します。ユーザーはこれらのツールを直接呼び出すのではなく、自然言語で指示を出しますが、各ツールの特性を理解することで、より効果的なプロンプトを書けるようになります。

> **公式ドキュメントより**: Claude Code は5つのツールカテゴリを使用します：File operations、Search、Execution、Web、Code intelligence。

### 全ツール一覧

| カテゴリ | ツール | 主な用途 |
|---|---|---|
| **File operations** | Read | ファイルの読み取り（テキスト・画像・PDF・Notebook） |
| | Edit | 文字列マッチングによる精密な編集 |
| | Write | ファイルの新規作成・完全書き換え |
| **Search** | Glob | パターンによるファイル名検索 |
| | Grep | 正規表現によるコンテンツ検索 |
| **Execution** | Bash | シェルコマンドの実行 |
| **Web** | WebFetch | URL からコンテンツを取得 |
| | WebSearch | Web 検索を実行 |
| **Code intelligence** | プラグイン提供 | シンボルの定義・参照の検索、リネーム等 |

---

## 2. File operations: Read・Edit・Write

### Read: ファイルを読み取る

**概要**: ローカルファイルシステムのファイルを読み取ります。テキストだけでなく、画像・PDF・Jupyter Notebook にも対応しています。

**対応ファイル形式:**

| ファイル形式 | 特記事項 |
|---|---|
| テキストファイル | すべてのプログラミング言語 |
| 画像（PNG、JPG 等） | Claude がビジュアルとして認識 |
| PDF | ページ範囲指定可能、最大 20 ページ/リクエスト |
| Jupyter Notebook（`.ipynb`） | コード・テキスト・出力を組み合わせて返す |

**使用される場面の例:**

```
> read the src/auth.ts file and explain the authentication flow
> look at the database schema in schema.sql
> what's in the config.json file?
```

**制約事項:**
- デフォルトで先頭 2000 行を読み取る（大きなファイルはオフセット・行数の指定が必要）
- 2000 文字を超える行は切り詰められる
- PDF は 10 ページ超の場合はページ範囲を指定する必要がある
- ディレクトリは読み取り不可（`ls` コマンドを使う）

### Edit: ファイルを精密に編集する

**概要**: 既存ファイル内の特定の文字列を新しい文字列に置換します。ファイル全体を書き換えるのではなく、変更箇所のみを更新するため、大きなファイルの小さな修正に最適です。

**特徴:**
- 正確な文字列マッチングによる置換
- 置換する文字列がファイル内で**一意でなければならない**
- 一意でない場合は、より多くの周辺コンテキストを含めて一意にする
- `replace_all` オプションで全出現箇所を一括置換可能

**使用される場面の例:**

```
> fix the bug in the validateEmail function in src/utils/validation.ts
> update the API endpoint URL from /v1/users to /v2/users in all config files
> rename the function getUserById to findUserById
```

**注意事項:**
- セキュリティ上、Claude Code は変更前に確認を求める（Auto-accept モードを除く）
- インデントの不一致で失敗することがある。Claude は既存のインデントを保持しようとする

### Write: ファイルを作成・完全書き換え

**概要**: 新しいファイルを作成するか、既存ファイルを完全に書き換えます。

**特徴:**
- 存在しないファイルの新規作成
- 既存ファイルの完全な書き換え（元の内容は失われる）
- 大きな構造変更や新規ファイル作成に適している

**使用される場面の例:**

```
> create a new React component for the user profile page
> create a README.md with installation instructions
> rewrite the auth module to use JWT instead of sessions
```

**注意事項:**
- 既存ファイルへの Write は元のコンテキストを破棄するため、**小さな変更には Edit** を使う
- Write は本質的に破壊的操作なので、Claude Code は事前に確認を求める

### Read・Edit・Write の使い分け

| やりたいこと | 推奨ツール | 理由 |
|---|---|---|
| ファイルの中身を確認 | Read | 非破壊的。画像・PDF にも対応 |
| 1箇所の関数を修正 | Edit | 変更箇所のみ更新。他の部分に影響しない |
| 変数名を一括リネーム | Edit（replace_all） | 全出現箇所を安全に置換 |
| 新しいファイルを作る | Write | 新規ファイル作成はこれ一択 |
| ファイル全体を書き直す | Write | 構造が大幅に変わる場合 |

---

## 3. Search: Glob・Grep

### Glob: パターンでファイルを検索する

**概要**: glob パターンを使ってファイルを検索します。ファイル名やディレクトリ構造の把握に最適です。

**パターン例:**

| パターン | マッチするファイル |
|---|---|
| `**/*.ts` | すべての TypeScript ファイル |
| `src/**/*.js` | src ディレクトリ以下のすべての JS ファイル |
| `*.{ts,tsx}` | TS または TSX ファイル |
| `**/__tests__/**` | tests ディレクトリ内のすべてのファイル |
| `**/package.json` | すべての package.json ファイル |

**使用される場面の例:**

```
> find all TypeScript files in the src directory
> list all test files
> show me all configuration files
```

**特徴:**
- ファイルを変更時間順にソートして返す
- コードベースのサイズに関係なく高速に動作

### Grep: コンテンツを正規表現で検索する

**概要**: ripgrep ベースの高速なコンテンツ検索ツールです。ファイルの中身を正規表現で検索します。

**特徴:**
- 完全な正規表現構文をサポート（`log.*Error`、`function\\s+\\w+` 等）
- glob パターン（`*.js`）またはファイルタイプ（`js`、`py`）でフィルタリング可能
- マルチライン検索に対応

**出力モード:**

| モード | 説明 | 用途 |
|---|---|---|
| `files_with_matches` | マッチしたファイルパスのみ | どのファイルに含まれるか知りたいとき |
| `content` | マッチした行と前後のコンテキスト | 具体的な使われ方を確認したいとき |
| `count` | ファイルごとのマッチ数 | 影響範囲の大きさを把握したいとき |

**使用される場面の例:**

```
> find all places where we use console.log in the codebase
> search for TODO comments in TypeScript files
> find all API endpoint definitions
```

### Glob と Grep の使い分け

| やりたいこと | 推奨 | 例 |
|---|---|---|
| 特定の拡張子のファイルを探す | Glob | 「`.ts` ファイルを一覧表示して」 |
| 特定のパターンのコードを探す | Grep | 「`console.log` を使っている箇所を探して」 |
| ファイル名に特定の文字列を含むものを探す | Glob | 「`auth` を含むファイル名を探して」 |
| 関数の呼び出し箇所を探す | Grep | 「`getUserById` を呼んでいる箇所を探して」 |

---

## 4. Execution・Web・Code intelligence

### Bash: シェルコマンドの実行

**概要**: ターミナルで実行できるあらゆるコマンドを実行します。ビルド・テスト・Git 操作・パッケージ管理など、幅広い用途で使われます。

**主な用途:**

```
> run the test suite
> install the required dependencies
> start the development server in the background
> check git status
```

**バックグラウンド実行:**

長時間かかるコマンドは `Ctrl+B` でバックグラウンドに移行できます：

```
> run npm install in the background
> start the development server in the background so we can continue working
```

**セキュリティ上の注意:**
- 危険なコマンド（`rm -rf` 等）は実行前に確認を求める
- `.claude/settings.json` の `permissions.allow` で信頼コマンドを事前承認可能

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

### WebFetch: URL からコンテンツを取得

**概要**: 指定した URL のコンテンツを取得し、AI モデルで処理します。

```
> fetch the documentation from https://example.com/api/docs
> what does the page at https://example.com/status say?
```

**制約事項:**
- 認証が必要なページ（Google Docs・Jira 等）はアクセスできない
- HTTP は自動的に HTTPS にアップグレードされる
- 15分間のキャッシュが有効

### WebSearch: Web 検索

**概要**: Web 検索を実行し、最新の情報を取得します。

```
> search for the latest React 19 release notes
> what are the current best practices for Node.js error handling?
```

### Code intelligence プラグイン

Code intelligence プラグインをインストールすると、言語固有のシンボル操作が可能になります：

| 機能 | 説明 |
|---|---|
| シンボルの概要表示 | ファイルやディレクトリ内のクラス・関数・変数を一覧 |
| シンボルの検索 | 名前でシンボルを検索 |
| 参照の検索 | シンボルを参照しているコードを一覧 |
| シンボルのリネーム | 全参照箇所を含めた安全なリネーム |
| シンボル本体の置換 | 関数やクラスの本体を置き換え |
| シンボルの前後に挿入 | 関数やクラスの前後にコードを挿入 |

> **公式ドキュメントより**: Code intelligence プラグインは `/plugin` コマンドで管理できます。プラグインは言語サーバー（LSP）を使って正確なシンボル情報を提供するため、Grep による文字列検索よりも信頼性が高くなります。

---

## 5. 安全機構とツール管理

### チェックポイント（巻き戻し）

すべてのファイル編集の前に、Claude Code は現在のファイルのスナップショットを自動保存します。変更を元に戻す方法：

- `Esc` を2回押す（最も手軽）
- Claude に「undo してください」と伝える
- `/diff` で変更を確認してから判断する

### 確認フローの理解

| モード | ファイル変更 | コマンド実行 |
|---|---|---|
| **Default** | 確認あり | 確認あり |
| **Auto-accept edits** | 確認なし | 確認あり |
| **Plan mode** | 変更不可（プランのみ） | 読み取り専用コマンドのみ |

### 事前承認による効率化

`.claude/settings.json` で信頼できるコマンドを事前承認すると、毎回の確認が不要になります：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test)",
      "Bash(npm run lint)",
      "Bash(git status)",
      "Bash(git diff)",
      "Bash(git log *)"
    ]
  }
}
```

### ツールのアクセス確認

セッション内で利用可能なツールと権限を確認する：

```
/permissions
```

ツール使用の詳細ログを有効にする：

```
Ctrl+O    # verbose（詳細出力）のトグル
```

verbose モードをオンにすると、Claude がどのツールをどのパラメータで呼び出したかが表示されます。プロンプトの改善やデバッグに役立ちます。

---

## ハンズオン演習

### 演習 1: ツールの動作を観察する

**目的**: verbose モードで各ツールの呼び出しを観察し、ツールの動作を理解する
**前提条件**: 任意のプロジェクトディレクトリで Claude Code を起動

**手順**:
1. `Ctrl+O` で verbose モードをオンにする
2. `find all TypeScript files in this project` と指示して、Glob ツールの呼び出しを確認する
3. `search for TODO comments` と指示して、Grep ツールの呼び出しを確認する
4. `read the package.json file` と指示して、Read ツールの呼び出しを確認する
5. 各ツールのパラメータ（パターン、パス等）を確認する

**期待される結果**: verbose 出力で各ツールの名前・パラメータ・結果が表示され、Claude がどのように判断しているか理解できる

### 演習 2: Edit と Write の違いを体験する

**目的**: Edit（精密な編集）と Write（完全書き換え）の違いを体験する
**前提条件**: 演習用のテストファイルを作成する

**手順**:
1. `create a file called test-edit.js with a simple function that adds two numbers` と指示する（Write が使われる）
2. `rename the function from add to sum in test-edit.js` と指示する（Edit が使われる）
3. `Ctrl+O` が有効なら、それぞれのツール呼び出しの違いを確認する
4. `completely rewrite test-edit.js to use TypeScript with type annotations` と指示する（Write が使われる）
5. 作業が終わったら `delete test-edit.js` で後片付け

**期待される結果**: 小さな変更には Edit、大きな変更には Write が使われることを確認

### 演習 3: チェックポイントで巻き戻す

**目的**: チェックポイント機能で安全にファイルを元に戻す体験
**前提条件**: 演習 2 で作成したファイルまたは任意のファイル

**手順**:
1. 任意のファイルに対して変更を指示する（例: `add a comment at the top of package.json`）
2. 変更が適用されたことを確認する
3. `Esc` を2回押して変更を巻き戻す
4. ファイルが元の状態に戻ったことを確認する

**期待される結果**: チェックポイント機能でファイル変更を安全に元に戻せることを確認

---

## よくある質問

**Q: Claude がどのツールを使うかはどうやって決まるのですか？**
A: Claude はプロンプトの内容と文脈から最適なツールを自動的に選択します。「ファイルを読んで」なら Read、「探して」なら Grep/Glob、「修正して」なら Edit/Write というように判断します。verbose モード（`Ctrl+O`）で確認できます。

**Q: Edit ツールで「一意でない」エラーが出たらどうしますか？**
A: Claude は自動的により多くの周辺コンテキストを含めてリトライします。それでも失敗する場合は、変更したい箇所をより具体的に指示してください（行番号の指定や、関数名・クラス名での特定）。

**Q: Bash ツールでタイムアウトする場合はどうしますか？**
A: デフォルトのタイムアウトは2分です。長時間かかるコマンドは `Ctrl+B` でバックグラウンドに移行するか、「バックグラウンドで実行して」と指示してください。最大10分まで延長可能です。

**Q: Code intelligence プラグインはどの言語に対応していますか？**
A: `/plugin` で利用可能なプラグインを確認できます。対応言語はプラグインによって異なりますが、TypeScript・Python・Go・Rust・Java など主要な言語をカバーしています。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code は **File operations**（Read/Edit/Write）、**Search**（Glob/Grep）、**Execution**（Bash）、**Web**（WebFetch/WebSearch）、**Code intelligence** の5カテゴリのツールを使用する
- **Read** はファイル読み取り（テキスト・画像・PDF・Jupyter 対応）、**Edit** は精密な文字列置換、**Write** は新規作成・完全書き換え
- **Glob** はファイル名パターン検索、**Grep** はコンテンツの正規表現検索（ripgrep ベース）
- すべてのファイル変更は **チェックポイント** で元に戻せる（`Esc` 2回）
- verbose モード（`Ctrl+O`）で Claude のツール呼び出しを観察し、プロンプトを改善できる

## 次のステップ

次の章「Git 統合」では、Claude Code と Git の連携機能を学び、コミット・ブランチ・PR 作成のワークフローを実践します。

---

> **公式リファレンス**
> - [How Claude Code Works](https://code.claude.com/docs/en/how-claude-code-works) - ツールとエージェントループ
> - [Settings](https://code.claude.com/docs/en/settings) - 権限設定の詳細
> - [Permissions](https://code.claude.com/docs/en/permissions) - パーミッションルールの構文
> - [Plugins](https://code.claude.com/docs/en/plugins) - Code intelligence プラグインの管理
