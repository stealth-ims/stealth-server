import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Department } from './models/department.model';
import { DepartmentExistsRule } from '../../core/shared/validators';

@Module({
  imports: [SequelizeModule.forFeature([Department])],
  providers: [DepartmentService, DepartmentExistsRule],
  controllers: [DepartmentController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
