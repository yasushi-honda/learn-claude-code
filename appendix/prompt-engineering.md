# Claude API プロンプトエンジニアリング ベストプラクティス

> **対応公式ドキュメント**: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
> **想定所要時間**: 約60分
> **難易度**: ★★★☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Claude API の公式プロンプトエンジニアリング原則を理解し、日常のプロンプト設計に適用できる
2. XMLタグ、few-shot examples、ロール設定を使ってプロンプトを構造化できる
3. 出力フォーマット、ツール使用、思考制御を目的に応じて最適化できる
4. エージェントシステム向けのプロンプト設計パターンを実践できる
5. これらの技法を CLAUDE.md、Skills、`claude -p` スクリプト、Agent Teams に応用できる

---

## 1. 一般原則（General Principles）

プロンプトエンジニアリングの土台となる6つの原則を解説する。

### 1.1 明確で直接的な指示

> **公式ドキュメントより**: Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too.

**NG**: `Create an analytics dashboard`
**OK**: `Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation.`

- 期待する出力の形式と制約を明示する
- 手順が重要な場合は番号付きリストで順序を示す

### 1.2 コンテキストの追加（WHY を伝える）

「何をするな」だけでなく「なぜそうすべきか」を伝えると、Claude は意図を理解して適切に一般化できる。

**NG**: `NEVER use ellipses`
**OK**: `Your response will be read aloud by a text-to-speech engine, so never use ellipses since the text-to-speech engine will not know how to pronounce them.`

### 1.3 例（few-shot）の効果的な活用

few-shot prompting は出力フォーマット・トーン・構造を制御するもっとも信頼性の高い手法だ。

| 項目 | 推奨 |
|------|------|
| 件数 | 3-5件 |
| 関連性 | 実際のユースケースに近い例を使う |
| 多様性 | エッジケースを含め、意図しないパターン学習を防ぐ |
| 構造 | `<example>` タグで囲み、指示と区別する |

```xml
<examples>
  <example>
    <input>2024年の売上レポートを要約してください</input>
    <output>
      ## 2024年度 売上サマリー
      - 総売上: 1,200万円（前年比 +15%）
      - 主力製品: Product A（全体の40%）
    </output>
  </example>
</examples>
```

### 1.4 XMLタグによる構造化

XMLタグは複合プロンプトを曖昧さなく解析するための最重要テクニックだ。

```xml
<instructions>
  以下のドキュメントを読み、質問に回答してください。
  回答は日本語で、200文字以内にまとめてください。
</instructions>

<context>
  <document index="1">
    <source>company_policy.pdf</source>
    <document_content>{{POLICY_CONTENT}}</document_content>
  </document>
</context>

<input>リモートワークの申請手順を教えてください。</input>
```

**設計のポイント**: 一貫した命名、自然な階層構造のネスト、`index` 属性や `<source>` でのメタデータ付加。

### 1.5 ロール設定

system prompt でロールを設定すると、Claude の振る舞いとトーンが集中する。

```python
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system="You are a helpful coding assistant specializing in Python.",
    messages=[{"role": "user", "content": "How do I sort a list of dicts?"}],
)
```

CLAUDE.md でも同様の効果が得られる。プロジェクトの技術スタック・専門領域を冒頭で宣言するだけでよい。

### 1.6 長文コンテキスト最適化

20K+ トークンの大規模ドキュメントを扱う場合の3つの鉄則：

1. **長文データはプロンプトの先頭に配置** -- クエリを末尾に置くと応答品質が最大30%向上
2. **`<document>` タグでメタデータを付与** -- ソース名、インデックスを明示
3. **引用を先に行わせる** -- 「関連部分を `<quotes>` に引用してから回答して」と指示

---

## 2. 出力とフォーマット制御（Output & Formatting）

### 2.1 Claude 4.6 モデルの特性

Claude 4.6 は以前のモデルより簡潔で自然なスタイルを持つ。ツール呼び出し後の要約を省略することがあるため、必要なら明示的に指示する：

```text
After completing a task that involves tool use, provide a quick summary of the work you've done.
```

