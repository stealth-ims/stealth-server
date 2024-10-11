import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Logger,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
} from './dto/create-department-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators';
import { ApiSuccessResponseDto } from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { GetDepartmentRequestDto } from './dto/get.dto';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';

@ApiTags('Department Requests')
@Controller('department-requests')
export class DepartmentRequestsController {
  private logger = new Logger(DepartmentRequestsController.name);

  constructor(
    private readonly departmentRequestsService: DepartmentRequestsService,
  ) {}

  @CustomApiResponse(['success', 'authorize'], {
    type: CreateDepartmentRequestDto,
    message: 'Request created successfully',
  })
  @Post()
  async create(@Body() createDepartmentRequestDto: CreateDepartmentRequestDto) {
    try {
      const response = await this.departmentRequestsService.create(
        createDepartmentRequestDto,
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
    type: GetDepartmentRequestDto,
    message: 'Requests fetched successfully',
  })
  @Get()
  async getRequests(@Query() query: PaginationRequestDto) {
    try {
      const response = await this.departmentRequestsService.fetchAll(query);

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
    type: GetDepartmentRequestDto,
    message: 'Request updated successfully',
  })
  @Patch(':id')
  async updateRequest(
    @Body() data: UpdateDepartmentRequestDto,
    @Param() id: string,
  ) {
    try {
      const response = await this.departmentRequestsService.update(id, data);

      return new ApiSuccessResponseDto(
        response,
        HttpStatus.OK,
        'Request updated successfully',
      );
    } catch (error) {
      throwError(this.logger, error);
    }
  }
}
