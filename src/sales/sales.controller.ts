import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  StreamableFile,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import {
  GetSalesDto,
  CreateSaleDto,
  UpdateSalesDto,
  GetSalesPaginationDto,
  FindItemDto,
  CreateSaleResponseDto,
  GetSaleDto,
  GetSalesItemsDto,
  FetchSalesReportDataQueryDto,
  FetchTopSellingReportDataQueryDto,
  ExportSalesQueryDto,
  SalesReportResponseDto,
  ExportPeriodicSalesQueryDto,
} from './dto/';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/core/shared/docs/decorators';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/core/shared/responses/success.response';
import { throwError } from 'src/core/shared/responses/error.response';
import { GetUser, Permission } from '../auth/decorator';
import { IUserPayload } from '../auth/interface/payload.interface';
import {
  Features,
  PermissionLevel,
} from '../core/shared/enums/permissions.enum';
import { GetReportDataDto } from '../reports/dto';
import { SalesExportsService } from './exports.service';

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  private logger = new Logger(SalesController.name);

  constructor(
    private readonly salesService: SalesService,
    private readonly salesExportsService: SalesExportsService,
  ) {}

  @CustomApiResponse(['authorize', 'paginated'], {
    type: GetSalesItemsDto,
    message: 'Items retrieved successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ)
  @Get('/items')
  async getItems(@Query() query: FindItemDto, @GetUser() user: IUserPayload) {
    try {
      const response = await this.salesService.fetchItems(query, user);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto<object[]>(
          response.rows,
          query.page || 1,
          query.pageSize,
          response.count,
        ),
        HttpStatus.OK,
        'Items retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'created'], {
    type: CreateSaleResponseDto,
    message: 'Sales created successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.salesService.create(createSaleDto, user);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.CREATED,
        'sale created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'paginated'], {
    type: GetSalesDto,
    message: 'Sales retrieved successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ)
  @Get()
  async getSales(
    @Query() query: GetSalesPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.salesService.fetchAll(query, user);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Sales retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Sales exported successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get('export')
  async exportAudits(
    @Query() query: ExportSalesQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.salesExportsService.exportSales(query, user);
      return new StreamableFile(response.data, {
        type: response.meta.type,
        disposition: `attachment; filename="${response.meta.fileName}"`,
      });
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'success'], {
    type: SalesReportResponseDto,
    message: 'Periodic sales data retrieved successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get('report/periodic-sales')
  async getPeriodicSales(
    @Query() query: FetchSalesReportDataQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.salesService.fetchPeriodicSales(query, user);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Periodic sales data retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Periodic Sales report exported successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get('export/periodic-sales')
  async exportPeriodicSales(
    @Query() query: ExportPeriodicSalesQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.salesExportsService.exportPeriodicSalesReport(
        query,
        user,
      );
      return new StreamableFile(response.data, {
        type: response.meta.type,
        disposition: `attachment; filename="${query.fileName ?? response.meta.fileName}"`,
      });
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'success'], {
    type: GetReportDataDto,
    message: 'Top selling items data retrieved successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get('report/top-selling')
  async getTopSellingItemsData(
    @Query() query: FetchTopSellingReportDataQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.salesService.fetchTopSellingItemsData(
        query,
        user,
      );
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Top selling items data retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'successNull', 'notfound'], {
    message: 'Sale updated successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE)
  @Patch('/:id')
  async updateSale(
    @Body() dto: UpdateSalesDto,
    @Param('id') id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.salesService.update(id, dto, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Sale updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'success', 'notfound'], {
    type: GetSaleDto,
    message: 'Sale fetched successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ)
  @Get('/:id')
  async getSale(@Param('id') id: string) {
    try {
      const response = await this.salesService.fetchOne(id);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Sale retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'successNull', 'notfound'], {
    message: 'Sale deleted successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE_DELETE)
  @Delete('/:id')
  async deleteSale(
    @Param('id') id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      await this.salesService.removeOne(id, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Sale deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
