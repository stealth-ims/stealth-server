import { IUserPayload } from '../../../../auth/interface/payload.interface';

export function generateExpiredBatchesExportQuery(
  user: Pick<IUserPayload, 'facility' | 'department'>,
) {
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
    ORDER BY b.validity ASC;
  `;
}