### 2.2 フォーマット制御の4つの手法

**手法1: 「するな」ではなく「こうしろ」**

| NG | OK |
|-----|-----|
| `Do not use markdown` | `Your response should be composed of smoothly flowing prose paragraphs.` |

**手法2: XML形式インジケーター** -- タグ名自体が出力形式を規定する。

**手法3: プロンプトスタイルを出力に合わせる** -- Markdown を減らしたければプロンプトからも減らす。

**手法4: 詳細フォーマット制御** -- 公式推奨の Markdown 抑制プロンプト：

```xml
<avoid_excessive_markdown_and_bullet_points>
When writing long-form content, write in clear, flowing prose using complete
paragraphs. Reserve markdown primarily for `inline code`, code blocks, and
simple headings. DO NOT use ordered/unordered lists unless presenting truly
discrete items or the user explicitly requests it. Incorporate items naturally
into sentences instead.
</avoid_excessive_markdown_and_bullet_points>
```

### 2.3 LaTeX と Prefill からの移行

Claude Opus 4.6 は数式にデフォルトで LaTeX を使う。プレーンテキストが必要なら明示的に指定する。

また Claude 4.6 では prefilled responses（最後の assistant ターン）が非推奨。代替手法：

| 旧用途 | 移行方法 |
|--------|---------|
| 出力形式の強制 | Structured Outputs 機能、または明示的指示 |
| 前置きの排除 | `"Respond directly without preamble."` |
| 中断からの継続 | `"Your previous response ended with [text]. Continue."` |
| コンテキスト注入 | user ターンにリマインダーを注入 |

---

## 3. ツール使用の最適化（Tool Use）

### 3.1 行動 vs 提案の明示

`Can you suggest some changes?` では提案止まり。`Change this function to improve its performance.` なら実行する。

プロアクティブな行動をデフォルトにする場合：

```xml
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's
intent is unclear, infer the most useful likely action and proceed, using tools
to discover any missing details instead of guessing.
</default_to_action>
```

慎重に行動させたい場合：

```xml
<do_not_act_before_instructions>
Do not jump into implementation unless clearly instructed. Default to providing
information and recommendations. Only proceed with edits when explicitly requested.
</do_not_act_before_instructions>
```

### 3.2 並列ツール呼び出し

Claude 4.6 は並列ツール実行に優れている。明示プロンプトで精度を ~100% に引き上げられる：

```xml
<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between
the calls, make all independent calls in parallel. However, if calls depend
on previous results, execute them sequentially. Never use placeholders or
guess missing parameters.
</use_parallel_tool_calls>
```

### 3.3 Claude 4.6 の system prompt 感度

以前のモデルでツール使用不足を補った強い表現は、Claude 4.6 では過剰トリガーの原因になる。

| 以前のモデル向け（過剰） | Claude 4.6 向け（適切） |
|------------------------|----------------------|
| `CRITICAL: You MUST use this tool when...` | `Use this tool when...` |
| `If in doubt, use [tool]` | `Use [tool] when it would enhance your understanding` |

---

## 4. 思考と推論（Thinking & Reasoning）

### 4.1 Adaptive Thinking

Claude 4.6 は `thinking: {type: "adaptive"}` で、クエリの複雑さに応じて思考の深さを動的に判断する。

```python
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # low / medium / high
    messages=[{"role": "user", "content": "このアーキテクチャの問題点を分析して"}],
)
```

| effort | 用途 |
|--------|------|
| `low` | 高スループット・低レイテンシ |
| `medium` | 大半のアプリケーション（推奨） |
| `high` | 複雑な推論、エージェント的タスク |

### 4.2 過剰思考の制御

思考トークンが膨らむ場合は明示的に抑制できる：

```text
Choose an approach and commit to it. Avoid revisiting decisions unless new
information directly contradicts your reasoning. Pick one and see it through.
```

### 4.3 思考を活用する4つのテクニック

