import {
  AllowNull,
  AfterFind,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { Batch, Item } from 'src/inventory/items/models';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Facility } from '../../../admin/facility/models/facility.model';
import { User } from 'src/auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

export enum StatusType {
  ACTIVE = 'Active',
  DEACTIVATED = 'Deactivated',
}
@Table({
  tableName: 'suppliers',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class Supplier extends BaseModel<Supplier> {
  @Column
  name: string;

  @AllowNull
  @Column
  brandTradeName: string;

  @Column
  supplierType: string;

  @Column
  minimumOrderQuantity: number;

  @Column
  leadTime: string;

  @Column
  deliveryMethod: string;

  @Column
  primaryContactName: string;

  @Column
  jobTitle: string;

  @Column
  department: string;

  @Column
  phoneNumber: string;

  @Column
  email: string;

  @Column
  physicalAddress: string;

  @AllowNull
  @Column
  mailingAddress: string;

  @AllowNull
  @Column
  emergencyContactName: string;

  @AllowNull
  @Column
  emergencyContactTitle: string;

  @AllowNull
  @Column
  emergencyContactNumber: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Supplier) {
      if (this.physicalAddress) {
        const addressList = this.physicalAddress.split(',');
        const city =
          addressList[
            addressList.length - 2 < 0 ? 0 : addressList.length - 2
          ].trim();
        return city;
      } else {
        return null;
      }
    },
  })
  city: string;

  @Column
  paymentType: string;

  @Column
  currency: string;

  @Column
  paymentTerms: string;

  @AllowNull
  @Column
  bankName: string;

  @AllowNull
  @Column
  accountType: string;

  @AllowNull
  @Column
  accountNumber: string;

  @AllowNull
  @Column
  provider: string;

  @AllowNull
  @Column
  mobileMoneyPhoneNumber: string;

  @Column({
    type: DataType.ENUM(StatusType.ACTIVE, StatusType.DEACTIVATED),
    defaultValue: StatusType.ACTIVE,
  })
  status: StatusType;

  @ForeignKey(() => Facility)
  @Column
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @Column({
    type: DataType.VIRTUAL,
  })
  totalItems: number;

  @HasMany(() => Batch)
  batches: Batch[];

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

  async getTotalItems(): Promise<number> {
    const itemsCount = await Item.count({
      include: [
        {
          model: Batch,
          attributes: ['supplierId'],
          where: { supplierId: this.id },
        },
      ],
      distinct: true,
    });

    return itemsCount;
  }

  @AfterFind
  static async afterFindHook(
    this: void,
    suppliers: Supplier | Supplier[],
  ): Promise<void> {
    if (!suppliers) return;
    const processSupplier = async (supplier: Supplier) => {
      if (!supplier) return;
      supplier.totalItems = await supplier.getTotalItems();
    };
    if (Array.isArray(suppliers)) {
      await Promise.all(suppliers.map(processSupplier));
    } else {
      await processSupplier(suppliers);
    }
  }

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, 'suppliers*');
  }
}
