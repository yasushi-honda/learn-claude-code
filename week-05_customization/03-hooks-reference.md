# Lesson 3: Hooks詳細リファレンス

> 対応する公式ドキュメント: [Hooks reference](https://code.claude.com/docs/en/hooks)

## 学習目標

- フックイベント一覧と各イベントのスキーマを理解できる
- 設定スキーマ（JSON形式）を正確に記述できる
- 環境変数を活用してフックを設定できる
- 終了コードの意味を理解し、適切に実装できる
- MCPツールフックを使って外部ツールの呼び出しを制御できる
- デバッグコマンドを使ってフックの問題を解決できる

## 概要

前のレッスンではHooksの使い方を学びました。このレッスンでは、公式リファレンスに基づいてフックの技術仕様を詳しく解説します。実際のプロジェクトでフックを実装・デバッグする際の参考資料として活用してください。

## 本文

### フックのライフサイクル

Claude Codeのアジェンティックループにおけるフックの実行順序：

```
セッション開始
    ↓ SessionStart
ユーザープロンプト入力
    ↓ UserPromptSubmit
ツール使用の判断
    ↓ PreToolUse（ここでブロック可能）
ツール実行
    ↓ PostToolUse / PostToolUseFailure
応答完了
    ↓ Stop
    ↓ SessionEnd（セッション終了時）
```

### フックイベント詳細

#### SessionStart

セッション開始または再開時に発火します。

**マッチャー値:**
- `startup`: 新規セッション開始
- `resume`: 既存セッションの再開
- `clear`: `/clear`実行後
- `compact`: コンパクション後

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "SessionStart",
  "source": "startup"
}
```

**実用例: セッション開始時にコンテキストを注入する**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "cat .claude/context.md"
          }
        ]
      }
    ]
  }
}
```

#### UserPromptSubmit

ユーザーがプロンプトを送信した後、Claudeが処理する前に発火します。

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "ユーザーが入力したテキスト"
}
```

**JSON出力:** `additionalContext`フィールドを使ってコンテキストを注入できます。

**実用例: プロンプトの前処理**
```bash
#!/bin/bash
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt')

# 特定のキーワードが含まれる場合に追加コンテキストを注入
if echo "$PROMPT" | grep -q "database"; then
  echo "Note: This project uses PostgreSQL 15 with the pg gem."
fi
```

#### PreToolUse

ツールが実行される前に発火します。終了コード2で実行をブロックできます。

**マッチャー値:** ツール名（例: `Bash`, `Edit`, `Write`, `mcp__server__tool`）

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /important"
  }
}
```

**構造化JSON出力:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "このコマンドは危険です"
  }
}
```

**`permissionDecision`の値:**
- `"allow"`: プロンプトなしで許可
- `"deny"`: 拒否して理由をClaudeに返す
- `"ask"`: 通常の権限プロンプトを表示

#### PostToolUse

ツールが正常に実行された後に発火します。

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "content": "..."
  },
  "tool_response": "File written successfully"
}
```

**注意:** `PostToolUse`フックはツールが既に実行された後なので、アクションを取り消すことはできません。

#### PostToolUseFailure

ツール実行が失敗した後に発火します。

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "PostToolUseFailure",
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  },
  "error": "エラーメッセージ"
}
```

**実用例: テスト失敗時にSlack通知**
```bash
#!/bin/bash
INPUT=$(cat)
ERROR=$(echo "$INPUT" | jq -r '.error // empty')
TOOL=$(echo "$INPUT" | jq -r '.tool_name')

if [ "$TOOL" = "Bash" ] && echo "$ERROR" | grep -q "test"; then
  # Slack webhook通知（実際のURLに変更）
  curl -s -X POST \
    -H 'Content-type: application/json' \
    --data "{\"text\":\"テスト失敗: $ERROR\"}" \
    "$SLACK_WEBHOOK_URL"
fi
```

#### PermissionRequest

権限ダイアログが表示される時に発火します。

**注意:** ノンインタラクティブモード（`-p`フラグ）では発火しません。自動的な権限判断には`PreToolUse`を使用してください。

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": {
    "command": "sudo apt-get install..."
  }
}
```