1. **一般的な指示 > 手順の処方**: `"think thoroughly"` は手書きのステップバイステップ計画より良い推論を生むことが多い
2. **few-shot + 思考**: 例の中に `<thinking>` タグを含めると Claude はその推論パターンを一般化する
3. **手動 CoT**: thinking 無効時でも `<thinking>` と `<answer>` タグで推論と出力を分離可能
4. **セルフチェック**: `"Before you finish, verify your answer against [test criteria]."` でエラーを確実にキャッチ

---

## 5. エージェントシステム設計（Agentic Systems）

### 5.1 コンテキスト認識と長期タスク

Claude 4.6 はコンテキストウィンドウの残り容量を認識できる。早期打ち切りを防ぐプロンプト：

```text
Your context window will be automatically compacted as it approaches its limit.
Do not stop tasks early due to token budget concerns. Save progress to memory
before the context window refreshes. Complete tasks fully.
```

### 5.2 マルチコンテキストウィンドウ戦略

長時間タスクを複数のコンテキストウィンドウにまたがって実行するための5パターン：

**パターン1: 最初のウィンドウでフレームワーク構築**

最初のコンテキストウィンドウでテスト・セットアップスクリプトを作成し、以降のウィンドウで TODO リストを消化していく。

**パターン2: 構造化テスト管理**

テストを `tests.json` のような構造化形式で管理する：

```json
{
  "tests": [
    { "id": 1, "name": "authentication_flow", "status": "passing" },
    { "id": 2, "name": "user_management", "status": "failing" },
    { "id": 3, "name": "api_endpoints", "status": "not_started" }
  ],
  "total": 200, "passing": 150, "failing": 25, "not_started": 25
}
```

**パターン3: QoL ツール整備**

`init.sh` のようなセットアップスクリプトでサーバー起動・テスト・リンターを自動化し、新しいコンテキストウィンドウでの繰り返し作業を防ぐ。

**パターン4: 新規開始 vs コンパクション**

Claude 4.6 はファイルシステムから状態を発見する能力が高い。処方的に開始手順を指定する：

```text
Call pwd; you can only read and write files in this directory.
Review progress.txt, tests.json, and the git logs.
Run a fundamental integration test before implementing new features.
```

**パターン5: 検証ツール提供**

自律タスクの時間が長くなるほど、人間のフィードバックなしに検証する手段が必要。Playwright MCP サーバーや computer use が有効。

### 5.3 自律性と安全性のバランス

取り消しが難しいアクションには確認を求めるプロンプト：

```text
Consider the reversibility and potential impact of your actions. Take local,
reversible actions freely, but for destructive, hard-to-reverse, or externally
visible actions, ask the user before proceeding.
```

### 5.4 状態管理のベストプラクティス

| データの種類 | 推奨形式 | 例 |
|------------|---------|-----|
| 構造化された状態 | JSON | テスト結果、タスクステータス |
| 進捗メモ | フリーテキスト | `progress.txt` |
| チェックポイント | Git | コミット履歴、ブランチ |

### 5.5 サブエージェント制御と過剰エンジニアリング抑制

Claude 4.6 はサブエージェント委譲を自発的に行うが、過剰使用に注意が必要だ。単純なタスク、逐次操作、単一ファイル編集では直接作業させる：

```text
Use subagents when tasks can run in parallel, require isolated context, or
involve independent workstreams. For simple tasks or single-file edits,
work directly rather than delegating.
```

過剰エンジニアリングを抑制する公式推奨プロンプト：

```xml
<avoid_over_engineering>
Only make changes directly requested or clearly necessary. Keep solutions simple:
- Scope: Don't add features or improvements beyond what was asked
- Documentation: Don't add comments to code you didn't change
- Defensive coding: Only validate at system boundaries
- Abstractions: Don't create helpers for one-time operations
</avoid_over_engineering>
```

### 5.6 ハルシネーションの最小化

```xml
<investigate_before_answering>
Never speculate about code you have not opened. Read relevant files BEFORE
answering questions about the codebase. Give grounded, hallucination-free answers.
</investigate_before_answering>
```

---

## 6. Claude Code での実践応用

### 6.1 CLAUDE.md 設計への応用

