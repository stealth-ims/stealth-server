import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
  UpdateRequestStatusDto,
} from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';
import { DepartmentRequest } from './models/department-requests.model';
import { ItemService } from 'src/inventory/items/items.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { GetDepartmentRequestDto } from './dto/';
import { Item } from '../inventory/items/models';
import { Department } from '../admin/department/models/department.model';
import { col, FindAttributeOptions, Op, WhereOptions } from 'sequelize';
import { IUserPayload } from '../auth/interface/payload.interface';
import { FacilityService } from '../admin/facility/facility.service';

@Injectable()
export class DepartmentRequestsService {
  constructor(
    @InjectModel(DepartmentRequest)
    private departmentRequestRepository: typeof DepartmentRequest,

    private itemService: ItemService,
    private departmentService: DepartmentService,
    private facilityService: FacilityService,
  ) {}

  async create(dto: CreateDepartmentRequestDto, user: IUserPayload) {
    await this.facilityService.findOne(user.facility);
    await this.departmentService.findOne(user.department);
    await this.itemService.findOne(dto.itemId);

    dto.requestNumber = `R-${new Date().getTime()}`;
    dto.status = 'PENDING';

    const result = await this.departmentRequestRepository.create({
      ...dto,
      departmentId: user.department,
      facilityId: user.facility,
    });

    return result;
  }

  async fetchAll(
    query: PaginationRequestDto,
    user: IUserPayload,
    isItem: boolean = false,
  ) {
    let attributes: FindAttributeOptions;
    let whereOptions: WhereOptions<DepartmentRequest>;
    if (isItem) {
      attributes = [
        'id',
        [col('department.name'), 'departmentName'],
        'requestNumber',
        [col('item.name'), 'itemName'],
        'quantity',
        ['created_at', 'dateRequested'],
        'status',
      ];
      whereOptions = {
        facilityId: user.facility,
      };
    } else {
      attributes = [
        'id',
        'requestNumber',
        [col('item.name'), 'itemName'],
        'quantity',
        ['created_at', 'dateRequested'],
        'status',
      ];
      whereOptions = {
        departmentId: user.department,
      };
    }
    const searchByName =
      (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {};
    const itemRequests = await this.departmentRequestRepository.findAndCountAll(
      {
        where: {
          ...whereOptions,
          ...searchByName,
        },
        attributes,
        limit: query.pageSize || 10,
        offset: query.pageSize * (query.page - 1) || 0,
        order: query.orderBy && [[query.orderBy, 'ASC']],
        distinct: true,
        include: [
          { model: Item, attributes: [] },
          { model: Department, attributes: [] },
        ],
      },
    );
    const response = new PaginatedDataResponseDto<GetDepartmentRequestDto[]>(
      itemRequests.rows,
      query.page || 1,
      query.pageSize,
      itemRequests.count,
    );

    return response;
  }

  async update(id: string, dto: UpdateDepartmentRequestDto) {
    const updatedRequest = await this.departmentRequestRepository.update(
      { ...dto },
      { where: { id } },
    );

    if (updatedRequest[0] == 0) {
      throw new NotFoundException('Request not found');
    }
    return;
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto) {
    const updatedRequest = await this.departmentRequestRepository.update(
      { ...dto },
      { where: { id } },
    );

    if (updatedRequest[0] == 0) {
      throw new NotFoundException('Request not found');
    }
    return;
  }

  async fetchOne(id: string) {
    const request = await this.departmentRequestRepository.findByPk(id, {
      attributes: ['id', 'quantity', 'additionalNotes'],
      include: [{ model: Item, attributes: ['id', 'name'] }],
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  async remove(id: string) {
    const deletedRequest = await this.departmentRequestRepository.destroy({
      where: { id },
    });
    if (deletedRequest == 0) {
      throw new NotFoundException('Request not found');
    }
  }
}
