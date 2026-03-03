# Lesson 1: Skillsシステム概要・作成方法

> 対応する公式ドキュメント: [Extend Claude with skills](https://code.claude.com/docs/en/skills)

## 学習目標

- Skillsとは何か、なぜ使うのかを理解できる
- `SKILL.md` ファイルを作成してカスタムスキルを作れる
- Skills の配置場所と適用範囲を説明できる
- `disable-model-invocation` など frontmatter の各フィールドを使いこなせる
- サポートファイルを活用して高度なスキルを構築できる

## 概要

Skillsは、Claude Codeの機能をカスタムコマンドで拡張する仕組みです。`SKILL.md`ファイルに指示を書くだけで、Claudeはそれをツールキットの一部として認識します。`/コマンド名`で直接呼び出すこともでき、Claudeが文脈から自動的に使用することもできます。

たとえば、コードレビューの手順をSkillとして定義しておけば、毎回同じ指示を打ち込む必要がなくなります。チームで共有すれば、全員が一貫したワークフローを使えるようになります。

## 本文

### Skillsとは

公式ドキュメントによると、Skillsは「[Agent Skills](https://agentskills.io) オープン標準」に準拠しており、複数のAIツールにまたがって動作します。Claude Codeはこの標準を以下の機能で拡張しています：

- **呼び出し制御**: ユーザーが手動で呼び出すか、Claudeが自動で呼び出すかを制御
- **サブエージェント実行**: 独立したコンテキストで実行
- **動的コンテキスト注入**: シェルコマンドで動的なデータをスキルに挿入

### バンドル済みSkills

Claude Codeには最初から使えるSkillsが付属しています：

| コマンド | 説明 |
|---------|------|
| `/simplify` | 最近変更したファイルのコード品質を改善する（3つのレビューエージェントを並列実行） |
| `/batch <instruction>` | コードベース全体への大規模変更を並列で実行 |
| `/debug [description]` | 現在のセッションのデバッグログを読み込んでトラブルシュート |

### 最初のSkillを作る

以下の例では、コードをビジュアルな図と類比で説明するSkillを作成します。

#### ステップ1: スキルディレクトリを作成する

```bash
# 個人スキル（全プロジェクトで利用可能）
mkdir -p ~/.claude/skills/explain-code
```

#### ステップ2: SKILL.md を作成する

`~/.claude/skills/explain-code/SKILL.md`:

```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

#### ステップ3: テストする

```text
# Claudeが自動で判断して使う場合
How does this code work?

# 直接呼び出す場合
/explain-code src/auth/login.ts
```

### Skillsの配置場所

配置場所によって適用範囲が変わります：

| 配置場所 | パス | 適用範囲 |
|---------|------|---------|
| Enterprise | 管理者設定（managed settings）参照 | 組織全体のユーザー |
| 個人 | `~/.claude/skills/<skill-name>/SKILL.md` | あなたの全プロジェクト |
| プロジェクト | `.claude/skills/<skill-name>/SKILL.md` | このプロジェクトのみ |
| プラグイン | `<plugin>/skills/<skill-name>/SKILL.md` | プラグインが有効な場所 |

優先度（高い順）: Enterprise > 個人 > プロジェクト

### Skillのディレクトリ構造

各Skillはディレクトリとして構成されます：

```text
my-skill/
├── SKILL.md           # メインの指示（必須）
├── template.md        # Claudeが埋めるテンプレート
├── examples/
│   └── sample.md      # 期待する出力例
└── scripts/
    └── validate.sh    # Claudeが実行できるスクリプト
```

### Frontmatterリファレンス

`SKILL.md`の先頭に`---`で囲んで設定します：

```yaml
---
name: my-skill
description: このスキルの内容と使用場面
disable-model-invocation: true
allowed-tools: Read, Grep
---
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | 任意 | スキルの表示名。省略するとディレクトリ名を使用 |
| `description` | 推奨 | スキルの説明。Claudeが自動的に使用するか判断する際に使用 |
| `argument-hint` | 任意 | オートコンプリート時に表示するヒント（例: `[issue-number]`） |
| `disable-model-invocation` | 任意 | `true`にするとClaudeが自動的に呼び出さなくなる |
| `user-invocable` | 任意 | `false`にすると`/`メニューに表示されない |
| `allowed-tools` | 任意 | このスキルが有効な時にClaudeが使えるツールを制限 |
| `model` | 任意 | このスキルが有効な時に使用するモデル |
| `context` | 任意 | `fork`にするとサブエージェントで実行 |
| `agent` | 任意 | `context: fork`時に使用するサブエージェントの種類 |
| `hooks` | 任意 | このスキルのライフサイクルにスコープしたフック |

### 呼び出し制御

| Frontmatter | ユーザーが呼び出せる | Claudeが呼び出せる |
|-------------|------------------|----------------|
| （デフォルト） | ○ | ○ |
| `disable-model-invocation: true` | ○ | ✗ |
| `user-invocable: false` | ✗ | ○ |

**例：デプロイはユーザーだけが手動で実行できるようにする**

```yaml
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
---

Deploy $ARGUMENTS to production:

1. Run the test suite
2. Build the application
3. Push to the deployment target
4. Verify the deployment succeeded
```

### 引数の渡し方

`$ARGUMENTS`プレースホルダーを使って引数を受け取れます：

```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
---

Fix GitHub issue $ARGUMENTS following our coding standards.

1. Read the issue description
2. Understand the requirements
3. Implement the fix
4. Write tests
5. Create a commit
```

`/fix-issue 123` と実行すると、`$ARGUMENTS`が`123`に置き換わります。

複数の引数には`$ARGUMENTS[N]`または`$N`を使います：

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue`のように実行します。

### 動的コンテキスト注入

`` !`command` ``構文でシェルコマンドの出力をスキルに注入できます：

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

このスキルが実行されると：
1. 各`` !`command` ``が即座に実行される
2. 出力がプレースホルダーと置き換わる
3. Claudeは完全にレンダリングされたプロンプトを受け取る

### サブエージェントでの実行

`context: fork`を設定すると、スキルが独立したコンテキストで実行されます：

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:

1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

### ツールアクセスの制限

特定のツールのみ使用可能にする例：

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---
```

### チームでの共有方法

- **プロジェクトSkills**: `.claude/skills/`をバージョン管理に含める
- **プラグイン**: プラグインの`skills/`ディレクトリにまとめて配布
- **Managed設定**: 組織全体に一斉配布（Enterprise向け）

## まとめ

- Skillsは`SKILL.md`ファイルでカスタムコマンドを定義する仕組み
- 配置場所（個人・プロジェクト・Enterprise）で適用範囲が決まる
- Frontmatterで呼び出し制御、ツール制限、サブエージェント実行などを設定
- `$ARGUMENTS`で引数を受け取り、動的な処理が可能
- `` !`command` ``でシェルコマンドの出力を動的に注入できる
- `disable-model-invocation: true`でユーザーだけが呼び出せるSkillを作れる
- プロジェクトのバージョン管理やプラグインを通じてチームで共有できる

## 公式リファレンス

- [Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Agent Skills オープン標準](https://agentskills.io)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Plugins](https://code.claude.com/docs/en/plugins)
