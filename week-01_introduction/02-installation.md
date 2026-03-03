# インストール方法

> 対応する公式ドキュメント: [Claude Code Overview](https://code.claude.com/docs/en/overview) / [Setup](https://code.claude.com/docs/en/setup)

## 学習目標

- システム要件を確認して自分の環境が対応しているか判断できる
- macOS / Linux / Windows の各環境に Claude Code をインストールできる
- ネイティブインストール・Homebrew・WinGet の違いと使い分けを説明できる
- バージョン確認・手動更新・アンインストールができる

## 概要

Claude Code のインストールは数分で完了します。**ネイティブインストール（推奨）** を使うと、バックグラウンドで自動更新が行われ、常に最新バージョンを使用できます。Homebrew や WinGet 経由でのインストールも可能ですが、自動更新はサポートされていません。

## 本文

### システム要件

Claude Code を使用するには以下が必要です：

- **macOS**: macOS 10.15（Catalina）以降
- **Linux**: 主要なディストリビューション（Ubuntu、Debian、Fedora 等）
- **Windows**: Windows 10 以降 + [Git for Windows](https://git-scm.com/downloads/win)（WSL 経由も可）
- **Node.js**: 不要（Claude Code はスタンドアロンバイナリ）
- **アカウント**: Claude Pro / Max / Teams / Enterprise、または Console / Bedrock / Vertex / Foundry アカウント

### インストール方法

#### ネイティブインストール（推奨）

ネイティブインストールは自動更新に対応しており、常に最新の機能とセキュリティ修正が適用されます。

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell:**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD:**

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

> Windows を使用する場合は、事前に [Git for Windows](https://git-scm.com/downloads/win) をインストールしてください。

インストール後、新しいターミナルウィンドウを開き、以下を実行して動作確認します：

```bash
claude --version
```

#### Homebrew（macOS / Linux）

```bash
brew install --cask claude-code
```

> **注意**: Homebrew インストールは自動更新に対応していません。定期的に以下を実行してください：
> ```bash
> brew upgrade claude-code
> ```

#### WinGet（Windows）

```powershell
winget install Anthropic.ClaudeCode
```

> **注意**: WinGet インストールも自動更新に対応していません。定期的に以下を実行してください：
> ```powershell
> winget upgrade Anthropic.ClaudeCode
> ```

### インストール方法の比較

| 方法 | 自動更新 | 対応 OS | 推奨 |
|---|---|---|---|
| ネイティブ（`curl`） | あり | macOS / Linux / WSL | ✓ |
| ネイティブ（PowerShell） | あり | Windows | ✓ |
| Homebrew | なし | macOS / Linux | - |
| WinGet | なし | Windows | - |

### バージョン確認と手動更新

現在のバージョンを確認する：

```bash
claude --version
# または
claude -v
```

手動で最新版に更新する（ネイティブインストールの場合）：

```bash
claude update
```

### アンインストール

**macOS / Linux（ネイティブインストール）:**

```bash
# インストールスクリプトにはアンインストール機能があります
# 詳細は公式ドキュメントの Setup ページを参照してください
```

**Homebrew:**

```bash
brew uninstall --cask claude-code
```

**WinGet:**

```powershell
winget uninstall Anthropic.ClaudeCode
```

### インストール後の確認

インストールが成功したら、プロジェクトディレクトリで Claude Code を起動できます：

```bash
cd your-project
claude
```

初回起動時にはログインプロンプトが表示されます（詳細は [05-authentication.md](./05-authentication.md) を参照）。

### よくある問題

**コマンドが見つからない場合:**
- ターミナルを再起動してパスが更新されたか確認する
- `echo $PATH` でインストールパスが含まれているか確認する

**権限エラーが出る場合（Linux）:**
- `sudo` を使用して再実行する
- または、インストール先ディレクトリの権限を確認する

**Windows で動作しない場合:**
- Git for Windows が正しくインストールされているか確認する
- PowerShell を管理者として実行する

## まとめ

- ネイティブインストール（`curl` / PowerShell）が **自動更新対応** で推奨
- Homebrew / WinGet 経由のインストールは **自動更新なし**、定期的な手動更新が必要
- `claude update` で手動更新、`claude --version` でバージョン確認
- インストール後は `cd your-project && claude` で起動

## 公式リファレンス

- [Setup Guide](https://code.claude.com/docs/en/setup) - インストールと詳細設定
- [Troubleshooting](https://code.claude.com/docs/en/troubleshooting) - インストール時の問題解決
