import { IntersectionType } from '@nestjs/swagger';
import { GenericResponseDto } from '../../../core/shared/dto/base.dto';
import { CreateFacilityDto } from './create.dto';

export class FacilityResponse extends IntersectionType(
  CreateFacilityDto,
  GenericResponseDto,
) {}
