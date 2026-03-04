# CLI コマンド体系

> **対応公式ドキュメント**: https://code.claude.com/docs/en/cli-reference
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. `claude`・`claude -p`・`claude -c`・`claude -r` など主要な起動モードを使い分けられる
2. 重要な CLI フラグ（`--model`・`--permission-mode`・`--output-format` 等）を目的に応じて選択できる
3. システムプロンプトフラグ（`--system-prompt` vs `--append-system-prompt`）を正しく使い分けられる
4. パイプやスクリプト・CI/CD パイプラインへの組み込みができる
5. `--agents` フラグでカスタムサブエージェントを動的に定義できる

---

## 1. CLI コマンド一覧

Claude Code の CLI はシンプルな `claude` コマンドから始まり、用途に応じてさまざまなモードで起動できます。対話セッション・ワンライナー・CI/CD パイプラインまで、場面に応じて使い分けましょう。

### 基本コマンド

| コマンド | 説明 | 例 |
|---|---|---|
| `claude` | 対話セッションを開始 | `claude` |
| `claude "query"` | 初期プロンプト付きで対話セッションを開始 | `claude "explain this project"` |
| `claude -p "query"` | SDK モードでクエリを実行して終了 | `claude -p "explain this function"` |
| `cat file \| claude -p "query"` | パイプされたコンテンツを処理 | `cat logs.txt \| claude -p "explain"` |

### セッション管理コマンド

| コマンド | 説明 | 例 |
|---|---|---|
| `claude -c` | 現在のディレクトリの最近の会話を継続 | `claude -c` |
| `claude -c -p "query"` | SDK 経由で最近の会話を継続 | `claude -c -p "Check for type errors"` |
| `claude -r "<session>" "query"` | セッションを ID または名前で再開 | `claude -r "auth-refactor" "Finish this PR"` |

### ユーティリティコマンド

| コマンド | 説明 | 例 |
|---|---|---|
| `claude update` | 最新バージョンに更新 | `claude update` |
| `claude auth login` | Anthropic アカウントにサインイン | `claude auth login --email user@example.com --sso` |
| `claude auth logout` | Anthropic アカウントからログアウト | `claude auth logout` |
| `claude auth status` | 認証状態を表示（デフォルト JSON、`--text` で人間向け） | `claude auth status` |
| `claude agents` | 設定済みのサブエージェントを一覧表示 | `claude agents` |
| `claude mcp` | MCP サーバーを設定 | `claude mcp add ...` |
| `claude remote-control` | リモートコントロールセッションを開始 | `claude remote-control` |

> **公式ドキュメントより**: `claude -p`（print モード）は非対話的に動作するため、CI/CD やスクリプトからの呼び出しに最適です。対話的なセッションが不要な場合はこちらを使います。

---

## 2. CLI フラグ一覧

CLI フラグは機能カテゴリごとに整理できます。すべてを覚える必要はありません。よく使うものから順に身に付けていきましょう。

### ディレクトリ・エージェント

| フラグ | 説明 | 例 |
|---|---|---|
| `--add-dir` | アクセス可能な作業ディレクトリを追加 | `claude --add-dir ../apps ../lib` |
| `--agent` | 現在のセッションのエージェントを指定 | `claude --agent my-custom-agent` |
| `--agents` | JSON でカスタムサブエージェントを動的に定義 | （後述参照） |

### ツール制御

| フラグ | 説明 | 例 |
|---|---|---|
| `--allowedTools` | 権限確認なしで実行できるツール | `"Bash(git log *)" "Read"` |
| `--disallowedTools` | モデルのコンテキストから削除して使用不可にするツール | `"Bash(git log *)" "Edit"` |
| `--tools` | Claude が使用できる組み込みツールを制限 | `claude --tools "Bash,Edit,Read"` |

### セッション管理

| フラグ | 説明 | 例 |
|---|---|---|
| `--continue`, `-c` | 最近の会話を読み込む | `claude --continue` |
| `--resume`, `-r` | セッションを ID・名前で再開 | `claude --resume auth-refactor` |
| `--fork-session` | 再開時に新しいセッション ID を作成 | `claude --continue --fork-session` |
| `--from-pr` | 特定の GitHub PR にリンクされたセッションを再開 | `claude --from-pr 123` |
| `--session-id` | 特定のセッション ID を使用（有効な UUID が必要） | `claude --session-id "550e8400-..."` |
| `--no-session-persistence` | セッションをディスクに保存しない（print のみ） | `claude -p --no-session-persistence "query"` |

### システムプロンプト

