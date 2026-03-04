# プラグイン開発方法 -- 段階的にプラグインを構築する

> **対応公式ドキュメント**: https://code.claude.com/docs/en/plugins
> **想定所要時間**: 約60分
> **難易度**: ★★★★☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. プラグインを最小構成（`plugin.json` + `SKILL.md`）でクイックスタートできる
2. Skills・エージェント・Hooks・MCPサーバー・LSPサーバーを含む多機能プラグインを構築できる
3. `--plugin-dir`フラグでインストールせずにローカルテストできる
4. スタンドアロン設定からプラグインへスムーズに移行できる

---

## 1. クイックスタート -- 最小プラグインの作成

最も簡単なプラグインは、マニフェストとSkill1つだけで構成されます。

### ステップ1: プラグインディレクトリを作成する

```bash
mkdir -p my-first-plugin/.claude-plugin
mkdir -p my-first-plugin/skills/hello
```

### ステップ2: マニフェストを作成する

`my-first-plugin/.claude-plugin/plugin.json`:

```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

`plugin.json`の必須フィールドは`name`のみです。`name`はkebab-case（ハイフン区切り小文字）で記述します。この名前がSkillの名前空間プレフィックスになります。

### ステップ3: Skillを追加する

`my-first-plugin/skills/hello/SKILL.md`:

```yaml
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.

If $ARGUMENTS is provided, personalize the greeting for that name.
```

### ステップ4: ローカルでテストする

```bash
claude --plugin-dir ./my-first-plugin
```

起動後、スキルを呼び出します：

```
/my-first-plugin:hello
/my-first-plugin:hello Alex
```

`/help`でスキルが一覧に表示されることを確認できます。

**複数プラグインを同時にテスト:**

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

---

## 2. プラグインに機能を追加する

### エージェントの追加

`agents/`ディレクトリにMarkdownファイルを配置します：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── agents/
    └── security-reviewer.md
```

`agents/security-reviewer.md`:

```yaml
---
name: security-reviewer
description: Reviews code for security vulnerabilities. Use when asked to check code for security issues.
---

You are a security expert specializing in application security. When reviewing code:

1. Check for OWASP Top 10 vulnerabilities
2. Look for SQL injection, XSS, CSRF vulnerabilities
3. Check for insecure direct object references
4. Review authentication and authorization logic
5. Identify hardcoded secrets or credentials

Provide specific file locations and line numbers for each issue found.
Suggest concrete fixes for each vulnerability.
```

### Hooksの追加

`hooks/hooks.json`にフック設定を記述します：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   └── hooks.json
└── scripts/
    └── format-code.sh
```

`hooks/hooks.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ]
  }
}
```

`scripts/format-code.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# ファイル拡張子に基づいてフォーマット
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
  *.py)
    black "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
```

```bash
chmod +x my-plugin/scripts/format-code.sh
```

**重要:** `${CLAUDE_PLUGIN_ROOT}`を使ってプラグインルートへの絶対パスを参照します。プラグインがどこにインストールされても正しいパスが解決されます。

### MCPサーバーの追加

`.mcp.json`でMCPサーバーを定義します。プラグインのルートに配置します：

`.mcp.json`:

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_URL": "${DB_URL}"
      }
    }
  }
}
```

`plugin.json`にインライン記述することも可能です：

```json
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

プラグインのMCPサーバーはプラグイン有効化時に自動的に起動します。

### LSPサーバーの追加

`.lsp.json`でLanguage Server Protocolサーバーを設定します：

```json
{
  "mylang": {
    "command": "mylang-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ml": "mylang",
      ".mli": "mylang"
    }
  }
}
```

**LSP設定フィールド:**

| フィールド | 必須 | 説明 |
|-----------|:----:|------|
| `command` | はい | LSPバイナリのコマンド |
| `extensionToLanguage` | はい | ファイル拡張子と言語IDのマッピング |
| `args` | いいえ | コマンドライン引数 |
| `transport` | いいえ | `stdio`（デフォルト）または`socket` |
| `env` | いいえ | 環境変数 |
| `initializationOptions` | いいえ | 初期化オプション |
| `settings` | いいえ | ワークスペース設定 |
| `startupTimeout` | いいえ | 起動タイムアウト（ミリ秒） |
| `restartOnCrash` | いいえ | クラッシュ時に自動再起動するか |
| `maxRestarts` | いいえ | 最大再起動回数 |

> **重要**: LSPプラグインはサーバー設定のみを提供します。言語サーバーバイナリ自体はユーザーが別途インストールする必要があります。

---

## 3. 完全なプラグイン構造

すべてのコンポーネントを含む完全なプラグインの構造例：

```text
enterprise-toolkit/
├── .claude-plugin/           # メタデータ
│   └── plugin.json
├── commands/                 # レガシーコマンド形式
│   ├── status.md
│   └── logs.md
├── agents/                   # カスタムエージェント
│   ├── security-reviewer.md
│   └── performance-tester.md
├── skills/                   # Skillsディレクトリ
│   ├── code-review/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── hooks/                    # フック設定
│   └── hooks.json
├── settings.json             # デフォルト設定
├── .mcp.json                 # MCPサーバー設定
├── .lsp.json                 # LSPサーバー設定
├── scripts/                  # スクリプト
│   └── deploy.sh
├── LICENSE
└── README.md
```

### デフォルト設定（settings.json）

プラグインの`settings.json`で、プラグイン有効化時のデフォルト設定を指定できます：

```json
{
  "agent": "security-reviewer"
}
```

現在は`agent`キーのみサポートされています。プラグインの`agents/`ディレクトリにあるカスタムエージェントをメインスレッドとして有効化できます。

---

## 4. スタンドアロン設定からの移行

既存の`.claude/`設定をプラグインに変換する手順です。

### ステップ1: プラグイン構造を作成する

```bash
mkdir -p my-plugin/.claude-plugin

