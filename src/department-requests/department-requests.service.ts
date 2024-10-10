import { Injectable } from '@nestjs/common';
import { CreateDepartmentRequestDto } from './dto/create-department-request.dto';
import { InjectModel } from '@nestjs/sequelize';
import { DepartmentRequest } from './models/department-requests.model';
import { DrugsService } from 'src/inventory/drugs/drugs.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { Department } from 'src/admin/department/models/department.model';

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
}
