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
import { SmsModule } from './sms/sms.module';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([NotificationModel, User]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MailModule,
    SmsModule,
  ],
  providers: [NotificationsGateway, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService, SmsModule],
})
export class NotificationModule {}
