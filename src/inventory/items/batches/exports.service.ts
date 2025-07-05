import { Injectable, NotImplementedException } from '@nestjs/common';
import { IUserPayload } from '../../../auth/interface/payload.interface';
import { generateExportFilename } from '../../../core/shared/factory';
import { ExportQueryDto } from '../../../exports/dto';
import { ExportsService } from '../../../exports/exports.service';
import { generateExpiredBatchesExportQuery } from './sql';
@Injectable()
export class BatchesExportsService {
  constructor(private readonly exportService: ExportsService) {}
  /**
   * Exports batches.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  async exportExpiredBatches(query: ExportQueryDto, user: IUserPayload) {
    switch (query.exportType) {
      case 'csv':
        return await this.exportExpiredBatchesCsv(user);
      case 'xlsx':
        return await this.exportExpiredBatchesExcel(user);
      default:
        throw new NotImplementedException('Yet to be implemented');
    }
  }

  /**
   * Exports batches in csv.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportExpiredBatchesCsv(user: IUserPayload) {
    const sql = generateExpiredBatchesExportQuery({
      facility: user.facility,
      department: user.department,
    });
    const expiredBatchesCsv = await this.exportService.exportStockCsv(sql);
    const fileName = generateExportFilename('Batches_By_Expiry', 'csv');
    return {
      data: expiredBatchesCsv,
      meta: {
        fileName,
        type: 'text/csv',
      },
    };
  }

  /**
   * Exports batches in xlsx(excel).
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportExpiredBatchesExcel(user: IUserPayload) {
    const sql = generateExpiredBatchesExportQuery({
      facility: user.facility,
      department: user.department,
    });
    const expiredBatchesXlsx = await this.exportService.exportStockCsv(sql);
    const fileName = generateExportFilename('Batches_By_Expiry', 'xlsx');
    return {
      data: expiredBatchesXlsx,
      meta: {
        fileName,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    };
  }
}
