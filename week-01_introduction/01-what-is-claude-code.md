# Claude Code とは何か

> **対応公式ドキュメント**: https://code.claude.com/docs/en/overview
> **想定所要時間**: 約60分
> **難易度**: ★☆☆☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude Code の定義と「エージェント型コーディングツール」としての位置づけを説明できる
2. 他の AI コーディングツールとの根本的な違いを理解する
3. Claude Code でできることの全体像を把握する
4. 利用できる環境・インターフェースを列挙できる

---

## 1. Claude Code とは

### 定義

Claude Code は、Anthropic が開発した**エージェント型 AI コーディングツール**です。「エージェント型」とは、単にコードを補完するのではなく、プロジェクト全体を読み込み、ファイルを編集し、コマンドを実行し、その結果を検証するという一連の作業を自律的に繰り返す能力を持つことを意味します。

> **公式ドキュメントより**: Claude Code はコードベースを読み込み、ファイルを編集し、コマンドを実行し、開発ツールと統合する AI コーディングアシスタントです。ターミナル、IDE、デスクトップアプリ、ブラウザで利用できます。

### Anthropic と Claude について

Claude Code は **Anthropic** 社が開発しています。Anthropic は AI の安全性研究を重視する企業で、Claude ファミリーの AI モデルを開発しています。Claude Code はこの Claude モデルの上に構築されたコーディング特化のツールです。

Claude モデルには複数のバリエーション（Sonnet、Opus 等）があり、Claude Code はタスクの性質に応じてこれらのモデルを使い分けます（詳細は第4章で解説）。

### 成長と実績

2025年にリリースされた Claude Code は急速に普及し、2026年現在、**GitHub のパブリックコミットの約4%** を占めるまでに成長しています。この数字は、Claude Code が実験的なツールではなく、プロダクション環境で日常的に使われる開発ツールとして定着していることを示しています。

この急速な普及の背景には、以下の要因があります：

- **低い導入障壁**: インストールが数分で完了し、既存のプロジェクトでそのまま使える
- **高い汎用性**: 言語・フレームワークを問わず動作する
- **実用的な品質**: 生成されるコードがプロダクションレベルで使える
- **柔軟なカスタマイズ**: CLAUDE.md や Skills でチームの規約に合わせられる

### 従来のツールとの決定的な違い

Claude Code を理解するために、従来の AI コーディングアシスタントと比較してみましょう。

| 観点 | 従来の AI コードアシスタント | Claude Code |
|---|---|---|
| **スコープ** | 現在のファイル・選択範囲 | プロジェクト全体 |
| **操作** | サジェスト・補完の提示 | 実際にファイルを編集・コマンドを実行 |
| **連携** | エディタプラグインのみ | Git・テスト・CI/CD・外部サービス |
| **自律性** | ユーザーが逐次承認 | エージェントが自律的に複数ステップを実行 |
| **カスタマイズ** | ほぼなし | CLAUDE.md・Skills・Hooks・MCP |

**要するに**: 従来のツールは「賢いオートコンプリート」ですが、Claude Code は「ペアプログラマー」です。ファイルを探し、コードを読み、変更し、テストを走らせ、結果を検証するところまで自分で実行します。

### 具体的なシナリオで比較する

**シナリオ: 「ユーザー一覧 API にページネーションを追加する」**

従来の AI コードアシスタントの場合:
1. 対象ファイルを自分で開く
2. カーソルを関数の近くに置く
3. コード補完のサジェストを受け取る
4. サジェストを確認して取り込む
5. 関連ファイル（型定義、テスト、フロントエンド等）も自分で開いて同様に繰り返す
6. テストを自分で実行する

Claude Code の場合:
```bash
claude "add pagination to the user list API endpoint with limit and offset parameters"
```
1. Claude Code が関連ファイルを自動的に特定（API ルート、コントローラー、型定義、テスト）
2. すべてのファイルに対して一貫した変更を実施
3. テストを更新して実行
4. 結果を検証し、必要に応じて修正

**差は明らかです**: 従来のツールでは開発者がファイル間のナビゲーションと整合性の管理を行いますが、Claude Code はそれを自動化します。

---

## 2. Claude Code でできること

Claude Code の能力は多岐にわたります。以下に主要なユースケースを紹介します。

### 自動化タスク

テスト追加、lint エラーの一括修正、依存関係の更新など、手作業では時間がかかるタスクを自動化できます。

```bash
# テストの自動生成・実行・修正
claude "write tests for the auth module, run them, and fix any failures"

# プロジェクト全体の lint エラー修正
claude "fix all ESLint errors in the project"

# 依存関係の更新
claude "update all outdated npm packages and fix any breaking changes"

# マージコンフリクトの解決
claude "resolve all merge conflicts, keeping our changes for the API routes"

# リリースノートの作成
claude "generate release notes from the commits since the last tag"
```

