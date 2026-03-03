# トラブルシューティング

Claude Code のインストールと使用における一般的な問題の解決策をまとめます。

> 参照: [公式トラブルシューティングドキュメント](https://code.claude.com/docs/en/troubleshooting)

---

## クイック診断

問題が発生したらまず `/doctor` コマンドを実行してください：

```bash
# セッション内で実行
/doctor

# または起動時に
claude --debug
```

`/doctor` は以下を確認します：
- インストールの種類、バージョン、検索機能
- 自動更新状態と利用可能なバージョン
- 無効な設定ファイル（JSONの不正、型エラー）
- MCPサーバーの設定エラー
- キーバインディング設定の問題
- コンテキスト使用量の警告（大きな CLAUDE.md、高いMCPトークン使用量）
- プラグインとエージェントの読み込みエラー

---

## インストールの問題

### エラー早見表

| 表示されるエラー | 解決策 |
|--------------|--------|
| `command not found: claude` | [PATHを修正する](#path-の問題) |
| `syntax error near unexpected token '<'` | [インストールスクリプトの問題](#インストールスクリプトが-html-を返す) |
| `curl: (56) Failure writing output to destination` | [スクリプトを手動でダウンロード](#curl-エラー) |
| `Killed` (Linux) | [スワップ領域を追加](#メモリ不足によるインストール中断) |
| `TLS connect error` / `SSL/TLS secure channel` | [CA証明書を更新](#tls--ssl-エラー) |
| `Failed to fetch version` | [ネットワークとプロキシを確認](#ネットワーク接続の確認) |
| `Error loading shared library` | [バイナリバリアントの確認](#linux-musl--glibc-ミスマッチ) |
| `Illegal instruction` (Linux) | [アーキテクチャの確認](#linux-アーキテクチャ不一致) |
| `dyld: cannot load` (macOS) | [バイナリ非互換の修正](#macos-バイナリ非互換) |
| `OAuth error` / `403 Forbidden` | [認証の問題を修正](#認証の問題) |
| `App unavailable in region` | Claude Code は対象地域未対応。[サポート国一覧](https://www.anthropic.com/supported-countries)を確認 |

---

### ネットワーク接続の確認

インストーラーは `storage.googleapis.com` からダウンロードします。接続を確認：

```bash
curl -sI https://storage.googleapis.com
```

企業プロキシ環境の場合：

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
curl -fsSL https://claude.ai/install.sh | bash
```

---

### PATH の問題

インストールは成功したが `command not found` が表示される場合：

**macOS/Linux:**
```bash
# インストールディレクトリが PATH に含まれているか確認
echo $PATH | tr ':' '\n' | grep local/bin

# Zsh（macOS デフォルト）に追加
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Bash（Linux デフォルト）に追加
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 確認
claude --version
```

**Windows PowerShell:**
```powershell
$env:PATH -split ';' | Select-String 'local\\bin'

# パスが見つからない場合
$currentPath = [Environment]::GetEnvironmentVariable('PATH', 'User')
[Environment]::SetEnvironmentVariable('PATH', "$currentPath;$env:USERPROFILE\.local\bin", 'User')
```

---

### インストールスクリプトが HTML を返す

以下のエラーが表示される場合：

```
bash: line 1: syntax error near unexpected token `<'
bash: line 1: `<!DOCTYPE html>'
```

**解決策:**

1. **Homebrew を使用（macOS/Linux）:**
   ```bash
   brew install --cask claude-code
   ```

2. **WinGet を使用（Windows）:**
   ```powershell
   winget install Anthropic.ClaudeCode
   ```

3. 数分後に再試行する（一時的なサービス障害の可能性）

---

### curl エラー

`curl: (56) Failure writing output to destination` が表示される場合：

```bash
# 接続テスト
curl -fsSL https://storage.googleapis.com -o /dev/null

# 代替インストール方法（macOS/Linux）
brew install --cask claude-code
```

---

### TLS / SSL エラー

`TLS connect error` や `SSL/TLS secure channel` エラーの場合：

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install ca-certificates
```

**macOS (Homebrew):**
```bash
brew install ca-certificates
```

**企業プロキシの CA 証明書:**
```bash
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
```

**Windows で TLS 1.2 を有効化:**
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
irm https://claude.ai/install.ps1 | iex
```

---

### メモリ不足によるインストール中断

Linux VPS などで `Killed` が表示される場合（最小4GB のRAMが必要）：

```bash
# スワップ領域を追加
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 再インストール
curl -fsSL https://claude.ai/install.sh | bash
```

---

### Linux: musl / glibc ミスマッチ

`Error loading shared library libstdc++.so.6` などのエラー：

```bash
# libc の種類を確認
ldd /bin/ls | head -1

# musl（Alpine Linux）の場合
apk add libgcc libstdc++ ripgrep
```

---

### Linux: アーキテクチャ不一致

`Illegal instruction` が表示される場合：

```bash
# アーキテクチャを確認
uname -m
# x86_64 = 64ビット Intel/AMD
# aarch64 = ARM64
```

問題が解決しない場合は [GitHub Issues](https://github.com/anthropics/claude-code/issues) に報告してください。

---

### macOS: バイナリ非互換

`dyld: cannot load` や `Abort trap: 6` が表示される場合：

- macOS 13.0 以上が必要です
- Apple メニュー → 「この Mac について」でバージョンを確認

```bash
# Homebrew での代替インストール
brew install --cask claude-code
```

---

### 競合するインストールの確認

複数のインストールが存在する場合：

```bash
# 全インストールを確認
which -a claude
ls -la ~/.local/bin/claude
npm -g ls @anthropic-ai/claude-code 2>/dev/null

# npm のアンインストール
npm uninstall -g @anthropic-ai/claude-code

# Homebrew のアンインストール
brew uninstall --cask claude-code
```

---

## 認証の問題

### 繰り返されるパーミッション確認

同じコマンドへの承認を繰り返し求められる場合：

```bash
# /permissions でルールを設定
/permissions
```

詳細は [パーミッション設定](../week-04/04-permissions.md) を参照してください。

---

### ログインの問題

```bash
# ログアウトして再ログイン
/logout
# Claude Code を閉じる
claude
# 再認証を完了する
```

ブラウザが自動で開かない場合は `c` を押して OAuth URL をコピーし、ブラウザに貼り付けます。

---

### OAuth エラー: Invalid code

ログインコードが期限切れまたはコピー不完全な場合：

- Enter を押して再試行し、ブラウザが開いたら素早く完了する
- リモート/SSH セッションの場合、表示された URL をローカルブラウザで開く

---

### 403 Forbidden

ログイン後に `403 Forbidden` が表示される場合：

- **Claude Pro/Max ユーザー**: [claude.ai/settings](https://claude.ai/settings) でサブスクリプションを確認
- **Console ユーザー**: 管理者に「Claude Code」または「Developer」ロールの付与を依頼
- **プロキシ環境**: [ネットワーク設定](https://code.claude.com/docs/en/network-config) を確認

---

### WSL2 での OAuth ログイン失敗

```bash
# ブラウザを明示的に設定
export BROWSER="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
claude
```

または `c` を押して URL をコピーし、Windows ブラウザで開きます。

---

### "Not logged in" またはトークン期限切れ

```bash
/login
```

頻繁に発生する場合はシステムクロックが正確かを確認してください。

---

## 接続の問題

### プロキシ設定

```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
claude
```

### 企業CA証明書

```bash
export NODE_EXTRA_CA_CERTS=/path/to/corporate-ca.pem
claude
```

### 設定ファイルのリセット

```bash
# 全ユーザー設定と状態をリセット（注意: 設定・MCPサーバー・履歴が削除されます）
rm ~/.claude.json
rm -rf ~/.claude/

# プロジェクト設定のみリセット
rm -rf .claude/
rm .mcp.json
```

---

## パフォーマンスの問題

### 高いCPU/メモリ使用量

大規模なコードベースでリソースを大量に消費する場合：

1. `/compact` を定期的に使用してコンテキストサイズを削減
2. 主要タスク間で Claude Code を再起動
3. 大きなビルドディレクトリを `.gitignore` に追加

### コマンドのハング/フリーズ

```bash
# 現在の操作をキャンセル
Ctrl+C

# 応答しない場合はターミナルを閉じて再起動
```

### 検索・ファイル探索の問題

`Search` ツール、`@file` メンション、カスタムエージェントが動作しない場合：

**`ripgrep` のインストール:**

```bash
# macOS (Homebrew)
brew install ripgrep

# Windows (winget)
winget install BurntSushi.ripgrep.MSVC

# Ubuntu/Debian
sudo apt install ripgrep

# Alpine Linux
apk add ripgrep

# Arch Linux
pacman -S ripgrep
```

インストール後:
```bash
export USE_BUILTIN_RIPGREP=0
```

### WSL での検索結果が少ない

Windows ファイルシステム（`/mnt/c/`）上で作業している場合、ディスク読み取りのパフォーマンスペナルティにより検索結果が少なくなることがあります。

**解決策:**
1. より具体的な検索を行う（ディレクトリやファイルタイプを指定）
2. プロジェクトを Linux ファイルシステム（`/home/`）に移動
3. WSL ではなくネイティブ Windows で Claude Code を実行

---

## IDE 統合の問題

### JetBrains IDE が WSL2 で検出されない

"No available IDEs detected" エラーが表示される場合：

**方法1: Windows ファイアウォールを設定**

```bash
# WSL2 の IP アドレスを確認
wsl hostname -I
```

PowerShell (管理者) で実行：
```powershell
New-NetFirewallRule -DisplayName "Allow WSL2 Internal Traffic" -Direction Inbound -Protocol TCP -Action Allow -RemoteAddress 172.21.0.0/16 -LocalAddress 172.21.0.0/16
```

**方法2: ミラーネットワークに切り替え**

`.wslconfig` (Windows ユーザーディレクトリ) に追加：
```ini
[wsl2]
networkingMode=mirrored
```

```bash
wsl --shutdown
```

### JetBrains IDE で Esc キーが機能しない

1. Settings → Tools → Terminal を開く
2. "Move focus to the editor with Escape" のチェックを外す
3. または "Configure terminal keybindings" で "Switch focus to Editor" ショートカットを削除

### IDE 統合の問題を報告する際の情報

[GitHub Issues](https://github.com/anthropics/claude-code/issues) に以下を含めて報告してください：
- 環境タイプ（ネイティブ Windows / WSL1 / WSL2）
- WSL ネットワークモード（NAT / ミラー）
- IDE 名とバージョン
- Claude Code 拡張機能/プラグインのバージョン
- シェルの種類

---

## MCPサーバーの問題

### MCPサーバーが接続されない

```bash
# MCPサーバーの状態を確認
/mcp

# または設定を確認
/doctor
```

設定ファイルを確認：
- `~/.claude.json` - グローバル MCP 設定
- `.mcp.json` - プロジェクト MCP 設定

### MCPサーバーのデバッグ

```bash
# デバッグモードで起動
claude --debug "mcp"
```

### 設定ファイルの場所

| ファイル | 用途 |
|---------|------|
| `~/.claude/settings.json` | ユーザー設定（パーミッション、フック、モデルオーバーライド） |
| `.claude/settings.json` | プロジェクト設定（ソース管理にコミット） |
| `.claude/settings.local.json` | ローカルプロジェクト設定（コミットしない） |
| `~/.claude.json` | グローバル状態（テーマ、OAuth、MCPサーバー） |
| `.mcp.json` | プロジェクトMCPサーバー（ソース管理にコミット） |

---

## デバッグモード

詳細なログを確認するには `--debug` フラグを使用します：

```bash
# 全デバッグログを有効化
claude --debug

# 特定カテゴリのデバッグ
claude --debug "api,mcp"

# カテゴリを除外
claude --debug "!statsig,!file"
```

### デバッグカテゴリ

| カテゴリ | 説明 |
|---------|------|
| `api` | API リクエストとレスポンス |
| `mcp` | MCPサーバーの通信 |
| `hooks` | フックの実行 |
| `file` | ファイル操作 |
| `statsig` | フィーチャーフラグ（通常は除外推奨） |

---

## ログの確認方法

### /doctor コマンド

セッション内で実行：
```
/doctor
```

以下を診断します：
- インストールの種類とバージョン
- 検索機能（ripgrep）の状態
- 自動更新の状態
- 設定ファイルの妥当性（JSON構文、型チェック）
- MCPサーバーの設定
- キーバインディングの設定
- プラグインとエージェントの読み込み状態
- コンテキスト使用量の警告

### verbose モード

```bash
claude --verbose
```

ターン詳細出力を表示します。セッション中は `Ctrl+O` でも切り替え可能。

---

## よくある質問

### Q: コンテキストウィンドウが一杯になった

**A:** `/compact` コマンドで会話を圧縮してください。

```bash
/compact
# または指示付き
/compact "認証フローの実装に集中"
```

コンテキスト使用率が 70-80% を超えたら圧縮を検討してください。

---

### Q: Claude が以前の会話を覚えていない

**A:** セッション管理を確認してください：

```bash
# 最新セッションを継続
claude -c

# 特定のセッションを再開
claude -r "session-name"
```

プロジェクト全体の記憶は `CLAUDE.md` に記録してください。

---

### Q: `/` コマンドが機能しない

**A:** `--disable-slash-commands` フラグが設定されていないか確認してください。

---

### Q: MCP ツールが見つからない

**A:** `/mcp` コマンドでサーバーの接続状態を確認し、設定ファイルの構文エラーがないかチェックしてください。

---

## さらなるサポート

問題が解決しない場合：

1. **`/bug` コマンド** - Claude Code 内から直接 Anthropic に問題を報告
2. **GitHub リポジトリ** - [既知の問題を確認](https://github.com/anthropics/claude-code/issues)
3. **Claude に直接質問** - Claude は自分のドキュメントへの組み込みアクセス権を持っています
