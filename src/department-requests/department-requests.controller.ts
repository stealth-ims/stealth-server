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
import { CustomApiResponse } from 'src/shared/docs/decorators';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import {
  GetDepartmentRequestDto,
  GetDepartmentRequestResponseDto,
} from './dto/';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
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
    @Query() query: PaginationRequestDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.departmentRequestsService.fetchAll(
        query,
        user,
        true,
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
  ) {
    try {
      const _response = await this.departmentRequestsService.updateStatus(
        id,
        data,
      );

      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Request status updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  // @CustomApiResponse(['success', 'authorize'], {
  //   type: GetDepartmentRequestDto,
  //   message: 'Request fetched successfully',
  // })
  // @Get(':id')
  // async getRequest(@Param() id: string) {
  //   try {
  //     const response = await this.departmentRequestsService.fetchOne(id);

  //     return new ApiSuccessResponseDto(
  //       response,
  //       HttpStatus.OK,
  //       'Request fetched successfully',
  //     );
  //   } catch (error) {
  //     throwError(this.logger, error);
  //   }
  // }

  @CustomApiResponse(['authorize', 'successNull', 'notfound'], {
    message: 'Request deleted successfully',
  })
  @Delete(':id')
  async deleteRequest(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const _response = await this.departmentRequestsService.remove(id);
      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Request deleted successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
