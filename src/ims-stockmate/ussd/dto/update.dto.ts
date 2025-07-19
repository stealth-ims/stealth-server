import { PartialType } from '@nestjs/swagger';
import { CreateUssdDto } from './create.dto';

export class UpdateUssdDto extends PartialType(CreateUssdDto) {}
