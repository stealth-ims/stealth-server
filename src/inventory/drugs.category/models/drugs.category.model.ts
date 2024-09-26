import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Table } from 'sequelize-typescript';
import { BaseModel } from 'src/shared/models/base.model';

@Table({
  tableName: 'drug_categories',
  underscored: true,
})
export class DrugsCategory extends BaseModel {
  @ApiProperty({
    example: "laxatives",
    description: "drug category name"
  })
  @Column
  name: string;

  @ApiProperty({
    example: "ACTIVE",
    description: "drug category status"
  })
  @Column({ type: DataType.ENUM('ACTIVE', 'DEACTIVATED'), defaultValue: 'ACTIVE' })
  status: DrugsCategoryStatus;

  @ApiProperty({
    example: "100",
    description: "Number of drugs in category"
  })
  @Column({ type: DataType.INTEGER, field: 'drug_count' })
  drugCount: number;
}

export enum DrugsCategoryStatus {
  ACTIVE = "ACTIVE",
  DEACTIVATED = "DEACTIVATED"
}