**構造化JSON出力:**
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow"
    }
  }
}
```

#### Notification

Claude Codeが通知を送る時に発火します。

**マッチャー値:**
- `permission_prompt`: 権限プロンプト
- `idle_prompt`: アイドル状態（入力待ち）
- `auth_success`: 認証成功
- `elicitation_dialog`: 確認ダイアログ

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "Notification",
  "notification_type": "idle_prompt",
  "message": "通知メッセージ"
}
```

#### Stop

Claudeが応答を終了した時に発火します。

**重要:** `Stop`フックはタスク完了時だけでなく、Claudeが応答を返す度に発火します。ユーザーによる中断時は発火しません。

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "Stop",
  "stop_hook_active": false
}
```

**`stop_hook_active`:** `true`の場合、Stop フックがすでにトリガーされていることを示します。無限ループを防ぐために確認が必要です。

**構造化JSON出力:**
```json
{
  "decision": "block",
  "reason": "テストがまだ実行されていません"
}
```

#### SubagentStart / SubagentStop

サブエージェントが起動・終了する時に発火します。

**マッチャー値:** エージェントタイプ（`Bash`, `Explore`, `Plan`, またはカスタムエージェント名）

**JSON入力スキーマ（SubagentStart）:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "SubagentStart",
  "agent_type": "Explore"
}
```

#### TeammateIdle

エージェントチームのメンバーがアイドル状態になる時に発火します。

#### TaskCompleted

タスクが完了済みとしてマークされる時に発火します。

#### ConfigChange

設定ファイルがセッション中に変更された時に発火します。

**マッチャー値:**
- `user_settings`
- `project_settings`
- `local_settings`
- `policy_settings`
- `skills`

**JSON入力スキーマ:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "ConfigChange",
  "source": "project_settings",
  "file_path": "/path/to/.claude/settings.json"
}
```

#### WorktreeCreate / WorktreeRemove

ワークツリーが作成・削除される時に発火します。デフォルトのgit動作を置き換えられます。

#### PreCompact

コンテキスト圧縮の前に発火します。

**マッチャー値:**
- `manual`: 手動で`/compact`を実行した場合
- `auto`: 自動的なコンパクション

### 設定スキーマ（完全版）

`settings.json`のフック設定の完全なスキーマです：

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "<regex-pattern>",
        "hooks": [
          {
            "type": "command",
            "command": "シェルコマンド",
            "timeout": 30,
            "run_in_background": false
          }
        ]
      }
    ]
  }
}
```

#### コマンドフックのフィールド

| フィールド | 型 | 説明 |
|-----------|---|------|
| `type` | string | `"command"`, `"http"`, `"prompt"`, `"agent"` |
| `command` | string | 実行するシェルコマンド |
| `timeout` | number | タイムアウト（秒）。デフォルト: 600秒（10分） |
| `run_in_background` | boolean | 非同期実行するか |

#### HTTPフックのフィールド

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/tool-use",
  "headers": {
    "Authorization": "Bearer $MY_TOKEN"
  },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30
}
```

HTTPフックはツール実行データをPOSTリクエストで送信します。レスポンスボディはコマンドフックと同じJSON形式で返します。

#### プロンプトフックのフィールド

```json
{
  "type": "prompt",
  "prompt": "判断に使うプロンプト。{\"ok\": false, \"reason\": \"理由\"}で拒否",
  "model": "claude-haiku-4-5",
  "timeout": 30
}
```

#### エージェントフックのフィールド

```json
{
  "type": "agent",
  "prompt": "検証内容の指示。$ARGUMENTSでフック入力を参照可能",
  "timeout": 60,
  "max_turns": 50
}
```

### 環境変数

フックで使用できる環境変数：

| 変数名 | 説明 |
|--------|------|
| `$CLAUDE_PROJECT_DIR` | プロジェクトのルートディレクトリ |
| `$CLAUDE_SESSION_ID` | 現在のセッションID |

**使用例:**
```bash
#!/bin/bash
# プロジェクトのlintスクリプトを実行
"$CLAUDE_PROJECT_DIR"/scripts/lint.sh
```

### 環境変数の永続化

`SessionStart`フックでの`export`は次のコマンドには引き継がれません。環境変数を永続化するには`CLAUDE_ENV_FILE`を使います：

```bash
# フック内で環境変数ファイルに書き込む
echo "MY_VAR=value" >> "$CLAUDE_ENV_FILE"
```

この変数はその後のコマンドやフックで利用できます。

### MCPツールフックのマッチング

MCPツールは`mcp__<server>__<tool>`という命名規則を使います：

| パターン例 | マッチする対象 |
|-----------|-------------|
| `mcp__.*` | すべてのMCPツール |
| `mcp__github__.*` | GitHubサーバーのすべてのツール |
| `mcp__github__create_issue` | GitHubのissue作成ツールのみ |
| `mcp__.*__write.*` | すべてのサーバーのwrite系ツール |

**例:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_name' | xargs -I{} echo \"GitHub MCP called: {}\" >> ~/mcp-log.txt"
          }
        ]
      }
    ]
  }
}
```

