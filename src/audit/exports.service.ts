import { Injectable, NotImplementedException } from '@nestjs/common';
import { generateExportQuery } from './sql';
import { IUserPayload } from '../auth/interface/payload.interface';
import { generateExportFilename } from '../core/shared/factory';
import { ExportsService } from '../exports/exports.service';
import { ExportAuditsQueryDto } from './dto';

@Injectable()
export class AuditsExportsService {
  constructor(private readonly exportService: ExportsService) {}
  /**
   * Exports Audits.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  async exportAudits(query: ExportAuditsQueryDto, user: IUserPayload) {
    switch (query.exportType) {
      case 'csv':
        return await this.exportAuditsCsv(query, user);
      case 'xlsx':
        return await this.exportAuditsExcel(query, user);
      default:
        throw new NotImplementedException('Not yet implemented');
    }
  }

  /**
   * Exports Audits in csv.
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportAuditsCsv(
    query: ExportAuditsQueryDto,
    user: IUserPayload,
  ) {
    const sql = generateExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });
    const auditsCsv = await this.exportService.exportStockCsv(sql);
    const fileName = generateExportFilename('Audit_Logs', 'csv');
    return {
      data: auditsCsv,
      meta: {
        fileName,
        type: 'text/csv',
      },
    };
  }

  /**
   * Exports Audits in xlsx (excel).
   *
   * @param user - The body containing the user's information.
   * @returns A promise that resolves to the created readable stream.
   * @throws If any error occurs during the creation process.
   */
  private async exportAuditsExcel(
    query: ExportAuditsQueryDto,
    user: IUserPayload,
  ) {
    const sql = generateExportQuery(query, {
      facility: user.facility,
      department: user.department,
    });
    const auditsXlsx = await this.exportService.exportStockCsv(sql, {
      fields: ['Action', 'Module Name', 'User', 'Department', 'Date'],
    });
    const fileName = generateExportFilename('Audit_Logs', 'xlsx');
    return {
      data: auditsXlsx,
      meta: {
        fileName,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    };
  }
}
