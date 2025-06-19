import {
  Controller,
  Body,
  HttpStatus,
  Logger,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import { UpdateRequestStatusDto } from './dto/create.dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/core/shared/docs/decorators';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from 'src/core/shared/responses/success.response';
import { throwError } from 'src/core/shared/responses/error.response';
import {
  FindRequestPaginationDto,
  GetDepartmentRequestDto,
  GetDepartmentRequestResponseDto,
  GetSpecificRequestResponseDto,
} from './dto/';
import { GetUser } from 'src/auth/decorator';
import { IUserPayload } from '../auth/interface/payload.interface';

@ApiTags('Department Requests')
@Controller('department-requests')
export class DepartmentRequestsController {
  private logger = new Logger(DepartmentRequestsController.name);

  constructor(
    private readonly departmentRequestsService: DepartmentRequestsService,
  ) {}

  @CustomApiResponse(['authorize', 'paginated'], {
    type: GetDepartmentRequestResponseDto,
    message: 'Requests fetched successfully',
  })
  @Get()
  async getRequests(
    @Query() query: FindRequestPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.departmentRequestsService.fetchAll(
        query,
        user,
      );

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Requests fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetDepartmentRequestDto,
    message: 'Request status updated successfully',
  })
  @Put(':id')
  async updateRequest(
    @Body() data: UpdateRequestStatusDto,
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      const _response = await this.departmentRequestsService.updateStatus(
        id,
        data,
        userId,
      );

      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Request status updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['success', 'authorize'], {
    type: GetSpecificRequestResponseDto,
    message: 'Request fetched successfully',
  })
  @Get(':id')
  async getRequest(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const response = await this.departmentRequestsService.fetchOne(id);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Request fetched successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'successNull', 'notfound'], {
    message: 'Request deleted successfully',
  })
  @Delete(':id')
  async deleteRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub', ParseUUIDPipe) userId: string,
  ) {
    try {
      const _response = await this.departmentRequestsService.remove(id, userId);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Request deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
