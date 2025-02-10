import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SalesModels } from './models';
import { ItemsModule } from '../inventory/items/items.module';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [
    SequelizeModule.forFeature(SalesModels),
    ItemsModule,
    PatientModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
