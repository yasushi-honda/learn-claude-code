# キーバインドカスタマイズ

> 対応する公式ドキュメント: [Customize keyboard shortcuts](https://code.claude.com/docs/en/keybindings)

## 学習目標

- キーバインド設定ファイルの場所と構造を理解する
- カスタマイズ可能なアクションと構文を習得する
- デフォルトのキーバインド一覧を把握する
- キーバインドの無効化と競合解決の方法を理解する

## 概要

Claude Code はキーボードショートカットをカスタマイズできます。`~/.claude/keybindings.json` ファイルを編集することで、自分のワークフローに合ったショートカットを設定できます。変更は自動的に検出され、Claude Code の再起動なしに適用されます。

## 設定ファイルの作成・編集

```
/keybindings
```

このコマンドで `~/.claude/keybindings.json` を作成または開きます。

## 設定ファイルの構造

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "$docs": "https://code.claude.com/docs/en/keybindings",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+u": null
      }
    }
  ]
}
```

| フィールド | 説明 |
|----------|------|
| `$schema` | エディタのオートコンプリート用 JSON スキーマ URL（オプション） |
| `$docs` | ドキュメント URL（オプション） |
| `bindings` | コンテキスト別のバインディングブロックの配列 |

## コンテキスト

各バインディングブロックはコンテキストを指定します：

| コンテキスト | 説明 |
|-----------|------|
| `Global` | アプリ全体で適用 |
| `Chat` | メインのチャット入力エリア |
| `Autocomplete` | オートコンプリートメニューが開いているとき |
| `Settings` | 設定メニュー |
| `Confirmation` | 承認・確認ダイアログ |
| `Tabs` | タブナビゲーション |
| `Help` | ヘルプメニュー |
| `Transcript` | トランスクリプトビューア |
| `HistorySearch` | 履歴検索モード（Ctrl+R） |
| `Task` | バックグラウンドタスク実行中 |
| `DiffDialog` | diff ビューア |
| `ModelPicker` | モデル選択 |

## 主要アクション一覧

### アプリアクション（`Global` コンテキスト）

| アクション | デフォルト | 説明 |
|----------|----------|------|
| `app:interrupt` | `Ctrl+C` | 現在の操作をキャンセル |
| `app:exit` | `Ctrl+D` | Claude Code を終了 |
| `app:toggleTodos` | `Ctrl+T` | タスクリストの表示/非表示 |
| `app:toggleTranscript` | `Ctrl+O` | 詳細トランスクリプトの表示/非表示 |

### 履歴アクション

| アクション | デフォルト | 説明 |
|----------|----------|------|
| `history:search` | `Ctrl+R` | 履歴検索を開く |
| `history:previous` | `↑` | 前の履歴項目 |
| `history:next` | `↓` | 次の履歴項目 |

### チャットアクション（`Chat` コンテキスト）

| アクション | デフォルト | 説明 |
|----------|----------|------|
| `chat:cancel` | `Escape` | 現在の入力をキャンセル |
| `chat:cycleMode` | `Shift+Tab` | パーミッションモードをサイクル |
| `chat:modelPicker` | `Cmd+P` / `Meta+P` | モデルピッカーを開く |
| `chat:thinkingToggle` | `Cmd+T` / `Meta+T` | 拡張思考のトグル |
| `chat:submit` | `Enter` | メッセージを送信 |
| `chat:undo` | `Ctrl+_` | 最後のアクションを元に戻す |
| `chat:externalEditor` | `Ctrl+G` | 外部エディタで開く |
| `chat:stash` | `Ctrl+S` | 現在のプロンプトをスタッシュ |
| `chat:imagePaste` | `Ctrl+V` | 画像を貼り付け |

### タスクアクション（`Task` コンテキスト）

| アクション | デフォルト | 説明 |
|----------|----------|------|
| `task:background` | `Ctrl+B` | 現在のタスクをバックグラウンドに |

### diff アクション（`DiffDialog` コンテキスト）

| アクション | デフォルト | 説明 |
|----------|----------|------|
| `diff:dismiss` | `Escape` | diff ビューアを閉じる |
| `diff:previousSource` | `←` | 前の diff ソース |
| `diff:nextSource` | `→` | 次の diff ソース |
| `diff:previousFile` | `↑` | diff の前のファイル |
| `diff:nextFile` | `↓` | diff の次のファイル |

## キーストローク構文

### 修飾キー

`+` で区切って修飾キーを組み合わせます：

```
ctrl+k           # Control + K
shift+tab        # Shift + Tab
meta+p           # Meta/Command + P
ctrl+shift+c     # 複数の修飾キー
```

修飾キーのエイリアス：
- `ctrl` または `control`
- `alt`、`opt`、または `option`
- `shift`
- `meta`、`cmd`、または `command`

### 大文字の扱い

単独の大文字は Shift を意味します（例: `K` は `shift+k` と同じ）。ただし、修飾キーとの組み合わせ（`ctrl+K`）では Shift を意味しません（`ctrl+k` と同じ）。

### チョード（キーシーケンス）

スペースで区切ると順次入力のシーケンスになります：

```
ctrl+k ctrl+s    # Ctrl+K を押してから Ctrl+S
```

### 特殊キー

```
escape / esc     # Escape キー
enter / return   # Enter キー
tab              # Tab キー
space            # スペースバー
up / down / left / right  # 矢印キー
backspace / delete        # Delete キー
```

## カスタマイズ例

### 外部エディタを Ctrl+E に割り当てる

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor"
      }
    }
  ]
}
```

