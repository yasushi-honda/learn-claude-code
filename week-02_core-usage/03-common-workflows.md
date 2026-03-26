# 基本ワークフロー

> **対応公式ドキュメント**: https://code.claude.com/docs/en/common-workflows
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. コードベースを素早く探索・理解するワークフローを実行できる
2. バグ修正やリファクタリングを Claude Code と協力して安全に進められる
3. Plan mode を活用して、変更前に影響範囲を分析できる
4. 画像・拡張思考・セッション管理などの高度な機能を使いこなせる
5. git worktree による並列セッションや通知設定で開発効率を最大化できる

---

## 1. コードベースの探索と理解

新しいプロジェクトに参加した場合や、既存プロジェクトの未知の領域を調べたい場合のワークフローです。「広い質問 → 具体的な質問」の順で進めるのがコツです。

### 初めてのプロジェクトに参加した場合

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

**探索のコツ:**
- 広い質問から始めて、特定の領域に絞り込む
- プロジェクト固有のコーディング規約について聞く
- プロジェクト固有の用語の用語集を要求する
- コードインテリジェンスプラグインをインストールすると正確な「定義へジャンプ」と「参照を検索」が可能になる

---

## 2. バグ修正とデバッグ

### エラーからバグを追跡する

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

**デバッグのコツ:**
- エラーを再現するコマンドを伝えてスタックトレースを取得させる
- エラーの再現手順を伝える
- エラーが断続的か一貫しているかを伝える

### Plan mode で安全にデバッグする

Plan mode は読み取り専用の分析ツールです。コードを変更する前に影響範囲を確認できます。

起動方法は3つあります：

1. **対話中に切り替え**: `Shift+Tab` を2回押す
2. **CLI から起動**: `claude --permission-mode plan`
3. **コマンドで切り替え**: `/plan`

```
> Analyze the authentication system and suggest improvements
```

Claude がコードベースを分析して包括的なプランを作成します。フォローアップで洗練させる：

```
> What about backward compatibility?
> How should we handle database migration?
```

> **ヒント**: `Ctrl+G` を押すとプランをデフォルトのテキストエディタで開いて直接編集できます。内容を保存して閉じると、編集したプランが会話に反映されます。

---

## 3. リファクタリングとテスト

### レガシーコードを段階的にリファクタリングする

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

**リファクタリングのコツ:**
- モダンなアプローチの利点を説明させる
- 後方互換性を維持する必要がある場合はその旨を伝える
- 小さなテスト可能な単位でリファクタリングする

### テストの作成と実行

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

> **公式ドキュメントより**: Claude Code は既存のテストファイルを検討して、使用しているスタイル・フレームワーク・アサーションパターンに合わせます。見落としやすいエッジケース（エラー条件・境界値・予期しない入力）の特定にも役立ちます。

---

## 4. 画像・拡張思考・セッション管理

### 画像を使った作業

画像を会話に追加する方法は3つあります：

1. **ドラッグ&ドロップ**: Claude Code ウィンドウに画像をドラッグ
2. **クリップボードから貼り付け**: 画像をコピーして `Ctrl+V` で貼り付け（`Cmd+V` は iTerm2）
3. **パスを指定**: `"Analyze this image: /path/to/your/image.png"`

画像の活用場面：

```
> Here's a screenshot of the error. What's causing it?
> This is our current database schema. How should we modify it for the new feature?
> Generate CSS to match this design mockup
```

> **ヒント**: Claude が画像を参照する場合（例: `[Image #1]`）、`Cmd+Click`（Mac）または `Ctrl+Click`（Windows/Linux）でデフォルトビューアで開けます。

### Extended Thinking（拡張思考）

Extended Thinking は Claude が複雑な問題を段階的に考えるモードです。デフォルトで有効化されています。

| 操作 | 説明 |
|---|---|
| `Ctrl+O` | 思考プロセスの詳細表示をトグル |
| `Option+T` / `Alt+T` | Extended Thinking 自体の有効/無効をトグル |

Thinking effort level（思考の深さ）：

