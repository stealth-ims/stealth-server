import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { CreateUserDto } from '../user/dto';
import { LoginDto, LoginTokenDto, TokenDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './interface/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { IUserPayload } from './interface/payload.interface';
import { MailService } from '../notification/mail/mail.service';
import { randomInt } from 'crypto';
import { add, isAfter } from 'date-fns';
import { CheckCodeDto, ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private SALT_OR_ROUNDS: number = 10;
  constructor(
    private configService: ConfigService,
    @InjectModel(User) private userRepository: typeof User,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly mailService: MailService,
  ) {}

  async register(dto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(dto.password, this.SALT_OR_ROUNDS);
    const user = await this.userRepository.create({
      ...dto,
      password: hashPassword,
    });
    const createdUser = await this.userRepository.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });
    return createdUser;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found. Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (user.status != 'ACTIVE') {
      throw new UnauthorizedException('Account has been deactivated');
    }
    if (!user.accountApproved) {
      throw new ForbiddenException('User has not been approved by admin');
    }

    const token = await this.generateTokens(user);
    return new LoginTokenDto(user, token);
  }

  async retrieveUser(userId: string) {
    const user = await this.userRepository.findByPk(userId, {
      attributes: {
        exclude: ['password', 'deactivatedBy', 'deletedAt', 'deletedBy'],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async delete(userId: string) {
    console.log(userId);
    return { message: 'user deleted' };
  }

  async refreshToken(userId: string) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.generateTokens(user);
  }

  async sendResetPasswordCode(mail: string) {
    const user = await this.userRepository.findOne({
      where: { email: mail },
    });
    if (!user) {
      throw new NotFoundException('user with this email not found');
    }
    const code = randomInt(1000, 10000);
    const hashCode = await bcrypt.hash(code.toString(), this.SALT_OR_ROUNDS);
    user.passwordResetCode = hashCode;
    user.passwordResetExpires = add(new Date(), { minutes: 11 });
    await user.save();

    this.sendForgotPasswordMail(mail, code);
    return true;
  }

  async checkCode(dto: CheckCodeDto) {
    const { email, code } = dto;
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('user with this email not found');
    }
    const codeExpired = isAfter(new Date(), user.passwordResetExpires);
    if (codeExpired) {
      throw new GoneException('code has expired');
    }

    const codeMatch = await bcrypt.compare(
      code.toString(),
      user.passwordResetCode,
    );
    if (!codeMatch) {
      throw new BadRequestException('Pin entered is incorrect');
    }
    return true;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, newPassword } = dto;

    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('user with this email not found');
    }
    if (!user.passwordResetExpires || !user.passwordResetCode) {
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
    user.passwordResetExpires = null;
    await user.save();

    this.sendResetPasswordConfirmation(email);
    return true;
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
        expiresIn: this.jwtConfiguration.accessTokenTtl ?? expiresIn,
      },
    );
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<IUserPayload>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          facility: user.facility,
          department: user.department,
          role: user.role,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);
    return new TokenDto(accessToken, refreshToken);
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
}
