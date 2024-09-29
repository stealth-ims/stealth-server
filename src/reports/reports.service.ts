import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Report } from './models/reports.models';
import { CreateReportDto } from './dto/create.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report)
    private reportRepository: typeof Report,
  ) {}

  async createReport(dto: CreateReportDto) {
    return null;
  }

  async fetchAll() {
    return []
  }
}
