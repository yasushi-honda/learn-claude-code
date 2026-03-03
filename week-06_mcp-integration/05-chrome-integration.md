# Lesson 5: Chrome連携

> 対応する公式ドキュメント: [Use Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome)

## 学習目標

- Chrome連携（ベータ）の概要と設定方法を説明できる
- `--chrome`フラグでClaude Codeを起動しブラウザ操作を指示できる
- ローカルWebアプリのテスト・デバッグをChrome連携で自動化できる
- コンソールエラーの取得とコード修正をClaude Codeに依頼できる
- トラブルシューティングの基本手順を実行できる

## 概要

Chrome連携（ベータ）は、Claude Codeが実際のブラウザを操作できる機能です。Webアプリのテスト、バグのデバッグ、フォームへの自動入力、データの抽出など、ブラウザ操作を伴う作業をClaude Codeに委譲できます。

ChromeはGoogleのClaude in Chrome拡張機能を通じて連携し、あなたがログイン済みのサイトにもアクセスできます（Google Docs・Gmail・Notionなど）。APIキーなしでこれらのサービスを操作できる点が特徴です。

> **ベータ版の注意事項:**
> - 現在はGoogle ChromeとMicrosoft Edgeのみ対応
> - Brave・Arc・その他のChromiumベースブラウザは未対応
> - WSL（Windows Subsystem for Linux）は未対応

## 本文

### 前提条件

Chrome連携を使用するには以下が必要です：

| 要件 | 詳細 |
|-----|------|
| ブラウザ | Google ChromeまたはMicrosoft Edge |
| 拡張機能 | [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) バージョン1.0.36以上 |
| Claude Code | バージョン2.0.73以上 |
| Claudeプラン | Pro・Max・Teams・Enterpriseのいずれか |

> **重要:** Chrome連携はAnthropicの直接プラン向けです。Amazon Bedrock・Google Cloud Vertex AI・Microsoft Foundryなどのサードパーティプロバイダー経由ではご利用いただけません。

### セットアップ

#### ステップ1: 拡張機能をインストールする

Chrome Web Storeから「Claude in Chrome」拡張機能をインストールします：

```
https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn
```

#### ステップ2: Chrome連携を有効にしてClaude Codeを起動する

```bash
# --chromeフラグで起動
claude --chrome
```

または既存のセッション内で：

```
/chrome
```

#### ステップ3: ブラウザ操作を指示する

```text
code.claude.comのドキュメントを開いて、検索ボックスに「hooks」と入力して、表示された結果を教えてください
```

### デフォルトでChrome連携を有効にする

毎回`--chrome`フラグを指定しなくても済むように設定できます：

```
/chrome  # → "Enabled by default" を選択
```

> **注意:** デフォルトで有効にするとブラウザツールが常にロードされるため、コンテキスト消費量が増加します。コンテキストの節約を優先する場合は、必要な時だけ`--chrome`を使う方法をお勧めします。

### できること（主な機能）

#### ライブデバッグ

コンソールエラーを読み込んで、原因となったコードを直接修正します：

```text
ダッシュボードページを開いて、ページ読み込み時のコンソールエラーを確認してください
```

Claude Codeはコンソールメッセージを取得してエラーを分析し、コードを修正します。

> **ヒント:** すべてのコンソール出力を要求するのではなく、特定のエラーパターンを指定すると効率的です（ログが大量の場合があるため）。

#### デザイン検証

Figmaのモックアップを実装した後、ブラウザで確認します：

```text
このデザインをFigmaに基づいて実装しました。ブラウザでlocalhost:3000を開いて、実装がデザインと一致しているか確認してください
```

#### Webアプリのテスト

フォームの検証、ユーザーフローの確認：

```text
ログインフォームの検証をテストしてください。無効なデータを送信したときにエラーメッセージが正しく表示されるか確認してください
```

#### 認証済みWebアプリの操作

ログイン済みのWebアプリを直接操作できます：

```text
最近のコミットに基づいてプロジェクトの進捗状況を作成して、docs.google.com/document/d/abc123のGoogle Docに追記してください
```

これはClaude Codeがあなたのブラウザセッションを利用するため、APIなしで動作します。

#### データ抽出

Webページから構造化データを取得します：

```text
製品一覧ページを確認して、各アイテムの名前・価格・在庫状況を取得してCSVファイルとして保存してください
```

#### 自動フォーム入力

繰り返し作業を自動化します：

```text
contacts.csvの各行を読み込んで、crm.example.comの「連絡先追加」フォームに名前・メール・電話番号を入力してください
```

#### マルチサイトワークフロー

複数のWebサイトにまたがる作業：

```text
明日のミーティングをカレンダーで確認して、外部参加者がいるミーティングの会社Webサイトを調べて、それぞれの会社情報をメモに追記してください
```

#### デモGIFの録画

ブラウザ操作を記録して共有できます：

```text
買い物かごへの追加から確認ページまでのチェックアウトフローを示すGIFを録画してください
```

