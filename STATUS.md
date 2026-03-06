# my-gadget-store 開発状況

最終更新: 2026-03-06 (GadgetStatsComponent 追加・@defer 遅延読み込み)

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

> **注意**: バックエンドコードを変更した場合は `docker compose up backend --build -d` で再ビルドが必要。
> フロントエンドはホットリロード対応（volume マウント済み）。

### ルーティング

| パス | 画面 | 認証 |
|---|---|---|
| `/login` | ログイン / 新規登録 | 不要 |
| `/gadgets` | ガジェット一覧 | authGuard |
| `/gadgets/:id` | ガジェット詳細・編集 | authGuard |
| `/` | → `/gadgets` リダイレクト | — |

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
- [x] `GET /gadgets/:id` — ガジェット1件取得
- [x] `PATCH /gadgets/:id` — ガジェット更新（Prisma）
- [x] `DELETE /gadgets/:id` — ガジェット削除（Prisma）
- [x] CORS 設定（`app.enableCors()`）
- [x] Prisma ORM による PostgreSQL 接続
- [x] DB マイグレーション自動実行・seed 自動投入（冪等）

**認証**
- [x] `POST /auth/register` — ユーザー登録（bcrypt ハッシュ化）
- [x] `POST /auth/login` — ログイン・JWT 発行
- [x] `JwtStrategy` — Bearer Token 検証（Passport.js）
- [x] `JwtAuthGuard` — `@UseGuards(JwtAuthGuard)` デコレーターとして使用可能

### フロントエンド (Angular)

**ルーティング**
- [x] `app.routes.ts` — `/gadgets` / `/gadgets/:id` / `/login` ルート定義
- [x] `authGuard` — 未ログイン時に `/login` へリダイレクト
- [x] `/` → `/gadgets` リダイレクト

**認証**
- [x] `AuthService` — Signal によるログイン状態管理（`currentUser` / `isLoggedIn`）
- [x] `authInterceptor` — 全リクエストに `Authorization: Bearer` を自動付加
- [x] `LoginComponent` — ログイン / 新規登録フォーム（トグル切り替え）
- [x] ログアウト（localStorage クリア + Signal リセット）

**ガジェット一覧 (`/gadgets`)**
- [x] `rxResource` によるリアクティブなデータ取得
  - `params` Signal が変わると自動で再取得・前リクエストをキャンセル
  - `isLoading()` / `value()` / `error()` を直接テンプレートで参照
- [x] debounce 付きリアルタイム検索（300ms）
- [x] ローディングスピナー・0件メッセージ
- [x] 「編集」ボタンが `routerLink="/gadgets/:id"` で詳細ページへ遷移
- [x] ヘッダーにログイン中メールアドレス + ログアウトボタン

**ガジェット登録・編集フォーム (`GadgetFormComponent`)**
- [x] `GadgetFormComponent` — `resource()` API で登録・編集を共通化
  - `id` input の有無で登録（POST）/ 編集（PATCH）を自動切り替え
  - `MatSnackBar` で保存完了トースト通知（緑色・右上表示）
  - `@defer (on viewport)` で `GadgetStatsComponent` を遅延読み込み
  - スケルトン画面（`@placeholder`）でローディング中の UX を保持

**ガジェット詳細・編集 (`/gadgets/:id`)**
- [x] `GadgetDetailComponent` — `ActivatedRoute` で `:id` を取得して API フェッチ
  - ローディング中スピナー表示・404 時エラーメッセージ表示
  - 保存・削除・キャンセル後に `/gadgets` へ遷移
  - `@defer (on viewport)` で `GadgetStatsComponent` を遅延読み込み
- [x] `GadgetEditComponent` — Reactive Forms 仕様の編集フォーム
  - `input.required<Gadget>()` で null チェック不要
  - `effect()` + `form.patchValue()` で gadget 切り替わり時にフォームを自動リセット
  - `FormBuilder` + `Validators`（name: required/minLength(3)、price: required/min(0)）
  - バリデーションエラーをインラインで赤字表示（invalid && touched）
  - 保存ボタンは `form.invalid` または `isLoading()` のとき disabled
  - `GadgetService.updateGadget()` で `PATCH /gadgets/:id` を呼び出し
  - 削除ボタン（赤）→ `GadgetService.deleteGadget()` で `DELETE /gadgets/:id` を呼び出し
  - 削除中は `isDeleting` Signal で保存・削除ボタンを両方 disabled

