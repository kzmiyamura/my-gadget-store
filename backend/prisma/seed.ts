import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.gadget.count();
  if (count > 0) {
    console.log('データが既に存在するためスキップします');
    return;
  }

  await prisma.gadget.createMany({
    data: [
      {
        name: 'スマートウォッチ',
        price: 29800,
        description: '健康管理とスマート通知機能を搭載した最新スマートウォッチ',
      },
      {
        name: 'ワイヤレスイヤホン',
        price: 15800,
        description: 'ノイズキャンセリング機能付き高音質ワイヤレスイヤホン',
      },
      {
        name: 'モバイルバッテリー',
        price: 4980,
        description: '大容量20000mAh、急速充電対応モバイルバッテリー',
      },
      {
        name: 'Bluetoothスピーカー',
        price: 8900,
        description: '防水仕様、360度サウンドのポータブルスピーカー',
      },
      {
        name: 'スマートフォンスタンド',
        price: 2480,
        description: '角度調整可能な折りたたみ式スマホスタンド',
      },
    ],
  });
  console.log('初期データを投入しました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
