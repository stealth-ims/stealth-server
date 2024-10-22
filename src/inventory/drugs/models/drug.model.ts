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
import { DrugsCategory } from 'src/inventory/drugs-category/models/drugs-category.model';
import { BaseModel } from 'src/shared/models/base.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Batch } from '.';
import { StockAdjustment } from 'src/stock-adjustments/model';

export enum DosageForm {
  SOLIDS = 'SOLIDS',
  LIQUIDS = 'LIQUIDS',
}

export enum DrugStatus {
  LOW = 'LOW',
  STOCKED = 'STOCKED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
@Table({
  tableName: 'drugs',
  underscored: true,
})
export class Drug extends BaseModel {
  @ApiProperty({
    example: 'Drug Name',
    description: 'The name of the drug',
  })
  @Column
  name: string;

  @ApiProperty({
    example: 'Brand Name',
    description: 'The brand name of the drug',
  })
  @Column({ type: DataType.STRING, field: 'brand_name' })
  brandName: string;

  @ApiProperty({
    example: DosageForm.LIQUIDS,
    enum: DosageForm,
    description: 'The dosage form of the drug',
  })
  @Column({ type: DataType.ENUM('SOLIDS', 'LIQUIDS'), field: 'dosage_form' })
  dosageForm: DosageForm;

  @ApiProperty({
    example: 10.99,
    description: 'The cost price of the drug',
  })
  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'cost_price' })
  costPrice: number;

  @ApiProperty({
    example: 19.99,
    description: 'The selling price of the drug',
  })
  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'selling_price' })
  sellingPrice: number;

  @ApiProperty({
    example: 'ABC-DGU-123',
    description: 'The code of the drug',
  })
  @Column
  code: string;

  @ApiProperty({
    example: 'FDA123',
    description: 'The FDA approval of the drug',
  })
  @Column
  fdaApproval: string;

  @ApiProperty({
    example: 'ISO123',
    description: 'The ISO certification of the drug',
  })
  @Column({ field: 'ISO' })
  ISO: string;

  @ApiProperty({
    example: 'Manufacturer Name',
    description: 'The manufacturer of the drug',
  })
  @Column
  manufacturer: string;

  @ApiProperty({
    example: 'strength',
    description: 'The strength of the drug',
  })
  @Column
  strength: string;

  @ApiProperty({
    example: 'gramms',
    description: 'The unit of measurement of the drug',
  })
  @Column({ field: 'unit_of_measurement' })
  unitOfMeasurement: string;

  @ApiProperty({
    example: 'Store in a cool, dry place',
    description: 'The storage requirements of the drug',
  })
  @Column({ type: DataType.TEXT, field: 'storage_req' })
  storageReq: string;

  @ApiProperty({
    example: 10,
    description: 'The reorder point of the drug',
  })
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'reorder_point' })
  reorderPoint: number;

  @ApiProperty({
    example: 'STOCKED',
    enum: DrugStatus,
    description: 'The status of the drug',
  })
  @Column({
    type: DataType.ENUM('LOW', 'STOCKED', 'OUT_OF_STOCK'),
    allowNull: false,
  })
  status: DrugStatus;

  @Column({ field: 'created_by', allowNull: true })
  createdBy: string;

  // relationships

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The category ID of the drug',
  })
  @ForeignKey(() => DrugsCategory)
  @Column({
    type: DataType.UUID,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'category_id',
  })
  categoryId: string;

  @BelongsTo(() => DrugsCategory)
  category: DrugsCategory;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: "Add facility ID if it's a facility drug",
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
    description: 'Add department ID if it is a department drug',
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
  static async validate(drug: Drug) {
    const facility = await Facility.findByPk(drug.dataValues.facilityId);
    if (!facility) throw new NotFoundException('Facility not found');
    const department =
      drug.dataValues.departmentId != undefined
        ? await Department.findByPk(drug.dataValues.departmentId)
        : true;
    if (!department) throw new NotFoundException('Department not found');
    const category = await DrugsCategory.findByPk(drug.dataValues.categoryId);
    if (!category)
      throw new NotFoundException(
        `Category with Id ${drug.dataValues.categoryId} Not found`,
      );
    const exists = await Drug.findOne({ where: { name: drug.name } });
    if (
      exists &&
      (exists.facilityId == facility.id ||
        (department && exists.departmentId == (department as Department).id))
    ) {
      throw new ConflictException(
        JSON.stringify({
          message: 'Drug already exists in facility or department',
          id: exists.id,
        }),
      );
    }
  }
}
