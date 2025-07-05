import { Injectable, NotImplementedException } from '@nestjs/common';
import { generateExportQuery } from './sql';
import { ExportsService } from '../exports/exports.service';
import { IUserPayload } from '../auth/interface/payload.interface';
import { generateExportFilename } from '../core/shared/factory';
import { ExportQueryDto } from '../exports/dto';

@Injectable()
export class StockAdjustmentExportsService {
  constructor(private readonly exportService: ExportsService) {}
  /**
   * Exports stock adjustments.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  async exportStockAdjustments(query: ExportQueryDto, user: IUserPayload) {
    switch (query.exportType) {
      case 'csv':
        return await this.exportStockAdjustmentsCsv(user);
      case 'xlsx':
        return await this.exportStockAdjustmentsExcel(user);
      default:
        throw new NotImplementedException('Yet to be implemented');
    }
  }

  /**
   * Exports stock adjustments in csv.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportStockAdjustmentsCsv(user: IUserPayload) {
    const sql = generateExportQuery({
      facility: user.facility,
      department: user.department,
    });
    const stockAdjustmentCsv = await this.exportService.exportStockCsv(sql);
    const fileName = generateExportFilename('Stock_Adjustment', 'csv');
    return {
      data: stockAdjustmentCsv,
      meta: {
        fileName,
        type: 'text/csv',
      },
    };
  }

  /**
   * Exports stock adjustments in xlsx(excel).
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportStockAdjustmentsExcel(user: IUserPayload) {
    const sql = generateExportQuery({
      facility: user.facility,
      department: user.department,
    });
    const stockAdjustmentXlsx = await this.exportService.exportStockCsv(sql);
    const fileName = generateExportFilename('Stock_Adjustment', 'xlsx');
    return {
      data: stockAdjustmentXlsx,
      meta: {
        fileName,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    };
  }
}