### 非同期フック

重い処理を非同期で実行するには`run_in_background: true`を使います：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs ./heavy-analysis.sh",
            "run_in_background": true
          }
        ]
      }
    ]
  }
}
```

非同期フックは：
- ツールの実行をブロックしない
- 出力（stdout/stderr）はClaudeに返されない
- 終了コードは無視される

### Skillsとエージェント内のフック

Skillのfrontmatterにフックを定義できます：

```yaml
---
name: code-review
description: Review code for quality and security issues
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: ./scripts/check-before-edit.sh
---

Code review instructions here...
```

このフックはスキルがアクティブな間のみ有効です。

### デバッグ方法

#### verboseモード

`Ctrl+O`でverboseモードをトグルすると、フックの出力がトランスクリプトに表示されます。

#### デバッグフラグ

```bash
claude --debug
```

このフラグを使うと：
- どのフックがマッチしたか表示
- 終了コードが表示
- フックコマンドの詳細ログが表示

#### 手動テスト

```bash
# サンプルJSONをパイプでフックスクリプトに渡してテスト
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
echo $?  # 終了コードを確認
```

#### 一般的なデバッグチェックリスト

1. **スクリプトが実行可能か確認**
   ```bash
   chmod +x ./my-hook.sh
   ```

2. **JSONが有効か確認**（trailing commaなどに注意）

3. **`jq`がインストールされているか確認**
   ```bash
   brew install jq  # macOS
   apt-get install jq  # Debian/Ubuntu
   ```

4. **絶対パスを使用する**（相対パスはcwdに依存するため）

5. **シェルプロファイルの`echo`文を確認**
   フックはノンインタラクティブシェルで実行されるため、`~/.zshrc`などの無条件の`echo`がJSON出力を汚染することがある

### セキュリティの考慮事項

フックはシェルコマンドを実行するため、セキュリティに注意が必要です：

1. **信頼できないフックを実行しない**: プロジェクトの`.claude/settings.json`にあるフックが悪意のある内容を含んでいないか確認する

2. **コマンドインジェクションを避ける**: フックに外部データを渡す際は適切にエスケープする

3. **最小権限の原則**: フックが必要な最小限の権限のみを持つようにする

4. **フックの出力を確認する**: 機密情報がログに残らないよう注意する

## まとめ

- 各フックイベントには固有のJSONスキーマと用途がある
- 終了コード0で続行、2でブロック、その他はログ記録のみ
- 構造化JSON出力でより細かい制御が可能（`allow`, `deny`, `ask`）
- `$CLAUDE_PROJECT_DIR`と`$CLAUDE_SESSION_ID`環境変数が使用可能
- MCPツールは`mcp__<server>__<tool>`パターンでマッチングできる
- `run_in_background: true`で非同期実行が可能
- `--debug`フラグと`Ctrl+O`でデバッグできる

## 公式リファレンス

- [Hooks reference](https://code.claude.com/docs/en/hooks)
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
- [Security considerations](https://code.claude.com/docs/en/hooks#security-considerations)
- [バリデーターの実装例](https://github.com/anthropics/claude-code/blob/main/examples/hooks/bash_command_validator_example.py)
