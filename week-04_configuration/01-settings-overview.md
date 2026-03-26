# 設定ファイル体系

> **対応公式ドキュメント**: https://code.claude.com/docs/en/settings / https://code.claude.com/docs/en/env-vars
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude Code の4つの設定スコープとその優先順位を正確に説明できる
2. settings.json の構造を理解し、`$schema` を活用してエディタ補完を有効にできる
3. 配列設定のマージ動作を理解し、スコープ間の設定が連結されることを説明できる
4. 主要な設定キーと環境変数を把握し、用途に応じた設定ができる

---

## 1. 設定アーキテクチャの全体像

Claude Code は階層的な設定システムを採用しています。組織のセキュリティポリシーを維持しながら、チームの標準設定を共有し、個人の柔軟性も確保するという3つの要件を同時に満たすため、4つのスコープが用意されています。

### 4つの設定スコープ

| スコープ | 保存場所 | 対象範囲 | チーム共有 |
|---------|---------|---------|----------|
| **Managed** | OS レベル（後述） | マシンの全ユーザー | IT 部門が配置 |
| **User** | `~/.claude/settings.json` | 全プロジェクト共通 | 個人設定 |
| **Project** | `.claude/settings.json` | リポジトリの協力者 | Git にコミット |
| **Local** | `.claude/settings.local.json` | このリポジトリのみ | `.gitignore` 済み |

各スコープの使い分けの指針は以下の通りです。

| 用途 | 推奨スコープ |
|-----|------------|
| セキュリティポリシー（全社） | Managed |
| チーム標準設定（リント、テスト） | Project (`.claude/settings.json`) |
| 個人の実験・一時設定 | Local (`.claude/settings.local.json`) |
| グローバルなツール設定 | User (`~/.claude/settings.json`) |

### Managed 設定の配置場所

Managed 設定はOS ごとに異なる場所に配置されます。

| OS | パス |
|-----|------|
| macOS | `/Library/Application Support/ClaudeCode/` |
| Linux | `/etc/claude-code/` |
| Windows | `C:\Program Files\ClaudeCode\` |

さらに、MDM（モバイルデバイス管理）による配布も可能です。

| プラットフォーム | 方式 |
|--------------|------|
| macOS | plist (`com.anthropic.claudecode`) |
| Windows | レジストリ (`HKLM\SOFTWARE\Policies\ClaudeCode`) |

> **公式ドキュメントより**: Managed 設定は最も高い優先度を持ち、ユーザーやプロジェクトが上書きすることはできません。IT 管理者が組織全体のポリシーを強制するために使います。

---

## 2. 設定の優先順位とマージルール

### 優先順位

設定は以下の順で評価されます（上が優先）。

```
1. Managed 設定（最高優先度・上書き不可）
   ├── サーバー管理設定
   ├── MDM/OS レベルポリシー
   └── managed-settings.json

2. コマンドライン引数（--model など一時的上書き）

3. Local 設定 (.claude/settings.local.json)

4. Project 設定 (.claude/settings.json)

5. User 設定 (~/.claude/settings.json)
```

具体例を見てみましょう。

**例1**: User 設定で `model: "opus"` と指定し、Project 設定で `model: "sonnet"` と指定した場合、**Project が優先**されて `sonnet` になります。

**例2**: `claude --model haiku` で起動した場合、CLI 引数が User/Project より優先されるため `haiku` になります。ただし Managed 設定で固定されている場合はそちらが勝ちます。

### 配列設定のマージ動作

スカラー値（文字列や数値）は上位スコープが下位を上書きしますが、**配列設定は連結・重複排除されます**。これは設定の「置換」ではなく「マージ」です。

```
例:
  Managed:  permissions.allow = ["//opt/company-tools"]
  User:     permissions.allow = ["~/.kube"]
  Project:  permissions.allow = ["Bash(npm run *)"]

  結果:     permissions.allow = ["//opt/company-tools", "~/.kube", "Bash(npm run *)"]
```

この動作により、Managed で組織のツールを許可しつつ、プロジェクトごとに追加のツールを許可する柔軟な構成が可能です。

---

## 3. settings.json の構造と主要設定キー

### 基本構造

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",

  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  },

  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  },

  "model": "sonnet"
}
```

`$schema` を追加すると VS Code などのエディタでオートコンプリートとインライン検証が有効になります。設定ファイルを手書きする際には必ず追加しましょう。

### 設定キー全リスト

Claude Code の settings.json で使用できる主要な設定キーの一覧です。

