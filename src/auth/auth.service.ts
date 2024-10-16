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
import { AccountState, User } from './models/user.model';
import { CreateUserDto, UpdateUserDto } from '../user/dto';
import { LoginDto, LoginTokenDto, TokenDto } from './dto';
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
} from './dto/reset-password.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async register(dto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(dto.password, this.SALT_OR_ROUNDS);
    const user = await this.userRepository.create({
      ...dto,
      password: hashPassword,
    });
    const createdUser = await this.userRepository.findByPk(user.id, {
      attributes: [
        'id',
        'createdAt',
        'updatedAt',
        'imageUrl',
        'fullName',
        'email',
        'phoneNumber',
        'facilityId',
        'departmentId',
        'role',
        'accountApproved',
        'status',
      ],
    });
    this.sendAccountCreationConfirmation(
      dto.email,
      dto.fullName,
      dto.role
        .replace('_', ' ')
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' '),
    );
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

    const authorized =
      user.status === AccountState.ACCEPTED ||
      user.status === AccountState.ACTIVE;

    if (!authorized) {
      throw new UnauthorizedException('Account is not authorized');
    }
    if (!user.accountApproved) {
      throw new ForbiddenException('User has not been approved by admin');
    }

    const token = await this.generateTokens(user);
    if (user.status != AccountState.ACTIVE) {
      user.status = AccountState.ACTIVE;
      await user.save();
    }
    return new LoginTokenDto(user, token);
  }

  async retrieveUser(userId: string) {
    const user = await this.userRepository.findByPk(userId, {
      attributes: [
        'id',
        'createdAt',
        'updatedAt',
        'imageUrl',
        'fullName',
        'email',
        'phoneNumber',
        'facilityId',
        'departmentId',
        'role',
        'accountApproved',
        'status',
      ],
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
    const code = await this.generateCode(user);

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
    const codeExpired = isAfter(new Date(), user.resetCodeExpires);
    if (codeExpired) {
      throw new GoneException('code has expired');
    }

    const codeMatch = await bcrypt.compare(code.toString(), user.resetCode);
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
    await user.save();

    this.sendResetPasswordConfirmation(email);
    return true;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const { fullName, phoneNumber } = dto;

    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const code = await this.generateCode(user);

      this.sendVerificationCodeMail(dto.email, user.fullName, code);
    }
    await this.userRepository.update(
      { ...{ fullName, phoneNumber } },
      { where: { id: userId } },
    );
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

    await user.save();

    return;
  }

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const { newPassword } = dto;
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
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
    await user.save();
    this.sendchangePasswordEmail(user.email);
    return;
  }

  //TODO:: implement settings that allow you to set notification and email preferences
  //TODO:: implement endpoint that lists all sessions and devices the user has had sessions on.

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

  private async generateCode(user: User) {
    const code = randomInt(10000, 100000);
    const hashCode = await bcrypt.hash(code.toString(), this.SALT_OR_ROUNDS);
    user.resetCode = hashCode;
    user.resetCodeExpires = add(new Date(), { minutes: 11 });
    await user.save();
    return code;
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<IUserPayload>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          facility: user.facilityId,
          department: user.departmentId,
          role: user.role,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);
    return new TokenDto(accessToken, refreshToken);
  }

  private sendAccountCreationConfirmation(
    mail: string,
    fullName: string,
    role: string,
  ) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject:
        'Account Creation Successful - Awaiting Admin Approval - Stealth',
      template: './signupConfirmation',
      context: {
        email: mail,
        fullName,
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
