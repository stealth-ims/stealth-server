import { endOfToday, startOfToday } from 'date-fns';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { sqlGenerateFilter } from '../../core/shared/factory';
import { ExportSalesQueryDto } from '../dto';

function generateQuerySql(query: ExportSalesQueryDto) {
  const filterClauses = [];

  if (query.status) {
    filterClauses.push(`s.status = '${query.status}'`);
  }

  if (query.todaySales) {
    const startDate = startOfToday();
    const endDate = endOfToday();
    filterClauses.push(
      `s.updated_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`,
    );
  }

  return filterClauses.join('\n\tAND ');
}

export function generateExportQuery(
  query: ExportSalesQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  const queryFilters = sqlGenerateFilter(
    's',
    query,
    `s.sale_number ILIKE '%${query.search}%'`,
  );
  const filters = generateQuerySql(query);

  return `
    WITH sale_carts AS ( 
      SELECT 
        si.sale_id,
        string_agg(i.name, ', ') as cart_items
      FROM sale_items si
      LEFT JOIN items i ON si.item_id = i.id
      GROUP BY si.sale_id
    )

    SELECT 
      COALESCE(p.card_identification_number, 'N/A') AS "Patient ID",
      sc.cart_items AS "Item(s)",
      ROUND(s.total::numeric, 2) AS "Total Amount",
      TO_CHAR(s.created_at, 'FMMonth DD, YYYY') AS "Date Created",
      array_to_string(s.payment_type, ', ') AS "Payment Type"
    FROM sales s
    LEFT JOIN patients p ON s.patient_id = p.id
    LEFT JOIN sale_carts sc ON sc.sale_id = s.id
    WHERE
      s.facility_id = '${user.facility}'
      ${user.department ? `AND s.department_id = '${user.department}'` : ''}
      ${filters ? `AND ${filters}` : ''}
      ${queryFilters.searchFilter ? `AND ${queryFilters.searchFilter}` : ''}

    ${queryFilters.pageFilter}
  `;
}