| フラグ | 説明 | モード |
|---|---|---|
| `--system-prompt` | デフォルトプロンプト全体を置き換え | Interactive + Print |
| `--system-prompt-file` | ファイルから読み込んで置き換え | Print のみ |
| `--append-system-prompt` | デフォルトプロンプトの末尾に追加 | Interactive + Print |
| `--append-system-prompt-file` | ファイルから読み込んで追加 | Print のみ |

### 出力・フォーマット

| フラグ | 説明 | 例 |
|---|---|---|
| `--output-format` | 出力形式（`text`・`json`・`stream-json`） | `claude -p "query" --output-format json` |
| `--input-format` | 入力形式（`text`・`stream-json`） | `claude -p --input-format stream-json` |
| `--include-partial-messages` | ストリーミングの部分イベントを含める | 要 `--print` と `--output-format=stream-json` |
| `--json-schema` | JSON Schema 検証済みの構造化出力 | `claude -p --json-schema '{"type":"object",...}' "query"` |
| `--verbose` | 詳細ロギングを有効化 | `claude --verbose` |

### モデル・パーミッション

| フラグ | 説明 | 例 |
|---|---|---|
| `--model` | モデルを設定（エイリアス: `sonnet`・`opus`） | `claude --model claude-sonnet-4-6` |
| `--permission-mode` | パーミッションモードで起動 | `claude --permission-mode plan` |
| `--dangerously-skip-permissions` | 全権限確認をスキップ（注意） | `claude --dangerously-skip-permissions` |
| `--allow-dangerously-skip-permissions` | 権限バイパスをオプションとして有効化 | 即座には有効化しない |

### 自動化・スクリプト

| フラグ | 説明 | 例 |
|---|---|---|
| `--print`, `-p` | 対話モードなしで応答を出力 | `claude -p "query"` |
| `--max-budget-usd` | 最大予算を USD で指定（print のみ） | `claude -p --max-budget-usd 5.00 "query"` |
| `--max-turns` | エージェントターン数を制限（print のみ） | `claude -p --max-turns 3 "query"` |
| `--fallback-model` | 過負荷時のフォールバックモデル（print のみ） | `claude -p --fallback-model sonnet "query"` |

### その他

| フラグ | 説明 | 例 |
|---|---|---|
| `--mcp-config` | MCP サーバー設定を JSON から読み込む | `claude --mcp-config ./mcp.json` |
| `--worktree`, `-w` | 分離された git ワークツリーで起動 | `claude -w feature-auth` |
| `--chrome` | Chrome ブラウザ統合を有効化 | `claude --chrome` |
| `--remote` | claude.ai に新しい Web セッションを作成 | `claude --remote "Fix the login bug"` |
| `--teleport` | ローカルターミナルで Web セッションを再開 | `claude --teleport` |
| `--plugin-dir` | プラグインディレクトリを指定 | `claude --plugin-dir ./plugins` |
| `--debug` | デバッグモードを有効化 | `claude --debug "api,mcp"` |
| `--version`, `-v` | バージョン番号を出力 | `claude -v` |
| `--disable-slash-commands` | スキルとコマンドを無効化 | `claude --disable-slash-commands` |
| `--teammate-mode` | Agent Team の表示方法 | `claude --teammate-mode in-process` |

### 起動モードの選び方

どのモードで起動するかは、作業の目的によって決まります：

| 目的 | コマンド | 理由 |
|---|---|---|
| 対話的にコーディング | `claude` | 複数のやり取りで作業を進める |
| 質問に即答してもらう | `claude -p "query"` | 結果を受け取って終了 |
| 前回の作業を続ける | `claude -c` | 同じディレクトリの最近の会話を読み込む |
| 特定のセッションを再開 | `claude -r "name"` | 名前付きセッションを正確に指定 |
| PR のレビュー対応を続ける | `claude --from-pr 123` | PR コンテキストを持った状態で再開 |
| CI/CD で自動処理 | `cat file \| claude -p` | パイプ入力を処理してテキスト出力 |

---

## 3. システムプロンプトフラグの使い分け

4つのシステムプロンプトフラグは「置き換え」と「追加」の2軸で整理できます。ほとんどの場合は **`--append-system-prompt`（追加）が安全** です。

| フラグ | 動作 | 使用場面 |
|---|---|---|
| `--system-prompt` | デフォルトプロンプト**全体を置き換え** | Claude Code のデフォルト動作を完全に制御したい場合 |
| `--system-prompt-file` | ファイルの内容で**置き換え** | バージョン管理されたプロンプトテンプレートを使う場合 |
| `--append-system-prompt` | デフォルトプロンプトに**追加** | デフォルト機能を維持しつつ指示を追加（最も安全） |
| `--append-system-prompt-file` | ファイルの内容を**追加** | バージョン管理された追加指示をファイルから読み込む場合 |

**実際の使用例:**

完全なカスタム制御（デフォルト機能が不要な場合）：
```bash
claude --system-prompt "You are a Python expert who only writes type-annotated code"
```

