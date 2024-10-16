import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DepartmentModule } from './department/department.module';
import { FacilityModule } from './facility/facility.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../auth/models/user.model';
import { DepartmentService } from './department/department.service';
import { AdminModels } from './models';

@Module({
  imports: [
    DepartmentModule,
    FacilityModule,
    SequelizeModule.forFeature([User, ...AdminModels]),
  ],
  controllers: [AdminController],
  providers: [AdminService, DepartmentService],
})
export class AdminModule {}