**パーミッション関連**

| キー | 説明 | 例 |
|-----|------|-----|
| `permissions.allow` | 許可するツール使用 | `["Bash(git diff *)"]` |
| `permissions.ask` | 確認を求める操作 | `["Bash(git push *)"]` |
| `permissions.deny` | 拒否するツール使用 | `["WebFetch", "Read(./.env)"]` |
| `permissions.additionalDirectories` | アクセス可能な追加ディレクトリ | `["../docs/"]` |

**モデル・動作設定**

| キー | 説明 | 例 |
|-----|------|-----|
| `model` | デフォルトモデル | `"sonnet"` or `"opusplan"` |
| `availableModels` | 選択可能なモデルの制限 | `["sonnet", "haiku"]` |
| `effortLevel` | 推論の努力レベル | `"low"`, `"medium"`, `"high"` |
| `outputStyle` | 出力スタイル | `"Explanatory"` |
| `defaultMode` | デフォルトのパーミッションモード | `"default"` |

**メモリ・ファイル設定**

| キー | 説明 | 例 |
|-----|------|-----|
| `autoMemoryEnabled` | 自動メモリの有効/無効 | `true` |
| `respectGitignore` | .gitignore を尊重するか | `true` |
| `claudeMdExcludes` | 除外する CLAUDE.md パターン | `["vendor/**"]` |
| `fileSuggestion` | ファイルサジェスチョンの設定 | - |

**フック・MCP 設定**

| キー | 説明 |
|-----|------|
| `hooks` | ライフサイクルイベント時に実行するコマンド |
| `disableAllHooks` | 全フック無効化 |
| `allowManagedHooksOnly` | 管理フックのみ許可 |
| `enableAllProjectMcpServers` | 全 MCP サーバーを自動承認 |
| `deniedMcpServers` | 拒否するサーバーのリスト |

**その他**

| キー | 説明 |
|-----|------|
| `apiKeyHelper` | API キーの取得ヘルパー |
| `cleanupPeriodDays` | クリーンアップ期間 |
| `companyAnnouncements` | 企業向けアナウンスメント |
| `attribution` | 帰属表示設定 |
| `sandbox` | サンドボックス設定 |
| `statusLine` | ステータスライン設定 |
| `forceLoginMethod` | ログイン方法の強制 |
| `teammateMode` | チームメイトモード |

---

## 4. 環境変数による設定

`settings.json` の `env` キーに環境変数を設定できます。また、シェルの環境変数としても設定可能です。

### settings.json の env

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-...",
    "MY_CUSTOM_VAR": "value"
  }
}
```

### 主要な環境変数

**認証・接続**

| 変数名 | 説明 |
|-------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー |
| `ANTHROPIC_AUTH_TOKEN` | 認証トークン |
| `CLAUDE_CODE_API_KEY_HELPER` | API キーヘルパーコマンド |

**モデル選択**

| 変数名 | 説明 |
|-------|------|
| `ANTHROPIC_MODEL` | デフォルトモデル |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | `opus` エイリアスのマッピング先 |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | `sonnet` エイリアスのマッピング先 |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | `haiku` エイリアスのマッピング先 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | サブエージェントのモデル |

**動作制御**

| 変数名 | 説明 |
|-------|------|
| `CLAUDE_CODE_EFFORT_LEVEL` | 推論の努力レベル（`low`/`medium`/`high`） |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | 自動コンパクトのしきい値（%） |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | 自動メモリの無効化（`1` で無効） |
| `CLAUDE_CODE_DISABLE_1M_CONTEXT` | 100万トークンコンテキストの無効化 |
| `MAX_THINKING_TOKENS` | 拡張思考の最大トークン数 |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | テレメトリの有効化 |

**プロンプトキャッシュ**

| 変数名 | 説明 |
|-------|------|
| `DISABLE_PROMPT_CACHING` | 全モデルのキャッシュ無効化 |
| `DISABLE_PROMPT_CACHING_HAIKU` | Haiku のキャッシュ無効化 |
| `DISABLE_PROMPT_CACHING_SONNET` | Sonnet のキャッシュ無効化 |
| `DISABLE_PROMPT_CACHING_OPUS` | Opus のキャッシュ無効化 |

---

## 5. 設定の確認方法

### /status コマンド

```
/status
```

このコマンドで以下を確認できます。

- アクティブな設定ソース
- 各層の出力元（リモート/plist/HKLM など）
- 使用中のモデル
- アカウント情報
- 設定ファイルのエラー

### 起動時のフラグ

```bash
claude --setting-sources
```

`--setting-sources` フラグで起動すると、各設定がどのスコープから読み込まれたかを確認できます。

---

## ハンズオン演習

### 演習 1: ユーザー設定ファイルの作成

**目的**: `~/.claude/settings.json` を作成し、`$schema` によるエディタ補完を体験する

**前提条件**: テキストエディタ（VS Code 推奨）と Claude Code がインストール済み

**手順**:

1. `~/.claude/settings.json` が存在しない場合は作成する:
   ```bash
   mkdir -p ~/.claude
   ```

2. 以下の内容を記述する:
   ```json
   {
     "$schema": "https://json.schemastore.org/claude-code-settings.json",
     "permissions": {
       "allow": [
         "Bash(git status)",
         "Bash(git diff *)",
         "Bash(git log *)"
       ]
     }
   }
   ```

3. VS Code で開いて、`"` を入力したときにオートコンプリートが動作することを確認する

