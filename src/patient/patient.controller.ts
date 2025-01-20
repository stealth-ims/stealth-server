import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import {
  CreatePatientDto,
  CreatePatientResponseDto,
  FindPatientDto,
  RetrievePatientDto,
  RetrievePatientsDto,
  UpdatePatientDto,
} from './dto';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../utils/responses/success.response';
import { CustomApiResponse } from '../shared/docs/decorators';
import { GetUser, Permission } from '../auth/decorator';
import { Features, PermissionLevel } from '../shared/enums/permissions.enum';
import { throwError } from '../utils/responses/error.response';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Patients')
@Controller('patients')
export class PatientController {
  private logger: Logger = new Logger(PatientController.name);
  constructor(private readonly patientService: PatientService) {}

  @CustomApiResponse(['created', 'authorize'], {
    type: CreatePatientResponseDto,
    message: 'Patient created successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE)
  @Post()
  async create(
    @Body() dto: CreatePatientDto,
    @GetUser('sub', ParseUUIDPipe) createdBy: string,
  ) {
    try {
      const response = await this.patientService.create(dto, createdBy);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.CREATED,
        'Patient created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: RetrievePatientsDto,
    isArray: true,
    message: 'Patients retrieved successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ)
  @Get()
  async findPatients(@Query() query: FindPatientDto) {
    try {
      const response = await this.patientService.findAll(query);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Patients retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @ApiQuery({
    name: 'populateSale',
    type: Boolean,
    required: false,
  })
  @CustomApiResponse(['success', 'authorize', 'notfound'], {
    type: RetrievePatientDto,
    message: 'Patient retrieved successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ)
  @Get(':id')
  async findPatient(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('populateSale') populateSale?: boolean,
  ) {
    try {
      const response = await this.patientService.findOne(id, populateSale);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Patient retrieved successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Patient updated successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE)
  @Patch(':id')
  async editPatient(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    try {
      const _response = await this.patientService.update(id, dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Patient updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    message: 'Patient deleted successfully',
  })
  @Permission(Features.SALES, PermissionLevel.READ_WRITE_DELETE)
  @Delete(':id')
  async deletePatient(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('stamp') deletedBy: string,
  ) {
    try {
      const _response = await this.patientService.remove(id, deletedBy);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Patient deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
