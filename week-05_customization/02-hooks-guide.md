# Hooksによる自動化 -- 決定論的ワークフローの構築

> **対応公式ドキュメント**: https://code.claude.com/docs/en/hooks-guide
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Hooksの概念を理解し、LLMへの指示との使い分けを判断できる
2. `/hooks`コマンドで対話的にフックを設定できる
3. コマンドフック・HTTPフック・プロンプトフック・エージェントフックの4タイプを使い分けられる
4. 実用的なフック（自動整形、ファイル保護、コンテキスト再注入、監査ログ）を構築できる

---

## 1. Hooksとは何か

Hooksは、Claude Codeのライフサイクルの特定ポイントで自動的に処理を実行する仕組みです。「Claudeがファイルを編集したら必ずPrettierで整形する」「保護ファイルへの書き込みをブロックする」「Claudeが待機状態になったらデスクトップ通知を送る」といった処理を、LLMの判断に頼らず確実に自動実行できます。

### なぜHooksが必要なのか

LLMに「ファイルを編集したらPrettierを実行して」と指示することもできますが、以下の問題があります：

- LLMが指示を忘れることがある
- コンテキストウィンドウを消費する
- 実行されるかどうかが確率的である

Hooksは**決定論的**です。設定したルールに従って**確実に**実行されます。これが最大の利点です。

### 4つのフックタイプ

| タイプ | 説明 | 使いどころ |
|-------|------|-----------|
| `command` | シェルコマンドを実行 | フォーマッタ実行、ファイル保護、ログ記録 |
| `http` | HTTPリクエストを送信 | Webhook通知、外部サービス連携 |
| `prompt` | 小型モデルで判断を実行 | タスク完了チェック、品質確認 |
| `agent` | マルチターンでツールを使いながら検証 | テスト実行と結果検証、複雑な品質チェック |

**使い分けの原則**: 確実に実行すべき機械的処理には`command`を、判断が必要な場合は`prompt`や`agent`を使います。

---

## 2. 最初のHookを設定する

最も簡単な方法は`/hooks`インタラクティブメニューです。デスクトップ通知を例に設定手順を説明します。

### ステップ1: フックメニューを開く

Claude Codeで`/hooks`と入力します。

### ステップ2: イベントを選択する

利用可能なフックイベントのリストが表示されます。`Notification`を選択します（Claudeが入力待ち状態になったときに発火）。

### ステップ3: マッチャーを設定する

`*`（すべての通知タイプ）を設定します。

### ステップ4: コマンドを追加する

OSに合わせてコマンドを設定します：

**macOS:**
```bash
osascript -e 'display notification "Claude Code needs your attention" with title "Claude Code"'
```

**Linux:**
```bash
notify-send 'Claude Code' 'Claude Code needs your attention'
```

### ステップ5: 保存場所を選択する

- **User settings** (`~/.claude/settings.json`): 全プロジェクトで有効
- **Project settings** (`.claude/settings.json`): このプロジェクトのみ

設定が保存されると、以後Claudeが通知を送るたびにデスクトップ通知が表示されます。

---

## 3. 実用的なフック例

### 例1: ファイル編集後の自動整形

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

**仕組みの解説:**
- `PostToolUse`イベント: ツールが正常に実行された後に発火
- `"Edit|Write"`マッチャー: EditまたはWriteツール使用時のみ実行（正規表現）
- フックはstdinでJSON入力を受け取る。`jq`でファイルパスを抽出し、Prettierに渡す

### 例2: 保護ファイルへの編集をブロック

`.env`や`package-lock.json`など、Claudeに触らせたくないファイルへの書き込みをブロックします。

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

**ポイント**: 終了コード`2`はアクションをブロックします。stderrに書いた内容がClaudeへのフィードバックになるため、Claudeは「なぜブロックされたか」を理解して別の方法を試みます。

### 例3: コンパクション後のコンテキスト再注入

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

`SessionStart`イベントの`compact`マッチャーは、`/compact`実行後のセッション再開時のみ発火します。直近のgitコミットを注入するのも効果的です：

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

### 例4: 設定変更の監査ログ

設定ファイルの変更を記録して追跡します：

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

---

## 4. HTTPフックと高度なフックタイプ

### HTTPフック

外部サービスにHTTPリクエストを送信するフックです。Slack webhook通知や監視サービスとの連携に使います：

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

`headers`内で`$VAR_NAME`形式で環境変数を参照できます。`allowedEnvVars`に列挙した環境変数のみが展開されます。

### プロンプトベースのフック

判断が必要な場合に、小型モデル（デフォルト: Haiku）に判断させます：

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

モデルがJSON形式で決定を返します：
- `{"ok": true}`: 処理を続行（Claudeは停止できる）
- `{"ok": false, "reason": "理由"}`: ブロックし、理由をClaudeへのフィードバックとして使用

### エージェントベースのフック

ファイルの検査やコマンド実行が必要な複雑な検証には`type: "agent"`を使います。エージェントはRead、Grep、Globなどのツールにアクセスでき、最大50ターンのマルチターン実行が可能です：

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

`$ARGUMENTS`でフック入力のJSON全体を参照できます。

---

## 5. マッチャーとフックの設定場所

### マッチャーの使い方

マッチャーは正規表現パターンで、フックの発火対象を絞り込みます：

| イベント | マッチ対象 | 例 |
|---------|-----------|-----|
| `PreToolUse`, `PostToolUse` | ツール名 | `Bash`, `Edit\|Write`, `mcp__.*` |
| `SessionStart` | 開始方法 | `startup`, `resume`, `clear`, `compact` |
| `Notification` | 通知タイプ | `permission_prompt`, `idle_prompt` |
| `SubagentStart/Stop` | エージェントタイプ | `Bash`, `Explore`, `Plan` |
| `ConfigChange` | 設定ソース | `user_settings`, `project_settings` |
| `PreCompact` | トリガー | `manual`, `auto` |

