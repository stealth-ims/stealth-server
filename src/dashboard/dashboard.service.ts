import { Injectable } from '@nestjs/common';
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

@Injectable()
export class DashboardService {
  constructor() {}
  async findAll(_query: FindGeneralAnalyticsQueryDto) {
    const analytics = new GeneralAnalyticsDto();
    // analytics.totalItemsSold=
    return analytics;
  }

  async findTopSellingItems(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new ItemSalesAnalyticsDto();
  }

  async findLeastSellingItems(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new ItemSalesAnalyticsDto();
  }

  async getSalesTrend(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new SalesTrendDto();
  }

  async findTopSellingItemCategories(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new TopSellingCategoriesDto();
  }

  async getDailySales(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new DailySalesDto();
  }

  async getSalesPaymentMethods(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new SalesPaymentMethodDto();
  }

  async findOne(id: string) {
    return `This action returns a #${id} dashboard`;
  }

  private computeItemStockLevel(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeTotalItemsSold(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeTotalTransactions(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeInventoryTurnoverRate(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeTotalRevenue(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeAverageItemsPerTransaction(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeTotalCustomers(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeExpiringSoonItems(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }

  private computeTotalItemsReturned(startDate: Date, endDate: Date) {
    return `${startDate.toISOString()} ${endDate.toISOString()}`;
  }
}
