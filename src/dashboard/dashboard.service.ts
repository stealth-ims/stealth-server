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
import { Sequelize } from 'sequelize-typescript';
import { WhereOptions } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Batch } from 'src/inventory/items/models';
import {
  getDateRangeFilter,
  getDateRangeFilterCompare,
} from 'src/core/shared/factory';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import { Op } from 'sequelize';
import { Sale } from 'src/sales/models/sales.model';
import { addYears } from 'date-fns';
import sequelize from 'sequelize';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Sale)
    private salesRepo: typeof Sale,
    @InjectModel(Batch)
    private batchRepo: typeof Batch,
    private sql: Sequelize,
  ) {}
  async findAll(_query: FindGeneralAnalyticsQueryDto, _user: IUserPayload) {
    const soonToExpireWhere: WhereOptions<Batch> = {
      validity: { [Op.lte]: addYears(new Date(), 1) },
    };
    const analytics = new GeneralAnalyticsDto();
    const customers = await this.salesRepo.count({
      col: 'patient_id',
      distinct: true,
    });
    const revenue = await this.salesRepo.aggregate('total', 'SUM');
    const transactions = await this.salesRepo.count({ col: 'id' });
    const soonToExpire = await this.batchRepo.count({
      col: 'item_id',
      distinct: true,
      where: soonToExpireWhere,
    });
    analytics.customers.total = customers;
    analytics.totalRevenue.total = revenue as number;
    analytics.totalTransactions.total = transactions;
    analytics.soonToExpireItems.total = soonToExpire;
    // analytics.totalItemsSold=
    return analytics;
  }

  async findSellingItems(
    query: FindAnalyticsQueryDto,
    user: IUserPayload,
    direction: 'desc' | 'asc',
  ) {
    const { createdAt } = getDateRangeFilter(query.dateRange);
    const {
      result: { names, quantities, avg },
    }: any = await this.sql.query(
      `WITH filtered_sales AS (
    SELECT
        i.name as name,
        sum(si.quantity) as total_quantity
    FROM sale_items si
    JOIN items i ON i.id = si.item_id
		${this.applyWhere(createdAt, user)}
		    GROUP BY i.id, i.name
    ORDER BY total_quantity ${direction}
    LIMIT 5
		)
		SELECT jsonb_build_object(
    'names', jsonb_agg(name),
    'quantities', jsonb_agg(total_quantity),
		'avg', avg(total_quantity)
		) as result
		FROM filtered_sales;`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );

    return new ItemSalesAnalyticsDto(names, quantities, avg);
  }

  async getSalesTrend(query: FindAnalyticsQueryDto, user: IUserPayload) {
    const { createdAt, groupby } = getDateRangeFilter(query.dateRange);
    const {
      result: { dates, quantities },
    }: any = await this.sql.query(
      `WITH filtered_sales AS (
    SELECT
        DATE_TRUNC('${groupby}', created_at) as ${groupby},
        sum(si.quantity) as total_quantity
    FROM sale_items si
		${this.applyWhere(createdAt, user)}
		GROUP BY ${groupby}
    ORDER BY ${groupby} asc
    LIMIT 5
		)
		SELECT jsonb_build_object(
    'dates', jsonb_agg(${groupby}),
    'quantities', jsonb_agg(total_quantity)
		) as result
		FROM filtered_sales;`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );

    return new SalesTrendDto(dates, quantities);
  }

  async findTopSellingItemCategories(
    query: FindAnalyticsQueryDto,
    user: IUserPayload,
  ) {
    const { createdAt } = getDateRangeFilter(query.dateRange);

    const {
      result: { categories, quantities },
    }: any = await this.sql.query(
      `WITH category_sales AS (
    SELECT
        ic.name as category,
        sum(si.quantity) as total_quantity
    FROM sale_items si
    JOIN items i ON i.id = si.item_id
    JOIN item_categories ic ON ic.id = i.category_id
		${this.applyWhere(createdAt, user)}
		    GROUP BY ic.id, ic.name
    ORDER BY total_quantity DESC
    LIMIT 5
		)
		SELECT jsonb_build_object(
    'categories', jsonb_agg(category),
    'quantities', jsonb_agg(total_quantity)
		) as result
		FROM category_sales;`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );
    return new TopSellingCategoriesDto(categories, quantities);
  }

  async getDailySales(query: FindAnalyticsQueryDto, user: IUserPayload) {
    const { bound, groupby } = getDateRangeFilterCompare(query.dateRange);
    const [
      {
        result: { fdates, f_quantities },
      },
      {
        result: { sdates, s_quantities },
      },
    ]: any = await this.sql.query(
      `WITH first AS (
    SELECT
        date_trunc('${groupby}', created_at) as ${groupby},
        SUM(quantity) as f_quantity
    FROM sale_items
    WHERE created_at < '${bound.toDateString()}'
    ${user.facility ? `AND facility_id = '${user.facility}'` : ''}
		${user.department ? `AND department_id = '${user.department}'` : ''}
    GROUP BY ${groupby}
		ORDER by ${groupby}
		),
		second AS (
    SELECT
        date_trunc('${groupby}', created_at) as ${groupby},
        SUM(quantity) as s_quantity
    FROM sale_items
    WHERE created_at  >= '${bound.toDateString()}'
    ${user.facility ? `AND facility_id = '${user.facility}'` : ''}
		${user.department ? `AND department_id = '${user.department}'` : ''}
    GROUP BY ${groupby}
		ORDER by ${groupby}
		)
		SELECT jsonb_build_object(
    'fdates', jsonb_agg(to_char(${groupby}, 'YYYY-MM-DD HH24:MI')),
    'f_quantity', jsonb_agg(f_quantity)
) as result
FROM first
union
	SELECT jsonb_build_object(
    'sdates', jsonb_agg(to_char(${groupby}, 'YYYY-MM-DD HH24:MI')),
    's_quantity', jsonb_agg(s_quantity)
) as result
FROM second;`,
      { raw: true, type: sequelize.QueryTypes.SELECT },
    );
    return new DailySalesDto(fdates, f_quantities, sdates, s_quantities);
  }

  async getSalesPaymentMethods(
    query: FindAnalyticsQueryDto,
    user: IUserPayload,
  ) {
    const { createdAt } = getDateRangeFilter(query.dateRange);
    const {
      result: { categories, quantities },
    }: any = await this.sql.query(
      `WITH filtered_sales AS (
    SELECT
        s.payment_type as name,
        sum(si.quantity) as total_quantity
    FROM sale_items si
		JOIN sales s on s.id = si.sale_id
		${this.applyWhere(createdAt, user)}
		GROUP BY name
    ORDER BY total_quantity desc
    LIMIT 5
		)
		SELECT jsonb_build_object(
    'categories', jsonb_agg(name),
    'quantities', jsonb_agg(total_quantity)
		) as result
		FROM filtered_sales;`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );

    return new SalesPaymentMethodDto(categories, quantities);
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
  private applyWhere(
    { [Op.between]: [startDate, endDate] }: { [Op.between]: [Date, Date] },
    user: IUserPayload,
  ) {
    return `WHERE si.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
		${user.facility ? `AND si.facility_id = '${user.facility}'` : ''}
		${user.department ? `AND si.department_id = '${user.department}'` : ''}
`;
  }
}
