import { Injectable, NotFoundException } from '@nestjs/common';
import { Report } from './models/reports.models';
import { CreateReportDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';
import { GetReportDto, GetReportPaginationDto } from './dto/get.dto';
import { FindAndCountOptions, Op } from 'sequelize';
import { instanceToPlain } from 'class-transformer';
import { UpdateReportDto } from './dto/edit.dto';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report) private reportRepository: typeof Report) {}

  async fetchAll(query: GetReportPaginationDto) {
    const whereConditions: Record<string, Record<any, any>> = {};

    if (query.reportName) {
      whereConditions.reportName = { [Op.iLike]: `%${query.reportName}%` };
    }

    if (query.nameInExport) {
      whereConditions.nameInExport = { [Op.iLike]: `%${query.nameInExport}%` };
    }

    if (query.startDate || query.endDate) {
      whereConditions.createdAt = {
        ...(query.startDate && { [Op.gte]: new Date(query.startDate) }),
        ...(query.endDate && { [Op.lte]: new Date(query.endDate) }),
      };
    }

    const filter: FindAndCountOptions<Report> = {
      where: whereConditions,
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'ASC']],
    };

    const { rows, count } = await this.reportRepository.findAndCountAll(filter);

    const response = new PaginatedDataResponseDto<GetReportDto[]>(
      rows,
      query.page || 1,
      query.pageSize,
      count,
    );

    return response;
  }

  async export(query: GetReportPaginationDto) {
    const { rows } = await this.fetchAll(query);

    const headerLabels = {
      '#': '#',
      id: 'Report ID',
      reportName: 'Report Name',
      nameInExport: 'Name in Export',
      startDate: 'Start Date',
      endDate: 'End Date',
      reportLayout: 'Report Layout',
    };

    const rowsJson = rows.map((report) => instanceToPlain(report));

    const csvRows = [];

    csvRows.push(Object.values(headerLabels).join(','));

    for (const [index, row] of rowsJson.entries()) {
      const values = Object.keys(headerLabels).map((header) => {
        const escaped =
          headerLabels[header] === '#'
            ? index + 1
            : ('' + (row[header] ?? '')).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  async create(dto: CreateReportDto) {
    const report = await this.reportRepository.create({
      ...dto,
    });

    return report;
  }

  async update(id: string, dto: UpdateReportDto) {
    const [rowsUpdated] = await this.reportRepository.update(
      { ...dto },
      {
        where: { id },
      },
    );

    if (rowsUpdated == 0) {
      throw new NotFoundException(`Report not found`);
    }

    return rowsUpdated;
  }

  async fetchOne(id: string) {
    const report = await this.reportRepository.findByPk(id);
    if (!report) {
      throw new NotFoundException(`Report not found`);
    }

    return report;
  }

  async removeOne(id: string) {
    const destroyedRows = await this.reportRepository.destroy({
      where: { id },
    });

    if (destroyedRows == 0) {
      throw new NotFoundException(`No report found`);
    }

    return;
  }
}
