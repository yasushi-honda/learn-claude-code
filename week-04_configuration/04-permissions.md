# パーミッションシステム

> **対応公式ドキュメント**: https://code.claude.com/docs/en/permissions
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. パーミッションの評価順序（deny > ask > allow）を理解し、ルール設計に活かせる
2. 5つのパーミッションモードの違いを把握し、状況に応じて使い分けられる
3. Bash、Read/Edit、WebFetch、MCP、Agent のルール構文を正確に記述できる
4. Permissions と Sandboxing の違いを説明し、組織ポリシーに合わせた設定ができる

---

## 1. パーミッションの基本

Claude Code は、Claude が何を実行できるかを細かく制御できるパーミッションシステムを備えています。ツールの種類ごと、コマンドのパターンごと、ファイルパスごとに、許可・確認・拒否を設定できます。

### ツール種別と承認の要否

| ツール種別 | 例 | 承認要否 | 「再度聞かない」の動作 |
|-----------|-----|---------|-------------------|
| 読み取り専用 | ファイル読み取り、Grep | 不要 | N/A |
| Bash コマンド | シェル実行 | 毎回要 | プロジェクトディレクトリ・コマンドごとに永続 |
| ファイル変更 | 編集・書き込み | 要 | セッション終了まで |

### ルールの評価順序

**`deny > ask > allow`**（最初にマッチしたルールが勝つ）

この順序は重要です。deny リストにマッチすれば、allow に含まれていても拒否されます。

```
例:
  deny:  ["Bash(rm -rf *)"]
  allow: ["Bash(*)"]

  → "rm -rf /" は deny にマッチするため拒否される
  → "ls -la" は deny にマッチしないため allow で許可される
```

---

## 2. パーミッションモード

5つのモードが用意されています。`settings.json` の `defaultMode` または `Shift+Tab` で切り替えます。

| モード | 説明 | 推奨シーン |
|-------|------|----------|
| `default` | 各ツールの初回使用時に承認を求める | 通常の使用 |
| `acceptEdits` | ファイル編集の承認を自動化（コマンドは確認） | ファイル変更を信頼している場合 |
| `plan` | コードを分析するが変更・コマンド実行はしない | 複雑なタスクの事前確認 |
| `dontAsk` | 事前承認済みのツール以外は自動拒否 | 厳しく制限したい場合 |
| `bypassPermissions` | 全承認プロンプトをスキップ | **隔離環境のみ（要注意）** |

### Shift+Tab でのモード切り替え

Claude Code の UI で **Shift+Tab** を押すことで、以下のモードをサイクルできます。

```
Default → Auto-accept edits → Plan mode → Default → ...
```

---

## 3. パーミッションルールの構文

### /permissions コマンド

```
/permissions
```

このコマンドで許可ルールを UI から管理できます。

### 基本形式

```
Tool または Tool(specifier)
```

- `Tool` はツール全体にマッチ
- `Tool(specifier)` は特定のパターンにマッチ

### Bash ルール

シェルコマンドの許可・拒否を細かく制御できます。

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)",
      "Bash(git * main)",
      "Bash(* --version)",
      "Bash(* --help *)"
    ],
    "deny": [
      "Bash(git push *)"
    ]
  }
}
```

**ワイルドカードの動作**:
- `*` はスペース区切りの単語の境界を跨がないパターンマッチ
- `Bash(ls *)` は `ls -la` にマッチするが `lsof` にはマッチしない（スペースが境界）
- `Bash(ls*)` は `ls -la` と `lsof` の両方にマッチする

**シェル演算子の扱い**:
プレフィックスマッチのルールは、`&&` や `||` で連鎖したコマンドを自動的に許可しません。

```
allow: ["Bash(npm test *)"]

