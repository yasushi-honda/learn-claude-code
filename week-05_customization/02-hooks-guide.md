# Lesson 2: Hooksによる自動化

> 対応する公式ドキュメント: [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

## 学習目標

- Hooksとは何か、どのような場面で使うかを理解できる
- `/hooks` コマンドで簡単にフックを設定できる
- `PostToolUse` フックを使ってファイル編集後に自動整形を実行できる
- `PreToolUse` フックを使って特定ファイルの編集をブロックできる
- フックの設定場所とスコープを使い分けられる

## 概要

Hooksとは、Claude Codeのライフサイクルの特定ポイントで自動的にシェルコマンドを実行する仕組みです。「Claudeがファイルを編集したら必ずPrettierで整形する」「コミット前に必ずlintを実行する」「Claudeが待機状態になったらデスクトップ通知を送る」といった処理を、LLMの判断に頼らず確実に自動実行できます。

決定論的な制御が必要なケースにはHooksを、判断が必要なケースにはプロンプトベースのフックやエージェントベースのフックを使い分けることで、強力な自動化が実現できます。

## 本文

### Hooksとは

Hooksは以下の特徴を持ちます：

- **決定論的**: LLMの判断ではなく、設定したルールに従って確実に実行される
- **イベント駆動**: 特定のライフサイクルポイントでトリガーされる
- **シェルコマンド**: あらゆるシェルコマンドを実行可能

LLMへの依頼と異なり、「必ず実行される」という確実性が最大の利点です。

### 最初のHookを設定する（通知の例）

最も簡単な設定方法は `/hooks` インタラクティブメニューを使う方法です。

#### ステップ1: フックメニューを開く

Claude Codeで `/hooks` と入力します。

#### ステップ2: イベントを選択する

利用可能なフックイベントのリストが表示されます。`Notification` を選択します（Claudeが入力待ち状態になったときに発火）。

#### ステップ3: マッチャーを設定する

`*`（すべての通知タイプ）を設定します。

#### ステップ4: コマンドを追加する

OSに合わせて以下のコマンドを追加します：

**macOS:**
```bash
osascript -e 'display notification "Claude Code needs your attention" with title "Claude Code"'
```

**Linux:**
```bash
notify-send 'Claude Code' 'Claude Code needs your attention'
```

**Windows (PowerShell):**
```powershell
powershell.exe -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'Claude Code')"
```

#### ステップ5: 保存場所を選択する

- **User settings** (`~/.claude/settings.json`): 全プロジェクトで有効
- **Project settings** (`.claude/settings.json`): このプロジェクトのみ

### 主要なユースケース

#### 1. ファイル編集後の自動整形

Claudeがファイルを編集するたびにPrettierを自動実行します：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

**ポイント:**
- `PostToolUse`イベント: ツール実行後に発火
- `"Edit|Write"`マッチャー: ファイル編集・書き込み時のみ実行
- `jq`でJSONからファイルパスを取得
- `xargs`でPrettierに渡す

#### 2. 保護ファイルへの編集をブロック

`.env`や`package-lock.json`などを編集から保護します：

**ステップ1: フックスクリプトを作成する**

`.claude/hooks/protect-files.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

**ステップ2: 実行権限を付与する**

```bash
chmod +x .claude/hooks/protect-files.sh
```

**ステップ3: フックを登録する**

`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

#### 3. コンパクション後のコンテキスト再注入

コンテキストウィンドウが圧縮された後に重要な情報を再注入します：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

**応用例:**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "git log --oneline -5"
          }
        ]
      }
    ]
  }
}
```

#### 4. 設定変更の監査ログ

設定ファイルの変更を記録します：

```json
{
  "hooks": {
    "ConfigChange": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "jq -c '{timestamp: now | todate, source: .source, file: .file_path}' >> ~/claude-config-audit.log"
          }
        ]
      }
    ]
  }
}
```

### フックの仕組み

#### イベント一覧

| イベント | 発火タイミング |
|---------|-------------|
| `SessionStart` | セッション開始・再開時 |
| `UserPromptSubmit` | プロンプト送信時（Claude処理前） |
| `PreToolUse` | ツール実行前（ブロック可能） |
| `PermissionRequest` | 権限ダイアログ表示時 |
| `PostToolUse` | ツール実行成功後 |
| `PostToolUseFailure` | ツール実行失敗後 |
| `Notification` | Claude Codeが通知を送る時 |
| `SubagentStart` | サブエージェント起動時 |
| `SubagentStop` | サブエージェント終了時 |
| `Stop` | Claudeが応答を終えた時 |
| `TeammateIdle` | エージェントチームのメンバーがアイドル状態になる時 |
| `TaskCompleted` | タスクが完了済みとしてマークされる時 |
| `ConfigChange` | 設定ファイルが変更された時 |
| `WorktreeCreate` | ワークツリーが作成される時 |
| `WorktreeRemove` | ワークツリーが削除される時 |
| `PreCompact` | コンテキスト圧縮前 |
| `SessionEnd` | セッション終了時 |

#### 入力（stdin）の構造

フックはJSONとして以下の情報をstdinで受け取ります：

```json
{
  "session_id": "abc123",
  "cwd": "/Users/sarah/myproject",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

#### 出力と終了コード

| 終了コード | 意味 |
|-----------|------|
| `0` | 処理を続行。stdout に書いた内容はClaudeのコンテキストに追加 |
| `2` | アクションをブロック。stderrの内容がClaudeへのフィードバックになる |
| その他 | 処理を続行。stderrはログに記録されるが表示されない |

#### JSONによる構造化された出力

終了コード0でJSON出力を使うと、より詳細な制御ができます：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

`permissionDecision`の選択肢：
- `"allow"`: 権限プロンプトなしで続行
- `"deny"`: ツール呼び出しをキャンセルし、理由をClaudeに返す
- `"ask"`: 通常通り権限プロンプトを表示

### マッチャーの使い方

マッチャーはregexパターンで対象を絞り込みます：

| イベント | マッチ対象 | 例 |
|---------|-----------|-----|
| `PreToolUse`, `PostToolUse` | ツール名 | `Bash`, `Edit\|Write`, `mcp__.*` |
| `SessionStart` | 開始方法 | `startup`, `resume`, `clear`, `compact` |
| `SessionEnd` | 終了理由 | `clear`, `logout`, `prompt_input_exit` |
| `Notification` | 通知タイプ | `permission_prompt`, `idle_prompt` |
| `SubagentStart/Stop` | エージェントタイプ | `Bash`, `Explore`, `Plan` |
| `PreCompact` | 圧縮のトリガー | `manual`, `auto` |
| `ConfigChange` | 設定のソース | `user_settings`, `project_settings` |

**例: Bashツールのコマンドをログに記録する**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
          }
        ]
      }
    ]
  }
}
```

**例: MCPツールの呼び出しを追跡する**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"GitHub tool called: $(jq -r '.tool_name')\" >&2"
          }
        ]
      }
    ]
  }
}
```

