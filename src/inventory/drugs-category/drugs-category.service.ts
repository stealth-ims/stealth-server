import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DrugsCategory } from './models/drugs-category.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateDrugsCategoryDto,
  DrugsCategoryResponse,
  UpdateDrugsCategoryDto,
} from './dto';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';
import { throwError } from 'src/utils/responses/error.response';
import { PaginationRequestDto } from 'src/shared/docs/dto/pagination.dto';
import { FindAndCountOptions, Op } from 'sequelize';

@Injectable()
export class DrugsCategoryService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(DrugsCategory)
    private readonly drugCategoryRepo: typeof DrugsCategory,
  ) {
    this.logger = new Logger(DrugsCategoryService.name);
  }

  /**
   * Creates a new drugs category.
   *
   * @param createDrugsCategoryDto - The DTO containing the data for creating a drugs category.
   * @returns A promise that resolves to the created drugs category.
   * @throws {BadRequestException} If there is a unique constraint error.
   * @throws {InternalServerErrorException} If there is an internal server error.
   */
  async create(
    createDrugsCategoryDto: CreateDrugsCategoryDto,
  ): Promise<ApiSuccessResponseDto<DrugsCategoryResponse>> {
    try {
      const category = await this.drugCategoryRepo.create({
        ...createDrugsCategoryDto,
      });
      this.logger.log(`Created drugs category with ID: ${category.id}`);
      return new ApiSuccessResponseDto(
        category,
        HttpStatus.CREATED,
        'Drug category created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  /**
   * Retrieves all drugs categories.
   *
   * @param limit - The maximum number of categories to retrieve.
   * @returns A promise that resolves to an array of DrugsCategoryResponse objects.
   * @throws {InternalServerErrorException} if an error occurs while retrieving the categories.
   */
  async findAll(
    query: PaginationRequestDto,
  ): Promise<
    ApiSuccessResponseDto<PaginatedDataResponseDto<DrugsCategoryResponse[]>>
  > {
    try {
      const filter: FindAndCountOptions<DrugsCategory> = {
        where:
          (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {},
        limit: query.pageSize || 10,
        offset: query.pageSize * (query.page - 1) || 0,
        order: query.orderBy && [[query.orderBy, 'ASC']],
      };
      const categories = await this.drugCategoryRepo.findAndCountAll(filter);
      this.logger.log(`Retrieved ${categories.count} drugs categories`);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          categories.rows,
          query.page || 1,
          query.pageSize,
          categories.count,
        ),
        HttpStatus.FOUND,
        'Drug categories retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  /**
   * Finds a drugs category by its ID.
   *
   * @param id - The ID of the drugs category to find.
   * @returns A promise that resolves to the found drugs category.
   * @throws {NotFoundException} If the drugs category with the given ID is not found.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async findOne(
    id: string,
  ): Promise<ApiSuccessResponseDto<DrugsCategoryResponse>> {
    try {
      this.logger.log(`Finding drugs category with ID: ${id}`);
      const category = await this.drugCategoryRepo.findByPk(id);

      if (!category) {
        this.logger.warn('Category not found');
        throw new NotFoundException(`Category with id: ${id} not found`);
      }
      this.logger.log(`Found drugs category with ID: ${id}`);
      return new ApiSuccessResponseDto(
        category,
        HttpStatus.FOUND,
        'Drug retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  /**
   * Updates a drugs category.
   *
   * @param id - The ID of the drugs category.
   * @param updateDrugsCategoryDto - The DTO containing the updated drugs category data.
   * @returns A Promise that resolves to the updated drugs category.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async update(
    id: string,
    updateDrugsCategoryDto: UpdateDrugsCategoryDto,
  ): Promise<ApiSuccessResponseNoData> {
    try {
      const result = await this.drugCategoryRepo.update(
        { ...updateDrugsCategoryDto },
        { where: { id } },
      );
      const affected = result[0];
      if (affected == 0) {
        this.logger.warn(`category with id ${id} not found`);
        throw new NotFoundException(`category with id ${id} not found`);
      }
      this.logger.log(`Updated drugs category with ID: ${id}`);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  /**
   * Removes a drug category by its ID.
   *
   * @param id - The ID of the drug category to remove.
   * @returns A promise that resolves to the result of the removal operation.
   * @throws {InternalServerErrorException} If an error occurs during the removal operation.
   */
  async remove(id: string): Promise<ApiSuccessResponseNoData> {
    try {
      this.logger.log(`Removing drugs category with ID: ${id}`);
      await this.drugCategoryRepo.destroy({ where: { id: id } });

      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
