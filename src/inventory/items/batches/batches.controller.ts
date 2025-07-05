import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { CustomApiResponse } from '../../../core/shared/docs/decorators';
import {
  BatchesNoPaginate,
  BatchResponseDto,
  CreateBatchDto,
  FetchBatchesQueryDto,
  FetchStockLevelReportDataQueryDto,
  OneBatch,
  UpdateBatchDto,
} from './dto';
import { GetUser, Permission } from '../../../auth/decorator';
import {
  Features,
  PermissionLevel,
} from '../../../core/shared/enums/permissions.enum';
import { IUserPayload } from '../../../auth/interface/payload.interface';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../../../core/shared/responses/success.response';
import { throwError } from '../../../core/shared/responses/error.response';
import { BatchesExportsService } from './exports.service';
import { GetReportDataDto } from '../../../reports/dto';
import { ExportQueryDto } from '../../../exports/dto';

@ApiTags('Item-Batches')
@Controller('items')
export class BatchesController {
  private readonly logger: Logger;
  constructor(
    private readonly batchService: BatchService,
    private readonly batchesExportsService: BatchesExportsService,
  ) {
    this.logger = new Logger(BatchesController.name);
  }

  @CustomApiResponse(['created', 'authorize'], {
    type: OneBatch,
    message: 'Batch created successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Post('add-batch')
  async addBatch(@Body() dto: CreateBatchDto, @GetUser() user: IUserPayload) {
    try {
      dto.createdById = user.sub;
      dto.departmentId = user.department;
      dto.facilityId = user.facility;
      const createdItem = await this.batchService.create(dto);
      return new ApiSuccessResponseDto(
        createdItem,
        HttpStatus.CREATED,
        'Batch created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: BatchesNoPaginate,
    isArray: true,
    message: 'Batches retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('batches/:itemId/no-paginate')
  async retrieveBatchesNoPaginate(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @GetUser('department') departmentId: string,
  ) {
    try {
      const batches = await this.batchService.findAllNoPaginate(
        itemId,
        departmentId,
      );
      return new ApiSuccessResponseDto(
        batches,
        HttpStatus.OK,
        'Batches retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Batches by expiry exported successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('validity/export')
  async exportExpiryBatches(
    @Query() query: ExportQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.batchesExportsService.exportExpiredBatches(
        query,
        user,
      );

      return new StreamableFile(response.data, {
        type: response.meta.type,
        disposition: `attachment; filename="${response.meta.fileName}"`,
      });
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: BatchResponseDto,
    isArray: true,
    message: 'Batches retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get(':id/batches')
  async retrieveBatches(
    @Param('id', ParseUUIDPipe) itemId: string,
    @Query() query: FetchBatchesQueryDto,
    @GetUser('department') departmentId: string,
  ) {
    try {
      const batches = await this.batchService.fetchAllPaginate(
        itemId,
        query,
        departmentId,
      );
      const paginated = new PaginatedDataResponseDto(
        batches.rows,
        query.page || 1,
        query.pageSize || 10,
        batches.count,
      );
      return new ApiSuccessResponseDto(
        paginated,
        HttpStatus.OK,
        'Batches retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: BatchResponseDto,
    message: 'Batch retrieved successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ)
  @Get('batches/:id')
  async retrieveBatch(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const batches = await this.batchService.findOne(id, true);
      return new ApiSuccessResponseDto(
        batches,
        HttpStatus.OK,
        'Batches retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'batch updated successfully',
  })
  @Permission(Features.ITEMS, PermissionLevel.READ_WRITE)
  @Patch('edit-batch/:id')
  async updateBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateBatchDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      await this.batchService.update(id, updateItemDto, user);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Batch updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetReportDataDto,
    message: 'Stock level data retrieved successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get('report/stock-level')
  async findStockLevelData(
    @Query() query: FetchStockLevelReportDataQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const items = await this.batchService.fetchStockLevelData(query, user);
      return new ApiSuccessResponseDto(
        items,
        HttpStatus.OK,
        'Stock level data retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetReportDataDto,
    message: 'Expiry data retrieved successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get('report/expiry')
  async findExpiryData(@GetUser() user: IUserPayload) {
    try {
      const items = await this.batchService.fetchExpiryData(user);
      return new ApiSuccessResponseDto(
        items,
        HttpStatus.OK,
        'Expiry data retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