ここで重要なのは、Claude Code は**単一のコマンドで複数のステップを実行する**という点です。例えば「テストを書いて実行し、失敗を修正する」という指示では、テストファイルの作成、テストランナーの実行、失敗の分析、コードの修正、再テストという5つ以上のステップを自律的に進めます。

### 機能開発・バグ修正

自然言語で機能要求やバグ報告を伝えるだけで、関連コードを特定し、修正を実装します。

```bash
# バグ修正
claude "there's a bug where users can submit empty forms - fix it"

# 機能追加
claude "add pagination to the user list API endpoint"

# リファクタリング
claude "refactor the authentication module to use async/await instead of callbacks"
```

Claude Code はエラーメッセージやスタックトレースを渡すだけでもバグを追跡できます。

```bash
# スタックトレースを直接渡してデバッグ
claude "I'm getting this error: TypeError: Cannot read property 'id' of undefined at UserService.getProfile (src/services/user.ts:42). Fix it."
```

### Git 操作

ステージング、コミット、ブランチ管理、プルリクエスト作成まで、Git ワークフロー全体を自然言語で操作できます。

```bash
# 変更内容を説明付きでコミット
claude commit

# ブランチ作成とコミット
claude "create a feature branch, commit my changes, and push"

# プルリクエスト作成
claude "create a PR with a description of the changes"
```

`claude commit` は特に便利なショートカットで、変更内容を自動的に分析し、適切なコミットメッセージを生成してくれます。

### MCP（Model Context Protocol）連携

MCP を通じて外部サービスと連携し、開発ワークフローを拡張できます。

| 連携先 | 活用例 |
|---|---|
| **Google Drive** | デザインドキュメントを参照して実装 |
| **Jira** | チケットの内容を読み、実装して完了に更新 |
| **Slack** | メッセージを取得し、バグレポートから PR を作成 |
| **データベース** | スキーマを参照して型安全なクエリを作成 |
| **カスタムツール** | 社内 API やツールとの連携 |

MCP は Claude Code の能力を大幅に拡張する仕組みです。詳細は Week 4 以降で学びます。

### パイプ・スクリプト処理

UNIX パイプと組み合わせて、既存のワークフローに Claude Code を組み込めます。

```bash
# ログ監視と異常検知
tail -f app.log | claude -p "Slack me if you see any anomalies"

# セキュリティレビュー
git diff main --name-only | claude -p "review these changed files for security issues"

# CI でのローカライズ自動化
claude -p "translate new strings into French and raise a PR for review"

# コードレビューの自動化
gh pr diff 123 | claude -p "review this PR for potential issues"
```

`-p` フラグ（SDK モード）を使うことで、Claude Code をスクリプトや CI/CD パイプラインの一部として組み込めます。詳細は第3章で学びます。

### Agent Teams と Agent SDK

**Agent Teams** は、複数の Claude Code エージェントを並列で起動し、大規模タスクを効率化する機能です。

```
リードエージェント
  ├── サブエージェント A: フロントエンド実装
  ├── サブエージェント B: バックエンド実装
  └── サブエージェント C: テスト作成
```

リードエージェントがサブタスクを割り当て、各サブエージェントが独立して作業し、結果をマージします。

さらに、**Agent SDK** を使えば、Claude Code のエージェント機能を活用したカスタムエージェントを構築することも可能です。特定のワークフロー（例：コードレビュー専用エージェント、デプロイ自動化エージェント）に特化したツールを作成し、チーム全体で共有できます。

### カスタマイズ機能

Claude Code は柔軟なカスタマイズが可能です。

| 機能 | 説明 | 用途 |
|---|---|---|
| **CLAUDE.md** | プロジェクトへの永続的な指示を記録するファイル | コーディング規約、プロジェクト構造の説明 |
| **Skills** | チームで共有できるカスタムコマンド | `/review-pr`、`/deploy` 等の定型作業 |
| **Hooks** | 特定のイベントに応じた自動処理 | ファイル編集後の自動フォーマット |
| **MCP サーバー** | 外部サービスとの接続 | DB、API、チャットツール連携 |

これらのカスタマイズ機能は後の週で詳しく学びますが、Claude Code を使い始めた直後から CLAUDE.md は活用できます。プロジェクトのルートに `CLAUDE.md` を作成し、コーディング規約やプロジェクト固有の指示を書いておくだけで、Claude Code がそれを自動的に読み込みます。

---

## 3. 利用可能な環境

