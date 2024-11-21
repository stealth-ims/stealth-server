import { Module } from '@nestjs/common';
import { ItemService } from './items.service';
import { ItemController } from './items.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Batch, Item } from './models';
import { BatchService } from './batch.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { Supplier } from '../suppliers/models/supplier.model';

@Module({
  imports: [SequelizeModule.forFeature([Item, Batch, Supplier])],
  controllers: [ItemController],
  providers: [ItemService, BatchService, SuppliersService],
  exports: [ItemService, BatchService],
})
export class ItemsModule {}
