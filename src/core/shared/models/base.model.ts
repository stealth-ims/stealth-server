import {
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  Model,
  PrimaryKey,
  UpdatedAt,
} from 'sequelize-typescript';
import { AuditLog } from '../../../audit/models/audit.model';

export abstract class BaseModel<T = any> extends Model<T> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;

  @AllowNull
  @Column({ field: 'created_by_id', type: DataType.UUID })
  createdById: string;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt: Date;

  @AllowNull
  @Column({ field: 'updated_by_id', type: DataType.UUID })
  updatedById: string;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @AllowNull
  @Column({ field: 'deleted_by_id', type: DataType.UUID })
  deletedById: string;

  @AfterCreate
  static async logCreate(instance: BaseModel, options: any) {
    if (options.skipAudit) return;

    const ownershipOptions: Record<string, any> = {};
    const extendedInstance = instance as any;
    if (extendedInstance.facilityId) {
      ownershipOptions.facilityId = extendedInstance.facilityId;
    }
    if (extendedInstance.departmentId) {
      ownershipOptions.departmentId = extendedInstance.departmentId;
    }

    const [auditLog, created] = await AuditLog.findOrCreate({
      where: {
        userId: instance.createdById,
        action: 'CREATE',
        tableName: 'unknown',
        source: 'api',
      },
      defaults: {
        userId: instance.createdById || null,
        action: 'CREATE',
        tableName: instance.constructor.name,
        recordId: instance.id,
        after: instance.toJSON(),
        source: 'sequelize-hook',
        description: `Created ${instance.constructor.name}`,
        ...ownershipOptions,
      },
      transaction: options.transaction,
    });

    if (!created) {
      await auditLog.update(
        {
          userId: instance.createdById || null,
          action: 'CREATE',
          tableName: instance.constructor.name,
          recordId: instance.id,
          after: instance.toJSON(),
          source: 'sequelize-hook',
          description: `Created ${instance.constructor.name}`,
          ...ownershipOptions,
        },
        { transaction: options.transaction },
      );
    }
  }

  @AfterUpdate
  static async logUpdate(instance: BaseModel, options: any) {
    if (options.skipAudit) return;

    const ownershipOptions: Record<string, any> = {};
    const extendedInstance = instance as any;
    if (extendedInstance.facilityId) {
      ownershipOptions.facilityId = extendedInstance.facilityId;
    }
    if (extendedInstance.departmentId) {
      ownershipOptions.departmentId = extendedInstance.departmentId;
    }

    const [auditLog, created] = await AuditLog.findOrCreate({
      where: {
        userId: instance.updatedById,
        action: 'UPDATE',
        tableName: 'unknown',
        source: 'api',
      },
      defaults: {
        userId: instance.updatedById || null,
        action: 'UPDATE',
        tableName: instance.constructor.name,
        recordId: instance.id,
        before: instance.previous(),
        after: instance.dataValues,
        source: 'sequelize-hook',
        description: `Updated ${instance.constructor.name}`,
        ...ownershipOptions,
      },
      transaction: options.transaction,
    });

    if (!created) {
      await auditLog.update(
        {
          userId: instance.updatedById || null,
          action: 'UPDATE',
          tableName: instance.constructor.name,
          recordId: instance.id,
          before: instance.previous(),
          after: instance.dataValues,
          source: 'sequelize-hook',
          description: `Updated ${instance.constructor.name}`,
          ...ownershipOptions,
        },
        { transaction: options.transaction },
      );
    }
  }

  @AfterDestroy
  static async logDelete(instance: BaseModel, options: any) {
    if (options.skipAudit) return;

    const ownershipOptions: Record<string, any> = {};
    const extendedInstance = instance as any;
    if (extendedInstance.facilityId) {
      ownershipOptions.facilityId = extendedInstance.facilityId;
    }
    if (extendedInstance.departmentId) {
      ownershipOptions.departmentId = extendedInstance.departmentId;
    }

    const [auditLog, created] = await AuditLog.findOrCreate({
      where: {
        userId: instance.deletedById || options.userId,
        action: 'DELETE',
        tableName: 'unknown',
        source: 'api',
      },
      defaults: {
        userId: instance.deletedById || options.userId || null,
        action: 'DELETE',
        tableName: instance.constructor.name,
        recordId: instance.id,
        before: instance.toJSON(),
        after: null,
        source: 'sequelize-hook',
        description: `Deleted ${instance.constructor.name}`,
        ...ownershipOptions,
      },
      transaction: options.transaction,
    });

    if (!created) {
      await auditLog.update(
        {
          userId: instance.deletedById || options.userId || null,
          action: 'DELETE',
          tableName: instance.constructor.name,
          recordId: instance.id,
          before: instance.toJSON(),
          after: null,
          source: 'sequelize-hook',
          description: `Deleted ${instance.constructor.name}`,
          ...ownershipOptions,
        },
        { transaction: options.transaction },
      );
    }
  }
}
