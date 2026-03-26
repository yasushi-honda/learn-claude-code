# JetBrains IDE 統合

> **対応公式ドキュメント**: https://code.claude.com/docs/en/jetbrains
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. JetBrains プラグインをインストールし、対応 IDE の種類を把握できる
2. クイック起動、diff ビューア、選択コンテキスト共有、ファイル参照ショートカットを使いこなせる
3. 外部ターミナルから `/ide` コマンドで JetBrains IDE に接続できる
4. WSL やリモート開発環境での設定方法を理解し、トラブルシューティングができる

---

## 1. 対応 IDE とインストール

### 対応する JetBrains IDE

Claude Code プラグインは以下の JetBrains IDE に対応しています：

| IDE | 主な用途 |
|-----|---------|
| **IntelliJ IDEA** | Java・Kotlin 開発 |
| **PyCharm** | Python 開発 |
| **Android Studio** | Android 開発 |
| **WebStorm** | JavaScript・TypeScript 開発 |
| **PhpStorm** | PHP 開発 |
| **GoLand** | Go 開発 |

### プラグインのインストール手順

**ステップ 1: JetBrains Marketplace からインストール**

1. [JetBrains Marketplace の Claude Code Beta ページ](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) を開く
2. **Install** をクリック
3. IDE が開いたら、プラグインのインストールを確認
4. IDE を**完全に再起動**する

> **公式ドキュメントより**: インストール後は IDE の完全な再起動が必要です。場合によっては複数回の再起動が必要なこともあります。

**ステップ 2: Claude Code CLI の確認**

プラグインを使用するには、Claude Code CLI もインストールされている必要があります。未インストールの場合は先に CLI をインストールしてください：

```bash
# インストール確認
npm list -g @anthropic-ai/claude-code

# 未インストールの場合
npm install -g @anthropic-ai/claude-code
```

**ステップ 3: 初回接続の確認**

1. IDE の統合ターミナルで `claude` を実行
2. 初回は Anthropic アカウントでのサインインを求められる
3. サインイン後、プラグインの統合機能が有効になっていることを確認
4. コードを選択して Claude Code に質問し、コンテキスト共有が動作することを確認

---

## 2. 主要機能

### クイック起動

IDE から Claude Code をすばやく開く方法：

| 操作 | ショートカット |
|-----|-------------|
| Claude Code を起動 | `Cmd+Esc`（Mac）/ `Ctrl+Esc`（Win/Linux） |
| UI ボタンから起動 | ツールバーの Claude Code ボタンをクリック |

### diff ビューア

Claude がコードを変更するとき、IDE の**ネイティブな diff ビューア**で変更内容を確認できます。ターミナルのテキストベースの diff ではなく、IDE の使い慣れた UI で以下の操作ができます：

- ファイルごとの変更箇所をサイドバイサイドで表示
- 各変更を個別に承認または拒否
- 変更前後のコードをハイライト付きで確認

### 選択コンテキストの自動共有

IDE でのテキスト選択や開いているタブの情報が、Claude Code に**自動的に共有**されます。明示的に指定しなくても、Claude は以下のコンテキストを認識します：

- エディタで現在選択しているコード範囲
- 現在開いているタブのファイル
- カーソルの位置情報

### ファイル参照ショートカット

`Cmd+Option+K`（Mac）/ `Alt+Ctrl+K`（Win/Linux）で、ファイル参照を Claude Code のプロンプトに挿入できます。

```
@File#L1-99
```

この形式で、ファイル名と行範囲を指定してコンテキストを共有します。

### 診断情報の共有

IDE のリントエラー、構文エラー、型チェックエラーなどの**診断情報（Diagnostics）**が、作業中に自動的に Claude に共有されます。手動でエラーメッセージをコピーする必要はありません。

これは JetBrains IDE の強力なコードインスペクション機能と Claude Code の連携により実現されています。例えば：

- **型エラー**: TypeScript や Java の型不整合が即座に Claude に伝わる
- **リントエラー**: ESLint、Pylint、ktlint 等の警告やエラー
- **未解決の参照**: インポートの不足や存在しない変数の使用
- **非推奨 API の使用**: deprecated なメソッドの使用警告

