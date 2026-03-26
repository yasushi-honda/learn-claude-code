# 認証・アカウント設定

> **対応公式ドキュメント**: https://code.claude.com/docs/en/quickstart
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. 対応するアカウント種別（Pro / Max / Teams / Enterprise / Console / Bedrock / Vertex / Foundry）の違いを説明できる
2. `claude auth login`、`claude auth logout`、`claude auth status` を使いこなせる
3. SSO ログインと `/login` によるセッション内アカウント切り替えができる
4. 認証情報の保存場所と管理方法を理解する

---

## 1. 対応アカウント種別

Claude Code は複数の認証方法をサポートしています。利用目的に応じて最適なアカウント種別を選択してください。

### 個人向けアカウント

| アカウント | 対象 | 特徴 | 推奨度 |
|---|---|---|---|
| **Claude Pro** | 個人開発者 | claude.ai のサブスクリプション。手軽に始められる | 個人利用に最適 |
| **Claude Max** | ヘビーユーザー | Pro より高い利用枠。大量のタスクを実行する場合 | 大量利用に最適 |

### チーム・企業向けアカウント

| アカウント | 対象 | 特徴 |
|---|---|---|
| **Claude Teams** | 中小チーム | 共同機能・管理者ツール・請求管理 |
| **Claude Enterprise** | 大企業 | SSO・ドメインキャプチャ・ロールベース権限・コンプライアンス API |

### API / クラウドプロバイダー

| アカウント | 対象 | 特徴 |
|---|---|---|
| **Console（API）** | 開発者 | API ベースのアクセス。**プリペイドクレジットが必要**。コスト追跡に便利 |
| **Amazon Bedrock** | 企業（AWS） | AWS 経由のアクセス。環境変数で設定 |
| **Google Vertex AI** | 企業（GCP） | GCP 経由のアクセス。環境変数で設定 |
| **Microsoft Foundry** | 企業（Azure） | Azure 経由のアクセス。環境変数で設定 |

> **公式ドキュメントより**: Console アカウントでログインすると、自動的に「Claude Code」ワークスペースが作成されます。利用にはプリペイドクレジットの購入が必要です。

### どのアカウントを選ぶべきか

以下のフローチャートを参考に、最適なアカウントを選択してください。

```
あなたは...
├── 個人で使いたい
│   ├── まず試してみたい        → Claude Pro
│   └── ヘビーに使いたい        → Claude Max
├── チームで使いたい
│   ├── 中小チーム（~50名）     → Claude Teams
│   └── 大企業・SSO が必要      → Claude Enterprise
├── API コストを細かく管理したい → Console（プリペイドクレジット）
└── クラウドプロバイダー経由
    ├── AWS を使っている        → Amazon Bedrock
    ├── GCP を使っている        → Google Vertex AI
    └── Azure を使っている      → Microsoft Foundry
```

> **初めての方へ**: 最も手軽に始められるのは **Claude Pro** です。月額サブスクリプションで、特別な設定なくすぐに使い始められます。

---

## 2. ログイン方法

### インタラクティブログイン（基本）

Claude Code をインストール後、`claude` コマンドを実行すると初回ログインが促されます。

```bash
claude
# 初回起動時にログインプロンプトが表示される
```

または、明示的にログインコマンドを実行します。

```bash
claude auth login
```

ブラウザが自動的に開き、認証ページが表示されます。

> **Tip**: ブラウザが自動的に開かない場合は `c` キーを押してください。ログイン URL がクリップボードにコピーされるので、ブラウザに貼り付けてアクセスします。

### セッション内でのログイン

Claude Code のセッション中にアカウントを切り替えたい場合は、`/login` コマンドを使います。

```
/login
```

ログインフローが開始され、別のアカウントでサインインできます。

### オプション付きログイン

#### メールアドレスの事前指定

```bash
claude auth login --email user@example.com
```

#### SSO（シングルサインオン）を強制

企業の SSO 設定を使ってログインする場合:

```bash
claude auth login --sso
```

#### メールアドレスと SSO の組み合わせ

```bash
claude auth login --email user@example.com --sso
```

### クラウドプロバイダー認証

Amazon Bedrock、Google Vertex AI、Microsoft Foundry を使用する場合は、ブラウザログインではなく**環境変数**で認証情報を設定します。

