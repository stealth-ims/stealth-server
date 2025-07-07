import { IUserPayload } from '../../../auth/interface/payload.interface';
import { sqlGenerateFilter } from '../../../core/shared/factory';
import { ExportItemsQueryDto, ItemStatus } from '../dto';

function generateQuerySql(query: ExportItemsQueryDto) {
  const filterClauses = [];
  if (query.categories) {
    filterClauses.push(`i.category_id IN ('${query.categories.join(', ')}')`);
  }
  if (query.status) {
    let whereClause = 'COALESCE(ts.total, 0) > i.reorder_point';
    switch (query.status) {
      case ItemStatus.OUT_OF_STOCK:
        whereClause = 'COALESCE(ts.total, 0) = 0';
        break;
      case ItemStatus.LOW:
        whereClause =
          'COALESCE(ts.total, 0) > 0 AND COALESCE(ts.total, 0) <= i.reorder_point';
        break;
      default:
        break;
    }
    filterClauses.push(`${whereClause}`);
  }
  return filterClauses.join('AND ');
}

export function generateExportQuery(
  query: ExportItemsQueryDto,
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
  const queryFilters = sqlGenerateFilter(
    'i',
    query,
    `i.name ILIKE '%${query.search}%' OR i.brand_name ILIKE '%${query.search}%'`,
  );
  const filters = generateQuerySql(query);
  return `
    WITH total_stocks AS (
      SELECT 
        item_id, 
        COALESCE(SUM(quantity),0) total
      FROM batches
      ${user.department ? `WHERE department_id = '${user.department}'` : ''}
      GROUP BY item_id
    )

    SELECT 
      TRIM(
        CONCAT(
          i.name,
          CASE WHEN i.brand_name IS NOT NULL THEN CONCAT(' (', i.brand_name, ')') ELSE '' END,
          CASE WHEN i.dosage_form IS NOT NULL THEN CONCAT(' ', INITCAP(i.dosage_form)) ELSE '' END,
          CASE WHEN i.strength IS NOT NULL THEN CONCAT(' ', i.strength) ELSE '' END,
          CASE WHEN i.unit_of_measurement IS NOT NULL THEN CONCAT(' ', i.unit_of_measurement) ELSE '' END
        )
      ) AS "Item Name",
      c.name as "Category",
      COALESCE(ts.total, 0) as "Total Stock",
      i.reorder_point as "Reorder Point",
      CASE
        WHEN COALESCE(ts.total, 0) = 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(ts.total, 0) > i.reorder_point THEN 'STOCKED'
        ELSE 'LOW'
      END AS "Status",
      i.updated_at
    FROM items i
    LEFT JOIN item_categories c ON i.category_id = c.id
    LEFT JOIN total_stocks ts ON ts.item_id = i.id
    WHERE i.facility_id = '${user.facility}'
    ${filters ? `AND ${filters}` : ''}
    ${queryFilters.searchFilter ? `AND ${queryFilters.searchFilter}` : ''}

    ${queryFilters.pageFilter}
  `;
}
