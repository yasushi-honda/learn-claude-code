# マーケットプレイス活用 -- プラグインの検索・配布・運用

> **対応公式ドキュメント**: https://code.claude.com/docs/en/plugins-reference
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. マーケットプレイスの仕組みを理解し、プラグインを検索・インストールできる
2. 複数のマーケットプレイスソース（GitHub・Git URL・ローカル）を追加できる
3. インストールスコープ（user/project/local/managed）を適切に使い分けられる
4. 独自のマーケットプレイスを作成してチームに配布できる

---

## 1. マーケットプレイスの仕組み

マーケットプレイスは、プラグインのカタログです。アプリストアと同じ仕組みで、まずストア（マーケットプレイス）を追加してから、個別にアプリ（プラグイン）をインストールします。

**2ステップの流れ:**
1. **マーケットプレイスを追加する**: カタログをClaude Codeに登録する（プラグインはまだインストールされない）
2. **個別にプラグインをインストールする**: カタログを参照して必要なプラグインを選んでインストールする

### 公式Anthropicマーケットプレイス

公式マーケットプレイス（`claude-plugins-official`）はClaude Code起動時に自動的に利用可能です。追加の設定は不要です。

### `/plugin`コマンドのタブ

```
/plugin
```

| タブ | 説明 |
|-----|------|
| **Discover** | マーケットプレイスのプラグインを検索・インストール |
| **Installed** | インストール済みプラグインの管理（有効化・無効化・削除） |
| **Marketplaces** | マーケットプレイスの追加・更新・削除 |
| **Errors** | プラグイン読み込みエラーの確認 |

---

## 2. プラグインのインストール

### GUIからのインストール

`/plugin`でDiscoverタブを開き、目的のプラグインを選択してインストールします。

### CLIからのインストール

```bash
# マーケットプレイスからインストール
claude plugin install typescript-lsp@claude-plugins-official

# /pluginコマンドでも同様
/plugin install typescript-lsp@claude-plugins-official
```

### インストールスコープ

インストール時にスコープを指定できます。スコープによってプラグインの設定が記録されるファイルが変わります：

| スコープ | 設定ファイル | 用途 |
|---------|------------|------|
| `user`（デフォルト） | `~/.claude/settings.json` | 全プロジェクトで個人利用 |
| `project` | `.claude/settings.json` | チームで共有（バージョン管理に含める） |
| `local` | `.claude/settings.local.json` | このリポジトリで個人利用（gitignore対象） |
| `managed` | 管理者設定 | 読み取り専用（管理者がインストール） |

```bash
# プロジェクトスコープでインストール（チーム共有）
claude plugin install typescript-lsp@claude-plugins-official --scope project

# ユーザースコープ（デフォルト）
claude plugin install typescript-lsp@claude-plugins-official --scope user

# ローカルスコープ（gitignore対象）
claude plugin install typescript-lsp@claude-plugins-official --scope local
```

---

## 3. プラグインの管理

### 基本操作

```bash
# 無効化（アンインストールせずに停止）
claude plugin disable plugin-name@marketplace-name

# 再有効化
claude plugin enable plugin-name@marketplace-name

# アンインストール
claude plugin uninstall plugin-name@marketplace-name

# 更新
claude plugin update plugin-name@marketplace-name
```

### マーケットプレイスの管理

```bash
# マーケットプレイスの一覧表示
claude plugin marketplace list
# または
/plugin marketplace list

# マーケットプレイスを更新（最新プラグイン情報を取得）
claude plugin marketplace update marketplace-name

# マーケットプレイスを削除（関連するプラグインもアンインストール）
claude plugin marketplace remove marketplace-name
```

### デバッグ

プラグインの問題を診断するには：

```bash
# デバッグモードで起動
claude --debug

# Claude Code内でデバッグ
/debug
```

表示される情報：
- ロードされたプラグインの一覧
- マニフェストの検証結果
- MCPサーバーの接続状態
- フックの登録状況

### キャッシュのクリア

プラグインのSkillが表示されないなどの問題が発生した場合：

```bash
rm -rf ~/.claude/plugins/cache
```

Claude Codeを再起動するとプラグインが再ダウンロードされます。

### よくある問題と解決策