Claude はこれらの情報を自動的に考慮して、修正提案やコード変更を行います。

---

## 3. 使い方

### 統合ターミナルと外部ターミナルの比較

JetBrains IDE で Claude Code を使う方法は2つあります。それぞれの特徴を理解して選択してください。

| 方法 | メリット | デメリット |
|-----|---------|----------|
| **統合ターミナル** | 全統合機能が自動で有効、設定不要 | IDE のリソースを消費 |
| **外部ターミナル + `/ide`** | 独立したプロセスで安定、ターミナル機能が豊富 | `/ide` での手動接続が必要 |

### IDE の統合ターミナルから使用

最も簡単な方法は、IDE の統合ターミナルで直接 `claude` を起動することです：

```bash
claude
```

統合ターミナルから起動した場合、すべての統合機能（diff ビューア、選択コンテキスト、診断共有など）が自動的に有効になります。

### 外部ターミナルから接続する

外部ターミナル（iTerm2、Terminal.app など）を使う場合は、Claude Code 内で `/ide` コマンドを実行して JetBrains IDE に接続します：

```bash
# 外部ターミナルで Claude Code を起動
claude

# Claude Code 内で /ide を実行
> /ide
```

`/ide` を実行すると、稼働中の JetBrains IDE を検出して接続します。接続後は統合ターミナルと同様の機能が使えます。

---

## 4. プラグイン設定

### 設定画面へのアクセス

**Settings** → **Tools** → **Claude Code [Beta]** で以下を設定できます。

### 設定項目一覧

| 設定項目 | 説明 | デフォルト |
|---------|------|-----------|
| **Claude command** | Claude の起動コマンドを指定 | `claude` |
| **Suppress notification** | コマンド未検出時の通知を抑制 | OFF |
| **Option+Enter** (macOS) | Option+Enter で改行を挿入 | ON |
| **Auto-update** | プラグインの自動更新を有効化 | ON |

#### Claude command の設定例

```
claude                          # デフォルト
/usr/local/bin/claude           # フルパス指定
npx @anthropic/claude           # npx 経由
```

### ESC キーの設定

JetBrains IDE のターミナルで ESC キーを押すと、エディタにフォーカスが移動してしまい、Claude Code の操作が中断されることがあります。この問題を解決するには：

**方法 1: ターミナル設定を変更**

1. **Settings** → **Tools** → **Terminal** を開く
2. 「**Escape moves focus to editor**（Escape でエディタにフォーカスを移動）」のチェックを外す

**方法 2: ショートカットを削除**

1. **Settings** → **Tools** → **Terminal** → 「**Configure terminal keybindings**（ターミナルキーバインドを設定）」をクリック
2. 「**Switch focus to Editor**」ショートカットを削除

---

## 5. 特殊な環境での設定

### WSL（Windows Subsystem for Linux）

WSL を使用する場合、プラグイン設定の **Claude command** を以下のように設定します：

```
wsl -d Ubuntu -- bash -lic "claude"
```

`Ubuntu` の部分は、使用している WSL ディストリビューション名に置き換えてください。

WSL での IDE 検出に問題がある場合は、以下を確認してください：

- ターミナル設定の適切な構成
- ネットワークモードの調整（ミラーモード推奨）
- ファイアウォール設定の更新

