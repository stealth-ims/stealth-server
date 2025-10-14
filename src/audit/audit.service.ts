import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditLog } from './models/audit.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAuditDto, FindAuditLogQueryDto, UpdateAuditDto } from './dto';
import { generateFilter } from '../core/shared/factory';
import { WhereOptions } from 'sequelize';
import { User } from '../auth/models/user.model';
import { Facility } from '../admin/facility/models/facility.model';
import { Department } from '../admin/department/models/department.model';
import { Op } from 'sequelize';

@Injectable()
export class AuditsService {
  constructor(
    @InjectModel(AuditLog)
    private readonly auditLogRepository: typeof AuditLog,
    @InjectModel(Facility)
    private readonly facilityRepository: typeof Facility,
    @InjectModel(Department)
    private readonly departmentRepository: typeof Department,
    @InjectModel(User)
    private readonly userRepository: typeof User,
  ) {}

  async create(payload: CreateAuditDto): Promise<void> {
    await this.auditLogRepository.create(payload);
  }

  async findAll(query: FindAuditLogQueryDto) {
    const filter = generateFilter(query);
    const dataTables = [
      'Department',
      'User',
      'DepartmentRequest',
      'Batch',
      'Item',
      'Markup',
      'ItemCategory',
      'StockAdjustment',
      'Supplier',
      'ItemOrder',
      'Patient',
      'Report',
      'SaleItem',
      'Sale',
    ];
    const whereOptions: WhereOptions<AuditLog> = {
      tableName: dataTables,
    };
    if (query.facilityId) {
      whereOptions.facilityId = query.facilityId;
    }
    if (query.userDepartmentId) {
      whereOptions.departmentId = query.userDepartmentId;
    }
    if (query.action) {
      whereOptions.action = query.action;
    }
    if (query.tableNames) {
      whereOptions.tableName = query.tableNames;
    }
    if (query.description) {
      whereOptions.description = { [Op.iLike]: `%${query.description}%` };
    }
    if (query.userId) {
      whereOptions.userId = query.userId;
    }
    if (query.startDate) {
      whereOptions.createdAt = { [Op.gte]: query.startDate };
    }
    if (query.endDate) {
      whereOptions.createdAt = { [Op.lte]: query.endDate };
    }
    if (query.departmentId) {
      if (query.userDepartmentId != query.departmentId) {
        throw new BadRequestException(
          'Cannot request data from other departments',
        );
      }
      whereOptions.departmentId = query.departmentId;
    }
    const auditLogs = await this.auditLogRepository.findAndCountAll({
      where: { ...whereOptions, ...filter.searchFilter },
      ...filter.pageFilter,
      attributes: [
        'id',
        'userId',
        'facilityId',
        'action',
        'tableName',
        'description',
        'recordId',
        'departmentId',
        'createdAt',
        'updatedAt',
      ],
    });
    auditLogs.rows = await Promise.all(
      auditLogs.rows.map((audit) => this.transformDocument(audit)),
    );

    return auditLogs;
  }

  async findOne(id: string) {
    const audit = await this.auditLogRepository.findByPk(id, {
      attributes: {
        exclude: [
          'facilityId',
          'ipAddress',
          'userAgent',
          'context',
          'correlationId',
          'method',
          'requestUrl',
          'source',
          'statusCode',
        ],
      },
    });
    return this.transformDocument(audit);
  }

  update(id: string, _dto: UpdateAuditDto) {
    return `This action updates a #${id} audit`;
  }

  remove(id: string) {
    return `This action removes a #${id} audit`;
  }

  private async transformDocument(audit: AuditLog): Promise<AuditLog> {
    if (!audit) return audit;
    if (audit.userId) {
      audit.user = await this.userRepository.findByPk(audit.userId, {
        attributes: ['id', 'fullName', 'email'],
      });
    }
    if (audit.facilityId) {
      audit.facility = await this.facilityRepository.findByPk(
        audit.facilityId,
        { attributes: ['id', 'name'] },
      );
    }
    if (audit.departmentId) {
      audit.department = await this.departmentRepository.findByPk(
        audit.departmentId,
        { attributes: ['id', 'name'] },
      );
    }
    return audit;
  }
}
