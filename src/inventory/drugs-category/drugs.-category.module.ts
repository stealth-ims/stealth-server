import { Module } from '@nestjs/common';
import { DrugsCategoryService } from './drugs-category.service';
import { DrugsCategoryController } from './drugs-category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { DrugsCategory } from './models/drugs-category.model';

@Module({
  imports: [
    SequelizeModule.forFeature([DrugsCategory])
  ],
  controllers: [DrugsCategoryController],
  providers: [DrugsCategoryService],
})
export class DrugsCategoryModule {}