cat > my-plugin/.claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin",
  "description": "Migrated from standalone configuration",
  "version": "1.0.0"
}
EOF
```

### ステップ2: 既存ファイルをコピーする

```bash
# コマンド（Skills）をコピー
cp -r .claude/commands my-plugin/ 2>/dev/null

# エージェントをコピー
cp -r .claude/agents my-plugin/ 2>/dev/null

# Skillsをコピー
cp -r .claude/skills my-plugin/ 2>/dev/null
```

### ステップ3: フックを移行する

`.claude/settings.json`のhooksセクションを`my-plugin/hooks/hooks.json`に移動します：

```bash
mkdir -p my-plugin/hooks
```

`my-plugin/hooks/hooks.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

**注意:** パス参照を`$CLAUDE_PROJECT_DIR`から`${CLAUDE_PLUGIN_ROOT}`に変更してください。

### ステップ4: テストする

```bash
claude --plugin-dir ./my-plugin
```

### 移行による変更点

| 項目 | スタンドアロン | プラグイン |
|------|-------------|---------|
| 適用範囲 | 単一プロジェクトのみ | マーケットプレイスで共有可能 |
| Skillの呼び出し | `/skill-name` | `/plugin-name:skill-name` |
| Hooks設定 | `settings.json`内 | `hooks/hooks.json` |
| 配布方法 | 手動コピー | `/plugin install` |
| パス参照 | `$CLAUDE_PROJECT_DIR` | `${CLAUDE_PLUGIN_ROOT}` |

移行後は`.claude/`の元ファイルを削除することで重複を避けられます。

---

## 5. テストとデバッグ

### ローカルテスト

開発中のプラグインはインストールせずにテストできます：

```bash
# 単一プラグインをテスト
claude --plugin-dir ./my-plugin

# 複数プラグインを同時テスト
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two

# デバッグモードでテスト
claude --debug --plugin-dir ./my-plugin
```

`--debug`モードで表示される情報：
- どのプラグインがロードされているか
- マニフェストのエラー
- コマンド・エージェント・フックの登録状況
- MCPサーバーの初期化状態

Claude Code内では`/debug`コマンドでもデバッグ情報を確認できます。

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|-----|------|-------|
| プラグインがロードされない | `plugin.json`が無効 | JSONの構文を確認、`name`フィールドの存在を確認 |
| コマンドが表示されない | ファイルが`.claude-plugin/`内にある | `commands/`、`skills/`をプラグインルートに移動 |
| Hooksが発火しない | スクリプトに実行権限がない | `chmod +x script.sh` |
| MCPサーバーが起動しない | パスが正しくない | `${CLAUDE_PLUGIN_ROOT}`を使用 |
| LSPエラー `Executable not found` | 言語サーバーが未インストール | 対応するバイナリをインストール |

### エラーメッセージの例と対処

```text
# マニフェストのJSONエラー
Invalid JSON syntax: Unexpected token } in JSON at position 142
→ JSONの構文を修正（trailing commaなど）

# 必須フィールドがない
Plugin has an invalid manifest file at .claude-plugin/plugin.json.
Validation errors: name: Required
→ plugin.jsonにnameフィールドを追加

# コンポーネントディレクトリが見つからない
Warning: No commands found in plugin my-plugin custom directory: ./cmds.
Expected .md files or SKILL.md in subdirectories.
→ ディレクトリ名をcommands/に修正
```

---

## ハンズオン演習

### 演習 1: 最小プラグインの作成

**目的**: plugin.jsonとSkillだけの最小プラグインを作成し、ローカルテストする
**前提条件**: Claude Codeがインストール済みであること

**手順**:
1. プラグインディレクトリを作成する
   ```bash
   mkdir -p ~/my-test-plugin/.claude-plugin
   mkdir -p ~/my-test-plugin/skills/greet
   ```
2. `plugin.json`を作成する
   ```json
   {
     "name": "my-test-plugin",
     "version": "0.1.0",
     "description": "My first plugin"
   }
   ```
