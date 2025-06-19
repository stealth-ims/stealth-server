import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
  HasMany,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { DepartmentRequest } from 'src/department-requests/models/department-requests.model';
import { ItemCategory } from 'src/inventory/items-category/models/items-category.model';
import { BaseModel } from 'src/core/shared/models/base.model';
import { Batch } from '.';
import { StockAdjustment } from '../../models/stock-adjustment.model';
import { DosageForm } from '../dto';

@Table({
  tableName: 'items',
  underscored: true,
  paranoid: true,
  timestamps: true,
})
export class Item extends BaseModel {
  @Column
  name: string;

  @Column({ type: DataType.STRING, field: 'brand_name' })
  brandName: string;

  @Column({ type: DataType.STRING, field: 'dosage_form' })
  dosageForm: DosageForm;

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

  @Column({ type: DataType.TEXT, field: 'storage_req' })
  storageReq: string;

  @Column({ type: DataType.INTEGER, allowNull: false, field: 'reorder_point' })
  reorderPoint: number;

  @Column({
    type: DataType.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.VIRTUAL,
    get(this: Item) {
      return this.batches && this.batches.length
        ? this.batches.reduce((accum, current) => accum + current.quantity, 0)
        : 0;
    },
  })
  totalQuantity: number;

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
}
