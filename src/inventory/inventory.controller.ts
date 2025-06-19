import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Logger,
  ParseUUIDPipe,
  Query,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/core/shared/docs/decorators/default.response.decorators';
import { GetUser, Permission } from 'src/auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/core/shared/responses/success.response';
import { throwError } from 'src/core/shared/responses/error.response';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import {
  Features,
  PermissionLevel,
} from '../core/shared/enums/permissions.enum';
import { StockAdjustmentsService } from './inventory.service';
import {
  CreatedAdjustmentResponseDto,
  CreateStockAdjustmentDto,
  OneStockAdjustment,
  StockAdjustmentPaginationDto,
  UpdateStockAdjustmentDto,
} from './dto';

@ApiTags('Stock Adjustments')
@Controller('stock-adjustments')
export class StockAdjustmentsController {
  private readonly logger: Logger;
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {
    this.logger = new Logger(StockAdjustmentsController.name);
  }

  @CustomApiResponse(['created', 'authorize'], {
    type: CreatedAdjustmentResponseDto,
    message: 'Stock adjustment created successfully',
  })
  @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Body() dto: CreateStockAdjustmentDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const createdAdjustment = await this.stockAdjustmentsService.create(
        dto,
        user,
      );
      return new ApiSuccessResponseDto(
        createdAdjustment,
        HttpStatus.CREATED,
        'Stock adjustment created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: OneStockAdjustment,
    message: 'Stock adjustments retrieved successfully',
  })
  @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ)
  @Get()
  async findAll(
    @Query() dto: StockAdjustmentPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      dto.facilityId = dto.facilityId || user.facility;
      dto.departmentId = dto.departmentId || user.department;
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
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: OneStockAdjustment,
    message: 'Stock adjustment retrieved successfully',
  })
  @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ)
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
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: OneStockAdjustment,
    message: 'Stock adjustment edited successfully',
  })
  @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async editStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockAdjustmentDto,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      const _response = await this.stockAdjustmentsService.edit(
        id,
        dto,
        userId,
      );
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'stock adjustment edited successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  // @CustomApiResponse(['successNull', 'authorize'], {
  //   message: 'Stock adjustment updated successfully',
  // })
  // @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ_WRITE)
  // @Patch('/reject/:id')
  // async rejectAdjustment(@Param('id', ParseUUIDPipe) id: string) {
  //   try {
  //     await this.stockAdjustmentsService.update(
  //       id,
  //       StockAdjustmentStatus.REJECTED,
  //     );
  //     return new ApiSuccessResponseNoData(
  //       HttpStatus.OK,
  //       'Stock adjustment updated successfully',
  //     );
  //   } catch (error) {
  //     throwError(this.logger, error);
  //   }
  // }

  // @CustomApiResponse(['successNull', 'authorize'], {
  //   message: 'Stock adjustment updated successfully',
  // })
  // @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ_WRITE)
  // @Patch('/accept/:id')
  // async acceptAdjustment(@Param('id', ParseUUIDPipe) id: string) {
  //   try {
  //     await this.stockAdjustmentsService.update(
  //       id,
  //       StockAdjustmentStatus.ADJUSTED,
  //     );
  //     return new ApiSuccessResponseNoData(
  //       HttpStatus.OK,
  //       'Stock adjustment updated successfully',
  //     );
  //   } catch (error) {
  //     throwError(this.logger, error);
  //   }
  // }
  @CustomApiResponse(['successNull', 'authorize'], {
    message: 'Stock adjustment deleted successfully',
  })
  @Permission(Features.STOCK_ADJUSTMENT, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.stockAdjustmentsService.remove(id, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Stock adjustment deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
