# コマンドチートシート

Claude Code の全コマンド・フラグ・ショートカット一覧です。

---

## CLIコマンド

| コマンド | 説明 | 例 |
|---------|------|-----|
| `claude` | インタラクティブセッションを開始 | `claude` |
| `claude "query"` | 初期プロンプト付きでセッションを開始 | `claude "このプロジェクトを説明して"` |
| `claude -p "query"` | 非対話モードで実行して終了 | `claude -p "この関数を説明して"` |
| `cat file \| claude -p "query"` | パイプ経由でコンテンツを処理 | `cat logs.txt \| claude -p "エラーを説明して"` |
| `claude -c` | 現在のディレクトリの直近会話を継続 | `claude -c` |
| `claude -c -p "query"` | 直近会話を継続して非対話モードで実行 | `claude -c -p "型エラーを確認して"` |
| `claude -r "name" "query"` | IDまたは名前でセッションを再開 | `claude -r "auth-refactor" "このPRを完成させて"` |
| `claude update` | 最新バージョンに更新 | `claude update` |
| `claude auth login` | Anthropicアカウントにサインイン | `claude auth login --email user@example.com` |
| `claude auth logout` | アカウントからログアウト | `claude auth logout` |
| `claude auth status` | 認証状態をJSON形式で表示 | `claude auth status --text` |
| `claude agents` | 設定済みサブエージェントの一覧表示 | `claude agents` |
| `claude mcp` | MCPサーバーの設定 | `claude mcp` |
| `claude remote-control` | リモートコントロールセッションを開始 | `claude remote-control` |

---

## 主要CLIフラグ

### セッション管理

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--model` | 使用モデルを指定（`sonnet`・`opus` のエイリアス可） | `--model claude-sonnet-4-6` |
| `--continue`, `-c` | 現在ディレクトリの最新会話を読み込む | `claude -c` |
| `--resume`, `-r` | IDまたは名前でセッションを再開 | `claude -r "session-name"` |
| `--fork-session` | 再開時に新しいセッションIDを作成（`--resume`と組み合わせ） | `claude --resume abc123 --fork-session` |
| `--from-pr` | 特定のGitHub PRに紐づくセッションを再開 | `claude --from-pr 123` |
| `--session-id` | 特定のセッションIDを使用（有効なUUID必須） | `claude --session-id "550e8400-..."` |
| `--no-session-persistence` | セッションを保存せずに実行（printモードのみ） | `claude -p --no-session-persistence "query"` |

### 出力・フォーマット

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--print`, `-p` | 非対話モードでレスポンスを出力 | `claude -p "query"` |
| `--output-format` | 出力形式を指定（`text`・`json`・`stream-json`） | `claude -p --output-format json "query"` |
| `--input-format` | 入力形式を指定（`text`・`stream-json`） | `claude -p --input-format stream-json` |
| `--include-partial-messages` | ストリーミングイベントを含める（`stream-json`のみ） | `claude -p --output-format stream-json --include-partial-messages "query"` |
| `--verbose` | 詳細ログを有効化（ターンバイターンの出力） | `claude --verbose` |
| `--version`, `-v` | バージョン番号を表示 | `claude -v` |

### パーミッション・セキュリティ

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--permission-mode` | パーミッションモードを指定（`default`・`acceptEdits`・`plan`・`dontAsk`・`bypassPermissions`） | `claude --permission-mode plan` |
| `--allowedTools` | 承認なしで実行できるツールを指定 | `claude --allowedTools "Bash(git log *)" "Read"` |
| `--disallowedTools` | 使用不可にするツールを指定 | `claude --disallowedTools "Bash(git push *)"` |
| `--tools` | 使用可能なツールを制限（`""`で全無効化、`"default"`で全有効） | `claude --tools "Bash,Edit,Read"` |
| `--dangerously-skip-permissions` | 全パーミッション確認をスキップ（注意して使用） | `claude --dangerously-skip-permissions` |
| `--allow-dangerously-skip-permissions` | パーミッション無視を有効化オプションとして設定 | `claude --permission-mode plan --allow-dangerously-skip-permissions` |

### プロンプト・コンテキスト

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--system-prompt` | システムプロンプト全体を置換 | `claude --system-prompt "あなたはPython専門家です"` |
| `--system-prompt-file` | ファイルからシステムプロンプトを読み込んで置換（printのみ） | `claude -p --system-prompt-file ./prompt.txt "query"` |
| `--append-system-prompt` | デフォルトプロンプトの末尾に追記 | `claude --append-system-prompt "常にTypeScriptを使用"` |
| `--append-system-prompt-file` | ファイルの内容をデフォルトプロンプトに追記（printのみ） | `claude -p --append-system-prompt-file ./rules.txt "query"` |
| `--add-dir` | 追加の作業ディレクトリを設定 | `claude --add-dir ../apps ../lib` |

