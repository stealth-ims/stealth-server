import { PickType } from '@nestjs/swagger';
import { ItemCategory } from '../models/items-category.model';

export class CreateItemsCategoryDto extends PickType(ItemCategory, ['name']) {}
