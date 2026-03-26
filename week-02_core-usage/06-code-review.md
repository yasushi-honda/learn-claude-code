# コードレビュー

> **対応公式ドキュメント**: https://code.claude.com/docs/en/code-review
> **想定所要時間**: 約45分
> **難易度**: ★★☆☆☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Code Review 機能の仕組み（マルチエージェント解析）を理解できる
2. 組織への Code Review セットアップを完了できる
3. `REVIEW.md` と `CLAUDE.md` でレビュー内容をカスタマイズできる
4. 重要度レベル（Normal / Nit / Pre-existing）を理解し、適切に対応できる
5. コスト管理とレビュートリガーの使い分けができる

---

## 1. Code Review とは

Code Review は、GitHub の Pull Request を自動分析し、インラインコメントとして問題点を指摘するマネージドサービスです。

### 主な特徴

| 特徴 | 説明 |
|------|------|
| マルチエージェント解析 | 複数の専門エージェントが並列でコードを分析 |
| 偽陽性フィルタリング | 検証ステップで実際のコード動作と照合し、偽陽性を除去 |
| 重複排除 | 発見された問題を重複排除し、重要度でランキング |
| 非ブロッキング | PR の承認やブロックは行わず、既存のレビューワークフローを維持 |

> **注意**: Code Review は Teams / Enterprise サブスクリプション向けの Research Preview 機能です。Zero Data Retention が有効な組織では利用できません。

### 自前のインフラで実行する場合

マネージドサービスではなく、自前の CI インフラで Claude によるレビューを実行したい場合は、[GitHub Actions](/week-07_team-development/03-github-actions.md) や [GitLab CI/CD](/week-07_team-development/04-gitlab-cicd.md) を参照してください。

---

## 2. レビューの仕組み

### 実行フロー

```
PR オープン / Push / @claude review コメント
  ↓
複数の専門エージェントが並列で diff + 周辺コードを分析
  ↓
検証ステップ：候補を実際のコード動作と照合（偽陽性フィルタリング）
  ↓
重複排除 → 重要度ランキング → インラインコメントとして投稿
```

レビューは PR のサイズと複雑さに応じてスケールし、平均 20 分程度で完了します。

### 重要度レベル

| マーカー | 重要度 | 意味 |
|---------|--------|------|
| 🔴 | Normal | マージ前に修正すべきバグ |
| 🟡 | Nit | 軽微な問題（修正推奨だがブロッキングではない） |
| 🟣 | Pre-existing | この PR で導入されたものではないが、コードベースに存在するバグ |

各発見には折りたたみ可能な「拡張推論」セクションが含まれ、なぜ問題と判断したか、どのように検証したかを確認できます。

### デフォルトのチェック対象

Code Review はデフォルトで **正確性** に焦点を当てます：

- 本番環境を壊すバグ
- セキュリティ脆弱性
- エッジケースの破綻
- 微妙なリグレッション

フォーマットやテストカバレッジの不足は、デフォルトではフラグしません。チェック範囲はガイダンスファイルで拡張できます。

---

## 3. セットアップ

### 前提条件

- Claude 組織の管理者アクセス
- GitHub 組織への GitHub App インストール権限
- Teams または Enterprise サブスクリプション

### セットアップ手順

