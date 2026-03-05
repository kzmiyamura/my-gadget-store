import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { GadgetService } from './gadget.service';
import { Gadget } from './gadget.model';
import { AuthService } from './auth/auth.service';
import { GadgetEditComponent } from './gadget-edit.component';

@Component({
  selector: 'app-gadget-list',
  standalone: true,
  imports: [CommonModule, GadgetEditComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div class="max-w-7xl mx-auto">

        <!-- ヘッダー -->
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-4xl font-bold text-gray-800">ガジェットストア</h1>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">{{ authService.currentUser()?.email }}</span>
            <button
              (click)="logout()"
              class="text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              ログアウト
            </button>
          </div>
        </div>

        <!-- 検索フォーム -->
        <div class="mb-10 max-w-xl mx-auto">
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="ガジェット名・説明で検索..."
              (input)="onSearch($event)"
              class="w-full pl-12 pr-4 py-3 text-gray-700 bg-white border border-gray-200 rounded-full shadow-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-200"
            />
          </div>
        </div>

        @if (gadgetsResource.isLoading()) {
          <div class="text-center text-gray-500 py-12">
            <div class="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-3">検索中...</p>
          </div>
        } @else if ((gadgetsResource.value() ?? []).length === 0) {
          <div class="text-center text-gray-500 py-16">
            <p class="text-5xl mb-4">🔍</p>
            <p class="text-lg">「{{ searchQuery() }}」に一致するガジェットはありませんでした</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (gadget of (gadgetsResource.value() ?? []); track gadget.id) {
              <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div class="p-6">
                  <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ gadget.name }}</h2>
                  <p class="text-gray-600 mb-4 min-h-[3rem]">{{ gadget.description }}</p>
                  <div class="flex items-center justify-between">
                    <span class="text-3xl font-bold text-purple-600">
                      ¥{{ gadget.price.toLocaleString() }}
                    </span>
                    <div class="flex gap-2">
                      <button
                        (click)="activeGadget.set(gadget)"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        編集
                      </button>
                      <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
                        購入
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- 編集モーダル -->
    @if (activeGadget()) {
      <app-gadget-edit
        [gadget]="activeGadget()!"
        (saved)="onSaved($event)"
        (deleted)="onDeleted($event)"
        (cancelled)="activeGadget.set(null)"
      />
    }
  `,
})
export class GadgetListComponent implements OnDestroy {
  private gadgetService = inject(GadgetService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  /** 検索ワードを Signal で保持。rxResource の request として使用。 */
  searchQuery = signal('');

  /** 編集対象ガジェット。null のとき編集モーダルは非表示。 */
  activeGadget = signal<Gadget | null>(null);

  private debounceTimer?: ReturnType<typeof setTimeout>;

  /**
   * rxResource: searchQuery シグナルが変わると自動で再取得。
   * - isLoading() / value() / error() をテンプレートで直接参照できる。
   * - 前回のリクエストは自動キャンセル（switchMap 相当）。
   */
  gadgetsResource = rxResource<Gadget[], string>({
    params: () => this.searchQuery(),
    stream: ({ params: query }) => this.gadgetService.searchGadgets(query),
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.searchQuery.set(value), 300);
  }

  onSaved(updated: Gadget): void {
    this.gadgetsResource.reload();
    this.activeGadget.set(null);
  }

  onDeleted(id: number): void {
    this.gadgetsResource.reload();
    this.activeGadget.set(null);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    clearTimeout(this.debounceTimer);
  }
}
