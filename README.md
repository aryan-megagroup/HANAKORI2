#  HANAKORI2 — ショップ管理システム

ポータブルでクリーンアーキテクチャベースのレストラン管理プラットフォームです。メニューアイテム、リアルタイムカート状態、プロモーションコード検証、フルフィルメントワークフローを処理するように設計されています。

---

## 技術スタック

* **バックエンドランタイム:** Go (Golang 1.25)
* **データベースエンジン:** MySQL 8.0
* **フロントエンドレイヤー:** Vanilla JavaScript、HTML5、CSS3
* **コンテナ化:** Docker & Docker Compose

---

## 前提条件

このプロジェクトを起動するには、ローカルホストコンピュータまたはWSLサブシステムに以下のユーティリティがインストールされている必要があります：

* **Docker Desktop**（または `compose` プラグインが有効なDocker Engine）
* **Git**（バージョン管理トラッキング用）

---

## このプロジェクトの起動方法

以下の手順に従って、アプリケーションスタック全体を即座に起動します：

### 1. ワークスペースのクローン

Linux/WSLターミナルを開き、リポジトリのフィーチャーブランチをクローンします：

```bash
git clone https://github.com/aryan-megagroup/HANAKORI2.git
cd HANAKORI2
```

### 2. スタックの起動

```bash
docker-compose up --build -d
```

### 3. システムヘルスの確認

```bash
curl -i http://localhost:8081/api/products
```

---

##  Dockerコマンドリファレンス

| コマンド | 説明 |
|---------|------|
| `docker-compose up --build -d` | アプリケーションを起動 |
| `docker ps` | コンテナのステータスを確認 |
| `docker-compose logs -f web` | アプリケーションのライブログを監視 |