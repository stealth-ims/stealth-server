import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportModels } from './models';

@Module({
  imports: [SequelizeModule.forFeature(ReportModels)],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
