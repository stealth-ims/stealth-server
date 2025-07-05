import { Module } from '@nestjs/common';
import { BatchExistsRule } from '../../../core/shared/validators';
import { BatchService } from './batch.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Batch, Item, Markup } from '../models';
import { SuppliersModule } from '../../suppliers/suppliers.module';
import { MarkupModule } from '../markup/markup.module';
import { BatchesController } from './batches.controller';
import { BatchesExportsService } from './exports.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Batch, Item, Markup]),
    SuppliersModule,
    MarkupModule,
  ],
  providers: [BatchService, BatchExistsRule, BatchesExportsService],
  exports: [BatchService],
  controllers: [BatchesController],
})
export class BatchesModule {}
