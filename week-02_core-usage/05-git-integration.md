# Git 統合

> **対応公式ドキュメント**: https://code.claude.com/docs/en/common-workflows
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. `claude commit` コマンドでコミットメッセージを自動生成し、Co-Authored-By を理解できる
2. Claude Code 経由でブランチ操作（作成・切り替え・状態確認）ができる
3. `gh` CLI と連携して PR を作成し、`--from-pr` でセッションを再開できる
4. マージコンフリクトを Claude Code の助けを借りて解消できる
5. git worktree と `/commit-push-pr` スキルで開発効率を最大化できる

---

## 1. コミットの自動化

### claude commit コマンド

コミットを作成する最も簡単な方法は `claude commit` コマンドです：

```bash
claude commit
```

Claude Code は以下を自動的に行います：

1. `git diff` で変更内容を確認する
2. 変更の内容と意図に基づいてコミットメッセージを生成する
3. 変更をステージングする
4. コミットを作成する（`Co-Authored-By` トレーラーを自動追加）

セッション内からも同じ操作ができます：

```
> commit my changes with a descriptive message
```

### コミットメッセージのカスタマイズ

Claude Code は変更内容を分析して適切なコミットメッセージを自動生成します。スタイルを指定することもできます：

Conventional Commits 形式を指定：
```
> commit my changes - use conventional commits format (feat:, fix:, refactor:)
```

具体的なメッセージを指定：
```
> commit with a message like "fix(auth): resolve session expiry race condition"
```

特定の変更だけをコミット：
```
> commit only the authentication-related changes
```

### Co-Authored-By トレーラー

`claude commit` や Claude Code 経由でコミットを作成すると、コミットメッセージに以下が自動追加されます：

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

これにより、AI との協働で作成されたコミットが明示的に記録されます。GitHub の Contributors リストにも反映されるため、トランスペアレンシーの面で重要です。

---

## 2. ブランチ操作

Claude Code は Git のブランチ操作を自然言語で実行できます。内部的には `git` コマンドを呼び出しています。

### 新しいブランチを作成する

```
> create a new branch called feature/quickstart
```

```
> create and switch to a branch named bugfix/login-error
```

### ブランチを切り替える

```
> switch to the main branch
```

```
> checkout feature/auth
```

### ブランチの状態を確認する

```
> what branch am I on?
> show me all branches
> what changes are on the current branch compared to main?
```

### セッションとブランチの関係

セッションはディレクトリと現在のブランチに紐づいています：

- ブランチを切り替えると Claude は新しいブランチのファイルを参照する
- 会話履歴はブランチを切り替えても保持される
- `/resume` ピッカーには現在の git リポジトリからのセッション（ワークツリー含む）が表示される

---

## 3. 変更の確認と diff

### git diff を確認する

```
> what files have I changed?
> show me the diff for src/auth.ts
> what are the uncommitted changes?
```

### インタラクティブ diff ビューア

`/diff` コマンドで視覚的に変更を確認できます：

```
/diff
```

`/diff` のキーボード操作：
- `←` / `→`: 現在の git diff と個別のターン別 diff を切り替え
- `↑` / `↓`: ファイル間を移動

### git log を確認する

```
> show me the last 5 commits
> what was changed in the most recent commit?
> show the commit history for src/auth.ts
```

### PR Review ステータス表示

ブランチでオープンな PR がある場合、フッターにクリック可能な PR リンクが表示されます（例: "PR #446"）。色付きのアンダーラインでレビュー状態を示します：

| 色 | ステータス |
|---|---|
| 緑 | 承認済み（Approved） |
| 黄 | レビュー待ち（Pending review） |
| 赤 | 変更要求あり（Changes requested） |
| グレー | ドラフト（Draft） |
| 紫 | マージ済み（Merged） |

> **公式ドキュメントより**: PR ステータスには `gh` CLI のインストールと認証（`gh auth login`）が必要です。ステータスは 60 秒ごとに自動更新されます。

---

## 4. PR 作成と GitHub 連携

### 前提条件

PR 作成には GitHub CLI（`gh`）のインストールと認証が必要です：

```bash
# gh CLI のインストール（macOS）
brew install gh

# 認証
gh auth login
```

### /commit-push-pr スキル（ワンステップ）

最も効率的な方法は `/commit-push-pr` スキルです：

```
> /commit-push-pr
```

