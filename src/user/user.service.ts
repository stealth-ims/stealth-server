import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../auth/models/user.model';
import { Facility } from '../admin/facility/models/facility.model';
import { CreateSettingsDto } from './dto';
import { Settings } from './models/setting.model';
import { buildQuery } from '../core/shared/factory/query-builder.factory';
import { QueryOptionsDto } from '../core/shared/dto/query-options.dto';
import { IncludeOptions } from 'sequelize';
import { Department } from '../admin/department/models/department.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Settings) private settingsRepository: typeof Settings,
  ) {}

  private populates: Record<string, IncludeOptions> = {
    department: { model: Department, attributes: ['id', 'name'] },

    facility: { model: Facility, attributes: ['id', 'name'] },
  };

  async findOne(userId: string) {
    const user = await this.userRepository.findByPk(userId, {
      include: [{ model: Facility, attributes: ['id', 'name'] }],
      attributes: [
        'id',
        'createdAt',
        'updatedAt',
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

  async fetchOne(options?: QueryOptionsDto<User>) {
    const queryOptions = buildQuery<User>(options, this.populates);
    const user = await this.userRepository.findOne(queryOptions);
    // if (!user) {
    //   throw new NotFoundException('User not found');
    // }
    return user;
  }

  async addSettings(dto: CreateSettingsDto, userId: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      const settings = await this.findSettings(userId);
      await settings.update({ ...dto });
    } catch {
      await this.settingsRepository.create({
        ...dto,
        userId,
      });
    }

    return;
  }

  async findSettings(userId: string) {
    const settings = await this.settingsRepository.findOne({
      where: { userId },
      attributes: [
        'id',
        'emailDepartmentRequests',
        'emailItemLowStocks',
        'emailItemOutOfStock',
      ],
    });
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    return settings;
  }
}
