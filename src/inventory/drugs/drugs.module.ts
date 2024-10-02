import { Module } from '@nestjs/common';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Drug } from './models/drug.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';
import { DrugsCategory } from '../drugs-category/models/drugs-category.model';
import { Supplier } from '../suppliers/models/supplier.model';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/interface/jwt.config';
import { FacilityService } from 'src/admin/facility/facility.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { Facility } from 'src/admin/facility/models/facility.model';
import { Department } from 'src/admin/department/models/department.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Drug,
      DrugsCategory,
      Supplier,
      Facility,
      Department,
    ]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [DrugsController],
  providers: [
    DrugsService,
    SuppliersService,
    DrugsCategoryService,
    FacilityService,
    DepartmentService,
  ],
})
export class DrugsModule {}
