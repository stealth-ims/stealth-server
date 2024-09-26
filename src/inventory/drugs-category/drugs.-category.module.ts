import { Module } from '@nestjs/common';
import { DrugsCategoryService } from './drugs-category.service';
import { DrugsCategoryController } from './drugs-category.controller';

@Module({
  controllers: [DrugsCategoryController],
  providers: [DrugsCategoryService],
})
export class DrugsCategoryModule { }
