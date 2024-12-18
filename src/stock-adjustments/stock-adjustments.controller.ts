import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  ParseUUIDPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import {
  CreateStockAdjustmentDto,
  OneStockAdjustment,
  StockAdjustmentPaginationDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { GetUser, Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/interface/roles.enum';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { StockAdjustmentStatus } from './model';
import { IUserPayload } from 'src/auth/interface/payload.interface';

@ApiTags('Stock Adjustments')
@Controller('stock-adjustments')
export class StockAdjustmentsController {
  private readonly logger: Logger;
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {
    this.logger = new Logger(StockAdjustmentsController.name);
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: OneStockAdjustment,
    message: 'Stock adjustment created successfully',
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
  async create(
    @Body() dto: CreateStockAdjustmentDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      !dto.facilityId && (dto.facilityId = user.facility);
      !dto.departmentId && (dto.departmentId = user.department);
      dto.createdBy = user.stamp;
      const createdAdjustment = await this.stockAdjustmentsService.create(dto);
      return new ApiSuccessResponseDto(
        createdAdjustment,
        HttpStatus.CREATED,
        'Stock adjustment created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: OneStockAdjustment,
    message: 'Stock adjustments retrieved successfully',
  })
  @Get()
  async findAll(
    @Query() dto: StockAdjustmentPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      !dto.facilityId && (dto.facilityId = user.facility);
      !dto.departmentId && (dto.departmentId = user.department);
      const adjustments = await this.stockAdjustmentsService.findAll(dto);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          adjustments[0],
          dto.page || 1,
          dto.pageSize,
          adjustments[1],
        ),
        HttpStatus.OK,
        'Stock adjustments retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: OneStockAdjustment,
    message: 'Stock adjustment retrieved successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const adjustment = await this.stockAdjustmentsService.findOne(id);
      return new ApiSuccessResponseDto(
        adjustment,
        HttpStatus.OK,
        'Stock adjustment retrieved successfully',
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
  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Stock adjustment updated successfully',
  })
  @Patch('/reject/:id')
  async rejectAdjustment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.stockAdjustmentsService.update(
        id,
        StockAdjustmentStatus.REJECTED,
      );
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Stock adjustment updated successfully',
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
  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Stock adjustment updated successfully',
  })
  @Patch('/accept/:id')
  async acceptAdjustment(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.stockAdjustmentsService.update(
        id,
        StockAdjustmentStatus.ADJUSTED,
      );
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Stock adjustment updated successfully',
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
  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Stock adjustment deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.stockAdjustmentsService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Stock adjustment deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
