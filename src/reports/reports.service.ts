import { Injectable } from '@nestjs/common';
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

  async fetchOne(_: Report['id']) {
    return null;
  }

  async removeOne(_: Report['id']) {
    return null;
  }
}
