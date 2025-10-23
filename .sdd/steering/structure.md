# Project Structure

## ルートディレクトリ構成
```
/
├── AGENTS.md
├── package-lock.json
├── package.json
├── config/
│   └── database.js          # SQLite ファイルの初期化と DI
├── src/
│   ├── server.js            # Express アプリのエントリーポイント
│   ├── domain/              # ドメインロジックとバリデーション
│   ├── repository/          # SQLite リポジトリ
│   ├── routes/              # Express ルーター
│   ├── utils/               # 共通ユーティリティ
│   └── views/               # HTML ビュー生成
├── data/                    # `reservations.sqlite` を保存（起動時に生成）
├── tests/
│   ├── helpers/             # Express アプリ向けテストユーティリティ
│   └── *.test.js            # node:test ベースのユニット/統合テスト
└── .sdd/                    # SDD ワークスペース
    ├── README.md
    ├── description.md
    ├── target-spec.txt
    └── steering/
        ├── product.md
        ├── tech.md
        └── structure.md
```

## コード構成パターン
HTTP ルーターからドメイン層へ処理を委譲し、リポジトリで SQLite 永続化を行うレイヤード構造。ビューはサーバーサイドで HTML を生成し、クライアントスクリプトが `/reservations` API を呼び出す。テストは `tests/` 以下でユニット・統合を node:test で実行する。

## ファイル命名規則
- ドメイン/ユーティリティ：`camelCase.js`
- ビュー：`PascalCaseView.js`
- テスト：`*.test.js`

## 主要な設計原則
- `AGENTS.md` の品質基準に従い、node:test を活用したテスト駆動を指向。
- SQLite を前提に、重複検知・バリデーションをドメイン層で担保し、HTTP レイヤーで適切なステータスコードを返却。
- エラーログは共通ミドルウェアで捕捉し、API は JSON 形式を維持。
