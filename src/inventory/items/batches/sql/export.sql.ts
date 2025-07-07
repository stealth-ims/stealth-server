import { IUserPayload } from '../../../../auth/interface/payload.interface';
import { sqlGenerateFilter } from '../../../../core/shared/factory';
import { ExportExpiryQueryDto } from '../../dto';
import { BatchValidityStatus } from '../../models';

function generateQuerySql(query: ExportExpiryQueryDto) {
  const filterClauses = [];
  if (query.startDate) {
    filterClauses.push(
      `b.validity >= '${new Date(query.startDate).toISOString()}'`,
    );
  }
  if (query.endDate) {
    filterClauses.push(
      `b.validity <= '${new Date(query.endDate).toISOString()}'`,
    );
  }

  if (query.status) {
    let whereClause = '(b.validity::DATE - CURRENT_DATE) <= 90';
    switch (query.status) {
      case BatchValidityStatus.EXPIRED:
        whereClause = '(b.validity::DATE - CURRENT_DATE) < 0';
        break;
      case BatchValidityStatus.CRITICAL:
        whereClause = '(b.validity::DATE - CURRENT_DATE) <= 30';
        break;
      case BatchValidityStatus.APPROACHING:
        whereClause = '(b.validity::DATE - CURRENT_DATE) <= 90';
        break;
      default:
        break;
    }
    filterClauses.push(`${whereClause}`);
  }

  return filterClauses.join('AND ');
}

export function generateExpiredBatchesExportQuery(
  query: ExportExpiryQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  const queryFilters = sqlGenerateFilter(
    'b',
    query,
    `i.name ILIKE '%${query.search}%'`,
  );
  const filters = generateQuerySql(query);
  return `
    SELECT
      i.name AS "Item Name",
      CASE
        WHEN (b.validity::DATE - CURRENT_DATE) < 0 THEN 'EXPIRED'
        WHEN (b.validity::DATE - CURRENT_DATE) <= 30 THEN 'CRITICAL'
        WHEN (b.validity::DATE - CURRENT_DATE) <= 90 THEN 'APPROACHING'
        ELSE 'SAFE'
      END AS "Status",
      TO_CHAR(b.validity, 'FMMonth DD, YYYY') AS "Expiry Date",
      b.quantity AS "Total Stock",
      b.batch_number AS "Batch Number"
    FROM batches b
    LEFT JOIN items i ON b.item_id = i.id
    WHERE 
      b.facility_id = '${user.facility}'
      ${user.department ? `AND b.department_id = '${user.department}'` : 'AND b.department_id IS NULL'}
      ${filters ? `AND ${filters}` : ''}
      ${queryFilters.searchFilter ? `AND ${queryFilters.searchFilter}` : ''}

      ${queryFilters.pageFilter}

  `;
}
