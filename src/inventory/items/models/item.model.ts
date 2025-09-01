import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
  HasMany,
  AllowNull,
  AfterFind,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { DepartmentRequest } from 'src/department-requests/models/department-requests.model';
import { ItemCategory } from 'src/inventory/items-category/models/items-category.model';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Batch } from '.';
import { StockAdjustment } from '../../models/stock-adjustment.model';
import { DosageForm, ItemStatus } from '../dto';
import { User } from 'src/auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

@Table({
  tableName: 'items',
  underscored: true,
  paranoid: true,
  timestamps: true,
})
export class Item extends BaseModel<Item> {
  @Column
  name: string;

  @Column({ type: DataType.STRING, field: 'brand_name' })
  brandName: string;

  @Column({ type: DataType.STRING, field: 'dosage_form' })
  dosageForm: DosageForm | string;

  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'cost_price' })
  costPrice: number;

  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'selling_price' })
  sellingPrice: number;

  @Column
  code: string;

  @Column
  fdaApproval: string;

  @Column({ field: 'ISO' })
  ISO: string;

  @Column
  manufacturer: string;

  @Column
  strength: string;

  @Column({ field: 'unit_of_measurement' })
  unitOfMeasurement: string;

  @Column
  nhisCovered: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Item) {
      const nameConsts = [this.name];
      if (this.brandName) {
        nameConsts.push(`(${this.brandName})`);
      }
      if (this.dosageForm) {
        const lowercased = this.dosageForm.toLowerCase();

        const capitalized =
          lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
        nameConsts.push(capitalized);
      }
      if (this.strength) {
        nameConsts.push(this.strength);
      }
      // if (this.unitOfMeasurement) {
      //   nameConsts.push(this.unitOfMeasurement);
      // }
      return nameConsts.join(' ');
    },
  })
  itemFullName: string;

  @Column({ type: DataType.TEXT, field: 'storage_req' })
  storageReq: string;

  @Column({ type: DataType.INTEGER, allowNull: false, field: 'reorder_point' })
  reorderPoint: number;

  // @Column({
  //   type: DataType.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
  //   allowNull: false,
  // })
  // status: string;

  @Column({
    type: DataType.VIRTUAL,
  })
  totalStock: number;

  @Column({
    type: DataType.VIRTUAL,
  })
  status: ItemStatus;

  // relationships

  @ForeignKey(() => ItemCategory)
  @Column({
    type: DataType.UUID,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'category_id',
  })
  categoryId: string;

  @BelongsTo(() => ItemCategory)
  category: ItemCategory;

  @ForeignKey(() => Facility)
  @Column({
    type: DataType.UUID,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ForeignKey(() => Department)
  @Column({ allowNull: true })
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @HasMany(() => Batch)
  batches: Batch[];

  @HasMany(() => StockAdjustment)
  stockAdjustments: StockAdjustment[];

  @HasMany(() => DepartmentRequest)
  departmentRequests: DepartmentRequest[];

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

  async getItemStatus(totalStock: number): Promise<ItemStatus> {
    if (totalStock == 0) {
      return ItemStatus.OUT_OF_STOCK;
    } else if (this.totalStock <= this.reorderPoint) {
      return ItemStatus.LOW;
    } else {
      return ItemStatus.STOCKED;
    }
  }

  async getTotalQuantity(departmentId?: string): Promise<number> {
    const whereOptions: Record<string, any> = { itemId: this.id };
    if (departmentId) {
      whereOptions.departmentId = departmentId;
    }

    const batches = await Batch.findAll({
      where: whereOptions,
      attributes: ['quantity'],
    });

    return batches.reduce((accum, current) => accum + current.quantity, 0);
  }

  @AfterFind
  static async afterFindHook(
    this: void,
    items: Item | Item[],
    options: any,
  ): Promise<void> {
    if (options.skipStatus) return;
    if (!items) return;
    const processItem = async (item: Item) => {
      if (!item) return;
      const departmentId = options.departmentId as string;
      item.totalStock = await item.getTotalQuantity(departmentId);
      item.status = await item.getItemStatus(item.totalStock);
    };
    if (Array.isArray(items)) {
      await Promise.all(items.map(processItem));
    } else {
      await processItem(items);
    }
  }

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  @AfterBulkUpdate
  @AfterBulkDestroy
  static async handleMutation() {
    await deleteByPattern(process.env.REDIS_URL, '*items*');
    await deleteByPattern(process.env.REDIS_URL, 'dashboard:general*');
  }
}
