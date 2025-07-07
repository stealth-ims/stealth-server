import { IUserPayload } from '../../auth/interface/payload.interface';
import { sqlGenerateFilter } from '../../core/shared/factory';
import { ExportStockAdjustmentsQueryDto } from '../dto';

function generateQuerySql(query: ExportStockAdjustmentsQueryDto) {
  const filterClauses = [];
  if (query.type) {
    filterClauses.push(`s.type = '${query.type}'`);
  }
  if (query.status) {
    filterClauses.push(`s.status = '${query.status}'`);
  }
  if (query.startDate) {
    filterClauses.push(
      `s.created_at >= '${new Date(query.startDate).toISOString()}'`,
    );
  }
  if (query.endDate) {
    filterClauses.push(
      `s.created_at <= '${new Date(query.endDate).toISOString()}'`,
    );
  }
  return filterClauses.join('AND ');
}

export function generateExportQuery(
  query: ExportStockAdjustmentsQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  const queryFilters = sqlGenerateFilter(
    's',
    query,
    `s.reason ILIKE '%${query.search}%'`,
  );
  const filters = generateQuerySql(query);
  return `
    SELECT 
      i.name AS "Item",
      u.full_name AS "Created By",
      s.type AS "Adjustment Type",
      s.quantity AS "Quantity",
      TO_CHAR(s.created_at, 'FMMonth DD, YYYY') AS "Date Created",
      s.status AS "Status"
    FROM stock_adjustments s
    LEFT JOIN items i ON s.item_id = i.id
    LEFT JOIN users u ON s.created_by_id = u.id
    WHERE 
      s.facility_id = '${user.facility}'
      ${user.department ? `AND s.department_id = '${user.department}'` : 'AND s.department_id IS NULL'}
      ${filters ? `AND ${filters}` : ''}
      ${queryFilters.searchFilter ? `AND ${queryFilters.searchFilter}` : ''}

    ${queryFilters.pageFilter}
  `;
}
