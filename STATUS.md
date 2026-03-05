# my-gadget-store 開発状況

最終更新: 2026-03-05

---

## 概要

Angular + NestJS + PostgreSQL で構成したガジェット EC サイトの学習用プロジェクト。
全サービスを Docker Compose で一括起動できる。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Angular 21（Standalone Component）, RxJS, Tailwind CSS v4 |
| バックエンド | NestJS 11, Prisma 6, Passport.js, JWT |
| データベース | PostgreSQL 15 |
| テスト | Vitest, Angular Testing Library, MSW |
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
| Prisma Studio | http://localhost:5555 |
| PostgreSQL | localhost:5432 |

> バックエンドは初回起動時に `prisma migrate deploy` と seed を自動実行する。
> seed はデータが既に存在する場合はスキップされる（冪等）。

### テストアカウント

| メール | パスワード |
|---|---|
| test@example.com | password123 |

### テスト実行

```bash
docker compose exec frontend npx ng test --watch=false
```

---

## 実装済み機能

### バックエンド (NestJS)

**ガジェット**
- [x] `GET /gadgets` — ガジェット一覧取得
- [x] `GET /gadgets?q=keyword` — 名前・説明文の部分一致検索（大文字小文字無視）
- [x] CORS 設定（`app.enableCors()`）
- [x] Prisma ORM による PostgreSQL 接続
- [x] DB マイグレーション自動実行・seed 自動投入（冪等）

**認証**
- [x] `POST /auth/register` — ユーザー登録（bcrypt ハッシュ化）
- [x] `POST /auth/login` — ログイン・JWT 発行
- [x] `JwtStrategy` — Bearer Token 検証（Passport.js）
- [x] `JwtAuthGuard` — `@UseGuards(JwtAuthGuard)` デコレーターとして使用可能

### フロントエンド (Angular)

**認証**
- [x] `AuthService` — Signal によるログイン状態管理（`currentUser` / `isLoggedIn`）
- [x] `authInterceptor` — 全リクエストに `Authorization: Bearer` を自動付加
- [x] `authGuard` — 未ログイン時に `/login` へリダイレクト
- [x] `LoginComponent` — ログイン / 新規登録フォーム（トグル切り替え）
- [x] ログアウト（localStorage クリア + Signal リセット）

**ガジェット一覧**
- [x] `rxResource` によるリアクティブなデータ取得
  - `params` Signal が変わると自動で再取得・前リクエストをキャンセル
  - `isLoading()` / `value()` / `error()` を直接テンプレートで参照
- [x] debounce 付きリアルタイム検索（300ms）
- [x] ローディングスピナー・0件メッセージ
- [x] Tailwind CSS によるモダン UI
- [x] ヘッダーにログイン中メールアドレス + ログアウトボタン

**ガジェット編集**
- [x] `GadgetEditComponent` — `linkedSignal` による編集フォーム
  - `activeGadget` が切り替わると `linkedSignal` が自動でフォームをリセット
  - ユーザーの編集中状態は `form.update()` で保持
  - 編集ボタン → モーダル表示 → 保存 / キャンセル

**設計**
- [x] `environment.ts` / `environment.prod.ts` による API URL の環境別管理
- [x] `angular.json` に `fileReplacements` 設定済み（本番ビルド時に自動置換）
- [x] `core/constants/auth.constants.ts` に localStorage キーを定数化

### テスト (Vitest + Angular Testing Library + MSW)

- [x] `src/mocks/handlers.ts` — MSW ハンドラー（GET /gadgets）
- [x] `gadget-list.component.spec.ts` — インテグレーションテスト 4 件
  - 初期表示でガジェット一覧を取得して表示する
  - API エラー時にクラッシュせず表示されない
  - ログイン中メールがヘッダーに表示される
  - モックデータと件数が一致する
- [x] `app.spec.ts` — ルートコンポーネント 2 件
- **合計 6 件すべてグリーン**

---

## データモデル

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String   // bcrypt ハッシュ
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

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
├── docker-compose.yml           # db / backend / prisma-studio / frontend
├── backend/
│   ├── Dockerfile               # migrate → seed → start:dev
│   ├── prisma/
│   │   ├── schema.prisma        # User / Gadget モデル
│   │   ├── seed.ts              # 初期ガジェット5件（冪等）
│   │   └── migrations/
│   └── src/
│       ├── main.ts              # CORS 設定・起動
│       ├── auth/
│       │   ├── auth.module.ts   # PassportModule + JwtModule
│       │   ├── auth.service.ts  # register / login / bcrypt
│       │   ├── auth.controller.ts  # POST /auth/register, /auth/login
│       │   ├── jwt.strategy.ts  # Bearer Token 検証
│       │   └── jwt-auth.guard.ts  # @UseGuards 用ガード
│       ├── gadgets/
│       │   ├── gadgets.controller.ts  # GET /gadgets?q=
│       │   ├── gadgets.service.ts     # Prisma 検索ロジック
│       │   └── gadgets.module.ts
│       └── prisma/
│           └── prisma.service.ts
└── frontend/
    └── src/
        ├── environments/
        │   ├── environment.ts        # 開発用 API URL
        │   └── environment.prod.ts   # 本番用 API URL
        ├── mocks/
        │   └── handlers.ts           # MSW ハンドラー
        ├── test-setup.ts             # @testing-library/jest-dom/vitest
        ├── main.ts                   # bootstrapApplication
        ├── styles.css                # Tailwind import
        └── app/
            ├── app.ts               # RouterOutlet
            ├── app.config.ts        # provideHttpClient + authInterceptor
            ├── app.routes.ts        # /login (公開) / '' (authGuard 保護)
            ├── app.spec.ts          # ルートコンポーネントテスト
            ├── core/constants/
            │   └── auth.constants.ts  # localStorage キー定数
            ├── auth/
            │   ├── auth.service.ts    # Signal 管理・JWT 保存
            │   ├── auth.interceptor.ts  # Bearer 自動付加
            │   ├── auth.guard.ts      # 未ログインリダイレクト
            │   └── login.component.ts  # ログイン / 登録フォーム
            ├── gadget.model.ts        # Gadget 型定義
            ├── gadget.service.ts      # getGadgets / searchGadgets
            ├── gadget-list.component.ts   # rxResource + 検索 + ログアウト
            ├── gadget-list.component.spec.ts  # インテグレーションテスト
            └── gadget-edit.component.ts   # linkedSignal 編集フォーム
```

---

## 将来の移行ポイント（AWS Cognito 対応）

| 現在 | Cognito 移行後 |
|---|---|
| `AuthService.login()` → REST API | `Auth.signIn()` (Amplify SDK) に差し替え |
| localStorage で JWT 管理 | Amplify が自動管理 |
| `JwtStrategy` | Cognito の JWKS エンドポイントを参照する Strategy に差し替え |
| `environment.apiUrl` | 本番 URL を `environment.prod.ts` に設定するだけ |

---

## 未実装（今後の拡張候補）

- [ ] ガジェットの登録・削除 API（CRUD 完成）
- [ ] 編集フォームの保存を API に連携
- [ ] カート機能・購入フロー
- [ ] ページネーション / 無限スクロール
- [ ] カテゴリ・価格帯によるフィルタリング
- [ ] バックエンドのバリデーション（`class-validator`）
- [ ] E2E テスト（Playwright 等）
- [ ] 本番ビルド対応（Angular `ng build`、NestJS `start:prod`）