| API テクニック | CLAUDE.md での応用 |
|---------------|-------------------|
| XMLタグ構造化 | セクションを XMLタグで区切り、指示の優先度を明確にする |
| ロール設定 | 技術スタック・専門領域を冒頭で宣言する |
| few-shot examples | コミットメッセージ形式、コードスタイルの例を含める |
| コンテキスト追加 | 「なぜ」このルールが必要かを記載する |

```markdown
# CLAUDE.md
TypeScript + Next.js 14 の E コマースプラットフォーム。

<coding_standards>
- Server Components をデフォルトとする（理由: バンドルサイズ削減）
- 状態管理が必要な場合のみ "use client" を付与する
</coding_standards>

<commit_format>
<example>
feat(cart): add quantity adjustment with optimistic update
</example>
</commit_format>
```

### 6.2 Skills オーサリングへの応用

Skills ファイルは特定タスクに特化したプロンプトだ。`<role>`, `<instructions>`, `<output_format>` の3タグで構造化する：

```markdown
# SKILL.md - コードレビュー

<role>
セキュリティとパフォーマンスに精通したシニアエンジニア
</role>

<instructions>
1. 変更されたファイルを全て読む
2. セキュリティ・パフォーマンス・可読性の観点でレビュー
3. severity（critical / warning / info）を付与する
</instructions>

<output_format>
### Critical / Warning / Info
- [ファイル名:行番号] 指摘内容
</output_format>
```

### 6.3 `claude -p` スクリプティング

非対話モードは API レベルのプロンプトエンジニアリングがもっとも直接的に適用される場面だ。

```bash
claude -p "
<instructions>
以下の git diff をコードレビューしてください。
severity（critical/warning/info）を付与してください。
</instructions>
<diff>$(git diff HEAD~1)</diff>
"
```

### 6.4 Agent Teams と Hooks

- **Agent Teams**: リーダーには `<default_to_action>`、ワーカーには `<do_not_act_before_instructions>` を適用
- **Hooks**: `<investigate_before_answering>` パターンを PreToolUse フックで応用

---

## ハンズオン演習

### 演習 1: CLAUDE.md のプロンプトエンジニアリング改善

**目的**: 既存の CLAUDE.md にXMLタグ構造化、コンテキスト追加、few-shot examples を適用する
**前提条件**: 任意のプロジェクトディレクトリ

**手順**:
1. 現在の CLAUDE.md を確認し、以下のチェックリストで改善点を洗い出す：
   - プロジェクトのロール（技術スタック・目的）が冒頭で宣言されているか
   - ルールに「なぜ」（理由）が添えられているか
   - XMLタグで指示のカテゴリが分離されているか
   - コードスタイルの `<example>` があるか
2. 改善版を作成する（セクション 6.1 の例を参考に）
3. 改善前と改善後で同じ質問を Claude Code に投げ、応答の質を比較する

**期待される結果**: 改善後の CLAUDE.md で Claude の応答がプロジェクト文脈により適合すること

### 演習 2: XMLタグを使った `claude -p` パイプライン

**目的**: 構造化プロンプトで再現性のある自動化スクリプトを作成する
**前提条件**: Git リポジトリ内で作業していること

**手順**:
1. 以下のスクリプトを `scripts/review-diff.sh` として作成する：
   ```bash
   #!/bin/bash
   DIFF=$(git diff --cached)
   [ -z "$DIFF" ] && echo "No staged changes." && exit 0

   claude -p "
   <instructions>
   以下の git diff をコードレビューしてください。
   severity（critical/warning/info）を付与してください。
   </instructions>
   <context>レビュー対象: ステージングされた変更差分</context>
   <diff>${DIFF}</diff>
   <output_format>
   ## レビュー結果
   ### Critical / Warning / Info（該当なしは「なし」）
   ## 総合判定: LGTM / 要修正
   </output_format>
   "
   ```
2. 実行権限を付与し、ステージングされた変更に対して実行する
3. 出力が `<output_format>` の構造に従っているか確認する

**期待される結果**: 一貫したフォーマットでレビュー結果が出力されること

