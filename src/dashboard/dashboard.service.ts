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
import { FindOptions, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { SaleItem } from 'src/sales/models/sale-items.model';
import { Item } from 'src/inventory/items/models';
import { getDateRangeFilter } from 'src/core/shared/factory';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import { Op } from 'sequelize';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(SaleItem)
    private saleItemRepo: typeof SaleItem,
  ) {}
  async findAll(_query: FindGeneralAnalyticsQueryDto) {
    const analytics = new GeneralAnalyticsDto();
    // analytics.totalItemsSold=
    return analytics;
  }

  async findTopSellingItems(query: FindAnalyticsQueryDto) {
    const _response = query;
    return new ItemSalesAnalyticsDto();
  }

  async findLeastSellingItems(
    query: FindAnalyticsQueryDto,
    user: IUserPayload,
  ) {
    const { createdAt } = getDateRangeFilter(query.dateRange);
    const filter: FindOptions<SaleItem> = {
      where: {
        [Op.and]: [
          { createdAt },
          [user.facility && { facilityId: user.facility }],
          [user.department && { departmentId: user.department }],
        ],
      },
      attributes: ['quantity', [Sequelize.col('item.brand_name'), 'name']],
      include: { model: Item, attributes: [] },
      group: ['item_id', 'item.brand_name', 'quantity'],
      order: [['quantity', 'asc']],
      limit: 10,
    };
    const items = await this.saleItemRepo.findAll(filter);
    const res = new ItemSalesAnalyticsDto();
    let sum = 0;
    items.map((i) => {
      res.items.names.push(i.dataValues.name);
      res.items.quantities.push(i.dataValues.quantity);
      sum += i.dataValues.quantity;
    });
    res.average = sum / items.length;
    return res;
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
