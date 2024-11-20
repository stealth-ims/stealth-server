import { Injectable } from '@nestjs/common';
import {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
} from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';
import { DepartmentRequest } from './models/department-requests.model';
import { DrugsService } from 'src/inventory/items/items.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { GetDepartmentRequestDto } from './dto/';

@Injectable()
export class DepartmentRequestsService {
  constructor(
    @InjectModel(DepartmentRequest)
    private reportRepository: typeof DepartmentRequest,

    private drugService: DrugsService,
    private departmentService: DepartmentService,
  ) {}

  async create(dto: CreateDepartmentRequestDto, departmentId: string) {
    await this.departmentService.findOne(departmentId);
    await this.drugService.findOne(dto.drugId);

    dto.requestNumber = `R-${new Date().getTime()}`;
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

  async fetchOne(_: string) {
    return new GetDepartmentRequestDto();
  }
}
