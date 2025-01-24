import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinDate,
} from 'class-validator';
import { ItemExists, SupplierExists } from '../../../../shared/validators';
import { CreateItemDto } from '../../dto';
import { format } from 'date-fns';
import { Type } from 'class-transformer';

export class CreateBatchDto extends PickType(CreateItemDto, ['createdById']) {
  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The supplier ID of the item',
  })
  @IsUUID()
  @SupplierExists()
  supplierId: string;

  @ApiProperty({
    example: 'BATCH123',
    description: 'The batch number of the item',
  })
  @IsString()
  batchNumber: string;

  @ApiProperty({
    example: 100,
    description: 'The stock quantity of the item',
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: format(new Date(), 'yyyy-MM-dd'),
    description: 'The validity of the item',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @MinDate(new Date())
  validity: Date;

  @ApiProperty({
    example: '44220956-0962-4dd0-9e65-1564c585563c',
    description: 'The item ID',
  })
  @IsUUID()
  @ItemExists()
  itemId: string;
}
