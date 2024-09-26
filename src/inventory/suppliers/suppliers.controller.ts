import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';

@ApiTags("Suppliers")
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @CustomApiResponse(["created", "forbidden", "unauthorized"], {type: CreateSupplierDto, message: "Supplier created successfully"})
  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.suppliersService.create(createSupplierDto);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: CreateSupplierDto, isArray: true, message: "Suppliers retrieved successfully" })
  @Get()
  async findAll() {
    return await this.suppliersService.findAll();
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized", "notfound"], {type: CreateSupplierDto, message: "Supplier retrieved successfully"})
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.suppliersService.findOne(id);
  }

  @CustomApiResponse(["patch", "forbidden", "unauthorized"], { type: String, message: "Supplier updated successfully" })
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return await this.suppliersService.update(id, updateSupplierDto);
  }

  @CustomApiResponse(["accepted", "forbidden", 'unauthorized'], {type: String, message: "Supplier deleted successfully"})
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.suppliersService.remove(id);
  }
}
