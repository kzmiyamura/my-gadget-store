import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { GadgetsService } from './gadgets.service';

@Controller('gadgets')
export class GadgetsController {
  constructor(private readonly gadgetsService: GadgetsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.gadgetsService.findAll(q);
  }

  @Post()
  create(@Body() body: { name: string; price: number; description: string }) {
    return this.gadgetsService.create(body);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gadgetsService.findOne(id);
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
