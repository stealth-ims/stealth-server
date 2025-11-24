import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
  Unique,
  AllowNull,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { BaseModel } from '../../core/shared/models/base.model';
import { Sale } from '../../sales/models/sales.model';
import { User } from '../../auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';

@Table({
  tableName: 'patients',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Patient extends BaseModel<Patient> {
  @Column
  name: string;

  @AllowNull
  @Unique
  @Column
  cardIdentificationNumber: string;

  @AllowNull
  @Column
  secondaryIdentificationNumber: string;

  @AllowNull
  @Column
  queueUniqueId: string;

  @Column(DataType.DATE)
  dateOfBirth: Date;

  @HasMany(() => Sale)
  sales: Sale[];

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @AllowNull
  @ForeignKey(() => Department)
  @Column
  departmentId: string;

  @BelongsTo(() => Department)
  department?: Department;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  createdById: string;

  @BelongsTo(() => User)
  createdBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

  @AllowNull
  @ForeignKey(() => User)
  @Column
  deletedById: string;

  @BelongsTo(() => User)
  deletedBy: User;

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, 'patients*');
  }
}
