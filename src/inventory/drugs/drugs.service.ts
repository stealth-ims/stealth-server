import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  CreateDrugDto,
  DrugPaginationDto,
  ManyDrugs as ManyDrug,
  OneDrug,
  UpdateDrugDto,
} from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { Batch, Drug, DrugStatus } from './models';
import { BatchService } from './batch.service';

@Injectable()
export class DrugsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Drug) private readonly drugRepo: typeof Drug,
    private readonly batchService: BatchService,
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
  async create(createDrugDto: CreateDrugDto): Promise<OneDrug> {
    try {
      const createdDrug = await this.drugRepo.create({
        ...createDrugDto,
        status: DrugStatus.STOCKED,
      });

      const batch = await this.batchService.create({
        ...createDrugDto,
        drugId: createdDrug.id,
      });
      const oneDrug = createdDrug.toJSON() as OneDrug;
      oneDrug.batches = [batch];
      this.logger.log(`Drug added successfully. id: ${createdDrug.id}`);
      return oneDrug;
    } catch (error) {
      if (error instanceof ConflictException) {
        const id = JSON.parse(error.message).id;
        this.logger.log(`Drug already existed. ID: ${id}`);
        await this.batchService.create({
          ...createDrugDto,
          drugId: id,
        });
        return await this.findOne(id);
      }
    }
  }

  /**
   * Retrieves all drugs based on the provided query parameters.
   *
   * @param query - The query parameters for filtering drugs.
   * @returns A promise that resolves to an array of OneDrug and the total count of drugs.
   * @throws Throws an error if there was an issue retrieving the drugs.
   */
  async findAll(query: DrugPaginationDto): Promise<[ManyDrug[], number]> {
    const filter = this.applyFilter(query);
    const drugs = await this.drugRepo.findAndCountAll(filter);

    const drugList = [];

    drugs.rows.forEach((drug) => {
      drug.batches.forEach((batch) => {
        delete drug.dataValues.batches;
        const drugData = drug.toJSON() as ManyDrug;
        drugData.batch = batch;
        drugList.push(drugData);
      });
    });

    this.logger.log(`Retrieved ${drugs.count} drugs`);
    return [drugList, drugs.count];
  }

  /**
   * Finds a drug by its ID.
   *
   * @param id - The ID of the drug to find.
   * @returns A promise that resolves to the found drug.
   * @throws {NotFoundException} If the drug with the given ID is not found.
   */
  async findOne(id: string): Promise<OneDrug> {
    this.logger.log(`finding drug with id: ${id}`);
    const drug = await this.drugRepo.findByPk(id, { include: [Batch] });
    if (!drug) {
      throw new NotFoundException(`drug with id: ${id} not found`);
    }

    this.logger.log(`Found drugs category with ID: ${id}`);
    return drug;
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
    const result = await this.drugRepo.update(
      { ...updateDrugDto },
      { where: { id: id } },
    );
    if (result[0] == 0) {
      throw new NotFoundException(`drug with id ${id} not found`);
    }
    this.logger.log(`Updated drug with ID: ${id}`);
    return;
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
