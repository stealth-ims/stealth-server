import { Module } from '@nestjs/common';
import { DrugsCategoryService } from './drugs-category.service';
import { DrugsCategoryController } from './drugs-category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { DrugsCategory } from './models/drugs-category.model';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/auth/interface/jwt.config';

@Module({
  imports: [
    SequelizeModule.forFeature([DrugsCategory]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [DrugsCategoryController],
  providers: [DrugsCategoryService],
})
export class DrugsCategoryModule {}
