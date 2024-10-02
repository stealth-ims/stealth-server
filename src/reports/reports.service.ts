import { Injectable, NotFoundException } from '@nestjs/common';
import { Report } from './models/reports.models';
import { CreateReportDto } from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';
import { GetReportDto } from './dto/get.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report) private reportRepository: typeof Report) {}

  async fetchAll() {
    const reports = await this.reportRepository.findAll();

    return reports.map((report) => new GetReportDto(report));
  }

  async create(dto: CreateReportDto) {
    const report = await this.reportRepository.create({
      ...dto,
    });

    return new GetReportDto(report);
  }

  async fetchOne(id: string) {
    const report = await this.reportRepository.findByPk(id);
    if (!report) {
      throw new NotFoundException(`No report found`);
    }

    return new GetReportDto(report);
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
