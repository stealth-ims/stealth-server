import { Controller, Post, Body } from '@nestjs/common';
import { DepartmentRequestsService } from './department-requests.service';
import { CreateDepartmentRequestDto } from './dto/create-department-request.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Department Requests')
@Controller('department-requests')
export class DepartmentRequestsController {
  constructor(
    private readonly departmentRequestsService: DepartmentRequestsService,
  ) {}

  @Post()
  create(@Body() createDepartmentRequestDto: CreateDepartmentRequestDto) {
    return this.departmentRequestsService.create(createDepartmentRequestDto);
  }
}
