# Skillsシステム -- カスタムコマンドでClaudeを拡張する

> **対応公式ドキュメント**: https://code.claude.com/docs/en/skills
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Skillsの概念と仕組みを理解し、CLAUDE.mdとの違いを説明できる
2. `SKILL.md` ファイルを作成してカスタムコマンド（`/コマンド名`）を定義できる
3. Frontmatterを使って呼び出し制御・ツール制限・サブエージェント実行を設定できる
4. `$ARGUMENTS`や`!`コマンド``構文で動的なSkillを構築できる

---

## 1. Skillsとは何か

Skillsは、Claude Codeの機能をカスタムコマンドで拡張する仕組みです。`SKILL.md`ファイルに指示を書くだけで、Claudeはそれをツールキットの一部として認識します。

CLAUDE.mdが「常に参照されるプロジェクト全体の指示」であるのに対し、Skillsは「必要なときに呼び出される専門的な指示セット」です。コードレビューの手順、デプロイのワークフロー、特定フレームワークでのコンポーネント生成など、繰り返し使う作業パターンをSkillとして定義しておけば、毎回同じ指示を打ち込む必要がなくなります。

> **公式ドキュメントより**: Skillsは「[Agent Skills](https://agentskills.io) オープン標準」に準拠しており、複数のAIツールにまたがって動作します。Claude Codeはこの標準を呼び出し制御、サブエージェント実行、動的コンテキスト注入で拡張しています。

### Custom commands との関係

以前の`.claude/commands/`ディレクトリによるカスタムコマンド機能は、現在Skillsに統合されています。`.claude/commands/`に置いたファイルは引き続き動作しますが、新規作成する場合は`.claude/skills/`を使うことが推奨されます。

### バンドルSkills

Claude Codeには最初から使えるSkillsが付属しています：

| コマンド | 説明 |
|---------|------|
| `/simplify` | 最近変更したファイルのコード品質を改善する。3つのレビューエージェントを並列実行し、それぞれが異なる観点でコードを分析する |
| `/batch <instruction>` | コードベース全体への大規模変更を並列で実行し、各PRを自動作成する |
| `/debug [description]` | 現在のセッションのデバッグログを読み込んでトラブルシュートする |

これらのバンドルSkillsは、自作Skillの良い参考例にもなります。

---

## 2. Skillの作成と配置

### 最初のSkillを作る

以下の例では、コードをビジュアルな図と類比で説明するSkillを作成します。

**ステップ1: スキルディレクトリを作成する**

```bash
# 個人スキル（全プロジェクトで利用可能）
mkdir -p ~/.claude/skills/explain-code
```

**ステップ2: SKILL.md を作成する**

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

**ステップ3: テストする**

```text
# Claudeが自動で判断して使う場合
How does this code work?

# 直接呼び出す場合
/explain-code src/auth/login.ts
```

### Skillの配置場所と優先順位

配置場所によって適用範囲が変わります。複数の場所に同名のSkillがある場合、優先順位に従って解決されます。

| 配置場所 | パス | 適用範囲 |
|---------|------|---------|
| Enterprise | 管理者設定（managed settings） | 組織全体のユーザー |
| 個人 | `~/.claude/skills/<skill-name>/SKILL.md` | あなたの全プロジェクト |
| プロジェクト | `.claude/skills/<skill-name>/SKILL.md` | このプロジェクトのみ |
| プラグイン | `<plugin>/skills/<skill-name>/SKILL.md` | プラグインが有効な場所 |

**優先度（高い順）**: Enterprise > 個人 > プロジェクト

### ディレクトリ構造

各Skillはディレクトリとして構成されます。`SKILL.md`が唯一の必須ファイルで、テンプレート・例・スクリプトなどのサポートファイルを含められます：

```text
my-skill/
├── SKILL.md           # メインの指示（必須）
├── template.md        # Claudeが埋めるテンプレート
├── examples/
│   └── sample.md      # 期待する出力例
└── scripts/
    └── validate.sh    # Claudeが実行できるスクリプト
```

### Character budget

Skillの内容はコンテキストウィンドウの2%まで（フォールバックとして16,000文字）に収める必要があります。この制限を超えた場合、Skillの内容が切り詰められる可能性があります。長い指示はサポートファイル（`template.md`や`examples/`）に分割することを推奨します。

---

## 3. Frontmatterリファレンス

`SKILL.md`の先頭に`---`で囲んだYAMLブロック（Frontmatter）で、Skillの動作を細かく制御できます。

### 全フィールド一覧

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `name` | 任意 | スキルの表示名。省略するとディレクトリ名を使用 |
| `description` | 推奨 | スキルの説明。Claudeが自動的に使用するか判断する際に参照 |
| `argument-hint` | 任意 | オートコンプリート時に表示するヒント（例: `[issue-number]`） |
| `disable-model-invocation` | 任意 | `true`にするとClaudeが自動的に呼び出さなくなる（ユーザーのみ） |
| `user-invocable` | 任意 | `false`にすると`/`メニューに表示されない（Claudeのみ） |
| `allowed-tools` | 任意 | このスキルが有効な時にClaudeが使えるツールを制限 |
| `model` | 任意 | このスキルの実行に使用するモデル |
| `context` | 任意 | `fork`にするとサブエージェントで実行 |
| `agent` | 任意 | `context: fork`時に使用するサブエージェントの種類（例: `Explore`） |
| `hooks` | 任意 | このスキルのライフサイクルにスコープしたフック |

### 呼び出し制御

Skillは「ユーザーが手動で呼び出す」ことも「Claudeが文脈から自動的に使う」こともできます。Frontmatterで制御できます：

| 設定 | ユーザーが呼び出せる | Claudeが呼び出せる |
|------|------------------|----------------|
| （デフォルト） | はい | はい |
| `disable-model-invocation: true` | はい | いいえ |
| `user-invocable: false` | いいえ | はい |

**例: デプロイはユーザーだけが手動で実行できるようにする**

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

### Skillアクセス制限

設定ファイルの`permissions`で、Claudeが呼び出せるSkillを制限できます：

```json
{
  "permissions": {
    "allow": [
      "Skill(commit)",
      "Skill(deploy *)"
    ]
  }
}
```

`Skill(commit)`は`commit`スキルのみ許可、`Skill(deploy *)`は`deploy`で始まるすべてのスキルを許可します。

---

## 4. 引数と動的コンテキスト

### 引数の渡し方

`$ARGUMENTS`プレースホルダーを使って引数を受け取ります：

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

**複数の引数**には`$ARGUMENTS[N]`または`$N`を使います：

```yaml
---
name: migrate-component
description: Migrate a component from one framework to another
---

Migrate the $0 component from $1 to $2.
Preserve all existing behavior and tests.
```

`/migrate-component SearchBar React Vue`のように実行します。

**セッションID**の参照には`${CLAUDE_SESSION_ID}`を使います：

```yaml
---
name: log-action
---

Log this action with session ID ${CLAUDE_SESSION_ID}.
```

### 動的コンテキスト注入

`` !`command` ``構文でシェルコマンドの出力をスキルに注入できます。Skillが呼び出された時点でコマンドが即座に実行され、結果がプレースホルダーと置き換わります：

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

このSkillが実行されると：
1. 各`` !`command` ``が即座に実行される
2. 出力がプレースホルダーと置き換わる
3. Claudeは完全にレンダリングされたプロンプトを受け取る

### サブエージェントでの実行

`context: fork`を設定すると、Skillが独立したコンテキストで実行されます。メインセッションのコンテキストウィンドウを消費せず、読み取り専用の調査タスクに適しています：

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

### Extended thinking

Skillの内容に「ultrathink」というキーワードを含めると、Claudeはextended thinkingモードで応答します。複雑な設計判断や深い分析が必要なSkillで有効です：

```yaml
---
name: architecture-review
description: Deep architectural analysis
---

ultrathink

Analyze the architecture of $ARGUMENTS:
1. Identify design patterns
2. Find potential bottlenecks
3. Suggest improvements
```

---

## 5. 実践的なSkill設計パターン

### パターン1: コードレビューSkill

```yaml
---
name: review
description: Review code changes for quality and security
context: fork
agent: Explore
---

Review the recent changes:

1. !`git diff --cached --stat`
2. For each changed file, check:
   - Code quality and readability
   - Security vulnerabilities
   - Test coverage
3. Provide actionable feedback with specific line references
```

### パターン2: テストファーストSkill

```yaml
---
name: tdd
description: Implement a feature using TDD
disable-model-invocation: true
argument-hint: [feature-description]
---

Implement $ARGUMENTS using strict TDD:

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass
3. **Refactor**: Clean up while keeping tests green

Rules:
- Never skip the Red phase
- Include edge cases (null, empty, boundary values)
- Run tests after each phase
```

### パターン3: ツール制限付きSkill

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read, Grep, Glob
---

Analyze the requested files. You may only read, search, and browse.
Do not modify any files.
```

### チームでの共有方法

- **プロジェクトSkills**: `.claude/skills/`をバージョン管理に含める
- **プラグイン**: プラグインの`skills/`ディレクトリにまとめて配布（Week 5 Lesson 4-6で詳しく学ぶ）
- **Managed設定**: 組織全体に一斉配布（Enterprise向け）

---

## ハンズオン演習

### 演習 1: 基本的なSkillの作成

**目的**: 個人Skillを作成し、`/`コマンドで呼び出す
**前提条件**: Claude Codeがインストール済みであること

**手順**:
1. Skillディレクトリを作成する
   ```bash
   mkdir -p ~/.claude/skills/summarize
   ```
2. 以下の内容で`SKILL.md`を作成する
   ```yaml
   ---
   name: summarize
   description: Summarize a file or directory
   argument-hint: [file-or-directory]
   ---

   Summarize $ARGUMENTS concisely:
   1. What is the purpose?
   2. Key components and their relationships
   3. Important design decisions
   ```
3. Claude Codeを起動して`/summarize src/`を実行する

**期待される結果**: Claudeが`src/`ディレクトリの構造と目的を要約する

### 演習 2: 保護付きSkillの作成

**目的**: ユーザーのみが呼び出せるSkillを作成する
**前提条件**: 演習1が完了していること

**手順**:
1. Skillディレクトリを作成する
   ```bash
   mkdir -p ~/.claude/skills/release
   ```
2. 以下の内容で`SKILL.md`を作成する
   ```yaml
   ---
   name: release
   description: Create a new release
   disable-model-invocation: true
   argument-hint: [version]
   ---

   Create release $ARGUMENTS:
   1. Update version in package.json
   2. Generate changelog from git log
   3. Create a git tag
   4. Push the tag
   ```
3. Claude Codeで`/release 1.2.0`を実行する
4. 別のプロンプトで「リリースしてください」と入力し、Claudeが自動的にこのSkillを呼び出さないことを確認する

**期待される結果**: `/release`コマンドでは実行されるが、自然言語のプロンプトではClaudeが自動的にこのSkillを使用しない

### 演習 3: 動的コンテキスト付きSkill

**目的**: `!`コマンド``構文で動的情報を注入するSkillを作成する
**前提条件**: gitリポジトリ内で作業していること

**手順**:
1. プロジェクトSkillを作成する
   ```bash
   mkdir -p .claude/skills/status
   ```
2. 以下の内容で`SKILL.md`を作成する
   ```yaml
   ---
   name: status
   description: Show project status overview
   disable-model-invocation: true
   context: fork
   agent: Explore
   ---

   ## Current project status

   ### Git status
   !`git status --short`

   ### Recent commits
   !`git log --oneline -5`

   ### Branch info
   !`git branch -a`

   Summarize the current project status based on the above information.
   ```
3. `/status`を実行する

**期待される結果**: gitの状態情報が動的に注入され、Claudeがプロジェクトの現状を要約する

---

## よくある質問

**Q: SkillsとCLAUDE.mdの違いは何ですか?**
A: CLAUDE.mdは毎回のプロンプトで自動的にコンテキストに含まれる「常時有効な指示」です。Skillsは必要な時に呼び出される「オンデマンドの指示セット」です。頻繁に参照される規約はCLAUDE.mdに、特定タスクの手順はSkillsに置くのが効果的です。

**Q: Skillの内容量に制限はありますか?**
A: コンテキストウィンドウの2%（フォールバックとして16,000文字）が上限です。長い指示はサポートファイル（`template.md`、`examples/`）に分割しましょう。

**Q: `disable-model-invocation: true`と`user-invocable: false`の両方を設定するとどうなりますか?**
A: 誰も呼び出せなくなります。通常この組み合わせは使いません。`disable-model-invocation: true`はデプロイなど慎重な操作に、`user-invocable: false`はClaude内部のヘルパーSkillに使います。

**Q: プラグインのSkillとプロジェクトのSkillが同名の場合、どちらが優先されますか?**
A: プロジェクトのSkillが優先されます。優先順位は Enterprise > 個人 > プロジェクト > プラグインです。

**Q: `context: fork`を使うとパフォーマンスに影響がありますか?**
A: サブエージェントが別コンテキストで起動するため若干のオーバーヘッドがありますが、メインセッションのコンテキストウィンドウを消費しないというメリットがあります。読み取り専用の調査タスクには推奨されます。

---

## まとめ

この章で学んだ重要ポイント：

- SkillsはClaude Codeの拡張機能で、`SKILL.md`ファイルでカスタムコマンドを定義する仕組み
- Custom commands（`.claude/commands/`）はSkillsに統合済み
- バンドルSkills（`/simplify`、`/batch`、`/debug`）が最初から利用可能
- 配置場所（Enterprise > 個人 > プロジェクト）で適用範囲と優先順位が決まる
- Frontmatterで呼び出し制御（`disable-model-invocation`、`user-invocable`）を設定
- `$ARGUMENTS`、`$ARGUMENTS[N]`、`$N`、`${CLAUDE_SESSION_ID}`で引数を受け取る
- `` !`command` ``構文でシェルコマンドの出力を動的に注入できる
- `context: fork`と`agent`でサブエージェント実行が可能
- Character budget はコンテキストウィンドウの2%（16,000文字フォールバック）

## 次のステップ

次の章「Hooksによる自動化」では、Claude Codeのライフサイクルイベントにフックして、ファイル編集後の自動整形や保護ファイルへの書き込みブロックなど、決定論的な自動化を実現する方法を学びます。

---

> **公式リファレンス**
> - [Extend Claude with skills](https://code.claude.com/docs/en/skills)
> - [Agent Skills オープン標準](https://agentskills.io)
> - [Subagents](https://code.claude.com/docs/en/sub-agents)
> - [Plugins](https://code.claude.com/docs/en/plugins)
