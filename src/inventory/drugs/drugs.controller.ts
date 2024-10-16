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
  HttpStatus,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import {
  AdjustPriceDto,
  CreateDrugDto,
  DrugAnalytics,
  DrugPaginationDto,
  ManyDrugs,
  OneDrug,
  UpdateDrugDto,
} from './dto';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/interface/roles.enum';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { BatchService } from './batch.service';

@ApiTags('Drugs')
@Controller('drugs')
export class DrugsController {
  private readonly logger: Logger;
  constructor(
    private readonly drugsService: DrugsService,
    private readonly batchService: BatchService,
  ) {
    this.logger = new Logger(DrugsController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: OneDrug,
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
    try {
      const createdDrug = await this.drugsService.create(createDrugDto);
      return new ApiSuccessResponseDto(
        createdDrug,
        HttpStatus.CREATED,
        'Drug category created successfully',
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        try {
          const id = JSON.parse(error.message).id;
          this.logger.log(`Drug already existed. ID: ${id}`);
          await this.batchService.create({
            ...createDrugDto,
            drugId: id,
          });
          const drug = await this.drugsService.findOne(id);
          return new ApiSuccessResponseDto(
            drug,
            HttpStatus.CREATED,
            'Drug already existed. New batch created successfully',
          );
        } catch (error) {
          throw throwError(this.logger, error);
        }
      }
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: ManyDrugs,
    isArray: true,
    message: 'Drugs retrieved successfully',
  })
  @Get()
  async findAll(@Query() query: DrugPaginationDto) {
    try {
      const drugs = await this.drugsService.findAll(query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          drugs[0],
          query.page || 1,
          query.pageSize,
          drugs[1],
        ),
        HttpStatus.FOUND,
        'Drugs retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
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
    type: OneDrug,
    message: 'Drug retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const drug = await this.drugsService.findOne(id);
      return new ApiSuccessResponseDto(
        drug,
        HttpStatus.FOUND,
        'Drug retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
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
    try {
      await this.drugsService.update(id, updateDrugDto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Drug updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: String,
    message: 'Drug prices adjusted successfully',
  })
  @Roles(
    Role.NationalAdmin,
    Role.NationalSCM,
    Role.RegionalAdmin,
    Role.RegionalSCM,
    Role.HospitalAdmin,
    Role.HospitalSCM,
  )
  @Patch('/adjust-prices/:id')
  async adjustPrice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdjustPriceDto,
  ) {
    try {
      await this.drugsService.update(id, dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Drug prices adjusted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
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
    try {
      await this.drugsService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
