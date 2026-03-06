import { Component, effect, inject, input, resource, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { GadgetService } from '../../gadget.service';
import { Gadget } from '../../gadget.model';
import { GadgetStatsComponent } from '../gadget-stats/gadget-stats.component';

/**
 * ガジェット登録・編集の共通フォームコンポーネント。
 *
 * ポイント:
 * - id = input<string>() でルートパラメーターを受け取る（withComponentInputBinding 必須）
 *   - /gadgets/new → id が undefined → 新規登録モード
 *   - /gadgets/:id → id が文字列 → 編集モード
 * - resource() API (Angular 19+) で id() がある場合のみ API フェッチ
 *   - id() が undefined のとき resource は Idle 状態を保ちローダーを呼ばない
 * - effect() で resource.value() をフォームに同期
 * - 保存ボタンラベルを id の有無で「登録」/「更新」に切り替え
 */
@Component({
  selector: 'app-gadget-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, GadgetStatsComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">

        <!-- ヘッダー -->
        <div class="flex items-center gap-4 mb-8">
          <a
            routerLink="/gadgets"
            class="text-sm text-gray-500 hover:text-purple-600 transition"
          >
            ← 一覧に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800">
            {{ id() ? 'ガジェット編集' : 'ガジェット登録' }}
          </h1>
        </div>

        @if (gadgetResource.isLoading()) {
          <div class="text-center text-gray-500 py-12">
            <div class="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-3">読み込み中...</p>
          </div>
        } @else {
          <div class="bg-white rounded-2xl shadow-xl p-6">
            <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-4">

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">名前</label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="例: スマートウォッチ"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
                @if (form.get('name')!.invalid && form.get('name')!.touched) {
                  <p class="text-red-500 text-xs mt-1">名前は3文字以上で入力してください</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">価格 (円)</label>
                <input
                  type="number"
                  formControlName="price"
                  placeholder="例: 29800"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                />
                @if (form.get('price')!.invalid && form.get('price')!.touched) {
                  <p class="text-red-500 text-xs mt-1">0以上の価格を入力してください</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  formControlName="description"
                  rows="3"
                  placeholder="例: 健康管理とスマート通知機能を搭載"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition"
                ></textarea>
              </div>

              <div class="flex justify-between mt-6">
                @if (id()) {
                  <button
                    type="button"
                    (click)="onDelete()"
                    [disabled]="isDeleting() || isSubmitting()"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                  >
                    {{ isDeleting() ? '削除中...' : '削除' }}
                  </button>
                }
                <div class="flex gap-3 ml-auto">
                  <a
                    routerLink="/gadgets"
                    class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition inline-flex items-center"
                  >
                    キャンセル
                  </a>
                  <button
                    type="submit"
                    [disabled]="form.invalid || isSubmitting() || isDeleting()"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
                  >
                    {{ isSubmitting() ? '処理中...' : id() ? '更新' : '登録' }}
                  </button>
                </div>
              </div>

            </form>
          </div>
        }

        <!-- 統計グラフ: スクロールして表示されるまで JS を読み込まない -->
        @if (id() && gadgetResource.value()) {
          @defer (on viewport) {
            <app-gadget-stats [gadget]="gadgetResource.value()!" />
          } @placeholder {
            <!-- スケルトン画面 -->
            <div class="bg-white rounded-2xl shadow-xl p-6 mt-8 animate-pulse">
              <div class="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>

              <div class="mb-8 space-y-4">
                <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                @for (i of [1,2,3]; track i) {
                  <div class="space-y-1">
                    <div class="flex justify-between">
                      <div class="h-3 bg-gray-200 rounded w-24"></div>
                      <div class="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div class="h-4 bg-gray-100 rounded-full w-full">
                      <div class="h-4 bg-gray-200 rounded-full" [style.width]="(30 + i * 20) + '%'"></div>
                    </div>
                  </div>
                }
              </div>

              <div class="mb-8">
                <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div class="h-24 bg-gray-100 rounded-lg"></div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                @for (i of [1,2,3]; track i) {
                  <div class="text-center p-4 bg-gray-100 rounded-xl">
                    <div class="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                }
              </div>
            </div>
          } @loading (minimum 300ms) {
            <div class="flex items-center justify-center gap-2 mt-8 py-6 text-gray-400 text-sm">
              <div class="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              統計データを読み込み中...
            </div>
          }
        }

      </div>
    </div>
  `,
})
export class GadgetFormComponent {
  private fb = inject(FormBuilder);
  private gadgetService = inject(GadgetService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  /**
   * ルートパラメーター :id を受け取る（withComponentInputBinding が必要）。
   * /gadgets/new では undefined、/gadgets/:id では文字列が入る。
   */
  id = input<string>();

  isSubmitting = signal(false);
  isDeleting = signal(false);

  private readonly horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  private readonly verticalPosition: MatSnackBarVerticalPosition = 'top';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  /**
   * resource() API (Angular 19+):
   * - params に id() を渡し、undefined のとき Idle 状態を保ってローダーをスキップ
   * - id() がある場合のみ getGadget(id) を呼び出して Promise でフェッチ
   */
  gadgetResource = resource<Gadget | undefined, string | undefined>({
    params: () => this.id(),
    loader: ({ params: id }) => {
      if (!id) return Promise.resolve(undefined);
      return this.gadgetService.getGadget(id);
    },
  });

  constructor() {
    /** resource.value() が更新されたらフォームに反映する */
    effect(() => {
      const gadget = this.gadgetResource.value();
      if (gadget) {
        untracked(() => {
          this.form.patchValue({
            name: gadget.name,
            price: gadget.price,
            description: gadget.description,
          });
        });
      }
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    const { name, price, description } = this.form.value as {
      name: string;
      price: number;
      description: string;
    };

    this.isSubmitting.set(true);

    const id = this.id();
    const request = id
      ? this.gadgetService.updateGadget(Number(id), { name, price, description })
      : this.gadgetService.createGadget({ name, price, description });

    const successMessage = id ? 'ガジェット情報を更新しました' : '新しいガジェットを登録しました';

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notify(successMessage, ['success-snackbar']);
        this.router.navigate(['/gadgets']);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.notify('保存に失敗しました。もう一度お試しください。');
      },
    });
  }

  onDelete(): void {
    const id = this.id();
    if (!id) return;

    this.isDeleting.set(true);
    this.gadgetService.deleteGadget(Number(id)).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.notify('ガジェットを削除しました', ['success-snackbar']);
        this.router.navigate(['/gadgets']);
      },
      error: () => {
        this.isDeleting.set(false);
        this.notify('削除に失敗しました。もう一度お試しください。');
      },
    });
  }

  private notify(message: string, panelClass: string[] = []): void {
    this.snackBar.open(message, '閉じる', {
      duration: 3000,
      panelClass,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
