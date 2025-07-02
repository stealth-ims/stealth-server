import { Injectable } from '@nestjs/common';
import {
  DailySalesDto,
  FindAnalyticsQueryDto,
  FindGeneralAnalyticsQueryDto,
  GeneralAnalyticsDto,
  ItemSalesAnalyticsDto,
  MarkupAnalysticsDto,
  SalesPaymentMethodDto,
  SalesTrendDto,
  TopSellingCategoriesDto,
} from './dto';
import { Sequelize } from 'sequelize-typescript';
import { getDateRangeFilter } from 'src/core/shared/factory';
import { IUserPayload } from 'src/auth/interface/payload.interface';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { differenceInDays, formatDate, subDays } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private sql: Sequelize) {}
  async findAll(query: FindGeneralAnalyticsQueryDto, user: IUserPayload) {
    const { startDate, endDate } = query;
    const comparisonStartDate = subDays(
      startDate,
      differenceInDays(endDate, startDate),
    );
    const comparisonEndDate = subDays(startDate, 1);
    const { res }: any = await this.sql.query(
      `
with current as (
select
	count(distinct patient_id ) customers,
	count(distinct s.id) transactions,
	sum(total) revenue,
	sum(si.quantity) items_sold,
	round(sum(si.quantity) / coalesce(nullif(count(distinct s.id), 0), 1), 0) avg_items_per_trans,
	count(distinct case when sa.type = 'INCREMENT' then sa.quantity end) items_returned
from sales s
JOIN sale_items si ON s.id = si.sale_id
left join stock_adjustments sa on sa.item_id = si.item_id
WHERE s.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
${user.facility ? `AND si.facility_id = '${user.facility}'` : ''}
${user.department ? `AND si.department_id = '${user.department}'` : ''}
),
previous as (
select
	count(distinct patient_id ) customers,
	count(distinct s.id ) transactions,
	sum(total) revenue,
	sum(si.quantity) items_sold,
	round(sum(si.quantity) / coalesce(nullif(count(distinct s.id), 0), 1), 0) avg_items_per_trans,
	count(distinct case when sa.type = 'INCREMENT' then sa.quantity end) items_returned
from sales s
JOIN sale_items si ON s.id = si.sale_id
left join stock_adjustments sa on sa.item_id = si.item_id
WHERE s.created_at BETWEEN '${comparisonStartDate.toISOString()}' AND '${comparisonEndDate.toISOString()}'
${user.facility ? `AND si.facility_id = '${user.facility}'` : ''}
${user.department ? `AND si.department_id = '${user.department}'` : ''}
),
inventory as (
 SELECT
        i.id,
		    i.reorder_point,
        SUM(b.quantity) item_quantitiy,
        COUNT(distinct CASE WHEN b.validity  BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days' THEN i.id END) AS soon_expiring
  FROM items i
  LEFT JOIN batches b
      ON b.item_id = i.id
      ${user.department ? `AND i.department_id = '${user.department}'` : 'AND i.department_id IS NULL'}
  WHERE ${user.facility ? `i.facility_id = '${user.facility}'` : ''}
	GROUP BY i.id
),
doh as (SELECT
	SUM(b.quantity) * MIN(i.selling_price) sum_s_sales,
	SUM(si.quantity) * MIN(i.cost_price) sum_c_sales
FROM sale_items si
JOIN batches b on si.item_id = b.item_id
JOIN items i on si.item_id = i.id
WHERE si.created_at >= now() - INTERVAL '90 days'
${user.facility ? `AND i.facility_id = '${user.facility}'` : ''}
${user.department ? `AND i.department_id = '${user.department}'` : ''}
GROUP BY si.item_id
),
calculations as (
	select
		round((c.items_sold - coalesce(p.items_sold, 0)) / coalesce(nullif(p.items_sold, 0), 1)* 100, 2) itemChange,
		round((c.customers - coalesce(p.customers, 0)) / coalesce(nullif(p.customers, 0), 1)* 100, 2) customersChange,
		round((c.items_returned - coalesce(p.items_returned, 0)) / coalesce(nullif(p.items_returned, 0), 1) * 100, 2) returnedChange,
		round((c.transactions  - coalesce(p.transactions, 0)) / coalesce(nullif(p.transactions, 0), 1)  * 100, 2) transChange,
		round((c.revenue - p.revenue  / p.revenue)::numeric  * 100, 2) revenueChange,
		round((c.avg_items_per_trans - coalesce(p.avg_items_per_trans, 0)) / coalesce(nullif(p.avg_items_per_trans, 0), 1)* 100, 2) avgChange,
		round(c.items_sold /  (SELECT SUM(item_quantitiy) FROM inventory)::numeric, 2) turnover_rate,
		c.items_sold  itemsTotal,
		c.transactions transTotal,
		c.avg_items_per_trans avg_trans,
		c.items_returned totalItemsReturned,
		c.customers totalCustomers,
		round(c.revenue::numeric, 2) totalRevenue
	from current c, previous p
)
select jsonb_build_object(
	'itemStockLevel', (select jsonb_build_object(
     'stock', jsonb_build_object(
		    'total', COUNT(id),
		    'totalStock', SUM(item_quantitiy),
	      'outOfStock', COUNT(case when COALESCE(item_quantitiy, 0) = 0 then id end),
	      'highStocked', COUNT(case when item_quantitiy > reorder_point then id end),
	      'lowStocked', COUNT(case when item_quantitiy <= reorder_point and item_quantitiy > 0 then id end),
        'stockDaysOnHand', (select round((AVG(sum_s_sales) / (SUM(sum_c_sales) /90))::numeric, 2) from doh)
     ),
		'percentageChange', 100,
		'changeType', 'INCREMENT'
		) from inventory),
	'totalItemsSold',json_build_object(
		'total', itemsTotal,
		'percentageChange', itemChange,
		'changeType', case when itemChange < 0  then 'DECREMENT' else 'INCREMENT' end
	),
	'totalTransactions', json_build_object(
		'total', transTotal,
		'percentageChange', transChange,
		'changeType', case when transChange < 0  then 'DECREMENT' else 'INCREMENT' end
	),
	'totalRevenue',json_build_object(
		'total', totalRevenue,
		'percentageChange', totalRevenue,
		'changeType', case when revenueChange < 0  then 'DECREMENT' else 'INCREMENT' end
	),
	'customers', json_build_object(
		'total', totalCustomers,
		'percentageChange', customersChange,
		'changeType', case when customersChange < 0  then 'DECREMENT' else 'INCREMENT' end
	) ,
	'soonToExpireItems', jsonb_build_object(
        'total', (SELECT SUM(soon_expiring) FROM inventory),
        'percentageChange', 100,
        'changeType', 'INCREMENT'
    ),
    'itemsReturned', jsonb_build_object(
        'total', totalItemsReturned,
        'percentageChange', returnedChange,
		'changeType', case when returnedChange  < 0  then 'DECREMENT' else 'INCREMENT' end
    ),
    'inventoryTurnoverRate', jsonb_build_object(
        'total', turnover_rate,
        'percentageChange', 100,
		    'changeType', 'INCREMENT'
    ),
		'averageItemsPerTransaction', jsonb_build_object(
        'total', avg_trans,
        'percentageChange', avgChange,
		'changeType', case when avgChange < 0  then 'DECREMENT' else 'INCREMENT' end
    )
) as res
from calculations;
`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );

    return res as GeneralAnalyticsDto;
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

  async getDailySales(
    { startDate, endDate }: FindGeneralAnalyticsQueryDto,
    user: IUserPayload,
  ) {
    const start = formatDate(startDate, 'yyyy-MM-dd');
    const end = formatDate(endDate, 'yyyy-MM-dd');
    const { result }: any = await this.sql.query(
      `WITH hourly_sales AS (
    SELECT
        to_char(date_trunc('hour', created_at), 'HH24:MI') as hour,
        SUM(CASE WHEN '${start}' = date_trunc('day', created_at) THEN quantity ELSE 0 END) as f_quantity,
        SUM(CASE WHEN '${end}' = date_trunc('day', created_at) THEN quantity ELSE 0 END) as s_quantity
    FROM sale_items
    WHERE created_at::date = '${start}' or created_at::date ='${end}'
       ${user.facility ? `AND facility_id = '${user.facility}'` : ''}
		   ${user.department ? `AND department_id = '${user.department}'` : ''}
    GROUP BY hour
    ORDER BY hour
    ),
	  total as (
	    SELECT
		    SUM(f_quantity) ftotal,
		    SUM(s_quantity) stotal
	    FROM hourly_sales
      )
    SELECT jsonb_build_object(
	    'metrics', (SELECT jsonb_build_object(
	       'total', ftotal + stotal,
	       'percentageChange', round((ftotal - stotal)/ coalesce(nullif(stotal, 0), 1) * 100, 2),
	       'changeType', CASE WHEN ftotal < stotal THEN 'DECREMENT' ELSE 'INCREMENT' END
	        ) FROM total),
      'sales', jsonb_build_object(
	       'hours', jsonb_agg(hour),
         '${start}', jsonb_agg(f_quantity),
         '${end}', jsonb_agg(s_quantity)
	)) as result
    FROM hourly_sales`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );
    return result as DailySalesDto;
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

  async getMarkupSales(query: FindAnalyticsQueryDto, user: IUserPayload) {
    const { createdAt } = getDateRangeFilter(query.dateRange);
    const res: any = await this.sql.query(
      `
SELECT
	SUM(case when s.insured = true then si.quantity END) iquantity,
	SUM(case when s.insured = true then s.total END) itotal,
	SUM(case when s.insured = false then si.quantity END) nquantity,
	SUM(case when s.insured = false then s.total END) ntotal
FROM sales s
JOIN sale_items si on s.id = si.sale_id
${this.applyWhere(createdAt, user)}
`,
      { plain: true, type: sequelize.QueryTypes.SELECT },
    );
    return new MarkupAnalysticsDto(
      [res.iquantity, res.itotal.toFixed(2)],
      [res.nquantity, res.ntotal.toFixed(2)],
    );
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
