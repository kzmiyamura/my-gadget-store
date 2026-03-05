import { http, HttpResponse } from 'msw';

export const mockGadgets = [
  { id: 1, name: 'スマートウォッチ', price: 29800, description: '健康管理とスマート通知機能を搭載' },
  { id: 2, name: 'ワイヤレスイヤホン', price: 15800, description: 'ノイズキャンセリング機能付き' },
  { id: 3, name: 'モバイルバッテリー', price: 4980, description: '大容量20000mAh' },
];

export const handlers = [
  http.get('http://localhost:3000/gadgets', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';

    const results = q
      ? mockGadgets.filter(
          (g) =>
            g.name.includes(q) || g.description.includes(q),
        )
      : mockGadgets;

    return HttpResponse.json(results);
  }),

  http.patch('http://localhost:3000/gadgets/:id', async ({ request, params }) => {
    const id = Number(params['id']);
    const body = await request.json() as Partial<(typeof mockGadgets)[0]>;
    const gadget = mockGadgets.find((g) => g.id === id);
    if (!gadget) return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
    return HttpResponse.json({ ...gadget, ...body });
  }),
];
