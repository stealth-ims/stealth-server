import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateDrugDto, UpdateDrugDto } from './dto';

@ApiTags("Drugs")
@Controller('drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @Post()
  async create(@Body() createDrugDto: CreateDrugDto) {
    return this.drugsService.create(createDrugDto);
  }

  @Get()
  findAll() {
    return this.drugsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drugsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDrugDto: UpdateDrugDto) {
    return this.drugsService.update(+id, updateDrugDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drugsService.remove(+id);
  }
}
