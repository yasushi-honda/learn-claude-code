# CLAUDE.md 設計パターン

> **対応公式ドキュメント**: https://code.claude.com/docs/en/memory
> **想定所要時間**: 約60分
> **難易度**: ★★☆☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. CLAUDE.md の配置場所と読み込みの仕組み（ディレクトリウォーク・遅延ロード）を説明できる
2. `/init` コマンドで CLAUDE.md を自動生成し、手動で効果的に追記できる
3. `@path/to/import` 構文でファイルをインポートし、大きなドキュメントを分割できる
4. `.claude/rules/` を使ったパス指定ルールで高度な構成を組める

---

## 1. CLAUDE.md とは何か

CLAUDE.md は、プロジェクトのルートに配置するマークダウンファイルです。Claude Code はセッション開始時にこのファイルを自動的に読み込み、プロジェクトのコーディング規約、アーキテクチャ決定、ワークフロー、使用ライブラリなどの情報を各セッションで保持します。

「毎回同じことを説明しなくていい」「チームメンバー全員が同じガイドラインで Claude を使える」という大きな利点があります。

### CLAUDE.md の配置場所

CLAUDE.md は4つのスコープに配置できます。

| スコープ | 場所 | 用途 | 誰と共有 |
|---------|------|------|---------|
| **Managed ポリシー** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | 組織全体の指示（IT 管理） | 組織全員 |
| **プロジェクト** | `./CLAUDE.md` または `./.claude/CLAUDE.md` | チームで共有するプロジェクト指示 | ソース管理経由でチーム |
| **ユーザー** | `~/.claude/CLAUDE.md` | 全プロジェクト共通の個人設定 | 自分のみ（全プロジェクト） |
| **ローカル** | `./CLAUDE.local.md` | 個人のプロジェクト固有設定 | 自分のみ（`.gitignore` 済み） |

### ディレクトリウォークによる読み込み

Claude Code は現在の作業ディレクトリから**上位に向かってディレクトリツリーを辿り**、各ディレクトリで CLAUDE.md と CLAUDE.local.md を探します。

例えば `foo/bar/` で Claude Code を実行すると：
- `foo/bar/CLAUDE.md`
- `foo/CLAUDE.md`

の両方が読み込まれます。

**サブディレクトリの遅延ロード**: サブディレクトリ内の CLAUDE.md は、そのサブディレクトリ内のファイルを Claude が読み書きするときに初めて読み込まれます（セッション開始時ではなく、オンデマンド）。

### --add-dir ディレクトリの CLAUDE.md

`--add-dir` で追加したディレクトリの CLAUDE.md を読み込むには、環境変数を設定します。

```bash
export CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1
```

---

## 2. CLAUDE.md のセットアップ

### /init コマンドで自動生成

```
/init
```

このコマンドを実行すると、Claude がコードベースを分析して CLAUDE.md のドラフトを自動生成します。生成される内容：

- ビルドコマンドとテスト手順
- プロジェクトの規約（命名規則、コードスタイルなど）
- Claude が発見したプロジェクト固有のパターン

CLAUDE.md が既に存在する場合は、改善案の提案のみ行います（上書きはしません）。自動生成後は、Claude が自動発見できない情報（アーキテクチャの決定理由など）を手動で追記します。

### 効果的な CLAUDE.md の書き方

#### サイズ指針

> **公式ドキュメントより**: 1ファイルあたり **200 行以下** を推奨します。

大きなファイルはコンテキストウィンドウを多く消費し、指示の遵守率が下がります。大きくなった場合は以下を活用してください。

- `@path/to/file` インポート構文で別ファイルに分割
- `.claude/rules/` ディレクトリにトピック別に移動

#### マークダウン形式で構造化する

Claude は構造を読者と同じようにスキャンします。整理されたセクションは密なパラグラフより理解されやすいです。

```markdown
# プロジェクト: MyApp

## ビルドとテスト
- ビルド: `npm run build`
- テスト: `npm test`
- リント: `npm run lint`

## コーディング規約
- TypeScript を使用（any 型禁止）
- インデント: 2スペース
- API ハンドラーは `src/api/handlers/` に配置

## アーキテクチャ
- フロントエンド: React + TypeScript
- バックエンド: Express + Prisma
- データベース: PostgreSQL
```

#### 具体的で検証可能な指示を書く

抽象的な指示より、具体的で検証可能な指示が効果的です。

| 悪い例（抽象的） | 良い例（具体的） |
|-------------|-------------|
| コードをきれいにフォーマットして | 2スペースインデントを使用して |
| 変更前にテストして | `npm test` を実行してからコミットして |
| ファイルを整理して | API ハンドラーは `src/api/handlers/` に配置して |

#### 矛盾を避ける

