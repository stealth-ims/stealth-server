import { Injectable, NotFoundException } from '@nestjs/common';
import { Report } from './models/reports.models';
import { CreateReportDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report) private reportRepository: typeof Report) {}

  async fetchAll() {
    const reports = await this.reportRepository.findAll();

    return reports;
  }

  async create(dto: CreateReportDto) {
    const report = await this.reportRepository.create({
      ...dto,
    });

    return report;
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
  }
}