| 問題 | 解決策 |
|-----|-------|
| プラグインがロードされない | `claude --debug`でエラーを確認、`plugin.json`の構文を検証 |
| Skillが表示されない | キャッシュをクリアして再インストール |
| MCPサーバーが起動しない | `${CLAUDE_PLUGIN_ROOT}`でパスを確認 |
| LSPエラー `Executable not found` | 言語サーバーバイナリをインストール |
| マーケットプレイスが読み込めない | URL/リポジトリへのアクセス権を確認 |

---

## 4. マーケットプレイスの追加

### GitHubリポジトリから

```bash
# owner/repo形式
claude plugin marketplace add anthropics/claude-code
# または
/plugin marketplace add anthropics/claude-code
```

リポジトリには`.claude-plugin/marketplace.json`ファイルが必要です。

### 他のGitホストから

```bash
# GitLab（HTTPS）
/plugin marketplace add https://gitlab.com/company/plugins.git

# GitLab（SSH）
/plugin marketplace add git@gitlab.com:company/plugins.git

# 特定のブランチ・タグを指定
/plugin marketplace add https://gitlab.com/company/plugins.git#v1.0.0
```

### ローカルパスから

```bash
# ディレクトリを指定
/plugin marketplace add ./my-marketplace

# marketplace.jsonを直接指定
/plugin marketplace add ./path/to/marketplace.json
```

### リモートURLから

```bash
/plugin marketplace add https://example.com/marketplace.json
```

### 自動更新の設定

**デフォルト動作:**
- 公式Anthropicマーケットプレイス: 自動更新 **有効**
- サードパーティ・ローカル: 自動更新 **無効**

**GUIで切り替え:**
1. `/plugin`を開く
2. Marketplacesタブを選択
3. マーケットプレイスを選択して「Enable/Disable auto-update」を選ぶ

**環境変数で制御:**

```bash
# すべての自動更新を無効化（Claude Code本体も含む）
export DISABLE_AUTOUPDATER=true

# Claude Code本体の更新を無効化しつつプラグインは自動更新
export DISABLE_AUTOUPDATER=true
export FORCE_AUTOUPDATE_PLUGINS=true
```

---

## 5. 独自マーケットプレイスの作成

チーム向けにプラグインを配布するための独自マーケットプレイスを作成できます。

### ディレクトリ構造

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
        ├── .claude-plugin/
        │   └── plugin.json
        └── ...
