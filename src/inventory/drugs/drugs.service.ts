import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  CreateDrugDto,
  DrugPaginationDto,
  DrugResponse,
  UpdateDrugDto,
} from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { Drug } from './models/drug.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { throwError } from 'src/utils/responses/error.response';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import {
  ApiSuccessResponseDto,
  ApiSuccessResponseNoData,
  PaginatedDataResponseDto,
} from 'src/utils/responses/success.response';

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

  async create(
    createDrugDto: CreateDrugDto,
  ): Promise<ApiSuccessResponseDto<DrugResponse>> {
    try {
      // check if category exists
      this.logger.log(
        `checking drug category with id: ${createDrugDto.categoryId}`,
      );
      await this.drugCategoryService.findOne(createDrugDto.categoryId);

      // check if supplier exists
      this.logger.log(
        `checking drug supplier with id: ${createDrugDto.supplierId}`,
      );
      await this.supplierService.findOne(createDrugDto.supplierId);

      const createdDrug = await this.drugRepo.create({ ...createDrugDto });
      this.logger.log(`Drug added successfully. id: ${createdDrug.id}`);
      return new ApiSuccessResponseDto(
        createdDrug,
        HttpStatus.CREATED,
        'Drug category created successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findAll(
    query: DrugPaginationDto,
  ): Promise<ApiSuccessResponseDto<PaginatedDataResponseDto<DrugResponse[]>>> {
    try {
      const filter = this.applyFilter(query);
      const drugs = await this.drugRepo.findAndCountAll(filter);
      this.logger.log(`Retrieved ${drugs.count} drugs`);
      return new ApiSuccessResponseDto(
        new PaginatedDataResponseDto(
          drugs.rows,
          query.page || 1,
          query.pageSize,
          drugs.count,
        ),
        HttpStatus.FOUND,
        'Drugs retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async findOne(id: string): Promise<ApiSuccessResponseDto<DrugResponse>> {
    try {
      this.logger.log(`finding drug with id: ${id}`);
      const drug = await this.drugRepo.findByPk(id);
      if (!drug) {
        throw new NotFoundException(`drug with id: ${id} not found`);
      }

      this.logger.log(`Found drugs category with ID: ${id}`);
      return new ApiSuccessResponseDto(
        drug,
        HttpStatus.FOUND,
        'Drug retrieved successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async update(
    id: string,
    updateDrugDto: UpdateDrugDto,
  ): Promise<ApiSuccessResponseNoData> {
    try {
      const result = await this.drugRepo.update(
        { ...updateDrugDto },
        { where: { id } },
      );
      if (result[0] == 0) {
        this.logger.warn(`drug with id ${id} not found`);
        throw new NotFoundException(`drug with id ${id} not found`);
      }
      this.logger.log(`Updated drug with ID: ${id}`);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug updated successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async remove(id: string) {
    try {
      await this.drugRepo.destroy({ where: { id } });
      this.logger.log(`Deleted Drug with id: ${id}`);
      return new ApiSuccessResponseNoData(
        HttpStatus.ACCEPTED,
        'Drug deleted successfully',
      );
    } catch (error) {
      throw throwError(this.logger, error);
    }
  }

  async getAnalytics() {
    return new NotImplementedException(`Retrieving analytics not implemented`);
  }

  private applyFilter(query: DrugPaginationDto): FindAndCountOptions<Drug> {
    const whereOptions: WhereOptions<Drug> = {
      [Op.and]: [
        query.search && {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query.search}%` } },
            { brandName: { [Op.iLike]: `%${query.search}` } },
          ],
        },
        query.supplierId && { supplierId: query.supplierId },
        query.categories && {
          category: {
            name: { [Op.in]: query.categories },
          },
        },
      ],
    };
    return {
      where: whereOptions,
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'DESC']],
    };
  }
}
