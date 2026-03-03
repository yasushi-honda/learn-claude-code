# パーミッションシステム

> 対応する公式ドキュメント: [Configure permissions](https://code.claude.com/docs/en/permissions)

## 学習目標

- Claude Code のパーミッションシステムの全体像を理解する
- 各パーミッションモード（Default、Auto-accept、Plan）の違いを把握する
- allowedTools / disallowedTools の設定方法を習得する
- パーミッションルールの構文を理解する
- プロジェクト・グローバルレベルの設定方法を覚える

## 概要

Claude Code は、Claude が何を実行できるかを細かく制御できるパーミッションシステムを備えています。ツールの種類ごと・コマンドのパターンごと・ファイルパスごとに、許可・確認・拒否を設定できます。これにより、安全に自動化の恩恵を受けながらリスクを最小化できます。

## パーミッションの種類

| ツール種別 | 例 | 承認要否 | 「再度聞かない」の動作 |
|-----------|-----|---------|-------------------|
| 読み取り専用 | ファイル読み取り・Grep | 不要 | N/A |
| Bash コマンド | シェル実行 | 要 | プロジェクトディレクトリ・コマンドごとに永続 |
| ファイル変更 | 編集・書き込み | 要 | セッション終了まで |

## パーミッションモード

`settings.json` の `defaultMode` で設定できます：

| モード | 説明 | 推奨シーン |
|-------|------|----------|
| `default` | 各ツールの初回使用時に承認を求める | 通常の使用 |
| `acceptEdits` | ファイル編集の承認を自動化（コマンドは確認） | ファイル変更を信頼している場合 |
| `plan` | コードを分析するが変更・コマンド実行はしない | 複雑なタスクの事前確認 |
| `dontAsk` | 事前承認済みのツール以外は自動拒否 | 厳しく制限したい場合 |
| `bypassPermissions` | 全承認プロンプトをスキップ | 隔離環境のみ（要注意） |

### Shift+Tab でのモード切り替え

Claude Code の UI で **Shift+Tab** を押すことで、以下のモードをサイクルできます：
- Default → Auto-accept edits → Plan mode

## パーミッションの管理

`/permissions` コマンドで許可ルールを UI から管理できます：

- **Allow**: 手動承認なしでツールを使用可能にする
- **Ask**: ツール使用のたびに確認を求める
- **Deny**: ツールの使用を禁止する

**ルールの評価順序**: `deny → ask → allow`（最初にマッチしたルールが勝つ）

## パーミッションルールの構文

### 基本形式

```
Tool または Tool(specifier)
```

### ツール全体を対象にする

| ルール | 効果 |
|-------|------|
| `Bash` | 全 Bash コマンドにマッチ |
| `WebFetch` | 全ウェブフェッチリクエストにマッチ |
| `Read` | 全ファイル読み取りにマッチ |

### Bash ルール（ワイルドカード対応）

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",           // npm run で始まるコマンド
      "Bash(git commit *)",        // git commit で始まるコマンド
      "Bash(git * main)",          // git ... main の形式
      "Bash(* --version)",         // --version フラグ付きコマンド
      "Bash(* --help *)"           // --help フラグ付きコマンド
    ],
    "deny": [
      "Bash(git push *)"           // git push を拒否
    ]
  }
}
```

**ワイルドカードの注意点**:
- `Bash(ls *)` は `ls -la` にはマッチするが `lsof` にはマッチしない（スペースが境界）
- `Bash(ls*)` は `ls -la` と `lsof` の両方にマッチする

### Read / Edit ルール（ファイルパス）

パスパターンは [gitignore](https://git-scm.com/docs/gitignore) 仕様に従います：

| パターン | 意味 | 例 | マッチ対象 |
|--------|------|-----|----------|
| `//path` | ファイルシステムルートからの絶対パス | `Read(//Users/alice/secrets/**)` | `/Users/alice/secrets/**` |
| `~/path` | ホームディレクトリからのパス | `Read(~/Documents/*.pdf)` | `/Users/alice/Documents/*.pdf` |
| `/path` | プロジェクトルートからの相対パス | `Edit(/src/**/*.ts)` | `<project>/src/**/*.ts` |
| `path` または `./path` | カレントディレクトリからの相対パス | `Read(*.env)` | `<cwd>/*.env` |

