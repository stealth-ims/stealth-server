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
import { DrugsService } from './drugs.service';
import { ApiQuery, ApiTags, PickType } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  CreateDrugDto,
  DrugAnalytics,
  DrugPaginationDto,
  DrugResponse,
  UpdateDrugDto,
} from './dto';
import { GetQueries } from 'src/shared/docs/decorators/get-queries.decorator';

@ApiTags('Drugs')
@Controller('drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: DrugResponse,
    message: 'Drug created successfully',
  })
  @Post()
  async create(@Body() createDrugDto: CreateDrugDto) {
    return await this.drugsService.create(createDrugDto);
  }

  @CustomApiResponse(['filter', 'authorize'], {
    type: DrugResponse,
    isArray: true,
    message: 'Drugs retrieved successfully',
  })
  @ApiQuery({
    name: 'categories',
    example: 'laxatives',
    isArray: true,
    description: 'The category of the drug',
    required: false,
  })
  @ApiQuery({
    name: 'supplierId',
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'Id supplier of the drug',
    required: false,
  })
  @Get()
  async findAll(@GetQueries() query: DrugPaginationDto) {
    return await this.drugsService.findAll(query);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: DrugAnalytics,
    message: 'Drug analytics retrieved successfully',
  })
  @Get('/analytics')
  async analytics() {
    return await this.drugsService.getAnalytics();
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: DrugResponse,
    message: 'Drug retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsService.findOne(id);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: String,
    message: 'Drug updated successfully',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugDto: UpdateDrugDto,
  ) {
    return await this.drugsService.update(id, updateDrugDto);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: PickType<DrugResponse, 'id'>,
    message: 'Drug deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsService.remove(id);
  }
}
