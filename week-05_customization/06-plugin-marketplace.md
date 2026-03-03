# Lesson 6: マーケットプレイス活用

> 対応する公式ドキュメント: [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins) | [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)

## 学習目標

- マーケットプレイスの仕組みを理解し、プラグインを検索・インストールできる
- 複数のマーケットプレイスソース（GitHub・Git URL・ローカル）を追加できる
- `plugin`コマンドのGUI・CLIを使って管理できる
- コードインテリジェンス（LSP）プラグインを正しく設定できる
- 独自のマーケットプレイスを作成してチームに配布できる

## 概要

マーケットプレイスは、プラグインのカタログです。マーケットプレイスを追加することで、そこにあるプラグインをインストールできます。公式Anthropicマーケットプレイスは最初から利用可能で、言語サポート・外部サービス連携・ワークフロー改善などの公式プラグインが揃っています。GitHubリポジトリや自己ホストのサーバーを使って独自のマーケットプレイスを構築することもできます。

## 本文

### マーケットプレイスの仕組み

マーケットプレイスの利用は2ステップです：

1. **マーケットプレイスを追加する**: カタログをClaude Codeに登録する（プラグインはまだインストールされない）
2. **個別にプラグインをインストールする**: カタログを参照して必要なプラグインをインストールする

アプリストアと同じような仕組みで、ストアを追加してからアプリを個別にインストールするイメージです。

### 公式Anthropicマーケットプレイス

公式マーケットプレイス（`claude-plugins-official`）はClaude Code起動時に自動的に利用可能です。

```bash
# プラグインマネージャーを開く（4つのタブあり）
/plugin
```

**タブの説明:**
- **Discover**: マーケットプレイスのプラグインを検索・インストール
- **Installed**: インストール済みプラグインの管理
- **Marketplaces**: マーケットプレイスの追加・管理
- **Errors**: プラグイン読み込みエラーの確認

### コードインテリジェンスプラグインを使う

TypeScriptの言語サポートを例に設定手順を説明します。

#### ステップ1: バイナリをインストールする

```bash
npm install -g typescript-language-server typescript
```

#### ステップ2: プラグインをインストールする

```bash
/plugin install typescript-lsp@claude-plugins-official
```

または`/plugin`のDiscoverタブから検索してインストールします。

#### ステップ3: 動作を確認する

インストール後、Claude CodeでTypeScriptファイルを開くと：
- 編集後に自動的に型エラー・インポートエラーが表示される
- 定義へのジャンプ、参照の検索が使用可能になる

**インストール済み言語サーバー一覧:**

