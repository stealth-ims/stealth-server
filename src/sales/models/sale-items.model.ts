// import {
//   BelongsTo,
//   Column,
//   DataType,
//   ForeignKey,
//   Table,
// } from 'sequelize-typescript';
// import { BaseModel } from '../../shared/models/base.model';
// import { Item } from '../../inventory/items/models';

// @Table({
//   tableName: 'saleItems',
// })
// export class SaleItem extends BaseModel {
//   @ForeignKey(() => Item)
//   @Column({ type: DataType.UUID, field: 'item_id' })
//   itemId: string;

//   @BelongsTo(() => Item)
//   item: Item;
// }