**ガジェット統計 (`GadgetStatsComponent`)**
- [x] `@defer (on viewport)` による遅延読み込み（ビューポートに入るまで JS チャンクを読み込まない）
- [x] 価格帯ポジション バーチャート（CSS + Tailwind）
- [x] 月次売上トレンド SVG ラインチャート（グラデーション塗り込み）
- [x] スコアカード（閲覧数・評価スコア・在庫回転率）
- [x] `@placeholder` でスケルトン UI、`@loading` でスピナー表示

**設計**
- [x] `environment.ts` / `environment.prod.ts` による API URL の環境別管理
- [x] `angular.json` に `fileReplacements` 設定済み（本番ビルド時に自動置換）
- [x] `core/constants/auth.constants.ts` に localStorage キーを定数化

### テスト (Vitest + Angular Testing Library + MSW)

- [x] `src/mocks/handlers.ts` — MSW ハンドラー（GET / GET :id / PATCH / DELETE /gadgets/:id）
- [x] `gadget-list.component.spec.ts` — インテグレーションテスト 4 件
  - 初期表示でガジェット一覧を取得して表示する
  - API エラー時にクラッシュせず表示されない
  - ログイン中メールがヘッダーに表示される
  - モックデータと件数が一致する
- [x] `gadget-edit.component.spec.ts` — インテグレーションテスト 3 件
  - 不正な値でボタンが disabled になること
  - 正常な値で PATCH API が呼ばれること
  - 削除ボタンをクリックすると DELETE API が呼ばれること
- [x] `app.spec.ts` — ルートコンポーネント 2 件
- **合計 9 件すべてグリーン**

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
│       │   ├── gadgets.controller.ts  # GET / GET :id / PATCH / DELETE /gadgets
│       │   ├── gadgets.service.ts     # findAll / findOne / updateGadget / deleteGadget
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
            ├── app.routes.ts        # /login / /gadgets / /gadgets/:id
            ├── app.spec.ts          # ルートコンポーネントテスト
            ├── core/constants/
            │   └── auth.constants.ts  # localStorage キー定数
            ├── auth/
            │   ├── auth.service.ts    # Signal 管理・JWT 保存
            │   ├── auth.interceptor.ts  # Bearer 自動付加
            │   ├── auth.guard.ts      # 未ログインリダイレクト
            │   └── login.component.ts  # ログイン / 登録フォーム
            ├── gadget.model.ts        # Gadget 型定義
            ├── gadget.service.ts      # getGadget / getGadgets / searchGadgets / updateGadget / deleteGadget
            ├── gadget-list.component.ts   # rxResource + 検索 + routerLink
            ├── gadget-list.component.spec.ts  # インテグレーションテスト
            ├── gadget-detail.component.ts # /gadgets/:id ページ（@defer で統計を遅延読み込み）
            ├── gadget-edit.component.ts   # Reactive Forms 編集・削除フォーム
            ├── gadget-edit.component.spec.ts  # インテグレーションテスト
            └── components/
                ├── gadget-form/
                │   └── gadget-form.component.ts  # 登録・編集共通フォーム（resource() + SnackBar）
                └── gadget-stats/
                    └── gadget-stats.component.ts  # 統計グラフ（@defer 遅延読み込み対象）
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

- [x] ガジェットの登録画面（GadgetFormComponent で POST /gadgets 対応）
- [ ] バックエンドへの POST /gadgets API 追加
- [ ] カート機能・購入フロー
- [ ] ページネーション / 無限スクロール
- [ ] カテゴリ・価格帯によるフィルタリング
- [ ] バックエンドのバリデーション（`class-validator`）
- [ ] E2E テスト（Playwright 等）
- [ ] 本番ビルド対応（Angular `ng build`、NestJS `start:prod`）
