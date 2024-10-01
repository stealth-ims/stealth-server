import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Department } from './models/department.model';

@Module({
  imports: [SequelizeModule.forFeature([Department])],
  providers: [DepartmentService],
  controllers: [DepartmentController],
})
export class DepartmentModule {}
