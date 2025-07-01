import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        accountSid: cfg.get('TWILIO_ACCOUNT_SID'),
        authToken: cfg.get('TWILIO_AUTH_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        baseURL: 'https://sms.arkesel.com/api/v2',
        headers: { 'api-key': cfg.get<string>('ARK_API_KEY') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
