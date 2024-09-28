import { PartialType, PickType } from '@nestjs/swagger';
import { DrugsCategory } from '../models/drugs-category.model';

export class UpdateDrugsCategoryDto extends PartialType(
  PickType(DrugsCategory, ['name', 'status']),
) {}
