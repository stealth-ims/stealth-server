import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsGateway } from './gateway/notification.gateway';
import { Observable, Subject } from 'rxjs';
import { Features } from '../core/shared/enums/permissions.enum';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationModel } from './models/notification.model';
import { CreateNotificationDto } from './dto';
import { IUserPayload } from '../auth/interface/payload.interface';
import { NotificationStatus } from './enum';
import { AccountState, User } from '../auth/models/user.model';
import { FetchNotificationsQueryDto } from './dto/get.dto';
import { generateFilter } from '../core/shared/factory';
import { CreateOptions } from 'sequelize';
import { Department } from 'src/admin/department/models/department.model';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    @InjectModel(NotificationModel)
    private notifcationRepo: typeof NotificationModel,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Department) private departmentRepository: typeof Department,
  ) {}

  private logger = new Logger(NotificationService.name);
  private notificationSubject = new Subject<any>();
  private itemNotificationSubject = new Subject<any>();
  private departmentRequestNotificationSubject = new Subject<any>();
  private stockRequestNotificationSubject = new Subject<any>();

  async create(
    dto: CreateNotificationDto,
    user: Pick<IUserPayload, 'facility' | 'department'>,
    feature: Features,
  ) {
    const notification = await this.notifcationRepo.create(
      {
        ...dto,
        feature,
        facilityId: user.facility,
        departmentId: user.department,
      },
      {
        skipAudit: true,
      } as CreateOptions,
    );
    dto.id = notification.id;
    dto.createdAt = notification.createdAt;
    return dto;
  }

  async getAll(query: FetchNotificationsQueryDto, user: IUserPayload) {
    const queryFilter = generateFilter(query);

    const features = user.permissions.map(
      (permission) => permission.split(':')[0],
    );

    const whereOptions: any = {
      facilityId: user.facility,
      feature: features,
    };

    if (user.department) {
      whereOptions.departmentId = user.department;
    }

    const notifications = await this.notifcationRepo.findAndCountAll({
      where: {
        ...whereOptions,
        ...queryFilter.searchFilter,
      },
      attributes: [
        'id',
        'message',
        'linkName',
        'linkRoute',
        'createdAt',
        'status',
      ],
      include: [{ model: Department, attributes: ['id', 'name'] }],
      ...queryFilter.pageFilter,
    });

    return notifications;
  }

  async markAsRead(id: string) {
    const updatedNotification = await this.notifcationRepo.update(
      { status: NotificationStatus.READ },
      { where: { id } },
    );
    if (updatedNotification[0] == 0) {
      throw new NotFoundException('Notification not found');
    }
    return;
  }

  async markAllRead(user: IUserPayload) {
    const whereOptions: any = {
      facilityId: user.facility,
      departmentId: user.department,
    };
    const updatedNotification = await this.notifcationRepo.update(
      { status: NotificationStatus.READ },
      {
        where: {
          status: NotificationStatus.UNREAD,
          ...whereOptions,
        },
      },
    );
    if (updatedNotification[0] == 0) {
      throw new NotFoundException('Notification not found');
    }
    return;
  }

  async remove(id: string, userId?: string) {
    const userOptions: Record<string, any> = {};
    if (userId) {
      userOptions.userId = userId;
    }
    userOptions.skipAudit = true;
    const deleted = await this.notifcationRepo.destroy({
      where: { id },
      ...userOptions,
    } as any);
    if (deleted == 0) {
      throw new NotFoundException('Notification not found');
    }
    return;
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleDeleteNotificationsCron() {
  //   const currentDate = new Date();
  //   console.log(`executing delete cron at ${currentDate.toString()}`);
  //   const deleted = await this.notifcationRepo.destroy({
  //     where: {
  //       createdAt: { [Op.lte]: currentDate },
  //       status: NotificationStatus.READ,
  //     },
  //   });
  //   if (deleted == 0) {
  //     throw new NotFoundException('Notifications not found');
  //   }
  //   return;
  // }

  getNotifications(
    permissions: string[],
    departmentId: string,
  ): Observable<any> {
    const itemPermission = this.findPermission(permissions, Features.ITEMS);
    const departmentRequestPermission =
      this.findPermission(permissions, Features.DEPARTMENT_REQUESTS) &&
      !departmentId;
    const stockRequestPermission =
      this.findPermission(permissions, Features.DEPARTMENT_REQUESTS) &&
      departmentId;

    if (itemPermission) {
      return this.itemNotificationSubject.asObservable();
    }

    if (departmentRequestPermission) {
      return this.departmentRequestNotificationSubject.asObservable();
    } else if (stockRequestPermission) {
      return this.stockRequestNotificationSubject.asObservable();
    }

    if (
      !itemPermission &&
      !departmentRequestPermission &&
      !stockRequestPermission
    ) {
      return this.notificationSubject.asObservable();
    }
  }

  async sendNotification(
    notification: CreateNotificationDto,
    feature: Features,
    user: Pick<IUserPayload, 'facility' | 'department'>,
  ) {
    await this.create(notification, user, feature);
    await this.pushNotification(user, notification, feature);
    // this.pushNotification(notification, feature);
  }

  async pushNotification(
    user: Pick<IUserPayload, 'facility' | 'department'>,
    notification: CreateNotificationDto,
    feature: Features,
  ): Promise<void> {
    const notificationBody = { feature, ...notification };
    let topic = `${user.facility}`;

    if (user.department) {
      const department = await this.departmentRepository.findByPk(
        user.department,
        { attributes: ['name'] },
      );

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      const deptPart = `:${user.department}`;
      topic = `${user.facility}${deptPart}`;

      await this.notificationsGateway.sendNotificationToTopic(
        topic,
        notificationBody,
      );

      topic = user.facility;
      notificationBody.departmentName = department.name;
    }

    await this.notificationsGateway.sendNotificationToTopic(
      topic,
      notificationBody,
    );
  }

  oldPushNotification(
    notification: CreateNotificationDto,
    feature: Features,
  ): void {
    switch (feature) {
      case Features.ITEMS:
        this.itemNotificationSubject.next(notification);
        break;
      case Features.DEPARTMENT_REQUESTS:
        this.departmentRequestNotificationSubject.next(notification);
        break;
      case Features.STOCK_REQUESTS:
        this.stockRequestNotificationSubject.next(notification);
        break;
      default:
        this.notificationSubject.next(notification);
    }
  }

  async authenticateUser(userId: string) {
    const user = await this.userRepository.findByPk(userId, {
      attributes: [
        'id',
        'username',
        'email',
        'facilityId',
        'departmentId',
        'role',
        'permissions',
        'status',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== AccountState.ACTIVE) {
      throw new UnauthorizedException();
    }
    const userPayload: IUserPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      facility: user.facilityId,
      department: user.departmentId,
      role: user.role,
      permissions: user.permissions,
      session: null,
    };
    return userPayload;
  }

  private findPermission(permissions: string[], feature: Features) {
    return !!permissions.find((permission) => permission.includes(feature));
  }

  notifyAdmin(payload: any) {
    this.logger.log('Notifying Admins', payload);
  }
}
