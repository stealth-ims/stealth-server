import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AccountState, User } from '../auth/models/user.model';
import { literal } from 'sequelize';
import { ChangeRoleDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../notification/mail/mail.service';
import { Department } from './department/models/department.model';
import { CreateUserDto } from '../user/dto';
import * as roles from './data/roles.json';

@Injectable()
export class AdminService {
  private logger: Logger;
  constructor(
    private configService: ConfigService,
    private readonly mailService: MailService,
    @InjectModel(User) private userRepository: typeof User,
  ) {
    this.logger = new Logger(AdminService.name);
  }

  async createPersonnel(dto: CreateUserDto, facilityId: string) {
    dto.accountActivated = false;
    dto.status = 'Pending';
    const user = await this.userRepository.create({
      ...dto,
      status: dto.status,
      accountActivated: dto.accountActivated,
      facilityId,
    });
    this.sendUserCreatedMail(user);
    return user;
  }

  retrieveStarterRoles() {
    return roles.roles;
  }

  async findFaciltyPersonnel(
    facilityId: string,
    departmentId: string,
    userId: string,
  ) {
    this.logger.log(`Retrieving facilities personnel`);
    const users = await this.userRepository.findAndCountAll({
      where: {
        facilityId,
        departmentId,
      },
      order: [
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
        'accountActivated',
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
    if (personnel.role == dto.role) {
      throw new BadRequestException('role already exists');
    }
    personnel.role = dto.role;
    personnel.permissions = dto.permissions;
    personnel.updatedBy = adminId;
    await personnel.save();

    this.sendChangeRoleConfirmationMail(
      personnel.email,
      personnel.fullName,
      personnel.role,
      personnel.updatedAt.toUTCString(),
    );
    return;
  }

  async deactivateUser(personnelId: string, adminId: string) {
    const user = await this.changeUserState(
      false,
      AccountState.INACTIVE,
      personnelId,
      adminId,
    );
    user.deactivatedAt = new Date();
    user.deactivatedBy = adminId;
    await user.save();
    this.sendDeactivatedAccountConfirmation(
      user.email,
      user.fullName,
      user.deactivatedAt.toUTCString(),
    );
    return;
  }

  async activateUser(personnelId: string, adminId: string) {
    const user = await this.changeUserState(
      true,
      AccountState.ACTIVE,
      personnelId,
      adminId,
    );
    this.sendActivatedAccountConfirmation(user.email);
    return;
  }

  async removeUser(personnelId: string) {
    const user = await this.userRepository.findByPk(personnelId);
    const destroyedRows = await this.userRepository.destroy({
      where: { id: personnelId },
    });

    if (destroyedRows == 0) {
      throw new NotFoundException('personnel not found');
    }
    const deletedAt = new Date().toUTCString();
    this.sendDeletedAccountConfirmation(user.email, deletedAt);
    return;
  }

  private async changeUserState(
    accountApproved: boolean,
    status: AccountState,
    personnelId: string,
    adminId: string,
  ) {
    const personnel = await this.userRepository.findByPk(personnelId);
    if (!personnel) {
      throw new NotFoundException('personnel not found');
    }
    personnel.accountActivated = accountApproved;
    personnel.status = status;
    personnel.updatedBy = adminId;
    await personnel.save();
    return personnel;
  }

  private sendUserCreatedMail(user: User) {
    const updatedAt = new Date(user.updatedAt).toUTCString();
    const email = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: user.email,
      subject: 'Welcome 👋 - Stealth',
      template: './userCreated',
      context: {
        email: user.email,
        fullName: user.fullName,
        role: user.role,
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
