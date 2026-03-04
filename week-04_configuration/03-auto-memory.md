# 自動メモリ機能

> **対応公式ドキュメント**: https://code.claude.com/docs/en/memory
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. 自動メモリと CLAUDE.md の違い（誰が書くか、何が保存されるか）を正確に説明できる
2. MEMORY.md の200行制限とトピックファイルの読み込みの仕組みを理解する
3. `/memory` コマンドでメモリの確認・管理ができる
4. 自動メモリの有効化/無効化を設定でき、メモリファイルを手動で編集できる

---

## 1. 2つのメモリシステム

Claude Code には2つの異なるメモリシステムがあります。これらは補完的に機能し、それぞれ異なる役割を担います。

### CLAUDE.md と自動メモリの比較

| | CLAUDE.md | 自動メモリ (Auto memory) |
|---|-----------|----------|
| **誰が書くか** | あなた（手動） | Claude（自動） |
| **内容** | 指示・ルール | 学習・パターン・知見 |
| **スコープ** | プロジェクト・ユーザー・組織 | プロジェクト（worktree）ごと |
| **読み込み** | セッション開始時にファイル全体 | MEMORY.md の最初の200行 |
| **用途** | コーディング規約・ワークフロー | ビルドコマンド・デバッグ知見・嗜好 |
| **共有** | Git にコミットしてチーム共有可能 | マシンローカル（共有不可） |

**要するに**: CLAUDE.md は「あなたが Claude に与える指示」、自動メモリは「Claude があなたとの作業から学んだこと」です。

---

## 2. 自動メモリの仕組み

### ストレージの場所

各プロジェクトのメモリは以下に保存されます。

```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # 概要インデックス（毎セッション読み込まれる）
├── debugging.md       # デバッグパターンの詳細ノート
├── api-conventions.md # API 設計の決定事項
└── ...                # Claude が作成するトピック別ファイル
```

`<project>` パスは Git リポジトリのルートから導出されます。そのため、**同じリポジトリの全 worktree とサブディレクトリが一つの自動メモリディレクトリを共有**します。Git リポジトリ外では、プロジェクトルートのパスが使用されます。

### MEMORY.md の200行制限

`MEMORY.md` の**最初の200行のみ**が毎セッション開始時に自動で読み込まれます。

- 200行以降のコンテンツは起動時には読み込まれない
- Claude は必要に応じてトピック別ファイル（`debugging.md` など）をオンデマンドで参照する
- `MEMORY.md` は簡潔なインデックスとして機能し、詳細は別ファイルへ

> **注意**: CLAUDE.md には200行制限がありません。CLAUDE.md はファイル全体が読み込まれます（ただし200行以下が推奨されるのは遵守率の観点から）。

### Claude が自動保存する内容

Claude はセッション中の作業から、将来のセッションで役立つと判断した情報を自動的に保存します。

- **ビルドコマンド**: 頻繁に使うビルド・テスト・デプロイコマンド
- **デバッグ知見**: 解決した問題とその解決策
- **プロジェクトのパターン**: コードベース固有の構造・命名規則
- **設定の嗜好**: あなたが修正した内容から学んだ好み
- **よく使うファイルパス**: 重要なファイルの場所

Claude が毎セッション何かを保存するわけではありません。将来の会話で役立つかどうかを判断して保存します。

### セッション中のメモリ操作の確認

Claude Code のインターフェースで「Writing memory」または「Recalled memory」が表示された場合、Claude がアクティブにメモリを更新または読み込んでいます。

---

## 3. 明示的にメモリに保存させる

Claude に覚えてほしいことがある場合は、直接伝えます。

### 自動メモリに保存

```
"常に pnpm を使うことを覚えておいて"
"API テストにはローカルの Redis インスタンスが必要なことを覚えておいて"
"このプロジェクトでは npm ではなく yarn を使うことを覚えておいて"
```

Claude はこれらを自動メモリに保存します。

### CLAUDE.md に保存

CLAUDE.md に追加したい場合は明示的に指示します。

```
"この規約を CLAUDE.md に追加して"
"このビルドコマンドを CLAUDE.md に記録して"
```

### 使い分けの指針