Claude Code は多様なインターフェースで利用できます。すべてのインターフェースは同じ Claude Code エンジンに接続されているため、CLAUDE.md ファイル、設定、MCP サーバーはどの環境でも共通して機能します。

### 主要な利用環境

| 環境 | 説明 | 適したユースケース |
|---|---|---|
| **Terminal（CLI）** | フル機能のコマンドライン。すべての操作が可能 | 日常的な開発、スクリプト連携、CI/CD |
| **VS Code** | インライン diff、@メンション、プランレビュー | IDE から離れたくない場合 |
| **Desktop App** | 独立アプリ。複数セッションの並列実行 | 大規模プロジェクト、視覚的レビュー |
| **Web（claude.ai/code）** | ブラウザで動作。インストール不要 | 長時間タスク、リモートリポジトリ |
| **JetBrains** | IntelliJ IDEA、PyCharm、WebStorm 等 | JetBrains IDE ユーザー |
| **iOS アプリ** | モバイルからのセッション確認 | 外出先でのモニタリング |

本教材では **Terminal（CLI）** を中心に解説します。CLI で習得した知識はすべての環境に応用できます。

### その他のインテグレーション

| 環境 | 説明 |
|---|---|
| **Slack** | `@Claude` へのメンションでバグレポートを PR に変換 |
| **GitHub Actions** | PR レビューと Issue トリアージの自動化 |
| **GitLab CI/CD** | CI/CD パイプラインへの統合 |
| **Chrome** | ライブ Web アプリのデバッグ |
| **Remote Control** | ブラウザから手元の Claude Code セッションをリモート操作 |

> **公式ドキュメントより**: 本教材では Terminal（CLI）を中心に解説しますが、習得した知識はすべての環境に応用できます。

---

## 4. Claude Code のアーキテクチャ概要

Claude Code がどのように動作するかの概要を理解しておきましょう（詳細は第4章で解説します）。

### エージェントハーネス

Claude Code は「**エージェントハーネス**」として機能します。これは、AI モデル（Claude）にツール、コンテキスト管理、実行環境を提供するフレームワークです。

