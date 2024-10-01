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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { GetQueries } from 'src/shared/docs/decorators/get-queries.decorator';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { Authorize, Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/interface/roles.enum';

@Authorize()
@ApiBearerAuth('access-token')
@ApiTags('Drug Category')
@Controller('drugsCategories')
export class DrugsCategoryController {
  private readonly logger: Logger;
  constructor(private readonly drugsCategoryService: DrugsCategoryService) {
    this.logger = new Logger(DrugsCategoryController.name);
  }

  @CustomApiResponse(['created', 'unauthorized', 'forbidden'], {
    type: DrugsCategoryResponse,
    message: 'Drug category created successfully',
  })
  @Roles(
    Role.HospitalAdmin,
    Role.NationalAdmin,
    Role.RegionalAdmin,
    Role.HospitalSCM,
    Role.NationalSCM,
    Role.RegionalSCM,
  )
  @Post()
  async create(@Body() createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return await this.drugsCategoryService.create(createDrugsCategoryDto);
  }

  @CustomApiResponse(['paginated', 'unauthorized', 'forbidden'], {
    type: DrugsCategoryResponse,
    message: 'Drug categories retrieved successfully',
  })
  @Get()
  async findAll(@GetQueries() query?: PaginationRequestDto) {
    return await this.drugsCategoryService.findAll(query);
  }

  @CustomApiResponse(['accepted', 'unauthorized', 'forbidden', 'notfound'], {
    type: DrugsCategoryResponse,
    message: 'Drug category retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsCategoryService.findOne(id);
  }

  @Roles(
    Role.HospitalAdmin,
    Role.NationalAdmin,
    Role.RegionalAdmin,
    Role.HospitalSCM,
    Role.NationalSCM,
    Role.RegionalSCM,
  )
  @CustomApiResponse(['patch', 'unauthorized', 'forbidden'], {
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

  @Roles(
    Role.HospitalAdmin,
    Role.NationalAdmin,
    Role.RegionalAdmin,
    Role.HospitalSCM,
    Role.NationalSCM,
    Role.RegionalSCM,
  )
  @CustomApiResponse(['accepted', 'unauthorized', 'forbidden'], {
    type: String,
    message: 'Drug category deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsCategoryService.remove(id);
  }
}
