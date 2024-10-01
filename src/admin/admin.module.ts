import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DepartmentModule } from './department/department.module';
import { FacilityModule } from './facility/facility.module';

@Module({
  imports: [DepartmentModule, FacilityModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