→ "npm test src/" は許可
→ "npm test src/ && rm -rf /" は拒否（&& 以降のコマンドも評価される）
```

### Read / Edit ルール

ファイルパスの許可・拒否を制御します。パスパターンは **gitignore 仕様**に準拠します。

| パターン | 意味 | 例 | マッチ対象 |
|--------|------|-----|----------|
| `//path` | ファイルシステムルートからの絶対パス | `Read(//Users/alice/secrets/**)` | `/Users/alice/secrets/` 配下 |
| `~/path` | ホームディレクトリからのパス | `Read(~/Documents/*.pdf)` | `~/Documents/*.pdf` |
| `/path` | プロジェクトルートからの相対パス | `Edit(/src/**/*.ts)` | `<project>/src/` 配下の .ts |
| `path` or `./path` | カレントディレクトリからの相対パス | `Read(*.env)` | `<cwd>/*.env` |

> **重要**: `/Users/alice/file` は絶対パスではありません。プロジェクトルートからの相対パスとして解釈されます。絶対パスには `//Users/alice/file` を使います。

**再帰パターン**: `**` でサブディレクトリを再帰的にマッチします。

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./secrets/**)",
      "Edit(//etc/**)"
    ]
  }
}
```

### WebFetch ルール

`domain:` プレフィックスでドメイン単位のアクセス制御ができます。

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

MCP サーバーとツールのアクセスを制御します。

```json
{
  "permissions": {
    "allow": [
      "mcp__puppeteer",
      "mcp__puppeteer__puppeteer_navigate"
    ],
    "deny": [
      "mcp__filesystem"
    ]
  }
}
```

- `mcp__<server>`: サーバーの全ツールにマッチ
- `mcp__<server>__<tool>`: 特定のツールのみにマッチ

### Agent ルール

サブエージェントのアクセスを制御します。

```json
{
  "permissions": {
    "deny": [
      "Agent(Explore)"
    ],
    "allow": [
      "Agent(custom-agent)"
    ]
  }
}
```

---

## 4. 実際の設定例

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

---

## 5. 作業ディレクトリの拡張

デフォルトでは Claude は起動したディレクトリのファイルにアクセスできます。追加ディレクトリを許可するには以下の方法があります。

### 起動時のフラグ

```bash
claude --add-dir ../shared-config
```

### セッション中のコマンド

```
/add-dir ../shared-config
```

### 設定ファイルで永続化

```json
{
  "permissions": {
    "additionalDirectories": ["../shared-config", "../docs"]
  }
}
```

---

## 6. Permissions と Sandboxing の違い

| | Permissions | Sandboxing |
|--|------------|-----------|
| **レベル** | ツールアクセス制御 | OS レベルの強制 |
| **目的** | Claude が使用するツールを制限 | プロセス全体のファイル/ネットワークアクセスを制限 |
| **バイパス** | `bypassPermissions` で無効化可能 | OS が強制するためバイパス不可 |
| **設定場所** | settings.json | OS / コンテナ設定 |

Permissions は「Claude に何を許可するか」、Sandboxing は「Claude Code プロセスが何にアクセスできるか」です。

---

## 7. 組織ポリシーとの連携（Managed 設定）

組織の管理者は上書きできない設定を Managed 設定で配布できます。

### Managed のみ有効な設定

| 設定 | 説明 |
|-----|------|
| `disableBypassPermissionsMode` | `"disable"` で `bypassPermissions` モードと `--dangerously-skip-permissions` フラグを禁止 |
| `allowManagedPermissionRulesOnly` | `true` で管理設定のルールのみ適用（ユーザー・プロジェクト設定のルールを無効化） |
| `allowManagedHooksOnly` | `true` で管理フックのみ許可 |
| `allowManagedMcpServersOnly` | `true` で Managed の `allowedMcpServers` のみ使用可能 |

### --dangerously-skip-permissions について

> **重要**: `--dangerously-skip-permissions` フラグは全ての承認プロンプトをスキップします。**コンテナや VM などの隔離環境以外では絶対に使用しないでください。**

このフラグを組織で禁止するには：

```json
// Managed 設定
{
  "disableBypassPermissionsMode": "disable"
}
```

---

## ハンズオン演習

### 演習 1: deny > ask > allow の動作を確認する

**目的**: パーミッションの評価順序を体験的に理解する

**前提条件**: 任意の Git リポジトリで Claude Code が起動できること

**手順**:

1. `.claude/settings.local.json` に以下を設定:
   ```json
   {
     "permissions": {
       "allow": ["Bash(git *)"],
       "deny": ["Bash(git push *)"]
     }
   }
   ```

2. Claude Code を起動し、以下を試す:
   - `git status` を実行させる（allow にマッチ → 許可される）
   - `git push origin main` を実行させる（deny にマッチ → 拒否される）

3. deny から `Bash(git push *)` を削除して再起動し、`git push` の動作が変わることを確認する

**期待される結果**: deny が allow より優先されることを確認できる。

### 演習 2: パス指定のルールを作成する

**目的**: Read/Edit ルールのパス構文を実践する

**手順**:

1. `.claude/settings.local.json` に以下を設定:
   ```json
   {
     "permissions": {
       "deny": [
         "Read(./.env)",
         "Read(./.env.*)",
         "Read(./secrets/**)"
       ],
       "allow": [
         "Read(/src/**/*.ts)",
         "Edit(/src/**/*.ts)"
       ]
     }
   }
   ```

2. Claude に `.env` ファイルを読むよう依頼し、拒否されることを確認

3. Claude に `src/` 配下の TypeScript ファイルを読むよう依頼し、許可されることを確認

**期待される結果**: ファイルパスに基づいたアクセス制御が正しく機能する。

### 演習 3: /permissions コマンドでルールを管理する

**目的**: UI からパーミッションルールを追加・削除する方法を習得する

**手順**:

1. Claude Code を起動し、`/permissions` を実行
2. allow リストに `Bash(npm test *)` を追加
3. deny リストに `Bash(curl *)` を追加
4. 設定が `.claude/settings.local.json` に保存されたことを確認

**期待される結果**: `/permissions` コマンドで直感的にルールを管理でき、設定ファイルに反映される。

---

## よくある質問

**Q: 「再度聞かない」を選んだ後、元に戻すにはどうすればいいですか？**
A: `/permissions` コマンドから該当ルールを削除するか、`.claude/settings.local.json` を直接編集してルールを削除してください。

**Q: MCP ツールのパーミッションはどのように管理しますか？**
A: `mcp__<server>` でサーバー全体、`mcp__<server>__<tool>` で個別ツールを allow/deny できます。

**Q: acceptEdits モードと bypassPermissions モードの違いは何ですか？**
A: `acceptEdits` はファイル編集のみ自動承認しますが、Bash コマンドの実行には依然として確認を求めます。`bypassPermissions` は全ての承認をスキップするため、コンテナや VM などの隔離環境でのみ使用してください。

**Q: プロジェクト設定で deny したルールを、ローカル設定で allow できますか？**
A: 配列設定はスコープ間でマージされますが、deny > allow の優先順位が適用されます。プロジェクトで deny されたルールをローカルで allow に追加しても、deny が勝ちます。

---

## まとめ

この章で学んだ重要ポイント：

- パーミッションは **deny > ask > allow** の順で評価される（最初にマッチしたルールが勝つ）
- **5つのモード**（default、acceptEdits、plan、dontAsk、bypassPermissions）を状況に応じて使い分ける
- **Bash ルール**はワイルドカード `*` でパターンマッチし、シェル演算子の連鎖も考慮される
- **Read/Edit ルール**は gitignore 仕様に準拠し、`//` が絶対パス、`/` がプロジェクトルート
- **Permissions はツールアクセス制御**、**Sandboxing は OS レベルの強制**で役割が異なる
- `bypassPermissions` は**隔離環境のみ**で使用する

## 次のステップ

次の章「モデル設定」では、Claude Code で使用するモデルの選択・切り替え方法と、opusplan によるコスト最適化を学びます。

---

> **公式リファレンス**
> - [Permissions](https://code.claude.com/docs/en/permissions)
> - [Sandboxing](https://code.claude.com/docs/en/sandboxing)
> - [Settings](https://code.claude.com/docs/en/settings)
> - [Security](https://code.claude.com/docs/en/security)
