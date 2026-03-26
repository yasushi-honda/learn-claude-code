# キーバインドカスタマイズ

> **対応公式ドキュメント**: https://code.claude.com/docs/en/keybindings
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. キーバインド設定ファイル（`~/.claude/keybindings.json`）の構造を理解し、カスタマイズできる
2. コンテキスト別のバインディング（Chat、Global、DiffDialog など）を使い分けられる
3. キーストローク構文（修飾キー、チョード、特殊キー）を正確に記述できる
4. ターミナルや Vim モードとの競合を理解し、`/doctor` で問題を診断できる

---

## 1. キーバインド設定の基本

Claude Code のキーボードショートカットは `~/.claude/keybindings.json` で完全にカスタマイズできます。変更は自動的に検出され、再起動なしに適用されます。

### 設定ファイルの作成

```
/keybindings
```

このコマンドで `~/.claude/keybindings.json` を作成または開きます。

### ファイルの基本構造

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

`null` を設定するとデフォルトのショートカットを無効化できます。

---

## 2. コンテキスト

各バインディングブロックは、どの画面で有効かを指定する「コンテキスト」を持ちます。

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

---

## 3. 主要アクション一覧

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
| `history:previous` | `Up` | 前の履歴項目 |
| `history:next` | `Down` | 次の履歴項目 |

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
| `diff:previousSource` | `Left` | 前の diff ソース |
| `diff:nextSource` | `Right` | 次の diff ソース |
| `diff:previousFile` | `Up` | diff の前のファイル |
| `diff:nextFile` | `Down` | diff の次のファイル |

---

## 4. キーストローク構文

### 修飾キー

`+` で区切って修飾キーを組み合わせます。

```
ctrl+k           # Control + K
shift+tab        # Shift + Tab
meta+p           # Meta/Command + P
ctrl+shift+c     # 複数の修飾キー
```

修飾キーのエイリアス：

| 修飾キー | エイリアス |
|---------|----------|
| Control | `ctrl`, `control` |
| Alt/Option | `alt`, `opt`, `option` |
| Shift | `shift` |
| Command/Meta | `meta`, `cmd`, `command` |

### 大文字の扱い

- 単独の大文字（`K`）は `shift+k` と同じ
- 修飾キーとの組み合わせ（`ctrl+K`）では Shift を意味しない（`ctrl+k` と同じ）

### チョード（キーシーケンス）

スペースで区切ると順次入力のシーケンスになります。

```
ctrl+k ctrl+s    # Ctrl+K を押してから Ctrl+S
```

### 特殊キー

```
escape / esc                  # Escape キー
enter / return                # Enter キー
tab                           # Tab キー
space                         # スペースバー
up / down / left / right      # 矢印キー
backspace / delete            # Delete キー
```

---

## 5. 予約済みショートカットとターミナルの競合

### 変更不可のショートカット

| ショートカット | 理由 |
|-------------|------|
| `Ctrl+C` | ハードコードされた中断/キャンセル |
| `Ctrl+D` | ハードコードされた終了 |

### ターミナルマルチプレクサとの競合

| ショートカット | 競合 | 回避方法 |
|-------------|------|---------|
| `Ctrl+B` | tmux プレフィックス | 2回押しで送信 |
| `Ctrl+A` | GNU screen プレフィックス | キーバインドで再割当て |
| `Ctrl+Z` | Unix プロセスサスペンド（SIGTSTP） | 避けるのが無難 |

### Vim モードとの連携

Vim モード（`/vim`）が有効な場合：

- **Vim モード**: テキスト入力レベルで動作（カーソル移動、モード、モーション）
- **キーバインド**: コンポーネントレベルで動作（タスクトグル、送信など）
- Vim モードの Escape は INSERT から NORMAL に切り替える（`chat:cancel` はトリガーしない）
- ほとんどの `Ctrl+` ショートカットは Vim モードを通過してキーバインドシステムに渡される
- Vim の NORMAL モードでは `?` がヘルプメニューを表示

---

## 6. 実践的なカスタマイズ例

### 開発者向けの効率的なセットアップ

```json
{
  "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+e": "chat:externalEditor",
        "ctrl+p": "chat:modelPicker"
      }
    },
    {
      "context": "DiffDialog",
      "bindings": {
        "j": "diff:nextFile",
        "k": "diff:previousFile"
      }
    }
  ]
}
```

### Vim ユーザー向けのセットアップ

Vim モードを使う場合は、Vim のキーバインドと競合しないよう注意が必要です。

```json
{
  "bindings": [
    {
      "context": "Select",
      "bindings": {
        "j": "select:next",
        "k": "select:previous"
      }
    },
    {
      "context": "DiffDialog",
      "bindings": {
        "h": "diff:previousSource",
        "l": "diff:nextSource",
        "j": "diff:nextFile",
        "k": "diff:previousFile"
      }
    }
  ]
}
```

