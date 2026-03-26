# 初回セッション

> **対応公式ドキュメント**: https://code.claude.com/docs/en/quickstart
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude Code を起動し、対話モード・初期プロンプト・SDK モードの違いを使い分けられる
2. コードベースへの基本的な質問（概要・構造の説明）ができる
3. Claude Code を使って簡単なコード変更を依頼し、承認フローを理解する
4. Git コマンド（コミット・ブランチ作成）を Claude Code 経由で実行できる
5. 基本コマンド（`/clear`、`/help`、`exit` 等）とキーボードショートカットを使いこなせる

---

## 1. Claude Code の起動方法

Claude Code には複数の起動方法があり、それぞれ異なるユースケースに対応しています。

### 対話モード（基本）

最もよく使う起動方法です。プロジェクトのディレクトリに移動して `claude` を実行します。

```bash
cd /path/to/your/project
claude
```

起動すると、セッション情報・最新のアップデート情報が表示され、プロンプト（`>`）が現れます。ここに自然言語で指示を入力します。

### 初期プロンプト付き起動

起動時に最初の質問を指定できます。対話モードに入った状態で、指定した質問から会話が始まります。

```bash
claude "what does this project do?"
```

### SDK モード（パイプモード）

`-p` フラグを使うと、回答後に即座にプロセスが終了します。スクリプトや CI/CD パイプラインとの統合に適しています。

```bash
# 質問して回答を受け取り、すぐに終了
claude -p "explain the main function in index.ts"

# パイプと組み合わせて使う
cat error.log | claude -p "what's causing these errors?"
```

> **公式ドキュメントより**: `claude -p` は SDK モードとも呼ばれ、非対話的に実行されます。結果を出力して即座に終了するため、バッチ処理やスクリプトに組み込むのに最適です。

### 会話の継続

前回のセッションを続きから再開できます。

```bash
# 直前の会話を継続
claude -c

# 過去の会話を選択して再開
claude -r
```

### 起動方法の比較

| コマンド | 動作 | ユースケース |
|---|---|---|
| `claude` | 対話モードを起動 | 日常的な開発作業 |
| `claude "query"` | 初期プロンプト付きで対話モード | 特定の質問から始めたいとき |
| `claude -p "query"` | SDK モード（回答後に終了） | スクリプト・CI/CD 連携 |
| `claude -c` | 直前の会話を継続 | 中断した作業の再開 |
| `claude -r` | 過去の会話を選択して再開 | 特定のセッションに戻りたいとき |

---

## 2. コードベースを理解する

Claude Code を起動したら、まずプロジェクトについて質問してみましょう。Claude Code はプロジェクトのファイルを自動的に読み込んで回答します。手動でファイルを指定する必要はありません。

### 基本的な質問例

```
> what does this project do?
```

Claude Code はプロジェクトのファイル構造、README、設定ファイル等を読み込み、プロジェクトの概要を説明します。

```
> explain the folder structure
```

ディレクトリ構成を分析し、各ディレクトリの役割を説明します。

### より具体的な質問

```
> what technologies does this project use?

> where is the main entry point?

> how is authentication handled?

> what testing framework is used?

> explain the database schema
```

### 質問のコツ

Claude Code に質問するとき、以下を意識するとより良い回答が得られます。

| 質問のタイプ | 悪い例 | 良い例 |
|---|---|---|
| 概要 | `explain the code` | `what does this project do and what's the tech stack?` |
| 特定箇所 | `explain this` | `explain the authentication flow in src/auth/` |
| 比較 | `is it good?` | `compare the error handling in api/ vs lib/` |

---

## 3. コード変更を依頼する

### 基本的な変更依頼

Claude Code に実際のコード変更を依頼してみましょう。

```
> add a hello world function to the main file
```

Claude Code は以下のステップで作業します：

1. **適切なファイルを探す** -- プロジェクト構造を分析してメインファイルを特定
2. **変更案を提示する** -- diff 形式で変更内容を表示
3. **あなたの承認を求める** -- 「Accept?」と確認
4. **承認後に編集を実施** -- ファイルに変更を適用

### 承認フロー

デフォルトでは、Claude Code はファイルを変更する前に必ず確認を求めます。

```
Claude wants to edit src/index.ts:
+ function helloWorld() {
+   return "Hello, World!";
+ }

Accept? [y/n/e]
```

- `y`: 変更を承認
- `n`: 変更を拒否
- `e`: 変更内容をエディタで編集