詳細は [WSL トラブルシューティングガイド](https://code.claude.com/docs/en/troubleshooting#jetbrains-ide-not-detected-on-wsl2) を参照してください。

### リモート開発

JetBrains Remote Development を使用する場合、プラグインは**リモートホスト**にインストールする必要があります。

1. **Settings** → **Plugin (Host)** を開く
2. 「Claude Code Beta」を検索してインストール
3. リモートホスト側の IDE を再起動

> **公式ドキュメントより**: ローカルクライアントではなく、必ずリモートホスト側にプラグインをインストールしてください。

---

## 6. VS Code 拡張機能との比較

JetBrains プラグインと VS Code 拡張機能の違いを理解しておくと、環境選択の判断に役立ちます。

| 機能 | JetBrains プラグイン | VS Code 拡張機能 |
|-----|---------------------|-----------------|
| **diff 表示** | IDE ネイティブ diff ビューア | サイドバイサイド diff |
| **選択コンテキスト** | 自動共有 | @メンションで明示的に指定 |
| **ファイル参照** | `Cmd+Option+K` / `Alt+Ctrl+K` | `Option+K` / `Alt+K` |
| **診断情報** | 自動共有 | 自動共有 |
| **起動方法** | 統合ターミナル or `/ide` | パネル / タブ / ターミナル |
| **チェックポイント** | 対応（ターミナルベース） | 対応（GUI ボタン） |
| **ドラッグ&ドロップ** | 非対応 | Shift+ドラッグ対応 |
| **Chrome 連携** | 非対応 | `@browser` 対応 |

どちらも Claude Code の CLI をバックエンドとして使用するため、CLAUDE.md や settings.json の設定は共有されます。

---

## 7. セキュリティに関する注意

JetBrains IDE 内で Claude Code を使用する場合、**自動編集パーミッション**（auto-edit）が有効な状態では特に注意が必要です。

### リスク

JetBrains IDE が自動的に実行する可能性のある設定ファイル（`.idea/` 配下など）を Claude が変更できてしまう場合があります。

### 推奨プラクティス

| 推奨事項 | 説明 |
|---------|------|
| **手動承認モードを使う** | 重要なプロジェクトでは編集に手動承認モードを使用する |
| **プロンプトの信頼性** | 信頼できるプロンプトのみで Claude を使用する |
| **アクセス範囲の把握** | Claude Code がアクセスできるファイル範囲を把握しておく |

---

## ハンズオン演習

### 演習 1: プラグインのインストールと基本操作

**目的**: JetBrains IDE にプラグインをインストールし、基本的な操作を体験する

**前提条件**: JetBrains IDE（IntelliJ IDEA、PyCharm、WebStorm 等）がインストール済み、Claude Code CLI がインストール済み

**手順**:

1. [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) からプラグインをインストール
2. IDE を完全に再起動する
3. `Cmd+Esc`（Mac）/ `Ctrl+Esc`（Win/Linux）で Claude Code を起動する
4. ソースファイルを開き、数行のコードを選択する
5. Claude Code のプロンプトに「選択したコードの処理を説明してください」と入力して送信
6. Claude が選択コンテキストを認識していることを確認する

**期待される結果**: Claude Code が IDE 内で起動し、選択したコードについて正確に説明すること

### 演習 2: diff ビューアとファイル参照

**目的**: IDE ネイティブの diff ビューアで変更を確認し、ファイル参照ショートカットを使う

**前提条件**: 演習 1 が完了していること

**手順**:

1. ソースファイルを開き、Claude に変更を依頼する（例: 「この関数にログ出力を追加して」）
2. IDE の diff ビューアで変更内容を確認する
3. 変更を承認する
4. 別のファイルを開き、`Cmd+Option+K`（Mac）/ `Alt+Ctrl+K`（Win/Linux）でファイル参照を挿入する
5. 「このファイルの構造を教えて」と送信する

**期待される結果**: diff ビューアで変更を視覚的に確認でき、ファイル参照ショートカットでコンテキストが正しく共有されること

### 演習 3: 外部ターミナルからの IDE 接続

**目的**: 外部ターミナルで起動した Claude Code を JetBrains IDE に接続する

**前提条件**: JetBrains IDE が起動中であること

**手順**:

1. iTerm2 や Terminal.app など外部ターミナルを開く
2. プロジェクトディレクトリに移動して `claude` を起動する
3. `/ide` コマンドを実行する
4. JetBrains IDE が検出されることを確認する
5. 外部ターミナルからコード変更を依頼し、IDE 内で diff が表示されることを確認する

**期待される結果**: 外部ターミナルからでも `/ide` 経由で JetBrains IDE の統合機能（diff ビューア、コンテキスト共有）が利用できること

---

## よくある質問

**Q: プラグインをインストールしたのに動作しません**
A: 以下を順に確認してください。(1) IDE を完全に再起動したか（複数回必要な場合あり）。(2) プラグインが有効になっているか（Settings → Plugins で確認）。(3) Claude Code CLI がインストールされているか（`npm list -g @anthropic-ai/claude-code`）。(4) プロジェクトのルートディレクトリから起動しているか。

**Q: IDE が検出されません（`/ide` が失敗します）**
A: プラグインがインストール・有効化されているか確認してください。IDE の完全再起動も試してください。統合ターミナルから `claude` を起動する方法が最も確実です。

**Q: ESC キーで Claude Code の操作が中断されます**
A: Settings → Tools → Terminal で「Escape moves focus to editor」のチェックを外すか、ターミナルキーバインド設定で「Switch focus to Editor」ショートカットを削除してください。

**Q: WSL 環境で Claude Code が見つかりません**
A: プラグイン設定の Claude command を `wsl -d <ディストリビューション名> -- bash -lic "claude"` に設定してください。WSL2 のネットワーク設定やファイアウォールの問題がある場合は、公式のトラブルシューティングガイドを参照してください。

**Q: リモート開発環境で使えますか？**
A: はい。JetBrains Remote Development を使用する場合は、プラグインをリモートホスト側にインストールしてください。Settings → Plugin (Host) からインストールします。

**Q: VS Code と JetBrains のどちらを使うべきですか？**
A: 普段の開発で使い慣れている IDE を選んでください。JetBrains IDE は Java、Python、Go など言語固有の強力なインスペクション機能があり、その診断情報が自動的に Claude に共有されます。VS Code は @メンション、ドラッグ&ドロップ、Chrome 連携など独自の機能があります。

---

## トラブルシューティング

### プラグインが動作しない場合のチェックリスト

| # | 確認項目 | 対処方法 |
|---|---------|---------|
| 1 | プラグインがインストール・有効化されているか | Settings → Plugins で確認 |
| 2 | IDE を完全に再起動したか | 複数回の再起動を試す |
| 3 | Claude Code CLI がインストールされているか | `npm list -g @anthropic-ai/claude-code` で確認 |
| 4 | プロジェクトのルートから起動しているか | ルートディレクトリで `claude` を実行 |
| 5 | Remote Development の場合、ホスト側にインストールされているか | Settings → Plugin (Host) で確認 |

### よくあるエラーと解決策

**「Claude command not found」エラー**:
- Claude Code のインストールパスを確認: `which claude`
- プラグイン設定の Claude command にフルパスを設定: `/usr/local/bin/claude`

**diff ビューアが表示されない**:
- `/config` で diff ツールが `auto` に設定されているか確認
- IDE を再起動して統合ターミナルから `claude` を再起動

---

## まとめ

この章で学んだ重要ポイント：

- IntelliJ IDEA、PyCharm、Android Studio、WebStorm、PhpStorm、GoLand の6つの JetBrains IDE に対応
- JetBrains Marketplace からプラグインをインストール後、IDE の完全な再起動が必要
- `Cmd+Esc` / `Ctrl+Esc` でクイック起動、`Cmd+Option+K` / `Alt+Ctrl+K` でファイル参照挿入
- 選択コンテキストと診断情報が自動的に Claude に共有される
- 外部ターミナルからは `/ide` コマンドで JetBrains IDE に接続可能
- WSL ユーザーは Claude command の設定変更が必要

### 機能の組み合わせ例

JetBrains プラグインの各機能を組み合わせた実践的なワークフロー：

```
1. エディタで問題のあるコードを選択（選択コンテキスト自動共有）
2. Claude Code に「このコードのバグを修正して」と依頼
3. IDE の診断情報（リントエラー等）が自動的に Claude に伝わる
4. Claude が修正を提案 → diff ビューアで確認
5. 修正を承認 → IDE が自動的にファイルを更新
6. Cmd+Option+K で関連ファイルを参照し、「このファイルも同様に修正して」と依頼
```

## 次のステップ

次の章「デスクトップアプリ」では、Claude Code のスタンドアロンデスクトップアプリケーションについて学びます。並列セッション、ビジュアルdiff レビュー、PR 監視など、デスクトップならではの機能を習得します。

---

> **公式リファレンス**
> - [JetBrains IDE](https://code.claude.com/docs/en/jetbrains)
> - [トラブルシューティング](https://code.claude.com/docs/en/troubleshooting)
> - [WSL トラブルシューティング](https://code.claude.com/docs/en/troubleshooting#jetbrains-ide-not-detected-on-wsl2)
