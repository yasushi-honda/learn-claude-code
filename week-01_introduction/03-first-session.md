# 初回セッション

> 対応する公式ドキュメント: [Quickstart](https://code.claude.com/docs/en/quickstart)

## 学習目標

- Claude Code を起動し、ログインまでの流れを実行できる
- コードベースへの基本的な質問（概要・構造の説明）ができる
- Claude Code を使って簡単なコード変更を依頼できる
- Git コマンド（コミット・ブランチ作成）を Claude Code 経由で実行できる
- 基本コマンド（`/clear`、`/help`、`exit` 等）を使いこなせる

## 概要

Claude Code の初回セッションは、インストール → ログイン → プロジェクトで起動 → 最初の質問 → コード変更 → Git 操作という流れで進みます。このチュートリアルでは、実際に手を動かしながら Claude Code の基本操作を体験します。

## 本文

### Step 1: プロジェクトで起動する

ターミナルを開き、作業したいプロジェクトのディレクトリに移動して `claude` を実行します：

```bash
cd /path/to/your/project
claude
```

プロジェクトがない場合は、任意のディレクトリで起動できます：

```bash
mkdir my-project
cd my-project
claude
```

起動するとセッション情報・最近の会話・最新アップデートが表示されます。

### Step 2: ログインする

初回起動時はログインが必要です。自動的にブラウザが開きます。ブラウザが開かない場合は `c` キーを押してログイン URL をクリップボードにコピーし、ブラウザに貼り付けてください。

対応アカウント：

| アカウント種別 | 説明 |
|---|---|
| **Claude Pro / Max** | claude.com のサブスクリプション（個人向け推奨） |
| **Claude Teams / Enterprise** | チーム管理者から招待されたアカウント |
| **Claude Console** | API ベースのアクセス（プリペイドクレジット） |
| **Amazon Bedrock** | AWS 経由のエンタープライズ利用 |
| **Google Vertex AI** | GCP 経由のエンタープライズ利用 |
| **Microsoft Foundry** | Azure 経由のエンタープライズ利用 |

ログイン後は認証情報が保存され、以降はログイン不要です。

### Step 3: コードベースを理解する

まずは Claude Code にプロジェクトについて質問してみましょう：

```
> what does this project do?
```

より具体的な質問をすることもできます：

```
> explain the folder structure
```

```
> what technologies does this project use?
```

```
> where is the main entry point?
```

```
> how is authentication handled?
```

Claude Code はプロジェクトのファイルを自動的に読み込んで回答します。手動でコンテキストを追加する必要はありません。

### Step 4: 最初のコード変更を依頼する

次に、Claude Code に実際のコード変更を依頼してみましょう：

```
> add a hello world function to the main file
```

Claude Code は以下のステップで作業します：

1. 適切なファイルを探す
2. 変更案を提示する
3. あなたの承認を求める
4. 承認後に編集を実施する

> **注意**: Claude Code はファイルを変更する前に必ず確認を求めます。「Accept all」モードを有効にすると、セッション中は確認なしで変更が適用されます。

### Step 5: Git 操作を行う

Claude Code は Git 操作を会話形式で実行できます：

変更内容を確認する：
```
> what files have I changed?
```

変更をコミットする：
```
> commit my changes with a descriptive message
```

新しいブランチを作成する：
```
> create a new branch called feature/quickstart
```

コミット履歴を確認する：
```
> show me the last 5 commits
```

マージコンフリクトを解決する：
```
> help me resolve merge conflicts
```

### Step 6: バグ修正・機能追加

Claude Code はデバッグと機能実装も得意です：

自然言語で機能を要求する：
```
> add input validation to the user registration form
```

バグを修正する：
```
> there's a bug where users can submit empty forms - fix it
```

Claude Code は関連コードを特定し、コンテキストを理解した上で解決策を実装し、利用可能な場合はテストを実行します。

### Step 7: その他のワークフロー

**リファクタリング:**
```
> refactor the authentication module to use async/await instead of callbacks
```

**テスト作成:**
```
> write unit tests for the calculator functions
```

**ドキュメント更新:**
```
> update the README with installation instructions
```

**コードレビュー:**
```
> review my changes and suggest improvements
```

### 基本コマンド一覧

| コマンド | 動作 | 例 |
|---|---|---|
| `claude` | 対話モードを起動 | `claude` |
| `claude "task"` | 一時タスクを実行 | `claude "fix the build error"` |
| `claude -p "query"` | 一回限りのクエリを実行して終了 | `claude -p "explain this function"` |
| `claude -c` | 現在のディレクトリの直近の会話を再開 | `claude -c` |
| `claude -r` | 前の会話を選択して再開 | `claude -r` |
| `claude commit` | Git コミットを作成 | `claude commit` |
| `/clear` | 会話履歴をクリア | `/clear` |
| `/help` | 利用可能なコマンドを表示 | `/help` |
| `exit` または `Ctrl+C` | Claude Code を終了 | `exit` |

### 便利なヒント

**具体的に指示する:**

曖昧な指示より具体的な指示の方が良い結果になります。

悪い例：
```
> fix the bug
```

良い例：
```
> fix the login bug where users see a blank screen after entering wrong credentials
```

**段階的に指示する:**

複雑なタスクは段階に分けて指示します：

```
> 1. create a new database table for user profiles
> 2. create an API endpoint to get and update user profiles
> 3. build a webpage that allows users to see and edit their information
```

**まず探索してから実装する:**

変更する前に Claude Code にコードを理解させます：

```
> analyze the database schema
```

その後：
```
> build a dashboard showing products that are most frequently returned by our UK customers
```

## まとめ

- `cd your-project && claude` でセッションを起動し、初回はブラウザでログイン
- 質問はすべて自然言語で行える（`what does this project do?` 等）
- コード変更は Claude Code が変更案を提示してから承認を求める
- Git 操作も自然言語でできる（`commit my changes with a descriptive message`）
- `/clear`、`/help`、`exit` などの基本コマンドで操作する
- 具体的で明確な指示をすることで、より良い結果を得られる

## 公式リファレンス

- [Quickstart Guide](https://code.claude.com/docs/en/quickstart) - 初回セッションの完全ガイド
- [CLI Reference](https://code.claude.com/docs/en/cli-reference) - コマンド・フラグの完全リスト
- [Common Workflows](https://code.claude.com/docs/en/common-workflows) - 実践的なワークフロー集
- [Best Practices](https://code.claude.com/docs/en/best-practices) - 効果的な使い方のヒント
