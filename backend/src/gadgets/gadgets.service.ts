import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GadgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string) {
    return this.prisma.gadget.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { id: 'asc' },
    });
  }

  async updateGadget(
    id: number,
    data: { name?: string; price?: number; description?: string },
  ) {
    return this.prisma.gadget.update({ where: { id }, data });
  }

  async deleteGadget(id: number) {
    return this.prisma.gadget.delete({ where: { id } });
  }
}
