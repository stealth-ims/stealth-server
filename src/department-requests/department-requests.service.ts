import { Injectable } from '@nestjs/common';
import { CreateDepartmentRequestDto } from './dto/create-department-request.dto';

@Injectable()
export class DepartmentRequestsService {
  create(_: CreateDepartmentRequestDto) {
    return 'This action adds a new departmentRequest';
  }
}
