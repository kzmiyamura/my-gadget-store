# my-gadget-store 開発状況

最終更新: 2026-03-04

---

## 概要

Angular + NestJS + PostgreSQL で構成したガジェット EC サイトの学習用プロジェクト。
全サービスを Docker Compose で一括起動できる。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Angular 19（Standalone Component）, RxJS, Tailwind CSS v4 |
| バックエンド | NestJS 11, Prisma 6 |
| データベース | PostgreSQL 15 |
| インフラ | Docker Compose |

---

## 起動方法

```bash
docker compose up --build
```

| サービス | URL |
|---|---|
| フロントエンド | http://localhost:4200 |
| バックエンド API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

> バックエンドは初回起動時に `prisma migrate deploy` と seed を自動実行する。
> seed はデータが既に存在する場合はスキップされる（冪等）。

---

## 実装済み機能

### バックエンド (NestJS)

- [x] `GET /gadgets` — ガジェット一覧取得
- [x] `GET /gadgets?q=keyword` — 名前・説明文の部分一致検索（大文字小文字無視）
- [x] CORS 設定（`app.enableCors()`）
- [x] Prisma ORM による PostgreSQL 接続
- [x] DB マイグレーション（`prisma migrate deploy`）の自動実行
- [x] 初期データ seed（5件）の自動投入

### フロントエンド (Angular)

- [x] ガジェット一覧表示（グリッドレイアウト）
- [x] リアルタイム検索
  - `Subject` で入力イベントをストリーム化
  - `debounceTime(300)` — 300ms 入力が止まるまでリクエストを送らない
  - `distinctUntilChanged()` — 前回と同じ値なら無視
  - `switchMap()` — 新しいリクエストが来たら前のリクエストをキャンセル
- [x] `signal` による状態管理（gadgets / loading / currentQuery）
- [x] ローディングスピナー表示
- [x] 検索結果 0 件時のメッセージ表示
- [x] `provideHttpClient()` による HTTP 通信設定
- [x] Tailwind CSS によるモダン UI

---

## データモデル

```prisma
model Gadget {
  id          Int      @id @default(autoincrement())
  name        String
  price       Int
  description String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## ファイル構成（主要ファイル）

```
my-gadget-store/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── src/
│       ├── main.ts                  # CORS設定・起動
│       ├── gadgets/
│       │   ├── gadgets.controller.ts  # GET /gadgets?q=
│       │   ├── gadgets.service.ts     # Prisma検索ロジック
│       │   └── gadgets.module.ts
│       └── prisma/
│           └── prisma.service.ts
└── frontend/
    └── src/
        ├── main.ts                  # bootstrapApplication
        ├── index.html
        ├── styles.css               # Tailwind import
        └── app/
            ├── app.ts               # ルートコンポーネント
            ├── app.config.ts        # provideHttpClient, provideRouter
            ├── app.routes.ts
            ├── gadget.model.ts      # Gadget 型定義
            ├── gadget.service.ts    # API通信（getGadgets / searchGadgets）
            └── gadget-list.component.ts  # 一覧・検索UI・RxJSロジック
```

---

## 未実装（今後の拡張候補）

- [ ] ガジェットの登録・編集・削除（CRUD）
- [ ] カート機能・購入フロー
- [ ] ページネーション / 無限スクロール
- [ ] カテゴリ・価格帯によるフィルタリング
- [ ] ユーザー認証（ログイン・ログアウト）
- [ ] バックエンドのバリデーション（`class-validator`）
- [ ] テスト（Unit / E2E）
- [ ] 本番ビルド対応（Angular `ng build`、NestJS `start:prod`）
