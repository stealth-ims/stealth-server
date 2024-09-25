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
import { CreateDrugsCategoryDto, UpdateDrugsCategoryDto } from './dto';
import { ApiCreatedSuccessResponse } from 'src/shared/docs/decorators/response.decorators';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';

@ApiTags("Drug Category")
@Controller('drugs/category')
export class DrugsCategoryController {
  constructor(private readonly drugsCategoryService: DrugsCategoryService) { }

  @ApiCreatedSuccessResponse({
    type: CreateDrugsCategoryDto,
    description: "Drug category added successfully"
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: "validation error occured"
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @Post()
  async create(@Body() createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return  await this.drugsCategoryService.create(createDrugsCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.drugsCategoryService.findAll();
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
