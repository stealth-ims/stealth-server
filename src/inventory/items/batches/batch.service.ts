import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Batch, Item, Markup } from '../models';
import { Supplier } from 'src/inventory/suppliers/models/supplier.model';
import { SuppliersService } from '../../suppliers/suppliers.service';
import { FindAndCountOptions, IncludeOptions, Op } from 'sequelize';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateBatchDto,
  FetchBatchesQueryDto,
  FetchStockLevelReportDataQueryDto,
  StockBatchDto,
  UpdateBatchDto,
} from './dto';
import { generateFilter } from '../../../core/shared/factory';
import { User } from '../../../auth/models/user.model';
import { QueryOptionsDto } from '../../../core/shared/dto/query-options.dto';
import { Department } from '../../../admin/department/models/department.model';
import { Facility } from '../../../admin/facility/models/facility.model';
import { buildQuery } from '../../../core/shared/factory/query-builder.factory';
import { IUserPayload } from '../../../auth/interface/payload.interface';
import { addDays, endOfDay, startOfDay, startOfToday } from 'date-fns';
import { MarkupService } from '../markup/markup.service';

@Injectable()
export class BatchService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Batch) private readonly batchRepo: typeof Batch,
    @InjectModel(Item) private readonly itemRepo: typeof Item,
    private readonly supplierService: SuppliersService,
    private readonly markupService: MarkupService,
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

    markup: {
      model: Markup,
      attributes: ['id', 'amountType', 'amount'],
    },
  };

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const existingBatch = await this.batchRepo.findOne({
      where: {
        batchNumber: createBatchDto.batchNumber,
        itemId: createBatchDto.itemId,
        facilityId: createBatchDto.facilityId,
        departmentId: createBatchDto.departmentId,
      },
    });

    if (existingBatch) {
      throw new BadRequestException('Batch already exists');
    }

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
    this.eventEmitter.emit('quantity.increased', {
      itemId: createBatchDto.itemId,
    });
    if (createBatchDto.markup) {
      createBatchDto.markup.batchId = batch.id;
      createBatchDto.markup.itemId = createBatchDto.itemId;
      createBatchDto.markup.createdById = createBatchDto.createdById;
      createBatchDto.markup.departmentId = createBatchDto.departmentId;
      createBatchDto.markup.facilityId = createBatchDto.facilityId;

      const _markup = await this.markupService.create(createBatchDto.markup);
    }
    return batch;
  }

  async stock(dto: StockBatchDto): Promise<Batch> {
    if (dto.supplierName) {
      const supplier = await this.supplierService.exists(dto.supplierName);
      if (!supplier) {
        throw new NotFoundException(`Supplier: ${dto.supplierName} not found`);
      }
      dto.supplierId = supplier.id;
    }

    const item = await this.itemRepo.findOne({
      where: {
        name: { [Op.iLike]: `%${dto.itemName}%` },
      },
    });
    if (!item) {
      throw new NotFoundException(`Item: ${dto.itemName} not found`);
    }
    dto.itemId = item.id;

    let batch: Batch;
    batch = await this.batchRepo.findOne<Batch>({
      where: {
        [Op.or]: [
          {
            batchNumber: {
              [Op.iLike]: `%${dto.batchNumber}%`,
            },
            itemId: dto.itemId,
            facilityId: dto.facilityId,
            departmentId: dto.departmentId,
          },
          { deletedAt: { [Op.not]: null } },
        ],
      },
    });

    if (batch) {
      if (batch.deletedAt) {
        await batch.restore();
      } else {
        dto.quantity = batch.quantity + dto.quantity;
      }
      await batch.update({ ...dto, createdAt: new Date() });
    } else {
      batch = await this.batchRepo.create({ ...dto });
    }
    this.eventEmitter.emit('quantity.increased', {
      itemId: dto.itemId,
    });
    return batch;
  }

  async update(id: string, dto: UpdateBatchDto, user: IUserPayload) {
    const batch = await this.findOne(id);
    if (dto.quantity) {
      if (dto.quantity > batch.quantity) {
        this.eventEmitter.emit('quantity.increased', { itemId: batch.itemId });
      } else if (dto.quantity < batch.quantity) {
        this.eventEmitter.emit('quantity.changed', { itemId: batch.itemId });
      }
    }

    const _result = await batch.update({ ...dto, updatedById: user.sub });

    if (dto.markup) {
      dto.markup.itemId = batch.itemId;
      dto.markup.batchId = batch.id;
      dto.markup.departmentId = user.department;
      dto.markup.facilityId = user.facility;

      const _markup = await this.markupService.update(
        batch.id,
        dto.markup,
        user.sub,
      );
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
  async fetchOne(options?: QueryOptionsDto<Batch>) {
    const queryOptions = buildQuery<Batch>(options, this.populates);
    const batch = await this.batchRepo.findOne(queryOptions);
    if (!batch) {
      throw new NotFoundException('batch not found');
    }
    return batch;
  }

  async find(options?: QueryOptionsDto<Batch>) {
    const queryOptions = buildQuery<Batch>(options, this.populates);
    return this.batchRepo.findAll(queryOptions);
  }

  async findAndCount(options?: QueryOptionsDto<Batch>) {
    const queryOptions = buildQuery<Batch>(options, this.populates);
    return this.batchRepo.findAndCountAll(queryOptions);
  }

  async fetchStockLevelData(
    query: FetchStockLevelReportDataQueryDto,
    user: IUserPayload,
  ) {
    const { facility, department } = user;
    const whereConditions: Record<string, any> = {
      facilityId: facility,
      ...(department && { departmentId: department }),
    };

    if (query.startDate && query.endDate) {
      whereConditions.createdAt = {
        [Op.between]: [query.startDate, query.endDate],
      };
    }

    if (query.specificDate) {
      const specificDateStart = startOfDay(query.specificDate);
      const specificDateEnd = endOfDay(query.specificDate);
      whereConditions.createdAt = {
        [Op.between]: [specificDateStart, specificDateEnd],
      };
    }

    const { rows, count } = await this.findAndCount({
      query: whereConditions,
      fields: ['id', 'batchNumber', 'createdAt', 'validity'],
      populate: ['item', 'department', 'facility'],
      sort: '-createdAt',
    });

    return { count, rows };
  }

  async fetchExpiryData(user: IUserPayload) {
    const { facility, department } = user;
    const { rows, count } = await this.fetchStockNearingExpiry(
      facility,
      department,
    );
    return { count, rows };
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
        {
          model: Markup,
          attributes: ['type', 'amountType', 'amount'],
        },
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
          { model: Markup, attributes: ['id', 'type', 'amountType', 'amount'] },
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
        {
          model: Item,
          attributes: ['id', 'name', 'brandName', 'sellingPrice'],
        },
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
    this.eventEmitter.emit('quantity.increased', { itemId: itemId });
    this.logger.log(`Stock added to batch. ID: ${id}`);
  }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    this.eventEmitter.emit('quantity.changed', { itemId: batch.itemId });
    await batch.destroy();
    this.logger.log(`Batch deleted successfully. ID: ${id}`);
  }

  private async findBatchesByValidity(
    ownershipQuery: Record<string, any>,
    validityCondition: Record<string, any>,
  ) {
    return this.findAndCount({
      query: {
        ...ownershipQuery,
        validity: validityCondition,
      },
      fields: ['id', 'batchNumber', 'createdAt', 'validity'],
      populate: ['item', 'department', 'facility'],
      sort: 'validity',
    });
  }

  async fetchStockNearingExpiry(
    facilityId: string,
    departmentId: string,
  ): Promise<{ rows: Record<string, any>; count: number }> {
    const rows: Record<string, any> = {};
    const ownershipQuery = {
      facilityId,
      ...(departmentId && { departmentId }),
    };

    const today = startOfToday();
    const nDaysFromNow = (days: number) => addDays(new Date(), days);

    const expired = await this.findBatchesByValidity(ownershipQuery, {
      [Op.lt]: today,
    });
    const critical = await this.findBatchesByValidity(ownershipQuery, {
      [Op.between]: [today, nDaysFromNow(30)],
    });
    const highRisk = await this.findBatchesByValidity(ownershipQuery, {
      [Op.between]: [nDaysFromNow(30), nDaysFromNow(60)],
    });
    const approaching = await this.findBatchesByValidity(ownershipQuery, {
      [Op.between]: [nDaysFromNow(60), nDaysFromNow(90)],
    });

    rows.expired = expired;
    rows.critical = critical;
    rows.highRisk = highRisk;
    rows.approaching = approaching;

    const totalCount =
      (expired.count || 0) +
      (critical.count || 0) +
      (highRisk.count || 0) +
      (approaching.count || 0);

    return { rows, count: totalCount };
  }
}