### Vim 風のナビゲーション

```json
{
  "bindings": [
    {
      "context": "Select",
      "bindings": {
        "j": "select:next",
        "k": "select:previous"
      }
    }
  ]
}
```

### 不要なショートカットを無効化

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+s": null,
        "ctrl+u": null
      }
    }
  ]
}
```

## 予約済みショートカット（変更不可）

| ショートカット | 理由 |
|-------------|------|
| `Ctrl+C` | ハードコードされた中断/キャンセル |
| `Ctrl+D` | ハードコードされた終了 |

## ターミナルの競合

一部のショートカットはターミナルマルチプレクサと競合する場合があります：

| ショートカット | 競合 |
|-------------|------|
| `Ctrl+B` | tmux プレフィックス（2回押しで送信） |
| `Ctrl+A` | GNU screen プレフィックス |
| `Ctrl+Z` | Unix プロセスサスペンド（SIGTSTP） |

## Vim モードとの連携

Vim モード（`/vim`）が有効な場合、キーバインドと Vim モードは独立して動作します：

- **Vim モード**: テキスト入力レベルで動作（カーソル移動・モード・モーション）
- **キーバインド**: コンポーネントレベルで動作（タスクトグル・送信など）
- Vim モードの Escape キーは INSERT から NORMAL に切り替える（`chat:cancel` はトリガーしない）
- ほとんどの Ctrl+キーショートカットは Vim モードを通過してキーバインドシステムに渡される
- Vim の NORMAL モードでは `?` がヘルプメニューを表示

## バリデーション

`/doctor` コマンドでキーバインドの警告を確認できます：

```
/doctor
```

確認される内容：
- JSON 解析エラー
- 無効なコンテキスト名
- 予約済みショートカットとの競合
- ターミナルマルチプレクサとの競合
- 同じコンテキスト内の重複バインディング

## まとめ

- キーバインドは `~/.claude/keybindings.json` で設定する
- `/keybindings` コマンドで設定ファイルを開く
- コンテキスト別にキーバインドを定義する（`Chat`、`Global` など）
- `null` を設定するとデフォルトショートカットを無効化できる
- `Ctrl+C` と `Ctrl+D` は変更できない
- `/doctor` でバリデーションエラーを確認できる

## 公式リファレンス

- [キーバインドカスタマイズ](https://code.claude.com/docs/en/keybindings)
- [インタラクティブモード](https://code.claude.com/docs/en/interactive-mode)
