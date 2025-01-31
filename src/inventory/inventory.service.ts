import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiSuccessResponseNoData } from 'src/utils/responses/success.response';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { BatchService } from 'src/inventory/items/batches/batch.service';
import { IUserPayload } from '../auth/interface/payload.interface';
import { Batch, Item } from '../inventory/items/models';
import {
  StockAdjustment,
  StockAdjustmentStatus,
  StockAdjustmentType,
} from './models/stock-adjustment.model';
import {
  CreateStockAdjustmentDto,
  StockAdjustmentPaginationDto,
  UpdateStockAdjustmentDto,
} from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateFilter } from '../shared/factory';

@Injectable()
export class StockAdjustmentsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(StockAdjustment)
    private readonly stockAdjustmentRepo: typeof StockAdjustment,
    private readonly batchService: BatchService,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(StockAdjustmentsService.name);
  }

  /**
   * Creates a new stock adjustment.
   *
   * @param createStockAdjustmentDto - The DTO containing the data for creating a stock adjustment.
   * @returns A promise that resolves to the created stock adjustment.
   * @throws {InternalServerErrorException} If there is an internal server error.
   */
  async create(
    dto: CreateStockAdjustmentDto,
    user: IUserPayload,
  ): Promise<StockAdjustment> {
    if (dto.type === StockAdjustmentType.REDUCTION) {
      await this.batchService.removeStock(dto.batchId, dto.quantity);
    } else if (dto.type === StockAdjustmentType.INCREMENT) {
      await this.batchService.increaseStock(dto.batchId, dto.quantity);
    } else {
      throw new BadRequestException('unknown adjustment type');
    }
    dto.status = StockAdjustmentStatus.ADJUSTED;
    dto.createdById = user.sub;
    dto.facilityId = user.facility;
    dto.departmentId = user.department;
    const adjustedStock = await this.stockAdjustmentRepo.create({
      ...dto,
    });
    return adjustedStock;
  }

  /**
   * Retrieves all stock adjustments.
   *
   * @param query - The pagination query parameters.
   * @returns A promise that resolves to an array of StockAdjustment objects and the total count.
   * @throws {InternalServerErrorException} if an error occurs while retrieving the adjustments.
   */
  async findAll(
    query: StockAdjustmentPaginationDto,
  ): Promise<[StockAdjustment[], number]> {
    const filter = this.applyFilter(query);
    const adjustments = await this.stockAdjustmentRepo.findAndCountAll(filter);

    this.logger.log(`Retrieved ${adjustments.count} stock adjustments`);
    return [adjustments.rows, adjustments.count];
  }

  /**
   * Finds a stock adjustment by its ID.
   *
   * @param id - The ID of the stock adjustment to find.
   * @returns A promise that resolves to the found stock adjustment.
   * @throws {NotFoundException} If the stock adjustment with the given ID is not found.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async findOne(id: string): Promise<StockAdjustment> {
    this.logger.log(`Finding stock adjustment with ID: ${id}`);
    const adjustment = await this.stockAdjustmentRepo.findByPk(id, {
      include: [
        { model: Item, attributes: ['id', 'name'] },
        { model: Batch, attributes: ['id', 'batchNumber'] },
      ],
      attributes: [
        'id',
        'createdAt',
        'reason',
        'notes',
        'status',
        'type',
        'quantity',
        'createdById',
        'createdBy',
      ],
    });

    if (!adjustment) {
      throw new NotFoundException(`Stock adjustment with id: ${id} not found`);
    }
    this.logger.log(`Found stock adjustment with ID: ${id}`);
    return adjustment;
  }

  /**
   * Updates a stock adjustment.
   *
   * @param id - The ID of the stock adjustment.
   * @param updateStockAdjustmentDto - The new status of the stock adjustment.
   * @returns A Promise that resolves to void.
   * @throws NotFoundException if the stock adjustment is not found.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async edit(id: string, dto: UpdateStockAdjustmentDto) {
    const adjustedStock = await this.findOne(id);

    if (dto.batchId || dto.quantity || dto.type) {
      const _oldBatch = await this.restoreStock(
        adjustedStock.batch.id,
        adjustedStock.quantity,
        adjustedStock.type,
      );

      const batchId = dto.batchId ?? adjustedStock.batch.id;
      const updatingQuantity = dto.quantity ?? adjustedStock.quantity;
      const adjustmentType = dto.type ?? adjustedStock.type;

      await this.adjustOnType(batchId, updatingQuantity, adjustmentType);
    }

    const updatedAdjustment = await this.stockAdjustmentRepo.update(dto, {
      where: { id },
    });
    if (updatedAdjustment[0] == 0) {
      throw new NotFoundException('Adjusted stock not found');
    }
    return;
  }

  /**
   * Removes a stock adjustment by its ID.
   *
   * @param id - The ID of the stock adjustment to remove.
   * @returns A promise that resolves to void.
   * @throws {NotFoundException} If the stock adjustment with the given ID is not found.
   * @throws {InternalServerErrorException} If an error occurs during the removal operation.
   */
  async remove(id: string): Promise<ApiSuccessResponseNoData> {
    this.logger.log(`Removing stock adjustment with ID: ${id}`);
    const adjustedStock = await this.findOne(id);
    const _oldBatch = await this.restoreStock(
      adjustedStock.batch.id,
      adjustedStock.quantity,
      adjustedStock.type,
    );

    await adjustedStock.destroy();

    return;
  }

  private async restoreStock(
    batchId: string,
    quantity: number,
    type: StockAdjustmentType,
  ) {
    const oldBatch = await this.batchService.findOne(batchId);
    if (type === StockAdjustmentType.REDUCTION) {
      await this.batchService.increaseStock(batchId, quantity);
    } else if (type === StockAdjustmentType.INCREMENT) {
      await this.batchService.removeStock(batchId, quantity);
    } else {
      throw new BadRequestException('unknown adjustment type');
    }
    await oldBatch.save();
    return oldBatch;
  }

  private async adjustOnType(
    batchId: string,
    quantity: number,
    type: StockAdjustmentType,
  ) {
    if (type === StockAdjustmentType.REDUCTION) {
      await this.batchService.removeStock(batchId, quantity);
    } else if (type === StockAdjustmentType.INCREMENT) {
      await this.batchService.increaseStock(batchId, quantity);
    } else {
      throw new BadRequestException('unknown adjustment type');
    }
    return;
  }

  /**
   * Applies the filter options to construct the FindAndCountOptions object for querying stock adjustments.
   *
   * @param query - The StockAdjustmentPaginationDto object containing the filter options.
   * @returns The FindAndCountOptions object with the applied filter options.
   */
  private applyFilter(
    query: StockAdjustmentPaginationDto,
  ): FindAndCountOptions<StockAdjustment> {
    const queryFilter = generateFilter(query, {
      [Op.or]: [{ reason: { [Op.iLike]: `%${query.search}%` } }],
    });
    let itemOrderOptions = {};
    if (query.orderBy == 'itemName') {
      itemOrderOptions = {
        order: [
          [Item, 'name', query.orderDirection ? query.orderDirection : 'ASC'],
        ],
      };
      delete queryFilter.pageFilter.order;
    }
    const whereOptions: WhereOptions<StockAdjustment> = {
      [Op.and]: [
        query.facilityId && { facilityId: query.facilityId },
        query.departmentId && { departmentId: query.departmentId },
        query.type && { type: query.type },
        query.status && { status: query.status },
        query.startDate && { createdAt: { [Op.gte]: query.startDate } },
        query.endDate && { createdAt: { [Op.lte]: query.endDate } },
      ],
    };
    return {
      where: { ...whereOptions, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      include: [
        { model: Item, attributes: ['id', 'name'] },
        { model: Batch, attributes: ['id', 'batchNumber'] },
      ],
      ...itemOrderOptions,
      attributes: [
        'id',
        'createdAt',
        'reason',
        'notes',
        'status',
        'type',
        'quantity',
        'createdById',
        'createdBy',
      ],
      distinct: true,
    };
  }
}
