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
  HttpStatus,
} from '@nestjs/common';
import { DrugsCategoryService } from './drugs-category.service';
import {
  CreateDrugsCategoryDto,
  DrugsCategoryResponse,
  UpdateDrugsCategoryDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/interface/roles.enum';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';

@ApiTags('Drug Category')
@Controller('drug-categories')
export class DrugsCategoryController {
  private readonly logger: Logger;
  constructor(private readonly drugsCategoryService: DrugsCategoryService) {
    this.logger = new Logger(DrugsCategoryController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
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
    try {
      const createdCategory = await this.drugsCategoryService.create(
        createDrugsCategoryDto,
      );
      return new ApiSuccessResponseDto(
        createdCategory,
        HttpStatus.CREATED,
        'Drug category created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: DrugsCategoryResponse,
    message: 'Drug categories retrieved successfully',
  })
  @Get()
  async findAll(@Query() query?: PaginationRequestDto) {
    try {
      const categories = await this.drugsCategoryService.findAll(query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          categories[0],
          query.page || 1,
          query.pageSize,
          categories[1],
        ),
        HttpStatus.FOUND,
        'Drug categories retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: DrugsCategoryResponse,
    message: 'Drug category retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const category = await this.drugsCategoryService.findOne(id);
      return new ApiSuccessResponseDto(
        category,
        HttpStatus.FOUND,
        'Drug retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @Roles(
    Role.HospitalAdmin,
    Role.NationalAdmin,
    Role.RegionalAdmin,
    Role.HospitalSCM,
    Role.NationalSCM,
    Role.RegionalSCM,
  )
  @CustomApiResponse(['success', 'authorize'], {
    type: null,
    message: 'Drug category updated successfully',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugsCategoryDto: UpdateDrugsCategoryDto,
  ) {
    try {
      await this.drugsCategoryService.update(id, updateDrugsCategoryDto);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @Roles(
    Role.HospitalAdmin,
    Role.NationalAdmin,
    Role.RegionalAdmin,
    Role.HospitalSCM,
    Role.NationalSCM,
    Role.RegionalSCM,
  )
  @CustomApiResponse(['success', 'authorize'], {
    type: null,
    message: 'Drug category deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.drugsCategoryService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
