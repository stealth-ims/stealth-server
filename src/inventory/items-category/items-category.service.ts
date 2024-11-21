import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ItemCategory,
  ItemCategoryStatus,
} from './models/items-category.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateItemsCategoryDto,
  ItemCategoryResponse,
  UpdateItemCategoryDto,
} from './dto';
import { ApiSuccessResponseNoData } from 'src/utils/responses/success.response';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { FindAndCountOptions, Op } from 'sequelize';
import { Item } from '../items/models/item.model';

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
  ): Promise<ItemCategoryResponse> {
    const category = await this.itemCategoryRepo.create({
      ...createitemsCategoryDto,
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
    query: PaginationRequestDto,
  ): Promise<[ItemCategoryResponse[], number]> {
    const filter: FindAndCountOptions<ItemCategory> = {
      where:
        (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {},
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'ASC']],
      include: [Item],
    };
    const categories = await this.itemCategoryRepo.findAndCountAll(filter);

    this.logger.log(`Retrieved ${categories.count} items categories`);
    return [categories.rows, categories.count];
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
    return category;
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
  ): Promise<ApiSuccessResponseNoData> {
    const result = await this.itemCategoryRepo.update(
      { ...changeNameDto },
      { where: { id } },
    );
    const affected = result[0];
    if (affected == 0) {
      throw new NotFoundException(`category with id ${id} not found`);
    }
    this.logger.log(`Updated items category with ID: ${id}`);
    return;
  }

  async toggleStatus(id: string): Promise<void> {
    const category = await this.findOne(id);
    category.status =
      category.status == ItemCategoryStatus.ACTIVE
        ? ItemCategoryStatus.DEACTIVATED
        : ItemCategoryStatus.ACTIVE;
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
  async remove(id: string): Promise<void> {
    this.logger.log(`Removing items category with ID: ${id}`);
    const res = await this.itemCategoryRepo.destroy({ where: { id: id } });

    if (res == 0) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return;
  }
}
