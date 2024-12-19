import { Module } from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import { DepartmentRequestsController } from './department-requests.controller';
import { DepartmentRequest } from './models/department-requests.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ItemsModule } from 'src/inventory/items/items.module';
import { DepartmentModule } from 'src/admin/department/department.module';
import { ItemRequestsController } from './item-requests.controller';
import { FacilityModule } from '../admin/facility/facility.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DepartmentRequest]),
    ItemsModule,
    DepartmentModule,
    FacilityModule,
  ],
  controllers: [DepartmentRequestsController, ItemRequestsController],
  providers: [DepartmentRequestsService],
})
export class DepartmentRequestsModule {}
