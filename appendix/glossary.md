# 用語集

Claude Code に関連する重要用語の定義集です。

> **対応公式ドキュメント**: https://code.claude.com/docs/en/overview
> **最終更新**: 2026年3月

---

## 基本概念

### エージェントループ（Agentic Loop）
Claude がユーザーのタスクを達成するために、ツール呼び出し→結果評価→次のアクション決定を繰り返すサイクル。Claude はループの各ターンでファイルを読んだり、コマンドを実行したり、コードを編集したりしながら自律的に作業を進める。

### ターン（Turn）
エージェントループの1サイクル。Claude がツールを呼び出し、結果を受け取り、次のアクションを決定するまでを1ターンと数える。`--max-turns` フラグで最大ターン数を制限できる。

### コンテキストウィンドウ（Context Window）
Claude が一度に処理できるテキスト量の上限。会話履歴・ファイル内容・ツール結果などすべてがこの枠内に収まる必要がある。使用率が 70-80% を超えると品質が劣化するため、`/compact` による定期的な圧縮が推奨される。

### 拡張コンテキスト（Extended Context / 1M）
Opus 4.6 および Sonnet 4.6 で利用可能な 100万トークンのコンテキストウィンドウ。大規模なコードベースや長時間セッションに対応する。`/model` で `sonnet[1m]` のように `[1m]` サフィックスを付けて選択する。200K トークンを超える部分はロングコンテキスト料金が適用される。`CLAUDE_CODE_DISABLE_1M_CONTEXT=1` で無効化可能。

### コンパクション（Compaction）
`/compact` コマンドで実行する会話履歴の圧縮処理。長い会話を要約することでコンテキストウィンドウの使用量を削減し、品質の劣化を防ぐ。圧縮後も主要な文脈は維持される。オプションの指示テキストを渡すことで、特定のトピックに焦点を絞った圧縮も可能。

### セッション（Session）
Claude Code の一連の会話と作業の単位。`--resume` フラグや `/resume` コマンドで過去のセッションを再開できる。セッション履歴は `~/.claude/` 配下に保存される。`--fork-session` で再開時に新しいセッションIDを作成することもできる。

### チェックポイント（Checkpoint）
会話の任意の時点でコードと会話履歴の状態を保存する機能。`/rewind` コマンド（エイリアス: `/checkpoint`）で過去のチェックポイントに戻れる。`Esc` × 2 でも巻き戻し・要約ダイアログを表示可能。

---

## メモリ・設定

### CLAUDE.md
プロジェクトの規約や指示を Claude に伝えるためのメモリファイル。プロジェクトルートや `~/.claude/` に配置することで、Claude はセッション開始時に自動的に内容を読み込む。コーディング規約、ワークフロー、禁止事項などを記述する。`/memory` コマンドで編集・管理できる。

### 自動メモリ（Auto Memory）
Claude がセッションを跨いで情報を記憶する仕組み。`/memory` コマンドで有効化・無効化、Auto Memory エントリの閲覧が可能。プロジェクトの CLAUDE.md に学習した情報を自動保存する。

### 設定ファイル（Settings Files）
Claude Code の動作を制御する JSON 設定ファイル群。`~/.claude/settings.json`（ユーザー設定）、`.claude/settings.json`（プロジェクト設定）、`.claude/settings.local.json`（ローカル設定）の階層構造を持つ。マネージド設定（MDMポリシー、サーバーマネージド、ファイルベース）が最高優先度を持つ。

### Managed Settings
組織の管理者が配布する設定ファイル。ユーザーやプロジェクト設定より高い優先度を持ち、上書きできない。MDM ポリシー・ファイルベース・サーバーマネージドの3つの配布方法がある。`availableModels` によるモデル制限など、組織全体のポリシー適用に使用する。

### サーバーマネージド設定（Server-Managed Settings）
Anthropic のサーバーから配布される組織レベルの設定。管理者がコンソールから設定を更新すると、接続中の全 Claude Code インスタンスに自動反映される。パブリックベータとして提供されている。

### /.claude ディレクトリ
プロジェクトレベルの Claude 設定を保存するディレクトリ。`settings.json`・`settings.local.json`・`CLAUDE.md` のほか、ワークツリー（`worktrees/`）、スキル（`skills/`）、エージェント（`agents/`）を格納する。

---

## パーミッション・セキュリティ

### パーミッションモード（Permission Mode）
Claude がツールを使用する際の承認方式を制御するモード。`default`（都度確認）、`acceptEdits`（編集は自動承認）、`plan`（分析のみ・変更不可）、`dontAsk`（事前承認済みのみ）、`bypassPermissions`（全て自動承認）の5種類がある。`Shift+Tab` で切り替える。

