import { Module } from '@nestjs/common';
import { ItemService } from './items.service';
import { ItemController } from './items.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Batch, Item, Markup } from './models';
import { Supplier } from '../suppliers/models/supplier.model';
import { User } from '../../auth/models/user.model';
import { ItemExistsRule } from '../../core/shared/validators';
import { BatchesModule } from './batches/batches.module';
import { BatchService } from './batches/batch.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { NotificationModule } from '../../notification/notification.module';
import { MarkupModule } from './markup/markup.module';
import { MarkupService } from './markup/markup.service';
import { ItemExportsService } from './exports.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Item, Batch, Supplier, User, Markup]),
    BatchesModule,
    SuppliersModule,
    NotificationModule,
    MarkupModule,
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    BatchService,
    ItemExistsRule,
    MarkupService,
    ItemExportsService,
  ],
  exports: [ItemService, BatchService, MarkupService],
})
export class ItemsModule {}
