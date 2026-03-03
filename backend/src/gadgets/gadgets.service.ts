import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GadgetsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.gadget.findMany({
      orderBy: { id: 'asc' },
    });
  }
}
