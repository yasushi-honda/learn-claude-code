# Git 統合

> 関連する公式ドキュメント: [Common Workflows](https://code.claude.com/docs/en/common-workflows) / [Quickstart](https://code.claude.com/docs/en/quickstart)

## 学習目標

- `claude commit` コマンドでコミットメッセージを自動生成できる
- Claude Code 経由でブランチ操作（作成・切り替え）ができる
- `gh` CLI と連携して PR を作成できる
- マージコンフリクトを Claude Code の助けを借りて解消できる
- `git diff` の確認と Co-Authored-By の自動追加について理解する

## 概要

Claude Code は Git と深く統合されており、コミット・ブランチ・PR 作成などの Git 操作を自然言語で実行できます。git の状態（現在のブランチ・未コミットの変更・最近のコミット履歴）を常に把握しており、適切な操作を提案・実行します。

## 本文

### claude commit コマンド

コミットを作成する最も簡単な方法は `claude commit` コマンドです：

```bash
claude commit
```

Claude Code は以下を自動的に行います：

1. `git diff` で変更内容を確認する
2. 変更の内容と意図に基づいてコミットメッセージを生成する
3. 変更をステージングする
4. コミットを作成する（`Co-Authored-By: Claude` を自動追加）

セッション内からも同じ操作ができます：

```
> commit my changes with a descriptive message
```

複数の変更がある場合、変更の範囲や種類ごとに分けてコミットを提案することもあります：

```
> commit only the authentication-related changes
```

### コミットメッセージの自動生成

Claude Code は変更内容を分析して適切なコミットメッセージを自動生成します。生成されたメッセージは確認・修正できます：

```
> commit my changes - use conventional commits format (feat:, fix:, refactor:)
```

コミットメッセージのスタイルを指定する：

```
> commit with a message like "fix(auth): resolve session expiry race condition"
```

### Co-Authored-By の自動追加

`claude commit` や Claude Code 経由でコミットを作成すると、コミットメッセージに以下が自動的に追加されます：

```
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

これにより、AI との協働で作成されたコミットが明示的に記録されます。

### ブランチ操作

#### 新しいブランチを作成する

```
> create a new branch called feature/quickstart
```

```
> create and switch to a branch named bugfix/login-error
```

#### ブランチを切り替える

```
> switch to the main branch
```

```
> checkout feature/auth
```

#### ブランチの状態を確認する

```
> what branch am I on?
> show me all branches
> what changes are on the current branch compared to main?
```

### 変更の確認

#### git diff を確認する

```
> what files have I changed?
> show me the diff for src/auth.ts
> what are the uncommitted changes?
```

インタラクティブな diff ビューアを開く：

```
/diff
```

`/diff` コマンドのキーボード操作：
- `←` / `→`: 現在の git diff と個別のターン別 diff を切り替え
- `↑` / `↓`: ファイル間を移動

#### git log を確認する

```
> show me the last 5 commits
> what was changed in the most recent commit?
> show the commit history for src/auth.ts
```

### PR 作成（gh CLI 連携）

Claude Code は GitHub CLI（`gh`）と連携して PR を作成します。事前に `gh` CLI のインストールと認証が必要です：

```bash
gh auth login
```

#### ワンステップで PR を作成する

```
> /commit-push-pr
```

このスキルは以下を自動実行します：
1. 変更をコミット（コミットメッセージを自動生成）
2. ブランチをリモートにプッシュ
3. PR を作成

#### 段階的に PR を作成する

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

PR をブランチに含めてから、セッションはその PR に自動的にリンクされます。後から再開するには：

```bash
claude --from-pr 123
```

### マージコンフリクトの解決

コンフリクトを Claude Code に解消してもらう：

```
> help me resolve merge conflicts
```

特定のファイルのコンフリクトを解消する（どちらの変更を優先するか指定）：

```
> resolve the conflicts in src/auth.ts, preferring the main branch version for the auth logic
```

コンフリクトを解消しながら両方の変更を統合する：

```
> resolve the merge conflicts in package.json by keeping both sets of dependencies
```

### GitHub Actions との連携

Claude Code は GitHub Actions ワークフローとして CI/CD に組み込むことができます。PR レビューや Issue トリアージを自動化できます。

GitHub Actions アプリをリポジトリにセットアップ：

```
/install-github-app
```

これにより PR やコメントで Claude Code をトリガーできるようになります。

### セッションのブランチ追跡

セッションはディレクトリと現在のブランチに紐づいています：

- ブランチを切り替えると Claude は新しいブランチのファイルを参照
- 会話履歴はブランチを切り替えても保持される
- `/resume` ピッカーには現在の git リポジトリからのセッション（ワークツリー含む）が表示される

PR ステータスの確認：

ブランチでオープンな PR がある場合、フッターにクリック可能な PR リンクが表示されます（例: "PR #446"）。色付きのアンダーラインでレビュー状態を示します：
- 緑: 承認済み
- 黄: レビュー待ち
- 赤: 変更要求あり
- グレー: ドラフト
- 紫: マージ済み

> **注意**: PR ステータスには `gh` CLI のインストールと認証（`gh auth login`）が必要です。ステータスは 60 秒ごとに自動更新されます。

### 実践的なワークフロー例

#### 機能開発のフルサイクル

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

# 5. コミット・PR 作成
> /commit-push-pr
```

#### バグ修正のフルサイクル

```bash
claude
> there's a bug in the checkout flow for expired cards - investigate and fix it

# 修正後
> commit the fix with a message explaining the root cause

# PR 作成
> create a pr with a description of the bug and the fix
```

## まとめ

- `claude commit` または会話内で `commit my changes` でコミット・メッセージ自動生成
- ブランチ作成・切り替えも自然言語で指示できる
- `gh` CLI が必要だが、`/commit-push-pr` スキルでコミット・プッシュ・PR をワンステップ実行
- マージコンフリクトの解消も Claude Code に委任できる（優先するバージョンを指定可）
- コミットには自動的に `Co-Authored-By: Claude` が追加される

## 公式リファレンス

- [Common Workflows](https://code.claude.com/docs/en/common-workflows) - Git 操作を含む実践的ワークフロー
- [GitHub Actions](https://code.claude.com/docs/en/github-actions) - CI/CD 統合
- [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd) - GitLab 統合
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) - `/diff` コマンド等
