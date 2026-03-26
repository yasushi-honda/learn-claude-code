# Channels — 外部イベントのセッション連携

> **対応公式ドキュメント**: https://code.claude.com/docs/en/channels / https://code.claude.com/docs/en/channels-reference
> **想定所要時間**: 約50分
> **難易度**: ★★★★☆
> **公式ドキュメント検証日**: 2026-03-26

## この章の学習目標

この章を終えると、以下のことができるようになります：

1. Channels の概念（MCP サーバー経由のイベント Push）を理解できる
2. Telegram / Discord / iMessage チャネルをセットアップできる
3. Webhook レシーバーとしてカスタムチャネルを構築できる
4. セキュリティ（送信者ゲーティング）とパーミッションリレーを理解できる
5. Enterprise でのチャネル管理（allowlist / 有効化）を設定できる

---

## 1. Channels とは

Channel は、実行中の Claude Code セッションに **外部イベントを Push する** MCP サーバーです。ターミナルにいなくても、外部で起きた出来事に Claude が反応できます。

### 他の機能との比較

| 機能 | 動作 | 適したユースケース |
|------|------|-------------------|
| [Claude Code on the Web](../week-03_environments/05-web-and-mobile.md) | クラウドサンドボックスでタスク実行 | 非同期の独立タスク |
| [Slack 連携](../week-06_mcp-integration/06-slack-integration.md) | @Claude メンションで Web セッション起動 | チーム会話からのタスク |
| [MCP サーバー](../week-06_mcp-integration/01-mcp-overview.md) | Claude がオンデマンドでクエリ | 外部システムの読み取り |
| [Remote Control](../week-03_environments/06-remote-control.md) | 別デバイスからセッション操作 | 離席中のセッション制御 |
| **Channels** | 外部イベントをセッションに Push | CI 結果、チャットブリッジ、アラート |

### 要件

