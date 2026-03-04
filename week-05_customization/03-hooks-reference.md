# Hooks詳細リファレンス -- 全イベント・スキーマ・制御フロー

> **対応公式ドキュメント**: https://code.claude.com/docs/en/hooks
> **想定所要時間**: 約60分
> **難易度**: ★★★★☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. 全17種類のフックイベントの役割と入出力スキーマを理解できる
2. PreToolUseの決定制御（`permissionDecision`）でツール呼び出しを細かく制御できる
3. 終了コードとJSON出力フィールドの関係を正確に把握できる
4. 環境変数の永続化（`CLAUDE_ENV_FILE`）や非同期フック（`async: true`）を活用できる

---

## 1. フックイベント全リスト

Claude Codeのアジェンティックループにおけるフックの実行ポイントを一覧で示します。

### ライフサイクルフロー

```
セッション開始
    | SessionStart (startup / resume / clear / compact)
    v
ユーザープロンプト入力
    | UserPromptSubmit
    v
ツール使用の判断
    | PreToolUse（ブロック可能）
    | PermissionRequest（権限ダイアログ時）
    v
ツール実行
    | PostToolUse / PostToolUseFailure
    v
サブエージェント起動/終了
    | SubagentStart / SubagentStop
    v
応答完了
    | Stop
    | TaskCompleted
    v
コンテキスト圧縮
    | PreCompact
    v
セッション終了
    | SessionEnd
```

### 全イベント一覧

| イベント | 発火タイミング | ブロック可能 |
|---------|-------------|:----------:|
| `SessionStart` | セッション開始・再開・clear・compact後 | -- |
| `UserPromptSubmit` | プロンプト送信時（Claude処理前） | はい |
| `PreToolUse` | ツール実行前 | はい |
| `PermissionRequest` | 権限ダイアログ表示時 | はい |
| `PostToolUse` | ツール実行成功後 | -- |
| `PostToolUseFailure` | ツール実行失敗後 | -- |
| `Notification` | 通知発生時 | -- |
| `SubagentStart` | サブエージェント起動時 | -- |
| `SubagentStop` | サブエージェント終了時 | -- |
| `Stop` | Claudeの応答完了時 | はい |
| `TeammateIdle` | チームメンバーがアイドル状態になる時 | -- |
| `TaskCompleted` | タスク完了マーク時 | -- |
| `ConfigChange` | 設定ファイル変更時 | -- |
| `WorktreeCreate` | ワークツリー作成時 | -- |
| `WorktreeRemove` | ワークツリー削除時 | -- |
| `PreCompact` | コンテキスト圧縮前 | -- |
| `SessionEnd` | セッション終了時 | -- |

---

## 2. 設定スキーマ

### フックの配置場所

| 場所 | ファイル | 用途 |
|------|--------|------|
| ユーザー設定 | `~/.claude/settings.json` | 個人の全プロジェクト共通フック |
| プロジェクト設定 | `.claude/settings.json` | チーム共有フック |
| ローカル設定 | `.claude/settings.local.json` | 個人のプロジェクト固有フック |
| 管理ポリシー | Managed policy | 組織全体の強制フック |
| プラグイン | `<plugin>/hooks/hooks.json` | プラグイン付属フック |
| Skill/Agent | Frontmatterの`hooks`フィールド | Skill有効時のみのフック |