| 保存先 | 適した情報 | 例 |
|-------|----------|-----|
| CLAUDE.md | チーム全体で守るべきルール | コーディング規約、命名規則 |
| 自動メモリ | 個人的な知見、環境固有の情報 | ローカルのポート番号、デバッグTips |

---

## 4. メモリの管理

### /memory コマンド

```
/memory
```

このコマンドで以下を確認・操作できます。

- 現在のセッションで読み込まれている**全 CLAUDE.md ファイルの一覧**
- 自動メモリの**オン/オフ切替**
- 自動メモリフォルダを開く**リンク**
- 自動メモリファイルの**編集**

### メモリファイルの直接編集

自動メモリファイルはプレーンなマークダウンファイルなので、いつでも編集や削除ができます。

```bash
# メモリファイルの場所を確認
ls ~/.claude/projects/

# MEMORY.md を編集
nano ~/.claude/projects/<project>/memory/MEMORY.md

# 特定のトピックファイルを編集
nano ~/.claude/projects/<project>/memory/debugging.md
```

### 間違った情報の修正

自動メモリが誤った情報を保存した場合、ファイルを直接編集して削除します。次のセッションで Claude に削除を依頼することもできます。

```
"自動メモリから xxx に関する情報を削除して"
```

### 有効化・無効化の方法

自動メモリはデフォルトで有効です。無効化するには3つの方法があります。

**方法 1: /memory コマンドから**
```
/memory
```
コマンドを実行して、自動メモリのトグルをクリックします。

**方法 2: 設定ファイルで**
```json
// .claude/settings.json または ~/.claude/settings.json
{
  "autoMemoryEnabled": false
}
```

**方法 3: 環境変数で**
```bash
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
```

---

## 5. 実際の MEMORY.md の例

### 基本的な MEMORY.md

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

### トピック別ファイルの例（debugging.md）

```markdown
# Debugging Notes

## Database Connection Errors
- Check if PostgreSQL is running: `pg_isready`
- Default port: 5432
- Connection string in `.env.local`

## TypeScript Compilation Errors
- Clean build: `rm -rf dist && npm run build`
- Check tsconfig.json paths if module resolution fails

## Test Failures
- Redis must be running for integration tests
- Use `npm run test:unit` for unit tests only
```

---

## 6. メモリ戦略のベストプラクティス

### MEMORY.md の整理方針

MEMORY.md の最初の200行はセッション開始時に自動で読み込まれるため、最も重要な情報を上部に配置します。

```markdown
# Project Memory Index

## Critical Commands（最重要：常に参照される）
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Key Architecture（プロジェクト構造の要点）
- Monorepo: Turborepo + pnpm workspaces
- packages/api: Express backend
- packages/web: Next.js frontend

## Detailed Topics（詳細はトピックファイル参照）
- See debugging.md for common error patterns
- See api-conventions.md for REST API conventions
- See deployment.md for deployment procedures
```

### トピックファイルの活用

200行を超える情報はトピック別ファイルに分割します。Claude はタスクに関連するファイルを必要に応じてオンデマンドで参照します。

| トピックファイル | 内容の例 |
|---------------|---------|
| `debugging.md` | よくあるエラーと解決策 |
| `api-conventions.md` | API 設計の決定事項 |
| `deployment.md` | デプロイ手順と注意事項 |
| `dependencies.md` | 外部ライブラリの選定理由 |

### 自動メモリの定期メンテナンス

自動メモリは時間の経過とともに古い情報が蓄積される場合があります。月に1回程度、以下の確認を行うことを推奨します。

1. `~/.claude/projects/<project>/memory/MEMORY.md` を開く
2. 古くなった情報（変更されたコマンド、廃止された規約など）を削除
3. トピックファイルの中身も確認し、不要なものを整理

### サブエージェントとメモリ

Claude Code のサブエージェント（Explore エージェントなど）もメモリを参照できます。ただし、サブエージェントはメインセッションとは独立したコンテキストで動作するため、メモリの読み込みタイミングが異なります。

---

## ハンズオン演習

### 演習 1: 自動メモリの動作を確認する

**目的**: Claude が自動メモリに保存する瞬間を観察する

**前提条件**: Claude Code がインストール済みの任意のプロジェクト

**手順**:

1. Claude Code を起動:
   ```bash
   claude
   ```