矛盾する指示があると Claude がどちらかを任意に選んでしまいます。定期的に見直して矛盾する指示を削除し、古くなった指示を更新してください。

---

## 3. ファイルのインポート

### @path/to/import 構文

`@path/to/import` 構文で他のファイルを CLAUDE.md に取り込めます。

```markdown
# プロジェクト概要

詳細は以下を参照：
@README.md

利用可能な npm コマンド: @package.json

Git ワークフロー: @docs/git-workflow.md
```

インポートされたファイルは起動時に展開されてコンテキストに読み込まれます。相対パスはインポートするファイルからの相対パスで解決されます。

### インポートの制限

- **最大深度 5 ホップ**: インポートしたファイル内の `@path` は最大5段階まで再帰的に展開されます
- **初回承認ダイアログ**: 初めてインポートされるファイルには承認ダイアログが表示されます

### 活用パターン

大規模プロジェクトでは以下のような分割が有効です。

```markdown
# プロジェクト: ECサイト

## 基本情報
@docs/architecture.md
@docs/coding-standards.md

## ワークフロー
@docs/git-workflow.md
@docs/deployment.md
```

---

## 4. .claude/rules/ による高度な構成

### ディレクトリ構造

大規模プロジェクトでは `.claude/rules/` ディレクトリを使ってトピック別に分割できます。

```
your-project/
├── CLAUDE.md               # メインの概要・基本指示
└── .claude/
    ├── CLAUDE.md           # Claude Code 設定（オプション）
    └── rules/
        ├── code-style.md   # コードスタイルガイドライン
        ├── testing.md      # テスト規約
        └── security.md     # セキュリティ要件
```

`.claude/rules/` 内のファイルは**常に読み込まれます**（パス指定がない場合）。

### パス指定のルール（path-specific rules）

フロントマターの `paths` フィールドで、特定のファイルタイプにのみ適用されるルールを定義できます。

```markdown
---
paths:
  - "src/api/**/*.ts"
---

# API 開発ルール

- 全エンドポイントに入力バリデーションを含める
- 標準エラーレスポンスフォーマットを使用する
- OpenAPI ドキュメントコメントを含める
```

`paths` フィールドのないルールファイルはすべてのファイルに適用されます。

### Glob パターンの書き方

| パターン | マッチ対象 |
|--------|----------|
| `**/*.ts` | 全ディレクトリの TypeScript ファイル |
| `src/**/*` | `src/` 配下の全ファイル |
| `*.md` | プロジェクトルートの Markdown ファイル |
| `src/**/*.{ts,tsx}` | 複数拡張子（brace expansion 対応） |

### ユーザーレベル rules

`~/.claude/rules/` にファイルを配置すると、全プロジェクトで適用されるユーザーレベルの共通ルールを定義できます。

### claudeMdExcludes 設定

不要な CLAUDE.md を除外するには `claudeMdExcludes` 設定を使います。

```json
{
  "claudeMdExcludes": ["vendor/**", "node_modules/**"]
}
```

### シンボリックリンク対応

CLAUDE.md ファイルはシンボリックリンクをサポートしています。リンク先のファイルが読み込まれます。

---

## 5. CLAUDE.md の実例

実際のプロジェクトで使える完全な CLAUDE.md の例を示します。

