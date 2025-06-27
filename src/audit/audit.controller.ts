import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { AuditsService } from './audit.service';
import {
  AuditLogResponseDto,
  AuditLogsResponseDto,
  FindAuditLogQueryDto,
} from './dto';
import { GetUser, Permission } from '../auth/decorator';
import { IUserPayload } from '../auth/interface/payload.interface';
import {
  ApiSuccessResponseDto,
  PaginatedDataResponseDto,
} from '../core/shared/responses/success.response';
import { throwError } from '../core/shared/responses/error.response';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import {
  Features,
  PermissionLevel,
} from '../core/shared/enums/permissions.enum';

@Controller('audits')
export class AuditsController {
  private logger = new Logger(AuditsController.name);
  constructor(private readonly auditsService: AuditsService) {}

  @CustomApiResponse(['paginated', 'authorize'], {
    type: AuditLogsResponseDto,
    message: 'Audit logs fetched successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get()
  async findAll(
    @Query() query: FindAuditLogQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      query.facilityId = user.facility;
      query.userDepartmentId = user.department;
      const response = await this.auditsService.findAll(query);
      const paginated = new PaginatedDataResponseDto(
        response.rows,
        query.page || 1,
        query.pageSize,
        response.count,
      );
      return new ApiSuccessResponseDto(
        paginated,
        HttpStatus.OK,
        'Audit logs fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'notfound', 'authorize'], {
    type: AuditLogResponseDto,
    message: 'Audit log fetched successfully',
  })
  @Permission(Features.REPORTS, PermissionLevel.READ)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const response = await this.auditsService.findOne(id);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Audit log fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
