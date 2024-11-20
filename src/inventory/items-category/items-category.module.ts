import { Module } from '@nestjs/common';
import { ItemCategoryService } from './items-category.service';
import { ItemCategoryController } from './items-category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemCategory } from './models/items-category.model';

@Module({
  imports: [SequelizeModule.forFeature([ItemCategory])],
  controllers: [ItemCategoryController],
  providers: [ItemCategoryService],
})
export class ItemsCategoryModule {}
