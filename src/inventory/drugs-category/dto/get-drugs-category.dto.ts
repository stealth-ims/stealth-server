import { IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from 'src/shared/docs/dto/base.dto';
import { DrugsCategory } from '../models/drugs-category.model';

export class DrugsCategoryResponse extends IntersectionType(
  DrugsCategory,
  GenericResponseDto,
) {}
