# 前提知識・環境構築ガイド

> このカリキュラムを開始するために必要な前提知識と環境構築手順をまとめています。

## 前提知識

### 必須スキル

| スキル | レベル | 説明 |
|--------|--------|------|
| **コマンドライン操作** | 基礎 | `cd`, `ls`, `mkdir` 等の基本コマンドが使える |
| **Git** | 基礎 | `git init`, `commit`, `push`, `pull`, `branch` が使える |
| **テキストエディタ** | 基礎 | VS Code等のエディタでファイルを編集できる |
| **プログラミング** | 基礎 | いずれかの言語（JavaScript/Python/Go等）で基本的なコードが読める |

### あると望ましいスキル

| スキル | 説明 |
|--------|------|
| **GitHub** | リポジトリの作成、PR作成、Issue管理の経験 |
| **Node.js/npm** | パッケージ管理の基本知識 |
| **Docker** | コンテナの基本概念（Week 8で使用） |
| **CI/CD** | GitHub ActionsやGitLab CI/CDの基本概念（Week 7で使用） |

---

## 環境構築

### 1. システム要件

| 項目 | 要件 |
|------|------|
| **OS** | macOS 12+, Ubuntu 20.04+/Debian 10+, Windows 10+ (WSL2またはネイティブ) |
| **メモリ** | 4GB以上推奨 |
| **ディスク** | 500MB以上の空き容量 |
| **ネットワーク** | インターネット接続必須 |

### 2. 必須ソフトウェア

#### Git

```bash
# macOS（Xcode Command Line Toolsに付属）
xcode-select --install

# Ubuntu/Debian
sudo apt-get update && sudo apt-get install git

# Windows
# Git for Windows をインストール: https://git-scm.com/downloads/win
```

#### Node.js（推奨: v18以上）

```bash
# macOS (Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# https://nodejs.org/ からインストーラをダウンロード
```

### 3. Claude Codeのインストール

#### ネイティブインストール（推奨）

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

# Windows CMD
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

#### Homebrew（macOS/Linux）

```bash
brew install --cask claude-code
```

#### WinGet（Windows）

```powershell
winget install Anthropic.ClaudeCode
```

> **Note**: ネイティブインストールは自動更新が含まれます。Homebrew/WinGetは手動で `brew upgrade claude-code` / `winget upgrade Anthropic.ClaudeCode` を実行してください。

### 4. アカウント準備

Claude Codeを使用するには、以下のいずれかのアカウントが必要です：

| アカウント種別 | 用途 | 料金 |
|---------------|------|------|
| **Claude Pro/Max** | 個人利用（推奨） | $20/月〜 |
| **Claude Teams** | チーム利用 | $30/ユーザー/月 |
| **Claude Enterprise** | 組織利用 | 要問い合わせ |
| **Anthropic Console** | API利用（従量課金） | プリペイドクレジット |
| **Amazon Bedrock** | AWS経由 | AWS料金体系 |
| **Google Vertex AI** | GCP経由 | GCP料金体系 |
| **Microsoft Foundry** | Azure経由 | Azure料金体系 |

最新の料金情報は [claude.com/pricing](https://claude.com/pricing) を参照してください。

### 5. 初回起動テスト

```bash
# バージョン確認
claude -v

# インタラクティブセッション開始
claude

# 初回はログインプロンプトが表示される
# ブラウザが開くので、アカウントでログイン
```

ログインが完了すると、Claude Codeのウェルカム画面が表示されます。

### 6. 推奨ツール（オプション）

| ツール | 用途 | Week |
|--------|------|------|
| **VS Code** | IDE統合 | Week 3 |
| **JetBrains IDE** | IDE統合 | Week 3 |
| **GitHub CLI (`gh`)** | GitHub操作 | Week 7 |
| **Docker** | サンドボックス環境 | Week 8 |

---

## 環境確認チェックリスト

以下のコマンドがすべて成功すれば、学習を開始できます：

```bash
# Git
git --version
# → git version 2.x.x

# Node.js
node --version
# → v18.x.x 以上

# Claude Code
claude -v
# → バージョン番号が表示

# Claude Code ログイン状態
claude auth status --text
# → ログイン済みの場合、アカウント情報が表示
```

---

## トラブルシューティング

### Claude Codeがインストールできない

```bash
# PATHに追加されていない場合
export PATH="$HOME/.claude/bin:$PATH"

# シェル設定に永続化
echo 'export PATH="$HOME/.claude/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### ログインできない

1. ブラウザのポップアップブロッカーを無効にする
2. `claude auth logout` で一度ログアウトしてから再試行
3. ネットワーク接続を確認する

### Windows固有の問題

- **WSL2が推奨**: Windowsネイティブより安定した動作
- **Git for Windows**: WSL2を使わない場合は必須
- 詳細は [公式トラブルシューティング](https://code.claude.com/docs/en/troubleshooting) を参照

---

## 次のステップ

環境構築が完了したら、[Week 1: 入門・セットアップ](week-01_introduction/) から学習を開始してください。
