# CLI コマンド体系

> 対応する公式ドキュメント: [CLI Reference](https://code.claude.com/docs/en/cli-reference)

## 学習目標

- `claude`・`claude -p`・`claude -c` など主要な起動モードを使い分けられる
- 重要な CLI フラグ（`--model`・`--permission-mode`・`--output-format` 等）を理解する
- システムプロンプトフラグ（`--system-prompt` vs `--append-system-prompt`）を正しく使い分けられる
- パイプやスクリプトへの組み込みができる

## 概要

Claude Code の CLI はシンプルな `claude` コマンドから始まり、豊富なフラグでさまざまな場面に対応できます。対話セッション・ワンライナー・CI/CD パイプラインまで、用途に応じて使い分けることで Claude Code を最大限に活用できます。

## 本文

### CLI コマンド一覧

| コマンド | 説明 | 例 |
|---|---|---|
| `claude` | 対話セッションを開始 | `claude` |
| `claude "query"` | 初期プロンプト付きで対話セッションを開始 | `claude "explain this project"` |
| `claude -p "query"` | SDK 経由でクエリを実行して終了 | `claude -p "explain this function"` |
| `cat file \| claude -p "query"` | パイプされたコンテンツを処理 | `cat logs.txt \| claude -p "explain"` |
| `claude -c` | 現在のディレクトリの最近の会話を継続 | `claude -c` |
| `claude -c -p "query"` | SDK 経由で継続 | `claude -c -p "Check for type errors"` |
| `claude -r "<session>" "query"` | セッションを ID または名前で再開 | `claude -r "auth-refactor" "Finish this PR"` |
| `claude update` | 最新バージョンに更新 | `claude update` |
| `claude auth login` | Anthropic アカウントにサインイン | `claude auth login --email user@example.com --sso` |
| `claude auth logout` | Anthropic アカウントからログアウト | `claude auth logout` |
| `claude auth status` | 認証状態を JSON で表示（`--text` で人間向け出力） | `claude auth status` |
| `claude agents` | 設定済みのサブエージェントを一覧表示 | `claude agents` |
| `claude mcp` | MCP サーバーを設定 | （MCP ドキュメント参照） |
| `claude remote-control` | リモートコントロールセッションを開始 | `claude remote-control` |

### CLI フラグ一覧

#### ディレクトリ・エージェント

| フラグ | 説明 | 例 |
|---|---|---|
| `--add-dir` | アクセス可能な作業ディレクトリを追加 | `claude --add-dir ../apps ../lib` |
| `--agent` | 現在のセッションのエージェントを指定 | `claude --agent my-custom-agent` |
| `--agents` | JSON でカスタムサブエージェントを動的に定義 | （後述参照） |

#### ツール制御

| フラグ | 説明 | 例 |
|---|---|---|
| `--allowedTools` | 権限確認なしで実行できるツール | `"Bash(git log *)" "Read"` |
| `--disallowedTools` | モデルのコンテキストから削除して使用不可にするツール | `"Bash(git log *)" "Edit"` |
| `--tools` | Claude が使用できる組み込みツールを制限 | `claude --tools "Bash,Edit,Read"` |

#### セッション管理

| フラグ | 説明 | 例 |
|---|---|---|
| `--continue`, `-c` | 現在のディレクトリの最近の会話を読み込む | `claude --continue` |
| `--resume`, `-r` | セッションを ID・名前で再開、またはピッカーを表示 | `claude --resume auth-refactor` |
| `--fork-session` | 再開時に新しいセッション ID を作成（`--resume`・`--continue` と併用） | `claude --continue --fork-session` |
| `--from-pr` | 特定の GitHub PR にリンクされたセッションを再開 | `claude --from-pr 123` |
| `--session-id` | 特定のセッション ID を使用（有効な UUID が必要） | `claude --session-id "550e8400-..."` |
| `--no-session-persistence` | セッションをディスクに保存しない（print モードのみ） | `claude -p --no-session-persistence "query"` |

#### システムプロンプト

| フラグ | 説明 | モード |
|---|---|---|
| `--system-prompt` | デフォルトプロンプト全体を置き換え | Interactive + Print |
| `--system-prompt-file` | ファイルから読み込んでデフォルトプロンプトを置き換え | Print のみ |
| `--append-system-prompt` | デフォルトプロンプトの末尾に追加 | Interactive + Print |
| `--append-system-prompt-file` | ファイルから読み込んでデフォルトプロンプトに追加 | Print のみ |

#### 出力・フォーマット

| フラグ | 説明 | 例 |
|---|---|---|
| `--output-format` | print モードの出力形式（`text`・`json`・`stream-json`） | `claude -p "query" --output-format json` |
| `--input-format` | print モードの入力形式（`text`・`stream-json`） | `claude -p --input-format stream-json` |
| `--include-partial-messages` | ストリーミングの部分イベントを出力に含める | （要 `--print` と `--output-format=stream-json`） |
| `--json-schema` | エージェント完了後に JSON Schema 検証済みの JSON 出力 | `claude -p --json-schema '{"type":"object",...}' "query"` |
| `--verbose` | 詳細ロギングを有効化（ターン別の完全な出力） | `claude --verbose` |

#### モデル・パーミッション

| フラグ | 説明 | 例 |
|---|---|---|
| `--model` | セッションのモデルを設定（エイリアス: `sonnet`・`opus`） | `claude --model claude-sonnet-4-6` |
| `--permission-mode` | 指定したパーミッションモードで起動 | `claude --permission-mode plan` |
| `--dangerously-skip-permissions` | 全権限確認をスキップ（注意が必要） | `claude --dangerously-skip-permissions` |
| `--allow-dangerously-skip-permissions` | 権限バイパスをオプションとして有効化（即座には有効化しない） | `claude --permission-mode plan --allow-dangerously-skip-permissions` |

#### 自動化・スクリプト

| フラグ | 説明 | 例 |
|---|---|---|
| `--print`, `-p` | 対話モードなしで応答を出力 | `claude -p "query"` |
| `--max-budget-usd` | API 呼び出しの最大予算を USD で指定（print モードのみ） | `claude -p --max-budget-usd 5.00 "query"` |
| `--max-turns` | エージェントターン数を制限（print モードのみ） | `claude -p --max-turns 3 "query"` |
| `--fallback-model` | デフォルトモデルが過負荷の場合のフォールバックモデル（print モードのみ） | `claude -p --fallback-model sonnet "query"` |

#### その他

| フラグ | 説明 | 例 |
|---|---|---|
| `--mcp-config` | JSON ファイルまたは文字列から MCP サーバーを読み込む | `claude --mcp-config ./mcp.json` |
| `--worktree`, `-w` | 分離された git ワークツリーで Claude を起動 | `claude -w feature-auth` |
| `--chrome` | Chrome ブラウザ統合を有効化 | `claude --chrome` |
| `--remote` | 指定タスクで claude.ai に新しい Web セッションを作成 | `claude --remote "Fix the login bug"` |
| `--teleport` | ローカルターミナルで Web セッションを再開 | `claude --teleport` |
| `--debug` | オプションのカテゴリフィルタリング付きでデバッグモードを有効化 | `claude --debug "api,mcp"` |
| `--version`, `-v` | バージョン番号を出力 | `claude -v` |
| `--disable-slash-commands` | このセッションのすべてのスキルとコマンドを無効化 | `claude --disable-slash-commands` |
| `--teammate-mode` | Agent Team のメイト表示方法（`auto`・`in-process`・`tmux`） | `claude --teammate-mode in-process` |

### システムプロンプトフラグの使い分け

4 つのシステムプロンプトフラグはそれぞれ目的が異なります：

| フラグ | 動作 | 使用場面 |
|---|---|---|
| `--system-prompt` | デフォルトプロンプト**全体を置き換え** | Claude Code のデフォルト動作を完全に制御したい場合 |
| `--system-prompt-file` | ファイルの内容でデフォルトを**置き換え** | バージョン管理されたプロンプトテンプレートを使う場合 |
| `--append-system-prompt` | デフォルトプロンプトに**追加** | デフォルト機能を維持しつつ特定の指示を追加する場合（最も安全） |
| `--append-system-prompt-file` | ファイルの内容をデフォルトに**追加** | バージョン管理された追加指示をファイルから読み込む場合 |

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

### 出力フォーマットの使い分け

| フォーマット | 説明 | 使用場面 |
|---|---|---|
| `text`（デフォルト） | Claude のプレーンテキスト応答のみ | シンプルな統合、人間が読む場合 |
| `json` | メタデータ（コスト・時間）付きの JSON 配列 | 完全な会話ログが必要な場合 |
| `stream-json` | リアルタイムの JSON オブジェクトストリーム | リアルタイム処理が必要な場合 |

**活用例:**

```bash
# ビルドエラーの解析をファイルに保存
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt

# JSON 出力でスクリプトに組み込む
cat code.py | claude -p 'analyze this code for bugs' --output-format json > analysis.json

# ストリーミング出力でリアルタイム処理
cat log.txt | claude -p 'parse this log file for errors' --output-format stream-json
```

### パイプと自動化の活用例

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

**変更ファイルのセキュリティレビュー:**

```bash
git diff main --name-only | claude -p "review these changed files for security issues"
```

**CI での自動翻訳:**

```bash
claude -p "translate new strings into French and raise a PR for review"
```

### `--agents` フラグのフォーマット

カスタムサブエージェントを JSON で動的に定義できます：

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

各エージェントのフィールド：

| フィールド | 必須 | 説明 |
|---|---|---|
| `description` | 必須 | エージェントをいつ呼び出すかの自然言語説明 |
| `prompt` | 必須 | エージェントの動作を導くシステムプロンプト |
| `tools` | 任意 | 使用できるツールの配列（省略時はすべてのツールを継承） |
| `disallowedTools` | 任意 | 明示的に拒否するツール名の配列 |
| `model` | 任意 | モデルエイリアス（`sonnet`・`opus`・`haiku`・`inherit`） |
| `skills` | 任意 | サブエージェントのコンテキストにプリロードするスキル名の配列 |
| `mcpServers` | 任意 | サブエージェント用の MCP サーバーの配列 |
| `maxTurns` | 任意 | サブエージェントが停止するまでの最大ターン数 |

## まとめ

- `claude -p "query"` でワンショットクエリ、`cat file | claude -p "query"` でパイプ処理
- `--output-format json` や `--output-format stream-json` でスクリプトへの組み込みが可能
- `--system-prompt` はデフォルトを**置き換え**、`--append-system-prompt` は**追加**（ほとんどの場合は後者が安全）
- `--permission-mode plan` でプランモード起動、`--max-turns` でターン数を制限
- `--agents` フラグで JSON 定義のカスタムサブエージェントを動的に作成

## 公式リファレンス

- [CLI Reference](https://code.claude.com/docs/en/cli-reference) - コマンド・フラグの完全リスト
- [Common Workflows](https://code.claude.com/docs/en/common-workflows) - パイプ処理等の実践的な使い方
- [Sub-agents](https://code.claude.com/docs/en/sub-agents) - サブエージェントの詳細
- [Settings](https://code.claude.com/docs/en/settings) - 設定ファイルの詳細
