import { UUID } from 'sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  Model,
  UpdatedAt,
} from 'sequelize-typescript';

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

  // @ForeignKey(() => User)
  // @Column({ field: 'created_by_id' })
  // createdById: string;

  // @BelongsTo(() => User)
  // createdBy: User;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt: Date;

  // @AllowNull
  // @ForeignKey(() => User)
  // @Column({ field: 'updated_by_id })
  // updatedById: string;

  // @BelongsTo(() => User)
  // updatedBy: User;

  // @DeletedAt
  // @Column({ type: DataType.DATE, field: 'deleted_at' })
  // deletedAt: Date;

  // @AllowNull
  // @ForeignKey(() => User)
  // @Column({ field: 'deleted_by_id })
  // deletedById: string;

  // @BelongsTo(() => User)
  // deletedBy: User;
}