### tmux ユーザー向けのセットアップ

tmux のプレフィックス（`Ctrl+B`）との競合を回避する設定です。

```json
{
  "bindings": [
    {
      "context": "Task",
      "bindings": {
        "ctrl+b": null,
        "ctrl+z": "task:background"
      }
    }
  ]
}
```

> **注意**: `Ctrl+Z` は Unix のプロセスサスペンドと競合する可能性があるため、他の選択肢も検討してください。

### チョードを活用した高度なバインディング

キーシーケンス（チョード）を使うと、単一キーの制約を超えた豊富なショートカットを設定できます。

```json
{
  "bindings": [
    {
      "context": "Chat",
      "bindings": {
        "ctrl+k ctrl+e": "chat:externalEditor",
        "ctrl+k ctrl+m": "chat:modelPicker",
        "ctrl+k ctrl+s": "chat:stash"
      }
    }
  ]
}
```

`ctrl+k` を「リーダーキー」として使い、続くキーで操作を分岐させるパターンです。

---

## 7. バリデーション

`/doctor` コマンドでキーバインドの問題を診断できます。

```
/doctor
```

確認される内容：

- JSON 解析エラー
- 無効なコンテキスト名
- 予約済みショートカットとの競合
- ターミナルマルチプレクサとの競合
- 同じコンテキスト内の重複バインディング

---

## ハンズオン演習

### 演習 1: 外部エディタのショートカットをカスタマイズする

**目的**: カスタムキーバインドを設定し、動作を確認する

**前提条件**: Claude Code がインストール済み

**手順**:

1. `/keybindings` コマンドで設定ファイルを開く

2. 外部エディタを `Ctrl+E` に割り当て:
   ```json
   {
     "$schema": "https://www.schemastore.org/claude-code-keybindings.json",
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

3. 保存後、Claude Code で `Ctrl+E` を押して外部エディタが開くことを確認

**期待される結果**: 自分で設定したショートカットが即座に反映される。

### 演習 2: 不要なショートカットを無効化する

**目的**: `null` で既存ショートカットを無効化する方法を習得する

**手順**:

1. 以下を `keybindings.json` に追加:
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

2. 保存後、`Ctrl+S` や `Ctrl+U` が反応しなくなったことを確認

**期待される結果**: `null` でショートカットを無効化でき、ターミナルとの競合を回避できる。

### 演習 3: /doctor でバリデーションを実行する

**目的**: キーバインドの問題を診断する方法を習得する

**手順**:

1. 意図的に重複するバインディングを作成:
   ```json
   {
     "bindings": [
       {
         "context": "Chat",
         "bindings": {
           "ctrl+e": "chat:externalEditor",
           "ctrl+e": "chat:stash"
         }
       }
     ]
   }
   ```

2. `/doctor` を実行して警告を確認

3. 重複を解消して再度 `/doctor` で問題がないことを確認

**期待される結果**: `/doctor` が重複バインディングを検出し、修正の指針を示す。

---

## よくある質問

**Q: キーバインドの変更は再起動が必要ですか？**
A: いいえ。`keybindings.json` の変更は自動的に検出され、即座に反映されます。

**Q: tmux を使っていますが、Ctrl+B が競合します。どうすればいいですか？**
A: tmux では `Ctrl+B` を2回押すことで Claude Code にキーが渡されます。頻繁に使う場合は、`task:background` アクションを別のキーに割り当てることを検討してください。

**Q: Vim モードとキーバインドは同時に使えますか？**
A: はい。Vim モードはテキスト入力レベル、キーバインドはコンポーネントレベルで独立して動作します。`Ctrl+` 系のショートカットは Vim モードを通過してキーバインドシステムに渡されます。

---

## まとめ

この章で学んだ重要ポイント：

- キーバインドは `~/.claude/keybindings.json` で設定し、**再起動なしに即座に反映**される
- **コンテキスト別**（Chat、Global、DiffDialog など）にバインディングを定義する
- `null` を設定すると**デフォルトショートカットを無効化**できる
- **`Ctrl+C` と `Ctrl+D` は変更不可**（ハードコード）
- `/doctor` でバリデーションエラー、競合、重複を**診断**できる
- Vim モードとキーバインドは**独立して動作**する

## 次のステップ

次の章「出力スタイル設定」では、Claude Code の出力フォーマットやスタイルをカスタマイズし、教育モードやカスタムエージェントとして活用する方法を学びます。

---

> **公式リファレンス**
> - [Keybindings](https://code.claude.com/docs/en/keybindings)
> - [Interactive mode](https://code.claude.com/docs/en/interactive-mode)
