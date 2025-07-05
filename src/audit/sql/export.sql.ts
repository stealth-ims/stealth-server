import { IUserPayload } from '../../auth/interface/payload.interface';

export function generateExportQuery(
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
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
      ${user.department ? `WHERE department_id = '${user.department}'` : ''}
      AND a.table_name <> 'unknown' 
      AND a.table_name IN (
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
      )
    ORDER BY a.created_at DESC;
  `;
}
