import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { StockAdjustment, StockAdjustmentStatus } from './model';
import { ApiSuccessResponseNoData } from 'src/utils/responses/success.response';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { StockAdjustmentPaginationDto } from './dto';
import { DrugsService } from 'src/inventory/drugs/drugs.service';

@Injectable()
export class StockAdjustmentsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(StockAdjustment)
    private readonly stockAdjustmentRepo: typeof StockAdjustment,
    private readonly drugService: DrugsService,
  ) {
    this.logger = new Logger(StockAdjustmentsService.name);
  }

  /**
   * Creates a new stock adjustment.
   *
   * @param createStockAdjustmentDto - The DTO containing the data for creating a stock adjustment.
   * @returns A promise that resolves to the created stock adjustment.
   * @throws {BadRequestException} If there is a unique constraint error.
   * @throws {InternalServerErrorException} If there is an internal server error.
   */
  async create(
    createStockAdjustmentDto: CreateStockAdjustmentDto,
  ): Promise<StockAdjustment> {
    try {
      const adjustment = await this.stockAdjustmentRepo.create({
        ...createStockAdjustmentDto,
      });
      this.logger.log(`Created stock adjustment with ID: ${adjustment.id}`);
      return adjustment;
    } catch (error) {
      throw error;
    }
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
    const adjustment = await this.stockAdjustmentRepo.findByPk(id);

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
   * @param updateStockAdjustmentDto - The DTO containing the updated stock adjustment data.
   * @returns A Promise that resolves to void.
   * @throws NotFoundException if the stock adjustment is not found.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async update(
    id: string,
    status: StockAdjustmentStatus,
  ): Promise<ApiSuccessResponseNoData> {
    const adjustment = await this.findOne(id);
    if (status == StockAdjustmentStatus.ADJUSTED) {
      // const drug = await this.drugService.findOne(adjustment.drugId);
    }
    adjustment.status = status;
    await adjustment.save();
    this.logger.log(`Updated stock adjustment with ID: ${id}`);
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
    const res = await this.stockAdjustmentRepo.destroy({ where: { id: id } });

    if (res == 0) {
      throw new NotFoundException(`Stock adjustment with id ${id} not found`);
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
    const whereOptions: WhereOptions<StockAdjustment> = {
      [Op.and]: [
        query.facilityId && { facilityId: query.facilityId },
        query.departmentId && { departmentId: query.departmentId },
        query.createdBy && { createdBy: query.createdBy },
        query.type && { type: query.type },
        query.status && { type: query.status },
        query.search && {
          [Op.or]: [{ reason: { [Op.iLike]: `%${query.search}%` } }],
        },
        query.startDate && { dateAdded: { [Op.gte]: query.startDate } },
        query.endDate && { dateAdded: { [Op.lte]: query.endDate } },
      ],
    };
    return {
      where: whereOptions,
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'ASC']],
    };
  }
}
