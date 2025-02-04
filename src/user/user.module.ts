import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../auth/models/user.model';
import { Settings } from './models/setting.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Settings])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
