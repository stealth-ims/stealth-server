import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountState, User } from './models/user.model';
import { UpdateUserDto } from '../user/dto';
import { LoginDto, LoginTokenDto, RefreshTokenDto, TokenDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './interface/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { IUserPayload } from './interface/payload.interface';
import { MailService } from '../notification/mail/mail.service';
import { randomInt } from 'crypto';
import { add, isAfter } from 'date-fns';
import {
  ChangePasswordDto,
  CheckCodeDto,
  ResetPasswordDto,
  SendForgotPasswordEmailDto,
  ValidateCodeDto,
} from './dto/reset-password.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { LoginSession, StatusType } from './models/login-session.model';
import { Op } from 'sequelize';
import { AdminSignUpDto } from '../user/dto/signup.dto';
import { FacilityService } from '../admin/facility/facility.service';
import { Facility } from '../admin/facility/models/facility.model';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SmsService } from '../notification/sms/sms.service';
import { Department } from 'src/admin/department/models/department.model';

@Injectable()
export class AuthService {
  private SALT_OR_ROUNDS: number = 10;
  private logger: Logger;

  constructor(
    private configService: ConfigService,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(LoginSession)
    private loginSessionRepository: typeof LoginSession,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly mailService: MailService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly facilityService: FacilityService,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
    private readonly smsService: SmsService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async register(dto: AdminSignUpDto, _req: Request) {
    dto.facility.email = dto.email;
    const newFacility = await this.facilityService.create(dto.facility);
    const hashPassword = await bcrypt.hash(dto.password, this.SALT_OR_ROUNDS);
    const { facility: _facility, ...createDto } = dto;
    const user = await this.userRepository.create({
      ...createDto,
      facilityId: newFacility.id,
      role: 'Central Admin',
      permissions: [
        'items:READ_WRITE_DELETE',
        'item_categories:READ_WRITE_DELETE',
        'stock_adjustment:READ_WRITE_DELETE',
        'item_orders:READ_WRITE_DELETE',
        'reports:READ_WRITE_DELETE',
        'suppliers:READ_WRITE_DELETE',
        'sales:READ_WRITE_DELETE',
        'department_requests:READ_WRITE_DELETE',
        'departments:READ_WRITE_DELETE',
        'users:READ_WRITE_DELETE',
      ],
      password: hashPassword,
      status: AccountState.ACTIVE,
    });
    newFacility.createdById = user.id;
    await newFacility.save();

    // await newFacility.update({ createdById: user.id });

    const token = await this.generateTokens(user, null);
    // await this.sendVerificationEmail(user.email, req);
    const expiresAt: number = this.configService.get<number>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.eventEmitter.emit('items.seed', {
      userId: user.id,
      facilityId: newFacility.id,
    });
    // items.seed;
    return new LoginTokenDto(user, token, expiresAt);
    // return createdUser;
  }

  async sendVerificationEmail(email: string, req: Request) {
    const user = await this.fetchUserByEmail(email);
    if (user.status !== AccountState.UNVERIFIED) {
      throw new ForbiddenException('Account cannot be verified');
    }
    const verificationToken = await this.signToken(user.id, 3600, {});
    const fullUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify?token=${verificationToken}`;
    this.sendAccountVerficationMail(
      email,
      user.fullName,
      user.username,
      user.role,
      fullUrl,
    );
    return;
  }

  private async fetchUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: { [Op.iLike]: email } },
      attributes: ['id', 'fullName', 'email', 'role', 'status', 'username'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async verifyAccount(token: string) {
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    try {
      const payload = await this.jwtService.verifyAsync<IUserPayload>(token, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.retrieveUser(payload.sub);

      if (user.status !== AccountState.UNVERIFIED) {
        throw new ForbiddenException('Account cannot be verified');
      }
      user.status = AccountState.ACTIVE;
      user.updatedById = user.id;
      await user.save();
      this.sendAccountCreationConfirmation(
        user.email,
        user.fullName,
        user.username,
        user.role,
      );
      return `<p>Account Verified successfully <a href="${clientUrl}/auth/login">Proceed to login</a></p>`;
    } catch (error) {
      if (error.name == 'TokenExpiredError') {
        const payload = await this.jwtService.verifyAsync<IUserPayload>(token, {
          secret: this.jwtConfiguration.secret,
          ignoreExpiration: true,
        });
        const user = await this.retrieveUser(payload.sub);
        const encodedEmail = btoa(user.email);
        return `<p>Account verification failed.<br /> Token expired Click <a href="${clientUrl}/auth/token-expired/${encodedEmail}">here</a> to request a new one</p>`;
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: dto.accountIdentifier } },
          { username: { [Op.iLike]: dto.accountIdentifier } },
        ],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found. Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    const authorized =
      user.status === AccountState.PENDING ||
      user.status === AccountState.ACTIVE;

    if (user.status === AccountState.UNVERIFIED) {
      throw new UnauthorizedException('Account is not yet verified');
    }
    if (!authorized) {
      throw new UnauthorizedException('Account is not authorized');
    }

    let token: TokenDto;
    if (dto.loginSessionMeta) {
      const sessionData = await this.getSessionDetails(dto, user.id);
      token = await this.generateTokens(user, sessionData.id);
    } else {
      token = await this.generateTokens(user, null);
    }

    const expiresAt: number = this.configService.get<number>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    return new LoginTokenDto(user, token, expiresAt);
  }

  async retrieveUser(userId: string) {
    const user = await this.userRepository.findByPk(userId, {
      include: [
        { model: Facility, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] },
      ],
      attributes: [
        'id',
        'createdAt',
        'updatedAt',
        'username',
        'imageUrl',
        'fullName',
        'email',
        'phoneNumber',
        'departmentId',
        'role',
        'permissions',
        'status',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async retrieveSessions(userId: string) {
    const sessions = await this.loginSessionRepository.findAll({
      where: { userId },
      attributes: [
        'id',
        'browser',
        'location',
        'activity',
        'status',
        'updatedAt',
      ],
    });
    const response = sessions.map((session: LoginSession) => {
      const { id, browser, location, activity } = session.get({ plain: true });
      return { id, browser, location, activity };
    });
    return response;
  }

  async delete(userId: string) {
    return { message: `user ${userId} deleted` };
  }

  async refreshToken(token: string) {
    const payload: IUserPayload = await this.jwtService.verifyAsync(token, {
      secret: this.jwtConfiguration.secret,
    });
    const expiresAt: number = this.configService.get<number>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    const user = await this.userRepository.findByPk(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (payload.session) {
      const loginSession = await this.loginSessionRepository.findByPk(
        payload.session,
      );
      loginSession.status = StatusType.ACTIVE;
      loginSession.updatedById = payload.sub;
      await loginSession.save();

      return new RefreshTokenDto(
        (await this.generateTokens(user, payload.session)).accessToken,
        expiresAt,
      );
    } else {
      return new RefreshTokenDto(
        (await this.generateTokens(user, null)).accessToken,
        expiresAt,
      );
    }
  }

  async sendResetPasswordCode(dto: SendForgotPasswordEmailDto) {
    let user: User;
    if (dto.email) {
      user = await this.userRepository.findOne({
        where: { username: { [Op.iLike]: dto.username }, email: dto.email },
      });
      if (!user) {
        throw new NotFoundException('user with this email not found');
      }
    } else if (dto.phoneNumber) {
      user = await this.userRepository.findOne({
        where: {
          username: { [Op.iLike]: dto.username },
          phoneNumber: dto.phoneNumber,
        },
      });
      if (!user) {
        throw new NotFoundException('user with this phone number not found');
      }
    } else {
      throw new NotFoundException(
        'Provide either an email or phone number to proceed',
      );
    }

    const code = await this.generateCode(user);

    if (dto.email) {
      this.sendForgotPasswordMail(dto.email, code);
    }
    if (dto.phoneNumber) {
      await this.sendForgotPasswordSms(dto.phoneNumber, code);
    }

    return true;
  }

  async sendChangeEmailCode(mail: string, userId: string) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('user with this email not found');
    }
    const code = await this.generateCode(user);

    this.sendVerificationCodeMail(mail, user.fullName, code);

    return true;
  }

  async checkCode(dto: ValidateCodeDto) {
    const { username, code } = dto;
    const user = await this.userRepository.findOne({
      where: { username: { [Op.iLike]: username } },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const codeExpired = isAfter(new Date(), user.resetCodeExpires);
    if (codeExpired) {
      throw new GoneException('Code has expired');
    }

    const codeMatch = await bcrypt.compare(code.toString(), user.resetCode);
    if (!codeMatch) {
      throw new BadRequestException('Pin entered is incorrect');
    }
    return true;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { username, newPassword } = dto;

    const user = await this.userRepository.findOne({
      where: { username: { [Op.iLike]: username } },
    });
    if (!user) {
      throw new NotFoundException('user with this email not found');
    }
    if (!user.resetCodeExpires || !user.resetCode) {
      throw new ForbiddenException(
        'Forbidden. A code is required in order to reset the password',
      );
    }
    const passwordMatch = await bcrypt.compare(newPassword, user.password);
    if (passwordMatch) {
      throw new BadRequestException('Invalid. Password already exists.');
    }

    const newHashedPassword = await bcrypt.hash(
      newPassword,
      this.SALT_OR_ROUNDS,
    );
    user.password = newHashedPassword;
    user.resetCodeExpires = null;
    user.updatedById = user.id;
    await user.save();

    if (user.email) {
      this.sendResetPasswordConfirmation(user.email);
    }
    return true;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const { fullName, phoneNumber } = dto;

    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.update({ ...{ fullName, phoneNumber } });
    return;
  }

  async verifychangeEmailCode(dto: CheckCodeDto, userId: string) {
    const { email, code } = dto;
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const codeExpired = isAfter(new Date(), user.resetCodeExpires);
    if (codeExpired) {
      throw new GoneException('OTP has expired');
    }

    const codeMatch = await bcrypt.compare(code.toString(), user.resetCode);
    if (!codeMatch) {
      throw new BadRequestException('OTP entered is incorrect');
    }
    user.email = email;
    user.resetCodeExpires = null;
    user.updatedById = user.id;
    await user.save();
    this.sendChangeEmailConfirmation(email, user.fullName);

    return;
  }

  async uploadUserPicture(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.imageId) {
      await this.cloudinaryService.deleteFile(user.imageId);
    }
    const uploadImage = await this.cloudinaryService.uploadFile(file);
    user.imageId = uploadImage.public_id;
    user.imageUrl = uploadImage.secure_url;
    user.updatedById = user.id;
    await user.save();

    return;
  }

  async deletePicture(userId: string) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.imageId || !user.imageUrl) {
      throw new NotFoundException('No image present');
    }

    await this.cloudinaryService.deleteFile(user.imageId);
    user.imageId = null;
    user.imageUrl = null;
    user.updatedById = user.id;
    await user.save();

    return;
  }

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const { oldPassword, newPassword } = dto;
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const passwordMatch = await bcrypt.compare(newPassword, user.password);

    if (oldPassword) {
      const oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!oldPasswordMatch) {
        throw new BadRequestException('Old password is invalid');
      }
    }

    if (passwordMatch) {
      throw new BadRequestException('Invalid. Password already exists');
    }

    const newHashedPassword = await bcrypt.hash(
      newPassword,
      this.SALT_OR_ROUNDS,
    );
    user.password = newHashedPassword;

    if (user.status != AccountState.ACTIVE) {
      user.status = AccountState.ACTIVE;
    }
    user.updatedById = user.id;
    await user.save();

    this.sendchangePasswordEmail(user.email);
    return;
  }

  async removeSession(id: string, deletedBy: string) {
    const session = await this.loginSessionRepository.destroy({
      where: { id },
      userId: deletedBy,
    } as any);
    if (session == 0) {
      throw new NotFoundException('Session not found');
    }
    return;
  }

  //TODO:: implement settings that allow you to set notification and email preferences
  //TODO:: implement endpoint that lists all sessions and devices the user has had sessions on.

  private async getSessionDetails(dto: LoginDto, userId: string) {
    const location = await this.getLocation(
      dto.loginSessionMeta.locationBody.latitude,
      dto.loginSessionMeta.locationBody.longitude,
    );

    const loginSession = await this.loginSessionRepository.update(
      { status: StatusType.ACTIVE },
      {
        where: {
          [Op.and]: { browser: dto.loginSessionMeta.browser, location },
        },
      },
    );

    let sessionData: LoginSession;

    if (loginSession[0] == 0) {
      sessionData = await this.loginSessionRepository.create({
        userId,
        browser: dto.loginSessionMeta.browser,
        location,
      });
    } else {
      sessionData = await this.loginSessionRepository.findOne({
        where: {
          [Op.and]: { browser: dto.loginSessionMeta.browser, location },
        },
      });
    }

    const tokenExpiresAt =
      this.configService.get<number>('JWT_ACCESS_TOKEN_TTL') * 1000;
    setTimeout(
      async (loginSessionRepository, browser, location, logger) => {
        logger.log('updating');
        await loginSessionRepository.update(
          { status: StatusType.INACTIVE },
          {
            where: {
              browser,
              location,
            },
          },
        );
        logger.log('updating done');
      },
      tokenExpiresAt,
      this.loginSessionRepository,
      dto.loginSessionMeta.browser,
      location,
      this.logger,
    );
    return sessionData;
  }
  private async getLocation(latitude: string, longitude: string) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const request = await firstValueFrom(this.httpService.get(url));

      const response = request.data;

      if (response.address) {
        const address = `${response.address.town}, ${response.address.city}, ${response.address.country_code.toUpperCase()}`;
        return address;
      } else {
        throw new InternalServerErrorException('No results found');
      }
    } catch (error) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
      return 'GH';
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: expiresIn,
      },
    );
  }

  private async generateCode(user: User) {
    const code = randomInt(10000, 100000);
    const hashCode = await bcrypt.hash(code.toString(), this.SALT_OR_ROUNDS);
    user.resetCode = hashCode;
    user.resetCodeExpires = add(new Date(), { minutes: 15 });
    user.updatedById = user.id;
    await user.save();
    return code;
  }

  private async generateTokens(user: User, sessionId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<IUserPayload>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          session: sessionId,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        session: sessionId,
      }),
    ]);
    return new TokenDto(accessToken, refreshToken);
  }

  private sendAccountVerficationMail(
    mail: string,
    fullName: string,
    username: string,
    role: string,
    verificationUrl: string,
  ) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Account Verification - Stealth',
      template: './signUpVerification',
      context: {
        email: mail,
        fullName,
        username,
        role,
        verificationUrl,
      },
    };

    this.mailService.send(email);
  }
  private sendAccountCreationConfirmation(
    mail: string,
    fullName: string,
    username: string,
    role: string,
  ) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Account Creation Successful - Stealth',
      template: './signupConfirmation',
      context: {
        email: mail,
        fullName,
        username,
        role,
      },
    };

    this.mailService.send(email);
  }

  private sendForgotPasswordMail(mail: string, code: number) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Forgot Password - Stealth',
      template: './passwordReset',
      context: {
        email: mail,
        code,
      },
    };

    this.mailService.send(email);
  }

  private async sendForgotPasswordSms(phoneNumber: string, code: number) {
    await this.smsService.sendSms({
      body: `Your Stealth-IMS Reset Code is ${code}. It expires in 30 minutes one-time use only. Inyabon Medsync`,
      to: phoneNumber,
    });
  }

  private sendResetPasswordConfirmation(mail: string) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Password Reset Confirmation - Stealth',
      template: './passwordResetConfirmation',
      context: {
        email: mail,
      },
    };

    this.mailService.send(email);
  }

  private sendVerificationCodeMail(
    mail: string,
    fullName: string,
    code: number,
  ) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Email OTP - Stealth',
      template: './emailVerificationCode',
      context: {
        fullName,
        code,
      },
    };

    this.mailService.send(email);
  }

  private sendChangeEmailConfirmation(mail: string, fullName: string) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Change Email Confirmation - Stealth',
      template: './emailChangeConfirmation',
      context: {
        fullName,
        email: mail,
      },
    };

    this.mailService.send(email);
  }
  private sendchangePasswordEmail(mail: string) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Change Password Confirmation - Stealth',
      template: './passwordResetConfirmation',
      context: {
        email: mail,
      },
    };

    this.mailService.send(email);
  }
}
