import { Global, Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { NotificationService } from './notification.service';
import { NotificationsGateway } from './gateway/notification.gateway';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth/interface/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { NotificationModel } from './models/notification.model';
import { User } from '../auth/models/user.model';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([NotificationModel, User]),
    MailModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [NotificationsGateway, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