```

### marketplace.json

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

### GitHubで公開する

1. リポジトリを作成し、上記の構造でプッシュする
2. チームに共有する：
   ```bash
   /plugin marketplace add your-org/your-repo
   ```

### チームマーケットプレイスの事前設定

チームの`.claude/settings.json`にマーケットプレイスを事前設定しておくと、メンバーがプロジェクトフォルダを信頼した時点でインストールを促すプロンプトが表示されます：

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

### マーケットプレイスへの公式提出

プラグインを公式マーケットプレイスで公開するには、専用フォームから提出します：

| プラットフォーム | 提出URL |
|-------------|---------|
| Claude.ai | `claude.ai/settings/plugins/submit` |
| Console | `platform.claude.com/plugins/submit` |

提出前のチェックリスト：
- `plugin.json`に`name`、`version`、`description`が設定されている
- `README.md`にインストール方法と使用方法が記載されている
- バージョンがセマンティックバージョニング（MAJOR.MINOR.PATCH）に従っている
- LICENSEファイルが含まれている

---

## ハンズオン演習

### 演習 1: マーケットプレイスからプラグインをインストールする

**目的**: 公式マーケットプレイスからLSPプラグインをインストールして動作確認する
**前提条件**: Claude Codeがインストール済み、Node.jsがインストール済みであること

**手順**:
1. TypeScriptの言語サーバーをインストールする
   ```bash
   npm install -g typescript-language-server typescript
   ```
2. Claude Codeで`/plugin`を開く
3. Discoverタブで`typescript-lsp`を検索する
4. インストールする
5. TypeScriptファイルを開いて、編集後にエラー検出が動作することを確認する

**期待される結果**: TypeScriptファイルの編集後に型エラーやインポートエラーが自動検出される

### 演習 2: デモマーケットプレイスを追加する

**目的**: Anthropicのデモマーケットプレイスを追加してプラグインをインストールする
**前提条件**: インターネット接続があること

**手順**:
1. デモマーケットプレイスを追加する
   ```bash
   /plugin marketplace add anthropics/claude-code
   ```
2. `/plugin`のDiscoverタブに新しいプラグインが表示されることを確認する
3. `commit-commands`プラグインをインストールする
   ```bash
   /plugin install commit-commands@anthropics-claude-code
   ```
4. `/commit-commands:commit`を実行する

**期待される結果**: デモマーケットプレイスのプラグインが正常にインストールされ、コマンドが使用できる

### 演習 3: 独自マーケットプレイスの作成

**目的**: ローカルマーケットプレイスを作成してプラグインを配布する
**前提条件**: Lesson 5で作成したプラグインがあること

**手順**:
1. マーケットプレイスのディレクトリを作成する
   ```bash
   mkdir -p ~/my-marketplace/.claude-plugin
   mkdir -p ~/my-marketplace/plugins
   ```
2. `marketplace.json`を作成する
   ```json
   {
     "name": "my-local-marketplace",
     "description": "My local plugins for testing",
     "plugins": [
       {
         "name": "my-test-plugin",
         "description": "Test plugin from Lesson 5",
         "version": "0.1.0",
         "path": "./plugins/my-test-plugin"
       }
     ]
   }
   ```
3. Lesson 5のプラグインを`plugins/`にコピーする
   ```bash
   cp -r ~/my-test-plugin ~/my-marketplace/plugins/my-test-plugin
   ```
4. マーケットプレイスを追加する
   ```bash
   /plugin marketplace add ~/my-marketplace
   ```
5. プラグインをインストールする

**期待される結果**: ローカルマーケットプレイスからプラグインがインストールでき、正常に動作する

---

## よくある質問

**Q: マーケットプレイスを追加しただけでプラグインがインストールされますか?**
A: いいえ。マーケットプレイスの追加はカタログの登録のみです。プラグインは個別にインストールする必要があります。ただし、`enabledPlugins`で事前設定されている場合は、プロジェクト信頼時にインストールが提案されます。

**Q: プラグインの更新はどのように行われますか?**
A: 公式マーケットプレイスのプラグインはデフォルトで自動更新されます。手動更新する場合は`claude plugin update plugin-name@marketplace`を実行します。バージョンはセマンティックバージョニング（MAJOR.MINOR.PATCH）に従います。

**Q: マーケットプレイスを削除すると何が起こりますか?**
A: マーケットプレイスに関連するプラグインもアンインストールされます。

**Q: プライベートリポジトリをマーケットプレイスとして使えますか?**
A: はい。GitHubのプライベートリポジトリをマーケットプレイスとして追加できます。`gh`コマンドで認証済みであれば、アクセス権のあるリポジトリを使用できます。SSH形式（`git@github.com:...`）でも追加可能です。

**Q: 複数のマーケットプレイスに同名のプラグインがある場合はどうなりますか?**
A: プラグインは`plugin-name@marketplace-name`の形式で一意に識別されます。同名でも異なるマーケットプレイスのプラグインは別物として扱われます。

---

## まとめ

この章で学んだ重要ポイント：

- マーケットプレイスはプラグインのカタログ。追加後に個別にインストールする2ステップ
- 公式マーケットプレイス（`claude-plugins-official`）はClaude Code起動時から利用可能
- `/plugin`コマンドの4タブ: Discover、Installed、Marketplaces、Errors
- CLIでの管理: `claude plugin install/uninstall/enable/disable/update`
- インストールスコープ（user/project/local/managed）で適用範囲を制御
- GitHub・Git URL・ローカルパスなど様々なソースからマーケットプレイスを追加できる
- 独自マーケットプレイスは`marketplace.json`で定義し、GitHubで公開できる
- チームの`.claude/settings.json`に`extraKnownMarketplaces`と`enabledPlugins`を設定してチームで統一した環境を構築
- 公式マーケットプレイスへの提出は`claude.ai/settings/plugins/submit`から

## 次のステップ

Week 5「カスタマイズ・拡張」は以上で完了です。Skills・Hooks・Pluginsの3つの拡張機能を組み合わせることで、Claude Codeを自分のワークフローに最適化し、チーム全体の開発効率を向上させることができます。次のWeek 6では、MCP（Model Context Protocol）を使った外部ツールとの連携を学びます。

---

> **公式リファレンス**
> - [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
> - [Create plugins](https://code.claude.com/docs/en/plugins)
> - [公式マーケットプレイス提出フォーム（Claude.ai）](https://claude.ai/settings/plugins/submit)
> - [公式マーケットプレイス提出フォーム（Console）](https://platform.claude.com/plugins/submit)
