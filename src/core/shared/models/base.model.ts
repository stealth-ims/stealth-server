import { UUID } from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../../../auth/models/user.model';
import { ApiResponseProperty } from '@nestjs/swagger';

export abstract class BaseModel extends Model {
  @Column({
    type: UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt: Date;

  @AllowNull
  @ForeignKey(() => User)
  @Column({ field: 'created_by_id' })
  createdById: string;

  @ApiResponseProperty({
    type: () => User,
    example: {
      id: 'b7a3fb48-6b76-4998-9cd3-4de5b8a18837',
      name: 'Some Admin',
    },
  })
  @BelongsTo(() => User)
  createdBy: User;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt: Date;

  @AllowNull
  @ForeignKey(() => User)
  @Column({ field: 'updated_by_id' })
  updatedById: string;

  @ApiResponseProperty({
    type: () => User,
    example: null,
  })
  @BelongsTo(() => User)
  updatedBy: User;

  @AllowNull
  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  deletedAt: Date;

  @AllowNull
  @ForeignKey(() => User)
  @Column({ field: 'deleted_by_id' })
  deletedById: string;

  @ApiResponseProperty({
    type: () => User,
    example: null,
  })
  @BelongsTo(() => User)
  deletedBy: User;
}