| 言語 | プラグイン | インストールコマンド |
|-----|---------|----------------|
| TypeScript/JavaScript | `typescript-lsp` | `npm install -g typescript-language-server typescript` |
| Python | `pyright-lsp` | `pip install pyright` または `npm install -g pyright` |
| Go | `gopls-lsp` | `go install golang.org/x/tools/gopls@latest` |
| Rust | `rust-analyzer-lsp` | [rust-analyzerのドキュメント参照](https://rust-analyzer.github.io/manual.html#installation) |
| Java | `jdtls-lsp` | `brew install jdtls`（macOS） |
| C/C++ | `clangd-lsp` | `brew install llvm`（macOS）|
| C# | `csharp-lsp` | `dotnet tool install -g csharp-ls` |
| Swift | `swift-lsp` | Xcode付属 |

**注意:** LSPプラグインをインストールしても`Executable not found in $PATH`エラーが出る場合は、対応するバイナリが未インストールです。

### デモマーケットプレイスを追加する

Anthropicのデモマーケットプレイスには学習用のサンプルプラグインが含まれています：

```bash
# GitHubからマーケットプレイスを追加
/plugin marketplace add anthropics/claude-code

# または
claude plugin marketplace add anthropics/claude-code
```

追加後、Discoverタブに新しいプラグインが表示されます。

```bash
# commit-commandsプラグインをインストール
/plugin install commit-commands@anthropics-claude-code
```

インストール後は以下のコマンドが使えます：

```bash
/commit-commands:commit
```

### 様々なソースからマーケットプレイスを追加する

#### GitHubリポジトリから

```bash
# owner/repo形式
/plugin marketplace add anthropics/claude-code
```

GitHubリポジトリには`.claude-plugin/marketplace.json`ファイルが必要です。

#### 他のGitホストから

```bash
# GitLab（HTTPS）
/plugin marketplace add https://gitlab.com/company/plugins.git

# GitLab（SSH）
/plugin marketplace add git@gitlab.com:company/plugins.git

# 特定のブランチ・タグを指定
/plugin marketplace add https://gitlab.com/company/plugins.git#v1.0.0
```

#### ローカルパスから

```bash
# ディレクトリを指定
/plugin marketplace add ./my-marketplace

# marketplace.jsonを直接指定
/plugin marketplace add ./path/to/marketplace.json
```

#### リモートURLから

```bash
/plugin marketplace add https://example.com/marketplace.json
```

### プラグインのインストールスコープ

インストール時にスコープを選択できます：

| スコープ | 設定ファイル | 用途 |
|---------|------------|------|
| `user`（デフォルト） | `~/.claude/settings.json` | 全プロジェクトで個人利用 |
| `project` | `.claude/settings.json` | チームで共有（バージョン管理に含める） |
| `local` | `.claude/settings.local.json` | このリポジトリで個人利用（gitignore対象） |
| `managed` | 管理者設定 | 読み取り専用（管理者がインストール） |

#### CLIでスコープを指定してインストール

```bash
# プロジェクトスコープ（チームで共有）
claude plugin install formatter@my-marketplace --scope project

# ユーザースコープ（デフォルト）
claude plugin install formatter@my-marketplace --scope user

# ローカルスコープ（gitignore対象）
claude plugin install formatter@my-marketplace --scope local
```

### プラグイン管理のCLIコマンド

#### インストール

```bash
# インストール（デフォルト: userスコープ）
claude plugin install plugin-name@marketplace-name

# /pluginコマンドでも同様
/plugin install plugin-name@marketplace-name
```

#### 無効化・有効化

```bash
# 無効化（アンインストールせずに停止）
/plugin disable plugin-name@marketplace-name

# 有効化
/plugin enable plugin-name@marketplace-name
```

#### アンインストール

```bash
/plugin uninstall plugin-name@marketplace-name
# または
/plugin remove plugin-name@marketplace-name
```

#### マーケットプレイスの管理

```bash
# 一覧表示
/plugin marketplace list

# 更新（最新プラグイン情報を取得）
/plugin marketplace update marketplace-name

# 削除（関連するプラグインもアンインストールされる）
/plugin marketplace remove marketplace-name
```

### 自動更新の設定

#### 特定のマーケットプレイスの自動更新

1. `/plugin`コマンドを実行
2. **Marketplaces**タブを選択
3. マーケットプレイスを選択
4. **Enable auto-update**または**Disable auto-update**を選択

**デフォルト:**
- 公式Anthropicマーケットプレイス: 自動更新有効
- サードパーティ・ローカルマーケットプレイス: 自動更新無効

#### 自動更新の無効化・調整

```bash
# すべての自動更新を無効化
export DISABLE_AUTOUPDATER=true

# Claude Code本体の更新を無効化しつつプラグインは自動更新
export DISABLE_AUTOUPDATER=true
export FORCE_AUTOUPDATE_PLUGINS=true
```

### チームマーケットプレイスの設定

チームのプロジェクトに特定のマーケットプレイスを事前設定するには、`.claude/settings.json`に追加します：

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

チームメンバーがプロジェクトフォルダを信頼すると、マーケットプレイスのインストールを促すプロンプトが表示されます。

#### 特定プラグインをデフォルトで有効化する

`.claude/settings.json`で`enabledPlugins`を設定：

```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": [
    {
      "name": "code-formatter",
      "marketplace": "my-team-tools",
      "scope": "project"
    }
  ]
}
```

### 独自のマーケットプレイスを作成する

プラグインを配布するためのマーケットプレイスを作成できます。

#### ディレクトリ構造

```text
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json    # マーケットプレイス定義
└── plugins/
    ├── my-plugin-a/
    │   ├── .claude-plugin/
    │   │   └── plugin.json
    │   └── skills/
    │       └── ...
    └── my-plugin-b/
        └── ...
```

#### marketplace.json

```json
{
  "name": "my-team-marketplace",
  "description": "Our team's Claude Code plugins",
  "plugins": [
    {
      "name": "code-formatter",
      "description": "Auto-formats code after editing",
      "version": "1.2.0",
      "path": "./plugins/code-formatter"
    },
    {
      "name": "deploy-tools",
      "description": "Deployment automation",
      "version": "2.0.0",
      "path": "./plugins/deploy-tools"
    }
  ]
}
```

#### GitHubで公開する

1. リポジトリを作成してプッシュする
2. チームに共有する：
   ```bash
   /plugin marketplace add your-org/your-repo
   ```

### トラブルシューティング

#### `/plugin`コマンドが認識されない

```bash
# バージョンを確認（1.0.33以上が必要）
claude --version

# 更新
npm update -g @anthropic-ai/claude-code
```

#### マーケットプレイスが読み込めない

1. URLにアクセスできるか確認
2. リポジトリに`.claude-plugin/marketplace.json`が存在するか確認

#### プラグインのインストールが失敗する

1. ソースURLにアクセスできるか確認
2. パブリックリポジトリか、アクセス権があるか確認

#### プラグインのSkillが表示されない

```bash
# キャッシュをクリアして再インストール
rm -rf ~/.claude/plugins/cache
```

その後Claude Codeを再起動してプラグインを再インストールします。

## まとめ

- マーケットプレイスはプラグインのカタログ。追加してから個別にインストールする
- 公式マーケットプレイスはClaude Code起動時から利用可能
- GitHub・Git URL・ローカルパスなど様々なソースからマーケットプレイスを追加できる
- インストールスコープ（user/project/local）でプラグインの適用範囲を制御する
- チームの`.claude/settings.json`にマーケットプレイスを事前設定してチームで統一した環境を作れる
- 自前のマーケットプレイスを作成してGitHub等で公開できる
- 公式マーケットプレイスへの提出は専用フォームから

## 公式リファレンス

- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [公式マーケットプレイス提出フォーム（Claude.ai）](https://claude.ai/settings/plugins/submit)
- [公式マーケットプレイス提出フォーム（Console）](https://platform.claude.com/plugins/submit)
