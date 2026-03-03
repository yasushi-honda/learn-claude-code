# 認証・アカウント設定

> 対応する公式ドキュメント: [Authentication](https://code.claude.com/docs/en/authentication)

## 学習目標

- 対応するアカウント種別の違いを説明できる
- `claude auth login`、`claude auth logout`、`claude auth status` を使いこなせる
- セッション内で `/login` を使ったアカウント切り替えができる
- 認証情報の保存場所と管理方法を理解する

## 概要

Claude Code は複数の認証方法をサポートしています。個人ユーザーは Claude.ai アカウントでログインでき、チームは Claude for Teams / Enterprise、Claude Console、または Amazon Bedrock・Google Vertex AI・Microsoft Foundry などのクラウドプロバイダーを使用できます。

## 本文

### 対応アカウント種別

Claude Code は以下のアカウント種別で利用できます：

| アカウント | 対象 | 特徴 |
|---|---|---|
| **Claude Pro** | 個人 | claude.com のサブスクリプション。個人向け推奨 |
| **Claude Max** | 個人 | Pro より高い利用枠 |
| **Claude Teams** | チーム | 共同機能・管理者ツール・請求管理。中小チーム向け |
| **Claude Enterprise** | 大企業 | SSO・ドメインキャプチャ・ロールベース権限・コンプライアンス API |
| **Claude Console** | 開発者 | API ベースのアクセス（プリペイドクレジット）。コスト追跡に便利 |
| **Amazon Bedrock** | 企業 | AWS 経由のアクセス。環境変数で設定 |
| **Google Vertex AI** | 企業 | GCP 経由のアクセス。環境変数で設定 |
| **Microsoft Foundry** | 企業 | Azure 経由のアクセス。環境変数で設定 |

### ログイン方法

#### インタラクティブログイン

Claude Code をインストール後、`claude` コマンドを実行すると初回ログインが促されます：

```bash
claude
# 初回起動時にログインプロンプトが表示される
```

または、明示的にログインコマンドを実行する：

```bash
claude auth login
```

ブラウザが自動的に開きます。開かない場合は `c` キーを押してログイン URL をコピーし、ブラウザに貼り付けます。

#### オプション付きログイン

メールアドレスを事前に指定する：

```bash
claude auth login --email user@example.com
```

SSO（シングルサインオン）を強制する：

```bash
claude auth login --sso
```

両方を組み合わせる：

```bash
claude auth login --email user@example.com --sso
```

#### クラウドプロバイダー認証（Bedrock / Vertex / Foundry）

Amazon Bedrock、Google Vertex AI、Microsoft Foundry を使用する場合は、ブラウザログインは不要です。代わりに環境変数を設定します。詳細は各プロバイダーのドキュメントを参照してください：

- [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)
- [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai)
- [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry)

### ログアウト

ログアウトして別のアカウントで認証し直す場合：

```bash
claude auth logout
```

または、Claude Code セッション内から：

```
/logout
```

### 認証状態の確認

現在の認証状態を JSON 形式で確認する：

```bash
claude auth status
```

人間が読みやすい形式で確認する：

```bash
claude auth status --text
```

ログイン済みの場合は終了コード 0、未ログインの場合は終了コード 1 を返します。スクリプトでの条件分岐に使えます：

```bash
if claude auth status; then
  echo "Logged in"
else
  echo "Not logged in, please run: claude auth login"
fi
```

### セッション内でのアカウント切り替え

Claude Code を起動したまま別のアカウントに切り替えるには、セッション内で `/login` を実行します：

```
/login
```

ログインフローに従って別のアカウントでサインインできます。

### 認証情報の保存場所と管理

Claude Code は認証情報を安全に管理します：

| 項目 | 詳細 |
|---|---|
| **macOS の保存場所** | 暗号化された macOS キーチェーン |
| **サポートされる認証タイプ** | Claude.ai 認証、Claude API 認証、Azure Auth、Bedrock Auth、Vertex Auth |
| **カスタム認証スクリプト** | `apiKeyHelper` 設定で API キーを返すシェルスクリプトを実行可能 |
| **更新間隔** | デフォルトは 5 分後または HTTP 401 レスポンス時。`CLAUDE_CODE_API_KEY_HELPER_TTL_MS` 環境変数でカスタム設定可能 |

### チーム向け認証設定

チームや組織の場合、以下の方法で Claude Code アクセスを設定できます：

#### Claude for Teams / Enterprise

1. [Claude for Teams](https://claude.com/pricing#team-&-enterprise) にサブスクライブ、または販売チームに連絡して Enterprise を契約
2. 管理者ダッシュボードからチームメンバーを招待
3. チームメンバーが Claude Code をインストールし、Claude.ai アカウントでログイン

#### Claude Console 認証

1. Console アカウントを作成または使用
2. Console の Settings → Members → Invite からユーザーを一括招待、または SSO を設定
3. ロールを割り当て（Claude Code ロール: Claude Code API キーのみ作成可 / Developer ロール: あらゆる API キーを作成可）
4. 招待されたユーザーが Console 招待を承認し、Claude Code をインストールしてログイン

### よくある問題

**ブラウザが開かない場合:**
- `c` キーを押してログイン URL をコピーし、手動でブラウザに貼り付ける

**SSO でログインできない場合:**
- 管理者が SSO 設定を完了しているか確認する
- `--sso` フラグを付けて再試行する

**認証情報が期限切れになる場合:**
- `claude auth login` を実行して再認証する
- クラウドプロバイダーを使用している場合は、環境変数が正しく設定されているか確認する

**複数アカウントを切り替えたい場合:**
- セッション内で `/login` を使用して切り替える
- または `claude auth logout` 後に `claude auth login` で別アカウントとしてログイン

## まとめ

- Claude Code は **Claude Pro/Max/Teams/Enterprise**・**Console**・**Bedrock/Vertex/Foundry** に対応
- `claude auth login` でログイン（`--email`・`--sso` オプションあり）
- `claude auth logout` でログアウト、セッション内では `/logout`（または `/login` で切り替え）
- `claude auth status`（`--text` で人間向け出力）で認証状態を確認
- macOS では認証情報は **暗号化されたキーチェーン** に保存

## 公式リファレンス

- [Authentication](https://code.claude.com/docs/en/authentication) - 認証の詳細
- [Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock) - Bedrock 認証
- [Google Vertex AI](https://code.claude.com/docs/en/google-vertex-ai) - Vertex AI 認証
- [Microsoft Foundry](https://code.claude.com/docs/en/microsoft-foundry) - Foundry 認証
- [Settings](https://code.claude.com/docs/en/settings) - apiKeyHelper 等の詳細設定
