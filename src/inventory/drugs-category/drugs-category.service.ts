import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DrugsCategory, DrugsCategoryStatus } from './models/drugs-category.model';
import { InjectModel } from '@nestjs/sequelize';
import { SequelizeScopeError, UniqueConstraintError, UnknownConstraintError } from 'sequelize';
import { error } from 'console';
import { throwError } from 'src/utils/responses/error.response';
import { CreateDrugsCategoryDto, DrugsCategoryResponse, UpdateDrugsCategoryDto } from './dto';

@Injectable()
export class DrugsCategoryService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(DrugsCategory)
    private readonly drugCategoryRepo: typeof DrugsCategory) {
    this.logger = new Logger(DrugsCategoryService.name);
  }

  async create(createDrugsCategoryDto: CreateDrugsCategoryDto): Promise<DrugsCategoryResponse> {
    try {
      const category = await this.drugCategoryRepo.create({
        ...createDrugsCategoryDto,
      })
      return category
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findAll(limit: number): Promise<DrugsCategoryResponse[]> {
    try {
      this.logger.log(limit)
      const categories = await this.drugCategoryRepo.findAll({
        limit: limit,
      });
      return categories
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findOne(id: string): Promise<DrugsCategoryResponse> {
    try {
      const category = await this.drugCategoryRepo.findByPk(id);

      if (!category) {
        this.logger.warn("Category not found");
        throw new NotFoundException(`Category with id: ${id} not found`);
      }
      return category
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async update(id: string, updateDrugsCategoryDto: UpdateDrugsCategoryDto) {
    try {
      const category = await this.drugCategoryRepo.upsert({ id: id, ...updateDrugsCategoryDto })
      this.logger.log(`Drug category with id: ${id} updated successfully`)
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async remove(id: number) {
    try {
      return await this.drugCategoryRepo.destroy({ where: { id: id } })
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }
}
