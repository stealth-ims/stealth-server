import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDrugDto, DrugResponse, GetDrugDto, UpdateDrugDto } from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { Drug } from './models/drug.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { throwError } from 'src/utils/responses/error.response';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';

@Injectable()
export class DrugsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Drug) private readonly drugRepo: typeof Drug,
    private readonly drugCategoryService: DrugsCategoryService,
    private readonly supplierService: SuppliersService,
  ) {
    this.logger = new Logger(DrugsService.name);
  }

  async create(createDrugDto: CreateDrugDto): Promise<DrugResponse> {
    try {
      // check if category exists
      this.logger.log(`checking drug category with id: ${createDrugDto.categoryId}`)
      await this.drugCategoryService.findOne(createDrugDto.categoryId);

      // check if supplier exists
      this.logger.log(`checking drug supplier with id: ${createDrugDto.supplierId}`)
      await this.supplierService.findOne(createDrugDto.supplierId);

      const createdDrug = await this.drugRepo.create({ ...createDrugDto });
      this.logger.log(`Drug added successfully. id: ${createdDrug.id}`)
      return createdDrug;
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findAll(query: GetDrugDto): Promise<DrugResponse[]> {
    try {
      const drugs = await this.drugRepo.findAll();
      return drugs
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findOne(id: string): Promise<DrugResponse> {
    try {
      this.logger.log(`finding drug with id: ${id}`)
      const drug = await this.drugRepo.findByPk(id)
      if (!drug) {
        throw new NotFoundException(`drug with id: ${id} not found`)
      }
      return drug
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async update(id: string, updateDrugDto: UpdateDrugDto) {
    try {
      const result = await this.drugRepo.upsert({ id: id, ...updateDrugDto })
      if (!result[1]) {
        throw new BadRequestException("No update was done")
      }
      return result[0]
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.drugRepo.destroy({ where: { id } })
      this.logger.log(`Deleted Drug with id: ${id}`)
      return `Deleted Drug with id: ${id}`
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async getAnalytics() {
    return 'This action returns analytics for drugs';
  }
}
