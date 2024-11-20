import {
  BeforeCreate,
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
import { BaseModel } from 'src/shared/models/base.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Batch } from '.';
import { StockAdjustment } from 'src/stock-adjustments/model';

export enum DosageForm {
  SOLIDS = 'SOLIDS',
  LIQUIDS = 'LIQUIDS',
}

export enum ItemStatus {
  LOW = 'LOW',
  STOCKED = 'STOCKED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
@Table({
  tableName: 'items',
  underscored: true,
})
export class Item extends BaseModel {
  @ApiProperty({
    example: 'Item Name',
    description: 'The name of the item',
  })
  @Column
  name: string;

  @ApiProperty({
    example: 'Brand Name',
    description: 'The brand name of the item',
  })
  @Column({ type: DataType.STRING, field: 'brand_name' })
  brandName: string;

  @ApiProperty({
    example: DosageForm.LIQUIDS,
    enum: DosageForm,
    description: 'The dosage form of the item',
  })
  @Column({ type: DataType.ENUM('SOLIDS', 'LIQUIDS'), field: 'dosage_form' })
  dosageForm: DosageForm;

  @ApiProperty({
    example: 10.99,
    description: 'The cost price of the item',
  })
  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'cost_price' })
  costPrice: number;

  @ApiProperty({
    example: 19.99,
    description: 'The selling price of the item',
  })
  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'selling_price' })
  sellingPrice: number;

  @ApiProperty({
    example: 'ABC-DGU-123',
    description: 'The code of the item',
  })
  @Column
  code: string;

  @ApiProperty({
    example: 'FDA123',
    description: 'The FDA approval of the item',
  })
  @Column
  fdaApproval: string;

  @ApiProperty({
    example: 'ISO123',
    description: 'The ISO certification of the item',
  })
  @Column({ field: 'ISO' })
  ISO: string;

  @ApiProperty({
    example: 'Manufacturer Name',
    description: 'The manufacturer of the item',
  })
  @Column
  manufacturer: string;

  @ApiProperty({
    example: 'strength',
    description: 'The strength of the item',
  })
  @Column
  strength: string;

  @ApiProperty({
    example: 'gramms',
    description: 'The unit of measurement of the item',
  })
  @Column({ field: 'unit_of_measurement' })
  unitOfMeasurement: string;

  @ApiProperty({
    example: 'Store in a cool, dry place',
    description: 'The storage requirements of the item',
  })
  @Column({ type: DataType.TEXT, field: 'storage_req' })
  storageReq: string;

  @ApiProperty({
    example: 10,
    description: 'The reorder point of the item',
  })
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'reorder_point' })
  reorderPoint: number;

  @ApiProperty({
    example: 'STOCKED',
    enum: ItemStatus,
    description: 'The status of the item',
  })
  @Column({
    type: DataType.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
    allowNull: false,
  })
  status: ItemStatus;

  @Column({ field: 'created_by', allowNull: true })
  createdBy: string;

  // relationships

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The category ID of the item',
  })
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

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: "Add facility ID if it's a facility item",
  })
  @ForeignKey(() => Facility)
  @Column({
    type: DataType.UUID,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'Add department ID if it is a department item',
  })
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

  @BeforeCreate
  static async validate(item: Item) {
    const facility = await Facility.findByPk(item.dataValues.facilityId);
    if (!facility) throw new NotFoundException('Facility not found');
    const department =
      item.dataValues.departmentId != undefined
        ? await Department.findByPk(item.dataValues.departmentId)
        : true;
    if (!department) throw new NotFoundException('Department not found');
    const category = await ItemCategory.findByPk(item.dataValues.categoryId);
    if (!category)
      throw new NotFoundException(
        `Category with Id ${item.dataValues.categoryId} Not found`,
      );
    const exists = await Item.findOne({ where: { name: item.name } });
    if (
      exists &&
      (exists.facilityId == facility.id ||
        (department && exists.departmentId == (department as Department).id))
    ) {
      throw new ConflictException(
        JSON.stringify({
          message: 'Item already exists in facility or department',
          id: exists.id,
        }),
      );
    }
  }
}