### 演習 3: Adaptive Thinking の効果比較

**目的**: `effort` パラメータの違いによるレイテンシと回答品質の差を体感する
**前提条件**: Anthropic API キーが設定されていること

**手順**:
1. 以下の Python スクリプトを作成し実行する：
   ```python
   import anthropic, time
   client = anthropic.Anthropic()
   Q = "FizzBuzz を最も効率的に実装する方法を3つ提案してください"

   for effort in ["low", "high"]:
       start = time.time()
       r = client.messages.create(
           model="claude-sonnet-4-6", max_tokens=4096,
           thinking={"type": "adaptive"},
           output_config={"effort": effort},
           messages=[{"role": "user", "content": Q}],
       )
       elapsed = time.time() - start
       text = next(b.text for b in r.content if b.type == "text")
       print(f"=== effort={effort} ({elapsed:.1f}s) ===")
       print(text[:400], "\n")
   ```
2. `effort=low` と `effort=high` のレイテンシと回答の深さを比較する
3. 過剰思考抑制プロンプトを system に追加して再度比較する

**期待される結果**: `low` は高速で簡潔、`high` は詳細だがレイテンシ大。抑制プロンプトで思考量に差が出ること

---

## よくある質問

**Q: CLAUDE.md に XMLタグを使うと Claude Code が正しく解釈してくれますか？**
A: はい。CLAUDE.md は system prompt として読み込まれるため、`<instructions>`, `<coding_standards>`, `<example>` などのタグは構造として正しく認識される。タグ名は一貫性を保ち、説明的な名前を使うことが重要だ。

**Q: few-shot examples は何件が最適ですか？**
A: 公式推奨は 3-5件。件数より多様性が重要で、正常系・エッジケース・エラーケースを含めること。Claude に例の関連性を評価させたり、追加例を生成させることもできる。

**Q: Claude 4.6 で以前のプロンプトがうまく動かなくなりました。何が変わりましたか？**
A: Claude 4.6 は system prompt 感度が高い。`"CRITICAL: You MUST..."` のような強い表現は過剰トリガーの原因になる。`"Use this tool when..."` のような自然な表現に書き換えること。prefilled responses の非推奨化と adaptive thinking への移行も確認が必要だ。

**Q: プロンプトのどこに長文ドキュメントを配置すべきですか？**
A: プロンプトの先頭（クエリや指示より上）に配置する。クエリを末尾に置くと応答品質が最大30%向上するテスト結果がある。`<document index="n">` タグでメタデータを付与する。

**Q: Claude Code で過剰エンジニアリングを防ぐにはどうすればよいですか？**
A: CLAUDE.md に `<avoid_over_engineering>` プロンプトを追加する。特に「スコープ制限」（求められた変更のみ）、「ドキュメント制限」（変更していないコードにコメント不要）、「抽象化制限」（一度しか使わない操作にヘルパー不要）の3点が効果的だ。

---

## まとめ

この章で学んだ重要ポイント：

- **明確さと具体性**が最優先: 「何を」「なぜ」「どの形式で」を明示する
- **XMLタグ**はプロンプト構造化の最強ツール: `<instructions>`, `<context>`, `<example>` でプロンプトの各部分を分離する
- **Claude 4.6 は以前のモデルと異なる**: system prompt 感度が高く、adaptive thinking を採用し、prefilled responses が非推奨
- **エージェントシステム設計にはパターンがある**: コンテキスト認識、状態管理、安全性バランスなど公式推奨パターンを活用する
- **Claude Code の各機能に直接応用できる**: CLAUDE.md、Skills、`claude -p`、Agent Teams、Hooks のすべてが実践の場

## 次のステップ

- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) で Jupyter Notebook ベースの演習を実践する
- CLAUDE.md の改善を実際のプロジェクトに適用し、応答品質の変化を観察する
- `claude -p` を使った自動化パイプラインを CI/CD に組み込んでみる

---

> **公式リファレンス**
> - [Claude Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
> - [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
> - [Adaptive Thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
> - [Extended Thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking)
> - [Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
> - [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)
