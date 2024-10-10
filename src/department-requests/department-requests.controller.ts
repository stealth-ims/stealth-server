import { Controller, Post, Body, HttpStatus, Logger } from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import { CreateDepartmentRequestDto } from './dto/create-department-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiResponse } from 'src/shared/docs/decorators';
import { ApiSuccessResponseDto } from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';

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
}
