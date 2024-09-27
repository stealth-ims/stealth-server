import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Report } from './models/reports.models';
import { CreateReportDto } from './dto/create.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report) private reportRepository: typeof Report) {}

  async createReport(dto: CreateReportDto) {
    const report = await this.reportRepository.create(dto);


    return report
  }
}