| レベル | 説明 | 推奨場面 |
|---|---|---|
| `low` | 軽量な思考 | 簡単な質問・定型作業 |
| `medium` | 標準的な思考 | 通常のコーディング作業 |
| `high` | 深い思考 | 複雑なアーキテクチャ設計・デバッグ |

### セッション管理

Claude Code のセッションは永続化され、後から再開できます：

| 操作 | コマンド | 説明 |
|---|---|---|
| 最近のセッションを継続 | `claude --continue` / `claude -c` | 同一ディレクトリの最近の会話を読み込む |
| 名前付きセッションを再開 | `claude --resume <name>` / `claude -r <name>` | 名前で指定して再開 |
| PR に紐づくセッションを再開 | `claude --from-pr 123` | GitHub PR にリンクされたセッション |
| セッションに名前を付ける | `/rename my-session` | 後から再開しやすくする |
| セッションピッカーを開く | `/resume` | 過去のセッション一覧から選択 |

セッションピッカーのショートカット：

| キー | アクション |
|---|---|
| `↑` / `↓` | セッション選択を移動 |
| `→` / `←` | 詳細を展開/折りたたみ |
| `Enter` | 再開 |
| `P` | ピン付け |
| `R` | 名前変更 |
| `/` | 検索 |
| `A` | すべてのセッションを表示 |
| `B` | ブランチでフィルタ |

---

## 5. 高度なワークフロー

### コミットと PR 作成

ワンステップでコミット・プッシュ・PR 作成：

```
> /commit-push-pr
```

段階的に進める場合：

```
> summarize the changes I've made to the authentication module
> create a pr
> enhance the PR description with more context about the security improvements
```

> **公式ドキュメントより**: `gh pr create` を使って PR を作成すると、セッションが自動的にその PR にリンクされます。後から `claude --from-pr <number>` でセッションを再開できます。

### コードレビュー

```
> /review          # 現在のブランチの PR をレビュー
> /review 123      # 特定の PR をレビュー
> /security-review # セキュリティ脆弱性を分析
> /pr-comments 123 # PR のコメントを取得
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

名前を省略すると自動生成されます（例: "bright-running-fox"）：

```bash
claude --worktree
```

ワークツリーは `<repo>/.claude/worktrees/<name>` に作成されます。

**クリーンアップ:**
- 変更なし: ワークツリーとブランチが自動削除
- 変更・コミットあり: Claude が保持か削除かを確認

> **ヒント**: `.claude/worktrees/` を `.gitignore` に追加すると、ワークツリーの内容がメインリポジトリの未追跡ファイルとして表示されなくなります。

### @ファイル参照と MCP Resources

`@` を使ったファイル参照は自然言語プロンプトの中で使えます：

```
> Explain the logic in @src/utils/auth.js and compare it with @src/utils/legacy-auth.js
```

MCP サーバーが設定されている場合、MCP リソースも参照できます：

```
> Show me the data from @github:repos/owner/repo/issues
```

### パイプ処理（Unix-style 活用）

Unix スタイルのパイプで Claude Code を自動化に組み込めます：

```bash
# ビルドエラーの解析
cat build-error.txt | claude -p 'concisely explain the root cause of this build error'

# セキュリティレビュー
git diff main --name-only | claude -p "review these changed files for security issues"

