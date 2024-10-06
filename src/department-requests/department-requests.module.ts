import { Module } from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import { DepartmentRequestsController } from './department-requests.controller';

@Module({
  controllers: [DepartmentRequestsController],
  providers: [DepartmentRequestsService],
})
export class DepartmentRequestsModule {}
