import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { CreateSupplierDto, SupplierResponse, UpdateSupplierDto } from './dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { GetQueries } from 'src/shared/docs/decorators/get-queries.decorator';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: SupplierResponse,
    message: 'Supplier created successfully',
  })
  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.suppliersService.create(createSupplierDto);
  }

  @CustomApiResponse(['filter', 'authorize'], {
    type: SupplierResponse,
    isArray: true,
    message: 'Suppliers retrieved successfully',
  })
  @Get()
  async findAll(@GetQueries() query: PaginationRequestDto) {
    return await this.suppliersService.findAll(query);
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: SupplierResponse,
    message: 'Supplier retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.suppliersService.findOne(id);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: String,
    message: 'Supplier updated successfully',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return await this.suppliersService.update(id, updateSupplierDto);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: String,
    message: 'Supplier deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.suppliersService.remove(id);
  }
}
