import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DrugsCategoryService } from './drugs.category.service';
import { CreateDrugsCategoryDto } from './dto/create-drugs.category.dto';
import { UpdateDrugsCategoryDto } from './dto/update-drugs.category.dto';

@Controller('drugs/category')
export class DrugsCategoryController {
  constructor(private readonly drugsCategoryService: DrugsCategoryService) { }

  @Post()
  create(@Body() createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return this.drugsCategoryService.create(createDrugsCategoryDto);
  }

  @Get()
  findAll() {
    return this.drugsCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drugsCategoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDrugsCategoryDto: UpdateDrugsCategoryDto,
  ) {
    return this.drugsCategoryService.update(+id, updateDrugsCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drugsCategoryService.remove(+id);
  }
}