### 使用例：ローカルWebアプリのテスト

最もよく使われるユースケースを詳しく説明します。

#### ログインフォームの検証テスト

```text
ログインフォームのバリデーションを更新しました。localhost:3000を開いて、
無効なデータでフォームを送信して、エラーメッセージが正しく表示されるか確認してください
```

Claude Codeは：
1. ブラウザで`localhost:3000`を開く
2. フォームに無効なデータを入力して送信
3. エラーメッセージが表示されているか確認
4. 結果をレポートする

#### コンソールエラーのデバッグ

```text
ダッシュボードページを開いて、ページ読み込み時にコンソールエラーが発生しているか確認してください
```

### サイト権限の管理

Claudeが操作できるサイトはChrome拡張機能の設定で管理します：

1. Chromeで拡張機能の設定を開く
2. Claude in Chromeの権限を確認
3. 必要に応じてサイトへのアクセスを許可・拒否する

### Playwright MCPとの違い

| 比較軸 | Chrome連携 | Playwright MCP |
|-------|-----------|-------------|
| セッション共有 | あなたのブラウザセッションを使用 | 独立したブラウザインスタンス |
| ログイン状態 | 利用可能（既存のセッション） | 別途ログインが必要 |
| 対応ブラウザ | Chrome・Edge | Chromium・Firefox・WebKit |
| 設定の複雑さ | 拡張機能インストールのみ | MCPサーバーの設定が必要 |
| ヘッドレス | なし（可視ウィンドウ） | あり（ヘッドレスモード可） |

**使い分けのポイント:**
- ログイン済みサービス（Gmail・Google Docs等）を操作 → Chrome連携
- CI/CDでのヘッドレステスト → Playwright MCP
- 独立したセッションでのテスト → Playwright MCP

### トラブルシューティング

#### 拡張機能が検出されない

```
エラー: "Chrome extension not detected"
```

解決手順：
1. `chrome://extensions`で拡張機能が有効か確認
2. Claude Codeのバージョンを確認（`claude --version`）
3. Chromeを再起動
4. `/chrome`で「Reconnect extension」を選択

**初回セットアップ時の注意:** Claude Codeはネイティブメッセージングホスト設定ファイルをインストールします。Chromeは起動時にこのファイルを読み込むため、初回は**Chromeを再起動**する必要があります。

**設定ファイルの場所（Chrome）:**

| OS | パス |
|---|-----|
| macOS | `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Linux | `~/.config/google-chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Windows | レジストリ: `HKCU\Software\Google\Chrome\NativeMessagingHosts\` |

**設定ファイルの場所（Edge）:**

| OS | パス |
|---|-----|
| macOS | `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Linux | `~/.config/microsoft-edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Windows | レジストリ: `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\` |

#### ブラウザが応答しない

JavaScriptのダイアログ（alert・confirm・prompt）がブラウザイベントをブロックしている可能性があります：

1. ダイアログを手動で閉じる
2. Claude Codeに「続けてください」と伝える

#### 長いセッション後に接続が切れる

Chrome拡張機能のサービスワーカーが非アクティブになることがあります：

```
/chrome  # → "Reconnect extension" を選択
```

#### よくあるエラーメッセージ

| エラー | 原因 | 解決策 |
|------|------|-------|
| "Browser extension is not connected" | ネイティブメッセージングホストが拡張機能に接続できない | ChromeとClaude Codeを再起動して`/chrome`で再接続 |
| "Extension not detected" | 拡張機能が未インストールまたは無効 | `chrome://extensions`でインストールまたは有効化 |
| "No tab available" | タブが準備できていない | Claudeに新しいタブを作成して再試行するよう伝える |
| "Receiving end does not exist" | 拡張機能のサービスワーカーがアイドル状態 | `/chrome`で「Reconnect extension」 |

#### Windows固有の問題

- **Named pipe conflicts (EADDRINUSE)**: Claude Codeを再起動する。他のClaude Codeセッションが使用している可能性がある
- **Native messaging host errors**: Claude Codeを再インストールしてホスト設定を再生成する

## まとめ

- Chrome連携はClaude in Chrome拡張機能を通じてブラウザを操作する機能（ベータ）
- `claude --chrome`または`/chrome`コマンドで有効化できる
- ログイン済みのブラウザセッションを使うため、Google Docs・Gmail等をAPIなしで操作できる
- ローカルWebアプリのテスト・デバッグ・フォーム自動化・データ抽出などに使える
- Playwright MCPとは異なり、実際のブラウザウィンドウで動作する
- 接続できない場合は拡張機能の再起動・Chromeの再起動・`/chrome`での再接続を試す

## 公式リファレンス

- [Use Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome)
- [Claude in Chrome 拡張機能](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
- [Getting started with Claude in Chrome（ヘルプセンター）](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome)
- [VS Code でのブラウザ自動化](https://code.claude.com/docs/en/vs-code#automate-browser-tasks-with-chrome)
