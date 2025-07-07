import { Injectable, NotImplementedException } from '@nestjs/common';
import { generateExportQuery } from './sql';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { ExportsService } from '../../exports/exports.service';
import { generateExportFilename } from '../../core/shared/factory';
import { ExportItemsQueryDto } from './dto';

@Injectable()
export class ItemExportsService {
  constructor(private readonly exportService: ExportsService) {}
  /**
   * Exports items.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  async exportItems(query: ExportItemsQueryDto, user: IUserPayload) {
    switch (query.exportType) {
      case 'csv':
        return await this.exportItemsCsv(query, user);
      case 'xlsx':
        return await this.exportItemsExcel(query, user);
      default:
        throw new NotImplementedException('Yet to be implemented');
    }
  }

  /**
   * Exports items in csv.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportItemsCsv(query: ExportItemsQueryDto, user: IUserPayload) {
    const sql = generateExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });
    const itemCsv = await this.exportService.exportStockCsv(sql, {
      fields: [
        'Item Name',
        'Category',
        'Total Stock',
        'Reorder Point',
        'Status',
      ],
    });
    const fileName = generateExportFilename('Items', 'csv');
    return {
      data: itemCsv,
      meta: {
        fileName,
        type: 'text/csv',
      },
    };
  }

  /**
   * Exports items in xlsx(excel).
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportItemsExcel(
    query: ExportItemsQueryDto,
    user: IUserPayload,
  ) {
    const sql = generateExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });
    const itemXlsx = await this.exportService.exportStockCsv(sql, {
      fields: [
        'Item Name',
        'Category',
        'Total Stock',
        'Reorder Point',
        'Status',
      ],
    });
    const fileName = generateExportFilename('Items', 'xlsx');
    return {
      data: itemXlsx,
      meta: {
        fileName,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    };
  }
}