> **注意**: `/Users/alice/file` は絶対パスではなく、プロジェクトルートからの相対パスです。絶対パスには `//Users/alice/file` を使います。

### WebFetch ルール

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:api.example.com)"
    ]
  }
}
```

### MCP ルール

```json
{
  "permissions": {
    "allow": [
      "mcp__puppeteer",                        // puppeteer の全ツール
      "mcp__puppeteer__puppeteer_navigate"      // 特定のツールのみ
    ],
    "deny": [
      "mcp__filesystem"                        // filesystem MCP を拒否
    ]
  }
}
```

### サブエージェントルール

```json
{
  "permissions": {
    "deny": [
      "Agent(Explore)"   // Explore エージェントを無効化
    ]
  }
}
```

## 実際の設定例

### 典型的なプロジェクト設定

```json
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  }
}
```

### 読み取り専用モード（コードレビュー用）

```json
{
  "defaultMode": "plan",
  "permissions": {
    "deny": [
      "Bash",
      "Edit",
      "Write"
    ]
  }
}
```

### 自由度の高い開発環境

```json
// .claude/settings.local.json（個人専用）
{
  "defaultMode": "acceptEdits",
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(git *)",
      "Bash(docker *)"
    ]
  }
}
```

## 作業ディレクトリの拡張

デフォルトでは Claude は起動したディレクトリのファイルにアクセスできます。追加ディレクトリを許可するには：

**起動時のフラグ**:
```bash
claude --add-dir ../shared-config
```

**セッション中のコマンド**:
```
/add-dir ../shared-config
```

**設定ファイルで永続化**:
```json
{
  "permissions": {
    "additionalDirectories": ["../shared-config", "../docs"]
  }
}
```

## 組織ポリシーとの連携（Managed 設定）

組織の管理者は上書きできない設定を Managed 設定で配布できます。

**Managed のみ有効な設定**:

| 設定 | 説明 |
|-----|------|
| `disableBypassPermissionsMode` | `"disable"` で `bypassPermissions` モードと `--dangerously-skip-permissions` フラグを禁止 |
| `allowManagedPermissionRulesOnly` | `true` で管理設定のルールのみ適用（ユーザー・プロジェクト設定のルールを無効化） |
| `allowManagedHooksOnly` | `true` で管理フックのみ許可 |
| `allowManagedMcpServersOnly` | `true` で Managed の `allowedMcpServers` のみ使用可能 |

## --dangerously-skip-permissions について

> **重要**: `--dangerously-skip-permissions` フラグは全ての承認プロンプトをスキップします。**コンテナや VM などの隔離環境以外では絶対に使用しないでください。**

このフラグを禁止するには Managed 設定で：

```json
{
  "disableBypassPermissionsMode": "disable"
}
```

## まとめ

- パーミッションは `deny → ask → allow` の順で評価される
- Shift+Tab でモードを素早く切り替えられる
- `settings.json` の `permissions.allow/ask/deny` でルールを定義する
- Bash コマンドにはワイルドカード `*` が使える
- Read/Edit のファイルパスは gitignore 仕様に従う
- `//path` が絶対パス、`/path` はプロジェクトルートからの相対パス
- `bypassPermissions` は隔離環境のみで使用する

## 公式リファレンス

- [パーミッション設定](https://code.claude.com/docs/en/permissions)
- [設定ファイル](https://code.claude.com/docs/en/settings)
- [サンドボックス](https://code.claude.com/docs/en/sandboxing)
- [セキュリティ](https://code.claude.com/docs/en/security)