#### Amazon Bedrock

```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
# AWS 認証情報（IAM ロール、プロファイル等）を設定
claude
```

#### Google Vertex AI

```bash
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id
claude
```

#### Microsoft Foundry

```bash
export CLAUDE_CODE_USE_FOUNDRY=1
# Foundry 認証情報を設定
claude
```

> **詳細**: 各クラウドプロバイダーの設定方法は公式ドキュメントを参照してください。
> - [Amazon Bedrock](https://code.claude.com/docs/en/bedrock-vertex-proxies)
> - [Google Vertex AI](https://code.claude.com/docs/en/bedrock-vertex-proxies)
> - [Microsoft Foundry](https://code.claude.com/docs/en/bedrock-vertex-proxies)

---

## 3. ログアウトとアカウント管理

### ログアウト

#### コマンドラインから

```bash
claude auth logout
```

#### セッション内から

```
/logout
```

### 認証状態の確認

現在の認証状態を確認するには `claude auth status` を使います。

#### JSON 形式（デフォルト）

```bash
claude auth status
```

スクリプトやプログラムから認証状態を確認するのに適しています。

#### テキスト形式

```bash
claude auth status --text
```

人間が読みやすい形式で出力されます。

#### 終了コードの活用

`claude auth status` はログイン状態に応じた終了コードを返します。

- 終了コード `0`: ログイン済み
- 終了コード `1`: 未ログイン

スクリプトでの条件分岐に活用できます。

```bash
if claude auth status > /dev/null 2>&1; then
  echo "Logged in - ready to use Claude Code"
else
  echo "Not logged in - please run: claude auth login"
  exit 1
fi
```

---

## 4. 認証情報の保存と管理

### 保存場所

Claude Code は認証情報を安全に管理します。

| 項目 | 詳細 |
|---|---|
| **macOS** | 暗号化された macOS キーチェーン |
| **Linux** | システムのキーリング（利用可能な場合） |
| **対応する認証タイプ** | Claude.ai 認証、Claude API 認証、Azure Auth、Bedrock Auth、Vertex Auth |

### カスタム認証スクリプト

`apiKeyHelper` 設定を使うと、API キーを返すシェルスクリプトを指定できます。キーの自動ローテーションや、Vault 等のシークレット管理ツールとの統合に便利です。

```json
{
  "apiKeyHelper": "my-key-script.sh"
}
```

更新間隔はデフォルトで5分後または HTTP 401 レスポンス時です。`CLAUDE_CODE_API_KEY_HELPER_TTL_MS` 環境変数でカスタム設定できます。

---

## 5. チーム向け認証設定

### Claude for Teams / Enterprise

1. [Claude for Teams](https://claude.com/pricing) にサブスクライブ、または販売チームに連絡して Enterprise を契約
2. 管理者ダッシュボードからチームメンバーを招待
3. チームメンバーが Claude Code をインストールし、Claude.ai アカウントでログイン

Enterprise では SSO（SAML/OIDC）を設定でき、メンバーは `--sso` フラグでログインします。

### Console 認証（API ベース）

1. Console アカウントを作成または使用（[console.anthropic.com](https://console.anthropic.com)）
2. Console の Settings → Members → Invite からユーザーを招待、または SSO を設定
3. ロールを割り当て:
   - **Claude Code ロール**: Claude Code API キーのみ作成可
   - **Developer ロール**: あらゆる API キーを作成可
4. 招待されたユーザーが Console 招待を承認し、Claude Code でログイン

> **注意**: Console アカウントではプリペイドクレジットの購入が必要です。ログイン時に自動的に「Claude Code」ワークスペースが作成されます。

---

## ハンズオン演習

### 演習 1: 初回ログイン

**目的**: Claude Code に初めてログインし、認証フローを体験する
**前提条件**: Claude Code がインストール済み、Claude Pro / Max / Teams / Enterprise / Console のいずれかのアカウントを持っている

**手順**:

1. ターミナルを開き、Claude Code を起動する
   ```bash
   claude
   ```

2. ログインプロンプトが表示されたら、指示に従ってブラウザで認証する
   - ブラウザが自動的に開かない場合は `c` キーを押してURL をコピー

3. 認証が完了したら、ターミナルに戻る

4. Claude Code が正常に起動し、プロンプト（`>`）が表示されることを確認する

5. 認証状態を確認する
   ```
   > exit
   ```
   ```bash
   claude auth status --text
   ```

**期待される結果**: ログインが成功し、`claude auth status --text` でアカウント情報が表示される

### 演習 2: 認証状態の確認

**目的**: `claude auth status` コマンドの出力を理解する
**前提条件**: 演習 1 が完了している

**手順**:

1. JSON 形式で認証状態を確認する
   ```bash
   claude auth status
   ```

2. テキスト形式で確認する
   ```bash
   claude auth status --text
   ```

3. 終了コードを確認する
   ```bash
   claude auth status > /dev/null 2>&1
   echo $?
   # ログイン済みなら 0 が表示される
   ```

4. スクリプトでの活用例を試す
   ```bash
   if claude auth status > /dev/null 2>&1; then
     echo "Ready to use Claude Code"
   else
     echo "Login required"
   fi
   ```

**期待される結果**: JSON 形式とテキスト形式の両方で認証情報を確認でき、終了コードを使った条件分岐が動作する

### 演習 3: セッション内でのアカウント情報確認

**目的**: Claude Code セッション内から認証関連の操作を行う
**前提条件**: ログイン済み

**手順**:

1. Claude Code を起動する
   ```bash
   claude
   ```

2. ヘルプを表示してスラッシュコマンドを確認する
   ```
   /help
   ```

3. 認証関連のコマンド（`/login`、`/logout`）が表示されることを確認する

4. 以下の質問をしてみる
   ```
   > what account am I logged in with?
   ```

5. `exit` で終了する

**期待される結果**: セッション内から認証関連のスラッシュコマンドにアクセスでき、Claude Code が現在のアカウント情報を回答できる

---

## よくある質問

**Q: 無料でClaude Code を試せますか？**
A: Claude Code 自体は無料でインストールできますが、利用には有料アカウントが必要です。Claude Pro（月額サブスクリプション）が最も手軽な選択肢です。Console アカウントの場合は使用量に応じた従量課金（プリペイドクレジット）です。

**Q: ブラウザが開かない環境（SSH 先のサーバー等）でログインするには？**
A: `c` キーを押すとログイン URL がクリップボードにコピーされます。その URL をローカルマシンのブラウザに貼り付けて認証し、表示されるコードをターミナルに入力してください。

**Q: 認証情報が期限切れになった場合は？**
A: `claude auth login` を実行して再認証してください。クラウドプロバイダーを使用している場合は、環境変数が正しく設定されているか確認してください。

**Q: 複数のアカウントを切り替えて使えますか？**
A: はい。セッション内で `/login` を使って別のアカウントに切り替えられます。または、`claude auth logout` してから `claude auth login` で別のアカウントにログインすることもできます。

**Q: Console アカウントと Pro アカウント、どちらが良いですか？**
A: 個人で手軽に始めるなら **Pro** がおすすめです。API コストを細かく管理したい場合や、プログラムから Claude Code を呼び出す場合は **Console** が適しています。Console ではプリペイドクレジットの購入が必要です。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code は **Claude Pro/Max/Teams/Enterprise**、**Console（API）**、**Bedrock/Vertex/Foundry** に対応
- Console アカウントでは**プリペイドクレジット**が必要で、ログイン時に「Claude Code」ワークスペースが自動作成される
- `claude auth login` でログイン（`--email`・`--sso` オプションあり）
- `/login` コマンドでセッション内のアカウント切り替えが可能
- `claude auth status` で認証状態を確認（`--text` で人間向け出力、終了コードでスクリプト連携）
- macOS では認証情報は**暗号化されたキーチェーン**に安全に保存される

## 次のステップ

Week 1 はこれで完了です。Week 2「基本操作・CLI」では、Claude Code の対話モード、CLI フラグ、CLAUDE.md の活用方法を詳しく学びます。

---

> **公式リファレンス**
> - [Quickstart](https://code.claude.com/docs/en/quickstart) - インストールから認証まで
> - [Bedrock / Vertex / Foundry](https://code.claude.com/docs/en/bedrock-vertex-proxies) - クラウドプロバイダー認証
> - [Settings](https://code.claude.com/docs/en/settings) - apiKeyHelper 等の詳細設定
> - [Security](https://code.claude.com/docs/en/security) - セキュリティとデータの取り扱い
