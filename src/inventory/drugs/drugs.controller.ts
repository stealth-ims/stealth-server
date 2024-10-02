import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  CreateDrugDto,
  DrugAnalytics,
  DrugPaginationDto,
  DrugResponse,
  UpdateDrugDto,
} from './dto';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/interface/roles.enum';

@ApiTags('Drugs')
@Controller('drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: DrugResponse,
    message: 'Drug created successfully',
  })
  @Roles(
    Role.NationalAdmin,
    Role.NationalSCM,
    Role.RegionalAdmin,
    Role.RegionalSCM,
    Role.HospitalAdmin,
    Role.HospitalSCM,
  )
  @Post()
  async create(@Body() createDrugDto: CreateDrugDto) {
    return await this.drugsService.create(createDrugDto);
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: DrugResponse,
    isArray: true,
    message: 'Drugs retrieved successfully',
  })
  @Get()
  async findAll(@Query() query: DrugPaginationDto) {
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

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
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
  @Roles(
    Role.NationalAdmin,
    Role.NationalSCM,
    Role.RegionalAdmin,
    Role.RegionalSCM,
    Role.HospitalAdmin,
    Role.HospitalSCM,
  )
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugDto: UpdateDrugDto,
  ) {
    return await this.drugsService.update(id, updateDrugDto);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: String,
    message: 'Drug deleted successfully',
  })
  @Roles(
    Role.NationalAdmin,
    Role.NationalSCM,
    Role.RegionalAdmin,
    Role.RegionalSCM,
    Role.HospitalAdmin,
    Role.HospitalSCM,
  )
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.drugsService.remove(id);
  }
}
