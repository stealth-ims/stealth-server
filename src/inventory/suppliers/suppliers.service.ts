import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StatusType, Supplier } from './models/supplier.model';
import { CreateSupplierDto, GetSupplierDto, UpdateSupplierDto } from './dto';
import { FindAndCountOptions, IncludeOptions, Op } from 'sequelize';
import { buildQuery, generateFilter } from '../../core/shared/factory';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { QueryOptionsDto } from '../../core/shared/dto/query-options.dto';
import { Department } from '../../admin/department/models/department.model';
import { Facility } from '../../admin/facility/models/facility.model';
import { User } from '../../auth/models/user.model';
import { Batch } from '../items/models';

@Injectable()
export class SuppliersService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Supplier) private readonly supplierRepo: typeof Supplier,
  ) {
    this.logger = new Logger(SuppliersService.name);
  }

  private populates: Record<string, IncludeOptions> = {
    department: { model: Department, attributes: ['id', 'name'] },

    facility: { model: Facility, attributes: ['id', 'name'] },

    batches: {
      model: Batch,
      attributes: ['id', 'batchNumber', 'quantity', 'validity'],
    },

    createdBy: {
      model: User,
      as: 'createdBy',
      attributes: ['id', 'fullName', 'email'],
    },

    updatedBy: {
      model: User,
      as: 'updatedBy',
      attributes: ['id', 'fullName', 'email'],
    },
  };

  async create(
    createSupplierDto: CreateSupplierDto,
    user: IUserPayload,
  ): Promise<Supplier> {
    const supplier = await this.supplierRepo.create({
      ...createSupplierDto,
      facilityId: user.facility,
      createdById: user.sub,
    });

    this.logger.log(`Created supplier with ID: ${supplier.id}`);
    return supplier;
  }

  async findAllNoPaginate(facilityId: string): Promise<Supplier[]> {
    const filter: FindAndCountOptions<Supplier> = {
      where: { facilityId, status: StatusType.ACTIVE },
      attributes: ['id', 'name'],
      order: [['updatedAt', 'DESC']],
      distinct: true,
    };
    const suppliers = await this.supplierRepo.findAndCountAll(filter);

    this.logger.log(`Retrieved ${suppliers.count} supplier(s)`);
    return suppliers.rows;
  }

  async findAll(
    facilityId: string,
    query?: GetSupplierDto,
  ): Promise<[Supplier[], number]> {
    // todo: refactor filter
    const queryFilter = generateFilter(query);
    const whereOptions: Record<string, any> = {
      facilityId,
    };

    if (query.search) {
      whereOptions.name = { [Op.iLike]: `${query.search}%` };
    }

    if (query.status) {
      whereOptions.status = query.status;
    }

    const filter: FindAndCountOptions<Supplier> = {
      where: { ...whereOptions, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      attributes: [
        'id',
        'name',
        'createdAt',
        'phoneNumber',
        'status',
        'city',
        'physicalAddress',
      ],

      distinct: true,
    };
    const suppliers = await this.supplierRepo.findAndCountAll(filter);

    this.logger.log(`Retrieved ${suppliers.count} supplier(s)`);
    return [suppliers.rows, suppliers.count];
  }

  async exists(id: string) {
    const supplier = await this.supplierRepo.findByPk(id);
    return supplier;
  }

  async fetchOne(options?: QueryOptionsDto<Supplier>) {
    const queryOptions = buildQuery<Supplier>(options, this.populates);
    const supplier = await this.supplierRepo.findOne(queryOptions);
    return supplier;
  }

  async findOne(id: string): Promise<Supplier> {
    this.logger.log(`Finding supplier with ID: ${id}`);
    const supplier = await this.supplierRepo.findByPk(id, {
      attributes: { exclude: ['status'] },
    });

    if (!supplier) {
      throw new NotFoundException(`supplier with id: ${id} not found`);
    }
    this.logger.log(`Found suppliier with ID: ${id}`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, userId: string) {
    const updatedSupplier = await this.supplierRepo.update(
      { ...dto, updatedById: userId },
      { where: { id } },
    );

    if (updatedSupplier[0] == 0) {
      throw new NotFoundException('Supplier Not found');
    }
    return;
  }

  async changeStatus(id: string, status: StatusType, userId: string) {
    const updatedSupplier = await this.supplierRepo.update(
      { status, updatedById: userId },
      { where: { id } },
    );

    if (updatedSupplier[0] == 0) {
      throw new NotFoundException('Supplier not found');
    }
    return;
  }

  async remove(id: string, userId: string) {
    const supplier = await this.supplierRepo.destroy({
      where: { id },
      force: true,
      userId,
    } as any);
    if (supplier == 0) {
      throw new NotFoundException('Supplier not found');
    }
    return;
  }

  async removeBulk(ids: string[], userId: string) {
    const supplier = await this.supplierRepo.destroy({
      where: { id: ids },
      force: true,
      userId,
    } as any);
    if (supplier == 0) {
      throw new NotFoundException('Suppliers not found');
    }
    return;
  }
}
