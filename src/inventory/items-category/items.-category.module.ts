import { Module } from '@nestjs/common';
import { DrugsCategoryService } from './items-category.service';
import { DrugsCategoryController } from './items-category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemCategory } from './models/items-category.model';

@Module({
  imports: [SequelizeModule.forFeature([ItemCategory])],
  controllers: [DrugsCategoryController],
  providers: [DrugsCategoryService],
})
export class DrugsCategoryModule {}
