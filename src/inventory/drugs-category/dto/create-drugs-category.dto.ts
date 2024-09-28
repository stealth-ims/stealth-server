import { PickType } from '@nestjs/swagger';
import { DrugsCategory } from '../models/drugs-category.model';

export class CreateDrugsCategoryDto extends PickType(DrugsCategory, ['name']) {}
