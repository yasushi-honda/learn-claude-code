# Week 8: 上級・エンタープライズ

> 公式ドキュメント: [Claude Code Docs](https://code.claude.com/docs/en/)

## 週のテーマ

セキュリティ・サンドボックス・エンタープライズ展開・クラウドプロバイダー連携・組織管理設定・データプライバシーなど、組織規模での安全な運用に必要な上級トピックを学びます。

## 学習目標

1. Claude Codeのセキュリティモデルとプロンプトインジェクション対策を理解する
2. サンドボックスによるファイルシステム・ネットワーク分離を設定できる
3. エンタープライズ環境での導入オプションとネットワーク設定を把握する
4. Amazon Bedrock・Google Vertex AI・Microsoft Foundryとの連携設定ができる
5. サーバー配信設定で組織全体のポリシーを一元管理できる
6. データ使用ポリシーとZero Data Retentionを理解し、適切に設定できる
7. Claude Codeのベストプラクティスを個人・チーム・組織レベルで実践できる

## レッスン一覧

| ファイル | タイトル | 概要 |
|---------|---------|------|
| [01-security.md](01-security.md) | セキュリティ設計 | パーミッションアーキテクチャ・プロンプトインジェクション対策 |
| [02-sandboxing.md](02-sandboxing.md) | サンドボックス環境 | ファイルシステム・ネットワーク分離の設定と活用 |
| [03-enterprise-deployment.md](03-enterprise-deployment.md) | エンタープライズ導入 | 導入オプション比較・プロキシ・LLMゲートウェイ設定 |
| [04-cloud-providers.md](04-cloud-providers.md) | クラウドプロバイダー連携 | Bedrock・Vertex AI・Microsoft Foundryの設定と比較 |
| [05-managed-settings.md](05-managed-settings.md) | 組織管理設定 | サーバー配信設定によるポリシー一元管理 |
| [06-best-practices.md](06-best-practices.md) | ベストプラクティス総まとめ | 環境設定・プロンプト・チーム運用・セキュリティ・コスト最適化 |
| [07-data-privacy.md](07-data-privacy.md) | データプライバシー・ZDR | データ使用ポリシー・Zero Data Retention・GDPR対応 |
| [references.md](references.md) | 公式ドキュメントリンク集 | Week 8関連の全参考資料 |

## この週で身につくスキル

- セキュリティリスクの把握とプロンプトインジェクション防御
- OSレベルのサンドボックスによる安全な自律実行環境の構築
- エンタープライズ環境への適切な導入方式の選択と設定
- クラウドプロバイダー（AWS/GCP/Azure）との認証・統合
- 組織ポリシーのサーバー配信と強制適用
- コンプライアンス要件（GDPR・SOC2・ZDR）への対応

## 前提知識

- Week 1〜7の内容（基本操作・設定・カスタマイズ・MCP・CI/CD）
- クラウドサービス（AWS/GCP/Azure）の基礎知識
- 企業セキュリティポリシーの基本概念
- （推奨）IAM・認証・認可の基礎知識
