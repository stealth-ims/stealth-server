import { IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { ItemCategory } from '../models/items-category.model';

export class ItemCategoryResponse extends IntersectionType(
  ItemCategory,
  GenericResponseDto,
) {}
