import { Controller, Get, HttpStatus, Logger, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import {
  DailySalesDto,
  FindAnalyticsQueryDto,
  FindGeneralAnalyticsQueryDto,
  GeneralAnalyticsDto,
  ItemSalesAnalyticsDto,
  SalesPaymentMethodDto,
  SalesTrendDto,
  TopSellingCategoriesDto,
} from './dto';
import { throwError } from '../core/shared/responses/error.response';
import { ApiSuccessResponseDto } from '../core/shared/responses/success.response';

@Controller('dashboard')
export class DashboardController {
  private logger = new Logger(DashboardController.name);
  constructor(private readonly dashboardService: DashboardService) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: GeneralAnalyticsDto,
    message: 'general analytics sent successfully',
  })
  @Get('general')
  async findAll(@Query() query: FindGeneralAnalyticsQueryDto) {
    try {
      const response = await this.dashboardService.findAll(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'general analytics sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemSalesAnalyticsDto,
    message: 'top selling items sent successfully',
  })
  @Get('items/top-selling')
  async findTopSellingItems(@Query() query: FindAnalyticsQueryDto) {
    try {
      const response = await this.dashboardService.findTopSellingItems(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'top selling items sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: ItemSalesAnalyticsDto,
    message: 'least selling items sent successfully',
  })
  @Get('items/least-selling')
  async findLeastSellingItems(@Query() query: FindAnalyticsQueryDto) {
    try {
      const response = await this.dashboardService.findLeastSellingItems(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'least selling items sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: SalesTrendDto,
    message: 'sales trend sent successfully',
  })
  @Get('sales/trend')
  async getSalesTrend(@Query() query: FindAnalyticsQueryDto) {
    try {
      const response = await this.dashboardService.getSalesTrend(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'sales trend sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: TopSellingCategoriesDto,
    message: 'top selling item categories sent successfully',
  })
  @Get('item-categories/top-selling')
  async findTopSellingItemCategories(@Query() query: FindAnalyticsQueryDto) {
    try {
      const response =
        await this.dashboardService.findTopSellingItemCategories(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'top selling item categories sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: DailySalesDto,
    message: 'sales trend sent successfully',
  })
  @Get('sales/daily')
  async getDailySales(@Query() query: FindAnalyticsQueryDto) {
    try {
      const response = await this.dashboardService.getDailySales(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'daily sales sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: SalesPaymentMethodDto,
    message: 'sales payment methods sent successfully',
  })
  @Get('sales/payment-methods')
  async getSalesPaymentMethods(@Query() query: FindAnalyticsQueryDto) {
    try {
      const response =
        await this.dashboardService.getSalesPaymentMethods(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'sales payment methods sent successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
