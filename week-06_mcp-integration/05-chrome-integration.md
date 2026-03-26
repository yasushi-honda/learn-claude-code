# Chrome連携

> **対応公式ドキュメント**: https://code.claude.com/docs/en/chrome
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Chrome連携（ベータ）の概要と仕組みを説明できる
2. Chrome拡張機能をインストールして`claude --chrome`で起動できる
3. ブラウザ操作（テスト・デバッグ・データ抽出・フォーム入力）をClaude Codeに委譲できる
4. Chrome連携とPlaywright MCPの使い分けを判断できる

---

## 1. Chrome連携とは

### 概要

Chrome連携（ベータ）は、Claude Codeが実際のブラウザを操作できる機能です。Claude in Chrome拡張機能（バージョン1.0.36以上）を通じて、あなたのブラウザセッションを利用してWebサイトを操作します。

> **公式ドキュメントより**: Chrome連携により、Claude Codeはあなたのログイン済みセッションを使ってWebサイトを操作できます。APIキーなしでGoogle Docs・Gmail・Notionなどのサービスにアクセスできる点が特徴です。

```text
@browser go to localhost:3000 and check the console for errors
```

このような自然言語の指示で、Claude Codeがブラウザを操作します。

### ベータ版の制限事項

| 対応 | 非対応 |
|------|--------|
| Google Chrome | Brave、Arc |
| Microsoft Edge | その他のChromiumベースブラウザ |
| macOS / Linux / Windows | WSL（Windows Subsystem for Linux） |

### 前提条件

| 要件 | 詳細 |
|-----|------|
| ブラウザ | Google ChromeまたはMicrosoft Edge |
| 拡張機能 | [Claude in Chrome](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn) バージョン1.0.36以上 |
| Claude Code | バージョン2.0.73以上 |
| Claudeプラン | Pro・Max・Teams・Enterpriseのいずれか |

> **重要**: Chrome連携はAnthropicの直接プラン向けです。Amazon Bedrock・Google Cloud Vertex AI・Microsoft Foundryなどのサードパーティプロバイダー経由では利用できません。

---

## 2. セットアップ

### ステップ1: 拡張機能をインストールする

Chrome Web Storeから「Claude in Chrome」拡張機能をインストールします。

```
https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn
```

### ステップ2: Chrome連携を有効にしてClaude Codeを起動する

```bash
# --chromeフラグで起動
claude --chrome
```

または既存のセッション内で:

```
/chrome
```

> **初回セットアップの注意**: Claude Codeはネイティブメッセージングホスト設定ファイルをインストールします。Chromeは起動時にこのファイルを読み込むため、**初回はChromeを再起動**する必要があります。

### ステップ3: ブラウザ操作を指示する

```text
code.claude.comのドキュメントを開いて、検索ボックスに「hooks」と入力して、
表示された結果を教えてください
```

### デフォルトでChrome連携を有効にする

毎回`--chrome`フラグを指定しなくても済むように設定できます。

```
/chrome  # → "Enabled by default" を選択
```

> **注意**: デフォルトで有効にするとブラウザツールが常にロードされるため、コンテキスト消費量が増加します。コンテキストの節約を優先する場合は、必要な時だけ`--chrome`を使う方法をお勧めします。

### VS Code内での利用

Chrome連携はVS Code内のClaude Codeでも利用可能です。ターミナルと同様に`/chrome`コマンドで有効化できます。

---

## 3. 主な機能と活用パターン

### ライブデバッグ

コンソールエラーを読み込んで、原因となったコードを直接修正します。

```text
ダッシュボードページを開いて、ページ読み込み時のコンソールエラーを確認してください
```

Claude Codeはコンソールメッセージを取得してエラーを分析し、該当するコードファイルを特定して修正します。

> **ヒント**: すべてのコンソール出力を要求するのではなく、特定のエラーパターンを指定すると効率的です。ログが大量の場合、コンテキストを圧迫する可能性があります。

### デザイン検証

Figmaのモックアップを実装した後、ブラウザで実際の表示を確認します。

```text
このデザインをFigmaに基づいて実装しました。ブラウザでlocalhost:3000を開いて、
実装がデザインと一致しているか確認してください
```

### Webアプリのテスト

フォームの検証、ユーザーフローの確認を自動化します。

```text
ログインフォームの検証をテストしてください。無効なデータを送信したときに
エラーメッセージが正しく表示されるか確認してください
```

### 認証済みWebアプリの操作

Chrome連携の最大の特長は、ログイン済みのWebアプリをAPIなしで操作できることです。

```text
最近のコミットに基づいてプロジェクトの進捗状況を作成して、
docs.google.com/document/d/abc123のGoogle Docに追記してください
```

Claudeはあなたのブラウザセッション（Cookie、ログイン状態）を利用するため、別途API設定は不要です。

### データ抽出

Webページから構造化データを取得します。

```text
製品一覧ページを確認して、各アイテムの名前・価格・在庫状況を取得して
CSVファイルとして保存してください
```

