import {
  Features,
  PermissionLevel,
} from '../../core/shared/enums/permissions.enum';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, PermissionBody } from '../decorator';
import { IUserPayload } from '../interface/payload.interface';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User) private userRepository: typeof User,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<PermissionBody>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermission) {
      return true;
    }
    const { feature, level } = requiredPermission;
    const user: IUserPayload = context.switchToHttp().getRequest()['user'];
    const loggedInUser = await this.userRepository.findByPk(user.sub, {
      attributes: ['id', 'permissions'],
    });

    const hasPermission = loggedInUser.permissions.some(
      (permission: string) => {
        const [permissionFeature, access_level] = permission.split(':');
        return (
          (permissionFeature as Features) === feature &&
          this.isPermissionSufficient(access_level as PermissionLevel, level)
        );
      },
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private isPermissionSufficient(
    userLevel: PermissionLevel,
    requiredLevel: PermissionLevel,
  ): boolean {
    const levels = [
      PermissionLevel.READ,
      PermissionLevel.READ_WRITE,
      PermissionLevel.READ_WRITE_DELETE,
    ];
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  }
}
