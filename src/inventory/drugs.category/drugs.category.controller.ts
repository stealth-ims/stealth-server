import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Logger,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { DrugsCategoryService } from './drugs.category.service';
import { CreateDrugsCategoryDto, DrugsCategoryResponse, GetDrugsCategoryDto, UpdateDrugsCategoryDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { DrugsCategory } from './models/drugs.category.model';

@ApiTags("Drug Category")
@Controller('drugsCategories')
export class DrugsCategoryController {
  private readonly logger: Logger;
  constructor(private readonly drugsCategoryService: DrugsCategoryService) { 
    this.logger = new Logger(DrugsCategoryController.name);
  }

  @CustomApiResponse(["created", "forbidden", "unauthorized"], {type: DrugsCategoryResponse, message: "Drug category created successfully"})
  @Post()
  async create(@Body() createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return await this.drugsCategoryService.create(createDrugsCategoryDto);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: DrugsCategoryResponse, isArray: true, message: "Drug categories retrieved successfully" })
  @Get()
  async findAll(@Query('limit') limit: string) {
    return await this.drugsCategoryService.findAll(+limit);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized", "notfound"], {type: DrugsCategoryResponse, message: "Drug category retrieved successfully"})
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.drugsCategoryService.findOne(id);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: String, message: "Drug category updated successfully" })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugsCategoryDto: UpdateDrugsCategoryDto,
  ) {
    return this.drugsCategoryService.update(id, updateDrugsCategoryDto);
  }

  @CustomApiResponse(["accepted", "forbidden", 'unauthorized'], {type: String, message: "Drug category deleted successfully"})
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drugsCategoryService.remove(+id);
  }
}
