import {
  BeforeCreate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { DrugsCategory } from 'src/inventory/drugs-category/models/drugs-category.model';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { BaseModel } from 'src/shared/models/base.model';
// import { CreateDrugDto } from '../dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

@Table({
  tableName: 'drugs',
  underscored: true,
})
export class Drug extends BaseModel {
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

  @ForeignKey(() => Facility)
  @Column({
    type: DataType.UUID,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  facilityId: string;

  @BelongsTo(() => Facility, 'facility_id')
  facility: Facility;

  @ForeignKey(() => Department)
  @Column({ allowNull: true })
  departmentId: string;

  @BelongsTo(() => Supplier, 'department_id')
  department: Supplier;

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
    const supplier = await Supplier.findByPk(drug.dataValues.supplierId);
    if (!supplier)
      throw new NotFoundException(
        `Supplier with id: ${drug.dataValues.supplierId} Not found`,
      );
    const exists = await Drug.findOne({ where: { name: drug.name } });
    if (
      exists &&
      (exists.facilityId == facility.id ||
        (department && exists.departmentId == (department as Department).id))
    ) {
      throw new ConflictException(
        'Drug already exists in facility or department',
      );
    }
  }
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
