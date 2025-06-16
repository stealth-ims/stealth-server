import { Module } from '@nestjs/common';
import { MarkupService } from './markup.service';
import { MarkupController } from './markup.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Batch, Markup } from '../models';

@Module({
  imports: [SequelizeModule.forFeature([Batch, Markup])],
  controllers: [MarkupController],
  providers: [MarkupService],
  exports: [MarkupService],
})
export class MarkupModule {}
