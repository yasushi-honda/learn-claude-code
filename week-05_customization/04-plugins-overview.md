# Lesson 4: プラグインシステム概要

> 対応する公式ドキュメント: [Create plugins](https://code.claude.com/docs/en/plugins) | [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)

## 学習目標

- プラグインとは何か、Skills・Hooks・MCPとの違いを説明できる
- スタンドアロン設定とプラグインの使い分けを判断できる
- プラグインのディレクトリ構造を理解できる
- `/plugin`コマンドでプラグインのインストール・管理ができる
- 公式マーケットプレイスからプラグインを検索・インストールできる

## 概要

プラグインは、Skills・エージェント・Hooks・MCPサーバーなどの機能を一つのパッケージにまとめて配布する仕組みです。個人プロジェクトの設定（スタンドアロン設定）と異なり、プラグインはバージョン管理され、マーケットプレイスを通じて他のユーザーと共有できます。

公式マーケットプレイスには、TypeScript・Python・Rustなどの言語サポート（LSPプラグイン）、GitHub・Jira・Notionなどの外部サービス連携、コードレビュー・デプロイなどの開発ワークフローを強化するプラグインが揃っています。

## 本文

### プラグインとは

プラグインは次の要素を組み合わせて配布できます：

- **Skills**: `/コマンド名`で呼び出せるカスタム指示
- **エージェント**: 特定タスクに特化したサブエージェント
- **Hooks**: ライフサイクルイベントの自動処理
- **MCPサーバー**: 外部ツールやAPIとの連携
- **LSPサーバー**: リアルタイムのコード補完・エラー検出

### スタンドアロン設定 vs プラグイン

| 比較 | スタンドアロン（`.claude/`） | プラグイン |
|-----|-------------------------|---------|
| スキル名 | `/hello` | `/plugin-name:hello` |
| 最適な用途 | 個人ワークフロー、プロジェクト固有設定 | チーム共有、コミュニティ配布、バージョン管理 |
| 設定方法 | `.claude/`ディレクトリに直接ファイルを置く | `.claude-plugin/plugin.json`マニフェストを作成 |
| 名前空間 | なし（競合リスクあり） | プラグイン名でプレフィックス |
| 更新方法 | 手動 | マーケットプレイス経由で自動更新 |

**スタンドアロン設定を使う場合:**
- 単一プロジェクトのカスタマイズ
- 共有不要な個人設定
- SkillsやHooksの実験段階

**プラグインを使う場合:**
- チームや外部コミュニティとの共有
- 複数プロジェクトで同じ機能を使う
- バージョン管理・自動更新が必要

### プラグインの種類

公式マーケットプレイス（`claude-plugins-official`）には以下のカテゴリがあります：

#### コードインテリジェンス（LSP）プラグイン

Language Server Protocol（LSP）を使ったリアルタイムコード補完・エラー検出プラグイン：

| 言語 | プラグイン名 | 必要なバイナリ |
|-----|------------|------------|
| TypeScript | `typescript-lsp` | `typescript-language-server` |
| Python | `pyright-lsp` | `pyright-langserver` |
| Go | `gopls-lsp` | `gopls` |
| Rust | `rust-analyzer-lsp` | `rust-analyzer` |
| Java | `jdtls-lsp` | `jdtls` |
| C/C++ | `clangd-lsp` | `clangd` |
| C# | `csharp-lsp` | `csharp-ls` |
| Swift | `swift-lsp` | `sourcekit-lsp` |
| Kotlin | `kotlin-lsp` | `kotlin-language-server` |
| PHP | `php-lsp` | `intelephense` |
| Lua | `lua-lsp` | `lua-language-server` |

LSPプラグインをインストールすると、Claudeは次の能力を得ます：
- **即時診断**: ファイル編集後にエラーや警告を自動検出
- **コードナビゲーション**: 定義へのジャンプ、参照の検索、型情報の表示

#### 外部サービス連携プラグイン

| カテゴリ | プラグイン |
|---------|---------|
| ソース管理 | `github`, `gitlab` |
| プロジェクト管理 | `atlassian`（Jira/Confluence）, `asana`, `linear`, `notion` |
| デザイン | `figma` |
| インフラ | `vercel`, `firebase`, `supabase` |
| コミュニケーション | `slack` |
| 監視 | `sentry` |

#### 開発ワークフロープラグイン

| プラグイン | 説明 |
|---------|-----|
| `commit-commands` | Gitコミット・プッシュ・PRワークフロー |
| `pr-review-toolkit` | プルリクエストレビュー専用エージェント |
| `agent-sdk-dev` | Claude Agent SDK開発ツール |
| `plugin-dev` | プラグイン開発ツールキット |

#### 出力スタイルプラグイン

| プラグイン | 説明 |
|---------|-----|
| `explanatory-output-style` | 実装の選択について教育的な洞察を提供 |
| `learning-output-style` | スキル構築のためのインタラクティブな学習モード |

### プラグインのインストール方法

#### 公式マーケットプレイスから

公式マーケットプレイスはClaude Code起動時に自動的に利用可能です：

```bash
# プラグインマネージャーを開く
/plugin

# コマンドラインから直接インストール
/plugin install typescript-lsp@claude-plugins-official
```

#### デモマーケットプレイスを追加する

```bash
# マーケットプレイスを追加
/plugin marketplace add anthropics/claude-code

# インストール
/plugin install commit-commands@anthropics-claude-code
```

#### インストールスコープ

| スコープ | 設定ファイル | 用途 |
|---------|------------|------|
| `user`（デフォルト） | `~/.claude/settings.json` | 全プロジェクトで個人利用 |
| `project` | `.claude/settings.json` | チームで共有（バージョン管理に含める） |
| `local` | `.claude/settings.local.json` | このリポジトリで個人利用（gitignore対象） |

```bash
# プロジェクトスコープでインストール（チーム共有）
claude plugin install typescript-lsp@claude-plugins-official --scope project
```

### プラグインの管理

```bash
# インストール済みプラグインの一覧
/plugin  # → "Installed" タブへ

# プラグインを無効化（アンインストールせずに）
/plugin disable commit-commands@anthropics-claude-code

# プラグインを再有効化
/plugin enable commit-commands@anthropics-claude-code

# プラグインをアンインストール
/plugin uninstall commit-commands@anthropics-claude-code

# マーケットプレイスの一覧
/plugin marketplace list

# マーケットプレイスを更新
/plugin marketplace update marketplace-name

# マーケットプレイスを削除
/plugin marketplace remove marketplace-name
```

### プラグインのディレクトリ構造

プラグインは次の構造で構成されます：

```text
my-plugin/
├── .claude-plugin/           # メタデータディレクトリ（任意）
│   └── plugin.json             # プラグインマニフェスト
├── commands/                 # コマンド（スキルのレガシー形式）
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

**重要:** `.claude-plugin/`ディレクトリには`plugin.json`のみを置きます。`commands/`、`agents/`、`skills/`などはプラグインルートに置いてください。

### プラグインマニフェスト（plugin.json）

```json
{
  "name": "my-plugin",
  "description": "プラグインの説明",
  "version": "1.0.0",
  "author": {
    "name": "Author Name",
    "email": "author@example.com"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/my-plugin",
  "license": "MIT"
}
```

| フィールド | 説明 |
|-----------|------|
| `name` | ユニークな識別子（スキルのプレフィックスになる） |
| `description` | マーケットプレイスで表示される説明 |
| `version` | セマンティックバージョニング（例: `1.0.0`） |

### 自動更新の設定

Claude Codeは起動時にマーケットプレイスとプラグインを自動更新できます：

```bash
# 自動更新を完全に無効化（Claude Code本体も含む）
export DISABLE_AUTOUPDATER=true

# Claude Code本体の更新を無効化しつつプラグインは自動更新
export DISABLE_AUTOUPDATER=true
export FORCE_AUTOUPDATE_PLUGINS=true
```

### チームマーケットプレイスの設定

チーム管理者は`.claude/settings.json`にマーケットプレイスを事前設定できます：

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

## まとめ

- プラグインはSkills・エージェント・Hooks・MCPサーバーをパッケージ化して配布する仕組み
- スタンドアロン設定はシンプルで個人向け、プラグインは共有・バージョン管理に向いている
- 公式マーケットプレイスには言語別LSPプラグイン・外部サービス連携・ワークフロープラグインが揃っている
- `/plugin`コマンドでGUIで管理でき、スコープ（user/project/local）を選べる
- プラグインのディレクトリ構造では、`plugin.json`は`.claude-plugin/`に、他のファイルはルートに置く
- チームマーケットプレイスを設定すると、メンバーが同じプラグインセットを使える

## 公式リファレンス

- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
