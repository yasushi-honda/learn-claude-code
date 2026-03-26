# プラグインシステム概要 -- 機能をパッケージ化して配布する

> **対応公式ドキュメント**: https://code.claude.com/docs/en/plugins
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. プラグインの概念を理解し、スタンドアロン設定との使い分けを判断できる
2. プラグインのディレクトリ構造と`plugin.json`マニフェストの役割を説明できる
3. `/plugin`コマンドでプラグインのインストール・有効化・無効化・削除ができる
4. インストールスコープ（user/project/local/managed）の違いを理解し適切に選択できる

---

## 1. プラグインとは何か

プラグインは、Skills・エージェント・Hooks・MCPサーバー・LSPサーバーなどの機能を一つのパッケージにまとめて配布する仕組みです。

これまでのレッスンで学んだSkillsやHooksは、プロジェクトの`.claude/`ディレクトリに直接配置する「スタンドアロン設定」でした。プラグインはこれらを一歩進めて、バージョン管理され、マーケットプレイスを通じて共有できるパッケージにします。

### スタンドアロン設定 vs プラグイン

| 比較 | スタンドアロン（`.claude/`） | プラグイン（`.claude-plugin/`） |
|-----|-------------------------|---------------------------|
| スキル名 | `/hello` | `/plugin-name:hello` |
| 最適な用途 | 個人ワークフロー、プロジェクト固有設定 | チーム共有、コミュニティ配布、バージョン管理 |
| 設定方法 | `.claude/`に直接ファイルを置く | `.claude-plugin/plugin.json`マニフェストを作成 |
| 名前空間 | なし（競合リスクあり） | プラグイン名でプレフィックス（競合を防ぐ） |
| 更新方法 | 手動 | マーケットプレイス経由で自動更新 |

**スタンドアロン設定を使う場合:**
- 単一プロジェクトのカスタマイズ
- 共有不要な個人設定
- SkillsやHooksの実験段階

**プラグインを使う場合:**
- チームや外部コミュニティとの共有
- 複数プロジェクトで同じ機能を使う
- バージョン管理・自動更新が必要

> **公式ドキュメントより**: `.claude-plugin/`内にはcommands/、agents/、skills/、hooksディレクトリを置かないでください。これらはプラグインのルートディレクトリに配置します。

---

## 2. プラグインの構造

### ディレクトリ構造

プラグインは以下の構造で構成されます：

```text
my-plugin/
├── .claude-plugin/           # メタデータディレクトリ
│   └── plugin.json             # プラグインマニフェスト（必須）
├── commands/                 # コマンド（Skillsのレガシー形式）
│   └── review.md
├── agents/                   # カスタムエージェント
│   └── security-reviewer.md
├── skills/                   # Skillsディレクトリ
│   └── code-review/
│       └── SKILL.md
├── hooks/                    # フック設定
│   └── hooks.json
├── .mcp.json                 # MCPサーバー設定
├── .lsp.json                 # LSPサーバー設定
├── settings.json             # デフォルト設定
└── README.md                 # ドキュメント
```

**重要な配置ルール**: `.claude-plugin/`ディレクトリには`plugin.json`のみを置きます。`commands/`、`agents/`、`skills/`、`hooks/`はプラグインのルートディレクトリに配置してください。

### plugin.json マニフェスト

`plugin.json`はプラグインの唯一の必須ファイルです。最小構成では`name`フィールドのみ必要です：

```json
{
  "name": "my-plugin"
}
```

完全スキーマ：

| フィールド | 型 | 必須 | 説明 |
|-----------|---|:----:|------|
| `name` | string | はい | ユニーク識別子。kebab-case（例: `my-plugin`） |
| `version` | string | いいえ | セマンティックバージョン（例: `1.0.0`） |
| `description` | string | いいえ | マーケットプレイスに表示される説明 |
| `author` | object | いいえ | `{ "name": "...", "email": "..." }` |
| `homepage` | string | いいえ | プラグインのドキュメントURL |
| `repository` | string | いいえ | ソースコードのリポジトリURL |
| `license` | string | いいえ | ライセンス識別子（例: `MIT`） |
| `keywords` | string[] | いいえ | 検索用キーワード |
| `commands` | object | いいえ | コマンドのカスタムディレクトリ |
| `agents` | object | いいえ | エージェントのカスタムディレクトリ |
| `skills` | object | いいえ | Skillsのカスタムディレクトリ |
| `hooks` | object | いいえ | Hooksのカスタムディレクトリ |
| `mcpServers` | object | いいえ | MCPサーバー定義 |
| `outputStyles` | object | いいえ | 出力スタイルの定義 |
| `lspServers` | object | いいえ | LSPサーバー定義 |

