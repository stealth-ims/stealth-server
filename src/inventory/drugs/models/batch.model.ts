import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { BaseModel } from 'src/shared/models/base.model';
import { ApiProperty } from '@nestjs/swagger';
import { Drug } from '.';

@Table({
  tableName: 'batches',
  underscored: true,
  paranoid: true,
  timestamps: true,
})
export class Batch extends BaseModel {
  @ForeignKey(() => Drug)
  @Column(DataType.UUID)
  drugId: string;

  @ApiProperty({
    description: 'The drug this batch belongs to',
    type: () => Drug,
  })
  @BelongsTo(() => Drug)
  drug: Drug;

  @ApiProperty({
    example: '2024-12-31',
    description: 'The expiry date of this batch',
  })
  @Column({ type: DataType.DATE, allowNull: false })
  validity: Date;

  @ApiProperty({
    example: 'BATCH123',
    description: 'The batch number',
  })
  @Column
  batchNumber: string;

  @ApiProperty({
    example: 100,
    description: 'The quantity of drugs in this batch',
  })
  @Column({ type: DataType.INTEGER, allowNull: false })
  quantity: number;

  @ForeignKey(() => Supplier)
  @Column
  supplierId: string;

  @ApiProperty({
    description: 'The supplier for this batch',
    type: () => Supplier,
  })
  @BelongsTo(() => Supplier)
  supplier: Supplier;
}
