# コンテンツ更新ガイド

本リポジトリのコンテンツを最新の公式ドキュメントに合わせて更新するための手順を説明します。

---

## 概要

Claude Code は活発に開発が続けられており、公式ドキュメントも頻繁に更新されます。本リポジトリの学習コンテンツを最新の状態に保つために、定期的なレビューと更新が必要です。

---

## 公式ドキュメントの変更確認方法

### 1. Changelog を確認する

公式 Changelog を定期的に確認してください：

```
https://code.claude.com/docs/en/changelog
```

または Claude Code セッション内から確認：
```
/release-notes
```

### 2. GitHub リリースを監視する

Claude Code の公式 GitHub リポジトリのリリースをウォッチします：

```
https://github.com/anthropics/claude-code/releases
```

### 3. `claude update` でバージョン確認

```bash
claude update
claude --version
```

### 4. 公式ドキュメントのRSSフィード

公式ドキュメントサイトの更新通知を受け取るために、ブラウザの変更検知ツールや RSSリーダーを活用してください。

---

## 更新手順

### ステップ1: 変更箇所の特定

1. **Changelog を読む**: リリースノートから変更された機能・削除された機能・追加された機能を把握する
2. **公式ドキュメントを確認**: 変更に関連するページを `official-docs-map.md` で特定する
3. **対応ファイルを特定**: 本リポジトリのどのファイルを更新すべきか確認する

```bash
# official-docs-map.md で対応ファイルを検索
grep "feature-name" appendix/official-docs-map.md
```

### ステップ2: 公式ドキュメントの内容を確認

更新対象のページを確認します：

```
https://code.claude.com/docs/en/<page-name>
```

変更点を文書化しておきましょう：
- 追加された機能やコマンド
- 変更された仕様やデフォルト値
- 削除された機能
- 名称が変更された項目

### ステップ3: ファイルの更新

対応するMarkdownファイルを更新します：

1. **内容の正確性**: 公式ドキュメントと整合しているか確認
2. **コード例の動作確認**: コマンドや設定例が最新バージョンで動作するか確認
3. **リンクの有効性**: 内部リンク・外部リンクが有効かチェック
4. **日本語の自然さ**: 翻訳・解説が読みやすいか確認

```bash
# 対象ファイルを開いて更新
# 変更前後のdiffを確認
git diff week-XX/XX-filename.md
```

### ステップ4: official-docs-map.md の更新

新しいページが追加された場合や、対応ファイルが変更された場合は `official-docs-map.md` を更新します：

```bash
# appendix/official-docs-map.md を開いて更新
```

更新する項目：
- 新規ページの追加（ページ番号・公式URL・対応ファイル・週を追加）
- 既存エントリのURL変更
- 対応ファイルのパス変更
- 削除されたページの除外

### ステップ5: 変更のレビューと検証

```bash
# 変更したファイルを確認
git status
git diff

# Markdownの構文チェック（利用可能な場合）
npx markdownlint appendix/update-guide.md

# リンクの有効性チェック（利用可能な場合）
npx markdown-link-check week-XX/XX-filename.md
```

### ステップ6: PR の作成

```bash
# フィーチャーブランチを作成
git checkout -b update/week-XX-feature-name

# 変更をステージング
git add week-XX/XX-filename.md appendix/official-docs-map.md

# コミット
git commit -m "docs: Week X の XX を最新版に更新（v2.x.x 対応）"

# PR を作成
gh pr create \
  --title "docs: Week X の XX を最新公式ドキュメントに同期" \
  --body "## 変更内容\n- XXX を更新\n\n## 参照\n- Changelog: https://code.claude.com/docs/en/changelog"
```

---

## 新ページ追加時の対応

Claude Code の公式ドキュメントに新しいページが追加された場合の手順です。

### 1. 新ページの内容を把握する

```
https://code.claude.com/docs/en/<new-page-name>
```

### 2. 配置先を決定する

以下の基準で配置先の週（Week）を決定します：

| 内容の種類 | 配置先の候補 |
|----------|------------|
| 基本概念・セットアップ | Week 1 |
| CLI操作・ワークフロー | Week 2 |
| IDE統合・環境設定 | Week 3 |
| 設定・メモリ・権限 | Week 4 |
| カスタマイズ・拡張 | Week 5 |
| MCP・外部ツール連携 | Week 6 |
| チーム・CI/CD | Week 7 |
| エンタープライズ・セキュリティ | Week 8 |
| 参照・ガイド | Appendix |

### 3. 新しいMarkdownファイルを作成する

