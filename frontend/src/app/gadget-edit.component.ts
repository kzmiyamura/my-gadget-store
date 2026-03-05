import { Component, input, output, linkedSignal } from '@angular/core';
import { Gadget } from './gadget.model';

interface GadgetForm {
  name: string;
  price: number;
  description: string;
}

/**
 * ガジェット編集コンポーネント。
 *
 * ポイント:
 * - activeGadget を input() Signal で受け取る
 * - linkedSignal により、activeGadget が切り替わると form が自動リセットされる
 * - ユーザーが編集中の値は form.update() で保持される（activeGadget が変わるまで）
 */
@Component({
  selector: 'app-gadget-edit',
  standalone: true,
  template: `
    <!-- オーバーレイ -->
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      (click)="cancelled.emit()"
    >
      <!-- モーダル本体（クリックの伝播を止める） -->
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        (click)="$event.stopPropagation()"
      >
        <h2 class="text-xl font-bold text-gray-800 mb-1">ガジェットを編集</h2>
        <p class="text-sm text-gray-400 mb-5">ID: {{ activeGadget()?.id }}</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              [value]="form().name"
              (input)="updateField('name', $event)"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">価格 (円)</label>
            <input
              type="number"
              [value]="form().price"
              (input)="updateField('price', $event)"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              [value]="form().description"
              (input)="updateField('description', $event)"
              rows="3"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            (click)="cancelled.emit()"
            class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            キャンセル
          </button>
          <button
            (click)="onSave()"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  `,
})
export class GadgetEditComponent {
  /** 親から受け取る編集対象ガジェット */
  activeGadget = input<Gadget | null>(null);

  /** 保存時に更新済みガジェットを親へ通知 */
  saved = output<Gadget>();

  /** キャンセル時に親へ通知 */
  cancelled = output<void>();

  /**
   * linkedSignal: activeGadget が切り替わるたびに自動でフォーム状態をリセット。
   * ユーザーが編集中の変更（form.update()）は activeGadget が変わるまで保持される。
   */
  form = linkedSignal<GadgetForm>(() => ({
    name: this.activeGadget()?.name ?? '',
    price: this.activeGadget()?.price ?? 0,
    description: this.activeGadget()?.description ?? '',
  }));

  updateField(field: keyof GadgetForm, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = field === 'price' ? Number(raw) : raw;
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onSave(): void {
    const gadget = this.activeGadget();
    if (!gadget) return;
    this.saved.emit({ ...gadget, ...this.form() });
  }
}
