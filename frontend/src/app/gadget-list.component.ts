import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { GadgetService } from './gadget.service';
import { Gadget } from './gadget.model';

@Component({
  selector: 'app-gadget-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">
          ガジェットストア
        </h1>

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

        @if (loading()) {
          <div class="text-center text-gray-500 py-12">
            <div class="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-3">検索中...</p>
          </div>
        } @else if (gadgets().length === 0) {
          <div class="text-center text-gray-500 py-16">
            <p class="text-5xl mb-4">🔍</p>
            <p class="text-lg">「{{ currentQuery() }}」に一致するガジェットはありませんでした</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (gadget of gadgets(); track gadget.id) {
              <div class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                <div class="p-6">
                  <h2 class="text-2xl font-bold text-gray-800 mb-2">
                    {{ gadget.name }}
                  </h2>
                  <p class="text-gray-600 mb-4 min-h-[3rem]">
                    {{ gadget.description }}
                  </p>
                  <div class="flex items-center justify-between">
                    <span class="text-3xl font-bold text-purple-600">
                      ¥{{ gadget.price.toLocaleString() }}
                    </span>
                    <button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
                      購入
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class GadgetListComponent implements OnInit, OnDestroy {
  private gadgetService = inject(GadgetService);
  private searchSubject = new Subject<string>();
  private subscription = new Subscription();

  gadgets = signal<Gadget[]>([]);
  loading = signal(true);
  currentQuery = signal('');

  ngOnInit() {
    this.subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          this.loading.set(true);
          this.currentQuery.set(query);
          return this.gadgetService.searchGadgets(query);
        })
      ).subscribe({
        next: (data) => {
          this.gadgets.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('検索エラー:', err);
          this.loading.set(false);
        }
      })
    );

    // 初期ロード（全件表示）
    this.searchSubject.next('');
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
