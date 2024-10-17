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
import { CreateStockAdjustmentDto, StockAdjustmentPaginationDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators/default.response.decorators';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/auth/interface/roles.enum';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { StockAdjustmentStatus } from './model';

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
    type: CreateStockAdjustmentDto,
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
  async create(@Body() createStockAdjustmentDto: CreateStockAdjustmentDto) {
    try {
      const createdAdjustment = await this.stockAdjustmentsService.create(
        createStockAdjustmentDto,
      );
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
    type: CreateStockAdjustmentDto,
    message: 'Stock adjustments retrieved successfully',
  })
  @Get()
  async findAll(@Query() query?: StockAdjustmentPaginationDto) {
    try {
      const adjustments = await this.stockAdjustmentsService.findAll(query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          adjustments[0],
          query.page || 1,
          query.pageSize,
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
    type: CreateStockAdjustmentDto,
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
    type: null,
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
    type: null,
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
    type: null,
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
