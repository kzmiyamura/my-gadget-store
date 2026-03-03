import { Controller, Get } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Get()
  findAll() {
    return this.gadgetsService.findAll();
  }
}
