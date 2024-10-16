import { Module } from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Batch, Drug } from './models';
import { BatchService } from './batch.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Supplier } from '../suppliers/models/supplier.model';

@Module({
  imports: [SequelizeModule.forFeature([Drug, Batch, Supplier])],
  controllers: [DrugsController],
  providers: [DrugsService, BatchService, SuppliersService],
  exports: [DrugsService],
})
export class DrugsModule {}