3. `skills/greet/SKILL.md`を作成する
   ```yaml
   ---
   description: Greet with a custom message
   disable-model-invocation: true
   argument-hint: [name]
   ---

   Greet $ARGUMENTS with enthusiasm and offer 3 ways you can help.
   ```
4. ローカルテストする
   ```bash
   claude --plugin-dir ~/my-test-plugin
   ```
5. `/my-test-plugin:greet World`を実行する

**期待される結果**: プラグインのSkillが正常に呼び出され、カスタムメッセージが表示される

### 演習 2: Hooksを含むプラグイン

**目的**: ファイル編集後に自動整形するHooksを含むプラグインを作成する
**前提条件**: 演習1が完了、`prettier`がインストール済み

**手順**:
1. 演習1のプラグインに`hooks/`と`scripts/`を追加する
   ```bash
   mkdir -p ~/my-test-plugin/hooks
   mkdir -p ~/my-test-plugin/scripts
   ```
2. `hooks/hooks.json`を作成する
   ```json
   {
     "hooks": {
       "PostToolUse": [
         {
           "matcher": "Write|Edit",
           "hooks": [
             {
               "type": "command",
               "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
             }
           ]
         }
       ]
     }
   }
   ```
3. `scripts/format.sh`を作成する
   ```bash
   #!/bin/bash
   INPUT=$(cat)
   FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
   [ -z "$FILE_PATH" ] && exit 0
   npx prettier --write "$FILE_PATH" 2>/dev/null || true
   exit 0
   ```
4. 実行権限を付与する
   ```bash
   chmod +x ~/my-test-plugin/scripts/format.sh
   ```
5. `--debug`付きでテストする
   ```bash
   claude --debug --plugin-dir ~/my-test-plugin
   ```

**期待される結果**: Claudeがファイルを編集した後に自動的にPrettierが実行される

### 演習 3: スタンドアロン設定からの移行

**目的**: 既存の`.claude/`設定をプラグインに移行する
**前提条件**: `.claude/`にSkillsやHooksが設定済みのプロジェクトがあること

**手順**:
1. プラグイン構造を作成する
2. 上記セクション4の手順に従い、Skills・エージェント・Hooksをコピーする
3. パス参照を`${CLAUDE_PLUGIN_ROOT}`に変更する
4. `--plugin-dir`でローカルテストする
5. 元のスタンドアロン設定と同じ動作を確認する

**期待される結果**: プラグイン化後も同じ機能が正常に動作する

---

## よくある質問

**Q: plugin.jsonの`name`フィールドに使える文字は?**
A: kebab-case（小文字とハイフン）です。例: `my-plugin`、`code-formatter`。大文字、アンダースコア、スペースは使えません。

**Q: `${CLAUDE_PLUGIN_ROOT}`と`$CLAUDE_PROJECT_DIR`の違いは?**
A: `${CLAUDE_PLUGIN_ROOT}`はプラグインのインストールディレクトリ、`$CLAUDE_PROJECT_DIR`はユーザーが作業しているプロジェクトのルートディレクトリです。プラグイン内のスクリプトを参照する場合は`${CLAUDE_PLUGIN_ROOT}`を使います。

**Q: プラグインの開発中に変更を反映するには?**
A: `--plugin-dir`でローカルテストしている場合、Claude Codeを再起動すると最新のファイルが読み込まれます。ホットリロードはサポートされていません。

**Q: プラグインをマーケットプレイスで公開するにはどうすればよいですか?**
A: 公式マーケットプレイスへの提出フォームがあります。Claude.aiの場合は`claude.ai/settings/plugins/submit`、Consoleの場合は`platform.claude.com/plugins/submit`から提出できます。

**Q: バージョン管理はどのように行いますか?**
A: セマンティックバージョニング（MAJOR.MINOR.PATCH）に従います。破壊的変更はMAJOR、機能追加はMINOR、バグ修正はPATCHを上げます。

---

## まとめ

この章で学んだ重要ポイント：

- プラグインの最小構成は`.claude-plugin/plugin.json`と1つの`SKILL.md`
- `plugin.json`の必須フィールドは`name`のみ（kebab-case）
- Skills・エージェント・Hooks・MCPサーバー・LSPサーバーを段階的に追加できる
- `${CLAUDE_PLUGIN_ROOT}`でプラグインルートへの絶対パスを参照する
- `--plugin-dir`フラグでインストールせずにローカルテストできる
- `claude --debug`でプラグイン読み込みの詳細を確認できる
- スタンドアロン設定からプラグインへの移行は、ファイルのコピーとパス参照の変更で完了
- マーケットプレイスへの提出は専用フォームから

## 次のステップ

次の章「マーケットプレイス活用」では、プラグインの検索・インストール、独自マーケットプレイスの作成、チームへの配布方法を学びます。

---

> **公式リファレンス**
> - [Create plugins](https://code.claude.com/docs/en/plugins)
> - [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
> - [Skills](https://code.claude.com/docs/en/skills)
> - [Hooks](https://code.claude.com/docs/en/hooks)
> - [MCP](https://code.claude.com/docs/en/mcp)
