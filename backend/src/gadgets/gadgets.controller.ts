import { Controller, Get, Query } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.gadgetsService.findAll(q);
  }
}
