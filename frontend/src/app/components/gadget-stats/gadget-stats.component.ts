import { Component, input, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Gadget } from '../../gadget.model';

/**
 * ガジェット統計グラフコンポーネント（重いコンポーネントを想定）。
 *
 * このコンポーネントは @defer (on viewport) で遅延読み込みされるため、
 * スクロールして画面内に入るまで JS チャンクが読み込まれない。
 *
 * 実際のアプリでは Chart.js / D3.js などの重いライブラリを使う想定。
 * ここでは CSS + SVG でチャートを再現し、重い初期化処理を simulate する。
 */
@Component({
  selector: 'app-gadget-stats',
  standalone: true,
  template: `
    <div class="bg-white rounded-2xl shadow-xl p-6 mt-8">
      <h2 class="text-lg font-bold text-gray-800 mb-6">統計・分析</h2>

      <!-- 価格ポジション バーチャート -->
      <div class="mb-8">
        <h3 class="text-sm font-semibold text-gray-600 mb-3">価格帯ポジション</h3>
        <div class="space-y-3">
          @for (bar of priceBars(); track bar.label) {
            <div>
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>{{ bar.label }}</span>
                <span>{{ bar.value | number }}円</span>
              </div>
              <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  [class]="bar.color"
                  [style.width]="bar.pct + '%'"
                ></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- 月次売上トレンド SVG ラインチャート -->
      <div class="mb-8">
        <h3 class="text-sm font-semibold text-gray-600 mb-3">月次売上トレンド（推定）</h3>
        <svg viewBox="0 0 400 120" class="w-full" aria-hidden="true">
          <!-- グリッド -->
          @for (y of [20, 50, 80]; track y) {
            <line [attr.x1]="0" [attr.y1]="y" [attr.x2]="400" [attr.y2]="y"
                  stroke="#f3f4f6" stroke-width="1"/>
          }
          <!-- ライン -->
          <polyline
            [attr.points]="sparklinePoints()"
            fill="none"
            stroke="#7c3aed"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <!-- グラデーション塗り -->
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon
            [attr.points]="sparklineArea()"
            fill="url(#sparkGrad)"
          />
        </svg>
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          @for (m of months; track m) {
            <span>{{ m }}</span>
          }
        </div>
      </div>

      <!-- スコアカード -->
      <div class="grid grid-cols-3 gap-4">
        @for (stat of scoreCards(); track stat.label) {
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <p class="text-2xl font-bold text-purple-700">{{ stat.value }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <p class="text-xs text-gray-400 mt-4 text-right">
        * このコンポーネントは @defer (on viewport) で遅延読み込みされています
      </p>
    </div>
  `,
})
export class GadgetStatsComponent implements OnInit {
  gadget = input.required<Gadget>();

  priceBars = signal<{ label: string; value: number; pct: number; color: string }[]>([]);
  sparklinePoints = signal('');
  sparklineArea = signal('');
  scoreCards = signal<{ label: string; value: string }[]>([]);

  readonly months = ['7月', '8月', '9月', '10月', '11月', '12月'];

  ngOnInit(): void {
    const price = this.gadget().price;

    // 価格帯ポジション（ダミーデータ）
    this.priceBars.set([
      { label: 'このガジェット', value: price, pct: Math.min((price / 200000) * 100, 100), color: 'bg-purple-500' },
      { label: 'カテゴリ平均', value: Math.round(price * 0.85), pct: Math.min((price * 0.85 / 200000) * 100, 100), color: 'bg-blue-400' },
      { label: 'カテゴリ最高値', value: Math.round(price * 1.6), pct: Math.min((price * 1.6 / 200000) * 100, 100), color: 'bg-gray-300' },
    ]);

    // スパークライン（6ヶ月ダミートレンド）
    const seed = price % 7;
    const ys = [60, 75, 55, 40, 30, 20, 35, 25].slice(seed, seed + 6).map(v => v + (price % 20));
    const maxY = Math.max(...ys);
    const normalized = ys.map(v => Math.round(10 + (v / maxY) * 90));
    const xs = [30, 100, 170, 230, 300, 370];
    const pts = xs.map((x, i) => `${x},${120 - normalized[i]}`).join(' ');
    this.sparklinePoints.set(pts);
    this.sparklineArea.set(`${xs[0]},120 ${pts} ${xs[xs.length - 1]},120`);

    // スコアカード
    this.scoreCards.set([
      { label: '閲覧数（推定）', value: `${(price % 900) + 120}` },
      { label: '評価スコア', value: `${(4.0 + (price % 10) / 10).toFixed(1)}` },
      { label: '在庫回転率', value: `${((price % 30) + 5)}日` },
    ]);
  }
}
