import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  Default,
  AllowNull,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'audit_logs',
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['action'],
    },
    {
      fields: ['table_name'],
    },
    {
      fields: ['record_id'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['correlation_id'],
    },
  ],
})
export class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  // @ForeignKey(() => User)
  @Column
  userId: string;

  // @BelongsTo(() => User)
  @Column(DataType.VIRTUAL)
  user: object;

  @Column
  action: 'CREATE' | 'UPDATE' | 'DELETE';

  @Column
  tableName: string;

  @AllowNull
  @Column
  recordId: string;

  @Column(DataType.JSONB)
  before: any;

  @Column(DataType.JSONB)
  after: any;

  @AllowNull
  @Column
  description: string;

  @AllowNull
  @Column
  ipAddress: string;

  @AllowNull
  @Column
  userAgent: string;

  @AllowNull
  @Column
  source: string;

  @AllowNull
  @Column
  requestUrl: string;

  @AllowNull
  @Column
  method: string;

  @AllowNull
  @Column
  context: string;

  @AllowNull
  @Column
  statusCode: number;

  @AllowNull
  @Column
  correlationId: string;

  // @ForeignKey(() => Facility)
  @AllowNull
  @Column
  facilityId: string;

  @Column(DataType.VIRTUAL)
  facility: object;

  // @ForeignKey(() => Department)
  @AllowNull
  @Column
  departmentId: string;

  // @BelongsTo(() => Department)
  @Column(DataType.VIRTUAL)
  department: object;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt: Date;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, 'audits*');
  }
}