**期待される結果**: `$schema` を設定することで、設定キーの候補が表示され、入力ミスを防げる。

### 演習 2: プロジェクト設定とローカル設定の使い分け

**目的**: Project 設定と Local 設定の優先順位を体験する

**前提条件**: 任意の Git リポジトリ

**手順**:

1. プロジェクトルートに `.claude/settings.json` を作成:
   ```json
   {
     "model": "sonnet"
   }
   ```

2. `.claude/settings.local.json` を作成:
   ```json
   {
     "model": "opus"
   }
   ```

3. Claude Code を起動し、`/status` で使用中のモデルを確認する

4. `.claude/settings.local.json` を削除して再起動し、モデルが変わることを確認する

**期待される結果**: Local 設定が Project 設定より優先されるため、最初は `opus` が、Local 削除後は `sonnet` が使われる。

### 演習 3: 環境変数による一時的な設定変更

**目的**: 環境変数による設定オーバーライドを体験する

**手順**:

1. 通常の起動でモデルを確認:
   ```bash
   claude
   # /status で確認
   ```

2. 環境変数を指定して起動:
   ```bash
   ANTHROPIC_MODEL=haiku claude
   # /status で確認
   ```

3. CLI 引数で起動:
   ```bash
   claude --model opus
   # /status で確認
   ```

**期待される結果**: 環境変数や CLI 引数が settings.json より優先されることを確認できる。

---

## よくある質問

**Q: Project 設定と User 設定が矛盾した場合、どちらが優先されますか？**
A: Project 設定が User 設定より優先されます。優先順位は Managed > CLI args > Local > Project > User です。

**Q: `$schema` は必須ですか？**
A: 必須ではありませんが、強く推奨します。エディタのオートコンプリートとバリデーションが有効になり、設定ミスを防げます。

**Q: 配列設定はどのスコープでも連結されますか？**
A: はい。`permissions.allow` や `permissions.deny` などの配列は、全スコープの値が連結され、重複が排除されます。上位スコープの値が下位を「上書き」するのではなく「マージ」されます。

**Q: Managed 設定がない環境ではどうなりますか？**
A: Managed 設定がない場合は、残りの4つのスコープ（CLI args > Local > Project > User）で優先順位が決まります。個人開発ではほとんどの場合、User と Project の2層で十分です。

**Q: 設定ファイルに構文エラーがある場合どうなりますか？**
A: Claude Code は起動時に警告を表示します。`/status` コマンドでもエラー情報が表示されるので、定期的に確認しましょう。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code は **Managed > CLI args > Local > Project > User** の5段階で設定を評価する
- **Managed 設定**は IT 管理者が組織ポリシーを強制するためのもので、ユーザーが上書きできない
- **配列設定はスコープ間で連結**される（置換ではなくマージ）
- `$schema` を追加するとエディタのオートコンプリートとバリデーションが有効になる
- **`/status`** で現在の設定状態を確認できる
- **環境変数**による設定は settings.json の `env` またはシェルの環境変数で行える

## 次のステップ

次の章「CLAUDE.md 設計パターン」では、プロジェクト固有の指示を永続化する CLAUDE.md ファイルの書き方とベストプラクティスを学びます。

---

> **公式リファレンス**
> - [Settings](https://code.claude.com/docs/en/settings)
> - [Permissions](https://code.claude.com/docs/en/permissions)
> - [Model configuration](https://code.claude.com/docs/en/model-config)
