import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { IndexModels } from './core/shared/models/index.models';
import { IndexModules } from './core/shared/modules/index.modules';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { AuditsModule } from './audit/audit.module';
import { AppController } from './app.controller';

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
      logging: false,
      models: [...IndexModels],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    HealthModule,
    AuditsModule,
    ...IndexModules,
  ],
  controllers: [AppController],
})
export class AppModule {}
