import { OmitType } from '@nestjs/swagger';
import { MarkupDto } from './markup.dto';

export class CreateMarkupDto extends OmitType(MarkupDto, [
  'id',
  'createdAt',
  'updatedAt',
]) {}
