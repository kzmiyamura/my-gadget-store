import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GadgetService } from './gadget.service';
import { GadgetEditComponent } from './gadget-edit.component';
import { GadgetStatsComponent } from './components/gadget-stats/gadget-stats.component';
import { Gadget } from './gadget.model';

/**
 * ガジェット詳細・編集ページ。/gadgets/:id にマウントされる。
 *
 * - ActivatedRoute からパスパラメーター (:id) を取得して API フェッチ
 * - 取得したガジェットを GadgetEditComponent に渡してフォームを表示
 * - 保存・削除・キャンセル後は /gadgets へ戻る
 */
@Component({
  selector: 'app-gadget-detail',
  standalone: true,
  imports: [GadgetEditComponent, GadgetStatsComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">

        <!-- ヘッダー -->
        <div class="flex items-center gap-4 mb-8">
          <a
            routerLink="/gadgets"
            class="text-sm text-gray-500 hover:text-purple-600 transition flex items-center gap-1"
          >
            ← 一覧に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800">ガジェット詳細</h1>
        </div>

        @if (isLoading()) {
          <div class="text-center text-gray-500 py-12">
            <div class="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-3">読み込み中...</p>
          </div>
        } @else if (gadget()) {
          <app-gadget-edit
            [gadget]="gadget()!"
            (saved)="onSaved()"
            (deleted)="onDeleted()"
            (cancelled)="back()"
          />

          <!-- ビューポートに入ったときだけ JS チャンクをロード -->
          @defer (on viewport) {
            <app-gadget-stats [gadget]="gadget()!" />
          } @placeholder {
            <!-- スケルトン画面: コンポーネントが読み込まれるまで表示 -->
            <div class="bg-white rounded-2xl shadow-xl p-6 mt-8 animate-pulse">
              <div class="h-5 bg-gray-200 rounded w-1/4 mb-6"></div>

              <!-- バーチャート skeleton -->
              <div class="mb-8 space-y-4">
                @for (i of [1, 2, 3]; track i) {
                  <div>
                    <div class="flex justify-between mb-1">
                      <div class="h-3 bg-gray-200 rounded w-24"></div>
                      <div class="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full bg-gray-200 rounded-full" [style.width]="(40 + i * 15) + '%'"></div>
                    </div>
                  </div>
                }
              </div>

              <!-- ラインチャート skeleton -->
              <div class="mb-8">
                <div class="h-3 bg-gray-200 rounded w-32 mb-3"></div>
                <div class="h-24 bg-gray-100 rounded-xl"></div>
              </div>

              <!-- スコアカード skeleton -->
              <div class="grid grid-cols-3 gap-4">
                @for (i of [1, 2, 3]; track i) {
                  <div class="p-4 bg-gray-100 rounded-xl flex flex-col items-center gap-2">
                    <div class="h-7 bg-gray-200 rounded w-12"></div>
                    <div class="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                }
              </div>
            </div>
          }
        } @else {
          <div class="text-center text-gray-500 py-16">
            <p class="text-5xl mb-4">🔍</p>
            <p class="text-lg">ガジェットが見つかりませんでした</p>
            <a routerLink="/gadgets" class="mt-4 inline-block text-purple-600 hover:underline">
              一覧に戻る
            </a>
          </div>
        }

      </div>
    </div>
  `,
})
export class GadgetDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gadgetService = inject(GadgetService);

  gadget = signal<Gadget | null>(null);
  isLoading = signal(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.gadgetService.getGadget(id).then((g) => {
      this.gadget.set(g);
      this.isLoading.set(false);
    }).catch(() => {
      this.isLoading.set(false);
    });
  }

  onSaved(): void {
    this.router.navigate(['/gadgets']);
  }

  onDeleted(): void {
    this.router.navigate(['/gadgets']);
  }

  back(): void {
    this.router.navigate(['/gadgets']);
  }
}
