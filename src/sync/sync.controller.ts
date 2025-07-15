import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Logger,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import {
  CreateSyncDto,
  FindSyncRequestsQueryDto,
  GetSyncRequestDto,
  GetSyncRequestsDto,
} from './dto';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import { throwError } from '../core/shared/responses/error.response';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from '../core/shared/responses/success.response';
import { GetUser } from '../auth/decorator';
import { IUserPayload } from '../auth/interface/payload.interface';

@Controller('sync')
export class SyncController {
  private logger = new Logger(SyncController.name);
  constructor(private readonly syncService: SyncService) {}

  @CustomApiResponse(['successNull'], {
    message: 'Client synced successfully',
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() dto: CreateSyncDto) {
    try {
      const _response = await this.syncService.create(dto);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Client synced successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['paginated', 'authorize'], {
    type: GetSyncRequestsDto,
    message: 'Failed requests fetched successfully',
  })
  @Get()
  async findAll(
    @Query() query: FindSyncRequestsQueryDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.syncService.findAll(query, user);
      const paginated = new PaginatedDataResponseDto(
        response.rows,
        query.page || 1,
        query.pageSize,
        response.count,
      );
      return new ApiSuccessResponseDto(
        paginated,
        HttpStatus.OK,
        'Failed requests fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'success', 'notfound'], {
    type: GetSyncRequestDto,
    message: 'Failed request fetched successfully',
  })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const response = await this.syncService.findOne(id);
      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Failed request fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'successNull', 'notfound'], {
    message: 'Failed request deleted successfully',
  })
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const _response = await this.syncService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Failed request deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
