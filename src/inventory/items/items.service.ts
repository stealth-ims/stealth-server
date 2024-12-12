import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op, Sequelize, WhereOptions } from 'sequelize';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { User } from '../../auth/models/user.model';
import { BatchService } from './batch.service';
import {
  CreateItemDto,
  ItemPaginationDto,
  OneItem,
  UpdateItemDto,
} from './dto';
import { Batch, Item, ItemStatus } from './models';
import { ItemCategory } from '../items-category/models/items-category.model';
import { Supplier } from '../suppliers/models/supplier.model';

@Injectable()
export class ItemService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Item) private readonly itemRepo: typeof Item,
    @InjectModel(User) private readonly userRepo: typeof User,
    private readonly batchService: BatchService,
  ) {
    this.logger = new Logger(ItemService.name);
  }

  /**
   * Creates a new item.
   *
   * @param createItemDto - The DTO containing the item information.
   * @returns A promise that resolves to the created item.
   * @throws If any error occurs during the creation process.
   */
  async create(createItemDto: CreateItemDto): Promise<OneItem> {
    try {
      const createdItem = await this.itemRepo.create({
        ...createItemDto,
        status: ItemStatus.STOCKED,
      });

      const batch = await this.batchService.create({
        ...createItemDto,
        itemId: createdItem.id,
      });
      const oneItem = createdItem.toJSON() as OneItem;
      oneItem.batches = [batch];
      this.logger.log(`Item added successfully. id: ${createdItem.id}`);
      return oneItem;
    } catch (error) {
      if (error instanceof ConflictException) {
        const id = JSON.parse(error.message).id;
        this.logger.log(`Item already existed. ID: ${id}`);
        await this.batchService.create({
          ...createItemDto,
          itemId: id,
        });
        return await this.findOne(id);
      }
    }
  }

  /**
   * Retrieves all items based on the provided query parameters.
   *
   * @param query - The query parameters for filtering items.
   * @returns A promise that resolves to an array of OneItem and the total count of items.
   * @throws Throws an error if there was an issue retrieving the items.
   */
  async findAll(query: ItemPaginationDto) {
    // const filter = this.applyFilter(query);
    const whereOptions: WhereOptions<Item> = {
      [Op.and]: [
        query.facilityId && { facilityId: query.facilityId },
        query.departmentId && { departmentId: query.departmentId },
        query.search && {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query.search}%` } },
            { brandName: { [Op.iLike]: `%${query.search}` } },
          ],
        },
        query.categories && {
          category: {
            name: { [Op.in]: query.categories },
          },
        },
      ],
    };
    // const items = await this.itemRepo.findAndCountAll(filter);
    const batches = await this.batchService.findBySpecs({
      where: {
        [Op.and]: [query.supplierId && { supplierId: query.supplierId }],
      },
      attributes: [
        'batchNumber',
        'quantity',
        'itemId',
        'validity',
        'supplierId',
        [Sequelize.col('item.name'), 'name'],
        [Sequelize.col('item.brand_name'), 'brandName'],
        [Sequelize.col('item.status'), 'status'],
        [Sequelize.col('item.reorder_point'), 'reorderPoint'],
        [Sequelize.col('item.created_at'), 'createdAt'],
        [Sequelize.col('supplier.name'), 'supplierName'],
        [Sequelize.col('item.category.name'), 'category'],
        [Sequelize.col('item.category.id'), 'categoryId'],
      ],
      include: [
        { model: Supplier, attributes: [] },
        {
          model: Item,
          where: whereOptions,
          attributes: [],
          include: [{ model: ItemCategory, attributes: [] }],
        },
      ],
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy
        ? [[query.orderBy, query.orderDirection ? query.orderDirection : 'ASC']]
        : [['updatedAt', 'DESC']],
    });
    return new PaginatedDataResponseDto(
      batches.rows,
      query.page || 1,
      query.pageSize || 10,
      batches.count,
    );
  }

  /**
   * Finds a item by its ID.
   *
   * @param id - The ID of the item to find.
   * @returns A promise that resolves to the found item.
   * @throws {NotFoundEception} If the item with the given ID is not found.
   */
  async findOne(id: string): Promise<OneItem> {
    this.logger.log(`finding item with id: ${id}`);
    const item = await this.itemRepo.findByPk(id, { include: [Batch] });
    if (!item) {
      throw new NotFoundException(`item with id: ${id} not found`);
    }

    this.logger.log(`Found items category with ID: ${id}`);
    return item;
  }

  /**
   * Updates a item with the specified ID.
   *
   * @param id - The ID of the item to update.
   * @param updateItemDto - The data to update the item with.
   * @throws {NotFoundException} If the item with the specified ID is not found.
   * @returns A Promise that resolves to void.
   */
  async update(id: string, updateItemDto: UpdateItemDto): Promise<void> {
    const result = await this.itemRepo.update(
      { ...updateItemDto },
      { where: { id: id } },
    );
    if (result[0] == 0) {
      throw new NotFoundException(`item with id ${id} not found`);
    }
    this.logger.log(`Updated item with ID: ${id}`);
    return;
  }

  /**
   * Removes a item from the inventory.
   *
   * @param id - The ID of the item to be removed.
   * @throws {NotFoundException} If the item with the given ID is not found.
   */
  async remove(id: string): Promise<void> {
    const res = await this.itemRepo.destroy({ where: { id: id } });
    if (res == 0) {
      throw new NotFoundException(`item with id ${id} not found`);
    }
    this.logger.log(`Deleted Item with id: ${id}`);
  }

  async getAnalytics() {
    return new NotImplementedException(`Retrieving analytics not implemented`);
  }

  async getItemCount() {
    const options: FindOptions<Item> = {
      attributes: [
        [Sequelize.fn('COUNT', 'Item'), 'totalItem'],
        [Sequelize.col('batches.quantity'), 'quantity'],
        'status',
      ],
      include: [{ model: Batch, attributes: [] }],
      group: ['status', 'batches.quantity', 'Item.id'],
    };
    const res = await this.itemRepo.findAll(options);

    return res;
  }
}
