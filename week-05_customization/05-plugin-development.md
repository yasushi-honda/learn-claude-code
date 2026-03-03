# Lesson 5: プラグイン開発方法

> 対応する公式ドキュメント: [Create plugins](https://code.claude.com/docs/en/plugins) | [Plugins reference](https://code.claude.com/docs/en/plugins-reference)

## 学習目標

- プラグインのディレクトリ構造とマニフェストを正確に作成できる
- Skills・エージェント・Hooks・MCPサーバーを含むプラグインを作れる
- `--plugin-dir`フラグでローカルにプラグインをテストできる
- スタンドアロン設定からプラグインへ移行できる
- LSPサーバーを含むプラグインを作れる

## 概要

プラグイン開発は、まず`.claude-plugin/plugin.json`マニフェストを作成し、機能を追加していく流れです。開発中は`--plugin-dir`フラグでローカルテストができます。完成したプラグインはマーケットプレイスで公開できます。

このレッスンでは、実際に動作するプラグインを段階的に構築することで、プラグイン開発の全ステップを学びます。

## 本文

### 最初のプラグインを作る（クイックスタート）

シンプルなSkillを含むプラグインを作成します。

#### ステップ1: プラグインディレクトリを作成する

```bash
mkdir my-first-plugin
```

#### ステップ2: マニフェストを作成する

```bash
mkdir my-first-plugin/.claude-plugin
```

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

| フィールド | 役割 |
|-----------|------|
| `name` | ユニークな識別子。スキルの名前空間になる（例: `/my-first-plugin:hello`） |
| `description` | マーケットプレイスに表示される説明 |
| `version` | セマンティックバージョニング |
| `author` | 任意。帰属表示に使用 |

#### ステップ3: Skillを追加する

```bash
mkdir -p my-first-plugin/skills/hello
```

`my-first-plugin/skills/hello/SKILL.md`:

```markdown
---
description: Greet the user with a friendly message
disable-model-invocation: true
---

Greet the user warmly and ask how you can help them today.
```

#### ステップ4: ローカルでテストする

```bash
claude --plugin-dir ./my-first-plugin
```

起動後、スキルを呼び出します：

```
/my-first-plugin:hello
```

`/help`でスキルが一覧に表示されることを確認できます。

**複数プラグインを同時にロードする場合:**

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

### Skillに引数を追加する

```markdown
---
description: Greet the user with a personalized message
---

# Hello Skill

Greet the user named "$ARGUMENTS" warmly and ask how you can help them today.
```

```
/my-first-plugin:hello Alex
```

### プラグインにエージェントを追加する

`agents/`ディレクトリにエージェントファイルを配置します：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── agents/
    └── security-reviewer.md
```

`agents/security-reviewer.md`:

```markdown
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

### プラグインにHooksを追加する

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

**重要:** `${CLAUDE_PLUGIN_ROOT}`を使ってプラグインルートへの絶対パスを参照します。インストール場所に関係なく正しいパスが解決されます。

### プラグインにMCPサーバーを追加する

`.mcp.json`でMCPサーバーを定義します：

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json
└── servers/
    └── my-server  # バイナリ
```

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

または`plugin.json`にインライン記述する方法：

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

### プラグインにLSPサーバーを追加する

`.lsp.json`でLSPサーバーを設定します：

`.lsp.json`:

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
|-----------|------|------|
| `command` | ○ | LSPバイナリのコマンド |
| `extensionToLanguage` | ○ | ファイル拡張子と言語IDのマッピング |
| `args` | 任意 | コマンドライン引数 |
| `transport` | 任意 | `stdio`（デフォルト）または`socket` |
| `env` | 任意 | 環境変数 |
| `initializationOptions` | 任意 | 初期化オプション |
| `settings` | 任意 | ワークスペース設定 |
| `startupTimeout` | 任意 | 起動タイムアウト（ミリ秒） |
| `restartOnCrash` | 任意 | クラッシュ時に自動再起動するか |
| `maxRestarts` | 任意 | 最大再起動回数 |

**重要:** LSPプラグインはサーバー設定のみを提供します。言語サーバーバイナリ自体はユーザーが別途インストールする必要があります。

### プラグインのデフォルト設定

`settings.json`でプラグイン有効化時のデフォルト設定を指定できます：

`settings.json`:

```json
{
  "agent": "security-reviewer"
}
```

現在は`agent`キーのみサポートされています。プラグインの`agents/`ディレクトリにあるカスタムエージェントをメインスレッドとして有効化できます。

### 完全なプラグイン構造

```text
enterprise-plugin/
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

### スタンドアロン設定からプラグインへの移行

既存の`.claude/`設定をプラグインに変換する手順です。

#### ステップ1: プラグイン構造を作成する

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

#### ステップ2: 既存ファイルをコピーする

```bash
# コマンド（Skills）をコピー
cp -r .claude/commands my-plugin/

# エージェントをコピー
cp -r .claude/agents my-plugin/

# Skillsをコピー
cp -r .claude/skills my-plugin/
```

#### ステップ3: フックを移行する

```bash
mkdir my-plugin/hooks
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
            "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix"
          }
        ]
      }
    ]
  }
}
```

#### ステップ4: テストする

```bash
claude --plugin-dir ./my-plugin
```

#### 移行による変更点

| スタンドアロン | プラグイン |
|-------------|---------|
| 単一プロジェクトのみ | マーケットプレイスで共有可能 |
| `.claude/commands/`のファイル | `plugin-name/commands/` |
| `settings.json`のHooks | `hooks/hooks.json` |
| 手動でコピーして共有 | `/plugin install`でインストール |

移行後は`.claude/`の元ファイルを削除することで重複を避けられます。

### デバッグと問題解決

#### デバッグ用コマンド

```bash
# デバッグモードで起動
claude --debug --plugin-dir ./my-plugin
```

これにより以下が表示されます：
- どのプラグインがロードされているか
- マニフェストのエラー
- コマンド・エージェント・フックの登録状況
- MCPサーバーの初期化状態

#### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|-----|------|-------|
| プラグインがロードされない | `plugin.json`が無効 | `claude plugin validate`で検証 |
| コマンドが表示されない | `commands/`がルートにない | `.claude-plugin/`の外に移動 |
| Hooksが発火しない | スクリプトに実行権限がない | `chmod +x script.sh` |
| MCPサーバーが起動しない | `${CLAUDE_PLUGIN_ROOT}`が未使用 | プラグインパスに変数を使用 |
| LSPエラー `Executable not found` | LSPバイナリが未インストール | バイナリをインストールする |

#### エラーメッセージの例

```
# マニフェストのJSONエラー
Invalid JSON syntax: Unexpected token } in JSON at position 142

# 必須フィールドがない
Plugin has an invalid manifest file at .claude-plugin/plugin.json.
Validation errors: name: Required

# コンポーネントディレクトリが見つからない
Warning: No commands found in plugin my-plugin custom directory: ./cmds.
Expected .md files or SKILL.md in subdirectories.
```

### プラグインの配布準備

1. **ドキュメントを追加する**
   - `README.md`にインストール方法と使用方法を記述
   - 各Skillの使用例を含める

2. **バージョンを設定する**
   - セマンティックバージョニング（MAJOR.MINOR.PATCH）に従う
   - コードを変更したらバージョンを必ず更新する

3. **ライセンスを追加する**
   - `LICENSE`ファイルを含める

4. **変更履歴を管理する**
   - `CHANGELOG.md`で変更を記録する

5. **マーケットプレイスで公開する**
   - 公式マーケットプレイスへの提出フォーム：
     - Claude.ai: `claude.ai/settings/plugins/submit`
     - Console: `platform.claude.com/plugins/submit`

## まとめ

- プラグインは`.claude-plugin/plugin.json`マニフェストとコンポーネントディレクトリで構成される
- Skills・エージェント・Hooks・MCPサーバー・LSPサーバーを組み合わせられる
- `${CLAUDE_PLUGIN_ROOT}`変数でプラグインルートへの絶対パスを参照する
- `--plugin-dir`フラグでインストールせずにローカルテストできる
- `claude --debug`でプラグイン読み込みの詳細を確認できる
- スタンドアロン設定からの移行も簡単にできる
- バージョン管理と`CHANGELOG.md`の維持が重要

## 公式リファレンス

- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Skills](https://code.claude.com/docs/en/skills)
- [Hooks](https://code.claude.com/docs/en/hooks)
- [MCP](https://code.claude.com/docs/en/mcp)