### 自動フォーム入力

繰り返しの入力作業を自動化します。

```text
contacts.csvの各行を読み込んで、crm.example.comの「連絡先追加」フォームに
名前・メール・電話番号を入力してください
```

### マルチサイトワークフロー

複数のWebサイトにまたがる作業を一つの指示で自動化します。

```text
明日のミーティングをカレンダーで確認して、外部参加者がいるミーティングの
会社Webサイトを調べて、それぞれの会社情報をメモに追記してください
```

### デモGIFの録画

ブラウザ操作を記録して共有できます。

```text
買い物かごへの追加から確認ページまでのチェックアウトフローを示すGIFを
録画してください
```

### 実践シナリオ: ローカルWebアプリの開発サイクル

Chrome連携を使った典型的な開発サイクルを示します。

```text
# 1. コードを修正する
「LoginForm.tsxのバリデーションロジックを更新しました」

# 2. ブラウザで結果を確認する
「localhost:3000/loginを開いて、フォームのバリデーションが正しく動作するか確認してください。
 空のメールアドレス、無効な形式のメールアドレス、正しいメールアドレスの3パターンでテストしてください」

# 3. コンソールエラーがあれば修正する
「コンソールにエラーが出ていたら、該当するコードを修正してください」

# 4. 画面のスクリーンショットを撮る
「修正後の画面のスクリーンショットを撮ってレビュー用に保存してください」
```

このサイクルの全ステップがClaude Codeの一つのセッションで完結します。コード修正 → ブラウザ確認 → バグ修正の反復をスムーズに行えます。

---

## 4. Chrome連携 vs Playwright MCP

どちらもブラウザ操作を自動化しますが、仕組みと得意分野が異なります。

| 比較軸 | Chrome連携 | Playwright MCP |
|-------|-----------|-------------|
| セッション | あなたのブラウザセッションを使用 | 独立したブラウザインスタンス |
| ログイン状態 | 利用可能（既存のセッション） | 別途ログインが必要 |
| 対応ブラウザ | Chrome・Edge | Chromium・Firefox・WebKit |
| 設定の複雑さ | 拡張機能インストールのみ | MCPサーバーの設定が必要 |
| ヘッドレス | なし（可視ウィンドウ） | あり（ヘッドレスモード可） |
| CI/CD対応 | 不可 | 可能 |

### 使い分けのガイドライン

| こんな時は... | 推奨 |
|--------------|------|
| ログイン済みサービスを操作したい（Gmail, Google Docs等） | Chrome連携 |
| ローカルWebアプリのデバッグ | Chrome連携 |
| CI/CDでのヘッドレステスト | Playwright MCP |
| 独立した環境でのE2Eテスト | Playwright MCP |
| 複数ブラウザでのテスト | Playwright MCP |

---

## 5. サイト権限の管理

Claudeが操作できるサイトはChrome拡張機能の設定で管理します。

1. Chromeで`chrome://extensions`を開く
2. Claude in Chromeの権限を確認
3. 必要に応じてサイトへのアクセスを許可・拒否する

セキュリティ上、必要なサイトのみにアクセスを許可することを推奨します。

---

## 6. トラブルシューティング

### 拡張機能が検出されない

```
エラー: "Chrome extension not detected"
```

**解決手順**:
1. `chrome://extensions`で拡張機能が有効か確認
2. Claude Codeのバージョンを確認（`claude --version`）→ 2.0.73以上が必要
3. Chromeを再起動（初回セットアップ時は必須）
4. Claude Code内で `/chrome` → 「Reconnect extension」を選択

### ネイティブメッセージングホストの設定ファイル

Claude Codeはネイティブメッセージングホスト設定ファイルを自動的にインストールします。

**Chrome**:

| OS | パス |
|---|-----|
| macOS | `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Linux | `~/.config/google-chrome/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Windows | レジストリ: `HKCU\Software\Google\Chrome\NativeMessagingHosts\` |

**Edge**:

| OS | パス |
|---|-----|
| macOS | `~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Linux | `~/.config/microsoft-edge/NativeMessagingHosts/com.anthropic.claude_code_browser_extension.json` |
| Windows | レジストリ: `HKCU\Software\Microsoft\Edge\NativeMessagingHosts\` |

### ブラウザが応答しない

JavaScriptのダイアログ（alert・confirm・prompt）がブラウザイベントをブロックしている可能性があります。

1. ダイアログを手動で閉じる
2. Claude Codeに「続けてください」と伝える

### 長いセッション後に接続が切れる

Chrome拡張機能のサービスワーカーが非アクティブになることがあります。

```
/chrome  # → "Reconnect extension" を選択
```

### よくあるエラーメッセージと対処法

| エラー | 原因 | 解決策 |
|------|------|-------|
| "Browser extension is not connected" | ネイティブメッセージングホストが接続できない | ChromeとClaude Codeを再起動して`/chrome`で再接続 |
| "Extension not detected" | 拡張機能が未インストールまたは無効 | `chrome://extensions`で確認 |
| "No tab available" | タブが準備できていない | 新しいタブを作成して再試行 |
| "Receiving end does not exist" | サービスワーカーがアイドル状態 | `/chrome`で「Reconnect extension」 |

