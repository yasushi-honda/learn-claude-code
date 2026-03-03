# JetBrains IDE 統合

> 対応する公式ドキュメント: [JetBrains IDEs](https://code.claude.com/docs/en/jetbrains)

## 学習目標

- JetBrains プラグインをインストールする方法を理解する
- 対応 IDE の種類を把握する
- インタラクティブdiff 表示と選択コンテキスト共有を使いこなす
- IDE 設定のカスタマイズ方法を習得する

## 概要

Claude Code は JetBrains IDE 向けのプラグインを提供しており、IDE 内で直接 Claude Code を利用できます。インタラクティブなdiff 表示、選択テキストのコンテキスト自動共有、ファイル参照ショートカットなど、IDE との深い統合機能を備えています。

## 対応 IDE

以下の JetBrains IDE に対応しています：

- **IntelliJ IDEA**（Java・Kotlin 開発）
- **PyCharm**（Python 開発）
- **Android Studio**（Android 開発）
- **WebStorm**（JavaScript・TypeScript 開発）
- **PhpStorm**（PHP 開発）
- **GoLand**（Go 開発）

## プラグインのインストール

### JetBrains Marketplace からインストール

1. [JetBrains Marketplace の Claude Code Beta ページ](https://plugins.jetbrains.com/plugin/27310-claude-code-beta-) を開く
2. **Install** をクリック
3. IDE を完全に再起動する

> **注意**: インストール後は IDE を完全に再起動する必要があります。複数回の再起動が必要な場合もあります。

### Claude Code CLI のインストール

プラグインを使用するには Claude Code CLI も必要です。未インストールの場合は、[クイックスタートガイド](https://code.claude.com/docs/en/quickstart) を参照してください。

## 主要機能

### クイック起動

IDE から Claude Code をすばやく開く方法：

- `Cmd+Esc`（Mac）または `Ctrl+Esc`（Windows/Linux）で Claude Code を直接起動
- UI の Claude Code ボタンをクリック

### diff ビューア

コードの変更を IDE の diff ビューア内で直接表示できます。ターミナルの diff 表示ではなく、IDE のネイティブな UI で変更内容を確認・承認できます。

### 選択コンテキストの共有

IDE での現在の選択範囲やタブが Claude Code に自動的に共有されます。作業中のファイルや選択したコードを明示的に指定しなくても、Claude がそのコンテキストを認識します。

### ファイル参照ショートカット

`Cmd+Option+K`（Mac）または `Alt+Ctrl+K`（Linux/Windows）で、ファイル参照を挿入できます（例: `@File#L1-99`）。

### 診断情報の共有

IDE のリントエラーや構文エラーなどの診断情報が、作業中に自動的に Claude に共有されます。

## 使い方

### IDE の統合ターミナルから使用

IDE の統合ターミナルで `claude` を起動すると、すべての統合機能が有効になります：

```bash
claude
```

### 外部ターミナルから使用

外部ターミナルを使用する場合は、`/ide` コマンドで JetBrains IDE に接続します：

```bash
claude
> /ide
```

## 設定

### Claude Code の設定

IDE 統合の設定は Claude Code の設定から行います：

1. `claude` を起動
2. `/config` コマンドを入力
3. diff ツールを `auto`（IDE 自動検出）に設定

### プラグイン設定

**Settings → Tools → Claude Code [Beta]** から以下を設定できます：

| 設定項目 | 説明 |
|---------|------|
| **Claude コマンド** | Claude の起動コマンドを指定（例: `claude`、`/usr/local/bin/claude`、`npx @anthropic/claude`） |
| **コマンドが見つからない場合の通知を抑制** | Claude コマンドが見つからない場合の通知をスキップ |
| **Option+Enter でマルチラインプロンプト**（macOS のみ） | Option+Enter で Claude Code プロンプトに改行を挿入 |
| **自動更新を有効化** | プラグインの更新を自動的に確認してインストール |

#### WSL ユーザーの設定

WSL を使用する場合、Claude コマンドを以下のように設定します：

```
wsl -d Ubuntu -- bash -lic "claude"
```

（`Ubuntu` は使用している WSL ディストリビューション名に置き換えてください）

### ESC キーの設定

JetBrains ターミナルで ESC キーが Claude Code の操作を中断しない場合：

1. **Settings → Tools → Terminal** を開く
2. 以下のいずれかを実行：
   - 「Escape でエディタにフォーカスを移動」のチェックを外す
   - 「ターミナルキーバインドを設定」をクリックし、「Switch focus to Editor」ショートカットを削除
3. 変更を適用

## 特殊な設定

### リモート開発

JetBrains Remote Development を使用する場合、プラグインをリモートホストにインストールする必要があります：

**Settings → Plugin (Host)** からインストールします。ローカルクライアントマシンではなく、リモートホストにインストールしてください。

### WSL の設定

WSL ユーザーは IDE 検出のために追加設定が必要な場合があります：

- ターミナル設定の適切な構成
- ネットワークモードの調整
- ファイアウォール設定の更新

詳細は [WSL トラブルシューティングガイド](https://code.claude.com/docs/en/troubleshooting#jetbrains-ide-not-detected-on-wsl2) を参照してください。

## セキュリティに関する注意

自動編集パーミッションが有効な状態で JetBrains IDE 内で Claude Code を実行する場合、IDE が自動的に実行する可能性のある設定ファイルを変更できる可能性があります。

JetBrains IDE での実行時は：
- 編集には手動承認モードを使用する
- 信頼できるプロンプトのみで Claude を使用するよう注意する
- Claude Code がアクセスできるファイルを把握する

## トラブルシューティング

### プラグインが動作しない

- プロジェクトのルートディレクトリから Claude Code を起動しているか確認
- IDE 設定でプラグインが有効になっているか確認
- IDE を完全に再起動（複数回必要な場合もあり）
- Remote Development の場合は、プラグインがリモートホストにインストールされているか確認

### IDE が検出されない

- プラグインがインストール・有効化されているか確認
- IDE を完全に再起動
- 統合ターミナルから Claude Code を起動しているか確認

### コマンドが見つからない

1. Claude Code のインストール確認: `npm list -g @anthropic-ai/claude-code`
2. プラグイン設定で Claude コマンドのパスを設定
3. WSL ユーザーの場合は WSL コマンド形式を使用

## まとめ

- IntelliJ IDEA・PyCharm・WebStorm など主要 JetBrains IDE に対応
- JetBrains Marketplace からプラグインをインストール後、IDE を再起動
- 統合ターミナルから `claude` を起動するか、外部ターミナルで `/ide` で接続
- IDE ネイティブの diff ビューアで変更を確認できる
- 選択コンテキストと診断情報が自動的に Claude に共有される

## 公式リファレンス

- [JetBrains IDE](https://code.claude.com/docs/en/jetbrains)
- [トラブルシューティング](https://code.claude.com/docs/en/troubleshooting)
