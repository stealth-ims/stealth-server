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
import { col, FindOptions, fn, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { SaleItem } from 'src/sales/models/sale-items.model';
import { Item } from 'src/inventory/items/models';
import {
  getDateRangeFilter,
  getDateRangeFilterCompare,
} from 'src/core/shared/factory';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import { Op } from 'sequelize';
import { ItemCategory } from 'src/inventory/items-category/models/items-category.model';

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

  async findSellingItems(
    query: FindAnalyticsQueryDto,
    user: IUserPayload,
    direction: 'desc' | 'asc',
  ) {
    const { createdAt } = getDateRangeFilter(query.dateRange);
    const filter: FindOptions<SaleItem> = {
      where: {
        [Op.and]: [
          { createdAt },
          user.facility && { facilityId: user.facility },
          user.department && { departmentId: user.department },
        ],
      },
      attributes: [
        [fn('SUM', col('quantity')), 'quantity'],
        [col('item.name'), 'name'],
      ],
      include: { model: Item, attributes: [] },
      group: ['item.name', 'quantity'],
      order: [['quantity', direction]],
      limit: 10,
    };
    const items = await this.saleItemRepo.findAll(filter);
    const res = new ItemSalesAnalyticsDto();
    let sum = 0;
    items.map((i) => {
      res.items.names.push(i.dataValues.name);
      res.items.quantities.push(Number(i.dataValues.quantity));
      sum += i.dataValues.quantity;
    });
    res.average = sum / items.length;
    return res;
  }

  async getSalesTrend(query: FindAnalyticsQueryDto, user: IUserPayload) {
    const { createdAt, groupby } = getDateRangeFilter(query.dateRange);
    const filter: FindOptions<SaleItem> = {
      where: {
        [Op.and]: [
          { createdAt },
          user.facility && { facilityId: user.facility },
          user.department && { departmentId: user.department },
        ],
      },
      attributes: [
        [fn('SUM', col('quantity')), 'quantity'],
        [fn('DATE_TRUNC', groupby, col('created_at')), groupby],
      ],
      group: [groupby],
      order: [[groupby, 'asc']],
    };

    const sales = await this.saleItemRepo.findAll(filter);
    const res = new SalesTrendDto();

    sales.map((i) => {
      res.trend.dates.push(i.dataValues[groupby]);
      res.trend.quantities.push(Number(i.dataValues.quantity));
    });
    return res;
  }

  async findTopSellingItemCategories(
    query: FindAnalyticsQueryDto,
    user: IUserPayload,
  ) {
    const { createdAt } = getDateRangeFilter(query.dateRange);
    const filter: FindOptions<SaleItem> = {
      where: {
        [Op.and]: [
          { createdAt },
          user.facility && { facilityId: user.facility },
          user.department && { departmentId: user.department },
        ],
      },
      attributes: [
        [fn('SUM', col('quantity')), 'quantity'],
        [Sequelize.col('item.category.name'), 'name'],
      ],
      include: [
        {
          model: Item,
          attributes: [],
          include: [{ model: ItemCategory, attributes: [] }],
        },
      ],
      group: ['item.category.name', 'quantity'],
      order: [['quantity', 'desc']],
      limit: 10,
    };
    const cats = await this.saleItemRepo.findAll(filter);
    const res = new TopSellingCategoriesDto();

    cats.map((i) => {
      res.topSelling.categories.push(i.dataValues.name);
      res.topSelling.quantities.push(Number(i.dataValues.quantity));
    });
    return res;
  }

  async getDailySales(query: FindAnalyticsQueryDto, user: IUserPayload) {
    const { createdAt, bound, groupby } = getDateRangeFilterCompare(
      query.dateRange,
    );
    const filter: FindOptions<SaleItem> = {
      where: {
        [Op.and]: [
          { createdAt },
          user.facility && { facilityId: user.facility },
          user.department && { departmentId: user.department },
        ],
      },
      attributes: [
        [fn('SUM', col('quantity')), 'quantity'],
        [fn('DATE_TRUNC', groupby, col('created_at')), groupby],
      ],
      group: [groupby],
      order: [[groupby, 'asc']],
    };
    const sales = await this.saleItemRepo.findAll(filter);
    const res = new DailySalesDto();

    sales.map((s) => {
      const date = s.dataValues[groupby];
      if (date >= bound) {
        res.sales[1].dates.push(date);
        res.sales[1].quantities.push(Number(s.dataValues.quantity));
      } else {
        res.sales[0].dates.push(date);
        res.sales[0].quantities.push(Number(s.dataValues.quantity));
      }
    });
    return res;
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
