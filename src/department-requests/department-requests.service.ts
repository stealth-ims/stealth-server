import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateDepartmentRequestDto,
  UpdateDepartmentRequestDto,
  UpdateRequestStatusDto,
} from './dto/create.dto';
import { InjectModel } from '@nestjs/sequelize';
import { DepartmentRequest } from './models/department-requests.model';
import { ItemService } from 'src/inventory/items/items.service';
import { DepartmentService } from 'src/admin/department/department.service';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import {
  FindItemRequestPaginationDto,
  FindRequestPaginationDto,
  GetDepartmentRequestDto,
} from './dto';
import { Item } from '../inventory/items/models';
import { Department } from '../admin/department/models/department.model';
import { col, FindAttributeOptions, Op, WhereOptions } from 'sequelize';
import { IUserPayload } from '../auth/interface/payload.interface';
import { FacilityService } from '../admin/facility/facility.service';
import { generateFilter } from '../core/shared/factory';

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
      createdById: user.sub,
    });

    return result;
  }

  async fetchAll(query: FindRequestPaginationDto, user: IUserPayload) {
    const queryFilter = generateFilter(query);

    if (user.department) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    const attributes: FindAttributeOptions = [
      'id',
      'departmentId',
      [col('department.name'), 'departmentName'],
      'requestNumber',
      'itemId',
      [col('item.name'), 'itemName'],
      'quantity',
      ['created_at', 'dateRequested'],
      'status',
    ];
    const whereOptions: WhereOptions<DepartmentRequest> = {
      [Op.and]: [
        { facilityId: user.facility },
        query.departmentId && { departmentId: query.departmentId },
        query.status && { status: query.status },
        query.itemId && { itemId: query.itemId },
      ],
    };

    const searchByName =
      (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {};
    const itemRequests = await this.departmentRequestRepository.findAndCountAll(
      {
        where: {
          ...whereOptions,
          ...searchByName,
          ...queryFilter.searchFilter,
        },
        attributes,
        ...queryFilter.pageFilter,
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

  async fetchAllItemRequests(
    query: FindItemRequestPaginationDto,
    user: IUserPayload,
  ) {
    const queryFilter = generateFilter(query);

    const attributes: FindAttributeOptions = [
      'id',
      'requestNumber',
      'itemId',
      [col('item.name'), 'itemName'],
      'quantity',
      ['created_at', 'dateRequested'],
      'status',
    ];

    const whereOptions: WhereOptions<DepartmentRequest> = {
      [Op.and]: [
        { departmentId: user.department },
        query.status && { status: query.status },
        query.itemId && { itemId: query.itemId },
      ],
    };

    const searchByName =
      (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {};
    const itemRequests = await this.departmentRequestRepository.findAndCountAll(
      {
        where: {
          ...whereOptions,
          ...searchByName,
          ...queryFilter.searchFilter,
        },
        attributes,
        ...queryFilter.pageFilter,
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

  async update(id: string, dto: UpdateDepartmentRequestDto, userId: string) {
    const updatedRequest = await this.departmentRequestRepository.update(
      { ...dto, updatedById: userId },
      { where: { id } },
    );

    if (updatedRequest[0] == 0) {
      throw new NotFoundException('Request not found');
    }
    return;
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto, userId: string) {
    const updatedRequest = await this.departmentRequestRepository.update(
      { ...dto, updatedById: userId },
      { where: { id } },
    );

    if (updatedRequest[0] == 0) {
      throw new NotFoundException('Request not found');
    }
    return;
  }

  async fetchOne(id: string) {
    const request = await this.departmentRequestRepository.findByPk(id, {
      attributes: ['id', 'quantity', 'additionalNotes', 'status'],
      include: [{ model: Item, attributes: ['id', 'name'] }],
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    return request;
  }

  async remove(id: string, userId: string) {
    await this.departmentRequestRepository.update(
      { deletedById: userId },
      { where: { id } },
    );
    const deletedRequest = await this.departmentRequestRepository.destroy({
      where: { id },
    });
    if (deletedRequest == 0) {
      throw new NotFoundException('Request not found');
    }
  }
}
