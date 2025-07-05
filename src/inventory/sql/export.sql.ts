import { IUserPayload } from '../../auth/interface/payload.interface';

export function generateExportQuery(
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
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
    ORDER BY s.created_at DESC;
  `;
}
