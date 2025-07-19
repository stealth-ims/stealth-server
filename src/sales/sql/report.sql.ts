import { endOfDay, startOfDay } from 'date-fns';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { getDateRangeFilter } from '../../core/shared/factory';
import { FetchSalesReportDataQueryDto } from '../dto';
import { Op } from 'sequelize';

export function generateSalesReportExportQuery(
  query: FetchSalesReportDataQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  let startDate: string;
  let endDate: string;

  if (query.dateRange) {
    const dates = getDateRangeFilter(query.dateRange).createdAt[Op.between];
    startDate = dates[0].toISOString();
    endDate = dates[1].toISOString();
  } else if (query.startDate && query.endDate) {
    startDate = new Date(query.startDate).toISOString();
    endDate = new Date(query.endDate).toISOString();
  } else if (query.specificDate) {
    startDate = startOfDay(query.specificDate).toISOString();
    endDate = endOfDay(query.specificDate).toISOString();
  }

  return `
      WITH 
        sale_items_list AS (
          SELECT 
            si.sale_id,
            string_agg(i.name, ', ') AS item_name,
            COALESCE(SUM(si.quantity), 0) AS total_quantity,
            COUNT(si.item_id) - 1 AS remainder_items
          FROM sale_items si
          LEFT JOIN items i ON si.item_id = i.id
          GROUP BY si.sale_id
        ), 
        sales_list AS (
          SELECT
            s.created_at AS "Date",
            sil.item_name AS "Item(s)",
            COALESCE(ROUND(s.total::numeric, 2), 0) AS "Amount",
            sil.total_quantity AS "Quantity",
            COALESCE(u.full_name, 'N/A') AS "Recorded By",
            s.status AS "Status"
          FROM sales s
          LEFT JOIN users u ON s.created_by_id = u.id
          LEFT JOIN sale_items_list sil ON sil.sale_id = s.id
          WHERE
            s.facility_id = '${user.facility}'
            ${user.department ? `AND s.department_id = '${user.department}'` : 'AND s.department_id IS NULL'}
            AND s.created_at BETWEEN '${startDate}' AND '${endDate}'
        )
  
      SELECT * FROM sales_list;
    `;
}

