// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
// import { User } from './models/user.model';
// import { configuration } from '../shared/config/config';
// import { ConfigModule } from '@nestjs/config';
// import jwtConfig from './interface/jwt.config';
// import { JwtModule } from '@nestjs/jwt';
// import { MailService } from '../notification/mail/mail.service';

// describe('AuthController', () => {
//   let controller: AuthController;

//   beforeAll(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [
//         SequelizeModule.forRoot(configuration.test as SequelizeModuleOptions),
//         SequelizeModule.forFeature([User]),
//         ConfigModule.forFeature(jwtConfig),
//         JwtModule.registerAsync(jwtConfig.asProvider()),
//       ],
//       controllers: [AuthController],
//       providers: [AuthService, MailService],
//     }).compile();
//     controller = module.get<AuthController>(AuthController);
//   });

//   it('controller should be defined', () => {
//     expect(controller).toBeDefined();
//   });
//   it.todo('should run');
// });

describe('FreeController', () => {
  it.todo('should');
});
