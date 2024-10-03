import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';

@Controller('stock-adjustments')
export class StockAdjustmentsController {
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  @Post()
  create(@Body() createStockAdjustmentDto: CreateStockAdjustmentDto) {
    return this.stockAdjustmentsService.create(createStockAdjustmentDto);
  }

  @Get()
  findAll() {
    return this.stockAdjustmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockAdjustmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockAdjustmentDto: UpdateStockAdjustmentDto,
  ) {
    return this.stockAdjustmentsService.update(+id, updateStockAdjustmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockAdjustmentsService.remove(+id);
  }
}
