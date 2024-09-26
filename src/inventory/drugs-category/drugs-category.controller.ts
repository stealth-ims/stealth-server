import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DrugsCategoryService } from './drugs-category.service';
import { CreateDrugsCategoryDto, UpdateDrugsCategoryDto } from './dto';
import { ApiCreatedSuccessResponse, ApiSuccessResponse } from 'src/shared/docs/decorators/response.decorators';
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/utils/responses/error.response';
import { ApiSuccessResponseDto } from 'src/utils/responses/success.response';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { DrugsCategory } from './models/drugs-category.model';

@ApiTags("Drug Category")
@Controller('drugs/category')
export class DrugsCategoryController {
  constructor(private readonly drugsCategoryService: DrugsCategoryService) { }

  @CustomApiResponse(["created", "forbidden", "unauthorized"], { type: DrugsCategory, message: "Drug category created successfully" })
  @Post()
  async create(@Body() createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return await this.drugsCategoryService.create(createDrugsCategoryDto);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: DrugsCategory, isArray: true, message: "Drug categories retrieved successfully" })
  @Get()
  async findAll() {
    return await this.drugsCategoryService.findAll();
  }

  @ApiSuccessResponse({
    type: CreateDrugsCategoryDto,
    description: "Drug category retrieved successfully",
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: "validation error occured"
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drugsCategoryService.findOne(+id);
  }

  @ApiSuccessResponse({
    type: CreateDrugsCategoryDto,
    description: "Drug category updated successfully",
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: "validation error occured"
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDrugsCategoryDto: UpdateDrugsCategoryDto,
  ) {
    return this.drugsCategoryService.update(+id, updateDrugsCategoryDto);
  }

  @ApiSuccessResponse({
    type: CreateDrugsCategoryDto,
    description: "Drug category deleted successfully",
  })
  @ApiBadRequestResponse({
    type: ApiErrorResponse,
    description: "validation error occured"
  })
  @ApiInternalServerErrorResponse({
    type: ApiErrorResponse,
    description: 'An unexpected error occured',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drugsCategoryService.remove(+id);
  }
}