このスキルは以下を自動実行します：
1. 変更をコミット（コミットメッセージを自動生成）
2. ブランチをリモートにプッシュ
3. PR を作成（タイトルと説明を自動生成）

Slack MCP サーバーが設定されていて CLAUDE.md にチャンネルが指定されている場合、自動で PR URL を投稿します。

### 段階的に PR を作成する

段階的に進める場合のワークフロー：

```
> summarize the changes I've made to the authentication module
```

```
> create a pr
```

説明を充実させる：

```
> enhance the PR description with more context about the security improvements
```

### セッションの自動リンクと再開

`gh pr create` を使って PR を作成すると、**セッションが自動的にその PR にリンク**されます。後から再開するには：

```bash
claude --from-pr 123
```

これにより、PR のレビューコメントへの対応や追加修正をシームレスに続けられます。

---

## 5. マージコンフリクトの解決

Claude Code はマージコンフリクトの解消を支援できます。コンフリクトマーカー（`<<<<<<<`、`=======`、`>>>>>>>`）を認識し、適切な統合を提案します。

### 基本的なコンフリクト解消

```
> help me resolve merge conflicts
```

### 特定のファイルのコンフリクトを解消

優先するバージョンを指定：

```
> resolve the conflicts in src/auth.ts, preferring the main branch version for the auth logic
```

### 両方の変更を統合

```
> resolve the merge conflicts in package.json by keeping both sets of dependencies
```

### コンフリクト解消のコツ

- **コンフリクトの原因を説明する**: 両方のブランチで何を変更したかを伝えると、より適切な統合が得られる
- **ファイル単位で指示する**: 大量のコンフリクトがある場合は、ファイルごとに方針を指示する
- **テストを実行する**: コンフリクト解消後は必ずテストを実行して動作を確認する

---

## 6. git worktree と GitHub Actions

### git worktree による並列セッション

複数のタスクを同時に進めるには git worktree が便利です。各 Claude セッションがコードベースの独自コピーを持つため、お互いに干渉しません。

```bash
# "feature-auth" という名前のワークツリーで Claude を起動
# .claude/worktrees/feature-auth/ に新しいブランチを作成
claude --worktree feature-auth

# 別のターミナルで別のセッションを起動
claude --worktree bugfix-123
```

名前を省略すると自動生成されます（例: "bright-running-fox"）：

```bash
claude --worktree
```

ワークツリーは `<repo>/.claude/worktrees/<name>` に作成されます。

**クリーンアップ:**
- 変更なし: ワークツリーとブランチが自動削除
- 変更・コミットあり: Claude が保持か削除かを確認

> **ヒント**: `.claude/worktrees/` を `.gitignore` に追加すると、ワークツリーの内容がメインリポジトリの未追跡ファイルとして表示されなくなります。

### GitHub Actions との連携

Claude Code は GitHub Actions ワークフローとして CI/CD に組み込むことができます。PR レビューや Issue トリアージを自動化できます。

GitHub Actions アプリをリポジトリにセットアップ：

```
/install-github-app
```

これにより PR コメントや Issue コメントで Claude Code をトリガーできるようになります。

---

## 7. 実践的なワークフロー例

### 機能開発のフルサイクル

```bash
# 1. 機能ブランチを作成
claude
> create a new branch called feature/user-profile

# 2. 実装
> add a user profile endpoint to the API

# 3. テスト作成・実行
> write tests for the user profile endpoint and run them

# 4. 変更を確認
> what changes did we make?

# 5. コミット・PR 作成（ワンステップ）
> /commit-push-pr
```

### バグ修正のフルサイクル

```bash
claude
> there's a bug in the checkout flow for expired cards - investigate and fix it

# 修正後
> commit the fix with a message explaining the root cause

# PR 作成
> create a pr with a description of the bug and the fix
```

### コードレビューのワークフロー

```bash
# PR レビューを実行
> /review

# 特定の PR をレビュー
> /review 123

# セキュリティ脆弱性を分析
> /security-review

# PR のコメントを取得して対応
> /pr-comments 123

# PR のセッションを再開して修正
claude --from-pr 123
> fix the issues mentioned in the review comments
```

---

## ハンズオン演習

### 演習 1: コミットの自動生成

**目的**: `claude commit` でコミットメッセージを自動生成する体験
**前提条件**: git リポジトリ内で何らかのファイル変更がある状態