```markdown
# プロジェクト: ECサイトバックエンド

## 環境
- Node.js 20 LTS
- TypeScript 5.x
- PostgreSQL 16

## ビルド・テスト
- `npm run build` - TypeScript コンパイル
- `npm test` - Jest テスト実行
- `npm run test:watch` - テストウォッチモード
- `npm run lint` - ESLint チェック

## コーディング規約
- 全ファイルで TypeScript を使用（`any` 型は禁止）
- インデント: 2スペース
- セミコロン: 必須
- 文字列: シングルクォート
- エラーハンドリング: `Result<T, E>` パターンを使用

## ディレクトリ構造
- `src/api/` - API ルートハンドラー
- `src/services/` - ビジネスロジック
- `src/repositories/` - データアクセス層
- `src/types/` - 型定義

## データベース
- マイグレーション: `npm run db:migrate`
- スキーマ変更は必ず TypeScript 型も更新する
- Prisma ORM を使用（生の SQL は避ける）

## Git ワークフロー
- feature ブランチで作業
- PR には必ず `Closes #XX` を記載
- コミットメッセージ: `feat:`, `fix:`, `chore:` プレフィックスを使用
```

---

## ハンズオン演習

### 演習 1: /init で CLAUDE.md を生成する

**目的**: 既存プロジェクトに CLAUDE.md を自動生成し、手動で追記する

**前提条件**: ソースコードを含む Git リポジトリ

**手順**:

1. プロジェクトルートで Claude Code を起動:
   ```bash
   cd /path/to/your/project
   claude
   ```

2. `/init` コマンドを実行:
   ```
   /init
   ```

3. 生成された CLAUDE.md を確認し、Claude が発見できなかった情報を追記する:
   - アーキテクチャの決定理由
   - チーム固有の命名規則
   - 外部サービスとの連携情報

4. `/memory` コマンドで読み込みを確認する

**期待される結果**: CLAUDE.md にプロジェクトの基本情報（ビルドコマンド、テスト方法、ディレクトリ構造）が記録される。

### 演習 2: .claude/rules/ でパス指定ルールを作成する

**目的**: 特定のファイルタイプにのみ適用されるルールを作成する

**手順**:

1. `.claude/rules/` ディレクトリを作成:
   ```bash
   mkdir -p .claude/rules
   ```

2. API 用のルールファイルを作成（`.claude/rules/api-rules.md`）:
   ```markdown
   ---
   paths:
     - "src/api/**/*.ts"
   ---

   # API 開発ルール

   - 全エンドポイントに入力バリデーションを含める
   - レスポンスは `{ data, error, meta }` 形式を使用する
   - ステータスコードは RESTful に準拠する
   ```

3. テスト用のルールファイルを作成（`.claude/rules/test-rules.md`）:
   ```markdown
   ---
   paths:
     - "**/*.test.ts"
     - "**/*.spec.ts"
   ---

   # テスト規約

   - describe/it のネスト構造で日本語のテスト名を使用する
   - モックは各テストケースで独立させる
   - 境界値テストを必ず含める
   ```

4. Claude Code を起動し、API ファイルの編集時にルールが適用されることを確認する

**期待される結果**: `src/api/` 配下のファイルを編集するときのみ API ルールが適用され、テストファイルにはテスト規約が適用される。

### 演習 3: @import でドキュメントを分割する

**目的**: 大きな CLAUDE.md を `@path` 構文で分割する

**手順**:

1. `docs/coding-standards.md` にコーディング規約を移動
2. `docs/git-workflow.md` に Git ワークフローを移動
3. CLAUDE.md を以下のように書き換え:
   ```markdown
   # プロジェクト: MyApp

   ## コーディング規約
   @docs/coding-standards.md

   ## Git ワークフロー
   @docs/git-workflow.md
   ```

4. Claude Code を起動し、インポートが正しく展開されることを確認する

**期待される結果**: CLAUDE.md が簡潔になり、各ドキュメントが正しくインポートされる。

---

## よくある質問

**Q: CLAUDE.md と CLAUDE.local.md の違いは何ですか？**
A: CLAUDE.md はチームで共有するプロジェクト指示で Git にコミットします。CLAUDE.local.md は個人用の設定で `.gitignore` に含まれ、Git にはコミットされません。個人の好みやローカル環境固有の情報を記述します。

**Q: CLAUDE.md が大きくなりすぎた場合、どうすればいいですか？**
A: 200 行以下を目標に、`@path/to/file` でインポート分割するか、`.claude/rules/` にトピック別に移動してください。大きすぎる CLAUDE.md はコンテキストウィンドウを消費し、指示の遵守率が下がります。

**Q: サブディレクトリの CLAUDE.md はいつ読み込まれますか？**
A: サブディレクトリの CLAUDE.md は、そのディレクトリ内のファイルを Claude が読み書きするときにオンデマンドで読み込まれます。セッション開始時には読み込まれません。

**Q: @import の最大深度はいくつですか？**
A: 最大 5 ホップです。インポートしたファイル内の `@path` は最大5段階まで再帰的に展開されます。

**Q: /memory コマンドで何が確認できますか？**
A: 現在のセッションで読み込まれている全 CLAUDE.md ファイルの一覧、自動メモリのオン/オフ切替、自動メモリフォルダを開くリンクが確認できます。

---

## まとめ

この章で学んだ重要ポイント：

- CLAUDE.md は**セッション開始時に自動読み込み**される永続的な指示ファイル
- **4つのスコープ**（Managed、プロジェクト、ユーザー、ローカル）に配置できる
- `/init` コマンドでコードベースを分析して**自動生成**できる
- **200 行以下**を目標に、具体的で検証可能な指示を書く
- `@path/to/file` 構文で**最大5ホップ**までインポートできる
- `.claude/rules/` で**パス指定ルール**を使い、ファイルタイプ別の指示を定義できる

## 次のステップ

次の章「自動メモリ機能」では、Claude 自身がセッション中に学習した情報を自動保存する仕組みと、CLAUDE.md との使い分けを学びます。

---

> **公式リファレンス**
> - [Memory (CLAUDE.md)](https://code.claude.com/docs/en/memory)
> - [Skills](https://code.claude.com/docs/en/skills)
> - [Settings](https://code.claude.com/docs/en/settings)
