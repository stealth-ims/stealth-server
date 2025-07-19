import { Injectable, NotImplementedException } from '@nestjs/common';
import { generateExportQuery, generateSalesReportExportQuery } from './sql';
import { IUserPayload } from '../auth/interface/payload.interface';
import { generateExportFilename } from '../core/shared/factory';
import { ExportsService } from '../exports/exports.service';
import { ExportPeriodicSalesQueryDto, ExportSalesQueryDto } from './dto';
import { Json2CSVBaseOptions } from '@json2csv/plainjs/dist/mjs/BaseParser';

@Injectable()
export class SalesExportsService {
  constructor(private readonly exportService: ExportsService) {}

  /**
   * Exports Audits.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  async exportPeriodicSalesReport(
    query: ExportPeriodicSalesQueryDto,
    user: IUserPayload,
  ) {
    const sqlQuery = generateSalesReportExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });
    const options = {
      fields: [
        'Date',
        'Item(s)',
        'Amount',
        'Quantity',
        'Recorded By',
        'Status',
      ],
    };
    switch (query.exportType) {
      case 'csv':
        return await this.exportSalesCsv(sqlQuery, options);
      case 'xlsx':
        return await this.exportSalesExcel(sqlQuery, options);
      default:
        throw new NotImplementedException('Not yet implemented');
    }
  }

  /**
   * Exports Audits.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  async exportSales(query: ExportSalesQueryDto, user: IUserPayload) {
    const sql = generateExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });

    const options = {
      fields: [
        'Patient ID',
        'Item(s)',
        'Total Amount',
        'Date Created',
        'Payment Type',
      ],
    };
    switch (query.exportType) {
      case 'csv':
        return await this.exportSalesCsv(sql, options);
      case 'xlsx':
        return await this.exportSalesExcel(sql, options);
      default:
        throw new NotImplementedException('Not yet implemented');
    }
  }

  /**
   * Exports Sales in csv.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportSalesCsv(
    sql: string,
    options?: Json2CSVBaseOptions<object, object>,
  ) {
    const salesCsv = await this.exportService.exportStockCsv(sql, options);
    const fileName = generateExportFilename('Sales', 'csv');
    return {
      data: salesCsv,
      meta: {
        fileName,
        type: 'text/csv',
      },
    };
  }

  /**
   * Exports Sales in xlsx (excel).
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportSalesExcel(
    sql: string,
    options?: Json2CSVBaseOptions<object, object>,
  ) {
    const salesXlsx = await this.exportService.exportStockCsv(sql, options);
    const fileName = generateExportFilename('Sales', 'xlsx');
    return {
      data: salesXlsx,
      meta: {
        fileName,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    };
  }
}
