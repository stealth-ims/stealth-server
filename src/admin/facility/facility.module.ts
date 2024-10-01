import { Module } from '@nestjs/common';
import { FacilityService } from './facility.service';
import { FacilityController } from './facility.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Facility } from './models/facility.model';

@Module({
  imports: [SequelizeModule.forFeature([Facility])],
  providers: [FacilityService],
  controllers: [FacilityController],
})
export class FacilityModule {}
