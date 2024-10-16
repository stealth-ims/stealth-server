import { DrugsCategory } from '../drugs-category/models/drugs-category.model';
import { Batch } from '../drugs/models';
import { Drug } from '../drugs/models/drug.model';
import { Supplier } from '../suppliers/models/supplier.model';

export const InventoryModels = [Drug, Batch, DrugsCategory, Supplier];
