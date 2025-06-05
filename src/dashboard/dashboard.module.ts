import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sale } from 'src/sales/models/sales.model';

@Module({
  imports: [SequelizeModule.forFeature([Sale])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
