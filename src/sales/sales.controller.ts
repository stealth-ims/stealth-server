import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto, UpdateSalesDto } from './dto/create.dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators';
import { GetSalesDto } from './dto/get.dto';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @CustomApiResponse(['authorize', 'success'], {
    type: CreateSaleDto,
    message: 'Sales created successfully',
  })
  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @CustomApiResponse(['authorize', 'success'], {
    type: GetSalesDto,
    message: 'Sales retrieved successfully',
  })
  @Get()
  getSales() {
    return this.salesService.fetchAll();
  }

  @CustomApiResponse(['authorize', 'successNull'], {
    message: 'Sale updated  successfully',
  })
  @Patch('/:id')
  updateSale(@Body() dto: UpdateSalesDto, @Param('id') id: string) {
    this.salesService.update(id, dto);
  }

  @CustomApiResponse(['authorize', 'success'], {
    type: GetSalesDto,
    message: 'Sale fetched successfully',
  })
  @Get('/:id')
  getSale(@Param('id') id: string) {
    this.salesService.fetchOne(id);
  }
}
