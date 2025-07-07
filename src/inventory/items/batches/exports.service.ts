import { Injectable, NotImplementedException } from '@nestjs/common';
import { IUserPayload } from '../../../auth/interface/payload.interface';
import { generateExportFilename } from '../../../core/shared/factory';
import { ExportsService } from '../../../exports/exports.service';
import { generateExpiredBatchesExportQuery } from './sql';
import { ExportExpiryQueryDto } from '../dto';
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
  async exportExpiredBatches(query: ExportExpiryQueryDto, user: IUserPayload) {
    switch (query.exportType) {
      case 'csv':
        return await this.exportExpiredBatchesCsv(query, user);
      case 'xlsx':
        return await this.exportExpiredBatchesExcel(query, user);
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
  private async exportExpiredBatchesCsv(
    query: ExportExpiryQueryDto,
    user: IUserPayload,
  ) {
    const sql = generateExpiredBatchesExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });

    const expiredBatchesCsv = await this.exportService.exportStockCsv(sql, {
      fields: [
        'Item Name',
        'Status',
        'Expiry Date',
        'Total Stock',
        'Batch Number',
      ],
    });
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
  private async exportExpiredBatchesExcel(
    query: ExportExpiryQueryDto,
    user: IUserPayload,
  ) {
    const sql = generateExpiredBatchesExportQuery(query, {
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