> **Tip**: `Shift+Tab` を押すとパーミッションモードを切り替えられます。「Auto-accept edits」モードにすると、ファイル編集の確認がスキップされます（詳細は第4章）。

### 変更依頼の実践例

```
# バグ修正
> there's a bug where users can submit empty forms - fix it

# 機能追加
> add input validation to the user registration form

# リファクタリング
> refactor the authentication module to use async/await instead of callbacks

# テスト作成
> write unit tests for the calculator functions

# ドキュメント更新
> update the README with installation instructions
```

### 段階的に指示する

複雑なタスクは段階に分けて指示すると、より正確な結果が得られます。

```
> 1. create a new database table for user profiles
> 2. create an API endpoint to get and update user profiles
> 3. build a webpage that allows users to see and edit their information
```

### まず探索してから実装する

変更する前に Claude Code にコードを理解させることで、より適切な変更が行われます。

```
> analyze the database schema
```

理解を確認してから：

```
> build a dashboard showing products that are most frequently returned by our UK customers
```

---

## 4. Git 操作

Claude Code は Git ワークフロー全体を自然言語で操作できます。

### 変更のコミット

最もシンプルなコミット方法は専用コマンドです。

```bash
claude commit
```

これだけで Claude Code が変更内容を分析し、適切なコミットメッセージを生成してコミットします。

対話モード内でも Git 操作が可能です。

```
# 変更内容を確認
> what files have I changed?

# 変更を説明付きでコミット
> commit my changes with a descriptive message

# 新しいブランチを作成
> create a new branch called feature/quickstart

# コミット履歴を確認
> show me the last 5 commits

# マージコンフリクトを解決
> help me resolve merge conflicts
```

### Git 操作の実践的なフロー

```
# 1. 作業前にブランチを作成
> create a feature branch for adding user profile page

# 2. 実装
> implement the user profile page with avatar upload

# 3. テスト
> write and run tests for the profile page

# 4. コミット
> commit all changes with a descriptive message

# 5. プルリクエスト作成
> create a PR with a description of the changes
```

---

## 5. 基本コマンドとキーボードショートカット

### スラッシュコマンド

セッション内で使えるスラッシュコマンドの一覧です。

| コマンド | 動作 |
|---|---|
| `/help` | 利用可能なコマンドを表示 |
| `/clear` | 会話履歴をクリア（コンテキストをリセット） |
| `/compact` | 会話をコンパクト化（コンテキスト節約） |
| `/context` | コンテキストの使用状況を確認 |
| `/model` | 使用するモデルを切り替え |
| `/login` | ログイン（アカウント切り替え） |
| `/logout` | ログアウト |

### セッションの終了

```
exit
```

または `Ctrl+C` を押します（確認が出る場合があります）。

### キーボードショートカット

| ショートカット | 動作 |
|---|---|
| `?` | キーボードショートカットの一覧を表示 |
| `Tab` | コマンドの補完 |
| `Up` / `Down` | 入力履歴の参照 |
| `Shift+Tab` | パーミッションモードの切り替え |
| `Esc` x 2 | 最後のファイル変更を巻き戻し |
| `Ctrl+C` | 実行中の処理をキャンセル / セッション終了 |

> **Tip**: セッション中に `?` を押すと、利用可能なすべてのキーボードショートカットが表示されます。迷ったらまず `?` を押してみましょう。

---

## ハンズオン演習

### 演習 1: 起動方法を試す

**目的**: Claude Code の3つの起動方法（対話モード・初期プロンプト・SDK モード）を体験する
**前提条件**: Claude Code がインストール済み、アカウントでログイン済み

**手順**:

1. テスト用プロジェクトを準備する
   ```bash
   mkdir -p ~/claude-first-session
   cd ~/claude-first-session
   git init
   echo '# My First Claude Code Project' > README.md
   echo 'console.log("hello");' > index.js
   git add .
   git commit -m "initial commit"
   ```

2. 対話モードで起動する
   ```bash
   claude
   ```
   プロンプトが表示されたら以下を入力:
   ```
   > what files are in this project?
   ```
   `exit` で終了する

3. 初期プロンプト付きで起動する
   ```bash
   claude "explain the folder structure"
   ```

4. SDK モードで起動する
   ```bash
   claude -p "what does index.js do?"
   ```
   回答が表示された後、自動的にプロセスが終了することを確認する

**期待される結果**: 3つの起動方法それぞれで Claude Code が正しく応答し、SDK モードでは回答後に自動終了する