### 設定の基本構造

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
            "statusMessage": "処理中...",
            "once": false
          }
        ]
      }
    ]
  }
}
```

### 共通フィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|---|:----:|------|
| `type` | string | はい | `"command"`, `"http"`, `"prompt"`, `"agent"` |
| `timeout` | number | いいえ | タイムアウト（秒）。デフォルト: 600秒 |
| `statusMessage` | string | いいえ | 実行中に表示するメッセージ |
| `once` | boolean | いいえ | `true`の場合、セッション中に一度だけ実行 |

### タイプ別フィールド

**Command hook:**

| フィールド | 型 | 説明 |
|-----------|---|------|
| `command` | string | 実行するシェルコマンド |
| `async` | boolean | `true`で非同期実行（結果を待たない） |

**HTTP hook:**

| フィールド | 型 | 説明 |
|-----------|---|------|
| `url` | string | リクエスト送信先URL |
| `headers` | object | HTTPヘッダー（`$VAR_NAME`で環境変数展開） |
| `allowedEnvVars` | string[] | headers内で展開を許可する環境変数リスト |

**Prompt hook:**

| フィールド | 型 | 説明 |
|-----------|---|------|
| `prompt` | string | 判断に使うプロンプト。`$ARGUMENTS`で入力JSON参照 |
| `model` | string | 使用モデル（デフォルト: Haiku） |

**Agent hook:**

| フィールド | 型 | 説明 |
|-----------|---|------|
| `prompt` | string | 検証指示。`$ARGUMENTS`で入力JSON参照 |
| `model` | string | 使用モデル |
| `max_turns` | number | 最大ターン数（デフォルト: 50） |

---

## 3. 終了コードと出力制御

### 終了コードの意味

| 終了コード | 意味 |
|-----------|------|
| `0` | 処理を続行。stdoutの内容はClaudeのコンテキストに追加される |
| `2` | アクションをブロック。stderrの内容がClaudeへのフィードバックになる |
| その他 | 処理を続行。stderrはログに記録されるが、Claudeには返されない |

### 終了コード2の挙動（イベント別）

終了コード2でブロック可能かどうかはイベントによって異なります：

| イベント | 終了コード2の挙動 |
|---------|-----------------|
| `UserPromptSubmit` | プロンプト処理をブロック |
| `PreToolUse` | ツール呼び出しをブロック |
| `PermissionRequest` | 権限リクエストを拒否 |
| `Stop` | Claudeの停止をブロック（作業を続行させる） |
| `PostToolUse` | ブロック不可（ツールは既に実行済み） |
| `SessionStart` | ブロック不可 |
| `Notification` | ブロック不可 |

### JSON出力フィールド

終了コード0で構造化JSONをstdoutに出力すると、より詳細な制御が可能です：

| フィールド | 型 | 説明 |
|-----------|---|------|
| `continue` | boolean | `false`でClaudeの処理を中断 |
| `stopReason` | string | 中断理由 |
| `suppressOutput` | boolean | `true`でstdoutをClaudeに渡さない |
| `systemMessage` | string | システムメッセージとして注入 |

---

## 4. PreToolUseの入力と決定制御

PreToolUseはフックの中で最も細かい制御が可能なイベントです。ツール呼び出しの前にJSON入力を検査し、許可・拒否・変更を行えます。

### ツール別入力スキーマ

各ツールの`tool_input`に含まれるフィールド：

| ツール | フィールド |
|--------|---------|
| `Bash` | `command`, `description` |
| `Write` | `file_path`, `content` |
| `Edit` | `file_path`, `old_string`, `new_string` |
| `Read` | `file_path` |
| `Glob` | `pattern` |
| `Grep` | `pattern` |
| `WebFetch` | `url` |
| `WebSearch` | `query` |
| `Agent` | `prompt`, `description` |

**入力例（Bash）:**
```json
{
  "session_id": "abc123",
  "cwd": "/Users/user/myproject",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /important",
    "description": "Delete old files"
  }
}
```

### PreToolUse決定制御

構造化JSON出力で、ツール呼び出しの決定を制御できます：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use rg instead of grep for better performance"
  }
}
```

**`permissionDecision`の値:**

| 値 | 説明 |
|----|------|
| `"allow"` | 権限プロンプトなしで即座に許可 |
| `"deny"` | ツール呼び出しをキャンセルし、理由をClaudeに返す |
| `"ask"` | 通常通り権限プロンプトを表示 |

**追加の制御フィールド:**

| フィールド | 型 | 説明 |
|-----------|---|------|
| `updatedInput` | object | ツール入力を書き換える（例: コマンドの変更） |
| `additionalContext` | string | Claudeに追加コンテキストを注入する |

**例: grepをrgに書き換える**