2. Claude に以下を伝える:
   ```
   このプロジェクトではパッケージマネージャーに pnpm を使います。覚えておいてください。
   ```

3. 「Writing memory」の表示を確認する

4. `/memory` コマンドで保存された内容を確認する

5. セッションを終了して再起動し、以下を質問する:
   ```
   このプロジェクトのパッケージマネージャーは何ですか？
   ```

**期待される結果**: Claude が前のセッションで保存した情報を参照して「pnpm」と回答する。

### 演習 2: メモリファイルの確認と編集

**目的**: 自動メモリファイルを直接確認・編集する方法を習得する

**手順**:

1. メモリファイルの場所を確認:
   ```bash
   ls ~/.claude/projects/
   ```

2. プロジェクトのメモリディレクトリを見つける:
   ```bash
   ls ~/.claude/projects/<project>/memory/
   ```

3. MEMORY.md の内容を確認:
   ```bash
   cat ~/.claude/projects/<project>/memory/MEMORY.md
   ```

4. 不要な情報があれば直接編集して削除する

5. Claude Code を再起動して、編集した内容が反映されていることを確認する

**期待される結果**: メモリファイルがプレーンマークダウンとして編集可能であり、変更が次のセッションに反映される。

### 演習 3: CLAUDE.md と自動メモリの使い分け

**目的**: 情報の性質に応じて保存先を使い分ける

**手順**:

1. チーム共有すべきルールを CLAUDE.md に追記:
   ```
   「コミットメッセージは Conventional Commits 形式を使用する」を CLAUDE.md に追加して
   ```

2. 個人的な知見を自動メモリに保存:
   ```
   ローカルの Docker で PostgreSQL を起動するには `docker compose up -d db` を使うことを覚えておいて
   ```

3. `/memory` でそれぞれの保存先を確認する

**期待される結果**: チームルールは CLAUDE.md に、個人の環境情報は自動メモリに保存される。

---

## よくある質問

**Q: MEMORY.md の200行を超えた場合、超過部分はどうなりますか？**
A: 200行を超えた部分はセッション開始時には読み込まれません。ただし、Claude が必要と判断した場合に手動でファイル全体を参照することは可能です。重要な情報は200行以内に収めましょう。

**Q: 自動メモリは他のマシンと同期されますか？**
A: いいえ。自動メモリは `~/.claude/projects/` にマシンローカルで保存されるため、他のマシンとは共有されません。チームで共有すべき情報は CLAUDE.md に記述してください。

**Q: 同じリポジトリの異なるブランチでメモリは共有されますか？**
A: はい。自動メモリはGitリポジトリのルートから導出されるため、同じリポジトリの全 worktree とサブディレクトリで共有されます。

**Q: 自動メモリを完全にリセットしたい場合はどうすればいいですか？**
A: `~/.claude/projects/<project>/memory/` ディレクトリを削除すれば、そのプロジェクトの自動メモリが完全にリセットされます。

**Q: 自動メモリが間違った情報を保存していた場合は？**
A: メモリファイルを直接編集するか、次のセッションで Claude に「自動メモリから xxx を削除して」と依頼してください。

---

## まとめ

この章で学んだ重要ポイント：

- Claude Code には **CLAUDE.md**（ユーザーが書く指示）と**自動メモリ**（Claude が書く学習）の2つのメモリシステムがある
- 自動メモリは `~/.claude/projects/<project>/memory/` に**マシンローカル**で保存される
- `MEMORY.md` の**最初の200行のみ**がセッション開始時に読み込まれ、トピックファイルはオンデマンドで参照される
- 「覚えておいて」と伝えると Claude が**自動メモリに保存**する
- メモリファイルは**プレーンマークダウン**なのでいつでも編集・削除できる
- `/memory` コマンドで読み込まれているメモリの**確認と管理**ができる

## 次のステップ

次の章「パーミッションシステム」では、Claude が実行できる操作を細かく制御する仕組みを学びます。

---

> **公式リファレンス**
> - [Memory (Auto memory)](https://code.claude.com/docs/en/memory#auto-memory)
> - [CLAUDE.md files](https://code.claude.com/docs/en/memory#claudemd-files)
> - [Sub-agent memory](https://code.claude.com/docs/en/sub-agents#enable-persistent-memory)
