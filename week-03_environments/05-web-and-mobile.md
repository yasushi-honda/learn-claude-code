# Web版・モバイル対応

> 対応する公式ドキュメント: [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)

## 学習目標

- Web 版 Claude Code（claude.ai/code）へのアクセス方法を理解する
- セキュアなクラウドインフラでの非同期タスク実行の仕組みを把握する
- ローカル環境なしで開発作業を行う方法を習得する
- 並列タスク実行の活用方法を理解する
- Claude iOS/Android アプリでのモバイル対応を把握する
- `/teleport` でローカル環境に引き継ぐ方法を習得する

## 概要

Web 版 Claude Code（claude.ai/code）は、ローカルに Claude Code をインストールすることなく、ブラウザからコーディングタスクを実行できるサービスです。Anthropic が管理する仮想マシン上でタスクが実行されるため、ローカル環境のセットアップなしに GitHub リポジトリのコードを分析・変更できます。

> **注意**: 現在、リサーチプレビュー段階です。

## 利用条件

以下のプランのユーザーが利用できます：

- **Pro ユーザー**
- **Max ユーザー**
- **Team ユーザー**
- **Enterprise ユーザー**（プレミアムシートまたは Chat + Claude Code シート）

## はじめ方

1. [claude.ai/code](https://claude.ai/code) にアクセス
2. GitHub アカウントを連携
3. リポジトリに Claude GitHub アプリをインストール
4. デフォルト環境を選択
5. コーディングタスクを送信
6. diff ビューで変更を確認・反復してからプルリクエストを作成

## 仕組み

タスクを開始すると：

1. **リポジトリのクローン**: リポジトリが Anthropic 管理の仮想マシンにクローンされる
2. **環境セットアップ**: コードを含むセキュアなクラウド環境が準備される
3. **ネットワーク設定**: 設定に基づいてインターネットアクセスが設定される
4. **タスク実行**: コードの分析・変更・テスト実行・確認が行われる
5. **完了**: ブランチにプッシュされ、PR 作成の準備完了
6. **通知**: 完了時に通知が届く

## 主な用途

Web 版が特に適しているシーン：

| 用途 | 説明 |
|-----|------|
| **コード調査** | アーキテクチャや機能の実装方法についての質問 |
| **バグ修正・ルーティンタスク** | 頻繁な操作不要の明確に定義されたタスク |
| **並列作業** | 複数のバグ修正を同時並行で実行 |
| **未チェックアウトのリポジトリ** | ローカルにない（クローンしていない）コードでの作業 |
| **バックエンド変更** | テスト作成 → コード実装のフローが必要な変更 |

## ターミナルから Web へ（--remote フラグ）

ターミナルから Web セッションを開始できます：

```bash
claude --remote "src/auth/login.ts の認証バグを修正して"
```

このコマンドは claude.ai に新しいWeb セッションを作成します。タスクはクラウドで実行され、ローカル作業を続けることができます。

### 複数タスクの並列実行

各 `--remote` コマンドは独立したセッションを作成します：

```bash
claude --remote "auth.spec.ts のフレーキーなテストを修正して"
claude --remote "API ドキュメントを更新して"
claude --remote "ロガーを構造化出力に切り替えて"
```

`/tasks` でセッションの進捗を一覧確認できます。

### ローカルで計画、クラウドで実行

複雑なタスクでは、まずローカルで計画を立ててからクラウドで実行するパターンが効果的です：

```bash
# まずプランモードで計画を立てる
claude --permission-mode plan

# 計画に満足したら、リモートセッションで実行
claude --remote "docs/migration-plan.md の移行計画を実行して"
```

## Web からターミナルへ（/teleport）

Web セッションをターミナルで引き継ぐ方法：

### /teleport コマンド

```
/teleport
```

または略称 `/tp` で、Web セッションの一覧が表示されます。

```bash
# コマンドラインからも実行可能
claude --teleport

# セッションIDを直接指定
claude --teleport <session-id>
```

### /tasks からのテレポート

```
/tasks
```

でバックグラウンドセッションを表示し、`t` キーを押してテレポートできます。

### テレポートの前提条件

| 要件 | 詳細 |
|-----|------|
| **クリーンな Git 状態** | 未コミットの変更がないこと（ある場合はスタッシュを促される） |
| **正しいリポジトリ** | 同じリポジトリのチェックアウトから実行すること |
| **ブランチの存在** | Web セッションのブランチがリモートにプッシュされていること |
| **同じアカウント** | Web セッションと同じ Claude.ai アカウントで認証済みであること |

## diff ビューでの変更確認

Claude がファイルを変更すると、diff インジケーター（例: `+12 -1`）が表示されます。クリックすると diff ビューアが開き：

- ファイルごとの変更を確認
- 特定の変更にコメントして修正を依頼
- Claude との反復によって変更を磨く

PR を作成する前に何度でも反復できます。

## モバイル対応

Claude iOS アプリ・Android アプリから Web セッションを開始・監視できます。

- 外出先からタスクを開始
- 進行中の作業をモニタリング
- ブラウザと同様にセッションで Claude に指示を出せる

アプリのダウンロードは Claude Code 内で `/mobile` コマンドを実行するとQRコードが表示されます。

## クラウド環境

### プリインストールされているツール

クラウド環境には以下がプリインストールされています：

| カテゴリ | 内容 |
|---------|------|
| **言語** | Python、Node.js、Ruby（3.1.6/3.2.6/3.3.6）、PHP 8.4.14、Java、Go、Rust、C++ |
| **パッケージマネージャ** | pip、poetry、npm、yarn、pnpm、bun、gem、bundler、Maven、Gradle、cargo |
| **データベース** | PostgreSQL 16、Redis 7.0 |

インストール済みツールを確認するには：

```bash
check-tools
```

### 依存関係の管理

カスタム環境イメージは現時点で非対応です。代わりに **SessionStart フック** でセッション開始時にパッケージをインストールできます。

```json
// .claude/settings.json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/scripts/install_pkgs.sh"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# scripts/install_pkgs.sh

# リモート環境のみで実行
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

npm install
pip install -r requirements.txt
exit 0
```

## ネットワークアクセスとセキュリティ

デフォルトは「制限あり（Limited）」のアクセスで、npmレジストリ・PyPI・GitHub など[許可ドメイン一覧](https://code.claude.com/docs/en/claude-code-on-the-web#default-allowed-domains)内のみアクセスできます。

| アクセスレベル | 説明 |
|-------------|------|
| **制限なし（Full）** | 全インターネットアクセス可能 |
| **制限あり（Limited）** | デフォルト。許可ドメインのみ |
| **なし（None）** | インターネット接続なし |

### セキュリティ機能

- 各セッションは独立した Anthropic 管理の仮想マシンで実行
- Git 認証はスコープ限定のプロキシを通じて安全に処理
- 機密認証情報は Claude Code のサンドボックス内に存在しない

## 料金と制限

- Web 版は通常の Claude Code 使用量と同じレート制限を共有
- 複数タスクの並列実行はその分レート制限を消費する
- 現時点では **GitHub のみ**対応（GitLab 等は非対応）

## まとめ

- `claude.ai/code` でブラウザからコーディングタスクを実行できる
- `claude --remote "タスク"` でターミナルから Web セッションを開始できる
- `/teleport` で Web セッションをターミナルに引き継げる
- 複数の `--remote` コマンドで並列タスク実行が可能
- iOS/Android アプリから外出先でも作業できる
- クラウド環境には主要な言語・ツールがプリインストール済み

## 公式リファレンス

- [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
- [フック設定](https://code.claude.com/docs/en/hooks)
- [セキュリティ](https://code.claude.com/docs/en/security)
