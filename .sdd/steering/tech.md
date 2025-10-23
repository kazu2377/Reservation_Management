# Technology Stack

## アーキテクチャ
Node.js + Express で API とビューを同一プロセスに実装し、SQLite をローカル永続化層として利用するシングルアプリ構成。`config/database.js` が `data/reservations.sqlite` を作成し、ブラウザからはサーバーサイド描画された HTML と軽量な JavaScript を通じて `/reservations` API を非同期呼び出しする。

## 使用技術
### 言語とフレームワーク
- JavaScript (Node.js 20.x)
- Express 5.1：HTTP ルーティングとミドルウェア

### 依存関係
- express@5.1.0：HTTP ルーティングとエラーハンドリング
- sqlite3@5.1.7：ファイルベースの予約データ永続化
- (標準) node:test / assert：ユニット・統合テスト基盤

## 開発環境
### 必要なツール
- Node.js / npm
- SQLite3 (CLI でデータ確認を行う際に利用)

### よく使うコマンド
- 起動：`npm run start`
- 開発起動：`npm run dev`
- テスト：`npm test`
- 依存関係インストール：`npm install`

## 環境変数
- `PORT`：サーバー起動ポート（デフォルト 3000）
- `NODE_ENV`：`npm run dev` 実行時に `development` がセットされる（現状は明示的な挙動分岐なし）
