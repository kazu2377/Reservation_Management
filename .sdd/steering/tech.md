# Technology Stack

## アーキテクチャ
Node.js + Express で API とビューを同一プロセスに実装し、SQLite をローカル永続化層として利用するシングルアプリ構成。フロントエンドはサーバーサイドで HTML を生成し、軽量なブラウザ側 JavaScript で API を呼び出す。

## 使用技術
### 言語とフレームワーク
- JavaScript (Node.js v20 以上想定)
- Express 5.x：HTTP ルーティングとミドルウェア

### 依存関係
- sqlite3：ファイルベースの予約データ永続化
- (開発) node:test + assert：ユニット/統合テスト

## 開発環境
### 必要なツール
- Node.js / npm
- SQLite3 (バンドルされた CLI を利用する場合)

### よく使うコマンド
- 起動：`npm run start`
- 開発起動：`npm run dev`
- テスト：`npm test`

## 環境変数
- `PORT`：サーバー起動ポート（デフォルト 3000）。NW 制限のある環境ではローカルマシンで実行。
