import { ItemCategory } from '../items-category/models/items-category.model';
import { Batch, Markup } from '../items/models';
import { Item } from '../items/models/item.model';
import { Supplier } from '../suppliers/models/supplier.model';
import { StockAdjustment } from './stock-adjustment.model';

export const InventoryModels = [
  Item,
  Batch,
  ItemCategory,
  Supplier,
  StockAdjustment,
  Markup,
];
