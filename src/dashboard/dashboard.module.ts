import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SaleItem } from 'src/sales/models/sale-items.model';

@Module({
  imports: [SequelizeModule.forFeature([SaleItem])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
