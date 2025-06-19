import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { PaginationRequestDto } from 'src/core/shared/dto/pagination.dto';
import { FindAndCountOptions, Op } from 'sequelize';
import { CreateFacilityDto, FacilityResponse, UpdateFacilityDto } from './dto';
import { Facility } from './models/facility.model';

@Injectable()
export class FacilityService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Facility)
    private facilityRepo: typeof Facility,
  ) {
    this.logger = new Logger(FacilityService.name);
  }

  /**
   * Creates a new facility.
   *
   * @param createFacilityDto - The DTO containing the data for creating a facility.
   * @returns A promise that resolves to the created facility.
   * @throws {BadRequestException} If there is a unique constraint error.
   * @throws {InternalServerErrorException} If there is an internal server error.
   */
  async create(
    createFacilityDto: CreateFacilityDto,
    adminId?: string,
  ): Promise<FacilityResponse> {
    this.logger.log('Creating a facility');
    const facility = await this.facilityRepo.create({
      ...createFacilityDto,
      location: null,
      region: null,
      createdById: adminId,
    });
    return facility;
  }

  /**
   * Retrieves all facilities.
   *
   * @param limit - The maximum number of categories to retrieve.
   * @returns A promise that resolves to an array of FacilityResponse objects.
   * @throws {InternalServerErrorException} if an error occurs while retrieving the categories.
   */
  async findAll(query: PaginationRequestDto) {
    this.logger.log(`Retrieving facilities`);

    const filter: FindAndCountOptions<Facility> = {
      where:
        (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {},
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy
        ? [[query.orderBy, query.orderDirection ? query.orderDirection : 'ASC']]
        : [['updatedAt', 'DESC']],
      distinct: true,
    };
    const facilities = await this.facilityRepo.findAndCountAll(filter);

    return facilities;
  }

  /**
   * Finds a facility by its ID.
   *
   * @param id - The ID of the facility to find.
   * @returns A promise that resolves to the found facility.
   * @throws {NotFoundException} If the facility with the given ID is not found.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async findOne(id: string): Promise<Facility> {
    this.logger.log(`Finding a facility by ID`);

    const facility = await this.facilityRepo.findByPk(id, {
      include: [{ all: true }],
    });

    if (!facility) {
      throw new NotFoundException(`Facility with id: ${id} not found`);
    }
    return facility;
  }

  /**
   * Updates a facility.
   *
   * @param id - The ID of the facility.
   * @param updateFacilityDto - The DTO containing the updated facility data.
   * @returns A Promise that resolves to the updated facility.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async update(
    id: string,
    updateFacilityDto: UpdateFacilityDto,
    adminId: string,
  ) {
    this.logger.log('Updating facility');
    const result = await this.facilityRepo.update(
      { ...updateFacilityDto, updatedById: adminId },
      { where: { id } },
    );
    const affected = result[0];
    if (affected == 0) {
      throw new NotFoundException(`Facility with id ${id} not found`);
    }
    return;
  }

  /**
   * Removes a facility by its ID.
   *
   * @param id - The ID of the facility to remove.
   * @returns A promise that resolves to the result of the removal operation.
   * @throws {InternalServerErrorException} If an error occurs during the removal operation.
   */
  async remove(id: string) {
    this.logger.log('Removing facility by ID');
    const res = await this.facilityRepo.destroy({
      where: { id: id },
      force: true,
    });

    if (res == 0) {
      throw new NotFoundException(`Facility with id ${id} not found`);
    }
    return;
  }
}