**完全な例:**

```json
{
  "name": "enterprise-toolkit",
  "version": "2.1.0",
  "description": "Enterprise development toolkit for Claude Code",
  "author": {
    "name": "DevOps Team",
    "email": "devops@example.com"
  },
  "homepage": "https://docs.example.com/claude-plugin",
  "repository": "https://github.com/example/enterprise-toolkit",
  "license": "MIT",
  "keywords": ["enterprise", "devops", "deployment"]
}
```

---

## 3. プラグインの含められる機能

### Skills

`.claude/skills/`と同じ形式で、プラグインのルートに`skills/`ディレクトリを配置します。プラグインのSkillは`/plugin-name:skill-name`で呼び出します：

```text
my-plugin/
└── skills/
    └── code-review/
        └── SKILL.md
```

呼び出し: `/my-plugin:code-review`

### エージェント

`agents/`ディレクトリにMarkdownファイルを配置します：

```text
my-plugin/
└── agents/
    └── security-reviewer.md
```

### Hooks

`hooks/hooks.json`にフック設定をJSON形式で記述します：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
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

`${CLAUDE_PLUGIN_ROOT}`はプラグインのルートディレクトリへの絶対パスに展開されます。インストール場所に関係なく正しいパスが解決されます。

### MCPサーバー

`.mcp.json`またはplugin.jsonの`mcpServers`フィールドでMCPサーバーを定義します：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/my-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
    }
  }
}
```

### LSPサーバー

`.lsp.json`でLanguage Server Protocolサーバーを定義します。利用可能な公式LSPプラグイン：

| プラグイン | 言語 |
|---------|------|
| `pyright-lsp` | Python |
| `typescript-lsp` | TypeScript/JavaScript |
| `rust-lsp` | Rust |

LSP設定の必須フィールドは`command`と`extensionToLanguage`です：

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

---

## 4. プラグインのインストールと管理

### インストール方法

**GUIから:**
```
/plugin
```
Discoverタブから検索してインストールします。

**CLIから:**
```bash
# マーケットプレイスからインストール
claude plugin install typescript-lsp@claude-plugins-official

# スコープを指定してインストール
claude plugin install typescript-lsp@claude-plugins-official --scope project
```

### インストールスコープ

| スコープ | 設定ファイル | 用途 |
|---------|------------|------|
| `user`（デフォルト） | `~/.claude/settings.json` | 全プロジェクトで個人利用 |
| `project` | `.claude/settings.json` | チームで共有（バージョン管理に含める） |
| `local` | `.claude/settings.local.json` | このリポジトリで個人利用（gitignore対象） |
| `managed` | 管理者設定 | 読み取り専用（管理者がインストール） |

### 管理コマンド

```bash
# インストール済みプラグインの一覧
/plugin  # → "Installed" タブ

# プラグインを無効化（アンインストールせずに停止）
claude plugin disable plugin-name@marketplace

# プラグインを再有効化
claude plugin enable plugin-name@marketplace

# プラグインをアンインストール
claude plugin uninstall plugin-name@marketplace

