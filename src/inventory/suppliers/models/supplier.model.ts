import {
  AfterFind,
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { Batch } from 'src/inventory/items/models';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Facility } from '../../../admin/facility/models/facility.model';

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
export class Supplier extends BaseModel {
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

  @Column({ type: DataType.VIRTUAL })
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

  @Column({ type: DataType.VIRTUAL })
  totalItems: number;

  @HasMany(() => Batch)
  batches: Batch[];

  @AfterFind
  static async afterFindSuppliersHook(
    suppliers: Supplier | Supplier[],
  ): Promise<void> {
    if (!suppliers) {
      return;
    }

    if (!Array.isArray(suppliers)) {
      suppliers = [suppliers];
    }

    suppliers.forEach((supplier: Supplier) => {
      if (supplier.batches) {
        const totalItems = supplier.batches
          ? supplier.batches.reduce((accumulator, batch) => {
              return accumulator + (batch.quantity || 0);
            }, 0)
          : 0;

        supplier.totalItems = totalItems;
      }

      if (supplier.physicalAddress) {
        const addressList = supplier.physicalAddress.split(',');
        const city =
          addressList[
            addressList.length - 2 < 0 ? 0 : addressList.length - 2
          ].trim();
        supplier.city = city;
      }
    });
  }
}