### パーミッションルール（Permission Rule）
Claude がツールを使用する際の許可・拒否・確認要求を定義するルール。`Allow`・`Ask`・`Deny` の3種類があり、ツール名とオプションの指定子（例: `Bash(git commit *)`）で記述する。

### Plan Mode
Claude が実際のファイル変更やコマンド実行を行わず、計画・分析のみを行うモード。`Shift+Tab` で切り替えるか、`--permission-mode plan` フラグで起動できる。`/plan` コマンドでプロンプトから直接プランモードに入ることもできる。

### サンドボックス（Sandbox）
Claude Code の Bash ツール実行環境をOSレベルで隔離する機能。ファイルシステムアクセスやネットワーク接続を制限し、意図しない変更やセキュリティリスクを防ぐ。macOS では Seatbelt、Linux/WSL2 では bubblewrap を使用する。`/sandbox` コマンドで切り替え可能。Auto-allow モード（サンドボックス内は自動承認）と通常パーミッションモード（サンドボックス内でも都度確認）の2つのモードがある。

### Quality Gates
Agent Teams で使用されるフック。`TeammateIdle`（チームメイトがアイドルになる前に発火）と `TaskCompleted`（タスク完了時に発火）の2つのイベントで、exit code 2 を返すことで作業を続行させたり、完了を拒否してフィードバックを返すことができる。

---

## モデル・実行

### opusplan
Claude Code のモデル設定の1つで、Plan Mode（Shift+Tab）では Opus モデルを使用し、通常の実行モードでは Sonnet モデルを使用する。高品質な設計判断と低コストな実装を組み合わせることでコストパフォーマンスを最適化する。モデルエイリアスとして `/model opusplan` で設定可能。

### Effort Level
Opus 4.6 のアダプティブ推論を制御する設定。`low`・`medium`・`high`（デフォルト）の3段階があり、タスクの複雑さに応じて思考の深さを調整する。`/model` で左右矢印キーで調整、`CLAUDE_CODE_EFFORT_LEVEL` 環境変数、または settings の `effortLevel` で設定する。

### Fast Mode
同じモデルをより高速な出力設定で動作させるモード。`/fast` コマンドで切り替える。モデルの変更ではなく、出力処理の高速化のみが行われる。

### 拡張思考（Extended Thinking）
Claude が応答前に詳細な推論プロセスを実行するモード。`Alt+T`（macOS: `Option+T`）で切り替える。複雑な問題の解決や設計判断に有効。Skills で "ultrathink" キーワードを含めることでも有効化可能。

### Headless Mode
インタラクティブな UI を持たない非対話的な実行モード。`claude -p "query"` の形式で実行し、CI/CD パイプラインや自動化スクリプトから Claude を呼び出す際に使用する。`--output-format json` と組み合わせると結果をプログラムで処理できる。

---

## カスタマイズ・拡張

### Skills
ユーザーが定義したカスタムスキル（スラッシュコマンド）。`~/.claude/skills/<name>/SKILL.md` や `.claude/skills/<name>/SKILL.md` に Markdown ファイルとして配置し、`/skill-name` の形式で呼び出す。YAML frontmatter で動作を設定できる。旧 `.claude/commands/` との互換性あり。バンドルスキル（`/simplify`、`/batch`、`/debug`）も標準で提供されている。Agent Skills オープン標準に準拠。

### Hooks
Claude のツール実行前後やセッションライフサイクルの特定タイミングに任意のシェルコマンド、HTTP エンドポイント呼び出し、LLM プロンプトを自動実行する仕組み。`PreToolUse`・`PostToolUse`・`Notification`・`Stop`・`SubagentStop`・`TeammateIdle`・`TaskCompleted` などのイベントに対応する。settings.json で設定する。

### Plugins
Claude Code の機能を拡張するためのパッケージ。エージェント、スキル、フック、MCPサーバーをひとまとめにして配布できる。マーケットプレイス経由またはローカルディレクトリから読み込む。`/plugin` コマンドで管理する。

### MCP（Model Context Protocol）
Claude が外部ツールやサービスと連携するための標準プロトコル。MCPサーバーを設定することで、Slack・GitHub・データベース・ブラウザなど様々なサービスをツールとして利用できるようになる。設定は `~/.claude.json`（グローバル）、`.mcp.json`（プロジェクト）、managed-mcp.json（マネージド）で管理する。MCP Prompts はスラッシュコマンドとしても利用可能。

### Tool Search
多数のツールやプラグインが登録されている環境で、名前やキーワードから必要なツールを動的に検索・読み込みする機能。遅延読み込み（deferred tools）されたツールは使用前に Tool Search で明示的にロードする必要がある。

---

## エージェント・チーム

