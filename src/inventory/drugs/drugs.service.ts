import {
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
import { Drug, DrugStatus } from './models/drug.model';
import { SuppliersService } from '../suppliers/suppliers.service';
import { DrugsCategoryService } from '../drugs-category/drugs-category.service';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { FacilityService } from 'src/admin/facility/facility.service';
import { DepartmentService } from 'src/admin/department/department.service';

@Injectable()
export class DrugsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Drug) private readonly drugRepo: typeof Drug,
    private readonly drugCategoryService: DrugsCategoryService,
    private readonly supplierService: SuppliersService,
    private readonly facilityService: FacilityService,
    private readonly departmentService: DepartmentService,
  ) {
    this.logger = new Logger(DrugsService.name);
  }

  /**
   * Creates a new drug.
   *
   * @param createDrugDto - The DTO containing the drug information.
   * @returns A promise that resolves to the created drug.
   * @throws If any error occurs during the creation process.
   */
  async create(createDrugDto: CreateDrugDto): Promise<DrugResponse> {
    try {
      // check if facility exists
      this.logger.log(`checking facility with id: ${createDrugDto.facilityId}`);
      await this.facilityService.findOne(createDrugDto.facilityId);

      // check if department exists
      this.logger.log(
        `checking department with id: ${createDrugDto.departmentId}`,
      );
      await this.departmentService.findOne(createDrugDto.departmentId);

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

      const createdDrug = await this.drugRepo.create({
        ...createDrugDto,
        status: DrugStatus.STOCKED,
      });
      this.logger.log(`Drug added successfully. id: ${createdDrug.id}`);
      return createdDrug;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all drugs based on the provided query parameters.
   *
   * @param query - The query parameters for filtering drugs.
   * @returns A promise that resolves to an array of DrugResponse and the total count of drugs.
   * @throws Throws an error if there was an issue retrieving the drugs.
   */
  async findAll(query: DrugPaginationDto): Promise<[DrugResponse[], number]> {
    try {
      const filter = this.applyFilter(query);
      const drugs = await this.drugRepo.findAndCountAll(filter);
      this.logger.log(`Retrieved ${drugs.count} drugs`);
      return [drugs.rows, drugs.count];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds a drug by its ID.
   *
   * @param id - The ID of the drug to find.
   * @returns A promise that resolves to the found drug.
   * @throws {NotFoundException} If the drug with the given ID is not found.
   */
  async findOne(id: string): Promise<DrugResponse> {
    try {
      this.logger.log(`finding drug with id: ${id}`);
      const drug = await this.drugRepo.findByPk(id);
      if (!drug) {
        throw new NotFoundException(`drug with id: ${id} not found`);
      }

      this.logger.log(`Found drugs category with ID: ${id}`);
      return drug;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates a drug with the specified ID.
   *
   * @param id - The ID of the drug to update.
   * @param updateDrugDto - The data to update the drug with.
   * @throws {NotFoundException} If the drug with the specified ID is not found.
   * @returns A Promise that resolves to void.
   */
  async update(id: string, updateDrugDto: UpdateDrugDto): Promise<void> {
    try {
      const result = await this.drugRepo.update(
        { ...updateDrugDto },
        { where: { id: id } },
      );
      if (result[0] == 0) {
        this.logger.warn(`drug with id ${id} not found`);
        throw new NotFoundException(`drug with id ${id} not found`);
      }
      this.logger.log(`Updated drug with ID: ${id}`);
      return;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Removes a drug from the inventory.
   *
   * @param id - The ID of the drug to be removed.
   * @throws {NotFoundException} If the drug with the given ID is not found.
   */
  async remove(id: string): Promise<void> {
    try {
      const res = await this.drugRepo.destroy({ where: { id: id } });
      if (res == 0) {
        this.logger.warn(`drug with id ${id} not found`);
        throw new NotFoundException(`drug with id ${id} not found`);
      }
      this.logger.log(`Deleted Drug with id: ${id}`);
      return;
    } catch (error) {
      throw error;
    }
  }

  async getAnalytics() {
    return new NotImplementedException(`Retrieving analytics not implemented`);
  }

  /**
   * Applies the filter options to construct the FindAndCountOptions object for querying drugs.
   *
   * @param query - The DrugPaginationDto object containing the filter options.
   * @returns The FindAndCountOptions object with the applied filter options.
   */
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
      order: query.orderBy && [[query.orderBy, 'ASC']],
    };
  }
}