```
┌─────────────────────────────────────────┐
│           Claude Code (ハーネス)          │
│                                         │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ ツール群  │  │コンテキスト│  │ 実行環境 │ │
│  │          │  │  管理     │  │        │ │
│  └─────────┘  └──────────┘  └────────┘ │
│           ↕                             │
│  ┌──────────────────────────────────┐   │
│  │     Claude AI モデル              │   │
│  │  (Sonnet / Opus)                 │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### エージェントループ

Claude Code はタスクを受け取ると、以下の3フェーズを繰り返します。

1. **Gather context（コンテキスト収集）**: ファイルを読み、コードベースを検索し、状況を理解する
2. **Take action（アクション実行）**: ファイルを編集し、コマンドを実行する
3. **Verify results（結果検証）**: テストを走らせ、lint を確認し、変更が正しいか検証する

このループがタスク完了まで繰り返されます。詳細は第4章「エージェントループの仕組み」で深く掘り下げます。

### 実際の動作例

「ユーザー登録フォームにバリデーションを追加する」というタスクの場合、Claude Code は以下のように動作します。

```
[Gather] フォーム関連のファイルを検索（Search ツール）
[Gather] 既存のバリデーションロジックを確認（File ops ツール）
[Gather] テストの有無を確認（Search ツール）
[Action] バリデーション関数を実装（File ops ツール）
[Action] フォームコンポーネントにバリデーションを組み込み（File ops ツール）
[Verify] テストを実行して結果を確認（Execution ツール）
[Action] テスト失敗があれば修正（File ops ツール）
[Verify] テストを再実行して全パス確認（Execution ツール）
```

このように、Claude Code は単発のコード生成ではなく、**調査→実装→検証のサイクルを自律的に繰り返す**ことで、品質の高い成果物を生み出します。

---

## ハンズオン演習

### 演習 1: Claude Code の能力を整理する

**目的**: Claude Code の各機能を自分の言葉で分類し、理解を深める

**手順**:

1. 以下の表をコピーし、各タスクがどの能力カテゴリに該当するか分類してください

| タスク | カテゴリ |
|---|---|
| テストを書いて実行する | |
| コミットメッセージを作成する | |
| Jira のチケットを更新する | |
| lint エラーを修正する | |
| プルリクエストを作成する | |
| ファイル編集後に自動フォーマットする | |

2. カテゴリの選択肢: 自動化タスク / Git 操作 / MCP 連携 / カスタマイズ（Hooks）

**期待される結果**: 各タスクを正しいカテゴリに分類でき、Claude Code の機能範囲を把握できている

### 演習 2: 利用環境の選定

**目的**: 自分の開発ワークフローに最適な Claude Code の利用環境を選定する

**手順**:

1. 自分の普段の開発環境を書き出す（使用するエディタ、ターミナル、OS）
2. 本章の「利用可能な環境」セクションを参照し、最も適した Claude Code の利用環境を選ぶ
3. その環境を選んだ理由を1-2文で説明する

**期待される結果**: 自分の環境に最適な Claude Code のインターフェースを特定し、次章のインストールに備えられている

### 演習 3: 従来ツールとの比較

**目的**: Claude Code の特徴を従来のツールと比較して具体的に理解する

**手順**:

1. 普段使っている AI コーディングツール（GitHub Copilot、Cursor 等）を1つ選ぶ
2. 以下の観点で Claude Code との違いを書き出す:
   - スコープ（単一ファイル vs プロジェクト全体）
   - 操作（提案のみ vs 実行まで）
   - カスタマイズ性
3. Claude Code に切り替えた場合に最も恩恵を受けそうな作業を3つ挙げる

**期待される結果**: Claude Code の差別化ポイントを具体的に説明でき、自分のワークフローでの活用イメージが持てている

---

## よくある質問

**Q: Claude Code は無料で使えますか？**
A: Claude Code 自体は無料でインストールできますが、利用には Claude のアカウント（Pro / Max / Teams / Enterprise）または API アクセス（Console / Bedrock / Vertex / Foundry）が必要です。詳細は第5章「認証・アカウント設定」で解説します。

**Q: Claude Code はオフラインで動作しますか？**
A: いいえ。Claude Code はクラウド上の Claude AI モデルに接続して動作するため、インターネット接続が必要です。ただし、ファイルの読み書きやコマンド実行はローカルで行われます。

**Q: どのプログラミング言語に対応していますか？**
A: Claude Code は特定の言語に限定されません。Python、JavaScript/TypeScript、Go、Rust、Java、C/C++、Ruby、PHP など、あらゆるプログラミング言語に対応しています。Claude モデルがそのコードを読み解ける限り、言語を問わず利用できます。

**Q: プライベートなコードがクラウドに送信されますか？**
A: Claude Code はプロンプトとコンテキスト（読み込んだファイルの内容等）を Anthropic の API に送信します。Claude Pro/Max の場合、データはモデルのトレーニングには使用されません。企業向けには Bedrock/Vertex/Foundry 経由でのアクセスが利用可能で、より厳密なデータ管理が可能です。詳細は [Security](https://code.claude.com/docs/en/security) を参照してください。

**Q: Agent SDK とは何ですか？**
A: Agent SDK は、Claude Code のエージェント機能を活用してカスタムエージェントを構築するための SDK です。特定のワークフロー（例：コードレビュー専用エージェント、デプロイ自動化エージェント）に特化したツールを作成できます。

**Q: Claude Code と GitHub Copilot / Cursor は競合しますか？**
A: 必ずしも競合しません。Claude Code はプロジェクト全体を対象としたエージェント型ツールであり、単一ファイルのインラインサジェストを主とするツールとは異なるレイヤーで動作します。実際に両方を併用している開発者もいます。ただし、Claude Code 単体でも十分な開発体験を提供するため、多くの開発者は Claude Code に一本化しています。

**Q: Claude Code はどのようなプロジェクト規模に適していますか？**
A: 小さなスクリプトから大規模なモノレポまで、あらゆる規模のプロジェクトで利用できます。特にプロジェクトが大きくなるほど、コードベース全体を理解して作業するエージェント型の強みが発揮されます。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code は **エージェント型** の AI コーディングツールであり、プロジェクト全体を理解して自律的に作業を進める
- GitHub パブリックコミットの **約4%** を占めるまで成長し、実用的な開発ツールとして定着している
- ファイル編集・コマンド実行・Git 操作・外部サービス連携を **自然言語の指示だけ** で実行できる
- Terminal / VS Code / Desktop App / Web / JetBrains / iOS アプリなど **幅広い環境** で利用可能
- CLAUDE.md・Skills・Hooks・MCP による **高度なカスタマイズ** と、Agent SDK による **カスタムエージェント構築** が可能

## 次のステップ

次の章「インストール方法」では、自分の環境（macOS / Linux / Windows）に Claude Code をインストールする手順を学びます。

---

> **公式リファレンス**
> - [Claude Code Overview](https://code.claude.com/docs/en/overview) - 概要と利用環境
> - [Common Workflows](https://code.claude.com/docs/en/common-workflows) - 典型的なワークフロー
> - [Security](https://code.claude.com/docs/en/security) - セキュリティとデータの取り扱い
