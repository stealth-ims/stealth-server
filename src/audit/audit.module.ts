import { Module } from '@nestjs/common';
import { AuditsService } from './audit.service';
import { AuditsController } from './audit.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditModels } from './models';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { User } from '../auth/models/user.model';
import { Facility } from '../admin/facility/models/facility.model';
import { Department } from '../admin/department/models/department.model';
import { AuditsExportsService } from './exports.service';

@Module({
  imports: [
    SequelizeModule.forFeature([...AuditModels, User, Facility, Department]),
  ],
  controllers: [AuditsController],
  providers: [
    AuditsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    AuditsExportsService,
  ],
})
export class AuditsModule {}