デフォルトを維持しつつ追加（推奨）：
```bash
claude --append-system-prompt "Always use TypeScript and include JSDoc comments"
```

ファイルからロード：
```bash
claude -p --system-prompt-file ./prompts/code-review.txt "Review this PR"
```

---

## 4. 出力フォーマットとパイプ活用

### 出力フォーマットの使い分け

| フォーマット | 説明 | 使用場面 |
|---|---|---|
| `text`（デフォルト） | プレーンテキスト応答 | シンプルな統合、人間が読む場合 |
| `json` | メタデータ（コスト・時間）付き JSON 配列 | 完全な会話ログが必要な場合 |
| `stream-json` | リアルタイムの JSON オブジェクトストリーム | リアルタイム処理が必要な場合 |

### パイプと自動化の実践例

**ビルドエラーの解析:**

```bash
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt
```

**JSON 出力でスクリプトに組み込む:**

```bash
cat code.py | claude -p 'analyze this code for bugs' --output-format json > analysis.json
```

**セキュリティレビュー:**

```bash
git diff main --name-only | claude -p "review these changed files for security issues"
```

**CI/CD への組み込み（package.json）:**

```json
{
  "scripts": {
    "lint:claude": "claude -p 'you are a linter. please look at the changes vs. main and report any issues related to typos. report the filename and line number on one line, and a description of the issue on the second line. do not return any other text.'"
  }
}
```

**ログ監視とアラート:**

```bash
tail -f app.log | claude -p "Slack me if you see any anomalies"
```

**CI での自動翻訳:**

```bash
claude -p "translate new strings into French and raise a PR for review"
```

### 実践パターン集

**package.json に組み込む（チーム共有）:**

```json
{
  "scripts": {
    "review": "claude -p 'review the changes in this PR for bugs and security issues'",
    "explain": "claude -p 'explain the architecture of this project in 3 paragraphs'",
    "test:gen": "claude -p 'generate tests for any untested functions in src/'"
  }
}
```

**構造化出力（JSON Schema 検証）:**

```bash
claude -p --json-schema '{
  "type": "object",
  "properties": {
    "bugs": {"type": "array", "items": {"type": "string"}},
    "severity": {"type": "string", "enum": ["low", "medium", "high"]},
    "suggestion": {"type": "string"}
  },
  "required": ["bugs", "severity", "suggestion"]
}' "analyze src/auth.ts for bugs"
```

**予算とターン数の制限（安全弁）:**

```bash
# 最大 $2.00 まで、最大 5 ターンで制限
claude -p --max-budget-usd 2.00 --max-turns 5 "refactor the auth module"
```

**フォールバックモデルの設定:**

```bash
# Opus が過負荷の場合に Sonnet にフォールバック
claude -p --model opus --fallback-model sonnet "explain this codebase"
```

---

## 5. --agents フラグによるカスタムサブエージェント

`--agents` フラグを使うと、セッション起動時にカスタムサブエージェントを JSON で動的に定義できます。チーム固有のワークフローや専門的な分析をエージェントとして定義しておくと便利です。

### フォーマット

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

### フィールド一覧

| フィールド | 必須 | 説明 |
|---|---|---|
| `description` | 必須 | エージェントをいつ呼び出すかの自然言語説明 |
| `prompt` | 必須 | エージェントの動作を導くシステムプロンプト |
| `tools` | 任意 | 使用できるツールの配列（省略時はすべてのツールを継承） |
| `disallowedTools` | 任意 | 明示的に拒否するツール名の配列 |
| `model` | 任意 | モデルエイリアス（`sonnet`・`opus`・`haiku`・`inherit`） |
| `skills` | 任意 | プリロードするスキル名の配列 |
| `mcpServers` | 任意 | サブエージェント用の MCP サーバーの配列 |
| `maxTurns` | 任意 | 停止するまでの最大ターン数 |

> **ヒント**: `description` は Claude がエージェントを「いつ使うか」を判断するための指示です。具体的に書くほど適切なタイミングで呼び出されます。

### 実践例: テストエキスパートエージェント

```bash
claude --agents '{
  "test-expert": {
    "description": "Testing specialist. Invoke when writing, fixing, or analyzing tests.",
    "prompt": "You are a testing expert. Write comprehensive tests including edge cases, error conditions, and boundary values. Follow the existing test patterns in the project.",
    "tools": ["Read", "Grep", "Glob", "Bash", "Edit", "Write"],
    "model": "sonnet",
    "maxTurns": 10
  }
}'
```

このセッションでは、テストに関する作業を依頼すると Claude が自動的に `test-expert` エージェントを呼び出します。エージェントは指定された `tools` のみを使用し、`maxTurns` に達すると停止します。

