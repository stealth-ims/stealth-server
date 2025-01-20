import { IsEnum, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
import {
  AfterFind,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Department } from 'src/admin/department/models/department.model';
import { Facility } from 'src/admin/facility/models/facility.model';
import { Batch, Item } from 'src/inventory/items/models';
import { BaseModel } from 'src/shared/models/base.model';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { User } from '../../auth/models/user.model';

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
})
export class StockAdjustment extends BaseModel {
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
  @IsNotEmpty()
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
    example: 'John Doe,58dceb42-02bb-465f-bd5d-4b52ef181a18',
  })
  @Column
  createdBy: string;

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

  @AfterFind
  static async addCreatedByUser(
    stockAdjustments: StockAdjustment | StockAdjustment[],
  ) {
    const records = Array.isArray(stockAdjustments)
      ? stockAdjustments
      : [stockAdjustments];

    if (!records.length) return;

    const createdByNotExist = records.every((record) => !record.createdBy);
    if (createdByNotExist) return;

    const userIds = records.map((record) => record.createdBy);

    const users = await User.findAll({
      where: {
        id: userIds,
      },
      attributes: ['id', 'fullName', 'email'],
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    for (const record of records) {
      const user = userMap.get(record.createdBy) || null;

      record.createdBy = `${user.fullName},${user.id}`;
    }
  }
}