**注意**: マッチャーは大文字小文字を区別します。`bash`ではなく`Bash`と書く必要があります。

### フックの設定場所

| 場所 | スコープ | 共有可能か |
|------|---------|----------|
| `~/.claude/settings.json` | 全プロジェクト | いいえ（個人設定） |
| `.claude/settings.json` | 単一プロジェクト | はい（リポジトリに含めて共有） |
| `.claude/settings.local.json` | 単一プロジェクト | いいえ（gitignore対象） |
| 管理ポリシー設定 | 組織全体 | はい（管理者が制御） |
| プラグインの`hooks/hooks.json` | プラグイン有効時 | はい（プラグインに含める） |
| Skill/Agentのfrontmatter | スキル有効時 | はい（コンポーネントに定義） |

---

## ハンズオン演習

### 演習 1: 通知フックの設定

**目的**: `/hooks`コマンドで通知フックを設定する
**前提条件**: Claude Codeがインストール済みであること

**手順**:
1. Claude Codeで`/hooks`と入力する
2. `Notification`イベントを選択する
3. マッチャーに`*`を設定する
4. macOSの場合、以下のコマンドを設定する：
   ```bash
   osascript -e 'display notification "Claude needs attention" with title "Claude Code"'
   ```
5. User settingsに保存する
6. Claudeに長い作業を依頼して、完了時に通知が来ることを確認する

**期待される結果**: Claudeが入力待ち状態になるとデスクトップ通知が表示される

### 演習 2: ファイル保護フックの作成

**目的**: PreToolUseフックで特定ファイルの編集をブロックする
**前提条件**: プロジェクトディレクトリに`.env`ファイルが存在すること

**手順**:
1. `.claude/hooks/`ディレクトリを作成する
   ```bash
   mkdir -p .claude/hooks
   ```
2. 上記の例3「保護ファイルへの編集をブロック」のスクリプトを作成する
3. 実行権限を付与する
4. `.claude/settings.json`にフックを登録する
5. Claudeに「`.env`ファイルにDB_URLを追加して」と依頼する

**期待される結果**: Claudeが`.env`の編集をブロックされ、「保護されたファイルです」というフィードバックを受けて別の方法を提案する

### 演習 3: 自動整形フックの作成

**目的**: PostToolUseフックでファイル編集後にPrettierを自動実行する
**前提条件**: `prettier`がインストール済み、`.prettierrc`が設定済みであること

**手順**:
1. `~/.claude/settings.json`に以下を追加する：
   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Edit|Write",
           "hooks": [
             {
               "type": "command",
               "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write 2>/dev/null || true"
             }
           ]
         }
       ]
     }
   }
   ```
2. Claudeにファイルの編集を依頼する
3. 編集後のファイルがPrettierのフォーマットルールに従っていることを確認する

**期待される結果**: Claudeが編集したファイルが自動的にPrettierで整形される

---

## よくある質問

**Q: フックが発火しません。何を確認すべきですか?**
A: 以下の順序で確認してください。(1) `/hooks`でフックが正しいイベントに登録されているか。(2) マッチャーがツール名と一致しているか（大文字小文字に注意）。(3) スクリプトに実行権限があるか（`chmod +x`）。(4) `claude --debug`でデバッグ情報を確認する。

**Q: Stopフックが無限ループしています。どうすればよいですか?**
A: `stop_hook_active`フィールドをチェックしてください。`true`の場合はフックが既にトリガーされているため、`exit 0`で処理を終了させます：
```bash
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi
```

**Q: JSONバリデーションエラーが出ます。**
A: `~/.zshrc`や`~/.bashrc`の無条件の`echo`文が原因のことがあります。フックはノンインタラクティブシェルで実行されるため、シェルプロファイルの出力がJSON出力を汚染します。インタラクティブシェルでのみ実行するよう修正してください：
```bash
if [[ $- == *i* ]]; then
  echo "Shell ready"
fi
```

**Q: コマンドフックとプロンプトフックはどう使い分けますか?**
A: 機械的に判断できる処理（パターンマッチ、コマンド実行）にはコマンドフックを、コンテキストに応じた判断が必要な処理（タスク完了の確認、コード品質の評価）にはプロンプトフックを使います。

**Q: 非同期フック（`async: true`）はどのような場面で使いますか?**
A: ログ記録や通知など、結果をClaudeに返す必要がない処理に使います。非同期フックはツールの実行をブロックせず、stdout/stderrはClaudeに返されず、終了コードも無視されます。

---

## まとめ

この章で学んだ重要ポイント：

- Hooksは決定論的にシェルコマンドやHTTPリクエストを自動実行する仕組み
- `/hooks`コマンドで対話的に設定でき、JSONで直接記述も可能
- 4つのタイプ: `command`（シェル）、`http`（HTTP）、`prompt`（判断）、`agent`（マルチターン検証）
- 終了コード0で続行、2でブロック（stderrがClaudeへのフィードバックになる）
- マッチャーは正規表現パターンでフック発火対象を絞り込む（大文字小文字区別あり）
- 設定場所（個人・プロジェクト・ローカル・管理者・プラグイン・Skill内）でスコープが決まる
- `stop_hook_active`チェックでStopフックの無限ループを防止する

## 次のステップ

次の章「Hooks詳細リファレンス」では、全フックイベントの入出力スキーマ、PreToolUseの決定制御、環境変数の永続化など、フックの技術仕様を詳しく解説します。

---

> **公式リファレンス**
> - [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)
> - [Hooks reference](https://code.claude.com/docs/en/hooks)
> - [jq ダウンロード](https://jqlang.github.io/jq/download/)
