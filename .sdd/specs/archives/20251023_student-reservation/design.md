# 技術設計書

## アーキテクチャ概要
MVP の予約管理機能は、単一の Web アプリケーションとして実装し、クライアント(UI)・API・データストアを同一プロセスで構築する。現状の技術スタックは未確定だが、最小コストで実装するために Node.js + Express + SQLite を採用する想定で設計する（採用確定時は `.sdd/steering/tech.md` の更新が必要）。UI はサーバーサイドレンダリングまたは軽量フロントエンドで提供し、API 層を通じて予約情報を永続化する。

## 主要コンポーネント
### コンポーネント1：ReservationFormPage
- 責務：受講生向けの予約登録画面を提供し、必須入力チェックや送信処理を行う。
- 入力：受講生が入力する氏名、メール、電話番号（任意）、希望日時、メモなどのフォームデータ。
- 出力：バリデーション結果、予約登録 API への POST リクエスト。
- 依存関係：`ReservationService`（API）、`ValidationUtil`。

### コンポーネント2：ReservationService (API Controller)
- 責務：HTTP リクエストを受け取り、バリデーション後にドメインロジックへ委譲し結果を返却する。
- 入力：`ReservationFormPage` から送信された JSON/URL-encoded データ。
- 出力：予約登録成功時のステータスメッセージ／エラー時のレスポンス。
- 依存関係：`ReservationDomain`、`ReservationRepository`。

### コンポーネント3：ReservationDomain
- 責務：予約のビジネスルール（必須項目や日付整合性など）の検証と、登録・取得のユースケースを統合する。
- 入力：`ReservationService` からの正規化済みデータ、または一覧取得要求。
- 出力：永続化可能な予約エンティティ、一覧データ。
- 依存関係：`ReservationRepository`。

### コンポーネント4：ReservationRepository
- 責務：SQLite テーブルへの CRUD を担当し、データモデルと永続化層を仲介する。
- 入力：`ReservationDomain` からの登録要求（予約エンティティ）、一覧取得条件。
- 出力：登録結果（予約ID）や取得した予約一覧。
- 依存関係：SQLite 接続ライブラリ、`ReservationModel`。

### コンポーネント5：ReservationListPage
- 責務：運営スタッフ向けに予約一覧を表示する UI を提供する。
- 入力：`ReservationService` の一覧取得 API からのデータ。
- 出力：日付昇順に整形された予約リスト表示。
- 依存関係：`ReservationService`（一覧 API）。

## データモデル
### Reservation
- `id`: integer、自動採番の主キー。
- `student_name`: string、受講生氏名（必須）。
- `email`: string、連絡用メールアドレス（必須）。
- `phone`: string、電話番号（任意）。
- `desired_datetime`: datetime、希望日時（必須）。
- `note`: string、任意メモ。
- `created_at`: datetime、登録日時（自動設定）。

SQLite の単一テーブルで管理し、将来的な拡張に備えて `status` や `course_id` などの列を追加できるようスキーマ設計を緩やかに保つ。

## 処理フロー
1. 受講生が `ReservationFormPage` でフォーム入力し、送信ボタンを押下する。
2. フロント側で必須項目のプレ検証を実行し、問題なければ `ReservationService` の `/reservations` エンドポイントへリクエスト送信。
3. `ReservationService` が入力を受け取り、`ReservationDomain` に検証を委譲。必須項目チェックや日時形式チェックを行う。
4. 正常な場合は `ReservationRepository` が SQLite に予約情報を保存し、生成された `id` を返却。
5. `ReservationService` は受付完了レスポンスを返し、UI でサクセスメッセージを表示。
6. 運営スタッフが一覧画面にアクセスすると、`ReservationService` の `/reservations` GET エンドポイントが `ReservationDomain` を通じて予約一覧を取得し、日付昇順に整形した結果を返却する。
7. フロントは取得したデータを表形式で表示し、新規予約がある場合は即時に反映される。

## エラーハンドリング
- 入力バリデーションエラー：必須項目欠落・不正形式時は 400 レスポンスとエラー内容を返却し、フォーム上に表示。
- データベースエラー：接続エラーや書き込み失敗時は 500 レスポンスで運営向けログに記録し、ユーザーには再試行を促すメッセージを表示。
- 重複予約検出：同一受講生が同日時に登録する場合は `ReservationDomain` で検知し、ユーザーへ変更確認を促す。

## 既存コードとの統合
- 変更が必要なファイル：
  - なし（まだ実装が存在しないため）。
- 新規作成ファイル：
  - `src/server.ts`：Express アプリのエントリーポイント。
  - `src/routes/reservations.ts`：予約 API ルーティングとコントローラー。
  - `src/domain/reservation.ts`：ドメインロジック（ユースケースとバリデーション）。
  - `src/repository/reservationRepository.ts`：SQLite を利用したデータアクセス層。
  - `src/models/reservation.ts`：Reservation エンティティ定義。
  - `src/views/reservationForm.tsx` または `src/views/reservationForm.html`：予約登録画面。
  - `src/views/reservationList.tsx` または `src/views/reservationList.html`：予約一覧画面。
  - `config/database.ts`：SQLite 接続設定。

各ファイルの正確な拡張子や技術選択は最終的なスタック決定後に調整し、決定内容をステアリングや tech ドキュメントへ反映する。
