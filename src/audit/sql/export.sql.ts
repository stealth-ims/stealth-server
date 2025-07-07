import { IUserPayload } from '../../auth/interface/payload.interface';
import { sqlGenerateFilter } from '../../core/shared/factory';
import { ExportAuditsQueryDto } from '../dto';

function generateQuerySql(query: ExportAuditsQueryDto) {
  const filterClauses = [];
  if (query.action) {
    filterClauses.push(`a.action = '${query.action}'`);
  }
  if (query.tableNames) {
    filterClauses.push(`a.table_name IN ('${query.tableNames.join(', ')}')`);
  } else {
    filterClauses.push(`
      a.table_name IN (
        'Department',
        'User',
        'DepartmentRequest',
        'Batch',
        'Item',
        'Markup',
        'ItemCategory',
        'StockAdjustment',
        'Supplier',
        'ItemOrder',
        'Patient',
        'Report',
        'SaleItem',
        'Sale'
      )`);
  }
  if (query.description) {
    filterClauses.push(`a.description ILIKE '%${query.description}%'`);
  }
  if (query.userId) {
    filterClauses.push(`a.user_id = '${query.userId}'`);
  }
  if (query.startDate) {
    filterClauses.push(
      `a.created_at >= '${new Date(query.startDate).toISOString()}'`,
    );
  }
  if (query.endDate) {
    filterClauses.push(
      `a.created_at <= '${new Date(query.endDate).toISOString()}'`,
    );
  }
  return filterClauses.join('AND ');
}

export function generateExportQuery(
  query: ExportAuditsQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  const queryFilters = sqlGenerateFilter('a', query);
  const filters = generateQuerySql(query);
  return `
    SELECT 
      a.action AS "Action",
      a.table_name AS "Module Name",
      u.full_name AS "User",
      COALESCE(d.name, 'Central Admin') AS "Department",
      TO_CHAR(a.created_at, 'FMMonth DD, YYYY') AS "Date"
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN departments d ON a.department_id = d.id
    WHERE
      a.facility_id = '${user.facility}'
      ${user.department ? `AND a.department_id = '${user.department}'` : ''}
      AND a.table_name <> 'unknown'
      ${filters ? `AND ${filters}` : ''}
      ${queryFilters.searchFilter ? `AND ${queryFilters.searchFilter}` : ''}

    ${queryFilters.pageFilter}
  `;
}
