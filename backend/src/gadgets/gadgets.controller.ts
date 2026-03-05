import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.gadgetsService.findAll(q);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; price?: number; description?: string },
  ) {
    return this.gadgetsService.updateGadget(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gadgetsService.deleteGadget(id);
  }
}
