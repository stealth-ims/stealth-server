import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ItemCategoryExists } from '../../../core/shared/validators/item-category-exists.validator';
import { User } from '../../../auth/models/user.model';

export enum DosageForm {
  SOLIDS = 'SOLIDS',
  LIQUIDS = 'LIQUIDS',
  TABLET = 'TABLET',
  INJECTION = 'INJECTION',
  SYRUP = 'SYRUP',
  CAPSULE = 'CAPSULE',
  CREAM = 'CREAM',
  OINTMENT = 'OINTMENT',
  LOTION = 'LOTION',
  GEL = 'GEL',
  SUSPENSION = 'SUSPENSION',
  DROPS = 'DROPS',
  SPRAY = 'SPRAY',
  POWDER = 'POWDER',
  SUPPORSITORY = 'SUPPORSITORY',
  INHALER = 'INHALER',
  PATCH = 'PATCH',
  LOZENGE = 'LOZENGE',
  MOUTHWASH = 'MOUTHWASH',
  SHAMPOO = 'SHAMPOO',
  PESSARY = 'PESSARY',
}

export enum ItemStatus {
  LOW = 'LOW',
  STOCKED = 'STOCKED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}
export class CreateItemDto {
  @ApiProperty({
    example: 'Item Name',
    description: 'The name of the item',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Brand Name',
    description: 'The brand name of the item',
  })
  @IsOptional()
  @IsString()
  brandName: string;

  @ApiProperty({
    example: 10.99,
    description: 'The cost price of the item',
  })
  @IsNumber()
  costPrice: number;

  @ApiProperty({
    example: 19.99,
    description: 'The selling price of the item',
  })
  @IsNumber()
  sellingPrice: number;

  @ApiProperty({
    example: DosageForm.LIQUIDS,
    enum: DosageForm,
    description: 'The dosage form of the item',
  })
  @IsNotEmpty()
  @IsEnum(DosageForm)
  dosageForm: DosageForm;

  @ApiPropertyOptional({
    example: 'ABC-DGU-123',
    description: 'The code of the item',
  })
  @IsOptional()
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: 'FDA123',
    description: 'The FDA approval of the item',
  })
  @IsOptional()
  @IsString()
  fdaApproval: string;

  @ApiPropertyOptional({
    example: 'ISO123',
    description: 'The ISO certification of the item',
  })
  @IsOptional()
  @IsString()
  ISO: string;

  @ApiProperty({
    example: 10,
    description: 'The reorder point of the item',
  })
  @IsNumber()
  reorderPoint: number;

  @ApiPropertyOptional({
    example: 'strength',
    description: 'The strength of the item',
  })
  @IsOptional()
  @IsString()
  strength: string;

  @ApiPropertyOptional({
    example: 'gramms',
    description: 'The unit of measurement of the item',
  })
  @IsOptional()
  @IsString()
  unitOfMeasurement: string;

  @ApiPropertyOptional({
    example: 'Manufacturer Name',
    description: 'The manufacturer of the item',
  })
  @IsOptional()
  @IsString()
  manufacturer: string;

  @ApiPropertyOptional({
    example: 'Store in a cool, dry place',
    description: 'The storage requirements of the item',
  })
  @IsOptional()
  @IsString()
  storageReq: string;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The category ID of the item',
  })
  @IsUUID()
  @ItemCategoryExists()
  categoryId: string;

  @ApiResponseProperty({
    type: () => User,
    example: { id: '44220956-0962-4dd0-9e65-1564c585563c', fullName: 'Kratos' },
  })
  createdBy: User;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  createdById: string;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  facilityId: string;

  @ApiResponseProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
  })
  departmentId: string;

  @ApiResponseProperty({
    example: ItemStatus.OUT_OF_STOCK,
    enum: ItemStatus,
  })
  status: ItemStatus;
}
