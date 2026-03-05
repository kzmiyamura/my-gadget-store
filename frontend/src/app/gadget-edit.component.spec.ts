import { render, screen, fireEvent } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { GadgetEditComponent } from './gadget-edit.component';
import { mockGadgets, handlers } from '../mocks/handlers';

// ---- MSW サーバー ----
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const defaultGadget = mockGadgets[0]; // { id: 1, name: 'スマートウォッチ', ... }

describe('GadgetEditComponent', () => {
  it('不正な値でボタンが disabled になること', async () => {
    await render(GadgetEditComponent, {
      providers: [provideHttpClient()],
      inputs: { gadget: defaultGadget },
    });

    // effect が実行されてフォームが更新されるのを待つ
    const nameInput = await screen.findByDisplayValue(defaultGadget.name);

    // 3文字未満の名前を入力 → required + minLength(3) 違反
    fireEvent.input(nameInput, { target: { value: 'ab' } });
    fireEvent.blur(nameInput);

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
  });

  it('削除ボタンをクリックすると DELETE API が呼ばれること', async () => {
    let deleteCalled = false;

    server.use(
      http.delete(`http://localhost:3000/gadgets/${defaultGadget.id}`, () => {
        deleteCalled = true;
        return HttpResponse.json(defaultGadget);
      }),
    );

    await render(GadgetEditComponent, {
      providers: [provideHttpClient()],
      inputs: { gadget: defaultGadget },
    });

    await screen.findByDisplayValue(defaultGadget.name);
    fireEvent.click(screen.getByRole('button', { name: '削除' }));

    await vi.waitFor(() => expect(deleteCalled).toBe(true));
  });

  it('正常な値で API が呼ばれること', async () => {
    let patchCalled = false;

    server.use(
      http.patch(`http://localhost:3000/gadgets/${defaultGadget.id}`, async ({ request }) => {
        patchCalled = true;
        const body = await request.json();
        return HttpResponse.json({ ...defaultGadget, ...(body as object) });
      }),
    );

    await render(GadgetEditComponent, {
      providers: [provideHttpClient()],
      inputs: { gadget: defaultGadget },
    });

    // effect が実行されてフォームが有効な状態になるのを待つ
    await screen.findByDisplayValue(defaultGadget.name);

    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    await vi.waitFor(() => expect(patchCalled).toBe(true));
  });
});
