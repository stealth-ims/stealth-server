import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { ApiTags, PickType } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { CreateDrugDto, DrugAnalytics, DrugResponse, GetDrugDto, UpdateDrugDto } from './dto';

@ApiTags("Drugs")
@Controller('drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) { }

  @CustomApiResponse(["created", "forbidden", "unauthorized"], { type: DrugResponse, message: "Drug created successfully" })
  @Post()
  async create(@Body() createDrugDto: CreateDrugDto) {
    return await this.drugsService.create(createDrugDto);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: DrugResponse, isArray: true, message: "Drugs retrieved successfully" })
  @Get()
  async findAll(@Query() query: GetDrugDto) {
    return await this.drugsService.findAll(query);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: DrugAnalytics, message: "Drug analytics retrieved successfully" })
  @Get('/analytics')
  async analytics() {
    return await this.drugsService.getAnalytics();
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: DrugResponse, message: "Drug retrieved successfully" })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsService.findOne(id);
  }

  @CustomApiResponse(["patch", "forbidden", "unauthorized"], { type: String, message: "Drug updated successfully" })
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDrugDto: UpdateDrugDto) {
    return await this.drugsService.update(id, updateDrugDto);
  }

  @CustomApiResponse(["accepted", "forbidden", "unauthorized"], { type: PickType<DrugResponse, 'id'>, message: "Drug deleted successfully" })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsService.remove(+id);
  }
}
