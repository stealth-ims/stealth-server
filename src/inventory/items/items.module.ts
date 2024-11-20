import { Module } from '@nestjs/common';
import { DrugsService } from './items.service';
import { DrugsController } from './items.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Batch, Item } from './models';
import { BatchService } from './batch.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Supplier } from '../suppliers/models/supplier.model';

@Module({
  imports: [SequelizeModule.forFeature([Item, Batch, Supplier])],
  controllers: [DrugsController],
  providers: [DrugsService, BatchService, SuppliersService],
  exports: [DrugsService, BatchService],
})
export class DrugsModule {}
