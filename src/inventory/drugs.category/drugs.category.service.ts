import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDrugsCategoryDto, DrugsCategoryResponse, GetDrugsCategoryDto } from './dto/create-drugs.category.dto';
import { UpdateDrugsCategoryDto } from './dto/update-drugs.category.dto';
import { DrugsCategory, DrugsCategoryStatus } from './models/drugs.category.model';
import { InjectModel } from '@nestjs/sequelize';
import { SequelizeScopeError, UniqueConstraintError, UnknownConstraintError } from 'sequelize';
import { error } from 'console';

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
      this.logger.error(error);
      if (error instanceof UniqueConstraintError) {
        let eMessage = `${error.errors[0].path}: ${error.errors[0].message}`;
        throw new BadRequestException(eMessage, error.name)
      }
      throw new InternalServerErrorException(error.message, error)
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
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, error)
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message, error)
    }
  }

  async update(id: string, updateDrugsCategoryDto: UpdateDrugsCategoryDto) {
    try {
      const category = await this.drugCategoryRepo.upsert({ id: id, ...updateDrugsCategoryDto })
      this.logger.log(`Drug category with id: ${id} updated successfully`)
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, error)
    }
  }

  async remove(id: number) {
    try {
      return await this.drugCategoryRepo.destroy({ where: { id: id } })
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message, error);
    }
  }
}