# ログ監視
tail -f app.log | claude -p "alert me if you see critical errors"
```

`--output-format` で出力形式を制御：

```bash
# JSON 出力でスクリプトに組み込む
cat code.py | claude -p 'analyze this code for bugs' --output-format json > analysis.json
```

### 通知設定（長時間タスク用）

長時間のタスクを開始して別のウィンドウに切り替えた際、Claude が完了したり入力が必要になったりしたときに通知を受け取れます：

1. `/hooks` を開いて `Notification` イベントを選択
2. マッチャーを設定（すべての通知は `+ Match all`）
3. macOS の場合：

```bash
osascript -e 'display notification "Claude Code needs your attention" with title "Claude Code"'
```

4. `User settings` で保存（全プロジェクトに適用）

---

## ハンズオン演習

### 演習 1: コードベース探索

**目的**: プロジェクトの全体像を素早く把握するワークフローを体験する
**前提条件**: 任意のプロジェクトディレクトリ（自分のプロジェクトまたは OSS）

**手順**:
1. プロジェクトディレクトリで `claude` を起動する
2. `give me an overview of this codebase` と聞く
3. 回答を読み、気になった部分について `explain the <component> in detail` と深掘りする
4. `find the files related to <keyword>` で特定の機能に関連するファイルを探す
5. `what coding conventions does this project follow?` でコーディング規約を確認する

**期待される結果**: 広い質問 → 具体的な質問の流れで、プロジェクトの構造・アーキテクチャ・規約を短時間で把握できる

### 演習 2: Plan mode でのデバッグ分析

**目的**: Plan mode を使って、変更前に影響範囲を分析する体験
**前提条件**: 演習 1 と同じプロジェクト

**手順**:
1. `Shift+Tab` を2回押して Plan mode に切り替える（フッターに "plan mode on" と表示される）
2. `Analyze the error handling in this project and suggest improvements` と聞く
3. Claude が提示するプランを読み、`What files would be affected?` とフォローアップする
4. `Ctrl+G` を押してプランをテキストエディタで開いてみる
5. `Shift+Tab` で通常モードに戻す

**期待される結果**: Plan mode ではコード変更が実行されず、分析結果とプランのみが提示されることを確認

### 演習 3: 画像を使った UI 分析

**目的**: 画像をコンテキストとして使う体験
**前提条件**: 何らかのスクリーンショット画像（エラー画面・UI デザイン等）

**手順**:
1. Claude Code セッションで画像をドラッグ&ドロップまたは `Ctrl+V` で貼り付ける
2. `What does this image show?` と聞く
3. UI のスクリーンショットの場合、`Suggest improvements to this UI` と聞く
4. エラーのスクリーンショットの場合、`What's causing this error?` と聞く

**期待される結果**: Claude が画像の内容を認識し、適切な分析・提案を返す

---

## よくある質問

**Q: Plan mode で作成したプランを実行に移すにはどうしますか？**
A: `Shift+Tab` で通常モードまたは Auto-accept モードに切り替えてから、「先ほどのプランを実行して」と指示します。Claude は分析結果を踏まえて変更を実行します。

**Q: git worktree を使うとディスク容量を多く消費しますか？**
A: git worktree は git のネイティブ機能を使い、`.git` ディレクトリを共有するためフルクローンほどの容量は使いません。ただし作業ツリーのファイルコピーは発生するため、大きなリポジトリでは注意が必要です。

**Q: セッションの会話履歴はどこに保存されていますか？**
A: `~/.claude/` ディレクトリ内に保存されます。`/resume` でセッションピッカーを開くと、過去のセッション一覧を確認・選択できます。

**Q: Extended Thinking の effort level はどこで設定しますか？**
A: `/config` から設定できます。また、`Option+T`（Mac）/ `Alt+T`（Windows/Linux）でセッション中にトグルすることもできます。

---

## まとめ

この章で学んだ重要ポイント：

- コードベース探索は **広い質問 → 具体的な質問** の順で進める
- バグ修正は **エラーを共有 → 候補を提案 → 適用** の3ステップ
- Plan mode で変更前に影響範囲を確認し、安全にリファクタリングを進める
- 画像・Extended Thinking・セッション管理を組み合わせて効率的に作業する
- git worktree で複数の独立したセッションを並列実行、通知設定で長時間タスクを管理する

## 次のステップ

次の章「ファイル操作」では、Claude Code が内部で使用するツール（Read・Edit・Write・Glob・Grep・Bash）の特性を理解し、効果的なプロンプトの書き方を学びます。

---

> **公式リファレンス**
> - [Common Workflows](https://code.claude.com/docs/en/common-workflows) - 実践的なワークフロー集
> - [Best Practices](https://code.claude.com/docs/en/best-practices) - 効果的な使い方
> - [Skills](https://code.claude.com/docs/en/skills) - `/commit-push-pr` などのカスタムコマンド
> - [Hooks](https://code.claude.com/docs/en/hooks) - 通知設定やカスタムフックの詳細