1. [claude.ai/admin-settings/claude-code](https://claude.ai/admin-settings/claude-code) にアクセスし、Code Review セクションを見つける
2. **Setup** をクリックし、GitHub App インストールフローに従う
3. レビュー対象のリポジトリを選択する
4. 各リポジトリのレビュートリガーを設定する

### レビュートリガー

| トリガー | 動作 | コスト |
|---------|------|--------|
| Once after PR creation | PR オープン時に1回実行 | 最小 |
| After every push | PR ブランチへの各 Push で実行 | Push 回数に比例 |
| Manual | `@claude review` コメント時のみ | 制御可能 |

---

## 4. レビューのカスタマイズ

### REVIEW.md

リポジトリルートに `REVIEW.md` を配置して、レビュー固有のルールを定義します：

```markdown
# Code Review Guidelines

## Always check
- 新しい API エンドポイントには対応するインテグレーションテストがある
- DB マイグレーションが後方互換性を持つ
- エラーメッセージが内部情報を漏洩しない

## Style
- チェーン状の instanceof より match 文を優先する
- ログ呼び出しで f-string 補間ではなく構造化ロギングを使用する

## Skip
- src/gen/ 下の生成ファイル
- *.lock ファイルのフォーマットのみの変更
```

### CLAUDE.md との連携

Code Review はリポジトリの `CLAUDE.md` も読み取り、新しく導入された違反を Nit レベルの発見として報告します。PR の変更が `CLAUDE.md` の記述を陳腐化させた場合、ドキュメント更新が必要であることもフラグします。

---

## 5. 手動トリガー

PR に `@claude review` とコメントすると、設定されたトリガーに関係なくレビューを開始できます：

- **トップレベルの PR コメント**として投稿する（diff のインラインコメントではない）
- コメントの先頭に `@claude review` を置く
- リポジトリへの owner / member / collaborator アクセスが必要
- PR はオープン状態かつドラフトでないこと

手動トリガー後は、その PR への Push も自動的にレビュー対象になります。

---

## 6. 利用状況の確認

[claude.ai/analytics/code-review](https://claude.ai/analytics/code-review) でアクティビティを確認できます：

| セクション | 表示内容 |
|-----------|---------|
| PRs reviewed | 期間内にレビューした PR 数 |
| Cost weekly | 週間コスト |
| Feedback | 開発者が問題に対応した結果、自動解決されたコメント数 |
| Repository breakdown | リポジトリ別の PR レビュー数と解決コメント数 |

---

## 7. 料金

- レビューあたり平均 **$15〜$25**（PR サイズとコードベースの複雑さに応じてスケール）
- Extra usage として別途課金（プランの使用量には含まれない）
- Bedrock / Vertex AI を使用している場合でも、Anthropic 請求に計上される
- [claude.ai/admin-settings/usage](https://claude.ai/admin-settings/usage) で月間上限を設定可能

---

## ハンズオン演習

### 演習 1: REVIEW.md の作成

自分のプロジェクトに `REVIEW.md` を作成してください：

```bash
# Claude Code で REVIEW.md を作成
> Create a REVIEW.md for this project based on our coding conventions and common issues
```

### 演習 2: レビュー結果の確認

既存の PR に対して手動レビューをトリガーし、結果を確認してください：

1. PR に `@claude review` とコメントする
2. Check run「Claude Code Review」が表示されるのを待つ
3. インラインコメントの重要度レベルと拡張推論を確認する

---

## よくある質問

**Q: Code Review は PR を承認またはブロックしますか？**
A: いいえ。発見をインラインコメントとして投稿するだけで、既存のレビューワークフローは維持されます。

**Q: レビューの所要時間はどのくらいですか？**
A: 平均 20 分程度ですが、PR のサイズと複雑さに依存します。

**Q: Manual モードでも Push 時のレビューが走ることがありますか？**
A: はい。`@claude review` を一度コメントすると、その PR への以降の Push は自動レビュー対象になります。

**Q: 自前のインフラでレビューを実行できますか？**
A: はい。[GitHub Actions](../week-07_team-development/03-github-actions.md) または [GitLab CI/CD](../week-07_team-development/04-gitlab-cicd.md) を使用してください。

---

## まとめ

- Code Review はマルチエージェント解析で PR の正確性問題を自動検出する
- 3 段階の重要度（Normal / Nit / Pre-existing）で問題を分類する
- `REVIEW.md` と `CLAUDE.md` でチェック内容をカスタマイズできる
- レビュートリガー（自動 / Push 時 / 手動）でコストを制御する
- 平均 $15〜$25/レビューで、Extra usage として課金される

## 次のステップ

Week 2 の基本操作はこれで完了です。次は [Week 3: 開発環境統合](../week-03_environments/README.md) に進み、ターミナル・VS Code・JetBrains など各環境での Claude Code 活用を学びます。

---

> **公式リファレンス**
> - [Code Review](https://code.claude.com/docs/en/code-review)
> - [GitHub Actions](https://code.claude.com/docs/en/github-actions)
> - [GitLab CI/CD](https://code.claude.com/docs/en/gitlab-ci-cd)
> - [Memory (CLAUDE.md)](https://code.claude.com/docs/en/memory)