- Claude Code v2.1.80 以降
- claude.ai アカウントでの認証（API キー / Bedrock / Vertex AI は非対応）
- [Bun](https://bun.sh) ランタイム（プリビルドプラグイン用）
- Team / Enterprise の場合、管理者による有効化が必要

> **Research Preview**: Channels は研究プレビュー段階です。`--channels` フラグの構文やプロトコル契約は変更される可能性があります。

---

## 2. サポート済みチャネル

### Telegram

```bash
# プラグインインストール
/plugin install telegram@claude-plugins-official

# リロードして設定コマンドを有効化
/reload-plugins

# BotFather で取得したトークンを設定
/telegram:configure <token>

# チャネル有効化で再起動
claude --channels plugin:telegram@claude-plugins-official
```

Telegram でボットにメッセージを送るとペアリングコードが返されます。Claude Code で `/telegram:access pair <code>` を実行し、`/telegram:access policy allowlist` でアクセスを制限します。

### Discord

```bash
/plugin install discord@claude-plugins-official
/reload-plugins
/discord:configure <token>
claude --channels plugin:discord@claude-plugins-official
```

Discord Developer Portal でボットを作成し、Message Content Intent を有効化、必要な権限（View Channels / Send Messages / Read Message History 等）を付与します。

### iMessage（macOS のみ）

```bash
/plugin install imessage@claude-plugins-official
claude --channels plugin:imessage@claude-plugins-official
```

外部サービスやトークン不要で、Messages データベースから直接読み取り、AppleScript で返信します。自分自身へのメッセージはアクセス制御をバイパスします。

---

## 3. クイックスタート（fakechat デモ）

本番チャネルを設定する前に、localhost で動作するデモで概念を体験できます：

```bash
# fakechat プラグインをインストール
/plugin install fakechat@claude-plugins-official

# チャネル有効化で再起動
claude --channels plugin:fakechat@claude-plugins-official
```

ブラウザで [http://localhost:8787](http://localhost:8787) を開き、メッセージを送信すると、Claude Code セッションに `<channel source="fakechat">` イベントとして到着します。

---

## 4. カスタムチャネルの構築

### Webhook レシーバーの例

CI パイプラインやモニタリングからの Webhook を受信するカスタムチャネルを構築できます：

```typescript
// webhook.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const mcp = new Server(
  { name: 'webhook', version: '0.0.1' },
  {
    capabilities: { experimental: { 'claude/channel': {} } },
    instructions: 'Events from the webhook channel arrive as <channel source="webhook" ...>.',
  },
)

await mcp.connect(new StdioServerTransport())

Bun.serve({
  port: 8788,
  hostname: '127.0.0.1',
  async fetch(req) {
    const body = await req.text()
    await mcp.notification({
      method: 'notifications/claude/channel',
      params: {
        content: body,
        meta: { path: new URL(req.url).pathname, method: req.method },
      },
    })
    return new Response('ok')
  },
})
```

`.mcp.json` に登録：

```json
{
  "mcpServers": {
    "webhook": { "command": "bun", "args": ["./webhook.ts"] }
  }
}
```

テスト（開発フラグが必要）：

```bash
claude --dangerously-load-development-channels server:webhook

# 別ターミナルから
curl -X POST localhost:8788 -d "build failed on main: https://ci.example.com/run/1234"
```

### 双方向チャネル（返信ツール）

一方向（イベント受信のみ）に加え、`tools: {}` ケイパビリティを宣言して返信ツールを公開すると、Claude がチャネル経由でメッセージを返せます。詳細は [Channels Reference](https://code.claude.com/docs/en/channels-reference) を参照。

---

## 5. セキュリティ

### 送信者ゲーティング

すべてのチャネルプラグインは **送信者 allowlist** を維持し、登録されていない ID からのメッセージは無視されます。

- Telegram / Discord: ペアリングフローで allowlist に追加
- iMessage: 自分自身は自動通過、他は `/imessage:access allow +815012345678` で追加

### パーミッションリレー

双方向チャネルは `claude/channel/permission` ケイパビリティを宣言することで、ツール実行の承認プロンプトをリモートに転送できます。ローカルターミナルとリモート、先に応答した方が適用されます。

> **重要**: 送信者認証のあるチャネルでのみリレーを有効化してください。リレーを通じてツール実行を承認/拒否できるため、信頼できる送信者のみを allowlist に入れてください。

---

## 6. Enterprise 管理

| 設定 | 用途 | 未設定時 |
|------|------|---------|
| `channelsEnabled` | マスタースイッチ。`true` でチャネル有効化 | チャネルブロック |
| `allowedChannelPlugins` | 許可するプラグインのリスト | Anthropic のデフォルトリスト |

Pro / Max ユーザー（組織なし）はこれらのチェックをスキップし、`--channels` で直接有効化できます。

```json
{
  "channelsEnabled": true,
  "allowedChannelPlugins": [
    { "marketplace": "claude-plugins-official", "plugin": "telegram" },
    { "marketplace": "claude-plugins-official", "plugin": "discord" },
    { "marketplace": "acme-corp-plugins", "plugin": "internal-alerts" }
  ]
}
```

---

## ハンズオン演習

### 演習 1: fakechat でチャネル体験

1. fakechat プラグインをインストールし、`--channels` で起動する
2. ブラウザからメッセージを送信し、Claude の反応を確認する
3. ファイル操作を依頼して、パーミッションプロンプトの動作を確認する

### 演習 2: Webhook レシーバーの構築

1. 上記の `webhook.ts` を作成する
2. `--dangerously-load-development-channels` で起動する
3. `curl` でテストメッセージを送信し、Claude の反応を確認する

---

## よくある質問

**Q: チャネルはセッション終了後も動作しますか？**
A: いいえ。チャネルはセッションスコープです。常時稼働にはバックグラウンドプロセスまたは永続ターミナルで Claude を実行してください。

**Q: 複数のチャネルを同時に使えますか？**
A: はい。`--channels` にスペース区切りで複数のプラグインを渡せます。

**Q: API キー認証でチャネルは使えますか？**
A: いいえ。claude.ai アカウントでのログインが必要です。Console / API キー / Bedrock / Vertex AI 認証はサポートされていません。

---

## まとめ

- Channels は外部イベント（チャット、Webhook、アラート）を実行中のセッションに Push する
- Telegram / Discord / iMessage のプリビルトプラグインが利用可能
- カスタムチャネルは MCP サーバーとして構築できる
- 送信者ゲーティングとパーミッションリレーでセキュリティを確保
- Enterprise では `channelsEnabled` と `allowedChannelPlugins` で管理

## 次のステップ

次は [スケジュールタスク](./08-scheduled-tasks.md) に進み、定期実行やリマインダーの設定方法を学びます。

---

> **公式リファレンス**
> - [Channels](https://code.claude.com/docs/en/channels)
> - [Channels Reference](https://code.claude.com/docs/en/channels-reference)
> - [Plugins](https://code.claude.com/docs/en/plugins)
> - [MCP](https://code.claude.com/docs/en/mcp)
