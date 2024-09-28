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
} from '@nestjs/common';
import { DrugsCategoryService } from './drugs-category.service';
import {
  CreateDrugsCategoryDto,
  DrugsCategoryResponse,
  UpdateDrugsCategoryDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { GetQueries } from 'src/shared/docs/decorators/get-queries.decorator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';

@ApiTags('Drug Category')
@Controller('drugsCategories')
export class DrugsCategoryController {
  private readonly logger: Logger;
  constructor(private readonly drugsCategoryService: DrugsCategoryService) {
    this.logger = new Logger(DrugsCategoryController.name);
  }

  @CustomApiResponse(['success', 'unauthorized'], {
    type: DrugsCategoryResponse,
    message: 'Drug category created successfully',
  })
  @Post()
  async create(@Body() createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return await this.drugsCategoryService.create(createDrugsCategoryDto);
  }

  @CustomApiResponse(['filter', 'unauthorized'], {
    type: DrugsCategoryResponse,
    message: 'Drug categories retrieved successfully',
  })
  @Get()
  async findAll(@GetQueries() query: PaginationRequestDto) {
    return await this.drugsCategoryService.findAll(query);
  }

  @CustomApiResponse(['success', 'unauthorized', 'notfound'], {
    type: DrugsCategoryResponse,
    message: 'Drug category retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsCategoryService.findOne(id);
  }

  @CustomApiResponse(['success', 'unauthorized'], {
    type: String,
    message: 'Drug category updated successfully',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugsCategoryDto: UpdateDrugsCategoryDto,
  ) {
    return await this.drugsCategoryService.update(id, updateDrugsCategoryDto);
  }

  @CustomApiResponse(['success', 'unauthorized'], {
    type: String,
    message: 'Drug category deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsCategoryService.remove(id);
  }
}
