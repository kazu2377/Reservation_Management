# Project Structure

## ルートディレクトリ構成
```
/
├── AGENTS.md
├── package.json
├── src/
│   ├── server.js            # Express アプリのエントリーポイント
│   ├── domain/              # ドメインロジックとバリデーション
│   ├── repository/          # SQLite リポジトリ
│   ├── routes/              # Express ルーター
│   ├── utils/               # 共通ユーティリティ
│   └── views/               # HTML ビュー生成
├── config/
│   └── database.js          # SQLite 初期化
├── tests/                   # node:test ベースのテスト
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
ドメイン、リポジトリ、ルーター、ビューを役割ごとに分割。テストは `tests/` 以下でユニット・統合を node:test で実行する。

## ファイル命名規則
- ドメイン/ユーティリティ：`camelCase.js`
- ビュー：`PascalCaseView.js`
- テスト：`*.test.js`

## 主要な設計原則
- `AGENTS.md` の品質基準に従い、TDD (node:test) とシンプルなレイヤリングを適用。
- SQLite を前提に、重複検知・バリデーションをドメイン層で担保。
