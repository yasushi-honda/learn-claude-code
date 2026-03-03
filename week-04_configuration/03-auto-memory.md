# 自動メモリ機能

> 対応する公式ドキュメント: [How Claude remembers your project - Auto memory](https://code.claude.com/docs/en/memory#auto-memory)

## 学習目標

- 自動メモリの概念と CLAUDE.md との違いを理解する
- MEMORY.md ファイルの構造と読み込みの仕組みを把握する
- Claude が何を自動保存するかを理解する
- メモリの確認・編集・削除の方法を習得する
- セッション開始時の 200 行制限の意味を理解する

## 概要

自動メモリ（Auto memory）は、Claude Code が作業中に学習したことをセッションをまたいで保持する機能です。あなたがコメントした内容（「常に pnpm を使って」「Redis のインスタンスが必要」など）や、Claude が発見したプロジェクトのパターンを、Claude 自身がメモファイルに記録します。

**CLAUDE.md との違い**:

| | CLAUDE.md | 自動メモリ |
|---|-----------|----------|
| 誰が書くか | あなた（手動） | Claude（自動） |
| 内容 | 指示・ルール | 学習・パターン・知見 |
| スコープ | プロジェクト・ユーザー・組織 | プロジェクト（worktree）ごと |
| 読み込み | セッション開始時に全体 | セッション開始時に最初の200行 |
| 用途 | コーディング規約・ワークフロー | ビルドコマンド・デバッグ知見・嗜好 |

## 有効化・無効化

自動メモリはデフォルトで有効です。

### /memory コマンドから切り替え

```
/memory
```

コマンドを実行して、自動メモリのトグルをクリックします。

### 設定ファイルで無効化

```json
// .claude/settings.json または ~/.claude/settings.json
{
  "autoMemoryEnabled": false
}
```

### 環境変数で無効化

```bash
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
```

## ストレージの場所

各プロジェクトのメモリは以下に保存されます：

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 概要インデックス（毎セッション読み込まれる）
├── debugging.md       # デバッグパターンの詳細ノート
├── api-conventions.md # API 設計の決定事項
└── ...                # Claude が作成するトピック別ファイル
```

`<project>` パスは Git リポジトリから導出されるため、同じリポジトリの全 worktree とサブディレクトリが一つの自動メモリディレクトリを共有します。Git リポジトリ外では、プロジェクトルートが使用されます。

## MEMORY.md の 200 行制限

`MEMORY.md` の**最初の 200 行のみ**が毎セッション開始時に読み込まれます。

- 200 行以降のコンテンツは起動時には読み込まれない
- Claude は必要に応じてトピック別ファイル（`debugging.md` など）を手動で参照する
- `MEMORY.md` は簡潔なインデックスとして機能し、詳細は別ファイルへ

> **注意**: CLAUDE.md には 200 行制限がありません。CLAUDE.md はファイル全体が読み込まれます（ただし短いほど遵守率が高い）。

## Claude が自動保存する内容

Claude はセッションの作業中に以下のような情報を判断して保存します：

- **ビルドコマンド**: 頻繁に使うビルド・テスト・デプロイコマンド
- **デバッグ知見**: 解決した問題とその解決策
- **プロジェクトのパターン**: コードベース固有の構造・命名規則
- **設定の嗜好**: あなたが修正した内容から学んだ好み
- **よく使うファイルパス**: 重要なファイルの場所

Claude が毎セッション何かを保存するわけではありません。将来の会話で役立つかどうかを判断して保存します。

## 明示的にメモリに保存させる

Claude に覚えてほしいことがある場合は、直接伝えます：

```
"常に pnpm を使うことを覚えておいて"
"API テストにはローカルの Redis インスタンスが必要なことを覚えておいて"
"このプロジェクトでは npm ではなく yarn を使うことを覚えておいて"
```

Claude はこれらを自動メモリに保存します。

CLAUDE.md に追加したい場合は明示的に指示します：

```
"この規約を CLAUDE.md に追加して"
"このビルドコマンドを CLAUDE.md に記録して"
```

## メモリの確認・編集・削除

自動メモリファイルはプレーンなマークダウンファイルなので、いつでも編集や削除ができます。

### /memory コマンドで確認

```
/memory
```

セッション内のこのコマンドで：
- 読み込まれている全 CLAUDE.md ファイルの一覧
- 自動メモリのオン/オフ切替
- 自動メモリフォルダを開くリンク

が確認できます。

### ファイルを直接編集

```bash
# メモリファイルの場所を確認
ls ~/.claude/projects/

# MEMORY.md を編集
nano ~/.claude/projects/<project>/memory/MEMORY.md

# 特定のトピックファイルを編集
nano ~/.claude/projects/<project>/memory/debugging.md
```

### 間違った情報を削除

自動メモリが誤った情報を保存した場合、ファイルを直接編集して削除します。次のセッションで Claude に削除を依頼することもできます：

```
"自動メモリから xxx に関する情報を削除して"
```

## セッション中のメモリ操作の確認

Claude Code インターフェースで「Writing memory」または「Recalled memory」が表示された場合、Claude がアクティブにメモリを更新または読み込んでいます。

## 実際のMEMORY.md の例

```markdown
# Project Memory Index

## Build & Test
- Build: `npm run build` (TypeScript compile)
- Test: `npm test` (Jest)
- Dev server: `npm run dev` (port 3000)

## Package Manager
- Always use pnpm, not npm or yarn
- pnpm install for dependencies

## Key Files
- Main config: `src/config/index.ts`
- API routes: `src/api/routes/`
- DB schema: `prisma/schema.prisma`

## Debug Notes
- See debugging.md for common error patterns

## Architecture Decisions
- See api-conventions.md for REST API conventions
```

## まとめ

- 自動メモリはデフォルトで有効。`/memory` または設定ファイルで制御できる
- メモリは `~/.claude/projects/<project>/memory/` に保存される
- `MEMORY.md` の最初の 200 行のみがセッション開始時に読み込まれる
- 「常に pnpm を使って」などと伝えると Claude が自動保存する
- メモリファイルはプレーンマークダウンなのでいつでも編集・削除できる
- `/memory` コマンドで読み込まれているメモリを確認できる

## 公式リファレンス

- [メモリ（自動メモリ）](https://code.claude.com/docs/en/memory#auto-memory)
- [CLAUDE.md](https://code.claude.com/docs/en/memory#claudemd-files)
- [サブエージェントのメモリ](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory)
