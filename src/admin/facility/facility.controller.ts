import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FacilityService } from './facility.service';
import { CreateFacilityDto, FacilityResponse, UpdateFacilityDto } from './dto';
import { Facility } from './models/facility.model';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../../utils/responses/success.response';
import { PaginationRequestDto } from '../../shared/docs/dto/pagination.dto';
import { throwError } from '../../utils/responses/error.response';
import { CustomApiResponse } from '../../shared/docs/decorators';
import { ApiTags } from '@nestjs/swagger';
import { GetUser, Public, Roles } from '../../auth/decorator';
import { Role } from '../../auth/interface/roles.enum';

@ApiTags('Facility')
@Public()
@Roles(Role.HospitalAdmin, Role.RegionalAdmin, Role.NationalAdmin)
@Controller('facilities')
export class FacilityController {
  private readonly logger;
  constructor(private readonly facilityService: FacilityService) {
    this.logger = new Logger(FacilityController.name);
  }

  @Post()
  @CustomApiResponse(['created'], {
    type: FacilityResponse,
    message: 'Facility created successfully',
  })
  async addFacility(@Body() dto: CreateFacilityDto) {
    try {
      const response = await this.facilityService.create(dto);
      return new ApiSuccessResponseDto<Facility>(
        response,
        HttpStatus.CREATED,
        'Facility created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @Get()
  @CustomApiResponse(['paginated'], {
    type: FacilityResponse,
    message: 'Facilities retrieved successfully',
  })
  async getFacilities(@Query() query: PaginationRequestDto) {
    try {
      const { rows, count } = await this.facilityService.findAll(query);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto<Facility[]>(
          rows,
          query.page || 1,
          query.pageSize,
          count,
        ),
        HttpStatus.OK,
        'Facilities retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @Get(':id')
  @CustomApiResponse(['success', 'notfound'], {
    type: FacilityResponse,
    message: 'Facility retrieved successfully',
  })
  async getFacility(@Param('id') id: string) {
    try {
      const response = await this.facilityService.findOne(id);
      return new ApiSuccessResponseDto<Facility>(
        response,
        HttpStatus.OK,
        'Facility retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @Patch(':id')
  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Facility updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async updateFacility(
    @Body() dto: UpdateFacilityDto,
    @Param('id') id: string,
    @GetUser('sub', ParseUUIDPipe) adminId: string,
  ) {
    try {
      const _response = await this.facilityService.update(id, dto, adminId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Facility updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  @Delete(':id')
  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Facility deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  async deleteFacility(@Param('id') id: string) {
    try {
      await this.facilityService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Facility deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
