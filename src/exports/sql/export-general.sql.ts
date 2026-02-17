import { startOfMonth } from 'date-fns';
import { IMSLocations, PerformanceExportSchema } from '../dto';

export function generateGeneralDataQuery(location: IMSLocations) {
  return `
    WITH facility_ids AS (
      SELECT id
      FROM facilities
      WHERE name IN (
        ${PerformanceExportSchema.locations[location].facilities.join(', ')}
      )
    )
    SELECT
      f.name AS "healthDirectorates",
      COUNT(u.full_name) - 1 AS "numberOfHealthCenters",
      COALESCE(STRING_AGG(d.name, ', '), 'N/A') AS "healthCentres",
      COUNT(u.id) AS "totalNumberOfUsers",
      COUNT(CASE WHEN u.role = 'Central Admin' THEN 1 END) AS "numberOfCentralAdmins",
      COUNT(CASE WHEN u.role = 'Department Admin' THEN 1 END) AS "numberOfDepartmentAdmins",
      COUNT(CASE WHEN u.role = 'Pharmacist' THEN 1 END) AS "numberOfPharmacists"
    FROM users u
    LEFT JOIN facilities f ON u.facility_id = f.id
    LEFT JOIN departments d ON  u.department_id = d.id
    WHERE u.facility_id IN (SELECT id FROM facility_ids)
    GROUP BY u.facility_id, f.name;
  `;
}

export function generateSaleAndStockingActivityDataQuery(
  location: IMSLocations,
) {
  // const today = new Date('2025-10-01');
  // const month = startOfMonth(today);
  // const end = endOfMonth(addMonths(today, 2));
  return `
    WITH facility_ids AS (
      SELECT id
      FROM facilities
      WHERE name IN (
        ${PerformanceExportSchema.locations[location].facilities.join(', ')}
      )
    )

    SELECT
      f.name AS "healthDirectorates",
      COALESCE(d.name,'N/A') AS "healthCenters",
      COUNT(CASE WHEN a.description = 'Created Sale' THEN 1 END) AS "salesCreated",
      COALESCE(
        TO_CHAR(
          MAX(CASE WHEN a.description = 'Created Sale' THEN a.created_at END),
          'FMMonth DD, YYYY - HH:MI AM'
        ),
        'N/A'
      ) AS "timeOfRecentSale",
      
      COUNT(CASE WHEN a.description = 'Created Batch' THEN 1 END) AS "batchesAdded",
      COALESCE(
        TO_CHAR(
          MAX(CASE WHEN a.description = 'Created Batch' THEN a.created_at END), 
          'FMMonth DD, YYYY - HH:MI AM'
        ),
        'N/A'
      ) AS "timeOfRecentlyAddedBatch"

    FROM audit_logs a
    LEFT JOIN departments d ON a.department_id = d.id
    LEFT JOIN facilities f ON a.facility_id = f.id
    WHERE
      a.facility_id IN (SELECT id FROM facility_ids)
      ${location !== IMSLocations.SAVANNAH ? 'AND d.name IS NOT NULL' : ''}
    GROUP BY a.facility_id, d.name, f.name;
`;
  // AND a.created_at BETWEEN '${month.toISOString()}' AND '${end.toISOString()}'
}

// COUNT(CASE WHEN a.description = 'Created Item' THEN 1 END) AS "itemsAdded",
// COALESCE(
//     TO_CHAR(
//         MAX(CASE WHEN a.description = 'Created Item' THEN a.created_at END),
//         'FMMonth DD, YYYY - HH:MI AM'
//                 ),
//     'N/A'
//           ) AS "timeOfRecentlyAddedItem"

export function generateSystemUsageDataQuery(location: IMSLocations) {
  const today = new Date();
  // const month = subMonths(today, 1);
  const month = startOfMonth(today);
  // const end = endOfMonth(addMonths(today, 2));

  return `
    WITH facility_ids AS (
      SELECT id, name
      FROM facilities
      WHERE name IN (
        ${PerformanceExportSchema.locations[location].facilities.join(', ')}
      )
    ),

    total_usage AS (
        SELECT COUNT(*)::NUMERIC AS total
        FROM audit_logs
      WHERE 
      facility_id IN (SELECT id FROM facility_ids)
    )

    SELECT
      f.name AS "healthDirectorates",
      COALESCE(d.name, 'N/A') AS "healthCenters",
      COUNT(DISTINCT DATE_TRUNC('day', a.created_at)) AS "usageDaysInTheMonth",
      TO_CHAR(
          (COUNT(DISTINCT DATE_TRUNC('day', a.created_at))::NUMERIC / 30) * 100,
          'FM999990.00'
      ) || '%' AS "percentageUsage"
      

    FROM facility_ids f
    LEFT JOIN audit_logs a
      ON a.facility_id = f.id
			AND a.created_at > '${month.toISOString()}'
     AND a.table_name NOT IN ('SaleItem', 'Patient')
    LEFT JOIN departments d
      ON a.department_id = d.id
     ${location !== IMSLocations.SAVANNAH ? 'AND d.name IS NOT NULL' : ''}

    GROUP BY f.id, f.name, d.name;

`;
  // AND a.created_at BETWEEN '${month.toISOString()}' AND '${end.toISOString()}'
}

export function generateTotalQuantityDataQuery(location: string) {
  // const today = new Date('2025-10-01');
  // const month = startOfMonth(today);
  // const end = endOfMonth(addMonths(today, 2));
  return `
    WITH facility_ids AS (
      SELECT id
      FROM facilities
      WHERE name IN (
        ${PerformanceExportSchema.locations[location].facilities.join(', ')}
      )
    )

    SELECT
      f.name AS "healthDirectorates",
      COALESCE(d.name, 'N/A') AS "healthCenters",
      SUM(b.quantity) AS "totalQuantity"
      
    FROM batches b
    LEFT JOIN items i ON b.item_id = i.id
    LEFT JOIN departments d ON b.department_id = d.id
    LEFT JOIN facilities f ON b.facility_id = f.id
    WHERE b.facility_id IN (SELECT id FROM facility_ids)
    GROUP BY b.facility_id, d.name, f.name;
`;
  // AND b.created_at BETWEEN '${month.toISOString()}' AND '${end.toISOString()}'
}
