import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../auth/models/user.model';
import { Settings } from './models/setting.model';
import { UserSettingsController } from './user-settings.controller';
import { UsersController } from './users.controller';
import { Facility } from '../admin/facility/models/facility.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Settings, Facility])],
  controllers: [UserSettingsController, UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
