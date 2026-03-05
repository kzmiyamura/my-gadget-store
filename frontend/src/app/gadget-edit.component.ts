import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GadgetService } from './gadget.service';
import { Gadget } from './gadget.model';

/**
 * ガジェット編集コンポーネント（Reactive Forms 版）。
 *
 * ポイント:
 * - gadget を input.required<Gadget>() で受け取る → null チェック不要
 * - effect() で gadget が切り替わるたびに form.patchValue() を呼び出しフォームを自動リセット
 *   （以前の linkedSignal によるフォーム管理と同等の役割）
 * - FormBuilder + Validators でバリデーション定義
 * - 保存時に GadgetService.updateGadget() を呼び出し、成功後に saved を emit
 */
@Component({
  selector: 'app-gadget-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
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
        <p class="text-sm text-gray-400 mb-5">ID: {{ gadget().id }}</p>

        <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              formControlName="name"
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
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              (click)="cancelled.emit()"
              class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || isLoading()"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              {{ isLoading() ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class GadgetEditComponent {
  private fb = inject(FormBuilder);
  private gadgetService = inject(GadgetService);

  /** 親から受け取る編集対象ガジェット（必須） */
  gadget = input.required<Gadget>();

  /** 保存時に更新済みガジェットを親へ通知 */
  saved = output<Gadget>();

  /** キャンセル時に親へ通知 */
  cancelled = output<void>();

  isLoading = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  constructor() {
    /**
     * gadget が切り替わるたびフォームを自動リセット。
     * linkedSignal と同様、ソースシグナル（gadget）の変化に反応して
     * フォームの状態を更新する。
     */
    effect(() => {
      const g = this.gadget();
      untracked(() => {
        this.form.patchValue({ name: g.name, price: g.price, description: g.description });
      });
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    const { name, price, description } = this.form.value as {
      name: string;
      price: number;
      description: string;
    };
    this.isLoading.set(true);
    this.gadgetService.updateGadget(this.gadget().id, { name, price, description }).subscribe({
      next: (updated) => {
        this.isLoading.set(false);
        this.saved.emit(updated);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
