import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../interface/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AUTHORIZE_KEY, IS_PUBLIC_KEY } from '../decorator';
import { InjectModel } from '@nestjs/sequelize';
import { LoginSession } from '../models/login-session.model';
import { IUserPayload } from '../interface/payload.interface';
import { User } from '../models/user.model';
import { isUUID } from 'class-validator';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectModel(LoginSession)
    private loginSessionRepository: typeof LoginSession,
    @InjectModel(User) private userRepository: typeof User,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const authorize = this.reflector.getAllAndOverride<boolean>(AUTHORIZE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!authorize || isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('TOKEN_ABSENT');
    }
    try {
      const decoded: Partial<IUserPayload> = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.jwtConfiguration.secret,
        },
      );
      const payload: IUserPayload = await this.fetchAuthUser(decoded);
      request['user'] = payload;

      if (payload.session) {
        const session = await this.loginSessionRepository.findByPk(
          payload.session,
          {
            attributes: ['id', 'location'],
          },
        );
        if (!session) {
          throw new UnauthorizedException('CLOSED_SESSION');
        }
      }
    } catch (error: any) {
      if (error.message == 'CLOSED_SESSION') {
        throw new UnauthorizedException(error.message);
      } else if (error.name == 'TokenExpiredError') {
        throw new UnauthorizedException('TOKEN_EXPIRED');
      } else {
        if (isUUID(token)) {
          const payload: IUserPayload = await this.fetchAuthUser({
            sub: token,
            session: null,
          });
          request['user'] = payload;
        } else {
          this.logger.error(error);
          throw new UnauthorizedException(error.message);
        }
      }
    }
    return true;
  }

  private async fetchAuthUser(decoded: Partial<IUserPayload>) {
    const loggedInUser = await this.userRepository.findByPk(decoded.sub, {
      attributes: [
        'id',
        'username',
        'email',
        'facilityId',
        'departmentId',
        'role',
        'permissions',
      ],
    });
    if (!loggedInUser) {
      throw new UnauthorizedException('User not found');
    }
    const payload: IUserPayload = {
      sub: loggedInUser.id,
      email: loggedInUser.email,
      username: loggedInUser.username,
      facility: loggedInUser.facilityId,
      department: loggedInUser.departmentId,
      role: loggedInUser.role,
      permissions: loggedInUser.permissions,
      session: decoded.session,
    };
    return payload;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