### サブエージェント（Sub-agents）
メインの Claude セッションが生成する専門化されたエージェント。コードレビュー・デバッグ・リサーチなど特定の役割を担う。組み込みの Explore エージェント・Plan エージェント・general-purpose エージェントのほか、`.claude/agents/` にカスタムエージェントを定義できる。`--agents` フラグでJSON形式の動的定義も可能。

### Agent Teams
複数の Claude Code インスタンスが協調して大規模なタスクを並列処理する仕組み（実験的機能）。チームリードが作業を分割し、複数のチームメイトが独立したタスクを同時に処理する。共有タスクリスト・メールボックスによるエージェント間通信・タスクの依存関係管理を備える。`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` で有効化する。in-process モードと split pane（tmux/iTerm2）モードがある。

### Explore エージェント
コードベースの調査に特化した組み込みサブエージェント。読み取り専用でファイルを探索し、アーキテクチャや実装の概要をレポートする。Haiku モデルで動作するためコスト効率が高い。

### Plan エージェント
複雑なタスクの計画立案に特化した組み込みサブエージェント。実装前にアーキテクチャ・リスク・依存関係を分析し、詳細な実装計画を生成する。

---

## リモート・連携

### Remote Control
Claude Code をローカルで実行しながら、claude.ai やモバイルアプリからリモートで操作する機能。`claude remote-control` コマンドまたは `/remote-control`（エイリアス: `/rc`）スラッシュコマンドで開始する。

### Teleport
claude.ai の Web セッションを、ローカルのターミナルセッションに引き継ぐ機能。`claude --teleport` フラグで起動する。Web で始めた作業をローカル環境で続けることができる。

### Worktree
Git のワークツリー機能を活用して、同一リポジトリで並列セッションを実行する機能。`claude -w feature-name` または `/worktree` コマンドで開始し、`.claude/worktrees/` 配下に隔離された作業環境を作成する。`/batch` スキルでも自動的に使用される。

### ウェブセッション（Web Session）
claude.ai 上で実行される Claude Code セッション。ローカル環境を持たないブラウザ上での作業が可能。`--remote` フラグで新しいウェブセッションを作成し、`Teleport` 機能でローカルターミナルに引き継げる。

---

## IDE・環境

### LSP（Language Server Protocol）
IDE（VS Code、JetBrains 等）が Claude Code と通信するためのプロトコル。IDE 拡張機能がこのプロトコルを使用して、エディタ内でのインライン提案・コード補完・エラー診断などの機能を提供する。`/ide` コマンドで統合の管理と状態表示ができる。

### devcontainer
開発コンテナの設定ファイル（`.devcontainer/`）。VS Code の Dev Containers 機能と連携し、コンテナ内で Claude Code を実行する標準化された開発環境を提供する。

### Status Line
ターミナルの下部に表示される Claude Code のステータスバー。現在のモデル・コンテキスト使用率・アカウント情報・PR レビュー状態などをリアルタイムで表示する。`/statusline` コマンドでカスタマイズ可能。

---

## 認証・プロバイダー

### OAuth
Claude Code の認証に使用するオープン標準プロトコル。`claude auth login` でブラウザを通じて Anthropic アカウントに認証し、セッショントークンを取得する。`--sso` フラグで SSO 認証を強制できる。

### API キー（API Key）
Anthropic API への直接アクセスに使用する認証キー。`ANTHROPIC_API_KEY` 環境変数に設定することで、OAuth ログインの代わりに使用できる。コンソール（console.anthropic.com）で管理する。

### Bedrock
AWS が提供するマネージド AI サービス。Claude モデルを AWS 環境から利用できる。`ANTHROPIC_API_KEY` の代わりに AWS 認証情報を使用し、データが AWS 環境内に留まるためコンプライアンス要件を満たしやすい。

### Vertex AI
Google Cloud が提供する AI プラットフォーム。Claude モデルを GCP 環境から利用できる。Google Cloud 認証情報を使用し、GCP のリージョン設定に従ってデータを保管する。

### Foundry（Microsoft Azure AI Foundry）
Microsoft Azure が提供する AI 開発プラットフォーム。Azure 環境から Claude モデルを利用できる。Azure の認証・セキュリティ・コンプライアンス体制を活用できる。

### LLM Gateway
企業が LLM への API リクエストを一元管理するためのプロキシサーバー。認証・ロギング・コスト管理・レート制限などを組織全体で統一的に適用できる。Claude Code は `ANTHROPIC_BASE_URL` 環境変数で Gateway を指定できる。

---

## データ・プライバシー

### ZDR（Zero Data Retention）
Anthropic との契約オプションで、API リクエストとレスポンスのデータを Anthropic 側に保持しないことを保証する設定。エンタープライズ契約で利用可能で、機密データを扱う組織向け。

