import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { Batch, Item } from 'src/inventory/items/models';
import { BaseModel } from 'src/core/shared/models/base.model';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { User } from 'src/auth/models/user.model';
import { deleteByPattern } from 'src/core/shared/modules/cache/utils/delete-prefix.util';

export enum StockAdjustmentType {
  REDUCTION = 'REDUCTION',
  INCREMENT = 'INCREMENT',
}

export enum StockAdjustmentStatus {
  SUBMITTED = 'SUBMITTED',
  ADJUSTED = 'ADJUSTED',
  REJECTED = 'REJECTED',
}

@Table({
  tableName: 'stock_adjustments',
  underscored: true,
  timestamps: true,
  paranoid: true,
})
export class StockAdjustment extends BaseModel<StockAdjustment> {
  @ApiProperty({
    example: 100,
    description: 'The quantity being adjusted',
  })
  @Column
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: StockAdjustmentType.REDUCTION,
    enum: StockAdjustmentType,
    description: 'The type of stock adjustment',
  })
  @IsNotEmpty()
  @IsEnum(StockAdjustmentType)
  @Column
  type: StockAdjustmentType;

  @ApiProperty({
    example: 'Expired stock',
    description: 'The reason for the stock adjustment',
  })
  @IsString()
  @IsNotEmpty()
  @Column
  reason: string;

  @ApiProperty({
    example: 'Additional details about the adjustment',
    description: 'Notes about the stock adjustment',
  })
  @Column(DataType.TEXT)
  @IsOptional()
  notes: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The ID of the item being adjusted',
  })
  @ForeignKey(() => Item)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @BelongsTo(() => Item)
  item: Item;

  @ApiProperty({
    example: 'fr220956-0962-4de0-9e65-1564c585563c',
    description: 'The ID of the affected batch',
  })
  @ForeignKey(() => Batch)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  @IsNotEmpty()
  @IsUUID()
  batchId: string;

  @BelongsTo(() => Batch)
  batch: Batch;

  @ApiResponseProperty({
    example: StockAdjustmentStatus.ADJUSTED,
    enum: StockAdjustmentStatus,
  })
  @Column
  status: StockAdjustmentStatus;

  @ApiResponseProperty({
    example: 'af7c1fe6-d669-414e-b066-e9733f0de7a8',
  })
  @ForeignKey(() => Facility)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  facilityId: string;

  @BelongsTo(() => Facility)
  facility: Facility;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  @ForeignKey(() => Department)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  departmentId: string;

  @BelongsTo(() => Department)
  department: Department;

  @ForeignKey(() => User)
  @Column
  createdById: string;

  @ApiResponseProperty({
    type: () => User,
    example: {
      id: '1d7d855b-7990-49ae-86a4-ca744ca55884',
      fullName: 'Ebenezer Domey',
    },
  })
  @BelongsTo(() => User)
  createdBy: User;

  @ForeignKey(() => User)
  @Column
  updatedById: string;

  @BelongsTo(() => User)
  updatedBy: User;

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
    await deleteByPattern(process.env.REDIS_URL, 'stock-adjustments*');
  }
}
