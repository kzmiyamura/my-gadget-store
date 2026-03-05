import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { GadgetListComponent } from './gadget-list.component';
import { AuthService } from './auth/auth.service';
import { mockGadgets, handlers } from '../mocks/handlers';
import type { AuthUser } from './auth/auth.service';

// ---- MSW サーバー ----
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ---- AuthService モック ----
const mockAuthService = {
  currentUser: signal<AuthUser | null>({ id: 1, email: 'test@example.com' }),
  isLoggedIn: computed(() => true),
  logout: vi.fn(),
  getToken: () => 'mock-token',
};

const defaultProviders = [
  provideHttpClient(),
  provideRouter([]),
  { provide: AuthService, useValue: mockAuthService },
];

// ---- テスト ----
describe('GadgetListComponent', () => {
  it('初期表示でAPIからガジェット一覧を取得して表示する', async () => {
    await render(GadgetListComponent, { providers: defaultProviders });

    // rxResource のローディングが完了してからテキストが現れるのを待つ
    expect(await screen.findByText('スマートウォッチ')).toBeInTheDocument();
    expect(screen.getByText('ワイヤレスイヤホン')).toBeInTheDocument();
    expect(screen.getByText('モバイルバッテリー')).toBeInTheDocument();
  });

  it('APIがエラーを返してもクラッシュせず、ガジェットが表示されない', async () => {
    server.use(
      http.get('http://localhost:3000/gadgets', () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 }),
      ),
    );

    await render(GadgetListComponent, { providers: defaultProviders });

    // エラー時はガジェット名が表示されない
    expect(screen.queryByText('スマートウォッチ')).not.toBeInTheDocument();
  });

  it('ログイン中のメールアドレスがヘッダーに表示される', async () => {
    await render(GadgetListComponent, { providers: defaultProviders });

    expect(await screen.findByText('test@example.com')).toBeInTheDocument();
  });

  it('モックデータと件数が一致する', async () => {
    await render(GadgetListComponent, { providers: defaultProviders });

    await screen.findByText('スマートウォッチ'); // 読み込み完了を待つ

    const cards = screen.getAllByRole('button', { name: '購入' });
    expect(cards).toHaveLength(mockGadgets.length);
  });
});
