import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SyncModels } from './models';
import { BullModule } from '@nestjs/bullmq';
import { SyncConsumer } from './sync.consumer';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../auth/models/user.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([...SyncModels, User]),
    BullModule.registerQueue({
      name: 'sync',
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const stagingUrl = configService.get<string>('STAGING_URL');
        const domain = configService.get<string>('JWT_TOKEN_ISSUER');
        const baseURL = stagingUrl ?? `https://${domain}`;

        return {
          baseURL,
        };
      },
      inject: [ConfigService],
    }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [SyncController],
  providers: [SyncService, SyncConsumer],
})
export class SyncModule {}
