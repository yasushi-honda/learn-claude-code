# 対話モードの使い方

> 対応する公式ドキュメント: [Interactive Mode](https://code.claude.com/docs/en/interactive-mode)

## 学習目標

- 主要なキーボードショートカットを覚えて操作を効率化できる
- マルチライン入力を使いこなせる
- `Shift+Tab` でパーミッションモードを切り替えられる
- `@` メンションでファイル・URL・画像を参照できる
- `/` コマンドで Claude Code の各機能にアクセスできる

## 概要

Claude Code の対話モードは、単なる入力ボックスではありません。キーボードショートカット・マルチライン入力・ファイル参照・豊富な `/` コマンドを組み合わせることで、開発ワークフローを大幅に効率化できます。

## 本文

### キーボードショートカット

> **macOS ユーザーへ**: `Alt+B`、`Alt+F`、`Alt+Y`、`Alt+M`、`Alt+P` などのショートカットを使うには、ターミナルの Option キーを Meta として設定する必要があります。
> - **iTerm2**: Settings → Profiles → Keys → Left/Right Option key を "Esc+" に設定
> - **Terminal.app**: Settings → Profiles → Keyboard → "Use Option as Meta Key" にチェック

#### 全般操作

| ショートカット | 説明 | 状況 |
|---|---|---|
| `Ctrl+C` | 現在の入力または生成をキャンセル | 標準の割り込み |
| `Ctrl+F` | バックグラウンドのエージェントをすべて停止（3秒以内に2回） | バックグラウンドエージェント制御 |
| `Ctrl+D` | Claude Code セッションを終了 | EOF シグナル |
| `Ctrl+G` | デフォルトのテキストエディタで開く | プロンプトやカスタム返答を編集 |
| `Ctrl+L` | ターミナル画面をクリア | 会話履歴は保持 |
| `Ctrl+O` | 詳細出力のトグル | ツール使用と実行の詳細を表示 |
| `Ctrl+R` | コマンド履歴の逆検索 | 前のコマンドをインタラクティブに検索 |
| `Ctrl+V` / `Cmd+V`（iTerm2）/ `Alt+V`（Windows） | クリップボードから画像を貼り付け | 画像またはファイルパスを貼り付け |
| `Ctrl+B` | 実行中のタスクをバックグラウンドへ | bash コマンドとエージェントをバックグラウンド化 |
| `Ctrl+T` | タスクリストのトグル | ターミナルステータスエリアのタスクリストを表示/非表示 |
| `←` / `→` | ダイアログのタブを切り替え | 権限ダイアログとメニューのタブナビゲーション |
| `↑` / `↓` | コマンド履歴をナビゲート | 前の入力を呼び出す |
| `Esc` + `Esc` | 巻き戻しまたは要約 | 前の状態にコードや会話を戻す、または要約 |
| `Shift+Tab` / `Alt+M` | パーミッションモードのトグル | Auto-Accept・Plan・通常モードを切り替え |
| `Option+P`（macOS）/ `Alt+P`（Windows/Linux） | モデルの切り替え | プロンプトをクリアせずにモデルを切り替え |
| `Option+T`（macOS）/ `Alt+T`（Windows/Linux） | 拡張思考のトグル | 拡張思考モードの有効/無効（要 `/terminal-setup`） |

#### テキスト編集

| ショートカット | 説明 | 状況 |
|---|---|---|
| `Ctrl+K` | 行末まで削除 | 削除したテキストを貼り付け可能 |
| `Ctrl+U` | 行全体を削除 | 削除したテキストを貼り付け可能 |
| `Ctrl+Y` | 削除したテキストを貼り付け | `Ctrl+K` や `Ctrl+U` で削除したテキスト |
| `Alt+Y`（`Ctrl+Y` 後） | 貼り付け履歴を循環 | 以前に削除したテキストを循環 |
| `Alt+B` | カーソルを 1 単語後退 | 単語単位のナビゲーション |
| `Alt+F` | カーソルを 1 単語前進 | 単語単位のナビゲーション |

### 入力モード

#### マルチライン入力

複数行のプロンプトを入力する方法：

| 方法 | ショートカット | 対応ターミナル |
|---|---|---|
| クイックエスケープ | `\` + `Enter` | すべてのターミナル |
| macOS デフォルト | `Option+Enter` | macOS デフォルト |
| Shift+Enter | `Shift+Enter` | iTerm2・WezTerm・Ghostty・Kitty で設定なしで動作 |
| 制御シーケンス | `Ctrl+J` | マルチライン用ラインフィード |
| 貼り付けモード | 直接貼り付け | コードブロック・ログ |

> **ヒント**: Shift+Enter は iTerm2・WezTerm・Ghostty・Kitty では設定なしで動作します。VS Code・Alacritty・Zed・Warp では `/terminal-setup` を実行してバインドをインストールしてください。

#### Bash モード（`!` プレフィックス）

`!` で始めると Claude を介さずに bash コマンドを直接実行できます：

```bash
! npm test
! git status
! ls -la
```

実行結果が会話コンテキストに追加されます。長時間かかるコマンドは `Ctrl+B` でバックグラウンド化できます。

### パーミッションモード切り替え

`Shift+Tab` を押すとモードが循環します：

```
通常モード（Default）
    ↓ Shift+Tab
Auto-Accept モード（⏵⏵ accept edits on）
    ↓ Shift+Tab
Plan モード（⏸ plan mode on）
    ↓ Shift+Tab
通常モード（Default）
```

| モード | 動作 |
|---|---|
| **Default** | ファイル編集とシェルコマンドの前に確認を求める |
| **Auto-accept edits** | ファイル編集は確認なし、コマンドは確認あり |
| **Plan mode** | 読み取り専用ツールのみ、実行前に承認できるプランを作成 |

### @メンション：ファイル・URL・画像の参照

`@` を入力するとファイルパスのオートコンプリートが起動します：

#### ファイルを参照する

```
> Explain the logic in @src/utils/auth.js
```

ファイルの全内容が会話に含まれます。

#### ディレクトリを参照する

```
> What's the structure of @src/components?
```

ファイル情報付きのディレクトリ一覧が提供されます（内容ではなく一覧）。

#### MCP リソースを参照する

```
> Show me the data from @github:repos/owner/repo/issues
```

接続された MCP サーバーからデータを取得します（フォーマット: `@server:resource`）。

**ヒント:**
- ファイルパスは相対パス・絶対パスどちらでも可
- `@` ファイル参照は、ファイルのディレクトリと親ディレクトリの `CLAUDE.md` もコンテキストに追加
- 1 つのメッセージで複数ファイルを参照可能（例: `@file1.js and @file2.js`）

### /コマンド一覧

`/` を入力するとすべての利用可能なコマンドが表示されます。以下は主要なコマンドの一覧です（プラン・プラットフォームによっては表示されないコマンドもあります）：

#### セッション管理

| コマンド | 説明 |
|---|---|
| `/clear` | 会話履歴をクリアしてコンテキストを解放（エイリアス: `/reset`、`/new`） |
| `/compact [instructions]` | オプションの focus 指示付きで会話をコンパクト化 |
| `/context` | 現在のコンテキスト使用状況をカラーグリッドで可視化 |
| `/resume [session]` | セッションを ID または名前で再開、またはセッションピッカーを開く |
| `/fork [name]` | この時点で現在の会話のフォークを作成 |
| `/rename [name]` | 現在のセッションの名前を変更 |
| `/export [filename]` | 現在の会話をプレーンテキストとしてエクスポート |

#### モデル・設定

| コマンド | 説明 |
|---|---|
| `/model [model]` | AI モデルを選択または変更 |
| `/config` | 設定インターフェースを開く（エイリアス: `/settings`） |
| `/theme` | カラーテーマを変更 |
| `/vim` | Vim と通常編集モードを切り替え |
| `/fast [on\|off]` | ファストモードのオン/オフ |
| `/output-style [style]` | 出力スタイルを切り替え（Default・Explanatory・Learning） |

#### 情報・ヘルプ

| コマンド | 説明 |
|---|---|
| `/help` | ヘルプと利用可能なコマンドを表示 |
| `/status` | バージョン・モデル・アカウント・接続状況を表示 |
| `/cost` | トークン使用統計を表示 |
| `/usage` | プラン使用制限とレート制限ステータスを表示 |
| `/stats` | 日次使用状況・セッション履歴・ストリーク・モデル設定を可視化 |
| `/insights` | セッション分析レポートを生成 |
| `/release-notes` | 完全な変更履歴を表示 |

#### 開発・統合

| コマンド | 説明 |
|---|---|
| `/init` | `CLAUDE.md` ガイドでプロジェクトを初期化 |
| `/memory` | `CLAUDE.md` メモリファイルを編集、Auto-memory を管理 |
| `/diff` | 未コミットの変更とターン別 diff のインタラクティブビューアを開く |
| `/permissions` | 権限を表示または更新（エイリアス: `/allowed-tools`） |
| `/plan` | プランモードに入る |
| `/security-review` | 現在のブランチの変更のセキュリティ脆弱性を分析 |
| `/review` | プルリクエストをレビュー（要 `gh` CLI） |
| `/pr-comments [PR]` | GitHub プルリクエストのコメントを取得・表示 |

#### 外部サービス

| コマンド | 説明 |
|---|---|
| `/agents` | エージェント設定を管理 |
| `/hooks` | フック設定を管理 |
| `/mcp` | MCP サーバー接続を管理 |
| `/plugin` | プラグインを管理 |
| `/skills` | 利用可能なスキルを一覧表示 |
| `/chrome` | Chrome 統合設定 |
| `/install-github-app` | GitHub Actions アプリをリポジトリにセットアップ |
| `/install-slack-app` | Slack アプリをインストール |
| `/remote-control` | このセッションをリモートコントロール可能にする |

#### セッション継続

| コマンド | 説明 |
|---|---|
| `/login` | Anthropic アカウントにサインイン |
| `/logout` | Anthropic アカウントからサインアウト |
| `/desktop` | 現在のセッションを Claude Code Desktop アプリで継続（macOS・Windows のみ） |

#### その他

| コマンド | 説明 |
|---|---|
| `/doctor` | Claude Code のインストールと設定を診断 |
| `/terminal-setup` | ターミナルのキーバインドを設定 |
| `/keybindings` | キーバインド設定ファイルを開く |
| `/feedback [report]` | Claude Code についてのフィードバックを送信 |
| `/exit` | CLI を終了（エイリアス: `/quit`） |

### Vim エディタモード

`/vim` コマンドまたは `/config` で永続的に Vim スタイル編集を有効にできます。

**モード切り替え:**

| コマンド | アクション | 元のモード |
|---|---|---|
| `Esc` | NORMAL モードへ | INSERT |
| `i` | カーソル前に挿入 | NORMAL |
| `I` | 行頭に挿入 | NORMAL |
| `a` | カーソル後に挿入 | NORMAL |
| `A` | 行末に挿入 | NORMAL |

**NORMAL モードのナビゲーション:**

| コマンド | アクション |
|---|---|
| `h`/`j`/`k`/`l` | 左/下/上/右に移動 |
| `w` / `e` / `b` | 次の単語 / 単語の末尾 / 前の単語 |
| `0` / `$` | 行頭 / 行末 |
| `gg` / `G` | 入力の先頭 / 末尾 |

### コマンド履歴

Claude Code はセッション中のコマンド履歴を管理します：

- `↑` / `↓` で前の入力を呼び出す
- `Ctrl+R` で逆順検索（検索ワードを入力し、`Ctrl+R` でさらに古いマッチを循環）
- 入力履歴はプロジェクトの作業ディレクトリごとに保存
- `/clear` を実行すると現在のセッション履歴はリセット（会話は保存される）

## まとめ

- `Ctrl+C`（キャンセル）、`Ctrl+L`（画面クリア）、`Ctrl+O`（詳細出力）など頻用ショートカットを覚える
- マルチライン入力は `\` + `Enter` が最も互換性が高い
- `Shift+Tab` でパーミッションモードを切り替え（Default → Auto-accept → Plan）
- `@` でファイル・ディレクトリ・MCP リソースをコンテキストに追加
- `/` から始まるコマンドで各種機能にアクセス
- `!` プレフィックスで bash コマンドを直接実行してコンテキストに追加

## 公式リファレンス

- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode) - 対話モードの完全ガイド
- [Skills](https://code.claude.com/docs/en/skills) - カスタムコマンドの作成
- [Checkpointing](https://code.claude.com/docs/en/checkpointing) - 巻き戻しと前の状態の復元
- [Permissions](https://code.claude.com/docs/en/permissions) - パーミッションモードの詳細