### 演習 2: コード変更とコミット

**目的**: Claude Code にコード変更を依頼し、Git コミットまでの流れを体験する
**前提条件**: 演習 1 のプロジェクトが存在する

**手順**:

1. Claude Code を対話モードで起動する
   ```bash
   cd ~/claude-first-session
   claude
   ```

2. コード変更を依頼する
   ```
   > add a function called greet that takes a name parameter and returns a greeting message. Add it to index.js
   ```

3. 変更内容を確認し、承認する

4. 変更をコミットする
   ```
   > commit this change with a descriptive message
   ```

5. コミット履歴を確認する
   ```
   > show me the git log
   ```

6. `exit` で終了する

**期待される結果**: index.js に greet 関数が追加され、適切なメッセージでコミットされている

### 演習 3: 基本コマンドの練習

**目的**: スラッシュコマンドとキーボードショートカットに慣れる
**前提条件**: Claude Code がインストール済み

**手順**:

1. Claude Code を起動する

2. ヘルプを表示する
   ```
   /help
   ```

3. `?` を押してキーボードショートカットを確認する

4. 何か質問する
   ```
   > explain what Claude Code can do
   ```

5. コンテキスト使用状況を確認する
   ```
   /context
   ```

6. 会話をクリアする
   ```
   /clear
   ```

7. `exit` で終了する

8. 直前の会話を継続する
   ```bash
   claude -c
   ```

9. 会話がクリアされた状態（`/clear` 後）で再開されることを確認する

**期待される結果**: 各コマンドが正しく動作し、`/clear` で会話がリセットされ、`-c` で直前のセッションに再接続できることを確認

---

## よくある質問

**Q: `claude` と `claude "query"` の違いは何ですか？**
A: `claude` は空のプロンプトで対話モードを開始します。`claude "query"` は指定したクエリを最初の入力として対話モードを開始します。どちらも対話モードなので、その後も会話を続けられます。

**Q: `claude -p` はどのような場面で使いますか？**
A: `claude -p`（SDK モード）は回答後に即座に終了するため、シェルスクリプト、CI/CD パイプライン、他のコマンドとのパイプ連携に適しています。対話的なやり取りが不要な一回限りの処理に使います。

**Q: Claude Code が間違った変更をした場合はどうすればよいですか？**
A: 承認前であれば `n` で拒否できます。承認後であれば `Esc` を2回押してチェックポイントに戻るか、Claude Code に「undo the last change」と伝えてください。Git を使っている場合は `git checkout -- <file>` で元に戻すこともできます。

**Q: 会話が長くなるとどうなりますか？**
A: コンテキストウィンドウが満たされると、Claude Code は自動的にコンパクト化を行います。手動で `/compact` を実行することもできます。新しいトピックに移る場合は `/clear` でリセットすることを推奨します。

**Q: 日本語で質問しても大丈夫ですか？**
A: はい。Claude Code は日本語を含む多言語に対応しています。ただし、コード生成やコミットメッセージなど、プロジェクトの慣例に合わせて英語を使う場合は、英語で指示する方が一貫性のある結果が得られます。

---

## まとめ

この章で学んだ重要ポイント：

- `claude` で対話モード、`claude "query"` で初期プロンプト付き、`claude -p "query"` で SDK モード
- `claude -c` で直前の会話を継続、`claude -r` で過去の会話を選択して再開
- Claude Code はプロジェクトファイルを**自動的に読み込む**ため、手動でコンテキストを追加する必要がない
- コード変更はデフォルトで**承認フロー**を経る（`Shift+Tab` でモード切替可能）
- `claude commit` で変更内容の分析からコミットメッセージ生成まで自動化
- `?` でショートカット一覧、`Tab` で補完、`Up`/`Down` で履歴参照

## 次のステップ

次の章「エージェントループの仕組み」では、Claude Code の内部動作メカニズム、使用するモデル、ツール群、安全機構について詳しく学びます。

---

> **公式リファレンス**
> - [Quickstart](https://code.claude.com/docs/en/quickstart) - 初回セッションの完全ガイド
> - [CLI Reference](https://code.claude.com/docs/en/cli-reference) - コマンド・フラグの完全リスト
> - [Common Workflows](https://code.claude.com/docs/en/common-workflows) - 実践的なワークフロー集
> - [Best Practices](https://code.claude.com/docs/en/best-practices) - 効果的な使い方のヒント