```bash
#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ "$TOOL" = "Bash" ] && echo "$COMMAND" | grep -q "^grep "; then
  NEW_CMD=$(echo "$COMMAND" | sed 's/^grep /rg /')
  jq -n --arg cmd "$NEW_CMD" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      updatedInput: { command: $cmd },
      additionalContext: "grep was replaced with rg for better performance"
    }
  }'
  exit 0
fi

exit 0
```

### PermissionRequest決定制御

PermissionRequestフックでは、権限ダイアログの動作を制御できます：

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

| `behavior` | 説明 |
|-----------|------|
| `"allow"` | 自動的に許可 |
| `"deny"` | 自動的に拒否 |

追加フィールド: `updatedInput`（入力変更）、`updatedPermissions`（権限変更）

> **注意**: PermissionRequestはノンインタラクティブモード（`-p`フラグ）では発火しません。自動的な権限判断には`PreToolUse`を使用してください。

---

## 5. 特殊なイベントと高度な機能

### SessionStartとマッチャー

SessionStartの`source`フィールドがマッチャーの対象です：

| マッチャー | 発火タイミング |
|-----------|-------------|
| `startup` | 新規セッション開始 |
| `resume` | 既存セッションの再開（`claude --resume`） |
| `clear` | `/clear`実行後 |
| `compact` | `/compact`またはauto compact後 |

### 環境変数の永続化

フック内での`export`は次のコマンドには引き継がれません。環境変数をセッション中永続化するには`CLAUDE_ENV_FILE`を使います：

```bash
#!/bin/bash
# SessionStartフック内で環境変数を永続化
echo "MY_VAR=value" >> "$CLAUDE_ENV_FILE"
echo "PROJECT_ENV=production" >> "$CLAUDE_ENV_FILE"
```

この変数はその後のすべてのコマンドとフックで利用できます。

### フック内で使用できる環境変数

| 変数名 | 説明 |
|--------|------|
| `$CLAUDE_PROJECT_DIR` | プロジェクトのルートディレクトリ |
| `$CLAUDE_SESSION_ID` | 現在のセッションID |
| `$CLAUDE_ENV_FILE` | 環境変数永続化用ファイルパス |

### Stopフック

Stopフックは、Claudeが応答を完了した時に発火します。重要な注意点があります：

- ユーザーによる中断時は発火しない
- `stop_hook_active`が`true`の場合、Stopフックが既にトリガーされている
- 無限ループ防止のため、`stop_hook_active`チェックが必須

```json
{
  "session_id": "abc123",
  "hook_event_name": "Stop",
  "stop_hook_active": false,
  "last_assistant_message": "タスクが完了しました。"
}
```

### 非同期フック

`async: true`を設定すると、フックがバックグラウンドで実行されます：

```json
{
  "type": "command",
  "command": "jq -r '.tool_input.file_path' | xargs ./heavy-analysis.sh",
  "async": true
}
```

非同期フックの特性：
- ツールの実行をブロックしない
- stdoutとstderrはClaudeに返されない
- 終了コードは無視される
- ログ記録、通知送信、バックグラウンド分析に適している

---

## ハンズオン演習

### 演習 1: PreToolUse決定制御フック

**目的**: PreToolUseのJSON出力で危険なコマンドをブロックする
**前提条件**: `jq`がインストール済みであること

**手順**:
1. `.claude/hooks/block-dangerous.sh`を作成する：
   ```bash
   #!/bin/bash
   INPUT=$(cat)
   TOOL=$(echo "$INPUT" | jq -r '.tool_name')
   COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

   if [ "$TOOL" = "Bash" ]; then
     if echo "$COMMAND" | grep -qE "rm -rf /|sudo rm|dd if="; then
       jq -n '{
         hookSpecificOutput: {
           hookEventName: "PreToolUse",
           permissionDecision: "deny",
           permissionDecisionReason: "Dangerous command blocked by safety hook"
         }
       }'
       exit 0
     fi
   fi
   exit 0
   ```
2. `chmod +x .claude/hooks/block-dangerous.sh`
3. `.claude/settings.json`に登録する
4. Claudeに`rm -rf /tmp/important`を含むコマンドの実行を依頼する

**期待される結果**: コマンドがブロックされ、Claudeが安全な代替案を提案する

### 演習 2: Stopフックでのタスク完了チェック

