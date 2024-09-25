import { PartialType } from '@nestjs/swagger';
import { CreateDrugsCategoryDto } from './create-drugs.category.dto';

export class UpdateDrugsCategoryDto extends PartialType(CreateDrugsCategoryDto) {}
