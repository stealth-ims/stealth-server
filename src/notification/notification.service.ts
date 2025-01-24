import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsGateway } from './gateway/notification.gateway';
import { Role } from '../auth/interface/roles.enum';
import { Observable, Subject } from 'rxjs';
import { Features } from '../shared/enums/permissions.enum';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationModel } from './models/notification.model';
import { CreateNotificationDto } from './dto';
import { IUserPayload } from '../auth/interface/payload.interface';
import { NotificationStatus } from './enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    @InjectModel(NotificationModel)
    private notifcationRepo: typeof NotificationModel,
  ) {}

  private notificationSubject = new Subject<any>();
  private itemNotificationSubject = new Subject<any>();
  private departmentRequestNotificationSubject = new Subject<any>();
  private stockRequestNotificationSubject = new Subject<any>();

  async create(
    dto: CreateNotificationDto,
    user: Pick<IUserPayload, 'facility' | 'department'>,
    feature: Features,
  ) {
    const notification = await this.notifcationRepo.create({
      ...dto,
      feature,
      facilityId: user.facility,
      departmentId: user.department,
    });
    dto.id = notification.id;
    dto.createdAt = notification.createdAt;
    return dto;
  }

  async getAll(user: IUserPayload) {
    const features = user.permissions.map(
      (permission) => permission.split(':')[0],
    );

    const whereOptions: any = {
      facilityId: user.facility,
      feature: features,
      departmentId: user.department,
    };

    const notifications = await this.notifcationRepo.findAll({
      where: {
        ...whereOptions,
      },
      attributes: [
        'id',
        'message',
        'linkName',
        'linkRoute',
        'createdAt',
        'status',
      ],
      order: [['createdAt', 'DESC']],
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

  async remove(id: string) {
    const deleted = await this.notifcationRepo.destroy({ where: { id } });
    if (deleted == 0) {
      throw new NotFoundException('Notification not found');
    }
    return;
  }

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
    this.pushNotification(notification, feature);
  }

  pushNotification(
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

  async authenticateUser(token: string) {
    return await this.notificationsGateway.decodeToken(token);
  }

  private findPermission(permissions: string[], feature: Features) {
    return !!permissions.find((permission) => permission.includes(feature));
  }

  notifyAdmins(roles: Role[], payload: any) {
    for (const role of roles) {
      this.notificationsGateway.sendNotificationToRole(role, payload);
    }
  }

  notifyAdmin(payload: any) {
    this.notificationsGateway.sendNotificationToRole(
      Role.HospitalAdmin,
      payload,
    );
  }

  notifyWorkers(payload: any) {
    this.notificationsGateway.sendNotificationToRole(
      Role.HealthcareWorker,
      payload,
    );
  }

  notifyAllUsers(payload: any) {
    this.notificationsGateway.sendNotification(payload);
  }
}