ファイル命名規則: `week-XX/NN-topic-name.md`

```
例: week-06/07-new-integration.md
```

基本的なファイル構造：

```markdown
# タイトル

概要の説明（1-2文）

> 参照: [公式ドキュメント](https://code.claude.com/docs/en/page-name)

---

## セクション1

内容...

## セクション2

内容...

---

## まとめ

- 重要なポイント1
- 重要なポイント2

## 次のステップ

- [関連トピック](../week-XX/XX-related.md)
```

### 4. official-docs-map.md に追加する

```markdown
| 60 | New Feature | [new-feature](https://code.claude.com/docs/en/new-feature) | week-06/07-new-integration.md | Week 6 |
```

ページ番号は連番で付けてください。

### 5. 週のREADME.md（存在する場合）を更新する

新しいファイルへのリンクを週のインデックスに追加します。

---

## PR・レビューフロー

### PR 作成のガイドライン

1. **ブランチ命名**: `update/week-XX-description` または `docs/add-XX-content`
2. **コミットメッセージ**: `docs: 変更内容の簡潔な説明（対応バージョン）`
3. **PR タイトル**: `docs: Week X の XX を vX.X.X に更新`
4. **PR 本文に含める情報**:
   - 変更した理由（Changelogの参照）
   - 更新したファイルの一覧
   - 動作確認した内容（コマンドが動作するか等）

### PRテンプレート例

```markdown
## 変更内容

- `week-XX/XX-filename.md`: XXX を更新
- `appendix/official-docs-map.md`: 新ページを追加

## 変更理由

Claude Code vX.X.X で XXX が変更されたため（Changelog: https://...）

## 確認事項

- [ ] 公式ドキュメントと内容が整合している
- [ ] コード例が最新バージョンで動作する
- [ ] リンクが有効である
- [ ] official-docs-map.md が更新されている

## 参照

- [Changelog](https://code.claude.com/docs/en/changelog)
- [更新された公式ページ](https://code.claude.com/docs/en/page-name)
```

### レビュー基準

レビュアーは以下の点を確認します：

1. **正確性**: 公式ドキュメントの内容と一致しているか
2. **完全性**: 重要な変更点が漏れなく反映されているか
3. **読みやすさ**: 日本語の説明が分かりやすいか
4. **一貫性**: 他のファイルとスタイルが統一されているか
5. **リンク**: 内部・外部リンクが正しく機能するか

---

## 更新の優先度

以下の順序で更新を優先してください：

### 優先度1（即時対応）
- 破壊的変更（非推奨になったコマンド、削除された機能）
- セキュリティ関連の変更
- インストール・認証フローの変更

### 優先度2（数日以内）
- 新機能の追加
- 主要コマンドの仕様変更
- デフォルト動作の変更

### 優先度3（次回の定期更新時）
- ドキュメントの改善・明確化
- 例の追加・変更
- マイナーな設定の追加

---

## 定期メンテナンスチェックリスト

月次または新バージョンリリース時に実施：

```markdown
## メンテナンスチェックリスト - YYYY/MM

### Changelog 確認
- [ ] https://code.claude.com/docs/en/changelog を確認
- [ ] 変更点をまとめてissueに記録

### コンテンツ確認
- [ ] Week 1: インストール手順が最新か
- [ ] Week 2: CLI コマンドとフラグが最新か
- [ ] Week 3: IDE統合の手順が最新か
- [ ] Week 4: 設定ファイルの仕様が最新か
- [ ] Week 5: Skills/Hooks/Plugins の仕様が最新か
- [ ] Week 6: MCP の仕様が最新か
- [ ] Week 7: CI/CD 連携が最新か
- [ ] Week 8: エンタープライズ機能が最新か
- [ ] Appendix: 用語集・チートシートが最新か

### リンク確認
- [ ] 外部リンク（公式ドキュメント）が有効か
- [ ] 内部リンク（ファイル間のリンク）が有効か

### official-docs-map.md 確認
- [ ] 全59ページが対応表に含まれているか
- [ ] 新ページが追加されていたら反映したか
```

---

## バージョン管理の考え方

本リポジトリは特定のバージョンに固定せず、常に最新の公式ドキュメントを反映することを目指します。

ただし、学習者が特定バージョンの動作を確認できるよう、重要な変更には以下の注記を追加してください：

```markdown
> **注意**: この機能は Claude Code v2.x.x 以降で利用可能です。
```

または：

```markdown
> **変更**: v2.x.x で `--old-flag` は `--new-flag` に変更されました。
```
