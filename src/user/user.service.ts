import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../auth/models/user.model';
import { Facility } from '../admin/facility/models/facility.model';
import { CreateSettingsDto, FindUserDto } from './dto';
import { Settings } from './models/setting.model';
import { buildQuery } from '../core/shared/factory/query-builder.factory';
import { QueryOptionsDto } from '../core/shared/dto/query-options.dto';
import { IncludeOptions, Op, QueryTypes, WhereOptions } from 'sequelize';
import { Department } from '../admin/department/models/department.model';
import { Sequelize } from 'sequelize-typescript';
import { ExpiredAlert } from '../inventory/items/batches/dto';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';
import { Features } from '../core/shared/enums/permissions.enum';
import { CreateNotificationDto } from '../notification/dto';
import { NotificationStatus } from '../notification/enum';
import { MailService } from '../notification/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { IUserPayload } from '../auth/interface/payload.interface';
import { UpdateExpiryIntervalDto } from '../admin/facility/dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Settings) private settingsRepository: typeof Settings,
    @InjectModel(Facility) private facilityRepository: typeof Facility,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly sequelize: Sequelize,
  ) {}

  private populates: Record<string, IncludeOptions> = {
    department: { model: Department, attributes: ['id', 'name'] },

    facility: { model: Facility, attributes: ['id', 'name'] },
  };

  async findNoPaginate(query: FindUserDto) {
    let whereOptions: WhereOptions<User> = { facilityId: query.facilityId };
    if (query.departmentId) {
      whereOptions.departmentId = query.departmentId;
    }
    if (query.search) {
      query.searchFields = ['fullName', 'email', 'phoneNumber'];
      whereOptions = {
        [Op.or]: query.searchFields.map((field) => ({
          [field]: { [Op.iLike]: `%${query.search}%` },
        })),
      };
    }
    const users = await this.userRepository.findAll({
      where: {
        ...whereOptions,
      },
      attributes: ['id', 'fullName', 'email'],
    });

    return users;
  }

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

  async fetchExpiryInterval(user: IUserPayload) {
    if (user.department && user.role != 'Central Admin') {
      throw new ForbiddenException('Not authorized to perform this action');
    }
    const facility = await this.facilityRepository.findByPk(user.facility, {
      attributes: ['id', 'intervalQuantity', 'intervalUnit', 'expiryInterval'],
    });
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }
    const facilityJson = facility.toJSON();
    delete facilityJson.expiryInterval;
    return { facility, facilityJson };
  }

  async updateExpiryInterval(dto: UpdateExpiryIntervalDto, user: IUserPayload) {
    const facility = (await this.fetchExpiryInterval(user)).facility;
    let expiryInterval: string;
    if (dto.intervalQuantity && dto.intervalUnit) {
      expiryInterval = dto.intervalQuantity + ' ' + dto.intervalUnit;
    } else if (dto.intervalUnit) {
      expiryInterval = facility.intervalQuantity + ' ' + dto.intervalUnit;
    } else {
      expiryInterval = dto.intervalQuantity + ' ' + facility.intervalUnit;
    }
    await facility.update({ expiryInterval, updatedById: user.sub });
    return;
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
        createdById: userId,
      });
    }

    return;
  }

  async findSettings(userId: string) {
    const settings = await this.settingsRepository.findOne({
      where: { userId },
      attributes: [
        'id',
        'emailItemStocked',
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

  @Cron('0 30 10 * * 1-6', {
    disabled: process.env.NODE_ENV != 'development',
  })
  // @Cron('45 * * * * *', {
  //   disabled: process.env.NODE_ENV != 'development',
  // })
  async fetchExpiredBatches() {
    const [results] = await this.sequelize.query(
      `
      SELECT 
        b.facility_id AS "facilityId",
        b.department_id AS "departmentId",
        COUNT(*) FILTER (
          WHERE b.validity BETWEEN CURRENT_DATE AND CURRENT_DATE + (f.expiry_interval)::INTERVAL
        ) AS "nearExpiry",
        COUNT(*) FILTER (
          WHERE b.validity < CURRENT_DATE
        ) AS expired
      FROM batches b
      JOIN facilities f ON f.id = b.facility_id
      GROUP BY b.facility_id, b.department_id;
      `,
      {
        type: QueryTypes.SELECT,
      },
    );
    const finalResults = (
      Array.isArray(results) ? results : [results]
    ) as ExpiredAlert[];

    const facilityIds = finalResults.map((result) => result.facilityId);
    const departmentIds = finalResults.map((result) => result.departmentId);

    const users = await this.userRepository.findAll({
      where: {
        facilityId: facilityIds,
        departmentId: {
          [Op.or]: [
            ...(departmentIds.includes(null) ? [{ [Op.is]: null }] : []),
            ...(departmentIds.filter((v) => v !== null).length > 0
              ? [{ [Op.in]: departmentIds.filter((v) => v !== null) }]
              : []),
          ],
        },
        role: { [Op.iLike]: `%admin%` },
      },
      attributes: [
        'facilityId',
        'departmentId',
        'email',
        'phoneNumber',
        'fullName',
        'role',
      ],
    });

    const userData = users.map(async (user) => {
      const modUser = user.toJSON();
      const expiredAlertData = finalResults.find(
        (result) =>
          result.facilityId === user.facilityId &&
          result.departmentId === user.departmentId,
      );
      if (!modUser.email) {
        const facility = await this.facilityRepository.findByPk(
          modUser.facilityId,
          { attributes: ['email'] },
        );
        modUser.email = facility.email;
      }

      const modData = {
        ...modUser,
        expired: +expiredAlertData.expired,
        nearExpiry: +expiredAlertData.nearExpiry,
      };
      return modData;
    });

    // [{
    //   facilityId: '7ffc433e-1530-459c-b5c2-720db4d5b044',
    //   departmentId: null,
    //   email: 'asare4ster@gmail.com',
    //   phoneNumber: '0244335567',
    //   fullName: 'Foster Asare',
    //   role: 'Central Admin',
    //   expired: 1,
    //   nearExpiry: 1
    // }]

    userData.forEach(async (data: any) => {
      if (data.expired || data.nearExpiry) {
        const expiredMessage = data.expired
          ? `${data.expired} expired item${data.expired < 2 ? '' : 's'}`
          : '';
        const nearExpiryMessage = data.nearExpiry
          ? `${data.nearExpiry} item${data.expired < 2 ? '' : 's'} near expiry`
          : '';
        const notification = new CreateNotificationDto();

        notification.status = NotificationStatus.UNREAD;
        notification.message = `Expiry Alert!!. You have ${expiredMessage} ${data.expired && data.nearExpiry && 'and '}${nearExpiryMessage}`;
        notification.linkName = 'View';
        notification.linkRoute = '/expiry?page=1';
        await this.notificationService.sendNotification(
          notification,
          Features.ITEMS,
          { facility: data.facilityId, department: data.departmentId },
        );
        data.linkRoute = notification.linkRoute;
        data.linkName = notification.linkName;
        this.sendResetPasswordConfirmation(data);
        console.log(notification);
      }
    });

    console.log(userData);
    return users;
  }

  private sendResetPasswordConfirmation(data: any) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: data.email,
      subject: 'EXPIRY ALERT ‼️‼️ - Stealth',
      template: './expiryReport',
      context: {
        clientUrl: this.configService.get<string>('CLIENT_URL'),
        fullName: data.fullName,
        expired: data.expired,
        nearExpiry: data.nearExpiry,
        linkRoute: data.linkRoute,
        linkName: data.linkName,
      },
    };

    this.mailService.send(email);
  }
}