### フックの設定場所

| 場所 | スコープ | 共有可能か |
|------|---------|----------|
| `~/.claude/settings.json` | 全プロジェクト | いいえ（個人の設定） |
| `.claude/settings.json` | 単一プロジェクト | はい（リポジトリに含めて共有） |
| `.claude/settings.local.json` | 単一プロジェクト | いいえ（gitignore対象） |
| 管理ポリシー設定 | 組織全体 | はい（管理者が制御） |
| プラグインの`hooks/hooks.json` | プラグイン有効時 | はい（プラグインに含める） |
| SkillまたはAgentのfrontmatter | スキル/エージェント有効時 | はい（コンポーネントファイルに定義） |

### プロンプトベースのフック

判断が必要な場合は`type: "prompt"`を使います：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains to be done\"}."
          }
        ]
      }
    ]
  }
}
```

モデル（デフォルト: Haiku）がJSON形式で決定を返します：
- `"ok": true`: 処理を続行
- `"ok": false`: ブロックし、`"reason"`をClaudeへのフィードバックとして使用

### エージェントベースのフック

ファイルの検査やコマンド実行が必要な場合は`type: "agent"`を使います：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify that all unit tests pass. Run the test suite and check the results. $ARGUMENTS",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

### トラブルシューティング

#### フックが発火しない

1. `/hooks`でフックが正しいイベントに登録されているか確認
2. マッチャーがツール名と完全に一致しているか確認（大文字小文字区別あり）
3. 正しいイベントタイプを使っているか確認

#### フックエラーが表示される

1. スクリプトをパイプでテストする：
   ```bash
   echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
   echo $?
   ```
2. パスに絶対パスを使うか`$CLAUDE_PROJECT_DIR`を使う
3. `chmod +x ./my-hook.sh`で実行権限を付与する

#### Stop フックが無限ループする

```bash
#!/bin/bash
INPUT=$(cat)
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Claudeが停止できるようにする
fi
# ... 残りのフックロジック
```

#### JSONバリデーションエラー

`~/.zshrc`や`~/.bashrc`の無条件の`echo`文が原因のことがあります。インタラクティブシェルのみで実行するよう修正します：

```bash
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

## まとめ

- Hooksは特定のライフサイクルポイントでシェルコマンドを自動実行する仕組み
- `/hooks`コマンドで対話的に設定できる
- 終了コード0で続行、2でブロック（stderrがClaudeへのフィードバックになる）
- マッチャーでregexパターンを使って実行タイミングを絞り込める
- 設定場所（個人・プロジェクト・組織）でスコープが決まる
- `type: "prompt"`や`type: "agent"`で判断が必要な場合も対応できる
- `Ctrl+O`でverboseモードに切り替えてデバッグできる

## 公式リファレンス

- [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)
- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [jq インストール](https://jqlang.github.io/jq/download/)
- [バリデーターの実装例](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)