### 制限・コスト管理

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--max-turns` | エージェントのターン数上限（printモードのみ） | `claude -p --max-turns 3 "query"` |
| `--max-budget-usd` | API呼び出しの最大コスト（printモードのみ） | `claude -p --max-budget-usd 5.00 "query"` |
| `--fallback-model` | デフォルトモデルが過負荷時のフォールバックモデル（printのみ） | `claude -p --fallback-model sonnet "query"` |

### エージェント・MCP

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--agent` | 現在のセッションで使用するエージェントを指定 | `claude --agent my-custom-agent` |
| `--agents` | JSONでカスタムサブエージェントを動的に定義 | `claude --agents '{"reviewer":{"description":"...","prompt":"..."}}` |
| `--mcp-config` | JSONファイルまたは文字列からMCPサーバーを読み込む | `claude --mcp-config ./mcp.json` |
| `--strict-mcp-config` | `--mcp-config` のみ使用し他のMCP設定を無視 | `claude --strict-mcp-config --mcp-config ./mcp.json` |
| `--teammate-mode` | チームメイト表示方法（`auto`・`in-process`・`tmux`） | `claude --teammate-mode in-process` |
| `--plugin-dir` | セッション限定でプラグインを読み込むディレクトリ | `claude --plugin-dir ./my-plugins` |

