# Week 4: プロジェクト設定・メモリ

> **対応公式ドキュメント**: [Settings](https://code.claude.com/docs/en/settings) / [Memory](https://code.claude.com/docs/en/memory) / [Permissions](https://code.claude.com/docs/en/permissions) / [Model configuration](https://code.claude.com/docs/en/model-config)
> **想定所要時間**: 約7時間（各レッスン約60分）
> **難易度**: ★★☆☆☆ 〜 ★★★☆☆

## この週の学習目標

この週を終えると、以下のことができるようになります：

1. Claude Code の4つの設定スコープ（Managed、User、Project、Local）を理解し、適切に使い分けられる
2. CLAUDE.md でプロジェクト固有の指示を永続化し、チームで共有できる
3. 自動メモリの仕組みを理解し、CLAUDE.md との使い分けができる
4. パーミッションシステムで Claude の操作範囲を安全に制御できる
5. モデルの選択と opusplan によるコスト最適化ができる
6. キーバインドと出力スタイルで個人の作業環境を最適化できる

## 概要

Claude Code は柔軟な設定システムを備えており、組織のセキュリティポリシーを維持しながら個人の柔軟性も確保できます。CLAUDE.md でプロジェクト固有の指示を与え、自動メモリで Claude に学習させることで、セッションをまたいで一貫した作業環境を維持できます。

この週では、Claude Code を自分のプロジェクトやチームに最適な形で設定するための全体像を学びます。

## レッスン一覧

| レッスン | ファイル | 内容 | 難易度 |
|---------|---------|------|--------|
| 01 | [設定ファイル体系](./01-settings-overview.md) | 4つのスコープ、優先順位、配列マージ、主要設定キー・環境変数 | ★★☆☆☆ |
| 02 | [CLAUDE.md 設計パターン](./02-claude-md.md) | 配置場所、`/init`、`@import`、`.claude/rules/` パス指定ルール | ★★☆☆☆ |
| 03 | [自動メモリ機能](./03-auto-memory.md) | CLAUDE.md との違い、MEMORY.md の200行制限、管理方法 | ★★☆☆☆ |
| 04 | [パーミッションシステム](./04-permissions.md) | deny/ask/allow、5つのモード、ルール構文、Sandboxing との違い | ★★★☆☆ |
| 05 | [モデル設定](./05-model-config.md) | エイリアス、opusplan、Effort Level、Extended Context | ★★★☆☆ |
| 06 | [キーバインドカスタマイズ](./06-keybindings.md) | `keybindings.json`、コンテキスト、Vim 連携、`/doctor` | ★★☆☆☆ |
| 07 | [出力スタイル設定](./07-output-styles.md) | ビルトインスタイル、カスタムスタイル、`--output-format` | ★★☆☆☆ |
| 参照 | [公式リファレンス](./references.md) | 公式ドキュメントリンク集 | - |

## 前提知識

- Week 1・Week 2 の内容（基本的な Claude Code の操作）
- Week 3 の内容（開発環境の選択）
- JSON の基本的な読み書き
- マークダウンの基本文法

## この週の進め方

### 推奨学習順序

1. **設定ファイル体系（レッスン01）**: まず4つのスコープと優先順位で全体像を把握する
2. **CLAUDE.md（レッスン02）** と **自動メモリ（レッスン03）**: プロジェクトの記憶と Claude の学習を設定する
3. **パーミッション（レッスン04）**: 安全な操作範囲を定義する
4. **モデル（レッスン05）**: コスト効率の良いモデル選択を学ぶ
5. **キーバインド（レッスン06）** と **出力スタイル（レッスン07）**: 個人の作業環境を最適化する

### 実践のポイント

各レッスンのハンズオン演習を必ず実施してください。設定は手を動かして試すことで理解が深まります。特に以下が重要です：

- レッスン01: `$schema` を使ったエディタ補完の設定
- レッスン02: 自分のプロジェクトに `/init` で CLAUDE.md を生成
- レッスン04: deny/ask/allow の優先順位を体験
- レッスン05: opusplan のプランモード/実行モードの自動切り替えを体験

## まとめ

- **設定は4つのスコープ**（Managed > CLI args > Local > Project > User）で管理できる
- **CLAUDE.md** でプロジェクト固有の指示を永続化し、`@import` や `.claude/rules/` で分割できる
- **自動メモリ**で Claude がセッションをまたいで学習でき、CLAUDE.md との使い分けが重要
- **パーミッション**の deny > ask > allow で Claude の操作範囲を細かく制御できる
- **opusplan** で計画は Opus、実行は Sonnet という効率的なモデル使い分けができる
- **キーバインドと出力スタイル**で個人の作業環境を完全にカスタマイズできる

---

> **公式リファレンス**
> - [Settings](https://code.claude.com/docs/en/settings)
> - [Memory](https://code.claude.com/docs/en/memory)
> - [Permissions](https://code.claude.com/docs/en/permissions)
> - [Model configuration](https://code.claude.com/docs/en/model-config)
> - [Keybindings](https://code.claude.com/docs/en/keybindings)
> - [Output styles](https://code.claude.com/docs/en/output-styles)
