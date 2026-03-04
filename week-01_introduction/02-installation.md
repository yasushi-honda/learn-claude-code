# インストール方法

> **対応公式ドキュメント**: https://code.claude.com/docs/en/quickstart
> **想定所要時間**: 約60分
> **難易度**: ★☆☆☆☆

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. システム要件を確認して自分の環境が対応しているか判断できる
2. macOS / Linux / Windows の各環境に Claude Code をインストールできる
3. ネイティブインストール・Homebrew・WinGet の違いと使い分けを説明できる
4. バージョン確認・手動更新・アンインストールができる

---

## 1. システム要件

### 対応 OS

Claude Code は以下の OS で動作します。

| OS | バージョン | 備考 |
|---|---|---|
| **macOS** | 10.15（Catalina）以降 | Apple Silicon / Intel 両対応 |
| **Linux** | 主要ディストリビューション | Ubuntu、Debian、Fedora 等 |
| **Windows** | Windows 10 以降 | Git for Windows が必須 |
| **WSL** | WSL 2 推奨 | Linux 版と同じ手順 |

### 前提条件

- **Node.js は不要**: Claude Code はスタンドアロンバイナリとして配布されています。以前は Node.js が必要でしたが、現在は不要です
- **Git**: バージョン管理機能を使う場合に必要（ほぼ必須）
- **Windows の場合**: [Git for Windows](https://git-scm.com/downloads/win) を事前にインストールしてください
- **アカウント**: Claude Pro / Max / Teams / Enterprise、または Console / Bedrock / Vertex / Foundry アカウント（詳細は第5章）

### ネットワーク要件

Claude Code はクラウド上の Claude モデルに接続するため、インターネット接続が必要です。プロキシ環境では追加設定が必要な場合があります（トラブルシューティングセクション参照）。

### チェックリスト

インストールを始める前に、以下を確認してください。

- [ ] OS が対応バージョンか（macOS 10.15+、Windows 10+、主要 Linux ディストリビューション）
- [ ] Git がインストールされているか（`git --version` で確認）
- [ ] Windows の場合: Git for Windows がインストールされているか
- [ ] Claude のアカウントを持っているか（持っていなければ [claude.ai](https://claude.ai) で作成）
- [ ] インターネット接続が利用可能か

---

## 2. インストール方法

Claude Code のインストールには複数の方法があります。**ネイティブインストールが推奨**です。

### ネイティブインストール（推奨）

ネイティブインストールは**バックグラウンド自動更新**に対応しており、常に最新の機能とセキュリティ修正が適用されます。特別な理由がない限り、この方法を選んでください。

#### macOS / Linux / WSL

ターミナルを開いて以下を実行します。

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

> **コマンド解説**:
> - `curl -fsSL`: URL からスクリプトをダウンロード（`-f` 失敗時エラー、`-s` サイレント、`-S` エラー表示、`-L` リダイレクト追従）
> - `| bash`: ダウンロードしたスクリプトを bash で実行

#### Windows PowerShell

PowerShell を開いて以下を実行します。

```powershell
irm https://claude.ai/install.ps1 | iex
```

> **コマンド解説**:
> - `irm`: `Invoke-RestMethod` のエイリアス。URL からスクリプトをダウンロード
> - `| iex`: `Invoke-Expression` のエイリアス。ダウンロードしたスクリプトを実行

#### Windows CMD（コマンドプロンプト）

コマンドプロンプトを開いて以下を実行します。

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

> **コマンド解説**:
> - スクリプトをダウンロードして実行し、終了後にスクリプトを削除する一連の流れ

### Homebrew（macOS / Linux）

macOS または Linux で Homebrew を使用している場合。

```bash
brew install --cask claude-code
```

> **注意**: Homebrew インストールは**自動更新に対応していません**。新しいバージョンが出たら手動で更新が必要です。
> ```bash
> brew upgrade claude-code
> ```

### WinGet（Windows）

Windows で WinGet パッケージマネージャーを使用している場合。

```powershell
winget install Anthropic.ClaudeCode
```

> **注意**: WinGet インストールも**自動更新に対応していません**。手動で更新が必要です。
> ```powershell
> winget upgrade Anthropic.ClaudeCode
> ```

### インストール方法の比較

| 方法 | コマンド | 自動更新 | 対応 OS | 推奨 |
|---|---|---|---|---|
| ネイティブ（curl） | `curl -fsSL https://claude.ai/install.sh \| bash` | あり | macOS / Linux / WSL | **推奨** |
| ネイティブ（PowerShell） | `irm https://claude.ai/install.ps1 \| iex` | あり | Windows | **推奨** |
| ネイティブ（CMD） | `curl ... install.cmd` | あり | Windows | **推奨** |
| Homebrew | `brew install --cask claude-code` | なし | macOS / Linux | - |
| WinGet | `winget install Anthropic.ClaudeCode` | なし | Windows | - |

> **公式ドキュメントより**: ネイティブインストールはバックグラウンドで自動更新が行われるため、常に最新バージョンを維持できます。Homebrew / WinGet では定期的な手動更新が必要です。

---

## 3. インストール後の確認

### バージョン確認

インストールが完了したら、**新しいターミナルウィンドウを開いて**以下を実行します。

```bash
claude --version
```

バージョン番号が表示されればインストール成功です。

```
claude v1.x.x
```

> **重要**: インストール直後は、ターミナルを再起動（新しいウィンドウを開く）しないとコマンドが認識されない場合があります。

### 初回起動テスト

プロジェクトディレクトリに移動して Claude Code を起動してみましょう。

```bash
cd /path/to/your/project
claude
```

初回起動時にはログインプロンプトが表示されます（ログインの詳細は第5章で解説します）。

---

## 4. バージョン管理と更新

### 手動更新

ネイティブインストールの場合、通常はバックグラウンドで自動更新されますが、手動で最新版に更新することもできます。

```bash
claude update
```

### バージョン確認のバリエーション

```bash
# バージョン番号のみ表示
claude --version

# 短縮形
claude -v
```

### アンインストール

#### macOS / Linux（ネイティブインストール）

```bash
# アンインストールの詳細は公式ドキュメントの Setup ページを参照
# https://code.claude.com/docs/en/quickstart
```

#### Homebrew

```bash
brew uninstall --cask claude-code
```

#### WinGet

```powershell
winget uninstall Anthropic.ClaudeCode
```

---

## 5. トラブルシューティング

インストール時によく発生する問題と対処法をまとめます。

### コマンドが見つからない

**症状**: `claude: command not found` と表示される

**対処法**:

1. ターミナルを再起動する（新しいウィンドウを開く）
2. PATH にインストールパスが含まれているか確認する

```bash
# macOS / Linux
echo $PATH

# PATH にインストール先が含まれていない場合
# シェル設定ファイル（~/.bashrc, ~/.zshrc 等）を確認する
```

### 権限エラー（Linux）

**症状**: `Permission denied` と表示される

**対処法**:

```bash
# sudo を使用して再実行
sudo curl -fsSL https://claude.ai/install.sh | sudo bash

# または、インストール先ディレクトリの権限を確認
ls -la /usr/local/bin/claude
```

### Windows で動作しない

**症状**: インストール後にコマンドが動作しない

**対処法**:

1. **Git for Windows** が正しくインストールされているか確認する
   ```powershell
   git --version
   ```
2. PowerShell を**管理者として実行**して再インストールする
3. 環境変数 PATH にインストールパスが含まれているか確認する

### プロキシ環境での問題

**症状**: ダウンロードが失敗する

**対処法**:

```bash
# プロキシ設定を確認
echo $HTTP_PROXY
echo $HTTPS_PROXY

# 必要に応じてプロキシを設定してからインストール
export HTTPS_PROXY=http://proxy.example.com:8080
curl -fsSL https://claude.ai/install.sh | bash
```

---

## ハンズオン演習

### 演習 1: Claude Code をインストールする

**目的**: 自分の環境に Claude Code をインストールし、動作を確認する
**前提条件**: macOS / Linux / Windows のいずれかの環境

**手順**:

1. 自分の OS を確認する
   ```bash
   # macOS
   sw_vers

   # Linux
   cat /etc/os-release

   # Windows (PowerShell)
   [System.Environment]::OSVersion
   ```

2. ネイティブインストールを実行する（OS に応じたコマンドを選択）

   macOS / Linux:
   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   Windows PowerShell:
   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```

3. 新しいターミナルウィンドウを開く

4. バージョンを確認する
   ```bash
   claude --version
   ```

**期待される結果**: `claude v1.x.x` のようなバージョン番号が表示される

### 演習 2: インストール環境の確認

**目的**: Claude Code が正しく動作する環境が整っているか確認する

**手順**:

1. Git がインストールされているか確認する
   ```bash
   git --version
   ```

2. Claude Code のヘルプを表示する
   ```bash
   claude --help
   ```

3. 利用可能なサブコマンドを確認する

**期待される結果**: Git のバージョンと Claude Code のヘルプ情報が正しく表示される

### 演習 3: テストプロジェクトで起動する

**目的**: Claude Code の初回起動を体験する

**手順**:

1. テスト用ディレクトリを作成する
   ```bash
   mkdir -p ~/claude-test-project
   cd ~/claude-test-project
   git init
   ```

2. 簡単なファイルを作成する
   ```bash
   echo "# Test Project" > README.md
   ```

3. Claude Code を起動する
   ```bash
   claude
   ```

4. ログインプロンプトが表示されることを確認する（ログインは第5章で行います）

5. `Ctrl+C` または `exit` で終了する

**期待される結果**: Claude Code が起動し、ログインプロンプトまたは対話画面が表示される

---

## よくある質問

**Q: Node.js は必要ですか？**
A: いいえ。以前のバージョンでは Node.js 18+ が必要でしたが、現在の Claude Code はスタンドアロンバイナリとして配布されており、Node.js は不要です。

**Q: ネイティブインストールと Homebrew、どちらを選ぶべきですか？**
A: 特別な理由がない限り、**ネイティブインストールを推奨**します。バックグラウンド自動更新に対応しており、常に最新バージョンを維持できます。Homebrew / WinGet では手動更新が必要です。

**Q: 複数バージョンを並行して使えますか？**
A: 通常は最新バージョンのみがインストールされます。複数バージョンの並行利用は公式にはサポートされていません。

**Q: インストールにはどのくらいのディスク容量が必要ですか？**
A: Claude Code のバイナリ自体は軽量です。正確なサイズはバージョンによって異なりますが、通常は数百 MB 程度です。

**Q: WSL と Windows ネイティブ、どちらでインストールすべきですか？**
A: 開発環境が WSL 内にある場合は WSL（Linux 版の手順）、Windows ネイティブの開発環境を使っている場合は Windows 版（PowerShell/CMD）を選んでください。

---

## まとめ

この章で学んだ重要ポイント：

- ネイティブインストール（`curl` / PowerShell / CMD）が **自動更新対応で推奨**
- Homebrew / WinGet 経由のインストールは **自動更新なし**、定期的な手動更新が必要
- Windows では **Git for Windows** が必須の前提条件
- `claude --version` でバージョン確認、`claude update` で手動更新
- インストール後は **ターミナルを再起動** してから動作確認すること

## 次のステップ

次の章「初回セッション」では、インストールした Claude Code を実際に起動し、プロジェクトへの質問やコード変更を体験します。

---

> **公式リファレンス**
> - [Quickstart](https://code.claude.com/docs/en/quickstart) - インストールから初回起動まで
> - [CLI Reference](https://code.claude.com/docs/en/cli-reference) - コマンド・フラグの完全リスト
