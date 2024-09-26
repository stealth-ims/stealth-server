import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { CreateUserDto } from '../user/dto';
import { LoginDto, LoginTokenDto, RefreshTokenDto, TokenDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './interface/jwt.config';
import { ConfigType } from '@nestjs/config';
import { IUserPayload } from './interface/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async register(dto: CreateUserDto) {
    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(dto.password, saltOrRounds);
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

  async refreshToken(dto: RefreshTokenDto) {
    const { sub } = await this.jwtService.verifyAsync<
      Pick<IUserPayload, 'sub'>
    >(dto.refreshToken, {
      secret: this.jwtConfiguration.secret,
      audience: this.jwtConfiguration.audience,
      issuer: this.jwtConfiguration.issuer,
    });
    const user = await this.userRepository.findByPk(sub);
    return this.generateTokens(user);
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
}
