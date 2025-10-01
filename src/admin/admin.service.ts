import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountState, User } from '../auth/models/user.model';
import { literal } from 'sequelize';
import { AdminChangePasswordDto, ChangeRoleDto, FindUserQueryDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../notification/mail/mail.service';
import { Department } from './department/models/department.model';
import { CreateUserDto } from '../user/dto';
import * as roles from './data/roles.json';
import * as bcrypt from 'bcrypt';
import { FacilityService } from './facility/facility.service';
import { IUserPayload } from '../auth/interface/payload.interface';
import { generateFilter } from '../core/shared/factory';
import { Op } from 'sequelize';

@Injectable()
export class AdminService {
  private SALT_OR_ROUNDS: number = 10;
  private logger: Logger;
  constructor(
    private configService: ConfigService,
    private readonly mailService: MailService,
    @InjectModel(User) private userRepository: typeof User,
    private readonly facilityService: FacilityService,
  ) {
    this.logger = new Logger(AdminService.name);
  }

  async createPersonnel(dto: CreateUserDto, admin: IUserPayload) {
    dto.status = AccountState.PENDING;
    const facility = await this.facilityService.findOne(admin.facility);
    const hashPassword = await bcrypt.hash(
      facility.password,
      this.SALT_OR_ROUNDS,
    );
    const user = await this.userRepository.create({
      ...dto,
      password: hashPassword,
      status: dto.status,
      facilityId: admin.facility,
      createdById: admin.sub,
    });
    if (user.id && user.email) {
      this.sendUserCreatedMail(user, facility.password);
    }

    const response = await this.userRepository.findByPk(user.id, {
      attributes: { exclude: ['password', 'accountActivated'] },
    });
    return response;
  }

  retrieveStarterRoles() {
    return roles.roles;
  }

  async findFaciltyPersonnel(user: IUserPayload, query: FindUserQueryDto) {
    this.logger.log(`Retrieving facilities personnel`);
    const queryFilter = generateFilter(query, {
      fullName: { [Op.iLike]: `%${query.search}%` },
    });
    const whereOptions: Record<string, any> = {};
    const userId = user.sub;
    if (user.department) {
      whereOptions.departmentId = { [Op.eq]: user.department };
    }
    if (query.status) {
      whereOptions.status = { [Op.eq]: query.status };
    }
    if (query.role) {
      whereOptions.role = { [Op.iLike]: `%${query.role}%` };
    }
    const users = await this.userRepository.findAndCountAll({
      where: {
        facilityId: user.facility,
        ...whereOptions,
        ...queryFilter.searchFilter,
      },
      ...queryFilter.pageFilter,
      order: query.orderBy
        ? [[query.orderBy, query.orderDirection ? query.orderDirection : 'ASC']]
        : [
            [
              literal(`
        CASE 
          WHEN status = 'Pending' THEN 1
          WHEN status = 'Accepted' THEN 2
          WHEN status = 'Declined' THEN 3
          WHEN status = 'Active' THEN 4
          WHEN status = 'Inactive' THEN 5
        END
      `),
              'ASC',
            ],
          ],
      include: [{ model: Department, attributes: ['id', 'name'] }],
      attributes: ['id', 'fullName', 'role', 'status'],
      distinct: true,
    });

    const modifiedUsers = users.rows.filter((user) => user.id != userId);
    return { rows: modifiedUsers, count: users.count };
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
        'permissions',
        'status',
      ],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async changeUserRole(
    personnelId: string,
    dto: ChangeRoleDto,
    adminId: string,
  ) {
    const personnel = await this.userRepository.findByPk(personnelId);

    if (!personnel) {
      throw new NotFoundException('personnel not found');
    }

    await personnel.update({ updatedById: adminId, ...dto });

    if (personnel.email) {
      this.sendChangeRoleConfirmationMail(
        personnel.email,
        personnel.fullName,
        personnel.role,
        personnel.updatedAt.toUTCString(),
      );
    }
    return;
  }

  async resetUserPassword(dto: AdminChangePasswordDto, adminId: string) {
    const personnel = await this.userRepository.findByPk(dto.userId);
    if (!personnel) {
      throw new NotFoundException('User not found');
    }
    const hashPassword = await bcrypt.hash(
      dto.newPassword,
      this.SALT_OR_ROUNDS,
    );
    personnel.password = hashPassword;
    personnel.updatedById = adminId;
    await personnel.save();
  }

  async deactivateUser(personnelId: string, adminId: string) {
    const user = await this.changeUserState(
      AccountState.INACTIVE,
      personnelId,
      adminId,
      'deactivated',
    );
    user.deactivatedAt = new Date();
    user.deactivatedBy = adminId;
    await user.save();
    if (user.email) {
      this.sendDeactivatedAccountConfirmation(
        user.email,
        user.fullName,
        user.deactivatedAt.toUTCString(),
      );
    }
    return;
  }

  async activateUser(personnelId: string, adminId: string) {
    const user = await this.changeUserState(
      AccountState.ACTIVE,
      personnelId,
      adminId,
      'activated',
    );
    await user.save();
    if (user.email) {
      this.sendActivatedAccountConfirmation(user.email);
    }
    return;
  }

  async removeUser(personnelId: string, deletedBy: string) {
    const user = await this.userRepository.findByPk(personnelId);
    if (!user) {
      throw new NotFoundException('personnel not found');
    }
    await user.destroy({ force: true, userId: deletedBy } as any);

    const deletedAt = new Date().toUTCString();
    if (user.email) {
      this.sendDeletedAccountConfirmation(user.email, deletedAt);
    }
    return;
  }

  private async changeUserState(
    status: AccountState,
    personnelId: string,
    adminId: string,
    changedState: string,
  ) {
    const personnel = await this.userRepository.findByPk(personnelId);
    if (!personnel) {
      throw new NotFoundException('personnel not found');
    }
    if (personnel.status == AccountState.PENDING) {
      throw new BadRequestException(`account cannot be ${changedState}`);
    }
    personnel.status = status;
    personnel.updatedById = adminId;
    await personnel.save();
    return personnel;
  }

  private sendUserCreatedMail(user: User, password: string) {
    const updatedAt = new Date(user.updatedAt).toUTCString();
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: user.email,
      subject: 'Welcome 👋 - Stealth',
      template: './userCreated',
      context: {
        clientUrl: this.configService.get<string>('CLIENT_URL'),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        password: password,
        updatedAt,
      },
    };

    this.mailService.send(email);
  }
  private sendChangeRoleConfirmationMail(
    mail: string,
    fullName: string,
    role: string,
    updatedAt: string,
  ) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Account Role Changed ✅ - Stealth',
      template: './changeRoleConfirmation',
      context: {
        email: mail,
        fullName,
        role,
        updatedAt,
      },
    };

    this.mailService.send(email);
  }

  private sendDeactivatedAccountConfirmation(
    mail: string,
    fullName: string,
    deactivatedAt: string,
  ) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Account Deactivated 🚫 - Stealth',
      template: './deactivatedConfirmation',
      context: {
        email: mail,
        fullName,
        deactivatedAt,
      },
    };

    this.mailService.send(email);
  }

  private sendActivatedAccountConfirmation(mail: string) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Account Activated 🟢 - Stealth',
      template: './activatedConfirmation',
      context: {
        email: mail,
      },
    };

    this.mailService.send(email);
  }

  private sendDeletedAccountConfirmation(mail: string, deletedAt: string) {
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: mail,
      subject: 'Account Deleted - Stealth',
      template: './deletedConfirmation',
      context: {
        email: mail,
        deletedAt,
      },
    };

    this.mailService.send(email);
  }
}
