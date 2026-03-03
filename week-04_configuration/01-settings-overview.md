# 設定ファイル体系

> 対応する公式ドキュメント: [Settings](https://code.claude.com/docs/en/settings)

## 学習目標

- Claude Code の3階層設定システムの全体像を理解する
- 各設定ファイルの場所と用途を覚える
- 設定の優先順位とマージルールを理解する
- 主要な設定項目の意味と使い方を習得する
- 環境変数による設定方法を理解する

## 概要

Claude Code は階層的な設定システムを採用しています。グローバル（ユーザー全体）・プロジェクト（チーム共有）・ローカル（個人専用）の3層で設定を管理することで、組織のセキュリティポリシーを維持しながら個人の柔軟性も確保できます。

## 4つの設定スコープ

| スコープ | 保存場所 | 対象範囲 | チーム共有 |
|---------|---------|---------|----------|
| **Managed** | サーバー管理/plist/registry | マシンの全ユーザー | IT 部門が配置 |
| **User** | `~/.claude/settings.json` | 全プロジェクト共通 | 個人設定 |
| **Project** | `.claude/settings.json` | リポジトリの協力者 | Git にコミット |
| **Local** | `.claude/settings.local.json` | このリポジトリのみ | .gitignore 済み |

## 設定ファイルの優先順位

設定は以下の優先順位で適用されます（高い順）：

```
1. Managed 設定（最高優先度・上書き不可）
   ├─ サーバー管理設定
   ├─ MDM/OS レベルポリシー
   └─ managed-settings.json

2. コマンドライン引数（一時的上書き）

3. Local 設定 (.claude/settings.local.json)

4. Project 設定 (.claude/settings.json)

5. User 設定 (~/.claude/settings.json)
```

**例**: User 設定で許可、Project 設定で拒否 → **Project 優先（拒否）**

## settings.json の基本構造

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

`$schema` を追加すると VS Code などのエディタでオートコンプリートとインライン検証が有効になります。

## 主要設定項目

### パーミッション関連

| キー | 説明 | 例 |
|-----|------|-----|
| `permissions.allow` | 許可するツール使用 | `["Bash(git diff *)"]` |
| `permissions.ask` | 確認を求める操作 | `["Bash(git push *)"]` |
| `permissions.deny` | 拒否するツール使用 | `["WebFetch", "Read(./.env)"]` |
| `permissions.additionalDirectories` | アクセス可能な追加ディレクトリ | `["../docs/"]` |

詳細は [Week 4: パーミッションシステム](./04-permissions.md) を参照。

### モデル設定

| キー | 説明 | 例 |
|-----|------|-----|
| `model` | デフォルトモデル | `"claude-sonnet-4-6"` または `"sonnet"` |
| `availableModels` | 選択可能なモデルの制限 | `["sonnet", "haiku"]` |

詳細は [Week 4: モデル設定](./05-model-config.md) を参照。

### フック設定

| キー | 説明 |
|-----|------|
| `hooks` | ライフサイクルイベント時に実行するコマンド |
| `disableAllHooks` | 全フック無効化 |
| `allowManagedHooksOnly` | 管理フックのみ許可 |

### MCP サーバー設定

| キー | 説明 |
|-----|------|
| `enableAllProjectMcpServers` | 全 MCP サーバーを自動承認 |
| `deniedMcpServers` | 拒否するサーバーのリスト |

### その他の重要設定

| キー | 説明 | 例 |
|-----|------|-----|
| `outputStyle` | 出力スタイル | `"Explanatory"` |
| `respectGitignore` | .gitignore を尊重するか | `true` |
| `autoMemoryEnabled` | 自動メモリの有効/無効 | `true` |
| `defaultMode` | デフォルトのパーミッションモード | `"default"` |

## 環境変数による設定

`settings.json` の `env` キーに環境変数を設定できます：

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-...",
    "MY_CUSTOM_VAR": "value"
  }
}
```

**主要な環境変数**

| 変数名 | 説明 |
|-------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー |
| `ANTHROPIC_MODEL` | デフォルトモデル |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | opus エイリアスのマッピング先モデル |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | sonnet エイリアスのマッピング先モデル |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | haiku エイリアスのマッピング先モデル |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | 自動メモリの無効化（`1` で無効） |
| `MAX_THINKING_TOKENS` | 拡張思考の最大トークン数 |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | テレメトリの有効化 |

## 設定の確認方法

現在の設定状態を確認するには：

```
/status
```

このコマンドで以下を確認できます：
- アクティブな設定ソース
- 各層の出力元（リモート/plist/HKLM など）
- 設定ファイルのエラー

`--setting-sources` フラグで起動すると設定元も確認できます。

## 配列設定のマージ動作

同じ配列設定が複数スコープに存在する場合、**連結・重複排除されます**（置換ではなく）。

例:
- Managed: `["//opt/company-tools"]`
- User: `["~/.kube"]`
- **結果**: `["//opt/company-tools", "~/.kube"]`

## ベストプラクティス

| 用途 | 推奨スコープ |
|-----|------------|
| セキュリティポリシー（全社） | Managed |
| チーム標準設定 | Project (`.claude/settings.json`) |
| 個人の実験・一時設定 | Local (`.claude/settings.local.json`) |
| グローバルなツール設定 | User (`~/.claude/settings.json`) |

## まとめ

- 設定は Managed > Local > Project > User の優先順位で適用される
- `settings.json` に `$schema` を追加するとエディタ補完が有効になる
- 配列設定は上書きではなく連結される
- `/status` で現在の設定状態を確認できる
- チーム共有の設定は `.claude/settings.json` に、個人設定は `.claude/settings.local.json` または `~/.claude/settings.json` に配置する

## 公式リファレンス

- [設定ファイル](https://code.claude.com/docs/en/settings)
- [パーミッション](https://code.claude.com/docs/en/permissions)
- [モデル設定](https://code.claude.com/docs/en/model-config)
