import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserAuthModule } from './auth/auth.module';

@Module({
  imports: [UserAuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
