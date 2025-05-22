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

@ApiTags('Sales')
@Controller('sales')
export class SalesController {
  private logger = new Logger(SalesController.name);

  constructor(private readonly salesService: SalesService) {}

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

  @CustomApiResponse(['authorize', 'successNull', 'notfound'], {
    message: 'Sale updated successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE)
  @Patch('/:id')
  async updateSale(@Body() dto: UpdateSalesDto, @Param('id') id: string) {
    try {
      await this.salesService.update(id, dto);
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
  async deleteSale(@Param('id') id: string) {
    try {
      await this.salesService.removeOne(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Sale deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
