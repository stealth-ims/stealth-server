import {
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { User } from '../../auth/models/user.model';
import { ItemCategory } from '../items-category/models/items-category.model';
import { BatchService } from './batches/batch.service';
import {
  ChangeQuantityEvent,
  ChangeType,
  CreateItemDto,
  ItemCounts,
  ItemPaginationDto,
  ItemStatus,
  OneItem,
  TotalItemsDto,
  UpdateItemDto,
} from './dto';
import { Batch, Item } from './models';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../../notification/notification.service';
import { CreateNotificationDto } from '../../notification/dto';
import { Features } from '../../core/shared/enums/permissions.enum';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { generateFilter } from '../../core/shared/factory';

@Injectable()
export class ItemService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Item) private readonly itemRepo: typeof Item,
    @InjectModel(User) private readonly userRepo: typeof User,
    private readonly batchService: BatchService,
    private notificationService: NotificationService,
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

    const oneItem = createdItem.toJSON();
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
      order: [['updatedAt', 'DESC']],
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

    const itemList = await Promise.all(
      items.rows.map(async (item) => {
        const modItem: Item = item.get({ plain: true });
        // const batches = await this.batchService.findAll(modItem.id);
        const whereOptions: Record<string, any> = { itemId: modItem.id };
        if (query.departmentId) {
          whereOptions.departmentId = query.departmentId;
        }
        const totalStock =
          await this.batchService.calculateTotalBatchStock(whereOptions);
        // delete modItem.status;
        if (totalStock > modItem.reorderPoint) {
          modItem.status = ItemStatus.STOCKED;
        } else if (totalStock === 0) {
          modItem.status = ItemStatus.OUT_OF_STOCK;
        } else {
          modItem.status = ItemStatus.LOW;
        }
        return {
          ...modItem,
          totalStock,
        };
      }),
    );

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

    let quantity = 0;
    if (item.batches.length) {
      quantity = item.batches.reduce(
        (total, batch) => total + batch.quantity,
        0,
      );
    }
    const result = item.get({ plain: true });
    this.logger.log(`Found items category with ID: ${id}`);
    result.totalStock = quantity;
    return result;
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

  async getAnalytics(itemId: string) {
    return new NotImplementedException(
      `Retrieving analytics not implemented ${itemId}`,
    );
  }

  async getItemCount(user: IUserPayload) {
    const whereOptions: any = { facilityId: user.facility };
    // if (user.department) {
    //   whereOptions.departmentId = user.department;
    // }

    const totalItems = await this.itemRepo.count({
      where: { ...whereOptions },
    });

    // const totalInStock = await this.itemRepo.count({
    //   include: [
    //     {
    //       model: Batch,
    //       as: 'batches',
    //       required: false,
    //       where: {
    //         ...(user.department && { departmentId: user.department }),
    //       },
    //     },
    //   ],
    //   where: {
    //     '$batches.id$': {
    //       [Op.ne]: null,
    //     },
    //     ...whereOptions,
    //     ...(user.department && { departmentId: user.department }),
    //   },
    //   distinct: true,
    // });

    const itemsOutOfStock = await this.itemRepo.count({
      include: [
        {
          model: Batch,
          as: 'batches',
          required: false,
          where: {
            ...(user.department && { departmentId: user.department }),
          },
        },
      ],
      where: {
        '$batches.id$': {
          [Op.is]: null,
        },
        ...whereOptions,
      },
      distinct: true,
    });
    const itemsHighStocked = totalItems - itemsOutOfStock;

    const itemsLowStocked = totalItems - (itemsOutOfStock + itemsHighStocked);

    let total: number =
      await this.batchService.calculateTotalStock(whereOptions);
    if (user.department) {
      total = await this.batchService.calculateTotalBatchStock({
        departmentId: user.department,
      });
    }
    const totalStock = total;

    const totalItemsObject = await this.computeTotalItems(totalItems);
    const itemAnalytics = new ItemCounts();
    itemAnalytics.totalItems = totalItemsObject;
    itemAnalytics.totalStock = totalStock;
    itemAnalytics.outOfStock = itemsOutOfStock;
    itemAnalytics.highStocked = itemsHighStocked;
    itemAnalytics.lowStocked = itemsLowStocked;

    return itemAnalytics;
  }

  private async computeTotalItems(total: number) {
    const startOfPreviousMonth = startOfMonth(subMonths(new Date(), 1));
    const endOfPreviousMonth = endOfMonth(subMonths(new Date(), 1));

    const lastMonthTotal: number = await this.itemRepo.count({
      where: {
        updatedAt: {
          [Op.gte]: startOfPreviousMonth,
          [Op.lt]: endOfPreviousMonth,
        },
      },
    });

    let totalChange: number;
    let changeType: ChangeType;

    if (total > lastMonthTotal) {
      totalChange = total - lastMonthTotal;
      changeType = ChangeType.Increase;
    } else if (total < lastMonthTotal) {
      totalChange = lastMonthTotal - total;
      changeType = ChangeType.Decrease;
    } else {
      totalChange = 0;
      changeType = ChangeType.None;
    }

    const change = (totalChange / (lastMonthTotal || totalChange)) * 100;
    const percentageChange = Math.round(change * 100) / 100;

    const totalItemsObject = new TotalItemsDto();
    totalItemsObject.count = total;
    totalItemsObject.changeType = changeType;
    totalItemsObject.percentageDifference = percentageChange;
    return totalItemsObject;
  }

  /**
   * Applies the filter options to construct the FindAndCountOptions object for querying items.
   *
   * @param query - The ItemPaginationDto object containing the filter options.
   * @returns The FindAndCountOptions object with the applied filter options.
   */
  private applyFilter(query: ItemPaginationDto): FindAndCountOptions<Item> {
    // query.departmentId && { departmentId: query.departmentId };
    const queryFilter = generateFilter(query);
    const whereOptions: WhereOptions<Item> = {
      [Op.and]: [
        query.facilityId && { facilityId: query.facilityId },
        query.search && {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query.search}%` } },
            { brandName: { [Op.iLike]: `%${query.search}` } },
          ],
        },
        query.status && {
          status: query.status,
        },
        query.categories && {
          categoryId: query.categories,
        },
      ],
    };
    return {
      where: { ...whereOptions, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      attributes: [
        'id',
        'name',
        'status',
        'reorderPoint',
        'createdAt',
        'updatedAt',
      ],
      include: [{ model: ItemCategory, attributes: ['id', 'name'] }],
      distinct: true,
    };
    //  {
    //       model: Batch,
    //       attributes: ['quantity', 'supplierId'],
    //       limit: 3,
    //       include: [
    //         {
    //           model: Supplier,
    //           attributes: ['id', 'name'],
    //           where: {
    //             ...(query.supplierId && {
    //               id: query.supplierId,
    //             }),
    //           },
    //         },
    //       ],
    //     },
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
    let itemStatus: ItemStatus;
    const notification = new CreateNotificationDto();

    if (quantity === 0) {
      itemStatus = ItemStatus.OUT_OF_STOCK;
      notification.message = `${item.name} is out of stock. Restock now`;
      notification.linkName = 'Restock';
      notification.linkRoute = `/items/${item.id}/batches`;
    } else if (quantity < item.reorderPoint) {
      itemStatus = ItemStatus.LOW;
      notification.message = `${item.name} is almost out of stock. ${quantity} pieces left`;
      notification.linkName = 'Restock';
      notification.linkRoute = `/items/${item.id}/batches`;
    } else {
      itemStatus = ItemStatus.STOCKED;
      notification.message = `${item.name} just got stocked`;
      notification.linkName = 'View';
      notification.linkRoute = `/items/${item.id}/batches`;
    }

    await this.notificationService.sendNotification(
      notification,
      Features.ITEMS,
      { facility: item.facilityId, department: item.departmentId },
    );

    await this.update(payload.itemId, {
      status: itemStatus,
    });
  }
}
