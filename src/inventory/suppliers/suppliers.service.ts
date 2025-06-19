import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StatusType, Supplier } from './models/supplier.model';
import { CreateSupplierDto, GetSupplierDto, UpdateSupplierDto } from './dto';
import { FindAndCountOptions, literal, Op } from 'sequelize';
import { Batch } from '../items/models';
import { generateFilter } from '../../core/shared/factory';
import { IUserPayload } from '../../auth/interface/payload.interface';

@Injectable()
export class SuppliersService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Supplier) private readonly supplierRepo: typeof Supplier,
  ) {
    this.logger = new Logger(SuppliersService.name);
  }
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
    const paginateObject = query
      ? {
          where: {
            [Op.and]: [
              { facilityId },
              query.search && {
                name: { [Op.iLike]: `%${query.search}%` },
              },
              query.status && {
                status: query.status,
              },
              queryFilter.searchFilter,
            ],
          },
          ...queryFilter.pageFilter,
        }
      : {};

    const filter: FindAndCountOptions<Supplier> = {
      ...paginateObject,
      order: query
        ? query.orderBy && [[query.orderBy, 'ASC']]
        : [
            [
              literal(`
        CASE 
          WHEN status = 'Deactivated' THEN 1
          WHEN status = 'Active' THEN 2
        END
      `),
              'ASC',
            ],
          ],
      attributes: [
        'id',
        'name',
        'createdAt',
        'phoneNumber',
        'status',
        'city',
        'physicalAddress',
      ],
      include: { model: Batch, attributes: ['quantity'] },
      distinct: true,
    };
    const suppliers = await this.supplierRepo.findAndCountAll(filter);

    const modifiedSuppliers = suppliers.rows.map((supplier) => {
      const modified: Supplier = supplier.get({ plain: true });
      delete modified.batches;
      return modified;
    });

    this.logger.log(`Retrieved ${suppliers.count} supplier(s)`);
    return [modifiedSuppliers, suppliers.count];
  }

  async exists(id: string) {
    const supplier = await this.supplierRepo.findByPk(id);
    return supplier;
  }

  async findOne(id: string): Promise<Supplier> {
    this.logger.log(`Finding supplier with ID: ${id}`);
    const supplier = await this.supplierRepo.findByPk(id, {
      attributes: { exclude: ['status'] },
      include: { model: Batch, attributes: ['quantity'] },
    });

    if (!supplier) {
      throw new NotFoundException(`supplier with id: ${id} not found`);
    }
    const modifiedSupplier: Supplier = supplier.get({ plain: true });
    // delete modifiedSupplier.totalItems;
    delete modifiedSupplier.batches;
    // if (modifiedSupplier.paymentType == 'Bank') {
    //   delete modifiedSupplier.provider;
    //   delete modifiedSupplier.mobileMoneyPhoneNumber;
    // } else {
    //   delete modifiedSupplier.bankName;
    //   delete modifiedSupplier.accountType;
    //   delete modifiedSupplier.accountNumber;
    // }
    this.logger.log(`Found suppliier with ID: ${id}`);
    return modifiedSupplier;
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

  async remove(id: string) {
    const supplier = await this.supplierRepo.destroy({
      where: { id },
      force: true,
    });
    if (supplier == 0) {
      throw new NotFoundException('Supplier not found');
    }
    return;
  }

  async removeBulk(ids: string[]) {
    const supplier = await this.supplierRepo.destroy({
      where: { id: ids },
      force: true,
    });
    if (supplier == 0) {
      throw new NotFoundException('Suppliers not found');
    }
    return;
  }
}
