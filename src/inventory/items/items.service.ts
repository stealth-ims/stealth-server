import {
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { PaginatedDataResponseDto } from 'src/utils/responses/success.response';
import { User } from '../../auth/models/user.model';
import { ItemCategory } from '../items-category/models/items-category.model';
import { Supplier } from '../suppliers/models/supplier.model';
import { BatchService } from './batch.service';
import {
  ChangeQuantityEvent,
  CreateItemDto,
  ItemCounts,
  ItemPaginationDto,
  OneItem,
  UpdateItemDto,
} from './dto';
import { Batch, Item, ItemStatus } from './models';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { OnEvent } from '@nestjs/event-emitter';

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
    const createdItem = await this.itemRepo.create({
      ...createItemDto,
      status: ItemStatus.OUT_OF_STOCK,
    });

    const oneItem = createdItem.toJSON() as OneItem;
    this.logger.log(`Item added successfully. id: ${createdItem.id}`);
    return oneItem;
  }

  /**
   * Retrieves all items with no pagination
   *
   * @returns A promise that resolves to an array of OneItem and the total count of items.
   * @throws Throws an error if there was an issue retrieving the items.
   */
  async findWithNoPaginate(facilityId: string) {
    const items = await this.itemRepo.findAndCountAll({
      where: {
        facilityId,
      },
      attributes: ['id', 'name'],
    });

    this.logger.log(`Retrieved ${items.count} items`);
    // this.logger.log(itemList);
    return items.rows;
  }

  /**
   * Retrieves all items based on the provided query parameters.
   *
   * @param query - The query parameters for filtering items.
   * @returns A promise that resolves to an array of OneItem and the total count of items.
   * @throws Throws an error if there was an issue retrieving the items.
   */
  async findAll(query: ItemPaginationDto) {
    const filter = this.applyFilter(query);
    const items = await this.itemRepo.findAndCountAll(filter);

    const itemList = items.rows.map((item) => {
      const modItem: Item = item.get({ plain: true });

      const totalStock = modItem.batches.reduce(
        (total, batch) => total + batch.quantity,
        0,
      );
      const suppliers = modItem.batches.map((batch) => batch.supplier);
      delete modItem.batches;
      return {
        ...modItem,
        supplier: suppliers[0],
        ...(suppliers.length > 1 && {
          supplierRemainder: suppliers.length - 1,
        }),
        totalStock,
      };
    });

    this.logger.log(`Retrieved ${items.count} items`);

    return new PaginatedDataResponseDto(
      itemList,
      query.page || 1,
      query.pageSize || 10,
      items.count,
    );
  }

  async assignStatus() {
    const items = await this.itemRepo.findAll({
      attributes: ['id', 'name', 'status', 'reorderPoint'],
      include: [{ model: Batch, attributes: ['id', 'quantity'] }],
    });

    items.forEach((item) => {
      const totalQuantity = item.batches.reduce(
        (accum, batch) => accum + batch.quantity,
        0,
      );

      if (totalQuantity == 0) {
        item.status = ItemStatus.OUT_OF_STOCK;
      } else if (totalQuantity > item.reorderPoint) {
        item.status = ItemStatus.STOCKED;
      } else {
        item.status = ItemStatus.LOW;
      }
      item.save();
    });
    return 'adjusted';
  }
  /**
   * Finds a item by its ID.
   *
   * @param id - The ID of the item to find.
   * @returns A promise that resolves to the found item.
   * @throws {NotFoundEception} If the item with the given ID is not found.
   */
  async findOne(id: string) {
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

  async getItemCount(user: IUserPayload) {
    const whereOptions: any = { facilityId: user.facility };
    if (user.department) {
      whereOptions.departmentId = user.department;
    }

    const totalItems = await this.itemRepo.count({
      where: { ...whereOptions },
    });
    const totalInStock = await this.itemRepo.count({
      include: [
        {
          model: Batch,
          as: 'batches',
          required: false,
        },
      ],
      where: {
        '$batches.id$': {
          [Op.ne]: null,
        },
        ...whereOptions,
      },
      distinct: true,
    });
    const outOfStock = totalItems - totalInStock;
    const highStocked = await this.itemRepo.count({
      where: {
        ...whereOptions,
        status: ItemStatus.STOCKED,
      },
    });
    const lowStocked = totalInStock - highStocked;

    const itemAnalytics = new ItemCounts();
    itemAnalytics.totalItems = totalItems;
    itemAnalytics.totalInStock = totalInStock;
    itemAnalytics.outOfStock = outOfStock;
    itemAnalytics.highStocked = highStocked;
    itemAnalytics.lowStocked = lowStocked;

    return itemAnalytics;
  }

  /**
   * Applies the filter options to construct the FindAndCountOptions object for querying items.
   *
   * @param query - The ItemPaginationDto object containing the filter options.
   * @returns The FindAndCountOptions object with the applied filter options.
   */
  private applyFilter(query: ItemPaginationDto): FindAndCountOptions<Item> {
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
        query.supplierId && {
          batches: {
            supplierId: query.supplierId,
          },
        },
      ],
    };
    return {
      where: whereOptions,
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy
        ? [[query.orderBy, query.orderDirection ? query.orderDirection : 'ASC']]
        : [['updatedAt', 'DESC']],
      attributes: [
        'id',
        'name',
        'status',
        'reorderPoint',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Batch,
          include: [{ model: Supplier, attributes: ['id', 'name'] }],
        },
        { model: ItemCategory, attributes: ['id', 'name'] },
      ],
      distinct: true,
    };
  }

  @OnEvent('quantity.changed')
  async handleQuantityChangedEvent(payload: ChangeQuantityEvent) {
    this.logger.log(`quantity.changed event; itemId: ${payload.itemId}`);
    let quantity = 0;
    const batches = await this.batchService.findBySpecs({
      where: { itemId: payload.itemId },
    });
    if (batches.count) {
      quantity = batches.rows.reduce(
        (total, batch) => total + batch.quantity,
        0,
      );
    }
    const item = await this.findOne(payload.itemId);

    let itemStatus;
    if (quantity === 0) {
      itemStatus = ItemStatus.OUT_OF_STOCK;
    } else if (quantity < item.reorderPoint) {
      itemStatus = ItemStatus.LOW;
    } else {
      itemStatus = ItemStatus.STOCKED;
    }

    await this.update(payload.itemId, {
      status: itemStatus,
    });
  }
}
