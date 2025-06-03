import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Batch, Item } from '../models';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { FindAndCountOptions, IncludeOptions, Op, QueryTypes } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBatchDto, FetchBatchesQueryDto, UpdateBatchDto } from './dto';
import { generateFilter } from '../../../core/shared/factory';
import { User } from '../../../auth/models/user.model';
import { QueryOptionsDto } from '../../../core/shared/dto/query-options.dto';
import { Department } from '../../../admin/department/models/department.model';
import { Facility } from '../../../admin/facility/models/facility.model';
import { buildQuery } from '../../../core/shared/factory/query-builder.factory';

@Injectable()
export class BatchService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Batch) private readonly batchRepo: typeof Batch,
    private readonly supplierService: SuppliersService,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(BatchService.name);
  }

  private populates: Record<string, IncludeOptions> = {
    supplier: { model: Supplier, attributes: ['id', 'name'] },

    createdBy: { model: User, attributes: ['id', 'fullName', 'email'] },

    item: { model: Item, attributes: ['id', 'name'] },

    department: { model: Department, attributes: ['id', 'name'] },

    facility: { model: Facility, attributes: ['id', 'name'] },
  };

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const supplier = await this.supplierService.exists(
      createBatchDto.supplierId,
    );
    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${createBatchDto.supplierId} not found`,
      );
    }

    this.logger.log(`Creating batch for itemId: ${createBatchDto.itemId}...`);

    let batch: Batch;
    batch = await this.batchRepo.findOne<Batch>({
      where: {
        batchNumber: createBatchDto.batchNumber,
        itemId: createBatchDto.itemId,
        deletedAt: { [Op.not]: null },
      },
      paranoid: false,
    });
    if (batch) {
      await batch.restore();
      await batch.update({ ...createBatchDto, createdAt: new Date() });
      this.logger.log(`Batch reinstated successfully. ID: ${batch.id}`);
    } else {
      batch = await this.batchRepo.create({ ...createBatchDto });
      this.logger.log(`Batch created successfully. ID: ${batch.id}`);
    }
    this.eventEmitter.emit('quantity.changed', {
      itemId: createBatchDto.itemId,
    });
    return batch;
  }

  async update(id: string, dto: UpdateBatchDto) {
    const result = await this.batchRepo.update(
      { ...dto },
      { where: { id: id } },
    );
    if (result[0] == 0) {
      throw new NotFoundException(`batch with id ${id} not found`);
    }

    if (dto.quantity) {
      const batch = await this.findOne(id);
      this.eventEmitter.emit('quantity.changed', { itemId: batch.itemId });
    }
    this.logger.log(`Updated item with ID: ${id}`);
    return;
  }

  async findAll(itemId?: string): Promise<Batch[]> {
    return await this.find({
      query: [{ itemId }],
      populate: ['supplier', 'createdBy'],
    });
  }

  async find(options?: QueryOptionsDto<Batch>) {
    const queryOptions = buildQuery<Batch>(options, this.populates);
    return this.batchRepo.findAll(queryOptions);
  }

  async findAndCount(options?: QueryOptionsDto<Batch>) {
    const queryOptions = buildQuery<Batch>(options, this.populates);
    return this.batchRepo.findAndCountAll(queryOptions);
  }

  async getAggregatedBatches(from: Date, to: Date) {
    const sequelize = this.batchRepo.sequelize;

    const [results] = await sequelize.query(
      `
        SELECT 
          DATE("updated_at") as day, 
          SUM("quantity") as totalQuantity
        FROM "sales"
        WHERE "updated_at" BETWEEN :from AND :to
        GROUP BY day
        ORDER BY day ASC
        `,
      {
        replacements: { from, to },
        type: QueryTypes.SELECT,
      },
    );

    return results;
  }

  async fetchAllPaginate(
    itemId: string,
    query: FetchBatchesQueryDto,
    departmentId: string,
  ) {
    const paginationFilter = generateFilter(query, {
      batchNumber: { [Op.iLike]: `%${query.search}%` },
    });
    const validityOptions: Record<string, any> = {};
    if (query.validityStartDate && query.validityEndDate) {
      validityOptions.validity = {
        [Op.between]: [query.validityStartDate, query.validityEndDate],
      };
    } else if (query.validityStartDate) {
      validityOptions.validity = {
        [Op.gte]: query.validityStartDate,
      };
    } else if (query.validityEndDate) {
      validityOptions.validity = {
        [Op.lte]: query.validityEndDate,
      };
    }

    const { rows, count } = await this.batchRepo.findAndCountAll({
      ...paginationFilter.pageFilter,
      where: {
        itemId,
        departmentId,
        ...paginationFilter.searchFilter,
        ...validityOptions,
      },
      attributes: ['id', 'createdAt', 'validity', 'batchNumber', 'quantity'],
      include: [
        { model: Supplier, attributes: ['id', 'name'] },
        { model: Item, attributes: ['id', 'name'] },
      ],
    });
    return { rows, count };
  }

  async findAllNoPaginate(itemId: string, departmentId: string) {
    return this.batchRepo.findAll({
      where: { itemId, departmentId },
      attributes: ['id', 'batchNumber', 'quantity'],
      order: [['updatedAt', 'DESC']],
    });
  }

  async findBySpecs(options?: FindAndCountOptions<Batch>) {
    return this.batchRepo.findAndCountAll(options);
  }

  async calculateTotalBatchStock(whereOptions: any) {
    const total = await this.batchRepo.findAll({
      where: { ...whereOptions },
      attributes: ['id', 'quantity'],
    });
    const totalStock: number = total.reduce(
      (total, batch) => total + batch.quantity,
      0,
    );
    return totalStock;
  }

  async calculateTotalStock(whereOptions: any) {
    const total = await this.batchRepo.findAll({
      attributes: ['id', 'quantity'],
      include: [
        {
          model: Item,
          attributes: [],
          where: {
            ...whereOptions,
          },
        },
      ],
    });
    const totalStock: number = total.reduce(
      (total, batch) => total + batch.quantity,
      0,
    );
    return totalStock;
  }

  async findOne(id: string, isPopulated: boolean = false): Promise<Batch> {
    let options = {};
    if (isPopulated) {
      options = {
        attributes: ['id', 'createdAt', 'validity', 'batchNumber', 'quantity'],
        include: [
          { model: Supplier, attributes: ['id', 'name'] },
          { model: Item, attributes: ['id', 'name'] },
        ],
      };
    } else {
      options = {
        include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
      };
    }
    const batch = await this.batchRepo.findByPk(id, {
      ...options,
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async findIndividual(id: string) {
    this.logger.log(`finding a batch`);
    const batch = await this.batchRepo.findByPk(id, {
      attributes: [['id', 'batchId'], 'batchNumber'],
      include: [
        { model: Item, attributes: ['name', 'brandName', 'sellingPrice'] },
      ],
    });
    if (!batch) {
      throw new NotFoundException(`Batch not found`);
    }

    return batch;
  }

  async removeStock(id: string, qty: number): Promise<void> {
    const batch = await this.findOne(id);
    const itemId = batch.itemId;
    if (batch.quantity - qty < 0)
      throw new BadRequestException('Insufficient stock in batch');

    batch.quantity -= qty;
    if (batch.quantity == 0) {
      await batch.destroy();
    } else {
      await batch.save();
    }
    this.eventEmitter.emit('quantity.changed', { itemId: itemId });
    this.logger.log(`Stock removed from batch. ID: ${id}`);
  }

  async increaseStock(id: string, qty: number): Promise<void> {
    const batch = await this.findOne(id);
    const itemId = batch.itemId;

    batch.quantity += qty;
    await batch.save();
    this.eventEmitter.emit('quantity.changed', { itemId: itemId });
    this.logger.log(`Stock added to batch. ID: ${id}`);
  }

  // async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
  //   const batch = await this.findOne(id);
  //   await batch.update(updateBatchDto);
  //   this.logger.log(`Batch updated successfully. ID: ${id}`);
  //   return batch;
  // }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    this.eventEmitter.emit('quantity.changed', { itemId: batch.itemId });
    await batch.destroy();
    this.logger.log(`Batch deleted successfully. ID: ${id}`);
  }
}
