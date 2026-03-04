# Week 1: 入門・セットアップ

> **対応公式ドキュメント**: https://code.claude.com/docs/en/overview, https://code.claude.com/docs/en/quickstart
> **想定所要時間**: 約5時間（全5レッスン x 約60分）
> **前提条件**: ターミナルの基本操作、Git の基礎知識
> **難易度**: ★☆☆☆☆ 〜 ★★☆☆☆

## この週の学習目標

この週を終えると、以下のことができるようになります：

1. Claude Code が何であるかを理解し、できることの全体像を把握する
2. 自分の環境（macOS / Linux / Windows）に Claude Code をインストールできる
3. 初回セッションを起動し、プロジェクトへの基本的な質問と変更依頼ができる
4. エージェントループ（gather context → take action → verify results）の仕組みを説明できる
5. 複数のアカウント種別（Pro / Max / Console / Bedrock 等）の違いを理解し、ログイン・ログアウトができる

---

## レッスン一覧

| # | ファイル | タイトル | 内容 | 所要時間 |
|---|---|---|---|---|
| 01 | [01-what-is-claude-code.md](./01-what-is-claude-code.md) | Claude Code とは何か | 定義・主要機能・利用環境・他ツールとの比較 | 約60分 |
| 02 | [02-installation.md](./02-installation.md) | インストール方法 | システム要件・各 OS の手順・トラブルシューティング | 約60分 |
| 03 | [03-first-session.md](./03-first-session.md) | 初回セッション | 起動方法・コード質問・変更依頼・Git操作・基本コマンド | 約60分 |
| 04 | [04-how-it-works.md](./04-how-it-works.md) | エージェントループの仕組み | 内部動作・モデル・ツール・セッション管理・安全機構 | 約60分 |
| 05 | [05-authentication.md](./05-authentication.md) | 認証・アカウント設定 | アカウント種別・ログイン/ログアウト・チーム設定 | 約60分 |
| - | [references.md](./references.md) | 公式リファレンス | Week 1 対応ドキュメントリンク集 | - |

---

## 学習の進め方

### 推奨順序

1. **01: Claude Code とは何か** -- 全体像を把握する（座学中心）
2. **02: インストール方法** -- 自分の環境にインストールする（ハンズオン）
3. **05: 認証・アカウント設定** -- ログインして使える状態にする（ハンズオン）
4. **03: 初回セッション** -- 実際に使ってみる（ハンズオン）
5. **04: エージェントループの仕組み** -- 内部動作を理解する（座学 + ハンズオン）

> **Tip**: 02（インストール）と 05（認証）を先に済ませると、03（初回セッション）をスムーズに進められます。

### 各レッスンの構成

各レッスンは以下の構成で統一されています：

- **学習目標**: この章で達成すべきこと
- **本編（3-5セクション）**: 解説・コード例・テーブル
- **ハンズオン演習（2-3個）**: 実際に手を動かす演習
- **よくある質問（3-5個）**: 学習者からよくある疑問への回答
- **まとめ**: 重要ポイントの振り返り
- **公式リファレンス**: さらに深く学ぶためのリンク

### 事前準備

- **ターミナル**: macOS の Terminal.app、Linux の端末、Windows の PowerShell / WSL
- **Git**: インストール済みであること（`git --version` で確認）
- **アカウント**: Claude Pro / Max / Teams / Enterprise / Console のいずれか
- **プロジェクト**: 演習用に使える既存プロジェクト（なくても可）

---

## 次のステップ

Week 2「基本操作・CLI」では、以下を学びます：

- 対話モードの高度な使い方
- CLI フラグとオプションの詳細
- CLAUDE.md によるプロジェクト設定
- コンテキスト管理とパーミッション

[Week 2 - 基本操作・CLI](../week-02_core-usage/README.md) に進む

---

> **公式リファレンス**
> - [Claude Code Overview](https://code.claude.com/docs/en/overview) - 概要
> - [Quickstart](https://code.claude.com/docs/en/quickstart) - インストールから初回セッションまで
> - [How Claude Code Works](https://code.claude.com/docs/en/how-claude-code-works) - 内部動作の詳細
