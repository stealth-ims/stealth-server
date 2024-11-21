import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  CreateItemDto,
  ItemPaginationDto,
  ManyItem as ManyItem,
  OneItem,
  UpdateItemDto,
} from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { Batch, Item, ItemStatus } from './models';
import { BatchService } from './batch.service';

@Injectable()
export class ItemService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Item) private readonly itemRepo: typeof Item,
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
  async findAll(query: ItemPaginationDto): Promise<[ManyItem[], number]> {
    const filter = this.applyFilter(query);
    const items = await this.itemRepo.findAndCountAll(filter);

    const itemList = [];

    items.rows.forEach((item) => {
      item.batches.forEach((batch) => {
        delete item.dataValues.batches;
        const itemData = item.toJSON() as ManyItem;
        itemData.batch = batch;
        itemList.push(itemData);
      });
    });

    this.logger.log(`Retrieved ${items.count} items`);
    return [itemList, items.count];
  }

  /**
   * Finds a item by its ID.
   *
   * @param id - The ID of the item to find.
   * @returns A promise that resolves to the found item.
   * @throws {NotFoundException} If the item with the given ID is not found.
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
    try {
      const res = await this.itemRepo.destroy({ where: { id: id } });
      if (res == 0) {
        throw new NotFoundException(`item with id ${id} not found`);
      }
      this.logger.log(`Deleted Item with id: ${id}`);
      return;
    } catch (error) {
      throw error;
    }
  }

  async getAnalytics() {
    return new NotImplementedException(`Retrieving analytics not implemented`);
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
      order: query.orderBy && [[query.orderBy, 'ASC']],
      include: [Batch],
    };
  }
}
