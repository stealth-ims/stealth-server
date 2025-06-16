import { PartialType } from '@nestjs/swagger';
import { CreateMarkupDto } from './create.dto';

export class UpdateMarkupDto extends PartialType(CreateMarkupDto) {}