---

## ハンズオン演習

### 演習 1: 起動モードの使い分け

**目的**: 対話モード・print モード・セッション継続の違いを体験する
**前提条件**: Claude Code がインストール済み、任意のプロジェクトディレクトリで作業

**手順**:
1. `claude` で対話セッションを開始し、`what is 2+2?` と質問して `Ctrl+D` で終了する
2. `claude -p "what is 2+2?"` で print モードを試す（結果だけが出力されて終了する）
3. `claude -c` で先ほどの対話セッションを継続し、`what was my last question?` と聞く
4. `/rename "test-session"` でセッションに名前を付けて `Ctrl+D` で終了する
5. `claude -r "test-session"` で名前付きセッションを再開する

**期待される結果**: 対話モードと print モードの違い、`-c` と `-r` によるセッション継続を体験できる

### 演習 2: パイプ処理と出力フォーマット

**目的**: CLI のパイプ処理と出力形式の違いを理解する
**前提条件**: 任意のソースコードファイルがあること

**手順**:
1. `cat <ファイル名> | claude -p "このコードを1行で要約して"` でパイプ入力を試す
2. 同じコマンドに `--output-format json` を追加して JSON 出力を確認する
3. `claude -p --max-turns 1 "hello"` でターン数制限を試す

**期待される結果**: text 出力と json 出力の違いを確認し、`--max-turns` でターン数を制限できることを理解する

### 演習 3: システムプロンプトのカスタマイズ

**目的**: `--append-system-prompt` と `--system-prompt` の違いを体験する
**前提条件**: 演習 1 と同じ環境

**手順**:
1. `claude --append-system-prompt "必ず日本語で回答してください" "What is TypeScript?"` を実行する
2. `claude --system-prompt "あなたは俳句を詠む詩人です" -p "TypeScript"` を実行する
3. 2つの結果を比較する（前者はコーディング機能を維持しつつ日本語化、後者は完全にカスタム動作）

**期待される結果**: `--append-system-prompt` がデフォルト機能を維持し、`--system-prompt` が完全に置き換えることを確認

---

## よくある質問

**Q: `claude -p` と `claude` の違いは何ですか？**
A: `claude -p`（print モード）は非対話的に動作し、結果を標準出力に出力して終了します。スクリプトや CI/CD からの呼び出しに適しています。`claude` は対話セッションを開始し、複数回のやり取りが可能です。

**Q: `--system-prompt` と `--append-system-prompt` のどちらを使うべきですか？**
A: ほとんどの場合は `--append-system-prompt` が安全です。Claude Code のデフォルト機能（ファイル操作・コード理解等）を維持しつつ、追加の指示を与えられます。`--system-prompt` はデフォルト動作を完全に制御したい特殊なケースで使用します。

**Q: `--max-budget-usd` を設定すると予算を超えた場合どうなりますか？**
A: 指定した予算に達するとセッションが自動的に停止します。print モードでのみ有効で、コストが暴走するのを防ぐのに便利です。

**Q: `--agents` フラグで定義したエージェントはセッション間で保持されますか？**
A: いいえ。`--agents` フラグは起動時にのみ有効です。永続化するには `.claude/agents/` ディレクトリにエージェント定義ファイルを作成します。

**Q: `--from-pr` はどのような場面で使いますか？**
A: `gh pr create` で作成した PR に自動リンクされたセッションを再開するときに使います。PR のレビューコメントへの対応や追加修正を続ける場面で便利です。

---

## まとめ

この章で学んだ重要ポイント：

- `claude` で対話セッション、`claude -p "query"` でワンショットクエリ、`claude -c` / `-r` でセッション継続
- `--output-format json` や `--output-format stream-json` でスクリプトへの組み込みが可能
- `--system-prompt` はデフォルトを**置き換え**、`--append-system-prompt` は**追加**（ほとんどの場合は後者が安全）
- `--permission-mode plan` でプランモード起動、`--max-turns` と `--max-budget-usd` で自動化の安全弁を設定
- `--agents` フラグで JSON 定義のカスタムサブエージェントを動的に作成できる

## 次のステップ

次の章「基本ワークフロー」では、CLI の知識を活用して、コードベース探索・バグ修正・リファクタリング・テスト・PR 作成などの実践的なワークフローを学びます。

---

> **公式リファレンス**
> - [CLI Reference](https://code.claude.com/docs/en/cli-reference) - コマンド・フラグの完全リスト
> - [Common Workflows](https://code.claude.com/docs/en/common-workflows) - パイプ処理等の実践的な使い方
> - [Sub-agents](https://code.claude.com/docs/en/sub-agents) - サブエージェントの詳細
> - [Headless Mode](https://code.claude.com/docs/en/headless) - CI/CD 統合の詳細
