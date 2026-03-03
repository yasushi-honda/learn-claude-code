# 基本ワークフロー

> 対応する公式ドキュメント: [Common Workflows](https://code.claude.com/docs/en/common-workflows)

## 学習目標

- コードベースを素早く探索・理解するワークフローを実行できる
- バグ修正のステップを Claude Code と協力して進められる
- リファクタリングを安全に進めるパターンを理解する
- テスト作成・実行のワークフローを実践できる
- コミット・PR 作成を Claude Code 経由で行える

## 概要

Claude Code を使ったコーディングの典型的なワークフローを網羅します。コードベースの探索からバグ修正・リファクタリング・テスト・PR 作成まで、それぞれのベストプラクティスとプロンプト例を紹介します。

## 本文

### コードベースの探索と理解

#### 初めてのプロジェクトに参加した場合

```bash
cd /path/to/project
claude
```

高レベルな概要を得る：

```
> give me an overview of this codebase
```

特定のコンポーネントについて深掘りする：

```
> explain the main architecture patterns used here
> what are the key data models?
> how is authentication handled?
```

関連するファイルを見つける：

```
> find the files that handle user authentication
> how do these authentication files work together?
> trace the login process from front-end to database
```

**ヒント:**
- 広い質問から始めて、特定の領域に絞り込む
- プロジェクト固有のコーディング規約について聞く
- プロジェクト固有の用語の用語集を要求する
- コードインテリジェンスプラグインをインストールすると正確な「定義へジャンプ」と「参照を検索」が可能

### バグの発見と修正

#### エラーからバグを追跡する

エラーを Claude Code に共有する：

```
> I'm seeing an error when I run npm test
```

複数の修正候補を提案してもらう：

```
> suggest a few ways to fix the @ts-ignore in user.ts
```

修正を適用する：

```
> update user.ts to add the null check you suggested
```

**ヒント:**
- エラーを再現するコマンドを伝えてスタックトレースを取得させる
- エラーの再現手順を伝える
- エラーが断続的か一貫しているかを伝える

#### プランモードで安全にデバッグする

プランモードで読み取り専用の分析を行い、変更前に確認する：

```bash
claude --permission-mode plan
```

```
> Analyze the authentication system and suggest improvements
```

Claude がコードベースを分析して包括的なプランを作成します。フォローアップで洗練させる：

```
> What about backward compatibility?
> How should we handle database migration?
```

> **ヒント**: `Ctrl+G` を押すとプランをデフォルトのテキストエディタで開いて直接編集できます。

### コードのリファクタリング

#### レガシーコードを段階的にリファクタリングする

古い API 使用箇所を探す：

```
> find deprecated API usage in our codebase
```

リファクタリングの推奨事項を得る：

```
> suggest how to refactor utils.js to use modern JavaScript features
```

変更を安全に適用する：

```
> refactor utils.js to use ES2024 features while maintaining the same behavior
```

変更を確認する：

```
> run tests for the refactored code
```

**ヒント:**
- モダンなアプローチの利点を説明させる
- 後方互換性を維持する必要がある場合はその旨を伝える
- 小さなテスト可能な単位でリファクタリングする

### テストの作成と実行

#### カバーされていないコードにテストを追加する

テストがないコードを探す：

```
> find functions in NotificationsService.swift that are not covered by tests
```

テストのひな形を生成する：

```
> add tests for the notification service
```

エッジケースのテストを追加する：

```
> add test cases for edge conditions in the notification service
```

テストを実行して確認する：

```
> run the new tests and fix any failures
```

**ポイント:**
- Claude Code は既存のテストファイルを検討して、使用しているスタイル・フレームワーク・アサーションパターンに合わせる
- 見落としやすいエッジケース（エラー条件・境界値・予期しない入力）の特定に役立つ

### コミットと PR 作成

#### ワンステップでコミット・プッシュ・PR 作成

ビルトインスキルを使う：

```
> /commit-push-pr
```

Slack MCP サーバーが設定されていて CLAUDE.md にチャンネルが指定されている場合、自動で PR URL を投稿します。

#### 段階的に進める

変更内容を要約する：

```
> summarize the changes I've made to the authentication module
```

PR を作成する：

```
> create a pr
```

説明を充実させる：

```
> enhance the PR description with more context about the security improvements
```

**注意**: `gh pr create` を使って PR を作成すると、セッションが自動的にその PR にリンクされます。後から `claude --from-pr <number>` でセッションを再開できます。

### コードレビュー

PR レビューを実行する（`gh` CLI が必要）：

```
> /review
```

特定の PR をレビューする：

```
> /review 123
```

セキュリティ脆弱性を分析する：

```
> /security-review
```

PR のコメントを取得する：

```
> /pr-comments 123
```

### ドキュメントの更新

ドキュメントがないコードを探す：

```
> find functions without proper JSDoc comments in the auth module
```

ドキュメントを生成する：

```
> add JSDoc comments to the undocumented functions in auth.js
```

内容を充実させる：

```
> improve the generated documentation with more context and examples
```

品質を確認する：

```
> check if the documentation follows our project standards
```

**ヒント:**
- 使用したいドキュメントスタイルを指定する（JSDoc・docstring 等）
- ドキュメントに例を含めるよう要求する
- 公開 API・インターフェース・複雑なロジックへのドキュメントを優先する

### 依存関係の更新

古い依存関係を確認する：

```
> check for outdated dependencies in package.json
```

安全にアップデートする：

```
> update the testing dependencies to their latest versions and fix any breaking changes
```

### マージコンフリクトの解決

コンフリクトを解消する：

```
> help me resolve merge conflicts
```

特定のファイルのコンフリクトに焦点を当てる：

```
> resolve the conflicts in src/auth.ts, preferring the main branch version for the auth logic
```

### パイプ処理

Unix スタイルのパイプで Claude Code を活用する：

```bash
# ビルドエラーの解析
cat build-error.txt | claude -p 'concisely explain the root cause of this build error'

# セキュリティレビュー
git diff main --name-only | claude -p "review these changed files for security issues"

# ログ監視
tail -f app.log | claude -p "alert me if you see critical errors"
```

### git worktree による並列セッション

複数のタスクを同時に進めるには、各 Claude セッションにコードベースの独自コピーが必要です。git worktree がこれを解決します：

```bash
# "feature-auth" という名前のワークツリーで Claude を起動
# .claude/worktrees/feature-auth/ に新しいブランチを作成
claude --worktree feature-auth

# 別のワークツリーで別のセッションを起動
claude --worktree bugfix-123
```

名前を省略すると自動生成されます：

```bash
# "bright-running-fox" のような名前が自動生成される
claude --worktree
```

ワークツリーは `<repo>/.claude/worktrees/<name>` に作成され、デフォルトのリモートブランチからブランチします。

**クリーンアップ:**
- 変更なし → ワークツリーとブランチが自動的に削除される
- 変更・コミットあり → Claude が保持か削除かを確認する

> **ヒント**: `.claude/worktrees/` を `.gitignore` に追加すると、ワークツリーの内容がメインリポジトリの未追跡ファイルとして表示されなくなります。

### 画像を使った作業

画像を会話に追加する方法：

1. Claude Code ウィンドウに画像をドラッグ&ドロップ
2. 画像をコピーして `Ctrl+V` で CLI に貼り付け（`Cmd+V` は不可）
3. 画像のパスを Claude に伝える: `"Analyze this image: /path/to/your/image.png"`

画像について質問する：

```
> What does this image show?
> Describe the UI elements in this screenshot
> Are there any problematic elements in this diagram?
```

コンテキストとして使う：

```
> Here's a screenshot of the error. What's causing it?
> This is our current database schema. How should we modify it for the new feature?
```

視覚的なコンテンツからコードを生成する：

```
> Generate CSS to match this design mockup
> What HTML structure would recreate this component?
```

**ヒント:**
- テキストでの説明が複雑になる場合に画像を使う
- エラー・UI デザイン・図などのスクリーンショットを活用する
- 複数の画像を 1 つの会話で使える
- Claude が画像を参照する場合（例: `[Image #1]`）、`Cmd+Click`（Mac）または `Ctrl+Click`（Windows/Linux）でデフォルトビューアで開ける

### 通知設定（長時間タスク用）

長時間のタスクを開始して別のウィンドウに切り替えた際、Claude が完了したり入力が必要になったりしたときに通知を受け取れます：

1. `/hooks` を開いて `Notification` イベントを選択
2. マッチャーを設定（すべての通知は `+ Match all`）
3. macOS の場合：

```bash
osascript -e 'display notification "Claude Code needs your attention" with title "Claude Code"'
```

4. `User settings` で保存（全プロジェクトに適用）

## まとめ

- コードベース探索は **広い質問 → 具体的な質問** の順で進める
- バグ修正は **エラーを共有 → 候補を提案 → 適用** の 3 ステップ
- リファクタリングは **小さな単位** で行い、各ステップでテストを実行する
- テストは Claude Code がプロジェクトの既存スタイルに合わせて生成する
- git worktree で複数の独立したセッションを並列実行できる
- 画像をコンテキストとして使うことで、UI 関連の作業が効率化する

## 公式リファレンス

- [Common Workflows](https://code.claude.com/docs/en/common-workflows) - 実践的なワークフロー集
- [Best Practices](https://code.claude.com/docs/en/best-practices) - 効果的な使い方
- [Skills](https://code.claude.com/docs/en/skills) - `/commit-push-pr` などのカスタムコマンド
- [Sub-agents](https://code.claude.com/docs/en/sub-agents) - 専門エージェントの活用
