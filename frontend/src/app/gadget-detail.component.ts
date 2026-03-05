import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GadgetService } from './gadget.service';
import { GadgetEditComponent } from './gadget-edit.component';
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
  imports: [GadgetEditComponent, RouterLink],
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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.gadgetService.getGadget(id).subscribe({
      next: (g) => {
        this.gadget.set(g);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
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
