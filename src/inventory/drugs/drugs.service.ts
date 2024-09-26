import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDrugDto } from './dto/create-drug.dto';
import { UpdateDrugDto } from './dto/update-drug.dto';
import { DrugResponse, GetDrugDto } from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { Drug } from './models/drug.model';
import { UniqueConstraintError } from 'sequelize';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { throwError } from 'src/utils/responses/error.response';

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
      this.logger.error(error.message, error);
      throw new InternalServerErrorException(error.message, error);
    }
  }

  async findOne(id: string) : Promise<DrugResponse>{
    try {
      this.logger.log(`finding drug with id: ${id}`)
      const drug = await this.drugRepo.findByPk(id)
      if (!drug) {
        throw new NotFoundException(`drug with id: ${id} not found`)
      }
      return drug
    } catch (error) {
      this.logger.error(error.message, error)
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error.message, error);
    }
  }

  async update(id: string, updateDrugDto: UpdateDrugDto) {
    return `This action updates a #${id} drug`;
  }

  async remove(id: number) {
    return `This action removes a #${id} drug`;
  }

  async getAnalytics() {
    return 'This action returns analytics for drugs';
  }
}
