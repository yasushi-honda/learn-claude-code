# ターミナル最適化

> 対応する公式ドキュメント: [Optimize your terminal setup](https://code.claude.com/docs/en/terminal-config)

## 学習目標

- Claude Code に最適なターミナル環境の設定方法を理解する
- 改行入力の方法とターミナル別の設定を習得する
- デスクトップ通知の有効化手順を覚える
- 長い入力を扱うベストプラクティスを理解する
- Vim モードの使い方を習得する

## 概要

Claude Code はターミナル上で動作するツールです。ターミナルを適切に設定することで、より快適に作業できます。テーマ・フォント・改行ショートカット・通知機能など、いくつかの設定を行うことで Claude Code の体験が大幅に向上します。

## テーマと外観

Claude Code 自体のテーマはターミナルアプリケーションが制御します。Claude Code の UI テーマは `/config` コマンドでいつでも変更できます。

ターミナル下部に表示されるステータスラインは、カスタムステータスラインを設定することで、現在使用中のモデル・作業ディレクトリ・Git ブランチなどの情報を表示できます。詳細は [Week 4: 出力スタイル設定](../week-04_configuration/07-output-styles.md) を参照してください。

## 改行の設定

Claude Code でプロンプトを入力する際に改行を入れる方法はいくつかあります。

### 方法 1: バックスラッシュ + Enter

どのターミナルでも使える最も簡単な方法です：

```
\ + Enter
```

`\` を入力してすぐに Enter を押すと、改行が挿入されます。

### 方法 2: Shift+Enter（一部のターミナルでネイティブサポート）

以下のターミナルは設定なしで Shift+Enter が使えます：

- **iTerm2**
- **WezTerm**
- **Ghostty**
- **Kitty**

### 方法 3: /terminal-setup コマンドで自動設定

上記のターミナル以外では、Claude Code 内から `/terminal-setup` を実行することで自動設定できます。

```
/terminal-setup
```

このコマンドは以下のターミナルに対して Shift+Enter を自動設定します：
- VS Code
- Alacritty
- Zed
- Warp

> **注意**: `/terminal-setup` コマンドは、設定が必要なターミナルでのみ表示されます。iTerm2・WezTerm・Ghostty・Kitty ではこのコマンドは表示されません。

### Option+Enter の設定（VS Code、iTerm2、macOS Terminal.app）

#### macOS Terminal.app

1. 設定 → プロファイル → キーボード を開く
2. 「Option キーをメタキーとして使用」をチェック

#### iTerm2 と VS Code ターミナル

1. 設定 → プロファイル → キー を開く
2. 「全般」タブで、Left/Right Option キーを「Esc+」に設定

## 通知設定

Claude Code が作業を完了して入力待ちになると、通知イベントが発生します。この通知をデスクトップ通知として表示できます。

### ターミナル別の通知設定

| ターミナル | 設定方法 |
|-----------|---------|
| **Kitty** | 追加設定なしでデスクトップ通知をサポート |
| **Ghostty** | 追加設定なしでデスクトップ通知をサポート |
| **iTerm2** | 設定が必要（下記参照） |
| **macOS Terminal** | ネイティブ通知非対応（フックを使用） |

#### iTerm2 での通知設定

1. iTerm2 の設定 → プロファイル → ターミナル を開く
2. 「通知センターアラート」を有効にする
3. 「アラートをフィルタ」をクリックし、「エスケープシーケンスで生成されたアラートを送信」をチェック

通知が表示されない場合は、OS の設定でターミナルアプリに通知権限が付与されているか確認してください。

### 通知フック

カスタム動作（サウンド再生やメッセージ送信など）を通知と連動させたい場合は、[通知フック](https://code.claude.com/docs/en/hooks#notification) を設定します。フックはターミナル通知と並行して動作します。

## 長い入力の処理

大量のコードや長い指示を扱う場合のベストプラクティス：

- **直接貼り付けは避ける**: 非常に長いコンテンツを貼り付けると、Claude Code が正しく処理できない場合があります
- **ファイルベースのワークフローを使う**: コンテンツをファイルに書き込んでから、Claude にそのファイルを読むよう指示する
- **VS Code の制限に注意**: VS Code のターミナルは長い貼り付けを切り捨てる場合があります

**例:**

```bash
# 直接貼り付けではなく
cat > /tmp/my-instructions.md << 'EOF'
以下の処理を実装してください...
（長い指示）
EOF

# Claude に読ませる
claude "Please read /tmp/my-instructions.md and implement the feature described"
```

## Vim モード

Claude Code は Vim キーバインドのサブセットをサポートしています。

### 有効化方法

```
/vim
```

または `/config` コマンドからも設定できます。

### サポートされているキーバインド

| カテゴリ | キー |
|---------|------|
| モード切替 | `Esc`（NORMAL）、`i/I/a/A/o/O`（INSERT） |
| カーソル移動 | `h/j/k/l`、`w/e/b`、`0/$`、`gg/G` |
| 検索移動 | `f/F/t/T` + `;/,` |
| 編集 | `x`、`dw/de/db/dd/D`、`cw/ce/cb/cc/C`、`.`（繰り返し） |
| ヤンク/ペースト | `yy/Y`、`yw/ye/yb`、`p/P` |
| テキストオブジェクト | `iw/aw`、`iW/aW`、`i"/a"`、`i'/a'`、`i(/a(`、`i[/a[`、`i{/a{` |
| インデント | `>>/<<` |
| 行操作 | `J`（行を結合） |

## まとめ

- テーマは `/config` コマンドで変更する
- 改行は `\` + Enter、または Shift+Enter（対応ターミナル）
- `/terminal-setup` でターミナルの自動設定が可能
- デスクトップ通知は各ターミナルの設定で有効化できる
- 長い入力はファイルベースのワークフローを使う
- `/vim` で Vim キーバインドを有効化できる

## 公式リファレンス

- [ターミナル設定](https://code.claude.com/docs/en/terminal-config)
- [インタラクティブモード（Vim モード詳細）](https://code.claude.com/docs/en/interactive-mode#vim-editor-mode)
- [フック（通知フック）](https://code.claude.com/docs/en/hooks#notification)