export function generateSaleReportQuery(
  query: FetchSalesReportDataQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  let startDate: string;
  let endDate: string;

  if (query.dateRange) {
    const dates = getDateRangeFilter(query.dateRange).createdAt[Op.between];
    startDate = dates[0].toISOString();
    endDate = dates[1].toISOString();
  } else if (query.startDate && query.endDate) {
    startDate = new Date(query.startDate).toISOString();
    endDate = new Date(query.endDate).toISOString();
  } else if (query.specificDate) {
    startDate = startOfDay(query.specificDate).toISOString();
    endDate = endOfDay(query.specificDate).toISOString();
  }

  return `
        WITH 
        sale_items_list AS (
            SELECT 
                si.sale_id,
                MIN(i.name) AS item_name,
                COALESCE(SUM(si.quantity), 0) AS total_quantity,
                COUNT(si.item_id) - 1 AS remainder_items
            FROM sale_items si
            LEFT JOIN items i ON si.item_id = i.id
            GROUP BY si.sale_id
        ), 
        sales_list AS (
            SELECT
                s.created_at AS "createdAt",
                COALESCE(ROUND(s.total::numeric, 2), 0) AS total,
                s.status,
                jsonb_build_object(
                    'itemName', sil.item_name,
                    'remainderItems', sil.remainder_items,
                    'totalQuantity', sil.total_quantity
                ) AS "saleItems",
                jsonb_build_object(
                    'id', u.id,
                    'fullName', u.full_name
                ) AS "createdBy"
            FROM sales s
            LEFT JOIN users u ON s.created_by_id = u.id
            LEFT JOIN sale_items_list sil ON sil.sale_id = s.id
            WHERE
                s.facility_id = '${user.facility}'
                ${user.department ? `AND s.department_id = '${user.department}'` : 'AND s.department_id IS NULL'}
                AND s.created_at BETWEEN '${startDate}' AND '${endDate}'
        ),
        previous_total_items_sold AS (
            SELECT COALESCE(SUM(si.quantity), 0) AS "totalItems"
            FROM sale_items si
            WHERE
                si.facility_id = '${user.facility}'
                ${user.department ? `AND si.department_id = '${user.department}'` : 'AND si.department_id IS NULL'}                
                AND si.created_at <= '${startDate}'
        ),
        current_total_items_sold AS (
            SELECT COALESCE(SUM(si.quantity), 0) AS "totalItems"
            FROM sale_items si
            WHERE
                si.facility_id = '${user.facility}'
                ${user.department ? `AND si.department_id = '${user.department}'` : 'AND si.department_id IS NULL'}   
                AND si.created_at BETWEEN '${startDate}' AND '${endDate}'
        ),
        previous_total_revenue AS (
            SELECT COALESCE(ROUND(SUM(s.total)::NUMERIC, 2), 0) AS "totalRevenue"
            FROM sales s
            WHERE
                s.facility_id = '${user.facility}'
                ${user.department ? `AND s.department_id = '${user.department}'` : 'AND s.department_id IS NULL'}
                AND s.created_at <= '${startDate}'
        ),
        current_total_revenue AS (
            SELECT COALESCE(ROUND(SUM(s.total)::NUMERIC, 2), 0) AS "totalRevenue"
            FROM sales s
            WHERE
                s.facility_id = '${user.facility}'
                ${user.department ? `AND s.department_id = '${user.department}'` : 'AND s.department_id IS NULL'}
                AND s.created_at BETWEEN '${startDate}' AND '${endDate}'
        ),
        today_sales AS (
            SELECT COUNT(*) AS "todaySales"
            FROM sales s
            WHERE
                s.facility_id = '${user.facility}'
                ${user.department ? `AND s.department_id = '${user.department}'` : 'AND s.department_id IS NULL'}
                AND s.created_at BETWEEN '${startDate}' AND '${endDate}'
        )


        SELECT jsonb_build_object(
        'rows', jsonb_agg(sales_list),
        'analytics', jsonb_build_object(
            'totalSales', (SELECT "todaySales" FROM today_sales),
            'totalRevenue', jsonb_build_object(
                'data', (SELECT "totalRevenue" FROM current_total_revenue),
                'percentageChange', 
                (
                    SELECT
                    CASE 
                        WHEN prev."totalRevenue" = 0 THEN NULL
                        ELSE ABS(ROUND((((curr."totalRevenue" - prev."totalRevenue") / prev."totalRevenue") * 100)::NUMERIC, 2))
                    END
                    FROM current_total_revenue curr, previous_total_revenue prev
                ),
                'changeType',
                (
                    SELECT
                    CASE 
                    WHEN curr."totalRevenue" > prev."totalRevenue" THEN 'INCREASED'
                    WHEN curr."totalRevenue" < prev."totalRevenue" THEN 'DECREASED'
                    ELSE 'NO CHANGE'
                    END
                    FROM current_total_revenue curr, previous_total_revenue prev
                )
                
                ),
            'totalItems', jsonb_build_object(
                'data', (SELECT "totalItems" FROM current_total_items_sold),
                'percentageChange', 
                (
                    SELECT
                    CASE 
                        WHEN prev."totalItems" = 0 THEN NULL
                        ELSE ABS(ROUND((((curr."totalItems" - prev."totalItems") / prev."totalItems") * 100)::NUMERIC, 2)) 	
                    END
                    FROM current_total_items_sold curr, previous_total_items_sold prev
                ),
                'changeType',
                (
                    SELECT
                    CASE 
                    WHEN curr."totalItems" > prev."totalItems" THEN 'INCREASED'
                    WHEN curr."totalItems" < prev."totalItems" THEN 'DECREASED'
                    ELSE 'NO CHANGE'
                    END
                    FROM current_total_items_sold curr, previous_total_items_sold prev
                )
                
                )
            )
        ) AS result
        FROM sales_list;
    `;
}