### 統合・環境

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--chrome` | Chrome ブラウザ統合を有効化 | `claude --chrome` |
| `--no-chrome` | Chrome ブラウザ統合を無効化 | `claude --no-chrome` |
| `--ide` | 起動時に自動的にIDEに接続 | `claude --ide` |
| `--worktree`, `-w` | 隔離された Git ワークツリーで開始 | `claude -w feature-auth` |
| `--remote` | claude.ai に新しいウェブセッションを作成 | `claude --remote "ログインバグを修正"` |
| `--teleport` | ウェブセッションをローカルターミナルで継続 | `claude --teleport` |
| `--debug` | デバッグモードを有効化（カテゴリフィルタリング可） | `claude --debug "api,mcp"` |
| `--betas` | ベータ機能ヘッダーを含める（APIキーユーザーのみ） | `claude --betas interleaved-thinking` |

### 初期化・メンテナンス

| フラグ | 説明 | 例 |
|-------|------|-----|
| `--init` | 初期化フックを実行してインタラクティブモードを開始 | `claude --init` |
| `--init-only` | 初期化フックを実行して終了 | `claude --init-only` |
| `--maintenance` | メンテナンスフックを実行して終了 | `claude --maintenance` |
| `--setting-sources` | 読み込む設定ソースを指定（`user`・`project`・`local`） | `claude --setting-sources user,project` |
| `--settings` | 追加設定をJSONファイルまたは文字列で指定 | `claude --settings ./settings.json` |

---

## スラッシュコマンド

インタラクティブセッション中に `/` に続けてコマンドを入力します。

### セッション管理

| コマンド | 説明 |
|---------|------|
| `/clear` | 会話履歴を消去してコンテキストを解放（エイリアス: `/reset`, `/new`） |
| `/compact [instructions]` | オプションの指示付きで会話を圧縮 |
| `/resume [session]` | IDまたは名前でセッションを再開（エイリアス: `/continue`） |
| `/rename [name]` | 現在のセッションをリネーム |
| `/fork [name]` | 現在の会話をこの時点から分岐 |
| `/rewind` | コードや会話を前の時点に戻す（エイリアス: `/checkpoint`） |
| `/export [filename]` | 現在の会話をプレーンテキストとしてエクスポート |
| `/exit` | CLIを終了（エイリアス: `/quit`） |

### モデル・モード

| コマンド | 説明 |
|---------|------|
| `/model [model]` | AIモデルを選択または変更 |
| `/plan` | プロンプトから直接プランモードに入る |
| `/fast [on\|off]` | ファストモードのオン/オフを切り替え |
| `/vim` | Vimと通常編集モードを切り替え |
| `/output-style [style]` | 出力スタイルを切り替え（`Default`・`Explanatory`・`Learning`） |
| `/sandbox` | サンドボックスモードを切り替え |

### 設定・権限

| コマンド | 説明 |
|---------|------|
| `/config` | 設定インターフェースを開く（エイリアス: `/settings`） |
| `/permissions` | パーミッションの確認または更新（エイリアス: `/allowed-tools`） |
| `/hooks` | ツールイベントのフック設定を管理 |
| `/keybindings` | キーバインディング設定ファイルを開く/作成 |
| `/memory` | `CLAUDE.md` メモリファイルを編集・管理 |
| `/add-dir <path>` | 現在のセッションに新しい作業ディレクトリを追加 |
| `/statusline` | ステータスラインを設定 |
| `/theme` | カラーテーマを変更 |

### 診断・情報

| コマンド | 説明 |
|---------|------|
| `/help` | ヘルプと利用可能なコマンドを表示 |
| `/doctor` | インストールと設定を診断・確認 |
| `/status` | バージョン・モデル・アカウント・接続状態を表示 |
| `/cost` | トークン使用統計を表示 |
| `/usage` | プラン使用量とレート制限状態を表示 |
| `/stats` | 日次使用量・セッション履歴・ストリークを可視化 |
| `/context` | 現在のコンテキスト使用量をカラーグリッドで可視化 |
| `/insights` | セッション分析レポートを生成 |
| `/release-notes` | フルチェンジログを表示 |

### ツール・統合

| コマンド | 説明 |
|---------|------|
| `/mcp` | MCPサーバー接続とOAuth認証を管理 |
| `/agents` | エージェント設定を管理 |
| `/plugin` | Claude Code プラグインを管理 |
| `/skills` | 利用可能なスキルを一覧表示 |
| `/chrome` | Claude in Chrome の設定 |
| `/ide` | IDE統合の管理と状態表示 |
| `/sandbox` | サンドボックスモードを切り替え |

### GitHub・レビュー

| コマンド | 説明 |
|---------|------|
| `/review` | プルリクエストをレビュー（`gh` CLI必要） |
| `/pr-comments [PR]` | GitHub PRのコメントを取得・表示 |
| `/security-review` | 現在のブランチの変更をセキュリティ分析 |
| `/diff` | インタラクティブな差分ビューアーを開く |
| `/install-github-app` | Claude GitHub Actions アプリをセットアップ |

### リモート・モバイル

| コマンド | 説明 |
|---------|------|
| `/remote-control` | リモートコントロール用にセッションを公開（エイリアス: `/rc`） |
| `/remote-env` | テレポートセッションのデフォルトリモート環境を設定 |
| `/desktop` | Claude Code Desktop アプリでセッションを継続（エイリアス: `/app`） |
| `/mobile` | Claude モバイルアプリのQRコードを表示（エイリアス: `/ios`, `/android`） |

### ユーティリティ

| コマンド | 説明 |
|---------|------|
| `/init` | `CLAUDE.md` ガイドでプロジェクトを初期化 |
| `/copy` | 最後のアシスタント応答をクリップボードにコピー |
| `/tasks` | バックグラウンドタスクを一覧表示・管理 |
| `/login` | Anthropicアカウントにサインイン |
| `/logout` | Anthropicアカウントからサインアウト |
| `/feedback [report]` | Claude Code についてのフィードバックを送信（エイリアス: `/bug`） |
| `/terminal-setup` | Shift+Enter などのキーバインディングを設定 |

---

## キーボードショートカット

### 一般操作

| ショートカット | 説明 | コンテキスト |
|------------|------|------------|
| `Enter` | プロンプトを送信 | 標準入力 |
| `Shift+Enter` | 改行（マルチライン入力） | iTerm2, WezTerm, Ghostty, Kitty で設定不要 |
| `\` + `Enter` | 改行（全ターミナル対応） | 全てのターミナルで動作 |
| `Option+Enter` (macOS) | 改行 | macOS デフォルト |
| `Ctrl+J` | 改行（ラインフィード） | マルチライン入力 |
| `Ctrl+C` | 現在の入力または生成をキャンセル | 標準割り込み |
| `Ctrl+D` | Claude Code セッションを終了 | EOF シグナル |
| `Ctrl+L` | ターミナル画面をクリア | 会話履歴は保持 |
| `Ctrl+R` | コマンド履歴の逆順検索 | 過去のコマンドをインタラクティブに検索 |

### モード切り替え

| ショートカット | 説明 |
|------------|------|
| `Shift+Tab` | パーミッションモードを切り替え（通常→Auto-Accept→Plan→通常） |
| `Alt+M` (一部設定) | パーミッションモードを切り替え |
| `Option+P` (macOS) / `Alt+P` (Windows/Linux) | モデルを切り替え（プロンプトを消去せずに） |
| `Option+T` (macOS) / `Alt+T` (Windows/Linux) | 拡張思考モードを切り替え |
| `?` | 現在の環境で利用可能なショートカットを表示 |
| `Tab` | プロンプト提案を承認 |

### 表示・制御

| ショートカット | 説明 |
|------------|------|
| `Esc` | INSERT モードを終了（Vim使用時） |
| `Esc` × 2 | 会話を巻き戻す/要約する |
| `Ctrl+O` | 詳細出力の切り替え（ツール使用の詳細表示） |
| `Ctrl+T` | タスクリストの表示/非表示を切り替え |
| `Ctrl+G` | デフォルトテキストエディタでプロンプトを編集 |
| `Ctrl+B` | バックグラウンドでBashコマンド/エージェントを実行（tmux利用時は2回） |
| `Ctrl+F` | 全バックグラウンドエージェントを終了（3秒以内に2回押して確認） |

### テキスト編集

| ショートカット | 説明 |
|------------|------|
| `Ctrl+K` | 行末まで削除（削除テキストをバッファに保存） |
| `Ctrl+U` | 行全体を削除（削除テキストをバッファに保存） |
| `Ctrl+Y` | 削除テキストを貼り付け |
| `Alt+Y` | 貼り付け後に貼り付け履歴を循環（`Ctrl+Y`の後） |
| `Alt+B` | 1単語分カーソルを後退 |
| `Alt+F` | 1単語分カーソルを前進 |
| `↑` / `↓` | コマンド履歴をナビゲート |
| `←` / `→` | ダイアログタブを循環（パーミッションダイアログなど） |

### 画像・ファイル

| ショートカット | 説明 |
|------------|------|
| `Ctrl+V` / `Cmd+V` (iTerm2) / `Alt+V` (Windows) | クリップボードから画像を貼り付け |
| `@` + パス | ファイルパスのオートコンプリートを起動 |
| `!` + コマンド | Bashコマンドを直接実行してコンテキストに追加 |

---

## パーミッションモード切り替え

### Shift+Tab での切り替え

`Shift+Tab` を押すたびに以下の順序でモードが切り替わります：

```
通常モード → Auto-Accept モード → Plan モード → 通常モード → ...
```

### 各モードの説明

| モード | 説明 | 用途 |
|-------|------|------|
| 通常モード（`default`） | 新しいツール使用のたびに確認を求める | デフォルト |
| Auto-Accept（`acceptEdits`） | ファイル編集を自動承認する | 高速な実装作業 |
| Plan モード（`plan`） | 分析のみ・ファイル変更やコマンド実行を行わない | 設計・レビュー |
| dontAsk | 事前承認済みのツールのみ実行 | 自動化・CI/CD |
| bypassPermissions | 全確認をスキップ（隔離環境でのみ使用） | コンテナ環境 |

### CLIフラグでの設定

```bash
# Plan モードで起動
claude --permission-mode plan

# Auto-Accept モードで起動
claude --permission-mode acceptEdits

# 全確認スキップ（注意して使用）
claude --dangerously-skip-permissions
```

### settings.json での永続設定

```json
{
  "defaultMode": "acceptEdits"
}
```

---

## よく使うワークフロー

### 新しいプロジェクトの開始

```bash
cd my-project
claude --init    # CLAUDE.md を生成
claude          # セッション開始
```

### 非対話モードでの利用（CI/CD）

```bash
# JSON出力
claude -p "コードをレビューして" --output-format json

# 最大コスト制限付き
claude -p "バグを修正して" --max-budget-usd 1.00 --max-turns 10

# ファイルをパイプで渡す
cat error.log | claude -p "エラーの原因を分析して"
```

### セッションの管理

```bash
# 最新セッションを継続
claude -c

# 名前でセッションを再開
claude -r "feature-auth"

# PR番号でセッションを再開
claude --from-pr 123
```

### ワークツリーでの並列作業

```bash
# 隔離されたワークツリーで新機能開発
claude -w feature-login

# 別のワークツリーでバグ修正
claude -w fix-memory-leak
```
