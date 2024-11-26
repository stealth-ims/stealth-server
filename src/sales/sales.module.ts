import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { DrugsModule } from 'src/inventory/drugs/drugs.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalesModels } from './models';

@Module({
  imports: [SequelizeModule.forFeature(SalesModels), DrugsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
