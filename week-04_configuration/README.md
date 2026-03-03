# Week 4: プロジェクト設定・メモリ

> 対応する公式ドキュメント: [Settings](https://code.claude.com/docs/en/settings) / [Memory](https://code.claude.com/docs/en/memory)

## 学習目標

この週では以下を理解・習得します：

- Claude Code の3階層設定システムを理解する
- CLAUDE.md を使ったプロジェクト固有の指示設定を習得する
- 自動メモリ機能の仕組みと活用方法を理解する
- パーミッションシステムで Claude の操作範囲を制御する方法を学ぶ
- モデルの選択と切り替え方法を習得する
- キーバインドと出力スタイルのカスタマイズを理解する

## 概要

Claude Code は柔軟な設定システムを備えており、グローバル・プロジェクト・ローカルの3階層で設定を管理できます。CLAUDE.md ファイルでプロジェクト固有の指示を与えたり、自動メモリ機能で Claude に学習させたりすることで、セッションをまたいで一貫した作業環境を維持できます。

Week 4 では、Claude Code を自分のプロジェクトやチームに最適な形で設定する方法を学びます。

## レッスン一覧

| レッスン | ファイル | 内容 |
|---------|---------|------|
| 01 | [設定ファイル体系](./01-settings-overview.md) | 3階層設定、優先順位、主要設定項目 |
| 02 | [CLAUDE.md 設計パターン](./02-claude-md.md) | CLAUDE.md の書き方とベストプラクティス |
| 03 | [自動メモリ機能](./03-auto-memory.md) | Claude の自動学習と手動メモリ管理 |
| 04 | [パーミッションシステム](./04-permissions.md) | 操作許可の設定と細かい制御方法 |
| 05 | [モデル設定](./05-model-config.md) | モデルの選択と切り替え、opusplan |
| 06 | [キーバインドカスタマイズ](./06-keybindings.md) | キーボードショートカットの設定 |
| 07 | [出力スタイル設定](./07-output-styles.md) | 出力形式とスタイルのカスタマイズ |
| 参照 | [公式リファレンス](./references.md) | 公式ドキュメントリンク集 |

## 前提知識

- Week 1・Week 2 の内容（基本的な Claude Code の操作）
- Week 3 の内容（開発環境の選択）
- YAML/JSON の基本的な読み書き

## この週の進め方

1. まず設定ファイル体系（レッスン01）で全体像を把握する
2. CLAUDE.md（レッスン02）と自動メモリ（レッスン03）でプロジェクトの記憶を設定する
3. パーミッション（レッスン04）で安全な操作範囲を定義する
4. モデル（レッスン05）・キーバインド（レッスン06）・出力スタイル（レッスン07）で個人の作業環境を最適化する

## まとめ

- 設定はグローバル・プロジェクト・ローカルの3階層で管理できる
- CLAUDE.md でプロジェクト固有の指示を永続化できる
- 自動メモリで Claude がセッションをまたいで学習できる
- パーミッションで Claude の操作範囲を細かく制御できる
- opusplan で計画は Opus、実行は Sonnet という効率的な使い方ができる

## 公式リファレンス

- [設定](https://code.claude.com/docs/en/settings)
- [メモリ](https://code.claude.com/docs/en/memory)
- [パーミッション](https://code.claude.com/docs/en/permissions)
- [モデル設定](https://code.claude.com/docs/en/model-config)
- [キーバインド](https://code.claude.com/docs/en/keybindings)
- [出力スタイル](https://code.claude.com/docs/en/output-styles)
