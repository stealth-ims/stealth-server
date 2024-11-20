import { Module } from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import { DepartmentRequestsController } from './department-requests.controller';
import { DepartmentRequest } from './models/department-requests.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { DrugsModule } from 'src/inventory/items/items.module';
import { DepartmentModule } from 'src/admin/department/department.module';

@Module({
  imports: [
    SequelizeModule.forFeature([DepartmentRequest]),
    DrugsModule,
    DepartmentModule,
  ],
  controllers: [DepartmentRequestsController],
  providers: [DepartmentRequestsService],
})
export class DepartmentRequestsModule {}
