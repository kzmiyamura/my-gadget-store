import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
        
        @if (loading()) {
          <div class="text-center text-gray-600">読み込み中...</div>
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
export class GadgetListComponent implements OnInit {
  private gadgetService = inject(GadgetService);
  
  gadgets = signal<Gadget[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.gadgetService.getGadgets().subscribe({
      next: (data) => {
        this.gadgets.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('データ取得エラー:', err);
        this.loading.set(false);
      }
    });
  }
}
