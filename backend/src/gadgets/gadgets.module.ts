import { Module } from '@nestjs/common';
import { GadgetsController } from './gadgets.controller';
import { GadgetsService } from './gadgets.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GadgetsController],
  providers: [GadgetsService, PrismaService],
})
export class GadgetsModule {}
