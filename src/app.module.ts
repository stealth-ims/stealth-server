import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { IndexModels } from './shared/models/index.models';
import { IndexModules } from './shared/modules/index.modules';
import { DepartmentRequestsModule } from './department-requests/department-requests.module';

const NODE_ENV = process.env.NODE_ENV || 'development';
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
      ssl: NODE_ENV === 'development' ? false : true,
      dialectOptions: {
        ssl:
          NODE_ENV === 'development'
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
    ...IndexModules,
    DepartmentRequestsModule,
  ],
})
export class AppModule {}
