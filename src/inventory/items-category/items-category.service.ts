import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ItemCategory,
  ItemCategoryStatus,
} from './models/items-category.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateItemsCategoryDto,
  FindItemCategoryDto,
  ItemCategoryResponse,
  UpdateItemCategoryDto,
} from './dto';
import { ApiSuccessResponseNoData } from 'src/core/shared/responses/success.response';
import { FindAndCountOptions, Op } from 'sequelize';
import { Item } from '../items/models/item.model';
import { generateFilter } from '../../core/shared/factory';
import { IUserPayload } from '../../auth/interface/payload.interface';
import { OnEvent } from '@nestjs/event-emitter';
import * as itemCategories from 'src/core/database/seeders/categories.json';
import * as items from 'src/core/database/seeders/items.json';
import { Supplier } from '../suppliers/models/supplier.model';
// import { DosageForm } from '../items/dto';

@Injectable()
export class ItemCategoryService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(ItemCategory)
    private readonly itemCategoryRepo: typeof ItemCategory,
  ) {
    this.logger = new Logger(ItemCategoryService.name);
  }

  /**
   * Creates a new items category.
   *
   * @param createitemsCategoryDto - The DTO containing the data for creating a items category.
   * @returns A promise that resolves to the created items category.
   * @throws {BadRequestException} If there is a unique constraint error.
   * @throws {InternalServerErrorException} If there is an internal server error.
   */
  async create(
    createitemsCategoryDto: CreateItemsCategoryDto,
    user: IUserPayload,
  ): Promise<ItemCategoryResponse> {
    const category = await this.itemCategoryRepo.create({
      ...createitemsCategoryDto,
      facilityId: user.facility,
      createdById: user.sub,
    });
    this.logger.log(`Created items category with ID: ${category.id}`);
    return category;
  }

  /**
   * Retrieves all items categories.
   *
   * @param limit - The maximum number of categories to retrieve.
   * @returns A promise that resolves to an array of itemsCategoryResponse objects.
   * @throws {InternalServerErrorException} if an error occurs while retrieving the categories.
   */
  async findAll(
    facilityId: string,
    query?: FindItemCategoryDto,
  ): Promise<[ItemCategory[], number]> {
    const queryFilter = generateFilter(query);
    const whereCondition: Record<string, any> = {};

    if (query.search) {
      whereCondition.name = { [Op.iLike]: `%${query.search}%` };
    }
    if (query.status) {
      whereCondition.status = { [Op.eq]: query.status };
    }

    const filter: FindAndCountOptions<ItemCategory> = {
      where: { facilityId, ...whereCondition, ...queryFilter.searchFilter },
      ...queryFilter.pageFilter,
      include: [{ model: Item, attributes: ['id'] }],
      attributes: { exclude: ['facilityId'] },
      distinct: true,
    };
    const categories = await this.itemCategoryRepo.findAndCountAll(filter);
    this.logger.log(`Retrieved ${categories.count} items categories`);

    const plainCategories: ItemCategory[] = categories.rows.map((category) =>
      category.get({ plain: true }),
    );

    const modifiedCategories = plainCategories.map((category) => {
      delete category.items;
      return category;
    });

    return [modifiedCategories, categories.count];
  }

  /**
   * Retrieves all items categories.
   *
   * @param limit - The maximum number of categories to retrieve.
   * @returns A promise that resolves to an array of itemsCategoryResponse objects.
   * @throws {InternalServerErrorException} if an error occurs while retrieving the categories.
   */
  async findAllNoPaginate(facilityId: string): Promise<ItemCategory[]> {
    const filter: FindAndCountOptions<ItemCategory> = {
      where: { facilityId },
      attributes: ['id', 'name'],
      order: [['updatedAt', 'DESC']],
    };
    const categories = await this.itemCategoryRepo.findAndCountAll(filter);
    this.logger.log(`Retrieved ${categories.count} items categories`);

    return categories.rows;
  }

  /**
   * Finds a items category by its ID.
   *
   * @param id - The ID of the items category to find.
   * @returns A promise that resolves to the found items category.
   * @throws {NotFoundException} If the items category with the given ID is not found.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async findOne(id: string): Promise<ItemCategoryResponse> {
    const category = await this.itemCategoryRepo.findByPk(id, {
      include: [{ all: true }],
    });

    if (!category) {
      throw new NotFoundException(`Category with id: ${id} not found`);
    }
    this.logger.log(`Found items category with ID: ${id}`);
    const plainCategory: ItemCategory = category.get({ plain: true });
    delete plainCategory.items;
    return plainCategory;
  }

  /**
   * Updates a items category.
   *
   * @param id - The ID of the items category.
   * @param changeNameDto - The DTO containing the updated items category data.
   * @returns A Promise that resolves to the updated items category.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async changeName(
    id: string,
    changeNameDto: UpdateItemCategoryDto,
    userId: string,
  ): Promise<ApiSuccessResponseNoData> {
    const result = await this.itemCategoryRepo.update(
      { ...changeNameDto, updatedById: userId },
      { where: { id } },
    );
    const affected = result[0];
    if (affected == 0) {
      throw new NotFoundException(`category with id ${id} not found`);
    }
    this.logger.log(`Updated items category with ID: ${id}`);
    return;
  }

  async toggleStatus(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id);
    category.status =
      category.status == ItemCategoryStatus.ACTIVE
        ? ItemCategoryStatus.DEACTIVATED
        : ItemCategoryStatus.ACTIVE;
    category.updatedById = userId;
    await category.save();
    this.logger.log(`Updated items category with ID: ${id}`);
    return;
  }

  /**
   * Removes a item category by its ID.
   *
   * @param id - The ID of the item category to remove.
   * @returns A promise that resolves to the result of the removal operation.
   * @throws {InternalServerErrorException} If an error occurs during the removal operation.
   */
  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Removing items category with ID: ${id}`);
    const res = await this.itemCategoryRepo.destroy({
      where: { id: id },
      force: true,
      userId,
    } as any);

    if (res == 0) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return;
  }

  @OnEvent('items.seed')
  async handleSeedItemsEvent(payload: { userId: string; facilityId: string }) {
    const categories = itemCategories.categories.map((category) => ({
      ...category,
      status: ItemCategoryStatus.ACTIVE,
      facilityId: payload.facilityId,
      createdById: payload.userId,
    }));
    const createdCategories = await this.itemCategoryRepo.bulkCreate(
      categories,
      {
        individualHooks: true,
        returning: ['id', 'name'],
      },
    );
    const finalCategories = createdCategories.map((category) =>
      category.toJSON(),
    );
    const finalItems = items.data.map((item) => {
      const { categoryName, dosageForm, ...others } = item;
      const creatingItem = {
        ...others,
        dosageForm: dosageForm,
        facilityId: payload.facilityId,
        createdById: payload.userId,
        nhisCovered: true,
        categoryId: null,
      };
      const category = finalCategories.find(
        (category) => category.name == item.categoryName,
      );
      creatingItem.categoryId = category.id;

      return creatingItem;
    });

    await Item.bulkCreate(finalItems, { individualHooks: true });
    await Supplier.create({
      name: 'Regional Medical Store',
      facilityId: payload.facilityId,
      createdById: payload.userId,
    });

    this.logger.debug('Data seeded successfully for facility: ', {
      facilityId: payload.facilityId,
    });
    return;
  }
}