### Rate Limit
API の使用量に対する速度制限。Pro/Max プランのサブスクリプション、または API キーのプランに応じた制限が設定されている。`/usage` コマンドで現在の使用状況を確認できる。`/extra-usage` で追加使用量の設定も可能。

### Budget（最大予算）
`--max-budget-usd` フラグで設定する API 呼び出しの上限コスト。設定した金額を超えると処理が停止する。ヘッドレスモードでのコスト管理に有用。

---

## 出力・表示

### 出力スタイル（Output Style）
Claude の応答スタイルを切り替える機能（`/output-style` コマンド）。`Default`（標準）、`Explanatory`（学習的な解説付き）、`Learning`（コードを自分で書く練習付き）から選べる。カスタムスタイルの作成も可能。

### Stream JSON
`--output-format stream-json` フラグで指定できる出力形式。Claude の応答をリアルタイムでストリーミングし、各イベントを JSON オブジェクトとして出力する。パイプラインや高度な自動化処理での利用に適している。

### Diff ビューアー（Diff Viewer）
`/diff` コマンドで開くインタラクティブな差分表示ツール。未コミットの変更と各ターンの変更を比較表示し、左右矢印キーで切り替えられる。

### フォーク（Fork）
現在の会話を分岐させて、別のアプローチを試す機能。`/fork` コマンドで実行し、元の会話を保持しながら新しいセッションを始められる。

### インサイト（Insights）
`/insights` コマンドで生成するセッション分析レポート。プロジェクト領域・インタラクションパターン・摩擦ポイントなどを分析し、利用状況の改善に役立てる。

---

## その他

### SDK（Agent SDK）
Claude Code をプログラムから制御するためのソフトウェア開発キット。`claude -p` のヘッドレスモード呼び出し、JSON 出力、`--json-schema` による構造化出力、セッション管理などの機能をアプリケーションから利用できる。

### ripgrep
Claude Code が内部検索に使用するファイル検索ツール。`Search` ツール、`@file` メンション、カスタムエージェント・スキルの検索に利用される。`USE_BUILTIN_RIPGREP=0` で外部インストールの ripgrep を使用できる。

### バックグラウンド実行（Background Execution）
長時間かかる処理を非同期で実行する機能。`Ctrl+B` キーまたはプロンプトで「バックグラウンドで実行」と指示することで、Claude は処理を継続しながら別のタスクを受け付けられる。tmux 使用時は2回押す。`CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` で無効化可能。

### Vimモード（Vim Mode）
Claude Code のプロンプト入力エリアで Vim キーバインディングを使用できるモード。`/vim` コマンドで切り替え、Normal モードと Insert モードを持つ。フルのナビゲーション・編集・テキストオブジェクト操作に対応。

### .gitignore
Git の除外設定ファイル。Claude Code の `Edit` および `Read` パーミッションルールは gitignore の仕様に準拠したパターン構文を使用する。

### セキュリティレビュー（Security Review）
`/security-review` コマンドで実行する、現在のブランチの変更に対するセキュリティ脆弱性分析。インジェクション・認証・データ露出などのリスクを検出する。

### Claude Console
Anthropic が提供する管理コンソール（console.anthropic.com）。APIキーの管理、使用量モニタリング、チームメンバーへのロール付与などを行う。企業向け利用では管理者が Claude Code のロールを割り当てる必要がある。

### ベータ機能（Beta Features）
`--betas` フラグで有効化できる試験的な機能。API キーユーザーのみが利用可能。`interleaved-thinking` などの先進的な機能が含まれる。

### タスクリスト（Task List）
Claude がマルチステップ作業の進捗を追跡するために自動生成するリスト。`Ctrl+T` で表示/非表示を切り替える。Agent Teams では共有タスクリストとして全メンバー間で状態を共有する。`CLAUDE_CODE_TASK_LIST_ID` でセッション間でタスクリストを共有可能。

### プロンプト提案（Prompt Suggestions）
Claude の応答後に表示される、次のアクションの候補。会話履歴やプロジェクトの git 履歴に基づいて生成される。`Tab` で承認、`Enter` で承認して送信。`CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false` で無効化可能。

---

> **公式リファレンス**
> - [Overview](https://code.claude.com/docs/en/overview)
> - [How Claude Code Works](https://code.claude.com/docs/en/how-claude-code-works)
> - [Settings](https://code.claude.com/docs/en/settings)
> - [Model Config](https://code.claude.com/docs/en/model-config)
> - [Skills](https://code.claude.com/docs/en/skills)
> - [Agent Teams](https://code.claude.com/docs/en/agent-teams)
