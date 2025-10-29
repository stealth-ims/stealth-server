import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  FindAndCountOptions,
  FindOptions,
  IncludeOptions,
  Op,
} from 'sequelize';
import { PaginatedDataResponseDto } from 'src/core/shared/responses/success.response';
import { ItemCategory } from '../items-category/models/items-category.model';
import { BatchService } from './batches/batch.service';
import {
  ChangeQuantityEvent,
  ChangeType,
  CreateItemDto,
  FetchExpiredQueryDto,
  ItemCounts,
  ItemPaginationDto,
  ItemStatus,
  OneItem,
  TotalItemsDto,
  UpdateItemDto,
} from './dto';
import { Batch, BatchValidityStatus, Item } from './models';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../../notification/notification.service';
import { CreateNotificationDto } from '../../notification/dto';
import { Features } from '../../core/shared/enums/permissions.enum';
import {
  addDays,
  endOfMonth,
  startOfMonth,
  startOfToday,
  subMonths,
} from 'date-fns';
import { generateFilter } from '../../core/shared/factory';
import { NotificationStatus } from '../../notification/enum';
import { Facility } from '../../admin/facility/models/facility.model';
import { Department } from '../../admin/department/models/department.model';
import { QueryOptionsDto } from '../../core/shared/dto/query-options.dto';
import { buildQuery } from '../../core/shared/factory/query-builder.factory';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class ItemService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Item) private readonly itemRepo: typeof Item,
    private readonly batchService: BatchService,
    private notificationService: NotificationService,
    private sequelize: Sequelize,
  ) {
    this.logger = new Logger(ItemService.name);
  }

  private populates: Record<string, IncludeOptions> = {
    category: { model: ItemCategory, attributes: ['id', 'name'] },

    batches: {
      model: Batch,
      attributes: ['id', 'batchNumber', 'quantity', 'validity'],
    },

    department: { model: Department, attributes: ['id', 'name'] },

    facility: { model: Facility, attributes: ['id', 'name'] },
  };

  /**
   * Creates a new item.
   *
   * @param createItemDto - The DTO containing the item information.
   * @returns A promise that resolves to the created item.
   * @throws If any error occurs during the creation process.
   */
  async create(createItemDto: CreateItemDto): Promise<OneItem> {
    const existingItem = await this.itemRepo.findOne({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: createItemDto.name } },
          { code: { [Op.iLike]: createItemDto.code } },
        ],
        facilityId: createItemDto.facilityId,
      },
    });
    if (existingItem) {
      throw new BadRequestException(
        `Item: ${createItemDto.name} already exists`,
      );
    }
    const createdItem = await this.itemRepo.create({
      ...createItemDto,
      status: ItemStatus.OUT_OF_STOCK,
    });

    // const oneItem = createdItem.toJSON();
    this.logger.log(`Item added successfully. id: ${createdItem.id}`);
    return createdItem;
  }

  /**
   * Retrieves all items with no pagination
   *
   * @returns A promise that resolves to an array of OneItem and the total count of items.
   * @throws Throws an error if there was an issue retrieving the items.
   */
  async findWithNoPaginate(facilityId: string) {
    const items = await this.itemRepo.findAll({
      where: {
        facilityId,
      },
      attributes: [
        'id',
        'name',
        'brandName',
        'dosageForm',
        'strength',
        'itemFullName',
      ],
      order: [['name', 'ASC']],
      skipStatus: true,
    } as FindOptions);

    const modItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      itemFullName: item.itemFullName,
    }));

    return modItems;
  }

  async fetchItemsWithValidity(
    query: FetchExpiredQueryDto,
    user: IUserPayload,
  ) {
    const filter: FindAndCountOptions<Batch> = this.filterBuilder(user, query);

    const { rows, count } = await this.batchService.findBySpecs(filter);

    return { rows, count };
  }

  /**
   * Retrieves all items based on the provided query parameters.
   *
   * @param query - The query parameters for filtering items.
   * @returns A promise that resolves to an array of OneItem and the total count of items.
   * @throws Throws an error if there was an issue retrieving the items.
   */
  async findAll(query: ItemPaginationDto) {
    const filter = await this.applyFilter(query);
    const items = await this.itemRepo.findAndCountAll(filter);
    const count = await this.itemRepo.count({
      where: filter.where,
      distinct: true,
      col: 'id',
    });
    this.logger.log(`Retrieved ${count} items`);
    // items.rows.sort((a, b) => b.totalStock - a.totalStock);

    return new PaginatedDataResponseDto(
      items.rows,
      query.page || 1,
      query.pageSize || 10,
      count,
    );
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
    const item = await this.itemRepo.findByPk(id);
    if (!item) {
      throw new NotFoundException(`item with id: ${id} not found`);
    }

    this.logger.log(`Found items category with ID: ${id}`);
    return item;
  }

  async fetchOne(options?: QueryOptionsDto<Item>) {
    const queryOptions = buildQuery<Item>(options, this.populates);
    const item = await this.itemRepo.findOne(queryOptions);
    return item;
  }

  async fetchAndCountAll(options?: QueryOptionsDto<Item>) {
    const queryOptions = buildQuery<Item>(options, this.populates);
    const items = await this.itemRepo.findAndCountAll({
      ...queryOptions,
      skipStatus: true,
    } as FindAndCountOptions);
    return items;
  }

  /**
   * Updates a item with the specified ID.
   *
   * @param id - The ID of the item to update.
   * @param updateItemDto - The data to update the item with.
   * @throws {NotFoundException} If the item with the specified ID is not found.
   * @returns A Promise that resolves to void.
   */
  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    userId?: string,
  ): Promise<void> {
    const result = await this.itemRepo.update(
      { ...updateItemDto, ...(userId && { updatedById: userId }) },
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
  async remove(id: string, userId: string): Promise<void> {
    await this.itemRepo.update({ deletedById: userId }, { where: { id: id } });
    const res = await this.itemRepo.destroy({
      where: { id: id },
      userId,
    } as any);
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

    const totalItems = await this.itemRepo.count({
      where: { ...whereOptions },
    });

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

  private filterBuilder(user: IUserPayload, query: FetchExpiredQueryDto) {
    const itemWhereConditions: Record<string, any> = {};
    const batchWhereConditions: Record<string, any> = {};

    itemWhereConditions.facilityId = { [Op.eq]: user.facility };

    if (query.search) {
      itemWhereConditions.name = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const today = startOfToday();
    switch (query.status) {
      case BatchValidityStatus.EXPIRED:
        batchWhereConditions.validity = { [Op.lte]: today };
        break;
      case BatchValidityStatus.CRITICAL: {
        const tomorrow = addDays(today, 1);
        const thirtyDays = addDays(today, 30);
        batchWhereConditions.validity = {
          [Op.between]: [tomorrow, thirtyDays],
        };
        break;
      }
      case BatchValidityStatus.APPROACHING: {
        const thirtyDays = addDays(today, 31);
        const ninetyDays = addDays(today, 90);
        batchWhereConditions.validity = {
          [Op.between]: [thirtyDays, ninetyDays],
        };
        break;
      }
      case BatchValidityStatus.SAFE: {
        const ninetyDays = addDays(today, 91);
        batchWhereConditions.validity = { [Op.gte]: ninetyDays };
        break;
      }
      default:
        break;
    }

    if (query.startDate && !query.status) {
      batchWhereConditions.validity = { [Op.gte]: query.startDate };
    }
    if (query.endDate && !query.status) {
      batchWhereConditions.validity = { [Op.lte]: query.endDate };
    }

    const filter: FindAndCountOptions<Batch> = {
      where: {
        departmentId: user.department,
        ...batchWhereConditions,
      },
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: [['validity', 'ASC']],
      attributes: [
        ['id', 'batchId'],
        'batchNumber',
        'validity',
        'status',
        'quantity',
      ],
      include: [
        {
          model: Item,
          attributes: ['id', 'name'],
          where: itemWhereConditions,
        },
      ],
      distinct: true,
    };
    return filter;
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
  private async applyFilter(query: ItemPaginationDto): Promise<any> {
    const queryFilter = generateFilter(query);
    const whereOptions: Record<string, any> = {
      facilityId: query.facilityId,
    };

    if (query.status) {
      let whereClause = 'total_quantity > reorder_point';
      switch (query.status) {
        case ItemStatus.OUT_OF_STOCK:
          whereClause = 'total_quantity = 0';
          break;
        case ItemStatus.LOW:
          whereClause =
            'total_quantity > 0 AND total_quantity <= reorder_point';
          break;
        default:
          break;
      }

      const [result] = await this.sequelize.query(
        `
          WITH item_quantities AS (
              SELECT i.id, i.reorder_point, COALESCE(SUM(b.quantity), 0) total_quantity
              FROM batches b
              RIGHT OUTER JOIN items i
              ON b.item_id = i.id
              AND b.facility_id = '${query.facilityId}'
              ${query.departmentId ? `AND b.department_id = '${query.departmentId}'` : 'AND b.department_id IS NULL'}
              GROUP BY i.id
            )
          SELECT * FROM item_quantities
            WHERE ${whereClause};
          `,
      );
      const results = Array.isArray(result) ? result : [result];
      const itemIds = results.map((res: any) => res.id as string);
      whereOptions.id = itemIds;
    }
    let searchOptions = {};
    if (query.search) {
      const search = query.search;
      searchOptions = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { brandName: { [Op.iLike]: `%${search}%` } },
          { dosageForm: { [Op.iLike]: `%${search}%` } },
          { strength: { [Op.iLike]: `%${search}%` } },
          Sequelize.where(
            Sequelize.fn(
              'concat_ws',
              ' ',
              Sequelize.fn('coalesce', Sequelize.col('Item.name'), ''),
              Sequelize.literal(
                `CASE WHEN "brand_name" IS NOT NULL AND "brand_name" <> '' THEN '(' || "brand_name" || ')' ELSE '' END`,
              ),
              Sequelize.fn('coalesce', Sequelize.col('dosage_form'), ''),
              Sequelize.fn('coalesce', Sequelize.col('strength'), ''),
            ),
            {
              [Op.iLike]: `%${search}%`,
            },
          ),
        ],
      };
    }
    if (query.categories) {
      whereOptions.categoryId = query.categories;
    }

    return {
      where: {
        ...whereOptions,
        ...searchOptions,
        ...queryFilter.searchFilter,
      },
      ...queryFilter.pageFilter,
      order: [
        [query.orderBy || 'name', query.orderDirection || 'ASC'],
        [Sequelize.literal('"totalStock"'), 'DESC'],
      ],
      attributes: [
        'id',
        'name',
        'brandName',
        'dosageForm',
        'strength',
        'unitOfMeasurement',
        'itemFullName',
        'reorderPoint',
        'status',
        'createdAt',
        'updatedAt',
        [Sequelize.fn('SUM', Sequelize.col('batches.quantity')), 'totalStock'],
        'code',
      ],
      include: [
        {
          model: Batch,
          as: 'batches',
          attributes: [],
          where: { departmentId: query.departmentId || null },
          duplicating: false,
          required: false,
        },
        { model: ItemCategory, attributes: ['id', 'name'] },
      ],
      group: ['Item.id', 'category.id'],
      distinct: true,
      departmentId: query.departmentId,
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
    const notification = new CreateNotificationDto();
    notification.status = NotificationStatus.UNREAD;

    if (quantity === 0) {
      notification.message = `${item.name} is out of stock. Restock now`;
      notification.linkName = 'Restock';
      notification.linkRoute = `/items?itemId=${item.id}&itemName=${item.name}`;
    } else if (quantity < item.reorderPoint) {
      notification.message = `${item.name} is almost out of stock. ${quantity} pieces left`;
      notification.linkName = 'Restock';
      notification.linkRoute = `/items?itemId=${item.id}&itemName=${item.name}`;
    } else {
      return;
    }
    await this.notificationService.sendNotification(
      notification,
      Features.ITEMS,
      { facility: payload.facilityId, department: payload.departmentId },
    );
  }

  @OnEvent('quantity.increased')
  async handleQuantityIncreasedEvent(payload: ChangeQuantityEvent) {
    this.logger.log(`quantity.increased event; itemId: ${payload.itemId}`);
    const item = await this.findOne(payload.itemId);
    const notification = new CreateNotificationDto();
    notification.status = NotificationStatus.UNREAD;

    notification.message = `${item.name} just got stocked`;
    notification.linkName = 'View';
    notification.linkRoute = `/items?itemId=${item.id}&itemName=${item.name}`;

    await this.notificationService.sendNotification(
      notification,
      Features.ITEMS,
      { facility: payload.facilityId, department: payload.departmentId },
    );
  }
}
