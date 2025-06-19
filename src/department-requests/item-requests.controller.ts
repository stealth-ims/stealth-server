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
import { ApiTags } from '@nestjs/swagger';
import { DepartmentRequestsService } from './department-requests.service';
import {
  CreateDepartmentRequestDto,
  FindItemRequestPaginationDto,
  GetDepartmentRequestDto,
  GetItemRequestsResponseDto,
  GetSpecificRequestResponseDto,
  UpdateDepartmentRequestDto,
} from './dto';
import { CustomApiResponse } from '../core/shared/docs/decorators';
import { GetUser } from '../auth/decorator';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
} from '../core/shared/responses/success.response';
import { throwError } from '../core/shared/responses/error.response';
import { IUserPayload } from '../auth/interface/payload.interface';

@ApiTags('Department Item Requests')
@Controller('item-requests')
export class ItemRequestsController {
  private logger = new Logger(ItemRequestsController.name);

  constructor(
    private readonly departmentRequestsService: DepartmentRequestsService,
  ) {}

  @CustomApiResponse(['created', 'authorize'], {
    type: CreateDepartmentRequestDto,
    message: 'Request created successfully',
  })
  @Post()
  async create(
    @Body() createDepartmentRequestDto: CreateDepartmentRequestDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response = await this.departmentRequestsService.create(
        createDepartmentRequestDto,
        user,
      );

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.CREATED,
        'Request created successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }

  @CustomApiResponse(['authorize', 'paginated'], {
    type: GetItemRequestsResponseDto,
    message: 'Requests fetched successfully',
  })
  @Get()
  async getRequests(
    @Query() query: FindItemRequestPaginationDto,
    @GetUser() user: IUserPayload,
  ) {
    try {
      const response =
        await this.departmentRequestsService.fetchAllItemRequests(query, user);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Requests fetched successfully',
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

  @CustomApiResponse(['successNull', 'authorize', 'notfound'], {
    type: GetDepartmentRequestDto,
    message: 'Request updated successfully',
  })
  @Patch(':id')
  async updateRequest(
    @Body() data: UpdateDepartmentRequestDto,
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('sub') userId: string,
  ) {
    try {
      const _response = await this.departmentRequestsService.update(
        id,
        data,
        userId,
      );

      return new ApiSuccessResponseNoData(
        HttpStatus.OK,
        'Request updated successfully',
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
    @GetUser('sub') userId: string,
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
