import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { IndexModels } from './core/shared/models/index.models';
import { IndexModules } from './core/shared/modules/index.modules';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'development' ? false : true,
      dialectOptions: {
        statement_timeout: 20000,
        application_name: 'nestjs-app',
        ssl:
          process.env.NODE_ENV === 'development'
            ? false
            : {
                require: false,
                rejectUnauthorized: false,
              },
      },
      autoLoadModels: false,
      synchronize: false,
      pool: {
        max: 20,
        min: 2,
        acquire: 30000,
        idle: 10000,
        evict: 1000,
      },
      logging: console.log,
      models: [...IndexModels],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          family: 0,
          url: configService.get('REDIS_URL'),
          tls: configService.get<boolean>('QUEUE_TLS'),
        },
      }),
      inject: [ConfigService],
    }),

    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ...IndexModules,
  ],
  controllers: [AppController],
})
export class AppModule {}
