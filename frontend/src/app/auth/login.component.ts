import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <!-- タイトル -->
        <h1 class="text-3xl font-bold text-gray-800 text-center mb-2">ガジェットストア</h1>
        <p class="text-center text-gray-500 mb-8">
          {{ isRegisterMode() ? 'アカウントを作成' : 'ログイン' }}
        </p>

        <!-- フォーム -->
        <form (ngSubmit)="onSubmit()" #form="ngForm">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              placeholder="example@email.com"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
          </div>

          <!-- エラーメッセージ -->
          @if (errorMessage()) {
            <div class="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {{ errorMessage() }}
            </div>
          }

          <!-- 送信ボタン -->
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            @if (loading()) {
              <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            }
            {{ isRegisterMode() ? 'アカウントを作成' : 'ログイン' }}
          </button>
        </form>

        <!-- モード切り替え -->
        <p class="text-center text-sm text-gray-500 mt-6">
          {{ isRegisterMode() ? 'すでにアカウントをお持ちの方は' : 'アカウントをお持ちでない方は' }}
          <button
            type="button"
            (click)="toggleMode()"
            class="text-purple-600 hover:underline font-medium"
          >
            {{ isRegisterMode() ? 'ログイン' : '新規登録' }}
          </button>
        </p>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isRegisterMode = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  toggleMode() {
    this.isRegisterMode.update((v) => !v);
    this.errorMessage.set('');
  }

  onSubmit() {
    this.loading.set(true);
    this.errorMessage.set('');

    const action = this.isRegisterMode()
      ? this.authService.register(this.email, this.password)
      : this.authService.login(this.email, this.password);

    action.subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? '認証に失敗しました');
        this.loading.set(false);
      },
    });
  }
}