**目的**: プロンプトフックでClaudeの応答完了時にタスク完了を検証する
**前提条件**: なし

**手順**:
1. `~/.claude/settings.json`に以下を追加する：
   ```json
   {
     "hooks": {
       "Stop": [
         {
           "hooks": [
             {
               "type": "prompt",
               "prompt": "Check if the assistant's last response indicates all requested tasks are complete. If tasks remain incomplete, respond with {\"ok\": false, \"reason\": \"description of remaining tasks\"}. If complete, respond with {\"ok\": true}."
             }
           ]
         }
       ]
     }
   }
   ```
2. Claudeに複数ステップの作業（例: 「ファイルを作成し、テストを書き、lintを実行して」）を依頼する
3. Claudeが途中で止まった場合にフックが作業を再開させることを確認する

**期待される結果**: Claudeが全タスクを完了するまで停止しない

### 演習 3: SessionStart環境変数の永続化

**目的**: CLAUDE_ENV_FILEを使ってセッション中の環境変数を永続化する
**前提条件**: なし

**手順**:
1. `.claude/settings.json`に以下を追加する：
   ```json
   {
     "hooks": {
       "SessionStart": [
         {
           "matcher": "startup",
           "hooks": [
             {
               "type": "command",
               "command": "echo \"SESSION_START_TIME=$(date +%Y-%m-%dT%H:%M:%S)\" >> \"$CLAUDE_ENV_FILE\""
             }
           ]
         }
       ]
     }
   }
   ```
2. Claude Codeを起動する
3. Claudeに`echo $SESSION_START_TIME`を実行させる

**期待される結果**: セッション開始時刻が環境変数として保持され、以降のコマンドで参照できる

---

## よくある質問

**Q: PreToolUseとPermissionRequestの違いは何ですか?**
A: PreToolUseはすべてのツール呼び出しの前に発火し、インタラクティブ/ノンインタラクティブの両方で動作します。PermissionRequestはインタラクティブモードで権限ダイアログが表示される時のみ発火します。自動化には`PreToolUse`を使うのが推奨です。

**Q: `once: true`はどのような場面で使いますか?**
A: セッション中に一度だけ実行すればよいフック（初期化処理、ウェルカムメッセージなど）に使います。`once: true`を設定すると、同じセッション内で2回目以降は発火しません。

**Q: MCPツールのフックマッチングはどうなりますか?**
A: MCPツールは`mcp__<server>__<tool>`という命名規則です。`mcp__.*`で全MCPツール、`mcp__github__.*`でGitHubサーバーの全ツール、`mcp__github__create_issue`で特定ツールのみマッチします。

**Q: フックのタイムアウトを変更できますか?**
A: はい。`timeout`フィールドで秒単位で指定できます。デフォルトは600秒（10分）です。短いタイムアウトを設定するとフックの応答性が向上しますが、重い処理では切り詰められる可能性があります。

---

## まとめ

この章で学んだ重要ポイント：

- 全17種類のフックイベントがClaude Codeのライフサイクル全体をカバー
- 4つのフックタイプ: command、http、prompt、agent
- 配置場所は6箇所（ユーザー設定、プロジェクト設定、ローカル、管理ポリシー、プラグイン、Skill内）
- 終了コード0で続行、2でブロック。JSON出力でさらに細かい制御が可能
- PreToolUseの`permissionDecision`でallow/deny/askを制御し、`updatedInput`で入力を書き換え可能
- PermissionRequestの`behavior`でallow/denyを制御
- SessionStartの`compact`マッチャーでコンパクション後のコンテキスト再注入が可能
- `CLAUDE_ENV_FILE`で環境変数をセッション中永続化できる
- `async: true`でバックグラウンド実行が可能

## 次のステップ

次の章「プラグインシステム概要」では、Skills・Hooks・MCPサーバーをパッケージ化して配布するプラグインの仕組みを学びます。

---

> **公式リファレンス**
> - [Hooks reference](https://code.claude.com/docs/en/hooks)
> - [Hooks guide](https://code.claude.com/docs/en/hooks-guide)
> - [Security considerations](https://code.claude.com/docs/en/security)