### Windows固有の問題

- **Named pipe conflicts (EADDRINUSE)**: Claude Codeを再起動する。他のセッションが使用している可能性がある
- **Native messaging host errors**: Claude Codeを再インストールしてホスト設定を再生成する

---

## ハンズオン演習

### 演習 1: Chrome連携のセットアップと動作確認

**目的**: Chrome連携を設定して基本的なブラウザ操作を体験する
**前提条件**: Google ChromeとClaude in Chrome拡張機能がインストール済みであること

**手順**:

1. Chrome連携でClaude Codeを起動する

```bash
claude --chrome
```

2. 簡単なブラウザ操作を指示する

```text
example.comを開いて、ページのタイトルと主要な見出しを教えてください
```

3. 結果を確認する

**期待される結果**: Claudeがブラウザでexample.comを開き、ページの内容を報告する。

### 演習 2: ローカルWebアプリのデバッグ

**目的**: Chrome連携を使ってローカル開発サーバーのデバッグを体験する
**前提条件**: ローカルで動作するWebアプリがあること（例: `npx serve`で簡易サーバーを起動）

**手順**:

1. ローカルWebサーバーを起動する（別ターミナルで）

```bash
# 例: 簡易HTTPサーバー
npx serve .
```

2. Chrome連携でClaude Codeを起動する

```bash
claude --chrome
```

3. コンソールエラーの確認を依頼する

```text
localhost:3000を開いて、ページ読み込み時にコンソールエラーが発生しているか
確認してください
```

**期待される結果**: Claudeがブラウザでローカルサーバーにアクセスし、コンソールメッセージを報告する。

### 演習 3: Chrome連携の接続状態を確認する

**目的**: 接続状態の確認と再接続の方法を覚える

**手順**:

1. Claude Code内で接続状態を確認する

```
/chrome
```

2. 「Status」セクションで接続状態を確認する

3. もし切断されている場合は「Reconnect extension」を選択する

**期待される結果**: Chrome連携の接続状態を確認し、必要に応じて再接続できる。

---

## よくある質問

**Q: Chrome連携はコンテキストをどれくらい消費しますか?**
A: ブラウザツールの定義がコンテキストに追加されるため、一定量の消費があります。頻繁にブラウザ操作を使わない場合は、必要な時だけ`claude --chrome`で起動するか、`/chrome`でセッション中に有効化する方が効率的です。

**Q: Chrome連携でアクセスできないサイトはありますか?**
A: Chrome拡張機能の権限で制御されます。`chrome://extensions`で権限を確認し、必要なサイトへのアクセスを許可してください。また、Chrome内部ページ（`chrome://`で始まるURL）にはアクセスできません。

**Q: Playwright MCPとChrome連携は同時に使えますか?**
A: はい、両方を同時に使えます。ログイン済みサイトの操作はChrome連携、ヘッドレスでのテスト自動化はPlaywright MCPと使い分けることができます。

**Q: Chrome連携はCI/CD環境で使えますか?**
A: いいえ。Chrome連携は実際のブラウザウィンドウが必要なため、CI/CD環境では使えません。CI/CDにはPlaywright MCPのヘッドレスモードを使用してください。

**Q: Chromeのプロファイルを切り替えて使えますか?**
A: Chrome連携はアクティブなブラウザセッションを使用するため、Chromeで使用中のプロファイルのセッションが利用されます。別のプロファイルを使いたい場合は、Chromeのプロファイルを切り替えてから接続してください。

---

## まとめ

この章で学んだ重要ポイント：

- Chrome連携はClaude in Chrome拡張機能を通じてブラウザを操作する機能（ベータ版）
- `claude --chrome`または`/chrome`コマンドで有効化できる
- ログイン済みのブラウザセッションを使うため、Google Docs・Gmail等をAPIなしで操作できる
- ローカルWebアプリのテスト・デバッグ・フォーム自動化・データ抽出など幅広い用途がある
- Playwright MCPとは用途が異なる: ログイン済みサービス操作はChrome連携、CI/CDテストはPlaywright MCP
- 接続できない場合は拡張機能の有効化・Chromeの再起動・`/chrome`での再接続を試す

## 次のステップ

次の章「Slack連携」では、SlackワークスペースからClaude Codeを呼び出してコーディングタスクを委譲する方法を学びます。チームの会話からシームレスに開発作業を開始できるワークフローです。

---

> **公式リファレンス**
> - [Use Claude Code with Chrome (beta)](https://code.claude.com/docs/en/chrome)
> - [Claude in Chrome 拡張機能](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
> - [Getting started with Claude in Chrome（ヘルプセンター）](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome)
> - [VS Code でのブラウザ自動化](https://code.claude.com/docs/en/vs-code#automate-browser-tasks-with-chrome)