**手順**:
1. 任意のファイルに小さな変更を加える（例: コメントを追加）
2. `claude` を起動して `commit my changes` と指示する
3. 生成されたコミットメッセージを確認する
4. `Co-Authored-By` トレーラーが追加されていることを `git log` で確認する

**期待される結果**: Claude が変更内容を分析して適切なコミットメッセージを生成し、Co-Authored-By が追加されている

### 演習 2: ブランチ操作と diff 確認

**目的**: ブランチ操作と変更の確認を自然言語で行う体験
**前提条件**: git リポジトリで作業中

**手順**:
1. `create a new branch called test/exercise` と指示する
2. 何らかのファイル変更を指示する（例: `add a comment to the top of README.md`）
3. `/diff` コマンドで変更を確認する
4. `what branch am I on?` で現在のブランチを確認する
5. `switch to the main branch` でメインブランチに戻る
6. 不要なブランチを削除する: `delete the test/exercise branch`

**期待される結果**: ブランチの作成・切り替え・削除、変更の確認がすべて自然言語で実行できる

### 演習 3: PR 作成ワークフロー（gh CLI 設定済みの場合）

**目的**: PR 作成の全ワークフローを体験する
**前提条件**: `gh auth login` 済み、リモートリポジトリがある

**手順**:
1. 機能ブランチを作成する: `create a new branch called feature/test-pr`
2. 小さな変更を加える
3. `create a pr` と指示する
4. PR の説明を確認する
5. `enhance the PR description` で説明を充実させる

**期待される結果**: ブランチ作成からPR作成まで、Claude Code の支援で効率的に実行できる

> **注意**: この演習はリモートリポジトリが必要です。`gh` CLI が設定されていない場合はスキップしてください。

---

## よくある質問

**Q: claude commit と git commit の違いは何ですか？**
A: `claude commit` は変更内容を AI が分析して適切なコミットメッセージを自動生成します。また `Co-Authored-By` トレーラーを自動追加し、AI との協働を記録します。`git commit` は通常の Git コマンドで、メッセージを手動で書く必要があります。

**Q: PR を作成した後、レビューコメントに対応するにはどうしますか？**
A: `claude --from-pr <PR番号>` でセッションを再開すると、PR のコンテキストを持った状態で作業を続けられます。`/pr-comments <PR番号>` でコメントを取得することもできます。

**Q: git worktree を使うのはどのような場面ですか？**
A: 複数のタスクを同時に進めたい場合です。例えば、機能開発をしながら別のバグ修正を並行して行いたい場合、各タスクに独立したワークツリーを割り当てることで、お互いの変更が干渉しません。

**Q: /commit-push-pr スキルはいつ使えますか？**
A: `/skills` で利用可能なスキルを確認できます。`/commit-push-pr` は組み込みスキルとして提供されており、特別な設定なしで使えます。

**Q: PR ステータスがフッターに表示されません**
A: `gh` CLI がインストール・認証されていることを確認してください（`gh auth status`）。また、現在のブランチにオープンな PR が存在する必要があります。

---

## まとめ

この章で学んだ重要ポイント：

- `claude commit` または会話内の `commit my changes` でコミットメッセージを自動生成し、`Co-Authored-By` が自動追加される
- ブランチの作成・切り替え・状態確認は自然言語で指示できる
- `/commit-push-pr` スキルでコミット・プッシュ・PR 作成をワンステップで実行
- `gh pr create` で PR を作成するとセッションが自動リンクされ、`claude --from-pr <number>` で再開可能
- マージコンフリクトの解消も Claude Code に委任でき、優先するバージョンの指定が可能
- git worktree（`claude --worktree`）で複数の独立したセッションを並列実行できる

## 次のステップ

Week 2 のすべてのレッスンが完了しました。次の Week 3「開発環境統合」では、VS Code・JetBrains との IDE 連携、MCP サーバーの設定、GitHub Actions での CI/CD 統合など、より高度な開発環境の構築を学びます。

---

> **公式リファレンス**
> - [Common Workflows](https://code.claude.com/docs/en/common-workflows) - Git 操作を含む実践的ワークフロー
> - [GitHub Actions](https://code.claude.com/docs/en/github-actions) - CI/CD 統合
> - [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) - `/diff` コマンド・PR ステータス表示
> - [Skills](https://code.claude.com/docs/en/skills) - `/commit-push-pr` スキルの詳細
