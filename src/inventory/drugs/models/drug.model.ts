import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { DrugsCategory } from 'src/inventory/drugs-category/models/drugs-category.model';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { BaseModel } from 'src/shared/models/base.model';

@Table({
  tableName: 'drugs',
  underscored: true,
})
export class Drug extends BaseModel {
  @Index
  @Column
  name: string;

  @Column({ type: DataType.STRING, field: 'brand_name' })
  brandName: string;

  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'cost_price' })
  costPrice: number;

  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'selling_price' })
  sellingPrice: number;

  @Column({ type: DataType.ENUM('SOLIDS', 'LIQUIDS'), field: 'dosage_form' })
  dosageForm: DosageForm;

  @Column
  code: string;

  @Column({ type: DataType.DATE, allowNull: false })
  validity: Date;

  @Column
  fdaApproval: string;

  @Column({ field: 'ISO' })
  ISO: string;

  @Column
  batch: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  stock: number;

  @Column({ type: DataType.INTEGER, allowNull: false, field: 'reorder_point' })
  reorderPoint: number;

  @Column
  manufacturer: string;

  @Column
  strength: string;

  @Column({ field: 'unit_of_measurement' })
  unitOfMeasurement: string;

  @Column({
    type: DataType.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
    allowNull: false,
  })
  status: DrugStatus;

  @Column({ type: DataType.TEXT, field: 'storage_req' })
  storageReq: string;

  @ForeignKey(() => DrugsCategory)
  @Column({
    type: DataType.UUID,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'category_id',
  })
  categoryId: string;

  @BelongsTo(() => DrugsCategory, 'category_id')
  category: DrugsCategory;

  @ForeignKey(() => Supplier)
  @Column
  supplierId: string;

  @BelongsTo(() => Supplier, 'category_id')
  supplier: Supplier;
}

export enum DosageForm {
  SOLIDS = 'SOLIDS',
  LIQUIDS = 'LIQUIDS',
}

export enum DrugStatus {
  LOW = 'LOW',
  STOCKED = 'STOCKED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
