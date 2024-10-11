import { Injectable } from '@nestjs/common';
import {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
} from './dto/create-department-request.dto';
import { InjectModel } from '@nestjs/sequelize';
import { DepartmentRequest } from './models/department-requests.model';
import { DrugsService } from 'src/inventory/drugs/drugs.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { Department } from 'src/admin/department/models/department.model';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { GetDepartmentRequestDto } from './dto/get.dto';

@Injectable()
export class DepartmentRequestsService {
  private drugService = new DrugsService();
  private departmentService = new DepartmentService(Department);

  constructor(
    @InjectModel(DepartmentRequest)
    private reportRepository: typeof DepartmentRequest,
  ) {}

  async create(dto: CreateDepartmentRequestDto) {
    await this.departmentService.findOne(dto.departmentId);
    await this.drugService.findOne(+dto.drugId);

    dto.requestId = `R-${new Date().getTime()}`;
    dto.status = 'PENDING';

    const result = await this.reportRepository.create({
      ...dto,
    });

    return result;
  }

  async fetchAll(query: PaginationRequestDto) {
    const response = new PaginatedDataResponseDto<GetDepartmentRequestDto[]>(
      [],
      query.page || 1,
      query.pageSize,
      0,
    );

    return response;
  }

  async update(_: string, __: UpdateDepartmentRequestDto) {
    return new GetDepartmentRequestDto();
  }
}