# プラグインを更新
claude plugin update plugin-name@marketplace
```

### キャッシュ

プラグインのキャッシュは`~/.claude/plugins/cache`に保存されます。問題が発生した場合はキャッシュをクリアして再インストールします：

```bash
rm -rf ~/.claude/plugins/cache
```

---

## 5. チームでのプラグイン活用

### プロジェクトスコープでの共有

チーム全員が同じプラグインを使うには、`project`スコープでインストールします：

```bash
claude plugin install typescript-lsp@claude-plugins-official --scope project
```

これにより`.claude/settings.json`に記録され、リポジトリをクローンしたメンバー全員がプラグインを利用できます。

### チームマーケットプレイスの事前設定

`.claude/settings.json`にマーケットプレイスを事前設定すると、メンバーがプロジェクトを信頼した時点でインストールを促すプロンプトが表示されます：

```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}
```

### 特定プラグインをデフォルトで有効化

```json
{
  "enabledPlugins": [
    {
      "name": "code-formatter",
      "marketplace": "my-team-tools",
      "scope": "project"
    }
  ]
}
```

---

## ハンズオン演習

### 演習 1: プラグインのインストールと管理

**目的**: `/plugin`コマンドでプラグインのインストール・管理を体験する
**前提条件**: Claude Codeがインストール済みであること

**手順**:
1. Claude Codeで`/plugin`と入力する
2. Discoverタブでマーケットプレイスのプラグイン一覧を確認する
3. 任意のプラグイン（例: `typescript-lsp`）をインストールする
4. Installedタブでインストール状態を確認する
5. プラグインを無効化してから再有効化する

**期待される結果**: プラグインのインストール・無効化・有効化が正常に動作する

### 演習 2: プラグインのディレクトリ構造を確認する

**目的**: インストール済みプラグインの内部構造を理解する
**前提条件**: 演習1でプラグインがインストール済みであること

**手順**:
1. キャッシュディレクトリを確認する
   ```bash
   ls ~/.claude/plugins/cache/
   ```
2. インストールされたプラグインの構造を確認する
3. `plugin.json`の内容を読む
4. Skills、Hooks、その他のコンポーネントファイルを確認する

**期待される結果**: プラグインのディレクトリ構造とマニフェストの内容が理解できる

### 演習 3: プロジェクトスコープでのプラグイン共有

**目的**: チーム共有用にプラグインをprojectスコープでインストールする
**前提条件**: gitリポジトリ内で作業していること

**手順**:
1. プロジェクトスコープでプラグインをインストールする
   ```bash
   claude plugin install typescript-lsp@claude-plugins-official --scope project
   ```
2. `.claude/settings.json`にプラグインの記録が追加されたことを確認する
3. `git diff .claude/settings.json`で変更内容を確認する

**期待される結果**: `.claude/settings.json`にプラグインの情報が記録され、チームメンバーと共有可能な状態になる

---

## よくある質問

**Q: プラグインとスタンドアロン設定を同時に使えますか?**
A: はい。プラグインのSkillは`/plugin-name:skill-name`で呼び出され、スタンドアロンのSkillは`/skill-name`で呼び出されるため、名前空間が分かれて競合しません。

**Q: プラグインのSkillとプロジェクトのSkillが同じ機能を提供する場合、どうなりますか?**
A: 両方が有効です。ユーザーはどちらを使うか選択できます。プラグインのSkillは`/plugin-name:skill-name`、プロジェクトのSkillは`/skill-name`で区別されます。

**Q: `.claude-plugin/`と`.claude/`ディレクトリの両方があるとどうなりますか?**
A: `.claude-plugin/`があるディレクトリはプラグインとして認識されます。`.claude/`はスタンドアロン設定として別途動作します。通常、同一プロジェクトに両方を置く必要はありません。

**Q: LSPプラグインをインストールしたのにエラーが出ます。**
A: LSPプラグインはサーバー設定のみを提供します。言語サーバーバイナリ自体はユーザーが別途インストールする必要があります。例えば、`typescript-lsp`プラグインを使うには`npm install -g typescript-language-server typescript`が必要です。

**Q: プラグインの自動更新を制御できますか?**
A: はい。`DISABLE_AUTOUPDATER=true`で全自動更新を無効化できます。プラグインのみ自動更新したい場合は、さらに`FORCE_AUTOUPDATE_PLUGINS=true`を設定します。

---

## まとめ

この章で学んだ重要ポイント：

- プラグインはSkills・エージェント・Hooks・MCPサーバー・LSPサーバーをパッケージ化して配布する仕組み
- スタンドアロン設定（`.claude/`）は個人・プロジェクト向け、プラグイン（`.claude-plugin/`）は共有・配布向け
- `plugin.json`の必須フィールドは`name`のみ（kebab-case）
- `.claude-plugin/`には`plugin.json`のみを置き、他のファイルはルートに配置する
- インストールスコープ（user/project/local/managed）で適用範囲を制御
- `${CLAUDE_PLUGIN_ROOT}`でプラグインルートへの絶対パスを参照
- プラグインキャッシュは`~/.claude/plugins/cache`

## 次のステップ

次の章「プラグイン開発方法」では、実際にプラグインを開発する手順を学びます。マニフェストの作成からSkills・Hooks・MCPサーバーの追加、ローカルテスト、マーケットプレイスへの公開まで、段階的に構築していきます。

---

> **公式リファレンス**
> - [Create plugins](https://code.claude.com/docs/en/plugins)
> - [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
> - [Skills](https://code.claude.com/docs/en/skills)
> - [Hooks](https://code.claude.com/docs/en/hooks)
